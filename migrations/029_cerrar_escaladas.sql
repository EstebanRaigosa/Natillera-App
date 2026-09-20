-- ===========================================================================
-- 029_cerrar_escaladas.sql — caminos de escalada fuera del chat de soporte
-- ===========================================================================
--
-- Salieron al buscar más casos como el de `user_profiles` (migración 028).
-- Los dos primeros son peores que aquel: no hacen falta ni credenciales.
--
--   1. `aplicar_permisos_superusuario(text)` — cualquiera, SIN sesión, podía
--      dejar cualquier tabla de la base abierta de par en par.
--   2. `socios` — 487 personas con nombre, documento y teléfono, legibles sin
--      sesión con la clave que viaja en el bundle de la app.
--   3. `numeros_rifa` — 4.800 filas con nombre y teléfono del comprador, sin
--      RLS ninguna.
--   4. `otp_codes` / `verificar_otp` — restos del login por SMS anterior a
--      Twilio Verify. Cualquiera podía insertarse un OTP válido a nombre de
--      otro y darlo por verificado.
--   5. `es_super_admin()` se apoyaba solo en `user_profiles.rol`.
--   6. Un colaborador invitado podía ampliarse los permisos antes de aceptar.
--
-- Se aplica después de 028 y es idempotente.

BEGIN;

-- ===========================================================================
-- 1. `aplicar_permisos_superusuario` — toma total de la base, sin sesión
-- ===========================================================================
--
-- SECURITY DEFINER, ejecutable por `anon`, sin comprobar quién llama, y lo que
-- hacía era:
--
--     CREATE POLICY ... FOR SELECT USING (public.es_superusuario() OR true)
--
-- El `OR true` anula la condición. Una sola petición sin autenticar —
--
--     POST /rest/v1/rpc/aplicar_permisos_superusuario {"nombre_tabla":"natilleras"}
--
-- — borraba las políticas de esa tabla y la dejaba abierta a lectura, escritura
-- y borrado para todo internet. Comprobado que la función responde sin sesión
-- (con un nombre de tabla inexistente, que no toca nada).
--
-- Era una utilidad de desarrollo y la app no la llama en ningún sitio. No se
-- arregla: se quita.

DROP FUNCTION IF EXISTS public.aplicar_permisos_superusuario(text);

-- ===========================================================================
-- 2. `socios` legible sin sesión
-- ===========================================================================
--
-- Dos políticas que se anulaban a sí mismas:
--     "Lectura pública de socios"     USING (true OR es_superusuario())
--     "Admin puede ver todos los socios" USING (is_admin_user() OR true)
--
-- Con `anon` teniendo SELECT, eso son 487 nombres, documentos y teléfonos a
-- disposición de cualquiera que abra la app y copie la clave pública.
--
-- Lo que sí necesita el anónimo es una sola cosa: saber si un teléfono
-- pertenece a algún socio, antes de mandar el SMS de acceso. Hoy eso se
-- resuelve descargándose hasta 1.000 socios al navegador
-- (`verificarTelefonoEsSocio`). Se cambia por una función que devuelve
-- únicamente un sí o un no.

CREATE OR REPLACE FUNCTION public.telefono_es_socio(p_telefono text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tel text;
BEGIN
  v_tel := regexp_replace(coalesce(p_telefono, ''), '[^0-9]', '', 'g');
  IF length(v_tel) > 10 AND v_tel LIKE '57%' THEN
    v_tel := substring(v_tel FROM 3);
  END IF;
  IF length(v_tel) < 7 THEN
    RETURN false;
  END IF;

  -- La misma normalización a ambos lados: en la tabla los teléfonos conviven
  -- en varios formatos (con y sin indicativo, con espacios y guiones).
  RETURN EXISTS (
    SELECT 1 FROM public.socios s
    WHERE s.telefono IS NOT NULL
      AND CASE
            WHEN length(regexp_replace(s.telefono, '[^0-9]', '', 'g')) > 10
             AND regexp_replace(s.telefono, '[^0-9]', '', 'g') LIKE '57%'
            THEN substring(regexp_replace(s.telefono, '[^0-9]', '', 'g') FROM 3)
            ELSE regexp_replace(s.telefono, '[^0-9]', '', 'g')
          END = v_tel
  );
END;
$$;

COMMENT ON FUNCTION public.telefono_es_socio(text) IS
  'Sí/no para la pantalla de acceso por SMS. Sustituye a descargar la tabla de socios sin sesión.';

REVOKE ALL ON FUNCTION public.telefono_es_socio(text) FROM public;
GRANT EXECUTE ON FUNCTION public.telefono_es_socio(text) TO anon, authenticated;

-- Fuera las dos políticas abiertas.
DROP POLICY IF EXISTS "Lectura pública de socios" ON public.socios;
DROP POLICY IF EXISTS "Admin puede ver todos los socios" ON public.socios;

-- La lectura pasa a exigir sesión. Sigue siendo amplia a propósito: la app usa
-- `socios` como directorio global para no duplicar a la misma persona en dos
-- natilleras (busca por documento, por correo y por teléfono antes de crear).
-- Estrecharla a «los socios de mis natilleras» rompe esa deduplicación, así que
-- queda pendiente de rediseño; lo que se cierra hoy es el acceso sin sesión,
-- que es la diferencia entre «cualquiera en internet» y «alguien registrado».
CREATE POLICY "Socios visibles para usuarios con sesión" ON public.socios
  FOR SELECT
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Escritura: quien administra o colabora en una natillera donde está el socio.
-- Un socio recién creado todavía no cuelga de ninguna, así que también se
-- admite mientras siga suelto.
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar socios" ON public.socios;
CREATE POLICY "Actualizar socios de mis natilleras" ON public.socios
  FOR UPDATE
  USING (
    public.es_superusuario()
    OR EXISTS (
      SELECT 1 FROM public.socios_natillera sn
      WHERE sn.socio_id = socios.id
        AND public.tiene_acceso_natillera(sn.natillera_id, (SELECT auth.uid()))
    )
    OR NOT EXISTS (SELECT 1 FROM public.socios_natillera sn WHERE sn.socio_id = socios.id)
  );

REVOKE ALL ON public.socios FROM anon;

-- ===========================================================================
-- 3. `numeros_rifa` sin RLS
-- ===========================================================================
--
-- Tabla en el esquema expuesto, sin RLS: 4.800 números con `nombre_comprador` y
-- `telefono_comprador` que devolvía el REST sin autenticar. Se engancha a la
-- natillera por la actividad.

ALTER TABLE public.numeros_rifa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS numeros_rifa_acceso ON public.numeros_rifa;
CREATE POLICY numeros_rifa_acceso ON public.numeros_rifa
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.actividades a
      WHERE a.id = numeros_rifa.actividad_id
        AND public.tiene_acceso_natillera(a.natillera_id, (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.actividades a
      WHERE a.id = numeros_rifa.actividad_id
        AND public.tiene_acceso_natillera(a.natillera_id, (SELECT auth.uid()))
    )
  );

REVOKE ALL ON public.numeros_rifa FROM anon;

-- ===========================================================================
-- 4. OTP heredado
-- ===========================================================================
--
-- La app verifica los SMS contra Twilio Verify (`supabase/functions/twilio`);
-- ni `otp_codes` ni `verificar_otp` se llaman desde ningún sitio. Pero seguían
-- abiertos, y la combinación era de libro:
--
--   · «Public can insert otp codes» con WITH CHECK (true) → cualquiera, sin
--     sesión, se inserta una fila con el teléfono de otro, el código que él
--     elija y `user_id` de la víctima.
--   · `verificar_otp` la encuentra y devuelve `valido = true` con ese `user_id`.
--   · Y la cuenta de intentos no sirve de nada: la fila solo se localiza si el
--     código ya coincide, así que un código equivocado no suma ningún intento
--     y la fuerza bruta sobre seis dígitos sale gratis.
--
-- Se cierra el acceso en lugar de borrar la tabla, por si guarda historial que
-- alguien quiera mirar.

DROP POLICY IF EXISTS "Public can insert otp codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can view own otp codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can update own otp codes" ON public.otp_codes;

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.otp_codes FROM anon, authenticated;

DROP FUNCTION IF EXISTS public.verificar_otp(character varying, character varying);
DROP FUNCTION IF EXISTS public.limpiar_otp_expirados();

-- ===========================================================================
-- 5. `es_super_admin()` anclado al correo
-- ===========================================================================
--
-- Lo dice el proyecto y ya lo dice `es_superusuario()`: el superusuario es uno
-- y es raigo.16@gmail.com. `es_super_admin()` —la autoridad del soporte— se
-- fiaba solo de `user_profiles.rol`, una columna que el propio usuario podía
-- escribir (028). Ahora exige las dos cosas, y la que manda es el correo de
-- `auth.users`, que no se cambia sin pasar por Supabase Auth y que además ya
-- está ocupado.
--
-- El `rol` sigue contando: sirve para desactivar el soporte sin tocar la
-- cuenta.

CREATE OR REPLACE FUNCTION public.es_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.user_profiles p ON p.id = u.id
    WHERE u.id = (SELECT auth.uid())
      AND lower(btrim(u.email)) = 'raigo.16@gmail.com'
      AND p.rol = 'super_admin'
      AND p.activo
  );
$$;

COMMENT ON FUNCTION public.es_super_admin() IS
  'Único criterio de autoridad del soporte: el correo de auth.users Y el rol del perfil. El correo manda, porque el rol lo escribe la aplicación.';

REVOKE ALL ON FUNCTION public.es_super_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.es_super_admin() TO authenticated, service_role;

-- Y que no quede ningún otro `super_admin` colgando de antes.
UPDATE public.user_profiles p
SET rol = 'usuario'
FROM auth.users u
WHERE u.id = p.id
  AND p.rol = 'super_admin'
  AND lower(btrim(u.email)) <> 'raigo.16@gmail.com';

-- ===========================================================================
-- 6. El colaborador invitado se ampliaba los permisos
-- ===========================================================================
--
-- `colaboradores_update_policy` deja al invitado tocar su propia fila mientras
-- está `pendiente`, y sin WITH CHECK propio Postgres reutiliza el USING: podía
-- cambiarse `rol` y `permisos` —no el estado— y después aceptar la invitación
-- con `aceptar_invitacion_colaborador`, que no los vuelve a mirar. Resultado:
-- entras invitado a consultar y sales pudiendo gestionar la natillera entera.
--
-- El invitado solo tiene que poder responder. Lo demás lo fija quien invita.

CREATE OR REPLACE FUNCTION public.colaboradores_invitado_no_se_asciende()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR public.es_superusuario()
     OR public.es_admin_de_natillera(NEW.natillera_id) THEN
    RETURN NEW;
  END IF;

  IF NEW.rol IS DISTINCT FROM OLD.rol OR NEW.permisos IS DISTINCT FROM OLD.permisos THEN
    RAISE EXCEPTION 'COLABORADOR_PROHIBIDO: el rol y los permisos los define quien invita'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS colaboradores_invitado_no_se_asciende ON public.natillera_colaboradores;
CREATE TRIGGER colaboradores_invitado_no_se_asciende
  BEFORE UPDATE ON public.natillera_colaboradores
  FOR EACH ROW EXECUTE FUNCTION public.colaboradores_invitado_no_se_asciende();

COMMIT;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- Sin sesión, con la clave publicable, las tres deben devolver 0 filas o error:
--   curl "$URL/rest/v1/socios?select=nombre&limit=1"        -H "apikey: $ANON"
--   curl "$URL/rest/v1/numeros_rifa?select=id&limit=1"      -H "apikey: $ANON"
--   curl -X POST "$URL/rest/v1/rpc/aplicar_permisos_superusuario" \
--        -H "apikey: $ANON" -H "Content-Type: application/json" \
--        -d '{"nombre_tabla":"natilleras"}'      # → función inexistente
--
-- Y esta debe seguir respondiendo true/false:
--   curl -X POST "$URL/rest/v1/rpc/telefono_es_socio" \
--        -H "apikey: $ANON" -H "Content-Type: application/json" \
--        -d '{"p_telefono":"3008502030"}'
--
-- Un solo superadministrador, y el que es:
--   SELECT u.email FROM user_profiles p JOIN auth.users u ON u.id = p.id
--   WHERE p.rol = 'super_admin';

-- ===========================================================================
-- 7. Vincular el correo a la ficha de socio (consecuencia del punto 2)
-- ===========================================================================
--
-- Al registrarse por SMS la app escribía su correo en las fichas de socio que
-- llevan su teléfono. Con la política nueva ese UPDATE ya no sale: el socio
-- pertenece a la natillera de otro. Pasa por aquí, donde solo se escribe el
-- correo de la sesión —no el que mande el cliente— y solo sobre fichas cuyo
-- teléfono coincide.

CREATE OR REPLACE FUNCTION public.socios_vincular_email(p_telefono text, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := (SELECT auth.uid());
  v_email text;
  v_tel   text;
  v_filas integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SIN_SESION' USING ERRCODE = '28000';
  END IF;

  SELECT lower(btrim(email)) INTO v_email FROM auth.users WHERE id = v_uid;

  IF v_email IS NULL OR v_email <> lower(btrim(coalesce(p_email, ''))) THEN
    RAISE EXCEPTION 'SOCIO_PROHIBIDO: solo puedes vincular tu propio correo' USING ERRCODE = '42501';
  END IF;

  v_tel := regexp_replace(coalesce(p_telefono, ''), '[^0-9]', '', 'g');
  IF length(v_tel) > 10 AND v_tel LIKE '57%' THEN
    v_tel := substring(v_tel FROM 3);
  END IF;
  IF length(v_tel) < 7 THEN
    RETURN 0;
  END IF;

  UPDATE public.socios s
  SET email = v_email, updated_at = now()
  WHERE s.telefono IS NOT NULL
    AND CASE
          WHEN length(regexp_replace(s.telefono, '[^0-9]', '', 'g')) > 10
           AND regexp_replace(s.telefono, '[^0-9]', '', 'g') LIKE '57%'
          THEN substring(regexp_replace(s.telefono, '[^0-9]', '', 'g') FROM 3)
          ELSE regexp_replace(s.telefono, '[^0-9]', '', 'g')
        END = v_tel;

  GET DIAGNOSTICS v_filas = ROW_COUNT;
  RETURN v_filas;
END;
$$;

REVOKE ALL ON FUNCTION public.socios_vincular_email(text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.socios_vincular_email(text, text) TO authenticated;

-- ===========================================================================
-- 037_cerrar_agujeros_socios_e_invitaciones.sql
-- ===========================================================================
--
-- Correcciones salidas de la revisión de seguridad de la rama. TRES de las
-- cuatro las introdujeron las migraciones 029/030/033 de esta misma serie: al
-- cerrar el directorio global de socios se abrieron puertas nuevas más
-- estrechas, pero mal cerradas.
--
-- Las cuatro verificadas contra la base antes y después de corregirlas.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. `socio_actualizar_al_vincular` no ligaba el socio a la natillera (030)
-- ───────────────────────────────────────────────────────────────────────────
-- Comprobaba que quien llama administra `p_natillera_id`, pero nunca que
-- `p_socio_id` tuviera relación con ella. Con una natillera propia —crearla es
-- gratis desde la app— se podía reescribir nombre, teléfono y correo de
-- CUALQUIER ficha de socio de la base. Y como escribir el correo propio en una
-- ficha la hace visible por la rama de «ficha propia» de la política, la
-- escritura a ciegas se convertía en lectura de PII: nombre, documento,
-- teléfono y correo.
--
-- Es justo la comprobación que sí hace `telefono_libre_en_natillera` y que aquí
-- faltaba.

CREATE OR REPLACE FUNCTION public.socio_actualizar_al_vincular(
  p_socio_id     uuid,
  p_natillera_id uuid,
  p_nombre       text DEFAULT NULL,
  p_telefono     text DEFAULT NULL,
  p_email        text DEFAULT NULL,
  p_avatar_seed  text DEFAULT NULL,
  p_avatar_style text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
BEGIN
  IF NOT public.tiene_acceso_natillera(p_natillera_id, (SELECT auth.uid())) THEN
    RAISE EXCEPTION 'SOCIO_PROHIBIDO: no administras esa natillera' USING ERRCODE = '42501';
  END IF;

  -- La ficha tiene que ser tuya para tocarla: o ya está en esa natillera, o no
  -- está en ninguna (recién creada), o la creaste tú. Un socio que vive en la
  -- natillera de otro no se toca desde aquí.
  IF NOT EXISTS (
        SELECT 1 FROM public.socios_natillera sn
        WHERE sn.socio_id = p_socio_id AND sn.natillera_id = p_natillera_id)
     AND EXISTS (SELECT 1 FROM public.socios_natillera sn WHERE sn.socio_id = p_socio_id)
     AND NOT EXISTS (
        SELECT 1 FROM public.socios s
        WHERE s.id = p_socio_id AND s.creado_por = (SELECT auth.uid()))
  THEN
    RAISE EXCEPTION 'SOCIO_PROHIBIDO: ese socio pertenece a otra natillera' USING ERRCODE = '42501';
  END IF;

  UPDATE public.socios
  SET nombre       = coalesce(nullif(btrim(coalesce(p_nombre, '')), ''), nombre),
      telefono     = coalesce(nullif(btrim(coalesce(p_telefono, '')), ''), telefono),
      email        = coalesce(nullif(btrim(coalesce(p_email, '')), ''), email),
      avatar_seed  = coalesce(p_avatar_seed, avatar_seed),
      avatar_style = coalesce(p_avatar_style, avatar_style),
      updated_at   = now()
  WHERE id = p_socio_id;
END;
$fn$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. `socios_vincular_email` aceptaba cualquier teléfono (029)
-- ───────────────────────────────────────────────────────────────────────────
-- Validaba con cuidado que el correo fuera el de la sesión, pero el teléfono lo
-- elegía quien llamaba. Servía para poner tu correo en la ficha de otro y abrir
-- su lectura, y para romper la vinculación real de esa persona.
--
-- No hay teléfono verificado al que anclarlo: `auth.users.phone` está vacío en
-- los 55 usuarios, porque la app verifica por Twilio Verify, fuera de Supabase
-- Auth. Así que se acota el daño: solo fichas SIN correo (no se puede robar una
-- vinculación ya hecha) y como mucho una por llamada.
--
-- PENDIENTE: lo correcto es anclarlo a un teléfono verificado. Mientras el OTP
-- viva fuera de Supabase Auth, esto es un parche, no la solución.

CREATE OR REPLACE FUNCTION public.socios_vincular_email(p_telefono text, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
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
  WHERE s.id IN (
    SELECT s2.id FROM public.socios s2
    WHERE s2.telefono IS NOT NULL
      AND coalesce(btrim(s2.email), '') = ''
      AND CASE
            WHEN length(regexp_replace(s2.telefono, '[^0-9]', '', 'g')) > 10
             AND regexp_replace(s2.telefono, '[^0-9]', '', 'g') LIKE '57%'
            THEN substring(regexp_replace(s2.telefono, '[^0-9]', '', 'g') FROM 3)
            ELSE regexp_replace(s2.telefono, '[^0-9]', '', 'g')
          END = v_tel
    LIMIT 1
  );

  GET DIAGNOSTICS v_filas = ROW_COUNT;
  RETURN v_filas;
END;
$fn$;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. La política de `socios` emparejaba por un teléfono auto-declarado (030/033)
-- ───────────────────────────────────────────────────────────────────────────
-- `user_profiles.telefono` es escribible por el propio usuario: el GRANT de la
-- 028 lo incluye y `user_profiles_protege_privilegios` no lo vigila. Usarlo como
-- criterio de lectura es dejar que cada uno elija qué ficha ve — basta ponerse
-- el teléfono de la víctima y leer su nombre, documento, teléfono y correo, en
-- bucle sobre cualquier número. Ni siquiera hacía falta llamar a una RPC.
--
-- El correo sí vale como criterio, porque el trigger impide cambiarlo.
--
-- Coste de quitar la rama: ninguno. Medido: hoy no hay un solo socio cuyo
-- teléfono coincida con el de algún perfil.

DROP POLICY IF EXISTS "Socios visibles para quien tiene motivo" ON public.socios;
CREATE POLICY "Socios visibles para quien tiene motivo" ON public.socios
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR id IN (
      SELECT sn.socio_id FROM public.socios_natillera sn
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
    OR creado_por = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = (SELECT auth.uid())
        AND socios.email IS NOT NULL
        AND lower(btrim(socios.email)) = lower(btrim(p.email))
    )
  );

-- ───────────────────────────────────────────────────────────────────────────
-- 4. `aceptar_invitacion_colaborador`: comparación con NULL (pre-existente)
-- ───────────────────────────────────────────────────────────────────────────
-- La guarda era:
--     IF usuario_id != auth.uid() AND email_invitado != <correo> THEN rechazar
-- En una invitación por correo `usuario_id` es NULL, así que el primer operando
-- da NULL, el `AND` da NULL y el `IF` no entra: cualquiera con el token la
-- canjeaba y quedaba como colaborador con el rol que fijó quien invitó —
-- incluido `co_administrador`, que `tiene_permiso_natillera` trata como permiso
-- total. `rechazar_invitacion_colaborador`, dos líneas más abajo, ya lo hacía
-- bien usando `OR`.
--
-- Además le faltaba `SET search_path` siendo SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.aceptar_invitacion_colaborador(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_invitacion RECORD;
  v_resultado  JSONB;
  v_uid        uuid := (SELECT auth.uid());
  v_email      text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SIN_SESION: hay que iniciar sesión para aceptar una invitación'
      USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_invitacion
  FROM public.natillera_colaboradores
  WHERE token_invitacion = p_token AND estado = 'pendiente';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitación no encontrada o ya procesada');
  END IF;

  SELECT lower(btrim(email)) INTO v_email FROM auth.users WHERE id = v_uid;

  IF NOT (
       v_invitacion.usuario_id = v_uid
    OR lower(btrim(coalesce(v_invitacion.email_invitado, ''))) = coalesce(v_email, '')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta invitación no es para tu usuario');
  END IF;

  UPDATE public.natillera_colaboradores
  SET estado = 'aceptada',
      usuario_id = v_uid,
      fecha_respuesta = NOW()
  WHERE id = v_invitacion.id;

  SELECT jsonb_build_object(
    'success', true,
    'natillera_id', v_invitacion.natillera_id,
    'natillera_nombre', n.nombre,
    'rol', v_invitacion.rol
  ) INTO v_resultado
  FROM public.natilleras n
  WHERE n.id = v_invitacion.natillera_id;

  RETURN v_resultado;
END;
$fn$;

REVOKE EXECUTE ON FUNCTION public.aceptar_invitacion_colaborador(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.aceptar_invitacion_colaborador(uuid) TO authenticated;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- Con la sesión de un administrador y un socio de OTRA natillera:
--   SELECT socio_actualizar_al_vincular('<socio ajeno>', '<mi natillera>', 'X');
--     → SOCIO_PROHIBIDO, y la ficha intacta.
--
-- La política no debe mencionar `p.telefono`:
--   SELECT qual FROM pg_policies
--   WHERE tablename='socios' AND policyname='Socios visibles para quien tiene motivo';
--
-- Y `anon` ya no ejecuta la aceptación de invitaciones:
--   SELECT has_function_privilege('anon','public.aceptar_invitacion_colaborador(uuid)','EXECUTE');

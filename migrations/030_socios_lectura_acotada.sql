-- ===========================================================================
-- 030_socios_lectura_acotada.sql — cerrar el directorio global de socios
-- ===========================================================================
--
-- La 029 quitó a `anon` de `socios`, pero dejó la lectura abierta a cualquier
-- usuario con sesión: 487 personas con nombre, documento, teléfono y correo al
-- alcance de los 55 registrados. Se dejó así porque la app usa la tabla como
-- directorio global para no duplicar a la misma persona entre natilleras, y
-- estrecharla sin más rompía esa deduplicación.
--
-- Aquí se estrecha de verdad, moviendo al servidor las tres preguntas que de
-- verdad necesitan mirar fuera de lo propio.
--
-- Dos datos que decidieron el diseño:
--
--   · 319 de los 487 socios no cuelgan de ninguna natillera. No es un estado
--     transitorio, son huérfanos acumulados: «sin natillera» no vale como
--     frontera de lectura.
--   · Ningún socio está hoy en dos natilleras a la vez. El directorio global
--     que la deduplicación presupone, en la práctica, no se está usando — pero
--     se conserva el comportamiento para no cambiar la funcionalidad por la
--     puerta de atrás.

BEGIN;

-- ---------------------------------------------------------------------------
-- Quién creó la ficha
-- ---------------------------------------------------------------------------
--
-- `agregarSocio` hace `.insert().select()`: crea el socio y lo vuelve a leer
-- antes de engancharlo a la natillera. En ese instante el socio no pertenece a
-- ninguna, así que sin esta columna la política lo escondería de quien acaba de
-- crearlo y el alta fallaría. Con ella, el permiso es de quien lo creó y los
-- 319 huérfanos viejos (que tienen `creado_por` nulo) no se abren a nadie.

ALTER TABLE public.socios ADD COLUMN IF NOT EXISTS creado_por uuid;
ALTER TABLE public.socios ALTER COLUMN creado_por SET DEFAULT auth.uid();

COMMENT ON COLUMN public.socios.creado_por IS
  'Quién dio de alta la ficha. Solo para la política de lectura mientras el socio aún no pertenece a ninguna natillera.';

CREATE INDEX IF NOT EXISTS idx_socios_creado_por ON public.socios(creado_por);

-- ---------------------------------------------------------------------------
-- Lectura
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Socios visibles para usuarios con sesión" ON public.socios;
CREATE POLICY "Socios visibles para quien tiene motivo" ON public.socios
  FOR SELECT
  USING (
    public.es_superusuario()
    -- Los socios de las natilleras que administro o en las que colaboro.
    OR EXISTS (
      SELECT 1 FROM public.socios_natillera sn
      WHERE sn.socio_id = socios.id
        AND public.tiene_acceso_natillera(sn.natillera_id, (SELECT auth.uid()))
    )
    -- El que acabo de crear y todavía no he enganchado a ninguna natillera.
    OR creado_por = (SELECT auth.uid())
    -- Mi propia ficha de socio: el panel la busca por correo para saber en qué
    -- natilleras participo, y ahí no soy administrador de nada.
    OR EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = (SELECT auth.uid())
        AND (
          (socios.email IS NOT NULL AND lower(btrim(socios.email)) = lower(btrim(p.email)))
          OR (socios.telefono IS NOT NULL AND p.telefono IS NOT NULL
              AND regexp_replace(socios.telefono, '[^0-9]', '', 'g') = regexp_replace(p.telefono, '[^0-9]', '', 'g'))
        )
    )
  );

DROP POLICY IF EXISTS "Actualizar socios de mis natilleras" ON public.socios;
CREATE POLICY "Actualizar socios de mis natilleras" ON public.socios
  FOR UPDATE
  USING (
    public.es_superusuario()
    OR EXISTS (
      SELECT 1 FROM public.socios_natillera sn
      WHERE sn.socio_id = socios.id
        AND public.tiene_acceso_natillera(sn.natillera_id, (SELECT auth.uid()))
    )
    OR creado_por = (SELECT auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Deduplicación entre natilleras
-- ---------------------------------------------------------------------------
--
-- Antes de crear un socio, la app busca por documento o por correo si esa
-- persona ya existe, para enlazarla en vez de duplicarla. Con la política de
-- arriba esa búsqueda ya no ve nada, así que pasa por aquí.
--
-- Devuelve el id y el teléfono, nada más: confirma que la persona existe y deja
-- engancharla, sin enseñar su nombre, su correo ni en qué natillera está.

CREATE OR REPLACE FUNCTION public.socio_buscar_global(p_documento text DEFAULT NULL, p_email text DEFAULT NULL)
RETURNS TABLE(id uuid, telefono character varying)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'SIN_SESION' USING ERRCODE = '28000';
  END IF;

  -- Un documento que empieza por AUTO- lo generó la propia app: no identifica a
  -- nadie y buscar por él emparejaría a personas distintas.
  IF p_documento IS NOT NULL AND btrim(p_documento) <> '' AND p_documento NOT LIKE 'AUTO-%' THEN
    RETURN QUERY
    SELECT s.id, s.telefono FROM public.socios s
    WHERE s.documento = btrim(p_documento) LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  END IF;

  IF p_email IS NOT NULL AND btrim(p_email) <> '' THEN
    RETURN QUERY
    SELECT s.id, s.telefono FROM public.socios s
    WHERE lower(btrim(s.email)) = lower(btrim(p_email)) LIMIT 1;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.socio_buscar_global(text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.socio_buscar_global(text, text) TO authenticated;

-- Y si esa persona resulta ser de la natillera de otro, actualizar sus datos al
-- engancharla tampoco pasa la política de UPDATE. Se permite, porque la ficha
-- del socio es compartida y es el comportamiento de siempre, pero exigiendo que
-- quien lo hace tenga acceso a la natillera donde la está metiendo.

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
AS $$
BEGIN
  IF NOT public.tiene_acceso_natillera(p_natillera_id, (SELECT auth.uid())) THEN
    RAISE EXCEPTION 'SOCIO_PROHIBIDO: no administras esa natillera' USING ERRCODE = '42501';
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
$$;

REVOKE ALL ON FUNCTION public.socio_actualizar_al_vincular(uuid, uuid, text, text, text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.socio_actualizar_al_vincular(uuid, uuid, text, text, text, text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Unicidad del teléfono dentro de una natillera
-- ---------------------------------------------------------------------------
--
-- El cliente lo resolvía buscando el teléfono en TODA la tabla y cruzando
-- después con `socios_natillera`. Con la lectura acotada esa primera consulta ya
-- no devuelve lo de fuera —que es justo lo que se quería descartar—, pero la
-- pregunta se responde mejor entera en el servidor, y de paso normaliza los
-- formatos: en la tabla los teléfonos conviven con y sin indicativo.

CREATE OR REPLACE FUNCTION public.telefono_libre_en_natillera(
  p_telefono      text,
  p_natillera_id  uuid,
  p_excluir_socio uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE v_tel text;
BEGIN
  IF NOT public.tiene_acceso_natillera(p_natillera_id, (SELECT auth.uid())) THEN
    RAISE EXCEPTION 'SOCIO_PROHIBIDO: no administras esa natillera' USING ERRCODE = '42501';
  END IF;

  v_tel := regexp_replace(coalesce(p_telefono, ''), '[^0-9]', '', 'g');
  IF v_tel = '' THEN RETURN false; END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.socios s
    JOIN public.socios_natillera sn ON sn.socio_id = s.id
    WHERE sn.natillera_id = p_natillera_id
      AND (p_excluir_socio IS NULL OR s.id <> p_excluir_socio)
      AND regexp_replace(coalesce(s.telefono, ''), '[^0-9]', '', 'g') = v_tel
  );
END;
$$;

REVOKE ALL ON FUNCTION public.telefono_libre_en_natillera(text, uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.telefono_libre_en_natillera(text, uuid, uuid) TO authenticated;

COMMIT;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- Cada administrador debe ver exactamente los socios de las natilleras que
-- administra o en las que colabora, ni uno más:
--
--   SELECT u.email,
--          (SELECT count(DISTINCT sn.socio_id) FROM socios_natillera sn
--            WHERE tiene_acceso_natillera(sn.natillera_id, u.id)) AS deberia_ver
--   FROM auth.users u;
--
-- y contrastarlo con `SELECT count(*) FROM socios` ejecutado con su sesión.
-- Medido al aplicar: 32/32, 32/32, 14/14, 42/42 (12 como administrador + 30
-- como colaborador aceptado) y 487/487 para el superusuario.

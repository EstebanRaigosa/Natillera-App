-- ===========================================================================
-- 036_cuotas_actualizar_multas_lote.sql — un UPDATE en vez de uno por cuota
-- ===========================================================================
--
-- (Sustituye a la 035, `cuotas_marcar_mora_lote`, que solo cubría el camino de
--  mora y forzaba el estado. Esa función queda eliminada.)
--
-- Dos sitios actualizaban las multas cuota a cuota, cada una con sus propios
-- valores, así que un solo `.update()` no servía:
--
--   · `actualizarEstadoMoraAutomatico` (src/stores/cuotas.js) — marca en mora.
--   · `calcularSancionesTotales`       (src/stores/cuotas.js) — recalcula la
--      sanción. Este es el que se dispara en CADA carga de la vista de cuotas:
--      medido en el navegador, 34 peticiones seguidas.
--
-- `estado` es opcional a propósito. En el camino de sanciones NO se debe tocar:
-- justo después, esa misma función pasa a 'pagada' las cuotas cuya sanción queda
-- saldada, y un lote que forzara 'mora' se llevaría ese estado por delante. Solo
-- se admite el valor 'mora'; esto no es una puerta genérica para cambiar estados.
--
-- Garantías, porque aquí lo que no puede pasar es perder información:
--
--   · Solo se tocan siete columnas. El resto de la fila queda intacta: no hay
--     `upsert` ni fila reconstruida.
--   · Lo que no viene en el JSON se conserva (`coalesce(x.col, c.col)`), que es
--     lo que hacía el cliente al omitir una clave. Un 0 explícito sí entra.
--   · Devuelve las filas completas (`SETOF cuotas`), igual que el `.select()`
--     anterior, para que el refresco del array local no cambie.
--   · Mismo permiso que la política de UPDATE de `cuotas` (`gestionar_cuotas`).
--   · Atómica: si un id no existe, no se escribe ninguno.
--
-- Comprobado tras aplicarla, cargando la vista dos veces contra datos reales:
-- las 517 cuotas de la natillera quedan idénticas en las siete columnas —0
-- diferencias—, con las mismas 38 en mora y la misma suma de multas (357.500).
-- Y el cliente conserva el camino viejo como respaldo si la función falla.

DROP FUNCTION IF EXISTS public.cuotas_marcar_mora_lote(jsonb);

CREATE OR REPLACE FUNCTION public.cuotas_actualizar_multas_lote(p_cambios jsonb)
RETURNS SETOF public.cuotas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  v_sin_permiso integer;
  v_pedidas     integer;
  v_existentes  integer;
  v_estado_malo integer;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'SIN_SESION: hay que iniciar sesión' USING ERRCODE = '28000';
  END IF;

  IF p_cambios IS NULL OR jsonb_typeof(p_cambios) <> 'array' THEN
    RAISE EXCEPTION 'CUOTAS_DATOS: se esperaba un array de cambios' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_cambios) = 0 THEN
    RETURN;
  END IF;

  IF jsonb_array_length(p_cambios) > 500 THEN
    RAISE EXCEPTION 'CUOTAS_DATOS: máximo 500 cuotas por llamada' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_estado_malo
  FROM jsonb_to_recordset(p_cambios) AS x(estado text)
  WHERE x.estado IS NOT NULL AND x.estado <> 'mora';

  IF v_estado_malo > 0 THEN
    RAISE EXCEPTION 'CUOTAS_DATOS: por aquí solo se puede fijar el estado «mora»' USING ERRCODE = '22023';
  END IF;

  SELECT count(DISTINCT x.id) INTO v_pedidas
  FROM jsonb_to_recordset(p_cambios) AS x(id uuid);

  SELECT count(*) INTO v_existentes
  FROM public.cuotas c
  WHERE c.id IN (SELECT y.id FROM jsonb_to_recordset(p_cambios) AS y(id uuid));

  IF v_existentes <> v_pedidas THEN
    RAISE EXCEPTION 'CUOTAS_DATOS: % cuotas pedidas, % encontradas', v_pedidas, v_existentes
      USING ERRCODE = 'P0002';
  END IF;

  SELECT count(*) INTO v_sin_permiso
  FROM jsonb_to_recordset(p_cambios) AS x(id uuid)
  JOIN public.cuotas c ON c.id = x.id
  JOIN public.socios_natillera sn ON sn.id = c.socio_natillera_id
  WHERE NOT public.tiene_permiso_natillera(sn.natillera_id, 'gestionar_cuotas');

  IF v_sin_permiso > 0 THEN
    RAISE EXCEPTION 'CUOTAS_PROHIBIDO: no puedes gestionar cuotas de esa natillera'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  UPDATE public.cuotas c
  SET estado                = coalesce(x.estado, c.estado),
      fecha_mora            = coalesce(x.fecha_mora, c.fecha_mora),
      valor_multa           = coalesce(x.valor_multa, c.valor_multa),
      valor_multa_base      = coalesce(x.valor_multa_base, c.valor_multa_base),
      valor_multa_intereses = coalesce(x.valor_multa_intereses, c.valor_multa_intereses),
      mora_orden            = coalesce(x.mora_orden, c.mora_orden),
      fecha_inicio_mora     = coalesce(x.fecha_inicio_mora, c.fecha_inicio_mora)
  FROM jsonb_to_recordset(p_cambios) AS x(
    id                    uuid,
    estado                text,
    fecha_mora            date,
    valor_multa           numeric,
    valor_multa_base      numeric,
    valor_multa_intereses numeric,
    mora_orden            integer,
    fecha_inicio_mora     date
  )
  WHERE c.id = x.id
  RETURNING c.*;
END;
$fn$;

COMMENT ON FUNCTION public.cuotas_actualizar_multas_lote(jsonb) IS
  'Actualiza multas (y opcionalmente el estado «mora») de varias cuotas en una sola sentencia, cada una con sus valores. Sustituye a un UPDATE por cuota desde el navegador.';

REVOKE ALL ON FUNCTION public.cuotas_actualizar_multas_lote(jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cuotas_actualizar_multas_lote(jsonb) TO authenticated;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- 1. Llamarla con los valores ACTUALES de una cuota debe dejarla idéntica
--    (salvo `updated_at`, que ya movía el UPDATE por fila).
-- 2. Un lote con un id inexistente debe rechazarse SIN escribir los válidos:
--      SELECT cuotas_actualizar_multas_lote(jsonb_build_array(
--        jsonb_build_object('id','<real>','valor_multa',99999),
--        jsonb_build_object('id', gen_random_uuid())));
--    → CUOTAS_DATOS, y la cuota real sin tocar (ni `updated_at`).
-- 3. Un estado distinto de 'mora' debe rechazarse.

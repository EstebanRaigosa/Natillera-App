-- ===========================================================================
-- 031_dashboard_stats_batch.sql — «Recaudado» y «Utilidad» en un solo sitio
-- ===========================================================================
--
-- El cliente ya prefería esta función: `calcularEstadisticasParaDashboard` la
-- intenta antes que nada y solo cae al camino de respaldo si falla. Nunca
-- existió, así que el respaldo era el camino de siempre: seis consultas al
-- navegador y la suma rehecha en cada equipo, con una segunda implementación de
-- la fórmula —la del detalle vive aparte, en `calcularEstadisticas`— y varios
-- `catch` que se tragan el fallo y devuelven el número sin ajustar («es mejor un
-- número de más que una lista vacía», dice el comentario de
-- `_completarBolsillos`). Dos gemelas mantenidas a mano y un fallo silencioso es
-- todo lo que hace falta para que dos personas de la misma natillera vean
-- cifras distintas.
--
-- Comprobado antes de escribir esto, para descartar las causas de datos:
--   · No son permisos. Los cuatro miembros de «Ahorro seguro» —administradora y
--     tres colaboradoras— ven exactamente las mismas filas: 30 socios, 517
--     cuotas, 12 préstamos, 21 movimientos, 28 utilidades.
--   · No es un tope de filas. Ningún usuario pide más de 1.000 en una consulta;
--     el que más, 565.
--   · No son datos sucios: ningún plan de pagos pagado tiene `valor_pagado`
--     nulo, que es lo que envenenaría la suma en JavaScript (`parseFloat(null)`
--     da NaN y el `??` no lo atrapa).
--
-- La fórmula es la misma que ya estaba en el cliente, movida tal cual.

CREATE OR REPLACE FUNCTION public.dashboard_stats_batch(p_natillera_ids uuid[])
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $fn$
WITH nats AS (
  -- Solo las natilleras a las que quien llama tiene acceso. Es lo que hacía RLS
  -- en el camino viejo, y hay que conservarlo porque esto es SECURITY DEFINER.
  SELECT n.id
  FROM public.natilleras n
  WHERE n.id = ANY(p_natillera_ids)
    AND public.tiene_acceso_natillera(n.id, (SELECT auth.uid()))
),
cu AS (
  SELECT sn.natillera_id,
         -- Base de «Recaudado»: solo cuotas pagadas y su valor sin sanción.
         sum(CASE WHEN c.estado = 'pagada' THEN coalesce(c.valor_cuota, 0) ELSE 0 END) total_aportado,
         -- Variante que cuenta también los abonos parciales.
         sum(CASE WHEN coalesce(c.valor_pagado, 0) > 0 THEN c.valor_pagado ELSE 0 END) incl_parciales,
         sum(coalesce(c.valor_pagado, 0)) pagado_bruto,
         sum(coalesce(c.valor_cuota, 0))  plan_total,
         count(*) FILTER (WHERE c.estado = 'pagada') n_pagadas,
         sum(CASE WHEN c.estado = 'pagada'
                  THEN coalesce(nullif(c.valor_pagado_sancion, 0), nullif(c.valor_multa, 0), 0)
                  ELSE 0 END) sanciones
  FROM nats
  JOIN public.socios_natillera sn ON sn.natillera_id = nats.id
  JOIN public.cuotas c ON c.socio_natillera_id = sn.id
  GROUP BY sn.natillera_id
),
pr AS (
  SELECT sn.natillera_id,
         -- El interés anticipado sale del fondo junto con el capital.
         sum(coalesce(p.monto, 0)
             + CASE WHEN p.interes_anticipado AND p.interes_total IS NOT NULL
                    THEN p.interes_total ELSE 0 END) desembolsado,
         p.id prestamo_id
  FROM nats
  JOIN public.socios_natillera sn ON sn.natillera_id = nats.id
  JOIN public.prestamos p ON p.socio_natillera_id = sn.id
  WHERE p.estado IN ('pagado', 'activo')
  GROUP BY sn.natillera_id, p.id
),
pr_tot AS (
  SELECT natillera_id, sum(desembolsado) desembolsado FROM pr GROUP BY natillera_id
),
pagos AS (
  SELECT pr.natillera_id,
         sum(CASE WHEN lower(btrim(coalesce(pp.forma_pago, ''))) = 'transferencia'
                  THEN coalesce(pp.valor_pagado, pp.valor_cuota, 0) ELSE 0 END) pagos_transf,
         sum(CASE WHEN lower(btrim(coalesce(pp.forma_pago, ''))) <> 'transferencia'
                  THEN coalesce(pp.valor_pagado, pp.valor_cuota, 0) ELSE 0 END) pagos_efec
  FROM pr
  JOIN public.plan_pagos_prestamo pp ON pp.prestamo_id = pr.prestamo_id
  WHERE pp.pagada AND coalesce(pp.valor_pagado, pp.valor_cuota, 0) > 0
  GROUP BY pr.natillera_id
),
mov AS (
  SELECT m.natillera_id,
         -- Un premio de rifa ya viene descontado de la base: contarlo otra vez
         -- lo restaría dos veces.
         sum(CASE WHEN m.tipo = 'salida' AND es_premio THEN coalesce(m.monto, 0) ELSE 0 END) premios,
         sum(CASE WHEN m.tipo = 'entrada' AND lower(coalesce(m.forma_pago,'')) = 'efectivo' THEN coalesce(m.monto,0) ELSE 0 END)
           - sum(CASE WHEN m.tipo = 'salida' AND NOT es_premio AND lower(coalesce(m.forma_pago,'')) = 'efectivo' THEN coalesce(m.monto,0) ELSE 0 END) neto_efec,
         sum(CASE WHEN m.tipo = 'entrada' AND lower(coalesce(m.forma_pago,'')) = 'transferencia' THEN coalesce(m.monto,0) ELSE 0 END)
           - sum(CASE WHEN m.tipo = 'salida' AND NOT es_premio AND lower(coalesce(m.forma_pago,'')) = 'transferencia' THEN coalesce(m.monto,0) ELSE 0 END) neto_transf,
         sum(CASE WHEN m.tipo = 'salida' AND NOT es_premio AND m.origen_egreso = 'recaudado'  THEN coalesce(m.monto,0) ELSE 0 END) egr_recaudado,
         sum(CASE WHEN m.tipo = 'salida' AND NOT es_premio AND m.origen_egreso = 'utilidades' THEN coalesce(m.monto,0) ELSE 0 END) egr_utilidades,
         sum(CASE WHEN m.tipo = 'entrada' AND m.destino_ingreso = 'recaudado'  THEN coalesce(m.monto,0) ELSE 0 END) ing_recaudado,
         sum(CASE WHEN m.tipo = 'entrada' AND m.destino_ingreso = 'utilidades' THEN coalesce(m.monto,0) ELSE 0 END) ing_utilidades
  FROM nats
  JOIN LATERAL (
    SELECT mf.*,
           (lower(btrim(coalesce(mf.descripcion,''))) LIKE '%premio%'
            AND lower(btrim(coalesce(mf.descripcion,''))) LIKE '%rifa%')
           OR lower(btrim(coalesce(mf.descripcion,''))) LIKE '%rifa liquidada%' es_premio
    FROM public.movimientos_fondo mf WHERE mf.natillera_id = nats.id
  ) m ON true
  GROUP BY m.natillera_id
),
uti AS (
  SELECT u.natillera_id, sum(coalesce(u.monto, 0)) monto
  FROM nats JOIN public.utilidades_clasificadas u ON u.natillera_id = nats.id
  WHERE u.fecha_cierre IS NULL
  GROUP BY u.natillera_id
),
act AS (
  SELECT a.natillera_id, sum(coalesce(a.utilidad, 0)) utilidad
  FROM nats JOIN public.actividades a ON a.natillera_id = nats.id
  GROUP BY a.natillera_id
),
calc AS (
  SELECT
    nats.id,
    coalesce(cu.total_aportado, 0)  total_aportado,
    coalesce(cu.incl_parciales, 0)  incl_parciales,
    coalesce(cu.pagado_bruto, 0)    pagado_bruto,
    coalesce(cu.plan_total, 0)      plan_total,
    coalesce(pr_tot.desembolsado, 0) desembolsado,
    coalesce(pagos.pagos_efec, 0)    pagos_efec,
    coalesce(pagos.pagos_transf, 0)  pagos_transf,
    coalesce(mov.premios, 0)         premios,
    coalesce(mov.neto_efec, 0)       neto_efec,
    coalesce(mov.neto_transf, 0)     neto_transf,
    coalesce(mov.egr_recaudado, 0)   egr_recaudado,
    coalesce(mov.egr_utilidades, 0)  egr_utilidades,
    coalesce(mov.ing_recaudado, 0)   ing_recaudado,
    coalesce(mov.ing_utilidades, 0)  ing_utilidades,
    -- Utilidades: lo clasificado en el libro y, si aún no hay nada clasificado,
    -- el respaldo de sanciones cobradas más la utilidad de las actividades.
    CASE
      WHEN coalesce(uti.monto, 0) <> 0 THEN uti.monto
      WHEN coalesce(cu.n_pagadas, 0) > 0 THEN coalesce(cu.sanciones, 0) + coalesce(act.utilidad, 0)
      ELSE 0
    END utilidades
  FROM nats
  LEFT JOIN cu     ON cu.natillera_id = nats.id
  LEFT JOIN pr_tot ON pr_tot.natillera_id = nats.id
  LEFT JOIN pagos  ON pagos.natillera_id = nats.id
  LEFT JOIN mov    ON mov.natillera_id = nats.id
  LEFT JOIN uti    ON uti.natillera_id = nats.id
  LEFT JOIN act    ON act.natillera_id = nats.id
)
SELECT coalesce(jsonb_object_agg(id::text, jsonb_build_object(
  'totalRecaudadoNeto', neto,
  'totalRecaudadoNetoInclParciales', neto_parciales,
  'utilidadesRecogidas', utilidades,
  'fondoTotal', neto + utilidades + neto_efec + neto_transf,
  'recaudadoBrutoCuotas', pagado_bruto,
  'progresoCuotas', CASE WHEN plan_total > 0 THEN (pagado_bruto / plan_total) * 100 ELSE 0 END,
  'egresosRecaudado', egr_recaudado,
  'egresosUtilidades', egr_utilidades,
  'ingresosRecaudado', ing_recaudado,
  'ingresosUtilidades', ing_utilidades
)), '{}'::jsonb)
FROM (
  SELECT c.*,
         greatest(0, total_aportado + pagos_efec + pagos_transf - desembolsado - premios) neto,
         greatest(0, incl_parciales + pagos_efec + pagos_transf - desembolsado - premios) neto_parciales
  FROM calc c
) t;
$fn$;

COMMENT ON FUNCTION public.dashboard_stats_batch(uuid[]) IS
  'Recaudado y Utilidad de varias natilleras, calculados en el servidor para que todos los miembros vean lo mismo y coincida con el detalle.';

REVOKE ALL ON FUNCTION public.dashboard_stats_batch(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_stats_batch(uuid[]) TO authenticated;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- El mismo número para todos los miembros de una natillera. Medido al aplicar
-- sobre «Ahorro seguro»: 26.139.459 de recaudado y 2.788.704 de utilidad, igual
-- para la administradora y para las tres colaboradoras.
--
--   SELECT dashboard_stats_batch(ARRAY['<id>'::uuid]);
--
-- Los dos indicadores se derivan con las fórmulas de
-- src/utils/indicadoresNatillera.js, que no cambian:
--   recaudado = max(0, totalRecaudadoNetoInclParciales - egresosRecaudado + ingresosRecaudado)
--   utilidad  = max(0, utilidadesRecogidas - egresosUtilidades + ingresosUtilidades)

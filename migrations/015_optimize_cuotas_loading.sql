-- ═══════════════════════════════════════════════════════════════════════
-- Optimización de carga de Cuotas: índices compuestos + RPC resumen
-- Ya aplicada en producción vía Supabase MCP
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Índice compuesto para queries por mes/año
CREATE INDEX IF NOT EXISTS idx_cuotas_socio_mes_anio
  ON public.cuotas (socio_natillera_id, mes, anio);

-- 2. Índice compuesto socios_actividad(socio_natillera_id, estado)
CREATE INDEX IF NOT EXISTS idx_socios_actividad_socio_estado
  ON public.socios_actividad (socio_natillera_id, estado);

-- 3. Índice compuesto prestamos(socio_natillera_id, estado)
CREATE INDEX IF NOT EXISTS idx_prestamos_socio_estado
  ON public.prestamos (socio_natillera_id, estado);

-- 4. Eliminar índices duplicados
DROP INDEX IF EXISTS idx_cuotas_socio_natillera;
DROP INDEX IF EXISTS idx_socios_natillera_natillera;
DROP INDEX IF EXISTS idx_prestamos_socio_natillera;

-- 5. RPC: resumen de cuotas por mes (CuotasMeses.vue)
CREATE OR REPLACE FUNCTION get_resumen_cuotas_meses(p_natillera_id uuid)
RETURNS TABLE(mes int, anio int, pagadas bigint, pendientes bigint, en_mora bigint)
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  WITH cuotas_base AS (
    SELECT c.id, c.mes, c.anio, c.estado, c.valor_pagado, c.valor_cuota,
           c.socio_natillera_id, sn.estado AS sn_estado
    FROM cuotas c
    INNER JOIN socios_natillera sn ON sn.id = c.socio_natillera_id
    WHERE sn.natillera_id = p_natillera_id
  ),
  inactive_unpaid AS (
    SELECT socio_natillera_id, mes, anio
    FROM cuotas_base
    WHERE sn_estado = 'inactivo'
    GROUP BY socio_natillera_id, mes, anio
    HAVING bool_and(COALESCE(valor_pagado, 0) >= valor_cuota) = false
  ),
  cuotas_filtradas AS (
    SELECT cb.*
    FROM cuotas_base cb
    WHERE NOT EXISTS (
      SELECT 1 FROM inactive_unpaid iu
      WHERE iu.socio_natillera_id = cb.socio_natillera_id
        AND iu.mes = cb.mes AND iu.anio = cb.anio
    )
  )
  SELECT cf.mes::int, cf.anio::int,
    COUNT(*) FILTER (WHERE cf.estado = 'pagada') as pagadas,
    COUNT(*) FILTER (WHERE cf.estado IN ('pendiente', 'parcial')) as pendientes,
    COUNT(*) FILTER (WHERE cf.estado = 'mora') as en_mora
  FROM cuotas_filtradas cf
  GROUP BY cf.mes, cf.anio
  ORDER BY cf.anio, cf.mes;
$$;

-- =============================================================================
-- MIGRACIÓN 014: Optimización de rendimiento post-login
-- Ejecutar en Supabase SQL Editor.
--
-- Problemas detectados:
--   1) Casi TODAS las políticas RLS hacen:
--        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
--      Sin un índice en natilleras(admin_id) esto es un seq-scan por cada fila evaluada.
--   2) Las queries post-login filtran natillera_colaboradores por (usuario_id, estado)
--      pero solo existe índice en usuario_id (sin incluir estado).
--   3) cuotas y prestamos se filtran con IN (...) + estado pero no hay índice compuesto.
--   4) La vista vista_colaboradores_natillera tiene subqueries correlacionadas lentas.
--   5) fetchMisInvitaciones usa OR (usuario_id = X, email_invitado = Y) con estado = pendiente.
-- =============================================================================

-- ─── 1. ÍNDICE CRÍTICO: natilleras(admin_id) ────────────────────────────────
-- Usado por TODAS las políticas RLS de: socios_natillera, cuotas, prestamos,
-- pagos_prestamo, multas, actividades, historial, utilidades_clasificadas, etc.
-- Sin este índice, Postgres hace seq-scan en la tabla natilleras por cada fila evaluada.
CREATE INDEX IF NOT EXISTS idx_natilleras_admin_id
  ON public.natilleras (admin_id);

-- ─── 2. ÍNDICE COMPUESTO: colaboradores (usuario_id, estado) ────────────────
-- fetchNatilleras, fetchNatillerasCompartidas y fetchMisInvitaciones filtran siempre
-- por ambas columnas. El índice simple en usuario_id obliga a un filter posterior.
CREATE INDEX IF NOT EXISTS idx_natillera_colaboradores_usuario_estado
  ON public.natillera_colaboradores (usuario_id, estado);

-- Variante para invitaciones pendientes buscadas por email
CREATE INDEX IF NOT EXISTS idx_natillera_colaboradores_email_estado
  ON public.natillera_colaboradores (email_invitado, estado)
  WHERE email_invitado IS NOT NULL;

-- ─── 3. ÍNDICE COMPUESTO: cuotas (socio_natillera_id, estado) ───────────────
-- calcularEstadisticasParaDashboard filtra cuotas con IN(socio_natillera_id) y luego
-- agrupa por estado en JS. Un índice compuesto permite range-scan + filter en un paso.
CREATE INDEX IF NOT EXISTS idx_cuotas_socio_natillera_estado
  ON public.cuotas (socio_natillera_id, estado);

-- ─── 4. ÍNDICE COMPUESTO: prestamos (socio_natillera_id, estado) ────────────
-- Mismo patrón: filtrado por IN(socio_natillera_id) + estado IN ('pagado','activo').
CREATE INDEX IF NOT EXISTS idx_prestamos_socio_natillera_estado
  ON public.prestamos (socio_natillera_id, estado);

-- ─── 5. ÍNDICE: plan_pagos_prestamo (prestamo_id, pagada) ──────────────────
-- calcularEstadisticasParaDashboard y calcularEstadisticas filtran por prestamo_id
-- y pagada = true. Cubrir ambas columnas evita heap-fetch extra.
CREATE INDEX IF NOT EXISTS idx_plan_pagos_prestamo_pagada
  ON public.plan_pagos_prestamo (prestamo_id)
  WHERE pagada = true;

-- ─── 6. ÍNDICE: natillera_colaboradores (natillera_id, estado) ──────────────
-- Las RLS de colaboradores y el fetch de colaboradores por natillera filtran por ambas.
CREATE INDEX IF NOT EXISTS idx_natillera_colaboradores_natillera_estado
  ON public.natillera_colaboradores (natillera_id, estado);

-- ─── 7. Vista optimizada: eliminar subqueries correlacionadas ───────────────
-- La vista actual tiene 2 SELECT escalares por fila (invitado_por_nombre, invitado_por_email).
-- Reemplazar con un LEFT JOIN que se resuelve una sola vez.
CREATE OR REPLACE VIEW vista_colaboradores_natillera AS
SELECT
    nc.id,
    nc.natillera_id,
    nc.usuario_id,
    nc.permisos,
    nc.rol,
    nc.estado,
    nc.invitado_por,
    nc.email_invitado,
    nc.token_invitacion,
    nc.notas,
    nc.fecha_invitacion,
    nc.fecha_respuesta,
    nc.created_at,
    nc.updated_at,
    COALESCE(up.nombre, up.email, nc.email_invitado) AS nombre_usuario,
    COALESCE(up.email, nc.email_invitado)             AS email_usuario,
    up.avatar_seed,
    up.avatar_style,
    inv.nombre  AS invitado_por_nombre,
    inv.email   AS invitado_por_email,
    n.nombre    AS natillera_nombre
FROM natillera_colaboradores nc
LEFT JOIN user_profiles up  ON up.id = nc.usuario_id
LEFT JOIN user_profiles inv ON inv.id = nc.invitado_por
LEFT JOIN natilleras n      ON n.id = nc.natillera_id;

GRANT SELECT ON vista_colaboradores_natillera TO authenticated;

-- ─── 8. RPC: Estadísticas en lote para el dashboard ─────────────────────────
-- Reemplaza 6 queries separadas + agregación JS por una sola llamada al servidor.
-- Retorna un JSON { natillera_id: { stats... } } para cada natillera.
CREATE OR REPLACE FUNCTION dashboard_stats_batch(p_natillera_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  resultado JSONB := '{}'::jsonb;
  r RECORD;
BEGIN
  FOR r IN
    WITH
    nat_ids AS (
      SELECT unnest(p_natillera_ids) AS id
    ),
    -- Socios por natillera
    sn AS (
      SELECT s.id AS sn_id, s.natillera_id
      FROM socios_natillera s
      INNER JOIN nat_ids ni ON ni.id = s.natillera_id
    ),
    -- Cuotas: agrupar por natillera
    cuotas_agg AS (
      SELECT
        sn.natillera_id,
        SUM(CASE WHEN c.estado = 'pagada' THEN COALESCE(c.valor_cuota, 0) ELSE 0 END) AS total_aportado,
        SUM(CASE WHEN c.valor_pagado > 0 THEN COALESCE(c.valor_pagado, 0) ELSE 0 END) AS recaudado_bruto_cuotas,
        SUM(COALESCE(c.valor_cuota, 0)) AS total_cuota_plan,
        SUM(CASE WHEN c.estado = 'pagada' THEN COALESCE(c.valor_pagado_sancion, c.valor_multa, 0) ELSE 0 END) AS sanciones_pagadas
      FROM cuotas c
      INNER JOIN sn ON sn.sn_id = c.socio_natillera_id
      GROUP BY sn.natillera_id
    ),
    -- Utilidades clasificadas (sin fecha_cierre)
    util_agg AS (
      SELECT u.natillera_id, SUM(COALESCE(u.monto, 0)) AS utilidades
      FROM utilidades_clasificadas u
      INNER JOIN nat_ids ni ON ni.id = u.natillera_id
      WHERE u.fecha_cierre IS NULL
      GROUP BY u.natillera_id
    ),
    -- Actividades: utilidad total
    act_agg AS (
      SELECT a.natillera_id, SUM(COALESCE(a.utilidad, 0)) AS utilidad_actividades
      FROM actividades a
      INNER JOIN nat_ids ni ON ni.id = a.natillera_id
      GROUP BY a.natillera_id
    ),
    -- Préstamos activos/pagados con plan de pagos
    prest_agg AS (
      SELECT
        sn.natillera_id,
        SUM(
          CASE
            WHEN p.interes_anticipado AND p.interes_total IS NOT NULL
            THEN COALESCE(p.monto, 0) + COALESCE(p.interes_total, 0)
            ELSE COALESCE(p.monto, 0)
          END
        ) AS total_desembolsado,
        SUM(COALESCE(pp_agg.pagos_efectivo, 0)) AS pagos_prest_efectivo,
        SUM(COALESCE(pp_agg.pagos_transferencia, 0)) AS pagos_prest_transferencia
      FROM prestamos p
      INNER JOIN sn ON sn.sn_id = p.socio_natillera_id
      LEFT JOIN LATERAL (
        SELECT
          SUM(CASE WHEN LOWER(COALESCE(pp.forma_pago,'efectivo')) != 'transferencia' THEN COALESCE(pp.valor_pagado, pp.valor_cuota, 0) ELSE 0 END) AS pagos_efectivo,
          SUM(CASE WHEN LOWER(COALESCE(pp.forma_pago,'')) = 'transferencia' THEN COALESCE(pp.valor_pagado, pp.valor_cuota, 0) ELSE 0 END) AS pagos_transferencia
        FROM plan_pagos_prestamo pp
        WHERE pp.prestamo_id = p.id AND pp.pagada = true
      ) pp_agg ON true
      WHERE p.estado IN ('pagado', 'activo')
      GROUP BY sn.natillera_id
    ),
    -- Movimientos de fondo
    mov_agg AS (
      SELECT
        m.natillera_id,
        SUM(CASE
          WHEN m.tipo = 'salida'
            AND (LOWER(COALESCE(m.descripcion,'')) LIKE '%premio rifa%'
              OR LOWER(COALESCE(m.descripcion,'')) LIKE '%rifa liquidada%')
          THEN COALESCE(m.monto, 0) ELSE 0
        END) AS premios_rifas,
        SUM(CASE WHEN m.forma_pago = 'efectivo' AND m.tipo = 'entrada' THEN COALESCE(m.monto,0) ELSE 0 END)
        - SUM(CASE WHEN m.forma_pago = 'efectivo' AND m.tipo = 'salida'
            AND NOT (LOWER(COALESCE(m.descripcion,'')) LIKE '%premio rifa%'
                  OR LOWER(COALESCE(m.descripcion,'')) LIKE '%rifa liquidada%')
            THEN COALESCE(m.monto,0) ELSE 0 END) AS mov_efectivo_neto,
        SUM(CASE WHEN m.forma_pago = 'transferencia' AND m.tipo = 'entrada' THEN COALESCE(m.monto,0) ELSE 0 END)
        - SUM(CASE WHEN m.forma_pago = 'transferencia' AND m.tipo = 'salida'
            AND NOT (LOWER(COALESCE(m.descripcion,'')) LIKE '%premio rifa%'
                  OR LOWER(COALESCE(m.descripcion,'')) LIKE '%rifa liquidada%')
            THEN COALESCE(m.monto,0) ELSE 0 END) AS mov_transferencia_neto
      FROM movimientos_fondo m
      INNER JOIN nat_ids ni ON ni.id = m.natillera_id
      GROUP BY m.natillera_id
    )
    -- Resultado final por natillera
    SELECT
      ni.id AS natillera_id,
      COALESCE(ca.total_aportado, 0)         AS total_aportado,
      COALESCE(ca.recaudado_bruto_cuotas, 0) AS recaudado_bruto_cuotas,
      COALESCE(ca.total_cuota_plan, 0)       AS total_cuota_plan,
      COALESCE(pa.total_desembolsado, 0)     AS total_desembolsado,
      COALESCE(pa.pagos_prest_efectivo, 0)   AS pagos_prest_efectivo,
      COALESCE(pa.pagos_prest_transferencia, 0) AS pagos_prest_transferencia,
      COALESCE(ma.premios_rifas, 0)          AS premios_rifas,
      COALESCE(ma.mov_efectivo_neto, 0)      AS mov_efectivo_neto,
      COALESCE(ma.mov_transferencia_neto, 0) AS mov_transferencia_neto,
      COALESCE(ua.utilidades, 0)             AS utilidades_tabla,
      COALESCE(aa.utilidad_actividades, 0)   AS utilidad_actividades,
      COALESCE(ca.sanciones_pagadas, 0)      AS sanciones_pagadas
    FROM nat_ids ni
    LEFT JOIN cuotas_agg ca ON ca.natillera_id = ni.id
    LEFT JOIN util_agg   ua ON ua.natillera_id = ni.id
    LEFT JOIN act_agg    aa ON aa.natillera_id = ni.id
    LEFT JOIN prest_agg  pa ON pa.natillera_id = ni.id
    LEFT JOIN mov_agg    ma ON ma.natillera_id = ni.id
  LOOP
    DECLARE
      total_recaudado_neto NUMERIC;
      total_recaudado_neto_incl NUMERIC;
      utilidades_recogidas NUMERIC;
      fondo_total NUMERIC;
      progreso NUMERIC;
    BEGIN
      utilidades_recogidas := r.utilidades_tabla;
      IF utilidades_recogidas = 0 AND r.total_aportado > 0 THEN
        utilidades_recogidas := r.sanciones_pagadas + r.utilidad_actividades;
      END IF;

      total_recaudado_neto := GREATEST(0,
        r.total_aportado + r.pagos_prest_efectivo + r.pagos_prest_transferencia
        - r.total_desembolsado - r.premios_rifas
      );

      total_recaudado_neto_incl := GREATEST(0,
        r.recaudado_bruto_cuotas + r.pagos_prest_efectivo + r.pagos_prest_transferencia
        - r.total_desembolsado - r.premios_rifas
      );

      fondo_total := total_recaudado_neto + utilidades_recogidas
                     + r.mov_efectivo_neto + r.mov_transferencia_neto;

      progreso := CASE WHEN r.total_cuota_plan > 0
        THEN (r.recaudado_bruto_cuotas / r.total_cuota_plan) * 100
        ELSE 0 END;

      resultado := resultado || jsonb_build_object(
        r.natillera_id::text,
        jsonb_build_object(
          'totalRecaudadoNeto', total_recaudado_neto,
          'totalRecaudadoNetoInclParciales', total_recaudado_neto_incl,
          'utilidadesRecogidas', utilidades_recogidas,
          'fondoTotal', fondo_total,
          'recaudadoBrutoCuotas', r.recaudado_bruto_cuotas,
          'progresoCuotas', progreso
        )
      );
    END;
  END LOOP;

  RETURN resultado;
END;
$$;

COMMENT ON FUNCTION dashboard_stats_batch IS
  'Calcula estadísticas del dashboard para N natilleras en una sola llamada. '
  'Reemplaza 6 queries separadas desde el frontend.';

-- ─── 9. Comentarios de los índices ──────────────────────────────────────────
COMMENT ON INDEX idx_natilleras_admin_id IS
  'CRÍTICO: Acelera TODAS las políticas RLS que verifican admin_id = auth.uid()';
COMMENT ON INDEX idx_natillera_colaboradores_usuario_estado IS
  'Post-login: fetchNatilleras + fetchNatillerasCompartidas filtran por (usuario_id, estado)';
COMMENT ON INDEX idx_cuotas_socio_natillera_estado IS
  'Dashboard batch: evita filter extra al agregar cuotas por estado';
COMMENT ON INDEX idx_prestamos_socio_natillera_estado IS
  'Dashboard batch: filtra préstamos por socio + estado en un range-scan';

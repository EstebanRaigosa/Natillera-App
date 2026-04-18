-- Índices para consultas frecuentes del dashboard, detalle de natillera y stores.
-- Ejecutar en Supabase SQL Editor o vía migración si usas CLI vinculado al proyecto.

-- Cuotas por socio_natillera (IN listas largas, joins desde socios_natillera)
CREATE INDEX IF NOT EXISTS idx_cuotas_socio_natillera_id
  ON public.cuotas (socio_natillera_id);

-- Socios de una natillera (filtro por natillera_id, conteos, listas)
CREATE INDEX IF NOT EXISTS idx_socios_natillera_natillera_id
  ON public.socios_natillera (natillera_id);

-- Colaboraciones del usuario (login / listas compartidas)
CREATE INDEX IF NOT EXISTS idx_natillera_colaboradores_usuario_id
  ON public.natillera_colaboradores (usuario_id);

-- Actividades por natillera (estadísticas en lote)
CREATE INDEX IF NOT EXISTS idx_actividades_natillera_id
  ON public.actividades (natillera_id);

-- Movimientos de fondo por natillera
CREATE INDEX IF NOT EXISTS idx_movimientos_fondo_natillera_id
  ON public.movimientos_fondo (natillera_id);

-- Utilidades clasificadas abiertas por natillera (fecha_cierre IS NULL en app)
CREATE INDEX IF NOT EXISTS idx_utilidades_clasificadas_natillera_fecha_cierre
  ON public.utilidades_clasificadas (natillera_id)
  WHERE fecha_cierre IS NULL;

-- Plan de pagos por préstamo (joins desde préstamos activos/pagados)
CREATE INDEX IF NOT EXISTS idx_plan_pagos_prestamo_id
  ON public.plan_pagos_prestamo (prestamo_id);

-- Préstamos por socio_natillera (IN en estadísticas en lote)
CREATE INDEX IF NOT EXISTS idx_prestamos_socio_natillera_id
  ON public.prestamos (socio_natillera_id);

COMMENT ON INDEX idx_cuotas_socio_natillera_id IS 'Perf: fetch cuotas por socios_natillera (batch dashboard / detalle)';
COMMENT ON INDEX idx_socios_natillera_natillera_id IS 'Perf: socios y conteos por natillera';

-- ============================================
-- Migración 019: soporte para eliminar un pago registrado en una cuota
-- ============================================
--
-- Contexto
-- --------
-- Un pago de cuota no vive en una sola fila: además de `cuotas` e
-- `historial_pagos_cuota`, puede haber creado abonos en `pagos_prestamo`
-- (con origen = 'cuota_natillera') y haber marcado actividades en
-- `socios_actividad`. Hasta ahora no existía ningún vínculo explícito entre
-- la transacción registrada en `historial_pagos_cuota` y esos efectos
-- colaterales, así que revertir un pago obligaba a adivinar por fecha y monto.
--
-- Esta migración hace dos cosas:
--   1. Añade la columna de enlace `historial_pago_cuota_id` en `pagos_prestamo`
--      para que cada abono a préstamo generado desde una cuota sepa de qué
--      transacción salió y pueda revertirse sin ambigüedad.
--   2. Habilita el DELETE sobre `historial_pagos_cuota` para el admin de la
--      natillera (y superusuario), que es quien puede eliminar pagos.
--
-- Nota sobre pagos anteriores a esta migración: no tienen el enlace, así que la
-- reversión de sus conceptos (actividades y cuotas de préstamo) se hace por
-- coincidencia de detalle y monto. La app avisa de ello antes de confirmar.

-- ============================================
-- 1. Enlace transacción de cuota → abono a préstamo
-- ============================================

ALTER TABLE public.pagos_prestamo
ADD COLUMN IF NOT EXISTS historial_pago_cuota_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pagos_prestamo_historial_pago_cuota_id_fkey'
  ) THEN
    ALTER TABLE public.pagos_prestamo
    ADD CONSTRAINT pagos_prestamo_historial_pago_cuota_id_fkey
    FOREIGN KEY (historial_pago_cuota_id)
    REFERENCES public.historial_pagos_cuota(id)
    ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON COLUMN public.pagos_prestamo.historial_pago_cuota_id IS
  'Transacción de historial_pagos_cuota que originó este abono (solo para origen = cuota_natillera). Permite revertir el abono exacto al eliminar el pago de la cuota.';

CREATE INDEX IF NOT EXISTS idx_pagos_prestamo_historial_pago_cuota
  ON public.pagos_prestamo (historial_pago_cuota_id)
  WHERE historial_pago_cuota_id IS NOT NULL;

-- ============================================
-- 2. Detalle de actividades pagadas por transacción
-- ============================================
-- `detalle_actividades` ya guarda nombre/tipo/valor, pero no el id de la fila de
-- socios_actividad, que es lo que hace falta para revertir sin ambigüedad. La
-- app pasa a incluir `socio_actividad_id` dentro de ese JSONB; aquí solo se
-- garantiza que la columna exista con el tipo correcto.

ALTER TABLE public.historial_pagos_cuota
ADD COLUMN IF NOT EXISTS detalle_actividades JSONB;

ALTER TABLE public.historial_pagos_cuota
ADD COLUMN IF NOT EXISTS detalle_cuotas_prestamo JSONB;

COMMENT ON COLUMN public.historial_pagos_cuota.detalle_actividades IS
  'Actividades cubiertas por esta transacción. Cada entrada: { socio_actividad_id, nombre, tipo, valor }. El id permite revertir la fila exacta de socios_actividad al eliminar el pago.';

-- ============================================
-- 3. RLS: el admin de la natillera puede borrar transacciones de pago
-- ============================================
-- Requiere public.es_superusuario() (ver 007_prestamos_rls_insert_policy.sql).

ALTER TABLE public.historial_pagos_cuota ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'historial_pagos_cuota'
      AND policyname = 'historial_pagos_cuota_delete_admin_or_super'
  ) THEN
    DROP POLICY "historial_pagos_cuota_delete_admin_or_super" ON public.historial_pagos_cuota;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- DELETE: superusuario o admin de la natillera dueña de la cuota
CREATE POLICY "historial_pagos_cuota_delete_admin_or_super"
ON public.historial_pagos_cuota
FOR DELETE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM public.cuotas c
    JOIN public.socios_natillera sn ON sn.id = c.socio_natillera_id
    JOIN public.natilleras n ON n.id = sn.natillera_id
    WHERE c.id = historial_pagos_cuota.cuota_id
      AND n.admin_id = auth.uid()
  )
);

-- ============================================
-- 4. Borrado de abonos a préstamo generados desde una cuota
-- ============================================
-- Al revertir un pago hay que eliminar la fila de pagos_prestamo que creó.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pagos_prestamo'
      AND policyname = 'pagos_prestamo_delete_admin_or_super'
  ) THEN
    DROP POLICY "pagos_prestamo_delete_admin_or_super" ON public.pagos_prestamo;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- `prestamos` no guarda natillera_id: la natillera se alcanza por socios_natillera.
CREATE POLICY "pagos_prestamo_delete_admin_or_super"
ON public.pagos_prestamo
FOR DELETE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM public.prestamos p
    JOIN public.socios_natillera sn ON sn.id = p.socio_natillera_id
    JOIN public.natilleras n ON n.id = sn.natillera_id
    WHERE p.id = pagos_prestamo.prestamo_id
      AND n.admin_id = auth.uid()
  )
);

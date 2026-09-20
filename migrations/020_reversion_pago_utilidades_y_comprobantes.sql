-- ============================================
-- Migración 020: completar la reversión de un pago de cuota
-- ============================================
--
-- Contexto
-- --------
-- La migración 019 dejó revertible casi todo un pago de cuota: la propia cuota, las
-- actividades que cubrió y los abonos a préstamo que generó. Faltaban dos efectos, que
-- son los que esta migración habilita (ver Especificaciones/eliminar-pago-cuota,
-- RF-09 y RF-10):
--
--   1. La UTILIDAD POR SANCIÓN. Al registrar un pago con multa, el monto se suma a
--      `utilidades_clasificadas` (tipo 'sanciones'). Al eliminar el pago, la sanción
--      volvía a ser deuda del socio pero seguía contada como utilidad del fondo, así que
--      el cierre repartía dinero que nadie pagó. La reversión de ese monto se hace por
--      UPDATE, para lo que ya existe política (016); esta migración no añade nada ahí.
--
--   2. El HISTORIAL DE COMPROBANTES. `registrarPago` inserta una fila en
--      `historial_comprobantes` con motivo 'completar_pago_parcial' cuando un pago
--      parcial se completa. Al eliminar el pago esa fila quedaba huérfana y el modal de
--      detalle seguía mostrando el comprobante de un pago que ya no existe.
--
-- Esta migración hace dos cosas:
--   1. Añade el enlace `historial_pago_cuota_id` en `historial_comprobantes`, para poder
--      borrar la fila exacta que nació del pago sin tocar las que nacieron de una edición
--      de cuota ('edicion_cuota_pagada' / 'actualizacion_pago'), que son otra cosa.
--   2. Habilita el DELETE sobre `historial_comprobantes` para el admin de la natillera y
--      el superusuario. La tabla tiene RLS con políticas SELECT e INSERT, pero ninguna de
--      DELETE: sin esta política el borrado no falla, simplemente no borra nada.
--
-- Nota sobre pagos anteriores a esta migración: no tienen el enlace. La app NO los borra
-- por aproximación (coincidir por monto y fecha es adivinar); avisa de que la fila quedó
-- sin enlazar para que se revise a mano.

-- ============================================
-- 1. Enlace transacción de cuota → fila de historial_comprobantes
-- ============================================

ALTER TABLE public.historial_comprobantes
ADD COLUMN IF NOT EXISTS historial_pago_cuota_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'historial_comprobantes_historial_pago_cuota_id_fkey'
  ) THEN
    ALTER TABLE public.historial_comprobantes
    ADD CONSTRAINT historial_comprobantes_historial_pago_cuota_id_fkey
    FOREIGN KEY (historial_pago_cuota_id)
    REFERENCES public.historial_pagos_cuota(id)
    ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON COLUMN public.historial_comprobantes.historial_pago_cuota_id IS
  'Transacción de historial_pagos_cuota que originó esta fila (solo para motivo = completar_pago_parcial). Permite borrar el comprobante exacto al eliminar el pago de la cuota, sin tocar las filas nacidas de una edición.';

CREATE INDEX IF NOT EXISTS idx_historial_comprobantes_historial_pago_cuota
  ON public.historial_comprobantes (historial_pago_cuota_id)
  WHERE historial_pago_cuota_id IS NOT NULL;

-- ============================================
-- 2. RLS: el admin de la natillera puede borrar comprobantes de sus cuotas
-- ============================================
-- Requiere public.es_superusuario() (ver 007_prestamos_rls_insert_policy.sql).

ALTER TABLE public.historial_comprobantes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'historial_comprobantes'
      AND policyname = 'historial_comprobantes_delete_admin_or_super'
  ) THEN
    DROP POLICY "historial_comprobantes_delete_admin_or_super" ON public.historial_comprobantes;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "historial_comprobantes_delete_admin_or_super"
ON public.historial_comprobantes
FOR DELETE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM public.cuotas c
    JOIN public.socios_natillera sn ON sn.id = c.socio_natillera_id
    JOIN public.natilleras n ON n.id = sn.natillera_id
    WHERE c.id = historial_comprobantes.cuota_id
      AND n.admin_id = auth.uid()
  )
);

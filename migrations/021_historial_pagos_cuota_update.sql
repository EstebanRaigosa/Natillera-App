-- ============================================
-- Migración 021: permitir ACTUALIZAR una transacción de pago de cuota
-- ============================================
--
-- Contexto
-- --------
-- `historial_pagos_cuota` tenía RLS con políticas de SELECT e INSERT (y de DELETE desde la
-- migración 019), pero ninguna de UPDATE. Con RLS activo y sin política, PostgREST responde
-- "ok" y actualiza 0 filas, sin error: el fallo queda mudo.
--
-- Eso afecta a dos flujos reales:
--   1. El ajuste del 4x1000 al editar un pago (`Cuotas.vue`), que actualiza la fila.
--   2. Eliminar el pago de una actividad desde el módulo de Actividades: hay que descontar esa
--      actividad de `valor_actividades` / `valor_total` y quitar su línea de
--      `detalle_actividades`, o al eliminar más tarde el pago de la cuota se revertiría por
--      segunda vez algo que ya no está cobrado.
--
-- Mismo criterio que el DELETE de la 019: superusuario o admin de la natillera dueña de la cuota.

ALTER TABLE public.historial_pagos_cuota ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "historial_pagos_cuota_update_admin_or_super" ON public.historial_pagos_cuota;

CREATE POLICY "historial_pagos_cuota_update_admin_or_super"
ON public.historial_pagos_cuota
FOR UPDATE
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
)
WITH CHECK (
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

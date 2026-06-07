-- Migración: Persistir el 4×1000 (GMF) en la propia cuota
--
-- Problema: el 4×1000 cobrado en pagos por transferencia solo se guardaba en
-- historial_pagos_cuota mediante un insert "fire-and-forget" (sin await). Si ese
-- insert fallaba o se abandonaba, el GMF se perdía y al reenviar el comprobante
-- ya no aparecía (la tabla cuotas no tenía dónde guardarlo).
--
-- Solución: una columna en cuotas que se actualiza de forma SÍNCRONA junto con el
-- resto del pago (valor_pagado, valor_pagado_transferencia, etc.). Solo queda > 0
-- cuando en el pago realmente se cobró 4×1000, de modo que el reenvío lo muestra
-- únicamente para los pagos que lo pagaron.

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS impuesto_4x1000 DECIMAL(12,2) DEFAULT 0;

COMMENT ON COLUMN cuotas.impuesto_4x1000 IS 'Total acumulado de 4×1000 (GMF) cobrado en los pagos por transferencia de esta cuota. Fuente confiable para mostrar el GMF al reenviar el comprobante.';

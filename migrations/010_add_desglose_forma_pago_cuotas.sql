-- Migración: Agregar desglose por forma de pago a la tabla cuotas
-- Esto permite que el cuadre de caja respete cuánto se pagó en efectivo
-- y cuánto por transferencia, incluso cuando hay pagos parciales.

-- 1. Nuevas columnas de desglose por forma de pago
ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_pagado_efectivo DECIMAL(12,2) DEFAULT 0;

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_pagado_transferencia DECIMAL(12,2) DEFAULT 0;

COMMENT ON COLUMN cuotas.valor_pagado_efectivo IS 'Parte del valor_pagado de la cuota que se recaudó en efectivo (para cuadre de caja por forma de pago)';
COMMENT ON COLUMN cuotas.valor_pagado_transferencia IS 'Parte del valor_pagado de la cuota que se recaudó por transferencia (para cuadre de caja por forma de pago)';

-- 2. Poblar datos históricos básicos para mantener coherencia del cuadre
--    Solo aplica a cuotas que ya tienen algún pago registrado.

-- Caso A: cuotas con tipo_pago = 'efectivo' (o equivalente en mayúsculas/minúsculas)
UPDATE cuotas
SET valor_pagado_efectivo = COALESCE(valor_pagado, 0),
    valor_pagado_transferencia = 0
WHERE COALESCE(valor_pagado, 0) > 0
  AND LOWER(COALESCE(tipo_pago::text, '')) = 'efectivo';

-- Caso B: cuotas con tipo_pago = 'transferencia'
UPDATE cuotas
SET valor_pagado_transferencia = COALESCE(valor_pagado, 0),
    valor_pagado_efectivo = 0
WHERE COALESCE(valor_pagado, 0) > 0
  AND LOWER(COALESCE(tipo_pago::text, '')) = 'transferencia';

-- Caso C (opcional): para cuotas con tipo_pago nulo u otro valor,
-- dejamos ambos campos en 0. El código actual usará tipo_pago y valor_pagado
-- como antes, y los nuevos pagos actualizarán correctamente el desglose.


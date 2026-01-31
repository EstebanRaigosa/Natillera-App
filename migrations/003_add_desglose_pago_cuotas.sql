-- Migración: Agregar desglose de pago (cuota, sanción, actividades) a la tabla cuotas
-- Para mostrar el total pagado discriminado cuando la cuota está pagada

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_pagado_cuota DECIMAL(12,2) DEFAULT 0;

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_pagado_sancion DECIMAL(12,2) DEFAULT 0;

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_pagado_actividades DECIMAL(12,2) DEFAULT 0;

COMMENT ON COLUMN cuotas.valor_pagado_cuota IS 'Parte del valor_pagado que corresponde a la cuota base';
COMMENT ON COLUMN cuotas.valor_pagado_sancion IS 'Parte del valor_pagado que corresponde a sanciones/multas';
COMMENT ON COLUMN cuotas.valor_pagado_actividades IS 'Parte del valor_pagado que corresponde a actividades (rifas, etc.)';

-- Para cuotas existentes pagadas: inferir desglose (no tenemos actividades en historial)
-- valor_pagado_cuota = mínimo entre valor_pagado y valor_cuota
-- valor_pagado_sancion = el excedente si valor_pagado > valor_cuota
-- valor_pagado_actividades = 0 (desconocido en datos antiguos)
UPDATE cuotas c
SET valor_pagado_cuota = LEAST(COALESCE(c.valor_pagado, 0), c.valor_cuota),
    valor_pagado_sancion = GREATEST(0, COALESCE(c.valor_pagado, 0) - c.valor_cuota),
    valor_pagado_actividades = 0
WHERE c.estado = 'pagada'
  AND COALESCE(c.valor_pagado, 0) > 0;

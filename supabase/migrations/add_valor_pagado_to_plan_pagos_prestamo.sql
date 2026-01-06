-- ============================================
-- Agregar campo valor_pagado a plan_pagos_prestamo
-- ============================================

-- Agregar columna valor_pagado si no existe
ALTER TABLE plan_pagos_prestamo 
ADD COLUMN IF NOT EXISTS valor_pagado DECIMAL(12,2) DEFAULT 0;

-- Comentario
COMMENT ON COLUMN plan_pagos_prestamo.valor_pagado IS 'Valor pagado de esta cuota (puede ser parcial)';


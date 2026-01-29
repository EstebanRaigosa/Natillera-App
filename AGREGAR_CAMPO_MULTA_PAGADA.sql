-- Uso del campo valor_pagado_sancion en la tabla cuotas
-- Este campo ya existe; almacena el valor abonado por sanciones/multas.
-- Regla de abono: primero se abona a la sanción, luego a la cuota.
-- El comprobante muestra este valor como "Multa".

-- Opcional: asegurar valor por defecto si la columna permite NULL
-- ALTER TABLE cuotas ALTER COLUMN valor_pagado_sancion SET DEFAULT 0;

-- Opcional: rellenar datos existentes donde valor_pagado > valor_cuota
-- (cuando la sanción pagada no estaba en valor_pagado_sancion)
UPDATE cuotas
SET valor_pagado_sancion = LEAST(
  GREATEST(COALESCE(valor_pagado, 0) - COALESCE(valor_cuota, 0), 0),
  COALESCE(valor_multa, 0)
)
WHERE COALESCE(valor_pagado, 0) > COALESCE(valor_cuota, 0)
  AND (valor_pagado_sancion IS NULL OR valor_pagado_sancion = 0);

-- ============================================================
-- Eliminar columna multa_pagada (redundante; se usa valor_pagado_sancion)
-- ============================================================
-- Si la columna multa_pagada existe y tiene datos, copiarlos a valor_pagado_sancion antes:
-- UPDATE cuotas SET valor_pagado_sancion = COALESCE(multa_pagada, 0) WHERE multa_pagada IS NOT NULL;

ALTER TABLE cuotas DROP COLUMN IF EXISTS multa_pagada;

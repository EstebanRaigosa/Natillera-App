-- Agregar campo codigo_comprobante a la tabla pagos_prestamo
-- Este campo almacenará el código único de comprobante para cada abono

ALTER TABLE pagos_prestamo 
ADD COLUMN IF NOT EXISTS codigo_comprobante VARCHAR(8);

-- Crear índice para búsquedas rápidas por código
CREATE INDEX IF NOT EXISTS idx_pagos_prestamo_codigo_comprobante 
ON pagos_prestamo(codigo_comprobante);

-- Comentario en la columna
COMMENT ON COLUMN pagos_prestamo.codigo_comprobante IS 'Código único de comprobante para validación del abono';


-- Agregar campo codigo_comprobante a la tabla cuotas
ALTER TABLE cuotas 
ADD COLUMN IF NOT EXISTS codigo_comprobante VARCHAR(20) UNIQUE;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_cuotas_codigo_comprobante ON cuotas(codigo_comprobante);


-- ============================================
-- MIGRACIÓN: Agregar campo valor_multa a cuotas
-- Permite aplicar sanciones configuradas por mora
-- ============================================

-- Agregar campo valor_multa a la tabla cuotas
ALTER TABLE cuotas 
ADD COLUMN IF NOT EXISTS valor_multa DECIMAL(12,2) DEFAULT 0;

-- Agregar campo fecha_mora para registrar cuándo entró en mora
ALTER TABLE cuotas 
ADD COLUMN IF NOT EXISTS fecha_mora DATE;

-- Comentario para documentación
COMMENT ON COLUMN cuotas.valor_multa IS 'Valor de la multa aplicada por mora según configuración de la natillera';
COMMENT ON COLUMN cuotas.fecha_mora IS 'Fecha en que la cuota entró en estado de mora';

-- Actualizar cuotas existentes en mora sin multa (opcional, poner en 0)
UPDATE cuotas 
SET valor_multa = 0, fecha_mora = fecha_limite::date + INTERVAL '1 day'
WHERE estado = 'mora' AND valor_multa IS NULL;


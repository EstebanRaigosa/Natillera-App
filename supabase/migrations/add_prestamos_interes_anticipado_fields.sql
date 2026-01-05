-- Migración: Agregar campos para interés anticipado en préstamos
-- Esta migración agrega campos para guardar información sobre interés anticipado

-- Agregar campos a la tabla prestamos
ALTER TABLE prestamos 
ADD COLUMN IF NOT EXISTS tipo_interes VARCHAR(20) DEFAULT 'simple' CHECK (tipo_interes IN ('simple', 'compuesto')),
ADD COLUMN IF NOT EXISTS interes_anticipado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interes_total DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS numero_cuotas INTEGER DEFAULT 1;

-- Comentarios para documentación
COMMENT ON COLUMN prestamos.tipo_interes IS 'Tipo de interés: simple o compuesto';
COMMENT ON COLUMN prestamos.interes_anticipado IS 'Indica si el interés se cobra por adelantado';
COMMENT ON COLUMN prestamos.interes_total IS 'Interés total calculado del préstamo';
COMMENT ON COLUMN prestamos.numero_cuotas IS 'Número de cuotas del préstamo';


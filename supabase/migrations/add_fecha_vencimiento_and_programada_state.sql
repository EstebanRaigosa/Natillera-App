-- Migración: Agregar fecha_vencimiento y estado programada
-- ============================================

-- 1. Agregar columna fecha_vencimiento (sin días de gracia)
ALTER TABLE cuotas 
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

-- 2. Actualizar el CHECK constraint para incluir 'programada'
ALTER TABLE cuotas 
DROP CONSTRAINT IF EXISTS cuotas_estado_check;

ALTER TABLE cuotas 
ADD CONSTRAINT cuotas_estado_check 
CHECK (estado IN ('programada', 'pendiente', 'pagada', 'parcial', 'mora'));

-- 3. Para cuotas existentes, calcular fecha_vencimiento restando días de gracia de fecha_limite
-- Nota: Esto requiere obtener los días de gracia de cada natillera
-- Por ahora, estableceremos fecha_vencimiento = fecha_limite para cuotas existentes
-- y se actualizará correctamente cuando se regeneren las cuotas
UPDATE cuotas 
SET fecha_vencimiento = fecha_limite 
WHERE fecha_vencimiento IS NULL;

-- 4. Establecer fecha_vencimiento como NOT NULL después de actualizar los valores existentes
ALTER TABLE cuotas 
ALTER COLUMN fecha_vencimiento SET NOT NULL;


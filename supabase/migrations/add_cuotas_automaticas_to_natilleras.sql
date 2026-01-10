-- Agregar columna cuotas_automaticas a la tabla natilleras
-- Esta columna controla si se generan automáticamente las cuotas para todo el período
-- cuando se agrega un nuevo socio a la natillera

-- Agregar la columna si no existe
ALTER TABLE natilleras ADD COLUMN IF NOT EXISTS cuotas_automaticas BOOLEAN DEFAULT true;

-- Comentario explicativo
COMMENT ON COLUMN natilleras.cuotas_automaticas IS 'Si está activo (true), al agregar un nuevo socio se generarán automáticamente todas las cuotas del período de la natillera';

-- Actualizar natilleras existentes para que tengan el valor por defecto
UPDATE natilleras SET cuotas_automaticas = true WHERE cuotas_automaticas IS NULL;


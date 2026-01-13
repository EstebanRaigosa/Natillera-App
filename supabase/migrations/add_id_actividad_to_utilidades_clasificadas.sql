-- ============================================
-- Agregar campo id_actividad a utilidades_clasificadas
-- Este campo permite tener registros individuales por préstamo/actividad
-- ============================================

-- Agregar columna id_actividad (opcional, para referenciar préstamos o actividades específicas)
ALTER TABLE utilidades_clasificadas 
ADD COLUMN IF NOT EXISTS id_actividad UUID;

-- Agregar comentario
COMMENT ON COLUMN utilidades_clasificadas.id_actividad IS 'ID de la actividad o préstamo específico. Para préstamos, almacena el prestamo_id. Para actividades, almacena el actividad_id. NULL si es un registro consolidado.';

-- Crear índice para mejorar búsquedas por id_actividad
CREATE INDEX IF NOT EXISTS idx_utilidades_clasificadas_id_actividad ON utilidades_clasificadas(id_actividad);

-- Eliminar el constraint UNIQUE anterior que incluía solo (natillera_id, tipo, fecha_cierre)
ALTER TABLE utilidades_clasificadas 
DROP CONSTRAINT IF EXISTS utilidades_clasificadas_natillera_id_tipo_fecha_cierre_key;

-- Crear nuevo constraint único que permite múltiples registros del mismo tipo
-- cuando tienen diferentes id_actividad
-- Para registros con id_actividad (préstamos individuales): único por (natillera_id, tipo, id_actividad, fecha_cierre)
-- Para registros sin id_actividad (consolidados): único por (natillera_id, tipo, fecha_cierre)
CREATE UNIQUE INDEX IF NOT EXISTS utilidades_clasificadas_unique_with_id_actividad 
ON utilidades_clasificadas(natillera_id, tipo, fecha_cierre, id_actividad);

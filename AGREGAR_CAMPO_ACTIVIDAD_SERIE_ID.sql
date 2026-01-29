-- ============================================
-- AGREGAR CAMPO ACTIVIDAD_SERIE_ID A ACTIVIDADES
-- ============================================
-- Este script agrega el campo actividad_serie_id para agrupar
-- actividades que se repiten en diferentes meses y pertenecen
-- a la misma serie o grupo de actividades

-- Agregar campo a la tabla actividades
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS actividad_serie_id UUID;

-- Comentario para documentación
COMMENT ON COLUMN actividades.actividad_serie_id IS 'ID que agrupa actividades que se repiten en diferentes meses y pertenecen a la misma serie. NULL para actividades únicas que no se repiten.';

-- Crear índice para mejorar consultas de actividades agrupadas
CREATE INDEX IF NOT EXISTS idx_actividades_serie_id ON actividades(actividad_serie_id) WHERE actividad_serie_id IS NOT NULL;

-- Opcional: Crear índice compuesto para consultas por natillera y serie
CREATE INDEX IF NOT EXISTS idx_actividades_natillera_serie ON actividades(natillera_id, actividad_serie_id) WHERE actividad_serie_id IS NOT NULL;

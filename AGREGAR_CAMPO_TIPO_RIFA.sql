-- ============================================
-- AGREGAR CAMPO TIPO_RIFA A ACTIVIDADES
-- ============================================
-- Este script agrega el campo tipo_rifa para diferenciar entre
-- rifa manual y rifa automática

-- Agregar campo a la tabla actividades
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS tipo_rifa VARCHAR(20);

-- Comentario para documentación
COMMENT ON COLUMN actividades.tipo_rifa IS 'Tipo de rifa: "manual" (selección manual de números) o "aleatoria" (asignación aleatoria). Solo aplica cuando tipo = "rifa". NULL para otros tipos de actividad.';

-- Crear índice para mejorar consultas (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_actividades_tipo_rifa ON actividades(tipo_rifa) WHERE tipo_rifa IS NOT NULL;

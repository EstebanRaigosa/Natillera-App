-- ============================================
-- AGREGAR CAMPO VALOR_RIFA A ACTIVIDADES
-- ============================================
-- Este script agrega el campo valor_rifa para almacenar
-- el valor por defecto de cada número en rifas manuales

-- Agregar campo a la tabla actividades
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS valor_rifa DECIMAL(12, 2);

-- Comentario para documentación
COMMENT ON COLUMN actividades.valor_rifa IS 'Valor por defecto para cada número de rifa manual. Se usa como valor predeterminado al vender un número.';

-- Crear índice para mejorar consultas (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_actividades_valor_rifa ON actividades(valor_rifa) WHERE valor_rifa IS NOT NULL;

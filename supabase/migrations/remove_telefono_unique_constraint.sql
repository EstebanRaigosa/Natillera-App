-- Migración: Eliminar restricción UNIQUE del campo telefono
-- Ahora el teléfono debe ser único solo dentro de cada natillera (validación a nivel de aplicación)
-- ============================================

-- Eliminar restricción UNIQUE del campo telefono
DO $$
BEGIN
    -- Eliminar restricción UNIQUE existente si existe
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'socios_telefono_key' 
        AND conrelid = 'socios'::regclass
    ) THEN
        ALTER TABLE socios DROP CONSTRAINT socios_telefono_key;
    END IF;
    
    -- Eliminar índice único existente si existe
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'socios' 
        AND indexname = 'socios_telefono_key'
    ) THEN
        DROP INDEX IF EXISTS socios_telefono_key;
    END IF;
END $$;

-- Comentario para documentación
COMMENT ON COLUMN socios.telefono IS 'Número de teléfono del socio. Campo obligatorio (NOT NULL). La unicidad se valida a nivel de aplicación por natillera (un teléfono puede existir en múltiples natilleras, pero debe ser único dentro de cada natillera).';


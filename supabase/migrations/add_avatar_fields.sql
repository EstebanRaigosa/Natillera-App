-- Migración: Agregar campos de avatar a la tabla socios
-- ============================================

-- Agregar campo avatar_seed si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'socios' 
        AND column_name = 'avatar_seed'
    ) THEN
        ALTER TABLE socios ADD COLUMN avatar_seed VARCHAR(100);
    END IF;
END $$;

-- Agregar campo avatar_style si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'socios' 
        AND column_name = 'avatar_style'
    ) THEN
        ALTER TABLE socios ADD COLUMN avatar_style VARCHAR(50) DEFAULT 'adventurer';
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON COLUMN socios.avatar_seed IS 'Seed utilizado para generar el avatar del socio (nombre o identificador único)';
COMMENT ON COLUMN socios.avatar_style IS 'Estilo de avatar de DiceBear utilizado (adventurer, avataaars, big-smile, bottts, lorelei, micah, miniavs, open-peeps, personas)';


-- ============================================
-- MIGRACIÓN: Agregar campo avatar_seed a natilleras
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- Agregar columna avatar_seed si no existe
ALTER TABLE natilleras 
ADD COLUMN IF NOT EXISTS avatar_seed VARCHAR(255);

-- Actualizar natilleras existentes para que usen su nombre como seed
UPDATE natilleras 
SET avatar_seed = nombre 
WHERE avatar_seed IS NULL;

-- Comentario en la columna
COMMENT ON COLUMN natilleras.avatar_seed IS 'Seed único para generar el avatar distintivo de la natillera usando DiceBear API';


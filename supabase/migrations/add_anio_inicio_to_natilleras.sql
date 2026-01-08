-- ============================================
-- MIGRACIÓN: Agregar campo anio_inicio a natilleras
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- Agregar columna anio_inicio a la tabla natilleras
-- Esto permite que el período de una natillera cruce de un año a otro
-- Por ejemplo: Diciembre 2025 -> Noviembre 2026

ALTER TABLE natilleras 
ADD COLUMN IF NOT EXISTS anio_inicio INTEGER;

-- Establecer valor por defecto basado en el año existente
-- Para natilleras existentes, asumimos que el año de inicio es el mismo que el año de fin
UPDATE natilleras 
SET anio_inicio = anio 
WHERE anio_inicio IS NULL;

-- Agregar constraint para validar el año
ALTER TABLE natilleras 
ADD CONSTRAINT check_anio_inicio 
CHECK (anio_inicio IS NULL OR (anio_inicio >= 2020 AND anio_inicio <= 2100));

-- Comentario para documentación
COMMENT ON COLUMN natilleras.anio_inicio IS 'Año de inicio del período de la natillera. Permite períodos que cruzan años (ej: Dic 2025 - Nov 2026)';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================

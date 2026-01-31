-- Migración: Agregar campos nombre_usuario y nombre_natillera a la tabla socios_actividad
-- Ejecutar en Supabase SQL Editor o en tu base de datos PostgreSQL

ALTER TABLE socios_actividad
ADD COLUMN IF NOT EXISTS nombre_usuario TEXT;

ALTER TABLE socios_actividad
ADD COLUMN IF NOT EXISTS nombre_natillera TEXT;

COMMENT ON COLUMN socios_actividad.nombre_usuario IS 'Nombre del usuario que creó el registro o registró el pago';
COMMENT ON COLUMN socios_actividad.nombre_natillera IS 'Nombre de la natillera a la que pertenece la actividad';

-- Actualizar registros existentes: traer el nombre del socio desde socios
-- (socios_actividad.socio_natillera_id -> socios_natillera.id -> socios_natillera.socio_id -> socios.nombre)
UPDATE socios_actividad sa
SET nombre_usuario = s.nombre
FROM socios_natillera sn
JOIN socios s ON s.id = sn.socio_id
WHERE sa.socio_natillera_id = sn.id
  AND sa.nombre_usuario IS NULL;

-- Actualizar registros existentes: traer el nombre de la natillera desde natilleras
-- (socios_actividad.actividad_id -> actividades.natillera_id -> natilleras.nombre)
UPDATE socios_actividad sa
SET nombre_natillera = n.nombre
FROM actividades a
JOIN natilleras n ON n.id = a.natillera_id
WHERE sa.actividad_id = a.id
  AND sa.nombre_natillera IS NULL;

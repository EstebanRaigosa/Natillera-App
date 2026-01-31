-- Migración: Agregar campos nombre_socio y nombre_natillera a la tabla cuotas
-- Ejecutar en Supabase SQL Editor o en tu base de datos PostgreSQL

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS nombre_socio TEXT;

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS nombre_natillera TEXT;

COMMENT ON COLUMN cuotas.nombre_socio IS 'Nombre del socio al que pertenece la cuota';
COMMENT ON COLUMN cuotas.nombre_natillera IS 'Nombre de la natillera a la que pertenece la cuota';

-- Actualizar registros existentes: traer el nombre del socio desde socios
-- (cuotas.socio_natillera_id -> socios_natillera.id -> socios_natillera.socio_id -> socios.nombre)
UPDATE cuotas c
SET nombre_socio = s.nombre
FROM socios_natillera sn
JOIN socios s ON s.id = sn.socio_id
WHERE c.socio_natillera_id = sn.id
  AND c.nombre_socio IS NULL;

-- Actualizar registros existentes: traer el nombre de la natillera desde natilleras
-- (cuotas.socio_natillera_id -> socios_natillera.id -> socios_natillera.natillera_id -> natilleras.nombre)
UPDATE cuotas c
SET nombre_natillera = n.nombre
FROM socios_natillera sn
JOIN natilleras n ON n.id = sn.natillera_id
WHERE c.socio_natillera_id = sn.id
  AND c.nombre_natillera IS NULL;

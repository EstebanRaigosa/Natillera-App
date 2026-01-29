-- ============================================
-- AGREGAR CAMPOS nombre_socio y nombre_natillera A socios_actividad
-- ============================================
-- Este script agrega los campos nombre_socio y nombre_natillera
-- a la tabla socios_actividad para almacenar los nombres directamente
-- y facilitar consultas y reportes sin necesidad de joins.

-- Paso 1: Agregar columna nombre_socio
ALTER TABLE socios_actividad
ADD COLUMN IF NOT EXISTS nombre_socio VARCHAR(255);

-- Paso 2: Agregar columna nombre_natillera
ALTER TABLE socios_actividad
ADD COLUMN IF NOT EXISTS nombre_natillera VARCHAR(255);

-- Paso 3: Actualizar registros existentes con los nombres correspondientes
-- (Opcional: solo si quieres actualizar datos existentes)
UPDATE socios_actividad sa
SET 
  nombre_socio = s.nombre,
  nombre_natillera = n.nombre
FROM socios_natillera sn
JOIN socios s ON sn.socio_id = s.id
JOIN natilleras n ON sn.natillera_id = n.id
WHERE sa.socio_natillera_id = sn.id
  AND (sa.nombre_socio IS NULL OR sa.nombre_natillera IS NULL);

-- Nota: Los nuevos registros se crearán automáticamente con estos campos
-- gracias a la actualización del código en Actividades.vue
``````````````````````````
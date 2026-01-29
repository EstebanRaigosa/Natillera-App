-- ============================================
-- FIX: RESTAURAR RESTRICCIÓN ÚNICA ORIGINAL DE socios_actividad
-- ============================================
-- Este script restaura la restricción única original de socios_actividad
-- 
-- NOTA: Con el nuevo funcionamiento, se crea UNA actividad por cada mes seleccionado,
-- por lo que cada actividad es única y no necesitamos incluir mes_pago en la restricción única.
-- La restricción original UNIQUE(actividad_id, socio_natillera_id) es suficiente.

-- Paso 1: Eliminar la restricción única que incluye mes_pago (si existe)
ALTER TABLE socios_actividad 
DROP CONSTRAINT IF EXISTS socios_actividad_actividad_socio_periodo_key;

-- Paso 2: Restaurar la restricción única original
-- Esta restricción asegura que un socio solo puede tener un registro por actividad
-- Nota: PostgreSQL no soporta IF NOT EXISTS con ADD CONSTRAINT, por lo que usamos un bloque DO
DO $$
BEGIN
    -- Intentar agregar la restricción, si ya existe se ignorará el error
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'socios_actividad_actividad_id_socio_natillera_id_key'
    ) THEN
        ALTER TABLE socios_actividad
        ADD CONSTRAINT socios_actividad_actividad_id_socio_natillera_id_key
        UNIQUE(actividad_id, socio_natillera_id);
    END IF;
END $$;

-- Nota: Los campos mes_pago, anio_pago, quincena_pago y fecha_limite_pago en socios_actividad
-- ya no son necesarios para la restricción única, pero se mantienen en la tabla para
-- compatibilidad y posibles usos futuros. Estos campos se pueden eliminar más adelante
-- si se confirma que no son necesarios.

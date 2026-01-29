-- ============================================
-- AGREGAR CAMPOS DE PERÍODO Y QUINCENA A ACTIVIDADES
-- ============================================
-- Este script agrega campos para almacenar el período y quincena
-- en que se debe pagar el valor de una actividad

-- Agregar campos a la tabla actividades
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS mes_pago INTEGER,
ADD COLUMN IF NOT EXISTS anio_pago INTEGER,
ADD COLUMN IF NOT EXISTS quincena_pago INTEGER;

-- Comentarios para documentación
COMMENT ON COLUMN actividades.mes_pago IS 'Mes en que se debe pagar el valor de la actividad (1-12)';
COMMENT ON COLUMN actividades.anio_pago IS 'Año en que se debe pagar el valor de la actividad';
COMMENT ON COLUMN actividades.quincena_pago IS 'Quincena en que se debe pagar (1 o 2, solo si la natillera es quincenal, NULL si es mensual)';

-- Agregar campos a la tabla socios_actividad para soportar múltiples meses
ALTER TABLE socios_actividad
ADD COLUMN IF NOT EXISTS mes_pago INTEGER,
ADD COLUMN IF NOT EXISTS anio_pago INTEGER,
ADD COLUMN IF NOT EXISTS quincena_pago INTEGER,
ADD COLUMN IF NOT EXISTS fecha_limite_pago DATE;

-- Comentarios para documentación
COMMENT ON COLUMN socios_actividad.mes_pago IS 'Mes específico en que se debe pagar este registro (1-12)';
COMMENT ON COLUMN socios_actividad.anio_pago IS 'Año específico en que se debe pagar este registro';
COMMENT ON COLUMN socios_actividad.quincena_pago IS 'Quincena específica en que se debe pagar (1 o 2, solo si la natillera es quincenal, NULL si es mensual)';
COMMENT ON COLUMN socios_actividad.fecha_limite_pago IS 'Fecha límite específica de pago para este registro (calculada según mes, año y quincena)';

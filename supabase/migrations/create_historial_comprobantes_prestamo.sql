-- Migración: Crear tabla historial_comprobantes_prestamo
-- ============================================
-- Esta tabla almacena el historial de cambios en los códigos de comprobantes
-- para mantener la trazabilidad cuando se actualiza o elimina un comprobante de abono

-- 1. Crear tabla historial_comprobantes_prestamo
CREATE TABLE IF NOT EXISTS historial_comprobantes_prestamo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pago_prestamo_id UUID REFERENCES pagos_prestamo(id) ON DELETE SET NULL,
    codigo_comprobante_anterior VARCHAR(20) NOT NULL,
    codigo_comprobante_nuevo VARCHAR(20),
    valor_abono_anterior DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_abono_nuevo DECIMAL(12,2) NOT NULL DEFAULT 0,
    motivo VARCHAR(50) NOT NULL DEFAULT 'actualizacion_pago',
    eliminado BOOLEAN DEFAULT FALSE,
    eliminado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    eliminado_por_email VARCHAR(255),
    eliminado_el TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas adicionales si no existen
DO $$ 
BEGIN
    -- Agregar prestamo_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'prestamo_id'
    ) THEN
        ALTER TABLE historial_comprobantes_prestamo
        ADD COLUMN prestamo_id UUID REFERENCES prestamos(id) ON DELETE SET NULL;
    END IF;

    -- Agregar socio_natillera_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'socio_natillera_id'
    ) THEN
        ALTER TABLE historial_comprobantes_prestamo
        ADD COLUMN socio_natillera_id UUID REFERENCES socios_natillera(id) ON DELETE SET NULL;
    END IF;

    -- Cambiar pago_prestamo_id para permitir NULL si no lo permite
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'pago_prestamo_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE historial_comprobantes_prestamo
        ALTER COLUMN pago_prestamo_id DROP NOT NULL;
    END IF;
END $$;

-- 2. Crear índices para búsquedas rápidas
-- Índice para buscar por código anterior (búsqueda principal)
CREATE INDEX IF NOT EXISTS idx_historial_prestamo_codigo_anterior 
ON historial_comprobantes_prestamo(codigo_comprobante_anterior);

-- Índice para buscar por código nuevo
CREATE INDEX IF NOT EXISTS idx_historial_prestamo_codigo_nuevo 
ON historial_comprobantes_prestamo(codigo_comprobante_nuevo);

-- Índice para buscar por pago_prestamo_id
CREATE INDEX IF NOT EXISTS idx_historial_prestamo_pago_id 
ON historial_comprobantes_prestamo(pago_prestamo_id);

-- Índice para buscar por eliminado
CREATE INDEX IF NOT EXISTS idx_historial_prestamo_eliminado 
ON historial_comprobantes_prestamo(eliminado);

-- Índice compuesto para búsquedas por fecha y pago
CREATE INDEX IF NOT EXISTS idx_historial_prestamo_fecha_pago 
ON historial_comprobantes_prestamo(pago_prestamo_id, fecha_actualizacion DESC);

-- Crear índices para las columnas adicionales (después de que se agreguen)
DO $$ 
BEGIN
    -- Índice para buscar por prestamo_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'prestamo_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'historial_comprobantes_prestamo' 
        AND indexname = 'idx_historial_prestamo_prestamo_id'
    ) THEN
        CREATE INDEX idx_historial_prestamo_prestamo_id 
        ON historial_comprobantes_prestamo(prestamo_id);
    END IF;

    -- Índice para buscar por socio_natillera_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'socio_natillera_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'historial_comprobantes_prestamo' 
        AND indexname = 'idx_historial_prestamo_socio_natillera_id'
    ) THEN
        CREATE INDEX idx_historial_prestamo_socio_natillera_id 
        ON historial_comprobantes_prestamo(socio_natillera_id);
    END IF;
END $$;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE historial_comprobantes_prestamo ENABLE ROW LEVEL SECURITY;

-- 4. Política RLS: Los usuarios solo pueden ver el historial de comprobantes
-- de las natilleras a las que tienen acceso
-- Nota: Esta política funciona con o sin las columnas prestamo_id y socio_natillera_id
DROP POLICY IF EXISTS "Los usuarios pueden ver historial de sus natilleras" ON historial_comprobantes_prestamo;
CREATE POLICY "Los usuarios pueden ver historial de sus natilleras"
ON historial_comprobantes_prestamo
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM socios_natillera sn
        INNER JOIN natilleras n ON sn.natillera_id = n.id
        WHERE (
            -- Usar pago_prestamo_id (siempre disponible)
            (historial_comprobantes_prestamo.pago_prestamo_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM pagos_prestamo pp
                 INNER JOIN prestamos p ON pp.prestamo_id = p.id
                 WHERE pp.id = historial_comprobantes_prestamo.pago_prestamo_id
                 AND p.socio_natillera_id = sn.id
             ))
        )
        AND (
            n.admin_id = auth.uid()
            OR public.es_superusuario()
        )
    )
);

-- Política RLS: Solo los administradores pueden insertar en el historial
-- Nota: Simplificada para evitar problemas con NEW. La validación se hace en la aplicación.
DROP POLICY IF EXISTS "Solo administradores pueden insertar historial" ON historial_comprobantes_prestamo;
CREATE POLICY "Solo administradores pueden insertar historial"
ON historial_comprobantes_prestamo
FOR INSERT
WITH CHECK (
    public.es_superusuario()
    OR EXISTS (
        SELECT 1 FROM natilleras WHERE admin_id = auth.uid()
    )
);

-- 5. Comentarios en la tabla y columnas para documentación
COMMENT ON TABLE historial_comprobantes_prestamo IS 'Historial de cambios en códigos de comprobantes de abonos a préstamos para mantener trazabilidad';
COMMENT ON COLUMN historial_comprobantes_prestamo.pago_prestamo_id IS 'ID del pago de préstamo asociado (puede ser NULL si fue eliminado)';
COMMENT ON COLUMN historial_comprobantes_prestamo.codigo_comprobante_anterior IS 'Código de comprobante antes de la actualización o eliminación';
COMMENT ON COLUMN historial_comprobantes_prestamo.codigo_comprobante_nuevo IS 'Nuevo código de comprobante después de la actualización (NULL si fue eliminado)';
COMMENT ON COLUMN historial_comprobantes_prestamo.valor_abono_anterior IS 'Valor del abono antes de la actualización';
COMMENT ON COLUMN historial_comprobantes_prestamo.valor_abono_nuevo IS 'Nuevo valor del abono después de la actualización';
COMMENT ON COLUMN historial_comprobantes_prestamo.motivo IS 'Motivo de la actualización (ej: actualizacion_pago, eliminacion_pago)';
COMMENT ON COLUMN historial_comprobantes_prestamo.eliminado IS 'Indica si el pago fue eliminado';
COMMENT ON COLUMN historial_comprobantes_prestamo.eliminado_por IS 'ID del usuario que eliminó el pago';
COMMENT ON COLUMN historial_comprobantes_prestamo.eliminado_el IS 'Fecha y hora en que se eliminó el pago';
COMMENT ON COLUMN historial_comprobantes_prestamo.fecha_actualizacion IS 'Fecha y hora en que se realizó la actualización';

-- Agregar comentarios para las columnas adicionales si existen
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'prestamo_id'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN historial_comprobantes_prestamo.prestamo_id IS ''ID del préstamo asociado (guardado directamente para casos de eliminación)''';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'socio_natillera_id'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN historial_comprobantes_prestamo.socio_natillera_id IS ''ID del socio_natillera asociado (guardado directamente para casos de eliminación)''';
    END IF;
END $$;


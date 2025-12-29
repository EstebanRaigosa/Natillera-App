-- Migración: Crear tabla historial_comprobantes
-- ============================================
-- Esta tabla almacena el historial de cambios en los códigos de comprobantes
-- para mantener la trazabilidad cuando se actualiza un comprobante

-- 1. Crear tabla historial_comprobantes
CREATE TABLE IF NOT EXISTS historial_comprobantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cuota_id UUID NOT NULL REFERENCES cuotas(id) ON DELETE CASCADE,
    codigo_comprobante_anterior VARCHAR(20) NOT NULL,
    codigo_comprobante_nuevo VARCHAR(20) NOT NULL,
    valor_pagado_anterior DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_pagado_nuevo DECIMAL(12,2) NOT NULL DEFAULT 0,
    motivo VARCHAR(50) NOT NULL DEFAULT 'actualizacion_pago',
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para búsquedas rápidas
-- Índice para buscar por código anterior (búsqueda principal)
CREATE INDEX IF NOT EXISTS idx_historial_codigo_anterior 
ON historial_comprobantes(codigo_comprobante_anterior);

-- Índice para buscar por código nuevo
CREATE INDEX IF NOT EXISTS idx_historial_codigo_nuevo 
ON historial_comprobantes(codigo_comprobante_nuevo);

-- Índice para buscar por cuota_id (para obtener historial de una cuota específica)
CREATE INDEX IF NOT EXISTS idx_historial_cuota_id 
ON historial_comprobantes(cuota_id);

-- Índice compuesto para búsquedas por fecha y cuota
CREATE INDEX IF NOT EXISTS idx_historial_fecha_cuota 
ON historial_comprobantes(cuota_id, fecha_actualizacion DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE historial_comprobantes ENABLE ROW LEVEL SECURITY;

-- 4. Política RLS: Los usuarios solo pueden ver el historial de comprobantes
-- de las natilleras a las que tienen acceso
CREATE POLICY "Los usuarios pueden ver historial de sus natilleras"
ON historial_comprobantes
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM cuotas c
        INNER JOIN socios_natillera sn ON c.socio_natillera_id = sn.id
        INNER JOIN natilleras n ON sn.natillera_id = n.id
        WHERE c.id = historial_comprobantes.cuota_id
        AND (
            n.admin_id = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM socios_natillera sn2
                WHERE sn2.natillera_id = n.id
                AND sn2.socio_id IN (
                    SELECT id FROM socios WHERE id = sn2.socio_id
                )
            )
        )
    )
);

-- Política RLS: Solo los administradores pueden insertar en el historial
-- (esto se hace automáticamente desde la aplicación)
CREATE POLICY "Solo administradores pueden insertar historial"
ON historial_comprobantes
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM cuotas c
        INNER JOIN socios_natillera sn ON c.socio_natillera_id = sn.id
        INNER JOIN natilleras n ON sn.natillera_id = n.id
        WHERE c.id = historial_comprobantes.cuota_id
        AND n.admin_id = auth.uid()
    )
);

-- 5. Comentarios en la tabla y columnas para documentación
COMMENT ON TABLE historial_comprobantes IS 'Historial de cambios en códigos de comprobantes para mantener trazabilidad';
COMMENT ON COLUMN historial_comprobantes.cuota_id IS 'ID de la cuota asociada';
COMMENT ON COLUMN historial_comprobantes.codigo_comprobante_anterior IS 'Código de comprobante antes de la actualización';
COMMENT ON COLUMN historial_comprobantes.codigo_comprobante_nuevo IS 'Nuevo código de comprobante después de la actualización';
COMMENT ON COLUMN historial_comprobantes.valor_pagado_anterior IS 'Valor pagado antes de la actualización';
COMMENT ON COLUMN historial_comprobantes.valor_pagado_nuevo IS 'Nuevo valor pagado después de la actualización';
COMMENT ON COLUMN historial_comprobantes.motivo IS 'Motivo de la actualización (ej: actualizacion_pago, registro_pago)';
COMMENT ON COLUMN historial_comprobantes.fecha_actualizacion IS 'Fecha y hora en que se realizó la actualización';


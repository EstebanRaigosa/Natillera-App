-- Migración: Sistema de Auditoría Completo
-- ============================================
-- Este sistema permite llevar trazabilidad completa de todos los movimientos y modificaciones

-- Eliminar la tabla historial antigua si existe (migración)
DROP TABLE IF EXISTS historial CASCADE;

-- ============================================
-- TABLA: auditoria
-- Registro completo de todas las acciones realizadas en el sistema
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Usuario que realizó la acción
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario_email VARCHAR(255), -- Email del usuario (backup si se elimina)
    usuario_nombre VARCHAR(255), -- Nombre del usuario (backup)
    
    -- Contexto de la acción
    natillera_id UUID REFERENCES natilleras(id) ON DELETE CASCADE,
    natillera_nombre VARCHAR(255), -- Nombre de la natillera (backup)
    
    -- Tipo de acción y entidad
    tipo_accion VARCHAR(50) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID, -- ID de la entidad afectada
    
    -- Descripción legible de la acción
    descripcion TEXT NOT NULL,
    
    -- Datos antes y después del cambio (para UPDATE)
    datos_anteriores JSONB, -- Estado anterior de la entidad
    datos_nuevos JSONB, -- Estado nuevo de la entidad
    
    -- Detalles adicionales
    detalles JSONB, -- Información adicional específica de la acción
    cambios JSONB, -- Solo los campos que cambiaron (para UPDATE)
    
    -- Metadatos
    ip_address VARCHAR(45), -- Dirección IP del usuario
    user_agent TEXT, -- User agent del navegador
    metadata JSONB, -- Otros metadatos adicionales
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar constraints si no existen
DO $$ 
BEGIN
    -- Constraint para tipo_accion
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'auditoria_tipo_accion_check'
    ) THEN
        ALTER TABLE auditoria ADD CONSTRAINT auditoria_tipo_accion_check 
        CHECK (tipo_accion IN (
            'CREATE', 'UPDATE', 'DELETE', 'GENERATE', 'REGISTER', 'CANCEL', 'APPROVE', 'REJECT'
        ));
    END IF;
    
    -- Constraint para entidad
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'auditoria_entidad_check'
    ) THEN
        ALTER TABLE auditoria ADD CONSTRAINT auditoria_entidad_check 
        CHECK (entidad IN (
            'natillera', 'socio', 'socio_natillera', 'cuota', 'pago', 'comprobante', 
            'prestamo', 'pago_prestamo', 'actividad', 'multa', 'configuracion'
        ));
    END IF;
END $$;

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_natillera_id ON auditoria(natillera_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tipo_accion ON auditoria(tipo_accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad_id ON auditoria(entidad_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON auditoria(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_natillera_fecha ON auditoria(natillera_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad_tipo ON auditoria(entidad, tipo_accion);

-- Índice compuesto para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_auditoria_natillera_entidad_fecha 
    ON auditoria(natillera_id, entidad, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver el historial de auditoría de sus natilleras
CREATE POLICY "Users can view audit logs of their natilleras" ON auditoria
FOR SELECT USING (
    -- Pueden ver registros de sus natilleras (como admin)
    natillera_id IN (
        SELECT id FROM natilleras WHERE admin_id = auth.uid()
    )
    -- O registros donde ellos son el usuario que realizó la acción
    OR usuario_id = auth.uid()
);

-- Política: Los usuarios autenticados pueden insertar registros de auditoría
-- (Se hace desde el cliente cuando realizan acciones)
CREATE POLICY "Authenticated users can insert audit logs" ON auditoria
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
        -- Solo pueden insertar registros donde ellos son el usuario
        usuario_id = auth.uid()
        -- O donde la natillera pertenece a ellos
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
    )
);

-- ============================================
-- FUNCIÓN: Registrar auditoría automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION registrar_auditoria(
    p_usuario_id UUID,
    p_tipo_accion VARCHAR(50),
    p_entidad VARCHAR(50),
    p_descripcion TEXT,
    p_usuario_email VARCHAR(255) DEFAULT NULL,
    p_natillera_id UUID DEFAULT NULL,
    p_natillera_nombre VARCHAR(255) DEFAULT NULL,
    p_entidad_id UUID DEFAULT NULL,
    p_datos_anteriores JSONB DEFAULT NULL,
    p_datos_nuevos JSONB DEFAULT NULL,
    p_detalles JSONB DEFAULT NULL,
    p_cambios JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_auditoria_id UUID;
    v_natillera_nombre_final VARCHAR(255);
BEGIN
    -- Si no se proporcionó el nombre de la natillera, intentar obtenerlo
    IF p_natillera_id IS NOT NULL AND p_natillera_nombre IS NULL THEN
        SELECT nombre INTO v_natillera_nombre_final
        FROM natilleras
        WHERE id = p_natillera_id;
    ELSE
        v_natillera_nombre_final := p_natillera_nombre;
    END IF;
    
    -- Insertar registro de auditoría
    INSERT INTO auditoria (
        usuario_id,
        usuario_email,
        natillera_id,
        natillera_nombre,
        tipo_accion,
        entidad,
        entidad_id,
        descripcion,
        datos_anteriores,
        datos_nuevos,
        detalles,
        cambios
    ) VALUES (
        p_usuario_id,
        p_usuario_email,
        p_natillera_id,
        v_natillera_nombre_final,
        p_tipo_accion,
        p_entidad,
        p_entidad_id,
        p_descripcion,
        p_datos_anteriores,
        p_datos_nuevos,
        p_detalles,
        p_cambios
    ) RETURNING id INTO v_auditoria_id;
    
    RETURN v_auditoria_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE auditoria IS 'Registro completo de auditoría de todas las acciones realizadas en el sistema';
COMMENT ON COLUMN auditoria.tipo_accion IS 'Tipo de acción: CREATE, UPDATE, DELETE, GENERATE, REGISTER, CANCEL, APPROVE, REJECT';
COMMENT ON COLUMN auditoria.entidad IS 'Tipo de entidad afectada: natillera, socio, cuota, pago, etc.';
COMMENT ON COLUMN auditoria.datos_anteriores IS 'Estado completo de la entidad antes del cambio (para UPDATE)';
COMMENT ON COLUMN auditoria.datos_nuevos IS 'Estado completo de la entidad después del cambio';
COMMENT ON COLUMN auditoria.cambios IS 'Solo los campos que cambiaron (para facilitar lectura)';
COMMENT ON COLUMN auditoria.detalles IS 'Información adicional específica de la acción';


-- Migración: Corregir políticas RLS de auditoría
-- ============================================
-- Este script corrige las políticas que están causando errores 403

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view audit logs of their natilleras" ON auditoria;
DROP POLICY IF EXISTS "System can insert audit logs" ON auditoria;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON auditoria;

-- Política mejorada para SELECT: Los usuarios pueden ver el historial de auditoría
CREATE POLICY "Users can view audit logs of their natilleras" ON auditoria
FOR SELECT USING (
    -- Pueden ver registros de sus natilleras (como admin)
    natillera_id IN (
        SELECT id FROM natilleras WHERE admin_id = auth.uid()
    )
    -- O registros donde ellos son el usuario que realizó la acción
    OR usuario_id = auth.uid()
);

-- Política mejorada para INSERT: Los usuarios autenticados pueden insertar registros
CREATE POLICY "Authenticated users can insert audit logs" ON auditoria
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
        -- Solo pueden insertar registros donde ellos son el usuario
        usuario_id = auth.uid()
        -- O donde la natillera pertenece a ellos (como admin)
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
    )
);

COMMENT ON POLICY "Users can view audit logs of their natilleras" ON auditoria IS 
'Permite a los usuarios ver registros de auditoría de sus natilleras o donde ellos realizaron la acción';

COMMENT ON POLICY "Authenticated users can insert audit logs" ON auditoria IS 
'Permite a los usuarios autenticados insertar registros de auditoría cuando realizan acciones';

-- ============================================
-- CORREGIR FUNCIÓN registrar_auditoria
-- ============================================
-- La función no debe acceder a auth.users desde el cliente
-- En su lugar, recibe el email como parámetro

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


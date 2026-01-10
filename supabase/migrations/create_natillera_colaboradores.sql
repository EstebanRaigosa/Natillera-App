-- ============================================
-- MIGRACIÓN: Sistema de Colaboradores para Natilleras
-- Permite que múltiples usuarios accedan y gestionen una natillera
-- ============================================

-- 1. Crear tabla de colaboradores
-- ============================================
CREATE TABLE IF NOT EXISTS natillera_colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    natillera_id UUID NOT NULL REFERENCES natilleras(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Permisos granulares
    permisos JSONB DEFAULT '{
        "ver": true,
        "editar_socios": false,
        "gestionar_cuotas": false,
        "gestionar_prestamos": false,
        "gestionar_actividades": false,
        "ver_auditoria": false,
        "configurar": false
    }'::jsonb,
    -- Rol dentro de la natillera
    rol VARCHAR(50) DEFAULT 'colaborador' CHECK (rol IN ('co_administrador', 'colaborador', 'visor')),
    -- Estado de la invitación
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'revocada')),
    -- Invitado por
    invitado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- Email del invitado (para invitaciones a usuarios que aún no tienen cuenta)
    email_invitado VARCHAR(255),
    -- Token para aceptar invitación
    token_invitacion UUID DEFAULT uuid_generate_v4(),
    -- Notas o descripción del colaborador
    notas TEXT,
    -- Timestamps
    fecha_invitacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Restricción de unicidad: un usuario solo puede ser colaborador una vez por natillera
    UNIQUE(natillera_id, usuario_id)
);

-- 2. Índices para mejor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_colaboradores_natillera ON natillera_colaboradores(natillera_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_usuario ON natillera_colaboradores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_estado ON natillera_colaboradores(estado);
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON natillera_colaboradores(email_invitado);
CREATE INDEX IF NOT EXISTS idx_colaboradores_token ON natillera_colaboradores(token_invitacion);

-- 3. Trigger para actualizar updated_at
-- ============================================
CREATE TRIGGER update_natillera_colaboradores_updated_at
    BEFORE UPDATE ON natillera_colaboradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Función helper: Verificar si usuario tiene acceso a una natillera
-- ============================================
CREATE OR REPLACE FUNCTION tiene_acceso_natillera(p_natillera_id UUID, p_usuario_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- El superusuario siempre tiene acceso
    IF public.es_superusuario() THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si es el administrador de la natillera
    IF EXISTS (
        SELECT 1 FROM natilleras 
        WHERE id = p_natillera_id AND admin_id = p_usuario_id
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si es colaborador con invitación aceptada
    IF EXISTS (
        SELECT 1 FROM natillera_colaboradores 
        WHERE natillera_id = p_natillera_id 
        AND usuario_id = p_usuario_id 
        AND estado = 'aceptada'
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Función helper: Verificar permiso específico en una natillera
-- ============================================
CREATE OR REPLACE FUNCTION tiene_permiso_natillera(
    p_natillera_id UUID, 
    p_permiso TEXT,
    p_usuario_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
    v_es_admin BOOLEAN;
    v_permisos JSONB;
    v_rol TEXT;
BEGIN
    -- El superusuario siempre tiene todos los permisos
    IF public.es_superusuario() THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si es el administrador de la natillera (tiene todos los permisos)
    SELECT EXISTS (
        SELECT 1 FROM natilleras 
        WHERE id = p_natillera_id AND admin_id = p_usuario_id
    ) INTO v_es_admin;
    
    IF v_es_admin THEN
        RETURN TRUE;
    END IF;
    
    -- Obtener permisos y rol del colaborador
    SELECT permisos, rol INTO v_permisos, v_rol
    FROM natillera_colaboradores 
    WHERE natillera_id = p_natillera_id 
    AND usuario_id = p_usuario_id 
    AND estado = 'aceptada';
    
    -- Si no es colaborador, no tiene permisos
    IF v_permisos IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Co-administrador tiene todos los permisos excepto eliminar natillera
    IF v_rol = 'co_administrador' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar permiso específico
    RETURN COALESCE((v_permisos->>p_permiso)::boolean, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Función helper: Obtener el rol del usuario en una natillera
-- ============================================
CREATE OR REPLACE FUNCTION obtener_rol_natillera(p_natillera_id UUID, p_usuario_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
    v_rol TEXT;
BEGIN
    -- El superusuario es super_admin
    IF public.es_superusuario() THEN
        RETURN 'super_admin';
    END IF;
    
    -- Verificar si es el administrador de la natillera
    IF EXISTS (
        SELECT 1 FROM natilleras 
        WHERE id = p_natillera_id AND admin_id = p_usuario_id
    ) THEN
        RETURN 'administrador';
    END IF;
    
    -- Obtener rol de colaborador
    SELECT rol INTO v_rol
    FROM natillera_colaboradores 
    WHERE natillera_id = p_natillera_id 
    AND usuario_id = p_usuario_id 
    AND estado = 'aceptada';
    
    RETURN COALESCE(v_rol, 'sin_acceso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. RLS para la tabla de colaboradores
-- ============================================
ALTER TABLE natillera_colaboradores ENABLE ROW LEVEL SECURITY;

-- El admin de la natillera puede ver y gestionar colaboradores
CREATE POLICY "Admins pueden ver colaboradores de sus natilleras"
ON natillera_colaboradores FOR SELECT
USING (
    -- Es el admin de la natillera
    natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    -- O es un colaborador de la natillera (puede ver a otros colaboradores)
    OR (
        usuario_id = auth.uid() 
        AND estado = 'aceptada'
    )
    -- O es el usuario invitado (puede ver su propia invitación)
    OR usuario_id = auth.uid()
    -- O es superusuario
    OR public.es_superusuario()
);

CREATE POLICY "Admins pueden crear colaboradores en sus natilleras"
ON natillera_colaboradores FOR INSERT
WITH CHECK (
    -- Es el admin de la natillera
    natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    -- O es co-administrador
    OR tiene_permiso_natillera(natillera_id, 'configurar')
    -- O es superusuario
    OR public.es_superusuario()
);

CREATE POLICY "Admins pueden actualizar colaboradores de sus natilleras"
ON natillera_colaboradores FOR UPDATE
USING (
    -- Es el admin de la natillera
    natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    -- O el usuario puede actualizar su propia invitación (aceptar/rechazar)
    OR (usuario_id = auth.uid() AND estado = 'pendiente')
    -- O es co-administrador
    OR tiene_permiso_natillera(natillera_id, 'configurar')
    -- O es superusuario
    OR public.es_superusuario()
);

CREATE POLICY "Admins pueden eliminar colaboradores de sus natilleras"
ON natillera_colaboradores FOR DELETE
USING (
    -- Es el admin de la natillera
    natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    -- O es co-administrador (pero no puede eliminarse a sí mismo)
    OR (tiene_permiso_natillera(natillera_id, 'configurar') AND usuario_id != auth.uid())
    -- O es superusuario
    OR public.es_superusuario()
);

-- 8. Función para aceptar invitación
-- ============================================
CREATE OR REPLACE FUNCTION aceptar_invitacion_colaborador(p_token UUID)
RETURNS JSONB AS $$
DECLARE
    v_invitacion RECORD;
    v_resultado JSONB;
BEGIN
    -- Buscar la invitación por token
    SELECT * INTO v_invitacion
    FROM natillera_colaboradores
    WHERE token_invitacion = p_token
    AND estado = 'pendiente';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitación no encontrada o ya procesada'
        );
    END IF;
    
    -- Verificar que el usuario autenticado es el invitado
    IF v_invitacion.usuario_id != auth.uid() AND v_invitacion.email_invitado != (
        SELECT email FROM auth.users WHERE id = auth.uid()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Esta invitación no es para tu usuario'
        );
    END IF;
    
    -- Actualizar la invitación
    UPDATE natillera_colaboradores
    SET 
        estado = 'aceptada',
        usuario_id = auth.uid(), -- Por si fue invitado por email antes de registrarse
        fecha_respuesta = NOW()
    WHERE id = v_invitacion.id;
    
    -- Obtener nombre de la natillera
    SELECT jsonb_build_object(
        'success', true,
        'natillera_id', v_invitacion.natillera_id,
        'natillera_nombre', n.nombre,
        'rol', v_invitacion.rol
    ) INTO v_resultado
    FROM natilleras n
    WHERE n.id = v_invitacion.natillera_id;
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Función para rechazar invitación
-- ============================================
CREATE OR REPLACE FUNCTION rechazar_invitacion_colaborador(p_token UUID)
RETURNS JSONB AS $$
BEGIN
    UPDATE natillera_colaboradores
    SET 
        estado = 'rechazada',
        fecha_respuesta = NOW()
    WHERE token_invitacion = p_token
    AND estado = 'pendiente'
    AND (
        usuario_id = auth.uid() 
        OR email_invitado = (SELECT email FROM auth.users WHERE id = auth.uid())
    );
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invitación no encontrada o ya procesada'
        );
    END IF;
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Vista para obtener colaboradores con información del usuario
-- ============================================
CREATE OR REPLACE VIEW vista_colaboradores_natillera AS
SELECT 
    nc.id,
    nc.natillera_id,
    nc.usuario_id,
    nc.permisos,
    nc.rol,
    nc.estado,
    nc.invitado_por,
    nc.email_invitado,
    nc.notas,
    nc.fecha_invitacion,
    nc.fecha_respuesta,
    nc.created_at,
    nc.updated_at,
    -- Información del usuario
    COALESCE(up.nombre, up.email, nc.email_invitado) as nombre_usuario,
    COALESCE(up.email, nc.email_invitado) as email_usuario,
    up.avatar_seed,
    up.avatar_style,
    -- Información de quien invitó
    (SELECT COALESCE(nombre, email) FROM user_profiles WHERE id = nc.invitado_por) as invitado_por_nombre,
    -- Información de la natillera
    n.nombre as natillera_nombre
FROM natillera_colaboradores nc
LEFT JOIN user_profiles up ON nc.usuario_id = up.id
LEFT JOIN natilleras n ON nc.natillera_id = n.id;

-- 11. Comentarios para documentación
-- ============================================
COMMENT ON TABLE natillera_colaboradores IS 'Tabla de colaboradores que tienen acceso a natilleras de otros usuarios';
COMMENT ON COLUMN natillera_colaboradores.permisos IS 'Permisos granulares: ver, editar_socios, gestionar_cuotas, gestionar_prestamos, gestionar_actividades, ver_auditoria, configurar';
COMMENT ON COLUMN natillera_colaboradores.rol IS 'Rol: co_administrador (todos los permisos), colaborador (permisos específicos), visor (solo lectura)';
COMMENT ON COLUMN natillera_colaboradores.estado IS 'Estado de la invitación: pendiente, aceptada, rechazada, revocada';
COMMENT ON FUNCTION tiene_acceso_natillera IS 'Verifica si un usuario tiene acceso a una natillera (admin, colaborador o superusuario)';
COMMENT ON FUNCTION tiene_permiso_natillera IS 'Verifica si un usuario tiene un permiso específico en una natillera';
COMMENT ON FUNCTION obtener_rol_natillera IS 'Obtiene el rol del usuario en una natillera';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================


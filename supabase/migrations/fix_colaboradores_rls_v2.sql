-- ============================================
-- MIGRACIÓN: Corrección de recursión infinita en RLS
-- El problema: las políticas consultaban la misma tabla causando recursión
-- ============================================

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "colaboradores_select_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_insert_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_update_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_delete_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden ver colaboradores de sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden crear colaboradores en sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden actualizar colaboradores de sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden eliminar colaboradores de sus natilleras" ON natillera_colaboradores;

-- 2. Crear función helper para verificar si es admin de natillera (evita recursión)
CREATE OR REPLACE FUNCTION es_admin_de_natillera(p_natillera_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM natilleras 
        WHERE id = p_natillera_id AND admin_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Asegurar RLS habilitado
ALTER TABLE natillera_colaboradores ENABLE ROW LEVEL SECURITY;

-- 4. Políticas SIMPLES sin recursión

-- SELECT: Ver invitaciones propias O de natilleras donde soy admin
CREATE POLICY "colaboradores_select_policy" ON natillera_colaboradores
FOR SELECT USING (
    -- Superusuario ve todo
    public.es_superusuario()
    -- Usuario ve sus propias invitaciones (donde es el invitado)
    OR usuario_id = auth.uid()
    -- Admin de la natillera ve los colaboradores
    OR es_admin_de_natillera(natillera_id)
);

-- INSERT: Solo admins de la natillera pueden invitar
CREATE POLICY "colaboradores_insert_policy" ON natillera_colaboradores
FOR INSERT WITH CHECK (
    public.es_superusuario()
    OR es_admin_de_natillera(natillera_id)
);

-- UPDATE: Admin puede actualizar, usuario puede aceptar/rechazar su invitación
CREATE POLICY "colaboradores_update_policy" ON natillera_colaboradores
FOR UPDATE USING (
    public.es_superusuario()
    OR es_admin_de_natillera(natillera_id)
    OR (usuario_id = auth.uid() AND estado = 'pendiente')
);

-- DELETE: Solo admins pueden eliminar
CREATE POLICY "colaboradores_delete_policy" ON natillera_colaboradores
FOR DELETE USING (
    public.es_superusuario()
    OR es_admin_de_natillera(natillera_id)
);

-- 5. Recrear la vista
DROP VIEW IF EXISTS vista_colaboradores_natillera;

CREATE VIEW vista_colaboradores_natillera AS
SELECT 
    nc.id,
    nc.natillera_id,
    nc.usuario_id,
    nc.permisos,
    nc.rol,
    nc.estado,
    nc.invitado_por,
    nc.email_invitado,
    nc.token_invitacion,
    nc.notas,
    nc.fecha_invitacion,
    nc.fecha_respuesta,
    nc.created_at,
    nc.updated_at,
    COALESCE(up.nombre, up.email, nc.email_invitado) as nombre_usuario,
    COALESCE(up.email, nc.email_invitado) as email_usuario,
    up.avatar_seed,
    up.avatar_style,
    (SELECT COALESCE(nombre, email) FROM user_profiles WHERE id = nc.invitado_por) as invitado_por_nombre,
    n.nombre as natillera_nombre
FROM natillera_colaboradores nc
LEFT JOIN user_profiles up ON nc.usuario_id = up.id
LEFT JOIN natilleras n ON nc.natillera_id = n.id;

GRANT SELECT ON vista_colaboradores_natillera TO authenticated;

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================


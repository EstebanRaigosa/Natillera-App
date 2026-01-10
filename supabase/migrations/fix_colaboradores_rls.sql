-- ============================================
-- MIGRACIÓN: Corrección de RLS para colaboradores
-- Ejecutar si hay errores 406 al acceder a natillera_colaboradores
-- ============================================

-- 1. Asegurarse de que la función es_superusuario existe
CREATE OR REPLACE FUNCTION public.es_superusuario()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN LOWER(TRIM(COALESCE(user_email, ''))) = 'raigo.16@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Eliminar todas las políticas existentes de natillera_colaboradores
DROP POLICY IF EXISTS "Admins pueden ver colaboradores de sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden crear colaboradores en sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden actualizar colaboradores de sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "Admins pueden eliminar colaboradores de sus natilleras" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_select_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_insert_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_update_policy" ON natillera_colaboradores;
DROP POLICY IF EXISTS "colaboradores_delete_policy" ON natillera_colaboradores;

-- 3. Asegurarse de que RLS está habilitado
ALTER TABLE natillera_colaboradores ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas simplificadas y más permisivas

-- SELECT: Usuarios autenticados pueden ver sus propias invitaciones y las de sus natilleras
CREATE POLICY "colaboradores_select_policy" ON natillera_colaboradores
FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
        -- Es superusuario
        public.es_superusuario()
        -- O es el usuario invitado
        OR usuario_id = auth.uid()
        -- O es el admin de la natillera
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
        -- O es colaborador activo de la natillera
        OR natillera_id IN (
            SELECT natillera_id FROM natillera_colaboradores 
            WHERE usuario_id = auth.uid() AND estado = 'aceptada'
        )
    )
);

-- INSERT: Admins y co-admins pueden invitar
CREATE POLICY "colaboradores_insert_policy" ON natillera_colaboradores
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
        public.es_superusuario()
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
    )
);

-- UPDATE: Admins pueden actualizar, usuarios pueden aceptar/rechazar sus invitaciones
CREATE POLICY "colaboradores_update_policy" ON natillera_colaboradores
FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
        public.es_superusuario()
        -- Admin de la natillera
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
        -- Usuario actualizando su propia invitación pendiente
        OR (usuario_id = auth.uid() AND estado = 'pendiente')
    )
);

-- DELETE: Solo admins pueden eliminar
CREATE POLICY "colaboradores_delete_policy" ON natillera_colaboradores
FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND (
        public.es_superusuario()
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
    )
);

-- 5. Dar permisos a la vista (recrear la vista con SECURITY INVOKER por defecto)
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

-- 6. Dar permisos de SELECT en la vista a usuarios autenticados
GRANT SELECT ON vista_colaboradores_natillera TO authenticated;

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================


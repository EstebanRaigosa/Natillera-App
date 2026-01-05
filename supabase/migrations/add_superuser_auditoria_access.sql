-- Migración: Permitir acceso completo de superusuario a auditoría
-- ============================================
-- Esta migración permite que el superusuario (raigo.16@gmail.com) 
-- pueda ver la auditoría de todas las natilleras

-- Asegurarnos de que la función es_superusuario() existe
CREATE OR REPLACE FUNCTION public.es_superusuario()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN LOWER(TRIM(user_email)) = 'raigo.16@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar las políticas existentes de SELECT si existen
DROP POLICY IF EXISTS "Users can view audit logs of their natilleras" ON auditoria;
DROP POLICY IF EXISTS "Users can view audit logs of their natilleras or superuser all" ON auditoria;

-- Crear nueva política de SELECT que permite:
-- 1. Usuarios ver registros de sus natilleras (como admin)
-- 2. Usuarios ver registros donde ellos realizaron la acción
-- 3. Superusuario ver TODOS los registros
CREATE POLICY "Users can view audit logs of their natilleras or superuser all" ON auditoria
FOR SELECT USING (
    -- Superusuario puede ver todos los registros
    public.es_superusuario()
    -- O pueden ver registros de sus natilleras (como admin)
    OR natillera_id IN (
        SELECT id FROM natilleras WHERE admin_id = auth.uid()
    )
    -- O registros donde ellos son el usuario que realizó la acción
    OR usuario_id = auth.uid()
);

-- La política de INSERT se mantiene igual (no necesita cambios)
-- Los usuarios autenticados pueden insertar registros de auditoría
-- cuando realizan acciones en sus natilleras

COMMENT ON POLICY "Users can view audit logs of their natilleras or superuser all" ON auditoria IS 
'Permite a los usuarios ver registros de auditoría de sus natilleras, donde ellos realizaron la acción, o al superusuario (raigo.16@gmail.com) ver todos los registros';


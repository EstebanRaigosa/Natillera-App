-- Migración: Agregar permisos de superusuario a utilidades_clasificadas
-- ============================================
-- Esta migración actualiza las políticas RLS de la tabla utilidades_clasificadas
-- para incluir permisos completos del superusuario (raigo.16@gmail.com)

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

-- Actualizar políticas existentes para incluir superusuario

-- SELECT: Superusuario puede ver todas las utilidades
DROP POLICY IF EXISTS "Ver utilidades clasificadas de mis natilleras" ON utilidades_clasificadas;
CREATE POLICY "Ver utilidades clasificadas de mis natilleras" ON utilidades_clasificadas
    FOR SELECT USING (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- INSERT: Superusuario puede crear utilidades
DROP POLICY IF EXISTS "Crear utilidades clasificadas en mis natilleras" ON utilidades_clasificadas;
CREATE POLICY "Crear utilidades clasificadas en mis natilleras" ON utilidades_clasificadas
    FOR INSERT WITH CHECK (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- UPDATE: Superusuario puede actualizar cualquier utilidad
DROP POLICY IF EXISTS "Actualizar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas;
CREATE POLICY "Actualizar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas
    FOR UPDATE USING (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    )
    WITH CHECK (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- DELETE: Superusuario puede eliminar cualquier utilidad
DROP POLICY IF EXISTS "Eliminar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas;
CREATE POLICY "Eliminar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas
    FOR DELETE USING (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

COMMENT ON POLICY "Ver utilidades clasificadas de mis natilleras" ON utilidades_clasificadas IS 
'Permite al superusuario (raigo.16@gmail.com) ver todas las utilidades, o a los usuarios ver las de sus natilleras';

COMMENT ON POLICY "Crear utilidades clasificadas en mis natilleras" ON utilidades_clasificadas IS 
'Permite al superusuario (raigo.16@gmail.com) crear utilidades en cualquier natillera, o a los usuarios crear en sus natilleras';

COMMENT ON POLICY "Actualizar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas IS 
'Permite al superusuario (raigo.16@gmail.com) actualizar cualquier utilidad, o a los usuarios actualizar las de sus natilleras';

COMMENT ON POLICY "Eliminar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas IS 
'Permite al superusuario (raigo.16@gmail.com) eliminar cualquier utilidad, o a los usuarios eliminar las de sus natilleras';

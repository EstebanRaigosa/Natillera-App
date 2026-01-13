-- Migración: Agregar permisos de superusuario a historial_refinanciaciones
-- ============================================
-- Esta migración actualiza las políticas RLS de la tabla historial_refinanciaciones
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

-- SELECT: Superusuario puede ver todas las refinanciaciones
DROP POLICY IF EXISTS "Ver historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones;
CREATE POLICY "Ver historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones
    FOR SELECT USING (
        public.es_superusuario() OR
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- INSERT: Superusuario puede crear historial de refinanciaciones
DROP POLICY IF EXISTS "Insertar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones;
CREATE POLICY "Insertar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones
    FOR INSERT WITH CHECK (
        public.es_superusuario() OR
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- UPDATE: Superusuario puede actualizar cualquier historial de refinanciación
DROP POLICY IF EXISTS "Actualizar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones;
CREATE POLICY "Actualizar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones
    FOR UPDATE USING (
        public.es_superusuario() OR
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        public.es_superusuario() OR
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- DELETE: Superusuario puede eliminar cualquier historial de refinanciación
DROP POLICY IF EXISTS "Eliminar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones;
CREATE POLICY "Eliminar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones
    FOR DELETE USING (
        public.es_superusuario() OR
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

COMMENT ON POLICY "Ver historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones IS 
'Permite al superusuario (raigo.16@gmail.com) ver todas las refinanciaciones, o a los usuarios ver las de sus natilleras';

COMMENT ON POLICY "Insertar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones IS 
'Permite al superusuario (raigo.16@gmail.com) crear historial de refinanciaciones en cualquier préstamo, o a los usuarios crear en sus natilleras';

COMMENT ON POLICY "Actualizar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones IS 
'Permite al superusuario (raigo.16@gmail.com) actualizar cualquier historial de refinanciación, o a los usuarios actualizar las de sus natilleras';

COMMENT ON POLICY "Eliminar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones IS 
'Permite al superusuario (raigo.16@gmail.com) eliminar cualquier historial de refinanciación, o a los usuarios eliminar las de sus natilleras';

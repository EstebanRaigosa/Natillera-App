-- Migración: Corregir política RLS para INSERT en préstamos
-- Esta migración corrige el problema donde no se pueden crear préstamos debido a la política RLS

-- Eliminar todas las políticas existentes de préstamos para recrearlas correctamente
DROP POLICY IF EXISTS "Ver préstamos de mis natilleras" ON prestamos;
DROP POLICY IF EXISTS "Gestionar préstamos de mis natilleras" ON prestamos;
DROP POLICY IF EXISTS "Admin puede ver todos los préstamos" ON prestamos;

-- Política para SELECT (ver préstamos)
CREATE POLICY "Ver préstamos de mis natilleras" ON prestamos
    FOR SELECT USING (
        is_admin_user() OR
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Política para INSERT (crear préstamos) - CRÍTICA: debe tener WITH CHECK
CREATE POLICY "Crear préstamos de mis natilleras" ON prestamos
    FOR INSERT 
    WITH CHECK (
        is_admin_user() OR
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Política para UPDATE (actualizar préstamos)
CREATE POLICY "Actualizar préstamos de mis natilleras" ON prestamos
    FOR UPDATE 
    USING (
        is_admin_user() OR
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        is_admin_user() OR
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Política para DELETE (eliminar préstamos)
CREATE POLICY "Eliminar préstamos de mis natilleras" ON prestamos
    FOR DELETE 
    USING (
        is_admin_user() OR
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Comentarios explicativos
COMMENT ON POLICY "Ver préstamos de mis natilleras" ON prestamos IS 
'Permite a los administradores ver préstamos de sus natilleras. Los admins pueden ver todos.';

COMMENT ON POLICY "Crear préstamos de mis natilleras" ON prestamos IS 
'Permite a los administradores crear préstamos en sus natilleras. Los admins pueden crear en cualquier natillera. Incluye WITH CHECK para permitir INSERT.';

COMMENT ON POLICY "Actualizar préstamos de mis natilleras" ON prestamos IS 
'Permite a los administradores actualizar préstamos de sus natilleras. Los admins pueden actualizar cualquier préstamo.';

COMMENT ON POLICY "Eliminar préstamos de mis natilleras" ON prestamos IS 
'Permite a los administradores eliminar préstamos de sus natilleras. Los admins pueden eliminar cualquier préstamo.';


-- Versión alternativa de la migración con política más simple
-- Esta versión usa una función auxiliar para simplificar la verificación

-- IMPORTANTE: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Gestionar pagos de préstamos" ON pagos_prestamo;
DROP POLICY IF EXISTS "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Ver y gestionar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo;

-- Crear función auxiliar para verificar si un préstamo pertenece al usuario
-- SECURITY DEFINER permite que la función ejecute con los privilegios del creador,
-- evitando problemas con RLS al consultar otras tablas
CREATE OR REPLACE FUNCTION prestamo_pertenece_a_usuario(p_prestamo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Obtener el admin_id de la natillera a la que pertenece el préstamo
    -- Usamos SECURITY DEFINER para evitar problemas con RLS
    SELECT n.admin_id INTO v_admin_id
    FROM prestamos p
    JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
    JOIN natilleras n ON sn.natillera_id = n.id
    WHERE p.id = p_prestamo_id;
    
    -- Verificar si el admin_id coincide con el usuario actual
    RETURN (v_admin_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para SELECT
CREATE POLICY "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR SELECT USING (
        prestamo_pertenece_a_usuario(prestamo_id)
    );

-- Política para INSERT - CRÍTICA: debe tener WITH CHECK
CREATE POLICY "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        prestamo_pertenece_a_usuario(prestamo_id)
    );

-- Política para UPDATE
CREATE POLICY "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR UPDATE USING (
        prestamo_pertenece_a_usuario(prestamo_id)
    )
    WITH CHECK (
        prestamo_pertenece_a_usuario(prestamo_id)
    );

-- Política para DELETE
CREATE POLICY "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR DELETE USING (
        prestamo_pertenece_a_usuario(prestamo_id)
    );


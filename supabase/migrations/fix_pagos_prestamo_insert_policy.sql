-- Corregir política RLS para permitir INSERT en pagos_prestamo
-- El problema es que la política actual solo tiene USING, pero INSERT necesita WITH CHECK

-- IMPORTANTE: Eliminar TODAS las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Gestionar pagos de préstamos" ON pagos_prestamo;
DROP POLICY IF EXISTS "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Ver y gestionar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo;

-- Política para SELECT (ver pagos)
CREATE POLICY "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = prestamo_id
            AND n.admin_id = auth.uid()
        )
    );

-- Política para INSERT (crear pagos) - CRÍTICA: debe tener WITH CHECK
-- Verificamos que el usuario esté autenticado Y que el préstamo pertenezca a una natillera del usuario
CREATE POLICY "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = prestamo_id
            AND n.admin_id = auth.uid()
        )
    );

-- Política para UPDATE (actualizar pagos)
CREATE POLICY "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = prestamo_id
            AND n.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = prestamo_id
            AND n.admin_id = auth.uid()
        )
    );

-- Política para DELETE (eliminar pagos)
CREATE POLICY "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = prestamo_id
            AND n.admin_id = auth.uid()
        )
    );


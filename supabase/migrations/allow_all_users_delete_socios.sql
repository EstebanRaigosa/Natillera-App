-- Migración: Permitir que cualquier usuario autenticado pueda eliminar socios
-- ============================================
-- Actualiza la política DELETE de socios_natillera para permitir que cualquier
-- usuario autenticado pueda eliminar socios

-- Eliminar la política antigua que solo permitía a administradores
DROP POLICY IF EXISTS "Admins pueden eliminar socios de sus natilleras" ON socios_natillera;

-- Crear nueva política que permite a cualquier usuario autenticado eliminar socios
CREATE POLICY "Usuarios autenticados pueden eliminar socios" ON socios_natillera
    FOR DELETE USING (
        -- Cualquier usuario autenticado puede eliminar socios
        auth.uid() IS NOT NULL
    );

-- Comentario para documentación
COMMENT ON POLICY "Usuarios autenticados pueden eliminar socios" ON socios_natillera IS 
'Permite a cualquier usuario autenticado eliminar socios. La eliminación se propaga en cascada eliminando cuotas, préstamos y multas asociadas.';


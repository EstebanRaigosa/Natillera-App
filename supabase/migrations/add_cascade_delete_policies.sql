-- Migración: Agregar políticas DELETE en cascada para natilleras y socios
-- ============================================
-- Esta migración permite eliminar natilleras y socios con eliminación en cascada
-- de todos los registros relacionados

-- ============================================
-- FUNCIÓN: Verificar si el usuario es superusuario
-- ============================================
CREATE OR REPLACE FUNCTION es_superusuario()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND LOWER(TRIM(email)) = 'raigo.16@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS DELETE PARA NATILLERAS
-- ============================================

-- Política: Solo usuarios con permisos pueden eliminar natilleras
-- Esto activará la eliminación en cascada de:
-- - socios_natillera (ON DELETE CASCADE)
-- - actividades (ON DELETE CASCADE)
-- - historial (ON DELETE CASCADE)
-- - auditoria (ON DELETE CASCADE)
-- Y a través de socios_natillera:
-- - cuotas (ON DELETE CASCADE)
-- - prestamos (ON DELETE CASCADE)
-- - multas (ON DELETE CASCADE)
-- - pagos_prestamo (a través de prestamos)
-- - historial_comprobantes (a través de cuotas)

DROP POLICY IF EXISTS "Admins pueden eliminar sus natilleras" ON natilleras;
CREATE POLICY "Admins pueden eliminar sus natilleras" ON natilleras
    FOR DELETE USING (
        -- El superusuario (raigo.16@gmail.com) puede eliminar cualquier natillera
        es_superusuario()
        OR (
            -- O cualquier usuario autenticado que sea el administrador de la natillera
            admin_id = auth.uid()
        )
    );

-- ============================================
-- POLÍTICAS DELETE PARA SOCIOS
-- ============================================

-- Política: Los administradores pueden eliminar socios de sus natilleras
-- Esto activará la eliminación en cascada de:
-- - socios_natillera (elimina la relación)
-- - cuotas (ON DELETE CASCADE desde socios_natillera)
-- - prestamos (ON DELETE CASCADE desde socios_natillera)
-- - multas (ON DELETE CASCADE desde socios_natillera)
-- - pagos_prestamo (a través de prestamos)
-- - historial_comprobantes (a través de cuotas)

DROP POLICY IF EXISTS "Admins pueden eliminar socios de sus natilleras" ON socios_natillera;
CREATE POLICY "Admins pueden eliminar socios de sus natilleras" ON socios_natillera
    FOR DELETE USING (
        -- El superusuario (raigo.16@gmail.com) puede eliminar socios de cualquier natillera
        es_superusuario()
        OR (
            -- O el administrador de la natillera puede eliminar socios de sus natilleras
            natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
        )
    );

-- Política: Los administradores pueden eliminar socios (tabla principal)
-- Nota: Esto eliminará el socio de todas las natilleras donde esté registrado
DROP POLICY IF EXISTS "Admins pueden eliminar socios" ON socios;
CREATE POLICY "Admins pueden eliminar socios" ON socios
    FOR DELETE USING (
        -- El superusuario (raigo.16@gmail.com) puede eliminar cualquier socio
        es_superusuario()
        OR (
            -- O el administrador puede eliminar socios de sus natilleras
            EXISTS (
                SELECT 1 FROM socios_natillera sn
                JOIN natilleras n ON sn.natillera_id = n.id
                WHERE sn.socio_id = socios.id
                AND n.admin_id = auth.uid()
            )
        )
    );

-- ============================================
-- POLÍTICA UPDATE PARA REASIGNAR NATILLERAS
-- ============================================

-- Actualizar la política existente para permitir al superusuario reasignar natilleras
-- Primero eliminamos la política antigua si existe
DROP POLICY IF EXISTS "Admins pueden actualizar sus natilleras" ON natilleras;

-- Crear nueva política que permite al superusuario actualizar cualquier natillera
-- y cambiar el admin_id, mientras que otros usuarios solo pueden actualizar sus propias natilleras
CREATE POLICY "Admins pueden actualizar sus natilleras" ON natilleras
    FOR UPDATE USING (
        -- El superusuario puede actualizar cualquier natillera
        es_superusuario()
        OR (
            -- O el administrador actual puede actualizar su propia natillera
            admin_id = auth.uid()
        )
    )
    WITH CHECK (
        -- El superusuario puede cambiar el admin_id a cualquier usuario
        es_superusuario()
        OR (
            -- O el administrador actual solo puede mantener su propio admin_id (no puede cambiarlo)
            admin_id = auth.uid()
        )
    );

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON POLICY "Admins pueden eliminar sus natilleras" ON natilleras IS 
'Permite a los administradores eliminar sus natilleras. La eliminación se propaga en cascada a todos los registros relacionados.';

COMMENT ON POLICY "Admins pueden eliminar socios de sus natilleras" ON socios_natillera IS 
'Permite a los administradores eliminar socios de sus natilleras. La eliminación se propaga en cascada eliminando cuotas, préstamos y multas asociadas.';

COMMENT ON POLICY "Admins pueden eliminar socios" ON socios IS 
'Permite a los administradores eliminar socios de sus natilleras. Esto eliminará el socio de todas las natilleras donde esté registrado.';

COMMENT ON POLICY "Superusuario puede reasignar natilleras" ON natilleras IS 
'Permite al superusuario reasignar natilleras a otros usuarios cambiando el admin_id.';


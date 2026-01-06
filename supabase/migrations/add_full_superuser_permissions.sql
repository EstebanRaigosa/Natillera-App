-- Migración: Permisos completos de superusuario para raigo.16@gmail.com
-- ============================================
-- Esta migración otorga permisos completos (SELECT, INSERT, UPDATE, DELETE)
-- al superusuario (raigo.16@gmail.com) en TODAS las tablas del sistema

-- ============================================
-- FUNCIÓN: Verificar si el usuario es superusuario
-- ============================================
CREATE OR REPLACE FUNCTION public.es_superusuario()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN LOWER(TRIM(user_email)) = 'raigo.16@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NATILLERAS - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todas las natilleras
DROP POLICY IF EXISTS "Usuarios pueden ver sus natilleras" ON natilleras;
CREATE POLICY "Usuarios pueden ver sus natilleras" ON natilleras
    FOR SELECT USING (
        public.es_superusuario() OR admin_id = auth.uid()
    );

-- INSERT: Superusuario puede crear natilleras
DROP POLICY IF EXISTS "Usuarios pueden crear natilleras" ON natilleras;
CREATE POLICY "Usuarios pueden crear natilleras" ON natilleras
    FOR INSERT WITH CHECK (
        public.es_superusuario() OR admin_id = auth.uid()
    );

-- UPDATE: Superusuario puede actualizar cualquier natillera
DROP POLICY IF EXISTS "Admins pueden actualizar sus natilleras" ON natilleras;
CREATE POLICY "Admins pueden actualizar sus natilleras" ON natilleras
    FOR UPDATE USING (
        public.es_superusuario() OR admin_id = auth.uid()
    )
    WITH CHECK (
        public.es_superusuario() OR admin_id = auth.uid()
    );

-- DELETE: Superusuario puede eliminar cualquier natillera
DROP POLICY IF EXISTS "Admins pueden eliminar sus natilleras" ON natilleras;
CREATE POLICY "Admins pueden eliminar sus natilleras" ON natilleras
    FOR DELETE USING (
        public.es_superusuario() OR admin_id = auth.uid()
    );

-- ============================================
-- SOCIOS - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todos los socios
DROP POLICY IF EXISTS "Lectura pública de socios" ON socios;
CREATE POLICY "Lectura pública de socios" ON socios
    FOR SELECT USING (true OR public.es_superusuario());

-- INSERT: Superusuario puede crear socios
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear socios" ON socios;
CREATE POLICY "Usuarios autenticados pueden crear socios" ON socios
    FOR INSERT WITH CHECK (
        public.es_superusuario() OR auth.uid() IS NOT NULL
    );

-- UPDATE: Superusuario puede actualizar cualquier socio
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar socios" ON socios;
CREATE POLICY "Usuarios autenticados pueden actualizar socios" ON socios
    FOR UPDATE USING (
        public.es_superusuario() OR auth.uid() IS NOT NULL
    );

-- DELETE: Superusuario puede eliminar cualquier socio
DROP POLICY IF EXISTS "Admins pueden eliminar socios" ON socios;
CREATE POLICY "Admins pueden eliminar socios" ON socios
    FOR DELETE USING (
        public.es_superusuario()
        OR EXISTS (
            SELECT 1 FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE sn.socio_id = socios.id
            AND n.admin_id = auth.uid()
        )
    );

-- ============================================
-- SOCIOS_NATILLERA - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todas las relaciones
DROP POLICY IF EXISTS "Ver socios de mis natilleras" ON socios_natillera;
CREATE POLICY "Ver socios de mis natilleras" ON socios_natillera
    FOR SELECT USING (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- INSERT: Superusuario puede agregar socios a cualquier natillera
DROP POLICY IF EXISTS "Agregar socios a mis natilleras" ON socios_natillera;
CREATE POLICY "Agregar socios a mis natilleras" ON socios_natillera
    FOR INSERT WITH CHECK (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- UPDATE: Superusuario puede actualizar cualquier relación
DROP POLICY IF EXISTS "Actualizar socios de mis natilleras" ON socios_natillera;
CREATE POLICY "Actualizar socios de mis natilleras" ON socios_natillera
    FOR UPDATE USING (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- DELETE: Superusuario puede eliminar cualquier relación
DROP POLICY IF EXISTS "Admins pueden eliminar socios de sus natilleras" ON socios_natillera;
CREATE POLICY "Admins pueden eliminar socios de sus natilleras" ON socios_natillera
    FOR DELETE USING (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- ============================================
-- CUOTAS - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todas las cuotas
DROP POLICY IF EXISTS "Ver cuotas de mis natilleras" ON cuotas;
CREATE POLICY "Ver cuotas de mis natilleras" ON cuotas
    FOR SELECT USING (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- INSERT, UPDATE, DELETE: Superusuario puede gestionar todas las cuotas
DROP POLICY IF EXISTS "Gestionar cuotas de mis natilleras" ON cuotas;
CREATE POLICY "Gestionar cuotas de mis natilleras" ON cuotas
    FOR ALL USING (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- ============================================
-- PRESTAMOS - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todos los préstamos
DROP POLICY IF EXISTS "Ver préstamos de mis natilleras" ON prestamos;
CREATE POLICY "Ver préstamos de mis natilleras" ON prestamos
    FOR SELECT USING (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- INSERT, UPDATE, DELETE: Superusuario puede gestionar todos los préstamos
DROP POLICY IF EXISTS "Gestionar préstamos de mis natilleras" ON prestamos;
CREATE POLICY "Gestionar préstamos de mis natilleras" ON prestamos
    FOR ALL USING (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- ============================================
-- PAGOS_PRESTAMO - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todos los pagos
DROP POLICY IF EXISTS "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo;
CREATE POLICY "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR SELECT USING (
        public.es_superusuario()
        OR prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- INSERT: Superusuario puede insertar pagos en cualquier préstamo
DROP POLICY IF EXISTS "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo;
CREATE POLICY "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR INSERT WITH CHECK (
        public.es_superusuario()
        OR prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- UPDATE: Superusuario puede actualizar cualquier pago
DROP POLICY IF EXISTS "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo;
CREATE POLICY "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR UPDATE USING (
        public.es_superusuario()
        OR prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- DELETE: Superusuario puede eliminar cualquier pago
DROP POLICY IF EXISTS "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo;
CREATE POLICY "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR DELETE USING (
        public.es_superusuario()
        OR prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- ============================================
-- MULTAS - Permisos completos de superusuario
-- ============================================

-- SELECT, INSERT, UPDATE, DELETE: Superusuario puede gestionar todas las multas
DROP POLICY IF EXISTS "Ver multas de mis natilleras" ON multas;
CREATE POLICY "Ver multas de mis natilleras" ON multas
    FOR ALL USING (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    )
    WITH CHECK (
        public.es_superusuario()
        OR socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- ============================================
-- ACTIVIDADES - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todas las actividades
DROP POLICY IF EXISTS "Ver actividades de mis natilleras" ON actividades;
CREATE POLICY "Ver actividades de mis natilleras" ON actividades
    FOR SELECT USING (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- INSERT, UPDATE, DELETE: Superusuario puede gestionar todas las actividades
DROP POLICY IF EXISTS "Gestionar actividades de mis natilleras" ON actividades;
CREATE POLICY "Gestionar actividades de mis natilleras" ON actividades
    FOR ALL USING (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    )
    WITH CHECK (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- ============================================
-- HISTORIAL - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver todo el historial
DROP POLICY IF EXISTS "Ver historial de mis natilleras" ON historial;
CREATE POLICY "Ver historial de mis natilleras" ON historial
    FOR SELECT USING (
        public.es_superusuario()
        OR natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- INSERT: Superusuario puede insertar historial
DROP POLICY IF EXISTS "Registrar historial" ON historial;
CREATE POLICY "Registrar historial" ON historial
    FOR INSERT WITH CHECK (
        public.es_superusuario() OR auth.uid() IS NOT NULL
    );

-- ============================================
-- AUDITORIA - Permisos completos de superusuario
-- ============================================

-- SELECT: Superusuario puede ver toda la auditoría (ya existe, pero la actualizamos)
DROP POLICY IF EXISTS "Users can view audit logs of their natilleras or superuser all" ON auditoria;
CREATE POLICY "Users can view audit logs of their natilleras or superuser all" ON auditoria
    FOR SELECT USING (
        public.es_superusuario()
        OR natillera_id IN (
            SELECT id FROM natilleras WHERE admin_id = auth.uid()
        )
        OR usuario_id = auth.uid()
    );

-- INSERT: Superusuario puede insertar auditoría
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON auditoria;
CREATE POLICY "Authenticated users can insert audit logs" ON auditoria
    FOR INSERT WITH CHECK (
        public.es_superusuario()
        OR (
            auth.uid() IS NOT NULL
            AND (
                usuario_id = auth.uid()
                OR natillera_id IN (
                    SELECT id FROM natilleras WHERE admin_id = auth.uid()
                )
            )
        )
    );

-- UPDATE: Superusuario puede actualizar auditoría (si es necesario)
-- Nota: Normalmente la auditoría no se actualiza, pero por si acaso
DROP POLICY IF EXISTS "Superuser can update audit logs" ON auditoria;
CREATE POLICY "Superuser can update audit logs" ON auditoria
    FOR UPDATE USING (public.es_superusuario())
    WITH CHECK (public.es_superusuario());

-- DELETE: Superusuario puede eliminar auditoría (si es necesario)
DROP POLICY IF EXISTS "Superuser can delete audit logs" ON auditoria;
CREATE POLICY "Superuser can delete audit logs" ON auditoria
    FOR DELETE USING (public.es_superusuario());

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON FUNCTION public.es_superusuario() IS 
'Verifica si el usuario actual es el superusuario (raigo.16@gmail.com). El superusuario tiene permisos completos en todo el sistema.';


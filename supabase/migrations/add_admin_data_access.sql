-- ============================================
-- Políticas para acceso completo de admin a datos
-- Permite que el usuario raigo.16@gmail.com vea todos los datos
-- ============================================

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el email del usuario actual es raigo.16@gmail.com
  RETURN (
    SELECT email = 'raigo.16@gmail.com'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para natilleras (admin puede ver todas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'natilleras') THEN
        DROP POLICY IF EXISTS "Admin puede ver todas las natilleras" ON natilleras;
        CREATE POLICY "Admin puede ver todas las natilleras" ON natilleras
            FOR SELECT USING (is_admin_user() OR admin_id = auth.uid());
    END IF;
END $$;

-- Políticas para socios (admin puede ver todos)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'socios') THEN
        DROP POLICY IF EXISTS "Admin puede ver todos los socios" ON socios;
        CREATE POLICY "Admin puede ver todos los socios" ON socios
            FOR SELECT USING (is_admin_user() OR true);
    END IF;
END $$;

-- Políticas para socios_natillera (admin puede ver todas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'socios_natillera') THEN
        DROP POLICY IF EXISTS "Admin puede ver todas las relaciones socios-natillera" ON socios_natillera;
        CREATE POLICY "Admin puede ver todas las relaciones socios-natillera" ON socios_natillera
            FOR SELECT USING (
                is_admin_user() OR
                natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
            );
    END IF;
END $$;

-- Políticas para cuotas (admin puede ver todas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cuotas') THEN
        DROP POLICY IF EXISTS "Admin puede ver todas las cuotas" ON cuotas;
        CREATE POLICY "Admin puede ver todas las cuotas" ON cuotas
            FOR SELECT USING (
                is_admin_user() OR
                socio_natillera_id IN (
                    SELECT sn.id FROM socios_natillera sn
                    JOIN natilleras n ON sn.natillera_id = n.id
                    WHERE n.admin_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Políticas para préstamos (admin puede ver todos)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prestamos') THEN
        DROP POLICY IF EXISTS "Admin puede ver todos los préstamos" ON prestamos;
        CREATE POLICY "Admin puede ver todos los préstamos" ON prestamos
            FOR SELECT USING (
                is_admin_user() OR
                socio_natillera_id IN (
                    SELECT sn.id FROM socios_natillera sn
                    JOIN natilleras n ON sn.natillera_id = n.id
                    WHERE n.admin_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Políticas para actividades (admin puede ver todas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'actividades') THEN
        DROP POLICY IF EXISTS "Admin puede ver todas las actividades" ON actividades;
        CREATE POLICY "Admin puede ver todas las actividades" ON actividades
            FOR SELECT USING (
                is_admin_user() OR
                natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
            );
    END IF;
END $$;

-- Políticas para historial (admin puede ver todo)
-- Solo crear si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'historial') THEN
        DROP POLICY IF EXISTS "Admin puede ver todo el historial" ON historial;
        CREATE POLICY "Admin puede ver todo el historial" ON historial
            FOR SELECT USING (
                is_admin_user() OR
                natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
            );
    END IF;
END $$;

-- Función RPC para obtener usuarios (opcional, requiere permisos especiales)
-- Nota: Esta función puede no funcionar dependiendo de la configuración de Supabase
-- Si no funciona, puedes crear una vista pública o usar el dashboard de Supabase
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario es admin
    IF NOT is_admin_user() THEN
        RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden ver usuarios';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.last_sign_in_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;


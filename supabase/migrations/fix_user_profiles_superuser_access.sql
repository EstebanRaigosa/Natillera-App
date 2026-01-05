-- Migración: Crear tabla user_profiles y configurar acceso de superusuario
-- ============================================
-- Esta migración crea la tabla user_profiles si no existe y permite que el superusuario 
-- (raigo.16@gmail.com) pueda acceder a todos los perfiles de usuario usando la función es_superusuario()

-- 1. Crear la tabla user_profiles si no existe
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'usuario' CHECK (rol IN ('super_admin', 'admin', 'usuario', 'invitado')),
    activo BOOLEAN DEFAULT true,
    avatar_seed VARCHAR(100),
    avatar_style VARCHAR(50) DEFAULT 'adventurer',
    permisos JSONB DEFAULT '{}',
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rol ON user_profiles(rol);
CREATE INDEX IF NOT EXISTS idx_user_profiles_activo ON user_profiles(activo);

-- 3. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, nombre, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
        'usuario' -- Rol por defecto
    )
    ON CONFLICT (id) DO NOTHING; -- Evitar errores si el perfil ya existe
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Asegurémonos de que la función es_superusuario() existe
CREATE OR REPLACE FUNCTION public.es_superusuario()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN LOWER(TRIM(user_email)) = 'raigo.16@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Eliminar TODAS las políticas existentes para evitar conflictos y recursión
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage users" ON user_profiles;
-- Eliminar cualquier otra política que pueda existir
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profiles';
    END LOOP;
END $$;

-- 10. Políticas RLS básicas (sin recursión)
-- Política única para SELECT: usuarios ven su perfil O superusuario ve todos
CREATE POLICY "Users can view own profile or superuser all" ON user_profiles
    FOR SELECT
    USING (
        auth.uid() = id  -- Usuario ve su propio perfil
        OR public.es_superusuario()  -- Superusuario ve todos (usa auth.users, no user_profiles)
    );

-- Política única para UPDATE: usuarios actualizan su perfil O superusuario actualiza todos
CREATE POLICY "Users can update own profile or superuser all" ON user_profiles
    FOR UPDATE
    USING (
        auth.uid() = id  -- Usuario actualiza su propio perfil
        OR public.es_superusuario()  -- Superusuario actualiza todos
    )
    WITH CHECK (
        auth.uid() = id
        OR public.es_superusuario()
    );

-- Política para INSERT: usuarios crean su perfil O superusuario crea cualquier perfil
CREATE POLICY "Users can insert own profile or superuser any" ON user_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = id  -- Usuario crea su propio perfil
        OR public.es_superusuario()  -- Superusuario crea cualquier perfil
    );

-- Política para DELETE: solo superusuario puede eliminar perfiles
CREATE POLICY "Only superuser can delete profiles" ON user_profiles
    FOR DELETE
    USING (
        public.es_superusuario()  -- Solo superusuario puede eliminar
    );

-- NOTA: No creamos una política para "Admins can manage users" porque causaría recursión infinita.
-- La política intentaría consultar user_profiles para verificar el rol, pero para consultar user_profiles
-- necesita verificar la política, creando un bucle infinito.
-- 
-- En su lugar, usamos solo:
-- 1. Los usuarios pueden ver/editar su propio perfil
-- 2. El superusuario (raigo.16@gmail.com) puede ver/editar todos los perfiles
-- 
-- Si necesitas que otros admins gestionen usuarios, puedes:
-- - Usar una función RPC con SECURITY DEFINER que verifique permisos
-- - O asignar permisos específicos a través de la función es_superusuario()

-- 12. Crear perfiles para usuarios existentes que no tengan perfil
INSERT INTO user_profiles (id, email, nombre, rol)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'nombre', u.email),
    'usuario'
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 13. Comentarios para documentación
COMMENT ON TABLE user_profiles IS 'Perfiles de usuario con permisos y roles';
COMMENT ON COLUMN user_profiles.rol IS 'Rol del usuario: super_admin, admin, usuario, invitado';
COMMENT ON COLUMN user_profiles.permisos IS 'Permisos específicos en formato JSON: {"crear_natilleras": true, "editar_usuarios": false, ...}';

COMMENT ON POLICY "Users can view own profile or superuser all" ON user_profiles IS 
'Permite a los usuarios ver su propio perfil y al superusuario (raigo.16@gmail.com) ver todos los perfiles';

COMMENT ON POLICY "Users can update own profile or superuser all" ON user_profiles IS 
'Permite a los usuarios actualizar su propio perfil y al superusuario actualizar todos los perfiles';


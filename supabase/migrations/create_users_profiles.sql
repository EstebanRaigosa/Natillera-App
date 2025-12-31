-- Migración: Crear tabla de perfiles de usuario y sistema de permisos
-- ============================================

-- 1. Tabla de perfiles de usuario (extiende auth.users)
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

-- 2. Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rol ON user_profiles(rol);
CREATE INDEX IF NOT EXISTS idx_user_profiles_activo ON user_profiles(activo);

-- 3. Función para crear perfil automáticamente cuando se crea un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    'usuario' -- Rol por defecto
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil (solo ciertos campos)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Los super_admins pueden ver todos los perfiles
CREATE POLICY "Super admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol = 'super_admin'
    )
  );

-- Los super_admins pueden actualizar todos los perfiles
CREATE POLICY "Super admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol = 'super_admin'
    )
  );

-- Los admins pueden ver y actualizar perfiles de usuarios (no otros admins)
CREATE POLICY "Admins can manage users"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND rol IN ('super_admin', 'admin')
    ) AND (rol IN ('usuario', 'invitado') OR auth.uid() = id)
  );

-- 9. Comentarios para documentación
COMMENT ON TABLE user_profiles IS 'Perfiles de usuario con permisos y roles';
COMMENT ON COLUMN user_profiles.rol IS 'Rol del usuario: super_admin, admin, usuario, invitado';
COMMENT ON COLUMN user_profiles.permisos IS 'Permisos específicos en formato JSON: {"crear_natilleras": true, "editar_usuarios": false, ...}';


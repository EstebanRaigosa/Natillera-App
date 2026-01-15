-- Migración: Crear tabla de configuración de usuario
-- ============================================
-- Esta tabla almacena las configuraciones personalizadas de cada usuario,
-- incluyendo mensajes de notificación y configuraciones de período y días de gracia

-- 1. Crear la tabla configuracion_usuario
CREATE TABLE IF NOT EXISTS configuracion_usuario (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    mensaje_individual TEXT,
    mensaje_general TEXT,
    mensaje_cuota_mora TEXT,
    mensaje_cuota_pendiente TEXT,
    config_periodo JSONB DEFAULT '{"mes_inicio": 1, "mes_fin": 11, "anio": null}',
    config_dias_gracia JSONB DEFAULT '{"dias_gracia": 3}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_configuracion_usuario_user_id ON configuracion_usuario(user_id);

-- 3. Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_configuracion_usuario_updated_at ON configuracion_usuario;
CREATE TRIGGER update_configuracion_usuario_updated_at
    BEFORE UPDATE ON configuracion_usuario
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE configuracion_usuario ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
-- Los usuarios pueden ver su propia configuración
CREATE POLICY "Users can view own configuration"
    ON configuracion_usuario FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden insertar su propia configuración
CREATE POLICY "Users can insert own configuration"
    ON configuracion_usuario FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propia configuración
CREATE POLICY "Users can update own configuration"
    ON configuracion_usuario FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar su propia configuración
CREATE POLICY "Users can delete own configuration"
    ON configuracion_usuario FOR DELETE
    USING (auth.uid() = user_id);

-- Los super_admins pueden ver todas las configuraciones
CREATE POLICY "Super admins can view all configurations"
    ON configuracion_usuario FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND rol = 'super_admin'
        )
    );

-- 6. Comentarios para documentación
COMMENT ON TABLE configuracion_usuario IS 'Configuraciones personalizadas de cada usuario (mensajes, períodos, días de gracia)';
COMMENT ON COLUMN configuracion_usuario.mensaje_individual IS 'Mensaje personalizado para notificaciones individuales';
COMMENT ON COLUMN configuracion_usuario.mensaje_general IS 'Mensaje personalizado para notificaciones generales';
COMMENT ON COLUMN configuracion_usuario.mensaje_cuota_mora IS 'Mensaje personalizado para cuotas en mora';
COMMENT ON COLUMN configuracion_usuario.mensaje_cuota_pendiente IS 'Mensaje personalizado para cuotas pendientes';
COMMENT ON COLUMN configuracion_usuario.config_periodo IS 'Configuración de período en formato JSON: {"mes_inicio": 1, "mes_fin": 11, "anio": 2024}';
COMMENT ON COLUMN configuracion_usuario.config_dias_gracia IS 'Configuración de días de gracia en formato JSON: {"dias_gracia": 3}';

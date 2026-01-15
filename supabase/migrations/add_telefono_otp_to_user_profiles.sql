-- Migración: Agregar campo telefono a user_profiles y tabla para códigos OTP
-- ============================================

-- 1. Agregar campo telefono a user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- 2. Crear índice para búsquedas rápidas por teléfono
CREATE INDEX IF NOT EXISTS idx_user_profiles_telefono ON user_profiles(telefono) WHERE telefono IS NOT NULL;

-- 3. Crear tabla para almacenar códigos OTP temporales
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telefono VARCHAR(20) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    intentos_verificacion INTEGER DEFAULT 0,
    max_intentos INTEGER DEFAULT 3,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    utilizado BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para la tabla otp_codes
CREATE INDEX IF NOT EXISTS idx_otp_codes_telefono ON otp_codes(telefono);
CREATE INDEX IF NOT EXISTS idx_otp_codes_codigo ON otp_codes(codigo);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expira_en ON otp_codes(expira_en);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_utilizado ON otp_codes(utilizado);

-- 5. Función para limpiar códigos OTP expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION limpiar_otp_expirados()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes
    WHERE expira_en < NOW() OR utilizado = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para validar y marcar código OTP como utilizado
CREATE OR REPLACE FUNCTION verificar_otp(
    p_telefono VARCHAR(20),
    p_codigo VARCHAR(6)
)
RETURNS TABLE(
    valido BOOLEAN,
    user_id UUID,
    mensaje TEXT
) AS $$
DECLARE
    v_otp_record otp_codes%ROWTYPE;
    v_user_record auth.users%ROWTYPE;
BEGIN
    -- Buscar el código OTP más reciente no utilizado para este teléfono
    SELECT * INTO v_otp_record
    FROM otp_codes
    WHERE telefono = p_telefono
        AND codigo = p_codigo
        AND utilizado = false
        AND expira_en > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    -- Si no se encuentra el código
    IF v_otp_record.id IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Código OTP inválido o expirado'::TEXT;
        RETURN;
    END IF;

    -- Verificar intentos máximos
    IF v_otp_record.intentos_verificacion >= v_otp_record.max_intentos THEN
        RETURN QUERY SELECT false, NULL::UUID, 'Se excedió el número máximo de intentos'::TEXT;
        RETURN;
    END IF;

    -- Incrementar intentos
    UPDATE otp_codes
    SET intentos_verificacion = intentos_verificacion + 1
    WHERE id = v_otp_record.id;

    -- Verificar si el código es correcto
    IF v_otp_record.codigo = p_codigo THEN
        -- Marcar como utilizado
        UPDATE otp_codes
        SET utilizado = true
        WHERE id = v_otp_record.id;

        -- Retornar éxito con el user_id si existe
        RETURN QUERY SELECT true, v_otp_record.user_id, 'Código OTP válido'::TEXT;
    ELSE
        RETURN QUERY SELECT false, NULL::UUID, 'Código OTP incorrecto'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS para otp_codes - solo el usuario puede ver sus propios códigos
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propios códigos OTP
CREATE POLICY "Users can view own otp codes"
    ON otp_codes FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Política: Permitir inserción pública de códigos OTP (para el servicio de envío)
CREATE POLICY "Public can insert otp codes"
    ON otp_codes FOR INSERT
    WITH CHECK (true);

-- Política: Permitir actualización de códigos OTP
CREATE POLICY "Users can update own otp codes"
    ON otp_codes FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 8. Comentarios
COMMENT ON COLUMN user_profiles.telefono IS 'Número de teléfono del usuario para autenticación por SMS';
COMMENT ON TABLE otp_codes IS 'Almacena códigos OTP temporales para autenticación por SMS';
COMMENT ON COLUMN otp_codes.codigo IS 'Código OTP de 6 dígitos';
COMMENT ON COLUMN otp_codes.intentos_verificacion IS 'Número de intentos de verificación realizados';
COMMENT ON COLUMN otp_codes.max_intentos IS 'Máximo número de intentos permitidos (default: 3)';
COMMENT ON COLUMN otp_codes.expira_en IS 'Fecha y hora de expiración del código (típicamente 10 minutos)';
COMMENT ON COLUMN otp_codes.utilizado IS 'Indica si el código ya fue utilizado exitosamente';
COMMENT ON COLUMN otp_codes.user_id IS 'ID del usuario asociado (puede ser NULL para nuevos usuarios)';

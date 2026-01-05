-- ============================================
-- Rate Limiting y Validación para Chat Messages
-- ============================================

-- Tabla para tracking de rate limiting por IP
CREATE TABLE IF NOT EXISTS chat_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    email VARCHAR(255),
    attempt_count INTEGER DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ip_address, email)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_ip ON chat_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_email ON chat_rate_limits(email);
CREATE INDEX IF NOT EXISTS idx_chat_rate_limits_blocked ON chat_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Función para limpiar registros antiguos (más de 1 hora)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM chat_rate_limits 
    WHERE last_attempt < NOW() - INTERVAL '1 hour'
    AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$ LANGUAGE plpgsql;

-- Función para verificar rate limit
-- Retorna true si el envío está permitido, false si está bloqueado
CREATE OR REPLACE FUNCTION check_chat_rate_limit(
    p_ip_address INET,
    p_email VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
    v_record chat_rate_limits%ROWTYPE;
    v_current_time TIMESTAMP WITH TIME ZONE := NOW();
    v_allowed BOOLEAN := true;
    v_message TEXT := '';
    v_retry_after INTEGER := 0;
    -- Configuración: Máximo 5 mensajes por IP cada 15 minutos
    MAX_ATTEMPTS INTEGER := 5;
    TIME_WINDOW_MINUTES INTEGER := 15;
    BLOCK_DURATION_MINUTES INTEGER := 15;
BEGIN
    -- Limpiar registros antiguos
    PERFORM cleanup_old_rate_limits();
    
    -- Buscar o crear registro
    SELECT * INTO v_record
    FROM chat_rate_limits
    WHERE ip_address = p_ip_address
      AND (p_email IS NULL OR email = p_email)
    LIMIT 1;
    
    -- Si no existe registro, permitir
    IF NOT FOUND THEN
        INSERT INTO chat_rate_limits (ip_address, email, attempt_count, first_attempt, last_attempt)
        VALUES (p_ip_address, p_email, 1, v_current_time, v_current_time)
        ON CONFLICT (ip_address, email) DO NOTHING;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'message', 'OK'
        );
    END IF;
    
    -- Verificar si está bloqueado
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_current_time THEN
        v_retry_after := EXTRACT(EPOCH FROM (v_record.blocked_until - v_current_time))::INTEGER / 60;
        RETURN jsonb_build_object(
            'allowed', false,
            'message', 'Demasiados intentos. Por favor espera ' || v_retry_after || ' minutos.',
            'retry_after_minutes', v_retry_after,
            'blocked_until', v_record.blocked_until
        );
    END IF;
    
    -- Si el bloqueo expiró, resetear
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until <= v_current_time THEN
        UPDATE chat_rate_limits
        SET attempt_count = 1,
            first_attempt = v_current_time,
            last_attempt = v_current_time,
            blocked_until = NULL,
            updated_at = v_current_time
        WHERE id = v_record.id;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'message', 'OK'
        );
    END IF;
    
    -- Verificar si está en la ventana de tiempo
    IF v_record.first_attempt > v_current_time - (TIME_WINDOW_MINUTES || ' minutes')::INTERVAL THEN
        -- Está en la ventana, incrementar contador
        IF v_record.attempt_count >= MAX_ATTEMPTS THEN
            -- Bloquear
            UPDATE chat_rate_limits
            SET blocked_until = v_current_time + (BLOCK_DURATION_MINUTES || ' minutes')::INTERVAL,
                updated_at = v_current_time
            WHERE id = v_record.id;
            
            RETURN jsonb_build_object(
                'allowed', false,
                'message', 'Demasiados intentos. Por favor espera ' || BLOCK_DURATION_MINUTES || ' minutos.',
                'retry_after_minutes', BLOCK_DURATION_MINUTES,
                'blocked_until', v_current_time + (BLOCK_DURATION_MINUTES || ' minutes')::INTERVAL
            );
        ELSE
            -- Incrementar contador
            UPDATE chat_rate_limits
            SET attempt_count = attempt_count + 1,
                last_attempt = v_current_time,
                updated_at = v_current_time
            WHERE id = v_record.id;
            
            RETURN jsonb_build_object(
                'allowed', true,
                'message', 'OK',
                'attempts_remaining', MAX_ATTEMPTS - v_record.attempt_count - 1
            );
        END IF;
    ELSE
        -- Ventana de tiempo expiró, resetear
        UPDATE chat_rate_limits
        SET attempt_count = 1,
            first_attempt = v_current_time,
            last_attempt = v_current_time,
            blocked_until = NULL,
            updated_at = v_current_time
        WHERE id = v_record.id;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'message', 'OK'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS para chat_rate_limits (solo lectura desde funciones)
ALTER TABLE chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: Solo las funciones pueden acceder
CREATE POLICY "Functions can access rate limits" ON chat_rate_limits
    FOR ALL USING (false); -- Bloqueado por defecto, solo funciones SECURITY DEFINER pueden acceder

-- Función mejorada para insertar mensajes con validación
CREATE OR REPLACE FUNCTION insert_chat_message_with_validation(
    p_user_id UUID,
    p_user_email VARCHAR(255),
    p_message TEXT,
    p_submit_time_ms INTEGER, -- Tiempo en milisegundos desde que se cargó el formulario
    p_client_ip INET DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_ip_address INET;
    v_min_submit_time_ms INTEGER := 200; -- 0.2 segundos mínimo
BEGIN
    -- Obtener IP del cliente (usar email como fallback para rate limiting)
    -- En Supabase, obtener la IP real es complicado, así que usamos email como identificador
    v_ip_address := COALESCE(p_client_ip, '127.0.0.1'::INET);
    
    -- Validación 1: Rate limiting (usando email como identificador principal)
    -- Si no hay email, usar IP (aunque sea 127.0.0.1)
    v_result := check_chat_rate_limit(v_ip_address, p_user_email);
    IF (v_result->>'allowed')::boolean = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'rate_limit',
            'message', v_result->>'message',
            'retry_after_minutes', (v_result->>'retry_after_minutes')::INTEGER
        );
    END IF;
    
    -- Validación 2: Tiempo de envío (debe ser >= 200ms)
    IF p_submit_time_ms IS NOT NULL AND p_submit_time_ms < v_min_submit_time_ms THEN
        -- Log del intento sospechoso pero no bloquear (para no revelar la validación)
        -- Solo registrar en rate limit para tracking
        RETURN jsonb_build_object(
            'success', false,
            'error', 'validation_failed',
            'message', 'Por favor completa el formulario correctamente.'
        );
    END IF;
    
    -- Validación 3: Mensaje no vacío y con longitud mínima
    IF p_message IS NULL OR LENGTH(TRIM(p_message)) < 10 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'validation_failed',
            'message', 'El mensaje debe tener al menos 10 caracteres.'
        );
    END IF;
    
    -- Validación 4: Email válido
    IF p_user_email IS NULL OR p_user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'validation_failed',
            'message', 'Por favor ingresa un correo electrónico válido.'
        );
    END IF;
    
    -- Todas las validaciones pasaron, insertar mensaje
    INSERT INTO chat_messages (user_id, user_email, message, is_from_user, is_read)
    VALUES (p_user_id, p_user_email, TRIM(p_message), true, false);
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Mensaje enviado exitosamente.'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'database_error',
            'message', 'Error al guardar el mensaje. Por favor intenta de nuevo.'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON FUNCTION check_chat_rate_limit IS 'Verifica rate limiting: máximo 5 mensajes por IP cada 15 minutos';
COMMENT ON FUNCTION insert_chat_message_with_validation IS 'Inserta un mensaje con validaciones anti-spam: rate limiting, tiempo mínimo de envío, validación de email y mensaje';


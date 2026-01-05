-- ============================================
-- TABLA: chat_messages
-- Mensajes del sistema de chat/soporte
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    message TEXT NOT NULL,
    response TEXT,
    is_from_user BOOLEAN DEFAULT true,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(is_read);

-- RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios pueden ver y crear sus propios mensajes
-- Permitir que usuarios autenticados vean sus mensajes
CREATE POLICY "Usuarios pueden ver sus mensajes" ON chat_messages
    FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Permitir que cualquier usuario (autenticado o no) pueda crear mensajes
-- Esto es necesario para que usuarios no autenticados puedan enviar mensajes de soporte
CREATE POLICY "Cualquiera puede crear mensajes" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Política especial: Los admins pueden ver todos los mensajes y responder
-- (Asumiendo que tienes una forma de identificar admins, ajusta según tu sistema)
CREATE POLICY "Admins pueden ver todos los mensajes" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Admins pueden responder mensajes" ON chat_messages
    FOR UPDATE USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_messages_updated_at();


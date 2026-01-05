-- ============================================
-- Agregar columna user_email a chat_messages
-- ============================================
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Actualizar mensajes existentes con el email del usuario (si es posible)
-- Nota: Esto requiere permisos especiales para acceder a auth.users
-- Si no tienes esos permisos, los mensajes antiguos mostrarán null


-- ============================================
-- Corregir políticas RLS para chat_messages
-- Permitir que usuarios no autenticados puedan enviar mensajes
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden crear mensajes" ON chat_messages;
DROP POLICY IF EXISTS "Cualquiera puede crear mensajes" ON chat_messages;

-- Crear nueva política que permita a cualquiera insertar mensajes
-- Esto es necesario para el chat de soporte donde usuarios no autenticados pueden escribir
CREATE POLICY "Cualquiera puede crear mensajes" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Mantener la política de lectura para usuarios autenticados
-- (La política de SELECT ya existe, solo la mantenemos)


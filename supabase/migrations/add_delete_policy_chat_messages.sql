-- ============================================
-- Agregar política DELETE para chat_messages
-- Permitir que admins puedan eliminar mensajes
-- ============================================

-- Política para que admins puedan eliminar mensajes
CREATE POLICY "Admins pueden eliminar mensajes" ON chat_messages
    FOR DELETE USING (true);


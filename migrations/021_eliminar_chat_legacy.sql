-- ============================================================================
-- 021 — Eliminar el sistema de chat/soporte anterior
--
-- Retira `chat_messages`, `chat_rate_limits` y sus funciones y políticas, para
-- dejar el terreno limpio antes de construir el nuevo módulo de soporte
-- (ver Especificaciones/chat-soporte/especificacion.md).
--
-- ⚠️  LEE ESTO ANTES DE EJECUTAR
--
-- `chat_messages` contiene mensajes reales enviados por usuarios. El PASO 1 los
-- copia a una tabla de respaldo antes de borrar nada. No elimines ese respaldo
-- hasta haber comprobado que no queda nada que responder.
--
-- Para consultar el respaldo después:
--     SELECT * FROM chat_messages_respaldo_20260831 ORDER BY created_at DESC;
--
-- Para eliminarlo cuando ya no haga falta:
--     DROP TABLE IF EXISTS chat_messages_respaldo_20260831;
--
-- El bucket de Storage `support-files` NO se borra aquí: los buckets no se
-- gestionan por SQL. Ver el PASO 5.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- PASO 1 — Respaldo de los datos
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN

    EXECUTE 'CREATE TABLE IF NOT EXISTS chat_messages_respaldo_20260831 AS
             SELECT * FROM chat_messages';

    -- El respaldo queda fuera del alcance de la API pública: sin permisos para los
    -- roles de PostgREST, no se expone a ningún cliente.
    EXECUTE 'REVOKE ALL ON TABLE chat_messages_respaldo_20260831 FROM anon, authenticated';

    RAISE NOTICE 'Respaldo creado: % fila(s) en chat_messages_respaldo_20260831',
      (SELECT COUNT(*) FROM chat_messages_respaldo_20260831);
  ELSE
    RAISE NOTICE 'chat_messages no existe; no hay nada que respaldar';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- PASO 2 — Políticas RLS del sistema anterior
--
-- Se listan una a una en lugar de confiar en el DROP TABLE, para dejar
-- constancia de cuáles existían. Todas ellas usaban USING (true), es decir,
-- no restringían nada.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver sus mensajes"        ON chat_messages;
DROP POLICY IF EXISTS "Cualquiera puede crear mensajes"         ON chat_messages;
DROP POLICY IF EXISTS "Usuarios pueden crear mensajes"          ON chat_messages;
DROP POLICY IF EXISTS "Admins pueden ver todos los mensajes"    ON chat_messages;
DROP POLICY IF EXISTS "Admins pueden responder mensajes"        ON chat_messages;
DROP POLICY IF EXISTS "Admins pueden eliminar mensajes"         ON chat_messages;
DROP POLICY IF EXISTS "Functions can access rate limits"        ON chat_rate_limits;

-- Políticas del bucket público de adjuntos
DROP POLICY IF EXISTS "Cualquiera puede subir archivos de soporte"      ON storage.objects;
DROP POLICY IF EXISTS "Cualquiera puede leer archivos de soporte"       ON storage.objects;
DROP POLICY IF EXISTS "Solo admins pueden eliminar archivos de soporte" ON storage.objects;

-- ---------------------------------------------------------------------------
-- PASO 3 — Funciones y triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER  IF EXISTS trigger_update_chat_messages_updated_at ON chat_messages;
DROP FUNCTION IF EXISTS update_chat_messages_updated_at()            CASCADE;
DROP FUNCTION IF EXISTS insert_chat_message_with_validation(UUID, VARCHAR, TEXT, INTEGER, INET) CASCADE;
DROP FUNCTION IF EXISTS check_chat_rate_limit(INET, VARCHAR)         CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_rate_limits()                    CASCADE;

-- ---------------------------------------------------------------------------
-- PASO 4 — Tablas
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS chat_messages    CASCADE;
DROP TABLE IF EXISTS chat_rate_limits CASCADE;

COMMIT;

-- ---------------------------------------------------------------------------
-- PASO 5 — Manual, fuera de SQL
--
-- 1. Storage → bucket `support-files`: descarga lo que quieras conservar y
--    elimina el bucket desde el panel de Supabase. Era público: cualquiera con
--    la URL podía abrir los adjuntos.
--
-- 2. EmailJS: la plantilla de respuestas de soporte y sus claves ya no se usan.
--    Revoca las claves públicas que estaban embebidas en el cliente.
--
-- 3. Comprueba que ya no queda nada:
--       SELECT table_name FROM information_schema.tables
--       WHERE table_schema = 'public' AND table_name LIKE 'chat%';
--    Debe devolver únicamente chat_messages_respaldo_20260831.
-- ---------------------------------------------------------------------------

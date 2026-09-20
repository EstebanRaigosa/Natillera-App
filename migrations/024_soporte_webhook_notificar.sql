-- ============================================================================
-- 024 — El aviso a la Edge Function cuando entra un mensaje
--
-- Es lo que el panel de Supabase llama «Database Webhook»: un trigger que hace
-- una petición HTTP con pg_net. Se crea a mano por dos motivos: la sección del
-- panel cambió de sitio con los rediseños, y este proyecto no tenía ningún
-- webhook, así que ni siquiera existía el esquema `supabase_functions` que los
-- gestiona.
--
-- ⚠️  No se usa la clave `service_role`, sino un secreto DEDICADO a esta tarea.
-- La `service_role` da acceso total a la base saltándose RLS: si se filtra, se
-- pierde todo. Este secreto solo permite pedir el envío de una notificación.
--
-- Tampoco se escribe en este archivo: vive en Vault, cifrado. Ponerlo en el
-- cuerpo de la función lo dejaría en texto plano en el catálogo del sistema.
--
-- Puesta en marcha, una sola vez. El MISMO valor va en los dos sitios:
--
--   1) En la base:
--        SELECT vault.create_secret(
--          '<SECRETO>', 'soporte_webhook_secret',
--          'Autoriza al trigger de soporte a invocar la Edge Function');
--
--   2) En los secretos de la Edge Function, como SOPORTE_WEBHOOK_SECRET.
--
-- Para generarlo:  SELECT encode(gen_random_bytes(32), 'base64');
--
-- Rotación:
--     SELECT vault.update_secret(
--       (SELECT id FROM vault.secrets WHERE name = 'soporte_webhook_secret'),
--       '<NUEVO_SECRETO>');
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.soporte_avisar_notificador()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, vault, pg_temp
AS $$
DECLARE
  v_secreto text;
BEGIN
  SELECT decrypted_secret INTO v_secreto
  FROM vault.decrypted_secrets
  WHERE name = 'soporte_webhook_secret'
  LIMIT 1;

  IF v_secreto IS NULL THEN
    RAISE WARNING 'soporte: falta el secreto «soporte_webhook_secret» en Vault; no se envía la notificación';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := 'https://vdtjacwpvqfifahkrqxp.supabase.co/functions/v1/soporte-notificar',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || v_secreto),
    body    := jsonb_build_object(
                 'type',       'INSERT',
                 'table',      TG_TABLE_NAME,
                 'schema',     TG_TABLE_SCHEMA,
                 'record',     to_jsonb(NEW),
                 'old_record', NULL),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- RNF-10 y CA-20: notificar nunca puede impedir que el mensaje se guarde.
  RAISE WARNING 'soporte: no se pudo encolar la notificación (%)', SQLERRM;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.soporte_avisar_notificador() IS
  'Avisa a la Edge Function soporte-notificar de cada mensaje nuevo. Equivale a un Database Webhook del panel.';

DROP TRIGGER IF EXISTS trg_soporte_avisar_notificador ON public.soporte_mensajes;
CREATE TRIGGER trg_soporte_avisar_notificador
  AFTER INSERT ON public.soporte_mensajes
  FOR EACH ROW EXECUTE FUNCTION public.soporte_avisar_notificador();

REVOKE ALL ON FUNCTION public.soporte_avisar_notificador() FROM public, anon, authenticated;

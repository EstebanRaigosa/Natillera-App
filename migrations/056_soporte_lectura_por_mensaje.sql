-- ============================================================================
-- 056 — Confirmación de lectura de cada mensaje del soporte
--
-- El soporte necesita saber CUÁNDO el usuario leyó cada mensaje suyo. La
-- conversación solo guarda `leido_usuario_at`, la última vez que el usuario la
-- abrió: sirve para el contador de no leídos, pero se sobrescribe en cada
-- lectura y no dice cuándo se leyó un mensaje concreto.
--
-- `soporte_mensajes.leido_at` fija ese momento una sola vez. Lo escribe un
-- trigger al avanzar `leido_usuario_at`, que es el único camino por el que el
-- usuario lee: abrir la conversación (`soporte_marcar_leido`) o escribir en ella
-- (quien escribe ha visto lo anterior). Así no hay que tocar esas funciones.
--
-- Solo se marca lo que escribió el soporte: la lectura del usuario es lo que el
-- soporte quiere ver, y la pantalla del usuario no muestra nada de esto.
--
-- Mensajes anteriores a esta migración: quedan con `leido_at` nulo. No se sabe
-- cuándo se leyeron; el panel los da por leídos sin hora si caen antes de
-- `leido_usuario_at`.
-- ============================================================================

ALTER TABLE public.soporte_mensajes
  ADD COLUMN IF NOT EXISTS leido_at timestamptz;

COMMENT ON COLUMN public.soporte_mensajes.leido_at IS
  'Cuándo el usuario leyó este mensaje del soporte por primera vez. Nulo en los del usuario.';

CREATE OR REPLACE FUNCTION public.soporte_fijar_lectura_mensajes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.leido_usuario_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.leido_usuario_at IS NOT NULL AND NEW.leido_usuario_at <= OLD.leido_usuario_at THEN
    RETURN NEW;
  END IF;

  UPDATE public.soporte_mensajes
     SET leido_at = NEW.leido_usuario_at
   WHERE conversacion_id = NEW.id
     AND autor = 'soporte'
     AND leido_at IS NULL
     AND created_at <= NEW.leido_usuario_at;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.soporte_fijar_lectura_mensajes() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS soporte_fijar_lectura_mensajes ON public.soporte_conversaciones;
CREATE TRIGGER soporte_fijar_lectura_mensajes
  AFTER UPDATE OF leido_usuario_at ON public.soporte_conversaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.soporte_fijar_lectura_mensajes();

-- Realtime: el panel de soporte se entera de la lectura sin recargar. Se añade
-- `leido_usuario_at` a la lista de columnas publicadas (ver 023: se publica por
-- lista para no filtrar `nota_interna`). Es un dato del propio usuario, no
-- expone nada que él no pueda leer ya.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.soporte_conversaciones;
  ALTER PUBLICATION supabase_realtime
    ADD TABLE public.soporte_conversaciones (id, numero, user_id, asunto, categoria, estado, ultimo_mensaje_at, leido_usuario_at);
END $$;

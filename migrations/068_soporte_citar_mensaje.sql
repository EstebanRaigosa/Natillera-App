-- ============================================================================
-- 068 — Citar un mensaje al responder en el chat de soporte
--
-- `soporte_mensajes.respuesta_a` apunta al mensaje que se cita. Se guarda solo el
-- id, no una copia del texto: los mensajes no se editan ni se borran sueltos (se
-- borra la conversación entera, y la cita con ella), así que el original siempre
-- está para pintarla. ON DELETE SET NULL cubre el caso de que algún día cambie.
--
-- `soporte_enviar_mensaje` gana el parámetro `p_respuesta_a`. Añadirlo con
-- CREATE OR REPLACE crearía una segunda función con otra firma, y PostgREST no
-- sabría a cuál llamar cuando la app no lo envía: se borra la de 6 parámetros
-- y queda solo la de 7, con el nuevo en DEFAULT NULL para que la versión de la
-- app ya publicada siga funcionando igual.
--
-- La función parte de la de 067; solo cambia lo de la cita.
-- ============================================================================

ALTER TABLE public.soporte_mensajes
  ADD COLUMN IF NOT EXISTS respuesta_a uuid REFERENCES public.soporte_mensajes(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.soporte_mensajes.respuesta_a IS
  'Mensaje de la misma conversación al que responde este, citado en la burbuja. Nulo si no cita.';

DROP FUNCTION IF EXISTS public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.soporte_enviar_mensaje(
  p_conversacion_id uuid,
  p_client_id       uuid,
  p_cuerpo          text,
  p_asunto          text  DEFAULT NULL,
  p_categoria       text  DEFAULT NULL,
  p_adjuntos        jsonb DEFAULT '[]'::jsonb,  -- [{ruta,nombre,mime,bytes}]
  p_respuesta_a     uuid  DEFAULT NULL           -- mensaje citado
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid        uuid := (SELECT auth.uid());
  v_es_super   boolean;
  v_conv       public.soporte_conversaciones%ROWTYPE;
  v_mensaje    public.soporte_mensajes%ROWTYPE;
  v_autor      text;
  v_email      text;
  v_conteo     integer;
  v_espera     integer;
  v_adj        jsonb;
  v_es_video   boolean;
  v_bytes      bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_SIN_SESION: hay que iniciar sesión para escribir a soporte' USING ERRCODE = '28000';
  END IF;

  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: falta el identificador de envío' USING ERRCODE = '22023';
  END IF;

  v_es_super := public.es_super_admin();
  p_cuerpo   := btrim(coalesce(p_cuerpo, ''));

  IF p_conversacion_id IS NULL THEN
    SELECT m.* INTO v_mensaje
    FROM public.soporte_mensajes m
    JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
    WHERE m.client_id = p_client_id AND c.user_id = v_uid;
  ELSE
    SELECT * INTO v_mensaje
    FROM public.soporte_mensajes
    WHERE conversacion_id = p_conversacion_id AND client_id = p_client_id;
  END IF;

  IF v_mensaje.id IS NOT NULL THEN
    SELECT * INTO v_conv FROM public.soporte_conversaciones WHERE id = v_mensaje.conversacion_id;
    RETURN jsonb_build_object(
      'idempotente',     true,
      'conversacion_id', v_conv.id,
      'numero',          v_conv.numero,
      'estado',          v_conv.estado,
      'mensaje', jsonb_build_object(
        'id', v_mensaje.id, 'client_id', v_mensaje.client_id, 'autor', v_mensaje.autor,
        'cuerpo', v_mensaje.cuerpo, 'created_at', v_mensaje.created_at,
        'respuesta_a', v_mensaje.respuesta_a)
    );
  END IF;

  IF p_conversacion_id IS NULL THEN
    IF char_length(coalesce(btrim(p_asunto), '')) NOT BETWEEN 5 AND 120 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: el asunto debe tener entre 5 y 120 caracteres' USING ERRCODE = '22023';
    END IF;
    IF p_categoria IS NULL OR p_categoria NOT IN ('error','duda','sugerencia','cuenta','otro') THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: categoría no válida' USING ERRCODE = '22023';
    END IF;
    IF char_length(p_cuerpo) NOT BETWEEN 10 AND 4000 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: el mensaje debe tener entre 10 y 4000 caracteres' USING ERRCODE = '22023';
    END IF;

    IF NOT v_es_super THEN
      SELECT COUNT(*) INTO v_conteo
      FROM public.soporte_conversaciones
      WHERE user_id = v_uid AND created_at > now() - interval '1 hour';

      IF v_conteo >= 5 THEN
        SELECT ceil(extract(epoch FROM (min(created_at) + interval '1 hour' - now())) / 60)::int
          INTO v_espera
        FROM public.soporte_conversaciones
        WHERE user_id = v_uid AND created_at > now() - interval '1 hour';
        RAISE EXCEPTION 'SOPORTE_LIMITE: has abierto 5 conversaciones en la última hora; vuelve a intentarlo en % minutos', greatest(v_espera, 1)
          USING ERRCODE = 'P0001';
      END IF;
    END IF;

    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

    INSERT INTO public.soporte_conversaciones (user_id, user_email, asunto, categoria, estado, ultimo_mensaje_at)
    VALUES (v_uid, coalesce(v_email, 'desconocido'), btrim(p_asunto), p_categoria, 'abierta', now())
    RETURNING * INTO v_conv;

    v_autor := 'usuario';
  ELSE
    SELECT * INTO v_conv FROM public.soporte_conversaciones WHERE id = p_conversacion_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'SOPORTE_NO_EXISTE: la conversación ya no existe' USING ERRCODE = 'P0002';
    END IF;

    IF v_conv.user_id = v_uid THEN
      v_autor := 'usuario';
    ELSIF v_es_super THEN
      v_autor := 'soporte';
    ELSE
      RAISE EXCEPTION 'SOPORTE_PROHIBIDO: no puedes escribir en esta conversación' USING ERRCODE = '42501';
    END IF;

    IF char_length(p_cuerpo) NOT BETWEEN 1 AND 4000 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: el mensaje debe tener entre 1 y 4000 caracteres' USING ERRCODE = '22023';
    END IF;

    IF v_conv.estado = 'archivada' THEN
      RAISE EXCEPTION 'SOPORTE_ARCHIVADA: esta conversación está archivada y no admite mensajes nuevos' USING ERRCODE = 'P0001';
    END IF;

    IF NOT v_es_super THEN
      SELECT COUNT(*) INTO v_conteo
      FROM public.soporte_mensajes m
      JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
      WHERE c.user_id = v_uid AND m.autor = 'usuario' AND m.created_at > now() - interval '1 hour';

      IF v_conteo >= 30 THEN
        SELECT ceil(extract(epoch FROM (min(m.created_at) + interval '1 hour' - now())) / 60)::int
          INTO v_espera
        FROM public.soporte_mensajes m
        JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
        WHERE c.user_id = v_uid AND m.autor = 'usuario' AND m.created_at > now() - interval '1 hour';
        RAISE EXCEPTION 'SOPORTE_LIMITE: has enviado 30 mensajes en la última hora; vuelve a intentarlo en % minutos', greatest(v_espera, 1)
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;

  -- La cita solo puede apuntar a un mensaje de esta misma conversación: el id
  -- lo manda el cliente, y sin esta comprobación serviría para asomar en el hilo
  -- propio un mensaje de una conversación ajena.
  IF p_respuesta_a IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.soporte_mensajes
    WHERE id = p_respuesta_a AND conversacion_id = v_conv.id
  ) THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: el mensaje citado no está en esta conversación' USING ERRCODE = '22023';
  END IF;

  BEGIN
    INSERT INTO public.soporte_mensajes (conversacion_id, client_id, autor, cuerpo, respuesta_a)
    VALUES (v_conv.id, p_client_id, v_autor, p_cuerpo, p_respuesta_a)
    RETURNING * INTO v_mensaje;
  EXCEPTION WHEN unique_violation THEN
    SELECT * INTO v_mensaje
    FROM public.soporte_mensajes
    WHERE conversacion_id = v_conv.id AND client_id = p_client_id;

    RETURN jsonb_build_object(
      'idempotente',     true,
      'conversacion_id', v_conv.id,
      'numero',          v_conv.numero,
      'estado',          v_conv.estado,
      'mensaje', jsonb_build_object(
        'id', v_mensaje.id, 'client_id', v_mensaje.client_id, 'autor', v_mensaje.autor,
        'cuerpo', v_mensaje.cuerpo, 'created_at', v_mensaje.created_at,
        'respuesta_a', v_mensaje.respuesta_a)
    );
  END;

  IF p_adjuntos IS NOT NULL AND jsonb_typeof(p_adjuntos) = 'array' THEN
    IF jsonb_array_length(p_adjuntos) > 5 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: máximo 5 adjuntos por mensaje' USING ERRCODE = '22023';
    END IF;
    FOR v_adj IN SELECT * FROM jsonb_array_elements(p_adjuntos) LOOP
      IF (v_adj->>'mime') NOT IN ('image/png','image/jpeg','image/webp','image/heic','application/pdf','text/plain',
                                  'video/mp4','video/quicktime','video/webm') THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: tipo de archivo no admitido (%)', v_adj->>'mime' USING ERRCODE = '22023';
      END IF;
      v_es_video := (v_adj->>'mime') LIKE 'video/%';

      -- La ruta la manda el cliente: si no empieza por la carpeta de quien
      -- llama, es un intento de registrar como propio un archivo de otro.
      IF coalesce(v_adj->>'ruta', '') NOT LIKE v_uid::text || '/%' THEN
        RAISE EXCEPTION 'SOPORTE_PROHIBIDO: adjunto fuera de tu carpeta' USING ERRCODE = '42501';
      END IF;

      -- El tamaño se toma del objeto subido, no del que declara el cliente: con
      -- el bucket ya en 50 MB, declarar «3 MB» bastaría para colar un PDF de 40.
      SELECT coalesce((o.metadata->>'size')::bigint, (v_adj->>'bytes')::bigint) INTO v_bytes
      FROM storage.objects o
      WHERE o.bucket_id = 'soporte-adjuntos' AND o.name = v_adj->>'ruta';

      IF NOT FOUND THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: el adjunto no se subió correctamente' USING ERRCODE = '22023';
      END IF;

      IF v_es_video AND coalesce(v_bytes, 0) > 52428800 THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: el vídeo supera los 50 MB' USING ERRCODE = '22023';
      END IF;
      IF NOT v_es_video AND coalesce(v_bytes, 0) > 5242880 THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: el adjunto supera los 5 MB' USING ERRCODE = '22023';
      END IF;

      INSERT INTO public.soporte_adjuntos (mensaje_id, ruta, nombre, mime, bytes)
      VALUES (v_mensaje.id, v_adj->>'ruta', left(coalesce(v_adj->>'nombre', 'adjunto'), 120),
              v_adj->>'mime', v_bytes::int);
    END LOOP;
  END IF;

  UPDATE public.soporte_conversaciones
  SET ultimo_mensaje_at = v_mensaje.created_at,
      estado = CASE WHEN v_autor = 'usuario' AND estado = 'resuelta' THEN 'abierta' ELSE estado END,
      leido_usuario_at = CASE WHEN v_autor = 'usuario' THEN v_mensaje.created_at ELSE leido_usuario_at END,
      leido_soporte_at = CASE WHEN v_autor = 'soporte' THEN v_mensaje.created_at ELSE leido_soporte_at END
  WHERE id = v_conv.id
  RETURNING * INTO v_conv;

  RETURN jsonb_build_object(
    'idempotente',     false,
    'conversacion_id', v_conv.id,
    'numero',          v_conv.numero,
    'estado',          v_conv.estado,
    'mensaje', jsonb_build_object(
      'id', v_mensaje.id, 'client_id', v_mensaje.client_id, 'autor', v_mensaje.autor,
      'cuerpo', v_mensaje.cuerpo, 'created_at', v_mensaje.created_at,
        'respuesta_a', v_mensaje.respuesta_a)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb, uuid) TO authenticated;

-- Realtime publica `soporte_mensajes` por lista de columnas (023, 056): sin
-- añadirla, el mensaje que llega en vivo no traería su cita hasta recargar.
-- DROP + ADD y no SET TABLE: SET reemplazaría la publicación entera.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.soporte_mensajes;
  ALTER PUBLICATION supabase_realtime
    ADD TABLE public.soporte_mensajes (id, conversacion_id, client_id, autor, cuerpo, created_at, leido_at, respuesta_a);
END $$;

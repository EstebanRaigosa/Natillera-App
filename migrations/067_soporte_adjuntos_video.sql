-- ============================================================================
-- 067 — Vídeos cortos en el chat de soporte
--
-- Un error que se reproduce tocando la pantalla se explica mejor con una
-- grabación de 30 segundos que con cinco capturas. Se admiten MP4, MOV (lo que
-- entrega el iPhone) y WebM (grabación de pantalla en escritorio), de hasta
-- 50 MB. El resto de adjuntos sigue en 5 MB.
--
-- La duración (menos de 2 minutos) se comprueba en el cliente al elegir el
-- archivo: el servidor no tiene forma barata de leerla. El techo que sí impone
-- aquí es el peso, que es lo que cuesta almacenamiento.
--
-- Tres sitios guardaban el límite de 5 MB y la lista de tipos:
--   1. el bucket (`file_size_limit`, `allowed_mime_types`): primera barrera;
--   2. el CHECK de `soporte_adjuntos.bytes`;
--   3. `soporte_enviar_mensaje`, que ahora mide el límite por tipo y contra el
--      tamaño real del objeto subido, no contra el que declara el cliente.
--
-- La función se reescribe a partir de la versión que había en producción (que
-- difiere de 028 y 025 en el reabrir de la resuelta); solo cambia el bloque de
-- adjuntos.
-- ============================================================================

UPDATE storage.buckets
SET file_size_limit    = 52428800,  -- 50 MB: el tope de los vídeos
    allowed_mime_types = ARRAY[
      'image/png','image/jpeg','image/webp','image/heic','application/pdf','text/plain',
      'video/mp4','video/quicktime','video/webm'
    ]
WHERE id = 'soporte-adjuntos';

ALTER TABLE public.soporte_adjuntos DROP CONSTRAINT IF EXISTS soporte_adjuntos_bytes_check;
ALTER TABLE public.soporte_adjuntos
  ADD CONSTRAINT soporte_adjuntos_bytes_check CHECK (bytes > 0 AND bytes <= 52428800);

CREATE OR REPLACE FUNCTION public.soporte_enviar_mensaje(
  p_conversacion_id uuid,
  p_client_id       uuid,
  p_cuerpo          text,
  p_asunto          text  DEFAULT NULL,
  p_categoria       text  DEFAULT NULL,
  p_adjuntos        jsonb DEFAULT '[]'::jsonb  -- [{ruta,nombre,mime,bytes}]
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
        'cuerpo', v_mensaje.cuerpo, 'created_at', v_mensaje.created_at)
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

  BEGIN
    INSERT INTO public.soporte_mensajes (conversacion_id, client_id, autor, cuerpo)
    VALUES (v_conv.id, p_client_id, v_autor, p_cuerpo)
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
        'cuerpo', v_mensaje.cuerpo, 'created_at', v_mensaje.created_at)
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
      'cuerpo', v_mensaje.cuerpo, 'created_at', v_mensaje.created_at)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) TO authenticated;

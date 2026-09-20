-- ---------------------------------------------------------------------------
-- 025 · Soporte: una conversación resuelta no se reabre escribiendo
-- ---------------------------------------------------------------------------
--
-- Cambio de regla (RN-06). Hasta ahora, un mensaje del usuario en una
-- conversación resuelta la devolvía a `abierta`. Eso convertía «resuelta» en
-- una etiqueta provisional: hilos cerrados hace semanas volvían a la bandeja
-- con un «gracias» o con una consulta nueva pegada a un caso que ya no tenía
-- nada que ver, y el historial dejaba de contar una cosa sola.
--
-- A partir de aquí, resuelta es un final:
--   · el usuario no puede escribir en ella; se le pide abrir una nueva,
--   · el soporte sí puede, y es el único que puede devolverla a `abierta`
--     con `soporte_actualizar_conversacion` (RN-05, sin cambios),
--   · archivada sigue siendo de solo lectura para todos (RN-08, sin cambios).
--
-- Solo se sustituye `soporte_enviar_mensaje`; el resto de 022 queda igual.
-- Idempotente: es un CREATE OR REPLACE.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.soporte_enviar_mensaje(
  p_conversacion_id uuid,          -- NULL para abrir una conversación nueva
  p_client_id       uuid,          -- idempotencia (RF-04)
  p_cuerpo          text,
  p_asunto          text DEFAULT NULL,   -- solo al abrir
  p_categoria       text DEFAULT NULL,   -- solo al abrir
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
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_SIN_SESION: hay que iniciar sesión para escribir a soporte' USING ERRCODE = '28000';
  END IF;

  IF p_client_id IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: falta el identificador de envío' USING ERRCODE = '22023';
  END IF;

  v_es_super := public.es_super_admin();
  p_cuerpo   := btrim(coalesce(p_cuerpo, ''));

  -- -------------------------------------------------------------------------
  -- 1. Idempotencia (RF-04, CA-04). Antes que cualquier validación o límite:
  --    un reintento tiene que devolver lo mismo que el intento que sí llegó.
  -- -------------------------------------------------------------------------
  IF p_conversacion_id IS NULL THEN
    -- Apertura: el doble clic manda dos veces con conversacion_id NULL, así que
    -- la búsqueda es por client_id entre las conversaciones del propio usuario.
    -- Sin esto, un doble clic al abrir crearía dos hilos (caso borde 3).
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

  -- -------------------------------------------------------------------------
  -- 2. Conversación: existente o nueva
  -- -------------------------------------------------------------------------
  IF p_conversacion_id IS NULL THEN
    -- Apertura. Solo el usuario abre conversaciones: el soporte no inicia hilos
    -- (decisión P-3 de la especificación).
    IF char_length(coalesce(btrim(p_asunto), '')) NOT BETWEEN 5 AND 120 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: el asunto debe tener entre 5 y 120 caracteres' USING ERRCODE = '22023';
    END IF;
    IF p_categoria IS NULL OR p_categoria NOT IN ('error','duda','sugerencia','cuenta','otro') THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: categoría no válida' USING ERRCODE = '22023';
    END IF;
    IF char_length(p_cuerpo) NOT BETWEEN 10 AND 4000 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: el mensaje debe tener entre 10 y 4000 caracteres' USING ERRCODE = '22023';
    END IF;

    -- RF-18: 5 conversaciones nuevas por hora. El superadministrador queda exento.
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
      -- Caso borde 10: responder a una conversación recién borrada.
      RAISE EXCEPTION 'SOPORTE_NO_EXISTE: la conversación ya no existe' USING ERRCODE = 'P0002';
    END IF;

    -- Autoría: la determina el servidor, nunca el cliente (CA-16). El dueño del
    -- hilo escribe como usuario aunque además sea superadministrador; así el
    -- superadministrador puede usar el soporte como cualquiera.
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

    -- RN-08: una conversación archivada es de solo lectura. Para retomarla, el
    -- superadministrador la reabre con soporte_cambiar_estado (RN-05).
    IF v_conv.estado = 'archivada' THEN
      RAISE EXCEPTION 'SOPORTE_ARCHIVADA: esta conversación está archivada y no admite mensajes nuevos' USING ERRCODE = 'P0001';
    END IF;

    -- RN-06 (nueva redacción): resuelta es un final, no una pausa. El usuario ya
    -- no la reabre escribiendo; para lo siguiente abre otra conversación.
    --
    -- El soporte sí puede seguir escribiendo en una resuelta: a veces queda un
    -- dato por añadir después de cerrar, y quien decide reabrirla de verdad es
    -- él, con soporte_actualizar_conversacion.
    IF v_conv.estado = 'resuelta' AND v_autor = 'usuario' THEN
      RAISE EXCEPTION 'SOPORTE_RESUELTA: esta conversación ya está resuelta; abre una nueva y la vemos' USING ERRCODE = 'P0001';
    END IF;

    -- RF-18: 30 mensajes por hora.
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

  -- -------------------------------------------------------------------------
  -- 3. Mensaje
  -- -------------------------------------------------------------------------
  BEGIN
    INSERT INTO public.soporte_mensajes (conversacion_id, client_id, autor, cuerpo)
    VALUES (v_conv.id, p_client_id, v_autor, p_cuerpo)
    RETURNING * INTO v_mensaje;
  EXCEPTION WHEN unique_violation THEN
    -- Dos envíos con el mismo client_id llegaron a la vez y el otro ganó la
    -- carrera: el resultado correcto es el mensaje que sí se guardó, no un error.
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

  -- Adjuntos (RF-05). Van en la misma transacción que el mensaje: o hay mensaje
  -- con sus adjuntos, o no hay nada.
  IF p_adjuntos IS NOT NULL AND jsonb_typeof(p_adjuntos) = 'array' THEN
    IF jsonb_array_length(p_adjuntos) > 5 THEN
      RAISE EXCEPTION 'SOPORTE_DATOS: máximo 5 adjuntos por mensaje' USING ERRCODE = '22023';
    END IF;
    FOR v_adj IN SELECT * FROM jsonb_array_elements(p_adjuntos) LOOP
      IF (v_adj->>'mime') NOT IN ('image/png','image/jpeg','image/webp','image/heic','application/pdf','text/plain') THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: tipo de archivo no admitido (%)', v_adj->>'mime' USING ERRCODE = '22023';
      END IF;
      INSERT INTO public.soporte_adjuntos (mensaje_id, ruta, nombre, mime, bytes)
      VALUES (v_mensaje.id, v_adj->>'ruta', v_adj->>'nombre', v_adj->>'mime', (v_adj->>'bytes')::int);
    END LOOP;
  END IF;

  -- -------------------------------------------------------------------------
  -- 4. Estado de la conversación
  -- -------------------------------------------------------------------------
  UPDATE public.soporte_conversaciones
  SET ultimo_mensaje_at = v_mensaje.created_at,
      -- El estado ya no cambia al escribir: una resuelta no se reabre sola (y
      -- el usuario ni siquiera llega hasta aquí, se le rechaza antes).
      -- Quien escribe ha visto por definición todo lo anterior.
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

COMMENT ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) IS
  'Único camino de escritura del hilo (§6.5): idempotencia, validación, límite de frecuencia y autoría. Desde 025, una conversación resuelta no admite mensajes del usuario ni se reabre sola.';

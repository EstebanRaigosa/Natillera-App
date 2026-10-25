-- ============================================================================
-- 069 — Quién escribe: dispositivo de cada mensaje y ficha del usuario
--
-- Para atender una incidencia el soporte necesita saber desde dónde la está
-- viendo el usuario («en el iPhone no me sale el botón») y con qué natilleras
-- trabaja. Hasta ahora solo tenía el correo.
--
--   1. `soporte_mensajes.dispositivo`: lo que el cliente dice de sí mismo al
--      enviar (la misma descripción que guarda `accesos_usuario`, ver 062). Es
--      autodeclarado: sirve para orientar, no como prueba.
--   2. `soporte_enviar_mensaje` lo recibe en `p_dispositivo` (y se borra la
--      firma de 7 parámetros, por lo mismo que en 068).
--   3. `soporte_detalle_usuario`: ficha para el superadministrador con perfil,
--      ingresos recientes y natilleras (como dueño, colaborador o socio).
-- ============================================================================

ALTER TABLE public.soporte_mensajes
  ADD COLUMN IF NOT EXISTS dispositivo jsonb;

COMMENT ON COLUMN public.soporte_mensajes.dispositivo IS
  'Dispositivo desde el que se envió, según el cliente: {etiqueta, tipo, so, navegador, modelo, modoApp}.';

-- Solo las claves conocidas, como texto y recortadas: el JSON lo manda el
-- cliente y no debe poder meter un objeto arbitrario de varios kilobytes.
CREATE OR REPLACE FUNCTION public.soporte_limpiar_dispositivo(p jsonb)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE WHEN p IS NULL OR jsonb_typeof(p) <> 'object' THEN NULL ELSE
    nullif(jsonb_strip_nulls(jsonb_build_object(
      'etiqueta',  left(nullif(p->>'etiqueta', ''), 120),
      'tipo',      CASE WHEN p->>'tipo' IN ('movil','tablet','escritorio') THEN p->>'tipo' END,
      'so',        left(nullif(p->>'so', ''), 30),
      'soVersion', left(nullif(p->>'soVersion', ''), 20),
      'navegador', left(nullif(p->>'navegador', ''), 40),
      'modelo',    left(nullif(p->>'modelo', ''), 60),
      'modoApp',   CASE WHEN p->>'modoApp' IN ('app','navegador') THEN p->>'modoApp' END
    )), '{}'::jsonb)
  END
$$;

DROP FUNCTION IF EXISTS public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb, uuid);

CREATE OR REPLACE FUNCTION public.soporte_enviar_mensaje(
  p_conversacion_id uuid,
  p_client_id       uuid,
  p_cuerpo          text,
  p_asunto          text  DEFAULT NULL,
  p_categoria       text  DEFAULT NULL,
  p_adjuntos        jsonb DEFAULT '[]'::jsonb,  -- [{ruta,nombre,mime,bytes}]
  p_respuesta_a     uuid  DEFAULT NULL,          -- mensaje citado
  p_dispositivo     jsonb DEFAULT NULL           -- ver soporte_limpiar_dispositivo
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
    INSERT INTO public.soporte_mensajes (conversacion_id, client_id, autor, cuerpo, respuesta_a, dispositivo)
    VALUES (v_conv.id, p_client_id, v_autor, p_cuerpo, p_respuesta_a, public.soporte_limpiar_dispositivo(p_dispositivo))
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

REVOKE ALL ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb, uuid, jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb, uuid, jsonb) TO authenticated;

-- ---------------------------------------------------------------------------
-- Ficha del usuario para el soporte
-- ---------------------------------------------------------------------------
-- Una sola llamada con todo lo que la cabecera necesita. SECURITY DEFINER porque
-- cruza tablas que el superadministrador no lee directamente con RLS (perfiles
-- ajenos, ingresos, natilleras de otros); por eso lo primero es comprobar que
-- quien llama es superadministrador.
CREATE OR REPLACE FUNCTION public.soporte_detalle_usuario(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_resultado jsonb;
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'SOPORTE_PROHIBIDO: solo el soporte puede ver la ficha del usuario' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'perfil', (
      SELECT jsonb_build_object(
        'nombre', up.nombre, 'email', coalesce(up.email, au.email), 'telefono', coalesce(up.telefono, au.phone),
        'creado', coalesce(up.created_at, au.created_at), 'ultimo_acceso', up.ultimo_acceso,
        'activo', up.activo)
      FROM auth.users au
      LEFT JOIN public.user_profiles up ON up.id = au.id
      WHERE au.id = p_user_id
    ),
    -- Un dispositivo por fila, el más reciente primero: el mismo móvil abierto
    -- cien veces es un solo dispositivo.
    'dispositivos', coalesce((
      SELECT jsonb_agg(d ORDER BY d->>'ultimo' DESC)
      FROM (
        SELECT jsonb_build_object(
          'etiqueta', coalesce(a.dispositivo, 'Dispositivo sin identificar'),
          'tipo', max(a.tipo_dispositivo),
          'modo_app', max(a.modo_app),
          'user_agent', max(a.user_agent),
          'ultimo', max(a.ultimo_latido),
          'ingresos', count(*)) AS d
        FROM public.accesos_usuario a
        WHERE a.user_id = p_user_id AND a.inicio > now() - interval '90 days'
        GROUP BY coalesce(a.dispositivo, 'Dispositivo sin identificar')
        ORDER BY max(a.ultimo_latido) DESC
        LIMIT 5
      ) x
    ), '[]'::jsonb),
    'natilleras', coalesce((
      SELECT jsonb_agg(n ORDER BY n->>'orden', n->>'nombre')
      FROM (
        SELECT DISTINCT ON (r.natillera_id) jsonb_build_object(
          'id', nt.id, 'nombre', nt.nombre, 'estado', nt.estado, 'rol', r.rol, 'orden', r.orden,
          'socios', (SELECT count(*) FROM public.socios_natillera sn2
                     WHERE sn2.natillera_id = nt.id AND sn2.estado = 'activo')) AS n
        FROM (
          SELECT id AS natillera_id, 'administrador' AS rol, 1 AS orden
          FROM public.natilleras WHERE admin_id = p_user_id
          UNION ALL
          SELECT natillera_id, rol, 2 FROM public.natillera_colaboradores
          WHERE usuario_id = p_user_id AND estado = 'aceptada'
          UNION ALL
          SELECT sn.natillera_id, 'socio', 3
          FROM public.socios s JOIN public.socios_natillera sn ON sn.socio_id = s.id
          WHERE s.usuario_id = p_user_id AND sn.estado = 'activo'
        ) r
        JOIN public.natilleras nt ON nt.id = r.natillera_id
        ORDER BY r.natillera_id, r.orden
      ) y
    ), '[]'::jsonb)
  ) INTO v_resultado;

  RETURN v_resultado;
END;
$$;

REVOKE ALL ON FUNCTION public.soporte_detalle_usuario(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_detalle_usuario(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.soporte_limpiar_dispositivo(jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_limpiar_dispositivo(jsonb) TO authenticated;

-- Realtime: el mensaje que llega en vivo al panel trae también su dispositivo.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.soporte_mensajes;
  ALTER PUBLICATION supabase_realtime
    ADD TABLE public.soporte_mensajes (id, conversacion_id, client_id, autor, cuerpo, created_at, leido_at, respuesta_a, dispositivo);
END $$;

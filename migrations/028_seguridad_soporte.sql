-- ===========================================================================
-- 028_seguridad_soporte.sql — endurecer el chat de soporte frente al abuso
-- ===========================================================================
--
-- Seis agujeros encontrados al revisar 022_soporte.sql contra la base ya
-- desplegada. El primero no es del chat pero se lo lleva entero por delante,
-- así que va aquí y va primero.
--
--   1. Cualquier usuario podía nombrarse super_admin y con ello leer, escribir
--      y borrar TODAS las conversaciones de soporte.
--   2. La ruta del adjunto la ponía el cliente sin comprobar de quién era.
--   3. `soporte_registrar_push` aceptaba cualquier URL como destino de push.
--   4. Subir al bucket no tenía límite de frecuencia: solo lo tenía escribir.
--   5. Las funciones del soporte y varias más seguían siendo ejecutables por
--      `anon` (Supabase las concede por defecto al crearlas).
--   6. Los adjuntos de una conversación borrada se quedaban en el bucket.
--
-- Se aplica de una vez y es idempotente.

BEGIN;

-- ===========================================================================
-- 1. Escalada de privilegios por `user_profiles` — CRÍTICO
-- ===========================================================================
--
-- La política de UPDATE deja al usuario tocar su propia fila («auth.uid() = id»)
-- y el GRANT incluía TODAS las columnas, `rol` entre ellas. Una sola llamada
-- desde la consola del navegador —con la clave anónima, que es pública—
-- convertía a cualquiera en superadministrador:
--
--     supabase.from('user_profiles')
--       .update({ rol: 'super_admin', activo: true })
--       .eq('id', (await supabase.auth.getUser()).data.user.id)
--
-- Y `es_super_admin()` es el único criterio de autoridad del soporte.
--
-- El arreglo es el GRANT, no la política: se quita el UPDATE de tabla completa
-- y se devuelve columna a columna solo lo que el dueño del perfil puede cambiar
-- de sí mismo. `rol`, `activo` y `permisos` salen de la lista.

REVOKE UPDATE ON public.user_profiles FROM authenticated, anon;
REVOKE INSERT ON public.user_profiles FROM anon;
REVOKE UPDATE, INSERT, DELETE ON public.user_profiles FROM public;

GRANT UPDATE (nombre, telefono, avatar_style, avatar_seed, ultimo_acceso, updated_at)
  ON public.user_profiles TO authenticated;

-- Segundo cerrojo: aunque mañana alguien vuelva a conceder el UPDATE entero,
-- el cambio de rol sigue sin pasar. Un GRANT se pierde en una migración
-- descuidada; un trigger se ve.
CREATE OR REPLACE FUNCTION public.user_profiles_protege_privilegios()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- El service_role (Edge Functions, panel, migraciones) queda fuera: es quien
  -- tiene que poder arreglar un rol cuando haga falta.
  IF (SELECT auth.uid()) IS NULL OR public.es_super_admin() OR public.es_superusuario() THEN
    RETURN NEW;
  END IF;

  IF NEW.rol IS DISTINCT FROM OLD.rol
     OR NEW.activo IS DISTINCT FROM OLD.activo
     OR NEW.permisos IS DISTINCT FROM OLD.permisos
     OR NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'PERFIL_PROHIBIDO: rol, permisos, estado, id y correo solo los cambia un superadministrador'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_protege_privilegios ON public.user_profiles;
CREATE TRIGGER user_profiles_protege_privilegios
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.user_profiles_protege_privilegios();

-- Alta de perfil: el trigger `handle_new_user` la hace con service_role. Que el
-- cliente pueda insertar su propia fila es aceptable, pero no con el rol que
-- él elija.
CREATE OR REPLACE FUNCTION public.user_profiles_rol_por_defecto()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR public.es_super_admin() OR public.es_superusuario() THEN
    RETURN NEW;
  END IF;
  NEW.rol := 'usuario';
  NEW.permisos := coalesce(NEW.permisos, '{}'::jsonb);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_rol_por_defecto ON public.user_profiles;
CREATE TRIGGER user_profiles_rol_por_defecto
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.user_profiles_rol_por_defecto();

-- El panel de usuarios sí tiene que poder cambiar roles. Pasa por aquí, donde
-- la autoridad se comprueba en el servidor.
CREATE OR REPLACE FUNCTION public.admin_actualizar_perfil(
  p_user_id  uuid,
  p_nombre   text    DEFAULT NULL,
  p_rol      text    DEFAULT NULL,
  p_activo   boolean DEFAULT NULL,
  p_permisos jsonb   DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_fila public.user_profiles%ROWTYPE;
BEGIN
  IF NOT (public.es_super_admin() OR public.es_superusuario()) THEN
    RAISE EXCEPTION 'PERFIL_PROHIBIDO: solo un superadministrador cambia perfiles ajenos' USING ERRCODE = '42501';
  END IF;
  IF p_rol IS NOT NULL AND p_rol NOT IN ('super_admin','admin','usuario','invitado') THEN
    RAISE EXCEPTION 'PERFIL_DATOS: rol no válido' USING ERRCODE = '22023';
  END IF;

  -- El superadministrador del proyecto es una sola cuenta (ver 029): el panel
  -- no puede repartir ese rol, ni por descuido ni a propósito.
  IF p_rol = 'super_admin' AND NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = p_user_id AND lower(btrim(u.email)) = 'raigo.16@gmail.com'
  ) THEN
    RAISE EXCEPTION 'PERFIL_PROHIBIDO: el superadministrador es una única cuenta' USING ERRCODE = '42501';
  END IF;

  UPDATE public.user_profiles
  SET nombre   = coalesce(p_nombre, nombre),
      rol      = coalesce(p_rol, rol),
      activo   = coalesce(p_activo, activo),
      permisos = coalesce(p_permisos, permisos),
      updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO v_fila;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PERFIL_NO_EXISTE' USING ERRCODE = 'P0002';
  END IF;

  RETURN jsonb_build_object('id', v_fila.id, 'nombre', v_fila.nombre, 'rol', v_fila.rol,
                            'activo', v_fila.activo, 'permisos', v_fila.permisos);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_actualizar_perfil(uuid, text, text, boolean, jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_actualizar_perfil(uuid, text, text, boolean, jsonb) TO authenticated;

-- ===========================================================================
-- 2. Adjuntos: la ruta la manda el cliente
-- ===========================================================================
--
-- `soporte_enviar_mensaje` insertaba en `soporte_adjuntos` la ruta tal cual
-- venía. La política de lectura del bucket permite leer cualquier objeto citado
-- por un adjunto de una conversación propia, así que registrar una ruta ajena
-- en un hilo propio abría el archivo de otro. Se añade la comprobación de
-- carpeta, la de existencia y la de tamaño.

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

      -- La ruta la manda el cliente, así que aquí no se cree: si no empieza por
      -- la carpeta de quien llama, es un intento de registrar como propio un
      -- archivo de otro. La política de lectura del bucket deja leer cualquier
      -- objeto citado en un adjunto de una conversación propia, de modo que sin
      -- esta comprobación bastaría con adivinar una ruta ajena para leerla.
      IF coalesce(v_adj->>'ruta', '') NOT LIKE v_uid::text || '/%' THEN
        RAISE EXCEPTION 'SOPORTE_PROHIBIDO: adjunto fuera de tu carpeta' USING ERRCODE = '42501';
      END IF;

      -- Y el archivo tiene que existir de verdad. Un adjunto registrado sin
      -- objeto detrás deja una burbuja rota en el hilo para siempre.
      IF NOT EXISTS (
        SELECT 1 FROM storage.objects
        WHERE bucket_id = 'soporte-adjuntos' AND name = v_adj->>'ruta'
      ) THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: el adjunto no se subió correctamente' USING ERRCODE = '22023';
      END IF;

      IF coalesce((v_adj->>'bytes')::bigint, 0) > 5242880 THEN
        RAISE EXCEPTION 'SOPORTE_DATOS: el adjunto supera los 5 MB' USING ERRCODE = '22023';
      END IF;

      INSERT INTO public.soporte_adjuntos (mensaje_id, ruta, nombre, mime, bytes)
      VALUES (v_mensaje.id, v_adj->>'ruta', left(coalesce(v_adj->>'nombre', 'adjunto'), 120),
              v_adj->>'mime', (v_adj->>'bytes')::int);
    END LOOP;
  END IF;

  -- -------------------------------------------------------------------------
  -- 4. Estado de la conversación
  -- -------------------------------------------------------------------------
  UPDATE public.soporte_conversaciones
  SET ultimo_mensaje_at = v_mensaje.created_at,
      -- RN-06: un mensaje del usuario reabre una conversación resuelta.
      estado = CASE WHEN v_autor = 'usuario' AND estado = 'resuelta' THEN 'abierta' ELSE estado END,
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
  'Único camino de escritura del hilo (§6.5): idempotencia, validación, límite de frecuencia, autoría y adjuntos comprobados contra la carpeta de quien llama.';

REVOKE ALL ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) TO authenticated;

-- ===========================================================================
-- 3. Suscripciones push: destino libre y sin tope
-- ===========================================================================
--
-- `soporte_registrar_push` guardaba cualquier cadena como `endpoint`. Como la
-- Edge Function hace un POST a cada endpoint activo del destinatario, un bot
-- podía registrar mil URLs suyas y usar la infraestructura de Supabase para
-- lanzar peticiones contra terceros: basta con escribirse a sí mismo en su
-- propia conversación para disparar la tanda.
--
-- Dos cierres: el destino tiene que ser un servicio push real, y nadie guarda
-- más de 10 suscripciones (los navegadores de una persona no llegan a tantos).

CREATE OR REPLACE FUNCTION public.soporte_push_destino_valido(p_endpoint text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_endpoint ~ '^https://([a-z0-9-]+\.)*(googleapis\.com|push\.apple\.com|notify\.windows\.com|push\.services\.mozilla\.com|windows\.com)/'
$$;

CREATE OR REPLACE FUNCTION public.soporte_registrar_push(
  p_endpoint   text,
  p_p256dh     text,
  p_auth       text,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_n   integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_SIN_SESION' USING ERRCODE = '28000';
  END IF;
  IF coalesce(p_endpoint, '') = '' OR coalesce(p_p256dh, '') = '' OR coalesce(p_auth, '') = '' THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: suscripción incompleta' USING ERRCODE = '22023';
  END IF;

  IF NOT public.soporte_push_destino_valido(p_endpoint) THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: el destino no es un servicio de notificaciones conocido' USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_n
  FROM public.soporte_push
  WHERE user_id = v_uid AND endpoint <> p_endpoint;

  IF v_n >= 10 THEN
    -- Se retira la más vieja en lugar de fallar: el usuario no tiene por qué
    -- saber que cambiar de navegador deja rastro.
    DELETE FROM public.soporte_push
    WHERE id = (SELECT id FROM public.soporte_push
                WHERE user_id = v_uid ORDER BY created_at ASC LIMIT 1);
  END IF;

  INSERT INTO public.soporte_push (user_id, endpoint, p256dh, auth, user_agent, activa)
  VALUES (v_uid, p_endpoint, left(p_p256dh, 200), left(p_auth, 100), left(coalesce(p_user_agent, ''), 300), true)
  ON CONFLICT (endpoint) DO UPDATE
  SET user_id    = v_uid,
      p256dh     = EXCLUDED.p256dh,
      auth       = EXCLUDED.auth,
      user_agent = EXCLUDED.user_agent,
      activa     = true;
END;
$$;

REVOKE ALL ON FUNCTION public.soporte_registrar_push(text, text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_registrar_push(text, text, text, text) TO authenticated;

-- ===========================================================================
-- 4. Subir al bucket no tenía límite de frecuencia
-- ===========================================================================
--
-- RF-18 limita mensajes y conversaciones, pero la subida va directa a Storage y
-- no pasa por ninguna función. Con una sola cuenta se podían subir archivos de
-- 5 MB sin parar, sin enviar ni un mensaje, y nadie los borraba nunca: es la
-- factura de almacenamiento como vector de abuso.
--
-- 40 archivos por hora deja holgura de sobra para el uso real (5 adjuntos por
-- mensaje) y pone techo al bot.

-- El conteo va en una función y no en un subselect dentro de la política: una
-- política sobre `storage.objects` que consulta `storage.objects` vuelve a
-- evaluarse a sí misma. SECURITY DEFINER corta esa vuelta.
CREATE OR REPLACE FUNCTION public.soporte_subidas_ultima_hora()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, storage, pg_temp
AS $$
  SELECT count(*)::int
  FROM storage.objects o
  WHERE o.bucket_id = 'soporte-adjuntos'
    AND o.name LIKE (SELECT auth.uid())::text || '/%'
    AND o.created_at > now() - interval '1 hour'
$$;

REVOKE ALL ON FUNCTION public.soporte_subidas_ultima_hora() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_subidas_ultima_hora() TO authenticated;

DROP POLICY IF EXISTS soporte_adj_insert ON storage.objects;
CREATE POLICY soporte_adj_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'soporte-adjuntos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND public.soporte_subidas_ultima_hora() < 40
  );

-- ===========================================================================
-- 5. `anon` podía ejecutar funciones que no le corresponden
-- ===========================================================================
--
-- Supabase concede EXECUTE a `anon` en cada función nueva del esquema `public`.
-- 022_soporte.sql ya lo corrigió para las suyas; estas quedaron fuera. Ninguna
-- debería ser alcanzable sin sesión.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS firma
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND has_function_privilege('anon', p.oid, 'EXECUTE')
      AND p.proname NOT IN (
        -- Estas sí se llaman sin sesión iniciada: invitación por enlace y
        -- verificación de teléfono antes del alta.
        'aceptar_invitacion_colaborador',
        'rechazar_invitacion_colaborador',
        'telefono_es_socio',
        'handle_new_user'
      )
  LOOP
    -- Se revoca también a PUBLIC: si el EXECUTE le llega a `anon` por ahí, el
    -- REVOKE nominal no quita nada. Y se devuelve explícitamente a
    -- `authenticated`, que es quien las usa desde la app.
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.firma);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.firma);
  END LOOP;
END $$;

-- `buscar_usuario_por_email` y `buscar_usuario_por_telefono` sirven para
-- enumerar quién está registrado. Con sesión es tolerable (se usa al invitar);
-- sin sesión, no: el REVOKE de arriba ya las cubre. `verificar_otp` no aparece
-- en la lista de excepciones porque 029 la elimina.

-- ===========================================================================
-- 6. Adjuntos huérfanos
-- ===========================================================================
--
-- `soporte_eliminar_conversacion` devuelve las rutas para que el cliente vacíe
-- el bucket, pero si el borrado del cliente falla —o si alguien sube y nunca
-- envía— el archivo se queda. Esta función lista lo que ya no cita ningún
-- adjunto y tiene más de un día; el panel de soporte la usa para limpiar.

CREATE OR REPLACE FUNCTION public.soporte_adjuntos_huerfanos()
RETURNS TABLE(ruta text, subido_en timestamptz, bytes bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT o.name,
         o.created_at,
         coalesce((o.metadata->>'size')::bigint, 0)
  FROM storage.objects o
  WHERE public.es_super_admin()
    AND o.bucket_id = 'soporte-adjuntos'
    AND o.created_at < now() - interval '1 day'
    AND NOT EXISTS (SELECT 1 FROM public.soporte_adjuntos a WHERE a.ruta = o.name)
  ORDER BY o.created_at;
$$;

REVOKE ALL ON FUNCTION public.soporte_adjuntos_huerfanos() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.soporte_adjuntos_huerfanos() TO authenticated;

COMMIT;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- 1. Ningún cliente puede escribir `rol` (debe devolver 0 filas):
--      SELECT grantee, column_name FROM information_schema.column_privileges
--      WHERE table_name = 'user_profiles' AND privilege_type = 'UPDATE'
--        AND column_name IN ('rol','activo','permisos')
--        AND grantee IN ('anon','authenticated');
--
-- 2. Con sesión de un usuario normal, esto debe fallar con PERFIL_PROHIBIDO:
--      UPDATE user_profiles SET rol = 'super_admin' WHERE id = auth.uid();
--
-- 3. Un adjunto con ruta ajena debe dar SOPORTE_PROHIBIDO:
--      SELECT soporte_enviar_mensaje(<conv>, gen_random_uuid(), 'hola', NULL, NULL,
--        '[{"ruta":"00000000-0000-0000-0000-000000000000/x/y.png","nombre":"y.png","mime":"image/png","bytes":10}]'::jsonb);
--
-- 4. Un endpoint inventado debe dar SOPORTE_DATOS:
--      SELECT soporte_registrar_push('https://ejemplo.com/x', 'a', 'b', 'test');

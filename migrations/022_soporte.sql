-- ============================================================================
-- 022 — Chat de soporte (usuario ↔ soporte de Natillerapp)
--
-- Implementa Especificaciones/chat-soporte/especificacion.md v2.0.
-- Requiere haber ejecutado antes 021_eliminar_chat_legacy.sql.
--
-- Contenido:
--   1. Secuencia y tablas (§6.1)
--   2. Índices (§6.2)
--   3. es_super_admin() (§6.4)
--   4. RLS: solo SELECT para los clientes; toda escritura pasa por función
--   5. Vistas de lectura (§6.3)
--   6. Funciones de escritura (§6.5)
--   7. Storage: políticas del bucket privado `soporte-adjuntos` (§6.6)
--   8. Realtime (RF-09)
--
-- ⚠️  Tres decisiones se apartan de la letra de la especificación para cumplir
--     mejor su intención. Están justificadas en el punto donde aparecen:
--       · §6.5 pedía SECURITY INVOKER → aquí es SECURITY DEFINER (ver PASO 6)
--       · §6.1 pedía política conv_insert → no existe (ver PASO 4)
--       · §6.6 pedía ruta <conversacion_id>/<mensaje_id>/ → es <user_id>/<client_id>/
--         (ver PASO 7)
--
-- Pasos manuales que NO puede hacer este script: ver el bloque final.
-- ============================================================================

BEGIN;

-- ===========================================================================
-- PASO 1 — Secuencia y tablas
-- ===========================================================================

-- RN-09: el número visible de la conversación. Una secuencia y no un COUNT(*),
-- para que dos aperturas simultáneas no reciban el mismo número.
CREATE SEQUENCE IF NOT EXISTS public.soporte_conversaciones_numero_seq AS bigint START 1;

CREATE TABLE IF NOT EXISTS public.soporte_conversaciones (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero             bigint UNIQUE NOT NULL DEFAULT nextval('public.soporte_conversaciones_numero_seq'),
  -- RN-12: al eliminar la cuenta desaparece la conversación entera, en cascada.
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Desnormalizado a propósito (§6.1): la bandeja lo necesita en cada fila.
  user_email         text NOT NULL,
  asunto             text NOT NULL CHECK (char_length(asunto) BETWEEN 5 AND 120),
  categoria          text NOT NULL CHECK (categoria IN ('error','duda','sugerencia','cuenta','otro')),
  estado             text NOT NULL DEFAULT 'abierta'
                       CHECK (estado IN ('abierta','en_proceso','resuelta','archivada')),
  -- RN-11: jamás visible para el usuario. No se expone en la vista que él lee.
  nota_interna       text CHECK (nota_interna IS NULL OR char_length(nota_interna) <= 1000),
  ultimo_mensaje_at  timestamptz NOT NULL DEFAULT now(),
  leido_usuario_at   timestamptz,
  leido_soporte_at   timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.soporte_conversaciones IS
  'Hilos de soporte. Una conversación pertenece a un único usuario y no se transfiere (RN-02).';
COMMENT ON COLUMN public.soporte_conversaciones.nota_interna IS
  'Privada del superadministrador (RN-11). El usuario lee soporte_conversaciones_usuario, que no la incluye.';

CREATE TABLE IF NOT EXISTS public.soporte_mensajes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id  uuid NOT NULL REFERENCES public.soporte_conversaciones(id) ON DELETE CASCADE,
  -- RF-04: lo genera el cliente ANTES de enviar. Es la clave de la idempotencia.
  client_id        uuid NOT NULL,
  autor            text NOT NULL CHECK (autor IN ('usuario','soporte')),
  cuerpo           text NOT NULL CHECK (char_length(cuerpo) BETWEEN 1 AND 4000),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT soporte_mensajes_idempotencia UNIQUE (conversacion_id, client_id)
);

COMMENT ON CONSTRAINT soporte_mensajes_idempotencia ON public.soporte_mensajes IS
  'RF-04: un reintento con el mismo client_id no crea un segundo mensaje.';

CREATE TABLE IF NOT EXISTS public.soporte_adjuntos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mensaje_id  uuid NOT NULL REFERENCES public.soporte_mensajes(id) ON DELETE CASCADE,
  ruta        text NOT NULL,
  nombre      text NOT NULL,
  mime        text NOT NULL,
  bytes       integer NOT NULL CHECK (bytes > 0 AND bytes <= 5242880),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.soporte_adjuntos.ruta IS
  'Ruta dentro del bucket privado soporte-adjuntos. Nunca una URL: las URL públicas no se revocan (RF-17).';

CREATE TABLE IF NOT EXISTS public.soporte_push (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint        text NOT NULL UNIQUE,
  p256dh          text NOT NULL,
  auth            text NOT NULL,
  user_agent      text,
  activa          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  ultimo_envio_at timestamptz
);

COMMENT ON TABLE public.soporte_push IS
  'Una fila por navegador (RF-13). La Edge Function marca activa = false ante 404/410.';

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.soporte_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_soporte_conv_updated_at ON public.soporte_conversaciones;
CREATE TRIGGER trg_soporte_conv_updated_at
  BEFORE UPDATE ON public.soporte_conversaciones
  FOR EACH ROW EXECUTE FUNCTION public.soporte_touch_updated_at();

-- ===========================================================================
-- PASO 2 — Índices (§6.2)
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_soporte_conv_user   ON public.soporte_conversaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_soporte_conv_estado ON public.soporte_conversaciones(estado);
CREATE INDEX IF NOT EXISTS idx_soporte_conv_ultimo ON public.soporte_conversaciones(ultimo_mensaje_at DESC);

-- Compuesto y en el mismo orden en que se consulta el hilo: permite paginar
-- hacia atrás sin ordenar en memoria (RNF-04).
CREATE INDEX IF NOT EXISTS idx_soporte_msg_conv    ON public.soporte_mensajes(conversacion_id, created_at DESC);

-- Soporta el conteo del límite de frecuencia (RF-18) sin recorrer la tabla.
CREATE INDEX IF NOT EXISTS idx_soporte_msg_created ON public.soporte_mensajes(created_at DESC) WHERE autor = 'usuario';

-- Idempotencia al abrir conversación: en ese momento no hay conversacion_id por
-- el que filtrar, así que la búsqueda es por client_id (caso borde 3).
CREATE INDEX IF NOT EXISTS idx_soporte_msg_client  ON public.soporte_mensajes(client_id);

CREATE INDEX IF NOT EXISTS idx_soporte_adj_mensaje ON public.soporte_adjuntos(mensaje_id);
CREATE INDEX IF NOT EXISTS idx_soporte_push_user   ON public.soporte_push(user_id) WHERE activa;

-- ===========================================================================
-- PASO 3 — Identificación del superadministrador (§6.4)
-- ===========================================================================
--
-- SECURITY DEFINER porque las políticas de user_profiles no deben condicionar
-- esta comprobación. STABLE para que Postgres la evalúe una vez por consulta.

CREATE OR REPLACE FUNCTION public.es_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = (SELECT auth.uid())
      AND rol = 'super_admin'
      AND activo
  );
$$;

COMMENT ON FUNCTION public.es_super_admin() IS
  'Único criterio de autoridad del soporte. Nunca comparar un correo en el cliente: un valor del cliente no es una credencial.';

REVOKE ALL ON FUNCTION public.es_super_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.es_super_admin() TO authenticated, service_role;

-- ===========================================================================
-- PASO 4 — Seguridad a nivel de fila
-- ===========================================================================
--
-- Desviación consciente respecto a §6.4: aquí NO existen políticas de INSERT,
-- UPDATE ni DELETE para los clientes en las tres tablas del hilo, y además se
-- revocan esos permisos a nivel de GRANT.
--
-- Por qué: la especificación dice que soporte_enviar_mensaje es «el único camino
-- de escritura» y que la idempotencia, el límite de frecuencia y la asignación
-- de autor deben ser «inevitables en vez de opcionales». Con una política de
-- INSERT abierta al cliente, cualquiera puede insertar por PostgREST saltándose
-- la función: el UNIQUE seguiría evitando duplicados, pero el límite de
-- frecuencia (RF-18) dejaría de existir. Sin política de INSERT, la función
-- —SECURITY DEFINER, ver PASO 6— es literalmente la única puerta.
--
-- Las lecturas sí van por RLS, que es lo que sostiene RF-15 y CA-13.

ALTER TABLE public.soporte_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte_mensajes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte_adjuntos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soporte_push           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conv_select ON public.soporte_conversaciones;
CREATE POLICY conv_select ON public.soporte_conversaciones
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.es_super_admin());

DROP POLICY IF EXISTS msg_select ON public.soporte_mensajes;
CREATE POLICY msg_select ON public.soporte_mensajes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.soporte_conversaciones c
      WHERE c.id = conversacion_id
        AND (c.user_id = (SELECT auth.uid()) OR public.es_super_admin())
    )
  );

DROP POLICY IF EXISTS adj_select ON public.soporte_adjuntos;
CREATE POLICY adj_select ON public.soporte_adjuntos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.soporte_mensajes m
      JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
      WHERE m.id = mensaje_id
        AND (c.user_id = (SELECT auth.uid()) OR public.es_super_admin())
    )
  );

-- soporte_push sí se escribe directamente: es una preferencia del propio
-- dispositivo del usuario, sin reglas de negocio que imponer.
DROP POLICY IF EXISTS push_select ON public.soporte_push;
CREATE POLICY push_select ON public.soporte_push
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS push_insert ON public.soporte_push;
CREATE POLICY push_insert ON public.soporte_push
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS push_update ON public.soporte_push;
CREATE POLICY push_update ON public.soporte_push
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS push_delete ON public.soporte_push;
CREATE POLICY push_delete ON public.soporte_push
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- Segunda capa: aunque alguien añadiese una política por error, sin GRANT no
-- hay escritura posible desde la API.
REVOKE ALL ON public.soporte_conversaciones FROM anon, authenticated;
REVOKE ALL ON public.soporte_mensajes       FROM anon, authenticated;
REVOKE ALL ON public.soporte_adjuntos       FROM anon, authenticated;
REVOKE ALL ON public.soporte_push           FROM anon, authenticated;

-- RN-11 / CA-07: el GRANT es COLUMNA A COLUMNA y deja fuera `nota_interna`.
-- RLS filtra filas, no columnas: sin esto, el dueño de la conversación podría
-- leer la nota interna de su propio hilo consultando la tabla directamente, que
-- es justo lo que CA-07 prohíbe. La nota solo sale por soporte_nota_interna().
GRANT SELECT (
  id, numero, user_id, user_email, asunto, categoria, estado,
  ultimo_mensaje_at, leido_usuario_at, leido_soporte_at, created_at, updated_at
) ON public.soporte_conversaciones TO authenticated;
GRANT SELECT ON public.soporte_mensajes       TO authenticated;
GRANT SELECT ON public.soporte_adjuntos       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soporte_push TO authenticated;

GRANT ALL ON public.soporte_conversaciones TO service_role;
GRANT ALL ON public.soporte_mensajes       TO service_role;
GRANT ALL ON public.soporte_adjuntos       TO service_role;
GRANT ALL ON public.soporte_push           TO service_role;

COMMIT;

BEGIN;

-- ===========================================================================
-- PASO 5 — Vistas de lectura (§6.3)
-- ===========================================================================
--
-- `security_invoker = true` es obligatorio en ambas: sin él la vista se ejecuta
-- con los permisos de quien la creó y saltaría el RLS de las tablas de debajo,
-- dejando la bandeja entera al alcance de cualquiera.

-- Bandeja del superadministrador (RF-06).
DROP VIEW IF EXISTS public.soporte_resumen_bandeja;
CREATE VIEW public.soporte_resumen_bandeja
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.numero,
  c.user_id,
  c.user_email,
  c.asunto,
  c.categoria,
  c.estado,
  c.ultimo_mensaje_at,
  c.created_at,
  (SELECT COUNT(*) FROM public.soporte_mensajes m
    WHERE m.conversacion_id = c.id
      AND m.autor = 'usuario'
      AND (c.leido_soporte_at IS NULL OR m.created_at > c.leido_soporte_at)
  ) AS sin_leer_soporte,
  -- CA-06: el filtro «sin responder» son las conversaciones cuyo último mensaje
  -- es del usuario. Calcularlo aquí evita que el cliente descargue mensajes.
  (SELECT m.autor FROM public.soporte_mensajes m
    WHERE m.conversacion_id = c.id
    ORDER BY m.created_at DESC, m.id DESC LIMIT 1
  ) AS ultimo_autor
FROM public.soporte_conversaciones c
-- La bandeja es del soporte. Sin este filtro, un usuario normal vería aquí su
-- propia conversación con el contador interno del soporte.
WHERE public.es_super_admin();

COMMENT ON VIEW public.soporte_resumen_bandeja IS
  'RF-06. No expone nota_interna: la lee soporte_nota_interna(), que exige ser superadministrador.';

-- Lista del usuario (RF-03). No incluye `nota_interna` en ninguna columna:
-- RLS filtra filas, no columnas, así que la separación tiene que ser esta vista
-- (§6.4 punto 4, RN-11, CA-07).
DROP VIEW IF EXISTS public.soporte_conversaciones_usuario;
CREATE VIEW public.soporte_conversaciones_usuario
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.numero,
  c.asunto,
  c.categoria,
  c.estado,
  c.ultimo_mensaje_at,
  c.created_at,
  (SELECT COUNT(*) FROM public.soporte_mensajes m
    WHERE m.conversacion_id = c.id
      AND m.autor = 'soporte'
      AND (c.leido_usuario_at IS NULL OR m.created_at > c.leido_usuario_at)
  ) AS sin_leer_usuario
FROM public.soporte_conversaciones c
WHERE c.user_id = (SELECT auth.uid());

COMMENT ON VIEW public.soporte_conversaciones_usuario IS
  'RF-03. Es la única puerta del usuario a sus conversaciones; deja fuera nota_interna (RN-11).';

REVOKE ALL ON public.soporte_resumen_bandeja       FROM anon, authenticated;
REVOKE ALL ON public.soporte_conversaciones_usuario FROM anon, authenticated;
GRANT SELECT ON public.soporte_resumen_bandeja        TO authenticated;
GRANT SELECT ON public.soporte_conversaciones_usuario TO authenticated;

-- ===========================================================================
-- PASO 6 — Funciones de escritura (§6.5)
-- ===========================================================================
--
-- SECURITY DEFINER, no INVOKER como decía §6.5. El motivo está en el PASO 4:
-- para que esta función sea de verdad el único camino de escritura, las tablas
-- no conceden INSERT a los clientes, y entonces una función INVOKER tampoco
-- podría escribir. A cambio, cada función valida explícitamente la identidad y
-- la pertenencia — que es lo que RLS haría — antes de tocar nada.

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
      INSERT INTO public.soporte_adjuntos (mensaje_id, ruta, nombre, mime, bytes)
      VALUES (v_mensaje.id, v_adj->>'ruta', v_adj->>'nombre', v_adj->>'mime', (v_adj->>'bytes')::int);
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
  'Único camino de escritura del hilo (§6.5): idempotencia, validación, límite de frecuencia y autoría en una sola transacción.';

-- --------------------------------------------------------------------------
-- Marcar leído (RF-14)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soporte_marcar_leido(p_conversacion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid  uuid := (SELECT auth.uid());
  v_conv public.soporte_conversaciones%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_SIN_SESION' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_conv FROM public.soporte_conversaciones WHERE id = p_conversacion_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF v_conv.user_id = v_uid THEN
    UPDATE public.soporte_conversaciones SET leido_usuario_at = now() WHERE id = p_conversacion_id;
  ELSIF public.es_super_admin() THEN
    UPDATE public.soporte_conversaciones SET leido_soporte_at = now() WHERE id = p_conversacion_id;
  ELSE
    RAISE EXCEPTION 'SOPORTE_PROHIBIDO' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- --------------------------------------------------------------------------
-- Estado y nota interna (RF-08). Valida las transiciones de RN-05.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soporte_actualizar_conversacion(
  p_conversacion_id uuid,
  p_estado          text DEFAULT NULL,
  p_nota_interna    text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_conv     public.soporte_conversaciones%ROWTYPE;
  v_permitido boolean;
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'SOPORTE_PROHIBIDO: solo el soporte cambia el estado de una conversación' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_conv FROM public.soporte_conversaciones WHERE id = p_conversacion_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SOPORTE_NO_EXISTE: la conversación ya no existe' USING ERRCODE = 'P0002';
  END IF;

  IF p_estado IS NOT NULL AND p_estado <> v_conv.estado THEN
    -- RN-05: tabla de transiciones. Cualquier otra se rechaza aquí.
    v_permitido := (v_conv.estado, p_estado) IN (
      ('abierta',    'en_proceso'),
      ('abierta',    'resuelta'),
      ('en_proceso', 'resuelta'),
      ('resuelta',   'abierta'),
      ('resuelta',   'archivada'),
      ('archivada',  'abierta')
    );
    IF NOT v_permitido THEN
      RAISE EXCEPTION 'SOPORTE_TRANSICION: no se puede pasar de % a %', v_conv.estado, p_estado USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF p_nota_interna IS NOT NULL AND char_length(p_nota_interna) > 1000 THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: la nota interna admite hasta 1000 caracteres' USING ERRCODE = '22023';
  END IF;

  UPDATE public.soporte_conversaciones
  SET estado       = coalesce(p_estado, estado),
      nota_interna = coalesce(p_nota_interna, nota_interna)
  WHERE id = p_conversacion_id
  RETURNING * INTO v_conv;

  RETURN jsonb_build_object('id', v_conv.id, 'estado', v_conv.estado, 'nota_interna', v_conv.nota_interna);
END;
$$;

-- --------------------------------------------------------------------------
-- RF-13 — Alta de una suscripción push.
--
-- Va por función y no por upsert directo por un caso concreto: si en el mismo
-- navegador inicia sesión otra cuenta, el `endpoint` ya existe a nombre del
-- usuario anterior, y el upsert del cliente chocaría contra la política de
-- UPDATE (que solo deja tocar filas propias). El endpoint pertenece al
-- navegador, no a la cuenta: quien tiene la sesión ahora es quien debe
-- recibir sus notificaciones, así que aquí se reasigna.
-- --------------------------------------------------------------------------
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
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SOPORTE_SIN_SESION' USING ERRCODE = '28000';
  END IF;
  IF coalesce(p_endpoint, '') = '' OR coalesce(p_p256dh, '') = '' OR coalesce(p_auth, '') = '' THEN
    RAISE EXCEPTION 'SOPORTE_DATOS: suscripción incompleta' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.soporte_push (user_id, endpoint, p256dh, auth, user_agent, activa)
  VALUES (v_uid, p_endpoint, p_p256dh, p_auth, left(coalesce(p_user_agent, ''), 300), true)
  ON CONFLICT (endpoint) DO UPDATE
  SET user_id    = v_uid,
      p256dh     = EXCLUDED.p256dh,
      auth       = EXCLUDED.auth,
      user_agent = EXCLUDED.user_agent,
      activa     = true;
END;
$$;

-- --------------------------------------------------------------------------
-- RF-08 / RN-11 — Lectura de la nota interna.
--
-- Es la única salida de esa columna. Va por función y no por vista porque el
-- GRANT de la tabla ya no incluye `nota_interna` para nadie salvo service_role.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soporte_nota_interna(p_conversacion_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_nota text;
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'SOPORTE_PROHIBIDO' USING ERRCODE = '42501';
  END IF;

  SELECT nota_interna INTO v_nota
  FROM public.soporte_conversaciones WHERE id = p_conversacion_id;

  RETURN v_nota;
END;
$$;

-- --------------------------------------------------------------------------
-- RN-07 — Archivado al vuelo (decisión P-2)
--
-- Se llama al cargar la bandeja en lugar de programarlo con pg_cron: evita
-- activar una extensión y una tarea que mantener, y con un solo agente de
-- soporte la bandeja se abre a diario de todos modos.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soporte_archivar_vencidas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_filas integer;
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'SOPORTE_PROHIBIDO' USING ERRCODE = '42501';
  END IF;

  UPDATE public.soporte_conversaciones
  SET estado = 'archivada'
  WHERE estado = 'resuelta'
    AND ultimo_mensaje_at < now() - interval '30 days';

  GET DIAGNOSTICS v_filas = ROW_COUNT;
  RETURN v_filas;
END;
$$;

-- --------------------------------------------------------------------------
-- RF-19 — Borrado. Devuelve las rutas de los adjuntos para que el cliente
-- vacíe también el bucket: Storage no se gestiona por SQL.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soporte_eliminar_conversacion(p_conversacion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rutas text[];
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'SOPORTE_PROHIBIDO' USING ERRCODE = '42501';
  END IF;

  SELECT coalesce(array_agg(a.ruta), '{}')
    INTO v_rutas
  FROM public.soporte_adjuntos a
  JOIN public.soporte_mensajes m ON m.id = a.mensaje_id
  WHERE m.conversacion_id = p_conversacion_id;

  DELETE FROM public.soporte_conversaciones WHERE id = p_conversacion_id;

  RETURN jsonb_build_object('rutas', to_jsonb(v_rutas));
END;
$$;

-- --------------------------------------------------------------------------
-- RF-14 — Contador para la insignia del menú. Devuelve lo que corresponde al
-- rol de quien llama, sin que el cliente tenga que descargar nada.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soporte_no_leidos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := (SELECT auth.uid());
  v_total integer;
BEGIN
  IF v_uid IS NULL THEN RETURN 0; END IF;

  IF public.es_super_admin() THEN
    SELECT COUNT(*) INTO v_total
    FROM public.soporte_mensajes m
    JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
    WHERE m.autor = 'usuario'
      AND c.user_id <> v_uid
      AND (c.leido_soporte_at IS NULL OR m.created_at > c.leido_soporte_at);
  ELSE
    SELECT COUNT(*) INTO v_total
    FROM public.soporte_mensajes m
    JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
    WHERE m.autor = 'soporte'
      AND c.user_id = v_uid
      AND (c.leido_usuario_at IS NULL OR m.created_at > c.leido_usuario_at);
  END IF;

  RETURN coalesce(v_total, 0);
END;
$$;

-- Permisos de ejecución: authenticated y nadie más (anon no tiene soporte, RN-01).
--
-- Hacen falta LOS DOS revokes. `FROM public` quita el permiso al pseudo-rol
-- PUBLIC, pero Supabase concede EXECUTE explícitamente a `anon` en cada función
-- nueva del esquema public mediante ALTER DEFAULT PRIVILEGES: sin el segundo
-- REVOKE, cualquiera sin sesión puede invocarlas por /rest/v1/rpc/... Las
-- rechazarían por su propia comprobación de auth.uid(), pero la superficie
-- sobra y contradice RN-01. Detectado por el linter de Supabase tras aplicar
-- la migración (regla anon_security_definer_function_executable).
REVOKE ALL ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) FROM public;
REVOKE ALL ON FUNCTION public.soporte_marcar_leido(uuid)                                  FROM public;
REVOKE ALL ON FUNCTION public.soporte_actualizar_conversacion(uuid, text, text)           FROM public;
REVOKE ALL ON FUNCTION public.soporte_archivar_vencidas()                                 FROM public;
REVOKE ALL ON FUNCTION public.soporte_eliminar_conversacion(uuid)                         FROM public;
REVOKE ALL ON FUNCTION public.soporte_no_leidos()                                         FROM public;
REVOKE ALL ON FUNCTION public.soporte_nota_interna(uuid)                                  FROM public;
REVOKE ALL ON FUNCTION public.soporte_registrar_push(text, text, text, text)              FROM public;

REVOKE EXECUTE ON FUNCTION public.es_super_admin()                                            FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_marcar_leido(uuid)                                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_actualizar_conversacion(uuid, text, text)           FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_archivar_vencidas()                                 FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_eliminar_conversacion(uuid)                         FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_no_leidos()                                         FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_nota_interna(uuid)                                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.soporte_registrar_push(text, text, text, text)              FROM anon;

-- El trigger de updated_at no lo invoca nadie por API (PostgREST no expone
-- funciones que devuelven `trigger`), así que no necesita permiso alguno.
REVOKE EXECUTE ON FUNCTION public.soporte_touch_updated_at() FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.soporte_enviar_mensaje(uuid, uuid, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_marcar_leido(uuid)                                  TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_actualizar_conversacion(uuid, text, text)           TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_archivar_vencidas()                                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_eliminar_conversacion(uuid)                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_no_leidos()                                         TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_nota_interna(uuid)                                  TO authenticated;
GRANT EXECUTE ON FUNCTION public.soporte_registrar_push(text, text, text, text)              TO authenticated;

COMMIT;

BEGIN;

-- ===========================================================================
-- PASO 7 — Storage: bucket privado de adjuntos (§6.6, RF-17)
-- ===========================================================================
--
-- Desviación consciente respecto a §6.6: la ruta es
--     <user_id>/<client_id>/<archivo>
-- y no <conversacion_id>/<mensaje_id>/<archivo>.
--
-- Por qué: RF-05 exige subir los archivos ANTES de crear el mensaje, así que en
-- ese momento el mensaje_id no existe todavía —y al abrir una conversación
-- nueva, tampoco el conversacion_id—. El client_id sí existe: lo genera el
-- redactor antes de enviar (RF-04). Con el uid como primera carpeta, la política
-- de subida se comprueba con un dato que el servidor ya conoce y nadie puede
-- escribir en la carpeta de otro.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'soporte-adjuntos',
  'soporte-adjuntos',
  false,                     -- privado: nunca getPublicUrl(); solo URL firmada
  5242880,                   -- 5 MB por archivo (RF-05)
  ARRAY['image/png','image/jpeg','image/webp','image/heic','application/pdf','text/plain']
)
ON CONFLICT (id) DO UPDATE
SET public             = EXCLUDED.public,
    file_size_limit    = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Subida: solo dentro de la propia carpeta.
DROP POLICY IF EXISTS soporte_adj_insert ON storage.objects;
CREATE POLICY soporte_adj_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'soporte-adjuntos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Lectura: el dueño del archivo, el superadministrador, y el usuario que
-- participa en la conversación donde el adjunto quedó registrado. Esto es lo
-- que permite emitir la URL firmada desde el cliente sin exponer nada más.
DROP POLICY IF EXISTS soporte_adj_select ON storage.objects;
CREATE POLICY soporte_adj_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'soporte-adjuntos'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.es_super_admin()
      OR EXISTS (
        SELECT 1
        FROM public.soporte_adjuntos a
        JOIN public.soporte_mensajes m      ON m.id = a.mensaje_id
        JOIN public.soporte_conversaciones c ON c.id = m.conversacion_id
        WHERE a.ruta = storage.objects.name
          AND c.user_id = (SELECT auth.uid())
      )
    )
  );

-- Borrado: el dueño (para descartar una subida antes de enviar) y el
-- superadministrador (RF-19).
DROP POLICY IF EXISTS soporte_adj_delete ON storage.objects;
CREATE POLICY soporte_adj_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'soporte-adjuntos'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.es_super_admin()
    )
  );

-- ===========================================================================
-- PASO 8 — Realtime (RF-09)
-- ===========================================================================
--
-- Sin añadir la tabla a la publicación, el canal se suscribe pero no llega
-- nada. RLS sigue aplicando: cada quien solo recibe los mensajes que podría
-- leer con un SELECT.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'soporte_mensajes'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.soporte_mensajes;
      RAISE NOTICE 'soporte_mensajes añadida a la publicación supabase_realtime';
    END IF;
  ELSE
    RAISE NOTICE 'No existe la publicación supabase_realtime: habilita Realtime en el panel y vuelve a ejecutar este bloque';
  END IF;
END $$;

COMMIT;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
-- Las cuatro tablas deben aparecer con rowsecurity = true:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename LIKE 'soporte_%';
--
-- Ninguna política debe ser permisiva sin condición:
--   SELECT tablename, policyname, cmd, qual FROM pg_policies
--   WHERE schemaname = 'public' AND tablename LIKE 'soporte_%';
--
-- Las dos vistas deben tener security_invoker:
--   SELECT c.relname, c.reloptions FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relname LIKE 'soporte_%' AND c.relkind = 'v';

-- ===========================================================================
-- PASOS MANUALES (no se pueden hacer desde SQL)
-- ===========================================================================
--
-- 1. Realtime: panel → Database → Replication → publicación `supabase_realtime`,
--    comprobar que `soporte_mensajes` aparece marcada.
--
-- 2. Database Webhook (§8.1): panel → Database → Webhooks → Create.
--       Nombre : soporte_mensaje_creado
--       Tabla  : public.soporte_mensajes
--       Evento : INSERT
--       Tipo   : Supabase Edge Functions → soporte-notificar
--       Cabecera: Authorization: Bearer <SERVICE_ROLE_KEY>
--    Se usa un webhook y no un trigger con pg_net a propósito: el webhook
--    reintenta por su cuenta y no participa en la transacción del INSERT, de
--    modo que un fallo al notificar nunca impide guardar el mensaje (RNF-10).
--
-- 3. Secretos de la Edge Function (panel → Edge Functions → Secrets):
--       VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
--       RESEND_API_KEY, SOPORTE_EMAIL_FROM, SOPORTE_APP_URL
--    Las claves privadas viven aquí y en ningún otro sitio (RNF-07).
--
-- 4. Marcar tu usuario como superadministrador si aún no lo está:
--       UPDATE user_profiles SET rol = 'super_admin', activo = true
--       WHERE email = 'tu-correo@ejemplo.com';
-- ===========================================================================

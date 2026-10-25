-- ============================================================================
-- 071 — Darse de baja de los correos de novedades y encuestas
--
-- Los correos que manda el superadministrador desde «Correos» (encuestas de
-- experiencia, novedades) no son de servicio: quien los recibe tiene que poder
-- dejar de recibirlos, desde el propio correo y desde «Mi cuenta». Los correos
-- de soporte no pasan por aquí: responden a algo que el usuario pidió.
--
-- `correos_suscripcion` guarda la preferencia y un token por usuario. El token
-- va en el enlace del correo y permite darse de baja sin iniciar sesión (nadie
-- quiere entrar a la app para eso). Es un uuid aleatorio: adivinar el de otro
-- no es viable, y lo peor que permitiría es darle de baja de unas encuestas.
--
-- La tabla no tiene políticas: nadie la lee ni la escribe directamente. Todo va
-- por funciones, y la Edge Function `correo-masivo` la usa con service role.
-- Sin fila = suscrito (los usuarios de antes no tienen que hacer nada).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.correos_suscripcion (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token          uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  recibir        boolean NOT NULL DEFAULT true,
  actualizado_at timestamptz NOT NULL DEFAULT now(),
  origen         text CHECK (origen IN ('cuenta', 'correo', 'sistema'))
);

COMMENT ON TABLE public.correos_suscripcion IS
  'Si el usuario quiere recibir correos de novedades y encuestas. Sin fila = sí. El token va en el enlace de baja.';

ALTER TABLE public.correos_suscripcion ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.correos_suscripcion FROM anon, authenticated;

-- Preferencia propia (Mi cuenta).
CREATE OR REPLACE FUNCTION public.correos_mi_preferencia()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(
    (SELECT recibir FROM public.correos_suscripcion WHERE user_id = (SELECT auth.uid())),
    true)
$$;

CREATE OR REPLACE FUNCTION public.correos_cambiar_preferencia(p_recibir boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'hay que iniciar sesión' USING ERRCODE = '28000';
  END IF;
  INSERT INTO public.correos_suscripcion (user_id, recibir, origen)
  VALUES (v_uid, coalesce(p_recibir, true), 'cuenta')
  ON CONFLICT (user_id) DO UPDATE
    SET recibir = EXCLUDED.recibir, actualizado_at = now(), origen = 'cuenta';
  RETURN coalesce(p_recibir, true);
END;
$$;

-- Enlace del correo: sin sesión. Devuelve el estado y el correo enmascarado
-- para que la página diga a quién se dio de baja sin exponer la dirección.
CREATE OR REPLACE FUNCTION public.correos_baja_por_token(p_token uuid, p_recibir boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_fila  public.correos_suscripcion%ROWTYPE;
  v_email text;
BEGIN
  UPDATE public.correos_suscripcion
     SET recibir = coalesce(p_recibir, false), actualizado_at = now(), origen = 'correo'
   WHERE token = p_token
  RETURNING * INTO v_fila;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false);
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_fila.user_id;
  RETURN jsonb_build_object(
    'ok', true,
    'recibir', v_fila.recibir,
    -- «an***@gmail.com»: suficiente para reconocerse, no para leer la dirección.
    'correo', CASE WHEN v_email LIKE '%@%'
                   THEN left(split_part(v_email, '@', 1), 2) || '***@' || split_part(v_email, '@', 2)
              END
  );
END;
$$;

-- Quiénes se dieron de baja, para marcarlos en la pantalla «Correos».
CREATE OR REPLACE FUNCTION public.correos_bajas()
RETURNS SETOF uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'solo el superadministrador puede ver esto' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT user_id FROM public.correos_suscripcion WHERE NOT recibir;
END;
$$;

REVOKE ALL ON FUNCTION public.correos_mi_preferencia() FROM public, anon;
REVOKE ALL ON FUNCTION public.correos_cambiar_preferencia(boolean) FROM public, anon;
REVOKE ALL ON FUNCTION public.correos_bajas() FROM public, anon;
REVOKE ALL ON FUNCTION public.correos_baja_por_token(uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.correos_mi_preferencia() TO authenticated;
GRANT EXECUTE ON FUNCTION public.correos_cambiar_preferencia(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.correos_bajas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.correos_baja_por_token(uuid, boolean) TO anon, authenticated;

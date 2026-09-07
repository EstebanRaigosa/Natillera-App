-- ============================================================================
-- 026 — Cortes de caja (conciliación, Propuesta A)
--
-- Implementa la parte de Especificaciones/conciliacion-caja/levantamiento.md §8.5
-- que la vista de conciliación necesita para dejar de guardar en localStorage:
-- la tabla de cortes y el umbral a partir del cual una diferencia exige nota.
--
--   1. Quién puede ver y quién puede sellar
--   2. Tabla cortes_caja + índices
--   3. Congelado de los importes sellados (trigger)
    10|--   4. RLS
--   5. Umbral por natillera + RPC para guardarlo
--
-- Requiere: public.es_superusuario() (007), public.es_admin_natillera(uuid) (008),
--           public.usuario_puede_operar_natillera(uuid) (016).
--
-- Cuatro cosas se apartan de la letra de §8.5. Están justificadas donde aparecen:
--   · UNIQUE (natillera_id, fecha_corte) → índice único PARCIAL (ver PASO 2)
--   · Columna creado_por_nombre que la especificación no lista (PASO 2)
--   · UPDATE del umbral por RPC en vez de por política sobre natilleras (PASO 5)
    20|--   · El colaborador con gestionar_cuotas SÍ puede sellar (PASO 1)
--
-- Fuera de alcance a propósito: RF-11 (movimientos_fondo.concepto) y el desglose
-- por forma de pago de historial_pagos_cuota. Ambos obligan a tocar todos los
-- caminos de escritura de la app y a hacer backfill; no los necesita esta vista,
-- que sigue clasificando como lo hace hoy CuadreCaja.vue.
-- ============================================================================

BEGIN;

    30|-- ===========================================================================
-- PASO 1 — Quién puede sellar un corte
-- ===========================================================================
--
-- §6 dejaba «por decidir» si el colaborador con gestionar_cuotas puede cerrar un
-- corte (§15, pregunta 1). Aquí se decide que SÍ, por dos motivos: es quien
-- registra los pagos y por tanto quien cuenta el dinero, y la interfaz ya
-- habilita los campos con ese permiso. Una regla en base de datos más estricta
-- que la de la pantalla produciría un error al guardar después de haber
-- rellenado el formulario, que es la peor forma de denegar un permiso.
    40|--
-- SECURITY DEFINER para no depender del RLS de natilleras ni de
-- natillera_colaboradores dentro de la política (mismo motivo que en la 008).

CREATE OR REPLACE FUNCTION public.puede_conciliar_natillera(p_natillera_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    50|BEGIN
  IF p_natillera_id IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  IF public.es_superusuario() THEN
    RETURN true;
  END IF;
  IF public.es_admin_natillera(p_natillera_id) THEN
    RETURN true;
  END IF;
    60|  RETURN EXISTS (
    SELECT 1
    FROM public.natillera_colaboradores nc
    WHERE nc.natillera_id = p_natillera_id
      AND nc.usuario_id = auth.uid()
      AND nc.estado = 'aceptada'
      AND coalesce((nc.permisos->>'gestionar_cuotas')::boolean, false)
  );
END;
$$;
    70|
COMMENT ON FUNCTION public.puede_conciliar_natillera(uuid) IS
  'Sellar o anular un corte: superusuario, admin de la natillera, o colaborador aceptado con gestionar_cuotas. Debe coincidir con puedeConciliar de ConciliacionCaja.vue.';

REVOKE ALL ON FUNCTION public.puede_conciliar_natillera(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.puede_conciliar_natillera(uuid) TO authenticated, service_role;

-- ===========================================================================
-- PASO 2 — Tabla
-- ===========================================================================

    80|CREATE TABLE IF NOT EXISTS public.cortes_caja (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  natillera_id           uuid NOT NULL REFERENCES public.natilleras(id) ON DELETE CASCADE,
  fecha_corte            date NOT NULL,
  estado                 text NOT NULL DEFAULT 'cerrado'
                           CHECK (estado IN ('cerrado', 'anulado')),

  -- Congelados al sellar: el corte no se recalcula si después se edita el pasado.
  -- Que dejen de cuadrar es justamente la señal que el historial muestra.
  esperado_efectivo      numeric(14,2) NOT NULL,
    90|  real_efectivo          numeric(14,2) NOT NULL,
  esperado_transferencia numeric(14,2) NOT NULL,
  real_transferencia     numeric(14,2) NOT NULL,

  nota                   text CHECK (nota IS NULL OR char_length(nota) <= 1000),

  -- DEFAULT auth.uid() para que el cliente no tenga ni que mandarlo. El trigger de
  -- INSERT lo reescribe de todas formas: quién firma un corte no lo elige el formulario.
  creado_por             uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  -- Desnormalizado a propósito: el historial muestra un nombre en cada fila y
  -- user_profiles tiene su propio RLS, así que resolver el uuid al leer obligaría
  -- a una RPC extra o a abrir esa tabla. Se guarda el nombre del momento del
   100|  -- corte, que además es lo correcto en un registro de auditoría: si alguien se
  -- cambia el nombre después, el corte debe seguir diciendo quién lo firmó.
  creado_por_nombre      text NOT NULL,
  creado_en              timestamptz NOT NULL DEFAULT now(),

  anulado_por            uuid REFERENCES auth.users(id),
  anulado_en             timestamptz,
  motivo_anulacion       text,

  CONSTRAINT cortes_caja_anulado_coherente CHECK (
    estado <> 'anulado' OR (anulado_por IS NOT NULL AND anulado_en IS NOT NULL)
   110|  )
);

COMMENT ON TABLE public.cortes_caja IS
  'Propuesta A del levantamiento: cada corte sella, para una fecha, lo que el sistema decía que debía haber y lo que se declaró que había. El real sellado es el saldo inicial del periodo siguiente.';

-- §8.5 pedía UNIQUE (natillera_id, fecha_corte). Se implementa como índice único
-- PARCIAL sobre los cortes vigentes: si un corte se anula porque se sellló con una
-- cifra equivocada, hay que poder volver a sellar ese mismo día. Con la restricción
-- plena, anular dejaría la fecha bloqueada para siempre.
   120|CREATE UNIQUE INDEX IF NOT EXISTS cortes_caja_un_corte_vigente_por_fecha
  ON public.cortes_caja (natillera_id, fecha_corte)
  WHERE estado = 'cerrado';

CREATE INDEX IF NOT EXISTS idx_cortes_caja_natillera_fecha
  ON public.cortes_caja (natillera_id, fecha_corte DESC);

-- ===========================================================================
-- PASO 3 — Los importes sellados no se editan
-- ===========================================================================
   130|--
-- Hace falta una política de UPDATE para poder anular, pero un corte que se puede
-- reescribir no prueba nada. El trigger deja pasar solo el paso a 'anulado' y sus
-- tres campos; cualquier otro cambio se rechaza aunque la política lo permita.

CREATE OR REPLACE FUNCTION public.cortes_caja_solo_anulacion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
   140|  IF OLD.estado = 'anulado' THEN
    RAISE EXCEPTION 'CORTE_ANULADO: un corte anulado ya no se puede modificar' USING ERRCODE = 'P0001';
  END IF;

  IF NEW.natillera_id           IS DISTINCT FROM OLD.natillera_id
     OR NEW.fecha_corte            IS DISTINCT FROM OLD.fecha_corte
     OR NEW.esperado_efectivo      IS DISTINCT FROM OLD.esperado_efectivo
     OR NEW.real_efectivo          IS DISTINCT FROM OLD.real_efectivo
     OR NEW.esperado_transferencia IS DISTINCT FROM OLD.esperado_transferencia
     OR NEW.real_transferencia     IS DISTINCT FROM OLD.real_transferencia
   150|     OR NEW.nota                IS DISTINCT FROM OLD.nota
     OR NEW.creado_por             IS DISTINCT FROM OLD.creado_por
     OR NEW.creado_por_nombre      IS DISTINCT FROM OLD.creado_por_nombre
     OR NEW.creado_en              IS DISTINCT FROM OLD.creado_en THEN
    RAISE EXCEPTION 'CORTE_INMUTABLE: un corte sellado no se edita; anúlalo y sella uno nuevo' USING ERRCODE = 'P0001';
  END IF;

  IF NEW.estado <> 'anulado' THEN
    RAISE EXCEPTION 'CORTE_INMUTABLE: el único cambio admitido sobre un corte es anularlo' USING ERRCODE = 'P0001';
  END IF;
   160|
  -- Quién y cuándo lo pone el servidor: son datos de auditoría, no del formulario.
  NEW.anulado_por := auth.uid();
  NEW.anulado_en  := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cortes_caja_solo_anulacion ON public.cortes_caja;
CREATE TRIGGER trg_cortes_caja_solo_anulacion
   170|  BEFORE UPDATE ON public.cortes_caja
  FOR EACH ROW EXECUTE FUNCTION public.cortes_caja_solo_anulacion();

REVOKE EXECUTE ON FUNCTION public.cortes_caja_solo_anulacion() FROM public, anon, authenticated;

-- El autor tampoco lo elige el cliente al insertar.
CREATE OR REPLACE FUNCTION public.cortes_caja_sellar_autor()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
   180|AS $$
BEGIN
  NEW.creado_por := auth.uid();
  NEW.creado_en  := now();
  NEW.estado     := 'cerrado';
  NEW.anulado_por := NULL;
  NEW.anulado_en  := NULL;
  NEW.motivo_anulacion := NULL;
  RETURN NEW;
END;
   190|$$;

DROP TRIGGER IF EXISTS trg_cortes_caja_sellar_autor ON public.cortes_caja;
CREATE TRIGGER trg_cortes_caja_sellar_autor
  BEFORE INSERT ON public.cortes_caja
  FOR EACH ROW EXECUTE FUNCTION public.cortes_caja_sellar_autor();

REVOKE EXECUTE ON FUNCTION public.cortes_caja_sellar_autor() FROM public, anon, authenticated;

-- ===========================================================================
   200|-- PASO 4 — RLS (RNF-08)
-- ===========================================================================
--
-- Leer: cualquier miembro operativo. CA-10 pide que el historial se consulte sin
-- permisos de escritura.
-- Escribir: solo quien puede conciliar.
-- Borrar: nadie. Un corte no se borra, se anula.

ALTER TABLE public.cortes_caja ENABLE ROW LEVEL SECURITY;

   210|DROP POLICY IF EXISTS "cortes_caja_select_miembros_operativos" ON public.cortes_caja;
CREATE POLICY "cortes_caja_select_miembros_operativos"
ON public.cortes_caja FOR SELECT TO authenticated
USING (public.usuario_puede_operar_natillera(cortes_caja.natillera_id));

DROP POLICY IF EXISTS "cortes_caja_insert_conciliadores" ON public.cortes_caja;
CREATE POLICY "cortes_caja_insert_conciliadores"
ON public.cortes_caja FOR INSERT TO authenticated
WITH CHECK (public.puede_conciliar_natillera(natillera_id));

   220|DROP POLICY IF EXISTS "cortes_caja_update_conciliadores" ON public.cortes_caja;
CREATE POLICY "cortes_caja_update_conciliadores"
ON public.cortes_caja FOR UPDATE TO authenticated
USING (public.puede_conciliar_natillera(cortes_caja.natillera_id))
WITH CHECK (public.puede_conciliar_natillera(natillera_id));

REVOKE ALL ON public.cortes_caja FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.cortes_caja TO authenticated;
GRANT ALL ON public.cortes_caja TO service_role;

   230|-- ===========================================================================
-- PASO 5 — Umbral que obliga a escribir una nota
-- ===========================================================================
--
-- 0 = cualquier diferencia pide nota, que es el comportamiento más exigente y por
-- eso el valor por defecto.

ALTER TABLE public.natilleras
  ADD COLUMN IF NOT EXISTS umbral_diferencia_corte numeric(14,2) NOT NULL DEFAULT 0;

   240|COMMENT ON COLUMN public.natilleras.umbral_diferencia_corte IS
  'Diferencia a partir de la cual cerrar un corte exige nota (RF-10). 0 = siempre la exige.';

-- Se guarda por RPC y no con un UPDATE directo sobre natilleras: esta vista no
-- debe necesitar permiso de escritura sobre la fila entera de la natillera, y
-- añadir una política de UPDATE sobre esa tabla para un solo número abriría todo
-- lo demás (nombre, admin_id, configuración) a quien hoy no lo tiene.
CREATE OR REPLACE FUNCTION public.guardar_umbral_corte(
  p_natillera_id uuid,
  p_umbral       numeric
   250|)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_umbral numeric;
BEGIN
  IF NOT public.puede_conciliar_natillera(p_natillera_id) THEN
   260|    RAISE EXCEPTION 'CORTE_PROHIBIDO: no puedes cambiar el umbral de esta natillera' USING ERRCODE = '42501';
  END IF;

  v_umbral := greatest(round(coalesce(p_umbral, 0)), 0);

  UPDATE public.natilleras
  SET umbral_diferencia_corte = v_umbral
  WHERE id = p_natillera_id;

  RETURN v_umbral;
   270|END;
$$;

REVOKE ALL ON FUNCTION public.guardar_umbral_corte(uuid, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.guardar_umbral_corte(uuid, numeric) TO authenticated;

-- Leerlo tampoco debe depender de que quien consulta pueda leer la fila entera
-- de natilleras, cuyo RLS varía según el rol.
CREATE OR REPLACE FUNCTION public.obtener_umbral_corte(p_natillera_id uuid)
RETURNS numeric
   280|LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_umbral numeric;
BEGIN
  IF NOT public.usuario_puede_operar_natillera(p_natillera_id) THEN
    RETURN 0;
   290|  END IF;

  SELECT umbral_diferencia_corte INTO v_umbral
  FROM public.natilleras WHERE id = p_natillera_id;

  RETURN coalesce(v_umbral, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.obtener_umbral_corte(uuid) FROM public, anon;
   300|GRANT EXECUTE ON FUNCTION public.obtener_umbral_corte(uuid) TO authenticated;

COMMIT;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
-- RLS activo y con las tres políticas esperadas:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename = 'cortes_caja';
   310|--   SELECT policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'cortes_caja';
--
-- Un corte sellado no se deja editar (debe fallar con CORTE_INMUTABLE):
--   UPDATE public.cortes_caja SET real_efectivo = 1 WHERE id = '<un id>';
--
-- Anular sí (y rellena anulado_por / anulado_en solo):
--   UPDATE public.cortes_caja SET estado = 'anulado', motivo_anulacion = 'prueba'
--   WHERE id = '<un id>';

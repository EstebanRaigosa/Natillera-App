-- ============================================
-- Políticas RLS para tabla utilidades_clasificadas
-- ============================================
-- Si el indicador de utilidades en NatilleraDetalle muestra 0 en multas
-- para usuarios que no son superusuario, es porque RLS bloquea el SELECT.
-- Esta migración permite SELECT cuando el usuario es superusuario o admin de la natillera.
--
-- IMPORTANTE: La política usa una función SECURITY DEFINER (es_admin_natillera)
-- para no depender del RLS de la tabla natilleras en la subconsulta; si la subconsulta
-- lee natilleras con RLS activo, otros usuarios pueden no ver la fila y la política falla.

-- Requiere que public.es_superusuario() exista (ver 007_prestamos_rls_insert_policy.sql).

-- Función: ¿el usuario actual es admin de esta natillera?
-- SECURITY DEFINER permite leer natilleras sin que RLS bloquee la consulta.
CREATE OR REPLACE FUNCTION public.es_admin_natillera(natillera_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = natillera_id
      AND n.admin_id = auth.uid()
  );
$$;

-- Eliminar política SELECT anterior si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas' AND policyname = 'utilidades_clasificadas_select_admin_or_super'
  ) THEN
    DROP POLICY "utilidades_clasificadas_select_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Crear política de SELECT: superusuario o admin de la natillera (vía función DEFINER)
CREATE POLICY "utilidades_clasificadas_select_admin_or_super"
ON public.utilidades_clasificadas
FOR SELECT
USING (
  public.es_superusuario()
  OR public.es_admin_natillera(utilidades_clasificadas.natillera_id)
);

-- ============================================
-- RPC para obtener sanciones pagadas (evita depender del RLS de la tabla)
-- ============================================
-- Las cuotas pagadas tienen valor_multa = 0; el total solo está en utilidades_clasificadas.
-- Esta RPC lee con SECURITY DEFINER y devuelve el monto si el usuario puede ver la natillera:
-- superusuario, admin de la natillera (admin_id) o colaborador aceptado.
CREATE OR REPLACE FUNCTION public.obtener_sanciones_pagadas(p_natillera_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_monto numeric;
  v_puede_ver boolean := false;
BEGIN
  -- Superusuario siempre puede
  IF public.es_superusuario() THEN
    v_puede_ver := true;
  -- Admin de la natillera
  ELSIF public.es_admin_natillera(p_natillera_id) THEN
    v_puede_ver := true;
  -- Colaborador aceptado de la natillera
  ELSIF EXISTS (
    SELECT 1 FROM public.natillera_colaboradores nc
    WHERE nc.natillera_id = p_natillera_id
      AND nc.usuario_id = auth.uid()
      AND nc.estado = 'aceptada'
  ) THEN
    v_puede_ver := true;
  END IF;

  IF NOT v_puede_ver THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(monto::numeric, 0) INTO v_monto
  FROM public.utilidades_clasificadas
  WHERE natillera_id = p_natillera_id
    AND tipo = 'sanciones'
    AND fecha_cierre IS NULL
  LIMIT 1;
  RETURN COALESCE(v_monto, 0);
END;
$$;

-- Permitir que anon y authenticated llamen la RPC
GRANT EXECUTE ON FUNCTION public.obtener_sanciones_pagadas(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.obtener_sanciones_pagadas(uuid) TO authenticated;

-- Opcional: políticas INSERT, UPDATE y DELETE para que admins puedan
-- crear/actualizar utilidades clasificadas de su natillera (descomenta si hace falta)

/*
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas' AND policyname = 'utilidades_clasificadas_insert_admin_or_super') THEN
    DROP POLICY "utilidades_clasificadas_insert_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas' AND policyname = 'utilidades_clasificadas_update_admin_or_super') THEN
    DROP POLICY "utilidades_clasificadas_update_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas' AND policyname = 'utilidades_clasificadas_delete_admin_or_super') THEN
    DROP POLICY "utilidades_clasificadas_delete_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "utilidades_clasificadas_insert_admin_or_super"
ON public.utilidades_clasificadas
FOR INSERT
WITH CHECK (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = natillera_id AND n.admin_id = auth.uid()
  )
);

CREATE POLICY "utilidades_clasificadas_update_admin_or_super"
ON public.utilidades_clasificadas
FOR UPDATE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = utilidades_clasificadas.natillera_id AND n.admin_id = auth.uid()
  )
)
WITH CHECK (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = natillera_id AND n.admin_id = auth.uid()
  )
);

CREATE POLICY "utilidades_clasificadas_delete_admin_or_super"
ON public.utilidades_clasificadas
FOR DELETE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = utilidades_clasificadas.natillera_id AND n.admin_id = auth.uid()
  )
);
*/

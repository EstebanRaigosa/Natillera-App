-- ============================================
-- utilidades_clasificadas: RLS para miembros operativos (admin + colaboradores)
-- ============================================
-- Problema: INSERT/UPDATE/SELECT solo con admin_id bloqueaba liquidaciones y registros
-- hechos por usuarios invitados como colaboradores (estado 'aceptada').
-- Solución: misma noción que public.obtener_sanciones_pagadas: superusuario, admin de
-- la natillera, o colaborador aceptado.
--
-- Requiere: public.es_superusuario(), public.es_admin_natillera(uuid) (migración 008).

CREATE OR REPLACE FUNCTION public.usuario_puede_operar_natillera(p_natillera_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_natillera_id IS NULL OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  IF public.es_superusuario() THEN
    RETURN true;
  END IF;
  IF public.es_admin_natillera(p_natillera_id) THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.natillera_colaboradores nc
    WHERE nc.natillera_id = p_natillera_id
      AND nc.usuario_id = auth.uid()
      AND nc.estado = 'aceptada'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.usuario_puede_operar_natillera(uuid) TO authenticated;

ALTER TABLE public.utilidades_clasificadas ENABLE ROW LEVEL SECURITY;

-- Quitar políticas anteriores (admin-only o nombres legacy)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas'
      AND policyname = 'utilidades_clasificadas_select_admin_or_super'
  ) THEN
    DROP POLICY "utilidades_clasificadas_select_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas'
      AND policyname = 'utilidades_clasificadas_insert_admin_or_super'
  ) THEN
    DROP POLICY "utilidades_clasificadas_insert_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas'
      AND policyname = 'utilidades_clasificadas_update_admin_or_super'
  ) THEN
    DROP POLICY "utilidades_clasificadas_update_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'utilidades_clasificadas'
      AND policyname = 'utilidades_clasificadas_delete_admin_or_super'
  ) THEN
    DROP POLICY "utilidades_clasificadas_delete_admin_or_super" ON public.utilidades_clasificadas;
  END IF;
END $$;

CREATE POLICY "utilidades_clasificadas_select_miembros_operativos"
ON public.utilidades_clasificadas
FOR SELECT
USING (public.usuario_puede_operar_natillera(utilidades_clasificadas.natillera_id));

CREATE POLICY "utilidades_clasificadas_insert_miembros_operativos"
ON public.utilidades_clasificadas
FOR INSERT
WITH CHECK (public.usuario_puede_operar_natillera(natillera_id));

CREATE POLICY "utilidades_clasificadas_update_miembros_operativos"
ON public.utilidades_clasificadas
FOR UPDATE
USING (public.usuario_puede_operar_natillera(utilidades_clasificadas.natillera_id))
WITH CHECK (public.usuario_puede_operar_natillera(natillera_id));

CREATE POLICY "utilidades_clasificadas_delete_miembros_operativos"
ON public.utilidades_clasificadas
FOR DELETE
USING (public.usuario_puede_operar_natillera(utilidades_clasificadas.natillera_id));

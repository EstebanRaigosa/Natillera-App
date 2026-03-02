-- ============================================
-- Políticas RLS para tabla actividades
-- ============================================
-- Si al crear una actividad aparece 401 Unauthorized, es porque RLS está
-- activo en la tabla pero no hay políticas que permitan INSERT/SELECT.
-- Esta migración permite operaciones cuando el usuario es superusuario
-- o admin de la natillera de la actividad.
--
-- Requiere que public.es_superusuario() exista (ver 007_prestamos_rls_insert_policy.sql).
-- Opcional: public.es_admin_natillera() de 008 (aquí usamos EXISTS directo para no depender).

-- Asegurar que RLS está activo (si ya está, no hace daño)
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen (evitar duplicados)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'actividades' AND policyname = 'actividades_select_admin_or_super') THEN
    DROP POLICY "actividades_select_admin_or_super" ON public.actividades;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'actividades' AND policyname = 'actividades_insert_admin_or_super') THEN
    DROP POLICY "actividades_insert_admin_or_super" ON public.actividades;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'actividades' AND policyname = 'actividades_update_admin_or_super') THEN
    DROP POLICY "actividades_update_admin_or_super" ON public.actividades;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'actividades' AND policyname = 'actividades_delete_admin_or_super') THEN
    DROP POLICY "actividades_delete_admin_or_super" ON public.actividades;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- SELECT: superusuario o admin de la natillera de la actividad
CREATE POLICY "actividades_select_admin_or_super"
ON public.actividades
FOR SELECT
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = actividades.natillera_id AND n.admin_id = auth.uid()
  )
);

-- INSERT: superusuario o admin de la natillera (natillera_id en la fila nueva)
CREATE POLICY "actividades_insert_admin_or_super"
ON public.actividades
FOR INSERT
WITH CHECK (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = natillera_id AND n.admin_id = auth.uid()
  )
);

-- UPDATE: superusuario o admin de la natillera
CREATE POLICY "actividades_update_admin_or_super"
ON public.actividades
FOR UPDATE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = actividades.natillera_id AND n.admin_id = auth.uid()
  )
)
WITH CHECK (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = natillera_id AND n.admin_id = auth.uid()
  )
);

-- DELETE: superusuario o admin de la natillera
CREATE POLICY "actividades_delete_admin_or_super"
ON public.actividades
FOR DELETE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = actividades.natillera_id AND n.admin_id = auth.uid()
  )
);

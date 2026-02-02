-- ============================================
-- Políticas RLS para tabla prestamos
-- ============================================
-- Ejecutar en Supabase SQL Editor si aparece:
-- "new row violates row-level security policy for table 'prestamos'"
--
-- Permite INSERT cuando:
-- 1. Es superusuario (public.es_superusuario()), o
-- 2. El usuario es admin de la natillera del socio_natillera del préstamo.
--
-- Si la función es_superusuario() no existe en tu BD, se crea aquí.
-- Si ya la tienes, puedes comentar el bloque siguiente.

CREATE OR REPLACE FUNCTION public.es_superusuario()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND LOWER(TRIM(email)) = 'raigo.16@gmail.com'
  );
$$;

-- Eliminar política de INSERT anterior si existe (ajusta el nombre si en tu BD es otro)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'prestamos' AND policyname = 'prestamos_insert_admin_or_super'
  ) THEN
    DROP POLICY "prestamos_insert_admin_or_super" ON prestamos;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL; -- ignorar si no existe
END $$;

-- Crear política de INSERT: superusuario o admin de la natillera
CREATE POLICY "prestamos_insert_admin_or_super"
ON prestamos
FOR INSERT
WITH CHECK (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM socios_natillera sn
    INNER JOIN natilleras n ON n.id = sn.natillera_id
    WHERE sn.id = socio_natillera_id
      AND n.admin_id = auth.uid()
  )
);

-- Opcional: políticas de SELECT, UPDATE y DELETE por si faltan o fallan
-- (descomenta si ves errores al listar/editar/eliminar préstamos)

/*
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prestamos' AND policyname = 'prestamos_select_admin_or_super') THEN
    DROP POLICY "prestamos_select_admin_or_super" ON prestamos;
  END IF;
END $$;

CREATE POLICY "prestamos_select_admin_or_super"
ON prestamos
FOR SELECT
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM socios_natillera sn
    INNER JOIN natilleras n ON n.id = sn.natillera_id
    WHERE sn.id = prestamos.socio_natillera_id
      AND n.admin_id = auth.uid()
  )
);

CREATE POLICY "prestamos_update_admin_or_super"
ON prestamos
FOR UPDATE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM socios_natillera sn
    INNER JOIN natilleras n ON n.id = sn.natillera_id
    WHERE sn.id = prestamos.socio_natillera_id
      AND n.admin_id = auth.uid()
  )
)
WITH CHECK (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM socios_natillera sn
    INNER JOIN natilleras n ON n.id = sn.natillera_id
    WHERE sn.id = prestamos.socio_natillera_id
      AND n.admin_id = auth.uid()
  )
);

CREATE POLICY "prestamos_delete_admin_or_super"
ON prestamos
FOR DELETE
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1
    FROM socios_natillera sn
    INNER JOIN natilleras n ON n.id = sn.natillera_id
    WHERE sn.id = prestamos.socio_natillera_id
      AND n.admin_id = auth.uid()
  )
);
*/

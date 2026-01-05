-- ============================================
-- CREAR BUCKET DE STORAGE PARA ARCHIVOS DE SOPORTE
-- ============================================

-- IMPORTANTE: El bucket debe crearse primero en el Dashboard de Supabase
-- Ve a: Storage -> New Bucket
-- - Nombre: support-files
-- - Público: Sí
-- - File size limit: 10MB (recomendado)
-- - Allowed MIME types: image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

-- NOTA: En Supabase, los buckets no se pueden crear directamente con SQL,
-- solo las políticas. Este script crea las políticas RLS para el bucket.

-- Eliminar políticas si existen (para poder recrearlas)
DROP POLICY IF EXISTS "Cualquiera puede subir archivos de soporte" ON storage.objects;
DROP POLICY IF EXISTS "Cualquiera puede leer archivos de soporte" ON storage.objects;
DROP POLICY IF EXISTS "Solo admins pueden eliminar archivos de soporte" ON storage.objects;

-- Política para permitir INSERT (subir archivos)
-- Cualquiera (autenticado o no) puede subir archivos de soporte
CREATE POLICY "Cualquiera puede subir archivos de soporte"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'support-files'
);

-- Política para permitir SELECT (leer archivos)
-- Cualquiera puede leer los archivos de soporte (necesario para las URLs públicas)
CREATE POLICY "Cualquiera puede leer archivos de soporte"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'support-files'
);

-- Política opcional: Solo admins pueden eliminar archivos
-- Ajusta el email según tu usuario admin
CREATE POLICY "Solo admins pueden eliminar archivos de soporte"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-files' AND
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'raigo.16@gmail.com'
);

-- NOTA: Si el bucket aún no existe, estas políticas fallarán silenciosamente.
-- Crea el bucket primero en el Dashboard y luego ejecuta este script.

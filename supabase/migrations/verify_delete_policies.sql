-- Script de verificación: Verificar que las políticas DELETE estén configuradas
-- ============================================
-- Ejecuta este script para verificar si las políticas DELETE están creadas

-- Verificar política DELETE para natilleras
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'natilleras' 
AND cmd = 'DELETE';

-- Verificar política DELETE para socios_natillera
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'socios_natillera' 
AND cmd = 'DELETE';

-- Verificar política DELETE para socios
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'socios' 
AND cmd = 'DELETE';

-- Si no aparecen resultados, significa que las políticas no están creadas
-- Ejecuta el archivo: add_cascade_delete_policies.sql


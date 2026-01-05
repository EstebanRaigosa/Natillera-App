-- Consulta de diagnóstico para verificar el problema con pagos_prestamo
-- Ejecuta esto ANTES de la migración para ver qué está pasando

-- 1. Verificar que el usuario esté autenticado
SELECT 
    'Usuario autenticado' as check_name,
    auth.uid() as user_id,
    CASE WHEN auth.uid() IS NOT NULL THEN '✅ OK' ELSE '❌ NO AUTENTICADO' END as status;

-- 2. Verificar las políticas existentes en pagos_prestamo
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
WHERE tablename = 'pagos_prestamo'
ORDER BY policyname;

-- 3. Verificar todas las natilleras del usuario
SELECT 
    'Natilleras del usuario' as check_name,
    id as natillera_id,
    nombre,
    admin_id
FROM natilleras
WHERE admin_id = auth.uid();

-- 4. Verificar todos los préstamos (sin filtro de usuario primero)
SELECT 
    'Todos los préstamos' as check_name,
    COUNT(*) as total_prestamos,
    STRING_AGG(p.id::text, ', ') as prestamo_ids
FROM prestamos p;

-- 5. Verificar la relación completa: préstamos -> socios_natillera -> natilleras
SELECT 
    'Relación completa' as check_name,
    p.id as prestamo_id,
    p.socio_natillera_id,
    sn.id as socio_natillera_id_verificado,
    sn.natillera_id,
    n.id as natillera_id_verificado,
    n.admin_id,
    n.nombre as natillera_nombre,
    CASE 
        WHEN n.admin_id = auth.uid() THEN '✅ Pertenece al usuario'
        ELSE '❌ No pertenece al usuario'
    END as pertenencia
FROM prestamos p
LEFT JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
LEFT JOIN natilleras n ON sn.natillera_id = n.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Verificar si hay préstamos que pertenezcan al usuario actual (versión detallada)
SELECT 
    'Préstamos del usuario (detallado)' as check_name,
    p.id as prestamo_id,
    p.monto,
    p.saldo_actual,
    n.nombre as natillera_nombre,
    n.admin_id
FROM prestamos p
JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
JOIN natilleras n ON sn.natillera_id = n.id
WHERE n.admin_id = auth.uid();

-- 7. Contar préstamos del usuario
SELECT 
    'Total préstamos del usuario' as check_name,
    COUNT(*) as total_prestamos
FROM prestamos p
JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
JOIN natilleras n ON sn.natillera_id = n.id
WHERE n.admin_id = auth.uid();


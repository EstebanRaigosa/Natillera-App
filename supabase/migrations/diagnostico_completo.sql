-- Diagnóstico completo paso a paso
-- Ejecuta cada consulta por separado para ver los resultados

-- 1. Verificar usuario autenticado
SELECT 
    '1. Usuario' as paso,
    auth.uid() as user_id,
    CASE WHEN auth.uid() IS NOT NULL THEN '✅ OK' ELSE '❌ NO AUTENTICADO' END as status;

-- 2. Ver todas las natilleras del usuario
SELECT 
    '2. Natilleras del usuario' as paso,
    id,
    nombre,
    admin_id,
    CASE WHEN admin_id = auth.uid() THEN '✅ Coincide' ELSE '❌ No coincide' END as verificacion
FROM natilleras
WHERE admin_id = auth.uid();

-- 3. Ver TODOS los préstamos (sin filtro)
SELECT 
    '3. Todos los préstamos' as paso,
    p.id,
    p.monto,
    p.saldo_actual,
    p.socio_natillera_id
FROM prestamos p
ORDER BY p.created_at DESC
LIMIT 10;

-- 4. Ver la relación completa de UN préstamo específico
-- (Reemplaza 'PRESTAMO_ID_AQUI' con el ID del préstamo que ves en la app)
SELECT 
    '4. Relación completa del préstamo' as paso,
    p.id as prestamo_id,
    p.socio_natillera_id as prestamo_socio_natillera_id,
    sn.id as socio_natillera_id_real,
    sn.natillera_id,
    n.id as natillera_id_real,
    n.nombre as natillera_nombre,
    n.admin_id as natillera_admin_id,
    auth.uid() as usuario_actual,
    CASE 
        WHEN n.admin_id = auth.uid() THEN '✅ El préstamo pertenece al usuario'
        WHEN n.admin_id IS NULL THEN '❌ La natillera no tiene admin_id'
        ELSE '❌ El préstamo NO pertenece al usuario'
    END as resultado
FROM prestamos p
LEFT JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
LEFT JOIN natilleras n ON sn.natillera_id = n.id
WHERE p.id = 'PRESTAMO_ID_AQUI'::uuid;  -- ⚠️ CAMBIA ESTE ID

-- 5. Ver todos los socios_natillera y sus natilleras
SELECT 
    '5. Socios-Natillera' as paso,
    sn.id as socio_natillera_id,
    sn.natillera_id,
    n.nombre as natillera_nombre,
    n.admin_id,
    CASE WHEN n.admin_id = auth.uid() THEN '✅' ELSE '❌' END as es_mia
FROM socios_natillera sn
LEFT JOIN natilleras n ON sn.natillera_id = n.id
LIMIT 20;

-- 6. Verificar si hay préstamos con relaciones rotas
SELECT 
    '6. Préstamos con problemas' as paso,
    p.id,
    p.socio_natillera_id,
    CASE 
        WHEN sn.id IS NULL THEN '❌ socio_natillera_id no existe'
        WHEN n.id IS NULL THEN '❌ natillera_id no existe'
        WHEN n.admin_id IS NULL THEN '❌ natillera sin admin_id'
        WHEN n.admin_id != auth.uid() THEN '⚠️ Préstamo de otra natillera'
        ELSE '✅ OK'
    END as problema
FROM prestamos p
LEFT JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
LEFT JOIN natilleras n ON sn.natillera_id = n.id
ORDER BY p.created_at DESC
LIMIT 10;


-- Consulta rápida para obtener el ID del préstamo que estás intentando pagar
-- Esta consulta muestra los préstamos más recientes con toda su información de relación

SELECT 
    p.id as prestamo_id,
    p.monto,
    p.saldo_actual,
    p.socio_natillera_id,
    sn.natillera_id,
    n.nombre as natillera_nombre,
    n.admin_id as natillera_admin_id,
    auth.uid() as usuario_actual_id,
    CASE 
        WHEN n.admin_id = auth.uid() THEN '✅ SÍ pertenece al usuario - DEBERÍA FUNCIONAR'
        WHEN n.admin_id IS NULL THEN '❌ La natillera no tiene admin_id'
        WHEN n.admin_id != auth.uid() THEN '❌ NO pertenece al usuario - Este es el problema'
        ELSE '⚠️ Relación rota'
    END as diagnostico
FROM prestamos p
LEFT JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
LEFT JOIN natilleras n ON sn.natillera_id = n.id
ORDER BY p.created_at DESC
LIMIT 5;


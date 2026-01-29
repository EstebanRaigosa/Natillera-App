-- ============================================
-- CORREGIR quincena_pago EN socios_actividad PARA NATILLERAS MENSUALES
-- ============================================
-- Este script corrige los registros de socios_actividad que tienen quincena_pago = 2
-- cuando deberían tener quincena_pago = 0 para natilleras mensuales

-- Paso 1: Actualizar registros de socios_actividad donde:
-- - La natillera es mensual Y el socio es mensual, O
-- - El socio es mensual (incluso si la natillera es quincenal)
-- - quincena_pago está en 2 (debería ser 0 para socios mensuales)
UPDATE socios_actividad sa
SET quincena_pago = 0
FROM socios_natillera sn
JOIN natilleras n ON sn.natillera_id = n.id
WHERE sa.socio_natillera_id = sn.id
  AND sn.periodicidad = 'mensual'  -- El socio es mensual
  AND sa.quincena_pago = 2;        -- Tiene quincena_pago = 2 cuando debería ser 0

-- Paso 2: Verificar que las actividades también tengan quincena_pago = 0 para natilleras mensuales
UPDATE actividades a
SET quincena_pago = 0
FROM natilleras n
WHERE a.natillera_id = n.id
  AND n.periodicidad = 'mensual'
  AND a.quincena_pago IS NOT NULL
  AND a.quincena_pago != 0;

-- Paso 3: Verificar resultados
-- Contar registros que aún necesitan corrección (socios mensuales con quincena_pago = 2)
SELECT 
  'socios_actividad' as tabla,
  COUNT(*) as registros_con_quincena_2_en_socios_mensuales
FROM socios_actividad sa
JOIN socios_natillera sn ON sa.socio_natillera_id = sn.id
WHERE sn.periodicidad = 'mensual'  -- El socio es mensual
  AND sa.quincena_pago = 2;        -- Tiene quincena_pago = 2 cuando debería ser 0

SELECT 
  'actividades' as tabla,
  COUNT(*) as registros_con_quincena_diferente_de_0_en_mensual
FROM actividades a
JOIN natilleras n ON a.natillera_id = n.id
WHERE n.periodicidad = 'mensual'
  AND a.quincena_pago IS NOT NULL
  AND a.quincena_pago != 0;

-- ============================================
-- MIGRACIÓN: Agregar 'colaborador' al constraint de entidad en auditoria
-- ============================================

-- Eliminar el constraint existente
ALTER TABLE auditoria DROP CONSTRAINT IF EXISTS auditoria_entidad_check;

-- Recrear el constraint con 'colaborador' incluido
ALTER TABLE auditoria ADD CONSTRAINT auditoria_entidad_check 
CHECK (entidad IN (
    'natillera', 'socio', 'socio_natillera', 'cuota', 'pago', 'comprobante', 
    'prestamo', 'pago_prestamo', 'actividad', 'multa', 'configuracion',
    'colaborador'
));

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================


-- Migración: Corregir relación CASCADE en historial_comprobantes_prestamo
-- ============================================
-- Asegurar que el historial NO se elimine cuando se elimina el pago
-- El historial debe mantenerse para trazabilidad

-- 1. Eliminar la constraint existente si tiene CASCADE
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Buscar la constraint de foreign key
    FOR r IN (
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'historial_comprobantes_prestamo'
            AND kcu.column_name = 'pago_prestamo_id'
            AND rc.delete_rule = 'CASCADE'
    ) LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.table_name, r.constraint_name);
    END LOOP;
END $$;

-- 2. Recrear la constraint con SET NULL (si no existe ya)
DO $$ 
BEGIN
    -- Verificar si ya existe una constraint con SET NULL o RESTRICT
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints AS rc
            ON rc.constraint_name = tc.constraint_name
            AND rc.constraint_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'historial_comprobantes_prestamo'
            AND kcu.column_name = 'pago_prestamo_id'
            AND (rc.delete_rule = 'SET NULL' OR rc.delete_rule = 'NO ACTION' OR rc.delete_rule = 'RESTRICT')
    ) THEN
        -- Agregar la constraint con SET NULL
        ALTER TABLE historial_comprobantes_prestamo
        ADD CONSTRAINT historial_comprobantes_prestamo_pago_prestamo_id_fkey
        FOREIGN KEY (pago_prestamo_id)
        REFERENCES pagos_prestamo(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Comentario para documentar
COMMENT ON CONSTRAINT historial_comprobantes_prestamo_pago_prestamo_id_fkey 
ON historial_comprobantes_prestamo 
IS 'El historial se mantiene incluso cuando se elimina el pago (SET NULL) para preservar la trazabilidad';


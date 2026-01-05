-- Migración: Actualizar tabla historial_comprobantes_prestamo
-- ============================================
-- Agregar campos adicionales para guardar información del préstamo directamente
-- Esto permite que el historial funcione incluso cuando el pago fue eliminado

-- 1. Agregar columnas si no existen
DO $$ 
BEGIN
    -- Agregar prestamo_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'prestamo_id'
    ) THEN
        ALTER TABLE historial_comprobantes_prestamo
        ADD COLUMN prestamo_id UUID REFERENCES prestamos(id) ON DELETE SET NULL;
    END IF;

    -- Agregar socio_natillera_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'socio_natillera_id'
    ) THEN
        ALTER TABLE historial_comprobantes_prestamo
        ADD COLUMN socio_natillera_id UUID REFERENCES socios_natillera(id) ON DELETE SET NULL;
    END IF;

    -- Cambiar pago_prestamo_id para permitir NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historial_comprobantes_prestamo' 
        AND column_name = 'pago_prestamo_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE historial_comprobantes_prestamo
        ALTER COLUMN pago_prestamo_id DROP NOT NULL;
    END IF;
END $$;

-- 2. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_historial_prestamo_prestamo_id 
ON historial_comprobantes_prestamo(prestamo_id);

CREATE INDEX IF NOT EXISTS idx_historial_prestamo_socio_natillera_id 
ON historial_comprobantes_prestamo(socio_natillera_id);

-- 3. Actualizar políticas RLS existentes
DROP POLICY IF EXISTS "Los usuarios pueden ver historial de sus natilleras" ON historial_comprobantes_prestamo;
CREATE POLICY "Los usuarios pueden ver historial de sus natilleras"
ON historial_comprobantes_prestamo
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM socios_natillera sn
        INNER JOIN natilleras n ON sn.natillera_id = n.id
        WHERE (
            (historial_comprobantes_prestamo.socio_natillera_id IS NOT NULL 
             AND sn.id = historial_comprobantes_prestamo.socio_natillera_id)
            OR 
            (historial_comprobantes_prestamo.prestamo_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM prestamos p 
                 WHERE p.id = historial_comprobantes_prestamo.prestamo_id
                 AND p.socio_natillera_id = sn.id
             ))
            OR
            (historial_comprobantes_prestamo.pago_prestamo_id IS NOT NULL
             AND EXISTS (
                 SELECT 1 FROM pagos_prestamo pp
                 INNER JOIN prestamos p ON pp.prestamo_id = p.id
                 WHERE pp.id = historial_comprobantes_prestamo.pago_prestamo_id
                 AND p.socio_natillera_id = sn.id
             ))
        )
        AND (
            n.admin_id = auth.uid()
            OR public.es_superusuario()
        )
    )
);

DROP POLICY IF EXISTS "Solo administradores pueden insertar historial" ON historial_comprobantes_prestamo;
CREATE POLICY "Solo administradores pueden insertar historial"
ON historial_comprobantes_prestamo
FOR INSERT
WITH CHECK (
    public.es_superusuario()
    OR EXISTS (
        SELECT 1 FROM natilleras WHERE admin_id = auth.uid()
    )
);


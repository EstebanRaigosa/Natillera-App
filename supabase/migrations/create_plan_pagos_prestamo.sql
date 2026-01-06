-- ============================================
-- TABLA: plan_pagos_prestamo
-- Plan de pagos proyectado para cada préstamo
-- ============================================
CREATE TABLE IF NOT EXISTS plan_pagos_prestamo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prestamo_id UUID REFERENCES prestamos(id) ON DELETE CASCADE,
    numero_cuota INTEGER NOT NULL,
    fecha_proyectada DATE NOT NULL,
    valor_cuota DECIMAL(12,2) NOT NULL,
    capital DECIMAL(12,2) NOT NULL,
    interes DECIMAL(12,2) NOT NULL,
    saldo_proyectado DECIMAL(12,2) NOT NULL,
    pagada BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prestamo_id, numero_cuota)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_plan_pagos_prestamo_id ON plan_pagos_prestamo(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_plan_pagos_fecha_proyectada ON plan_pagos_prestamo(fecha_proyectada);

-- Comentarios
COMMENT ON TABLE plan_pagos_prestamo IS 'Plan de pagos proyectado para cada préstamo';
COMMENT ON COLUMN plan_pagos_prestamo.numero_cuota IS 'Número de cuota (1, 2, 3, ...)';
COMMENT ON COLUMN plan_pagos_prestamo.fecha_proyectada IS 'Fecha proyectada de pago de la cuota';
COMMENT ON COLUMN plan_pagos_prestamo.valor_cuota IS 'Valor total de la cuota (capital + interés)';
COMMENT ON COLUMN plan_pagos_prestamo.capital IS 'Parte de capital de la cuota';
COMMENT ON COLUMN plan_pagos_prestamo.interes IS 'Parte de interés de la cuota';
COMMENT ON COLUMN plan_pagos_prestamo.saldo_proyectado IS 'Saldo que quedaría después de pagar esta cuota';
COMMENT ON COLUMN plan_pagos_prestamo.pagada IS 'Indica si la cuota ya fue pagada';

-- Políticas RLS
ALTER TABLE plan_pagos_prestamo ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuarios ven el plan de pagos de préstamos de sus natilleras
CREATE POLICY "Usuarios ven plan de pagos de sus préstamos" ON plan_pagos_prestamo
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = plan_pagos_prestamo.prestamo_id
            AND (n.admin_id = auth.uid() OR public.es_superusuario())
        )
    );

-- Política INSERT: Usuarios pueden crear planes de pago para préstamos de sus natilleras
CREATE POLICY "Usuarios crean plan de pagos de sus préstamos" ON plan_pagos_prestamo
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = plan_pagos_prestamo.prestamo_id
            AND (n.admin_id = auth.uid() OR public.es_superusuario())
        )
    );

-- Política UPDATE: Usuarios pueden actualizar planes de pago de sus préstamos
CREATE POLICY "Usuarios actualizan plan de pagos de sus préstamos" ON plan_pagos_prestamo
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = plan_pagos_prestamo.prestamo_id
            AND (n.admin_id = auth.uid() OR public.es_superusuario())
        )
    );

-- Política DELETE: Usuarios pueden eliminar planes de pago de sus préstamos
CREATE POLICY "Usuarios eliminan plan de pagos de sus préstamos" ON plan_pagos_prestamo
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE p.id = plan_pagos_prestamo.prestamo_id
            AND (n.admin_id = auth.uid() OR public.es_superusuario())
        )
    );


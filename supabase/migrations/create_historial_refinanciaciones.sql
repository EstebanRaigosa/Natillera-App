-- ============================================
-- TABLA: historial_refinanciaciones
-- Historial de refinanciaciones de préstamos
-- ============================================
CREATE TABLE IF NOT EXISTS historial_refinanciaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prestamo_id UUID REFERENCES prestamos(id) ON DELETE CASCADE,
    -- Valores anteriores del préstamo
    monto_anterior DECIMAL(12,2) NOT NULL,
    interes_anterior DECIMAL(5,2) NOT NULL,
    numero_cuotas_anterior INTEGER,
    tipo_interes_anterior VARCHAR(20),
    periodicidad_anterior VARCHAR(20),
    fecha_inicio_anterior DATE,
    saldo_actual_anterior DECIMAL(12,2) NOT NULL,
    interes_total_anterior DECIMAL(12,2),
    interes_anticipado_anterior BOOLEAN DEFAULT FALSE,
    -- Valores nuevos del préstamo
    monto_nuevo DECIMAL(12,2) NOT NULL,
    interes_nuevo DECIMAL(5,2) NOT NULL,
    numero_cuotas_nuevo INTEGER NOT NULL,
    tipo_interes_nuevo VARCHAR(20) NOT NULL,
    periodicidad_nueva VARCHAR(20),
    fecha_inicio_nueva DATE NOT NULL,
    saldo_actual_nuevo DECIMAL(12,2) NOT NULL,
    -- Información adicional
    fecha_refinanciacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_historial_refinanciaciones_prestamo ON historial_refinanciaciones(prestamo_id);
CREATE INDEX IF NOT EXISTS idx_historial_refinanciaciones_fecha ON historial_refinanciaciones(fecha_refinanciacion);

-- Comentarios
COMMENT ON TABLE historial_refinanciaciones IS 'Historial de refinanciaciones de préstamos, guarda los valores anteriores y nuevos';
COMMENT ON COLUMN historial_refinanciaciones.prestamo_id IS 'ID del préstamo que fue refinanciado';
COMMENT ON COLUMN historial_refinanciaciones.monto_anterior IS 'Monto original del préstamo antes de la refinanciación';
COMMENT ON COLUMN historial_refinanciaciones.monto_nuevo IS 'Nuevo monto del préstamo después de la refinanciación (generalmente igual al saldo actual anterior)';
COMMENT ON COLUMN historial_refinanciaciones.fecha_refinanciacion IS 'Fecha y hora en que se realizó la refinanciación';

-- RLS Policies
ALTER TABLE historial_refinanciaciones ENABLE ROW LEVEL SECURITY;

-- Política para ver historial de refinanciaciones
CREATE POLICY "Ver historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones
    FOR SELECT USING (
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Política para insertar historial de refinanciaciones
CREATE POLICY "Insertar historial de refinanciaciones de mis natilleras" ON historial_refinanciaciones
    FOR INSERT WITH CHECK (
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

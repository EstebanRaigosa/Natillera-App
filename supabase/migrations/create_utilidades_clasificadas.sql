-- ============================================
-- Crear tabla utilidades_clasificadas
-- Esta tabla almacena las utilidades clasificadas
-- por tipo (préstamos, rifas, sanciones, etc.) y natillera
-- ============================================

CREATE TABLE IF NOT EXISTS utilidades_clasificadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    natillera_id UUID REFERENCES natilleras(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('prestamos', 'rifas', 'bingo', 'venta', 'evento', 'otro', 'sanciones')),
    monto DECIMAL(12,2) NOT NULL DEFAULT 0,
    fecha_cierre DATE,
    descripcion TEXT,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(natillera_id, tipo, fecha_cierre)
);

-- Comentario sobre la tabla
COMMENT ON TABLE utilidades_clasificadas IS 'Almacena las utilidades clasificadas por tipo y natillera. Se crea un registro por cada tipo de utilidad al momento del cierre de la natillera.';

-- Comentario sobre las columnas
COMMENT ON COLUMN utilidades_clasificadas.tipo IS 'Tipo de utilidad: prestamos (intereses de préstamos), rifas, bingo, venta, evento, otro (otras actividades), sanciones (multas pagadas)';
COMMENT ON COLUMN utilidades_clasificadas.monto IS 'Monto total de utilidades para este tipo';
COMMENT ON COLUMN utilidades_clasificadas.fecha_cierre IS 'Fecha en que se cerró/utilizó la natillera (opcional, puede ser NULL si se usa antes del cierre)';
COMMENT ON COLUMN utilidades_clasificadas.detalles IS 'Detalles adicionales en formato JSON. Para actividades puede contener lista de actividades_ids, para préstamos puede contener lista de préstamos_ids, etc.';

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_utilidades_clasificadas_natillera ON utilidades_clasificadas(natillera_id);
CREATE INDEX IF NOT EXISTS idx_utilidades_clasificadas_tipo ON utilidades_clasificadas(tipo);
CREATE INDEX IF NOT EXISTS idx_utilidades_clasificadas_fecha_cierre ON utilidades_clasificadas(fecha_cierre);

-- Habilitar RLS
ALTER TABLE utilidades_clasificadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Ver utilidades de mis natilleras (incluye superusuario)
CREATE POLICY "Ver utilidades clasificadas de mis natilleras" ON utilidades_clasificadas
    FOR SELECT USING (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- Crear/utilizar utilidades clasificadas en mis natilleras (incluye superusuario)
CREATE POLICY "Crear utilidades clasificadas en mis natilleras" ON utilidades_clasificadas
    FOR INSERT WITH CHECK (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- Actualizar utilidades clasificadas de mis natilleras (incluye superusuario)
CREATE POLICY "Actualizar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas
    FOR UPDATE USING (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    )
    WITH CHECK (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- Eliminar utilidades clasificadas de mis natilleras (incluye superusuario)
CREATE POLICY "Eliminar utilidades clasificadas de mis natilleras" ON utilidades_clasificadas
    FOR DELETE USING (
        public.es_superusuario() OR
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

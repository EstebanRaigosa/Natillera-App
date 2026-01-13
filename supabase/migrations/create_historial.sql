-- ============================================
-- Crear tabla historial si no existe
-- ============================================

CREATE TABLE IF NOT EXISTS historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    natillera_id UUID REFERENCES natilleras(id) ON DELETE CASCADE,
    accion VARCHAR(255) NOT NULL,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_natillera ON historial(natillera_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_created ON historial(created_at DESC);

-- Habilitar RLS
ALTER TABLE historial ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
DROP POLICY IF EXISTS "Ver historial de mis natilleras" ON historial;
CREATE POLICY "Ver historial de mis natilleras" ON historial
    FOR SELECT USING (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

DROP POLICY IF EXISTS "Registrar historial" ON historial;
CREATE POLICY "Registrar historial" ON historial
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);









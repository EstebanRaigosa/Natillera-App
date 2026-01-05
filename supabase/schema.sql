-- ============================================
-- ESQUEMA DE BASE DE DATOS PARA NATILLERA
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: socios
-- Datos personales de los participantes
-- ============================================
CREATE TABLE IF NOT EXISTS socios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: natilleras
-- Información de cada natillera
-- ============================================
CREATE TABLE IF NOT EXISTS natilleras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_cierre DATE,
    periodicidad VARCHAR(20) NOT NULL CHECK (periodicidad IN ('semanal', 'quincenal', 'mensual')),
    mes_inicio INTEGER DEFAULT 1 CHECK (mes_inicio >= 1 AND mes_inicio <= 12),
    mes_fin INTEGER DEFAULT 11 CHECK (mes_fin >= 1 AND mes_fin <= 12),
    anio INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    reglas_multas JSONB DEFAULT '{"activa": false}',
    reglas_interes JSONB DEFAULT '{"activo": false}',
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'pausada')),
    avatar_seed VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: socios_natillera
-- Relación entre socios y natilleras (con cuota individual)
-- ============================================
CREATE TABLE IF NOT EXISTS socios_natillera (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    natillera_id UUID REFERENCES natilleras(id) ON DELETE CASCADE,
    socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
    valor_cuota_individual DECIMAL(12,2) NOT NULL,
    cantidad_cuotas INTEGER DEFAULT 1,
    periodicidad VARCHAR(20) DEFAULT 'mensual' CHECK (periodicidad IN ('mensual', 'quincenal')),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    rol VARCHAR(20) DEFAULT 'socio' CHECK (rol IN ('administrador', 'socio')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(natillera_id, socio_id)
);

-- ============================================
-- TABLA: cuotas
-- Cuotas generadas para cada socio
-- ============================================
CREATE TABLE IF NOT EXISTS cuotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    socio_natillera_id UUID REFERENCES socios_natillera(id) ON DELETE CASCADE,
    valor_cuota DECIMAL(12,2) NOT NULL,
    valor_pagado DECIMAL(12,2) DEFAULT 0,
    fecha_limite DATE NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    mes INTEGER CHECK (mes >= 1 AND mes <= 12),
    anio INTEGER,
    quincena INTEGER CHECK (quincena IS NULL OR quincena IN (1, 2)),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'parcial', 'mora')),
    descripcion VARCHAR(255),
    comprobante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: prestamos
-- Préstamos internos del fondo
-- ============================================
CREATE TABLE IF NOT EXISTS prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    socio_natillera_id UUID REFERENCES socios_natillera(id) ON DELETE CASCADE,
    monto DECIMAL(12,2) NOT NULL,
    interes DECIMAL(5,2) NOT NULL DEFAULT 0,
    saldo_actual DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('pendiente', 'activo', 'pagado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: pagos_prestamo
-- Abonos a préstamos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos_prestamo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prestamo_id UUID REFERENCES prestamos(id) ON DELETE CASCADE,
    valor DECIMAL(12,2) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: multas
-- Multas aplicadas a socios
-- ============================================
CREATE TABLE IF NOT EXISTS multas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    socio_natillera_id UUID REFERENCES socios_natillera(id) ON DELETE CASCADE,
    valor DECIMAL(12,2) NOT NULL,
    motivo TEXT NOT NULL,
    pagada BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: actividades
-- Rifas, eventos y otras actividades
-- ============================================
CREATE TABLE IF NOT EXISTS actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    natillera_id UUID REFERENCES natilleras(id) ON DELETE CASCADE,
    tipo VARCHAR(50) DEFAULT 'otro',
    descripcion TEXT NOT NULL,
    ingresos DECIMAL(12,2) DEFAULT 0,
    gastos DECIMAL(12,2) DEFAULT 0,
    utilidad DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: historial
-- Auditoría de acciones
-- ============================================
CREATE TABLE IF NOT EXISTS historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    natillera_id UUID REFERENCES natilleras(id) ON DELETE CASCADE,
    accion VARCHAR(255) NOT NULL,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_natilleras_admin ON natilleras(admin_id);
CREATE INDEX IF NOT EXISTS idx_socios_natillera_natillera ON socios_natillera(natillera_id);
CREATE INDEX IF NOT EXISTS idx_socios_natillera_socio ON socios_natillera(socio_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_socio_natillera ON cuotas(socio_natillera_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado ON cuotas(estado);
CREATE INDEX IF NOT EXISTS idx_prestamos_socio_natillera ON prestamos(socio_natillera_id);
CREATE INDEX IF NOT EXISTS idx_actividades_natillera ON actividades(natillera_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE natilleras ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios_natillera ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_prestamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE multas ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial ENABLE ROW LEVEL SECURITY;

-- Políticas para natilleras
CREATE POLICY "Usuarios pueden ver sus natilleras" ON natilleras
    FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Usuarios pueden crear natilleras" ON natilleras
    FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Admins pueden actualizar sus natilleras" ON natilleras
    FOR UPDATE USING (admin_id = auth.uid());

-- Políticas para socios (acceso público para lectura, escribir solo autenticados)
CREATE POLICY "Lectura pública de socios" ON socios
    FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear socios" ON socios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar socios" ON socios
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para socios_natillera
CREATE POLICY "Ver socios de mis natilleras" ON socios_natillera
    FOR SELECT USING (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

CREATE POLICY "Agregar socios a mis natilleras" ON socios_natillera
    FOR INSERT WITH CHECK (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

CREATE POLICY "Actualizar socios de mis natilleras" ON socios_natillera
    FOR UPDATE USING (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- Políticas para cuotas
CREATE POLICY "Ver cuotas de mis natilleras" ON cuotas
    FOR SELECT USING (
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

CREATE POLICY "Gestionar cuotas de mis natilleras" ON cuotas
    FOR ALL USING (
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Políticas para préstamos
CREATE POLICY "Ver préstamos de mis natilleras" ON prestamos
    FOR SELECT USING (
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

CREATE POLICY "Gestionar préstamos de mis natilleras" ON prestamos
    FOR ALL USING (
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Políticas para pagos de préstamos
CREATE POLICY "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR SELECT USING (
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

CREATE POLICY "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR INSERT WITH CHECK (
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

CREATE POLICY "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR UPDATE USING (
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

CREATE POLICY "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR DELETE USING (
        prestamo_id IN (
            SELECT p.id FROM prestamos p
            JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Políticas para multas
CREATE POLICY "Ver multas de mis natilleras" ON multas
    FOR ALL USING (
        socio_natillera_id IN (
            SELECT sn.id FROM socios_natillera sn
            JOIN natilleras n ON sn.natillera_id = n.id
            WHERE n.admin_id = auth.uid()
        )
    );

-- Políticas para actividades
CREATE POLICY "Ver actividades de mis natilleras" ON actividades
    FOR SELECT USING (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

CREATE POLICY "Gestionar actividades de mis natilleras" ON actividades
    FOR ALL USING (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

-- Políticas para historial
CREATE POLICY "Ver historial de mis natilleras" ON historial
    FOR SELECT USING (
        natillera_id IN (SELECT id FROM natilleras WHERE admin_id = auth.uid())
    );

CREATE POLICY "Registrar historial" ON historial
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_natilleras_updated_at BEFORE UPDATE ON natilleras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_socios_updated_at BEFORE UPDATE ON socios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_socios_natillera_updated_at BEFORE UPDATE ON socios_natillera
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cuotas_updated_at BEFORE UPDATE ON cuotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestamos_updated_at BEFORE UPDATE ON prestamos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actividades_updated_at BEFORE UPDATE ON actividades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================


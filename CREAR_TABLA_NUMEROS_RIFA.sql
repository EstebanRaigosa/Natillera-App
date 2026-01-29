-- ============================================
-- CREAR TABLA PARA NÚMEROS DE RIFA
-- ============================================
-- Esta tabla almacena los números vendidos y pagados de las rifas manuales

CREATE TABLE IF NOT EXISTS numeros_rifa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  numero VARCHAR(2) NOT NULL, -- Número del 00 al 99
  estado VARCHAR(20) NOT NULL DEFAULT 'libre', -- 'libre', 'vendido', 'pagado'
  nombre_comprador VARCHAR(255),
  telefono_comprador VARCHAR(50),
  socio_vendedor_id UUID REFERENCES socios_natillera(id) ON DELETE SET NULL,
  valor DECIMAL(12, 2) NOT NULL DEFAULT 0,
  fecha_venta TIMESTAMP,
  fecha_pago TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Restricción única: un número solo puede estar una vez por actividad
  UNIQUE(actividad_id, numero)
);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_numeros_rifa_actividad ON numeros_rifa(actividad_id);
CREATE INDEX IF NOT EXISTS idx_numeros_rifa_estado ON numeros_rifa(estado);
CREATE INDEX IF NOT EXISTS idx_numeros_rifa_socio_vendedor ON numeros_rifa(socio_vendedor_id);

-- Comentarios para documentación
COMMENT ON TABLE numeros_rifa IS 'Almacena los números vendidos y pagados de rifas manuales';
COMMENT ON COLUMN numeros_rifa.numero IS 'Número de la rifa del 00 al 99';
COMMENT ON COLUMN numeros_rifa.estado IS 'Estado del número: libre, vendido o pagado';
COMMENT ON COLUMN numeros_rifa.socio_vendedor_id IS 'Socio que vendió el número';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_numeros_rifa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_numeros_rifa_updated_at
  BEFORE UPDATE ON numeros_rifa
  FOR EACH ROW
  EXECUTE FUNCTION update_numeros_rifa_updated_at();

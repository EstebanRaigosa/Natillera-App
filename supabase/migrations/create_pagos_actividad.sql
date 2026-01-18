-- Crear tabla pagos_actividad para registrar pagos individuales de socios a actividades
CREATE TABLE IF NOT EXISTS pagos_actividad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  socio_natillera_id UUID NOT NULL REFERENCES socios_natillera(id) ON DELETE CASCADE,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  mostrar_en_comprobante_cuota BOOLEAN DEFAULT false,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(actividad_id, socio_natillera_id) -- Un socio solo puede pagar una vez por actividad
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pagos_actividad_actividad_id ON pagos_actividad(actividad_id);
CREATE INDEX IF NOT EXISTS idx_pagos_actividad_socio_natillera_id ON pagos_actividad(socio_natillera_id);
CREATE INDEX IF NOT EXISTS idx_pagos_actividad_mostrar_comprobante ON pagos_actividad(mostrar_en_comprobante_cuota) WHERE mostrar_en_comprobante_cuota = true;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_pagos_actividad_updated_at 
  BEFORE UPDATE ON pagos_actividad 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Asegurarse de que la función es_superusuario existe (por si acaso no está creada)
CREATE OR REPLACE FUNCTION public.es_superusuario()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    RETURN LOWER(TRIM(COALESCE(user_email, ''))) = 'raigo.16@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Habilitar RLS
ALTER TABLE pagos_actividad ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver pagos de actividades de sus natilleras
CREATE POLICY "Users can view pagos_actividad of their natilleras"
  ON pagos_actividad
  FOR SELECT
  USING (
    public.es_superusuario() OR EXISTS (
      SELECT 1 FROM socios_natillera sn
      JOIN natilleras n ON n.id = sn.natillera_id
      WHERE sn.id = pagos_actividad.socio_natillera_id
      AND (n.admin_id = auth.uid() OR EXISTS (
        SELECT 1 FROM natillera_colaboradores nc
        WHERE nc.natillera_id = n.id
        AND nc.usuario_id = auth.uid()
        AND nc.estado = 'aceptada'
      ))
    )
  );

-- Política: Los usuarios pueden insertar pagos de actividades en sus natilleras
CREATE POLICY "Users can insert pagos_actividad in their natilleras"
  ON pagos_actividad
  FOR INSERT
  WITH CHECK (
    public.es_superusuario() OR EXISTS (
      SELECT 1 FROM socios_natillera sn
      JOIN natilleras n ON n.id = sn.natillera_id
      WHERE sn.id = pagos_actividad.socio_natillera_id
      AND (n.admin_id = auth.uid() OR EXISTS (
        SELECT 1 FROM natillera_colaboradores nc
        WHERE nc.natillera_id = n.id
        AND nc.usuario_id = auth.uid()
        AND nc.estado = 'aceptada'
      ))
    )
  );

-- Política: Los usuarios pueden actualizar pagos de actividades de sus natilleras
CREATE POLICY "Users can update pagos_actividad of their natilleras"
  ON pagos_actividad
  FOR UPDATE
  USING (
    public.es_superusuario() OR EXISTS (
      SELECT 1 FROM socios_natillera sn
      JOIN natilleras n ON n.id = sn.natillera_id
      WHERE sn.id = pagos_actividad.socio_natillera_id
      AND (n.admin_id = auth.uid() OR EXISTS (
        SELECT 1 FROM natillera_colaboradores nc
        WHERE nc.natillera_id = n.id
        AND nc.usuario_id = auth.uid()
        AND nc.estado = 'aceptada'
      ))
    )
  )
  WITH CHECK (
    public.es_superusuario() OR EXISTS (
      SELECT 1 FROM socios_natillera sn
      JOIN natilleras n ON n.id = sn.natillera_id
      WHERE sn.id = pagos_actividad.socio_natillera_id
      AND (n.admin_id = auth.uid() OR EXISTS (
        SELECT 1 FROM natillera_colaboradores nc
        WHERE nc.natillera_id = n.id
        AND nc.usuario_id = auth.uid()
        AND nc.estado = 'aceptada'
      ))
    )
  );

-- Política: Los usuarios pueden eliminar pagos de actividades de sus natilleras
CREATE POLICY "Users can delete pagos_actividad of their natilleras"
  ON pagos_actividad
  FOR DELETE
  USING (
    public.es_superusuario() OR EXISTS (
      SELECT 1 FROM socios_natillera sn
      JOIN natilleras n ON n.id = sn.natillera_id
      WHERE sn.id = pagos_actividad.socio_natillera_id
      AND (n.admin_id = auth.uid() OR EXISTS (
        SELECT 1 FROM natillera_colaboradores nc
        WHERE nc.natillera_id = n.id
        AND nc.usuario_id = auth.uid()
        AND nc.estado = 'aceptada'
      ))
    )
  );

-- Comentarios
COMMENT ON TABLE pagos_actividad IS 'Registra pagos individuales de socios a actividades';
COMMENT ON COLUMN pagos_actividad.actividad_id IS 'Referencia a la actividad';
COMMENT ON COLUMN pagos_actividad.socio_natillera_id IS 'Referencia al socio en la natillera';
COMMENT ON COLUMN pagos_actividad.valor IS 'Valor del pago realizado';
COMMENT ON COLUMN pagos_actividad.mostrar_en_comprobante_cuota IS 'Si este pago debe mostrarse en el comprobante de pago de cuota';

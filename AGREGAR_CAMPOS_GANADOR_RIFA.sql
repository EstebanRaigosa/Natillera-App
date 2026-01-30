-- Campos para guardar el número ganador y el ganador al liquidar una rifa
-- Se usan al mostrar el modal "Ganador" al entrar a una rifa liquidada

ALTER TABLE actividades
  ADD COLUMN IF NOT EXISTS numero_ganador VARCHAR(2),
  ADD COLUMN IF NOT EXISTS ganador_nombre VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ganador_socio_natillera_id UUID REFERENCES socios_natillera(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ganador_es_faltante BOOLEAN DEFAULT false;

COMMENT ON COLUMN actividades.numero_ganador IS 'Número ganador de la rifa (00-99). Solo para tipo=rifa y estado=liquidada.';
COMMENT ON COLUMN actividades.ganador_nombre IS 'Nombre del ganador (socio o comprador). Solo para rifas liquidadas. "Natillera" cuando ganador_es_faltante.';
COMMENT ON COLUMN actividades.ganador_socio_natillera_id IS 'ID del socio ganador en socios_natillera, si el ganador es socio. NULL si es Faltante/externo.';
COMMENT ON COLUMN actividades.ganador_es_faltante IS 'True si el número ganador estaba asignado a un Faltante (no a un socio): el premio + utilidad pasan a la natillera.';

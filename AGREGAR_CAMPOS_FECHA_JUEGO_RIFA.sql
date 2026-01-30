-- ============================================
-- FECHA DE JUEGO PARA RIFAS
-- ============================================
-- Permite definir cuándo se jugará la rifa: por preset (primera quincena,
-- segunda quincena, viernes después de 1ª/2ª quincena) o fecha específica por mes.

ALTER TABLE actividades
  ADD COLUMN IF NOT EXISTS cuando_juego_rifa VARCHAR(50),
  ADD COLUMN IF NOT EXISTS fecha_juego_rifa DATE;

COMMENT ON COLUMN actividades.cuando_juego_rifa IS 'Preset de cuándo se juega la rifa: primera_quincena, segunda_quincena, viernes_despues_primera, viernes_despues_segunda, fecha_especifica. Solo tipo=rifa.';
COMMENT ON COLUMN actividades.fecha_juego_rifa IS 'Fecha en que se juega la rifa. Si cuando_juego_rifa=fecha_especifica es la fecha elegida; si es preset se puede calcular a partir de mes_pago/anio_pago.';

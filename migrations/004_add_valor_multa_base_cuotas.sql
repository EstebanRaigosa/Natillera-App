-- Migración: Guardar sanción base e intereses por día por separado
-- valor_multa_base: sanción por cuota en mora, se guarda UNA sola vez, NUNCA se recalcula.
-- valor_multa_intereses: intereses por días extras, se recalcula y actualiza cada vez.
-- valor_multa: total = valor_multa_base + valor_multa_intereses (para compatibilidad y pagos).

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_multa_base DECIMAL(12,2) DEFAULT NULL;

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS valor_multa_intereses DECIMAL(12,2) DEFAULT NULL;

COMMENT ON COLUMN cuotas.valor_multa_base IS 'Sanción base por cuota en mora. Se guarda una sola vez, NUNCA se recalcula.';
COMMENT ON COLUMN cuotas.valor_multa_intereses IS 'Intereses por días extras (se recalcula). valor_multa = valor_multa_base + valor_multa_intereses.';

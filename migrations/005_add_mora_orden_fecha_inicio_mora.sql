-- Migración: Modelo de sanciones por racha (enfoque por racha)
-- mora_orden: orden en que la cuota entró en mora dentro de la racha. Se asigna UNA sola vez, NUNCA se recalcula.
-- fecha_inicio_mora: fecha desde la cual la cuota se considera en mora (para cálculo de sanción por días).
-- valor_multa_base: snapshot de la sanción escalonada (1.000, 2.000, 4.000, 8.000) según mora_orden.
-- El escalón solo se reinicia cuando el socio queda con cero cuotas en mora (racha cerrada).

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS mora_orden INT DEFAULT NULL;

ALTER TABLE cuotas
ADD COLUMN IF NOT EXISTS fecha_inicio_mora DATE DEFAULT NULL;

COMMENT ON COLUMN cuotas.mora_orden IS 'Orden en que la cuota entró en mora dentro de la racha. Se asigna una sola vez, NUNCA se recalcula. Racha se reinicia cuando el socio queda al día.';
COMMENT ON COLUMN cuotas.fecha_inicio_mora IS 'Fecha desde la cual la cuota está en mora. Usada para calcular sanción por días (FLOOR(días/2)*valor).';

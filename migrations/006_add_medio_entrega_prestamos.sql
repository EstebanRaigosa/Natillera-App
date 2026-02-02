-- Medio por el cual se entregó el préstamo al socio: efectivo o transferencia.
-- Se registra al momento de crear/entregar el préstamo.

ALTER TABLE prestamos
ADD COLUMN IF NOT EXISTS medio_entrega TEXT DEFAULT NULL;

COMMENT ON COLUMN prestamos.medio_entrega IS 'Medio por el cual se entregó el préstamo al socio: efectivo, transferencia.';

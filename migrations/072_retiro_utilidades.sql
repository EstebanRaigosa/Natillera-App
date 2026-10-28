-- ============================================================================
-- 072 — Utilidades al retirar un socio
--
-- Al socio que se retira se le devuelve lo que ahorró. Algunas natilleras le
-- reconocen además su parte de las utilidades; la modal de retiro lo ofrece
-- como opción. Esa parte sale en su propio movimiento (`origen_egreso =
-- 'utilidades'`) y el comprobante guarda cuánto fue, para mostrarlo y para que
-- la reactivación sepa devolverlo al bolsillo de utilidades.
--
-- `valor_entregar` incluye las utilidades; `valor_utilidades` dice cuánto de
-- ese valor lo fueron. 0 en los retiros de antes y en los que no las suman.
--
-- La natillera puede configurar que la sanción por retiro se cobre también
-- sobre las utilidades (`reglas_multas.sanciones.devolucion`). Esa parte no sale
-- del bolsillo de utilidades: `valor_sancion_utilidades` la guarda para que la
-- reactivación devuelva solo lo que de verdad salió.
-- ============================================================================

ALTER TABLE public.comprobantes_salida
  ADD COLUMN IF NOT EXISTS valor_utilidades numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.comprobantes_salida.valor_utilidades IS
  'Utilidades entregadas al socio en el retiro (incluidas en valor_entregar). 0 si no se sumaron.';

ALTER TABLE public.comprobantes_salida
  ADD COLUMN IF NOT EXISTS valor_sancion_utilidades numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.comprobantes_salida.valor_sancion_utilidades IS
  'Parte de valor_sancion cobrada sobre las utilidades (se quedó en el bolsillo de utilidades). 0 si la sanción fue solo sobre el ahorro.';

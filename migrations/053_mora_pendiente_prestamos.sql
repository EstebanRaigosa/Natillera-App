-- Interés de mora de préstamos que queda pendiente.
--
-- La mora de un préstamo no se guardaba: se calculaba al vuelo sobre las cuotas vencidas
-- que siguen sin pagar. Y el abono la cobraba SIEMPRE primero: si el socio pagaba solo el
-- valor de la cuota, parte de ese dinero se iba a mora y la cuota quedaba incompleta con
-- una cifra rara (p. ej. $136.827 de $137.500).
--
-- Ahora el abono puede no cobrar la mora. Todo el dinero va a las cuotas y la mora que
-- esas cuotas ya habían generado queda guardada aquí como deuda, porque una cuota saldada
-- deja de generar mora y sin guardarla se perdería.
--
--   plan_pagos_prestamo.mora_pendiente  mora de esa cuota que se dejó sin cobrar
--   pagos_prestamo.mora_cobrada         mora cobrada en ese abono (va al fondo de utilidades)
--   pagos_prestamo.mora_movimientos     [{ plan_id, delta }] lo que el abono sumó (+, mora
--                                       dejada pendiente) o restó (−, mora pendiente cobrada)
--                                       a cada cuota; para deshacerlo si se elimina el abono.

alter table public.plan_pagos_prestamo
  add column if not exists mora_pendiente numeric not null default 0;

alter table public.pagos_prestamo
  add column if not exists mora_cobrada numeric not null default 0,
  add column if not exists mora_movimientos jsonb;

comment on column public.plan_pagos_prestamo.mora_pendiente is
  'Interés de mora de esta cuota que se dejó sin cobrar al pagarla. Se suma a la mora del préstamo.';
comment on column public.pagos_prestamo.mora_cobrada is
  'Interés de mora cobrado en este abono (va al fondo de utilidades, no baja el saldo).';
comment on column public.pagos_prestamo.mora_movimientos is
  'Cambios que este abono hizo en plan_pagos_prestamo.mora_pendiente: [{plan_id, delta}]. Se revierten al eliminar el abono.';

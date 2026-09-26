-- Retiro de un socio con préstamo pendiente: lo que se le devuelve puede cruzarse con
-- su deuda. El comprobante de salida guarda cuánto se cruzó y con qué abonos, para que
-- el comprobante lo muestre y para que reactivar al socio pueda deshacer esos abonos.
--
-- detalle_prestamos: [{ prestamo_id, pago_id, abono, mora, forma_pago }]
--   abono  → lo que bajó el saldo del préstamo (fila en pagos_prestamo)
--   mora   → interés de mora cobrado en ese cruce (utilidades_clasificadas, subtipo mora)

alter table public.comprobantes_salida
  add column if not exists valor_prestamo numeric not null default 0,
  add column if not exists detalle_prestamos jsonb not null default '[]'::jsonb;

comment on column public.comprobantes_salida.valor_prestamo is
  'Parte de la liquidación que se cruzó con préstamos pendientes (abono + mora).';
comment on column public.comprobantes_salida.detalle_prestamos is
  'Abonos creados por el cruce: [{prestamo_id, pago_id, abono, mora, forma_pago}]. Se usan para revertir al reactivar.';

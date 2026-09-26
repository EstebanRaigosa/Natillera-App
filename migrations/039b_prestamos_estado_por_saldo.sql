-- El estado de un préstamo sale de su saldo, siempre: con saldo es 'activo', sin saldo
-- 'pagado'. Hasta ahora lo calculaba cada pantalla por su cuenta, y bastó una que miraba
-- el estado anterior (borrar un abono en Préstamos) para dejar un préstamo «pagado»
-- debiendo $235.293. Con el trigger ningún flujo —actual o futuro— puede descuadrarlos.
--
-- Solo toca 'activo' y 'pagado', los dos estados que existen hoy: si algún día hay otro
-- (refinanciado, castigado…) se respeta tal cual.

create or replace function public.prestamos_estado_por_saldo()
returns trigger
language plpgsql
as $$
begin
  if new.estado in ('activo', 'pagado') then
    new.estado := case when coalesce(new.saldo_actual, 0) > 0 then 'activo' else 'pagado' end;
  end if;
  return new;
end;
$$;

drop trigger if exists prestamos_estado_por_saldo on public.prestamos;
create trigger prestamos_estado_por_saldo
  before insert or update of saldo_actual, estado on public.prestamos
  for each row execute function public.prestamos_estado_por_saldo();

-- Dejar cuadrados los que ya existan (el trigger salta con el update).
update public.prestamos
set estado = case when coalesce(saldo_actual, 0) > 0 then 'activo' else 'pagado' end
where estado in ('activo', 'pagado')
  and estado <> case when coalesce(saldo_actual, 0) > 0 then 'activo' else 'pagado' end;

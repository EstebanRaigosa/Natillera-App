-- 1) Aviso push al admin cuando un socio pide usar la app.
--    Mismo mecanismo que soporte (024): trigger → pg_net → Edge Function, con el secreto
--    de Vault `soporte_webhook_secret` (sirve para cualquier aviso, no solo soporte).
--    Solo cuando la solicitud QUEDA pendiente: nueva, o reabierta tras un rechazo. Si
--    alguien repite una solicitud que ya estaba pendiente, no se vuelve a avisar.

create or replace function public.vinculo_avisar_notificador()
returns trigger
language plpgsql security definer
set search_path = public, extensions, net, vault, pg_temp
as $$
declare
  v_secreto text;
begin
  if new.estado <> 'pendiente' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.estado = 'pendiente' then
    return new;
  end if;

  select decrypted_secret into v_secreto
  from vault.decrypted_secrets where name = 'soporte_webhook_secret' limit 1;
  if v_secreto is null then
    raise warning 'vínculo: falta el secreto «soporte_webhook_secret» en Vault; no se envía el aviso';
    return new;
  end if;

  perform net.http_post(
    url     := 'https://vdtjacwpvqfifahkrqxp.supabase.co/functions/v1/vinculo-notificar',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_secreto),
    body    := jsonb_build_object('type', tg_op, 'table', tg_table_name, 'record', to_jsonb(new)),
    timeout_milliseconds := 5000
  );
  return new;
exception when others then
  -- Avisar nunca puede impedir que la solicitud se guarde.
  raise warning 'vínculo: no se pudo encolar el aviso (%)', sqlerrm;
  return new;
end $$;

drop trigger if exists trg_vinculo_avisar_notificador on public.solicitudes_vinculo;
create trigger trg_vinculo_avisar_notificador
  after insert or update of estado on public.solicitudes_vinculo
  for each row execute function public.vinculo_avisar_notificador();

-- 2) Portal: las fechas de la natillera, para que la tarjeta del socio en el inicio
--    muestre Inicio/Fin igual que las demás.
drop function if exists public.portal_mis_natilleras();
create or replace function public.portal_mis_natilleras()
returns table (
  socio_natillera_id uuid,
  natillera_id uuid,
  natillera_nombre text,
  natillera_estado text,
  valor_cuota numeric,
  periodicidad text,
  estado_socio text,
  total_ahorrado numeric,
  cuotas_mora int,
  cuotas_pendientes int,
  fecha_inicio date,
  mes_inicio int,
  mes_fin int,
  anio_inicio int,
  anio int
)
language sql stable security definer set search_path = public as $$
  with mias as (
    select sn.id, sn.natillera_id, sn.valor_cuota_individual, sn.periodicidad, sn.estado,
           n.nombre, n.estado as nat_estado, n.fecha_inicio, n.mes_inicio, n.mes_fin, n.anio_inicio, n.anio,
           coalesce((n.reglas_multas->>'dias_gracia')::int, 3) as dias_gracia
    from socios s
    join socios_natillera sn on sn.socio_id = s.id
    join natilleras n on n.id = sn.natillera_id
    where s.usuario_id = auth.uid()
  )
  select m.id, m.natillera_id, m.nombre::text, m.nat_estado::text, m.valor_cuota_individual,
         coalesce(m.periodicidad, 'mensual')::text, coalesce(m.estado, 'activo')::text,
         coalesce(sum(c.valor_cuota) filter (where c.valor_pagado >= c.valor_cuota), 0),
         count(*) filter (where c.valor_pagado < c.valor_cuota
                            and current_date > coalesce(c.fecha_vencimiento, c.fecha_limite + m.dias_gracia))::int,
         count(*) filter (where c.valor_pagado < c.valor_cuota
                            and current_date >= c.fecha_limite
                            and current_date <= coalesce(c.fecha_vencimiento, c.fecha_limite + m.dias_gracia))::int,
         m.fecha_inicio, m.mes_inicio, m.mes_fin, m.anio_inicio, m.anio
  from mias m
  left join cuotas c on c.socio_natillera_id = m.id
  group by m.id, m.natillera_id, m.nombre, m.nat_estado, m.valor_cuota_individual, m.periodicidad, m.estado,
           m.fecha_inicio, m.mes_inicio, m.mes_fin, m.anio_inicio, m.anio
  order by m.nombre
$$;
revoke all on function public.portal_mis_natilleras() from public, anon;
grant execute on function public.portal_mis_natilleras() to authenticated;

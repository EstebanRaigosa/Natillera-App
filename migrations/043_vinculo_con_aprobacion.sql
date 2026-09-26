-- Vincular socio: celular + aprobación del admin (reemplaza la cédula de la 042).
--
-- La cédula no servía como segundo dato: no es obligatoria y la app la rellena con
-- `AUTO-<marca de tiempo>` (145 de 166 socios), así que el socio no la conoce. El único
-- verificador gratuito que conoce a los socios es el admin: el socio escribe su celular,
-- queda una solicitud pendiente y el admin la aprueba viendo con qué cuenta (nombre y
-- correo) se pidió. Hasta que la apruebe, `socios.usuario_id` sigue vacío y el socio no
-- ve nada.

create table if not exists public.solicitudes_vinculo (
  id uuid primary key default gen_random_uuid(),
  natillera_id uuid not null references public.natilleras(id) on delete cascade,
  socio_id uuid not null references public.socios(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  cuenta_email text,
  cuenta_nombre text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  creado_en timestamptz not null default now(),
  resuelto_en timestamptz,
  resuelto_por uuid references auth.users(id),
  unique (socio_id, usuario_id)
);
create index if not exists solicitudes_vinculo_natillera_idx on public.solicitudes_vinculo (natillera_id, estado);

alter table public.solicitudes_vinculo enable row level security;
drop policy if exists "Ver solicitudes de vínculo" on public.solicitudes_vinculo;
create policy "Ver solicitudes de vínculo" on public.solicitudes_vinculo
  for select using (
    usuario_id = (select auth.uid())
    or tiene_permiso_natillera(natillera_id, 'editar_socios')
  );
-- Escrituras solo por las funciones de abajo (security definer).

drop function if exists public.vincular_socio_por_telefono(text, text, text);

create or replace function public.vincular_socio_por_telefono(p_codigo text, p_telefono text)
returns json language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  nat record;
  tel text := telefono_normalizado(p_telefono);
  soc record;
  fallos int;
  perfil record;
begin
  if uid is null then
    return json_build_object('ok', false, 'motivo', 'sin_sesion');
  end if;

  -- Límite de intentos: que nadie pueda recorrer números para descubrir quién es socio.
  select count(*) into fallos from intentos_vinculo
  where usuario_id = uid and creado_en > now() - interval '1 hour';
  if fallos >= 5 then
    return json_build_object('ok', false, 'motivo', 'demasiados_intentos');
  end if;

  select id, nombre into nat from natilleras where codigo_invitacion = upper(btrim(p_codigo));
  if not found then
    return json_build_object('ok', false, 'motivo', 'codigo_invalido');
  end if;
  if length(tel) < 10 then
    return json_build_object('ok', false, 'motivo', 'telefono_invalido');
  end if;

  select s.id, s.nombre, s.usuario_id into soc
  from socios_natillera sn join socios s on s.id = sn.socio_id
  where sn.natillera_id = nat.id and telefono_normalizado(s.telefono) = tel
  limit 1;
  if not found then
    insert into intentos_vinculo (usuario_id) values (uid);
    return json_build_object('ok', false, 'motivo', 'no_encontrado', 'natillera', nat.nombre, 'intentos_restantes', greatest(0, 4 - fallos));
  end if;

  if soc.usuario_id = uid then
    return json_build_object('ok', true, 'estado', 'aprobada', 'socio', soc.nombre, 'natillera', nat.nombre);
  end if;
  if soc.usuario_id is not null then
    return json_build_object('ok', false, 'motivo', 'vinculado_a_otro', 'natillera', nat.nombre);
  end if;

  select coalesce(p.email, u.email) as email,
         coalesce(nullif(p.nombre, ''), u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name') as nombre
    into perfil
  from auth.users u left join user_profiles p on p.id = u.id
  where u.id = uid;

  insert into solicitudes_vinculo (natillera_id, socio_id, usuario_id, cuenta_email, cuenta_nombre)
  values (nat.id, soc.id, uid, perfil.email, perfil.nombre)
  on conflict (socio_id, usuario_id) do update
    set estado = 'pendiente', creado_en = now(), resuelto_en = null, resuelto_por = null,
        natillera_id = excluded.natillera_id, cuenta_email = excluded.cuenta_email, cuenta_nombre = excluded.cuenta_nombre
    where solicitudes_vinculo.estado <> 'aprobada';
  delete from intentos_vinculo where usuario_id = uid;

  return json_build_object('ok', true, 'estado', 'pendiente', 'socio', soc.nombre, 'natillera', nat.nombre);
end $$;

create or replace function public.resolver_solicitud_vinculo(p_solicitud_id uuid, p_aprobar boolean)
returns json language plpgsql security definer set search_path = public as $$
declare
  sol record;
begin
  select * into sol from solicitudes_vinculo where id = p_solicitud_id;
  if not found then
    return json_build_object('ok', false, 'motivo', 'no_existe');
  end if;
  if not tiene_permiso_natillera(sol.natillera_id, 'editar_socios') then
    raise exception 'Sin permiso para resolver solicitudes en esta natillera';
  end if;
  if sol.estado <> 'pendiente' then
    return json_build_object('ok', false, 'motivo', 'ya_resuelta');
  end if;

  if not p_aprobar then
    update solicitudes_vinculo set estado = 'rechazada', resuelto_en = now(), resuelto_por = auth.uid() where id = sol.id;
    return json_build_object('ok', true, 'estado', 'rechazada');
  end if;

  if exists (select 1 from socios where id = sol.socio_id and usuario_id is not null and usuario_id <> sol.usuario_id) then
    return json_build_object('ok', false, 'motivo', 'vinculado_a_otro');
  end if;

  perform set_config('natillerapp.vinculo', '1', true);
  update socios set usuario_id = sol.usuario_id, vinculado_email = sol.cuenta_email, vinculado_en = now()
  where id = sol.socio_id;
  update solicitudes_vinculo set estado = 'aprobada', resuelto_en = now(), resuelto_por = auth.uid() where id = sol.id;
  -- Si otra cuenta había pedido el mismo socio, queda descartada.
  update solicitudes_vinculo set estado = 'rechazada', resuelto_en = now(), resuelto_por = auth.uid()
  where socio_id = sol.socio_id and id <> sol.id and estado = 'pendiente';
  return json_build_object('ok', true, 'estado', 'aprobada');
end $$;

-- Desvincular también deja rechazada la solicitud aprobada, para que el socio pida de nuevo.
create or replace function public.desvincular_socio(p_socio_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (es_superusuario() or exists (
    select 1 from socios_natillera sn
    where sn.socio_id = p_socio_id and tiene_permiso_natillera(sn.natillera_id, 'editar_socios')
  )) then
    raise exception 'Sin permiso para desvincular este socio';
  end if;
  perform set_config('natillerapp.vinculo', '1', true);
  update socios set usuario_id = null, vinculado_email = null, vinculado_en = null where id = p_socio_id;
  update solicitudes_vinculo set estado = 'rechazada', resuelto_en = now(), resuelto_por = auth.uid()
  where socio_id = p_socio_id and estado = 'aprobada';
end $$;

revoke all on function public.vincular_socio_por_telefono(text, text) from public, anon;
revoke all on function public.resolver_solicitud_vinculo(uuid, boolean) from public, anon;
grant execute on function public.vincular_socio_por_telefono(text, text) to authenticated;
grant execute on function public.resolver_solicitud_vinculo(uuid, boolean) to authenticated;

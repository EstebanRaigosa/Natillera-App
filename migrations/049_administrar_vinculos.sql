-- Administrar los vínculos socio ↔ cuenta de la app.
--
-- 1. La solicitud guarda el celular que escribió la persona: el admin la aprueba viendo
--    nombre, correo y celular de la cuenta, y a qué socio quedaría vinculada.
-- 2. Al aprobar, el admin puede elegir otro socio (el celular coincidió con uno que no era,
--    p. ej. dos socios con el mismo número de un familiar).
-- 3. El admin ve todas las cuentas vinculadas de su natillera y puede pasar una cuenta a
--    otro socio o desvincularla.

alter table public.solicitudes_vinculo add column if not exists cuenta_telefono text;

-- Las solicitudes viejas: el celular escrito es, por construcción, el del socio encontrado.
update public.solicitudes_vinculo sv
set cuenta_telefono = s.telefono
from public.socios s
where s.id = sv.socio_id and sv.cuenta_telefono is null;

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

  insert into solicitudes_vinculo (natillera_id, socio_id, usuario_id, cuenta_email, cuenta_nombre, cuenta_telefono)
  values (nat.id, soc.id, uid, perfil.email, perfil.nombre, tel)
  on conflict (socio_id, usuario_id) do update
    set estado = 'pendiente', creado_en = now(), resuelto_en = null, resuelto_por = null,
        natillera_id = excluded.natillera_id, cuenta_email = excluded.cuenta_email,
        cuenta_nombre = excluded.cuenta_nombre, cuenta_telefono = excluded.cuenta_telefono
    where solicitudes_vinculo.estado <> 'aprobada';
  delete from intentos_vinculo where usuario_id = uid;

  return json_build_object('ok', true, 'estado', 'pendiente', 'socio', soc.nombre, 'natillera', nat.nombre);
end $$;

-- Aprobar con la opción de elegir otro socio de la misma natillera (p_socio_id).
drop function if exists public.resolver_solicitud_vinculo(uuid, boolean);
create or replace function public.resolver_solicitud_vinculo(p_solicitud_id uuid, p_aprobar boolean, p_socio_id uuid default null)
returns json language plpgsql security definer set search_path = public as $$
declare
  sol record;
  destino uuid;
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

  destino := coalesce(p_socio_id, sol.socio_id);
  if destino <> sol.socio_id and not exists (
    select 1 from socios_natillera where socio_id = destino and natillera_id = sol.natillera_id
  ) then
    return json_build_object('ok', false, 'motivo', 'socio_de_otra_natillera');
  end if;
  if exists (select 1 from socios where id = destino and usuario_id is not null and usuario_id <> sol.usuario_id) then
    return json_build_object('ok', false, 'motivo', 'vinculado_a_otro');
  end if;

  -- La solicitud queda apuntando al socio que eligió el admin (sin chocar con la llave única).
  if destino <> sol.socio_id then
    delete from solicitudes_vinculo where socio_id = destino and usuario_id = sol.usuario_id and id <> sol.id;
    update solicitudes_vinculo set socio_id = destino where id = sol.id;
  end if;

  perform set_config('natillerapp.vinculo', '1', true);
  update socios set usuario_id = sol.usuario_id, vinculado_email = sol.cuenta_email, vinculado_en = now()
  where id = destino;
  update solicitudes_vinculo set estado = 'aprobada', resuelto_en = now(), resuelto_por = auth.uid() where id = sol.id;
  -- Si otra cuenta había pedido el mismo socio, queda descartada.
  update solicitudes_vinculo set estado = 'rechazada', resuelto_en = now(), resuelto_por = auth.uid()
  where socio_id = destino and id <> sol.id and estado = 'pendiente';
  return json_build_object('ok', true, 'estado', 'aprobada', 'socio_id', destino);
end $$;

-- Cuentas vinculadas de una natillera, con los datos de la cuenta (nombre, correo, celular).
create or replace function public.cuentas_vinculadas_natillera(p_natillera_id uuid)
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not tiene_permiso_natillera(p_natillera_id, 'editar_socios') then
    raise exception 'Sin permiso para ver las cuentas de esta natillera';
  end if;
  return coalesce((
    select json_agg(json_build_object(
      'socio_id', s.id,
      'socio_natillera_id', x.id,
      'socio_nombre', s.nombre,
      'socio_telefono', s.telefono,
      'socio_estado', coalesce(x.estado, 'activo'),
      'usuario_id', s.usuario_id,
      'cuenta_email', coalesce(s.vinculado_email, p.email, u.email),
      'cuenta_nombre', coalesce(nullif(p.nombre, ''), u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
      'cuenta_telefono', (
        select sv.cuenta_telefono from solicitudes_vinculo sv
        where sv.usuario_id = s.usuario_id and sv.natillera_id = p_natillera_id and sv.estado = 'aprobada'
        order by sv.resuelto_en desc nulls last limit 1
      ),
      'vinculado_en', s.vinculado_en
    ) order by s.nombre)
    from socios_natillera x
    join socios s on s.id = x.socio_id
    left join auth.users u on u.id = s.usuario_id
    left join user_profiles p on p.id = s.usuario_id
    where x.natillera_id = p_natillera_id and s.usuario_id is not null
  ), '[]'::json);
end $$;

-- Pasar la cuenta de un socio a otro de la misma natillera (se vinculó al que no era).
create or replace function public.cambiar_vinculo_socio(p_socio_origen uuid, p_socio_destino uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  origen record;
  nat uuid;
begin
  if p_socio_origen = p_socio_destino then
    return json_build_object('ok', false, 'motivo', 'mismo_socio');
  end if;
  -- Los dos socios deben estar en una natillera que este usuario administra.
  select a.natillera_id into nat
  from socios_natillera a join socios_natillera b on b.natillera_id = a.natillera_id
  where a.socio_id = p_socio_origen and b.socio_id = p_socio_destino
    and tiene_permiso_natillera(a.natillera_id, 'editar_socios')
  limit 1;
  if nat is null then
    raise exception 'Sin permiso para cambiar este vínculo';
  end if;

  select id, usuario_id, vinculado_email into origen from socios where id = p_socio_origen;
  if origen.usuario_id is null then
    return json_build_object('ok', false, 'motivo', 'sin_vinculo');
  end if;
  if exists (select 1 from socios where id = p_socio_destino and usuario_id is not null) then
    return json_build_object('ok', false, 'motivo', 'vinculado_a_otro');
  end if;

  perform set_config('natillerapp.vinculo', '1', true);
  update socios set usuario_id = null, vinculado_email = null, vinculado_en = null where id = p_socio_origen;
  update socios set usuario_id = origen.usuario_id, vinculado_email = origen.vinculado_email, vinculado_en = now()
  where id = p_socio_destino;

  -- La solicitud aprobada acompaña a la cuenta (conserva nombre, correo y celular).
  delete from solicitudes_vinculo where socio_id = p_socio_destino and usuario_id = origen.usuario_id;
  update solicitudes_vinculo set socio_id = p_socio_destino, resuelto_en = now(), resuelto_por = auth.uid()
  where socio_id = p_socio_origen and usuario_id = origen.usuario_id and estado = 'aprobada';

  return json_build_object('ok', true);
end $$;

revoke all on function public.vincular_socio_por_telefono(text, text) from public, anon;
revoke all on function public.resolver_solicitud_vinculo(uuid, boolean, uuid) from public, anon;
revoke all on function public.cuentas_vinculadas_natillera(uuid) from public, anon;
revoke all on function public.cambiar_vinculo_socio(uuid, uuid) from public, anon;
grant execute on function public.vincular_socio_por_telefono(text, text) to authenticated;
grant execute on function public.resolver_solicitud_vinculo(uuid, boolean, uuid) to authenticated;
grant execute on function public.cuentas_vinculadas_natillera(uuid) to authenticated;
grant execute on function public.cambiar_vinculo_socio(uuid, uuid) to authenticated;

-- Vincular socio: además del celular (que en el grupo de WhatsApp ve todo el mundo), los
-- últimos 4 dígitos de la cédula (que nadie más ve). Y un límite de intentos fallidos,
-- para que 4 dígitos no se puedan adivinar a punta de probar.

create table if not exists public.intentos_vinculo (
  usuario_id uuid not null,
  creado_en timestamptz not null default now()
);
create index if not exists intentos_vinculo_usuario_idx on public.intentos_vinculo (usuario_id, creado_en);
-- Sin políticas: solo la función de abajo (security definer) lee y escribe aquí.
alter table public.intentos_vinculo enable row level security;

-- La versión de dos parámetros (solo celular) deja de existir: nadie debe poder saltarse la cédula.
drop function if exists public.vincular_socio_por_telefono(text, text);

create or replace function public.vincular_socio_por_telefono(p_codigo text, p_telefono text, p_cedula4 text)
returns json language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  correo text;
  nat record;
  tel text := telefono_normalizado(p_telefono);
  ced text := regexp_replace(coalesce(p_cedula4, ''), '\D', '', 'g');
  soc record;
  fallos int;
begin
  if uid is null then
    return json_build_object('ok', false, 'motivo', 'sin_sesion');
  end if;

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
  if length(ced) <> 4 then
    return json_build_object('ok', false, 'motivo', 'cedula_invalida');
  end if;

  select s.id, s.nombre, s.usuario_id into soc
  from socios_natillera sn join socios s on s.id = sn.socio_id
  where sn.natillera_id = nat.id
    and telefono_normalizado(s.telefono) = tel
    and right(regexp_replace(coalesce(s.documento, ''), '\D', '', 'g'), 4) = ced
  limit 1;
  if not found then
    -- Mismo mensaje si falla el celular o la cédula: no revela quién es socio.
    insert into intentos_vinculo (usuario_id) values (uid);
    return json_build_object('ok', false, 'motivo', 'no_coincide', 'natillera', nat.nombre, 'intentos_restantes', greatest(0, 4 - fallos));
  end if;
  if soc.usuario_id is not null and soc.usuario_id <> uid then
    return json_build_object('ok', false, 'motivo', 'vinculado_a_otro', 'natillera', nat.nombre);
  end if;

  select email into correo from auth.users where id = uid;
  perform set_config('natillerapp.vinculo', '1', true);
  update socios set usuario_id = uid, vinculado_email = correo, vinculado_en = now() where id = soc.id;
  delete from intentos_vinculo where usuario_id = uid;

  return json_build_object(
    'ok', true,
    'socio', soc.nombre,
    'natillera', nat.nombre,
    'natilleras', (
      select coalesce(json_agg(n.nombre order by n.nombre), '[]'::json)
      from socios_natillera sn join natilleras n on n.id = sn.natillera_id
      where sn.socio_id = soc.id
    )
  );
end $$;

revoke all on function public.vincular_socio_por_telefono(text, text, text) from public, anon;
grant execute on function public.vincular_socio_por_telefono(text, text, text) to authenticated;

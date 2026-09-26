-- Vincular socios con usuarios (base del portal de socios).
--
-- El admin crea los socios, pero ningún socio estaba unido a una cuenta: al iniciar
-- sesión, nadie podía saber de qué natilleras era socio. Ahora cada natillera tiene un
-- código de invitación; el admin comparte UN enlace en el grupo de WhatsApp y cada socio,
-- con su propia cuenta (el mismo inicio de sesión de siempre), escribe su teléfono. Si
-- coincide con un socio de esa natillera, queda vinculado.
--
-- Seguridad: hacen falta el enlace (circula solo dentro del grupo) y el teléfono. Cada
-- socio se vincula una sola vez; el admin ve con qué correo y puede desvincular o cambiar
-- el enlace. El portal del socio será de solo lectura.

alter table public.natilleras
  add column if not exists codigo_invitacion text unique;

alter table public.socios
  add column if not exists usuario_id uuid references auth.users(id) on delete set null,
  add column if not exists vinculado_email text,
  add column if not exists vinculado_en timestamptz;

create index if not exists socios_usuario_id_idx on public.socios(usuario_id);

-- Teléfono comparable: solo dígitos y los últimos 10 (quita +57, espacios, guiones).
create or replace function public.telefono_normalizado(p text)
returns text language sql immutable as $$
  select right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10)
$$;

-- Nadie pone `usuario_id` a mano: el admin puede editar socios (RLS), y sin esto podría
-- vincular un socio a cualquier cuenta. Solo las funciones de abajo lo cambian.
create or replace function public.proteger_vinculo_socio()
returns trigger language plpgsql as $$
begin
  if new.usuario_id is distinct from old.usuario_id
     and coalesce(current_setting('natillerapp.vinculo', true), '') <> '1' then
    raise exception 'El vínculo de un socio solo se cambia con vincular_socio_por_telefono o desvincular_socio';
  end if;
  return new;
end $$;

drop trigger if exists proteger_vinculo_socio on public.socios;
create trigger proteger_vinculo_socio
  before update of usuario_id on public.socios
  for each row execute function public.proteger_vinculo_socio();

-- Código legible (sin 0/O ni 1/I), 8 caracteres.
create or replace function public.nuevo_codigo_invitacion()
returns text language plpgsql as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  codigo text;
begin
  loop
    codigo := '';
    for i in 1..8 loop
      codigo := codigo || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.natilleras where codigo_invitacion = codigo);
  end loop;
  return codigo;
end $$;

-- Admin / co-administrador: obtiene el código (lo crea la primera vez) o lo cambia.
create or replace function public.codigo_invitacion_natillera(p_natillera_id uuid, p_regenerar boolean default false)
returns text language plpgsql security definer set search_path = public as $$
declare
  codigo text;
begin
  if not (es_superusuario() or tiene_permiso_natillera(p_natillera_id, 'editar_socios')) then
    raise exception 'Sin permiso para invitar socios en esta natillera';
  end if;
  select codigo_invitacion into codigo from natilleras where id = p_natillera_id;
  if codigo is null or p_regenerar then
    codigo := nuevo_codigo_invitacion();
    update natilleras set codigo_invitacion = codigo where id = p_natillera_id;
  end if;
  return codigo;
end $$;

-- Pública (también sin sesión): solo el nombre, para saludar en la página del enlace.
create or replace function public.info_invitacion_natillera(p_codigo text)
returns table (natillera_nombre text)
language sql stable security definer set search_path = public as $$
  select n.nombre::text from natilleras n where n.codigo_invitacion = upper(btrim(p_codigo))
$$;

create or replace function public.vincular_socio_por_telefono(p_codigo text, p_telefono text)
returns json language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  correo text;
  nat record;
  tel text := telefono_normalizado(p_telefono);
  soc record;
begin
  if uid is null then
    return json_build_object('ok', false, 'motivo', 'sin_sesion');
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
    return json_build_object('ok', false, 'motivo', 'no_encontrado', 'natillera', nat.nombre);
  end if;
  if soc.usuario_id is not null and soc.usuario_id <> uid then
    return json_build_object('ok', false, 'motivo', 'vinculado_a_otro', 'natillera', nat.nombre);
  end if;

  select email into correo from auth.users where id = uid;
  perform set_config('natillerapp.vinculo', '1', true);
  update socios set usuario_id = uid, vinculado_email = correo, vinculado_en = now() where id = soc.id;

  return json_build_object(
    'ok', true,
    'socio', soc.nombre,
    'natillera', nat.nombre,
    -- El mismo socio puede estar en varias natilleras del mismo admin: quedan todas.
    'natilleras', (
      select coalesce(json_agg(n.nombre order by n.nombre), '[]'::json)
      from socios_natillera sn join natilleras n on n.id = sn.natillera_id
      where sn.socio_id = soc.id
    )
  );
end $$;

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
end $$;

revoke all on function public.codigo_invitacion_natillera(uuid, boolean) from public, anon;
revoke all on function public.vincular_socio_por_telefono(text, text) from public, anon;
revoke all on function public.desvincular_socio(uuid) from public, anon;
grant execute on function public.codigo_invitacion_natillera(uuid, boolean) to authenticated;
grant execute on function public.vincular_socio_por_telefono(text, text) to authenticated;
grant execute on function public.desvincular_socio(uuid) to authenticated;
grant execute on function public.info_invitacion_natillera(text) to anon, authenticated;

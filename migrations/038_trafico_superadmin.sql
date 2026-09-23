-- 038 · Panel de tráfico para el superadministrador
--
-- Responde tres preguntas que hoy la app no sabe contestar:
--   · quién está dentro AHORA,
--   · cuándo entró cada uno y desde qué dispositivo (historial de ingresos),
--   · qué está haciendo (eso ya lo guarda `auditoria`; aquí solo se publica en vivo).
--
-- Decisión de diseño: una fila por SESIÓN, no por latido. El cliente late cada pocos
-- minutos y la función decide si refresca la sesión abierta o abre una nueva. Así el
-- historial no crece sin control y «ingresos» significa entradas de verdad, no pings.

create table if not exists public.accesos_usuario (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  email        text,
  nombre       text,
  inicio       timestamptz not null default now(),
  ultimo_latido timestamptz not null default now(),
  user_agent   text,
  plataforma   text,
  created_at   timestamptz not null default now()
);

comment on table public.accesos_usuario is
  'Una fila por sesión de uso. `ultimo_latido` la mantiene viva; pasado el margen de corte se abre una sesión nueva.';

-- El panel ordena por latido y filtra por usuario: ese es el índice que se usa siempre.
create index if not exists accesos_usuario_latido_idx
  on public.accesos_usuario (ultimo_latido desc);
create index if not exists accesos_usuario_user_idx
  on public.accesos_usuario (user_id, ultimo_latido desc);

alter table public.accesos_usuario enable row level security;

-- Solo el superadministrador lee el tráfico ajeno; cada quien puede ver lo suyo.
drop policy if exists accesos_select on public.accesos_usuario;
create policy accesos_select on public.accesos_usuario
  for select using (
    user_id = (select auth.uid()) or public.es_super_admin()
  );

-- Nadie escribe directo: se pasa por `registrar_latido()`, que controla qué se guarda.
-- Sin políticas de insert/update, RLS las deniega por defecto.

/*
 * Registra actividad del usuario que llama.
 *
 * Si su última sesión sigue viva (latido reciente), solo la refresca. Si no, abre una
 * sesión nueva: eso es un «ingreso» y es lo que alimenta el historial. `SECURITY DEFINER`
 * porque la tabla no admite escrituras directas.
 */
create or replace function public.registrar_latido(
  p_user_agent text default null,
  p_plataforma text default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_corte   interval := interval '10 minutes';
  v_sesion  uuid;
  v_email   text;
  v_nombre  text;
begin
  if v_uid is null then
    return null;
  end if;

  select email into v_email from auth.users where id = v_uid;
  select nombre into v_nombre from public.user_profiles where id = v_uid;

  update public.accesos_usuario
     set ultimo_latido = now()
   where user_id = v_uid
     and ultimo_latido > now() - v_corte
   returning id into v_sesion;

  if v_sesion is null then
    insert into public.accesos_usuario (user_id, email, nombre, user_agent, plataforma)
    values (v_uid, coalesce(v_email, 'desconocido'), v_nombre, left(coalesce(p_user_agent, ''), 400), p_plataforma)
    returning id into v_sesion;
  end if;

  -- `ultimo_acceso` existía en `user_profiles` y nadie lo escribía nunca.
  update public.user_profiles set ultimo_acceso = now() where id = v_uid;

  return v_sesion;
end;
$$;

revoke all on function public.registrar_latido(text, text) from public;
grant execute on function public.registrar_latido(text, text) to authenticated;

-- Realtime: el panel escucha las altas de auditoría y de sesiones para pintar en vivo.
-- RLS sigue mandando, así que solo el superadministrador recibe lo ajeno.
alter publication supabase_realtime add table public.auditoria;
alter publication supabase_realtime add table public.accesos_usuario;

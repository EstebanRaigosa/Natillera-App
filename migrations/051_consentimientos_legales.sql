-- Constancia de la autorización para el tratamiento de datos (Ley 1581 de 2012).
--
-- El Decreto 1377 de 2013 (art. 7, hoy Decreto 1074 de 2015) obliga al responsable a
-- conservar prueba de la autorización del titular. Cada vez que un usuario acepta la
-- Política de Tratamiento de Datos y los Términos, queda una fila: qué versión aceptó,
-- cuándo, desde dónde (registro o aviso al entrar) y con qué navegador.
--
-- Si la política cambia de forma sustancial se sube la versión en el front
-- (src/legal/responsable.js) y a cada usuario se le vuelve a pedir la aceptación.

create table if not exists public.consentimientos_legales (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  version text not null,
  -- 'registro': marcó la casilla al crear la cuenta; 'aviso': aceptó el aviso al entrar.
  origen text not null default 'aviso' check (origen in ('registro', 'aviso')),
  -- Si además administra natilleras, declaró tener la autorización de sus socios.
  declara_autorizacion_socios boolean not null default true,
  user_agent text,
  aceptado_en timestamptz not null default now(),
  unique (usuario_id, version)
);

alter table public.consentimientos_legales enable row level security;

-- Cada quien ve solo sus propias aceptaciones. Nadie las edita ni las borra desde la app:
-- son prueba. Se van solas si se elimina la cuenta (on delete cascade).
drop policy if exists "consentimientos: ver los propios" on public.consentimientos_legales;
create policy "consentimientos: ver los propios" on public.consentimientos_legales
  for select to authenticated using (usuario_id = auth.uid());

-- Registrar la aceptación de la versión vigente. Idempotente: aceptar dos veces la misma
-- versión conserva la primera fecha.
create or replace function public.registrar_consentimiento_legal(
  p_version text,
  p_origen text default 'aviso',
  p_user_agent text default null
)
returns json language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return json_build_object('ok', false, 'motivo', 'sin_sesion');
  end if;
  if coalesce(btrim(p_version), '') = '' then
    return json_build_object('ok', false, 'motivo', 'sin_version');
  end if;
  insert into consentimientos_legales (usuario_id, version, origen, user_agent)
  values (uid, btrim(p_version),
          case when p_origen = 'registro' then 'registro' else 'aviso' end,
          left(p_user_agent, 500))
  on conflict (usuario_id, version) do nothing;
  return json_build_object('ok', true);
end $$;

revoke all on function public.registrar_consentimiento_legal(text, text, text) from public, anon;
grant execute on function public.registrar_consentimiento_legal(text, text, text) to authenticated;

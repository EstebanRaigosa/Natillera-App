-- Preferencia de tema (claro / oscuro / automático) de cada usuario.
--
-- Se guarda también en localStorage para aplicarla al instante, pero aquí es donde
-- sigue al usuario entre dispositivos: al iniciar sesión gana el valor de la base.
-- Ver docs/plan-modo-oscuro.md §3.3.

alter table public.user_profiles
  add column if not exists tema text not null default 'auto';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_tema_valido'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_tema_valido check (tema in ('claro', 'oscuro', 'auto'));
  end if;
end $$;

comment on column public.user_profiles.tema is
  'Tema de la interfaz elegido por el usuario: claro, oscuro o auto (el del sistema).';

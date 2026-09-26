-- Solicitudes de vínculo en tiempo real: cuando un socio pide unirse a la app, al
-- administrador que la tiene abierta le aparece el aviso sin recargar.
--
-- Realtime aplica la política de lectura de la tabla a cada suscriptor ("Ver solicitudes de
-- vínculo": la propia cuenta o quien puede editar socios en esa natillera), así que cada
-- administrador solo recibe las de sus natilleras.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'solicitudes_vinculo'
  ) then
    alter publication supabase_realtime add table public.solicitudes_vinculo;
  end if;
end $$;

-- Solicitudes de vínculo del usuario que aún esperan aprobación, con el nombre de la
-- natillera (el socio todavía no puede leer `natilleras`: no es miembro hasta que lo aprueben).
create or replace function public.portal_mis_solicitudes()
returns table (solicitud_id uuid, natillera_nombre text, creado_en timestamptz)
language sql stable security definer set search_path = public as $$
  select sv.id, n.nombre::text, sv.creado_en
  from solicitudes_vinculo sv join natilleras n on n.id = sv.natillera_id
  where sv.usuario_id = auth.uid() and sv.estado = 'pendiente'
  order by sv.creado_en
$$;
revoke all on function public.portal_mis_solicitudes() from public, anon;
grant execute on function public.portal_mis_solicitudes() to authenticated;

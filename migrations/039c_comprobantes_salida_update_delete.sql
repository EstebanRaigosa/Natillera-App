-- comprobantes_salida solo tenía políticas de INSERT y SELECT. Con RLS, lo que no está
-- permitido no falla: no hace nada. Así:
--   · al reactivar, el DELETE del comprobante no borraba nada y el comprobante viejo
--     seguía ahí;
--   · al volver a retirar al socio, el upsert (que sobre una fila existente es un UPDATE)
--     fallaba, y el detalle de los abonos al préstamo del nuevo retiro no se guardaba;
--   · la siguiente reactivación leía el comprobante viejo y no deshacía esos abonos: el
--     préstamo quedaba pagado con una plata que había vuelto a la caja.
-- Mismo criterio que el INSERT: quien puede editar socios de la natillera.

drop policy if exists comprobantes_salida_update_policy on public.comprobantes_salida;
create policy comprobantes_salida_update_policy on public.comprobantes_salida
  for update
  using (
    exists (
      select 1 from public.socios_natillera sn
      where sn.id = comprobantes_salida.socio_natillera_id
        and (select public.tiene_permiso_natillera(sn.natillera_id, 'editar_socios'))
    )
  )
  with check (
    exists (
      select 1 from public.socios_natillera sn
      where sn.id = comprobantes_salida.socio_natillera_id
        and (select public.tiene_permiso_natillera(sn.natillera_id, 'editar_socios'))
    )
  );

drop policy if exists comprobantes_salida_delete_policy on public.comprobantes_salida;
create policy comprobantes_salida_delete_policy on public.comprobantes_salida
  for delete
  using (
    exists (
      select 1 from public.socios_natillera sn
      where sn.id = comprobantes_salida.socio_natillera_id
        and (select public.tiene_permiso_natillera(sn.natillera_id, 'editar_socios'))
    )
  );

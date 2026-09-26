-- Portal del socio: sus pagos uno a uno, para que pueda descargar el comprobante de cada uno.
--
-- Cada transacción está en historial_pagos_cuota. El código de comprobante es de la cuota:
-- si se pagó en varios abonos, todos comparten ese código (es el mismo comprobante que se
-- va completando). Las cuotas pagadas antes de existir ese historial no tienen filas: se
-- devuelve una con lo que guarda la cuota, para que también tengan su comprobante.

create or replace function public.portal_pagos_socio(p_socio_natillera_id uuid)
returns json
language plpgsql stable security definer set search_path = public as $$
begin
  -- Mismo control que portal_datos_socio: solo el socio vinculado a esa fila.
  if not exists (
    select 1 from socios_natillera x join socios s on s.id = x.socio_id
    where x.id = p_socio_natillera_id and s.usuario_id = auth.uid()
  ) then
    return null;
  end if;

  return coalesce((
    select json_agg(t.pago order by t.fecha desc nulls last)
    from (
      select h.fecha_pago as fecha, json_build_object(
        'id', h.id, 'cuota_id', h.cuota_id, 'fecha_pago', h.fecha_pago, 'forma_pago', h.forma_pago,
        'valor_total', h.valor_total, 'valor_cuota', h.valor_cuota, 'valor_sancion', h.valor_sancion,
        'valor_actividades', h.valor_actividades, 'valor_cuotas_prestamo', h.valor_cuotas_prestamo,
        'impuesto_4x1000', h.impuesto_4x1000, 'detalle_actividades', h.detalle_actividades,
        'detalle_cuotas_prestamo', h.detalle_cuotas_prestamo,
        'mes', coalesce(h.mes, c.mes), 'anio', coalesce(h.anio, c.anio), 'quincena', coalesce(h.quincena, c.quincena),
        'codigo_comprobante', c.codigo_comprobante
      ) as pago
      from historial_pagos_cuota h
      join cuotas c on c.id = h.cuota_id
      where c.socio_natillera_id = p_socio_natillera_id

      union all

      -- Pagos anteriores al historial: una fila armada con la cuota.
      select c.fecha_pago, json_build_object(
        'id', 'cuota-' || c.id, 'cuota_id', c.id, 'fecha_pago', c.fecha_pago,
        'forma_pago', case
          when coalesce(c.valor_pagado_efectivo, 0) > 0 and coalesce(c.valor_pagado_transferencia, 0) > 0 then 'mixto'
          when coalesce(c.valor_pagado_transferencia, 0) > 0 then 'transferencia'
          when coalesce(c.valor_pagado_efectivo, 0) > 0 then 'efectivo'
          else c.tipo_pago end,
        'valor_total', null,
        'valor_cuota', coalesce(nullif(c.valor_pagado_cuota, 0), c.valor_pagado),
        'valor_sancion', c.valor_pagado_sancion, 'valor_actividades', c.valor_pagado_actividades,
        'valor_cuotas_prestamo', 0, 'impuesto_4x1000', c.impuesto_4x1000,
        'detalle_actividades', null, 'detalle_cuotas_prestamo', null,
        'mes', c.mes, 'anio', c.anio, 'quincena', c.quincena,
        'codigo_comprobante', c.codigo_comprobante
      )
      from cuotas c
      where c.socio_natillera_id = p_socio_natillera_id
        and coalesce(c.valor_pagado, 0) > 0
        and not exists (select 1 from historial_pagos_cuota h where h.cuota_id = c.id)
    ) t
  ), '[]'::json);
end $$;

revoke all on function public.portal_pagos_socio(uuid) from public, anon;
grant execute on function public.portal_pagos_socio(uuid) to authenticated;

-- Portal del socio (solo lectura).
--
-- El socio vinculado (socios.usuario_id = su cuenta) no tiene permiso sobre las tablas de
-- la natillera, y no debe tenerlo: vería a los demás socios. Estas dos funciones le
-- entregan SOLO lo suyo, comprobando el vínculo en cada llamada.

-- Sus natilleras, con un resumen para la tarjeta del inicio.
create or replace function public.portal_mis_natilleras()
returns table (
  socio_natillera_id uuid,
  natillera_id uuid,
  natillera_nombre text,
  natillera_estado text,
  valor_cuota numeric,
  periodicidad text,
  estado_socio text,
  total_ahorrado numeric,
  cuotas_mora int,
  cuotas_pendientes int
)
language sql stable security definer set search_path = public as $$
  with mias as (
    select sn.id, sn.natillera_id, sn.valor_cuota_individual, sn.periodicidad, sn.estado,
           n.nombre, n.estado as nat_estado,
           coalesce((n.reglas_multas->>'dias_gracia')::int, 3) as dias_gracia
    from socios s
    join socios_natillera sn on sn.socio_id = s.id
    join natilleras n on n.id = sn.natillera_id
    where s.usuario_id = auth.uid()
  )
  select m.id, m.natillera_id, m.nombre::text, m.nat_estado::text, m.valor_cuota_individual,
         coalesce(m.periodicidad, 'mensual')::text, coalesce(m.estado, 'activo')::text,
         coalesce(sum(c.valor_cuota) filter (where c.valor_pagado >= c.valor_cuota), 0),
         -- Mismo criterio que la app: en mora pasado el vencimiento (límite + gracia).
         count(*) filter (where c.valor_pagado < c.valor_cuota
                            and current_date > coalesce(c.fecha_vencimiento, c.fecha_limite + m.dias_gracia))::int,
         count(*) filter (where c.valor_pagado < c.valor_cuota
                            and current_date >= c.fecha_limite
                            and current_date <= coalesce(c.fecha_vencimiento, c.fecha_limite + m.dias_gracia))::int
  from mias m
  left join cuotas c on c.socio_natillera_id = m.id
  group by m.id, m.natillera_id, m.nombre, m.nat_estado, m.valor_cuota_individual, m.periodicidad, m.estado
  order by m.nombre
$$;

-- Todo lo necesario para su estado de cuenta en una natillera.
create or replace function public.portal_datos_socio(p_socio_natillera_id uuid)
returns json
language plpgsql stable security definer set search_path = public as $$
declare
  -- No se llama `sn`: chocaría con el alias de socios_natillera en las consultas.
  fila record;
begin
  select x.id, x.natillera_id, x.valor_cuota_individual, x.periodicidad, x.estado,
         s.nombre as socio_nombre, s.telefono as socio_telefono
    into fila
  from socios_natillera x join socios s on s.id = x.socio_id
  where x.id = p_socio_natillera_id and s.usuario_id = auth.uid();
  if not found then
    return null;  -- no es suyo (o ya no está vinculado): nada que mostrar
  end if;

  return json_build_object(
    'socio', json_build_object(
      'nombre', fila.socio_nombre,
      'telefono', fila.socio_telefono,
      'valor_cuota', fila.valor_cuota_individual,
      'periodicidad', coalesce(fila.periodicidad, 'mensual'),
      'estado', coalesce(fila.estado, 'activo')
    ),
    'natillera', (
      select json_build_object('id', n.id, 'nombre', n.nombre, 'estado', n.estado,
                               'reglas_multas', n.reglas_multas, 'mes_inicio', n.mes_inicio,
                               'mes_fin', n.mes_fin, 'anio_inicio', n.anio_inicio, 'anio', n.anio)
      from natilleras n where n.id = fila.natillera_id
    ),
    'cuotas', coalesce((
      select json_agg(json_build_object(
        'id', c.id, 'mes', c.mes, 'anio', c.anio, 'quincena', c.quincena,
        'valor_cuota', c.valor_cuota, 'valor_pagado', c.valor_pagado, 'valor_multa', c.valor_multa,
        'fecha_limite', c.fecha_limite, 'fecha_vencimiento', c.fecha_vencimiento,
        'fecha_pago', c.fecha_pago, 'estado', c.estado
      ) order by c.anio, c.mes, c.quincena nulls first)
      from cuotas c where c.socio_natillera_id = fila.id
    ), '[]'::json),
    'actividades', coalesce((
      select json_agg(json_build_object(
        'valor_asignado', sa.valor_asignado, 'valor_pagado', sa.valor_pagado,
        'mes_pago', sa.mes_pago, 'anio_pago', sa.anio_pago, 'quincena_pago', sa.quincena_pago,
        'actividad', json_build_object('descripcion', a.descripcion, 'fecha_limite_pago', a.fecha_limite_pago)
      ))
      from socios_actividad sa join actividades a on a.id = sa.actividad_id
      where sa.socio_natillera_id = fila.id
    ), '[]'::json),
    'prestamos', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'monto', p.monto, 'saldo_actual', p.saldo_actual, 'estado', p.estado,
        'created_at', p.created_at,
        'plan', coalesce((
          select json_agg(json_build_object(
            'numero_cuota', pp.numero_cuota, 'valor_cuota', pp.valor_cuota,
            'valor_pagado', pp.valor_pagado, 'pagada', pp.pagada, 'fecha_proyectada', pp.fecha_proyectada
          ) order by pp.numero_cuota)
          from plan_pagos_prestamo pp where pp.prestamo_id = p.id
        ), '[]'::json)
      ) order by p.created_at desc)
      from prestamos p
      where p.socio_natillera_id = fila.id and p.estado in ('activo', 'pagado')
    ), '[]'::json)
  );
end $$;

revoke all on function public.portal_mis_natilleras() from public, anon;
revoke all on function public.portal_datos_socio(uuid) from public, anon;
grant execute on function public.portal_mis_natilleras() to authenticated;
grant execute on function public.portal_datos_socio(uuid) to authenticated;

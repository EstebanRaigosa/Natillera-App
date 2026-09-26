-- Portal del socio: lo que ve lo decide el admin (Especificaciones/portal-socio, RF-07, RF-09, RF-14).
--
-- 1) natilleras.config_portal_socio
--      mostrar_ganancias   → si cada socio ve su parte estimada de las utilidades y lo que
--                            recibiría al cierre. Por defecto sí: es su propio dinero.
--      nivel_transparencia → qué ve del grupo. 0 (defecto, RN-10): nada. 1: totales anónimos.
--                            2: además, quién está al día (nombre + estado, SIN montos).
--    Nunca se expone teléfono, documento, correo ni saldos de otros socios, en ningún nivel.
--
-- 2) portal_ganancias: foto del reparto de utilidades por socio. La calcula la app del admin
--    con `calcularCierreNatillera` (la misma lógica del cierre, una sola fuente de verdad) y la
--    guarda aquí; el portal la muestra con su fecha. Reescribir ese cálculo en SQL daría una
--    segunda versión que tarde o temprano no cuadraría con el cierre.
--
-- 3) portal_datos_socio: devuelve además el desglose de pagos, préstamos y actividades, y
--    respeta la configuración EN LA BASE (RN-12): si el admin oculta las ganancias, no viajan.

alter table public.natilleras
  add column if not exists config_portal_socio jsonb not null
    default '{"mostrar_ganancias": true, "nivel_transparencia": 0}'::jsonb;

create table if not exists public.portal_ganancias (
  socio_natillera_id uuid primary key references public.socios_natillera(id) on delete cascade,
  natillera_id uuid not null references public.natilleras(id) on delete cascade,
  datos jsonb not null,
  calculado_en timestamptz not null default now()
);
create index if not exists portal_ganancias_natillera_idx on public.portal_ganancias (natillera_id);

alter table public.portal_ganancias enable row level security;
-- Solo quien administra escribe la foto. El socio la recibe por portal_datos_socio, nunca directo.
drop policy if exists "Admin escribe ganancias del portal" on public.portal_ganancias;
create policy "Admin escribe ganancias del portal" on public.portal_ganancias
  for all
  using (tiene_permiso_natillera(natillera_id, 'editar_socios'))
  with check (tiene_permiso_natillera(natillera_id, 'editar_socios'));

create or replace function public.portal_datos_socio(p_socio_natillera_id uuid)
returns json
language plpgsql stable security definer set search_path = public as $$
declare
  -- No se llama `sn`: chocaría con el alias de socios_natillera en las consultas.
  fila record;
  nat record;
  cfg jsonb;
  nivel int;
  dias_gracia int;
begin
  select x.id, x.natillera_id, x.valor_cuota_individual, x.periodicidad, x.estado, x.fecha_ingreso,
         s.nombre as socio_nombre, s.telefono as socio_telefono
    into fila
  from socios_natillera x join socios s on s.id = x.socio_id
  where x.id = p_socio_natillera_id and s.usuario_id = auth.uid();
  if not found then
    return null;  -- no es suyo (o ya no está vinculado): nada que mostrar
  end if;

  select * into nat from natilleras where id = fila.natillera_id;
  cfg := coalesce(nat.config_portal_socio, '{}'::jsonb);
  nivel := coalesce((cfg->>'nivel_transparencia')::int, 0);
  dias_gracia := coalesce((nat.reglas_multas->>'dias_gracia')::int, 3);

  return json_build_object(
    'socio', json_build_object(
      'nombre', fila.socio_nombre,
      'telefono', fila.socio_telefono,
      'valor_cuota', fila.valor_cuota_individual,
      'periodicidad', coalesce(fila.periodicidad, 'mensual'),
      'estado', coalesce(fila.estado, 'activo'),
      'fecha_ingreso', fila.fecha_ingreso
    ),
    'natillera', json_build_object(
      'id', nat.id, 'nombre', nat.nombre, 'estado', nat.estado,
      'reglas_multas', nat.reglas_multas, 'periodicidad', nat.periodicidad,
      'fecha_inicio', nat.fecha_inicio, 'mes_inicio', nat.mes_inicio, 'mes_fin', nat.mes_fin,
      'anio_inicio', nat.anio_inicio, 'anio', nat.anio
    ),
    'config', json_build_object(
      'mostrar_ganancias', coalesce((cfg->>'mostrar_ganancias')::boolean, true),
      'nivel_transparencia', nivel
    ),
    'cuotas', coalesce((
      select json_agg(json_build_object(
        'id', c.id, 'mes', c.mes, 'anio', c.anio, 'quincena', c.quincena,
        'valor_cuota', c.valor_cuota, 'valor_pagado', c.valor_pagado, 'valor_multa', c.valor_multa,
        'fecha_limite', c.fecha_limite, 'fecha_vencimiento', c.fecha_vencimiento,
        'fecha_pago', c.fecha_pago, 'estado', c.estado,
        'valor_pagado_cuota', c.valor_pagado_cuota, 'valor_pagado_sancion', c.valor_pagado_sancion,
        'valor_pagado_actividades', c.valor_pagado_actividades, 'impuesto_4x1000', c.impuesto_4x1000,
        'valor_pagado_efectivo', c.valor_pagado_efectivo, 'valor_pagado_transferencia', c.valor_pagado_transferencia
      ) order by c.anio, c.mes, c.quincena nulls first)
      from cuotas c where c.socio_natillera_id = fila.id
    ), '[]'::json),
    'actividades', coalesce((
      select json_agg(json_build_object(
        'valor_asignado', sa.valor_asignado, 'valor_pagado', sa.valor_pagado,
        'mes_pago', sa.mes_pago, 'anio_pago', sa.anio_pago, 'quincena_pago', sa.quincena_pago,
        'actividad', json_build_object('descripcion', a.descripcion, 'fecha_limite_pago', a.fecha_limite_pago,
                                       'tipo', a.tipo, 'estado', a.estado)
      ))
      from socios_actividad sa join actividades a on a.id = sa.actividad_id
      where sa.socio_natillera_id = fila.id
    ), '[]'::json),
    'prestamos', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'monto', p.monto, 'saldo_actual', p.saldo_actual, 'estado', p.estado,
        'created_at', p.created_at, 'fecha_inicio', p.fecha_inicio, 'interes', p.interes,
        'interes_total', p.interes_total, 'interes_anticipado', p.interes_anticipado,
        'numero_cuotas', p.numero_cuotas,
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
    ), '[]'::json),
    -- Ganancias: solo si el admin las muestra (RF-09). Si están ocultas, no viajan.
    'ganancias', case when coalesce((cfg->>'mostrar_ganancias')::boolean, true) then (
      select json_build_object('datos', pg.datos, 'calculado_en', pg.calculado_en)
      from portal_ganancias pg where pg.socio_natillera_id = fila.id
    ) end,
    -- Grupo según el nivel de transparencia (RF-14). Nivel 0: nada.
    'grupo', case when nivel >= 1 then json_build_object(
      'socios_activos', (select count(*) from socios_natillera where natillera_id = nat.id and coalesce(estado, 'activo') = 'activo'),
      'ahorro_total', (
        select coalesce(sum(c.valor_cuota), 0) from cuotas c
        join socios_natillera x on x.id = c.socio_natillera_id
        where x.natillera_id = nat.id and c.valor_pagado >= c.valor_cuota
      ),
      'prestado_vigente', (
        select coalesce(sum(p.saldo_actual), 0) from prestamos p
        join socios_natillera x on x.id = p.socio_natillera_id
        where x.natillera_id = nat.id and p.estado = 'activo'
      ),
      'utilidades_estimadas', (
        select sum((pg.datos->>'utilidadesTotal')::numeric) from portal_ganancias pg where pg.natillera_id = nat.id
      ),
      -- Nivel 2: nombre y estado. Sin montos, teléfonos, documentos ni correos (RF-14).
      'estados', case when nivel >= 2 then (
        select coalesce(json_agg(json_build_object('nombre', t.nombre, 'estado', t.estado) order by t.nombre), '[]'::json)
        from (
          select s.nombre,
                 case
                   when count(*) filter (where c.valor_pagado < c.valor_cuota
                          and current_date > coalesce(c.fecha_vencimiento, c.fecha_limite + dias_gracia)) > 0 then 'mora'
                   when count(*) filter (where c.valor_pagado < c.valor_cuota
                          and current_date >= c.fecha_limite) > 0 then 'pendiente'
                   else 'al_dia'
                 end as estado
          from socios_natillera x
          join socios s on s.id = x.socio_id
          left join cuotas c on c.socio_natillera_id = x.id
          where x.natillera_id = nat.id and coalesce(x.estado, 'activo') = 'activo'
          group by x.id, s.nombre
        ) t
      ) end
    ) end
  );
end $$;

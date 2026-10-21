-- 065 · Ver como socio: filtro por natillera y opción de incluir socios sin cuenta
--
-- Cambios sobre la 064:
--   · superadmin_buscar_socios: por defecto sigue mostrando solo socios con cuenta vinculada;
--     con p_solo_vinculados = false trae también a los que no tienen. Filtra por natillera.
--   · superadmin_natilleras: lista para el selector, con cuántos socios tiene y cuántos con
--     cuenta. Solo superadmin.
--   · portal_datos_socio / portal_pagos_socio: el superadmin vuelve a poder abrir el portal
--     de un socio sin vincular (como en la 063). Lo ve tal como lo vería ese socio al
--     vincularse; la huella se sigue registrando igual.

drop function if exists public.superadmin_buscar_socios(text, int);

create or replace function public.superadmin_buscar_socios(
  p_texto text default '',
  p_limite int default 50,
  p_natillera_id uuid default null,
  p_solo_vinculados boolean default true
)
returns table (
  socio_natillera_id uuid,
  socio_nombre text,
  documento text,
  telefono text,
  vinculado boolean,
  estado_socio text,
  natillera_id uuid,
  natillera_nombre text,
  natillera_estado text,
  ultima_vista timestamptz
)
language plpgsql stable security definer set search_path = public as $$
declare
  patron text;
begin
  if not public.es_super_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  -- Los comodines que escriba quien busca se toman literales.
  patron := '%' || replace(replace(replace(btrim(coalesce(p_texto, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  return query
  select x.id, s.nombre::text, s.documento::text, s.telefono::text,
         s.usuario_id is not null, coalesce(x.estado, 'activo')::text,
         n.id, n.nombre::text, n.estado::text,
         (select max(v.created_at) from superadmin_vistas_socio v where v.socio_natillera_id = x.id)
  from socios_natillera x
  join socios s on s.id = x.socio_id
  join natilleras n on n.id = x.natillera_id
  where (not coalesce(p_solo_vinculados, true) or s.usuario_id is not null)
    and (p_natillera_id is null or x.natillera_id = p_natillera_id)
    and (s.nombre ilike patron
      or n.nombre ilike patron
      or coalesce(s.documento, '') ilike patron
      or coalesce(s.telefono, '') ilike patron
      or coalesce(s.vinculado_email, '') ilike patron)
  -- Con cuenta primero: son los que de verdad ven el portal.
  order by (s.usuario_id is null), s.nombre, n.nombre
  limit least(greatest(coalesce(p_limite, 50), 1), 200);
end $$;

revoke all on function public.superadmin_buscar_socios(text, int, uuid, boolean) from public, anon;
grant execute on function public.superadmin_buscar_socios(text, int, uuid, boolean) to authenticated;

create or replace function public.superadmin_natilleras()
returns table (
  natillera_id uuid,
  nombre text,
  estado text,
  dashboard_icon smallint,
  socios_total bigint,
  socios_vinculados bigint
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_super_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
  select n.id, n.nombre::text, n.estado::text, n.dashboard_icon,
         count(x.id),
         count(x.id) filter (where s.usuario_id is not null)
  from natilleras n
  left join socios_natillera x on x.natillera_id = n.id
  left join socios s on s.id = x.socio_id
  group by n.id
  order by n.nombre;
end $$;

revoke all on function public.superadmin_natilleras() from public, anon;
grant execute on function public.superadmin_natilleras() to authenticated;

create or replace function public.portal_datos_socio(p_socio_natillera_id uuid)
returns json
-- volatile (antes stable): ahora puede escribir la huella del superadmin en superadmin_vistas_socio.
language plpgsql volatile security definer set search_path = public as $$
declare
  -- No se llama `sn`: chocaría con el alias de socios_natillera en las consultas.
  fila record;
  nat record;
  cfg jsonb;
  nivel int;
  dias_gracia int;
  -- Detalle de sanciones (RF nuevo): por defecto se ve; el admin lo apaga en la configuración del portal
  ver_sanciones boolean;
begin
  select x.id, x.natillera_id, x.valor_cuota_individual, x.periodicidad, x.estado, x.fecha_ingreso,
         s.nombre as socio_nombre, s.telefono as socio_telefono,
         s.usuario_id is not distinct from auth.uid() as es_mio
    into fila
  from socios_natillera x join socios s on s.id = x.socio_id
  where x.id = p_socio_natillera_id
    and (s.usuario_id = auth.uid() or public.es_super_admin());
  if not found then
    return null;  -- no es suyo (o ya no está vinculado): nada que mostrar
  end if;

  -- Ver como socio deja huella aquí, en la misma función que entrega los datos: no hay
  -- forma de leer el portal ajeno sin quedar registrado, ni llamando la RPC a mano.
  if not fila.es_mio then
    insert into superadmin_vistas_socio (superadmin_id, socio_natillera_id, natillera_id)
    values (auth.uid(), fila.id, fila.natillera_id);
  end if;

  select * into nat from natilleras where id = fila.natillera_id;
  cfg := coalesce(nat.config_portal_socio, '{}'::jsonb);
  nivel := coalesce((cfg->>'nivel_transparencia')::int, 0);
  dias_gracia := coalesce((nat.reglas_multas->>'dias_gracia')::int, 3);
  ver_sanciones := coalesce((cfg->>'mostrar_sanciones')::boolean, true);

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
      'reglas_multas', nat.reglas_multas, 'reglas_interes', nat.reglas_interes, 'periodicidad', nat.periodicidad,
      'fecha_inicio', nat.fecha_inicio, 'mes_inicio', nat.mes_inicio, 'mes_fin', nat.mes_fin,
      'anio_inicio', nat.anio_inicio, 'anio', nat.anio
    ),
    'config', json_build_object(
      'mostrar_ganancias', coalesce((cfg->>'mostrar_ganancias')::boolean, true),
      'nivel_transparencia', nivel,
      'mostrar_sanciones', ver_sanciones
    ),
    'cuotas', coalesce((
      select json_agg(json_build_object(
        'id', c.id, 'mes', c.mes, 'anio', c.anio, 'quincena', c.quincena,
        'valor_cuota', c.valor_cuota, 'valor_pagado', c.valor_pagado, 'valor_multa', c.valor_multa,
        'fecha_limite', c.fecha_limite, 'fecha_vencimiento', c.fecha_vencimiento,
        'fecha_pago', c.fecha_pago, 'estado', c.estado,
        'valor_pagado_cuota', c.valor_pagado_cuota, 'valor_pagado_sancion', c.valor_pagado_sancion,
        'valor_pagado_actividades', c.valor_pagado_actividades, 'impuesto_4x1000', c.impuesto_4x1000,
        'valor_pagado_efectivo', c.valor_pagado_efectivo, 'valor_pagado_transferencia', c.valor_pagado_transferencia,
        -- Con qué se armó la sanción: solo si el admin deja ver el detalle (si no, no viajan)
        'valor_multa_base', case when ver_sanciones then c.valor_multa_base end,
        'mora_orden', case when ver_sanciones then c.mora_orden end,
        'fecha_inicio_mora', case when ver_sanciones then c.fecha_inicio_mora end,
        'no_calcular_multa', case when ver_sanciones then coalesce(c.no_calcular_multa, false) end
      ) order by c.anio, c.mes, c.quincena nulls first)
      from cuotas c where c.socio_natillera_id = fila.id
    ), '[]'::json),
    'actividades', coalesce((
      select json_agg(json_build_object(
        'valor_asignado', sa.valor_asignado, 'valor_pagado', sa.valor_pagado,
        'mes_pago', sa.mes_pago, 'anio_pago', sa.anio_pago, 'quincena_pago', sa.quincena_pago,
        'fecha_limite_pago', sa.fecha_limite_pago,
        'actividad', json_build_object(
          'id', a.id, 'descripcion', a.descripcion, 'fecha_limite_pago', a.fecha_limite_pago,
          'tipo', a.tipo, 'estado', a.estado, 'created_at', a.created_at,
          'mes_pago', a.mes_pago, 'anio_pago', a.anio_pago, 'quincena_pago', a.quincena_pago,
          'tipo_rifa', a.tipo_rifa, 'valor_rifa', a.valor_rifa,
          'numero_ganador', a.numero_ganador,
          'ganador_nombre', case when coalesce(a.ganador_es_faltante, false) then null else a.ganador_nombre end,
          'ganador_es_faltante', coalesce(a.ganador_es_faltante, false),
          'ganador_soy_yo', a.ganador_socio_natillera_id is not null and a.ganador_socio_natillera_id = fila.id,
          'cuando_juego_rifa', a.cuando_juego_rifa, 'fecha_juego_rifa', a.fecha_juego_rifa,
          'sorteo_loteria_medellin', a.sorteo_loteria_medellin,
          'numero_completo_loteria_medellin', a.numero_completo_loteria_medellin,
          'serie_loteria_medellin', a.serie_loteria_medellin
        ),
        -- Los números de la rifa que le tocaron a este socio.
        'mis_numeros', case when a.tipo = 'rifa' then (
          select coalesce(json_agg(nr.numero order by nr.numero), '[]'::json)
          from numeros_rifa nr where nr.actividad_id = a.id and nr.socio_vendedor_id = fila.id
        ) end
      ) order by coalesce(
          a.fecha_juego_rifa,
          sa.fecha_limite_pago,
          a.fecha_limite_pago,
          make_date(coalesce(sa.anio_pago, a.anio_pago), coalesce(sa.mes_pago, a.mes_pago), 1),
          a.created_at::date
        ), a.created_at)
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
            'valor_pagado', pp.valor_pagado, 'capital', pp.capital, 'pagada', pp.pagada, 'fecha_proyectada', pp.fecha_proyectada,
            'fecha_pago', pp.fecha_pago
          ) order by pp.numero_cuota)
          from plan_pagos_prestamo pp where pp.prestamo_id = p.id
        ), '[]'::json),
        -- Abonos del ciclo vigente: cada uno es un comprobante, y `numeros_cuota` dice a
        -- qué cuotas se aplicó. Los de un ciclo refinanciado ya no corresponden a este plan.
        'abonos', coalesce((
          select json_agg(json_build_object(
            'id', ab.id, 'valor', ab.valor, 'mora_cobrada', coalesce(ab.mora_cobrada, 0),
            'fecha', ab.fecha, 'codigo_comprobante', ab.codigo_comprobante,
            'numeros_cuota', ab.numeros_cuota,
            'valor_efectivo', ab.valor_efectivo, 'valor_transferencia', ab.valor_transferencia
          ) order by ab.fecha)
          from pagos_prestamo ab where ab.prestamo_id = p.id and ab.refinanciacion_id is null
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

create or replace function public.portal_pagos_socio(p_socio_natillera_id uuid)
returns json
language plpgsql stable security definer set search_path = public as $$
begin
  -- Mismo control que portal_datos_socio: el socio vinculado a esa fila o el superadmin.
  -- La huella la deja portal_datos_socio, que el portal pide siempre junto con esta.
  if not exists (
    select 1 from socios_natillera x join socios s on s.id = x.socio_id
    where x.id = p_socio_natillera_id
      and (s.usuario_id = auth.uid() or public.es_super_admin())
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

revoke all on function public.portal_datos_socio(uuid) from public, anon;
grant execute on function public.portal_datos_socio(uuid) to authenticated;
revoke all on function public.portal_pagos_socio(uuid) from public, anon;
grant execute on function public.portal_pagos_socio(uuid) to authenticated;

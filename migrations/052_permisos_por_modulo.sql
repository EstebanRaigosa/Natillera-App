-- Permisos por opción de la natillera: Nada / Ver / Gestionar.
--
-- Antes: 11 banderas sueltas en natillera_colaboradores.permisos (editar_socios,
-- gestionar_cuotas…), la mitad sin efecto en la base de datos, el rol «visor» sin ningún
-- trato especial (si sus banderas decían true, escribía) y varias tablas que dejaban
-- escribir a cualquier colaborador aceptado sin mirar permisos.
--
-- Ahora cada colaborador tiene un nivel por opción:
--   socios, cuotas, prestamos, actividades, caja, configuracion, administradores  → nada | ver | gestionar
--   notificar, cierre                                                             → nada | gestionar
-- guardado en permisos->'modulos'. El rol es una plantilla que manda sobre lo guardado:
--   co_administrador → gestionar todo, menos el cierre
--   visor            → ver todo lo que se puede ver; nunca escribe
--   colaborador      → lo que diga permisos->'modulos' (o, si aún no lo tiene, las banderas viejas)
-- El dueño (natilleras.admin_id) y el superusuario gestionan todo.
--
-- tiene_permiso_natillera(natillera, 'gestionar_cuotas') y demás claves viejas siguen
-- funcionando: se traducen al módulo. Así las políticas existentes quedan con el modelo
-- nuevo sin reescribirlas una por una. Las que no lo usaban se corrigen abajo.

-- ─── Nivel de un rol + permisos guardados para un módulo ───
create or replace function public.nivel_de_permisos(p_rol text, p_permisos jsonb, p_modulo text)
returns text language plpgsql immutable set search_path = public as $$
declare
  v text;
  -- Banderas viejas: solo cuenta el true literal (evita errores de conversión)
  b_socios boolean := coalesce(p_permisos->>'editar_socios', '') = 'true';
  b_cuotas boolean := coalesce(p_permisos->>'gestionar_cuotas', '') = 'true';
  b_prestamos boolean := coalesce(p_permisos->>'gestionar_prestamos', '') = 'true';
  b_actividades boolean := coalesce(p_permisos->>'gestionar_actividades', '') = 'true';
  b_notificar boolean := coalesce(p_permisos->>'notificar', '') = 'true';
  b_configurar boolean := coalesce(p_permisos->>'configurar', '') = 'true';
  b_invitar boolean := coalesce(p_permisos->>'invitar_colaboradores', '') = 'true';
begin
  if p_rol = 'co_administrador' then
    return case when p_modulo = 'cierre' then 'nada' else 'gestionar' end;
  end if;
  if p_rol = 'visor' then
    return case when p_modulo in ('notificar', 'cierre') then 'nada' else 'ver' end;
  end if;

  v := p_permisos->'modulos'->>p_modulo;
  if v in ('nada', 'ver', 'gestionar') then
    -- Notificar y cierre son acciones: no tienen «ver».
    if p_modulo in ('notificar', 'cierre') and v = 'ver' then return 'nada'; end if;
    return v;
  end if;

  -- Colaborador guardado con el modelo viejo: se traduce sin dar nada nuevo. Administradores
  -- y cierre nunca pasan a «gestionar» por traducción: hay que elegirlos a propósito.
  return case p_modulo
    when 'socios' then case when b_socios then 'gestionar' else 'ver' end
    when 'cuotas' then case when b_cuotas then 'gestionar' else 'ver' end
    when 'prestamos' then case when b_prestamos then 'gestionar' else 'ver' end
    when 'actividades' then case when b_actividades then 'gestionar' else 'ver' end
    when 'caja' then case when b_cuotas then 'gestionar' else 'ver' end
    when 'notificar' then case when b_notificar then 'gestionar' else 'nada' end
    when 'configuracion' then case when b_configurar then 'gestionar' else 'ver' end
    when 'administradores' then case when b_invitar then 'ver' else 'nada' end
    else 'nada'
  end;
end $$;

-- ─── Nivel de un usuario en un módulo de una natillera ───
create or replace function public.nivel_permiso_natillera(p_natillera_id uuid, p_modulo text, p_usuario_id uuid default auth.uid())
returns text language plpgsql stable security definer set search_path = public as $$
declare
  v_rol text;
  v_permisos jsonb;
begin
  if p_natillera_id is null or p_usuario_id is null then return 'nada'; end if;
  if public.es_superusuario() then return 'gestionar'; end if;
  if exists (select 1 from natilleras where id = p_natillera_id and admin_id = p_usuario_id) then
    return 'gestionar';
  end if;
  select rol, permisos into v_rol, v_permisos
  from natillera_colaboradores
  where natillera_id = p_natillera_id and usuario_id = p_usuario_id and estado = 'aceptada';
  if not found then return 'nada'; end if;
  return public.nivel_de_permisos(v_rol, coalesce(v_permisos, '{}'::jsonb), p_modulo);
end $$;

create or replace function public.rango_nivel(p_nivel text)
returns int language sql immutable as $$
  select case p_nivel when 'gestionar' then 2 when 'ver' then 1 else 0 end
$$;

-- ─── Claves viejas → módulo y nivel mínimo. También acepta 'modulo:nivel' ───
create or replace function public.tiene_permiso_natillera(p_natillera_id uuid, p_permiso text, p_usuario_id uuid default auth.uid())
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  v_modulo text;
  v_minimo text;
begin
  if public.es_superusuario() then return true; end if;

  if position(':' in p_permiso) > 0 then
    v_modulo := split_part(p_permiso, ':', 1);
    v_minimo := split_part(p_permiso, ':', 2);
  else
    select m, n into v_modulo, v_minimo from (values
      ('editar_socios', 'socios', 'gestionar'),
      ('gestionar_cuotas', 'cuotas', 'gestionar'),
      ('gestionar_prestamos', 'prestamos', 'gestionar'),
      ('gestionar_actividades', 'actividades', 'gestionar'),
      ('buscar_comprobante', 'cuotas', 'ver'),
      ('configurar', 'configuracion', 'gestionar'),
      ('ver_auditoria', 'configuracion', 'gestionar'),
      ('invitar_colaboradores', 'administradores', 'gestionar'),
      ('notificar', 'notificar', 'gestionar'),
      ('cerrar_natillera', 'cierre', 'gestionar')
    ) as t(clave, m, n)
    where t.clave = p_permiso;
  end if;

  -- 'ver' (o cualquier clave desconocida que pida solo acceso): basta con ser miembro.
  if p_permiso = 'ver' then
    return public.tiene_acceso_natillera(p_natillera_id, p_usuario_id);
  end if;
  if v_modulo is null then return false; end if;

  return public.rango_nivel(public.nivel_permiso_natillera(p_natillera_id, v_modulo, p_usuario_id))
       >= greatest(public.rango_nivel(v_minimo), 1);
end $$;

-- Gestiona al menos una opción que mueve plata (socios, cuotas, préstamos, actividades o
-- caja). Para las tablas que escriben varios módulos a la vez: fondo, utilidades, rifas.
create or replace function public.gestiona_operacion_natillera(p_natillera_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_superusuario() or exists (
    select 1 from unnest(array['socios', 'cuotas', 'prestamos', 'actividades', 'caja']) m
    where public.nivel_permiso_natillera(p_natillera_id, m) = 'gestionar'
  )
$$;

-- Niveles del usuario actual en una natillera, de una sola vez (lo que usa la app).
create or replace function public.mis_niveles_natillera(p_natillera_id uuid)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'rol', public.obtener_rol_natillera(p_natillera_id),
    'niveles', (
      select json_object_agg(m, public.nivel_permiso_natillera(p_natillera_id, m))
      from unnest(array['socios', 'cuotas', 'prestamos', 'actividades', 'caja',
                        'configuracion', 'administradores', 'notificar', 'cierre']) m
    )
  )
$$;

-- Conciliación: gestionar caja (antes leía la bandera gestionar_cuotas a mano).
create or replace function public.puede_conciliar_natillera(p_natillera_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_natillera_id is not null and auth.uid() is not null
     and public.tiene_permiso_natillera(p_natillera_id, 'caja:gestionar')
$$;

-- ─── Tablas que dejaban escribir sin mirar permisos ───

-- Pagos de cuota: el insert leía la bandera a mano y sin exigir estado 'aceptada'.
drop policy if exists "Insertar historial pagos desde mis natilleras" on public.historial_pagos_cuota;
create policy "historial_pagos_cuota_insert_gestionar_cuotas" on public.historial_pagos_cuota
  for insert with check (
    exists (
      select 1 from cuotas c join socios_natillera sn on sn.id = c.socio_natillera_id
      where c.id = historial_pagos_cuota.cuota_id
        and public.tiene_permiso_natillera(sn.natillera_id, 'gestionar_cuotas')
    )
  );

-- Fondo: lo escriben pagos de cuota, préstamos, actividades, retiros y la caja.
drop policy if exists "Crear movimientos con permiso gestionar_cuotas" on public.movimientos_fondo;
drop policy if exists "Actualizar movimientos con permiso gestionar_cuotas" on public.movimientos_fondo;
drop policy if exists "Eliminar movimientos con permiso gestionar_cuotas" on public.movimientos_fondo;
create policy "movimientos_fondo_insert_operacion" on public.movimientos_fondo
  for insert with check (public.gestiona_operacion_natillera(natillera_id));
create policy "movimientos_fondo_update_operacion" on public.movimientos_fondo
  for update using (public.gestiona_operacion_natillera(natillera_id))
  with check (public.gestiona_operacion_natillera(natillera_id));
create policy "movimientos_fondo_delete_operacion" on public.movimientos_fondo
  for delete using (public.gestiona_operacion_natillera(natillera_id));

-- Utilidades: cualquier colaborador aceptado podía escribir (incluido un visor).
drop policy if exists "utilidades_clasificadas_insert_miembros_operativos" on public.utilidades_clasificadas;
drop policy if exists "utilidades_clasificadas_update_miembros_operativos" on public.utilidades_clasificadas;
drop policy if exists "utilidades_clasificadas_delete_miembros_operativos" on public.utilidades_clasificadas;
create policy "utilidades_clasificadas_insert_operacion" on public.utilidades_clasificadas
  for insert with check (public.gestiona_operacion_natillera(natillera_id));
create policy "utilidades_clasificadas_update_operacion" on public.utilidades_clasificadas
  for update using (public.gestiona_operacion_natillera(natillera_id))
  with check (public.gestiona_operacion_natillera(natillera_id));
create policy "utilidades_clasificadas_delete_operacion" on public.utilidades_clasificadas
  for delete using (public.gestiona_operacion_natillera(natillera_id));

-- Actividades de cada socio: cualquier colaborador aceptado podía escribir. Las pagan
-- cuotas y actividades, y las crea socios al agregar uno: basta gestionar una operación.
drop policy if exists "Users can insert socios_actividad in their natilleras" on public.socios_actividad;
drop policy if exists "Users can update socios_actividad of their natilleras" on public.socios_actividad;
drop policy if exists "Users can delete socios_actividad of their natilleras" on public.socios_actividad;
create policy "socios_actividad_insert_operacion" on public.socios_actividad
  for insert with check (exists (
    select 1 from actividades a where a.id = socios_actividad.actividad_id and public.gestiona_operacion_natillera(a.natillera_id)));
create policy "socios_actividad_update_operacion" on public.socios_actividad
  for update using (exists (
    select 1 from actividades a where a.id = socios_actividad.actividad_id and public.gestiona_operacion_natillera(a.natillera_id)))
  with check (exists (
    select 1 from actividades a where a.id = socios_actividad.actividad_id and public.gestiona_operacion_natillera(a.natillera_id)));
create policy "socios_actividad_delete_operacion" on public.socios_actividad
  for delete using (exists (
    select 1 from actividades a where a.id = socios_actividad.actividad_id and public.gestiona_operacion_natillera(a.natillera_id)));

-- Números de rifa: ALL con solo tener acceso. Ver sigue igual; escribir exige gestionar.
drop policy if exists "numeros_rifa_acceso" on public.numeros_rifa;
create policy "numeros_rifa_select_miembros" on public.numeros_rifa
  for select using (exists (
    select 1 from actividades a where a.id = numeros_rifa.actividad_id and public.tiene_acceso_natillera(a.natillera_id, auth.uid())));
create policy "numeros_rifa_escribir_operacion" on public.numeros_rifa
  for all using (exists (
    select 1 from actividades a where a.id = numeros_rifa.actividad_id and public.gestiona_operacion_natillera(a.natillera_id)))
  with check (exists (
    select 1 from actividades a where a.id = numeros_rifa.actividad_id and public.gestiona_operacion_natillera(a.natillera_id)));

-- Rifas (tablas rifas / rifa_*): leían la bandera a mano, sin pasar por el rol. Ver sigue igual.
drop policy if exists "Crear rifas en mis natilleras" on public.rifas;
drop policy if exists "Actualizar rifas de mis natilleras" on public.rifas;
create policy "rifas_insert_actividades" on public.rifas
  for insert with check (public.tiene_permiso_natillera(natillera_id, 'gestionar_actividades'));
create policy "rifas_update_actividades" on public.rifas
  for update using (public.tiene_permiso_natillera(natillera_id, 'gestionar_actividades'))
  with check (public.tiene_permiso_natillera(natillera_id, 'gestionar_actividades'));

drop policy if exists "Crear ventas de rifas de mis natilleras" on public.rifa_ventas;
create policy "rifa_ventas_insert_actividades" on public.rifa_ventas
  for insert with check (exists (
    select 1 from rifas r where r.id = rifa_ventas.rifa_id and public.tiene_permiso_natillera(r.natillera_id, 'gestionar_actividades')));

drop policy if exists "Gestionar números de rifas de mis natilleras" on public.rifa_numeros;
create policy "rifa_numeros_escribir_actividades" on public.rifa_numeros
  for all using (exists (
    select 1 from rifas r where r.id = rifa_numeros.rifa_id and public.tiene_permiso_natillera(r.natillera_id, 'gestionar_actividades')))
  with check (exists (
    select 1 from rifas r where r.id = rifa_numeros.rifa_id and public.tiene_permiso_natillera(r.natillera_id, 'gestionar_actividades')));

drop policy if exists "Crear asignaciones de rifas de mis natilleras" on public.rifa_asignaciones;
create policy "rifa_asignaciones_insert_actividades" on public.rifa_asignaciones
  for insert with check (exists (
    select 1 from rifas r where r.id = rifa_asignaciones.rifa_id and public.tiene_permiso_natillera(r.natillera_id, 'gestionar_actividades')));

drop policy if exists "Gestionar detalle de asignaciones de mis natilleras" on public.rifa_asignacion_detalle;
create policy "rifa_asignacion_detalle_escribir_actividades" on public.rifa_asignacion_detalle
  for all using (exists (
    select 1 from rifa_asignaciones ra join rifas r on r.id = ra.rifa_id
    where ra.id = rifa_asignacion_detalle.asignacion_id and public.tiene_permiso_natillera(r.natillera_id, 'gestionar_actividades')))
  with check (exists (
    select 1 from rifa_asignaciones ra join rifas r on r.id = ra.rifa_id
    where ra.id = rifa_asignacion_detalle.asignacion_id and public.tiene_permiso_natillera(r.natillera_id, 'gestionar_actividades')));

-- Datos del socio (nombre, teléfono…): cualquier colaborador aceptado podía editarlos.
drop policy if exists "Actualizar socios de mis natilleras" on public.socios;
create policy "socios_update_gestionar_socios" on public.socios
  for update using (
    public.es_superusuario()
    or creado_por = auth.uid()
    or exists (select 1 from socios_natillera sn
               where sn.socio_id = socios.id and public.tiene_permiso_natillera(sn.natillera_id, 'editar_socios'))
  );

-- Natillera: configurar o cerrar. El dueño (admin_id) solo lo cambia el dueño.
drop policy if exists "natilleras_update_policy" on public.natilleras;
create policy "natilleras_update_policy" on public.natilleras
  for update using (
    admin_id = auth.uid() or public.es_superusuario()
    or public.tiene_permiso_natillera(id, 'configurar')
    or public.tiene_permiso_natillera(id, 'cerrar_natillera')
  );

create or replace function public.natillera_dueno_no_cambia()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.admin_id is distinct from old.admin_id
     and not (public.es_superusuario() or old.admin_id = auth.uid()) then
    raise exception 'DUENO_PROHIBIDO: solo el dueño puede pasar la natillera a otra persona'
      using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists natillera_dueno_no_cambia on public.natilleras;
create trigger natillera_dueno_no_cambia before update on public.natilleras
  for each row execute function public.natillera_dueno_no_cambia();

-- ─── Administradores: quien tenga «gestionar» en esa opción administra el equipo ───
-- Límites: solo el dueño crea o toca co-administradores, y nadie cambia sus propios permisos.
drop policy if exists "colaboradores_select_policy" on public.natillera_colaboradores;
create policy "colaboradores_select_policy" on public.natillera_colaboradores
  for select using (
    public.es_superusuario() or usuario_id = auth.uid() or public.es_admin_de_natillera(natillera_id)
    or public.tiene_permiso_natillera(natillera_id, 'administradores:ver')
  );

drop policy if exists "colaboradores_insert_policy" on public.natillera_colaboradores;
create policy "colaboradores_insert_policy" on public.natillera_colaboradores
  for insert with check (
    public.es_superusuario() or public.es_admin_de_natillera(natillera_id)
    or (public.tiene_permiso_natillera(natillera_id, 'invitar_colaboradores') and rol <> 'co_administrador')
  );

drop policy if exists "colaboradores_update_policy" on public.natillera_colaboradores;
create policy "colaboradores_update_policy" on public.natillera_colaboradores
  for update using (
    public.es_superusuario() or public.es_admin_de_natillera(natillera_id)
    or (usuario_id = auth.uid() and estado = 'pendiente')
    or (public.tiene_permiso_natillera(natillera_id, 'invitar_colaboradores') and rol <> 'co_administrador')
  );

drop policy if exists "colaboradores_delete_policy" on public.natillera_colaboradores;
create policy "colaboradores_delete_policy" on public.natillera_colaboradores
  for delete using (
    public.es_superusuario() or public.es_admin_de_natillera(natillera_id)
    -- Salirse: cada quien puede borrar su propia fila (antes «Salir» fallaba).
    or usuario_id = auth.uid()
    or (public.tiene_permiso_natillera(natillera_id, 'invitar_colaboradores') and rol <> 'co_administrador')
  );

create or replace function public.colaboradores_invitado_no_se_asciende()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if (select auth.uid()) is null or public.es_superusuario() or public.es_admin_de_natillera(new.natillera_id) then
    return new;
  end if;
  if new.rol is distinct from old.rol or new.permisos is distinct from old.permisos then
    -- Quien administra el equipo cambia a otros, nunca a sí mismo, y no crea co-administradores.
    if old.usuario_id is distinct from auth.uid()
       and new.rol <> 'co_administrador'
       and public.tiene_permiso_natillera(new.natillera_id, 'invitar_colaboradores') then
      return new;
    end if;
    raise exception 'COLABORADOR_PROHIBIDO: el rol y los permisos los define quien administra el equipo'
      using errcode = '42501';
  end if;
  return new;
end $$;

-- ─── Datos: cada colaborador guarda sus niveles explícitos (lo que muestra la app) ───
update public.natillera_colaboradores nc
set permisos = coalesce(nc.permisos, '{}'::jsonb) || jsonb_build_object('modulos', (
  select jsonb_object_agg(m, public.nivel_de_permisos(nc.rol, coalesce(nc.permisos, '{}'::jsonb), m))
  from unnest(array['socios', 'cuotas', 'prestamos', 'actividades', 'caja',
                    'configuracion', 'administradores', 'notificar', 'cierre']) m
))
where not (coalesce(nc.permisos, '{}'::jsonb) ? 'modulos');

revoke all on function public.mis_niveles_natillera(uuid) from public, anon;
grant execute on function public.mis_niveles_natillera(uuid) to authenticated;
grant execute on function public.nivel_permiso_natillera(uuid, text, uuid) to authenticated;
grant execute on function public.tiene_permiso_natillera(uuid, text, uuid) to authenticated;

-- 062 · Sesiones e ingresos: auditoría estandarizada y dispositivo legible
--
-- Dos conceptos que la app mezclaba y que aquí se separan:
--   · INICIO DE SESIÓN: alguien escribe su contraseña, su código SMS o entra con Google.
--     Va a `auditoria` como tipo LOGIN (y LOGOUT al salir), entidad `sesion`.
--   · INGRESO: alguien abre la app (o vuelve a ella tras 10 minutos fuera) con la sesión ya
--     abierta. Va a `accesos_usuario`, una fila por ingreso (ver 038).
--
-- Hasta ahora los inicios de sesión se guardaban como REGISTER / configuracion, y además
-- `onAuthStateChange` apuntaba como «inició sesión» cada SIGNED_IN, que Supabase dispara
-- también al restaurar la sesión o volver a la pestaña: 16.635 de los 19.410 «inicios de
-- sesión» eran eso. El cliente deja de generarlos; los ya guardados no se tocan aquí.

-- 1. Nuevos tipos y entidad en la auditoría
alter table public.auditoria drop constraint if exists auditoria_tipo_accion_check;
alter table public.auditoria add constraint auditoria_tipo_accion_check check (
  tipo_accion::text = any (array[
    'CREATE', 'UPDATE', 'DELETE', 'GENERATE', 'REGISTER', 'CANCEL', 'APPROVE', 'REJECT',
    'DOWNLOAD', 'SEND', 'RESEND', 'LOGIN', 'LOGOUT'
  ]::text[])
);

alter table public.auditoria drop constraint if exists auditoria_entidad_check;
alter table public.auditoria add constraint auditoria_entidad_check check (
  entidad::text = any (array[
    'natillera', 'socio', 'socio_natillera', 'cuota', 'pago', 'comprobante', 'prestamo',
    'pago_prestamo', 'actividad', 'multa', 'configuracion', 'colaborador', 'movimientos_fondo',
    'sesion'
  ]::text[])
);

-- 2. Reclasificar los inicios y cierres de sesión reales ya guardados. La clasificación
--    anterior queda en `metadata` para poder deshacerlo. Los `oauth_or_session_refresh`
--    (restauraciones de sesión, no inicios) se dejan como estaban.
update public.auditoria
   set tipo_accion = 'LOGIN',
       entidad = 'sesion',
       metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('clasificacion_anterior', 'REGISTER/configuracion')
 where tipo_accion = 'REGISTER'
   and entidad = 'configuracion'
   and detalles->>'metodo' in ('email_password', 'oauth', 'sms_otp');

update public.auditoria
   set tipo_accion = 'LOGOUT',
       entidad = 'sesion',
       metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('clasificacion_anterior', 'REGISTER/configuracion')
 where tipo_accion = 'REGISTER'
   and entidad = 'configuracion'
   and detalles->>'metodo' = 'logout';

-- 3. Dispositivo legible en cada ingreso. El cliente lo describe (sistema, navegador,
--    modelo, si es la app instalada); el user agent se sigue guardando como respaldo.
alter table public.accesos_usuario add column if not exists dispositivo text;
alter table public.accesos_usuario add column if not exists tipo_dispositivo text;
alter table public.accesos_usuario add column if not exists sistema text;
alter table public.accesos_usuario add column if not exists navegador text;
alter table public.accesos_usuario add column if not exists modelo text;
alter table public.accesos_usuario add column if not exists modo_app text;

comment on column public.accesos_usuario.dispositivo is
  'Etiqueta legible, p. ej. «iPhone · iOS 26 · App instalada». La calcula el cliente.';
comment on column public.accesos_usuario.modo_app is
  '`app` si se abrió desde el icono instalado (PWA), `navegador` si desde el navegador.';

-- El tablero de frecuencia filtra por fecha de ingreso.
create index if not exists accesos_usuario_inicio_idx
  on public.accesos_usuario (inicio desc);

-- 4. `registrar_latido` recibe el dispositivo. Se reemplaza la firma de dos parámetros
--    por una de tres con valor por defecto: las llamadas antiguas (p_user_agent,
--    p_plataforma) siguen funcionando sin ambigüedad.
drop function if exists public.registrar_latido(text, text);

create or replace function public.registrar_latido(
  p_user_agent text default null,
  p_plataforma text default null,
  p_dispositivo jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_corte   interval := interval '10 minutes';
  v_sesion  uuid;
  v_email   text;
  v_nombre  text;
begin
  if v_uid is null then
    return null;
  end if;

  select email into v_email from auth.users where id = v_uid;
  select nombre into v_nombre from public.user_profiles where id = v_uid;

  update public.accesos_usuario
     set ultimo_latido = now()
   where user_id = v_uid
     and ultimo_latido > now() - v_corte
   returning id into v_sesion;

  if v_sesion is null then
    insert into public.accesos_usuario (
      user_id, email, nombre, user_agent, plataforma,
      dispositivo, tipo_dispositivo, sistema, navegador, modelo, modo_app
    )
    values (
      v_uid, coalesce(v_email, 'desconocido'), v_nombre,
      left(coalesce(p_user_agent, ''), 400), p_plataforma,
      left(p_dispositivo->>'etiqueta', 120),
      left(p_dispositivo->>'tipo', 20),
      left(nullif(concat_ws(' ', p_dispositivo->>'so', p_dispositivo->>'soVersion'), ''), 40),
      left(p_dispositivo->>'navegador', 40),
      left(p_dispositivo->>'modelo', 60),
      case when p_dispositivo->>'modoApp' in ('app', 'navegador') then p_dispositivo->>'modoApp' end
    )
    returning id into v_sesion;
  end if;

  update public.user_profiles set ultimo_acceso = now() where id = v_uid;

  return v_sesion;
end;
$$;

revoke all on function public.registrar_latido(text, text, jsonb) from public;
grant execute on function public.registrar_latido(text, text, jsonb) to authenticated;

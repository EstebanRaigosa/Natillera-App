-- 066 · Límite de envío de códigos SMS (OTP)
--
-- La Edge Function `twilio` mandaba un SMS a cualquier número que le llegara: la clave
-- pública (anon) va dentro de la app, así que cualquiera podía llamarla en bucle y cada SMS
-- lo paga la cuenta de Twilio («SMS pumping»). La comprobación de «es socio» vivía solo en
-- el navegador. Ahora la función pregunta aquí antes de enviar, y esta decide:
--   · solo celulares que figuran como socio en alguna natillera (telefono_es_socio);
--   · como mucho 3 códigos por número en una hora y 6 en un día;
--   · como mucho 60 códigos al día en toda la app: si alguien encuentra cómo saltarse lo
--     anterior, el gasto diario tiene techo.
-- Solo la llama la Edge Function con la service role; nadie más puede ejecutarla.

create table if not exists public.otp_envios (
  id bigint generated always as identity primary key,
  telefono text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_envios_telefono_fecha on public.otp_envios (telefono, created_at desc);
create index if not exists idx_otp_envios_fecha on public.otp_envios (created_at desc);

-- Sin políticas: ni anon ni authenticated la leen ni la escriben.
alter table public.otp_envios enable row level security;
revoke all on public.otp_envios from anon, authenticated;

comment on table public.otp_envios is
  'Cada SMS de código enviado. La escribe otp_reservar_envio; sirve para limitar el gasto en Twilio.';

-- Devuelve 'ok' (y deja apuntado el envío) o el motivo por el que no se envía.
create or replace function public.otp_reservar_envio(p_telefono text)
returns text
language plpgsql volatile security definer set search_path = public, pg_temp as $$
declare
  v_tel text;
begin
  v_tel := regexp_replace(coalesce(p_telefono, ''), '[^0-9]', '', 'g');
  if length(v_tel) > 10 and v_tel like '57%' then
    v_tel := substring(v_tel from 3);
  end if;

  -- Celular colombiano: 10 dígitos empezando por 3.
  if v_tel !~ '^3[0-9]{9}$' then
    return 'numero_invalido';
  end if;

  if not public.telefono_es_socio(v_tel) then
    return 'no_es_socio';
  end if;

  -- Dos peticiones a la vez para el mismo número no deben colarse las dos por el límite.
  perform pg_advisory_xact_lock(hashtext('otp:' || v_tel));

  if (select count(*) from otp_envios where telefono = v_tel and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from otp_envios where telefono = v_tel and created_at > now() - interval '1 day') >= 6 then
    return 'limite_numero';
  end if;

  if (select count(*) from otp_envios where created_at > now() - interval '1 day') >= 60 then
    return 'limite_global';
  end if;

  insert into otp_envios (telefono) values (v_tel);

  -- Lo de hace más de un mes ya no cuenta para ningún límite.
  delete from otp_envios where created_at < now() - interval '30 days';

  return 'ok';
end $$;

revoke all on function public.otp_reservar_envio(text) from public, anon, authenticated;
grant execute on function public.otp_reservar_envio(text) to service_role;

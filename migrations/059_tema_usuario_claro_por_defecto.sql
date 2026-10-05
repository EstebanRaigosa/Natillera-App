-- El modo oscuro queda oculto (MODO_OSCURO_LIBERADO = false en useTema.js) y la
-- preferencia por defecto pasa a ser 'claro' en vez de seguir al dispositivo.
--
-- Las cuentas con 'auto' lo tienen por el valor por defecto de la 057: la opción
-- estuvo visible muy poco tiempo y en ese rato guardar fallaba por permisos (058),
-- así que nadie llegó a elegir 'auto' a propósito. Pasan a 'claro'. Quien eligió
-- 'oscuro' lo conserva, aunque no lo verá mientras la opción esté oculta.

alter table public.user_profiles alter column tema set default 'claro';

update public.user_profiles set tema = 'claro' where tema = 'auto';

-- Permiso para que cada usuario guarde su preferencia de tema.
--
-- user_profiles concede UPDATE columna a columna (nombre, avatar, teléfono…), no
-- sobre la tabla entera. La 057 añadió `tema` sin incluirla en esa lista, así que
-- guardar la preferencia fallaba siempre por permisos y la app avisaba de que
-- «no se pudo guardar en tu cuenta». La política RLS de UPDATE ya limita la fila a
-- la del propio usuario (o a un superusuario).

grant update (tema) on public.user_profiles to authenticated;

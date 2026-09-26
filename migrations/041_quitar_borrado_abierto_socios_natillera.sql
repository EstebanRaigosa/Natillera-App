-- La política «Usuarios autenticados pueden eliminar socios» de socios_natillera solo
-- pedía `auth.uid() IS NOT NULL`. Como las políticas permisivas se suman con OR, dejaba a
-- CUALQUIER usuario con sesión borrar socios de CUALQUIER natillera, por encima de
-- `socios_natillera_delete_policy`. Con el portal de socios abierto (muchos más usuarios
-- con sesión) el agujero crecía.
--
-- Queda solo la política que exige el permiso `editar_socios`, que ya cubre al
-- superusuario, al admin, al co-administrador y a los colaboradores con ese permiso.
-- Borrar una natillera sigue arrastrando a sus socios por el ON DELETE CASCADE.

drop policy if exists "Usuarios autenticados pueden eliminar socios" on public.socios_natillera;

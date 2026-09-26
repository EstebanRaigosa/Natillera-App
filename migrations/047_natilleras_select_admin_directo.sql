-- Crear una natillera fallaba con «new row violates row-level security policy for table
-- natilleras» para cualquier usuario que no fuera el superusuario.
--
-- La app crea con `insert(...).select().single()`, o sea INSERT ... RETURNING, y la fila
-- devuelta tiene que pasar también la política de SELECT. Esa política (032) solo miraba
-- `id IN (SELECT mis_natilleras())`, y mis_natilleras() es STABLE: dentro de la misma
-- sentencia ve la tabla como estaba ANTES del insert, así que la natillera recién creada
-- no aparece como «mía» y la base rechaza la fila.
--
-- Arreglo: comprobar primero el dueño sobre la propia fila (`admin_id = auth.uid()`), que
-- no depende de ninguna consulta ni instantánea. mis_natilleras() sigue cubriendo a los
-- colaboradores, y el superusuario sigue viéndolo todo.

drop policy if exists natilleras_select_policy on public.natilleras;
create policy natilleras_select_policy on public.natilleras
  for select
  using (
    (select public.es_superusuario())
    or admin_id = (select auth.uid())
    or id in (select public.mis_natilleras())
  );

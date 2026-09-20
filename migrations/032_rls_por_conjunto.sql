-- ===========================================================================
-- 032_rls_por_conjunto.sql — quitar la comprobación de permisos fila a fila
-- ===========================================================================
--
-- Las políticas de lectura llamaban `tiene_acceso_natillera(...)` —plpgsql,
-- SECURITY DEFINER, con hasta tres consultas dentro— UNA VEZ POR FILA. Y varias
-- lo hacían a través de `obtener_natillera_id_desde_socio_natillera(...)`, que
-- es otra consulta más por fila.
--
-- Medido sobre «Ahorro seguro» (517 cuotas), con la sesión de su administradora:
--
--   contar las 517 cuotas con RLS ......... 152,2 ms
--   las mismas filas como `postgres` ......   0,6 ms
--
-- Es decir: la vista de cuotas se pasaba el tiempo repitiendo la misma
-- comprobación de permisos 517 veces. No era falta de índices —`cuotas` ya
-- tiene `(socio_natillera_id)` y `(socio_natillera_id, mes, anio)`—.
--
-- La idea: resolver «a qué natilleras tengo acceso» UNA vez por consulta y
-- comparar contra ese conjunto. Como el `IN (SELECT ...)` no depende de la fila,
-- Postgres lo evalúa una sola vez y por fila queda una búsqueda por clave.
-- El mismo truco con `(SELECT public.es_superusuario())`, que envuelto en un
-- SELECT pasa de llamada por fila a una sola evaluación.
--
-- Tras aplicarla: 517 cuotas en 3,3 ms (46× más rápido) y `socios_natillera` en
-- 1,8 ms en lugar de 26,3 ms.
--
-- La visibilidad no cambia. Comprobado contando, para los 55 usuarios y antes y
-- después, las filas que ve cada uno en las nueve tablas tocadas: idénticas.

CREATE OR REPLACE FUNCTION public.mis_natilleras()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
  SELECT n.id FROM public.natilleras n WHERE public.es_superusuario()
  UNION
  SELECT n.id FROM public.natilleras n WHERE n.admin_id = (SELECT auth.uid())
  UNION
  SELECT nc.natillera_id FROM public.natillera_colaboradores nc
   WHERE nc.usuario_id = (SELECT auth.uid()) AND nc.estado = 'aceptada'
$fn$;

COMMENT ON FUNCTION public.mis_natilleras() IS
  'Natilleras que quien llama puede ver: admin, colaborador aceptado o superusuario. Mismo criterio que tiene_acceso_natillera, pero resuelto una vez por consulta. En las políticas se usa como IN (SELECT public.mis_natilleras()).';

REVOKE ALL ON FUNCTION public.mis_natilleras() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mis_natilleras() TO authenticated;

-- El `(SELECT public.es_superusuario())` de cada política no es decorativo: las
-- políticas viejas empezaban por `es_superusuario() OR ...`, de modo que el
-- superusuario veía TODA fila, incluidas las que no cuelgan de ninguna natillera
-- —hay una utilidad clasificada con `natillera_id` nulo—. Sin esta rama esa fila
-- desaparecía, y eso ya no sería la misma visibilidad.

DROP POLICY IF EXISTS socios_natillera_select_policy ON public.socios_natillera;
DROP POLICY IF EXISTS "Admin puede ver todas las relaciones socios-natillera" ON public.socios_natillera;
CREATE POLICY socios_natillera_select_policy ON public.socios_natillera
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR natillera_id IN (SELECT public.mis_natilleras())
  );

DROP POLICY IF EXISTS cuotas_select_policy ON public.cuotas;
DROP POLICY IF EXISTS "Admin puede ver todas las cuotas" ON public.cuotas;
CREATE POLICY cuotas_select_policy ON public.cuotas
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR socio_natillera_id IN (
      SELECT sn.id FROM public.socios_natillera sn
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS prestamos_select_policy ON public.prestamos;
CREATE POLICY prestamos_select_policy ON public.prestamos
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR socio_natillera_id IN (
      SELECT sn.id FROM public.socios_natillera sn
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS plan_pagos_prestamo_select_policy ON public.plan_pagos_prestamo;
DROP POLICY IF EXISTS "Usuarios ven plan de pagos de sus préstamos" ON public.plan_pagos_prestamo;
CREATE POLICY plan_pagos_prestamo_select_policy ON public.plan_pagos_prestamo
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR prestamo_id IN (
      SELECT p.id FROM public.prestamos p
      JOIN public.socios_natillera sn ON sn.id = p.socio_natillera_id
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS actividades_select_policy ON public.actividades;
DROP POLICY IF EXISTS actividades_select_admin_or_super ON public.actividades;
DROP POLICY IF EXISTS "Admin puede ver todas las actividades" ON public.actividades;
CREATE POLICY actividades_select_policy ON public.actividades
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR natillera_id IN (SELECT public.mis_natilleras())
  );

DROP POLICY IF EXISTS "Users can view socios_actividad of their natilleras" ON public.socios_actividad;
DROP POLICY IF EXISTS socios_actividad_select_policy ON public.socios_actividad;
CREATE POLICY socios_actividad_select_policy ON public.socios_actividad
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR actividad_id IN (
      SELECT a.id FROM public.actividades a
      WHERE a.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS "Ver movimientos de natilleras con acceso" ON public.movimientos_fondo;
DROP POLICY IF EXISTS movimientos_fondo_select_policy ON public.movimientos_fondo;
CREATE POLICY movimientos_fondo_select_policy ON public.movimientos_fondo
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR natillera_id IN (SELECT public.mis_natilleras())
  );

DROP POLICY IF EXISTS utilidades_clasificadas_select_acceso ON public.utilidades_clasificadas;
DROP POLICY IF EXISTS utilidades_clasificadas_select_miembros_operativos ON public.utilidades_clasificadas;
DROP POLICY IF EXISTS utilidades_clasificadas_select_policy ON public.utilidades_clasificadas;
CREATE POLICY utilidades_clasificadas_select_policy ON public.utilidades_clasificadas
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR natillera_id IN (SELECT public.mis_natilleras())
  );

DROP POLICY IF EXISTS "Ver historial pagos de mis natilleras" ON public.historial_pagos_cuota;
DROP POLICY IF EXISTS historial_pagos_cuota_select_policy ON public.historial_pagos_cuota;
CREATE POLICY historial_pagos_cuota_select_policy ON public.historial_pagos_cuota
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR cuota_id IN (
      SELECT c.id FROM public.cuotas c
      JOIN public.socios_natillera sn ON sn.id = c.socio_natillera_id
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- Que nadie vea una fila de más ni de menos. Se cuentan las filas visibles para
-- cada usuario antes y después y se comparan:
--
--   SET LOCAL ROLE authenticated;
--   SELECT set_config('request.jwt.claims',
--     json_build_object('sub','<uid>','role','authenticated')::text, true);
--   SELECT count(*) FROM cuotas;   -- y el resto de tablas
--
-- Resultado al aplicar: 55 usuarios, 0 diferencias.

-- ===========================================================================
-- 033_rls_por_conjunto_resto.sql — lo mismo para el resto de tablas
-- ===========================================================================
--
-- Continuación de la 032. `natilleras` es la más importante después de
-- `cuotas`: se lee al entrar a cualquier pantalla y el dashboard la recorre
-- entera. `socios` arrastraba el mismo problema desde la migración 030, que la
-- escribí llamando `tiene_acceso_natillera` por fila.
--
-- Visibilidad comprobada igual que en la 032: 55 usuarios, 0 diferencias en las
-- siete tablas. Tiempos después: `natilleras` 2,0 ms, `socios` 4,0 ms.

DROP POLICY IF EXISTS natilleras_select_policy ON public.natilleras;
CREATE POLICY natilleras_select_policy ON public.natilleras
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR id IN (SELECT public.mis_natilleras())
  );

-- Las cuatro puertas son las mismas que fijó la 030; solo cambia cómo se
-- resuelven.
DROP POLICY IF EXISTS "Socios visibles para quien tiene motivo" ON public.socios;
CREATE POLICY "Socios visibles para quien tiene motivo" ON public.socios
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR id IN (
      SELECT sn.socio_id FROM public.socios_natillera sn
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
    OR creado_por = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = (SELECT auth.uid())
        AND (
          (socios.email IS NOT NULL AND lower(btrim(socios.email)) = lower(btrim(p.email)))
          OR (socios.telefono IS NOT NULL AND p.telefono IS NOT NULL
              AND regexp_replace(socios.telefono, '[^0-9]', '', 'g') = regexp_replace(p.telefono, '[^0-9]', '', 'g'))
        )
    )
  );

DROP POLICY IF EXISTS multas_select_policy ON public.multas;
CREATE POLICY multas_select_policy ON public.multas
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR socio_natillera_id IN (
      SELECT sn.id FROM public.socios_natillera sn
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS pagos_prestamo_select_policy ON public.pagos_prestamo;
CREATE POLICY pagos_prestamo_select_policy ON public.pagos_prestamo
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR prestamo_id IN (
      SELECT p.id FROM public.prestamos p
      JOIN public.socios_natillera sn ON sn.id = p.socio_natillera_id
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS historial_select_policy ON public.historial;
CREATE POLICY historial_select_policy ON public.historial
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR natillera_id IN (SELECT public.mis_natilleras())
  );

DROP POLICY IF EXISTS comprobantes_salida_select_policy ON public.comprobantes_salida;
CREATE POLICY comprobantes_salida_select_policy ON public.comprobantes_salida
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR socio_natillera_id IN (
      SELECT sn.id FROM public.socios_natillera sn
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS historial_comprobantes_prestamo_select_policy ON public.historial_comprobantes_prestamo;
CREATE POLICY historial_comprobantes_prestamo_select_policy ON public.historial_comprobantes_prestamo
  FOR SELECT USING (
    (SELECT public.es_superusuario())
    OR prestamo_id IN (
      SELECT p.id FROM public.prestamos p
      JOIN public.socios_natillera sn ON sn.id = p.socio_natillera_id
      WHERE sn.natillera_id IN (SELECT public.mis_natilleras())
    )
  );

DROP POLICY IF EXISTS historial_comprobantes_select_policy ON public.historial_comprobantes;
CREATE POLICY historial_comprobantes_select_policy ON public.historial_comprobantes
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
-- Que no quede ninguna política de lectura comprobando el permiso fila a fila:
--
--   SELECT tablename, policyname FROM pg_policies
--   WHERE schemaname='public' AND cmd='SELECT'
--     AND (qual::text LIKE '%tiene_acceso_natillera%'
--          OR qual::text LIKE '%obtener_natillera_id%');
--
-- Debe devolver 0 filas. `auditoria` y `cortes_caja` se dejaron fuera a
-- propósito: usan `tiene_permiso_natillera` / `usuario_puede_operar_natillera`,
-- que comprueban permisos concretos y no solo el acceso, y sus tablas son
-- pequeñas.

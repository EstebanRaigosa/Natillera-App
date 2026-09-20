-- ===========================================================================
-- 034_anon_puede_evaluar_acceso.sql — que sin sesión salga vacío, no un error
-- ===========================================================================
--
-- La 028c revocó a `anon` el EXECUTE de todas las funciones SECURITY DEFINER.
-- Correcto para las que hacen algo, pero desde las migraciones 032 y 033
-- `es_superusuario()` y `mis_natilleras()` se llaman DENTRO de las políticas de
-- lectura. Sin el permiso, una consulta sin sesión dejaba de devolver una lista
-- vacía y pasaba a fallar:
--
--   {"code":"42501","message":"permission denied for function es_superusuario"}
--
-- Eso convierte un caso benigno —sesión caducada, petición en vuelo al cerrar
-- sesión— en un error en pantalla donde antes había un estado vacío.
--
-- Devolverles el EXECUTE a `anon` no abre nada: sin sesión `auth.uid()` es nulo,
-- así que `es_superusuario()` es false y `mis_natilleras()` no devuelve ninguna
-- fila. Lo que protege los datos son las políticas y los GRANT de tabla, no el
-- permiso sobre estas dos funciones.

GRANT EXECUTE ON FUNCTION public.es_superusuario() TO anon;
GRANT EXECUTE ON FUNCTION public.mis_natilleras() TO anon;

-- Y una política redundante que costaba una llamada plpgsql por fila:
-- `is_admin_user()` comprueba el mismo correo que `es_superusuario()`, y
-- `admin_id = auth.uid()` ya está dentro de `mis_natilleras()`. Quitarla no
-- cambia lo que ve nadie (comprobado: 55 usuarios, 0 diferencias) y era la única
-- razón por la que `natilleras` seguía fallando sin sesión.
DROP POLICY IF EXISTS "Admin puede ver todas las natilleras" ON public.natilleras;

-- ===========================================================================
-- COMPROBACIÓN
-- ===========================================================================
--
-- Sin sesión, con la clave publicable, todas deben devolver [] y ninguna error:
--   for t in natilleras cuotas socios_natillera actividades socios_actividad \
--            prestamos movimientos_fondo; do
--     curl -s "$URL/rest/v1/$t?select=id&limit=1" -H "apikey: $ANON"
--   done

-- ============================================================================
-- 070 — Natilleras de cada usuario en el panel de Tráfico
--
-- Tráfico dice quién entra y desde dónde, pero no a qué natillera pertenece, y
-- eso es lo que da contexto: no es lo mismo que entre veinte veces el dueño de
-- tres natilleras que un socio mirando su cuota.
--
-- `natilleras_de_usuarios` recibe todos los usuarios que hay en pantalla y
-- devuelve, para cada uno, sus natilleras con el rol más alto que tiene en cada
-- una: administrador (dueño), el rol de colaborador aceptado, o socio vinculado.
-- Una sola llamada para toda la página en vez de una por fila.
--
-- Solo superadministrador: cruza natilleras ajenas que RLS no le abre.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.natilleras_de_usuarios(p_user_ids uuid[])
RETURNS TABLE (user_id uuid, natilleras jsonb)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.es_super_admin() THEN
    RAISE EXCEPTION 'TRAFICO_PROHIBIDO: solo el superadministrador puede ver esto' USING ERRCODE = '42501';
  END IF;

  -- Tope por si la lista viene inflada: la página nunca muestra más de unos cientos.
  IF coalesce(array_length(p_user_ids, 1), 0) > 1000 THEN
    RAISE EXCEPTION 'TRAFICO_DATOS: demasiados usuarios en una consulta' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  WITH roles AS (
    SELECT n.admin_id AS uid, n.id AS natillera_id, 'administrador'::text AS rol, 1 AS orden
    FROM public.natilleras n
    WHERE n.admin_id = ANY (p_user_ids)
    UNION ALL
    SELECT c.usuario_id, c.natillera_id, c.rol::text, 2
    FROM public.natillera_colaboradores c
    WHERE c.usuario_id = ANY (p_user_ids) AND c.estado = 'aceptada'
    UNION ALL
    SELECT s.usuario_id, sn.natillera_id, 'socio', 3
    FROM public.socios s
    JOIN public.socios_natillera sn ON sn.socio_id = s.id
    WHERE s.usuario_id = ANY (p_user_ids) AND sn.estado = 'activo'
  ),
  mejor AS (
    SELECT DISTINCT ON (r.uid, r.natillera_id) r.uid, r.natillera_id, r.rol, r.orden
    FROM roles r
    ORDER BY r.uid, r.natillera_id, r.orden
  )
  SELECT m.uid,
         jsonb_agg(jsonb_build_object('id', nt.id, 'nombre', nt.nombre, 'estado', nt.estado, 'rol', m.rol)
                   ORDER BY m.orden, nt.nombre)
  FROM mejor m
  JOIN public.natilleras nt ON nt.id = m.natillera_id
  GROUP BY m.uid;
END;
$$;

REVOKE ALL ON FUNCTION public.natilleras_de_usuarios(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.natilleras_de_usuarios(uuid[]) TO authenticated;

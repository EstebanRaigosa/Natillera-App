-- Siguiente índice de ícono (0–19) según cantidad actual de filas (ciclo)
CREATE OR REPLACE FUNCTION public.next_dashboard_icon()
RETURNS smallint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ((SELECT COUNT(*)::bigint FROM public.natilleras) % 20)::smallint;
$$;

REVOKE ALL ON FUNCTION public.next_dashboard_icon() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_dashboard_icon() TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_dashboard_icon() TO service_role;

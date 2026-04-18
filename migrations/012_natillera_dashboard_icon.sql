-- Ícono visual del dashboard (0–19), ciclo al crear nuevas natilleras
ALTER TABLE public.natilleras
ADD COLUMN IF NOT EXISTS dashboard_icon smallint NOT NULL DEFAULT 0;

ALTER TABLE public.natilleras DROP CONSTRAINT IF EXISTS natilleras_dashboard_icon_range;
ALTER TABLE public.natilleras
ADD CONSTRAINT natilleras_dashboard_icon_range
CHECK (dashboard_icon >= 0 AND dashboard_icon < 20);

COMMENT ON COLUMN public.natilleras.dashboard_icon IS 'Índice 0-19 del set de íconos del dashboard; se asigna en orden al crear (ciclo).';

-- Repartir íconos entre filas existentes por fecha de creación
WITH numbered AS (
  SELECT
    id,
    ((ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1) % 20)::smallint AS slot
  FROM public.natilleras
)
UPDATE public.natilleras n
SET dashboard_icon = numbered.slot
FROM numbered
WHERE n.id = numbered.id;

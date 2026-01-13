-- ============================================
-- Agregar campo config_cierre a natilleras
-- Este campo almacena la configuración de cómo
-- se repartirán las utilidades al cerrar la natillera
-- ============================================

-- Agregar columna config_cierre como JSONB
ALTER TABLE natilleras 
ADD COLUMN IF NOT EXISTS config_cierre JSONB DEFAULT '{"modoActividades": "general", "actividades": {"general": "equitativa", "rifa": "equitativa", "bingo": "equitativa", "venta": "equitativa", "evento": "equitativa", "otro": "equitativa"}, "prestamos": "equitativa"}'::jsonb;

-- Comentario sobre la columna
COMMENT ON COLUMN natilleras.config_cierre IS 'Configuración de cierre de natillera. Determina cómo se reparten las utilidades: {"modoActividades": "general"|"individual", "actividades": {"general": "equitativa"|"proporcional" (solo si modoActividades es general), "rifa": "equitativa"|"proporcional", "bingo": "equitativa"|"proporcional", "venta": "equitativa"|"proporcional", "evento": "equitativa"|"proporcional", "otro": "equitativa"|"proporcional"}, "prestamos": "equitativa"|"proporcional"}';

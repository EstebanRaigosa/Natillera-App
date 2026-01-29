-- ============================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- ============================================
-- Copia y pega este código completo en el SQL Editor de Supabase
-- y ejecútalo para corregir el trigger que está causando el error

-- Función para actualizar el estado automáticamente según valor_pagado y fecha límite
CREATE OR REPLACE FUNCTION update_estado_socio_actividad()
RETURNS TRIGGER AS $$
DECLARE
    fecha_limite_actividad DATE;
    estado_calculado VARCHAR(20);
BEGIN
    -- Si el estado ya está establecido y es válido, respetarlo (solo para INSERT)
    -- Para UPDATE, siempre recalcular basado en valor_pagado
    IF TG_OP = 'INSERT' AND NEW.estado IS NOT NULL AND NEW.estado IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
        -- El estado ya está establecido correctamente, solo verificar que sea consistente con valor_pagado
        -- Si está pagado completamente, forzar estado 'pagado'
        IF NEW.valor_pagado >= NEW.valor_asignado THEN
            NEW.estado = 'pagado';
            IF NEW.fecha_pago IS NULL THEN
                NEW.fecha_pago = NOW();
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Obtener la fecha límite de la actividad
    SELECT fecha_limite_pago INTO fecha_limite_actividad
    FROM actividades
    WHERE id = NEW.actividad_id;
    
    -- Calcular estado según valor_pagado
    IF NEW.valor_pagado >= NEW.valor_asignado THEN
        estado_calculado := 'pagado';
        IF NEW.fecha_pago IS NULL THEN
            NEW.fecha_pago = NOW();
        END IF;
    ELSIF NEW.valor_pagado > 0 THEN
        -- Si hay pago parcial, verificar si está en mora
        IF fecha_limite_actividad IS NOT NULL AND CURRENT_DATE > fecha_limite_actividad THEN
            estado_calculado := 'mora';
        ELSE
            estado_calculado := 'parcial';
        END IF;
    ELSE
        -- Si no hay pago, verificar si está en mora
        IF fecha_limite_actividad IS NOT NULL AND CURRENT_DATE > fecha_limite_actividad THEN
            estado_calculado := 'mora';
        ELSE
            estado_calculado := 'pendiente';
        END IF;
        NEW.fecha_pago = NULL;
    END IF;
    
    -- Asegurar que el estado calculado sea válido
    IF estado_calculado IS NULL OR estado_calculado NOT IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
        estado_calculado := 'pendiente';
    END IF;
    
    NEW.estado := estado_calculado;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

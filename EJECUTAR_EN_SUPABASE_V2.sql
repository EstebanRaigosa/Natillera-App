-- ============================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR (VERSIÓN MEJORADA)
-- ============================================
-- Esta versión es más robusta y maneja mejor los errores

-- Función para actualizar el estado automáticamente según valor_pagado y fecha límite
CREATE OR REPLACE FUNCTION update_estado_socio_actividad()
RETURNS TRIGGER AS $$
DECLARE
    fecha_limite_actividad DATE;
    estado_calculado VARCHAR(20);
BEGIN
    -- Para INSERT: Si el estado ya está establecido y es válido, respetarlo
    IF TG_OP = 'INSERT' THEN
        -- Si el estado ya está establecido y es válido, respetarlo
        IF NEW.estado IS NOT NULL AND NEW.estado IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
            -- Solo verificar consistencia con valor_pagado
            IF NEW.valor_pagado >= NEW.valor_asignado AND NEW.estado != 'pagado' THEN
                NEW.estado := 'pagado';
                IF NEW.fecha_pago IS NULL THEN
                    NEW.fecha_pago := NOW();
                END IF;
            END IF;
            RETURN NEW;
        END IF;
        
        -- Si el estado no está establecido o es inválido, calcularlo
        -- Pero primero asegurar un valor por defecto válido
        IF NEW.estado IS NULL OR NEW.estado NOT IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
            NEW.estado := 'pendiente'; -- Valor por defecto seguro
        END IF;
    END IF;
    
    -- Para UPDATE o si necesitamos recalcular: obtener fecha límite de forma segura
    BEGIN
        SELECT fecha_limite_pago INTO fecha_limite_actividad
        FROM actividades
        WHERE id = NEW.actividad_id;
    EXCEPTION
        WHEN OTHERS THEN
            fecha_limite_actividad := NULL;
    END;
    
    -- Calcular estado según valor_pagado
    IF NEW.valor_pagado >= NEW.valor_asignado THEN
        estado_calculado := 'pagado';
        IF NEW.fecha_pago IS NULL THEN
            NEW.fecha_pago := NOW();
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
        NEW.fecha_pago := NULL;
    END IF;
    
    -- Asegurar que el estado calculado sea válido (última línea de defensa)
    IF estado_calculado IS NULL OR estado_calculado NOT IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
        estado_calculado := 'pendiente';
    END IF;
    
    -- Solo actualizar el estado si estamos en UPDATE o si el estado no estaba establecido
    IF TG_OP = 'UPDATE' OR (TG_OP = 'INSERT' AND (NEW.estado IS NULL OR NEW.estado NOT IN ('pendiente', 'parcial', 'pagado', 'mora'))) THEN
        NEW.estado := estado_calculado;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

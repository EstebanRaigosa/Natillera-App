-- ============================================
-- FIX: Hacer que el trigger respete el estado cuando solo se actualiza el estado
-- ============================================
-- Este script corrige la función del trigger para que NO interfiera
-- cuando solo se actualiza el estado (sin cambiar valor_pagado)

-- Función para actualizar el estado automáticamente según valor_pagado y fecha límite
CREATE OR REPLACE FUNCTION update_estado_socio_actividad()
RETURNS TRIGGER AS $$
DECLARE
    fecha_limite_actividad DATE;
    estado_calculado VARCHAR(20);
BEGIN
    -- IMPORTANTE: Este trigger solo se ejecuta cuando se actualiza valor_pagado
    -- Si solo se actualiza el estado, el trigger NO se ejecuta (por la definición del trigger)
    -- Pero por seguridad, verificamos si valor_pagado cambió
    
    -- Si valor_pagado no cambió, no hacer nada (solo se está actualizando otro campo)
    IF OLD.valor_pagado = NEW.valor_pagado THEN
        RETURN NEW; -- Respetar el estado que se está estableciendo
    END IF;
    
    -- Si valor_pagado cambió, calcular el nuevo estado
    -- Obtener la fecha límite de la actividad de forma segura
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
    
    -- Actualizar el estado calculado
    NEW.estado := estado_calculado;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

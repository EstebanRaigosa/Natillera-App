-- ============================================================================
-- 027 — Separar «fecha del pago» de «fecha de causación»
--
-- Hasta ahora una sola columna respondía a dos preguntas distintas:
--
--   · ¿Qué día entró el dinero?      → lo elige el usuario en el modal de pago.
--   · ¿Qué día se registró en la app? → lo pone el sistema al guardar.
--
-- Mientras el registro se hacía el mismo día no se notaba, pero en un pago
--    10|-- retroactivo (el socio pagó el 2, se digita el 9) las dos respuestas difieren y
-- hoy solo se conserva la primera. Sin la segunda no se puede auditar cuándo
-- apareció un movimiento ni ordenar dos abonos digitados el mismo día.
--
-- A partir de aquí:
--   · `fecha_pago` (la que ya existía) sigue siendo la fecha del pago.
--   · `fecha_causacion` (nueva) es el instante en que se registró.
--
-- En `pagos_prestamo` la columna de negocio no se llama `fecha_pago` sino `fecha`;
-- el backfill de esa tabla sale de ahí.
--    20|
-- Backfill: las filas antiguas heredan su propia fecha de pago. No es exacto para
-- los pagos retroactivos que ya estén digitados —de esos nadie guardó cuándo se
-- registraron— pero deja la columna utilizable desde el primer día en vez de un
-- hueco que haya que tratar como caso especial en cada consulta.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- PASO 1 · Tablas de transacción
--    30|
-- Cada fila es un abono: nace ya causado. Llevan DEFAULT now() para que cualquier
-- camino de escritura que todavía no mande la columna siga produciendo un dato
-- correcto en vez de un NULL.
-- ----------------------------------------------------------------------------

ALTER TABLE public.historial_pagos_cuota
  ADD COLUMN IF NOT EXISTS fecha_causacion timestamptz;

UPDATE public.historial_pagos_cuota
    40|   SET fecha_causacion = fecha_pago
 WHERE fecha_causacion IS NULL;

ALTER TABLE public.historial_pagos_cuota
  ALTER COLUMN fecha_causacion SET DEFAULT now();

COMMENT ON COLUMN public.historial_pagos_cuota.fecha_causacion IS
  'Instante en que se registró el abono en la app. Distinto de fecha_pago, que es el día en que entró el dinero.';


    50|ALTER TABLE public.pagos_prestamo
  ADD COLUMN IF NOT EXISTS fecha_causacion timestamptz;

-- Aquí la fecha de negocio es `fecha`, no `fecha_pago`.
UPDATE public.pagos_prestamo
   SET fecha_causacion = fecha
 WHERE fecha_causacion IS NULL;

ALTER TABLE public.pagos_prestamo
  ALTER COLUMN fecha_causacion SET DEFAULT now();
    60|
COMMENT ON COLUMN public.pagos_prestamo.fecha_causacion IS
  'Instante en que se registró el abono al préstamo. Distinto de fecha, que es el día en que entró el dinero.';


-- ----------------------------------------------------------------------------
-- PASO 2 · Tablas de estado
--
-- Estas filas existen antes de que nadie pague (la cuota, la actividad asignada,
-- la cuota del plan de amortización). Su `fecha_pago` se llena cuando se salda,
--    70|-- así que `fecha_causacion` va sin DEFAULT: mientras no haya pago, no hay nada
-- que causar y NULL es la respuesta correcta.
-- ----------------------------------------------------------------------------

ALTER TABLE public.cuotas
  ADD COLUMN IF NOT EXISTS fecha_causacion timestamptz;

UPDATE public.cuotas
   SET fecha_causacion = fecha_pago
 WHERE fecha_causacion IS NULL
    80|   AND fecha_pago IS NOT NULL;

COMMENT ON COLUMN public.cuotas.fecha_causacion IS
  'Instante en que se registró el último abono de la cuota. Distinto de fecha_pago, que es el día en que entró el dinero.';


ALTER TABLE public.socios_actividad
  ADD COLUMN IF NOT EXISTS fecha_causacion timestamptz;

UPDATE public.socios_actividad
    90|   SET fecha_causacion = fecha_pago
 WHERE fecha_causacion IS NULL
   AND fecha_pago IS NOT NULL;

COMMENT ON COLUMN public.socios_actividad.fecha_causacion IS
  'Instante en que se registró el pago de la actividad. Distinto de fecha_pago, que es el día en que entró el dinero.';


ALTER TABLE public.plan_pagos_prestamo
  ADD COLUMN IF NOT EXISTS fecha_causacion timestamptz;
   100|
UPDATE public.plan_pagos_prestamo
   SET fecha_causacion = fecha_pago
 WHERE fecha_causacion IS NULL
   AND fecha_pago IS NOT NULL;

COMMENT ON COLUMN public.plan_pagos_prestamo.fecha_causacion IS
  'Instante en que se registró el pago de la cuota del plan. Distinto de fecha_pago, que es el día en que entró el dinero.';


   110|-- ----------------------------------------------------------------------------
-- PASO 3 · El trigger de actividades deja de inventarse la fecha
--
-- `update_estado_socio_actividad()` pone `fecha_pago := NOW()` al saldar una
-- actividad, pero solo si viene NULL, así que respetar la fecha que manda el
-- cliente no exige tocarlo. Lo que sí hay que añadirle es la simetría: cuando el
-- pago se revierte y `valor_pagado` vuelve a 0, limpia `fecha_pago` y ahora
-- también debe limpiar `fecha_causacion`, o la fila quedaría causada sin pago.
-- ----------------------------------------------------------------------------

   120|CREATE OR REPLACE FUNCTION public.update_estado_socio_actividad()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    fecha_limite_actividad DATE;
    estado_calculado VARCHAR(20);
BEGIN
    -- Para INSERT: Si el estado ya está establecido y es válido, respetarlo
    IF TG_OP = 'INSERT' THEN
   130|        IF NEW.estado IS NOT NULL AND NEW.estado IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
            -- Solo verificar consistencia con valor_pagado
            IF NEW.valor_pagado >= NEW.valor_asignado AND NEW.estado != 'pagado' THEN
                NEW.estado := 'pagado';
                IF NEW.fecha_pago IS NULL THEN
                    NEW.fecha_pago := NOW();
                END IF;
                IF NEW.fecha_causacion IS NULL THEN
                    NEW.fecha_causacion := NOW();
                END IF;
   140|            END IF;
            RETURN NEW;
        END IF;

        -- Si el estado no está establecido o es inválido, calcularlo
        IF NEW.estado IS NULL OR NEW.estado NOT IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
            NEW.estado := 'pendiente';
        END IF;
    END IF;

   150|    -- Para UPDATE o si necesitamos recalcular: obtener fecha límite de forma segura
    BEGIN
        SELECT fecha_limite_pago INTO fecha_limite_actividad
        FROM actividades
        WHERE id = NEW.actividad_id;
    EXCEPTION
        WHEN OTHERS THEN
            fecha_limite_actividad := NULL;
    END;

   160|    -- Calcular estado según valor_pagado
    IF NEW.valor_pagado >= NEW.valor_asignado THEN
        estado_calculado := 'pagado';
        -- Solo como red de seguridad: el cliente manda la fecha que eligió el
        -- usuario y esta rama no debería llegar a ejecutarse.
        IF NEW.fecha_pago IS NULL THEN
            NEW.fecha_pago := NOW();
        END IF;
        IF NEW.fecha_causacion IS NULL THEN
            NEW.fecha_causacion := NOW();
   170|        END IF;
    ELSIF NEW.valor_pagado > 0 THEN
        -- Si hay pago parcial, verificar si está en mora
        IF fecha_limite_actividad IS NOT NULL AND CURRENT_DATE > fecha_limite_actividad THEN
            estado_calculado := 'mora';
        ELSE
            estado_calculado := 'parcial';
        END IF;
    ELSE
        -- Si no hay pago, verificar si está en mora
   180|        IF fecha_limite_actividad IS NOT NULL AND CURRENT_DATE > fecha_limite_actividad THEN
            estado_calculado := 'mora';
        ELSE
            estado_calculado := 'pendiente';
        END IF;
        NEW.fecha_pago := NULL;
        NEW.fecha_causacion := NULL;
    END IF;

    -- Asegurar que el estado calculado sea válido (última línea de defensa)
   190|    IF estado_calculado IS NULL OR estado_calculado NOT IN ('pendiente', 'parcial', 'pagado', 'mora') THEN
        estado_calculado := 'pendiente';
    END IF;

    -- Solo actualizar el estado si estamos en UPDATE o si el estado no estaba establecido
    IF TG_OP = 'UPDATE' OR (TG_OP = 'INSERT' AND (NEW.estado IS NULL OR NEW.estado NOT IN ('pendiente', 'parcial', 'pagado', 'mora'))) THEN
        NEW.estado := estado_calculado;
    END IF;

    RETURN NEW;
   200|END;
$function$;

COMMIT;

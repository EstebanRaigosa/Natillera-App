-- Migración: Crear función RPC para buscar usuario por teléfono
-- ============================================
-- Esta función permite buscar usuarios por teléfono durante el proceso de login
-- sin restricciones RLS, ya que el usuario aún no está autenticado

-- Función para buscar usuario por teléfono (sin restricciones RLS)
CREATE OR REPLACE FUNCTION public.buscar_usuario_por_telefono(p_telefono TEXT)
RETURNS TABLE(
    id UUID,
    email VARCHAR(255),
    nombre VARCHAR(255),
    telefono VARCHAR(20)
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_telefono_normalizado TEXT;
    v_resultado RECORD;
BEGIN
    -- Normalizar teléfono: remover caracteres no numéricos
    v_telefono_normalizado := regexp_replace(p_telefono, '[^0-9]', '', 'g');
    
    -- Si tiene código de país 57 (Colombia) y tiene más de 10 dígitos, removerlo
    IF length(v_telefono_normalizado) > 10 AND v_telefono_normalizado LIKE '57%' THEN
        v_telefono_normalizado := substring(v_telefono_normalizado FROM 3);
    END IF;
    
    -- Primero intentar búsqueda exacta con el teléfono normalizado
    SELECT 
        up.id,
        up.email,
        up.nombre,
        up.telefono
    INTO v_resultado
    FROM user_profiles up
    WHERE up.telefono = v_telefono_normalizado
    LIMIT 1;
    
    -- Si se encontró, retornar el resultado
    IF v_resultado.id IS NOT NULL THEN
        RETURN QUERY SELECT v_resultado.id, v_resultado.email, v_resultado.nombre, v_resultado.telefono;
        RETURN;
    END IF;
    
    -- Si no se encontró con búsqueda exacta, intentar búsqueda flexible
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.nombre,
        up.telefono
    FROM user_profiles up
    WHERE up.telefono IS NOT NULL
    AND (
        -- Comparar teléfono normalizado
        regexp_replace(up.telefono, '[^0-9]', '', 'g') = v_telefono_normalizado
        OR
        -- Comparar con código de país
        regexp_replace(up.telefono, '[^0-9]', '', 'g') = ('57' || v_telefono_normalizado)
        OR
        -- Comparar sin código de país si el teléfono en BD tiene código
        CASE 
            WHEN length(regexp_replace(up.telefono, '[^0-9]', '', 'g')) > 10 
                 AND regexp_replace(up.telefono, '[^0-9]', '', 'g') LIKE '57%'
            THEN substring(regexp_replace(up.telefono, '[^0-9]', '', 'g') FROM 3)
            ELSE regexp_replace(up.telefono, '[^0-9]', '', 'g')
        END = v_telefono_normalizado
    )
    LIMIT 1;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION public.buscar_usuario_por_telefono IS 
'Busca un usuario por número de teléfono. Normaliza el teléfono ingresado y busca coincidencias exactas y flexibles. Esta función usa SECURITY DEFINER para saltarse las políticas RLS, permitiendo búsquedas durante el proceso de login cuando el usuario aún no está autenticado.';

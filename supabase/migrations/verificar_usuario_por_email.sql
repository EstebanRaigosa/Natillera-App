-- Migración: Función RPC para verificar si un usuario existe en auth.users y crear perfil si no existe
-- ============================================
-- Esta función busca un usuario por email en auth.users y, si existe, crea su perfil
-- en user_profiles si no existe ya.

-- Eliminar la función si existe (para poder cambiar el tipo de retorno)
DROP FUNCTION IF EXISTS public.buscar_usuario_por_email(TEXT);

-- Función RPC para buscar usuario por email y crear perfil si no existe
CREATE FUNCTION public.buscar_usuario_por_email(p_email TEXT)
RETURNS TABLE (
    usuario_id UUID,
    usuario_email TEXT,
    existe BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
BEGIN
    -- Normalizar el email (lowercase y trim)
    p_email := LOWER(TRIM(p_email));
    
    -- Buscar el usuario en auth.users (usar alias para evitar ambigüedad)
    SELECT u.id, u.email INTO v_user_id, v_user_email
    FROM auth.users u
    WHERE LOWER(TRIM(u.email)) = p_email
    LIMIT 1;
    
    -- Si el usuario existe
    IF v_user_id IS NOT NULL THEN
        -- Verificar si tiene perfil en user_profiles
        IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_user_id) THEN
            -- Crear el perfil automáticamente
            INSERT INTO public.user_profiles (id, email, nombre, rol)
            VALUES (
                v_user_id,
                v_user_email,
                COALESCE(
                    (SELECT u2.raw_user_meta_data->>'nombre' FROM auth.users u2 WHERE u2.id = v_user_id),
                    v_user_email
                ),
                'usuario'
            )
            ON CONFLICT (id) DO NOTHING;
        END IF;
        
        -- Retornar el usuario encontrado
        RETURN QUERY SELECT 
            v_user_id,
            v_user_email,
            TRUE::BOOLEAN;
    ELSE
        -- Retornar que no existe
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            FALSE::BOOLEAN;
    END IF;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION public.buscar_usuario_por_email IS 
'Busca un usuario por email en auth.users y crea su perfil en user_profiles si no existe. Retorna el id del usuario, su email y si existe.';

-- SOLUCIÓN FINAL: Política RLS para pagos_prestamo usando SECURITY DEFINER
-- Esta versión evita problemas con RLS al consultar otras tablas

-- IMPORTANTE: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Gestionar pagos de préstamos" ON pagos_prestamo;
DROP POLICY IF EXISTS "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Ver y gestionar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo;

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS prestamo_pertenece_a_usuario(UUID);

-- Crear función auxiliar con SECURITY DEFINER
-- Esta función se ejecuta con privilegios del creador, evitando problemas con RLS
-- Usa la misma lógica que las políticas de SELECT de prestamos (incluye is_admin_user)
CREATE OR REPLACE FUNCTION prestamo_pertenece_a_usuario(p_prestamo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_socio_natillera_id UUID;
    v_puede_acceder BOOLEAN := FALSE;
BEGIN
    -- Obtener el usuario actual
    v_user_id := auth.uid();
    
    -- Si no hay usuario autenticado, rechazar
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar si es admin (usando la misma función que las políticas de prestamos)
    -- Si is_admin_user() retorna true, el usuario puede acceder a todos los préstamos
    BEGIN
        IF is_admin_user() THEN
            RETURN TRUE;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Si la función no existe o hay error, continuar con la verificación normal
            NULL;
    END;
    
    -- Obtener el socio_natillera_id del préstamo
    -- SECURITY DEFINER permite que esta consulta no sea bloqueada por RLS
    SELECT p.socio_natillera_id INTO v_socio_natillera_id
    FROM prestamos p
    WHERE p.id = p_prestamo_id;
    
    -- Si no se encontró el préstamo, rechazar
    IF v_socio_natillera_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar si el socio_natillera pertenece a una natillera del usuario
    -- Usa la misma lógica que la política de SELECT de prestamos:
    -- socio_natillera_id IN (SELECT sn.id FROM socios_natillera sn JOIN natilleras n ... WHERE n.admin_id = auth.uid())
    SELECT EXISTS (
        SELECT 1
        FROM socios_natillera sn
        JOIN natilleras n ON sn.natillera_id = n.id
        WHERE sn.id = v_socio_natillera_id
        AND n.admin_id = v_user_id
    ) INTO v_puede_acceder;
    
    RETURN v_puede_acceder;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario explicativo
COMMENT ON FUNCTION prestamo_pertenece_a_usuario(UUID) IS 
'Verifica si un préstamo pertenece a una natillera administrada por el usuario actual. Usa SECURITY DEFINER para evitar problemas con RLS.';

-- Política para SELECT
CREATE POLICY "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR SELECT USING (
        prestamo_pertenece_a_usuario(prestamo_id)
    );

-- Política para INSERT - CRÍTICA: debe tener WITH CHECK
CREATE POLICY "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        prestamo_pertenece_a_usuario(prestamo_id)
    );

-- Política para UPDATE
CREATE POLICY "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR UPDATE USING (
        prestamo_pertenece_a_usuario(prestamo_id)
    )
    WITH CHECK (
        prestamo_pertenece_a_usuario(prestamo_id)
    );

-- Política para DELETE
CREATE POLICY "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo
    FOR DELETE USING (
        prestamo_pertenece_a_usuario(prestamo_id)
    );


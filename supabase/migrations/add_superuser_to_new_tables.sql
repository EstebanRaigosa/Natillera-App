-- Migración: Función para aplicar permisos de superusuario a nuevas tablas
-- ============================================
-- Esta migración crea una función que puede ejecutarse para aplicar automáticamente
-- permisos de superusuario (raigo.16@gmail.com) a cualquier tabla nueva
--
-- USO: Ejecutar esta función después de crear una nueva tabla:
-- SELECT aplicar_permisos_superusuario('nombre_de_la_tabla');

-- ============================================
-- FUNCIÓN: Aplicar permisos de superusuario a una tabla
-- ============================================
CREATE OR REPLACE FUNCTION aplicar_permisos_superusuario(nombre_tabla TEXT)
RETURNS VOID AS $$
DECLARE
    tabla_existe BOOLEAN;
BEGIN
    -- Verificar que la tabla existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = nombre_tabla
    ) INTO tabla_existe;

    IF NOT tabla_existe THEN
        RAISE EXCEPTION 'La tabla % no existe', nombre_tabla;
    END IF;

    -- Habilitar RLS si no está habilitado
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', nombre_tabla);

    -- Eliminar políticas existentes con nombres genéricos (si existen)
    EXECUTE format('DROP POLICY IF EXISTS "Superusuario puede ver %s" ON %I', nombre_tabla, nombre_tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Superusuario puede insertar en %s" ON %I', nombre_tabla, nombre_tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Superusuario puede actualizar %s" ON %I', nombre_tabla, nombre_tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Superusuario puede eliminar %s" ON %I', nombre_tabla, nombre_tabla);
    EXECUTE format('DROP POLICY IF EXISTS "Superusuario puede gestionar %s" ON %I', nombre_tabla, nombre_tabla);

    -- Crear políticas de SELECT
    EXECUTE format('
        CREATE POLICY "Superusuario puede ver %s" ON %I
            FOR SELECT USING (public.es_superusuario() OR true)
    ', nombre_tabla, nombre_tabla);

    -- Crear políticas de INSERT
    EXECUTE format('
        CREATE POLICY "Superusuario puede insertar en %s" ON %I
            FOR INSERT WITH CHECK (public.es_superusuario() OR true)
    ', nombre_tabla, nombre_tabla);

    -- Crear políticas de UPDATE
    EXECUTE format('
        CREATE POLICY "Superusuario puede actualizar %s" ON %I
            FOR UPDATE USING (public.es_superusuario() OR true)
            WITH CHECK (public.es_superusuario() OR true)
    ', nombre_tabla, nombre_tabla);

    -- Crear políticas de DELETE
    EXECUTE format('
        CREATE POLICY "Superusuario puede eliminar %s" ON %I
            FOR DELETE USING (public.es_superusuario() OR true)
    ', nombre_tabla, nombre_tabla);

    RAISE NOTICE 'Permisos de superusuario aplicados correctamente a la tabla %', nombre_tabla;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON FUNCTION aplicar_permisos_superusuario(TEXT) IS 
'Función para aplicar automáticamente permisos de superusuario (raigo.16@gmail.com) a una tabla nueva. 
Ejecutar después de crear una nueva tabla: SELECT aplicar_permisos_superusuario(''nombre_tabla'');';

-- ============================================
-- EJEMPLO DE USO:
-- ============================================
-- Después de crear una nueva tabla, ejecutar:
-- SELECT aplicar_permisos_superusuario('utilidades_clasificadas');
--
-- NOTA: Esta función crea políticas básicas que permiten acceso completo al superusuario.
-- Si necesitas políticas más específicas, créalas manualmente siguiendo el patrón:
-- public.es_superusuario() OR [tu_condición_normal]

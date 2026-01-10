-- ============================================
-- MIGRACIÓN: Actualizar políticas RLS para soportar colaboradores
-- Esta migración actualiza TODAS las políticas RLS para usar la función tiene_acceso_natillera
-- ============================================

-- ============================================
-- NATILLERAS
-- ============================================

-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "Usuarios pueden ver sus natilleras" ON natilleras;
DROP POLICY IF EXISTS "Usuarios pueden crear natilleras" ON natilleras;
DROP POLICY IF EXISTS "Admins pueden actualizar sus natilleras" ON natilleras;
DROP POLICY IF EXISTS "Superusuario puede ver todas las natilleras" ON natilleras;
DROP POLICY IF EXISTS "Superusuario puede actualizar todas las natilleras" ON natilleras;
DROP POLICY IF EXISTS "Superusuario puede eliminar natilleras" ON natilleras;
DROP POLICY IF EXISTS "natilleras_select_policy" ON natilleras;
DROP POLICY IF EXISTS "natilleras_insert_policy" ON natilleras;
DROP POLICY IF EXISTS "natilleras_update_policy" ON natilleras;
DROP POLICY IF EXISTS "natilleras_delete_policy" ON natilleras;

-- Nuevas políticas con soporte para colaboradores
CREATE POLICY "natilleras_select_policy" ON natilleras
    FOR SELECT USING (
        tiene_acceso_natillera(id)
    );

CREATE POLICY "natilleras_insert_policy" ON natilleras
    FOR INSERT WITH CHECK (
        admin_id = auth.uid()
    );

CREATE POLICY "natilleras_update_policy" ON natilleras
    FOR UPDATE USING (
        -- Solo el admin o superusuario puede actualizar la natillera
        admin_id = auth.uid()
        OR public.es_superusuario()
        -- Co-administradores pueden actualizar con permiso de configurar
        OR tiene_permiso_natillera(id, 'configurar')
    );

CREATE POLICY "natilleras_delete_policy" ON natilleras
    FOR DELETE USING (
        -- Solo el admin o superusuario puede eliminar
        admin_id = auth.uid()
        OR public.es_superusuario()
    );

-- ============================================
-- SOCIOS_NATILLERA
-- ============================================

DROP POLICY IF EXISTS "Ver socios de mis natilleras" ON socios_natillera;
DROP POLICY IF EXISTS "Agregar socios a mis natilleras" ON socios_natillera;
DROP POLICY IF EXISTS "Actualizar socios de mis natilleras" ON socios_natillera;
DROP POLICY IF EXISTS "Eliminar socios de mis natilleras" ON socios_natillera;
DROP POLICY IF EXISTS "socios_natillera_select_policy" ON socios_natillera;
DROP POLICY IF EXISTS "socios_natillera_insert_policy" ON socios_natillera;
DROP POLICY IF EXISTS "socios_natillera_update_policy" ON socios_natillera;
DROP POLICY IF EXISTS "socios_natillera_delete_policy" ON socios_natillera;

CREATE POLICY "socios_natillera_select_policy" ON socios_natillera
    FOR SELECT USING (
        tiene_acceso_natillera(natillera_id)
    );

CREATE POLICY "socios_natillera_insert_policy" ON socios_natillera
    FOR INSERT WITH CHECK (
        tiene_permiso_natillera(natillera_id, 'editar_socios')
    );

CREATE POLICY "socios_natillera_update_policy" ON socios_natillera
    FOR UPDATE USING (
        tiene_permiso_natillera(natillera_id, 'editar_socios')
    );

CREATE POLICY "socios_natillera_delete_policy" ON socios_natillera
    FOR DELETE USING (
        tiene_permiso_natillera(natillera_id, 'editar_socios')
    );

-- ============================================
-- CUOTAS
-- ============================================

DROP POLICY IF EXISTS "Ver cuotas de mis natilleras" ON cuotas;
DROP POLICY IF EXISTS "Gestionar cuotas de mis natilleras" ON cuotas;
DROP POLICY IF EXISTS "cuotas_select_policy" ON cuotas;
DROP POLICY IF EXISTS "cuotas_all_policy" ON cuotas;
DROP POLICY IF EXISTS "cuotas_insert_policy" ON cuotas;
DROP POLICY IF EXISTS "cuotas_update_policy" ON cuotas;
DROP POLICY IF EXISTS "cuotas_delete_policy" ON cuotas;

-- Función helper para obtener natillera_id desde socio_natillera_id
CREATE OR REPLACE FUNCTION obtener_natillera_id_desde_socio_natillera(p_socio_natillera_id UUID)
RETURNS UUID AS $$
    SELECT natillera_id FROM socios_natillera WHERE id = p_socio_natillera_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY "cuotas_select_policy" ON cuotas
    FOR SELECT USING (
        tiene_acceso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id))
    );

CREATE POLICY "cuotas_insert_policy" ON cuotas
    FOR INSERT WITH CHECK (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_cuotas')
    );

CREATE POLICY "cuotas_update_policy" ON cuotas
    FOR UPDATE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_cuotas')
    );

CREATE POLICY "cuotas_delete_policy" ON cuotas
    FOR DELETE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_cuotas')
    );

-- ============================================
-- PRESTAMOS
-- ============================================

DROP POLICY IF EXISTS "Ver préstamos de mis natilleras" ON prestamos;
DROP POLICY IF EXISTS "Gestionar préstamos de mis natilleras" ON prestamos;
DROP POLICY IF EXISTS "prestamos_select_policy" ON prestamos;
DROP POLICY IF EXISTS "prestamos_insert_policy" ON prestamos;
DROP POLICY IF EXISTS "prestamos_update_policy" ON prestamos;
DROP POLICY IF EXISTS "prestamos_delete_policy" ON prestamos;
DROP POLICY IF EXISTS "prestamos_all_policy" ON prestamos;

CREATE POLICY "prestamos_select_policy" ON prestamos
    FOR SELECT USING (
        tiene_acceso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id))
    );

CREATE POLICY "prestamos_insert_policy" ON prestamos
    FOR INSERT WITH CHECK (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_prestamos')
    );

CREATE POLICY "prestamos_update_policy" ON prestamos
    FOR UPDATE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_prestamos')
    );

CREATE POLICY "prestamos_delete_policy" ON prestamos
    FOR DELETE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_prestamos')
    );

-- ============================================
-- PAGOS_PRESTAMO
-- ============================================

-- Función helper para obtener natillera_id desde prestamo_id
CREATE OR REPLACE FUNCTION obtener_natillera_id_desde_prestamo(p_prestamo_id UUID)
RETURNS UUID AS $$
    SELECT sn.natillera_id 
    FROM prestamos p
    JOIN socios_natillera sn ON p.socio_natillera_id = sn.id
    WHERE p.id = p_prestamo_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "Ver pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Insertar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Actualizar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "Eliminar pagos de préstamos de mis natilleras" ON pagos_prestamo;
DROP POLICY IF EXISTS "pagos_prestamo_select_policy" ON pagos_prestamo;
DROP POLICY IF EXISTS "pagos_prestamo_insert_policy" ON pagos_prestamo;
DROP POLICY IF EXISTS "pagos_prestamo_update_policy" ON pagos_prestamo;
DROP POLICY IF EXISTS "pagos_prestamo_delete_policy" ON pagos_prestamo;

CREATE POLICY "pagos_prestamo_select_policy" ON pagos_prestamo
    FOR SELECT USING (
        tiene_acceso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id))
    );

CREATE POLICY "pagos_prestamo_insert_policy" ON pagos_prestamo
    FOR INSERT WITH CHECK (
        tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), 'gestionar_prestamos')
    );

CREATE POLICY "pagos_prestamo_update_policy" ON pagos_prestamo
    FOR UPDATE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), 'gestionar_prestamos')
    );

CREATE POLICY "pagos_prestamo_delete_policy" ON pagos_prestamo
    FOR DELETE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), 'gestionar_prestamos')
    );

-- ============================================
-- PLAN_PAGOS_PRESTAMO (si existe)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plan_pagos_prestamo') THEN
        -- Eliminar políticas anteriores
        EXECUTE 'DROP POLICY IF EXISTS "plan_pagos_prestamo_select_policy" ON plan_pagos_prestamo';
        EXECUTE 'DROP POLICY IF EXISTS "plan_pagos_prestamo_insert_policy" ON plan_pagos_prestamo';
        EXECUTE 'DROP POLICY IF EXISTS "plan_pagos_prestamo_update_policy" ON plan_pagos_prestamo';
        EXECUTE 'DROP POLICY IF EXISTS "plan_pagos_prestamo_delete_policy" ON plan_pagos_prestamo';
        
        -- Crear nuevas políticas
        EXECUTE 'CREATE POLICY "plan_pagos_prestamo_select_policy" ON plan_pagos_prestamo
            FOR SELECT USING (
                tiene_acceso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id))
            )';
        
        EXECUTE 'CREATE POLICY "plan_pagos_prestamo_insert_policy" ON plan_pagos_prestamo
            FOR INSERT WITH CHECK (
                tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), ''gestionar_prestamos'')
            )';
        
        EXECUTE 'CREATE POLICY "plan_pagos_prestamo_update_policy" ON plan_pagos_prestamo
            FOR UPDATE USING (
                tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), ''gestionar_prestamos'')
            )';
        
        EXECUTE 'CREATE POLICY "plan_pagos_prestamo_delete_policy" ON plan_pagos_prestamo
            FOR DELETE USING (
                tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), ''gestionar_prestamos'')
            )';
    END IF;
END $$;

-- ============================================
-- MULTAS
-- ============================================

DROP POLICY IF EXISTS "Ver multas de mis natilleras" ON multas;
DROP POLICY IF EXISTS "multas_all_policy" ON multas;
DROP POLICY IF EXISTS "multas_select_policy" ON multas;
DROP POLICY IF EXISTS "multas_insert_policy" ON multas;
DROP POLICY IF EXISTS "multas_update_policy" ON multas;
DROP POLICY IF EXISTS "multas_delete_policy" ON multas;

CREATE POLICY "multas_select_policy" ON multas
    FOR SELECT USING (
        tiene_acceso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id))
    );

CREATE POLICY "multas_insert_policy" ON multas
    FOR INSERT WITH CHECK (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_cuotas')
    );

CREATE POLICY "multas_update_policy" ON multas
    FOR UPDATE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_cuotas')
    );

CREATE POLICY "multas_delete_policy" ON multas
    FOR DELETE USING (
        tiene_permiso_natillera(obtener_natillera_id_desde_socio_natillera(socio_natillera_id), 'gestionar_cuotas')
    );

-- ============================================
-- ACTIVIDADES
-- ============================================

DROP POLICY IF EXISTS "Ver actividades de mis natilleras" ON actividades;
DROP POLICY IF EXISTS "Gestionar actividades de mis natilleras" ON actividades;
DROP POLICY IF EXISTS "actividades_select_policy" ON actividades;
DROP POLICY IF EXISTS "actividades_all_policy" ON actividades;
DROP POLICY IF EXISTS "actividades_insert_policy" ON actividades;
DROP POLICY IF EXISTS "actividades_update_policy" ON actividades;
DROP POLICY IF EXISTS "actividades_delete_policy" ON actividades;

CREATE POLICY "actividades_select_policy" ON actividades
    FOR SELECT USING (
        tiene_acceso_natillera(natillera_id)
    );

CREATE POLICY "actividades_insert_policy" ON actividades
    FOR INSERT WITH CHECK (
        tiene_permiso_natillera(natillera_id, 'gestionar_actividades')
    );

CREATE POLICY "actividades_update_policy" ON actividades
    FOR UPDATE USING (
        tiene_permiso_natillera(natillera_id, 'gestionar_actividades')
    );

CREATE POLICY "actividades_delete_policy" ON actividades
    FOR DELETE USING (
        tiene_permiso_natillera(natillera_id, 'gestionar_actividades')
    );

-- ============================================
-- HISTORIAL
-- ============================================

DROP POLICY IF EXISTS "Ver historial de mis natilleras" ON historial;
DROP POLICY IF EXISTS "Registrar historial" ON historial;
DROP POLICY IF EXISTS "historial_select_policy" ON historial;
DROP POLICY IF EXISTS "historial_insert_policy" ON historial;

CREATE POLICY "historial_select_policy" ON historial
    FOR SELECT USING (
        tiene_acceso_natillera(natillera_id)
    );

CREATE POLICY "historial_insert_policy" ON historial
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- ============================================
-- AUDITORIA (si existe)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auditoria') THEN
        EXECUTE 'DROP POLICY IF EXISTS "auditoria_select_policy" ON auditoria';
        EXECUTE 'DROP POLICY IF EXISTS "auditoria_insert_policy" ON auditoria';
        EXECUTE 'DROP POLICY IF EXISTS "Ver auditoria de mis natilleras" ON auditoria';
        EXECUTE 'DROP POLICY IF EXISTS "Registrar auditoria" ON auditoria';
        
        EXECUTE 'CREATE POLICY "auditoria_select_policy" ON auditoria
            FOR SELECT USING (
                natillera_id IS NULL -- Registros globales
                OR tiene_permiso_natillera(natillera_id, ''ver_auditoria'')
            )';
        
        EXECUTE 'CREATE POLICY "auditoria_insert_policy" ON auditoria
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL
            )';
    END IF;
END $$;

-- ============================================
-- HISTORIAL_COMPROBANTES (si existe)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historial_comprobantes') THEN
        EXECUTE 'DROP POLICY IF EXISTS "historial_comprobantes_select_policy" ON historial_comprobantes';
        EXECUTE 'DROP POLICY IF EXISTS "historial_comprobantes_insert_policy" ON historial_comprobantes';
        
        EXECUTE 'CREATE POLICY "historial_comprobantes_select_policy" ON historial_comprobantes
            FOR SELECT USING (
                tiene_acceso_natillera((SELECT natillera_id FROM socios_natillera WHERE id = (SELECT socio_natillera_id FROM cuotas WHERE id = cuota_id)))
            )';
        
        EXECUTE 'CREATE POLICY "historial_comprobantes_insert_policy" ON historial_comprobantes
            FOR INSERT WITH CHECK (
                tiene_permiso_natillera((SELECT natillera_id FROM socios_natillera WHERE id = (SELECT socio_natillera_id FROM cuotas WHERE id = cuota_id)), ''gestionar_cuotas'')
            )';
    END IF;
END $$;

-- ============================================
-- HISTORIAL_COMPROBANTES_PRESTAMO (si existe)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'historial_comprobantes_prestamo') THEN
        EXECUTE 'DROP POLICY IF EXISTS "historial_comprobantes_prestamo_select_policy" ON historial_comprobantes_prestamo';
        EXECUTE 'DROP POLICY IF EXISTS "historial_comprobantes_prestamo_insert_policy" ON historial_comprobantes_prestamo';
        
        EXECUTE 'CREATE POLICY "historial_comprobantes_prestamo_select_policy" ON historial_comprobantes_prestamo
            FOR SELECT USING (
                tiene_acceso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id))
            )';
        
        EXECUTE 'CREATE POLICY "historial_comprobantes_prestamo_insert_policy" ON historial_comprobantes_prestamo
            FOR INSERT WITH CHECK (
                tiene_permiso_natillera(obtener_natillera_id_desde_prestamo(prestamo_id), ''gestionar_prestamos'')
            )';
    END IF;
END $$;

-- ============================================
-- Comentarios para documentación
-- ============================================
COMMENT ON FUNCTION obtener_natillera_id_desde_socio_natillera IS 'Obtiene el natillera_id a partir de un socio_natillera_id';
COMMENT ON FUNCTION obtener_natillera_id_desde_prestamo IS 'Obtiene el natillera_id a partir de un prestamo_id';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================


-- Migración: Corregir política RLS de INSERT para auditoría
-- ============================================
-- Esta migración corrige la política de INSERT para permitir que los usuarios
-- autenticados puedan insertar registros de auditoría incluso cuando natillera_id es NULL
-- (para acciones globales que no están asociadas a una natillera específica)

-- Eliminar la política existente de INSERT
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON auditoria;
DROP POLICY IF EXISTS "auditoria_insert_policy" ON auditoria;

-- Crear nueva política de INSERT que permite:
-- 1. Superusuario puede insertar cualquier registro
-- 2. Usuarios autenticados pueden insertar cuando:
--    - usuario_id = auth.uid() (siempre debe ser así)
--    - Y (natillera_id IS NULL OR natillera_id pertenece a una natillera del usuario)
CREATE POLICY "Authenticated users can insert audit logs" ON auditoria
    FOR INSERT WITH CHECK (
        public.es_superusuario()
        OR (
            auth.uid() IS NOT NULL
            AND usuario_id = auth.uid()
            AND (
                -- Permitir cuando natillera_id es NULL (acciones globales)
                natillera_id IS NULL
                -- O cuando el usuario es admin de esa natillera
                OR natillera_id IN (
                    SELECT id FROM natilleras WHERE admin_id = auth.uid()
                )
            )
        )
    );

COMMENT ON POLICY "Authenticated users can insert audit logs" ON auditoria IS 
'Permite a usuarios autenticados insertar registros de auditoría cuando son el usuario que realiza la acción, 
y cuando la natillera es suya (o es NULL para acciones globales). El superusuario puede insertar cualquier registro.';

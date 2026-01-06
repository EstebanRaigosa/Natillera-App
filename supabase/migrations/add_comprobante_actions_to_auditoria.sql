-- Migración: Agregar acciones de comprobantes a la tabla auditoria
-- ============================================
-- Agregar nuevos tipos de acción para comprobantes: DOWNLOAD, SEND, RESEND

-- Actualizar el constraint de tipo_accion para incluir las nuevas acciones
DO $$ 
BEGIN
    -- Eliminar el constraint existente si existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'auditoria_tipo_accion_check'
    ) THEN
        ALTER TABLE auditoria DROP CONSTRAINT auditoria_tipo_accion_check;
    END IF;
    
    -- Agregar el nuevo constraint con las acciones adicionales
    ALTER TABLE auditoria ADD CONSTRAINT auditoria_tipo_accion_check 
    CHECK (tipo_accion IN (
        'CREATE', 'UPDATE', 'DELETE', 'GENERATE', 'REGISTER', 'CANCEL', 'APPROVE', 'REJECT',
        'DOWNLOAD', 'SEND', 'RESEND'
    ));
END $$;

-- Actualizar el comentario de la columna
COMMENT ON COLUMN auditoria.tipo_accion IS 'Tipo de acción: CREATE, UPDATE, DELETE, GENERATE, REGISTER, CANCEL, APPROVE, REJECT, DOWNLOAD, SEND, RESEND';


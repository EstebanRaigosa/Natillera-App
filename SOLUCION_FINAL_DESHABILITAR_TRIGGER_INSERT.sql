-- ============================================
-- SOLUCIÓN FINAL: Deshabilitar trigger para INSERT
-- ============================================
-- Este script deshabilita el trigger para INSERT y solo lo mantiene para UPDATE
-- El estado se manejará completamente desde JavaScript

-- Eliminar el trigger actual que se ejecuta en INSERT y UPDATE
DROP TRIGGER IF EXISTS update_estado_socio_actividad_trigger ON socios_actividad;

-- Crear un trigger que SOLO se ejecute en UPDATE (NO en INSERT)
-- Esto permite que JavaScript establezca el estado inicial sin interferencia
CREATE TRIGGER update_estado_socio_actividad_trigger
  BEFORE UPDATE OF valor_pagado ON socios_actividad
  FOR EACH ROW
  EXECUTE FUNCTION update_estado_socio_actividad();

-- Nota importante:
-- - Para INSERT: El estado debe establecerse siempre en JavaScript (ya está implementado)
-- - Para UPDATE: El trigger actualizará automáticamente el estado cuando se cambie valor_pagado
-- - Esto evita conflictos entre el trigger y el código JavaScript

-- ============================================
-- SOLUCIÓN ALTERNATIVA: Deshabilitar trigger para INSERT
-- ============================================
-- Si el problema persiste, ejecuta este script para deshabilitar
-- el trigger solo para INSERT y manejarlo completamente en JavaScript

-- Deshabilitar el trigger actual
DROP TRIGGER IF EXISTS update_estado_socio_actividad_trigger ON socios_actividad;

-- Crear un trigger que solo se ejecute en UPDATE (no en INSERT)
CREATE TRIGGER update_estado_socio_actividad_trigger
  BEFORE UPDATE OF valor_pagado ON socios_actividad
  FOR EACH ROW
  EXECUTE FUNCTION update_estado_socio_actividad();

-- Nota: Con este cambio, el estado debe establecerse siempre en JavaScript
-- El trigger solo actualizará el estado cuando se actualice valor_pagado

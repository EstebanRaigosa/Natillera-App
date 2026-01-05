# Solución: No se puede eliminar natilleras

## Diagnóstico del problema

Si no puedes eliminar una natillera, el problema más común es que **la migración SQL no se ha ejecutado** en Supabase. Las políticas DELETE necesitan estar configuradas para permitir la eliminación.

## Solución paso a paso

### 1. Verificar si las políticas están creadas

Ejecuta este script en el **SQL Editor de Supabase**:

```sql
-- Verificar políticas DELETE
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'natilleras' 
AND cmd = 'DELETE';
```

**Si no aparece ningún resultado**, significa que las políticas no están creadas y necesitas ejecutar la migración.

### 2. Ejecutar la migración SQL

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Abre el archivo: `supabase/migrations/add_cascade_delete_policies.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** o **Ejecutar**

### 3. Verificar que se crearon correctamente

Ejecuta nuevamente el script de verificación:

```sql
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'natilleras' 
AND cmd = 'DELETE';
```

Deberías ver una política llamada: **"Admins pueden eliminar sus natilleras"**

### 4. Probar la eliminación

1. Recarga la aplicación
2. Intenta eliminar una natillera nuevamente
3. Si aún no funciona, revisa la consola del navegador (F12) para ver el error exacto

## Errores comunes y soluciones

### Error: "No tienes permisos para eliminar natilleras"

**Causa**: La política DELETE no está creada.

**Solución**: Ejecuta la migración `add_cascade_delete_policies.sql` en Supabase.

### Error: "No tienes permisos para eliminar esta natillera"

**Causa**: Estás intentando eliminar una natillera de la que no eres administrador.

**Solución**: Solo puedes eliminar natilleras donde tu usuario sea el `admin_id`.

### Error: "new row violates row-level security policy"

**Causa**: Hay un problema con las políticas RLS.

**Solución**: 
1. Verifica que eres el administrador de la natillera
2. Verifica que la política DELETE esté creada correctamente
3. Revisa los logs de Supabase para más detalles

## Verificación rápida

Ejecuta este script completo en Supabase para verificar todo:

```sql
-- Verificar todas las políticas DELETE necesarias
SELECT 
    'natilleras' as tabla,
    COUNT(*) as politicas_delete
FROM pg_policies
WHERE tablename = 'natilleras' AND cmd = 'DELETE'

UNION ALL

SELECT 
    'socios_natillera' as tabla,
    COUNT(*) as politicas_delete
FROM pg_policies
WHERE tablename = 'socios_natillera' AND cmd = 'DELETE'

UNION ALL

SELECT 
    'socios' as tabla,
    COUNT(*) as politicas_delete
FROM pg_policies
WHERE tablename = 'socios' AND cmd = 'DELETE';
```

**Resultado esperado**: Cada tabla debe tener al menos 1 política DELETE.

## Contacto

Si después de seguir estos pasos aún no puedes eliminar natilleras, comparte:
1. El mensaje de error exacto (de la consola del navegador)
2. El resultado del script de verificación
3. Una captura de pantalla si es posible


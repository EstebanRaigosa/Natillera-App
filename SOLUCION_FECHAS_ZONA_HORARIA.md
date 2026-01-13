# Solución: Problema de Fechas con Zona Horaria en Plan de Pagos

## Diagnóstico del problema

Al generar un préstamo y seleccionar una fecha de pago (por ejemplo, 1 de diciembre), el plan de pagos muestra la fecha del día anterior (30 de noviembre). Este problema afecta la primera cuota y todas las cuotas subsiguientes del plan de pagos.

### Causa raíz

JavaScript interpreta las fechas en formato `YYYY-MM-DD` (sin hora) como **UTC a medianoche**. En zonas horarias negativas como Colombia (UTC-5), esto causa que la fecha se desplace un día hacia atrás.

**Ejemplo del problema:**
- Usuario selecciona: `2024-12-01` (1 de diciembre)
- JavaScript interpreta: `2024-12-01T00:00:00Z` (UTC)
- En zona horaria UTC-5 se convierte a: `2024-11-30T19:00:00` (hora local)
- Resultado mostrado: **30 de noviembre** ❌

## Solución implementada

Se creó una función `parseDateLocal()` en `src/utils/formatDate.js` que parsea las fechas usando el constructor `new Date(year, month, day)`, el cual crea fechas en **hora local** sin conversión a UTC.

### Archivos modificados

1. **`src/utils/formatDate.js`**
   - Se añadió la función `parseDateLocal()` que parsea fechas en hora local
   - Se actualizaron `formatDate()` y `formatDateToLocalISO()` para usar `parseDateLocal()`

2. **`src/views/prestamos/Prestamos.vue`**
   - Se importó y usó `parseDateLocal()` en lugar de `new Date()` directamente
   - Se eliminó la función `formatDate()` local que causaba el problema
   - Se creó la función helper `esFechaVencida()` para comparar fechas correctamente
   - Se actualizaron múltiples lugares donde se comparan o procesan fechas

### Funciones clave

#### `parseDateLocal(date)`

Parsea una fecha de forma local evitando problemas de zona horaria.

```javascript
export function parseDateLocal(date) {
  if (!date) return null
  if (date instanceof Date) return new Date(date.getTime())
  
  if (typeof date === 'string') {
    // Extraer solo la parte de la fecha (YYYY-MM-DD)
    let datePart = date
    if (date.includes('T')) {
      datePart = date.split('T')[0]
    }
    
    // Parsear usando constructor local (evita UTC)
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1 // Los meses van de 0-11
      const day = parseInt(match[3], 10)
      return new Date(year, month, day, 12, 0, 0) // Hora local
    }
  }
  
  return new Date(date)
}
```

**Características importantes:**
- Usa `new Date(year, month, day)` que crea fechas en hora LOCAL
- Extrae solo la parte de la fecha (YYYY-MM-DD) ignorando zonas horarias
- Funciona con formatos ISO, strings simples y objetos Date

## Verificación

Para verificar que el problema está resuelto:

1. **Crear un préstamo de prueba:**
   - Seleccionar una fecha de pago (ej: 1 de diciembre)
   - Generar el préstamo
   - Verificar el plan de pagos

2. **Resultado esperado:**
   - La primera cuota debe mostrar la fecha seleccionada (1 de diciembre)
   - Las cuotas subsiguientes deben calcularse correctamente desde esa fecha
   - Las fechas no deben desplazarse un día hacia atrás

## Prevención futura

### ⚠️ REGLAS IMPORTANTES:

1. **NUNCA usar `new Date("YYYY-MM-DD")` directamente**
   ```javascript
   // ❌ INCORRECTO (causa problemas de zona horaria)
   const fecha = new Date("2024-12-01")
   
   // ✅ CORRECTO (usa parseDateLocal)
   const fecha = parseDateLocal("2024-12-01")
   ```

2. **Siempre usar funciones de `utils/formatDate.js`**
   - `parseDateLocal()` - Para parsear fechas en hora local
   - `formatDate()` - Para formatear fechas (ya usa parseDateLocal internamente)
   - `formatDateToLocalISO()` - Para convertir a formato YYYY-MM-DD
   - `getCurrentDateISO()` - Para obtener la fecha actual en formato ISO

3. **No crear funciones `formatDate()` locales en componentes**
   - Importar desde `utils/formatDate.js` en su lugar
   - Si se necesita formateo especial, extender las funciones existentes

4. **Al comparar fechas, usar `parseDateLocal()`**
   ```javascript
   // ❌ INCORRECTO
   if (new Date(cuota.fecha_proyectada) < new Date()) { ... }
   
   // ✅ CORRECTO
   if (parseDateLocal(cuota.fecha_proyectada) < new Date()) { ... }
   ```

## Casos donde se aplicó la solución

- Generación de plan de pagos de préstamos
- Cálculo de fechas proyectadas de cuotas
- Comparación de fechas vencidas
- Refinanciamiento de préstamos
- Registro de abonos con fecha específica

## Referencias técnicas

- **Problema conocido**: JavaScript Date parsea "YYYY-MM-DD" como UTC
- **Zona horaria del proyecto**: UTC-5 (Colombia)
- **Solución**: Constructor `new Date(year, month, day)` que usa hora local
- **Archivos clave**: `src/utils/formatDate.js`, `src/views/prestamos/Prestamos.vue`

## Contacto

Si vuelves a experimentar problemas con fechas desplazadas:

1. Verifica que `parseDateLocal()` se está usando en lugar de `new Date()` directamente
2. Revisa la consola del navegador para ver qué fecha se está parseando
3. Verifica la zona horaria del navegador/servidor
4. Consulta este documento para verificar que se siguieron las reglas de prevención

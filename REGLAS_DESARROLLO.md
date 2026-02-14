# Reglas de Desarrollo

Este documento contiene las reglas y convenciones que deben seguirse durante el desarrollo de la aplicación. **DEBES CONSULTAR ESTE ARCHIVO ANTES DE REALIZAR CUALQUIER CAMBIO O TAREA.**

---

## 📋 Reglas Generales

### 1. Actualización de VISTAS_TITULOS.md
**PRIORIDAD: ALTA**

Cuando se agregue una nueva vista (archivo `.vue` en `src/views/`), **DEBES** actualizar el archivo `VISTAS_TITULOS.md` con la siguiente información:

- Nombre del archivo de la vista
- Título principal que se muestra en la vista
- Categoría a la que pertenece (Autenticación, Natilleras, Socios, etc.)
- Notas especiales si el título es dinámico o tiene características particulares

**Ejemplo de formato:**
```markdown
### NuevaVista.vue
**Título:** Título Principal de la Vista
*Nota: [Cualquier nota relevante]*
```

**Pasos a seguir:**
1. Crear o modificar la vista
2. Identificar el título principal (generalmente en un `<h1>` o `<h2>`)
3. Abrir `VISTAS_TITULOS.md`
4. Agregar la nueva entrada en la sección correspondiente
5. Actualizar el contador total de vistas al final del archivo

**NO OLVIDES:** Esta regla aplica también cuando se modifica el título de una vista existente.

---

### 2. Permisos de Superusuario en Nuevas Tablas
**PRIORIDAD: ALTA**

Cuando se agregue una nueva tabla a la base de datos, **DEBES** asegurar que el usuario con correo `raigo.16@gmail.com` tenga permisos completos (SELECT, INSERT, UPDATE, DELETE) en esa tabla.

**Pasos a seguir:**

1. **Habilitar RLS en la nueva tabla:**
   ```sql
   ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;
   ```

2. **Crear políticas RLS que incluyan permisos de superusuario:**
   - Usar la función `public.es_superusuario()` en todas las políticas
   - El superusuario debe tener acceso completo (SELECT, INSERT, UPDATE, DELETE)

3. **Ejemplo de políticas para una nueva tabla:**
   ```sql
   -- SELECT: Superusuario puede ver todos los registros
   CREATE POLICY "Ver registros de tabla" ON nombre_tabla
       FOR SELECT USING (
           public.es_superusuario() OR [condición_normal]
       );

   -- INSERT: Superusuario puede insertar registros
   CREATE POLICY "Insertar registros en tabla" ON nombre_tabla
       FOR INSERT WITH CHECK (
           public.es_superusuario() OR [condición_normal]
       );

   -- UPDATE: Superusuario puede actualizar registros
   CREATE POLICY "Actualizar registros en tabla" ON nombre_tabla
       FOR UPDATE USING (
           public.es_superusuario() OR [condición_normal]
       )
       WITH CHECK (
           public.es_superusuario() OR [condición_normal]
       );

   -- DELETE: Superusuario puede eliminar registros
   CREATE POLICY "Eliminar registros de tabla" ON nombre_tabla
       FOR DELETE USING (
           public.es_superusuario() OR [condición_normal]
       );
   ```

4. **Alternativa: Usar política FOR ALL (si aplica):**
   ```sql
   CREATE POLICY "Gestionar tabla" ON nombre_tabla
       FOR ALL USING (
           public.es_superusuario() OR [condición_normal]
       )
       WITH CHECK (
           public.es_superusuario() OR [condición_normal]
       );
   ```

5. **Verificar que la función `es_superusuario()` existe:**
   - Esta función ya está creada en `add_full_superuser_permissions.sql`
   - Verifica que el correo sea exactamente `raigo.16@gmail.com` (en minúsculas)

**NOTA IMPORTANTE:** 
- La función `public.es_superusuario()` ya existe en el sistema y verifica si el usuario actual tiene el correo `raigo.16@gmail.com`
- Siempre incluir `public.es_superusuario() OR` al inicio de cada condición RLS
- Esto permite que el superusuario tenga acceso completo mientras mantiene las restricciones normales para otros usuarios

**NO OLVIDES:** Esta regla aplica a TODAS las nuevas tablas creadas en el sistema.

---

### 3. Redondeo de Valores Calculados
**PRIORIDAD: ALTA**

Todos los valores calculados en la aplicación **DEBEN** redondearse hacia arriba usando `Math.ceil()` en JavaScript/TypeScript. Esto aplica especialmente a cálculos financieros, intereses, cuotas, montos y cualquier valor monetario.

**Regla aplicable:**
- ✅ **SIEMPRE** usar `Math.ceil()` para redondear hacia arriba
- ❌ **NUNCA** usar `Math.round()` o `Math.floor()` para valores calculados
- ❌ **NUNCA** dejar valores con decimales en cálculos financieros

**Áreas donde aplica:**
- Cálculo de intereses (simple y compuesto)
- Cálculo de cuotas de préstamos
- Cálculo de valores de refinanciación
- Cálculo de capital e interés por cuota
- Cálculo de saldos proyectados
- Cualquier cálculo monetario o financiero

**Ejemplo correcto:**
```javascript
// ✅ CORRECTO: Redondear hacia arriba
const interesTotal = Math.ceil(monto * tasaInteres * numeroCuotas)
const valorCuota = Math.ceil((monto + interesTotal) / numeroCuotas)
const capitalCuota = Math.ceil(valorCuota - interesCuota)
const saldoRestante = Math.ceil(saldoActual - capitalPagado)
```

**Ejemplo incorrecto:**
```javascript
// ❌ INCORRECTO: No redondear o redondear incorrectamente
const interesTotal = monto * tasaInteres * numeroCuotas  // Sin redondeo
const valorCuota = Math.round((monto + interesTotal) / numeroCuotas)  // Redondeo normal
const capitalCuota = Math.floor(valorCuota - interesCuota)  // Redondeo hacia abajo
```

**Pasos a seguir:**
1. Identificar todos los cálculos que generen valores monetarios o financieros
2. Aplicar `Math.ceil()` al resultado final de cada cálculo
3. Aplicar `Math.ceil()` también a valores intermedios si se usan en cálculos posteriores
4. Verificar que no queden valores con decimales en la base de datos o en la interfaz

**NO OLVIDES:** Esta regla aplica a TODOS los cálculos financieros y monetarios en toda la aplicación.

---

### 4. Zona Horaria: UTC-5:00
**PRIORIDAD: ALTA**

Todas las fechas y horas en la aplicación **DEBEN** manejarse usando la zona horaria **UTC-5:00** (hora estándar de Colombia).

**Regla aplicable:**
- ✅ **SIEMPRE** usar la zona horaria UTC-5:00 para fechas y horas
- ✅ Usar funciones auxiliares que formateen fechas sin conversión UTC
- ❌ **NUNCA** usar `toISOString()` directamente para formatear fechas que se guardarán en la base de datos
- ❌ **NUNCA** confiar en la zona horaria del navegador/sistema

**Funciones disponibles:**
- `formatDateToLocalISO(date)`: Formatea una fecha en formato YYYY-MM-DD usando la zona horaria local (UTC-5:00)
- `formatDate(date)`: Formatea una fecha para mostrar en la interfaz (dd/MM/yyyy)
- `formatDateWithTime(date)`: Formatea una fecha con hora para mostrar en la interfaz (dd/MM/yyyy HH:mm)

**Ejemplo correcto:**
```javascript
// ✅ CORRECTO: Usar función auxiliar que respeta la zona horaria local
const fechaFormateada = formatDateToLocalISO(new Date())
// Esto mantendrá la fecha correcta sin conversión a UTC

// ✅ CORRECTO: Crear fechas desde strings en formato YYYY-MM-DD
const fecha = new Date('2024-11-01T00:00:00') // Se interpreta en zona horaria local
```

**Ejemplo incorrecto:**
```javascript
// ❌ INCORRECTO: Usar toISOString() que convierte a UTC
const fechaFormateada = new Date().toISOString().split('T')[0]
// Esto puede cambiar la fecha si la hora local es anterior a las 05:00 UTC

// ❌ INCORRECTO: Asumir que el navegador tiene la zona horaria correcta
const fecha = new Date().toISOString()
```

**Áreas donde aplica:**
- Generación de planes de pago de préstamos
- Fechas de cuotas
- Fechas de creación y actualización de registros
- Fechas de pago
- Cualquier fecha que se guarde en la base de datos

**Pasos a seguir:**
1. Al formatear fechas para guardar en la base de datos, usar funciones que no conviertan a UTC
2. Al crear fechas desde strings, asegurarse de que se interpreten en la zona horaria local
3. Al mostrar fechas en la interfaz, usar las funciones de formateo disponibles
4. Revisar todos los usos de `toISOString()` y reemplazarlos si es necesario

**NO OLVIDES:** Esta regla aplica a TODAS las fechas y horas en toda la aplicación.

---

### 5. Modales nuevas: usar ModalWrapper para iOS/Safari
**PRIORIDAD: ALTA**

Cuando se agregue una **nueva modal** (diálogo full-screen o tipo bottom sheet) en cualquier vista, **DEBES** usar el componente `ModalWrapper` para que en iPhone/Safari se vea completa en pantalla, respete la safe area (notch, home indicator) y el scroll funcione correctamente, sin afectar el comportamiento en Android.

**Regla aplicable:**
- ✅ **SIEMPRE** envolver el contenido de la modal con `<ModalWrapper>` (el componente elige automáticamente la versión iOS o Android según el dispositivo).
- ✅ Pasar `overlay-class` y `card-class` con las mismas clases que usarías en el overlay y la card para **Android** (así no se cambia nada en escritorio/Android).
- ✅ En modales tipo bottom sheet (que salen desde abajo en móvil), usar `align="bottom"`.
- ✅ Emitir `@close` para cerrar (y opcionalmente `@touchstart` en el backdrop lo maneja el componente).
- ❌ **NUNCA** agregar una modal nueva como `<div class="fixed inset-0">` + backdrop + card sin usar `ModalWrapper`.

**Componente:** `src/components/ModalWrapper.vue`  
**Composable de detección:** `useIsIos()` en `src/composables/useIsIos.js` (ya usado dentro de ModalWrapper).

**Ejemplo de uso:**
```vue
<ModalWrapper
  :show="!!modalNueva"
  :z-index="50"
  align="center"
  overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
  card-class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
  card-max-width="28rem"
  @close="modalNueva = false"
>
  <!-- Contenido de la modal (header, body, footer) -->
</ModalWrapper>
```

**Props útiles:**
- `show`: boolean (ej. `!!modalNueva`)
- `z-index`: número (50, 60, 70 según capas)
- `align`: `'center'` (por defecto) o `'bottom'` para estilo bottom sheet en móvil
- `overlay-class`: clases del overlay para Android
- `card-class`: clases de la card para Android
- `card-max-width`: opcional, para iOS (ej. `'28rem'`, `'42rem'`)
- `@close`: evento al cerrar (backdrop o botón)

**Pasos a seguir:**
1. Importar: `import ModalWrapper from '../../components/ModalWrapper.vue'` (ajustar ruta según la vista).
2. Sustituir la estructura antigua (div fixed + backdrop + div card) por `<ModalWrapper>` con las props anteriores.
3. Poner **solo el contenido de la card** dentro del ModalWrapper (mismo header/body/footer que antes).
4. Cerrar con `</ModalWrapper>` (una sola etiqueta de cierre).

**NO OLVIDES:** Esta regla aplica a toda modal nueva que sea full-screen o tipo bottom sheet. Las pantallas de carga pueden seguir usando `LoadingScreenIos` cuando corresponda (solo iOS).

---

## 🔄 Proceso de Desarrollo

Antes de comenzar cualquier tarea:

1. ✅ Leer este archivo completamente
2. ✅ Verificar si hay reglas específicas para la tarea que vas a realizar
3. ✅ Consultar otros archivos de documentación relevantes
4. ✅ Seguir las convenciones establecidas
5. ✅ Actualizar la documentación necesaria al finalizar

---

## 📝 Notas Importantes

- Este archivo debe mantenerse actualizado
- Las reglas tienen prioridades (ALTA, MEDIA, BAJA)
- Si encuentras una situación no cubierta por las reglas, agrega una nueva regla después de consultar con el equipo

---

**Última actualización:** 2025-02-07 (Agregada regla #5: modales nuevas con ModalWrapper para iOS/Safari)

---

## 🔧 Herramientas Disponibles

### Función SQL para Aplicar Permisos Automáticamente

Existe una función SQL que puede aplicarse automáticamente a nuevas tablas:

```sql
SELECT aplicar_permisos_superusuario('nombre_de_la_tabla');
```

Esta función está disponible en la migración `add_superuser_to_new_tables.sql` y aplica automáticamente todas las políticas RLS necesarias para que el superusuario tenga acceso completo.

**Nota:** Esta función crea políticas básicas. Si necesitas políticas más específicas, créalas manualmente siguiendo el patrón establecido en la regla #2.






# Vista de Socios — Funcionalidades

Qué permite hacer la vista de socios. Sin diseño, sin UI, sin layout — solo funcionalidad.

- **Archivo:** [src/views/socios/Socios.vue](../../src/views/socios/Socios.vue)
- **Ruta:** `/natilleras/:id/socios`
- **Query opcional:** `?agregar=true` abre el flujo de alta de socio al entrar

---

## 1. Gestión del ciclo de vida del socio

### 1.1 Crear un socio

Permite registrar un nuevo participante en la natillera capturando:

- **Nombre** (obligatorio)
- **Teléfono** (obligatorio, único dentro de la natillera — se normaliza a 10 dígitos Colombia, quitando `+57` si viene)
- **Valor de la cuota** (obligatorio, mayor a cero)
- **Periodicidad del socio** (`mensual` o `quincenal`). Si la natillera es mensual, se fuerza a mensual; si es quincenal se puede elegir
- **Email** y **documento** (opcionales)
- **Avatar** (seed aleatoria por defecto, seleccionable entre un catálogo)

**Validaciones previas al guardar:**
- Nombre no vacío
- Cuota > 0
- Teléfono no vacío y único en esa natillera

**Sub-flujo con generación automática de cuotas** (cuando la natillera tiene `cuotas_automaticas`):
1. Crea el socio (registro de persona + membresía)
2. Genera en un solo batch todas las cuotas del plan de la natillera para ese socio, con fechas de vencimiento según periodicidad (día 15 y último día del mes en quincenal; último día del mes en mensual)
3. Si había 0 socios antes, dispara el tour guiado "primer socio"

**Sub-flujo sin generación automática:** solo crea al socio; las cuotas se generan después.

**Resultado:** el socio queda en estado `activo` y disponible para pagos, sanciones y préstamos.

### 1.2 Editar un socio

Permite modificar:
- Datos personales (nombre, teléfono, email, documento, avatar)
- Valor de la cuota
- Periodicidad

Con dos comportamientos diferenciados:

**Si cambia la periodicidad** (caso destructivo y necesario):
- Se eliminan **todas** las cuotas del socio (incluidas pagadas)
- Se actualiza la periodicidad y el valor
- Se regeneran todas las cuotas con la nueva periodicidad
- Se recargan cuotas y lista de socios

**Si solo cambia el valor de la cuota** (no la periodicidad):
- Se actualiza el valor en la membresía
- Se propaga a las cuotas existentes con una nota de "ajuste de valor":
  - Si el valor sube: las cuotas ya pagadas pasan a **parciales**
  - Si el valor baja: las cuotas pagadas se mantienen pagadas con nota
- Las cuotas pendientes se recalculan

**Si cambian solo los datos personales:** actualización directa y, si hay cambio de teléfono, se vuelve a verificar unicidad excluyendo al propio socio.

### 1.3 Desactivar un socio (con liquidación)

Permite retirar a un socio de la operativa de la natillera sin borrarlo, calculando su liquidación.

**Información que se muestra antes de confirmar:**
- Total ahorrado en cuotas pagadas
- Total entregado al socio en actividades
- Total pagado en sanciones

**Opciones configurables al desactivar:**
- **Sanción por retiro** (sí/no) con **porcentaje** configurable (0–100 %, paso 0,5)
- **Forma de pago** de la liquidación: `efectivo` o `transferencia`

**Cálculo de la liquidación:**
```
valorRecaudado = totalAhorrado (cuotas pagadas)

con sanción:
  valorEntregar = recaudado * (1 - %/100)   → para el socio
  valorFondo    = recaudado * %/100          → para la natillera
sin sanción:
  valorEntregar = recaudado
  valorFondo    = 0

totalSalida    = valorEntregar + valorFondo
```

**Al confirmar se ejecuta una transacción en 4 pasos:**
1. Si hay sanción > 0 → registro en utilidades clasificadas (tipo `sanciones`)
2. Registro de salida en movimientos de fondo (caja) por `totalSalida`, con la forma de pago elegida
3. Cambio de estado del socio a `inactivo`
4. Generación de un **comprobante de salida** con código único `SAL-XXXXXXXX` (upsert para evitar duplicados si se reabre)

**Efectos:** el socio deja de aparecer como activo, no genera nuevas obligaciones y queda deshabilitado para acciones operativas; su historial y el comprobante se conservan.

### 1.4 Reactivar un socio

Permite devolver un socio inactivo al estado activo, **revirtiendo automáticamente** los efectos financieros de su desactivación si los hubo:

- Si existía un comprobante de salida previo:
  1. Se inserta un movimiento de **entrada** en caja que compensa exactamente la salida anterior
  2. Si la desactivación incluyó sanción, se inserta la **reversa** en utilidades clasificadas (monto negativo)
  3. Se elimina el comprobante de salida
- Si **no** existía comprobante (socio que nunca fue desactivado con liquidación, ej. desactivación manual de un estado legacy): solo se cambia el estado, sin tocar caja.

Tras la reactivación el socio vuelve a generar y pagar cuotas con normalidad.

### 1.5 Eliminar un socio (destructivo e irreversible)

Permite borrar al socio de la natillera actual. La eliminación dispara cascada por claves foráneas y arrastra:
- Todas las cuotas del socio (pagadas y pendientes)
- Todos los préstamos y sus pagos
- Todas las multas y sanciones
- Todos los comprobantes
- Todos los movimientos financieros asociados

**Solo** se elimina de esta natillera; la persona (`socios`) puede permanecer si pertenece a otras.

Requiere confirmación explícita con advertencia detallada de lo que se pierde.

---

## 2. Consulta de información del socio

### 2.1 Resumen financiero del socio

Para un socio cualquiera, la vista permite consultar su estado actual:

- **Total aportado:** suma de `valor_pagado` de todas sus cuotas
- **Total pendiente:** suma de `(valor_cuota - valor_pagado)` en cuotas pendientes, parciales y en mora
- **Conteo de cuotas:** pagadas, pendientes, en mora
- **Indicador "al día":** verdadero si no tiene cuotas pendientes ni en mora
- **Información de contacto:** teléfono, email, documento

### 2.2 Historial de cuotas pagadas

Lista de cuotas ya saldadas con:
- Número/descripción de la cuota
- Valor pagado
- Fecha de pago

Ordenadas por fecha de pago descendente, con total al pie.

### 2.3 Historial completo de cuotas

Vista por mes del plan de cuotas del socio, donde cada cuota muestra:
- Mes y año
- Período dentro del mes (1.ª quincena, 2.ª quincena, o mes completo)
- Valor a pagar (pendiente) o pagado
- Estado real calculado dinámicamente
- Días en mora si aplica
- Sanción/multa asociada

**Estados de cuota aplicados según las reglas del proyecto:**
| Estado | Condición |
|--------|-----------|
| `pagada` | `valor_pagado >= valor_cuota` |
| `programada` | `hoy < fecha_limite` |
| `pendiente` | `fecha_limite <= hoy <= fecha_limite + dias_gracia` |
| `mora` | `hoy > fecha_limite + dias_gracia` |
| `parcial` | tiene abono pero no cubre la cuota |

**Cálculo de sanción:**
- Si la cuota tiene `valor_multa` persistido, se usa ese valor (no se recalcula)
- Si no, y está en mora y las sanciones están activas en la natillera, se calcula dinámicamente por escalones de días (5 %, 10 %, 15 %)
- Si las sanciones están inactivas, la multa es 0

**Cálculo de días en mora:**
```
dias = max(0, floor((hoy - (fecha_limite + dias_gracia)) / 1 día))
```

Desde esta consulta se puede navegar al mes concreto de la cuota dentro del módulo de Cuotas.

---

## 3. Búsqueda

Permite filtrar la lista de socios en tiempo real. El término se busca en:
- Nombre (case-insensitive)
- Documento (case-insensitive)
- Teléfono (coincidencia directa)

El filtro es inclusivo (OR): basta que coincida en uno de los tres campos. Se puede limpiar en cualquier momento.

---

## 4. Importación masiva desde CSV

Permite crear varios socios en una sola operación.

**Plantilla descargable** con las columnas esperadas:
```
nombre, valor_cuota, telefono, email, documento
```

**Proceso:**
1. Descargar plantilla CSV de ejemplo
2. Cargar el archivo del usuario
3. Se parsea el CSV:
   - Primera línea = encabezados (normalizados a lowercase)
   - Se exige la presencia de `nombre`, `valor_cuota` y `telefono`
   - Se construye una vista previa solo con filas que tengan los tres obligatorios
4. Confirmación de importación
5. Se crea cada socio individualmente:
   - Sin generación automática de cuotas
   - Periodicidad por defecto `mensual`
   - Se valida unicidad del teléfono fila a fila
6. Al finalizar se reporta: cuántos se importaron, cuántos fallaron, y los primeros 5 errores concretos
7. Se registra auditoría de la operación masiva

**Casos especiales:**
- CSV vacío o sin encabezados requeridos → error bloqueante
- Filas incompletas → se descartan silenciosamente
- Errores parciales → continúa con las válidas; si al menos una se creó, la lista se recarga
- Todos fallan → no recarga la lista

---

## 5. Selector de contactos del dispositivo

Cuando el navegador soporta la Contact Picker API (principalmente Android Chrome), permite rellenar el formulario de alta pick-eando un contacto del teléfono:

- Extrae **teléfono** (acepta múltiples formatos: `tel`, `phoneNumbers`, `phoneNumber`) y lo normaliza
- Rellena **nombre** si estaba vacío (`name` / `displayName` / `givenName + familyName`)
- Rellena **email** si estaba vacío

**Gestión de permisos y errores:**
- Permiso denegado (`AbortError` / `NotAllowedError`) → aviso al usuario
- API no soportada → aviso al usuario
- Cancelación del selector → silenciosa
- Contacto sin teléfono → aviso "El contacto no tiene número de teléfono"

En dispositivos sin soporte de la API, la funcionalidad queda deshabilitada y el teléfono se digita manualmente.

---

## 6. Comprobante de salida

Asociado al flujo de desactivación. Permite:

- **Visualizar** el comprobante con: código único, socio, fecha, total ahorrado, sanción por retiro (si aplica) y valor final entregado
- **Descargarlo** como imagen PNG (captura DOM-to-image)
- **Compartirlo por WhatsApp** vía enlace `wa.me` con el teléfono del socio (o se solicita un teléfono si no lo hay)
- **Reabrirlo** posteriormente para socios ya desactivados; se cachea por `socio_id` para no refetchear

El comprobante se persiste en base de datos (tabla `comprobantes_salida`) y se elimina si el socio se reactiva.

---

## 7. Integración con WhatsApp

Desde el historial de cuotas del socio, para cada cuota **pendiente** o **en mora** (y solo si el socio tiene teléfono), se puede disparar un recordatorio por WhatsApp abriendo `wa.me` con una plantilla personalizada que toma el texto desde `useConfiguracionStore`.

---

## 8. Navegación cruzada

La vista expone puntos de salida hacia:

- **Detalle de la natillera** (`/natilleras/:id`) vía botón atrás
- **Cuotas del mes** (`/natilleras/:id/cuotas/:mes`) al hacer click en una cuota del historial del socio (excepto para visores, que son read-only)
- **Dashboard** como fallback si el `id` de natillera es inválido

Además integra con el botón atrás del navegador: al abrir modales hace `pushState` y al recibir `popstate` los cierra en orden de profundidad (z-index), en vez de abandonar la vista.

---

## 9. Estados del socio y transiciones permitidas

Dos estados visibles en esta vista: `activo` e `inactivo`.

```
activo    ──► inactivo     (desactivar con liquidación)
activo    ──► eliminado    (eliminar en cascada)
inactivo  ──► activo       (reactivar con reversa automática)
inactivo  ──► eliminado    (eliminar en cascada)
```

**Restricciones operativas por estado:**
- Un socio **inactivo** no puede pagar nuevas cuotas ni generar obligaciones
- Un socio **inactivo** se distingue visualmente pero sigue consultable
- Un socio **activo** participa plenamente del ciclo de cuotas, préstamos y actividades

---

## 10. Permisos

| Funcionalidad | Admin de la natillera / Editor | Visor |
|--------------|:---:|:---:|
| Ver lista y buscar | ✅ | ✅ |
| Ver resumen financiero | ✅ | ✅ |
| Ver historial de cuotas | ✅ | ✅ |
| Crear socio | ✅ | ❌ |
| Editar socio | ✅ | ❌ |
| Eliminar socio | ✅ | ❌ |
| Desactivar socio | ✅ | ❌ |
| Reactivar socio | ✅ | ❌ |
| Importar CSV | ✅ | ❌ |
| Enviar recordatorio WhatsApp | ✅ | ❌ |
| Navegar al mes de una cuota | ✅ | ❌ (read-only) |

El rol se determina en el montaje: si el `admin_id` de la natillera coincide con el usuario autenticado → administrador inmediato; en caso contrario, se consulta el rol del colaborador de forma asíncrona.

---

## 11. Relaciones con otras entidades

La vista actúa como centro de integración de varios dominios:

| Entidad | Qué hace Socios con ella |
|---------|-----|
| `cuotas` | Genera en batch al crear socio; elimina y regenera al cambiar periodicidad; recalcula al cambiar valor; consume para el resumen y el historial |
| `prestamos` y `plan_pagos_prestamo` | Se eliminan en cascada al borrar socio; no se modifican al desactivar |
| `movimientos_fondo` | Inserta salida al desactivar con liquidación; inserta entrada inversa al reactivar |
| `utilidades_clasificadas` | Inserta sanción al desactivar con porcentaje; inserta reversa negativa al reactivar |
| `comprobantes_salida` | Upsert al desactivar; elimina al reactivar; consulta/reabre desde la vista |
| `socios` (tabla persona) | Crea si no existe al agregar; actualiza datos personales al editar |
| `socios_natillera` (membresía) | Es el registro principal que esta vista administra (valor, periodicidad, estado) |
| `natilleras` | Lee `periodicidad`, `cuotas_automaticas`, `reglas_multas.dias_gracia`, `admin_id` para condicionar el comportamiento |

---

## 12. Casos especiales y comportamientos defensivos

| Caso | Qué hace la vista |
|------|-------------------|
| Natillera sin socios | Ofrece CTA para crear el primero y lanza tour guiado al conseguirlo |
| Teléfono duplicado | Bloquea el guardado y señala el campo (excluyendo al propio socio en edición) |
| Natillera mensual + intento de crear socio quincenal | Se fuerza periodicidad mensual, no se ofrece la opción |
| Cambio de periodicidad del socio | Advertencia explícita de que se regeneran todas las cuotas; ejecuta regeneración con indicador de progreso |
| Error de Supabase en cualquier paso | Captura y notifica por toast; en el flujo de alta con progreso, muestra el error y permite cerrar |
| Fallo en generación de cuotas pero socio creado | Éxito parcial: se mantiene el socio, se informa que algunas cuotas no se generaron |
| Activar socio sin comprobante previo | Solo cambia estado, no toca caja |
| Activar socio con comprobante | Revierte automáticamente movimiento de caja y sanción |
| Socio sin teléfono | Se permite, pero deshabilita recordatorios WhatsApp y envío de comprobante por WhatsApp |
| Contact Picker no disponible | Desactiva la funcionalidad silenciosamente, no se ofrece el botón |
| CSV con errores parciales | Importa lo válido y detalla los primeros 5 errores al final |
| Navegación con `?agregar=true` | Abre el flujo de alta automáticamente y limpia el query |

---

## 13. Auditoría

La importación masiva desde CSV registra auditoría a través de `useAuditoria`. Las acciones individuales (crear, editar, eliminar, desactivar, activar) dependen de los triggers y políticas del store/Supabase, no se registran explícitamente desde esta vista.

---

## 14. Tours guiados

Si los tours están habilitados globalmente (`TOURS_ENABLED`):

- Al crear el **primer socio** de una natillera se dispara `startPrimerSocioSociosNavTour` / `startNatilleraMenuTour` y se marca `setPendingCuotasDetalleTour` + `setPrimerFlujoSocioNatilleraId` para encadenar con el flujo de cuotas
- Verificaciones previas (`shouldShowPrimerSocioSociosNavTour`, `shouldShowNatilleraMenuTour`) evitan relanzarlos si ya se vieron

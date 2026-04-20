# Vista de Socios — Especificación funcional

Documento exhaustivo de la vista de gestión de socios de una natillera.

- **Archivo:** [src/views/socios/Socios.vue](../../src/views/socios/Socios.vue) (5.339 líneas, componente monolítico)
- **Ruta:** `/natilleras/:id/socios`
- **Props:** `id` (id de la natillera, también leíble de `route.params.id`)
- **Query param opcional:** `?agregar=true` abre el modal de agregar socio automáticamente al montar; el query se limpia con `router.replace`

---

## 1. Propósito

Es el centro de gestión del ciclo de vida de los participantes (socios) de una natillera. Desde aquí se listan, buscan, crean, editan, importan, desactivan, reactivan y eliminan socios; se consulta su resumen financiero, su historial de cuotas y se emite el comprobante de salida con sanción por retiro cuando corresponde.

---

## 2. Arquitectura

### 2.1 Stores (Pinia)

| Store | Uso |
|-------|-----|
| `useSociosStore` | Lista `sociosNatillera`, `agregarSocio`, `editarSocio`, `eliminarSocioNatillera`, `cambiarEstadoSocio`, `verificarTelefonoUnico`, `obtenerResumenSocio` |
| `useCuotasStore` | `fetchCuotasNatillera`, `generarCuotasParaSocio`, `eliminarTodasLasCuotasSocio`, `calcularSancionesTotales` |
| `useNatillerasStore` | `natilleraActual` (periodicidad, cuotas_automaticas, reglas_multas.dias_gracia, admin_id) |
| `useConfiguracionStore` | Plantillas de WhatsApp |
| `useNotificationStore` | Toasts `success` / `warning` / `error` |
| `useColaboradoresStore` | `obtenerMiRol` — define si el usuario es `administrador` o `visor` |

### 2.2 Composables y librerías

- `useBodyScrollLock(ref)` — bloqueo de scroll del body cuando hay modales abiertos
- `useModalBodyScrollOverflow` — detecta (RAF) si un modal tiene contenido scrolleable para mostrar el *hint* "Desliza para ver más" (natiscroll)
- `useAuditoria` — registra auditoría, sobre todo en importación masiva
- Tours guiados: `shouldShowPrimerSocioSociosNavTour`, `startPrimerSocioSociosNavTour`, `shouldShowNatilleraMenuTour`, `startNatilleraMenuTour`, `setPendingCuotasDetalleTour`, `setPrimerFlujoSocioNatilleraId`, gated por `TOURS_ENABLED`
- `toPng` (`html-to-image`) — captura DOM → PNG para el comprobante de salida
- `@heroicons/vue/24/outline` — iconografía
- `ModalWrapper` / `BackButton` — componentes compartidos

### 2.3 Tablas Supabase involucradas

| Tabla | Rol |
|-------|-----|
| `socios` | Persona (nombre, teléfono, email, documento, avatar) |
| `socios_natillera` | Membresía: `valor_cuota`, `periodicidad`, `estado` (`activo`/`inactivo`), FK a socio y natillera |
| `cuotas` | Plan de cuotas del socio (se regeneran al cambiar periodicidad) |
| `movimientos_fondo` | Entradas/salidas de caja por liquidación al desactivar/activar |
| `utilidades_clasificadas` | Registro de sanción por retiro (tipo `sanciones`) |
| `comprobantes_salida` | Comprobante único por socio desactivado (código `SAL-XXXXXXXX`) |
| `natilleras` | Reglas y periodicidad que condicionan el formulario |

---

## 3. Estructura visual

### 3.1 Header unificado
Icono `UsersIcon`, título "Socios", subtítulo "Gestiona los participantes y sus cuotas personalizadas", `BackButton` y dos botones (solo si **no** es visor):
- **Importar CSV** (visible `md+`) → abre `modalImportar`
- **Agregar Socio** → `abrirModalAgregar()`

### 3.2 Barra de búsqueda
Solo si la natillera ya tiene socios. Input glassmorphism con:
- Icono lupa a la izquierda
- Botón `X` para limpiar (visible si hay texto)
- Tecla `Esc` limpia el término
- Filtra en vivo por **nombre**, **documento** y **teléfono**

### 3.3 Estados de la pantalla

| Estado | Condición | UI |
|--------|-----------|-----|
| Cargando | `cargaInicial && sociosStore.loading` | Spinner + "Cargando socios..." |
| Sin socios | `!cargaInicial && sociosNatillera.length === 0` | Tarjeta con CTA "Agregar Primer Socio" |
| Búsqueda sin resultados | `sociosNatillera.length > 0 && sociosFiltrados.length === 0` | Tarjeta con término buscado y botón "Limpiar búsqueda" |
| Con socios | resto | Grid responsive `grid-cols-1 lg:grid-cols-2` con `<TransitionGroup name="socio-card">` |

### 3.4 Tarjeta de socio

- **Visual activo vs inactivo:** el inactivo aplica `grayscale` + `opacity-60`, deshabilita hover y oculta las acciones
- **Bloque superior:** avatar DiceBear (circular, border esmerald, anima `scale` + `rotate` en hover), nombre truncado, email con icono sobre, teléfono con icono, badge de estado (`activo` verde / `inactivo` naranja)
- **Bloque de métricas:** grid 2 col — cuota individual formateada y periodicidad con emoji (📅 Quincenal / 📅 Mensual)
- **Acciones (solo si activo):** `Ver cuotas` (primario verde), editar (lápiz azul), eliminar (papelera roja), desactivar (círculo X ámbar)
- **Acciones (si inactivo):** un único botón `Activar` prominente verde con animación pulse y `z-index:20`

---

## 4. Flujos principales

### 4.1 Agregar socio

`abrirModalAgregar()` resetea `formSocio`, asigna `avatar_seed` aleatorio y enfoca el input de nombre en el siguiente frame.

**Campos del formulario** (modal `modalAgregar`):
1. Selector de avatar (DiceBear) — toggle "Cambiar avatar" → grid 5 col
2. **Nombre completo** (obligatorio, auto-focus)
3. **Periodicidad** — si la natillera es mensual, se fuerza a `mensual` (disabled); si es quincenal, se ofrecen ambas
4. **Valor de la cuota** (obligatorio, `>0`, `inputmode="numeric"`, formato `1.234.567` vía `Intl.NumberFormat('es-CO')`)
5. **Teléfono/WhatsApp** (obligatorio, único por natillera). En móviles con Contact Picker API aparece el botón "Contactos"
6. **Contacto adicional** colapsable: email y documento (opcionales)

**Validaciones (`handleGuardarSocio`):**
- Nombre no vacío
- Teléfono no vacío, único por natillera (excluye al mismo socio si está editando)
- Cuota `>0` y no `NaN`

**Procesamiento de teléfono** (`limpiarNumeroTelefono`): quita todo lo no numérico salvo `+`, remueve `+57` si está presente y conserva 10 dígitos.

**Sub-flujo A — `cuotas_automaticas !== false`:**
1. Cierra `modalAgregar`, abre `modalProgreso`
2. **Paso 1:** inserta en `socios` (si no existe) + `socios_natillera`
3. **Paso 2:** `generarCuotasParaSocio()` en batch (insert único, ~10× más rápido que uno a uno)
4. **Paso 3:** éxito → espera 2.5 s → cierra modal
5. Si la lista estaba vacía, dispara el tour guiado de primer socio

**Sub-flujo B — sin cuotas automáticas:** inserta el socio, toast `success` y cierra modal. Igual dispara tour si era el primero.

**Errores:** se capturan y se muestran en `errorSocio`; teléfono duplicado pinta `errorTelefonoDuplicado` en rojo bajo el input.

---

### 4.2 Editar socio

`editarSocio(sn)` precarga `formSocio` con los datos actuales.

Al guardar la lógica se bifurca en dos:

**Caso A — cambió la periodicidad:**
1. Guarda los valores antes de cerrar el modal (para no perderlos en el reset)
2. Abre `modalProgreso`
3. Actualiza los datos del socio (nombre, teléfono, email, documento, avatar)
4. **Elimina TODAS las cuotas** del socio con `eliminarTodasLasCuotasSocio()`
5. Actualiza `valor_cuota` y `periodicidad` en `socios_natillera`
6. Regenera cuotas con la nueva periodicidad
7. Recarga cuotas + socios en paralelo
8. Cierra tras 1.5 s

Por eso el input de cuota muestra un tooltip de advertencia durante la edición: al subir el valor, cuotas ya pagadas pasan a **parciales**; al bajarlo, se mantienen pagadas con nota.

**Caso B — sin cambio de periodicidad:**
1. Verifica unicidad del teléfono (excluyendo al mismo socio)
2. Actualiza `socios_natillera` (`valor_cuota`, `periodicidad`)
3. Actualiza `socios` (nombre, teléfono, email, documento, avatar)
4. Si la cuota cambió, recarga cuotas para reflejar pendientes
5. Si `modalDetalle` estaba abierto sobre este socio, sincroniza `socioSeleccionado`
6. Toast `success`

---

### 4.3 Ver detalle del socio

`verDetalleSocio(sn)` — solo si el socio está activo. Carga `obtenerResumenSocio()` y abre `modalDetalle` en la sección `finanzas`.

**Secciones colapsables** (solo una abierta a la vez via `toggleSeccion`):

- **Resumen Financiero:** total aportado, pendiente, nº cuotas pagadas, pendientes y en mora. Badge superior: verde "¡Al día con los pagos!" o rojo "Tiene pagos pendientes — Debe N cuota(s)"
- **Cuotas pagadas:** tabla scrollable (Cuota | Valor | Fecha de pago), total al pie, orden descendente por fecha. Vacío → "No hay cuotas pagadas registradas"
- **Información de contacto:** teléfono con botón `wa.me`, email, documento
- **Configuración de cuotas:** valor, periodicidad, texto informativo ("Este socio paga 2 cuotas por mes" vs "1 cuota por mes")

Acciones al pie: **Editar** (solo si no visor) y **Cerrar**.

---

### 4.4 Ver cuotas del socio

`verCuotasSocio(sn)` abre `modalCuotasSocio` de inmediato (feedback rápido) y carga asíncronamente:

1. `obtenerResumenSocio()` trae cuotas crudas
2. Lee `dias_gracia` de `natillera.reglas_multas`
3. `calcularSancionesTotales()` asigna multas dinámicas
4. Por cada cuota calcula:
   - Estado real (`calcularEstadoRealCuota`, ver §6.2)
   - Mes, año, período (1.ª Q / 2.ª Q / Mes)
   - `fecha_vencimiento = fecha_limite + dias_gracia`
   - Sanción (prioriza `valor_multa` persistido sobre cálculo dinámico)
   - Días en mora
5. Ordena por año → mes → fecha de vencimiento ascendente

Cada fila muestra badge coloreado por estado y botón WhatsApp (solo si no visor, y solo si estado `pendiente`/`mora` y hay teléfono). Click en fila navega a `/natilleras/:id/cuotas/:mes`.

**Colores y etiquetas de estado:**

| Estado | Color badge | Etiqueta |
|--------|-------------|----------|
| `pagada` | verde 100 | "Pagada" |
| `parcial` | naranja 100 | "Parcial" |
| `mora` | rojo 100 | "Mora XdYs" (días) |
| `pendiente` | ámbar 100 | "Pend." |
| `programada` | slate 100 | "Prog." |

**Cálculos de presentación:** `totalObligacionCuotaSocioModal()` (cuota + sanción), `getMontoValorCuotaSocioModal()` (pendiente o pagado), `subetiquetaValorCuotaSocioModal()` ("Liquidado", "Pagado $X", "Pendiente").

---

### 4.5 Desactivar socio (liquidación + sanción)

`abrirModalDesactivar(sn)` dispara `cargarTotalesDesactivar()` — consulta totales (ahorrado, entregado en actividades, pagado en sanciones) para el resumen.

**Modal `socioADesactivar`:**

1. **Checkbox "Aplicar sanción por retiro"** (toggle visual elegante ámbar)
2. **Input porcentaje** (solo si el check está activo; `min=0 max=100 step=0.5`)
3. **Resumen del socio:** total ahorrado, total entregado en actividades, total pagado en sanciones (o "Cargando..." si `loadingTotalesDesactivar`)
4. **Liquidación calculada** (cuadro ámbar):
   - `valorRecaudado = totalAhorrado` (cuotas pagadas)
   - Con sanción: `valorEntregar = valorRecaudado * (1 - %/100)`, `valorFondo = valorRecaudado * %/100`
   - Sin sanción: `valorEntregar = valorRecaudado`, `valorFondo = 0`
5. **Forma de pago** (obligatoria): "Efectivo" o "Transferencia" — determina cómo se registra la salida en caja

**`confirmarDesactivarSocio()`:**
1. Si hay sanción `>0` → insert en `utilidades_clasificadas` (tipo `sanciones`, monto `valorFondo`, forma de pago)
2. Insert en `movimientos_fondo` con tipo `salida` y monto `valorEntregar + valorFondo`
3. `cambiarEstadoSocio(sn.id, 'inactivo')`
4. Genera código único `SAL-XXXXXXXX`
5. Upsert en `comprobantes_salida` (evita duplicados si se reabre)
6. Abre `comprobanteDesactivacion` listo para descargar/compartir

---

### 4.6 Activar socio (reactivación con reversa)

`abrirModalActivar(sn)` + `confirmarActivarSocio()`:

1. Busca el comprobante de salida del socio
2. **Con comprobante existente:**
   - Lee `valor_entregar` y `valor_sancion`
   - Busca el `movimientos_fondo` de salida original
   - Inserta un movimiento **inverso** tipo `entrada` (restaura el fondo)
   - Si hay sanción, inserta reversa en `utilidades_clasificadas` con monto **negativo**
   - Elimina el registro de `comprobantes_salida`
3. `cambiarEstadoSocio(sn.id, 'activo')`
4. Cierra modales relacionados
5. Toast `success` "X ha sido activado"

**Sin comprobante** (socio que nunca fue desactivado con liquidación): solo cambia el estado a `activo`, sin tocar caja.

---

### 4.7 Eliminar socio (destructivo)

`confirmarEliminarSocio(sn)` abre el modal de confirmación con header rojo que enumera explícitamente lo que se pierde:
- Todas las cuotas (pagadas y pendientes)
- Todos los préstamos y pagos
- Todas las multas y sanciones
- Todo el historial de comprobantes
- Todos los registros financieros

Nota: la eliminación es **solo** en esta natillera (la persona en `socios` puede permanecer si pertenece a otras).

`eliminarSocioConfirmado()` llama `sociosStore.eliminarSocioNatillera(socioId)`. La eliminación en cascada por FK arrastra cuotas, movimientos, préstamos y comprobantes. Si `modalDetalle` estaba abierto sobre este socio, se cierra. Toast `warning` "Ha sido eliminado de la natillera".

---

### 4.8 Importar socios desde CSV

**Modal `modalImportar`** — flujo en cuatro pasos:

1. **Descargar plantilla** (`descargarEjemploCSV`): genera CSV con columnas `nombre, valor_cuota, telefono, email, documento`
2. **Seleccionar archivo** (`handleArchivoCSV`):
   - Lee como texto, separa por `\n`
   - Primera línea = encabezados (lowercase)
   - Exige obligatorios: `nombre`, `valor_cuota`, `telefono`
   - Construye `sociosPreview` descartando filas sin los tres obligatorios
3. **Vista previa:** tabla Nombre / Cuota / Teléfono + conteo de socios válidos; error visible si no hay ninguno
4. **Importar** (`importarSocios`):
   - Por cada socio: `agregarSocio()` sin cuotas automáticas, periodicidad por defecto `mensual`
   - Contabiliza importados y errores (valida unicidad de teléfono)
   - Registra auditoría de importación masiva
   - Resumen final: "Se importaron X socios. Y tuvieron errores" (detalla primeros 5)
   - Si ≥1 importado, recarga lista

---

### 4.9 Selector de contactos del dispositivo

`abrirSelectorContactos()` — visible solo si `contactPickerDisponible` (detectado en `onMounted`).

1. Llama `navigator.contacts.select()` o `.pick()` según API
2. Extrae teléfono manejando formatos heterogéneos: `contacto.tel`, `contacto.phoneNumbers`, `contacto.phoneNumber`
3. Aplica `limpiarNumeroTelefono()`
4. Autocompleta nombre (`name` / `displayName` / `givenName + familyName`) y email si están vacíos
5. Manejo de errores:
   - `AbortError` / `NotAllowedError` → "Permiso denegado"
   - `NotSupportedError` → "No está soportado en este dispositivo"
   - Otros → mensaje genérico
6. Cancelación silenciosa (sin toast)

---

### 4.10 Comprobante de salida

**Modal `comprobanteDesactivacion`** — presentado tras desactivar y reabrible.

Contenido visual (con estilos inline para que `html-to-image` lo capture fielmente): icono ámbar de salida, título "Liquidación por Salida", código `SAL-XXXXXXXX`, datos (socio, fecha), resumen (total ahorrado en verde, sanción por retiro en rojo si `>0`, valor a entregar en ámbar destacado), footer con logo Natillerapp.

Acciones:
- **Descargar** (`descargarComprobanteDesactivacion`): `toPng(comprobanteDesactivacionRef)` → descarga PNG
- **Compartir** (`compartirWhatsAppDesactivacion`): abre `wa.me` con el texto del comprobante; si no hay teléfono del socio, se solicita uno

Cache en `comprobantesSalidaGuardados` (mapa por `socio_id`) para evitar refetch al reabrir.

---

## 5. Búsqueda, orden y agrupación

- **Búsqueda:** `sociosFiltrados` filtra por `nombre` (lowercase), `documento` (lowercase) y `telefono` (inclusión). Limpieza vía botón `X`, tecla `Esc` o CTA "Limpiar búsqueda"
- **Orden principal:** el de la store (no hay control de orden en la lista)
- **Orden en modales:** cuotas del socio → año, mes, fecha de vencimiento asc; cuotas pagadas del detalle → fecha de pago desc
- **Agrupación:** no hay. Existe una distinción visual implícita activo/inactivo (grayscale + opacidad) pero ambos viven en el mismo grid

---

## 6. Reglas de negocio y cálculos

### 6.1 Resumen del socio (`resumenSocio`)
```
pagadas   = cuotas con estado 'pagada'
pendientes= cuotas con estado IN ('pendiente', 'parcial')
enMora    = cuotas con estado 'mora'

totalAportado  = Σ valor_pagado
totalPendiente = Σ (valor_cuota - valor_pagado) sobre pendientes ∪ mora
alDia          = pendientes.length === 0 && enMora.length === 0
```

### 6.2 Estado real de cuota (`calcularEstadoRealCuota`)
Convierte fechas a `YYYY-MM-DD` @ 00:00 para comparar:
1. Si `valor_pagado >= valor_cuota` → **pagada**
2. Si `hoy < fecha_limite` → **programada**
3. Si `fecha_limite <= hoy <= fecha_vencimiento` → **pendiente** (donde `fecha_vencimiento = fecha_limite + dias_gracia`)
4. Si `hoy > fecha_vencimiento` → **mora**

### 6.3 Sanciones
Si la cuota tiene `valor_multa` persistido se respeta (no se recalcula). Si no, cuando está en mora y las sanciones de la natillera están activas, se calcula dinámicamente en escalones (5 %, 10 %, 15 % según días). Con sanciones inactivas, la multa es 0.

### 6.4 Liquidación al desactivar
```
valorRecaudado = totalAhorrado
% = clamp(desactivarPorcentajeSancion, 0, 100)

con sanción:  entregar = recaudado * (1 - %/100),  fondo = recaudado * %/100
sin sanción:  entregar = recaudado,                fondo = 0

totalSalida   = entregar + fondo   // esto es lo que se descuenta de caja
```

### 6.5 Días en mora
```
dias = Math.max(0, floor((hoy - fecha_vencimiento) / 1día))
```

### 6.6 Generación batch de cuotas
Recorre el rango `(anio_inicio, mes_inicio) .. (anio_fin, mes_fin)` de la natillera:
- Mensual → 1 cuota por mes, `fecha_limite` = último día del mes
- Quincenal → 2 cuotas por mes, `fecha_limite` = día 15 y último día; `quincena ∈ {1, 2}`

Un único `insert` con todas las filas (~10× más rápido que inserciones unitarias).

### 6.7 Unicidad de teléfono
`verificarTelefonoUnico(telefono, natilleraId, socioIdExcluir?)` — busca en `socios_natillera` de la natillera; excluye el propio al editar. Retorna `false` si existe otro → marca `errorTelefonoDuplicado`.

---

## 7. Estados del socio y transiciones

Dos estados visibles en esta vista: `activo` e `inactivo`.

```
activo
 ├──► inactivo    (abrirModalDesactivar → confirmarDesactivarSocio)
 │                crea: movimiento salida + (opcional) sanción + comprobante
 │
 └──► eliminado   (confirmarEliminarSocio — cascada FK)

inactivo
 ├──► activo      (abrirModalActivar → confirmarActivarSocio)
 │                revierte: movimiento entrada + (opcional) reversa sanción + borra comprobante
 │
 └──► eliminado   (confirmarEliminarSocio — cascada FK)
```

`cambiarEstadoSocio(id, estado)` solo actualiza `socios_natillera.estado`; no toca caja — eso corresponde a la lógica específica de desactivar/activar.

---

## 8. Permisos y roles

```js
esVisor = miRol === 'visor'
esAdmin = natilleraActual.admin_id === usuarioAutenticado.id
```

| Acción | Admin/Editor | Visor |
|--------|:---:|:---:|
| Ver lista y buscar | ✅ | ✅ |
| Ver detalle | ✅ | ✅ |
| Ver cuotas | ✅ | ✅ |
| Agregar / editar / eliminar / desactivar / activar | ✅ | ❌ |
| Importar CSV | ✅ | ❌ |
| Botón WhatsApp en modal de cuotas | ✅ | ❌ |
| Navegar al mes de una cuota al click | ✅ | ❌ (read-only) |

Obtención del rol en `onMounted`: si el usuario es el `admin_id` de la natillera → `administrador` inmediato; si no, dispara `colaboradoresStore.obtenerMiRol(id)` de forma asíncrona.

---

## 9. Flujos alternativos y edge cases

| Caso | Comportamiento |
|------|----------------|
| Natillera sin socios | Tarjeta "No hay socios registrados" + CTA "Agregar Primer Socio" + tour guiado al crear el primero |
| Búsqueda sin resultados | Tarjeta con término + botón "Limpiar búsqueda" |
| Teléfono duplicado | `verificarTelefonoUnico` falla → `errorTelefonoDuplicado = true` → banner rojo bajo el input; no se guarda |
| Error de Supabase | Try-catch → `notificationStore.error()`; en modal progreso se muestra error con CTA "Cerrar" |
| Natillera mensual | Selector de periodicidad fijado a "Mensual" (disabled) con nota |
| Cambio de periodicidad | Elimina todas las cuotas (incluidas pagadas) y regenera — por eso hay advertencia en el input |
| Contact Picker no disponible | Botón "Contactos" oculto; en dev se loguea `razonNoDisponible` |
| Socio sin teléfono | Desactivación funciona normal; botón WhatsApp del comprobante pide teléfono; filas del modal cuotas ocultan el botón |
| Activar socio sin comprobante previo | Solo cambia estado; no toca caja |
| CSV vacío o con encabezados incompletos | Error bloqueante en preview |
| CSV con filas incompletas | Se ignoran silenciosamente, no entran a la preview |
| CSV con errores parciales | Importa los válidos, muestra resumen con primeros 5 errores, recarga lista si ≥1 se creó |
| Paso 2 de progreso (cuotas) falla | Socio sí se creó → aviso "Socio creado. Algunas cuotas no se generaron" (éxito parcial) |
| Modal sobre-scrolleable en iOS | `useModalBodyScrollOverflow` + hint "Desliza para ver más" con gradient de fade |

---

## 10. Navegación

**Entrada:**
- Desde el detalle de natillera (`/natilleras/:id`) por menú "Socios" → `/natilleras/:id/socios`
- Con `?agregar=true` → abre modal agregar al montar y limpia el query

**Salida:**
| Destino | Trigger |
|---------|---------|
| `/natilleras/:id` | `BackButton` |
| `/natilleras/:id/cuotas/:mes` | Click en fila del modal de cuotas (solo si no visor) |
| `/dashboard` | Fallback si el `id` es inválido |

**Botón atrás del navegador:** cada apertura de modal hace `history.pushState`; el handler `handlePopState` cierra modales en orden de z-index al recibir `popstate`.

---

## 11. UX móvil

- **Bottom-sheets en móvil** (`rounded-t-2xl|3xl`, align bottom, `max-h: 90dvh`), centrados en desktop (`rounded-2xl`, `max-w-md|2xl`)
- **Safe-area:** `env(safe-area-inset-top/bottom)` en headers y footers de modales
- **Touch:** botones ≥48 px, `touch-manipulation`, `-webkit-tap-highlight-color: transparent`
- **Animaciones:** `<TransitionGroup name="socio-card">` para entradas/salidas de tarjetas; modal progreso con aura pulsante, anillo giratorio, estrellas, check animado, timeline de pasos
- **Natiscroll hint:** "Desliza para ver más" cuando el contenido de un modal desborda el viewport
- No hay swipe, pull-to-refresh ni infinite scroll (la lista es acotada y ya hay búsqueda)

---

## 12. Notificaciones

**Toasts (`notificationStore`):**
- `success`: "X ha sido agregado a la natillera" · "Los datos de X han sido actualizados" · "X ha sido activado"
- `warning`: "X ha sido desactivado" · "Ha sido eliminado de la natillera"
- `error`: genéricos de red/Supabase

**Errores en formulario:**
- `errorSocio` — banner rojo general debajo del form
- `errorTelefonoDuplicado` — banner específico sobre el input de teléfono
- Cuota `<=0` — mensaje "El valor de la cuota debe ser mayor a cero"

**Tooltips/advertencias:**
- Icono info junto al campo cuota en edición → despliega explicación del impacto en cuotas ya generadas

---

## 13. Funciones auxiliares destacadas

| Función | Propósito |
|---------|-----------|
| `formatMoney(v)` | `Intl.NumberFormat('es-CO')` → `"1.234.567"` |
| `formatearValorCuota(v)` | Limpia puntos y aplica `formatMoney` |
| `handleValorCuotaInput(e)` | Parse en vivo a número |
| `handleValorCuotaBlur(e)` | Limpia visualmente si termina en 0 |
| `limpiarNumeroTelefono(t)` | Normaliza a 10 dígitos Colombia |
| `getAvatarUrl(seed, style)` | URL DiceBear 7.x con fondos por estilo |
| `handleAvatarError(e, seed)` | Fallback de avatar |
| `programarTourMenuNatilleraSiCorresponde` | Dispara tour si era el primer socio |
| `handleModalBack` / `handlePopState` | Integración con el botón atrás del navegador |
| `getMesLabel(mes)` / `getMesEmoji(mes)` / `formatDate(d)` | Formateo de fechas y meses |

**Constantes:**
- `avatarSeeds` — array de 100+ nombres para semillas aleatorias
- `meses` — mapping mes→label
- `periodicidadNatillera` (computed) — espejo de la periodicidad de la natillera

---

## 14. Resumen ejecutivo

La vista **Socios** es un módulo CRUD especializado con capas financieras:

1. **Ciclo de vida completo:** crear (uno o en lote por CSV), editar, desactivar con liquidación y sanción opcional, reactivar con reversa automática, eliminar en cascada.
2. **Inteligencia financiera:** resumen por socio (aportado, pendiente, mora), estados de cuota según reglas de gracia, generación batch y regeneración al cambiar periodicidad, liquidación con comprobante PNG.
3. **UX iOS-first:** bottom-sheets, safe-area, natiscroll hint, modal progreso con animaciones premium, integración con el botón atrás del navegador, Contact Picker API y `wa.me` para WhatsApp.
4. **Permisos:** lectura para visor, CRUD y operaciones financieras solo para admin/editor.
5. **Robustez:** validación de teléfono único, unicidad excluyendo al propio en edición, manejo de errores de Supabase, éxito parcial en generación de cuotas, tours guiados para onboarding del primer socio.

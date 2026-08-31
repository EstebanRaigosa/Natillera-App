# Especificación — Eliminar pago de cuota

| Campo | Valor |
|-------|-------|
| **Módulo** | Cuotas y pagos |
| **Estado** | RF-09, RF-10, RF-11 y RF-13 implementados · pendiente RF-12 |
| **Versión** | 1.3 |
| **Fecha** | 2026-08-30 |
| **Autor** | Esteban |
| **Rama base** | `vistas` |
| **Ruta de la app** | `/natilleras/:id/cuotas/:mes` |
| **Archivos** | `src/views/cuotas/Cuotas.vue`, `src/stores/cuotas.js`, `migrations/019_eliminar_pago_cuota.sql`, `migrations/020_reversion_pago_utilidades_y_comprobantes.sql` |

---

## 0. Cómo leer este documento

| Estado | Significado |
|--------|-------------|
| 🟢 **Construido** | Ya existe en el código, verificado con evidencia `archivo:línea`. La spec lo fija como contrato. |
| 🟡 **Parcial** | Existe pero con una desviación o un vacío concreto. |
| 🔴 **Por construir** | No existe. Es desarrollo pendiente. |

### Hallazgo de partida

**La funcionalidad ya está implementada.** Verificado el 2026-08-30 sobre la rama `vistas`:
el botón de eliminar existe en **seis** puntos del template, el modal de confirmación está
construido con `ModalWrapper`, el store tiene previsualización y reversión completas, y la
migración `019_eliminar_pago_cuota.sql` habilita el enlace de trazabilidad y las políticas RLS
de borrado.

Lo pedido en el enunciado del requerimiento —botón visible en pagos **completos y parciales**,
que revierta cuota, préstamos, actividades, 4×1000 y sanciones— **está cubierto** (RF-01 a RF-08).

Lo que esta especificación aportó fueron **dos vacíos contables** detectados al contrastar el
registro del pago contra su reversión. El más grave (RF-09) **desvirtuaba el reparto de utilidades
en el cierre de la natillera**. Ambos se implementaron en la **v1.1**; quedan pendientes RF-11
(acceso del superusuario) y RF-12 (`alert()` nativo), que son desviaciones, no vacíos.

---

## 1. Objetivo

Permitir que el administrador de la natillera **elimine un pago registrado por error** en una
cuota, devolviendo el sistema al estado exacto anterior a ese pago: la deuda vuelve a existir, y
todo lo que el pago tocó —cuota, sanción, actividades, abonos a préstamo y GMF— se revierte.

Corregir un error de digitación no puede obligar a reconstruir a mano el préstamo, las
actividades y la sanción del socio.

## 2. Contexto y alcance

### 2.1 Por qué un pago no es una sola fila

Un pago de cuota se reparte entre varias tablas. Revertirlo exige deshacer cada efecto:

| Efecto del pago | Tabla | Se revierte en |
|-----------------|-------|----------------|
| Valor pagado, desglose, GMF, estado, comprobante | `cuotas` | RF-05 |
| Transacción del pago | `historial_pagos_cuota` | RF-08 |
| Abonos a cuotas de préstamo | `pagos_prestamo`, `plan_pagos_prestamo`, `prestamos` | RF-04 |
| Actividades cubiertas | `socios_actividad` | RF-03 |
| Utilidad por sanción cobrada | `utilidades_clasificadas` | **RF-09 — pendiente** |
| Snapshot del comprobante | `historial_comprobantes` | **RF-10 — pendiente** |

El problema histórico era que no existía vínculo entre la transacción y sus efectos colaterales,
así que revertir «obligaba a adivinar por fecha y monto»
(`migrations/019_eliminar_pago_cuota.sql`). La migración 019 lo resolvió añadiendo
`pagos_prestamo.historial_pago_cuota_id` y `socio_actividad_id` dentro de
`historial_pagos_cuota.detalle_actividades`.

### 2.2 Dentro del alcance

Eliminar una transacción de pago concreta y revertir todos sus efectos, desde la vista de Cuotas,
tanto en pagos completos como parciales, con previsualización del impacto antes de confirmar y
registro en auditoría.

### 2.3 Fuera del alcance

- **Editar** un pago (existe aparte: «Editar pago» y su comprobante de modificación).
- Eliminar la **cuota** completa (existe aparte: borrado de cuotas del mes).
- Deshacer la eliminación (**no hay papelera ni undo**): lo eliminado se recupera volviendo a
  registrar el pago.
- Eliminar pagos desde el módulo de Préstamos o de Actividades.
- Eliminar pagos de una natillera **cerrada** (ver PA-3, pregunta abierta).

### 2.4 Supuestos

- S-1: La migración `019` está aplicada en el Supabase de producción. Si no lo está, la reversión
  de préstamos degrada al modo por detalle guardado y la app avisa (RF-06).
- S-2: No hay transacción de base de datos disponible desde el cliente; la reversión es una
  secuencia de operaciones, no un bloque atómico (RNF-02).

## 3. Actores y permisos

| Actor | Puede eliminar un pago | Evidencia |
|-------|------------------------|-----------|
| **Administrador de la natillera** (`natilleras.admin_id = auth.uid()`) | Sí | `Cuotas.vue:9082` (`esAdmin`), `Cuotas.vue:10211` (`puedeEliminarPago`), política RLS en `migrations/019:...delete_admin_or_super` |
| **Superusuario** (`raigo.16@gmail.com`) | Sí, en cualquier natillera | `puedeEliminarPago` acepta `esAdmin || esUsuarioAdmin` (v1.2), alineado con la política RLS `es_superusuario()` |
| **Colaborador** (aunque tenga permisos de gestión) | No | `puedeEliminarPago` exige `esAdmin`; ningún permiso JSONB lo habilita |
| **Visor** (`miRol === 'visor'`) | No | `Cuotas.vue:9068`, excluido explícitamente en `puedeEliminarPago` |
| **Socio** | No | No tiene acceso a la vista |

---

## 4. Requisitos funcionales

### 4.1 Resumen

| ID | Requisito | Estado | Prioridad |
|----|-----------|--------|-----------|
| RF-01 | Botón «Eliminar pago» visible donde hay dinero pagado | 🟢 Construido | Must |
| RF-02 | Selección de la transacción a eliminar y previsualización del impacto | 🟢 Construido | Must |
| RF-03 | Reversión de actividades | 🟢 Construido | Must |
| RF-04 | Reversión de abonos a préstamo | 🟢 Construido | Must |
| RF-05 | Reversión de la cuota (valor, sanción, GMF, desglose, estado, comprobante) | 🟢 Construido | Must |
| RF-06 | Avisos cuando la reversión no puede ser exacta | 🟢 Construido | Must |
| RF-07 | Auditoría de la eliminación | 🟢 Construido | Must |
| RF-08 | Borrado de la transacción y refresco de la vista | 🟢 Construido | Must |
| **RF-09** | **Reversión de la utilidad por sanción (`utilidades_clasificadas`)** | 🟢 Construido (v1.1) | **Must — bloqueante contable** |
| **RF-10** | **Limpieza del snapshot en `historial_comprobantes`** | 🟢 Construido (v1.1) | Should |
| RF-11 | Acceso del superusuario al botón | 🟢 Construido (v1.2) | Should |
| RF-12 | Notificaciones con el sistema de la app en vez de `alert()` nativo | 🟡 Parcial | Should |
| **RF-13** | **Revertir un pago que no dejó transacción (pagos antiguos)** | 🟢 Construido (v1.3) | Must |

### 4.2 Detalle de lo construido

#### RF-01 — Botón «Eliminar pago» 🟢
- **Condición de visibilidad** (`Cuotas.vue:10211`): usuario `esAdmin`, no `esVisor`, y la cuota
  tiene dinero pagado en **cualquiera** de estos conceptos:
  `valor_pagado > 0` **o** `valor_pagado_sancion > 0` **o** `valor_pagado_actividades > 0`.
- **Cobertura de pagos completos y parciales:** la condición **no** mira el estado de la cuota, solo
  el dinero. Por eso aparece igual en cuotas `pagada`, `parcial` y `mora con abono`. Requisito del
  enunciado: **cumplido**.
- **Ubicaciones verificadas** (seis):
  | # | Contexto | Línea |
  |---|----------|-------|
  | 1 | Tarjeta de cuota, botonera desktop de pago parcial | `Cuotas.vue:845` |
  | 2 | Tarjeta de cuota, variante | `Cuotas.vue:890` |
  | 3 | Tarjeta de cuota, variante | `Cuotas.vue:934` |
  | 4 | Tarjeta de cuota, acción ancha | `Cuotas.vue:972` |
  | 5 | Vista lista | `Cuotas.vue:1485` |
  | 6 | Modal de detalle de la cuota | `Cuotas.vue:2372` |
  | 7 | **Modal de cuotas del socio** (junto a «Reenviar») | `Cuotas.vue:2647` |
- **Presentación:** icono `TrashIcon` sobre fondo `bg-red-50` con borde rojo, junto a los botones
  «Pagar / Pagar restante» (verde marca) y «Reenviar» (violeta). Área táctil `min-h-[44px]
  min-w-[44px]`, `touch-action: manipulation`, `aria-label` y `title` presentes.

#### RF-02 — Selección de transacción y previsualización 🟢
- Al abrir (`abrirModalEliminarPago`, `Cuotas.vue:10218`) se cargan **todas** las transacciones de
  `historial_pagos_cuota` de esa cuota, ordenadas por `fecha_pago` descendente.
- Si hay **una sola**, queda preseleccionada: no se le pide al usuario elegir lo obvio.
- Al seleccionar una, `previsualizarEliminacionPago` (`cuotas.js:3706`) calcula el impacto **sin
  tocar nada** y devuelve: valor total, valor de cuota, sanción, actividades, préstamos, GMF,
  detalle de actividades y de cuotas de préstamo, número de abonos enlazados, valor pagado actual
  de la cuota, estado actual y **avisos**.
- Si la cuota no tiene ninguna transacción, el modal muestra «No hay pagos que eliminar»
  (`Cuotas.vue:1719`) en vez de un modal vacío.
- **Modal:** `ModalWrapper` con `align="bottom"`, `persistent`, `ios-soft-backdrop`,
  `max-h-[90dvh]`, cabecera compacta (móvil en una fila, desktop centrada), cuerpo con natiscroll,
  `useBodyScrollLock` (`Cuotas.vue:7273`) y footer con `env(safe-area-inset-bottom)`.

#### RF-03 — Reversión de actividades 🟢
Orden y reglas (`cuotas.js:3816`):
1. **Vía exacta:** si `detalle_actividades` trae `socio_actividad_id`, se revierten esas filas.
2. **Vía aproximada:** si no (pagos anteriores a la migración 019), se emparejan por **nombre de
   actividad y valor**, sin repetir filas ya tomadas. Lo que no se encuentra se acumula en
   `problemas` y se informa.
3. Por cada fila: `valor_pagado` baja en el valor revertido, con piso en 0.
4. Si el nuevo pagado queda **por debajo del asignado**, se anula `codigo_comprobante`: el
   comprobante de la actividad deja de ser válido.
5. Desglose efectivo/transferencia: se descuenta de la forma de pago de la transacción; si fue
   **mixto**, se descuenta **a prorrata** del saldo actual para que efectivo + transferencia siga
   cuadrando.

#### RF-04 — Reversión de abonos a préstamo 🟢
(`cuotas.js:3883`)
1. Se buscan los abonos enlazados por `pagos_prestamo.historial_pago_cuota_id`. Si la columna no
   existe (migración sin aplicar), se trata como «sin enlace» sin romper.
2. Las cuotas del plan a descontar salen del enlace si existe, o de
   `historial_pagos_cuota.detalle_cuotas_prestamo` si no.
3. En `plan_pagos_prestamo`: baja `valor_pagado` y el desglose por forma de pago (prorrata en
   mixto); si queda por debajo de `valor_cuota`, se marca `pagada = false` y `fecha_pago = null`.
4. En `prestamos`: el monto vuelve a `saldo_actual` y, si el préstamo había quedado `pagado`,
   **se reabre a `activo`**.
5. Se **borran** las filas de `pagos_prestamo` enlazadas: contablemente ese abono ya no existe.
6. Cada cuota de préstamo no encontrada se reporta en `problemas`.

#### RF-05 — Reversión de la cuota 🟢
(`cuotas.js:3997`) Sobre `cuotas` se descuenta, con piso en 0:
`valor_pagado`, `valor_pagado_sancion`, `valor_pagado_actividades`, `impuesto_4x1000` y el
desglose `valor_pagado_efectivo` / `valor_pagado_transferencia` (prorrata en mixto).

- **Sanción devuelta a deuda:** `valor_multa` guarda la sanción **total**, no la pendiente. Si sigue
  en `> 0` ya es el total correcto y **no se le suma nada** (sumar la duplicaría); si está en 0
  porque la cuota se dio por pagada, se restaura con la sanción que se había abonado. Si la cuota
  tiene `no_calcular_multa`, queda en 0.
- **Estado:** se recalcula con `calcularEstadoRealCuotaStore`, no se asume.
- **Sin pago restante** (`valor_pagado <= 0`): `fecha_pago`, `codigo_comprobante` y `tipo_pago`
  quedan en `null` — la cuota vuelve a estar limpia.
- **Con pago restante:** `fecha_pago` pasa a ser la del último pago que sobrevive.
- **La fecha del pago no interviene:** mora y sanción se recalculan siempre contra hoy, y al
  terminar se dispara `actualizarEstadoMoraAutomatico()`.

#### RF-06 — Avisos de reversión no exacta 🟢
Antes de confirmar, la previsualización advierte cuando el dinero no se puede revertir con certeza:
- Actividades sin `socio_actividad_id`: «se revertirán buscándolas por nombre y valor; conviene
  revisarlas después en el módulo de Actividades».
- Abono a préstamo sin enlace: «se revertirá usando el detalle guardado (préstamo y número de
  cuota); conviene revisar el préstamo después».

Al terminar, si `problemas` no está vacío, se listan los conceptos que necesitan revisión manual.

#### RF-07 — Auditoría 🟢
(`cuotas.js:4074`) Se registra en segundo plano, con la fila completa del historial y metadatos:
`cuota_id`, socio, valor total y por concepto, GMF, valor pagado anterior y nuevo, estado anterior
y nuevo, número de actividades y abonos revertidos, y la lista de `problemas`.

#### RF-08 — Borrado y refresco 🟢
- La fila de `historial_pagos_cuota` se borra **al final**, después de revertir todo.
- Tras el éxito: `fetchCuotasNatillera(id)` completo —porque al devolver la deuda hay que
  recalcular mora y sanciones— y, si el modal de detalle está abierto sobre esa cuota, se refresca
  también su historial.

### 4.3 Detalle de lo pendiente

#### RF-09 — Revertir la utilidad por sanción 🟢 *(implementado en v1.1)*

- **Qué ocurre hoy al registrar el pago** (`cuotas.js:2128-2158`): si se cobró sanción y la cuota no
  tiene `no_calcular_multa`, el monto **se suma** a `utilidades_clasificadas` (tipo `sanciones`,
  `fecha_cierre IS NULL`, discriminado por `forma_pago`), creando la fila o actualizando el
  acumulador existente. Descripción: «Multas pagadas por cuotas en mora».
- **El defecto que corrigió v1.1:** `eliminarPagoHistorial` no tocaba `utilidades_clasificadas`,
  así que la sanción volvía a ser deuda del socio (RF-05) **pero seguía contada como utilidad del
  fondo**. Como `calcularCierreNatillera()` reparte las utilidades entre todos los socios
  (`useCierreNatillera.js`, tipo `sanciones`), el cierre **repartía plata que nadie pagó**. El error
  era silencioso, acumulativo y solo habría aparecido al cerrar la natillera.
- **Implementación:** paso 3 de la reversión (`cuotas.js`), entre los préstamos y la cuota, para
  respetar RN-08 — los efectos externos van primero.
  - La natillera se resuelve con `obtenerNatilleraDeCuota()`: la cuota no la guarda, se llega por
    `socios_natillera`.
  - `getUtilidadesSancionAbiertas()` trae las filas abiertas de tipo `sanciones` y las ordena por
    prioridad: primero la de **la misma forma de pago**, luego la que **no tiene** forma de pago,
    luego el resto. Hace falta porque el registro solo guarda `forma_pago` cuando el tipo de pago
    era uno de los tres válidos, mientras que el historial siempre guarda algo (`efectivo` por
    defecto): la coincidencia exacta no basta.
  - El descuento va **en cascada** sobre esas filas hasta agotar el monto, con piso en 0. Si sobra
    monto sin descontar, se informa cuánto quedó contado como utilidad.
- **Reglas respetadas:**
  - Ningún monto queda **negativo**.
  - Si la cuota tenía `no_calcular_multa`, no se registró utilidad y no se toca nada.
  - Si la utilidad ya fue **cerrada** (`fecha_cierre IS NOT NULL`), **no** se modifica: pertenece a
    un ciclo liquidado. Se avisa **antes** de confirmar y se registra en `problemas`.
  - El fallo al revertir la utilidad **no** aborta la reversión ya hecha: se acumula en `problemas`,
    igual que actividades y préstamos.
- **Visible antes de confirmar:** el modal muestra la línea «Utilidad por sanciones del fondo» con
  el antes y el después.

#### RF-10 — Limpiar el snapshot en `historial_comprobantes` 🟢 *(implementado en v1.1)*
- **Qué ocurre hoy:** al registrar el pago se inserta una fila en `historial_comprobantes`
  (`cuotas.js:2253`). Esa tabla es la que alimenta el bloque «historial de pagos» del modal de
  detalle (`Cuotas.vue:10334`).
- **El defecto que corrigió v1.1:** esa fila quedaba huérfana y el modal de detalle seguía
  mostrando el comprobante de un pago que ya no existía, con su código y sus valores.
- **Implementación:** paso 5 de la reversión, después de la cuota y antes de borrar la transacción.
  - La migración 020 añadió `historial_comprobantes.historial_pago_cuota_id`, que `registrarPago`
    ahora rellena esperando el id de la transacción.
  - Solo se borran las filas **enlazadas a esta transacción**. Las de motivo `edicion_cuota_pagada`
    y `actualizacion_pago` nacen de **editar** la cuota, no de pagarla, y no se tocan.
  - **Sin enlace no se borra nada** (pagos anteriores a la migración): coincidir por monto y fecha
    sería adivinar. Se avisa para revisar a mano.
  - El DELETE pide su resultado con `.select('id')`: sin política de borrado la operación «tiene
    éxito» sin borrar nada, y el fallo quedaría mudo.

#### RF-11 — Acceso del superusuario 🟢 *(implementado en v1.2)*
- La política RLS de la migración 019 autoriza `es_superusuario() OR admin_id = auth.uid()`, pero
  la UI exige `esAdmin` (`natillera.admin_id === usuario.id`, `Cuotas.vue:9082`).
- **Efecto que tenía:** `raigo.16@gmail.com` no veía el botón en ninguna natillera de la que no
  fuera `admin_id`, aunque la base de datos se lo permitía. Detectado en uso real: el botón no
  aparecía en el modal de cuotas del socio pese a estar en el código.
- **Implementación (v1.2):** `puedeEliminarPago` acepta `esAdmin || esUsuarioAdmin`, coherente con
  el resto de controles de superusuario del proyecto (`borrarCuotasMes` ya usaba `esUsuarioAdmin`).
  Los dos criterios de superusuario dentro de la misma vista eran la causa de que un control
  apareciera y el otro no.
- **Descubribilidad:** en el modal de cuotas del socio el botón pasó de ser un cuadrado con solo
  icono a llevar la etiqueta **«Eliminar»**, como sus vecinos «Pagar» y «Reenviar». Sin texto, en
  una cuota pagada quedaba como un cuadrito rojo suelto junto a un botón violeta ancho.

#### RF-12 — Notificaciones del sistema 🟡 (desviación D-2)
- `abrirModalEliminarPago` y `confirmarEliminarPago` usan **`alert()` nativo** en los cuatro caminos
  de error y en el aviso de problemas (`Cuotas.vue:10243, 10257, 10291, 10309, 10315`).
- Rompe el patrón visual del proyecto y, en iOS, un diálogo nativo **bloquea la interacción** con la
  página hasta ser cerrado; encima de un modal abierto es especialmente áspero.
- **Requisito:** sustituir por el sistema de notificaciones de la app (`NatiNotificacion` /
  `mostrarNotificacion`), reservando el listado de `problemas` para un bloque dentro del modal.

#### RF-13 — Revertir un pago sin transacción registrada 🟢 *(implementado en v1.3)*

- **Situación:** las cuotas pagadas antes de que existiera `historial_pagos_cuota` tienen el dinero
  en la propia fila de `cuotas`, pero ninguna transacción. El modal decía «No hay pagos que
  eliminar» y dejaba al administrador sin salida: para corregir un pago viejo había que editarlo a
  mano concepto por concepto.
- **Enlace disponible:** el `codigo_comprobante` de la cuota. Tanto `socios_actividad`
  (`Cuotas.vue:11089`) como `pagos_prestamo` (`Cuotas.vue:11332`, con `origen = 'cuota_natillera'`)
  lo guardan al pagarse desde la cuota. **No se empareja por monto ni por fecha.**
- **Comportamiento:** se revierte el **pago completo** de la cuota — sin transacciones no hay abonos
  separables — y el modal lo advierte antes de confirmar.
  | Concepto | Cómo se revierte |
  |----------|------------------|
  | Actividades | Filas de `socios_actividad` con ese código, descontando hasta agotar `valor_pagado_actividades` |
  | Abonos a préstamo | Filas de `pagos_prestamo` con ese código y origen `cuota_natillera`; el plan se descuenta empezando por la cuota más alta (deshacer lo último primero) |
  | Sanción | Igual que RF-09: sale de `utilidades_clasificadas` |
  | Cuota | Todos los valores pagados a 0; `fecha_pago`, `codigo_comprobante` y `tipo_pago` a `null`; estado recalculado |
  | Comprobantes | Se borran los snapshots `completar_pago_parcial` de esa cuota |
- **Cuando no hay código de comprobante:** solo se revierte la cuota y se avisa de que las
  actividades y los préstamos no se pudieron identificar. Nunca se borra por aproximación.
- **Auditoría:** se registra sobre la tabla `cuotas` con `modo: 'pago_directo_sin_transaccion'` y el
  código de comprobante usado como enlace.

---

## 5. Reglas de negocio

| ID | Regla | Estado |
|----|-------|--------|
| RN-01 | Se elimina **una transacción de pago**, no «el pago de la cuota». Una cuota con varios abonos conserva los demás. | 🟢 |
| RN-02 | La reversión devuelve **deuda**, no dinero: la cuota vuelve a deber lo revertido y la mora se recalcula contra **hoy**, no contra la fecha del pago eliminado. | 🟢 |
| RN-03 | Ningún valor revertido puede quedar **negativo**: todo descuento tiene piso en 0. | 🟢 |
| RN-04 | En pago **mixto**, el descuento efectivo/transferencia se hace **a prorrata** del saldo actual, porque la transacción no guardó su propio desglose. | 🟢 |
| RN-05 | Un préstamo que había quedado `pagado` **se reabre a `activo`** si se revierte un abono suyo. | 🟢 |
| RN-06 | Una actividad que deja de estar completamente pagada **pierde su código de comprobante**. | 🟢 |
| RN-07 | `valor_multa` es la sanción **total**, no la pendiente: si ya es `> 0` no se le suma la revertida (se duplicaría). | 🟢 |
| RN-08 | El orden de reversión es deliberado: **primero** los efectos externos (actividades, préstamos), **después** la cuota y **al final** el historial. Si algo falla a mitad, la cuota todavía refleja el pago y la operación **puede reintentarse**. | 🟢 |
| RN-09 | La eliminación **no es reversible**: no hay papelera. La única vuelta atrás es volver a registrar el pago. | 🟢 |
| **RN-10** | **El dinero revertido no puede seguir contando como utilidad del fondo.** Toda sanción devuelta a deuda debe salir de `utilidades_clasificadas`. | 🟢 v1.1 |
| **RN-11** | **Una utilidad ya cerrada (`fecha_cierre IS NOT NULL`) no se modifica**: pertenece a un ciclo liquidado. Se avisa y se registra en `problemas`. | 🟢 v1.1 |
| RN-12 | Solo el administrador de la natillera elimina pagos. Ni colaboradores ni visores, en ningún caso. | 🟢 |

---

## 6. Modelo de datos

### 6.1 Construido (migración 019)

| Cambio | Detalle |
|--------|---------|
| `pagos_prestamo.historial_pago_cuota_id` | `uuid`, FK a `historial_pagos_cuota(id)` `ON DELETE SET NULL`, con índice parcial. Enlaza el abono con la transacción que lo originó. |
| `historial_pagos_cuota.detalle_actividades` | `jsonb`. Cada entrada: `{ socio_actividad_id, nombre, tipo, valor }`. |
| `historial_pagos_cuota.detalle_cuotas_prestamo` | `jsonb`. Préstamo y número de cuota por línea. |
| RLS `historial_pagos_cuota_delete_admin_or_super` | DELETE para superusuario o admin de la natillera dueña de la cuota. |
| RLS `pagos_prestamo_delete_admin_or_super` | DELETE para superusuario o admin de la natillera del préstamo. |

La escritura de estos enlaces al registrar el pago está confirmada:
`socio_actividad_id` en `Cuotas.vue:13391`, y los detalles en `cuotas.js:2223` y `cuotas.js:2225`.

### 6.2 Construido en v1.1 — migración 020

| Cambio | Detalle |
|--------|---------|
| `historial_comprobantes.historial_pago_cuota_id` | `uuid`, FK a `historial_pagos_cuota(id)` `ON DELETE SET NULL`, con índice parcial. Permite borrar el comprobante exacto sin tocar los nacidos de una edición de cuota. |
| RLS `historial_comprobantes_delete_admin_or_super` | DELETE para superusuario o admin de la natillera. **La tabla tenía RLS con SELECT e INSERT pero ninguna política de DELETE**: sin ella el borrado no fallaba, simplemente no borraba nada. |

**RF-09 no requirió cambios de esquema**: `utilidades_clasificadas` ya tiene `tipo`, `forma_pago` y
`fecha_cierre`, y la política de UPDATE para miembros operativos ya existía (`migrations/016`).

**PA-2 resuelto:** la fila se **borra**, no se marca como anulada. La trazabilidad de la eliminación
queda en Auditoría, que guarda la transacción completa.

---

## 7. Interfaz de usuario

- **Botón:** icono papelera, `bg-red-50` / borde `red-200` / texto `red-700`, ancho fijo junto a
  «Pagar» y «Reenviar», que se reparten el resto de la fila. En el modal de cuotas del socio es el
  tercer botón de la fila.
- **Modal:** `ModalWrapper`, `align="bottom"` (hoja inferior en móvil, centrado en desktop),
  `persistent` —no se cierra por toque accidental en el velo—, `ios-soft-backdrop`, velo salvia
  `#C8D9C8/70`, cabecera verde marca `#1B5E37` con papelera roja sobre círculo blanco.
- **Cuerpo:** socio y período · lista de transacciones seleccionables · desglose del impacto ·
  avisos en ámbar · natiscroll «Desliza para ver más».
- **Estados:** cargando transacciones · sin transacciones · calculando impacto · eliminando.
- **iOS:** `max-h-[90dvh]`, `env(safe-area-inset-top)` en cabecera y `-bottom` en footer,
  `useBodyScrollLock`, `overscroll-contain`, `-webkit-overflow-scrolling: touch`,
  botones ≥ 44×44 px con `touch-action: manipulation`.

## 8. Requisitos no funcionales

| ID | Requisito | Estado |
|----|-----------|--------|
| RNF-01 | La previsualización **no modifica nada**: es solo lectura. | 🟢 |
| RNF-02 | Sin transacción de BD desde el cliente, la reversión es **secuencial y reintentable**: si falla a mitad, la cuota aún refleja el pago y se informa qué sí se revirtió. | 🟢 |
| RNF-03 | La eliminación es una acción destructiva sin vuelta atrás: exige confirmación explícita con el impacto a la vista. | 🟢 |
| RNF-04 | Toda eliminación queda auditada con actor, valores y problemas. | 🟢 |
| RNF-05 | iOS/Safari y `natillerapp-modals` según `CLAUDE.md`. | 🟢 |
| RNF-06 | Ningún error de la operación puede dejar el modal en estado ambiguo: o se informa el fallo, o se cierra tras el éxito. | 🟡 (usa `alert()`, RF-12) |
| RNF-07 | **Consistencia contable:** tras eliminar un pago, la suma de utilidades del fondo debe corresponder a dinero efectivamente cobrado. | 🟢 v1.1 |

---

## 9. Criterios de aceptación

- **CA-01 (RF-01):**
  *Dado* un socio con una cuota **pagada completa**,
  *cuando* el administrador abre el modal de cuotas del socio,
  *entonces* junto al botón «Reenviar» aparece el botón de eliminar con icono de papelera.

- **CA-02 (RF-01):**
  *Dado* una cuota con **pago parcial** (por ejemplo $30.000 de $50.000),
  *cuando* el administrador abre ese mismo modal,
  *entonces* ve los tres botones: «Pagar restante», «Reenviar» y eliminar.

- **CA-03 (RF-01):**
  *Dado* una cuota **sin ningún pago**,
  *cuando* se abre el modal,
  *entonces* el botón de eliminar **no** aparece.

- **CA-04 (RF-01, RN-12):**
  *Dado* un usuario con rol **visor** o un colaborador,
  *cuando* abre una cuota pagada,
  *entonces* el botón de eliminar no aparece en ninguna de las siete ubicaciones.

- **CA-05 (RF-02):**
  *Dado* una cuota con **dos** transacciones de pago,
  *cuando* el administrador abre el modal de eliminar,
  *entonces* ve ambas listadas por fecha descendente y ninguna preseleccionada.

- **CA-06 (RF-02):**
  *Dado* una cuota con **una sola** transacción,
  *cuando* abre el modal,
  *entonces* la transacción queda preseleccionada y el impacto se calcula sin pasos extra.

- **CA-07 (RF-02, RNF-01):**
  *Dado* el modal con una transacción seleccionada,
  *cuando* el administrador **cierra el modal sin confirmar**,
  *entonces* la cuota, el préstamo y las actividades quedan exactamente como estaban.

- **CA-08 (RF-05):**
  *Dado* una cuota pagada por $50.000 cuya única transacción cubrió solo cuota,
  *cuando* se elimina el pago,
  *entonces* `valor_pagado` queda en 0, `fecha_pago`, `codigo_comprobante` y `tipo_pago` en `null`,
  y el estado se recalcula a `pendiente` o `mora` según la fecha límite y el día de hoy.

- **CA-09 (RF-05, RN-01):**
  *Dado* una cuota con dos abonos ($30.000 y $20.000),
  *cuando* se elimina **solo** el segundo,
  *entonces* `valor_pagado` queda en $30.000, el estado pasa a `parcial` y `fecha_pago` es la del
  primer abono, que sobrevive.

- **CA-10 (RF-05):**
  *Dado* un pago por transferencia que cobró 4×1000,
  *cuando* se elimina,
  *entonces* `impuesto_4x1000` baja exactamente en el GMF de esa transacción y
  `valor_pagado_transferencia` en la parte de cuota.

- **CA-11 (RF-05, RN-07):**
  *Dado* una cuota en mora cuya sanción de $5.000 se pagó completa dejando `valor_multa` en 0,
  *cuando* se elimina el pago,
  *entonces* `valor_multa` vuelve a $5.000 —no a $10.000— y `valor_pagado_sancion` queda en 0.

- **CA-12 (RF-04, RN-05):**
  *Dado* un préstamo que quedó en estado `pagado` con su última cuota cubierta desde una cuota de
  natillera,
  *cuando* se elimina ese pago,
  *entonces* el préstamo vuelve a `activo`, `saldo_actual` recupera el monto del abono, la cuota del
  plan queda `pagada = false` con `fecha_pago = null`, y la fila de `pagos_prestamo` ya no existe.

- **CA-13 (RF-03, RN-06):**
  *Dado* un pago que cubrió completamente una actividad,
  *cuando* se elimina,
  *entonces* `socios_actividad.valor_pagado` baja en ese valor y `codigo_comprobante` de la
  actividad queda en `null`.

- **CA-14 (RF-03, RF-04, RN-04):**
  *Dado* un pago **mixto** (efectivo + transferencia) que cubrió actividad y cuota de préstamo,
  *cuando* se elimina,
  *entonces* en cada fila afectada la suma de `valor_pagado_efectivo + valor_pagado_transferencia`
  sigue siendo igual a su `valor_pagado`, sin negativos.

- **CA-15 (RF-06):**
  *Dado* un pago registrado **antes** de la migración 019 (sin `socio_actividad_id`),
  *cuando* el administrador abre el modal de eliminar,
  *entonces* ve el aviso de que las actividades se revertirán por nombre y valor, **antes** de
  confirmar.

- **CA-16 (RF-06):**
  *Dado* una reversión en la que no se encuentra una actividad o una cuota de préstamo,
  *cuando* la operación termina,
  *entonces* el pago se elimina igualmente y se informa la lista de conceptos que necesitan
  revisión manual.

- **CA-17 (RF-07, RNF-04):**
  *Dado* un pago eliminado,
  *cuando* el administrador entra a Auditoría,
  *entonces* encuentra el registro con el valor total, el desglose por concepto, el estado anterior
  y el nuevo, y el conteo de actividades y abonos revertidos.

- **CA-18 (RF-08):**
  *Dado* un pago eliminado con éxito,
  *cuando* se cierra el modal,
  *entonces* la tarjeta de la cuota muestra el estado y los valores nuevos sin recargar la página, y
  la mora se recalcula.

- **CA-19 (RF-09, RN-10):**
  *Dado* una natillera cuyas `utilidades_clasificadas` de tipo `sanciones` suman $50.000, y un pago
  que aportó $5.000 de sanción,
  *cuando* se elimina ese pago,
  *entonces* la utilidad de sanciones queda en $45.000 y la proyección de cierre de cada socio baja
  en consecuencia.

- **CA-20 (RF-09, RN-11):**
  *Dado* que la utilidad de sanciones ya fue cerrada (`fecha_cierre` con valor),
  *cuando* se elimina un pago que aportó a ella,
  *entonces* la utilidad **no** se modifica y el usuario recibe el aviso de que corresponde a un
  ciclo ya liquidado.

- **CA-21 (RF-10):**
  *Dado* un pago eliminado,
  *cuando* se abre el modal de detalle de esa cuota,
  *entonces* el historial ya no muestra el comprobante del pago eliminado.

- **CA-22 (RF-12) — pendiente:**
  *Dado* un fallo al eliminar el pago,
  *cuando* se informa al usuario,
  *entonces* el aviso usa el sistema de notificaciones de la app y **no** un `alert()` nativo que
  bloquee la interacción en iOS.

- **CA-23 (RNF-05):**
  *Dado* el modal de eliminar abierto en Safari iOS con varias transacciones,
  *cuando* el usuario desplaza el contenido,
  *entonces* el fondo no hace scroll, aparece el natiscroll «Desliza para ver más» y el botón de
  confirmar queda alcanzable sobre la safe-area.

---

## 10. Casos borde y errores esperados

| # | Situación | Comportamiento esperado | Estado |
|---|-----------|-------------------------|--------|
| 1 | Cuota con dinero pagado pero **sin fila en `historial_pagos_cuota`** (pagos anteriores al registro por transacción, o insert *best-effort* fallido) | Se ofrece la reversión del **pago completo** de la cuota, con las actividades y abonos identificados por el código de comprobante (RF-13) | 🟢 v1.3 |
| 2 | Migración 019 no aplicada en el entorno | La consulta por `historial_pago_cuota_id` se trata como «sin enlace» sin romper; se revierte por detalle guardado y se avisa | 🟢 |
| 3 | Falla la reversión de préstamos a mitad | La cuota aún refleja el pago; se informa y la operación puede reintentarse (RN-08) | 🟢 |
| 4 | Doble clic en «Confirmar» | `eliminandoPago` bloquea la segunda ejecución (`Cuotas.vue:10279`) | 🟢 |
| 5 | Cuota con `no_calcular_multa` activo | `valor_multa` queda en 0 al revertir; no se restaura sanción | 🟢 |
| 6 | Actividad que otro pago posterior también cubrió | Se revierte solo el valor de **esta** transacción; el resto del pagado sobrevive | 🟢 |
| 7 | Pago eliminado sobre natillera **cerrada** | **Sin definir.** Ver PA-3 | 🔴 |
| 8 | Sanción cuya utilidad ya se cerró | No se toca la utilidad; se avisa antes de confirmar y se registra en `problemas` (RN-11) | 🟢 v1.1 |
| 9 | Sesión sin permisos por RLS (usuario dejó de ser admin) | El DELETE falla; se informa y nada queda a medias, porque el borrado del historial es el último paso | 🟢 |
| 10 | Eliminación con la vista filtrada por estado | Tras el refresco la cuota puede salir del filtro activo; no debe parecer que «desapareció» | 🟡 |

---

## 11. Preguntas abiertas

| # | Pregunta | Impacto | Estado |
|---|----------|---------|--------|
| PA-1 | Si el insert de `historial_pagos_cuota` falló, el pago existe en la cuota pero **no es eliminable**. ¿Se ofrece una reversión de emergencia basada solo en la fila de `cuotas`, o se acepta como caso raro a resolver a mano? | Alto | **Resuelta (v1.3): se ofrece la reversión completa**, enlazando por código de comprobante (RF-13) |
| PA-2 | RF-10: ¿la fila de `historial_comprobantes` se **borra** o se **marca como anulada** conservando la trazabilidad? | Medio | **Resuelta (v1.1): se borra**; la trazabilidad queda en Auditoría |
| PA-3 | ¿Se permite eliminar pagos en una natillera **cerrada**? Afectaría cifras ya liquidadas y entregadas. La spec asume que **no**, pero no está implementado. | Alto | Abierta |
| PA-4 | RF-11: ¿el superusuario debe ver el botón en natilleras ajenas, alineándose con la RLS, o la UI se queda deliberadamente más restrictiva? | Medio | **Resuelta (v1.2): se alinea con la RLS** |
| PA-5 | ¿Un colaborador con permisos de gestión de cuotas debería poder eliminar pagos, o queda como facultad exclusiva del administrador? | Medio | Abierta |
| PA-6 | ¿Conviene exigir un **motivo** de eliminación que quede en auditoría? Hoy se registra el qué, no el porqué. | Bajo | Abierta |

---

## 12. Historial de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-08-30 | Versión inicial. Documenta la implementación existente verificada en `Cuotas.vue`, `cuotas.js` y `migrations/019`, y especifica RF-09 (utilidad por sanción no revertida), RF-10 (comprobante huérfano), RF-11 y RF-12. |
| 1.1 | 2026-08-30 | **RF-09 y RF-10 implementados** (migración 020 + `cuotas.js` + `Cuotas.vue`). Resuelta PA-2. Pendientes RF-11 (superusuario) y RF-12 (`alert()` nativo). |
| 1.2 | 2026-08-30 | **RF-11 implementado**: el superusuario ve el botón, y en el modal de cuotas del socio pasa a llevar texto «Eliminar». Resuelta PA-4. Pendiente RF-12. |
| 1.3 | 2026-08-30 | **RF-13 implementado**: los pagos sin transacción registrada (anteriores al historial por transacción) ya son reversibles. Resuelta PA-1. Pendiente RF-12. |

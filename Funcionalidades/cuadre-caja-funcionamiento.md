# Cuadre de Caja — Funcionamiento

Documentación técnica de la vista [src/views/cuadre/CuadreCaja.vue](../src/views/cuadre/CuadreCaja.vue).

Ruta: `/natilleras/:id/cuadre-caja` (ver [src/router/index.js](../src/router/index.js)).

---

## 1. Propósito

La vista **"Totales generales"** (título visible) permite a un administrador o colaborador con permiso `gestionar_cuotas` verificar cuánto dinero **debería** existir en la natillera (en efectivo y transferencia), inspeccionar el desglose por concepto, registrar **movimientos manuales** de caja (ingresos, egresos, traslados internos) y simular un cierre por socio sin ejecutarlo definitivamente.

Es una vista de solo cálculo: **no modifica cuotas, préstamos ni actividades**; sólo lee de Supabase y, opcionalmente, inserta/actualiza/elimina filas en `movimientos_fondo`.

---

## 2. Estructura de la vista

La vista tiene un **header** con `BackButton` hacia `/natilleras/:id` y dos pestañas mutuamente excluyentes controladas por `tabActiva`:

| Pestaña | `tabActiva` | Contenido |
|---|---|---|
| **Totales** | `'totales'` (por defecto) | Tarjetas de total esperado + Detalle por concepto + Movimientos de caja |
| **Simulador de cierre** | `'simulador'` | Cálculo por socio a una fecha de corte arbitraria |

Mientras `loading === true` se muestra `<LoadingScreen text="Calculando cuadre de caja" />`. Las pestañas y el contenido sólo se renderizan después de cargar.

---

## 3. Pestaña "Totales"

### 3.1. Tarjetas de total esperado

Tres tarjetas en grid (1 col móvil, 2 cols desktop):

- **EFECTIVO** → `totalEsperadoEfectivo`
- **TRANSFERENCIA** → `totalEsperadoTransferencia`
- **TOTAL GENERAL** (`md:col-span-2`) → `totalEsperadoGeneral = efectivo + transferencia`

Cada tarjeta de forma de pago muestra debajo el desglose textual: cuotas + cuotas préstamo + sanciones + actividades, utilidad por interés anticipado, GMF 4×1000 (sólo transferencia), préstamos entregados (resta), premios rifa (resta) y movimientos netos.

> Nota: el modal de desglose detallado por forma de pago está envuelto en `<template v-if="false">` (desactivado). El estado `modalDesgloseFormaPago` queda como compatibilidad con código residual.

### 3.2. Fórmula de los totales esperados

```
totalEsperadoEfectivo       = max(0, recaudadoEfectivo − prestamosEfectivo − premiosEfectivo) + movimientosEfectivoNeto
totalEsperadoTransferencia  = max(0, recaudadoTransferencia − prestamosTransferencia − premiosTransferencia) + movimientosTransferenciaNeto
totalEsperadoGeneral        = totalEsperadoEfectivo + totalEsperadoTransferencia
```

`recaudadoX` se computa **filtrando `detalleItems`** por `forma_pago === X` y `monto > 0`. Es la fuente única de verdad: la tarjeta no llama de nuevo a la base, sino que reagrupa el array `detalleItems` ya construido por `buildDetalleItems()`.

`movimientosXNeto = sum(entradas) − sum(salidas)` filtrando `movimientosSinPremios` (movimientos que no son premios rifa ni "Recaudo … liquidada"; estos últimos ya viven en `detalleItems`, no se duplican).

`prestamosX` y `premiosX` se obtienen como `Math.abs(...)` sobre los items con `tipo === 'prestamo'` o `'premio_rifa'` y `monto < 0` (en `detalleItems` los préstamos y premios se almacenan **negativos**).

### 3.3. Detalle por concepto

Sección colapsable (`detalleExpandido`, contraída por defecto) con tabla desktop y cards móvil. Muestra cada item de `detalleFiltrado`, con paginación cliente (20 items por página, `paginaActual`).

**Categorías** (`CATEGORIAS_DETALLE`):
- `cuota` — Cuota
- `cuota_prestamo` — Cuota préstamo
- `sancion` — Sanción
- `actividad` — Actividad
- `gmf_4x1000` — 4x1000
- `prestamo` — Préstamo (negativo)
- `interes_anticipado` — Utilidad por interés anticipado
- `liquidacion_salida` — Liquidación por salida (negativo)
- `premio_rifa` — Premio rifa (negativo)

**Filtros disponibles:**
- Búsqueda por concepto o socio (normaliza diacríticos con `NFD` + `\p{Diacritic}`).
- Mes específico `YYYY-MM` (sólo se ofrecen meses con items, vía `mesesEnNatillera`).
- Categorías (multiselect; vacío = todas).
- Forma de pago (`todos | efectivo | transferencia`).
- Ordenar por (multicriterio con prioridad reordenable: `socio`, `concepto`, `monto`, `periodo`).

Al cambiar cualquier filtro, `paginaActual` se resetea a 1 (watcher en línea 1649).

### 3.4. Lista de movimientos de caja

Lista construida por `movimientosParaLista`, que detecta **pares de traslado** y los muestra como una sola tarjeta (verde + rojo) en lugar de dos. Detección de par (`esParTraslado`):

- `tipo` opuesto (uno entrada, otro salida)
- `forma_pago` opuesta (efectivo ↔ transferencia)
- misma fecha (normalizada con `normalizarFechaParaConsulta`)
- mismo monto

No depende de la descripción para identificar el par.

Cada item permite **editar** (`abrirModalEditarMovimiento`) y **eliminar** (`confirmarEliminarMovimiento`) si `puedeGestionarCuotas`. Eliminar un movimiento de un par traslado elimina **ambos** automáticamente.

---

## 4. Pestaña "Simulador de cierre"

Calcula por cada socio cuánto debería recibir si se ejecutara el cierre **a la fecha de corte indicada** (`simuladorFechaCorte`, default = hoy). No persiste nada.

Llama a `calcularCierreNatillera(id, { fechaCorte })` desde [src/composables/useCierreNatillera.js](../src/composables/useCierreNatillera.js).

Mapea cada socio a:

```js
{
  ...socio,
  totalAEntregar = ahorro + utilidadesTotal,
  totalFinal     = totalAEntregar − descuentos
}
```

Ordena alfabéticamente por nombre y muestra:

- **Total a entregar** (suma sólo los `totalFinal > 0` — si un socio debe, no resta).
- Tabla desktop / cards móvil con expansión por socio (`simuladorDetalleId`).
- Detalle expandido: descuentos por sanción (`prestamosPendientes`, `cuotasSinPagar`) y desglose de utilidades por concepto (`prestamos`, `rifas`, `bingo`, `venta`, `evento`, `otro`, `sanciones`).
- Botón **Exportar a Excel** (`exportarSimuladorAExcel`).

`simuladorError` se muestra inline si la función devolvió `{ error }`.

---

## 5. Modelo de datos: `detalleItems`

Es el corazón de los cálculos. Lo construye `buildDetalleItems(nat, prestamosData, sociosActividadData, movimientos, cuotasPrestamoPagadas, historial4x1000)` (línea 2181) a partir de:

| Fuente | Origen Supabase / store | Genera ítems tipo |
|---|---|---|
| `nat.cuotas` (con `valor_pagado > 0` o `estado === 'pagada'`) | `natillerasStore.fetchNatillera` | `cuota`, `sancion` |
| `cuotasPrestamoPagadas` | `plan_pagos_prestamo` con `valor_pagado > 0` | `cuota_prestamo` |
| `sociosActividadData` | `socios_actividad` con `valor_pagado > 0` | `actividad` |
| `prestamosData` (estado activo o pagado) | `prestamos` | `prestamo` (monto negativo, incluye `interes_anticipado` si aplica) y `interes_anticipado` (utilidad positiva) |
| `movimientos` con descripción "premio rifa" | `movimientos_fondo` | `premio_rifa` (monto negativo); fallback a `nat.actividades` liquidadas con `gastos > 0` |
| `movimientos` con descripción "Liquidación por salida" | `movimientos_fondo` | `liquidacion_salida` (monto negativo) |
| `movimientos` con descripción "Recaudo actividad/rifa liquidada" | `movimientos_fondo` (entradas) | `actividad` |
| `historial4x1000` | `historial_pagos_cuota` con `impuesto_4x1000 > 0` y forma_pago `transferencia` | `gmf_4x1000` |

**Pago mixto**: cuando una cuota tiene `valor_pagado_efectivo > 0` Y `valor_pagado_transferencia > 0`, se generan **dos** items separados (uno por forma de pago) prorrateando cuota y sanción según el ratio. Idem actividades y cuotas de préstamo.

**Estructura de un item:**

```js
{
  tipo,             // string del catálogo CATEGORIAS_DETALLE
  concepto,         // texto a mostrar
  socio,            // nombre o '—'
  forma_pago,       // 'efectivo' | 'transferencia'
  monto,            // positivo para entradas, negativo para préstamos/premios/liquidaciones
  mes, anio,        // periodo opcional (1-12)
  quincena,         // opcional, 1 | 2
  socioEsMensual,   // bool, define formato del periodo
  esParcial,        // marca cuotas con pago parcial (color naranja)
  fecha_movimiento  // ISO o null
}
```

`buildDetalleItems` ordena el array por `año-mes desc, ordenTipo asc` antes de devolverlo.

---

## 6. Carga de datos (`cargarDatos`)

Disparada por `watch(id, cargarDatos, { immediate: true })`.

```
1. natillerasStore.fetchNatillera(id) → nat
2. En paralelo:
   - movimientos_fondo (todos los de la natillera, ordenados por fecha desc)
   - cargarPrestamosParaDetalle  (estado activo/pagado)
   - cargarSociosActividadParaDetalle (valor_pagado > 0)
   - colaboradoresStore.obtenerMisPermisos(id)
3. En paralelo:
   - cargarCuotasPrestamoPagadasParaDetalle(prestamoIds)
   - historial_pagos_cuota (sólo cuotas de la natillera, filtradas por impuesto_4x1000 > 0 y forma_pago='transferencia')
4. detalleItems.value = buildDetalleItems(...)
5. logCalculoTotalesGenerales() → console.group con desglose de cálculo
```

Si la natillera no existe se muestra notificación de error y se aborta.

---

## 7. Permisos

```js
esSuperUsuario     = email === 'raigo.16@gmail.com'
esAdmin            = user.id === natillera.admin_id || esSuperUsuario
puedeGestionarCuotas = esAdmin || misPermisos?.permisos?.gestionar_cuotas === true
```

`puedeGestionarCuotas` controla la visibilidad de los botones **Editar** y **Eliminar** en cada movimiento, y bloquea el guardado en el modal con notificación de error.

El botón **Nuevo Movimiento** y la pestaña Simulador no están protegidos por este flag (cualquiera con acceso a la vista los ve).

---

## 8. Modal de movimiento (crear / editar)

`ModalWrapper` con `align="bottom"` (sheet en móvil). Estado controlado por `modalMovimientoAbierto`, `editandoMovimiento` y `movimientoEditando`.

### 8.1. Tipos

Tres tipos seleccionables por el usuario al crear (`tipoMovimiento`):

- **Transferencia** — traslado interno entre formas de pago. Crea **2 filas** en `movimientos_fondo` (una `salida` en la forma origen y una `entrada` en la forma destino) con misma fecha, monto y descripción base. Direcciones: `efectivo_transferencia` o `transferencia_efectivo`.
- **Ingreso** — 1 fila `entrada` con `destino_ingreso` (`recaudado` | `utilidades`).
- **Egreso** — 1 fila `salida` con `origen_egreso` (`recaudado` | `utilidades`).

`origen_egreso` y `destino_ingreso` clasifican el impacto sobre los indicadores **Recaudado** y **Utilidades** del desglose. Sólo se muestran al usuario para egresos/ingresos, no para traslados.

### 8.2. Edición

Al abrir en modo edición:
- Detecta si el movimiento forma parte de un par traslado (`esParteDeTraslado` por patrón, o `esTransferenciaMovimiento` por descripción legacy).
- Si es traslado, deshabilita el selector de tipo (se mantiene como transferencia) y precarga la dirección.
- Si no, permite editar `formaPago`, `origenEgreso`/`destinoIngreso`, `monto`, `descripcion`, `fecha`.

`actualizarMovimiento` (línea 3138) — al guardar:
1. Busca el gemelo del par con `buscarMovimientoRelacionadoTransferencia` (consulta Supabase con misma fecha/monto/tipo opuesto/forma opuesta; con fallback a candidatos sin filtrar por fecha exacta y luego comparándola en JS).
2. Si existe, actualiza **ambos** con el mismo monto/fecha/descripción y formas de pago opuestas. Verifica coherencia post-update y autocorrige si hace falta.
3. Si no existe, sólo actualiza el original.

### 8.3. Monto

Input de tipo texto con formato `es-CO` (separador de miles `.`). `handleMontoInput` mantiene `formMovimiento.monto` como número y `montoFormateado` como string visible. Validación: `> 0`.

### 8.4. Auditoría

Cada creación/actualización/eliminación dispara `registrarAuditoriaEnSegundoPlano(...)` desde [useAuditoria](../src/composables/useAuditoria.js) con descripción contextual `[TIPO - ACCIÓN]`, datos antes/después y metadatos (`tipo_movimiento`, ids de gemelos, descripciones formateadas, motivo, etc.). Las llamadas son fire-and-forget.

---

## 9. Eliminación de movimientos

Modal de confirmación `movimientoAEliminar` (`ModalWrapper` centrado). En `eliminarMovimientoConfirmado`:

1. `buscarMovimientoRelacionadoTransferencia(movimiento)` para detectar par.
2. Si hay par: `delete` del relacionado y luego del original (auditoría dual).
3. Si no: `delete` simple.
4. `cargarDatos()` para refrescar.

El título del modal cambia entre "¿Eliminar traslado?" y "¿Eliminar movimiento?" según `esParteDeTraslado`.

---

## 10. Exportación a Excel

### 10.1. `exportarAExcel` (Detalle por concepto)

Genera un libro `xlsx-js-style` con dos hojas:

- **"Cuadre de Caja"** — detalle filtrado, ordenado por socio y luego por periodo. Usa rayado por bloques de socio (alternando blanco / verde claro) y separador medium gris entre socios. Columnas: Socio, Concepto, Clasificación, Fecha mov., Forma de pago, Período, Monto. Total general como **fórmula** `=SUM(detalle) + SUM(movimientos)`. Totales por forma de pago como `SUMIF(...)`.
- **"Movimientos de Caja"** — entradas/salidas manuales, con monto firmado (entradas positivo, salidas negativo) y colores verde/rojo por fila.

Las celdas de fecha se generan como `Date` a las 12:00 hora local (`parseFechaExcel`) y se formatean `dd/mm/yyyy` para evitar saltos por zona horaria.

Nombre archivo: `Cuadre_Caja_{nombreNatillera}_{YYYY-MM-DD}.xlsx`.

### 10.2. `exportarSimuladorAExcel` (Simulador)

Una sola hoja "Simulador de Cierre" con: Socio, Teléfono, Ahorro, Utilidades, Total (Antes de desc.), Descuentos, A Entregar, Debe. Total general al final.

Nombre archivo: `Simulador_Cierre_{nombreNatillera}_{YYYY-MM-DD}.xlsx`.

---

## 11. Estado reactivo (resumen)

| Ref | Tipo | Uso |
|---|---|---|
| `loading` | bool | Pantalla de carga |
| `natillera` | object | Natillera completa con `cuotas`, `socios_natillera`, `actividades` |
| `movimientos` | array | Filas de `movimientos_fondo` |
| `detalleItems` | array | Items normalizados (sección 5) |
| `tabActiva` | `'totales'\|'simulador'` | Pestaña activa |
| `filtroDetalleCategorias` | string[] | Multiselect categorías |
| `filtroDetalleFormaPago` | string | `'todos'\|'efectivo'\|'transferencia'` |
| `filtroDetalleBusqueda` | string | Búsqueda libre |
| `filtroDetalleMes` | string | `''` o `'YYYY-MM'` |
| `ordenarDetalleCriterios` | string[] | Prioridad de orden |
| `detalleExpandido` | bool | Colapsable detalle |
| `paginaActual`, `itemsPorPagina` | number | Paginación cliente |
| `modalMovimientoAbierto` | bool | Modal nuevo/editar |
| `tipoMovimiento` | `'transferencia'\|'ingreso'\|'egreso'` | Tipo a crear |
| `formMovimiento` | object | Form completo |
| `editandoMovimiento`, `movimientoEditando` | bool, object | Modo edición |
| `movimientoAEliminar` | object\|null | Modal de confirmación |
| `simuladorFechaCorte` | string | Fecha ISO para el simulador |
| `simuladorSocios`, `simuladorSociosFiltrados` | array | Resultados |
| `simuladorDetalleId` | string\|null | Socio expandido |

`useBodyScrollLock` está aplicado a `modalMovimientoAbierto` y a `movimientoAEliminarOpen` (computed `!!movimientoAEliminar.value`).

---

## 12. Tablas Supabase consumidas

- `movimientos_fondo` — entradas/salidas manuales (lectura, inserción, actualización, eliminación). Campos: `id`, `tipo`, `monto`, `forma_pago`, `descripcion`, `fecha`, `origen_egreso`, `destino_ingreso`.
- `socios_natillera` — sólo para mapeo de IDs de socios → nombres.
- `socios_actividad` — pagos de actividades por socio.
- `prestamos` — préstamos activos/pagados (incluye `interes_anticipado`, `interes_total`).
- `plan_pagos_prestamo` — cuotas de préstamo pagadas (incluye desglose `valor_pagado_efectivo`/`valor_pagado_transferencia`).
- `historial_pagos_cuota` — solo el campo `impuesto_4x1000` para construir items GMF en transferencia.

Solo `movimientos_fondo` se modifica desde esta vista. El resto es lectura.

---

## 13. Cierre de dropdowns por clic fuera

`onMounted` registra `handleClickOutsideDropdowns` en `document` que cierra `dropdownCategoriasAbierto` y `dropdownOrdenarAbierto` cuando el clic ocurre fuera de sus refs. `onUnmounted` lo desregistra.

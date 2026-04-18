# 15 — Tarjetas por socio, modal de registro de pago y comprobante visual

Referencias cruzadas: [02-periodo-mes-anio-y-filtrado](./02-periodo-mes-anio-y-filtrado.md), [04-sanciones-multas-reglas-calculo](./04-sanciones-multas-reglas-calculo.md), [06-registro-pago-orden-prioridades](./06-registro-pago-orden-prioridades.md), [07-integracion-actividades](./07-integracion-actividades.md), [08-integracion-prestamos](./08-integracion-prestamos.md), [09-comprobantes-gmf-historial](./09-comprobantes-gmf-historial.md), [14-visual-layout-y-flujos-interaccion](./14-visual-layout-y-flujos-interaccion.md).

Código fuente principal: `src/views/cuotas/Cuotas.vue` (template + script).

---

## 1. Vista “Por Socio”: tarjeta de cabecera del socio

**Cuándo se ve:** selector de vista **“Por Socio”** (`vistaAgrupada === true`, sin Excel ni Lista).

**Origen de datos:** computed **`cuotasAgrupadasPorSocio`**, que agrupa `cuotasFiltradas` por `socio_natillera.id` y acumula totales con las funciones indicadas abajo.

### 1.1 Contenido de la cabecera (bloque superior del grupo)

| Elemento UI | Fuente de datos / proceso |
|-------------|---------------------------|
| **Avatar** | `getAvatarUrl(nombre, avatar_seed, avatar_style)` — URL generada (no es campo obligatorio en BD para mostrar algo). |
| **Nombre del socio** | `grupo.socio.nombre` desde `socio_natillera.socio` (join ya presente en cuotas del store). |
| **“N cuotas”** | `grupo.cuotas.length` — cuotas del socio **después** de filtros globales. |
| **Total** | Suma de `valor_cuota` de cada cuota del grupo. |
| **Pagado** | Suma de `getTotalPagadoConActividadesSocio(cuota)` por cuota: incluye `valor_pagado`, `valor_pagado_sancion`, actividades abonadas en esa cuota y abonos/préstamos según sync (ver doc 06/07/08). |
| **Pendiente** | Suma de `getTotalAPagar(cuota)` solo si `estadoReal !== 'programada'` (cuota + sanción pendiente − abonado a cuota; ver doc 04). |
| **Línea actividades (morado)** | `getTextoActividadesGrupo` + `grupo.actividadesPendientes` — suma de `getActividadesPendientesSocio` por cuota del grupo (doc 07; mapa `actividadesPendientesPorSocio`). |
| **Abonado préstamos (cielo)** | `grupo.cuotasPrestamosAbonado` — `getTotalAbonadoPrestamosCuotaSocioSync` por cuota (doc 08). |
| **Pendiente préstamos (azul)** | `grupo.cuotasPrestamosPendientes` — `getTotalCuotasPrestamosPendientesSocioSync` (doc 08). |
| **Total a Pagar (rojo)** | `grupo.totalAPagar` = `pendiente + actividadesPendientes + cuotasPrestamosPendientes`. |

### 1.2 Tarjetas internas (una por cuota dentro del grupo)

Misma **lógica visual y botones** que en la vista **Tarjetas** por cuota (sección 2). El clic en la tarjeta abre **detalle** (`abrirModalDetalleCuota`); los botones usan `@click.stop`.

---

## 2. Tarjeta de una cuota (vista Tarjetas o lista dentro de “Por Socio”)

### 2.1 Zona de contenido (clic)

| Acción | Proceso |
|--------|---------|
| **Clic en el cuerpo de la tarjeta** | `abrirModalDetalleCuota(cuota)` → carga historial, muestra modal de detalle, desglose y botones inferiores. |

### 2.2 Botones (según estado y rol)

| Botón | Visible si… | Proceso al hacer clic |
|-------|-------------|------------------------|
| **$ Pagar** | `!esVisor` y cuota no está pagada (`estadoReal` / `estado`) | `abrirModalPago(cuota)` → `preparandoModalPago`, carga actividades (`cargarActividadesPendientes`) y préstamos (`cargarCuotasPrestamosPendientes`), luego `modalPago = true`. Flujo de pago: doc **06**, **07**, **08**. |
| **Editar** | `!esVisor` y (pago parcial **o** pagada según bloque) | `abrirModalEditar(cuota)` — edición de montos/tipo; puede sincronizar GMF en historial (doc 09, 13). |
| **Reenviar** | Varias ramas (pago parcial o pagada) | `reenviarComprobante(cuota)` — reconstruye datos y abre flujo de comprobante/reenvío. |

**Visor (`esVisor`):** no ve **Pagar** ni **Editar**; puede usar flujos de solo lectura donde el template lo permita.

**Superusuario (`esUsuarioAdmin`, email `raigo.16@gmail.com`):** ve **Generar cuotas**, **Borrar cuotas del mes** y el checkbox **No calcular multa** (otros admins de la natillera no). Detalle global: [Permisos-superusuario-raigo.md](../Permisos-superusuario-raigo.md).

### 2.3 Checkbox “No calcular multa”

| Condición | Proceso |
|-----------|---------|
| `esUsuarioAdmin` (email fijo en código) | `@change` → `toggleNoCalcularMultaCuota` → `cuotasStore.actualizarCuota` poniendo multas a 0 si se marca. Doc **04**. |

`@click.stop` en el `label` evita abrir el modal de detalle al togglear.

---

## 3. Modal “Registrar pago” (`modalPago`)

**Contenedor:** `ModalWrapper`, `align="bottom"` en móvil, centrado en `sm+`. **z-index** 60.  
**Overlay close:** resetea `formPago.valor`, `tipo_pago = 'efectivo'`, `aplicaImpuesto4x1000 = false`, animación de pago.

### 3.1 Pre-carga

| Elemento | Comportamiento |
|----------|----------------|
| **`LoadingScreen` `preparandoModalPago`** | Visible mientras se ejecutan cargas async antes de mostrar el modal. |

### 3.2 Cabecera del modal

| Elemento | Contenido |
|----------|-----------|
| **Título** | “Registrar Pago”. |
| **Subtítulo** | Si `valor_pagado > 0`: texto de **agregar saldo a pago parcial**; si no: registrar pago de la cuota. |

### 3.3 Bloque “Card socio”

| Elemento | Origen / acción |
|----------|-----------------|
| **Alerta ajustes** | Si `tieneAjuste(cuotaSeleccionada)` → botón que llama `abrirModalHistorialAjustes` (doc 13). |
| **Avatar + nombre** | `cuotaSeleccionada.socio_natillera.socio` + `getAvatarUrl`. |
| **Subtítulo** | `descripcion` de la cuota o “Cuota” si hay ajuste (oculta descripción confusa). |
| **Resumen sin pago parcial** | Filas: **Cuota** (`valor_cuota`), **Sanción** (total o pagado según condición), **Actividades** (solo si hay seleccionadas), **Préstamos** (solo si hay seleccionadas), **Total a pagar** → `getTotalMostrarResumenModalPago()`. |
| **Resumen con pago parcial** | Total a pagar “completo”, sanción pendiente, pagado anteriormente, total pendiente → `getTotalPendienteMostrarModalPago()`. |

### 3.4 Tipo de pago

| Botón | Handler | Efecto |
|-------|---------|--------|
| **Efectivo** | `alCambiarTipoPagoModal('efectivo')` | Estilo activo verde; ver doc 14 sobre topes del input. |
| **Transferencia** | `alCambiarTipoPagoModal('transferencia')` | Estilo activo azul; ajusta tope del campo al neto de obligación. |

### 3.5 Campo valor

- **Label:** “Valor adicional…” si ya hubo `valor_pagado`; si no, “Valor del pago”.  
- **Valor mostrado:** `formatearValorPago(valorMostrarModalRegistroPago())` — en transferencia neto a obligaciones; efectivo según reglas.  
- **Eventos:** `input` → `handleValorPagoInput`, `blur` → `handleValorPagoBlur` (transferencia), Enter → `mostrarConfirmacionPago`.  
- **Placeholder:** muestra `Máx:` según actividades/préstamos seleccionados y tipo de pago.

### 3.6 Bloque 4×1000 (solo transferencia)

| Elemento | Comportamiento |
|----------|----------------|
| Checkbox **Aplica 4×1000** | `v-model="formPago.aplicaImpuesto4x1000` | Muestra monto adicional `calcularImpuesto4x1000(formPago.valor)` y **Total a cobrar** `getTotalACobrarModalPago()`. Doc **06** / **09**. |

### 3.7 Desplegable Actividades pendientes

| Parte | Proceso |
|-------|---------|
| **Carga** | `cargandoActividades` → skeleton; consulta `socios_actividad` + `actividades` (doc **07**). |
| **Cabecera del acordeón** | Toggle `actividadesDesplegableAbierto`; muestra conteos seleccionados / total pendientes. |
| **Lista** | Cada fila: `toggleActividadSeleccionada`; `actividadesDeLaCuotaActual` → **no se puede desmarcar**; al cambiar selección → `actualizarValorPagoConActividades`. |

### 3.8 Desplegable Cuotas de préstamos (si `cuotasPrestamosPendientes.length > 0`)

| Parte | Proceso |
|-------|---------|
| **Carga** | `cargandoCuotasPrestamos`; `cargarCuotasPrestamosPendientes` (doc **08**). |
| **Selección por defecto** | Cuotas con `esta_programada` para el periodo → `cuotasPrestamosDeLaCuotaActual` + `cuotasPrestamosSeleccionadas`; **no desmarcables**. |
| **Toggle** | `toggleCuotaPrestamoSeleccionada` → `actualizarValorPagoConCuotasPrestamos`. |

### 3.9 Indicador “Desliza para ver más”

- `mostrarIndicadorScroll` cuando el contenido del scroll es más alto que el viewport del modal (`verificarScrollDisponible`).

### 3.10 Footer del modal

| Botón | Proceso |
|-------|---------|
| **Cancelar** | Cierra modal y resetea `formPago`. |
| **Registrar Pago** | `mostrarConfirmacionPago` → abre **modal de confirmación** (no guarda aún en BD). Deshabilitado si `getValorPagoTotal() <= 0` o store loading. |

---

## 4. Modal “Confirmar pago” (`modalConfirmarPago`)

**Origen:** `mostrarConfirmacionPago()` rellena **`desglosePagoConfirmacion`** con el mismo orden de imputación que el backend: **sanción → actividades → préstamos → cuota** (doc **06**).

| Elemento | Contenido |
|----------|-----------|
| **Total a pagar** | `desglosePagoConfirmacion.total` (transferencia puede mostrar total consignado aparte). |
| **Pagado anteriormente** | Si hubo abonos previos acumulados. |
| **Forma de pago** | Efectivo vs transferencia (iconos). |
| **Queda pendiente** | Si `esParcial` y monto pendiente &gt; 0. |
| **Desglose** | Filas Cuota / Sanción / Actividades / Préstamos (con detalle de préstamos si aplica). |

| Botón | Proceso |
|-------|---------|
| **Cancelar** | `modalConfirmarPago = false`. |
| **Confirmar y Registrar** | `confirmarYRegistrarPago` → `handleRegistrarPago` → `cuotasStore.registrarPago` + `registrarPagosActividades` + `registrarPagosCuotasPrestamos` → luego comprobante. |

---

## 5. Modal “¡Pago registrado!” y comprobante visual

**Modal:** `modalConfirmacion` con header “¡Pago Registrado!”. Los datos viven en **`pagoRegistrado`** (objeto construido en `handleRegistrarPago` tras éxito).

### 5.1 Especificación para que el comprobante **se vea igual** (réplica)

El comprobante es **HTML + estilos inline** dentro del nodo:

- **`id="comprobante-pago"`**
- **`ref="comprobanteRef"`**

Ese nodo **entero** es el que se rasteriza a PNG:

```text
toPng(comprobanteRef.value, {
  backgroundColor: '#ecfdf5',
  pixelRatio: 2,
  quality: 1.0,
  cacheBust: true
})
```

**Reglas para una implementación equivalente:**

1. **No sustituir** el bloque por un diseño distinto si se busca paridad visual con WhatsApp/descarga: mantener **fondo** del contenido `#ecfdf5`, padding, sombras y bordes redondeados del contenedor blanco externo.
2. La **mayor parte** del comprobante usa **`style="..."` inline** (no solo Tailwind) para que la captura sea estable; **replicar** tamaños de fuente (8px–28px), pesos (600–900), colores (`#059669`, `#111827`, etc.) y badges de **PAGO PARCIAL** (ámbar) vs **PAGO COMPLETO** (verde).
3. **Estructura fija** (orden vertical):
   - Título “Comprobante de Pago” + ícono check verde circular.
   - **Sección 1:** Monto pagado, badge parcial/completo, **código** monoespaciado si existe, grid 2×2 **Socio | Período | Fecha | Forma de pago** (doc **09** para período).
   - **Pagado anteriormente** (si aplica).
   - **Sección “CONCEPTOS PAGADOS”:** filas condicionales — **Cuota** (verde), **Sanción** (rojo), **Actividades** (lista por ítem o total morado), **Préstamos** (lista o total azul), **4×1000 GMF** (azul cielo) si `impuesto4x1000Comprobante > 0` (computed que unifica BD + historial, doc **09**).
   - **Historial de pagos** (si `historialPagos.length > 1`) — lista de abonos con conceptos y totales.
   - **Resumen parcial** (bloque ámbar) si `esParcial && valorPendiente > 0`.

4. **Footer del modal** (fuera del `ref`): botones **Descargar**, **Compartir WhatsApp**, **Cerrar** — llaman a `descargarComprobante`, `compartirWhatsApp`, `cerrarConfirmacion` usando el **mismo** `comprobanteRef`.

### 5.2 Paridad entre pantalla y PNG

- **Misma fuente de verdad:** el usuario ve en pantalla el mismo DOM que se convierte a imagen; no hay segunda plantilla.
- **Exportación:** fondo explícito `#ecfdf5` en `toPng` coincide con el fondo del bloque `.comprobante-content`.

### 5.3 Otros comprobantes

- **Modificación de pago:** `comprobanteModificacionRef` + `toPng` análogo (misma librería, doc 13).

---

## 6. Resumen de cadena de modales después de pulsar “Registrar Pago”

```text
Modal Pago → [Registrar Pago] → Modal Confirmar → [Confirmar y Registrar]
    → handleRegistrarPago (store + actividades + préstamos)
    → Modal ¡Pago registrado! (comprobante)
    → opcional: Descargar PNG / WhatsApp
```

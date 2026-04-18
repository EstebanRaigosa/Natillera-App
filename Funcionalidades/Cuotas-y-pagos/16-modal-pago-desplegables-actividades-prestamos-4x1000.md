# Modal de pago: desplegables de actividades, préstamos y 4×1000 (GMF)

Este documento describe el comportamiento implementado en `src/views/cuotas/Cuotas.vue` para el modal de registro de pago: qué datos alimentan cada desplegable, qué reglas definen la lista y la selección automática, y cómo se calcula el valor a pagar y el impuesto 4×1000.

---

## 1. Idea central: obligación neta del modal

En el modal, la **obligación neta** (lo que debe cubrirse con conceptos de cuota, sanción, actividades y cuotas de préstamo) es:

\[
O = \text{getTotalAPagar}(\text{cuota}) + \text{total actividades seleccionadas} + \text{total cuotas de préstamo seleccionadas}
\]

- **`getTotalAPagar(cuota)`** = `valor_cuota + sanción − valor_pagado` de la cuota (la sanción depende de estado y reglas; ver `getSancionCuota` en el mismo archivo).
- Los totales de actividades y préstamos se suman solo de los ítems **marcados** en los desplegables (`Set` de IDs seleccionados).

Funciones clave: `getTotalAPagarConActividades`, `getTotalObligacionNetaPagoActual`, `getTotalActividadesSeleccionadas`, `getTotalCuotasPrestamosSeleccionadas`.

---

## 2. Desplegable de actividades pendientes

### 2.1 Origen de datos

1. Se consulta `socios_actividad` filtrado por `socio_natillera_id` de la cuota y estados `pendiente`, `parcial` o `mora`.
2. Se enriquece con filas de la tabla `actividades` (`id`, `tipo`, `descripcion`, etc.).
3. **Filtro por periodo de la cuota:** solo entran registros con `mes_pago` y `anio_pago` definidos, donde el periodo de la actividad es **menor o igual** al periodo de la cuota (`anio_pago` / `mes_pago` comparados con `cuota.anio` / `cuota.mes`). Si falta periodo en el registro, **no** aparece en la lista.
4. **Filtro por saldo:** solo se muestran filas con `valor_pendiente > 0`, donde  
   `valor_pendiente = max(0, valor_asignado − valor_pagado)`.

### 2.2 Qué valor tiene cada opción

Cada fila del desplegable muestra el **`valor_pendiente`** de ese `socios_actividad`. Al sumar las seleccionadas, se usa exactamente ese campo (no se prorratea en la UI; la distribución al guardar está en `registrarPagosActividades`).

### 2.3 Selección automática al abrir el modal

Al abrir el pago (`abrirModalPago` → `cargarActividadesPendientes`):

1. Tras armar `actividadesPendientes`, el código busca actividades que **correspondan al periodo exacto** de la cuota: mismo `mes_pago` y `anio_pago` que la cuota, y **coincidencia de quincena** según la **periodicidad del socio** (`socio_natillera.periodicidad`, o inferida por la quincena de la cuota: sin quincena → mensual; con 1 o 2 → quincenal).

   - **Socio mensual:** la quincena de cuota se normaliza a `0`; la actividad acepta quincena `0`, `2`, `null` o `undefined` como “mensual” (`0`). Si la actividad tiene quincena `1`, **no** casa con cuota mensual.
   - **Socio quincenal:** la actividad debe tener `quincena_pago` explícita `1` o `2` y debe coincidir con la quincena de la cuota.

2. **Caso especial Q2:** si el socio es quincenal, la cuota es quincena `2` y no hubo coincidencias, pero existe cuota Q1 del mismo mes/año **ya pagada** y hay actividades del mismo mes/año con `quincena_pago === 1` aún con saldo, esas se tratan como “movidas” a Q2 y se incluyen en la coincidencia.

3. Si aún no hay coincidencias, se usa el fallback **`actividadCorrespondeACuota`** sobre todas las `actividadesPendientes` (misma lógica de mes/año/quincena y compatibilidad con `fecha_limite_pago` para datos antiguos).

4. Los IDs encontrados se guardan en **`actividadesDeLaCuotaActual`** y se añaden todos a **`actividadesSeleccionadas`**. Esas filas muestran la etiqueta *“Incluida en esta cuota (no se puede quitar)”* y **`toggleActividadSeleccionada` no permite desmarcarlas**.

5. Si hubo al menos una coincidencia, se llama a **`actualizarValorPagoConActividades()`** para recalcular el campo de valor del formulario.

### 2.4 Selección manual

- El usuario puede **marcar o desmarcar** actividades que **no** estén en `actividadesDeLaCuotaActual`.
- Cada cambio ejecuta `actualizarValorPagoConActividades()`.

---

## 3. Desplegable de cuotas de préstamos pendientes

### 3.1 Origen de datos

1. Préstamos del socio en estado `activo` (`prestamos`).
2. Filas de `plan_pagos_prestamo` con `pagada = false`, ordenadas por `fecha_proyectada`.
3. Para cada fila:  
   `valor_pendiente = max(0, valor_cuota − valor_pagado)` (según lo guardado en el plan).

### 3.2 Cuándo aparece el bloque

El desplegable solo se renderiza si **`cuotasPrestamosPendientes.length > 0`** (hay al menos una cuota de plan no pagada del total).

### 3.3 “Programada para este periodo” (selección automática)

Para cada cuota del plan se calcula el mes/año (y quincena si aplica) a partir de **`fecha_proyectada`**:

- Préstamo **quincenal:** día ≤ 15 → quincena `1`, si no → `2`.
- Préstamo **mensual:** quincena tratada como `0`.

Se marca **`esta_programada`** con **`estaCuotaPrestamoProgramadaParaPeriodo`**, que exige:

- Mismo **año y mes** que la cuota de natillera abierta en el modal.
- Si la cuota de natillera es **mensual** (`quincena` null/0): la cuota del préstamo debe ser mensual (quincena 0/null).
- Si la cuota de natillera es **quincenal** (1 o 2): la quincena proyectada del préstamo debe **coincidir** con la de la cuota.

Las filas con `esta_programada === true` se añaden a **`cuotasPrestamosDeLaCuotaActual`** y a **`cuotasPrestamosSeleccionadas`**. Igual que en actividades, **no se pueden deseleccionar** desde el toggle.

Tras seleccionarlas, se llama **`actualizarValorPagoConCuotasPrestamos()`** (que a su vez alinea `formPago.valor` con la suma de obligaciones).

### 3.4 Selección manual

- Se pueden añadir o quitar otras cuotas del plan **no** marcadas como del periodo actual.
- **`getTotalCuotasPrestamosSeleccionadas()`** suma los `valor_pendiente` de las filas cuyo `id` está en el `Set` seleccionado.

---

## 4. Cómo cambia el campo “Valor” del pago (`formPago.valor`)

Estados iniciales al abrir el modal (`abrirModalPago`):

- `formPago.valor = getTotalAPagar(cuota)` si es positivo; si no, `0`.
- `formPago.aplicaImpuesto4x1000 = false`.
- Se limpian selecciones y sets de “de la cuota actual”; luego se cargan actividades y préstamos y se vuelven a aplicar las reglas anteriores.

### 4.1 `actualizarValorPagoConActividades` y `actualizarValorPagoConCuotasPrestamos`

Ambas reconstruyen:

\[
O = \text{getTotalAPagar}(\text{cuota}) + \text{actividades seleccionadas} + \text{préstamos seleccionados}
\]

- Si **`totalActividades > 0` o `totalCuotasPrestamos > 0`:** se fuerza **`formPago.valor = O`** (el campo sigue la obligación neta completa).
- Si **no** hay nada seleccionado en actividades ni préstamos: se ajusta el valor para no superar el tope de la cuota sola (`getTotalAPagar`), con matices si el tipo de pago es transferencia (ver código en `actualizarValorPagoConActividades`).

### 4.2 Entrada manual del usuario (`handleValorPagoInput`)

- **Transferencia:** el valor ingresado se **capa** al máximo `getTotalObligacionNetaPagoActual()` (obligación neta `O`).
- **Efectivo con actividades seleccionadas:** no se aplica el tope de solo cuota; el usuario puede escribir el número libremente (útil para pagos parciales combinados).
- **Efectivo sin actividades seleccionadas:** el valor no puede superar `getTotalAPagar(cuota)`.

---

## 5. Impuesto 4×1000 (GMF) en transferencia

### 5.1 Visibilidad y modelo mental

- El bloque del **4×1000** solo se muestra si **`formPago.tipo_pago === 'transferencia'`**.
- En este flujo, el **campo numérico representa el monto neto** destinado a cubrir la obligación (cuota + sanción + actividades + préstamos seleccionados), **no** el impuesto por sí solo.
- El checkbox **“Aplica 4×1000”** es **opcional**. Si está activo, el **total a cobrar** mostrado incluye el impuesto calculado sobre ese neto.

### 5.2 Cálculo del impuesto

`calcularImpuesto4x1000(neto)`:

- Toma el entero **no negativo** del neto (`floor`).
- Devuelve `round((neto × 4) / 1000)` — Gravamen a los Movimientos Financieros al estilo 4 por mil sobre el monto base indicado en la UI.

### 5.3 Totales mostrados

- **`getTotalACobrarModalPago()`** en transferencia: si aplica 4×1000, devuelve **neto + impuesto**; si no, solo el neto (`getBrutoTransferenciaParaDistribucion`).
- El texto auxiliar indica cuánto se “agregará” sobre el valor ingresado cuando el checkbox está marcado.

### 5.4 Al registrar el pago (aplicación a conceptos)

- **`getValorPagoTotal()`** para transferencia usa **`distribuirTransferenciaPago`**: el dinero que baja a cuota/sanción/actividades/préstamo es el **neto** (limitado por la obligación), y el impuesto se trata aparte según esa distribución (el GMF no reduce el saldo de la obligación en la misma forma que un abono a cuota).

Al pasar de efectivo a transferencia (`alCambiarTipoPagoModal`), se **resetea** `aplicaImpuesto4x1000` y se recorta el valor al tope de obligación neta.

---

## 6. Resumen rápido

| Elemento | Lista (qué entra) | Selección automática | Valor que suma | ¿Se puede quitar? |
|----------|-------------------|----------------------|----------------|-------------------|
| Actividades | `socios_actividad` con saldo, periodo ≤ cuota, datos de `actividades` | Coincide mes/año/quincena (y regla Q2 si aplica) | `valor_pendiente` por fila | No si está en `actividadesDeLaCuotaActual` |
| Préstamos | Plan no pagado de préstamos activos | `esta_programada` para mes/año/quincena de la cuota | `valor_pendiente` de cada fila del plan | No si está en `cuotasPrestamosDeLaCuotaActual` |
| 4×1000 | Solo tipo **transferencia** | No; checkbox off por defecto | `+ calcularImpuesto4x1000(neto)` al total a cobrar si se marca | N/A (opcional) |

---

## 7. Dónde se guarda cada valor al confirmar el pago

El flujo principal es: **`handleRegistrarPago`** en `Cuotas.vue` calcula montos y llama a **`cuotasStore.registrarPago`** (`src/stores/cuotas.js`). Después, si aplica, **`registrarPagosActividades`** y **`registrarPagosCuotasPrestamos`** persisten actividades y préstamos en sus tablas.

### 7.1 Tabla `cuotas` (actualización en `registrarPago`)

| Campo | Qué representa |
|-------|----------------|
| `valor_pagado` | Suma acumulada abonada **solo al valor de la cuota natillera** (no incluye sanción ni actividades ni préstamo en este número). |
| `valor_pagado_sancion` | Acumulado de lo aplicado a **multa/sanción** en esta y anteriores operaciones (si existe la columna en BD). |
| `valor_pagado_actividades` | Acumulado de lo contabilizado como pagado “vía cuota” hacia **actividades** (tracking en la fila de cuota). |
| `valor_multa`, `valor_multa_base`, `valor_multa_intereses` | Se ajustan según si la sanción quedó saldada, si la cuota pasa a `pagada`, etc. (lógica detallada en el store). |
| `estado` | Ver sección 8 (parcial vs completo). |
| `fecha_pago` | Se actualiza cuando hay cualquier abono registrado (`valor_pagado` > 0 tras el update). |
| `tipo_pago` | Efectivo, transferencia o mixto según el formulario. |
| `valor_pagado_efectivo` / `valor_pagado_transferencia` | En **mixto**, se acumulan por canal; en efectivo/transferencia pura se suma el incremento de `valor_pagado` al canal correspondiente. |
| `codigo_comprobante` | Código único si aún no existía (según reglas del store). |

La **distribución del monto neto** del pago (qué parte va a sanción, actividades, tope de préstamos y cuota) se hace **en el mismo orden** en la vista y en el store: **1) sanción → 2) actividades (total seleccionado) → 3) cuotas de préstamo (hasta `options.valorCuotasPrestamos`) → 4) cuota natillera**.

### 7.2 Tabla `historial_pagos_cuota` (una fila por cada abono)

Insertada al final de `registrarPago` con el desglose de **esta** transacción:

| Campo | Contenido |
|-------|-----------|
| `cuota_id`, `fecha_pago`, `forma_pago` | Identificación y momento del abono. |
| `socio_nombre`, `natillera_nombre` | Contexto para reportes/comprobantes. |
| `valor_total` | Suma de `valor_cuota` + `valor_sancion` + `valor_actividades` + `valor_cuotas_prestamo` de la fila (neto a obligaciones). |
| `valor_cuota` | Parte del abono aplicada a la **cuota** en esta transacción. |
| `valor_sancion` | Parte aplicada a **sanción**. |
| `valor_actividades` | Parte aplicada a **actividades** (según distribución del store). |
| `valor_cuotas_prestamo` | Parte destinada a **cuotas de préstamo** (coincide con lo reservado en el store). |
| `valor_pagado_cuota_total` | `valor_pagado` de la cuota **después** del update (total acumulado en `cuotas`). |
| `impuesto_4x1000` | Si aplica transferencia con GMF: valor pasado en `options.impuesto4x1000` (si la columna existe). |
| `detalle_actividades` | JSON opcional: lista de conceptos (nombre, tipo, valor) desde el modal. |
| `total_a_pagar` | Obligación neta total que la vista calculó como referencia (`totalAdeudadoPago`). |
| `detalle_cuotas_prestamo` | JSON opcional: líneas de préstamos seleccionados. |

Si alguna columna no existe en la base, el código reintenta el `insert` sin ella.

### 7.3 Actividades: tabla `socios_actividad`

Tras un `registrarPago` exitoso con monto a actividades, **`registrarPagosActividades`** en `Cuotas.vue` actualiza cada fila seleccionada: principalmente **`valor_pagado`**, y puede asignar **`codigo_comprobante`**, **`forma_pago`**, y en mixto **`valor_pagado_efectivo` / `valor_pagado_transferencia`** proporcionales. La utilidad por tipo de actividad se enlaza con la lógica de negocio allí definida.

### 7.4 Préstamos: `pagos_prestamo`, `plan_pagos_prestamo`, `prestamos`

**`registrarPagosCuotasPrestamos`** (llamada desde `handleRegistrarPago` cuando hay monto a préstamos):

- Inserta movimientos en **`pagos_prestamo`**.
- Actualiza **`plan_pagos_prestamo`** (`valor_pagado`, `pagada`, `fecha_pago`, etc. según si la cuota del plan queda completa o parcial).
- Actualiza **`prestamos`** (`saldo_actual`, `estado` si el préstamo queda saldado).

### 7.5 Otros registros relacionados

- **`historial_comprobantes`**: si ya había abonos y este pago **completa** un parcial previo, puede insertarse una fila con motivo `completar_pago_parcial` (valores anterior/nuevo).
- **`utilidades_clasificadas`**: cuando se paga sanción, el store puede sumar el monto en registros de tipo sanciones (por forma de pago).
- **Auditoría**: se registra en segundo plano vía `useAuditoria().registrarPago` con texto “pago parcial” o “pago completo” según criterios del store (ver §8).

### 7.6 Impuesto 4×1000

- En **transferencia**, el **neto** que entra a la distribución (sanción → actividades → préstamos → cuota) **no incluye** el GMF; el impuesto se pasa aparte a `historial_pagos_cuota` y se usa para totales/comprobante.
- El **bruto consignado** (neto + GMF si aplica) es lo que el usuario ve como “total a cobrar”, pero la lógica de **parcial/completo de la obligación** usa el neto aplicado a conceptos (comentarios explícitos en `handleRegistrarPago`).

---

## 8. Pago parcial vs pago completo: cómo se determina

Hay **dos niveles**: el **estado en la fila `cuotas`** (persistido en BD) y el **criterio del comprobante/UI** en `handleRegistrarPago`.

### 8.1 Estado de la cuota en `registrarPago` (`cuotas.js`)

Tras distribuir el abono, el store calcula `nuevoValorPagado` = **`valor_pagado` anterior + parte aplicada solo a la cuota natillera** (paso 4).

También calcula un umbral interno `totalAPagar` (líneas ~1883–1886) a partir de:

- `valor_cuota`,
- sanción pendiente (según flags como `sancionQuitada` y `sancionAPagar`),
- y el remanente de actividades no cubierto en esa pasada si el parámetro de actividades no se agotó.

**Reglas de `estado`:**

- **`pagada`**: si `nuevoValorPagado >= totalAPagar` (según esa fórmula del store).
- **Con abono pero sin llegar a pagar del todo**: si `nuevoValorPagado > 0` y no se cumple lo anterior, el estado depende de **fechas** (`fecha_limite`, `fecha_vencimiento`): puede quedar `programada`, `pendiente`, `mora` o `parcial` (fallback si no hay `fecha_limite`).
- **Sin abono a cuota en esta operación**: se conserva el estado anterior salvo otras reglas.

La **auditoría** usa además:  
`esPagoParcial = nuevoValorPagado > 0 && nuevoValorPagado < totalAPagar` (misma noción de umbral del store).

Importante: el umbral de **estado `pagada` en el store** se formula sobre el **campo `valor_pagado` de la cuota** y la sanción/actividades en esa función; las **obligaciones de préstamo** se liquidan en otras tablas y el reparto usa `options.valorCuotasPrestamos`, pero el cálculo de `totalAPagar` para el estado **no suma explícitamente** cuotas de préstamo en la misma expresión (el préstamo consume primero del flujo de caja del abono).

### 8.2 Comprobante y UX: `handleRegistrarPago` (`Cuotas.vue`)

Para el resumen y el comprobante se calcula un **total acumulado** más amplio:

- `valorPagadoAcumulado` ≈ `valor_pagado` + `valor_pagado_sancion` + actividades ya pagadas + abonos a préstamos de esta transacción (según variables `result` y helpers como `getActividadesInfoSocio`).

Se define:

- `valorPendienteCalculado = max(0, totalAPagar - valorPagadoAcumulado)` con un `totalAPagar` que incluye cuota, sanción, actividades y préstamos seleccionados en el modal.
- **`esParcialCalculado = valorPendienteCalculado > 0`**: si queda algo por pagar en esa visión integral, el comprobante se trata como **parcial** para el usuario (`esParcial` en el objeto `pagoRegistrado`).

También se detecta **`seCompletoPago`**: había pago parcial previo y con este abono **ya no** queda pendiente (`!esParcialCalculado && teniaPagoParcial`), para mostrar el comprobante como cierre del parcial y opcionalmente persistir **`historial_comprobantes.historial_pagos`**.

### 8.3 Resumen práctico

| Pregunta | Dónde mirar |
|----------|-------------|
| ¿La fila `cuotas` quedó `pagada`? | Campo `estado` tras `registrarPago`; condición basada en `nuevoValorPagado` vs `totalAPagar` del store. |
| ¿El usuario “debe algo más” en cuota+sanción+actividades+préstamos? | `esParcialCalculado` en `handleRegistrarPago` (acumulado vs `totalAPagar` ampliado). |
| ¿Este abono fue solo una parte del neto? | Comparar `valor_total` en `historial_pagos_cuota` con la obligación; o ver si quedó `valorPendienteCalculado > 0`. |
| ¿El GMF afecta si la obligación quedó cubierta? | **No** para decidir parcial/completo de la obligación: el comentario en código indica que el 4×1000 se liquida al final y **no** cuenta para parcial/completo de la obligación. |

---

## 9. Referencias en código

- Carga y reglas de actividades: `cargarActividadesPendientes`, `actividadCorrespondeACuota`, `toggleActividadSeleccionada`, `getTotalActividadesSeleccionadas`.
- Carga y reglas de préstamos: `cargarCuotasPrestamosPendientes`, `estaCuotaPrestamoProgramadaParaPeriodo`, `toggleCuotaPrestamoSeleccionada`, `getTotalCuotasPrestamosSeleccionadas`.
- Valor del formulario: `actualizarValorPagoConActividades`, `actualizarValorPagoConCuotasPrestamos`, `getTotalAPagar`, `getTotalAPagarConActividades`, `handleValorPagoInput`.
- GMF: `calcularImpuesto4x1000`, `getTotalACobrarModalPago`, `getBrutoTransferenciaParaDistribucion`, `distribuirTransferenciaPago`, `getValorPagoTotal`, `alCambiarTipoPagoModal`.
- Registro del pago y persistencia: `handleRegistrarPago`, `cuotasStore.registrarPago`, `registrarPagosActividades`, `registrarPagosCuotasPrestamos` (`Cuotas.vue` + `src/stores/cuotas.js`).

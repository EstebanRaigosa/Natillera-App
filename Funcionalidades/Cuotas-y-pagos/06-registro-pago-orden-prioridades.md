# 06 — Registro de pago: orden, prioridades y totales

## Función central: `cuotasStore.registrarPago(cuotaId, valorPagado, comprobante, tipoPago, valorActividades, options)`

`options` puede incluir: `valorEfectivo`, `valorTransferencia`, `valorCuotasPrestamos`, `impuesto4x1000`, `detalleActividades`, `detalleCuotasPrestamos`, `totalAPagar`, etc.

## Cálculo previo de sanción dinámica (cuota en mora)

Si `estado === 'mora'` y no `no_calcular_multa`:

- Lee `reglas_multas` de la natillera.
- Obtiene cuotas en mora del mismo socio ordenadas por `fecha_limite`.
- Calcula **multa base** según tipo (diaria con tramos, o base persistida `valor_multa_base`, o simple/escalonada con posición acumulativa; caso especial **socio mensual en natillera quincenal:** suma dos posiciones escalonadas).
- Suma **intereses adicionales** por tramo de días si aplica.

### Sanción a pagar (pendiente)

```text
valorMultaGuardado = valor_multa (o 0 si no_calcular_multa)
sancionPagadaAnterior = valor_pagado_sancion
sancionTotal = max entre guardado y dinámica según reglas del store
sancionAPagar = max(0, sancionTotal - sancionPagadaAnterior)
```

## Orden de imputación del monto recibido (obligación)

**Siempre en este orden:**

1. **Sanción** (`sancionAPagar`)
2. **Actividades** (`valorActividades` = total pendiente seleccionado en UI)
3. **Cuotas de préstamos** (tope `options.valorCuotasPrestamos`)
4. **Cuota natillera** (`valor_cuota - valor_pagado` previo)

Si queda remanente y la cuota ya estaba cubierta pero el UI mandó actividades a 0, un ajuste puede sumar el remanente a actividades para no perder historial.

## Actualización de columnas en `cuotas`

- `valor_pagado` (solo lo correspondiente a **cuota base**, no la sanción).
- `valor_pagado_sancion` += parte a sanción.
- `valor_pagado_actividades` += parte a actividades.
- `estado`, `fecha_pago`, `comprobante_url`, `tipo_pago`.
- **Mixto:** `valor_pagado_efectivo` / `valor_pagado_transferencia` si existen columnas.
- **Multa:** si pasa a pagada completa, puede poner multas a 0; si pago parcial de sanción, mantiene coherencia con `valor_multa` según ramas del store.
- **`codigo_comprobante`:** generado aleatorio 8 caracteres alfanuméricos (sin I, O, 0, 1) si no existía; reintenta unicidad contra BD.

## Nuevo estado tras pago

- **`pagada`** si `nuevoValorPagado >= totalAPagar` (definición de `totalAPagar` en store incluye cuota + sanción pendiente + actividades pendientes según la fórmula del momento).
- Si no, **parcial** o estados por **fecha** (`programada`/`pendiente`/`mora`) según `fecha_limite` y `fecha_vencimiento`.

## Vista previa al registrar (`Cuotas.vue`)

`mostrarConfirmacionPago` y `handleRegistrarPago` replican el **mismo orden** 1–4 para mostrar desglose y llamar al store con `valorPagado` ya neto a conceptos.

### Transferencia y GMF 4×1000

- **`distribuirTransferenciaPago(obligacionNeta)`:**  
  - Si no marca impuesto: el campo es **bruto** aplicable → `valorAConceptos = min(net, O)`.
  - Si marca **`aplicaImpuesto4x1000`:** el campo es **neto a obligaciones**; `impuestoGmf = calcularImpuesto4x1000(valorAConceptos)` con `valorAConceptos = min(net, O)`; bruto consignado = neto + GMF.

**`calcularImpuesto4x1000(neto)`:** `round((floor(neto) * 4) / 1000)`.

- El **GMF no reduce** el saldo de la obligación; solo acompaña el comprobante y va a `historial_pagos_cuota.impuesto_4x1000` si la columna existe.

## Retorno de `registrarPago`

`{ success, data, valorSancionPagada, valorActividadesPagado, valorCuotasPrestamosPagado, valorCuotaPagado, insertedHistorialComprobanteId }`.

## Utilidades por sanción pagada

Si se pagó sanción y no es `no_calcular_multa`, se acumula el monto en **`utilidades_clasificadas`** tipo `sanciones` por `natillera_id` y `forma_pago` (efectivo/transferencia/mixto).

## Historial

Insert en **`historial_pagos_cuota`** por cada abono con desglose; reintentos sin columnas opcionales si fallan migraciones.

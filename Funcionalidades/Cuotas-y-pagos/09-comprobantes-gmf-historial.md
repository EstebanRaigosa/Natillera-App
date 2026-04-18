# 09 — Comprobantes, GMF e historial

## Código de comprobante

- Generado en **`registrarPago`** del store: 8 caracteres alfanuméricos; validación de unicidad contra **`cuotas.codigo_comprobante`**.
- Si la columna no existe en BD, el flujo continúa sin código.

## `historial_pagos_cuota`

Por cada operación de pago que inserta historial, campos típicos:

- `cuota_id`, `fecha_pago`, `forma_pago`, `socio_nombre`, `natillera_nombre`
- `valor_total`, `valor_cuota`, `valor_sancion`, `valor_actividades`, `valor_cuotas_prestamo`
- `valor_pagado_cuota_total` (acumulado en cuota)
- Opcional: `impuesto_4x1000`, `detalle_actividades`, `total_a_pagar`, `detalle_cuotas_prestamo`

Reintentos sin columnas opcionales si Postgres/PostgREST rechaza por migración pendiente.

## `historial_comprobantes`

- En **pago parcial completado** (nuevo abono cuando ya había pago): insert con códigos y valores anterior/nuevo.
- En **edición** de cuota/cambio de código: lógica relacionada en `guardarEdicionCuota` y flujos de reenvío.

## GMF / 4×1000

- Cálculo: **`round((floor(neto) * 4) / 1000)`** sobre el neto aplicado a obligaciones.
- En **transferencia** con checkbox: se muestra bruto = neto + GMF en resúmenes; el desglose en confirmación usa `distribuirTransferenciaPago`.
- **Comprobante:** `impuesto4x1000Comprobante` puede tomar valor de fila guardada, suma de conceptos GMF en historial, o inferencia bruto−neto en transferencias.

## Reenvío de comprobante

Funciones como **`reenviarComprobantePorCodigo`**, carga desde **`historial_comprobantes`** y **`historial_pagos_cuota`** para reconstruir el comprobante; **`obtenerRespaldoGmfDesdeHistorialComprobantes`** si el GMF no está en historial de pagos.

## Imagen / WhatsApp / descarga

- Generación de PNG del nodo del comprobante (`html-to-image`), compartir por WhatsApp, descargas — flujo de UI en la parte final del script de `Cuotas.vue`.

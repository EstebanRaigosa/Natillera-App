# 13 — Modales de edición y flujos auxiliares

## Editar pago / cuota (`guardarEdicionCuota`)

- Permite ajustar **`valor_pagado`**, tipo de pago, y en algunos casos regenerar **código de comprobante**.
- Sincroniza **GMF** con `sincronizarImpuesto4x1000HistorialTrasEditar` si aplica.
- Tras guardar: **`cuotasStore.fetchCuotasNatillera`** + **`recalcularSancionesMes`**.
- Puede abrir modal de **modificación** con comprobante de diferencia (valor anterior vs nuevo).

## Historial de ajustes (`abrirModalHistorialAjustes`)

- Muestra **ajustes** derivados de descripciones o flags de la cuota (ver `obtenerAjustesFormateados`, `tieneAjuste`).

## Detalle de cuota (`abrirModalDetalleCuota`)

- Muestra **`totalAPagarDetalle`:** cuota + sanciones (`getDesgloseSancionCuota`) + actividades (`getDesgloseActividadesCuota` / `getActividadesInfoSocio`).
- Carga **`historialPagosCuota`** desde `historial_pagos_cuota` o lógica asociada.

## Detalle / editar socio desde la lista

- **`verDetalleSocio`** / **`editarSocio`:** abre modales con datos de `socios_natillera` y persona.
- **`handleGuardarSocio`:** actualiza socio y puede disparar **`generarCuotasParaSocio`** (usa `generarCuotasBatchParaSocio` del store) con progreso en `progresoCreacion`.

## Recalcular sanciones al volver

- `watch` sobre ruta o mes puede llamar **`recalcularSancionesMes`** cuando cambia el mes seleccionado (revisar watchers en el archivo para el evento exacto).

## Lista: totales `totalesLista`

- Por cada cuota suma: `valor_pagado` + `valor_pagado_sancion` + actividades pagadas en info + préstamos (sync), para pie de tabla en vista lista.

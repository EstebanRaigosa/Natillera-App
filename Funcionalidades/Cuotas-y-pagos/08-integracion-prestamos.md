# 08 — Integración con préstamos y plan de pagos

## Tablas

- **`prestamos`:** préstamo por socio (`socio_natillera_id`, `estado`, `periodicidad`, …).
- **`plan_pagos_prestamo`:** cada cuota del plan (`prestamo_id`, `numero_cuota`, `valor_cuota`, `valor_pagado`, `pagada`, `fecha_proyectada`, …).
- **`pagos_prestamo`:** registros de abonos vinculados al plan.

## En la vista de cuotas

- **`cargarCuotasPrestamosPendientes`:** para el modal de pago, trae cuotas del plan **no pagadas** de préstamos **activos** del socio, filtrando las que corresponden al **mes/año/quincena** de la cuota de natillera (función `estaCuotaPrestamoProgramadaParaPeriodo` y similares).
- Selección con **`Set`** de ids; total **`getTotalCuotasPrestamosSeleccionadas`**.
- Cachés por periodo: `cuotasPrestamosPendientesPorPeriodo`, `cuotasPrestamosAbonadoPorPeriodo` para totales en tarjetas agrupadas.

## Orden de pago

Después de sanción y actividades, **antes** de aplicar saldo a la cuota de la natillera. Coherente con `options.valorCuotasPrestamos` en `registrarPago`.

## Post-registro

**`registrarPagosCuotasPrestamos`** inserta/actualiza pagos en el plan y en **`pagos_prestamo`** según el monto distribuido (ver implementación en `Cuotas.vue` para el reparto entre varias cuotas seleccionadas).

## Vista agrupada por socio

En **`cuotasAgrupadasPorSocio`:**

- Suma **pendiente préstamos** con `getTotalCuotasPrestamosPendientesSocioSync` (versión síncrona basada en caché/mapas).
- Suma **abonado** con `getTotalAbonadoPrestamosCuotaSocioSync`.

## Comprobante y totales

Los abonos a préstamos entran en **`totalRecaudado`** del mes y en **`totalesLista`** como línea “préstamo” junto a cuota/sanción/actividad.

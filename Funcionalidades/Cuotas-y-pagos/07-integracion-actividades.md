# 07 — Integración con actividades

## Tablas

- **`socios_actividad`:** vínculo socio–actividad con montos pendientes/pagados, estados, códigos de comprobante, etc.
- **`actividades`:** catálogo (descripción, tipo, …).

## Rol en la pantalla de cuotas

- Al abrir el modal de pago, se cargan **actividades pendientes** del socio que correspondan al **periodo de la cuota** (`cargarActividadesPendientes`, `actividadCorrespondeACuota`).
- El usuario puede seleccionar un subconjunto; el total seleccionado entra en **`getTotalActividadesSeleccionadas`** y en el **total a pagar** vía `getTotalAPagarConActividades`.

## Cálculo de totales en UI

- **`getActividadesPendientesSocio(cuota)`:** lee de `actividadesPendientesPorSocio[cuota.id]` (estructura por cuota).
- **`getActividadesInfoSocio`:** prioriza **`valor_pagado_actividades`** en la fila **`cuotas`** para mostrar lo abonado a actividades **en esa cuota** (aunque la actividad sea de otro periodo, el dinero queda asociado a la cuota donde se pagó).

## Registro tras `registrarPago`

Si el pago fue exitoso y hay monto a actividades, la vista llama **`registrarPagosActividades`**, que:

- Actualiza filas en **`socios_actividad`** (pagos parciales/completos).
- Puede reflejar ingresos en **`utilidades_clasificadas`** según si la actividad está **liquidada** o **en curso** (lógica en la función; consultar el bloque alrededor de `utilidades_clasificadas` en `Cuotas.vue`).

## Orden respecto a otros conceptos

Las actividades se pagan **después** de la sanción y **antes** de las cuotas de préstamos y la cuota base (documento 06).

## Sincronización con edición

Al editar pagos, se pueden recargar actividades pagadas (`cargarActividadesPagadasEditar`) y sincronizar montos con el store de cuotas.

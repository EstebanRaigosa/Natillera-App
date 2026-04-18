# 12 — Tablas y relaciones (backend)

Lista de tablas **referenciadas** por `Cuotas.vue` y/o `stores/cuotas.js` en los flujos de cuotas y pagos. Los campos no son exhaustivos; revisar migraciones SQL del repo para esquema exacto.

## Núcleo cuotas

| Tabla | Uso principal |
|-------|----------------|
| **natilleras** | Período (`mes_inicio`, `mes_fin`, `anio`, `anio_inicio`), `reglas_multas`, `nombre`, `periodicidad`. |
| **socios_natillera** | Vínculo socio–natillera: `valor_cuota_individual`, `periodicidad`, `estado`, `natillera_id`. |
| **socios** | Datos personales (nombre, documento, teléfono, avatares, …) vía join. |
| **cuotas** | Registro mensual/quincenal: montos, fechas, estado, multas, pagos, tipo_pago, códigos, desglose. |

### Columnas destacadas en `cuotas`

- Identidad: `id`, `socio_natillera_id`, `mes`, `anio`, `quincena`
- Importes: `valor_cuota`, `valor_pagado`, `valor_multa`, `valor_multa_base`, `valor_multa_intereses`, `valor_pagado_sancion`, `valor_pagado_actividades`, `valor_pagado_efectivo`, `valor_pagado_transferencia`
- Fechas: `fecha_limite`, `fecha_vencimiento`, `fecha_mora`, `fecha_inicio_mora`, `fecha_pago`
- Otros: `estado`, `descripcion`, `nombre_socio`, `nombre_natillera`, `tipo_pago`, `codigo_comprobante`, `comprobante_url`, `no_calcular_multa`, `mora_orden`

## Historial y comprobantes

| Tabla | Uso |
|-------|-----|
| **historial_pagos_cuota** | Una fila por abono con desglose y GMF opcional. |
| **historial_comprobantes** | Cambios de código, snapshots `historial_pagos`, completar pago parcial. |

## Finanzas / utilidades

| Tabla | Uso |
|-------|-----|
| **utilidades_clasificadas** | Acumulado de sanciones pagadas por forma de pago; actividades liquidadas/en curso (desde vista de actividades). |

## Actividades

| Tabla | Uso |
|-------|-----|
| **socios_actividad** | Asignaciones y pagos por actividad. |
| **actividades** | Catálogo. |

## Préstamos

| Tabla | Uso |
|-------|-----|
| **prestamos** | Préstamos del socio. |
| **plan_pagos_prestamo** | Cuotas del plan. |
| **pagos_prestamo** | Abonos registrados. |

## Auditoría

Composable **`useAuditoria`**: eventos de creación/edición/eliminación/pago (no es tabla única en este listado; dependerá del esquema `auditoria` si existe).

## Relaciones lógicas

```text
natilleras 1 — * socios_natillera * — 1 socios (persona)
socios_natillera 1 — * cuotas
socios_natillera 1 — * prestamos 1 — * plan_pagos_prestamo
cuotas 1 — * historial_pagos_cuota
cuotas 1 — * historial_comprobantes
```

## Índices

El repositorio puede incluir migraciones de rendimiento (ej. `migrations/011_add_perf_indexes.sql`) para consultas por `natillera_id`, `mes`, `anio`, `socio_natillera_id`.

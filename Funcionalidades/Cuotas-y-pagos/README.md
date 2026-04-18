# Cuotas y pagos — Resumen ejecutivo

Documentación de la pantalla **Cuotas y Pagos** (`src/views/cuotas/Cuotas.vue`) y de los procesos que la sustentan (principalmente `src/stores/cuotas.js`, Supabase y vistas relacionadas).

## Propósito

Permitir a una **natillera** consultar y gestionar las **cuotas mensuales o quincenales** de sus socios para un **mes/año** concreto (según el período operativo de la natillera), ver **resúmenes de recaudación**, **filtrar**, **registrar pagos** (incluyendo sanciones por mora, actividades opcionales y cuotas de préstamos), **generar** o **eliminar** cuotas del mes, **exportar** a Excel y operar **comprobantes** (código, GMF 4×1000, historial).

## Rutas y entrada

| Ruta | Vista | Rol |
|------|--------|-----|
| `/natilleras/:id/cuotas` | `CuotasMeses.vue` | Selector de meses |
| `/natilleras/:id/cuotas/:mes` | `Cuotas.vue` | Detalle del mes (`mes` = 1–12) |

El `id` es el identificador de la natillera. La vista recibe `props.id` y `props.mes` (o `route.params`).

## Piezas de software involucradas

- **Vista:** `Cuotas.vue` (UI, computeds, modales, llamadas directas a Supabase para actividades/préstamos/historial en varios flujos).
- **Store Pinia:** `useCuotasStore` — carga de cuotas, generación por período, registro de pago, cálculo de sanciones, actualización de mora, etc.
- **Otros stores:** `natilleras`, `socios`, `colaboradores`, `auth` (rol, email admin).
- **Backend datos:** tablas en Supabase/Postgres (listado en `12-tablas-y-relaciones-backend.md`).

## Funcionalidades (mapa a documentos)

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [01-contexto-ruta-y-arquitectura.md](./01-contexto-ruta-y-arquitectura.md) | Componentes, stores, flujo general de carga |
| 02 | [02-periodo-mes-anio-y-filtrado.md](./02-periodo-mes-anio-y-filtrado.md) | `calcularAnioMes`, `getCuotasPorMes`, socios inactivos ocultos |
| 03 | [03-estados-cuota-fechas.md](./03-estados-cuota-fechas.md) | Programada / pendiente / mora / pagada / parcial; fechas límite y vencimiento |
| 04 | [04-sanciones-multas-reglas-calculo.md](./04-sanciones-multas-reglas-calculo.md) | Tipos de sanción, `mora_orden`, intereses, `no_calcular_multa` |
| 05 | [05-generacion-actualizacion-cuotas.md](./05-generacion-actualizacion-cuotas.md) | `generarCuotasPeriodo`, cambios de periodicidad, fechas por defecto |
| 06 | [06-registro-pago-orden-prioridades.md](./06-registro-pago-orden-prioridades.md) | Orden: sanción → actividades → préstamos → cuota; mixto y transferencia |
| 07 | [07-integracion-actividades.md](./07-integracion-actividades.md) | `socios_actividad`, `actividades`, liquidación en utilidades |
| 08 | [08-integracion-prestamos.md](./08-integracion-prestamos.md) | `prestamos`, `plan_pagos_prestamo`, `pagos_prestamo` |
| 09 | [09-comprobantes-gmf-historial.md](./09-comprobantes-gmf-historial.md) | Código comprobante, 4×1000, `historial_pagos_cuota`, `historial_comprobantes` |
| 10 | [10-exportacion-filtros-vistas-ui.md](./10-exportacion-filtros-vistas-ui.md) | Filtros, vistas tarjeta/excel/lista/agrupada, Excel |
| 11 | [11-borrado-cuotas-y-permisos.md](./11-borrado-cuotas-y-permisos.md) | Borrado masivo, visor, admin por email |
| 12 | [12-tablas-y-relaciones-backend.md](./12-tablas-y-relaciones-backend.md) | Inventario de tablas y campos relevantes |
| 13 | [13-modales-edicion-y-flujos-auxiliares.md](./13-modales-edicion-y-flujos-auxiliares.md) | Editar pago, socio, detalle, historial de ajustes |
| 14 | [14-visual-layout-y-flujos-interaccion.md](./14-visual-layout-y-flujos-interaccion.md) | Mapa de pantalla, tarjetas, modal pago, diagramas, **valores por defecto** y **orden de organización** |
| 15 | [15-tarjetas-socio-modal-pago-y-comprobante.md](./15-tarjetas-socio-modal-pago-y-comprobante.md) | **Cards por socio** (datos y botones), **modal registrar pago** (cada bloque), **comprobante** (paridad visual con PNG/WhatsApp) |
| 17 | [17-sdd-registrar-pago-desde-selector-socio.md](./17-sdd-registrar-pago-desde-selector-socio.md) | **SDD (propuesto):** botón «Registrar Pago», modal selector socio → cuotas del mes, FAB móvil verde, reutiliza `abrirModalPago` |

## Reglas de negocio transversales (lectura rápida)

1. **Año del mes:** si la natillera tiene período que cruza años (ej. diciembre–noviembre), el año de cada mes se obtiene con `calcularAnioMes` usando `mes_inicio`, `mes_fin`, `anio_inicio` / `anio`.
2. **Estado “real” en UI:** además del `estado` en BD, la vista calcula `estadoReal` con `calcularEstadoRealCuota` (alineado al store para mora/sanciones).
3. **Pagada en UI:** si `valor_pagado >= valor_cuota` → se considera pagada para filtros/resumen (la lógica de pago total en servidor puede incluir sanción y otros conceptos).
4. **Sanciones:** configuración en `natilleras.reglas_multas` (JSON); cálculo intensivo en `calcularSancionesTotales` y al pasar a mora / registrar pago.

## Permisos de superusuario (cuotas y resto del producto)

El correo **`raigo.16@gmail.com`** concentra controles extra en Cuotas (generar, borrar mes, multa) y en otras vistas (Dashboard, configuración, auditoría, etc.). Ver **[Permisos-superusuario-raigo.md](../Permisos-superusuario-raigo.md)**.

## Nota para el equipo de desarrollo

Esta documentación describe el comportamiento **actual del código** (Vue 3 + Pinia + Supabase). Para replicar en otro stack, respetar el orden de imputación del pago, las fórmulas de fechas y la persistencia de `valor_multa_base` / `mora_orden` / `fecha_inicio_mora` donde aplique.

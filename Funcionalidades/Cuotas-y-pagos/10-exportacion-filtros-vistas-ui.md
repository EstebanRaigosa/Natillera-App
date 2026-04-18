# 10 — Exportación, filtros y vistas de UI

## Filtros

| Filtro | Comportamiento |
|--------|------------------|
| Estado | Toggle en tarjetas resumen; filtra por `estadoReal`. “Pendiente” excluye `programada`. |
| Periodicidad | Mensual: sin `quincena`; Quincenal: `quincena` 1 o 2. |
| Tipo de pago | `tipo_pago` de la cuota vs `efectivo` / `transferencia` (default efectivo si null). |
| Búsqueda | Nombre, descripción, documento, teléfono. |

**Quitar filtros** resetea todo y puede cerrar el panel en móvil.

## Vistas de listado

1. **Tarjetas (default):** grid responsive con datos por cuota y acciones.
2. **Vista Excel (`vistaExcel`):** tabla densa; solo desktop (`checkMobileView` fuerza off en &lt; md).
3. **Vista lista (`vistaLista`):** filas compactas con expansión en móvil (`listaExpandidos`).
4. **Vista agrupada (`vistaAgrupada`):** por socio (`cuotasAgrupadasPorSocio`) con subtotales pendientes, actividades, préstamos.

## Exportación Excel

- Librería **`xlsx-js-style`**.
- Columnas seleccionables: socio, descripción, periodicidad, valores, fechas, forma de pago, estado, quincena.
- Estilos condicionados por columna **Estado** y números formateados.
- Nombre archivo: `Cuotas_{Mes}_{Año}_{fechaISO}.xlsx`.

## Modales y UX

- **LoadingScreen** al inicializar; **LoadingBox** durante registro de pago o reenvío de comprobante.
- **Scroll lock** en modales (`useBodyScrollLock`).
- **Breadcrumbs**, **BackButton** a listado de meses.
- **Desglose recaudación:** modal con proporción efectivo vs transferencia (`estadisticasRecaudacion`).

## Desglose de recaudación (tarjetas)

- **Efectivo:** cuotas con `tipo_pago` default efectivo.
- **Transferencia:** `tipo_pago === 'transferencia'`.
- Cada total suma: cuota pagada + sanción pagada + actividades + préstamos (misma fórmula que `resumenMesActual.totalRecaudado` por tipo).

# 02 — Período, mes, año y filtrado

## Configuración de la natillera

Desde `natilleras` se usan:

- **`mes_inicio`**, **`mes_fin`:** rango de meses operativos (puede cruzar año, ej. 12 → 11).
- **`anio_inicio`** (preferido) o **`anio`:** año base del período.
- Lista de meses disponibles en UI: `mesesNatillera` (itera de `mes_inicio` a `mes_fin` con lógica de cruce de año).

## Función `calcularAnioMes(mes, mesInicioNatillera, mesFinNatillera, anioInicioNatillera)`

**Objetivo:** Para un mes calendario `1…12`, determinar en qué año cae dentro del período de la natillera.

**Reglas:**

1. Si **`mes_inicio > mes_fin`** (período cruza año nuevo):
   - Si `mes >= mes_inicio` → año = `anioInicioNatillera` (tramo “final” del año calendario, ej. dic).
   - Si `mes <= mes_fin` → año = `anioInicioNatillera + 1` (tramo “inicio” del siguiente año calendario, ej. ene–nov).
2. Si **`mes_inicio <= mes_fin`** (período dentro del mismo año natural):
   - Devuelve siempre `anioInicioNatillera`.

**Uso:** `anioMesSeleccionado`, `getCuotasPorMes(mes, anioCorrecto)`, generación de cuotas, borrado, fechas por defecto.

## Filtrado de cuotas del mes: `getCuotasPorMes` (store)

```text
cuotas donde cuota.mes === mes AND (si anio !== null) cuota.anio === anio
```

## Socios inactivos ocultos

**Computed `sociosInactivosSinPagoCompletoIds`:**

- Agrupa cuotas del mes por `socio_natillera_id`.
- Si el socio está **`estado === 'inactivo'`** en `socio_natillera` y **no** tiene todas las cuotas del mes con `valor_pagado >= valor_cuota`, ese socio se **excluye** de la lista (`cuotasFiltradas`).

**Intención:** No mostrar cuotas “abiertas” de socios ya dados de baja; si completaron el mes antes de inactivarse, sí pueden verse.

## Filtros de la lista (`cuotasFiltradas`)

1. **Exclusión** de socios en el set anterior.
2. **`estadoReal`** por cuota (`calcularEstadoRealCuota`) — ver documento 03.
3. **Filtro por estado:** `todos` | `pagada` | `pendiente` | `mora`. Nota: para `pendiente` solo entran filas con `estadoReal === 'pendiente'` (se excluye `programada`).
4. **Periodicidad:** `mensual` → `!cuota.quincena` (falsy: null/0); `quincenal` → `cuota.quincena` truthy (1 o 2).
5. **Tipo de pago:** compara `cuota.tipo_pago || 'efectivo'` con el filtro.
6. **Búsqueda:** nombre socio, descripción cuota, documento, teléfono (minúsculas, includes).

## Ordenación

- Primero por **prioridad de estado:** mora (1) → pendiente (2) → programada (3) → pagada (4).
- Luego **nombre del socio** (`localeCompare` es).

## Resumen del mes (`resumenMesActual`)

- Usa las cuotas del mes (con año calculado) y **`estadoReal`** para contar pagadas/pendientes/mora/programadas.
- **`porcentajeRecaudado`:** `(suma valor_pagado / suma valor_cuota) * 100` sobre esas cuotas (solo cuota base, no incluye sanciones en el denominador).
- **`totalRecaudado`:** suma por cuota de: `valor_pagado` + `valor_pagado_sancion` + actividades pagadas (`getActividadesInfoSocio(c).pagadas`) + cuotas préstamo pagadas en el periodo (`getTotalCuotasPrestamosPagadasSocioSync`).

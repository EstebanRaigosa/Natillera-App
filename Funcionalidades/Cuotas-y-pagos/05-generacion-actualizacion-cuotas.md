# 05 — Generación y actualización de cuotas

## Función principal del store: `generarCuotasPeriodo(natilleraId, fechasLimite, mesLabel, mes, anio, socioId)`

### Entrada `fechasLimite`

Objeto con:

- **`mensual`:** `{ vencimiento, limite }` o un solo string (se normaliza a vencimiento=limite).
- **`quincena1`**, **`quincena2`:** idem.

En la vista **`handleGenerarCuotas`**, la **fecha límite mensual** usa el mismo campo que la **2.ª quincena** (`fecha_quincena2`). La 1.ª quincena usa `fecha_quincena1`.

### Socios incluidos

- Solo **`socios_natillera`** con **`estado === 'activo'`**.
- Si `socioId` se pasa, solo ese socio (debe estar activo).

### Prefetch

- Todas las cuotas existentes del **`mes` + `anio`** para esos socios en **una** query.
- Mapa clave: `` `${socio_natillera_id}-${'mensual'|1|2}` `` para detectar duplicados y actualizaciones.

### Periodicidad del socio

- **`quincenal`:** hasta **2** filas (quincena 1 y 2).
- **`mensual`:** una fila con **`quincena`** null o 0 según insertos (el código usa `quincena: null` en creación mensual).

### Cambio de periodicidad (migración de pagos)

**De mensual a quincenal** (`cambioAQuincenal`):

- Elimina la cuota mensual del mapa y la marca para **DELETE**.
- Crea **Q1** con **`valor_pagado`** = el que tenía la mensual (migrado).
- Crea **Q2** sin pago.
- Auditoría tipo `cambio_periodicidad` / migración.

**De quincenal a mensual** (`cambioAMensual`):

- Suma `valor_pagado` de Q1 y Q2.
- Elimina ambas cuotas.
- Crea una cuota mensual con el **pago migrado** sumado.

### Actualización vs inserción

- Si la cuota ya existe: **UPDATE** de fechas, `valor_cuota` desde `valor_cuota_individual`, `estado`, `descripcion`, `nombre_socio`, etc.
- Si no: **INSERT** batch de todas las nuevas filas.

### Campos típicos en `cuotas` al crear

- `socio_natillera_id`, `valor_cuota`, `valor_pagado`, `fecha_vencimiento`, `fecha_limite`, `mes`, `anio`, `quincena`, `estado`, `descripcion`, `nombre_natillera`, `nombre_socio`.

**Cálculo de `fecha_vencimiento` en la vista antes de llamar al store:**

```text
fecha_vencimiento = fecha_limite_parseada + dias_gracia (días calendario)
```

formateado a `YYYY-MM-DD` sin UTC.

### Post-proceso

- `actualizarEstadoMoraAutomatico(todasLasCuotas)` se lanza **sin await** tras generar (puede actualizar estados).

### Opción `skipMoraUpdate` en `fetchCuotasNatillera`

Tras generar, la vista a veces recarga con **`skipMoraUpdate: true`** para acelerar (cuotas nuevas); el usuario puede recalcular mora en otra navegación.

## `generarCuotasAutomaticas` / `generarCuotasFaltantes` / `generarCuotasBatchParaSocio`

Existen variantes en el store para flujos automáticos o un solo socio (p. ej. alta de socio desde la misma vista). La lógica de negocio es coherente con fechas y periodicidad; revisar el store para parámetros exactos si se replican.

## Fechas por defecto en la vista: `calcularFechasPorDefecto(mes, anio, diasGracia)`

- **Quincena 1:** día **15** del mes.
- **Quincena 2 / referencia mensual:** día **30**, excepto **febrero** (último día del mes vía `new Date(anio, 2, 0)`).

No incluyen días de gracia en el número del día (la gracia va a `fecha_vencimiento` al generar).

## `cargarFechasDelMes` (vista)

Si ya hay cuotas del mes, toma `fecha_limite` de una cuota Q1 y de una Q2/mensual para rellenar el formulario del modal. Si no hay cuotas, recalcula defaults vía `calcularFechasPorDefecto` con `dias_gracia` de la natillera.

## Verificación `verificarCuotasFaltantes`

Comprueba que haya cuotas para el mes/año y que el número de socios con cuotas coincida con el conteo de activos; para quincenales exige presencia de Q1 y Q2.

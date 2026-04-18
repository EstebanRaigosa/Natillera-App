# 03 — Estados de cuota y fechas

## Estados en base de datos

Valores usados en flujos: `programada`, `pendiente`, `parcial`, `mora`, `pagada`.

## Fechas relevantes por cuota

| Campo | Significado |
|-------|-------------|
| `fecha_limite` | Día desde el cual la cuota deja de estar “antes del plazo”; inicio de ventana de pago sin mora en sentido de calendario de la app. |
| `fecha_vencimiento` | Fin de la ventana sin entrar en mora (típicamente **fecha límite + días de gracia** al generar). Si no existe en BD, en UI se puede calcular como `fecha_limite + dias_gracia`. |
| `fecha_mora` | Fecha en que se marcó mora (actualización automática). |
| `fecha_inicio_mora` | Primer día en mora (para cómputo de sanción diaria y tramos). |
| `fecha_pago` | Última actualización de pago si `valor_pagado > 0`. |

**Parsing:** Los strings `YYYY-MM-DD` se parsean con componentes numéricos en hora local para evitar desfases UTC.

## `calcularEstadoRealCuota(cuota, diasGracia)` — Vista

**Orden de evaluación:**

1. Si **`valor_pagado >= valor_cuota`** → **`pagada`**.  
   - Nota: Esto es independiente de sanciones; “pagada” en resumen de tarjetas significa “cuota base cubierta”.

2. Si no hay `fecha_limite` → `cuota.estado` o `programada`.

3. Construir `fechaLimite` desde `fecha_limite`.

4. Construir `fechaVencimiento`:
   - Si existe `fecha_vencimiento` en la cuota → usarla.
   - Si no → `fechaLimite + dias_gracia` (parámetro; por defecto 3 desde config).

5. Comparar **hoy** (medianoche local) con:
   - **`fecha_actual < fecha_limite`** → **`programada`**
   - **`fecha_limite <= fecha_actual <= fecha_vencimiento`** → **`pendiente`**
   - **`fecha_actual > fecha_vencimiento`** → **`mora`**

## `calcularEstadoRealCuotaStore` — Store (alineado + detalle para mora)

Misma idea, pero la condición de pagada usa **`valor_pagado >= valor_cuota`** igual; para el resto usa fechas como arriba. Se documenta en el store como necesario para que cuotas en **pago parcial** pero ya fuera de `fecha_vencimiento` entren en lógica de mora/sanciones.

## Actualización automática en BD: `actualizarEstadoMoraAutomatico`

Recorre cuotas no totalmente pagadas según **`valor_pagado + valor_multa`** (total a pagar incluyendo multa):

- Si **`valor_pagado >= valor_cuota + valor_multa`** → no cambia por este bloque (considerada cubierta en ese aspecto).

Para el resto, con fechas normalizadas a string `YYYY-MM-DD`:

- **`pendiente` o `parcial`** y **`fecha_actual < fecha_limite`** → pasar a **`programada`** (corrección).
- **`programada`** y **`fecha_limite <= fecha_actual <= fecha_vencimiento`** → **`pendiente`**.
- **`pendiente` o `parcial`** y **`fecha_actual > fecha_vencimiento`** → **`mora`** (y aplicar lógica de multas si config activa).

## Estados al generar cuotas: `calcularEstadoInicial` / `calcularNuevoEstado` (store `generarCuotasPeriodo`)

- **`calcularEstadoInicial(vencimiento, limite)`:**  
  - Si hoy **>** fecha vencimiento → `mora`  
  - Else si hoy **>=** fecha límite → `pendiente`  
  - Else → `programada`

- **`calcularNuevoEstado(valorPagado, nuevoValorCuota, estadoActual, ...)`:**  
  - Si `valorPagado >= nuevoValorCuota` → `pagada`  
  - Si `valorPagado > 0` → `parcial`  
  - Si no, `calcularEstadoInicial(...)`

## Tras registrar pago (`registrarPago` en store)

El nuevo estado combina totales y fechas:

- **`pagada`** si `nuevoValorPagado >= totalAPagar` donde `totalAPagar` incluye lógica de sanción pendiente y actividades (ver documento 06).
- Si hay pago parcial, se recalcula estado por fechas como en `calcularEstadoRealCuota` (programada/pendiente/mora/parcial fallback).

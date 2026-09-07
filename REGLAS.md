# Reglas del Sistema - Natillera App

## Configuración Regional

La configuración regional que se mantendrá para el proyecto será la de **Colombia**, de la siguiente manera:

| Elemento | Valor Correcto |
|----------|---------------|
| **País / Región** | Colombia |
| **Idioma** | Español (Colombia) |
| **Formato de Fecha** | `dd/MM/yyyy` (ejemplo: 15/12/2024) |
| **Separador Decimal** | `,` (coma) |
| **Separador de Miles** | `.` (punto) |
| **Moneda** | Peso colombiano (`$`) |
| **Zona Horaria** | `UTC -05:00 (Bogotá)` |

### Aplicación en el Sistema

Esta configuración afecta:
- **Formato de fecha**: Todas las fechas se mostrarán en formato `dd/MM/yyyy`
- **Separador decimal y de miles**: Los números se formatearán con punto para miles y coma para decimales (ejemplo: `1.234.567,89`)
- **Moneda**: Se utilizará el símbolo `$` para pesos colombianos
- **Zona horaria**: Todas las fechas y horas se manejarán en la zona horaria de Bogotá (UTC-5)
- **Formato de números**: Importante para Excel, SQL y aplicaciones que exporten datos

### Ejemplos de Formato

- **Fecha**: `15/12/2024` (no `2024-12-15` o `12/15/2024`)
- **Número**: `1.234.567,89` (no `1,234,567.89`)
- **Moneda**: `$1.234.567` (no `COP 1,234,567` o `1.234.567 COP`)

---

## Estados de las Cuotas

Existen 4 estados posibles para una cuota: **Programada**, **Pendiente**, **En Mora** y **Pagada**.

### Definición de Estados

#### 1. Programada
Una cuota está en estado **Programada** cuando:
- La fecha actual es **anterior** a la **Fecha Límite**

**Fórmula:** `fecha_actual < fecha_limite`

#### 2. Pendiente
Una cuota pasa a estar en estado **Pendiente** cuando:
- La fecha actual es **mayor o igual** a la **Fecha Límite**
- Y la fecha actual es **menor o igual** a la **Fecha de Vencimiento**

**Fórmula:** `fecha_limite <= fecha_actual <= fecha_vencimiento`

#### 3. En Mora
Una cuota está en estado **En Mora** cuando:
- La fecha actual **supera** la **Fecha de Vencimiento**

**Fórmula:** `fecha_actual > fecha_vencimiento`

#### 4. Pagada
Una cuota está en estado **Pagada** cuando:
- El valor pagado es igual o mayor al 100% del valor de la cuota

**Fórmula:** `valor_pagado >= valor_cuota`

**El capital manda.** La sanción pendiente **no** forma parte de este criterio. Una cuota con el
capital completo nunca vuelve a *En Mora* por el paso del calendario:
- Si el capital se pagó **a más tardar el día del vencimiento**, la cuota es *Pagada* y no debe
  sanción alguna, aunque en algún momento se le hubiera calculado una.
- Si el capital se pagó **después** del vencimiento, la sanción existe pero queda **congelada al día
  del pago**: los intereses por día se cuentan hasta la `fecha_pago`, nunca hasta hoy.
- Si el capital se pagó tarde y **la sanción ya está abonada por completo** (`valor_pagado_sancion >=
  valor_multa`), la cuota es *Pagada*: se conservan la multa y el abono como historial, solo cambia el
  estado.
- **«No calcular multa» es el perdón**, y se hace efectivo **moviendo la `fecha_pago` al día del
  vencimiento** (a mediodía local). Como la mora se decide por fechas, poner la multa en 0 no bastaba:
  el siguiente recálculo la volvía a cobrar. Con la fecha ajustada, la cuota es *Pagada* a tiempo
  para cualquier cálculo. Si se marca antes de pagar, el ajuste se aplica al registrar el pago.

> Por qué está escrito: el criterio anterior (`valor_pagado >= valor_cuota + valor_multa`) hacía que
> cualquier multa —incluida una calculada por error— sacara la cuota de *Pagada*, el calendario la
> devolviera a *En Mora* y la multa volviera a crecer cada día. Una cuota pagada el mismo día del
> vencimiento llegó a figurar con $41.500 de sanción cinco meses después.

### Cuotas con Pago Parcial

Cuando una cuota tiene **pago parcial** (es decir, `0 < valor_pagado < valor_cuota`), aplican los mismos estados definidos anteriormente:
- La cuota puede estar **Programada**, **Pendiente** o **En Mora** según la relación entre la fecha actual y la fecha límite
- Solo pasa a **Pagada** cuando el valor pagado alcanza el 100% del valor de la cuota

---


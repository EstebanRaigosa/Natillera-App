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
- Se ha generado la cuota
- La fecha actual **NO** es mayor o igual a la **Fecha Límite** menos los **Días de Gracia**

**Fórmula:** `fecha_actual < (fecha_limite - dias_gracia)`

#### 2. Pendiente
Una cuota pasa a estar en estado **Pendiente** cuando:
- La fecha actual es **mayor o igual** a la **Fecha Límite** menos los **Días de Gracia**
- Y la fecha actual es **menor o igual** a la **Fecha Límite**

**Fórmula:** `(fecha_limite - dias_gracia) <= fecha_actual <= fecha_limite`

#### 3. En Mora
Una cuota está en estado **En Mora** cuando:
- La fecha actual **supera** la **Fecha Límite**

**Fórmula:** `fecha_actual > fecha_limite`

#### 4. Pagada
Una cuota está en estado **Pagada** cuando:
- El valor pagado es igual o mayor al 100% del valor de la cuota

**Fórmula:** `valor_pagado >= valor_cuota`

### Cuotas con Pago Parcial

Cuando una cuota tiene **pago parcial** (es decir, `0 < valor_pagado < valor_cuota`), aplican los mismos estados definidos anteriormente:
- La cuota puede estar **Programada**, **Pendiente** o **En Mora** según la relación entre la fecha actual y la fecha límite
- Solo pasa a **Pagada** cuando el valor pagado alcanza el 100% del valor de la cuota

---


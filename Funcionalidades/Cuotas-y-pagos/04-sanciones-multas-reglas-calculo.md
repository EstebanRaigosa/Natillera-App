# 04 — Sanciones y multas: reglas de cálculo

## Configuración origen

Tabla **`natilleras`**, campo JSON **`reglas_multas`** (puede venir como string; se parsea).

Estructura esperada:

```json
{
  "dias_gracia": 3,
  "sanciones": {
    "activa": true,
    "tipo": "simple" | "escalonada" | "diaria",
    "valorFijo": 5000,
    "valorPorDia": 1000,
    "niveles": [ { "cuotas": 1, "valor": 4000 }, { "cuotas": 2, "valor": 4500 } ],
    "interesesAdicionales": { "activo": true, "dias": 2, "valor": 500 }
  }
}
```

Claves alternativas aceptadas en código: `intereses_adicionales`, búsqueda por regex de claves con “interes” para compatibilidad.

## Flag `no_calcular_multa` (por cuota)

Si es verdadero:

- No se calculan ni muestran sanciones para esa cuota.
- En BD se pueden forzar `valor_multa`, `valor_multa_base`, `valor_multa_intereses` a **0**.
- En `registrarPago` la sanción a pagar es **0**.
- En `calcularSancionesTotales` esas cuotas se excluyen del cálculo; si estaban en mora con multa, se actualizan a 0.

**Quién puede togglear:** en la UI está pensado para un admin concreto (email `raigo.16@gmail.com`) vía `toggleNoCalcularMultaCuota`.

## Tipos de sanción

### 1. `simple`

- **`multa = valorFijo`** (o 0 si inactiva).

### 2. `escalonada`

- Niveles `{ cuotas, valor }`.
- **`calcularMulta` (por cantidad de cuotas en mora):** ordena niveles por `cuotas` descendente; elige el primer nivel donde `cantidadCuotasMora >= nivel.cuotas`. Si ninguno aplica y hay niveles, usa el de menor cantidad como fallback en un camino del código legado.
- **`obtenerValorSancionPorPosicion`:** ordena niveles por `cuotas` ascendente; encuentra el primer nivel con `posicion <= nivel.cuotas`; si la posición supera todos, usa el último nivel.

**Modelo por racha (importante):** La **base** (`valor_multa_base`) y el **`mora_orden`** se fijan **una vez** cuando la cuota entra en mora (o en `calcularSancionesTotales` / paso a mora). No se recalcula la base al pagar otras cuotas, para que el escalón (ej. 2.ª cuota en mora = monto mayor) no “baje” al quedar una sola cuota en mora.

- **`posicionEnRacha`:** índice 1-based ordenando por `fecha_limite` ascendente dentro del socio.
- Para escalonada en `calcularSancionesTotales`, la base usa **`mora_orden`** si ya existe; si no, **`posicionEnRacha`**.

### 3. `diaria`

- **`valorPorDia * días`**, donde los **días** dependen del **tramo** entre `fecha_inicio_mora` y el día anterior al inicio de mora de la **siguiente** cuota en mora del mismo socio (o hasta hoy si es la última).
- Fórmula de días en tramo: `max(0, floor((finTramo - inicioTramo) / msPorDia) + 1)`.
- **Intereses adicionales** (config `interesesAdicionales` en tipo diaria): si activo, `floor(diasEnMora / diasParaInteres) * valorInteres` (lógica en `calcularMultaDinamica`).

## Intereses adicionales (no diarios)

Para tipos **simple** y **escalonada**, además de la base:

- Se define un **tramo de días** por cuota en mora: desde **`fecha_inicio_mora`** (o calculada) hasta el día anterior al vencimiento de la **siguiente** cuota en mora (o hoy).
- **`interesesAdicionales = floor(diasEnTramo / interesesDias) * interesesValor`** si el bloque de intereses está activo.

En **`calcularSancionesTotales`** se persisten:

- `valor_multa` = base + intereses (totales).
- `valor_multa_base` (si es nueva asignación).
- `valor_multa_intereses` = parte de intereses.
- `mora_orden`, `fecha_inicio_mora` cuando corresponde.

## `obtenerFechaInicioMora` / primer día en mora

- Si hay **`fecha_vencimiento`:** primer día en mora = **día siguiente** a `fecha_vencimiento`.
- Si no: **`fecha_limite + dias_gracia + 1`** (calendario local).

## Cuotas excluidas del cálculo agregado

- Cuotas con `no_calcular_multa`: multas puestas a 0 en BD y en memoria.

## `calcularSancionesTotales(natilleraId, cuotasLista)`

1. Carga `reglas_multas` de `natilleras`.
2. Filtra cuotas en mora: `estado === 'mora'` **o** `calcularEstadoRealCuotaStore === 'mora'`.
3. Agrupa por `socio_natillera_id`, ordena por `fecha_limite`.
4. Aplica el modelo de base + intereses por tramos descrito arriba.
5. **Updates** en tabla **`cuotas`**.

## `actualizarEstadoMoraAutomatico` al pasar a mora

Cuando una cuota entra en mora y hay sanciones activas:

- **`mora_orden`:** para nuevas cuotas, `maxOrdenExistente + 1` por socio; en escalonada el valor de posición para límite usa `min(moraOrden, 4)` en un tramo del código (tope escalón 4).
- **`valor_multa`**, **`valor_multa_base`** (no en diaria), **`fecha_inicio_mora`**.

## Vista: `getSancionTotalCuota` / `getSancionCuota`

- **`getSancionTotalCuota`:** Si no hay sanciones activas o `no_calcular_multa` → 0. Si estado real es mora, prioriza **`sancionesDinamicas[cuota.id]`** (resultado de `calcularSancionesTotales` en memoria), si no **`valor_multa`** de BD (o base+intereses).
- **`getSancionCuota` (pendiente):** `max(0, sancionTotal - valor_pagado_sancion)`.

## Coherencia con `registrarPago`

El store recalcula sanción dinámica en mora con reglas análogas (incl. posición acumulativa si natillera es quincenal y socio mensual — suma dos escalones). El **orden de aplicación del dinero** al pagar está en el documento 06.

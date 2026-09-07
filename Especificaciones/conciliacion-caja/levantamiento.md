# Levantamiento de requerimientos — Conciliación de caja

| Campo | Valor |
|-------|-------|
| **Módulo** | Cuadre de caja (hoy «Totales generales») |
| **Estado** | Borrador — dos propuestas a decidir |
| **Versión** | 1.1 |
| **Fecha** | 2026-09-06 |
| **Ruta actual** | `natilleras/:id/cuadre-caja` (`src/router/index.js:143`) |
| **Archivo actual** | `src/views/cuadre/CuadreCaja.vue` (3.623 líneas) |
| **Doc de la vista actual** | `Funcionalidades/cuadre-caja-funcionamiento.md` (312 líneas) — leerla antes de reescribir, para no perder comportamiento |

---

## 1. Objetivo y cómo se mide

Que el administrador pueda responder en **menos de dos minutos** a la pregunta
«¿el dinero que dice el sistema es el que tengo de verdad?», por cada forma de pago, y —
cuando no cuadre — llegar rápido a la línea concreta que explica la diferencia.

Hoy esa pregunta se responde revisando totales acumulados desde el inicio de la natillera y una
lista larga, a mano y de memoria.

**Línea base:** no está medida. Antes de implementar hay que cronometrar una revisión real con el
administrador (§15, pregunta 7); sin ese número el objetivo de «dos minutos» no es verificable y
CA-01 no se puede dar por cumplido.

## 2. Diagnóstico de la vista actual

Lo que está bien y **hay que conservar**: el desglose por forma de pago, el detalle con todos los
conceptos (cuotas, sanciones, actividades, cuotas de préstamo, GMF, préstamos, premios), los
filtros por categoría / mes / forma de pago, y la **exportación a Excel que ya respeta los filtros
aplicados** (`exportarAExcel()`, `CuadreCaja.vue:1769`, opera sobre `detalleFiltrado`).

Lo que hace lenta la revisión:

| # | Problema | Evidencia |
|---|----------|-----------|
| D-01 | **El dato «cuánto hay en realidad» no se guarda en ningún sitio.** La vista solo calcula lo *esperado*. En el código ya existe el andamiaje —`efectivoContado` / `transferenciaContada` (`CuadreCaja.vue:1281-1282`) y `diferenciaEfectivo` / `diferenciaTransferencia` / `diferenciaTotal` (`1560-1562`)— pero **no está conectado al template ni persiste**. El subtítulo de la pantalla ya promete «Cuenta el dinero y contrasta con lo que debería haber» (`CuadreCaja.vue:20`) y la pantalla no lo permite. | Refs sin uso en el template; ninguna tabla ni columna de conteo en las 26 migraciones |
| D-02 | **Todo es acumulado desde el inicio de la natillera.** Los totales se calculan sobre `detalleItems` sin filtrar (`1401-1450`); el filtro de mes vive solo en `detalleFiltrado` (`1632-1636`). Cada revisión obliga a re-verificar meses ya dados por buenos. | No hay filtro de rango de fechas sobre los totales |
| D-03 | **No queda constancia de las revisiones.** No se puede saber si el mes pasado cuadraba, ni quién lo revisó, ni qué se explicó de una diferencia. La tabla `auditoria` registra cambios de movimientos, no revisiones de caja. | Sin historial de cortes |
| D-04 | **La vista mezcla tres responsabilidades:** consultar totales, **crear/editar/borrar** movimientos de dinero, y simular el cierre por socio. | Pestañas `totales` / `simulador` (`CuadreCaja.vue:32`, `44`), modal «Nuevo movimiento» (`707`, `1355`), borrado (`2673-2677`) |
| D-05 | **Clasificación por texto libre, en cinco sitios.** `movimientos_fondo` no tiene columna de concepto: solo `descripcion`, `destino_ingreso` y `origen_egreso`. Por eso se clasifica buscando cadenas: premios de rifa (`2366-2370`), liquidaciones por salida (`2390-2394`), recaudo de actividad liquidada (`2410-2414`), **el nombre del socio se extrae con un regex sobre la descripción** (`2401`), y si no hay premios en movimientos se **infieren de `actividades.gastos`** (`2381-2386`). Un cambio de redacción descuadra el total sin avisar. | `movimientos_fondo.Row` no tiene campo de concepto (`backups/database.types.ts:728-741`) |
| D-06 | **Sin saldo acumulado.** La lista muestra importes sueltos; no hay columna de saldo corrido, que es como se puntea un extracto. | `detallePaginado` hace `slice` en cliente sobre el arreglo completo (`1672-1676`) |
| D-07 | **Todo el cálculo ocurre en el navegador**, reconstruyendo el histórico completo en cada carga: `cargarDatos()` lanza **7 consultas** (`fetchNatillera` 2620, `movimientos_fondo` 2631, `prestamos` 2599, `socios_actividad` 2584, `plan_pagos_prestamo` 2609, `historial_pagos_cuota` 2651, `obtenerMisPermisos` 2637) y `buildDetalleItems()` las compone. Crece linealmente con la natillera. | `buildDetalleItems()` a partir de `2209` |
| D-08 | **El detalle no es «pago por pago», que es lo que se pidió.** Un mismo pago se parte en varias líneas: una por concepto —cuota (`2243`) y sanción (`2260`)— y **otra vez en dos si el pago fue mixto** (`2262-2268`, y lo mismo en cuotas de préstamo `2296-2297` y actividades `2322-2323`). No se puede puntear un pago contra su recibo. | `buildDetalleItems()` emite ítems por concepto y forma de pago, no por transacción |
| D-09 | **La fecha del movimiento no siempre es la fecha del dinero.** Cuando falta `fecha_pago` se cae a `updated_at` (`2228`, `2309`) y los préstamos usan `created_at` (`2345`). Un saldo corrido ordenado por esa fecha cambiaría de orden al editar una fila vieja. | Fuente de fecha inconsistente por tipo |
| D-10 | **`Math.max(0, …)` oculta saldos negativos.** El total esperado por forma de pago recorta el recaudo neto a cero antes de sumar los movimientos (`1519-1523`). Si en una forma de pago se entregó más de lo que entró, el esperado sale mal y la diferencia contra el conteo será falsa. | `totalEsperadoEfectivo` / `totalEsperadoTransferencia` |
| D-11 | **La fuente de verdad del recaudo no es la transacción sino el estado final de la cuota.** El detalle se arma desde `cuotas` (estado acumulado), no desde `historial_pagos_cuota` (una fila por operación de pago). Por eso dos abonos parciales a la misma cuota se ven como una sola línea. | `cuotasConPago` (`2223`) sale de `nat.cuotas` |

## 3. Qué hace la industria

Investigación sobre conciliación de caja y cierres de turno en POS y software contable:

- **Esperado vs. contado, siempre juntos.** El sistema calcula lo esperado (saldo inicial + entradas − salidas) y la persona registra lo contado; el sistema muestra la **diferencia**. Es el núcleo del cierre de turno de Loyverse y Square.
- **Cortes frecuentes y sellados.** Conciliar a diario o por turno mantiene el volumen de errores bajo y permite detectar la desviación mientras los movimientos aún se recuerdan. Cada cierre deja un punto de partida para el siguiente.
- **Saldo declarado, no conteo de caja.** En operaciones sin caja registradora, el «real» es una cifra por cada sitio donde vive el dinero: lo que hay en efectivo y el saldo de la cuenta. El valor está en registrarlo, no en desglosarlo.
- **Saldo corrido en el detalle.** El extracto bancario existe porque un saldo tras cada movimiento permite localizar una diferencia por bisección, sin revisar línea por línea.
- **Una línea = un movimiento de dinero.** Los extractos no parten una transacción en sus conceptos: muestran el importe que entró o salió y el desglose se abre aparte. Es la condición para que el saldo corrido signifique algo.
- **Jerarquía de tablero:** arriba la reconciliación de saldo (una cifra y su diferencia), en medio las partidas sin cuadrar, y el detalle disponible por navegación controlada, no todo a la vez.
- **Diferencias de tiempo vs. excepciones reales:** distinguir el desfase normal (una transferencia que aún no se refleja) de un descuadre verdadero evita perseguir falsas alarmas.
- **Umbral de tolerancia:** las diferencias por encima de cierto monto se marcan para investigar; el resto se registra y se sigue.

Fuentes en §16.

## 4. Inventario del modelo actual

Esta sección **no existía en la v1.0** y es la que determina el coste real de las dos propuestas.
Hay que cerrarla antes de decidir.

> **Aviso:** `backups/database.types.ts` está desactualizado — no incluye las columnas que añadieron
> las migraciones 019 y 021 (`pagos_prestamo.historial_pago_cuota_id`,
> `historial_pagos_cuota.detalle_actividades`, `detalle_cuotas_prestamo`). El esquema debe
> verificarse contra la base real antes de implementar.

### 4.1 `historial_pagos_cuota` ya es el libro de pagos del recaudo

Es una **fila por operación de pago** de cuota, con id propio y desglose por concepto
(`backups/database.types.ts:580-599`):

`id`, `cuota_id`, `fecha_pago`, `forma_pago`, `valor_total`, `valor_cuota`, `valor_sancion`,
`valor_actividades`, `valor_cuotas_prestamo`, `impuesto_4x1000`, `valor_pagado_cuota_total`,
`socio_nombre`, `natillera_nombre`, `anio`, `mes`, `quincena`, y desde la migración 019
`detalle_actividades` (JSONB, con `socio_actividad_id`) y `detalle_cuotas_prestamo` (JSONB).

Se inserta en `registrarPago()` (`src/stores/cuotas.js:2656-2672`) y los abonos a préstamo que
nacen de ese pago quedan enlazados por `pagos_prestamo.historial_pago_cuota_id`
(`migrations/019_eliminar_pago_cuota.sql:29-50`). Tiene RLS de SELECT, INSERT, DELETE (019) y
UPDATE (021).

**Consecuencia:** el «identificador estable por línea» que la v1.0 daba por inexistente **ya existe
para el recaudo de cuotas**, que es la mayor parte del volumen. Eso abarata la Propuesta B y
hace viable el «pago por pago» de D-08.

**Tres límites que hay que aceptar por escrito:**

1. **`forma_pago` es un solo texto** y en pago mixto vale `'mixto'`, sin desglose de cuánto fue en
   efectivo y cuánto en transferencia (`src/stores/cuotas.js:2644`). El reparto por forma de pago
   solo está en `cuotas.valor_pagado_efectivo` / `valor_pagado_transferencia`, que son
   **acumulados de la cuota**, no de la transacción. Para conciliar por forma de pago hay que
   **añadir dos columnas de desglose a `historial_pagos_cuota`** (ver §12).
2. **Cobertura histórica parcial.** Los pagos anteriores a la introducción de la tabla no dejaron
   fila; el propio store tiene una ruta aparte para ellos (`eliminarPagoDirectoCuota`,
   `src/stores/cuotas.js:5026-5034`). Hay que medir cuántos son (§15, pregunta 8).
3. **El insert es *best-effort* con un reintento** (`src/stores/cuotas.js:2670-2679`): si falla,
   el dinero queda en la cuota pero sin fila de transacción. Un libro basado solo en esta tabla
   perdería ese pago; el libro debe reconciliar contra `cuotas` y avisar de los huérfanos.

### 4.2 Mapa concepto → fuente → identificador

| Concepto en el detalle | Tabla real | Id estable | Forma de pago | Fecha del dinero |
|---|---|---|---|---|
| Cuota | `historial_pagos_cuota` (transacción) / `cuotas` (estado) | `historial_pagos_cuota.id` | `forma_pago` (`'mixto'` sin desglose) | `fecha_pago` |
| Sanción | **no tiene tabla propia** en este flujo: `cuotas.valor_pagado_sancion` / `valor_multa` (`2234`); la tabla `multas` existe pero solo se lee en `src/stores/natilleras.js:699` y no alimenta el detalle | `historial_pagos_cuota.id` (`valor_sancion`) | igual que la cuota | `fecha_pago` |
| Actividad (pagada con la cuota) | `socios_actividad`, enlazada por `historial_pagos_cuota.detalle_actividades[].socio_actividad_id` | `socios_actividad.id` | `valor_pagado_efectivo` / `_transferencia` | `fecha_pago` |
| Actividad (recaudo al liquidar) | `movimientos_fondo` tipo `entrada`, **detectada por texto** (`2410-2414`) | `movimientos_fondo.id` | `forma_pago` | `fecha` |
| Cuota de préstamo | `plan_pagos_prestamo` (la que usa el cuadre, `2609`). **Ojo:** coexiste `pagos_prestamo`, que es la que usan `Prestamos.vue`, `Cuotas.vue` y `stores/cuotas.js` | `plan_pagos_prestamo.id` | `valor_pagado_efectivo` / `_transferencia` | `fecha_pago` |
| Préstamo desembolsado | `prestamos` | `prestamos.id` | `medio_entrega` | `created_at` (D-09) |
| Utilidad por interés anticipado | `prestamos` — **misma fila que el préstamo** (`2350-2361`) | `prestamos.id` + discriminante | `medio_entrega` | `created_at` |
| GMF 4×1000 | `historial_pagos_cuota.impuesto_4x1000` | `historial_pagos_cuota.id` | transferencia | `fecha_pago` |
| Premio de rifa | `movimientos_fondo` tipo `salida` **por texto** (`2366-2370`), o fallback `actividades.gastos` (`2381-2386`) | `movimientos_fondo.id` o `actividades.id` | `forma_pago` / efectivo asumido en el fallback | `fecha` |
| Liquidación por salida | `movimientos_fondo` tipo `salida` **por texto** (`2390-2394`) | `movimientos_fondo.id` | `forma_pago` | `fecha` |
| Ingreso / egreso / traslado manual | `movimientos_fondo` | `movimientos_fondo.id` | `forma_pago` | `fecha` |

**Lo que este mapa deja claro:**

- Un `(tipo, id)` **no es único** hoy: el préstamo y su interés anticipado comparten fila, y las
  cuatro categorías que salen de `movimientos_fondo` se distinguen solo por texto. RF-10 tiene que
  resolverse **antes** o a la vez que cualquiera de las dos propuestas.
- `plan_pagos_prestamo` vs. `pagos_prestamo`: hay que decidir cuál es la fuente del libro. Son dos
  representaciones del mismo dinero y hoy el cuadre usa una y el resto de la app la otra.

## 5. Requisitos

### 5.1 Funcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | Mostrar, por cada forma de pago (efectivo, transferencia) y en total, el **saldo esperado** según el sistema. | Must |
| RF-02 | Permitir registrar el **saldo real** por forma de pago —una cifra: el efectivo que hay y el saldo de la cuenta— y mostrar la **diferencia** (sobrante / faltante) con signo y color. | Must |
| RF-03 | Mostrar el **saldo acumulado** en el libro, **siempre referido a una forma de pago concreta**, para acotar dónde aparece una diferencia. | Must |
| RF-04 | Ver el detalle **agrupado por evento de pago**: una línea por movimiento de dinero real, con el desglose de conceptos (cuota, sanción, actividad, cuota de préstamo, GMF) **expandible dentro de la línea**. Resuelve D-08 y es la petición literal del usuario. | Must |
| RF-05 | Cubrir todos los conceptos del mapa de §4.2, incluidos préstamo desembolsado, interés anticipado, premio de rifa, liquidación por salida e ingreso/egreso manual. | Must |
| RF-06 | Filtrar el libro por **rango de fechas**, forma de pago, concepto y socio; y buscar por texto. | Must |
| RF-07 | **Sacar los movimientos manuales (ingresos, egresos, traslados) a una vista propia** (alcance en §13.1). Desde conciliación solo se consultan, no se crean ni se editan. | Must |
| RF-08 | **Sacar el simulador de cierre** de esta vista (destino en §13.2): es una proyección de reparto por socio, no una conciliación. | Must |
| RF-09 | **Conservar** la exportación a Excel de lo que se ve en pantalla con los filtros aplicados. Ya existe (`CuadreCaja.vue:1769`); no debe perderse al reescribir, y debe incluir la columna de saldo corrido. | Must |
| RF-10 | Dejar registro de quién revisó, cuándo, y qué nota escribió sobre una diferencia. | Must |
| RF-11 | Clasificar los conceptos por **campo estructurado**, no por texto de la descripción: añadir `concepto` a `movimientos_fondo` y migrar los datos existentes con las heurísticas actuales de D-05 como último uso. | Must |
| RF-12 | Corregir el cálculo del esperado quitando el `Math.max(0, …)` de D-10, de modo que un saldo negativo por forma de pago se muestre como negativo y no como cero. | Must |
| RF-13 | Definir una **fecha del dinero** única y estable por línea, y mostrar en la interfaz cuándo es una fecha inferida (D-09). | Should |
| RF-14 | Señalar los pagos que están en `cuotas` pero **no tienen fila de transacción** (§4.1, límites 2 y 3), para que no desaparezcan del libro. | Should |

### 5.2 No funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Funciona en iPhone/Safari sin romper Android (`CLAUDE.md` §1). Registro del saldo real cómodo con una mano. |
| RNF-02 | Área táctil ≥ 44×44 px con `touch-action: manipulation`; inputs numéricos con `font-size` ≥ 16 px (evita el zoom de iOS). |
| RNF-03 | Los modales usan `ModalWrapper` con `useBodyScrollLock`, y **`useNatiscroll`** (velo + «Desliza para ver más») en cualquier cuerpo scrolleable — obligatorio por la skill `natillerapp-modals`. |
| RNF-04 | Cualquier elemento anclado con `fixed bottom-0` usa **`useTapadoInferior`** además de `env(safe-area-inset-bottom)`: la barra de Safari no es safe-area (`docs/compatibilidad-ios-safari.md` §4.1). |
| RNF-05 | Alturas full-screen con `100dvh` (fallback `100vh`) y `-webkit-fill-available`. |
| RNF-06 | La pantalla principal carga en < 2 s con 2 años de historia. **El saldo esperado y el saldo corrido se calculan en base de datos** (vista o RPC con función de ventana), no en el navegador; el libro se pagina en servidor. Esto sustituye el cálculo en cliente de D-07 y es coste obligatorio de ambas propuestas. |
| RNF-07 | Ninguna acción de esta vista modifica saldos: es de lectura, salvo el registro del corte (RF-02) y su nota (RF-10). |
| RNF-08 | Toda tabla nueva lleva RLS con el mismo criterio que las migraciones 007/019/021 (superusuario o admin de la natillera). |

### 5.3 Criterios de aceptación

| ID | Sobre | Criterio |
|----|-------|----------|
| CA-01 | RF-01, RF-02 | Con la línea base cronometrada de §1, una revisión rutinaria de un periodo de una semana se completa en **≤ 2 minutos** y en **≤ 3 toques** desde la pantalla de la natillera. |
| CA-02 | RF-01 | Para una natillera de prueba con movimientos conocidos, el esperado por forma de pago coincide **al peso** con el calculado a mano; incluido un caso con saldo negativo en una forma de pago (CA de RF-12). |
| CA-03 | RF-02 | Al escribir el saldo real, la diferencia aparece con signo y color sin recargar; si supera el umbral, **no** se puede cerrar el corte sin nota. |
| CA-04 | RF-03 | El saldo de la última línea del libro es igual al esperado de la forma de pago seleccionada. Con «Todas» seleccionado, la etiqueta de la columna dice explícitamente que es el saldo combinado. |
| CA-05 | RF-04 | Un pago mixto de cuota + sanción + actividad aparece como **una sola línea** con el importe total; al expandirla se ven los cuatro conceptos y las dos formas de pago; la suma de los conceptos es igual al importe de la línea. |
| CA-06 | RF-05 | Cada uno de los once conceptos de §4.2 tiene al menos un caso de prueba con su línea en el libro y su efecto correcto en el saldo (signo incluido). |
| CA-07 | RF-06 | Los filtros son acumulables y el saldo corrido se recalcula respetando el rango de fechas, tomando como saldo inicial el del corte anterior. |
| CA-08 | RF-07 | Desde conciliación no existe ningún control que cree, edite o borre un movimiento; la vista nueva sí los tiene y su auditoría sigue registrándose. |
| CA-09 | RF-09 | El Excel exportado contiene exactamente las líneas visibles con los filtros aplicados, más la columna de saldo. |
| CA-10 | RF-10 | El historial de cortes muestra fecha, autor, esperado, real, diferencia y nota, y es consultable sin permisos de escritura. |
| CA-11 | RF-11 | Ninguna función de la vista lee `descripcion` para clasificar. Buscar `includes('premio` o `includes('liquidación` en el código nuevo no devuelve resultados. |
| CA-12 | RNF-06 | Con un juego de datos de 2 años, la pantalla principal responde en < 2 s y el detalle pide una página a la vez (verificable en la pestaña de red). |
| CA-13 | RNF-01..05 | Revisión contra el checklist de `CLAUDE.md` §1 documentada en el PR, indicando qué se comprobó por código y qué queda pendiente de dispositivo real. |

## 6. Roles y permisos

El código ya distingue tres niveles y la vista nueva debe respetarlos:

| Rol | Cómo se determina hoy | Conciliación | Cerrar corte | Vista de movimientos |
|---|---|---|---|---|
| Superusuario | email fijo `raigo.16@gmail.com` (`CuadreCaja.vue:1380-1384`) | Ver | Sí | Crear / editar / borrar |
| Admin de la natillera | `natillera.admin_id === user.id` (`1386-1389`) | Ver | Sí | Crear / editar / borrar |
| Colaborador con `gestionar_cuotas` | `misPermisos.permisos.gestionar_cuotas` (`1391-1395`) | Ver | **Por decidir** (§15, pregunta 1) | **Por decidir** |
| Socio sin permisos | — | No | No | No |

## 7. Estados de pantalla

| Estado | Comportamiento esperado |
|---|---|
| Cargando | `LoadingScreen` como hoy (`CuadreCaja.vue:57-60`), con texto propio de la conciliación |
| Sin movimientos en el periodo | Mensaje que ofrezca ampliar el rango o cerrar el primer corte; **no** una tabla vacía |
| Sin ningún corte cerrado | La vista funciona sobre el histórico completo y ofrece «cerrar el primer corte» (mitigación del riesgo de adopción de la Propuesta A) |
| Error de carga | Mensaje con reintento; nunca un total a cero que parezca real |
| Sin permisos | Redirección al detalle de la natillera con aviso |
| Pagos huérfanos detectados (RF-14) | Aviso en la cabecera con enlace a la lista de esos pagos |

## 8. Propuesta A — Corte de saldo + libro del periodo

**Idea central:** la conciliación deja de ser «revisar todo desde el principio» y pasa a ser
**revisar los movimientos posteriores al último corte que ya di por bueno**.

La vista es un **libro de movimientos con saldo corrido**, acotado al periodo abierto y a una forma
de pago. Encima, el corte: lo que el sistema dice que debería haber, frente a lo que hay de verdad.
El «real» son dos cifras —el efectivo que se tiene y el saldo de la cuenta—, no un conteo
desglosado por denominaciones.

Al cerrar un corte, ese saldo queda sellado y se convierte en el saldo inicial del siguiente.

### Pantalla

```
┌────────────────────────────────────────────────────────────────┐
│  Periodo abierto: 1 sep → hoy   ·   último corte: 31 ago ✓     │
│                                                                │
│                    Efectivo        Cuenta          Total       │
│  Saldo al inicio   $  180.000    $  900.000    $1.080.000      │
│  Movimientos       $  240.000    $  280.000    $  520.000      │
│  ─────────────────────────────────────────────────────────     │
│  Debería haber     $  420.000    $1.180.000    $1.600.000      │
│  Hay de verdad     [        ]    [         ]                   │
├────────────────────────────────────────────────────────────────┤
│  LIBRO DEL PERIODO      Forma de pago: [ Efectivo ▾ ]  [Excel] │
│  Fecha   Concepto              Socio      Monto   Saldo efvo   │
│  06 sep  Pago de cuota ▸       Ana P.    +65.000    420.000    │
│  05 sep  Egreso · papelería      —       −20.000    355.000    │
│  04 sep  Cuota préstamo #2     Luis M.   +85.000    375.000    │
│  02 sep  Premio rifa Sept.       —       −20.000    290.000    │
└────────────────────────────────────────────────────────────────┘
```

Dos cosas del mockup son requisito, no decoración:

- **El saldo corrido pertenece a una forma de pago.** El selector es parte del libro y la columna
  se etiqueta con la forma elegida (`Saldo efvo`). Mezclar efectivo y transferencia en una sola
  serie —el error de la v1.0— haría inútil el saldo para conciliar por forma de pago (CA-04).
- **Una línea = un pago.** «Pago de cuota ▸» de Ana son $65.000 (cuota $60.000 + sanción $5.000)
  en **una** línea expandible, no dos (RF-04, CA-05).

Cerrar el corte son dos campos y un botón. Si la diferencia supera el umbral, pide una nota.

### Qué resuelve

- **D-01**: el saldo real entra al sistema, como cifra por forma de pago, y se conecta el
  andamiaje que ya está escrito y muerto.
- **D-02**: cada revisión abarca solo el periodo desde el último corte.
- **D-03**: el historial de cortes responde «¿cuándo dejó de cuadrar?» de un vistazo.
- **D-06**: el saldo corrido permite localizar la diferencia por bisección — se mira el saldo a
  mitad del periodo y se sabe en qué mitad está el problema, sin revisar línea por línea.
- **D-08**: agrupando por transacción (`historial_pagos_cuota.id` y `movimientos_fondo.id`).
- **D-10**: al calcularse en SQL sobre el periodo, desaparece el recorte a cero.

### Coste y riesgos

- **Esfuerzo:** medio-alto. Una tabla de cortes, un formulario de dos campos, el historial, **más
  el trabajo compartido con B**: la vista/RPC con saldo corrido en SQL (RNF-06), el `concepto`
  estructurado en `movimientos_fondo` (RF-11) y el desglose por forma de pago en
  `historial_pagos_cuota` (§4.1, límite 1).
- **Riesgo:** exige el hábito de cerrar cortes. Mitigación: mientras no haya ninguno, la vista
  funciona sobre el histórico completo y ofrece «cerrar el primero» (§7).
- **Cuidado:** los importes del corte se **congelan** al cerrar. Si más tarde se elimina un pago
  anterior a esa fecha —flujo que existe, `eliminarPagoHistorial()`— el corte sellado no se
  recalcula y **debe advertirlo**, o el historial dejaría de ser fiable (§15, pregunta 5).

## 9. Propuesta B — Libro continuo con punteo

**Idea central:** sin cortes. Un **extracto** completo y filtrable por fechas, y la conciliación se
hace **punteando línea a línea** lo que ya se verificó, como el punteo bancario clásico.

```
┌─────────────────────────────────────────────────────────────────────┐
│ Forma de pago: [ Efectivo ▾ ]                                       │
│ Saldo sistema $420.000 │ Punteado $400.000 │ Sin puntear $20.000    │
├──────┬──────────────────────┬────────┬──────────┬────────────┬──────┤
│ Fecha│ Concepto             │ Socio  │   Monto  │ Saldo efvo │  ✓   │
├──────┼──────────────────────┼────────┼──────────┼────────────┼──────┤
│ 06sep│ Pago de cuota ▸      │ Ana P. │  +65.000 │   420.000  │  ☑   │
│ 05sep│ Egreso: papelería    │   —    │  −20.000 │   355.000  │  ☐   │
│ 04sep│ Cuota préstamo #2    │ Luis M.│  +85.000 │   375.000  │  ☑   │
└──────┴──────────────────────┴────────┴──────────┴────────────┴──────┘
```

El encabezado es la conciliación: **saldo del sistema**, **suma de lo punteado** y **suma de lo que
falta por puntear** — las tres cifras referidas a la forma de pago seleccionada, y las dos últimas
sumando siempre el total (420.000 = 400.000 + 20.000).

### Qué resuelve

- **D-06** igual que A, por el saldo corrido.
- **D-08** igual que A: sin línea = pago, el punteo no se puede casar con un recibo.
- **D-01 solo de forma indirecta:** el punteo verifica línea a línea, pero **nunca se registra
  cuánto dinero hay en total**. Responde «¿dónde está la diferencia?», no «¿cuadra hoy?».
- Es lo mejor cuando **ya se sabe que hay un descuadre** y toca encontrar la línea culpable.

### Coste y riesgos

Aquí es donde cambia respecto a la v1.0. El id estable **ya existe para el recaudo de cuotas**
(§4.1), así que B es más barata de lo que decía la versión anterior. Lo que sigue faltando:

- **Los cuatro conceptos que hoy salen por texto de `movimientos_fondo`** (premio, liquidación,
  recaudo de actividad liquidada, movimiento manual) no se pueden distinguir entre sí sin RF-11.
- **Préstamo e interés anticipado comparten fila** (`prestamos.id`): hacen falta dos tipos
  distintos apuntando al mismo id.
- **Decidir entre `plan_pagos_prestamo` y `pagos_prestamo`** como fuente de las cuotas de préstamo.
- **`(referencia_tipo, referencia_id)` debe ser único**, lo que solo se cumple si el libro agrupa
  por transacción (RF-04) en lugar de por concepto y forma de pago.
- **Riesgo de uso:** con volumen, puntear una a una cansa; necesita «puntear todo lo visible».
- **Límite estructural:** sin saldo real registrado, no hay respuesta a «¿cuadra hoy?».

## 10. Comparativa

| Criterio | A — Corte de saldo + libro | B — Libro continuo con punteo |
|---|---|---|
| Responde «¿cuadra hoy?» | **Sí, en un paso** | No: el saldo real nunca se registra |
| Responde «¿dónde está la diferencia?» | Sí, por bisección del saldo corrido | Sí, por bisección **y** por punteo |
| Tiempo por revisión rutinaria | **~1 min** | Crece con el volumen |
| Deja historial auditable | **Sí, cortes sellados** | Parcial — marcas sueltas |
| Evita re-revisar el pasado | **Sí, por diseño** | No |
| Trabajo compartido obligatorio | Saldo en SQL (RNF-06) + `concepto` estructurado (RF-11) + línea = pago (RF-04) | El mismo |
| Trabajo propio | Tabla de cortes + formulario + historial | Tabla de marcas + tipos únicos por concepto |
| Esfuerzo total | Medio-alto | Medio-alto |
| Riesgo de adopción | Requiere cerrar cortes | Requiere paciencia al puntear |

## 11. Recomendación y orden de entrega

**Propuesta A**, por dos razones:

1. Ataca la causa real de que hoy demore: no falta información, es que **cada revisión empieza
   desde cero** y no hay dónde anotar el resultado. El corte convierte una revisión del histórico
   completo en una de unos pocos días.
2. Ya incorpora lo mejor de B —el **saldo corrido** en el detalle— que es lo que de verdad permite
   localizar una diferencia. Lo único que deja fuera es el punteo por línea, que es la parte más
   tediosa de usar y la que menos aporta cuando ya hay saldo corrido.

El punteo de B queda como candidato posterior, y ahora es más barato de añadir de lo que parecía:
con RF-04 y RF-11 hechos, la tabla de marcas es un incremento pequeño sobre A.

Orden sugerido, cada punto entregable por separado:

1. **Base estructural:** `concepto` en `movimientos_fondo` (RF-11), desglose por forma de pago en
   `historial_pagos_cuota`, y la vista/RPC de libro con saldo corrido en SQL (RNF-06). Sin ruido
   visible para el usuario, pero es lo que hace posible todo lo demás.
2. **Libro del periodo:** una línea por pago con desglose expandible (RF-04), saldo corrido por
   forma de pago (RF-03), filtros y Excel (RF-06, RF-09), y separar movimientos (RF-07) y
   simulador (RF-08) a sus vistas. Ya mejora la revisión sin introducir conceptos nuevos.
3. **Cortes de saldo:** los dos campos, el sellado, el umbral y el historial (RF-02, RF-10). Aquí
   es donde la revisión rutinaria baja a un minuto.

## 12. Modelo de datos

Migración siguiente libre: **026** (`migrations/` llega hasta 025, y hay dos archivos numerados
021). Verificar el esquema real antes de escribirla — `backups/database.types.ts` está
desactualizado (§4).

```sql
-- migrations/026_conciliacion_caja.sql

-- 1. Clasificación estructurada de movimientos (RF-11, resuelve D-05)
ALTER TABLE public.movimientos_fondo
  ADD COLUMN IF NOT EXISTS concepto TEXT;

-- Valores: 'ingreso_manual' | 'egreso_manual' | 'traslado' | 'premio_rifa'
--          | 'liquidacion_salida' | 'recaudo_actividad_liquidada'
-- Backfill: aplicar una vez las heurísticas de texto de D-05 y dejarlas de usar.

-- 2. Desglose por forma de pago en la transacción de pago (§4.1, límite 1)
ALTER TABLE public.historial_pagos_cuota
  ADD COLUMN IF NOT EXISTS valor_efectivo NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS valor_transferencia NUMERIC(14,2);

-- 3. Cortes de caja (Propuesta A)
CREATE TABLE IF NOT EXISTS public.cortes_caja (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  natillera_id              UUID NOT NULL REFERENCES public.natilleras(id) ON DELETE CASCADE,
  fecha_corte               DATE NOT NULL,
  estado                    TEXT NOT NULL DEFAULT 'cerrado'
                              CHECK (estado IN ('cerrado', 'anulado')),
  -- Congelados al cerrar: el corte no cambia si cambia el pasado
  esperado_efectivo         NUMERIC(14,2) NOT NULL,
  real_efectivo             NUMERIC(14,2) NOT NULL,
  esperado_transferencia    NUMERIC(14,2) NOT NULL,
  real_transferencia        NUMERIC(14,2) NOT NULL,
  nota                      TEXT,
  creado_por                UUID NOT NULL REFERENCES auth.users(id),
  creado_en                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  anulado_por               UUID REFERENCES auth.users(id),
  anulado_en                TIMESTAMPTZ,
  motivo_anulacion          TEXT,
  CONSTRAINT cortes_caja_un_corte_por_fecha
    UNIQUE (natillera_id, fecha_corte)
);

CREATE INDEX IF NOT EXISTS idx_cortes_caja_natillera_fecha
  ON public.cortes_caja (natillera_id, fecha_corte DESC);

ALTER TABLE public.cortes_caja ENABLE ROW LEVEL SECURITY;

-- Mismo criterio que las migraciones 019 y 021: superusuario o admin de la natillera.
CREATE POLICY "cortes_caja_select_admin_or_super"
ON public.cortes_caja FOR SELECT
USING (
  public.es_superusuario()
  OR EXISTS (
    SELECT 1 FROM public.natilleras n
    WHERE n.id = cortes_caja.natillera_id AND n.admin_id = auth.uid()
  )
);
-- Repetir el mismo USING/WITH CHECK para INSERT y UPDATE.
-- Sin política de DELETE: un corte no se borra, se anula (estado = 'anulado').
```

Un campo nuevo en `natilleras`: `umbral_diferencia_corte NUMERIC(14,2) DEFAULT 0`
(por defecto cualquier diferencia pide nota).

Si más adelante se añade el punteo de la Propuesta B:

```sql
CREATE TABLE public.conciliacion_marcas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  natillera_id    UUID NOT NULL REFERENCES public.natilleras(id) ON DELETE CASCADE,
  referencia_tipo TEXT NOT NULL CHECK (referencia_tipo IN (
                    'pago_cuota',            -- historial_pagos_cuota.id
                    'cuota_prestamo',        -- fuente por decidir (§4.2)
                    'actividad',             -- socios_actividad.id
                    'prestamo',              -- prestamos.id
                    'interes_anticipado',    -- prestamos.id (misma fila, otro tipo)
                    'movimiento'             -- movimientos_fondo.id, ya con concepto propio
                  )),
  referencia_id   UUID NOT NULL,
  verificado_por  UUID NOT NULL REFERENCES auth.users(id),
  verificado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
  nota            TEXT,
  CONSTRAINT conciliacion_marcas_una_por_linea UNIQUE (referencia_tipo, referencia_id)
);
-- RLS con el mismo criterio que cortes_caja.
```

La unicidad `(referencia_tipo, referencia_id)` **solo se sostiene si RF-04 está hecho**: mientras
el detalle parta un pago en varias líneas, el mismo id aparecería más de una vez.

## 13. Alcance de lo que sale de esta vista

### 13.1 Vista de movimientos manuales (RF-07)

> Desarrollada en `Especificaciones/movimientos/levantamiento.md`. Lo que sigue es el resumen del
> alcance; el detalle, los criterios de aceptación y el modelo de datos están allí.

No basta con «sacarlo de aquí». La vista nueva debe:

- Listar los movimientos de `movimientos_fondo` con filtros de fecha, tipo, forma de pago y
  concepto (el nuevo campo de RF-11).
- Permitir **crear, editar y borrar** ingresos, egresos y traslados, con los mismos permisos que
  hoy (§6) y **conservando la auditoría** que ya se registra.
- Conservar el agrupado de traslados en una sola tarjeta, que hoy se detecta por patrón de
  fecha/monto/forma sin depender de la descripción (`CuadreCaja.vue:1570-1590`).
- Aplicar la skill de modales para el formulario (RNF-03).
- Ruta y ubicación en el menú: §15, pregunta 6.

### 13.2 Simulador de cierre (RF-08)

Es una proyección de reparto por socio a una fecha de corte. Hoy vive solo en esta vista (la
palabra `simulador` no aparece en ningún otro archivo de `src/`). Destino a decidir entre
`NatilleraCierre.vue` —que ya existe (`src/views/natilleras/NatilleraCierre.vue`, ruta en
`src/router/index.js:107-111`) y es donde el usuario esperaría una proyección de cierre— o una
vista propia. Requisito mínimo: no perder funcionalidad al mover.

## 14. Fuera de alcance

- Cierre contable definitivo de la natillera (ya existe en `NatilleraCierre.vue`).
- Conciliación automática contra extracto bancario real (no hay integración bancaria).
- Multi-caja o cajas por colaborador: se asume **una caja por natillera**.
- **Conteo por denominaciones** (billetes y monedas). El dinero de una natillera no vive en una
  caja registradora: el «real» se declara como una cifra por forma de pago, no se desglosa.
- Corregir pagos desde esta vista: se navega al módulo correspondiente.
- Reconstruir las transacciones históricas que nunca dejaron fila en `historial_pagos_cuota`
  (§4.1, límite 2). Se señalan (RF-14), no se inventan.

## 15. Preguntas abiertas

| # | Pregunta | Estado |
|---|----------|--------|
| 1 | ¿Quién puede sellar un corte: solo admin y superusuario, o también colaborador con `gestionar_cuotas`? | Abierta |
| 2 | ¿Un corte anulado se puede volver a cerrar con otras cifras, o queda la fecha bloqueada? | Abierta |
| 3 | ¿Umbral de tolerancia fijo (p. ej. $1.000) o configurable por natillera? | Abierta |
| 4 | ¿El saldo real se declara solo al cerrar un corte, o se puede guardar un borrador en cualquier momento? | Abierta |
| 5 | ¿Qué pasa con un corte sellado si después se elimina un pago anterior a su fecha? ¿Aviso, marca de «desactualizado», o bloqueo del borrado? | Abierta |
| 6 | ¿La vista nueva de movimientos entra en el menú lateral o cuelga de la natillera? | Abierta |
| 7 | **¿Cuánto tarda hoy una revisión?** Sin cronometrarla, CA-01 no es verificable. | Abierta |
| 8 | **¿Qué porcentaje de los pagos históricos tiene fila en `historial_pagos_cuota`?** Determina si el libro puede basarse en esa tabla o necesita reconciliar con `cuotas`. | Abierta |
| 9 | ¿Fuente de las cuotas de préstamo: `plan_pagos_prestamo` (la del cuadre) o `pagos_prestamo` (la del resto de la app)? | Abierta |
| 10 | El fallback que infiere premios desde `actividades.gastos` (`2381-2386`), ¿sigue haciendo falta tras RF-11, o hay que crear el movimiento de fondo al liquidar? | Abierta |

## 16. Fuentes

- [Mastering Cash Reconciliation: Process, Best Practices, and Automation Tips — AccountingDepartment](https://www.accountingdepartment.com/blog/mastering-cash-reconciliation-process-best-practices-and-automation-tips)
- [Cash Reconciliation Defined & Its Importance — NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/cash-reconciliation.shtml)
- [Cash Handling Best Practices Every Retail Business Should Follow — apg](https://apgsolutions.com/cash-handling-best-practices/)
- [Retail Cash Handling Procedures: The 2026 SOP Playbook — Xenia](https://www.xenia.team/daily-ops-checklists/cash-handling-procedures-retail)
- [Shift Management in Loyverse POS](https://help.loyverse.com/help/shift-management-loyverse-pos)
- [Cash Drawer Calculator — Denomination Calculator](https://www.denominationcalculator.com/cash-drawer-calculator/)
- [Bank Reconciliation Dashboard — Metabase](https://www.metabase.com/dashboards/bank-reconciliation)
- [Daily Reconciliation: A Step-by-Step Guide — BAMS](https://www.bams.com/blog/daily-reconciliation-a-step-by-step-guide/)
- [Behind the Scenes: Designing Our New UI — Modern Treasury](https://www.moderntreasury.com/journal/behind-the-scenes-designing-our-new-ui)

## 17. Historial de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-09-06 | Levantamiento inicial con dos propuestas |
| 1.1 | 2026-09-06 | Revisión contra el código. Ruta corregida a `cuadre-caja`. Nuevo §4 con el inventario del modelo: `historial_pagos_cuota` ya es el libro de pagos, con sus tres límites, y mapa concepto → tabla → id. Nuevos D-08 a D-11 (pago partido, fecha inestable, `Math.max(0,…)`, fuente de verdad). RF-04 reescrito como «una línea = un pago» —la petición literal del usuario—. Nuevos RF-12 a RF-14, §5.3 criterios de aceptación, §6 roles, §7 estados de pantalla, §13 alcance de lo que sale de la vista. RNF-06 resuelve la contradicción entre paginar en servidor y calcular saldos. Excel reclasificado como «conservar», no como nuevo. Mockups corregidos: saldo corrido por forma de pago y cifras de punteo coherentes. DDL completo con tipos, FK, unicidad, estado y RLS. Propuesta B recosteada. |

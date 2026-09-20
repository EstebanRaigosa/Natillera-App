# Levantamiento de requerimientos — Vista de movimientos (ingresos y egresos)

| Campo | Valor |
|-------|-------|
| **Módulo** | Movimientos de fondo (hoy embebido en «Cuadre de caja») |
| **Estado** | Borrador — pendiente de decidir §12 |
| **Versión** | 1.0 |
| **Fecha** | 2026-09-06 |
| **Origen** | RF-07 y §13.1 de `Especificaciones/conciliacion-caja/levantamiento.md` |
| **Ruta propuesta** | `natilleras/:id/movimientos` |
| **Código actual** | `src/views/cuadre/CuadreCaja.vue` (modal en 705-920, CRUD en 2673-3608) |
| **Tabla** | `public.movimientos_fondo` |

---

## 1. Objetivo y cómo se mide

Que quien administra la natillera pueda **registrar en menos de 30 segundos** que entró o salió
dinero que no viene de una cuota, un préstamo ni una actividad —el arriendo del salón, una
donación, el traslado del efectivo al banco— y que ese registro **aparezca de inmediato en la
conciliación afectando el saldo esperado de su forma de pago**, sin que nadie tenga que acordarse
de cuadrarlo a mano.

Hoy eso ya ocurre a medias: el registro existe y afecta los valores, pero vive escondido dentro de
una pantalla de 3.623 líneas que hace otras tres cosas, y la mitad de su significado se deduce
leyendo el texto que alguien escribió en la descripción.

**Línea base a medir antes de implementar** (§12, pregunta 7): cuántos toques y cuánto tarda hoy
registrar un egreso desde que se abre la app.

## 2. Punto de partida: lo que ya funciona

Conviene decirlo primero, porque cambia el alcance: **la petición «debe quedar registrado como un
movimiento en la conciliación y afectar valores» ya está cumplida** para los ingresos, egresos y
traslados manuales. `useLibroCaja.js` los lee (576-581), los convierte en apuntes del libro
(389-450) y `ConciliacionCaja.vue` los suma al saldo esperado por forma de pago (725-726, 761-765).

Lo que falta no es la conexión, sino que el registro sea **fiable, visible y propio**. Este
documento trata de eso.

### 2.1 El modelo real

Verificado contra la base de producción, no contra `backups/database.types.ts`, que está
desactualizado:

| Columna | Tipo | Restricción real en BD |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `natillera_id` | uuid | NOT NULL, FK |
| `tipo` | varchar | NOT NULL, `CHECK IN ('entrada','salida')` |
| `monto` | numeric | NOT NULL, `CHECK (monto > 0)` |
| `forma_pago` | varchar | NOT NULL, `CHECK IN ('efectivo','transferencia')` |
| `descripcion` | text | nullable — **sin restricción, y de ella depende la clasificación** |
| `fecha` | date | NOT NULL, `DEFAULT CURRENT_DATE` |
| `origen_egreso` | text | nullable, `CHECK IN ('recaudado','utilidades')` |
| `destino_ingreso` | text | nullable, `CHECK IN ('recaudado','utilidades')` |
| `created_at` / `updated_at` | timestamptz | `DEFAULT now()` |

**No existe columna de concepto.** RLS está activo con cuatro políticas (SELECT, INSERT, UPDATE,
DELETE) atadas al permiso `gestionar_cuotas`.

Dos observaciones que condicionan todo el diseño:

- **`tipo` solo distingue dirección, no naturaleza.** Un premio de rifa, una liquidación por salida
  y un egreso manual son los tres `'salida'`. Lo que los diferencia es el texto.
- **Un traslado no existe como entidad.** Son dos filas —una `'salida'` en la forma origen y una
  `'entrada'` en la destino— sin ningún campo que las una.

### 2.2 Volumen actual

Medido en producción (30 filas):

| Origen | Filas | Cómo se identifica hoy |
|---|---|---|
| Manuales (ingreso / egreso / traslado) | 20 | Por descarte, tras aplicar las tres heurísticas |
| Premio de rifa | 6 | Texto: `premio rifa` / `rifa liquidada` |
| Recaudo de actividad liquidada | 2 | Texto: `recaudo actividad liquidada` |
| Liquidación por salida de socio | 2 | Texto: `liquidación por salida` |

De las 20 manuales, **14 se emparejan como 7 traslados** y 6 son ingresos o egresos sueltos. Hoy no
hay ningún emparejamiento ambiguo, pero eso es suerte del volumen, no una garantía del diseño
(ver D-02).

### 2.3 Quién escribe en la tabla

La vista nueva no es el único autor, y eso cambia qué puede permitirse editar:

| Archivo | Operación | Qué crea |
|---|---|---|
| `CuadreCaja.vue` (3051-3588) | insert / update / delete | Ingresos, egresos y traslados manuales |
| `Actividades.vue` (5065-5075) | insert | Premio al liquidar una rifa (`salida`) |
| `Actividades.vue` (6016-6024, 6053-6061) | insert | Recaudo al crear una actividad ya liquidada (`entrada`) |
| `Actividades.vue` (4753-4762, 4797-4809) | update / delete | Cambio de forma de pago del premio; reversión |
| `Socios.vue` (5000-5007) | insert | Liquidación por salida al desactivar un socio |
| `Socios.vue` (4841-4848) | insert | Reversión al reactivar |

## 3. Diagnóstico

| # | Problema | Evidencia |
|---|----------|-----------|
| D-01 | **La naturaleza del movimiento se deduce leyendo texto libre.** Tres heurísticas sobre `descripcion` deciden si una salida es un premio, una liquidación o un egreso normal; el nombre del socio se saca con un regex (`/^Liquidación por salida\s*[-–]\s*/i`). Cambiar una redacción reclasifica dinero sin avisar. | `CuadreCaja.vue:2363-2435`, duplicado en `useLibroCaja.js:101-127` y `323-387` |
| D-02 | **El traslado se reconstruye adivinando.** Se emparejan dos filas por coincidencia de natillera, fecha, monto y tipos/formas opuestos. Dos traslados del mismo importe el mismo día en sentidos contrarios se pueden cruzar entre sí, y el resultado depende del orden de la lista. | `esParTraslado()` `CuadreCaja.vue:1570-1578`; misma lógica repetida en `useLibroCaja.js:395-420` y en `buscarMovimientoRelacionadoTransferencia()` `2898-2935` |
| D-03 | **La lógica está triplicada.** El mismo emparejamiento y la misma clasificación por texto viven en el cuadre, en el libro de conciliación y en la búsqueda del par al editar. Arreglar un caso obliga a tocar tres sitios y hoy ya divergen. | Tres implementaciones del mismo algoritmo |
| D-04 | **No hay vista propia.** Registrar un egreso obliga a entrar a «Cuadre de caja», una pantalla que además calcula totales y simula el cierre por socio. La acción más frecuente está enterrada en la herramienta menos relacionada. | D-04 del levantamiento de conciliación |
| D-05 | **Los movimientos automáticos no dejan rastro en auditoría.** Solo se auditan los creados desde `CuadreCaja.vue`. Un premio de rifa o una liquidación por salida modifican el saldo sin que quede quién ni cuándo. | `useAuditoria.js` se invoca solo desde el cuadre; `Actividades.vue` y `Socios.vue` insertan sin auditar |
| D-06 | **`fecha` es la única fecha.** Es un `date` sin hora y sin registro de cuándo se digitó. Un egreso retroactivo es indistinguible de uno registrado el mismo día, justo el problema que la migración 027 acaba de resolver para los pagos con `fecha_causacion`. | Esquema §2.1; migración `027_fecha_causacion_pagos.sql` |
| D-07 | **Editar el pasado descuadra los cortes sellados en silencio.** `cortes_caja` congela el esperado al cerrar (migración 026). Si se edita o borra un movimiento anterior a esa fecha, el corte deja de corresponder con la realidad y nada lo advierte. | `migrations/026_conciliacion_caja_cortes.sql`, PASO 3 |
| D-08 | **El botón «Nuevo Movimiento» se muestra a todo el mundo.** No lleva `v-if` de permisos; quien no los tiene abre el modal, rellena el formulario y recibe el error al guardar. El dinero está a salvo —RLS lo impide— pero la denegación llega en el peor momento. | `CuadreCaja.vue:554-560` frente a `3022` |
| D-09 | **No se ve el efecto antes de guardar.** El formulario pide monto, forma de pago y origen/destino, pero no dice cómo queda el saldo tras la operación, que es lo único que el usuario quiere confirmar. | Modal `CuadreCaja.vue:705-920` |

## 4. Cómo un movimiento afecta los valores

Esto es el núcleo de la petición y hoy no está escrito en ningún sitio. Un movimiento incide en
**tres** cifras distintas, y conviene no confundirlas:

### 4.1 Saldo esperado por forma de pago (conciliación)

Lo determina `forma_pago` y el signo que se deriva de `tipo`:

| Movimiento | Apunte en el libro | Efecto |
|---|---|---|
| Ingreso en efectivo | `movimiento_ingreso`, `+monto` | Sube el esperado en efectivo |
| Egreso en efectivo | `movimiento_egreso`, `−monto` | Baja el esperado en efectivo |
| Ingreso por transferencia | `movimiento_ingreso`, `+monto` | Sube el esperado en transferencia |
| Egreso por transferencia | `movimiento_egreso`, `−monto` | Baja el esperado en transferencia |
| Traslado efectivo → transferencia | dos apuntes `movimiento_traslado`: `−monto` en efectivo, `+monto` en transferencia | **Total sin cambio**; mueve saldo entre columnas |

El saldo esperado del periodo abierto es `saldo del último corte + Σ apuntes del periodo`, por forma
de pago (`ConciliacionCaja.vue:761-765`).

### 4.2 Indicador Recaudado vs. Utilidades

Lo determinan `destino_ingreso` (ingresos) y `origen_egreso` (egresos), con valores `'recaudado'` o
`'utilidades'`. No afectan al saldo total: reparten a qué bolsillo se imputa. Los traslados no
llevan ninguno de los dos, y es correcto: mover dinero de sitio no cambia de quién es.

### 4.3 Cierre de la natillera

`useCierreNatillera.js:188-204` toma los movimientos marcados con `utilidades` y los suma al
concepto `utilidades_adicionales` del reparto final. Un egreso mal marcado como `recaudado` cuando
debía ser `utilidades` no descuadra la caja, pero **reparte mal el dinero entre socios**.

> Consecuencia para el diseño: `origen_egreso` / `destino_ingreso` no son un detalle del formulario.
> Son la decisión con más impacto y la que peor se explica hoy («Se descontará del indicador
> correspondiente en el desglose»). RF-09 lo aborda.

## 5. Requisitos

### 5.1 Funcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | Vista propia en `natilleras/:id/movimientos`, con su entrada en el menú y en las migas de pan, que **liste todos los movimientos del fondo** con fecha, concepto, descripción, forma de pago, importe con signo y color, y quién lo registró. | Must |
| RF-02 | Registrar un **ingreso**: monto, forma de pago, destino (recaudado / utilidades), fecha y descripción. | Must |
| RF-03 | Registrar un **egreso**: monto, forma de pago, origen (recaudado / utilidades), fecha y descripción. | Must |
| RF-04 | Registrar un **traslado** entre efectivo y transferencia como **una sola operación** para el usuario, aunque genere dos apuntes contables. Debe mostrarse siempre como una fila, nunca como dos. | Must |
| RF-05 | **Editar y eliminar** movimientos manuales conservando la coherencia del traslado: editar uno de los dos apuntes edita el par; borrar uno borra los dos. | Must |
| RF-06 | Columna **`concepto` estructurada** en `movimientos_fondo`, con backfill que aplique por última vez las heurísticas de texto de D-01. Ninguna función nueva puede clasificar leyendo `descripcion`. Es el RF-11 del levantamiento de conciliación. | Must |
| RF-07 | Columna **`grupo_traslado_id`** que una los dos apuntes de un traslado, para dejar de emparejarlos por coincidencia de fecha y monto (D-02). | Must |
| RF-08 | Cada movimiento registrado desde esta vista **aparece en el libro de conciliación y afecta el saldo esperado** de su forma de pago según la tabla de §4.1, sin recargar ni recalcular a mano. | Must |
| RF-09 | El formulario debe **explicar el efecto antes de guardar**: cómo queda el saldo de la forma de pago afectada y, en ingresos y egresos, qué significa elegir recaudado o utilidades en términos del reparto final (§4.3). | Must |
| RF-10 | Mostrar también los movimientos de **origen automático** (premio de rifa, liquidación por salida, recaudo de actividad liquidada) en **solo lectura**, con distintivo de su origen y enlace al módulo que los generó. Ocultarlos haría que la vista mintiera sobre el dinero del fondo. | Must |
| RF-11 | **Auditar toda escritura** sobre `movimientos_fondo`, incluidas las que hacen `Actividades.vue` y `Socios.vue` (D-05). | Should |
| RF-12 | Separar **fecha del movimiento** (cuándo se movió el dinero, la elige el usuario) de **fecha de causación** (cuándo se registró), con el mismo criterio que la migración 027 aplicó a los pagos. | Should |
| RF-13 | **Advertir al crear, editar o borrar** un movimiento con fecha anterior al último corte sellado, indicando qué corte queda desactualizado (D-07). | Should |
| RF-14 | Filtros acumulables por rango de fechas, tipo, concepto y forma de pago, más búsqueda por texto en la descripción; y **exportación a Excel** de lo que se ve con los filtros aplicados. | Should |
| RF-15 | Ocultar los controles de escritura a quien no tiene permiso, en vez de dejarle rellenar el formulario para fallar al guardar (D-08). | Should |

### 5.2 No funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Funciona en iPhone/Safari sin romper Android, validado contra el checklist de `CLAUDE.md` §1 y `docs/compatibilidad-ios-safari.md`. |
| RNF-02 | Área táctil ≥ 44×44 px con `touch-action: manipulation`; el input de monto con `font-size` ≥ 16 px para evitar el zoom automático de iOS. |
| RNF-03 | El formulario usa `ModalWrapper` con `useBodyScrollLock` y `useNatiscroll` en el cuerpo scrolleable, según la skill `natillerapp-modals`. |
| RNF-04 | Cualquier barra de acciones anclada con `fixed bottom-0` usa `useTapadoInferior` además de `env(safe-area-inset-bottom)`. |
| RNF-05 | La lista pagina en servidor y no reconstruye el histórico en el navegador. Debe seguir respondiendo con dos años de movimientos. |
| RNF-06 | Las columnas nuevas respetan el RLS existente de `movimientos_fondo` (cuatro políticas atadas a `gestionar_cuotas`). Ninguna deja de aplicarse por añadir campos. |
| RNF-07 | El traslado se escribe de forma **atómica**: o entran los dos apuntes o no entra ninguno. Hoy hay un rollback manual (`CuadreCaja.vue:3080-3082`) que solo cubre el caso feliz. |
| RNF-08 | La clasificación y el emparejamiento existen **en un solo lugar**, consumido por esta vista y por `useLibroCaja.js` (D-03). |

### 5.3 Criterios de aceptación

| ID | Sobre | Criterio |
|----|-------|----------|
| CA-01 | RF-02, RF-03 | Registrar un egreso en efectivo desde la pantalla de la natillera se completa en **≤ 4 toques** y **≤ 30 s**, contra la línea base de §1. |
| CA-02 | RF-08 | Tras guardar un egreso de $50.000 en efectivo, la conciliación muestra el esperado en efectivo **exactamente $50.000 menor**, y el apunte aparece en el libro con signo negativo y su saldo corrido recalculado. |
| CA-03 | RF-04, RF-07 | Un traslado se ve como **una fila** en la vista de movimientos y como **dos apuntes** en el libro de conciliación; el total general no cambia y las dos columnas sí. Los dos apuntes comparten `grupo_traslado_id`. |
| CA-04 | RF-07, D-02 | Con dos traslados del mismo importe y la misma fecha en sentidos opuestos, cada uno se muestra y se edita por separado sin cruzarse. **Este caso falla hoy.** |
| CA-05 | RF-06 | Buscar `includes('premio` o `includes('liquidación` en el código nuevo no devuelve resultados. Los 10 movimientos automáticos de §2.2 quedan con su `concepto` correcto tras el backfill. |
| CA-06 | RF-05 | Editar el monto de un traslado actualiza los dos apuntes; borrarlo borra los dos. No queda ningún apunte huérfano en la base. |
| CA-07 | RF-10 | Un premio de rifa aparece en la lista, marcado como generado por Actividades, y sus controles de edición y borrado están deshabilitados con explicación. |
| CA-08 | RF-13 | Al intentar registrar un egreso con fecha anterior al último corte sellado, aparece un aviso que nombra el corte afectado y su fecha, y exige confirmación explícita. |
| CA-09 | RF-09 | El formulario muestra, antes de confirmar, el saldo resultante de la forma de pago elegida. |
| CA-10 | RNF-07 | Forzando un fallo en el segundo insert del traslado, no queda ningún apunte suelto en la base. |
| CA-11 | RNF-01..04 | Revisión contra el checklist de iOS documentada en el PR, diciendo qué se comprobó por código y qué queda pendiente de dispositivo real. |

## 6. Roles y permisos

Se mantiene el criterio actual, que ya está implementado en RLS y no conviene tocar:

| Rol | Ver | Crear / editar / borrar manuales | Editar automáticos |
|---|---|---|---|
| Superusuario | Sí | Sí | No (se corrigen en su módulo) |
| Admin de la natillera | Sí | Sí | No |
| Colaborador con `gestionar_cuotas` | Sí | Sí | No |
| Socio sin permisos | No | No | No |

La diferencia con hoy es de interfaz, no de reglas: RF-15 exige que quien no puede escribir **no vea
los botones**, en vez de descubrirlo al guardar.

## 7. Estados de pantalla

| Estado | Comportamiento |
|---|---|
| Cargando | `LoadingScreen` con texto propio de movimientos |
| Sin movimientos | Estado vacío que explique qué es un movimiento de fondo y ofrezca registrar el primero; **no** una tabla vacía |
| Sin resultados con los filtros | Distinguirlo del anterior y ofrecer limpiar filtros |
| Error de carga | Mensaje con reintento; nunca una lista vacía que parezca real |
| Sin permisos de lectura | Redirección al detalle de la natillera con aviso |
| Solo lectura | La lista se ve completa y los controles de escritura no existen (RF-15) |
| Movimiento en periodo sellado | Aviso en la fila y confirmación reforzada al editar (RF-13) |

## 8. Pantalla propuesta

```
┌──────────────────────────────────────────────────────────────────────┐
│  Movimientos del fondo                        [+ Registrar]  [Excel] │
│                                                                      │
│  Efectivo  $420.000      Transferencia  $1.180.000    Total $1.600.000│
├──────────────────────────────────────────────────────────────────────┤
│  [ Todo ▾ ] [ Este mes ▾ ] [ Forma de pago ▾ ]      🔍 Buscar…       │
├──────────────────────────────────────────────────────────────────────┤
│  06 sep  ↓ Ingreso · Donación              Efectivo      +150.000  ⋮ │
│          Aporte de la junta                                          │
│                                                                      │
│  05 sep  ⇄ Traslado · Efectivo → Cuenta                  200.000   ⋮ │
│          Consignación semanal                                        │
│                                                                      │
│  04 sep  ↑ Egreso · Papelería              Efectivo       −20.000  ⋮ │
│          Recaudado · registró Elkin R.                               │
│                                                                      │
│  02 sep  🔒 Premio rifa septiembre         Efectivo       −20.000    │
│          Generado desde Actividades →                                │
└──────────────────────────────────────────────────────────────────────┘
```

Tres cosas del boceto son requisito, no decoración:

- **El traslado es una fila con un solo importe sin signo.** Dos filas con `+200.000` y `−200.000`
  obligarían al usuario a sumar mentalmente para ver que no pasó nada (RF-04).
- **Los movimientos automáticos llevan candado y no tienen menú de acciones** (RF-10).
- **La cabecera muestra el saldo por forma de pago**, que es contra lo que el usuario contrasta al
  registrar. Es la misma cifra que la conciliación llama «debería haber».

El formulario, en un `ModalWrapper`, elige primero el tipo —ingreso, egreso o traslado— porque de
esa elección depende qué campos tienen sentido, y cierra con la frase de efecto de RF-09: *«El
efectivo pasará de $420.000 a $400.000»*.

## 9. Modelo de datos

Siguiente migración libre: **028** (`migrations/` llega hasta la 027, ya aplicada).

```sql
-- migrations/028_movimientos_concepto_y_traslados.sql

-- 1. Clasificación estructurada (RF-06, resuelve D-01)
ALTER TABLE public.movimientos_fondo
  ADD COLUMN IF NOT EXISTS concepto text;

ALTER TABLE public.movimientos_fondo
  ADD CONSTRAINT movimientos_fondo_concepto_check
  CHECK (concepto IS NULL OR concepto IN (
    'ingreso_manual',
    'egreso_manual',
    'traslado',
    'premio_rifa',
    'liquidacion_salida',
    'recaudo_actividad_liquidada',
    'reversion_reactivacion'
  ));

-- Backfill: último uso de las heurísticas de texto. Después, nadie vuelve a leer
-- `descripcion` para clasificar. Los 10 movimientos automáticos de §2.2 salen de aquí.
UPDATE public.movimientos_fondo SET concepto =
  CASE
    WHEN tipo = 'salida' AND (lower(descripcion) LIKE '%premio rifa%'
                           OR lower(descripcion) LIKE '%rifa liquidada%') THEN 'premio_rifa'
    WHEN tipo = 'salida' AND lower(descripcion) LIKE '%liquidaci_n por salida%' THEN 'liquidacion_salida'
    WHEN tipo = 'entrada' AND lower(descripcion) LIKE '%recaudo%liquidada%' THEN 'recaudo_actividad_liquidada'
    WHEN tipo = 'entrada' AND lower(descripcion) LIKE '%reversi_n reactivaci_n%' THEN 'reversion_reactivacion'
    ELSE NULL  -- se resuelve en el paso 2, que ya conoce los traslados
  END
WHERE concepto IS NULL;

-- 2. El traslado deja de adivinarse (RF-07, resuelve D-02)
ALTER TABLE public.movimientos_fondo
  ADD COLUMN IF NOT EXISTS grupo_traslado_id uuid;

CREATE INDEX IF NOT EXISTS idx_movimientos_fondo_grupo_traslado
  ON public.movimientos_fondo (grupo_traslado_id)
  WHERE grupo_traslado_id IS NOT NULL;

-- Backfill de los 7 traslados existentes con el algoritmo de emparejamiento actual.
-- Hoy no hay pares ambiguos (§2.2 lo verifica), así que el backfill es determinista;
-- si al ejecutarlo apareciera alguno, debe fallar en vez de elegir al azar.

-- Cerrado el backfill, el resto de manuales queda clasificado:
UPDATE public.movimientos_fondo
   SET concepto = CASE
     WHEN grupo_traslado_id IS NOT NULL THEN 'traslado'
     WHEN tipo = 'entrada' THEN 'ingreso_manual'
     ELSE 'egreso_manual'
   END
 WHERE concepto IS NULL;

ALTER TABLE public.movimientos_fondo
  ALTER COLUMN concepto SET NOT NULL;

-- 3. Fecha de causación (RF-12), mismo criterio que la migración 027
ALTER TABLE public.movimientos_fondo
  ADD COLUMN IF NOT EXISTS fecha_causacion timestamptz;

UPDATE public.movimientos_fondo
   SET fecha_causacion = coalesce(created_at, fecha::timestamptz)
 WHERE fecha_causacion IS NULL;

ALTER TABLE public.movimientos_fondo
  ALTER COLUMN fecha_causacion SET DEFAULT now();
```

Dos decisiones que conviene discutir antes de escribirla:

- **`grupo_traslado_id` frente a una tabla `traslados`.** La columna es más barata y no rompe nada;
  una tabla propia expresaría mejor que un traslado es una entidad con dos asientos. Se propone la
  columna porque el resto del sistema ya lee `movimientos_fondo` y una tabla nueva obligaría a
  tocar los cuatro consumidores de §2.3.
- **`NOT NULL` en `concepto` al final de la migración.** Obliga a que todo escritor lo informe,
  incluidos `Actividades.vue` y `Socios.vue`. Es deliberado: si uno se queda sin actualizar, debe
  fallar en desarrollo y no crear filas sin clasificar.

Fuera de esta migración pero en el mismo entregable: la **restricción de atomicidad** de RNF-07.
Insertar los dos apuntes de un traslado desde el cliente no es atómico; la forma correcta es una
RPC `registrar_traslado(natillera_id, monto, forma_origen, descripcion, fecha)` que haga los dos
inserts en una transacción y devuelva el `grupo_traslado_id`.

## 10. Impacto en el código existente

| Archivo | Cambio |
|---|---|
| `src/views/movimientos/Movimientos.vue` | **Nuevo.** La vista de este documento |
| `src/composables/useMovimientosFondo.js` | **Nuevo.** Única fuente de clasificación y emparejamiento (RNF-08); lo consumen la vista y `useLibroCaja.js` |
| `src/views/cuadre/CuadreCaja.vue` | Quitar el modal (705-920) y el CRUD (2673-3608). Es la mayor parte de la reducción que pide D-04 del levantamiento de conciliación |
| `src/composables/useLibroCaja.js` | Sustituir la clasificación por texto (101-127, 323-387) y el emparejamiento (395-420) por el composable nuevo |
| `src/views/actividades/Actividades.vue` | Informar `concepto` en sus tres escrituras y auditar (RF-11) |
| `src/views/socios/Socios.vue` | Igual para liquidación y reversión |
| `src/router/index.js` | Ruta `natilleras/:id/movimientos` |
| `src/layouts/DashboardLayout.vue`, `src/components/Breadcrumbs.vue` | Entrada de menú y migas |

## 11. Fuera de alcance

- **Categorías de gasto configurables por natillera** (arriendo, papelería, transporte). `concepto`
  clasifica la naturaleza contable, no el motivo. Si se quiere analítica de gasto, es otro campo y
  otra discusión.
- **Adjuntar comprobante o foto del recibo.** Deseable, pero implica Storage y su RLS.
- **Movimientos recurrentes** programados.
- **Multi-caja**: se sigue asumiendo una caja por natillera.
- **Reescribir cómo Actividades y Socios generan sus movimientos.** Aquí solo se les pide informar
  `concepto` y auditar; rediseñar esos flujos es trabajo de sus módulos.
- **Corregir los cortes sellados que queden desactualizados** por editar el pasado. Se advierte
  (RF-13), no se recalcula: un corte que se recalcula solo deja de ser prueba de nada.

## 12. Preguntas abiertas

| # | Pregunta | Estado |
|---|----------|--------|
| 1 | ¿La vista entra en el menú lateral o cuelga del detalle de la natillera? Hereda la pregunta 6 del levantamiento de conciliación. | Abierta |
| 2 | ¿Los movimientos automáticos se listan mezclados con los manuales, o en una pestaña aparte? RF-10 propone mezclados con distintivo. | Abierta |
| 3 | ¿Se permite registrar un movimiento con fecha futura? Hoy nada lo impide y el saldo esperado lo cuenta desde ya. | Abierta |
| 4 | ¿Hace falta un permiso propio (`gestionar_movimientos`) o basta `gestionar_cuotas`? Hoy quien puede registrar pagos puede sacar dinero del fondo. | Abierta |
| 5 | Al editar un traslado, ¿se permite cambiar la dirección (efectivo→cuenta por cuenta→efectivo)? Hoy no se puede cambiar el tipo. | Abierta |
| 6 | ¿Qué pasa si un egreso deja el saldo de una forma de pago en negativo? ¿Se bloquea, se avisa, o se registra? | Abierta |
| 7 | **¿Cuánto tarda hoy registrar un egreso?** Sin ese número, CA-01 no es verificable. | Abierta |
| 8 | La heurística busca `recaudo rifa liquidada`, pero ningún código inserta ese texto. ¿Es residuo de un flujo retirado o una ruta que falta? | Abierta |

## 13. Historial de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-09-06 | Levantamiento inicial. Desarrolla RF-07 y §13.1 del levantamiento de conciliación. Esquema, restricciones y volumen verificados contra la base de producción, no contra `backups/database.types.ts`. |

---
name: natillerapp-modals
description: >-
  Modales en Natillerapp (Vue 3 + Tailwind): usar ModalWrapper, patrón visual
  tipo «Sin Socios», safe-area, scroll en iOS, useBodyScrollLock, footer de
  acciones fijo y natiscroll (velo + «Desliza para ver más») **obligatorio**
  en cualquier modal con cuerpo scrolleable. Aplica al crear, modificar o
  editar cualquier modal, diálogo o overlay equivalente.
---

# Modales — Natillerapp

## Implementación de referencia

El modal **«Sin Socios»** en `src/views/natilleras/NatilleraDetalle.vue` define el estándar de **diseño y comportamiento** para modales tipo tarjeta informativa con CTA.

- **Contenedor**: siempre `<ModalWrapper>` (`src/components/ModalWrapper.vue`). No montar overlays con `fixed inset-0` + `@click` manual salvo excepción justificada y alineada con la skill `ios-safari-compat`.

## Comportamiento (igual que la referencia)

1. **Visibilidad**: `:show="!!refModal"` (o computed booleano).
2. **Scroll del documento**: registrar el estado con `useBodyScrollLock(...)` desde `src/composables/useBodyScrollLock.js` (misma ref o `computed` que controla el modal).
3. **Cierre**:
   - Si el flujo no debe cerrarse al tocar fuera (onboarding / acción obligatoria): `:persistent="true"` y cerrar solo con botones explícitos.
   - Fondo: en Android/desktop usar `backdrop-class` con velo salvia **`bg-[#C8D9C8]/70`** (70 % opacidad); en iOS, con `ios-soft-backdrop`, el equivalente está en `ModalWrapper` (clase `.modal-wrapper-ios__backdrop--sage`, `rgba(200,217,200,0.7)`).

## Props típicas del patrón «Sin Socios»

| Prop | Valor referencia | Motivo |
|------|------------------|--------|
| `align` | `"bottom"` | Bottom sheet en móvil, centrado en `sm+` |
| `z-index` | `50` | Consistencia con el resto de overlays |
| `persistent` | `true` | Evita cierre accidental por backdrop |
| `ios-soft-backdrop` | `true` | Fondo salvia en iOS (`ModalWrapper`: `rgba(200,217,200,0.7)` + blur; tarjeta marca) |
| `overlay-class` | `fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4` | Layout responsive |
| `backdrop-class` | `absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]` | Velo salvia al **70 %** de opacidad (Android/desktop; Tailwind) |
| `card-class` | `relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white` | `dvh` en móvil (Safari); `min-h-0` para que el scroll interno funcione |
| `card-max-width` | `"28rem"` | Alineado con `max-w-md` |

### Velo salvia (opacidad 70 %)

- **Android / desktop**: `backdrop-class` debe incluir `bg-[#C8D9C8]/70` (no el color plano al 100 % salvo excepción).
- **iOS** (`ios-soft-backdrop`): el color equivalente vive en `src/components/ModalWrapper.vue` (`.modal-wrapper-ios__backdrop--sage`, `rgba(200, 217, 200, 0.7)`). Si cambias el porcentaje en un sitio, mantén **paridad** Tailwind ↔ CSS iOS.

Ajusta título, textos e iconos; **estructura**: cabecera marca (`flex-shrink-0`) + **cuerpo scrolleable** (`flex-1 min-h-0 overflow-y-auto`) + **footer de acciones fijo** (`flex-shrink-0` con `border-t` y safe-area), siempre visible cuando la modal tiene scroll. El natiscroll vive **dentro del cuerpo**, como overlay absoluto sobre el final del área scrolleable (ver abajo).

> **Importante:** «Estandarizar un modal» en Natillerapp implica **siempre** estos cuatro elementos juntos: `ModalWrapper` + cabecera marca compacta + cuerpo scrolleable + **footer fijo** + **natiscroll** cuando el cuerpo puede desbordar. Si la decisión es deliberada de **no** usar natiscroll (modal cuyo cuerpo nunca desborda en ninguna pantalla soportada), **documentarlo en un comentario**. El default es **incluirlo**.

## Cabecera marca: móvil vs desktop (diseño)

**Regla de producto (Natillerapp):** la misma cabecera se comporta distinto según el breakpoint; **no** es la misma composición visual en los dos.

| Vista | Layout | Contenido |
|-------|--------|-----------|
| **Móvil** (`< sm`, clase `sm:hidden`) | **Una sola fila horizontal** | `[← volver si aplica]` · **icono circular** · **título + subtítulo** (`flex-1 min-w-0`, texto alineado a la izquierda) · **botón cerrar (X)** al final de la fila. Aprovecha altura y lectura en pantallas estrechas. |
| **Desktop / tablet** (`sm:` y superior, `hidden sm:block`) | **Bloque centrado en columna** | **Icono arriba** (círculo de marca, centrado) → **título debajo** → **subtítulo debajo** (`text-center`). La **X** sigue siendo el **último elemento de una fila** de tres columnas lógicas (ver implementación), **no** debajo del texto. |

**Implementación recomendada:** duplicar **solo la cabecera** en dos contenedores hermanos (`sm:hidden` y `hidden sm:block`) con los **mismos textos e iconos**; el **cuerpo** del modal es uno solo. Referencia viva: modal **Registrar pago** y modal **selector socio → cuota** en `src/views/cuotas/Cuotas.vue`.

**Desktop (patrón de tres columnas, X sin `absolute`):** una fila `flex items-start` con (1) columna izquierda `w-11`: botón «volver» si aplica, o `aria-hidden` vacía para **simetría** con la X; (2) centro `flex-1 min-w-0 flex flex-col items-center text-center`: icono, título, subtítulo; (3) derecha: botón X `h-11 w-11 flex-shrink-0`. Así el icono queda **visualmente arriba** y los textos **debajo**, con la X anclada a la esquina superior derecha de la cabecera **solo con flexbox** (compatible iOS).

**Safe-area superior:** móvil `pt-[max(0.75rem,env(safe-area-inset-top))]`; desktop `pt-[max(1rem,env(safe-area-inset-top))]` (o `1.5rem` si el modal es muy alto en datos).

## Cabecera (~20 % más compacta que la referencia “clásica”)

En formularios y modales con CTA, la cabecera marca va **~20 % más pequeña** que el patrón antiguo (`text-xl` + `w-16 h-16`):

| Elemento | Referencia compacta (usar) | Evitar como default |
|----------|----------------------------|----------------------|
| Título móvil (fila) | `text-base` + `font-display font-bold` | `text-xl` |
| Título `sm+` (bloque centrado) | `text-lg` | `text-xl` / `text-2xl` |
| Subtítulo móvil | `text-[0.6875rem]` o `text-xs` | `text-sm` largo en móvil |
| Subtítulo `sm+` | `text-xs` | `text-sm` |
| Círculo icono móvil | `w-10 h-10`, icono `w-5 h-5` | `w-12 h-12` + `w-6 h-6` |
| Círculo icono `sm+` | `w-11 h-11` o `w-[3.2rem] h-[3.2rem]`, icono `w-6 h-6` | `w-16 h-16` + `w-8 h-8` |
| Bloque cabecera móvil | `min-h-[4.2rem]`, `pb-3` | `min-h-[5.25rem]`, `pb-4` |
| Bloque cabecera `sm+` | `pb-5`, `pt-[max(1rem,env(safe-area-inset-top))]` | `pb-7`, paddings exagerados |

**Botones X / volver:** área táctil **~44×44 px** (`h-11 w-11`), `touch-manipulation` en móvil, `aria-label` explícito.

## Botones del pie de modal (primario / secundario)

Referencia visual y técnica: modal **Registrar pago** en `src/views/cuotas/Cuotas.vue` y clases globales en `src/style.css`.

| Rol | Clase | Uso |
|-----|--------|-----|
| **Primario** (acción principal: Guardar, Registrar, Confirmar, Exportar…) | `btn-modal-primary` | Fondo **#1B5E37**, hover **#155a32**, active **#134d2b**, sombra suave tintada marca, **pill** (`rounded-full`), altura mínima **48px**. |
| **Secundario** (Cancelar, Cerrar sin acción destructiva) | `btn-modal-secondary` | Blanco, borde **gray-300**, texto **gray-700**, mismo radio y altura mínima. |

Combinar con utilidades de layout según el modal: `flex-1`, `w-full`, `gap-2` en el contenedor, `inline-flex` ya está cubierto por las clases.

**Excepciones (no usar verde marca como primario):** acciones **destructivas** (eliminar, rechazar irreversible) → rojo u otro color semántico; **advertencia** fuerte → ámbar; botones cuyo significado depende del color (p. ej. **Descargar** en azul, **WhatsApp** en verde propio) pueden mantener estilo específico; dejar un comentario corto en el template si no es `btn-modal-*`.

```html
<!-- Ejemplo: dos CTAs en fila -->
<div class="flex gap-3">
  <button type="button" class="btn-modal-secondary flex-1" @click="cerrar">Cancelar</button>
  <button type="button" class="btn-modal-primary flex-1" @click="confirmar">Confirmar</button>
</div>
```

## Botón cerrar (X) e iOS / Safari

Dentro de `ModalWrapper`, **no** usar `position: absolute` + `right-*` para la X en la cabecera: en iOS el ancestro del modal usa `transform`, y la X puede **desalinearse** (p. ej. verse a la izquierda).

- **Patrón obligatorio:** la X es un **hermano en `flex`** (o en la tercera columna del layout desktop anterior), con `flex-shrink-0`, **siempre al final** de la fila móvil o de la fila de cabecera desktop.
- **Mostrar la X:** en formularios largos, **sí** conviene X **siempre visible** en cabecera además de «Cancelar» al final del scroll. El patrón opcional «ocultar X si no hay scroll» (`useModalBodyScrollOverflow`) queda solo para modales **informativos muy cortos** donde se quiera evitar redundancia; **no** es el default para registrar pago / formularios.

## Cuerpo y acciones (footer siempre visible)

Patrón **por defecto**: la card es `flex flex-col` con **tres áreas hermanas**:

1. **Cabecera** (`flex-shrink-0`): cabecera marca compacta (sección anterior).
2. **Cuerpo scrolleable** (`flex-1 min-h-0 overflow-y-auto`): fondo blanco, tipografía gris para lectura. Caja informativa opcional: fondo `#E8F5E9`, borde suave, icono Heroicons. Clases scroll iOS: `overscroll-contain [-webkit-overflow-scrolling:touch]`. Aquí va **todo el contenido** (formulario, lista, tablas, etc.).
3. **Footer de acciones fijo** (`flex-shrink-0`): bloque hermano del cuerpo, con `border-t border-gray-200`, `bg-white`, `pt-4`, `px-*` consistente con el cuerpo y **`pb-[max(1.25rem,env(safe-area-inset-bottom))]`** para respetar el home indicator. Contiene los botones primario/secundario y queda **siempre visible** mientras el cuerpo se desplaza por encima.

**Por qué**: evita que el usuario tenga que hacer scroll hasta el final para encontrar «Confirmar» / «Guardar» / «Cerrar». Es especialmente útil en formularios largos, listas (cuotas, socios, préstamos), tablas y modales de detalle.

**Indicadores** (“desliza para ver más” / natiscroll): viven **dentro** del cuerpo scrolleable como overlay absoluto, **no** dentro del footer. Aparecen pegados al borde inferior del cuerpo, justo arriba del footer fijo, reforzando que aún hay contenido por revelar al desplazar. Detalle en la sección **Natiscroll** más abajo.

**Excepción** (modal informativo muy corto, una sola línea + 1 CTA): se permite poner el botón al final del scroll sin footer separado (por ejemplo, modales de confirmación tipo «¿Eliminar este socio?»). Es **caso borde**, no el default.

## Natiscroll (velo + «Desliza para ver más») — **obligatorio en modales con scroll**

**Natiscroll** es el nombre interno del patrón para modales cuyo **contenido supera la altura visible**: se muestra un **velo** (degradado suave) al pie del área scrolleable y el texto **«Desliza para ver más»** mientras quede contenido sin ver. En iPhone/Safari refuerza que el modal **sí** se puede deslizar y no está “cortado”.

> **Regla de estandarización:** todo modal que tenga **cuerpo scrolleable** (la inmensa mayoría: detalle, formularios, listas, comprobantes, confirmaciones con varios bloques) **debe** incluir natiscroll. Hablar de «estandarizar un modal» **sin** natiscroll es incompleto. Excepción única: el cuerpo es tan pequeño que **nunca** desbordará en ninguna pantalla razonable (≤ ~360 px de alto útil); en ese caso, dejar comentario explícito justificando la omisión.

### Colocación en el layout

- El velo y el hint van **dentro del cuerpo scrolleable** (o como **overlay absoluto** sobre él). **Nunca** dentro del footer fijo de acciones (no tendría sentido: el footer ya está siempre visible).
- Patrón típico en el repo: un `div` `relative` envuelve al cuerpo (`overflow-y-auto`) y el natiscroll se posiciona con `pointer-events-none absolute inset-x-0 bottom-0 z-10` sobre el cuerpo. Así no interfiere con el scroll y queda visualmente pegado al borde superior del footer fijo, indicando que aún hay contenido por desplazar.
- Composición: degradado suave `from-transparent to-white/88` (o al fondo de la card) + chip / texto centrado pequeño con tipografía marca («Desliza para ver más»).

### Cómo saber si “hay más abajo”

En el repo conviven dos enfoques; elige el que encaje con el modal:

1. **`useModalBodyScrollOverflow`** (`src/composables/useModalBodyScrollOverflow.js`): `ResizeObserver` + `MutationObserver` miden si hay overflow vertical (`scrollHeight > clientHeight + 1`). Se usa, entre otras cosas, para **decidir si muestra la X** en modales muy cortos o como apoyo a la lógica del cuerpo scrolleable.
2. **Natiscroll manual** (patrones en Cuotas / Préstamos / Socios): refs booleanas `hayNatiscroll…`, funciones `actualizarNatiscroll…` que comparan `scrollTop`, `clientHeight` y `scrollHeight`, y `programarNatiscroll…` que envuelven la actualización en **`requestAnimationFrame`** tras `@scroll.passive` en el contenedor, para no hacer trabajo pesado en cada evento de scroll táctil.

### Reglas prácticas

- Mostrar velo + hint solo si hay overflow **y** el usuario **no** ha llegado al final (umbral de unos píxeles opcional para evitar parpadeo).
- Tras abrir el modal, cambiar tamaño de ventana o mutar el contenido del cuerpo: volver a medir (`nextTick`, watchers o reutilizar `measureOverflow` del composable).
- **Contenido que cambia de altura (búsqueda, filtros, listas filtradas, acordeones, carga async):** el natiscroll manual **no** basta con `@scroll` y el `nextTick` del open. Cada vez que el cuerpo deje de necesitar scroll (p. ej. de muchas filas a **una**), hay que **volver a llamar** a `actualizarNatiscroll…` / `programarNatiscroll…` en un `watch` con `flush: 'post'` de las dependencias que afecten al layout (texto de búsqueda, `length` de la lista filtrada, etc.). Si no, el velo y «Desliza para ver más» pueden quedar visibles **sin** overflow real (bug visto en modal con búsqueda y un solo resultado).
- Si usas **RAF** manual: **cancelar** el `requestAnimationFrame` pendiente al cerrar el modal o en `onUnmounted` (evita trabajo huérfano).

### Dónde verlo en código

- Demo: `src/views/demo/DesignSystemDemo.vue` (modal «Nati-scroll»).
- Producción: buscar `natiscroll`, `hayNatiscroll` o `Desliza para ver más` en `src/views/cuotas/Cuotas.vue`, `src/views/prestamos/Prestamos.vue`, `src/views/socios/Socios.vue`.

## Diseño visual (línea «Sin Socios»)

1. **Cabecera** (`flex-shrink-0`): fondo marca `#1B5E37`, texto blanco, `font-display` en títulos. Seguir **móvil = fila** y **desktop = icono arriba + textos abajo** (sección anterior) y la tabla compacta.
2. **Cuerpo scrolleable** (`flex-1 min-h-0`): contenido del modal, con natiscroll como overlay si desborda (sección **Cuerpo y acciones**).
3. **Footer de acciones** (`flex-shrink-0`): botones primario/secundario, **siempre visibles**, con `border-t`, `bg-white` y `safe-area-bottom`.
4. **X**: integrada por **flex**, nunca por **`absolute`** en cabeceras dentro de `ModalWrapper` (ver **Botón cerrar (X) e iOS / Safari**).

## Snippet estructural (adaptar textos)

```vue
<ModalWrapper
  :show="!!modalMiFlujo"
  :z-index="50"
  align="bottom"
  :persistent="true"
  :ios-soft-backdrop="true"
  overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
  backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
  card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
  card-max-width="28rem"
  @close="modalMiFlujo = false"
>
  <!-- Cabecera flex-shrink-0: (1) sm:hidden → fila móvil [←?][icono][títulos flex-1][X] -->
  <!-- (2) hidden sm:block → flex items-start: [w-11 izq][centro flex-col items-center][X] -->

  <!-- Contenedor cuerpo + natiscroll. relative para overlay del hint. -->
  <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <div
      ref="scrollAreaModal"
      class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 pt-5 pb-4 space-y-5 bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
      @scroll.passive="programarNatiscroll"
    >
      <!-- contenido del formulario / lista -->
    </div>

    <!-- Natiscroll: overlay absoluto sobre el cuerpo, visible solo si hay overflow -->
    <div
      v-show="hayNatiscroll"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      aria-hidden="true"
    >
      <div class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent" />
      <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
        <!-- chip «Desliza para ver más» con tipografía marca -->
      </div>
    </div>
  </div>

  <!-- Footer de acciones: flex-shrink-0, siempre visible. Hereda safe-area-bottom. -->
  <div class="flex-shrink-0 border-t border-gray-200 bg-white px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3">
    <!-- btn-modal-secondary + btn-modal-primary (+ flex-1 / w-full según layout); ver sección «Botones del pie de modal» -->
  </div>
</ModalWrapper>
```

La card es `flex flex-col` con tres áreas hermanas: cabecera `flex-shrink-0`, cuerpo `flex-1 min-h-0` (con el natiscroll como overlay) y footer `flex-shrink-0`. Referencia viva: modal **Cuotas del Socio** y modal **Detalle del Socio** en `src/views/socios/Socios.vue`.

En el `<script setup>`:

```js
const modalMiFlujo = ref(false)
const scrollAreaModal = ref(null)
useBodyScrollLock(modalMiFlujo)
// Opcional (modales informativos cortos): ocultar X si no hay scroll
// const { tieneScroll } = useModalBodyScrollOverflow(modalMiFlujo, scrollAreaModal)
```

(`useModalBodyScrollOverflow` en `src/composables/useModalBodyScrollOverflow.js` — solo si aplicas el patrón opcional.)

## Inputs de búsqueda dentro de modales

**No** usar `position: absolute` + `top-1/2 -translate-y-1/2` para colocar iconos dentro de un input. En Safari móvil, `type="search"` y ciertos campos pueden cambiar de alto al recibir foco, rompiendo el centrado vertical con `absolute`.

**Patrón correcto:** usar un contenedor `flex items-center` con el borde/ring en el contenedor, y el input con `flex-1 min-w-0` sin borde propio:

```html
<div class="flex items-center gap-0 border-2 border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-natillera-500/50 focus-within:border-natillera-500">
  <span class="pl-3 flex-shrink-0 text-gray-400 pointer-events-none">
    <MagnifyingGlassIcon class="w-5 h-5" />
  </span>
  <input
    v-model="busqueda"
    type="text"
    placeholder="Buscar..."
    class="flex-1 min-w-0 py-3 px-2 bg-transparent text-sm outline-none border-none focus:ring-0"
  />
  <button v-if="busqueda.trim()" type="button" class="pr-3 flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600" @click="busqueda = ''">
    <XMarkIcon class="w-4 h-4" />
  </button>
</div>
```

Esto garantiza que la lupa y la X siempre queden alineadas verticalmente con el texto, sin depender de `absolute`.

## Extracción a componente

Si el mismo patrón se repite, crear un componente (p. ej. `MiModalInformativo.vue`) que **envuelva** `ModalWrapper` y reciba `show`, títulos y slots para cuerpo/acciones — sin duplicar la lógica de iOS/Android (eso vive en `ModalWrapper`).

## Compatibilidad iOS

Los detalles de viewport, `ModalWrapper` interno y scroll están en la skill **`ios-safari-compat`**. Cualquier modal nuevo debe cumplir ambas: esta skill (patrón UX/UI) + iOS (comportamiento técnico).

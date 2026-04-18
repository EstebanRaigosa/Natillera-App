---
name: natillerapp-modals
description: >-
  Modales en Natillerapp (Vue 3 + Tailwind): usar ModalWrapper, patrón visual
  tipo «Sin Socios», safe-area, scroll en iOS y useBodyScrollLock. Aplica al
  crear, modificar o editar cualquier modal, diálogo o overlay equivalente.
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

Ajusta título, textos e iconos; **estructura**: cabecera marca + **un solo cuerpo scrolleable** (`flex-1 min-h-0 overflow-y-auto`) que incluye **todo el contenido y las acciones al final** (ver abajo).

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

## Botón cerrar (X) e iOS / Safari

Dentro de `ModalWrapper`, **no** usar `position: absolute` + `right-*` para la X en la cabecera: en iOS el ancestro del modal usa `transform`, y la X puede **desalinearse** (p. ej. verse a la izquierda).

- **Patrón obligatorio:** la X es un **hermano en `flex`** (o en la tercera columna del layout desktop anterior), con `flex-shrink-0`, **siempre al final** de la fila móvil o de la fila de cabecera desktop.
- **Mostrar la X:** en formularios largos, **sí** conviene X **siempre visible** en cabecera además de «Cancelar» al final del scroll. El patrón opcional «ocultar X si no hay scroll» (`useModalBodyScrollOverflow`) queda solo para modales **informativos muy cortos** donde se quiera evitar redundancia; **no** es el default para registrar pago / formularios.

## Cuerpo y acciones (scroll único)

1. **Cuerpo** (`min-h-0 overflow-y-auto flex-1`): fondo blanco, tipografía gris para lectura. Caja informativa opcional: fondo `#E8F5E9`, borde suave, icono Heroicons. Clases scroll iOS: `overscroll-contain [-webkit-overflow-scrolling:touch]`.
2. **Acciones primarias/secundarias**: **por defecto van al final del mismo scroll**, en un bloque con `border-t border-gray-200`, `pt-4` y **`pb-[max(1.25rem,env(safe-area-inset-bottom))]`** para respetar el home indicator. **No** uses un pie `flex-shrink-0` fijo fuera del scroll salvo **excepción** justificada (p. ej. flujo muy corto con una sola acción siempre visible y sin formulario largo).
3. **Indicadores** (“desliza para ver más”): si aplica, deben vivir **dentro** del área scroll, justo encima del bloque de acciones, para no simular un pie fijo.

## Diseño visual (línea «Sin Socios»)

1. **Cabecera** (`flex-shrink-0`): fondo marca `#1B5E37`, texto blanco, `font-display` en títulos. Seguir **móvil = fila** y **desktop = icono arriba + textos abajo** (sección anterior) y la tabla compacta.
2. **Cuerpo + pie lógico**: un solo contenedor scroll (sección **Cuerpo y acciones**).
3. **X**: integrada por **flex**, nunca por **`absolute`** en cabeceras dentro de `ModalWrapper` (ver **Botón cerrar (X) e iOS / Safari**).

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
  <!-- Cabecera: (1) sm:hidden → fila móvil [←?][icono][títulos flex-1][X] -->
  <!-- (2) hidden sm:block → flex items-start: [w-11 izq][centro flex-col items-center][X] -->
  <div
    ref="scrollAreaModal"
    class="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-0 space-y-5 bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
  >
    <!-- contenido del formulario -->
    <!-- opcional: indicador “más abajo” (dentro del scroll) -->
    <div class="pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-gray-200 space-y-3">
      <!-- botón secundario + primario, min-h-[48px], rounded-full -->
    </div>
  </div>
</ModalWrapper>
```

Si la card ya es `flex flex-col` con cabecera `flex-shrink-0`, basta **un** `div` scroll con `flex-1 min-h-0` que envuelva contenido + acciones (como en `Cuotas.vue` modal pago).

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

<template>
  <Teleport to="body">
    <template v-if="show">
      <!-- Versión iOS/Safari: estructura desde cero para vista y scroll correctos -->
      <div
        v-if="isIos"
        :class="['modal-wrapper-ios', align === 'bottom' ? 'modal-wrapper-ios--bottom' : '']"
        :style="{ zIndex: zIndex, '--tapado-inferior': `${tapado}px` }"
        @click.self="tryClose"
      >
        <!--
          Cierra con `click`, no con `touchstart`: si el modal desaparece al posar el dedo, el
          click que iOS sintetiza al levantarlo cae sobre lo que haya debajo (clic fantasma), y
          empezar un deslizamiento sobre el velo lo cerraba. `touch-action: manipulation` ya
          quita el retardo de 300 ms.
        -->
        <div
          :class="['modal-wrapper-ios__backdrop', iosSoftBackdrop ? 'modal-wrapper-ios__backdrop--sage' : '']"
          aria-hidden="true"
          @click="tryClose"
        />
        <!-- Ancho por variable: un `max-width` en línea pierde contra el `!important` de la clase -->
        <div
          :class="['modal-wrapper-ios__card', cardClass]"
          :style="cardMaxWidth ? { '--ancho-card': cardMaxWidth } : undefined"
          @click.stop
        >
          <slot />
        </div>
      </div>
      <!-- Versión Android/desktop: respeta las clases que ya usabas -->
      <div
        v-else
        :class="overlayClass"
        @click.self="tryClose"
      >
        <div
          :class="backdropClass"
          style="pointer-events: auto !important; touch-action: manipulation !important; cursor: pointer !important; -webkit-tap-highlight-color: transparent; z-index: 0 !important;"
          aria-hidden="true"
          @click="tryClose"
        />
        <div
          ref="cardRef"
          :class="[cardClass, maximizada && cabeceraCompacta ? 'modal-wrapper--ampliada' : '']"
          :style="maximizada ? estiloMaximizada : { position: 'relative', zIndex: 10 }"
          @click.stop
        >
          <slot />
          <!--
            Ampliar, solo en escritorio (puntero fino y >= 1024 px). Va después del slot para
            que la cabecera siga siendo el primer hijo de la card (el CSS de abajo la busca así).
            Normal: arriba a la izquierda, donde no cae nada de la cabecera de escritorio (icono y
            títulos centrados, X a la derecha). Ampliado: la cabecera pasa a la fila de móvil y el
            botón se pone junto a la X. Fondo oscuro translúcido para verse sobre verde o blanco.
          -->
          <button
            v-if="puedeMaximizar"
            type="button"
            :class="[
              'absolute z-30 flex h-11 w-11 items-center justify-center rounded-full [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              maximizada && cabeceraCompacta ? 'right-[3.75rem] top-[0.725rem]' : 'left-1 top-1'
            ]"
            :aria-label="maximizada ? 'Restaurar tamaño' : 'Ampliar'"
            :title="maximizada ? 'Restaurar tamaño' : 'Ampliar'"
            @click="alternarAmpliada"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white transition-colors hover:bg-black/40">
              <ArrowsPointingInIcon v-if="maximizada" class="h-4 w-4" aria-hidden="true" />
              <ArrowsPointingOutIcon v-else class="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/outline'
import { useIsIos } from '../composables/useIsIos'
import { useTapadoInferior } from '../composables/useTapadoInferior'

/**
 * Pila global de modales abiertas (ModalWrapper). Permite que la tecla Esc
 * cierre solo la modal superior cuando hay varias apiladas y registrar un
 * único listener de teclado compartido para toda la app.
 */
const modalStack = []
let escListenerActive = false

function handleEscKeydown(e) {
  if (e.key !== 'Escape' && e.key !== 'Esc') return
  const top = modalStack[modalStack.length - 1]
  if (top) {
    e.stopPropagation()
    top()
  }
}

function ensureEscListener() {
  if (escListenerActive || typeof document === 'undefined') return
  document.addEventListener('keydown', handleEscKeydown)
  escListenerActive = true
}

function pushModal(closeFn) {
  modalStack.push(closeFn)
  ensureEscListener()
}

function popModal(closeFn) {
  const idx = modalStack.lastIndexOf(closeFn)
  if (idx !== -1) modalStack.splice(idx, 1)
  if (modalStack.length === 0 && escListenerActive && typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleEscKeydown)
    escListenerActive = false
  }
}

const props = defineProps({
  show: { type: Boolean, default: false },
  zIndex: { type: Number, default: 50 },
  /** iOS: 'center' | 'bottom' (bottom = tipo bottom sheet en móvil) */
  align: { type: String, default: 'center' },
  /** No cerrar al tocar fuera (onboarding / flujos que exigen CTA explícita) */
  persistent: { type: Boolean, default: false },
  /** iOS: velo salvia al 70 % (skill modales Natillerapp); en oscuro, negro translúcido (token --velo-modal) */
  iosSoftBackdrop: { type: Boolean, default: false },
  /** Android: clases del overlay (fixed inset-0 flex ...) */
  overlayClass: { type: String, default: 'fixed inset-0 z-50 flex items-center justify-center p-4' },
  /** Android: clases de la card (relative max-w-md ...) */
  cardClass: { type: String, default: 'relative max-w-lg w-full bg-superficie-tarjeta rounded-2xl shadow-2xl border border-borde max-h-[90vh] overflow-y-auto' },
  /** Android: capa detrás de la card (overlay oscuro por defecto) */
  backdropClass: { type: String, default: 'absolute inset-0 bg-black/50 backdrop-blur-sm' },
  /** iOS: ancho máximo de la card (ej. '28rem' para max-w-md, '42rem' para max-w-2xl) */
  cardMaxWidth: { type: String, default: '' },
  /** Escritorio: botón para que la card ocupe toda la pantalla. `false` para quitarlo. */
  maximizable: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

function tryClose() {
  if (!props.persistent) {
    emit('close')
  }
}

// Cierre con tecla Esc en desktop (Esc solo lo emite un teclado físico).
// Respeta `persistent` vía tryClose y, con modales apiladas, cierra solo la superior.
let registered = false
function register() {
  if (registered) return
  pushModal(tryClose)
  registered = true
}
function unregister() {
  if (!registered) return
  popModal(tryClose)
  registered = false
}

watch(
  () => props.show,
  (visible) => {
    if (visible) register()
    else unregister()
  },
  { immediate: true }
)

onBeforeUnmount(unregister)

const isIos = useIsIos()

// Ampliar en escritorio: la card puede tomar todo el alto (conserva su ancho: el contenido está
// pensado en una columna y estirarlo lo deforma) y la cabecera grande de escritorio (icono
// arriba + título centrado) se cambia por la fila compacta de móvil, que ya trae cada modal
// del patrón (`sm:hidden` + `hidden sm:flex`). Las cards traen su alto máximo en clases
// (max-h-[90vh]); el estilo en línea les gana sin tocar cada modal.
const maximizada = ref(false)
// Tope de alto, no alto fijo: un modal corto (p. ej. el selector de mes) se queda de su
// tamaño; antes `height` lo estiraba a toda la pantalla y quedaba un hueco en blanco.
const estiloMaximizada = {
  position: 'relative',
  zIndex: 10,
  maxHeight: 'calc(100vh - 2rem)'
}
const cardRef = ref(null)
// Solo se compacta si la cabecera sigue el patrón; si no, se deja como está.
const cabeceraCompacta = ref(false)
function detectarCabeceraCompacta() {
  const cabecera = cardRef.value?.firstElementChild
  cabeceraCompacta.value = !!cabecera?.querySelector(':scope > .sm\\:hidden')
}
function alternarAmpliada() {
  detectarCabeceraCompacta()
  maximizada.value = !maximizada.value
}

// Portátiles de hasta ~15 pulgadas: ahí la cabecera grande y el 90 % de alto se comen la
// pantalla, así que el modal abre ya ampliado. Las pulgadas no se pueden leer; se usa el
// ancho de la pantalla en px CSS: los de 13–15" quedan en 1280–1536 (1366×768, 1440×900,
// 1512×982, 1920×1080 al 125 % = 1536). 1600 deja fuera los de 16" y los monitores externos.
// Es `screen`, no la ventana: achicar la ventana en un monitor grande no lo activa.
const PANTALLA_PEQUENA_MAX = 1600
function esPantallaPequena() {
  return typeof window !== 'undefined' && (window.screen?.width || 0) <= PANTALLA_PEQUENA_MAX
}
const puedeMaximizar = ref(false)
let consultaEscritorio = null
function alCambiarEscritorio() {
  puedeMaximizar.value = props.maximizable && !!consultaEscritorio?.matches
  if (!puedeMaximizar.value) maximizada.value = false
}
if (typeof window !== 'undefined' && window.matchMedia) {
  consultaEscritorio = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
  alCambiarEscritorio()
  consultaEscritorio.addEventListener?.('change', alCambiarEscritorio)
}
watch(() => props.maximizable, alCambiarEscritorio)
// Al cerrar vuelve a su tamaño; al abrir, ampliado de entrada si es portátil pequeño.
watch(() => props.show, async (visible) => {
  if (!visible) {
    maximizada.value = false
    return
  }
  if (!puedeMaximizar.value || !esPantallaPequena()) return
  // La card aún no está en el DOM: hay que esperar para ver si su cabecera sigue el patrón.
  await nextTick()
  if (!props.show) return
  detectarCabeceraCompacta()
  maximizada.value = true
}, { immediate: true })
onBeforeUnmount(() => consultaEscritorio?.removeEventListener?.('change', alCambiarEscritorio))

// La barra de Safari (iOS 15+) se dibuja abajo, encima del contenido, y no es safe-area.
// Se publica como `--tapado-inferior` en el contenedor iOS para que el pie de una hoja
// inferior la sume a su padding: `pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))]`.
// Fuera de iOS en Safari vale 0 y el CSS queda igual que siempre.
const { tapado } = useTapadoInferior()
</script>

<style scoped>
/* Modal para iOS/Safari: safe area, scroll que funciona, altura que quepa en pantalla */

.modal-wrapper-ios {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  min-height: 100vh !important;
  min-height: 100dvh !important;
  min-height: -webkit-fill-available !important;
  height: 100vh !important;
  height: 100dvh !important;
  height: -webkit-fill-available !important;
  margin: 0 !important;
  padding-top: env(safe-area-inset-top, 0) !important;
  padding-right: env(safe-area-inset-right, 0) !important;
  padding-bottom: env(safe-area-inset-bottom, 0) !important;
  padding-left: env(safe-area-inset-left, 0) !important;
  box-sizing: border-box;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.modal-wrapper-ios--bottom {
  justify-content: flex-end !important;
  /* La hoja va pegada al borde; la safe-area (y la barra de Safari) la pone su pie.
     Con el padding aquí además, se sumaba dos veces y quedaba una franja salvia debajo. */
  padding-bottom: 0 !important;
}

.modal-wrapper-ios--bottom .modal-wrapper-ios__card {
  border-radius: 1rem 1rem 0 0 !important;
  border-bottom: none !important;
}

.modal-wrapper-ios__backdrop {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  z-index: 0 !important;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.modal-wrapper-ios__backdrop--sage {
  background: var(--velo-modal) !important;
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
}

.modal-wrapper-ios__card {
  position: relative !important;
  z-index: 10 !important;
  width: 100% !important;
  max-width: var(--ancho-card, 28rem) !important;
  background: var(--superficie-tarjeta) !important;
  border-radius: 1rem 1rem 0 0 !important;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid var(--borde) !important;
  border-bottom: none !important;
  max-height: min(90dvh, calc(100dvh - env(safe-area-inset-top, 0) - env(safe-area-inset-bottom, 0) - 2rem)) !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  -webkit-overflow-scrolling: touch;
}

.modal-wrapper-ios:not(.modal-wrapper-ios--bottom) .modal-wrapper-ios__card {
  border-radius: 1rem !important;
  border-bottom: 1px solid var(--borde) !important;
}
/*
 * Ampliado en escritorio: la cabecera muestra su fila de móvil y oculta el bloque grande.
 * `:deep` porque la cabecera es contenido del slot (scope del padre). `!important` porque
 * `sm:hidden` / `sm:flex` de Tailwind aplican a este ancho.
 */
.modal-wrapper--ampliada > :deep(:first-child > .sm\:hidden) {
  display: flex !important;
}
.modal-wrapper--ampliada > :deep(:first-child > .hidden[class*="sm:"]) {
  display: none !important;
}
/* Deja sitio al botón de restaurar, que queda entre el título y la X. */
.modal-wrapper--ampliada > :deep(:first-child > .sm\:hidden > :first-child) {
  padding-right: 2.75rem;
}
</style>

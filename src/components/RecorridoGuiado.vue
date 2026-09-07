<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div
        v-if="show"
        class="recorrido-capa"
        :style="{ height: `${alto}px`, transform: `translateY(${desplazamiento}px)` }"
        role="dialog"
        aria-modal="true"
        :aria-label="`Recorrido guiado, paso ${indice + 1} de ${pasos.length}`"
      >
        <!-- Cuatro paneles en vez de un box-shadow gigante: el recorte queda exacto y
             Safari no tiene que pintar una sombra de 9999 px en cada reposicionamiento. -->
        <template v-if="marco">
          <div class="recorrido-velo" :style="{ top: '0px', left: '0px', right: '0px', height: `${marco.top}px` }" @click="siguiente" />
          <div class="recorrido-velo" :style="{ top: `${marco.bottom}px`, left: '0px', right: '0px', bottom: '0px' }" @click="siguiente" />
          <div class="recorrido-velo" :style="{ top: `${marco.top}px`, left: '0px', width: `${marco.left}px`, height: `${marco.height}px` }" @click="siguiente" />
          <div class="recorrido-velo" :style="{ top: `${marco.top}px`, left: `${marco.right}px`, right: '0px', height: `${marco.height}px` }" @click="siguiente" />

          <div
            class="recorrido-halo"
            :style="{ top: `${marco.top}px`, left: `${marco.left}px`, width: `${marco.width}px`, height: `${marco.height}px` }"
          />
        </template>
        <div v-else class="recorrido-velo recorrido-velo--completo" @click="siguiente" />

        <!-- Tarjeta -->
        <div ref="tarjetaRef" class="recorrido-tarjeta" :style="estiloTarjeta">
          <div class="flex items-start gap-3">
            <div
              v-if="pasoActual.icono"
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1B5E37]/10 text-[#1B5E37]"
            >
              <component :is="pasoActual.icono" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[0.6875rem] font-semibold uppercase tracking-wide text-[#1B5E37]">
                Paso {{ indice + 1 }} de {{ pasos.length }}
              </p>
              <h3 class="font-display text-base font-bold leading-tight text-gray-900">{{ pasoActual.titulo }}</h3>
            </div>
            <button
              type="button"
              class="-mr-2 -mt-1 flex h-10 w-10 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Cerrar el recorrido"
              @click="terminar"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <p v-if="pasoActual.texto" class="mt-2 text-sm leading-snug text-gray-600">{{ pasoActual.texto }}</p>

          <!-- Cuando lo que hay que explicar es un juego de opciones o de colores, unas
               etiquetas se leen de un vistazo y ahorran la frase que las describiría. -->
          <div v-if="pasoActual.pistas" class="mt-2.5 flex flex-wrap gap-1.5">
            <span
              v-for="pista in pasoActual.pistas"
              :key="pista.texto"
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="pista.clase"
            >
              {{ pista.texto }}
            </span>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-1.5" aria-hidden="true">
              <span
                v-for="(paso, i) in pasos"
                :key="i"
                class="h-1.5 rounded-full transition-all"
                :class="i === indice ? 'w-5 bg-[#1B5E37]' : 'w-1.5 bg-gray-300'"
              />
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="indice > 0"
                type="button"
                class="min-h-[44px] touch-manipulation rounded-xl px-3 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                @click="anterior"
              >
                Atrás
              </button>
              <button
                type="button"
                class="min-h-[44px] touch-manipulation rounded-xl bg-[#1B5E37] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#164a2c]"
                @click="siguiente"
              >
                {{ esUltimo ? 'Entendido' : 'Siguiente' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

/**
 * Recorrido guiado con foco sobre elementos reales de la pantalla.
 *
 * Cada paso apunta a un `selector` (normalmente `[data-tour="..."]`). Si el elemento no
 * existe —porque está oculto en ese tamaño de pantalla o aún no se ha renderizado—, el
 * paso se muestra centrado en vez de romperse.
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  /** [{ selector?, titulo, texto, icono?, margen? }] */
  pasos: { type: Array, required: true }
})

const emit = defineEmits(['close'])

const indice = ref(0)
const marco = ref(null)
const tarjetaRef = ref(null)
const medidaTarjeta = ref({ ancho: 340, alto: 200 })

/**
 * `position: fixed` en iOS se ancla al viewport de maquetación, no al visual: con la
 * barra de Safari o el teclado a la vista, la capa se desplaza. `visualViewport` da la
 * altura y el desfase reales (docs/compatibilidad-ios-safari.md §4).
 */
const alto = ref(typeof window !== 'undefined' ? window.innerHeight : 0)
const desplazamiento = ref(0)

const pasoActual = computed(() => props.pasos[indice.value] || { titulo: '', texto: '' })
const esUltimo = computed(() => indice.value >= props.pasos.length - 1)

const anchoViewport = () => window.visualViewport?.width || window.innerWidth

/**
 * Cuánto de la pantalla puede ocupar el recorte, como fracción del alto.
 *
 * Un objetivo más alto que esto no se puede enfocar entero, y en móvil son la mayoría:
 * una sección con tres tarjetas apiladas o una lista de movimientos miden más que la
 * pantalla. Recortarlas completas dejaba los cuatro paneles del velo a cero —nada
 * oscurecido, así que el foco no señalaba nada— y la tarjeta encima del propio recorte.
 * Pasado el límite se enfoca la banda superior del objetivo, que es donde están la
 * cabecera y las etiquetas que el paso va a nombrar, y el resto queda para la tarjeta.
 */
const PROPORCION_MAXIMA = 0.45

function medirViewport() {
  alto.value = window.visualViewport?.height || window.innerHeight
  desplazamiento.value = window.visualViewport?.offsetTop || 0
}

function limpiarMarco() {
  marco.value = null
}

function buscarObjetivo() {
  const selector = pasoActual.value.selector
  if (!selector) return null
  // El mismo `data-tour` suele estar dos veces —la versión móvil y la de escritorio—,
  // y la oculta mide 0×0. Hay que quedarse con la que de verdad está en pantalla.
  return [...document.querySelectorAll(selector)].find(el => el.getBoundingClientRect().width > 0) || null
}

/**
 * Recalcula el recorte sin mover la página. Es lo que escuchan los eventos: `situar`
 * no puede ir enganchado a `scroll` porque el propio `scrollIntoView` lo dispara y se
 * reentraría en bucle mientras dura la animación.
 */
async function remedir() {
  if (!props.show) return
  medirViewport()

  const objetivo = buscarObjetivo()
  if (!objetivo) return limpiarMarco()

  const rect = objetivo.getBoundingClientRect()
  const margen = pasoActual.value.margen ?? 8
  const top = Math.max(0, rect.top - margen)
  const left = Math.max(0, rect.left - margen)
  const right = Math.min(anchoViewport(), rect.right + margen)
  const bottom = Math.min(alto.value, rect.bottom + margen, top + Math.round(alto.value * PROPORCION_MAXIMA))
  marco.value = { top, left, right, bottom, width: right - left, height: bottom - top }

  await nextTick()
  medirTarjeta()
}

/** Va a un paso: acerca el elemento si hace falta y luego mide. */
async function situar() {
  if (!props.show) return
  medirViewport()

  const objetivo = buscarObjetivo()
  if (!objetivo) return limpiarMarco()

  const rect = objetivo.getBoundingClientRect()
  // Un objetivo alto se lleva al principio y no al centro: centrado, su cabecera queda
  // por encima del borde y el recorte acabaría enfocando su mitad, que no dice nada.
  const noCabe = rect.height > alto.value * PROPORCION_MAXIMA
  if (noCabe || rect.top < 0 || rect.bottom > alto.value) {
    objetivo.scrollIntoView({ block: noCabe ? 'start' : 'center', behavior: 'smooth' })
    await new Promise(resolve => setTimeout(resolve, 380))
  }

  await remedir()
}

function medirTarjeta() {
  if (!tarjetaRef.value) return
  const rect = tarjetaRef.value.getBoundingClientRect()
  medidaTarjeta.value = { ancho: rect.width, alto: rect.height }
}

/**
 * En móvil la tarjeta se ancla arriba o abajo —lo contrario de donde esté el foco—,
 * que es lo único que cabe con garantías. En pantallas anchas se coloca junto al
 * elemento, debajo si hay sitio y encima si no.
 */
const estiloTarjeta = computed(() => {
  const separacion = 14
  const borde = 16
  const anchoVista = typeof window !== 'undefined' ? anchoViewport() : 375
  const esAncha = anchoVista >= 640

  if (!marco.value) {
    return { left: '50%', top: '50%', transform: 'translate3d(-50%, -50%, 0)' }
  }

  if (!esAncha) {
    // No hace falta `useTapadoInferior`: la capa mide `visualViewport.height`, que ya
    // descuenta la barra de Safari. `env()` sigue haciendo falta para el home indicator
    // cuando la app corre instalada y no hay barra que descontar.
    const focoArriba = marco.value.bottom < alto.value * 0.55
    return focoArriba
      ? { left: `${borde}px`, right: `${borde}px`, bottom: `calc(${borde}px + env(safe-area-inset-bottom, 0px))` }
      : { left: `${borde}px`, right: `${borde}px`, top: `calc(${borde}px + env(safe-area-inset-top, 0px))` }
  }

  const { ancho, alto: altoTarjeta } = medidaTarjeta.value
  const cabeDebajo = marco.value.bottom + separacion + altoTarjeta <= alto.value - borde
  const top = cabeDebajo
    ? marco.value.bottom + separacion
    : Math.max(borde, marco.value.top - separacion - altoTarjeta)

  const centrado = marco.value.left + marco.value.width / 2 - ancho / 2
  const left = Math.min(Math.max(borde, centrado), anchoVista - ancho - borde)

  return { top: `${top}px`, left: `${left}px` }
})

const siguiente = () => {
  if (esUltimo.value) return terminar()
  indice.value += 1
}

const anterior = () => {
  if (indice.value > 0) indice.value -= 1
}

const terminar = () => emit('close')

const alTeclado = (evento) => {
  if (evento.key === 'Escape') return terminar()
  if (evento.key === 'ArrowRight') return siguiente()
  if (evento.key === 'ArrowLeft') return anterior()
}

let observador = null

function escuchar() {
  // `window.resize` no basta en iOS: el pinch-zoom y la barra de Safari mueven el
  // viewport visual sin dispararlo (docs/compatibilidad-ios-safari.md §4).
  window.addEventListener('resize', remedir)
  window.addEventListener('orientationchange', remedir)
  window.addEventListener('scroll', remedir, { passive: true })
  window.visualViewport?.addEventListener('resize', remedir)
  window.visualViewport?.addEventListener('scroll', remedir)
  document.addEventListener('keydown', alTeclado)
  // La página cambia de alto sola (avisos, paginación); sin esto el foco se queda atrás.
  observador = new ResizeObserver(remedir)
  observador.observe(document.body)
}

function dejarDeEscuchar() {
  window.removeEventListener('resize', remedir)
  window.removeEventListener('orientationchange', remedir)
  window.removeEventListener('scroll', remedir)
  window.visualViewport?.removeEventListener('resize', remedir)
  window.visualViewport?.removeEventListener('scroll', remedir)
  document.removeEventListener('keydown', alTeclado)
  observador?.disconnect()
  observador = null
}

watch(() => props.show, async (abierto) => {
  if (!abierto) {
    dejarDeEscuchar()
    limpiarMarco()
    return
  }
  indice.value = 0
  escuchar()
  await nextTick()
  situar()
})

watch(indice, situar)

onUnmounted(dejarDeEscuchar)
</script>

<style scoped>
.recorrido-capa {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 70;
  /* No se usa useBodyScrollLock a propósito: el recorrido necesita `scrollIntoView`, y
     `position: fixed` sobre el body lo inutiliza. Cortar el gesto aquí deja quieta la
     página sin impedir el desplazamiento programado (CLAUDE.md §1). */
  touch-action: none;
  overscroll-behavior: contain;
}

.recorrido-velo {
  position: absolute;
  background: rgba(17, 24, 39, 0.68);
}

.recorrido-velo--completo {
  inset: 0;
}

.recorrido-halo {
  position: absolute;
  pointer-events: none;
  border-radius: 0.85rem;
  box-shadow: 0 0 0 3px rgba(167, 243, 208, 0.95);
  transition: top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease;
}

.recorrido-tarjeta {
  position: absolute;
  z-index: 1;
  border-radius: 1rem;
  background: #fff;
  padding: 1rem 1.1rem 1.1rem;
  box-shadow: 0 18px 45px -12px rgba(15, 23, 42, 0.45);
  /* Fuerza capa de GPU: sin esto Safari deja rastro al reposicionar la tarjeta. */
  transform: translate3d(0, 0, 0);
}

@media (min-width: 640px) {
  .recorrido-tarjeta {
    width: 22rem;
  }
}

.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 0.18s ease;
}

.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
}
</style>

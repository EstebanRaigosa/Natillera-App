<template>
  <Teleport to="body">
    <Transition name="tour-fundido">
      <div v-if="activo" class="tour" role="dialog" aria-modal="true" :aria-label="`Guía: ${pasoActual?.titulo}`">
        <!--
          Capa de bloqueo. Mientras la guía habla de un control, ese control no
          se puede tocar: si alguien pulsa lo que se está explicando, navega a
          otra pantalla y el recorrido se queda señalando el vacío. Un toque
          fuera de la tarjeta avanza, que es lo que la gente intenta hacer.
        -->
        <div class="tour__bloqueo" @click="siguiente" />
        <!--
          Foco. Un único div con una sombra enorme recorta el resto de la
          pantalla: se anima moviendo el div, sin repintar cuatro paneles ni
          usar clip-path, que en Safari va a tirones al animarse.
        -->
        <div class="tour__foco" :class="{ 'tour__foco--centro': !recuadro }" :style="estiloFoco">
          <span class="tour__halo" aria-hidden="true" />
        </div>

        <!-- Progreso segmentado, estilo historia -->
        <div class="tour__progreso">
          <span
            v-for="(p, i) in pasos"
            :key="i"
            class="tour__segmento"
            :class="{ 'is-hecho': i < indice, 'is-actual': i === indice }"
          />
        </div>

        <!-- Tarjeta explicativa -->
        <div class="tour__tarjeta" :style="estiloTarjeta">
          <div class="tour__cabecera">
            <span class="tour__icono" aria-hidden="true">
              <component :is="pasoActual.icono" class="h-5 w-5" />
            </span>
            <div class="tour__cabecera-texto">
              <p class="tour__paso-num">Paso {{ indice + 1 }} de {{ pasos.length }}</p>
              <h2 class="tour__titulo">{{ pasoActual.titulo }}</h2>
            </div>
            <button type="button" class="tour__cerrar" aria-label="Cerrar la guía" @click="terminar(false)">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <p class="tour__texto">{{ pasoActual.texto }}</p>

          <div class="tour__acciones">
            <button v-if="indice > 0" type="button" class="tour__btn tour__btn--fantasma" @click="ir(indice - 1)">
              Atrás
            </button>
            <button v-else type="button" class="tour__btn tour__btn--fantasma" @click="terminar(false)">
              Saltar
            </button>

            <button type="button" class="tour__btn tour__btn--principal" @click="siguiente">
              {{ esUltimo ? '¡Entendido!' : 'Siguiente' }}
              <ArrowRightIcon v-if="!esUltimo" class="ml-1.5 h-4 w-4" />
              <CheckIcon v-else class="ml-1.5 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * Recorrido guiado propio.
 *
 * No usa driver.js a propósito: los recorridos que ya tiene la app son suyos y
 * se parecen todos entre sí. Este busca otra cosa —progreso tipo historia, un
 * foco que se desplaza de un sitio a otro, tarjeta que se coloca sola— y sobre
 * todo da el control fino que hace falta para iOS.
 *
 * Reglas del manual (docs/compatibilidad-ios-safari.md) que condicionan el diseño:
 *   §7  Teleport a body: un ancestro con `transform` rompería el `fixed`.
 *   §8  Sin backdrop-filter: caro en iOS y aquí no aporta nada.
 *   §10 `prefers-reduced-motion` respetado; keyframes con prefijo -webkit-.
 *   §4  Safe-area arriba y abajo.
 *   §6  44 px de área táctil y `pointer-events: none` en los hijos de botón.
 *   §15.11 Listeners y requestAnimationFrame cancelados al desmontar.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  /** [{ selector, titulo, texto, icono }] — sin `selector`, el paso va centrado */
  pasos: { type: Array, required: true },
  activo: { type: Boolean, default: false },
})

const emit = defineEmits(['terminar'])

const indice = ref(0)
const recuadro = ref(null)
const alto = ref(0)

const pasoActual = computed(() => props.pasos[indice.value] ?? {})
const esUltimo = computed(() => indice.value === props.pasos.length - 1)

const MARGEN = 10
const ALTO_TARJETA = 210

const estiloFoco = computed(() => {
  if (!recuadro.value) return {}
  const r = recuadro.value
  return {
    top: `${r.top - MARGEN}px`,
    left: `${r.left - MARGEN}px`,
    width: `${r.width + MARGEN * 2}px`,
    height: `${r.height + MARGEN * 2}px`,
  }
})

/** La tarjeta se coloca donde quepa: debajo del elemento, o encima si no cabe. */
const estiloTarjeta = computed(() => {
  if (!recuadro.value) return { bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }
  const r = recuadro.value
  const espacioAbajo = alto.value - (r.top + r.height)
  return espacioAbajo > ALTO_TARJETA + 24
    ? { top: `${Math.round(r.top + r.height + MARGEN + 14)}px` }
    : { bottom: `${Math.round(Math.max(16, alto.value - r.top + MARGEN + 14))}px` }
})

let raf = null

function medir() {
  alto.value = window.innerHeight

  const sel = pasoActual.value?.selector
  if (!sel) { recuadro.value = null; return }

  const el = document.querySelector(sel)
  if (!el) { recuadro.value = null; return }

  const r = el.getBoundingClientRect()
  // Alto 0 significa que el selector ya no encaja con nada visible: mejor
  // centrar el paso que dibujar un foco diminuto en una esquina.
  recuadro.value = r.height > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null
}

function programarMedida() {
  if (raf != null) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => { raf = null; medir() })
}

const movimientoReducido = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true

/**
 * Trae el elemento a la vista antes de medirlo; si no, se enfocaría el vacío.
 *
 * Un paso puede además necesitar preparar la pantalla —abrir el menú lateral,
 * por ejemplo— antes de que su objetivo exista siquiera. De eso se encargan
 * `antes()` y `despues()`, opcionales en cada paso.
 */
async function irAlPaso() {
  if (pasoActual.value?.antes) {
    await pasoActual.value.antes()
    // Un respiro para que lo que se acaba de abrir termine su animación.
    await new Promise((r) => setTimeout(r, 320))
  }

  const sel = pasoActual.value?.selector
  if (sel) {
    const el = document.querySelector(sel)
    if (el) {
      const reducido = movimientoReducido()
      el.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' })
      await new Promise((r) => setTimeout(r, reducido ? 0 : 420))
    }
  }
  medir()
}

async function ir(i) {
  const destino = props.pasos[Math.max(0, Math.min(props.pasos.length - 1, i))]
  const saliendo = pasoActual.value

  /*
   * Deshacer lo que preparó el paso que se abandona (cerrar el cajón, etc.),
   * salvo que el paso al que vamos necesite exactamente lo mismo: cerrar el
   * menú para volver a abrirlo al instante da un parpadeo feo y gratuito.
   */
  if (saliendo?.despues && destino?.antes !== saliendo?.antes) {
    await saliendo.despues()
  }

  indice.value = Math.max(0, Math.min(props.pasos.length - 1, i))
  irAlPaso()
}

function siguiente() {
  if (esUltimo.value) terminar(true)
  else ir(indice.value + 1)
}

async function terminar(completado) {
  await pasoActual.value?.despues?.()
  emit('terminar', { completado })
}

function alTeclado(e) {
  if (!props.activo) return
  if (e.key === 'Escape') terminar(false)
  else if (e.key === 'ArrowRight') siguiente()
  else if (e.key === 'ArrowLeft') ir(indice.value - 1)
}

watch(() => props.activo, (encendido) => {
  if (!encendido) return
  indice.value = 0
  irAlPaso()
})

onMounted(() => {
  window.addEventListener('resize', programarMedida)
  window.addEventListener('scroll', programarMedida, { passive: true })
  window.addEventListener('keydown', alTeclado)
  if (props.activo) irAlPaso()
})

onBeforeUnmount(() => {
  if (raf != null) cancelAnimationFrame(raf)
  window.removeEventListener('resize', programarMedida)
  window.removeEventListener('scroll', programarMedida)
  window.removeEventListener('keydown', alTeclado)
})
</script>

<style scoped>
.tour {
  position: fixed;
  inset: 0;
  z-index: 90;
  /* Cada capa decide si captura: el bloqueo y la tarjeta sí, el foco no. */
  pointer-events: none;
}

/* Ocupa toda la pantalla por debajo del foco y de la tarjeta: nada de lo que
   hay detrás recibe un solo toque mientras la guía está abierta. */
.tour__bloqueo {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  cursor: pointer;
  /* Sin fondo: el oscurecido lo pone la sombra del foco. */
}

/* ── Foco ─────────────────────────────────────────────── */
.tour__foco {
  position: absolute;
  border-radius: 1rem;
  box-shadow: 0 0 0 9999px rgba(11, 26, 18, 0.78);
  outline: 2px solid rgba(255, 255, 255, 0.9);
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  transition:
    top 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    left 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Paso sin elemento concreto: se oscurece todo y manda la tarjeta. */
.tour__foco--centro {
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.tour__halo {
  position: absolute;
  inset: -3px;
  border-radius: 1.15rem;
  border: 2px solid rgba(255, 255, 255, 0.55);
  animation: tour-halo 2s ease-out infinite;
}

@keyframes tour-halo {
  0%   { transform: scale(1);     opacity: 0.75; }
  70%  { transform: scale(1.045); opacity: 0; }
  100% { transform: scale(1.045); opacity: 0; }
}

@-webkit-keyframes tour-halo {
  0%   { -webkit-transform: scale(1);     opacity: 0.75; }
  70%  { -webkit-transform: scale(1.045); opacity: 0; }
  100% { -webkit-transform: scale(1.045); opacity: 0; }
}

/* ── Progreso tipo historia ───────────────────────────── */
.tour__progreso {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 4px;
  padding: max(0.75rem, env(safe-area-inset-top)) 12px 4px;
}

.tour__segmento {
  flex: 1;
  height: 3px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.28);
  transition: background 0.3s ease;
}

.tour__segmento.is-hecho { background: rgba(255, 255, 255, 0.75); }
.tour__segmento.is-actual { background: #6ee7a8; }

/* ── Tarjeta ──────────────────────────────────────────── */
.tour__tarjeta {
  position: absolute;
  left: 50%;
  width: min(calc(100vw - 2rem), 24rem);
  transform: translate3d(-50%, 0, 0);
  padding: 1rem 1.1rem 1.1rem;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 24px 48px -20px rgba(0, 0, 0, 0.55), 0 4px 12px -6px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  transition: top 0.45s cubic-bezier(0.22, 1, 0.36, 1), bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.tour__cabecera {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.tour__cabecera-texto {
  min-width: 0;
  flex: 1;
}

.tour__icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: #e8f5e9;
  color: #1b5e37;
}

.tour__paso-num {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7280;
}

.tour__titulo {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
  color: #111827;
}

.tour__cerrar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin: -0.5rem -0.5rem 0 0;
  flex-shrink: 0;
  border-radius: 9999px;
  color: #9ca3af;
  touch-action: manipulation;
}

.tour__cerrar:hover { background: #f3f4f6; color: #4b5563; }
.tour__cerrar > * { pointer-events: none; }

.tour__texto {
  margin-top: 0.6rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: #4b5563;
}

.tour__acciones {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

.tour__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  flex: 1;
  padding: 0 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  touch-action: manipulation;
  transition: background 0.2s ease, transform 0.1s ease;
}

.tour__btn > * { pointer-events: none; }
.tour__btn:active { transform: translateY(1px); }

.tour__btn--principal {
  background: #1b5e37;
  color: #fff;
  box-shadow: 0 6px 16px -6px rgba(27, 94, 55, 0.6);
}

.tour__btn--principal:hover { background: #155a32; }

.tour__btn--fantasma {
  background: #fff;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  flex: 0 0 auto;
  min-width: 6rem;
}

.tour__btn--fantasma:hover { background: #f9fafb; }

/* ── Entrada / salida ─────────────────────────────────── */
.tour-fundido-enter-active,
.tour-fundido-leave-active { transition: opacity 0.3s ease; }

.tour-fundido-enter-from,
.tour-fundido-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .tour__foco,
  .tour__tarjeta,
  .tour-fundido-enter-active,
  .tour-fundido-leave-active { transition: none; }
  .tour__halo { animation: none; }
}
</style>

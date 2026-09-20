<template>
  <!-- Patrón de la skill natillerapp-modals: ModalWrapper + cabecera marca compacta +
       cuerpo scrolleable + acciones al final. `persistent`: es un anuncio, se cierra con
       su botón; tocar fuera por accidente se lo saltaría sin haberlo leído.
       Con natiscroll: con cinco novedades el cuerpo desborda en pantallas pequeñas. -->
  <ModalWrapper
    :show="show"
    :z-index="50"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="$emit('cerrar')"
  >
    <!--
      Cabecera. Degradado en diagonal + dos manchas de luz que se mueven despacio,
      partículas que titilan y un confeti que estalla desde el icono al abrir.
      Todo lo que se repite anima SOLO `transform`/`opacity` (barato en GPU); el
      desenfoque de las auroras es fijo, que animarlo es lo que ahoga a Safari.
    -->
    <div class="novedad__cabecera relative w-full flex-shrink-0 overflow-hidden text-white">
      <span class="novedad__aurora novedad__aurora--a" aria-hidden="true" />
      <span class="novedad__aurora novedad__aurora--b" aria-hidden="true" />

      <!-- Partículas: puntos con brillo, no caracteres de texto -->
      <span
        v-for="chispa in CHISPAS"
        :key="`ch-${chispa.n}`"
        class="novedad__chispa"
        :style="chispa.estilo"
        aria-hidden="true"
      />

      <span class="novedad__destello" aria-hidden="true" />

      <!-- Móvil: una fila (icono + textos + X) -->
      <div
        class="relative sm:hidden flex min-h-[4.6rem] items-center gap-3 pb-3.5 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.875rem,env(safe-area-inset-top))]"
      >
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <span class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
            <span class="novedad__halo" aria-hidden="true" />
            <span class="novedad__halo novedad__halo--tardio" aria-hidden="true" />
            <span class="novedad__icono relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
              <SparklesIcon class="h-5 w-5 text-white" />
            </span>
            <span v-if="show" class="pointer-events-none absolute inset-0" aria-hidden="true">
              <i v-for="(estilo, n) in CONFETI" :key="`cf-${n}`" class="novedad__confeti" :style="estilo" />
            </span>
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="novedad__titulo font-display text-base font-bold leading-tight tracking-[-0.01em]">
              Nos pusimos guapos
            </h3>
            <p class="novedad__subtitulo mt-0.5 truncate text-[0.6875rem] text-white/85">
              Tu natillera, con cara nueva
            </p>
          </div>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
          aria-label="Cerrar"
          @click="$emit('cerrar')"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Desktop: icono arriba, textos centrados, X en flex (sin `absolute`: iOS) -->
      <div class="relative hidden w-full items-start px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:flex">
        <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <span class="relative flex h-[3.2rem] w-[3.2rem] items-center justify-center">
            <span class="novedad__halo" aria-hidden="true" />
            <span class="novedad__halo novedad__halo--tardio" aria-hidden="true" />
            <span class="novedad__icono relative flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-[0_3px_14px_rgba(0,0,0,0.2)]">
              <SparklesIcon class="h-6 w-6 text-white" />
            </span>
            <span v-if="show" class="pointer-events-none absolute inset-0" aria-hidden="true">
              <i v-for="(estilo, n) in CONFETI" :key="`cfd-${n}`" class="novedad__confeti" :style="estilo" />
            </span>
          </span>
          <h3 class="novedad__titulo mt-3.5 font-display text-lg font-bold leading-tight tracking-[-0.01em]">
            Nos pusimos guapos
          </h3>
          <p class="novedad__subtitulo mt-1 text-xs text-white/85">Tu natillera, con cara nueva</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
          aria-label="Cerrar"
          @click="$emit('cerrar')"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Cuerpo + natiscroll. Con cinco novedades el cuerpo desborda en pantallas
         pequeñas (iPhone SE), así que el velo y el «Desliza para ver más» son
         obligatorios: en Safari avisan de que la ventana se puede deslizar. -->
    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <div
      ref="areaScroll"
      class="novedad__cuerpo flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white px-5 pb-2 pt-5 [-webkit-overflow-scrolling:touch]"
      @scroll.passive="programarNatiscroll"
    >
      <p class="novedad__fila text-center text-sm leading-relaxed text-gray-600" :style="{ '--n': -1 }">
        Le cambiamos el diseño a la app.<br class="hidden sm:block" />
        Está todo donde estaba, pero se ve —y se usa— mucho mejor.
      </p>

      <!--
        Rejilla 2×2 en vez de la lista de filas: cuatro piezas del mismo peso se
        leen mejor en cuadrícula que en columna, y deja de parecer un changelog.
        El texto va corto a propósito — en un iPhone SE dos columnas no perdonan.
      -->
      <ul class="novedad__rejilla mt-5 grid grid-cols-2 gap-2.5">
        <li
          v-for="(novedad, n) in NOVEDADES"
          :key="novedad.titulo"
          class="novedad__tarjeta relative flex flex-col items-center overflow-hidden rounded-2xl border border-gray-100 bg-white px-3 pb-3.5 pt-4 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_26px_-16px_rgba(16,24,40,0.22)]"
          :style="{ '--n': n }"
        >
          <span class="novedad__brillo" aria-hidden="true" />
          <span
            class="novedad__chip relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm"
            :class="novedad.chip"
          >
            <component :is="novedad.icono" class="h-6 w-6 text-white" />
          </span>
          <span class="relative mt-2.5 block font-display text-[0.8125rem] font-bold leading-tight text-gray-900">
            {{ novedad.titulo }}
          </span>
          <span class="relative mt-1 block text-[0.6875rem] leading-snug text-gray-500">
            {{ novedad.texto }}
          </span>
        </li>
      </ul>

      <p
        class="novedad__fila mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#1B5E37]/12 bg-gradient-to-br from-[#E8F5E9] to-[#F3FAF4] px-3 py-3 text-center text-xs leading-snug text-[#1B5E37]"
        :style="{ '--n': NOVEDADES.length }"
      >
        <ShieldCheckIcon class="h-4 w-4 flex-shrink-0" />
        <span>Tus datos siguen igualitos: no se movió ni un peso.</span>
      </p>
    </div>

      <div v-show="hayNatiscroll" class="pointer-events-none absolute inset-x-0 bottom-0 z-10" aria-hidden="true">
        <div class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent" />
        <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
          <span class="novedad__hint rounded-full bg-white/90 px-3 py-1 font-display text-[0.6875rem] font-semibold text-[#1B5E37] shadow-sm">
            Desliza para ver más
          </span>
        </div>
      </div>
    </div>

    <!-- Acciones. Safe-area abajo; `useTapadoInferior` no hace falta porque el botón no
         está anclado con `fixed`: vive al final de la card (manual iOS §4.1). -->
    <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button type="button" class="novedad__cta btn-modal-primary w-full" @click="$emit('cerrar')">
        Ver qué cambió
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import {
  SparklesIcon,
  XMarkIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  MapIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import ModalWrapper from './ModalWrapper.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'

const props = defineProps({
  show: { type: Boolean, default: false }
})

defineEmits(['cerrar'])

useBodyScrollLock(computed(() => props.show))

/*
 * Natiscroll: velo + «Desliza para ver más» mientras quede contenido por ver. La medida
 * va dentro de un `requestAnimationFrame` para no trabajar en cada evento de scroll
 * táctil, y el frame pendiente se cancela al cerrar y al desmontar.
 */
const areaScroll = ref(null)
const hayNatiscroll = ref(false)
let rafNatiscroll = null

function actualizarNatiscroll() {
  const el = areaScroll.value
  if (!el) {
    hayNatiscroll.value = false
    return
  }
  const umbral = 10
  hayNatiscroll.value = el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}

function programarNatiscroll() {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = requestAnimationFrame(() => {
    rafNatiscroll = null
    actualizarNatiscroll()
  })
}

function soltarNatiscroll() {
  if (rafNatiscroll == null) return
  cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = null
}

watch(() => props.show, async (abierto) => {
  if (!abierto) {
    soltarNatiscroll()
    hayNatiscroll.value = false
    return
  }
  // Dos ticks: la card se monta y las filas entran; medir antes daría una altura que
  // deja de valer en cuanto termina la cascada.
  await nextTick()
  await nextTick()
  programarNatiscroll()
})

onUnmounted(soltarNatiscroll)

/*
 * Confeti que estalla desde el icono, con el mismo patrón que el final de los
 * recorridos (`RecorridoInteractivo.vue`): radios y giros repartidos en círculo.
 * Distancias cortas a propósito — la cabecera recorta, y aquí queremos un estallido
 * contenido dentro del banner, no papelitos por toda la pantalla.
 */
const COLORES_CONFETI = ['#34d399', '#90D15B', '#F58231', '#facc15', '#E91E63', '#ffffff']
const CONFETI = Array.from({ length: 18 }, (_, i) => {
  const angulo = (i / 18) * Math.PI * 2
  const distancia = 42 + ((i * 29) % 34)
  return {
    background: COLORES_CONFETI[i % COLORES_CONFETI.length],
    '--dx': `${Math.round(Math.cos(angulo) * distancia * 1.9)}px`,
    '--dy': `${Math.round(Math.sin(angulo) * distancia)}px`,
    '--giro': `${(i * 53) % 360}deg`,
    '--retraso': `${380 + (i % 6) * 40}ms`
  }
})

/* Puntos que titilan en bucle lento y desacompasado: dan vida sin pedir atención. */
const CHISPAS = Array.from({ length: 9 }, (_, i) => ({
  n: i,
  estilo: {
    top: `${8 + ((i * 37) % 78)}%`,
    left: `${5 + ((i * 53) % 88)}%`,
    '--escala': `${0.5 + ((i * 17) % 10) / 14}`,
    '--dur': `${2600 + ((i * 311) % 1900)}ms`,
    '--retraso': `${(i * 240) % 2200}ms`
  }
}))

/* Cuatro y no más: es un aviso, no un changelog. */
const NOVEDADES = [
  {
    icono: Squares2X2Icon,
    chip: 'from-emerald-500 to-emerald-600',
    acento: 'bg-emerald-400',
    titulo: 'Se lee de un vistazo',
    texto: 'Cifras grandes y cada dato donde lo buscas.'
  },
  {
    icono: MapIcon,
    chip: 'from-teal-500 to-teal-600',
    acento: 'bg-teal-400',
    titulo: 'Recorridos guiados',
    texto: 'Cada pantalla te explica qué es cada cosa.'
  },
  {
    icono: BoltIcon,
    chip: 'from-violet-500 to-violet-600',
    acento: 'bg-violet-400',
    titulo: 'Más rápida y con vida',
    texto: 'Abre al toque y se mueve suave.'
  },
  {
    icono: ChatBubbleLeftRightIcon,
    chip: 'from-sky-500 to-sky-600',
    acento: 'bg-sky-400',
    titulo: 'Chat de soporte',
    texto: 'Escríbenos si algo no te cuadra.'
  }
]
</script>

<style scoped>
/*
 * Dos familias de animación:
 *   · ENTRADA — una pasada, cuentan la llegada de cada pieza.
 *   · AMBIENTE — bucles lentos (auroras, chispas, brillo del icono) que dan vida.
 *     Todos animan solo `transform`/`opacity`, nunca el desenfoque ni el color, que
 *     es lo que dispara el coste en Safari.
 * `prefers-reduced-motion` apaga las dos y deja todo en su estado final.
 */

.novedad__cabecera {
  background-image: linear-gradient(135deg, #0E3D24 0%, #1B5E37 48%, #2E7D52 100%);
}

/* ── Ambiente: auroras que derivan despacio ─────────────────────────────── */
.novedad__aurora {
  position: absolute;
  border-radius: 9999px;
  filter: blur(26px);
  -webkit-filter: blur(26px);
  pointer-events: none;
  will-change: transform;
}

.novedad__aurora--a {
  top: -38%;
  left: -12%;
  width: 62%;
  height: 170%;
  background: rgba(93, 222, 152, 0.34);
  -webkit-animation: novedad-entrada-aurora 1500ms cubic-bezier(0.22, 1, 0.36, 1) both,
                     novedad-deriva-a 15s ease-in-out 1500ms infinite;
  animation: novedad-entrada-aurora 1500ms cubic-bezier(0.22, 1, 0.36, 1) both,
             novedad-deriva-a 15s ease-in-out 1500ms infinite;
}

.novedad__aurora--b {
  top: -55%;
  right: -16%;
  width: 55%;
  height: 185%;
  background: rgba(154, 246, 199, 0.22);
  -webkit-animation: novedad-entrada-aurora 1500ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both,
                     novedad-deriva-b 18s ease-in-out 1660ms infinite;
  animation: novedad-entrada-aurora 1500ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both,
             novedad-deriva-b 18s ease-in-out 1660ms infinite;
}

/* ── Ambiente: partículas que titilan ──────────────────────────────────── */
.novedad__chispa {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.75);
  opacity: 0;
  pointer-events: none;
  -webkit-animation: novedad-titileo var(--dur) ease-in-out var(--retraso) infinite;
  animation: novedad-titileo var(--dur) ease-in-out var(--retraso) infinite;
}

/* ── Entrada: halos del icono, dos anillos escalonados ─────────────────── */
.novedad__halo {
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
  -webkit-animation: novedad-halo 1400ms cubic-bezier(0.22, 1, 0.36, 1) 320ms both;
  animation: novedad-halo 1400ms cubic-bezier(0.22, 1, 0.36, 1) 320ms both;
}

.novedad__halo--tardio {
  border-color: rgba(255, 255, 255, 0.32);
  -webkit-animation-delay: 620ms;
  animation-delay: 620ms;
}

/* Entrada con rebote y, después, una flotación muy corta que nunca para. */
.novedad__icono {
  -webkit-animation: novedad-icono 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
                     novedad-flotar 4.5s ease-in-out 900ms infinite;
  animation: novedad-icono 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
             novedad-flotar 4.5s ease-in-out 900ms infinite;
}

/* ── Entrada: confeti desde el icono ───────────────────────────────────── */
.novedad__confeti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 9px;
  margin: -4px 0 0 -3px;
  border-radius: 2px;
  opacity: 0;
  pointer-events: none;
  -webkit-animation: novedad-confeti 1300ms cubic-bezier(0.15, 0.8, 0.35, 1) var(--retraso) both;
  animation: novedad-confeti 1300ms cubic-bezier(0.15, 0.8, 0.35, 1) var(--retraso) both;
}

/* ── Entrada: títulos ──────────────────────────────────────────────────── */
.novedad__titulo {
  -webkit-animation: novedad-texto 620ms cubic-bezier(0.22, 1, 0.36, 1) 220ms both;
  animation: novedad-texto 620ms cubic-bezier(0.22, 1, 0.36, 1) 220ms both;
}

.novedad__subtitulo {
  -webkit-animation: novedad-texto 620ms cubic-bezier(0.22, 1, 0.36, 1) 330ms both;
  animation: novedad-texto 620ms cubic-bezier(0.22, 1, 0.36, 1) 330ms both;
}

/* Barrido de luz sobre la cabecera: una pasada fuerte al abrir y, luego, un
   repaso muy suave de vez en cuando para que el banner no quede muerto. */
.novedad__destello {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 55%;
  background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  pointer-events: none;
  -webkit-animation: novedad-destello 1400ms ease-out 260ms both,
                     novedad-destello-suave 9s ease-in-out 2600ms infinite;
  animation: novedad-destello 1400ms ease-out 260ms both,
             novedad-destello-suave 9s ease-in-out 2600ms infinite;
}

/* ── Entrada: cuerpo ───────────────────────────────────────────────────── */
.novedad__rejilla {
  -webkit-perspective: 900px;
  perspective: 900px;
}

/* Reflejo diagonal que cruza cada baldosa una vez, escalonado con su entrada. */
.novedad__brillo {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -70%;
  width: 60%;
  background: linear-gradient(100deg, transparent 0%, rgba(27, 94, 55, 0.07) 50%, transparent 100%);
  pointer-events: none;
  -webkit-animation: novedad-brillo 1100ms ease-out both;
  animation: novedad-brillo 1100ms ease-out both;
  -webkit-animation-delay: calc(760ms + var(--n) * 115ms);
  animation-delay: calc(760ms + var(--n) * 115ms);
}

.novedad__fila {
  -webkit-animation: novedad-fila 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation: novedad-fila 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
  -webkit-animation-delay: calc(300ms + (var(--n) + 1) * 105ms);
  animation-delay: calc(300ms + (var(--n) + 1) * 105ms);
}

/* La tarjeta cae girando sobre su eje X; el chip entra un pelín después, con
   rebote, para que el icono «aterrice» dentro de la tarjeta ya puesta. */
.novedad__tarjeta {
  -webkit-animation: novedad-tarjeta 640ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation: novedad-tarjeta 640ms cubic-bezier(0.22, 1, 0.36, 1) both;
  -webkit-animation-delay: calc(420ms + var(--n) * 115ms);
  animation-delay: calc(420ms + var(--n) * 115ms);
}

.novedad__chip {
  -webkit-animation: novedad-chip 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation: novedad-chip 620ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  -webkit-animation-delay: calc(560ms + var(--n) * 115ms);
  animation-delay: calc(560ms + var(--n) * 115ms);
}

.novedad__cta {
  -webkit-animation: novedad-cta 680ms cubic-bezier(0.34, 1.56, 0.64, 1) 980ms both;
  animation: novedad-cta 680ms cubic-bezier(0.34, 1.56, 0.64, 1) 980ms both;
}

.novedad__hint {
  -webkit-animation: novedad-flotar 2.8s ease-in-out infinite;
  animation: novedad-flotar 2.8s ease-in-out infinite;
}

/* ── Keyframes ─────────────────────────────────────────────────────────── */

@keyframes novedad-entrada-aurora {
  0% { opacity: 0; transform: translate3d(0, 14px, 0) scale(0.82); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes novedad-deriva-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(14%, 6%, 0) scale(1.12); }
}

@keyframes novedad-deriva-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-12%, -7%, 0) scale(1.15); }
}

@keyframes novedad-titileo {
  0%, 100% { opacity: 0; transform: translate3d(0, 0, 0) scale(calc(var(--escala) * 0.4)); }
  45%, 60% { opacity: 0.9; transform: translate3d(0, 0, 0) scale(var(--escala)); }
}

@keyframes novedad-halo {
  0% { opacity: 0.85; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(0, 0, 0) scale(1.9); }
}

@keyframes novedad-icono {
  0% { transform: translate3d(0, 0, 0) scale(0.4) rotate(-25deg); opacity: 0; }
  100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 1; }
}

@keyframes novedad-flotar {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -3px, 0); }
}

@keyframes novedad-confeti {
  0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--giro)); }
}

@keyframes novedad-texto {
  0% { opacity: 0; transform: translate3d(0, 10px, 0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); }
}

@keyframes novedad-destello {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(320%, 0, 0); }
}

/* Repaso de ambiente: casi todo el ciclo está fuera de cuadro y en reposo. */
@keyframes novedad-destello-suave {
  0% { transform: translate3d(0, 0, 0); opacity: 0.55; }
  22% { transform: translate3d(320%, 0, 0); opacity: 0.55; }
  22.01%, 100% { transform: translate3d(0, 0, 0); opacity: 0; }
}

@keyframes novedad-fila {
  0% { opacity: 0; transform: translate3d(0, 16px, 0) scale(0.97); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes novedad-tarjeta {
  0% { opacity: 0; transform: translate3d(0, 18px, 0) rotateX(-18deg) scale(0.9); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: translate3d(0, 0, 0) rotateX(0deg) scale(1); }
}

@keyframes novedad-brillo {
  0% { transform: translate3d(0, 0, 0); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translate3d(320%, 0, 0); opacity: 0; }
}

@keyframes novedad-chip {
  0% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.3) rotate(-30deg); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
}

@keyframes novedad-cta {
  0% { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.96); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .novedad__aurora,
  .novedad__chispa,
  .novedad__halo,
  .novedad__icono,
  .novedad__confeti,
  .novedad__titulo,
  .novedad__subtitulo,
  .novedad__destello,
  .novedad__brillo,
  .novedad__fila,
  .novedad__tarjeta,
  .novedad__chip,
  .novedad__cta,
  .novedad__hint {
    -webkit-animation: none !important;
    animation: none !important;
  }

  /* Sin animación, lo que tiene contenido no puede quedarse en su estado
     inicial (invisible o girado): se fuerza el estado final. */
  .novedad__aurora,
  .novedad__icono,
  .novedad__titulo,
  .novedad__subtitulo,
  .novedad__fila,
  .novedad__tarjeta,
  .novedad__chip,
  .novedad__cta {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }

  /* Lo puramente decorativo sí desaparece: sin movimiento no aporta nada. */
  .novedad__destello,
  .novedad__halo,
  .novedad__chispa,
  .novedad__brillo,
  .novedad__confeti {
    display: none;
  }
}

</style>

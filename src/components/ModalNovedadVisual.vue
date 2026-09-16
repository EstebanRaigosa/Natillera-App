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
    <!-- Cabecera marca. El destello la recorre una vez al abrir: dice «esto es nuevo»
         sin una palabra más. -->
    <div class="novedad__cabecera relative w-full flex-shrink-0 overflow-hidden bg-[#1B5E37] text-white">
      <span class="novedad__destello" aria-hidden="true" />
      <span v-for="n in 6" :key="n" class="novedad__chispa" :style="{ '--n': n }" aria-hidden="true">✦</span>

      <!-- Móvil: una fila (icono + textos + X) -->
      <div
        class="relative sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <div class="novedad__icono flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
            <SparklesIcon class="h-5 w-5 text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-display text-base font-bold leading-tight">Nos pusimos guapos</h3>
            <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Tu natillera, con cara nueva</p>
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
      <div class="relative hidden w-full items-start px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:flex">
        <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="novedad__icono flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-xl border border-white/25 bg-white/15">
            <SparklesIcon class="h-6 w-6 text-white" />
          </div>
          <h3 class="mt-3 font-display text-lg font-bold">Nos pusimos guapos</h3>
          <p class="mt-1 text-xs text-white/90">Tu natillera, con cara nueva</p>
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
      class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white px-5 pb-2 pt-5 [-webkit-overflow-scrolling:touch]"
      @scroll.passive="programarNatiscroll"
    >
      <p class="text-sm leading-relaxed text-gray-600">
        Le cambiamos el diseño a la app. Está todo donde estaba, pero se ve —y se usa— mucho mejor.
      </p>

      <ul class="mt-4 space-y-2.5">
        <li
          v-for="(novedad, n) in NOVEDADES"
          :key="novedad.titulo"
          class="novedad__fila flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3"
          :style="{ '--n': n }"
        >
          <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" :class="novedad.fondo">
            <component :is="novedad.icono" class="h-5 w-5" :class="novedad.color" />
          </span>
          <span class="min-w-0">
            <span class="block font-display text-sm font-bold text-gray-900">{{ novedad.titulo }}</span>
            <span class="mt-0.5 block text-xs leading-snug text-gray-600">{{ novedad.texto }}</span>
          </span>
        </li>
      </ul>

      <p class="novedad__fila mt-4 rounded-2xl bg-[#E8F5E9] p-3 text-xs leading-snug text-[#1B5E37]" :style="{ '--n': NOVEDADES.length }">
        Tus datos siguen igualitos: no se movió ni un peso.
      </p>
    </div>

      <div v-show="hayNatiscroll" class="pointer-events-none absolute inset-x-0 bottom-0 z-10" aria-hidden="true">
        <div class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent" />
        <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
          <span class="rounded-full bg-white/90 px-3 py-1 font-display text-[0.6875rem] font-semibold text-[#1B5E37] shadow-sm">
            Desliza para ver más
          </span>
        </div>
      </div>
    </div>

    <!-- Acciones. Safe-area abajo; `useTapadoInferior` no hace falta porque el botón no
         está anclado con `fixed`: vive al final de la card (manual iOS §4.1). -->
    <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button type="button" class="btn-modal-primary w-full" @click="$emit('cerrar')">
        Ver qué cambió
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import {
  SparklesIcon,
  XMarkIcon,
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

/* Cuatro y no más: es un aviso, no un changelog. */
const NOVEDADES = [
  {
    icono: Squares2X2Icon,
    fondo: 'bg-emerald-100',
    color: 'text-emerald-700',
    titulo: 'Se lee de un vistazo',
    texto: 'Cifras grandes, tarjetas limpias y cada dato donde lo buscas.'
  },
  {
    icono: MapIcon,
    fondo: 'bg-teal-100',
    color: 'text-teal-700',
    titulo: 'Recorridos guiados',
    texto: 'Cada pantalla te explica sola qué es cada cosa.'
  },
  {
    icono: BoltIcon,
    fondo: 'bg-violet-100',
    color: 'text-violet-700',
    titulo: 'Más rápida y con vida',
    texto: 'Abre al toque y todo se mueve suave.'
  },
  {
    icono: ChatBubbleLeftRightIcon,
    fondo: 'bg-sky-100',
    color: 'text-sky-700',
    titulo: 'Chat de soporte',
    texto: 'Escríbenos desde la app si algo no te cuadra.'
  }
]
</script>

<style scoped>
/* Todas las animaciones son de entrada y se ejecutan una vez: el modal sale una sola
   vez en la vida del usuario, así que nada en bucle que distraiga de leerlo. */

.novedad__icono {
  -webkit-animation: novedad-icono 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation: novedad-icono 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Barrido de luz sobre la cabecera, una pasada */
.novedad__destello {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 55%;
  background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
  -webkit-animation: novedad-destello 1400ms ease-out 260ms both;
  animation: novedad-destello 1400ms ease-out 260ms both;
}

.novedad__chispa {
  position: absolute;
  top: calc(12% + (var(--n) * 11%));
  left: calc(6% + (var(--n) * 15%));
  font-size: 12px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.85);
  -webkit-animation: novedad-chispa 1600ms ease-out calc(var(--n) * 130ms) both;
  animation: novedad-chispa 1600ms ease-out calc(var(--n) * 130ms) both;
}

/* Cascada: cada fila entra detrás de la anterior */
.novedad__fila {
  -webkit-animation: novedad-fila 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation: novedad-fila 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  -webkit-animation-delay: calc(180ms + var(--n) * 110ms);
  animation-delay: calc(180ms + var(--n) * 110ms);
}

@-webkit-keyframes novedad-icono {
  0% { -webkit-transform: translate3d(0, 0, 0) scale(0.4) rotate(-25deg); opacity: 0; }
  100% { -webkit-transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 1; }
}
@keyframes novedad-icono {
  0% { transform: translate3d(0, 0, 0) scale(0.4) rotate(-25deg); opacity: 0; }
  100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); opacity: 1; }
}

@-webkit-keyframes novedad-destello {
  0% { -webkit-transform: translate3d(0, 0, 0); }
  100% { -webkit-transform: translate3d(320%, 0, 0); }
}
@keyframes novedad-destello {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(320%, 0, 0); }
}

@-webkit-keyframes novedad-chispa {
  0% { opacity: 0; -webkit-transform: translate3d(0, 6px, 0) scale(0.6); }
  35% { opacity: 1; -webkit-transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; -webkit-transform: translate3d(0, -10px, 0) scale(0.7); }
}
@keyframes novedad-chispa {
  0% { opacity: 0; transform: translate3d(0, 6px, 0) scale(0.6); }
  35% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(0, -10px, 0) scale(0.7); }
}

@-webkit-keyframes novedad-fila {
  0% { opacity: 0; -webkit-transform: translate3d(0, 14px, 0) scale(0.97); }
  100% { opacity: 1; -webkit-transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes novedad-fila {
  0% { opacity: 0; transform: translate3d(0, 14px, 0) scale(0.97); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .novedad__icono,
  .novedad__fila,
  .novedad__destello,
  .novedad__chispa {
    -webkit-animation: none !important;
    animation: none !important;
  }
  /* Sin animación no pueden quedarse en su estado inicial (invisibles) */
  .novedad__fila,
  .novedad__icono { opacity: 1; }
  .novedad__destello,
  .novedad__chispa { display: none; }
}
</style>

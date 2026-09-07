<template>
  <!--
    Panel de soporte (bandeja de todas las conversaciones) como modal.

    Antes navegaba a `/admin/soporte`: quien atiende el soporte perdía la
    pantalla en la que estaba y tenía que volver a ella a mano. Es una consulta
    que se hace *mientras* estás haciendo otra cosa, así que se abre encima.

    Usa ModalWrapper, como exige la skill natillerapp-modals. Arranca ampliado
    —es una herramienta de trabajo con bandeja + hilo, no una consulta rápida— y
    se puede reducir a panel lateral.

    No lleva natiscroll: el cuerpo no es un formulario que se recorra, son dos
    áreas con scroll propio (la bandeja y el hilo de mensajes), cada una con su
    indicador natural de contenido. El mismo criterio que ChatSoporteFlotante.
  -->
  <ModalWrapper
    :show="show"
    :z-index="70"
    align="bottom"
    :ios-soft-backdrop="true"
    :overlay-class="clasesOverlay"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px] sm:bg-black/20 sm:backdrop-blur-0"
    :card-class="clasesCard"
    :card-max-width="ampliado ? '' : '30rem'"
    @close="$emit('cerrar')"
  >
    <!-- ── Cabecera marca (móvil = fila) ── -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
      <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <InboxIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight text-white">Panel de soporte</h3>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/90">{{ subtitulo }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          :aria-label="ampliado ? 'Reducir el panel' : 'Ampliar el panel'"
          @click="ampliado = !ampliado"
        >
          <ArrowsPointingInIcon v-if="ampliado" class="h-5 w-5" />
          <ArrowsPointingOutIcon v-else class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="$emit('cerrar')"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- ── Cabecera marca (desktop = icono arriba + textos centrados) ── -->
    <!-- La X es un hermano en flex, nunca `absolute`: dentro de ModalWrapper el
         ancestro lleva transform y en iOS se desalinearía. -->
    <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="flex items-start px-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          :aria-label="ampliado ? 'Reducir el panel' : 'Ampliar el panel'"
          @click="ampliado = !ampliado"
        >
          <ArrowsPointingInIcon v-if="ampliado" class="h-5 w-5" />
          <ArrowsPointingOutIcon v-else class="h-5 w-5" />
        </button>
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <InboxIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">Panel de soporte</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">{{ subtitulo }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="$emit('cerrar')"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- ── Cuerpo: la misma bandeja que la página /admin/soporte ── -->
    <!-- Ampliado hay sitio para las dos columnas; reducido, una sola. -->
    <PanelBandejaSoporte
      v-if="show"
      :compacto="!ampliado"
      :conversacion-inicial="conversacionInicial"
      @estado-canal="estadoCanal = $event"
    />
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  ArrowsPointingInIcon, ArrowsPointingOutIcon, InboxIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import PanelBandejaSoporte from './PanelBandejaSoporte.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useSoporteStore } from '../../stores/soporte'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** Conversación a abrir nada más montar (llegada desde una notificación). */
  conversacionInicial: { type: String, default: null },
})

defineEmits(['cerrar'])

const soporte = useSoporteStore()
const estadoCanal = ref('conectado')

/*
 * Arranca ampliado, al revés que el chat del usuario: aquí se viene a trabajar
 * la bandeja, y en una sola columna cada conversación obliga a ir y volver.
 * Vuelve a ampliado al cerrar, para que la próxima vez empiece igual.
 */
const ampliado = ref(true)
watch(() => props.show, (visible) => { if (!visible) ampliado.value = true })

const abierto = computed(() => props.show)
useBodyScrollLock(abierto)

const subtitulo = computed(() => {
  const total = soporte.totalBandeja
  const base = `${total} conversación${total === 1 ? '' : 'es'}`
  return estadoCanal.value === 'degradado' ? `${base} · actualización cada minuto` : base
})

/*
 * Las dos variantes están escritas enteras y literales porque Tailwind genera
 * las clases leyendo el código fuente; construirlas concatenando trozos haría
 * que no existieran en el CSS final.
 *
 * A la izquierda se reserva el ancho de la barra lateral en `xl`, que es donde
 * la barra es fija: si no, el panel se abriría encima de ella.
 */
const clasesOverlay = computed(() =>
  ampliado.value
    ? 'fixed inset-0 z-[70] flex items-stretch justify-center p-0 sm:p-4 xl:pl-[19rem] overflow-hidden overscroll-contain'
    : 'fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-end sm:justify-end sm:p-6 overflow-hidden overscroll-contain')

const clasesCard = computed(() => {
  const base = 'relative flex w-full min-h-0 flex-col overflow-hidden border border-gray-200/60 bg-white shadow-2xl'
  return ampliado.value
    ? `${base} h-[100dvh] rounded-none sm:h-full sm:max-w-none sm:rounded-2xl`
    : `${base} h-[88dvh] rounded-t-2xl sm:h-[min(42rem,85vh)] sm:w-[30rem] sm:rounded-2xl`
})
</script>

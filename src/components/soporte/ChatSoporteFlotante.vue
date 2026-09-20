<template>
  <!--
    Panel de chat que abre el botón flotante.

    Usa ModalWrapper, como exige la skill natillerapp-modals, con dos matices de
    colocación que el patrón admite por props:
      · móvil  → hoja inferior a casi pantalla completa (align="bottom"),
      · ≥ sm   → anclado abajo a la derecha, junto al botón que lo abrió, en vez
                 de centrado: es lo que hace que se lea como un widget de chat y
                 no como un diálogo que interrumpe.

    No lleva natiscroll: el cuerpo no es un formulario que se recorra, es un
    chat con su propio scroll interno (el hilo) y su redactor anclado abajo.
  -->
  <ModalWrapper
    :show="show"
    :z-index="70"
    align="bottom"
    :ios-soft-backdrop="true"
    :overlay-class="clasesOverlay"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px] sm:bg-black/20 sm:backdrop-blur-0"
    :card-class="clasesCard"
    :card-max-width="maximizado ? '' : '24rem'"
    @close="$emit('cerrar')"
  >
    <!-- ── Cabecera marca (móvil = fila) ── -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
      <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <LifebuoyIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight text-white">Soporte</h3>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">Te respondemos dentro de la app</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          :aria-label="maximizado ? 'Reducir el chat' : 'Ampliar el chat'"
          @click="maximizado = !maximizado"
        >
          <ArrowsPointingInIcon v-if="maximizado" class="h-5 w-5" />
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
    <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="flex items-start px-3 pb-4 pt-4">
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          :aria-label="maximizado ? 'Reducir el chat' : 'Ampliar el chat'"
          @click="maximizado = !maximizado"
        >
          <ArrowsPointingInIcon v-if="maximizado" class="h-5 w-5" />
          <ArrowsPointingOutIcon v-else class="h-5 w-5" />
        </button>
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <LifebuoyIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">Soporte</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">Te respondemos dentro de la app</p>
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

    <!-- ── Cuerpo: el mismo componente que la página /soporte ── -->
    <!-- Ampliado hay sitio para las dos columnas; reducido, una sola. -->
    <PanelConversaciones v-if="show" :compacto="!maximizado" />
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, LifebuoyIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import PanelConversaciones from './PanelConversaciones.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useBotonSoporte } from '../../composables/useBotonSoporte'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['cerrar'])

const { estado } = useBotonSoporte()

// Ampliado ocupa toda la pantalla salvo la barra lateral. Vuelve al tamaño
// normal al cerrar: la próxima vez que lo abras, empieza discreto.
const maximizado = ref(false)
watch(() => props.show, (visible) => { if (!visible) maximizado.value = false })

const abierto = computed(() => props.show)
useBodyScrollLock(abierto)

/*
 * El panel se abre del lado donde esté el botón: verlo salir desde la esquina
 * contraria a donde acabas de tocar se siente desconectado.
 *
 * Las dos variantes están escritas enteras y literales porque Tailwind genera
 * las clases leyendo el código fuente; construirlas concatenando trozos haría
 * que no existieran en el CSS final.
 *
 * A la izquierda se reserva el ancho de la barra lateral en `xl`, que es donde
 * la barra es fija: si no, el panel se abriría encima de ella.
 */
const clasesOverlay = computed(() => {
  // Ampliado: toda la pantalla menos la barra lateral, que en `xl` es fija y
  // mide 18 rem (el `pl` de 19 rem deja además el margen).
  if (maximizado.value) {
    return 'fixed inset-0 z-[70] flex items-stretch justify-center p-0 sm:p-4 xl:pl-[19rem] overflow-hidden overscroll-contain'
  }
  return estado.lado === 'izquierda'
    ? 'fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-end sm:justify-start sm:p-6 xl:pl-[19rem] overflow-hidden overscroll-contain'
    : 'fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-end sm:justify-end sm:p-6 overflow-hidden overscroll-contain'
})

const clasesCard = computed(() => {
  const base = 'relative flex w-full min-h-0 flex-col overflow-hidden border border-gray-200/60 bg-white shadow-2xl'
  return maximizado.value
    ? `${base} h-[100dvh] rounded-none sm:h-full sm:max-w-none sm:rounded-2xl`
    : `${base} h-[88dvh] rounded-t-2xl sm:h-[min(38rem,80vh)] sm:w-[24rem] sm:rounded-2xl`
})

</script>

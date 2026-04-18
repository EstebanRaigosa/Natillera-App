<template>
  <button
    type="button"
    @click="volverAtras"
    :class="[
      'group inline-flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-200 touch-manipulation',
      inline
        ? 'h-10 w-10 sm:h-11 sm:w-11 bg-white/80 backdrop-blur-sm border border-gray-200/80 text-gray-600 hover:text-[#166534] hover:bg-[#166534]/5 hover:border-[#166534]/30 shadow-sm hover:shadow-md'
        : 'absolute top-3 left-3 z-20 h-10 w-10 sm:h-11 sm:w-11 bg-white/90 backdrop-blur-sm border border-gray-200/60 text-gray-600 hover:text-[#166534] hover:bg-[#166534]/5 hover:border-[#166534]/30 shadow-md hover:shadow-lg'
    ]"
    aria-label="Volver atrás"
  >
    <ArrowLeftIcon class="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
  </button>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { NATILLERAPP_MODAL_STACK_KEY } from '../composables/useModalStack'

const props = defineProps({
  to: {
    type: String,
    default: null
  },
  /** Si es true, el botón va dentro del flujo (flex) para alinearse con el contenido; si es false, usa posición absoluta */
  inline: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const modalStack = inject(NATILLERAPP_MODAL_STACK_KEY, null)

function volverAtras() {
  // Mientras haya modal registrada en la vista, solo cerrar capas — no navegar con router.
  if (modalStack?.hasOpenModal?.value) {
    modalStack.requestCloseTop()
    return
  }
  if (props.to) {
    // Validar que la ruta no contenga "undefined" o "null"
    if (props.to.includes('undefined') || props.to.includes('null')) {
      console.warn('Ruta inválida detectada en BackButton, redirigiendo al dashboard', props.to)
      router.push('/dashboard')
    } else {
      router.push(props.to)
    }
  } else {
    // Si no hay ruta específica, ir al dashboard
    router.push('/dashboard')
  }
}
</script>

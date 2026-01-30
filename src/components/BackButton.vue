<template>
  <button
    type="button"
    @click="volverAtras"
    :class="[
      'w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-all text-gray-700 hover:text-gray-900',
      inline
        ? 'sm:hidden bg-gray-100 border border-gray-200 shadow-sm hover:bg-gray-200 hover:border-gray-300'
        : 'sm:hidden absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg'
    ]"
    aria-label="Volver atrás"
  >
    <ArrowLeftIcon class="w-5 h-5" />
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

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

function volverAtras() {
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
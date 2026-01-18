<template>
  <button 
    @click="volverAtras"
    class="sm:hidden absolute top-3 left-3 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all text-gray-700 hover:text-gray-900"
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
  }
})

const router = useRouter()

function volverAtras() {
  if (props.to) {
    router.push(props.to)
  } else {
    // Si no hay ruta específica, ir al dashboard
    router.push('/dashboard')
  }
}
</script>
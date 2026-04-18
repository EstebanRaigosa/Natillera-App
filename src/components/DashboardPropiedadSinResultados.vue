<template>
  <div
    class="w-full max-w-md rounded-2xl border border-gray-100 bg-white px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12"
    role="status"
  >
    <DashboardEmptyIlustracion />

    <h2 class="font-body text-xl font-bold leading-snug text-gray-900 sm:text-[1.35rem]">
      {{ titulo }}
    </h2>
    <p class="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-gray-500">
      {{ descripcion }}
    </p>

    <button
      type="button"
      class="mt-8 inline-flex min-h-[48px] w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#166534] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145a2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-offset-2 sm:w-auto"
      @click="$emit('ver-todas')"
    >
      <ArrowRightIcon class="h-5 w-5 shrink-0 text-white" stroke-width="2" />
      {{ etiquetaBoton }}
    </button>
  </div>
</template>

<script setup>
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import DashboardEmptyIlustracion from './DashboardEmptyIlustracion.vue'

defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  etiquetaBoton: { type: String, default: 'Ver todas las natilleras' },
})

defineEmits(['ver-todas'])
</script>

<template>
  <div
    class="w-full max-w-md rounded-2xl border border-borde-suave bg-superficie-tarjeta px-5 py-10 text-center shadow-sm sm:px-8 sm:py-12"
    role="status"
  >
    <DashboardEmptyIlustracion />

    <h2 class="font-body text-xl font-bold leading-snug text-texto-fuerte sm:text-[1.35rem]">
      No se encontraron resultados
    </h2>
    <p class="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-texto-suave">
      Prueba ajustando los filtros de estado o propiedad para ver otras natilleras. Tu listado está a un ajuste de distancia.
    </p>

    <button
      type="button"
      class="mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#166534] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145a2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-offset-2 oscuro:focus-visible:ring-offset-superficie-tarjeta"
      @click="$emit('ver-todas')"
    >
      <span class="relative inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
        <FunnelIcon class="h-5 w-5 text-white" stroke-width="2" />
        <!-- tema-fijo: raya blanca que tacha el embudo, sobre el botón verde de marca -->
        <span class="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white"
        />
      </span>
      Limpiar filtros
    </button>
  </div>
</template>

<script setup>
import { FunnelIcon } from '@heroicons/vue/24/outline'
import DashboardEmptyIlustracion from './DashboardEmptyIlustracion.vue'

defineEmits(['ver-todas'])
</script>

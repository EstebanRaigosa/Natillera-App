<template>
  <!--
    Natiscroll: velo + pista «Desliza para ver más». Overlay absoluto que vive DENTRO del
    cuerpo scrolleable del modal (contenedor `relative`), pegado al borde inferior, justo
    encima del footer fijo. `pointer-events-none` para no interferir con el scroll táctil.
    Patrón de la skill natillerapp-modals (mismo look que Cuotas / Préstamos / Socios).
  -->
  <div
    v-show="show"
    class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
    aria-hidden="true"
  >
    <!-- Velo inferior: detrás de la pastilla (z-0) -->
    <div
      class="absolute inset-x-0 bottom-0 z-0 h-28 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
    />
    <!-- Pastilla siempre por encima del velo -->
    <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
      <div
        class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
      >
        <p
          class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm"
        >
          {{ label }}
        </p>
        <ChevronDownIcon
          class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95"
          stroke-width="2.25"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

defineProps({
  show: { type: Boolean, default: false },
  label: { type: String, default: 'Desliza para ver más' }
})
</script>

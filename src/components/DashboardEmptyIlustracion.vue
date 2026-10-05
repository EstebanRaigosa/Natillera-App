<template>
  <!-- Ilustración reutilizable: rejilla, tarjeta blanca, alcancía y lupa -->
  <div
    class="ilustracion-disco relative mx-auto mb-8 flex aspect-square h-36 w-36 shrink-0 items-center justify-center rounded-full ring-1 ring-natillera-200/70 oscuro:ring-natillera-500/30 sm:h-40 sm:w-40"
    aria-hidden="true"
  >
    <div
      class="relative flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-full bg-superficie-tarjeta shadow-md ring-1 ring-natillera-200/70 oscuro:ring-natillera-500/30 sm:h-28 sm:w-28"
    >
      <PiggyBankIcon class="h-12 w-12 text-natillera-600 oscuro:text-natillera-300 sm:h-14 sm:w-14" />
    </div>
    <div
      class="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#166534] shadow-md ring-2 ring-white oscuro:ring-superficie-tarjeta sm:bottom-2.5 sm:right-2.5 sm:h-9 sm:w-9"
    >
      <MagnifyingGlassIcon class="h-4 w-4 text-white sm:h-[1.125rem] sm:w-[1.125rem]" stroke-width="2" />
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import PiggyBankIcon from './icons/PiggyBankIcon.vue'
</script>

<style scoped>
/* Disco con rejilla de puntos. Era un style="" en línea: pasa aquí para tener su versión oscura. */
.ilustracion-disco {
  background-image: radial-gradient(circle at center, rgb(22 101 52 / 0.1) 1px, transparent 1px),
    linear-gradient(to bottom right, rgb(240 253 244), rgb(220 252 231));
  background-size: 12px 12px, auto;
}
:where([data-tema=oscuro]) .ilustracion-disco {
  background-image: radial-gradient(circle at center, rgb(110 231 160 / 0.14) 1px, transparent 1px),
    linear-gradient(to bottom right, var(--marca-suave), var(--superficie-suave));
}
</style>

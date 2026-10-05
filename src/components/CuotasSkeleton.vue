<script setup>
// Skeleton de carga para la lista de cuotas.
// Imita la fila por socio (avatar + nombre/badges + monto/barra + desglose)
// para que el cambio de mes no muestre un salto brusco mientras se recalcula.
defineProps({
  filas: {
    type: Number,
    default: 5,
  },
})
</script>

<template>
  <div class="space-y-3" aria-hidden="true">
    <div
      v-for="n in filas"
      :key="n"
      class="ds-card relative overflow-hidden flex flex-col gap-3 border-l-[6px] border-l-slate-200 oscuro:border-l-borde"
    >
      <!-- Cabecera: avatar + nombre/badges + monto -->
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-borde animate-pulse flex-shrink-0"></div>

        <div class="flex-1 min-w-0">
          <div class="h-4 w-32 sm:w-40 rounded bg-borde animate-pulse"></div>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            <div class="h-4 w-16 rounded-full bg-borde animate-pulse"></div>
            <div class="h-4 w-14 rounded-full bg-borde animate-pulse"></div>
            <div class="h-3 w-10 rounded bg-superficie-hundida animate-pulse"></div>
          </div>
        </div>

        <div class="flex-shrink-0 text-right w-[124px] sm:w-44">
          <div class="h-5 w-24 rounded bg-borde animate-pulse ml-auto"></div>
          <div class="h-3 w-32 rounded bg-superficie-hundida animate-pulse mt-1.5 ml-auto"></div>
          <div class="mt-2 h-1.5 rounded-full bg-borde animate-pulse"></div>
        </div>
      </div>

      <!-- Desglose (una cuota simulada) -->
      <div class="flex flex-col gap-2 pt-2.5 border-t border-borde/70">
        <div class="rounded-lg border border-borde bg-superficie-suave px-2.5 py-2">
          <div class="flex items-center justify-between gap-2">
            <div class="h-3.5 w-28 rounded bg-borde animate-pulse"></div>
            <div class="h-3.5 w-16 rounded bg-borde animate-pulse"></div>
          </div>
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <div class="h-3 w-20 rounded bg-superficie-hundida animate-pulse"></div>
            <div class="h-3 w-16 rounded bg-superficie-hundida animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

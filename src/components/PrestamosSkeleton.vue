<script setup>
// Skeleton de carga inicial para la vista de Préstamos.
// Imita el resumen (4 ds-stat-card) + la lista de tarjetas de préstamo
// (socio + estado, saldo, Monto/Interés/Pagado y acciones) para evitar el flash del empty state
// mientras se resuelve fetchPrestamos().
defineProps({
  filas: {
    type: Number,
    default: 4,
  },
})
</script>

<template>
  <div class="space-y-5 sm:space-y-6" aria-hidden="true">
    <!-- Resumen (4 stat cards) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      <div v-for="n in 4" :key="`stat-${n}`" class="ds-stat-card">
        <div class="w-10 h-10 rounded-md bg-gray-200 animate-pulse mb-2.5"></div>
        <div class="h-6 w-16 rounded bg-gray-200 animate-pulse"></div>
        <div class="h-3 w-20 rounded bg-gray-100 animate-pulse mt-2"></div>
      </div>
    </div>

    <!-- Lista de tarjetas de préstamo (misma forma que la tarjeta compacta real) -->
    <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="n in filas"
        :key="`row-${n}`"
        class="ds-card flex flex-col gap-3"
      >
        <!-- Socio + estado -->
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="h-5 w-40 rounded bg-gray-200 animate-pulse"></div>
            <div class="h-3.5 w-28 rounded bg-gray-100 animate-pulse mt-1.5"></div>
          </div>
          <div class="h-5 w-16 rounded-full bg-gray-100 animate-pulse"></div>
        </div>
        <!-- Saldo -->
        <div class="flex items-center justify-between">
          <div class="h-3.5 w-12 rounded bg-gray-100 animate-pulse"></div>
          <div class="h-6 w-28 rounded bg-gray-200 animate-pulse"></div>
        </div>
        <!-- Monto / Interés / Pagado -->
        <div class="grid grid-cols-3 gap-2 border-t border-[color:var(--surface-divider)] pt-3">
          <div v-for="c in 3" :key="`cell-${n}-${c}`">
            <div class="h-3 w-10 rounded bg-gray-100 animate-pulse"></div>
            <div class="h-4 w-16 rounded bg-gray-200 animate-pulse mt-1"></div>
          </div>
        </div>
        <!-- Acciones -->
        <div class="flex items-center gap-2">
          <div class="h-11 flex-1 rounded-full bg-gray-100 animate-pulse"></div>
          <div class="h-11 w-11 rounded-full bg-gray-100 animate-pulse flex-shrink-0"></div>
        </div>
      </div>
    </div>
  </div>
</template>

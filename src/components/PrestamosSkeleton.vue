<script setup>
// Skeleton de carga inicial para la vista de Préstamos.
// Imita el resumen (4 ds-stat-card) + la lista de tarjetas de préstamo
// (socio + celdas de datos + acciones) para evitar el flash del empty state
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

    <!-- Lista de tarjetas de préstamo -->
    <div class="space-y-3 sm:space-y-4">
      <div
        v-for="n in filas"
        :key="`row-${n}`"
        class="rounded-2xl bg-white border border-[color:var(--surface-divider)] shadow-[var(--shadow-xs)] p-5 sm:p-6"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Socio -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"></div>
            <div class="min-w-0 flex-1">
              <div class="h-4 w-32 sm:w-36 rounded bg-gray-200 animate-pulse"></div>
              <div class="h-3 w-20 rounded bg-gray-100 animate-pulse mt-2"></div>
            </div>
          </div>

          <!-- Celdas de datos (Monto / Pagado / Interés / Saldo) -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div
              v-for="c in 4"
              :key="`cell-${n}-${c}`"
              class="bg-slate-50 rounded-lg p-2.5 border border-slate-100"
            >
              <div class="h-3 w-12 rounded bg-gray-200 animate-pulse mx-auto lg:ml-auto lg:mr-0"></div>
              <div class="h-4 w-16 rounded bg-gray-200 animate-pulse mt-1.5 mx-auto lg:ml-auto lg:mr-0"></div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center gap-2">
            <div class="h-10 flex-1 lg:flex-none lg:w-24 rounded-xl bg-gray-200 animate-pulse"></div>
            <div class="h-10 w-10 rounded-xl bg-gray-100 animate-pulse flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

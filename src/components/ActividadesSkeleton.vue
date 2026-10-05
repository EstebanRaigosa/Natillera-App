<script setup>
// Skeleton de carga inicial para la vista de Actividades.
// Imita el resumen (3 ds-stat-card), el selector Normal/Agrupada y la lista de
// tarjetas de actividad (franja de estado + icono/título + 3 chips de métrica)
// para evitar el flash del empty state mientras se resuelve fetchActividades().
defineProps({
  filas: {
    type: Number,
    default: 3,
  },
})
</script>

<template>
  <div class="space-y-5 sm:space-y-6" aria-hidden="true">
    <!-- Resumen (3 stat cards: Ingresos / Gastos / Utilidad) -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <div v-for="n in 3" :key="`stat-${n}`" class="ds-stat-card">
        <div class="w-10 h-10 rounded-md bg-borde animate-pulse mb-2.5"></div>
        <div class="h-5 w-16 rounded bg-borde animate-pulse"></div>
        <div class="h-3 w-14 rounded bg-superficie-hundida animate-pulse mt-2"></div>
      </div>
    </div>

    <!-- Selector de vista Normal / Agrupada -->
    <div class="flex rounded-xl border border-borde bg-superficie-tarjeta p-1 shadow-sm gap-1">
      <div class="flex-1 h-11 rounded-lg bg-borde animate-pulse"></div>
      <div class="flex-1 h-11 rounded-lg bg-superficie-hundida animate-pulse"></div>
    </div>

    <!-- Lista de tarjetas de actividad -->
    <div class="space-y-4">
      <div
        v-for="n in filas"
        :key="`row-${n}`"
        class="rounded-2xl bg-superficie-tarjeta border border-[color:var(--surface-divider)] shadow-[var(--shadow-xs)] overflow-hidden"
      >
        <!-- Franja de estado slim -->
        <div class="flex items-center gap-1.5 px-4 py-2 border-b border-borde-suave bg-superficie-suave">
          <span class="w-1.5 h-1.5 rounded-full bg-borde-fuerte flex-shrink-0"></span>
          <div class="h-3 w-16 rounded bg-borde animate-pulse"></div>
          <div class="h-4 w-12 rounded-full bg-superficie-hundida animate-pulse ml-auto"></div>
        </div>

        <div class="p-4 sm:p-5">
          <!-- Cabecera: icono + título/fecha + eliminar -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-11 h-11 rounded-xl bg-borde animate-pulse flex-shrink-0"></div>
              <div class="min-w-0 flex-1">
                <div class="h-4 w-40 max-w-full rounded bg-borde animate-pulse"></div>
                <div class="h-3 w-24 rounded bg-superficie-hundida animate-pulse mt-2"></div>
              </div>
            </div>
            <div class="w-9 h-9 rounded-lg bg-superficie-hundida animate-pulse flex-shrink-0"></div>
          </div>

          <!-- Métricas (3 chips) -->
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div
              v-for="c in 3"
              :key="`chip-${n}-${c}`"
              class="rounded-xl bg-slate-50 oscuro:bg-superficie-suave border border-slate-100 oscuro:border-borde-suave px-3 py-2 flex items-center justify-between gap-3 sm:block"
            >
              <div class="h-2.5 w-16 rounded bg-borde animate-pulse"></div>
              <div class="h-4 w-14 rounded bg-borde animate-pulse sm:mt-1.5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

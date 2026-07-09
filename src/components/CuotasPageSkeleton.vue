<script setup>
// Skeleton de página completa para la entrada a Cuotas.
// Reemplaza la pantalla de carga a pantalla completa: imita la estructura real
// (header + carrusel de meses + tarjeta de resumen + toolbar + lista de socios)
// para que la transición al contenido real no dé un salto brusco.
// Reutiliza CuotasSkeleton para la lista de tarjetas por socio.
import CuotasSkeleton from './CuotasSkeleton.vue'

defineProps({
  filas: {
    type: Number,
    default: 6,
  },
})
</script>

<template>
  <div
    class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative"
    role="status"
    aria-live="polite"
    aria-label="Cargando cuotas"
  >
    <span class="sr-only">Cargando cuotas…</span>

    <!-- Header -->
    <header class="ds-page-header" aria-hidden="true">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <div class="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
          <div class="ds-page-header__icon !bg-gray-200 animate-pulse"></div>
          <div class="min-w-0 flex-1">
            <div class="h-6 w-40 sm:w-52 rounded bg-gray-200 animate-pulse"></div>
            <div class="hidden sm:block h-3.5 w-56 rounded bg-gray-100 animate-pulse mt-2"></div>
          </div>
        </div>
        <div class="ds-page-header__actions hidden sm:flex gap-2">
          <div class="h-9 w-32 rounded-lg bg-gray-200 animate-pulse"></div>
          <div class="h-9 w-32 rounded-lg bg-gray-200 animate-pulse"></div>
        </div>
      </div>
      <!-- Móvil: botón registrar pago a ancho completo -->
      <div class="sm:hidden h-11 w-full rounded-lg bg-gray-200 animate-pulse mt-3"></div>
    </header>

    <!-- Tabs de meses + resumen -->
    <div aria-hidden="true">
      <!-- Carrusel de meses (tabs tipo carpeta) -->
      <div class="relative pt-1">
        <div class="flex items-end gap-2 overflow-hidden px-2">
          <div
            v-for="n in 5"
            :key="n"
            class="flex-shrink-0 rounded-t-2xl bg-gray-200 animate-pulse"
            :class="n === 1 ? 'w-[128px] h-[76px]' : 'w-[110px] h-[60px]'"
          ></div>
        </div>
      </div>

      <!-- Tarjeta de resumen del mes -->
      <div class="relative z-10 -mt-1 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-3 sm:p-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div class="h-6 w-28 rounded bg-gray-200 animate-pulse"></div>
            <div class="h-6 w-24 rounded bg-gray-200 animate-pulse"></div>
            <div class="h-5 w-12 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
          <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div v-for="n in 4" :key="n" class="h-4 w-16 rounded bg-gray-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar (búsqueda + filtros) -->
    <div class="flex flex-col gap-3" aria-hidden="true">
      <div class="h-11 w-full rounded-xl bg-gray-200 animate-pulse"></div>
      <div class="flex flex-wrap gap-2">
        <div class="h-9 w-48 rounded-lg bg-gray-100 animate-pulse"></div>
        <div class="h-9 w-40 rounded-lg bg-gray-100 animate-pulse"></div>
      </div>
    </div>

    <!-- Lista de tarjetas por socio -->
    <CuotasSkeleton :filas="filas" />
  </div>
</template>

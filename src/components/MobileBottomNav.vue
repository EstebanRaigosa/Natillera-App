<template>
  <nav
    v-if="natilleraId"
    class="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-natillera-800 rounded-t-3xl pt-3 overflow-visible shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
  >
    <div class="flex items-end justify-around px-1 max-w-screen-sm mx-auto">
      <!-- Inicio / Detalle Natillera -->
      <router-link
        :to="`/natilleras/${natilleraId}`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive(`/natilleras/${natilleraId}`) ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <HomeIconSolid
          v-if="isActive(`/natilleras/${natilleraId}`)"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <HomeIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}`) ? 'text-white' : 'text-natillera-200'"
        >Inicio</span>
      </router-link>

      <!-- Socios -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/socios`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive(`/natilleras/${natilleraId}/socios`) ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/socios`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <UsersIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/socios`)"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <UsersIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/socios`) ? 'text-white' : 'text-natillera-200'"
        >Socios</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('socios')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 py-0.5 transition-all duration-200 text-natillera-200 hover:text-natillera-100"
      >
        <UsersIcon class="w-6 h-6 sm:w-7 sm:h-7" />
        <span class="text-[11px] sm:text-[12px] font-semibold">Socios</span>
      </button>

      <!-- Cuotas -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/cuotas`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive(`/natilleras/${natilleraId}/cuotas`) ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/cuotas`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <CurrencyDollarIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/cuotas`)"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <CurrencyDollarIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/cuotas`) ? 'text-white' : 'text-natillera-200'"
        >Cuotas</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('cuotas')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 py-0.5 transition-all duration-200 text-natillera-200 hover:text-natillera-100"
      >
        <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7" />
        <span class="text-[11px] sm:text-[12px] font-semibold">Cuotas</span>
      </button>

      <!-- Préstamos -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/prestamos`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive(`/natilleras/${natilleraId}/prestamos`) ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/prestamos`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <BanknotesIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/prestamos`)"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <BanknotesIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/prestamos`) ? 'text-white' : 'text-natillera-200'"
        >Préstamos</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('prestamos')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 py-0.5 transition-all duration-200 text-natillera-200 hover:text-natillera-100"
      >
        <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7" />
        <span class="text-[11px] sm:text-[12px] font-semibold">Préstamos</span>
      </button>

      <!-- Actividades -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/actividades`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive(`/natilleras/${natilleraId}/actividades`) ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/actividades`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <CalendarIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/actividades`)"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <CalendarIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/actividades`) ? 'text-white' : 'text-natillera-200'"
        >Actividades</span>
      </router-link>
      <button
        v-else
        type="button"
        @click="navegarAPrimeraNatillera('actividades')"
        class="nav-item nav-item--inactive flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 py-0.5 transition-all duration-200 text-natillera-200 hover:text-natillera-100"
      >
        <CalendarIcon class="w-6 h-6 sm:w-7 sm:h-7" />
        <span class="text-[11px] sm:text-[12px] font-semibold">Actividades</span>
      </button>

      <!-- Configuración -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/configuracion`"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive(`/natilleras/${natilleraId}/configuracion`) ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive(`/natilleras/${natilleraId}/configuracion`)"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <Cog6ToothIconSolid
          v-if="isActive(`/natilleras/${natilleraId}/configuracion`)"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <Cog6ToothIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/configuracion`) ? 'text-white' : 'text-natillera-200'"
        >Config</span>
      </router-link>
      <router-link
        v-else
        to="/configuracion"
        class="nav-item flex flex-col items-center justify-center gap-0.5 min-w-[44px] rounded-2xl px-3 transition-all duration-200 relative"
        :class="isActive('/configuracion') ? 'nav-item--active' : 'nav-item--inactive py-0.5'"
      >
        <div
          v-if="isActive('/configuracion')"
          class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"
          aria-hidden="true"
        />
        <Cog6ToothIconSolid
          v-if="isActive('/configuracion')"
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-white"
        />
        <Cog6ToothIcon
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 transition-all text-natillera-200"
        />
        <span
          class="text-[11px] sm:text-[12px] font-semibold transition-colors"
          :class="isActive('/configuracion') ? 'text-white' : 'text-natillera-200'"
        >Ajustes</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNatillerasStore } from '../stores/natilleras'
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CalendarIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  CalendarIcon as CalendarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()

// Extraer el ID de natillera de la ruta actual
const natilleraId = computed(() => {
  const id = route.params.id
  // Validar que el ID sea válido (no undefined, null, o string "undefined")
  if (!id || id === 'undefined' || id === 'null') {
    return null
  }
  return id
})

// Verificar si una ruta está activa
function isActive(path) {
  if (path === '/configuracion') {
    return route.path === '/configuracion'
  }
  // Para la vista de detalle de natillera, verificar que sea exactamente esa ruta (sin subrutas)
  if (path === `/natilleras/${natilleraId.value}`) {
    // Está activo solo si es exactamente la ruta de detalle (no subrutas como /socios, /cuotas, etc.)
    return route.path === path
  }
  // Para rutas de natilleras (socios, cuotas, etc.), verificar si la ruta comienza con el path
  return route.path.startsWith(path)
}

// Navegar a la primera natillera activa con la sección especificada
function navegarAPrimeraNatillera(seccion) {
  const todasLasNatilleras = natillerasStore.todasLasNatilleras
  const natilleraActiva = todasLasNatilleras.find(n => n.estado === 'activa')
  
  if (natilleraActiva && natilleraActiva.id) {
    // Validar que el ID sea válido antes de navegar
    const id = String(natilleraActiva.id)
    if (id && id !== 'undefined' && id !== 'null') {
      router.push(`/natilleras/${id}/${seccion}`)
    } else {
      router.push('/dashboard')
    }
  } else {
    // Si no hay natilleras activas, ir al dashboard
    router.push('/dashboard')
  }
}
</script>

<style scoped>
/* Estilo como en referencia: barra verde oscuro, ítem activo con pop-out (sobresale por encima), verde natillera */
.mobile-bottom-nav {
  isolation: isolate;
  padding-bottom: max(0.3rem, env(safe-area-inset-bottom, 0px));
}

.nav-item--active {
  background-color: var(--color-natillera-500);
  color: white;
  padding-top: 0.3rem;
  padding-bottom: 0.25rem;
  margin-top: -0.55rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.nav-item--active:hover {
  color: white;
}

.nav-item--inactive {
  background-color: transparent;
}

.router-link-active {
  color: white;
}

.router-link-active svg {
  color: white;
}
</style>

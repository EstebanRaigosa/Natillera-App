<template>
  <nav 
    v-if="natilleraId"
    class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg safe-area-inset-bottom"
  >
    <div class="flex items-center justify-around px-1 py-2 max-w-screen-sm mx-auto">
      <!-- Inicio / Detalle Natillera -->
      <router-link
        :to="`/natilleras/${natilleraId}`"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive(`/natilleras/${natilleraId}`) ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive(`/natilleras/${natilleraId}`)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <HomeIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive(`/natilleras/${natilleraId}`) ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}`) ? 'text-natillera-600' : 'text-gray-500'"
        >Inicio</span>
      </router-link>

      <!-- Socios -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/socios`"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive(`/natilleras/${natilleraId}/socios`) ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive(`/natilleras/${natilleraId}/socios`)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <UsersIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive(`/natilleras/${natilleraId}/socios`) ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/socios`) ? 'text-natillera-600' : 'text-gray-500'"
        >Socios</span>
      </router-link>
      <button
        v-else
        @click="navegarAPrimeraNatillera('socios')"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] text-gray-500 hover:text-gray-700"
      >
        <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        <span class="text-[9px] sm:text-[10px] font-semibold">Socios</span>
      </button>

      <!-- Cuotas -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/cuotas`"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive(`/natilleras/${natilleraId}/cuotas`) ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive(`/natilleras/${natilleraId}/cuotas`)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <CurrencyDollarIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive(`/natilleras/${natilleraId}/cuotas`) ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/cuotas`) ? 'text-natillera-600' : 'text-gray-500'"
        >Cuotas</span>
      </router-link>
      <button
        v-else
        @click="navegarAPrimeraNatillera('cuotas')"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] text-gray-500 hover:text-gray-700"
      >
        <CurrencyDollarIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        <span class="text-[9px] sm:text-[10px] font-semibold">Cuotas</span>
      </button>

      <!-- Préstamos -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/prestamos`"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive(`/natilleras/${natilleraId}/prestamos`) ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive(`/natilleras/${natilleraId}/prestamos`)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <BanknotesIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive(`/natilleras/${natilleraId}/prestamos`) ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/prestamos`) ? 'text-natillera-600' : 'text-gray-500'"
        >Préstamos</span>
      </router-link>
      <button
        v-else
        @click="navegarAPrimeraNatillera('prestamos')"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] text-gray-500 hover:text-gray-700"
      >
        <BanknotesIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        <span class="text-[9px] sm:text-[10px] font-semibold">Préstamos</span>
      </button>

      <!-- Actividades -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/actividades`"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive(`/natilleras/${natilleraId}/actividades`) ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive(`/natilleras/${natilleraId}/actividades`)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <CalendarIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive(`/natilleras/${natilleraId}/actividades`) ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/actividades`) ? 'text-natillera-600' : 'text-gray-500'"
        >Actividades</span>
      </router-link>
      <button
        v-else
        @click="navegarAPrimeraNatillera('actividades')"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] text-gray-500 hover:text-gray-700"
      >
        <CalendarIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        <span class="text-[9px] sm:text-[10px] font-semibold">Actividades</span>
      </button>

      <!-- Configuración -->
      <router-link
        v-if="natilleraId"
        :to="`/natilleras/${natilleraId}/configuracion`"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive(`/natilleras/${natilleraId}/configuracion`) ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive(`/natilleras/${natilleraId}/configuracion`)"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <Cog6ToothIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive(`/natilleras/${natilleraId}/configuracion`) ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive(`/natilleras/${natilleraId}/configuracion`) ? 'text-natillera-600' : 'text-gray-500'"
        >Config</span>
      </router-link>
      <router-link
        v-else
        to="/configuracion"
        class="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[50px] relative"
        :class="isActive('/configuracion') ? 'text-natillera-600' : 'text-gray-500'"
      >
        <div 
          v-if="isActive('/configuracion')"
          class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-natillera-600 rounded-full"
        ></div>
        <Cog6ToothIcon 
          :class="[
            'w-5 h-5 sm:w-6 sm:h-6 transition-all',
            isActive('/configuracion') ? 'text-natillera-600' : 'text-gray-500'
          ]"
        />
        <span 
          class="text-[9px] sm:text-[10px] font-semibold transition-colors"
          :class="isActive('/configuracion') ? 'text-natillera-600' : 'text-gray-500'"
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

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()

// Extraer el ID de natillera de la ruta actual
const natilleraId = computed(() => {
  return route.params.id || null
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
  
  if (natilleraActiva) {
    router.push(`/natilleras/${natilleraActiva.id}/${seccion}`)
  } else {
    // Si no hay natilleras activas, ir al dashboard
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.router-link-active {
  color: var(--color-natillera-600);
}

.router-link-active svg {
  color: var(--color-natillera-600);
}
</style>

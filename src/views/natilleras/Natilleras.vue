<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-display font-bold text-gray-800">
          Mis Natilleras
        </h1>
        <p class="text-gray-500 mt-1">
          Administra tus grupos de ahorro
        </p>
      </div>
      <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Nueva Natillera
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-2">
      <button 
        @click="filtro = 'todas'"
        :class="['px-4 py-2 rounded-xl font-medium transition-all', filtro === 'todas' ? 'bg-natillera-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']"
      >
        Todas
      </button>
      <button 
        @click="filtro = 'activa'"
        :class="['px-4 py-2 rounded-xl font-medium transition-all', filtro === 'activa' ? 'bg-natillera-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']"
      >
        Activas
      </button>
      <button 
        @click="filtro = 'cerrada'"
        :class="['px-4 py-2 rounded-xl font-medium transition-all', filtro === 'cerrada' ? 'bg-natillera-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100']"
      >
        Cerradas
      </button>
    </div>

    <!-- Lista -->
    <div v-if="natillerasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando natilleras...</p>
    </div>

    <div v-else-if="natillerasFiltradas.length === 0" class="card text-center py-12">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BanknotesIcon class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="font-display font-semibold text-gray-800 text-lg">
        {{ filtro === 'todas' ? 'No tienes natilleras' : `No hay natilleras ${filtro}s` }}
      </h3>
      <p class="text-gray-500 mt-2">
        {{ filtro === 'todas' ? 'Crea tu primera natillera para comenzar' : 'Cambia el filtro para ver otras' }}
      </p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <router-link 
        v-for="natillera in natillerasFiltradas" 
        :key="natillera.id"
        :to="`/natilleras/${natillera.id}`"
        class="card-hover group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-natillera-400 to-natillera-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BanknotesIcon class="w-6 h-6 text-white" />
          </div>
          <span 
            :class="[
              'badge',
              natillera.estado === 'activa' ? 'badge-success' : 'badge-warning'
            ]"
          >
            {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
          </span>
        </div>
        
        <h3 class="font-display font-semibold text-gray-800 text-lg group-hover:text-natillera-700 transition-colors">
          {{ natillera.nombre }}
        </h3>
        
        <p class="text-sm text-gray-500 mt-1">
          {{ natillera.periodicidad }} • Desde {{ formatDate(natillera.fecha_inicio) }}
        </p>

        <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span class="text-gray-500">
            <UsersIcon class="w-4 h-4 inline mr-1" />
            {{ natillera.socios_count || 0 }} socios
          </span>
          <ChevronRightIcon class="w-5 h-5 text-gray-400 group-hover:text-natillera-500 group-hover:translate-x-1 transition-all" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNatillerasStore } from '../../stores/natilleras'
import { 
  BanknotesIcon, 
  UsersIcon, 
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const natillerasStore = useNatillerasStore()
const filtro = ref('todas')

const natillerasFiltradas = computed(() => {
  if (filtro.value === 'todas') {
    return natillerasStore.natilleras
  }
  return natillerasStore.natilleras.filter(n => n.estado === filtro.value)
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short'
  })
}

onMounted(() => {
  natillerasStore.fetchNatilleras()
})
</script>


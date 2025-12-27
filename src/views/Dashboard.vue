<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="animate-fade-in-up">
      <h1 class="text-3xl lg:text-4xl font-display font-bold text-gray-800">
        ¡Hola, {{ authStore.userName }}! 👋
      </h1>
      <p class="text-gray-500 mt-2">
        Bienvenido a tu panel de natilleras
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div class="stat-card animate-fade-in-up stagger-1">
        <div class="w-14 h-14 bg-gradient-to-br from-natillera-400 to-natillera-600 rounded-2xl flex items-center justify-center mb-4">
          <BanknotesIcon class="w-7 h-7 text-white" />
        </div>
        <p class="stat-value">{{ natillerasStore.totalNatilleras }}</p>
        <p class="stat-label">Natilleras</p>
      </div>

      <div class="stat-card animate-fade-in-up stagger-2">
        <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <UsersIcon class="w-7 h-7 text-white" />
        </div>
        <p class="stat-value">{{ totalSocios }}</p>
        <p class="stat-label">Socios</p>
      </div>

      <div class="stat-card animate-fade-in-up stagger-3">
        <div class="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-4">
          <CurrencyDollarIcon class="w-7 h-7 text-white" />
        </div>
        <p class="stat-value">${{ formatMoney(totalRecaudado) }}</p>
        <p class="stat-label">Recaudado</p>
      </div>

      <div class="stat-card animate-fade-in-up stagger-4">
        <div class="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
          <ChartBarIcon class="w-7 h-7 text-white" />
        </div>
        <p class="stat-value">{{ natillerasStore.natillerasActivas.length }}</p>
        <p class="stat-label">Activas</p>
      </div>
    </div>

    <!-- Natilleras recientes -->
    <div class="animate-fade-in-up stagger-5">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-display font-bold text-gray-800">
          Tus Natilleras
        </h2>
        <router-link to="/natilleras/crear" class="btn-primary text-sm py-2">
          <PlusIcon class="w-5 h-5 inline mr-1" />
          Nueva
        </router-link>
      </div>

      <div v-if="natillerasStore.loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-400 mt-4">Cargando natilleras...</p>
      </div>

      <div v-else-if="natillerasStore.natilleras.length === 0" class="card text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BanknotesIcon class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="font-display font-semibold text-gray-800 text-lg">
          No tienes natilleras aún
        </h3>
        <p class="text-gray-500 mt-2 mb-6">
          Crea tu primera natillera y comienza a ahorrar con tu comunidad
        </p>
        <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2">
          <PlusIcon class="w-5 h-5" />
          Crear Natillera
        </router-link>
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <router-link 
          v-for="natillera in natillerasStore.natilleras" 
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
            {{ natillera.periodicidad }} • {{ formatDate(natillera.fecha_inicio) }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
import { supabase } from '../lib/supabase'
import { 
  BanknotesIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()

const totalRecaudado = ref(0)

const totalSocios = computed(() => {
  return natillerasStore.natilleras.reduce((sum, n) => {
    return sum + (n.socios_count || 0)
  }, 0)
})

async function calcularTotalRecaudado() {
  try {
    // Obtener todas las natilleras del usuario
    const natilleraIds = natillerasStore.natilleras.map(n => n.id)
    
    if (natilleraIds.length === 0) {
      totalRecaudado.value = 0
      return
    }

    // Obtener todos los socios_natillera de esas natilleras
    const { data: sociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id')
      .in('natillera_id', natilleraIds)

    if (!sociosNatillera || sociosNatillera.length === 0) {
      totalRecaudado.value = 0
      return
    }

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    // Sumar todos los pagos realizados
    const { data: cuotas } = await supabase
      .from('cuotas')
      .select('valor_pagado')
      .in('socio_natillera_id', socioNatilleraIds)

    totalRecaudado.value = (cuotas || []).reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  } catch (e) {
    console.error('Error calculando total recaudado:', e)
    totalRecaudado.value = 0
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short'
  })
}

onMounted(async () => {
  await natillerasStore.fetchNatilleras()
  await calcularTotalRecaudado()
})
</script>


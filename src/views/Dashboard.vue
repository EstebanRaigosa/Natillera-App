<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent mb-2">
            ¡Hola, {{ authStore.userName }}! 👋
          </h1>
          <p class="text-gray-600 text-sm sm:text-base font-medium">
            Bienvenido a tu panel de natilleras
          </p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-1">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-400 to-natillera-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-natillera-500/30">
            <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ natillerasStore.totalNatilleras }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Natilleras</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 border border-blue-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-2">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <UsersIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ totalSocios }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Socios</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-accent-50/30 to-orange-50/20 border border-accent-200/50 shadow-lg hover:shadow-xl hover:shadow-accent-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-3">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-400/15 to-orange-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent-500/30">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoneyShort(totalRecaudado) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Recaudado</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-4">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
            <ChartBarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ natillerasStore.natillerasActivas.length }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Activas</p>
        </div>
      </div>
    </div>

    <!-- Natilleras recientes -->
    <div class="relative animate-fade-in-up stagger-5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">
            Tus Natilleras
          </h2>
          <p class="text-sm text-gray-600 mt-1">Gestiona tus grupos de ahorro</p>
        </div>
        <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <PlusIcon class="w-5 h-5" />
          <span>Nueva Natillera</span>
        </router-link>
      </div>

      <div v-if="natillerasStore.loading" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
        <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4 font-medium">Cargando natilleras...</p>
      </div>

      <div v-else-if="natillerasStore.natilleras.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
            <BanknotesIcon class="w-10 h-10 text-white" />
          </div>
          <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
            No tienes natilleras aún
          </h3>
          <p class="text-gray-600 mb-8 text-sm sm:text-base">
            Crea tu primera natillera y comienza a ahorrar con tu comunidad
          </p>
          <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            Crear Primera Natillera
          </router-link>
        </div>
      </div>

      <div v-else class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <router-link 
          v-for="natillera in natillerasStore.natilleras" 
          :key="natillera.id"
          :to="`/natilleras/${natillera.id}`"
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-6"
        >
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden border-2 border-white">
                <img 
                  :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                  :alt="natillera.nombre"
                  class="w-full h-full object-cover"
                />
              </div>
              <span 
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                  natillera.estado === 'activa' 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                ]"
              >
                {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
              </span>
            </div>
            
            <h3 class="font-display font-semibold text-gray-800 text-lg group-hover:text-natillera-700 transition-colors mb-1">
              {{ natillera.nombre }}
            </h3>
            
            <p class="text-sm text-gray-600 font-medium">
              {{ natillera.periodicidad }} • {{ formatDate(natillera.fecha_inicio) }}
            </p>

            <div class="mt-5 pt-4 border-t border-gray-200/50 flex items-center justify-between">
              <span class="text-sm text-gray-600 font-medium flex items-center gap-1.5">
                <UsersIcon class="w-4 h-4 text-gray-500" />
                {{ natillera.socios_count || 0 }} {{ natillera.socios_count === 1 ? 'socio' : 'socios' }}
              </span>
              <ChevronRightIcon class="w-5 h-5 text-gray-400 group-hover:text-natillera-500 group-hover:translate-x-1 transition-all" />
            </div>
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
import { getNatilleraAvatarUrl } from '../utils/avatars'
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

function formatMoneyShort(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return formatMoney(value)
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


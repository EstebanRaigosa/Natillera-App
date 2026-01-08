<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <router-link 
        :to="`/natilleras/${id}`" 
        class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm"
      >
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
        </div>
        <span class="whitespace-nowrap">Volver a natillera</span>
      </router-link>
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-natillera-200/50 shadow-lg sm:shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
              <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Cuotas y Pagos
              </h1>
              <p class="text-gray-600 mt-1 text-xs sm:text-sm md:text-base font-medium">
                Selecciona un mes para gestionar las cuotas y pagos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de meses mejorado -->
    <div v-if="mesesNatillera.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      <router-link
        v-for="mes in mesesNatillera"
        :key="mes.value"
        :to="`/natilleras/${id}/cuotas/${mes.value}`"
        class="group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl transition-all duration-500 cursor-pointer overflow-hidden min-h-[130px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] active:scale-95"
      >
        <!-- Fondo principal con gradiente mejorado -->
        <div 
          class="absolute inset-0 rounded-2xl sm:rounded-3xl transition-all duration-500 bg-gradient-to-br from-white via-natillera-50/80 to-emerald-50/60 shadow-md sm:shadow-lg shadow-gray-200/40 group-hover:shadow-2xl group-hover:shadow-natillera-400/40 group-hover:scale-[1.03] border border-natillera-100/50 group-hover:border-natillera-300"
        ></div>
        
        <!-- Círculos decorativos con blur -->
        <div 
          class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-natillera-300/30 to-emerald-300/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
        ></div>
        <div 
          class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-300/30 to-natillera-300/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-1/2 -translate-x-1/2"
        ></div>

        <!-- Patrón decorativo sutil -->
        <div 
          class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style="background-image: radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(5, 150, 105, 0.1) 0%, transparent 40%);"
        ></div>

        <!-- Contenido -->
        <div class="relative z-10 py-4 sm:py-5 lg:py-6 px-3 sm:px-4 flex flex-col items-center w-full">
          <!-- Emoji del mes con animación -->
          <div class="relative mb-2 sm:mb-3">
            <span class="text-4xl sm:text-5xl md:text-6xl lg:text-6xl block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              {{ getMesEmoji(mes.value) }}
            </span>
            <!-- Efecto de brillo en hover -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500"></div>
          </div>
          
          <!-- Nombre del mes con mejor tipografía - Más grande en móvil -->
          <span 
            class="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold text-gray-800 group-hover:text-natillera-700 transition-colors duration-300 mb-1 sm:mb-1.5 leading-tight"
          >
            {{ mes.label }}
          </span>

          <!-- Indicador de estado mejorado -->
          <div class="mt-1.5 sm:mt-3 flex items-center justify-center gap-1 flex-wrap">
            <!-- En Mora (rojo - más urgente) -->
            <span 
              v-if="getResumenMes(mes.value).enMora > 0"
              class="flex items-center justify-center min-w-[24px] h-5 sm:min-w-[28px] sm:h-7 px-1.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white shadow-md sm:shadow-lg shadow-red-300/50 group-hover:shadow-xl group-hover:shadow-red-400/60 group-hover:scale-110 transition-all duration-300 animate-pulse"
            >
              {{ getResumenMes(mes.value).enMora }}
            </span>
            
            <!-- Pendientes (naranja) -->
            <span 
              v-if="getResumenMes(mes.value).pendientes > 0"
              class="flex items-center justify-center min-w-[24px] h-5 sm:min-w-[28px] sm:h-7 px-1.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white shadow-md sm:shadow-lg shadow-amber-300/50 group-hover:shadow-xl group-hover:shadow-amber-400/60 group-hover:scale-110 transition-all duration-300"
            >
              {{ getResumenMes(mes.value).pendientes }}
            </span>
            
            <!-- Pagadas (verde) -->
            <span 
              v-if="getResumenMes(mes.value).pagadas > 0"
              class="flex items-center justify-center min-w-[24px] h-5 sm:min-w-[28px] sm:h-7 px-1.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 text-white shadow-md sm:shadow-lg shadow-green-300/50 group-hover:shadow-xl group-hover:shadow-green-400/60 group-hover:scale-110 transition-all duration-300"
            >
              {{ getResumenMes(mes.value).pagadas }}
            </span>
          </div>

          <!-- Indicador de hover mejorado (oculto en móvil) -->
          <div class="mt-2 sm:mt-4 opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform translate-y-2 sm:group-hover:translate-y-0 hidden sm:block">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-natillera-500/10 to-emerald-500/10 rounded-full border border-natillera-300/30">
              <span class="text-xs text-natillera-700 font-bold">Ver cuotas</span>
              <ChevronRightIcon class="w-4 h-4 text-natillera-600 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>

        <!-- Borde animado en hover -->
        <div class="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-natillera-300/50 transition-all duration-500 pointer-events-none"></div>
      </router-link>
    </div>

    <!-- Mensaje si no hay meses -->
    <div v-else class="text-center py-16">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
        <CalendarDaysIcon class="w-10 h-10 text-gray-400" />
      </div>
      <p class="text-gray-500 text-lg font-medium">No hay meses configurados para esta natillera</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { supabase } from '../../lib/supabase'
import { ArrowLeftIcon, ChevronRightIcon, CurrencyDollarIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  id: String
})

const route = useRoute()
const cuotasStore = useCuotasStore()
const id = props.id || route.params.id

const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())

// Lista de todos los meses
const todosMeses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

// Meses configurados para esta natillera
const mesesNatillera = computed(() => {
  const meses = []
  let inicio = mesInicio.value
  let fin = mesFin.value
  
  if (inicio <= fin) {
    for (let i = inicio; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  } else {
    // Caso donde el período cruza el año (ej: Octubre a Febrero)
    for (let i = inicio; i <= 12; i++) {
      meses.push(todosMeses[i - 1])
    }
    for (let i = 1; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  }
  
  return meses
})

// Emoji representativo de cada mes
function getMesEmoji(mes) {
  const emojis = {
    1: '❄️',   // Enero - invierno/nuevo año
    2: '💝',   // Febrero - amor
    3: '🌸',   // Marzo - primavera
    4: '🌧️',   // Abril - lluvias
    5: '🌺',   // Mayo - flores
    6: '☀️',   // Junio - sol
    7: '🏖️',   // Julio - vacaciones
    8: '🌴',   // Agosto - verano
    9: '🍂',   // Septiembre - otoño
    10: '🎃',  // Octubre - halloween
    11: '🦃',  // Noviembre - acción de gracias
    12: '🎄'   // Diciembre - navidad
  }
  return emojis[mes] || '📅'
}

// Función para calcular el año correcto de un mes basándose en el período de la natillera
// Por ejemplo: si mes_inicio=12 (dic), mes_fin=11 (nov), anio_inicio=2025
//   - Diciembre (12) → 2025
//   - Enero-Nov (1-11) → 2026
function calcularAnioMes(mes, mesInicioNatillera, mesFinNatillera, anioInicioNatillera) {
  // Si el período cruza el año (mes_inicio > mes_fin, ej: dic a nov)
  if (mesInicioNatillera > mesFinNatillera) {
    // Si el mes está en la primera parte del período (mes_inicio a diciembre)
    if (mes >= mesInicioNatillera) {
      return anioInicioNatillera
    }
    // Si el mes está en la segunda parte del período (enero a mes_fin)
    if (mes <= mesFinNatillera) {
      return anioInicioNatillera + 1
    }
  } else {
    // Si el período no cruza el año (mes_inicio <= mes_fin, ej: ene a nov)
    return anioInicioNatillera
  }
  
  // Por defecto, devolver el año inicial
  return anioInicioNatillera
}

// Función para obtener resumen de un mes específico
function getResumenMes(mes) {
  // Calcular el año correcto para este mes basándose en el período de la natillera
  const anioCorrecto = calcularAnioMes(
    mes,
    mesInicio.value,
    mesFin.value,
    anioNatillera.value
  )
  return cuotasStore.getResumenPorMes(mes, anioCorrecto)
}

// Cargar información de la natillera
async function cargarNatillera() {
  // OPTIMIZADO: Cargar natillera Y cuotas EN PARALELO
  const [natilleraResult] = await Promise.all([
    supabase
      .from('natilleras')
      .select('nombre, mes_inicio, mes_fin, anio, anio_inicio')
      .eq('id', id)
      .single(),
    cuotasStore.fetchCuotasNatillera(id, { skipMoraUpdate: true }) // Skip mora para esta vista resumen
  ])
  
  const data = natilleraResult.data
  if (data) {
    mesInicio.value = data.mes_inicio || 1
    mesFin.value = data.mes_fin || 11
    // Usar anio_inicio como año base
    if (data.anio_inicio !== null && data.anio_inicio !== undefined && data.anio_inicio !== '') {
      anioNatillera.value = Number(data.anio_inicio)
    } else if (data.anio !== null && data.anio !== undefined && data.anio !== '') {
      anioNatillera.value = Number(data.anio)
    } else {
      anioNatillera.value = new Date().getFullYear()
    }
  }
}

onMounted(() => {
  cargarNatillera()
})
</script>


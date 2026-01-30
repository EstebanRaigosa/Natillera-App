<template>
  <div class="min-h-screen bg-gray-100/80">
    <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <!-- Header flat -->
      <div>
        <Breadcrumbs />
        <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
          <div class="flex items-center gap-3">
            <BackButton :to="`/natilleras/${id}`" :inline="true" />
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800">
                Cuotas y Pagos
              </h1>
              <p class="text-gray-500 mt-0.5 text-sm">
                Selecciona un mes para gestionar las cuotas y pagos
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de meses - diseño flat -->
      <div v-if="mesesNatillera.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <router-link
          v-for="mes in mesesNatillera"
          :key="mes.value"
          :to="`/natilleras/${id}/cuotas/${mes.value}`"
          class="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-200/80 shadow-sm py-6 px-4 min-h-[140px] sm:min-h-[160px] hover:bg-gray-50/80 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <!-- Emoji del mes -->
          <span class="text-4xl sm:text-5xl mb-2 block">
            {{ getMesEmoji(mes.value) }}
          </span>
          <!-- Nombre del mes -->
          <span class="text-base sm:text-lg font-bold text-gray-800 leading-tight text-center">
            {{ mes.label }}
          </span>
          <!-- Badges flat: rojo (mora) y verde (pagadas) -->
          <div class="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span
              v-if="getResumenMes(mes.value).enMora > 0"
              class="flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-xs font-semibold bg-red-500 text-white"
            >
              {{ getResumenMes(mes.value).enMora }}
            </span>
            <span
              v-if="getResumenMes(mes.value).pendientes > 0"
              class="flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-xs font-semibold bg-amber-500 text-white"
            >
              {{ getResumenMes(mes.value).pendientes }}
            </span>
            <span
              v-if="getResumenMes(mes.value).pagadas > 0"
              class="flex items-center justify-center min-w-[26px] h-6 px-2 rounded-full text-xs font-semibold bg-green-500 text-white"
            >
              {{ getResumenMes(mes.value).pagadas }}
            </span>
          </div>
        </router-link>
      </div>

      <!-- Mensaje si no hay meses -->
      <div v-else class="bg-white rounded-2xl border border-gray-200/80 shadow-sm text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <CalendarDaysIcon class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 font-medium">No hay meses configurados para esta natillera</p>
      </div>

      <!-- Botón flotante "Volver arriba" - flat -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <button
          v-if="mostrarBotonArriba"
          @click="scrollToTop"
          class="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-full shadow-md hover:bg-gray-800 flex items-center justify-center text-white touch-manipulation transition-colors"
          title="Volver arriba"
        >
          <ArrowUpIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { supabase } from '../../lib/supabase'
import { CurrencyDollarIcon, CalendarDaysIcon, ArrowUpIcon } from '@heroicons/vue/24/outline'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'

const props = defineProps({
  id: String
})

const route = useRoute()
const cuotasStore = useCuotasStore()
const id = props.id || route.params.id

const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())
const mostrarBotonArriba = ref(false)

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

// Función para manejar el scroll y mostrar/ocultar el botón
function handleScroll() {
  mostrarBotonArriba.value = window.scrollY > 300
}

// Función para hacer scroll hacia arriba
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  cargarNatillera()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>


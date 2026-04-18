<template>
  <div class="min-h-screen bg-gray-100/80">
    <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <!-- Header flat -->
      <div>
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
          v-for="(mes, idx) in mesesNatillera"
          :key="mes.value"
          :id="idx === 0 ? 'tour-cuotas-meses-primer-mes' : undefined"
          :to="`/natilleras/${id}/cuotas/${mes.value}`"
          class="mes-card flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-200/80 shadow-sm py-6 px-4 min-h-[140px] sm:min-h-[160px] hover:bg-gray-50/80 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <span class="text-4xl sm:text-5xl mb-2 block pointer-events-none select-none">
            {{ getMesEmoji(mes.value) }}
          </span>
          <span class="text-base sm:text-lg font-bold text-gray-800 leading-tight text-center pointer-events-none">
            {{ mes.label }}
          </span>
          <div class="mt-3 flex items-center justify-center gap-2 flex-wrap pointer-events-none">
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
          class="fixed z-50 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-full shadow-md hover:bg-gray-800 flex items-center justify-center text-white touch-manipulation transition-colors bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-[max(1.5rem,env(safe-area-inset-right,0px))]"
          title="Volver arriba"
        >
          <ArrowUpIcon class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { CurrencyDollarIcon, CalendarDaysIcon, ArrowUpIcon } from '@heroicons/vue/24/outline'

import BackButton from '../../components/BackButton.vue'
import { TOURS_ENABLED } from '../../config/toursEnabled'
import {
  consumePendingPrimerSocioCuotasMesTour,
  shouldShowPrimerSocioCuotasMesTour,
  startPrimerSocioCuotasMesTour
} from '../../composables/usePrimerSocioCuotasMesTour'

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const dashboardSidebar = inject('dashboardSidebar', null)
const id = props.id || route.params.id

const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())
const mostrarBotonArriba = ref(false)
const resumenRpc = ref({})

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

const mesesNatillera = computed(() => {
  const meses = []
  let inicio = mesInicio.value
  let fin = mesFin.value
  
  if (inicio <= fin) {
    for (let i = inicio; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  } else {
    for (let i = inicio; i <= 12; i++) {
      meses.push(todosMeses[i - 1])
    }
    for (let i = 1; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  }
  
  return meses
})

function getMesEmoji(mes) {
  const emojis = {
    1: '❄️', 2: '💝', 3: '🌸', 4: '🌧️', 5: '🌺', 6: '☀️',
    7: '🏖️', 8: '🌴', 9: '🍂', 10: '🎃', 11: '🦃', 12: '🎄'
  }
  return emojis[mes] || '📅'
}

function calcularAnioMes(mes, mesInicioNatillera, mesFinNatillera, anioInicioNatillera) {
  if (mesInicioNatillera > mesFinNatillera) {
    if (mes >= mesInicioNatillera) return anioInicioNatillera
    if (mes <= mesFinNatillera) return anioInicioNatillera + 1
  } else {
    return anioInicioNatillera
  }
  return anioInicioNatillera
}

function getResumenMes(mes) {
  const anio = calcularAnioMes(mes, mesInicio.value, mesFin.value, anioNatillera.value)
  const key = `${mes}-${anio}`
  return resumenRpc.value[key] || { enMora: 0, pendientes: 0, pagadas: 0 }
}

async function cargarNatillera() {
  const [natilleraResult, resumenResult] = await Promise.all([
    supabase
      .from('natilleras')
      .select('nombre, mes_inicio, mes_fin, anio, anio_inicio')
      .eq('id', id)
      .single(),
    supabase.rpc('get_resumen_cuotas_meses', { p_natillera_id: id })
  ])
  
  const data = natilleraResult.data
  if (data) {
    mesInicio.value = data.mes_inicio || 1
    mesFin.value = data.mes_fin || 11
    if (data.anio_inicio !== null && data.anio_inicio !== undefined && data.anio_inicio !== '') {
      anioNatillera.value = Number(data.anio_inicio)
    } else if (data.anio !== null && data.anio !== undefined && data.anio !== '') {
      anioNatillera.value = Number(data.anio)
    } else {
      anioNatillera.value = new Date().getFullYear()
    }
  }

  if (resumenResult.data) {
    const map = {}
    for (const row of resumenResult.data) {
      map[`${row.mes}-${row.anio}`] = {
        pagadas: Number(row.pagadas) || 0,
        pendientes: Number(row.pendientes) || 0,
        enMora: Number(row.en_mora) || 0
      }
    }
    resumenRpc.value = map
  }
}

// Scroll: en DashboardLayout el desplazamiento vive en <main>, no en window (móvil y muchos desktop)
let scrollRafId = 0
let scrollParentEl = null

function resolveDashboardMain() {
  return document.querySelector('main.overflow-y-auto')
}

function getScrollTop() {
  const el = scrollParentEl || resolveDashboardMain()
  if (el) return el.scrollTop
  return window.scrollY || document.documentElement.scrollTop
}

// Scroll handler throttled con rAF para no disparar re-renders en cada píxel
function handleScroll() {
  if (scrollRafId) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = 0
    mostrarBotonArriba.value = getScrollTop() > 300
  })
}

// Función para hacer scroll hacia arriba
function scrollToTop() {
  const el = scrollParentEl || resolveDashboardMain()
  if (el) {
    el.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function schedulePrimerCuotasMesesTour() {
  if (!id) return
  if (!TOURS_ENABLED) return
  if (!consumePendingPrimerSocioCuotasMesTour(id)) return
  if (!shouldShowPrimerSocioCuotasMesTour(id)) return
  const first = mesesNatillera.value[0]
  const firstLabel = first?.label || 'Enero'
  const firstMonthValue = first?.value
  nextTick(() => {
    setTimeout(() => {
      startPrimerSocioCuotasMesTour({
        natilleraId: id,
        firstMonthLabel: firstLabel,
        firstMonthValue,
        prepareSidebarForTour: dashboardSidebar?.prepareSidebarForTour,
        clearSidebarAfterTour: dashboardSidebar?.clearSidebarAfterTour,
        onMesesGridTourFinished: ({ natilleraId: nid, firstMonthValue: mes }) => {
          if (mes != null && mes !== '') {
            router.push(`/natilleras/${nid}/cuotas/${mes}`)
          }
        }
      })
    }, 450)
  })
}

onMounted(async () => {
  await cargarNatillera()
  await nextTick()
  scrollParentEl = resolveDashboardMain()
  if (scrollParentEl) {
    scrollParentEl.addEventListener('scroll', handleScroll, { passive: true })
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  schedulePrimerCuotasMesesTour()
})

onUnmounted(() => {
  if (scrollParentEl) {
    scrollParentEl.removeEventListener('scroll', handleScroll)
  }
  window.removeEventListener('scroll', handleScroll)
  if (scrollRafId) cancelAnimationFrame(scrollRafId)
})
</script>

<style scoped>
.mes-card {
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(34, 197, 94, 0.15);
  -webkit-user-select: none;
  user-select: none;
}
</style>


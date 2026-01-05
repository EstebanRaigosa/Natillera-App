<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
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
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 flex-shrink-0">
              <CalendarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Actividades
              </h1>
              <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                Rifas, eventos y otras actividades del fondo
              </p>
            </div>
          </div>
          <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            Nueva Actividad
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border border-green-200/50 shadow-lg hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-1">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalIngresos) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Ingresos</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 border border-red-200/50 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-2">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/15 to-rose-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalGastos) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Gastos</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-3">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(utilidadTotal) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Utilidad</p>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="actividades.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center shadow-lg shadow-accent-500/30">
          <CalendarIcon class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
          No hay actividades registradas
        </h3>
        <p class="text-gray-600 mb-8 text-sm sm:text-base">
          Las actividades generan fondos adicionales para la natillera
        </p>
        <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <PlusIcon class="w-5 h-5" />
          Crear Actividad
        </button>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:gap-5 lg:grid-cols-2">
      <div 
        v-for="actividad in actividades" 
        :key="actividad.id"
        class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6"
      >
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <component :is="getIconoActividad(actividad.tipo)" class="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 class="font-display font-semibold text-gray-800 text-lg">
                  {{ actividad.descripcion }}
                </h3>
                <p class="text-sm text-gray-500 font-medium">
                  {{ formatDate(actividad.created_at) }}
                </p>
              </div>
            </div>
            <span class="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200">
              {{ actividad.tipo || 'Otro' }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-3 sm:gap-4">
            <div class="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50/50 rounded-xl p-3 sm:p-4 border border-green-200/50 backdrop-blur-sm">
              <p class="text-xs text-gray-500 font-medium mb-1">Ingresos</p>
              <p class="font-bold text-green-600 text-sm sm:text-base">${{ formatMoney(actividad.ingresos) }}</p>
            </div>
            <div class="relative bg-gradient-to-br from-red-50 via-rose-50 to-red-50/50 rounded-xl p-3 sm:p-4 border border-red-200/50 backdrop-blur-sm">
              <p class="text-xs text-gray-500 font-medium mb-1">Gastos</p>
              <p class="font-bold text-red-600 text-sm sm:text-base">${{ formatMoney(actividad.gastos) }}</p>
            </div>
            <div class="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50/50 rounded-xl p-3 sm:p-4 border border-purple-200/50 backdrop-blur-sm">
              <p class="text-xs text-gray-500 font-medium mb-1">Utilidad</p>
              <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(actividad.utilidad) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Actividad -->
    <div v-if="modalNuevaActividad" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalNuevaActividad = false"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-accent-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Nueva Actividad
                </h3>
                <p class="text-white/90 text-xs">Registra una nueva actividad del fondo</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto">
          <form @submit.prevent="handleCrearActividad" class="p-4 sm:p-6 space-y-4">
            <div>
              <label class="label">Tipo de actividad</label>
              <select v-model="formActividad.tipo" class="input-field">
                <option value="rifa">🎟️ Rifa</option>
                <option value="bingo">🎱 Bingo</option>
                <option value="venta">🛒 Venta</option>
                <option value="evento">🎉 Evento</option>
                <option value="otro">📋 Otro</option>
              </select>
            </div>

            <div>
              <label class="label">Descripción *</label>
              <input 
                v-model="formActividad.descripcion"
                type="text" 
                class="input-field"
                placeholder="Ej: Rifa de Navidad 2025"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Ingresos *</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                    $
                  </div>
                  <input 
                    v-model.number="formActividad.ingresos"
                    type="number" 
                    class="input-field pl-10 text-lg font-semibold"
                    placeholder="150000"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label class="label">Gastos</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                    $
                  </div>
                  <input 
                    v-model.number="formActividad.gastos"
                    type="number" 
                    class="input-field pl-10 text-lg font-semibold"
                    placeholder="20000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div class="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50/50 border-2 border-purple-200 rounded-xl p-4 overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-indigo-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <div class="relative z-10">
                <p class="text-sm text-gray-600 font-medium mb-1">Utilidad estimada:</p>
                <p class="font-bold text-2xl text-purple-600">
                  ${{ formatMoney((formActividad.ingresos || 0) - (formActividad.gastos || 0)) }}
                </p>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalNuevaActividad = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleCrearActividad" 
              class="btn-accent flex-1"
              :disabled="loading || !formActividad.descripcion || !formActividad.ingresos"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
import { 
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  TicketIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const notificationStore = useNotificationStore()

const props = defineProps({
  id: String
})

const route = useRoute()
const id = props.id || route.params.id

const actividades = ref([])
const loading = ref(false)
const modalNuevaActividad = ref(false)

const formActividad = reactive({
  tipo: 'rifa',
  descripcion: '',
  ingresos: 0,
  gastos: 0
})

const totalIngresos = computed(() => 
  actividades.value.reduce((sum, a) => sum + (a.ingresos || 0), 0)
)

const totalGastos = computed(() => 
  actividades.value.reduce((sum, a) => sum + (a.gastos || 0), 0)
)

const utilidadTotal = computed(() => 
  actividades.value.reduce((sum, a) => sum + (a.utilidad || 0), 0)
)

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getIconoActividad(tipo) {
  const iconos = {
    rifa: TicketIcon,
    bingo: SparklesIcon,
    venta: ShoppingBagIcon,
    evento: CalendarIcon,
    otro: ClipboardDocumentListIcon
  }
  return iconos[tipo] || ClipboardDocumentListIcon
}

async function fetchActividades() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('natillera_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error
    actividades.value = data || []
  } catch (e) {
    console.error('Error cargando actividades:', e)
  } finally {
    loading.value = false
  }
}

async function handleCrearActividad() {
  loading.value = true
  try {
    const utilidad = (formActividad.ingresos || 0) - (formActividad.gastos || 0)

    const { data, error } = await supabase
      .from('actividades')
      .insert({
        natillera_id: id,
        tipo: formActividad.tipo,
        descripcion: formActividad.descripcion,
        ingresos: formActividad.ingresos || 0,
        gastos: formActividad.gastos || 0,
        utilidad
      })
      .select()
      .single()

    if (error) throw error
    
    actividades.value.unshift(data)
    modalNuevaActividad.value = false
    
    // Resetear formulario
    formActividad.tipo = 'rifa'
    formActividad.descripcion = ''
    formActividad.ingresos = 0
    formActividad.gastos = 0
    notificationStore.success('Actividad creada exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al crear la actividad', 'Error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActividades()
})
</script>


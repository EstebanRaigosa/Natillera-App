<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <router-link :to="`/natilleras/${id}`" class="text-natillera-600 hover:text-natillera-700 font-medium inline-flex items-center gap-1 mb-2">
          <ArrowLeftIcon class="w-4 h-4" />
          Volver a natillera
        </router-link>
        <h1 class="text-3xl font-display font-bold text-gray-800">
          Actividades
        </h1>
        <p class="text-gray-500 mt-1">
          Rifas, eventos y otras actividades del fondo
        </p>
      </div>
      <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Nueva Actividad
      </button>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-3 gap-4">
      <div class="stat-card">
        <p class="stat-value text-natillera-600">${{ formatMoney(totalIngresos) }}</p>
        <p class="stat-label">Ingresos</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-red-600">${{ formatMoney(totalGastos) }}</p>
        <p class="stat-label">Gastos</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-purple-600">${{ formatMoney(utilidadTotal) }}</p>
        <p class="stat-label">Utilidad</p>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="actividades.length === 0" class="card text-center py-12">
      <CalendarIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="font-display font-semibold text-gray-800 text-lg">
        No hay actividades registradas
      </h3>
      <p class="text-gray-500 mt-2 mb-6">
        Las actividades generan fondos adicionales para la natillera
      </p>
      <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Crear Actividad
      </button>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <div 
        v-for="actividad in actividades" 
        :key="actividad.id"
        class="card-hover"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
              <component :is="getIconoActividad(actividad.tipo)" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="font-display font-semibold text-gray-800">
                {{ actividad.descripcion }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ formatDate(actividad.created_at) }}
              </p>
            </div>
          </div>
          <span class="badge badge-info">{{ actividad.tipo || 'Otro' }}</span>
        </div>

        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-3 bg-green-50 rounded-xl">
            <p class="text-xs text-gray-500">Ingresos</p>
            <p class="font-bold text-green-600">${{ formatMoney(actividad.ingresos) }}</p>
          </div>
          <div class="p-3 bg-red-50 rounded-xl">
            <p class="text-xs text-gray-500">Gastos</p>
            <p class="font-bold text-red-600">${{ formatMoney(actividad.gastos) }}</p>
          </div>
          <div class="p-3 bg-purple-50 rounded-xl">
            <p class="text-xs text-gray-500">Utilidad</p>
            <p class="font-bold text-purple-600">${{ formatMoney(actividad.utilidad) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Actividad -->
    <div v-if="modalNuevaActividad" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalNuevaActividad = false"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          Nueva Actividad
        </h3>

        <form @submit.prevent="handleCrearActividad" class="space-y-4">
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
              <input 
                v-model.number="formActividad.ingresos"
                type="number" 
                class="input-field"
                placeholder="150000"
                min="0"
                required
              />
            </div>
            <div>
              <label class="label">Gastos</label>
              <input 
                v-model.number="formActividad.gastos"
                type="number" 
                class="input-field"
                placeholder="20000"
                min="0"
              />
            </div>
          </div>

          <div class="p-4 bg-purple-50 rounded-xl">
            <p class="text-sm text-gray-600">Utilidad estimada:</p>
            <p class="font-bold text-xl text-purple-600">
              ${{ formatMoney((formActividad.ingresos || 0) - (formActividad.gastos || 0)) }}
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalNuevaActividad = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-accent flex-1"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { 
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  TicketIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'

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
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActividades()
})
</script>


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
          Préstamos
        </h1>
        <p class="text-gray-500 mt-1">
          Gestiona los préstamos internos del fondo
        </p>
      </div>
      <button @click="modalNuevoPrestamo = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Nuevo Préstamo
      </button>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="stat-card">
        <p class="stat-value">{{ prestamos.length }}</p>
        <p class="stat-label">Total Préstamos</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-accent-600">${{ formatMoney(totalPrestado) }}</p>
        <p class="stat-label">Prestado</p>
      </div>
      <div class="stat-card">
        <p class="stat-value text-natillera-600">${{ formatMoney(totalIntereses) }}</p>
        <p class="stat-label">Intereses Ganados</p>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="prestamos.length === 0" class="card text-center py-12">
      <BanknotesIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="font-display font-semibold text-gray-800 text-lg">
        No hay préstamos registrados
      </h3>
      <p class="text-gray-500 mt-2 mb-6">
        Los préstamos internos generan intereses para el fondo común
      </p>
      <button @click="modalNuevoPrestamo = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Crear Préstamo
      </button>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="prestamo in prestamos" 
        :key="prestamo.id"
        class="card"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div 
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                prestamo.estado === 'pagado' ? 'bg-green-100' : 
                prestamo.estado === 'activo' ? 'bg-blue-100' : 'bg-gray-100'
              ]"
            >
              <BanknotesIcon 
                :class="[
                  'w-6 h-6',
                  prestamo.estado === 'pagado' ? 'text-green-600' : 
                  prestamo.estado === 'activo' ? 'text-blue-600' : 'text-gray-400'
                ]"
              />
            </div>
            <div>
              <p class="font-medium text-gray-800">
                {{ prestamo.socio_natillera?.socio?.nombre || 'Socio' }}
              </p>
              <p class="text-sm text-gray-500">
                Fecha: {{ formatDate(prestamo.created_at) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6 text-center lg:text-right">
            <div>
              <p class="text-sm text-gray-500">Monto</p>
              <p class="font-bold text-gray-800">${{ formatMoney(prestamo.monto) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Interés</p>
              <p class="font-bold text-accent-600">{{ prestamo.interes }}%</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Saldo</p>
              <p class="font-bold" :class="prestamo.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">
                ${{ formatMoney(prestamo.saldo_actual) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span 
              :class="[
                'badge',
                prestamo.estado === 'pagado' ? 'badge-success' : 
                prestamo.estado === 'activo' ? 'badge-info' : 'badge-warning'
              ]"
            >
              {{ prestamo.estado }}
            </span>
            <button 
              v-if="prestamo.estado === 'activo'"
              @click="abrirModalAbono(prestamo)"
              class="btn-secondary py-2 px-4 text-sm"
            >
              Abonar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Préstamo -->
    <div v-if="modalNuevoPrestamo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalNuevoPrestamo = false"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          Nuevo Préstamo
        </h3>

        <form @submit.prevent="handleCrearPrestamo" class="space-y-4">
          <div>
            <label class="label">Socio *</label>
            <select v-model="formPrestamo.socio_natillera_id" class="input-field" required>
              <option value="">Selecciona un socio...</option>
              <option v-for="s in socios" :key="s.id" :value="s.id">
                {{ s.socio?.nombre }}
              </option>
            </select>
          </div>

          <div>
            <label class="label">Monto del préstamo *</label>
            <input 
              v-model.number="formPrestamo.monto"
              type="number" 
              class="input-field"
              placeholder="100000"
              min="10000"
              required
            />
          </div>

          <div>
            <label class="label">Interés mensual (%) *</label>
            <input 
              v-model.number="formPrestamo.interes"
              type="number" 
              class="input-field"
              placeholder="2"
              min="0"
              max="100"
              step="0.5"
              required
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalNuevoPrestamo = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="loading"
            >
              {{ loading ? 'Creando...' : 'Crear Préstamo' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Abono -->
    <div v-if="modalAbono" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalAbono = false"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          Registrar Abono
        </h3>

        <div class="bg-gray-50 p-4 rounded-xl mb-6">
          <p class="font-medium text-gray-800">{{ prestamoSeleccionado?.socio_natillera?.socio?.nombre }}</p>
          <p class="text-sm text-gray-500">
            Saldo actual: ${{ formatMoney(prestamoSeleccionado?.saldo_actual) }}
          </p>
        </div>

        <form @submit.prevent="handleRegistrarAbono" class="space-y-4">
          <div>
            <label class="label">Valor del abono *</label>
            <input 
              v-model.number="formAbono.valor"
              type="number" 
              class="input-field"
              :max="prestamoSeleccionado?.saldo_actual"
              min="1000"
              required
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalAbono = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="loading"
            >
              {{ loading ? 'Registrando...' : 'Registrar Abono' }}
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
  BanknotesIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  id: String
})

const route = useRoute()
const id = props.id || route.params.id

const prestamos = ref([])
const socios = ref([])
const loading = ref(false)
const modalNuevoPrestamo = ref(false)
const modalAbono = ref(false)
const prestamoSeleccionado = ref(null)

const formPrestamo = reactive({
  socio_natillera_id: '',
  monto: 100000,
  interes: 2
})

const formAbono = reactive({
  valor: 0
})

const totalPrestado = computed(() => 
  prestamos.value.reduce((sum, p) => sum + p.monto, 0)
)

const totalIntereses = computed(() => 
  prestamos.value.reduce((sum, p) => {
    const interesGenerado = (p.monto - p.saldo_actual) * (p.interes / 100)
    return sum + interesGenerado
  }, 0)
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

async function fetchPrestamos() {
  loading.value = true
  try {
    // Primero obtener los IDs de socios_natillera de esta natillera
    const { data: sociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(*)')
      .eq('natillera_id', id)

    if (!sociosNatillera || sociosNatillera.length === 0) {
      prestamos.value = []
      return
    }

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    const { data, error } = await supabase
      .from('prestamos')
      .select('*')
      .in('socio_natillera_id', socioNatilleraIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Combinar con datos del socio
    prestamos.value = (data || []).map(prestamo => {
      const socioNatillera = sociosNatillera.find(s => s.id === prestamo.socio_natillera_id)
      return {
        ...prestamo,
        socio_natillera: socioNatillera
      }
    })
  } catch (e) {
    console.error('Error cargando préstamos:', e)
  } finally {
    loading.value = false
  }
}

async function fetchSocios() {
  try {
    const { data, error } = await supabase
      .from('socios_natillera')
      .select(`*, socio:socios(*)`)
      .eq('natillera_id', id)
      .eq('estado', 'activo')

    if (error) throw error
    socios.value = data || []
  } catch (e) {
    console.error('Error cargando socios:', e)
  }
}

function abrirModalAbono(prestamo) {
  prestamoSeleccionado.value = prestamo
  formAbono.valor = prestamo.saldo_actual
  modalAbono.value = true
}

async function handleCrearPrestamo() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('prestamos')
      .insert({
        socio_natillera_id: formPrestamo.socio_natillera_id,
        monto: formPrestamo.monto,
        interes: formPrestamo.interes,
        saldo_actual: formPrestamo.monto,
        estado: 'activo'
      })
      .select(`
        *,
        socio_natillera:socios_natillera(*, socio:socios(*))
      `)
      .single()

    if (error) throw error
    
    prestamos.value.unshift(data)
    modalNuevoPrestamo.value = false
    formPrestamo.socio_natillera_id = ''
    formPrestamo.monto = 100000
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    loading.value = false
  }
}

async function handleRegistrarAbono() {
  if (!prestamoSeleccionado.value) return
  loading.value = true

  try {
    const nuevoSaldo = prestamoSeleccionado.value.saldo_actual - formAbono.valor
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'activo'

    // Registrar el pago
    await supabase
      .from('pagos_prestamo')
      .insert({
        prestamo_id: prestamoSeleccionado.value.id,
        valor: formAbono.valor,
        fecha: new Date().toISOString()
      })

    // Actualizar el préstamo
    const { data, error } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoSeleccionado.value.id)
      .select()
      .single()

    if (error) throw error

    // Actualizar en la lista local
    const index = prestamos.value.findIndex(p => p.id === prestamoSeleccionado.value.id)
    if (index !== -1) {
      prestamos.value[index] = { ...prestamos.value[index], ...data }
    }

    modalAbono.value = false
    prestamoSeleccionado.value = null
  } catch (e) {
    alert('Error: ' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPrestamos()
  fetchSocios()
})
</script>


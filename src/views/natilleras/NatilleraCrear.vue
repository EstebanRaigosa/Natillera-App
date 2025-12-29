<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <router-link to="/natilleras" class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
        </div>
        <span class="whitespace-nowrap">Volver a natilleras</span>
      </router-link>
      <h1 class="text-3xl font-display font-bold text-gray-800">
        Crear Nueva Natillera
      </h1>
      <p class="text-gray-500 mt-2">
        Configura tu grupo de ahorro comunitario
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="card space-y-6">
      <div>
        <label class="label">Nombre de la natillera *</label>
        <input 
          v-model="form.nombre"
          type="text" 
          class="input-field"
          placeholder="Ej: Natillera Familia García 2025"
          required
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="label">Fecha de inicio *</label>
          <input 
            v-model="form.fecha_inicio"
            type="date" 
            class="input-field"
            required
          />
        </div>

        <div>
          <label class="label">Periodicidad *</label>
          <select v-model="form.periodicidad" class="input-field" required>
            <option value="">Selecciona...</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>

      <div>
        <label class="label">Descripción (opcional)</label>
        <textarea 
          v-model="form.descripcion"
          class="input-field"
          rows="3"
          placeholder="Describe brevemente el propósito de esta natillera..."
        ></textarea>
      </div>

      <!-- Reglas de multas -->
      <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <h3 class="font-semibold text-amber-800 flex items-center gap-2 mb-4">
          <ExclamationTriangleIcon class="w-5 h-5" />
          Reglas de Multas
        </h3>
        
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              v-model="form.multa_activa"
              id="multa_activa"
              class="w-5 h-5 rounded border-gray-300 text-natillera-600 focus:ring-natillera-500"
            />
            <label for="multa_activa" class="text-gray-700">
              Aplicar multas por pago tardío
            </label>
          </div>

          <div v-if="form.multa_activa" class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Valor de la multa ($)</label>
              <input 
                v-model.number="form.valor_multa"
                type="number" 
                class="input-field"
                placeholder="5000"
                min="0"
              />
            </div>
            <div>
              <label class="label">Días de gracia</label>
              <input 
                v-model.number="form.dias_gracia"
                type="number" 
                class="input-field"
                placeholder="3"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Reglas de intereses -->
      <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 class="font-semibold text-blue-800 flex items-center gap-2 mb-4">
          <CurrencyDollarIcon class="w-5 h-5" />
          Reglas de Préstamos
        </h3>
        
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <input 
              type="checkbox" 
              v-model="form.prestamos_activos"
              id="prestamos_activos"
              class="w-5 h-5 rounded border-gray-300 text-natillera-600 focus:ring-natillera-500"
            />
            <label for="prestamos_activos" class="text-gray-700">
              Permitir préstamos internos
            </label>
          </div>

          <div v-if="form.prestamos_activos" class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Interés mensual (%)</label>
              <input 
                v-model.number="form.interes_prestamo"
                type="number" 
                class="input-field"
                placeholder="2"
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div>
              <label class="label">Plazo máximo (meses)</label>
              <input 
                v-model.number="form.plazo_maximo"
                type="number" 
                class="input-field"
                placeholder="6"
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {{ error }}
      </div>

      <div class="flex gap-3 pt-4">
        <router-link to="/natilleras" class="btn-secondary flex-1 text-center">
          Cancelar
        </router-link>
        <button 
          type="submit" 
          class="btn-primary flex-1"
          :disabled="natillerasStore.loading"
        >
          {{ natillerasStore.loading ? 'Creando...' : 'Crear Natillera' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const natillerasStore = useNatillerasStore()

const error = ref('')
const form = reactive({
  nombre: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  periodicidad: 'mensual',
  descripcion: '',
  multa_activa: true,
  valor_multa: 5000,
  dias_gracia: 3,
  prestamos_activos: true,
  interes_prestamo: 2,
  plazo_maximo: 6
})

async function handleSubmit() {
  error.value = ''

  const datos = {
    nombre: form.nombre,
    fecha_inicio: form.fecha_inicio,
    periodicidad: form.periodicidad,
    descripcion: form.descripcion,
    reglas_multas: form.multa_activa ? {
      activa: true,
      valor: form.valor_multa,
      dias_gracia: form.dias_gracia
    } : { activa: false },
    reglas_interes: form.prestamos_activos ? {
      activo: true,
      porcentaje: form.interes_prestamo,
      plazo_maximo: form.plazo_maximo
    } : { activo: false }
  }

  const result = await natillerasStore.crearNatillera(datos)

  if (result.success) {
    router.push(`/natilleras/${result.data.id}`)
  } else {
    error.value = result.error
  }
}
</script>


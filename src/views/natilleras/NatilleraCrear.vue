<template>
  <div class="max-w-2xl mx-auto relative">
    <!-- Decoraciones de fondo animadas -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-0 w-72 h-72 bg-natillera-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Header -->
    <div class="mb-8 animate-fade-in-up">
      <router-link to="/natilleras" class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-md hover:shadow-natillera-200/50 transition-all duration-300 mb-2 sm:mb-4 text-xs sm:text-sm">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-300 group-hover:scale-110">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-300" />
        </div>
        <span class="whitespace-nowrap">Volver a natilleras</span>
      </router-link>
      <div class="relative">
        <h1 class="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
          Crear Nueva Natillera
        </h1>
        <div class="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-natillera-400 via-emerald-400 to-natillera-400 rounded-full transform scale-x-0 animate-scale-x"></div>
      </div>
      <p class="text-gray-500 mt-3 text-sm sm:text-base">
        Configura tu grupo de ahorro comunitario
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="card space-y-6 animate-fade-in-up stagger-1">
      <!-- Información básica -->
      <div class="space-y-6 animate-fade-in-up stagger-2">
        <div class="relative">
          <label class="label flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-natillera-500 animate-pulse"></span>
            Nombre de la natillera *
          </label>
          <div class="relative">
            <input 
              v-model="form.nombre"
              type="text" 
              class="input-field peer"
              placeholder="Ej: Natillera Familia García 2025"
              required
            />
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="relative group">
            <label class="label flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-natillera-500 animate-pulse"></span>
              Fecha de inicio *
            </label>
            <div class="relative">
              <input 
                v-model="form.fecha_inicio"
                type="date" 
                lang="es-CO"
                class="input-field peer"
                required
              />
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
            </div>
          </div>

          <div class="relative group">
            <label class="label flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-natillera-500 animate-pulse"></span>
              Periodicidad *
            </label>
            <div class="relative">
              <select v-model="form.periodicidad" class="input-field peer appearance-none cursor-pointer" required>
                <option value="">Selecciona...</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-natillera-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
            </div>
          </div>
        </div>

        <div class="relative">
          <label class="label">Descripción (opcional)</label>
          <textarea 
            v-model="form.descripcion"
            class="input-field peer resize-none"
            rows="3"
            placeholder="Describe brevemente el propósito de esta natillera..."
          ></textarea>
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
        </div>
      </div>

      <!-- Reglas de multas -->
      <div class="relative p-5 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-100/50 shadow-lg shadow-amber-100/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 animate-fade-in-up stagger-4 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-amber-800 flex items-center gap-2.5 mb-5 text-lg">
            <div class="p-1.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg shadow-md">
              <ExclamationTriangleIcon class="w-5 h-5 text-white" />
            </div>
            <span>Reglas de Multas</span>
          </h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-100/50 hover:bg-white/90 hover:shadow-md transition-all duration-300">
              <label for="multa_activa" class="relative flex items-center cursor-pointer group flex-1">
                <input 
                  type="checkbox" 
                  v-model="form.multa_activa"
                  id="multa_activa"
                  class="sr-only peer"
                />
                <!-- Toggle mejorado -->
                <div class="relative w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 peer-checked:shadow-lg peer-checked:shadow-amber-500/50 peer-focus:ring-2 peer-focus:ring-amber-500/50 peer-focus:ring-offset-2">
                  <!-- Círculo del toggle -->
                  <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                    <!-- Icono de check cuando está activo -->
                    <svg v-if="form.multa_activa" class="w-4 h-4 text-amber-600 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <!-- Icono de X cuando está inactivo -->
                    <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <!-- Efecto de brillo cuando está activo -->
                  <div v-if="form.multa_activa" class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-toggle"></div>
                </div>
                <span class="ml-4 text-gray-700 font-semibold group-hover:text-amber-800 transition-colors text-sm sm:text-base">
                  Aplicar multas por pago tardío
                </span>
              </label>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-4"
              enter-to-class="opacity-100 max-h-96 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-4"
            >
              <div v-if="form.multa_activa" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="label text-amber-800">Valor de la multa ($)</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.valor_multa"
                      type="number" 
                      class="input-field bg-white/90 border-amber-200 focus:border-amber-400 focus:ring-amber-400/30"
                      placeholder="5000"
                      min="0"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 peer-focus:via-amber-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>
                <div class="relative">
                  <label class="label text-amber-800">Días de gracia</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.dias_gracia"
                      type="number" 
                      class="input-field bg-white/90 border-amber-200 focus:border-amber-400 focus:ring-amber-400/30"
                      placeholder="3"
                      min="0"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 peer-focus:via-amber-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Reglas de intereses -->
      <div class="relative p-5 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-100/50 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 animate-fade-in-up stagger-5 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-blue-800 flex items-center gap-2.5 mb-5 text-lg">
            <div class="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
              <CurrencyDollarIcon class="w-5 h-5 text-white" />
            </div>
            <span>Reglas de Préstamos</span>
          </h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:bg-white/90 hover:shadow-md transition-all duration-300">
              <label for="prestamos_activos" class="relative flex items-center cursor-pointer group flex-1">
                <input 
                  type="checkbox" 
                  v-model="form.prestamos_activos"
                  id="prestamos_activos"
                  class="sr-only peer"
                />
                <!-- Toggle mejorado -->
                <div class="relative w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 peer-checked:shadow-lg peer-checked:shadow-blue-500/50 peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-focus:ring-offset-2">
                  <!-- Círculo del toggle -->
                  <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                    <!-- Icono de check cuando está activo -->
                    <svg v-if="form.prestamos_activos" class="w-4 h-4 text-blue-600 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <!-- Icono de X cuando está inactivo -->
                    <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <!-- Efecto de brillo cuando está activo -->
                  <div v-if="form.prestamos_activos" class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-toggle"></div>
                </div>
                <span class="ml-4 text-gray-700 font-semibold group-hover:text-blue-800 transition-colors text-sm sm:text-base">
                  Permitir préstamos internos
                </span>
              </label>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-4"
              enter-to-class="opacity-100 max-h-96 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-4"
            >
              <div v-if="form.prestamos_activos" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="label text-blue-800">Interés mensual (%)</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.interes_prestamo"
                      type="number" 
                      class="input-field bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-400/30"
                      placeholder="2"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 peer-focus:via-blue-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>
                <div class="relative">
                  <label class="label text-blue-800">Plazo máximo (meses)</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.plazo_maximo"
                      type="number" 
                      class="input-field bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-400/30"
                      placeholder="6"
                      min="1"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 peer-focus:via-blue-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="error" class="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl text-red-700 text-sm shadow-md flex items-center gap-3 animate-fade-in-up">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
      </Transition>

      <div class="flex flex-col sm:flex-row gap-3 pt-6 animate-fade-in-up stagger-6">
        <router-link to="/natilleras" class="btn-secondary flex-1 text-center group relative overflow-hidden">
          <span class="relative z-10">Cancelar</span>
          <div class="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </router-link>
        <button 
          type="submit" 
          class="btn-primary flex-1 relative overflow-hidden group"
          :disabled="natillerasStore.loading"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg v-if="natillerasStore.loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ natillerasStore.loading ? 'Creando...' : 'Crear Natillera' }}</span>
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-natillera-600 to-natillera-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div v-if="!natillerasStore.loading" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { Transition } from 'vue'
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

  // Estructurar reglas_multas correctamente para activar las multas en la configuración
  const reglasMultas = form.multa_activa ? {
    activa: true,
    dias_gracia: form.dias_gracia,
    sanciones: {
      activa: true, // Esto activa las multas en la configuración
      tipo: 'simple', // Tipo por defecto: simple (multa fija)
      valorFijo: form.valor_multa,
      niveles: [
        { cuotas: 1, valor: form.valor_multa },
        { cuotas: 2, valor: form.valor_multa },
        { cuotas: 3, valor: form.valor_multa },
        { cuotas: 4, valor: form.valor_multa }
      ],
      interesesAdicionales: {
        activo: false,
        dias: 2,
        valor: 500
      },
      devolucion: {
        activo: false,
        cuotasLimite: 5,
        porcentajeMulta: 25,
        sinUtilidades: true
      }
    }
  } : { 
    activa: false,
    sanciones: {
      activa: false
    }
  }

  const datos = {
    nombre: form.nombre,
    fecha_inicio: form.fecha_inicio,
    periodicidad: form.periodicidad,
    descripcion: form.descripcion,
    reglas_multas: reglasMultas,
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

<style scoped>
/* Animación de pulso lento para decoraciones */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

/* Animación de entrada escalonada */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }

/* Animación scale-x para la línea decorativa */
@keyframes scale-x {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }
  100% {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.animate-scale-x {
  animation: scale-x 0.8s ease-out 0.3s forwards;
}

/* Animación de entrada para el icono de check */
@keyframes scale-in {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

/* Animación shimmer para el toggle */
@keyframes shimmer-toggle {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer-toggle {
  animation: shimmer-toggle 2s ease-in-out infinite;
}
</style>


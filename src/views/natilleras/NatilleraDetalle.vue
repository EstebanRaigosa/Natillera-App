<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Loading -->
    <div v-if="natillerasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando natillera...</p>
    </div>

    <template v-else-if="natillera">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <router-link to="/natilleras" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-natillera-700 font-semibold rounded-lg border border-natillera-200 shadow-sm hover:bg-natillera-50 hover:border-natillera-300 transition-all mb-3">
            <ArrowLeftIcon class="w-4 h-4" />
            Volver
          </router-link>
          <h1 class="text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
            {{ natillera.nombre }}
            <span 
              :class="[
                'badge text-sm',
                natillera.estado === 'activa' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ natillera.estado }}
            </span>
          </h1>
          <p class="text-gray-500 mt-1">
            {{ natillera.periodicidad }} • Desde {{ formatDate(natillera.fecha_inicio) }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button 
            @click="modalWhatsApp = true"
            class="btn-secondary py-2 px-4 inline-flex items-center gap-2"
          >
            <ChatBubbleLeftIcon class="w-5 h-5" />
            Notificar
          </button>
          <button 
            v-if="natillera.estado === 'activa'"
            @click="handleCerrarNatillera"
            class="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
          >
            Cerrar Natillera
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <p class="stat-value">{{ estadisticas.totalSocios }}</p>
          <p class="stat-label">Socios</p>
        </div>
        <div class="stat-card">
          <p class="stat-value text-natillera-600">${{ formatMoney(estadisticas.totalAportado) }}</p>
          <p class="stat-label">Recaudado</p>
        </div>
        <div class="stat-card">
          <p class="stat-value text-amber-600">${{ formatMoney(estadisticas.totalPendiente) }}</p>
          <p class="stat-label">Pendiente</p>
        </div>
        <div class="stat-card">
          <p class="stat-value text-purple-600">${{ formatMoney(estadisticas.fondoTotal) }}</p>
          <p class="stat-label">Fondo Total</p>
        </div>
      </div>

      <!-- Navegación tabs -->
      <div class="flex gap-3 overflow-x-auto pb-2">
        <router-link 
          :to="`/natilleras/${id}/socios`"
          class="py-2.5 px-5 whitespace-nowrap inline-flex items-center gap-2 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all"
        >
          <UsersIcon class="w-5 h-5" />
          Socios
        </router-link>
        <router-link 
          :to="`/natilleras/${id}/cuotas`"
          class="py-2.5 px-5 whitespace-nowrap inline-flex items-center gap-2 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all"
        >
          <CurrencyDollarIcon class="w-5 h-5" />
          Cuotas
        </router-link>
        <router-link 
          :to="`/natilleras/${id}/prestamos`"
          class="py-2.5 px-5 whitespace-nowrap inline-flex items-center gap-2 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all"
        >
          <BanknotesIcon class="w-5 h-5" />
          Préstamos
        </router-link>
        <router-link 
          :to="`/natilleras/${id}/actividades`"
          class="py-2.5 px-5 whitespace-nowrap inline-flex items-center gap-2 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all"
        >
          <CalendarIcon class="w-5 h-5" />
          Actividades
        </router-link>
      </div>

      <!-- Socios resumen -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-display font-bold text-gray-800">
            Socios Recientes
          </h2>
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-natillera-600 text-white hover:bg-natillera-700 font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Ver todos
            <ArrowRightIcon class="w-4 h-4" />
          </router-link>
        </div>

        <div v-if="natillera.socios_natillera?.length === 0" class="text-center py-8">
          <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No hay socios registrados</p>
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="btn-primary mt-4 inline-block"
          >
            Agregar socios
          </router-link>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="sn in sociosRecientes" 
            :key="sn.id"
            @click="verDetalleSocio(sn)"
            class="flex items-center justify-between p-4 bg-white rounded-xl cursor-pointer hover:bg-natillera-50 border border-gray-200 shadow-sm hover:shadow-md hover:border-natillera-200 transition-all"
          >
            <div class="flex items-center gap-3">
              <img 
                :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed)" 
                :alt="sn.socio?.nombre"
                class="w-10 h-10 rounded-full bg-natillera-100"
              />
              <div>
                <p class="font-medium text-gray-800">{{ sn.socio?.nombre }}</p>
                <p class="text-sm text-gray-500">Cuota: ${{ formatMoney(sn.valor_cuota_individual) }}</p>
              </div>
            </div>
            <span 
              :class="[
                'badge',
                sn.estado === 'activo' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ sn.estado }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="card text-center py-12">
      <p class="text-gray-500">No se encontró la natillera</p>
      <router-link to="/natilleras" class="btn-primary mt-4 inline-block">
        Volver a natilleras
      </router-link>
    </div>

    <!-- Modal WhatsApp -->
    <div v-if="modalWhatsApp" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalWhatsApp = false"></div>
      <div class="card relative max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-4">
          Enviar Recordatorio por WhatsApp
        </h3>
        <p class="text-gray-500 text-sm mb-4">
          Selecciona un socio para enviarle un recordatorio de pago. Se abrirá WhatsApp con el mensaje prellenado.
        </p>
        
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <button 
            v-for="sn in natillera?.socios_natillera" 
            :key="sn.id"
            @click="enviarWhatsApp(sn)"
            class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors text-left"
          >
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              <ChatBubbleLeftIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ sn.socio?.nombre }}</p>
              <p class="text-sm text-gray-500">{{ sn.socio?.telefono || 'Sin teléfono' }}</p>
            </div>
          </button>
        </div>

        <button 
          @click="modalWhatsApp = false"
          class="btn-secondary w-full mt-4"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- Modal Detalle Socio -->
    <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalDetalle = false"></div>
      <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Header del modal -->
        <div class="flex items-center gap-4 mb-6">
          <img 
            :src="getAvatarUrl(socioSeleccionado?.socio?.nombre || socioSeleccionado?.id, socioSeleccionado?.socio?.avatar_seed)" 
            :alt="socioSeleccionado?.socio?.nombre"
            class="w-16 h-16 rounded-2xl bg-natillera-100 shadow-lg"
          />
          <div class="flex-1">
            <h3 class="text-xl font-display font-bold text-gray-800">
              {{ socioSeleccionado?.socio?.nombre }}
            </h3>
            <span 
              :class="[
                'badge mt-1',
                socioSeleccionado?.estado === 'activo' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ socioSeleccionado?.estado }}
            </span>
          </div>
          <button 
            @click="modalDetalle = false"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Indicador de estado (siempre visible) -->
        <div 
          :class="[
            'p-4 rounded-xl mb-4 flex items-center gap-3',
            resumenSocio.alDia 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          ]"
        >
          <component 
            :is="resumenSocio.alDia ? CheckCircleIcon : ExclamationCircleIcon"
            :class="[
              'w-8 h-8',
              resumenSocio.alDia ? 'text-green-500' : 'text-red-500'
            ]"
          />
          <div>
            <p :class="['font-semibold', resumenSocio.alDia ? 'text-green-700' : 'text-red-700']">
              {{ resumenSocio.alDia ? '¡Al día con los pagos!' : 'Tiene pagos pendientes' }}
            </p>
            <p class="text-sm text-gray-600">
              {{ resumenSocio.alDia 
                ? 'Este socio ha cumplido con todas sus cuotas' 
                : `Debe ${resumenSocio.cuotasPendientes + resumenSocio.cuotasMora} cuota(s)` 
              }}
            </p>
          </div>
        </div>

        <!-- Secciones desplegables -->
        <div class="space-y-3">
          
          <!-- Sección: Resumen Financiero -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('finanzas')"
              class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-green-600" />
                Resumen Financiero
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'finanzas' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'finanzas'" class="p-4 border-t border-gray-100 bg-white">
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p class="text-xs font-medium text-green-600 mb-1">TOTAL APORTADO</p>
                  <p class="text-2xl font-bold text-green-700">${{ formatMoney(resumenSocio.totalAportado) }}</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                  <p class="text-xs font-medium text-amber-600 mb-1">PENDIENTE</p>
                  <p class="text-2xl font-bold text-amber-700">${{ formatMoney(resumenSocio.totalPendiente) }}</p>
                </div>
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cuotas</p>
              <div class="grid grid-cols-3 gap-2">
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-xl font-bold text-green-600">{{ resumenSocio.cuotasPagadas }}</p>
                  <p class="text-xs text-gray-500">Pagadas</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-xl font-bold text-amber-600">{{ resumenSocio.cuotasPendientes }}</p>
                  <p class="text-xs text-gray-500">Pendientes</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-xl font-bold text-red-600">{{ resumenSocio.cuotasMora }}</p>
                  <p class="text-xs text-gray-500">En Mora</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Información de Contacto -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('contacto')"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <UserIcon class="w-5 h-5 text-gray-600" />
                Información de Contacto
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'contacto' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'contacto'" class="p-4 border-t border-gray-100 bg-white space-y-2">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon class="w-5 h-5 text-gray-400" />
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Teléfono / WhatsApp</p>
                  <p class="font-medium text-gray-800">{{ socioSeleccionado?.socio?.telefono || 'No registrado' }}</p>
                </div>
                <a 
                  v-if="socioSeleccionado?.socio?.telefono"
                  :href="`https://wa.me/57${socioSeleccionado.socio.telefono.replace(/\D/g, '')}`"
                  target="_blank"
                  class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Enviar mensaje
                </a>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Correo electrónico</p>
                  <p class="font-medium text-gray-800">{{ socioSeleccionado?.socio?.email || 'No registrado' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <IdentificationIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Documento de identidad</p>
                  <p class="font-medium text-gray-800">{{ socioSeleccionado?.socio?.documento || 'No registrado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Configuración en la Natillera -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('config')"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <CurrencyDollarIcon class="w-5 h-5 text-gray-600" />
                Configuración de Cuotas
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'config' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'config'" class="p-4 border-t border-gray-100 bg-white">
              <div class="grid grid-cols-2 gap-3">
                <div class="p-4 bg-natillera-50 rounded-xl border border-natillera-100">
                  <p class="text-xs text-gray-500 mb-1">Cuota mensual</p>
                  <p class="text-xl font-bold text-natillera-700">${{ formatMoney(socioSeleccionado?.valor_cuota_individual) }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Cuotas por período</p>
                  <p class="text-xl font-bold text-gray-700">{{ socioSeleccionado?.cantidad_cuotas || 1 }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Botón de cerrar -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <button 
            @click="modalDetalle = false"
            class="btn-primary w-full"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon
} from '@heroicons/vue/24/outline'
import { useSociosStore } from '../../stores/socios'

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const sociosStore = useSociosStore()

const modalWhatsApp = ref(false)
const modalDetalle = ref(false)
const socioSeleccionado = ref(null)
const cuotasSocio = ref([])
const seccionActiva = ref('finanzas')

const natillera = computed(() => natillerasStore.natilleraActual)

// Socios ordenados por fecha de ingreso (más recientes primero)
const sociosRecientes = computed(() => {
  if (!natillera.value?.socios_natillera) return []
  
  return [...natillera.value.socios_natillera]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

// Resumen financiero del socio seleccionado
const resumenSocio = computed(() => {
  if (!cuotasSocio.value.length) {
    return {
      totalAportado: 0,
      totalPendiente: 0,
      cuotasPagadas: 0,
      cuotasPendientes: 0,
      cuotasMora: 0,
      alDia: true
    }
  }

  const pagadas = cuotasSocio.value.filter(c => c.estado === 'pagada')
  const pendientes = cuotasSocio.value.filter(c => c.estado === 'pendiente' || c.estado === 'parcial')
  const enMora = cuotasSocio.value.filter(c => c.estado === 'mora')

  const totalAportado = cuotasSocio.value.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  const totalPendiente = cuotasSocio.value
    .filter(c => c.estado !== 'pagada')
    .reduce((sum, c) => sum + (c.valor_cuota - (c.valor_pagado || 0)), 0)

  return {
    totalAportado,
    totalPendiente,
    cuotasPagadas: pagadas.length,
    cuotasPendientes: pendientes.length,
    cuotasMora: enMora.length,
    alDia: pendientes.length === 0 && enMora.length === 0
  }
})

const estadisticas = computed(() => {
  return natillerasStore.calcularEstadisticas(natillera.value) || {
    totalSocios: 0,
    sociosActivos: 0,
    totalAportado: 0,
    totalPendiente: 0,
    utilidadActividades: 0,
    fondoTotal: 0
  }
})

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function getAvatarUrl(seed, avatarSeed = null) {
  // Usar DiceBear Avatars con estilo "adventurer"
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function enviarWhatsApp(socioNatillera) {
  const telefono = socioNatillera.socio?.telefono?.replace(/\D/g, '')
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado')
    return
  }

  const mensaje = `Hola ${socioNatillera.socio?.nombre} 👋

Te recordamos que tienes pendiente la cuota de la natillera "${natillera.value?.nombre}".

💰 Valor: $${formatMoney(socioNatillera.valor_cuota_individual)}

Gracias por apoyar la natillera 🙌`

  const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
  modalWhatsApp.value = false
}

async function handleCerrarNatillera() {
  if (!confirm('¿Estás seguro de cerrar esta natillera? Esta acción no se puede deshacer.')) {
    return
  }
  
  const result = await natillerasStore.cerrarNatillera(props.id || route.params.id)
  if (result.success) {
    alert('Natillera cerrada exitosamente')
  } else {
    alert('Error al cerrar la natillera: ' + result.error)
  }
}

function toggleSeccion(seccion) {
  seccionActiva.value = seccionActiva.value === seccion ? null : seccion
}

async function verDetalleSocio(sn) {
  socioSeleccionado.value = sn
  modalDetalle.value = true
  seccionActiva.value = 'finanzas'
  
  // Cargar cuotas del socio
  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  cuotasSocio.value = resumen?.cuotas || []
}

onMounted(() => {
  const natilleraId = props.id || route.params.id
  natillerasStore.fetchNatillera(natilleraId)
})
</script>


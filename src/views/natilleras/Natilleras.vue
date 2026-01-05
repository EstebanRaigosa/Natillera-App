<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
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
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Mis Natilleras
              </h1>
              <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                Administra tus grupos de ahorro
              </p>
            </div>
          </div>
          <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            Nueva Natillera
          </router-link>
        </div>
      </div>
    </div>

    <!-- Filtros estilizados -->
    <div class="flex flex-wrap gap-2">
      <button 
        @click="filtro = 'todas'"
        :class="[
          'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
          filtro === 'todas'
            ? 'text-white shadow-lg'
            : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
        ]"
      >
        <div 
          v-if="filtro === 'todas'"
          class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
        ></div>
        <span class="relative flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="filtro === 'todas' ? 'bg-white' : 'bg-gray-400'"></span>
          Todas
        </span>
      </button>
      <button 
        @click="filtro = 'activa'"
        :class="[
          'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
          filtro === 'activa'
            ? 'text-white shadow-lg shadow-natillera-500/30'
            : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
        ]"
      >
        <div 
          v-if="filtro === 'activa'"
          class="absolute inset-0 bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500"
        ></div>
        <span class="relative flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="filtro === 'activa' ? 'bg-white' : 'bg-natillera-400'"></span>
          Activas
        </span>
      </button>
      <button 
        @click="filtro = 'cerrada'"
        :class="[
          'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
          filtro === 'cerrada'
            ? 'text-white shadow-lg shadow-amber-500/30'
            : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-amber-300 hover:shadow-md'
        ]"
      >
        <div 
          v-if="filtro === 'cerrada'"
          class="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
        ></div>
        <span class="relative flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="filtro === 'cerrada' ? 'bg-white' : 'bg-amber-400'"></span>
          Cerradas
        </span>
      </button>
    </div>

    <!-- Lista -->
    <div v-if="natillerasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando natilleras...</p>
    </div>

    <div v-else-if="natillerasFiltradas.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-natillera-100 to-emerald-100 mb-6">
          <BanknotesIcon class="w-10 h-10 text-natillera-600" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-3">
          {{ filtro === 'todas' ? 'No tienes natilleras' : `No hay natilleras ${filtro}s` }}
        </h3>
        <p class="text-gray-600 mt-2 mb-8 text-base">
          {{ filtro === 'todas' ? 'Crea tu primera natillera para comenzar' : 'Cambia el filtro para ver otras' }}
        </p>
        <router-link v-if="filtro === 'todas'" to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg">
          <PlusIcon class="w-5 h-5" />
          Crear Primera Natillera
        </router-link>
      </div>
    </div>

    <div v-else class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="natillera in natillerasFiltradas" 
        :key="natillera.id"
        class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300"
      >
        <!-- Botón eliminar (solo si tiene permisos) -->
        <button
          v-if="puedeEliminarNatillera(natillera)"
          @click.stop="confirmarEliminarNatillera(natillera)"
          class="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm border border-red-200/50 text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-md hover:shadow-lg hover:bg-red-50 hover:border-red-300 hover:scale-110 transform duration-200"
          title="Eliminar natillera"
        >
          <TrashIcon class="w-4 h-4" />
        </button>

        <router-link 
          :to="`/natilleras/${natillera.id}`"
          class="block p-6"
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
            
            <h3 class="font-display font-bold text-gray-800 text-xl mb-2 group-hover:text-natillera-700 transition-colors">
              {{ natillera.nombre }}
            </h3>
            
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span class="px-2.5 py-1 bg-natillera-100 text-natillera-700 rounded-lg font-semibold text-xs">
                {{ natillera.periodicidad }}
              </span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-500">Desde {{ formatDate(natillera.fecha_inicio) }}</span>
            </div>

            <div class="pt-4 border-t border-gray-200/50 flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <UsersIcon class="w-4 h-4 text-gray-600" />
                </div>
                <span class="font-semibold">{{ natillera.socios_count || 0 }} socios</span>
              </div>
              <div class="w-8 h-8 rounded-lg bg-natillera-100 group-hover:bg-natillera-200 flex items-center justify-center transition-colors">
                <ChevronRightIcon class="w-5 h-5 text-natillera-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar natillera -->
    <div v-if="natilleraAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="natilleraAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <TrashIcon class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Eliminar Natillera</h3>
            <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-700 mb-2">
            ¿Estás seguro de que deseas eliminar la natillera <strong>"{{ natilleraAEliminar.nombre }}"</strong>?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <p class="font-semibold mb-1">⚠️ Se eliminarán permanentemente:</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>Todos los socios asociados</li>
              <li>Todas las cuotas</li>
              <li>Todos los préstamos y pagos</li>
              <li>Todas las actividades</li>
              <li>Todos los registros de historial</li>
            </ul>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="natilleraAEliminar = null"
            class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="eliminarNatilleraConfirmado"
            :disabled="natillerasStore.loading"
            class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ natillerasStore.loading ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNatillerasStore } from '../../stores/natilleras'
import { useUsersStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import { supabase } from '../../lib/supabase'
import { getNatilleraAvatarUrl } from '../../utils/avatars'

const notificationStore = useNotificationStore()
import { 
  BanknotesIcon, 
  UsersIcon, 
  PlusIcon,
  ChevronRightIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const natillerasStore = useNatillerasStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const filtro = ref('todas')
const natilleraAEliminar = ref(null)
const usuarioAutenticado = ref(null)

const natillerasFiltradas = computed(() => {
  if (filtro.value === 'todas') {
    return natillerasStore.natilleras
  }
  return natillerasStore.natilleras.filter(n => n.estado === filtro.value)
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short'
  })
}

// Verificar si el usuario puede eliminar una natillera
// El superusuario (raigo.16@gmail.com) puede eliminar cualquier natillera
// Cualquier otro usuario solo puede eliminar sus propias natilleras
function puedeEliminarNatillera(natillera) {
  // Verificar que el usuario esté autenticado
  if (!usuarioAutenticado.value) {
    return false
  }

  // El superusuario puede eliminar cualquier natillera (comparación case-insensitive)
  const emailUsuario = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  if (emailUsuario === 'raigo.16@gmail.com') {
    return true
  }

  // Otros usuarios solo pueden eliminar sus propias natilleras
  return natillera.admin_id === usuarioAutenticado.value.id
}

function confirmarEliminarNatillera(natillera) {
  natilleraAEliminar.value = natillera
}

async function eliminarNatilleraConfirmado() {
  if (!natilleraAEliminar.value) return

  const resultado = await natillerasStore.eliminarNatillera(natilleraAEliminar.value.id)
  
  if (resultado.success) {
    natilleraAEliminar.value = null
    // Recargar natilleras
    await natillerasStore.fetchNatilleras()
    notificationStore.success('Natillera eliminada exitosamente', 'Éxito')
  } else {
    // Mostrar error más descriptivo
    const mensajeError = resultado.error || 'Error desconocido al eliminar la natillera'
    
    // Si el error menciona permisos, dar instrucciones más específicas
    if (mensajeError.includes('permisos') || mensajeError.includes('42501')) {
      notificationStore.error(
        `${mensajeError}\n\nPor favor, ejecuta la migración SQL en Supabase: add_cascade_delete_policies.sql`,
        'Error de permisos'
      )
    } else {
      notificationStore.error(
        `Error al eliminar la natillera:\n\n${mensajeError}\n\nRevisa la consola del navegador (F12) para más detalles.`,
        'Error'
      )
    }
  }
}

onMounted(async () => {
  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user
  
  // Cargar perfil del usuario para verificar permisos
  await usersStore.getCurrentUserProfile()
  // Cargar natilleras
  await natillerasStore.fetchNatilleras()
})
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo o Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4">
          <UserGroupIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl font-display font-bold text-gray-800">Invitación a Colaborar</h1>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Procesando invitación...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircleIcon class="w-8 h-8 text-red-500" />
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Error</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <router-link to="/natilleras" class="btn-primary bg-gradient-to-r from-blue-500 to-indigo-500">
          Ir a Natilleras
        </router-link>
      </div>

      <!-- Éxito -->
      <div v-else-if="exito" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon class="w-8 h-8 text-green-500" />
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">¡Invitación Aceptada!</h2>
        <p class="text-gray-600 mb-2">
          Ahora eres <span class="font-semibold text-blue-600">{{ formatearRol(resultado?.rol) }}</span> de:
        </p>
        <p class="text-lg font-bold text-gray-800 mb-6">{{ resultado?.natillera_nombre }}</p>
        <router-link 
          :to="`/natilleras/${resultado?.natillera_id}`" 
          class="btn-primary bg-gradient-to-r from-blue-500 to-indigo-500"
        >
          Ver Natillera
        </router-link>
      </div>

      <!-- Confirmar invitación -->
      <div v-else-if="invitacion" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white text-center">
          <h2 class="text-xl font-bold mb-2">Has sido invitado</h2>
          <p class="text-blue-100">{{ invitacion.invitado_por_nombre }} te ha invitado a colaborar</p>
        </div>
        
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg mb-4">
              <img 
                :src="getNatilleraAvatarUrl(invitacion.natillera_nombre)"
                :alt="invitacion.natillera_nombre"
                class="w-full h-full object-cover"
              />
            </div>
            <h3 class="text-xl font-bold text-gray-800">{{ invitacion.natillera_nombre }}</h3>
            <p class="text-gray-500 mt-1">
              Rol: <span :class="['font-semibold', obtenerClaseRol(invitacion.rol)]">{{ formatearRol(invitacion.rol) }}</span>
            </p>
          </div>

          <!-- Permisos que tendrás -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Permisos que tendrás:</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(activo, permiso) in invitacion.permisos"
                :key="permiso"
                v-show="activo"
                class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium"
              >
                {{ formatearPermiso(permiso) }}
              </span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button
              @click="rechazar"
              :disabled="procesando"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              @click="aceptar"
              :disabled="procesando"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-colors disabled:opacity-50"
            >
              {{ procesando ? 'Procesando...' : 'Aceptar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- No autenticado -->
      <div v-else class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <ExclamationTriangleIcon class="w-8 h-8 text-amber-500" />
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Inicia Sesión</h2>
        <p class="text-gray-600 mb-6">
          Para aceptar esta invitación, primero debes iniciar sesión o crear una cuenta.
        </p>
        <router-link 
          :to="`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`" 
          class="btn-primary bg-gradient-to-r from-blue-500 to-indigo-500"
        >
          Iniciar Sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { getNatilleraAvatarUrl } from '../../utils/avatars'
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const colaboradoresStore = useColaboradoresStore()

const loading = ref(true)
const error = ref(null)
const exito = ref(false)
const resultado = ref(null)
const invitacion = ref(null)
const procesando = ref(false)

const token = route.params.token

function formatearRol(rol) {
  const nombres = {
    co_administrador: 'Co-Administrador',
    colaborador: 'Colaborador',
    visor: 'Visor'
  }
  return nombres[rol] || rol
}

function obtenerClaseRol(rol) {
  const clases = {
    co_administrador: 'text-purple-600',
    colaborador: 'text-blue-600',
    visor: 'text-gray-600'
  }
  return clases[rol] || 'text-gray-600'
}

function formatearPermiso(permiso) {
  const nombres = {
    ver: 'Ver',
    editar_socios: 'Socios',
    gestionar_cuotas: 'Cuotas',
    gestionar_prestamos: 'Préstamos',
    gestionar_actividades: 'Actividades',
    ver_auditoria: 'Auditoría',
    configurar: 'Configurar'
  }
  return nombres[permiso] || permiso
}

async function cargarInvitacion() {
  try {
    loading.value = true
    error.value = null

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      loading.value = false
      return
    }

    // Buscar la invitación
    const { data, error: fetchError } = await supabase
      .from('vista_colaboradores_natillera')
      .select('*')
      .eq('token_invitacion', token)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        error.value = 'Esta invitación no existe o ya fue procesada'
      } else {
        error.value = fetchError.message
      }
      return
    }

    if (data.estado !== 'pendiente') {
      if (data.estado === 'aceptada') {
        exito.value = true
        resultado.value = {
          natillera_id: data.natillera_id,
          natillera_nombre: data.natillera_nombre,
          rol: data.rol
        }
      } else {
        error.value = `Esta invitación ya fue ${data.estado === 'rechazada' ? 'rechazada' : 'revocada'}`
      }
      return
    }

    invitacion.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function aceptar() {
  try {
    procesando.value = true
    
    const res = await colaboradoresStore.aceptarInvitacion(token)
    
    if (res.success) {
      exito.value = true
      resultado.value = res.data
    } else {
      error.value = res.error
    }
  } catch (e) {
    error.value = e.message
  } finally {
    procesando.value = false
  }
}

async function rechazar() {
  if (!confirm('¿Estás seguro de que deseas rechazar esta invitación?')) {
    return
  }

  try {
    procesando.value = true
    
    const res = await colaboradoresStore.rechazarInvitacion(token)
    
    if (res.success) {
      router.push('/natilleras')
    } else {
      error.value = res.error
    }
  } catch (e) {
    error.value = e.message
  } finally {
    procesando.value = false
  }
}

onMounted(() => {
  cargarInvitacion()
})
</script>


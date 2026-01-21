<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
      <!-- Efectos decorativos -->
      <div class="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-16 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
              <UsersIcon class="w-6 h-6 sm:w-7 sm:h-8 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-display font-bold text-gray-800">
                Administración de Usuarios
              </h1>
              <p class="text-sm sm:text-base text-gray-600 mt-1">
                Gestiona usuarios, roles y permisos del sistema
              </p>
            </div>
          </div>
          <button
            @click="mostrarPanel = !mostrarPanel"
            class="p-3 bg-white border-2 border-natillera-200 text-natillera-600 rounded-xl hover:bg-natillera-50 hover:border-natillera-300 transition-all shadow-md hover:shadow-lg"
            :class="{ 'bg-natillera-50 border-natillera-300': mostrarPanel }"
          >
            <Bars3Icon class="w-6 h-6" />
          </button>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
            <p class="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{{ totalUsuarios }}</p>
            <p class="text-xs sm:text-sm font-semibold text-blue-700">Total Usuarios</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
            <p class="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{{ usuariosActivos }}</p>
            <p class="text-xs sm:text-sm font-semibold text-green-700">Activos</p>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 shadow-sm">
            <p class="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{{ totalAdmins }}</p>
            <p class="text-xs sm:text-sm font-semibold text-purple-700">Administradores</p>
          </div>
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm">
            <p class="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">{{ usuariosInactivos }}</p>
            <p class="text-xs sm:text-sm font-semibold text-amber-700">Inactivos</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Panel lateral de configuración -->
      <Transition name="slide-fade">
        <div 
          v-if="mostrarPanel"
          class="lg:w-80 bg-white rounded-2xl border border-gray-200 shadow-xl p-6 h-fit lg:sticky lg:top-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-display font-bold text-gray-800">Configuración</h2>
            <button
              @click="mostrarPanel = false"
              class="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Filtros -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <div class="relative">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="busqueda"
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Rol</label>
              <select
                v-model="filtroRol"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
              >
                <option value="">Todos los roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="usuario">Usuario</option>
                <option value="invitado">Invitado</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select
                v-model="filtroEstado"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
              >
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <button
              @click="resetearFiltros"
              class="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </Transition>

      <!-- Lista de usuarios -->
      <div class="flex-1 space-y-4">
        <!-- Loading -->
        <div v-if="usersStore.loading" class="text-center py-12">
          <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-gray-500 text-sm">Cargando usuarios...</p>
        </div>

        <!-- Error -->
        <div v-else-if="usersStore.error" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {{ usersStore.error }}
        </div>

        <!-- Lista -->
        <div v-else-if="usuariosFiltrados.length > 0" class="space-y-3">
          <div
            v-for="usuario in usuariosFiltrados"
            :key="usuario.id"
            class="bg-white rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            :class="[
              usuario.activo ? 'border-gray-200 hover:border-natillera-300' : 'border-red-200 bg-red-50/30',
              usuarioSeleccionado?.id === usuario.id ? 'border-natillera-500 ring-2 ring-natillera-200' : ''
            ]"
          >
            <div class="p-4 sm:p-6">
              <div class="flex items-start justify-between gap-4">
                <!-- Información del usuario -->
                <div class="flex items-start gap-4 flex-1 min-w-0">
                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <img
                      :src="getAvatarUrl(usuario.nombre || usuario.email, usuario.avatar_seed, usuario.avatar_style)"
                      :alt="usuario.nombre || usuario.email"
                      class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 shadow-md object-cover"
                      :class="[
                        usuario.rol === 'super_admin' ? 'border-purple-300' :
                        usuario.rol === 'admin' ? 'border-blue-300' :
                        usuario.activo ? 'border-gray-300' : 'border-red-300'
                      ]"
                    />
                    <!-- Badge de estado -->
                    <div
                      class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-md"
                      :class="usuario.activo ? 'bg-green-500' : 'bg-red-500'"
                    ></div>
                  </div>

                  <!-- Datos -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-2">
                      <h3 class="font-bold text-gray-800 text-base sm:text-lg truncate">
                        {{ usuario.nombre || usuario.email }}
                      </h3>
                      <!-- Badge de rol -->
                      <span
                        class="px-2.5 py-0.5 rounded-lg text-xs font-semibold border whitespace-nowrap"
                        :class="[
                          usuario.rol === 'super_admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          usuario.rol === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          usuario.rol === 'invitado' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                          'bg-green-100 text-green-700 border-green-200'
                        ]"
                      >
                        {{ getRolLabel(usuario.rol) }}
                      </span>
                      <!-- Badge de estado -->
                      <span
                        class="px-2 py-0.5 rounded-lg text-xs font-semibold"
                        :class="usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      >
                        {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 truncate mb-2">{{ usuario.email }}</p>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                      <span v-if="usuario.ultimo_acceso">
                        Último acceso: {{ formatDate(usuario.ultimo_acceso) }}
                      </span>
                      <span v-else class="text-gray-400">Sin acceso registrado</span>
                    </div>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    @click="seleccionarUsuario(usuario)"
                    class="p-2 bg-natillera-50 hover:bg-natillera-100 text-natillera-600 rounded-lg transition-colors"
                    title="Editar usuario"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-200">
          <UsersIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">No se encontraron usuarios</p>
        </div>
      </div>
    </div>

    <!-- Modal de edición de usuario -->
    <div v-if="usuarioSeleccionado" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalUsuario"></div>
      <div class="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <img
                :src="getAvatarUrl(usuarioSeleccionado.nombre || usuarioSeleccionado.email, usuarioSeleccionado.avatar_seed, usuarioSeleccionado.avatar_style)"
                :alt="usuarioSeleccionado.nombre || usuarioSeleccionado.email"
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-white/30 shadow-md object-cover flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <h3 class="text-lg sm:text-2xl font-display font-bold truncate">
                  {{ usuarioSeleccionado.nombre || usuarioSeleccionado.email }}
                </h3>
                <p class="text-white/90 text-xs sm:text-sm truncate">
                  {{ usuarioSeleccionado.email }}
                </p>
              </div>
            </div>
            <button
              @click="cerrarModalUsuario"
              class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          <!-- Información básica -->
          <div class="space-y-4">
            <h4 class="text-lg font-display font-bold text-gray-800">Información Básica</h4>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
              <input
                v-model="formUsuario.nombre"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                placeholder="Nombre del usuario"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                v-model="formUsuario.email"
                type="email"
                disabled
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
              <select
                v-model="formUsuario.rol"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                :disabled="!puedeCambiarRol"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="super_admin">Super Administrador</option>
                <option value="invitado">Invitado</option>
              </select>
              <p v-if="!puedeCambiarRol" class="text-xs text-amber-600 mt-1">
                No tienes permisos para cambiar este rol
              </p>
            </div>

            <div class="flex items-center gap-3">
              <input
                v-model="formUsuario.activo"
                type="checkbox"
                id="activo"
                class="w-5 h-5 rounded border-gray-300 text-natillera-600 focus:ring-natillera-500"
              />
              <label for="activo" class="text-sm font-semibold text-gray-700">
                Usuario activo
              </label>
            </div>
          </div>

          <!-- Permisos -->
          <div class="space-y-4">
            <h4 class="text-lg font-display font-bold text-gray-800">Permisos</h4>
            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <div
                v-for="permiso in permisosDisponibles"
                :key="permiso.key"
                class="flex items-center gap-3"
              >
                <input
                  v-model="formUsuario.permisos"
                  :value="permiso.key"
                  type="checkbox"
                  :id="`permiso-${permiso.key}`"
                  class="w-5 h-5 rounded border-gray-300 text-natillera-600 focus:ring-natillera-500"
                />
                <label :for="`permiso-${permiso.key}`" class="flex-1">
                  <p class="text-sm font-semibold text-gray-800">{{ permiso.label }}</p>
                  <p class="text-xs text-gray-500">{{ permiso.description }}</p>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            @click="cerrarModalUsuario"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="guardarUsuario"
            :disabled="usersStore.loading"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ usersStore.loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'
import { 
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { getAvatarUrl } from '../../utils/avatars'
import { formatDate } from '../../utils/formatDate'

const usersStore = useUsersStore()
const authStore = useAuthStore()

const mostrarPanel = ref(false)
const busqueda = ref('')
const filtroRol = ref('')
const filtroEstado = ref('')
const usuarioSeleccionado = ref(null)
const formUsuario = ref({
  nombre: '',
  email: '',
  rol: 'usuario',
  activo: true,
  permisos: []
})

// Permisos disponibles en el sistema
const permisosDisponibles = [
  { key: 'crear_natilleras', label: 'Crear Natilleras', description: 'Permite crear nuevas natilleras' },
  { key: 'editar_natilleras', label: 'Editar Natilleras', description: 'Permite editar natilleras existentes' },
  { key: 'eliminar_natilleras', label: 'Eliminar Natilleras', description: 'Permite eliminar natilleras' },
  { key: 'gestionar_usuarios', label: 'Gestionar Usuarios', description: 'Permite administrar usuarios del sistema' },
  { key: 'ver_auditoria', label: 'Ver Auditoría', description: 'Permite ver el registro de auditoría' },
  { key: 'configurar_sistema', label: 'Configurar Sistema', description: 'Permite modificar configuraciones del sistema' }
]

// Computed
const usuariosFiltrados = computed(() => {
  let usuarios = usersStore.users || []

  // Filtro de búsqueda
  if (busqueda.value.trim()) {
    const busquedaLower = busqueda.value.toLowerCase()
    usuarios = usuarios.filter(u => 
      u.email?.toLowerCase().includes(busquedaLower) ||
      u.nombre?.toLowerCase().includes(busquedaLower)
    )
  }

  // Filtro de rol
  if (filtroRol.value) {
    usuarios = usuarios.filter(u => u.rol === filtroRol.value)
  }

  // Filtro de estado
  if (filtroEstado.value === 'activo') {
    usuarios = usuarios.filter(u => u.activo)
  } else if (filtroEstado.value === 'inactivo') {
    usuarios = usuarios.filter(u => !u.activo)
  }

  return usuarios
})

const totalUsuarios = computed(() => usersStore.users?.length || 0)
const usuariosActivos = computed(() => usersStore.users?.filter(u => u.activo).length || 0)
const usuariosInactivos = computed(() => totalUsuarios.value - usuariosActivos.value)
const totalAdmins = computed(() => usersStore.users?.filter(u => ['super_admin', 'admin'].includes(u.rol)).length || 0)

const puedeCambiarRol = computed(() => {
  if (!usuarioSeleccionado.value) return false
  const currentUser = usersStore.currentUserProfile
  if (!currentUser) return false
  
  // Super admin puede cambiar cualquier rol
  if (currentUser.rol === 'super_admin') return true
  
  // Admin puede cambiar roles de usuarios e invitados, pero no de otros admins
  if (currentUser.rol === 'admin') {
    return ['usuario', 'invitado'].includes(usuarioSeleccionado.value.rol)
  }
  
  return false
})

// Funciones
function getRolLabel(rol) {
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    usuario: 'Usuario',
    invitado: 'Invitado'
  }
  return labels[rol] || rol
}

function resetearFiltros() {
  busqueda.value = ''
  filtroRol.value = ''
  filtroEstado.value = ''
}

function seleccionarUsuario(usuario) {
  usuarioSeleccionado.value = usuario
  formUsuario.value = {
    nombre: usuario.nombre || '',
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
    permisos: Object.keys(usuario.permisos || {}).filter(k => usuario.permisos[k] === true)
  }
  mostrarPanel = false
}

function cerrarModalUsuario() {
  usuarioSeleccionado.value = null
  formUsuario.value = {
    nombre: '',
    email: '',
    rol: 'usuario',
    activo: true,
    permisos: []
  }
}

async function guardarUsuario() {
  if (!usuarioSeleccionado.value) return

  // Construir objeto de permisos
  const permisosObj = {}
  permisosDisponibles.forEach(p => {
    permisosObj[p.key] = formUsuario.value.permisos.includes(p.key)
  })

  const updates = {
    nombre: formUsuario.value.nombre,
    rol: formUsuario.value.rol,
    activo: formUsuario.value.activo,
    permisos: permisosObj
  }

  const result = await usersStore.updateUserProfile(usuarioSeleccionado.value.id, updates)
  
  if (result.success) {
    cerrarModalUsuario()
    // Recargar usuarios
    await usersStore.fetchUsers()
  } else {
    alert('Error al guardar: ' + result.error)
  }
}

// Cargar datos
onMounted(async () => {
  // Cargar perfil del usuario actual
  await usersStore.getCurrentUserProfile()
  
  // Verificar permisos antes de cargar usuarios
  if (usersStore.isAdmin()) {
    await usersStore.fetchUsers()
  } else {
    alert('No tienes permisos para acceder a esta sección')
    // Redirigir al dashboard
    window.location.href = '/dashboard'
  }
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>


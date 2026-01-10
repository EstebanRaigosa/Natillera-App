<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 class="text-lg font-display font-bold text-gray-800">Colaboradores</h3>
        <p class="text-sm text-gray-500">Gestiona quién puede acceder a esta natillera</p>
      </div>
      <button
        @click="abrirModalInvitar"
        :disabled="!puedeInvitar"
        class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-natillera-500 to-emerald-600 rounded-xl shadow-lg shadow-natillera-500/25 hover:shadow-xl hover:shadow-natillera-500/30 hover:from-natillera-600 hover:to-emerald-700 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:from-natillera-500 disabled:hover:to-emerald-600"
      >
        <UserPlusIcon class="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
        <span class="whitespace-nowrap">Invitar Colaborador</span>
      </button>
    </div>

    <!-- Mensaje de permisos -->
    <div v-if="!puedeInvitar" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <ExclamationTriangleIcon class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-amber-700">
          No tienes permisos para gestionar colaboradores. Solo el administrador o co-administradores pueden invitar o modificar colaboradores.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-500 mt-3">Cargando colaboradores...</p>
    </div>

    <!-- Lista de colaboradores -->
    <div v-else class="space-y-4">
      <!-- Administrador -->
      <div class="bg-gradient-to-br from-natillera-50 to-emerald-50 border-2 border-natillera-200 rounded-xl p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-natillera-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {{ adminInicial }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800 truncate">{{ adminNombre }}</span>
              <span class="px-2 py-0.5 bg-natillera-500 text-white text-xs font-bold rounded-full">
                Administrador
              </span>
            </div>
            <p class="text-sm text-gray-500 truncate">{{ adminEmail }}</p>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheckIcon class="w-4 h-4 text-natillera-500" />
            <span>Todos los permisos</span>
          </div>
        </div>
      </div>

      <!-- Lista vacía -->
      <div v-if="colaboradores.length === 0" class="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">No hay colaboradores</p>
        <p class="text-sm text-gray-400 mt-1">Invita a otros usuarios para que puedan acceder a esta natillera</p>
      </div>

      <!-- Colaboradores -->
      <TransitionGroup
        name="list"
        tag="div"
        class="space-y-3"
      >
        <div
          v-for="colaborador in colaboradores"
          :key="colaborador.id"
          :class="[
            'relative overflow-hidden rounded-xl border-2 transition-all duration-300',
            colaborador.estado === 'aceptada'
              ? 'bg-white border-gray-200 hover:border-natillera-200 hover:shadow-md'
              : colaborador.estado === 'pendiente'
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-gray-50 border-gray-200 opacity-60'
          ]"
        >
          <div class="p-4">
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md',
                colaborador.estado === 'aceptada'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  : colaborador.estado === 'pendiente'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gray-400'
              ]">
                {{ obtenerInicial(colaborador.nombre_usuario || colaborador.email_usuario) }}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold text-gray-800 truncate">
                    {{ colaborador.nombre_usuario || colaborador.email_usuario }}
                  </span>
                  <span :class="[
                    'px-2 py-0.5 text-xs font-bold rounded-full',
                    obtenerClaseRol(colaborador.rol)
                  ]">
                    {{ formatearRol(colaborador.rol) }}
                  </span>
                  <span :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    obtenerClaseEstado(colaborador.estado)
                  ]">
                    {{ formatearEstado(colaborador.estado) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 truncate mt-0.5">{{ colaborador.email_usuario }}</p>
                
                <!-- Permisos en modo compacto -->
                <div class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="(activo, permiso) in colaborador.permisos"
                    :key="permiso"
                    v-show="activo"
                    class="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {{ formatearPermiso(permiso) }}
                  </span>
                </div>
              </div>

              <!-- Acciones -->
              <div v-if="puedeInvitar" class="flex items-center gap-2">
                <!-- Acciones para colaboradores activos o pendientes -->
                <template v-if="colaborador.estado !== 'revocada'">
                  <button
                    v-if="colaborador.estado === 'aceptada'"
                    @click="abrirModalEditar(colaborador)"
                    class="p-2 text-gray-400 hover:text-natillera-600 hover:bg-natillera-50 rounded-lg transition-colors"
                    title="Editar permisos"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="colaborador.estado === 'pendiente'"
                    @click="reenviarInvitacion(colaborador)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reenviar invitación"
                  >
                    <ArrowPathIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmarRevocacion(colaborador)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    :title="colaborador.estado === 'pendiente' ? 'Cancelar invitación' : 'Revocar acceso'"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </template>
                <!-- Acciones para colaboradores revocados -->
                <template v-else>
                  <button
                    @click="reenviarInvitacion(colaborador)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Reenviar invitación"
                  >
                    <ArrowPathIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmarEliminacion(colaborador)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar completamente"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </template>
              </div>
            </div>

            <!-- Info de invitación -->
            <div v-if="colaborador.invitado_por_nombre" class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <ClockIcon class="w-3.5 h-3.5" />
              <span>Invitado por {{ colaborador.invitado_por_nombre }}</span>
              <span>•</span>
              <span>{{ formatearFecha(colaborador.fecha_invitacion) }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Modal Invitar Colaborador -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalInvitar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalInvitar"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-gradient-to-r from-natillera-500 to-emerald-500 px-6 py-4 text-white">
              <h3 class="text-lg font-display font-bold">Invitar Colaborador</h3>
              <p class="text-sm text-white/80">Invita a un usuario para colaborar en esta natillera</p>
              <button
                @click="cerrarModalInvitar"
                class="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Contenido -->
            <div class="p-6 space-y-5">
              <!-- Email -->
              <div>
                <label class="label font-semibold text-gray-700">Email del usuario *</label>
                <input
                  v-model="formulario.email"
                  type="email"
                  :class="[
                    'input-field',
                    errorEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  ]"
                  placeholder="usuario@ejemplo.com"
                  required
                />
                <p v-if="errorEmail" class="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <ExclamationCircleIcon class="w-4 h-4" />
                  {{ errorEmail }}
                </p>
                <p v-else class="text-xs text-gray-500 mt-1">
                  El usuario recibirá una notificación para aceptar la invitación
                </p>
              </div>

              <!-- Rol -->
              <div>
                <label class="label font-semibold text-gray-700">Rol *</label>
                <div class="grid grid-cols-1 gap-3 mt-2">
                  <label
                    v-for="rol in rolesDisponibles"
                    :key="rol.value"
                    :class="[
                      'relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all',
                      formulario.rol === rol.value
                        ? 'border-natillera-400 bg-natillera-50'
                        : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="formulario.rol"
                      :value="rol.value"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-gray-800">{{ rol.nombre }}</span>
                        <span :class="['px-2 py-0.5 text-xs font-bold rounded-full', obtenerClaseRol(rol.value)]">
                          {{ rol.value }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">{{ rol.descripcion }}</p>
                    </div>
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3',
                      formulario.rol === rol.value
                        ? 'border-natillera-500 bg-natillera-500'
                        : 'border-gray-300'
                    ]">
                      <CheckIcon v-if="formulario.rol === rol.value" class="w-3 h-3 text-white" />
                    </div>
                  </label>
                </div>
              </div>

              <!-- Permisos personalizados (solo para rol colaborador) -->
              <Transition name="fade">
                <div v-if="formulario.rol === 'colaborador'" class="space-y-3">
                  <label class="label font-semibold text-gray-700">Permisos específicos</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      v-for="(info, permiso) in permisosEditables"
                      :key="permiso"
                      class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        v-model="formulario.permisos[permiso]"
                        class="w-4 h-4 rounded border-gray-300 text-natillera-500 focus:ring-natillera-500"
                      />
                      <div class="flex-1 min-w-0">
                        <span class="text-sm font-medium text-gray-700">{{ info.nombre }}</span>
                        <p class="text-xs text-gray-500 truncate">{{ info.descripcion }}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </Transition>

              <!-- Notas -->
              <div>
                <label class="label font-semibold text-gray-700">Notas (opcional)</label>
                <textarea
                  v-model="formulario.notas"
                  class="input-field min-h-[80px]"
                  placeholder="Notas sobre este colaborador..."
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                @click="cerrarModalInvitar"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="enviarInvitacion"
                :disabled="!formulario.email || enviandoInvitacion"
                class="btn-primary bg-gradient-to-r from-natillera-500 to-emerald-600 disabled:opacity-50"
              >
                {{ enviandoInvitacion ? 'Enviando...' : 'Enviar Invitación' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Editar Colaborador -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalEditar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalEditar"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-white">
              <h3 class="text-lg font-display font-bold">Editar Colaborador</h3>
              <p class="text-sm text-white/80">{{ colaboradorEditando?.email_usuario }}</p>
              <button
                @click="cerrarModalEditar"
                class="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Contenido -->
            <div class="p-6 space-y-5">
              <!-- Rol -->
              <div>
                <label class="label font-semibold text-gray-700">Rol</label>
                <div class="grid grid-cols-1 gap-3 mt-2">
                  <label
                    v-for="rol in rolesDisponibles"
                    :key="rol.value"
                    :class="[
                      'relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all',
                      formularioEditar.rol === rol.value
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="formularioEditar.rol"
                      :value="rol.value"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <span class="font-semibold text-gray-800">{{ rol.nombre }}</span>
                      <p class="text-sm text-gray-500 mt-1">{{ rol.descripcion }}</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Permisos -->
              <Transition name="fade">
                <div v-if="formularioEditar.rol === 'colaborador'" class="space-y-3">
                  <label class="label font-semibold text-gray-700">Permisos</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      v-for="(info, permiso) in permisosEditables"
                      :key="permiso"
                      class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        v-model="formularioEditar.permisos[permiso]"
                        class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span class="text-sm font-medium text-gray-700">{{ info.nombre }}</span>
                    </label>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Footer -->
            <div class="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                @click="cerrarModalEditar"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="guardarCambios"
                :disabled="guardandoCambios"
                class="btn-primary bg-gradient-to-r from-blue-500 to-indigo-600 disabled:opacity-50"
              >
                {{ guardandoCambios ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Confirmar Revocación -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalRevocar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalRevocar"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="p-6 text-center">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon class="w-8 h-8 text-red-500" />
              </div>
              <h3 class="text-lg font-display font-bold text-gray-800 mb-2">
                {{ colaboradorRevocando?.estado === 'pendiente' ? '¿Cancelar invitación?' : '¿Revocar acceso?' }}
              </h3>
              <p class="text-gray-500 mb-6">
                {{ colaboradorRevocando?.estado === 'pendiente'
                  ? `La invitación a ${colaboradorRevocando?.email_usuario} será cancelada.`
                  : `${colaboradorRevocando?.nombre_usuario || colaboradorRevocando?.email_usuario} ya no tendrá acceso a esta natillera.`
                }}
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="cerrarModalRevocar"
                  class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="ejecutarRevocacion"
                  :disabled="revocando"
                  class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ revocando ? 'Procesando...' : (colaboradorRevocando?.estado === 'pendiente' ? 'Cancelar Invitación' : 'Revocar Acceso') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Confirmar Eliminación -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalEliminar"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="p-6 text-center">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <TrashIcon class="w-8 h-8 text-red-500" />
              </div>
              <h3 class="text-lg font-display font-bold text-gray-800 mb-2">
                ¿Eliminar completamente?
              </h3>
              <p class="text-gray-500 mb-2">
                Se eliminará completamente a <strong>{{ colaboradorEliminando?.nombre_usuario || colaboradorEliminando?.email_usuario }}</strong> de la lista de colaboradores.
              </p>
              <p class="text-sm text-red-600 font-medium mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="cerrarModalEliminar"
                  class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="ejecutarEliminacion"
                  :disabled="eliminando"
                  class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ eliminando ? 'Eliminando...' : 'Eliminar Completamente' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Notificación -->
    <Teleport to="body">
      <Transition name="notification">
        <div
          v-if="notificacion"
          :class="[
            'fixed bottom-4 right-4 z-[60] px-6 py-4 rounded-xl shadow-xl max-w-md',
            notificacion.tipo === 'exito' 
              ? 'bg-green-500 text-white' 
              : notificacion.tipo === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'
          ]"
        >
          <div class="flex items-center gap-3">
            <CheckCircleIcon v-if="notificacion.tipo === 'exito'" class="w-6 h-6" />
            <ExclamationCircleIcon v-else-if="notificacion.tipo === 'info'" class="w-6 h-6" />
            <XCircleIcon v-else class="w-6 h-6" />
            <span>{{ notificacion.mensaje }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useColaboradoresStore, PERMISOS_DISPONIBLES, PERMISOS_POR_ROL } from '../stores/colaboradores'
import {
  UserPlusIcon,
  UsersIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  natilleraId: {
    type: String,
    required: true
  },
  adminId: {
    type: String,
    default: ''
  },
  adminEmail: {
    type: String,
    default: ''
  },
  adminNombre: {
    type: String,
    default: ''
  },
  esAdmin: {
    type: Boolean,
    default: false
  }
})

const colaboradoresStore = useColaboradoresStore()

// Estado
const loading = ref(true)
const colaboradores = computed(() => colaboradoresStore.colaboradores)
const modalInvitar = ref(false)
const modalEditar = ref(false)
const modalRevocar = ref(false)
const modalEliminar = ref(false)
const colaboradorEditando = ref(null)
const colaboradorRevocando = ref(null)
const colaboradorEliminando = ref(null)
const enviandoInvitacion = ref(false)
const guardandoCambios = ref(false)
const revocando = ref(false)
const reenviando = ref(false)
const eliminando = ref(false)
const notificacion = ref(null)
const puedeInvitar = ref(false)
const errorEmail = ref(null)

// Formulario invitar
const formulario = ref({
  email: '',
  rol: 'visor',
  permisos: { ...PERMISOS_POR_ROL.visor },
  notas: ''
})

// Formulario editar
const formularioEditar = ref({
  rol: 'visor',
  permisos: {}
})

// Roles disponibles
const rolesDisponibles = [
  {
    value: 'co_administrador',
    nombre: 'Co-Administrador',
    descripcion: 'Tiene todos los permisos excepto eliminar la natillera'
  },
  {
    value: 'colaborador',
    nombre: 'Colaborador',
    descripcion: 'Permisos personalizados según tus necesidades'
  },
  {
    value: 'visor',
    nombre: 'Visor',
    descripcion: 'Solo puede ver la información, sin hacer cambios'
  }
]

// Permisos editables (todos excepto 'ver')
const permisosEditables = computed(() => {
  const editables = {}
  Object.entries(PERMISOS_DISPONIBLES).forEach(([key, value]) => {
    if (key !== 'ver') {
      editables[key] = value
    }
  })
  return editables
})

// Computed
const adminInicial = computed(() => 
  obtenerInicial(props.adminNombre || props.adminEmail)
)

// Helpers
function obtenerInicial(texto) {
  if (!texto) return '?'
  return texto.charAt(0).toUpperCase()
}

function formatearRol(rol) {
  const nombres = {
    co_administrador: 'Co-Admin',
    colaborador: 'Colaborador',
    visor: 'Visor'
  }
  return nombres[rol] || rol
}

function obtenerClaseRol(rol) {
  const clases = {
    co_administrador: 'bg-purple-100 text-purple-700',
    colaborador: 'bg-blue-100 text-blue-700',
    visor: 'bg-gray-100 text-gray-700'
  }
  return clases[rol] || 'bg-gray-100 text-gray-700'
}

function formatearEstado(estado) {
  const nombres = {
    pendiente: 'Pendiente',
    aceptada: 'Activo',
    rechazada: 'Rechazada',
    revocada: 'Revocado'
  }
  return nombres[estado] || estado
}

function obtenerClaseEstado(estado) {
  const clases = {
    pendiente: 'bg-amber-100 text-amber-700',
    aceptada: 'bg-green-100 text-green-700',
    rechazada: 'bg-red-100 text-red-700',
    revocada: 'bg-gray-100 text-gray-500'
  }
  return clases[estado] || 'bg-gray-100 text-gray-500'
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

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Modal Invitar
function abrirModalInvitar() {
  formulario.value = {
    email: '',
    rol: 'visor',
    permisos: { ...PERMISOS_POR_ROL.visor },
    notas: ''
  }
  errorEmail.value = null
  modalInvitar.value = true
}

function cerrarModalInvitar() {
  modalInvitar.value = false
  errorEmail.value = null
}

// Watch para actualizar permisos cuando cambia el rol
watch(() => formulario.value.rol, (nuevoRol) => {
  formulario.value.permisos = { ...PERMISOS_POR_ROL[nuevoRol] }
})

watch(() => formularioEditar.value.rol, (nuevoRol) => {
  formularioEditar.value.permisos = { ...PERMISOS_POR_ROL[nuevoRol] }
})

// Limpiar error cuando cambia el email
watch(() => formulario.value.email, () => {
  if (errorEmail.value) {
    errorEmail.value = null
  }
})

async function enviarInvitacion() {
  if (!formulario.value.email) return

  // Limpiar error previo
  errorEmail.value = null
  enviandoInvitacion.value = true
  
  try {
    const resultado = await colaboradoresStore.invitarColaborador(props.natilleraId, {
      email: formulario.value.email,
      rol: formulario.value.rol,
      permisos: formulario.value.permisos,
      notas: formulario.value.notas
    })

    if (resultado.success) {
      mostrarNotificacion('exito', 'Invitación enviada correctamente')
      cerrarModalInvitar()
      await cargarColaboradores()
    } else {
      // Si el error es sobre email/usuario, mostrarlo en el campo
      if (resultado.error && (
        resultado.error.includes('no está registrado') ||
        resultado.error.includes('ya es colaborador') ||
        resultado.error.includes('Ya existe una invitación')
      )) {
        errorEmail.value = resultado.error
      } else {
        mostrarNotificacion('error', resultado.error || 'Error al enviar invitación')
      }
    }
  } catch (e) {
    // Si el error es sobre email/usuario, mostrarlo en el campo
    if (e.message && (
      e.message.includes('no está registrado') ||
      e.message.includes('ya es colaborador') ||
      e.message.includes('Ya existe una invitación')
    )) {
      errorEmail.value = e.message
    } else {
      mostrarNotificacion('error', e.message || 'Error al enviar invitación')
    }
  } finally {
    enviandoInvitacion.value = false
  }
}

// Modal Editar
function abrirModalEditar(colaborador) {
  colaboradorEditando.value = colaborador
  formularioEditar.value = {
    rol: colaborador.rol,
    permisos: { ...colaborador.permisos }
  }
  modalEditar.value = true
}

function cerrarModalEditar() {
  modalEditar.value = false
  colaboradorEditando.value = null
}

async function guardarCambios() {
  if (!colaboradorEditando.value) return

  guardandoCambios.value = true
  try {
    const resultado = await colaboradoresStore.actualizarColaborador(
      colaboradorEditando.value.id,
      {
        rol: formularioEditar.value.rol,
        permisos: formularioEditar.value.permisos
      }
    )

    if (resultado.success) {
      mostrarNotificacion('exito', 'Cambios guardados correctamente')
      cerrarModalEditar()
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al guardar cambios')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al guardar cambios')
  } finally {
    guardandoCambios.value = false
  }
}

// Modal Revocar
function confirmarRevocacion(colaborador) {
  colaboradorRevocando.value = colaborador
  modalRevocar.value = true
}

function cerrarModalRevocar() {
  modalRevocar.value = false
  colaboradorRevocando.value = null
}

async function ejecutarRevocacion() {
  if (!colaboradorRevocando.value) return

  revocando.value = true
  try {
    let resultado
    if (colaboradorRevocando.value.estado === 'pendiente') {
      resultado = await colaboradoresStore.eliminarColaborador(colaboradorRevocando.value.id)
    } else {
      resultado = await colaboradoresStore.revocarColaborador(colaboradorRevocando.value.id)
    }

    if (resultado.success) {
      mostrarNotificacion('exito', 
        colaboradorRevocando.value.estado === 'pendiente' 
          ? 'Invitación cancelada' 
          : 'Acceso revocado correctamente'
      )
      cerrarModalRevocar()
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al procesar')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al procesar')
  } finally {
    revocando.value = false
  }
}

async function reenviarInvitacion(colaborador) {
  if (!colaborador) return

  reenviando.value = true
  try {
    let resultado
    
    if (colaborador.estado === 'revocada') {
      // Reenviar invitación a colaborador revocado
      resultado = await colaboradoresStore.reenviarInvitacionColaborador(colaborador.id)
    } else if (colaborador.estado === 'pendiente') {
      // Reenviar invitación pendiente (lógica existente o nueva según necesidad)
      // Por ahora, si ya está pendiente, simplemente informamos
      mostrarNotificacion('info', 'La invitación ya está pendiente')
      return
    } else {
      mostrarNotificacion('error', 'No se puede reenviar invitación a un colaborador activo')
      return
    }

    if (resultado.success) {
      mostrarNotificacion('exito', 'Invitación reenviada correctamente')
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al reenviar invitación')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al reenviar invitación')
  } finally {
    reenviando.value = false
  }
}

// Modal Eliminar
function confirmarEliminacion(colaborador) {
  colaboradorEliminando.value = colaborador
  modalEliminar.value = true
}

function cerrarModalEliminar() {
  modalEliminar.value = false
  colaboradorEliminando.value = null
}

async function ejecutarEliminacion() {
  if (!colaboradorEliminando.value) return

  eliminando.value = true
  try {
    const resultado = await colaboradoresStore.eliminarColaborador(colaboradorEliminando.value.id)

    if (resultado.success) {
      mostrarNotificacion('exito', 'Colaborador eliminado completamente')
      cerrarModalEliminar()
      await cargarColaboradores()
    } else {
      mostrarNotificacion('error', resultado.error || 'Error al eliminar colaborador')
    }
  } catch (e) {
    mostrarNotificacion('error', e.message || 'Error al eliminar colaborador')
  } finally {
    eliminando.value = false
  }
}

function mostrarNotificacion(tipo, mensaje) {
  notificacion.value = { tipo, mensaje }
  setTimeout(() => {
    notificacion.value = null
  }, 4000)
}

async function cargarColaboradores() {
  loading.value = true
  await colaboradoresStore.fetchColaboradores(props.natilleraId)
  loading.value = false
}

async function verificarPermisos() {
  if (props.esAdmin) {
    puedeInvitar.value = true
    return
  }
  
  puedeInvitar.value = await colaboradoresStore.tienePermiso(props.natilleraId, 'configurar')
}

onMounted(async () => {
  await verificarPermisos()
  await cargarColaboradores()
})

// Watch para recargar cuando cambia la natillera
watch(() => props.natilleraId, async () => {
  await verificarPermisos()
  await cargarColaboradores()
})

// Exponer método para abrir modal desde el componente padre
defineExpose({
  abrirModalInvitar
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>


<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-display font-bold text-gray-800">
        Configuración
      </h1>
      <p class="text-gray-500 mt-1">
        Personaliza los mensajes y ajustes de la aplicación
      </p>
    </div>

    <!-- Mensajes por Defecto -->
    <div class="card">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
          <ChatBubbleLeftRightIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-display font-bold text-gray-800">
            Mensajes por Defecto
          </h2>
          <p class="text-sm text-gray-500">
            Personaliza los mensajes de WhatsApp para recordatorios de pago
          </p>
        </div>
      </div>

      <!-- Mensaje Individual -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-gray-700 flex items-center gap-2">
            <UserIcon class="w-4 h-4 text-natillera-600" />
            Mensaje Individual
          </label>
          <div class="flex gap-1">
            <button 
              @click="insertarVariable('nombre')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              ]"
              title="Insertar nombre del socio"
            >
              {{nombre}}
            </button>
            <button 
              @click="insertarVariable('monto')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar monto de la cuota"
            >
              {{monto}}
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mb-2">
          Este mensaje se envía a cada socio individualmente. Usa <code class="bg-gray-100 px-1 rounded">{{nombre}}</code> y <code class="bg-gray-100 px-1 rounded">{{monto}}</code> para personalizar.
        </p>
        <textarea
          ref="textareaIndividual"
          v-model="configStore.mensajeIndividual"
          :disabled="esVisor"
          :class="[
            'input-field min-h-[150px] font-mono text-sm',
            esVisor ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
          ]"
          placeholder="Escribe el mensaje individual..."
        ></textarea>
        
        <!-- Vista previa -->
        <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
            <EyeIcon class="w-3.5 h-3.5" />
            Vista previa (ejemplo)
          </p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ vistaPreviewIndividual }}</p>
        </div>
      </div>

      <hr class="border-gray-200 my-6" />

      <!-- Mensaje General -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-gray-700 flex items-center gap-2">
            <UsersIcon class="w-4 h-4 text-purple-600" />
            Mensaje General
          </label>
        </div>
        <p class="text-xs text-gray-500 mb-2">
          Este mensaje se puede enviar a todos los socios a la vez. No usa variables personalizadas.
        </p>
        <textarea
          v-model="configStore.mensajeGeneral"
          :disabled="esVisor"
          :class="[
            'input-field min-h-[150px] font-mono text-sm',
            esVisor ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
          ]"
          placeholder="Escribe el mensaje general..."
        ></textarea>
        
        <!-- Vista previa -->
        <div class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <p class="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
            <EyeIcon class="w-3.5 h-3.5" />
            Vista previa
          </p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ configStore.mensajeGeneral }}</p>
        </div>
      </div>

      <hr class="border-gray-200 my-6" />

      <!-- Mensaje Cuota en Mora -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-gray-700 flex items-center gap-2">
            <ExclamationTriangleIcon class="w-4 h-4 text-red-600" />
            Mensaje Cuota en Mora
          </label>
          <div class="flex gap-1 flex-wrap">
            <button 
              @click="insertarVariableCuota('nombre', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              ]"
              title="Insertar nombre del socio"
            >
              {{nombre}}
            </button>
            <button 
              @click="insertarVariableCuota('mes', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar mes"
            >
              {{mes}}
            </button>
            <button 
              @click="insertarVariableCuota('anio', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar año"
            >
              {{anio}}
            </button>
            <button 
              @click="insertarVariableCuota('valor_cuota', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar valor de la cuota"
            >
              {{valor_cuota}}
            </button>
            <button 
              @click="insertarVariableCuota('sancion', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              ]"
              title="Insertar sanción"
            >
              {{sancion}}
            </button>
            <button 
              @click="insertarVariableCuota('total', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              ]"
              title="Insertar total a pagar"
            >
              {{total}}
            </button>
            <button 
              @click="insertarVariableCuota('fecha_vencimiento', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              title="Insertar fecha de vencimiento"
            >
              {{fecha_vencimiento}}
            </button>
            <button 
              @click="insertarVariableCuota('dias_mora', 'mensajeCuotaMora')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'
              ]"
              title="Insertar días en mora"
            >
              {{dias_mora}}
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mb-2">
          Mensaje que se envía cuando una cuota está en mora. Variables disponibles: <code class="bg-gray-100 px-1 rounded">{{nombre}}</code>, <code class="bg-gray-100 px-1 rounded">{{mes}}</code>, <code class="bg-gray-100 px-1 rounded">{{anio}}</code>, <code class="bg-gray-100 px-1 rounded">{{valor_cuota}}</code>, <code class="bg-gray-100 px-1 rounded">{{sancion}}</code>, <code class="bg-gray-100 px-1 rounded">{{total}}</code>, <code class="bg-gray-100 px-1 rounded">{{fecha_vencimiento}}</code>, <code class="bg-gray-100 px-1 rounded">{{dias_mora}}</code>
        </p>
        <textarea
          ref="textareaCuotaMora"
          v-model="configStore.mensajeCuotaMora"
          :disabled="esVisor"
          :class="[
            'input-field min-h-[150px] font-mono text-sm',
            esVisor ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
          ]"
          placeholder="Escribe el mensaje para cuota en mora..."
        ></textarea>
        
        <!-- Vista previa -->
        <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
            <EyeIcon class="w-3.5 h-3.5" />
            Vista previa (ejemplo)
          </p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ vistaPreviewCuotaMora }}</p>
        </div>
      </div>

      <hr class="border-gray-200 my-6" />

      <!-- Mensaje Cuota Pendiente -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-gray-700 flex items-center gap-2">
            <ClockIcon class="w-4 h-4 text-amber-600" />
            Mensaje Cuota Pendiente
          </label>
          <div class="flex gap-1 flex-wrap">
            <button 
              @click="insertarVariableCuota('nombre', 'mensajeCuotaPendiente')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              ]"
              title="Insertar nombre del socio"
            >
              {{nombre}}
            </button>
            <button 
              @click="insertarVariableCuota('mes', 'mensajeCuotaPendiente')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar mes"
            >
              {{mes}}
            </button>
            <button 
              @click="insertarVariableCuota('anio', 'mensajeCuotaPendiente')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar año"
            >
              {{anio}}
            </button>
            <button 
              @click="insertarVariableCuota('valor_cuota', 'mensajeCuotaPendiente')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'
              ]"
              title="Insertar valor de la cuota"
            >
              {{valor_cuota}}
            </button>
            <button 
              @click="insertarVariableCuota('total', 'mensajeCuotaPendiente')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              ]"
              title="Insertar total a pagar"
            >
              {{total}}
            </button>
            <button 
              @click="insertarVariableCuota('fecha_vencimiento', 'mensajeCuotaPendiente')"
              :disabled="esVisor"
              :class="[
                'px-2 py-1 text-xs rounded-lg transition-colors',
                esVisor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
              title="Insertar fecha de vencimiento"
            >
              {{fecha_vencimiento}}
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mb-2">
          Mensaje que se envía cuando una cuota está pendiente. Variables disponibles: <code class="bg-gray-100 px-1 rounded">{{nombre}}</code>, <code class="bg-gray-100 px-1 rounded">{{mes}}</code>, <code class="bg-gray-100 px-1 rounded">{{anio}}</code>, <code class="bg-gray-100 px-1 rounded">{{valor_cuota}}</code>, <code class="bg-gray-100 px-1 rounded">{{total}}</code>, <code class="bg-gray-100 px-1 rounded">{{fecha_vencimiento}}</code>
        </p>
        <textarea
          ref="textareaCuotaPendiente"
          v-model="configStore.mensajeCuotaPendiente"
          :disabled="esVisor"
          :class="[
            'input-field min-h-[150px] font-mono text-sm',
            esVisor ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
          ]"
          placeholder="Escribe el mensaje para cuota pendiente..."
        ></textarea>
        
        <!-- Vista previa -->
        <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p class="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
            <EyeIcon class="w-3.5 h-3.5" />
            Vista previa (ejemplo)
          </p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ vistaPreviewCuotaPendiente }}</p>
        </div>
      </div>

      <!-- Botones de acción -->
      <div v-if="!esVisor" class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button 
          @click="restaurarDefecto"
          class="btn-secondary inline-flex items-center justify-center gap-2"
        >
          <ArrowPathIcon class="w-4 h-4" />
          Restaurar valores por defecto
        </button>
        <button 
          @click="guardarCambios"
          :disabled="configStore.loading"
          class="btn-primary flex-1 sm:flex-none inline-flex items-center justify-center gap-2"
        >
          <CheckIcon class="w-4 h-4" />
          {{ configStore.loading ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
      
      <!-- Mensaje informativo para visores -->
      <div v-if="esVisor" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div class="flex items-start gap-3">
          <EyeIcon class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-blue-800 mb-1">Modo de solo lectura</p>
            <p class="text-sm text-blue-700">Como visor, puedes consultar la configuración pero no puedes modificarla.</p>
          </div>
        </div>
      </div>

      <!-- Mensaje de éxito/error -->
      <div v-if="mensaje" :class="[
        'mt-4 p-3 rounded-xl text-sm flex items-center gap-2',
        mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
      ]">
        <component :is="mensaje.tipo === 'exito' ? CheckCircleIcon : ExclamationCircleIcon" class="w-5 h-5" />
        {{ mensaje.texto }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useRoute } from 'vue-router'
import { 
  ChatBubbleLeftRightIcon,
  UserIcon,
  UsersIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const configStore = useConfiguracionStore()
const colaboradoresStore = useColaboradoresStore()
const route = useRoute()
const textareaIndividual = ref(null)
const textareaCuotaMora = ref(null)
const textareaCuotaPendiente = ref(null)
const mensaje = ref(null)
const esVisor = ref(false)
const natilleraIdActual = ref(null)

// Vista previa del mensaje individual con datos de ejemplo
const vistaPreviewIndividual = computed(() => {
  return configStore.mensajeIndividual
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{monto\}\}/g, '50.000')
})

// Vista previa del mensaje de cuota en mora
const vistaPreviewCuotaMora = computed(() => {
  return configStore.mensajeCuotaMora
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{mes\}\}/g, 'Diciembre')
    .replace(/\{\{anio\}\}/g, '2024')
    .replace(/\{\{valor_cuota\}\}/g, '50.000')
    .replace(/\{\{sancion\}\}/g, '5.000')
    .replace(/\{\{total\}\}/g, '55.000')
    .replace(/\{\{fecha_vencimiento\}\}/g, '15/12/2024')
    .replace(/\{\{dias_mora\}\}/g, '10')
})

// Vista previa del mensaje de cuota pendiente
const vistaPreviewCuotaPendiente = computed(() => {
  return configStore.mensajeCuotaPendiente
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{mes\}\}/g, 'Diciembre')
    .replace(/\{\{anio\}\}/g, '2024')
    .replace(/\{\{valor_cuota\}\}/g, '50.000')
    .replace(/\{\{total\}\}/g, '50.000')
    .replace(/\{\{fecha_vencimiento\}\}/g, '15/12/2024')
})

function insertarVariable(variable) {
  const textarea = textareaIndividual.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = configStore.mensajeIndividual
  const variableText = `{{${variable}}}`
  
  configStore.mensajeIndividual = text.substring(0, start) + variableText + text.substring(end)
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

function insertarVariableCuota(variable, tipo) {
  let textarea
  let texto
  
  if (tipo === 'mensajeCuotaMora') {
    textarea = textareaCuotaMora.value
    texto = configStore.mensajeCuotaMora
  } else if (tipo === 'mensajeCuotaPendiente') {
    textarea = textareaCuotaPendiente.value
    texto = configStore.mensajeCuotaPendiente
  }
  
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const variableText = `{{${variable}}}`
  
  const nuevoTexto = texto.substring(0, start) + variableText + texto.substring(end)
  
  if (tipo === 'mensajeCuotaMora') {
    configStore.mensajeCuotaMora = nuevoTexto
  } else if (tipo === 'mensajeCuotaPendiente') {
    configStore.mensajeCuotaPendiente = nuevoTexto
  }
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

async function guardarCambios() {
  mensaje.value = null
  const result = await configStore.guardarConfiguracion()
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: result.message || 'Configuración guardada correctamente'
    }
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración'
    }
  }
  
  // Limpiar mensaje después de 5 segundos
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
}

function restaurarDefecto() {
  if (confirm('¿Estás seguro de restaurar los mensajes a sus valores por defecto?')) {
    configStore.restaurarValoresPorDefecto()
    mensaje.value = {
      tipo: 'exito',
      texto: 'Valores restaurados. No olvides guardar los cambios.'
    }
  }
}

async function verificarRolVisor() {
  try {
    // Obtener natilleraId desde la ruta si está disponible
    const natilleraId = route.params.id || route.query.natilleraId
    
    if (natilleraId) {
      natilleraIdActual.value = natilleraId
      const rol = await colaboradoresStore.obtenerMiRol(natilleraId)
      
      // Verificar si es visor y tiene permiso de configurar
      if (rol === 'visor') {
        const tienePermisoConfigurar = await colaboradoresStore.tienePermiso(natilleraId, 'configurar')
        esVisor.value = tienePermisoConfigurar
      } else {
        esVisor.value = false
      }
    } else {
      // Si no hay natilleraId en la ruta, verificar en todas las natilleras compartidas
      // Si el usuario es visor con permiso de configurar en alguna natillera, aplicar restricción
      const resultado = await colaboradoresStore.fetchNatillerasCompartidas()
      if (resultado.success && resultado.data) {
        const esVisorEnAlguna = resultado.data.some(natillera => 
          natillera.mi_rol === 'visor' && 
          natillera.mis_permisos?.configurar === true
        )
        esVisor.value = esVisorEnAlguna
      } else {
        esVisor.value = false
      }
    }
  } catch (e) {
    console.error('Error verificando rol visor:', e)
    esVisor.value = false
  }
}

onMounted(async () => {
  await configStore.cargarConfiguracion()
  await verificarRolVisor()
})
</script>


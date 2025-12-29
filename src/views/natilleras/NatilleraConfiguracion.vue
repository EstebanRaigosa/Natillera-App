<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <router-link 
        :to="`/natilleras/${id}`" 
        class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm"
      >
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
        </div>
        <span class="whitespace-nowrap">Volver a natillera</span>
      </router-link>
      <h1 class="text-2xl sm:text-3xl font-display font-bold text-gray-800">
        Configuración
      </h1>
      <p class="text-gray-500 mt-1">
        Configura el período, días de gracia y mensajes para esta natillera
      </p>
    </div>

    <!-- Tarjetas de opciones -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <!-- Tarjeta Mensajes -->
      <button
        @click="seccionActiva = seccionActiva === 'mensajes' ? null : 'mensajes'"
        :class="[
          'relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl',
          seccionActiva === 'mensajes'
            ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 border-green-400 shadow-green-500/30 scale-105'
            : 'bg-gradient-to-br from-white via-green-50/30 to-emerald-50/40 border-green-100/50 shadow-green-500/10 hover:border-green-300'
        ]"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        <div class="relative p-6 sm:p-8 text-left">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ChatBubbleLeftRightIcon :class="['w-8 h-8', seccionActiva === 'mensajes' ? 'text-white' : 'text-green-600']" />
          </div>
          <h3 :class="['text-xl font-display font-bold mb-2', seccionActiva === 'mensajes' ? 'text-white' : 'text-gray-800']">
            Mensajes
          </h3>
          <p :class="['text-sm mb-4', seccionActiva === 'mensajes' ? 'text-white/90' : 'text-gray-600']">
            Personaliza los mensajes de WhatsApp para recordatorios
          </p>
          <div v-if="seccionActiva === 'mensajes'" class="flex items-center gap-2 text-white/90 text-sm font-medium">
            <span>Expandido</span>
            <ChevronUpIcon class="w-4 h-4" />
          </div>
          <div v-else class="flex items-center gap-2 text-green-600 text-sm font-medium">
            <span>Haz clic para configurar</span>
            <ChevronDownIcon class="w-4 h-4" />
          </div>
        </div>
      </button>

      <!-- Tarjeta Período -->
      <button
        @click="seccionActiva = seccionActiva === 'periodo' ? null : 'periodo'"
        :class="[
          'relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl',
          seccionActiva === 'periodo'
            ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 border-blue-400 shadow-blue-500/30 scale-105'
            : 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 border-blue-100/50 shadow-blue-500/10 hover:border-blue-300'
        ]"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        <div class="relative p-6 sm:p-8 text-left">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <CalendarDaysIcon :class="['w-8 h-8', seccionActiva === 'periodo' ? 'text-white' : 'text-blue-600']" />
          </div>
          <h3 :class="['text-xl font-display font-bold mb-2', seccionActiva === 'periodo' ? 'text-white' : 'text-gray-800']">
            Período
          </h3>
          <p :class="['text-sm mb-4', seccionActiva === 'periodo' ? 'text-white/90' : 'text-gray-600']">
            Define el período de cuotas para esta natillera
          </p>
          <div v-if="seccionActiva === 'periodo'" class="flex items-center gap-2 text-white/90 text-sm font-medium">
            <span>Expandido</span>
            <ChevronUpIcon class="w-4 h-4" />
          </div>
          <div v-else class="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <span>Haz clic para configurar</span>
            <ChevronDownIcon class="w-4 h-4" />
          </div>
        </div>
      </button>

      <!-- Tarjeta Días de Gracia -->
      <button
        @click="seccionActiva = seccionActiva === 'diasGracia' ? null : 'diasGracia'"
        :class="[
          'relative overflow-hidden rounded-2xl shadow-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl',
          seccionActiva === 'diasGracia'
            ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 border-amber-400 shadow-amber-500/30 scale-105'
            : 'bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 border-amber-100/50 shadow-amber-500/10 hover:border-amber-300'
        ]"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        <div class="relative p-6 sm:p-8 text-left">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ClockIcon :class="['w-8 h-8', seccionActiva === 'diasGracia' ? 'text-white' : 'text-amber-600']" />
          </div>
          <h3 :class="['text-xl font-display font-bold mb-2', seccionActiva === 'diasGracia' ? 'text-white' : 'text-gray-800']">
            Días de Gracia
          </h3>
          <p :class="['text-sm mb-4', seccionActiva === 'diasGracia' ? 'text-white/90' : 'text-gray-600']">
            Configura los días de gracia para pagos en mora
          </p>
          <div v-if="seccionActiva === 'diasGracia'" class="flex items-center gap-2 text-white/90 text-sm font-medium">
            <span>Expandido</span>
            <ChevronUpIcon class="w-4 h-4" />
          </div>
          <div v-else class="flex items-center gap-2 text-amber-600 text-sm font-medium">
            <span>Haz clic para configurar</span>
            <ChevronDownIcon class="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>

    <!-- Sección Mensajes por Defecto -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="seccionActiva === 'mensajes'" class="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/40 rounded-2xl shadow-xl shadow-green-500/10 border-2 border-green-100/50">
      <!-- Decoración de fondo -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-emerald-200/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/30 to-transparent rounded-full -ml-24 -mb-24 blur-2xl"></div>
      
      <div class="relative p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 transform hover:scale-105 transition-transform">
            <ChatBubbleLeftRightIcon class="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">
              Mensajes por Defecto
            </h2>
            <p class="text-sm text-gray-600 mt-1">
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
              class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              title="Insertar nombre del socio"
            >
              {{nombre}}
            </button>
            <button 
              @click="insertarVariable('monto')"
              class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
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
          v-model="mensajeIndividual"
          class="input-field min-h-[150px] font-mono text-sm bg-white/80 backdrop-blur-sm border-2 border-green-200/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
          placeholder="Escribe el mensaje individual..."
        ></textarea>
        
        <!-- Vista previa -->
        <div class="mt-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200/50 rounded-xl backdrop-blur-sm">
          <p class="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
            <EyeIcon class="w-4 h-4" />
            Vista previa (ejemplo)
          </p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewIndividual }}</p>
        </div>
      </div>

      <div class="my-8 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent"></div>

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
          v-model="mensajeGeneral"
          class="input-field min-h-[150px] font-mono text-sm bg-white/80 backdrop-blur-sm border-2 border-green-200/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
          placeholder="Escribe el mensaje general..."
        ></textarea>
        
        <!-- Vista previa -->
        <div class="mt-4 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200/50 rounded-xl backdrop-blur-sm">
          <p class="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
            <EyeIcon class="w-4 h-4" />
            Vista previa
          </p>
          <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ mensajeGeneral }}</p>
        </div>
      </div>

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-green-200/50">
          <button 
            @click="restaurarDefectoMensajes"
            class="btn-secondary inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ArrowPathIcon class="w-4 h-4" />
            Restaurar valores por defecto
          </button>
          <button 
            @click="guardarMensajes"
            :disabled="guardandoMensajes"
            class="btn-primary flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
          >
            <CheckIcon class="w-4 h-4" />
            {{ guardandoMensajes ? 'Guardando...' : 'Guardar Mensajes' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>

    <!-- Sección Configuración de Período -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="seccionActiva === 'periodo'" class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl shadow-xl shadow-blue-500/10 border-2 border-blue-100/50">
      <!-- Decoración de fondo -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full -ml-24 -mb-24 blur-2xl"></div>
      
      <div class="relative p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform">
            <CalendarDaysIcon class="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">
              Configuración de Período
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Define el período de cuotas para esta natillera
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="label font-semibold text-gray-700">Mes de Inicio *</label>
            <select 
              v-model.number="configPeriodo.mes_inicio" 
              class="input-field bg-white/80 backdrop-blur-sm border-2 border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            >
              <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                {{ mes.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="label font-semibold text-gray-700">Mes de Fin *</label>
            <select 
              v-model.number="configPeriodo.mes_fin" 
              class="input-field bg-white/80 backdrop-blur-sm border-2 border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            >
              <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                {{ mes.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="label font-semibold text-gray-700">Año *</label>
            <input 
              v-model.number="configPeriodo.anio" 
              type="number" 
              class="input-field bg-white/80 backdrop-blur-sm border-2 border-blue-200/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              :min="new Date().getFullYear()"
              :max="new Date().getFullYear() + 10"
            />
          </div>
        </div>

        <div class="mt-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/50 rounded-xl backdrop-blur-sm">
          <p class="text-sm text-gray-700 font-medium">
            📅 El período será desde <strong class="text-blue-700">{{ meses.find(m => m.value === configPeriodo.mes_inicio)?.label }}</strong> 
            hasta <strong class="text-blue-700">{{ meses.find(m => m.value === configPeriodo.mes_fin)?.label }}</strong> de <strong class="text-blue-700">{{ configPeriodo.anio }}</strong>
          </p>
          <p class="text-xs text-gray-600 mt-2 font-semibold">
            Total: {{ configPeriodo.mes_fin >= configPeriodo.mes_inicio 
              ? configPeriodo.mes_fin - configPeriodo.mes_inicio + 1 
              : 12 - configPeriodo.mes_inicio + configPeriodo.mes_fin + 1 }} meses
          </p>
        </div>

        <div class="flex justify-end pt-6 border-t border-blue-200/50 mt-6">
          <button 
            @click="guardarConfigPeriodo"
            :disabled="guardandoPeriodo || natillerasStore.loading"
            class="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
          >
            <CheckIcon class="w-4 h-4" />
            {{ guardandoPeriodo || natillerasStore.loading ? 'Guardando...' : 'Guardar Período' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>

    <!-- Sección Configuración de Días de Gracia -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="seccionActiva === 'diasGracia'" class="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 rounded-2xl shadow-xl shadow-amber-500/10 border-2 border-amber-100/50">
      <!-- Decoración de fondo -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-orange-200/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full -ml-24 -mb-24 blur-2xl"></div>
      
      <div class="relative p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform">
            <ClockIcon class="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">
              Días de Gracia
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              Configura los días de gracia para pagos en mora
            </p>
          </div>
        </div>

      <div class="space-y-4">
        <div>
          <label class="label font-semibold text-gray-700">Días de Gracia *</label>
          <input 
            v-model.number="configDiasGracia.dias_gracia" 
            type="number" 
            class="input-field bg-white/80 backdrop-blur-sm border-2 border-amber-200/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
            min="0"
            max="30"
            placeholder="Ej: 3"
          />
          <p class="text-xs text-gray-500 mt-2">
            Número de días después de la fecha límite antes de considerar una cuota en mora.
          </p>
        </div>

        <div class="p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200/50 rounded-xl backdrop-blur-sm">
          <p class="text-sm text-gray-700 font-medium">
            ⏰ Las cuotas tendrán <strong class="text-amber-700">{{ configDiasGracia.dias_gracia }}</strong> día(s) de gracia después de la fecha límite antes de pasar a estado "en mora".
          </p>
        </div>
      </div>

      <div class="flex justify-end pt-6 border-t border-amber-200/50 mt-6">
        <button 
          @click="guardarConfigDiasGracia"
          :disabled="guardandoDiasGracia || natillerasStore.loading"
          class="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30"
        >
          <CheckIcon class="w-4 h-4" />
          {{ guardandoDiasGracia || natillerasStore.loading ? 'Guardando...' : 'Guardar Días de Gracia' }}
        </button>
      </div>
      </div>
      </div>
    </Transition>

    <!-- Mensaje de éxito/error -->
    <div v-if="mensaje" :class="[
      'p-3 rounded-xl text-sm flex items-center gap-2',
      mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    ]">
      <component :is="mensaje.tipo === 'exito' ? CheckCircleIcon : ExclamationCircleIcon" class="w-5 h-5" />
      {{ mensaje.texto }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { useConfiguracionStore } from '../../stores/configuracion'
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  UsersIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const natillerasStore = useNatillerasStore()
const configStore = useConfiguracionStore()
const guardandoPeriodo = ref(false)
const guardandoDiasGracia = ref(false)
const guardandoMensajes = ref(false)
const mensaje = ref(null)
const textareaIndividual = ref(null)
const seccionActiva = ref(null) // 'mensajes', 'periodo', 'diasGracia' o null

// Mensajes
const mensajeIndividual = ref('')
const mensajeGeneral = ref('')

const id = computed(() => route.params.id)
const natillera = computed(() => natillerasStore.natilleraActual)

// Configuración de meses
const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

// Configuración de período
const configPeriodo = ref({
  mes_inicio: 1,
  mes_fin: 11,
  anio: new Date().getFullYear()
})

// Configuración de días de gracia
const configDiasGracia = ref({
  dias_gracia: 3
})

async function guardarConfigPeriodo() {
  guardandoPeriodo.value = true
  mensaje.value = null
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    mes_inicio: configPeriodo.value.mes_inicio,
    mes_fin: configPeriodo.value.mes_fin,
    anio: configPeriodo.value.anio
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de período guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      configPeriodo.value = {
        mes_inicio: natillera.value.mes_inicio || 1,
        mes_fin: natillera.value.mes_fin || 11,
        anio: natillera.value.anio || new Date().getFullYear()
      }
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de período'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoPeriodo.value = false
}

async function guardarConfigDiasGracia() {
  guardandoDiasGracia.value = true
  mensaje.value = null
  
  // Obtener las reglas de multas actuales
  const reglasMultasActuales = natillera.value?.reglas_multas || { activa: false }
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    reglas_multas: {
      ...reglasMultasActuales,
      dias_gracia: configDiasGracia.value.dias_gracia
    }
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de días de gracia guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      const reglasMultas = natillera.value.reglas_multas || {}
      configDiasGracia.value = {
        dias_gracia: reglasMultas.dias_gracia || 3
      }
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de días de gracia'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoDiasGracia.value = false
}

// Vista previa del mensaje individual con datos de ejemplo
const vistaPreviewIndividual = computed(() => {
  return mensajeIndividual.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{monto\}\}/g, '50.000')
})

function insertarVariable(variable) {
  const textarea = textareaIndividual.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = mensajeIndividual.value
  const variableText = `{{${variable}}}`
  
  mensajeIndividual.value = text.substring(0, start) + variableText + text.substring(end)
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

async function guardarMensajes() {
  guardandoMensajes.value = true
  mensaje.value = null
  
  // Guardar en el store de configuración
  configStore.mensajeIndividual = mensajeIndividual.value
  configStore.mensajeGeneral = mensajeGeneral.value
  
  const result = await configStore.guardarConfiguracion()
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: result.message || 'Mensajes guardados correctamente'
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar los mensajes'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoMensajes.value = false
}

function restaurarDefectoMensajes() {
  if (confirm('¿Estás seguro de restaurar los mensajes a sus valores por defecto?')) {
    configStore.restaurarValoresPorDefecto()
    mensajeIndividual.value = configStore.mensajeIndividual
    mensajeGeneral.value = configStore.mensajeGeneral
    mensaje.value = {
      tipo: 'exito',
      texto: 'Valores restaurados. No olvides guardar los cambios.'
    }
  }
}

// Función para actualizar los valores locales desde la natillera
function actualizarValoresDesdeNatillera() {
  if (natillera.value) {
    configPeriodo.value = {
      mes_inicio: natillera.value.mes_inicio || 1,
      mes_fin: natillera.value.mes_fin || 11,
      anio: natillera.value.anio || new Date().getFullYear()
    }
    
    const reglasMultas = natillera.value.reglas_multas || {}
    configDiasGracia.value = {
      dias_gracia: reglasMultas.dias_gracia || 3
    }
  }
}

// Watch para actualizar los valores cuando cambie la natillera
watch(() => natillera.value, (newNatillera) => {
  if (newNatillera) {
    actualizarValoresDesdeNatillera()
  }
}, { immediate: true, deep: true })

onMounted(async () => {
  // Cargar configuración de mensajes
  await configStore.cargarConfiguracion()
  mensajeIndividual.value = configStore.mensajeIndividual
  mensajeGeneral.value = configStore.mensajeGeneral
  
  // Cargar la natillera
  await natillerasStore.fetchNatillera(id.value)
  
  // Los valores se actualizarán automáticamente por el watch
})
</script>


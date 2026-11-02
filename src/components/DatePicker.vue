<template>
  <div class="relative" ref="containerRef">
    <!-- Input visible con formato dd/mm/yyyy -->
    <div 
      @click="toggleCalendar"
      :class="[
        'w-full px-4 py-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2',
        isOpen 
          ? 'border-natillera-500 ring-2 ring-natillera-200 oscuro:ring-natillera-500/30 bg-superficie-tarjeta' 
          : 'border-borde bg-superficie-tarjeta hover:border-borde-fuerte',
        inputClass
      ]"
    >
      <span :class="modelValue ? 'text-texto font-medium' : 'text-texto-tenue'">
        {{ displayValue || placeholder }}
      </span>
      <CalendarDaysIcon class="w-5 h-5 text-texto-tenue" />
    </div>

    <!-- Calendario desplegable: flotante sobre la página (Teleport + fixed). Dentro de un modal con
         scroll, un desplegable absoluto quedaba cortado y obligaba a desplazarse para ver los días. -->
    <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div 
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-[200] bg-superficie-tarjeta rounded-2xl shadow-2xl border border-borde-suave p-3 w-[min(21rem,calc(100vw-2rem))]"
        :style="dropdownStyle"
      >
        <!-- Acciones rápidas arriba: son lo más usado y quedan a la vista sin bajar por el mes -->
        <div class="flex gap-2 mb-3 pb-3 border-b border-borde-suave">
          <button 
            type="button"
            @click="selectToday"
            class="flex-1 min-h-11 touch-manipulation px-3 py-2 text-xs font-semibold text-natillera-600 oscuro:text-natillera-300 bg-natillera-50 oscuro:bg-natillera-500/15 hover:bg-natillera-100 oscuro:hover:bg-natillera-500/15 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button 
            type="button"
            @click="clearDate"
            class="flex-1 min-h-11 touch-manipulation px-3 py-2 text-xs font-semibold text-texto-secundario bg-superficie-suave hover:bg-superficie-hundida rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>
        <!-- Header del calendario -->
        <div class="flex items-center justify-between mb-4">
          <button 
            type="button"
            aria-label="Mes anterior"
            @click="previousMonth"
            class="flex h-11 w-11 touch-manipulation items-center justify-center hover:bg-superficie-hundida rounded-lg transition-colors"
          >
            <ChevronLeftIcon class="w-5 h-5 text-texto-secundario" aria-hidden="true" />
          </button>
          <div class="text-center">
            <span class="font-bold text-texto">{{ monthNames[currentMonth] }}</span>
            <span class="text-texto-suave ml-1">{{ currentYear }}</span>
          </div>
          <button 
            type="button"
            aria-label="Mes siguiente"
            @click="nextMonth"
            class="flex h-11 w-11 touch-manipulation items-center justify-center hover:bg-superficie-hundida rounded-lg transition-colors"
          >
            <ChevronRightIcon class="w-5 h-5 text-texto-secundario" aria-hidden="true" />
          </button>
        </div>

        <!-- Días de la semana -->
        <div class="grid grid-cols-7 mb-2">
          <div 
            v-for="day in weekDays" 
            :key="day" 
            class="text-center text-xs font-semibold text-texto-tenue py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Días del mes: la celda (botón) mide 44px de toque; el cuadro visible es el span
             interior, del mismo tamaño que antes. Sin `gap` para que las áreas se toquen. -->
        <div class="grid grid-cols-7">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            @click="day.date && selectDate(day.date)"
            :disabled="!day.date || day.isDisabled"
            :class="[
              'flex h-11 items-center justify-center touch-manipulation',
              !day.date ? 'invisible' : '',
              day.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            <span
              :class="[
                'flex h-9 w-9 items-center justify-center text-sm rounded-lg transition-all',
                day.isSelected 
                  ? 'bg-gradient-to-br from-natillera-500 to-natillera-600 text-white font-bold shadow-lg shadow-natillera-500/30' 
                  : day.isToday 
                    ? 'bg-natillera-100 oscuro:bg-natillera-500/15 text-natillera-700 oscuro:text-natillera-300 font-semibold' 
                    : day.isCurrentMonth 
                      ? 'text-texto-medio hover:bg-superficie-hundida' 
                      : 'text-gray-300 oscuro:text-texto-tenue',
                day.isDisabled ? 'opacity-50' : ''
              ]"
            >
              {{ day.day }}
            </span>
          </button>
        </div>

      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'dd/mm/yyyy'
  },
  inputClass: {
    type: String,
    default: ''
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const containerRef = ref(null)
const dropdownRef = ref(null)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

// Antes de medir se pinta fuera de vista para no ver un salto desde (0,0)
const dropdownStyle = ref({ top: '-9999px', left: '0px' })
const MARGEN = 8

// Abre debajo del campo si cabe; si no, encima; si tampoco, pegado al borde visible.
// Se mide con visualViewport porque el teclado y el zoom de iOS achican el área visible
// sin cambiar window.innerHeight.
function posicionarCalendario() {
  if (!containerRef.value || !dropdownRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const vv = window.visualViewport
  const altoVisible = vv ? vv.height + vv.offsetTop : window.innerHeight
  const anchoVisible = vv ? vv.width + vv.offsetLeft : window.innerWidth
  const alto = dropdownRef.value.offsetHeight
  const ancho = dropdownRef.value.offsetWidth

  let top
  if (altoVisible - rect.bottom - MARGEN >= alto) top = rect.bottom + MARGEN
  else if (rect.top - MARGEN >= alto) top = rect.top - MARGEN - alto
  else top = Math.max(MARGEN, altoVisible - alto - MARGEN)

  const left = Math.min(Math.max(16, rect.left), Math.max(16, anchoVisible - ancho - 16))
  dropdownStyle.value = { top: `${top}px`, left: `${left}px` }
}

// Con el calendario abierto, sigue al campo si el contenedor hace scroll (captura: el scroll
// del cuerpo del modal no burbujea) o si cambia el viewport (rotación, teclado, zoom).
function escucharPosicion(activo) {
  const accion = activo ? 'addEventListener' : 'removeEventListener'
  window[accion]('scroll', posicionarCalendario, true)
  window[accion]('resize', posicionarCalendario)
  window[accion]('orientationchange', posicionarCalendario)
  window.visualViewport?.[accion]('resize', posicionarCalendario)
  window.visualViewport?.[accion]('scroll', posicionarCalendario)
}

watch(isOpen, async (open) => {
  escucharPosicion(open)
  if (!open) {
    dropdownStyle.value = { top: '-9999px', left: '0px' }
    return
  }
  await nextTick()
  posicionarCalendario()
})

// Un mes de 6 semanas es más alto que uno de 5: si abrió encima del campo, hay que reubicarlo
watch([currentMonth, currentYear], async () => {
  if (!isOpen.value) return
  await nextTick()
  posicionarCalendario()
})

// Mostrar la fecha en formato dd/mm/yyyy
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const [year, month, day] = props.modelValue.split('-')
  return `${day}/${month}/${year}`
})

// Generar los días del calendario
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // Ajustar para que la semana empiece en lunes
  let startDay = firstDay.getDay() - 1
  if (startDay < 0) startDay = 6
  
  // Días vacíos al inicio
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, day: '', isCurrentMonth: false })
  }
  
  // Días del mes
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(currentYear.value, currentMonth.value, d)
    const dateStr = formatDateToISO(date)
    
    let isDisabled = false
    if (props.minDate && dateStr < props.minDate) isDisabled = true
    if (props.maxDate && dateStr > props.maxDate) isDisabled = true
    
    days.push({
      date: date,
      day: d,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isSelected: dateStr === props.modelValue,
      isDisabled
    })
  }
  
  return days
})

function formatDateToISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toggleCalendar() {
  isOpen.value = !isOpen.value
  if (isOpen.value && props.modelValue) {
    const [year, month] = props.modelValue.split('-')
    currentYear.value = parseInt(year)
    currentMonth.value = parseInt(month) - 1
  }
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDate(date) {
  const dateStr = formatDateToISO(date)
  emit('update:modelValue', dateStr)
  isOpen.value = false
}

function selectToday() {
  selectDate(new Date())
}

function clearDate() {
  emit('update:modelValue', '')
  isOpen.value = false
}

// Cerrar al hacer clic fuera
function handleClickOutside(event) {
  // El calendario vive en <body> (Teleport): tocarlo no es «fuera» aunque no esté dentro del campo
  if (containerRef.value?.contains(event.target)) return
  if (dropdownRef.value?.contains(event.target)) return
  isOpen.value = false
}

// Además de `click`, `touchstart`: Safari en iOS no emite click al tocar zonas no
// interactivas (texto, fondos), y el desplegable se quedaba abierto.
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
  escucharPosicion(false)
})

// Actualizar el mes/año cuando cambia el valor
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const [year, month] = newVal.split('-')
    currentYear.value = parseInt(year)
    currentMonth.value = parseInt(month) - 1
  }
})
</script>


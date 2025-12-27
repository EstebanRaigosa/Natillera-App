<template>
  <div class="relative" ref="containerRef">
    <!-- Input visible con formato dd/mm/yyyy -->
    <div 
      @click="toggleCalendar"
      :class="[
        'w-full px-4 py-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2',
        isOpen 
          ? 'border-natillera-500 ring-2 ring-natillera-200 bg-white' 
          : 'border-gray-200 bg-white hover:border-gray-300',
        inputClass
      ]"
    >
      <span :class="modelValue ? 'text-gray-800 font-medium' : 'text-gray-400'">
        {{ displayValue || placeholder }}
      </span>
      <CalendarDaysIcon class="w-5 h-5 text-gray-400" />
    </div>

    <!-- Calendario desplegable -->
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
        class="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72"
        :class="dropdownPosition"
      >
        <!-- Header del calendario -->
        <div class="flex items-center justify-between mb-4">
          <button 
            type="button"
            @click="previousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
          </button>
          <div class="text-center">
            <span class="font-bold text-gray-800">{{ monthNames[currentMonth] }}</span>
            <span class="text-gray-500 ml-1">{{ currentYear }}</span>
          </div>
          <button 
            type="button"
            @click="nextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- Días de la semana -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div 
            v-for="day in weekDays" 
            :key="day" 
            class="text-center text-xs font-semibold text-gray-400 py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Días del mes -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            @click="day.date && selectDate(day.date)"
            :disabled="!day.date || day.isDisabled"
            :class="[
              'aspect-square flex items-center justify-center text-sm rounded-lg transition-all',
              !day.date ? 'invisible' : '',
              day.isSelected 
                ? 'bg-gradient-to-br from-natillera-500 to-natillera-600 text-white font-bold shadow-lg shadow-natillera-500/30' 
                : day.isToday 
                  ? 'bg-natillera-100 text-natillera-700 font-semibold' 
                  : day.isCurrentMonth 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-gray-300',
              day.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            {{ day.day }}
          </button>
        </div>

        <!-- Acciones rápidas -->
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button 
            type="button"
            @click="selectToday"
            class="flex-1 px-3 py-2 text-xs font-semibold text-natillera-600 bg-natillera-50 hover:bg-natillera-100 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button 
            type="button"
            @click="clearDate"
            class="flex-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

const dropdownPosition = computed(() => {
  return 'left-0'
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
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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


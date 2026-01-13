<template>
  <div class="relative w-full">
    <!-- Input de texto visible con formato dd/MM/yyyy -->
    <div class="relative w-full">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <svg class="w-5 h-5 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <input
        ref="textInputRef"
        :value="displayValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @click.stop
        type="text"
        :placeholder="placeholder"
        :class="[
          'w-full input-field pl-12 pr-14 text-base font-semibold focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 border-2 border-natillera-200 bg-white hover:border-natillera-300 transition-all relative z-10',
          inputClass
        ]"
        :required="required"
        maxlength="10"
        inputmode="numeric"
      />
      <!-- Input date oculto para el calendario nativo -->
      <input
        ref="dateInputRef"
        :value="isoValue"
        @change="handleDateChange"
        type="date"
        class="sr-only"
        :required="required"
        tabindex="-1"
        aria-hidden="true"
      />
      <!-- Botón para abrir calendario -->
      <button
        type="button"
        @click.stop="openDatePicker"
        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto z-20 p-1.5 rounded-lg text-gray-400 hover:text-natillera-600 hover:bg-natillera-50 active:bg-natillera-100 transition-all duration-200"
        title="Abrir calendario"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'dd/MM/yyyy'
  },
  inputClass: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const textInputRef = ref(null)
const dateInputRef = ref(null)

// Convertir valor ISO (YYYY-MM-DD) a formato dd/MM/yyyy
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  // Si ya está en formato dd/MM/yyyy, retornarlo
  if (props.modelValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return props.modelValue
  }
  // Si está en formato ISO (YYYY-MM-DD), convertirlo
  if (props.modelValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = props.modelValue.split('-')
    return `${day}/${month}/${year}`
  }
  return props.modelValue
})

// Convertir valor a formato ISO para el input date
const isoValue = computed(() => {
  if (!props.modelValue) return ''
  // Si está en formato dd/MM/yyyy, convertirlo a ISO
  if (props.modelValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = props.modelValue.split('/')
    return `${year}-${month}-${day}`
  }
  // Si ya está en formato ISO, retornarlo
  if (props.modelValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return props.modelValue
  }
  return ''
})

// Manejar entrada de texto con formato dd/MM/yyyy
function handleInput(event) {
  let value = event.target.value.replace(/\D/g, '') // Solo números
  
  // Aplicar máscara dd/MM/yyyy
  if (value.length > 0) {
    if (value.length <= 2) {
      value = value
    } else if (value.length <= 4) {
      value = value.slice(0, 2) + '/' + value.slice(2)
    } else {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8)
    }
  }
  
  // Validar formato
  if (value.length === 10) {
    const [day, month, year] = value.split('/')
    const dayNum = parseInt(day)
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    
    // Validar rango
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
      // Convertir a formato ISO para emitir
      const isoDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      emit('update:modelValue', isoDate)
    } else {
      // Si no es válido, mantener el valor formateado pero no emitir
      event.target.value = value
    }
  } else {
    event.target.value = value
  }
}

// Manejar focus - seleccionar todo el texto
function handleFocus(event) {
  event.target.select()
}

// Manejar blur - validar y formatear
function handleBlur(event) {
  const value = event.target.value
  if (value && value.length === 10) {
    const [day, month, year] = value.split('/')
    const dayNum = parseInt(day)
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    
    // Validar y corregir si es necesario
    if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
      const date = new Date(yearNum, monthNum - 1, dayNum)
      if (date.getDate() === dayNum && date.getMonth() === monthNum - 1 && date.getFullYear() === yearNum) {
        // Fecha válida
        const isoDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
        emit('update:modelValue', isoDate)
      }
    }
  }
}

// Abrir el calendario nativo
function openDatePicker(event) {
  event.preventDefault()
  event.stopPropagation()
  
  if (dateInputRef.value) {
    // Intentar usar showPicker() si está disponible (Chrome, Edge, Safari 16.4+)
    if (typeof dateInputRef.value.showPicker === 'function') {
      try {
        const pickerPromise = dateInputRef.value.showPicker()
        // Si retorna una promesa, manejar errores
        if (pickerPromise && typeof pickerPromise.catch === 'function') {
          pickerPromise.catch((error) => {
            // Si falla (por ejemplo, en algunos navegadores), hacer click como fallback
            console.log('showPicker no disponible, usando click como fallback:', error)
            dateInputRef.value.focus()
            dateInputRef.value.click()
          })
        }
      } catch (error) {
        // Si showPicker lanza un error, usar click como fallback
        console.log('Error al usar showPicker, usando click como fallback:', error)
        dateInputRef.value.focus()
        dateInputRef.value.click()
      }
    } else {
      // Fallback para navegadores que no soportan showPicker
      dateInputRef.value.focus()
      dateInputRef.value.click()
    }
  }
}

// Manejar cambio del input date
function handleDateChange(event) {
  const isoDate = event.target.value
  if (isoDate) {
    emit('update:modelValue', isoDate)
  }
}

// Sincronizar cuando cambia el modelValue externamente
watch(() => props.modelValue, (newValue) => {
  if (textInputRef.value && newValue) {
    if (newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = newValue.split('-')
      textInputRef.value.value = `${day}/${month}/${year}`
    } else if (newValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      textInputRef.value.value = newValue
    }
  } else if (textInputRef.value && !newValue) {
    textInputRef.value.value = ''
  }
}, { immediate: true })
</script>


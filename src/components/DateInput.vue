<template>
  <div class="relative w-full">
    <!-- Input de texto visible con formato dd/MM/yyyy -->
    <div class="relative w-full">
      <!-- Icono de calendario a la izquierda -->
      <div class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
        <svg class="w-5 h-5 text-natillera-600 oscuro:text-natillera-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <!-- Input de texto -->
      <input
        ref="textInputRef"
        :value="displayValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @click.stop
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full input-field pl-11 sm:pl-12 pr-12 text-base font-semibold focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 border-2 border-natillera-200 oscuro:border-natillera-500/30 transition-all relative z-10',
          disabled ? 'bg-superficie-hundida text-texto-secundario cursor-not-allowed hover:border-natillera-200 oscuro:hover:border-natillera-500/30' : 'bg-superficie-tarjeta hover:border-natillera-300 oscuro:hover:border-natillera-500/30',
          inputClass
        ]"
        :required="required && !disabled"
        maxlength="10"
        inputmode="numeric"
      />
      
      <!-- Input date oculto para el calendario nativo -->
      <input
        ref="dateInputRef"
        :value="isoValue"
        @change="handleDateChange"
        type="date"
        :class="['date-input-hidden', esIos && !disabled ? 'date-input-hidden--ios' : '']"
        :aria-label="esIos ? 'Abrir calendario' : undefined"
        :required="required && !disabled"
        :disabled="disabled"
      />
      
      <!-- Botón/icono calendario a la derecha -->
      <button
        type="button"
        :disabled="disabled"
        class="date-input-calendar-button"
        :class="[
          disabled
            ? 'cursor-default text-texto-suave'
            : 'text-texto-tenue hover:text-natillera-600 oscuro:hover:text-natillera-300 hover:bg-natillera-50 oscuro:hover:bg-natillera-500/15 active:bg-natillera-100 oscuro:active:bg-natillera-500/15 transition-all duration-200 cursor-pointer'
        ]"
        :title="disabled ? 'Fecha calculada automáticamente' : 'Abrir calendario'"
        @click.stop="!disabled && openDatePicker($event)"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { detectIosPlatform } from '../composables/useIsIos'

// En iOS < 16 no hay `showPicker()`, y un `click()` por código sobre un input con
// `pointer-events: none` no abre nada. Allí el input date queda transparente encima del
// botón del calendario para que el propio toque del usuario abra el selector nativo.
const esIos = detectIosPlatform()

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
  },
  disabled: {
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

// Abrir el calendario nativo. Fuera de iOS el botón llama a `showPicker()`, que devuelve
// undefined (no una promesa: el `.then` de antes lanzaba TypeError) y lanza si no hay gesto
// o el navegador no lo permite; entonces al menos se enfoca el input.
function openDatePicker(event) {
  event.preventDefault()
  event.stopPropagation()
  const input = dateInputRef.value
  if (!input || props.disabled) return
  try {
    input.showPicker()
  } catch {
    input.focus()
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

<style scoped>
.date-input-calendar-button {
  position: absolute !important;
  right: 0.25rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  z-index: 20 !important;
  /* 44px de área táctil (el icono sigue siendo de 20px) */
  width: 2.75rem !important;
  height: 2.75rem !important;
  touch-action: manipulation;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 0.375rem;
  flex-shrink: 0;
  background: transparent;
  border: none;
  padding: 0;
}

.date-input-hidden {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: 1 !important;
  cursor: pointer !important;
}

/* iOS: el input date, transparente, cubre justo el botón del calendario y recibe el toque.
   Solo el botón: sobre todo el campo impediría escribir la fecha a mano. */
.date-input-hidden.date-input-hidden--ios {
  left: auto !important;
  right: 0.25rem !important;
  top: 50% !important;
  width: 2.75rem !important;
  height: 2.75rem !important;
  min-height: 0 !important;
  -webkit-transform: translateY(-50%) !important;
  transform: translateY(-50%) !important;
  pointer-events: auto !important;
  z-index: 25 !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 16px !important;
  touch-action: manipulation;
}
</style>
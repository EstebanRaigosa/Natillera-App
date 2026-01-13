<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-600 p-5 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-lg">Completa tu perfil</h3>
                <p class="text-sm text-white/90">Agrega un nombre de usuario</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-5 space-y-4">
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p class="text-sm text-amber-800">
                Para continuar, necesitamos que agregues un nombre de usuario. Este nombre se mostrará en tu perfil y en las actividades de la natillera.
              </p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de usuario <span class="text-red-500">*</span>
              </label>
              <input
                v-model="username"
                type="text"
                placeholder="Tu nombre completo"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 outline-none text-sm transition-all"
                :class="{
                  'border-red-300 focus:border-red-500 focus:ring-red-500': error
                }"
                :disabled="loading"
                required
                autofocus
                minlength="2"
                maxlength="100"
              />
              <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
              <p v-else class="mt-1 text-xs text-gray-500">
                Este será tu nombre de usuario en la plataforma
              </p>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="handleClose"
                :disabled="loading"
                class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="loading || !username.trim() || username.trim().length < 2"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span v-else>Guardar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const authStore = useAuthStore()
const username = ref('')
const loading = ref(false)
const error = ref('')

// Limpiar formulario cuando se abre el modal
watch(() => props.show, (newValue) => {
  if (newValue) {
    username.value = ''
    error.value = ''
    // Intentar prellenar con el email si no hay nombre
    if (authStore.user?.email && !authStore.user?.user_metadata?.nombre) {
      const emailName = authStore.user.email.split('@')[0]
      username.value = emailName
    }
  }
})

function handleClose() {
  if (!loading.value) {
    emit('close')
  }
}

async function handleSubmit() {
  if (!username.value.trim() || username.value.trim().length < 2) {
    error.value = 'El nombre debe tener al menos 2 caracteres'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.updateDisplayName(username.value.trim())
    
    if (result.success) {
      emit('saved')
      handleClose()
    } else {
      error.value = result.error || 'Error al guardar el nombre de usuario'
    }
  } catch (e) {
    error.value = 'Error al guardar el nombre de usuario. Por favor, intenta nuevamente.'
    console.error('Error guardando nombre de usuario:', e)
  } finally {
    loading.value = false
  }
}
</script>

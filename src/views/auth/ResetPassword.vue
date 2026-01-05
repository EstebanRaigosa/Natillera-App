<template>
  <div class="w-full">
    <!-- Header con animación -->
    <div class="flex flex-col items-center gap-4 mb-8 animate-fade-in-up">
      <div class="relative">
        <h2 class="text-3xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
          Restablecer Contraseña
        </h2>
        <div class="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-natillera-400 via-emerald-400 to-natillera-400 rounded-full transform scale-x-0 animate-scale-x"></div>
      </div>
    </div>

    <!-- Vista de éxito -->
    <div v-if="success" class="text-center py-8 animate-fade-in-up">
      <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 class="text-2xl font-display font-bold text-gray-800 mb-3">
        ¡Contraseña restablecida!
      </h3>
      <p class="text-gray-600 mb-6">
        Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
      </p>
      <router-link
        to="/auth/login"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg"
      >
        Ir al inicio de sesión
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
      </router-link>
    </div>

    <!-- Formulario de restablecimiento -->
    <form v-else @submit.prevent="handleResetPassword" class="space-y-6 animate-fade-in-up stagger-1">
      <!-- Mensaje informativo -->
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p class="text-sm text-blue-800 text-center">
          Ingresa tu nueva contraseña. Asegúrate de usar una contraseña segura con al menos 6 caracteres.
        </p>
      </div>

      <!-- Campo Nueva Contraseña -->
      <div class="group">
        <label class="label flex items-center gap-2">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Nueva contraseña
        </label>
        <div class="relative">
          <input 
            v-model="password"
            :type="showPassword ? 'text' : 'password'" 
            class="input-field pr-12 transition-all duration-300 hover:shadow-md hover:border-natillera-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-natillera-500/20"
            placeholder="Mínimo 6 caracteres"
            minlength="6"
            required
          />
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-natillera-600 hover:bg-natillera-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <EyeIcon v-if="!showPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-emerald-500/0 to-natillera-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>

      <!-- Campo Confirmar Contraseña -->
      <div class="group">
        <label class="label flex items-center gap-2">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Confirmar nueva contraseña
        </label>
        <div class="relative">
          <input 
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'" 
            class="input-field pr-12 transition-all duration-300 hover:shadow-md hover:border-natillera-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-natillera-500/20"
            placeholder="Repite tu contraseña"
            minlength="6"
            required
          />
          <button 
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-natillera-600 hover:bg-natillera-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-emerald-500/0 to-natillera-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <Transition name="error-slide">
        <div v-if="errorMessage" class="relative overflow-hidden p-4 bg-gradient-to-br from-red-50 via-red-50/95 to-rose-50 border border-red-200/80 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in-up">
          <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 animate-shimmer"></div>
          <div class="relative flex items-start gap-3">
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-md shadow-red-500/30">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-red-800 font-semibold text-sm mb-1">Error</p>
              <p class="text-red-700 text-sm leading-relaxed">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botón de restablecimiento -->
      <button 
        type="submit" 
        class="group relative w-full overflow-hidden bg-gradient-to-r from-natillera-500 via-natillera-600 to-emerald-600 text-white font-semibold rounded-xl py-4 shadow-lg shadow-natillera-500/30 hover:shadow-xl hover:shadow-natillera-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        :disabled="authStore.loading || !isFormValid"
      >
        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <span v-if="authStore.loading" class="relative z-10 animate-spin">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span v-else class="relative z-10 flex items-center gap-2">
          <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          Restablecer contraseña
        </span>
      </button>
    </form>

    <!-- Enlace de regreso al login -->
    <div v-if="!success" class="mt-8 text-center animate-fade-in-up stagger-2">
      <p class="text-sm text-gray-600">
        ¿Recordaste tu contraseña? 
        <router-link 
          to="/auth/login" 
          class="relative inline-flex items-center gap-1 text-natillera-600 font-semibold hover:text-natillera-700 transition-colors group"
        >
          <span>Inicia sesión</span>
          <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-natillera-600 group-hover:w-full transition-all duration-300"></span>
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isFormValid = computed(() => {
  return password.value.length >= 6 && 
         confirmPassword.value.length >= 6 && 
         password.value === confirmPassword.value
})

onMounted(async () => {
  // Verificar que hay un token de reset en la URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const accessToken = hashParams.get('access_token')
  const type = hashParams.get('type')
  
  // También verificar query params (por si Supabase los pasa de otra forma)
  const queryParams = new URLSearchParams(window.location.search)
  const tokenFromQuery = queryParams.get('token')
  
  if (!accessToken && type !== 'recovery' && !tokenFromQuery) {
    // Si no hay token, redirigir al login
    errorMessage.value = 'El enlace de restablecimiento no es válido o ha expirado. Por favor, solicita un nuevo enlace.'
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
  }
})

async function handleResetPassword() {
  errorMessage.value = ''
  success.value = false

  // Validaciones
  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  const result = await authStore.updatePassword(password.value)
  
  if (result.success) {
    success.value = true
    // Limpiar los campos
    password.value = ''
    confirmPassword.value = ''
  } else {
    errorMessage.value = result.error || 'Error al restablecer la contraseña. Por favor, intenta de nuevo.'
  }
}
</script>


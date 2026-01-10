<template>
  <div>
    <h2 class="text-2xl font-display font-bold text-gray-800 text-center mb-6">
      Crear Cuenta
    </h2>

    <form @submit.prevent="handleRegister" class="space-y-5">
      <div>
        <label class="label">Nombre completo</label>
        <input 
          v-model="nombre"
          type="text" 
          class="input-field"
          placeholder="Tu nombre"
          required
        />
      </div>

      <div>
        <label class="label">Correo electrónico</label>
        <input 
          v-model="email"
          type="email" 
          class="input-field"
          placeholder="tu@correo.com"
          required
        />
      </div>

      <div>
        <label class="label">Contraseña</label>
        <div class="relative">
          <input 
            v-model="password"
            :type="showPassword ? 'text' : 'password'" 
            class="input-field pr-12"
            placeholder="Mínimo 6 caracteres"
            minlength="6"
            required
          />
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeIcon v-if="!showPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <label class="label">Confirmar contraseña</label>
        <div class="relative">
          <input 
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'" 
            class="input-field pr-12"
            placeholder="Repite tu contraseña"
            required
          />
          <button 
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
            <EyeSlashIcon v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Mensaje de éxito mejorado -->
      <div v-if="successMessage" class="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-green-800 mb-1">¡Cuenta creada exitosamente! 🎉</h4>
            <p class="text-sm text-green-700 mb-3">
              Hemos enviado un enlace de confirmación a <strong>{{ emailRegistrado }}</strong>
            </p>
            <!-- Aviso de tiempo de espera -->
            <div class="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-3">
              <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-xs text-amber-700 font-medium">
                El correo puede demorar hasta 5 minutos en llegar
              </p>
            </div>
            <p class="text-xs text-green-600">
              Revisa tu bandeja de entrada y carpeta de spam. Una vez confirmado, podrás iniciar sesión.
            </p>
          </div>
        </div>
      </div>

      <button 
        v-if="!successMessage"
        type="submit" 
        class="btn-primary w-full flex items-center justify-center gap-2"
        :disabled="authStore.loading"
      >
        <span v-if="authStore.loading" class="animate-spin">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span>{{ authStore.loading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
      </button>

      <!-- Botón para ir a login después de registro exitoso -->
      <router-link 
        v-if="successMessage"
        to="/auth/login" 
        class="btn-primary w-full flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
        </svg>
        Ir a Iniciar Sesión
      </router-link>
    </form>

    <!-- Separador -->
    <div v-if="!successMessage" class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white text-gray-500 font-medium">O regístrate con</span>
      </div>
    </div>

    <!-- Botón de Google -->
    <button
      v-if="!successMessage"
      @click="handleGoogleLogin"
      :disabled="authStore.loading"
      class="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <!-- Logo de Google -->
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Continuar con Google</span>
    </button>

    <p v-if="!successMessage" class="mt-6 text-center text-sm text-gray-500">
      ¿Ya tienes cuenta? 
      <router-link to="/auth/login" class="text-natillera-600 font-semibold hover:text-natillera-700">
        Inicia sesión
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const nombre = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const emailRegistrado = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleRegister() {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  const result = await authStore.register(email.value, password.value, nombre.value)
  
  if (result.success) {
    // Guardar el email antes de limpiar el formulario
    emailRegistrado.value = email.value
    successMessage.value = true
    // Limpiar el formulario
    nombre.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    // No redirigir al dashboard - el usuario debe validar su email primero
  } else {
    errorMessage.value = result.error
  }
}

async function handleGoogleLogin() {
  errorMessage.value = ''
  const result = await authStore.loginWithGoogle()
  
  if (!result.success) {
    errorMessage.value = result.error || 'Error al iniciar sesión con Google'
  }
}
</script>

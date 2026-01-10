<template>
  <div class="w-full">
    <!-- Header con animación -->
    <div class="flex flex-col items-center gap-4 mb-8 animate-fade-in-up">
      <div class="relative">
        <h2 class="text-3xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
          Iniciar Sesión
        </h2>
        <div class="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-natillera-400 via-emerald-400 to-natillera-400 rounded-full transform scale-x-0 animate-scale-x"></div>
      </div>
      
      <div class="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full blur-md opacity-60 animate-pulse"></div>
        <span class="relative flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
          <span class="w-2 h-2 bg-white rounded-full animate-ping"></span>
          <span class="w-2 h-2 bg-white rounded-full absolute"></span>
          Versión Beta
        </span>
      </div>
    </div>

    <!-- Formulario con animaciones -->
    <form @submit.prevent="handleLogin" class="space-y-6 animate-fade-in-up stagger-1">
      <!-- Campo Email -->
      <div class="group">
        <label class="label flex items-center gap-2">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
          </svg>
          Correo electrónico
        </label>
        <div class="relative">
          <input 
            v-model="email"
            type="email" 
            class="input-field transition-all duration-300 hover:shadow-md hover:border-natillera-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-natillera-500/20"
            placeholder="tu@correo.com"
            required
          />
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-emerald-500/0 to-natillera-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>

      <!-- Campo Contraseña -->
      <div class="group">
        <label class="label flex items-center gap-2">
          <svg class="w-4 h-4 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          Contraseña
        </label>
        <div class="relative">
          <input 
            v-model="password"
            :type="showPassword ? 'text' : 'password'" 
            class="input-field pr-12 transition-all duration-300 hover:shadow-md hover:border-natillera-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-natillera-500/20"
            placeholder="••••••••"
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
        <!-- Enlace olvidé contraseña -->
        <div class="mt-2 text-right">
          <button
            type="button"
            @click="showForgotPasswordModal = true"
            class="text-sm text-natillera-600 hover:text-natillera-700 font-medium transition-colors underline-offset-2 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <!-- Mensaje de error con animación mejorado -->
      <Transition name="error-slide">
        <div v-if="errorMessage" class="relative overflow-hidden p-4 bg-gradient-to-br from-red-50 via-red-50/95 to-rose-50 border border-red-200/80 rounded-xl shadow-lg shadow-red-500/10 animate-fade-in-up">
          <!-- Efecto de fondo animado -->
          <div class="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 animate-shimmer"></div>
          
          <!-- Contenido -->
          <div class="relative flex items-start gap-3">
            <!-- Icono mejorado -->
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-md shadow-red-500/30">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            
            <!-- Mensaje -->
            <div class="flex-1 min-w-0">
              <p class="text-red-800 font-semibold text-sm mb-1">Error de autenticación</p>
              <p class="text-red-700 text-sm leading-relaxed">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Botón de envío mejorado -->
      <button 
        type="submit" 
        class="group relative w-full overflow-hidden bg-gradient-to-r from-natillera-500 via-natillera-600 to-emerald-600 text-white font-semibold rounded-xl py-4 shadow-lg shadow-natillera-500/30 hover:shadow-xl hover:shadow-natillera-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        :disabled="authStore.loading"
      >
        <!-- Efecto shimmer -->
        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <span v-if="authStore.loading" class="relative z-10 animate-spin">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span v-else class="relative z-10 flex items-center gap-2">
          <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          Ingresar
        </span>
      </button>
    </form>

    <!-- Separador -->
    <div class="relative my-6 animate-fade-in-up stagger-2">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white text-gray-500 font-medium">O continúa con</span>
      </div>
    </div>

    <!-- Botón de Google -->
    <button
      @click="handleGoogleLogin"
      :disabled="authStore.loading"
      class="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up stagger-2"
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

    <!-- Enlace de registro -->
    <div class="mt-8 text-center animate-fade-in-up stagger-3">
      <p class="text-sm text-gray-600">
        ¿No tienes cuenta? 
        <router-link 
          to="/auth/register" 
          class="relative inline-flex items-center gap-1 text-natillera-600 font-semibold hover:text-natillera-700 transition-colors group"
        >
          <span>Regístrate aquí</span>
          <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-natillera-600 group-hover:w-full transition-all duration-300"></span>
        </router-link>
      </p>
    </div>

    <!-- Modal de Olvidé mi contraseña -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showForgotPasswordModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeForgotPasswordModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-600 p-5 text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-lg">Recuperar Contraseña</h3>
                  <p class="text-sm text-white/90">Te enviaremos un enlace para restablecerla</p>
                </div>
              </div>
              <button
                @click="closeForgotPasswordModal"
                class="w-9 h-9 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-5 space-y-4">
            <!-- Vista de éxito -->
            <div v-if="forgotPasswordSuccess" class="text-center py-4">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 class="text-lg font-display font-bold text-gray-800 mb-2">
                ¡Email enviado!
              </h4>
              <p class="text-sm text-gray-600 mb-2">
                Hemos enviado un enlace de recuperación a <strong class="text-gray-800">{{ forgotPasswordEmail }}</strong>
              </p>
              <!-- Aviso de tiempo de espera -->
              <div class="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-xs text-amber-700 font-medium">
                  El correo puede demorar hasta 5 minutos en llegar
                </p>
              </div>
              <p class="text-xs text-gray-500">
                Revisa tu bandeja de entrada y carpeta de spam. Haz clic en el enlace para restablecer tu contraseña.
              </p>
              <button
                @click="closeForgotPasswordModal"
                class="mt-5 w-full px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Entendido
              </button>
            </div>

            <!-- Formulario -->
            <form v-else @submit.prevent="handleForgotPassword" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="forgotPasswordEmail"
                  type="email"
                  placeholder="tu@correo.com"
                  class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 outline-none text-sm transition-all"
                  :class="{
                    'border-red-300 focus:border-red-500 focus:ring-red-500': forgotPasswordError
                  }"
                  :disabled="authStore.loading"
                  required
                />
                <p v-if="forgotPasswordError" class="mt-1 text-xs text-red-600">{{ forgotPasswordError }}</p>
                <p v-else class="mt-1 text-xs text-gray-500">
                  Ingresa el correo electrónico asociado a tu cuenta
                </p>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="closeForgotPasswordModal"
                  :disabled="authStore.loading"
                  class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="authStore.loading || !forgotPasswordEmail.trim()"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white rounded-xl hover:from-natillera-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span v-else>Enviar enlace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@gmail.com')
const password = ref('admin')
const errorMessage = ref('')
const showPassword = ref(false)
const showForgotPasswordModal = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordError = ref('')
const forgotPasswordSuccess = ref(false)

function closeForgotPasswordModal() {
  showForgotPasswordModal.value = false
  forgotPasswordEmail.value = ''
  forgotPasswordError.value = ''
  forgotPasswordSuccess.value = false
}

async function handleForgotPassword() {
  forgotPasswordError.value = ''
  
  if (!forgotPasswordEmail.value.trim()) {
    forgotPasswordError.value = 'Por favor ingresa tu correo electrónico'
    return
  }

  const result = await authStore.resetPassword(forgotPasswordEmail.value.trim())
  
  if (result.success) {
    forgotPasswordSuccess.value = true
  } else {
    forgotPasswordError.value = result.error || 'Error al enviar el email de recuperación'
  }
}

async function handleLogin() {
  errorMessage.value = ''
  const result = await authStore.login(email.value, password.value)
  
  if (result.success) {
    router.push('/dashboard')
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

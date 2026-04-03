<template>
  <div class="login-root auth-nova">
    <!-- Main card -->
    <div class="login-card">
      <header class="text-center mb-6">
        <h2 class="text-2xl sm:text-[1.7rem] font-extrabold tracking-tight" style="color: hsl(var(--foreground))">
          Bienvenido de vuelta
        </h2>
        <p class="text-sm mt-1" style="color: hsl(var(--muted-foreground))">
          Ingresa tus credenciales para continuar
        </p>
      </header>

      <!-- Alert: phone already registered (show when switching from phone to email) -->
      <Transition name="error-slide">
        <div v-if="telefonoYaRegistrado && loginMethod === 'email'" class="nova-alert nova-alert--info mb-4">
          <p class="font-semibold mb-1">Cuenta ya registrada</p>
          <p class="text-sm opacity-95 mb-2">
            Este número ya está asociado a una cuenta. Inicia sesión con correo o Google.
          </p>
          <p v-if="emailTelefonoRegistrado" class="text-xs opacity-90">
            Email asociado: <strong>{{ enmascararEmail(emailTelefonoRegistrado) }}</strong>
          </p>
        </div>
      </Transition>

      <!-- Email login form -->
      <form v-if="loginMethod === 'email'" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <div class="login-input-wrapper">
            <input
              v-model="email"
              type="email"
              class="login-input"
              placeholder="Usuario"
              required
              autocomplete="email"
            />
          </div>
        </div>

        <div>
          <div class="login-input-wrapper login-input-wrapper--password">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="login-input login-input--password"
              placeholder="Contraseña"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="login-input-toggle"
              @click="showPassword = !showPassword"
              aria-label="Mostrar u ocultar contraseña"
            >
              <EyeIcon v-if="!showPassword" class="login-input-toggle__icon" />
              <EyeSlashIcon v-else class="login-input-toggle__icon" />
            </button>
          </div>
        </div>

        <!-- Remember me + Forgot password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="login-checkbox"
            />
            <span class="text-sm font-medium" style="color: hsl(var(--foreground))">Recordarme</span>
          </label>
          <button
            type="button"
            @click="showForgotPasswordModal = true"
            class="text-sm font-semibold bg-transparent border-0 cursor-pointer p-0 transition-opacity hover:opacity-80"
            style="color: hsl(var(--primary))"
          >
            Olvidaste tu contraseña?
          </button>
        </div>

        <!-- Error message -->
        <Transition name="error-slide">
          <div v-if="errorMessage" class="nova-alert nova-alert--error">
            <p class="font-semibold mb-0.5">Error de autenticación</p>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </Transition>

        <!-- Login button -->
        <button type="submit" class="login-btn-primary w-full" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="animate-spin inline-flex">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
          <span v-else class="inline-flex items-center gap-2 font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Iniciar sesión
          </span>
        </button>
      </form>

      <!-- Phone OTP form (hidden by default, toggleable) -->
      <div v-if="loginMethod === 'telefono'" class="space-y-4">
        <div v-if="otpStep === 'telefono'" class="space-y-4">
          <div>
            <label class="nova-label">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: hsl(var(--primary))">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Número de teléfono
            </label>
            <input v-model="telefono" type="tel" class="nova-input text-lg" placeholder="300 123 4567" required autocomplete="tel" />
            <p class="mt-1.5 text-xs" style="color: hsl(var(--muted-foreground))">
              Te enviaremos un código de verificación por SMS.
            </p>
          </div>
          <button
            type="button"
            @click="handleEnviarOTP"
            :disabled="authStore.loading || !telefono.trim()"
            class="login-btn-primary w-full"
          >
            <span v-if="authStore.loading" class="animate-spin inline-flex">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            <span v-else class="inline-flex items-center gap-2 font-bold">Enviar código</span>
          </button>
        </div>

        <div v-else-if="otpStep === 'codigo'" class="space-y-4">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground))">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-base font-bold" style="color: hsl(var(--foreground))">Código enviado</h3>
            <p class="text-sm" style="color: hsl(var(--muted-foreground))">
              Ingresa el código de 6 dígitos enviado a
              <span class="font-semibold block mt-0.5" style="color: hsl(var(--foreground))">{{ telefono }}</span>
            </p>
          </div>
          <div>
            <label class="nova-label">Código de verificación</label>
            <input
              v-model="codigoOTP"
              type="text"
              maxlength="6"
              class="nova-input text-center text-xl font-bold tracking-[0.35em] font-mono"
              placeholder="000000"
              required
              inputmode="numeric"
              autocomplete="one-time-code"
              @input="codigoOTP = codigoOTP.replace(/\D/g, '')"
            />
            <p class="mt-2 text-center">
              <button
                type="button"
                @click="handleReenviarOTP"
                :disabled="authStore.loading || contadorReenvio > 0"
                class="nova-link text-sm bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ contadorReenvio > 0 ? `Reenviar código en ${contadorReenvio}s` : 'Reenviar código' }}
              </button>
            </p>
          </div>
          <button
            type="button"
            @click="handleVerificarOTP"
            :disabled="authStore.loading || codigoOTP.length !== 6"
            class="login-btn-primary w-full"
          >
            <span v-if="authStore.loading" class="animate-spin inline-flex">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            <span v-else class="font-bold">Verificar código</span>
          </button>
          <button
            type="button"
            @click="otpStep = 'telefono'; codigoOTP = ''"
            class="w-full text-sm font-medium bg-transparent border-0 cursor-pointer p-0"
            style="color: hsl(var(--muted-foreground))"
          >
            ← Cambiar número de teléfono
          </button>
        </div>

        <Transition name="error-slide">
          <div v-if="errorMessageOTP && !telefonoYaRegistrado" class="nova-alert nova-alert--error">
            <p class="font-semibold mb-0.5">Error</p>
            <p class="text-sm">{{ errorMessageOTP }}</p>
          </div>
        </Transition>
      </div>

      <!-- Divider -->
      <div v-if="loginMethod === 'email'" class="login-divider">
        <div class="login-divider__line" />
        <span class="login-divider__text">O CONTINUAR CON</span>
        <div class="login-divider__line" />
      </div>

      <!-- Google button -->
      <button
        v-if="loginMethod === 'email'"
        type="button"
        @click="handleGoogleLogin"
        :disabled="authStore.loading"
        class="login-btn-google"
      >
        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span class="font-semibold">Continuar con Google</span>
      </button>

      <!-- Register link -->
      <div class="mt-6 text-center">
        <p class="text-sm" style="color: hsl(var(--muted-foreground))">
          No tienes cuenta?
          <router-link to="/auth/register" class="font-bold ml-1" style="color: hsl(var(--primary))">
            Regístrate gratis
          </router-link>
        </p>
      </div>
    </div>

    <!-- Dev mode info -->
    <div v-if="isDevMode" class="fixed top-2 left-2 z-50">
      <div class="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-white/10 font-mono">
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1">
          <span class="text-emerald-400">Resolución:</span>
          <span class="text-white">{{ screenInfo.resolution }}</span>
          <span class="hidden sm:inline text-gray-400">|</span>
          <span class="text-emerald-400">Navegador:</span>
          <span class="text-white">{{ screenInfo.browser }}</span>
        </div>
      </div>
    </div>

    <!-- Modal: Forgot password -->
    <ModalWrapper
      :show="showForgotPasswordModal"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="auth-nova nova-card-surface relative w-full max-w-md overflow-hidden shadow-2xl"
      card-max-width="28rem"
      @close="closeForgotPasswordModal"
    >
      <div class="auth-modal-header p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center border border-white/25 bg-white/15">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-lg leading-tight">Recuperar contraseña</h3>
              <p class="text-sm opacity-90 mt-0.5">Te enviaremos un enlace para restablecerla</p>
            </div>
          </div>
          <button
            type="button"
            @click="closeForgotPasswordModal"
            class="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
            aria-label="Cerrar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-5 space-y-4" style="color: hsl(var(--card-foreground))">
        <div v-if="forgotPasswordSuccess" class="text-center py-2 space-y-3">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground))"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 class="text-lg font-bold">¡Correo enviado!</h4>
          <p class="text-sm" style="color: hsl(var(--muted-foreground))">
            Enviamos un enlace a <strong style="color: hsl(var(--foreground))">{{ forgotPasswordEmail }}</strong>
          </p>
          <div class="nova-alert text-left" style="border-color: hsl(var(--accent) / 0.35); background: hsl(var(--accent) / 0.12)">
            <p class="text-xs font-medium" style="color: hsl(var(--foreground))">
              Puede tardar hasta 5 minutos. Revisa también spam.
            </p>
          </div>
          <button type="button" @click="closeForgotPasswordModal" class="login-btn-primary w-full mt-2">
            Entendido
          </button>
        </div>

        <form v-else @submit.prevent="handleForgotPassword" class="space-y-4">
          <div>
            <label class="nova-label">
              Correo electrónico
              <span style="color: hsl(var(--destructive))">*</span>
            </label>
            <input
              v-model="forgotPasswordEmail"
              type="email"
              placeholder="tu@correo.com"
              class="nova-input"
              :class="{ 'border-[hsl(var(--destructive)/0.45)]': forgotPasswordError }"
              :disabled="authStore.loading"
              required
              autocomplete="email"
            />
            <p v-if="forgotPasswordError" class="mt-1.5 text-xs" style="color: hsl(var(--destructive))">{{ forgotPasswordError }}</p>
            <p v-else class="mt-1.5 text-xs" style="color: hsl(var(--muted-foreground))">Correo asociado a tu cuenta</p>
          </div>

          <div class="flex gap-3 pt-1">
            <button
              type="button"
              @click="closeForgotPasswordModal"
              :disabled="authStore.loading"
              class="nova-btn-outline flex-1 !w-auto min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="authStore.loading || !forgotPasswordEmail.trim()"
              class="login-btn-primary flex-1 !w-auto min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <span v-if="authStore.loading" class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span v-else>Enviar enlace</span>
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>

    <!-- Modal: Registration required (blocking) -->
    <ModalWrapper
      :show="showRegistroModal"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="auth-nova nova-card-surface relative w-full max-w-md overflow-hidden shadow-2xl"
      card-max-width="28rem"
    >
      <div class="auth-modal-header p-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 shrink-0 rounded-full flex items-center justify-center border border-white/25 bg-white/15">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-lg leading-tight">Completa tu registro</h3>
            <p class="text-sm opacity-90 mt-0.5">Debes registrarte para continuar</p>
          </div>
        </div>
      </div>

      <div class="p-6 space-y-4" style="color: hsl(var(--card-foreground))">
        <div class="text-center space-y-2">
          <p class="text-sm" style="color: hsl(var(--muted-foreground))">
            Tu número fue verificado. Continúa con correo o Google.
          </p>
          <p class="text-xs" style="color: hsl(var(--muted-foreground))">
            Teléfono: <span class="font-semibold" style="color: hsl(var(--foreground))">{{ telefono }}</span>
          </p>
        </div>

        <div class="space-y-3">
          <router-link
            to="/auth/register"
            class="login-btn-primary w-full text-center no-underline"
            @click="showRegistroModal = false"
          >
            Registrarse con correo
          </router-link>

          <div class="relative my-1 flex items-center gap-3">
            <div class="flex-1 h-px bg-[hsl(var(--border))]" />
            <span class="text-xs font-semibold shrink-0" style="color: hsl(var(--muted-foreground))">O</span>
            <div class="flex-1 h-px bg-[hsl(var(--border))]" />
          </div>

          <button
            type="button"
            @click="handleGoogleLoginFromModal"
            :disabled="authStore.loading"
            class="login-btn-google"
          >
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Registrarse con Google
          </button>
        </div>
      </div>
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { isDev, isLocalhost } from '../../config/environment'
import ModalWrapper from '../../components/ModalWrapper.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { resolvePostLoginLocation } from '../../utils/postLoginRoute'

const router = useRouter()
const authStore = useAuthStore()

const isDevMode = isDev || isLocalhost

const screenInfo = ref({ resolution: '', browser: '' })

function detectarNavegador() {
  const userAgent = navigator.userAgent
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox'
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) return 'Chrome'
  if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) return 'Safari'
  if (userAgent.indexOf('Edg') > -1) return 'Edge'
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera'
  return 'Desconocido'
}

function actualizarInfoPantalla() {
  const resolution = `${window.innerWidth} x ${window.innerHeight}`
  const browser = detectarNavegador()
  if (isDevMode) {
    screenInfo.value = { resolution, browser }
  }
  console.log('%c📱 Información del Sistema', 'color: #22c55e; font-weight: bold; font-size: 14px;')
  console.log(`%cResolución: %c${resolution}`, 'color: #86efac; font-weight: bold;', 'color: #ffffff;')
  console.log(`%cNavegador: %c${browser}`, 'color: #86efac; font-weight: bold;', 'color: #ffffff;')
}

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && showRegistroModal.value) {
    if (authStore.userEmail && authStore.userEmail !== 'admin@gmail.com') {
      showRegistroModal.value = false
      setTimeout(async () => {
        const loc = await resolvePostLoginLocation(authStore.user)
        router.push(loc)
      }, 300)
    }
  }
})

const handleEsc = (e) => {
  if (e.key === 'Escape' && showRegistroModal.value) {
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))

// Email login state
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const REMEMBER_ME_PREF_KEY = 'natillerapp-login-remember'

onMounted(() => {
  try {
    const saved = localStorage.getItem(REMEMBER_ME_PREF_KEY)
    if (saved === '1') rememberMe.value = true
    else if (saved === '0') rememberMe.value = false
  } catch {
    /* ignore */
  }
  actualizarInfoPantalla()
  window.addEventListener('resize', actualizarInfoPantalla)
})

watch(rememberMe, (v) => {
  try {
    localStorage.setItem(REMEMBER_ME_PREF_KEY, v ? '1' : '0')
  } catch {
    /* ignore */
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', actualizarInfoPantalla)
})

const showForgotPasswordModal = ref(false)
const forgotPasswordEmail = ref('')
const forgotPasswordError = ref('')
const forgotPasswordSuccess = ref(false)

// Phone login state
const loginMethod = ref('email')
const telefono = ref('')
const codigoOTP = ref('')
const otpStep = ref('telefono')
const errorMessageOTP = ref('')
const nombreUsuario = ref('')
const contadorReenvio = ref(0)
const showRegistroModal = ref(false)
const telefonoYaRegistrado = ref(false)

useBodyScrollLock(showForgotPasswordModal)
useBodyScrollLock(showRegistroModal)
const emailTelefonoRegistrado = ref('')
let intervaloReenvio = null

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
  const result = await authStore.login(email.value, password.value, {
    rememberMe: rememberMe.value,
  })
  if (result.success) {
    const loc = await resolvePostLoginLocation(authStore.user)
    router.push(loc)
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

async function handleGoogleLoginFromModal() {
  showRegistroModal.value = false
  await handleGoogleLogin()
}

async function handleEnviarOTP() {
  errorMessageOTP.value = ''
  telefonoYaRegistrado.value = false
  emailTelefonoRegistrado.value = ''
  if (!telefono.value.trim()) {
    errorMessageOTP.value = 'Por favor ingresa tu número de teléfono'
    return
  }
  const result = await authStore.enviarOTPTelefono(telefono.value.trim())
  if (result.success) {
    otpStep.value = 'codigo'
    iniciarContadorReenvio()
  } else {
    if (result.error === 'YA_REGISTRADO') {
      telefonoYaRegistrado.value = true
      emailTelefonoRegistrado.value = result.email || ''
      errorMessageOTP.value = ''
      await nextTick()
      loginMethod.value = 'email'
      telefono.value = ''
      otpStep.value = 'telefono'
      email.value = ''
      password.value = ''
    } else {
      errorMessageOTP.value = result.error || 'Error al enviar el código OTP'
    }
  }
}

async function handleReenviarOTP() {
  if (contadorReenvio.value > 0) return
  errorMessageOTP.value = ''
  codigoOTP.value = ''
  const result = await authStore.enviarOTPTelefono(telefono.value.trim())
  if (result.success) {
    iniciarContadorReenvio()
  } else {
    errorMessageOTP.value = result.error || 'Error al reenviar el código OTP'
  }
}

async function handleVerificarOTP() {
  errorMessageOTP.value = ''
  if (!codigoOTP.value || codigoOTP.value.length !== 6) {
    errorMessageOTP.value = 'Por favor ingresa el código de 6 dígitos'
    return
  }
  const result = await authStore.verificarOTPTelefono(telefono.value.trim(), codigoOTP.value)
  if (result.success) {
    if (result.requiereRegistro) {
      showRegistroModal.value = true
    } else {
      const loc = await resolvePostLoginLocation(authStore.user)
      router.push(loc)
    }
  } else {
    errorMessageOTP.value = result.error || 'Código OTP inválido. Por favor verifica el código e inténtalo nuevamente.'
  }
}

async function handleCrearCuenta() {
  errorMessageOTP.value = ''
  if (!nombreUsuario.value.trim()) {
    errorMessageOTP.value = 'Por favor ingresa tu nombre completo'
    return
  }
  const result = await authStore.loginConTelefono(
    telefono.value.trim(),
    codigoOTP.value,
    nombreUsuario.value.trim()
  )
  if (result.success) {
    const loc = await resolvePostLoginLocation(authStore.user)
    router.push(loc)
  } else {
    errorMessageOTP.value = result.error || 'Error al crear la cuenta'
  }
}

function iniciarContadorReenvio() {
  contadorReenvio.value = 60
  if (intervaloReenvio) clearInterval(intervaloReenvio)
  intervaloReenvio = setInterval(() => {
    contadorReenvio.value--
    if (contadorReenvio.value <= 0) {
      clearInterval(intervaloReenvio)
      intervaloReenvio = null
    }
  }, 1000)
}

onUnmounted(() => {
  if (intervaloReenvio) clearInterval(intervaloReenvio)
})

function enmascararEmail(email) {
  if (!email || !email.includes('@')) return email
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) return `***@${domain}`
  if (localPart.length <= 4) return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`
  return `${localPart.substring(0, 3)}***${localPart.substring(localPart.length - 2)}@${domain}`
}

function resetearEstadoTelefono() {
  telefono.value = ''
  codigoOTP.value = ''
  otpStep.value = 'telefono'
  errorMessageOTP.value = ''
  nombreUsuario.value = ''
  contadorReenvio.value = 0
  telefonoYaRegistrado.value = false
  emailTelefonoRegistrado.value = ''
  if (intervaloReenvio) {
    clearInterval(intervaloReenvio)
    intervaloReenvio = null
  }
}
</script>

<style scoped>
@reference "../../style.css";

.login-root {
  width: 100%;
}

.login-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

@media (min-width: 1024px) {
  .login-card {
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }
}

/* Input fields — contenedor con borde; contraseña en fila (ojito siempre dentro) */
.login-input-wrapper {
  position: relative;
  display: block;
  min-height: 3.25rem;
  overflow: hidden;
  border: 1.5px solid hsl(var(--border));
  border-radius: 0.75rem;
  background: hsl(152 18% 99%);
  box-shadow: inset 0 1px 2px hsl(152 15% 20% / 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.login-input-wrapper:focus-within {
  border-color: hsl(var(--primary));
  background: #fff;
  box-shadow:
    inset 0 1px 2px hsl(152 15% 20% / 0.03),
    0 0 0 3px hsl(var(--primary) / 0.12);
}

/* Fila: input flexible + botón ojo (sin position absolute → no se cae debajo) */
.login-input-wrapper--password {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 0;
}

.login-input {
  width: 100%;
  min-height: 3.25rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 1rem;
  font-family: var(--font-sans);
  outline: none;
}

.login-input--password {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
  border-radius: 0.75rem 0 0 0.75rem;
  padding-right: 0.375rem;
}

.login-input-toggle {
  flex: 0 0 2.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0;
  padding: 0;
  border: none;
  border-left: 1px solid hsl(var(--border) / 0.65);
  background: hsl(152 12% 96% / 0.85);
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.login-input-toggle:hover {
  background: hsl(152 18% 92% / 0.95);
  color: hsl(var(--foreground));
}

.login-input-toggle:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: -2px;
}

.login-input-toggle__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.login-input-wrapper--password:focus-within .login-input-toggle {
  border-left-color: hsl(var(--primary) / 0.25);
}

.login-input::placeholder {
  color: hsl(var(--muted-foreground));
  font-weight: 400;
}

/* Checkbox */
.login-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 0.25rem;
  border: 1.5px solid hsl(var(--border));
  background: white;
  accent-color: hsl(var(--primary));
  cursor: pointer;
}

/* Primary button - green with rounded corners */
.login-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 52px;
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  border: none;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.9375rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 12px hsl(var(--primary) / 0.25);
}

.login-btn-primary:hover:not(:disabled) {
  filter: brightness(1.08);
  box-shadow: 0 4px 20px hsl(var(--primary) / 0.35);
}

.login-btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.login-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Google button — mismo “cuerpo” de botón que el principal (píldora + relieve) */
.login-btn-google {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  min-height: 52px;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 2px solid hsl(var(--border));
  background: #fff;
  color: hsl(var(--foreground));
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  box-shadow:
    0 1px 2px hsl(152 20% 20% / 0.06),
    0 2px 8px hsl(152 15% 10% / 0.08);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.login-btn-google:hover:not(:disabled) {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--muted));
  box-shadow:
    0 2px 4px hsl(152 20% 20% / 0.08),
    0 4px 14px hsl(152 69% 31% / 0.12);
}

.login-btn-google:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow:
    0 1px 2px hsl(152 20% 20% / 0.06),
    0 1px 4px hsl(152 15% 10% / 0.06);
}

.login-btn-google:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Divider */
.login-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.login-divider__line {
  flex: 1;
  height: 1px;
  background: hsl(var(--border));
}

.login-divider__text {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}
</style>

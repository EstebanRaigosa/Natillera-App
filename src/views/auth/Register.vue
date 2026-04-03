<template>
  <div class="auth-nova nova-card-surface relative p-5 sm:p-6 lg:p-8 sm:max-h-[90vh] overflow-y-auto">
    <div class="relative z-10">
      <header class="text-center mb-5 space-y-2">
        <h2 class="nova-section-title">Crear cuenta</h2>
        <span class="inline-flex items-center nova-badge-muted text-[10px] tracking-wide">Versión beta</span>
      </header>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="nova-label">Nombre completo</label>
          <input v-model="nombre" type="text" class="nova-input" placeholder="Tu nombre" required autocomplete="name" />
        </div>

        <div>
          <label class="nova-label">Correo electrónico</label>
          <input v-model="email" type="email" class="nova-input" placeholder="tu@correo.com" required autocomplete="email" />
        </div>

        <div>
          <label class="nova-label">Contraseña</label>
          <div class="nova-input-shell relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="flex-1 min-w-0 border-0 bg-transparent px-3 py-3 pr-12 text-base focus:ring-0 focus:outline-none"
              style="color: hsl(var(--foreground))"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center z-10 transition-colors"
              style="color: hsl(var(--muted-foreground))"
              aria-label="Mostrar u ocultar contraseña"
            >
              <EyeIcon v-if="!showPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label class="nova-label">Confirmar contraseña</label>
          <div class="nova-input-shell relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="flex-1 min-w-0 border-0 bg-transparent px-3 py-3 pr-12 text-base focus:ring-0 focus:outline-none"
              style="color: hsl(var(--foreground))"
              placeholder="Repite tu contraseña"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute inset-y-0 right-0 flex w-12 items-center justify-center z-10 transition-colors"
              style="color: hsl(var(--muted-foreground))"
              aria-label="Mostrar u ocultar contraseña"
            >
              <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
              <EyeSlashIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="nova-alert nova-alert--error">
          <p class="text-sm font-medium">{{ errorMessage }}</p>
        </div>

        <div v-if="successMessage" class="space-y-3 rounded-[var(--radius)] border border-[hsl(var(--border))] p-4" style="background: hsl(var(--muted) / 0.35)">
          <div class="flex items-start gap-3">
            <div
              class="w-12 h-12 shrink-0 rounded-full flex items-center justify-center"
              style="background: hsl(var(--primary)); color: hsl(var(--primary-foreground))"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="min-w-0 space-y-2">
              <h4 class="font-bold text-base" style="color: hsl(var(--foreground))">¡Cuenta creada!</h4>
              <p class="text-sm" style="color: hsl(var(--muted-foreground))">
                Enviamos un enlace de confirmación a <strong style="color: hsl(var(--foreground))">{{ emailRegistrado }}</strong>
              </p>
              <div class="nova-alert text-left" style="border-color: hsl(var(--accent) / 0.35); background: hsl(var(--accent) / 0.12)">
                <p class="text-xs font-medium" style="color: hsl(var(--foreground))">
                  El correo puede tardar hasta 5 minutos. Revisa spam.
                </p>
              </div>
              <p class="text-xs" style="color: hsl(var(--muted-foreground))">
                Cuando confirmes el correo podrás iniciar sesión.
              </p>
            </div>
          </div>
        </div>

        <button
          v-if="!successMessage"
          type="submit"
          class="nova-btn-primary w-full"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="inline-flex items-center gap-2">
            <span class="animate-spin inline-flex">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </span>
            Creando cuenta...
          </span>
          <span v-else>Crear cuenta</span>
        </button>

        <router-link
          v-if="successMessage"
          to="/auth/login"
          class="nova-btn-primary w-full text-center no-underline inline-flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Ir a iniciar sesión
        </router-link>
      </form>

      <template v-if="!successMessage">
        <div class="relative my-4 flex items-center gap-3">
          <div class="flex-1 h-px bg-[hsl(var(--border))]" />
          <span class="text-xs font-semibold shrink-0" style="color: hsl(var(--muted-foreground))">O regístrate con</span>
          <div class="flex-1 h-px bg-[hsl(var(--border))]" />
        </div>

        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="authStore.loading"
          class="nova-btn-outline disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>
      </template>

      <p v-if="!successMessage" class="mt-5 text-center text-sm" style="color: hsl(var(--muted-foreground))">
        ¿Ya tienes cuenta?
        <router-link to="/auth/login" class="nova-link ml-1">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

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

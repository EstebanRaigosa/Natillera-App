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

      <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
        {{ successMessage }}
      </div>

      <button 
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
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
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
    successMessage.value = '¡Cuenta creada! Revisa tu correo para confirmar.'
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } else {
    errorMessage.value = result.error
  }
}
</script>


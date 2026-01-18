<template>
  <div>
    <!-- Loading mientras verifica autenticación -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-white drop-shadow-lg">{{ loadingMessage }}</p>
    </div>

    <!-- Vista de error de OAuth (cancelación o error) -->
    <template v-else-if="oauthError">
      <div class="flex flex-col items-center gap-6 mb-8">
        <!-- Icono de error -->
        <div class="relative">
          <div class="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 animate-ping"></div>
          <div class="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <!-- Título -->
        <div class="text-center">
          <h2 class="text-3xl font-display font-bold text-white mb-2 drop-shadow-lg">
            {{ oauthErrorTitle }}
          </h2>
          <p class="text-lg text-white/90 drop-shadow-md">
            {{ oauthErrorMessage }}
          </p>
        </div>
      </div>

      <!-- Mensaje informativo -->
      <div class="bg-white/95 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-white/50 shadow-xl">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 mb-2">¿Qué pasó?</h3>
            <p class="text-sm text-gray-700 leading-relaxed">
              {{ oauthErrorDescription }}
            </p>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="space-y-3">
        <button 
          @click="goToLogin"
          class="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          <span>Volver al inicio de sesión</span>
        </button>
        
        <button 
          @click="retryGoogleLogin"
          :disabled="authStore.loading"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/80 rounded-xl font-semibold text-gray-800 hover:bg-white hover:border-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Intentar con Google nuevamente</span>
        </button>
      </div>
    </template>

    <!-- Contenido de bienvenida normal (confirmación de email) -->
    <template v-else>
      <div class="flex flex-col items-center gap-6 mb-8">
        <!-- Icono de éxito animado -->
        <div class="relative">
          <div class="absolute inset-0 bg-natillera-400 rounded-full blur-xl opacity-50 animate-ping"></div>
          <div class="relative w-24 h-24 bg-gradient-to-br from-natillera-500 to-natillera-600 rounded-full flex items-center justify-center shadow-xl shadow-natillera-500/30">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Título -->
        <div class="text-center">
          <h2 class="text-3xl font-display font-bold text-white mb-2 drop-shadow-lg">
            ¡Cuenta confirmada!
          </h2>
          <p class="text-lg text-white/90 drop-shadow-md">
            Tu correo electrónico ha sido verificado exitosamente
          </p>
        </div>
      </div>

      <!-- Mensaje de bienvenida -->
      <div class="bg-white/95 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-white/50 shadow-xl">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-natillera-500 rounded-full flex items-center justify-center">
              <span class="text-2xl">🌱</span>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 mb-2">¡Bienvenido a <AppBrand />!</h3>
            <p class="text-sm text-gray-700 leading-relaxed">
              Ya estás listo para comenzar a gestionar tus natilleras comunitarias. 
              Podrás crear grupos de ahorro, registrar socios, controlar cuotas y mucho más.
            </p>
          </div>
        </div>
      </div>

      <!-- Características destacadas -->
      <div class="space-y-3 mb-8">
        <div class="flex items-center gap-3 text-sm text-white drop-shadow-md">
          <div class="flex-shrink-0 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>Gestiona múltiples natilleras desde un solo lugar</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-white drop-shadow-md">
          <div class="flex-shrink-0 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>Controla cuotas personalizadas por socio</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-white drop-shadow-md">
          <div class="flex-shrink-0 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>Administra préstamos y actividades</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-white drop-shadow-md">
          <div class="flex-shrink-0 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>Todo de forma gratuita y transparente</span>
        </div>
      </div>

      <!-- Botón de acción principal -->
      <button 
        @click="goToLogin"
        class="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
      >
        <span>Continuar al inicio de sesión</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      <!-- Información adicional -->
      <p class="mt-6 text-center text-xs text-white/80 drop-shadow-md">
        ¿Ya tienes una cuenta? 
        <router-link to="/auth/login" class="text-white font-semibold hover:text-white/90 underline underline-offset-2">
          Inicia sesión aquí
        </router-link>
      </p>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../lib/supabase'
import { devLog } from '../../config/environment'
import AppBrand from '../../components/AppBrand.vue'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)
const loadingMessage = ref('Verificando sesión...')
const oauthError = ref(null)
const oauthErrorTitle = ref('')
const oauthErrorMessage = ref('')
const oauthErrorDescription = ref('')

// Función para detectar si viene de OAuth (puede venir con o sin error)
function detectOAuthError() {
  // Verificar parámetros tanto en hash como en query params
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const queryParams = new URLSearchParams(window.location.search.substring(1))
  
  // Buscar error en hash o query params (Supabase OAuth puede pasar errores así)
  const error = hashParams.get('error') || queryParams.get('error')
  const errorDescription = hashParams.get('error_description') || queryParams.get('error_description')
  
  devLog('Welcome: Verificando parámetros OAuth...')
  devLog('Welcome: Error encontrado:', error)
  devLog('Welcome: Error description:', errorDescription)
  devLog('Welcome: Hash:', window.location.hash)
  devLog('Welcome: Search:', window.location.search)
  
  if (error) {
    // Traducir errores comunes de OAuth
    const errorMap = {
      'access_denied': {
        title: 'Inicio de sesión cancelado',
        message: 'Has cancelado el inicio de sesión con Google',
        description: 'No te preocupes, puedes intentar iniciar sesión nuevamente cuando lo desees. Si cambias de opinión, solo haz clic en el botón "Intentar con Google nuevamente".'
      },
      'oauth_error': {
        title: 'Error de autenticación',
        message: 'Ocurrió un problema al iniciar sesión con Google',
        description: 'Puede ser un problema temporal. Por favor, intenta nuevamente o usa otro método de inicio de sesión.'
      }
    }
    
    const errorInfo = errorMap[error] || {
      title: 'Error de autenticación',
      message: errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 'Ocurrió un problema al iniciar sesión',
      description: 'Por favor, intenta nuevamente o usa otro método de inicio de sesión.'
    }
    
    return {
      error: true,
      title: errorInfo.title,
      message: errorInfo.message,
      description: errorInfo.description
    }
  }
  
  return null
}

async function retryGoogleLogin() {
  const result = await authStore.loginWithGoogle()
  if (!result.success) {
    // Si falla inmediatamente (antes de redirigir), mostrar error
    oauthError.value = {
      error: true,
      title: 'Error al iniciar sesión',
      message: result.error || 'No se pudo iniciar el proceso de autenticación',
      description: 'Por favor, verifica tu conexión a internet e intenta nuevamente.'
    }
    isLoading.value = false
  }
}

onMounted(async () => {
  // Primero verificar si hay errores de OAuth en la URL
  const detectedError = detectOAuthError()
  
  if (detectedError) {
    oauthError.value = detectedError
    oauthErrorTitle.value = detectedError.title
    oauthErrorMessage.value = detectedError.message
    oauthErrorDescription.value = detectedError.description
    isLoading.value = false
    
    // Limpiar los parámetros de la URL para evitar mostrar el error nuevamente
    window.history.replaceState({}, document.title, window.location.pathname)
    return
  }
  
  // Si no hay error explícito, verificar la sesión
  loadingMessage.value = 'Verificando autenticación...'
  
  // Esperar un poco para que Supabase procese cualquier token de OAuth
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Verificar sesión múltiples veces (puede tomar tiempo en procesar OAuth)
  let attempts = 0
  const maxAttempts = 5 // 5 intentos x 1 segundo = 5 segundos máximo
  
  const checkSession = setInterval(async () => {
    attempts++
    await authStore.checkAuth()
    
    if (authStore.isAuthenticated) {
      clearInterval(checkSession)
      
      // Verificar si hay un teléfono pendiente de registro
      const telefonoPendiente = localStorage.getItem('telefono_pendiente_registro')
      if (telefonoPendiente && authStore.userEmail) {
        // PRIMERO: Actualizar el perfil de usuario con el teléfono
        const resultPerfil = await authStore.actualizarPerfilUsuarioConTelefono(telefonoPendiente)
        
        if (resultPerfil.success) {
          console.log('Perfil de usuario actualizado con teléfono')
        } else {
          console.error('Error actualizando perfil de usuario:', resultPerfil.error)
        }
        
        // SEGUNDO: Actualizar socios con el email del usuario registrado
        const resultSocios = await authStore.actualizarSociosConEmail(telefonoPendiente, authStore.userEmail)
        
        if (resultSocios.success) {
          console.log(`Socios actualizados: ${resultSocios.sociosActualizados}`)
        } else {
          console.error('Error actualizando socios:', resultSocios.error)
        }
        
        // Limpiar el teléfono pendiente
        localStorage.removeItem('telefono_pendiente_registro')
      }
      
      // Usuario autenticado exitosamente, redirigir al Dashboard
      router.replace('/dashboard')
      return
    }
    
    // Si pasaron 5 segundos y no hay sesión, asumir que fue cancelado o hubo timeout
    if (attempts >= maxAttempts) {
      clearInterval(checkSession)
      
      // Verificar una última vez
      await authStore.checkAuth()
      
      if (!authStore.isAuthenticated) {
        // No hay sesión y pasó el tiempo, probablemente fue cancelado o timeout
        // Solo mostrar error si NO viene de confirmación de email (que sería un flujo normal)
        // Para distinguir, verificamos si hay parámetros de tipo "email confirmation"
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search.substring(1))
        const type = hashParams.get('type') || queryParams.get('type')
        
        // Si viene de confirmación de email, mostrar vista normal
        if (type === 'signup' || type === 'email') {
          isLoading.value = false
          return
        }
        
        // Si no, probablemente fue OAuth cancelado o timeout
        oauthError.value = {
          error: true,
          title: 'Tiempo de espera agotado',
          message: 'El inicio de sesión con Google tardó demasiado',
          description: 'Esto puede ocurrir si cancelaste el proceso o si hubo un problema de conexión. Por favor, intenta nuevamente.'
        }
        oauthErrorTitle.value = oauthError.value.title
        oauthErrorMessage.value = oauthError.value.message
        oauthErrorDescription.value = oauthError.value.description
      }
      
      isLoading.value = false
    }
  }, 1000) // Verificar cada segundo
})

function goToLogin() {
  // Limpiar cualquier parámetro de error de la URL
  router.replace('/auth/login')
}
</script>

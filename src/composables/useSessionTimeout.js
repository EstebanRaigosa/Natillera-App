import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from './useAuditoria'

/**
 * Composable para manejar el timeout de sesión por inactividad
 * @param {number} timeoutMinutes - Minutos de inactividad antes de cerrar sesión (default: 10)
 */
export function useSessionTimeout(timeoutMinutes = 10) {
  const router = useRouter()
  const authStore = useAuthStore()
  const timeoutId = ref(null)
  const warningShown = ref(false)
  const listenersActive = ref(false)
  
  // Convertir minutos a milisegundos
  const timeoutMs = timeoutMinutes * 60 * 1000
  
  /**
   * Reinicia el timer de inactividad
   */
  function resetTimer() {
    // Limpiar timer anterior
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
    
    warningShown.value = false
    
    // Solo establecer el timer si el usuario está autenticado
    if (authStore.isAuthenticated) {
      timeoutId.value = setTimeout(() => {
        handleTimeout()
      }, timeoutMs)
    }
  }
  
  /**
   * Maneja el timeout cuando se completa el período de inactividad
   */
  async function handleTimeout() {
    // Verificar nuevamente si está autenticado antes de cerrar
    if (authStore.isAuthenticated) {
      // NO registrar auditoría aquí porque logout() ya lo hace
      // Además, si lo hacemos aquí con registrarAuditoriaEnSegundoPlano,
      // puede ejecutarse después de que auth.uid() sea NULL
      
      // Cerrar sesión (logout() ya registra la auditoría antes de cerrar)
      await authStore.logout()
      
      // Recargar la página para garantizar que se cierre todo lo que el usuario tenía abierto
      window.location.reload()
    }
  }
  
  /**
   * Maneja los eventos de actividad del usuario
   */
  function handleActivity() {
    // Solo resetear si el usuario está autenticado
    if (authStore.isAuthenticated) {
      resetTimer()
    }
  }
  
  /**
   * Maneja el cambio de visibilidad de la página
   */
  function handleVisibilityChange() {
    if (!document.hidden && authStore.isAuthenticated) {
      resetTimer()
    }
  }
  
  /**
   * Inicializa los listeners de eventos
   */
  function setupEventListeners() {
    // Evitar agregar listeners duplicados
    if (listenersActive.value) {
      return
    }
    
    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })
    
    // También detectar cuando la ventana recupera el foco
    window.addEventListener('focus', handleActivity)
    
    // Detectar cambios de visibilidad de la página
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    listenersActive.value = true
  }
  
  /**
   * Limpia los listeners de eventos
   */
  function cleanupEventListeners() {
    if (!listenersActive.value) {
      return
    }
    
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]
    
    events.forEach(event => {
      document.removeEventListener(event, handleActivity)
    })
    
    window.removeEventListener('focus', handleActivity)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    
    listenersActive.value = false
  }
  
  /**
   * Inicializa el sistema de timeout
   */
  function start() {
    if (authStore.isAuthenticated) {
      resetTimer()
      setupEventListeners()
    }
  }
  
  /**
   * Detiene el sistema de timeout
   */
  function stop() {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
    cleanupEventListeners()
  }
  
  // Escuchar cambios de autenticación para iniciar/detener el timer
  function onAuthStateChange() {
    if (authStore.isAuthenticated) {
      start()
    } else {
      stop()
    }
  }
  
  return {
    start,
    stop,
    resetTimer,
    onAuthStateChange
  }
}


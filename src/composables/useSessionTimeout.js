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
      // Registrar en auditoría que la sesión expiró por inactividad
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrar({
          tipoAccion: 'REGISTER',
          entidad: 'configuracion',
          descripcion: `Usuario ${authStore.userEmail} cerró sesión por inactividad (${timeoutMinutes} minutos)`,
          detalles: {
            metodo: 'session_timeout',
            timeout_minutes: timeoutMinutes,
            user_agent: navigator.userAgent
          }
        })
      )
      
      // Cerrar sesión
      await authStore.logout()
      
      // Redirigir al login
      router.push({ name: 'Login' })
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


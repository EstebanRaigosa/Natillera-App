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
  const backgroundTimeoutId = ref(null) // Timer para cuando la página está en background
  const warningShown = ref(false)
  const listenersActive = ref(false)
  
  // Clave para guardar el timestamp de cuando la página pasó a background
  const BACKGROUND_TIMESTAMP_KEY = 'natillera_background_timestamp'
  
  // Convertir minutos a milisegundos
  const timeoutMs = timeoutMinutes * 60 * 1000
  // 5 minutos en milisegundos para el timeout de background
  const backgroundTimeoutMs = 5 * 60 * 1000
  
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
   * Verifica si pasaron más de 5 minutos desde que la página pasó a background
   */
  function checkBackgroundTimeout() {
    try {
      const storedTimestamp = localStorage.getItem(BACKGROUND_TIMESTAMP_KEY)
      if (!storedTimestamp) {
        return false
      }

      const backgroundTime = parseInt(storedTimestamp, 10)
      const now = Date.now()
      const timeElapsed = now - backgroundTime

      // Si pasaron más de 5 minutos, cerrar sesión
      return timeElapsed >= backgroundTimeoutMs
    } catch (error) {
      console.error('Error verificando timeout de background:', error)
      return false
    }
  }

  /**
   * Maneja el cierre de sesión cuando la página está en background por mucho tiempo
   */
  async function handleBackgroundTimeout() {
    // Verificar nuevamente si está autenticado antes de cerrar
    if (authStore.isAuthenticated) {
      // Limpiar el timestamp guardado
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      
      // Cerrar sesión (logout() ya registra la auditoría antes de cerrar)
      await authStore.logout()
      
      // Recargar la página para garantizar que se cierre todo lo que el usuario tenía abierto
      window.location.reload()
    }
  }

  /**
   * Marca que la página pasó a background
   */
  function markAsBackground() {
    if (!authStore.isAuthenticated) {
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      return
    }

    // Guardar timestamp actual
    const now = Date.now()
    localStorage.setItem(BACKGROUND_TIMESTAMP_KEY, now.toString())
    
    // También iniciar timer como respaldo (por si el navegador no se suspende)
    if (backgroundTimeoutId.value) {
      clearTimeout(backgroundTimeoutId.value)
      backgroundTimeoutId.value = null
    }
    
    backgroundTimeoutId.value = setTimeout(() => {
      handleBackgroundTimeout()
    }, backgroundTimeoutMs)
  }

  /**
   * Verifica y maneja cuando la página vuelve a ser visible
   */
  function handleReturnToForeground() {
    if (!authStore.isAuthenticated) {
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      return
    }

    // Verificar cuánto tiempo pasó
    const shouldLogout = checkBackgroundTimeout()
    
    // Limpiar el timestamp guardado
    localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
    
    // Cancelar el timer de background
    if (backgroundTimeoutId.value) {
      clearTimeout(backgroundTimeoutId.value)
      backgroundTimeoutId.value = null
    }
    
    // Si pasaron más de 5 minutos, cerrar sesión
    if (shouldLogout) {
      handleBackgroundTimeout()
      return
    }
    
    // Reiniciar el timer normal de inactividad
    resetTimer()
  }

  /**
   * Maneja el cambio de visibilidad de la página
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      markAsBackground()
    } else {
      handleReturnToForeground()
    }
  }

  /**
   * Maneja cuando la ventana pierde el foco (evento blur)
   */
  function handleWindowBlur() {
    markAsBackground()
  }

  /**
   * Maneja cuando la ventana recupera el foco (evento focus)
   */
  function handleWindowFocus() {
    handleReturnToForeground()
  }

  /**
   * Maneja cuando la página se oculta (evento pagehide)
   */
  function handlePageHide(event) {
    // Si la página se está descargando (navegando a otra página), no hacer nada
    // Solo marcar como background si es persistente
    if (event.persisted) {
      markAsBackground()
    }
  }

  /**
   * Maneja cuando la página se muestra (evento pageshow)
   */
  function handlePageShow(event) {
    // Si la página se cargó desde cache, verificar timeout
    if (event.persisted) {
      handleReturnToForeground()
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
    
    // Detectar cambios de visibilidad de la página (principal - funciona mejor en móviles)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Detectar cuando la ventana pierde/recupera el foco (respaldo - funciona mejor en desktop)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    
    // También detectar cuando la ventana recupera el foco para resetear timer de actividad
    window.addEventListener('focus', handleActivity)
    
    // Detectar cuando la página se oculta/muestra (respaldo adicional)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)
    
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
    window.removeEventListener('blur', handleWindowBlur)
    window.removeEventListener('focus', handleWindowFocus)
    window.removeEventListener('pagehide', handlePageHide)
    window.removeEventListener('pageshow', handlePageShow)
    
    listenersActive.value = false
  }
  
  /**
   * Verifica al iniciar si la sesión debe cerrarse por estar en background
   */
  function checkOnStart() {
    if (!authStore.isAuthenticated) {
      // Limpiar timestamp si no está autenticado
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      return
    }

    // Verificar si hay un timestamp guardado y si pasaron más de 5 minutos
    if (checkBackgroundTimeout()) {
      handleBackgroundTimeout()
    } else {
      // Limpiar el timestamp si aún no pasaron 5 minutos
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
    }
  }

  /**
   * Inicializa el sistema de timeout
   */
  function start() {
    if (authStore.isAuthenticated) {
      // Primero verificar si debe cerrarse por timeout de background
      checkOnStart()
      
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
    if (backgroundTimeoutId.value) {
      clearTimeout(backgroundTimeoutId.value)
      backgroundTimeoutId.value = null
    }
    // Limpiar timestamp al detener
    localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
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


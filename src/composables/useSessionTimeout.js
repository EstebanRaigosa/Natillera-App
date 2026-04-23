import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

/**
 * Composable para manejar el timeout de sesión por inactividad
 * @param {number} timeoutMinutes - Minutos de inactividad antes de cerrar sesión (default: 15)
 */
export function useSessionTimeout(timeoutMinutes = 15) {
  const authStore = useAuthStore()
  const timeoutId = ref(null)
  const backgroundTimeoutId = ref(null)
  const listenersActive = ref(false)
  
  const BACKGROUND_TIMESTAMP_KEY = 'natillera_background_timestamp'
  
  const timeoutMs = timeoutMinutes * 60 * 1000
  // 10 minutos para el timeout de background
  const backgroundTimeoutMs = 10 * 60 * 1000

  // Throttle: intervalo mínimo entre resets del timer (evita llamadas excesivas por mousemove, etc.)
  let lastActivityTime = 0
  const ACTIVITY_THROTTLE_MS = 30 * 1000 // 30 segundos

  // Validación periódica del token contra el servidor
  let lastSessionCheck = Date.now()
  const SESSION_CHECK_INTERVAL_MS = 4 * 60 * 1000 // cada 4 minutos de actividad

  /** Errores de Supabase que indican sesión realmente inválida (no fallo de red al reanudar) */
  function isDefinitiveAuthFailure(error) {
    if (!error) return false
    const code = String(error.code || '')
    const msg = String(error.message || error).toLowerCase()
    if (code === 'session_not_found' || code === 'refresh_token_not_found') return true
    if (msg.includes('invalid jwt') || msg.includes('jwt expired')) return true
    if (msg.includes('session') && (msg.includes('missing') || msg.includes('not found'))) return true
    return false
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  
  /**
   * Reinicia el timer de inactividad
   */
  function resetTimer() {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
    
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
    if (authStore.isAuthenticated) {
      await authStore.logout()
      window.location.reload()
    }
  }

  /**
   * Valida la sesión contra el servidor. En móvil, al volver de otra app la red
   * suele fallar transitoriamente: reintentamos y solo cerramos sesión ante fallo
   * de autenticación claro, no ante errores de red.
   */
  async function validateSession() {
    if (!authStore.isAuthenticated) return

    const delays = [0, 400, 1200]
    let lastError = null

    for (let i = 0; i < delays.length; i++) {
      if (delays[i] > 0) await sleep(delays[i])

      try {
        const { data, error } = await supabase.auth.getUser()
        lastError = error

        if (!error && data?.user) return

        if (error && isDefinitiveAuthFailure(error)) {
          await authStore.logout()
          window.location.reload()
          return
        }

        // Sin usuario pero sin error explícito (raro): no forzar logout en primer intento
        if (!data?.user && !error) continue
      } catch (e) {
        lastError = e
      }
    }

    // Tras reintentos: solo cerrar si el último error sigue siendo fallo de auth
    if (lastError && isDefinitiveAuthFailure(lastError)) {
      await authStore.logout()
      window.location.reload()
    }
    // Red / timeout: no cerrar; Supabase autoRefresh y próxima validación lo resolverán
  }
  
  /**
   * Maneja los eventos de actividad del usuario (throttled)
   */
  function handleActivity() {
    if (!authStore.isAuthenticated) return

    const now = Date.now()

    if (now - lastActivityTime < ACTIVITY_THROTTLE_MS) return
    lastActivityTime = now
    
    resetTimer()

    // Cada SESSION_CHECK_INTERVAL_MS de uso activo, validar el token con el servidor
    if (now - lastSessionCheck >= SESSION_CHECK_INTERVAL_MS) {
      lastSessionCheck = now
      validateSession()
    }
  }
  
  /**
   * Verifica si pasaron más de 10 minutos desde que la página pasó a background
   */
  function checkBackgroundTimeout() {
    try {
      const storedTimestamp = localStorage.getItem(BACKGROUND_TIMESTAMP_KEY)
      if (!storedTimestamp) return false

      const backgroundTime = parseInt(storedTimestamp, 10)
      const now = Date.now()
      return (now - backgroundTime) >= backgroundTimeoutMs
    } catch {
      return false
    }
  }

  /**
   * Maneja el cierre de sesión cuando la página está en background por mucho tiempo
   */
  async function handleBackgroundTimeout() {
    if (authStore.isAuthenticated) {
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      await authStore.logout()
      window.location.reload()
    }
  }

  /**
   * Marca que la página pasó a background (solo visibilitychange)
   */
  function markAsBackground() {
    if (!authStore.isAuthenticated) {
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      return
    }

    localStorage.setItem(BACKGROUND_TIMESTAMP_KEY, Date.now().toString())
    
    if (backgroundTimeoutId.value) {
      clearTimeout(backgroundTimeoutId.value)
      backgroundTimeoutId.value = null
    }
    
    // Timer de respaldo por si el navegador no suspende JS en background
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

    const shouldLogout = checkBackgroundTimeout()
    
    localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
    
    if (backgroundTimeoutId.value) {
      clearTimeout(backgroundTimeoutId.value)
      backgroundTimeoutId.value = null
    }
    
    if (shouldLogout) {
      handleBackgroundTimeout()
      return
    }

    // No llamar getUser() aquí: en móvil al volver de otra app la red aún no está
    // lista y un falso negativo provocaba logout + reload constante.
    // La sesión se valida en uso activo (intervalo) y Supabase refresca el token solo.

    resetTimer()
  }

  /**
   * visibilitychange — principal para mobile y desktop
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      markAsBackground()
    } else {
      handleReturnToForeground()
    }
  }

  /**
   * pagehide — solo para BFCache (event.persisted)
   */
  function handlePageHide(event) {
    if (event.persisted) {
      markAsBackground()
    }
  }

  /**
   * pageshow — solo para BFCache (event.persisted)
   */
  function handlePageShow(event) {
    if (event.persisted) {
      handleReturnToForeground()
    }
  }
  
  /**
   * Inicializa los listeners de eventos
   */
  function setupEventListeners() {
    if (listenersActive.value) return
    
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ]
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })
    
    // visibilitychange — funciona en mobile y desktop para detectar
    // cambio de pestaña, minimizar ventana, bloqueo de pantalla, cambio de app
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // focus solo como indicador de actividad (NO dispara background timeout)
    window.addEventListener('focus', handleActivity)
    
    // BFCache
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)
    
    listenersActive.value = true
  }
  
  /**
   * Limpia los listeners de eventos
   */
  function cleanupEventListeners() {
    if (!listenersActive.value) return
    
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ]
    
    events.forEach(event => {
      document.removeEventListener(event, handleActivity)
    })
    
    window.removeEventListener('focus', handleActivity)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('pagehide', handlePageHide)
    window.removeEventListener('pageshow', handlePageShow)
    
    listenersActive.value = false
  }
  
  /**
   * Verifica al iniciar si la sesión debe cerrarse por estar en background
   */
  function checkOnStart() {
    if (!authStore.isAuthenticated) {
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
      return
    }

    if (checkBackgroundTimeout()) {
      handleBackgroundTimeout()
    } else {
      localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
    }
  }

  /**
   * Inicializa el sistema de timeout
   */
  function start() {
    if (authStore.isAuthenticated) {
      checkOnStart()
      lastActivityTime = Date.now()
      lastSessionCheck = Date.now()
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
    localStorage.removeItem(BACKGROUND_TIMESTAMP_KEY)
    cleanupEventListeners()
  }
  
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

import { ref, computed } from 'vue'
import { detectIosPlatform } from './useIsIos'

/**
 * Instalación de la PWA (Añadir a pantalla de inicio).
 *
 * El evento `beforeinstallprompt` lo dispara el navegador (Chrome/Edge/Android)
 * una sola vez y muy temprano, antes de que monte cualquier componente. Por eso
 * el estado vive en scope de módulo y se inicializa desde `main.js` con
 * `setupPwaInstall()`, para no perder el evento.
 *
 * iOS/Safari NO soporta `beforeinstallprompt`: la instalación es manual
 * (Compartir → Añadir a pantalla de inicio). En ese caso ofrecemos instrucciones.
 */

// Evento diferido de instalación nativa (Android/Chrome/Edge). null si no disponible.
const deferredPrompt = ref(null)
// La app ya corre como PWA instalada (display-mode: standalone / navigator.standalone).
const isInstalled = ref(false)
let inicializado = false

const esIOS = detectIosPlatform()

/** ¿Standalone? (lanzada desde el icono de inicio, no desde el navegador) */
function esModoStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
    // iOS Safari expone navigator.standalone
    window.navigator?.standalone === true
  )
}

/**
 * En iOS todos los navegadores usan WebKit, pero «Añadir a pantalla de inicio»
 * solo está disponible desde Safari (no Chrome/Firefox/Edge iOS).
 */
function esSafariEnIOS() {
  if (!esIOS || typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua)
}

/** Registrar los listeners globales una sola vez. Llamar desde main.js. */
export function setupPwaInstall() {
  if (inicializado || typeof window === 'undefined') return
  inicializado = true

  isInstalled.value = esModoStandalone()

  window.addEventListener('beforeinstallprompt', (e) => {
    // Evita el mini-infobar por defecto: mostramos nuestro botón.
    e.preventDefault()
    deferredPrompt.value = e
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    isInstalled.value = true
  })

  window
    .matchMedia?.('(display-mode: standalone)')
    ?.addEventListener?.('change', (e) => {
      isInstalled.value = e.matches
    })
}

export function usePwaInstall() {
  // iOS Safari sin prompt nativo: instalación manual con instrucciones.
  const requiereInstruccionesIOS = computed(
    () => !isInstalled.value && !deferredPrompt.value && esSafariEnIOS()
  )

  // ¿Ofrecer el botón? Hay prompt nativo, o es iOS Safari (instrucciones).
  const puedeInstalar = computed(
    () => !isInstalled.value && (!!deferredPrompt.value || requiereInstruccionesIOS.value)
  )

  /**
   * Lanza la instalación. En Android/Chrome dispara el prompt nativo.
   * En iOS devuelve `{ outcome: 'ios-instructions' }` para que el componente
   * abra el modal de ayuda.
   */
  async function instalar() {
    if (!deferredPrompt.value) {
      return { outcome: 'ios-instructions' }
    }
    const evento = deferredPrompt.value
    evento.prompt()
    const eleccion = await evento.userChoice
    // El evento diferido solo puede usarse una vez.
    deferredPrompt.value = null
    if (eleccion?.outcome === 'accepted') {
      isInstalled.value = true
    }
    return eleccion
  }

  return {
    puedeInstalar,
    requiereInstruccionesIOS,
    isInstalled,
    esIOS,
    instalar,
  }
}

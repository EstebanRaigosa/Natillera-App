import { computed, ref } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * Notificaciones push del navegador para el soporte (RF-13).
 *
 * Estados posibles, y por qué importan cada uno:
 *   'no_soportado'      — el navegador no tiene Push API (Firefox privado, etc.)
 *   'requiere_instalar' — iOS/Safari: solo admite push con la PWA instalada en
 *                         la pantalla de inicio (iOS ≥ 16.4, RNF-05)
 *   'sin_conceder'      — se puede pedir permiso
 *   'denegado'          — el usuario dijo que no; hay que explicarle cómo
 *                         revertirlo en los ajustes, no volver a preguntar
 *   'activo'            — hay suscripción registrada en este dispositivo
 *
 * Regla que no se puede saltar: el permiso se pide SOLO tras una pulsación
 * explícita. Pedirlo al cargar hace que la mayoría de navegadores lo denieguen
 * de forma permanente y deje al usuario sin la opción.
 */

const CLAVE_PUBLICA = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function b64urlABytes(base64url) {
  const relleno = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + relleno).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(base64)
  const salida = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) salida[i] = bin.charCodeAt(i)
  return salida
}

function bytesAB64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function esIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  // iPadOS 13+ se presenta como Mac: se distingue por el soporte táctil.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

function estaInstalada() {
  if (typeof window === 'undefined') return false
  return window.navigator.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
}

export function usePush() {
  const estado = ref('sin_conceder')
  const ocupado = ref(false)
  const error = ref(null)

  const soportado = computed(() =>
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window)

  const configurado = computed(() => Boolean(CLAVE_PUBLICA))

  async function comprobar() {
    if (!soportado.value) {
      // En iOS la Push API solo existe cuando la app está instalada: si no lo
      // está, el diagnóstico útil no es «no soportado» sino «instálala».
      estado.value = esIos() && !estaInstalada() ? 'requiere_instalar' : 'no_soportado'
      return estado.value
    }
    if (esIos() && !estaInstalada()) {
      estado.value = 'requiere_instalar'
      return estado.value
    }
    if (Notification.permission === 'denied') {
      estado.value = 'denegado'
      return estado.value
    }

    try {
      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.getSubscription()
      if (suscripcion && Notification.permission === 'granted') {
        // Puede existir en el navegador y no en el servidor (base restaurada,
        // fila borrada): se vuelve a registrar para que no quede huérfana.
        await guardarSuscripcion(suscripcion)
        estado.value = 'activo'
      } else {
        estado.value = Notification.permission === 'granted' ? 'sin_conceder' : 'sin_conceder'
      }
    } catch (e) {
      error.value = e?.message ?? String(e)
      estado.value = 'sin_conceder'
    }
    return estado.value
  }

  async function guardarSuscripcion(suscripcion) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sesión no válida')

    const bruto = suscripcion.toJSON()

    // Por función y no por upsert directo: si en este mismo navegador hubo
    // antes otra cuenta, el endpoint ya existe a su nombre y el upsert
    // chocaría con la política de UPDATE. La función lo reasigna.
    const { error: e } = await supabase.rpc('soporte_registrar_push', {
      p_endpoint: suscripcion.endpoint,
      p_p256dh: bruto.keys?.p256dh ?? bytesAB64url(suscripcion.getKey('p256dh')),
      p_auth: bruto.keys?.auth ?? bytesAB64url(suscripcion.getKey('auth')),
      p_user_agent: navigator.userAgent?.slice(0, 300) ?? null,
    })
    if (e) throw e
  }

  /** Solo se puede llamar desde el manejador de una pulsación del usuario. */
  async function activar() {
    error.value = null
    if (!configurado.value) {
      error.value = 'Falta configurar VITE_VAPID_PUBLIC_KEY'
      return false
    }
    if (!soportado.value || estado.value === 'requiere_instalar') return false

    ocupado.value = true
    try {
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') {
        estado.value = permiso === 'denied' ? 'denegado' : 'sin_conceder'
        return false
      }

      const registro = await navigator.serviceWorker.ready
      const existente = await registro.pushManager.getSubscription()
      const suscripcion = existente ?? await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64urlABytes(CLAVE_PUBLICA),
      })

      await guardarSuscripcion(suscripcion)
      estado.value = 'activo'
      return true
    } catch (e) {
      error.value = e?.message ?? String(e)
      return false
    } finally {
      ocupado.value = false
    }
  }

  /** Da de baja en los dos sitios: el servidor y el navegador (RF-13). */
  async function desactivar() {
    error.value = null
    ocupado.value = true
    try {
      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.getSubscription()

      if (suscripcion) {
        await supabase.from('soporte_push').delete().eq('endpoint', suscripcion.endpoint)
        await suscripcion.unsubscribe()
      }
      estado.value = 'sin_conceder'
      return true
    } catch (e) {
      error.value = e?.message ?? String(e)
      return false
    } finally {
      ocupado.value = false
    }
  }

  return { estado, ocupado, error, soportado, configurado, comprobar, activar, desactivar, esIos, estaInstalada }
}

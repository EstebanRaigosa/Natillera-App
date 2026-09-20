import { computed, ref } from 'vue'
import { supabase } from '../lib/supabase'
// Fuente única de verdad para la detección de iOS. El manual
// (docs/compatibilidad-ios-safari.md §1) lo dice sin rodeos: nada de duplicar
// la detección con un regex suelto. El de aquí, además, no cubría el caso de
// `platform === 'MacIntel'` que sí resuelve este, ni excluía Android.
import { detectIosPlatform } from './useIsIos'

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

function estaInstalada() {
  if (typeof window === 'undefined') return false
  return window.navigator.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
}

/**
 * Espera al service worker con un límite de tiempo.
 *
 * `navigator.serviceWorker.ready` no rechaza nunca: si la página no llega a
 * estar controlada por ningún service worker, se queda pendiente para siempre y
 * deja la interfaz colgada sin explicación. Aquí, si no hay registro, se
 * registra; y si aun así no se activa, se falla con un motivo legible.
 */
async function esperarServiceWorker(msLimite = 12000) {
  const registroActual = await navigator.serviceWorker.getRegistration()
  if (!registroActual) {
    // Primera visita, o el registro automático falló.
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  }

  const limite = new Promise((_, rechazar) =>
    setTimeout(() => rechazar(new Error(
      'El service worker no llegó a activarse. Recarga con Ctrl+Shift+R y vuelve a intentarlo.',
    )), msLimite))

  return await Promise.race([navigator.serviceWorker.ready, limite])
}

/**
 * Límite de tiempo para promesas que el navegador puede dejar colgadas.
 * `subscribe()` habla con el servicio push del navegador (FCM en Chrome, Mozilla
 * en Firefox, Apple en Safari): es una llamada de red y con la red caída se
 * queda pendiente sin rechazar.
 */
function conLimite(promesa, ms, mensaje) {
  return Promise.race([
    promesa,
    new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms)),
  ])
}

export function usePush() {
  const estado = ref('sin_conceder')
  const ocupado = ref(false)
  const error = ref(null)
  // Qué se está esperando ahora mismo. Sin esto el botón dice «Activando…»
  // durante medio minuto sin explicar a qué espera, y parece que se colgó.
  const pista = ref(null)

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
      estado.value = detectIosPlatform() && !estaInstalada() ? 'requiere_instalar' : 'no_soportado'
      return estado.value
    }
    if (detectIosPlatform() && !estaInstalada()) {
      estado.value = 'requiere_instalar'
      return estado.value
    }
    if (Notification.permission === 'denied') {
      estado.value = 'denegado'
      return estado.value
    }

    try {
      const registro = await esperarServiceWorker()
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
    pista.value = 'Esperando tu permiso…'
    /*
     * El diálogo del permiso lo pinta el navegador y puede tardar en salir, o
     * no salir. Esperar los 20 s completos antes de decir nada hace que una
     * espera normal parezca una cuelgue; a los 4 s ya se da la pista de dónde
     * mirar, pero SIN abortar: quien tarde en decidir sigue pudiendo aceptar.
     */
    const avisoLento = setTimeout(() => {
      // El modo de avisos discretos es cosa de Chrome de escritorio. En iOS el
      // diálogo sale siempre, y allí este texto mandaría a buscar un icono que
      // no existe: la pista tiene que decir otra cosa.
      pista.value = detectIosPlatform()
        ? 'Responde al aviso que acaba de salir para poder activarlos.'
        : '¿No ves ningún aviso? Chrome a veces pregunta en silencio: '
          + 'mira el icono de campana a la izquierda de la dirección web.'
    }, 4000)
    try {
      /*
       * `requestPermission()` tampoco rechaza nunca. Chrome tiene un modo
       * silencioso —lo activa solo, según el historial del usuario— en el que
       * no muestra el diálogo: pone un icono de campana tachada en la barra de
       * direcciones y deja la promesa pendiente indefinidamente. Sin este
       * límite, el botón se queda girando para siempre sin decir por qué.
       */
      const permiso = await Promise.race([
        Notification.requestPermission(),
        new Promise((resolver) => setTimeout(() => resolver('sin_respuesta'), 20000)),
      ])
      clearTimeout(avisoLento)

      if (permiso === 'sin_respuesta') {
        estado.value = 'sin_conceder'
        error.value = 'El navegador no llegó a preguntar. Suele pasar cuando Chrome usa avisos '
          + 'discretos: busca el icono de campana tachada en la barra de direcciones y permite las '
          + 'notificaciones, o entra en el candado → Configuración del sitio → Notificaciones → Permitir.'
        return false
      }

      if (permiso === 'denied') {
        estado.value = 'denegado'
        return false
      }
      if (permiso !== 'granted') {
        // Chrome puede no mostrar el diálogo y dejar el permiso en «default»:
        // pone un icono discreto en la barra de direcciones. Sin este aviso, el
        // usuario se queda mirando un botón que no hace nada.
        estado.value = 'sin_conceder'
        error.value = 'El navegador no concedió el permiso. Si no viste ningún aviso, busca el icono '
          + 'de campana o candado a la izquierda de la dirección web y permite las notificaciones.'
        return false
      }

      pista.value = 'Preparando la app…'
      const registro = await esperarServiceWorker()

      pista.value = 'Conectando con el servicio de notificaciones…'
      const existente = await registro.pushManager.getSubscription()
      const suscripcion = existente ?? await conLimite(
        registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64urlABytes(CLAVE_PUBLICA),
        }),
        15000,
        'No se pudo contactar con el servicio de notificaciones del navegador. '
          + 'Comprueba la conexión (o si hay una VPN o un cortafuegos de por medio) e inténtalo otra vez.',
      )

      pista.value = 'Guardando este dispositivo…'
      await guardarSuscripcion(suscripcion)
      estado.value = 'activo'
      return true
    } catch (e) {
      error.value = e?.message ?? String(e)
      return false
    } finally {
      clearTimeout(avisoLento)
      ocupado.value = false
      pista.value = null
    }
  }

  /** Da de baja en los dos sitios: el servidor y el navegador (RF-13). */
  async function desactivar() {
    error.value = null
    ocupado.value = true
    pista.value = 'Dando de baja este dispositivo…'
    try {
      const registro = await esperarServiceWorker()
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
      pista.value = null
    }
  }

  return { estado, ocupado, error, pista, soportado, configurado, comprobar, activar, desactivar, estaInstalada }
}

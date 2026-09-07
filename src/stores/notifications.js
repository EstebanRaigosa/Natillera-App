import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Nati-Notificación — store del sistema de notificaciones de Natillerapp.
 *
 * Variantes canónicas (sistema de diseño):
 *   - 'informacion'  · neutra, color marca verde bosque
 *   - 'exito'        · confirmación de acción
 *   - 'alerta'       · advertencia (ámbar)
 *   - 'critica'      · error / acción destructiva (rojo)
 *
 * API canónica: informacion(), exito(), alerta(), critica().
 * API legacy (mantenida como alias para no romper 196 llamadas en el código):
 *   info() → informacion · success() → exito · warning() → alerta · error() → critica.
 */

const VARIANT_ALIASES = {
  success: 'exito',
  error: 'critica',
  warning: 'alerta',
  info: 'informacion'
}

const DEFAULT_TITLES = {
  exito: 'Listo',
  informacion: 'Información',
  alerta: 'Atención',
  critica: 'Error'
}

const DEFAULT_DURATIONS = {
  exito: 4500,
  informacion: 5000,
  alerta: 6500,
  critica: 8000
}

function normalizeVariant(type) {
  if (!type) return 'informacion'
  if (DEFAULT_TITLES[type]) return type
  return VARIANT_ALIASES[type] || 'informacion'
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  let idCounter = 0

  /**
   * Temporizadores de autocierre, fuera del estado reactivo porque nadie los pinta.
   * Se guardan aquí —y no en un `setTimeout` suelto— para poder pausarlos: si el
   * usuario tiene el puntero encima o está arrastrando el toast, lo está leyendo, y
   * que se le cierre a media frase es justo lo que no queremos.
   */
  const temporizadores = new Map()

  function programar(id, ms) {
    if (ms <= 0) return
    temporizadores.set(id, { handle: setTimeout(() => remove(id), ms), restante: ms, desde: Date.now() })
  }

  function pausar(id) {
    const t = temporizadores.get(id)
    if (!t || !t.handle) return
    clearTimeout(t.handle)
    t.handle = null
    t.restante = Math.max(0, t.restante - (Date.now() - t.desde))
  }

  function reanudar(id) {
    const t = temporizadores.get(id)
    if (!t || t.handle) return
    t.desde = Date.now()
    t.handle = setTimeout(() => remove(id), t.restante)
  }

  function show(notification = {}) {
    const variant = normalizeVariant(notification.type)
    const id = ++idCounter
    const duration = notification.duration ?? DEFAULT_DURATIONS[variant]

    const item = {
      id,
      type: variant,
      title: notification.title ?? DEFAULT_TITLES[variant],
      message: notification.message ?? '',
      duration
    }

    notifications.value.push(item)
    programar(id, duration)

    return id
  }

  // === API canónica (sistema de diseño) =====================================
  function informacion(message, title, duration) {
    return show({ type: 'informacion', message, title, duration })
  }
  function exito(message, title, duration) {
    return show({ type: 'exito', message, title, duration })
  }
  function alerta(message, title, duration) {
    return show({ type: 'alerta', message, title, duration })
  }
  function critica(message, title, duration) {
    return show({ type: 'critica', message, title, duration })
  }

  // === API legacy (alias retro-compatibles) =================================
  function success(message, title = DEFAULT_TITLES.exito, duration) {
    return show({ type: 'exito', message, title, duration })
  }
  function error(message, title = DEFAULT_TITLES.critica, duration) {
    return show({ type: 'critica', message, title, duration })
  }
  function warning(message, title = DEFAULT_TITLES.alerta, duration) {
    return show({ type: 'alerta', message, title, duration })
  }
  function info(message, title = DEFAULT_TITLES.informacion, duration) {
    return show({ type: 'informacion', message, title, duration })
  }

  function remove(id) {
    const t = temporizadores.get(id)
    if (t?.handle) clearTimeout(t.handle)
    temporizadores.delete(id)

    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clear() {
    temporizadores.forEach(t => { if (t.handle) clearTimeout(t.handle) })
    temporizadores.clear()
    notifications.value = []
  }

  return {
    notifications,
    show,
    // canónica
    informacion,
    exito,
    alerta,
    critica,
    // legacy
    success,
    error,
    warning,
    info,
    // utilidades
    remove,
    clear,
    pausar,
    reanudar
  }
})

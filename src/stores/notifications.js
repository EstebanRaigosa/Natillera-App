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

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }

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
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clear() {
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
    clear
  }
})

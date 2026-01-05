import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  let idCounter = 0

  function show(notification) {
    const id = ++idCounter
    const defaultDuration = notification.duration ?? 5000
    
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title || getDefaultTitle(notification.type),
      message: notification.message || '',
      duration: defaultDuration
    }

    notifications.value.push(newNotification)

    // Auto-remove after duration
    if (defaultDuration > 0) {
      setTimeout(() => {
        remove(id)
      }, defaultDuration)
    }

    return id
  }

  function success(message, title = 'Éxito', duration = 5000) {
    return show({ type: 'success', title, message, duration })
  }

  function error(message, title = 'Error', duration = 7000) {
    return show({ type: 'error', title, message, duration })
  }

  function warning(message, title = 'Advertencia', duration = 6000) {
    return show({ type: 'warning', title, message, duration })
  }

  function info(message, title = 'Información', duration = 5000) {
    return show({ type: 'info', title, message, duration })
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

  function getDefaultTitle(type) {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    }
    return titles[type] || 'Notificación'
  }

  return {
    notifications,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
})


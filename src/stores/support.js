import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useSupportStore = defineStore('support', () => {
  const unreadCount = ref(0)
  const lastChecked = ref(null)
  let checkInterval = null

  // Email permitido para acceder
  const ALLOWED_EMAIL = 'raigo.16@gmail.com'

  // Verificar si el usuario es admin
  async function isAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user && user.email === ALLOWED_EMAIL
    } catch (error) {
      return false
    }
  }

  // Cargar contador de mensajes sin leer
  async function loadUnreadCount() {
    try {
      const admin = await isAdmin()
      if (!admin) {
        unreadCount.value = 0
        return
      }

      // Obtener todas las conversaciones sin respuesta
      const { data, error } = await supabase
        .from('chat_messages')
        .select('user_id, user_email, response')
        .eq('is_from_user', true)

      if (error) throw error

      // Agrupar por usuario y verificar si tienen respuesta
      const conversations = {}
      data.forEach(msg => {
        const key = msg.user_id || msg.user_email
        if (!conversations[key]) {
          conversations[key] = { hasResponse: false }
        }
        if (msg.response) {
          conversations[key].hasResponse = true
        }
      })

      // Contar conversaciones sin respuesta
      const unread = Object.values(conversations).filter(c => !c.hasResponse).length
      
      // Solo mostrar notificación si hay nuevos mensajes
      if (unread > unreadCount.value && unreadCount.value > 0) {
        // Hay nuevos mensajes, pero no mostrar notificación en la primera carga
        // La notificación se mostrará cuando cambie el contador
      }
      
      unreadCount.value = unread
      lastChecked.value = new Date()
    } catch (error) {
      console.error('Error cargando mensajes sin leer:', error)
    }
  }

  // Iniciar verificación periódica
  function startChecking() {
    // Cargar inmediatamente
    loadUnreadCount()
    
    // Verificar cada 30 segundos
    if (checkInterval) {
      clearInterval(checkInterval)
    }
    checkInterval = setInterval(() => {
      loadUnreadCount()
    }, 30000) // 30 segundos
  }

  // Detener verificación periódica
  function stopChecking() {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  // Resetear contador (cuando se visita la página de soporte)
  function resetUnreadCount() {
    unreadCount.value = 0
  }

  const hasUnreadMessages = computed(() => unreadCount.value > 0)

  return {
    unreadCount,
    hasUnreadMessages,
    lastChecked,
    loadUnreadCount,
    startChecking,
    stopChecking,
    resetUnreadCount
  }
})


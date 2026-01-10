<template>
  <router-view />
  <ChatWidget />
  <NotificationToast />
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import ChatWidget from './components/ChatWidget.vue'
import NotificationToast from './components/NotificationToast.vue'
import { useSessionTimeout } from './composables/useSessionTimeout'

const authStore = useAuthStore()

// Configurar timeout de sesión por inactividad (10 minutos)
const sessionTimeout = useSessionTimeout(10)

// Función para ocultar el teclado al presionar Enter
function handleEnterKey(event) {
  // Solo procesar si es Enter y el elemento activo es un input o textarea
  if (event.key === 'Enter' || event.keyCode === 13) {
    const activeElement = document.activeElement
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      // Si el input está dentro de un formulario, no hacer blur (dejar que el formulario se envíe)
      const form = activeElement.closest('form')
      if (!form) {
        // Si no hay formulario, hacer blur para ocultar el teclado
        activeElement.blur()
      } else {
        // Si hay formulario, hacer blur después de un pequeño delay para permitir el submit
        setTimeout(() => {
          activeElement.blur()
        }, 100)
      }
    }
  }
}

// Función para hacer scroll cuando un input recibe focus (móvil)
function handleInputFocus(event) {
  const target = event.target
  // Solo procesar inputs y textareas
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    // Usar setTimeout para asegurar que el teclado se haya abierto
    setTimeout(() => {
      // Scroll suave al elemento, con un poco de padding superior para mejor visibilidad
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      })
    }, 300) // Delay para dar tiempo a que el teclado virtual se abra
  }
}

onMounted(() => {
  authStore.checkAuth()
  // Agregar listener global para Enter
  document.addEventListener('keydown', handleEnterKey)
  // Agregar listener para hacer scroll cuando un input recibe focus (móvil)
  document.addEventListener('focusin', handleInputFocus)
  
  // Iniciar el sistema de timeout de sesión si el usuario está autenticado
  if (authStore.isAuthenticated) {
    sessionTimeout.start()
  }
})

onUnmounted(() => {
  // Limpiar listeners al desmontar
  document.removeEventListener('keydown', handleEnterKey)
  document.removeEventListener('focusin', handleInputFocus)
  
  // Detener el sistema de timeout al desmontar
  sessionTimeout.stop()
})

// Observar cambios en el estado de autenticación para iniciar/detener el timeout
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  sessionTimeout.onAuthStateChange()
})
</script>

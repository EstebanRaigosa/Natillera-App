<template>
  <router-view />
  <!-- <ChatWidget /> -->
  <NotificationToast />
  <UsernameModal 
    :show="showUsernameModal" 
    @close="showUsernameModal = false"
    @saved="handleUsernameSaved"
  />
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
// import ChatWidget from './components/ChatWidget.vue'
import NotificationToast from './components/NotificationToast.vue'
import UsernameModal from './components/UsernameModal.vue'
import { useSessionTimeout } from './composables/useSessionTimeout'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showUsernameModal = ref(false)

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
  
  // Si el usuario se desautentica mientras el modal está abierto, redirigir al login
  if (!isAuthenticated && showUsernameModal.value) {
    showUsernameModal.value = false
    if (!route.path.startsWith('/auth/')) {
      router.push({ name: 'Login' })
    }
  }
})

// Función para verificar si debemos mostrar el modal
function shouldShowUsernameModal() {
  if (!authStore.isAuthenticated || !authStore.needsUsername) {
    return false
  }
  
  // No mostrar el modal en rutas de autenticación
  return !route.path.startsWith('/auth/')
}

// Observar si el usuario necesita agregar un nombre de usuario
watch(() => authStore.needsUsername, (needs) => {
  if (shouldShowUsernameModal()) {
    // Esperar un poco para que la UI se estabilice después de la navegación
    setTimeout(() => {
      if (shouldShowUsernameModal()) {
        showUsernameModal.value = true
      }
    }, 800)
  } else {
    showUsernameModal.value = false
  }
}, { immediate: true })

// También verificar cuando cambia el usuario
watch(() => authStore.user, (newUser) => {
  if (shouldShowUsernameModal()) {
    setTimeout(() => {
      if (shouldShowUsernameModal()) {
        showUsernameModal.value = true
      }
    }, 800)
  }
}, { immediate: true })

// Observar cambios en la ruta para ocultar el modal si se navega a rutas de auth
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/auth/')) {
    showUsernameModal.value = false
  } else if (shouldShowUsernameModal()) {
    setTimeout(() => {
      if (shouldShowUsernameModal()) {
        showUsernameModal.value = true
      }
    }, 500)
  }
})

function handleUsernameSaved() {
  // El nombre se guardó exitosamente, el modal se cerrará automáticamente
  // y needsUsername se actualizará automáticamente
  showUsernameModal.value = false
}
</script>

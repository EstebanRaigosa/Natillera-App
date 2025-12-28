<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

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

onMounted(() => {
  authStore.checkAuth()
  // Agregar listener global para Enter
  document.addEventListener('keydown', handleEnterKey)
})

onUnmounted(() => {
  // Limpiar listener al desmontar
  document.removeEventListener('keydown', handleEnterKey)
})
</script>

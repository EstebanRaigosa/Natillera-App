import { watch, onUnmounted } from 'vue'

/**
 * Composable para bloquear el scroll del body cuando una modal está abierta
 * @param {Ref<boolean>} isOpen - Ref reactivo que indica si la modal está abierta
 */
export function useBodyScrollLock(isOpen) {
  let scrollY = 0

  const lockBodyScroll = () => {
    // Guardar la posición actual del scroll
    scrollY = window.scrollY || document.documentElement.scrollTop
    
    // Bloquear el scroll
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  }

  const unlockBodyScroll = () => {
    // Restaurar el scroll
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    
    // Restaurar la posición del scroll
    window.scrollTo(0, scrollY)
  }

  // Observar cambios en el estado de la modal
  const stopWatcher = watch(isOpen, (open) => {
    if (open) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  }, { immediate: true })

  // Limpiar al desmontar el componente
  onUnmounted(() => {
    stopWatcher()
    // Asegurarse de desbloquear el scroll al desmontar
    if (isOpen.value) {
      unlockBodyScroll()
    }
  })

  return {
    lockBodyScroll,
    unlockBodyScroll
  }
}
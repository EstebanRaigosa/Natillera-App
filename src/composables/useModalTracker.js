import { ref, computed } from 'vue'

// Estado global para rastrear si hay modales abiertas
const hasOpenModals = ref(false)

export function useModalTracker() {
  const registerModal = (modalRef) => {
    // Observar cambios en el valor del ref de la modal
    return computed(() => {
      const isOpen = modalRef.value
      return isOpen
    })
  }

  const setModalOpen = (isOpen) => {
    hasOpenModals.value = isOpen
  }

  return {
    hasOpenModals: computed(() => hasOpenModals.value),
    setModalOpen,
    registerModal
  }
}

// Exportar el estado global directamente para uso en ChatWidget
export { hasOpenModals }


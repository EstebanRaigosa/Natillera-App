import { watch, onUnmounted, ref, readonly } from 'vue'

// Contador global: solo desbloquear cuando ninguna modal esté abierta (evita race al pasar de modal pago a modal comprobante)
let lockCount = 0
let savedScrollY = 0
let savedScrollYMain = 0

const _isBodyScrollLocked = ref(false)
/** Ref global: true cuando hay al menos una modal abierta (para que el layout suba z-index y la barra quede debajo) */
export const isBodyScrollLocked = readonly(_isBodyScrollLocked)

function updateLockedRef() {
  _isBodyScrollLocked.value = lockCount > 0
}

function applyLock() {
  const html = document.documentElement
  savedScrollY = window.scrollY || html.scrollTop
  document.body.style.position = 'fixed'
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
  html.style.overflow = 'hidden'

  const main = document.querySelector('main')
  if (main) {
    savedScrollYMain = main.scrollTop
    main.style.position = 'fixed'
    main.style.top = `-${savedScrollYMain}px`
    main.style.left = '0'
    main.style.right = '0'
    main.style.width = '100%'
    main.style.overflow = 'hidden'
    // No aplicar touch-action: none para permitir scroll dentro de las modales
  }
}

function applyUnlock() {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  window.scrollTo(0, savedScrollY)

  const main = document.querySelector('main')
  if (main) {
    main.style.position = ''
    main.style.top = ''
    main.style.left = ''
    main.style.right = ''
    main.style.width = ''
    main.style.overflow = ''
    main.scrollTop = savedScrollYMain
  }
}

/**
 * Composable para bloquear el scroll del body y del main (contenedor del layout)
 * cuando una modal está abierta.
 * @param {Ref<boolean>} isOpen - Ref reactivo que indica si la modal está abierta
 */
export function useBodyScrollLock(isOpen) {
  let thisInstanceLocked = false

  const lockBodyScroll = () => {
    lockCount++
    thisInstanceLocked = true
    updateLockedRef()
    applyLock()
  }

  const unlockBodyScroll = () => {
    if (!thisInstanceLocked) return
    thisInstanceLocked = false
    lockCount = Math.max(0, lockCount - 1)
    updateLockedRef()
    if (lockCount === 0) {
      applyUnlock()
    }
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
import { watch, onUnmounted, ref, readonly } from 'vue'

// Contador global: solo desbloquear cuando ninguna modal esté abierta (evita race al pasar de modal pago a modal comprobante)
let lockCount = 0
let savedScrollY = 0
let savedScrollYMain = 0

const _isBodyScrollLocked = ref(false)
/** Ref global: true cuando hay al menos una modal abierta (para que el layout suba z-index y la barra quede debajo) */
export const isBodyScrollLocked = readonly(_isBodyScrollLocked)

// Detectar iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function updateLockedRef() {
  _isBodyScrollLocked.value = lockCount > 0
}

function applyLock() {
  const html = document.documentElement
  savedScrollY = window.scrollY || html.scrollTop
  
  // En iOS/Safari, usar un método que NO toque <main> para que las modales (fixed)
  // sigan usando el viewport como containing block. Si main tiene overflow:hidden,
  // Safari recorta o no muestra los fixed que están dentro de main.
  if (isIOS()) {
    const bodyHeight = document.body.style.height || ''
    document.body.setAttribute('data-original-height', bodyHeight)
    document.body.setAttribute('data-scroll-y', savedScrollY.toString())

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'relative'
    document.body.style.height = '100%'
    document.body.style.touchAction = 'none' // Evitar scroll mientras la modal está abierta
    html.style.overflow = 'hidden'
    html.style.height = '100%'

    // NO modificar main en iOS: evita que las modales (fixed dentro de la página) dejen de verse
    const main = document.querySelector('main')
    if (main) {
      savedScrollYMain = main.scrollTop
      main.setAttribute('data-scroll-y', savedScrollYMain.toString())
      // No aplicar height/overflow a main en iOS
    }

    requestAnimationFrame(() => {
      const modals = document.querySelectorAll('.fixed.inset-0, [class*="fixed"][class*="inset-0"]')
      modals.forEach(modal => {
        if (modal && modal.style) {
          modal.style.display = modal.style.display || 'flex'
          modal.style.opacity = '1'
          modal.style.visibility = 'visible'
          modal.style.transform = 'translate3d(0, 0, 0)'
          modal.style.webkitTransform = 'translate3d(0, 0, 0)'
        }
      })
    })
  } else {
    // Para Android y otros: usar el método original con position fixed
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
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
    }
  }
}

function applyUnlock() {
  const html = document.documentElement
  
  if (isIOS()) {
    const originalHeight = document.body.getAttribute('data-original-height') || ''
    document.body.style.height = originalHeight
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.touchAction = ''
    html.style.overflow = ''
    html.style.height = ''
    document.body.removeAttribute('data-original-height')

    const savedY = parseInt(document.body.getAttribute('data-scroll-y') || '0', 10)
    document.body.removeAttribute('data-scroll-y')

    requestAnimationFrame(() => {
      if (savedY > 0) {
        window.scrollTo(0, savedY)
      }
    })

    const main = document.querySelector('main')
    if (main) {
      const savedMainY = parseInt(main.getAttribute('data-scroll-y') || '0', 10)
      main.removeAttribute('data-scroll-y')
      if (savedMainY > 0) {
        requestAnimationFrame(() => {
          main.scrollTop = savedMainY
        })
      }
    }
  } else {
    // Para Android y otros: usar el método original
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
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
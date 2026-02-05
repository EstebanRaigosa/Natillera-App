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
  
  // En iOS, usar un método diferente que no cause problemas de renderizado
  if (isIOS()) {
    // Para iOS: usar height y overflow sin position fixed
    // Esto evita problemas de renderizado con modales
    // Guardar altura original
    const bodyHeight = document.body.style.height || ''
    document.body.setAttribute('data-original-height', bodyHeight)
    
    // Bloquear scroll sin usar position fixed
    document.body.style.height = '100%'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'relative'
    html.style.overflow = 'hidden'
    html.style.height = '100%'
    
    // Guardar la posición del scroll
    document.body.setAttribute('data-scroll-y', savedScrollY.toString())
    
    // Prevenir scroll en iOS usando touch-action solo en el body
    // No aplicar touch-action: none globalmente para permitir scroll en modales
    document.body.style.touchAction = 'pan-y pinch-zoom'
    
    const main = document.querySelector('main')
    if (main) {
      savedScrollYMain = main.scrollTop
      main.setAttribute('data-scroll-y', savedScrollYMain.toString())
      const mainHeight = main.style.height || ''
      main.setAttribute('data-original-height', mainHeight)
      main.style.height = '100%'
      main.style.overflow = 'hidden'
      main.style.touchAction = 'pan-y pinch-zoom'
    }
    
    // Forzar repaint en iOS para asegurar renderizado correcto
    requestAnimationFrame(() => {
      document.body.style.display = 'block'
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
    // Para iOS: restaurar estilos sin position fixed
    const originalHeight = document.body.getAttribute('data-original-height') || ''
    document.body.style.height = originalHeight
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.touchAction = ''
    document.body.style.display = ''
    html.style.overflow = ''
    html.style.height = ''
    document.body.removeAttribute('data-original-height')
    
    // Restaurar posición del scroll desde el atributo data
    const savedY = parseInt(document.body.getAttribute('data-scroll-y') || '0', 10)
    document.body.removeAttribute('data-scroll-y')
    
    // Usar requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      if (savedY > 0) {
        window.scrollTo(0, savedY)
      }
    })

    const main = document.querySelector('main')
    if (main) {
      const originalMainHeight = main.getAttribute('data-original-height') || ''
      main.style.height = originalMainHeight
      main.style.overflow = ''
      main.style.touchAction = ''
      const savedMainY = parseInt(main.getAttribute('data-scroll-y') || '0', 10)
      main.removeAttribute('data-scroll-y')
      main.removeAttribute('data-original-height')
      
      requestAnimationFrame(() => {
        if (savedMainY > 0) {
          main.scrollTop = savedMainY
        }
      })
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
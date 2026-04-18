import { driver } from 'driver.js'
import { TOURS_ENABLED } from '../config/toursEnabled'
import { markNatilleraMenuTourDone } from './useNatilleraMenuTour'

const STORAGE_DONE = (id) => `primer_socio_socios_nav_tour_v1_${id}`
const SESSION_PENDING = (id) => `primer_socio_nav_tour_pending_${id}`

/** Llamar al navegar desde la modal «Sin socios» hacia crear el primer socio. */
export function markPendingPrimerSocioNavTourFromModal(natilleraId) {
  if (!natilleraId) return
  try {
    sessionStorage.setItem(SESSION_PENDING(String(natilleraId)), '1')
  } catch {
    /* ignore */
  }
}

/** Devuelve true si venía la modal «sin socios» y limpia la marca en sessionStorage. */
export function consumePendingPrimerSocioNavTour(natilleraId) {
  if (!natilleraId) return false
  const k = SESSION_PENDING(String(natilleraId))
  try {
    if (sessionStorage.getItem(k) !== '1') return false
    sessionStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

export function shouldShowPrimerSocioSociosNavTour(natilleraId) {
  if (!TOURS_ENABLED) return false
  if (typeof window === 'undefined' || !natilleraId) return false
  try {
    return !localStorage.getItem(STORAGE_DONE(String(natilleraId)))
  } catch {
    return false
  }
}

export function markPrimerSocioSociosNavTourDone(natilleraId) {
  if (!natilleraId) return
  try {
    localStorage.setItem(STORAGE_DONE(String(natilleraId)), '1')
  } catch {
    /* ignore */
  }
}

/**
 * Tour de un paso: en desktop (≥1024) resalta Socios en la barra lateral; en móvil, Socios en la barra inferior.
 * @param {{ natilleraId: string, prepareSidebarForTour?: () => void, clearSidebarAfterTour?: () => void, onSociosTourClosed?: (natilleraId: string) => void }} opts
 */
export function startPrimerSocioSociosNavTour(opts) {
  if (!TOURS_ENABLED) return
  const { natilleraId, prepareSidebarForTour, clearSidebarAfterTour, onSociosTourClosed } = opts || {}
  if (typeof window === 'undefined' || !natilleraId) return

  const isDesktop = window.innerWidth >= 1024
  const selector = isDesktop ? '#tour-sidebar-socios' : '#tour-bottom-nav-socios'

  const run = () => {
    const el = document.querySelector(selector)
    if (!el) {
      clearSidebarAfterTour?.()
      markPrimerSocioSociosNavTourDone(natilleraId)
      markNatilleraMenuTourDone(natilleraId)
      return
    }

    const d = driver({
      animate: true,
      allowClose: true,
      disableActiveInteraction: true,
      overlayColor: '#14532d',
      overlayOpacity: 0.68,
      stagePadding: 10,
      stageRadius: 14,
      smoothScroll: true,
      showProgress: false,
      nextBtnText: 'Entendido',
      doneBtnText: 'Entendido',
      popoverClass: 'driver-popover-natillera',
      onDestroyed: () => {
        clearSidebarAfterTour?.()
        markPrimerSocioSociosNavTourDone(natilleraId)
        markNatilleraMenuTourDone(natilleraId)
        onSociosTourClosed?.(natilleraId)
      },
      steps: [
        {
          element: selector,
          popover: {
            title: isDesktop ? 'Socios en el menú lateral' : 'Socios en la barra inferior',
            description: isDesktop
              ? 'Para agregar más socios más adelante, usa esta opción «Socios» del menú lateral. Desde ahí podrás abrir el formulario y gestionar la lista.'
              : 'Para agregar más socios más adelante, usa el ítem «Socios» en la barra inferior. Es el acceso rápido al listado y al botón de agregar.',
            side: isDesktop ? 'right' : 'top',
            align: 'center'
          }
        }
      ]
    })

    d.drive(0)
  }

  if (isDesktop) {
    prepareSidebarForTour?.()
    window.requestAnimationFrame(() => {
      setTimeout(run, 120)
    })
  } else {
    window.requestAnimationFrame(() => {
      setTimeout(run, 200)
    })
  }
}

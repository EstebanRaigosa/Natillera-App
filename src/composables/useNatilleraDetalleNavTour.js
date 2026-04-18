import { driver } from 'driver.js'
import { TOURS_ENABLED } from '../config/toursEnabled'
import { peekPendingCuotasDetalleTour } from './usePrimerSocioCuotasMesTour'

/** Misma clave base que useNatilleraMenuTour: indica que terminó el recorrido inicial en Socios / menú móvil. */
const PREREQ_MENU_TOUR = (id) => `natillera_menu_acciones_tour_v3_${id}`
/** Una sola vez por cuenta (usuario autenticado). */
const STORAGE_DONE_USER = (userId) => `natillera_detalle_nav_tour_v2_user_${userId}`

function hasPendingCuotasMesIntro(natilleraId) {
  if (!natilleraId) return false
  try {
    return sessionStorage.getItem(`primer_cuotas_mes_tour_pending_${String(natilleraId)}`) === '1'
  } catch {
    return false
  }
}

/**
 * Tras completar el recorrido inicial en Socios (menú móvil / acciones): primera visita a Inicio.
 * Aplica a natilleras nuevas y antiguas; no filtra por antigüedad de cuenta ni de natillera.
 *
 * @param {{ natilleraId: string, userId: string, userCreatedAt?: string | null, natilleraCreatedAt?: string | null }} ctx - fechas opcionales conservadas por compatibilidad con llamadas existentes
 */
export function shouldShowNatilleraDetalleNavTour(ctx) {
  if (!TOURS_ENABLED) return false
  const { natilleraId, userId } = ctx || {}
  if (typeof window === 'undefined' || !natilleraId || !userId) return false
  try {
    if (localStorage.getItem(STORAGE_DONE_USER(String(userId)))) return false
    if (!localStorage.getItem(PREREQ_MENU_TOUR(String(natilleraId)))) return false
    if (hasPendingCuotasMesIntro(natilleraId)) return false
    if (peekPendingCuotasDetalleTour(natilleraId)) return false

    return true
  } catch {
    return false
  }
}

export function markNatilleraDetalleNavTourDone(userId) {
  if (!userId) return
  try {
    localStorage.setItem(STORAGE_DONE_USER(String(userId)), '1')
  } catch {
    /* ignore */
  }
}

/**
 * Primera visita a Inicio (detalle) tras el recorrido inicial: ubicación del menú y sección Acciones.
 * Desktop: barra lateral (Menú + Acciones). Móvil: barra inferior, luego ☰ y Acciones en el panel.
 * @param {{ natilleraId: string, userId: string, prepareSidebarForTour?: () => void, clearSidebarAfterTour?: () => void, openSidebar?: () => void, closeSidebar?: () => void, onTourStart?: () => void, onTourEnd?: (p: { started: boolean }) => void }} opts
 * @returns {boolean} true si el tour se inició; si false, `onTourEnd` ya se llamó con `{ started: false }`.
 */
export function startNatilleraDetalleNavTour(opts) {
  const {
    natilleraId,
    userId,
    prepareSidebarForTour,
    clearSidebarAfterTour,
    openSidebar,
    closeSidebar,
    onTourStart,
    onTourEnd
  } = opts || {}
  if (!TOURS_ENABLED) {
    onTourEnd?.({ started: false })
    return false
  }
  if (typeof window === 'undefined' || !natilleraId || !userId) {
    onTourEnd?.({ started: false })
    return false
  }

  const isDesktop = window.innerWidth >= 1024

  const menuLateral = document.querySelector('#tour-sidebar-menu-natillera')
  const acciones = document.querySelector('#tour-acciones-natillera')
  const barraInferior = document.querySelector('#tour-mobile-bottom-nav')
  const hamburger = document.querySelector('#tour-hamburger-btn')

  if (isDesktop) {
    if (!menuLateral || !acciones) {
      onTourEnd?.({ started: false })
      return false
    }
  } else if (!barraInferior || !hamburger || !acciones) {
    onTourEnd?.({ started: false })
    return false
  }

  const finish = () => {
    closeSidebar?.()
    clearSidebarAfterTour?.()
    markNatilleraDetalleNavTourDone(userId)
    onTourEnd?.({ started: true })
  }

  if (isDesktop) {
    prepareSidebarForTour?.()
    const d = driver({
      animate: true,
      allowClose: true,
      disableActiveInteraction: true,
      overlayColor: '#14532d',
      overlayOpacity: 0.68,
      stagePadding: 10,
      stageRadius: 14,
      smoothScroll: true,
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atras',
      doneBtnText: 'Entendido',
      popoverClass: 'driver-popover-natillera',
      onDestroyed: () => {
        clearSidebarAfterTour?.()
        markNatilleraDetalleNavTourDone(userId)
        onTourEnd?.({ started: true })
      },
      steps: [
        {
          element: '#tour-sidebar-menu-natillera',
          popover: {
            title: 'Menú en la barra lateral',
            description:
              'En pantallas grandes el menú principal está aquí: Inicio, Socios, Cuotas, Préstamos, Actividades y Totales. Es la navegación del día a día dentro de esta natillera.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-acciones-natillera',
          popover: {
            title: 'Acciones de la natillera',
            description:
              'Debajo tienes «Acciones Natillera»: buscar comprobantes, invitar colaboradores, abrir configuración, avisar a los socios y cerrar el ciclo cuando corresponda. Son acciones puntuales, no el listado de pantallas.',
            side: 'right',
            align: 'start'
          }
        }
      ]
    })
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        onTourStart?.()
        d.drive(0)
      }, 120)
    })
    return true
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
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Atras',
    doneBtnText: 'Entendido',
    popoverClass: 'driver-popover-natillera',
    onDestroyed: finish,
    steps: [
      {
        element: '#tour-mobile-bottom-nav',
        popover: {
          title: 'Menú en la barra inferior',
          description:
            'En el teléfono el menú principal está en esta barra: Inicio, Socios, Cuotas, Préstamos, Actividades y Totales. Desde aquí cambias de pantalla con un toque.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-hamburger-btn',
        popover: {
          title: 'Abrir el panel lateral',
          description:
            'Toca las tres rayas para abrir el panel lateral. Ahí están las mismas opciones que en escritorio y la sección «Acciones Natillera».',
          side: 'bottom',
          align: 'start',
          onNextClick: (_el, _step, { driver: drv }) => {
            openSidebar?.()
            setTimeout(() => drv.moveNext(), 420)
          }
        }
      },
      {
        element: '#tour-acciones-natillera',
        popover: {
          title: 'Acciones de la natillera',
          description:
            '«Acciones Natillera» agrupa lo que no es navegación diaria: buscar comprobante, invitar colaborador, configurar, notificar a los socios y cerrar la natillera al terminar el ciclo.',
          side: 'right',
          align: 'start',
          onPrevClick: (_el, _step, { driver: drv }) => {
            closeSidebar?.()
            setTimeout(() => drv.movePrevious(), 200)
          }
        }
      }
    ]
  })

  window.requestAnimationFrame(() => {
    setTimeout(() => {
      onTourStart?.()
      d.drive(0)
    }, 200)
  })
  return true
}

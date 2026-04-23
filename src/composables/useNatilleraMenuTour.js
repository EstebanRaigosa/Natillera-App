import { driver } from 'driver.js'

const storageKey = (natilleraId) => `natillera_menu_acciones_tour_v3_${natilleraId}`

/**
 * Tour corto (móvil) tras el primer socio: menú ☰, acciones, barra inferior y Totales (estado).
 */
export function shouldShowNatilleraMenuTour(natilleraId) {
  if (typeof window === 'undefined' || !natilleraId) return false
  if (window.innerWidth >= 1024) return false
  try {
    return !localStorage.getItem(storageKey(natilleraId))
  } catch {
    return false
  }
}

export function markNatilleraMenuTourDone(natilleraId) {
  if (!natilleraId) return
  try {
    localStorage.setItem(storageKey(natilleraId), '1')
  } catch {
    // ignore
  }
}

/**
 * @param {{ natilleraId: string, openSidebar?: () => void, closeSidebar?: () => void }} opts
 */
export function startNatilleraMenuTour(opts) {
  const { natilleraId, openSidebar, closeSidebar } = opts || {}
  if (typeof window === 'undefined' || !natilleraId) return

  const hamburger = document.querySelector('#tour-hamburger-btn')
  const acciones = document.querySelector('#tour-acciones-natillera')
  const barraInferior = document.querySelector('#tour-mobile-bottom-nav')
  const itemTotales = document.querySelector('#tour-bottom-nav-totales')
  if (!hamburger || !acciones || !barraInferior || !itemTotales) return

  const d = driver({
    animate: true,
    allowClose: true,
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
      closeSidebar?.()
      markNatilleraMenuTourDone(natilleraId)
    },
    steps: [
      {
        element: '#tour-hamburger-btn',
        popover: {
          title: 'Menu (tres rayas)',
          description:
            'Toca aqui para abrir el panel lateral. Ahi estan las acciones de esta natillera: buscar comprobantes, invitar colaboradores, avisar a los socios y cerrar el ciclo cuando corresponda.',
          side: 'bottom',
          align: 'start',
          onNextClick: (_element, _step, { driver: drv }) => {
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
            'Aqui tienes: Buscar comprobante, Invitar colaborador, Configurar (ajustes de la natillera), Notificar a los socios y Cerrar natillera al finalizar el ciclo.',
          side: 'right',
          align: 'start',
          onNextClick: (_element, _step, { driver: drv }) => {
            closeSidebar?.()
            setTimeout(() => drv.moveNext(), 480)
          },
          onPrevClick: (_element, _step, { driver: drv }) => {
            closeSidebar?.()
            setTimeout(() => drv.movePrevious(), 200)
          }
        }
      },
      {
        element: '#tour-mobile-bottom-nav',
        popover: {
          title: 'Barra inferior de navegacion',
          description:
            'Desde aqui saltas entre las pantallas principales: Inicio, Socios, Cuotas, Prestamos, Actividades, Totales y Config. Usala para el dia a dia; el menu es para acciones puntuales. En el siguiente paso te mostramos Totales.',
          side: 'top',
          align: 'center',
          onPrevClick: (_element, _step, { driver: drv }) => {
            openSidebar?.()
            setTimeout(() => drv.movePrevious(), 450)
          }
        }
      },
      {
        element: '#tour-bottom-nav-totales',
        popover: {
          title: 'Totales - estado de la natillera',
          description:
            'Toca Totales para ver el cuadre y la situacion financiera: recaudo, pendientes, movimientos y el panorama general. Es el lugar habitual para revisar como va la natillera.',
          side: 'top',
          align: 'center'
        }
      }
    ]
  })

  d.drive(0)
}

import { driver } from 'driver.js'
import { TOURS_ENABLED } from '../config/toursEnabled'

/** Clave antigua (un solo tour): si existe, no se muestran ni el grid ni el detalle. */
const LEGACY_STORAGE = (id) => `primer_socio_cuotas_mes_tour_v1_${id}`
const GRID_STORAGE = (id) => `primer_socio_cuotas_meses_grid_tour_v1_${id}`
const DETALLE_STORAGE = (id) => `primer_socio_cuotas_detalle_socio_tour_v1_${id}`

const SESSION_PENDING = (id) => `primer_cuotas_mes_tour_pending_${id}`
const SESSION_PENDING_DETALLE = (id) => `primer_cuotas_detalle_tour_pending_${id}`
const SESSION_SOCIO_ID = (id) => `primer_flujo_socio_natillera_id_${id}`

/** Estado interno del tour de detalle (Cuotas.vue): modal abierto a mano + elección de mes */
let detalleTourDriver = null
let esperandoAperturaModalMes = false
let esperandoElegirMesEnModal = false

/** Llamar cuando el usuario abre el modal «Seleccionar mes» (toca PERIODO) durante el tour. */
export function notifyPrimerCuotasDetalleModalMesAbierto() {
  if (!detalleTourDriver || !esperandoAperturaModalMes) return
  esperandoAperturaModalMes = false
  window.setTimeout(() => {
    try {
      detalleTourDriver.refresh()
    } catch {
      /* ignore */
    }
    try {
      detalleTourDriver.moveNext()
    } catch {
      /* ignore */
    }
  }, 380)
}

/** Llamar cuando el usuario eligió otro mes y el modal se cerró. */
export function notifyPrimerCuotasDetalleMesElegidoEnModal() {
  if (!detalleTourDriver || !esperandoElegirMesEnModal) return
  esperandoElegirMesEnModal = false
  window.setTimeout(() => {
    try {
      detalleTourDriver.refresh()
    } catch {
      /* ignore */
    }
    try {
      detalleTourDriver.moveNext()
    } catch {
      /* ignore */
    }
  }, 420)
}

/** Llamar cuando el modal se cerró sin cambiar de mes (X o fuera). Vuelve al paso de PERIODO. */
export function notifyPrimerCuotasDetalleModalCerradoSinElegirMes() {
  if (!detalleTourDriver || !esperandoElegirMesEnModal) return
  esperandoElegirMesEnModal = false
  esperandoAperturaModalMes = true
  window.setTimeout(() => {
    try {
      detalleTourDriver.movePrevious()
    } catch {
      /* ignore */
    }
    try {
      detalleTourDriver.refresh()
    } catch {
      /* ignore */
    }
  }, 200)
}

function resetDetalleTourDriverState() {
  detalleTourDriver = null
  esperandoAperturaModalMes = false
  esperandoElegirMesEnModal = false
}

export function setPendingPrimerSocioCuotasMesTour(natilleraId) {
  if (!natilleraId) return
  try {
    sessionStorage.setItem(SESSION_PENDING(String(natilleraId)), '1')
  } catch {
    /* ignore */
  }
}

/** Devuelve true si había marca pendiente y la elimina (tras crear socio y tour de Socios). */
export function consumePendingPrimerSocioCuotasMesTour(natilleraId) {
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

export function shouldShowPrimerSocioCuotasMesTour(natilleraId) {
  if (!TOURS_ENABLED) return false
  if (typeof window === 'undefined' || !natilleraId) return false
  try {
    const id = String(natilleraId)
    if (localStorage.getItem(LEGACY_STORAGE(id))) return false
    return !localStorage.getItem(GRID_STORAGE(id))
  } catch {
    return false
  }
}

/** Marca el tour del grid de meses (CuotasMeses) como completado. */
export function markPrimerSocioCuotasMesGridTourDone(natilleraId) {
  if (!natilleraId) return
  try {
    localStorage.setItem(GRID_STORAGE(String(natilleraId)), '1')
  } catch {
    /* ignore */
  }
}

/** @deprecated Usar markPrimerSocioCuotasMesGridTourDone; se mantiene por compatibilidad con imports. */
export function markPrimerSocioCuotasMesTourDone(natilleraId) {
  markPrimerSocioCuotasMesGridTourDone(natilleraId)
}

export function shouldShowPrimerCuotasDetalleSocioTour(natilleraId) {
  if (!TOURS_ENABLED) return false
  if (typeof window === 'undefined' || !natilleraId) return false
  try {
    const id = String(natilleraId)
    if (localStorage.getItem(LEGACY_STORAGE(id))) return false
    return !localStorage.getItem(DETALLE_STORAGE(id))
  } catch {
    return false
  }
}

export function markPrimerCuotasDetalleSocioTourDone(natilleraId) {
  if (!natilleraId) return
  try {
    localStorage.setItem(DETALLE_STORAGE(String(natilleraId)), '1')
  } catch {
    /* ignore */
  }
}

export function setPrimerFlujoSocioNatilleraId(natilleraId, socioNatilleraId) {
  if (!natilleraId || !socioNatilleraId) return
  try {
    sessionStorage.setItem(SESSION_SOCIO_ID(String(natilleraId)), String(socioNatilleraId))
  } catch {
    /* ignore */
  }
}

export function getPrimerFlujoSocioNatilleraId(natilleraId) {
  if (!natilleraId) return null
  try {
    return sessionStorage.getItem(SESSION_SOCIO_ID(String(natilleraId)))
  } catch {
    return null
  }
}

export function clearPrimerFlujoSocioNatilleraId(natilleraId) {
  if (!natilleraId) return
  try {
    sessionStorage.removeItem(SESSION_SOCIO_ID(String(natilleraId)))
  } catch {
    /* ignore */
  }
}

function setPendingCuotasDetalleTour(natilleraId) {
  if (!natilleraId) return
  try {
    sessionStorage.setItem(SESSION_PENDING_DETALLE(String(natilleraId)), '1')
  } catch {
    /* ignore */
  }
}

export function peekPendingCuotasDetalleTour(natilleraId) {
  if (!natilleraId) return false
  try {
    return sessionStorage.getItem(SESSION_PENDING_DETALLE(String(natilleraId))) === '1'
  } catch {
    return false
  }
}

export function clearPendingCuotasDetalleTour(natilleraId) {
  if (!natilleraId) return
  try {
    sessionStorage.removeItem(SESSION_PENDING_DETALLE(String(natilleraId)))
  } catch {
    /* ignore */
  }
}

export function consumePendingCuotasDetalleTour(natilleraId) {
  if (!natilleraId) return false
  const k = SESSION_PENDING_DETALLE(String(natilleraId))
  try {
    if (sessionStorage.getItem(k) !== '1') return false
    sessionStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

/**
 * Tour en CuotasMeses: (1) ítem Cuotas en navegación, (2) primer mes del grid.
 * Al cerrar con «Entendido», marca el grid como hecho, deja pendiente el tour de detalle y navega al mes si se indica.
 * @param {{ natilleraId: string, firstMonthLabel: string, firstMonthValue?: number, prepareSidebarForTour?: () => void, clearSidebarAfterTour?: () => void, onMesesGridTourFinished?: (p: { natilleraId: string, firstMonthValue?: number }) => void }} opts
 */
export function startPrimerSocioCuotasMesTour(opts) {
  const {
    natilleraId,
    firstMonthLabel,
    firstMonthValue,
    prepareSidebarForTour,
    clearSidebarAfterTour,
    onMesesGridTourFinished
  } = opts || {}

  if (!TOURS_ENABLED) return
  if (typeof window === 'undefined' || !natilleraId) return

  const isDesktopNav = window.innerWidth >= 1024
  const navSelector = isDesktopNav ? '#tour-sidebar-cuotas' : '#tour-bottom-nav-cuotas'
  const mesEjemplo = firstMonthLabel || 'ese mes'

  const run = () => {
    const elNav = document.querySelector(navSelector)
    if (!elNav) {
      clearSidebarAfterTour?.()
      markPrimerSocioCuotasMesGridTourDone(natilleraId)
      return
    }

    prepareSidebarForTour?.()

    const elPrimerMes = document.querySelector('#tour-cuotas-meses-primer-mes')

    const steps = [
      {
        element: navSelector,
        popover: {
          title: isDesktopNav ? 'Cuotas en el menú lateral' : 'Cuotas en la barra inferior',
          description: isDesktopNav
            ? '«Cuotas» es donde gestionas los aportes: revisas el estado de cada cuota y registras los pagos de los socios. Es la entrada a esta sección de cuotas y pagos de la natillera.'
            : '«Cuotas» en la barra inferior te lleva a los aportes y al registro de pagos. Úsalo para entrar siempre que vayas a cobrar o revisar cuotas.',
          side: isDesktopNav ? 'right' : 'top',
          align: 'center'
        }
      }
    ]

    if (elPrimerMes) {
      steps.push({
        element: '#tour-cuotas-meses-primer-mes',
        popover: {
          title: 'Elige un mes',
          description: `Toca un mes de la cuadrícula para abrir el detalle de ese período. Por ejemplo, al elegir «${mesEjemplo}» verás la información de los socios y podrás registrar pagos correspondientes a ${mesEjemplo}.`,
          side: 'top',
          align: 'center'
        }
      })
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
      showProgress: steps.length > 1,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Entendido',
      popoverClass: 'driver-popover-natillera',
      onDestroyed: () => {
        clearSidebarAfterTour?.()
        markPrimerSocioCuotasMesGridTourDone(natilleraId)
        setPendingCuotasDetalleTour(natilleraId)
        onMesesGridTourFinished?.({ natilleraId: String(natilleraId), firstMonthValue })
      },
      steps
    })

    d.drive(0)
  }

  window.requestAnimationFrame(() => {
    setTimeout(run, isDesktopNav ? 150 : 300)
  })
}

/**
 * Tour en Cuotas.vue (detalle del mes): tarjeta, Pagar (si aplica) y cambio de período
 * (tocar PERIODO → modal → elegir mes; si hay más de un mes en el período).
 * @param {{ natilleraId: string, onDone?: () => void, puedeDemoCambioMes?: boolean }} opts
 */
export function startPrimerCuotasDetalleSocioTour(opts) {
  const { natilleraId, onDone, puedeDemoCambioMes } = opts || {}
  if (!TOURS_ENABLED) return
  if (typeof window === 'undefined' || !natilleraId) return

  const run = (attempt = 0) => {
    const card = document.querySelector('#tour-primer-flujo-socio-cuota-card')
    const btnPagar = document.querySelector('#tour-primer-flujo-btn-pagar')

    const steps = []
    if (card) {
      steps.push({
        element: '#tour-primer-flujo-socio-cuota-card',
        popover: {
          title: 'Información del socio',
          description:
            'Aquí aparece la cuota de este socio en el mes: estado, montos y vencimiento. Puedes tocar la tarjeta para ver el detalle completo.',
          side: 'bottom',
          align: 'center'
        }
      })
    }
    if (btnPagar) {
      steps.push({
        element: '#tour-primer-flujo-btn-pagar',
        popover: {
          title: 'Registrar un aporte',
          description:
            'Con «Pagar» abres el registro de pago y puedes registrar un aporte (cuota, actividades y otros conceptos según corresponda).',
          side: 'top',
          align: 'center'
        }
      })
    }

    const desktopPeriodo = document.querySelector('#tour-cuotas-periodo-selector-desktop')
    const mobilePeriodo = document.querySelector('#tour-cuotas-periodo-selector-mobile')
    const periodoVisible = (el) => el && el.getClientRects().length > 0
    const periodoSelector = periodoVisible(desktopPeriodo)
      ? '#tour-cuotas-periodo-selector-desktop'
      : periodoVisible(mobilePeriodo)
        ? '#tour-cuotas-periodo-selector-mobile'
        : null

    if (periodoSelector && puedeDemoCambioMes) {
      steps.push({
        element: periodoSelector,
        disableActiveInteraction: false,
        onHighlighted: () => {
          esperandoAperturaModalMes = true
        },
        popover: {
          title: 'Abrir el selector de mes',
          description:
            'Toca el bloque junto a «PERIODO» (nombre del mes y año). Se abrirá la ventana con todos los meses del período de la natillera.',
          side: 'bottom',
          align: 'start'
        }
      })
      steps.push({
        element: () => document.querySelector('#tour-modal-selector-mes'),
        disableActiveInteraction: false,
        onHighlighted: () => {
          esperandoElegirMesEnModal = true
        },
        popover: {
          title: 'Elegir otro mes',
          description:
            'Toca el mes que quieras consultar. Al elegirlo, la ventana se cierra y la pantalla muestra las cuotas de ese mes.',
          side: 'top',
          align: 'center'
        }
      })
      steps.push({
        element: periodoSelector,
        popover: {
          title: 'Período actualizado',
          description:
            'El encabezado y la lista ya corresponden al mes elegido. Puedes repetir el proceso cuando quieras cambiar de período.',
          side: 'bottom',
          align: 'start'
        }
      })
    } else if (periodoSelector) {
      steps.push({
        element: periodoSelector,
        popover: {
          title: 'Cambiar de período',
          description:
            'Para ver u operar otro mes, toca el bloque junto a «PERIODO» y elige el mes en el selector. Si el período de la natillera solo tiene un mes, aquí verás solo ese mes.',
          side: 'bottom',
          align: 'start'
        }
      })
    }

    if (!steps.length) {
      if (attempt < 12) {
        window.setTimeout(() => run(attempt + 1), 200)
        return
      }
      onDone?.()
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
      showProgress: steps.length > 1,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Entendido',
      popoverClass: 'driver-popover-natillera',
      onDestroyed: () => {
        resetDetalleTourDriverState()
        onDone?.()
      },
      steps
    })

    detalleTourDriver = d
    d.drive(0)
  }

  window.requestAnimationFrame(() => {
    setTimeout(() => run(0), 350)
  })
}

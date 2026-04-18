import { driver } from 'driver.js'
import { TOURS_ENABLED } from '../config/toursEnabled'

/** Clave antigua (un solo tour): si existe, no se muestran los tours actuales. */
const LEGACY_STORAGE = (id) => `primer_socio_cuotas_mes_tour_v1_${id}`
const DETALLE_STORAGE = (id) => `primer_socio_cuotas_detalle_socio_tour_v1_${id}`

const SESSION_PENDING_DETALLE = (id) => `primer_cuotas_detalle_tour_pending_${id}`
const SESSION_SOCIO_ID = (id) => `primer_flujo_socio_natillera_id_${id}`

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

export function setPendingCuotasDetalleTour(natilleraId) {
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
 * Tour en Cuotas.vue (detalle del mes): tarjeta, Pagar (si aplica) y carrusel de meses.
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

    if (periodoSelector) {
      steps.push({
        element: periodoSelector,
        popover: {
          title: puedeDemoCambioMes ? 'Cambiar de mes' : 'Meses del período',
          description: puedeDemoCambioMes
            ? 'Desliza horizontalmente y toca cualquier mes para ver sus cuotas. El mes activo queda resaltado y la lista se actualiza al instante.'
            : 'Aquí se muestran los meses del período de la natillera. Si el período solo tiene un mes, aquí verás solo ese mes.',
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
        onDone?.()
      },
      steps
    })

    d.drive(0)
  }

  window.requestAnimationFrame(() => {
    setTimeout(() => run(0), 350)
  })
}

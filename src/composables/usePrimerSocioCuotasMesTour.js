import { driver } from 'driver.js'
import { isTourEnabled } from '../config/toursEnabled'

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

/** Devuelve true si hay marca pendiente sin consumirla (para decidir estado inicial de la vista). */
export function peekPendingPrimerSocioCuotasMesTour(natilleraId) {
  if (!natilleraId) return false
  try {
    return sessionStorage.getItem(SESSION_PENDING(String(natilleraId))) === '1'
  } catch {
    return false
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
  if (!isTourEnabled('primerSocioCuotasNav')) return false
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
  if (!isTourEnabled('cuotasDetalleSocio')) return false
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
 * En la vista de Socios, tras crear el primer socio: resalta «Cuotas» en la navegación
 * (barra lateral en escritorio, inferior en móvil) y espera a que el usuario la toque.
 * No navega solo ni muestra «Siguiente»: la única acción es tocar «Cuotas», que navega de
 * forma nativa. El recorrido continúa al aterrizar en la vista de Cuotas (Registrar Pago).
 * @param {{ natilleraId: string, prepareSidebarForTour?: () => void, clearSidebarAfterTour?: () => void }} opts
 */
export function startPrimerSocioCuotasNavHighlight(opts) {
  const { natilleraId, prepareSidebarForTour, clearSidebarAfterTour } = opts || {}
  if (!isTourEnabled('primerSocioCuotasNav')) return
  if (typeof window === 'undefined' || !natilleraId) return

  const isDesktop = window.innerWidth >= 1024
  const cuotasSelector = isDesktop ? '#tour-sidebar-cuotas' : '#tour-bottom-nav-cuotas'

  const run = (attempt = 0) => {
    if (isDesktop) prepareSidebarForTour?.()
    const el = document.querySelector(cuotasSelector)
    if (!el || el.getClientRects().length === 0) {
      if (attempt < 12) {
        window.setTimeout(() => run(attempt + 1), 200)
        return
      }
      clearSidebarAfterTour?.()
      return
    }

    const d = driver({
      animate: true,
      allowClose: true,
      disableActiveInteraction: true,
      overlayColor: '#14532d',
      overlayOpacity: 0.8,
      stagePadding: 10,
      stageRadius: 14,
      smoothScroll: true,
      showProgress: false,
      popoverClass: 'driver-popover-natillera',
      onDestroyed: () => {
        clearSidebarAfterTour?.()
      },
      steps: [
        {
          element: cuotasSelector,
          // Dejar que el clic llegue al ítem real para que navegue a Cuotas.
          disableActiveInteraction: false,
          onHighlighted: () => {
            const target = document.querySelector(cuotasSelector)
            if (!target) return
            const handler = () => {
              target.removeEventListener('click', handler)
              // La navegación la hace el propio ítem «Cuotas»; solo cerramos el resalte.
              try {
                d.destroy()
              } catch {
                /* ignore */
              }
            }
            target.addEventListener('click', handler, { once: true })
          },
          popover: {
            title: isDesktop ? 'Abre «Cuotas»' : 'Toca «Cuotas»',
            description: isDesktop
              ? 'Ya creaste tu primer socio. Ahora haz clic en «Cuotas» en el menú lateral para registrar su primer pago.'
              : 'Ya creaste tu primer socio. Ahora toca «Cuotas» en la barra inferior para registrar su primer pago.',
            side: isDesktop ? 'right' : 'top',
            align: 'center',
            // Forzar la acción: sin «Siguiente», solo se avanza tocando «Cuotas» (o se cierra con la X).
            showButtons: ['close']
          }
        }
      ]
    })

    d.drive(0)
  }

  window.requestAnimationFrame(() => {
    setTimeout(() => run(0), isDesktop ? 150 : 300)
  })
}

/**
 * Tour en la vista de Cuotas tras crear el primer socio: resalta el botón «Registrar Pago»
 * y espera a que el usuario lo toque para abrir el registro. No hay botón «Siguiente»: la
 * única acción es tocar «Registrar Pago» (o cerrar con la X).
 * @param {{ natilleraId: string, clearSidebarAfterTour?: () => void }} opts
 */
export function startPrimerSocioCuotasMesTour(opts) {
  const { natilleraId, clearSidebarAfterTour } = opts || {}

  if (!isTourEnabled('primerSocioCuotasNav')) return
  if (typeof window === 'undefined' || !natilleraId) return

  const run = (attempt = 0) => {
    // Resaltar el botón «Registrar Pago» visible según viewport (móvil o escritorio).
    const btnPagoMobile = document.querySelector('#tour-cuotas-registrar-pago-mobile')
    const btnPagoDesktop = document.querySelector('#tour-cuotas-registrar-pago-desktop')
    const pagoVisible = (el) => el && el.getClientRects().length > 0
    const btnPagoSelector = pagoVisible(btnPagoMobile)
      ? '#tour-cuotas-registrar-pago-mobile'
      : pagoVisible(btnPagoDesktop)
        ? '#tour-cuotas-registrar-pago-desktop'
        : null

    if (!btnPagoSelector) {
      // El botón aún no está visible (vista cargando): reintentar antes de rendirse.
      if (attempt < 12) {
        window.setTimeout(() => run(attempt + 1), 250)
        return
      }
      clearSidebarAfterTour?.()
      markPrimerSocioCuotasMesGridTourDone(natilleraId)
      return
    }

    const d = driver({
      animate: true,
      allowClose: true,
      disableActiveInteraction: true,
      overlayColor: '#14532d',
      overlayOpacity: 0.8,
      stagePadding: 10,
      stageRadius: 14,
      smoothScroll: true,
      showProgress: false,
      popoverClass: 'driver-popover-natillera',
      onDestroyed: () => {
        clearSidebarAfterTour?.()
        markPrimerSocioCuotasMesGridTourDone(natilleraId)
      },
      steps: [
        {
          element: btnPagoSelector,
          // Dejar que el clic llegue al botón real para que abra el registro de pago.
          disableActiveInteraction: false,
          onHighlighted: () => {
            const btn = document.querySelector(btnPagoSelector)
            if (!btn) return
            const handler = () => {
              btn.removeEventListener('click', handler)
              // El botón abre el registro de pago; solo cerramos el resalte.
              try {
                d.destroy()
              } catch {
                /* ignore */
              }
            }
            btn.addEventListener('click', handler, { once: true })
          },
          popover: {
            title: 'Registra el primer pago',
            description:
              'Toca «Registrar Pago» para abrir el registro: elegirás al socio y anotarás su aporte del mes (cuota, actividades y otros conceptos según corresponda).',
            side: 'bottom',
            align: 'center',
            // Forzar la acción: sin «Siguiente», solo se avanza tocando «Registrar Pago» (o se cierra con la X).
            showButtons: ['close']
          }
        }
      ]
    })

    d.drive(0)
  }

  window.requestAnimationFrame(() => {
    setTimeout(() => run(0), 300)
  })
}

/**
 * Tour en Cuotas.vue (detalle del mes): tarjeta, Pagar (si aplica) y cambio de período
 * (tocar PERIODO → modal → elegir mes; si hay más de un mes en el período).
 * @param {{ natilleraId: string, onDone?: () => void, puedeDemoCambioMes?: boolean }} opts
 */
export function startPrimerCuotasDetalleSocioTour(opts) {
  const { natilleraId, onDone, puedeDemoCambioMes } = opts || {}
  if (!isTourEnabled('cuotasDetalleSocio')) return
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
      overlayOpacity: 0.8,
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

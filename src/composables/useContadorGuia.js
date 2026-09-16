/**
 * Contador de visitas de un recorrido guiado (skill natillerapp-recorrido-guiado).
 *
 * El recorrido sale solo las DOS primeras visitas a una pantalla: en la primera se
 * entra a mirar y casi nadie retiene nada; en la segunda ya se sabe qué se busca.
 * Completarlo hasta el final lo da por visto del todo. La cuenta es por usuario:
 * la pantalla es la misma en todas sus natilleras.
 *
 * Mismo comportamiento que useTourDetalleNatillera.js, pero reutilizable: cada
 * pantalla crea el suyo con un nombre propio.
 *
 *   const contador = crearContadorGuia('cuotas')
 *   if (contador.debeMostrar(userId)) …
 *   contador.registrarVista(userId, { completado })
 */

export const VISITAS_CON_GUIA = 2

export function crearContadorGuia(nombre) {
  const clave = (userId) => `natillerapp_guia_${nombre}_v1_${userId}`
  const clavePendiente = `natillerapp_guia_${nombre}_pendiente`

  function leer(c) {
    try {
      return Number.parseInt(localStorage.getItem(c) ?? '0', 10) || 0
    } catch {
      // Safari en navegación privada puede lanzar al leer (manual iOS §15.4).
      return VISITAS_CON_GUIA
    }
  }

  function escribir(c, valor) {
    try {
      localStorage.setItem(c, String(valor))
    } catch {
      // Si no se puede recordar, el recorrido saldrá de más. Es preferible a romper.
    }
  }

  return {
    /** ¿Toca mostrarlo solo en esta visita? */
    debeMostrar(userId) {
      if (typeof window === 'undefined' || !userId) return false
      return leer(clave(userId)) < VISITAS_CON_GUIA
    },

    /** Suma una visita; si se completó, lo da por visto del todo. */
    registrarVista(userId, { completado = false } = {}) {
      if (typeof window === 'undefined' || !userId) return
      escribir(clave(userId), completado ? VISITAS_CON_GUIA : leer(clave(userId)) + 1)
    },

    /** Vuelve a mostrarlo en las próximas visitas. */
    reiniciar(userId) {
      if (typeof window === 'undefined' || !userId) return
      escribir(clave(userId), 0)
    },

    /** Fuerza el recorrido en la próxima entrada sin gastar visita (p. ej. tras un alta guiada). */
    pedir() {
      try { sessionStorage.setItem(clavePendiente, '1') } catch { /* modo privado */ }
    },

    hayPendiente() {
      try {
        return sessionStorage.getItem(clavePendiente) === '1'
      } catch {
        return false
      }
    },

    limpiarPendiente() {
      try { sessionStorage.removeItem(clavePendiente) } catch { /* nada que limpiar */ }
    }
  }
}

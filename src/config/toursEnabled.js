/**
 * Recorridos guiados (driver.js).
 *
 * Cada recorrido se habilita de forma independiente en `TOUR_FLAGS`. Usar
 * `isTourEnabled('nombre')` en el código para gatear cada tour. La lógica del
 * resto de recorridos permanece intacta aunque estén en `false`.
 */
export const TOUR_FLAGS = {
  /** Tras crear el primer socio: resalta «Socios» en la barra lateral / inferior. */
  primerSocioSociosNav: false,
  /** Recorrido corto del menú y «Acciones Natillera» (móvil) tras el primer socio. */
  natilleraMenu: false,
  /** Tras crear el primer socio: resalta «Cuotas» e indica que ahí se registran pagos. */
  primerSocioCuotasNav: true,
  /** Detalle del socio en Cuotas: tarjeta, «Pagar» y cambio de período. */
  cuotasDetalleSocio: false,
  /** Primera visita al detalle de la natillera: menú y sección «Acciones». */
  natilleraDetalleNav: false
}

/** True si un recorrido concreto está habilitado. */
export function isTourEnabled(name) {
  return TOUR_FLAGS[name] === true
}

/**
 * Master global: true si al menos un recorrido está habilitado.
 * Se conserva por compatibilidad con código/documentación que aún lo referencia.
 */
export const TOURS_ENABLED = Object.values(TOUR_FLAGS).some(Boolean)

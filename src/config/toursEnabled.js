/**
 * Recorridos guiados ANTIGUOS (driver.js). Todos apagados.
 *
 * El recorrido de la app es `RecorridoInteractivo.vue` (skill
 * natillerapp-recorrido-guiado): se dibuja sobre la pantalla real y es el único
 * que debe salir. Estos son los de driver.js, que enseñaban lo mismo con otro
 * lenguaje visual y podían encadenarse encima del estandarizado.
 *
 * Se dejan las banderas y su código en vez de borrarlos: el resalte de «Cuotas»
 * tras el primer socio sigue siendo útil y puede rehacerse con el recorrido
 * estandarizado cuando se decida. Para volver a encender uno basta poner su
 * bandera en `true`, pero antes hay que comprobar que no se solape con el
 * recorrido de esa pantalla.
 */
export const TOUR_FLAGS = {
  /** Tras crear el primer socio: resalta «Socios» en la barra lateral / inferior. */
  primerSocioSociosNav: false,
  /** Recorrido corto del menú y «Acciones Natillera» (móvil) tras el primer socio. */
  natilleraMenu: false,
  /** Tras crear el primer socio: resalta «Cuotas» e indica que ahí se registran pagos. */
  primerSocioCuotasNav: false,
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

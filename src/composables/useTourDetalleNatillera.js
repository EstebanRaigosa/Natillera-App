/**
 * Guía de bienvenida del detalle de la natillera.
 *
 * Sale UNA vez: la primera entrada a la pantalla con la natillera ya poblada.
 * Antes salía dos veces; se redujo a una porque quien quiera repasarla tiene el
 * botón «¿Cómo funciona?» en la cabecera, que la relanza sin gastar visitas.
 *
 * La primera entrada que cuenta es la primera con socios: si la natillera está
 * vacía, el detalle no tiene nada que enseñar y la vista ni siquiera la abre
 * (ver el watch de `cargandoNatillera` en NatilleraDetalle.vue). Al crear el
 * primer socio, Socios.vue llama a `pedirGuiaDetalle()` y sale entonces.
 */

/*
 * La cuenta es POR USUARIO, no por natillera. Quien ya vio la guía dos veces
 * aprendió a leer esta pantalla, y la pantalla es la misma en todas sus
 * natilleras: repetírsela en cada una sería castigar a quien más usa la app.
 */
const CLAVE = (userId) => `natillera_detalle_guia_v2_${userId}`
const VISITAS_CON_GUIA = 1

function leer(clave) {
  try {
    return Number.parseInt(localStorage.getItem(clave) ?? '0', 10) || 0
  } catch {
    // Safari en navegación privada puede lanzar al leer (manual iOS §15.4).
    return VISITAS_CON_GUIA
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, String(valor))
  } catch {
    // Si no se puede recordar, la guía saldrá de más. Es preferible a romper.
  }
}

/** ¿Toca mostrarla en esta visita? */
export function debeMostrarGuiaDetalle(userId) {
  if (typeof window === 'undefined' || !userId) return false
  return leer(CLAVE(userId)) < VISITAS_CON_GUIA
}

/** Registra que la guía ya se mostró: con una basta, se completara o no. */
export function registrarGuiaDetalleVista(userId, { completado = false } = {}) {
  if (typeof window === 'undefined' || !userId) return
  const clave = CLAVE(userId)
  escribir(clave, completado ? VISITAS_CON_GUIA : leer(clave) + 1)
}

/** Para volver a verla a voluntad (por ejemplo, desde un botón de ayuda). */
export function reiniciarGuiaDetalle(userId) {
  if (typeof window === 'undefined' || !userId) return
  escribir(CLAVE(userId), 0)
}

/**
 * Fuerza la guía en la próxima entrada al detalle, sin gastar visita.
 *
 * Lo usa el alta guiada: al crear el primer socio, la app lleva al detalle y
 * ahí la guía tiene que salir sí o sí, aunque el usuario ya la hubiera visto.
 */
const CLAVE_PENDIENTE = 'natillera_detalle_guia_pendiente'

export function pedirGuiaDetalle() {
  try {
    sessionStorage.setItem(CLAVE_PENDIENTE, '1')
  } catch { /* modo privado: la guía saldrá por el camino normal */ }
}

export function hayGuiaDetallePendiente() {
  try {
    return sessionStorage.getItem(CLAVE_PENDIENTE) === '1'
  } catch {
    return false
  }
}

export function limpiarGuiaDetallePendiente() {
  try {
    sessionStorage.removeItem(CLAVE_PENDIENTE)
  } catch { /* nada que limpiar */ }
}

export { VISITAS_CON_GUIA }

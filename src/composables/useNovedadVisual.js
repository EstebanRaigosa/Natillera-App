/**
 * Aviso de «la app cambió de cara», para quien ya usaba Natillerapp.
 *
 * Sale UNA sola vez por usuario, la primera vez que entra al detalle de una
 * natillera después del rediseño, y **antes** del recorrido guiado: primero se
 * explica que la pantalla cambió, y luego, si toca, se enseña.
 *
 * A quien estrena la app no se le muestra: para esa persona no hay «antes», y
 * un anuncio de cambios sobre algo que nunca vio solo confunde. El filtro es la
 * fecha de creación de la natillera: si nació antes del rediseño, su dueño ya
 * conocía la cara anterior.
 */

/**
 * Fecha del rediseño. Cambiarla al desplegar una renovación visual nueva, junto
 * con la versión de la clave, para volver a anunciarla.
 */
export const FECHA_REDISENO = '2026-09-16'

const CLAVE = (userId) => `natillerapp_novedad_visual_v1_${userId}`

function leer(clave) {
  try {
    return localStorage.getItem(clave) === '1'
  } catch {
    // Safari en navegación privada puede lanzar al leer (manual iOS §15.4).
    // Ante la duda, darlo por visto: mejor no avisar que avisar en cada entrada.
    return true
  }
}

/**
 * ¿Toca anunciar el cambio visual?
 *
 * @param {string} userId
 * @param {string} natilleraCreatedAt fecha ISO de creación de la natillera abierta
 */
export function debeMostrarNovedadVisual(userId, natilleraCreatedAt) {
  if (typeof window === 'undefined' || !userId) return false
  const creada = String(natilleraCreatedAt || '').slice(0, 10)
  if (!creada || creada >= FECHA_REDISENO) return false
  return !leer(CLAVE(userId))
}

/** Ya se mostró: no vuelve a salir. */
export function registrarNovedadVisualVista(userId) {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.setItem(CLAVE(userId), '1')
  } catch {
    // Si no se puede recordar, saldrá otra vez. Es preferible a romper la vista.
  }
}

/** Para volver a verlo a voluntad (pruebas). */
export function reiniciarNovedadVisual(userId) {
  if (typeof window === 'undefined' || !userId) return
  try {
    localStorage.removeItem(CLAVE(userId))
  } catch { /* nada que limpiar */ }
}

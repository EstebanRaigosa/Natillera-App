/** Número de íconos en el set rotativo del dashboard */
export const NATILLERA_DASHBOARD_ICON_COUNT = 20

/**
 * Índice 0..19 para NatilleraDashboardIcon.
 * Usa `dashboard_icon` de la fila; si falta, reparte por hash del id.
 */
export function resolveDashboardIconIndex(natillera) {
  const n = natillera?.dashboard_icon
  if (typeof n === 'number' && !Number.isNaN(n)) {
    const i = Math.floor(n)
    if (i >= 0 && i < NATILLERA_DASHBOARD_ICON_COUNT) return i
  }
  const id = String(natillera?.id ?? '')
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) >>> 0
  }
  return h % NATILLERA_DASHBOARD_ICON_COUNT
}

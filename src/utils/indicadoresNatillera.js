/**
 * Los dos indicadores de dinero de una natillera, en un solo sitio.
 *
 * «Recaudado» y «Utilidad» se muestran en dos pantallas distintas —los indicadores
 * del detalle y la tarjeta del dashboard— y tienen que dar exactamente lo mismo.
 * Antes la fórmula vivía suelta en un `computed` del detalle y el dashboard mostraba
 * otra cosa (el fondo total), así que los números no cuadraban.
 *
 * Las dos toman el objeto de estadísticas del store, ya venga de
 * `calcularEstadisticas` (detalle) o de `calcularEstadisticasParaDashboard` (lista).
 */

/**
 * Recaudado: lo que ha entrado, menos lo que salió de ese bolsillo.
 *
 * La base son los pagos incluyendo parciales; se cae a los valores antiguos cuando
 * una estadística no los trae. Los egresos e ingresos son los movimientos del libro
 * marcados contra «recaudado» (los premios de rifa ya están descontados en la base).
 */
export function recaudadoIndicador(stats = {}) {
  const base = stats.totalRecaudadoNetoInclParciales
    ?? stats.totalRecaudadoNeto
    ?? stats.totalAportado
    ?? 0
  return Math.max(0, base - (stats.egresosRecaudado ?? 0) + (stats.ingresosRecaudado ?? 0))
}

/** Utilidad: lo ganado (sanciones, actividades, intereses) menos lo que salió de ahí. */
export function utilidadIndicador(stats = {}) {
  return Math.max(
    0,
    (stats.utilidadesRecogidas || 0)
    - (stats.egresosUtilidades ?? 0)
    + (stats.ingresosUtilidades ?? 0)
  )
}

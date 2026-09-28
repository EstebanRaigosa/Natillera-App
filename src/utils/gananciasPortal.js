/*
 * Ganancias del socio para el portal, con la administración ya descontada.
 *
 * El socio no ve la administración como una línea aparte: se le resta de sus ganancias,
 * repartida entre los conceptos en la misma proporción, y su ahorro queda intacto (el
 * mismo que ve en Cuotas). Así «ahorro + ganancias − lo que debes = recibirías» cuadra
 * sin mostrarle el porcentaje. El redondeo lo absorbe el concepto más grande.
 *
 * Lo usa la app del admin al guardar la foto del portal (para que el dato ni siquiera
 * llegue) y el propio portal, para las fotos guardadas antes de este cambio.
 */
function round2(n) {
  return Math.round(n * 100) / 100
}

export function gananciasSinAdministracion({ utilidadesTotal, utilidadesPorConcepto, aporteAdministracion }) {
  const total = Number(utilidadesTotal) || 0
  const administracion = Number(aporteAdministracion) || 0
  const conceptos = { ...(utilidadesPorConcepto || {}) }
  if (administracion <= 0) return { utilidadesTotal: total, utilidadesPorConcepto: conceptos }

  const neto = round2(total - administracion)
  if (total <= 0) return { utilidadesTotal: neto, utilidadesPorConcepto: conceptos }

  const factor = neto / total
  Object.keys(conceptos).forEach(tipo => { conceptos[tipo] = round2((Number(conceptos[tipo]) || 0) * factor) })
  const suma = round2(Object.values(conceptos).reduce((s, v) => s + v, 0))
  const mayor = Object.keys(conceptos).sort((a, b) => conceptos[b] - conceptos[a])[0]
  if (mayor) conceptos[mayor] = round2(conceptos[mayor] + neto - suma)
  return { utilidadesTotal: neto, utilidadesPorConcepto: conceptos }
}

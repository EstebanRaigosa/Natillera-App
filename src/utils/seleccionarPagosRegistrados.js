/** Pagos de Cuotas elegidos; excluye pagos realizados desde Préstamos o Actividades. */
export function seleccionarPagosRegistrados(pagos, cuotasElegidas, abonosElegidos) {
  const resultado = []
  const vistos = new Set()
  for (const { cuota, historial, transaccion } of pagos) {
    if (!cuotasElegidas.has(cuota.id)) continue
    if (historial.length === 0) {
      const total = Number(cuota.valor_pagado || 0) + Number(cuota.valor_pagado_sancion || 0)
        + Number(cuota.valor_pagado_actividades || 0)
      if (total > 0) resultado.push({ cuotaId: cuota.id, directo: true })
      continue
    }
    const elegidos = abonosElegidos.get(cuota.id)
    for (const h of historial) {
      if (elegidos && !elegidos.has(h.id)) continue
      if (!elegidos && transaccion && !transaccion.some(t => t.id === h.id)) continue
      if (!h.id || vistos.has(h.id)) continue
      vistos.add(h.id)
      resultado.push({ cuotaId: cuota.id, historialId: h.id, directo: false })
    }
  }
  // Deshacer los abonos en orden inverso al que se presentan.
  return resultado.reverse()
}

/** Detiene el lote ante un fallo o una reversión incompleta, sin repetir lo ya eliminado. */
export async function eliminarPagosSeleccionados(pagos, eliminar) {
  const eliminados = []
  for (const pago of pagos) {
    let res
    try {
      res = await eliminar(pago)
    } catch (error) {
      res = { success: false, error: error.message || 'No se pudo eliminar el pago' }
    }
    if (!res.success) return { eliminados, error: res.error || 'No se pudo eliminar el pago', problemas: res.problemas || [] }
    eliminados.push(pago)
    if (res.problemas?.length) return { eliminados, error: '', problemas: res.problemas }
  }
  return { eliminados, error: '', problemas: [] }
}

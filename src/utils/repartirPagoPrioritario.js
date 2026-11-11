const entero = valor => Math.max(0, Math.round(Number(valor) || 0))
const gmf = valor => Math.round(valor * 4 / 1000)

/**
 * Reparte un monto bruto entre todas las obligaciones del socio, por concepto y luego
 * por antigüedad. Las filas deben venir ordenadas y sus conceptos no deben repetirse.
 * Devuelve el resumen por cuota y los abonos en el orden en que deben registrarse.
 * El GMF se calcula sobre el acumulado de cada cuota para no multiplicar redondeos.
 */
export function repartirPagoPrioritario(filas, monto = Infinity, conGmf = false) {
  let restante = Math.max(0, monto)
  let agotado = false
  const pagos = new Map()
  const pasos = []
  const impuesto = neto => conGmf ? gmf(neto) : 0

  function asignar(fila, pendiente, concepto, detalle) {
    pendiente = entero(pendiente)
    if (!pendiente || restante <= 0 || agotado) return
    const previo = pagos.get(fila.cuota.id)
    const netoAntes = previo?.valorPagado || 0
    const costo = valor => valor + impuesto(netoAntes + valor) - impuesto(netoAntes)
    let minimo = 0, maximo = pendiente
    while (minimo < maximo) {
      const medio = Math.ceil((minimo + maximo) / 2)
      if (costo(medio) <= restante) minimo = medio
      else maximo = medio - 1
    }
    const valor = minimo
    if (valor < pendiente) agotado = true
    if (!valor) return
    const impuestoDelta = impuesto(netoAntes + valor) - impuesto(netoAntes)
    restante -= valor + impuestoDelta
    const pago = previo || { cuota: fila.cuota, periodo: fila.periodo, valorPagado: 0, impuesto4x1000: 0, multa: 0, actividades: [], prestamo: [] }
    const paso = { cuota: fila.cuota, periodo: fila.periodo, fecha: fila.fecha, multa: 0, valorPagado: valor, impuesto4x1000: impuestoDelta, actividades: [], prestamo: [] }
    if (concepto === 'multa') {
      pago.multa += valor
      // El store necesita el pendiente completo para reconocer un abono parcial.
      paso.multa = pendiente
    } else if (concepto === 'actividad') {
      const actividad = { ...detalle, valor_pendiente: valor }
      pago.actividades.push(actividad)
      paso.actividades.push(actividad)
    } else if (concepto === 'prestamo') {
      const mora = Math.min(valor, entero(detalle.mora))
      const capital = valor - mora
      const prestamo = { ...detalle, mora, valor_pendiente: capital, pagado: capital >= entero(detalle.valor_pendiente) }
      pago.prestamo.push(prestamo)
      paso.prestamo.push(prestamo)
    }
    pago.valorPagado += valor
    pago.impuesto4x1000 += impuestoDelta
    pagos.set(fila.cuota.id, pago)
    pasos.push(paso)
  }

  // Las cuotas futuras se atienden después de saldar lo vencido.
  const grupos = [filas.filter(f => f.vencida !== false), filas.filter(f => f.vencida === false)]
  for (const grupo of grupos) {
    for (const fila of grupo) asignar(fila, fila.multa, 'multa')
    for (const fila of grupo) for (const actividad of fila.actividades) asignar(fila, actividad.valor_pendiente, 'actividad', actividad)
    for (const fila of grupo) for (const prestamo of fila.prestamo) asignar(fila, entero(prestamo.valor_pendiente) + entero(prestamo.mora), 'prestamo', prestamo)
    for (const fila of grupo) asignar(fila, fila.cuotaPend, 'cuota')
  }

  return { pagos: [...pagos.values()], pasos, sobrante: restante }
}

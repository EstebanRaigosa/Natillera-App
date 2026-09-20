/**
 * Cálculo financiero de préstamos: interés, plan de cuotas y refinanciación.
 *
 * Única fuente de las fórmulas. Antes vivían copiadas en cinco sitios de
 * Prestamos.vue y se desincronizaron (el «compuesto» cobraba casi el doble y el
 * desglose capital/interés de cada cuota no cuadraba con el interés pactado).
 *
 * Todo en pesos enteros. Las fechas del plan las pone la vista; aquí solo montos.
 *
 * IMPORTANTE: estas fórmulas se usan al CREAR o REFINANCIAR. Los préstamos ya
 * guardados conservan su plan y su `interes_total`: nunca se recalculan con esto.
 */

/** Tasa del periodo (fracción). Quincenal = tasa mensual nominal / 2. */
export function tasaPeriodica(tasaMensualPct, periodicidad = 'mensual') {
  const mensual = (Number(tasaMensualPct) || 0) / 100
  return periodicidad === 'quincenal' ? mensual / 2 : mensual
}

/**
 * Interés total y cuota de un préstamo.
 *
 * - simple: interés fijo sobre el monto prestado → I = C · i · n, cuotas iguales.
 * - compuesto: sistema francés (cuota fija, interés sobre saldo de capital) →
 *   cuota = C · i / (1 − (1 + i)^−n), I = cuota · n − C.
 *   Es como liquidan el interés compuesto los bancos y cooperativas en Colombia.
 */
export function calcularCondicionesPrestamo({ capital, tasaMensual, numeroCuotas, periodicidad = 'mensual', tipoInteres = 'simple' }) {
  const C = Math.max(0, Math.round(Number(capital) || 0))
  const n = Math.max(1, Math.floor(Number(numeroCuotas) || 1))
  const i = tasaPeriodica(tasaMensual, periodicidad)

  if (tipoInteres === 'compuesto') {
    if (i <= 0) return { interesTotal: 0, valorCuota: Math.round(C / n), totalAPagar: C }
    const cuota = (C * i) / (1 - Math.pow(1 + i, -n))
    const interesTotal = Math.round(cuota * n - C)
    return { interesTotal, valorCuota: Math.round(cuota), totalAPagar: C + interesTotal }
  }

  const interesTotal = Math.round(C * i * n)
  return { interesTotal, valorCuota: Math.round((C + interesTotal) / n), totalAPagar: C + interesTotal }
}

/** Reparte `total` en `n` partes enteras iguales; la última absorbe el redondeo. */
function repartirIgual(total, n) {
  const base = Math.round(total / n)
  return Array.from({ length: n }, (_, k) => (k === n - 1 ? total - base * (n - 1) : base))
}

/**
 * Desglose de cuotas: capital, interés, valor y saldo proyectado.
 *
 * Garantías (las verifica scripts/verificar-calculo-prestamos.mjs):
 *   Σ capital = capital (+ diferido si va en capital)
 *   Σ interés = interesTotal (+ diferido si va en interés)
 *   Σ valor   = total a pagar, y el saldo proyectado de la última cuota es 0.
 *
 * - simple: capital C/n e interés I/n por cuota.
 * - compuesto (francés): interés de la cuota = saldo de capital × i.
 * Normal o anticipado no cambia el desglose: el socio paga lo mismo y solo cambia
 * cuándo se reconoce la utilidad (anticipado: toda al crear; normal: por cuota pagada).
 * `interesAnticipado` se acepta por compatibilidad y no afecta los montos.
 *
 * `interesDiferido`: interés vencido de un ciclo anterior que se cobra en las
 * nuevas cuotas SIN generar interés (refinanciación). `diferidoEnCapital` lo
 * suma a la columna capital en vez de interés: se usa cuando ese interés ya
 * se registró como utilidad (préstamos anticipados) para no contarlo dos veces.
 */
export function generarDesgloseCuotas({
  capital,
  interesTotal,
  tasaMensual,
  numeroCuotas,
  periodicidad = 'mensual',
  tipoInteres = 'simple',
  interesAnticipado = false,
  interesDiferido = 0,
  diferidoEnCapital = false
}) {
  const C = Math.max(0, Math.round(Number(capital) || 0))
  const I = Math.max(0, Math.round(Number(interesTotal) || 0))
  const D = Math.max(0, Math.round(Number(interesDiferido) || 0))
  const n = Math.max(1, Math.floor(Number(numeroCuotas) || 1))
  const i = tasaPeriodica(tasaMensual, periodicidad)

  const diferidos = repartirIgual(D, n)
  let capitales
  let intereses

  if (tipoInteres === 'compuesto' && i > 0 && I > 0) {
    const cuotaFr = Math.round((C * i) / (1 - Math.pow(1 + i, -n)))
    capitales = []
    intereses = []
    let saldoCapital = C
    let interesAcumulado = 0
    for (let k = 0; k < n; k++) {
      if (k === n - 1) {
        // Última cuota: liquida el capital restante y ajusta el interés al pactado
        capitales.push(saldoCapital)
        intereses.push(Math.max(0, I - interesAcumulado))
        break
      }
      const interesCuota = Math.round(saldoCapital * i)
      const capitalCuota = Math.min(saldoCapital, Math.max(0, cuotaFr - interesCuota))
      capitales.push(capitalCuota)
      intereses.push(interesCuota)
      saldoCapital -= capitalCuota
      interesAcumulado += interesCuota
    }
  } else {
    capitales = repartirIgual(C, n)
    intereses = repartirIgual(I, n)
  }

  const total = C + I + D
  let pagado = 0
  return capitales.map((cap, k) => {
    const capitalCuota = cap + (diferidoEnCapital ? diferidos[k] : 0)
    const interesCuota = intereses[k] + (diferidoEnCapital ? 0 : diferidos[k])
    const valorCuota = capitalCuota + interesCuota
    pagado += valorCuota
    return {
      numero_cuota: k + 1,
      valor_cuota: valorCuota,
      capital: capitalCuota,
      interes: interesCuota,
      saldo_proyectado: Math.max(0, total - pagado)
    }
  })
}

/**
 * ¿El plan guardado reparte bien el capital? Los planes generados antes de esta
 * corrección (interés normal) tienen la columna capital descuadrada; para ellos
 * el capital pendiente se estima en proporción capital / total del préstamo.
 */
function planCuadraCapital(plan, monto) {
  if (!plan.length) return false
  const suma = plan.reduce((s, c) => s + (Number(c.capital) || 0), 0)
  const tolerancia = Math.max(plan.length * 2, monto * 0.005)
  return plan.every((c) => (Number(c.capital) || 0) >= 0) && Math.abs(suma - monto) <= tolerancia
}

/**
 * Qué se debe realmente de un préstamo a una fecha de corte.
 *
 *   capitalPendiente: capital aún no amortizado.
 *   interesVencido:   interés de cuotas ya vencidas y no pagadas (ganado, no cobrado).
 *   interesFuturo:    interés de cuotas que aún no vencen (no se ha ganado).
 *
 * `fechaCorte` en ISO (YYYY-MM-DD); una cuota está vencida si su fecha proyectada
 * es anterior al corte.
 */
export function calcularDeudaAFecha({ prestamo, plan = [], fechaCorte }) {
  const monto = Number(prestamo?.monto) || 0
  const interesTotal = Number(prestamo?.interes_total) || 0
  const saldoActual = Math.max(0, Number(prestamo?.saldo_actual) || 0)
  const corte = String(fechaCorte || '').slice(0, 10)

  const pendienteDe = (c) => {
    const valor = Number(c.valor_cuota) || 0
    const pagado = Math.min(valor, Number(c.valor_pagado) || 0)
    return { valor, pendiente: c.pagada ? 0 : Math.max(0, valor - pagado) }
  }
  const esVencida = (c) => String(c.fecha_proyectada || '').slice(0, 10) < corte

  let capitalPendiente = 0
  let interesVencido = 0

  if (planCuadraCapital(plan, monto)) {
    for (const c of plan) {
      const { valor, pendiente } = pendienteDe(c)
      if (pendiente <= 0 || valor <= 0) continue
      const proporcion = pendiente / valor
      capitalPendiente += (Number(c.capital) || 0) * proporcion
      if (esVencida(c)) interesVencido += (Number(c.interes) || 0) * proporcion
    }
  } else {
    const factorCapital = monto + interesTotal > 0 ? monto / (monto + interesTotal) : 1
    capitalPendiente = saldoActual * factorCapital
    const pendienteVencido = plan.filter(esVencida).reduce((s, c) => s + pendienteDe(c).pendiente, 0)
    interesVencido = pendienteVencido * (1 - factorCapital)
  }

  capitalPendiente = Math.round(Math.min(capitalPendiente, saldoActual))
  interesVencido = Math.round(Math.min(interesVencido, saldoActual - capitalPendiente))
  const interesFuturo = Math.max(0, saldoActual - capitalPendiente - interesVencido)

  return { saldoActual, capitalPendiente, interesVencido, interesFuturo }
}

/**
 * Refinanciación como en un crédito real:
 *   1. La base del nuevo interés es SOLO el capital pendiente.
 *   2. El interés vencido no pagado se difiere en las nuevas cuotas sin cobrarle
 *      interés (cobrar interés sobre interés atrasado es anatocismo, art. 2235 C.C.).
 *   3. El interés futuro del plan anterior se elimina: no se había ganado y se
 *      reemplaza por el interés de las nuevas condiciones.
 *   4. La mora no se capitaliza (la vista la muestra para cobrarla antes).
 */
export function calcularRefinanciacion({ prestamo, plan = [], fechaCorte, tasaMensual, numeroCuotas, tipoInteres = 'simple' }) {
  const deuda = calcularDeudaAFecha({ prestamo, plan, fechaCorte })
  const periodicidad = prestamo?.periodicidad || 'mensual'
  const condiciones = calcularCondicionesPrestamo({
    capital: deuda.capitalPendiente,
    tasaMensual,
    numeroCuotas,
    periodicidad,
    tipoInteres
  })
  // En anticipado el interés vencido ya es utilidad registrada: viaja como capital.
  const diferidoEnCapital = !!prestamo?.interes_anticipado
  const desglose = generarDesgloseCuotas({
    capital: deuda.capitalPendiente,
    interesTotal: condiciones.interesTotal,
    tasaMensual,
    numeroCuotas,
    periodicidad,
    tipoInteres,
    interesAnticipado: !!prestamo?.interes_anticipado,
    interesDiferido: deuda.interesVencido,
    diferidoEnCapital
  })
  const totalAPagar = deuda.capitalPendiente + condiciones.interesTotal + deuda.interesVencido

  return {
    ...deuda,
    interesNuevo: condiciones.interesTotal,
    diferidoEnCapital,
    // Lo que queda guardado en el préstamo para el nuevo ciclo
    montoNuevo: deuda.capitalPendiente + (diferidoEnCapital ? deuda.interesVencido : 0),
    interesTotalNuevo: condiciones.interesTotal + (diferidoEnCapital ? 0 : deuda.interesVencido),
    totalAPagar,
    valorCuota: desglose[0]?.valor_cuota || 0,
    desglose
  }
}

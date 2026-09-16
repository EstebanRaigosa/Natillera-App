// Verifica que el plan de pagos cuadre para todas las combinaciones de préstamo.
// Uso: node scripts/verificar-calculo-prestamos.mjs  (sale con código 1 si algo falla)
import {
  calcularCondicionesPrestamo,
  generarDesgloseCuotas,
  calcularDeudaAFecha,
  calcularRefinanciacion
} from '../src/utils/calculoPrestamos.js'

let fallos = 0
let casos = 0
const fallar = (msg, ctx) => {
  fallos++
  if (fallos <= 20) console.error('✗', msg, JSON.stringify(ctx))
}
const suma = (arr, k) => arr.reduce((s, c) => s + c[k], 0)

// 1. Referencia conocida: $1.000.000 al 2 % mensual en 12 cuotas
const ref = calcularCondicionesPrestamo({ capital: 1_000_000, tasaMensual: 2, numeroCuotas: 12, tipoInteres: 'compuesto' })
if (ref.valorCuota !== 94_560 || ref.interesTotal !== 134_715) fallar('francés de referencia', ref)
const refSimple = calcularCondicionesPrestamo({ capital: 1_000_000, tasaMensual: 2, numeroCuotas: 12, tipoInteres: 'simple' })
if (refSimple.interesTotal !== 240_000) fallar('simple de referencia', refSimple)

// 2. Cuadre del desglose en todas las combinaciones
for (const tipoInteres of ['simple', 'compuesto']) {
  for (const interesAnticipado of [false, true]) {
    for (const periodicidad of ['mensual', 'quincenal']) {
      for (const tasaMensual of [0, 1.5, 2, 5, 8, 12]) {
        for (const numeroCuotas of [1, 2, 3, 5, 6, 12, 36]) {
          for (const capital of [10_000, 300_000, 748_582, 1_000_000, 9_999_999]) {
            for (const interesDiferido of [0, 25_201]) {
              for (const diferidoEnCapital of [false, true]) {
                casos++
                const ctx = { tipoInteres, interesAnticipado, periodicidad, tasaMensual, numeroCuotas, capital, interesDiferido, diferidoEnCapital }
                const { interesTotal } = calcularCondicionesPrestamo({ capital, tasaMensual, numeroCuotas, periodicidad, tipoInteres })
                const plan = generarDesgloseCuotas({ ...ctx, interesTotal })
                const capEsperado = capital + (diferidoEnCapital ? interesDiferido : 0)
                const intEsperado = interesTotal + (diferidoEnCapital ? 0 : interesDiferido)
                if (plan.length !== numeroCuotas) fallar('número de cuotas', ctx)
                if (suma(plan, 'capital') !== capEsperado) fallar('Σ capital', { ...ctx, obtenido: suma(plan, 'capital'), capEsperado })
                if (suma(plan, 'interes') !== intEsperado) fallar('Σ interés', { ...ctx, obtenido: suma(plan, 'interes'), intEsperado })
                if (plan.some((c) => c.capital < 0 || c.interes < 0)) fallar('valores negativos', ctx)
                if (plan.some((c) => c.valor_cuota !== c.capital + c.interes)) fallar('valor ≠ capital + interés', ctx)
                if (plan[plan.length - 1].saldo_proyectado !== 0) fallar('saldo final ≠ 0', ctx)
                // Francés: cuotas iguales salvo la última (ajuste de redondeo de pocos pesos)
                if (tipoInteres === 'compuesto' && interesDiferido === 0 && numeroCuotas > 2 && tasaMensual > 0) {
                  const primera = plan[0].valor_cuota
                  if (plan.slice(0, -1).some((c) => Math.abs(c.valor_cuota - primera) > 1)) fallar('francés con cuotas desiguales', ctx)
                  if (Math.abs(plan[plan.length - 1].valor_cuota - primera) > numeroCuotas) fallar('última cuota francés muy distinta', ctx)
                }
              }
            }
          }
        }
      }
    }
  }
}

// 3. Refinanciación: ejemplo simple de $1.000.000 al 2 % en 12 cuotas, 6 pagadas y 2 vencidas sin pagar
{
  casos++
  const interesTotal = 240_000
  const plan = generarDesgloseCuotas({ capital: 1_000_000, interesTotal, tasaMensual: 2, numeroCuotas: 12 })
    .map((c, k) => ({ ...c, fecha_proyectada: `2026-${String(k + 1).padStart(2, '0')}-10`, pagada: k < 4, valor_pagado: k < 4 ? c.valor_cuota : 0 }))
  const pagado = plan.filter((c) => c.pagada).reduce((s, c) => s + c.valor_cuota, 0)
  const prestamo = { monto: 1_000_000, interes_total: interesTotal, saldo_actual: 1_240_000 - pagado, periodicidad: 'mensual' }
  // Corte 2026-06-15: cuotas 5 y 6 vencidas sin pagar
  const deuda = calcularDeudaAFecha({ prestamo, plan, fechaCorte: '2026-06-15' })
  const esperado = { capitalPendiente: 666_668, interesVencido: 40_000 }
  if (Math.abs(deuda.capitalPendiente - esperado.capitalPendiente) > 5 || deuda.interesVencido !== esperado.interesVencido) {
    fallar('deuda a fecha', { deuda, esperado })
  }
  const refin = calcularRefinanciacion({ prestamo, plan, fechaCorte: '2026-06-15', tasaMensual: 2, numeroCuotas: 6, tipoInteres: 'simple' })
  if (refin.interesNuevo !== Math.round(deuda.capitalPendiente * 0.02 * 6)) fallar('interés nuevo sobre capital', refin)
  if (suma(refin.desglose, 'interes') !== refin.interesTotalNuevo) fallar('Σ interés refinanciación', refin)
  if (suma(refin.desglose, 'capital') !== refin.montoNuevo) fallar('Σ capital refinanciación', refin)
  if (refin.totalAPagar !== suma(refin.desglose, 'valor_cuota')) fallar('total refinanciación', refin)
  console.log('Refinanciación de ejemplo:', {
    saldoAnterior: deuda.saldoActual,
    capitalPendiente: refin.capitalPendiente,
    interesVencidoDiferido: refin.interesVencido,
    interesFuturoEliminado: refin.interesFuturo,
    interesNuevo: refin.interesNuevo,
    totalAPagar: refin.totalAPagar,
    cuota: refin.valorCuota
  })
}

// 4. Plan antiguo descuadrado (generado antes de la corrección): estimación proporcional
{
  casos++
  const prestamo = { monto: 1_000_000, interes_total: 240_000, saldo_actual: 620_000 }
  const planViejo = Array.from({ length: 12 }, (_, k) => ({ valor_cuota: 103_333, capital: 90_000, interes: 13_333, pagada: k < 6, valor_pagado: k < 6 ? 103_333 : 0, fecha_proyectada: `2026-${String(k + 1).padStart(2, '0')}-10` }))
  const deuda = calcularDeudaAFecha({ prestamo, plan: planViejo, fechaCorte: '2026-07-01' })
  if (deuda.capitalPendiente !== 500_000) fallar('capital pendiente proporcional', deuda)
}

console.log(`Casos: ${casos} · Fallos: ${fallos}`)
console.log('Compuesto 1.000.000 al 2 % en 12:', ref, '· Simple:', refSimple)
process.exit(fallos > 0 ? 1 : 0)

import { useCuotasStore } from '../stores/cuotas'
import { pagarActividadesDeCuota, pagarCuotasPrestamoDeCuota } from './usePagoConceptosCuota'

/*
 * Registrar UNA cuota con todos sus conceptos completos: lo que falta de la cuota, su
 * sanción, las actividades y las cuotas de préstamo que se cobran con ella, y el 4×1000.
 *
 * Es el mismo camino del pago normal (cuotasStore.registrarPago + usePagoConceptosCuota).
 * Vivía dentro de la carga rápida; se sacó aquí para que el pago rápido de un socio
 * registre exactamente igual.
 */

/** 4×1000 (GMF) sobre lo que va a conceptos. Mismo redondeo que el modal de pago. */
export function calcular4x1000(neto) {
  const n = Math.max(0, Math.floor(Number(neto) || 0))
  return n === 0 ? 0 : Math.round((n * 4) / 1000)
}

/**
 * @param {object} p
 * @param {object} p.pago - { cuota, fecha, multa, valorPagado, actividades, prestamo }
 *   · actividades: filas de `socios_actividad` con `actividad` y `valor_pendiente`
 *   · prestamo: filas de `plan_pagos_prestamo` con `valor_pendiente` y `mora` (a la fecha del pago)
 * @param {object} p.socio - { nombre, periodicidad }
 * @param {string} p.natilleraId
 * @param {string} [p.natilleraNombre]
 * @param {'efectivo'|'transferencia'} p.formaPago
 * @param {boolean} [p.cobrar4x1000] - solo cuenta con transferencia
 * @returns {Promise<{ ok: boolean, historialPagoId?: string|null }>}
 */
export async function registrarPagoCompletoDeCuota({ pago, socio, natilleraId, natilleraNombre = null, formaPago, cobrar4x1000 = false }) {
  const cuotasStore = useCuotasStore()
  const totalActs = pago.actividades.reduce((s, a) => s + a.valor_pendiente, 0)
  const totalPrest = pago.prestamo.reduce((s, cp) => s + cp.valor_pendiente, 0)
  // Mora de las cuotas de préstamo (ya calculada a la fecha del pago). Es dinero que entra
  // con este pago y va a préstamos, pero no baja el saldo: va al fondo, como en Préstamos.
  const totalMora = pago.prestamo.reduce((s, cp) => s + (Number(cp.mora) || 0), 0)
  const efectivo = formaPago === 'efectivo'
  const impuesto4x1000 = !efectivo && cobrar4x1000 ? calcular4x1000(pago.valorPagado) : 0

  const res = await cuotasStore.registrarPago(pago.cuota.id, pago.valorPagado, null, formaPago, totalActs, {
    valorEfectivo: efectivo ? pago.valorPagado : 0,
    valorTransferencia: efectivo ? 0 : pago.valorPagado,
    impuesto4x1000,
    fechaPago: pago.fecha,
    sancionAFecha: pago.multa,
    // El store reparte el pago: sanción, actividades, préstamos (hasta este tope) y cuota.
    // La mora suma al tope para que no se tome como pago de la cuota natillera.
    valorCuotasPrestamos: totalPrest + totalMora,
    totalAPagar: pago.valorPagado,
    detalleActividades: pago.actividades.map(a => ({
      socio_actividad_id: a.id,
      nombre: a.actividad?.descripcion || 'Actividad',
      tipo: a.actividad?.tipo || 'otro',
      valor: a.valor_pendiente
    })),
    detalleCuotasPrestamos: pago.prestamo.map(cp => ({
      nombre: `Cuota préstamo #${cp.numero_cuota}`,
      // `valor` es solo lo abonado a la cuota (la reversión lo resta del plan); la mora va aparte
      valor: cp.valor_pendiente,
      mora: Number(cp.mora) || 0,
      numero_cuota: cp.numero_cuota,
      prestamo_id: cp.prestamo_id,
      pagado: true
    })),
    omitirRecalculoMora: true,
    _socioNombre: socio?.nombre,
    _natilleraNombre: natilleraNombre,
    _socioNatilleraId: pago.cuota.socio_natillera_id,
    _natilleraId: natilleraId,
    _periodicidadSocio: socio?.periodicidad
  })
  if (!res?.success) return { ok: false }

  const opciones = {
    fechaPago: pago.fecha,
    valorPagado: pago.valorPagado,
    valorEfectivo: efectivo ? pago.valorPagado : 0,
    valorTransferencia: efectivo ? 0 : pago.valorPagado,
    historialPagoIdPromise: res.historialPagoIdPromise
  }
  await Promise.all([
    totalActs > 0 && pagarActividadesDeCuota({
      natilleraId,
      actividades: pago.actividades.map(a => ({
        id: a.id,
        actividad_id: a.actividad_id,
        actividad: a.actividad,
        valor_pendiente: a.valor_pendiente,
        valor_pagado_actual: parseFloat(a.valor_pagado) || 0,
        valor_asignado: parseFloat(a.valor_asignado) || 0
      })),
      valorTotal: totalActs,
      tipoPago: formaPago,
      options: opciones
    }),
    (totalPrest + totalMora) > 0 && pagarCuotasPrestamoDeCuota({
      cuotaId: pago.cuota.id,
      natilleraId,
      nombreSocio: socio?.nombre || null,
      nombreNatillera: natilleraNombre,
      cuotasPrestamo: pago.prestamo.map(cp => ({
        id: cp.id,
        prestamo_id: cp.prestamo_id,
        numero_cuota: cp.numero_cuota,
        valor_cuota: cp.valor_cuota,
        valor_pagado_actual: parseFloat(cp.valor_pagado) || 0,
        valor_pagado_efectivo_actual: parseFloat(cp.valor_pagado_efectivo) || 0,
        valor_pagado_transferencia_actual: parseFloat(cp.valor_pagado_transferencia) || 0,
        valor_pendiente: cp.valor_pendiente,
        mora: Number(cp.mora) || 0,
        fecha_proyectada: cp.fecha_proyectada
      })),
      valorTotal: totalPrest + totalMora,
      tipoPago: formaPago,
      options: opciones
    })
  ])

  // La fila del historial se escribe en segundo plano: se espera para que el comprobante
  // que se abre enseguida la encuentre (nombres de actividades y préstamos).
  // Con tope: si por algún camino la promesa no se resolviera, el lote no se queda colgado.
  const tope = new Promise(resolve => setTimeout(() => resolve(null), 8000))
  const historialPagoId = await Promise.race([res.historialPagoIdPromise || Promise.resolve(null), tope]).catch(() => null)
  return { ok: true, historialPagoId }
}

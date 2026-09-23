/**
 * Composable para el cálculo de cierre de natillera.
 * Centraliza la lógica de distribución de utilidades por concepto (equitativa/proporcional)
 * según config_cierre y devuelve el resumen por socio.
 */
import { supabase } from '../lib/supabase'
import { calcularUtilidadesReales } from './useUtilidadesReales'

/**
 * Tipos de utilidad considerados en el cierre.
 *
 * - Los seis primeros se persisten en utilidades_clasificadas (registros generados
 *   por liquidación de actividades, intereses de préstamos y multas pagadas).
 * - 'utilidades_adicionales' es un tipo virtual: se calcula al vuelo a partir de
 *   movimientos_fondo con destino_ingreso/origen_egreso = 'utilidades' (es decir,
 *   los ingresos/egresos a utilidades registrados manualmente desde el Cuadre de
 *   Caja). No se almacena como fila aparte; el monto se obtiene como
 *   sum(ingresos) − sum(egresos) en el momento del cierre.
 */
export const TIPOS_UTILIDAD = ['prestamos', 'rifas', 'bingo', 'venta', 'evento', 'otro', 'sanciones', 'utilidades_adicionales']

/** Redondeo a 2 decimales */
function round2(n) {
  return Math.round(n * 100) / 100
}

/**
 * Obtiene el modo de distribución para un tipo de utilidad desde config_cierre.
 * @param {object} config - config_cierre de la natillera
 * @param {string} tipo - prestamos | sanciones | rifas | bingo | venta | evento | otro
 */
export function getModoDistribucion(config, tipo) {
  if (!config) return 'equitativa'
  if (tipo === 'prestamos') return config.prestamos || 'equitativa'
  if (tipo === 'sanciones') return config.sanciones || 'equitativa'
  if (tipo === 'utilidades_adicionales') return config.utilidades_adicionales || 'equitativa'
  const actividades = config.actividades || {}
  const modoActividades = config.modoActividades || 'general'
  if (modoActividades === 'general') return actividades.general || 'equitativa'
  return actividades[tipo] || 'equitativa'
}

/**
 * Distribuye un monto entre socios: equitativa (partes iguales) o proporcional al ahorro.
 * Ajusta el último socio para que la suma coincida con totalMonto (evitar redondeos).
 */
function distribuirMonto(totalMonto, sociosConAhorro, modo, totalAhorro) {
  const N = sociosConAhorro.length
  if (N === 0) return {}
  const resultado = {}
  if (modo === 'equitativa') {
    const porSocio = round2(totalMonto / N)
    let suma = 0
    sociosConAhorro.forEach((sn, i) => {
      const id = sn.id
      if (i === N - 1) {
        resultado[id] = round2(totalMonto - suma)
      } else {
        resultado[id] = porSocio
        suma += porSocio
      }
    })
  } else {
    if (!totalAhorro || totalAhorro <= 0) {
      const porSocio = round2(totalMonto / N)
      sociosConAhorro.forEach((sn, i) => {
        resultado[sn.id] = i === N - 1 ? round2(totalMonto - (N - 1) * porSocio) : porSocio
      })
    } else {
      let suma = 0
      sociosConAhorro.forEach((sn, i) => {
        const parte = (sn.ahorro / totalAhorro) * totalMonto
        if (i === N - 1) {
          resultado[sn.id] = round2(totalMonto - suma)
        } else {
          resultado[sn.id] = round2(parte)
          suma += resultado[sn.id]
        }
      })
    }
  }
  return resultado
}

/**
 * Calcula el cierre de la natillera: ahorro por socio, utilidades por concepto, totales.
 * @param {string} natilleraId - UUID de la natillera
 * @param {object} options - { configCierre?, fechaCorte? } (configCierre si ya se tiene; si no, se obtiene de la natillera)
 * @returns {Promise<{ socios: array, totalAhorro, utilidadesPorTipo, participantesCierre, error?: string }>}
 */
export async function calcularCierreNatillera(natilleraId, options = {}) {
  const { configCierre: configCierrePasado, fechaCorte } = options

  try {
    const socioNatilleraIdsRes = await supabase
      .from('socios_natillera')
      .select('id, valor_cuota_individual, socio:socios(id, nombre, telefono, avatar_seed, avatar_style)')
      .eq('natillera_id', natilleraId)
      .eq('estado', 'activo')

    if (socioNatilleraIdsRes.error) throw socioNatilleraIdsRes.error
    const sociosNatillera = socioNatilleraIdsRes.data || []
    const ids = sociosNatillera.map(s => s.id)
    if (ids.length === 0) {
      return { socios: [], totalAhorro: 0, utilidadesPorTipo: {} }
    }

    const [cuotasRes, utilidadesRes, prestamosRes, movimientosUtilRes, natilleraRes] = await Promise.all([
      supabase
        .from('cuotas')
        .select('socio_natillera_id, estado, valor_cuota, valor_pagado, valor_multa, fecha_pago')
        .in('socio_natillera_id', ids),
      supabase
        .from('utilidades_clasificadas')
        .select('tipo, monto')
        .eq('natillera_id', natilleraId)
        .is('fecha_cierre', null),
      supabase
        .from('prestamos')
        .select('socio_natillera_id, saldo_actual')
        .in('socio_natillera_id', ids)
        .in('estado', ['activo', 'pendiente']),
      supabase
        .from('movimientos_fondo')
        .select('tipo, monto, fecha, destino_ingreso, origen_egreso')
        .eq('natillera_id', natilleraId)
        .or('destino_ingreso.eq.utilidades,origen_egreso.eq.utilidades'),
      configCierrePasado ? Promise.resolve({ data: null }) : supabase.from('natilleras').select('config_cierre').eq('id', natilleraId).maybeSingle()
    ])

    if (cuotasRes.error) throw cuotasRes.error
    if (utilidadesRes.error) throw utilidadesRes.error
    if (prestamosRes.error) throw prestamosRes.error
    if (movimientosUtilRes.error) throw movimientosUtilRes.error
    if (natilleraRes && natilleraRes.error) throw natilleraRes.error

    const cuotas = cuotasRes.data || []
    const utilidadesFilas = utilidadesRes.data || []
    const prestamos = prestamosRes.data || []
    const movimientosUtilidades = movimientosUtilRes.data || []

    const configCierre = configCierrePasado || (natilleraRes?.data?.config_cierre || {})
    const actividades = configCierre.actividades || {}
    if (!configCierre.sanciones) configCierre.sanciones = 'equitativa'

    const fechaCorteObj = fechaCorte ? new Date(fechaCorte) : null

    const ahorroPorSocio = {}
    const cuotasPorSocio = {}
    sociosNatillera.forEach(sn => {
      ahorroPorSocio[sn.id] = 0
      cuotasPorSocio[sn.id] = { pagadas: [], deuda: [] }
    })

    /*
     * El ahorro de cada socio es lo que ha puesto, no lo que ha terminado de pagar.
     *
     * Antes solo sumaban las cuotas COMPLETAS: quien había abonado parte de una cuota
     * perdía ese dinero en el cierre —no se le acreditaba— y encima se le descontaba lo
     * que faltaba. Pagaba dos veces por la misma cuota a medias. Ahora el abono suma al
     * ahorro y la deuda sigue siendo solo lo que falta, que es como cuadra.
     *
     * Las cuotas `programada` (periodos futuros) no son deuda todavía, pero si alguien
     * pagó por adelantado ese dinero está en la caja y es suyo: se le acredita igual.
     */
    cuotas.forEach(c => {
      const snId = c.socio_natillera_id
      if (!cuotasPorSocio[snId]) return
      const valorCuota = parseFloat(c.valor_cuota) || 0
      const valorPagado = parseFloat(c.valor_pagado) || 0
      const pagada = c.estado === 'pagada' || valorPagado >= valorCuota
      if (fechaCorteObj && c.fecha_pago) {
        const fechaPago = new Date(c.fecha_pago)
        if (fechaPago > fechaCorteObj) return
      }
      if (pagada) {
        cuotasPorSocio[snId].pagadas.push(c)
        ahorroPorSocio[snId] += valorCuota
        return
      }
      // Abono parcial: entra al ahorro lo abonado, nunca más que el valor de la cuota.
      if (valorPagado > 0) ahorroPorSocio[snId] += Math.min(valorPagado, valorCuota)
      if (c.estado !== 'programada') cuotasPorSocio[snId].deuda.push(c)
    })

    const totalAhorro = Object.values(ahorroPorSocio).reduce((s, v) => s + v, 0)
    const sociosConAhorroParaDist = sociosNatillera.map(sn => ({
      id: sn.id,
      ahorro: ahorroPorSocio[sn.id] || 0
    }))
    const participantesCierre = sociosNatillera.length

    /*
     * Las utilidades se CALCULAN desde la fuente, no se leen del acumulador.
     *
     * `utilidades_clasificadas` se desvía con el tiempo (ver `useUtilidadesReales`), y el
     * cierre se hace una vez y no se puede deshacer: es justo el momento de calcular bien
     * en vez de confiar en un número que nadie ha podido auditar en meses. `registrado` se
     * devuelve junto al cálculo para que la pantalla pueda enseñar la diferencia.
     */
    const utilidadesReales = await calcularUtilidadesReales(natilleraId, { idsSocioNatillera: ids })
    const montosPorTipo = {}
    TIPOS_UTILIDAD.forEach(t => { montosPorTipo[t] = utilidadesReales.porTipo?.[t] || 0 })
    const utilidadesRegistradas = utilidadesFilas.reduce((s, row) => s + (parseFloat(row.monto) || 0), 0)

    /*
     * Utilidades adicionales: ya vienen en el cálculo, pero ahí no se filtran por fecha de
     * corte. Si el cierre se hace a una fecha pasada, se recalculan aquí acotando.
     *
     * El neto se aplica también en NEGATIVO. Antes solo se guardaba `if (neto > 0)`, así
     * que los gastos pagados con utilidades desaparecían y el fondo repartía plata ya
     * gastada.
     */
    if (fechaCorteObj) {
      let netoUtilidadesAdicionales = 0
      movimientosUtilidades.forEach(m => {
        if (m.fecha && new Date(m.fecha) > fechaCorteObj) return
        const monto = parseFloat(m.monto) || 0
        if (monto <= 0) return
        if (m.tipo === 'entrada' && m.destino_ingreso === 'utilidades') netoUtilidadesAdicionales += monto
        else if (m.tipo === 'salida' && m.origen_egreso === 'utilidades') netoUtilidadesAdicionales -= monto
      })
      montosPorTipo.utilidades_adicionales = netoUtilidadesAdicionales
    }

    /*
     * Administración: el porcentaje que el reglamento le reconoce a quien administra.
     *
     * Se saca ANTES de repartir, porque lo que se reparte es lo que queda después de
     * pagarla. La base es configurable porque no todos los reglamentos dicen lo mismo:
     *
     *   · 'total' (por defecto) — un porcentaje de todo lo recogido, ahorros incluidos.
     *     Es lo que suele decir el reglamento para cubrir los gastos de gestión.
     *   · 'utilidades' — solo sobre lo que el fondo ganó.
     *
     * El descuento sale primero de las utilidades, escalando cada concepto por igual para
     * respetar su modo de reparto. Si no alcanzan —solo puede pasar con base 'total'—, el
     * resto se reparte entre los socios en proporción a su ahorro, que es lo único justo
     * cuando se está tocando el ahorro de cada uno.
     */
    const administracionCfg = configCierre.administracion || {}
    const porcentajeAdministracion = Math.max(0, Math.min(100, parseFloat(administracionCfg.porcentaje) || 0))
    // Por defecto, «todo lo recogido»: es lo que dice el reglamento tipo («sobre el total
    // recogido al final del año, ahorros + utilidades»). Con porcentaje 0 da igual.
    const baseAdministracion = administracionCfg.base === 'utilidades' ? 'utilidades' : 'total'

    const totalUtilidadesBruto = Object.values(montosPorTipo).reduce((acc, v) => acc + v, 0)
    // Copia antes de escalar por administración: es lo que de verdad generó la natillera.
    const montosPorTipoBruto = { ...montosPorTipo }
    const montoBase = baseAdministracion === 'total'
      ? totalAhorro + totalUtilidadesBruto
      : totalUtilidadesBruto
    const montoAdministracion = porcentajeAdministracion > 0
      ? round2(Math.max(0, montoBase) * porcentajeAdministracion / 100)
      : 0

    const administracionDeUtilidades = Math.min(montoAdministracion, Math.max(0, totalUtilidadesBruto))
    const administracionDeAhorro = round2(montoAdministracion - administracionDeUtilidades)

    if (administracionDeUtilidades > 0 && totalUtilidadesBruto > 0) {
      const factor = (totalUtilidadesBruto - administracionDeUtilidades) / totalUtilidadesBruto
      TIPOS_UTILIDAD.forEach(t => { montosPorTipo[t] = round2(montosPorTipo[t] * factor) })
    }

    const utilidadesPorConceptoPorSocio = {}
    sociosNatillera.forEach(sn => {
      utilidadesPorConceptoPorSocio[sn.id] = {}
      TIPOS_UTILIDAD.forEach(t => { utilidadesPorConceptoPorSocio[sn.id][t] = 0 })
    })

    TIPOS_UTILIDAD.forEach(tipo => {
      const monto = montosPorTipo[tipo]
      if (monto <= 0) return
      const modo = getModoDistribucion(configCierre, tipo)
      const dist = distribuirMonto(monto, sociosConAhorroParaDist, modo, totalAhorro)
      Object.keys(dist).forEach(snId => {
        utilidadesPorConceptoPorSocio[snId][tipo] = dist[snId]
      })
    })

    const prestamosPorSocio = {}
    prestamos.forEach(p => {
      if (!prestamosPorSocio[p.socio_natillera_id]) prestamosPorSocio[p.socio_natillera_id] = []
      prestamosPorSocio[p.socio_natillera_id].push(p)
    })

    const socios = sociosNatillera.map(sn => {
      const ahorro = round2(ahorroPorSocio[sn.id] || 0)
      // Solo se llena cuando la administración no cupo entera en las utilidades.
      const aporteAdministracion = administracionDeAhorro > 0 && totalAhorro > 0
        ? round2(administracionDeAhorro * (ahorro / totalAhorro))
        : 0
      const utilidadesPorConcepto = utilidadesPorConceptoPorSocio[sn.id] || {}
      const utilidadesTotal = round2(Object.values(utilidadesPorConcepto).reduce((s, v) => s + v, 0))
      const totalAEntregar = round2(ahorro + utilidadesTotal - aporteAdministracion)
      const prestamosSocio = prestamosPorSocio[sn.id] || []
      const totalPrestamosPendientes = round2(prestamosSocio.reduce((s, p) => s + (parseFloat(p.saldo_actual) || 0), 0))
      const cuotasDeuda = cuotasPorSocio[sn.id]?.deuda || []
      const valorCuotasDeuda = round2(cuotasDeuda.reduce((s, c) => s + Math.max(0, (parseFloat(c.valor_cuota) || 0) - (parseFloat(c.valor_pagado) || 0)), 0))
      const descuentos = round2(totalPrestamosPendientes + valorCuotasDeuda)
      const totalFinal = round2(totalAEntregar - descuentos)
      const pagadas = cuotasPorSocio[sn.id]?.pagadas || []
      const deuda = cuotasPorSocio[sn.id]?.deuda || []

      return {
        socioNatillera: sn,
        socio: sn.socio,
        ahorro,
        utilidadesPorConcepto,
        utilidadesTotal,
        aporteAdministracion,
        totalAEntregar,
        descuentos,
        descuentosDesglose: {
          prestamosPendientes: totalPrestamosPendientes,
          cuotasSinPagar: valorCuotasDeuda
        },
        totalFinal,
        cantidadCuotasPagadas: pagadas.length,
        cantidadCuotasDeuda: deuda.length,
        montoAhorradoMensual: parseFloat(sn.valor_cuota_individual) || 0
      }
    })

    const totalUtilidades = Object.values(montosPorTipo).reduce((s, v) => s + v, 0)

    return {
      socios,
      totalAhorro,
      utilidadesPorTipo: montosPorTipo,
      utilidadesPorTipoBruto: montosPorTipoBruto,
      totalUtilidades,
      totalUtilidadesBruto: round2(totalUtilidadesBruto),
      participantesCierre,
      // Lo que el acumulador decía frente a lo que de verdad se recaudó: si difieren,
      // conviene verlo antes de cerrar y no después.
      utilidadesRegistradas,
      diferenciaUtilidades: round2(totalUtilidades - utilidadesRegistradas),
      administracion: {
        porcentaje: porcentajeAdministracion,
        base: baseAdministracion,
        monto: montoAdministracion,
        deUtilidades: round2(administracionDeUtilidades),
        deAhorro: administracionDeAhorro
      }
    }
  } catch (err) {
    console.error('calcularCierreNatillera error:', err)
    return { socios: [], error: err.message }
  }
}

export function useCierreNatillera() {
  return {
    calcularCierreNatillera,
    getModoDistribucion,
    TIPOS_UTILIDAD
  }
}

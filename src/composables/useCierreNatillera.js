/**
 * Composable para el cálculo de cierre de natillera.
 * Centraliza la lógica de distribución de utilidades por concepto (equitativa/proporcional)
 * según config_cierre y devuelve el resumen por socio.
 */
import { supabase } from '../lib/supabase'

/** Tipos de utilidad en utilidades_clasificadas (deben coincidir con config_cierre) */
export const TIPOS_UTILIDAD = ['prestamos', 'rifas', 'bingo', 'venta', 'evento', 'otro', 'sanciones']

/** Redondeo a 2 decimales */
function round2(n) {
  return Math.round(n * 100) / 100
}

/**
 * Obtiene el modo de distribución para un tipo de utilidad desde config_cierre.
 * @param {object} config - config_cierre de la natillera
 * @param {string} tipo - prestamos | sanciones | rifas | bingo | venta | evento | otro
 */
function getModoDistribucion(config, tipo) {
  if (!config) return 'equitativa'
  if (tipo === 'prestamos') return config.prestamos || 'equitativa'
  if (tipo === 'sanciones') return config.sanciones || 'equitativa'
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

    const [cuotasRes, utilidadesRes, prestamosRes, natilleraRes] = await Promise.all([
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
      configCierrePasado ? Promise.resolve({ data: null }) : supabase.from('natilleras').select('config_cierre').eq('id', natilleraId).maybeSingle()
    ])

    if (cuotasRes.error) throw cuotasRes.error
    if (utilidadesRes.error) throw utilidadesRes.error
    if (prestamosRes.error) throw prestamosRes.error
    if (natilleraRes && natilleraRes.error) throw natilleraRes.error

    const cuotas = cuotasRes.data || []
    const utilidadesFilas = utilidadesRes.data || []
    const prestamos = prestamosRes.data || []

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
      } else if (c.estado !== 'programada') {
        cuotasPorSocio[snId].deuda.push(c)
      }
    })

    const totalAhorro = Object.values(ahorroPorSocio).reduce((s, v) => s + v, 0)
    const sociosConAhorroParaDist = sociosNatillera.map(sn => ({
      id: sn.id,
      ahorro: ahorroPorSocio[sn.id] || 0
    }))
    const participantesCierre = sociosNatillera.length

    const montosPorTipo = {}
    TIPOS_UTILIDAD.forEach(t => { montosPorTipo[t] = 0 })
    utilidadesFilas.forEach(row => {
      const t = row.tipo
      if (TIPOS_UTILIDAD.includes(t)) {
        montosPorTipo[t] += parseFloat(row.monto) || 0
      }
    })

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
      const utilidadesPorConcepto = utilidadesPorConceptoPorSocio[sn.id] || {}
      const utilidadesTotal = round2(Object.values(utilidadesPorConcepto).reduce((s, v) => s + v, 0))
      const totalAEntregar = round2(ahorro + utilidadesTotal)
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

    return {
      socios,
      totalAhorro,
      utilidadesPorTipo: montosPorTipo,
      participantesCierre
    }
  } catch (err) {
    console.error('calcularCierreNatillera error:', err)
    return { socios: [], error: err.message }
  }
}

export function useCierreNatillera() {
  return {
    calcularCierreNatillera,
    TIPOS_UTILIDAD
  }
}

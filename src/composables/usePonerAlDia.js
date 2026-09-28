import { supabase } from '../lib/supabase'
import { useCuotasStore } from '../stores/cuotas'
import { registrarPagoCompletoDeCuota, calcular4x1000 } from './usePagoCuotaCompleto'
import { recalcularFotoGanancias } from './usePortalGanancias'
import { getCurrentDateISO } from '../utils/formatDate'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from './useAuditoria'

/*
 * Poner a un socio al día: registrar como pagadas todas sus cuotas ya vencidas.
 *
 * El caso: una natillera que empezó antes de pasarse a la app (en diciembre, por ejemplo)
 * y se crea hoy. Las cuotas de los meses anteriores se generan igual, y como nadie las
 * ha registrado, cada socio nace en mora aunque haya pagado todo en su momento.
 *
 * Cada cuota se paga con el mismo camino del pago normal y de la carga rápida
 * (`registrarPagoCompletoDeCuota`): queda en el historial, con su comprobante y en la caja
 * como efectivo o transferencia. La fecha del pago es su fecha límite —que es cuando se
 * supone que se pagó— y por eso no hay multa: el pago cae dentro del plazo, y el store
 * borra la multa que se hubiera calculado contra la fecha de hoy.
 */

/**
 * 4×1000 de un grupo de cuotas si se cobra: por cuota y con el mismo redondeo del pago
 * normal, porque así se registra (cada cuota es una transacción). Solo con transferencia.
 */
export function total4x1000DeCuotas(cuotas, formaPago, cobrar4x1000) {
  if (formaPago !== 'transferencia' || !cobrar4x1000) return 0
  return (cuotas || []).reduce((s, c) => s + calcular4x1000(c.pendiente), 0)
}

/** Cuotas del socio con fecha límite hasta hoy que no están pagadas completas, de la más vieja a la más nueva. */
export async function cuotasParaPonerAlDia(socioNatilleraId) {
  if (!socioNatilleraId) return []
  const porSocio = await cuotasParaPonerAlDiaPorSocio([socioNatilleraId])
  return porSocio.get(socioNatilleraId) || []
}

/**
 * Lo mismo para varios socios en una sola consulta (el proceso masivo).
 * @returns {Promise<Map<string, Array>>} socio_natillera_id → sus cuotas por poner al día
 */
export async function cuotasParaPonerAlDiaPorSocio(socioNatilleraIds) {
  const porSocio = new Map()
  if (!socioNatilleraIds?.length) return porSocio
  const { data, error } = await supabase
    .from('cuotas')
    .select('id, socio_natillera_id, valor_cuota, valor_pagado, fecha_limite, estado')
    .in('socio_natillera_id', socioNatilleraIds)
    .lte('fecha_limite', getCurrentDateISO())
    .order('fecha_limite', { ascending: true })
  if (error) throw error
  for (const c of data || []) {
    const pendiente = Math.max(0, (parseFloat(c.valor_cuota) || 0) - (parseFloat(c.valor_pagado) || 0))
    if (pendiente <= 0) continue
    if (!porSocio.has(c.socio_natillera_id)) porSocio.set(c.socio_natillera_id, [])
    porSocio.get(c.socio_natillera_id).push({ ...c, pendiente })
  }
  return porSocio
}

/*
 * Cuántas cuotas se registran a la vez. Cada una son tres o cuatro idas y vueltas a la base
 * (leer, actualizar, historial, comprobante); en fila, un socio de diez cuotas tardaba unos
 * diez segundos. Aquí no hay multas —todo se paga en su fecha límite—, así que el orden no
 * cambia nada y las cuotas son independientes: se reparten entre varias a la vez.
 */
const SIMULTANEAS = 8

/** Ejecuta `fn` sobre cada elemento, con como mucho `limite` a la vez. */
async function enParalelo(elementos, limite, fn) {
  let siguiente = 0
  async function trabajador() {
    while (siguiente < elementos.length) {
      const elemento = elementos[siguiente++]
      await fn(elemento)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, elementos.length) }, trabajador))
}

/** Una cuota, con el mismo camino del pago normal: pagada en su fecha límite y sin multa. */
async function registrarCuotaAlDia({ cuota, socioNatillera, natilleraId, natilleraNombre, formaPago, con4x1000 }) {
  try {
    const { ok } = await registrarPagoCompletoDeCuota({
      pago: {
        cuota,
        fecha: String(cuota.fecha_limite).slice(0, 10),
        multa: 0,
        valorPagado: cuota.pendiente,
        actividades: [],
        prestamo: []
      },
      socio: { nombre: socioNatillera?.socio?.nombre || null, periodicidad: socioNatillera?.periodicidad || 'mensual' },
      natilleraId,
      natilleraNombre,
      formaPago,
      cobrar4x1000: con4x1000
    })
    return !!ok
  } catch (e) {
    console.warn('Poner al día:', e)
    return false
  }
}

/** Muchos pagos de un toque: que quede quién lo hizo y cuándo. Uno por socio. */
function auditarAlDia({ socioNatillera, natilleraId, natilleraNombre, formaPago, r, cuotaIds }) {
  if (r.registradas <= 0) return
  const n = r.registradas
  registrarAuditoriaEnSegundoPlano(useAuditoria().registrar({
    tipoAccion: 'UPDATE',
    entidad: 'cuotas',
    entidadId: socioNatillera?.id || null,
    descripcion: `Se puso al día a ${socioNatillera?.socio?.nombre || 'un socio'}: ${n} cuota${n === 1 ? '' : 's'} registrada${n === 1 ? '' : 's'} como pagada${n === 1 ? '' : 's'} en su fecha límite`,
    natilleraId,
    natilleraNombre,
    datosNuevos: { cuotas_registradas: n, valor_total: r.valor, forma_pago: formaPago, impuesto_4x1000: r.valor4x1000 },
    detalles: { metodo: 'poner_al_dia', cuotas_fallidas: r.fallidas, cuota_ids: cuotaIds }
  }))
}

/**
 * Registra las cuotas de varios socios en un solo grupo de trabajo (`SIMULTANEAS` a la vez)
 * y devuelve el resultado de cada uno. Base de las dos entradas: un socio y el masivo.
 */
async function registrarLote({ lote, natilleraId, natilleraNombre, formaPago, cobrar4x1000, alAvanzar }) {
  const con4x1000 = formaPago === 'transferencia' && !!cobrar4x1000
  const resultados = new Map(lote.map(x => [x.socioNatillera.id, { registradas: 0, fallidas: 0, valor: 0, valor4x1000: 0 }]))
  const tareas = lote.flatMap(x => x.cuotas.map(cuota => ({ cuota, socioNatillera: x.socioNatillera })))
  let hechas = 0

  await enParalelo(tareas, SIMULTANEAS, async ({ cuota, socioNatillera }) => {
    const ok = await registrarCuotaAlDia({ cuota, socioNatillera, natilleraId, natilleraNombre, formaPago, con4x1000 })
    const r = resultados.get(socioNatillera.id)
    if (ok) {
      r.registradas++
      r.valor += cuota.pendiente
      if (con4x1000) r.valor4x1000 += calcular4x1000(cuota.pendiente)
    } else {
      r.fallidas++
    }
    hechas++
    alAvanzar?.(hechas, tareas.length)
  })

  lote.forEach(x => auditarAlDia({
    socioNatillera: x.socioNatillera,
    natilleraId,
    natilleraNombre,
    formaPago,
    r: resultados.get(x.socioNatillera.id),
    cuotaIds: x.cuotas.map(c => c.id)
  }))
  return resultados
}

/**
 * @param {object} p
 * @param {object} p.socioNatillera - con `id`, `periodicidad` y `socio.nombre`
 * @param {string} p.natilleraId
 * @param {string} [p.natilleraNombre]
 * @param {'efectivo'|'transferencia'} p.formaPago
 * @param {boolean} [p.cobrar4x1000=false] - solo cuenta con transferencia
 * @param {Array} [p.cuotas] - si ya se consultaron (para no repetir la consulta)
 * @param {(hechas: number, total: number) => void} [p.alAvanzar]
 * @returns {Promise<{ registradas: number, total: number, valor: number, valor4x1000: number, fallidas: number }>}
 */
export async function ponerSocioAlDia({ socioNatillera, natilleraId, natilleraNombre = null, formaPago = 'efectivo', cobrar4x1000 = false, cuotas = null, alAvanzar = null }) {
  const lista = cuotas || await cuotasParaPonerAlDia(socioNatillera?.id)
  const resultados = await registrarLote({
    lote: [{ socioNatillera, cuotas: lista }],
    natilleraId,
    natilleraNombre,
    formaPago,
    cobrar4x1000,
    alAvanzar
  })
  const r = resultados.get(socioNatillera.id)
  await recalcularTrasPonerAlDia(natilleraId, r.registradas)
  return { ...r, total: lista.length }
}

/** Un solo recálculo de estados y multas para todo el lote, como la carga rápida. */
async function recalcularTrasPonerAlDia(natilleraId, registradas) {
  try {
    await useCuotasStore().fetchCuotasNatillera(natilleraId)
  } catch (e) {
    console.warn('Poner al día: recarga de cuotas', e)
  }
  // El ahorro cambió: el portal del socio lo refleja sin esperar al recálculo periódico.
  if (registradas > 0) recalcularFotoGanancias(natilleraId)
}

/**
 * Proceso masivo: varios socios, cada uno con sus cuotas (de `cuotasParaPonerAlDiaPorSocio`).
 * Todas sus cuotas van al mismo grupo de trabajo; el recálculo, una sola vez al final.
 *
 * @param {object} p
 * @param {Array<{ socioNatillera: object, cuotas: Array }>} p.lote
 * @param {(hechas: number, total: number) => void} [p.alAvanzar] - en cuotas, de todo el lote
 * @returns {Promise<{ socios: number, registradas: number, valor: number, valor4x1000: number, fallidos: string[] }>}
 */
export async function ponerSociosAlDia({ lote, natilleraId, natilleraNombre = null, formaPago = 'efectivo', cobrar4x1000 = false, alAvanzar = null }) {
  const resultados = await registrarLote({ lote, natilleraId, natilleraNombre, formaPago, cobrar4x1000, alAvanzar })
  let registradas = 0
  let valor = 0
  let valor4x1000 = 0
  let sociosAlDia = 0
  const fallidos = []
  lote.forEach(x => {
    const r = resultados.get(x.socioNatillera.id)
    registradas += r.registradas
    valor += r.valor
    valor4x1000 += r.valor4x1000
    if (r.fallidas > 0) fallidos.push(x.socioNatillera?.socio?.nombre || 'un socio')
    else sociosAlDia++
  })
  await recalcularTrasPonerAlDia(natilleraId, registradas)
  return { socios: sociosAlDia, registradas, valor, valor4x1000, fallidos }
}

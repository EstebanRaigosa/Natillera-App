import { supabase } from '../lib/supabase'

/**
 * Recaudo que entra a una rifa DESPUÉS de haberla liquidado.
 *
 * Al liquidar, `Actividades.vue` congela tres cifras en la fila de la actividad —`ingresos`,
 * `gastos` y `utilidad`— y reparte esa utilidad en `utilidades_clasificadas` por forma de
 * pago. Si más tarde un socio paga lo que debía de esa rifa, el dinero sí entraba a la caja
 * (el libro lee `socios_actividad`), pero la rifa seguía diciendo que recaudó lo de aquel
 * día y el fondo no contaba esa ganancia. Aquí se cierra ese hueco.
 *
 * Dos reglas gobiernan esto:
 *
 * 1. **El premio no cambia.** Ya se entregó y su importe está en `gastos`, así que la
 *    utilidad se recalcula sobre los ingresos nuevos en vez de sumarse a ciegas: para una
 *    rifa normal `utilidad = ingresos - gastos`, y cuando el número ganador era un faltante
 *    —el premio se lo queda la natillera— `utilidad = ingresos`, igual que al liquidar.
 *
 * 2. **Un período cerrado no se toca.** La utilidad solo se ajusta en filas con
 *    `fecha_cierre` nula. Lo que ya se repartió en un cierre de natillera se queda como
 *    está; el dinero nuevo entra al ciclo abierto, que es donde todavía significa algo.
 */

/** Descripción de la fila de utilidad de una rifa, igual que la que escribe la liquidación. */
function descripcionUtilidad(descripcionActividad) {
  return `Utilidad de rifa: ${descripcionActividad || 'Rifa'}`
}

/**
 * Lo que la rifa tenía recaudado el día que se liquidó, guardado por la liquidación en
 * `detalles.total_recaudado`. Es el suelo de cualquier reversión: al revertir un pago se
 * puede quitar lo que entró después, nunca lo que ya estaba contado al cerrar.
 */
async function recaudoAlLiquidar(natilleraId, actividadId) {
  const { data } = await supabase
    .from('utilidades_clasificadas')
    .select('detalles')
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'rifas')
    .eq('id_actividad', actividadId)
    .limit(1)
  const bruto = data?.[0]?.detalles?.total_recaudado
  const valor = Number(bruto)
  return Number.isFinite(valor) ? valor : null
}

/**
 * Suma o resta `delta` en la utilidad abierta de ESTA rifa y ESTA forma de pago.
 *
 * Se busca por `id_actividad` a propósito: `sumarUtilidadPorTipo` del store agrupa por tipo
 * y usa `maybeSingle()`, que con dos rifas liquidadas sin cerrar devolvería error — y, aun
 * funcionando, mezclaría la ganancia de una rifa con la de otra.
 */
async function ajustarUtilidadRifa(natilleraId, actividadId, formaPago, delta, descripcion) {
  const problemas = []
  if (delta === 0) return { ajustado: 0, problemas }

  try {
    let consulta = supabase
      .from('utilidades_clasificadas')
      .select('id, monto')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'rifas')
      .eq('id_actividad', actividadId)
      .is('fecha_cierre', null)
      .order('created_at', { ascending: true })
    consulta = formaPago != null ? consulta.eq('forma_pago', formaPago) : consulta.is('forma_pago', null)
    const { data: filas, error } = await consulta
    if (error) throw error

    if (delta > 0) {
      const primera = (filas || [])[0]
      if (primera) {
        const { data: tocadas, error: eUpd } = await supabase
          .from('utilidades_clasificadas')
          .update({ monto: (parseFloat(primera.monto) || 0) + delta, updated_at: new Date().toISOString() })
          .eq('id', primera.id)
          .select('id')
        if (eUpd) throw eUpd
        if ((tocadas || []).length === 0) throw new Error('sin permisos sobre la utilidad')
        return { ajustado: delta, problemas }
      }

      // Sin fila abierta: o la rifa se liquidó sin utilidad, o la suya ya se cerró en un
      // cierre de natillera. En los dos casos el dinero nuevo abre fila propia.
      const insertar = {
        natillera_id: natilleraId,
        tipo: 'rifas',
        id_actividad: actividadId,
        monto: delta,
        fecha_cierre: null,
        descripcion,
        detalles: { actividad_id: actividadId, recaudo_posterior_a_liquidacion: true }
      }
      if (formaPago != null) insertar.forma_pago = formaPago
      const { error: eIns } = await supabase.from('utilidades_clasificadas').insert(insertar)
      if (eIns) throw eIns
      return { ajustado: delta, problemas }
    }

    // Restar: en cascada sobre las filas abiertas y sin dejar ninguna en negativo.
    let porQuitar = -delta
    let quitado = 0
    for (const fila of filas || []) {
      if (porQuitar <= 0) break
      const monto = parseFloat(fila.monto) || 0
      if (monto <= 0) continue
      const baja = Math.min(monto, porQuitar)
      const { data: tocadas, error: eUpd } = await supabase
        .from('utilidades_clasificadas')
        .update({ monto: monto - baja, updated_at: new Date().toISOString() })
        .eq('id', fila.id)
        .select('id')
      if (eUpd) throw eUpd
      if ((tocadas || []).length === 0) throw new Error('sin permisos sobre la utilidad')
      porQuitar -= baja
      quitado += baja
    }
    if (porQuitar > 0) {
      problemas.push(
        `Quedaron $${Math.round(porQuitar).toLocaleString('es-CO')} de utilidad de la rifa sin devolver: ya no hay utilidad abierta de donde descontarlos (probablemente se repartieron en un cierre).`
      )
    }
    return { ajustado: -quitado, problemas }
  } catch (e) {
    problemas.push(`La utilidad de la rifa no se pudo ajustar: ${e.message}`)
    return { ajustado: 0, problemas }
  }
}

/**
 * Aplica a una rifa liquidada el dinero que entra (o se revierte) después del cierre.
 *
 * No hace nada si la actividad no es una rifa liquidada, así que quien cobra puede llamarla
 * siempre sin preguntar por el estado.
 *
 * @param {string} actividadId
 * @param {{efectivo?: number, transferencia?: number, otro?: number}} montos
 *        En negativo para revertir un pago. `otro` es para cuando no se sabe la forma de
 *        pago: va a la fila de utilidad sin forma, que es donde la liquidación pone lo suyo.
 * @returns {Promise<{aplicado: number, problemas: string[]}>}
 */
export async function aplicarRecaudoRifaLiquidada(actividadId, { efectivo = 0, transferencia = 0, otro = 0 } = {}) {
  const problemas = []
  const pedido = Math.round((efectivo || 0) + (transferencia || 0) + (otro || 0))
  if (!actividadId || pedido === 0) return { aplicado: 0, problemas }

  try {
    const { data: actividad, error } = await supabase
      .from('actividades')
      .select('id, natillera_id, descripcion, tipo, estado, ingresos, gastos, utilidad, ganador_es_faltante')
      .eq('id', actividadId)
      .single()
    if (error) throw error
    if (actividad?.tipo !== 'rifa' || actividad?.estado !== 'liquidada') return { aplicado: 0, problemas }

    const ingresosActuales = Number(actividad.ingresos) || 0
    const gastos = Number(actividad.gastos) || 0

    // Suelo de la reversión: lo recaudado el día de la liquidación. Sin ese dato —una rifa
    // liquidada sin utilidad no deja fila— se usa 0, que como mucho peca de permisivo.
    const suelo = pedido < 0 ? ((await recaudoAlLiquidar(actividad.natillera_id, actividad.id)) ?? 0) : 0
    const nuevosIngresos = Math.max(suelo, ingresosActuales + pedido)
    const aplicado = nuevosIngresos - ingresosActuales
    if (aplicado === 0) return { aplicado: 0, problemas }

    // El premio ya salió: la utilidad se reconstruye desde los ingresos, con el mismo
    // criterio que usó la liquidación para esta rifa.
    const nuevaUtilidad = actividad.ganador_es_faltante ? nuevosIngresos : nuevosIngresos - gastos

    const { data: tocadas, error: eAct } = await supabase
      .from('actividades')
      .update({ ingresos: nuevosIngresos, utilidad: nuevaUtilidad })
      .eq('id', actividad.id)
      .select('id')
    if (eAct) throw eAct
    if ((tocadas || []).length === 0) {
      throw new Error('sin permisos para actualizar la actividad')
    }

    // Si el suelo recortó lo pedido, el reparto por forma de pago se recorta en la misma
    // proporción: así la suma de las filas de utilidad sigue siendo lo que se movió.
    const escala = aplicado / pedido
    const porForma = [
      { forma: 'efectivo', monto: Math.round((efectivo || 0) * escala) },
      { forma: 'transferencia', monto: Math.round((transferencia || 0) * escala) },
      { forma: null, monto: Math.round((otro || 0) * escala) }
    ]
    // El redondeo se cuadra en la forma que más movió, para no perder un peso por el camino.
    const sumaRepartida = porForma.reduce((s, f) => s + f.monto, 0)
    if (sumaRepartida !== aplicado) {
      const mayor = porForma.reduce((a, b) => (Math.abs(b.monto) > Math.abs(a.monto) ? b : a))
      mayor.monto += aplicado - sumaRepartida
    }

    const descripcion = descripcionUtilidad(actividad.descripcion)
    for (const { forma, monto } of porForma) {
      if (monto === 0) continue
      const res = await ajustarUtilidadRifa(actividad.natillera_id, actividad.id, forma, monto, descripcion)
      problemas.push(...res.problemas)
    }

    return { aplicado, problemas }
  } catch (e) {
    problemas.push(`El pago quedó registrado, pero los totales de la rifa no se actualizaron: ${e.message}`)
    return { aplicado: 0, problemas }
  }
}

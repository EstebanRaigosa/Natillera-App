import { supabase } from '../lib/supabase'
import { useCuotasStore } from '../stores/cuotas'
import { useAuditoria } from './useAuditoria'

/**
 * Revertir el pago de un socio en una actividad, desde el módulo de Actividades.
 *
 * El único sitio del sistema que cobra una actividad es el pago de cuota (Cuotas →
 * `registrarPagosActividades`), y ese cobro deja huella en TRES sitios además de la propia
 * actividad:
 *
 *   1. `socios_actividad.valor_pagado` (y su desglose efectivo/transferencia).
 *   2. `utilidades_clasificadas`, con el tipo de la actividad — salvo las rifas, que solo
 *      suman al liquidarse desde Actividades.
 *   3. La cuota que lo cobró: `cuotas.valor_pagado_actividades` y, si el pago quedó
 *      registrado como transacción, `historial_pagos_cuota` (valor_actividades, valor_total
 *      y la línea dentro de `detalle_actividades`).
 *
 * Revertir solo (1) dejaría al socio debiendo la actividad y a la vez habiéndola pagado en su
 * cuota, y el cierre repartiría una utilidad que ya nadie pagó. Por eso se revierten los tres.
 * Lo que no se pueda identificar con certeza NO se toca a ciegas: se devuelve en `problemas`
 * para que la UI lo muestre y se revise a mano.
 */
export function useEliminarPagoActividad() {
  const cuotasStore = useCuotasStore()

  /**
   * Números de rifa aleatoria pagados por un socio en esta actividad.
   * En rifa aleatoria lo "pagado" que ve el usuario sale del máximo entre estos números y
   * `socios_actividad.valor_pagado`, así que revertir solo la fila dejaría el pago visible.
   */
  async function getNumerosPagadosSocio(actividad, socioNatilleraId) {
    if (actividad?.tipo !== 'rifa' || actividad?.tipo_rifa !== 'aleatoria') return []
    const { data } = await supabase
      .from('numeros_rifa')
      .select('id, numero, valor')
      .eq('actividad_id', actividad.id)
      .eq('socio_vendedor_id', socioNatilleraId)
      .eq('estado', 'pagado')
    return data || []
  }

  /**
   * Transacción de cuota que cobró esta fila de `socios_actividad`, si se puede identificar.
   *
   * Primero por el enlace exacto que guarda el detalle del pago (`socio_actividad_id`); si el
   * pago es anterior a ese detalle, por socio + periodo + nombre de la actividad. Sin
   * coincidencia devuelve null y quien llama avisa en vez de adivinar.
   */
  async function buscarTransaccionOrigen(socioAct, actividad) {
    // 1. Enlace exacto (pagos con detalle por actividad). `detalle_actividades` es jsonb: se
    //    busca con el operador de contención sobre el array.
    const { data: exactas, error: eExactas } = await supabase
      .from('historial_pagos_cuota')
      .select('id, cuota_id, valor_total, valor_actividades, detalle_actividades')
      .contains('detalle_actividades', [{ socio_actividad_id: socioAct.id }])
    if (!eExactas && (exactas || []).length > 0) return { transaccion: exactas[0], exacta: true }

    // 2. Sin enlace: transacciones de cuotas de ESTE socio que cobraron actividades, con una
    //    línea del mismo nombre. Se pide la cuota para acotar al socio.
    const { data: cuotasSocio } = await supabase
      .from('cuotas')
      .select('id')
      .eq('socio_natillera_id', socioAct.socio_natillera_id)
    const cuotaIds = (cuotasSocio || []).map(c => c.id)
    if (cuotaIds.length === 0) return { transaccion: null, exacta: false }

    const { data: candidatas } = await supabase
      .from('historial_pagos_cuota')
      .select('id, cuota_id, valor_total, valor_actividades, detalle_actividades')
      .in('cuota_id', cuotaIds)
      .gt('valor_actividades', 0)
      .order('fecha_pago', { ascending: false })

    const nombre = actividad?.descripcion || ''
    const match = (candidatas || []).find(t =>
      Array.isArray(t.detalle_actividades) &&
      t.detalle_actividades.some(d => (d?.nombre || '') === nombre)
    )
    return { transaccion: match || null, exacta: false }
  }

  /**
   * Cuota de la que descontar el dinero de actividades cuando no hay transacción: la del mismo
   * periodo que la actividad, y si no, cualquiera del socio con saldo de actividades suficiente.
   */
  async function buscarCuotaOrigenSinTransaccion(socioAct) {
    const { data } = await supabase
      .from('cuotas')
      .select('id, valor_pagado_actividades, fecha_limite')
      .eq('socio_natillera_id', socioAct.socio_natillera_id)
      .gt('valor_pagado_actividades', 0)
      .order('fecha_limite', { ascending: false })
    const cuotas = data || []
    if (cuotas.length === 0) return null

    const mes = socioAct.mes_pago != null ? Number(socioAct.mes_pago) : null
    const anio = socioAct.anio_pago != null ? Number(socioAct.anio_pago) : null
    if (mes != null && anio != null) {
      const delPeriodo = cuotas.find(c => {
        const partes = String(c.fecha_limite || '').split('-')
        return partes.length >= 2 && Number(partes[0]) === anio && Number(partes[1]) === mes
      })
      if (delPeriodo) return delPeriodo
    }
    return cuotas[0]
  }

  /**
   * Describe qué se revertiría, SIN tocar nada. Alimenta la confirmación en la tarjeta del socio.
   *
   * @returns {Promise<{success: boolean, error?: string, resumen?: object}>}
   */
  async function previsualizarEliminacionPagoActividad(socioActividadId) {
    try {
      const { data: socioAct, error: eSa } = await supabase
        .from('socios_actividad')
        .select('*, actividad:actividades(id, descripcion, tipo, tipo_rifa, estado, natillera_id)')
        .eq('id', socioActividadId)
        .single()
      if (eSa) throw eSa
      if (!socioAct) throw new Error('No se encontró el registro del socio en la actividad')

      const actividad = socioAct.actividad
      const numerosPagados = await getNumerosPagadosSocio(actividad, socioAct.socio_natillera_id)
      const valorPorNumeros = numerosPagados.reduce((s, n) => s + (Number(n.valor) || 0), 0)
      const valorFila = Number(socioAct.valor_pagado) || 0
      const valorTotal = Math.max(valorFila, valorPorNumeros)

      const avisos = []
      if (valorTotal <= 0) {
        return { success: false, error: 'Este socio no tiene ningún pago registrado en la actividad' }
      }

      const tipoUtil = cuotasStore.tipoUtilidadDeActividad(actividad?.tipo)
      if (tipoUtil) {
        avisos.push(`Se devolverán $${valorFila.toLocaleString('es-CO')} a las utilidades del fondo (${tipoUtil}).`)
      }

      const { transaccion, exacta } = await buscarTransaccionOrigen(socioAct, actividad)
      let cuotaOrigenId = transaccion?.cuota_id || null
      if (!transaccion) {
        const cuota = await buscarCuotaOrigenSinTransaccion(socioAct)
        cuotaOrigenId = cuota?.id || null
      }

      if (!cuotaOrigenId) {
        avisos.push('No se pudo identificar la cuota que cobró esta actividad: la cuota seguirá contando ese dinero como actividades pagadas. Revísala en el módulo de Cuotas.')
      } else if (transaccion && !exacta) {
        avisos.push('El pago de cuota se identificó por nombre de actividad y periodo (es anterior al detalle por actividad). Conviene revisar la cuota después.')
      } else if (!transaccion) {
        avisos.push('Este pago no quedó guardado como transacción: el dinero se descontará de la cuota del mismo periodo.')
      }

      if (numerosPagados.length > 0) {
        avisos.push(`Se desmarcarán como pagados ${numerosPagados.length} número(s) de la rifa.`)
      }

      return {
        success: true,
        resumen: {
          socioActividadId,
          actividadNombre: actividad?.descripcion || 'Actividad',
          valorTotal,
          valorFila,
          numerosPagados: numerosPagados.length,
          utilidadTipo: tipoUtil,
          cuotaOrigenId,
          tieneTransaccion: !!transaccion,
          avisos,
        },
      }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  /**
   * Revierte el pago del socio en la actividad. Orden deliberado (igual que al eliminar un pago
   * de cuota): primero los efectos externos y al final la propia fila, para que un fallo a mitad
   * deje el pago todavía visible y se pueda reintentar.
   *
   * @returns {Promise<{success: boolean, error?: string, revertido: object, problemas: string[]}>}
   */
  async function eliminarPagoActividad(socioActividadId, options = {}) {
    const revertido = { fila: false, numeros: 0, utilidad: 0, cuota: false, transaccion: false }
    const problemas = []

    try {
      const { data: socioAct, error: eSa } = await supabase
        .from('socios_actividad')
        .select('*, actividad:actividades(id, descripcion, tipo, tipo_rifa, estado, natillera_id)')
        .eq('id', socioActividadId)
        .single()
      if (eSa) throw eSa
      if (!socioAct) throw new Error('No se encontró el registro del socio en la actividad')

      const actividad = socioAct.actividad
      const valorFila = Number(socioAct.valor_pagado) || 0
      const numerosPagados = await getNumerosPagadosSocio(actividad, socioAct.socio_natillera_id)
      const valorPorNumeros = numerosPagados.reduce((s, n) => s + (Number(n.valor) || 0), 0)
      const valorTotal = Math.max(valorFila, valorPorNumeros)
      if (valorTotal <= 0) throw new Error('Este socio no tiene ningún pago registrado en la actividad')

      const formaPago = String(socioAct.forma_pago || '').toLowerCase() || null

      // ── 1. Devolver la utilidad que sumó al cobrarse ─────────────────────────
      const tipoUtil = cuotasStore.tipoUtilidadDeActividad(actividad?.tipo)
      if (tipoUtil && valorFila > 0) {
        const res = await cuotasStore.descontarUtilidadPorTipo(
          actividad?.natillera_id, tipoUtil, formaPago, valorFila, `actividades (${tipoUtil})`
        )
        revertido.utilidad = res.descontado
        problemas.push(...res.problemas)
      }

      // ── 2. Descontar el dinero de la cuota que lo cobró ───────────────────────
      const { transaccion, exacta } = await buscarTransaccionOrigen(socioAct, actividad)
      let cuotaOrigenId = transaccion?.cuota_id || null

      if (transaccion) {
        // La línea de esta actividad desaparece del detalle: si más tarde se elimina el pago de
        // la cuota, no debe revertir por segunda vez algo que ya no está cobrado.
        const detalle = Array.isArray(transaccion.detalle_actividades) ? transaccion.detalle_actividades : []
        const nuevoDetalle = detalle.filter(d =>
          exacta
            ? d?.socio_actividad_id !== socioAct.id
            : (d?.nombre || '') !== (actividad?.descripcion || '')
        )
        const quitado = detalle.length - nuevoDetalle.length > 0
          ? Math.min(valorFila, Number(transaccion.valor_actividades) || 0)
          : 0
        // Se pide el resultado: con RLS y sin política de UPDATE, PostgREST responde "ok" sin
        // tocar nada, y la transacción seguiría diciendo que cobró esta actividad.
        const { data: histActualizado, error: eHist } = await supabase
          .from('historial_pagos_cuota')
          .update({
            detalle_actividades: nuevoDetalle,
            valor_actividades: Math.max(0, (Number(transaccion.valor_actividades) || 0) - quitado),
            valor_total: Math.max(0, (Number(transaccion.valor_total) || 0) - quitado),
          })
          .eq('id', transaccion.id)
          .select('id')
        if (eHist) problemas.push(`Transacción del pago: ${eHist.message}`)
        else if ((histActualizado || []).length === 0) {
          problemas.push('No se pudo ajustar la transacción del pago de cuota: seguirá contando esta actividad. Revísala en el detalle de la cuota.')
        } else {
          revertido.transaccion = true
        }
      } else {
        const cuota = await buscarCuotaOrigenSinTransaccion(socioAct)
        cuotaOrigenId = cuota?.id || null
      }

      if (cuotaOrigenId) {
        const { data: cuota } = await supabase
          .from('cuotas').select('id, valor_pagado_actividades').eq('id', cuotaOrigenId).single()
        if (cuota) {
          const actual = Number(cuota.valor_pagado_actividades) || 0
          const { data: cuotaActualizada, error: eCuota } = await supabase
            .from('cuotas')
            .update({ valor_pagado_actividades: Math.max(0, actual - valorFila) })
            .eq('id', cuotaOrigenId)
            .select('id')
          if (eCuota) problemas.push(`Cuota que cobró la actividad: ${eCuota.message}`)
          else if ((cuotaActualizada || []).length === 0) {
            problemas.push('No se pudo descontar el dinero de la cuota que cobró la actividad: revísala en el módulo de Cuotas.')
          } else {
            revertido.cuota = true
          }
          if (actual < valorFila) {
            problemas.push('La cuota tenía menos dinero de actividades del que se revirtió: revisa el pago de esa cuota.')
          }
        }
      } else {
        problemas.push('No se identificó la cuota que cobró esta actividad: seguirá contando el dinero como actividades pagadas. Revísala en el módulo de Cuotas.')
      }

      // ── 3. Desmarcar los números de rifa pagados por este socio ───────────────
      if (numerosPagados.length > 0) {
        const { data: actualizados, error: eNum } = await supabase
          .from('numeros_rifa')
          .update({ estado: 'vendido', fecha_pago: null })
          .in('id', numerosPagados.map(n => n.id))
          .select('id')
        if (eNum) problemas.push(`Números de la rifa: ${eNum.message}`)
        else revertido.numeros = (actualizados || []).length
      }

      // ── 4. Dejar la fila del socio sin pago ──────────────────────────────────
      const { data: filaActualizada, error: eFila } = await supabase
        .from('socios_actividad')
        .update({
          valor_pagado: 0,
          valor_pagado_efectivo: 0,
          valor_pagado_transferencia: 0,
          codigo_comprobante: null,
          fecha_pago: null,
          estado: 'pendiente',
        })
        .eq('id', socioActividadId)
        .select('id')
        .maybeSingle()
      if (eFila) throw eFila
      if (!filaActualizada) {
        throw new Error('No se pudo actualizar el pago del socio en la actividad (sin permisos sobre esa natillera)')
      }
      revertido.fila = true

      // ── 5. Si la actividad se había liquidado sola al completarse, reabrirla ──
      // `fetchActividades` liquida automáticamente las actividades que no son rifa cuando lo
      // recaudado alcanza lo asignado. Al quitar dinero deja de estar completa.
      if (actividad?.estado === 'liquidada' && actividad?.tipo !== 'rifa') {
        const { data: filas } = await supabase
          .from('socios_actividad')
          .select('valor_asignado, valor_pagado')
          .eq('actividad_id', actividad.id)
        const asignado = (filas || []).reduce((s, f) => s + (Number(f.valor_asignado) || 0), 0)
        const pagado = (filas || []).reduce((s, f) => s + (Number(f.valor_pagado) || 0), 0)
        if (asignado > 0 && pagado < asignado) {
          const { error: eAct } = await supabase
            .from('actividades')
            .update({ estado: 'en_curso', ingresos: pagado, gastos: 0, utilidad: pagado })
            .eq('id', actividad.id)
          if (eAct) problemas.push(`Estado de la actividad: ${eAct.message}`)
        }
      }

      // ── 6. Auditoría (no bloquea) ────────────────────────────────────────────
      try {
        const auditoria = useAuditoria()
        const nombreSocio = options.socioNombre || socioAct.nombre_socio || 'Socio'
        await auditoria.registrarEliminacion(
          'socios_actividad', socioActividadId,
          `Se eliminó el pago de $${valorTotal.toLocaleString('es-CO')} de ${nombreSocio} en la actividad "${actividad?.descripcion || ''}"`,
          socioAct,
          actividad?.natillera_id ? String(actividad.natillera_id) : null,
          {
            socio_nombre: nombreSocio,
            actividad_id: actividad?.id || null,
            actividad_nombre: actividad?.descripcion || null,
            valor_revertido: valorTotal,
            utilidad_revertida: revertido.utilidad,
            numeros_desmarcados: revertido.numeros,
            cuota_id: cuotaOrigenId,
            transaccion_ajustada: revertido.transaccion,
            problemas,
          },
          options.natilleraNombre || null
        )
      } catch (e) {
        console.warn('Auditoría de eliminación de pago de actividad:', e.message)
      }

      return { success: true, revertido, problemas, valorRevertido: valorTotal }
    } catch (e) {
      console.error('Error eliminando el pago de la actividad:', e)
      return { success: false, error: e.message, revertido, problemas }
    }
  }

  return { previsualizarEliminacionPagoActividad, eliminarPagoActividad }
}

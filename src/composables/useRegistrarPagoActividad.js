import { supabase } from '../lib/supabase'
import { useCuotasStore } from '../stores/cuotas'
import { aplicarRecaudoRifaLiquidada } from './useRecaudoRifaLiquidada'

/**
 * Cobrar una actividad directamente, sin pasar por la cuota del socio.
 *
 * Hasta ahora el único sitio que cobraba una actividad era el pago de cuota (Cuotas →
 * `registrarPagosActividades`), que la cobra *junto con* la cuota del periodo. Eso deja
 * fuera el caso real de quien paga solo la rifa o solo el bingo, sin abonar su cuota.
 *
 * Un cobro directo toca DOS de los tres sitios que toca el cobro desde cuota:
 *
 *   1. `socios_actividad`: `valor_pagado`, su desglose efectivo/transferencia, la forma de
 *      pago, la causación y —solo si queda saldada— `fecha_pago` y el comprobante.
 *   2. `utilidades_clasificadas`, con el tipo de la actividad. Las rifas no suman aquí al
 *      cobrarse: su utilidad entra al liquidarlas desde Actividades. La excepción es cobrar
 *      una rifa YA liquidada, que sí mueve sus totales (ver `useRecaudoRifaLiquidada`).
 *
 * El tercero —la cuota que lo cobró (`cuotas.valor_pagado_actividades` y
 * `historial_pagos_cuota`)— NO aplica: aquí no hay cuota de por medio. Para que la
 * reversión lo sepa y no descuente de una cuota que nunca cobró esto, el comprobante se
 * marca con el prefijo PREFIJO_PAGO_DIRECTO (ver `useEliminarPagoActividad`).
 */

/** Marca del comprobante de un cobro hecho desde Actividades, sin cuota de por medio. */
export const PREFIJO_PAGO_DIRECTO = 'ACT-'

/** Los comprobantes del resto del sistema son 8 caracteres sin guiones: nunca colisiona. */
export function generarComprobanteDirecto() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return `${PREFIJO_PAGO_DIRECTO}${codigo}`
}

/** `fecha` es 'YYYY-MM-DD' del formulario; se guarda a mediodía para que no se corra de día. */
function fechaAIso(fecha) {
  if (!fecha) return new Date().toISOString()
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return new Date(`${fecha}T12:00:00`).toISOString()
  }
  return new Date(fecha).toISOString()
}

/** ¿El periodo de la actividad es el de hoy o uno anterior? Sin periodo, se da por vencida. */
function periodoYaLlego(mes, anio) {
  if (!mes || !anio) return true
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth() + 1
  if (anio !== anioActual) return anio < anioActual
  return mes <= mesActual
}

export function useRegistrarPagoActividad() {
  const cuotasStore = useCuotasStore()

  /**
   * Cuánto debe todavía un socio en una actividad.
   * @returns {Promise<{success: boolean, error?: string, resumen?: object}>}
   */
  async function consultarPendiente(socioActividadId) {
    try {
      const { data, error } = await supabase
        .from('socios_actividad')
        .select('id, valor_asignado, valor_pagado, forma_pago, actividad:actividades(id, descripcion, tipo, tipo_rifa, estado, natillera_id)')
        .eq('id', socioActividadId)
        .single()
      if (error) throw error

      const asignado = Number(data.valor_asignado) || 0
      const pagado = Number(data.valor_pagado) || 0
      return {
        success: true,
        resumen: {
          asignado,
          pagado,
          pendiente: Math.max(0, asignado - pagado),
          actividad: data.actividad || null,
          // En rifa aleatoria lo pagado sale también de los números; cobrarla por aquí
          // descuadraría con el reparto por número, así que se avisa a la UI.
          esRifaAleatoria: data.actividad?.tipo === 'rifa' && data.actividad?.tipo_rifa === 'aleatoria'
        }
      }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }

  /**
   * Registra el cobro. Orden deliberado: primero la fila (lo que el usuario verá), después la
   * utilidad; si la utilidad falla, el pago existe y el problema se reporta, en vez de dejar
   * una utilidad sumada sin pago detrás.
   *
   * @param {string} socioActividadId fila de `socios_actividad`
   * @param {{valor:number, formaPago:'efectivo'|'transferencia', fechaPago?:string, comprobante?:string}} datos
   *        `comprobante`: código ya generado, para que varias actividades cobradas en la misma
   *        operación compartan recibo. Si no se pasa, se genera uno al saldar.
   * @returns {Promise<{success:boolean, error?:string, valorRegistrado?:number, saldada?:boolean, problemas?:string[]}>}
   */
  async function registrarPagoActividad(socioActividadId, { valor, formaPago = 'efectivo', fechaPago = null, comprobante = null } = {}) {
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
      const asignado = Number(socioAct.valor_asignado) || 0
      const pagadoActual = Number(socioAct.valor_pagado) || 0
      const pendiente = Math.max(0, asignado - pagadoActual)

      const aPagar = Math.round(Number(valor) || 0)
      if (aPagar <= 0) return { success: false, error: 'El valor del pago debe ser mayor que cero' }
      if (pendiente <= 0) return { success: false, error: 'Este socio ya pagó toda su parte de la actividad' }
      if (aPagar > pendiente) return { success: false, error: `El valor supera lo pendiente ($${pendiente.toLocaleString('es-CO')})` }

      const forma = formaPago === 'transferencia' ? 'transferencia' : 'efectivo'
      const nuevoValorPagado = pagadoActual + aPagar
      const saldada = nuevoValorPagado >= asignado

      // El desglose es acumulativo: se suma al que ya hubiera de pagos anteriores.
      const efectivoPrevio = Number(socioAct.valor_pagado_efectivo) || 0
      const transferenciaPrevia = Number(socioAct.valor_pagado_transferencia) || 0

      const datosActualizar = {
        valor_pagado: nuevoValorPagado,
        forma_pago: forma,
        valor_pagado_efectivo: forma === 'efectivo' ? efectivoPrevio + aPagar : efectivoPrevio,
        valor_pagado_transferencia: forma === 'transferencia' ? transferenciaPrevia + aPagar : transferenciaPrevia,
        fecha_causacion: new Date().toISOString()
      }
      // `fecha_pago` marca cuándo quedó saldada: solo se escribe si este abono la cubre.
      if (saldada) datosActualizar.fecha_pago = fechaAIso(fechaPago)
      // El comprobante se escribe siempre en un cobro directo: es la marca que distingue
      // este pago de uno hecho desde la cuota, y también el recibo que se le entrega al socio.
      datosActualizar.codigo_comprobante = comprobante || generarComprobanteDirecto()

      // Se pide el resultado: con RLS y sin política de UPDATE, PostgREST responde «ok» sin
      // tocar nada y el pago se daría por hecho sin existir.
      const { data: filaActualizada, error: eUpdate } = await supabase
        .from('socios_actividad')
        .update(datosActualizar)
        .eq('id', socioActividadId)
        .select('id')
      if (eUpdate) throw eUpdate
      if ((filaActualizada || []).length === 0) {
        throw new Error('No se pudo registrar el pago (sin permisos sobre el registro)')
      }

      // ── Utilidad del fondo. Las rifas no suman aquí: entran al liquidarse ──────
      const tipoUtil = cuotasStore.tipoUtilidadDeActividad(actividad?.tipo)
      if (tipoUtil && actividad?.natillera_id) {
        const res = await cuotasStore.sumarUtilidadPorTipo(
          actividad.natillera_id, tipoUtil, forma, aPagar,
          `Utilidad de ${tipoUtil} (incluye pagos de actividades ${actividad.estado === 'liquidada' ? 'liquidadas' : 'en curso'})`
        )
        if (res?.problemas?.length) problemas.push(...res.problemas)
      }

      // ── Rifa ya liquidada: lo que se paga después sigue siendo recaudo suyo ────
      // La rifa no se reabre, pero sus totales y su ganancia sí se mueven; si no, la
      // tarjeta seguiría diciendo lo de aquel día y el fondo no contaría este dinero.
      if (actividad?.tipo === 'rifa' && actividad?.estado === 'liquidada') {
        const recaudo = await aplicarRecaudoRifaLiquidada(actividad.id, {
          efectivo: forma === 'efectivo' ? aPagar : 0,
          transferencia: forma === 'transferencia' ? aPagar : 0
        })
        if (recaudo?.problemas?.length) problemas.push(...recaudo.problemas)
      }

      return {
        success: true,
        valorRegistrado: aPagar,
        saldada,
        comprobante: datosActualizar.codigo_comprobante,
        problemas
      }
    } catch (e) {
      return { success: false, error: e.message, problemas }
    }
  }

  /**
   * Actividades de la natillera que un socio todavía debe **y que ya se pueden cobrar**,
   * con su valor pendiente.
   *
   * Solo entran las del periodo actual o anteriores: una actividad asignada a noviembre no
   * se le cobra a nadie en septiembre, aunque la fila ya exista (las series se crean de una
   * vez para todos los meses). Las filas sin periodo sí entran: no hay nada que compare y
   * esconderlas ocultaría una deuda real.
   *
   * Las rifas aleatorias SÍ entran: su cobro es el de la fila, igual que cuando se cobran
   * desde la cuota (Cuotas tampoco toca `numeros_rifa` al cobrar). Lo que sí se tiene en
   * cuenta es lo ya pagado por número, que en esas rifas cuenta como pagado aunque la fila
   * siga en cero; si no, se ofrecería cobrar dos veces lo mismo.
   */
  async function actividadesPendientesDeSocio(natilleraId, socioNatilleraId) {
    try {
      const { data, error } = await supabase
        .from('socios_actividad')
        .select('id, valor_asignado, valor_pagado, mes_pago, anio_pago, actividad:actividades!inner(id, descripcion, tipo, tipo_rifa, estado, natillera_id)')
        .eq('socio_natillera_id', socioNatilleraId)
        .eq('actividad.natillera_id', natilleraId)
      if (error) throw error

      const filas = (data || []).filter((f) => periodoYaLlego(f.mes_pago, f.anio_pago))

      // En rifa aleatoria lo pagado que ve el usuario es el máximo entre la fila y sus
      // números pagados: se consulta para no ofrecer cobrar algo ya cobrado por número.
      const idsRifaAleatoria = filas
        .filter((f) => f.actividad?.tipo === 'rifa' && f.actividad?.tipo_rifa === 'aleatoria')
        .map((f) => f.actividad.id)
      const pagadoPorNumeros = {}
      if (idsRifaAleatoria.length > 0) {
        const { data: numeros } = await supabase
          .from('numeros_rifa')
          .select('actividad_id, valor')
          .in('actividad_id', idsRifaAleatoria)
          .eq('socio_vendedor_id', socioNatilleraId)
          .eq('estado', 'pagado')
        ;(numeros || []).forEach((n) => {
          pagadoPorNumeros[n.actividad_id] = (pagadoPorNumeros[n.actividad_id] || 0) + (Number(n.valor) || 0)
        })
      }

      const pendientes = filas
        .map((fila) => {
          const asignado = Number(fila.valor_asignado) || 0
          const pagado = Math.max(Number(fila.valor_pagado) || 0, pagadoPorNumeros[fila.actividad?.id] || 0)
          return {
            id: fila.id,
            actividad: fila.actividad,
            mesPago: fila.mes_pago,
            anioPago: fila.anio_pago,
            asignado,
            pagado,
            pendiente: Math.max(0, asignado - pagado)
          }
        })
        .filter((f) => f.pendiente > 0)
        .sort((a, b) => (a.anioPago || 0) - (b.anioPago || 0) || (a.mesPago || 0) - (b.mesPago || 0))

      return { success: true, pendientes }
    } catch (e) {
      return { success: false, error: e.message, pendientes: [] }
    }
  }

  return { consultarPendiente, registrarPagoActividad, actividadesPendientesDeSocio }
}

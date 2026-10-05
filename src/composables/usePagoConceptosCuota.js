import { supabase } from '../lib/supabase'
import { fechaPagoAIso } from '../utils/formatDate'
import { aplicarRecaudoRifaLiquidada } from './useRecaudoRifaLiquidada'
import { registrarMoraCobradaEnFondo } from './usePagoPrestamo'

/*
 * Lo que un pago de cuota arrastra además de la cuota: actividades y cuotas de préstamo.
 * Vivía dentro de Cuotas.vue, atado al estado del modal de pago; se sacó aquí para que la
 * carga rápida registre esos conceptos exactamente igual que el pago normal.
 */

/** Código alfanumérico de comprobante: 8 caracteres, sin I, O, 0 ni 1 para no confundirlos. */
export function generarCodigoComprobante() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

/**
 * Reparte por forma de pago lo abonado a una actividad en esta transacción. Con pago mixto
 * se usa el mismo ratio que la fila; sin forma conocida va a `otro`, que en utilidades es
 * la fila sin forma de pago.
 */
export function repartoPorFormaDePago(valorPagado, formaPagoAct, options) {
  if (formaPagoAct === 'efectivo') return { efectivo: valorPagado, transferencia: 0, otro: 0 }
  if (formaPagoAct === 'transferencia') return { efectivo: 0, transferencia: valorPagado, otro: 0 }
  if (formaPagoAct === 'mixto' && options.valorPagado > 0) {
    const efectivo = Math.round(valorPagado * ((options.valorEfectivo || 0) / options.valorPagado))
    return { efectivo, transferencia: valorPagado - efectivo, otro: 0 }
  }
  return { efectivo: 0, transferencia: 0, otro: valorPagado }
}

/**
 * Abona a las actividades de un socio desde un pago de cuota: actualiza `socios_actividad`,
 * mueve el recaudo de rifas liquidadas y suma utilidades por tipo. Es el mismo camino para
 * el pago normal (Cuotas.vue) y para la carga rápida.
 *
 * `actividades`: [{ id, actividad_id, actividad, valor_pendiente, valor_pagado_actual, valor_asignado }]
 * `options`: { fechaPago, valorPagado, valorEfectivo, valorTransferencia }
 */
export async function pagarActividadesDeCuota({ natilleraId, actividades, valorTotal, tipoPago = null, options = {} }) {
  if (!natilleraId || !actividades?.length) return
  try {
    const actividadesParaPagar = actividades

    // Forma de pago con la que se paga la cuota (se guarda en socios_actividad al pagar actividad desde cuota)
    const formaPagoAct = (tipoPago && ['efectivo', 'transferencia', 'mixto'].includes((tipoPago || '').toLowerCase()))
      ? (tipoPago || '').toLowerCase()
      : null

    // La actividad se paga con la fecha que el usuario eligió en el modal de la cuota, no con
    // la del servidor. El trigger `update_estado_socio_actividad` solo pone NOW() si la columna
    // llega vacía, así que mandarla explícitamente basta para que respete la del formulario.
    const fechaPagoIso = fechaPagoAIso(options.fechaPago)
    const fechaCausacionIso = new Date().toISOString()
    
    // Calcular el total de actividades seleccionadas
    const totalActividades = actividadesParaPagar.reduce((sum, a) => sum + a.valor_pendiente, 0)
    
    // Si el valor total es mayor o igual al total de actividades, pagar todas completamente
    // Si es menor, distribuir proporcionalmente
    let valorRestante = valorTotal
    
    // Array para rastrear los pagos por tipo de actividad para utilidades
    const pagosPorTipoUtilidad = {} // { tipo: { liquidada: valor, en_curso: valor } }

    // Las rifas ya liquidadas van aparte: su recaudo y su ganancia son de la rifa concreta,
    // no del montón «rifas», así que se anotan con su actividad y su forma de pago.
    const pagosRifaLiquidada = [] // [{ actividadId, efectivo, transferencia, otro }]
    
    // Preparar updates de todas las actividades (sin loops de unicidad)
    const updatesActividades = []
    
    if (valorRestante >= totalActividades) {
      for (const actividad of actividadesParaPagar) {
        const nuevoValorPagado = actividad.valor_asignado
        const valorPagadoEnEstaTransaccion = actividad.valor_pendiente
        const codigoComprobante = generarCodigoComprobante()
        
        // Queda saldada en esta pasada: la fecha de pago es la del formulario.
        const datosActualizar = {
          valor_pagado: nuevoValorPagado,
          codigo_comprobante: codigoComprobante,
          fecha_pago: fechaPagoIso,
          fecha_causacion: fechaCausacionIso
        }
        if (formaPagoAct != null) datosActualizar.forma_pago = formaPagoAct
        if (formaPagoAct === 'mixto' && options.valorPagado > 0) {
          const ratioEf = (options.valorEfectivo || 0) / options.valorPagado
          datosActualizar.valor_pagado_efectivo = Math.round(valorPagadoEnEstaTransaccion * ratioEf)
          datosActualizar.valor_pagado_transferencia = valorPagadoEnEstaTransaccion - datosActualizar.valor_pagado_efectivo
        }
        
        updatesActividades.push({ actividad, datosActualizar, valorPagadoEnEstaTransaccion })
      }
    } else {
      for (const actividad of actividadesParaPagar) {
        if (valorRestante <= 0) break
        const porcentaje = actividad.valor_pendiente / totalActividades
        const valorAPagar = Math.min(valorRestante, Math.round(actividad.valor_pendiente * porcentaje))
        const nuevoValorPagado = actividad.valor_pagado_actual + valorAPagar
        const codigoComprobante = nuevoValorPagado >= actividad.valor_asignado ? generarCodigoComprobante() : null
        
        // `fecha_pago` marca cuándo quedó saldada la actividad, así que solo se escribe si este
        // abono la termina de cubrir. La causación, en cambio, la lleva cualquier abono: registra
        // que hoy se movió algo en esa fila.
        const datosActualizar = { valor_pagado: nuevoValorPagado, fecha_causacion: fechaCausacionIso }
        if (codigoComprobante) datosActualizar.codigo_comprobante = codigoComprobante
        if (nuevoValorPagado >= actividad.valor_asignado) datosActualizar.fecha_pago = fechaPagoIso
        if (formaPagoAct != null) datosActualizar.forma_pago = formaPagoAct
        if (formaPagoAct === 'mixto' && options.valorPagado > 0) {
          const ratioEf = (options.valorEfectivo || 0) / options.valorPagado
          datosActualizar.valor_pagado_efectivo = Math.round(valorAPagar * ratioEf)
          datosActualizar.valor_pagado_transferencia = valorAPagar - (datosActualizar.valor_pagado_efectivo || 0)
        }
        
        updatesActividades.push({ actividad, datosActualizar, valorPagadoEnEstaTransaccion: valorAPagar })
        valorRestante -= valorAPagar
      }
    }
    
    // Ejecutar TODOS los updates de actividades en paralelo
    const resultados = await Promise.allSettled(
      updatesActividades.map(({ actividad, datosActualizar }) =>
        supabase.from('socios_actividad').update(datosActualizar).eq('id', actividad.id)
      )
    )
    
    // Rastrear resultados para utilidades
    resultados.forEach((res, idx) => {
      const { actividad, valorPagadoEnEstaTransaccion } = updatesActividades[idx]
      if (res.status === 'rejected' || res.value?.error) {
        console.error(`Error actualizando actividad ${actividad.id}:`, res.value?.error || res.reason)
        return
      }
      if (actividad.actividad) {
        const estadoActividad = actividad.actividad.estado
        const tipoActividad = actividad.actividad.tipo || 'otro'
        const tipoUtilidad = tipoActividad === 'rifa' ? 'rifas' : tipoActividad
        if (!pagosPorTipoUtilidad[tipoUtilidad]) pagosPorTipoUtilidad[tipoUtilidad] = { liquidada: 0, en_curso: 0 }
        if (estadoActividad === 'liquidada') {
          pagosPorTipoUtilidad[tipoUtilidad].liquidada += valorPagadoEnEstaTransaccion
        } else if (tipoUtilidad !== 'rifas') {
          pagosPorTipoUtilidad[tipoUtilidad].en_curso += valorPagadoEnEstaTransaccion
        }
        if (tipoUtilidad === 'rifas' && estadoActividad === 'liquidada' && valorPagadoEnEstaTransaccion > 0) {
          // El mixto se parte con el mismo ratio que ya se aplicó a la fila, para que la
          // utilidad de la rifa quede repartida por forma de pago igual que su recaudo.
          const reparto = repartoPorFormaDePago(valorPagadoEnEstaTransaccion, formaPagoAct, options)
          pagosRifaLiquidada.push({ actividadId: actividad.actividad.id, ...reparto })
        }
      }
    })
    
    // Rifas liquidadas: mover sus totales y su ganancia. También en segundo plano, y con
    // los fallos en consola: un problema aquí no debe tumbar un pago que ya se registró.
    if (pagosRifaLiquidada.length > 0) {
      ;(async () => {
        for (const pago of pagosRifaLiquidada) {
          const res = await aplicarRecaudoRifaLiquidada(pago.actividadId, pago)
          if (res?.problemas?.length) console.error('Recaudo posterior de rifa liquidada:', res.problemas)
        }
      })()
    }

    // Fire-and-forget: registrar utilidades en background (no bloquea el retorno)
    if (natilleraId && Object.keys(pagosPorTipoUtilidad).length > 0) {
      ;(async () => {
        for (const [tipoUtilidad, pagos] of Object.entries(pagosPorTipoUtilidad)) {
          if (tipoUtilidad === 'rifas') continue

          if (pagos.liquidada > 0) {
            try {
              const queryLiquidada = (q) => {
                let chain = q.eq('natillera_id', natilleraId).eq('tipo', tipoUtilidad).is('fecha_cierre', null)
                if (formaPagoAct != null) chain = chain.eq('forma_pago', formaPagoAct)
                else chain = chain.is('forma_pago', null)
                return chain
              }
              const { data: existLiquidada } = await queryLiquidada(supabase.from('utilidades_clasificadas').select('id, monto')).maybeSingle()
              const montoFinalLiquidada = (parseFloat(existLiquidada?.monto) || 0) + pagos.liquidada
              if (existLiquidada) {
                await supabase.from('utilidades_clasificadas')
                  .update({ monto: montoFinalLiquidada, descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades liquidadas)`, updated_at: new Date().toISOString() })
                  .eq('id', existLiquidada.id)
              } else {
                const insertLiquidada = { natillera_id: natilleraId, tipo: tipoUtilidad, monto: montoFinalLiquidada, fecha_cierre: null, descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades liquidadas)`, detalles: {} }
                if (formaPagoAct != null) insertLiquidada.forma_pago = formaPagoAct
                await supabase.from('utilidades_clasificadas').insert(insertLiquidada)
              }
            } catch (errLiquidada) {
              console.error(`Error registrando utilidad de ${tipoUtilidad} (liquidada):`, errLiquidada)
            }
          }

          if (pagos.en_curso > 0) {
            try {
              const queryEnCurso = (q) => {
                let chain = q.eq('natillera_id', natilleraId).eq('tipo', tipoUtilidad).is('fecha_cierre', null)
                if (formaPagoAct != null) chain = chain.eq('forma_pago', formaPagoAct)
                else chain = chain.is('forma_pago', null)
                return chain
              }
              const { data: existEnCurso } = await queryEnCurso(supabase.from('utilidades_clasificadas').select('id, monto')).maybeSingle()
              const montoFinalEnCurso = (parseFloat(existEnCurso?.monto) || 0) + pagos.en_curso
              if (existEnCurso) {
                await supabase.from('utilidades_clasificadas')
                  .update({ monto: montoFinalEnCurso, descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades en curso)`, updated_at: new Date().toISOString() })
                  .eq('id', existEnCurso.id)
              } else {
                const insertEnCurso = { natillera_id: natilleraId, tipo: tipoUtilidad, monto: montoFinalEnCurso, fecha_cierre: null, descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades en curso)`, detalles: {} }
                if (formaPagoAct != null) insertEnCurso.forma_pago = formaPagoAct
                await supabase.from('utilidades_clasificadas').insert(insertEnCurso)
              }
            } catch (errEnCurso) {
              console.error(`Error registrando utilidad de ${tipoUtilidad} (en curso):`, errEnCurso)
            }
          }
        }
      })()
    }
  } catch (error) {
    console.error('Error registrando pagos de actividades:', error)
  }
}

/**
 * Abona a las cuotas de préstamo de un socio desde un pago de cuota natillera: inserta
 * `pagos_prestamo` (enlazado al historial del pago), baja el saldo del préstamo y marca
 * `plan_pagos_prestamo`. Devuelve las líneas aplicadas, para el comprobante.
 *
 * `cuotasPrestamo`: [{ id, prestamo_id, numero_cuota, valor_cuota, valor_pagado_actual,
 *   valor_pagado_efectivo_actual, valor_pagado_transferencia_actual, valor_pendiente, fecha_proyectada,
 *   mora? }] — `mora`: la de esa cuota a la fecha del pago (va al fondo, no al saldo)
 * `valorTotal`: lo recibido para préstamos, mora incluida (se cubre primero la mora)
 * `natilleraId`: necesario para llevar la mora al fondo de utilidades
 * `options`: { fechaPago, valorPagado, valorEfectivo, historialPagoIdPromise }
 */
export async function pagarCuotasPrestamoDeCuota({ cuotaId, natilleraId = null, nombreSocio = null, nombreNatillera = null, cuotasPrestamo, valorTotal, tipoPago = null, options = {} }) {
  const detalleLineasPrestamo = []
  if (!cuotasPrestamo?.length) return detalleLineasPrestamo
  try {
    // Forma de pago de la cuota natillera (efectivo / transferencia / mixto). Se propaga
    // a pagos_prestamo y plan_pagos_prestamo para que el cuadre lea el desglose correcto.
    const tp = (tipoPago || '').toLowerCase()
    const formaPagoCp = ['efectivo', 'transferencia', 'mixto'].includes(tp) ? tp : null
    const valorTotalPago = parseFloat(options.valorPagado) || 0
    const valorEfTotal = parseFloat(options.valorEfectivo) || 0
    const ratioEf = formaPagoCp === 'mixto' && valorTotalPago > 0
      ? valorEfTotal / valorTotalPago
      : (formaPagoCp === 'efectivo' ? 1 : (formaPagoCp === 'transferencia' ? 0 : 1))
    const splitMonto = (monto) => {
      const ef = formaPagoCp === 'mixto' ? Math.round(monto * ratioEf) : (formaPagoCp === 'transferencia' ? 0 : monto)
      const tr = monto - ef
      return { ef, tr }
    }
    const formaPagoParaCuota = (vEf, vTr) => {
      if (vEf > 0 && vTr > 0) return 'mixto'
      if (vEf > 0) return 'efectivo'
      if (vTr > 0) return 'transferencia'
      return formaPagoCp
    }

    const cuotasPrestamosParaPagar = cuotasPrestamo

    // Calcular el total de cuotas de préstamos seleccionadas
    const totalCuotasPrestamos = cuotasPrestamosParaPagar.reduce((sum, cp) => sum + cp.valor_pendiente, 0)

    // Mora de las cuotas (a la fecha del pago), con la regla de Préstamos: lo recibido cubre
    // PRIMERO la mora y el resto va al préstamo. `valorTotal` trae ambas cosas. La mora queda
    // en el abono (mora_cobrada) y va al fondo de utilidades; no baja el saldo.
    const totalMoraCuotas = cuotasPrestamosParaPagar.reduce((sum, cp) => sum + (Number(cp.mora) || 0), 0)
    const moraACobrar = Math.min(Math.max(0, valorTotal), totalMoraCuotas)
    const valorAbono = Math.max(0, valorTotal - moraACobrar)

    // Agrupar cuotas por préstamo para registrar pagos por préstamo
    const pagosPorPrestamo = {}
    cuotasPrestamosParaPagar.forEach(cp => {
      if (!pagosPorPrestamo[cp.prestamo_id]) {
        pagosPorPrestamo[cp.prestamo_id] = {
          prestamo_id: cp.prestamo_id,
          cuotas: [],
          valorTotal: 0,
          mora: 0
        }
      }
      pagosPorPrestamo[cp.prestamo_id].cuotas.push(cp)
      pagosPorPrestamo[cp.prestamo_id].valorTotal += cp.valor_pendiente
      pagosPorPrestamo[cp.prestamo_id].mora += Number(cp.mora) || 0
    })

    // Si el valor (ya sin la mora) cubre el total de cuotas, se pagan todas completamente;
    // si es menor, se distribuye proporcionalmente
    let valorRestante = valorAbono
    // Fecha elegida en el modal de pago (o ahora, si no se indicó). Mantiene pagos_prestamo y
    // plan_pagos_prestamo alineados con cuotas.fecha_pago e historial_pagos_cuota.fecha_pago.
    const fechaPago = fechaPagoAIso(options.fechaPago)
    const fechaCausacion = new Date().toISOString()

    // Procesar todos los préstamos en paralelo
    const prestamoIds = Object.keys(pagosPorPrestamo)

    // Id de la transacción en historial_pagos_cuota que origina estos abonos. Se enlaza en
    // pagos_prestamo.historial_pago_cuota_id (migración 019) para poder revertir el abono exacto
    // si más tarde se elimina el pago. El insert del historial corre en segundo plano dentro del
    // store, así que se espera con tope: si tarda o falla, el abono se registra igual sin enlace.
    const historialPagoCuotaId = options.historialPagoIdPromise
      ? await Promise.race([
          options.historialPagoIdPromise.catch(() => null),
          new Promise(resolve => setTimeout(() => resolve(null), 4000)),
        ])
      : null

    // Pre-obtener saldos de todos los préstamos en una sola query
    const { data: prestamosData } = await supabase
      .from('prestamos')
      .select('id, saldo_actual, estado')
      .in('id', prestamoIds)
    const prestamosMap = new Map((prestamosData || []).map(p => [p.id, p]))

    const promesasPrestamos = prestamoIds.map(async (prestamoId) => {
      const infoPrestamo = pagosPorPrestamo[prestamoId]
      const cuotasDelPrestamo = infoPrestamo.cuotas
      const proporcionPrestamo = totalCuotasPrestamos > 0 ? infoPrestamo.valorTotal / totalCuotasPrestamos : 0
      const valorAPagarPrestamo = Math.min(valorRestante, valorAbono * proporcionPrestamo)
      // Su parte de la mora cobrada, proporcional a la mora que generaron sus cuotas
      const moraPrestamo = totalMoraCuotas > 0 ? Math.round(moraACobrar * (infoPrestamo.mora / totalMoraCuotas)) : 0

      if (valorAPagarPrestamo <= 0 && moraPrestamo <= 0) return

      const codigoComprobante = generarCodigoComprobante()
      const splitPrestamo = splitMonto(valorAPagarPrestamo)

      // Pre-calcular qué cuotas va a tocar este abono y cuánto a cada una,
      // para poder guardarlo en pagos_prestamo.numeros_cuota.
      const cuotasOrdenadas = [...cuotasDelPrestamo].sort((a, b) => a.numero_cuota - b.numero_cuota)
      const aplicacionesCuota = []
      let restanteParaPlan = valorAPagarPrestamo
      for (const cp of cuotasOrdenadas) {
        if (restanteParaPlan <= 0) break
        const aPagar = Math.min(restanteParaPlan, cp.valor_pendiente)
        if (aPagar > 0) aplicacionesCuota.push({ cuota: cp, valor: aPagar })
        restanteParaPlan -= aPagar
      }
      const numerosCuotaTocados = aplicacionesCuota.map(a => a.cuota.numero_cuota)

      const datosPago = {
        prestamo_id: prestamoId,
        valor: valorAPagarPrestamo,
        fecha: fechaPago,
        fecha_causacion: fechaCausacion,
        nombre_socio: nombreSocio,
        nombre_natillera: nombreNatillera,
        codigo_comprobante: codigoComprobante,
        valor_efectivo: splitPrestamo.ef,
        valor_transferencia: splitPrestamo.tr,
        numeros_cuota: numerosCuotaTocados.length > 0 ? numerosCuotaTocados : null,
        origen: 'cuota_natillera'
      }
      if (moraPrestamo > 0) datosPago.mora_cobrada = moraPrestamo
      if (historialPagoCuotaId) datosPago.historial_pago_cuota_id = historialPagoCuotaId

      // Insertar pago + actualizar préstamo en paralelo
      const prestamo = prestamosMap.get(prestamoId)
      const saldoAnterior = parseFloat(prestamo?.saldo_actual || 0)
      const nuevoSaldo = Math.max(0, saldoAnterior - valorAPagarPrestamo)
      let nuevoEstado = prestamo?.estado || 'activo'
      if (nuevoSaldo <= 0 && nuevoEstado === 'activo') nuevoEstado = 'pagado'

      const [pagoResInicial] = await Promise.all([
        supabase.from('pagos_prestamo').insert(datosPago).select().single(),
        supabase.from('prestamos').update({ saldo_actual: nuevoSaldo, estado: nuevoEstado }).eq('id', prestamoId)
      ])

      // Si la migración 019 aún no se aplicó, la columna de enlace no existe: reintentar sin ella
      // para no perder el abono (el pago se registra igual, solo sin trazabilidad para revertirlo).
      let pagoRes = pagoResInicial
      if (pagoRes.error && datosPago.historial_pago_cuota_id
          && String(pagoRes.error.message || '').includes('historial_pago_cuota_id')) {
        console.warn('pagos_prestamo: falta la columna historial_pago_cuota_id (migración 019). Registrando el abono sin enlace.')
        const { historial_pago_cuota_id: _omitido, ...datosPagoSinEnlace } = datosPago
        pagoRes = await supabase.from('pagos_prestamo').insert(datosPagoSinEnlace).select().single()
      }

      if (pagoRes.error) {
        console.error(`Error insertando pago de préstamo ${prestamoId}:`, pagoRes.error)
        return
      }

      if (moraPrestamo > 0 && natilleraId) {
        await registrarMoraCobradaEnFondo(natilleraId, moraPrestamo, formaPagoCp)
      }

      // Aplicar las cuotas pre-calculadas
      const updatesCuotas = []
      for (const aplicacion of aplicacionesCuota) {
        const cuotaPrestamo = aplicacion.cuota
        const valorAPagarCuota = aplicacion.valor
        const nuevoValorPagado = cuotaPrestamo.valor_pagado_actual + valorAPagarCuota
        const estaCompleta = nuevoValorPagado >= cuotaPrestamo.valor_cuota

        const splitCuota = splitMonto(valorAPagarCuota)
        const nuevoValorEf = cuotaPrestamo.valor_pagado_efectivo_actual + splitCuota.ef
        const nuevoValorTr = cuotaPrestamo.valor_pagado_transferencia_actual + splitCuota.tr

        const datosActualizar = {
          valor_pagado: nuevoValorPagado,
          valor_pagado_efectivo: nuevoValorEf,
          valor_pagado_transferencia: nuevoValorTr,
          forma_pago: formaPagoParaCuota(nuevoValorEf, nuevoValorTr),
          // Igual que en actividades: `fecha_pago` solo cuando la cuota del plan queda saldada
          // (se escribe más abajo); la causación la lleva cualquier abono.
          fecha_causacion: fechaCausacion,
          nombre_socio: nombreSocio,
          socio_nombre: nombreSocio,
          // Enlace a la cuota natillera desde la que se abonó. Es lo único que
          // permite distinguir «se pagó junto con la cuota» de «se pagó desde
          // Préstamos»: sin él, la lista y el comprobante adivinaban por fecha o
          // por período y colaban abonos hechos desde el otro módulo.
          cuota_id: cuotaId
        }
        if (estaCompleta) {
          datosActualizar.pagada = true
          datosActualizar.fecha_pago = fechaPago
          if (cuotaPrestamo.fecha_proyectada) {
            const d = new Date(cuotaPrestamo.fecha_proyectada)
            if (!isNaN(d.getTime())) {
              datosActualizar.mes = d.getMonth() + 1
              datosActualizar.anio = d.getFullYear()
              datosActualizar.quincena = d.getDate() <= 15 ? 1 : 2
            }
          }
        }

        updatesCuotas.push(
          supabase.from('plan_pagos_prestamo').update(datosActualizar).eq('id', cuotaPrestamo.id)
            .then(res => {
              if (!res.error && valorAPagarCuota > 0) {
                detalleLineasPrestamo.push({
                  nombre: `Cuota préstamo #${cuotaPrestamo.numero_cuota}`,
                  valor: valorAPagarCuota,
                  numero_cuota: cuotaPrestamo.numero_cuota,
                  prestamo_id: cuotaPrestamo.prestamo_id
                })
              } else if (res.error) {
                console.error(`Error actualizando plan_pagos_prestamo ${cuotaPrestamo.id}:`, res.error)
              }
            })
        )
      }

      await Promise.allSettled(updatesCuotas)
      valorRestante -= valorAPagarPrestamo
    })

    await Promise.allSettled(promesasPrestamos)

    return detalleLineasPrestamo
  } catch (error) {
    console.error('Error registrando pagos de cuotas de préstamos:', error)
    return detalleLineasPrestamo
  }
}

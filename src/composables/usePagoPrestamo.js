import { supabase } from '../lib/supabase'
import { parseDateLocal, formatDateToLocalISO } from '../utils/formatDate'
import { parseReglasInteresPrestamo, diasGraciaPrestamo } from '../utils/natilleraPrestamos'

/*
 * Pagos de préstamo: mora, desglose de un abono, interés al fondo y recálculo del plan.
 * Salió de Prestamos.vue para que el retiro de un socio (Socios.vue) cruce su liquidación
 * con lo que debe usando exactamente las mismas reglas que un abono normal.
 */

/** Devuelve mes (1-12), anio y quincena (1 o 2) desde fecha_proyectada para plan_pagos_prestamo */
export function periodoDesdeFechaProyectada(fechaProyectada) {
  if (!fechaProyectada) return { mes: null, anio: null, quincena: null }
  const d = new Date(fechaProyectada)
  if (isNaN(d.getTime())) return { mes: null, anio: null, quincena: null }
  const dia = d.getDate()
  return {
    mes: d.getMonth() + 1,
    anio: d.getFullYear(),
    quincena: dia <= 15 ? 1 : 2
  }
}

export function fechaLimiteSinMora(cuota, diasGracia = 0) {
  const fecha = parseDateLocal(cuota.fecha_proyectada)
  fecha.setHours(0, 0, 0, 0)
  const gracia = Number(diasGracia) || 0
  if (gracia > 0) fecha.setDate(fecha.getDate() + gracia)
  return fecha
}

// Mora de UNA cuota vencida: solo sobre el capital pendiente de esa cuota
// (no sobre el interés → sin anatocismo), proporcional a los días de atraso
// con base de 30 días. diasMora se cuenta desde el día siguiente al fin de la
// gracia hasta `fechaCorte` (hoy, o la fecha de pago al liquidar).
//   moraCuota = capitalPendienteCuota × (tasaMoraMensual/100/30) × diasMora
export function calcularMoraCuota(cuota, tasaMora, fechaCorte, diasGracia = 0) {
  const tasa = Number(tasaMora) || 0
  if (tasa <= 0 || !cuota) return 0
  const valorCuota = parseFloat(cuota.valor_cuota || 0)
  if (valorCuota <= 0) return 0
  const pendiente = Math.max(0, valorCuota - parseFloat(cuota.valor_pagado || 0))
  if (pendiente <= 0) return 0
  // Proporción de capital aún debida en esta cuota (excluye el interés)
  const capitalPendiente = parseFloat(cuota.capital || 0) * (pendiente / valorCuota)
  if (capitalPendiente <= 0) return 0
  const fv = fechaLimiteSinMora(cuota, diasGracia)
  const corte = new Date(fechaCorte)
  corte.setHours(0, 0, 0, 0)
  const diasMora = Math.floor((corte - fv) / 86400000) // día siguiente al límite = 1
  if (diasMora <= 0) return 0
  return capitalPendiente * (tasa / 100 / 30) * diasMora
}

// Mora acumulada de un préstamo = suma de la mora de sus cuotas vencidas.
export function calcularMoraPrestamo(cuotasVencidasArray, tasaMora, fechaCorte, diasGracia = 0) {
  return (cuotasVencidasArray || []).reduce(
    (sum, c) => sum + calcularMoraCuota(c, tasaMora, fechaCorte, diasGracia),
    0
  )
}

// Desglosa un abono en (mora, capital+interés) recorriendo las cuotas vencidas de la
// más antigua a la más nueva. Cada cuota "cuesta" pendiente + su mora; el pago cubre
// ese costo cuota por cuota (parcial proporcional en la última cuota alcanzada). Así la
// mora cobrada es PROPORCIONAL a la(s) cuota(s) que se pagan y coincide con el plan de
// pagos (pagar «valor_cuota + mora» de una cuota la liquida exacto). El excedente sobre
// las cuotas vencidas va al préstamo (cuotas futuras), sin mora.
export function desglosarAbonoConMora(valor, cuotasVencidasOrdenadas, tasaMora, fechaCorte, diasGracia = 0) {
  const total = parseFloat(valor) || 0
  let restante = total
  let mora = 0
  for (const c of (cuotasVencidasOrdenadas || [])) {
    if (restante <= 0) break
    const pendiente = Math.max(0, parseFloat(c.valor_cuota || 0) - parseFloat(c.valor_pagado || 0))
    if (pendiente <= 0) continue
    const moraC = calcularMoraCuota(c, tasaMora, fechaCorte, diasGracia)
    const costo = pendiente + moraC
    if (costo <= 0) continue
    if (restante >= costo) {
      mora += moraC
      restante -= costo
    } else {
      mora += moraC * (restante / costo)
      restante = 0
    }
  }
  const moraPagada = Math.round(mora)
  return { moraPagada, abonoAPrestamo: Math.max(0, Math.round(total - moraPagada)) }
}

// Registra en el fondo común (utilidades_clasificadas) el interés de mora COBRADO
// en un abono. Rubro separado (subtipo='mora', id_actividad=null → no se mezcla con
// el interés por préstamo ni con «Intereses ganados»). Se acumula por forma de pago
// (respetando el índice único de la tabla). NO modifica el saldo (no capitaliza).
export async function registrarMoraCobradaEnFondo(natilleraId, montoMora, formaPago) {
  try {
    if (!natilleraId || !montoMora || montoMora <= 0) return
    const monto = Math.round(montoMora)

    const fpNorm = ['efectivo', 'transferencia', 'mixto'].includes((formaPago || '').toLowerCase())
      ? (formaPago || '').toLowerCase()
      : null

    let query = supabase
      .from('utilidades_clasificadas')
      .select('id, monto, detalles')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'prestamos')
      .is('id_actividad', null)
      .filter('detalles->>subtipo', 'eq', 'mora')
      .is('fecha_cierre', null)
    query = fpNorm != null ? query.eq('forma_pago', fpNorm) : query.is('forma_pago', null)
    const { data: filaMora } = await query.maybeSingle()

    if (filaMora) {
      await supabase
        .from('utilidades_clasificadas')
        .update({
          monto: parseFloat(filaMora.monto || 0) + monto,
          descripcion: 'Interés de mora de préstamos',
          detalles: { ...(filaMora.detalles || {}), subtipo: 'mora' },
          updated_at: new Date().toISOString()
        })
        .eq('id', filaMora.id)
    } else {
      await supabase
        .from('utilidades_clasificadas')
        .insert({
          natillera_id: natilleraId,
          tipo: 'prestamos',
          id_actividad: null,
          monto,
          fecha_cierre: null,
          forma_pago: fpNorm,
          descripcion: 'Interés de mora de préstamos',
          detalles: { subtipo: 'mora' }
        })
    }
  } catch (e) {
    console.error('Error registrando mora cobrada en el fondo:', e)
  }
}

/*
 * Interés de un préstamo en utilidades_clasificadas (una fila por préstamo). Es el cuerpo
 * de lo que en Prestamos.vue era `actualizarInteresPrestamo`, sin refrescar la pantalla:
 * esa parte se queda en la vista.
 */
export async function guardarInteresPrestamo(natilleraId, prestamoId, interes, tipo = 'anticipado', esNuevo = true, esRefinanciacion = false, formaPago = null) {
  // Buscar si ya existe un registro para este préstamo (uno por préstamo; forma_pago se usa al crear)
  const { data: utilidadExistente, error: errorBusqueda } = await supabase
    .from('utilidades_clasificadas')
    .select('*')
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'prestamos')
    .eq('id_actividad', prestamoId)
    .is('fecha_cierre', null)
    .maybeSingle()

  if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
    console.error('Error buscando utilidad existente:', errorBusqueda)
  }

  let montoNuevo = parseFloat(interes)
  
  if (utilidadExistente && !esNuevo) {
    if (esRefinanciacion) {
      // Si es refinanciación, reemplazar el interés con el nuevo interés total completo
      montoNuevo = parseFloat(interes)
    } else {
      // Si no es refinanciación, sumar al interés existente (cuando se paga una cuota)
      montoNuevo = parseFloat(utilidadExistente.monto || 0) + parseFloat(interes)
    }
  }

  // Normalizar forma_pago (efectivo, transferencia, mixto) para clasificación
  const formaPagoNorm = (formaPago && ['efectivo', 'transferencia', 'mixto'].includes((formaPago || '').toLowerCase()))
    ? (formaPago || '').toLowerCase()
    : null

  let data, error

  if (utilidadExistente) {
    // Si existe, actualizar el registro existente
    const { data: updatedData, error: updateError } = await supabase
      .from('utilidades_clasificadas')
      .update({
        monto: montoNuevo,
        descripcion: `Intereses generados por préstamo ${prestamoId}`,
        detalles: {
          prestamo_id: prestamoId,
          tipo_interes: tipo,
          fecha_registro: utilidadExistente.detalles?.fecha_registro || new Date().toISOString(),
          fecha_ultima_actualizacion: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', utilidadExistente.id)
      .select()
      .single()

    data = updatedData
    error = updateError
  } else {
    // Si no existe, crear un nuevo registro (con forma_pago cuando aplica, ej. medio_entrega del préstamo)
    const insertPayload = {
      natillera_id: natilleraId,
      tipo: 'prestamos',
      id_actividad: prestamoId,
      monto: montoNuevo,
      fecha_cierre: null,
      descripcion: `Intereses generados por préstamo ${prestamoId}`,
      detalles: {
        prestamo_id: prestamoId,
        tipo_interes: tipo,
        fecha_registro: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }
    if (formaPagoNorm != null) insertPayload.forma_pago = formaPagoNorm

    const { data: insertedData, error: insertError } = await supabase
      .from('utilidades_clasificadas')
      .insert(insertPayload)
      .select()
      .single()

    data = insertedData
    error = insertError
  }

  if (error) {
    console.error('Error actualizando intereses de préstamo:', error)
    return null
  }

  return data
}

/*
 * Reaplica TODOS los abonos del ciclo vigente sobre el plan de pagos, desde cero: marca
 * las cuotas pagadas, reparte efectivo/transferencia, registra el interés de las cuotas
 * que se saldan (solo préstamos sin interés anticipado), recalcula los saldos proyectados
 * y los `numeros_cuota` de cada abono. Es el cuerpo de `actualizarPlanPagosDespuesDeEditarAbono`
 * de Prestamos.vue sin recargar la pantalla; lo usan esa vista y el retiro de socios.
 *
 * @returns {Promise<{ interesRegistrado: boolean }>}
 */
export async function recalcularPlanPagosPrestamo(prestamoId) {
  let interesRegistrado = false
  try {
    // Obtener información del préstamo para verificar si inicialmente fue con interés anticipado
    const { data: prestamoInfo, error: errorPrestamoInfo } = await supabase
      .from('prestamos')
      .select(`
        id,
        monto,
        saldo_actual,
        interes,
        interes_anticipado,
        socio_natillera:socios_natillera(
          natillera_id
        )
      `)
      .eq('id', prestamoId)
      .single()

    if (errorPrestamoInfo) {
      console.error('❌ Error obteniendo información del préstamo:', errorPrestamoInfo)
      return { interesRegistrado }
    }

    const natilleraId = prestamoInfo.socio_natillera?.natillera_id || null

    // Obtener historial de refinanciaciones para verificar si el préstamo inicial fue con interés anticipado
    const { data: historialRefinanciaciones, error: errorHistorial } = await supabase
      .from('historial_refinanciaciones')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha_refinanciacion', { ascending: true })

    if (errorHistorial) {
      console.error('❌ Error obteniendo historial de refinanciaciones:', errorHistorial)
    }

    // Determinar si el préstamo inicial fue con interés anticipado
    let tieneInteresAnticipadoInicial = false
    if (historialRefinanciaciones && historialRefinanciaciones.length > 0) {
      // Si hay historial, verificar el interes_anticipado_anterior del primer registro
      tieneInteresAnticipadoInicial = historialRefinanciaciones[0].interes_anticipado_anterior || false
    } else {
      // Si no hay historial, el préstamo actual es el inicial
      tieneInteresAnticipadoInicial = prestamoInfo.interes_anticipado || false
    }

    // Pagos del ciclo vigente ordenados por fecha. Los abonos de un ciclo refinanciado
    // (refinanciacion_id) ya se liquidaron contra el plan anterior: reaplicarlos al plan
    // nuevo marcaría como pagadas cuotas que nadie ha pagado.
    const { data: todosPagos, error: errorPagos } = await supabase
      .from('pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .is('refinanciacion_id', null)
      .order('fecha', { ascending: true })

    if (errorPagos) {
      console.error('❌ Error obteniendo pagos:', errorPagos)
      return { interesRegistrado }
    }

    // Obtener todas las cuotas del plan de pagos
    const { data: todasCuotas, error: errorCuotas } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorCuotas) {
      console.error('❌ Error obteniendo cuotas:', errorCuotas)
      return { interesRegistrado }
    }

    // Obtener el estado anterior de las cuotas para detectar cuáles se marcaron como pagadas
    const cuotasAnteriores = todasCuotas.map(c => ({
      id: c.id,
      pagada: c.pagada || false,
      valor_pagado: parseFloat(c.valor_pagado || 0)
    }))

    // Resetear todas las cuotas
    for (const cuota of todasCuotas) {
      await supabase
        .from('plan_pagos_prestamo')
        .update({
          valor_pagado: 0,
          valor_pagado_efectivo: 0,
          valor_pagado_transferencia: 0,
          pagada: false,
          fecha_pago: null,
          fecha_causacion: null
        })
        .eq('id', cuota.id)
    }

    // Totales de pagos (soportando desglose efectivo/transferencia)
    let abonoRestante = 0
    let abonoRestanteEfectivo = 0
    let abonoRestanteTransferencia = 0
    for (const pago of todosPagos) {
      const v = parseFloat(pago.valor) || 0
      const vEf = parseFloat(pago.valor_efectivo)
      const vTr = parseFloat(pago.valor_transferencia)
      abonoRestante += v
      if (!isNaN(vEf) && !isNaN(vTr)) {
        abonoRestanteEfectivo += vEf
        abonoRestanteTransferencia += vTr
      } else {
        abonoRestanteEfectivo += v
      }
    }

    // Ordenar las cuotas por número (ya están ordenadas, pero por seguridad)
    const cuotasOrdenadas = [...todasCuotas].sort((a, b) => a.numero_cuota - b.numero_cuota)

    // Aplicar todos los abonos a las cuotas en orden
    // Después del reset, todas las cuotas tienen valor_pagado = 0
    let indiceCuota = 0
    const cuotasPagadasNuevas = [] // Cuotas que se marcaron como pagadas en esta actualización

    // Fechas del último abono, para repartirlas entre las cuotas que este recálculo vuelve a
    // marcar. La causación sale del abono y no del reloj: este proceso puede correr meses
    // después y poner `now()` fingiría que el pago se digitó hoy.
    const ultimoPago = todosPagos[todosPagos.length - 1]
    const fechaUltimoPago = ultimoPago?.fecha || new Date().toISOString()
    const causacionUltimoPago = ultimoPago?.fecha_causacion || fechaUltimoPago

    while (abonoRestante > 0 && indiceCuota < cuotasOrdenadas.length) {
      const cuota = cuotasOrdenadas[indiceCuota]
      const valorCuota = parseFloat(cuota.valor_cuota)
      
      // Después del reset, el valor pagado es 0, pero lo calculamos dinámicamente
      // basándonos en las actualizaciones anteriores en este mismo proceso
      let valorPagadoActual = 0
      
      // Verificar si ya actualizamos esta cuota en este proceso
      // (esto es para manejar el caso donde una cuota se completa y seguimos con la siguiente)
      const valorRestanteCuota = valorCuota - valorPagadoActual

      if (abonoRestante >= valorCuota) {
        // El abono cubre completamente esta cuota
        const periodo = periodoDesdeFechaProyectada(cuota.fecha_proyectada)
        const cuotaAnterior = cuotasAnteriores.find(c => c.id === cuota.id)
        const seMarcoComoPagada = !cuotaAnterior?.pagada
        const ratioEf = abonoRestante > 0 ? abonoRestanteEfectivo / abonoRestante : 1
        const vEf = Math.round(valorCuota * ratioEf)
        const vTr = valorCuota - vEf
        const updatePayload = {
          pagada: true,
          valor_pagado: valorCuota,
          fecha_pago: fechaUltimoPago,
          fecha_causacion: causacionUltimoPago,
          forma_pago: vEf > 0 && vTr > 0 ? null : (vEf > 0 ? 'efectivo' : 'transferencia'),
          ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
        }
        if (vEf > 0 || vTr > 0) {
          updatePayload.valor_pagado_efectivo = vEf
          updatePayload.valor_pagado_transferencia = vTr
        }
        await supabase
          .from('plan_pagos_prestamo')
          .update(updatePayload)
          .eq('id', cuota.id)

        // Si se marcó como pagada, registrar el interés según el tipo de préstamo
        // IMPORTANTE: NO registrar utilidades si el préstamo tiene interés anticipado,
        // porque el interés ya se cobró al inicio del préstamo
        if (seMarcoComoPagada && natilleraId && !tieneInteresAnticipadoInicial && !prestamoInfo.interes_anticipado) {
          // Para todos los tipos de préstamos, usar el interés que ya está calculado en la cuota
          // El interés de la cuota ya está correctamente calculado en el plan de pagos
          const interesCuota = parseFloat(cuota.interes || 0)
          if (interesCuota > 0) {
            cuotasPagadasNuevas.push({ cuota, interes: interesCuota })
          }
        }

        abonoRestante -= valorCuota
        abonoRestanteEfectivo -= vEf
        abonoRestanteTransferencia -= vTr
        indiceCuota++
      } else {
        // El abono no cubre completamente la cuota
        const ratioEf = abonoRestante > 0 ? abonoRestanteEfectivo / abonoRestante : 1
        const vEf = Math.round(abonoRestante * ratioEf)
        const vTr = abonoRestante - vEf
        // Cuota a medias: sin fecha_pago (no está saldada) pero con causación, o el reset de
        // arriba la habría dejado en blanco pese a tener dinero aplicado.
        const updatePayload = { valor_pagado: abonoRestante, fecha_causacion: causacionUltimoPago }
        if (vEf > 0 || vTr > 0) {
          updatePayload.valor_pagado_efectivo = vEf
          updatePayload.valor_pagado_transferencia = vTr
          updatePayload.forma_pago = vEf > 0 && vTr > 0 ? null : (vEf > 0 ? 'efectivo' : 'transferencia')
        }
        await supabase
          .from('plan_pagos_prestamo')
          .update(updatePayload)
          .eq('id', cuota.id)

        abonoRestante = 0
        abonoRestanteEfectivo = 0
        abonoRestanteTransferencia = 0
      }
    }

    // Registrar intereses ganados de las cuotas pagadas en utilidades_clasificadas
    // IMPORTANTE: NO registrar utilidades si el préstamo tiene interés anticipado,
    // porque el interés ya se cobró al inicio del préstamo
    if (cuotasPagadasNuevas.length > 0 && natilleraId && !tieneInteresAnticipadoInicial && !prestamoInfo.interes_anticipado) {
      const totalInteresesNuevos = cuotasPagadasNuevas.reduce((sum, item) => sum + item.interes, 0)
      
      if (totalInteresesNuevos > 0) {
        // Usar la función auxiliar para actualizar intereses por préstamo
        await guardarInteresPrestamo(
          natilleraId,
          prestamoId,
          totalInteresesNuevos,
          'normal',
          false // no es nuevo, es actualización
        )
        interesRegistrado = true
        console.log('✅ Intereses ganados actualizados:', {
          cuotasPagadas: cuotasPagadasNuevas.length,
          totalIntereses: totalInteresesNuevos
        })
      }
    } else if (tieneInteresAnticipadoInicial || prestamoInfo.interes_anticipado) {
      console.log('ℹ️ Préstamo con interés anticipado: no se registran utilidades adicionales al pagar cuotas (ya se cobraron al inicio)')
    }

    // Actualizar los saldos proyectados de todas las cuotas
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .select('saldo_actual')
      .eq('id', prestamoId)
      .single()

    if (!errorPrestamo && prestamoActualizado) {
      const saldoActual = parseFloat(prestamoActualizado.saldo_actual)
      
      // Obtener todas las cuotas nuevamente para actualizar saldos
      const { data: cuotasActualizadas, error: errorTodas } = await supabase
        .from('plan_pagos_prestamo')
        .select('*')
        .eq('prestamo_id', prestamoId)
        .order('numero_cuota', { ascending: true })

      if (!errorTodas && cuotasActualizadas) {
        let saldoAcumulado = saldoActual
        
        // Actualizar saldos proyectados de todas las cuotas
        for (const cuota of cuotasActualizadas) {
          const valorCuota = parseFloat(cuota.valor_cuota)
          const valorPagado = parseFloat(cuota.valor_pagado || 0)
          
          // El saldo proyectado es el saldo actual menos lo que falta pagar de esta cuota
          const valorRestanteCuota = valorCuota - valorPagado
          saldoAcumulado = Math.max(0, saldoAcumulado - valorRestanteCuota)
          
          await supabase
            .from('plan_pagos_prestamo')
            .update({
              saldo_proyectado: saldoAcumulado
            })
            .eq('id', cuota.id)
        }
      }
    }

    // Recalcular numeros_cuota por cada pago según el orden de aplicación.
    // Como los pagos se aplican en orden de fecha, cada pago "ocupa" un rango
    // [acumPrev, acumPrev + valor) sobre la suma total de valores de cuotas.
    // Las cuotas cuyo rango se solape con el rango del pago son las que tocó.
    try {
      const valoresCuota = cuotasOrdenadas.map(c => parseFloat(c.valor_cuota || 0))
      let acumPagos = 0
      const updatesNumerosCuota = []
      for (const pago of todosPagos) {
        const v = parseFloat(pago.valor) || 0
        const inicio = acumPagos
        const fin = acumPagos + v
        const numerosTocados = []
        let acumCuotas = 0
        for (let i = 0; i < cuotasOrdenadas.length; i++) {
          const cInicio = acumCuotas
          const cFin = acumCuotas + valoresCuota[i]
          if (fin > cInicio && inicio < cFin) {
            numerosTocados.push(cuotasOrdenadas[i].numero_cuota)
          }
          acumCuotas = cFin
        }
        acumPagos = fin
        updatesNumerosCuota.push(
          supabase.from('pagos_prestamo')
            .update({ numeros_cuota: numerosTocados.length > 0 ? numerosTocados : null })
            .eq('id', pago.id)
        )
      }
      await Promise.allSettled(updatesNumerosCuota)
    } catch (errNumeros) {
      console.error('⚠️ Error recalculando numeros_cuota de pagos:', errNumeros)
    }

  } catch (e) {
    console.error('❌ Error recalculando el plan de pagos:', e)
  }
  return { interesRegistrado }
}


// ─── Cruce de préstamos en el retiro de un socio ───

function generarCodigoComprobantePago() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = ''
  for (let i = 0; i < 8; i++) codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  return codigo
}

/*
 * Reglas de préstamo de la natillera (tasa de mora y días de gracia efectivos), leídas
 * igual que en Prestamos.vue: la gracia hereda la de las cuotas si nunca se configuró.
 */
export function reglasMoraNatillera(natillera) {
  const reglas = parseReglasInteresPrestamo(natillera?.reglas_interes, {
    diasGraciaCuotas: natillera?.reglas_multas?.dias_gracia
  })
  return { tasaMora: reglas.tasa_mora, diasGracia: diasGraciaPrestamo(reglas) }
}

/*
 * Préstamos vivos de un socio con lo que debe HOY: saldo + mora de las cuotas vencidas.
 * Ordenados del más antiguo al más nuevo, que es el orden en que se cruzan.
 */
export async function cargarDeudaPrestamosSocio(socioNatilleraId, natillera) {
  const { tasaMora, diasGracia } = reglasMoraNatillera(natillera)
  const { data: prestamos, error } = await supabase
    .from('prestamos')
    .select('id, monto, saldo_actual, estado, created_at')
    .eq('socio_natillera_id', socioNatilleraId)
    .eq('estado', 'activo')
    .gt('saldo_actual', 0)
    .order('created_at', { ascending: true })
  if (error) throw error
  if (!prestamos?.length) return []

  const { data: plan, error: errPlan } = await supabase
    .from('plan_pagos_prestamo')
    .select('prestamo_id, numero_cuota, valor_cuota, valor_pagado, capital, fecha_proyectada, pagada')
    .in('prestamo_id', prestamos.map(p => p.id))
  if (errPlan) throw errPlan

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return prestamos.map(p => {
    const cuotasVencidasOrdenadas = (plan || [])
      .filter(c => c.prestamo_id === p.id && !c.pagada && fechaLimiteSinMora(c, diasGracia) < hoy)
      .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
    const saldo = Math.max(0, Math.round(parseFloat(p.saldo_actual) || 0))
    const mora = Math.round(calcularMoraPrestamo(cuotasVencidasOrdenadas, tasaMora, hoy, diasGracia))
    return { id: p.id, monto: parseFloat(p.monto) || 0, saldo, mora, total: saldo + mora, cuotasVencidasOrdenadas }
  })
}

/*
 * Registra un abono igual que el botón «Abonar» de Préstamos: separa la mora (va al fondo,
 * no baja el saldo), inserta el pago, baja el saldo y reaplica el plan. `origen` distingue
 * los abonos del retiro para poder deshacerlos si el socio se reactiva.
 *
 * @returns {Promise<{ pagoId: string, abono: number, mora: number, saldoNuevo: number }>}
 */
export async function registrarAbonoPrestamo({
  prestamo, valor, formaPago = 'efectivo', natillera, nombreSocio = null, origen = 'retiro'
}) {
  const { tasaMora, diasGracia } = reglasMoraNatillera(natillera)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const { moraPagada, abonoAPrestamo } = desglosarAbonoConMora(
    valor, prestamo.cuotasVencidasOrdenadas, tasaMora, hoy, diasGracia
  )
  const fp = formaPago === 'transferencia' ? 'transferencia' : 'efectivo'

  const { data: pago, error: errPago } = await supabase
    .from('pagos_prestamo')
    .insert({
      prestamo_id: prestamo.id,
      valor: abonoAPrestamo,
      fecha: formatDateToLocalISO(new Date()),
      fecha_causacion: new Date().toISOString(),
      codigo_comprobante: generarCodigoComprobantePago(),
      valor_efectivo: fp === 'transferencia' ? 0 : abonoAPrestamo,
      valor_transferencia: fp === 'transferencia' ? abonoAPrestamo : 0,
      nombre_socio: nombreSocio,
      nombre_natillera: natillera?.nombre || null,
      origen
    })
    .select('id')
    .single()
  if (errPago) throw errPago

  const saldoNuevo = Math.max(0, prestamo.saldo - abonoAPrestamo)
  const { error: errPrestamo } = await supabase
    .from('prestamos')
    .update({ saldo_actual: saldoNuevo, estado: saldoNuevo <= 0 ? 'pagado' : 'activo' })
    .eq('id', prestamo.id)
  if (errPrestamo) throw errPrestamo

  await recalcularPlanPagosPrestamo(prestamo.id)
  if (moraPagada > 0) await registrarMoraCobradaEnFondo(natillera?.id, moraPagada, fp)

  return { pagoId: pago.id, abono: abonoAPrestamo, mora: moraPagada, saldoNuevo }
}

/*
 * Deshace un abono hecho por el cruce del retiro: borra el pago, devuelve el saldo al
 * préstamo, reaplica el plan y descuenta la mora que se había llevado al fondo.
 */
export async function revertirAbonoPrestamo({ prestamoId, pagoId, abono, mora, formaPago, natilleraId }) {
  const { error: errBorrar } = await supabase.from('pagos_prestamo').delete().eq('id', pagoId)
  if (errBorrar) throw errBorrar

  const { data: prestamo, error: errLeer } = await supabase
    .from('prestamos')
    .select('saldo_actual')
    .eq('id', prestamoId)
    .single()
  if (errLeer) throw errLeer
  const saldo = (parseFloat(prestamo.saldo_actual) || 0) + (Number(abono) || 0)
  const { error: errPrestamo } = await supabase
    .from('prestamos')
    .update({ saldo_actual: saldo, estado: saldo > 0 ? 'activo' : 'pagado' })
    .eq('id', prestamoId)
  if (errPrestamo) throw errPrestamo

  await recalcularPlanPagosPrestamo(prestamoId)
  // Restar la mora es sumar un negativo en la misma fila acumulada.
  if (Number(mora) > 0) await registrarMoraCobradaEnFondoNegativa(natilleraId, Number(mora), formaPago)
}

async function registrarMoraCobradaEnFondoNegativa(natilleraId, monto, formaPago) {
  const fp = formaPago === 'transferencia' ? 'transferencia' : 'efectivo'
  const { data: fila } = await supabase
    .from('utilidades_clasificadas')
    .select('id, monto')
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'prestamos')
    .is('id_actividad', null)
    .filter('detalles->>subtipo', 'eq', 'mora')
    .is('fecha_cierre', null)
    .eq('forma_pago', fp)
    .maybeSingle()
  if (!fila) return
  await supabase
    .from('utilidades_clasificadas')
    .update({ monto: Math.max(0, (parseFloat(fila.monto) || 0) - monto), updated_at: new Date().toISOString() })
    .eq('id', fila.id)
}

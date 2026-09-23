import { supabase } from '../lib/supabase'
import { useSociosStore } from '../stores/socios'
import { useCuotasStore } from '../stores/cuotas'
import { formatMoney } from '../utils/formatMoney'

/*
 * Estado de cuenta de un socio: lo que ha ahorrado y lo que debe «a la fecha» (cuotas
 * pendientes y en mora, sanciones, actividades vencidas y cuotas de préstamo ya
 * causadas). Lo usa la página «Notificar»; antes vivía dentro de NatilleraDetalle.
 */

export function calcularEstadoRealCuota(cuota, diasGracia) {
  const valorCuota = cuota.valor_cuota || 0
  const valorPagado = cuota.valor_pagado || 0
  
  // Pagada: valor_pagado >= valor_cuota (según REGLAS.md, sin incluir sanción)
  if (valorPagado >= valorCuota) {
    return 'pagada'
  }
  
  if (!cuota.fecha_limite) return cuota.estado || 'programada'
  
  const fechaActual = new Date()
  fechaActual.setHours(0, 0, 0, 0)
  
  // Parsear fecha_limite correctamente para evitar problemas de zona horaria
  // Si viene como string "YYYY-MM-DD", crear la fecha en hora local, no UTC
  let fechaLimite
  if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
    const [anio, mes, dia] = cuota.fecha_limite.split('-').map(Number)
    fechaLimite = new Date(anio, mes - 1, dia) // mes - 1 porque Date usa 0-11 para meses
  } else {
    fechaLimite = new Date(cuota.fecha_limite)
  }
  fechaLimite.setHours(0, 0, 0, 0)
  
  // Obtener fecha_vencimiento: usar el campo directamente si existe, o calcularlo
  let fechaVencimiento
  if (cuota.fecha_vencimiento) {
    // Usar fecha_vencimiento directamente si existe en la cuota
    if (typeof cuota.fecha_vencimiento === 'string' && cuota.fecha_vencimiento.includes('-')) {
      const [anio, mes, dia] = cuota.fecha_vencimiento.split('-').map(Number)
      fechaVencimiento = new Date(anio, mes - 1, dia)
    } else {
      fechaVencimiento = new Date(cuota.fecha_vencimiento)
    }
  } else {
    // Si no existe, calcularla como fecha_limite + dias_gracia (fallback)
    fechaVencimiento = new Date(fechaLimite)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
  }
  fechaVencimiento.setHours(0, 0, 0, 0)
  
  // Programada: fecha_actual < fecha_limite
  if (fechaActual < fechaLimite) {
    return 'programada'
  }
  
  // Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
  if (fechaActual >= fechaLimite && fechaActual <= fechaVencimiento) {
    return 'pendiente'
  }
  
  // En Mora: fecha_actual > fecha_vencimiento
  if (fechaActual > fechaVencimiento) {
    return 'mora'
  }
  
  // Por defecto, mantener el estado original
  return cuota.estado || 'programada'
}

export async function calcularEstadoSocio(sn, natillera) {
  const natilleraId = natillera?.id
  const diasGracia = natillera?.reglas_multas?.dias_gracia || 3
  const sociosStore = useSociosStore()
  const cuotasStore = useCuotasStore()

  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  const cuotas = resumen?.cuotas || []

  let totalAhorrado = 0
  let cuotasPendientes = 0
  let cuotasMora = 0
  let totalPendiente = 0
  let totalMora = 0
  let totalSancionesPendientes = 0
  const cuotasPendientesList = []
  const cuotasMoraList = []
  const sancionesDesglose = []

  const resultSanciones = await cuotasStore.calcularSancionesTotales(natilleraId, cuotas)
  const sancionesMap = resultSanciones.success ? (resultSanciones.sanciones || {}) : {}

  cuotas.forEach(cuota => {
    const estadoReal = calcularEstadoRealCuota(cuota, diasGracia)
    const valorCuota = parseFloat(cuota.valor_cuota || 0)
    const valorPagado = parseFloat(cuota.valor_pagado || 0)
    const deuda = valorCuota - valorPagado
    const periodo = formatoPeriodoCuota(cuota)

    if (estadoReal === 'pagada') {
      totalAhorrado += valorCuota
      return
    }
    if (estadoReal === 'mora') {
      cuotasMora++
      totalMora += deuda
      cuotasMoraList.push({ periodo, valor: deuda })
      const sancion = sancionesMap[cuota.id] ?? parseFloat(cuota.valor_multa || 0)
      if (sancion > 0) {
        totalSancionesPendientes += sancion
        sancionesDesglose.push({ periodo, valor: sancion })
      }
    } else if (estadoReal === 'pendiente') {
      cuotasPendientes++
      totalPendiente += deuda
      cuotasPendientesList.push({ periodo, valor: deuda })
      const sancion = parseFloat(cuota.valor_multa || 0)
      if (sancion > 0) {
        totalSancionesPendientes += sancion
        sancionesDesglose.push({ periodo, valor: sancion })
      }
    }
  })

  // Actividades pendientes solo "a la fecha": solo periodos ya vencidos o el periodo actual (nunca futuros)
  let actividadesPendientesTotal = 0
  const actividadesPendientesDesglose = []
  const mesesCortoAct = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  try {
    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1
    const anioActual = hoy.getFullYear()
    const quincenaActual = hoy.getDate() <= 15 ? 1 : 2

    const { data: sociosActividad } = await supabase
      .from('socios_actividad')
      .select('valor_asignado, valor_pagado, mes_pago, anio_pago, quincena_pago, actividad:actividades(descripcion, fecha_limite_pago)')
      .eq('socio_natillera_id', sn.id)
    if (sociosActividad && sociosActividad.length > 0) {
      sociosActividad.forEach(sa => {
        const asignado = parseFloat(sa.valor_asignado || 0)
        const pagado = parseFloat(sa.valor_pagado || 0)
        if (asignado <= pagado) return

        const mes = sa.mes_pago != null ? Number(sa.mes_pago) : null
        const anio = sa.anio_pago != null ? Number(sa.anio_pago) : null
        const quincena = sa.quincena_pago != null ? Number(sa.quincena_pago) : null
        // Fecha límite de pago (rifas y actividades con vencimiento): prioridad sobre mes/anio/quincena
        const fechaLimitePago = sa.actividad?.fecha_limite_pago

        let esPeriodoALaFecha = false

        if (fechaLimitePago) {
          // Rifas y actividades con fecha límite: solo mostrar si la fecha actual es SUPERIOR a la fecha límite (ya venció) y está pendiente
          try {
            let fechaLimite
            if (typeof fechaLimitePago === 'string' && fechaLimitePago.includes('-')) {
              const [y, m, d] = fechaLimitePago.split('-').map(Number)
              fechaLimite = new Date(y, (m || 1) - 1, d || 1)
              fechaLimite.setHours(23, 59, 59, 999)
            } else {
              fechaLimite = new Date(fechaLimitePago)
            }
            const hoyEod = new Date(hoy)
            hoyEod.setHours(23, 59, 59, 999)
            esPeriodoALaFecha = hoyEod.getTime() > fechaLimite.getTime()
          } catch (e) {
            esPeriodoALaFecha = false
          }
        } else {
          // Sin fecha límite: usar periodo mes/anio/quincena (excluir siempre periodos futuros)
          if (anio == null || mes == null) {
            esPeriodoALaFecha = false
          } else {
            if (anio > anioActual) esPeriodoALaFecha = false
            else if (anio === anioActual && mes > mesActual) esPeriodoALaFecha = false
            else if (anio === anioActual && mes === mesActual) {
              if (quincena == null || quincena === 0) {
                esPeriodoALaFecha = true
              } else if (quincena <= quincenaActual) {
                esPeriodoALaFecha = true
              } else {
                esPeriodoALaFecha = false
              }
            } else {
              esPeriodoALaFecha = true
            }
          }
        }

        if (esPeriodoALaFecha) {
          const valorPendiente = asignado - pagado
          actividadesPendientesTotal += valorPendiente
          const descripcion = sa.actividad?.descripcion || (mes && anio ? `${mesesCortoAct[mes - 1] || ''} ${anio}` + (quincena === 1 ? ' - 1ra quincena' : quincena === 2 ? ' - 2da quincena' : '') : 'Actividad')
          actividadesPendientesDesglose.push({ periodo: descripcion.trim() || 'Actividad', valor: valorPendiente })
        }
      })
    }
  } catch (e) {
    console.warn('Error cargando actividades pendientes:', e)
  }

  // Solo cuotas de préstamos pendientes a la fecha (fecha_proyectada <= hoy), no el valor total del préstamo
  let totalPrestamosPendiente = 0
  let cuotasPrestamosPendientes = 0
  const prestamosPendientesDesglose = []
  try {
    const hoy = new Date()
    hoy.setHours(23, 59, 59, 999)

    const { data: prestamos } = await supabase
      .from('prestamos')
      .select('id')
      .eq('socio_natillera_id', sn.id)
      .in('estado', ['activo', 'pagado'])
    if (prestamos && prestamos.length > 0) {
      const prestamoIds = prestamos.map(p => p.id)
      const { data: planPagos } = await supabase
        .from('plan_pagos_prestamo')
        .select('valor_cuota, valor_pagado, pagada, fecha_proyectada, numero_cuota')
        .in('prestamo_id', prestamoIds)
      if (planPagos) {
        planPagos.forEach(pp => {
          if (pp.pagada) return
          const fechaProyectada = pp.fecha_proyectada ? new Date(pp.fecha_proyectada) : null
          if (fechaProyectada && fechaProyectada.getTime() > hoy.getTime()) return // cuota futura, no incluir
          cuotasPrestamosPendientes++
          const valorCuota = parseFloat(pp.valor_cuota || 0)
          const valorPagado = parseFloat(pp.valor_pagado || 0)
          const pendiente = Math.max(0, valorCuota - valorPagado)
          totalPrestamosPendiente += pendiente
          const periodo = fechaProyectada
            ? fechaProyectada.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }).replace(/\./g, '') + (pp.numero_cuota != null ? ` (cuota ${pp.numero_cuota})` : '')
            : (pp.numero_cuota != null ? `Cuota ${pp.numero_cuota}` : 'Préstamo')
          prestamosPendientesDesglose.push({ periodo, valor: pendiente })
        })
      }
    }
  } catch (e) {
    console.warn('Error cargando préstamos pendientes:', e)
  }

  // Total a pagar (base para 4x1000 si paga por transferencia)
  const totalAPagar = totalPendiente + totalMora + totalSancionesPendientes + actividadesPendientesTotal + totalPrestamosPendiente
  const valor4x1000 = Math.round(totalAPagar * 0.004)
  const totalAPagarCon4x1000 = totalAPagar + valor4x1000

  return {
    socio: sn.socio || { nombre: 'Socio', telefono: sn.socio?.telefono },
    nombreNatillera: natillera?.nombre || 'Natillera',
    totalAhorrado,
    cuotasPendientes,
    cuotasMora,
    totalPendiente,
    totalMora,
    cuotasPendientesList,
    cuotasMoraList,
    totalSancionesPendientes,
    sancionesDesglose,
    actividadesPendientesTotal,
    actividadesPendientesDesglose,
    totalPrestamosPendiente,
    cuotasPrestamosPendientes,
    prestamosPendientesDesglose,
    totalAPagar,
    valor4x1000,
    totalAPagarCon4x1000
  }
}

export function formatoPeriodoCuota(cuota) {
  let mes = cuota.mes
  let anio = cuota.anio
  const quincena = cuota.quincena != null ? Number(cuota.quincena) : null
  if ((mes == null || anio == null) && cuota.fecha_limite) {
    const str = String(cuota.fecha_limite)
    if (str.includes('-')) {
      const [y, m] = str.split('-')
      anio = parseInt(y, 10)
      mes = parseInt(m, 10)
    }
  }
  const mesesCorto = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const mesLabel = (mes >= 1 && mes <= 12) ? mesesCorto[mes - 1] : `Mes ${mes}`
  let label = `${mesLabel} ${anio || ''}`
  if (quincena === 1) label += ' - 1ra quincena'
  else if (quincena === 2) label += ' - 2da quincena'
  return label
}

/*
 * La primera línea, en negrita, pide abrir la imagen: en WhatsApp el texto se lee en la
 * notificación y la imagen se queda sin abrir, y ahí está todo el detalle.
 */
export function textoEstadoSocio(estado, con4x1000 = true) {
  const nombre = (estado.socio?.nombre || '').split(/\s+/)[0]
  const total = estado.totalAPagar || 0
  const cuatroPorMil = con4x1000 ? (estado.valor4x1000 || 0) : 0
  const saludo = nombre ? `Hola ${nombre}, ` : 'Hola, '
  const lineas = ['*👆 Abre la imagen para ver tu estado de cuenta completo*', '']
  if (total <= 0) {
    lineas.push(`${saludo}estás al día con la natillera.`)
    return lineas.join('\n')
  }
  lineas.push(`${saludo}este es tu estado de cuenta en la natillera.`, '')
  if (cuatroPorMil > 0) {
    lineas.push(`Subtotal: $${formatMoney(total)}`)
    lineas.push(`4×1000: $${formatMoney(cuatroPorMil)}`)
  }
  lineas.push(`*Total para estar al día: $${formatMoney(total + cuatroPorMil)}*`)
  return lineas.join('\n')
}

/*
 * Semáforo de la lista: cuántas cuotas tiene cada socio en mora y pendientes. Es una
 * sola consulta para toda la natillera; el estado completo (actividades, préstamos,
 * sanciones) solo se calcula al abrir un socio, porque cuesta cuatro consultas más.
 */
export async function cargarSemaforoCuotas(idsSocioNatillera, diasGracia = 3) {
  const porSocio = {}
  idsSocioNatillera.forEach(id => { porSocio[id] = { mora: 0, pendientes: 0, deuda: 0 } })
  if (idsSocioNatillera.length === 0) return porSocio

  const tamPagina = 1000
  let desde = 0
  for (;;) {
    const { data, error } = await supabase
      .from('cuotas')
      .select('id, socio_natillera_id, valor_cuota, valor_pagado, fecha_limite, fecha_vencimiento, estado')
      .in('socio_natillera_id', idsSocioNatillera)
      .range(desde, desde + tamPagina - 1)
    if (error) throw error
    const filas = data || []
    filas.forEach(cuota => {
      const fila = porSocio[cuota.socio_natillera_id]
      if (!fila) return
      const estado = calcularEstadoRealCuota(cuota, diasGracia)
      if (estado !== 'mora' && estado !== 'pendiente') return
      const deuda = Math.max(0, Number(cuota.valor_cuota || 0) - Number(cuota.valor_pagado || 0))
      if (estado === 'mora') fila.mora++
      else fila.pendientes++
      fila.deuda += deuda
    })
    if (filas.length < tamPagina) break
    desde += tamPagina
  }
  return porSocio
}

import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useNatillerasStore } from '../stores/natilleras'
import {
  normalizarForma,
  esPremioRifa,
  esLiquidacionSalida,
  esRecaudoActividadLiquidada,
  emparejarTraslados
} from './useMovimientosFondo'

/**
 * Libro de caja — reconstruye todos los movimientos de dinero de una natillera
 * como una lista plana, ordenada cronológicamente y con fecha resuelta, para poder
 * calcular saldo corrido (RF-03) y acotar por rango de fechas (RF-05).
 *
 * La lógica de composición replica la de `CuadreCaja.vue` (`buildDetalleItems`), que
 * hoy vive embebida en esa vista. Se duplica a propósito mientras el prototipo se
 * valida: así la vista actual sigue intacta. Cuando el prototipo se dé por bueno,
 * `CuadreCaja.vue` debería consumir este composable y borrar su copia.
 */

export const CATEGORIAS_LIBRO = [
  { value: 'cuota', label: 'Cuota' },
  { value: 'cuota_prestamo', label: 'Cuota préstamo' },
  { value: 'sancion', label: 'Sanción' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'gmf_4x1000', label: '4x1000' },
  { value: 'prestamo', label: 'Préstamo' },
  { value: 'interes_anticipado', label: 'Utilidad por interés anticipado' },
  { value: 'liquidacion_salida', label: 'Liquidación por salida' },
  { value: 'premio_rifa', label: 'Premio rifa' },
  { value: 'movimiento_ingreso', label: 'Ingreso' },
  { value: 'movimiento_egreso', label: 'Egreso' },
  { value: 'movimiento_traslado', label: 'Traslado' }
]

/** Desempate dentro de un mismo día: primero lo que entra, al final los traslados. */
const ORDEN_TIPO = {
  cuota: 0,
  cuota_prestamo: 0.5,
  sancion: 1,
  gmf_4x1000: 1.25,
  actividad: 2,
  interes_anticipado: 2.5,
  prestamo: 3,
  liquidacion_salida: 3.5,
  premio_rifa: 4,
  movimiento_ingreso: 5,
  movimiento_egreso: 5.5,
  movimiento_traslado: 6
}

const ETIQUETAS_TIPO = CATEGORIAS_LIBRO.reduce((acc, c) => {
  acc[c.value] = c.label
  return acc
}, {})

export function etiquetaTipo(tipo) {
  return ETIQUETAS_TIPO[tipo] || tipo
}

/** Chip de color por concepto. Misma paleta que la vista de totales, para no reeducar al usuario. */
export function claseTipo(tipo, esParcial = false) {
  if (esParcial && (tipo === 'cuota' || tipo === 'cuota_prestamo')) {
    return 'bg-orange-100 text-orange-800 border border-orange-300/60'
  }
  const mapa = {
    cuota: 'bg-emerald-100 text-emerald-800',
    cuota_prestamo: 'bg-teal-100 text-teal-800',
    sancion: 'bg-red-100 text-red-800',
    actividad: 'bg-purple-100 text-purple-800',
    gmf_4x1000: 'bg-sky-100 text-sky-900 border border-sky-300/60',
    interes_anticipado: 'bg-amber-100 text-amber-800',
    prestamo: 'bg-blue-100 text-blue-800',
    liquidacion_salida: 'bg-amber-100 text-amber-800',
    premio_rifa: 'bg-amber-100 text-amber-800',
    movimiento_ingreso: 'bg-lime-100 text-lime-800',
    movimiento_egreso: 'bg-rose-100 text-rose-800',
    movimiento_traslado: 'bg-indigo-100 text-indigo-800'
  }
  return mapa[tipo] || 'bg-gray-100 text-gray-700'
}

/** Punto de color del mismo concepto, para listas donde un chip entero sería ruido. */
export function colorTipo(tipo) {
  const mapa = {
    cuota: 'bg-emerald-500',
    cuota_prestamo: 'bg-teal-500',
    sancion: 'bg-red-500',
    actividad: 'bg-purple-500',
    gmf_4x1000: 'bg-sky-500',
    interes_anticipado: 'bg-amber-500',
    prestamo: 'bg-blue-500',
    liquidacion_salida: 'bg-amber-600',
    premio_rifa: 'bg-amber-400',
    movimiento_ingreso: 'bg-lime-500',
    movimiento_egreso: 'bg-rose-500',
    movimiento_traslado: 'bg-indigo-500'
  }
  return mapa[tipo] || 'bg-gray-400'
}

/**
 * La clasificación de movimientos por texto y el emparejado de traslados viven en
 * `useMovimientosFondo.js`, que es el único sitio donde se tocan (RNF-08 del
 * levantamiento de movimientos). Aquí solo se consumen: así la deuda D-05 —clasificar
 * leyendo `descripcion`— se paga en un archivo y no en tres.
 */

/**
 * Convierte a 'YYYY-MM-DD' leyendo el instante en hora LOCAL.
 *
 * `fecha_pago` es `timestamptz` y se guarda en UTC: un pago registrado por la tarde en
 * Colombia (UTC-5) queda almacenado con la fecha del día siguiente. Quedarse con el
 * tramo anterior a la 'T' de la cadena ISO lo fecharía un día tarde, así que hay que
 * pasar por `Date` y leer los componentes locales.
 */
function aFechaLocal(valor) {
  if (!valor) return ''
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor
  const d = new Date(valor)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Fecha efectiva de un apunte, en 'YYYY-MM-DD' local: la del pago registrado.
 *
 * Se marca `fechaEstimada` cuando el dato no es una fecha de pago de verdad, sea porque
 * se recurrió a `updated_at` (última modificación de la fila) o al primer día del período
 * contable. El libro necesita una fecha para ordenar y acumular saldo, pero no debe hacer
 * pasar un sucedáneo por el momento en que entró el dinero.
 */
function resolverFecha(item) {
  const registrada = aFechaLocal(item.fecha_movimiento)
  if (registrada) return { fecha: registrada, fechaEstimada: item.fechaDeRespaldo === true }
  if (item.anio && item.mes) {
    return { fecha: `${item.anio}-${String(item.mes).padStart(2, '0')}-01`, fechaEstimada: true }
  }
  return { fecha: null, fechaEstimada: false }
}

/**
 * Última fecha de pago registrada en el historial, por cuota.
 *
 * `cuotas.fecha_pago` solo la escribe un pago que toca el capital: un abono únicamente de
 * actividades o de sanción la deja en null (mismo motivo documentado en `Cuotas.vue` para
 * la fecha del comprobante). El historial sí guarda una fila por transacción, así que es
 * la fuente fiable de «cuándo entró el dinero».
 */
function fechasDePagoPorCuota(historial) {
  const mapa = {}
  ;(historial || []).forEach(h => {
    if (!h?.cuota_id || !h.fecha_pago) return
    const actual = mapa[h.cuota_id]
    if (!actual || String(h.fecha_pago) > String(actual)) mapa[h.cuota_id] = h.fecha_pago
  })
  return mapa
}

function construirItems(nat, prestamosData, sociosActividadData, movimientosData, cuotasPrestamoPagadas, historialImpuesto4x1000, historialCompleto = []) {
  const items = []
  if (!nat) return items

  const sociosMap = {}
  const periodicidadPorSocioId = {}
  ;(nat.socios_natillera || []).forEach(sn => {
    sociosMap[sn.id] = sn.socio?.nombre || 'Socio'
    periodicidadPorSocioId[sn.id] = (sn.periodicidad || 'mensual').toLowerCase()
  })

  const prestamoIdASocioNatilleraId = {}
  ;(prestamosData || []).forEach(p => {
    if (p?.id) prestamoIdASocioNatilleraId[p.id] = p.socio_natillera_id
  })

  // Cuotas y sanciones. Un pago mixto se parte en dos apuntes, prorrateando por el desglose.
  const fechasHistorial = fechasDePagoPorCuota(historialCompleto)
  const cuotasConPago = (nat.cuotas || []).filter(c => c.estado === 'pagada' || (parseFloat(c.valor_pagado) || 0) > 0)
  cuotasConPago.forEach(c => {
    // Orden de preferencia: la fecha del pago, la del historial, y como último recurso
    // `updated_at`, que NO es una fecha de pago sino la última vez que se tocó la fila.
    const fechaMovimiento = c.fecha_pago || fechasHistorial[c.id] || c.updated_at || null
    const fechaDeRespaldo = !c.fecha_pago && !fechasHistorial[c.id] && !!c.updated_at
    const socio = sociosMap[c.socio_natillera_id] || '—'
    const vCuota = parseFloat(c.valor_cuota) || 0
    const vPagado = parseFloat(c.valor_pagado) || 0
    const esParcial = c.estado === 'parcial' || (vPagado > 0 && vPagado < vCuota)
    const montoCuota = esParcial ? vPagado : vCuota
    const vSancion = parseFloat(c.valor_pagado_sancion) || parseFloat(c.valor_multa) || 0
    const vEfectivo = parseFloat(c.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(c.valor_pagado_transferencia) || 0
    const totalDesglose = vEfectivo + vTransferencia
    const tieneDesglose = vEfectivo > 0 && vTransferencia > 0
    const fp = normalizarForma(c.tipo_pago)
    const socioEsMensual = (periodicidadPorSocioId[c.socio_natillera_id] || 'mensual') === 'mensual'
    const periodo = { mes: c.mes, anio: c.anio, quincena: c.quincena != null ? c.quincena : undefined, socioEsMensual, fecha_movimiento: fechaMovimiento, fechaDeRespaldo }

    const agregarCuota = (forma, monto) => {
      if (monto <= 0) return
      items.push({ tipo: 'cuota', concepto: esParcial ? 'Cuota (Parcial)' : 'Cuota', socio, forma_pago: forma, monto, esParcial, ...periodo })
    }
    const agregarSancion = (forma, monto) => {
      if (monto <= 0) return
      items.push({ tipo: 'sancion', concepto: 'Sanción', socio, forma_pago: forma, monto, ...periodo })
    }

    if (tieneDesglose && totalDesglose > 0) {
      const ratioCuota = montoCuota / totalDesglose
      const ratioSancion = vSancion / totalDesglose
      agregarCuota('efectivo', Math.round(vEfectivo * ratioCuota))
      agregarCuota('transferencia', Math.round(vTransferencia * ratioCuota))
      agregarSancion('efectivo', Math.round(vEfectivo * ratioSancion))
      agregarSancion('transferencia', Math.round(vTransferencia * ratioSancion))
      return
    }
    agregarCuota(fp, montoCuota)
    agregarSancion(fp, vSancion)
  })

  // Cuotas de préstamo pagadas o abonadas. El período sale de la fecha de pago.
  ;(cuotasPrestamoPagadas || []).forEach(pp => {
    const vEfectivo = parseFloat(pp.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(pp.valor_pagado_transferencia) || 0
    const montoTotal = vEfectivo + vTransferencia
    const monto = montoTotal > 0 ? montoTotal : (parseFloat(pp.valor_pagado) ?? 0)
    if (monto <= 0) return
    const esParcial = pp.pagada === false && monto > 0
    const snId = pp.prestamo_id != null ? prestamoIdASocioNatilleraId[pp.prestamo_id] : null
    const socio = (pp.nombre_socio || pp.socio_nombre || '').trim() || (snId != null ? sociosMap[snId] : '') || '—'
    const base = `Cuota préstamo ${pp.numero_cuota != null ? `#${pp.numero_cuota}` : ''}`.trim() || 'Cuota préstamo'
    const concepto = esParcial ? `${base} (Parcial)` : base
    const fechaPago = pp.fecha_pago ? new Date(pp.fecha_pago) : null
    const periodo = {
      mes: fechaPago ? fechaPago.getMonth() + 1 : undefined,
      anio: fechaPago ? fechaPago.getFullYear() : undefined,
      socioEsMensual: true,
      fecha_movimiento: pp.fecha_pago || null
    }

    if (vEfectivo > 0 && vTransferencia > 0) {
      items.push({ tipo: 'cuota_prestamo', concepto: `${concepto} (Efectivo)`, socio, forma_pago: 'efectivo', monto: vEfectivo, esParcial, ...periodo })
      items.push({ tipo: 'cuota_prestamo', concepto: `${concepto} (Transfer.)`, socio, forma_pago: 'transferencia', monto: vTransferencia, esParcial, ...periodo })
      return
    }
    if (vEfectivo > 0 || vTransferencia > 0) {
      items.push({ tipo: 'cuota_prestamo', concepto, socio, forma_pago: vEfectivo > 0 ? 'efectivo' : 'transferencia', monto: vEfectivo || vTransferencia, esParcial, ...periodo })
      return
    }
    items.push({ tipo: 'cuota_prestamo', concepto, socio, forma_pago: normalizarForma(pp.forma_pago), monto, esParcial, ...periodo })
  })

  // Aportes a actividades.
  ;(sociosActividadData || []).forEach(sa => {
    const vEfectivo = parseFloat(sa.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(sa.valor_pagado_transferencia) || 0
    const monto = vEfectivo + vTransferencia || parseFloat(sa.valor_pagado) || 0
    if (monto <= 0) return
    const socio = sa.socio_natillera?.socio?.nombre || sociosMap[sa.socio_natillera_id] || '—'
    const nombreActividad = sa.actividad?.descripcion || 'Actividad'
    const quincena = sa.quincena_pago ?? sa.actividad?.quincena_pago
    const periodo = {
      mes: sa.mes_pago ?? sa.actividad?.mes_pago,
      anio: sa.anio_pago ?? sa.actividad?.anio_pago,
      quincena: quincena != null ? quincena : undefined,
      socioEsMensual: (periodicidadPorSocioId[sa.socio_natillera_id] || 'mensual') === 'mensual',
      fecha_movimiento: sa.fecha_pago || sa.updated_at || null,
      fechaDeRespaldo: !sa.fecha_pago && !!sa.updated_at
    }

    if (vEfectivo > 0 && vTransferencia > 0) {
      items.push({ tipo: 'actividad', concepto: `${nombreActividad} (Efectivo)`, socio, forma_pago: 'efectivo', monto: vEfectivo, ...periodo })
      items.push({ tipo: 'actividad', concepto: `${nombreActividad} (Transfer.)`, socio, forma_pago: 'transferencia', monto: vTransferencia, ...periodo })
      return
    }
    if (vEfectivo > 0 || vTransferencia > 0) {
      items.push({ tipo: 'actividad', concepto: nombreActividad, socio, forma_pago: vEfectivo > 0 ? 'efectivo' : 'transferencia', monto: vEfectivo || vTransferencia, ...periodo })
      return
    }
    items.push({ tipo: 'actividad', concepto: nombreActividad, socio, forma_pago: normalizarForma(sa.forma_pago), monto, ...periodo })
  })

  // Préstamos entregados (salida) y su interés anticipado (entrada).
  ;(prestamosData || []).forEach(p => {
    const monto = parseFloat(p.monto) || 0
    if (monto <= 0) return
    const socio = sociosMap[p.socio_natillera_id] || '—'
    const fp = normalizarForma(p.medio_entrega)
    const fechaCreacion = p.created_at ? new Date(p.created_at) : null
    const periodo = {
      mes: fechaCreacion ? fechaCreacion.getMonth() + 1 : undefined,
      anio: fechaCreacion ? fechaCreacion.getFullYear() : undefined,
      socioEsMensual: true,
      fecha_movimiento: p.created_at || null
    }
    const aDescontar = p.interes_anticipado && p.interes_total != null ? monto + parseFloat(p.interes_total) : monto
    items.push({ tipo: 'prestamo', concepto: 'Préstamo', socio, forma_pago: fp, monto: -aDescontar, ...periodo })

    const interesTotal = parseFloat(p.interes_total) || 0
    if (!p.interes_anticipado || interesTotal <= 0) return
    items.push({ tipo: 'interes_anticipado', concepto: `Utilidad por interés anticipado — ${socio}`, socio, forma_pago: fp, monto: interesTotal, ...periodo })
  })

  // Premios de rifa entregados: desde movimientos y, si no hay ninguno, desde actividades liquidadas.
  const premiosDesdeMovimientos = (movimientosData || []).filter(esPremioRifa)
  premiosDesdeMovimientos.forEach(m => {
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto <= 0) return
    const desc = (m.descripcion || m.Descripcion || '').toString().trim() || 'Premio rifa'
    items.push({
      tipo: 'premio_rifa',
      concepto: desc.length > 50 ? 'Premio rifa' : desc,
      socio: '—',
      forma_pago: normalizarForma(m.forma_pago ?? m.Forma_pago),
      monto: -monto,
      fecha_movimiento: m.fecha || null
    })
  })
  if (premiosDesdeMovimientos.length === 0) {
    ;(nat.actividades || [])
      .filter(a => a.estado === 'liquidada' && (parseFloat(a.gastos) || 0) > 0)
      .forEach(a => {
        const monto = parseFloat(a.gastos) || 0
        const concepto = a.descripcion && a.descripcion.length <= 50 ? `Premio: ${a.descripcion}` : 'Premio rifa'
        items.push({ tipo: 'premio_rifa', concepto, socio: '—', forma_pago: 'efectivo', monto: -monto, fecha_movimiento: a.updated_at || a.created_at || null })
      })
  }

  // Liquidaciones por salida de un socio.
  const liquidaciones = (movimientosData || []).filter(esLiquidacionSalida)
  liquidaciones.forEach(m => {
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto <= 0) return
    const desc = (m.descripcion || m.Descripcion || '').toString().trim()
    const socio = desc.replace(/^Liquidación por salida\s*[-–]\s*/i, '').trim() || '—'
    const fechaMov = m.fecha ? new Date(m.fecha) : null
    items.push({
      tipo: 'liquidacion_salida',
      concepto: 'Liquidación por salida',
      socio,
      forma_pago: normalizarForma(m.forma_pago ?? m.Forma_pago),
      monto: -monto,
      mes: fechaMov ? fechaMov.getMonth() + 1 : undefined,
      anio: fechaMov ? fechaMov.getFullYear() : undefined,
      fecha_movimiento: m.fecha || null
    })
  })

  // Recaudo que entra al liquidar una actividad.
  const recaudosLiquidados = (movimientosData || []).filter(esRecaudoActividadLiquidada)
  recaudosLiquidados.forEach(m => {
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto <= 0) return
    const desc = (m.descripcion || m.Descripcion || '').toString().trim()
    const fechaMov = m.fecha ? new Date(m.fecha) : null
    const fechaValida = fechaMov && !isNaN(fechaMov.getTime())
    items.push({
      tipo: 'actividad',
      concepto: desc.length <= 70 ? desc : `${desc.slice(0, 67)}…`,
      socio: '—',
      forma_pago: normalizarForma(m.forma_pago ?? m.Forma_pago),
      monto,
      mes: fechaValida ? fechaMov.getMonth() + 1 : undefined,
      anio: fechaValida ? fechaMov.getFullYear() : undefined,
      socioEsMensual: true,
      fecha_movimiento: m.fecha || null
    })
  })

  // Movimientos manuales, excluyendo los que ya generaron un apunte específico arriba.
  const idsConsumidos = new Set(
    [...premiosDesdeMovimientos, ...liquidaciones, ...recaudosLiquidados].map(m => m.id).filter(Boolean)
  )
  const manuales = (movimientosData || []).filter(m => m && !idsConsumidos.has(m.id))

  // Un traslado entre efectivo y cuenta se guarda como dos filas (salida + entrada),
  // que se emparejan por fecha, monto y formas opuestas para etiquetarlas como traslado.
  const idsTraslado = new Set(emparejarTraslados(manuales).keys())

  manuales.forEach(m => {
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto <= 0) return
    const fechaMov = m.fecha ? new Date(m.fecha) : null
    const fechaValida = fechaMov && !isNaN(fechaMov.getTime())
    const esTraslado = idsTraslado.has(m.id)
    const esEntrada = m.tipo === 'entrada'
    let tipo = 'movimiento_egreso'
    let concepto = 'Egreso'
    if (esTraslado) {
      tipo = 'movimiento_traslado'
      concepto = 'Traslado'
    } else if (esEntrada) {
      tipo = 'movimiento_ingreso'
      concepto = 'Ingreso'
    }
    items.push({
      tipo,
      concepto,
      socio: '—',
      forma_pago: normalizarForma(m.forma_pago ?? m.Forma_pago),
      monto: esEntrada ? monto : -monto,
      mes: fechaValida ? fechaMov.getMonth() + 1 : undefined,
      anio: fechaValida ? fechaMov.getFullYear() : undefined,
      socioEsMensual: true,
      fecha_movimiento: m.fecha || null,
      observaciones: (m.descripcion || m.Descripcion || '').toString().trim()
    })
  })

  // GMF 4×1000 de cada abono por transferencia.
  const gmfPorCuota = {}
  ;(historialImpuesto4x1000 || []).forEach(h => {
    const imp = parseFloat(h.impuesto_4x1000) || 0
    if (imp <= 0) return
    if (String(h.forma_pago || '').toLowerCase().trim() !== 'transferencia') return
    gmfPorCuota[h.cuota_id] = (gmfPorCuota[h.cuota_id] || 0) + imp
    const cuota = (nat.cuotas || []).find(x => x.id === h.cuota_id)
    const socio = (h.socio_nombre || '').trim() || (cuota ? sociosMap[cuota.socio_natillera_id] : null) || '—'
    const fechaPago = h.fecha_pago ? new Date(h.fecha_pago) : null
    const fechaValida = fechaPago && !isNaN(fechaPago.getTime())
    items.push({
      tipo: 'gmf_4x1000',
      concepto: '4x1000',
      socio,
      forma_pago: 'transferencia',
      monto: imp,
      mes: fechaValida ? fechaPago.getMonth() + 1 : undefined,
      anio: fechaValida ? fechaPago.getFullYear() : undefined,
      quincena: cuota && cuota.quincena != null ? cuota.quincena : undefined,
      socioEsMensual: cuota ? (periodicidadPorSocioId[cuota.socio_natillera_id] || 'mensual') === 'mensual' : true,
      fecha_movimiento: h.fecha_pago || null
    })
  })

  // `cuotas.impuesto_4x1000` se escribe junto con la cuota; el insert en historial es
  // fire-and-forget y a veces falta. Se agrega solo la diferencia para no subcontar
  // el GMF ni duplicar lo que sí llegó al historial.
  ;(nat.cuotas || []).forEach(c => {
    const columna = Math.round(parseFloat(c.impuesto_4x1000) || 0)
    if (columna <= 0) return
    const faltante = columna - Math.round(gmfPorCuota[c.id] || 0)
    if (faltante <= 0) return
    const fechaPago = c.fecha_pago ? new Date(c.fecha_pago) : null
    const fechaValida = fechaPago && !isNaN(fechaPago.getTime())
    items.push({
      tipo: 'gmf_4x1000',
      concepto: '4x1000',
      socio: sociosMap[c.socio_natillera_id] || '—',
      forma_pago: 'transferencia',
      monto: faltante,
      mes: fechaValida ? fechaPago.getMonth() + 1 : c.mes,
      anio: fechaValida ? fechaPago.getFullYear() : c.anio,
      quincena: c.quincena != null ? c.quincena : undefined,
      socioEsMensual: (periodicidadPorSocioId[c.socio_natillera_id] || 'mensual') === 'mensual',
      fecha_movimiento: c.fecha_pago || c.updated_at || null
    })
  })

  return items
}

/**
 * Añade fecha resuelta y clave estable de render, y ordena en ascendente para que el
 * saldo corrido se pueda acumular de una pasada. Los apuntes sin fecha van primero:
 * son anteriores a cualquier corte que se pueda cerrar.
 */
function ordenarCronologicamente(items) {
  return items
    .map((item, indice) => ({ ...item, ...resolverFecha(item), clave: `${item.tipo}-${indice}` }))
    .sort((a, b) => {
      const fechaA = a.fecha || ''
      const fechaB = b.fecha || ''
      if (fechaA !== fechaB) return fechaA.localeCompare(fechaB)
      return (ORDEN_TIPO[a.tipo] ?? 4) - (ORDEN_TIPO[b.tipo] ?? 4)
    })
}

/**
 * Un error descartado en estas consultas no deja rastro: el apunte no aparece y la
 * conciliación acaba cuadrando contra un libro incompleto, que es peor que no cuadrar.
 * Se registra siempre y se devuelve vacío, que es lo que la vista ya sabe tolerar.
 */
function filasDe({ data, error: fallo }, queEs) {
  if (fallo) console.error(`Libro de caja: no se pudo leer ${queEs}.`, fallo.message || fallo)
  return data || []
}

async function cargarPrestamos(idsSocioNatillera) {
  if (!idsSocioNatillera.length) return []
  const respuesta = await supabase
    .from('prestamos')
    .select('id, monto, medio_entrega, socio_natillera_id, interes_anticipado, interes_total, created_at')
    .in('socio_natillera_id', idsSocioNatillera)
    .in('estado', ['activo', 'pagado'])
  return filasDe(respuesta, 'los préstamos')
}

async function cargarAportesActividad(idsSocioNatillera) {
  if (!idsSocioNatillera.length) return []
  const respuesta = await supabase
    .from('socios_actividad')
    .select('valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, forma_pago, socio_natillera_id, mes_pago, anio_pago, quincena_pago, fecha_pago, updated_at, actividad:actividades(descripcion, mes_pago, anio_pago, quincena_pago)')
    .in('socio_natillera_id', idsSocioNatillera)
    .gt('valor_pagado', 0)
  return filasDe(respuesta, 'los aportes a actividades')
}

/**
 * Se filtra por los socios de la natillera atravesando `prestamos` con `!inner`, no por
 * la lista de ids de préstamo. Así esta consulta no tiene que esperar a que responda la
 * de préstamos y puede salir en la misma ola. El `estado` se mantiene aquí para no
 * cambiar lo que se contaba antes.
 */
async function cargarCuotasPrestamo(idsSocioNatillera) {
  if (!idsSocioNatillera.length) return []
  const respuesta = await supabase
    .from('plan_pagos_prestamo')
    .select('valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, valor_cuota, forma_pago, nombre_socio, socio_nombre, prestamo_id, numero_cuota, fecha_pago, pagada, prestamos!inner(socio_natillera_id, estado)')
    .in('prestamos.socio_natillera_id', idsSocioNatillera)
    .in('prestamos.estado', ['activo', 'pagado'])
    .gt('valor_pagado', 0)
  return filasDe(respuesta, 'las cuotas de préstamo')
}

/**
 * Igual que arriba, pero atravesando `cuotas`. Filtrar por los ids de las cuotas obligaba
 * a esperar a que la natillera terminara de cargar y generaba una URL enorme —517 UUID en
 * un `in`, unos 19 kB de query string—, con riesgo de que un proxy la rechace.
 */
async function cargarHistorialPagos(idsSocioNatillera) {
  if (!idsSocioNatillera.length) return { data: [], error: null }
  return supabase
    .from('historial_pagos_cuota')
    .select('cuota_id, socio_nombre, fecha_pago, forma_pago, impuesto_4x1000, cuotas!inner(socio_natillera_id)')
    .in('cuotas.socio_natillera_id', idsSocioNatillera)
}

/**
 * @param {import('vue').Ref<string>} idNatillera
 */
export function useLibroCaja(idNatillera) {
  const natillerasStore = useNatillerasStore()

  const cargando = ref(true)
  const error = ref('')
  const natillera = ref(null)
  /** Apuntes con `fecha`, `saldo` pendiente de calcular, ordenados de más antiguo a más reciente. */
  const apuntes = ref([])

  /**
   * Dos olas de peticiones, no cuatro en cascada. La vista tardaba en abrir porque cada
   * consulta esperaba a la anterior —natillera → movimientos y préstamos → plan de pagos
   * e historial—, y contra `us-east-1` cada ida y vuelta se paga entera. Los datos son
   * pocos (medio millar de cuotas, ~120 kB): lo que costaba era el número de viajes.
   */
  async function cargar() {
    if (!idNatillera.value) return
    cargando.value = true
    error.value = ''
    const arranque = performance.now()
    try {
      const natId = idNatillera.value

      // Ola 1: lo que solo necesita el id de la natillera, todo lanzado a la vez.
      const promesaNatillera = natillerasStore.fetchNatillera(natId)
      // Se envuelve para que un fallo de red no quede como rechazo sin dueño mientras se
      // espera la ola 2; el error se atiende abajo, igual que el de cualquier consulta.
      const promesaMovimientos = Promise.resolve(
        supabase
          .from('movimientos_fondo')
          .select('id, tipo, monto, forma_pago, descripcion, fecha, origen_egreso, destino_ingreso')
          .eq('natillera_id', natId)
          .order('fecha', { ascending: false })
      ).then(res => res, e => ({ data: null, error: e }))
      // `fetchNatillera` ya trae los socios, pero no los publica hasta acabar sus dos
      // rondas. Pedir aparte solo los ids —una columna, treinta filas— sale más barato
      // que esperarla, y desbloquea la ola 2 un viaje antes.
      const sociosRes = await supabase.from('socios_natillera').select('id').eq('natillera_id', natId)
      if (sociosRes.error) throw sociosRes.error
      const idsSocioNatillera = (sociosRes.data || []).map(s => s.id)

      // Ola 2: depende de los ids de socios y nada más, así que corre solapada con la ola 1.
      const [prestamos, aportesActividad, cuotasPrestamo, historialRes] = await Promise.all([
        cargarPrestamos(idsSocioNatillera),
        cargarAportesActividad(idsSocioNatillera),
        cargarCuotasPrestamo(idsSocioNatillera),
        cargarHistorialPagos(idsSocioNatillera)
      ])

      const [nat, movimientosRes] = await Promise.all([promesaNatillera, promesaMovimientos])
      natillera.value = nat
      if (!nat) {
        error.value = 'Natillera no encontrada'
        apuntes.value = []
        return
      }
      if (movimientosRes.error) throw movimientosRes.error

      let historialCompleto = []
      if (historialRes?.error) {
        console.warn('Conciliación: historial de pagos no disponible:', historialRes.error.message)
      } else {
        historialCompleto = historialRes?.data || []
      }
      const historialGmf = historialCompleto.filter(r => (parseFloat(r.impuesto_4x1000) || 0) > 0)

      const items = construirItems(nat, prestamos, aportesActividad, movimientosRes.data || [], cuotasPrestamo, historialGmf, historialCompleto)
      apuntes.value = ordenarCronologicamente(items)

      if (import.meta.env.DEV) {
        console.log(`[Libro de caja] cargado en ${Math.round(performance.now() - arranque)} ms`, {
          apuntes: apuntes.value.length,
          socios: idsSocioNatillera.length,
          historial: historialCompleto.length
        })
      }
    } catch (e) {
      console.error('Error cargando el libro de caja:', e)
      error.value = e.message || 'Error al cargar los movimientos'
      apuntes.value = []
    } finally {
      cargando.value = false
    }
  }

  return { cargando, error, natillera, apuntes, cargar }
}

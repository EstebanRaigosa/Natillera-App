/**
 * Explicación de las sanciones para el portal del socio.
 *
 * No recalcula la sanción: la cifra oficial es `cuotas.valor_multa`, la que calcula la app
 * del admin (stores/cuotas.js, `calcularSancionesTotales`). Aquí se descompone esa cifra en
 * sus partes para que el socio entienda de dónde sale:
 *
 *   sanción = base + intereses
 *     base       simple: valor fijo · escalonada: según su lugar en la mora (mora_orden)
 *                diaria: valor por día × días de retraso
 *     intereses  cada N días en mora se suman $V (si la natillera los tiene activos)
 *
 * La base de simple/escalonada es un snapshot guardado en la cuota (valor_multa_base) y los
 * intereses son el resto. En la diaria no hay snapshot: los intereses se estiman por días y
 * la base es el resto. Por eso los días que se muestran son los de la cuota, pero la cifra que
 * manda es siempre la guardada.
 */

const MS_DIA = 86400000

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 'YYYY-MM-DD' (o timestamp) → Date local a medianoche; null si no es fecha. */
export function fechaLocal(v) {
  if (!v) return null
  const [a, m, d] = String(v).substring(0, 10).split('-').map(Number)
  if (!a || !m || !d) return null
  return new Date(a, m - 1, d)
}

/**
 * Reglas de la natillera normalizadas. Acepta el formato actual
 * ({ activa, dias_gracia, sanciones: { tipo, valorFijo, niveles, valorPorDia, interesesAdicionales, devolucion } })
 * y el antiguo ({ activa, valor, dias_gracia }), que equivale a una multa simple.
 */
export function normalizarReglas(reglas) {
  const r = reglas || {}
  const s = r.sanciones || {}
  const legado = !r.sanciones && r.valor != null
  const tipo = legado ? 'simple' : (s.tipo || 'simple')
  const activa = legado ? !!r.activa : !!(r.activa !== false && s.activa)
  const intereses = s.interesesAdicionales || s.intereses_adicionales || {}
  const devolucion = s.devolucion || {}
  return {
    activa,
    tipo,
    diasGracia: Math.max(0, num(r.dias_gracia ?? 3)),
    valorFijo: legado ? num(r.valor) : num(s.valorFijo),
    valorPorDia: num(s.valorPorDia),
    niveles: (s.niveles || [])
      .map((n) => ({ cuotas: num(n.cuotas), valor: num(n.valor) }))
      .filter((n) => n.cuotas > 0)
      .sort((a, b) => a.cuotas - b.cuotas),
    intereses: {
      activo: intereses.activo === true || intereses.activo === 'true' || intereses.activo === 1,
      dias: Math.max(1, num(intereses.dias) || 2),
      valor: num(intereses.valor),
    },
    devolucion: {
      activo: !!devolucion.activo,
      cuotasLimite: num(devolucion.cuotasLimite),
      porcentaje: num(devolucion.porcentajeMulta),
      sinUtilidades: !!devolucion.sinUtilidades,
    },
  }
}

/** Valor de la escalonada para la cuota en la posición `orden` de la mora (1 = primera). */
export function valorEscalonado(niveles, orden) {
  if (!niveles.length) return 0
  for (const n of niveles) if (orden <= n.cuotas) return n.valor
  return niveles[niveles.length - 1].valor
}

/** «1.ª», «2.ª», «3.ª»… */
export function ordinal(n) {
  return `${n}.ª`
}

/**
 * Tramos de la escalonada, agrupando niveles consecutivos con el mismo valor:
 * [{ desde: 1, hasta: 2, valor }, { desde: 3, hasta: null, valor }] (hasta null = «en adelante»).
 */
export function tramosEscalonada(niveles) {
  const tramos = []
  let desde = 1
  niveles.forEach((n, i) => {
    const ultimo = i === niveles.length - 1
    const previo = tramos[tramos.length - 1]
    if (previo && previo.valor === n.valor) previo.hasta = ultimo ? null : n.cuotas
    else tramos.push({ desde, hasta: ultimo ? null : n.cuotas, valor: n.valor })
    desde = n.cuotas + 1
  })
  return tramos
}

/**
 * Desglose de la sanción de una cuota. `null` si la cuota nunca tuvo sanción.
 *
 * @param {object} cuota - fila del portal (valor_multa, valor_pagado_sancion, valor_multa_base,
 *   mora_orden, fecha_inicio_mora, fecha_vencimiento, fecha_limite, fecha_pago, no_calcular_multa)
 * @param {object} reglas - resultado de normalizarReglas
 * @param {Date} hoy
 */
export function desglosarSancion(cuota, reglas, hoy = new Date()) {
  const total = num(cuota.valor_multa)
  const pagado = num(cuota.valor_pagado_sancion)
  const condonada = !!cuota.no_calcular_multa
  if (total <= 0 && pagado <= 0 && !condonada) return null

  // Días de retraso: desde el primer día en mora hasta el pago (o hasta hoy si no ha pagado)
  const inicio = fechaLocal(cuota.fecha_inicio_mora)
    || (() => {
      const venc = fechaLocal(cuota.fecha_vencimiento)
      if (venc) return new Date(venc.getTime() + MS_DIA)
      const lim = fechaLocal(cuota.fecha_limite)
      return lim ? new Date(lim.getTime() + (reglas.diasGracia + 1) * MS_DIA) : null
    })()
  const pagadaCuota = fechaLocal(cuota.fecha_pago)
  const corte = pagadaCuota || new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const diasRetraso = inicio ? Math.max(0, Math.round((corte - inicio) / MS_DIA) + 1) : null

  const referencia = Math.max(total, pagado)
  let base = 0
  let explicacionBase = ''
  let intereses = 0
  let periodos = 0

  if (reglas.tipo === 'diaria') {
    // Sin snapshot: los intereses se estiman por los días y la base es el resto
    if (reglas.intereses.activo && reglas.intereses.valor > 0 && diasRetraso) {
      periodos = Math.floor(diasRetraso / reglas.intereses.dias)
      intereses = Math.min(referencia, periodos * reglas.intereses.valor)
    }
    base = Math.max(0, referencia - intereses)
    const dias = reglas.valorPorDia > 0 ? Math.round(base / reglas.valorPorDia) : 0
    explicacionBase = dias > 0
      ? `${dias} ${dias === 1 ? 'día' : 'días'} × $${reglas.valorPorDia.toLocaleString('es-CO')}`
      : 'Por días de retraso'
  } else {
    const orden = num(cuota.mora_orden) || 1
    base = num(cuota.valor_multa_base)
      || (reglas.tipo === 'escalonada' ? valorEscalonado(reglas.niveles, orden) : reglas.valorFijo)
    base = Math.min(base, referencia || base)
    explicacionBase = reglas.tipo === 'escalonada'
      ? `Era tu ${ordinal(orden)} cuota en mora`
      : 'Valor fijo por cuota en mora'
    intereses = Math.max(0, referencia - base)
    if (intereses > 0 && reglas.intereses.valor > 0) {
      periodos = Math.round(intereses / reglas.intereses.valor)
    }
  }

  return {
    total,
    pagado,
    pendiente: condonada ? 0 : Math.max(0, total - pagado),
    condonada,
    diasRetraso,
    inicioMora: inicio,
    pagadaEl: pagadaCuota,
    base,
    explicacionBase,
    intereses,
    // Sin intereses configurados, la diferencia con la base no son «intereses»: es un
    // recargo que registró el admin (o una regla que ya cambió). Se nombra como tal.
    etiquetaExtra: reglas.intereses.activo ? 'Intereses' : 'Recargo adicional',
    periodos,
    diasPorPeriodo: reglas.intereses.dias,
    valorPorPeriodo: reglas.intereses.valor,
  }
}

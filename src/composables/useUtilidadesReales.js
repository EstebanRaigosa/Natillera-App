import { supabase } from '../lib/supabase'

/**
 * Utilidades del fondo calculadas DESDE LA FUENTE, no desde el acumulador.
 *
 * `utilidades_clasificadas` no es un cálculo: es un número al que cada cobro le suma y
 * cada reversión debería restarle, en tareas de segundo plano cuyo error solo va a la
 * consola. Ocho meses y unas cuantas operaciones después, ese número se desvía y no hay
 * forma de que se recupere solo. En una natillera real se encontraron tres desviaciones:
 *
 *   · Sanciones: el acumulador guardaba la multa cobrada, pero al perdonar una multa ya
 *     cobrada (`no_calcular_multa`) la cuota se pone a cero y la utilidad no se descuenta.
 *   · Préstamos: con interés anticipado el interés entra al generar el préstamo y NO debe
 *     volver a sumarse en cada abono; algún abono lo sumó igual.
 *   · Gastos contra utilidades: se ignoraban por completo cuando el neto salía negativo.
 *
 * Aquí se recalcula todo desde los datos que sí son hechos —lo que cada socio pagó, lo que
 * cada préstamo generó, lo que cada actividad dejó— para que el desglose y el cierre digan
 * lo mismo y digan la verdad.
 */

/** Tipos de actividad que generan utilidad con su propio nombre. */
const TIPOS_ACTIVIDAD = ['rifas', 'bingo', 'venta', 'evento', 'otro']

/** `actividades.tipo` guarda 'rifa' en singular; la utilidad se clasifica como 'rifas'. */
function tipoUtilidadDeActividad(tipo) {
  const t = String(tipo || 'otro').toLowerCase().trim()
  return t === 'rifa' ? 'rifas' : (TIPOS_ACTIVIDAD.includes(t) ? t : 'otro')
}

function aNumero(valor) {
  const n = parseFloat(valor)
  return Number.isFinite(n) ? n : 0
}

/**
 * @param {string} natilleraId
 * @param {{ idsSocioNatillera?: string[] }} opciones
 * @returns {Promise<{porTipo: object, total: number, registrado: number, diferencia: number, error?: string}>}
 */
export async function calcularUtilidadesReales(natilleraId, opciones = {}) {
  const porTipo = { sanciones: 0, prestamos: 0, rifas: 0, bingo: 0, venta: 0, evento: 0, otro: 0, utilidades_adicionales: 0 }
  if (!natilleraId) return { porTipo, total: 0, registrado: 0, diferencia: 0 }

  try {
    let ids = opciones.idsSocioNatillera
    if (!ids) {
      const { data, error } = await supabase
        .from('socios_natillera')
        .select('id')
        .eq('natillera_id', natilleraId)
      if (error) throw error
      ids = (data || []).map(s => s.id)
    }

    const sinSocios = ids.length === 0
    const [cuotasRes, salidasRes, prestamosRes, planRes, actividadesRes, movimientosRes, registradoRes, moraRes] = await Promise.all([
      sinSocios ? { data: [] } : supabase
        .from('cuotas')
        .select('valor_pagado_sancion')
        .in('socio_natillera_id', ids),
      /*
       * Sanciones por RETIRO de socio. No están en `cuotas` —no son multas de mora— sino
       * en el comprobante de salida que se emite al retirar a alguien. La fuente es ese
       * comprobante y no la fila de utilidad, por el mismo criterio que el resto: el
       * hecho, no el acumulador.
       */
      sinSocios ? { data: [] } : supabase
        .from('comprobantes_salida')
        .select('valor_sancion')
        .in('socio_natillera_id', ids),
      sinSocios ? { data: [] } : supabase
        .from('prestamos')
        .select('id, interes_anticipado, interes_total')
        .in('socio_natillera_id', ids)
        .in('estado', ['activo', 'pagado']),
      sinSocios ? { data: [] } : supabase
        .from('plan_pagos_prestamo')
        .select('interes, pagada, prestamos!inner(socio_natillera_id, interes_anticipado, estado)')
        .in('prestamos.socio_natillera_id', ids)
        .in('prestamos.estado', ['activo', 'pagado'])
        .eq('pagada', true),
      supabase
        .from('actividades')
        .select('tipo, estado, utilidad')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'liquidada'),
      supabase
        .from('movimientos_fondo')
        .select('tipo, monto, destino_ingreso, origen_egreso')
        .eq('natillera_id', natilleraId)
        .or('destino_ingreso.eq.utilidades,origen_egreso.eq.utilidades'),
      supabase
        .from('utilidades_clasificadas')
        .select('monto')
        .eq('natillera_id', natilleraId)
        .is('fecha_cierre', null),
      /*
       * El interés de MORA cobrado en los abonos. Es la única utilidad que no se puede
       * recalcular: no queda en ninguna columna del préstamo ni de su plan —solo se
       * acumula aquí, en su propia fila (`id_actividad` nulo y `subtipo: 'mora'`)—, así
       * que aquí sí hay que leer el acumulador. Ver `registrarMoraCobradaEnFondo`.
       */
      supabase
        .from('utilidades_clasificadas')
        .select('monto')
        .eq('natillera_id', natilleraId)
        .eq('tipo', 'prestamos')
        .is('id_actividad', null)
        .is('fecha_cierre', null)
        .filter('detalles->>subtipo', 'eq', 'mora')
    ])

    /*
     * Sanciones, de dos orígenes:
     *
     *   · Multas de mora: lo COBRADO (`valor_pagado_sancion`), nunca `valor_multa`, que es
     *     lo que el sistema calculó que se debía. Son cifras distintas —la calculada es
     *     siempre algo mayor— y solo la primera entró a la caja.
     *   · Sanción por retiro: el porcentaje que la natillera retiene del ahorro de quien
     *     se va, según el comprobante de salida.
     */
    porTipo.sanciones =
      (cuotasRes.data || []).reduce((suma, c) => suma + aNumero(c.valor_pagado_sancion), 0)
      + (salidasRes.data || []).reduce((suma, r) => suma + aNumero(r.valor_sancion), 0)

    /*
     * Préstamos, por tres caminos distintos:
     *
     *   · Interés ANTICIPADO: se cobra y se causa AL GENERAR el préstamo, así que entra
     *     entero ahí. Los abonos posteriores no suman nada más por este concepto.
     *   · Interés corriente: en los préstamos que no son anticipados, entra a medida que
     *     se va pagando cada cuota.
     *   · Interés de MORA: entra siempre al cobrarlo, sea el préstamo anticipado o no. Es
     *     lo único que suma un abono de un préstamo anticipado.
     */
    const anticipado = (prestamosRes.data || []).reduce(
      (suma, p) => suma + (p.interes_anticipado ? aNumero(p.interes_total) : 0), 0
    )
    const corriente = (planRes.data || []).reduce(
      (suma, c) => suma + (c.prestamos?.interes_anticipado ? 0 : aNumero(c.interes)), 0
    )
    const mora = (moraRes.data || []).reduce((suma, r) => suma + aNumero(r.monto), 0)
    porTipo.prestamos = anticipado + corriente + mora

    // Actividades: la utilidad que quedó al liquidarlas, con el nombre de su tipo.
    ;(actividadesRes.data || []).forEach(a => {
      porTipo[tipoUtilidadDeActividad(a.tipo)] += aNumero(a.utilidad)
    })

    /*
     * Ingresos y egresos marcados contra utilidades desde el cuadre. El neto se aplica
     * tal cual, también en negativo: antes solo contaba `if (neto > 0)` y los gastos
     * pagados con utilidades desaparecían del reparto.
     */
    porTipo.utilidades_adicionales = (movimientosRes.data || []).reduce((suma, m) => {
      const monto = aNumero(m.monto)
      if (monto <= 0) return suma
      if (m.tipo === 'entrada' && m.destino_ingreso === 'utilidades') return suma + monto
      if (m.tipo === 'salida' && m.origen_egreso === 'utilidades') return suma - monto
      return suma
    }, 0)

    const total = Object.values(porTipo).reduce((suma, v) => suma + v, 0)
    const registrado = (registradoRes.data || []).reduce((suma, r) => suma + aNumero(r.monto), 0)

    return { porTipo, total, registrado, diferencia: total - registrado }
  } catch (e) {
    console.error('calcularUtilidadesReales:', e)
    return { porTipo, total: 0, registrado: 0, diferencia: 0, error: e.message }
  }
}

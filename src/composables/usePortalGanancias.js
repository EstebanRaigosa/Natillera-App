import { supabase } from '../lib/supabase'
import { calcularCierreNatillera, getModoDistribucion, TIPOS_UTILIDAD } from './useCierreNatillera'
import { gananciasSinAdministracion } from '../utils/gananciasPortal'

/*
 * Foto de las ganancias de cada socio para el portal.
 *
 * El socio no puede (ni debe) correr `calcularCierreNatillera`: necesita leer los datos de
 * toda la natillera. Así que la app del admin la calcula —la misma función del cierre, una
 * sola fuente de verdad— y guarda el resultado por socio en `portal_ganancias`. El portal la
 * muestra con su fecha («calculado el …»).
 */

const CADA_CUANTO_MS = 30 * 60 * 1000 // al abrir la natillera, como mucho cada 30 min
const claveUltimoCalculo = natilleraId => `natillerapp_portal_ganancias_${natilleraId}`

/**
 * Guarda la foto a partir de un cálculo de cierre ya hecho (el de la vista de Cierre, por ejemplo).
 */
export async function guardarFotoGanancias(natilleraId, resultadoCierre, configCierre) {
  const socios = resultadoCierre?.socios || []
  if (!natilleraId || socios.length === 0) return
  // Cómo se reparte cada concepto: el portal lo muestra junto a la cifra (RF-09).
  const modos = Object.fromEntries(TIPOS_UTILIDAD.map(tipo => [tipo, getModoDistribucion(configCierre, tipo)]))
  const filas = socios
    .filter(s => s.socioNatillera?.id)
    .map(s => {
      /*
       * La administración no viaja al portal: el socio no la ve. Se guardan sus ganancias
       * ya con ella descontada (gananciasPortal.js), así que ni el porcentaje ni el monto
       * llegan a su celular, y aun así ahorro + ganancias − deudas = lo que recibe.
       */
      const netas = gananciasSinAdministracion(s)
      return {
        socio_natillera_id: s.socioNatillera.id,
        natillera_id: natilleraId,
        calculado_en: new Date().toISOString(),
        datos: {
          ahorro: s.ahorro || 0,
          utilidadesTotal: netas.utilidadesTotal,
          utilidadesPorConcepto: netas.utilidadesPorConcepto,
          descuentos: s.descuentos || 0,
          totalAEntregar: s.totalAEntregar || 0,
          totalFinal: s.totalFinal || 0,
          modos
        }
      }
    })
  if (filas.length === 0) return
  const { error } = await supabase.from('portal_ganancias').upsert(filas, { onConflict: 'socio_natillera_id' })
  if (error) throw error
  try { localStorage.setItem(claveUltimoCalculo(natilleraId), String(Date.now())) } catch { /* sin almacenamiento */ }
}

/**
 * Recalcula la foto ya, sin esperar al intervalo. Para después de un cambio que mueve las
 * utilidades (un ingreso o gasto contra utilidades, p. ej.): el socio lo ve de inmediato.
 * En segundo plano; los errores solo se registran.
 */
export async function recalcularFotoGanancias(natilleraId) {
  if (!natilleraId) return
  try {
    // Nadie usa el portal: no vale la pena el cálculo.
    const { data: vinculado } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios!inner(usuario_id)')
      .eq('natillera_id', natilleraId)
      .not('socio.usuario_id', 'is', null)
      .limit(1)
    if (!vinculado?.length) return
    const { data: nat } = await supabase.from('natilleras').select('config_cierre').eq('id', natilleraId).maybeSingle()
    const configCierre = nat?.config_cierre || {}
    const resultado = await calcularCierreNatillera(natilleraId, { configCierre })
    if (resultado?.error) return
    await guardarFotoGanancias(natilleraId, resultado, configCierre)
  } catch (e) {
    console.warn('No se pudo recalcular la foto de ganancias del portal:', e)
  }
}

/**
 * Recalcula y guarda la foto si alguien de la natillera usa el portal y hace rato no se
 * calcula. Pensada para correr en segundo plano al abrir la natillera: no bloquea nada y
 * los errores solo se registran.
 *
 * @param {object} natillera — con `id`, `config_cierre` y `socios_natillera[].socio.usuario_id`
 */
export async function actualizarFotoGananciasSiToca(natillera) {
  if (!natillera?.id) return
  // Nadie usa el portal: no vale la pena el cálculo (son varias consultas).
  const algunoVinculado = (natillera.socios_natillera || []).some(sn => sn.socio?.usuario_id)
  if (!algunoVinculado) return
  try {
    const ultimo = Number(localStorage.getItem(claveUltimoCalculo(natillera.id)) || 0)
    if (Date.now() - ultimo < CADA_CUANTO_MS) return
  } catch { /* sin almacenamiento: se calcula */ }
  try {
    const resultado = await calcularCierreNatillera(natillera.id, { configCierre: natillera.config_cierre })
    if (resultado?.error) return
    await guardarFotoGanancias(natillera.id, resultado, natillera.config_cierre)
  } catch (e) {
    console.warn('No se pudo actualizar la foto de ganancias del portal:', e)
  }
}

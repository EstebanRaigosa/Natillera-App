/**
 * Préstamos desactivados explícitamente (reglas_interes.activo === false al crear la natillera).
 * Sin reglas_interes o sin objeto → no se bloquea (natilleras anteriores al flag).
 */
export function natilleraPrestamosDeshabilitados(natillera) {
  if (!natillera || typeof natillera !== 'object') return false
  const r = natillera.reglas_interes
  if (r == null || typeof r !== 'object') return false
  return r.activo === false
}

export function natilleraPermitePrestamos(natillera) {
  return !natilleraPrestamosDeshabilitados(natillera)
}

/**
 * Normaliza las reglas de préstamo (reglas_interes) a un objeto consistente.
 * - activo: si false, préstamos deshabilitados.
 * - porcentaje: interés mensual pactado del préstamo (%).
 * - plazo_maximo: nº máximo de cuotas.
 * - tasa_mora: interés de mora mensual (%). Default 0 → sin mora hasta que el admin la configure
 *   (evita cobros retroactivos en natilleras existentes).
 * - dias_gracia_activo / dias_gracia: días después del vencimiento de una cuota del préstamo
 *   en los que todavía no corre mora. El valor es propio de préstamos, pero mientras no se
 *   haya guardado uno HEREDA el de las cuotas (`diasGraciaCuotas`): así una natillera que
 *   nunca configuró préstamos no tiene dos números distintos que explicar. Desactivado por
 *   defecto, igual que `tasa_mora` en 0: activar gracia cambia la mora de todos los préstamos
 *   vivos, y eso lo decide el admin, no una migración.
 */
export function parseReglasInteresPrestamo(raw, { diasGraciaCuotas = 3 } = {}) {
  const graciaCuotas = Number(diasGraciaCuotas)
  const heredado = Number.isFinite(graciaCuotas) && graciaCuotas >= 0 ? Math.floor(graciaCuotas) : 3
  const fallback = {
    activo: false, porcentaje: 2, plazo_maximo: 36, tasa_mora: 0,
    dias_gracia_activo: false, dias_gracia: heredado
  }
  if (!raw || typeof raw !== 'object') return { ...fallback }
  const plazo = Number(raw.plazo_maximo)
  const pct = Number(raw.porcentaje)
  const mora = Number(raw.tasa_mora)
  const gracia = Number(raw.dias_gracia)
  return {
    activo: raw.activo !== false,
    porcentaje: Number.isFinite(pct) && pct >= 0 ? pct : fallback.porcentaje,
    plazo_maximo: Number.isFinite(plazo) && plazo >= 1 ? Math.floor(plazo) : fallback.plazo_maximo,
    tasa_mora: Number.isFinite(mora) && mora >= 0 ? mora : fallback.tasa_mora,
    dias_gracia_activo: raw.dias_gracia_activo === true,
    // `raw.dias_gracia` ausente o inválido → se hereda el de cuotas, no se pone 0.
    dias_gracia: Number.isFinite(gracia) && gracia >= 0 ? Math.floor(gracia) : heredado
  }
}

/**
 * Días de gracia que de verdad se aplican a las cuotas de un préstamo: 0 si la regla
 * está desactivada. Es el único sitio donde se lee el par activo/valor, para que el
 * cálculo de mora no tenga que conocer el interruptor.
 */
export function diasGraciaPrestamo(reglas) {
  if (!reglas || reglas.dias_gracia_activo !== true) return 0
  const dias = Number(reglas.dias_gracia)
  return Number.isFinite(dias) && dias > 0 ? Math.floor(dias) : 0
}

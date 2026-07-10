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
 */
export function parseReglasInteresPrestamo(raw) {
  const fallback = { activo: false, porcentaje: 2, plazo_maximo: 36, tasa_mora: 0 }
  if (!raw || typeof raw !== 'object') return { ...fallback }
  const plazo = Number(raw.plazo_maximo)
  const pct = Number(raw.porcentaje)
  const mora = Number(raw.tasa_mora)
  return {
    activo: raw.activo !== false,
    porcentaje: Number.isFinite(pct) && pct >= 0 ? pct : fallback.porcentaje,
    plazo_maximo: Number.isFinite(plazo) && plazo >= 1 ? Math.floor(plazo) : fallback.plazo_maximo,
    tasa_mora: Number.isFinite(mora) && mora >= 0 ? mora : fallback.tasa_mora
  }
}

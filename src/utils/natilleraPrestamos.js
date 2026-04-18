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

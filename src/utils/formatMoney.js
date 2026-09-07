/**
 * Formato de moneda en pesos colombianos, sin decimales.
 * Devuelve solo el número: el `$` se pone en la plantilla, como en el resto de vistas.
 */
export function formatMoney(valor) {
  const n = Math.round(Number(valor) || 0)
  return new Intl.NumberFormat('es-CO').format(n)
}

/** Igual que `formatMoney` pero con signo explícito, para diferencias y saldos. */
export function formatMoneyConSigno(valor) {
  const n = Math.round(Number(valor) || 0)
  if (n === 0) return '0'
  return `${n > 0 ? '+' : '−'}${formatMoney(Math.abs(n))}`
}

/** Quita separadores de miles de lo que teclea el usuario y devuelve un número. */
export function parsearMonto(texto) {
  const limpio = String(texto ?? '').replace(/[^\d]/g, '')
  return limpio ? Number(limpio) : 0
}

/**
 * Reescribe lo tecleado con separadores de miles, para inputs de dinero.
 * Un «0» tecleado devuelve «0», no cadena vacía: declarar que no hay nada es una
 * respuesta válida y distinta de no haber contestado.
 */
export function formatearMontoInput(texto) {
  const limpio = String(texto ?? '').replace(/[^\d]/g, '')
  if (!limpio) return ''
  return new Intl.NumberFormat('es-CO').format(Number(limpio))
}

/*
 * Teléfonos de los socios.
 *
 * El número se usa para WhatsApp (wa.me) y para que el socio se vincule a la app con su
 * celular, así que un fijo o un número a medias rompe las dos cosas en silencio.
 *
 * Dos formas válidas, y así se guardan:
 *   · Colombia: 10 dígitos que empiezan por 3, SIN indicativo (3001234567). Es como
 *     están guardados casi todos, y el resto de la app lo asume.
 *   · Otro país: con + e indicativo (+5215512345678), de 8 a 15 dígitos (E.164).
 * Se acepta escrito como venga (espacios, guiones, paréntesis, 00 en lugar de +).
 */

/** Forma guardada: '3001234567' (Colombia) o '+<indicativo><número>' (otro país). */
export function normalizarCelular(texto) {
  const crudo = String(texto || '').trim()
  let digitos = crudo.replace(/\D/g, '')
  if (!digitos) return ''

  // Marcado internacional: con + delante o con 00.
  const internacional = crudo.startsWith('+') || digitos.startsWith('00')
  if (digitos.startsWith('00')) digitos = digitos.slice(2)

  // +57 / 0057 / 57 delante de un celular: es de Colombia, se guarda sin indicativo.
  if (digitos.length === 12 && digitos.startsWith('57')) return digitos.slice(2)
  if (internacional) return `+${digitos}`
  return digitos
}

export function esInternacional(texto) {
  return normalizarCelular(texto).startsWith('+')
}

/** Celular colombiano válido o número internacional válido. */
export function esTelefonoValido(texto) {
  const n = normalizarCelular(texto)
  if (n.startsWith('+')) return /^\+[1-9]\d{7,14}$/.test(n)
  return /^3\d{9}$/.test(n)
}

/** Mensaje para mostrar cuando no es válido; '' si lo es (o si está vacío). */
export function errorCelular(texto) {
  const n = normalizarCelular(texto)
  if (!n) return ''
  if (n.startsWith('+')) {
    const largo = n.length - 1
    if (n[1] === '0') return 'El indicativo del país no empieza por 0 (ej. +52, +34, +1).'
    if (largo < 8) return 'Número internacional incompleto: escribe el indicativo y el número completo.'
    if (largo > 15) return 'Sobran dígitos: un número internacional tiene como mucho 15.'
    return ''
  }
  if (!n.startsWith('3')) return 'Debe ser un celular (empieza por 3). Si es de otro país, escríbelo con + y el indicativo (ej. +52 55 1234 5678).'
  if (n.length < 10) return `Faltan ${10 - n.length} ${10 - n.length === 1 ? 'dígito' : 'dígitos'}: el celular tiene 10.`
  if (n.length > 10) return 'Sobran dígitos: el celular tiene 10 (sin contar el +57). Si es de otro país, escríbelo con +.'
  return ''
}

/**
 * Número para `https://wa.me/<número>`: solo dígitos, con indicativo. Los de Colombia
 * guardados sin él llevan 57 delante. '' si no hay número (wa.me/ abre WhatsApp sin chat).
 */
export function numeroWhatsApp(telefono) {
  const n = normalizarCelular(telefono)
  if (!n) return ''
  if (n.startsWith('+')) return n.slice(1)
  if (n.length === 10) return `57${n}`
  return n
}

/** Enlace de WhatsApp al número (o sin número, si no hay), con texto opcional. */
export function enlaceWhatsApp(telefono, texto = '') {
  const numero = numeroWhatsApp(telefono)
  const consulta = texto ? `?text=${encodeURIComponent(texto)}` : ''
  return `https://wa.me/${numero}${consulta}`
}

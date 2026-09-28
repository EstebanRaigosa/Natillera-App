const PREFIX = 'natillerapp:lastNatilleraId:'

export function storageKeyLastNatillera(userId) {
  return `${PREFIX}${userId}`
}

export function getLastNatilleraId(userId) {
  if (!userId || typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(storageKeyLastNatillera(userId))
    if (!v || v === 'undefined' || v === 'null') return null
    return v
  } catch {
    return null
  }
}

export function setLastNatilleraId(userId, natilleraId) {
  if (!userId || !natilleraId || typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKeyLastNatillera(userId), String(natilleraId))
  } catch {
    /* ignore */
  }
}

export function clearLastNatilleraId(userId) {
  if (!userId || typeof window === 'undefined') return
  try {
    localStorage.removeItem(storageKeyLastNatillera(userId))
  } catch {
    /* ignore */
  }
}

/*
 * Último lugar donde estuvo el usuario: una natillera que administra o el portal del socio
 * (`/mi-natillera/:socioNatilleraId`). Al volver a entrar —iniciar sesión, abrir la app
 * instalada— se vuelve ahí. Antes solo se recordaba la natillera, y un socio que usa el
 * portal caía en el dashboard de administración, que no es lo suyo.
 */
const PREFIX_LUGAR = 'natillerapp:ultimoLugar:'

export function setUltimoLugar(userId, lugar) {
  if (!userId || !lugar?.tipo || !lugar?.id || typeof window === 'undefined') return
  try {
    localStorage.setItem(`${PREFIX_LUGAR}${userId}`, JSON.stringify({ tipo: lugar.tipo, id: String(lugar.id) }))
  } catch {
    /* ignore */
  }
}

export function getUltimoLugar(userId) {
  if (!userId || typeof window === 'undefined') return null
  try {
    const crudo = localStorage.getItem(`${PREFIX_LUGAR}${userId}`)
    if (!crudo) return null
    const lugar = JSON.parse(crudo)
    if (!lugar?.id || !['natillera', 'portal'].includes(lugar.tipo)) return null
    return lugar
  } catch {
    return null
  }
}

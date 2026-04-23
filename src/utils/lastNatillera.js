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

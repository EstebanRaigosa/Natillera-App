import { getLastNatilleraId, getUltimoLugar } from './lastNatillera'

/**
 * Tras autenticación: si hay una última natillera visitada guardada en
 * localStorage, navegar a ella directamente. NatilleraDetalle.vue ya
 * maneja el caso en que la natillera no exista (redirige al Dashboard).
 *
 * Antes se hacía una query a Supabase para validar el ID, pero añadía
 * ~200-400ms de latencia al flujo de login sin beneficio real.
 */
/*
 * Destino pendiente: a dónde iba el usuario cuando se le pidió iniciar sesión (un enlace
 * de invitación, por ejemplo). Va en localStorage y no en la URL porque el inicio con
 * Google sale de la app y vuelve por /auth/welcome: la query se perdería por el camino.
 * Caduca en un día para que un enlace viejo no secuestre un inicio de sesión cualquiera.
 */
const CLAVE_DESTINO = 'natillerapp_destino_pendiente'
const VIGENCIA_DESTINO_MS = 24 * 60 * 60 * 1000

export function guardarDestinoPendiente(ruta) {
  // Solo rutas internas: nada de `//dominio` ni URLs completas.
  if (typeof ruta !== 'string' || !ruta.startsWith('/') || ruta.startsWith('//')) return
  try {
    localStorage.setItem(CLAVE_DESTINO, JSON.stringify({ ruta, hasta: Date.now() + VIGENCIA_DESTINO_MS }))
  } catch { /* sin almacenamiento: se vuelve al inicio normal */ }
}

function tomarDestinoPendiente() {
  try {
    const crudo = localStorage.getItem(CLAVE_DESTINO)
    if (!crudo) return null
    localStorage.removeItem(CLAVE_DESTINO)
    const { ruta, hasta } = JSON.parse(crudo)
    if (typeof ruta !== 'string' || !ruta.startsWith('/') || ruta.startsWith('//')) return null
    if (!hasta || Date.now() > hasta) return null
    return ruta
  } catch {
    return null
  }
}

export async function resolvePostLoginLocation(user) {
  if (!user?.id) {
    return { name: 'Dashboard' }
  }

  const destino = tomarDestinoPendiente()
  if (destino) return destino

  // Si lo último fue el portal del socio, se vuelve al portal (no al dashboard de administración).
  const lugar = getUltimoLugar(user.id)
  if (lugar?.tipo === 'portal') {
    return { name: 'PortalSocio', params: { socioNatilleraId: lugar.id } }
  }

  const last = getLastNatilleraId(user.id)
  if (!last || last === 'undefined' || last === 'null') {
    return { name: 'Dashboard' }
  }

  return { name: 'NatilleraDetalle', params: { id: String(last) } }
}

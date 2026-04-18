import { getLastNatilleraId } from './lastNatillera'

/**
 * Tras autenticación: si hay una última natillera visitada guardada en
 * localStorage, navegar a ella directamente. NatilleraDetalle.vue ya
 * maneja el caso en que la natillera no exista (redirige al Dashboard).
 *
 * Antes se hacía una query a Supabase para validar el ID, pero añadía
 * ~200-400ms de latencia al flujo de login sin beneficio real.
 */
export async function resolvePostLoginLocation(user) {
  if (!user?.id) {
    return { name: 'Dashboard' }
  }

  const last = getLastNatilleraId(user.id)
  if (!last || last === 'undefined' || last === 'null') {
    return { name: 'Dashboard' }
  }

  return { name: 'NatilleraDetalle', params: { id: String(last) } }
}

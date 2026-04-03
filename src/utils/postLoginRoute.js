import { supabase } from '../lib/supabase'
import { useNatillerasStore } from '../stores/natilleras'
import { getLastNatilleraId } from './lastNatillera'

/**
 * IDs de natilleras donde el usuario figura como socio (misma lógica que Dashboard).
 */
async function fetchNatilleraIdsDondeEsSocioPorEmail(email) {
  const normalized = (email || '').trim()
  if (!normalized) return []

  try {
    const { data: socios, error } = await supabase
      .from('socios')
      .select('id')
      .eq('email', normalized)
      .limit(1)

    if (error || !socios?.length) return []

    const socioId = socios[0].id
    const { data: sociosNatillera, error: errorSN } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('socio_id', socioId)

    if (errorSN || !sociosNatillera?.length) return []
    return sociosNatillera.map((sn) => String(sn.natillera_id))
  } catch (e) {
    console.error('postLoginRoute: error natilleras como socio', e)
    return []
  }
}

/**
 * Tras autenticación: Dashboard si no hay natilleras accesibles o no hay última válida;
 * si no, detalle de la última natillera visitada.
 * @param {import('@supabase/supabase-js').User | null} user
 * @returns {Promise<{ name: 'Dashboard' } | { name: 'NatilleraDetalle', params: { id: string } }>}
 */
export async function resolvePostLoginLocation(user) {
  if (!user?.id) {
    return { name: 'Dashboard' }
  }

  const natillerasStore = useNatillerasStore()
  await natillerasStore.fetchTodasLasNatilleras()

  const ids = new Set([
    ...natillerasStore.natilleras.map((n) => String(n.id)),
    ...natillerasStore.natillerasCompartidas.map((n) => String(n.id)),
  ])

  const socioIds = await fetchNatilleraIdsDondeEsSocioPorEmail(user.email)
  socioIds.forEach((id) => ids.add(id))

  if (ids.size === 0) {
    return { name: 'Dashboard' }
  }

  const last = getLastNatilleraId(user.id)
  if (!last || !ids.has(String(last))) {
    return { name: 'Dashboard' }
  }

  return { name: 'NatilleraDetalle', params: { id: String(last) } }
}

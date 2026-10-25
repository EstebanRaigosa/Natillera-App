import { ref } from 'vue'
import { supabase } from '../lib/supabase'

/*
 * Natilleras de los usuarios que aparecen en Tráfico (solo superadministrador).
 *
 * Se piden por lote a `natilleras_de_usuarios` y se guardan por usuario: cuando
 * entra alguien nuevo por Realtime solo se pregunta por él, no por toda la
 * página otra vez. Un usuario sin natilleras queda guardado con lista vacía,
 * para no volver a preguntar por él en cada latido.
 */
export function useNatillerasUsuarios() {
  const porUsuario = ref({})   // userId -> [{ id, nombre, estado, rol }]
  const pedidos = new Set()    // en vuelo o ya resueltos
  let pendientes = new Set()
  let temporizador = null

  /** Apunta usuarios a consultar; se agrupan en una sola llamada. */
  function pedir(ids) {
    for (const id of ids ?? []) {
      if (id && !pedidos.has(id)) pendientes.add(id)
    }
    if (!pendientes.size || temporizador) return
    // Un respiro para juntar lo que llega a la vez (historial, conectados, frecuencia).
    temporizador = setTimeout(consultar, 50)
  }

  async function consultar() {
    temporizador = null
    const lote = [...pendientes]
    pendientes = new Set()
    if (!lote.length) return
    lote.forEach((id) => pedidos.add(id))

    try {
      const { data, error } = await supabase.rpc('natilleras_de_usuarios', { p_user_ids: lote })
      if (error) throw error
      const nuevos = Object.fromEntries(lote.map((id) => [id, []]))
      for (const fila of data ?? []) nuevos[fila.user_id] = fila.natilleras ?? []
      porUsuario.value = { ...porUsuario.value, ...nuevos }
    } catch (e) {
      // Sin natilleras el panel sigue sirviendo; se podrán pedir otra vez.
      lote.forEach((id) => pedidos.delete(id))
      console.error('Natilleras de los usuarios:', e)
    }
  }

  function natillerasDe(userId) {
    return porUsuario.value[userId] ?? null
  }

  function detener() {
    clearTimeout(temporizador)
    temporizador = null
  }

  return { pedir, natillerasDe, detener }
}

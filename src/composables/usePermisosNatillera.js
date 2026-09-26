import { ref, computed, watch, unref } from 'vue'
import { supabase } from '../lib/supabase'
import { useColaboradoresStore } from '../stores/colaboradores'
import { RANGO, nivelesTodos } from '../permisos/modulos'

/*
 * Nivel del usuario en cada opción de una natillera (Nada / Ver / Gestionar).
 *
 * Un solo lugar para el router (bloquea las rutas en «Nada»), el menú (oculta lo que no
 * puede ver) y las pantallas (solo lectura si no puede gestionar). La respuesta viene de
 * la base de datos (`mis_niveles_natillera`), que es la misma que aplica las políticas: lo
 * que la app muestra y lo que la base de datos deja hacer no pueden diferir.
 *
 * Caché por usuario y natillera: el router y la pantalla preguntan lo mismo al entrar.
 * Vence al minuto, para que si el dueño cambia los permisos de alguien, a esa persona se
 * le apliquen al navegar sin cerrar sesión. `invalidarNiveles()` la vacía a la fuerza.
 */
const VIGENCIA_MS = 60 * 1000
const cache = new Map() // `${usuario}:${natillera}` → { promesa, en }

export function invalidarNiveles(natilleraId = null) {
  if (!natilleraId) {
    cache.clear()
    return
  }
  for (const clave of cache.keys()) if (clave.endsWith(`:${natilleraId}`)) cache.delete(clave)
}

async function consultar(natilleraId) {
  const { data, error } = await supabase.rpc('mis_niveles_natillera', { p_natillera_id: natilleraId })
  if (!error && data?.niveles) return { rol: data.rol, niveles: data.niveles }

  // Sin la migración 052 aplicada: la misma lógica calculada aquí con lo guardado.
  if (error) console.warn('mis_niveles_natillera no disponible; se calculan los permisos en el navegador:', error.message)
  const permisos = await useColaboradoresStore().obtenerMisPermisos(natilleraId)
  if (!permisos) return { rol: 'sin_acceso', niveles: nivelesTodos('nada') }
  return { rol: permisos.rol, niveles: permisos.niveles }
}

/** Niveles del usuario actual en una natillera (con caché). */
export async function cargarNivelesNatillera(natilleraId, { forzar = false } = {}) {
  if (!natilleraId) return { rol: 'sin_acceso', niveles: nivelesTodos('nada') }
  const { data: { session } } = await supabase.auth.getSession()
  const usuario = session?.user?.id
  if (!usuario) return { rol: 'sin_acceso', niveles: nivelesTodos('nada') }

  const clave = `${usuario}:${natilleraId}`
  const guardada = cache.get(clave)
  if (forzar || !guardada || Date.now() - guardada.en > VIGENCIA_MS) {
    const promesa = consultar(natilleraId).catch(e => {
      cache.delete(clave)
      throw e
    })
    cache.set(clave, { promesa, en: Date.now() })
  }
  return cache.get(clave).promesa
}

export const alcanza = (nivel, minimo) => (RANGO[nivel] ?? 0) >= (RANGO[minimo] ?? 0)

/**
 * Para una pantalla o el menú. `natilleraId` puede ser ref, computed o texto.
 *
 * Mientras carga, `puedeGestionar` responde que sí: casi todos los que abren una natillera
 * son su dueño, y esconder y mostrar botones en cada entrada se ve roto. Quien no tiene
 * permiso los ve un instante, pero la base de datos rechaza cualquier escritura suya.
 */
export function usePermisosNatillera(natilleraId) {
  const rol = ref(null)
  const niveles = ref(null)
  const cargado = computed(() => niveles.value !== null)

  async function recargar(forzar = false) {
    const id = unref(natilleraId)
    if (!id) return
    try {
      const r = await cargarNivelesNatillera(id, { forzar })
      if (unref(natilleraId) !== id) return
      rol.value = r.rol
      niveles.value = r.niveles
    } catch (e) {
      console.error('No se pudieron cargar los permisos de la natillera:', e)
    }
  }

  watch(() => unref(natilleraId), () => {
    rol.value = null
    niveles.value = null
    recargar()
  }, { immediate: true })

  const nivel = modulo => niveles.value?.[modulo] ?? null
  const puedeVer = modulo => !cargado.value || alcanza(nivel(modulo), 'ver')
  const puedeGestionar = modulo => !cargado.value || alcanza(nivel(modulo), 'gestionar')

  return { rol, niveles, cargado, nivel, puedeVer, puedeGestionar, recargar }
}

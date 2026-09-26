import { ref } from 'vue'
import { supabase } from '../lib/supabase'

/*
 * Puente entre el portal del socio (PortalSocio.vue) y la barra lateral del layout.
 *
 * La barra lateral vive en DashboardLayout y no sabe qué secciones tiene cada socio
 * (Ganancias solo si el admin las muestra, Préstamos solo si tiene, etc.): el portal las
 * publica aquí y la barra pinta los mismos botones que la barra inferior del móvil. Al
 * tocar uno, la barra llama a `elegir` y el portal hace lo mismo que con su barra inferior.
 *
 * Estado de módulo a propósito: hay un solo portal montado a la vez.
 */
const secciones = ref([])
const activa = ref('resumen')
const natilleraQueAdministra = ref(null)
const misNatilleras = ref([])
let alElegir = null
let natilleras = null // promesa en curso o ya resuelta
let natillerasDeUsuario = null // de quién es esa lista: otra cuenta en la misma pestaña no debe verla

/** El portal se registra al montarse; devuelve la función para darse de baja al desmontarse. */
function registrarPortal(fn) {
  alElegir = fn
  return () => {
    if (alElegir !== fn) return
    alElegir = null
    secciones.value = []
    activa.value = 'resumen'
    natilleraQueAdministra.value = null
  }
}

function elegir(valor) {
  alElegir?.(valor)
}

/**
 * Natilleras donde esta cuenta es socio vinculado, para saltar entre portales. Se consulta
 * una vez por usuario; si cambia la cuenta (cerrar sesión y entrar con otra sin recargar),
 * se descarta la lista anterior antes de pedir la nueva.
 */
function cargarMisNatilleras(usuarioId, { forzar = false } = {}) {
  if (usuarioId !== natillerasDeUsuario) {
    natillerasDeUsuario = usuarioId
    natilleras = null
    misNatilleras.value = []
  }
  if (!usuarioId) return Promise.resolve()
  if (natilleras && !forzar) return natilleras
  const pedida = supabase.rpc('portal_mis_natilleras').then(({ data, error }) => {
    // Si mientras respondía cambió la cuenta, esta respuesta ya no es de nadie.
    if (natilleras !== pedida) return
    if (error) {
      console.warn('No se pudieron cargar las natilleras como socio:', error)
      natilleras = null
      return
    }
    misNatilleras.value = data || []
  })
  natilleras = pedida
  return pedida
}

export function usePortalNavegacion() {
  return {
    secciones,
    activa,
    natilleraQueAdministra,
    misNatilleras,
    registrarPortal,
    elegir,
    cargarMisNatilleras
  }
}

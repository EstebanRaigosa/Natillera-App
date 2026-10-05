import { ref, watch } from 'vue'

/*
 * Preferencia del superadministrador de no verse a sí mismo en Tráfico y Auditoría:
 * es quien más entra y su propio rastro tapa el de los demás.
 *
 * Una sola ref a nivel de módulo para que las dos vistas compartan el estado, y
 * localStorage para recordarla entre visitas. Activada por defecto. localStorage puede
 * fallar (Safari en privado lanza al escribir), así que se envuelve: sin él, el
 * interruptor sigue funcionando durante la sesión.
 */
const CLAVE = 'natillerapp:ocultar-mi-actividad'

function leer() {
  try {
    return localStorage.getItem(CLAVE) !== '0'
  } catch {
    return true
  }
}

const ocultarMiActividad = ref(leer())

watch(ocultarMiActividad, (valor) => {
  try {
    localStorage.setItem(CLAVE, valor ? '1' : '0')
  } catch {
    // Sin almacenamiento: la preferencia dura lo que dure la pestaña.
  }
})

/**
 * Filtro PostgREST que excluye un correo sin perder las filas con correo nulo
 * («Usuario eliminado»): un `neq` a secas las descartaría, porque NULL <> x no es cierto.
 */
export function filtroSinCorreo(columna, correo) {
  return `${columna}.is.null,${columna}.neq."${correo}"`
}

export function useOcultarMiActividad() {
  return { ocultarMiActividad }
}

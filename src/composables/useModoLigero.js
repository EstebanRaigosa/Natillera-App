/**
 * Modo ligero: adapta la app al dispositivo y a la red que tiene delante.
 *
 * El problema que resuelve: la interfaz usa unos 133 `backdrop-blur`, 266
 * sombras grandes y 654 transiciones. En un móvil reciente eso lo pinta la GPU
 * sin despeinarse; en uno de gama baja cada blur obliga a recomponer y
 * desenfocar todo lo que hay detrás en cada fotograma, y la app se arrastra
 * aunque los datos ya estén cargados. No es un problema de red: es de pintado.
 *
 * Cuando se detecta un equipo modesto o una conexión lenta se marca
 * `<html data-ligero>`, y el CSS global sustituye los efectos caros por
 * equivalentes baratos (fondo sólido en vez de blur, sombra plana, transiciones
 * cortas). El diseño no cambia de forma: cambia de coste.
 *
 * La decisión se toma una vez al arrancar y no se reevalúa sola: que la interfaz
 * cambie de aspecto a mitad de uso porque el móvil pasó de 4G a 3G desconcierta
 * más de lo que ayuda.
 */

const CLAVE = 'natillerapp:modo-ligero'

/** Lo que el usuario haya elegido a mano manda sobre cualquier detección. */
function preferenciaGuardada() {
  try {
    const v = localStorage.getItem(CLAVE)
    return v === 'si' ? true : v === 'no' ? false : null
  } catch {
    // Safari en modo privado puede lanzar al tocar localStorage.
    return null
  }
}

export function detectarEquipoModesto() {
  if (typeof navigator === 'undefined') return false

  const nucleos = navigator.hardwareConcurrency
  const memoria = navigator.deviceMemory

  // Cada señal se evalúa solo si el navegador la expone. `deviceMemory` no
  // existe en Safari: darle un valor por defecto haría que TODOS los iPhone
  // entraran en modo ligero, incluidos los que van sobrados.
  const pocosNucleos = typeof nucleos === 'number' && nucleos <= 4
  const pocaMemoria = typeof memoria === 'number' && memoria <= 4

  return pocosNucleos || pocaMemoria
}

export function detectarRedLenta() {
  if (typeof navigator === 'undefined') return false
  const con = navigator.connection
  if (!con) return false
  // `saveData` es una petición explícita del usuario: se respeta siempre.
  if (con.saveData) return true
  return ['slow-2g', '2g', '3g'].includes(con.effectiveType)
}

export function prefiereMenosMovimiento() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
}

/** Decide y marca el documento. Se llama una vez, antes de montar la app. */
export function aplicarModoLigero() {
  if (typeof document === 'undefined') return false

  const manual = preferenciaGuardada()
  const activo = manual !== null
    ? manual
    : detectarEquipoModesto() || detectarRedLenta() || prefiereMenosMovimiento()

  if (activo) document.documentElement.setAttribute('data-ligero', '')
  else document.documentElement.removeAttribute('data-ligero')

  return activo
}

/** Para un interruptor en Configuración. `null` vuelve a la detección automática. */
export function fijarModoLigero(valor) {
  try {
    if (valor === null) localStorage.removeItem(CLAVE)
    else localStorage.setItem(CLAVE, valor ? 'si' : 'no')
  } catch { /* modo privado: se queda en automático */ }
  return aplicarModoLigero()
}

export function modoLigeroActivo() {
  return typeof document !== 'undefined' &&
    document.documentElement.hasAttribute('data-ligero')
}

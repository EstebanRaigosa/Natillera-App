/**
 * Recorridos antiguos con driver.js: que no sobrevivan a la pantalla que los abrió.
 *
 * driver.js pinta su velo en <body>, fuera del árbol de Vue, así que desmontar la vista
 * no lo quita. En Safari, volver deslizando desde el borde cambia de ruta con el recorrido
 * abierto y el velo se queda tapando la pantalla siguiente. Además, los recorridos arrancan
 * con setTimeout/requestAnimationFrame y reintentos: si la vista se va antes, el recorrido
 * aparecía igualmente sobre otra pantalla.
 *
 * Cada arranque abre una «sesión» que guarda sus temporizadores y su driver. La sesión se
 * cancela (temporizadores fuera, driver destruido) al cambiar de ruta por el historial, en
 * `pagehide` o cuando la vista llama a `cerrarRecorridosDriver()` al desmontarse.
 *
 * No se escucha cualquier `popstate`: los modales cierran con history.back() sin cambiar de
 * URL (useModalStack) y eso mataría el recorrido de Cuotas justo cuando pide abrir el
 * selector de mes. Solo cuenta si cambió la ruta.
 */

const sesiones = new Set()

function rutaActual() {
  return window.location.pathname
}

function cancelar(sesion) {
  if (sesion.cancelada) return
  sesion.cancelada = true
  sesion.timers.forEach((t) => clearTimeout(t))
  sesion.timers.clear()
  sesion.frames.forEach((f) => cancelAnimationFrame(f))
  sesion.frames.clear()
  sesion.soltar()
  const d = sesion.driver
  if (d) {
    try {
      if (d.isActive()) d.destroy()
    } catch {
      /* el driver ya estaba desmontado */
    }
  }
  sesion.alForzarCierre?.()
}

/**
 * @param {{ alForzarCierre?: () => void }} [opts] - limpieza de UI si se corta el recorrido
 *   (cerrar la barra lateral, etc.). No se llama al cerrarlo el usuario: eso va por onDestroyed.
 */
export function crearSesionRecorrido({ alForzarCierre } = {}) {
  const sesion = {
    driver: null,
    timers: new Set(),
    frames: new Set(),
    cancelada: false,
    alForzarCierre,
    ruta: rutaActual()
  }
  const alCambiarHistorial = () => {
    if (rutaActual() !== sesion.ruta) cancelar(sesion)
  }
  const alOcultarPagina = () => cancelar(sesion)
  sesion.soltar = () => {
    window.removeEventListener('popstate', alCambiarHistorial)
    window.removeEventListener('pagehide', alOcultarPagina)
    sesiones.delete(sesion)
  }
  window.addEventListener('popstate', alCambiarHistorial)
  window.addEventListener('pagehide', alOcultarPagina)
  sesiones.add(sesion)

  return {
    get cancelada() {
      return sesion.cancelada
    },
    /** setTimeout que muere con la sesión. */
    esperar(fn, ms) {
      if (sesion.cancelada) return
      const t = setTimeout(() => {
        sesion.timers.delete(t)
        if (!sesion.cancelada) fn()
      }, ms)
      sesion.timers.add(t)
    },
    /** requestAnimationFrame que muere con la sesión. */
    alSiguienteFrame(fn) {
      if (sesion.cancelada) return
      const f = requestAnimationFrame(() => {
        sesion.frames.delete(f)
        if (!sesion.cancelada) fn()
      })
      sesion.frames.add(f)
    },
    usarDriver(d) {
      sesion.driver = d
      return d
    },
    /** El recorrido terminó por su cuenta (cerrado por el usuario o sin nada que mostrar). */
    terminar() {
      sesion.soltar()
    }
  }
}

/** Corta cualquier recorrido driver.js en curso o pendiente. Para onBeforeUnmount de las vistas. */
export function cerrarRecorridosDriver() {
  for (const sesion of [...sesiones]) cancelar(sesion)
}

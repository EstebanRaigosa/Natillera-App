import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import { isBodyScrollLocked } from './useBodyScrollLock'

/**
 * Actualización de la PWA tras un despliegue.
 *
 * El problema que resuelve: el service worker sirve el `index.html` del
 * precache, así que mientras siga mandando el service worker viejo el usuario ve
 * la versión vieja por muchos despliegues que se hagan. Antes solo se salía de
 * ahí recargando a mano —y varias veces, porque el precache son varios MB y en
 * la primera recarga el service worker nuevo aún se estaba instalando—.
 *
 * Cómo se resuelve, y por qué así:
 *
 *  · **Se avisa, no se interrumpe.** Si el usuario está mirando la app, aparece
 *    un aviso y él decide cuándo. Recargar sin permiso en una app donde se está
 *    registrando un pago es peor que enseñar una versión vieja un rato más.
 *  · **En segundo plano se actualiza sola.** Si la app está oculta, se aplica sin
 *    preguntar: al volver ya está en la versión nueva y nadie ha visto nada. Con
 *    una excepción: si hay un modal abierto hay trabajo a medias, y eso no se
 *    toca aunque la pestaña esté oculta.
 *  · **Se busca actualización sin depender de que cierren la app.** Una PWA
 *    instalada puede pasar días abierta; sin esto no se enteraría.
 *
 * Es estado global y de una sola instancia: hay un único service worker.
 */

const hayVersionNueva = ref(false)
const actualizando = ref(false)

let aplicarActualizacionSW = null
let iniciado = false
let intervaloComprobacion = null

/** Cada media hora. Una PWA instalada no se cierra sola. */
const MS_ENTRE_COMPROBACIONES = 30 * 60 * 1000

/** Lo que se espera al relevo del service worker antes de recargar de todos modos. */
const MS_TOPE_RELEVO = 5000

export function useActualizacionApp() {
  function iniciar() {
    if (iniciado || typeof window === 'undefined') return
    iniciado = true

    aplicarActualizacionSW = registerSW({
      immediate: true,

      // Hay una versión nueva instalada y esperando el relevo.
      onNeedRefresh() {
        hayVersionNueva.value = true
        aplicarSiNoMolesta()
      },

      onRegisteredSW(_url, registro) {
        if (!registro) return

        const comprobar = () => { registro.update().catch(() => {}) }

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') comprobar()
          // Al irse a segundo plano es el mejor momento para aplicar lo que
          // estuviera esperando: la recarga no la ve nadie.
          else aplicarSiNoMolesta()
        })

        // Volver de un túnel o del metro es el otro momento típico en que hay
        // algo nuevo que no se pudo comprobar antes.
        window.addEventListener('online', comprobar)

        intervaloComprobacion = setInterval(comprobar, MS_ENTRE_COMPROBACIONES)
      },

      onRegisterError(error) {
        // Sin service worker la app funciona igual, solo pierde el arranque
        // desde cache. No es motivo para molestar al usuario.
        console.warn('[pwa] no se pudo registrar el service worker:', error)
      },
    })
  }

  /** Aplica la actualización solo si no interrumpe nada. */
  function aplicarSiNoMolesta() {
    if (!hayVersionNueva.value || actualizando.value) return
    if (document.visibilityState === 'visible') return
    // Un modal abierto es trabajo a medias: un formulario, un comprobante, un
    // pago sin confirmar. Se espera a que el usuario lo cierre.
    if (isBodyScrollLocked.value) return
    actualizar()
  }

  /**
   * Da el relevo al service worker nuevo y recarga cuando toma el control.
   *
   * No basta con la recarga del plugin. vite-plugin-pwa solo recarga si el
   * evento `controlling` trae `isUpdate`, y eso es falso cuando la página se
   * abrió sin service worker al mando —Ctrl+Shift+R en escritorio, o las
   * DevTools saltándose el SW—: el nuevo toma el control y nadie recarga, y el
   * aviso se quedaba en «Actualizando…» para siempre. Por eso se escucha aquí
   * `controllerchange` directamente y, si en unos segundos no llega (el SW
   * viejo tarda en soltar, o el relevo ya ocurrió desde otra pestaña), se
   * recarga igual: una recarga de más es mejor que un botón muerto.
   */
  function actualizar() {
    if (!aplicarActualizacionSW || actualizando.value) return
    actualizando.value = true

    let recargando = false
    const recargar = () => {
      if (recargando) return
      recargando = true
      window.location.reload()
    }
    navigator.serviceWorker?.addEventListener('controllerchange', recargar, { once: true })
    setTimeout(recargar, MS_TOPE_RELEVO)

    Promise.resolve(aplicarActualizacionSW(true)).catch(recargar)
  }

  function detener() {
    if (intervaloComprobacion) {
      clearInterval(intervaloComprobacion)
      intervaloComprobacion = null
    }
  }

  return { hayVersionNueva, actualizando, iniciar, actualizar, detener }
}

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { detectIosPlatform } from './useIsIos'

/** Por encima de esto no es el chrome del navegador, es el teclado. */
const MAXIMO_CHROME_PX = 160

/**
 * Píxeles del viewport de layout que quedan ocultos por debajo del área visible.
 *
 * Desde iOS 15, Safari coloca su barra de direcciones **abajo** y la dibuja
 * **encima** del contenido. Un elemento `position: fixed; bottom: 0` se ancla al
 * viewport de *layout*, cuyo borde inferior queda por detrás de esa barra: la
 * barra inferior de la app aparece cortada o tapada del todo.
 *
 * `env(safe-area-inset-bottom)` no sirve para esto: describe el home indicator,
 * no el chrome del navegador, y vale 0 justo cuando la barra de Safari estorba.
 * El visual viewport sí conoce el área realmente visible, y la diferencia entre
 * ambos es lo que hay que levantar el elemento.
 *
 * Solo se aplica en iOS y fuera del modo standalone: en la PWA instalada no hay
 * barra de Safari, y en Android el chrome vive arriba. Devuelve 0 en el resto,
 * de modo que el `bottom: 0` de siempre sigue mandando.
 *
 * @returns {{ tapado: import('vue').Ref<number>, medir: () => void }}
 */
export function useTapadoInferior() {
  const tapado = ref(0)

  const enStandalone = () =>
    (typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches ||
        window.navigator?.standalone === true)) === true

  const aplica = () => typeof window !== 'undefined' && detectIosPlatform() && !enStandalone()

  function medir() {
    if (!aplica()) {
      tapado.value = 0
      return
    }
    const vv = window.visualViewport
    if (!vv) {
      tapado.value = 0
      return
    }
    const alturaLayout = document.documentElement?.clientHeight || window.innerHeight || 0
    // `offsetTop` descuenta lo que el visual viewport ya está desplazado dentro
    // del de layout (pinch-zoom); sin él, el cálculo se va con el zoom activo.
    const visibleHastaAbajo = vv.height + vv.offsetTop
    const diferencia = Math.round(alturaLayout - visibleHastaAbajo)

    // Con el teclado abierto la diferencia se dispara a varios cientos de píxeles.
    // Levantar la barra ahí la dejaría flotando a media pantalla, así que en ese
    // caso se deja donde está: el teclado ya tapa la zona y no hay nada que salvar.
    tapado.value = diferencia > 0 && diferencia <= MAXIMO_CHROME_PX ? diferencia : 0
  }

  let raf = null
  function programar() {
    if (raf != null) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      raf = null
      medir()
    })
  }

  onMounted(() => {
    programar()
    // `window.resize` no basta: contraer o expandir la barra de Safari mueve el
    // visual viewport sin disparar resize ni scroll en `window`.
    window.addEventListener('resize', programar)
    window.addEventListener('orientationchange', programar)
    window.visualViewport?.addEventListener('resize', programar)
    window.visualViewport?.addEventListener('scroll', programar)
  })

  onBeforeUnmount(() => {
    if (raf != null) {
      cancelAnimationFrame(raf)
      raf = null
    }
    window.removeEventListener('resize', programar)
    window.removeEventListener('orientationchange', programar)
    window.visualViewport?.removeEventListener('resize', programar)
    window.visualViewport?.removeEventListener('scroll', programar)
  })

  return { tapado, medir: programar }
}

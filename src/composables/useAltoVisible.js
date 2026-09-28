import { onBeforeUnmount, watch } from 'vue'

/**
 * Publica en `:root` el alto realmente visible como `--alto-visible` (px),
 * mientras `activo` sea verdadero.
 *
 * Es la misma idea que `useAltoDisponible` (la página /soporte), pero para hojas
 * inferiores dentro de ModalWrapper: allí no se puede fijar el alto en línea
 * sobre la tarjeta, porque la tarjeta la pinta ModalWrapper y en `sm+` la altura
 * la mandan las clases. Con una variable CSS, la clase móvil usa
 * `min(88dvh, var(--alto-visible))` como altura y las `sm:h-*` siguen ganando.
 *
 * Por qué hace falta: en iOS el teclado no encoge el viewport de layout, así que
 * `dvh` no cambia y una hoja de 88dvh/100dvh queda más alta que lo visible;
 * Safari desplaza el visual viewport para enseñar el campo y la cabecera se sale
 * por arriba. `visualViewport.height` sí descuenta el teclado.
 *
 * `window.resize` no se dispara con el teclado ni con el pinch-zoom: se escuchan
 * `resize` y `scroll` del visualViewport, más `orientationchange`.
 *
 * @param {import('vue').Ref<boolean>|(() => boolean)} activo
 */

let suscriptores = 0
let raf = null

function medir() {
  const vv = window.visualViewport
  if (!vv) return
  // Con pinch-zoom `height` encoge en proporción a la escala; multiplicar la
  // deshace para que hacer zoom no redimensione la hoja. Con el teclado la
  // escala es 1 y queda el alto visible tal cual.
  const alto = Math.round(vv.height * (vv.scale || 1))
  document.documentElement.style.setProperty('--alto-visible', `${alto}px`)
}

function programar() {
  if (raf != null) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    raf = null
    medir()
  })
}

function escuchar() {
  window.addEventListener('resize', programar)
  window.addEventListener('orientationchange', programar)
  window.visualViewport?.addEventListener('resize', programar)
  window.visualViewport?.addEventListener('scroll', programar)
}

function dejarDeEscuchar() {
  if (raf != null) {
    cancelAnimationFrame(raf)
    raf = null
  }
  window.removeEventListener('resize', programar)
  window.removeEventListener('orientationchange', programar)
  window.visualViewport?.removeEventListener('resize', programar)
  window.visualViewport?.removeEventListener('scroll', programar)
  // Sin la variable, las clases caen a su `dvh` de siempre.
  document.documentElement.style.removeProperty('--alto-visible')
}

export function useAltoVisible(activo) {
  if (typeof window === 'undefined') return
  let suscrito = false

  function suscribir() {
    if (suscrito) return
    suscrito = true
    if (suscriptores++ === 0) escuchar()
    medir()
  }

  function desuscribir() {
    if (!suscrito) return
    suscrito = false
    if (--suscriptores === 0) dejarDeEscuchar()
  }

  watch(activo, (valor) => (valor ? suscribir() : desuscribir()), { immediate: true })
  onBeforeUnmount(desuscribir)
}

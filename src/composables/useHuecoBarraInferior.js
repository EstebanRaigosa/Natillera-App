import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Píxeles que la barra inferior de la app (`MobileBottomNav`) le quita al fondo del
 * `<main>`, medidos en vivo.
 *
 * Sirve para anclar algo con `position: sticky; bottom` justo encima de esa barra.
 * Un valor fijo en CSS no aguanta: el alto de la barra cambia con el safe-area, con la
 * barra de Safari en iOS (la levanta `useTapadoInferior`, §4.1 del manual) y con el
 * tamaño de letra. Se mide la distancia real entre el borde inferior del `<main>` —que
 * llega al fondo de la pantalla, por debajo de la barra— y el borde superior de la barra.
 *
 * Devuelve 0 si la barra no está (escritorio, o rutas sin natillera).
 *
 * @returns {{ hueco: import('vue').Ref<number>, medir: () => void }}
 */
export function useHuecoBarraInferior() {
  const hueco = ref(0)
  let raf = 0
  let observador = null
  let barra = null

  function medir() {
    const main = document.querySelector('main')
    barra = document.getElementById('tour-mobile-bottom-nav')
    if (!main || !barra) {
      hueco.value = 0
      return
    }
    const rectBarra = barra.getBoundingClientRect()
    // `display: none` en escritorio: sin caja, no tapa nada.
    if (rectBarra.height === 0) {
      hueco.value = 0
      return
    }
    const fondoMain = main.getBoundingClientRect().bottom
    hueco.value = Math.max(0, Math.round(fondoMain - rectBarra.top))
  }

  function programar() {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      raf = 0
      medir()
    })
  }

  onMounted(() => {
    medir()
    window.addEventListener('resize', programar)
    window.addEventListener('orientationchange', programar)
    // El teclado y la barra de Safari mueven el viewport visual sin disparar `resize`.
    window.visualViewport?.addEventListener('resize', programar)
    window.visualViewport?.addEventListener('scroll', programar)
    if (typeof ResizeObserver !== 'undefined') {
      observador = new ResizeObserver(programar)
      const main = document.querySelector('main')
      if (main) observador.observe(main)
      if (barra) observador.observe(barra)
    }
    // La barra se esconde y aparece con un `transform`, que no cambia su tamaño.
    barra?.addEventListener('transitionend', programar)
  })

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    window.removeEventListener('resize', programar)
    window.removeEventListener('orientationchange', programar)
    window.visualViewport?.removeEventListener('resize', programar)
    window.visualViewport?.removeEventListener('scroll', programar)
    observador?.disconnect()
    barra?.removeEventListener('transitionend', programar)
  })

  return { hueco, medir }
}

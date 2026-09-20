import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Fija la altura de un elemento a lo que queda de pantalla por debajo de él.
 *
 * El chat necesita altura acotada para que el hilo tenga su propio scroll y el
 * redactor quede anclado abajo. Un `calc(100dvh - Xrem)` obliga a adivinar la
 * altura de la cabecera del layout y falla en cuanto esta cambia; aquí se mide
 * la posición real del elemento y se resta.
 *
 * En iOS se mide sobre `visualViewport`, no sobre `window.innerHeight`: al abrir
 * el teclado, `innerHeight` no cambia y el redactor quedaría debajo de él,
 * mientras que `visualViewport.height` sí refleja el espacio realmente visible.
 *
 * @param {import('vue').Ref<HTMLElement|null>} elemento
 * @param {number} margen  píxeles a dejar por debajo (padding del layout)
 */
export function useAltoDisponible(elemento, margen = 12) {
  const alto = ref(0)

  function medir() {
    const el = elemento.value
    if (!el) return

    const arriba = el.getBoundingClientRect().top
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    // `offsetTop` del visualViewport descuenta lo que la página ya está
    // desplazada dentro del viewport visual.
    const alturaVisible = vv ? vv.height + vv.offsetTop : window.innerHeight

    const disponible = Math.max(320, Math.round(alturaVisible - arriba - margen))
    alto.value = disponible
    el.style.height = `${disponible}px`
  }

  let raf = null
  function programar() {
    if (raf != null) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => { raf = null; medir() })
  }

  onMounted(() => {
    programar()
    window.addEventListener('resize', programar)
    window.addEventListener('orientationchange', programar)
    window.visualViewport?.addEventListener('resize', programar)
    window.visualViewport?.addEventListener('scroll', programar)
  })

  onBeforeUnmount(() => {
    if (raf != null) cancelAnimationFrame(raf)
    window.removeEventListener('resize', programar)
    window.removeEventListener('orientationchange', programar)
    window.visualViewport?.removeEventListener('resize', programar)
    window.visualViewport?.removeEventListener('scroll', programar)
  })

  return { alto, medir: programar }
}

import { ref, watch, nextTick, onUnmounted } from 'vue'

/**
 * Natiscroll — indicador «Desliza para ver más» para el cuerpo scrolleable de un modal.
 *
 * Devuelve `hayMas` en true mientras quede contenido por debajo del viewport del cuerpo
 * y el usuario no haya llegado al final (con un umbral para evitar parpadeo). Vuelve a
 * medir ante cambios de tamaño o de contenido (búsqueda, listas filtradas, carga async)
 * mediante ResizeObserver + MutationObserver, y usa requestAnimationFrame para no hacer
 * trabajo pesado en cada evento de scroll táctil.
 *
 * Uso:
 *   const { scrollRef, hayMas, onScroll } = useNatiscroll(modalRef)
 *   <div ref="scrollRef" @scroll.passive="onScroll"> ... </div>
 *   <NatiscrollHint :show="hayMas" />
 *
 * @param {import('vue').Ref<boolean>} showRef  ref/computed de visibilidad del modal
 * @param {number} [umbral=10]  margen en px para ocultar la pista cerca del final
 */
export function useNatiscroll(showRef, umbral = 10) {
  const scrollRef = ref(null)
  const hayMas = ref(false)
  let raf = null
  let ro = null
  let mo = null

  function medir() {
    const el = scrollRef.value
    if (!el) {
      hayMas.value = false
      return
    }
    hayMas.value = el.scrollTop + el.clientHeight < el.scrollHeight - umbral
  }

  function programar() {
    if (raf != null) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      raf = null
      medir()
    })
  }

  function teardown() {
    if (raf != null) {
      cancelAnimationFrame(raf)
      raf = null
    }
    if (ro) {
      ro.disconnect()
      ro = null
    }
    if (mo) {
      mo.disconnect()
      mo = null
    }
  }

  function attach(el) {
    medir()
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => programar())
      ro.observe(el)
    }
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => programar())
      mo.observe(el, { childList: true, subtree: true, characterData: true })
    }
  }

  watch(
    showRef,
    async (visible) => {
      teardown()
      if (!visible) {
        hayMas.value = false
        return
      }
      await nextTick()
      await nextTick()
      const el = scrollRef.value
      if (el) attach(el)
    },
    { immediate: true }
  )

  onUnmounted(teardown)

  return { scrollRef, hayMas, onScroll: programar, remedir: programar }
}

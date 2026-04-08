import { ref, watch, nextTick, onUnmounted } from 'vue'

/**
 * Detecta si el cuerpo scrolleable del modal tiene overflow vertical (patrón modales Natillerapp).
 * @param {import('vue').Ref<boolean>} showRef - ref o computed que indica si el modal está visible
 * @param {import('vue').Ref<HTMLElement | null>} scrollElRef - ref al contenedor con overflow-y-auto
 */
export function useModalBodyScrollOverflow(showRef, scrollElRef) {
  const tieneScroll = ref(false)
  let ro = null
  let mo = null

  function measure() {
    const el = scrollElRef.value
    if (!el) {
      tieneScroll.value = false
      return
    }
    tieneScroll.value = el.scrollHeight > el.clientHeight + 1
  }

  function teardownObservers() {
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
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure())
      ro.observe(el)
    }
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => measure())
      mo.observe(el, { childList: true, subtree: true, characterData: true })
    }
  }

  watch(
    showRef,
    async (visible) => {
      teardownObservers()
      if (!visible) {
        tieneScroll.value = false
        return
      }
      await nextTick()
      await nextTick()
      const el = scrollElRef.value
      if (el) attach(el)
    },
    { immediate: true }
  )

  onUnmounted(() => teardownObservers())

  return { tieneScroll, measureOverflow: measure }
}

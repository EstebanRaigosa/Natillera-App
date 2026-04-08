import { computed, isRef, onUnmounted, provide, ref, watch } from 'vue'

/** @type {{ skip: boolean, afterDismiss: (() => void) | null }} */
export const __modalStackSync = { skip: false, afterDismiss: null }

export const NATILLERAPP_MODAL_STACK_KEY = Symbol('natillerappModalStack')

/**
 * Pila de modales: solo una visible; al abrir otra se oculta la anterior y al cerrar la última se restaura.
 * Sincroniza history (pushState / popstate) para que «atrás» del navegador/Android cierre la capa superior.
 *
 * IMPORTANTE: los watchers usan flush:'sync' para que hide/show/dismiss ejecuten los side-effects
 * en el mismo tick, mientras los flags suppress/restoring estén activos.
 *
 * @param {Record<string, import('vue').Ref<boolean> | { isOpen: import('vue').ComputedRef<boolean>, hide: () => void, show: () => void, dismiss: () => void }>} modalsConfig
 * @param {{ syncHistory?: boolean }} [options]
 */
export function useModalStack(modalsConfig, options = {}) {
  const syncHistory = options.syncHistory !== false
  const stack = ref([])
  const currentModalId = ref(null)
  let suppress = 0
  let restoring = false
  let ignorePopstate = 0
  let historyLayers = 0

  const ids = Object.keys(modalsConfig)

  function normalize(id) {
    const cfg = modalsConfig[id]
    if (isRef(cfg)) {
      return {
        isOpen: computed(() => !!cfg.value),
        hide: () => { cfg.value = false },
        show: () => { cfg.value = true },
        dismiss: () => { cfg.value = false }
      }
    }
    return cfg
  }

  const normalized = {}
  for (const id of ids) {
    normalized[id] = normalize(id)
  }

  function resolveTopModalId() {
    if (currentModalId.value) {
      const cur = currentModalId.value
      if (normalized[cur]?.isOpen.value) return cur
    }
    for (const id of ids) {
      if (normalized[id].isOpen.value) return id
    }
    return null
  }

  function hideOthersExcept(keepId) {
    suppress++
    try {
      for (const oid of ids) {
        if (oid === keepId) continue
        if (normalized[oid].isOpen.value) normalized[oid].hide()
      }
    } finally {
      suppress--
    }
  }

  function onOpenSideEffect(id) {
    if (suppress > 0) return
    if (restoring) {
      suppress++
      try {
        hideOthersExcept(id)
      } finally {
        suppress--
      }
      return
    }
    if (currentModalId.value && currentModalId.value !== id) {
      stack.value.push(currentModalId.value)
    }
    currentModalId.value = id
    suppress++
    try {
      hideOthersExcept(id)
    } finally {
      suppress--
    }
    if (syncHistory && typeof history !== 'undefined') {
      const prev = history.state
      const base =
        prev != null && typeof prev === 'object' && !Array.isArray(prev) ? { ...prev } : {}
      history.pushState({ ...base, __natillerappModal: 1 }, '', location.href)
      historyLayers++
    }
  }

  function onCloseSideEffect(id) {
    if (suppress > 0) return
    if (currentModalId.value !== id) return
    currentModalId.value = null
    const prev = stack.value.pop()
    if (prev) {
      restoring = true
      suppress++
      try {
        currentModalId.value = prev
        normalized[prev].show()
      } finally {
        suppress--
        restoring = false
      }
    }
  }

  for (const id of ids) {
    watch(
      () => normalized[id].isOpen.value,
      (open, wasOpen) => {
        if (open && !wasOpen) onOpenSideEffect(id)
        else if (!open && wasOpen) onCloseSideEffect(id)
      },
      { flush: 'sync' }
    )
  }

  function dismissTopFromHistory() {
    const id = resolveTopModalId()
    if (!id) return
    if (currentModalId.value !== id) currentModalId.value = id
    try {
      __modalStackSync.skip = true
      normalized[id].dismiss()
    } finally {
      __modalStackSync.skip = false
    }
  }

  function handlePopState() {
    if (ignorePopstate > 0) {
      ignorePopstate--
      return
    }
    if (!resolveTopModalId()) return
    dismissTopFromHistory()
    if (historyLayers > 0) historyLayers--
  }

  function afterProgrammaticDismiss() {
    if (!syncHistory || typeof history === 'undefined') return
    if (historyLayers > 0) {
      historyLayers--
      ignorePopstate++
      history.back()
    }
  }

  function requestCloseTop() {
    const id = resolveTopModalId()
    if (!id) return false

    dismissTopFromHistory()

    if (syncHistory && typeof history !== 'undefined' && historyLayers > 0) {
      historyLayers--
      ignorePopstate++
      history.back()
    }
    return true
  }

  const hasOpenModal = computed(() => ids.some((mid) => normalized[mid].isOpen.value))

  if (syncHistory && typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState)
  }

  __modalStackSync.afterDismiss = afterProgrammaticDismiss

  onUnmounted(() => {
    if (syncHistory && typeof window !== 'undefined') {
      window.removeEventListener('popstate', handlePopState)
    }
    __modalStackSync.afterDismiss = null
  })

  const injectValue = {
    requestCloseTop,
    hasOpenModal
  }

  provide(NATILLERAPP_MODAL_STACK_KEY, injectValue)

  return {
    currentModalId,
    stack,
    requestCloseTop,
    hasOpenModal,
    afterProgrammaticDismiss
  }
}

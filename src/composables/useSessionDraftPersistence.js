import { onMounted, onUnmounted } from 'vue'

/**
 * Persiste un borrador en sessionStorage cuando la pestaña o la app pasan a segundo
 * plano (visibilitychange) o cuando el documento se descarta (pagehide).
 * Mitiga la pérdida de trabajo cuando iOS/Android recargan la página al volver.
 *
 * @param {() => string} getStorageKey - clave única (p. ej. usuario + natillera + flujo)
 * @param {() => object | null} getPayload - datos JSON-serializables; null = no guardar
 */
export function useSessionDraftPersistence(getStorageKey, getPayload) {
  function persist() {
    try {
      const payload = getPayload()
      if (payload == null) return
      const key = getStorageKey()
      sessionStorage.setItem(
        key,
        JSON.stringify({ v: 1, savedAt: Date.now(), ...payload })
      )
    } catch {
      // cuota llena o modo privado
    }
  }

  function onVisibility() {
    if (typeof document !== 'undefined' && document.hidden) {
      persist()
    }
  }

  function onPageHide() {
    persist()
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', onPageHide)
  })

  return { persist }
}

import { ref, readonly, onMounted } from 'vue'

/**
 * Detecta si el usuario está en iOS (iPhone, iPad, iPod).
 * Exportada para useBodyScrollLock y otras utilidades (misma lógica que useIsIos).
 * Excluye Android; incluye iPadOS en modo escritorio.
 */
export function detectIosPlatform() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  if (/Android/i.test(ua)) return false
  if (/iPad|iPhone|iPod/.test(ua)) return true
  if (/^iP(ad|hone|od)/i.test(platform)) return true
  if (platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1) {
    return true
  }
  return false
}

const isIosRef = ref(false)

export function useIsIos() {
  // Re-evaluar al montar el componente para no depender del orden de carga del módulo
  onMounted(() => {
    isIosRef.value = detectIosPlatform()
  })
  // Valor inicial por si el template se evalúa antes de onMounted (misma visita)
  if (typeof navigator !== 'undefined' && isIosRef.value === false) {
    isIosRef.value = detectIosPlatform()
  }
  return readonly(isIosRef)
}

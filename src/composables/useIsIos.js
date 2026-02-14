import { ref, readonly, onMounted } from 'vue'

/**
 * Detecta si el usuario está en iOS (iPhone, iPad, iPod).
 * Solo devuelve true en dispositivos Apple móviles para mostrar LoadingScreenIos
 * sin afectar Android, Mac desktop ni otros navegadores.
 */
function detectIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  // Excluir Android explícitamente (evita WebViews o UAs raros)
  if (/Android/i.test(ua)) return false
  // iPhone/iPad/iPod en userAgent (Safari estándar en iOS)
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // platform en iOS suele ser "iPhone", "iPad", "iPod touch"
  if (/^iP(ad|hone|od)/i.test(platform)) return true
  return false
}

const isIosRef = ref(false)

export function useIsIos() {
  // Re-evaluar al montar el componente para no depender del orden de carga del módulo
  onMounted(() => {
    isIosRef.value = detectIos()
  })
  // Valor inicial por si el template se evalúa antes de onMounted (misma visita)
  if (typeof navigator !== 'undefined' && isIosRef.value === false) {
    isIosRef.value = detectIos()
  }
  return readonly(isIosRef)
}

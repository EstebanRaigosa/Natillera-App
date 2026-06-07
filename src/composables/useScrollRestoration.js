import { onMounted, onUnmounted } from 'vue'

/**
 * Restaura la posición de scroll tras un reload por descarte de pestaña (móvil).
 *
 * Guarda el scrollTop del contenedor (clave = ruta actual) cuando la app pasa a segundo
 * plano (visibilitychange/pagehide) y lo restaura al montar — que en un layout persistente
 * solo ocurre en la carga inicial, es decir, justo en el reload. En navegaciones normales
 * dentro de la SPA el layout no se remonta, así que no interfiere con el scroll-to-top del router.
 *
 * Usa sessionStorage: sobrevive al reload de la misma pestaña y se borra al cerrarla.
 *
 * @param {() => Element | null} getScrollEl - devuelve el contenedor scrolleable
 */
const KEY = 'natillera_scroll_pos'

export function useScrollRestoration(getScrollEl) {
  function save() {
    try {
      const el = getScrollEl()
      if (!el || !el.scrollTop) return
      sessionStorage.setItem(
        KEY,
        JSON.stringify({ path: location.pathname, top: el.scrollTop })
      )
    } catch {
      // cuota llena / modo privado
    }
  }

  function onVisibility() {
    if (typeof document !== 'undefined' && document.hidden) save()
  }

  function tryRestore() {
    try {
      const raw = sessionStorage.getItem(KEY)
      if (!raw) return
      const { path, top } = JSON.parse(raw)
      if (path !== location.pathname || !top) return

      // El contenido carga de forma asíncrona (datos de Supabase) y la altura crece poco a
      // poco; reintentamos en cada frame hasta poder alcanzar `top` (o ~1 s máx).
      let tries = 0
      const restore = () => {
        const el = getScrollEl()
        if (!el) return
        el.scrollTop = top
        tries++
        if (Math.abs(el.scrollTop - top) > 2 && tries < 60) {
          requestAnimationFrame(restore)
        }
      }
      requestAnimationFrame(restore)
    } catch {
      // payload corrupto
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', save)
    tryRestore()
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', save)
  })

  return { save }
}

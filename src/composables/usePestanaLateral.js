import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Pestaña que se desliza hasta la opción activa de la barra lateral.
 *
 * Es un solo elemento que viaja entre opciones (no un fondo por opción) para
 * que el cambio se vea como un movimiento continuo, también entre secciones.
 *
 * Se recalcula observando el atributo `class` del menú en vez de vigilar la
 * ruta: la opción activa la deciden varias fuentes (ruta, sección del portal,
 * natillera elegida) y todas acaban en `.nav-link-active`.
 */
export function usePestanaLateral(contenedor, selector = '.nav-link-active') {
  const pestana = ref({ visible: false, animar: false, x: 0, y: 0, alto: 0 })

  let marco = 0
  let observadorClases = null
  let observadorTamano = null

  function medir() {
    marco = 0
    const nav = contenedor.value
    if (!nav) return
    // offsetParent null = la opción está en una sección oculta (p. ej. «Menú» en móvil)
    const activo = [...nav.querySelectorAll(selector)].find((el) => el.offsetParent !== null)
    if (!activo) {
      pestana.value = { ...pestana.value, visible: false, animar: false }
      return
    }
    const rNav = nav.getBoundingClientRect()
    const rActivo = activo.getBoundingClientRect()
    const x = rActivo.left - rNav.left
    const siguiente = {
      visible: true,
      // La primera vez aparece en su sitio; animar desde arriba parecería un salto
      animar: pestana.value.visible,
      x,
      y: rActivo.top - rNav.top + nav.scrollTop,
      alto: rActivo.height,
    }
    const actual = pestana.value
    if (Object.keys(siguiente).every((k) => siguiente[k] === actual[k])) return
    pestana.value = siguiente
  }

  function programar() {
    if (marco) return
    marco = requestAnimationFrame(medir)
  }

  onMounted(async () => {
    await nextTick()
    const nav = contenedor.value
    if (!nav) return
    medir()
    observadorClases = new MutationObserver(programar)
    observadorClases.observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
    if (typeof ResizeObserver !== 'undefined') {
      observadorTamano = new ResizeObserver(programar)
      observadorTamano.observe(nav)
    }
    window.addEventListener('resize', programar)
    window.addEventListener('orientationchange', programar)
  })

  onUnmounted(() => {
    if (marco) cancelAnimationFrame(marco)
    observadorClases?.disconnect()
    observadorTamano?.disconnect()
    window.removeEventListener('resize', programar)
    window.removeEventListener('orientationchange', programar)
  })

  return { pestana }
}

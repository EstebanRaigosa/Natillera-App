import { computed, ref } from 'vue'

/**
 * Adjunto que se está viendo a pantalla completa, uno para toda la app.
 *
 * Antes cada burbuja del hilo montaba su propio `VisorAdjunto`: en una
 * conversación larga eran decenas de overlays esperando a no hacer nada. Pero el
 * motivo de fondo es otro: el visor tiene que entrar en la pila de modales del
 * layout para que «atrás» lo cierre a él y no al chat que hay debajo, y esa pila
 * necesita un estado único al que apuntar, no uno por burbuja.
 *
 * El visor se monta una sola vez en `DashboardLayout`; las burbujas solo piden
 * abrirlo.
 */
const adjuntoVisible = ref(null)

export function useVisorAdjunto() {
  function abrirAdjunto(adjunto) {
    if (!adjunto) return
    adjuntoVisible.value = adjunto
  }

  function cerrarAdjunto() {
    adjuntoVisible.value = null
  }

  return {
    adjuntoVisible,
    visorAbierto: computed(() => adjuntoVisible.value !== null),
    abrirAdjunto,
    cerrarAdjunto,
  }
}

import { ref } from 'vue'

/** @type {import('vue').Ref<{ type: string, natilleraId: string, token: number } | null>} */
export const pendingNatilleraSidebarAction = ref(null)

export function clearPendingNatilleraSidebarAction() {
  pendingNatilleraSidebarAction.value = null
}

/**
 * Solicita una acción que ejecuta NatilleraDetalle (modales / flujos).
 * Si la ruta actual no es el detalle, navega al detalle y el montaje procesa la acción.
 * La acción "cerrar" natillera se maneja en la barra lateral navegando a `/natilleras/:id/cierre`.
 */
export function requestNatilleraSidebarAction(type, natilleraId) {
  if (!natilleraId || natilleraId === 'undefined' || natilleraId === 'null') return
  pendingNatilleraSidebarAction.value = {
    type,
    natilleraId: String(natilleraId),
    token: Date.now()
  }
}

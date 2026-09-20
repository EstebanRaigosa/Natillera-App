import { ref } from 'vue'

/**
 * Petición para que `AvisoNotificacionesPwa` salga AHORA, en un momento concreto
 * en el que el permiso tiene sentido para quien lo recibe.
 *
 * Por qué existe: el permiso de notificaciones solo se puede pedir desde un gesto
 * del usuario, así que lo que se dispara no es `Notification.requestPermission()`
 * sino el modal que lleva el botón. Y pedirlo nada más entrar, a todo el mundo,
 * quema el permiso: quien lo deniega en el diálogo nativo lo deja en `denied`
 * para siempre y ya no hay forma de volver a preguntar.
 *
 * El momento bueno es justo después de escribir a soporte: ahí el usuario SÍ
 * espera una respuesta y el aviso le sirve para algo.
 *
 * Mismo patrón que `useNatilleraSidebarActions`: un ref con token que el
 * componente observa.
 */

/** @type {import('vue').Ref<{ motivo: string, token: number } | null>} */
export const avisoNotificacionesPedido = ref(null)

/** Marca de que esta persona usa el chat de soporte, y por tanto tiene algo que
 *  recibir. Gobierna si el aviso vuelve a salir al entrar. */
const CLAVE_USA_SOPORTE = 'natillerapp:soporte-usado'

export function pedirAvisoNotificaciones(motivo = 'soporte') {
  avisoNotificacionesPedido.value = { motivo, token: Date.now() }
}

export function limpiarAvisoNotificacionesPedido() {
  avisoNotificacionesPedido.value = null
}

/** Se llama al enviar un mensaje de soporte: a partir de ahí hay conversación
 *  abierta y las notificaciones dejan de ser abstractas. */
export function anotarUsaSoporte() {
  try {
    localStorage.setItem(CLAVE_USA_SOPORTE, '1')
  } catch { /* sin storage se pierde la marca; solo afecta a la insistencia al entrar */ }
}

export function usaSoporte() {
  try {
    return localStorage.getItem(CLAVE_USA_SOPORTE) === '1'
  } catch {
    return false
  }
}

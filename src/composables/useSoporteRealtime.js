import { onUnmounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * Suscripción en tiempo real al hilo de soporte (RF-09).
 *
 * Dos cosas que la especificación exige y que aquí son el motivo del código:
 *
 *  · Degradación: si el canal no se establece o se cae —una red corporativa que
 *    bloquea WebSocket, por ejemplo— se pasa a recargar cada 60 s. La pantalla
 *    nunca se queda sin vía de actualización.
 *
 *  · Limpieza: el canal se cierra al desmontar. Una suscripción huérfana por
 *    cada conversación visitada es una fuga (RNF-11).
 *
 * El canal escucha dos cosas: mensajes nuevos (INSERT en `soporte_mensajes`) y
 * cambios de la conversación (UPDATE en `soporte_conversaciones`, publicada con
 * lista de columnas para que `nota_interna` no viaje por el canal — ver la
 * migración 023).
 */

const MS_REINTENTO = 60_000

export function useSoporteRealtime({ alRecibir, alCambiarConversacion, alRefrescar }) {
  // 'conectando' | 'en_vivo' | 'degradado'
  const estadoCanal = ref('conectando')

  let canal = null
  let temporizador = null

  function iniciarRespaldo() {
    if (temporizador) return
    estadoCanal.value = 'degradado'
    temporizador = setInterval(() => { alRefrescar?.() }, MS_REINTENTO)
  }

  function pararRespaldo() {
    if (!temporizador) return
    clearInterval(temporizador)
    temporizador = null
  }

  /**
   * @param {string|null} conversacionId  null = todas las conversaciones (panel)
   */
  function suscribir(conversacionId = null) {
    cerrar()
    estadoCanal.value = 'conectando'

    const nombre = conversacionId ? `soporte:conv:${conversacionId}` : 'soporte:todos'
    canal = supabase.channel(nombre)

    canal.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'soporte_mensajes',
        ...(conversacionId ? { filter: `conversacion_id=eq.${conversacionId}` } : {}),
      },
      (evento) => { alRecibir?.(evento.new) },
    )

    // Cambios de estado (resuelta, en proceso, archivada) y del último mensaje.
    // Sin esto, el usuario no ve que el soporte ha cerrado su conversación
    // hasta que recarga la página.
    canal.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'soporte_conversaciones',
        ...(conversacionId ? { filter: `id=eq.${conversacionId}` } : {}),
      },
      (evento) => { alCambiarConversacion?.(evento.new) },
    )

    canal.subscribe((estado) => {
      if (estado === 'SUBSCRIBED') {
        estadoCanal.value = 'en_vivo'
        pararRespaldo()
      } else if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT' || estado === 'CLOSED') {
        iniciarRespaldo()
      }
    })

    // Si en 10 s no ha llegado el SUBSCRIBED, se asume que no va a llegar.
    setTimeout(() => { if (estadoCanal.value === 'conectando') iniciarRespaldo() }, 10_000)
  }

  function cerrar() {
    if (canal) {
      supabase.removeChannel(canal)
      canal = null
    }
    pararRespaldo()
  }

  onUnmounted(cerrar)

  return { estadoCanal, suscribir, cerrar }
}

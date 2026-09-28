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
  let esperaSuscripcion = null
  let ultimaRecarga = 0

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

  /*
   * iOS suspende la página (y su WebSocket) al pasar a segundo plano o al
   * bloquear el teléfono, y `postgres_changes` no reenvía lo que se emitió
   * mientras tanto: al volver, el hilo se quedaría sin los mensajes de ese rato.
   * Se recarga al volver a estar visible. `pageshow` cubre la vuelta desde la
   * caché de páginas (bfcache), que no siempre dispara `visibilitychange`; como
   * a veces llegan los dos seguidos, se ignora el segundo.
   */
  function alVolverVisible() {
    if (document.visibilityState !== 'visible') return
    const ahora = Date.now()
    if (ahora - ultimaRecarga < 1000) return
    ultimaRecarga = ahora
    alRefrescar?.()
  }

  function escucharVisibilidad() {
    if (typeof document === 'undefined') return
    document.addEventListener('visibilitychange', alVolverVisible)
    window.addEventListener('pageshow', alVolverVisible)
  }

  function dejarDeEscucharVisibilidad() {
    if (typeof document === 'undefined') return
    document.removeEventListener('visibilitychange', alVolverVisible)
    window.removeEventListener('pageshow', alVolverVisible)
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

    // `removeChannel` es asíncrono: al completarse emite CLOSED sobre este mismo
    // callback. Si para entonces el canal ya se cerró o se sustituyó por otro,
    // hay que ignorarlo; si no, arrancaba un respaldo de 60 s que nadie paraba.
    const este = canal
    const vigente = () => canal === este

    este.subscribe((estado) => {
      if (!vigente()) return
      if (estado === 'SUBSCRIBED') {
        estadoCanal.value = 'en_vivo'
        pararRespaldo()
      } else if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT' || estado === 'CLOSED') {
        iniciarRespaldo()
      }
    })

    // Si en 10 s no ha llegado el SUBSCRIBED, se asume que no va a llegar.
    esperaSuscripcion = setTimeout(() => {
      esperaSuscripcion = null
      if (vigente() && estadoCanal.value === 'conectando') iniciarRespaldo()
    }, 10_000)

    escucharVisibilidad()
  }

  function cerrar() {
    // `canal = null` antes de removeChannel: así el CLOSED que emite al
    // terminar ya no es «vigente» y no reactiva el respaldo.
    const anterior = canal
    canal = null
    if (anterior) supabase.removeChannel(anterior)
    if (esperaSuscripcion) {
      clearTimeout(esperaSuscripcion)
      esperaSuscripcion = null
    }
    pararRespaldo()
    dejarDeEscucharVisibilidad()
  }

  onUnmounted(cerrar)

  return { estadoCanal, suscribir, cerrar }
}

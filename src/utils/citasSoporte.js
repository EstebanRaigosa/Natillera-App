/**
 * Citas del chat de soporte: lo que se guarda del mensaje citado y cómo se
 * resume en una línea.
 */
import { esImagen, esVideo } from './adjuntosSoporte'

/**
 * Copia mínima del mensaje que se cita. Va al mensaje provisional y a la cola de
 * reintentos, que se guarda en localStorage: nada de firmas ni copias locales.
 */
export function crearCita(mensaje) {
  if (!mensaje?.id) return null
  return {
    id: mensaje.id,
    autor: mensaje.autor,
    cuerpo: mensaje.cuerpo ?? '',
    soporte_adjuntos: (mensaje.soporte_adjuntos ?? []).map((a) => ({ mime: a.mime })),
  }
}

/** Un mensaje solo se puede citar cuando ya existe en el servidor. */
export function sePuedeCitar(mensaje) {
  return !!mensaje?.id && !mensaje._local && !String(mensaje.id).startsWith('local-')
}

/** «Tú» si lo escribió quien mira; si no, el otro lado de la conversación. */
export function autorCita(cita, ladoPropio) {
  if (!cita) return ''
  if (cita.autor === ladoPropio) return 'Tú'
  return cita.autor === 'soporte' ? 'Soporte' : 'Usuario'
}

/** El texto de la cita, o qué llevaba si era solo un adjunto. */
export function resumenCita(cita) {
  if (!cita) return ''
  const texto = (cita.cuerpo ?? '').replace(/\s+/g, ' ').trim()
  if (texto) return texto
  const mimes = (cita.soporte_adjuntos ?? []).map((a) => a.mime)
  if (mimes.some(esVideo)) return 'Vídeo'
  if (mimes.some(esImagen)) return 'Foto'
  if (mimes.length) return 'Archivo'
  return 'Mensaje'
}

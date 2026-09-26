import { supabase } from '../lib/supabase'

/*
 * Solicitudes de socios para usar la app (el socio abre el enlace de invitación y escribe
 * su celular). Las aprueba quien administra la natillera: la política de la tabla solo le
 * deja ver las de natilleras donde puede editar socios.
 *
 * Tras aprobar o rechazar se emite `natillerapp:solicitudes-vinculo` en window, para que
 * las vistas abiertas (Socios, el aviso global) se pongan al día sin recargar.
 */

export const EVENTO_SOLICITUDES = 'natillerapp:solicitudes-vinculo'

/** Llegó o cambió alguna solicitud (tiempo real): las vistas abiertas recargan su lista. */
export const EVENTO_SOLICITUDES_CAMBIO = 'natillerapp:solicitudes-vinculo-cambio'

const MS_RESPALDO = 60_000

/**
 * Escucha en tiempo real las solicitudes de vínculo (migración 051b). Realtime aplica la
 * política de lectura de la tabla, así que cada administrador solo recibe las de las
 * natilleras donde puede editar socios.
 *
 * Si el canal no se establece o se cae (red que bloquea WebSocket), se pasa a revisar cada
 * 60 s: la solicitud llega igual, solo que un poco después.
 *
 * @param {() => void} alCambiar
 * @returns {() => void} función para cerrar la suscripción
 */
export function suscribirSolicitudesVinculo(alCambiar) {
  let respaldo = null
  let conectado = false
  const iniciarRespaldo = () => {
    if (!respaldo) respaldo = setInterval(alCambiar, MS_RESPALDO)
  }
  const pararRespaldo = () => {
    if (respaldo) clearInterval(respaldo)
    respaldo = null
  }

  // Varias filas pueden cambiar a la vez (aprobar descarta las demás del socio): una sola recarga.
  let espera = null
  const avisar = () => {
    clearTimeout(espera)
    espera = setTimeout(alCambiar, 300)
  }

  const canal = supabase
    .channel(`solicitudes-vinculo:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitudes_vinculo' }, avisar)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'solicitudes_vinculo' }, avisar)
    .subscribe((estado) => {
      if (estado === 'SUBSCRIBED') {
        conectado = true
        pararRespaldo()
      } else if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT' || estado === 'CLOSED') {
        conectado = false
        iniciarRespaldo()
      }
    })
  // Si en 10 s no llegó el SUBSCRIBED, se asume que no va a llegar.
  const tiempoLimite = setTimeout(() => { if (!conectado) iniciarRespaldo() }, 10_000)

  return () => {
    clearTimeout(tiempoLimite)
    clearTimeout(espera)
    pararRespaldo()
    supabase.removeChannel(canal)
  }
}

/**
 * @param {{ natilleraId?: string, usuarioId?: string }} opciones
 *   `usuarioId`: el propio usuario, para excluir sus solicitudes como socio en otras natilleras.
 */
export async function cargarSolicitudesPendientes({ natilleraId, usuarioId } = {}) {
  let consulta = supabase
    .from('solicitudes_vinculo')
    .select('id, natillera_id, socio_id, usuario_id, cuenta_email, cuenta_nombre, cuenta_telefono, creado_en, natilleras(nombre), socios(nombre)')
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: true })
  if (natilleraId) consulta = consulta.eq('natillera_id', natilleraId)
  if (usuarioId) consulta = consulta.neq('usuario_id', usuarioId)
  const { data, error } = await consulta
  if (error) throw error
  return (data || []).map(s => ({
    ...s,
    natillera_nombre: s.natilleras?.nombre || 'Natillera',
    socio_nombre: s.socios?.nombre || 'Socio'
  }))
}

/**
 * @param {string|null} socioId — al aprobar, otro socio de la natillera al que vincular la
 *   cuenta (si el celular coincidió con el que no era). Sin él, el socio de la solicitud.
 * @returns {Promise<{ ok: boolean, motivo?: string, socioId?: string }>}
 */
export async function resolverSolicitudVinculo(solicitud, aprobar, socioId = null) {
  const { data, error } = await supabase.rpc('resolver_solicitud_vinculo', {
    p_solicitud_id: solicitud.id,
    p_aprobar: aprobar,
    p_socio_id: aprobar && socioId && socioId !== solicitud.socio_id ? socioId : null
  })
  if (error) throw error
  const ok = !!data?.ok || data?.motivo === 'ya_resuelta'
  const socioFinal = data?.socio_id || solicitud.socio_id
  if (ok && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENTO_SOLICITUDES, {
      detail: { solicitud: { ...solicitud, socio_id: socioFinal }, aprobada: aprobar && !!data?.ok }
    }))
  }
  return { ok, motivo: data?.motivo, socioId: socioFinal }
}

/**
 * Socios de una natillera para elegir a quién vincular una cuenta: [{ id, nombre, vinculado }].
 */
export async function cargarSociosParaVincular(natilleraId) {
  const { data, error } = await supabase
    .from('socios_natillera')
    .select('socio:socios(id, nombre, usuario_id)')
    .eq('natillera_id', natilleraId)
  if (error) throw error
  return (data || [])
    .filter(f => f.socio?.id)
    .map(f => ({ id: f.socio.id, nombre: f.socio.nombre || 'Socio', vinculado: !!f.socio.usuario_id }))
}

/** Cuentas de la app vinculadas a socios de la natillera, con nombre, correo y celular. */
export async function cargarCuentasVinculadas(natilleraId) {
  const { data, error } = await supabase.rpc('cuentas_vinculadas_natillera', { p_natillera_id: natilleraId })
  if (error) throw error
  return data || []
}

/** Pasa la cuenta vinculada de un socio a otro de la misma natillera. */
export async function cambiarVinculoSocio(socioOrigenId, socioDestinoId) {
  const { data, error } = await supabase.rpc('cambiar_vinculo_socio', {
    p_socio_origen: socioOrigenId,
    p_socio_destino: socioDestinoId
  })
  if (error) throw error
  return { ok: !!data?.ok, motivo: data?.motivo }
}

/** Textos y fechas compartidos entre Dashboard e invitaciones en sidebar */

export const DIAS_VALIDEZ_INVITACION_COLABORADOR = 7

export function formatearRolColaboradorInvitacion(rol) {
  const nombres = {
    co_administrador: 'Co-Admin',
    colaborador: 'Colaborador',
    visor: 'Visor'
  }
  return nombres[rol] || rol
}

export function emailInvitadorDestacado(invitacion) {
  const email = (invitacion.invitado_por_email || '').trim()
  if (email) return email
  const nombre = (invitacion.invitado_por_nombre || '').trim()
  if (nombre) return nombre
  return 'un administrador'
}

export function diasRestantesInvitacionColaborador(invitacion) {
  if (!invitacion?.fecha_invitacion) return null
  const inicio = new Date(invitacion.fecha_invitacion)
  if (Number.isNaN(inicio.getTime())) return null
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + DIAS_VALIDEZ_INVITACION_COLABORADOR)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.ceil((fin.getTime() - hoy.getTime()) / 86400000)
}

export function textoExpiracionInvitacionColaborador(invitacion) {
  const d = diasRestantesInvitacionColaborador(invitacion)
  if (d === null) return 'Validez según política del grupo'
  if (d < 0) return 'Invitación vencida · contacta quien te invitó'
  if (d === 0) return 'La invitación expira hoy'
  return `La invitación expira en ${d} ${d === 1 ? 'día' : 'días'}`
}

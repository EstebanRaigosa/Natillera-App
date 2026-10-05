/*
 * Catálogo único de la auditoría: qué acciones y entidades existen, cómo se llaman en
 * pantalla y de qué color van. Lo usan Auditoría (filtros, tabla, detalle) y Tráfico (feed
 * en vivo), para que una misma acción no se llame distinto en cada sitio ni falte en un
 * filtro. Debe coincidir con los CHECK de la tabla `auditoria` (migración 062).
 *
 * Clases completas, sin interpolar, para que Tailwind las encuentre al compilar.
 */

export const TIPOS_ACCION = [
  { valor: 'LOGIN', etiqueta: 'Inicio de sesión', clase: 'bg-emerald-100 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300' },
  { valor: 'LOGOUT', etiqueta: 'Cierre de sesión', clase: 'bg-slate-200 oscuro:bg-slate-500/20 text-slate-700 oscuro:text-slate-300' },
  { valor: 'CREATE', etiqueta: 'Crear', clase: 'bg-green-100 oscuro:bg-green-500/15 text-green-800 oscuro:text-green-300' },
  { valor: 'UPDATE', etiqueta: 'Actualizar', clase: 'bg-blue-100 oscuro:bg-blue-500/15 text-blue-800 oscuro:text-blue-300' },
  { valor: 'DELETE', etiqueta: 'Eliminar', clase: 'bg-red-100 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300' },
  { valor: 'REGISTER', etiqueta: 'Registrar', clase: 'bg-indigo-100 oscuro:bg-indigo-500/15 text-indigo-800 oscuro:text-indigo-300' },
  { valor: 'GENERATE', etiqueta: 'Generar', clase: 'bg-purple-100 oscuro:bg-purple-500/15 text-purple-800 oscuro:text-purple-300' },
  { valor: 'SEND', etiqueta: 'Enviar', clase: 'bg-violet-100 oscuro:bg-violet-500/15 text-violet-800 oscuro:text-violet-300' },
  { valor: 'RESEND', etiqueta: 'Reenviar', clase: 'bg-violet-100 oscuro:bg-violet-500/15 text-violet-800 oscuro:text-violet-300' },
  { valor: 'DOWNLOAD', etiqueta: 'Descargar', clase: 'bg-teal-100 oscuro:bg-teal-500/15 text-teal-800 oscuro:text-teal-300' },
  { valor: 'CANCEL', etiqueta: 'Cancelar', clase: 'bg-yellow-100 oscuro:bg-yellow-500/15 text-yellow-800 oscuro:text-yellow-300' },
  { valor: 'APPROVE', etiqueta: 'Aprobar', clase: 'bg-emerald-100 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300' },
  { valor: 'REJECT', etiqueta: 'Rechazar', clase: 'bg-rose-100 oscuro:bg-rose-500/15 text-rose-800 oscuro:text-rose-300' }
]

export const ENTIDADES = [
  { valor: 'sesion', etiqueta: 'Sesión', clase: 'bg-emerald-100 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300' },
  { valor: 'natillera', etiqueta: 'Natillera', clase: 'bg-natillera-100 oscuro:bg-natillera-500/15 text-natillera-800 oscuro:text-natillera-300' },
  { valor: 'socio', etiqueta: 'Socio', clase: 'bg-blue-100 oscuro:bg-blue-500/15 text-blue-800 oscuro:text-blue-300' },
  { valor: 'socio_natillera', etiqueta: 'Socio en natillera', clase: 'bg-cyan-100 oscuro:bg-cyan-500/15 text-cyan-800 oscuro:text-cyan-300' },
  { valor: 'cuota', etiqueta: 'Cuota', clase: 'bg-green-100 oscuro:bg-green-500/15 text-green-800 oscuro:text-green-300' },
  { valor: 'pago', etiqueta: 'Pago', clase: 'bg-emerald-100 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300' },
  { valor: 'comprobante', etiqueta: 'Comprobante', clase: 'bg-purple-100 oscuro:bg-purple-500/15 text-purple-800 oscuro:text-purple-300' },
  { valor: 'prestamo', etiqueta: 'Préstamo', clase: 'bg-orange-100 oscuro:bg-orange-500/15 text-orange-800 oscuro:text-orange-300' },
  { valor: 'pago_prestamo', etiqueta: 'Pago de préstamo', clase: 'bg-amber-100 oscuro:bg-amber-500/15 text-amber-800 oscuro:text-amber-300' },
  { valor: 'actividad', etiqueta: 'Actividad', clase: 'bg-pink-100 oscuro:bg-pink-500/15 text-pink-800 oscuro:text-pink-300' },
  { valor: 'multa', etiqueta: 'Multa', clase: 'bg-red-100 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300' },
  { valor: 'movimientos_fondo', etiqueta: 'Movimiento de fondo', clase: 'bg-lime-100 oscuro:bg-lime-500/15 text-lime-800 oscuro:text-lime-300' },
  { valor: 'colaborador', etiqueta: 'Colaborador', clase: 'bg-sky-100 oscuro:bg-sky-500/15 text-sky-800 oscuro:text-sky-300' },
  { valor: 'configuracion', etiqueta: 'Configuración', clase: 'bg-superficie-hundida text-texto' }
]

const NEUTRO = 'bg-superficie-hundida text-texto-medio'
const porValor = (lista) => Object.fromEntries(lista.map(x => [x.valor, x]))
const ACCIONES = porValor(TIPOS_ACCION)
const ENTIDADES_POR_VALOR = porValor(ENTIDADES)

export function etiquetaAccion(valor) {
  return ACCIONES[valor]?.etiqueta || valor
}
export function claseAccion(valor) {
  return ACCIONES[valor]?.clase || NEUTRO
}
export function etiquetaEntidad(valor) {
  return ENTIDADES_POR_VALOR[valor]?.etiqueta || valor
}
export function claseEntidad(valor) {
  return ENTIDADES_POR_VALOR[valor]?.clase || NEUTRO
}

/**
 * Restauraciones de sesión que antes se guardaban como «inició sesión» (REGISTER /
 * configuracion, método `oauth_or_session_refresh`). No son inicios de sesión: se
 * muestran como lo que son, sin tocar el registro.
 */
export function esRestauracionSesion(registro) {
  return registro?.tipo_accion === 'REGISTER' &&
    registro?.entidad === 'configuracion' &&
    registro?.detalles?.metodo === 'oauth_or_session_refresh'
}

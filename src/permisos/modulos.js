/*
 * Permisos por opción de la natillera: Nada / Ver / Gestionar.
 *
 * Esta es la copia en el navegador de lo que decide la base de datos
 * (migrations/052_permisos_por_modulo.sql: nivel_de_permisos). La base de datos manda: la app
 * pregunta los niveles con `mis_niveles_natillera` y solo usa esta copia si la migración
 * aún no está aplicada, o para pintar la página de Administradores. Si cambias una, cambia
 * la otra.
 */

export const NIVELES = ['nada', 'ver', 'gestionar']
export const RANGO = { nada: 0, ver: 1, gestionar: 2 }

export const ETIQUETA_NIVEL = { nada: 'Nada', ver: 'Ver', gestionar: 'Gestionar' }

/** Opciones de la natillera, en el orden en que se muestran. */
export const MODULOS = [
  { clave: 'socios', nombre: 'Socios', detalle: 'Socios y socios en la app', niveles: NIVELES },
  { clave: 'cuotas', nombre: 'Cuotas', detalle: 'Cuotas, pagos y comprobantes', niveles: NIVELES },
  { clave: 'prestamos', nombre: 'Préstamos', detalle: 'Préstamos y abonos', niveles: NIVELES },
  { clave: 'actividades', nombre: 'Actividades', detalle: 'Actividades y rifas', niveles: NIVELES },
  { clave: 'caja', nombre: 'Caja', detalle: 'Pagos, conciliación y movimientos', niveles: NIVELES },
  { clave: 'configuracion', nombre: 'Configuración', detalle: 'Reglas de la natillera', niveles: NIVELES },
  { clave: 'administradores', nombre: 'Administradores', detalle: 'Equipo e invitaciones', niveles: NIVELES },
  { clave: 'notificar', nombre: 'Notificar', detalle: 'Enviar mensajes a los socios', niveles: ['nada', 'gestionar'] },
  { clave: 'cierre', nombre: 'Cierre', detalle: 'Cerrar la natillera', niveles: ['nada', 'gestionar'] }
]
export const CLAVES_MODULOS = MODULOS.map(m => m.clave)

// Lo que puede hacer un colaborador recién creado, hasta que se ajuste.
export const NIVELES_COLABORADOR_INICIAL = {
  socios: 'ver',
  cuotas: 'gestionar',
  prestamos: 'ver',
  actividades: 'ver',
  caja: 'ver',
  configuracion: 'nada',
  administradores: 'nada',
  notificar: 'gestionar',
  cierre: 'nada'
}

const esVerdad = v => v === true || v === 'true'

/** Nivel de un rol con sus permisos guardados en un módulo (misma lógica que la base de datos). */
export function nivelDePermisos(rol, permisos = {}, modulo) {
  const p = permisos || {}
  if (rol === 'co_administrador') return modulo === 'cierre' ? 'nada' : 'gestionar'
  if (rol === 'visor') return modulo === 'notificar' || modulo === 'cierre' ? 'nada' : 'ver'

  const guardado = p.modulos?.[modulo]
  if (NIVELES.includes(guardado)) {
    if ((modulo === 'notificar' || modulo === 'cierre') && guardado === 'ver') return 'nada'
    return guardado
  }

  // Guardado con el modelo viejo de banderas
  switch (modulo) {
    case 'socios': return esVerdad(p.editar_socios) ? 'gestionar' : 'ver'
    case 'cuotas': return esVerdad(p.gestionar_cuotas) ? 'gestionar' : 'ver'
    case 'prestamos': return esVerdad(p.gestionar_prestamos) ? 'gestionar' : 'ver'
    case 'actividades': return esVerdad(p.gestionar_actividades) ? 'gestionar' : 'ver'
    case 'caja': return esVerdad(p.gestionar_cuotas) ? 'gestionar' : 'ver'
    case 'notificar': return esVerdad(p.notificar) ? 'gestionar' : 'nada'
    case 'configuracion': return esVerdad(p.configurar) ? 'gestionar' : 'ver'
    case 'administradores': return esVerdad(p.invitar_colaboradores) ? 'ver' : 'nada'
    default: return 'nada'
  }
}

export function nivelesDePermisos(rol, permisos) {
  return Object.fromEntries(CLAVES_MODULOS.map(m => [m, nivelDePermisos(rol, permisos, m)]))
}

export const nivelesTodos = nivel => Object.fromEntries(CLAVES_MODULOS.map(m => [m, nivel]))

/*
 * Banderas viejas a partir de los niveles. Varias pantallas y el menú aún preguntan por
 * `permisos.notificar`, `permisos.cerrar_natillera`, etc.: así responden con el modelo nuevo.
 */
export function banderasDeNiveles(niveles) {
  const g = m => niveles?.[m] === 'gestionar'
  const v = m => RANGO[niveles?.[m]] >= 1
  return {
    ver: true,
    editar_socios: g('socios'),
    gestionar_cuotas: g('cuotas'),
    gestionar_prestamos: g('prestamos'),
    gestionar_actividades: g('actividades'),
    buscar_comprobante: v('cuotas'),
    configurar: g('configuracion'),
    ver_auditoria: g('configuracion'),
    invitar_colaboradores: g('administradores'),
    notificar: g('notificar'),
    cerrar_natillera: g('cierre')
  }
}

/** Lo que se guarda en natillera_colaboradores.permisos: niveles + banderas (compatibilidad). */
export function permisosParaGuardar(rol, niveles) {
  const efectivos = rol === 'colaborador' ? { ...NIVELES_COLABORADOR_INICIAL, ...niveles } : nivelesDePermisos(rol, {})
  return { ...banderasDeNiveles(efectivos), modulos: efectivos }
}

/** Qué módulo protege cada ruta de la natillera (router y menú). */
export const MODULO_DE_RUTA = {
  Socios: 'socios',
  SociosEnApp: 'socios',
  Cuotas: 'cuotas',
  Prestamos: 'prestamos',
  Actividades: 'actividades',
  PagosSocios: 'caja',
  ConciliacionCaja: 'caja',
  Movimientos: 'caja',
  CuadreCaja: 'caja',
  NatilleraConfiguracion: 'configuracion',
  AdministradoresNatillera: 'administradores',
  NotificarSocios: 'notificar',
  NatilleraCierre: 'cierre'
}

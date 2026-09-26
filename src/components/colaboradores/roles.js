/*
 * Cómo se muestran los roles de colaborador en la página de Administradores. Los permisos
 * de cada rol viven en el store (PERMISOS_POR_ROL); aquí solo nombres, textos y colores.
 */
export const ROLES = {
  co_administrador: {
    nombre: 'Co-administrador',
    corto: 'Co-admin',
    uno: 'Co-admin',
    varios: 'Co-admins',
    descripcion: 'Puede hacer todo, menos cerrar la natillera',
    badge: 'ds-badge--brand'
  },
  colaborador: {
    nombre: 'Colaborador',
    corto: 'Colaborador',
    uno: 'Colaborador',
    varios: 'Colaboradores',
    descripcion: 'Solo lo que tú elijas',
    badge: 'ds-badge--info'
  },
  visor: {
    nombre: 'Visor',
    corto: 'Visor',
    uno: 'Visor',
    varios: 'Visores',
    descripcion: 'Solo puede ver, sin hacer cambios',
    badge: 'ds-badge--muted'
  }
}

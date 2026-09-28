/*
 * Datos del responsable del tratamiento y versión vigente de los documentos legales.
 *
 * La Ley 1581 de 2012 y el Decreto 1377 de 2013 exigen que la política diga quién es el
 * responsable y cómo contactarlo. Se publica como Natillerapp, con sus canales de atención;
 * la página /privacidad los muestra tal cual.
 *
 * VERSION_LEGAL: al cambiar la política o los términos de forma sustancial, subirla. A cada
 * usuario se le vuelve a pedir la aceptación (tabla consentimientos_legales, migración 051).
 */
export const RESPONSABLE = {
  nombre: 'Natillerapp',
  domicilio: 'Colombia',
  // El mismo buzón de soporte que ya usa la app: recibe consultas y reclamos de datos.
  correo: 'soporte@natillerapp.com',
  sitio: 'https://natillerapp.com'
}

export const VERSION_LEGAL = '2026-09-25'
export const VIGENTE_DESDE = '25 de septiembre de 2026'

// Casilla marcada al registrarse: se guarda aquí hasta que haya sesión para dejar constancia.
export const CLAVE_CONSENTIMIENTO_REGISTRO = 'natillerapp_consentimiento_registro'

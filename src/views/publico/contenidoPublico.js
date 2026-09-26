/*
 * Textos de las páginas públicas. Viven aquí, y no en la plantilla, porque los usan dos
 * sitios: la portada (Landing.vue) y el pre-render del build, que con las preguntas
 * frecuentes arma los datos estructurados FAQPage para Google. Una sola fuente evita que
 * lo que se ve y lo que lee el buscador digan cosas distintas.
 *
 * Todo lo que se afirma aquí existe en la app. No inventar funciones ni cifras.
 */

export const URL_SITIO = 'https://natillerapp.com'

export const FUNCIONES = [
  {
    clave: 'cuotas',
    titulo: 'Cuotas y multas al día',
    texto: 'Registra cada pago en segundos, en efectivo o por transferencia. La app calcula la multa por mora según tus reglas y te dice quién está atrasado.'
  },
  {
    clave: 'prestamos',
    titulo: 'Préstamos entre socios',
    texto: 'Presta con interés simple o compuesto, con plan de pagos por cuotas. Ves el saldo, lo que va en intereses y el interés de mora de cada préstamo.'
  },
  {
    clave: 'actividades',
    titulo: 'Rifas y actividades',
    texto: 'Organiza rifas, bingos, ventas y eventos. Lleva quién pagó y cuánto dejó cada actividad para el fondo.'
  },
  {
    clave: 'caja',
    titulo: 'Caja que cuadra',
    texto: 'Cada peso que entra o sale queda en el libro de caja, separado en efectivo y transferencia, con cortes de conciliación para saber si la plata cuadra.'
  },
  {
    clave: 'cierre',
    titulo: 'Cierre y reparto',
    texto: 'Al final del ciclo calcula cuánto le toca a cada socio: ahorro más utilidades, reparto equitativo o proporcional y gastos de administración.'
  },
  {
    clave: 'whatsapp',
    titulo: 'Comprobantes por WhatsApp',
    texto: 'Envía a cada socio su comprobante de pago o su estado de cuenta como imagen, directo a WhatsApp.'
  }
]

export const PASOS = [
  { titulo: 'Crea tu natillera', texto: 'Ponle nombre, define la cuota, la periodicidad y las reglas de multas.' },
  { titulo: 'Agrega a los socios', texto: 'Con su nombre y teléfono. Si alguien te ayuda a administrar, invítalo como colaborador.' },
  { titulo: 'Registra y comparte', texto: 'Anota cuotas, préstamos y actividades, y manda los comprobantes por WhatsApp.' }
]

/* Soporte: lo que de verdad hace el chat de la app (componentes de src/components/soporte). */
export const SOPORTE = [
  { clave: 'chat', titulo: 'Escríbenos sin salir de la app', texto: 'Toca el botón de ayuda desde cualquier pantalla y cuéntanos qué pasa. No pierdes lo que estabas haciendo.' },
  { clave: 'adjuntos', titulo: 'Muéstranos el problema', texto: 'Adjunta hasta 5 archivos por mensaje: fotos, capturas de pantalla, PDF o texto.' },
  { clave: 'aviso', titulo: 'Te avisamos cuando respondemos', texto: 'Activa las notificaciones y te llega un aviso con la respuesta, aunque tengas la app cerrada.' }
]

export const PREGUNTAS = [
  {
    pregunta: '¿Qué es una natillera?',
    respuesta: 'Es un grupo de ahorro colectivo: varias personas aportan una cuota fija cada semana, quincena o mes durante el año. Con ese fondo se hacen préstamos entre los socios y actividades como rifas, y al final se reparte el ahorro con las ganancias. Es una tradición muy común en Colombia.'
  },
  {
    pregunta: '¿Natillerapp es gratis?',
    respuesta: 'Sí. Puedes crear tu cuenta y administrar tu natillera sin pagar nada.'
  },
  {
    pregunta: '¿Funciona en el celular?',
    respuesta: 'Sí. Funciona en el navegador del celular y de la computadora, y se puede instalar en la pantalla de inicio de Android y de iPhone para abrirla como una app.'
  },
  {
    pregunta: '¿Puedo administrar varias natilleras?',
    respuesta: 'Sí. Con una sola cuenta puedes crear o administrar todas las natilleras que quieras y pasar de una a otra.'
  },
  {
    pregunta: '¿Cómo se calculan las multas y los intereses?',
    respuesta: 'Tú defines las reglas en la configuración de la natillera: el tipo de sanción por mora, los días de gracia, el interés de los préstamos y el interés de mora. La app los aplica sola a cada cuota y a cada préstamo.'
  },
  {
    pregunta: '¿Qué pasa al final de la natillera?',
    respuesta: 'Haces el cierre: la app calcula cuánto recibe cada socio con su ahorro y su parte de las utilidades, descuenta lo que deba y te da los comprobantes y el Excel para liquidar.'
  },
  {
    pregunta: '¿Otras personas pueden ayudarme a administrar?',
    respuesta: 'Sí. Puedes invitar colaboradores y decidir qué puede hacer cada uno: registrar pagos, manejar préstamos, configurar o solo consultar.'
  },
  {
    pregunta: '¿Hay soporte si tengo dudas o un problema?',
    respuesta: 'Sí. Dentro de la app tienes un chat de soporte: escribes desde cualquier pantalla, puedes adjuntar fotos o capturas y te avisamos cuando te respondemos. No tiene costo.'
  },
  {
    pregunta: '¿Quién puede ver la información de mi natillera?',
    respuesta: 'Solo tú y los colaboradores que invites. Cada natillera es privada de quien la administra.'
  }
]

/** Datos estructurados FAQPage (schema.org) a partir de PREGUNTAS. */
export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PREGUNTAS.map(p => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta }
    }))
  }
}

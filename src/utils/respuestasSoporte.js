/**
 * Respuestas predefinidas del soporte: se invocan escribiendo `/comando` en el
 * redactor del panel de soporte (solo allí; el usuario no las ve ni las usa).
 *
 * Existen para que todas las respuestas suenen igual, las escriba quien las
 * escriba. El tono de Natillerapp:
 *   - de tú, cercano y amable, sin sonar a robot ni a formulario;
 *   - claro y corto: una idea por mensaje, sin tecnicismos;
 *   - siempre con un siguiente paso para el usuario (qué hacer o qué esperar);
 *   - emojis con medida: uno, si suma calidez; ninguno en malas noticias.
 *
 * Cada comando tiene varias variantes para que el mismo usuario no reciba
 * siempre el mismo texto calcado.
 *
 * Marcadores: `{nombre}` es el primer nombre del usuario. Si no se conoce, se
 * quita junto con la coma o el espacio que lo acompaña (ver `rellenarRespuesta`),
 * así que cada variante debe leerse bien también sin él.
 */
export const RESPUESTAS_SOPORTE = [
  {
    comando: 'saludo',
    titulo: 'Saludo',
    descripcion: 'Primer mensaje al tomar la conversación',
    variantes: [
      '¡Hola, {nombre}! 👋 Gracias por escribirnos. Soy del equipo de soporte de Natillerapp y ya estoy revisando tu mensaje.',
      '¡Hola, {nombre}! Qué gusto saludarte. Te habla el equipo de Natillerapp. Cuéntame con calma y te ayudo a resolverlo.',
      '¡Buen día, {nombre}! Gracias por contactarnos. Ya tengo tu caso y lo reviso contigo enseguida.',
    ],
  },
  {
    comando: 'revisando',
    titulo: 'Revisando',
    descripcion: 'Pedir un momento mientras se investiga',
    variantes: [
      'Dame un momento, {nombre}, estoy revisando tu cuenta para darte una respuesta precisa.',
      'Ya lo estoy mirando. Me tomo unos minutos para verificarlo bien y te escribo por aquí mismo.',
      'Gracias por la paciencia, {nombre}. Estoy validando la información y en breve te confirmo.',
    ],
  },
  {
    comando: 'datos',
    titulo: 'Pedir más datos',
    descripcion: 'Falta información para ayudar',
    variantes: [
      'Para ayudarte mejor, {nombre}, ¿me cuentas en qué pantalla estabas y qué intentabas hacer cuando pasó?',
      'Necesito un par de datos más: ¿el nombre de la natillera y, si aplica, el socio o la cuota con el problema?',
      '¿Me ayudas con un poco más de detalle? Qué hiciste justo antes y qué mensaje te apareció. Así lo encuentro más rápido.',
    ],
  },
  {
    comando: 'captura',
    titulo: 'Pedir captura',
    descripcion: 'Solicitar una captura de pantalla',
    variantes: [
      '¿Me puedes enviar una captura de pantalla de lo que ves, {nombre}? Puedes adjuntarla con el clip 📎 aquí en el chat.',
      'Una captura me ayudaría mucho a entenderlo. Adjúntala con el clip 📎 que está junto al campo de texto.',
      'Si puedes, envíame una foto o captura de la pantalla donde aparece el problema. Con eso lo reviso de una vez.',
    ],
  },
  {
    comando: 'solucionado',
    titulo: 'Solucionado',
    descripcion: 'Se corrigió el problema',
    variantes: [
      '¡Listo, {nombre}! Ya quedó solucionado. ¿Puedes revisar y confirmarme que ahora te funciona bien?',
      'Ya lo corregimos ✅. Actualiza la app (desliza hacia abajo o vuelve a abrirla) y cuéntame si todo está en orden.',
      'Todo quedó resuelto, {nombre}. Si ves algo raro al revisarlo, escríbeme por aquí y lo miramos de nuevo.',
    ],
  },
  {
    comando: 'escalado',
    titulo: 'Pasado al equipo técnico',
    descripcion: 'Requiere revisión técnica',
    variantes: [
      'Gracias por reportarlo, {nombre}. Lo pasé a nuestro equipo técnico para revisarlo a fondo y te aviso por aquí apenas tengamos novedades.',
      'Esto necesita una revisión técnica. Ya quedó registrado con prioridad y te escribiré en este mismo chat cuando esté solucionado.',
      'Ya escalé tu caso al equipo técnico. No tienes que hacer nada más por ahora; te mantengo al tanto de cada avance.',
    ],
  },
  {
    comando: 'seguimiento',
    titulo: 'Seguimiento',
    descripcion: 'Preguntar si quedó resuelto',
    variantes: [
      'Hola de nuevo, {nombre}. Quería saber si pudiste revisar lo que hablamos y si todo quedó funcionando bien.',
      '¿Cómo te fue con la solución? Si todavía tienes el problema, cuéntame y seguimos.',
      'Paso a confirmar, {nombre}: ¿ya quedó resuelto tu caso o necesitas algo más de nuestra parte?',
    ],
  },
  {
    comando: 'demora',
    titulo: 'Disculpa por demora',
    descripcion: 'Se tardó en responder',
    variantes: [
      'Mil disculpas por la demora, {nombre}. Ya estoy contigo y reviso tu caso ahora mismo.',
      'Perdona que no te respondiera antes. Gracias por esperar; ya lo estoy atendiendo.',
      'Lamento la espera, {nombre}. Tu mensaje ya está en mis manos y te respondo lo antes posible.',
    ],
  },
  {
    comando: 'contrasena',
    titulo: 'Recuperar contraseña',
    descripcion: 'Pasos para restablecer la contraseña',
    variantes: [
      'Para recuperar tu contraseña, {nombre}: en la pantalla de inicio toca «¿Olvidaste tu contraseña?», escribe tu correo y sigue el enlace que te llega. Revisa también la carpeta de spam.',
      'Puedes restablecerla tú mismo: en «Iniciar sesión» elige «¿Olvidaste tu contraseña?» y te enviaremos un enlace a tu correo. Si no llega en unos minutos, mira en spam o correo no deseado.',
      'Te cuento cómo cambiarla: toca «¿Olvidaste tu contraseña?» al iniciar sesión, ingresa tu correo y abre el enlace que te enviamos. Si ingresas con Google, no necesitas contraseña: usa el botón «Continuar con Google».',
    ],
  },
  {
    comando: 'gracias',
    titulo: 'Agradecimiento',
    descripcion: 'Agradecer la paciencia o el reporte',
    variantes: [
      '¡Gracias a ti, {nombre}! Reportes como el tuyo nos ayudan a mejorar Natillerapp para todos.',
      'Gracias por tu paciencia y por contarnos. Es un gusto ayudarte.',
      'Muchas gracias, {nombre}. Tu comentario ya quedó registrado y lo tenemos en cuenta.',
    ],
  },
  {
    comando: 'despedida',
    titulo: 'Despedida',
    descripcion: 'Cerrar la conversación',
    variantes: [
      'Fue un gusto ayudarte, {nombre}. Si necesitas algo más, escríbenos cuando quieras. ¡Que te vaya muy bien con tu natillera! 🐷',
      'Quedamos atentos por aquí. ¡Que tengas un excelente día, {nombre}!',
      'Cierro la conversación por ahora. Si vuelve a pasar o tienes otra duda, abre una nueva y con gusto te ayudamos. ¡Saludos!',
    ],
  },
]

/** Primer nombre, con mayúscula inicial: «maría josé» → «María». */
export function primerNombre(nombreCompleto) {
  const primero = (nombreCompleto || '').trim().split(/\s+/)[0] || ''
  if (!primero) return ''
  return primero.charAt(0).toLocaleUpperCase('es-CO') + primero.slice(1).toLocaleLowerCase('es-CO')
}

/**
 * Sustituye los marcadores. Sin nombre, «Hola, {nombre}!» queda «Hola!» y
 * «Gracias, {nombre}.» queda «Gracias.»: se quita el marcador con la coma o el
 * espacio que lo precede.
 */
export function rellenarRespuesta(texto, { nombre = '' } = {}) {
  if (nombre) return texto.replaceAll('{nombre}', nombre)
  return texto
    .replace(/,?\s*\{nombre\}/g, '')
    .replace(/\s+([,.!?])/g, '$1')
}

/** Comandos cuyo nombre o título empiezan por lo escrito tras la barra. */
export function filtrarComandos(consulta) {
  const q = normalizar(consulta)
  if (!q) return RESPUESTAS_SOPORTE
  return RESPUESTAS_SOPORTE.filter((r) =>
    normalizar(r.comando).startsWith(q) || normalizar(r.titulo).includes(q))
}

function normalizar(texto) {
  return (texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

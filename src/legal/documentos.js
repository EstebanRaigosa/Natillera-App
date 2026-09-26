import { RESPONSABLE as R, VERSION_LEGAL, VIGENTE_DESDE } from './responsable'

/*
 * Texto de la Política de Tratamiento de Datos y de los Términos y condiciones.
 *
 * Escrito en lenguaje claro, pero con todo lo que pide el art. 13 del Decreto 1377 de 2013
 * para una política (responsable, finalidades, derechos, procedimiento, área que atiende,
 * vigencia). Lo que la app hace de verdad —qué datos, qué proveedores, dónde están los
 * servidores— tiene que coincidir con esto: si cambia el código, cambia el texto y se sube
 * VERSION_LEGAL.
 *
 * Formato: cada sección es { id, titulo, bloques }, y cada bloque un párrafo (texto) o una
 * lista ({ lista: [...] }). Sin HTML: la página lo pinta como texto, sin riesgo de inyección.
 */

export const POLITICA_DATOS = {
  titulo: 'Política de Tratamiento de Datos Personales',
  version: VERSION_LEGAL,
  vigenteDesde: VIGENTE_DESDE,
  intro:
    'Natillerapp es una aplicación para llevar las cuentas de una natillera: socios, cuotas, préstamos, actividades y cierre. ' +
    'Aquí te contamos qué datos tratamos, para qué, con quién los compartimos y cómo ejercer tus derechos, según la Ley 1581 de 2012, ' +
    'el Decreto 1377 de 2013 (incorporado en el Decreto 1074 de 2015) y demás normas colombianas sobre protección de datos personales.',
  secciones: [
    {
      id: 'responsable',
      titulo: 'Quién es el responsable',
      bloques: [
        { lista: [
          `Nombre: ${R.nombre}`,
          `Identificación: ${R.identificacion}`,
          `Domicilio: ${R.domicilio}`,
          `Dirección: ${R.direccion}`,
          `Correo: ${R.correo}`,
          `Teléfono: ${R.telefono}`
        ] }
      ]
    },
    {
      id: 'papeles',
      titulo: 'Dos papeles distintos',
      bloques: [
        'Tus datos como usuario de la app (tu cuenta): Natillerapp es el responsable.',
        'Los datos de los socios de una natillera los registra el administrador de esa natillera. Él es el responsable frente a sus socios, ' +
          'y Natillerapp los guarda y procesa por encargo suyo (encargado del tratamiento). Por eso el administrador declara que tiene la ' +
          'autorización de sus socios para registrarlos y debe atender sus solicitudes. Si un socio nos escribe directamente, también lo atendemos ' +
          'y le avisamos al administrador cuando haga falta.'
      ]
    },
    {
      id: 'datos',
      titulo: 'Qué datos tratamos',
      bloques: [
        { lista: [
          'De tu cuenta: nombre, correo, celular y foto o avatar. Tu contraseña se guarda cifrada: nadie puede verla. Si entras con Google, recibimos tu nombre, correo y foto.',
          'De los socios de una natillera: nombre, número de documento, celular o WhatsApp, correo (opcional), valor y periodicidad de la cuota, ' +
            'y el historial de la natillera: cuotas, pagos, sanciones, préstamos, rifas y actividades, retiros y comprobantes.',
          'De uso: fecha y hora de acceso, tipo de dispositivo y navegador, el registro de cambios hechos en cada natillera y la suscripción a notificaciones.',
          'De soporte: los mensajes y archivos que nos envías por el chat de ayuda.'
        ] },
        'No pedimos datos sensibles (salud, origen étnico, creencias, orientación sexual, biometría, etc.). Los datos financieros de la natillera no son ' +
          'datos sensibles según la ley, pero los tratamos con reserva: solo los ve quien tiene permiso.'
      ]
    },
    {
      id: 'finalidades',
      titulo: 'Para qué los usamos',
      bloques: [
        { lista: [
          'Crear y administrar tu cuenta y dejarte iniciar sesión.',
          'Llevar las cuentas de la natillera: cuotas, pagos, préstamos, sanciones, actividades, caja y cierre.',
          'Mostrarle a cada socio su estado de cuenta, cuando su cuenta está vinculada.',
          'Vincular la cuenta de un socio con su registro en la natillera usando su número de celular, siempre con aprobación del administrador.',
          'Generar comprobantes y mensajes para que el administrador los comparta, por ejemplo por WhatsApp.',
          'Enviarte notificaciones de la app y códigos de verificación.',
          'Atender soporte, cuidar la seguridad, prevenir fraudes y abusos, y llevar el registro de cambios (auditoría).',
          'Mejorar la app con estadísticas de uso.'
        ] },
        'No vendemos ni alquilamos datos. No los usamos para publicidad de terceros.'
      ]
    },
    {
      id: 'compartir',
      titulo: 'Con quién los compartimos',
      bloques: [
        { lista: [
          'Dentro de la natillera: el administrador y los colaboradores que él autorice ven los datos de los socios. Cada socio vinculado ve solo lo suyo y, si el administrador lo permite, algunos datos generales del grupo.',
          'Proveedores tecnológicos que trabajan por encargo nuestro: Supabase (base de datos e inicio de sesión), Netlify (alojamiento de la app), ' +
            'Google (inicio de sesión con Google), Twilio (códigos por SMS), los servicios de notificaciones del navegador (Google, Apple, Mozilla) ' +
            'y DiceBear (dibujos de avatar; solo recibe un texto al azar, no tus datos).',
          'Autoridades, cuando una ley u orden judicial lo exija.'
        ] }
      ]
    },
    {
      id: 'internacional',
      titulo: 'Datos fuera de Colombia',
      bloques: [
        'La base de datos está en servidores de Supabase en Estados Unidos, y otros proveedores de la lista anterior también operan fuera de Colombia. ' +
          'Al aceptar esta política autorizas que tus datos se transmitan y guarden allí, solo para las finalidades de arriba. Elegimos proveedores ' +
          'con medidas de seguridad reconocidas y que se comprometen a no usar los datos para fines propios.'
      ]
    },
    {
      id: 'seguridad',
      titulo: 'Cómo los protegemos',
      bloques: [
        { lista: [
          'Conexión cifrada (HTTPS) en todo momento.',
          'Contraseñas cifradas.',
          'Control de acceso en la base de datos: cada persona solo puede leer lo que le corresponde en cada natillera.',
          'Registro de los cambios importantes (quién hizo qué y cuándo).',
          'Límite de intentos al vincular una cuenta, para que nadie pueda adivinar números de otros.'
        ] },
        'Ningún sistema es infalible. Si ocurre un incidente que afecte tus datos, te avisaremos y lo informaremos a la Superintendencia de Industria y Comercio, como manda la ley.'
      ]
    },
    {
      id: 'derechos',
      titulo: 'Tus derechos',
      bloques: [
        { lista: [
          'Conocer, actualizar y corregir tus datos.',
          'Pedir prueba de la autorización que nos diste.',
          'Saber cómo hemos usado tus datos.',
          'Revocar la autorización y pedir que borremos tus datos, cuando no haya un deber legal o contractual de conservarlos.',
          'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC), después de hacer tu consulta o reclamo con nosotros.',
          'Acceder gratis a tus datos.'
        ] },
        'Si pides borrar datos que hacen parte de las cuentas de una natillera (por ejemplo, pagos que afectan a los demás socios), puede que deban ' +
          'conservarse mientras la natillera exista. Si es así, te lo explicaremos y los dejaremos solo para ese fin.'
      ]
    },
    {
      id: 'procedimiento',
      titulo: 'Cómo ejercerlos',
      bloques: [
        `Escríbenos a ${R.correo} o por el chat de ayuda de la app. Incluye tu nombre, tu número de documento, qué pides y cómo contactarte. ` +
          `Quien atiende estas solicitudes es ${R.nombre}.`,
        { lista: [
          'Consultas (saber qué datos tenemos o cómo los usamos): respondemos en máximo 10 días hábiles. Si no alcanzamos, te avisamos y respondemos en los 5 días hábiles siguientes.',
          'Reclamos (corregir, actualizar, borrar o revocar): respondemos en máximo 15 días hábiles, prorrogables 8 días hábiles más avisándote el motivo. ' +
            'Si falta información, te la pedimos dentro de los 5 días siguientes; si pasan 2 meses sin respuesta, entenderemos que desististe.'
        ] }
      ]
    },
    {
      id: 'menores',
      titulo: 'Menores de edad',
      bloques: [
        'La app no está pensada para menores de 18 años. Si una natillera incluye a un menor como socio, su padre, madre o representante legal debe ' +
          'autorizar el registro, y el administrador es quien debe obtener esa autorización.'
      ]
    },
    {
      id: 'dispositivo',
      titulo: 'Lo que se guarda en tu celular o computador',
      bloques: [
        'La app guarda en tu navegador datos técnicos para funcionar: tu sesión, tus preferencias y la última natillera que abriste. ' +
          'No usamos cookies de publicidad ni de rastreo de terceros.'
      ]
    },
    {
      id: 'conservacion',
      titulo: 'Cuánto tiempo los guardamos',
      bloques: [
        'Mientras tengas tu cuenta o mientras la natillera exista, y luego el tiempo que exijan las normas aplicables. Después los borramos o los ' +
          'dejamos anónimos. Nuestras bases de datos estarán vigentes mientras Natillerapp esté en funcionamiento.'
      ]
    },
    {
      id: 'cambios',
      titulo: 'Cambios a esta política',
      bloques: [
        'Si cambiamos algo importante, te avisaremos en la app y te pediremos aceptar de nuevo antes de seguir.',
        `Vigente desde el ${VIGENTE_DESDE}. Versión ${VERSION_LEGAL}.`
      ]
    }
  ]
}

export const TERMINOS = {
  titulo: 'Términos y condiciones',
  version: VERSION_LEGAL,
  vigenteDesde: VIGENTE_DESDE,
  intro: 'Estas son las reglas para usar Natillerapp. Al crear tu cuenta o usar la app las aceptas, junto con la Política de Tratamiento de Datos.',
  secciones: [
    {
      id: 'que-es',
      titulo: 'Qué es Natillerapp',
      bloques: [
        'Es una herramienta para llevar el registro de una natillera: socios, cuotas, préstamos, actividades y cierre.',
        'Natillerapp no es un banco ni una entidad financiera. No recibe, guarda ni mueve dinero, y no capta recursos del público. ' +
          'El dinero lo manejan directamente los miembros de cada natillera; la app solo registra lo que ellos le cuentan.'
      ]
    },
    {
      id: 'cuenta',
      titulo: 'Tu cuenta',
      bloques: [
        { lista: [
          'Debes ser mayor de edad y dar datos verdaderos.',
          'Cuida tu contraseña: lo que se haga con tu cuenta es tu responsabilidad.',
          'Si crees que alguien entró a tu cuenta, cámbiala y escríbenos.'
        ] }
      ]
    },
    {
      id: 'administrador',
      titulo: 'Si administras una natillera',
      bloques: [
        { lista: [
          'Eres responsable de las cifras y los datos que registras.',
          'Debes tener la autorización de cada socio para registrar sus datos (nombre, documento, celular, correo y movimientos) y usarlos solo para la natillera.',
          'Debes atender las solicitudes de tus socios sobre sus datos; nosotros te ayudamos.',
          'Los colaboradores que invites actúan bajo tu responsabilidad y con los permisos que les des.',
          'Las reglas de la natillera (cuotas, intereses, sanciones, repartos) las define el grupo. La app las calcula según lo que configures: revisa los resultados.'
        ] }
      ]
    },
    {
      id: 'socio',
      titulo: 'Si eres socio',
      bloques: [
        'Ves tu información en modo de solo lectura. Si algo no cuadra, habla con el administrador de tu natillera: él es quien registra los datos.'
      ]
    },
    {
      id: 'uso',
      titulo: 'Uso permitido',
      bloques: [
        { lista: [
          'No uses la app para actividades ilegales, como captar dinero del público sin autorización o lavar activos.',
          'No intentes ver datos de otras personas o natilleras sin permiso.',
          'No intentes dañar, saturar o copiar el servicio.'
        ] }
      ]
    },
    {
      id: 'servicio',
      titulo: 'El servicio',
      bloques: [
        'Hoy la app es gratuita. Puede tener fallas o interrupciones, y podemos cambiar o quitar funciones. Te recomendamos descargar tus comprobantes y ' +
          'estados de cuenta cuando los necesites.',
        'La app se ofrece tal como está. En lo que permita la ley, no respondemos por decisiones tomadas con cifras mal registradas ni por ' +
          'desacuerdos o pérdidas entre los miembros de una natillera.'
      ]
    },
    {
      id: 'propiedad',
      titulo: 'Propiedad intelectual',
      bloques: [
        'La app, su diseño y su código pertenecen a Natillerapp. Los datos que registras son tuyos o de tu natillera.'
      ]
    },
    {
      id: 'terminacion',
      titulo: 'Dejar de usar la app',
      bloques: [
        `Puedes dejar de usarla cuando quieras y pedir que eliminemos tu cuenta escribiendo a ${R.correo}. ` +
          'Podemos suspender cuentas que incumplan estos términos.'
      ]
    },
    {
      id: 'cambios-terminos',
      titulo: 'Cambios y ley aplicable',
      bloques: [
        'Si cambiamos algo importante, te avisaremos en la app. Estos términos se rigen por las leyes de Colombia.',
        `Vigentes desde el ${VIGENTE_DESDE}. Versión ${VERSION_LEGAL}. Contacto: ${R.correo}.`
      ]
    }
  ]
}

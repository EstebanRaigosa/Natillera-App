import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * Store del chat de soporte (Especificaciones/chat-soporte/especificacion.md).
 *
 * Dos ideas sostienen todo lo demás:
 *
 *  · Toda escritura pasa por la función `soporte_enviar_mensaje` de Postgres.
 *    El cliente no inserta filas: no puede saltarse la idempotencia, el límite
 *    de frecuencia ni la asignación de autor.
 *
 *  · Un mensaje escrito no se pierde nunca (RF-04). Se pinta en el hilo antes
 *    de que la red conteste, lleva un `client_id` generado aquí, y si el envío
 *    falla queda en una cola de localStorage que se reintenta al recuperar
 *    conexión. Un reintento con el mismo `client_id` no duplica nada.
 */

const CLAVE_COLA = 'natillerapp-soporte-cola'
const VIDA_COLA_MS = 24 * 60 * 60 * 1000 // 24 h (RF-04)
const MENSAJES_POR_PAGINA = 30           // RNF-04
const CONVERSACIONES_POR_PAGINA = 25     // RNF-08

export const MAX_ADJUNTOS = 5
export const MAX_BYTES_ADJUNTO = 5 * 1024 * 1024
export const MIMES_ADMITIDOS = [
  'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'application/pdf', 'text/plain',
]
export const CATEGORIAS = [
  { valor: 'error', etiqueta: 'Algo no funciona' },
  { valor: 'duda', etiqueta: 'Tengo una duda' },
  { valor: 'sugerencia', etiqueta: 'Sugerencia' },
  { valor: 'cuenta', etiqueta: 'Mi cuenta' },
  { valor: 'otro', etiqueta: 'Otro' },
]
/**
 * Cada estado se distingue por etiqueta textual y por color, nunca solo por
 * color (§7.4):
 *   `clase` — pastilla de estado
 *   `barra` — franja lateral de la fila en la lista
 *   `tinte` — fondo de la cabecera del hilo
 */
export const ESTADOS = {
  abierta: {
    etiqueta: 'Abierta',
    clase: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    barra: 'bg-emerald-400',
    tinte: 'bg-white',
  },
  en_proceso: {
    etiqueta: 'En proceso',
    clase: 'bg-amber-50 text-amber-800 border-amber-200',
    barra: 'bg-amber-400',
    tinte: 'bg-amber-50/70',
  },
  resuelta: {
    etiqueta: 'Resuelta',
    clase: 'bg-sky-50 text-sky-800 border-sky-200',
    barra: 'bg-sky-400',
    tinte: 'bg-sky-50/80',
  },
  archivada: {
    etiqueta: 'Archivada',
    clase: 'bg-gray-100 text-gray-600 border-gray-200',
    barra: 'bg-gray-300',
    tinte: 'bg-gray-100/80',
  },
}

/** Estados en los que la conversación ya no está viva para el usuario. */
export const ESTADOS_CERRADOS = ['resuelta', 'archivada']

/*
 * Código visible de la conversación.
 *
 * El correlativo de la base (1, 2, 3…) es lo correcto por dentro, pero enseñarlo
 * cuenta cuántas conversaciones existen: «#3» dice que el sistema se estrenó
 * ayer, y «#1» dice que eres el primero que escribe.
 *
 * La transformación es biyectiva, no aleatoria: multiplicar por un impar módulo
 * una potencia de dos no produce colisiones jamás, así que dos conversaciones
 * distintas no pueden compartir código y no hace falta guardarlo ni comprobar
 * nada al crearlo.
 *
 * El alfabeto es el de Crockford (sin I, L, O ni U): no hay forma de confundir
 * un 1 con una I ni un 0 con una O al leerlo por teléfono o copiarlo a mano.
 */
const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'  // 32 símbolos
const BITS = 10                                      // por mitad
const MASCARA = (1 << BITS) - 1
const RONDAS = 4
const ESPACIO = 1 << (BITS * 2)                      // 1.048.576 códigos

/**
 * Función de ronda. No necesita ser criptográfica: en una red de Feistel, sea
 * cual sea F el resultado es invertible. Solo tiene que mezclar bien.
 */
function rondaFeistel(x, ronda) {
  let h = (x + ronda * 0x9E37 + 0x7F4A) & 0xFFFF
  h = ((h ^ (h >> 7)) * 0x2545) & 0xFFFF
  h = ((h ^ (h >> 5)) * 0x1B87) & 0xFFFF
  return (h ^ (h >> 6)) & MASCARA
}

export function codigoConversacion(numero) {
  const n = Number(numero)
  if (!Number.isFinite(n) || n <= 0) return '—'

  // Red de Feistel de 4 rondas sobre 20 bits. Una simple multiplicación modular
  // también sería biyectiva, pero deja rastro: los códigos de conversaciones
  // consecutivas comparten casi todos los caracteres y se les ve el orden.
  let izquierda = (n >> BITS) & MASCARA
  let derecha = n & MASCARA
  for (let r = 0; r < RONDAS; r++) {
    const siguiente = izquierda ^ rondaFeistel(derecha, r)
    izquierda = derecha
    derecha = siguiente
  }

  let mezclado = ((izquierda << BITS) | derecha) >>> 0
  let codigo = ''
  for (let i = 0; i < 4; i++) {
    codigo = ALFABETO[mezclado % 32] + codigo
    mezclado = Math.floor(mezclado / 32)
  }
  return `NT-${codigo}`
}

/**
 * Acuses de recibo que se muestran mientras el soporte todavía no ha
 * contestado. NO son mensajes: no se guardan, no notifican y no cuentan como
 * respuesta en la bandeja. En la interfaz aparecen marcados como automáticos, y
 * eso no es un detalle estético: un texto que se hiciera pasar por una persona
 * dejaría al usuario esperando una conversación que no ha empezado.
 */
export const ACUSES_RECIBO = [
  'Recibido. Ya lo estamos mirando y te contamos por aquí mismo.',
  'Tu mensaje llegó completo. Ahora nos toca a nosotros.',
  'Anotado. Puedes cerrar la app: te avisamos en cuanto tengamos respuesta.',
  'Gracias por contarnos. No se nos pierde, está en la fila.',
  'Listo, lo tenemos. Te escribimos aquí apenas lo revisemos.',
  'Mensaje guardado. Vamos a echarle un ojo con calma.',
  'Ya está con nosotros. Te respondemos en cuanto lo tengamos claro.',
  'Recibimos lo que nos cuentas. Danos un momento y te decimos algo.',
  'Perfecto, queda registrado. Seguimos nosotros desde aquí.',
  'Lo tenemos delante. Te avisamos por aquí sin que tengas que estar pendiente.',
  'Gracias por el detalle: así es más fácil ayudarte. Ya lo miramos.',
  'Tu mensaje entró bien. Te contestamos por este mismo hilo.',
  'Recibido y a salvo. Te escribimos apenas tengamos algo que contarte.',
  'Ya quedó registrado. No hace falta que lo repitas, lo estamos viendo.',
  'Hecho, nos llegó. Te respondemos aquí mismo en cuanto podamos.',
]

/**
 * Elige el acuse a partir del identificador de la conversación, no al azar: si
 * fuese aleatorio cambiaría en cada repintado y el usuario vería un texto
 * distinto cada vez que abre el hilo, que es justo lo que delata a un mensaje
 * falso. Con el id, cada conversación tiene el suyo y no hay que guardarlo.
 */
export function acuseParaConversacion(id) {
  if (!id) return ACUSES_RECIBO[0]
  let suma = 0
  for (let i = 0; i < id.length; i++) suma = (suma + id.charCodeAt(i)) % 9973
  return ACUSES_RECIBO[suma % ACUSES_RECIBO.length]
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Fallback para navegadores sin randomUUID (Safari < 15.4 y contextos no seguros).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Traduce el error que llega de Postgres a algo que se pueda leer en pantalla.
 * Las funciones SQL prefijan sus excepciones con SOPORTE_<CAUSA> justamente
 * para poder distinguirlas aquí sin depender del texto.
 */
export function traducirError(e) {
  const bruto = e?.message || String(e || '')
  const conocido = bruto.match(/SOPORTE_([A-Z_]+):\s*(.*)/)
  if (conocido) return { codigo: conocido[1], mensaje: conocido[2].trim() }

  if (/Failed to fetch|NetworkError|network|offline/i.test(bruto)) {
    return { codigo: 'RED', mensaje: 'No hay conexión. El mensaje queda guardado y se reintenta solo.' }
  }
  return { codigo: 'DESCONOCIDO', mensaje: bruto || 'No se pudo completar la operación' }
}

function leerCola() {
  try {
    const crudo = localStorage.getItem(CLAVE_COLA)
    if (!crudo) return []
    const items = JSON.parse(crudo)
    if (!Array.isArray(items)) return []
    // Se descarta lo que lleve más de 24 h esperando (RF-04).
    return items.filter((i) => Date.now() - (i.creadoEn ?? 0) < VIDA_COLA_MS)
  } catch {
    return []
  }
}

function escribirCola(items) {
  try {
    localStorage.setItem(CLAVE_COLA, JSON.stringify(items))
  } catch {
    // Modo privado o almacenamiento lleno: la cola es una comodidad, no puede
    // impedir que la app funcione.
  }
}

export const useSoporteStore = defineStore('soporte', () => {
  // ---- Estado -------------------------------------------------------------
  const conversaciones = ref([])        // vista del usuario
  const bandeja = ref([])               // vista del soporte
  const totalBandeja = ref(0)
  const mensajes = ref({})              // { [conversacionId]: Mensaje[] }
  const hayMasAntiguos = ref({})        // { [conversacionId]: boolean }
  const cola = ref(leerCola())          // envíos pendientes de reintento
  const noLeidos = ref(0)
  const cargando = ref(false)
  const cargandoMensajes = ref(false)
  const error = ref(null)
  const esSoporte = ref(false)
  const rolResuelto = ref(false)
  // Usuario al que corresponde el rol ya resuelto (ver comprobarRol).
  let uidDelRol = null

  const pendientes = computed(() => cola.value.length)

  // ---- Rol ----------------------------------------------------------------

  /**
   * Pregunta al servidor, no al perfil cacheado: la autoridad del soporte se
   * decide en la base de datos (§6.4) y el cliente solo la refleja.
   *
   * La respuesta se cachea ATADA AL USUARIO de la sesión, no a secas. Cachear
   * un `false` sin más es una trampa: si la llamada ocurre antes de que la
   * sesión esté hidratada, o si el rol cambia en la base con la app abierta, el
   * negativo se queda pegado hasta recargar la página y el soporte desaparece
   * del menú sin motivo aparente.
   */
  async function comprobarRol({ forzar = false } = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    const uid = session?.user?.id ?? null

    // Sin sesión no hay nada que resolver, y sobre todo no hay nada que cachear.
    if (!uid) {
      esSoporte.value = false
      rolResuelto.value = false
      uidDelRol = null
      return false
    }

    if (!forzar && rolResuelto.value && uidDelRol === uid) return esSoporte.value

    try {
      const { data, error: e } = await supabase.rpc('es_super_admin')
      if (e) throw e
      esSoporte.value = Boolean(data)
      rolResuelto.value = true
      uidDelRol = uid
    } catch {
      // Un fallo de red no debe congelar la respuesta: se reintenta la próxima vez.
      esSoporte.value = false
      rolResuelto.value = false
      uidDelRol = null
    }
    return esSoporte.value
  }

  // ---- Lectura ------------------------------------------------------------

  async function cargarConversaciones() {
    cargando.value = true
    error.value = null
    try {
      const { data, error: e } = await supabase
        .from('soporte_conversaciones_usuario')
        .select('*')
        .order('ultimo_mensaje_at', { ascending: false })
      if (e) throw e
      conversaciones.value = data ?? []
    } catch (e) {
      error.value = traducirError(e).mensaje
    } finally {
      cargando.value = false
    }
  }

  /**
   * Bandeja del soporte (RF-06). El archivado de RN-07 se hace aquí, al vuelo:
   * es la decisión P-2 de la especificación, y evita depender de pg_cron.
   */
  async function cargarBandeja({ estado = 'todas', categoria = 'todas', busqueda = '', pagina = 0 } = {}) {
    cargando.value = true
    error.value = null
    try {
      // RN-07, archivado al vuelo. Va aparte y sin romper nada: si falla —por
      // ejemplo, porque quien mira no es superadministrador— la bandeja tiene
      // que cargarse igual.
      //
      // Ojo con el patrón: `supabase.rpc()` devuelve un PostgrestFilterBuilder,
      // que es *thenable* pero NO una Promise, así que no tiene `.catch()`.
      // Encadenarlo revienta con «catch is not a function».
      try {
        await supabase.rpc('soporte_archivar_vencidas')
      } catch {
        // Fallo de red: no es motivo para dejar al soporte sin bandeja.
      }

      let consulta = supabase
        .from('soporte_resumen_bandeja')
        .select('*', { count: 'exact' })
        .order('ultimo_mensaje_at', { ascending: false })

      if (estado === 'sin_responder') consulta = consulta.eq('ultimo_autor', 'usuario')
      else if (estado !== 'todas') consulta = consulta.eq('estado', estado)

      if (categoria !== 'todas') consulta = consulta.eq('categoria', categoria)

      const termino = busqueda.trim()
      if (termino) {
        const escapado = termino.replace(/[%,()]/g, ' ')
        consulta = consulta.or(`asunto.ilike.%${escapado}%,user_email.ilike.%${escapado}%`)
      }

      const desde = pagina * CONVERSACIONES_POR_PAGINA
      const { data, error: e, count } = await consulta.range(desde, desde + CONVERSACIONES_POR_PAGINA - 1)
      if (e) throw e

      bandeja.value = data ?? []
      totalBandeja.value = count ?? 0
    } catch (e) {
      error.value = traducirError(e).mensaje
    } finally {
      cargando.value = false
    }
  }

  /**
   * Hilo de una conversación. Trae los 30 más recientes y luego pagina hacia
   * atrás; nunca descarga la conversación entera (RNF-04).
   */
  async function cargarMensajes(conversacionId, { masAntiguos = false } = {}) {
    cargandoMensajes.value = true
    try {
      let consulta = supabase
        .from('soporte_mensajes')
        .select('id, conversacion_id, client_id, autor, cuerpo, created_at, soporte_adjuntos(id, ruta, nombre, mime, bytes)')
        .eq('conversacion_id', conversacionId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })          // desempate estable (caso borde 6)
        .limit(MENSAJES_POR_PAGINA)

      if (masAntiguos) {
        const yaCargados = mensajes.value[conversacionId] ?? []
        const masViejo = yaCargados.find((m) => !m._local)
        if (masViejo) consulta = consulta.lt('created_at', masViejo.created_at)
      }

      const { data, error: e } = await consulta
      if (e) throw e

      const traidos = (data ?? []).slice().reverse().map((m) => ({ ...m, _estado: 'enviado' }))
      hayMasAntiguos.value[conversacionId] = (data ?? []).length === MENSAJES_POR_PAGINA

      const previos = mensajes.value[conversacionId] ?? []
      mensajes.value = {
        ...mensajes.value,
        [conversacionId]: masAntiguos
          ? [...traidos, ...previos.filter((p) => !traidos.some((t) => t.id === p.id))]
          : fusionar(traidos, previos.filter((p) => p._local)),
      }
    } catch (e) {
      error.value = traducirError(e).mensaje
    } finally {
      cargandoMensajes.value = false
    }
  }

  /** Los mensajes locales pendientes se mantienen al final, en su orden. */
  function fusionar(delServidor, locales) {
    const clientIds = new Set(delServidor.map((m) => m.client_id))
    return [...delServidor, ...locales.filter((l) => !clientIds.has(l.client_id))]
  }

  /*
   * Escucha permanente para la insignia.
   *
   * Es un canal aparte del que usa la pantalla del chat, y tiene que serlo: la
   * insignia debe moverse estés donde estés —en Cuotas, en Préstamos, en el
   * dashboard—, no solo con el soporte abierto. Sin esto, el contador solo se
   * actualizaba al montar el layout o al volver a la pestaña, así que un mensaje
   * nuevo no se veía hasta abrir el chat.
   *
   * RLS decide qué inserciones llegan: al usuario las de sus conversaciones, al
   * soporte todas.
   */
  let canalInsignia = null
  let refrescoPendiente = null

  function escucharInsignia() {
    if (canalInsignia) return

    canalInsignia = supabase
      .channel('soporte:insignia')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'soporte_mensajes' },
        () => {
          // Agrupado: varios mensajes seguidos no disparan varias consultas.
          if (refrescoPendiente) clearTimeout(refrescoPendiente)
          refrescoPendiente = setTimeout(() => {
            refrescoPendiente = null
            refrescarNoLeidos()
          }, 300)
        },
      )
      .subscribe()
  }

  function dejarDeEscucharInsignia() {
    if (refrescoPendiente) {
      clearTimeout(refrescoPendiente)
      refrescoPendiente = null
    }
    if (canalInsignia) {
      supabase.removeChannel(canalInsignia)
      canalInsignia = null
    }
  }

  async function refrescarNoLeidos() {
    try {
      const { data, error: e } = await supabase.rpc('soporte_no_leidos')
      if (e) throw e
      noLeidos.value = Number(data) || 0
    } catch {
      // Un contador que no carga no debe romper la pantalla.
    }
  }

  async function marcarLeido(conversacionId) {
    try {
      await supabase.rpc('soporte_marcar_leido', { p_conversacion_id: conversacionId })
      const conv = conversaciones.value.find((c) => c.id === conversacionId)
      if (conv) conv.sin_leer_usuario = 0
      const enBandeja = bandeja.value.find((c) => c.id === conversacionId)
      if (enBandeja) enBandeja.sin_leer_soporte = 0
      await refrescarNoLeidos()
    } catch {
      // Marcar leído es una comodidad: si falla, se reintenta al reabrir.
    }
  }

  // ---- Adjuntos -----------------------------------------------------------

  /**
   * Sube los archivos ANTES de crear el mensaje (RF-05): así nunca existe un
   * mensaje que apunte a un archivo inexistente. La ruta empieza por el uid
   * porque es lo único que ya se conoce en este punto y lo que comprueba la
   * política del bucket.
   */
  async function subirAdjuntos(archivos, clientId) {
    if (!archivos?.length) return []
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('SOPORTE_SIN_SESION: sesión no válida')

    const subidos = []
    for (const archivo of archivos) {
      const problema = validarArchivo(archivo)
      if (problema) throw new Error(`SOPORTE_DATOS: ${problema}`)

      const limpio = archivo.name.replace(/[^\w.\-]+/g, '_').slice(-80)
      const ruta = `${user.id}/${clientId}/${uuid().slice(0, 8)}-${limpio}`

      const { error: e } = await supabase.storage
        .from('soporte-adjuntos')
        .upload(ruta, archivo, { contentType: archivo.type, upsert: false })
      if (e) throw e

      subidos.push({ ruta, nombre: archivo.name, mime: archivo.type, bytes: archivo.size })
    }
    return subidos
  }

  function validarArchivo(archivo) {
    if (!MIMES_ADMITIDOS.includes(archivo.type)) return `«${archivo.name}» no es un tipo de archivo admitido`
    if (archivo.size > MAX_BYTES_ADJUNTO) return `«${archivo.name}» supera los 5 MB`
    return null
  }

  /** RF-17: nunca getPublicUrl(). Una URL pública es permanente y no se revoca. */
  async function urlFirmada(ruta) {
    const { data, error: e } = await supabase.storage
      .from('soporte-adjuntos')
      .createSignedUrl(ruta, 15 * 60)
    if (e) throw e
    return data.signedUrl
  }

  // ---- Escritura ----------------------------------------------------------

  /**
   * Envía un mensaje (o abre una conversación si `conversacionId` es null).
   * Devuelve { ok, conversacionId, clientId, error }.
   */
  async function enviar({ conversacionId = null, cuerpo, asunto = null, categoria = null, archivos = [], clientId = null }) {
    const idCliente = clientId ?? uuid()
    const provisional = {
      id: `local-${idCliente}`,
      conversacion_id: conversacionId,
      client_id: idCliente,
      autor: esSoporte.value && conversacionId ? 'soporte' : 'usuario',
      cuerpo,
      created_at: new Date().toISOString(),
      soporte_adjuntos: [],
      _local: true,
      _estado: 'enviando',
    }

    if (conversacionId) agregarMensajeLocal(conversacionId, provisional)

    try {
      const adjuntos = await subirAdjuntos(archivos, idCliente)

      const { data, error: e } = await supabase.rpc('soporte_enviar_mensaje', {
        p_conversacion_id: conversacionId,
        p_client_id: idCliente,
        p_cuerpo: cuerpo,
        p_asunto: asunto,
        p_categoria: categoria,
        p_adjuntos: adjuntos,
      })
      if (e) throw e

      quitarDeCola(idCliente)

      const idReal = data.conversacion_id
      const confirmado = {
        ...data.mensaje,
        conversacion_id: idReal,
        soporte_adjuntos: adjuntos.map((a, i) => ({ id: `adj-${i}`, ...a })),
        _estado: 'enviado',
      }

      // Reconciliación por client_id: el mensaje provisional se sustituye, no
      // se añade otro (RF-09).
      const previos = (mensajes.value[idReal] ?? []).filter((m) => m.client_id !== idCliente)
      mensajes.value = { ...mensajes.value, [idReal]: [...previos, confirmado] }

      return { ok: true, conversacionId: idReal, clientId: idCliente, numero: data.numero }
    } catch (e) {
      const { codigo, mensaje } = traducirError(e)

      // Un límite de frecuencia o un dato inválido no se arreglan reintentando:
      // el texto se devuelve al redactor con el motivo, sin encolarlo.
      const recuperable = codigo === 'RED' || codigo === 'DESCONOCIDO'
      if (recuperable) {
        encolar({ clientId: idCliente, conversacionId, cuerpo, asunto, categoria, creadoEn: Date.now() })
      }
      marcarEstadoLocal(conversacionId, idCliente, recuperable ? 'fallido' : null)

      return { ok: false, clientId: idCliente, codigo, error: mensaje, encolado: recuperable }
    }
  }

  function agregarMensajeLocal(conversacionId, mensaje) {
    const previos = mensajes.value[conversacionId] ?? []
    mensajes.value = { ...mensajes.value, [conversacionId]: [...previos, mensaje] }
  }

  function marcarEstadoLocal(conversacionId, clientId, estado) {
    if (!conversacionId) return
    const lista = mensajes.value[conversacionId]
    if (!lista) return
    mensajes.value = {
      ...mensajes.value,
      [conversacionId]: estado === null
        ? lista.filter((m) => m.client_id !== clientId)
        : lista.map((m) => (m.client_id === clientId ? { ...m, _estado: estado } : m)),
    }
  }

  // ---- Cola de reintentos -------------------------------------------------

  function encolar(item) {
    const sinDuplicado = cola.value.filter((i) => i.clientId !== item.clientId)
    cola.value = [...sinDuplicado, item]
    escribirCola(cola.value)
  }

  function quitarDeCola(clientId) {
    cola.value = cola.value.filter((i) => i.clientId !== clientId)
    escribirCola(cola.value)
  }

  function cancelarEnvio(clientId) {
    const item = cola.value.find((i) => i.clientId === clientId)
    if (item?.conversacionId) marcarEstadoLocal(item.conversacionId, clientId, null)
    quitarDeCola(clientId)
  }

  /**
   * Reintenta los envíos en cola. Se llama al recuperar conexión y al abrir la
   * pantalla. Los adjuntos no se reintentan: los archivos no sobreviven a una
   * recarga, así que se reenvía solo el texto (caso borde 2).
   */
  async function procesarCola() {
    if (!cola.value.length) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return

    for (const item of [...cola.value]) {
      if (item.conversacionId) marcarEstadoLocal(item.conversacionId, item.clientId, 'enviando')
      await enviar({
        conversacionId: item.conversacionId,
        cuerpo: item.cuerpo,
        asunto: item.asunto,
        categoria: item.categoria,
        clientId: item.clientId,   // mismo client_id: el reintento no duplica
      })
    }
  }

  // ---- Panel del soporte --------------------------------------------------

  async function actualizarConversacion(conversacionId, { estado = null, notaInterna = null } = {}) {
    const { data, error: e } = await supabase.rpc('soporte_actualizar_conversacion', {
      p_conversacion_id: conversacionId,
      p_estado: estado,
      p_nota_interna: notaInterna,
    })
    if (e) throw new Error(traducirError(e).mensaje)

    const fila = bandeja.value.find((c) => c.id === conversacionId)
    if (fila && data?.estado) fila.estado = data.estado
    return data
  }

  async function leerNotaInterna(conversacionId) {
    const { data, error: e } = await supabase.rpc('soporte_nota_interna', { p_conversacion_id: conversacionId })
    if (e) throw new Error(traducirError(e).mensaje)
    return data ?? ''
  }

  async function eliminarConversacion(conversacionId) {
    const { data, error: e } = await supabase.rpc('soporte_eliminar_conversacion', { p_conversacion_id: conversacionId })
    if (e) throw new Error(traducirError(e).mensaje)

    // Storage no se gestiona por SQL: la función devuelve las rutas y se
    // vacía el bucket aquí (RF-19).
    const rutas = data?.rutas ?? []
    if (rutas.length) {
      try {
        await supabase.storage.from('soporte-adjuntos').remove(rutas)
      } catch {
        // La conversación ya está borrada; unos archivos huérfanos en el bucket
        // no justifican mostrar un error al usuario.
      }
    }

    bandeja.value = bandeja.value.filter((c) => c.id !== conversacionId)
    const { [conversacionId]: _fuera, ...resto } = mensajes.value
    mensajes.value = resto
  }

  // ---- Realtime -----------------------------------------------------------

  /**
   * Aplica por Realtime un cambio de la conversación (estado, último mensaje).
   * Llega con las columnas publicadas en la migración 023: nunca `nota_interna`.
   */
  function aplicarCambioConversacion(fila) {
    if (!fila?.id) return

    const mia = conversaciones.value.find((c) => c.id === fila.id)
    if (mia) {
      mia.estado = fila.estado
      mia.ultimo_mensaje_at = fila.ultimo_mensaje_at
      mia.asunto = fila.asunto
      mia.categoria = fila.categoria
    }

    const enBandeja = bandeja.value.find((c) => c.id === fila.id)
    if (enBandeja) {
      enBandeja.estado = fila.estado
      enBandeja.ultimo_mensaje_at = fila.ultimo_mensaje_at
    }
  }

  /** Inserta un mensaje llegado por Realtime, emparejando por client_id. */
  function recibirMensaje(mensaje) {
    const lista = mensajes.value[mensaje.conversacion_id] ?? []
    if (lista.some((m) => m.id === mensaje.id || m.client_id === mensaje.client_id)) {
      // Es el eco de un mensaje propio: se sustituye el provisional.
      mensajes.value = {
        ...mensajes.value,
        [mensaje.conversacion_id]: lista.map((m) =>
          m.client_id === mensaje.client_id ? { ...mensaje, soporte_adjuntos: m.soporte_adjuntos ?? [], _estado: 'enviado' } : m),
      }
      return false
    }
    mensajes.value = {
      ...mensajes.value,
      [mensaje.conversacion_id]: [...lista, { ...mensaje, soporte_adjuntos: [], _estado: 'enviado' }],
    }
    return true
  }

  return {
    // estado
    conversaciones, bandeja, totalBandeja, mensajes, hayMasAntiguos, cola, pendientes,
    noLeidos, cargando, cargandoMensajes, error, esSoporte,
    // lectura
    comprobarRol, cargarConversaciones, cargarBandeja, cargarMensajes, refrescarNoLeidos, marcarLeido,
    escucharInsignia, dejarDeEscucharInsignia,
    // adjuntos
    subirAdjuntos, validarArchivo, urlFirmada,
    // escritura
    enviar, procesarCola, cancelarEnvio,
    // panel
    actualizarConversacion, leerNotaInterna, eliminarConversacion,
    // realtime
    recibirMensaje, aplicarCambioConversacion,
    // constantes
    CONVERSACIONES_POR_PAGINA,
  }
})

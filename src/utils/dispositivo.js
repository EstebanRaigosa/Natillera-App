import { detectIosPlatform } from '../composables/useIsIos'
import { esModoStandalone } from '../composables/usePwaInstall'

/*
 * Describe un dispositivo en palabras que el superadministrador entienda de un vistazo:
 * «Android 14 · Chrome · App instalada» en vez de un user agent de 150 caracteres.
 *
 * Sirve para dos cosas: el cliente lo calcula al iniciar sesión y en cada ingreso (y lo
 * guarda), y los paneles lo recalculan desde el `user_agent` de registros antiguos, que
 * no lo traían. Lo único que no se puede sacar del user agent es si la app está
 * instalada: eso solo lo sabe el cliente en el momento, por eso viaja aparte.
 *
 * Límites conocidos, para no prometer de más:
 *  · iPadOS se presenta como Mac de escritorio; en vivo se corrige con
 *    `detectIosPlatform()`, en un registro antiguo no hay forma.
 *  · Chrome en Android reduce el user agent: siempre dice «Android 10; K», sea cual sea
 *    la versión y el modelo. Con la «K» no se muestra ni versión ni modelo (mejor nada que
 *    un dato falso); en vivo, `userAgentData` da los reales (ver `dispositivoActualDetallado`).
 *  · Safari en iOS 26 congela «iPhone OS 18_7» en el user agent; la versión real del
 *    sistema es la de `Version/26.x`.
 *  · En iOS todos los navegadores son WebKit; se distinguen por su marca (CriOS, FxiOS…).
 */

function versionDe(ua, regex) {
  const m = ua.match(regex)
  return m ? m[1].replace(/_/g, '.') : ''
}

/** Solo la versión mayor (y la menor en iOS, que es la que importa para la PWA). */
function recortarVersion(v, partes = 1) {
  if (!v) return ''
  return v.split('.').slice(0, partes).join('.')
}

function esUaReducido(ua) {
  return /Android[\d.\s]*;\s*K\)/i.test(ua)
}

/** Versión de iOS/iPadOS: la del sistema, salvo que esté congelada en 18_7 (iOS 26+). */
function versionIos(ua) {
  const delSistema = versionDe(ua, /OS\s([\d_]+)/)
  const deSafari = versionDe(ua, /Version\/([\d.]+)/)
  if (delSistema.startsWith('18.7') && Number(deSafari.split('.')[0]) >= 26) {
    return recortarVersion(deSafari, 1)
  }
  return recortarVersion(delSistema, 2)
}

function sistemaDe(ua, esIosEnVivo) {
  if (/Android/i.test(ua)) {
    const soVersion = esUaReducido(ua) ? '' : recortarVersion(versionDe(ua, /Android\s([\d.]+)/i))
    return { so: 'Android', soVersion }
  }
  if (/iPhone|iPod/.test(ua)) {
    return { so: 'iOS', soVersion: versionIos(ua), equipo: 'iPhone' }
  }
  if (/iPad/.test(ua) || (esIosEnVivo && /Macintosh/.test(ua))) {
    return { so: 'iPadOS', soVersion: versionIos(ua), equipo: 'iPad' }
  }
  if (/Windows/i.test(ua)) return { so: 'Windows', soVersion: '' }
  if (/CrOS/.test(ua)) return { so: 'ChromeOS', soVersion: '' }
  if (/Macintosh|Mac OS X/.test(ua)) return { so: 'macOS', soVersion: '' }
  if (/Linux/i.test(ua)) return { so: 'Linux', soVersion: '' }
  return { so: '', soVersion: '' }
}

function navegadorDe(ua) {
  // El orden importa: casi todos dicen «Chrome» y «Safari» además de su propio nombre.
  if (/SamsungBrowser\/([\d.]+)/.test(ua)) return 'Samsung Internet'
  if (/EdgA?\/|EdgiOS\//.test(ua)) return 'Edge'
  if (/OPR\/|OPiOS\//.test(ua)) return 'Opera'
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox'
  if (/CriOS\//.test(ua)) return 'Chrome'
  if (/; wv\)/.test(ua)) return 'WebView'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return ''
}

/** Modelo de Android cuando el user agent lo trae de verdad (no la «K» del UA reducido). */
function modeloDe(ua) {
  const m = ua.match(/Android[\d.\s]*;\s*([^;)]+?)(?:\sBuild\/[^;)]*)?\)/i)
  if (!m) return ''
  const modelo = m[1].trim()
  if (!modelo || modelo.length < 2 || /^(K|wv|Linux|U)$/i.test(modelo)) return ''
  return modelo
}

/**
 * @param {string} ua - user agent
 * @param {{ modoApp?: 'app' | 'navegador' | null, esIosEnVivo?: boolean, modelo?: string, soVersion?: string }} [opciones]
 *   `modelo` y `soVersion` pisan lo deducido del user agent (vienen de `userAgentData`).
 */
export function describirDispositivo(ua, opciones = {}) {
  const texto = String(ua || '')
  const sistema0 = sistemaDe(texto, !!opciones.esIosEnVivo)
  const { so, equipo } = sistema0
  const soVersion = opciones.soVersion || sistema0.soVersion
  const navegador = navegadorDe(texto)
  const modelo = equipo || opciones.modelo || modeloDe(texto)
  const esTablet = so === 'iPadOS' || (/Android/i.test(texto) && !/Mobile/i.test(texto))
  const esMovil = !esTablet && (so === 'Android' || so === 'iOS')
  const tipo = esTablet ? 'tablet' : esMovil ? 'movil' : so ? 'escritorio' : ''
  const modoApp = opciones.modoApp || null

  const sistema = [so, soVersion].filter(Boolean).join(' ')
  const partes = equipo ? [equipo, sistema] : [sistema || 'Dispositivo desconocido']
  if (modelo && !equipo) partes.push(modelo)
  if (modoApp === 'app') partes.push('App instalada')
  else if (navegador) partes.push(navegador)

  return {
    tipo,
    so,
    soVersion,
    navegador,
    modelo,
    modoApp,
    etiqueta: partes.join(' · ')
  }
}

/** El dispositivo desde el que se está usando la app ahora mismo. */
export function dispositivoActual() {
  if (typeof navigator === 'undefined') return describirDispositivo('')
  return describirDispositivo(navigator.userAgent, {
    modoApp: esModoStandalone() ? 'app' : 'navegador',
    esIosEnVivo: detectIosPlatform()
  })
}

/**
 * Como `dispositivoActual`, pero preguntando a Chromium por el modelo y la versión reales
 * (`userAgentData.getHighEntropyValues`), que el user agent reducido ya no trae. Es
 * asíncrono: úsese donde ya se espera algo (el latido, la auditoría en segundo plano),
 * nunca antes de una acción que necesite el gesto del usuario. Si tarda o falla, se
 * queda con lo que da el user agent.
 */
export async function dispositivoActualDetallado() {
  const base = { modoApp: esModoStandalone() ? 'app' : 'navegador', esIosEnVivo: detectIosPlatform() }
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const uad = typeof navigator !== 'undefined' ? navigator.userAgentData : null
  if (!uad?.getHighEntropyValues) return describirDispositivo(ua, base)
  try {
    const valores = await Promise.race([
      uad.getHighEntropyValues(['model', 'platformVersion']),
      new Promise((resolve) => setTimeout(() => resolve(null), 1500))
    ])
    if (!valores) return describirDispositivo(ua, base)
    const esAndroid = /Android/i.test(ua)
    return describirDispositivo(ua, {
      ...base,
      modelo: valores.model || '',
      // Solo en Android la versión de plataforma es la del sistema que conoce la gente.
      soVersion: esAndroid ? recortarVersion(valores.platformVersion || '') : ''
    })
  } catch {
    return describirDispositivo(ua, base)
  }
}

/** Nombre corto de la familia, para agrupar en gráficas: «Android», «iPhone», «Escritorio»… */
export function familiaDispositivo(d) {
  if (!d?.so) return 'Desconocido'
  if (d.so === 'iOS') return 'iPhone'
  if (d.so === 'iPadOS') return 'iPad'
  if (d.so === 'Android') return d.tipo === 'tablet' ? 'Tablet Android' : 'Android'
  return 'Escritorio'
}

/**
 * Dispositivo de un registro guardado (`accesos_usuario` o los `detalles` de la auditoría).
 * Los nuevos traen la etiqueta calculada en el momento; los antiguos solo el user agent,
 * y se describen ahora (sin saber si era la app instalada).
 */
export function dispositivoDeRegistro(fila) {
  if (!fila) return describirDispositivo('')
  const ua = fila.user_agent || ''
  const deducido = describirDispositivo(ua, { modoApp: fila.modo_app || null })
  if (fila.dispositivo) return { ...deducido, etiqueta: fila.dispositivo }
  return deducido
}

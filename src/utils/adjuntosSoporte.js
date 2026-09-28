/**
 * Adjuntos del chat de soporte: qué se puede previsualizar y cómo se prepara un
 * archivo antes de subirlo.
 *
 * La foto que sale de un móvil moderno pesa entre 3 y 8 MB y mide 4000 px de
 * ancho. Subirla tal cual por una red móvil son varios segundos en los que el
 * mensaje ya está escrito y el adjunto todavía viaja. Reducirla a 1600 px y
 * recodificarla deja el mismo archivo en unos cientos de kilobytes —suficiente
 * para leer una pantalla de la app, que es para lo que sirve— y el envío pasa a
 * ser inmediato.
 */

/** Tipos que se pintan como imagen dentro de la burbuja. */
export const MIMES_IMAGEN = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']

/** Formato de las fotos de iPhone: solo Safari lo pinta, así que se convierte. */
export function esHeic(mime) {
  return mime === 'image/heic' || mime === 'image/heif'
}

/** Tipos cuyo contenido se puede asomar en el propio hilo. */
export const MIMES_TEXTO = ['text/plain']

export function esImagen(mime) {
  return MIMES_IMAGEN.includes(mime)
}

export function esTexto(mime) {
  return MIMES_TEXTO.includes(mime)
}

export function esPdf(mime) {
  return mime === 'application/pdf'
}

export function formatearTamano(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Por debajo de este peso no compensa recodificar: el ahorro es pequeño y el
// trabajo de decodificar y volver a codificar tarda más que la propia subida.
const BYTES_MINIMOS_PARA_COMPRIMIR = 400 * 1024
const LADO_MAXIMO = 1600
const CALIDAD = 0.82

/** WebP en canvas: Safari lo admite desde la 14, pero no se da por hecho. */
let soportaWebp = null
function admiteWebp() {
  if (soportaWebp !== null) return soportaWebp
  try {
    const lienzo = document.createElement('canvas')
    lienzo.width = 1
    lienzo.height = 1
    soportaWebp = lienzo.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    soportaWebp = false
  }
  return soportaWebp
}

/**
 * Decodifica el archivo a algo que se pueda dibujar en un canvas.
 * `createImageBitmap` descomprime fuera del hilo principal, así que no congela
 * la interfaz; donde no exista (Safari antiguo) se cae al `<img>` de siempre.
 */
async function decodificar(archivo) {
  if (typeof createImageBitmap === 'function') {
    try {
      return { fuente: await createImageBitmap(archivo), liberar: (b) => b.close?.() }
    } catch {
      // HEIC y algunos PNG raros no los decodifica: se intenta con <img>.
    }
  }

  const url = URL.createObjectURL(archivo)
  try {
    const imagen = await new Promise((resolver, rechazar) => {
      const img = new Image()
      img.onload = () => resolver(img)
      img.onerror = () => rechazar(new Error('no se pudo decodificar'))
      img.src = url
    })
    return { fuente: imagen, liberar: () => URL.revokeObjectURL(url) }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}

/*
 * Tope para comprimir. Decodificar y recodificar una foto tarda como mucho un par de
 * segundos; si un navegador se queda colgado en ello (una foto rara, un `toBlob` que
 * nunca responde), pasado el tope se sube el original en vez de esperar para siempre.
 */
const TOPE_COMPRIMIR_MS = 15000

/**
 * Devuelve una versión ligera de la imagen, o el archivo original si comprimir
 * no aporta nada, no se puede o tarda demasiado.
 *
 * Nunca lanza: un adjunto que no se deja recodificar se sube tal cual. Perder
 * el mensaje por no poder encoger una foto sería mucho peor que subirla grande.
 */
export async function comprimirImagen(archivo) {
  let tope = null
  const vencido = new Promise(resolver => { tope = setTimeout(() => resolver(archivo), TOPE_COMPRIMIR_MS) })
  try {
    return await Promise.race([comprimirSinTope(archivo), vencido])
  } finally {
    clearTimeout(tope)
  }
}

async function comprimirSinTope(archivo) {
  if (!esImagen(archivo?.type)) return archivo
  if (typeof document === 'undefined') return archivo
  // HEIC se convierte siempre, pese poco o no: quien lo abra desde Chrome o
  // Android no lo vería. Para el resto, por debajo del umbral no compensa.
  const heic = esHeic(archivo.type)
  if (!heic && archivo.size < BYTES_MINIMOS_PARA_COMPRIMIR) return archivo

  // Safari no codifica WebP en canvas (`admiteWebp()` es false), así que allí
  // el destino es JPEG. Solo PNG (y GIF) se quedan como están sin WebP:
  // pasarlos a JPEG les quitaría la transparencia, y una captura con fondo
  // transparente saldría con manchas negras.
  const conTransparencia = archivo.type === 'image/png' || archivo.type === 'image/gif'
  const destino = admiteWebp() ? 'image/webp' : (conTransparencia ? null : 'image/jpeg')
  if (!destino) return archivo

  let recurso = null
  try {
    recurso = await decodificar(archivo)
    const { fuente } = recurso
    const anchoOriginal = fuente.width
    const altoOriginal = fuente.height
    if (!anchoOriginal || !altoOriginal) return archivo

    const escala = Math.min(1, LADO_MAXIMO / Math.max(anchoOriginal, altoOriginal))
    const ancho = Math.round(anchoOriginal * escala)
    const alto = Math.round(altoOriginal * escala)

    const lienzo = document.createElement('canvas')
    lienzo.width = ancho
    lienzo.height = alto
    const contexto = lienzo.getContext('2d')
    if (!contexto) return archivo
    contexto.drawImage(fuente, 0, 0, ancho, alto)

    const blob = await new Promise((resolver) => lienzo.toBlob(resolver, destino, CALIDAD))
    if (!blob) return archivo
    // Si el resultado no es más pequeño, el original ya estaba bien (salvo
    // HEIC, que se cambia aunque pese más: lo que importa es que se vea).
    if (!heic && blob.size >= archivo.size) return archivo

    const extension = destino === 'image/webp' ? 'webp' : 'jpg'
    const nombre = `${archivo.name.replace(/\.[^.]+$/, '')}.${extension}`
    return new File([blob], nombre, { type: destino, lastModified: Date.now() })
  } catch {
    // Incluye el HEIC que el navegador no sabe decodificar (Safari < 17,
    // Chrome): vuelve tal cual y quien llama decide qué decir.
    return archivo
  } finally {
    try {
      recurso?.liberar?.(recurso.fuente)
    } catch {
      // Liberar es higiene, no puede romper el envío.
    }
  }
}

/**
 * Miniatura local para ver el adjunto en el hilo desde el primer instante, sin
 * esperar a que termine la subida. Quien la crea es responsable de revocarla
 * con `URL.revokeObjectURL` (ver `revocarVistasPrevias`).
 */
export function crearVistaPrevia(archivo) {
  if (!esImagen(archivo?.type)) return null
  try {
    return URL.createObjectURL(archivo)
  } catch {
    return null
  }
}

export function revocarVistasPrevias(urls) {
  for (const url of urls ?? []) {
    try {
      if (url) URL.revokeObjectURL(url)
    } catch {
      // Ya revocada o entorno sin soporte: no hay nada que hacer.
    }
  }
}

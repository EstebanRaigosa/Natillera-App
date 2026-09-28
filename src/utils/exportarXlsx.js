import { detectIosPlatform } from '../composables/useIsIos'

const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// xlsx-js-style pesa ~600 KB: se carga bajo demanda y una sola vez para toda la app.
let modulo = null
let carga = null

/** Módulo ya cargado, o null. Síncrono a propósito: ver `guardarLibroXlsx`. */
export function xlsxListo() {
  return modulo
}

/** Carga (una sola vez) xlsx-js-style y devuelve el módulo. */
export function cargarXlsx() {
  if (modulo) return Promise.resolve(modulo)
  if (!carga) {
    carga = import('xlsx-js-style')
      .then(m => {
        modulo = m.default || m
        return modulo
      })
      .catch(e => {
        carga = null
        throw e
      })
  }
  return carga
}

/**
 * En iOS, compartir el archivo exige que `navigator.share` se llame dentro del gesto
 * del usuario; un `await import()` en medio del click lo pierde y Safari rechaza el
 * share. Por eso las vistas con exportación precargan el módulo al montarse, solo en
 * iOS (en el resto `writeFile` descarga sin depender del gesto y no hace falta pagar
 * los ~600 KB por adelantado).
 */
export function precargarXlsxEnIos() {
  if (!detectIosPlatform()) return
  cargarXlsx().catch(() => {})
}

/**
 * Guarda el libro. En iOS, `XLSX.writeFile` abre el archivo en una vista previa de la
 * que no se sale bien (y en la PWA instalada, a veces no hace nada): se ofrece la hoja
 * de compartir, que permite «Guardar en Archivos», AirDrop o WhatsApp. Si el sistema
 * no puede compartir archivos, o el gesto ya se perdió, queda `writeFile` de reserva.
 */
export function guardarLibroXlsx(XLSX, libro, nombreArchivo) {
  if (!detectIosPlatform() || typeof navigator.share !== 'function' || typeof File === 'undefined') {
    XLSX.writeFile(libro, nombreArchivo)
    return
  }
  const datos = XLSX.write(libro, { bookType: 'xlsx', type: 'array' })
  const archivo = new File([datos], nombreArchivo, { type: TIPO_XLSX })
  if (!navigator.canShare?.({ files: [archivo] })) {
    XLSX.writeFile(libro, nombreArchivo)
    return
  }
  navigator.share({ files: [archivo], title: nombreArchivo }).catch(e => {
    // Cancelar la hoja de compartir no es un error.
    if (e?.name === 'AbortError') return
    XLSX.writeFile(libro, nombreArchivo)
  })
}

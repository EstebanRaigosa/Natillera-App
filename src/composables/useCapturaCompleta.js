import { toPng } from 'html-to-image'

/*
 * Imagen de un modal COMPLETO, no solo de lo que se ve.
 *
 * Para soporte: la captura de pantalla del teléfono corta el modal donde empieza el
 * scroll. Aquí se clona la tarjeta fuera de pantalla, se despliega todo lo que tenía
 * scroll y se quitan los controles, y de ese clon sale la imagen. El modal de verdad no
 * se toca, así que no parpadea ni pierde su posición de scroll.
 *
 * Marcas en el HTML del modal:
 *   · `data-captura-expandir`: contenedores con scroll que deben mostrarse enteros.
 *   · `no-captura`: lo que no va en la imagen (botones, X, natiscroll, pie de acciones).
 */

/**
 * @param {HTMLElement} elemento - la tarjeta del modal
 * @returns {Promise<{ dataUrl: string, archivo: File }>}
 */
export async function capturarCompleto(elemento, nombreArchivo = 'captura.png') {
  if (!elemento) throw new Error('No hay nada que capturar')

  const clon = elemento.cloneNode(true)
  // Sin altura máxima ni recorte: la tarjeta crece hasta mostrarlo todo.
  Object.assign(clon.style, { maxHeight: 'none', height: 'auto', overflow: 'visible', transform: 'none', animation: 'none', margin: '0' })
  clon.querySelectorAll('[data-captura-expandir]').forEach(el => {
    Object.assign(el.style, { maxHeight: 'none', height: 'auto', overflow: 'visible', flex: 'none' })
    // Su contenedor también recorta (overflow-hidden + flex-1): se libera igual.
    if (el.parentElement) Object.assign(el.parentElement.style, { maxHeight: 'none', height: 'auto', overflow: 'visible', flex: 'none' })
  })
  clon.querySelectorAll('.no-captura').forEach(el => el.remove())

  // Mismo ancho que el modal visible, para que el texto rompa igual; fuera de pantalla.
  const caja = document.createElement('div')
  Object.assign(caja.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${elemento.offsetWidth}px`,
    pointerEvents: 'none',
    zIndex: '-1'
  })
  // La imagen se comparte: siempre en claro aunque la app esté en oscuro (skill modo oscuro, regla 6)
  // (equivale a data-tema="claro": en la caja y en el propio clon que se captura)
  caja.dataset.tema = 'claro'
  clon.dataset.tema = 'claro'
  caja.appendChild(clon)
  document.body.appendChild(caja)

  try {
    // Avatares y demás imágenes: que estén listas antes de dibujar.
    await Promise.all([...clon.querySelectorAll('img')].map(img => img.decode?.().catch(() => {})))
    const dataUrl = await toPng(clon, { pixelRatio: 2, backgroundColor: '#ffffff' })
    const blob = await (await fetch(dataUrl)).blob()
    return { dataUrl, archivo: new File([blob], nombreArchivo, { type: 'image/png' }) }
  } finally {
    caja.remove()
  }
}

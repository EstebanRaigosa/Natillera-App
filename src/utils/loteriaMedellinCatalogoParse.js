/**
 * Parseo del HTML de /historico-de-resultados/ (Lotería de Medellín, lottery_id 16).
 * Compartido por el cliente, el script de scrape y la Edge Function (misma lógica).
 */
const RE_SOURCE =
  /<option data-lottery_id="16" value="(\d+)"[^>]*>Sorteo\s*#\s*(\d+)\s*-\s*(.+?)\s*\((\d{4}-\d{2}-\d{2})\)<\/option>/g

/**
 * @param {string} html
 * @returns {Record<string, { drawId: string, sorteoNum: string, fechaTexto: string }>}
 */
export function parseCatalogoDesdeHistoricoHtml(html) {
  if (!html || typeof html !== 'string') return {}
  const catalogo = {}
  const re = new RegExp(RE_SOURCE.source, 'g')
  let m
  while ((m = re.exec(html)) !== null) {
    const [, drawId, sorteoNum, fechaTexto, fechaYmd] = m
    catalogo[fechaYmd] = { drawId, sorteoNum, fechaTexto }
  }
  return catalogo
}

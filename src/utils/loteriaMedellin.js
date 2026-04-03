/**
 * Consulta de premio mayor Lotería de Medellín (lottery_id 16) vía admin-ajax
 * y catálogo fecha → draw_id. Ver GUIA-IMPLEMENTACION.md en proyecto Loteria.
 */
import catalogoDefault from '../data/loteriaMedellinCatalogo.json'

export const LOTERIA_MEDELLIN_AJAX_URL =
  'https://loteriademedellin.com.co/wp-admin/admin-ajax.php'
export const LOTERIA_MEDELLIN_REFERER =
  'https://loteriademedellin.com.co/historico-de-resultados/'

/**
 * @param {string} html
 * @returns {{ numero: string, serie: string | null } | null}
 */
export function extraerPremioMayor(html) {
  if (!html || typeof html !== 'string') return null
  const texto = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const numeroMatch = texto.match(/N.mero\s+(\d{4})/)
  const serieMatch = texto.match(/Serie\s+(\d{3})/)
  if (!numeroMatch) return null
  return {
    numero: numeroMatch[1],
    serie: serieMatch ? serieMatch[1] : null,
  }
}

/**
 * Indica si la fecha es posterior al último sorteo listado en el catálogo
 * (sorteo aún no publicado o catálogo desactualizado).
 * @param {string} fecha - YYYY-MM-DD
 */
export function fechaEsPosteriorAlUltimoSorteoCatalogo(fecha, catalogo = catalogoDefault) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false
  const keys = Object.keys(catalogo).sort()
  if (keys.length === 0) return false
  return fecha > keys[keys.length - 1]
}

/**
 * @param {string} fecha - YYYY-MM-DD
 * @param {Record<string, { drawId: string, sorteoNum: string, fechaTexto: string }>} catalogo
 * @returns {null} si no hay entrada: catálogo vacío o la fecha es posterior al último sorteo del catálogo
 */
export function buscarSorteoPorFecha(fecha, catalogo = catalogoDefault) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null

  const keys = Object.keys(catalogo).sort()
  if (keys.length === 0) return null

  if (catalogo[fecha]) {
    return { ...catalogo[fecha], fechaResuelta: fecha, exacta: true }
  }

  const maxFecha = keys[keys.length - 1]
  if (fecha > maxFecha) {
    return null
  }

  const target = new Date(fecha + 'T12:00:00').getTime()
  let mejor = null
  let menorDiff = Infinity

  for (const [f, info] of Object.entries(catalogo)) {
    const diff = Math.abs(new Date(f + 'T12:00:00').getTime() - target)
    if (diff < menorDiff) {
      menorDiff = diff
      mejor = { fechaResuelta: f, ...info, exacta: false }
    }
  }

  return mejor
}

function getSupabaseLoteriaProxyUrl() {
  const base = import.meta.env.VITE_SUPABASE_URL || ''
  if (!base) return ''
  return `${base.replace(/\/$/, '')}/functions/v1/loteria-medellin`
}

async function fetchAdminAjaxHtml(drawId, ajaxUrl, signal) {
  const params = new URLSearchParams()
  params.append('action', 'wp_get_results_lottery_template')
  params.append('is_front', 'true')
  params.append('lottery_id', '16')
  params.append('draw_id', String(drawId))
  params.append('post_type', 'results_template')

  const res = await fetch(ajaxUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: LOTERIA_MEDELLIN_REFERER,
    },
    body: params.toString(),
    signal,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`)
  }
  if (data.html == null) throw new Error('Respuesta sin HTML del sorteo')
  return data.html
}

/**
 * HTML del resultado del sorteo (misma forma que responde WordPress).
 * Orden: proxy opcional → en dev, proxy Vite → Edge Supabase → POST directo (producción sin proxy puede fallar por CORS).
 * @param {string} drawId
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>}
 */
export async function consultarHtmlSorteo(drawId, signal) {
  const customProxy = import.meta.env.VITE_LOTERIA_MEDELLIN_PROXY_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (customProxy) {
    const headers = { 'Content-Type': 'application/json' }
    if (customProxy.includes('supabase.co') && anonKey) {
      headers.apikey = anonKey
      headers.Authorization = `Bearer ${anonKey}`
    }
    const res = await fetch(customProxy, {
      method: 'POST',
      headers,
      body: JSON.stringify({ draw_id: String(drawId) }),
      signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || data.message || `Proxy HTTP ${res.status}`)
    }
    if (data.html == null) throw new Error('Respuesta sin HTML del sorteo')
    return data.html
  }

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return fetchAdminAjaxHtml(drawId, '/api-loteria-medellin-ajax', signal)
  }

  const supabaseProxy = getSupabaseLoteriaProxyUrl()
  if (supabaseProxy) {
    const headers = { 'Content-Type': 'application/json' }
    if (supabaseProxy.includes('supabase.co') && anonKey) {
      headers.apikey = anonKey
      headers.Authorization = `Bearer ${anonKey}`
    }
    const res = await fetch(supabaseProxy, {
      method: 'POST',
      headers,
      body: JSON.stringify({ draw_id: String(drawId) }),
      signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || data.message || `Proxy HTTP ${res.status}`)
    }
    if (data.html == null) throw new Error('Respuesta sin HTML del sorteo')
    return data.html
  }

  return fetchAdminAjaxHtml(drawId, LOTERIA_MEDELLIN_AJAX_URL, signal)
}

/**
 * @param {string} numero4 - cuatro dígitos
 * @returns {string} dos últimas cifras "01".."99"
 */
export function ultimasDosCifras(numero4) {
  const s = String(numero4 || '').replace(/\D/g, '')
  if (s.length < 2) return s.padStart(2, '0')
  return s.slice(-2)
}

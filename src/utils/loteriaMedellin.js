/**
 * Consulta de premio mayor Lotería de Medellín (lottery_id 16) vía admin-ajax
 * y catálogo fecha → draw_id. Ver GUIA-IMPLEMENTACION.md en proyecto Loteria.
 */
import catalogoDefault from '../data/loteriaMedellinCatalogo.json'
import { parseCatalogoDesdeHistoricoHtml } from './loteriaMedellinCatalogoParse.js'

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

/** Última fecha (YYYY-MM-DD) presente en el catálogo empaquetado (útil para depuración). */
export function getUltimaFechaCatalogo(catalogo = catalogoDefault) {
  const keys = Object.keys(catalogo).sort()
  return keys.length ? keys[keys.length - 1] : null
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

function logLoteriaMedellin(mensaje, detalle) {
  console.log('[Lotería Medellín]', mensaje, detalle ?? '')
}

const CATALOGO_CACHE_MS = 1000 * 60 * 60 * 6 // 6 h
let catalogoResueltoCache = null
let catalogoResueltoCacheAt = 0

/** Limpia la caché del catálogo (p. ej. tras un error para forzar refetch). */
export function invalidarCacheCatalogoLoteria() {
  catalogoResueltoCache = null
  catalogoResueltoCacheAt = 0
}

/**
 * Catálogo fecha→draw_id: en producción vía Edge Function; en dev vía proxy Vite.
 * Si falla, usa el JSON empaquetado. Caché en memoria ~6 h.
 * @param {AbortSignal} [signal]
 */
export async function obtenerCatalogoLoteria(signal) {
  const now = Date.now()
  if (catalogoResueltoCache && now - catalogoResueltoCacheAt < CATALOGO_CACHE_MS) {
    return catalogoResueltoCache
  }

  const remoto = await intentarFetchCatalogoRemoto(signal)
  if (remoto && Object.keys(remoto).length > 0) {
    catalogoResueltoCache = remoto
    catalogoResueltoCacheAt = now
    logLoteriaMedellin('catálogo activo (remoto)', { sorteos: Object.keys(remoto).length })
    return remoto
  }

  catalogoResueltoCache = catalogoDefault
  catalogoResueltoCacheAt = now
  logLoteriaMedellin('catálogo activo (empaquetado, fallback)', { sorteos: Object.keys(catalogoDefault).length })
  return catalogoDefault
}

async function intentarFetchCatalogoRemoto(signal) {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    try {
      const res = await fetch('/api-loteria-historico', { signal, headers: { Accept: 'text/html' } })
      if (res.ok) {
        const html = await res.text()
        const cat = parseCatalogoDesdeHistoricoHtml(html)
        if (Object.keys(cat).length > 0) return cat
      }
    } catch (e) {
      logLoteriaMedellin('catálogo remoto (dev proxy) falló', e?.message || String(e))
    }
  }

  const url = getSupabaseLoteriaProxyUrl()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url) return null
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (url.includes('supabase.co') && anonKey) {
      headers.apikey = anonKey
      headers.Authorization = `Bearer ${anonKey}`
    }
    logLoteriaMedellin('fetch catálogo → Edge Function', { url })
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ catalog: true }),
      signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`)
    if (data.catalog && typeof data.catalog === 'object') return data.catalog
  } catch (e) {
    logLoteriaMedellin('catálogo remoto (Edge) falló', e?.message || String(e))
  }
  return null
}

async function fetchAdminAjaxHtml(drawId, ajaxUrl, signal) {
  const params = new URLSearchParams()
  params.append('action', 'wp_get_results_lottery_template')
  params.append('is_front', 'true')
  params.append('lottery_id', '16')
  params.append('draw_id', String(drawId))
  params.append('post_type', 'results_template')

  logLoteriaMedellin('fetch admin-ajax', {
    url: ajaxUrl,
    method: 'POST',
    bodyPreview: `action=wp_get_results_lottery_template&lottery_id=16&draw_id=${String(drawId)}`,
  })

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
    logLoteriaMedellin('consultarHtmlSorteo → proxy VITE_LOTERIA_MEDELLIN_PROXY_URL', {
      drawId: String(drawId),
      url: customProxy,
      body: { draw_id: String(drawId) },
    })
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
    logLoteriaMedellin('consultarHtmlSorteo → proxy Vite dev', {
      drawId: String(drawId),
      url: '/api-loteria-medellin-ajax',
      nota: 'reenvía a loteriademedellin.com.co/wp-admin/admin-ajax.php',
    })
    return fetchAdminAjaxHtml(drawId, '/api-loteria-medellin-ajax', signal)
  }

  const supabaseProxy = getSupabaseLoteriaProxyUrl()
  if (supabaseProxy) {
    logLoteriaMedellin('consultarHtmlSorteo → Edge Function Supabase', {
      drawId: String(drawId),
      url: supabaseProxy,
      body: { draw_id: String(drawId) },
    })
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

  logLoteriaMedellin('consultarHtmlSorteo → POST directo (producción)', {
    drawId: String(drawId),
    url: LOTERIA_MEDELLIN_AJAX_URL,
  })
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

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase no configurado. Configura las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
}

/** Dónde guardar la sesión: local = cerrar navegador y seguir logueado; session = solo esta sesión del navegador */
const AUTH_STORAGE_MODE_KEY = 'natillerapp-auth-storage-mode'

export function setAuthStorageMode(mode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_STORAGE_MODE_KEY, mode === 'session' ? 'session' : 'local')
}

export function clearAuthStorageMode() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_STORAGE_MODE_KEY)
}

function getAuthStorageMode() {
  if (typeof window === 'undefined') return 'local'
  const v = localStorage.getItem(AUTH_STORAGE_MODE_KEY)
  return v === 'session' ? 'session' : 'local'
}

const customAuthStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return null
    return getAuthStorageMode() === 'session'
      ? sessionStorage.getItem(key)
      : localStorage.getItem(key)
  },
  setItem(key, value) {
    if (typeof window === 'undefined') return
    if (getAuthStorageMode() === 'session') {
      localStorage.removeItem(key)
      sessionStorage.setItem(key, value)
    } else {
      sessionStorage.removeItem(key)
      localStorage.setItem(key, value)
    }
  },
  removeItem(key) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

/*
 * Red de seguridad para TODAS las peticiones a Supabase.
 *
 * `supabase-js` usa `fetch` tal cual, y `fetch` no tiene tiempo límite: en una
 * red móvil con señal débil una petición puede quedarse pendiente durante
 * minutos. Como el `await` nunca vuelve, el `finally` que apaga el spinner
 * tampoco corre, y la pantalla se queda cargando para siempre. Por eso el
 * límite va aquí y no en cada vista: cubre las ~400 consultas de la app.
 */

// 20 s: suficiente para una red lenta de verdad, poco para que alguien se rinda.
const LIMITE_MS = 20000
const REINTENTOS = 2

// `AbortSignal.timeout()` no existe antes de Safari 16, y la app soporta iOS
// más antiguo (docs/compatibilidad-ios-safari.md §1). AbortController sí.
function conAborto(ms) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(new DOMException('Tiempo agotado', 'TimeoutError')), ms)
  return { signal: ac.signal, limpiar: () => clearTimeout(t) }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchConLimite(entrada, init = {}) {
  const metodo = (init.method || 'GET').toUpperCase()

  /*
   * Solo se reintenta lo que se puede repetir sin consecuencias. Un POST o un
   * PATCH que agota el tiempo puede haber llegado igualmente al servidor: en
   * una app de dinero, reintentarlo a ciegas duplicaría un abono o un pago.
   * Ante la duda, se falla y que lo decida la persona.
   */
  const reintentable = metodo === 'GET' || metodo === 'HEAD'
  const intentos = reintentable ? REINTENTOS : 0

  let ultimoFallo
  for (let intento = 0; intento <= intentos; intento++) {
    const { signal, limpiar } = conAborto(LIMITE_MS)
    try {
      // Si la petición ya traía su propio `signal` (cancelar al desmontar, por
      // ejemplo), se respeta: el primero que aborte, manda.
      init.signal?.addEventListener('abort', () => signal.dispatchEvent(new Event('abort')), { once: true })

      const respuesta = await fetch(entrada, { ...init, signal })

      // 5xx y 429 son transitorios; 4xx no, y reintentarlos solo hace perder tiempo.
      if (reintentable && intento < intentos && (respuesta.status >= 500 || respuesta.status === 429)) {
        ultimoFallo = new Error(`HTTP ${respuesta.status}`)
        limpiar()
        await esperar(400 * 2 ** intento + Math.random() * 200)
        continue
      }
      return respuesta
    } catch (e) {
      ultimoFallo = e
      // Sin conexión no tiene sentido esperar ni reintentar: se falla ya, con
      // un mensaje que el usuario pueda entender.
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Sin conexión a internet. Comprueba la red e inténtalo de nuevo.')
      }
      if (intento < intentos) {
        await esperar(400 * 2 ** intento + Math.random() * 200)
        continue
      }
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        throw new Error('La conexión está tardando demasiado. Revisa tu internet e inténtalo de nuevo.')
      }
      throw e
    } finally {
      limpiar()
    }
  }
  throw ultimoFallo
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: customAuthStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: { fetch: fetchConLimite },
  }
)

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Error de Supabase:', error.message)
    throw new Error(error.message)
  }
}


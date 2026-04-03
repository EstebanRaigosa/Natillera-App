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
  }
)

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
  if (error) {
    console.error('Error de Supabase:', error.message)
    throw new Error(error.message)
  }
}


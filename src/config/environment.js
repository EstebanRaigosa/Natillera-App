/**
 * Configuración de entorno para Natilleraapp
 * 
 * Detecta automáticamente si estamos en desarrollo o producción
 * basándose en la URL actual y variables de entorno de Vite
 */

// Detectar el modo de Vite (development/production)
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
export const mode = import.meta.env.MODE

// Detectar basándose en la URL actual (útil cuando Vite no está disponible)
export const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168.'))

// URLs base según el entorno
export const BASE_URL = isDev || isLocalhost
  ? 'http://localhost:5174'
  : 'https://natillerapp.com'

// URLs de redirección para autenticación
export const AUTH_REDIRECT_URLS = {
  welcome: `${BASE_URL}/auth/welcome`,
  resetPassword: `${BASE_URL}/auth/reset-password`,
  dashboard: `${BASE_URL}/dashboard`,
}

/**
 * URLs que DEBEN estar configuradas en Supabase Dashboard
 * (Authentication > URL Configuration > Redirect URLs)
 * 
 * Para que los correos funcionen correctamente en ambos entornos,
 * asegúrate de tener TODAS estas URLs en la lista de Redirect URLs:
 * 
 * PRODUCCIÓN:
 * - https://natillerapp.com
 * - https://natillerapp.com/auth/welcome
 * - https://natillerapp.com/auth/reset-password
 * - https://natillerapp.com/dashboard
 * 
 * DESARROLLO (localhost):
 * - http://localhost:5174
 * - http://localhost:5174/auth/welcome
 * - http://localhost:5174/auth/reset-password
 * - http://localhost:5174/dashboard
 */
export const REQUIRED_SUPABASE_REDIRECT_URLS = {
  production: [
    'https://natillerapp.com',
    'https://natillerapp.com/auth/welcome',
    'https://natillerapp.com/auth/reset-password',
    'https://natillerapp.com/dashboard',
  ],
  development: [
    'http://localhost:5174',
    'http://localhost:5174/auth/welcome',
    'http://localhost:5174/auth/reset-password',
    'http://localhost:5174/dashboard',
  ]
}

// Configuración de características por entorno
export const FEATURES = {
  // Funcionalidades que solo están disponibles en desarrollo
  devOnly: {
    debugMode: isDev,
    showDevTools: isDev,
    mockData: false, // Cambiar a true para usar datos de prueba
  },
  
  // Rutas experimentales (solo visibles en desarrollo)
  experimentalRoutes: isDev,
  
  // Mostrar información de debug en consola
  verboseLogging: isDev,
}

// Helper para ejecutar código solo en desarrollo
export function devOnly(callback) {
  if (isDev || isLocalhost) {
    return callback()
  }
  return null
}

// Helper para ejecutar código solo en producción
export function prodOnly(callback) {
  if (isProd && !isLocalhost) {
    return callback()
  }
  return null
}

// Log solo en desarrollo
export function devLog(...args) {
  if (isDev || isLocalhost) {
    console.log('🔧 [DEV]:', ...args)
  }
}

// Warning solo en desarrollo
export function devWarn(...args) {
  if (isDev || isLocalhost) {
    console.warn('⚠️ [DEV]:', ...args)
  }
}

// Información del entorno actual (útil para debugging)
export const ENV_INFO = {
  mode,
  isDev,
  isProd,
  isLocalhost,
  baseUrl: BASE_URL,
  timestamp: new Date().toISOString(),
}

// Mostrar info del entorno al iniciar (solo en desarrollo)
if (isDev || isLocalhost) {
  console.log('🚀 Natilleraapp - Entorno:', mode)
  console.log('📍 Base URL:', BASE_URL)
  console.log('🔧 Modo desarrollo:', isDev || isLocalhost ? 'Sí' : 'No')
}

export default {
  isDev,
  isProd,
  isLocalhost,
  mode,
  BASE_URL,
  AUTH_REDIRECT_URLS,
  FEATURES,
  devOnly,
  prodOnly,
  devLog,
  devWarn,
  ENV_INFO,
}


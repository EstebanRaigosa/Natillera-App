import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import 'driver.js/dist/driver.css'

// Detectar si estamos en modo desarrollo
const isDev = import.meta.env.DEV
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168.'))
const isDevelopment = isDev || isLocalhost

// Configurar console para que solo muestre logs en desarrollo
if (typeof window !== 'undefined' && !isDevelopment) {
  // Guardar referencias originales
  const originalLog = window.console.log
  const originalWarn = window.console.warn
  const originalInfo = window.console.info
  const originalDebug = window.console.debug
  
  // Sobrescribir métodos de console en producción para que no muestren nada
  window.console.log = function() {
    // No hacer nada en producción
  }
  
  window.console.warn = function() {
    // No hacer nada en producción
  }
  
  window.console.info = function() {
    // No hacer nada en producción
  }
  
  window.console.debug = function() {
    // No hacer nada en producción
  }
  
  // console.error puede seguir funcionando para errores críticos
  // pero también interceptamos errores de extensiones del navegador
  const originalError = window.console.error
  window.console.error = function(...args) {
    const errorMessage = args.join(' ')
    
    // Suprimir errores específicos de extensiones del navegador
    if (
      errorMessage.includes('Unchecked runtime.lastError') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('A listener indicated an asynchronous response')
    ) {
      // Silenciosamente ignorar estos errores - no afectan la funcionalidad
      return
    }
    
    // En producción, mantener console.error activo para errores críticos
    // Pasar todos los demás errores al console.error original
    originalError.apply(window.console, args)
  }
  
  // Interceptar promesas rechazadas no capturadas relacionadas con extensiones
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || ''
    
    // Suprimir errores de extensiones del navegador
    if (
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('runtime.lastError')
    ) {
      event.preventDefault() // Prevenir que aparezca en la consola
      return
    }
  }, { passive: true })
} else if (typeof window !== 'undefined' && isDevelopment) {
  // En desarrollo, solo interceptar errores de extensiones del navegador
  const originalError = window.console.error
  window.console.error = function(...args) {
    const errorMessage = args.join(' ')
    
    // Suprimir errores específicos de extensiones del navegador
    if (
      errorMessage.includes('Unchecked runtime.lastError') ||
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('A listener indicated an asynchronous response')
    ) {
      // Silenciosamente ignorar estos errores - no afectan la funcionalidad
      return
    }
    
    // Pasar todos los demás errores al console.error original
    originalError.apply(window.console, args)
  }
  
  // Interceptar promesas rechazadas no capturadas relacionadas con extensiones
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || ''
    
    // Suprimir errores de extensiones del navegador
    if (
      errorMessage.includes('message channel closed') ||
      errorMessage.includes('asynchronous response') ||
      errorMessage.includes('runtime.lastError')
    ) {
      event.preventDefault() // Prevenir que aparezca en la consola
      return
    }
  }, { passive: true })
}

// Optimizaciones específicas para iOS/iPhone (no afectan Android)
if (typeof window !== 'undefined') {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  
  if (isIOS) {
    document.body.classList.add('ios-device')

    const isSlowDevice = navigator.hardwareConcurrency <= 2 ||
                        (navigator.deviceMemory && navigator.deviceMemory <= 2)
    if (isSlowDevice) {
      document.body.classList.add('slow-device')
    }
  }

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add('touch-device')
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

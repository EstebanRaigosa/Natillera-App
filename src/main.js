import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

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

// Optimizaciones específicas para iOS/iPhone
if (typeof window !== 'undefined') {
  // Detectar iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  
  if (isIOS) {
    // Prevenir zoom en doble tap SOLO en elementos no interactivos (no en botones)
    let lastTouchEnd = 0
    let touchStartTarget = null
    
    document.addEventListener('touchstart', function(event) {
      // Guardar el elemento que recibió el touchstart
      touchStartTarget = event.target
    }, { passive: true })
    
    document.addEventListener('touchend', function(event) {
      const now = Date.now()
      const target = event.target || touchStartTarget
      
      // NUNCA prevenir eventos en botones o elementos interactivos
      const isInteractive = target && (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a[href]') ||
        target.closest('[role="button"]') ||
        target.closest('[onclick]') ||
        target.closest('label') ||
        target.isContentEditable
      )
      
      // Solo prevenir zoom en doble tap si NO es un elemento interactivo
      if (!isInteractive && now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      
      lastTouchEnd = now
      touchStartTarget = null
    }, false)
    
    // Mejorar respuesta de botones en iOS
    // Agregar clase 'ios-device' al body para estilos específicos
    document.body.classList.add('ios-device')
    
    // Asegurar que los botones siempre funcionen correctamente en iOS
    // Agregar listener para mejorar la detección de touch en botones
    document.addEventListener('touchstart', function(event) {
      const target = event.target
      const button = target.closest('button') || 
                     target.closest('[role="button"]') ||
                     (target.tagName === 'BUTTON' ? target : null) ||
                     (target.tagName === 'A' && target.hasAttribute('href') ? target : null)
      
      if (button && !button.disabled && !button.hasAttribute('disabled')) {
        // Agregar clase temporal para feedback visual
        button.classList.add('touch-active')
        
        // Asegurar que el botón tenga los estilos correctos
        button.style.pointerEvents = 'auto'
        button.style.cursor = 'pointer'
        
        // Remover clase después de un tiempo
        setTimeout(() => {
          if (button) {
            button.classList.remove('touch-active')
          }
        }, 200)
      }
    }, { passive: true })
    
    // Optimizar scroll en iOS
    document.addEventListener('touchmove', function(event) {
      // Permitir scroll nativo en elementos scrollables
      const target = event.target
      if (target && (target.scrollHeight > target.clientHeight || 
          target.closest('[style*="overflow"]') || 
          target.closest('.overflow-auto') ||
          target.closest('.overflow-scroll'))) {
        return
      }
    }, { passive: true })
    
    // Mejorar rendimiento de animaciones en iOS
    // Reducir animaciones complejas si el dispositivo es lento
    const isSlowDevice = navigator.hardwareConcurrency <= 2 || 
                        (navigator.deviceMemory && navigator.deviceMemory <= 2)
    
    if (isSlowDevice) {
      document.body.classList.add('slow-device')
    }
  }
  
  // Optimización universal para mejorar respuesta táctil
  // Eliminar delay de 300ms en todos los dispositivos táctiles
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Agregar clase para estilos específicos de dispositivos táctiles
    document.body.classList.add('touch-device')
    
    // Mejorar respuesta de botones en todos los dispositivos táctiles
    document.addEventListener('touchstart', function() {
      // Este listener pasivo ayuda a mejorar la respuesta
    }, { passive: true })
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

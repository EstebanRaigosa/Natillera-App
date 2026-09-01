import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'

/** Evita que otro hook de config deje allowedHosts distinto de `true` (túneles/ngrok). */
function vitePluginForceAllowedHosts() {
  return {
    name: 'natillera-force-allowed-hosts',
    configResolved(config) {
      config.server.allowedHosts = true
      config.preview.allowedHosts = true
    },
  }
}

/**
 * El middleware de Host de Vite mira `req.headers.host`. A veces el túnel envía un Host
 * que no coincide; reescribir a localhost hace pasar la comprobación antes que cualquier 403.
 * Debe ir con enforce: 'pre' y antes que otros plugins que configuren el servidor.
 */
function vitePluginNgrokHostRewrite() {
  return {
    name: 'natillera-ngrok-host',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const hostname = (req.headers.host || '').split(':')[0] || ''
        if (hostname.includes('ngrok')) {
          const p = server.config.server?.port ?? 5174
          req.headers.host = `localhost:${p}`
        }
        next()
      })
    },
  }
}

// Sin https:// en el valor. Ej: abc123.ngrok-free.dev — mejora HMR/WebSocket detrás del túnel.
const devPublicHost = process.env.VITE_DEV_PUBLIC_HOST?.replace(/^https?:\/\//, '').split('/')[0]

export default defineConfig({
  plugins: [
    vitePluginNgrokHostRewrite(),
    vitePluginForceAllowedHosts(),
    vue(),
    // Polyfill para 'stream' - xlsx-js-style lo usa internamente
    nodePolyfills({ include: ['stream'] }),
    // PWA: service worker que precachea el shell (JS/CSS/HTML) para que, cuando el
    // navegador móvil descarta la pestaña en segundo plano y recarga al volver, el
    // arranque sea instantáneo desde cache en vez de pantalla blanca + descarga de red.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // injectManifest y no generateSW: el service worker se escribe a mano en
      // src/sw.js porque necesita manejadores propios de `push` y
      // `notificationclick` para las notificaciones del soporte (RNF-06 de
      // Especificaciones/chat-soporte/especificacion.md). El precache sigue
      // siendo el mismo, solo que declarado dentro de src/sw.js.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      // SW desactivado en desarrollo para no interferir con HMR.
      devOptions: { enabled: false, type: 'module' },
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Natillerapp',
        short_name: 'Natillerapp',
        description: 'Plataforma para gestionar tu natillera: ahorro colectivo, cuotas, socios y préstamos.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1B5E37',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/android-chrome-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Con injectManifest, aquí solo se decide QUÉ entra en el precache; el
      // cómo (navigateFallback, cleanupOutdatedCaches, skipWaiting, no tocar
      // Supabase) vive ahora en src/sw.js.
      injectManifest: {
        // Chunks pesados (p. ej. xlsx) se cargan bajo demanda; no es necesario precachearlos.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Service worker clásico, no módulo ES. `generateSW` producía uno
        // clásico y el registro actual no pide `{ type: 'module' }`; un SW en
        // formato ES exige soporte de módulos en el worker y dejaría sin
        // precache a los navegadores que no lo tienen.
        rollupFormat: 'iife',
      },
    }),
  ],
  build: {
    // index + xlsx siguen siendo grandes; el aviso es orientativo
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Helpers de interop CommonJS que genera Rollup (commonjsGlobal, getDefaultExportFromCjs).
          // Son módulos VIRTUALES (su id no contiene 'node_modules'), compartidos por vendor y por
          // el chunk async 'xlsx'. Si Rollup los deja en 'xlsx', vendor los importa desde ahí y se
          // forma el ciclo xlsx<->vendor que carga xlsx en el arranque y dispara el TDZ
          // ("Cannot access 'be' before initialization"). Fijándolos en 'vendor', xlsx solo importa
          // de vendor (una dirección): sin ciclo, y xlsx queda 100% async (solo al exportar).
          // Debe ir ANTES del early-return de node_modules porque el id es virtual.
          if (id.includes('commonjsHelpers') || id.includes('commonjs-dynamic-modules')) return 'vendor'
          if (!id.includes('node_modules')) return
          // Librerías pesadas o poco usadas en la primera pantalla → chunk aparte
          if (id.includes('@supabase')) return 'supabase'
          if (/[/\\]node_modules[/\\](xlsx|xlsx-js-style)[/\\]/.test(id)) return 'xlsx'
          if (id.includes('html2canvas') || id.includes('html-to-image')) return 'html-capture'
          if (id.includes('@heroicons')) return 'heroicons'
          if (id.includes('driver.js')) return 'driver'
          // Core Vue: orden importa (router antes que coincidencia genérica "vue")
          if (id.includes('vue-router')) return 'vue-router'
          if (id.includes('pinia')) return 'pinia'
          if (id.includes('@vue') || /[/\\]vue[/\\]/.test(id)) return 'vue-vendor'
          return 'vendor'
        },
      },
    },
  },
  server: {
    // 0.0.0.0: acepta conexiones por LAN (ej. ngrok → 192.168.x.x:5174)
    host: '0.0.0.0',
    port: 5174,
    // Cualquier Host (ngrok y similares rotan el subdominio). Solo servidor de desarrollo Vite.
    allowedHosts: true,
    ...(devPublicHost
      ? {
          hmr: {
            protocol: 'wss',
            host: devPublicHost,
            clientPort: 443,
          },
        }
      : {}),
    proxy: {
      // Lotería de Medellín admin-ajax: el navegador no puede POST cross-origin sin CORS
      '/api-loteria-medellin-ajax': {
        target: 'https://loteriademedellin.com.co',
        changeOrigin: true,
        rewrite: () => '/wp-admin/admin-ajax.php',
      },
      // Catálogo fecha→draw_id (misma página que scrape-loteria-catalogo.mjs)
      '/api-loteria-historico': {
        target: 'https://loteriademedellin.com.co',
        changeOrigin: true,
        rewrite: () => '/historico-de-resultados/',
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
  },
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

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
  ],
  build: {
    // index + xlsx siguen siendo grandes; el aviso es orientativo
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Librerías pesadas o poco usadas en la primera pantalla → chunk aparte
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('xlsx') || id.includes('xlsx-js-style')) return 'xlsx'
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

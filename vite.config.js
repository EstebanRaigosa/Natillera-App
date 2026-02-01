import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    // Polyfill para 'stream' - xlsx-js-style lo usa internamente
    nodePolyfills({ include: ['stream'] }),
  ],
  server: {
    host: true,           // necesario para exponer el server
    port: 5174,
    allowedHosts: [
      '.ngrok-free.dev'   // acepta cualquier subdominio de ngrok
    ]
  }
})

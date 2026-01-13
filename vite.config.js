import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,           // necesario para exponer el server
    port: 5174,
    allowedHosts: [
      '.ngrok-free.dev'   // acepta cualquier subdominio de ngrok
    ]
  }
})

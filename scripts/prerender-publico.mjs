/*
 * Pre-render de la portada pública (SEO).
 *
 * Corre dentro de `vite build` (plugin en vite.config.js), después de escribir `dist/` y
 * ANTES de que vite-plugin-pwa arme el precache, para que el service worker conozca los
 * dos HTML finales:
 *
 *   dist/app.html   → el «cascarón» vacío de la SPA, sin canonical. Lo sirven Netlify y
 *                     el service worker para cualquier ruta que no sea un archivo.
 *   dist/index.html → la portada con su HTML ya pintado dentro de #app y las preguntas
 *                     frecuentes como datos estructurados. Es lo que recibe un buscador
 *                     en natillerapp.com; al cargar, la app monta encima.
 *
 * El HTML sale del mismo Landing.vue, compilado aquí con un build SSR aparte.
 */
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function prerenderPublico({ root, outDir }) {
  const dirSsr = resolve(root, 'node_modules/.cache/prerender-publico')

  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [vue()],
    ssr: { noExternal: ['@heroicons/vue'] },
    build: {
      ssr: resolve(root, 'src/views/publico/entry-server.js'),
      outDir: dirSsr,
      emptyOutDir: true,
      rollupOptions: { output: { format: 'es', entryFileNames: 'entry-server.mjs' } }
    }
  })

  const { render, faqJsonLd } = await import(pathToFileURL(resolve(dirSsr, 'entry-server.mjs')).href + `?t=${Date.now()}`)
  const html = await render('/')

  const rutaIndex = resolve(outDir, 'index.html')
  const plantilla = await readFile(rutaIndex, 'utf8')

  // Cascarón para las demás rutas: sin canonical ni og:url, que los pone el router por ruta.
  const cascaron = plantilla
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta property="og:url"[^>]*>/, '')
  await writeFile(resolve(outDir, 'app.html'), cascaron)

  if (!plantilla.includes('<div id="app"></div>')) {
    throw new Error('prerender-publico: no se encontró <div id="app"></div> en dist/index.html')
  }
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(faqJsonLd())}</script>`
  const portada = plantilla
    .replace('<div id="app"></div>', `<div id="app">${html}</div>`)
    .replace('</head>', `    ${jsonLd}\n  </head>`)
  await writeFile(rutaIndex, portada)

  await rm(dirSsr, { recursive: true, force: true })
}

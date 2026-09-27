/*
 * Pre-render de las páginas públicas (SEO).
 *
 * Corre dentro de `vite build` (plugin en vite.config.js), después de escribir `dist/` y
 * ANTES de que vite-plugin-pwa arme el precache, para que el service worker conozca los
 * HTML finales:
 *
 *   dist/app.html   → el «cascarón» vacío de la SPA, con noindex y sin canonical. Lo sirven
 *                     Netlify y el service worker para las rutas de la app (login, la app,
 *                     direcciones que no existen). El router pone luego los metadatos.
 *   dist/index.html → la portada.
 *   dist/<ruta>.html → cada página pública (guía, legales). netlify.toml los enruta.
 *
 * Cada página sale con su HTML ya pintado dentro de #app y su título, descripción,
 * canonical y Open Graph en el <head>: buscadores que no ejecutan JavaScript y las
 * vistas previas de WhatsApp o Facebook ven lo mismo que el usuario. Al cargar, la app
 * monta encima con el mismo marcado.
 *
 * El HTML sale de los mismos componentes, compilados aquí con un build SSR aparte.
 */
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/*
 * `vista`: el componente cargado bajo demanda por el router. Su CSS (estilos scoped) no
 * viene en el HTML base; sin enlazarlo, la página pre-renderizada se vería sin estilos
 * hasta que llegue el JavaScript.
 */
const PAGINAS = [
  { ruta: '/', archivo: 'index.html' },
  { ruta: '/que-es-una-natillera', archivo: 'que-es-una-natillera.html', vista: 'src/views/publico/GuiaNatillera.vue', articulo: true },
  { ruta: '/privacidad', archivo: 'privacidad.html', vista: 'src/views/legal/PaginaLegal.vue' },
  { ruta: '/terminos', archivo: 'terminos.html', vista: 'src/views/legal/PaginaLegal.vue' }
]

const escapar = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Cambia el valor de un atributo en la etiqueta que case con `selector` (regex de la etiqueta). */
function fijarAtributo(html, patronEtiqueta, atributo, valor) {
  const re = new RegExp(`(<${patronEtiqueta}[^>]*\\s${atributo}=")[^"]*(")`)
  if (!re.test(html)) throw new Error(`prerender-publico: no se encontró ${patronEtiqueta} en index.html`)
  return html.replace(re, `$1${escapar(valor)}$2`)
}

function fijarHead(html, { titulo, descripcion, url }) {
  let h = html.replace(/<title>[^<]*<\/title>/, `<title>${escapar(titulo)}</title>`)
  h = fijarAtributo(h, 'meta name="description"', 'content', descripcion)
  h = fijarAtributo(h, 'link rel="canonical"', 'href', url)
  h = fijarAtributo(h, 'meta property="og:url"', 'content', url)
  h = fijarAtributo(h, 'meta property="og:title"', 'content', titulo)
  h = fijarAtributo(h, 'meta property="og:description"', 'content', descripcion)
  h = fijarAtributo(h, 'meta name="twitter:title"', 'content', titulo)
  h = fijarAtributo(h, 'meta name="twitter:description"', 'content', descripcion)
  return h
}

/** CSS y JS del chunk de una vista (y de lo que importa), según el manifest de Vite. */
function recursosDeVista(manifest, clave, vistos = new Set()) {
  const entrada = manifest[clave]
  if (!entrada || vistos.has(clave)) return { css: [], js: [] }
  vistos.add(clave)
  const css = [...(entrada.css || [])]
  const js = [entrada.file]
  for (const imp of entrada.imports || []) {
    const sub = recursosDeVista(manifest, imp, vistos)
    css.push(...sub.css)
    js.push(...sub.js)
  }
  return { css, js }
}

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

  const { render, faqJsonLd, SEO_PAGINAS, URL_SITIO } = await import(pathToFileURL(resolve(dirSsr, 'entry-server.mjs')).href + `?t=${Date.now()}`)
  const manifest = JSON.parse(await readFile(resolve(outDir, '.vite/manifest.json'), 'utf8'))

  const rutaIndex = resolve(outDir, 'index.html')
  const plantilla = await readFile(rutaIndex, 'utf8')
  if (!plantilla.includes('<div id="app"></div>')) {
    throw new Error('prerender-publico: no se encontró <div id="app"></div> en dist/index.html')
  }

  /*
   * Cascarón para las rutas de la app. `noindex` desde el HTML: sin él, el login, la app o
   * una dirección que no existe llegaban como «index» con el título de la portada a
   * quien no ejecuta JavaScript. Las páginas públicas ya no pasan por aquí.
   */
  const cascaron = plantilla
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\s*<meta property="og:url"[^>]*>/, '')
    .replace(/<meta name="robots" content="[^"]*"/, '<meta name="robots" content="noindex, nofollow"')
  await writeFile(resolve(outDir, 'app.html'), cascaron)

  const hoy = new Date().toISOString().slice(0, 10)

  for (const pagina of PAGINAS) {
    const seo = SEO_PAGINAS[pagina.ruta]
    if (!seo) throw new Error(`prerender-publico: falta ${pagina.ruta} en SEO_PAGINAS`)
    const url = URL_SITIO + pagina.ruta
    const html = await render(pagina.ruta)

    const jsonLd = []
    if (pagina.ruta === '/') jsonLd.push(faqJsonLd())
    if (pagina.articulo) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seo.titulo.replace(/\s*\|\s*Natillerapp$/, ''),
        description: seo.descripcion,
        inLanguage: 'es-CO',
        url,
        mainEntityOfPage: url,
        image: `${URL_SITIO}/og-natillerapp.jpg`,
        dateModified: hoy,
        author: { '@type': 'Organization', name: 'Natillerapp', url: `${URL_SITIO}/` },
        publisher: { '@type': 'Organization', name: 'Natillerapp', logo: { '@type': 'ImageObject', url: `${URL_SITIO}/android-chrome-512x512.png` } }
      })
    }

    let extraHead = jsonLd.map(d => `<script type="application/ld+json">${JSON.stringify(d)}</script>`)
    if (pagina.vista) {
      const { css, js } = recursosDeVista(manifest, pagina.vista)
      if (!js.length) throw new Error(`prerender-publico: ${pagina.vista} no está en el manifest`)
      const nuevos = (href) => !plantilla.includes(`"/${href}"`)
      extraHead = [
        ...[...new Set(css)].filter(nuevos).map(f => `<link rel="stylesheet" crossorigin href="/${f}">`),
        ...[...new Set(js)].filter(nuevos).map(f => `<link rel="modulepreload" crossorigin href="/${f}">`),
        ...extraHead
      ]
    }

    const final = fijarHead(plantilla, { titulo: seo.titulo, descripcion: seo.descripcion, url })
      .replace('<div id="app"></div>', `<div id="app">${html}</div>`)
      .replace('</head>', extraHead.map(l => `    ${l}\n`).join('') + '  </head>')
    await writeFile(resolve(outDir, pagina.archivo), final)
  }

  await rm(dirSsr, { recursive: true, force: true })
}

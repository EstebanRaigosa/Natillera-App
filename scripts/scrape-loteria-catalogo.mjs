/**
 * Descarga /historico-de-resultados/ y extrae opciones data-lottery_id="16"
 * (Lotería de Medellín). No usa Puppeteer: el HTML ya incluye las <option>.
 *
 * Uso: node scripts/scrape-loteria-catalogo.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parseCatalogoDesdeHistoricoHtml } from '../src/utils/loteriaMedellinCatalogoParse.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HISTORICO_URL = 'https://loteriademedellin.com.co/historico-de-resultados/'
const OUT = path.join(__dirname, '../src/data/loteriaMedellinCatalogo.json')

async function main() {
  const res = await fetch(HISTORICO_URL, {
    headers: { Accept: 'text/html' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  const catalogo = parseCatalogoDesdeHistoricoHtml(html)
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(catalogo, null, 0) + '\n', 'utf8')
  console.log(`OK: ${Object.keys(catalogo).length} sorteos → ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Genera `public/og-natillerapp.jpg`: la imagen que muestran WhatsApp, Facebook y demás al
 * compartir natillerapp.com (Open Graph, 1200×630).
 *
 * La app en computadora y celular (es multidispositivo) con los socios alrededor (la
 * comunidad). Es una pieza propia, no un recorte de la portada; las pantallas son una
 * ilustración con datos de ejemplo, no capturas.
 *
 * Se dibuja como SVG y se rasteriza con resvg. La tipografía es Mulish, la de la marca: se
 * descarga de Google Fonts la primera vez y queda en node_modules/.cache (el «$» del logo
 * usa la fuente del sistema, DejaVu Sans, como en favicon.svg). Para pasar a JPG
 * (pesa la mitad que el PNG; WhatsApp no muestra imágenes pesadas) usa ffmpeg si está.
 *
 * Si cambias la imagen, cambia también el nombre del archivo y el og:image de index.html:
 * las redes guardan la vista previa por URL y no verían la nueva.
 *
 *   npm run og:imagen
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { Resvg } from '@resvg/resvg-js'

const raiz = process.cwd()
const salida = resolve(raiz, 'public/og-natillerapp.jpg')
const dirFuentes = resolve(raiz, 'node_modules/.cache/og-fuentes')
const PESOS = [300, 400, 700, 800]

const ANCHO = 1200
const ALTO = 630
const VERDE = '#1B5E37'
const GRIS = '#6b7c72'
const TXT = 'font-family="Mulish"'

let logo = await readFile(resolve(raiz, 'public/favicon.svg'), 'utf8')
logo = logo
  .replace(/<svg[^>]*>/, '<svg x="68" y="44" width="100" height="100" viewBox="0 0 512 512">')
  .replace(/id="bg"/, 'id="logoBg"').replace(/url\(#bg\)/g, 'url(#logoBg)')
  .replace(/id="glow"/, 'id="logoGlow"').replace(/url\(#glow\)/g, 'url(#logoGlow)')
  .replace(/<!--[\s\S]*?-->/g, '')

const t = (x, y, size, peso, color, texto, extra = '') =>
  `<text x="${x}" y="${y}" ${TXT} font-size="${size}" font-weight="${peso}" fill="${color}" ${extra}>${texto}</text>`

/* ---------- Personas (comunidad) ---------- */
const GENTE = [
  { fondo: '#FFE3C2', piel: '#f1c7a0', pelo: '#4a2c1d', ropa: '#E07A5F' },
  { fondo: '#D7ECFF', piel: '#c98f65', pelo: '#1f1a17', ropa: '#3D85C6' },
  { fondo: '#FFD6E0', piel: '#8d5a3b', pelo: '#1f1a17', ropa: '#8E6CC9', largo: true },
  { fondo: '#FFF1C9', piel: '#e8b48c', pelo: '#7a4a2a', ropa: '#2f8a57', largo: true },
  { fondo: '#E3F4E8', piel: '#f1c7a0', pelo: '#b07a3e', ropa: '#F2A541' },
  { fondo: '#E6E0FF', piel: '#c98f65', pelo: '#2b2320', ropa: '#1B5E37' },
  { fondo: '#FFE0D1', piel: '#e8b48c', pelo: '#3b2518', ropa: '#C4516C', largo: true }
]
let nAvatar = 0
function avatar(x, y, r, p, { check = false, sombra = true } = {}) {
  const id = `av${nAvatar++}`
  const k = r / 31 // dibujado a r=31 y escalado
  const pelo = p.largo
    ? `<path d="M-15 8 C -18 -22, 18 -22, 15 8 L 12 -4 C 6 -10, -6 -10, -12 -4 Z" fill="${p.pelo}"/>`
    : `<path d="M-13 -6 C -13 -22, 13 -22, 13 -6 C 6 -12, -6 -12, -13 -6 Z" fill="${p.pelo}"/>`
  return `
  ${sombra ? `<circle cx="${x}" cy="${y}" r="${r + 5 * k}" fill="#fff" filter="url(#sombraSuave)"/>` : `<circle cx="${x}" cy="${y}" r="${r + 4 * k}" fill="#fff"/>`}
  <clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>
  <g clip-path="url(#${id})">
    <circle cx="${x}" cy="${y}" r="${r}" fill="${p.fondo}"/>
    <g transform="translate(${x} ${y}) scale(${k})">
      <ellipse cx="0" cy="30" rx="21" ry="17" fill="${p.ropa}"/>
      <circle cx="0" cy="-5" r="12" fill="${p.piel}"/>
      ${pelo}
    </g>
  </g>
  ${check ? `
  <g transform="translate(${x + r * 0.78} ${y + r * 0.78}) scale(${Math.max(k, 0.8)})">
    <circle r="11" fill="${VERDE}" stroke="#fff" stroke-width="3"/>
    <path d="M-5 0 l3.5 3.5 l6.5 -7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>` : ''}`
}

const moneda = (x, y, r) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="url(#moneda)" stroke="#c9952f" stroke-width="1.5"/>
  <text x="${x}" y="${y + r * 0.36}" text-anchor="middle" ${TXT} font-weight="800" font-size="${r * 1.05}" fill="#9a6b12">$</text>`

/* ---------- Computadora: la app en versión de escritorio ---------- */
const L = { x: 712, y: 100, w: 440, h: 278 } // pantalla (dentro del bisel)
const SB = 96 // ancho de la barra lateral
const M = { x: L.x + SB, w: L.w - SB }    // zona principal

const menu = ['Inicio', 'Socios', 'Cuotas', 'Préstamos']
const menuSvg = menu.map((m, i) => {
  const y = L.y + 62 + i * 26
  const activo = m === 'Cuotas'
  return `
    ${activo ? `<rect x="${L.x + 8}" y="${y - 13}" width="${SB - 16}" height="20" rx="6" fill="#ffffff" fill-opacity="0.16"/>` : ''}
    <circle cx="${L.x + 20}" cy="${y - 3}" r="3" fill="#b9f0cc" fill-opacity="${activo ? 1 : 0.5}"/>
    ${t(L.x + 30, y + 1, 9.5, activo ? 800 : 600, '#ffffff', m, `fill-opacity="${activo ? 1 : 0.75}"`)}`
}).join('')

const tarjetas = [
  { etiqueta: 'AHORRO DEL GRUPO', valor: '$ 12.450.000' },
  { etiqueta: 'PRÉSTAMOS', valor: '4 activos' },
  { etiqueta: 'CAJA', valor: '$ 3.180.000' }
].map((c, i) => {
  const w = 100, x = M.x + 12 + i * (w + 8)
  return `
    <rect x="${x}" y="${L.y + 44}" width="${w}" height="50" rx="9" fill="#fff" stroke="#E3ECE5"/>
    ${t(x + 10, L.y + 62, 7.5, 800, GRIS, c.etiqueta, 'letter-spacing="0.5"')}
    ${t(x + 10, L.y + 82, 13, 800, i === 0 ? VERDE : '#1f2d25', c.valor)}`
}).join('')

const barras = [30, 38, 44, 52, 58, 66, 74, 86]
const grafica = `
  <rect x="${M.x + 12}" y="${L.y + 104}" width="190" height="160" rx="9" fill="#fff" stroke="#E3ECE5"/>
  ${t(M.x + 22, L.y + 122, 9, 800, '#1f2d25', 'Ahorro del año')}
  ${barras.map((a, i) => `<rect x="${M.x + 26 + i * 21}" y="${L.y + 250 - a * 1.25}" width="13" height="${a * 1.25}" rx="3" fill="${VERDE}" fill-opacity="${0.35 + i * 0.09}"/>`).join('')}
  <line x1="${M.x + 22}" y1="${L.y + 251}" x2="${M.x + 192}" y2="${L.y + 251}" stroke="#E3ECE5"/>`

const cuotasEsc = [
  { n: 'María A.', ok: true, c: '#E07A5F' },
  { n: 'Juan C.', ok: true, c: '#3D85C6' },
  { n: 'Luz P.', ok: false, c: '#8E6CC9' },
  { n: 'Andrés R.', ok: true, c: '#2f8a57' },
  { n: 'Diana M.', ok: true, c: '#C4516C' }
]
const listaEsc = `
  <rect x="${M.x + 210}" y="${L.y + 104}" width="${M.w - 222}" height="160" rx="9" fill="#fff" stroke="#E3ECE5"/>
  ${t(M.x + 220, L.y + 122, 9, 800, '#1f2d25', 'Cuotas de octubre')}
  ${cuotasEsc.map((s, i) => {
    const y = L.y + 142 + i * 25
    return `
    <circle cx="${M.x + 226}" cy="${y}" r="7" fill="${s.c}"/>
    ${t(M.x + 238, y + 3.5, 8.5, 700, '#1f2d25', s.n)}
    <circle cx="${M.x + M.w - 24}" cy="${y}" r="6" fill="${s.ok ? '#E3F4E8' : '#FDF1D6'}"/>
    ${s.ok
      ? `<path d="M${M.x + M.w - 27} ${y} l2 2 l4 -4.5" fill="none" stroke="${VERDE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<circle cx="${M.x + M.w - 24}" cy="${y}" r="2" fill="#c9952f"/>`}`
  }).join('')}`

const computadora = `
  <g filter="url(#sombraEquipo)">
    <rect x="${L.x - 12}" y="${L.y - 12}" width="${L.w + 24}" height="${L.h + 24}" rx="16" fill="#12241b"/>
  </g>
  <g clip-path="url(#recorteEscritorio)">
    <rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" fill="#F4F8F5"/>
    <rect x="${L.x}" y="${L.y}" width="${SB}" height="${L.h}" fill="url(#cabecera)"/>
    <circle cx="${L.x + 20}" cy="${L.y + 22}" r="9" fill="#F7F3E7"/>
    ${t(L.x + 17, L.y + 25.5, 9, 800, VERDE, '$')}
    ${t(L.x + 34, L.y + 26, 9.5, 800, '#ffffff', 'Natillerapp')}
    ${menuSvg}
    ${t(M.x + 12, L.y + 28, 12, 800, '#1f2d25', 'Natillera Los Amigos')}
    <rect x="${L.x + L.w - 98}" y="${L.y + 14}" width="86" height="20" rx="10" fill="${VERDE}"/>
    ${t(L.x + L.w - 55, L.y + 27.5, 8.5, 800, '#fff', '+ Registrar cuota', 'text-anchor="middle"')}
    ${tarjetas}
    ${grafica}
    ${listaEsc}
  </g>
  <!-- Base -->
  <path d="M${L.x - 44} ${L.y + L.h + 12} H${L.x + L.w + 44} L${L.x + L.w + 26} ${L.y + L.h + 32} H${L.x - 26} Z" fill="#c9d5cd"/>
  <path d="M${L.x - 44} ${L.y + L.h + 12} H${L.x + L.w + 44} v4 H${L.x - 44} Z" fill="#e2e9e4"/>
  <rect x="${L.x + L.w / 2 - 40}" y="${L.y + L.h + 12}" width="80" height="6" rx="3" fill="#b3c2b8"/>`

/* ---------- Celular, delante de la computadora ---------- */
const P = { x: 646, y: 262, w: 142, h: 318 }
const filasCel = cuotasEsc.slice(0, 4).map((s, i) => {
  const y = P.y + 142 + i * 34
  return `
    <rect x="${P.x + 7}" y="${y}" width="${P.w - 14}" height="29" rx="8" fill="#fff" stroke="#E3ECE5"/>
    <circle cx="${P.x + 20}" cy="${y + 14.5}" r="8" fill="${s.c}"/>
    ${t(P.x + 32, y + 13, 8, 700, '#1f2d25', s.n)}
    ${t(P.x + 32, y + 23, 6.5, 600, GRIS, '$ 100.000')}
    <rect x="${P.x + P.w - (s.ok ? 38 : 48)}" y="${y + 8}" width="${s.ok ? 28 : 38}" height="13" rx="6.5" fill="${s.ok ? '#E3F4E8' : '#FDF1D6'}"/>
    ${t(P.x + P.w - (s.ok ? 24 : 29), y + 17.2, 6.5, 800, s.ok ? VERDE : '#9a6b12', s.ok ? 'Pagó' : 'Pendiente', 'text-anchor="middle"')}`
}).join('')

const celular = `
  <g filter="url(#sombraEquipo)">
    <rect x="${P.x - 8}" y="${P.y - 8}" width="${P.w + 16}" height="${P.h + 16}" rx="28" fill="#12241b"/>
  </g>
  <rect x="${P.x - 8}" y="${P.y - 8}" width="${P.w + 16}" height="${P.h + 16}" rx="28" fill="none" stroke="#3a5a48" stroke-width="1.5"/>
  <g clip-path="url(#recorteCelular)">
    <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="#F4F8F5"/>
    <rect x="${P.x}" y="${P.y}" width="${P.w}" height="104" fill="url(#cabecera)"/>
    ${t(P.x + 12, P.y + 17, 7.5, 800, '#fff', '9:41')}
    ${t(P.x + 11, P.y + 42, 9, 800, '#fff', 'Natillera Los Amigos')}
    ${t(P.x + 11, P.y + 60, 6.5, 800, '#b9f0cc', 'AHORRO DEL GRUPO', 'letter-spacing="0.6"')}
    ${t(P.x + 11, P.y + 80, 17, 800, '#fff', '$ 12.450.000')}
    <rect x="${P.x + 11}" y="${P.y + 89}" width="${P.w - 22}" height="5" rx="2.5" fill="#fff" fill-opacity="0.2"/>
    <rect x="${P.x + 11}" y="${P.y + 89}" width="${(P.w - 22) * 0.72}" height="5" rx="2.5" fill="#f6d77a"/>
    ${t(P.x + 9, P.y + 128, 6.5, 800, GRIS, 'CUOTAS DE OCTUBRE', 'letter-spacing="0.6"')}
    ${filasCel}
    <rect x="${P.x + 9}" y="${P.y + P.h - 38}" width="${P.w - 18}" height="26" rx="13" fill="${VERDE}"/>
    ${t(P.x + P.w / 2, P.y + P.h - 21.5, 8.5, 800, '#fff', '+ Registrar cuota', 'text-anchor="middle"')}
  </g>
  <rect x="${P.x + P.w / 2 - 22}" y="${P.y + 5}" width="44" height="11" rx="5.5" fill="#12241b"/>`

/* ---------- Comunidad: fila de socios bajo la computadora ---------- */
const filaSocios = [0, 1, 2, 3, 4].map(i => avatar(846 + i * 38, 486, 22, GENTE[i], { sombra: false })).join('')
const etiquetaSocios = `
  <rect x="1024" y="466" width="150" height="40" rx="20" fill="#fff" filter="url(#sombraSuave)"/>
  <circle cx="1046" cy="486" r="10" fill="${VERDE}"/>
  <path d="M1041.5 486 l3 3 l5.5 -6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  ${t(1064, 491, 14, 800, VERDE, '18 socios al día')}`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBF8EF"/>
      <stop offset="1" stop-color="#E4F1E7"/>
    </linearGradient>
    <radialGradient id="resplandor" cx="0.76" cy="0.5" r="0.42">
      <stop offset="0" stop-color="#6fcf97" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#6fcf97" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cabecera" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#23734a"/>
      <stop offset="1" stop-color="#14482b"/>
    </linearGradient>
    <linearGradient id="moneda" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe49a"/>
      <stop offset="1" stop-color="#e9b949"/>
    </linearGradient>
    <clipPath id="recorteEscritorio"><rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="6"/></clipPath>
    <clipPath id="recorteCelular"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="21"/></clipPath>
    <filter id="sombraEquipo" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0c2a1b" flood-opacity="0.3"/>
    </filter>
    <filter id="sombraSuave" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#0c2a1b" flood-opacity="0.16"/>
    </filter>
  </defs>

  <rect width="${ANCHO}" height="${ALTO}" fill="url(#fondo)"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#resplandor)"/>
  <!-- Motivo del isotipo: el aro de socios, en grande y muy tenue -->
  <circle cx="920" cy="300" r="300" fill="none" stroke="${VERDE}" stroke-opacity="0.06" stroke-width="40"/>
  <circle cx="920" cy="300" r="250" fill="none" stroke="${VERDE}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round"/>

  ${computadora}
  ${celular}
  ${filaSocios}
  ${etiquetaSocios}

  <!-- Socios sueltos alrededor: la comunidad conectada -->
  ${avatar(676, 150, 28, GENTE[5], { check: true })}
  ${avatar(1162, 88, 26, GENTE[6], { check: true })}
  ${moneda(632, 236, 12)}
  ${moneda(1180, 170, 10)}
  ${moneda(818, 540, 11)}

  <!-- Marca -->
  ${logo}
  ${t(184, 114, 58, 800, VERDE, 'Natillerapp', 'letter-spacing="-0.5"')}

  <!-- Mensaje: ahorro, gestión y multidispositivo -->
  ${t(72, 214, 17, 800, '#2f8a57', 'AHORRO EN GRUPO, SIN CUADERNOS', 'letter-spacing="3.4"')}
  ${t(70, 270, 46, 300, '#0f3d24', 'Gestiona el ahorro', 'letter-spacing="-1"')}
  ${t(70, 324, 46, 800, VERDE, 'de tu natillera', 'letter-spacing="-1"')}
  ${t(70, 378, 46, 800, VERDE, 'desde cualquier lugar', 'letter-spacing="-1"')}
  <text ${TXT} font-weight="400" font-size="21" fill="#3d5247">
    <tspan x="72" y="428">Cuotas, préstamos y rifas con cuentas claras,</tspan>
    <tspan x="72" y="456">en el celular, la tablet o la computadora.</tspan>
  </text>

  <rect x="72" y="492" width="230" height="56" rx="28" fill="${VERDE}"/>
  ${t(187, 527, 21, 800, '#ffffff', 'natillerapp.com', 'text-anchor="middle"')}
</svg>`

async function fuentesMulish() {
  await mkdir(dirFuentes, { recursive: true })
  const rutas = []
  for (const peso of PESOS) {
    const ruta = resolve(dirFuentes, `Mulish-${peso}.ttf`)
    rutas.push(ruta)
    try { await access(ruta); continue } catch {}
    // Sin User-Agent de navegador, Google Fonts responde con TTF (resvg no lee woff2).
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Mulish:wght@${peso}`)).text()
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1]
    if (!url) throw new Error(`No se encontró el TTF de Mulish ${peso}`)
    await writeFile(ruta, Buffer.from(await (await fetch(url)).arrayBuffer()))
  }
  return rutas
}

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: ANCHO },
  font: { fontFiles: await fuentesMulish(), loadSystemFonts: true, defaultFontFamily: 'Mulish' }
}).render().asPng()

const rutaPng = resolve(dirFuentes, 'og.png')
await writeFile(rutaPng, png)
try {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', rutaPng, '-q:v', '2', salida])
  console.log('OK', salida)
} catch {
  const alterna = salida.replace(/\.jpg$/, '.png')
  await writeFile(alterna, png)
  console.warn(`Sin ffmpeg: quedó en PNG (${alterna}). Conviértelo a JPG antes de publicarlo.`)
}

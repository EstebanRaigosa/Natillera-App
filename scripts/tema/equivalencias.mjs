/**
 * Tabla única de equivalencias del modo oscuro (docs/plan-modo-oscuro.md y la
 * skill natillerapp-modo-oscuro). La usan migrar-colores.mjs y
 * revisar-colores.mjs: si cambia una regla, cambia aquí y para los dos.
 *
 * REEMPLAZOS: color fijo de Tailwind → token que en modo claro vale EXACTAMENTE
 * lo mismo. Por eso se pueden aplicar a ciegas: en claro no cambia un píxel.
 *
 * COMPLEMENTOS: colores sin token idéntico en claro (pizarra). No se tocan; se
 * les añade al lado la variante `oscuro:` con el token más cercano.
 */

export const REEMPLAZOS = {
  'bg-white': 'bg-superficie-tarjeta',
  'bg-gray-50': 'bg-superficie-suave',
  'bg-gray-100': 'bg-superficie-hundida',
  'bg-gray-200': 'bg-borde',          // pistas de progreso, separadores rellenos
  'bg-gray-300': 'bg-borde-fuerte',
  'from-white': 'from-superficie-tarjeta',
  'from-gray-50': 'from-superficie-suave',
  'via-gray-50': 'via-superficie-suave',
  'to-gray-50': 'to-superficie-suave',
  'from-gray-100': 'from-superficie-hundida',
  'via-gray-100': 'via-superficie-hundida',
  'to-gray-100': 'to-superficie-hundida',
  'via-white': 'via-superficie-tarjeta',
  'to-white': 'to-superficie-tarjeta',
  'text-gray-900': 'text-texto-fuerte',
  'text-gray-800': 'text-texto',
  'text-gray-700': 'text-texto-medio',
  'text-gray-600': 'text-texto-secundario',
  'text-gray-500': 'text-texto-suave',
  'text-gray-400': 'text-texto-tenue',
  'placeholder-gray-400': 'placeholder-texto-tenue',
  'placeholder-gray-500': 'placeholder-texto-suave',
  'border-gray-100': 'border-borde-suave',
  'border-gray-200': 'border-borde',
  'border-gray-300': 'border-borde-fuerte',
  'divide-gray-100': 'divide-borde-suave',
  'divide-gray-200': 'divide-borde',
  'divide-gray-300': 'divide-borde-fuerte',
  'ring-gray-100': 'ring-borde-suave',
  'ring-gray-200': 'ring-borde',
  'ring-gray-300': 'ring-borde-fuerte',
  'text-[#1b5e37]': 'text-marca-tinta',
  'text-[#1b5e37]': 'text-marca-tinta',
  'bg-[#e8f5e9]': 'bg-marca-suave',
  'from-[#e8f5e9]': 'from-marca-suave',
  'to-[#e8f5e9]': 'to-marca-suave',
  'bg-[#e8f5e9]': 'bg-marca-suave',
}

/** `bg-[#C8D9C8]/70` (velo salvia) es el token completo, con su opacidad. */
export const REEMPLAZOS_LITERALES = {
  // Velo del natiscroll: en claro vale exactamente lo mismo
  'from-white/88 via-white/40': 'from-superficie-tarjeta/88 via-superficie-tarjeta/40',
  'bg-[#C8D9C8]/70': 'bg-velo-modal',
  'bg-[#c8d9c8]/70': 'bg-velo-modal',
}

export const COMPLEMENTOS = {
  'text-slate-900': 'text-texto-fuerte',
  'text-slate-800': 'text-texto',
  'text-slate-700': 'text-texto-medio',
  'text-slate-600': 'text-texto-secundario',
  'text-slate-500': 'text-texto-suave',
  'text-slate-400': 'text-texto-tenue',
  'bg-slate-50': 'bg-superficie-suave',
  'bg-slate-100': 'bg-superficie-hundida',
  'border-slate-100': 'border-borde-suave',
  'border-slate-200': 'border-borde',
  'border-slate-300': 'border-borde-fuerte',
  'border-l-slate-200': 'border-l-borde',
  'border-l-slate-300': 'border-l-borde-fuerte',
  'divide-slate-100': 'divide-borde-suave',
  'divide-slate-200': 'divide-borde',
  'bg-slate-200': 'bg-borde',
  'from-slate-50': 'from-superficie-suave',
  'via-slate-50': 'via-superficie-suave',
  'to-slate-50': 'to-superficie-suave',
  'from-slate-100': 'from-superficie-hundida',
  'to-slate-100': 'to-superficie-hundida',
  'text-gray-300': 'text-texto-tenue',
  'text-slate-300': 'text-texto-tenue',
  'ring-slate-200': 'ring-borde',
  'ring-slate-300': 'ring-borde-fuerte',
  'ring-slate-400': 'ring-borde-fuerte',
  // Verdes oscuros de marca usados como TEXTO sobre una superficie: en oscuro no se leen
  'text-[#166534]': 'text-marca-tinta',
  'text-[#14532d]': 'text-marca-tinta',
  'text-[#3d6b28]': 'text-marca-tinta',
  'text-[#3f6212]': 'text-marca-tinta',
  'text-[#15803d]': 'text-marca-texto',
  'border-[#166534]': 'border-marca-tinta',
  'border-[#1b5e37]': 'border-marca-tinta',
  'text-[#c2185b]': 'text-pink-300',
  'bg-[#ecfdf5]': 'bg-exito-suave',
  // Hex que equivalen a colores de Tailwind: misma regla cromática
  'text-[#b91c1c]': 'text-red-300',
  'text-[#b91c1c]': 'text-red-300',
  'text-[#1e3a5f]': 'text-sky-300',
  'bg-[#f0fdf4]': 'bg-green-500/15',
  'bg-[#dcfce7]': 'bg-green-500/15',
  'bg-[#fef2f2]': 'bg-red-500/15',
  'bg-[#fffbeb]': 'bg-amber-500/15',
  'border-[#1e3a5f]': 'border-sky-500/30',
  // Verdes pálidos de marca usados como fondo de fila o tarjeta
  'bg-[#f2f8f3]': 'bg-marca-suave',
  'bg-[#f4faf5]': 'bg-marca-suave',
  'bg-[#f6faf7]': 'bg-superficie-suave',
  'bg-[#fafcfa]': 'bg-superficie-suave',
  'bg-[#f4f8f5]': 'bg-superficie-suave',
  'bg-[#eef2ee]': 'bg-superficie-hundida',
  'bg-[#f6fbf7]': 'bg-superficie-suave',
  'bg-[#eef4ee]': 'bg-superficie-hundida',
  'border-[#c8d9c8]': 'border-borde',
  'to-[#f3faf4]': 'to-superficie-suave',
  'text-gray-200': 'text-texto-tenue',
  'from-[#eef2ee]': 'from-superficie-hundida',
  'via-[#eef2ee]': 'via-superficie-hundida',
  'to-[#eef2ee]': 'to-superficie-hundida',
  'border-[#e8f5e9]': 'border-borde',
  // Colores de marca por variable usados como TEXTO: en oscuro no se leen
  'text-[color:var(--brand-primary)]': 'text-marca-tinta',
  'text-[color:var(--brand-success)]': 'text-exito',
  'text-[color:var(--brand-warning)]': 'text-alerta',
  'text-[color:var(--brand-danger)]': 'text-peligro',
  'text-[color:var(--brand-info)]': 'text-info',
  // Neutros y verdes en hsl() del sistema de diseño (modal «Crear natillera», estados vacíos)
  'text-[hsl(220_12%_26%)]': 'text-texto-medio',
  'text-[hsl(220_14%_14%)]': 'text-texto-fuerte',
  'text-[hsl(215_18%_38%)]': 'text-texto-secundario',
  'text-[hsl(152_52%_32%)]': 'text-marca-tinta',
  'bg-[hsl(120_8%_88%)]': 'bg-borde',
  'border-[hsl(120_8%_88%)]': 'border-borde',
  'border-[hsl(120_8%_82%)]': 'border-borde-fuerte',
  'bg-[hsl(120_12%_97%)]': 'bg-superficie-suave',
  'bg-[hsl(120_10%_94%)]': 'bg-superficie-hundida',
}

/**
 * Fondos con el verde de marca (y sus degradados): son la identidad y van igual
 * en los dos modos, con texto blanco encima. El revisor no los marca.
 */
/**
 * Grises sólidos medios y oscuros como fondo (puntos, chips oscuros con texto
 * blanco, degradados de avatar): se leen igual en los dos modos. Permitidos.
 */
export const GRISES_SOLIDOS = /^(bg|from|via|to)-(gray|slate)-[4-9]00$/

/** Hex de los verdes de marca (para el CSS: fondos, bordes y contornos de marca no cambian). */
export const HEX_DE_MARCA = ['1b5e37', '166534', '145a2d', '124a2c', '154a2d', '124228', '12331f', '0f3d22', '134d2b', '155a32', '1f6b40', '164a2c', '123a23']

export const FONDOS_DE_MARCA = /^(bg|from|via|to|ring|outline)-\[#(1B5E37|166534|145a2d|124a2c|154a2d|124228|12331f|0f3d22|134d2b|155a32|1f6b40|164a2c|123a23|1e3a5f)\]$|^(bg|from|via|to|ring|outline)-\[hsl\(15[0-5]_[4-7]\d%_[12]\d%\)\]$/i

/**
 * Colores de estado y acento (emerald, amber, red, sky…, también natillera y
 * accent): no tienen token exacto en claro, así que se conservan y se les añade
 * un `oscuro:` con la misma regla en toda la app:
 *   fondo pastel  c-50 / c-100        → oscuro:bg-c-500/15   (en hover/active: /25, para que se note)
 *                 c-200               → oscuro:bg-c-500/25
 *   texto         c-600 … c-900       → oscuro:text-c-300
 *   borde         c-100 … c-300       → oscuro:border-c-500/30
 *   aro           ring-c-100 … 300    → oscuro:ring-c-500/30
 *   degradado     from-c-50…200       → oscuro:from-c-500/15
 *                 via-/to-c-50…200    → oscuro:via-c-500/10, oscuro:to-c-500/10
 * Los tonos sólidos (botones c-500/600 con texto blanco) no cambian.
 */
export const CROMATICOS = 'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|natillera|accent'
const RE_CROMATICO = new RegExp(`^(bg|text|border|ring|from|via|to)-(${CROMATICOS})-(\\d{2,3})$`)

/** Fondo cromático sólido (tono 200 o más, sin opacidad): no cambia en oscuro. */
export const RE_FONDO_SOLIDO = new RegExp(`(?:^|[\\s"'\`])bg-(?:${CROMATICOS})-(?:[2-9]00|950)(?![\\w/-])`)

export function complementoCromatico(base) {
  const m = base.match(RE_CROMATICO)
  if (!m) return null
  const [, propiedad, color, tono] = m
  const t = Number(tono)
  if (propiedad === 'bg' && (t === 50 || t === 100)) return `bg-${color}-500/15`
  if (propiedad === 'bg' && t === 200) return `bg-${color}-500/25`
  if (propiedad === 'text' && t >= 600) return `text-${color}-300`
  if (propiedad === 'border' && t >= 100 && t <= 300) return `border-${color}-500/30`
  if (propiedad === 'ring' && t >= 100 && t <= 300) return `ring-${color}-500/30`
  if (propiedad === 'from' && t <= 200) return `from-${color}-500/15`
  if ((propiedad === 'via' || propiedad === 'to') && t <= 200) return `${propiedad}-${color}-500/10`
  return null
}

/**
 * Una clase de Tailwind dentro de un texto: prefijos de variante (`hover:`,
 * `sm:`, `group-hover:`…), `!` opcional, la clase y un `/NN` de opacidad opcional.
 * Grupo 1 = variantes, 2 = importante, 3 = clase base, 4 = opacidad.
 */
export const RE_CLASE = new RegExp(
  String.raw`(?<=^|[\s"'${'`'}{(,\[])((?:[a-z0-9-]+:|\[[^\]\s]+\]:)*)(!?)((?:bg|text|border(?:-[lrtbxy])?|divide|ring|from|via|to|placeholder)-(?:white|black|gray-\d{2,3}|slate-\d{2,3}|(?:${CROMATICOS})-\d{2,3}|\[#[0-9a-fA-F]{3,8}\]|\[(?:hsla?|rgba?)\([^\]\s]*\)\]|\[color:var\(--brand-[a-z-]+\)\]))(\/(?:\d{1,3}|\[[^\]]+\]))?(?=$|[\s"'${'`'}},)\]])`,
  'gm'
)

/** Neutros fijos que no deben quedar en una vista migrada (salvo `tema-fijo`). */
export const NEUTROS_PROHIBIDOS = /^(bg|text|border|divide|ring|from|via|to)-(white|gray-\d{2,3}|slate-\d{2,3})$/

/** Los hex se comparan sin distinguir mayúsculas: `bg-[#E8F5E9]` = `bg-[#e8f5e9]`. */
function normalizar(base) {
  return base.replace(/\[#([0-9a-fA-F]{3,8})\]/, (_, h) => `[#${h.toLowerCase()}]`)
}

/** Token que reemplaza a la clase (igual en claro), o null. */
export function reemplazoDe(base) {
  return REEMPLAZOS[base] || REEMPLAZOS[normalizar(base)] || null
}

/**
 * Lo que se añade como `oscuro:` a una clase sin token exacto, o null.
 * `traeOpacidad`: el complemento ya fija la suya (/15, /30) y no hereda la del claro.
 */
export function complementoDe(base) {
  const valor = COMPLEMENTOS[base] || COMPLEMENTOS[normalizar(base)] || complementoCromatico(base)
  if (!valor) return null
  return { valor, traeOpacidad: valor.includes('/') }
}

/** El texto entre comillas que contiene la posición: la lista de clases del elemento. */
export function mismaClase(texto, pos) {
  // La comilla más cercana hacia atrás (", ' o `) y su pareja hacia delante: en JS
  // las clases van en strings con comilla simple, y cada string es una lista aparte.
  let antes = -1
  for (const q of ['"', "'", '`']) antes = Math.max(antes, texto.lastIndexOf(q, pos - 1))
  if (antes < 0) return ''
  const despues = texto.indexOf(texto[antes], pos)
  if (despues < 0) return ''
  return texto.slice(antes + 1, despues)
}

/**
 * ¿La línea `n` está dentro de una cabecera de marca y es un círculo o recuadro
 * pequeño (icono de la cabecera)? Heurística: hay un fondo verde de marca en las
 * 14 líneas anteriores y la clase tiene forma de icono (redondeado, 8–12 de lado).
 */
export function enCabeceraDeMarca(lineas, n, clase) {
  if (!/rounded-(full|xl|2xl|lg)/.test(clase) || !/\b(w|h)-(8|9|10|11|12|\[3\.2rem\]|\[2\.75rem\])\b/.test(clase)) return false
  const MARCA = /bg-\[#(1B5E37|166534)\]|from-\[#166534\]|bg-marca(?![\w-])|app-shell-nav-bg|bg-\[(?:color:)?var\(--brand-primary\)\]/i
  // El fondo de marca tiene que ser un ANCESTRO todavía abierto, no un hermano que
  // ya se cerró (p. ej. el icono verde de ds-page-header junto a un botón de superficie).
  for (let b = n - 1; b >= Math.max(0, n - 20); b--) {
    if (!MARCA.test(lineas[b])) continue
    const tramo = lineas.slice(b, n).join('\n')
    const abre = (tramo.match(/<(div|header|section|span|button|a)\b(?![^>]*\/>)/g) || []).length
    const cierra = (tramo.match(/<\/(div|header|section|span|button|a)>/g) || []).length
    if (abre > cierra) return true
  }
  return false
}

/** Separa el <style> del resto: los scripts no tocan CSS scoped. */
export function partesDelArchivo(texto) {
  const partes = []
  // Solo los <style> del componente (a inicio de línea): un "<style>" dentro de un
  // texto de JavaScript (HTML que se exporta) no es CSS del componente.
  const re = /^<style[\s\S]*?^<\/style>/gm
  let ultimo = 0
  let m
  while ((m = re.exec(texto))) {
    partes.push({ esEstilo: false, texto: texto.slice(ultimo, m.index) })
    partes.push({ esEstilo: true, texto: m[0] })
    ultimo = m.index + m[0].length
  }
  partes.push({ esEstilo: false, texto: texto.slice(ultimo) })
  return partes
}

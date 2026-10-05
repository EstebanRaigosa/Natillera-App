#!/usr/bin/env node
/**
 * Propone el bloque «Modo oscuro» del <style> de un componente.
 *
 *   node scripts/tema/proponer-oscuro.mjs src/views/socios/Socios.vue            → imprime la propuesta
 *   node scripts/tema/proponer-oscuro.mjs --aplicar src/views/socios/Socios.vue  → la añade al final del <style>
 *
 * Recorre cada regla con colores fijos y traduce cada color a su token según lo
 * que es (skill natillerapp-modo-oscuro, regla 5):
 *   - texto oscuro neutro → --texto-fuerte / --texto / --texto-secundario / --texto-suave / --texto-tenue
 *   - texto oscuro con tono → verde → --marca-tinta; rojo → --peligro; ámbar → --alerta; azul → --info;
 *     otros → el mismo color aclarado (color-mix con blanco)
 *   - fondo blanco o casi → --superficie-tarjeta; gris claro → --superficie-suave / --superficie-hundida
 *   - fondo pastel con tono → --marca-suave / --peligro-suave / --alerta-suave / --info-suave
 *   - borde claro → --borde (o el -borde del estado); divisor oscuro translúcido → blanco translúcido
 * No toca lo que ya vale en oscuro: blancos como texto, fondos saturados u oscuros (botones y
 * marca), sombras, ni las reglas dentro de un rango tema-fijo.
 *
 * Es una PROPUESTA: hay que leerla. No sabe si un blanco va sobre el verde de marca
 * (entonces se queda) ni si un selector compuesto necesita el mismo compuesto.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'

const args = process.argv.slice(2)
const aplicar = args.includes('--aplicar')
const archivo = args.find((a) => !a.startsWith('--'))
if (!archivo) {
  console.error('Uso: node scripts/tema/proponer-oscuro.mjs [--aplicar] <archivo.vue>')
  process.exit(1)
}

// ── Colores ────────────────────────────────────────────────────────────────
const NOMBRES = { white: [255, 255, 255], black: [0, 0, 0] }

function aRgb(texto) {
  const t = texto.trim().toLowerCase()
  if (NOMBRES[t]) return { rgb: NOMBRES[t], a: 1 }
  let m = t.match(/^#([0-9a-f]{3,8})$/)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('')
    const n = (i) => parseInt(h.slice(i, i + 2), 16)
    return { rgb: [n(0), n(2), n(4)], a: h.length === 8 ? n(6) / 255 : 1 }
  }
  m = t.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/)
  if (m) return { rgb: [+m[1], +m[2], +m[3]], a: alfa(m[4]) }
  m = t.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/)
  if (m) return { rgb: hslARgb(+m[1], +m[2] / 100, +m[3] / 100), a: alfa(m[4]) }
  return null
}
function alfa(v) {
  if (v == null) return 1
  return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v)
}
function hslARgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60
  return { h, s, l }
}
function familia(h) {
  if (h < 15 || h >= 340) return 'peligro'
  if (h < 50) return 'alerta'
  if (h < 175) return 'marca'
  if (h < 250) return 'info'
  return 'otro'
}

/** Token oscuro para un color, según el papel de la propiedad; null = se queda. */
function traducir(valor, papel) {
  const c = aRgb(valor)
  if (!c) return null
  const { h, l } = hsl(c.rgb)
  // Croma (no saturación HSL): los grises pizarra (#0f172a, #94a3b8) tienen saturación
  // alta pero casi nada de color. Por debajo de ~0.18 se tratan como neutros.
  const croma = (Math.max(...c.rgb) - Math.min(...c.rgb)) / 255
  const neutro = croma < 0.18 || (l > 0.92 && croma < 0.12)

  // Translúcido sobre lo que haya detrás
  if (c.a < 1) {
    // Con color (p. ej. rgba(27, 94, 55, .18), un borde verde de marca): a su token de estado
    if (croma >= 0.18 && c.a <= 0.5) {
      const f = familia(h)
      if (papel === 'borde') return f === 'marca' ? 'var(--marca-tinta-borde)' : f === 'otro' ? null : `var(--${f}-borde)`
      if (papel === 'fondo') return f === 'otro' ? null : `var(--${f === 'marca' ? 'marca' : f}-suave)`
      return null
    }
    // Divisores y hovers oscuros translúcidos → blanco translúcido algo más tenue (el blanco pesa más)
    if (l < 0.3 && c.a <= 0.25) return `rgb(255 255 255 / ${+(Math.max(0.04, c.a * 0.6)).toFixed(2)})`
    if (l > 0.85 && papel === 'fondo' && c.a >= 0.6) {
      // Pastel translúcido con tono (rgba(254, 243, 199, .7), aviso ámbar): su estado
      if (croma >= 0.03 && !(h >= 190 && h < 230 && croma < 0.1)) {
        const f = familia(h)
        if (f !== 'otro') return `var(--${f}-suave)`
      }
      return `color-mix(in oklab, var(--superficie-tarjeta) ${Math.round(c.a * 100)}%, transparent)`
    }
    return null
  }

  if (papel === 'texto') {
    if (l > 0.85) return null // texto claro: va sobre algo oscuro o de marca
    if (neutro) {
      if (l < 0.2) return 'var(--texto-fuerte)'
      if (l < 0.3) return 'var(--texto)'
      if (l < 0.4) return 'var(--texto-medio)'
      if (l < 0.5) return 'var(--texto-secundario)'
      if (l < 0.62) return 'var(--texto-suave)'
      return 'var(--texto-tenue)'
    }
    const f = familia(h)
    if (f === 'marca') return 'var(--marca-tinta)'
    if (f === 'peligro') return 'var(--peligro)'
    if (f === 'alerta') return 'var(--alerta)'
    if (f === 'info') return 'var(--info)'
    return `color-mix(in oklab, ${valor} 55%, #fff)`
  }

  if (papel === 'fondo') {
    if (l < 0.75) return null // fondos saturados u oscuros (botones, marca): igual en los dos modos
    // Pasteles casi blancos: un verdoso con algo de croma es un tinte de marca a
    // propósito (#f0f7f2), pero los grises fríos (pizarra, tono 190–230) son neutros.
    const verdoso = h >= 90 && h < 175 && croma >= 0.02
    // #fef2f2 (rojo 50) tiene croma 0,047: el umbral baja a 0,03 salvo en los grises fríos
    const tinteDeEstado = croma >= 0.03 && !(h >= 190 && h < 230 && croma < 0.1)
    if (verdoso) return 'var(--marca-suave)'
    if (tinteDeEstado) {
      const f = familia(h)
      return f === 'otro' ? `color-mix(in oklab, ${valor} 14%, var(--superficie-tarjeta))` : `var(--${f}-suave)`
    }
    // Neutro: por luminosidad
    if (l >= 0.985) return 'var(--superficie-tarjeta)'
    if (l >= 0.955) return 'var(--superficie-suave)'
    if (l >= 0.9) return 'var(--superficie-hundida)'
    return 'var(--borde)'
  }

  if (papel === 'borde') {
    // Bordes saturados (de estado o acento, #ec4899): se ven igual sobre oscuro
    if (l < 0.6 || croma >= 0.4) return null
    if (neutro) return l >= 0.88 ? 'var(--borde)' : 'var(--borde-fuerte)'
    const f = familia(h)
    if (f === 'marca') return 'var(--marca-tinta-borde)'
    return f === 'otro' ? 'var(--borde-fuerte)' : `var(--${f}-borde)`
  }
  return null
}

const RE_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\bwhite\b/g

function papelDe(prop) {
  if (/^(color|fill|stroke|caret-color|-webkit-text-fill-color)$/.test(prop)) return 'texto'
  if (/^background(-color|-image)?$/.test(prop)) return 'fondo'
  if (/^(border|outline)(-[a-z]+)*$/.test(prop) && !/radius|width|style|collapse|spacing|image/.test(prop)) return 'borde'
  return null
}

// ── Recorrido del <style> ─────────────────────────────────────────────────
const fuente = readFileSync(archivo, 'utf8')
// Solo el <style> del componente, a inicio de línea (no un "<style>" dentro de JS)
const m = fuente.match(/^<style[^>]*>([\s\S]*?)^<\/style>/m)
if (!m) {
  console.error('Sin <style>')
  process.exit(1)
}
const css = m[1]

// Rangos tema-fijo-inicio/fin: se excluyen por posición
const rangos = []
{
  const re = /tema-fijo-inicio[\s\S]*?(tema-fijo-fin|$)/g
  let r
  while ((r = re.exec(css))) rangos.push([r.index, r.index + r[0].length])
}
const enRango = (pos) => rangos.some(([a, b]) => pos >= a && pos <= b)

const raiz = postcss.parse(css)
const salida = []

raiz.walkRules((regla) => {
  if (/data-tema/.test(regla.selector)) return
  if (regla.parent?.type === 'atrule' && /keyframes/.test(regla.parent.name)) return
  const inicio = regla.source?.start?.offset ?? 0
  if (enRango(inicio)) return

  const cambios = []
  regla.walkDecls((d) => {
    if (d.parent !== regla) return
    const papel = papelDe(d.prop)
    if (!papel) return
    // tema-fijo en un comentario de la misma regla o justo antes de la declaración
    const previo = d.prev()
    if (previo?.type === 'comment' && /tema-fijo/.test(previo.text)) return
    const siguiente = d.next()
    if (siguiente?.type === 'comment' && /tema-fijo/.test(siguiente.text) && siguiente.source?.start?.line === d.source?.start?.line) return
    let cambio = false
    // Colores de marca por variable: no cambian solos en oscuro (sirven de fondo de botones).
    // Como TEXTO o BORDE sí hay que traducirlos.
    const MARCA_VAR = { 'brand-primary': 'marca-tinta', 'brand-success': 'exito', 'brand-warning': 'alerta', 'brand-danger': 'peligro', 'brand-info': 'info' }
    if (papel === 'texto' || papel === 'borde') {
      const conMarca = d.value.replace(/var\(--(brand-(?:primary|success|warning|danger|info))(?:\s*,[^)]*)?\)/g, (_, v) =>
        `var(--${papel === 'borde' && v === 'brand-primary' ? 'marca-tinta-borde' : MARCA_VAR[v]})`)
      if (conMarca !== d.value) {
        cambios.push(`${d.prop}: ${conMarca.replace(/\s*!important/, '')}${d.important ? ' !important' : ''};`)
        return
      }
    }
    // Los `var(--x, #fallback)` ya dependen de una variable: no se tocan sus fallbacks
    const protegidos = []
    const valor = d.value.replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, (v) => {
      protegidos.push(v)
      return `\u0000${protegidos.length - 1}\u0000`
    })
    const nuevo = valor.replace(RE_COLOR, (color) => {
      const t = traducir(color, papel)
      if (!t) return color
      cambio = true
      return t
    })
    const final = nuevo.replace(/\u0000(\d+)\u0000/g, (_, i) => protegidos[+i])
    if (cambio && final !== d.value) cambios.push(`${d.prop}: ${final.replace(/\s*!important/, '')}${d.important ? ' !important' : ''};`)
  })
  if (!cambios.length) return

  // Como las reglas globales: fuera de los bloques forzados a claro (comprobantes).
  // El :not() va antes de un pseudo-elemento (::before, ::placeholder).
  const selectores = regla.selectors
    .map((sel) => {
      const [base, ...pseudo] = sel.trim().split('::')
      const resto = pseudo.length ? `::${pseudo.join('::')}` : ''
      return `:where([data-tema=oscuro]) ${base}:not(:where([data-tema=claro] *))${resto}`
    })
    .join(',\n')
  let texto = `${selectores} {\n  ${cambios.join('\n  ')}\n}`
  // Reconstruye los @media / @supports que envuelven la regla
  let p = regla.parent
  while (p && p.type === 'atrule') {
    if (!/keyframes/.test(p.name)) texto = `@${p.name} ${p.params} {\n${texto.replace(/^/gm, '  ')}\n}`
    p = p.parent
  }
  salida.push(texto)
})

if (!salida.length) {
  console.log(`${archivo}: nada que proponer`)
  process.exit(0)
}

const bloque = `
/* ==========================================================================
   Modo oscuro (skill natillerapp-modo-oscuro). Propuesto con
   scripts/tema/proponer-oscuro.mjs y revisado a mano. Solo lo que cambia: las
   reglas de claro de arriba quedan intactas.
   ========================================================================== */
${salida.join('\n')}
`
if (!aplicar) {
  console.log(bloque)
  console.error(`\n${salida.length} reglas propuestas para ${archivo}`)
  process.exit(0)
}
// Si ya hay un bloque propuesto antes, se reemplaza (no se acumulan dos)
let base = fuente
// Un bloque de oscuro escrito a mano (sin la marca de esta herramienta) no se toca:
// añadir otro encima duplicaría reglas que compiten. Se puede forzar con --forzar.
if (!fuente.includes('Propuesto con\n   scripts/tema/proponer-oscuro.mjs') && /\[data-tema=oscuro\]/.test(css) && !args.includes('--forzar')) {
  console.error(`${archivo}: ya tiene un bloque de oscuro escrito a mano; no se aplica (usa --forzar si de verdad quieres añadir la propuesta)`)
  process.exit(1)
}
const marca = base.indexOf('Propuesto con\n   scripts/tema/proponer-oscuro.mjs')
if (marca >= 0) {
  const inicioBloque = base.lastIndexOf('/* ====', marca)
  const finBloque = base.indexOf('</style>', marca)
  base = base.slice(0, inicioBloque).replace(/\n+$/, '\n') + base.slice(finBloque)
}
const fin = base.search(/^<\/style>/m) >= 0 ? base.lastIndexOf('\n</style>') + 1 : base.lastIndexOf('</style>')
writeFileSync(archivo, base.slice(0, fin) + bloque + base.slice(fin))
console.log(`${archivo}: ${salida.length} reglas añadidas al final del <style>`)

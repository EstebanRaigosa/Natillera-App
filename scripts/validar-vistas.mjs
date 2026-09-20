/**
 * Validador estático de componentes .vue
 *
 * `vite build` compila plantillas sin comprobar que los identificadores que usan
 * existan: un icono sin importar o una función declarada después de usarse pasan
 * el build y revientan en el navegador. Ya ha ocurrido dos veces en este
 * proyecto. Esto lo detecta antes.
 *
 * Uso: node scripts/validar-vistas.mjs [ruta...]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const raices = process.argv.slice(2).length ? process.argv.slice(2) : ['src']

function archivos(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    const st = statSync(p)
    if (st.isDirectory()) archivos(p, acc)
    else if (extname(p) === '.vue') acc.push(p)
  }
  return acc
}

// Nombres que el compilador de Vue resuelve solo o que vienen del entorno.
const GLOBALES = new Set([
  'true','false','null','undefined','Math','Date','JSON','Object','Array','String','Number',
  'Boolean','console','window','document','navigator','localStorage','sessionStorage','Intl',
  'parseInt','parseFloat','isNaN','encodeURIComponent','decodeURIComponent','Promise','Set','Map',
  '$event','$slots','$attrs','$refs','item','index','key','value','i','n','e','el','$el','props',
  // Integrados del compilador de Vue y utilidades que la plantilla siempre tiene.
  '$emit','Teleport','Transition','TransitionGroup','KeepAlive','Suspense','component','slot','template',
])

let problemas = 0
const lista = raices.flatMap(r => statSync(r).isDirectory() ? archivos(r) : [r])

for (const ruta of lista) {
  const src = readFileSync(ruta, 'utf8')
  const mTpl = src.match(/<template>([\s\S]*)<\/template>/)
  const mScr = src.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)
  if (!mTpl || !mScr) continue
  const tpl = mTpl[1], scr = mScr[1]

  // Lo que el script pone a disposición de la plantilla.
  const definidos = new Set()
  for (const re of [
    /(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g,
    /import\s+([A-Za-z_$][\w$]*)\s+from/g,
    /import\s*\{([^}]+)\}/g,
    /\bas\s+([A-Za-z_$][\w$]*)/g,
    /(?:const|let)\s*\{([^}]+)\}\s*=/g,
    /(?:const|let)\s*\[([^\]]+)\]\s*=/g,
  ]) {
    for (const m of scr.matchAll(re)) {
      m[1].split(',').forEach(t => {
        const nombre = t.split(':').pop().split('=')[0].replace(/\.\.\./, '').trim()
        if (/^[A-Za-z_$][\w$]*$/.test(nombre)) definidos.add(nombre)
      })
    }
  }
  // Las props declaradas con defineProps también están disponibles en la
  // plantilla aunque no aparezcan como `const` en ningún sitio.
  for (const m of scr.matchAll(/defineProps\s*(?:<[^>]*>)?\s*\(\s*\{([\s\S]*?)\n\s*\}\s*\)/g)) {
    for (const linea of m[1].split('\n')) {
      const nombre = linea.match(/^\s*([A-Za-z_$][\w$]*)\s*:/)
      if (nombre) definidos.add(nombre[1])
    }
  }
  for (const m of scr.matchAll(/defineProps\s*\(\s*\[([^\]]*)\]/g)) {
    m[1].split(',').forEach(t => {
      const nombre = t.replace(/['"`]/g, '').trim()
      if (/^[A-Za-z_$][\w$]*$/.test(nombre)) definidos.add(nombre)
    })
  }

  // Alias de v-for y v-slot: existen solo dentro de la plantilla.
  for (const m of tpl.matchAll(/v-for="\(?\s*([^)"\s,]+)/g)) definidos.add(m[1].trim())
  for (const m of tpl.matchAll(/v-for="\(?\s*\{([^}]+)\}/g)) {
    m[1].split(',').forEach(t => definidos.add(t.split(':').pop().trim()))
  }
  for (const m of tpl.matchAll(/v-for="\([^)]*,\s*([^),\s]+)/g)) definidos.add(m[1].trim())
  for (const m of tpl.matchAll(/#\w+="\{?\s*([^}"\s,]+)/g)) definidos.add(m[1].trim())
  for (const m of tpl.matchAll(/v-slot[:\w]*="\{?\s*([^}"\s,]+)/g)) definidos.add(m[1].trim())

  // Componentes usados en la plantilla (PascalCase).
  const faltan = new Set()
  for (const m of tpl.matchAll(/<([A-Z][\w]*)[\s/>]/g)) {
    if (!definidos.has(m[1]) && !GLOBALES.has(m[1])) faltan.add(m[1])
  }
  // Identificadores dentro de interpolaciones y bindings.
  const expresiones = [
    ...[...tpl.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]),
    ...[...tpl.matchAll(/(?::|v-if=|v-else-if=|v-show=|@[\w.]+=)"([^"]+)"/g)].map(m => m[1]),
  ]
  // Parámetros de funciones flecha escritas dentro de la plantilla:
  // `lista.reduce((sum, x) => ...)` define `sum` ahí mismo.
  for (const expr of expresiones) {
    for (const m of expr.matchAll(/\(([^)]*)\)\s*=>/g)) {
      m[1].split(',').forEach(t => {
        const nombre = t.replace(/[{}]/g, '').split(':').pop().trim()
        if (/^[A-Za-z_$][\w$]*$/.test(nombre)) definidos.add(nombre)
      })
    }
    for (const m of expr.matchAll(/([A-Za-z_$][\w$]*)\s*=>/g)) definidos.add(m[1])
  }

  for (const expr of expresiones) {
    // Se descartan accesos a propiedad (.algo), cadenas y claves de objeto.
    const limpio = expr.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '').replace(/\.\s*[\w$]+/g, '')
    for (const m of limpio.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*(?![\w$]*\s*:)/g)) {
      const id = m[1]
      if (!definidos.has(id) && !GLOBALES.has(id) &&
          !/^(in|of|new|typeof|instanceof|return|await|if|else|const|let|var|function|do|while|for)$/.test(id) &&
          id.length > 2) {
        faltan.add(id)
      }
    }
  }

  if (faltan.size) {
    problemas++
    console.log(`\n  ${ruta}`)
    console.log(`    sin definir: ${[...faltan].sort().join(', ')}`)
  }
}

console.log(problemas ? `\n${problemas} archivo(s) con identificadores sin resolver` : `\nok: ${lista.length} componentes sin identificadores sin resolver`)
process.exit(problemas ? 1 : 0)

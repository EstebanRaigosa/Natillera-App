#!/usr/bin/env node
/**
 * Paso mecánico de la migración al modo oscuro de una vista o componente.
 *
 *   node scripts/tema/migrar-colores.mjs src/views/Dashboard.vue [otro.vue …]
 *   node scripts/tema/migrar-colores.mjs --simular src/views/Dashboard.vue
 *
 * Hace SOLO lo que es seguro hacer a ciegas (ver equivalencias.mjs):
 *   1. Grises y blancos fijos → token idéntico en claro (bg-white → bg-superficie-tarjeta).
 *   2. Pizarra, verdes de texto y colores de estado → se conservan y se les añade
 *      su `oscuro:` (text-slate-500 oscuro:text-texto-suave, bg-red-50 oscuro:bg-red-500/15).
 *
 * No toca: el CSS <style>, `bg-white/NN` translúcidos (suelen ir sobre verde),
 * text-white, tonos sólidos (botones bg-emerald-600) ni hex arbitrarios. Eso
 * es la parte manual, y la lista revisar-colores.mjs. Es idempotente: correrlo
 * dos veces no duplica nada.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { RE_CLASE, RE_FONDO_SOLIDO, REEMPLAZOS_LITERALES, complementoDe, enCabeceraDeMarca, mismaClase, partesDelArchivo, reemplazoDe } from './equivalencias.mjs'

const args = process.argv.slice(2)
const simular = args.includes('--simular')
const archivos = args.filter((a) => !a.startsWith('--'))
if (!archivos.length) {
  console.error('Uso: node scripts/tema/migrar-colores.mjs [--simular] <archivo.vue> [...]')
  process.exit(1)
}

function migrarTexto(texto) {
  let cambios = 0
  for (const [antes, despues] of Object.entries(REEMPLAZOS_LITERALES)) {
    const n = texto.split(antes).length - 1
    if (n) { texto = texto.split(antes).join(despues); cambios += n }
  }
  // Excepciones deliberadas: la misma regla que el revisor (`tema-fijo` en la
  // línea o en la anterior). Sin esto, correr el script otra vez deshacía los
  // círculos blancos de las cabeceras de marca.
  const lineas = texto.split('\n')
  const inicios = []
  lineas.reduce((pos, l) => { inicios.push(pos); return pos + l.length + 1 }, 0)
  const lineaDe = (pos) => {
    let bajo = 0
    let alto = inicios.length - 1
    while (bajo < alto) {
      const medio = (bajo + alto + 1) >> 1
      if (inicios[medio] <= pos) bajo = medio
      else alto = medio - 1
    }
    return bajo
  }
  const exenta = (pos) => {
    const n = lineaDe(pos)
    // La línea, o un comentario tema-fijo en las 3 anteriores (el elemento y su icono)
    return [0, 1, 2, 3].some((k) => /tema-fijo/.test(lineas[n - k] || ''))
  }

  texto = texto.replace(RE_CLASE, (todo, variantes, imp, base, opacidad = '', desplazamiento, completo) => {
    if (exenta(desplazamiento)) return todo
    const clase = mismaClase(completo, desplazamiento)
    const reemplazo = reemplazoDe(base)
    if (reemplazo) {
      // Blanco translúcido (bg-white/NN, from-white/[0.13]…): casi siempre es un brillo
      // sobre el verde de marca. Se deja; el revisor lo lista para decidirlo a mano.
      if (/-white$/.test(base) && opacidad) return todo
      // Círculo o recuadro blanco con icono verde en una cabecera de marca: se queda
      // blanco (y su icono verde). El revisor pide marcarlo con tema-fijo.
      if (enCabeceraDeMarca(lineas, lineaDe(desplazamiento), clase) && /^(bg-white|text-\[#1b5e37\])$/i.test(base)) return todo
      cambios++
      return `${variantes}${imp}${reemplazo}${opacidad}`
    }
    // Ya es un `oscuro:` (o va dentro de uno): no se complementa a sí mismo
    if (variantes.includes('oscuro:')) return todo
    const oscuro = complementoDe(base)
    if (oscuro) {
      // Texto sobre un fondo cromático sólido (chip bg-amber-300 text-amber-950): el
      // fondo no cambia en oscuro, así que el texto tampoco debe cambiar.
      if (/^text-/.test(base) && RE_FONDO_SOLIDO.test(` ${clase} `)) return todo
      // Si el complemento trae su propia opacidad (/15, /30), la del claro no aplica.
      // En hover/active el pastel 100 sube a /25: con /15 igual que el reposo no se notaría.
      let valor = oscuro.valor
      if (/(?:^|:)(?:hover|active|group-hover|focus):$/.test(variantes) && /-500\/15$/.test(valor)) valor = valor.replace(/\/15$/, '/25')
      const complemento = `oscuro:${variantes}${imp}${valor}${oscuro.traeOpacidad ? '' : opacidad}`
      // Idempotente y sin duplicar: si a continuación ya va un `oscuro:` de la misma
      // propiedad (el suyo o uno puesto a mano), no se añade otro.
      const siguienteToken = completo.slice(desplazamiento + todo.length).match(/^\s+(\S+)/)?.[1] || ''
      const propiedad = base.split('-')[0]
      if (siguienteToken.startsWith(`oscuro:${variantes}${imp}${propiedad}-`)) return todo
      // Ni si el mismo complemento ya está en otra parte de la lista de clases
      if (` ${clase} `.includes(` ${complemento} `)) return todo
      cambios++
      return `${todo} ${complemento}`
    }
    return todo
  })
  return { texto, cambios }
}

let total = 0
for (const archivo of archivos) {
  const original = readFileSync(archivo, 'utf8') // readFileSync/writeFileSync conservan CRLF tal cual
  let cambios = 0
  const nuevo = partesDelArchivo(original)
    .map((parte) => {
      if (parte.esEstilo) return parte.texto
      const r = migrarTexto(parte.texto)
      cambios += r.cambios
      return r.texto
    })
    .join('')
  total += cambios
  console.log(`${simular ? '[simulación] ' : ''}${archivo}: ${cambios} cambios`)
  if (!simular && nuevo !== original) writeFileSync(archivo, nuevo)
}
console.log(`Total: ${total}. Sigue con: node scripts/tema/revisar-colores.mjs ${archivos.join(' ')}`)

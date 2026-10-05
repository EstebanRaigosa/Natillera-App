#!/usr/bin/env node
/**
 * Revisión de una vista o componente migrado al modo oscuro.
 *
 *   node scripts/tema/revisar-colores.mjs src/views/Dashboard.vue [otro.vue …]
 *   node scripts/tema/revisar-colores.mjs --detalle <archivo>   (lista los colores fijos que cuenta en el <style>)
 *
 * ERRORES (salida con código 1; la vista no se marca como migrada):
 *   - Neutros fijos sin migrar: bg-white, bg/text/border-gray-*, sin su `oscuro:`.
 *   - Pizarra (slate), verdes de texto y colores de estado pastel sin su `oscuro:`.
 *   - Uso de `dark:` (en este proyecto la variante es `oscuro:`).
 *   - Captura a imagen (toPng / html-to-image) sin ningún data-tema="claro".
 *   - <style> con colores fijos y sin ningún bloque :where([data-tema=oscuro]).
 *
 * AVISOS (revisar a mano; no bloquean):
 *   - bg-white/NN translúcidos: bien sobre verde de marca; mal sobre una superficie.
 *   - Hex arbitrarios en clases (text-[#…], bg-[#…], border-[#…]).
 *   - Cuántos colores fijos tiene el <style> frente a sus reglas de oscuro.
 *
 * Excepción deliberada: un comentario `tema-fijo: <motivo>` en la línea o en la
 * anterior (p. ej. el fondo blanco del visor de PDF) silencia esa línea.
 */
import { readFileSync } from 'node:fs'
import { FONDOS_DE_MARCA, GRISES_SOLIDOS, HEX_DE_MARCA, RE_CLASE, RE_FONDO_SOLIDO, complementoDe, enCabeceraDeMarca, mismaClase, partesDelArchivo, reemplazoDe } from './equivalencias.mjs'

const detalle = process.argv.includes('--detalle')
const archivos = process.argv.slice(2).filter((a) => !a.startsWith('--'))
if (!archivos.length) {
  console.error('Uso: node scripts/tema/revisar-colores.mjs <archivo.vue> [...]')
  process.exit(1)
}

let erroresTotales = 0

for (const archivo of archivos) {
  const texto = readFileSync(archivo, 'utf8')
  const lineas = texto.split('\n')
  const errores = []
  const avisos = []

  // Línea (1-based) de un desplazamiento del texto completo
  const lineaDe = (pos) => texto.slice(0, pos).split('\n').length
  // La línea, o un comentario tema-fijo en las 3 anteriores (el elemento y su icono)
  const exenta = (n) => [1, 2, 3, 4].some((k) => /tema-fijo/.test(lineas[n - k] || ''))

  let desplazamiento = 0
  for (const parte of partesDelArchivo(texto)) {
    if (!parte.esEstilo) {
      const lineasParte = parte.texto.split('\n')
      const lineaEnParte = (pos) => parte.texto.slice(0, pos).split('\n').length - 1
      for (const m of parte.texto.matchAll(RE_CLASE)) {
        const [todo, variantes, , base, opacidad] = m
        const n = lineaDe(desplazamiento + m.index)
        if (exenta(n)) {
          // Dentro de un elemento blanco tema-fijo (círculo sobre la marca) un `oscuro:` de
          // texto aclara el icono y lo deja sin contraste sobre el blanco
          const ventana = [1, 2, 3, 4].map((k) => lineas[n - k] || '').join(' ')
          if (variantes.includes('oscuro:') && /^text-/.test(base) && /tema-fijo[^>]*blanc/i.test(ventana)) {
            errores.push(`L${n}  oscuro:${base}  → va sobre un elemento blanco que no cambia (tema-fijo): quitarlo`)
          }
          continue
        }
        const clase = mismaClase(parte.texto, m.index)
        // Texto con `oscuro:` sobre un fondo cromático sólido: el fondo no cambia y el
        // texto aclarado se pierde (chip bg-amber-300 con oscuro:text-amber-300).
        if (variantes.includes('oscuro:')) {
          if (/^text-/.test(base) && RE_FONDO_SOLIDO.test(` ${clase} `) && !/oscuro:(?:[a-z-]+:)*bg-/.test(clase)) {
            errores.push(`L${n}  oscuro:${base}  → sobre un fondo sólido que no cambia: quitarlo`)
          }
          continue
        }
        if (base === 'bg-superficie-tarjeta' || base === 'text-marca-tinta') continue
        if (/^(ring|border)-white$/.test(base) && !opacidad && !/oscuro:/.test(clase) && !enCabeceraDeMarca(lineasParte, lineaEnParte(m.index), clase)) {
          avisos.push(`L${n}  ${todo}  — aro/borde blanco: sobre superficie añade oscuro:${base.split('-')[0]}-superficie-tarjeta`)
          continue
        }
        const resto = parte.texto.slice(m.index + todo.length, m.index + todo.length + 160)

        if (/-white$/.test(base) && opacidad) {
          avisos.push(`L${n}  ${todo}  — translúcido: ¿va sobre el verde de marca?`)
          continue
        }
        if (base === 'text-white' || base === 'bg-black' || base === 'text-black' || base === 'border-white' || base.startsWith('ring-') && base.includes('white')) continue
        if (GRISES_SOLIDOS.test(base)) continue
        const reemplazo = reemplazoDe(base)
        if (reemplazo || /-gray-\d/.test(base)) {
          // Neutro con su `oscuro:` explícito al lado: decisión manual válida
          if (/^\s*oscuro:/.test(resto)) continue
          errores.push(`L${n}  ${todo}  → ${reemplazo || 'token por función'}`)
          continue
        }
        const complemento = complementoDe(base)
        if (complemento && /^text-/.test(base) && RE_FONDO_SOLIDO.test(` ${clase} `)) continue
        if (complemento || /-slate-\d/.test(base)) {
          if (!/oscuro:/.test(resto.split(/["'`]/)[0])) errores.push(`L${n}  ${todo}  → añadir oscuro:${complemento ? complemento.valor : '…'}`)
          continue
        }
        // Color arbitrario (hex, hsl(), rgb()) que no es de marca: sin su `oscuro:` al
        // lado, en oscuro queda como estaba en claro. Era aviso y se colaron textos
        // grises oscuros sobre superficies oscuras: ahora es error.
        if (/\[(#|hsl|rgb)/.test(base) && !FONDOS_DE_MARCA.test(base)) {
          if (!/oscuro:/.test(resto.split(/["'`]/)[0])) errores.push(`L${n}  ${todo}  → color arbitrario: token, oscuro: al lado o tema-fijo`)
        }
      }
      // Círculos de icono de una cabecera de marca que acabaron en superficie: en oscuro
      // dejan un círculo oscuro sobre el verde. Van en bg-white con tema-fijo.
      for (const m of parte.texto.matchAll(/bg-superficie-tarjeta(?![\w/-])/g)) {
        const k = lineaEnParte(m.index)
        if (exenta(lineaDe(desplazamiento + m.index))) continue
        if (enCabeceraDeMarca(lineasParte, k, mismaClase(parte.texto, m.index))) {
          avisos.push(`L${lineaDe(desplazamiento + m.index)}  bg-superficie-tarjeta  — ¿círculo de icono sobre la cabecera de marca? → bg-white + tema-fijo`)
        }
      }
      // Estilos en línea con fondo claro: invisibles para Tailwind y para los tokens.
      // Dentro de un comprobante (data-tema="claro") están bien; fuera, en oscuro, no.
      for (const m of parte.texto.matchAll(/style="[^"]*(?:background|color)\s*:[^";]*(?:#[0-9a-fA-F]{3,8}\b|white|rgba?\(|hsla?\()[^"]*"/g)) {
        const n = lineaDe(desplazamiento + m.index)
        if (!exenta(n)) avisos.push(`L${n}  style="…color fijo…"  — ¿dentro de un comprobante (data-tema="claro")? si no, a clases con token o CSS con override`)
      }
      for (const m of parte.texto.matchAll(/(?<=[\s"'`])dark:[\w-]+/g)) {
        errores.push(`L${lineaDe(desplazamiento + m.index)}  ${m[0]}  → usar oscuro: (no dark:)`)
      }
    } else {
      // Solo propiedades de color de superficie, texto o borde, línea a línea:
      //  - las sombras y velos negros valen igual en los dos modos;
      //  - `color: #fff` es texto sobre la marca (en esta app no va sobre superficie);
      //  - `tema-fijo` en la línea o la anterior es una excepción deliberada.
      const lineasEstilo = parte.texto.split('\n')
      let fijos = 0
      // Un rango `tema-fijo-inicio: motivo` … `tema-fijo-fin` exime un bloque entero
      // (p. ej. una ilustración que dibuja una pantalla en claro a propósito).
      let enRangoFijo = false
      lineasEstilo.forEach((linea, k) => {
        if (/tema-fijo-inicio/.test(linea)) enRangoFijo = true
        if (/tema-fijo-fin/.test(linea)) { enRangoFijo = false; return }
        if (enRangoFijo) return
        if (/tema-fijo/.test(linea) || /tema-fijo/.test(lineasEstilo[k - 1] || '')) return
        const decls = linea.match(/(?:color|background(?:-color)?|border(?:-[a-z]+)*|fill|stroke|outline(?:-color)?|--[a-z0-9-]+)\s*:[^;}]*/g) || []
        for (const d of decls) {
          if (!/#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d|hsla?\(\s*\d/.test(d)) continue
          if (/^[^:]*:\s*(?:rgba?\(\s*0\s*,\s*0\s*,\s*0\b[^)]*\)|#000(?:000)?\b)\s*(?:!important)?\s*$/.test(d)) continue
          if (/^color\s*:\s*(?:#fff(?:fff)?|white|rgba?\(\s*255\s*[,\s]\s*255\s*[,\s]\s*255)\b/i.test(d)) continue
          // Verde de marca como fondo, borde o contorno (botones, cabeceras): igual en los dos modos
          const hexes = d.match(/#[0-9a-fA-F]{6}\b/g) || []
          const soloMarca = hexes.length && hexes.every((x) => HEX_DE_MARCA.includes(x.slice(1).toLowerCase())) &&
            !/rgba?\(\s*(?!27\s*,\s*94\s*,\s*55)\d|hsla?\(/.test(d)
          if (/^(?:background|border|outline)/.test(d) && soloMarca) continue
          if (/^(?:background|border|outline)[^:]*:\s*[^;]*rgba?\(\s*27\s*,\s*94\s*,\s*55\b[^;]*$/.test(d) && !/#|hsl/.test(d.split(':').slice(1).join(':'))) continue
          // Brillo blanco translúcido (hovers y velos sobre la marca): vale en los dos modos
          if (/^(?:background(?:-color)?|border(?:-[a-z]+)*)\s*:\s*(?:\d+px\s+\w+\s+)?rgba?\(\s*255\s*[,\s]\s*255\s*[,\s]\s*255\s*[,/]\s*0?\.[0-3]\d*\s*\)\s*$/i.test(d)) continue
          fijos++
          if (detalle) avisos.push(`  css  ${d.trim()}`)
        }
      })
      const reglasOscuro = (parte.texto.match(/\[data-tema=oscuro\]/g) || []).length
      if (fijos > 0 && reglasOscuro === 0) {
        errores.push(`<style> con ${fijos} colores fijos y ningún bloque :where([data-tema=oscuro])`)
      } else if (fijos > 0) {
        avisos.push(`<style>: ${fijos} colores fijos, ${reglasOscuro} reglas de oscuro — comprobar que cubren superficies y textos`)
      }
    }
    desplazamiento += parte.texto.length
  }

  // Cada nodo capturado a imagen, uno por uno: el elemento con ref="x" que se pasa a
  // toPng/toBlob/toJpeg/toCanvas (directo o como `elemento: x` de un preparador)
  // debe llevar data-tema="claro" en su propia etiqueta.
  const capturados = new Set()
  for (const m of texto.matchAll(/\bto(?:Png|Blob|Jpeg|Canvas|Svg)\(\s*([A-Za-z_$][\w$]*)\.value/g)) capturados.add(m[1])
  for (const m of texto.matchAll(/\belemento\s*:\s*([A-Za-z_$][\w$]*)/g)) capturados.add(m[1])
  for (const nombre of capturados) {
    const etiqueta = texto.match(new RegExp(`<[a-zA-Z][^<>]*\\bref="${nombre}"[^<>]*>`))
    if (!etiqueta) continue // la ref vive en otro componente o se resuelve por id
    if (!/data-tema="claro"/.test(etiqueta[0])) {
      errores.push(`L${lineaDe(etiqueta.index)}  ref="${nombre}" se captura como imagen y no lleva data-tema="claro"`)
    }
  }
  if (/\btoPng\b|html-to-image|\btoBlob\(/.test(texto) && !capturados.size && !/data-tema="claro"|dataset\.tema\s*=\s*['"]claro['"]/.test(texto)) {
    errores.push('Genera imágenes (toPng/html-to-image) y no tiene data-tema="claro" en el nodo capturado')
  }

  erroresTotales += errores.length
  console.log(`\n${errores.length ? '✗' : '✓'} ${archivo}  (${errores.length} errores, ${avisos.length} avisos)`)
  for (const e of errores) console.log(`  ERROR  ${e}`)
  for (const a of avisos) console.log(`  aviso  ${a}`)
}

process.exit(erroresTotales ? 1 : 0)

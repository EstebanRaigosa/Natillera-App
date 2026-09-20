/**
 * Genera `public/badge-notificacion.png`: la silueta de marca que Android pone
 * en la barra de estado al llegar una notificación push.
 *
 * Por qué existe este script y no un PNG suelto en `public/`:
 *
 *  · El badge es una MÁSCARA. Android se queda solo con el canal alfa y lo
 *    pinta de blanco, así que no se puede exportar el isotipo a color y ya:
 *    un icono con fondo opaco sale como un cuadrado blanco. Hay que dibujar la
 *    silueta a propósito.
 *  · A 24 dp no cabe el isotipo entero. Se conserva lo que identifica la marca
 *    —el aro de ocho socios alrededor de la moneda— y se quitan el disco verde,
 *    los bordes y el «$», que a ese tamaño solo serían ruido.
 *
 * Se dibuja a 4× y se promedia (supersampling) porque no hay ninguna librería
 * de imagen en el proyecto y un borde sin suavizar se nota mucho en un círculo
 * pequeño.
 *
 *   node scripts/generar-badge-notificacion.mjs [salida.png]
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const TAM = 96   // px del PNG final; Android lo escala hacia abajo
const SS = 4     // supersampling
const N = TAM * SS
const CENTRO = N / 2

const R_ARO = 34.0 * SS      // radio de la circunferencia donde van los socios
const R_SOCIO = 7.6 * SS
const R_MONEDA = 17.5 * SS
const GROSOR_ARO = 3.0 * SS  // hilo que une a los socios

function alfaEn(x, y) {
  for (let i = 0; i < 8; i++) {
    const angulo = -Math.PI / 2 + (i * Math.PI) / 4
    const cx = CENTRO + R_ARO * Math.cos(angulo)
    const cy = CENTRO + R_ARO * Math.sin(angulo)
    if (Math.hypot(x - cx, y - cy) <= R_SOCIO) return 1
  }
  const d = Math.hypot(x - CENTRO, y - CENTRO)
  if (Math.abs(d - R_ARO) <= GROSOR_ARO / 2) return 1
  return d <= R_MONEDA ? 1 : 0
}

function trozo(tipo, datos) {
  const longitud = Buffer.alloc(4)
  longitud.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'latin1'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo) >>> 0)
  return Buffer.concat([longitud, cuerpo, crc])
}

// CRC-32 del propio PNG: son 15 líneas y evita una dependencia.
const TABLA_CRC = (() => {
  const tabla = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c
  }
  return tabla
})()

function crc32(buffer) {
  let c = 0xFFFFFFFF
  for (const byte of buffer) c = TABLA_CRC[(c ^ byte) & 0xFF] ^ (c >>> 8)
  return c ^ 0xFFFFFFFF
}

function generar() {
  const crudo = Buffer.alloc(TAM * (1 + TAM * 4))
  let p = 0
  for (let py = 0; py < TAM; py++) {
    crudo[p++] = 0  // filtro None
    for (let px = 0; px < TAM; px++) {
      let acumulado = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          acumulado += alfaEn(px * SS + sx + 0.5, py * SS + sy + 0.5)
        }
      }
      // Blanco con alfa: del color no depende nada, del alfa depende todo.
      crudo[p++] = 255
      crudo[p++] = 255
      crudo[p++] = 255
      crudo[p++] = Math.round((255 * acumulado) / (SS * SS))
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(TAM, 0)
  ihdr.writeUInt32BE(TAM, 4)
  ihdr[8] = 8    // 8 bits por canal
  ihdr[9] = 6    // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ])
}

const salida = process.argv[2] || 'public/badge-notificacion.png'
const png = generar()
writeFileSync(salida, png)
console.log(`${salida} · ${TAM}×${TAM} · ${png.length} bytes`)

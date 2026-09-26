/*
 * Destellos con posiciones fijas (un generador con semilla, no Math.random):
 * el HTML pre-renderizado y el que pinta el navegador salen idénticos, sin saltos.
 */
function generador(semilla) {
  let s = semilla
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const azar = generador(42)
export const ESTRELLAS = Array.from({ length: 60 }, () => ({
  x: Math.round(azar() * 1000) / 10,
  y: Math.round(azar() * 700) / 10,
  r: 0.6 + Math.round(azar() * 12) / 10,
  o: 0.25 + Math.round(azar() * 60) / 100
}))

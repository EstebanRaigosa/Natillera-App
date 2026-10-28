/**
 * Mora excesiva: el socio llegó al límite de cuotas en mora que la natillera fijó en
 * Configuración › Sanciones › «Devolución por mora excesiva». A partir de ahí el
 * reglamento dice que se le devuelve lo ahorrado (con la multa) y sale de la natillera;
 * la app solo lo avisa, el retiro lo decide el admin desde Socios.
 */

/** Cuotas en mora a partir de las cuales aplica; 0 si la natillera no tiene la regla. */
export function limiteMoraExcesiva(reglasMultas) {
  const devolucion = reglasMultas?.sanciones?.devolucion
  if (!devolucion?.activo) return 0
  const limite = Math.floor(Number(devolucion.cuotasLimite))
  return Number.isFinite(limite) && limite > 0 ? limite : 0
}

export function tieneMoraExcesiva(cuotasEnMora, limite) {
  return limite > 0 && Number(cuotasEnMora) >= limite
}

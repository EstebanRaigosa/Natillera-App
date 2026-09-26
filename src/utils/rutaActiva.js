/**
 * ¿La ruta actual está dentro de `base`? Compara por segmentos, no por prefijo de texto:
 * `/natilleras/1/socios-en-la-app` empieza por `/natilleras/1/socios`, pero no es Socios.
 * Con `startsWith` a secas, abrir «Invitar socios» marcaba también «Socios» en el menú.
 */
export function rutaEnSeccion(path, base) {
  if (!path || !base) return false
  return path === base || path.startsWith(base.endsWith('/') ? base : `${base}/`)
}

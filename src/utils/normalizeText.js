/**
 * Normaliza texto para búsquedas: sin distinguir tildes/diacríticos ni mayúsculas.
 * Ej.: "José Ñandú" -> "jose nandu". Descompone (NFD), elimina marcas diacríticas
 * (U+0300–U+036F), pasa a minúsculas y recorta espacios.
 *
 * @param {*} value
 * @returns {string}
 */
export function normalizeText(value) {
  return (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

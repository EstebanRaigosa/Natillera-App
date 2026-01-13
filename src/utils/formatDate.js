/**
 * Parsea una fecha de forma local evitando problemas de zona horaria
 * Cuando JavaScript parsea "YYYY-MM-DD" lo interpreta como UTC, causando
 * que en zonas horarias negativas (como UTC-5) la fecha cambie al día anterior.
 * 
 * @param {Date|string} date - Fecha a parsear
 * @returns {Date} Fecha parseada en hora local
 */
export function parseDateLocal(date) {
  if (!date) return null
  if (date instanceof Date) return new Date(date.getTime()) // Crear copia para evitar mutaciones
  
  if (typeof date === 'string') {
    // Extraer solo la parte de la fecha (YYYY-MM-DD) de cualquier formato
    let datePart = date
    
    // Si tiene zona horaria Z (UTC) o tiene 'T', extraer solo la fecha
    if (date.includes('T')) {
      datePart = date.split('T')[0]
    }
    
    // Verificar si es formato YYYY-MM-DD
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1 // Los meses en Date van de 0-11
      const day = parseInt(match[3], 10)
      // Usar el constructor con año, mes, día para crear fecha en hora LOCAL
      // Esto evita cualquier interpretación como UTC
      return new Date(year, month, day, 12, 0, 0)
    }
    
    // Si es formato dd/MM/yyyy
    const matchDMY = datePart.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (matchDMY) {
      const day = parseInt(matchDMY[1], 10)
      const month = parseInt(matchDMY[2], 10) - 1
      const year = parseInt(matchDMY[3], 10)
      return new Date(year, month, day, 12, 0, 0)
    }
  }
  
  // Fallback: intentar parsear normalmente
  return new Date(date)
}

/**
 * Formatea una fecha en formato YYYY-MM-DD sin conversión UTC
 * Respeta la zona horaria local (UTC-5:00)
 * 
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function formatDateToLocalISO(date) {
  if (!date) return ''
  const d = parseDateLocal(date)
  if (!d || isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD sin conversión UTC
 * Respeta la zona horaria local (UTC-5:00)
 * 
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export function getCurrentDateISO() {
  return formatDateToLocalISO(new Date())
}

export function formatDate(date) {
  if (!date) return ''
  
  // Intentar parsear la fecha de forma local primero
  let d = parseDateLocal(date)
  
  // Si el parseo falló o no es válido, intentar otros métodos
  if (!d || isNaN(d.getTime())) {
    // Si es string, intentar parsear directamente
    if (typeof date === 'string') {
      // Intentar formato MM/DD/YYYY (formato común en algunos sistemas)
      const matchMDY = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (matchMDY) {
        const month = parseInt(matchMDY[1], 10) - 1
        const day = parseInt(matchMDY[2], 10)
        const year = parseInt(matchMDY[3], 10)
        d = new Date(year, month, day, 12, 0, 0)
      } else {
        // Último intento: usar new Date normal
        d = new Date(date)
      }
    } else {
      d = new Date(date)
    }
  }
  
  // Verificar que la fecha es válida
  if (!d || isNaN(d.getTime())) return ''
  
  // Formatear siempre como DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateWithTime(date) {
  if (!date) return 'No registrada'
  // Usar parseDateLocal para asegurar parseo correcto
  const d = parseDateLocal(date)
  if (!d || isNaN(d.getTime())) {
    // Si parseDateLocal falla, intentar parseo normal pero preservar hora
    const d2 = new Date(date)
    if (isNaN(d2.getTime())) return 'No registrada'
    const day = String(d2.getDate()).padStart(2, '0')
    const month = String(d2.getMonth() + 1).padStart(2, '0')
    const year = d2.getFullYear()
    const hours = String(d2.getHours()).padStart(2, '0')
    const minutes = String(d2.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
  // Formatear siempre como DD/MM/YYYY HH:mm
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}


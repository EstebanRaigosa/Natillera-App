/**
 * Helper para generar números de ticket desde emails
 * Genera un número de ticket único y legible basado en el email del usuario
 */

/**
 * Genera un número de ticket desde un email
 * @param {string} email - Email del usuario
 * @returns {string} - Número de ticket (ej: "TKT-ABC123")
 */
export function generateTicketNumber(email) {
  if (!email) return 'TKT-XXXXX'
  
  // Extraer la parte antes del @
  const localPart = email.split('@')[0].toUpperCase()
  
  // Tomar los primeros 3-5 caracteres
  const prefix = localPart.substring(0, 5).padEnd(5, 'X')
  
  // Generar un hash simple de 3 dígitos desde el email completo
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a 32 bits
  }
  const hashStr = Math.abs(hash).toString().substring(0, 3).padStart(3, '0')
  
  return `TKT-${prefix}${hashStr}`
}

/**
 * Genera un número de ticket más corto (solo hash)
 * @param {string} email - Email del usuario
 * @returns {string} - Número de ticket corto (ej: "12345")
 */
export function generateShortTicketNumber(email) {
  if (!email) return 'XXXXX'
  
  // Generar un hash de 5 dígitos desde el email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a 32 bits
  }
  
  // Convertir a número de 5 dígitos
  const ticketNum = Math.abs(hash).toString().substring(0, 5).padStart(5, '0')
  
  return ticketNum
}

/**
 * Genera el asunto del correo para respuestas de soporte
 * @param {string} ticketNumber - Número de ticket
 * @returns {string} - Asunto del correo
 */
export function generateSupportSubject(ticketNumber) {
  return `Respuesta ticket ${ticketNumber}`
}

/**
 * Genera el cuerpo del correo para respuestas de soporte
 * @param {string} ticketNumber - Número de ticket
 * @param {string} userEmail - Email del usuario
 * @returns {string} - Cuerpo del correo (texto plano)
 */
export function generateSupportEmailBody(ticketNumber, userEmail) {
  return `---\nRespuesta al ticket #${ticketNumber}\nUsuario: ${userEmail}\n---\n\n`
}


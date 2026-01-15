/**
 * Servicio para interactuar con Twilio Verify API
 * Este servicio maneja el envío y verificación de códigos OTP por SMS
 */

// URL del servicio backend que maneja Twilio
// En producción, esto debería ser una Supabase Edge Function o API externa
// Ejemplo para Supabase Edge Function: https://[project-ref].supabase.co/functions/v1/twilio
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const TWILIO_FUNCTION_PATH = '/functions/v1/twilio'
const TWILIO_API_URL = import.meta.env.VITE_TWILIO_API_URL || (SUPABASE_URL ? `${SUPABASE_URL}${TWILIO_FUNCTION_PATH}` : '/api/twilio')
const VERIFICATION_SERVICE_SID = import.meta.env.VITE_TWILIO_VERIFICATION_SID || 'VAabdcac4fcf54a63beaf3c2cd76983d91'

/**
 * Formatea el número de teléfono para Twilio
 * Acepta números con o sin código de país
 * @param {string} telefono - Número de teléfono
 * @returns {string} - Número formateado (ej: +573001234567)
 */
export function formatearTelefono(telefono) {
  if (!telefono) return null
  
  // Eliminar todos los caracteres que no sean dígitos
  let limpio = telefono.replace(/\D/g, '')
  
  // Si no empieza con código de país, agregar +57 (Colombia)
  if (limpio.length === 10 && !limpio.startsWith('57')) {
    limpio = '57' + limpio
  } else if (limpio.length < 10) {
    return null // Número muy corto
  }
  
  // Agregar el signo + al inicio
  if (!limpio.startsWith('+')) {
    limpio = '+' + limpio
  }
  
  return limpio
}

/**
 * Traduce errores de Twilio a mensajes amigables en español
 * @param {string} error - Mensaje de error de Twilio
 * @returns {string} - Mensaje traducido y amigable
 */
function traducirErrorTwilio(error) {
  if (!error) return 'Error al enviar el código OTP'
  
  const errorLower = error.toLowerCase()
  
  // Errores comunes de Twilio
  if (errorLower.includes('unverified') || errorLower.includes('trial accounts cannot send')) {
    return 'El servicio de mensajería está en modo de prueba. Por favor, contacta al administrador para que verifique tu número de teléfono en el sistema o actualice la cuenta del servicio.'
  }
  
  if (errorLower.includes('invalid phone number') || errorLower.includes('número de teléfono inválido')) {
    return 'El número de teléfono ingresado no es válido. Por favor, verifica el número e intenta nuevamente.'
  }
  
  if (errorLower.includes('rate limit') || errorLower.includes('too many requests')) {
    return 'Se han enviado demasiados códigos. Por favor, espera unos minutos antes de intentar nuevamente.'
  }
  
  if (errorLower.includes('insufficient funds') || errorLower.includes('balance')) {
    return 'Error en el servicio de mensajería. Por favor, contacta al administrador.'
  }
  
  if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('connection')) {
    return 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
  }
  
  // Si no coincide con ningún patrón conocido, retornar un mensaje genérico
  return 'Error al enviar el código de verificación. Por favor, intenta nuevamente o contacta al administrador si el problema persiste.'
}

/**
 * Envía un código OTP por SMS usando Twilio Verify
 * @param {string} telefono - Número de teléfono del usuario
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function enviarOTP(telefono) {
  try {
    const telefonoFormateado = formatearTelefono(telefono)
    
    if (!telefonoFormateado) {
      return {
        success: false,
        error: 'Número de teléfono inválido'
      }
    }

    // Llamar a la función backend que maneja Twilio
    // Si es una Supabase Edge Function, necesitamos incluir el anon key
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const headers = {
      'Content-Type': 'application/json',
    }
    
    // Si es una Supabase Edge Function, agregar el anon key y authorization
    if (TWILIO_API_URL.includes('supabase.co') && supabaseAnonKey) {
      headers['apikey'] = supabaseAnonKey
      headers['Authorization'] = `Bearer ${supabaseAnonKey}`
    }

    const response = await fetch(TWILIO_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'enviar-otp',
        telefono: telefonoFormateado,
        verification_service_sid: VERIFICATION_SERVICE_SID
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Traducir el error de Twilio a un mensaje amigable
      const errorTraducido = traducirErrorTwilio(data.error || data.message || 'Error desconocido')
      return {
        success: false,
        error: errorTraducido
      }
    }

    return {
      success: true,
      message: data.message || 'Código OTP enviado exitosamente'
    }
  } catch (error) {
    console.error('Error enviando OTP:', error)
    const errorTraducido = traducirErrorTwilio(error.message || 'Error de conexión')
    return {
      success: false,
      error: errorTraducido
    }
  }
}

/**
 * Verifica un código OTP usando Twilio Verify
 * @param {string} telefono - Número de teléfono del usuario
 * @param {string} codigo - Código OTP a verificar
 * @returns {Promise<{success: boolean, message?: string, error?: string, user_id?: string}>}
 */
export async function verificarOTP(telefono, codigo) {
  try {
    const telefonoFormateado = formatearTelefono(telefono)
    
    if (!telefonoFormateado) {
      return {
        success: false,
        error: 'Número de teléfono inválido'
      }
    }

    if (!codigo || codigo.length !== 6) {
      return {
        success: false,
        error: 'El código OTP debe tener 6 dígitos'
      }
    }

    // Llamar a la función backend que maneja Twilio
    // Si es una Supabase Edge Function, necesitamos incluir el anon key
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const headers = {
      'Content-Type': 'application/json',
    }
    
    // Si es una Supabase Edge Function, agregar el anon key y authorization
    if (TWILIO_API_URL.includes('supabase.co') && supabaseAnonKey) {
      headers['apikey'] = supabaseAnonKey
      headers['Authorization'] = `Bearer ${supabaseAnonKey}`
    }

    const response = await fetch(TWILIO_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'verificar-otp',
        telefono: telefonoFormateado,
        codigo: codigo,
        verification_service_sid: VERIFICATION_SERVICE_SID
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Traducir el error de Twilio a un mensaje amigable
      const errorTraducido = traducirErrorTwilio(data.error || data.message || 'Error desconocido')
      return {
        success: false,
        error: errorTraducido
      }
    }

    return {
      success: true,
      message: data.message || 'Código OTP verificado exitosamente',
      user_id: data.user_id
    }
  } catch (error) {
    console.error('Error verificando OTP:', error)
    const errorTraducido = traducirErrorTwilio(error.message || 'Error de conexión')
    return {
      success: false,
      error: errorTraducido
    }
  }
}

/**
 * Normaliza el número de teléfono para almacenamiento en BD
 * Remueve el código de país y formatea solo con los dígitos locales
 * @param {string} telefono - Número de teléfono
 * @returns {string} - Número normalizado (ej: 3001234567)
 */
export function normalizarTelefonoParaBD(telefono) {
  if (!telefono) return null
  // Remover todos los caracteres que no sean dígitos
  let limpio = telefono.replace(/\D/g, '')
  // Si tiene código de país 57 (Colombia), removerlo
  if (limpio.startsWith('57') && limpio.length > 10) {
    limpio = limpio.substring(2)
  }
  return limpio
}

/**
 * Busca un usuario por número de teléfono en la base de datos
 * Usa una función RPC para saltarse las restricciones RLS durante el login
 * @param {string} telefono - Número de teléfono (puede estar en cualquier formato)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function buscarUsuarioPorTelefono(telefono) {
  try {
    const { supabase } = await import('../lib/supabase')
    
    if (!telefono || telefono.trim() === '') {
      return {
        success: false,
        error: 'Número de teléfono inválido'
      }
    }
    
    console.log('🔍 Buscando usuario con teléfono:', telefono.trim())
    
    // Usar función RPC que salta las restricciones RLS
    // Esto es necesario porque durante el login el usuario no está autenticado
    const { data, error } = await supabase
      .rpc('buscar_usuario_por_telefono', {
        p_telefono: telefono.trim()
      })

    if (error) {
      console.error('❌ Error en búsqueda RPC de usuario por teléfono:', error)
      // Si la función RPC no existe, intentar búsqueda directa como fallback
      console.log('⚠️ Intentando búsqueda directa como fallback...')
      
      // Fallback: búsqueda directa (puede fallar por RLS si el usuario no está autenticado)
      const telefonoNormalizado = normalizarTelefonoParaBD(telefono)
      if (telefonoNormalizado) {
        const { data: dataDirecta, error: errorDirecta } = await supabase
          .from('user_profiles')
          .select('id, email, nombre, telefono')
          .eq('telefono', telefonoNormalizado)
          .maybeSingle()
        
        if (!errorDirecta && dataDirecta) {
          console.log('✅ Usuario encontrado con búsqueda directa (fallback):', dataDirecta)
          return {
            success: true,
            user: dataDirecta
          }
        }
      }
      
      return {
        success: false,
        error: error.message || 'Error al buscar usuario'
      }
    }

    // La función RPC retorna un array, tomar el primer resultado
    if (data && data.length > 0) {
      const usuario = data[0]
      console.log('✅ Usuario encontrado con función RPC:', usuario)
      return {
        success: true,
        user: usuario
      }
    }

    console.log('❌ No se encontró usuario con el teléfono:', telefono.trim())
    return {
      success: true,
      user: null
    }
  } catch (error) {
    console.error('❌ Error buscando usuario por teléfono:', error)
    return {
      success: false,
      error: error.message || 'Error al buscar usuario'
    }
  }
}

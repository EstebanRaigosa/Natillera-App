/**
 * Supabase Edge Function para manejar envío y verificación de códigos OTP con Twilio
 *
 * Variables de entorno en Supabase:
 * - TWILIO_ACCOUNT_SID: Account SID de Twilio
 * - TWILIO_AUTH_TOKEN: Auth Token de Twilio
 * - TWILIO_VERIFICATION_SERVICE_SID: Verification Service SID
 * - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: las pone Supabase
 *
 * Gasto: cada SMS lo paga la cuenta de Twilio y la clave anon va dentro de la app, así que
 * cualquiera puede llamar esta función. Antes de enviar se pregunta a la base
 * (`otp_reservar_envio`, migración 066): solo celulares colombianos de socios, con límite
 * por número y un techo diario para toda la app. El Service SID ya no se acepta del cliente.
 *
 * Deploy: supabase functions deploy twilio
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_API_URL = `https://verify.twilio.com/v2/Services`
const SERVICE_SID_POR_DEFECTO = 'VAabdcac4fcf54a63beaf3c2cd76983d91'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Los textos de error los traduce el cliente (traducirErrorTwilio en src/services/twilio.js)
// buscando estas palabras: «invalid phone number» y «too many requests».
const MOTIVOS_RECHAZO: Record<string, { status: number; error: string }> = {
  numero_invalido: { status: 400, error: 'Invalid phone number' },
  no_es_socio: { status: 403, error: 'Invalid phone number: no es socio' },
  limite_numero: { status: 429, error: 'Too many requests' },
  limite_global: { status: 429, error: 'Too many requests (límite diario)' },
}

function json(cuerpo: unknown, status = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  // Manejar preflight CORS - debe ser lo primero, antes de cualquier parsing
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return json({ error: 'Credenciales de Twilio no configuradas' }, 500)
    }

    let body
    try {
      body = await req.json()
    } catch (_e) {
      return json({ error: 'Error al parsear el body de la petición' }, 400)
    }

    const { action, telefono, codigo } = body

    if (!telefono || typeof telefono !== 'string') {
      return json({ error: 'Número de teléfono requerido' }, 400)
    }

    // Nunca el del cliente: aceptarlo permitía usar otro servicio de la cuenta. El respaldo es
    // el SID que la app siempre mandó (público en src/services/twilio.js), por si el secreto
    // no está configurado en el proyecto.
    const serviceSid = Deno.env.get('TWILIO_VERIFICATION_SERVICE_SID') || SERVICE_SID_POR_DEFECTO

    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

    if (action === 'enviar-otp') {
      // Antes de gastar un SMS, la base decide si se puede (y deja apuntado el envío).
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )
      const { data: permiso, error: errorPermiso } = await supabaseAdmin.rpc('otp_reservar_envio', { p_telefono: telefono })
      if (errorPermiso) {
        console.error('otp_reservar_envio falló:', errorPermiso)
        return json({ error: 'No se pudo validar el envío' }, 500)
      }
      if (permiso !== 'ok') {
        const rechazo = MOTIVOS_RECHAZO[permiso] ?? { status: 400, error: 'Invalid phone number' }
        if (permiso === 'limite_global') console.warn('Límite diario de SMS alcanzado')
        return json({ error: rechazo.error, motivo: permiso }, rechazo.status)
      }

      // Siempre en formato internacional colombiano: lo validado arriba es un celular de 10 dígitos.
      const digitos = telefono.replace(/\D/g, '')
      const destino = `+57${digitos.length > 10 ? digitos.slice(-10) : digitos}`

      const response = await fetch(`${TWILIO_API_URL}/${serviceSid}/Verifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: destino, Channel: 'sms' }),
      })

      const data = await response.json()

      if (!response.ok) {
        return json({ error: data.message || 'Error al enviar código OTP', details: data }, response.status)
      }

      return json({ success: true, message: 'Código OTP enviado exitosamente', sid: data.sid })
    }

    if (action === 'verificar-otp') {
      if (!codigo) {
        return json({ error: 'Código OTP requerido' }, 400)
      }

      // Verificar no cuesta un SMS, y Twilio Verify ya corta tras 5 intentos fallidos por código.
      const response = await fetch(`${TWILIO_API_URL}/${serviceSid}/VerificationCheck`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: telefono, Code: codigo }),
      })

      const data = await response.json()

      if (!response.ok) {
        return json({ error: data.message || 'Error al verificar código OTP', details: data }, response.status)
      }

      if (data.status !== 'approved') {
        return json({ error: 'Código OTP inválido', status: data.status }, 400)
      }

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
      )

      // Normalizar teléfono: remover código de país si existe
      let telefonoNormalizado = telefono.replace(/\D/g, '')
      if (telefonoNormalizado.startsWith('57') && telefonoNormalizado.length > 10) {
        telefonoNormalizado = telefonoNormalizado.substring(2)
      }

      const { data: userProfile } = await supabaseClient
        .from('user_profiles')
        .select('id, email')
        .eq('telefono', telefonoNormalizado)
        .maybeSingle()

      return json({
        success: true,
        message: 'Código OTP verificado exitosamente',
        user_id: userProfile?.id || null,
        email: userProfile?.email || null,
      })
    }

    return json({ error: 'Acción no válida. Use "enviar-otp" o "verificar-otp"' }, 400)
  } catch (error) {
    return json({ error: error.message || 'Error interno del servidor' }, 500)
  }
})

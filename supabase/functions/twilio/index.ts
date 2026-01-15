/**
 * Supabase Edge Function para manejar envío y verificación de códigos OTP con Twilio
 * 
 * Esta función requiere las siguientes variables de entorno en Supabase:
 * - TWILIO_ACCOUNT_SID: Account SID de Twilio
 * - TWILIO_AUTH_TOKEN: Auth Token de Twilio
 * - TWILIO_VERIFICATION_SERVICE_SID: Verification Service SID (opcional, se puede pasar en el body)
 * 
 * Para deployar esta función:
 * 1. Instala Supabase CLI: npm install -g supabase
 * 2. Inicia sesión: supabase login
 * 3. Enlaza tu proyecto: supabase link --project-ref tu-project-ref
 * 4. Deploy: supabase functions deploy twilio
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_API_URL = `https://verify.twilio.com/v2/Services`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Manejar preflight CORS - debe ser lo primero, antes de cualquier parsing
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Verificar credenciales de Twilio
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Credenciales de Twilio no configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parsear el body solo si no es OPTIONS
    let body
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Error al parsear el body de la petición' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, telefono, codigo, verification_service_sid } = body

    if (!telefono) {
      return new Response(
        JSON.stringify({ error: 'Número de teléfono requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const serviceSid = verification_service_sid || Deno.env.get('TWILIO_VERIFICATION_SERVICE_SID')
    
    if (!serviceSid) {
      return new Response(
        JSON.stringify({ error: 'Verification Service SID no configurado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Crear credenciales básicas para autenticación HTTP
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

    if (action === 'enviar-otp') {
      // Enviar código OTP
      const response = await fetch(`${TWILIO_API_URL}/${serviceSid}/Verifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: telefono,
          Channel: 'sms',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Error al enviar código OTP',
            details: data 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Código OTP enviado exitosamente',
          sid: data.sid 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } 
    
    else if (action === 'verificar-otp') {
      if (!codigo) {
        return new Response(
          JSON.stringify({ error: 'Código OTP requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verificar código OTP
      const response = await fetch(`${TWILIO_API_URL}/${serviceSid}/VerificationCheck`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: telefono,
          Code: codigo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return new Response(
          JSON.stringify({ 
            error: data.message || 'Error al verificar código OTP',
            details: data 
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (data.status === 'approved') {
        // Buscar usuario por teléfono en Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        
        // Usar Service Role Key para tener acceso completo (incluyendo Admin API)
        const supabaseAdmin = createClient(
          supabaseUrl,
          supabaseServiceKey
        )

        // Normalizar teléfono: remover código de país si existe
        let telefonoNormalizado = telefono.replace(/\D/g, '')
        if (telefonoNormalizado.startsWith('57') && telefonoNormalizado.length > 10) {
          telefonoNormalizado = telefonoNormalizado.substring(2)
        }

        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('id, email')
          .eq('telefono', telefonoNormalizado)
          .maybeSingle()

        if (profileError) {
          return new Response(
            JSON.stringify({ 
              error: 'Error al buscar usuario',
              details: profileError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Si el usuario existe, crear una sesión usando Admin API
        let sessionToken = null
        if (userProfile?.id && userProfile?.email) {
          try {
            // Obtener el usuario de auth.users usando el email
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(userProfile.email)
            
            if (!authError && authUser?.user) {
              // Generar un token de sesión para el usuario
              // Nota: Esto requiere que el usuario tenga email confirmado
              // Por ahora, retornamos el user_id y email para que el frontend maneje la autenticación
              sessionToken = authUser.user.id
            }
          } catch (e) {
            console.error('Error obteniendo usuario de auth:', e)
            // Continuar sin sesión, el frontend manejará la autenticación
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Código OTP verificado exitosamente',
            user_id: userProfile?.id || null,
            email: userProfile?.email || null,
            usuario_existe: !!userProfile,
            session_token: sessionToken
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'Código OTP inválido',
            status: data.status 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida. Use "enviar-otp" o "verificar-otp"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

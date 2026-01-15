# Función Supabase Edge Function para Twilio OTP

Esta función maneja el envío y verificación de códigos OTP usando Twilio Verify.

## Configuración

### 1. Variables de Entorno en Supabase

Configura las siguientes variables de entorno en tu proyecto de Supabase:

1. Ve a **Settings** > **Edge Functions** > **Secrets**
2. Agrega las siguientes variables:
   - `TWILIO_ACCOUNT_SID`: Tu Account SID de Twilio
   - `TWILIO_AUTH_TOKEN`: Tu Auth Token de Twilio
   - `TWILIO_VERIFICATION_SERVICE_SID`: Tu Verification Service SID (opcional, puede pasarse en el body)

### 2. Deploy de la Función

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Iniciar sesión
supabase login

# Enlazar tu proyecto
supabase link --project-ref tu-project-ref

# Deploy de la función
supabase functions deploy twilio
```

### 3. Obtener las URLs de la función

Después del deploy, obtendrás una URL como:
```
https://[project-ref].supabase.co/functions/v1/twilio
```

Actualiza la variable `VITE_TWILIO_API_URL` en tu archivo `.env` con esta URL.

## Uso

### Enviar OTP

```javascript
POST /functions/v1/twilio
Content-Type: application/json

{
  "action": "enviar-otp",
  "telefono": "+573001234567",
  "verification_service_sid": "VAabdcac4fcf54a63beaf3c2cd76983d91" // opcional
}
```

### Verificar OTP

```javascript
POST /functions/v1/twilio
Content-Type: application/json

{
  "action": "verificar-otp",
  "telefono": "+573001234567",
  "codigo": "123456",
  "verification_service_sid": "VAabdcac4fcf54a63beaf3c2cd76983d91" // opcional
}
```

## Alternativa: API Externa

Si prefieres no usar Supabase Edge Functions, puedes crear un endpoint API externo (por ejemplo, usando Express, Netlify Functions, Vercel Functions, etc.) que haga lo mismo.

El servicio en `src/services/twilio.js` ya está configurado para llamar a `/api/twilio`, así que puedes:

1. Crear un endpoint en tu backend existente
2. O usar un servicio como Netlify Functions o Vercel Functions
3. Actualizar `VITE_TWILIO_API_URL` en tu `.env` con la URL del endpoint

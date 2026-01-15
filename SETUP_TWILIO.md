# Guía Rápida: Configuración de Twilio OTP

## Credenciales de Twilio

Obtén tus credenciales desde el dashboard de Twilio:

- **Account SID**: Disponible en tu dashboard principal
- **Auth Token**: Disponible en tu dashboard principal
- **Verification Service SID**: Crea un servicio de verificación en Twilio Verify

## Pasos Rápidos

### 1. Ejecutar Migración

Ejecuta la migración SQL:
```sql
-- Archivo: supabase/migrations/add_telefono_otp_to_user_profiles.sql
```

### 2. Configurar Secrets en Supabase

Desde la terminal con Supabase CLI:

```bash
supabase secrets set TWILIO_ACCOUNT_SID=tu-account-sid
supabase secrets set TWILIO_AUTH_TOKEN=tu-auth-token
supabase secrets set TWILIO_VERIFICATION_SERVICE_SID=tu-verification-service-sid
```

**O desde el Dashboard de Supabase:**
1. Ve a **Settings** > **Edge Functions** > **Secrets**
2. Agrega cada variable con tus credenciales de Twilio:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_VERIFICATION_SERVICE_SID`

### 3. Deployar Edge Function

```bash
supabase functions deploy twilio
```

### 4. Configurar Variable de Entorno (Opcional)

En tu archivo `.env`:

```env
VITE_TWILIO_VERIFICATION_SID=tu-verification-service-sid
```

La URL de la API se detecta automáticamente desde `VITE_SUPABASE_URL`.

## Verificación

1. Ve a la pantalla de login
2. Selecciona "Teléfono"
3. Ingresa un número de teléfono válido
4. Deberías recibir un código OTP por SMS

## Solución de Problemas

### Error: "Credenciales de Twilio no configuradas"
- Verifica que los secrets estén configurados en Supabase Edge Functions
- Asegúrate de haber hecho el deploy de la función

### Los SMS no se envían
- Verifica que tu cuenta de Twilio tenga saldo
- Revisa los logs de la Edge Function en Supabase Dashboard

### Error 401 o 403
- Verifica que las credenciales sean correctas
- Asegúrate de que el Verification Service SID sea el correcto

## Documentación Completa

Para más detalles, consulta `CONFIGURACION_OTP_SMS.md`

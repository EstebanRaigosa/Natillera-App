# Deploy de la Edge Function de Twilio

## Pasos para Deployar

### 1. Instalar Supabase CLI (si no lo tienes)

```bash
npm install -g supabase
```

### 2. Iniciar sesión en Supabase

```bash
supabase login
```

### 3. Enlazar tu proyecto

```bash
supabase link --project-ref vdtjacwpvqfifahkrqxp
```

### 4. Deployar la función

```bash
supabase functions deploy twilio
```

### 5. Verificar el deploy

Después del deploy, deberías ver un mensaje de éxito. La función estará disponible en:
```
https://vdtjacwpvqfifahkrqxp.supabase.co/functions/v1/twilio
```

## Solución de Problemas

### Si el deploy falla:

1. **Verifica que estés enlazado al proyecto correcto:**
   ```bash
   supabase projects list
   ```

2. **Verifica que los secrets estén configurados:**
   - Ve a Supabase Dashboard > Settings > Edge Functions > Secrets
   - Deben estar: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFICATION_SERVICE_SID`

3. **Revisa los logs del deploy:**
   ```bash
   supabase functions logs twilio
   ```

### Si después del deploy sigue el error de CORS:

1. **Asegúrate de haber redeployado después de los cambios:**
   ```bash
   supabase functions deploy twilio
   ```

2. **Verifica que la función esté activa:**
   - Ve a Supabase Dashboard > Edge Functions
   - Debe aparecer la función `twilio` como activa

3. **Prueba la función directamente:**
   ```bash
   curl -X POST https://vdtjacwpvqfifahkrqxp.supabase.co/functions/v1/twilio \
     -H "Content-Type: application/json" \
     -H "apikey: TU_ANON_KEY" \
     -d '{"action":"enviar-otp","telefono":"+573001234567","verification_service_sid":"VAabdcac4fcf54a63beaf3c2cd76983d91"}'
   ```

## Notas Importantes

- **Después de cada cambio en el código**, debes redeployar la función
- Los secrets se configuran una vez y persisten entre deploys
- El deploy puede tardar 1-2 minutos

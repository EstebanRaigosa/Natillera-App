# Configuración de Autenticación OTP por SMS con Twilio

Esta guía explica cómo configurar el sistema de autenticación por OTP usando Twilio Verify.

## 📋 Requisitos Previos

1. Cuenta de Twilio activa
2. Service SID de Twilio Verify: `VA...` (obtener de tu dashboard de Twilio)
3. Account SID: `AC...` (obtener de tu dashboard de Twilio)
4. Auth Token: `tu-auth-token` (obtener de tu dashboard de Twilio)

⚠️ **IMPORTANTE**: Estas credenciales son sensibles. No las subas a repositorios públicos.

## 🔧 Pasos de Configuración

### 1. Ejecutar la Migración de Base de Datos

Ejecuta la migración que agrega el campo `telefono` a `user_profiles` y crea la tabla `otp_codes`:

```sql
-- Ejecuta el archivo:
supabase/migrations/add_telefono_otp_to_user_profiles.sql
```

O si estás usando Supabase CLI:
```bash
supabase db push
```

### 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` o en la configuración de tu entorno:

```env
# Twilio Configuration
VITE_TWILIO_VERIFICATION_SID=tu-verification-service-sid

# URL de la API backend para Twilio (opcional)
# Si usas Supabase Edge Functions, se autodetecta desde VITE_SUPABASE_URL
# Si usas otro servicio, especifica la URL aquí:
# VITE_TWILIO_API_URL=https://tu-proyecto.supabase.co/functions/v1/twilio
```

**Nota**: Puedes usar el archivo `env.example.txt` como referencia. Copia ese archivo como `.env` y completa con tus valores.

⚠️ **IMPORTANTE**: Las credenciales sensibles (Account SID y Auth Token) NO deben estar en el `.env` del frontend. Solo se configuran como secrets en Supabase Edge Functions (ver paso 3.4).

### 3. Deployar Supabase Edge Function (Recomendado)

#### 3.1. Instalar Supabase CLI

```bash
npm install -g supabase
```

#### 3.2. Iniciar sesión en Supabase

```bash
supabase login
```

#### 3.3. Enlazar tu proyecto

```bash
supabase link --project-ref tu-project-ref
```

Puedes encontrar tu `project-ref` en la URL de tu proyecto Supabase: `https://[project-ref].supabase.co`

#### 3.4. Configurar Secrets de Twilio

Configura los secrets con tus credenciales de Twilio:

```bash
supabase secrets set TWILIO_ACCOUNT_SID=tu-account-sid
supabase secrets set TWILIO_AUTH_TOKEN=tu-auth-token
supabase secrets set TWILIO_VERIFICATION_SERVICE_SID=tu-verification-service-sid
```

**Alternativa**: También puedes configurar los secrets desde el Dashboard de Supabase:
1. Ve a **Settings** > **Edge Functions** > **Secrets**
2. Agrega cada variable con su valor correspondiente

#### 3.5. Deployar la función

```bash
supabase functions deploy twilio
```

Después del deploy, la URL será:
```
https://[project-ref].supabase.co/functions/v1/twilio
```

Si quieres usar una URL personalizada, puedes actualizar `VITE_TWILIO_API_URL` en tu `.env`, pero por defecto se detecta automáticamente desde `VITE_SUPABASE_URL`.

### 4. Alternativa: API Externa (Si no usas Supabase Edge Functions)

Si prefieres usar otro servicio (Netlify Functions, Vercel Functions, Express, etc.), puedes crear un endpoint que maneje las peticiones de Twilio.

Ejemplo de estructura del endpoint:

**POST /api/twilio**
```javascript
{
  "action": "enviar-otp" | "verificar-otp",
  "telefono": "+573001234567",
  "codigo": "123456", // solo para verificar-otp
  "verification_service_sid": "tu-verification-service-sid"
}
```

Luego actualiza `VITE_TWILIO_API_URL` en tu `.env` con la URL de tu endpoint.

## 🚀 Uso de la Funcionalidad

### Flujo de Usuario

1. **Seleccionar método de login**: El usuario puede elegir entre "Email" o "Teléfono" en la pantalla de login.

2. **Ingresar teléfono**: El usuario ingresa su número de teléfono (formato: 300 123 4567).

3. **Enviar código OTP**: El sistema envía un código de 6 dígitos por SMS usando Twilio.

4. **Verificar código**: El usuario ingresa el código recibido.

5. **Registro o Login**:
   - Si el usuario no existe, se le pedirá ingresar su nombre para crear la cuenta.
   - Si el usuario existe, se autenticará automáticamente.

### Funciones Disponibles en el Store

- `authStore.enviarOTPTelefono(telefono)`: Envía un código OTP por SMS
- `authStore.verificarOTPTelefono(telefono, codigo)`: Verifica el código OTP
- `authStore.loginConTelefono(telefono, codigo, nombre)`: Completa el login/registro con teléfono

## 🔒 Seguridad

- Los códigos OTP expiran después de 10 minutos (configurable en Twilio)
- Los códigos tienen un máximo de 3 intentos de verificación
- Los códigos expirados se limpian automáticamente de la base de datos
- Las credenciales de Twilio nunca se exponen al cliente

## 📱 Formato de Teléfonos

El sistema acepta números de teléfono en diferentes formatos:
- `3001234567` (10 dígitos, sin código de país)
- `+573001234567` (con código de país)
- `300 123 4567` (con espacios)

Todos se normalizan automáticamente al formato internacional (`+57XXXXXXXXXX` para Colombia).

## 🐛 Solución de Problemas

### Error: "Credenciales de Twilio no configuradas"
- Verifica que hayas configurado los secrets en Supabase Edge Functions
- Verifica que las variables `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` estén configuradas

### Error: "Verification Service SID no configurado"
- Asegúrate de que `TWILIO_VERIFICATION_SERVICE_SID` esté en los secrets o en `VITE_TWILIO_VERIFICATION_SID`

### Los códigos OTP no se envían
- Verifica que tu cuenta de Twilio tenga saldo disponible
- Verifica que el número de teléfono esté en el formato correcto
- Revisa los logs de Supabase Edge Functions para ver errores detallados

### Error: "Código OTP inválido"
- Verifica que el código tenga exactamente 6 dígitos
- Asegúrate de que el código no haya expirado (10 minutos)
- Verifica que no hayas excedido el número máximo de intentos

## 📝 Notas Importantes

1. **Costo de SMS**: Cada código OTP enviado tiene un costo en Twilio. Asegúrate de monitorear tu uso.

2. **Límites de Rate**: Twilio tiene límites de rate por defecto. Puedes ajustarlos en tu dashboard de Twilio.

3. **Números de Prueba**: Durante el desarrollo, puedes usar números de prueba de Twilio que no generan costos.

4. **Validación de Teléfonos**: Considera agregar validación adicional en el frontend para mejorar la experiencia del usuario.

## 🔄 Próximos Pasos

- [ ] Configurar rate limiting adicional en el backend
- [ ] Agregar notificaciones de éxito/error más detalladas
- [ ] Implementar vinculación de teléfono a cuentas existentes
- [ ] Agregar opción para cambiar número de teléfono
- [ ] Implementar reenvío automático de códigos

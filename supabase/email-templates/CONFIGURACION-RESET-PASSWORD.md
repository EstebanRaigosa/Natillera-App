# 🔐 Configuración de Restablecimiento de Contraseña

Este documento explica cómo configurar el restablecimiento de contraseña en Supabase.

## 📋 Configuración en Supabase Dashboard

### 1. Configurar el Template de Email

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Email Templates**
3. Busca el template **"Reset Password"** o **"Recovery"**
4. Configura el template:

   - **Subject**: `Restablecer tu contraseña - Natilleraapp`
   - **Body**: Copia el contenido del archivo `reset-password.html` o `reset-password.txt`

   **Nota**: Supabase usa el nombre `recovery` para el template de reset password según la [documentación oficial](https://supabase.com/docs/guides/local-development/customizing-email-templates#authemailtemplateresetpassword).

### 2. Configurar Redirect URLs

1. En el Dashboard, ve a **Authentication** → **URL Configuration**
2. En **Redirect URLs**, asegúrate de tener configuradas:

   Para producción:
   ```
   https://tu-dominio.com/auth/reset-password
   ```

   Para desarrollo local:
   ```
   http://localhost:5173/auth/reset-password
   ```

   Esto permite que Supabase redirija a los usuarios a tu página de restablecimiento después de hacer clic en el enlace del email.

### 3. Configurar Site URL

En la misma sección **URL Configuration**, configura la **Site URL**:

- **Producción**: `https://tu-dominio.com`
- **Desarrollo**: `http://localhost:5173`

## 🔄 Flujo Completo de Restablecimiento

```
Usuario hace clic en "Olvidé mi contraseña"
    ↓
Ingresa su correo electrónico
    ↓
Se envía email con enlace de recuperación
    ↓
Usuario hace clic en el enlace del email
    ↓
Supabase procesa el token y redirige a /auth/reset-password
    ↓
Usuario ingresa su nueva contraseña
    ↓
Contraseña se actualiza en Supabase
    ↓
Usuario es redirigido al login
    ↓
Usuario inicia sesión con su nueva contraseña
```

## 🔧 Desarrollo Local (Opcional)

Si estás usando Supabase localmente, puedes configurar el template en `supabase/config.toml`:

```toml
[auth.email.template.recovery]
subject = "Restablecer tu contraseña - Natilleraapp"
content_path = "./supabase/email-templates/reset-password.html"
```

Luego reinicia los contenedores de Supabase:

```bash
supabase stop && supabase start
```

## 📝 Variables Disponibles en el Template

El template de reset password tiene acceso a las siguientes variables:

- `{{ .ConfirmationURL }}` - URL de confirmación/recuperación con el token
- `{{ .Email }}` - Correo electrónico del usuario
- `{{ .SiteURL }}` - URL base de tu aplicación

## 🛠️ Solución de Problemas

### El enlace de reset no funciona

1. **Verifica las Redirect URLs**: Asegúrate de que `/auth/reset-password` esté en la lista de Redirect URLs permitidas
2. **Verifica la expiración**: Los enlaces de recuperación expiran después de 1 hora por defecto
3. **Revisa la consola del navegador**: Puede haber errores de JavaScript

### El usuario no puede actualizar la contraseña

1. **Verifica que el token sea válido**: El token en la URL debe ser válido y no haber expirado
2. **Revisa los logs de Supabase**: Puede haber errores en el proceso de actualización
3. **Verifica la validación**: Asegúrate de que la contraseña cumpla con los requisitos mínimos (6 caracteres)

### El usuario es redirigido pero ve un error

1. **Verifica que la ruta existe**: Asegúrate de que `/auth/reset-password` esté configurada en el router
2. **Verifica los permisos**: La página de reset password debería ser accesible sin autenticación previa
3. **Revisa la consola**: Puede haber errores de JavaScript en la página

## 🔗 Referencias

- [Documentación de Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Documentación de Supabase - Customizing Email Templates](https://supabase.com/docs/guides/local-development/customizing-email-templates)
- [Documentación de Supabase - Reset Password](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)


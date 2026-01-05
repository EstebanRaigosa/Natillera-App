# 🔧 Configuración de Redirección Post-Confirmación

Este documento explica cómo configurar Supabase para que redirija a los usuarios a la página de bienvenida después de confirmar su correo electrónico.

## 📋 Pasos para Configurar

### 1. Configurar Site URL en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **URL Configuration**
3. En el campo **Site URL**, ingresa la URL de tu aplicación:
   ```
   https://tu-dominio.com
   ```
   O para desarrollo local:
   ```
   http://localhost:5173
   ```

### 2. Configurar Redirect URLs

En la misma sección de **URL Configuration**, agrega las siguientes URLs en **Redirect URLs**:

```
https://tu-dominio.com/auth/welcome
http://localhost:5173/auth/welcome
```

Esto permite que Supabase redirija a los usuarios a la página de bienvenida después de confirmar su email.

### 3. Actualizar el Template de Email (Opcional)

Si quieres que el enlace de confirmación redirija directamente a la página de bienvenida, puedes modificar el template de email para incluir un parámetro de redirección:

En el template `confirmacion-signup.html`, el enlace ya usa `{{ .ConfirmationURL }}` que Supabase genera automáticamente. Supabase agregará automáticamente el parámetro `redirect_to` si está configurado en las Redirect URLs.

### 4. Verificar la Configuración

Para probar que todo funciona:

1. Registra un nuevo usuario
2. Revisa tu correo y haz clic en el enlace de confirmación
3. Deberías ser redirigido a `/auth/welcome`
4. Desde allí, puedes hacer clic en "Continuar al inicio de sesión"

## 🔄 Flujo Completo

```
Usuario se registra
    ↓
Recibe email de confirmación
    ↓
Hace clic en el enlace
    ↓
Supabase confirma el email
    ↓
Redirige a /auth/welcome
    ↓
Usuario ve página de bienvenida
    ↓
Hace clic en "Continuar al inicio de sesión"
    ↓
Va a /auth/login
    ↓
Inicia sesión
    ↓
Redirige a /dashboard
```

## 🛠️ Solución de Problemas

### El usuario no es redirigido a /auth/welcome

1. **Verifica las Redirect URLs**: Asegúrate de que `/auth/welcome` esté en la lista de Redirect URLs permitidas
2. **Verifica la Site URL**: Debe coincidir con el dominio de tu aplicación
3. **Revisa la consola del navegador**: Puede haber errores de JavaScript que impidan la redirección

### El usuario es redirigido pero ve un error

1. **Verifica que la ruta existe**: Asegúrate de que `/auth/welcome` esté configurada en el router
2. **Verifica los permisos**: La página de bienvenida no requiere autenticación, así que debería ser accesible

### El enlace de confirmación no funciona

1. **Verifica el template de email**: Asegúrate de que use `{{ .ConfirmationURL }}`
2. **Verifica la expiración**: Los enlaces de confirmación expiran después de 24 horas por defecto
3. **Revisa los logs de Supabase**: Puede haber errores en el proceso de confirmación

## 📝 Notas Adicionales

- La página de bienvenida (`/auth/welcome`) no requiere autenticación
- Si un usuario ya autenticado intenta acceder a `/auth/welcome`, será redirigido automáticamente al dashboard
- La página de bienvenida es opcional: si no está configurada, Supabase redirigirá a la Site URL por defecto

## 🔗 Referencias

- [Documentación de Supabase - URL Configuration](https://supabase.com/docs/guides/auth/auth-redirects)
- [Documentación de Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)


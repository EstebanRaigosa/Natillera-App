# 📧 Templates de Email para Supabase

Este directorio contiene los templates de email personalizados para la aplicación Natillerapp.

## 🎨 Template de Confirmación de Registro

El template `confirmacion-signup.html` está diseñado para ser consistente con el diseño de la aplicación:

- **Colores**: Gradientes verdes (#22c55e a #16a34a) que coinciden con el tema natillera
- **Tipografías**: Outfit para títulos, DM Sans para el cuerpo
- **Estilo**: Diseño moderno con glassmorphism y sombras suaves
- **Responsive**: Compatible con dispositivos móviles y clientes de email

## 📋 Cómo Configurar en Supabase

### Opción 1: Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Email Templates**
3. Selecciona el template **"Confirm signup"**
4. Copia el contenido de `confirmacion-signup.html` y pégalo en el editor HTML
5. (Opcional) Copia el contenido de `confirmacion-signup.txt` para la versión en texto plano
6. Guarda los cambios

### Opción 2: API de Supabase

Si prefieres usar la API, puedes actualizar el template mediante la API de Supabase:

```bash
curl -X PUT 'https://YOUR_PROJECT.supabase.co/auth/v1/settings' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": {
      "template": {
        "confirm_signup": {
          "subject": "Confirma tu registro - Natillerapp",
          "html": "...contenido del HTML...",
          "text": "...contenido del TXT..."
        }
      }
    }
  }'
```

## 🔧 Variables Disponibles

Supabase proporciona las siguientes variables en los templates:

- `{{ .ConfirmationURL }}` - URL de confirmación única para el usuario
- `{{ .Email }}` - Correo electrónico del usuario
- `{{ .Token }}` - Token de confirmación (si es necesario)
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL base de tu aplicación

## ✨ Características del Template

- ✅ Diseño responsive
- ✅ Compatible con clientes de email principales (Gmail, Outlook, Apple Mail)
- ✅ Estilo consistente con la aplicación
- ✅ Incluye versión en texto plano
- ✅ Mensajes claros y profesionales
- ✅ Información sobre próximos pasos

## 📝 Personalización

Puedes personalizar el template editando:

- **Colores**: Cambia los valores hexadecimales en los estilos inline
- **Texto**: Modifica los mensajes según tus necesidades
- **Logo**: Reemplaza el emoji 🌱 con tu logo si lo deseas
- **Información**: Actualiza la lista de características según tu aplicación

## 🔒 Seguridad

El template incluye:
- Enlace de expiración (24 horas por defecto en Supabase)
- Mensaje de seguridad si no se solicitó la cuenta
- Instrucciones claras para el usuario

## 📱 Soporte de Clientes de Email

El template está optimizado para:
- ✅ Gmail (web y móvil)
- ✅ Outlook (web y desktop)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Clientes móviles (iOS Mail, Android Gmail)

## 🐛 Solución de Problemas

Si el email no se ve correctamente:

1. **Verifica que el HTML sea válido**: Usa un validador HTML
2. **Prueba en diferentes clientes**: Algunos clientes tienen limitaciones
3. **Revisa las variables**: Asegúrate de que `{{ .ConfirmationURL }}` esté correctamente escrito
4. **Verifica el encoding**: El template usa UTF-8 para soportar emojis

## 📚 Recursos

- [Documentación de Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Guía de HTML para Emails](https://www.campaignmonitor.com/dev-resources/guides/coding/)


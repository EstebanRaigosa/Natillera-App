# Configuración de EmailJS para Respuestas de Soporte

## 📧 Configurar Template en EmailJS

Para que el sistema de respuestas funcione correctamente, necesitas crear un nuevo template en EmailJS.

### Pasos para crear el template:

1. **Ve al Dashboard de EmailJS**
   - Accede a: https://dashboard.emailjs.com/admin
   - Inicia sesión en tu cuenta

2. **Crea un nuevo Email Template**
   - Ve a "Email Templates"
   - Haz clic en "Create New Template"
   - Nombre sugerido: `support_reply` o `template_support_reply`

3. **Configura el template:**

   **From Name:**
   ```
   {{from_name}}
   ```

   **From Email:**
   ```
   {{from_email}}
   ```

   **Reply To:**
   ```
   {{reply_to}}
   ```

   **To Name:**
   ```
   {{to_name}}
   ```

   **To Email:**
   ```
   {{to_email}}
   ```

   **Subject:**
   ```
   {{subject}}
   ```

   **Content Type:** Selecciona **HTML**

   **Content (HTML):**
   ```
   {{message_html}}
   ```

4. **Configuración del Service:**
   - Asegúrate de usar el mismo Service ID que en `ChatWidget.vue`
   - Service ID: `service_vngs31j`
   - El servicio debe estar configurado para enviar desde `soporte@natillerapp.com`

5. **Variables del Template:**
   El template debe aceptar las siguientes variables:
   - `to_email` - Email del destinatario
   - `to_name` - Nombre del destinatario
   - `from_email` - Email del remitente (soporte@natillerapp.com)
   - `from_name` - Nombre del remitente (Soporte Natillerapp)
   - `reply_to` - Email para responder (soporte@natillerapp.com)
   - `subject` - Asunto del correo
   - `message_html` - Contenido HTML del correo (la plantilla completa)
   - `ticket_number` - Número del ticket (opcional, para uso futuro)
   - `message_text` - Versión texto del mensaje (opcional)

6. **Actualiza el Template ID en el código:**
   
   Una vez creado el template, copia su Template ID y actualízalo en `ChatAdmin.vue`:
   
   ```javascript
   const EMAILJS_TEMPLATE_ID_REPLY = 'tu_template_id_aqui'
   ```

## 🔧 Configuración del Email Service

### Para usar soporte@natillerapp.com como remitente:

1. **En EmailJS Dashboard:**
   - Ve a "Email Services"
   - Selecciona o crea un servicio
   - Configura el email remitente como `soporte@natillerapp.com`

2. **Verificación del dominio (recomendado):**
   - Si tienes un dominio propio, verifica `natillerapp.com` en EmailJS
   - Esto mejora la deliverabilidad y permite usar `soporte@natillerapp.com` directamente

## 📝 Ejemplo de Template Completo

Si prefieres crear el template manualmente, aquí está el contenido mínimo:

**From Name:** `Soporte Natilleraapp`  
**From Email:** `soporte@natillerapp.com`  
**Reply To:** `soporte@natillerapp.com`  
**To:** `{{to_email}}`  
**Subject:** `{{subject}}`  
**Content Type:** HTML  
**Body:** 
```html
{{message_html}}
```

## ✅ Verificación

Después de configurar:

1. Prueba enviar una respuesta desde el panel de administración
2. Verifica que el correo llegue al destinatario
3. Verifica que el remitente sea `soporte@natillerapp.com`
4. Verifica que el número de ticket aparezca en el correo
5. Verifica que el HTML se renderice correctamente

## 🐛 Troubleshooting

### El correo no se envía
- Verifica que el Template ID sea correcto
- Verifica que el Service ID sea correcto
- Revisa la consola del navegador para ver errores

### El remitente no es correcto
- Verifica la configuración del Email Service en EmailJS
- Asegúrate de que el servicio esté configurado para usar `soporte@natillerapp.com`

### El HTML no se renderiza
- Verifica que el Content Type esté configurado como HTML
- Verifica que `{{message_html}}` esté en el template

### El número de ticket no aparece
- Verifica que el template HTML incluye `{{ticket_number}}`
- El HTML ya viene generado con el número de ticket, así que si usas `{{message_html}}` completo, ya estará incluido


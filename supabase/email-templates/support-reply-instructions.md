# Plantilla de Respuesta de Soporte - Instrucciones de Uso

## 📋 Descripción

Esta plantilla HTML está diseñada para responder mensajes de soporte desde Gmail, manteniendo la identidad visual de Natillerapp.

## 🎨 Características

- ✅ Diseño responsive y compatible con Gmail
- ✅ Identidad visual de Natillerapp (colores, fuentes, estilo)
- ✅ Número de ticket dinámico mediante variable
- ✅ Botón de respuesta que pre-configura el asunto del correo
- ✅ Estilos inline para máxima compatibilidad

## 🚀 Formas de Uso

### Opción 1: Parámetro en la URL

Agregar el número de ticket como parámetro en la URL:

```
support-reply-template.html?ticket=12345
```

### Opción 2: Variable JavaScript Global

Definir una variable global antes de cargar el HTML:

```html
<script>
  window.TICKET_NUMBER = '12345';
</script>
```

### Opción 3: Atributo data en el body

Agregar un atributo `data-ticket-number` al elemento `<body>`:

```html
<body data-ticket-number="12345">
```

### Opción 4: Integración con Sistema de Tickets

Si tienes un sistema de tickets, puedes modificar el script para obtener el número desde tu API o base de datos.

## 📧 Implementación en Gmail

### Método A: Usar como Plantilla de Gmail

1. Abre Gmail en tu navegador
2. Ve a Configuración → Ver todas las configuraciones → Avanzado
3. Habilita "Plantillas"
4. Crea una nueva plantilla:
   - Abre el archivo HTML en un editor
   - Copia el contenido
   - Crea un nuevo correo en Gmail
   - Pega el HTML (puedes usar Ctrl+Shift+V o pegar como HTML)
   - Guarda como plantilla

### Método B: Extensión de Gmail (Recomendado)

Usa una extensión como "Boomerang" o "Gmail Templates" para gestionar plantillas HTML.

### Método C: Script de Apps Script

Crea un script de Google Apps Script que:

```javascript
function createSupportReply(ticketNumber) {
  const template = HtmlService.createTemplateFromFile('support-reply-template');
  template.ticketNumber = ticketNumber;
  
  const htmlBody = template.evaluate().getContent();
  
  GmailApp.createDraft(
    'email@example.com',
    'Respuesta ticket ' + ticketNumber,
    '',
    {htmlBody: htmlBody}
  );
}
```

## 🔧 Personalización

### Cambiar el Asunto del Correo

Modifica esta línea en el script JavaScript (línea ~162):

```javascript
const subject = encodeURIComponent('Respuesta ticket ' + ticketNumber);
```

### Personalizar el Contenido de la Respuesta

Edita la sección "Nuestra respuesta" dentro del HTML (líneas ~90-105) para cambiar el texto predeterminado.

### Cambiar Colores

Los colores principales están definidos en los gradientes:
- Verde principal: `#22c55e` → `#16a34a`
- Amarillo de información: `#fef3c7` con borde `#f59e0b`

## 📝 Notas Importantes

1. **Compatibilidad**: La plantilla usa tablas HTML y estilos inline para máxima compatibilidad con clientes de correo.

2. **JavaScript**: El script funciona cuando el HTML se abre en un navegador. En Gmail, el botón `mailto:` funcionará si Gmail está configurado como cliente de correo predeterminado.

3. **Personalización**: Antes de usar, personaliza el contenido de la respuesta según las necesidades de tu equipo de soporte.

4. **Testing**: Prueba la plantilla enviándote un correo de prueba para verificar que se ve correctamente.

## 🎯 Próximos Pasos

- [ ] Personalizar el texto de respuesta predeterminado
- [ ] Configurar la integración con tu sistema de tickets
- [ ] Probar en diferentes clientes de correo
- [ ] Entrenar al equipo de soporte en su uso


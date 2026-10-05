/*
 * Plantillas de los correos que el superadmin envía desde Admin → Correos.
 *
 * HTML de correo, no de página: tablas y estilos en línea, porque Gmail, Outlook y el
 * Mail de iPhone ignoran casi todo el CSS externo y los <style>. Ancho máximo 560 px; las
 * cinco caritas miden 56 px para caber en un celular de 320 px sin desbordar.
 *
 * Variables (las rellena la Edge Function `correo-masivo` para cada destinatario):
 *   {{saludo}}    «Hola, Ana» o «Hola» si no hay nombre
 *   {{nombre}}    primer nombre, ya escapado
 *   {{app_url}}   dirección de la app
 *   {{correo_id}} id del envío, para saber de qué correo viene cada opinión
 */

const CARAS = [
  { nota: 1, cara: '😞', texto: 'Mala' },
  { nota: 2, cara: '😕', texto: 'Regular' },
  { nota: 3, cara: '😐', texto: 'Normal' },
  { nota: 4, cara: '🙂', texto: 'Buena' },
  { nota: 5, cara: '🤩', texto: 'Excelente' }
]

const botonesNota = CARAS.map(({ nota, cara, texto }) => `
                <td align="center" style="padding: 0 2px;">
                  <a href="{{app_url}}/opinion?nota=${nota}&amp;c={{correo_id}}" target="_blank" style="display: block; width: 56px; max-width: 56px; padding: 10px 0 8px; border: 1px solid #d6ecd9; border-radius: 14px; background: #f6faf6; text-decoration: none; font-family: Arial, Helvetica, sans-serif;">
                    <span style="display: block; font-size: 28px; line-height: 32px;">${cara}</span>
                    <span style="display: block; margin-top: 4px; font-size: 10px; font-weight: bold; color: #1B5E37;">${texto}</span>
                  </a>
                </td>`).join('')

const experiencia = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>¿Cómo te ha ido con Natillerapp?</title>
</head>
<body style="margin: 0; padding: 0; background: #eef4ee;">
  <div style="display: none; max-height: 0; overflow: hidden;">Dos minutos para contarnos cómo te ha ido. Tu opinión decide lo que mejoramos.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #eef4ee;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background: #ffffff; border-radius: 20px; overflow: hidden; font-family: Arial, Helvetica, sans-serif;">
          <tr>
            <td align="center" style="background: #1B5E37; padding: 28px 24px 24px;">
              <p style="margin: 0; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #b9f0cc;">Natillerapp</p>
              <h1 style="margin: 10px 0 0; font-size: 24px; line-height: 30px; font-weight: bold; color: #ffffff;">¿Cómo te ha ido con Natillerapp?</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 28px 8px; color: #1f2937; font-size: 16px; line-height: 24px;">
              <p style="margin: 0 0 14px; font-weight: bold;">{{saludo}}:</p>
              <p style="margin: 0 0 14px;">Hace un tiempo empezaste a usar Natillerapp para llevar tu natillera y queremos saber cómo te ha ido. ¿Te ha servido? ¿Algo te ha costado o te ha faltado?</p>
              <p style="margin: 0;">Toca la carita que mejor describa tu experiencia:</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 16px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>${botonesNota}
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 28px 28px; color: #4b5563; font-size: 14px; line-height: 21px;">
              <p style="margin: 0 0 12px;">Al tocarla se abre la app para que, si quieres, nos dejes un comentario. Lo leemos todo y es lo que decide qué mejoramos primero.</p>
              <p style="margin: 0;">Gracias por confiar en nosotros,<br><strong style="color: #1B5E37;">El equipo de Natillerapp</strong></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background: #f6faf6; border-top: 1px solid #e6efe6; padding: 16px 24px; color: #9aa39a; font-size: 12px; line-height: 18px;">
              Recibes este correo porque tienes una cuenta en Natillerapp.<br>
              <a href="{{app_url}}" target="_blank" style="color: #1B5E37; font-weight: bold; text-decoration: none;">Abrir Natillerapp</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

export const PLANTILLAS = [
  {
    clave: 'experiencia',
    nombre: 'Encuesta de experiencia',
    asunto: '¿Cómo te ha ido con Natillerapp?',
    html: experiencia
  },
  {
    clave: 'libre',
    nombre: 'Correo en blanco',
    asunto: '',
    html: `<!doctype html>
<html lang="es">
<body style="margin: 0; padding: 24px 12px; background: #eef4ee; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px;">
    <tr><td style="padding: 28px; color: #1f2937; font-size: 16px; line-height: 24px;">
      <p style="margin: 0 0 14px; font-weight: bold;">{{saludo}}:</p>
      <p style="margin: 0;">Escribe aquí tu mensaje.</p>
    </td></tr>
  </table>
</body>
</html>`
  }
]

/** Para la vista previa: lo mismo que hará la función, con datos de ejemplo. */
export function rellenarEjemplo(html, { nombre = 'Ana', appUrl = window.location.origin } = {}) {
  return html
    .replaceAll('{{saludo}}', nombre ? `Hola, ${nombre}` : 'Hola')
    .replaceAll('{{nombre}}', nombre)
    .replaceAll('{{app_url}}', appUrl)
    .replaceAll('{{correo_id}}', 'prueba')
}

/**
 * Genera el par de claves VAPID para las notificaciones push del soporte.
 *
 *   node scripts/generar-claves-vapid.mjs
 *
 * La pública va al cliente (VITE_VAPID_PUBLIC_KEY en .env y en Netlify).
 * La privada va ÚNICAMENTE a los secretos de la Edge Function (RNF-07): si
 * acaba en el bundle, cualquiera puede enviar notificaciones en tu nombre.
 *
 * Se generan una sola vez. Cambiarlas invalida todas las suscripciones
 * existentes y obliga a cada usuario a volver a activar las notificaciones.
 */

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])

const publica = b64url(await crypto.subtle.exportKey('raw', par.publicKey))
const { d: privada } = await crypto.subtle.exportKey('jwk', par.privateKey)

console.log(`
Claves VAPID generadas
──────────────────────

1) Cliente — .env y variables de entorno de Netlify:

   VITE_VAPID_PUBLIC_KEY=${publica}

2) Servidor — panel de Supabase → Edge Functions → Secrets:

   VAPID_PUBLIC_KEY=${publica}
   VAPID_PRIVATE_KEY=${privada}
   VAPID_SUBJECT=mailto:tu-correo@natillerapp.com

   O por CLI:

   npx supabase secrets set VAPID_PUBLIC_KEY=${publica} \\
     VAPID_PRIVATE_KEY=${privada} \\
     VAPID_SUBJECT=mailto:tu-correo@natillerapp.com

⚠️  La clave privada no se vuelve a mostrar. Guárdala ahora.
`)

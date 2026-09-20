# Chat de soporte — puesta en marcha

Pasos para dejar funcionando lo que hay en el repositorio. El orden importa: la
migración antes que la Edge Function, y la Edge Function antes que el webhook.

Proyecto Supabase: `vdtjacwpvqfifahkrqxp` (us-east-1).

---

## 1. Base de datos — ✅ HECHO (2026-08-31)

Aplicadas por MCP sobre `vdtjacwpvqfifahkrqxp` (Postgres 17.6):

- `021_eliminar_chat_legacy.sql` — 11 mensajes respaldados en
  `chat_messages_respaldo_20260831` (sin acceso para `anon` ni `authenticated`);
  `chat_messages` y `chat_rate_limits` eliminadas.
- `022_soporte.sql` — 4 tablas con RLS, 2 vistas `security_invoker`, 8 índices,
  10 funciones, 3 políticas de Storage, bucket privado y Realtime.

Verificado en la base de datos, no solo aplicado:

| Comprobación | Resultado |
|---|---|
| RLS en las cuatro tablas | activada |
| Políticas sobre el hilo | solo SELECT; ninguna de INSERT/UPDATE/DELETE |
| Escritura de `authenticated` en el hilo | ninguna (revocada también por GRANT) |
| `nota_interna` en las columnas legibles | **no aparece** (CA-07) |
| RF-01 · apertura de conversación | correlativo y estado `abierta` |
| CA-16 · autoría | el servidor pone `autor = 'usuario'` |
| CA-04 · reintento con el mismo `client_id` | devuelve el mismo mensaje, un solo registro |
| CA-13 · otro usuario | 0 filas visibles y escritura rechazada |
| `es_super_admin` y las 8 funciones del soporte | ejecutables por `authenticated`, **no** por `anon` |

> **Corrección detectada en producción.** El `REVOKE ALL ... FROM public` de la
> migración no bastaba: Supabase concede `EXECUTE` explícitamente al rol `anon`
> en cada función nueva del esquema `public` (ALTER DEFAULT PRIVILEGES). El
> linter lo señaló, y `022_soporte.sql` incorpora ya el `REVOKE ... FROM anon`
> que faltaba. Quien parta del archivo desde cero no arrastra el problema.

Comprobar después:

```sql
-- Las cuatro tablas con RLS activada
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'soporte_%';

-- Las dos vistas con security_invoker
SELECT c.relname, c.reloptions FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname LIKE 'soporte_%' AND c.relkind = 'v';
```

Superadministrador: ✅ `raigo.16@gmail.com` quedó con `rol = 'super_admin'`.
Antes no había ninguno, así que el panel habría estado vacío para todos.

## 2. Realtime — ✅ HECHO

`soporte_mensajes` y `soporte_conversaciones` están en la publicación
`supabase_realtime`. La segunda la añadió `023_soporte_realtime_conversaciones.sql`
**con lista de columnas**, de modo que `nota_interna` no viaja por el canal
(comprobado: `filtra_nota_interna = false`). Sin esto el hilo
no se actualizaría solo: la app cae al modo degradado (recarga cada 60 s) y lo
indica en pantalla, pero no se pierde nada.

## 2 bis. Bucket viejo `support-files` — ⚠️ PENDIENTE (manual)

Era **público**: 3 archivos (1,5 MB, del 5 de enero) con URL permanente. Ya está
marcado como privado, así que esas URL han dejado de servir. El borrado
definitivo hay que hacerlo desde el panel, porque Supabase bloquea el `DELETE`
directo sobre `storage.objects` (trigger `storage.protect_delete`, para no dejar
archivos huérfanos):

**Storage → `support-files` → seleccionar los 3 archivos → Delete →** después
**Buckets → `support-files` → Delete bucket.**

## 3. Claves VAPID

```bash
npm run vapid:keys
```

Guarda las dos claves antes de cerrar la terminal: **la privada no se vuelve a
mostrar**. Cambiarlas más adelante invalida todas las suscripciones existentes y
obliga a cada usuario a volver a activar sus avisos.

- La **pública** va al cliente.
- La **privada** va solo a los secretos de la Edge Function (RNF-07).

## 4. Correo (Resend)

1. Crear cuenta en [resend.com](https://resend.com) — plan gratuito: 3.000
   correos/mes, 100/día.
2. **Domains → Add Domain** → `natillerapp.com`, y añadir en el DNS los
   registros SPF y DKIM que indique. Hasta que el dominio esté verificado solo
   se puede enviar al correo de la propia cuenta.
3. **API Keys → Create** con permiso de envío.

## 5. Secretos de la Edge Function

```bash
npx supabase login
npx supabase link --project-ref vdtjacwpvqfifahkrqxp

npx supabase secrets set \
  VAPID_PUBLIC_KEY=<pública> \
  VAPID_PRIVATE_KEY=<privada> \
  VAPID_SUBJECT=mailto:soporte@natillerapp.com \
  RESEND_API_KEY=<api key de Resend> \
  SOPORTE_EMAIL_FROM="Natillerapp <soporte@natillerapp.com>" \
  SOPORTE_APP_URL=https://natillerapp.com
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` las inyecta la plataforma; no hay
que declararlas.

## 6. Desplegar la Edge Function — ✅ HECHO (2026-09-01)

Desplegada por MCP: `soporte-notificar`, versión 1, ACTIVE, con `verify_jwt`.
Comprobado que arranca y que rechaza lo que debe:

| Prueba | Resultado |
|---|---|
| POST con la clave anónima | `401 {"error":"no autorizado"}` — respuesta de la propia función, así que el runtime arrancó e importó `webpush.ts` sin errores |
| POST sin cabecera `Authorization` | `401 UNAUTHORIZED_NO_AUTH_HEADER` — la corta la plataforma |

Para volver a desplegarla tras un cambio:

```bash
npx supabase functions deploy soporte-notificar
```

> Mientras falten los secretos VAPID, la función responde `200` con
> `entregados: 0` y no envía nada. No falla: simplemente no tiene con qué
> firmar. Lo mismo con `RESEND_API_KEY` y el correo.

## 7. Database Webhook

Panel → **Database → Webhooks → Create a new hook**:

| Campo | Valor |
|-------|-------|
| Name | `soporte_mensaje_creado` |
| Table | `public.soporte_mensajes` |
| Events | `Insert` |
| Type | Supabase Edge Functions → `soporte-notificar` |
| HTTP Headers | `Authorization: Bearer <SERVICE_ROLE_KEY>` |

La cabecera no es opcional: la función rechaza con 401 cualquier invocación que
no la traiga.

Se usa un webhook y no un trigger con `pg_net` porque el webhook no participa en
la transacción del INSERT: si la notificación falla, el mensaje se guarda igual
(RNF-10, CA-20).

## 7 bis. Entornos y URLs

| Entorno | URL | Notas |
|---|---|---|
| Desarrollo desplegado | `https://natilleradev.netlify.app` | El que se usa hoy para probar |
| Producción | `https://natillerapp.com` | Dominio propio, el que se verifica en Resend |

Consecuencias que se olvidan con facilidad:

- **`SOPORTE_APP_URL`** (secreto de la función) debe apuntar al entorno que se
  esté usando: es la URL de los enlaces de los correos de respaldo.
- **Las suscripciones push van por origen.** Las registradas en
  `natilleradev.netlify.app` no sirven en `natillerapp.com`: al cambiar de
  dominio, cada usuario tiene que volver a activar los avisos. No es un fallo,
  es cómo funciona el navegador.
- **El remitente del correo es independiente del sitio.** Se puede verificar
  `natillerapp.com` en Resend y enviar desde ahí aunque la app esté servida
  desde `netlify.app`. Lo que no se puede es verificar un dominio de Netlify:
  su DNS no es tuyo.

## 8. Variable de entorno del cliente

En `.env` (local) y en **Netlify → Site settings → Environment variables**:

```
VITE_VAPID_PUBLIC_KEY=<la clave pública>
```

Es pública por diseño: identifica al servidor de aplicación ante el servicio
push, no autoriza a enviar nada.

⚠️  **El orden importa.** Vite incrusta esta variable al compilar, no la lee en
tiempo de ejecución: si se despliega antes de añadirla, la app seguirá diciendo
que falta hasta el siguiente build. Primero la variable en Netlify, después el
deploy.

Cómo comprobar que el build nuevo llegó:

```bash
curl -s https://natilleradev.netlify.app/sw.js | wc -c   # ~17 KB, no 4,7 KB
curl -s https://natilleradev.netlify.app/sw.js | grep -c notificationclick   # 1
```

---

## Comprobación de que todo está vivo

1. Entra en `/soporte` y abre una conversación. Debe aparecer con su número.
2. Entra en `/configuracion` → **Avisos de soporte** → *Activar avisos*.
   En iPhone hay que instalar antes la app en la pantalla de inicio (RNF-05).
3. Desde otro navegador con la cuenta de superadministrador, entra en
   `/admin/soporte`, responde, y comprueba que:
   - el mensaje aparece en el hilo del usuario sin recargar (Realtime),
   - llega la notificación push,
   - al pulsarla se abre esa conversación.
4. Con los avisos desactivados, responde otra vez: debe llegar el correo y
   **no** debe llegar push. Nunca los dos (RF-12).
5. Logs de la función: panel → **Edge Functions → soporte-notificar → Logs**.
   Cada invocación devuelve un resumen con `entregados`, `caducadas`,
   `correoEnviado` y `errorCorreo`.

## Qué mirar si algo no funciona

| Síntoma | Dónde mirar |
|---------|-------------|
| El hilo no se actualiza solo | Realtime (paso 2). La app lo indica con «actualización cada minuto» |
| No llega push ni correo | Logs de la función. Si no hay ninguna invocación, el webhook no está creado o le falta la cabecera |
| Push falla con 401/403 | Las claves VAPID del cliente y del servidor no son el mismo par |
| El correo no sale | Dominio sin verificar en Resend, o `SOPORTE_EMAIL_FROM` con un dominio distinto al verificado |
| «Falta configurar VITE_VAPID_PUBLIC_KEY» | Paso 8, y redeploy de Netlify |
| El panel `/admin/soporte` redirige al dashboard | `user_profiles.rol` no es `super_admin`, o `activo` está en false |

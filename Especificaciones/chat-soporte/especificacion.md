# Especificación — Chat de soporte

| Campo | Valor |
|-------|-------|
| **Módulo** | Soporte (transversal) |
| **Estado** | Implementado (pendiente de despliegue) |
| **Versión** | 2.8 |
| **Fecha** | 2026-08-31 |
| **Autor** | Esteban |
| **Ruta(s) de la app** | `/soporte` · `/soporte/:conversacionId` · `/admin/soporte` · `/admin/soporte/:conversacionId` |
| **Archivos** | `src/views/soporte/Soporte.vue`, `src/views/admin/SoporteAdmin.vue`, `src/components/soporte/{HiloMensajes,BurbujaMensaje,RedactorMensaje,NuevaConversacionModal,EliminarConversacionModal,AjustesNotificaciones}.vue`, `src/stores/soporte.js`, `src/composables/{useSoporteRealtime,usePush}.js`, `src/sw.js`, `supabase/functions/soporte-notificar/{index.ts,webpush.ts}`, `migrations/022_soporte.sql`, `scripts/generar-claves-vapid.mjs` |

> Diseño nuevo. No hereda modelo de datos, componentes ni decisiones de ninguna
> implementación anterior; la migración `021_eliminar_chat_legacy.sql` retira lo que había.

---

## 1. Objetivo

Que cualquier usuario de Natillerapp pueda escribir a soporte desde dentro de la
aplicación y mantener una conversación, y que el superadministrador la atienda desde un
panel único. Ninguna de las dos partes debe tener la aplicación abierta para enterarse de
que hay un mensaje nuevo.

## 2. Contexto y alcance

**Dentro del alcance**

- Conversación de ida y vuelta, persistente, visible dentro de la app para ambas partes.
- Envío fiable: el mensaje no se pierde aunque falle la red, y no se duplica al reintentar.
- Panel del superadministrador: bandeja, filtros, búsqueda, respuesta, estados.
- Entrega inmediata con la pantalla abierta.
- Notificaciones push del navegador en ambos sentidos.
- Correo como vía de respaldo cuando el push no está disponible.
- Adjuntos en almacenamiento privado.
- Aislamiento estricto: nadie ve conversaciones ajenas.

**Fuera del alcance** (explícito)

- Chat entre socios, o entre administrador de natillera y sus socios. El canal es
  exclusivamente **usuario ↔ soporte de Natillerapp**.
- Usuarios sin sesión iniciada (ver RN-01).
- Varios agentes de soporte, colas, asignación o escalado.
- Respuestas automáticas, bots, IA o base de conocimiento.
- Notificaciones por SMS o WhatsApp.
- Indicador de «escribiendo», confirmaciones de lectura visibles para la otra parte,
  reacciones, edición o borrado de mensajes enviados.
- Búsqueda de texto completo dentro de los mensajes.
- Valoración de la atención (CSAT), métricas de tiempo de respuesta, exportación.

**Supuestos**

- La app es una PWA con service worker (`vite-plugin-pwa`).
- `user_profiles.rol` admite `'super_admin'`.
- Supabase Realtime está disponible en el proyecto.
- Hay una sola persona atendiendo el soporte.

## 3. Actores y permisos

| Actor | Puede | No puede |
|-------|-------|----------|
| Usuario autenticado | Abrir conversaciones; leer y escribir **solo en las suyas**; adjuntar archivos; reabrir una conversación cerrada escribiendo en ella | Ver conversaciones ajenas; cambiar estados; borrar; entrar al panel de soporte |
| Administrador de natillera | Igual que cualquier usuario autenticado | Serlo de una natillera no da privilegios de soporte |
| Colaborador | Igual que cualquier usuario autenticado | — |
| Socio (portal) | Fuera de alcance en esta versión | — |
| Superadministrador | Ver todas las conversaciones; responder; cambiar estado; añadir notas internas; borrar | Escribir haciéndose pasar por el usuario |

**Identificación del superadministrador.** Se resuelve en la base de datos con
`user_profiles.rol = 'super_admin'`, expuesto por la función `es_super_admin()` (§6.4).
Nunca comparando un correo en el cliente: un valor del cliente no es una credencial.

## 4. Requisitos funcionales

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01 | El usuario abre una conversación de soporte desde cualquier pantalla | Must |
| RF-02 | El usuario escribe mensajes sucesivos dentro de una conversación | Must |
| RF-03 | El usuario ve sus conversaciones y el historial completo de cada una | Must |
| RF-04 | El envío es fiable ante fallos de red y no genera duplicados | Must |
| RF-05 | El usuario adjunta archivos a un mensaje | Should |
| RF-06 | El superadministrador ve una bandeja de conversaciones filtrable y con búsqueda | Must |
| RF-07 | El superadministrador responde dentro del hilo | Must |
| RF-08 | El superadministrador cambia el estado de una conversación y anota internamente | Must |
| RF-09 | Los mensajes nuevos aparecen sin recargar mientras la pantalla está abierta | Must |
| RF-10 | El superadministrador recibe push cuando un usuario escribe | Must |
| RF-11 | El usuario recibe push cuando el soporte responde | Must |
| RF-12 | Si el push no llega, la notificación se entrega por correo | Must |
| RF-13 | Cada usuario activa o desactiva sus notificaciones, por dispositivo | Must |
| RF-14 | Cada parte ve cuántos mensajes sin leer tiene | Should |
| RF-15 | Un usuario no puede leer ni alterar conversaciones ajenas | Must |
| RF-16 | El panel de soporte es inaccesible para quien no es superadministrador | Must |
| RF-17 | Los adjuntos solo son accesibles para las partes de la conversación | Must |
| RF-18 | El sistema limita la frecuencia de apertura y de envío | Should |
| RF-19 | El superadministrador puede borrar una conversación completa | Could |

### Detalle por requisito

#### RF-01 — Abrir una conversación
- **Descripción:** un botón presente en toda la app lleva a `/soporte`. Si el usuario no
  tiene ninguna conversación abierta, el primer envío crea una.
- **Entradas:** `asunto` (5–120 caracteres, obligatorio), `categoria` (RN-04, obligatorio),
  `cuerpo` (10–4.000 caracteres, obligatorio), `adjuntos` (0–5, RF-05).
- **Validaciones:** en cliente para dar respuesta inmediata y **de nuevo en el servidor**,
  dentro de la función `soporte_enviar_mensaje` (§6.5). La validación de cliente es
  comodidad; la de servidor es la que cuenta.
- **Salida:** fila en `soporte_conversaciones` (estado `abierta`) y primera fila en
  `soporte_mensajes` con `autor = 'usuario'`. Dispara RF-10.
- **Errores:** el texto redactado **nunca se pierde**; permanece en el redactor con el
  motivo del fallo y un botón de reintento.

#### RF-02 — Conversar
- **Descripción:** dentro de una conversación, usuario y soporte alternan sin límite de
  turnos.
- **Entradas:** `cuerpo` (1–4.000 caracteres), `adjuntos` (0–5).
- **Validaciones:** la conversación existe, pertenece al usuario y no está `archivada`.
- **Salida:** fila en `soporte_mensajes`; `ultimo_mensaje_at` de la conversación se
  actualiza por trigger; si estaba `resuelta`, vuelve a `abierta` (RN-06).

#### RF-03 — Historial del usuario
- **Descripción:** lista de conversaciones con asunto, estado, fecha del último mensaje y
  contador de no leídos. Al abrir una, se ve el hilo.
- **Carga:** los 30 mensajes más recientes; el resto se pagina hacia atrás al desplazarse
  (RNF-04).
- **Salida:** al abrir, los mensajes de soporte se marcan leídos para el usuario.

#### RF-04 — Envío fiable
Es el requisito que separa un chat usable de uno que frustra. Tres piezas:

1. **Identificador de cliente.** El redactor genera un `client_id` (UUID) *antes* de
   enviar. La tabla tiene `UNIQUE (conversacion_id, client_id)`. Un reintento con el mismo
   `client_id` no crea un segundo mensaje: la función devuelve el que ya existe. Esto es lo
   que evita el mensaje duplicado cuando la red va lenta y la persona vuelve a pulsar.
2. **Estados visibles.** Cada mensaje propio muestra `enviando` → `enviado`, o `fallido`
   con opción de reintentar. Sin estado visible, el usuario reenvía por desconfianza.
3. **Cola local.** Un mensaje que no se pudo enviar queda en `localStorage` asociado a su
   conversación y se reintenta al recuperar conexión (evento `online`) o al reabrir la
   pantalla. Se descarta tras 24 h o cuando el usuario lo cancela.

- **Errores:** un fallo de red deja el mensaje en `fallido`, nunca lo hace desaparecer.

#### RF-05 — Adjuntos
- **Límites:** 5 archivos por mensaje, 5 MB cada uno.
- **Tipos admitidos:** `image/png`, `image/jpeg`, `image/webp`, `image/heic`,
  `application/pdf`, `text/plain`. Cualquier otro se rechaza en cliente y en la política
  del bucket.
- **Orden de operaciones:** los archivos se suben **antes** de crear el mensaje. Si alguno
  falla, se avisa y el usuario decide si envía sin él o reintenta. Nunca se crea un mensaje
  que apunte a un archivo inexistente.
- **Representación:** filas en `soporte_adjuntos`. El cuerpo del mensaje no contiene URLs.

#### RF-06 — Bandeja del superadministrador
- **Descripción:** lista ordenada por `ultimo_mensaje_at` descendente.
- **Filtros:** estado (todas / sin responder / abiertas / en proceso / resueltas) y
  categoría. **Búsqueda** por asunto o correo del usuario.
- **Paginación:** 25 por página (RNF-08).
- **Contador:** procede de la vista `soporte_resumen_bandeja` (§6.3), calculado en el
  servidor. El cliente no descarga mensajes para contar.

#### RF-07 — Responder
- **Entradas:** `cuerpo` (1–4.000 caracteres), `adjuntos` (0–5).
- **Salida:** mensaje con `autor = 'soporte'`. Dispara RF-11 y, en su defecto, RF-12.
- **Regla:** la respuesta se guarda siempre en la conversación. La notificación es un
  efecto posterior e independiente (RNF-10).

#### RF-08 — Estado y notas internas
- **Entradas:** `estado` (RN-05), `nota_interna` (0–1.000 caracteres).
- **Regla:** la nota interna **no se expone jamás** al usuario. No basta con ocultarla en
  la interfaz: la política RLS de lectura del usuario no debe devolver esa columna (§6.4).

#### RF-09 — Tiempo real
- **Medio:** Supabase Realtime, canal por conversación, suscrito a inserciones en
  `soporte_mensajes` filtradas por `conversacion_id`.
- **Reconciliación:** al llegar un mensaje propio por Realtime, se emparejan por `client_id`
  con el que ya está pintado en local, en vez de añadirlo otra vez.
- **Degradación:** si la suscripción no se establece o se cae, la pantalla pasa a recargar
  cada 60 s y lo indica discretamente. Nunca se queda sin vía de actualización.
- **Limpieza:** el canal se cierra en `onUnmounted`. Una suscripción huérfana por
  conversación visitada es una fuga.

#### RF-10 — Push al superadministrador
- **Disparo:** inserción de un mensaje con `autor = 'usuario'`.
- **Contenido:** título `Soporte · <categoría>`; cuerpo con el correo del usuario y los
  primeros 120 caracteres; acción que abre `/admin/soporte/:id`.
- **Agrupación:** `tag = conv-<id>` para que varios mensajes de la misma conversación
  sustituyan la notificación anterior en lugar de apilarse.

#### RF-11 — Push al usuario
- **Disparo:** inserción de un mensaje con `autor = 'soporte'`.
- **Contenido:** título `Respuesta de soporte`; cuerpo con los primeros 120 caracteres;
  acción que abre `/soporte/:id`.
- **Regla de privacidad:** el cuerpo **no** incluye cifras, saldos ni nombres de natillera.
  Una notificación se muestra en la pantalla bloqueada, a la vista de cualquiera.

#### RF-12 — Respaldo por correo
- **Descripción:** si el destinatario no tiene suscripciones activas, o todos los envíos
  push fallan, la notificación va por correo.
- **Regla:** no se envía correo si algún push se entregó. Nunca los dos.
- **Origen:** la Edge Function. Nunca el navegador de una de las partes.

#### RF-13 — Permiso de notificaciones
- **Descripción:** en `/configuracion`, un control activa o desactiva el push **en ese
  dispositivo**. Cada navegador es una suscripción independiente.
- **Regla de solicitud:** el permiso se pide **solo** tras una pulsación explícita, nunca
  al cargar la app. Una petición automática se deniega de por vida en la mayoría de
  navegadores y deja al usuario sin la opción.
- **Estados a mostrar:** no soportado · requiere instalar la PWA (iOS, RNF-05) · sin
  conceder · denegado, con instrucciones para revertirlo desde los ajustes del navegador ·
  activo en este dispositivo.
- **Baja:** desactivar borra la suscripción del servidor y del navegador
  (`PushSubscription.unsubscribe()`), no solo una de las dos.

#### RF-14 — No leídos
- **Cálculo:** para el usuario, mensajes de `soporte` posteriores a `leido_usuario_at` de
  la conversación. Para el soporte, el equivalente con `leido_soporte_at`.
- **Regla:** el marcador de lectura vive en la conversación, no por mensaje. Es más simple,
  más barato de consultar y suficiente para lo que se necesita.

#### RF-15 — Aislamiento
- **Descripción:** un usuario solo alcanza sus propias conversaciones y mensajes, en
  lectura y en escritura, aunque construya la petición a mano contra la API.
- **Medio:** RLS (§6.4). Es la única barrera real; la interfaz no protege nada.

#### RF-16 — Acceso al panel
- **Descripción:** `/admin/soporte` lleva `meta: { requiresSuperAdmin: true }` y el guard
  del router redirige a `/dashboard` a quien no lo sea.
- **Regla:** el guard es comodidad de interfaz. Aunque alguien fuerce la ruta, RLS no le
  devuelve datos.

#### RF-17 — Adjuntos privados
- **Descripción:** bucket privado. La descarga usa URL firmada de 15 minutos, emitida solo
  tras comprobar que quien la pide participa en la conversación.
- **Regla:** nunca `getPublicUrl()`. Una URL pública es permanente y no se puede revocar.

#### RF-18 — Límite de frecuencia
- **Límites:** 5 conversaciones nuevas por hora y 30 mensajes por hora, por usuario.
  El superadministrador queda exento.
- **Medio:** contado sobre `soporte_mensajes` dentro de `soporte_enviar_mensaje`, usando
  `(select auth.uid())`. No hace falta tabla de apoyo ni contar por IP: en un canal solo
  para autenticados, la identidad no se puede falsear y la IP sí.
- **Errores:** se indica cuántos minutos faltan. El texto no se pierde.

#### RF-19 — Borrado
- **Descripción:** borra la conversación, sus mensajes y sus adjuntos, incluidos los
  objetos del bucket.
- **Validación:** confirmación en modal que exige escribir el número de conversación.
  Es irreversible.

## 5. Reglas de negocio

| ID | Regla |
|----|-------|
| RN-01 | Solo usuarios con sesión iniciada usan el soporte |
| RN-02 | Una conversación pertenece a un único usuario y no se transfiere |
| RN-03 | Un usuario puede tener varias conversaciones abiertas a la vez |
| RN-04 | Categorías: `error` · `duda` · `sugerencia` · `cuenta` · `otro` |
| RN-05 | Estados: `abierta` → `en_proceso` → `resuelta` → `archivada` |
| RN-06 | Un mensaje del usuario en una conversación `resuelta` la devuelve a `abierta` |
| RN-07 | Una conversación `resuelta` sin actividad durante 30 días pasa a `archivada` |
| RN-08 | Una conversación `archivada` es de solo lectura para el usuario |
| RN-09 | El número visible es `#` + entero correlativo de una secuencia de Postgres |
| RN-10 | Un mensaje enviado no se edita ni se borra individualmente |
| RN-11 | Las notas internas no son visibles para el usuario en ninguna circunstancia |
| RN-12 | Si se elimina la cuenta de un usuario, sus conversaciones se borran en cascada |

**Justificación de RN-01.** Sin identidad no hay hilo al que volver ni destinatario al que
notificar: el usuario escribiría a ciegas y solo podría recibir respuesta por correo. Como
además todo el valor de la app está tras el inicio de sesión, quien tiene un problema real
casi siempre tiene cuenta. Para quien no la tiene, el correo público sigue siendo la vía.

**Justificación de RN-12.** El soporte de una app financiera no necesita conservar hilos
de cuentas eliminadas, y conservarlos complica el cumplimiento de una solicitud de borrado.

**Detalle de RN-05 — transiciones permitidas**

| Desde | Hacia | Quién |
|-------|-------|-------|
| `abierta` | `en_proceso`, `resuelta` | Superadministrador |
| `en_proceso` | `resuelta` | Superadministrador |
| `resuelta` | `abierta` | Automático (RN-06) o superadministrador |
| `resuelta` | `archivada` | Automático (RN-07) o superadministrador |
| `archivada` | `abierta` | Superadministrador |

Cualquier otra transición se rechaza en la función que la aplica. El usuario nunca cambia
un estado directamente; solo lo provoca por RN-06.

## 6. Modelo de datos

Migración: `migrations/022_soporte.sql`.

### 6.1 Tablas

| Tabla | Campos | Notas |
|-------|--------|-------|
| `soporte_conversaciones` | `id` uuid PK · `numero` bigint UNIQUE DEFAULT `nextval` · `user_id` uuid FK `auth.users` ON DELETE CASCADE NOT NULL · `user_email` text NOT NULL · `asunto` text · `categoria` text · `estado` text · `nota_interna` text · `ultimo_mensaje_at` timestamptz · `leido_usuario_at` timestamptz · `leido_soporte_at` timestamptz · `created_at` · `updated_at` | CHECK sobre `categoria` (RN-04) y `estado` (RN-05) |
| `soporte_mensajes` | `id` uuid PK · `conversacion_id` uuid FK ON DELETE CASCADE · `client_id` uuid NOT NULL · `autor` text CHECK (`usuario`\|`soporte`) · `cuerpo` text NOT NULL · `created_at` | `UNIQUE (conversacion_id, client_id)` → idempotencia (RF-04) |
| `soporte_adjuntos` | `id` uuid PK · `mensaje_id` uuid FK ON DELETE CASCADE · `ruta` text · `nombre` text · `mime` text · `bytes` int · `created_at` | La ruta apunta al bucket privado |
| `soporte_push` | `id` uuid PK · `user_id` uuid FK ON DELETE CASCADE · `endpoint` text UNIQUE · `p256dh` text · `auth` text · `user_agent` text · `activa` boolean DEFAULT true · `created_at` · `ultimo_envio_at` | Una fila por navegador |

`user_email` se guarda desnormalizado a propósito: el panel lo necesita en cada fila de la
bandeja y consultarlo contra `auth.users` en cada carga es un cruce que no aporta nada.

### 6.2 Índices

```sql
CREATE INDEX idx_soporte_conv_user     ON soporte_conversaciones(user_id);
CREATE INDEX idx_soporte_conv_estado   ON soporte_conversaciones(estado);
CREATE INDEX idx_soporte_conv_ultimo   ON soporte_conversaciones(ultimo_mensaje_at DESC);
CREATE INDEX idx_soporte_msg_conv      ON soporte_mensajes(conversacion_id, created_at DESC);
CREATE INDEX idx_soporte_push_user     ON soporte_push(user_id) WHERE activa;
```

`idx_soporte_msg_conv` es compuesto y en el mismo orden en que se consulta el hilo
(por conversación, más recientes primero), que es lo que permite paginar sin ordenar en
memoria.

### 6.3 Vista de resumen

```sql
CREATE VIEW soporte_resumen_bandeja
WITH (security_invoker = true) AS
SELECT c.id, c.numero, c.user_email, c.asunto, c.categoria, c.estado,
       c.ultimo_mensaje_at,
       (SELECT COUNT(*) FROM soporte_mensajes m
         WHERE m.conversacion_id = c.id
           AND m.autor = 'usuario'
           AND (c.leido_soporte_at IS NULL OR m.created_at > c.leido_soporte_at)
       ) AS sin_leer_soporte
FROM soporte_conversaciones c;
```

`security_invoker = true` es obligatorio: sin él la vista se ejecuta con los permisos de
quien la creó y **saltaría el RLS de las tablas subyacentes**, dejando la bandeja completa
al alcance de cualquiera.

### 6.4 Seguridad a nivel de fila

```sql
CREATE OR REPLACE FUNCTION es_super_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = (SELECT auth.uid()) AND rol = 'super_admin' AND activo
  );
$$;
```

```sql
ALTER TABLE soporte_conversaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY conv_select ON soporte_conversaciones
  FOR SELECT USING (user_id = (SELECT auth.uid()) OR es_super_admin());

CREATE POLICY conv_insert ON soporte_conversaciones
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY conv_update ON soporte_conversaciones
  FOR UPDATE USING (es_super_admin()) WITH CHECK (es_super_admin());

CREATE POLICY conv_delete ON soporte_conversaciones
  FOR DELETE USING (es_super_admin());
```

Los mensajes heredan la pertenencia de su conversación:

```sql
CREATE POLICY msg_select ON soporte_mensajes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM soporte_conversaciones c
            WHERE c.id = conversacion_id
              AND (c.user_id = (SELECT auth.uid()) OR es_super_admin()))
  );
```

Cuatro reglas que la migración debe cumplir:

1. **`auth.uid()` siempre envuelto en `(SELECT auth.uid())`.** Sin el envoltorio, Postgres
   lo reevalúa por fila en lugar de una vez por consulta.
2. **RLS activada en las cuatro tablas.** Una tabla con RLS activada y sin políticas no
   devuelve nada, que es el fallo seguro. Al revés —tabla sin RLS— queda abierta.
3. **Ninguna política con `USING (true)`.** Si una política no restringe, sobra.
4. **`nota_interna` fuera del alcance del usuario.** El usuario nunca consulta
   `soporte_conversaciones` directamente: lee de la vista `soporte_conversaciones_usuario`,
   que no incluye esa columna. RLS filtra filas, no columnas.

### 6.5 Función de envío

Todo mensaje entra por aquí. Es el único camino de escritura y concentra idempotencia,
validación, límite de frecuencia y actualización de la conversación en una transacción.

```
soporte_enviar_mensaje(
  p_conversacion_id uuid,   -- NULL para abrir una conversación nueva
  p_client_id       uuid,   -- idempotencia (RF-04)
  p_cuerpo          text,
  p_asunto          text,   -- solo al abrir
  p_categoria       text    -- solo al abrir
) RETURNS jsonb
```

Comportamiento:

1. Si ya existe un mensaje con ese `(conversacion_id, client_id)`, lo devuelve sin crear
   nada. La operación es idempotente.
2. Valida longitudes, categoría y estado de la conversación.
3. Aplica RF-18.
4. Determina `autor` según `es_super_admin()`. **No se acepta como parámetro:** si el
   cliente pudiera declarar quién escribe, cualquiera enviaría mensajes firmados como
   soporte.
5. Inserta, actualiza `ultimo_mensaje_at` y aplica RN-06.
6. Devuelve el mensaje creado.

`SECURITY INVOKER`, para que RLS siga aplicando dentro de la función.

### 6.6 Almacenamiento

Bucket `soporte-adjuntos`, **privado**. Ruta `<conversacion_id>/<mensaje_id>/<archivo>`.
La política de subida exige que la primera carpeta de la ruta corresponda a una
conversación del usuario, de modo que nadie pueda escribir en la carpeta de otro. Descarga
solo por URL firmada (RF-17).

## 7. Interfaz de usuario

### 7.1 Acceso

- Entrada permanente en el menú lateral y en `MobileBottomNav`, con insignia de no leídos.
- Se descarta el botón flotante: en móvil compite con la barra inferior y con los pies de
  las modales, y obliga a lógica de ocultamiento que se rompe con facilidad.

### 7.2 Pantalla del usuario — `/soporte`

- **Móvil:** lista de conversaciones a pantalla completa; al abrir una, el hilo ocupa la
  pantalla con cabecera fija (asunto y estado), hilo con scroll propio y redactor anclado
  abajo.
- **Desktop:** dos columnas — lista (320 px) e hilo.
- **Estados:** carga (esqueleto de burbujas) · vacío · error con reintento · archivada
  (redactor deshabilitado, con el motivo) · sin conexión (aviso y mensajes en cola).

### 7.3 Panel — `/admin/soporte`

- **Desktop:** filtros y búsqueda arriba; bandeja a la izquierda; a la derecha el hilo con
  redactor, selector de estado y campo de nota interna claramente marcado como privado.
- **Móvil:** dos niveles (bandeja → hilo) con botón de volver.

### 7.4 Transversal

- **Modales** (nueva conversación, confirmar borrado): `ModalWrapper`, con la skill
  `natillerapp-modals`, obligatoria al construirlos.
- **Iconos:** `@heroicons/vue/24/outline`. **Marca:** `#1B5E37`; backdrop salvia `#C8D9C8`.
- **Burbujas:** usuario a la derecha sobre `#1B5E37` con texto claro; soporte a la
  izquierda sobre superficie neutra. Contraste mínimo 4.5:1 en ambos temas.
- **Estado del mensaje:** `enviando` (reloj tenue), `enviado` (marca), `fallido` (icono de
  alerta y botón «Reintentar»). Se distingue por forma además de por color.
- **Estado de la conversación:** pastilla con etiqueta textual, no solo color.

## 8. Requisitos no funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Funciona en iPhone/Safari sin romper Android (`CLAUDE.md` §1) |
| RNF-02 | Área táctil ≥ 44×44 px; el redactor usa `font-size` ≥ 16 px para que iOS no haga zoom al enfocarlo |
| RNF-03 | Respeta `env(safe-area-inset-*)` y `100dvh` con fallback `-webkit-fill-available`; el redactor no queda bajo el teclado virtual |
| RNF-04 | El hilo carga 30 mensajes y pagina hacia atrás; nunca trae la conversación entera |
| RNF-05 | **Push en iOS:** Safari solo lo admite con la PWA instalada en la pantalla de inicio (iOS ≥ 16.4). Sin instalar, RF-10 y RF-11 caen a RF-12 y la interfaz lo explica ofreciendo instalarla |
| RNF-06 | El service worker pasa de `generateSW` a `injectManifest` para alojar los manejadores `push` y `notificationclick`, conservando el precache actual |
| RNF-07 | Claves VAPID privadas y credenciales de correo solo en la Edge Function; el cliente únicamente conoce la clave pública |
| RNF-08 | La bandeja pagina de 25 en 25 |
| RNF-09 | El cuerpo de los mensajes se renderiza como **texto plano**, nunca como HTML |
| RNF-10 | Un fallo al notificar nunca impide guardar el mensaje |
| RNF-11 | Los canales de Realtime se cierran al desmontar la vista |
| RNF-12 | El módulo se carga de forma diferida y no engorda el arranque de la app |

### 8.1 Arquitectura

```
Envío  →  soporte_enviar_mensaje()  →  INSERT en soporte_mensajes
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
              Realtime                                        Database Webhook
      pantalla abierta: aparece                     Edge Function `soporte-notificar`
              (RF-09)                                             │
                                                 ¿destinatario con suscripción activa?
                                                     sí → Web Push (VAPID)  RF-10 / RF-11
                                                     no → correo            RF-12
                                                 respuesta 404/410 → activa = false
```

Por qué cada pieza:

- **Toda escritura pasa por una función de base de datos** en lugar de `INSERT` directos
  desde el cliente. Es lo que permite que la idempotencia, el límite de frecuencia y la
  asignación de autor sean inevitables en vez de opcionales.
- **Database Webhook, no trigger con `pg_net`.** El webhook reintenta por su cuenta y no
  participa en la transacción del `INSERT`; un trigger acoplaría guardar el mensaje a
  notificarlo, incumpliendo RNF-10.
- **Web Push estándar (VAPID), no Firebase.** No añade SDK a un bundle ya grande, funciona
  en Chrome, Firefox, Edge y Safari (con RNF-05) y no exige cuenta de Google.
- **El correo sale de la Edge Function.** Enviarlo desde el navegador exigiría tener la app
  abierta y expondría las credenciales en el cliente.
- **Realtime en lugar de sondeo.** Un sondeo periódico consulta aunque no haya nada nuevo y
  añade latencia igual a su intervalo.

## 9. Criterios de aceptación

- **CA-01 (RF-01):**
  - *Dado* un usuario autenticado sin conversaciones
  - *Cuando* envía asunto, categoría y un cuerpo de 10 caracteres o más
  - *Entonces* se crea una conversación `abierta` con número correlativo, el mensaje aparece en el hilo y el redactor queda vacío

- **CA-02 (RF-02, RN-06):**
  - *Dado* una conversación `resuelta`
  - *Cuando* el usuario escribe en ella
  - *Entonces* el mensaje se añade y el estado vuelve a `abierta`

- **CA-03 (RF-03):**
  - *Dado* un usuario con varias conversaciones, una de ellas con respuesta sin leer
  - *Cuando* entra en `/soporte` y abre esa conversación
  - *Entonces* ve la lista ordenada por fecha del último mensaje, el hilo completo de la que abrió, y su contador de no leídos baja a cero

- **CA-04 (RF-04) — idempotencia:**
  - *Dado* un envío cuya respuesta se pierde por un corte de red
  - *Cuando* el cliente reintenta con el mismo `client_id`
  - *Entonces* la conversación contiene **un solo** mensaje, y el hilo lo muestra una vez

- **CA-05 (RF-04) — cola local:**
  - *Dado* el dispositivo sin conexión
  - *Cuando* el usuario envía un mensaje y luego recupera la conexión
  - *Entonces* el mensaje aparece como `fallido`, se reintenta solo al volver la red y pasa a `enviado`, sin que el usuario tenga que reescribirlo

- **CA-06 (RF-06):**
  - *Dado* conversaciones en varios estados
  - *Cuando* el superadministrador filtra por «sin responder»
  - *Entonces* ve solo aquellas cuyo último mensaje es del usuario, ordenadas por `ultimo_mensaje_at` descendente, y el contador del menú coincide con las filas listadas

- **CA-07 (RF-08, RN-11) — nota interna:**
  - *Dado* una conversación con nota interna
  - *Cuando* el usuario dueño consulta la API con su propia sesión, por cualquier vía
  - *Entonces* en ninguna respuesta aparece el contenido de `nota_interna`

- **CA-08 (RF-09):**
  - *Dado* el usuario con su conversación abierta en pantalla
  - *Cuando* el superadministrador responde desde otro dispositivo
  - *Entonces* la respuesta aparece en el hilo sin recargar, en menos de 3 segundos, y una sola vez

- **CA-09 (RF-07):**
  - *Dado* una conversación con un mensaje del usuario
  - *Cuando* el superadministrador escribe una respuesta de 4.000 caracteres
  - *Entonces* se guarda con `autor = 'soporte'`, aparece en el hilo de ambas partes y la conversación sube al principio de la bandeja

- **CA-10 (RF-10):**
  - *Dado* el superadministrador con push activo y la app cerrada
  - *Cuando* un usuario envía un mensaje
  - *Entonces* recibe una notificación que, al pulsarla, abre esa conversación

- **CA-11 (RF-11):**
  - *Dado* un usuario con push activo y la app en segundo plano
  - *Cuando* el soporte responde
  - *Entonces* recibe una notificación cuyo cuerpo no contiene cifras, saldos ni nombres de natillera

- **CA-12 (RF-12):**
  - *Dado* un usuario **sin** suscripciones push activas
  - *Cuando* el soporte responde
  - *Entonces* el mensaje queda guardado y le llega un correo con el número de conversación y el texto; y **no** recibe correo si el push sí se entregó

- **CA-13 (RF-15) — aislamiento:**
  - *Dado* el usuario A con una conversación y el usuario B autenticado
  - *Cuando* B consulta `soporte_conversaciones`, `soporte_mensajes` o la vista de bandeja, con o sin filtros
  - *Entonces* no obtiene ninguna fila de A, y sus intentos de `UPDATE` y `DELETE` sobre ellas son rechazados

- **CA-14 (RF-16):**
  - *Dado* un usuario autenticado que no es superadministrador
  - *Cuando* escribe `/admin/soporte` en la barra de direcciones
  - *Entonces* es redirigido a `/dashboard`, y aunque forzase la vista no recibiría datos

- **CA-15 (RF-17):**
  - *Dado* la ruta de un adjunto de otra conversación
  - *Cuando* se intenta abrir sin sesión, con la sesión de un tercero o con una URL firmada caducada
  - *Entonces* el almacenamiento la rechaza

- **CA-16 (§6.5) — suplantación:**
  - *Dado* un usuario normal
  - *Cuando* invoca `soporte_enviar_mensaje` intentando que su mensaje figure como `soporte`
  - *Entonces* el mensaje se guarda con `autor = 'usuario'`

- **CA-17 (RF-13, RNF-05):**
  - *Dado* un iPhone con Safari y la app **no** instalada en la pantalla de inicio
  - *Cuando* el usuario abre la configuración de notificaciones
  - *Entonces* se le explica que debe instalar la app, con acceso directo para hacerlo, y no se lanza una petición de permiso que el navegador rechazaría

- **CA-18 (RF-18):**
  - *Dado* un usuario que ha abierto 5 conversaciones en la última hora
  - *Cuando* intenta abrir la sexta
  - *Entonces* se le indica cuántos minutos faltan y el texto redactado permanece

- **CA-19 (RNF-09):**
  - *Dado* un mensaje cuyo cuerpo contiene `<script>alert(1)</script>`
  - *Cuando* se muestra en el hilo del usuario y en el del panel
  - *Entonces* se ve como texto literal y no se ejecuta

- **CA-20 (RNF-10):**
  - *Dado* la Edge Function de notificaciones caída
  - *Cuando* se envía un mensaje
  - *Entonces* el mensaje se guarda y aparece con normalidad; solo no llega el aviso

- **CA-21 (RN-12):**
  - *Dado* un usuario con conversaciones y adjuntos
  - *Cuando* se elimina su cuenta
  - *Entonces* sus conversaciones y mensajes desaparecen en cascada, sin filas huérfanas

## 10. Casos borde y errores esperados

| # | Situación | Comportamiento esperado |
|---|-----------|-------------------------|
| 1 | Sin conexión al enviar | El mensaje queda `fallido` y en cola; se reintenta al volver la red (RF-04) |
| 2 | La app se cierra mientras suben los adjuntos | No se crea el mensaje; al volver, el borrador sigue en el redactor |
| 3 | Doble pulsación rápida en «Enviar» | Un solo mensaje: el segundo intento comparte `client_id` |
| 4 | Suscripción push caducada (404/410) | La Edge Function marca `activa = false` y entrega por correo |
| 5 | El mismo usuario en varios dispositivos | Push a todas las suscripciones activas; el `tag` evita apilarlos |
| 6 | Dos mensajes simultáneos en la misma conversación | Ambos se guardan; el hilo ordena por `created_at` y desempata por `id` |
| 7 | Cuerpo de 4.000 caracteres exactos | Se acepta; 4.001 se rechaza antes de llamar a la red |
| 8 | Adjunto de más de 5 MB o de tipo no admitido | Se rechaza en el cliente antes de subir, indicando el motivo |
| 9 | La conversación se archiva (RN-07) mientras el usuario la tiene abierta | Al refrescar, el redactor se deshabilita; un envío en curso devuelve error explicativo |
| 10 | El soporte responde a una conversación recién borrada | La escritura falla por clave foránea; se avisa y se recarga la bandeja |
| 11 | Navegador sin service worker (modo privado de Firefox) | RF-13 muestra «no soportado»; el resto funciona y la vía es el correo |
| 12 | Usuario sin fila en `user_profiles` | `es_super_admin()` devuelve falso; opera como usuario normal |
| 13 | Realtime no conecta (red corporativa que bloquea WebSocket) | Se degrada a recarga cada 60 s y se indica en la interfaz (RF-09) |
| 14 | Se pulsa una notificación de una conversación ya borrada | La app abre `/soporte` y avisa de que ya no existe |
| 15 | El usuario deniega el permiso de notificaciones | Se explica cómo revertirlo en los ajustes del navegador; no se vuelve a preguntar automáticamente |

## 11. Decisiones cerradas

| # | Pregunta | Decisión | Fecha |
|---|----------|----------|-------|
| P-1 | Proveedor de correo para RF-12 | **Resend.** 3.000 correos/mes gratis y verificación de `natillerapp.com` por DNS. El SMTP integrado de Supabase queda descartado: solo cubre correos de autenticación y con un límite de ~2/hora. EmailJS también, porque corre en el navegador y expondría las credenciales (RNF-07) | 2026-08-31 |
| P-2 | RN-07, archivado a los 30 días | **Al vuelo**, en `soporte_archivar_vencidas()`, invocada al cargar la bandeja. Evita activar `pg_cron` y una tarea programada que mantener; con un solo agente la bandeja se abre a diario | 2026-08-31 |
| P-3 | ¿El soporte puede iniciar conversación? | **No.** La inicia siempre el usuario. `soporte_enviar_mensaje` con `p_conversacion_id NULL` asume autor `usuario`. Se puede añadir después sin romper el modelo | 2026-08-31 |

## 11 bis. Desviaciones de la implementación

Tres puntos donde el código se aparta de la letra de esta especificación para
cumplir mejor su intención. Están comentados también en el propio código.

| Punto | Especificación | Implementación | Motivo |
|-------|----------------|----------------|--------|
| §6.5 | `soporte_enviar_mensaje` con `SECURITY INVOKER` | `SECURITY DEFINER`, con validación explícita de identidad y pertenencia | Para que la función sea de verdad «el único camino de escritura», las tablas no conceden INSERT a los clientes. Con `INVOKER` la función tampoco podría escribir. Con una política de INSERT abierta, cualquiera insertaría por PostgREST saltándose el límite de frecuencia (RF-18) |
| §6.1/§6.4 | Política `conv_insert` para el usuario | No existe; además se revocan INSERT/UPDATE/DELETE a `authenticated` en las tres tablas del hilo | Misma razón. Las lecturas siguen íntegramente por RLS, que es lo que sostiene RF-15 y CA-13 |
| §6.6 | Ruta de adjunto `<conversacion_id>/<mensaje_id>/<archivo>` | `<user_id>/<client_id>/<archivo>` | RF-05 exige subir los archivos **antes** de crear el mensaje, así que en ese momento no existe `mensaje_id` —ni `conversacion_id` al abrir un hilo nuevo—. El `client_id` sí existe (lo genera el redactor), y el uid como primera carpeta es lo que la política del bucket puede comprobar |
| RF-11 / CA-11 | El push al usuario lleva los primeros 120 caracteres | Lleva «Tienes una respuesta en tu conversación #N» | CA-11 exige que el cuerpo no contenga cifras, saldos ni nombres de natillera, y no hay forma fiable de detectar el nombre de una natillera dentro de una frase. La constante `INCLUIR_TEXTO_EN_PUSH_AL_USUARIO` en la Edge Function permite volver al adelanto de RF-11 si se prefiere |
| §6.3 | La bandeja incluye `nota_interna` | No la incluye; se lee con `soporte_nota_interna()`, que exige ser superadministrador | RLS filtra filas, no columnas: con la nota en la vista o en el GRANT de la tabla, el dueño de la conversación podría leer la nota de su propio hilo, que es justo lo que CA-07 prohíbe. El GRANT de `soporte_conversaciones` es columna a columna y deja `nota_interna` fuera |
| RF-09 | Realtime solo sobre `INSERT` en `soporte_mensajes` | También `UPDATE` sobre `soporte_conversaciones`, publicada **con lista de columnas** (migración 023) | Un cambio de estado no llegaba a la otra parte: había que recargar para ver que el soporte había resuelto el hilo. La lista de columnas es obligatoria: el RLS de Realtime filtra filas, no columnas, y publicando la tabla entera el dueño recibiría `nota_interna` por el canal cada vez que el soporte guardase una nota — RN-11 y CA-07 rotos por una puerta que no se ve desde la API REST |
| RN-06 / §7.2 | El redactor solo se deshabilita con la conversación `archivada` | En `resuelta` llega deshabilitado, con un botón **«Volver a escribir»** que lo levanta | Pedido en pruebas: una conversación resuelta debe verse cerrada, no invitar a escribir. Deshabilitarlo del todo dejaría RN-06 (y CA-02) inalcanzable desde la interfaz, así que el bloqueo es reversible por el propio usuario. `archivada` sigue siendo definitivo para él (RN-08) |
| §7.1 | Entrada en el menú lateral **y** en `MobileBottomNav` | Menú lateral (con insignia) **más un botón flotante** arrastrable y ocultable | `MobileBottomNav` solo se renderiza dentro de una natillera (`v-if="natilleraId"`) y es contextual a ella; el soporte es transversal. El botón flotante lo pidió Esteban en pruebas, revirtiendo el «se descarta» de §7.1 — ver la fila siguiente |
| RN-09 | «El número visible es `#` + entero correlativo de una secuencia de Postgres» | El correlativo sigue siendo la clave interna, pero lo que se ve es un código tipo `NT-MMV3` (`codigoConversacion`) | Enseñar el correlativo cuenta cuántas conversaciones existen: «#3» dice que el sistema se estrenó ayer y «#1», que eres el primero que escribe. La transformación es una red de Feistel de 4 rondas sobre 20 bits: biyectiva por construcción, así que **no puede haber colisiones** y no hay nada que guardar ni comprobar al crear. El correlativo **sí se muestra en el panel del soporte**, junto al código: al agente le sirve para saber el orden y el volumen, al usuario no. Alfabeto Crockford (sin I, L, O ni U) para que se pueda dictar por teléfono. Comprobado sobre el millón de códigos posibles: 0 colisiones, y dos conversaciones consecutivas comparten un 3,1 % de caracteres — exactamente lo que daría el azar |
| §2 (fuera de alcance) | «Respuestas automáticas, bots» | Acuse de recibo mientras el soporte no ha contestado: 15 textos en `ACUSES_RECIBO`, elegidos por el id de la conversación | Pedido en pruebas. **No es un mensaje**: no se guarda en `soporte_mensajes`, no dispara el webhook ni el push, y no cuenta como respuesta. Guardarlo sí habría roto tres cosas — el filtro «sin responder» de CA-06 dejaría de ver la conversación porque el último autor pasaría a ser `soporte`, el usuario recibiría un push por un texto automático, y su contador de no leídos subiría solo. Se muestra marcado como automático y con forma distinta a las burbujas: un texto que se hiciera pasar por una persona dejaría al usuario esperando una conversación que no ha empezado |
| §7.3 | El panel de soporte se alcanza por el menú de Administrador | También se retira del menú: para quien atiende el soporte, el botón flotante ofrece dos destinos —«Mis mensajes» y «Panel de soporte», este con su contador— y un toque abre ese menú en vez de ir directo al chat | Pedido en pruebas. La bandeja sigue navegando a `/admin/soporte` y no a un panel flotante: tiene filtros, búsqueda, paginación y el hilo al lado, es una herramienta de trabajo y no una consulta rápida |
| §7.1 | Entrada permanente en el menú lateral | Se retira: el acceso del usuario es solo el botón flotante, y Configuración ofrece la vía de rescate («Abrir el soporte») por si lo oculta | Pedido en pruebas. El enlace de rescate no es opcional: sin él, ocultar el botón dejaría al usuario sin ninguna forma de volver a su propia conversación |
| §7.2 | El hilo del usuario vive en la pantalla `/soporte` | El panel flotante se puede **ampliar** hasta ocupar todo salvo la barra lateral, y ampliado pasa a dos columnas | Pedido en pruebas: para una conversación larga, el widget de 24 rem se queda corto |
| §7.1 / §7.2 | El acceso lleva a la pantalla `/soporte` | El botón flotante abre un **panel de chat sobre la pantalla actual** (`ChatSoporteFlotante.vue`); `/soporte` sigue existiendo para el enlace del menú y para las notificaciones, que apuntan a una conversación concreta con URL propia | Pedido en pruebas: el botón debe abrir el chat donde estés, sin perder lo que estabas haciendo. El cuerpo es el mismo componente (`PanelConversaciones.vue`) en los dos sitios, en modo compacto o de dos columnas: mantener dos chats en paralelo sería garantizar que se separan |
| §7.1 | «Se descarta el botón flotante» | Implementado en `BotonSoporte.vue` | Se revierte a petición expresa. Los tres motivos del descarte se resuelven en vez de ignorarse: **compite con la barra inferior** → el arrastre está acotado a una zona segura que descuenta esa barra cuando existe; **compite con los pies de las modales** → se esconde solo mientras `isBodyScrollLocked` sea cierto, que es la señal que ya emite `useBodyScrollLock`; **lógica de ocultamiento frágil** → no hay heurísticas de scroll, solo esa señal y la ruta. La posición se guarda como lado + fracción de altura, nunca en píxeles, para que sobreviva a rotaciones y a cambios de pantalla |

## 12. Historial de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 2.8 | 2026-09-01 | El botón flotante es el único acceso también para el soporte: un toque despliega «Mis mensajes» y «Panel de soporte». Se retira la entrada del menú de Administrador |
| 2.7 | 2026-09-01 | La insignia de no leídos se actualiza en vivo desde cualquier pantalla (canal propio en el store). Se retira el soporte del menú lateral, el panel flotante se puede ampliar a pantalla casi completa, y el correlativo interno vuelve a ser visible en el panel del soporte |
| 2.6 | 2026-09-01 | El identificador visible pasa a ser un código (`NT-MMV3`) en vez del correlativo. Mismo algoritmo en el cliente y en la Edge Function, con paridad comprobada sobre 200.000 números |
| 2.5 | 2026-09-01 | Acuse de recibo automático (15 variantes, deterministas por conversación) mientras el soporte no ha respondido. No se persiste ni notifica |
| 2.4 | 2026-09-01 | El botón flotante abre el chat en un panel sobre la pantalla actual en vez de navegar. El cuerpo del soporte se extrae a `PanelConversaciones.vue`, compartido por la página `/soporte` (dos columnas, sincronizado con la URL) y por el panel (una columna) |
| 2.3 | 2026-09-01 | Botón flotante de soporte: arrastrable con anclaje al borde, ocultable con pulsación larga y con interruptor en `/configuracion`. Revierte el «se descarta el botón flotante» de §7.1 resolviendo los tres motivos que lo descartaban |
| 2.2 | 2026-09-01 | Estado en vivo. `migrations/023_soporte_realtime_conversaciones.sql` publica `soporte_conversaciones` (solo las columnas que no son privadas) para que el cambio de estado llegue sin recargar. La conversación cerrada se distingue por franja de color en la lista, cabecera tintada y aviso textual, y en `resuelta` el redactor llega bloqueado con reapertura explícita |
| 2.1 | 2026-08-31 | Implementación. Se cierran P-1 (Resend), P-2 (archivado al vuelo) y P-3 (solo el usuario inicia), y se documentan las desviaciones del §11 bis. Entregado: `migrations/022_soporte.sql`, `supabase/functions/soporte-notificar/`, `src/sw.js` (paso a `injectManifest`), store, composables, vistas y componentes |
| 2.0 | 2026-08-31 | Rediseño completo desde cero. Sustituye por entero a la v1.0: nuevo modelo de datos, escritura por función única con idempotencia, RLS restrictiva, Realtime y Web Push. La implementación anterior se eliminó del repositorio y `migrations/021_eliminar_chat_legacy.sql` la retira de la base de datos. |
| 1.0 | 2026-08-31 | Versión inicial, redactada sobre el sistema anterior. Descartada. |

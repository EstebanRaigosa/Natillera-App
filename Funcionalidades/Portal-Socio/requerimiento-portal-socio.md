# Portal del Socio — Levantamiento de requerimiento

> Estado: propuesta para aprobación. No implementado.
> Fecha: 2026-08-29 · Rama base: `vistas`

---

## 1. Contexto

Hoy Natillerapp solo tiene un tipo de ingreso real: el **administrador** (y sus colaboradores
invitados). Los **socios** existen únicamente como registros gestionados por el admin: no tienen
cuenta, no ven nada, y toda la información les llega por WhatsApp o de viva voz.

El requerimiento es abrir un **portal del socio**: acceso propio, de solo lectura sobre el dinero
del grupo y de autogestión sobre sus datos personales.

### 1.1 Qué ya existe y se reutiliza

| Pieza existente | Ubicación | Uso en el portal |
|---|---|---|
| `socios_natillera.rol` (`administrador` \| `socio`) | `supabase/schema.sql:59` | Ya modela el rol; hoy no se usa para autorizar |
| Sistema de invitaciones con token, estados y permisos JSONB | `natillera_colaboradores` | Patrón a clonar para invitar socios |
| Login por teléfono + OTP (Twilio) | `src/stores/auth.js:488-824`, `src/views/auth/Login.vue` | Canal de ingreso natural del socio |
| `user_profiles.telefono` + índice | `add_telefono_otp_to_user_profiles.sql` | Punto de cruce socio ↔ usuario |
| `calcularCierreNatillera()` | `src/composables/useCierreNatillera.js:90` | Ya calcula por socio: ahorro, utilidades por concepto, descuentos, total a entregar |
| Comprobante de cierre (imagen + texto WhatsApp) | `src/views/natilleras/NatilleraCierre.vue:1023` | Estado de cuenta del socio |
| RLS por `tiene_acceso_natillera()` | `update_rls_for_colaboradores.sql` | Base a extender con acceso de socio |

### 1.2 Brechas críticas detectadas

1. **No existe vínculo socio ↔ usuario.** Ni `socios` ni `socios_natillera` tienen `user_id`.
   Verificado: no hay ninguna migración que lo agregue.
2. **`socios.telefono` ya no es único a nivel global** (`remove_telefono_unique_constraint.sql`);
   solo se valida unicidad *dentro de la natillera* (`socios.js:verificarTelefonoUnico`). Un mismo
   humano puede tener **varias filas en `socios`** si participa en varias natilleras, porque el
   dedupe de `agregarSocio()` solo busca por documento o email, nunca por teléfono.
3. **El login por OTP actual no autentica a nadie.** `verificarOTPTelefono()` termina haciendo
   `signInWithPassword({ email: 'admin@gmail.com', password: 'admin123*' })`
   (`src/stores/auth.js:585-612`). Es una credencial compartida y hardcodeada: cualquiera que
   reciba un SMS entra como ese usuario. **Debe eliminarse antes de abrir el portal**, no después.
4. **Todas las políticas RLS son binarias**: quien tiene acceso a la natillera ve *todo* de *todos*
   los socios. No hay granularidad "solo mis filas".

---

## 2. Benchmark

Referencias consultadas: apps de natillera/ahorro colectivo en Colombia (MiAhorro, natillera.com,
natillera.app, natillera.com.co), apps ROSCA/tanda internacionales (Roscas.io, myDuti, StepLadder,
My Community Harvest) y apps VSLA de digitalización de grupos de ahorro (GroupSave, DigiSave,
VSLA Digital Savings).

Patrones que se repiten en todas y que definen la línea base de la vista de socio:

- **Passbook digital**: el socio ve su libreta — aportes, préstamos e intereses — como registro
  histórico consultable 24/7, reemplazando la libreta física.
- **Estado del ciclo**: cuánto lleva ahorrado, cuánto falta, cuándo es el próximo pago.
- **Transparencia del grupo**: quién ha pagado y quién no, y qué tan cerca está el próximo pago
  o el cierre. En VSLA es el corazón del método; en apps comerciales suele ser configurable.
- **Recordatorios** de cuota y avisos de pago registrado.
- **Reportes/estado de cuenta** descargable de ahorros, préstamos y aportes.
- **Dashboard financiero**: banner superior con saldo total, tarjetas por métrica, panel lateral
  con pagos programados y alertas; pocos KPI, priorizados por accionabilidad.

---

## 3. Requerimiento funcional

Alcance: **consulta + autogestión de datos propios**. El socio nunca escribe sobre el dinero.

### R1 — Ingreso y selección de natillera
- El socio inicia sesión con su método vinculado (ver §6) y aterriza en **su** natillera.
- Si pertenece a varias, un selector arriba; si pertenece a una sola, entra directo.
- Un mismo usuario puede ser **administrador en una natillera y socio en otra**: el rol se resuelve
  por natillera, nunca global.
- Layout propio (`SocioLayout`), sin el menú de gestión del admin.

### R2 — Home «Mi natillera»
Tarjetas KPI, en este orden de prioridad:
1. **Ahorro acumulado** (suma de cuotas efectivamente pagadas).
2. **Ganancias estimadas** a hoy (utilidades distribuidas según `config_cierre`).
3. **Saldo de préstamos** (lo que debe al fondo).
4. **Proyección a recibir en el cierre** = ahorro + ganancias − descuentos.
- **Estado del socio**: al día / parcial / en mora, con el valor exacto pendiente.
- **Próximo pago**: valor, fecha límite y días restantes.
- **Progreso del ciclo**: cuota N de M, con fecha de cierre de la natillera.
- Todo valor de ganancias se rotula explícitamente como **estimado, sujeto al cierre**.

### R3 — Mis aportes (cuotas)
- Listado cronológico por periodo (mes / quincena) con: valor, valor pagado, estado
  (`pendiente`, `parcial`, `pagada`, `mora`), fecha límite, fecha de pago.
- Desglose del pago cuando existe: capital, multa/sanción, abono a préstamo, 4×1000
  (ya modelado en `cuotas`).
- Comprobante asociado (ver/descargar) e historial de pagos de la cuota.
- Filtro por año y por estado. Totales: pagado vs. plan del ciclo.

### R4 — Mis ganancias
- Desglose por concepto: préstamos, rifas, bingo, venta, evento, sanciones, adicionales
  (`TIPOS_UTILIDAD` en `useCierreNatillera.js:19`).
- Junto a cada concepto, **cómo se reparte** (proporcional al ahorro o equitativa), tomado de
  `config_cierre`. Sin esta explicación la cifra genera desconfianza, que es justo lo contrario
  del objetivo.
- Evolución del acumulado a lo largo del ciclo.

### R5 — Mis préstamos
- **Activos**: monto, interés, saldo actual, plan de pagos (`plan_pagos_prestamo`), próxima cuota,
  días de mora si aplica.
- **Historial**: préstamos pagados y cancelados, con sus comprobantes.
- *Fase 2*: **solicitar préstamo** desde el portal → queda `pendiente` y entra a una bandeja del
  admin para aprobar/rechazar. (El estado `pendiente` ya existe en `prestamos`.)

### R6 — Mis actividades
- Actividades del ciclo en las que participa (`socios_actividad`, `numeros_rifa`): tipo, aporte
  comprometido, pagado, pendiente, números de rifa asignados y resultado del sorteo.
- Utilidad que esa actividad le generó, cuando ya está clasificada.

### R7 — Mi cuenta
- **Editable por el socio**: nombre, email, documento, avatar, y teléfono **con re-verificación OTP**
  (el teléfono es identificador de acceso, no un dato cosmético).
- **No editable** (solo solicitud al admin): valor de cuota, periodicidad, estado, rol.
- Preferencias de notificación, cerrar sesión, desvincular cuenta.
- Todo cambio queda en auditoría, igual que los del admin.

### R8 — Transparencia del grupo *(configurable por el admin)* — DECIDIDO
Tres niveles, en `natilleras.config_portal_socio`. **Por defecto: nivel 0.**
- **Nivel 0 (defecto)**: el socio solo ve sus propias cifras. Nada del grupo.
- Nivel 1: además, totales agregados y anónimos — fondo acumulado, número de socios, total
  prestado, utilidades del periodo.
- Nivel 2: además, **quién está al día y quién no** (nombre + estado, sin montos).
- Nunca se expone teléfono, documento, email ni saldos individuales de otros socios.
- Justificación legal: Ley 1581 de 2012 (Habeas Data) exige finalidad y acceso restringido;
  exponer datos de terceros requiere decisión explícita del responsable, por eso es un toggle
  del admin y no un comportamiento por defecto.

### R9 — Estado de cuenta
- Generación del comprobante individual (ahorro, ganancias, descuentos, total a entregar) que
  hoy produce el módulo de cierre, disponible para el socio en cualquier momento y al cierre.

### R10 — Notificaciones *(fase 2)*
- Recordatorio de cuota próxima a vencer, confirmación de pago registrado, aviso de cierre,
  aviso de préstamo aprobado. Reutiliza `recordatorios_usuario`.

### Fuera de alcance v1
Pagos en línea / pasarela · chat entre socios · votaciones · edición de cualquier cifra por parte
del socio · portal para no socios.

---

## 4. Requisitos no funcionales

- **Aislamiento de datos (crítico)**: nuevas políticas RLS que limiten al socio a las filas de su
  propio `socios_natillera`. No basta con ocultar en el frontend.
- **Superficie mínima**: los KPI del home se sirven por RPC `SECURITY DEFINER`
  (`mi_resumen_natillera(p_natillera_id)`) en vez de exponer las tablas base al rol socio.
- **Eliminar el login admin hardcodeado** (§1.2.3) como pre-requisito bloqueante.
- **Guard de rutas por rol** en el router, más `meta.rol`.
- **iOS/Safari y PWA** según `CLAUDE.md` (dvh, safe-area, `ModalWrapper`, inputs ≥16px).
- **Auditoría**: ingreso del socio, cambios de datos y vinculación/desvinculación.
- **Rendimiento**: el socio entra desde celular y datos móviles; el home debe resolverse en una
  sola llamada.

---

## 5. Impacto técnico estimado

**Base de datos**
- `socios_natillera`: `user_id uuid references auth.users(id)`, `vinculo_estado`,
  `fecha_vinculacion`, `unique(natillera_id, user_id)`.
- `socios`: `telefono_e164 varchar(20)` normalizado + índice (hoy los formatos son heterogéneos).
- Tablas nuevas: `socio_invitaciones`, `socio_vinculo_solicitudes`.
- Funciones: `es_socio_de(natillera_id)`, `mi_socio_natillera_id(natillera_id)`,
  `mi_resumen_natillera(natillera_id)`, `aceptar_invitacion_socio(token)`.
- Policies `*_socio_select` sobre `cuotas`, `prestamos`, `pagos_prestamo`, `plan_pagos_prestamo`,
  `socios_actividad`, `multas`.

**Frontend**
- `src/layouts/SocioLayout.vue`, rutas `/mi/*`, `src/stores/portalSocio.js`,
  vistas `MiNatillera`, `MisAportes`, `MisGanancias`, `MisPrestamos`, `MisActividades`, `MiCuenta`.
- En el módulo de admin: acción **«Invitar al portal»** en la vista de Socios y bandeja de
  solicitudes de vinculación.

---

## 6. Vinculación socio ↔ usuario

### 6.1 El problema

Los socios se crearon con **nombre** y, casi siempre, **teléfono**; email y documento son opcionales
y en la práctica suelen ir vacíos o autogenerados (`AUTO-<timestamp>`). El registro de usuarios, en
cambio, es por email/Google. No hay identificador común confiable:

- el teléfono **no es único** en `socios` y puede repetirse entre natilleras para la misma persona;
- hay socios **sin teléfono utilizable** o con el teléfono de un familiar;
- el nombre es ambiguo (homónimos, apodos, orden de apellidos, tildes);
- un teléfono puede haber sido reasignado a otra persona por el operador.

Conclusión: **ningún dato actual sirve como llave automática segura**. La vinculación necesita un
acto explícito de alguien con autoridad (el admin) o una verificación de posesión (OTP) + control.

### 6.2 Opciones

**A. Invitación con token por WhatsApp/SMS — recomendada como camino principal**
El admin abre la ficha del socio → «Invitar al portal» → el sistema genera un token y un código de
6 dígitos y arma el mensaje de WhatsApp con `wa.me` (canal que el equipo ya usa). El socio abre
`/unirme?t=<token>`, se autentica y queda vinculado a *ese* `socios_natillera`.
*A favor*: vínculo determinístico, sin ambigüedad; funciona aunque el socio no tenga teléfono
registrado; expira; es revocable y auditable; reutiliza el patrón ya probado de
`natillera_colaboradores`. *En contra*: requiere una acción del admin por socio (mitigable con
«invitar a todos» en lote).

**B. Auto-vinculación por teléfono + OTP**
El socio entra con su celular, verifica OTP y el sistema busca socios cuyo `telefono_e164` coincida:
1 coincidencia → vincula; N coincidencias (varias natilleras) → el socio elige a cuáles entrar;
0 → «aún no estás habilitado, pídele la invitación a tu administrador».
*A favor*: cero fricción para el admin, ideal para adopción masiva. *En contra*: exige normalizar
todos los teléfonos antes; el teléfono reciclado o compartido puede entregar datos a la persona
equivocada. *Mitigación*: notificar al admin de cada auto-vinculación, con opción de revertir, o
exigir su aprobación cuando el teléfono aparece en más de una natillera.

**C. Solicitud del socio con aprobación del admin**
El usuario se registra, ingresa el **código de la natillera**, selecciona su nombre de la lista y
envía la solicitud; el admin la aprueba o rechaza desde una bandeja.
*A favor*: cubre a los socios sin teléfono ni email; el control humano queda donde debe estar.
*En contra*: expone la lista de nombres del grupo a quien tenga el código — mitigable enmascarando
(«Ma… R…z») y limitando intentos.

**D. Emparejamiento en el momento del alta (prevención hacia adelante)**
Al crear o editar un socio, si su teléfono/email ya corresponde a un `user_profiles`, el sistema lo
sugiere y el admin confirma la vinculación en el acto. Evita que el problema siga creciendo.

**E. Coincidencia difusa por nombre — solo como asistente**
Normalización (sin tildes, minúsculas, orden de apellidos) + similitud `pg_trgm` para *sugerirle*
candidatos al admin. Nunca vincula sola.

### 6.3 Recomendación

**Decidido:** **A** como camino principal, materializado con el **código de 6 dígitos** (§7.1). El
admin genera el código desde la ficha del socio y lo entrega como prefiera —dictado en la reunión,
pegado en WhatsApp o impreso—; el enlace `?t=<token>` queda como conveniencia opcional del mismo
mecanismo, no como dependencia.

Alrededor de ese eje: **B** como atajo futuro (requiere primero normalizar teléfonos, §6.4), **C**
como salida para los casos sin datos, **D** para que el problema no crezca con cada alta nueva y
**E** como ayuda al admin. El admin puede desvincular en cualquier momento, y toda vinculación
queda auditada.

### 6.4 Trabajo previo de datos

Antes de habilitar **B** hay que medir el terreno: normalizar todos los teléfonos a E.164, contar
cuántos socios quedan con teléfono único a nivel global (auto-vinculables), cuántos comparten
teléfono y cuántos no tienen uno usable. Ese conteo define qué porcentaje del padrón entra por la
vía rápida y cuánto trabajo manual queda.

---

## 7. Decisiones tomadas · 29 ago 2026

### 7.1 Ingreso del socio: código de invitación de 6 dígitos
- El admin genera el código desde la ficha del socio (acción «Invitar al portal»), individualmente
  o en lote. Vigencia sugerida: 72 horas; un solo uso; revocable y regenerable.
- El socio abre la app, ingresa el código, **ve su nombre y natillera y confirma que es él**, y
  queda vinculado.
- **Sin costo de SMS**: no se usa Twilio en este flujo.
- **Reingreso** (asunción explícita, confirmar): sesión persistente en el dispositivo más **PIN de
  4 dígitos** que el socio define al primer ingreso. Sin esto, el socio tendría que pedirle un
  código nuevo al admin cada vez que cierre sesión.
- Riesgo asumido: un código dictado frente al grupo puede ser usado por otra persona. Se contiene
  con expiración corta, un solo uso, la pantalla de confirmación de identidad y la auditoría de
  vinculación (el admin ve quién y cuándo lo usó, y puede revocar).

### 7.2 Transparencia: configurable, arrancando en el mínimo
Ver R8. Por defecto el socio solo ve sus propias cifras; el admin sube el nivel si su grupo lo
decide.

### 7.3 Alcance v1: solo consulta
El socio no escribe ninguna cifra. Solicitud de préstamo (R5, fase 2) y notificaciones (R10, fase 2)
quedan fuera de la primera versión.

### 7.4 Pendiente
**¿El socio puede cambiar su propio teléfono?** Siendo un identificador de contacto —y candidato a
llave de acceso si algún día se activa la opción B— hay que decidir si lo edita él con
re-verificación o únicamente el admin.

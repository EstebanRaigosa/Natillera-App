# Especificación — Portal del Socio

| Campo | Valor |
|-------|-------|
| **Módulo** | Portal del Socio (acceso propio del socio) |
| **Estado** | Borrador — pendiente de aprobación |
| **Versión** | 1.0 |
| **Fecha** | 2026-08-30 |
| **Autor** | Esteban |
| **Rama base** | `vistas` |
| **Requerimiento origen** | [`Funcionalidades/Portal-Socio/requerimiento-portal-socio.md`](../../Funcionalidades/Portal-Socio/requerimiento-portal-socio.md) |
| **Rutas previstas** | `/mi`, `/mi/aportes`, `/mi/ganancias`, `/mi/prestamos`, `/mi/actividades`, `/mi/cuenta`, `/unirme` |
| **Archivos previstos** | `src/layouts/SocioLayout.vue`, `src/views/socio/*`, `src/stores/portalSocio.js`, `migrations/020+*.sql` |

---

## 0. Cómo leer este documento

Cada requisito lleva un **estado** que indica si describe algo ya existente o algo por hacer:

| Estado | Significado |
|--------|-------------|
| 🟢 **Construido** | Ya existe en el código y se reutiliza tal cual. La spec lo documenta como contrato. |
| 🟡 **Parcial** | Existe una pieza reutilizable, pero requiere cambios para servir al portal. |
| 🔴 **Por construir** | No existe. Es desarrollo nuevo. |

**Estado global verificado el 2026-08-30:** el portal **no está implementado**. Búsqueda en `src/`
de `portalSocio`, `SocioLayout`, rutas `/mi/`, `config_portal_socio`, `mi_resumen_natillera` y
`vinculo_estado`: **cero coincidencias**. `src/layouts/` contiene solo `AuthLayout.vue` y
`DashboardLayout.vue`. Las migraciones llegan hasta `019_eliminar_pago_cuota.sql`.
Todo lo marcado 🟢 son **piezas del admin que el portal reutiliza**, no portal ya hecho.

---

## 1. Objetivo

Dar a cada **socio** de una natillera acceso propio, desde su celular, para consultar su dinero
—lo que ha ahorrado, lo que debe, lo que ha ganado y lo que recibirá al cierre— y mantener sus
datos personales al día, sin depender de que el administrador se lo cuente por WhatsApp.

El socio **consulta**; nunca modifica cifras del fondo.

## 2. Contexto y alcance

### 2.1 Piezas existentes que el portal reutiliza (🟢 construido)

| Pieza | Ubicación verificada | Uso en el portal |
|-------|----------------------|------------------|
| `socios_natillera.rol` (`administrador` \| `socio`) | `supabase/schema.sql:59` | Ya modela el rol por natillera; hoy **no se usa para autorizar** |
| `socios_natillera` con `valor_cuota_individual`, `periodicidad`, `estado`, `UNIQUE(natillera_id, socio_id)` | `supabase/schema.sql:50-63` | Es la fila que define «mi participación» en una natillera |
| Desglose del pago en `cuotas`: `valor_pagado_cuota`, `valor_pagado_sancion`, `valor_pagado_actividades` | `migrations/003_add_desglose_pago_cuotas.sql` | Alimenta el detalle de cada aporte (RF-06) |
| Desglose por forma de pago: `valor_pagado_efectivo`, `valor_pagado_transferencia` | `migrations/010_add_desglose_forma_pago_cuotas.sql` | Detalle del comprobante |
| `cuotas.impuesto_4x1000` | `migrations/017_add_impuesto_4x1000_cuotas.sql` | GMF mostrado al socio |
| `calcularCierreNatillera()` y `TIPOS_UTILIDAD` | `src/composables/useCierreNatillera.js:19` | Cálculo de ahorro, utilidades por concepto, descuentos y total a entregar |
| `getModoDistribucion(config, tipo)` | `src/composables/useCierreNatillera.js` | Explica **cómo** se reparte cada utilidad (RF-09) |
| Comprobante de cierre (imagen + texto WhatsApp) | `src/views/natilleras/NatilleraCierre.vue` | Base del estado de cuenta (RF-14) |
| Invitaciones con token y estados | `natillera_colaboradores`, `supabase/create_natillera_colaboradores.sql`, ruta `invitacion/:token` (`src/router/index.js:185`) | Patrón a clonar para invitar socios |
| Login por teléfono + OTP (Twilio) | `src/stores/auth.js:488` (`enviarOTPTelefono`), `:752` (`verificarOTPTelefono`) | Canal alternativo futuro (fuera de v1) |

### 2.2 Brechas verificadas que la v1 debe cerrar (🔴 por construir)

| # | Brecha | Evidencia |
|---|--------|-----------|
| B-1 | **No existe vínculo socio ↔ usuario.** Ni `socios` ni `socios_natillera` tienen `user_id`. | `supabase/schema.sql:13,50`; ninguna migración lo agrega |
| B-2 | **`socios.telefono` no es único globalmente**; solo se valida dentro de la natillera. Un mismo humano puede tener varias filas en `socios`. | `supabase/remove_telefono_unique_constraint.sql`, `src/stores/socios.js:verificarTelefonoUnico` |
| B-3 | **El ingreso por OTP no autentica a nadie.** `iniciarSesionAdmin()` hace `signInWithPassword({ email: 'admin@gmail.com', password: 'admin123*' })`: credencial compartida y hardcodeada. | `src/stores/auth.js:587-596` |
| B-4 | **Las políticas RLS son binarias**: quien accede a la natillera ve todo de todos los socios. No hay granularidad «solo mis filas». | `supabase/update_rls_for_colaboradores.sql` (patrón `tiene_acceso_natillera()`) |
| B-5 | No existe layout, rutas, store ni vistas del socio. | `src/layouts/` sin `SocioLayout.vue`; `src/router/index.js` sin rutas `/mi/*` |

### 2.3 Dentro del alcance (v1)

Ingreso del socio por código de invitación de 6 dígitos · home con KPI · mis aportes · mis
ganancias · mis préstamos (consulta) · mis actividades · mi cuenta · estado de cuenta ·
transparencia del grupo configurable · aislamiento de datos por RLS.

### 2.4 Fuera del alcance (v1) — explícito

- Pagos en línea o pasarela de pago.
- **Solicitud de préstamo desde el portal** (fase 2; el estado `pendiente` ya existe en `prestamos`).
- **Notificaciones y recordatorios** (fase 2; reutilizaría `recordatorios_usuario`).
- Auto-vinculación por teléfono + OTP (fase 2; exige normalizar teléfonos primero, ver RN-11).
- Chat entre socios, votaciones, portal para no socios.
- Cualquier escritura del socio sobre cifras del fondo.

### 2.5 Supuestos

- S-1: El socio tiene un smartphone con navegador y usa la PWA.
- S-2: El administrador entrega el código de 6 dígitos por el canal que prefiera (reunión, WhatsApp, impreso). El sistema **no envía SMS** en este flujo: sin costo Twilio.
- S-3: Un mismo usuario puede ser administrador en una natillera y socio en otra; el rol se resuelve **por natillera**, nunca global.

## 3. Actores y permisos

| Actor | Puede | No puede |
|-------|-------|----------|
| **Socio** (rol `socio` en `socios_natillera`) | Ver sus cuotas, préstamos, actividades, ganancias estimadas y estado de cuenta. Editar sus datos personales (RF-13). Ver del grupo lo que permita el nivel de transparencia (RF-15). | Ver datos de otros socios más allá del nivel configurado. Modificar cifras, cuotas, valores, estado o rol. Entrar a rutas del admin. |
| **Administrador** de la natillera | Invitar socios al portal, individualmente o en lote. Revocar y regenerar códigos. Desvincular una cuenta. Configurar el nivel de transparencia. Ver la auditoría de vinculaciones. | — |
| **Colaborador** | Según sus permisos JSONB actuales; **invitar al portal requiere permiso explícito**. | Cambiar el nivel de transparencia (solo el administrador). |
| **Superusuario** (`raigo.16@gmail.com`) | Todo lo del administrador en cualquier natillera. | — |

---

## 4. Requisitos funcionales

### 4.1 Resumen

| ID | Requisito | Estado | Prioridad |
|----|-----------|--------|-----------|
| RF-01 | Eliminar el ingreso con credencial admin hardcodeada | 🟡 Parcial | **Must — bloqueante** |
| RF-02 | Vincular un socio a una cuenta de usuario | 🔴 Por construir | Must |
| RF-03 | Invitar al portal con código de 6 dígitos (individual y en lote) | 🔴 Por construir | Must |
| RF-04 | Canjear el código y confirmar identidad | 🔴 Por construir | Must |
| RF-05 | Reingreso del socio (sesión persistente + PIN) | 🔴 Por construir | Must |
| RF-06 | Selección de natillera y resolución de rol | 🔴 Por construir | Must |
| RF-07 | Home «Mi natillera» con KPI | 🔴 Por construir | Must |
| RF-08 | Mis aportes (cuotas) | 🔴 Por construir | Must |
| RF-09 | Mis ganancias | 🔴 Por construir | Should |
| RF-10 | Mis préstamos (consulta) | 🔴 Por construir | Must |
| RF-11 | Mis actividades | 🔴 Por construir | Should |
| RF-12 | Estado de cuenta descargable | 🟡 Parcial | Should |
| RF-13 | Mi cuenta (autogestión de datos) | 🔴 Por construir | Must |
| RF-14 | Transparencia del grupo configurable | 🔴 Por construir | Should |
| RF-15 | Gestión de vínculos desde el admin (revocar/desvincular) | 🔴 Por construir | Must |

### 4.2 Detalle

#### RF-01 — Eliminar el ingreso con credencial admin hardcodeada 🟡 **BLOQUEANTE**
- **Situación actual:** `iniciarSesionAdmin()` (`src/stores/auth.js:587`) autentica con
  `admin@gmail.com` / `admin123*`. Cualquiera que complete el flujo OTP entra como ese usuario.
- **Requisito:** eliminar esa función y todos sus llamadores antes de habilitar cualquier ruta del portal.
- **Sustituto:** sesión real de Supabase Auth propia de cada usuario.
- **Criterio de bloqueo:** ninguna ruta `/mi/*` ni `/unirme` se despliega mientras exista esta credencial en el código.
- **Efecto colateral a resolver:** el flujo OTP actual (`verificarOTPTelefono`) queda sin mecanismo de sesión; en v1 el portal **no depende de OTP** (se ingresa por código, RF-03), así que basta con desactivar el atajo.

#### RF-02 — Vincular un socio a una cuenta de usuario 🔴
- **Descripción:** un registro de `socios_natillera` puede quedar asociado a un usuario de `auth.users`.
- **Campos nuevos en `socios_natillera`:**
  | Campo | Tipo | Regla |
  |-------|------|-------|
  | `user_id` | `uuid references auth.users(id)` | Nulo mientras no haya vínculo |
  | `vinculo_estado` | `varchar(20)` | `sin_invitar` \| `invitado` \| `vinculado` \| `revocado`. Defecto `sin_invitar` |
  | `fecha_vinculacion` | `timestamptz` | Se fija al canjear |
  | — | `UNIQUE(natillera_id, user_id)` | Un usuario = máximo un socio por natillera |
- **Reglas:** un usuario puede estar vinculado a varias natilleras (una fila por cada una). Un `socios_natillera` tiene como máximo un `user_id` activo.
- **Errores:** si el usuario ya está vinculado a otro socio de la misma natillera → `E-VINC-01` «Esta cuenta ya está vinculada a otro socio de esta natillera».

#### RF-03 — Invitar al portal con código de 6 dígitos 🔴
- **Entrada:** el admin abre la ficha del socio → acción **«Invitar al portal»**. También acción en lote **«Invitar a todos»** sobre los socios activos sin vincular.
- **Salida:** código numérico de **6 dígitos**, más un token opcional para el enlace `/unirme?t=<token>`.
- **Reglas:**
  - Vigencia **72 horas**; **un solo uso**; revocable y regenerable en cualquier momento.
  - Al regenerar, el código anterior queda inválido de inmediato.
  - El código se almacena **hasheado**, nunca en claro; se muestra al admin una sola vez tras generarlo (con opción de regenerar si lo pierde).
  - Un socio inactivo (`socios_natillera.estado = 'inactivo'`) **no** puede ser invitado.
- **Canal:** el sistema arma el mensaje de WhatsApp con `wa.me` (patrón ya usado en el proyecto); el admin decide si lo envía, lo dicta o lo imprime. **No se envían SMS.**
- **Tabla nueva:** `socio_invitaciones` (`id`, `socios_natillera_id`, `codigo_hash`, `token`, `estado`, `expira_en`, `creado_por`, `usado_por`, `usado_en`, `created_at`).

#### RF-04 — Canjear el código y confirmar identidad 🔴
- **Flujo:** el socio abre `/unirme` → escribe el código de 6 dígitos → el sistema muestra **su nombre y el nombre de la natillera** → el socio confirma «Sí, soy yo» → se autentica (registro o login) → queda vinculado.
- **Validaciones y errores:**
  | Situación | Respuesta |
  |-----------|-----------|
  | Código inexistente o mal escrito | `E-INV-01` «Código no válido» |
  | Código expirado (> 72 h) | `E-INV-02` «Este código expiró. Pídele uno nuevo a tu administrador» |
  | Código ya usado | `E-INV-03` «Este código ya fue utilizado» |
  | Socio ya vinculado a otro usuario | `E-INV-04` «Este socio ya tiene una cuenta vinculada» |
  | 5 intentos fallidos desde el mismo dispositivo | Bloqueo de 15 minutos |
- **Auditoría:** se registra quién canjeó, cuándo y desde qué dispositivo.
- **Riesgo asumido y su contención:** un código dictado frente al grupo podría usarlo otra persona. Se contiene con expiración corta, uso único, pantalla de confirmación de identidad, auditoría visible para el admin y capacidad de revocar.

#### RF-05 — Reingreso del socio 🔴
- Sesión persistente en el dispositivo, más **PIN de 4 dígitos** que el socio define en su primer ingreso.
- El PIN se guarda **hasheado**; nunca en claro ni en `localStorage`.
- Olvido del PIN → el socio pide un código nuevo al admin (mismo flujo RF-03).
- Sin este requisito el socio necesitaría un código nuevo cada vez que cierre sesión.

#### RF-06 — Selección de natillera y resolución de rol 🔴
- Al entrar, el socio aterriza en **su** natillera.
- Si pertenece a **varias**, se muestra un selector arriba; si pertenece a **una**, entra directo sin paso intermedio.
- El rol se resuelve **por natillera** leyendo `socios_natillera.rol`: el mismo usuario puede ver `/dashboard` como administrador en una natillera y `/mi` como socio en otra.
- **Layout propio** `SocioLayout.vue`, sin el menú de gestión del administrador.
- **Guard de router** por `meta.rol`: un socio que intente entrar a una ruta de admin es redirigido a `/mi` (no a un 403 genérico).

#### RF-07 — Home «Mi natillera» 🔴
Tarjetas KPI en este orden de prioridad:
1. **Ahorro acumulado** — suma de cuotas efectivamente pagadas.
2. **Ganancias estimadas a hoy** — utilidades distribuidas según `config_cierre`.
3. **Saldo de préstamos** — lo que el socio debe al fondo.
4. **Proyección a recibir en el cierre** = ahorro + ganancias − descuentos.

Además:
- **Estado del socio**: al día / parcial / en mora, con el **valor exacto pendiente**.
- **Próximo pago**: valor, fecha límite y días restantes.
- **Progreso del ciclo**: cuota N de M y fecha de cierre de la natillera.
- Toda cifra de ganancias se rotula explícitamente como **«estimado, sujeto al cierre»**.
- Se resuelve en **una sola llamada** vía RPC `mi_resumen_natillera(p_natillera_id)` (RNF-02).

#### RF-08 — Mis aportes (cuotas) 🔴
- Listado cronológico por período (mes o quincena) con: valor, valor pagado, estado
  (`pendiente`, `parcial`, `pagada`, `mora`), fecha límite y fecha de pago.
- **Desglose del pago** cuando existe, leyendo los campos ya construidos: capital
  (`valor_pagado_cuota`), multa (`valor_pagado_sancion`), actividades
  (`valor_pagado_actividades`), 4×1000 (`impuesto_4x1000`) y forma de pago
  (`valor_pagado_efectivo` / `valor_pagado_transferencia`).
- Comprobante asociado: ver y descargar. Historial de pagos de la cuota.
- Filtros por **año** y por **estado**. Totales: pagado vs. plan del ciclo.
- El período que **cruza años** (ej. diciembre–noviembre) se resuelve con la misma lógica del admin (`calcularAnioMes`), no con el año calendario.

#### RF-09 — Mis ganancias 🔴
- Desglose por concepto según `TIPOS_UTILIDAD`: `prestamos`, `rifas`, `bingo`, `venta`, `evento`, `otro`, `sanciones`, `utilidades_adicionales`.
- Junto a **cada concepto** se muestra **cómo se reparte** —proporcional al ahorro o equitativa— leído de `config_cierre` mediante `getModoDistribucion()`. Sin esa explicación la cifra genera desconfianza, que es lo contrario del objetivo del portal.
- Evolución del acumulado a lo largo del ciclo.
- Todo rotulado como estimado hasta el cierre.

#### RF-10 — Mis préstamos (consulta) 🔴
- **Activos:** monto, interés, saldo actual, plan de pagos (`plan_pagos_prestamo`), próxima cuota y días de mora si aplica.
- **Historial:** préstamos pagados y cancelados, con sus comprobantes.
- v1 es **solo lectura**: no hay solicitud de préstamo (fase 2).

#### RF-11 — Mis actividades 🔴
- Actividades del ciclo en que participa (`socios_actividad`, `numeros_rifa`): tipo, aporte comprometido, pagado, pendiente.
- Números de rifa asignados y resultado del sorteo.
- Utilidad que la actividad le generó, cuando ya está clasificada.

#### RF-12 — Estado de cuenta 🟡
- El comprobante individual que hoy produce el módulo de cierre (`NatilleraCierre.vue`) —ahorro, ganancias, descuentos, total a entregar— queda disponible para el socio **en cualquier momento**, no solo al cierre.
- Formato: imagen descargable y texto para WhatsApp, igual que el actual.
- **Parcial** porque el cálculo y el render ya existen; falta exponerlos al socio con sus propios datos y sin acceso al resto del grupo.

#### RF-13 — Mi cuenta 🔴
- **Editable por el socio:** nombre, email, documento, avatar. El **teléfono** se edita con **re-verificación OTP** (es dato de contacto y candidato a llave de acceso).
- **No editable, solo solicitud al admin:** valor de cuota, periodicidad, estado, rol.
- Preferencias de notificación (se guardan aunque el envío sea fase 2), cerrar sesión y desvincular cuenta.
- **Todo cambio queda en auditoría**, igual que los del admin.

#### RF-14 — Transparencia del grupo 🔴
Configurable por el admin en `natilleras.config_portal_socio`. **Defecto: nivel 0.**

| Nivel | El socio ve |
|-------|-------------|
| **0 (defecto)** | Solo sus propias cifras. Nada del grupo. |
| 1 | Además: totales agregados y **anónimos** — fondo acumulado, número de socios, total prestado, utilidades del período. |
| 2 | Además: **quién está al día y quién no** — nombre y estado, **sin montos**. |

- **Nunca** se expone teléfono, documento, email ni saldos individuales de otros socios, en ningún nivel.
- El nivel lo cambia solo el **administrador** (no un colaborador).

#### RF-15 — Gestión de vínculos desde el admin 🔴
- Vista de Socios: columna/indicador de estado de vínculo (`sin_invitar`, `invitado`, `vinculado`, `revocado`).
- Acciones: invitar, reinvitar, revocar código, **desvincular cuenta**.
- **Bandeja de solicitudes de vinculación** (para los casos que entren por la vía de solicitud, fase 2 del mecanismo).
- Toda acción queda auditada con actor, socio afectado y fecha.

---

## 5. Reglas de negocio

| ID | Regla | Estado | Origen |
|----|-------|--------|--------|
| RN-01 | El rol se resuelve **por natillera** (`socios_natillera.rol`), nunca global. | 🟢 modelo existe, 🔴 no se usa para autorizar | `schema.sql:59` |
| RN-02 | El socio **nunca escribe cifras** del fondo. Toda operación del portal sobre dinero es de lectura. | 🔴 | Decisión §7.3 del requerimiento |
| RN-03 | Ahorro acumulado = suma de lo efectivamente pagado como **capital de cuota** (`valor_pagado_cuota`), sin sanciones, actividades ni 4×1000. | 🔴 | Coherencia con `calcularCierreNatillera()` |
| RN-04 | Proyección de cierre = ahorro + utilidades distribuidas − descuentos, calculada con `calcularCierreNatillera()`. **Siempre rotulada como estimada.** | 🟢 cálculo, 🔴 exposición | `useCierreNatillera.js:90` |
| RN-05 | Las utilidades se distribuyen por concepto según `config_cierre`, en modo **equitativa** o **proporcional** al ahorro; el modo se muestra junto a la cifra. | 🟢 | `getModoDistribucion()` |
| RN-06 | El año de cada período se calcula con la lógica de período de la natillera (puede cruzar años), no con el año calendario. | 🟢 en admin, 🔴 en portal | `calcularAnioMes` |
| RN-07 | El código de invitación expira a las **72 horas**, es de **un solo uso** y se guarda hasheado. | 🔴 | Decisión §7.1 |
| RN-08 | Un `socios_natillera` admite un solo `user_id` vinculado; un `user_id` admite un solo socio por natillera (`UNIQUE(natillera_id, user_id)`). | 🔴 | RF-02 |
| RN-09 | Un socio con `estado = 'inactivo'` no puede ser invitado ni ingresar; si se inactiva estando vinculado, pierde el acceso conservando el vínculo (revocable). | 🔴 | — |
| RN-10 | Nivel de transparencia por defecto **0**. Subirlo es decisión explícita del administrador. Justificación legal: Ley 1581 de 2012 (Habeas Data) exige finalidad y acceso restringido. | 🔴 | Decisión §7.2 |
| RN-11 | La auto-vinculación por teléfono (fase 2) exige **primero** normalizar los teléfonos a E.164 y medir cuántos son únicos globalmente. Hoy `socios.telefono` no es único. | 🔴 | `remove_telefono_unique_constraint.sql` |
| RN-12 | El aislamiento se garantiza en **base de datos** (RLS), no en el frontend. Ocultar en la UI no es cumplimiento. | 🔴 | RNF-01 |

**Bordes que toda implementación debe respetar**

- Natillera **quincenal**: los aportes se listan por quincena (`cuotas.quincena` ∈ {1,2}), no por mes.
- Socio con **cero cuotas generadas**: el home muestra estado vacío explicativo, no ceros sin contexto.
- Socio que ingresa a mitad de ciclo (`fecha_ingreso` posterior al inicio): el progreso del ciclo se calcula sobre **sus** cuotas, no sobre las del grupo.
- Natillera **cerrada**: el portal pasa a modo histórico; el estado de cuenta muestra cifras definitivas, sin el rótulo «estimado».
- Montos en **pesos colombianos**, sin decimales en la presentación; los cálculos internos redondean a 2 decimales (`round2`).

---

## 6. Modelo de datos

### 6.1 Cambios en tablas existentes

| Tabla | Cambio | Estado |
|-------|--------|--------|
| `socios_natillera` | + `user_id uuid references auth.users(id)`, + `vinculo_estado varchar(20)`, + `fecha_vinculacion timestamptz`, + `UNIQUE(natillera_id, user_id)` | 🔴 |
| `socios` | + `telefono_e164 varchar(20)` normalizado + índice (hoy los formatos son heterogéneos) | 🔴 |
| `natilleras` | + `config_portal_socio jsonb` (incluye `nivel_transparencia`, defecto `0`) | 🔴 |

### 6.2 Tablas nuevas

| Tabla | Propósito |
|-------|-----------|
| `socio_invitaciones` | Códigos de 6 dígitos y tokens: hash, estado, expiración, uso, auditoría |
| `socio_vinculo_solicitudes` | Solicitudes de vinculación iniciadas por el socio (mecanismo complementario) |

### 6.3 Funciones y RPC

| Función | Tipo | Propósito |
|---------|------|-----------|
| `es_socio_de(natillera_id)` | `SECURITY DEFINER` | Predicado base de las policies de socio |
| `mi_socio_natillera_id(natillera_id)` | `SECURITY DEFINER` | Devuelve la fila propia del usuario |
| `mi_resumen_natillera(p_natillera_id)` | `SECURITY DEFINER` | KPI del home en **una sola llamada** |
| `aceptar_invitacion_socio(p_codigo)` | `SECURITY DEFINER` | Valida, marca usada y vincula |

### 6.4 Políticas RLS nuevas

Policies `*_socio_select` sobre `cuotas`, `prestamos`, `pagos_prestamo`, `plan_pagos_prestamo`,
`socios_actividad`, `numeros_rifa` y `multas`, limitadas a `mi_socio_natillera_id()`.
No basta con extender `tiene_acceso_natillera()`: esa función es binaria y da acceso total.

### 6.5 Migraciones

Numeración a partir de `020_`. Cada migración es idempotente (`IF NOT EXISTS`), como las 001–019.

---

## 7. Interfaz de usuario

- **Layout:** `SocioLayout.vue` propio, sin el menú de gestión del admin. Navegación inferior en móvil: Inicio · Aportes · Préstamos · Cuenta.
- **Móvil (prioritario):** el socio entra desde celular y datos móviles. Una columna, tarjetas KPI apiladas, cifras grandes y legibles.
- **Desktop:** rejilla de KPI y listados en tabla.
- **Estados de pantalla obligatorios:** carga (esqueleto), vacío (sin cuotas / sin préstamos / sin actividades), error de red, sin permisos, natillera cerrada.
- **Modales:** todos con `ModalWrapper` (skill `natillerapp-modals`) — confirmación de identidad al canjear el código, definición del PIN, edición de datos, re-verificación de teléfono, desvincular cuenta. Cuerpo scrolleable con `natiscroll`.
- **Iconos:** `@heroicons/vue/24/outline`.
- **Color marca:** `#1B5E37`; backdrop salvia `#C8D9C8`. Título con `font-display`.
- **Rótulo de estimación:** las cifras de ganancias y proyección llevan un distintivo visual permanente, no una nota al pie.

## 8. Requisitos no funcionales

| ID | Requisito | Estado |
|----|-----------|--------|
| RNF-01 | **Aislamiento de datos (crítico):** RLS limita al socio a las filas de su propio `socios_natillera`. Verificable consultando directamente la API con el token del socio. | 🔴 |
| RNF-02 | **Superficie mínima:** los KPI del home se sirven por RPC `SECURITY DEFINER`, sin exponer las tablas base al rol socio. | 🔴 |
| RNF-03 | **Sin credenciales compartidas:** eliminado `iniciarSesionAdmin()` (RF-01). Pre-requisito bloqueante. | 🟡 |
| RNF-04 | **Guard de rutas por rol** en el router (`meta.rol`), además del RLS. | 🔴 |
| RNF-05 | **iOS/Safari y PWA** según `CLAUDE.md` §1: `100dvh` con fallback, `env(safe-area-inset-*)`, inputs ≥ 16 px, `touch-action: manipulation`, área táctil ≥ 44×44 px, `useBodyScrollLock` en modales. | 🔴 |
| RNF-06 | **Auditoría:** ingreso del socio, cambios de datos, vinculación y desvinculación quedan registrados. | 🟡 (sistema de auditoría existe) |
| RNF-07 | **Rendimiento:** el home resuelve en una sola llamada; objetivo < 2 s en 4G. | 🔴 |
| RNF-08 | Los secretos (código, PIN) se almacenan hasheados; nunca en `localStorage` ni en logs. | 🔴 |

---

## 9. Criterios de aceptación

- **CA-01 (RF-01, RNF-03):**
  *Dado* el código de la aplicación en la rama de entrega,
  *cuando* se busca `admin@gmail.com` o `admin123*` en `src/`,
  *entonces* no hay ninguna coincidencia y `iniciarSesionAdmin` no existe.

- **CA-02 (RF-03, RN-07):**
  *Dado* un socio activo sin vincular,
  *cuando* el administrador pulsa «Invitar al portal»,
  *entonces* el sistema muestra un código de 6 dígitos una sola vez, crea la invitación con estado `invitado` y expiración a 72 horas, y en la base de datos el código queda hasheado.

- **CA-03 (RF-04):**
  *Dado* un código válido y vigente,
  *cuando* el socio lo ingresa en `/unirme`,
  *entonces* ve su nombre y el de su natillera, y solo tras confirmar «Sí, soy yo» queda vinculado con `vinculo_estado = 'vinculado'` y `fecha_vinculacion` fijada.

- **CA-04 (RF-04, RN-07):**
  *Dado* un código ya utilizado,
  *cuando* otra persona lo ingresa,
  *entonces* el sistema responde `E-INV-03` «Este código ya fue utilizado» y no crea ningún vínculo.

- **CA-05 (RF-04):**
  *Dado* un código generado hace más de 72 horas,
  *cuando* el socio lo ingresa,
  *entonces* el sistema responde `E-INV-02` y ofrece pedirle uno nuevo al administrador.

- **CA-06 (RF-05):**
  *Dado* un socio ya vinculado que definió su PIN,
  *cuando* vuelve a abrir la app en el mismo dispositivo,
  *entonces* ingresa con el PIN de 4 dígitos sin necesitar un código nuevo.

- **CA-07 (RF-06, RN-01):**
  *Dado* un usuario que es administrador en la natillera A y socio en la natillera B,
  *cuando* inicia sesión,
  *entonces* puede alternar entre ambas y en A ve el layout de administración y en B el `SocioLayout`, sin acceso a la gestión de B.

- **CA-08 (RF-06, RNF-04):**
  *Dado* un socio autenticado,
  *cuando* escribe manualmente la URL `/natilleras/:id/cuotas`,
  *entonces* el router lo redirige a `/mi` y ninguna consulta a datos de terceros llega a ejecutarse.

- **CA-09 (RF-07, RN-04):**
  *Dado* un socio con cuotas pagadas y utilidades del ciclo,
  *cuando* abre el home,
  *entonces* ve los cuatro KPI en orden —ahorro, ganancias, saldo de préstamos, proyección— y las cifras de ganancias y proyección aparecen rotuladas como «estimado, sujeto al cierre».

- **CA-10 (RF-07, RNF-02, RNF-07):**
  *Dado* el home del socio,
  *cuando* se inspecciona la red al cargarlo,
  *entonces* los KPI provienen de una sola llamada a `mi_resumen_natillera`.

- **CA-11 (RF-08):**
  *Dado* un socio con una cuota pagada por transferencia con multa y 4×1000,
  *cuando* abre el detalle de esa cuota,
  *entonces* ve el desglose separado de capital, multa, actividades y 4×1000, y la forma de pago.

- **CA-12 (RF-08):**
  *Dado* una natillera quincenal,
  *cuando* el socio abre «Mis aportes»,
  *entonces* los períodos se listan por quincena (1 y 2 de cada mes) y no como un único aporte mensual.

- **CA-13 (RF-09, RN-05):**
  *Dado* una natillera con `config_cierre` que reparte préstamos de forma proporcional y rifas de forma equitativa,
  *cuando* el socio abre «Mis ganancias»,
  *entonces* junto a cada concepto se indica el modo de reparto correspondiente.

- **CA-14 (RF-14, RN-10):**
  *Dado* una natillera recién creada sin configurar el portal,
  *cuando* un socio entra,
  *entonces* el nivel de transparencia es 0 y no ve ninguna cifra ni nombre de otro socio.

- **CA-15 (RF-14):**
  *Dado* el nivel de transparencia 2,
  *cuando* el socio consulta el grupo,
  *entonces* ve nombres y estado de pago de los demás, y **ningún** monto, teléfono, documento ni email.

- **CA-16 (RNF-01, RN-12):**
  *Dado* el token de sesión de un socio,
  *cuando* se consulta directamente la API de Supabase por cuotas de **otro** socio de la misma natillera,
  *entonces* la respuesta viene vacía por RLS, sin depender de ningún filtro del frontend.

- **CA-17 (RF-13):**
  *Dado* un socio en «Mi cuenta»,
  *cuando* intenta cambiar su valor de cuota o su periodicidad,
  *entonces* los campos aparecen bloqueados con la indicación de solicitarlo al administrador, y el cambio de teléfono exige re-verificación OTP.

- **CA-18 (RF-15, RN-09):**
  *Dado* un socio vinculado que el administrador marca como inactivo,
  *cuando* el socio intenta entrar,
  *entonces* se le informa que su participación está inactiva y no accede a datos del ciclo.

- **CA-19 (RNF-05):**
  *Dado* el portal abierto en Safari iOS,
  *cuando* el socio abre cualquier modal con contenido largo,
  *entonces* el fondo no hace scroll, las acciones quedan alcanzables sobre la safe-area y al enfocar un input Safari no hace zoom.

- **CA-20 (RNF-06):**
  *Dado* un canje de código y un cambio de datos personales,
  *cuando* el administrador revisa la auditoría,
  *entonces* encuentra ambos eventos con actor, socio afectado y fecha.

---

## 10. Casos borde y errores esperados

| # | Situación | Comportamiento esperado |
|---|-----------|-------------------------|
| 1 | Socio sin cuotas generadas | Estado vacío explicativo: «Tu administrador aún no ha generado tus cuotas». No mostrar ceros sin contexto. |
| 2 | Socio que ingresó a mitad de ciclo | El progreso se calcula sobre sus propias cuotas, no sobre las del grupo. |
| 3 | Natillera cerrada | Modo histórico: cifras definitivas, sin el rótulo «estimado». |
| 4 | Sin conexión / Supabase caído | Mensaje de error con acción de reintentar; nunca cifras a medias ni ceros como si fueran reales. |
| 5 | Usuario vinculado a varias natilleras | Selector arriba; la última elegida se recuerda en el dispositivo. |
| 6 | Socio con préstamo en mora | El saldo y los días de mora se muestran sin lenguaje punitivo; la cifra es la del cálculo del admin, sin recalcular aparte. |
| 7 | Admin revoca el vínculo con sesión activa del socio | La siguiente petición falla por RLS y el socio es enviado a la pantalla de ingreso con explicación. |
| 8 | Dos socios en la misma natillera con el mismo teléfono | No afecta la v1: la vinculación es por código, no por teléfono. Es la razón por la que RN-11 bloquea la fase 2. |
| 9 | Código ingresado con espacios o guiones | Se normaliza antes de validar; no se rechaza por formato. |
| 10 | Socio que perdió el PIN | Flujo de código nuevo (RF-03), sin recuperación por email. |

---

## 11. Preguntas abiertas

| # | Pregunta | Responsable | Estado |
|---|----------|-------------|--------|
| 1 | **¿El socio puede cambiar su propio teléfono?** Es dato de contacto y candidato a llave de acceso (fase 2, opción B). La spec asume **sí, con re-verificación OTP** (RF-13); confirmar. | Esteban | Abierta |
| 2 | ¿El colaborador con permisos puede invitar al portal, o solo el administrador? La spec asume que **sí con permiso explícito**, y que el nivel de transparencia lo cambia **solo el administrador**. | Esteban | Abierta |
| 3 | ¿Vigencia del código exactamente 72 h, o configurable por natillera? La spec fija 72 h. | Esteban | Abierta |
| 4 | ¿Qué ocurre con el flujo OTP actual (`enviarOTPTelefono` / `verificarOTPTelefono`) al eliminar `iniciarSesionAdmin()`? ¿Se desactiva por completo en v1 o se reconstruye sobre sesiones reales? | Esteban | Abierta |
| 5 | ¿El estado de cuenta (RF-12) se descarga como imagen, PDF o ambos? La spec asume imagen + texto WhatsApp, igual que el cierre actual. | Esteban | Abierta |

---

## 12. Historial de cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-08-30 | Versión inicial. Deriva del levantamiento `Funcionalidades/Portal-Socio/requerimiento-portal-socio.md` (29 ago 2026), verificando contra el código el estado real de cada pieza. |

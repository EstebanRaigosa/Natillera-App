# Plan: modo claro / oscuro

Estado: **fases 0–3 implementadas (2026-10-01), opción OCULTA: la app va en claro** (`MODO_OSCURO_LIBERADO = false`; preferencia por defecto 'claro'; probar con `?tema-pruebas=1`) · Fecha: 2026-10-01

> Avance: tokens, `useTema`, migración 057, interruptor en Mi cuenta (oculto), clases globales, layout, componentes compartidos (Agente_002), soporte y Portal del socio. Liberado: `MODO_OSCURO_LIBERADO = true` en `src/composables/useTema.js`; por defecto cada usuario ve el tema de su dispositivo. Siguiente: fase 3.

## 1. Objetivo

Que cada usuario elija **Claro**, **Oscuro** o **Automático** (el que tenga su teléfono o computador), y que la app se vea bien en los dos modos, en iPhone y en Android, sin romper lo que hoy funciona.

Fuera de alcance:

- Los **comprobantes e imágenes que se comparten** (cierre, cuotas, préstamos, estado del socio). Siempre salen en claro, porque se ven en WhatsApp y se imprimen.
- Las **páginas públicas** (landing, guía y legales). Se dejan en claro hasta una fase posterior; son pre-render y tienen su propia identidad.

## 2. Punto de partida (medido en el código)

| Qué | Cantidad |
|---|---|
| Componentes `.vue` | 130 (≈107 000 líneas) |
| `bg-white` fijos | ≈1 260 |
| `text-gray-*` / `bg-gray-*` / `border-gray-*` | ≈3 500 |
| Hex escritos a mano (`#1B5E37`, …) | ≈2 900 |
| Hex dentro de CSS scoped | ≈1 220, en 56 componentes con `<style>` |
| Usos de `dark:` | 1 |
| Variables de diseño en `style.css` | Sí: `--surface-*`, `--brand-*`, `--shadow-*` y las HSL estilo shadcn (`--background`, `--card`…). Se usan poco |

Archivos con más color fijo (los que más trabajo darán):

| Archivo | Colores fijos | Líneas |
|---|---|---|
| `views/cuotas/Cuotas.vue` | 1 091 | 16 881 |
| `views/prestamos/Prestamos.vue` | 753 | 8 536 |
| `views/actividades/Actividades.vue` | 663 | 8 630 |
| `views/natilleras/NatilleraDetalle.vue` | 639 | 8 109 |
| `views/socios/Socios.vue` | 369 | 7 997 |
| `views/cuadre/CuadreCaja.vue` | 248 | 3 870 |
| `views/natilleras/NatilleraConfiguracion.vue` | 190 | 3 612 |
| `views/portal/PortalSocio.vue` | 167 | 2 244 |
| `views/Dashboard.vue` | 115 | 1 861 |

## 3. Decisiones de diseño

### 3.1 Colores por función, no por tono

El problema de fondo es que un mismo color cumple papeles opuestos. `white` es el fondo de una tarjeta y también el texto de una cabecera verde; `gray-500` es texto secundario aquí y borde allá. Invertir la paleta de golpe rompe la mitad.

Por eso se crean **tokens semánticos** en `style.css`: variables con nombre de función. Cada uno tiene un valor claro y otro oscuro.

| Token | Uso | Claro | Oscuro (propuesta) |
|---|---|---|---|
| `--superficie-lienzo` | Fondo de la app | `hsl(220 13% 92%)` | `#0e1512` |
| `--superficie-tarjeta` | Tarjetas, modales | `#ffffff` | `#17201b` |
| `--superficie-suave` | Chips, filas alternas, `bg-slate-50` | `#f8fafc` | `#1d2822` |
| `--superficie-elevada` | Menús, popovers | `#ffffff` | `#222e27` |
| `--texto` | Texto principal (`gray-800/900`) | `#1f2937` | `#e6ede9` |
| `--texto-secundario` | `gray-500/600` | `#6b7280` | `#a3b1aa` |
| `--texto-tenue` | `gray-400`, marcadores | `#9ca3af` | `#76847d` |
| `--borde` | `border-gray-200` | `rgba(15,23,42,.08)` | `rgba(255,255,255,.08)` |
| `--borde-fuerte` | `border-gray-300`, inputs | `rgba(15,23,42,.14)` | `rgba(255,255,255,.14)` |
| `--marca` | Verde `#1B5E37` (cabeceras, CTA) | `#1B5E37` | `#1B5E37` (se mantiene) |
| `--texto-sobre-marca` | Texto encima del verde | `#ffffff` | `#ffffff` |
| `--velo-modal` | Backdrop salvia | `#C8D9C8b3` | `#000000a6` |
| `--exito/-suave`, `--alerta/-suave`, `--peligro/-suave`, `--info/-suave` | Estados y badges | Actuales | Tonos -400 sobre fondo al 15 % |

Se exponen a Tailwind 4 con `@theme` (p. ej. `bg-superficie-tarjeta`, `text-texto-secundario`, `border-borde`). Así se sigue escribiendo Tailwind, como pide CLAUDE.md, y no CSS suelto. Las variables viejas (`--surface-*`, `--brand-*`, `--background`…) pasan a ser alias de las nuevas para no romper lo que ya las usa.

### 3.2 Cómo se activa

- Atributo `data-tema="oscuro"` en `<html>`, y variante de Tailwind `@custom-variant oscuro (&:where([data-tema=oscuro], [data-tema=oscuro] *))` para los casos puntuales (`oscuro:...`).
- Los tokens se redefinen en `html[data-tema="oscuro"] { … }`. Los componentes que ya usen tokens no necesitan `oscuro:`.
- **Automático** = `prefers-color-scheme`, escuchado con `matchMedia(...).addEventListener('change')` y quitado al desmontar.
- **Sin parpadeo:** un script en línea en `index.html`, antes de cargar la app, lee la preferencia guardada y pone `data-tema`. Si se espera a Vue, se ve un destello blanco al abrir.
- `color-scheme: light | dark` en `<html>`: los controles nativos (scrollbars, `<select>`, `date`, autofill) siguen el modo. Esto es clave en iOS.

### 3.3 Dónde se guarda la preferencia

- `localStorage` (`natillerapp:tema`) para aplicarla al instante y sin sesión. Las lecturas y escrituras van envueltas en `try/catch`, porque en Safari privado lanzan error.
- Columna nueva `user_profiles.tema` (`'claro' | 'oscuro' | 'auto'`) para que siga al usuario entre dispositivos. Al iniciar sesión gana la de la base.
- Composable `useTema()` con `{ tema, temaEfectivo, cambiarTema }`.

### 3.4 Interruptor

- En **Mi cuenta** (`views/usuario/MiCuenta.vue`): control segmentado Claro / Oscuro / Automático, con `SwitchSegmentado`, que ya existe.
- Acceso rápido en el menú de usuario del `DashboardLayout` (icono sol/luna).
- En el **portal del socio**, el mismo acceso en su cabecera.

### 3.5 Lo que siempre queda en claro

- **Comprobantes compartibles:** el contenedor que se captura con `html-to-image` lleva `data-tema="claro"` fijo, y los tokens se resuelven en claro dentro de él. Archivos:
  - `components/estado/ComprobantePagoSocio.vue`, `ComprobanteEstadoSocio.vue`, `ComprobanteRetiroSocio.vue`
  - `components/cierre/ComprobanteCierreSocio.vue`, `ComprobanteCierrePreviewModal.vue`
  - `components/cuotas/ComprobanteVariasCuotasModal.vue`
  - Los recibos dentro de `Prestamos.vue`, `Cuotas.vue`, `Actividades.vue`, `Socios.vue`, `NotificarSocios.vue` y `PortalSocio.vue`
  - `composables/useCapturaCompleta.js`
- Exportaciones a Excel y PDF: no cambian.

### 3.6 iOS / Safari (según `docs/compatibilidad-ios-safari.md`)

- `<meta name="theme-color">` doble, con `media="(prefers-color-scheme: dark)"`, y además actualizado por JS cuando el usuario fuerza un modo. Hoy es fijo `#1B5E37`. Si no se hace, en iPhone queda una franja clara arriba.
- `apple-mobile-web-app-status-bar-style`: revisar `default` frente a `black-translucent` con la PWA instalada.
- Manifest de la PWA (`vite.config.js`): `background_color` es la pantalla de arranque. Se elige uno neutro que funcione en los dos modos, porque el manifest no admite variantes.
- Fondo de `html` y `body` con el token de lienzo: el «rebote» del scroll en iOS deja ver ese color.
- Backdrop de modales: en oscuro, velo negro translúcido en lugar del salvia; mantener el fallback sólido de `backdrop-filter`.
- Inputs: `color-scheme` evita los fondos blancos del autofill y de los pickers nativos.
- Sin `!important` genéricos (rompen las transiciones de Vue, §checklist de CLAUDE.md).

## 4. Fases

Cada fase se puede publicar sola. Las pantallas que no se hayan migrado **se quedan en claro** (su contenedor raíz lleva `data-tema="claro"`). Así no hay pantallas a medio oscurecer: una pantalla se libera cuando está completa.

### Fase 0 · Cimientos (1–2 días)

- [ ] Tokens semánticos claro/oscuro en `style.css` y alias de las variables viejas.
- [ ] `@theme` para exponerlos como utilidades de Tailwind y variante `oscuro:`.
- [ ] `useTema()`, script anti-parpadeo en `index.html`, `color-scheme` y `theme-color` dinámico.
- [ ] Migración `057_tema_usuario.sql` (`user_profiles.tema`) y sincronización al iniciar sesión.
- [ ] Interruptor en Mi cuenta, **oculto** tras un flag hasta terminar la fase 2.
- [ ] Atributo `data-tema="claro"` forzado en la raíz de cada vista no migrada (lista blanca de vistas migradas).

### Fase 1 · Piezas compartidas (2–3 días)

Con estas, la mayoría de los modales y del «marco» de la app cambia de una vez:

- [ ] `DashboardLayout.vue`, `AuthLayout.vue` (fondo, barra lateral, header móvil, bottom nav).
- [ ] `ModalWrapper.vue`, cabecera marca, `NatiscrollHint`, pies de acción.
- [ ] Clases globales de `style.css`: `ds-*` (stat cards, badges), `btn-modal-primary/secondary`, inputs, scrollbar.
- [ ] `carga/*` (CargaPantalla, CargaCaja, CargaBoton): la alcancía y el anillo.
- [ ] `SwitchSegmentado`, notificaciones (toasts), `RecorridoInteractivo` (foco y tarjeta).
- [ ] Componentes de soporte (chat, burbujas, redactor).

### Fase 2 · Portal del socio (2–3 días) → **primera entrega visible**

Es lo que ven los socios y la vista más acotada (167 colores fijos):

- [ ] `PortalSocio.vue`: tablero (parte verde + onda de deuda), aportes, préstamos, rifas.
- [ ] `EscenaAlcancia` en versión compacta: revisar contraste de la alcancía sobre verde oscuro.
- [ ] Comprobantes del portal forzados en claro.
- [ ] Prueba en iPhone (Safari y PWA instalada) y Android.
- [ ] **Se activa el interruptor**, primero para el portal y el marco.

### Fase 3 · Administración, de mayor a menor uso (≈3–4 semanas)

Una vista por entrega; cada una sale de la lista de «forzadas en claro» al terminarla.

| Orden | Vista | Esfuerzo estimado |
|---|---|---|
| 1 | `Dashboard.vue` + `DashboardNatilleraCard` | 1 día |
| 2 | `NatilleraDetalle.vue` | 3 días |
| 3 | `Cuotas.vue` (+ modales de pago, comprobantes en claro) | 5 días |
| 4 | `Prestamos.vue` (+ `InteresesGanadosModal`) | 3–4 días |
| 5 | `Actividades.vue` + `ActividadCard` | 3–4 días |
| 6 | `Socios.vue` + `SocioFormModal` | 3 días |
| 7 | `CuadreCaja`, `ConciliacionCaja`, `NatilleraCierre` | 3 días |
| 8 | `NatilleraConfiguracion`, `NatilleraCrear`, `PagosSocios`, `NotificarSocios` | 3 días |
| 9 | Admin (`DataAdmin`, `CorreosAdmin`, `Auditoria`, usuarios) | 2 días |

Método por vista:

1. Reemplazos mecánicos con un script revisado a mano: `bg-white` → `bg-superficie-tarjeta`, `text-gray-800` → `text-texto`, `border-gray-200` → `border-borde`, `bg-slate-50` → `bg-superficie-suave`… **Nunca** en texto que va sobre verde u otro color de marca (`text-white` se queda).
2. Hex en CSS scoped → `var(--token)`.
3. Badges y estados (verde/ámbar/rojo/azul) → tokens de estado.
4. Revisar a ojo en los dos modos, con contraste mínimo AA (4.5:1 en texto).

### Fase 4 · Cierre (2–3 días)

- [ ] Páginas públicas, si se decide incluirlas.
- [ ] Barrido final: buscar `bg-white`, `text-gray-`, `#fff` restantes y justificar o migrar los que queden.
- [ ] Quitar el mecanismo de «forzar claro» de las vistas (ya migradas todas).
- [ ] Documentar los tokens y la regla en CLAUDE.md §4 y en la skill de modales: **código nuevo usa tokens, no `bg-white` ni grises fijos**.

## 5. Riesgos y cómo se cubren

| Riesgo | Mitigación |
|---|---|
| Texto blanco sobre verde que se vuelve oscuro | Token propio `--texto-sobre-marca`; los reemplazos automáticos no tocan `text-white` |
| Comprobante compartido sale oscuro | `data-tema="claro"` fijo en el nodo que captura `html-to-image`; prueba por cada comprobante |
| Destello blanco al abrir | Script en línea en `index.html` antes del bundle |
| Barra de estado clara en iPhone | `theme-color` doble + actualización por JS |
| Pantallas a medio migrar | Forzar claro hasta liberar cada vista |
| Regresiones en modo claro | Los tokens claros valen exactamente lo que hay hoy; comparar capturas antes y después por vista |
| Código nuevo que vuelve a usar `bg-white` | Regla en CLAUDE.md y una búsqueda en el build que avise |

## 6. Cómo se valida cada entrega

- Revisión de código contra el checklist de iOS de CLAUDE.md §1.
- En dispositivo real: iPhone (Safari y PWA instalada) y Android (Chrome y PWA), en los dos modos y en «Automático» cambiando el modo del sistema con la app abierta.
- Generar al menos un comprobante de la vista y comprobar que sale en claro.
- Modo claro idéntico al actual.

## 7. Estimación total

| Fase | Tiempo |
|---|---|
| 0 · Cimientos | 1–2 días |
| 1 · Piezas compartidas | 2–3 días |
| 2 · Portal del socio (primera entrega) | 2–3 días |
| 3 · Administración | 3–4 semanas |
| 4 · Cierre | 2–3 días |
| **Total** | **≈5–6 semanas** de trabajo, con la primera entrega útil al cabo de ~1,5 semanas |

## 8. Reparto de la fase 3 (sin solaparse)

Reglas: `.claude/skills/natillerapp-modo-oscuro/SKILL.md`. Proceso por vista: skill §3.
Revisión independiente de cada lote: agente `revisor-modo-oscuro` (`.claude/agents/`).

**Cada sesión toca solo sus archivos.** Un archivo que no aparece aquí no es de nadie: se le pide a Agente_001 (coordinador) antes de tocarlo.

**Reservados a Agente_001**, aunque el cambio venga de otro lote: `src/style.css` (tokens y clases globales), `src/router/index.js` (marcar `temaOscuro`), `src/composables/useTema.js`, `scripts/tema/*`, la skill y este plan. Agente_002 pide por SendMessage el token nuevo o la ruta a marcar.

**Compilar siempre con `--outDir` propio**, nunca en `dist/`.

| Lote | Responsable | Vistas | Componentes propios |
|---|---|---|---|
| A · Dashboard | Agente_001 | `views/Dashboard.vue` | `Dashboard*.vue` (EmptyIlustracion, EmptySinNatilleras, FiltroSinResultados, NatilleraCard, NatilleraSocioCard, PropiedadSinResultados), `NatilleraCardCornerArt.vue`, `NatilleraDashboardIcon.vue`, `InvitacionesPendientes.vue`, `RechazarInvitacionConfirmModal.vue`, `MobileBottomNav.vue`, `Breadcrumbs.vue` |
| B · Cuotas | Agente_001 | `views/cuotas/Cuotas.vue` | `components/cuotas/*`, `CuotasAyudaModal.vue`, `CuotasPageSkeleton.vue`, `CuotasSkeleton.vue`, `DateInput.vue`, `DatePicker.vue` |
| C · Socios | Agente_001 | `views/socios/Socios.vue`, `views/socios/SociosEnApp.vue` | `components/socios/*`, `components/vinculo/*` |
| D · Caja y cierre | Agente_001 | `views/cuadre/CuadreCaja.vue`, `views/conciliacion/ConciliacionCaja.vue`, `views/natilleras/NatilleraCierre.vue`, `views/movimientos/Movimientos.vue` | `components/conciliacion/*`, `components/cierre/*` (los `Comprobante*` en claro), `components/movimientos/*`, `DesgloseUtilidadesModal.vue` |
| E · Cuenta y admin | Agente_001 | `views/usuario/MiCuenta.vue`, `views/configuracion/Configuracion.vue`, `views/admin/*`, `views/auditoria/Auditoria.vue`, `views/usuarios/Usuarios.vue`, `views/opinion/Opinion.vue` | `UsernameModal.vue`, `AvisoNuevaVersion.vue`, `AvisoNotificacionesPwa.vue`, `InstallPwaButton.vue`, `InstalarIosAnimacion.vue`, `ModalNovedadVisual.vue` |
| F · Natillera | Agente_002 | `views/natilleras/NatilleraDetalle.vue`, `views/natilleras/NatilleraConfiguracion.vue`, `views/natilleras/NatilleraCrear.vue`, `views/natilleras/AdministradoresNatillera.vue` | `ColaboradoresManager.vue`, `components/colaboradores/*` |
| G · Préstamos | Agente_002 | `views/prestamos/Prestamos.vue` | `components/prestamos/*`, `PrestamosSkeleton.vue`, `ExplicacionInteresPrestamo.vue` |
| H · Actividades | Agente_002 | `views/actividades/Actividades.vue` | `ActividadCard.vue`, `ActividadesSkeleton.vue`, `CargaCuadricula.vue` |
| I · Pagos, avisos e invitaciones | Agente_002 | `views/pagos/PagosSocios.vue`, `views/notificar/NotificarSocios.vue`, `views/invitaciones/*` | `components/pagos/*` |

Fuera de la fase 3 (siempre en claro por ahora): `AuthLayout`, `views/auth/*`, `views/publico/*`, `views/legal/*`, `components/publico/*`, `components/legal/*`, y los comprobantes de `components/estado/*`.

### Estado (2026-10-01)

| Lote | Responsable | Estado |
|---|---|---|
| A · Dashboard | Agente_001 | Migrado, ruta marcada, 2 revisiones (correcciones aplicadas) |
| B · Cuotas | Agente_001 | Migrado, ruta marcada, revisado (bloqueante del chip ámbar y círculos de cabecera corregidos) |
| C · Socios | Agente_001 | Migrado, rutas marcadas, 2 revisiones; correcciones aplicadas |
| D · Caja y cierre | Agente_001 | Migrado, rutas marcadas, aprobado en 2.ª revisión |
| E · Cuenta y admin | Agente_001 | Migrado, rutas marcadas (+ vista Soporte), 2 revisiones; correcciones aplicadas |
| F · Natillera | Agente_002 | Migrado, revisado, rutas marcadas |
| G · Préstamos | Agente_002 | Migrado, revisado, ruta marcada, reglas nuevas aplicadas |
| H · Actividades | Agente_002 | Migrado, revisado, ruta marcada |
| I · Pagos, avisos e invitaciones | Agente_002 | Migrado, revisado, rutas marcadas (UnirmeNatillera no: es pública) |

Herramientas: `scripts/tema/migrar-colores.mjs` (paso mecánico), `scripts/tema/proponer-oscuro.mjs` (propone el bloque de oscuro del `<style>`; se revisa a mano), `scripts/tema/revisar-colores.mjs` (verificación; `--detalle` lista los colores del CSS). Validado solo por código: falta la prueba en iPhone y Android.

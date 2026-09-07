# Natillerapp — guía para Claude Code

Aplicación Vue 3 + Tailwind + Supabase para gestión de natilleras (grupos de ahorro).

## 0. Antes de tocar código: leer las reglas que apliquen

Este repositorio guarda sus reglas en varios sitios porque lo usan varias herramientas. **Al empezar una tarea, revisar cuáles aplican y leerlas**, sin esperar a que el usuario lo pida:

| Fuente | Qué contiene | Cuándo leerla |
|---|---|---|
| `docs/compatibilidad-ios-safari.md` | **La** referencia de iOS/Safari: 17 secciones con patrones, bugs conocidos y cómo probar | Siempre que se toque UI, CSS, overlays o PWA |
| `.claude/skills/natillerapp-modals/SKILL.md` | Patrón obligatorio de modales (`ModalWrapper`) | Al crear o modificar cualquier modal, diálogo u overlay |
| `.cursor/rules/*.mdc` | Las mismas reglas en formato Cursor, más las convenciones de front-end | Referencia; su contenido está resumido aquí abajo |

**No existe ninguna skill `ios-safari-compat`**, ni en `~/.claude/skills/` ni en `~/.cursor/skills/`, aunque versiones anteriores de este archivo y de `.cursor/rules/ios-safari-compat.mdc` la citaban. La fuente real es `docs/compatibilidad-ios-safari.md`. Si una regla apunta a un archivo que no existe, corregir la regla en vez de improvisar.

`.cursor/skills/natillerapp-modals/SKILL.md` es una copia de la de `.claude` (hoy difieren solo en comillas tipográficas). Al cambiar una, cambiar la otra.

## 1. Regla obligatoria: validar iOS/Safari en cada implementación

Todo lo que se cree o modifique —componente, vista, modal, overlay, pantalla de carga, composable con eventos de ventana, CSS— **debe validarse contra iOS/Safari antes de darlo por terminado**, sin romper Android. No es una revisión que se hace al final del proyecto ni cuando el usuario pregunta: es parte de terminar cada cambio.

### Cómo se valida

1. **Recorrer el checklist** de la sección siguiente contra el código que se acaba de escribir.
2. **Consultar `docs/compatibilidad-ios-safari.md`** para el patrón concreto (tiene índice por tema).
3. **Decir en la respuesta qué se validó y qué no se pudo.** En este entorno no hay Safari ni iPhone: lo que se hace es revisión de código contra el manual, y eso detecta lo que está mal escrito, no lo que se ve mal. Presentar una revisión estática como si fuera una prueba en dispositivo es un error; el manual lo reconoce en su §16.

### Checklist

- [ ] Alturas full-screen con `100dvh` (fallback `100vh`) y `-webkit-fill-available`
- [ ] Bordes pegados a pantalla respetan `env(safe-area-inset-*)`
- [ ] Elementos con `fixed bottom-0`: además del `env()`, `useTapadoInferior` (la barra de Safari los tapa)
- [ ] Modales con `<ModalWrapper>`; si no, comentario justificándolo **y** reglas manuales aplicadas
- [ ] `useBodyScrollLock` en modales — y si no se puede usar (p. ej. porque el overlay necesita `scrollIntoView`, que `position: fixed` inutiliza), cortar el gesto con `touch-action: none` + `overscroll-behavior: contain` y explicarlo en un comentario
- [ ] Inputs con `font-size >= 16px` (evita el zoom automático de iOS)
- [ ] Botones con área táctil >= 44×44 px y `touch-action: manipulation`
- [ ] Handlers `@touchstart` con `.passive` si no usan `preventDefault()`
- [ ] `backdrop-filter` con fallback sólido o blur reducido
- [ ] Sin `opacity: 1 !important` ni `display: block !important` en CSS genérico (rompe transiciones Vue y layouts flex)
- [ ] Keyframes con prefijo `-webkit-`; `translate3d(0,0,0)` para forzar GPU
- [ ] CSS específico de iOS acotado con `@supports (-webkit-touch-callout: none)`
- [ ] `<select>` sin `appearance: none` global
- [ ] Overlays con `Teleport` a `body` (un ancestro con `transform` rompe `position: fixed`)
- [ ] Listeners y `requestAnimationFrame` cancelados al desmontar
- [ ] Sigue funcionando igual que antes en Android

### Trampas que ya nos han mordido

Están documentadas en el manual, pero se repiten lo bastante como para listarlas aquí:

- **`window.resize` no basta.** El pinch-zoom y el teclado de iOS mueven el viewport *visual* sin disparar `resize` ni `scroll` en `window`. Cualquier cosa que se posicione respecto a un elemento necesita además `visualViewport.addEventListener('resize'|'scroll', …)` y `orientationchange`.
- **El permiso de notificaciones muere fuera del gesto.** En Safari, `Notification.requestPermission()` debe alcanzarse sin ningún `await` por delante desde el `@click`; si se cuela uno, el permiso se deniega sin preguntar.
- **Los consejos de Chrome no valen en iOS.** Chrome tiene un modo de avisos discretos que deja `requestPermission()` pendiente para siempre; iOS no. Un mensaje de ayuda que mande a buscar «el icono de campana» manda al usuario de iOS a buscar algo que no existe: ramificar por `detectIosPlatform()`.
- **Push en iOS solo con la PWA instalada** (iOS >= 16.4). Sin instalar, el diagnóstico útil no es «no soportado» sino «instálala».
- **Detección de iOS:** usar siempre `detectIosPlatform()` de `src/composables/useIsIos.js`. Nada de regex sueltos: no cubren `platform === 'MacIntel'` ni excluyen Android.
- **La barra de Safari no es safe-area.** Desde iOS 15 el navegador dibuja su barra de direcciones abajo y **encima** del contenido; `env(safe-area-inset-bottom)` describe el home indicator y vale ~0 justo ahí. Lo anclado con `fixed bottom-0` (bottom nav, pies de modal `align="bottom"`) queda tapado. Se mide con `visualViewport` vía `useTapadoInferior` y se **suma al padding**, nunca moviendo `bottom` —eso deja un hueco a la vista—. Detalle en `docs/compatibilidad-ios-safari.md` §4.1.

## 2. Modales y overlays

Al **crear, modificar o editar** cualquier modal, diálogo u overlay equivalente es **obligatorio** leer y seguir `.claude/skills/natillerapp-modals/SKILL.md`.

Patrón base: `ModalWrapper` con cabecera marca **compacta** (~20 % menos que la referencia clásica), **móvil = fila** (icono + títulos + X en la misma línea), **desktop = icono arriba y textos centrados debajo** con X en flex (sin `absolute` en iOS), **un solo scroll** que incluye contenido y **acciones al final** (no pie fijo salvo excepción), safe-area en el bloque de acciones, `useBodyScrollLock`, props `align` / `persistent` / `ios-soft-backdrop` según corresponda.

**No** sustituir `ModalWrapper` por un `div` fijo genérico sin justificación en comentario y sin cubrir iOS.

## 3. Stack del proyecto

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Estilos**: Tailwind 4 (preferir clases Tailwind sobre CSS custom)
- **Estado**: Pinia (stores en `src/stores/`)
- **Backend**: Supabase (`@supabase/supabase-js`)
- **Build**: Vite; PWA con `vite-plugin-pwa` (`injectManifest`, service worker propio en `src/sw.js`)

## 4. Convenciones de código

- Vistas en `src/views/`, componentes en `src/components/`, composables en `src/composables/`, stores en `src/stores/`.
- **Sin punto y coma** al final de línea (el código actual no los usa en ningún `.js`).
- **Nombres en español** para funciones, variables y handlers propios (`activarAvisos`, `alTeclado`, `cerrarModal`). Conviven con `handle*` de código antiguo; el código nuevo va en español, como los comentarios.
- **Early returns** antes que anidar condiciones.
- **Tailwind primero**; CSS custom solo cuando Tailwind no llega (animaciones, prefijos `-webkit-`, `@supports`).
- **Accesibilidad**: elementos interactivos con `aria-label` cuando el texto no basta, foco visible y navegación por teclado.
- **Iconos**: `@heroicons/vue/24/outline` por defecto (solid solo cuando aporte contraste).
- **Color marca**: verde `#1B5E37` (cabeceras de modal); velo salvia `#C8D9C8` para backdrops.
- **Fuente título**: `font-display`; cuerpo: default sans.
- **Comentarios**: explican *por qué*, no *qué*. Un comentario que repite el código sobra; uno que explica la trampa de iOS que motivó una línea rara, no.

> Las reglas de `.cursor/rules/front-end-cursor-rules.mdc` están escritas para un proyecto React/Next/Svelte: mencionan `class:`, `on:click`, tipos de TypeScript y componentes de Shadcn/Radix. **Nada de eso aplica aquí.** Lo que sí aplica de esa regla está recogido arriba.

## 5. Commits (Conventional Commits)

Formato: `<type>[optional scope]: <description>` en imperativo, sin punto final.

- `fix:` parcha un bug
- `feat:` introduce funcionalidad
- Otros: `chore:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`

Usar el cuerpo para explicar **qué** y **por qué**, no el cómo.

Ej: `feat(cuotas): tratar mensual en quincenal como 2 quincenas para sanción`.

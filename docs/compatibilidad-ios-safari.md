# Manual de compatibilidad iOS / Safari — Natillerapp

> Manual de referencia con **lo aprendido en este proyecto** y **lo que aún nos falta cubrir**, alineado con nuestro stack.
> Complementa (no reemplaza) las skills `ios-safari-compat` (checklist técnico) y `natillerapp-modals` (patrón de modales).
> Si vas a **crear o modificar** un componente/vista/modal/CSS, la skill es de lectura obligatoria; este manual explica **el porqué** y da el mapa completo.

**Stack relevante:** Vue 3 (`<script setup>`) · Tailwind 4 · Supabase · Vite · PWA (`vite-plugin-pwa` + Workbox) · Pinia (`pinia-plugin-persistedstate`) · xlsx-js-style · html2canvas · driver.js.

---

## 0. Por qué iOS/Safari nos duele (y Android no)

Tres hechos que explican casi todos los bugs que hemos tenido:

1. **En iOS solo existe WebKit.** Chrome, Firefox y Edge en iPhone son WebKit por dentro. No hay "usar otro navegador" como escape: si rompe en Safari, rompe en todo el iPhone.
2. **Safari móvil descarta pestañas en segundo plano de forma agresiva.** Cuando el usuario sale a WhatsApp y vuelve, la pestaña puede haber sido **matada y recargada**. Sin defensas, esto es pantalla blanca + recarga completa desde red. Ver §12 y §13.
3. **`transform` en un ancestro cambia el *containing block*** de los hijos `position: fixed`/`absolute`. Esto es el origen de la X desalineada en modales, los `fixed` que no aparecen y varios recortes. Ver §6 y §8.

Regla de oro del proyecto: **todo cambio debe funcionar en iPhone/Safari sin romper Android.** Nunca se "arregla iOS" degradando Android — se bifurca (`@supports (-webkit-touch-callout: none)`, `isIos`, ramas en `useBodyScrollLock`).

---

## 1. Detección de iOS

Fuente única de verdad: [src/composables/useIsIos.js](../src/composables/useIsIos.js).

```js
import { useIsIos } from '@/composables/useIsIos'        // ref reactivo para templates
import { detectIosPlatform } from '@/composables/useIsIos' // función pura para JS no-reactivo
```

Detalles que aprendimos:

- **iPadOS en modo escritorio miente:** se reporta como `MacIntel`. Por eso detectamos `platform === 'MacIntel' && navigator.maxTouchPoints > 1`. Sin esto, un iPad "de escritorio" recibe la ruta Android y rompe.
- `useIsIos()` re-evalúa en `onMounted` (no depende del orden de carga del módulo) y también da un valor inicial síncrono por si el template se pinta antes.
- En [src/main.js](../src/main.js) además marcamos el `<body>` con clases utilitarias para CSS: `ios-device`, `slow-device` (≤2 núcleos o ≤2 GB RAM) y `touch-device`. Úsalas para acotar reglas caras (blur, sombras, animaciones) en dispositivos lentos.

> **No dupliques la detección con un regex suelto.** Si necesitas saber si es iOS, importa de `useIsIos.js`.

---

## 2. Viewport y meta tags

En [index.html](../index.html):

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
  maximum-scale=5.0, user-scalable=yes, viewport-fit=cover,
  shrink-to-fit=no, interactive-widget=resizes-visual" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="format-detection" content="telephone=no" />
<meta name="mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

- **`viewport-fit=cover`** es lo que habilita `env(safe-area-inset-*)`. Sin él, las safe-areas valen 0.
- **`interactive-widget=resizes-visual`**: cuando aparece el teclado, redimensiona el *visual viewport* en vez de empujar el layout. Clave para que los modales con inputs no salten.
- **`format-detection: telephone=no`**: evita que Safari convierta números (cuotas, montos, cédulas) en enlaces telefónicos azules.
- `maximum-scale=5.0` + `user-scalable=yes`: **no** bloqueamos el zoom (accesibilidad). No lo pongas en `1.0`/`no`.

---

## 3. Altura real del viewport (el bug de `100vh`)

Safari incluye la barra de direcciones dentro de `100vh`, así que `100vh` es **más alto que la pantalla** y el contenido queda cortado por debajo del *chrome* del navegador. Cascada de fallbacks (el navegador usa la última que entienda):

```css
min-height: 100vh;                 /* fallback universal */
min-height: 100dvh;                /* dynamic viewport height, se ajusta a la barra */
min-height: -webkit-fill-available; /* Safari viejo */
```

En Tailwind usamos `min-h-[100dvh]` / `max-h-[90dvh]` y en móvil `max-h-[90dvh] sm:max-h-[90vh]`. Aplica en: pantallas de carga (`LoadingScreen`, `LoadingBox`), layouts raíz, auth y cards de modal.

---

## 4. Safe-area insets (notch y home indicator)

Cualquier elemento pegado a un borde de pantalla debe respetar el notch (arriba) y el home indicator (abajo):

```css
padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
padding-top:    env(safe-area-inset-top, 0px);
```

Zonas críticas: `MobileBottomNav`, footers de modales, headers sticky, pantallas de carga.

> **Trampa que ya nos mordió:** un `padding: 0 !important` (shorthand) **pisa** los longhand `padding-top/bottom` aunque estos NO tengan `!important` pero el shorthand sí. Si necesitas safe-area junto a un reset de padding, usa **longhands con `!important`** (`padding-bottom: max(...) !important`).

---

## 5. Scroll lock y modales — el corazón del asunto

### 5.1 `useBodyScrollLock` — dos rutas distintas

[src/composables/useBodyScrollLock.js](../src/composables/useBodyScrollLock.js) bifurca por plataforma. **Esto no es capricho, es obligatorio:**

- **iOS:** bloquea con `overflow: hidden` + `touch-action: none` + `height: 100%` en `<body>`/`<html>`. **NO** usa `position: fixed` y **NO toca `<main>`**. Motivo: si `<main>` recibe `overflow:hidden`/`position:fixed`, Safari **recorta o no muestra** los modales `position: fixed` que viven dentro de `<main>`.
- **Android:** usa el método clásico `position: fixed` + `top: -scrollY` en `body` y `main`.
- **Contador global `lockCount`:** solo se desbloquea cuando **ninguna** modal queda abierta. Evita el bug de encadenar modales (p. ej. "Registrar pago" → "Comprobante"): al cerrar la primera no se libera el scroll si la segunda sigue abierta.
- **Preservar posición de scroll:** la vista puede guardar `window.__scrollPositionBeforeModal` **antes** de abrir el modal; el lock la usa para no perder el scroll al abrir/cerrar.

Uso:

```js
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
const modalAbierto = ref(false)
useBodyScrollLock(modalAbierto)   // pásale la ref/computed booleana que controla el modal
```

Hay también `isBodyScrollLocked` (ref global readonly) para que el layout suba z-index / baje la barra inferior cuando hay algún modal abierto.

### 5.2 Modales: usar siempre `ModalWrapper`

Detalle completo en la skill **`natillerapp-modals`**. Lo esencial para iOS:

- **Nunca** montes un `<div class="fixed inset-0">` a mano salvo excepción documentada. `ModalWrapper` ya bifurca iOS (`.modal-wrapper-ios`) vs Android/desktop.
- La **X de cerrar va por flexbox, nunca `position: absolute`.** Como el modal usa `transform` en un ancestro (iOS), un `absolute right-0` se desalinea (se ve a la izquierda). La X es un hermano `flex-shrink-0` al final de la fila.
- Igual con los **iconos dentro de inputs de búsqueda**: nada de `absolute + top-1/2 -translate-y-1/2`. Safari cambia la altura del input al enfocar (`type="search"`) y descentra el icono. Usa contenedor `flex items-center` con el borde/ring en el contenedor.
- Footer de acciones con `pb-[max(1.25rem,env(safe-area-inset-bottom))]`, siempre visible; scroll interno del cuerpo con `overscroll-contain [-webkit-overflow-scrolling:touch]`; **natiscroll** ("Desliza para ver más") obligatorio cuando el cuerpo puede desbordar.

---

## 6. Touch y botones

Bajo `@supports (-webkit-touch-callout: none)` en [src/style.css](../src/style.css):

- `touch-action: manipulation` en botones/enlaces → elimina el delay de 300 ms al tocar.
- `-webkit-tap-highlight-color` con verde de marca translúcido (no el flash gris feo por defecto).
- **Área táctil mínima 44×44 px** (`h-11 w-11` / `min-block-size: 44px`). Estándar Apple; botones más chicos se fallan al tocar.
- `pointer-events: none` en **hijos** de un botón (iconos, spans): así el tap siempre cae en el `<button>` padre y no en un hijo.
- Handlers `@touchstart`/`@touchmove` con `.passive` **si no** llaman `preventDefault()` — Safari se queja y penaliza el scroll si un listener no-pasivo bloquea el hilo.

---

## 7. Renderizado, `fixed` y `transform`

Cuando un elemento `fixed` **no aparece** en Safari (pero sí en Android), fuérzalo a su propia capa de composición:

```css
-webkit-transform: translate3d(0, 0, 0);
transform: translate3d(0, 0, 0);
-webkit-backface-visibility: hidden;
backface-visibility: hidden;
```

- **Recuerda §0.3:** un ancestro con `transform`/`filter`/`will-change` convierte a sus hijos `fixed` en "fixed relativo al ancestro". Si un overlay debe cubrir toda la pantalla, asegúrate de que ningún padre transformado lo esté conteniendo.
- **PROHIBIDO** en reglas iOS genéricas: `opacity: 1 !important` y `display: block !important`. Rompen las transiciones de Vue (`<Transition>`) y los layouts `flex`. (En [useBodyScrollLock.js](../src/composables/useBodyScrollLock.js) sí se fuerzan `opacity/visibility/transform` **puntualmente sobre los modales concretos** tras abrir, no de forma global — esa es la diferencia).

---

## 8. Backdrop-filter (blur)

`backdrop-filter: blur()` es **caro** en iOS y peor en `slow-device`. Patrones del proyecto:

- Reducir el blur a **4 px máximo** en iOS.
- En paneles opacos (sidebar / user-panel de `DashboardLayout`), **reemplazar el blur por fondo sólido**:

```css
@supports (-webkit-touch-callout: none) {
  .user-panel {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    background: hsl(150 26% 17% / 0.97) !important;
  }
}
```

Backdrops de modal: velo salvia `bg-[#C8D9C8]/70` con `backdrop-blur-[2px]` (Android/desktop) y equivalente CSS en `ModalWrapper` para iOS (`rgba(200,217,200,0.7)`).

---

## 9. Inputs, zoom y teclado

- **`font-size ≥ 16px` en todo input/textarea/select.** Con menos, iOS **hace zoom** al enfocar y descoloca el layout. Acotado en `style.css` bajo `@supports`.
- **No** apliques `appearance: none` a `<select>` de forma global: rompe la flecha del picker nativo de iOS. Solo en selects con estilo custom explícito.
- El teclado que aparece se maneja con `interactive-widget=resizes-visual` (§2) para que no empuje el layout completo.

---

## 10. Animaciones

- Respetar `prefers-reduced-motion` (desactivar animaciones complejas).
- `transform-style: preserve-3d` → degradar a `flat` en iOS (los 3D reales van pesados/glitchean).
- `will-change` con moderación: **cada instancia crea una capa de composición** y consume memoria/GPU — en `slow-device` es contraproducente.
- Keyframes con `transform`: incluir prefijo `-webkit-` y usar `translate3d(0,0,0)` en inicio/fin para GPU.

---

## 11. Overscroll y pull-to-refresh

```css
@supports (-webkit-touch-callout: none) {
  body { overscroll-behavior-y: contain; }
}
```

En overlays fijos que deben bloquear el fondo: `@touchmove.stop.prevent` para que el gesto no haga scroll del contenido de atrás.

> **Ojo con la PWA instalada:** el pull-to-refresh puede **recargar toda la app**. Combínalo con `overscroll-behavior` y con las defensas de estado (§13) para que una recarga accidental no cueste una pantalla blanca.

---

## 12. PWA y Service Worker (aprendizaje reciente)

Configurado en [vite.config.js](../vite.config.js) con `VitePWA`. **Por qué existe:** cuando Safari móvil descarta la pestaña en segundo plano y la recarga al volver, sin SW el arranque es *pantalla blanca + descarga de red*. El SW **precachea el shell** (JS/CSS/HTML del build) para que ese arranque sea **instantáneo desde cache**.

Decisiones clave (no las cambies sin entenderlas):

- `registerType: 'autoUpdate'` + `skipWaiting` + `clientsClaim`: el SW nuevo toma control al toque. **Riesgo:** puede refrescar assets a mitad de uso; si algún día causa parpadeos, hay que pasar a un flujo de "hay actualización, recargar" manual.
- `navigateFallback: '/index.html'` — SPA: cualquier navegación offline/sin cache cae al shell.
- `navigateFallbackDenylist: [/^\/api-/, /supabase\.co/]` — **nunca** redirigir a la SPA las llamadas a Supabase ni a los proxys de API. Datos y auth **siempre a la red**.
- **No hay `runtimeCaching` de Supabase a propósito:** los datos financieros deben ir siempre frescos y autenticados. El SW solo precachea assets del mismo origen (el build).
- `devOptions.enabled: false` — SW **apagado en desarrollo** para no pelear con el HMR de Vite.
- `maximumFileSizeToCacheInBytes: 3MB` — los chunks pesados (xlsx) se cargan bajo demanda; no se precachean.

El manifest declara `display: standalone`, `theme_color: #1B5E37`, íconos 192/512 + `maskable`. Con esto la app es instalable ("Añadir a inicio").

---

## 13. Persistencia de estado / descarte de pestaña (aprendizaje reciente)

Complemento del SW, en [src/main.js](../src/main.js):

```js
const pinia = createPinia()
pinia.use(createPersistedState({ storage: sessionStorage }))
```

- Los stores marcados con `persist` se cachean en **`sessionStorage`**. Cuando Safari mata y recarga la pestaña, las vistas **pintan al instante desde el último estado conocido** y revalidan en segundo plano — en vez de mostrar carga.
- **`sessionStorage` (no `localStorage`) a propósito:** se borra al cerrar la pestaña → sin fuga de datos financieros y sin necesidad de limpiarlo en logout.
- Combinado con los **skeletons** (`CuotasPageSkeleton`, `PrestamosSkeleton`) da percepción de arranque inmediato incluso cuando sí hay que ir a red.

> Patrón mental: **SW = el shell arranca ya; persistedstate = los datos aparecen ya; skeleton = si algo tarda, no es pantalla blanca.** Los tres juntos matan el "iPhone recargó y quedó en blanco".

---

## 14. Descargas en iOS: exportar XLSX y comprobantes

Aprendizajes y trampas alrededor de generar archivos/imágenes en el iPhone:

- **Export XLSX** (`xlsx-js-style`): requiere polyfill de `stream` (`vite-plugin-node-polyfills`) y un `manualChunks` cuidadoso en [vite.config.js](../vite.config.js) para que el chunk `xlsx` quede **100% async** (solo se carga al exportar) y no arrastre un ciclo `xlsx↔vendor` que dispara un TDZ (`Cannot access 'be' before initialization`) en el arranque. Ese bug se ve como app que no carga en móvil.
- **Descarga de Blob en iOS Safari:** el atributo `download` de `<a>` es poco fiable en iOS; a menudo el archivo **abre en una pestaña nueva** en vez de descargarse. Verifica siempre el flujo de exportar/compartir **en un iPhone real**, no solo en desktop.
- **`html2canvas`** (comprobantes como imagen): en iOS puede renderizar mal fuentes, sombras o `backdrop-filter`. Mantén el nodo a capturar simple y prueba en dispositivo.
- **Compartir nativo:** para archivos/imágenes, la Web Share API (`navigator.share` con `files`) suele dar mejor UX en iOS que forzar descarga — a evaluar si seguimos teniendo fricción.

---

## 15. Cosas que aún nos faltan cubrir (pendientes)

Gaps identificados, ordenados por impacto. No están todos resueltos hoy — son el backlog de compatibilidad.

| # | Tema | Riesgo iOS | Acción sugerida |
|---|------|-----------|-----------------|
| 1 | **Descarga de archivos** (XLSX/comprobantes) | `download` no fiable; abre en pestaña | Probar en iPhone real; evaluar `navigator.share({ files })` como camino iOS. |
| 2 | **Flujo de actualización del SW** | `skipWaiting` puede refrescar a mitad de uso | Considerar toast "Nueva versión disponible → recargar" en vez de auto. |
| 3 | **Modo standalone (app instalada)** | Enlaces externos abren en Safari y "sacan" al usuario; no hay barra para volver | Revisar navegación externa y estados de "volver"; detectar `display-mode: standalone`. |
| 4 | **`sessionStorage`/`localStorage` en Navegación Privada (iOS viejo)** | Puede lanzar excepción al escribir | Envolver accesos de storage en try/catch (persistedstate y auth). |
| 5 | **Persistencia de sesión Supabase en PWA standalone** | Storage particionado puede cerrar sesión al reabrir | Verificar que el login sobrevive a cerrar/abrir la PWA instalada. |
| 6 | **Subida de fotos HEIC** (iPhone) | Formato HEIC no siempre soportado aguas abajo | Confirmar que los avatares/adjuntos aceptan/convierten HEIC. |
| 7 | **Copiar al portapapeles** | `navigator.clipboard` exige gesto de usuario en iOS | Asegurar que "copiar" se dispara dentro del handler del tap. |
| 8 | **Notificaciones push** | Solo iOS 16.4+ y **únicamente** en PWA instalada | Si se implementan, documentar el requisito de instalación. |
| 9 | **Inputs de fecha/hora nativos** | El picker de iOS difiere mucho del de Android | Revisar formularios con `type="date"`/`time` en iPhone. |
| 10 | **`position: sticky` en scroll anidado** | Comportamiento intermitente en Safari | Auditar headers sticky dentro de contenedores scrolleables. |
| 11 | **Fugas de RAF/observers** | Trabajo huérfano si no se cancela al cerrar modal | Cancelar `requestAnimationFrame` y desconectar observers en `onUnmounted`. |

---

## 16. Cómo probar (no tenemos Safari en Windows)

Trabajamos en Windows y **Safari no existe para Windows**, así que:

- **La verdad final es un iPhone real.** Todo lo que toque descarga de archivos, teclado, safe-area, tab discard o PWA instalada **debe** verificarse en dispositivo.
- Exponer el dev server por túnel (ngrok) — la config ya lo soporta (`allowedHosts: true`, reescritura de Host, HMR por `VITE_DEV_PUBLIC_HOST`). Recuerda: **npm siempre desde WSL**, nunca desde binarios de Windows.
- Debug remoto: iPhone conectado a un **Mac** → Safari → menú Desarrollo → Inspeccionar. Sin Mac, servicios como BrowserStack/LambdaTest dan Safari real.
- El emulador de DevTools de Chrome **no** reproduce los bugs de WebKit (safe-area, `dvh`, tab discard, `download`). Sirve para layout, no para compatibilidad real.

---

## 17. Checklist antes de dar por terminado un cambio

- [ ] ¿Alturas full-screen usan `dvh` + `-webkit-fill-available`?
- [ ] ¿Bordes pegados a pantalla respetan `env(safe-area-inset-*)`?
- [ ] ¿Modales usan `<ModalWrapper>`? Si no, ¿hay comentario justificando y se aplicaron las reglas manuales de iOS?
- [ ] ¿La X y los iconos de input van por **flex**, no por `absolute`?
- [ ] ¿Inputs con `font-size ≥ 16px`? ¿Sin `appearance:none` global en `<select>`?
- [ ] ¿Botones con ≥44×44 px y `touch-action: manipulation`?
- [ ] ¿`@touchstart/@touchmove` con `.passive` cuando no usan `preventDefault`?
- [ ] ¿Backdrop-filter con fallback sólido / blur ≤4px en iOS?
- [ ] ¿Sin `opacity:1 !important` ni `display:block !important` en CSS iOS genérico?
- [ ] ¿Detección de iOS vía `useIsIos.js` (no un regex suelto)?
- [ ] Si toca datos/descargas: ¿probado en **iPhone real**?
- [ ] ¿Funciona igual que antes en **Android**?

---

## Índice de archivos clave

| Capa | Archivo |
|------|---------|
| Detección iOS | [src/composables/useIsIos.js](../src/composables/useIsIos.js) |
| Scroll lock | [src/composables/useBodyScrollLock.js](../src/composables/useBodyScrollLock.js) |
| Overflow de modal | [src/composables/useModalBodyScrollOverflow.js](../src/composables/useModalBodyScrollOverflow.js) |
| Modal wrapper | [src/components/ModalWrapper.vue](../src/components/ModalWrapper.vue) |
| Pantallas de carga | [src/components/LoadingScreen.vue](../src/components/LoadingScreen.vue), [LoadingScreenIos.vue](../src/components/LoadingScreenIos.vue), [LoadingBox.vue](../src/components/LoadingBox.vue) |
| Skeletons | [src/components/CuotasPageSkeleton.vue](../src/components/CuotasPageSkeleton.vue), [PrestamosSkeleton.vue](../src/components/PrestamosSkeleton.vue) |
| Bottom nav | [src/components/MobileBottomNav.vue](../src/components/MobileBottomNav.vue) |
| Layout | [src/layouts/DashboardLayout.vue](../src/layouts/DashboardLayout.vue) |
| CSS global (bloque iOS) | [src/style.css](../src/style.css) → `@supports (-webkit-touch-callout: none)` |
| Meta tags | [index.html](../index.html) |
| PWA / SW / chunks | [vite.config.js](../vite.config.js) |
| Bootstrap (clases iOS, persistedstate) | [src/main.js](../src/main.js) |

**Skills relacionadas:** `ios-safari-compat` (checklist técnico) · `natillerapp-modals` (patrón de modales).
</content>
</invoke>

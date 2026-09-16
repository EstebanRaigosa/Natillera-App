---
name: natillerapp-recorrido-guiado
description: >-
  Recorridos guiados (tours) en Natillerapp: usar RecorridoInteractivo.vue sobre
  la pantalla real, con foco animado, bloqueo total de la app, tarjeta de una
  línea, subfocos que recorren grupos, toque animado, bienvenida y final con
  confeti, y botón «¿Cómo funciona?» para relanzarlo. Aplica al crear,
  modificar o migrar cualquier recorrido, tour, onboarding o guía de pantalla.
---

# Recorrido guiado — Natillerapp

## Referencia viva

| Pieza | Dónde |
|---|---|
| Componente | `src/components/RecorridoInteractivo.vue` |
| Uso de referencia | `src/views/natilleras/NatilleraDetalle.vue` → `construirPasosGuia`, `abrirGuia`, `cerrarGuia`, `tocaGuiaDetalle` |
| Segundo uso (pantalla con modal al entrar) | `src/views/cuotas/Cuotas.vue` → `construirPasosGuiaCuotas`, `abrirGuiaCuotas`, `cerrarGuiaCuotas`, `pantallaCuotasLista` |
| Uso con pestañas y panel plegable | `src/views/cuadre/CuadreCaja.vue` → `construirPasosGuiaCuadre`: `antes`/`despues` para la pestaña «Simulador», `alLlegar`/`despues` para el detalle por concepto |
| Contador de visitas | `src/composables/useContadorGuia.js` → `crearContadorGuia('nombre')` para pantallas nuevas. El detalle usa aún `useTourDetalleNatillera.js`, que hace lo mismo. |
| Botón para relanzarlo | Cabecera de cada pantalla, `data-guia="boton-recorrido"` |

**`RecorridoInteractivo.vue` es la base de todo recorrido nuevo.** El resto es herencia:

| Pieza | Estado |
|---|---|
| `RecorridoGuiado.vue` (Conciliación) | Anterior. No usar en recorridos nuevos; migrar cuando se toque esa pantalla. |
| Composables con driver.js (`use*Tour.js`) | Heredados, casi todos apagados en `src/config/toursEnabled.js`. No crear nuevos. |
| `TourInteractivo.vue` y el carrusel `NatilleraDetalleAyudaModal.vue` | Eliminados. |
| Carrusel `CuotasAyudaModal.vue` | Ya no sale solo: lo sustituye el recorrido de Cuotas. Se abre con `?ayuda=1`. |

**Recorrido o carrusel.** Para enseñar *dónde está cada cosa en una pantalla*, recorrido. El carrusel en modal con mockups (`CuotasAyudaModal.vue`) queda para explicar *un flujo de varios pasos que no está a la vista* (registrar un pago de principio a fin). Se probó el carrusel para el detalle y se descartó: enseña una copia de la pantalla, no la pantalla.

---

## Principios

Esto es lo que hace que un recorrido sea «el nuestro». Si una propuesta rompe uno, se justifica o no se hace.

1. **Sobre la pantalla real.** Nada de mockups: el foco señala el elemento de verdad.
2. **Bloqueo total.** Solo responde la tarjeta. No se toca la página, ni se hace scroll, ni zoom, ni rueda, ni tabulador fuera. Un toque fuera **no avanza** (enseñaría a tocar al azar): la tarjeta da un empujón, «Siguiente» late y aparece donde tocó el dedo el aviso con candado *«Estás en el recorrido · Termínalo o sáltalo para usar esta opción»*.
3. **Poco texto.** Título de 2–5 palabras y **una sola línea** de explicación (≤ ~70 caracteres). Lo que se puede mostrar se anima en vez de describirse.
4. **Una cosa a la vez.** Primero llega el foco, luego cambia lo enfocado (desplegar un panel, abrir un cajón). Si pasan juntas, el ojo no sigue ninguna.
5. **La navegación depende del tamaño.** Por debajo de 1024 px no hay barra lateral: se enseñan la barra inferior, Caja y el menú ☰. Desde 1024 px, la barra lateral. Enseñar lo que no se ve confunde.
6. **Siempre relanzable.** Botón «¿Cómo funciona?» en la cabecera. Abrirlo a mano no gasta las visitas en que sale solo.
7. **No compite con otros overlays.** Los modales automáticos de la pantalla esperan a que termine.

---

## Anatomía visual (la base; no cambiar sin motivo)

| Elemento | Cómo es |
|---|---|
| Velo | Un `path` SVG (rectángulo exterior + hueco redondeado, `evenodd`) reescrito en cada frame, con degradado radial que sigue al hueco como una luz. |
| Foco | Se mueve con un **muelle** (rigidez 190, amortiguación 24: leve rebote). Borde con degradado cónico que gira y halo que late. |
| Subfoco | Segundo recuadro que pasea cada 1,5 s por los elementos de un grupo; la tarjeta los nombra en un chip (`Pendiente · lo que falta cobrar  3/4`). |
| Toque | **Dos ondas huecas** sobre el centro del objetivo. **Nunca un punto sólido**: tapa justo el botón que hay que ver. |
| Tarjeta | Blanca, radio 24 px, progreso segmentado, icono en degradado verde que entra con rebote, título que entra palabra a palabra, una línea de texto y el chip del subfoco. |
| Botones | «Ahora no» / «Saltar»: píldora con borde gris, 44 px. «Atrás»: círculo de 48 px. **«Siguiente»**: verde marca `#1B5E37` relleno, 48 px, con brillo; **siempre el más visible**. |
| Bienvenida | Por defecto: logo flotando, 4 puntos con los colores de los indicadores orbitando, mano 👋. «¡Hola, {nombre}!» y «Te enseño a navegar por tu natillera en menos de un minuto.» Con `heroe: 'fichas'`, un abanico de tres cartas con los emojis de `heroePiezas` flotando desacompasadas, sobre fondo ámbar. Con `heroe: 'monedas'`, las piezas caen una a una dentro de una alcancía que da un saltito, sobre fondo turquesa. Con `heroe: 'sellos'`, tres casillas se marcan con un visto verde una tras otra, sobre fondo lila. Con `heroe: 'balanza'`, el fiel se columpia con sus dos platillos y acaba a nivel, sobre fondo cian. |
| Final | Check verde con rebote y confeti. Botón «¡Listo!». |
| Posición | `< 640 px`: tarjeta anclada abajo o arriba, al lado contrario del foco. `≥ 640 px`: flota junto al objetivo con flecha (debajo → encima → derecha → izquierda). |
| Capa | `z-index: 120`: sobre barra inferior (49), cajón (50) e insignia dev (100); bajo las notificaciones (9999). |

---

## API del componente

```vue
<RecorridoInteractivo :pasos="pasosGuia" :activo="guiaActiva" @terminar="cerrarGuia" />
```

`@terminar` emite `{ completado: boolean }`: `true` solo si se llegó al final con «¡Listo!».

### Campos de cada paso

| Campo | Uso |
|---|---|
| `tipo` | `'bienvenida'` o `'final'`. Sin `selector`; muestran el héroe animado y no cuentan en el progreso. |
| `selector` | Objetivo. Preferir `[data-guia="…"]` o un `id` estable, **nunca clases de Tailwind**. Si hay dos (móvil y escritorio), se usa el visible. |
| `titulo`, `texto` | Ver principio 3. |
| `icono` | Componente de `@heroicons/vue/24/outline`. |
| `gesto: 'tocar'` | Ondas sobre el objetivo, para lo que se puede pulsar. |
| `recorrer` | Subfoco por un grupo. Un selector (la etiqueta sale del texto del elemento) o `[{ selector, etiqueta }]` cuando el texto no basta. |
| `radio`, `margen` | Radio del hueco (16 px por defecto) y holgura alrededor (8 px). Botones redondos: radio alto. |
| `antes()` | Prepara la pantalla **para que el objetivo exista o se vea** (abrir el cajón, una modal). Se espera 360 ms, salvo que devuelva `false` («ya estaba así»). Mientras tanto el foco se queda en el objetivo anterior. |
| `alLlegar()` | Transforma el objetivo **ya enfocado** (desplegar un panel). Luego se reencuadra. |
| `despues()` | Deshace lo anterior al salir del paso: con Siguiente, Atrás, Saltar o Esc. |
| `grupo` | Une los pasos de un flujo. Entre pasos del mismo grupo **no** se llama a `despues`; al salir del grupo o terminar, sí. |
| `heroe`, `heroePiezas` | Solo en la bienvenida. Cambia el logo orbitando por otra animación con los emojis de `heroePiezas` (tres como mucho): `'fichas'` = abanico de cartas (`['🎟️','🎲','🎁']`), `'monedas'` = caen a la alcancía (`['🪙','💵','🪙']`), `'sellos'` = casillas que se marcan como cobradas (`['💵','💵','💵']`). **Dale uno propio a cada pantalla**: quien ya vio otro recorrido lo salta creyendo que es el mismo. Actividades usa `'fichas'`; Préstamos, `'monedas'`; Cuotas, `'sellos'`; Cuadre de caja, `'balanza'`. **Repetir variante entre pantallas anula el efecto**: antes de elegir, mira cuáles están cogidas (`grep -rn "heroe:" src/views/`). Para añadir otro: variante en `heroeBienvenida`, su bloque en el héroe, sus keyframes con prefijo `-webkit-` y su entrada en el bloque de `prefers-reduced-motion`. |

Si el objetivo de un paso no está en pantalla, el paso se salta solo en la dirección en que se iba.

Para desplazar hasta el objetivo, el componente distingue tres casos: si cuelga de la página, `scrollIntoView`; si vive dentro de algo fijo con scroll propio (el cuerpo de una modal), mueve **solo ese contenedor**; si es fijo sin scroll (barra inferior, pie de una modal), no mueve nada.

---

## Cómo añadir un recorrido a una pantalla

1. **Marcar objetivos** con `data-guia="…"` en el template.
2. **Construir los pasos al abrir, no en un `computed`**: dependen del DOM en ese momento (sin morosos no hay alertas) y un `computed` no se entera. Filtrar los que no existen, salvo los que tienen `antes`:
   ```js
   return pasos.filter((paso) => !paso.selector || paso.antes || existe(paso.selector))
   ```
3. **Orden:** bienvenida → contenido de la pantalla → navegación (según tamaño) → soporte → «¿Lo quieres repasar?» (solo en automático) → final. Navegación y soporte los enseña el recorrido del detalle; en las demás pantallas se omiten salvo que tengan algo propio.
4. **Ramificar por tamaño** con `window.innerWidth < 1024`, el mismo umbral `lg` del layout.
5. **Menú o cajón:** `antes`/`despues` con funciones declaradas **fuera** de la lista, para que dos pasos seguidos compartan referencia y el cajón no parpadee:
   ```js
   const abrirMenuMovil = () => dashboardSidebar?.openMobile?.()
   const cerrarMenuMovil = () => dashboardSidebar?.closeMobile?.()
   ```
   API del layout (`inject('dashboardSidebar')`): `openMobile`, `closeMobile`, `prepareSidebarForTour`, `clearSidebarAfterTour`.
6. **Paneles plegables:** `alLlegar` para desplegar, `despues` para dejarlo como estaba, con guarda por si se salió antes de desplegar:
   ```js
   let abiertoAntes = null
   const desplegar = () => { abiertoAntes = panelAbierto.value; panelAbierto.value = true }
   const restaurar = () => {
     if (abiertoAntes === null) return
     panelAbierto.value = abiertoAntes
     abiertoAntes = null
   }
   ```
   El panel debe **animar su altura** (si no, el hueco salta). Patrón sin JS:
   ```html
   <div class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        :class="abierto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
     <div class="min-h-0 overflow-hidden" :inert="!abierto"> …contenido con su padding dentro… </div>
   </div>
   ```
7. **Flujos con modales** (enseñar un proceso abriendo sus modales de verdad; referencia: las dos formas de pago de Cuotas):
   - **Datos de ejemplo** elegidos al abrir, que no disparen desvíos: en Cuotas, una cuota cobrable ya (sin periodos anteriores sin saldar, que abren un aviso en vez del pago) y, si se puede, sin abonos. Si no hay ninguno, pasos alternativos que solo señalan, sin abrir nada.
   - **Marcas por id** para apuntar a ese ejemplo: `:data-guia-selector-socio="item.id"` y el selector `` `[data-guia-selector-socio="${id}"]` ``. Un atributo distinto por modal: la misma marca en la lista de fondo y en la modal enfocaría la de fondo.
   - **Un estado por paso, no una acción:** cada `antes` deja la pantalla como su paso la necesita **venga de donde venga** (avanzando, retrocediendo o saltando) y devuelve `false` si ya lo estaba. Todos los pasos del flujo con el mismo `grupo` y `despues` = cerrar las modales.
     ```js
     async function guiaCuotasDelSocio() {
       const cerroPago = await cerrarPagoGuia()          // atrás desde el pago: vuelve la de debajo
       if (modalCuotasSocio.value && socioCuotasSelId.value === demo.socioId) return cerroPago
       await cerrarModalesGuia()
       abrirModalCuotasSocio(demo.grupo)
       return true
     }
     ```
   - **Cerrar siempre con la pila** (`requestCloseTopModal`), una capa cada vez con una espera corta: cada cierre hace `history.back()` y así «atrás» sigue cuadrado. Nunca poner `modalX.value = false` a pelo.
   - **Sin foco automático** en inputs de esas modales mientras dure el recorrido: en móvil sacaría el teclado bajo la capa de bloqueo.
   - Explicar el formulario una vez (primera forma) y, en la segunda, llevar solo hasta el mismo formulario: «Se abre el mismo pago que acabas de ver».
8. **Visitas:** `const contador = crearContadorGuia('pantalla')` (`useContadorGuia.js`). Sale sola **dos** visitas, contadas por usuario; completarla la da por vista; `contador.pedir()` la fuerza tras un alta guiada. **La apertura manual no cuenta.** Los visores, si no pueden hacer lo que se enseña, no la reciben sola.
9. **Arranque:** cuando la vista termine de cargar **y no quede ninguna modal abierta**, esperar 650 ms (las tarjetas entran con animación y medirlas antes descuadra el foco), volver a comprobar y abrir. Una vez por visita. Si la pantalla abre una modal al entrar (el selector de mes de Cuotas), el recorrido espera a que se cierre:
   ```js
   const pantallaLista = computed(() => !inicializando.value && !cambiandoMes.value && !hasOpenModal.value)
   watch(pantallaLista, (lista) => {
     clearTimeout(temporizador)
     if (!lista || yaIntentada || !tocaGuia()) return
     temporizador = setTimeout(() => {
       if (!pantallaLista.value || yaIntentada) return
       yaIntentada = true
       abrirGuia()
     }, 650)
   })
   ```
   Si hay recorridos heredados (driver.js) pendientes al entrar, mandan ellos y el nuestro no sale. Marcar la visita como intentada también al abrirlo a mano: al cerrarlo se cierran sus modales, la pantalla vuelve a estar «lista» y saldría otra vez sola. **`?guia=1`** en la URL la fuerza para probarla.
10. **Retener los modales automáticos** de la pantalla mientras dure y liberarlos en `cerrarGuia`.
11. **Botón «¿Cómo funciona?»** en la cabecera, con `data-guia="boton-recorrido"`:
    ```html
    <button type="button" data-guia="boton-recorrido"
      class="flex h-11 min-w-[2.75rem] flex-shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-full border border-[#166534]/25 bg-white text-[#166534] shadow-sm hover:bg-[#f0fdf4] active:bg-[#dcfce7] sm:h-auto sm:px-3 sm:py-2 sm:rounded-lg"
      title="¿Cómo funciona esta pantalla?" aria-label="¿Cómo funciona esta pantalla? Ver el recorrido guiado"
      @click="abrirGuia({ manual: true })">
      <QuestionMarkCircleIcon class="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
      <span class="hidden text-xs font-semibold sm:inline">¿Cómo funciona?</span>
    </button>
    ```
12. **Validar iOS/Safari** con la sección de abajo y `docs/compatibilidad-ios-safari.md`, y decir en la respuesta qué se revisó en código y qué falta ver en dispositivo.

### Ejemplo mínimo

```js
function construirPasos({ manual = false } = {}) {
  const enMovil = window.innerWidth < 1024
  const pasos = [
    { tipo: 'bienvenida', titulo: '¡Hola, Ana!', texto: 'Te enseño a navegar por tu natillera en menos de un minuto.' },
    {
      selector: '[data-guia="indicadores"]', icono: Squares2X2Icon,
      titulo: 'Tus números clave', texto: 'Cómo va la natillera, de un vistazo.',
      recorrer: [
        { selector: '[data-guia="card-socios"]', etiqueta: 'Socios · quiénes ahorran' },
        { selector: '[data-guia="card-pendiente"]', etiqueta: 'Pendiente · lo que falta cobrar' },
      ],
    },
    { selector: '[data-guia="card-utilidad"]', icono: SparklesIcon, gesto: 'tocar', titulo: 'Toca «Utilidad»', texto: 'Verás de dónde sale cada peso de ganancia.' },
    ...(enMovil
      ? [{ selector: '#tour-mobile-bottom-nav', recorrer: '#tour-mobile-bottom-nav .nav-item', icono: Squares2X2Icon, titulo: 'Tu barra de navegación', texto: 'Cambia de pantalla con un toque.', radio: 24, margen: 4 }]
      : [{ selector: '[data-guia="menu-lateral"]', recorrer: '[data-guia="menu-lateral"] .nav-link', icono: Bars3Icon, titulo: 'Tu menú', texto: 'Todas las pantallas de la natillera.', antes: mostrarMenuLateral, despues: ocultarMenuLateral }]),
    ...(manual ? [] : [{ selector: '[data-guia="boton-recorrido"]', icono: QuestionMarkCircleIcon, gesto: 'tocar', titulo: '¿Lo quieres repasar?', texto: 'Toca «¿Cómo funciona?» cuando quieras verlo otra vez.', radio: 22, margen: 6 }]),
    { tipo: 'final', titulo: '¡Todo listo!', texto: 'Ya conoces tu natillera. ¡A ahorrar!' },
  ]
  return pasos.filter((p) => !p.selector || p.antes || document.querySelector(p.selector))
}
```

---

## Textos

Tuteo, frases cortas, verbo de acción delante, sin tecnicismos. Emoji solo el 👋 de la bienvenida y ☰ para nombrar el menú.

| Bien | Mal |
|---|---|
| «Toca «Utilidad»» / «Verás de dónde sale cada peso de ganancia.» | «Esta tarjeta es interactiva y al pulsarla se abre un modal con el desglose de las utilidades por categoría.» |
| «Morosos al instante» / «Aparecen solos cuando vence una cuota.» | «Sección de alertas de mora» |
| «Te enseño a navegar por tu natillera» | «Te muestro {nombre de la natillera}» |

---

## Trampas que ya nos mordieron

| Síntoma | Causa | Regla |
|---|---|---|
| Un punto tapaba el botón señalado | Toque con un círculo sólido encima | Solo ondas huecas. |
| Al ir atrás, el panel de configuración seguía abierto | `entrando.antes !== saliendo.antes` con los dos `undefined` daba «iguales» y se saltaba `despues` | Solo cuentan como preparación compartida si `antes` existe. |
| Tras plegar el panel, el scroll se quedaba abajo y no se veía el paso siguiente | Se medía el objetivo a mitad de la animación de pliegue | Si el paso anterior deshizo algo al salir, `esperarQuieto(objetivo)` antes de encuadrar. |
| La apertura de configuración se veía brusca | Se desplegaba en `antes`, antes de llegar el foco | `alLlegar` + panel con altura animada. |
| Pasos apuntando a secciones inexistentes | Pasos en un `computed` evaluado antes de pintar | Construirlos al abrir. |
| El recorrido «saltaba» por detrás | `useBodyScrollLock` pone `position: fixed` en el body y anula `scrollIntoView` | No usarlo: bloquear con `touch-action: none`, `@touchmove.prevent`, `@wheel.prevent` y las teclas de desplazamiento. |
| El usuario avanzaba sin leer | Tocar fuera avanzaba | Tocar fuera avisa, no avanza. |
| Explicaba la barra lateral en el teléfono | Mismos pasos en todos los tamaños | Ramificar por `lg`. |
| Modales («sin socios», recordatorio) tapando lo señalado | Se abrían a los 300 ms, debajo del recorrido | Retenerlos y liberarlos al cerrar. |
| La vista rompía al montar (`Cannot access … before initialization`) | El `watch` de arranque se declaró antes que los `ref` que lee, y el getter se evalúa al crearse | Declarar el bloque del recorrido después de todo lo que usa (en Cuotas, justo antes de `onMounted`). |
| El recorrido quedaba debajo de la modal de entrada o enfocaba esqueletos | Arrancaba con la vista montada, sin mirar modales ni carga | Condición `!hasOpenModal && !cargando` + espera + nueva comprobación. |
| El hueco se cerraba y reabría en cada paso de un flujo con modales | Se vaciaba el objetivo antes de que `antes` abriera la modal | El foco se queda en el anterior hasta encontrar el nuevo. |
| El foco saltaba a la esquina y volvía al cambiar de paso dentro de una modal | El objetivo que sale (`v-show`) sigue conectado pero mide 0×0, y el bucle lo medía igual | Si el objetivo deja de medir, se congela el último destino y el foco se queda donde está. |
| Al avanzar por un flujo se cerraba la modal que se estaba explicando | `despues` (cerrar) corría entre pasos del mismo flujo | `grupo`: entre pasos del mismo grupo no hay `despues`. |
| Un campo de la modal quedaba fuera de vista | Lo fijo no se desplazaba, y `scrollIntoView` habría movido la página bloqueada | Desplazar solo el contenedor con scroll dentro de la modal. |
| Esc cerraba la modal de debajo además del recorrido | `ModalWrapper` escucha Esc en `document` | El recorrido lo captura antes y hace `stopPropagation`. |
| Salía el teclado en móvil al abrir el selector | La modal enfoca su búsqueda al abrirse | No enfocar mientras el recorrido esté activo. |
| Borde del foco a tirones en iPhone | Máscara recalculada en cada frame del giro | En iOS, borde fijo (`@supports (-webkit-touch-callout: none)`). |

---

## iOS / Safari aplicado

Además del checklist general de `CLAUDE.md`:

- [ ] `Teleport` a `body`: un ancestro con `transform` rompe el `fixed`.
- [ ] Sin `ModalWrapper` ni `useBodyScrollLock`, con el porqué en un comentario (necesita un hueco sobre la página y `scrollIntoView`).
- [ ] `touch-action: none` en la capa: además corta el pinch-zoom, así el viewport visual coincide con el de layout y `getBoundingClientRect` vale tal cual.
- [ ] Tarjeta anclada abajo: `env(safe-area-inset-bottom)` **más** `useTapadoInferior` (§4.1).
- [ ] Botones de 44–48 px y `touch-action: manipulation`; `pointer-events: none` en sus hijos.
- [ ] Posiciones escritas por `ref` al DOM en el bucle de `requestAnimationFrame`, no con estado reactivo por frame. Leer todas las medidas antes de escribir.
- [ ] Animaciones de entrada con Web Animations API, para no pisar el `transform` del CSS. Centrar la tarjeta sin `transform` (`inset: 0; margin: auto; height: fit-content`).
- [ ] Keyframes con prefijo `-webkit-` y `translate3d`; todo lo animado desactivado en `prefers-reduced-motion`.
- [ ] `requestAnimationFrame`, intervalos, temporizadores, listeners y `ResizeObserver` cancelados al cerrar y al desmontar.
- [ ] Foco atrapado en la tarjeta y devuelto al elemento previo al cerrar.
- [ ] Sin Safari ni iPhone aquí: es revisión de código. Decirlo, y pedir prueba en dispositivo de la fluidez del foco y de la posición de la tarjeta.

## Qué no hacer

- driver.js, `RecorridoGuiado.vue` o un carrusel en modal para enseñar una pantalla.
- Más de una línea de texto por paso.
- Avanzar al tocar fuera de la tarjeta.
- Dibujar algo opaco encima del objetivo.
- Dar a «Saltar» el mismo peso visual que «Siguiente».
- Señalar elementos que en ese tamaño de pantalla no se ven.
- Cambiar lo enfocado mientras el foco todavía viaja.

<template>
  <Teleport to="body">
    <Transition name="rec-capa">
      <div
        v-if="activo"
        class="rec"
        role="dialog"
        aria-modal="true"
        aria-roledescription="recorrido guiado"
        :aria-label="pasoActual.titulo"
        @wheel.prevent
        @touchmove.prevent
      >
        <!--
          Bloqueo total. Mientras dura el recorrido solo responde la tarjeta: tocar
          lo que se está explicando navegaría a otra pantalla y dejaría el foco
          señalando el vacío. Un toque fuera no avanza —eso enseña a tocar al
          azar—: la tarjeta da un empujón para decir «sigue por aquí».
        -->
        <div class="rec__bloqueo" @click="alTocarBloqueado" />

        <!-- Aviso donde tocó el dedo: se monta de nuevo en cada toque (key) y se desvanece solo. -->
        <template v-if="aviso">
          <span :key="`onda-${aviso.id}`" class="rec__tap" :style="aviso.estiloOnda" aria-hidden="true" />
          <div
            :key="`aviso-${aviso.id}`"
            class="rec__aviso-pos"
            :class="{ 'rec__aviso-pos--arriba': !aviso.abajo }"
            :style="aviso.estilo"
            role="status"
            aria-live="polite"
          >
            <div class="rec__aviso">
              <span class="rec__aviso-icono"><LockClosedIcon class="h-4 w-4" /></span>
              <span class="rec__aviso-txt">
                <b>Estás en el recorrido</b>
                <em>Termínalo o sáltalo para usar esta opción</em>
              </span>
            </div>
          </div>
        </template>

        <!--
          Velo con un hueco. Un único path SVG (rectángulo exterior + rectángulo
          redondeado, regla evenodd) que se reescribe en cada frame: más barato en
          Safari que una sombra de 9999 px o que cuatro paneles. El degradado
          radial sigue al hueco y hace de «luz» sobre lo enfocado.
        -->
        <svg class="rec__velo" aria-hidden="true">
          <defs>
            <radialGradient :id="idLuz" ref="luz" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="800">
              <stop offset="0" stop-color="#03170d" stop-opacity="0.5" />
              <stop offset="0.55" stop-color="#03140b" stop-opacity="0.74" />
              <stop offset="1" stop-color="#010a05" stop-opacity="0.88" />
            </radialGradient>
          </defs>
          <path ref="velo" :fill="`url(#${idLuz})`" fill-rule="evenodd" />
        </svg>

        <div ref="anillo" class="rec__anillo" :class="{ 'is-oculto': !conFoco }" aria-hidden="true">
          <span class="rec__anillo-borde" />
          <span class="rec__anillo-ola" />
        </div>
        <div ref="interno" class="rec__interno" :class="{ 'is-oculto': !hayInterno }" aria-hidden="true" />
        <div v-show="conFoco && pasoActual.gesto === 'tocar'" ref="toque" class="rec__toque" aria-hidden="true">
          <span class="rec__toque-ola" />
          <span class="rec__toque-ola rec__toque-ola--tarde" />
        </div>

        <!-- Tarjeta -->
        <div
          ref="tarjeta"
          class="rec__tarjeta"
          :class="`rec__tarjeta--${disposicion}`"
          :style="estiloTarjeta"
          @touchstart.passive="alTocar"
          @touchend.passive="alSoltar"
        >
          <span v-if="flecha" class="rec__flecha" :class="`rec__flecha--${flecha.lado}`" :style="flecha.estilo" aria-hidden="true" />

          <div v-if="pasosContables.length > 1" class="rec__progreso" aria-hidden="true">
            <span v-for="n in pasosContables.length" :key="n" class="rec__seg">
              <i :class="{ 'is-lleno': n <= numeroActual }" />
            </span>
          </div>

          <Transition :name="direccion > 0 ? 'rec-texto-sig' : 'rec-texto-ant'" mode="out-in">
            <div :key="indice" class="rec__cuerpo">
              <div
                v-if="pasoActual.tipo"
                class="rec__hero"
                :class="{
                  'rec__hero--fichas': heroeEsFichas,
                  'rec__hero--monedas': heroeEsMonedas,
                  'rec__hero--sellos': heroeEsSellos,
                  'rec__hero--balanza': heroeEsBalanza,
                  'rec__hero--lupa': heroeEsLupa
                }"
                aria-hidden="true"
              >
                <!-- Héroe «fichas»: cada pantalla puede tener el suyo, para que quien ya vio
                     otro recorrido note de entrada que este es distinto. -->
                <template v-if="heroeEsFichas">
                  <span v-for="(pieza, n) in heroePiezas" :key="n" class="rec__ficha" :style="{ '--n': n }">
                    <i>{{ pieza }}</i>
                  </span>
                </template>
                <!-- Héroe «monedas»: caen a la alcancía. El de Préstamos, para que no se
                     confunda con el del detalle de la natillera ni con el de Actividades. -->
                <template v-else-if="heroeEsMonedas">
                  <span class="rec__alcancia">🐷</span>
                  <span v-for="(pieza, n) in heroePiezas" :key="n" class="rec__moneda" :style="{ '--n': n }">
                    <i>{{ pieza }}</i>
                  </span>
                </template>
                <!-- Héroe «sellos»: tres casillas que se van marcando como pagadas. El de
                     Cuotas, que es justo lo que se hace ahí: ir marcando quién pagó. -->
                <template v-else-if="heroeEsSellos">
                  <span v-for="(pieza, n) in heroePiezas" :key="n" class="rec__sello" :style="{ '--n': n }">
                    <i>{{ pieza }}</i>
                    <b><CheckIcon class="h-5 w-5" /></b>
                  </span>
                </template>
                <!-- Heroe «balanza»: los dos platillos se columpian y acaban a nivel. El de
                     Cuadre de caja, que es exactamente lo que se hace ahi: cuadrar. -->
                <template v-else-if="heroeEsBalanza">
                  <span class="rec__fiel">
                    <i v-for="(pieza, n) in heroePiezas" :key="n" class="rec__platillo" :style="{ '--n': n }">{{ pieza }}</i>
                  </span>
                  <span class="rec__pivote" />
                </template>
                <!-- Heroe «lupa»: repasa renglon a renglon hasta parar en el que no cuadra.
                     El de Conciliacion, que es exactamente eso: buscar donde se rompe. -->
                <template v-else-if="heroeEsLupa">
                  <span class="rec__renglones">
                    <i v-for="n in 3" :key="n" :style="{ '--n': n - 1 }" />
                  </span>
                  <span class="rec__lupa">{{ heroePiezas[0] }}</span>
                </template>
                <template v-else-if="pasoActual.tipo === 'bienvenida'">
                  <span class="rec__orbita">
                    <i v-for="(color, n) in COLORES_ORBITA" :key="color" :style="{ background: color, '--n': n }" />
                  </span>
                  <img src="/favicon-512x512.png" alt="" class="rec__logo" width="64" height="64" draggable="false" />
                  <span class="rec__mano">👋</span>
                </template>
                <template v-else>
                  <span class="rec__exito"><CheckIcon class="h-9 w-9" /></span>
                  <i v-for="(estilo, n) in confeti" :key="n" class="rec__confeti" :style="estilo" />
                </template>
              </div>

              <div class="rec__cabecera" :class="{ 'rec__cabecera--hero': pasoActual.tipo }">
                <span v-if="!pasoActual.tipo" class="rec__icono">
                  <component :is="pasoActual.icono" class="h-6 w-6" />
                </span>
                <div class="rec__cabecera-texto">
                  <p v-if="!pasoActual.tipo" class="rec__contador">Paso {{ numeroActual }} de {{ pasosContables.length }}</p>
                  <h2 class="rec__titulo">
                    <template v-for="(palabra, n) in palabrasTitulo" :key="n"><span class="rec__palabra" :style="{ animationDelay: `${90 + n * 55}ms` }">{{ palabra }}</span>{{ ' ' }}</template>
                  </h2>
                </div>
              </div>

              <p v-if="pasoActual.texto" class="rec__texto">{{ pasoActual.texto }}</p>

              <Transition name="rec-chip" mode="out-in">
                <p v-if="subEtiqueta" :key="subEtiqueta" class="rec__chip">
                  <i aria-hidden="true" />{{ subEtiqueta }}
                  <em v-if="totalSubs > 1">{{ subIndice + 1 }}/{{ totalSubs }}</em>
                </p>
              </Transition>
            </div>
          </Transition>

          <div class="rec__acciones">
            <button v-if="!esUltimo" type="button" class="rec__saltar" @click="terminar(false)">
              {{ indice === 0 ? 'Ahora no' : 'Saltar' }}
            </button>
            <button
              v-if="indice > 0 && !esUltimo"
              type="button"
              class="rec__atras"
              aria-label="Paso anterior"
              @click="anterior"
            >
              <ArrowLeftIcon class="h-5 w-5" />
            </button>
            <button
              ref="botonPrincipal"
              type="button"
              class="rec__btn"
              :class="{ 'is-latido': latido }"
              @click="siguiente"
              @animationend="latido = false"
            >
              <span>{{ textoPrincipal }}</span>
              <CheckIcon v-if="esUltimo" class="h-5 w-5" />
              <ArrowRightIcon v-else class="h-5 w-5" />
              <span class="rec__btn-brillo" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * Recorrido guiado sobre la pantalla real.
 *
 * Cada paso: `{ selector?, titulo, texto?, icono?, tipo?: 'bienvenida'|'final',
 * gesto?: 'tocar', recorrer?: selector | [{ selector, etiqueta }], radio?, margen?,
 * antes?(), alLlegar?(), despues?(), grupo?, heroe?, heroePiezas? }`.
 *
 * - `heroe: 'fichas'` (solo en la bienvenida) cambia el logo orbitando por un abanico
 *   de tres fichas con los emojis de `heroePiezas`: distingue un recorrido de otro.
 * - `antes` prepara la pantalla para que el objetivo exista (abrir el cajón).
 * - `alLlegar` transforma el objetivo ya enfocado (desplegar un panel): el hueco
 *   crece con el contenido en lugar de saltar a un tamaño nuevo.
 * - `grupo` une los pasos de un flujo (abrir modal → elegir → pagar): entre ellos no
 *   se llama a `despues`. Cada `antes` deja la pantalla como su paso la necesita,
 *   venga de donde venga, y devuelve `false` si ya lo estaba (así no hay espera).
 * - Dentro de una modal se desplaza su cuerpo con scroll, no la página de detrás.
 *
 * - `recorrer` pasea un segundo foco por los elementos de un grupo (las tarjetas,
 *   las pestañas de la barra) y nombra cada uno en la tarjeta.
 * - `gesto: 'tocar'` dibuja un toque animado sobre el elemento.
 * - Si el objetivo de un paso no está en pantalla, se salta solo.
 *
 * No es un ModalWrapper a propósito: necesita un hueco sobre la página y mover la
 * página con `scrollIntoView`. Reglas del manual (docs/compatibilidad-ios-safari.md)
 * aplicadas a mano:
 *   §5  Sin useBodyScrollLock: el `position: fixed` que pone en el body anula el
 *       scrollIntoView. Se cortan el dedo (touch-action + touchmove), la rueda y
 *       las teclas de desplazamiento; el scroll programado sigue funcionando.
 *   §7  Teleport a body.
 *   §4  Tarjeta con safe-area y, anclada abajo, `useTapadoInferior`.
 *   §10 Keyframes con -webkit-, translate3d y prefers-reduced-motion.
 *   §6  Botones de 44–48 px.
 *   §15.11 requestAnimationFrame, intervalos y listeners cancelados al cerrar.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { useTapadoInferior } from '../composables/useTapadoInferior'

const props = defineProps({
  pasos: { type: Array, required: true },
  activo: { type: Boolean, default: false }
})

const emit = defineEmits(['terminar'])

const COLORES_ORBITA = ['#2EBA74', '#F58231', '#E91E63', '#90D15B']
const COLORES_CONFETI = ['#34d399', '#1b5e37', '#F58231', '#E91E63', '#90D15B', '#facc15']
const confeti = Array.from({ length: 26 }, (_, i) => {
  const angulo = (i / 26) * Math.PI * 2
  const distancia = 70 + ((i * 37) % 60)
  return {
    background: COLORES_CONFETI[i % COLORES_CONFETI.length],
    '--dx': `${Math.round(Math.cos(angulo) * distancia * 1.7)}px`,
    '--dy': `${Math.round(Math.sin(angulo) * distancia - 30)}px`,
    '--giro': `${(i * 47) % 360}deg`,
    '--retraso': `${(i % 5) * 45}ms`
  }
})

/** Un objetivo más alto que esto se enfoca por su banda superior: entero no dejaría sitio a la tarjeta. */
const PROPORCION_MAXIMA = 0.45
const TECLAS_SCROLL = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'])

const idLuz = `rec-luz-${Math.random().toString(36).slice(2, 8)}`

const indice = ref(0)
const direccion = ref(1)
const conFoco = ref(false)
const hayInterno = ref(false)
const disposicion = ref('centro')
const posTarjeta = ref({ x: 0, y: 0 })
const flecha = ref(null)
const subIndice = ref(0)
const subEtiqueta = ref('')
const totalSubs = ref(0)
const latido = ref(false)

const velo = ref(null)
const luz = ref(null)
const anillo = ref(null)
const interno = ref(null)
const toque = ref(null)
const tarjeta = ref(null)
const botonPrincipal = ref(null)

// La tarjeta anclada abajo en iOS queda detrás de la barra de Safari: env() no la describe (§4.1).
const { tapado } = useTapadoInferior()

const pasoActual = computed(() => props.pasos[indice.value] ?? {})
/* Héroes alternativos de la bienvenida: `heroe: 'fichas' | 'monedas' | 'sellos' | 'balanza'`. */
const PIEZAS_POR_HEROE = {
  fichas: ['🎟️', '🎲', '🎁'],
  monedas: ['🪙', '💵', '🪙'],
  sellos: ['💵', '💵', '💵'],
  // La balanza tiene dos platillos y no tres: efectivo y banco.
  balanza: ['💵', '🏦'],
  // La lupa es una sola pieza: lo que se mueve es ella.
  lupa: ['🔍']
}
const heroeBienvenida = computed(() =>
  pasoActual.value?.tipo === 'bienvenida' ? pasoActual.value?.heroe : null
)
const heroeEsFichas = computed(() => heroeBienvenida.value === 'fichas')
const heroeEsMonedas = computed(() => heroeBienvenida.value === 'monedas')
const heroeEsSellos = computed(() => heroeBienvenida.value === 'sellos')
const heroeEsBalanza = computed(() => heroeBienvenida.value === 'balanza')
const heroeEsLupa = computed(() => heroeBienvenida.value === 'lupa')
const heroePiezas = computed(() => {
  const piezas = pasoActual.value?.heroePiezas
  if (Array.isArray(piezas) && piezas.length) return piezas.slice(0, 3)
  return PIEZAS_POR_HEROE[heroeBienvenida.value] || PIEZAS_POR_HEROE.fichas
})
const esUltimo = computed(() => indice.value >= props.pasos.length - 1)
const pasosContables = computed(() => props.pasos.filter((p) => !p.tipo))
const numeroActual = computed(() => props.pasos.slice(0, indice.value + 1).filter((p) => !p.tipo).length)
const palabrasTitulo = computed(() => String(pasoActual.value.titulo || '').split(/\s+/).filter(Boolean))
const textoPrincipal = computed(() => {
  if (pasoActual.value.tipo === 'bienvenida') return 'Empezar'
  return esUltimo.value ? '¡Listo!' : 'Siguiente'
})

const estiloTarjeta = computed(() => {
  const base = { '--dir': direccion.value }
  if (disposicion.value === 'abajo') {
    return { ...base, bottom: `calc(12px + env(safe-area-inset-bottom, 0px) + ${tapado.value}px)` }
  }
  if (disposicion.value === 'arriba') return { ...base, top: 'calc(12px + env(safe-area-inset-top, 0px))' }
  if (disposicion.value === 'flotante') return { ...base, left: `${posTarjeta.value.x}px`, top: `${posTarjeta.value.y}px` }
  return base
})

const movimientoReducido = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

// ── Objetivos ─────────────────────────────────────────────────────────────

function visible(el) {
  if (!el) return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

/** El mismo selector puede estar dos veces (versión móvil y escritorio): vale la que se ve. */
function buscar(selector) {
  if (!selector) return null
  return [...document.querySelectorAll(selector)].find(visible) || null
}

function resolverSubs(paso) {
  if (!paso.recorrer) return []
  if (typeof paso.recorrer === 'string') {
    return [...document.querySelectorAll(paso.recorrer)]
      .filter(visible)
      .map((el) => ({ el, etiqueta: el.textContent.replace(/\s+/g, ' ').trim() }))
  }
  return paso.recorrer
    .map((s) => ({ el: buscar(s.selector), etiqueta: s.etiqueta }))
    .filter((s) => s.el)
}

/**
 * Qué hay que desplazar para ver el objetivo:
 * - `'pagina'`: cuelga de la página; vale el scrollIntoView de siempre.
 * - un elemento: vive dentro de algo fijo (una modal) con scroll propio. Se mueve solo
 *   ese contenedor: scrollIntoView movería también la página bloqueada de detrás.
 * - `null`: fijo sin scroll (barra inferior, botón de soporte, pie de una modal).
 */
function contenedorDeScroll(el) {
  let conScroll = null
  for (let nodo = el; nodo && nodo !== document.body; nodo = nodo.parentElement) {
    const estilo = getComputedStyle(nodo)
    if (estilo.position === 'fixed' || estilo.position === 'sticky') return conScroll
    if (!conScroll && nodo !== el && /(auto|scroll)/.test(estilo.overflowY) && nodo.scrollHeight > nodo.clientHeight + 1) {
      conScroll = nodo
    }
  }
  return 'pagina'
}

function esperarQuieto(el, maximo = 900) {
  return new Promise((resolver) => {
    const inicio = performance.now()
    let previo = null
    let quietos = 0
    const mirar = (ahora) => {
      const top = el.getBoundingClientRect().top
      quietos = previo !== null && Math.abs(top - previo) < 0.5 ? quietos + 1 : 0
      previo = top
      if ((quietos >= 5 && ahora - inicio > 140) || ahora - inicio > maximo) return resolver()
      requestAnimationFrame(mirar)
    }
    requestAnimationFrame(mirar)
  })
}

/** Dentro de una modal: en móvil arriba del cuerpo (la tarjeta del recorrido suele ir abajo), si no, al centro. */
async function centrarEnContenedor(el, contenedor) {
  const rc = contenedor.getBoundingClientRect()
  const re = el.getBoundingClientRect()
  const holgura = 12
  const movil = window.innerWidth < 640
  const limiteAbajo = movil ? rc.top + rc.height * 0.6 : rc.bottom - holgura
  if (re.top >= rc.top + holgura && re.bottom <= limiteAbajo) return
  const alto = Math.min(re.height, rc.height - holgura * 2)
  const margen = movil ? holgura : Math.max(holgura, (rc.height - alto) / 2)
  contenedor.scrollTo({
    top: contenedor.scrollTop + (re.top - rc.top) - margen,
    behavior: movimientoReducido() ? 'auto' : 'smooth'
  })
  await esperarQuieto(el)
}

async function encuadrar(el) {
  const contenedor = contenedorDeScroll(el)
  if (contenedor === 'pagina') return traerALaVista(el)
  if (contenedor) return centrarEnContenedor(el, contenedor)
}

/**
 * En móvil el objetivo se sube hacia arriba (debajo de la cabecera fija) para que
 * la tarjeta, anclada abajo, no lo tape. En pantallas anchas basta centrarlo.
 */
async function traerALaVista(el) {
  const movil = window.innerWidth < 640
  const alto = window.innerHeight
  const r = el.getBoundingClientRect()
  const altoFoco = Math.min(r.height, alto * PROPORCION_MAXIMA)
  const margenArriba = movil ? 88 : 96
  const bienColocado = movil
    ? r.top >= margenArriba - 12 && r.top + altoFoco <= alto * 0.56
    : r.top >= 72 && r.top + altoFoco <= alto - 72
  if (bienColocado) return

  const margenPrevio = el.style.scrollMarginTop
  el.style.scrollMarginTop = `${margenArriba}px`
  el.scrollIntoView({
    behavior: movimientoReducido() ? 'auto' : 'smooth',
    block: movil || r.height > alto * PROPORCION_MAXIMA ? 'start' : 'center'
  })
  await esperarQuieto(el)
  el.style.scrollMarginTop = margenPrevio
}

// ── Animación del foco (muelle en requestAnimationFrame) ──────────────────

const CLAVES = ['x', 'y', 'w', 'h']
const RIGIDEZ = 190
const AMORTIGUACION = 24 // algo por debajo del crítico: un leve rebote al llegar

const foco = { x: 0, y: 0, w: 0, h: 0 }
const velFoco = { x: 0, y: 0, w: 0, h: 0 }
const focoSub = { x: 0, y: 0, w: 0, h: 0 }
const velSub = { x: 0, y: 0, w: 0, h: 0 }

let objetivo = null
let destinoCongelado = null
let subs = []
let raf = null
let ultimo = 0
let temporizadorSub = null
let token = 0
let dibujado = ''
let claveFlecha = ''
let subPintado = false
const medida = { w: 352, h: 230 }
let observadorTarjeta = null
let focoPrevio = null

function resorte(actual, velocidad, destino, dt) {
  for (const k of CLAVES) {
    const aceleracion = RIGIDEZ * (destino[k] - actual[k]) - AMORTIGUACION * velocidad[k]
    velocidad[k] += aceleracion * dt
    actual[k] += velocidad[k] * dt
  }
}

function rectDesde(r, margen, alto) {
  return {
    x: r.left - margen,
    y: r.top - margen,
    w: r.width + margen * 2,
    h: Math.min(r.height + margen * 2, alto * PROPORCION_MAXIMA)
  }
}

function rectDe(el, margen, alto) {
  return rectDesde(el.getBoundingClientRect(), margen, alto)
}

function pathHueco(W, H, { x, y, w, h }, radio) {
  let d = `M0 0H${W}V${H}H0Z`
  if (w < 1 || h < 1) return d
  const r = Math.max(0, Math.min(radio, w / 2, h / 2))
  d += `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}`
  d += `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}`
  d += `A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  return d
}

function colocarCaja(el, { x, y, w, h }, radio) {
  if (!el) return
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
  el.style.width = `${Math.max(0, w).toFixed(1)}px`
  el.style.height = `${Math.max(0, h).toFixed(1)}px`
  el.style.setProperty('--radio', `${Math.max(0, Math.min(radio, w / 2, h / 2))}px`)
}

function cuadro(ahora) {
  raf = requestAnimationFrame(cuadro)
  const dt = ultimo ? Math.min((ahora - ultimo) / 1000, 1 / 30) : 1 / 60
  ultimo = ahora

  // 1) Leer todo antes de escribir nada: evita forzar layout dos veces por frame.
  const W = window.innerWidth
  const H = window.innerHeight
  const paso = pasoActual.value
  const radio = paso.radio ?? 16
  /*
   * Un objetivo que se oculta sin desmontarse (el `v-show` de un paso de formulario
   * dentro de una modal) sigue «conectado» pero mide 0×0: medirlo mandaba el foco a la
   * esquina superior izquierda y lo traía de vuelta al aparecer el objetivo siguiente.
   * Mientras no mida, se congela el último destino bueno y el foco se queda donde está.
   */
  const rObjetivo = objetivo?.isConnected ? objetivo.getBoundingClientRect() : null
  const objetivoMedible = !!rObjetivo && rObjetivo.width > 0 && rObjetivo.height > 0
  const destino = objetivoMedible
    ? rectDesde(rObjetivo, paso.margen ?? 8, H)
    : destinoCongelado || { x: W / 2, y: H / 2, w: 0, h: 0 }
  if (objetivoMedible) destinoCongelado = destino
  const elSub = subs[subIndice.value]?.el
  const rSub = elSub?.isConnected ? elSub.getBoundingClientRect() : null
  const destinoSub = rSub && rSub.width > 0 && rSub.height > 0 ? rectDesde(rSub, 3, H) : null

  // 2) Animar
  if (movimientoReducido()) {
    Object.assign(foco, destino)
  } else {
    resorte(foco, velFoco, destino, dt)
  }
  if (destinoSub) {
    if (!subPintado || movimientoReducido()) {
      Object.assign(focoSub, destinoSub)
      subPintado = true
    } else {
      resorte(focoSub, velSub, destinoSub, dt)
    }
  } else {
    subPintado = false
  }

  // 3) Escribir
  const d = pathHueco(W, H, foco, radio)
  if (d !== dibujado) {
    velo.value?.setAttribute('d', d)
    dibujado = d
    luz.value?.setAttribute('cx', (foco.x + foco.w / 2).toFixed(1))
    luz.value?.setAttribute('cy', (foco.y + foco.h / 2).toFixed(1))
    luz.value?.setAttribute('r', String(Math.round(Math.max(W, H) * 0.9)))
  }
  colocarCaja(anillo.value, foco, radio)
  if (destinoSub) colocarCaja(interno.value, focoSub, 12)
  if (toque.value) {
    const centro = destinoSub ? focoSub : foco
    toque.value.style.transform = `translate3d(${(centro.x + centro.w / 2).toFixed(1)}px, ${(centro.y + centro.h / 2).toFixed(1)}px, 0)`
  }

  situarTarjeta(W, H, destino)
}

/**
 * Móvil: la tarjeta se ancla abajo o arriba, lo contrario de donde esté el foco;
 * es lo único que cabe siempre. Pantallas anchas: flota junto al elemento, con
 * una flecha que lo señala (debajo, encima o al lado, en ese orden).
 */
function situarTarjeta(W, H, obj) {
  let disp = 'centro'
  let x = 0
  let y = 0
  let fl = null

  if (conFoco.value && obj.w > 1) {
    if (W < 640) {
      disp = obj.y + obj.h / 2 < H * 0.5 ? 'abajo' : 'arriba'
    } else {
      const sep = 16
      const borde = 16
      const { w, h } = medida
      const cx = obj.x + obj.w / 2
      const cy = obj.y + obj.h / 2
      const ajustarX = (v) => Math.min(Math.max(borde, v), W - w - borde)
      const ajustarY = (v) => Math.min(Math.max(borde, v), H - h - borde)
      const cabeDebajo = obj.h < H * 0.4 && obj.y + obj.h + sep + h <= H - borde
      const cabeEncima = obj.h < H * 0.4 && obj.y - sep - h >= borde

      disp = 'flotante'
      if (cabeDebajo) {
        x = ajustarX(cx - w / 2)
        y = obj.y + obj.h + sep
        fl = { lado: 'arriba', pos: cx - x }
      } else if (cabeEncima) {
        x = ajustarX(cx - w / 2)
        y = obj.y - sep - h
        fl = { lado: 'abajo', pos: cx - x }
      } else if (obj.x + obj.w + sep + w <= W - borde) {
        x = obj.x + obj.w + sep
        y = ajustarY(cy - h / 2)
        fl = { lado: 'izquierda', pos: cy - y }
      } else if (obj.x - sep - w >= borde) {
        x = obj.x - sep - w
        y = ajustarY(cy - h / 2)
        fl = { lado: 'derecha', pos: cy - y }
      } else {
        disp = obj.y + obj.h / 2 < H * 0.5 ? 'abajo' : 'arriba'
      }
    }
  }

  if (disp !== disposicion.value) disposicion.value = disp
  if (disp === 'flotante' && (Math.abs(x - posTarjeta.value.x) > 1.5 || Math.abs(y - posTarjeta.value.y) > 1.5)) {
    posTarjeta.value = { x, y }
  }

  if (fl) {
    const limite = fl.lado === 'arriba' || fl.lado === 'abajo' ? medida.w : medida.h
    fl.pos = Math.min(Math.max(24, fl.pos), limite - 24)
  }
  const clave = fl && disp === 'flotante' ? `${fl.lado}:${Math.round(fl.pos)}` : ''
  if (clave !== claveFlecha) {
    claveFlecha = clave
    flecha.value = clave
      ? {
          lado: fl.lado,
          estilo: fl.lado === 'arriba' || fl.lado === 'abajo' ? { left: `${fl.pos - 7}px` } : { top: `${fl.pos - 7}px` }
        }
      : null
  }
}

// ── Pasos ─────────────────────────────────────────────────────────────────

function detenerSub() {
  if (temporizadorSub != null) clearInterval(temporizadorSub)
  temporizadorSub = null
}

function arrancarSub(paso) {
  detenerSub()
  subs = resolverSubs(paso)
  subIndice.value = 0
  totalSubs.value = subs.length
  subEtiqueta.value = subs[0]?.etiqueta || ''
  hayInterno.value = subs.length > 0
  if (subs.length < 2) return
  temporizadorSub = setInterval(() => {
    subIndice.value = (subIndice.value + 1) % subs.length
    subEtiqueta.value = subs[subIndice.value].etiqueta
  }, 1500)
}

function soltarSub() {
  detenerSub()
  subs = []
  hayInterno.value = false
  subEtiqueta.value = ''
  totalSubs.value = 0
}

function limpiarObjetivo() {
  soltarSub()
  objetivo = null
  destinoCongelado = null
  conFoco.value = false
}

async function prepararPaso(mio, { esperarLayout = false } = {}) {
  const paso = pasoActual.value
  // Se suelta el subfoco, pero el foco sigue donde estaba hasta tener el objetivo nuevo:
  // si se vaciara ya, mientras `antes` abre una modal el hueco se cerraría y volvería a
  // abrirse, un parpadeo en cada paso de un flujo.
  soltarSub()
  if (paso.antes) {
    // false = la pantalla ya estaba como hacía falta. Si no, un respiro para que lo que
    // se acaba de abrir (el cajón, una modal) termine de entrar.
    const cambio = await paso.antes()
    if (cambio !== false) await esperar(360)
  }
  if (mio !== token) return true
  if (!paso.selector) {
    limpiarObjetivo()
    return true
  }

  const el = buscar(paso.selector)
  if (!el) return false
  objetivo = el
  conFoco.value = true
  if (esperarLayout) {
    // El paso anterior cambió la pantalla al salir (plegó un panel de 300 ms). Medir
    // a mitad de la animación da una posición que deja de valer al terminar, y la
    // página se queda desplazada donde ya no está el objetivo.
    await esperarQuieto(el)
    if (mio !== token) return true
  }
  await encuadrar(el)
  if (mio !== token) return true

  if (paso.alLlegar) {
    // Que el foco termine de llegar antes de cambiar lo enfocado: si ambas cosas
    // pasan a la vez, el ojo no sigue ninguna.
    await esperar(movimientoReducido() ? 0 : 280)
    if (mio !== token) return true
    await paso.alLlegar()
    await nextTick()
    // La apertura del panel dura 300 ms; el muelle sigue su altura frame a frame.
    await esperar(movimientoReducido() ? 0 : 340)
    if (mio !== token) return true
    // Desplegado puede salirse por abajo: se vuelve a encuadrar.
    await encuadrar(el)
    if (mio !== token) return true
  }

  arrancarSub(paso)
  return true
}

async function ir(i, dir, saltos = 0) {
  if (i < 0 || i >= props.pasos.length) return
  const mio = ++token
  const saliendo = pasoActual.value
  const entrando = props.pasos[i]

  /*
   * Deshacer lo que preparó el paso que se deja (cerrar el cajón), salvo que el
   * siguiente necesite lo mismo: cerrar y abrir al instante da un parpadeo gratuito.
   */
  // Ojo: dos pasos sin `antes` también «coinciden» (undefined === undefined) y el
  // panel de configuración se quedaba abierto al ir atrás. Solo cuenta si existe.
  const compartenPreparacion =
    (!!saliendo?.antes && entrando?.antes === saliendo.antes) ||
    // Pasos de un mismo flujo: cerrar sus modales entre uno y otro rompería el flujo.
    (!!saliendo?.grupo && entrando?.grupo === saliendo.grupo)
  const deshaceAlSalir = !!saliendo?.despues && !compartenPreparacion
  if (deshaceAlSalir) {
    await saliendo.despues()
    await nextTick()
  }
  if (mio !== token) return

  direccion.value = dir
  indice.value = i
  const listo = await prepararPaso(mio, { esperarLayout: deshaceAlSalir })
  if (mio !== token || listo) return

  // Objetivo ausente (sin morosos, botón de soporte oculto…): saltar en la misma dirección.
  if (saltos > props.pasos.length) return terminar(false)
  const siguienteIndice = i + dir
  if (siguienteIndice >= props.pasos.length) return terminar(true)
  if (siguienteIndice < 0) return ir(i + 1, 1, saltos + 1)
  return ir(siguienteIndice, dir, saltos + 1)
}

function siguiente() {
  if (esUltimo.value) return terminar(true)
  ir(indice.value + 1, 1)
}

function anterior() {
  if (indice.value > 0) ir(indice.value - 1, -1)
}

async function terminar(completado) {
  token++
  detenerSub()
  await pasoActual.value?.despues?.()
  emit('terminar', { completado })
}

// ── Efectos de la tarjeta (Web Animations: no pisan el transform del CSS) ──

function animarEntrada() {
  const el = tarjeta.value
  if (!el?.animate || movimientoReducido()) return
  const desde = {
    abajo: 'translate3d(0, 28px, 0) scale(0.97)',
    arriba: 'translate3d(0, -28px, 0) scale(0.97)',
    centro: 'translate3d(0, 14px, 0) scale(0.9)',
    flotante: 'translate3d(0, 10px, 0) scale(0.96)'
  }[disposicion.value]
  el.animate(
    [{ opacity: 0, transform: desde }, { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }],
    { duration: 480, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }
  )
}

function empujarTarjeta() {
  latido.value = false
  requestAnimationFrame(() => { latido.value = true })
  const el = tarjeta.value
  if (!el?.animate || movimientoReducido()) return
  el.animate(
    [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: 'translate3d(-8px, 0, 0)' },
      { transform: 'translate3d(7px, 0, 0)' },
      { transform: 'translate3d(-4px, 0, 0)' },
      { transform: 'translate3d(0, 0, 0)' }
    ],
    { duration: 380, easing: 'ease-in-out' }
  )
}

watch(disposicion, () => nextTick(animarEntrada))

const aviso = ref(null)
let idAviso = 0
let temporizadorAviso = null
const DURACION_AVISO = 2600 // igual que la animación .rec__aviso

function alTocarBloqueado(e) {
  empujarTarjeta()
  const W = window.innerWidth
  const ancho = Math.min(290, W - 24)
  const x = Math.min(Math.max(12, e.clientX - ancho / 2), W - ancho - 12)
  // Cerca del borde de arriba el aviso no cabe encima del dedo: va debajo.
  const abajo = e.clientY < 120
  aviso.value = {
    id: ++idAviso,
    abajo,
    estilo: { left: `${x}px`, top: `${abajo ? e.clientY + 30 : e.clientY - 30}px`, width: `${ancho}px` },
    estiloOnda: { left: `${e.clientX}px`, top: `${e.clientY}px` }
  }
  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(() => { aviso.value = null }, DURACION_AVISO)
}

// ── Gestos y teclado ──────────────────────────────────────────────────────

let toqueX = 0
let toqueY = 0
function alTocar(e) {
  const t = e.changedTouches[0]
  toqueX = t.clientX
  toqueY = t.clientY
}
function alSoltar(e) {
  const t = e.changedTouches[0]
  const dx = t.clientX - toqueX
  const dy = t.clientY - toqueY
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
  if (dx < 0) siguiente()
  else anterior()
}

function focosDeTarjeta() {
  return [...(tarjeta.value?.querySelectorAll('button:not([disabled])') ?? [])]
}

function alTeclado(e) {
  if (!props.activo) return
  if (e.key === 'Escape') {
    e.preventDefault()
    // ModalWrapper escucha Esc en document (burbuja): sin esto cerraría también la modal
    // que el recorrido tiene abierta debajo, a destiempo del `despues` del paso.
    e.stopPropagation()
    return terminar(false)
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    return siguiente()
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    return anterior()
  }
  if (e.key === 'Tab') {
    // Foco atrapado en la tarjeta: tabular hacia la página sería salirse del bloqueo.
    const focos = focosDeTarjeta()
    if (!focos.length) return
    const actual = focos.indexOf(document.activeElement)
    const destino = e.shiftKey
      ? focos[(actual - 1 + focos.length) % focos.length]
      : focos[(actual + 1) % focos.length]
    e.preventDefault()
    destino.focus({ preventScroll: true })
    return
  }
  const enBoton = e.target instanceof HTMLElement && e.target.tagName === 'BUTTON' && tarjeta.value?.contains(e.target)
  if (TECLAS_SCROLL.has(e.key) && !(enBoton && e.key === ' ')) e.preventDefault()
}

function alEnfocar(e) {
  if (!props.activo || tarjeta.value?.contains(e.target)) return
  botonPrincipal.value?.focus({ preventScroll: true })
}

// ── Ciclo de vida ─────────────────────────────────────────────────────────

function observarTarjeta(el) {
  observadorTarjeta?.disconnect()
  observadorTarjeta = null
  if (!el) return
  observadorTarjeta = new ResizeObserver(() => {
    medida.w = el.offsetWidth
    medida.h = el.offsetHeight
  })
  observadorTarjeta.observe(el)
}
watch(tarjeta, observarTarjeta)

function apagar() {
  token++
  clearTimeout(temporizadorAviso)
  aviso.value = null
  if (raf != null) cancelAnimationFrame(raf)
  raf = null
  limpiarObjetivo()
  document.removeEventListener('keydown', alTeclado, true)
  document.removeEventListener('focusin', alEnfocar)
  if (focoPrevio instanceof HTMLElement && focoPrevio.isConnected) focoPrevio.focus({ preventScroll: true })
  focoPrevio = null
}

watch(
  () => props.activo,
  async (encendido) => {
    if (!encendido) return apagar()
    focoPrevio = document.activeElement
    indice.value = 0
    direccion.value = 1
    disposicion.value = 'centro'
    limpiarObjetivo()
    Object.assign(foco, { x: window.innerWidth / 2, y: window.innerHeight / 2, w: 0, h: 0 })
    Object.assign(velFoco, { x: 0, y: 0, w: 0, h: 0 })
    dibujado = ''
    claveFlecha = ''
    ultimo = 0
    document.addEventListener('keydown', alTeclado, true)
    document.addEventListener('focusin', alEnfocar)
    raf = requestAnimationFrame(cuadro)
    await nextTick()
    animarEntrada()
    botonPrincipal.value?.focus({ preventScroll: true })
    ir(0, 1)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  apagar()
  observadorTarjeta?.disconnect()
})
</script>

<style scoped>
.rec {
  position: fixed;
  inset: 0;
  /* Por encima del layout (barra inferior z-49, cajón z-50, insignia dev z-100) y por
     debajo de las notificaciones (9999), que pueden llegar durante el recorrido. */
  z-index: 120;
  /* Corta arrastre, pinch-zoom y rebote de iOS. Sin pinch-zoom el viewport visual
     coincide con el de layout y las medidas de getBoundingClientRect valen tal cual. */
  touch-action: none;
  overscroll-behavior: contain;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.rec__bloqueo {
  position: absolute;
  inset: 0;
}

.rec__velo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* ── Anillo de foco ───────────────────────────────────── */
.rec__anillo {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: var(--radio, 16px);
  pointer-events: none;
  box-shadow: 0 0 36px 6px rgba(52, 211, 153, 0.28);
  transition: opacity 0.3s ease;
}

.rec__anillo.is-oculto,
.rec__interno.is-oculto {
  opacity: 0;
}

/* Borde con un degradado cónico que gira: el hijo gigante rota y la máscara deja ver solo el borde. */
.rec__anillo-borde {
  position: absolute;
  inset: -3px;
  padding: 3px;
  border-radius: calc(var(--radio, 16px) + 3px);
  overflow: hidden;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}

.rec__anillo-borde::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160vmax;
  height: 160vmax;
  margin: -80vmax 0 0 -80vmax;
  background: conic-gradient(from 0deg, rgba(110, 231, 168, 0.25) 0deg, #6ee7a8 70deg, #ffffff 110deg, #34d399 160deg, rgba(110, 231, 168, 0.25) 230deg, rgba(110, 231, 168, 0.25) 360deg);
  -webkit-animation: rec-girar 3s linear infinite;
  animation: rec-girar 3s linear infinite;
}

@supports not ((-webkit-mask-composite: xor) or (mask-composite: exclude)) {
  .rec__anillo-borde {
    padding: 0;
    border: 3px solid #6ee7a8;
  }
  .rec__anillo-borde::before { display: none; }
}

/*
 * iOS: la máscara se recalcula en cada frame del giro y en iPhones modestos va a
 * tirones. Borde fijo; el latido del halo ya da la vida.
 */
@supports (-webkit-touch-callout: none) {
  .rec__anillo-borde {
    padding: 0;
    border: 3px solid #6ee7a8;
    -webkit-mask: none;
    mask: none;
  }
  .rec__anillo-borde::before { display: none; }
}

.rec__anillo-ola {
  position: absolute;
  inset: -3px;
  border-radius: calc(var(--radio, 16px) + 3px);
  box-shadow: 0 0 0 2px rgba(110, 231, 168, 0.8), 0 0 22px 4px rgba(52, 211, 153, 0.45);
  -webkit-animation: rec-ola 2.2s ease-out infinite;
  animation: rec-ola 2.2s ease-out infinite;
}

/* Segundo foco que pasea por los elementos de un grupo */
.rec__interno {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: var(--radio, 12px);
  pointer-events: none;
  background: rgba(110, 231, 168, 0.12);
  box-shadow: inset 0 0 0 2px rgba(209, 250, 229, 0.95), 0 0 20px rgba(52, 211, 153, 0.55);
  transition: opacity 0.25s ease;
}

/* ── Toque animado ────────────────────────────────────── */
.rec__toque {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Solo ondas huecas: un punto sólido encima taparía justo el botón que hay que ver. */
.rec__toque-ola {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 9999px;
}

.rec__toque-ola {
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  border: 2px solid rgba(209, 250, 229, 0.9);
  opacity: 0;
  -webkit-animation: rec-toque-ola 1.6s ease-out infinite;
  animation: rec-toque-ola 1.6s ease-out infinite;
}

.rec__toque-ola--tarde {
  -webkit-animation-delay: 0.25s;
  animation-delay: 0.25s;
}

/* ── Tarjeta ──────────────────────────────────────────── */
.rec__tarjeta {
  position: absolute;
  z-index: 2;
  box-sizing: border-box;
  padding: 14px 16px 16px;
  border-radius: 24px;
  background: #ffffff;
  color: #111827;
  box-shadow: 0 30px 60px -18px rgba(0, 0, 0, 0.6), 0 8px 20px -10px rgba(0, 0, 0, 0.35);
}

.rec__tarjeta--abajo,
.rec__tarjeta--arriba {
  left: 12px;
  right: 12px;
  max-width: 26rem;
  margin-inline: auto;
}

/* Centrada sin transform: el transform queda libre para las animaciones de entrada. */
.rec__tarjeta--centro {
  inset: 0;
  width: min(calc(100% - 32px), 23rem);
  height: -webkit-fit-content;
  height: fit-content;
  margin: auto;
}

.rec__tarjeta--flotante {
  width: 22rem;
  transition: left 0.5s cubic-bezier(0.34, 1.3, 0.64, 1), top 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.rec__flecha {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: #ffffff;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  transition: left 0.4s ease, top 0.4s ease;
}

.rec__flecha--arriba { top: -6px; }
.rec__flecha--abajo { bottom: -6px; }
.rec__flecha--izquierda { left: -6px; }
.rec__flecha--derecha { right: -6px; }

/* Progreso segmentado */
.rec__progreso {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.rec__seg {
  flex: 1;
  height: 4px;
  border-radius: 9999px;
  background: #e5e7eb;
  overflow: hidden;
}

.rec__seg i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #34d399, #1b5e37);
  -webkit-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transform-origin: left center;
  transform-origin: left center;
  transition: -webkit-transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.rec__seg i.is-lleno {
  -webkit-transform: scaleX(1);
  transform: scaleX(1);
}

/* Héroe (bienvenida y final) */
.rec__hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128px;
  margin-bottom: 10px;
  border-radius: 18px;
  background: radial-gradient(circle at 50% 45%, #dcfce7 0%, #f0fdf4 45%, #ffffff 78%);
}

.rec__logo {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 0 12px 26px -10px rgba(27, 94, 55, 0.55);
  -webkit-animation: rec-flotar 3s ease-in-out infinite;
  animation: rec-flotar 3s ease-in-out infinite;
}

.rec__orbita {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  -webkit-animation: rec-girar 7s linear infinite;
  animation: rec-girar 7s linear infinite;
}

.rec__orbita i {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  -webkit-transform: rotate(calc(var(--n) * 90deg)) translate3d(0, -52px, 0);
  transform: rotate(calc(var(--n) * 90deg)) translate3d(0, -52px, 0);
}

.rec__mano {
  position: absolute;
  top: 22px;
  right: calc(50% - 58px);
  font-size: 26px;
  -webkit-transform-origin: 70% 80%;
  transform-origin: 70% 80%;
  -webkit-animation: rec-saludo 1.8s ease-in-out infinite;
  animation: rec-saludo 1.8s ease-in-out infinite;
}

/* Héroe «fichas»: abanico de tres cartas que flotan desacompasadas */
.rec__hero--fichas {
  background: radial-gradient(circle at 50% 45%, #fef3c7 0%, #fff7ed 45%, #ffffff 78%);
}

.rec__ficha {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -34px 0 0 -27px;
  -webkit-transform: rotate(calc((var(--n) - 1) * 13deg)) translate3d(calc((var(--n) - 1) * 44px), 0, 0);
  transform: rotate(calc((var(--n) - 1) * 13deg)) translate3d(calc((var(--n) - 1) * 44px), 0, 0);
}

.rec__ficha i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 68px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.55);
  font-size: 28px;
  font-style: normal;
  line-height: 1;
  -webkit-animation: rec-ficha 3.4s ease-in-out infinite both;
  animation: rec-ficha 3.4s ease-in-out infinite both;
  -webkit-animation-delay: calc(var(--n) * 260ms);
  animation-delay: calc(var(--n) * 260ms);
}

/* Héroe «monedas»: caen de arriba, entran en la alcancía y vuelven a caer */
.rec__hero--monedas {
  background: radial-gradient(circle at 50% 45%, #ccfbf1 0%, #f0fdfa 45%, #ffffff 78%);
}

/* La posición horizontal va en el contenedor: la animación manda en el `transform`
   del hijo, así no hay que repetir la `x` en cada fotograma. */
.rec__moneda {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -60px 0 0 -16px;
  -webkit-transform: translate3d(calc((var(--n) - 1) * 40px), 0, 0);
  transform: translate3d(calc((var(--n) - 1) * 40px), 0, 0);
}

.rec__moneda i {
  display: block;
  width: 32px;
  font-size: 28px;
  font-style: normal;
  line-height: 1;
  text-align: center;
  -webkit-animation: rec-moneda 2.4s cubic-bezier(0.45, 0.02, 0.4, 1) infinite both;
  animation: rec-moneda 2.4s cubic-bezier(0.45, 0.02, 0.4, 1) infinite both;
  -webkit-animation-delay: calc(var(--n) * 300ms);
  animation-delay: calc(var(--n) * 300ms);
}

.rec__alcancia {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 2px 0 0 -25px;
  width: 50px;
  font-size: 44px;
  line-height: 1;
  text-align: center;
  -webkit-animation: rec-alcancia 2.4s ease-in-out infinite;
  animation: rec-alcancia 2.4s ease-in-out infinite;
}

/* Héroe «sellos»: tres casillas que se marcan una tras otra, como cobrar las cuotas */
.rec__hero--sellos {
  background: radial-gradient(circle at 50% 45%, #ede9fe 0%, #f5f3ff 45%, #ffffff 78%);
}

.rec__sello {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin: -27px 0 0 -27px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 20px -12px rgba(15, 23, 42, 0.5);
  -webkit-transform: translate3d(calc((var(--n) - 1) * 62px), 0, 0);
  transform: translate3d(calc((var(--n) - 1) * 62px), 0, 0);
}

.rec__sello i {
  font-size: 24px;
  font-style: normal;
  line-height: 1;
  -webkit-animation: rec-sello-pieza 3s ease-in-out infinite both;
  animation: rec-sello-pieza 3s ease-in-out infinite both;
  -webkit-animation-delay: calc(var(--n) * 400ms);
  animation-delay: calc(var(--n) * 400ms);
}

/* El visto que cae encima cuando la cuota queda cobrada */
.rec__sello b {
  position: absolute;
  right: -6px;
  bottom: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  color: #ffffff;
  background: #1b5e37;
  box-shadow: 0 4px 10px -3px rgba(27, 94, 55, 0.8);
  -webkit-animation: rec-sello-visto 3s cubic-bezier(0.34, 1.56, 0.64, 1) infinite both;
  animation: rec-sello-visto 3s cubic-bezier(0.34, 1.56, 0.64, 1) infinite both;
  -webkit-animation-delay: calc(var(--n) * 400ms);
  animation-delay: calc(var(--n) * 400ms);
}

/* Héroe «balanza»: el fiel se columpia y se estabiliza a nivel; los platillos cuelgan
   de sus extremos y giran con él (la inclinación leve no estorba a los emojis) */
.rec__hero--balanza {
  background: radial-gradient(circle at 50% 45%, #cffafe 0%, #ecfeff 45%, #ffffff 78%);
}

.rec__fiel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 116px;
  height: 5px;
  margin: -16px 0 0 -58px;
  border-radius: 999px;
  background: #1B5E37;
  -webkit-transform-origin: 50% 50%;
  transform-origin: 50% 50%;
  -webkit-animation: rec-fiel 3.6s ease-in-out infinite both;
  animation: rec-fiel 3.6s ease-in-out infinite both;
}

.rec__platillo {
  position: absolute;
  top: 10px;
  left: calc(var(--n) * 100%);
  width: 38px;
  margin-left: -19px;
  font-size: 26px;
  font-style: normal;
  line-height: 1;
  text-align: center;
}

/* Triángulo de apoyo, en CSS: no hay emoji que sirva y una imagen sería un assets más */
.rec__pivote {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -12px 0 0 -11px;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-bottom: 26px solid rgba(27, 94, 55, 0.22);
}

/* Héroe «lupa»: tres renglones y una lupa que los repasa; el último se tiñe de rojo,
   que es la línea donde deja de cuadrar */
.rec__hero--lupa {
  background: radial-gradient(circle at 50% 45%, #ffe4e6 0%, #fff1f2 45%, #ffffff 78%);
}

.rec__renglones {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 118px;
  margin: -26px 0 0 -59px;
}

.rec__renglones i {
  display: block;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.14);
}

.rec__renglones i + i {
  margin-top: 14px;
}

/* El tercero es el que «no cuadra»: se tiñe cuando la lupa llega a él */
.rec__renglones i:nth-child(3) {
  -webkit-animation: rec-renglon 3.2s ease-in-out infinite both;
  animation: rec-renglon 3.2s ease-in-out infinite both;
}

.rec__lupa {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -44px 0 0 -14px;
  font-size: 28px;
  line-height: 1;
  -webkit-animation: rec-lupa 3.2s ease-in-out infinite both;
  animation: rec-lupa 3.2s ease-in-out infinite both;
}

.rec__exito {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 9999px;
  color: #ffffff;
  background: linear-gradient(135deg, #4ade80 0%, #1b5e37 100%);
  box-shadow: 0 16px 30px -10px rgba(27, 94, 55, 0.7);
  -webkit-animation: rec-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation: rec-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.rec__confeti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 12px;
  margin: -6px 0 0 -4px;
  border-radius: 2px;
  opacity: 0;
  -webkit-animation: rec-confeti 1.5s cubic-bezier(0.15, 0.8, 0.35, 1) var(--retraso) both;
  animation: rec-confeti 1.5s cubic-bezier(0.15, 0.8, 0.35, 1) var(--retraso) both;
}

/* Cabecera y textos */
.rec__cabecera {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rec__cabecera--hero {
  justify-content: center;
  text-align: center;
}

.rec__cabecera-texto {
  min-width: 0;
  flex: 1;
}

.rec__icono {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: #ffffff;
  background: linear-gradient(135deg, #4ade80 0%, #1b5e37 100%);
  box-shadow: 0 10px 20px -8px rgba(27, 94, 55, 0.7);
  -webkit-animation: rec-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation: rec-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.rec__contador {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #16a34a;
}

.rec__titulo {
  font-family: var(--font-display, inherit);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #0f172a;
}

.rec__palabra {
  display: inline-block;
  -webkit-animation: rec-palabra 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation: rec-palabra 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.rec__texto {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #4b5563;
  -webkit-animation: rec-subir 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
  animation: rec-subir 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

.rec__cabecera--hero + .rec__texto { text-align: center; }

.rec__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 9999px;
  background: #ecfdf5;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
}

.rec__chip i {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #22c55e;
  -webkit-animation: rec-latido 1.2s ease-in-out infinite;
  animation: rec-latido 1.2s ease-in-out infinite;
}

.rec__chip em {
  font-style: normal;
  font-weight: 600;
  color: #6b7280;
}

/* Acciones */
.rec__acciones {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

/* Secundario con borde: se ve claro, pero el verde relleno de «Siguiente» sigue mandando. */
.rec__saltar {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 9999px;
  border: 1.5px solid #d1d5db;
  background: #ffffff;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  touch-action: manipulation;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.rec__saltar:hover { background: #f9fafb; border-color: #9ca3af; }
.rec__saltar:active { background: #f3f4f6; }

.rec__atras {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-left: auto;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  color: #374151;
  touch-action: manipulation;
}

.rec__atras:hover { background: #f9fafb; }

.rec__btn {
  position: relative;
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 48px;
  padding: 0 18px;
  overflow: hidden;
  border-radius: 9999px;
  background: #1b5e37;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 10px 22px -10px rgba(27, 94, 55, 0.85);
  touch-action: manipulation;
  transition: background 0.2s ease;
}

.rec__saltar + .rec__btn { margin-left: auto; }

.rec__btn:hover { background: #155a32; }
.rec__btn:active { background: #134d2b; }
.rec__btn > *,
.rec__atras > *,
.rec__saltar > * { pointer-events: none; }

.rec__btn-brillo {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.35) 50%, transparent 70%);
  -webkit-transform: translate3d(-120%, 0, 0);
  transform: translate3d(-120%, 0, 0);
  -webkit-animation: rec-brillo 3s ease-in-out 0.8s infinite;
  animation: rec-brillo 3s ease-in-out 0.8s infinite;
}

.rec__btn.is-latido {
  -webkit-animation: rec-latido-btn 0.5s ease;
  animation: rec-latido-btn 0.5s ease;
}

.rec__tarjeta button:focus-visible {
  outline: 3px solid #6ee7a8;
  outline-offset: 2px;
}

/* ── Aviso de control bloqueado ───────────────────────── */
.rec__tap {
  position: absolute;
  z-index: 3;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  border-radius: 9999px;
  border: 2px solid rgba(254, 243, 199, 0.95);
  pointer-events: none;
  opacity: 0;
  -webkit-animation: rec-tap 0.6s ease-out both;
  animation: rec-tap 0.6s ease-out both;
}

.rec__aviso-pos {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

/* Encima del dedo: se sube su propia altura. El transform va aquí y no en el
   hijo, que lo necesita libre para la animación. */
.rec__aviso-pos--arriba {
  -webkit-transform: translate3d(0, -100%, 0);
  transform: translate3d(0, -100%, 0);
}

.rec__aviso {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 10px 10px;
  border-radius: 18px;
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 18px 36px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
  -webkit-animation: rec-aviso 2.6s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  animation: rec-aviso 2.6s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

.rec__aviso-icono {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #422006;
  background: linear-gradient(135deg, #fde68a 0%, #f59e0b 100%);
  -webkit-animation: rec-candado 0.5s ease-in-out 0.15s both;
  animation: rec-candado 0.5s ease-in-out 0.15s both;
}

.rec__aviso-txt {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.rec__aviso-txt b {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
}

.rec__aviso-txt em {
  font-size: 12px;
  font-style: normal;
  line-height: 1.3;
  color: #cbd5e1;
}

/* ── Transiciones ─────────────────────────────────────── */
.rec-capa-enter-active { transition: opacity 0.35s ease; }
.rec-capa-leave-active { transition: opacity 0.25s ease; }
.rec-capa-enter-from,
.rec-capa-leave-to { opacity: 0; }

.rec-texto-sig-enter-active,
.rec-texto-ant-enter-active {
  transition: opacity 0.28s ease, -webkit-transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.rec-texto-sig-leave-active,
.rec-texto-ant-leave-active {
  transition: opacity 0.15s ease, -webkit-transform 0.15s ease;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.rec-texto-sig-enter-from,
.rec-texto-ant-leave-to { opacity: 0; -webkit-transform: translate3d(22px, 0, 0); transform: translate3d(22px, 0, 0); }
.rec-texto-sig-leave-to,
.rec-texto-ant-enter-from { opacity: 0; -webkit-transform: translate3d(-22px, 0, 0); transform: translate3d(-22px, 0, 0); }

.rec-chip-enter-active,
.rec-chip-leave-active {
  transition: opacity 0.22s ease, -webkit-transform 0.22s ease;
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.rec-chip-enter-from { opacity: 0; -webkit-transform: translate3d(0, 6px, 0); transform: translate3d(0, 6px, 0); }
.rec-chip-leave-to { opacity: 0; -webkit-transform: translate3d(0, -6px, 0); transform: translate3d(0, -6px, 0); }

/* ── Keyframes ────────────────────────────────────────── */
@-webkit-keyframes rec-girar { from { -webkit-transform: rotate(0deg); } to { -webkit-transform: rotate(360deg); } }
@keyframes rec-girar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@-webkit-keyframes rec-ola { 0% { opacity: 0.9; -webkit-transform: scale(1); } 100% { opacity: 0; -webkit-transform: scale(1.08); } }
@keyframes rec-ola { 0% { opacity: 0.9; transform: scale(1); } 100% { opacity: 0; transform: scale(1.08); } }

@-webkit-keyframes rec-toque-ola { 0%, 18% { opacity: 0; -webkit-transform: scale(0.3); } 25% { opacity: 0.95; } 100% { opacity: 0; -webkit-transform: scale(1.6); } }
@keyframes rec-toque-ola { 0%, 18% { opacity: 0; transform: scale(0.3); } 25% { opacity: 0.95; } 100% { opacity: 0; transform: scale(1.6); } }

@-webkit-keyframes rec-pop { 0% { opacity: 0; -webkit-transform: scale(0.4) rotate(-12deg); } 100% { opacity: 1; -webkit-transform: scale(1) rotate(0deg); } }
@keyframes rec-pop { 0% { opacity: 0; transform: scale(0.4) rotate(-12deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }

@-webkit-keyframes rec-palabra { from { opacity: 0; -webkit-transform: translate3d(0, 10px, 0); } to { opacity: 1; -webkit-transform: translate3d(0, 0, 0); } }
@keyframes rec-palabra { from { opacity: 0; transform: translate3d(0, 10px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }

@-webkit-keyframes rec-subir { from { opacity: 0; -webkit-transform: translate3d(0, 8px, 0); } to { opacity: 1; -webkit-transform: translate3d(0, 0, 0); } }
@keyframes rec-subir { from { opacity: 0; transform: translate3d(0, 8px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }

@-webkit-keyframes rec-latido { 0%, 100% { -webkit-transform: scale(1); opacity: 1; } 50% { -webkit-transform: scale(1.5); opacity: 0.6; } }
@keyframes rec-latido { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.6; } }

@-webkit-keyframes rec-brillo { 0%, 60% { -webkit-transform: translate3d(-120%, 0, 0); } 100% { -webkit-transform: translate3d(120%, 0, 0); } }
@keyframes rec-brillo { 0%, 60% { transform: translate3d(-120%, 0, 0); } 100% { transform: translate3d(120%, 0, 0); } }

@-webkit-keyframes rec-latido-btn { 0%, 100% { -webkit-transform: scale(1); } 40% { -webkit-transform: scale(1.06); } }
@keyframes rec-latido-btn { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.06); } }

@-webkit-keyframes rec-flotar { 0%, 100% { -webkit-transform: translate3d(0, 0, 0); } 50% { -webkit-transform: translate3d(0, -6px, 0); } }
@keyframes rec-flotar { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -6px, 0); } }

@-webkit-keyframes rec-saludo { 0%, 60%, 100% { -webkit-transform: rotate(0deg); } 10%, 30% { -webkit-transform: rotate(18deg); } 20%, 40% { -webkit-transform: rotate(-10deg); } }
@keyframes rec-saludo { 0%, 60%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(18deg); } 20%, 40% { transform: rotate(-10deg); } }

@-webkit-keyframes rec-confeti {
  0% { opacity: 1; -webkit-transform: translate3d(0, 0, 0) rotate(0deg); }
  100% { opacity: 0; -webkit-transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--giro)); }
}
@keyframes rec-confeti {
  0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--giro)); }
}

@-webkit-keyframes rec-tap { 0% { opacity: 1; -webkit-transform: scale(0.3); } 100% { opacity: 0; -webkit-transform: scale(1.4); } }
@keyframes rec-tap { 0% { opacity: 1; transform: scale(0.3); } 100% { opacity: 0; transform: scale(1.4); } }

/* Entra con rebote, se queda y se va solo: 2.6 s, lo mismo que DURACION_AVISO. */
@-webkit-keyframes rec-aviso {
  0% { opacity: 0; -webkit-transform: translate3d(0, 10px, 0) scale(0.9); }
  12% { opacity: 1; -webkit-transform: translate3d(0, 0, 0) scale(1); }
  85% { opacity: 1; -webkit-transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; -webkit-transform: translate3d(0, -6px, 0) scale(0.97); }
}
@keyframes rec-aviso {
  0% { opacity: 0; transform: translate3d(0, 10px, 0) scale(0.9); }
  12% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  85% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(0, -6px, 0) scale(0.97); }
}

@-webkit-keyframes rec-candado { 0%, 100% { -webkit-transform: rotate(0deg); } 25% { -webkit-transform: rotate(-14deg); } 75% { -webkit-transform: rotate(12deg); } }
@-webkit-keyframes rec-ficha {
  0%, 100% { -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); }
  50% { -webkit-transform: translate3d(0, -9px, 0); transform: translate3d(0, -9px, 0); }
}
@keyframes rec-ficha {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -9px, 0); }
}
@keyframes rec-candado { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-14deg); } 75% { transform: rotate(12deg); } }

@-webkit-keyframes rec-sello-pieza {
  0%, 12% { -webkit-transform: scale(1); transform: scale(1); }
  20% { -webkit-transform: scale(0.88); transform: scale(0.88); }
  30%, 100% { -webkit-transform: scale(1); transform: scale(1); }
}
@keyframes rec-sello-pieza {
  0%, 12% { transform: scale(1); }
  20% { transform: scale(0.88); }
  30%, 100% { transform: scale(1); }
}
@-webkit-keyframes rec-sello-visto {
  0%, 14% { opacity: 0; -webkit-transform: scale(0.2); transform: scale(0.2); }
  30%, 88% { opacity: 1; -webkit-transform: scale(1); transform: scale(1); }
  100% { opacity: 0; -webkit-transform: scale(0.9); transform: scale(0.9); }
}
@keyframes rec-sello-visto {
  0%, 14% { opacity: 0; transform: scale(0.2); }
  30%, 88% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9); }
}
@-webkit-keyframes rec-lupa {
  0% { -webkit-transform: translate3d(-34px, 0, 0); }
  30% { -webkit-transform: translate3d(22px, 22px, 0); }
  60%, 100% { -webkit-transform: translate3d(-10px, 44px, 0); }
}
@keyframes rec-lupa {
  0% { transform: translate3d(-34px, 0, 0); }
  30% { transform: translate3d(22px, 22px, 0); }
  60%, 100% { transform: translate3d(-10px, 44px, 0); }
}
@-webkit-keyframes rec-renglon {
  0%, 55% { background: rgba(15, 23, 42, 0.14); }
  70%, 100% { background: rgba(190, 18, 60, 0.55); }
}
@keyframes rec-renglon {
  0%, 55% { background: rgba(15, 23, 42, 0.14); }
  70%, 100% { background: rgba(190, 18, 60, 0.55); }
}

@-webkit-keyframes rec-fiel {
  0% { -webkit-transform: rotate(-11deg); }
  30% { -webkit-transform: rotate(9deg); }
  55% { -webkit-transform: rotate(-4deg); }
  72%, 100% { -webkit-transform: rotate(0deg); }
}
@keyframes rec-fiel {
  0% { transform: rotate(-11deg); }
  30% { transform: rotate(9deg); }
  55% { transform: rotate(-4deg); }
  72%, 100% { transform: rotate(0deg); }
}

@-webkit-keyframes rec-moneda {
  0% { opacity: 0; -webkit-transform: translate3d(0, -14px, 0) rotate(-16deg) scale(0.85); }
  16% { opacity: 1; }
  60% { opacity: 1; -webkit-transform: translate3d(0, 46px, 0) rotate(8deg) scale(1); }
  80% { opacity: 1; -webkit-transform: translate3d(0, 54px, 0) rotate(0deg) scale(0.7); }
  100% { opacity: 0; -webkit-transform: translate3d(0, 54px, 0) rotate(0deg) scale(0.5); }
}
@keyframes rec-moneda {
  0% { opacity: 0; transform: translate3d(0, -14px, 0) rotate(-16deg) scale(0.85); }
  16% { opacity: 1; }
  60% { opacity: 1; transform: translate3d(0, 46px, 0) rotate(8deg) scale(1); }
  80% { opacity: 1; transform: translate3d(0, 54px, 0) rotate(0deg) scale(0.7); }
  100% { opacity: 0; transform: translate3d(0, 54px, 0) rotate(0deg) scale(0.5); }
}
@-webkit-keyframes rec-alcancia {
  0%, 100% { -webkit-transform: translate3d(0, 0, 0) scale(1); }
  62% { -webkit-transform: translate3d(0, -3px, 0) scale(1.05); }
}
@keyframes rec-alcancia {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  62% { transform: translate3d(0, -3px, 0) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .rec__anillo-borde::before,
  .rec__anillo-ola,
  .rec__toque-ola,
  .rec__logo,
  .rec__orbita,
  .rec__mano,
  .rec__ficha i,
  .rec__moneda i,
  .rec__alcancia,
  .rec__fiel,
  .rec__lupa,
  .rec__renglones i,
  .rec__sello i,
  .rec__sello b,
  .rec__exito,
  .rec__icono,
  .rec__palabra,
  .rec__texto,
  .rec__chip i,
  .rec__btn-brillo,
  .rec__btn.is-latido,
  .rec__aviso,
  .rec__aviso-icono {
    -webkit-animation: none !important;
    animation: none !important;
  }
  .rec__confeti,
  .rec__tap { display: none; }
  .rec__tarjeta--flotante,
  .rec__flecha,
  .rec__seg i,
  .rec-capa-enter-active,
  .rec-capa-leave-active,
  .rec-texto-sig-enter-active,
  .rec-texto-sig-leave-active,
  .rec-texto-ant-enter-active,
  .rec-texto-ant-leave-active,
  .rec-chip-enter-active,
  .rec-chip-leave-active {
    transition: none !important;
  }
}
</style>

<template>
  <section class="overflow-hidden rounded-2xl border border-borde bg-superficie-tarjeta">
    <!-- Cabecera con el periodo: el selector manda sobre las cuatro gráficas a la vez -->
    <div class="flex flex-wrap items-center gap-2 border-b border-borde-suave px-4 py-3">
      <ChartBarIcon class="h-4 w-4 text-marca-tinta" aria-hidden="true" />
      <h2 class="font-display text-sm font-bold text-texto-fuerte">Frecuencia de ingresos</h2>
      <div class="ml-auto flex rounded-xl bg-superficie-hundida p-0.5" role="radiogroup" aria-label="Periodo">
        <button
          v-for="d in PERIODOS"
          :key="d"
          type="button"
          role="radio"
          :aria-checked="dias === d"
          class="min-h-11 min-w-11 touch-manipulation rounded-lg px-2.5 text-xs font-semibold transition-colors"
          :class="dias === d ? 'bg-superficie-tarjeta text-texto-fuerte shadow-sm' : 'text-texto-suave hover:text-texto'"
          @click="emit('update:dias', d)"
        >
          {{ d }} días
        </button>
      </div>
    </div>

    <CargaCaja v-if="cargando && ingresos.length === 0" texto="Contando ingresos" />

    <p v-else-if="ingresos.length === 0" class="px-4 py-8 text-center text-sm text-texto-suave">
      No hubo ingresos en los últimos {{ dias }} días.
    </p>

    <div v-else class="space-y-6 px-4 py-4">
      <!-- Cifras del periodo -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl bg-superficie-suave px-2 py-2.5">
          <p class="font-display text-lg font-extrabold tabular-nums text-texto-fuerte">{{ ingresos.length }}</p>
          <p class="text-[0.6875rem] text-texto-suave">Ingresos</p>
        </div>
        <div class="rounded-xl bg-superficie-suave px-2 py-2.5">
          <p class="font-display text-lg font-extrabold tabular-nums text-texto-fuerte">{{ porUsuario.length }}</p>
          <p class="text-[0.6875rem] text-texto-suave">Usuarios</p>
        </div>
        <div class="rounded-xl bg-superficie-suave px-2 py-2.5">
          <p class="font-display text-lg font-extrabold tabular-nums text-texto-fuerte">{{ promedioPorUsuario }}</p>
          <p class="text-[0.6875rem] text-texto-suave">Ingresos por usuario</p>
        </div>
      </div>

      <!-- 1. Ingresos por día. El detalle del día elegido va encima, fijo: en el móvil no hay
           «hover», y un tooltip flotante taparía las barras vecinas. -->
      <div>
        <div class="mb-2 flex items-baseline justify-between gap-2">
          <h3 class="text-xs font-bold uppercase tracking-wide text-texto-suave">Por día</h3>
          <p class="text-xs tabular-nums text-texto" aria-live="polite">
            <span class="font-semibold">{{ diaActivo.etiquetaLarga }}</span>
            · {{ diaActivo.ingresos }} {{ diaActivo.ingresos === 1 ? 'ingreso' : 'ingresos' }}
            · {{ diaActivo.usuarios }} {{ diaActivo.usuarios === 1 ? 'usuario' : 'usuarios' }}
          </p>
        </div>
        <div
          ref="graficaDiasRef"
          class="flex h-32 cursor-crosshair touch-manipulation items-end gap-[2px] border-b border-borde outline-none focus-visible:ring-2 focus-visible:ring-marca"
          tabindex="0"
          role="img"
          :aria-label="`Ingresos por día en los últimos ${dias} días. Usa las flechas para recorrerlos.`"
          @pointermove="elegirDiaPorPuntero"
          @pointerdown="elegirDiaPorPuntero"
          @keydown.left.prevent="moverDia(-1)"
          @keydown.right.prevent="moverDia(1)"
        >
          <div
            v-for="(d, i) in porDia"
            :key="d.clave"
            class="flex h-full min-w-0 flex-1 items-end"
          >
            <div
              class="w-full rounded-t-[4px] transition-colors"
              :class="i === indiceDiaActivo ? 'bg-marca' : 'bg-marca/45'"
              :style="{ height: altura(d.ingresos, maxDia) }"
            />
          </div>
        </div>
        <div class="mt-1 flex justify-between text-[0.625rem] tabular-nums text-texto-tenue" aria-hidden="true">
          <span>{{ porDia[0]?.etiquetaCorta }}</span>
          <span>{{ porDia[Math.floor(porDia.length / 2)]?.etiquetaCorta }}</span>
          <span>Hoy</span>
        </div>
      </div>

      <!-- 2. A qué hora entran -->
      <div>
        <div class="mb-2 flex items-baseline justify-between gap-2">
          <h3 class="text-xs font-bold uppercase tracking-wide text-texto-suave">Por hora del día</h3>
          <p class="text-xs text-texto">
            Más ingresos a las <span class="font-semibold tabular-nums">{{ horaPico }}</span>
          </p>
        </div>
        <div class="flex h-20 items-end gap-[2px] border-b border-borde" role="img" :aria-label="`Ingresos por hora. La hora con más ingresos es ${horaPico}.`">
          <div
            v-for="h in porHora"
            :key="h.hora"
            class="flex h-full min-w-0 flex-1 items-end"
            :title="`${h.etiqueta}: ${h.ingresos} ${h.ingresos === 1 ? 'ingreso' : 'ingresos'}`"
          >
            <div class="w-full rounded-t-[3px] bg-marca/70" :style="{ height: altura(h.ingresos, maxHora) }" />
          </div>
        </div>
        <div class="mt-1 flex justify-between text-[0.625rem] tabular-nums text-texto-tenue" aria-hidden="true">
          <span>12 a. m.</span><span>6 a. m.</span><span>12 m.</span><span>6 p. m.</span><span>11 p. m.</span>
        </div>
      </div>

      <!-- 3. Quién entra más. Es también la vista en tabla: cifra exacta en cada fila. -->
      <div>
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-texto-suave">Usuarios que más ingresan</h3>
        <ul class="space-y-2.5">
          <li v-for="u in usuariosVisibles" :key="u.userId">
            <div class="flex items-baseline justify-between gap-3">
              <span class="min-w-0 truncate text-sm font-semibold text-texto-fuerte">{{ u.nombre }}</span>
              <span class="flex-shrink-0 text-sm font-bold tabular-nums text-texto-fuerte">{{ u.ingresos }}</span>
            </div>
            <div class="mt-1 h-2 overflow-hidden rounded-full bg-superficie-hundida">
              <div class="h-full rounded-full bg-marca" :style="{ width: ancho(u.ingresos, maxUsuario) }" />
            </div>
            <p class="mt-1 truncate text-[0.6875rem] text-texto-suave">
              Último ingreso {{ hace(u.ultimo) }} · {{ u.dispositivo }}
              <template v-if="u.diasActivos > 1"> · {{ u.diasActivos }} días distintos</template>
            </p>
          </li>
        </ul>
        <button
          v-if="porUsuario.length > LIMITE_USUARIOS"
          type="button"
          class="mt-3 min-h-11 w-full touch-manipulation rounded-xl text-xs font-semibold text-marca-tinta hover:bg-superficie-suave"
          @click="verTodos = !verTodos"
        >
          {{ verTodos ? 'Ver menos' : `Ver los ${porUsuario.length} usuarios` }}
        </button>
      </div>

      <!-- 4. Desde dónde entran -->
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-texto-suave">Dispositivo</h3>
          <ul class="space-y-2">
            <li v-for="f in porFamilia" :key="f.nombre">
              <div class="flex items-baseline justify-between gap-3 text-sm">
                <span class="text-texto">{{ f.nombre }}</span>
                <span class="tabular-nums text-texto-suave">
                  <span class="font-bold text-texto-fuerte">{{ f.ingresos }}</span> · {{ porcentaje(f.ingresos) }}
                </span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-superficie-hundida">
                <div class="h-full rounded-full bg-marca" :style="{ width: ancho(f.ingresos, ingresos.length) }" />
              </div>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-texto-suave">App instalada o navegador</h3>
          <ul class="space-y-2">
            <li v-for="m in porModo" :key="m.nombre">
              <div class="flex items-baseline justify-between gap-3 text-sm">
                <span class="text-texto">{{ m.nombre }}</span>
                <span class="tabular-nums text-texto-suave">
                  <span class="font-bold text-texto-fuerte">{{ m.ingresos }}</span> · {{ porcentaje(m.ingresos) }}
                </span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-superficie-hundida">
                <div
                  class="h-full rounded-full"
                  :class="m.sinDato ? 'bg-borde-fuerte' : 'bg-marca'"
                  :style="{ width: ancho(m.ingresos, ingresos.length) }"
                />
              </div>
            </li>
          </ul>
          <p v-if="porModo.some(m => m.sinDato)" class="mt-2 text-[0.6875rem] text-texto-tenue">
            «Sin dato»: ingresos anteriores a que la app empezara a registrarlo.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChartBarIcon } from '@heroicons/vue/24/outline'
import CargaCaja from '../carga/CargaCaja.vue'
import { dispositivoDeRegistro, familiaDispositivo } from '../../utils/dispositivo'

/*
 * Tablero de frecuencia de INGRESOS (abrir la app), no de inicios de sesión: cada fila de
 * `accesos_usuario` es una entrada a la app, aunque la sesión ya estuviera abierta.
 *
 * Todas las gráficas son de una sola serie (cuántos), así que van en un solo tono, el
 * de marca, y cada barra lleva su cifra al lado o encima: el color nunca es lo único que
 * informa. Las barras son divs: con cuatro gráficas sencillas, una librería no compensa.
 */
const props = defineProps({
  /** Filas de `accesos_usuario` del periodo, ya filtradas (p. ej. sin la actividad propia). */
  ingresos: { type: Array, default: () => [] },
  dias: { type: Number, default: 30 },
  cargando: { type: Boolean, default: false },
  /** Reloj compartido con el panel, para que «hace X» envejezca solo. */
  ahora: { type: Number, default: () => Date.now() }
})
const emit = defineEmits(['update:dias'])

const PERIODOS = [7, 30, 90]
const LIMITE_USUARIOS = 8
const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const verTodos = ref(false)
const graficaDiasRef = ref(null)

function claveDia(fecha) {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/* --------------------------------- Por día --------------------------------- */

const porDia = computed(() => {
  const conteo = new Map()
  for (const f of props.ingresos) {
    const clave = claveDia(f.inicio)
    if (!conteo.has(clave)) conteo.set(clave, { ingresos: 0, usuarios: new Set() })
    const c = conteo.get(clave)
    c.ingresos++
    c.usuarios.add(f.user_id)
  }
  const dias = []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  for (let i = props.dias - 1; i >= 0; i--) {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() - i)
    const clave = claveDia(d)
    const c = conteo.get(clave)
    dias.push({
      clave,
      ingresos: c?.ingresos || 0,
      usuarios: c?.usuarios.size || 0,
      etiquetaCorta: `${d.getDate()} ${MESES[d.getMonth()]}`,
      etiquetaLarga: i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : `${DIAS_SEMANA[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`
    })
  }
  return dias
})

const maxDia = computed(() => Math.max(1, ...porDia.value.map(d => d.ingresos)))

const indiceDiaActivo = ref(-1)
// Al cambiar el periodo, el detalle vuelve a hoy (la última barra).
watch(() => props.dias, () => { indiceDiaActivo.value = -1 })
const indiceEfectivo = computed(() =>
  indiceDiaActivo.value >= 0 && indiceDiaActivo.value < porDia.value.length
    ? indiceDiaActivo.value
    : porDia.value.length - 1
)
const diaActivo = computed(() => porDia.value[indiceEfectivo.value] || { etiquetaLarga: '', ingresos: 0, usuarios: 0 })

/** La barra bajo el dedo o el puntero, sin exigir atinarle a una barra de 3 px. */
function elegirDiaPorPuntero(e) {
  const el = graficaDiasRef.value
  if (!el) return
  const caja = el.getBoundingClientRect()
  const x = Math.min(Math.max(e.clientX - caja.left, 0), caja.width - 1)
  indiceDiaActivo.value = Math.floor((x / caja.width) * porDia.value.length)
}

function moverDia(paso) {
  const siguiente = indiceEfectivo.value + paso
  indiceDiaActivo.value = Math.min(Math.max(siguiente, 0), porDia.value.length - 1)
}

/* --------------------------------- Por hora -------------------------------- */

function etiquetaHora(h) {
  if (h === 0) return '12 a. m.'
  if (h === 12) return '12 m.'
  return h < 12 ? `${h} a. m.` : `${h - 12} p. m.`
}

const porHora = computed(() => {
  const conteo = new Array(24).fill(0)
  for (const f of props.ingresos) conteo[new Date(f.inicio).getHours()]++
  return conteo.map((ingresos, hora) => ({ hora, ingresos, etiqueta: etiquetaHora(hora) }))
})
const maxHora = computed(() => Math.max(1, ...porHora.value.map(h => h.ingresos)))
const horaPico = computed(() => {
  const pico = porHora.value.reduce((a, b) => (b.ingresos > a.ingresos ? b : a), porHora.value[0])
  return pico ? pico.etiqueta : '—'
})

/* -------------------------------- Por usuario ------------------------------- */

const porUsuario = computed(() => {
  const mapa = new Map()
  for (const f of props.ingresos) {
    if (!mapa.has(f.user_id)) {
      mapa.set(f.user_id, {
        userId: f.user_id,
        nombre: f.nombre || f.email || 'Sin nombre',
        ingresos: 0,
        ultimo: f.inicio,
        dias: new Set(),
        dispositivos: new Map()
      })
    }
    const u = mapa.get(f.user_id)
    u.ingresos++
    if (new Date(f.inicio) > new Date(u.ultimo)) u.ultimo = f.inicio
    u.dias.add(claveDia(f.inicio))
    const etiqueta = dispositivoDeRegistro(f).etiqueta
    u.dispositivos.set(etiqueta, (u.dispositivos.get(etiqueta) || 0) + 1)
  }
  return [...mapa.values()]
    .map(u => ({
      userId: u.userId,
      nombre: u.nombre,
      ingresos: u.ingresos,
      ultimo: u.ultimo,
      diasActivos: u.dias.size,
      // El que más usa: si alterna móvil y computador, sale el habitual.
      dispositivo: [...u.dispositivos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    }))
    .sort((a, b) => b.ingresos - a.ingresos)
})

const usuariosVisibles = computed(() => (verTodos.value ? porUsuario.value : porUsuario.value.slice(0, LIMITE_USUARIOS)))
const maxUsuario = computed(() => Math.max(1, ...porUsuario.value.map(u => u.ingresos)))
const promedioPorUsuario = computed(() => {
  if (!porUsuario.value.length) return '0'
  return (props.ingresos.length / porUsuario.value.length).toLocaleString('es-CO', { maximumFractionDigits: 1 })
})

/* ------------------------------- Por dispositivo ----------------------------- */

const porFamilia = computed(() => {
  const conteo = new Map()
  for (const f of props.ingresos) {
    const familia = familiaDispositivo(dispositivoDeRegistro(f))
    conteo.set(familia, (conteo.get(familia) || 0) + 1)
  }
  return [...conteo.entries()].map(([nombre, ingresos]) => ({ nombre, ingresos })).sort((a, b) => b.ingresos - a.ingresos)
})

const porModo = computed(() => {
  let app = 0
  let navegador = 0
  let sinDato = 0
  for (const f of props.ingresos) {
    if (f.modo_app === 'app') app++
    else if (f.modo_app === 'navegador') navegador++
    else sinDato++
  }
  return [
    { nombre: 'App instalada', ingresos: app },
    { nombre: 'Navegador', ingresos: navegador },
    { nombre: 'Sin dato', ingresos: sinDato, sinDato: true }
  ].filter(m => m.ingresos > 0)
})

/* ---------------------------------- Formato ---------------------------------- */

/** Altura mínima visible para que un día con 1 ingreso no se confunda con uno vacío. */
function altura(valor, max) {
  if (!valor) return '0'
  return `max(3px, ${(valor / max) * 100}%)`
}

function ancho(valor, max) {
  if (!valor) return '0'
  return `max(4px, ${(valor / max) * 100}%)`
}

function porcentaje(valor) {
  if (!props.ingresos.length) return '0 %'
  return `${Math.round((valor / props.ingresos.length) * 100)} %`
}

function hace(fecha) {
  const min = Math.floor((props.ahora - new Date(fecha).getTime()) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'ayer' : `hace ${d} días`
}
</script>

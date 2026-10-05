<template>
  <div class="mx-auto max-w-7xl space-y-5 pb-6 sm:space-y-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton to="/dashboard" :inline="true" />
          <div class="ds-page-header__icon">
            <EnvelopeIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">Correos</h1>
            <p class="ds-page-header__sub hidden sm:block">Escribe a los usuarios que elijas y mira lo que responden</p>
          </div>
        </div>
      </div>
    </header>

    <CargaPantalla :visible="cargando" text="Cargando usuarios" />

    <template v-if="!cargando">
      <div v-if="errorCarga" class="rounded-2xl border border-red-200 oscuro:border-red-500/30 bg-red-50 oscuro:bg-red-500/15 px-4 py-3 text-sm font-medium text-red-800 oscuro:text-red-300">
        {{ errorCarga }}
        <button type="button" class="ml-2 font-semibold underline" @click="cargarTodo">Reintentar</button>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <!-- ============ Destinatarios ============ -->
        <section class="flex min-h-0 flex-col rounded-2xl border border-borde bg-superficie-tarjeta shadow-sm">
          <div class="border-b border-borde-suave p-4">
            <div class="flex items-baseline justify-between gap-2">
              <h2 class="font-display text-base font-bold text-texto-fuerte">Destinatarios</h2>
              <p class="text-sm text-texto-suave">
                <strong class="text-marca-tinta">{{ seleccionados.size }}</strong> de {{ usuarios.length }}
              </p>
            </div>
            <!-- 16 px: con menos, iOS hace zoom al enfocar -->
            <input
              v-model="busqueda"
              type="search"
              class="mt-3 w-full rounded-xl border border-borde-fuerte px-3 py-2.5 text-base focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar usuarios"
            />
            <div class="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar usuarios">
              <button
                v-for="f in FILTROS"
                :key="f.valor"
                type="button"
                class="min-h-[44px] touch-manipulation rounded-full border px-3 text-xs font-semibold transition-colors"
                :class="filtro === f.valor ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-[#1B5E37] text-white' : 'border-borde-fuerte bg-superficie-tarjeta text-texto-secundario hover:border-[#1B5E37]/50 oscuro:hover:border-marca-tinta/50'"
                :aria-pressed="filtro === f.valor"
                @click="filtro = f.valor"
              >
                {{ f.etiqueta }}
              </button>
            </div>
            <div class="mt-3 flex items-center justify-between gap-2 text-sm">
              <button type="button" class="min-h-[44px] touch-manipulation font-semibold text-marca-tinta hover:underline" @click="seleccionarVisibles">
                Seleccionar los {{ usuariosFiltrados.length }} visibles
              </button>
              <button v-if="seleccionados.size" type="button" class="min-h-[44px] touch-manipulation font-semibold text-texto-suave hover:underline" @click="seleccionados = new Set()">
                Quitar todos
              </button>
            </div>
          </div>

          <ul class="max-h-[28rem] divide-y divide-borde-suave overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <li v-for="u in usuariosFiltrados" :key="u.id">
              <label class="flex min-h-[56px] cursor-pointer items-center gap-3 px-4 py-2 hover:bg-superficie-suave">
                <input
                  type="checkbox"
                  class="h-5 w-5 flex-shrink-0 rounded border-borde-fuerte accent-[#1B5E37]"
                  :checked="seleccionados.has(u.id)"
                  @change="alternar(u.id)"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold text-texto">{{ u.nombre || 'Sin nombre' }}</span>
                  <span class="block truncate text-xs text-texto-suave">{{ u.email }}</span>
                </span>
                <span class="flex-shrink-0 text-right text-[11px] text-texto-tenue">
                  {{ u.ultimo_acceso ? `Entró ${haceCuanto(u.ultimo_acceso)}` : 'Nunca entró' }}
                  <span v-if="notaDe(u.id)" class="mt-0.5 block font-semibold text-marca-tinta">Opinó: {{ notaDe(u.id) }}/5</span>
                </span>
              </label>
            </li>
            <li v-if="usuariosFiltrados.length === 0" class="px-4 py-8 text-center text-sm text-texto-suave">
              Ningún usuario coincide con la búsqueda.
            </li>
          </ul>
        </section>

        <!-- ============ Correo ============ -->
        <section class="rounded-2xl border border-borde bg-superficie-tarjeta p-4 shadow-sm">
          <h2 class="font-display text-base font-bold text-texto-fuerte">Correo</h2>

          <label for="correo-plantilla" class="mt-3 block text-sm font-semibold text-texto-medio">Plantilla</label>
          <select
            id="correo-plantilla"
            v-model="clavePlantilla"
            class="mt-1 w-full rounded-xl border border-borde-fuerte bg-superficie-tarjeta px-3 py-2.5 text-base focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:outline-none"
            @change="aplicarPlantilla"
          >
            <option v-for="p in PLANTILLAS" :key="p.clave" :value="p.clave">{{ p.nombre }}</option>
          </select>

          <label for="correo-asunto" class="mt-3 block text-sm font-semibold text-texto-medio">Asunto</label>
          <input
            id="correo-asunto"
            v-model="asunto"
            type="text"
            maxlength="200"
            class="mt-1 w-full rounded-xl border border-borde-fuerte px-3 py-2.5 text-base focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
          />

          <div class="mt-4 flex items-center justify-between gap-2">
            <p class="text-sm font-semibold text-texto-medio">Vista previa <span class="font-normal text-texto-tenue">(con «Ana» de ejemplo)</span></p>
            <button type="button" class="min-h-[44px] touch-manipulation text-sm font-semibold text-marca-tinta hover:underline" @click="editandoHtml = !editandoHtml">
              {{ editandoHtml ? 'Ver vista previa' : 'Editar HTML' }}
            </button>
          </div>
          <textarea
            v-if="editandoHtml"
            v-model="html"
            rows="18"
            spellcheck="false"
            class="mt-1 w-full rounded-xl border border-borde-fuerte px-3 py-2.5 font-mono text-base leading-snug focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:outline-none sm:text-xs"
            aria-label="HTML del correo"
          />
          <!-- sandbox sin permisos: el HTML se muestra, pero no ejecuta scripts ni navega -->
          <iframe
            v-else
            :srcdoc="vistaPrevia"
            sandbox=""
            title="Vista previa del correo"
            class="mt-1 h-[32rem] w-full rounded-xl border border-borde bg-[#eef4ee] oscuro:bg-superficie-hundida"
          />
          <p class="mt-1 text-xs text-texto-suave">
            Variables: <code v-pre>{{saludo}}</code>, <code v-pre>{{nombre}}</code>, <code v-pre>{{app_url}}</code>, <code v-pre>{{correo_id}}</code>.
          </p>

          <p v-if="mensaje" class="mt-3 rounded-xl px-3 py-2 text-sm font-medium" :class="mensaje.ok ? 'bg-marca-suave text-marca-tinta' : 'bg-red-50 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300'">
            {{ mensaje.texto }}
          </p>

          <div class="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" class="btn-modal-secondary sm:flex-1" :disabled="enviando || !puedeEnviar" @click="enviarPrueba">
              <CargaBoton v-if="enviando === 'prueba'" pequena />
              {{ enviando === 'prueba' ? 'Enviando…' : 'Enviarme una prueba' }}
            </button>
            <!-- Doble toque en vez de un modal: el envío llega a gente real y no se puede deshacer -->
            <button
              type="button"
              class="btn-modal-primary sm:flex-1"
              :disabled="enviando || !puedeEnviar || seleccionados.size === 0"
              @click="confirmando ? enviar() : (confirmando = true)"
            >
              <CargaBoton v-if="enviando === 'real'" pequena />
              <template v-if="enviando === 'real'">Enviando…</template>
              <template v-else-if="confirmando">Confirmar envío a {{ seleccionados.size }}</template>
              <template v-else>Enviar a {{ seleccionados.size }} {{ seleccionados.size === 1 ? 'usuario' : 'usuarios' }}</template>
            </button>
          </div>
          <button v-if="confirmando && !enviando" type="button" class="mt-2 min-h-[44px] w-full touch-manipulation text-sm font-semibold text-texto-suave hover:underline" @click="confirmando = false">
            Cancelar
          </button>
          <p class="mt-2 text-xs text-texto-suave">Máximo 500 por envío. Sale desde la misma cuenta de correo del soporte.</p>
        </section>
      </div>

      <!-- ============ Respuestas ============ -->
      <section class="rounded-2xl border border-borde bg-superficie-tarjeta p-4 shadow-sm">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="font-display text-base font-bold text-texto-fuerte">Respuestas</h2>
          <select
            v-model="envioFiltro"
            class="rounded-xl border border-borde-fuerte bg-superficie-tarjeta px-3 py-2 text-base focus:border-[#1B5E37] oscuro:focus:border-marca-tinta focus:outline-none sm:text-sm"
            aria-label="Filtrar respuestas por envío"
          >
            <option value="">Todos los envíos</option>
            <option v-for="e in envios" :key="e.id" :value="e.id">
              {{ fechaCorta(e.created_at) }} · {{ e.asunto }} ({{ e.enviados }}/{{ e.destinatarios }})
            </option>
          </select>
        </div>

        <p v-if="opinionesFiltradas.length === 0" class="py-6 text-center text-sm text-texto-suave">Todavía no hay respuestas.</p>
        <template v-else>
          <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[auto_1fr]">
            <div class="rounded-xl bg-marca-suave px-4 py-3 text-center">
              <p class="font-display text-2xl font-extrabold tabular-nums text-marca-tinta">{{ promedio }}</p>
              <p class="text-[11px] uppercase tracking-wide text-marca-tinta/80">{{ opinionesFiltradas.length }} {{ opinionesFiltradas.length === 1 ? 'respuesta' : 'respuestas' }}</p>
            </div>
            <ul class="col-span-2 space-y-1 sm:col-span-1" aria-label="Distribución de notas">
              <li v-for="n in [5, 4, 3, 2, 1]" :key="n" class="flex items-center gap-2 text-xs text-texto-secundario">
                <span class="w-4 text-right font-semibold tabular-nums">{{ n }}</span>
                <span class="h-2 flex-1 overflow-hidden rounded-full bg-superficie-hundida">
                  <span class="block h-full rounded-full bg-[#1B5E37]" :style="{ width: `${porcentaje(n)}%` }" />
                </span>
                <span class="w-6 tabular-nums">{{ conteo(n) }}</span>
              </li>
            </ul>
          </div>
          <ul class="mt-4 divide-y divide-borde-suave">
            <li v-for="o in opinionesFiltradas" :key="o.id" class="py-3">
              <div class="flex items-baseline justify-between gap-2">
                <p class="min-w-0 truncate text-sm font-semibold text-texto">{{ nombreDe(o.user_id) }}</p>
                <p class="flex-shrink-0 text-xs text-texto-tenue">{{ fechaCorta(o.updated_at) }}</p>
              </div>
              <p class="text-sm font-bold text-marca-tinta">{{ o.nota }}/5</p>
              <p v-if="o.comentario" class="mt-1 whitespace-pre-line text-sm text-texto-medio">{{ o.comentario }}</p>
            </li>
          </ul>
        </template>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { EnvelopeIcon } from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import CargaPantalla from '../../components/carga/CargaPantalla.vue'
import CargaBoton from '../../components/carga/CargaBoton.vue'
import { supabase } from '../../lib/supabase'
import { PLANTILLAS, rellenarEjemplo } from '../../correos/plantillas'

const FILTROS = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'activos', etiqueta: 'Entraron este mes' },
  { valor: 'inactivos', etiqueta: 'Sin entrar hace 30+ días' },
  { valor: 'sin_opinion', etiqueta: 'Sin opinar' }
]
const DIA = 24 * 60 * 60 * 1000

const cargando = ref(true)
const errorCarga = ref('')
const usuarios = ref([])
const opiniones = ref([])
const envios = ref([])

const busqueda = ref('')
const filtro = ref('todos')
const seleccionados = ref(new Set())

const clavePlantilla = ref(PLANTILLAS[0].clave)
const asunto = ref(PLANTILLAS[0].asunto)
const html = ref(PLANTILLAS[0].html)
const editandoHtml = ref(false)

const enviando = ref(null) // null | 'prueba' | 'real'
const confirmando = ref(false)
const mensaje = ref(null)
const envioFiltro = ref('')

const vistaPrevia = computed(() => rellenarEjemplo(html.value))
const puedeEnviar = computed(() => asunto.value.trim() && html.value.trim())

const notaPorUsuario = computed(() => {
  const mapa = new Map()
  for (const o of opiniones.value) if (!mapa.has(o.user_id)) mapa.set(o.user_id, o.nota)
  return mapa
})
const notaDe = id => notaPorUsuario.value.get(id)

const usuariosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  const ahora = Date.now()
  return usuarios.value.filter(u => {
    if (q && !`${u.nombre || ''} ${u.email}`.toLowerCase().includes(q)) return false
    const ultimo = u.ultimo_acceso ? new Date(u.ultimo_acceso).getTime() : 0
    if (filtro.value === 'activos') return ahora - ultimo <= 30 * DIA
    if (filtro.value === 'inactivos') return ahora - ultimo > 30 * DIA
    if (filtro.value === 'sin_opinion') return !notaPorUsuario.value.has(u.id)
    return true
  })
})

const opinionesFiltradas = computed(() =>
  envioFiltro.value ? opiniones.value.filter(o => o.correo_id === envioFiltro.value) : opiniones.value
)
const conteo = n => opinionesFiltradas.value.filter(o => o.nota === n).length
const porcentaje = n => (opinionesFiltradas.value.length ? Math.round((conteo(n) / opinionesFiltradas.value.length) * 100) : 0)
const promedio = computed(() => {
  const lista = opinionesFiltradas.value
  if (!lista.length) return '—'
  return (lista.reduce((s, o) => s + o.nota, 0) / lista.length).toFixed(1)
})

const nombrePorId = computed(() => new Map(usuarios.value.map(u => [u.id, u.nombre || u.email])))
const nombreDe = id => nombrePorId.value.get(id) || 'Usuario'

function alternar(id) {
  const s = new Set(seleccionados.value)
  s.has(id) ? s.delete(id) : s.add(id)
  seleccionados.value = s
  confirmando.value = false
}

function seleccionarVisibles() {
  const s = new Set(seleccionados.value)
  for (const u of usuariosFiltrados.value) s.add(u.id)
  seleccionados.value = s
  confirmando.value = false
}

function aplicarPlantilla() {
  const p = PLANTILLAS.find(x => x.clave === clavePlantilla.value)
  if (!p) return
  asunto.value = p.asunto
  html.value = p.html
}

function haceCuanto(fecha) {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / DIA)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 30) return `hace ${dias} días`
  const meses = Math.floor(dias / 30)
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`
}

const fechaCorta = f => new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

async function invocar(cuerpo) {
  const { data, error } = await supabase.functions.invoke('correo-masivo', { body: cuerpo })
  if (!error) return data
  // 401/403 y similares traen el motivo en el cuerpo de la respuesta.
  const detalle = await error.context?.json?.().catch(() => null)
  return { ok: false, error: detalle?.error || error.message }
}

async function enviarPrueba() {
  enviando.value = 'prueba'
  mensaje.value = null
  const r = await invocar({ modo: 'prueba', asunto: asunto.value, html: html.value })
  enviando.value = null
  mensaje.value = r?.ok
    ? { ok: true, texto: `Prueba enviada a ${r.para}. Revisa tu bandeja (y la de spam).` }
    : { ok: false, texto: `No se envió la prueba: ${r?.error || 'error desconocido'}` }
}

async function enviar() {
  enviando.value = 'real'
  mensaje.value = null
  const r = await invocar({
    modo: 'enviar',
    plantilla: clavePlantilla.value,
    asunto: asunto.value,
    html: html.value,
    usuarios: [...seleccionados.value]
  })
  enviando.value = null
  confirmando.value = false
  if (!r?.ok) {
    mensaje.value = { ok: false, texto: `No se envió: ${r?.error || 'error desconocido'}` }
    return
  }
  const partes = [`Enviado a ${r.enviados} de ${r.destinatarios}.`]
  if (r.omitidos) partes.push(`${r.omitidos} sin correo o inactivos.`)
  if (r.error) partes.push(`Falló un lote: ${r.error}`)
  mensaje.value = { ok: !r.error, texto: partes.join(' ') }
  seleccionados.value = new Set()
  await cargarEnvios()
}

async function cargarEnvios() {
  const { data } = await supabase
    .from('correos_masivos')
    .select('id, asunto, destinatarios, enviados, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  envios.value = data || []
}

async function cargarTodo() {
  cargando.value = true
  errorCarga.value = ''
  const [u, o] = await Promise.all([
    supabase.from('user_profiles').select('id, email, nombre, activo, ultimo_acceso').order('nombre'),
    supabase.from('opiniones_plataforma').select('id, user_id, correo_id, nota, comentario, updated_at').order('updated_at', { ascending: false }),
    cargarEnvios()
  ])
  if (u.error) errorCarga.value = `No se pudieron cargar los usuarios: ${u.error.message}`
  usuarios.value = (u.data || []).filter(x => x.activo !== false && x.email)
  opiniones.value = o.data || []
  cargando.value = false
}

onMounted(cargarTodo)
</script>

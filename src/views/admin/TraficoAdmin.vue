<template>
  <div class="mx-auto max-w-7xl space-y-5 pb-6 sm:space-y-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton to="/dashboard" :inline="true" />
          <div class="ds-page-header__icon">
            <SignalIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">Tráfico</h1>
            <p class="ds-page-header__sub hidden sm:block">
              Quién está usando la app ahora mismo, qué hace y cuándo entró
            </p>
          </div>
          <span
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
            :class="enVivo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="enVivo ? 'trafico-latido bg-emerald-500' : 'bg-gray-400'"
              aria-hidden="true"
            />
            {{ enVivo ? 'En vivo' : 'Sin conexión' }}
          </span>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button type="button" class="ds-btn ds-btn--secondary" :disabled="cargando" @click="cargarTodo">
            <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': cargando }" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </header>

    <LoadingScreen :visible="cargando && sesiones.length === 0" text="Midiendo el pulso de la app" />

    <template v-if="!cargando || sesiones.length > 0">
      <div
        v-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      >
        {{ error }}
        <button type="button" class="ml-2 font-semibold underline" @click="cargarTodo">Reintentar</button>
      </div>

      <!-- Pulso: las tres cifras que resumen el momento -->
      <!--
        «Usuarios» e «ingresos» no son lo mismo y conviene verlos juntos: una persona que
        entra y sale cinco veces son cinco ingresos y un solo usuario. Contar solo sesiones
        infla la sensación de uso.
      -->
      <section class="grid grid-cols-2 divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white sm:grid-cols-4 sm:divide-x">
        <div class="border-b border-r border-gray-200 px-3 py-3 text-center sm:border-b-0 sm:border-r-0">
          <p class="font-display text-xl font-extrabold tabular-nums text-[#1B5E37] sm:text-2xl">
            {{ conectados.length }}
          </p>
          <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">En línea</p>
        </div>
        <div class="border-b border-gray-200 px-3 py-3 text-center sm:border-b-0">
          <p class="font-display text-xl font-extrabold tabular-nums text-gray-800 sm:text-2xl">
            {{ usuariosHoy }}
          </p>
          <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">Usuarios hoy</p>
        </div>
        <div class="border-r border-gray-200 px-3 py-3 text-center sm:border-r-0">
          <p class="font-display text-xl font-extrabold tabular-nums text-gray-800 sm:text-2xl">
            {{ ingresosHoy }}
          </p>
          <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">Ingresos hoy</p>
        </div>
        <div class="px-3 py-3 text-center">
          <p class="font-display text-xl font-extrabold tabular-nums text-gray-800 sm:text-2xl">
            {{ accionesHoy }}
          </p>
          <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">Acciones hoy</p>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Quién está dentro -->
        <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <UsersIcon class="h-4 w-4 text-[#1B5E37]" />
            <h2 class="font-display text-sm font-bold text-gray-900">Dentro ahora</h2>
            <span class="ml-auto text-xs text-gray-500">{{ conectados.length }}</span>
          </div>

          <p v-if="conectados.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
            Nadie está usando la app en este momento.
          </p>

          <ul v-else class="divide-y divide-gray-100">
            <li v-for="s in conectados" :key="s.id" class="flex items-center gap-3 px-4 py-3">
              <span
                class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-display text-xs font-bold"
                :class="colorUsuario(s.email)"
                aria-hidden="true"
              >{{ iniciales(s.nombre || s.email) }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-gray-900">
                  {{ s.nombre || s.email }}
                </span>
                <span class="mt-0.5 block truncate text-xs text-gray-500">
                  {{ ultimaAccionDe(s.email) || 'Navegando' }}
                </span>
              </span>
              <span class="flex-shrink-0 text-right">
                <span class="block text-[0.6875rem] text-gray-400">{{ etiquetaPlataforma(s.plataforma) }}</span>
                <span class="block text-[0.6875rem] text-emerald-700">{{ hace(s.ultimo_latido) }}</span>
              </span>
            </li>
          </ul>
        </section>

        <!-- Qué está pasando -->
        <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <BoltIcon class="h-4 w-4 text-[#1B5E37]" />
            <h2 class="font-display text-sm font-bold text-gray-900">Actividad en vivo</h2>
          </div>

          <p v-if="actividad.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
            Todavía no ha pasado nada.
          </p>

          <ul v-else class="max-h-[26rem] divide-y divide-gray-100 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <li
              v-for="a in actividad"
              :key="a.id"
              class="px-4 py-2.5"
              :class="{ 'trafico-nuevo': a._nuevo }"
            >
              <div class="flex items-start gap-2">
                <span
                  class="mt-0.5 rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide"
                  :class="claseAccion(a.tipo_accion)"
                >{{ a.tipo_accion }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block break-words text-xs leading-snug text-gray-800">
                    {{ a.descripcion || a.entidad }}
                  </span>
                  <span class="mt-0.5 block truncate text-[0.6875rem] text-gray-500">
                    {{ a.usuario_email }}
                    <span v-if="a.natillera_nombre"> · {{ a.natillera_nombre }}</span>
                    · {{ hace(a.created_at) }}
                  </span>
                </span>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- Historial de ingresos -->
      <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <ClockIcon class="h-4 w-4 text-[#1B5E37]" />
          <h2 class="font-display text-sm font-bold text-gray-900">Historial de ingresos</h2>
          <span class="ml-auto text-xs text-gray-500">{{ sesiones.length }} sesiones</span>
        </div>

        <p v-if="sesiones.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
          Sin ingresos registrados todavía. Empiezan a aparecer en cuanto alguien use la app.
        </p>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                <th class="px-4 py-2.5">Usuario</th>
                <th class="px-4 py-2.5">Entró</th>
                <th class="px-4 py-2.5">Última señal</th>
                <th class="px-4 py-2.5">Duró</th>
                <th class="hidden px-4 py-2.5 sm:table-cell">Dispositivo</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in sesiones"
                :key="s.id"
                class="border-t border-gray-100"
                :class="estaEnLinea(s) ? 'bg-emerald-50/40' : ''"
              >
                <td class="px-4 py-2.5">
                  <span class="flex items-center gap-2">
                    <span
                      class="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      :class="estaEnLinea(s) ? 'bg-emerald-500' : 'bg-gray-300'"
                      aria-hidden="true"
                    />
                    <span class="min-w-0 truncate text-gray-800">{{ s.nombre || s.email }}</span>
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 text-gray-600 tabular-nums">{{ fechaHora(s.inicio) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-gray-600">{{ hace(s.ultimo_latido) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-gray-600 tabular-nums">{{ duracion(s) }}</td>
                <td class="hidden px-4 py-2.5 text-gray-500 sm:table-cell">{{ etiquetaPlataforma(s.plataforma) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ArrowPathIcon,
  BoltIcon,
  ClockIcon,
  SignalIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import LoadingScreen from '../../components/LoadingScreen.vue'
import { supabase } from '../../lib/supabase'

/*
 * Panel de tráfico del superadministrador.
 *
 * Tres fuentes, cada una respondiendo a una pregunta distinta:
 *   · `accesos_usuario` → quién entró y cuándo (una fila por sesión, no por latido).
 *   · `auditoria`       → qué hizo. Ya existía con 24.000 apuntes; aquí solo se escucha.
 *   · Realtime          → que las dos anteriores lleguen solas, sin recargar.
 *
 * RLS decide qué se ve: la política de `accesos_usuario` solo abre el tráfico ajeno al
 * superadministrador. El guard de la ruta es comodidad de interfaz, no la seguridad.
 */

/** Se da por conectado a quien latió hace menos de esto. El latido va cada 2 minutos. */
const MARGEN_EN_LINEA_MS = 3 * 60 * 1000

const cargando = ref(true)
const error = ref('')
const sesiones = ref([])
const actividad = ref([])
const enVivo = ref(false)

/* El «hace X» tiene que envejecer solo: sin esto, «hace 1 min» se queda congelado. */
const ahora = ref(Date.now())
let relojId = null
let canal = null

const conectados = computed(() => {
  // Una fila por persona: si alguien tiene varias sesiones vivas (móvil y escritorio),
  // interesa saber que está, no cuántas pestañas abrió.
  const porUsuario = new Map()
  for (const s of sesiones.value) {
    if (!estaEnLinea(s)) continue
    const previa = porUsuario.get(s.user_id)
    if (!previa || new Date(s.ultimo_latido) > new Date(previa.ultimo_latido)) {
      porUsuario.set(s.user_id, s)
    }
  }
  return [...porUsuario.values()].sort(
    (a, b) => new Date(b.ultimo_latido) - new Date(a.ultimo_latido)
  )
})

/** Sesiones abiertas hoy. La misma persona puede sumar varias. */
const sesionesHoy = computed(() => {
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)
  return sesiones.value.filter(s => new Date(s.inicio) >= inicioDia)
})

const ingresosHoy = computed(() => sesionesHoy.value.length)

/** Personas distintas, que es la cifra que de verdad dice cuánta gente usó la app. */
const usuariosHoy = computed(() => new Set(sesionesHoy.value.map(s => s.user_id)).size)

const accionesHoy = computed(() => {
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)
  return actividad.value.filter(a => new Date(a.created_at) >= inicioDia).length
})

function estaEnLinea(s) {
  return ahora.value - new Date(s.ultimo_latido).getTime() < MARGEN_EN_LINEA_MS
}

/** Lo último que hizo esa persona, para ponerlo junto a su nombre. */
function ultimaAccionDe(email) {
  const a = actividad.value.find(x => x.usuario_email === email)
  return a?.descripcion || null
}

async function cargarTodo() {
  cargando.value = true
  error.value = ''
  try {
    const [accesosRes, auditoriaRes] = await Promise.all([
      supabase
        .from('accesos_usuario')
        .select('id, user_id, email, nombre, inicio, ultimo_latido, plataforma')
        .order('ultimo_latido', { ascending: false })
        .limit(150),
      supabase
        .from('auditoria')
        .select('id, usuario_email, tipo_accion, entidad, descripcion, natillera_nombre, created_at')
        .order('created_at', { ascending: false })
        .limit(80)
    ])
    if (accesosRes.error) throw accesosRes.error
    if (auditoriaRes.error) throw auditoriaRes.error
    sesiones.value = accesosRes.data || []
    actividad.value = auditoriaRes.data || []
  } catch (e) {
    console.error('Panel de tráfico:', e)
    error.value = e.message || 'No se pudo cargar el tráfico'
  } finally {
    cargando.value = false
  }
}

/*
 * Realtime. Las altas de auditoría entran por arriba del feed y las de `accesos_usuario`
 * refrescan la lista de conectados. Los UPDATE de latido también llegan: son los que
 * mantienen viva la fila sin recargar nada.
 */
function escuchar() {
  canal = supabase
    .channel('trafico-superadmin')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auditoria' }, ({ new: fila }) => {
      actividad.value = [{ ...fila, _nuevo: true }, ...actividad.value].slice(0, 120)
      // La marca de «recién llegado» dura lo que el destello; si no, se quedaría fija.
      setTimeout(() => {
        const encontrada = actividad.value.find(a => a.id === fila.id)
        if (encontrada) encontrada._nuevo = false
      }, 2000)
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'accesos_usuario' }, ({ new: fila, eventType }) => {
      if (!fila?.id) return
      const resto = sesiones.value.filter(s => s.id !== fila.id)
      sesiones.value = eventType === 'DELETE' ? resto : [fila, ...resto]
        .sort((a, b) => new Date(b.ultimo_latido) - new Date(a.ultimo_latido))
    })
    .subscribe((estado) => {
      enVivo.value = estado === 'SUBSCRIBED'
    })
}

/* ---------------------------------- Formato ---------------------------------- */

function hace(fecha) {
  if (!fecha) return '—'
  const ms = ahora.value - new Date(fecha).getTime()
  if (ms < 0) return 'ahora'
  const seg = Math.floor(ms / 1000)
  if (seg < 45) return 'ahora'
  const min = Math.floor(seg / 60)
  if (min < 60) return `hace ${min} min`
  const hor = Math.floor(min / 60)
  if (hor < 24) return `hace ${hor} h`
  const dias = Math.floor(hor / 24)
  return dias === 1 ? 'ayer' : `hace ${dias} días`
}

function fechaHora(valor) {
  if (!valor) return '—'
  const d = new Date(valor)
  if (isNaN(d.getTime())) return '—'
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes} ${hh}:${mm}`
}

function duracion(s) {
  const ini = new Date(s.inicio).getTime()
  const fin = new Date(s.ultimo_latido).getTime()
  const min = Math.max(0, Math.round((fin - ini) / 60000))
  if (min < 1) return '< 1 min'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h} h ${min % 60} min`
}

function etiquetaPlataforma(p) {
  if (p === 'ios') return 'iPhone'
  if (p === 'android') return 'Android'
  if (p === 'escritorio') return 'Escritorio'
  return '—'
}

function iniciales(texto) {
  const partes = String(texto || '').trim().split(/[\s@.]+/).filter(Boolean)
  if (partes.length === 0) return '—'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
}

function colorUsuario(texto) {
  const paleta = [
    'bg-emerald-100 text-emerald-800',
    'bg-sky-100 text-sky-800',
    'bg-amber-100 text-amber-800',
    'bg-violet-100 text-violet-800',
    'bg-rose-100 text-rose-800',
    'bg-teal-100 text-teal-800'
  ]
  let suma = 0
  const s = String(texto || '')
  for (let i = 0; i < s.length; i++) suma = (suma + s.charCodeAt(i)) % 997
  return paleta[suma % paleta.length]
}

function claseAccion(accion) {
  const mapa = {
    REGISTER: 'bg-emerald-100 text-emerald-800',
    CREATE: 'bg-sky-100 text-sky-800',
    UPDATE: 'bg-amber-100 text-amber-800',
    DELETE: 'bg-rose-100 text-rose-800',
    SEND: 'bg-violet-100 text-violet-800',
    RESEND: 'bg-violet-100 text-violet-800',
    DOWNLOAD: 'bg-teal-100 text-teal-800',
    GENERATE: 'bg-indigo-100 text-indigo-800'
  }
  return mapa[accion] || 'bg-gray-100 text-gray-700'
}

onMounted(() => {
  cargarTodo()
  escuchar()
  relojId = setInterval(() => { ahora.value = Date.now() }, 30000)
})

onUnmounted(() => {
  if (relojId != null) clearInterval(relojId)
  if (canal) supabase.removeChannel(canal)
})
</script>

<style scoped>
/* Latido del indicador «En vivo»: solo opacidad y escala, barato en GPU. */
.trafico-latido {
  animation: trafico-pulso 2s ease-in-out infinite;
}

@keyframes trafico-pulso {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.8); }
}

/* Destello de la fila que acaba de llegar por Realtime. */
.trafico-nuevo {
  animation: trafico-entrada 2s ease-out;
}

@keyframes trafico-entrada {
  0% { background-color: rgba(27, 94, 55, 0.12); }
  100% { background-color: transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .trafico-latido,
  .trafico-nuevo {
    animation: none;
  }
}
</style>

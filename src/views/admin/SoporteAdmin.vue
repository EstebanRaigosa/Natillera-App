<template>
  <div ref="raiz" class="flex min-h-0 flex-col">
    <!-- ── Cabecera ── -->
    <div class="mb-3 flex items-center gap-3">
      <button
        v-if="idActivo && !esEscritorio"
        type="button"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 touch-manipulation"
        aria-label="Volver a la bandeja"
        @click="cerrarConversacion"
      >
        <ArrowLeftIcon class="h-5 w-5" />
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="truncate font-display text-xl font-bold text-gray-900 sm:text-2xl">Soporte</h1>
        <p class="mt-0.5 text-xs text-gray-500 sm:text-sm">
          {{ soporte.totalBandeja }} conversación{{ soporte.totalBandeja === 1 ? '' : 'es' }}
          <span v-if="estadoCanal === 'degradado'" class="text-amber-700">· actualización cada minuto</span>
        </p>
      </div>
    </div>

    <!-- ── Filtros y búsqueda ── -->
    <div v-if="!idActivo || esEscritorio" class="mb-3 flex flex-wrap items-center gap-2">
      <div class="flex min-w-[12rem] flex-1 items-center rounded-xl border-2 border-gray-200 bg-white focus-within:border-[#1B5E37] focus-within:ring-2 focus-within:ring-[#1B5E37]/30">
        <span class="pointer-events-none shrink-0 pl-3 text-gray-400">
          <MagnifyingGlassIcon class="h-5 w-5" />
        </span>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Asunto o correo…"
          class="min-w-0 flex-1 border-none bg-transparent px-2 py-2.5 text-base outline-none focus:ring-0"
          @keyup.enter="recargarBandeja"
        />
        <button
          v-if="busqueda.trim()"
          type="button"
          class="shrink-0 p-2.5 text-gray-400 transition hover:text-gray-600 touch-manipulation"
          aria-label="Limpiar búsqueda"
          @click="busqueda = ''; recargarBandeja()"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <select
        v-model="filtroEstado"
        class="rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-[#1B5E37]"
        @change="recargarBandeja"
      >
        <option value="todas">Todas</option>
        <option value="sin_responder">Sin responder</option>
        <option value="abierta">Abiertas</option>
        <option value="en_proceso">En proceso</option>
        <option value="resuelta">Resueltas</option>
        <option value="archivada">Archivadas</option>
      </select>

      <select
        v-model="filtroCategoria"
        class="rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-[#1B5E37]"
        @change="recargarBandeja"
      >
        <option value="todas">Toda categoría</option>
        <option v-for="c in CATEGORIAS" :key="c.valor" :value="c.valor">{{ c.etiqueta }}</option>
      </select>
    </div>

    <div class="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <!-- ── Bandeja ── -->
      <aside
        :class="[
          'flex min-h-0 flex-col lg:w-96 lg:shrink-0 lg:border-r lg:border-gray-200',
          idActivo ? 'hidden lg:flex' : 'flex flex-1',
        ]"
      >
        <div v-if="soporte.cargando && !soporte.bandeja.length" class="space-y-2 p-3">
          <div v-for="n in 5" :key="n" class="h-20 animate-pulse rounded-xl bg-gray-100" />
        </div>

        <!-- Un fallo de carga no puede disfrazarse de bandeja vacía: son cosas
             distintas y llevan a conclusiones distintas. -->
        <div v-else-if="soporte.error" class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <ExclamationTriangleIcon class="h-8 w-8 text-amber-500" />
          <p class="text-sm text-gray-600">{{ soporte.error }}</p>
          <button type="button" class="btn-modal-secondary !min-h-[44px] px-4 text-sm" @click="recargarBandeja()">
            Reintentar
          </button>
        </div>

        <div v-else-if="!soporte.bandeja.length" class="flex flex-1 items-center justify-center p-8 text-center">
          <p class="text-sm text-gray-500">No hay conversaciones con estos filtros.</p>
        </div>

        <ul v-else class="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <li v-for="conversacion in soporte.bandeja" :key="conversacion.id">
            <button
              type="button"
              :class="[
                'relative flex w-full flex-col gap-1 py-3 pl-5 pr-4 text-left transition touch-manipulation',
                conversacion.id === idActivo ? 'bg-[#E8F5E9]' : 'hover:bg-gray-50',
                ESTADOS_CERRADOS.includes(conversacion.estado) && conversacion.id !== idActivo ? 'bg-gray-50/60' : '',
              ]"
              @click="abrirConversacion(conversacion.id)"
            >
              <span
                :class="['absolute inset-y-0 left-0 w-1.5', ESTADOS[conversacion.estado]?.barra || 'bg-gray-300']"
                aria-hidden="true"
              />
              <div class="flex items-center gap-2">
                <span class="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
                  {{ conversacion.asunto }}
                </span>
                <span
                  v-if="conversacion.sin_leer_soporte > 0"
                  class="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[#1B5E37] px-1.5 text-[0.6875rem] font-bold text-white"
                >
                  {{ conversacion.sin_leer_soporte }}
                </span>
              </div>
              <p class="truncate text-xs text-gray-600">{{ conversacion.user_email }}</p>
              <div class="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                <span :class="['inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium', ESTADOS[conversacion.estado]?.clase]">
                  {{ ESTADOS[conversacion.estado]?.etiqueta || conversacion.estado }}
                </span>
                <span class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[0.6875rem] capitalize">{{ conversacion.categoria }}</span>
                <!-- El correlativo interno solo se ve aquí: al soporte le sirve
                     para saber el orden y el volumen; al usuario, no. -->
                <span class="truncate">
                  {{ codigoConversacion(conversacion.numero) }}
                  <span class="text-gray-400">#{{ conversacion.numero }}</span>
                  · {{ fechaRelativa(conversacion.ultimo_mensaje_at) }}
                </span>
              </div>
            </button>
          </li>
        </ul>

        <!-- Paginación de 25 en 25 (RNF-08) -->
        <div v-if="totalPaginas > 1" class="flex shrink-0 items-center justify-between border-t border-gray-200 px-4 py-2.5">
          <button
            type="button"
            class="rounded-full px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-40 touch-manipulation"
            :disabled="pagina === 0"
            @click="cambiarPagina(pagina - 1)"
          >
            Anterior
          </button>
          <span class="text-xs text-gray-500">{{ pagina + 1 }} / {{ totalPaginas }}</span>
          <button
            type="button"
            class="rounded-full px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-40 touch-manipulation"
            :disabled="pagina >= totalPaginas - 1"
            @click="cambiarPagina(pagina + 1)"
          >
            Siguiente
          </button>
        </div>
      </aside>

      <!-- ── Hilo + herramientas del soporte ── -->
      <section :class="['flex min-h-0 min-w-0 flex-1 flex-col', idActivo ? 'flex' : 'hidden lg:flex']">
        <template v-if="conversacionActiva">
          <div
            :class="[
              'flex-shrink-0 space-y-2 border-b border-gray-200 px-4 py-3 transition-colors',
              ESTADOS[conversacionActiva.estado]?.tinte || 'bg-white',
            ]"
          >
            <div class="flex items-start gap-2">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900">{{ conversacionActiva.asunto }}</p>
                <p class="mt-0.5 truncate text-xs text-gray-500">
                  {{ codigoConversacion(conversacionActiva.numero) }}
                  <span class="text-gray-400">#{{ conversacionActiva.numero }}</span>
                  · {{ conversacionActiva.user_email }}
                </p>
              </div>
              <button
                type="button"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600 touch-manipulation"
                aria-label="Eliminar conversación"
                @click="conversacionABorrar = conversacionActiva"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <select
                :value="conversacionActiva.estado"
                class="rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-[#1B5E37]"
                :disabled="guardandoEstado"
                @change="cambiarEstado($event.target.value)"
              >
                <!-- Solo se ofrecen las transiciones que RN-05 permite desde el
                     estado actual; el servidor rechaza cualquier otra. -->
                <option :value="conversacionActiva.estado">
                  {{ ESTADOS[conversacionActiva.estado]?.etiqueta }} (actual)
                </option>
                <option v-for="destino in transicionesPosibles" :key="destino" :value="destino">
                  Marcar como {{ ESTADOS[destino]?.etiqueta.toLowerCase() }}
                </option>
              </select>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 transition hover:bg-gray-50 touch-manipulation"
                @click="mostrarNota = !mostrarNota"
              >
                <LockClosedIcon class="h-4 w-4 text-gray-500" />
                Nota interna
              </button>
            </div>

            <!-- Nota interna: privada del soporte (RN-11). El usuario no la
                 recibe por ninguna vía; ni siquiera está en su vista. -->
            <div v-if="mostrarNota" class="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <p class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                <LockClosedIcon class="h-3.5 w-3.5" />
                Solo la ves tú. El usuario nunca accede a este texto.
              </p>
              <textarea
                v-model="notaInterna"
                rows="3"
                maxlength="1000"
                placeholder="Contexto, pasos dados, lo que haga falta recordar…"
                class="w-full resize-y rounded-lg border border-amber-200 bg-white px-3 py-2 text-base outline-none focus:border-amber-500"
              />
              <div class="mt-2 flex justify-end">
                <button
                  type="button"
                  class="rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 touch-manipulation"
                  :disabled="guardandoNota"
                  @click="guardarNota"
                >
                  {{ guardandoNota ? 'Guardando…' : 'Guardar nota' }}
                </button>
              </div>
            </div>
          </div>

          <HiloMensajes
            :conversacion-id="idActivo"
            :mensajes="mensajesActivos"
            lado-propio="soporte"
            :cargando-inicial="soporte.cargandoMensajes && !mensajesActivos.length"
            :cargando-antiguos="soporte.cargandoMensajes"
            :hay-mas-antiguos="soporte.hayMasAntiguos[idActivo] === true"
            @cargar-antiguos="cargarAntiguos"
            @reintentar="() => soporte.procesarCola()"
          />

          <RedactorMensaje
            ref="redactor"
            v-model="borrador"
            :enviando="enviando"
            :bloqueado="conversacionActiva.estado === 'archivada'"
            motivo-bloqueo="Conversación archivada. Reábrela para poder responder."
            marcador="Responder al usuario…"
            @enviar="responder"
          />
        </template>

        <div v-else class="hidden flex-1 items-center justify-center p-8 text-center lg:flex">
          <div>
            <InboxIcon class="mx-auto h-10 w-10 text-gray-300" />
            <p class="mt-3 text-sm text-gray-500">Elige una conversación de la bandeja.</p>
          </div>
        </div>
      </section>
    </div>

    <EliminarConversacionModal
      :conversacion="conversacionABorrar"
      :borrando="borrando"
      @close="conversacionABorrar = null"
      @confirmar="eliminar"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon, ExclamationTriangleIcon, InboxIcon, LockClosedIcon,
  MagnifyingGlassIcon, TrashIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useAltoDisponible } from '../../composables/useAltoDisponible'
import HiloMensajes from '../../components/soporte/HiloMensajes.vue'
import RedactorMensaje from '../../components/soporte/RedactorMensaje.vue'
import EliminarConversacionModal from '../../components/soporte/EliminarConversacionModal.vue'
import { CATEGORIAS, codigoConversacion, ESTADOS, ESTADOS_CERRADOS, useSoporteStore } from '../../stores/soporte'
import { useSoporteRealtime } from '../../composables/useSoporteRealtime'
import { useNotificationStore } from '../../stores/notifications'

const route = useRoute()
const router = useRouter()
const soporte = useSoporteStore()
const notificaciones = useNotificationStore()

const idActivo = ref(route.params.conversacionId ?? null)
const borrador = ref('')
const enviando = ref(false)
const busqueda = ref('')
const filtroEstado = ref('todas')
const filtroCategoria = ref('todas')
const pagina = ref(0)
const mostrarNota = ref(false)
const notaInterna = ref('')
const guardandoNota = ref(false)
const guardandoEstado = ref(false)
const conversacionABorrar = ref(null)
const borrando = ref(false)
const redactor = ref(null)
const esEscritorio = ref(typeof window !== 'undefined' && window.innerWidth >= 1024)

// Igual que en la pantalla del usuario: la altura se mide sobre el viewport
// visible para que el redactor no quede bajo el teclado en iOS.
const raiz = ref(null)
useAltoDisponible(raiz)

const conversacionActiva = computed(() =>
  soporte.bandeja.find((c) => c.id === idActivo.value) ?? null)

const mensajesActivos = computed(() => soporte.mensajes[idActivo.value] ?? [])

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(soporte.totalBandeja / soporte.CONVERSACIONES_POR_PAGINA)))

/** RN-05: destinos válidos desde el estado actual. */
const TRANSICIONES = {
  abierta: ['en_proceso', 'resuelta'],
  en_proceso: ['resuelta'],
  resuelta: ['abierta', 'archivada'],
  archivada: ['abierta'],
}
const transicionesPosibles = computed(() => TRANSICIONES[conversacionActiva.value?.estado] ?? [])

function fechaRelativa(iso) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  if (minutos < 60 * 24) return `hace ${Math.round(minutos / 60)} h`
  if (minutos < 60 * 24 * 7) return `hace ${Math.round(minutos / (60 * 24))} d`
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// ---- Realtime: el panel escucha TODAS las conversaciones ------------------

const { estadoCanal, suscribir } = useSoporteRealtime({
  alRecibir: (mensaje) => {
    soporte.recibirMensaje(mensaje)
    recargarBandeja({ conservarPagina: true })
    if (mensaje.autor === 'usuario' && mensaje.conversacion_id === idActivo.value) {
      soporte.marcarLeido(idActivo.value)
    }
  },
  alCambiarConversacion: (fila) => {
    soporte.aplicarCambioConversacion(fila)
  },
  alRefrescar: () => {
    recargarBandeja({ conservarPagina: true })
    if (idActivo.value) soporte.cargarMensajes(idActivo.value)
  },
})

// ---- Ciclo de vida --------------------------------------------------------

function alCambiarTamano() {
  esEscritorio.value = window.innerWidth >= 1024
}

onMounted(async () => {
  window.addEventListener('resize', alCambiarTamano)
  await recargarBandeja()
  soporte.refrescarNoLeidos()
  suscribir(null)
  if (idActivo.value) await abrirConversacion(idActivo.value, { navegar: false })
})

onUnmounted(() => {
  window.removeEventListener('resize', alCambiarTamano)
})

watch(() => route.params.conversacionId, (nuevo) => {
  if (nuevo && nuevo !== idActivo.value) abrirConversacion(nuevo, { navegar: false })
  else if (!nuevo) idActivo.value = null
})

// ---- Acciones -------------------------------------------------------------

async function recargarBandeja({ conservarPagina = false } = {}) {
  if (!conservarPagina) pagina.value = 0
  await soporte.cargarBandeja({
    estado: filtroEstado.value,
    categoria: filtroCategoria.value,
    busqueda: busqueda.value,
    pagina: pagina.value,
  })
}

async function cambiarPagina(nueva) {
  pagina.value = nueva
  await recargarBandeja({ conservarPagina: true })
}

async function abrirConversacion(id, { navegar = true } = {}) {
  idActivo.value = id
  borrador.value = ''
  mostrarNota.value = false
  if (navegar) router.push(`/admin/soporte/${id}`)

  await soporte.cargarMensajes(id)
  await soporte.marcarLeido(id)

  try {
    notaInterna.value = await soporte.leerNotaInterna(id)
  } catch {
    notaInterna.value = ''
  }
}

function cerrarConversacion() {
  idActivo.value = null
  router.push('/admin/soporte')
}

async function responder({ cuerpo, archivos }) {
  if (!idActivo.value) return
  enviando.value = true
  const textoEnviado = cuerpo
  try {
    const resultado = await soporte.enviar({ conversacionId: idActivo.value, cuerpo, archivos })
    if (resultado.ok) {
      borrador.value = ''
      redactor.value?.limpiar()
      await recargarBandeja({ conservarPagina: true })
    } else if (resultado.encolado) {
      borrador.value = ''
      redactor.value?.limpiar()
      notificaciones.alerta(resultado.error)
    } else {
      borrador.value = textoEnviado
      notificaciones.critica(resultado.error)
    }
  } finally {
    enviando.value = false
  }
}

async function cambiarEstado(nuevoEstado) {
  if (!idActivo.value || nuevoEstado === conversacionActiva.value?.estado) return
  guardandoEstado.value = true
  try {
    await soporte.actualizarConversacion(idActivo.value, { estado: nuevoEstado })
    notificaciones.exito(`Conversación marcada como ${ESTADOS[nuevoEstado]?.etiqueta.toLowerCase()}.`)
  } catch (e) {
    notificaciones.critica(e.message)
    await recargarBandeja({ conservarPagina: true })
  } finally {
    guardandoEstado.value = false
  }
}

async function guardarNota() {
  if (!idActivo.value) return
  guardandoNota.value = true
  try {
    await soporte.actualizarConversacion(idActivo.value, { notaInterna: notaInterna.value })
    notificaciones.exito('Nota interna guardada.')
  } catch (e) {
    notificaciones.critica(e.message)
  } finally {
    guardandoNota.value = false
  }
}

async function eliminar() {
  if (!conversacionABorrar.value) return
  borrando.value = true
  try {
    await soporte.eliminarConversacion(conversacionABorrar.value.id)
    conversacionABorrar.value = null
    if (idActivo.value) cerrarConversacion()
    await recargarBandeja()
    notificaciones.exito('Conversación eliminada.')
  } catch (e) {
    notificaciones.critica(e.message)
  } finally {
    borrando.value = false
  }
}

async function cargarAntiguos() {
  if (idActivo.value) await soporte.cargarMensajes(idActivo.value, { masAntiguos: true })
}
</script>

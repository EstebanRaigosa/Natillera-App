<template>
  <div class="flex min-h-0 flex-1 overflow-hidden" :class="compacto ? '' : 'gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm'">
    <!-- ── Lista de conversaciones ── -->
    <aside
      :class="[
        'flex min-h-0 flex-col',
        compacto
          ? (conversacionActiva ? 'hidden' : 'flex flex-1')
          : (conversacionActiva ? 'hidden lg:flex lg:w-80 lg:shrink-0 lg:border-r lg:border-gray-200' : 'flex flex-1 lg:w-80 lg:flex-none lg:shrink-0 lg:border-r lg:border-gray-200'),
      ]"
    >
      <div v-if="soporte.cargando && !soporte.conversaciones.length" class="space-y-2 p-3">
        <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-xl bg-gray-100" />
      </div>

      <div v-else-if="soporte.error && !soporte.conversaciones.length" class="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <ExclamationTriangleIcon class="h-8 w-8 text-amber-500" />
        <p class="text-sm text-gray-600">{{ soporte.error }}</p>
        <button type="button" class="btn-modal-secondary !min-h-[44px] px-4 text-sm" @click="recargar">
          Reintentar
        </button>
      </div>

      <div v-else-if="!soporte.conversaciones.length" class="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F5E9]">
          <ChatBubbleLeftRightIcon class="h-7 w-7 text-[#1B5E37]" />
        </div>
        <p class="font-display text-base font-bold text-gray-900">¿Necesitas ayuda?</p>
        <p class="max-w-xs text-sm leading-relaxed text-gray-600">
          Escríbenos y te respondemos por aquí mismo. No hace falta salir de la app.
        </p>
        <button type="button" class="btn-modal-primary !min-h-[44px] px-5 text-sm" @click="abrirNueva">
          Escribir a soporte
        </button>
      </div>

      <template v-else>
        <ul class="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <li v-for="conversacion in soporte.conversaciones" :key="conversacion.id">
            <button
              type="button"
              :class="[
                'relative flex w-full flex-col gap-1 py-3 pl-5 pr-4 text-left transition touch-manipulation',
                conversacion.id === idActivo ? 'bg-[#E8F5E9]' : 'hover:bg-gray-50',
                estaCerrada(conversacion.estado) && conversacion.id !== idActivo ? 'bg-gray-50/60' : '',
              ]"
              @click="abrirConversacion(conversacion.id)"
            >
              <span
                :class="['absolute inset-y-0 left-0 w-1.5', ESTADOS[conversacion.estado]?.barra || 'bg-gray-300']"
                aria-hidden="true"
              />
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'min-w-0 flex-1 truncate text-sm font-semibold',
                    estaCerrada(conversacion.estado) ? 'text-gray-500' : 'text-gray-900',
                  ]"
                >
                  {{ conversacion.asunto }}
                </span>
                <span
                  v-if="conversacion.sin_leer_usuario > 0"
                  class="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-[#1B5E37] px-1.5 text-[0.6875rem] font-bold text-white"
                >
                  {{ conversacion.sin_leer_usuario }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span
                  :class="['inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium', ESTADOS[conversacion.estado]?.clase]"
                >
                  {{ ESTADOS[conversacion.estado]?.etiqueta || conversacion.estado }}
                </span>
                <span class="truncate">{{ codigoConversacion(conversacion.numero) }} · {{ fechaRelativa(conversacion.ultimo_mensaje_at) }}</span>
              </div>
            </button>
          </li>
        </ul>

        <!-- En el panel flotante la acción vive abajo, al alcance del pulgar -->
        <div
          v-if="compacto"
          class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <button type="button" class="btn-modal-primary w-full !min-h-[44px] text-sm" @click="abrirNueva">
            <PlusIcon class="mr-1.5 h-4 w-4" />
            Nueva conversación
          </button>
        </div>
      </template>
    </aside>

    <!-- ── Hilo ── -->
    <section
      :class="[
        'flex min-h-0 min-w-0 flex-1 flex-col',
        conversacionActiva ? 'flex' : (compacto ? 'hidden' : 'hidden lg:flex'),
      ]"
    >
      <template v-if="conversacionActiva">
        <div
          :class="[
            'flex-shrink-0 border-b border-gray-200 px-4 py-3 transition-colors',
            ESTADOS[conversacionActiva.estado]?.tinte || 'bg-white',
          ]"
        >
          <div class="flex items-center gap-2">
            <!--
              Volver a la lista. En el panel flotante siempre hace falta (una
              sola columna); en la página, solo por debajo de `lg`, que es
              donde la lista y el hilo no caben a la vez.
            -->
            <button
              type="button"
              :class="[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-black/5 touch-manipulation',
                compacto ? '' : 'lg:hidden',
              ]"
              aria-label="Volver a la lista"
              @click="cerrarConversacion"
            >
              <ArrowLeftIcon class="h-5 w-5" />
            </button>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-900">{{ conversacionActiva.asunto }}</p>
              <p class="mt-0.5 text-xs text-gray-500">Conversación {{ codigoConversacion(conversacionActiva.numero) }}</p>
            </div>
            <span
              :class="['inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium', ESTADOS[conversacionActiva.estado]?.clase]"
            >
              {{ ESTADOS[conversacionActiva.estado]?.etiqueta || conversacionActiva.estado }}
            </span>
          </div>

          <div
            v-if="estaCerrada(conversacionActiva.estado)"
            class="mt-2 flex items-start gap-2 text-xs text-gray-600"
          >
            <CheckCircleIcon v-if="conversacionActiva.estado === 'resuelta'" class="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <ArchiveBoxIcon v-else class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <p>
              {{ conversacionActiva.estado === 'resuelta'
                ? 'El soporte dio esta conversación por resuelta.'
                : 'Esta conversación está archivada.' }}
            </p>
          </div>

          <p v-if="estadoCanal === 'degradado'" class="mt-2 text-[0.6875rem] text-amber-700">
            Sin conexión en tiempo real: la conversación se actualiza cada minuto.
          </p>
        </div>

        <HiloMensajes
          :conversacion-id="idActivo"
          :mensajes="mensajesActivos"
          lado-propio="usuario"
          :cargando-inicial="soporte.cargandoMensajes && !mensajesActivos.length"
          :cargando-antiguos="soporte.cargandoMensajes"
          :hay-mas-antiguos="soporte.hayMasAntiguos[idActivo] === true"
          :acuse="acuse"
          @cargar-antiguos="cargarAntiguos"
          @reintentar="reintentarMensaje"
        />

        <RedactorMensaje
          ref="redactor"
          v-model="borrador"
          :enviando="enviando"
          :bloqueado="redactorBloqueado"
          :motivo-bloqueo="motivoBloqueo"
          :texto-desbloqueo="conversacionActiva.estado === 'resuelta' ? 'Volver a escribir' : ''"
          @enviar="enviarMensaje"
          @desbloquear="reabrirHilo"
        />
      </template>

      <div v-else class="hidden flex-1 items-center justify-center p-8 text-center lg:flex">
        <div>
          <ChatBubbleLeftRightIcon class="mx-auto h-10 w-10 text-gray-300" />
          <p class="mt-3 text-sm text-gray-500">Elige una conversación o abre una nueva.</p>
        </div>
      </div>
    </section>

    <NuevaConversacionModal
      ref="modalNueva"
      :show="mostrarNueva"
      :enviando="creando"
      @close="mostrarNueva = false"
      @crear="crearConversacion"
    />
  </div>
</template>

<script setup>
/**
 * Cuerpo del soporte del usuario: lista de conversaciones, hilo y redactor.
 *
 * Vive como componente y no dentro de la vista porque hay dos sitios donde se
 * usa exactamente lo mismo: la página `/soporte` y el panel flotante que abre
 * el botón. Duplicar esta lógica significaría mantener dos chats.
 *
 *   `compacto`  → una sola columna con navegación lista ⇄ hilo (panel flotante)
 *   `usarRuta`  → sincroniza la conversación abierta con la URL (solo la página;
 *                 el panel flotante no debe cambiar la dirección del navegador)
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArchiveBoxIcon, ArrowLeftIcon, ChatBubbleLeftRightIcon, CheckCircleIcon,
  ExclamationTriangleIcon, PlusIcon,
} from '@heroicons/vue/24/outline'
import HiloMensajes from './HiloMensajes.vue'
import RedactorMensaje from './RedactorMensaje.vue'
import NuevaConversacionModal from './NuevaConversacionModal.vue'
import { acuseParaConversacion, codigoConversacion, ESTADOS, ESTADOS_CERRADOS, useSoporteStore } from '../../stores/soporte'
import { useSoporteRealtime } from '../../composables/useSoporteRealtime'
import { useNotificationStore } from '../../stores/notifications'

const props = defineProps({
  compacto: { type: Boolean, default: false },
  usarRuta: { type: Boolean, default: false },
})

const emit = defineEmits(['cambiar-conversacion'])

const route = useRoute()
const router = useRouter()
const soporte = useSoporteStore()
const notificaciones = useNotificationStore()

const idActivo = ref(props.usarRuta ? (route.params.conversacionId ?? null) : null)
const borrador = ref('')
const enviando = ref(false)
const creando = ref(false)
const mostrarNueva = ref(false)
const redactor = ref(null)
const modalNueva = ref(null)
const reabriendoHilo = ref(false)

const conversacionActiva = computed(() =>
  soporte.conversaciones.find((c) => c.id === idActivo.value) ?? null)

const mensajesActivos = computed(() => soporte.mensajes[idActivo.value] ?? [])

const estaCerrada = (estado) => ESTADOS_CERRADOS.includes(estado)

/*
 * El acuse solo tiene sentido mientras la espera es real: aparece cuando el
 * mensaje ya está guardado en el servidor y todavía no hay ni una línea del
 * soporte. En cuanto contestan, desaparece — a nadie le sirve que le repitan
 * «te responderemos» debajo de una respuesta.
 */
const acuse = computed(() => {
  const lista = mensajesActivos.value
  if (!lista.length) return ''
  if (lista.some((m) => m.autor === 'soporte')) return ''
  if (!lista.some((m) => m._estado === 'enviado')) return ''
  return acuseParaConversacion(idActivo.value)
})

/*
 * Una conversación resuelta llega con el redactor bloqueado, pero el bloqueo es
 * reversible: RN-06 dice que un mensaje del usuario en una conversación
 * resuelta la devuelve a `abierta`, y CA-02 lo exige. Archivada sí es
 * definitivo para el usuario (RN-08).
 */
const redactorBloqueado = computed(() => {
  const estado = conversacionActiva.value?.estado
  if (estado === 'archivada') return true
  if (estado === 'resuelta') return !reabriendoHilo.value
  return false
})

const motivoBloqueo = computed(() =>
  conversacionActiva.value?.estado === 'archivada'
    ? 'Esta conversación está archivada. Si necesitas retomarla, escríbenos una nueva.'
    : 'Esta conversación está resuelta. Si el problema sigue, puedes retomarla aquí mismo.')

function reabrirHilo() {
  reabriendoHilo.value = true
  nextTick(() => redactor.value?.enfocar())
}

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

// ---- Realtime -------------------------------------------------------------

const { estadoCanal, suscribir } = useSoporteRealtime({
  alRecibir: (mensaje) => {
    const esNuevo = soporte.recibirMensaje(mensaje)
    if (esNuevo && mensaje.autor === 'soporte' && mensaje.conversacion_id === idActivo.value) {
      soporte.marcarLeido(idActivo.value)
    }
    soporte.cargarConversaciones()
  },
  alCambiarConversacion: (fila) => {
    soporte.aplicarCambioConversacion(fila)
    if (!estaCerrada(fila.estado)) reabriendoHilo.value = false
  },
  alRefrescar: () => {
    if (idActivo.value) soporte.cargarMensajes(idActivo.value)
    soporte.cargarConversaciones()
  },
})

// ---- Ciclo de vida --------------------------------------------------------

function alRecuperarConexion() {
  soporte.procesarCola()
}

onMounted(async () => {
  window.addEventListener('online', alRecuperarConexion)

  await soporte.cargarConversaciones()
  soporte.refrescarNoLeidos()
  soporte.procesarCola()

  if (idActivo.value) await abrirConversacion(idActivo.value, { navegar: false })
  else suscribir(null)
})

onUnmounted(() => {
  window.removeEventListener('online', alRecuperarConexion)
})

watch(() => route.params.conversacionId, (nuevo) => {
  if (!props.usarRuta) return
  if (nuevo && nuevo !== idActivo.value) abrirConversacion(nuevo, { navegar: false })
  else if (!nuevo) idActivo.value = null
})

// ---- Acciones -------------------------------------------------------------

async function recargar() {
  await soporte.cargarConversaciones()
}

async function abrirConversacion(id, { navegar = true } = {}) {
  // Caso borde 14: la notificación apunta a una conversación ya borrada.
  if (!soporte.conversaciones.some((c) => c.id === id)) {
    await soporte.cargarConversaciones()
    if (!soporte.conversaciones.some((c) => c.id === id)) {
      idActivo.value = null
      notificaciones.informacion('Esa conversación ya no existe.')
      if (props.usarRuta && route.params.conversacionId) router.replace('/soporte')
      return
    }
  }

  idActivo.value = id
  borrador.value = ''
  reabriendoHilo.value = false
  emit('cambiar-conversacion', conversacionActiva.value)

  if (navegar && props.usarRuta) router.push(`/soporte/${id}`)

  await soporte.cargarMensajes(id)
  await soporte.marcarLeido(id)
  suscribir(id)
}

function cerrarConversacion() {
  idActivo.value = null
  reabriendoHilo.value = false
  emit('cambiar-conversacion', null)
  if (props.usarRuta) router.push('/soporte')
  suscribir(null)
}

function abrirNueva() {
  mostrarNueva.value = true
}

async function crearConversacion({ asunto, categoria, cuerpo }) {
  creando.value = true
  try {
    const resultado = await soporte.enviar({ asunto, categoria, cuerpo })

    if (!resultado.ok) {
      // El texto redactado nunca se pierde: el modal sigue abierto con todo
      // dentro y solo se muestra el motivo (RF-01, CA-18).
      if (resultado.encolado) notificaciones.alerta(resultado.error)
      else notificaciones.critica(resultado.error)
      return
    }

    modalNueva.value?.limpiar()
    mostrarNueva.value = false
    await soporte.cargarConversaciones()
    await abrirConversacion(resultado.conversacionId)
    notificaciones.exito(`Conversación ${codigoConversacion(resultado.numero)} abierta. Te avisaremos cuando respondamos.`)
  } finally {
    creando.value = false
  }
}

async function enviarMensaje({ cuerpo, archivos }) {
  if (!idActivo.value) return
  enviando.value = true
  const textoEnviado = cuerpo
  try {
    const resultado = await soporte.enviar({ conversacionId: idActivo.value, cuerpo, archivos })

    if (resultado.ok) {
      borrador.value = ''
      redactor.value?.limpiar()
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

function reintentarMensaje() {
  soporte.procesarCola()
}

async function cargarAntiguos() {
  if (idActivo.value) await soporte.cargarMensajes(idActivo.value, { masAntiguos: true })
}

defineExpose({
  hayConversacionAbierta: computed(() => !!conversacionActiva.value),
  cerrarConversacion,
  abrirNueva,
})
</script>

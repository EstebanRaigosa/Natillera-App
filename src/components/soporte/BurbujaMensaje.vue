<template>
  <div
    :class="['group relative flex w-full items-center gap-1', esPropio ? 'justify-end' : 'justify-start']"
    :data-mensaje-id="mensaje.id"
  >
    <!--
      Flecha que asoma por la izquierda al deslizar la burbuja hacia la derecha.
      Crece con el arrastre y se rellena al pasar el umbral: es la señal de que,
      si se suelta ahí, el mensaje queda citado.
    -->
    <span
      v-if="citable"
      aria-hidden="true"
      class="pointer-events-none absolute left-0 top-1/2 flex h-8 w-8 items-center justify-center rounded-full"
      :class="listoParaCitar ? 'bg-[#1B5E37] text-white' : 'bg-superficie-hundida text-texto-suave'"
      :style="estiloFlecha"
    >
      <ArrowUturnLeftIcon class="h-4 w-4" />
    </span>

    <!--
      En escritorio no hay gesto: el botón aparece al pasar el ratón o con el
      foco del teclado. Solo en dispositivos con hover; en móvil se cita
      deslizando y un botón invisible pero pulsable sería una trampa.
    -->
    <button
      v-if="citable"
      type="button"
      :class="[
        'hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-texto-suave opacity-0 transition hover:bg-superficie-hundida group-hover:opacity-100 focus-visible:opacity-100 touch-manipulation [@media(hover:hover)]:flex',
        esPropio ? 'order-first' : 'order-last',
      ]"
      aria-label="Responder citando este mensaje"
      title="Responder"
      @click="$emit('responder', mensaje)"
    >
      <ArrowUturnLeftIcon class="h-4 w-4" />
    </button>

    <!--
      `touch-action: pan-y`: el navegador sigue desplazando el hilo en vertical
      y deja el movimiento horizontal para el gesto. Por eso los listeners son
      pasivos: no hace falta `preventDefault()` para que el hilo no se mueva de
      lado, y no se frena el scroll en iOS (manual §6).
    -->
    <div
      class="max-w-[85%] [touch-action:pan-y] sm:max-w-[75%]"
      :style="estiloArrastre"
      @touchstart.passive="alEmpezarToque"
      @touchmove.passive="alMoverToque"
      @touchend.passive="alSoltarToque"
      @touchcancel.passive="cancelarArrastre"
    >
      <div
        :class="[
          'rounded-2xl px-4 py-2.5 shadow-sm transition-shadow duration-300',
          esPropio
            ? 'bg-[#1B5E37] text-white rounded-br-md'
            : 'bg-superficie-tarjeta text-texto border border-borde rounded-bl-md',
          destacado ? 'ring-4 ring-amber-300/80 oscuro:ring-amber-400/60' : '',
        ]"
      >
        <!--
          Cita: autor y una o dos líneas del original. Al tocarla, el hilo baja
          (o sube) hasta el mensaje citado y lo resalta un momento.
        -->
        <button
          v-if="cita"
          type="button"
          :class="[
            'mb-1.5 block min-h-[2.75rem] w-full rounded-lg border-l-4 px-2.5 py-1.5 text-left transition touch-manipulation',
            esPropio
              ? 'border-white/70 bg-white/15 hover:bg-white/20'
              : 'border-[#1B5E37] bg-superficie-suave hover:bg-superficie-hundida oscuro:border-marca-tinta',
          ]"
          :aria-label="`Ir al mensaje citado de ${autorCita(cita, ladoPropio)}`"
          @click="$emit('ir-a-cita', cita.id)"
        >
          <span :class="['block text-[0.6875rem] font-semibold', esPropio ? 'text-white/90' : 'text-marca-tinta']">
            {{ autorCita(cita, ladoPropio) }}
          </span>
          <span :class="['line-clamp-2 block break-words text-xs', esPropio ? 'text-white/80' : 'text-texto-suave']">
            {{ resumenCita(cita) }}
          </span>
        </button>

        <!--
          RNF-09: el cuerpo se pinta como texto plano por interpolación, nunca con
          v-html. Un mensaje con <script> se ve literal y no se ejecuta (CA-19).
        -->
        <p v-if="mensaje.cuerpo" class="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">{{ mensaje.cuerpo }}</p>

        <!--
          Imágenes: se ven, no se anuncian.

          La miniatura sale desde el primer instante —mientras sube, con la copia
          local del archivo— para que el adjunto no parezca llegar tarde ni
          desaparecido. La URL firmada caduca a los 15 min (RF-17).
        -->
        <ul v-if="imagenes.length" :class="['grid gap-1.5', mensaje.cuerpo ? 'mt-2' : '', imagenes.length > 1 ? 'grid-cols-2' : 'grid-cols-1']">
          <li v-for="imagen in imagenes" :key="imagen.id || imagen.ruta">
            <button
              type="button"
              :class="[
                'relative block w-full overflow-hidden rounded-xl transition touch-manipulation',
                esPropio ? 'bg-white/15' : 'bg-superficie-hundida',
              ]"
              :aria-label="`Ver ${imagen.nombre}`"
              @click="abrirAdjunto(imagen)"
            >
              <img
                v-if="fuente(imagen) && !rotas.has(claveAdjunto(imagen))"
                :src="fuente(imagen)"
                :alt="imagen.nombre"
                loading="lazy"
                decoding="async"
                :class="[
                  'w-full object-cover',
                  imagenes.length > 1 ? 'aspect-square' : 'max-h-64 min-h-[6rem]',
                  imagen._subiendo ? 'opacity-60' : '',
                ]"
                @error="marcarRota(imagen)"
              />
              <!-- Sin miniatura (HEIC en un navegador que no lo pinta, firma
                   caducada o archivo borrado): se cae a la fila de archivo. -->
              <span
                v-else
                :class="[
                  'flex min-h-[4.5rem] items-center gap-2 px-3 py-3 text-left text-xs',
                  esPropio ? 'text-white' : 'text-texto-medio',
                ]"
              >
                <PhotoIcon class="h-5 w-5 shrink-0" />
                <span class="min-w-0 flex-1 truncate">{{ imagen.nombre }}</span>
              </span>

              <span
                v-if="imagen._subiendo"
                class="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-black/45 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white"
              >
                <svg class="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando…
              </span>
            </button>
          </li>
        </ul>

        <!--
          Vídeos: el primer fotograma con un botón de reproducir encima; se ven
          en el visor, no aquí, para no meter varios reproductores con sonido en
          un hilo que se desplaza. El `#t=0.1` es lo que hace que Safari de iOS
          pinte ese fotograma: con solo `preload="metadata"` deja el cuadro negro.
        -->
        <ul v-if="videos.length" :class="['grid grid-cols-1 gap-1.5', mensaje.cuerpo || imagenes.length ? 'mt-2' : '']">
          <li v-for="video in videos" :key="video.id || video.ruta">
            <button
              type="button"
              class="relative block w-full overflow-hidden rounded-xl bg-black transition touch-manipulation"
              :aria-label="`Reproducir ${video.nombre}`"
              @click="abrirAdjunto(video)"
            >
              <video
                v-if="fuente(video) && !rotas.has(claveAdjunto(video))"
                :src="`${fuente(video)}#t=0.1`"
                muted
                playsinline
                preload="metadata"
                tabindex="-1"
                aria-hidden="true"
                :class="['pointer-events-none max-h-64 min-h-[8rem] w-full object-cover', video._subiendo ? 'opacity-60' : '']"
                @error="marcarRota(video)"
              />
              <span v-else class="flex min-h-[8rem] items-center gap-2 px-3 py-3 text-left text-xs text-white">
                <FilmIcon class="h-5 w-5 shrink-0" />
                <span class="min-w-0 flex-1 truncate">{{ video.nombre }}</span>
              </span>

              <span v-if="!video._subiendo" class="absolute inset-0 flex items-center justify-center">
                <span class="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white">
                  <PlayIcon class="ml-0.5 h-6 w-6" />
                </span>
              </span>
              <span class="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-black/45 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-white">
                <svg v-if="video._subiendo" class="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <FilmIcon v-else class="h-3.5 w-3.5" />
                {{ video._subiendo ? 'Enviando…' : formatearTamano(video.bytes) }}
              </span>
            </button>
          </li>
        </ul>

        <!-- Documentos: fila con nombre y tamaño; el visor decide si los abre
             dentro (texto, PDF en escritorio) o fuera. -->
        <ul v-if="documentos.length" :class="['space-y-1.5', mensaje.cuerpo || imagenes.length || videos.length ? 'mt-2' : '']">
          <li v-for="documento in documentos" :key="documento.id || documento.ruta">
            <button
              type="button"
              :class="[
                'flex min-h-[2.75rem] w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition touch-manipulation',
                esPropio ? 'bg-white/15 hover:bg-white/25' : 'bg-superficie-suave hover:bg-superficie-hundida border border-borde',
              ]"
              @click="abrirAdjunto(documento)"
            >
              <DocumentTextIcon v-if="esTexto(documento.mime)" class="h-4 w-4 shrink-0" />
              <PaperClipIcon v-else class="h-4 w-4 shrink-0" />
              <span class="min-w-0 flex-1 truncate">{{ documento.nombre }}</span>
              <span :class="['shrink-0 text-[0.6875rem]', esPropio ? 'text-white/70' : 'text-texto-suave']">
                {{ documento._subiendo ? 'Enviando…' : formatearTamano(documento.bytes) }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div :class="['mt-1 flex items-center gap-1.5 px-1', esPropio ? 'justify-end' : 'justify-start']">
        <span class="text-[0.6875rem] text-texto-suave">{{ hora }}</span>

        <!--
          Estado del envío (RF-04). Se distingue por FORMA además de por color:
          reloj, marca de verificación o triángulo de alerta.
        -->
        <template v-if="esPropio">
          <ClockIcon v-if="mensaje._estado === 'enviando'" class="h-3.5 w-3.5 text-texto-tenue" aria-label="Enviando" />
          <!-- Leído (solo panel del soporte): doble marca azul y la hora en que lo abrió -->
          <span
            v-else-if="mensaje._estado === 'enviado' && lectura"
            class="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-sky-600 oscuro:text-sky-300"
            :title="lectura.titulo"
          >
            <svg class="h-3.5 w-[1.1rem]" viewBox="0 0 28 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2 11l5 5L18 4" />
              <path d="M11 15l1 1L24 4" />
            </svg>
            {{ lectura.texto }}
          </span>
          <template v-else-if="mensaje._estado === 'enviado'">
            <CheckIcon class="h-3.5 w-3.5 text-texto-tenue" aria-label="Enviado" />
            <span v-if="mostrarLectura" class="text-[0.6875rem] text-texto-tenue">No leído</span>
          </template>
          <button
            v-else-if="mensaje._estado === 'fallido'"
            type="button"
            class="inline-flex min-h-[2.75rem] items-center gap-1 rounded-full bg-red-50 oscuro:bg-red-500/15 px-3 text-[0.6875rem] font-semibold text-red-700 oscuro:text-red-300 ring-1 ring-red-200 oscuro:ring-red-500/30 touch-manipulation"
            @click="$emit('reintentar', mensaje)"
          >
            <ExclamationTriangleIcon class="h-3.5 w-3.5" />
            Reintentar
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  ArrowUturnLeftIcon, CheckIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon, FilmIcon, PaperClipIcon, PhotoIcon, PlayIcon,
} from '@heroicons/vue/24/outline'
import { useSoporteStore } from '../../stores/soporte'
import { esImagen, esTexto, esVideo, formatearTamano } from '../../utils/adjuntosSoporte'
import { useVisorAdjunto } from '../../composables/useVisorAdjunto'
import { autorCita, resumenCita, sePuedeCitar } from '../../utils/citasSoporte'

const props = defineProps({
  mensaje: { type: Object, required: true },
  /** 'usuario' en la pantalla del usuario, 'soporte' en el panel */
  ladoPropio: { type: String, default: 'usuario' },
  /** Ver HiloMensajes: confirmación de lectura, solo para el soporte. */
  mostrarLectura: { type: Boolean, default: false },
  leidoHasta: { type: String, default: null },
  /** Mensaje citado (ver `crearCita`), resuelto por el hilo. */
  cita: { type: Object, default: null },
  /** Se acaba de saltar a este mensaje desde una cita: se resalta un momento. */
  destacado: { type: Boolean, default: false },
  /** Falso donde no se puede responder (conversación archivada, por ejemplo). */
  permiteCitar: { type: Boolean, default: true },
})

const emit = defineEmits(['reintentar', 'responder', 'ir-a-cita'])

const soporte = useSoporteStore()
// El visor vive montado una sola vez en el layout: aquí solo se pide abrirlo.
const { abrirAdjunto: mostrarEnVisor } = useVisorAdjunto()
const firmadas = ref({})          // ruta -> URL firmada de la miniatura
const rotas = ref(new Set())      // adjuntos que el navegador no supo pintar

const esPropio = computed(() => props.mensaje.autor === props.ladoPropio)
const citable = computed(() => props.permiteCitar && sePuedeCitar(props.mensaje))

// ---- Deslizar para citar ------------------------------------------------
//
// Como en los chats de móvil: se arrastra la burbuja hacia la derecha y, al
// soltarla pasado el umbral, queda citada en el redactor. Hasta el umbral sigue
// al dedo; después ofrece resistencia, para que se note que ya no hace falta
// seguir.

const UMBRAL_CITAR = 56
const ARRASTRE_MAXIMO = 80

const desplazamiento = ref(0)
const arrastrando = ref(false)
let inicioX = 0
let inicioY = 0
let direccion = null   // null hasta decidir; luego 'horizontal' o 'vertical'

const listoParaCitar = computed(() => desplazamiento.value >= UMBRAL_CITAR)

const estiloArrastre = computed(() => ({
  transform: desplazamiento.value ? `translate3d(${desplazamiento.value}px, 0, 0)` : undefined,
  transition: arrastrando.value ? 'none' : 'transform 0.2s ease',
}))

const estiloFlecha = computed(() => {
  const progreso = Math.min(desplazamiento.value / UMBRAL_CITAR, 1)
  return {
    opacity: progreso,
    transform: `translate3d(0, -50%, 0) scale(${0.6 + progreso * 0.4})`,
  }
})

function alEmpezarToque(evento) {
  if (!citable.value || evento.touches.length !== 1) return
  inicioX = evento.touches[0].clientX
  inicioY = evento.touches[0].clientY
  direccion = null
}

function alMoverToque(evento) {
  if (!citable.value || direccion === 'vertical' || evento.touches.length !== 1) return
  const dx = evento.touches[0].clientX - inicioX
  const dy = evento.touches[0].clientY - inicioY

  // Se decide una vez, con algo de margen: un desplazamiento vertical que se
  // tuerce un poco no debe convertirse en cita.
  if (direccion === null) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    direccion = dx > 0 && Math.abs(dx) > Math.abs(dy) * 1.5 ? 'horizontal' : 'vertical'
    if (direccion === 'vertical') return
  }

  arrastrando.value = true
  const antes = listoParaCitar.value
  const avance = Math.max(0, dx)
  desplazamiento.value = avance <= UMBRAL_CITAR
    ? avance
    : Math.min(ARRASTRE_MAXIMO, UMBRAL_CITAR + (avance - UMBRAL_CITAR) * 0.3)
  // Un toque de vibración al cruzar el umbral. iOS no tiene `vibrate`: allí la
  // señal es solo la flecha, que se rellena.
  if (!antes && listoParaCitar.value) navigator.vibrate?.(10)
}

function alSoltarToque() {
  const citar = arrastrando.value && listoParaCitar.value
  cancelarArrastre()
  if (citar) emit('responder', props.mensaje)
}

function cancelarArrastre() {
  arrastrando.value = false
  desplazamiento.value = 0
  direccion = null
}

/**
 * { texto, titulo } si el usuario ya leyó este mensaje; null si no.
 * Con `leido_at` se muestra la hora exacta. Los mensajes anteriores a la
 * migración 056 no la tienen: si son de antes de la última lectura, se dan por
 * leídos sin hora, porque no se sabe cuándo fue.
 */
const lectura = computed(() => {
  if (!props.mostrarLectura || props.mensaje.autor !== 'soporte') return null
  if (props.mensaje.leido_at) {
    const fecha = new Date(props.mensaje.leido_at)
    if (Number.isNaN(fecha.getTime())) return null
    const horaLectura = fecha.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
    const mismoDia = fecha.toDateString() === new Date(props.mensaje.created_at).toDateString()
    const texto = mismoDia
      ? `Leído ${horaLectura}`
      : `Leído ${fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} ${horaLectura}`
    return { texto, titulo: `Leído el ${fecha.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}` }
  }
  if (props.leidoHasta && new Date(props.mensaje.created_at) <= new Date(props.leidoHasta)) {
    return { texto: 'Leído', titulo: 'Leído (mensaje anterior al registro de la hora de lectura)' }
  }
  return null
})
const adjuntos = computed(() => props.mensaje.soporte_adjuntos ?? [])
const imagenes = computed(() => adjuntos.value.filter((a) => esImagen(a.mime)))
const videos = computed(() => adjuntos.value.filter((a) => esVideo(a.mime)))
const documentos = computed(() => adjuntos.value.filter((a) => !esImagen(a.mime) && !esVideo(a.mime)))

const hora = computed(() => {
  const fecha = new Date(props.mensaje.created_at)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
})

function claveAdjunto(adjunto) {
  return adjunto.ruta || adjunto.id || adjunto.nombre
}

/*
 * La firmada manda en cuanto está; la copia local es el respaldo mientras sube y
 * durante los segundos que tarda en llegar la firma. En ese orden, y no al
 * revés: la local se revoca poco después de confirmarse el envío.
 */
function fuente(imagen) {
  return firmadas.value[imagen.ruta] || imagen._previsualizacion || ''
}

function marcarRota(imagen) {
  const siguiente = new Set(rotas.value)
  siguiente.add(claveAdjunto(imagen))
  rotas.value = siguiente
}

/*
 * Las firmas de todas las imágenes del mensaje se piden en una sola llamada, no
 * una por miniatura, y el store las cachea mientras duran.
 *
 * Los vídeos la piden aunque tengan copia local: el store la revoca a los 15 s
 * de enviarse, y una foto ya pintada sobrevive a eso, pero un vídeo que se
 * reproduce después vuelve a leer su origen y se encontraría la URL muerta.
 */
watch([imagenes, videos], async ([listaImagenes, listaVideos]) => {
  const rutas = [
    ...listaImagenes.filter((a) => a.ruta && !a._previsualizacion),
    ...listaVideos.filter((a) => a.ruta),
  ].map((a) => a.ruta)
  if (!rutas.length) return
  const nuevas = await soporte.urlesFirmadas(rutas)
  firmadas.value = { ...firmadas.value, ...nuevas }
}, { immediate: true, deep: true })

function abrirAdjunto(adjunto) {
  // Un adjunto a medio subir no tiene nada que enseñar todavía salvo su propia
  // copia local, que ya se está viendo en la burbuja.
  if (adjunto._subiendo && !adjunto._previsualizacion) return
  // Se le pasa también la firma ya resuelta: el visor no tiene por qué volver a
  // pedirla para una miniatura que acaba de mostrarse aquí.
  mostrarEnVisor({ ...adjunto, _urlFirmada: firmadas.value[adjunto.ruta] || null })
}
</script>

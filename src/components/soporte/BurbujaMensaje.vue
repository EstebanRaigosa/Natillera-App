<template>
  <div :class="['flex w-full', esPropio ? 'justify-end' : 'justify-start']">
    <div class="max-w-[85%] sm:max-w-[75%]">
      <div
        :class="[
          'rounded-2xl px-4 py-2.5 shadow-sm',
          esPropio
            ? 'bg-[#1B5E37] text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md',
        ]"
      >
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
                esPropio ? 'bg-white/15' : 'bg-gray-100',
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
                  esPropio ? 'text-white' : 'text-gray-700',
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

        <!-- Documentos: fila con nombre y tamaño; el visor decide si los abre
             dentro (texto, PDF en escritorio) o fuera. -->
        <ul v-if="documentos.length" :class="['space-y-1.5', mensaje.cuerpo || imagenes.length ? 'mt-2' : '']">
          <li v-for="documento in documentos" :key="documento.id || documento.ruta">
            <button
              type="button"
              :class="[
                'flex min-h-[2.75rem] w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition touch-manipulation',
                esPropio ? 'bg-white/15 hover:bg-white/25' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
              ]"
              @click="abrirAdjunto(documento)"
            >
              <DocumentTextIcon v-if="esTexto(documento.mime)" class="h-4 w-4 shrink-0" />
              <PaperClipIcon v-else class="h-4 w-4 shrink-0" />
              <span class="min-w-0 flex-1 truncate">{{ documento.nombre }}</span>
              <span :class="['shrink-0 text-[0.6875rem]', esPropio ? 'text-white/70' : 'text-gray-500']">
                {{ documento._subiendo ? 'Enviando…' : formatearTamano(documento.bytes) }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div :class="['mt-1 flex items-center gap-1.5 px-1', esPropio ? 'justify-end' : 'justify-start']">
        <span class="text-[0.6875rem] text-gray-500">{{ hora }}</span>

        <!--
          Estado del envío (RF-04). Se distingue por FORMA además de por color:
          reloj, marca de verificación o triángulo de alerta.
        -->
        <template v-if="esPropio">
          <ClockIcon v-if="mensaje._estado === 'enviando'" class="h-3.5 w-3.5 text-gray-400" aria-label="Enviando" />
          <CheckIcon v-else-if="mensaje._estado === 'enviado'" class="h-3.5 w-3.5 text-gray-400" aria-label="Enviado" />
          <button
            v-else-if="mensaje._estado === 'fallido'"
            type="button"
            class="inline-flex min-h-[2.75rem] items-center gap-1 rounded-full bg-red-50 px-3 text-[0.6875rem] font-semibold text-red-700 ring-1 ring-red-200 touch-manipulation"
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
  CheckIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon, PaperClipIcon, PhotoIcon,
} from '@heroicons/vue/24/outline'
import { useSoporteStore } from '../../stores/soporte'
import { esImagen, esTexto, formatearTamano } from '../../utils/adjuntosSoporte'
import { useVisorAdjunto } from '../../composables/useVisorAdjunto'

const props = defineProps({
  mensaje: { type: Object, required: true },
  /** 'usuario' en la pantalla del usuario, 'soporte' en el panel */
  ladoPropio: { type: String, default: 'usuario' },
})

defineEmits(['reintentar'])

const soporte = useSoporteStore()
// El visor vive montado una sola vez en el layout: aquí solo se pide abrirlo.
const { abrirAdjunto: mostrarEnVisor } = useVisorAdjunto()
const firmadas = ref({})          // ruta -> URL firmada de la miniatura
const rotas = ref(new Set())      // adjuntos que el navegador no supo pintar

const esPropio = computed(() => props.mensaje.autor === props.ladoPropio)
const adjuntos = computed(() => props.mensaje.soporte_adjuntos ?? [])
const imagenes = computed(() => adjuntos.value.filter((a) => esImagen(a.mime)))
const documentos = computed(() => adjuntos.value.filter((a) => !esImagen(a.mime)))

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
 */
watch(imagenes, async (lista) => {
  const rutas = lista.filter((a) => a.ruta && !a._previsualizacion).map((a) => a.ruta)
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

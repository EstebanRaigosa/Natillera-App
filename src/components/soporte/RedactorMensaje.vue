<template>
  <div
    class="flex-shrink-0 border-t border-gray-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
  >
    <!--
      Solo lectura: se explica el motivo en lugar de dejar un campo muerto
      (RN-08). `textoAccion` ofrece la salida que sí existe —abrir otra
      conversación—, porque desde RN-06 un hilo cerrado no se retoma escribiendo
      en él: un campo bloqueado sin alternativa deja al usuario sin saber qué
      hacer con lo que venía a contar.
    -->
    <div v-if="bloqueado" class="rounded-xl bg-gray-50 px-3 py-3 ring-1 ring-gray-200">
      <div class="flex items-start gap-2 text-xs text-gray-600">
        <LockClosedIcon class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p class="min-w-0 flex-1">{{ motivoBloqueo }}</p>
      </div>
      <button
        v-if="textoAccion"
        type="button"
        class="mt-2.5 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border border-[#1B5E37] px-4 text-sm font-semibold text-[#1B5E37] transition hover:bg-[#1B5E37]/5 touch-manipulation sm:w-auto"
        @click="$emit('accion')"
      >
        <PlusIcon class="mr-1.5 h-4 w-4" />
        {{ textoAccion }}
      </button>
    </div>

    <template v-else>
      <!-- Sin conexión: se avisa antes de escribir, no después de fallar -->
      <div v-if="sinConexion" class="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
        <ExclamationTriangleIcon class="h-4 w-4 shrink-0" />
        <span>Sin conexión. Lo que escribas se enviará solo cuando vuelva la red.</span>
      </div>

      <!--
        Adjuntos elegidos, antes de subir. Las imágenes se ven: comprobar de un
        vistazo que la captura es la correcta evita el mensaje de después
        («perdón, era la otra pantalla»).
      -->
      <ul v-if="archivos.length" class="mb-2 flex flex-wrap gap-2">
        <li
          v-for="(elegido, indice) in archivos"
          :key="`${elegido.archivo.name}-${indice}`"
          class="relative"
        >
          <div
            v-if="elegido.previa"
            class="relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-gray-200"
          >
            <img
              :src="elegido.previa"
              :alt="elegido.archivo.name"
              :class="['h-full w-full object-cover', elegido.preparando ? 'opacity-60' : '']"
            />
            <span
              v-if="elegido.preparando"
              class="absolute inset-0 flex items-center justify-center bg-black/25"
              aria-label="Preparando el archivo"
            >
              <svg class="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          </div>
          <div
            v-else
            class="flex h-16 max-w-[10rem] items-center gap-1.5 rounded-xl bg-gray-100 px-2.5 text-xs text-gray-700 ring-1 ring-gray-200"
          >
            <PaperClipIcon class="h-4 w-4 shrink-0 text-gray-500" />
            <span class="min-w-0 flex-1 truncate">{{ elegido.archivo.name }}</span>
          </div>

          <!-- Botón de quitar: área táctil de 44 px lograda con un padding
               transparente; el círculo visible es más pequeño para no tapar la
               miniatura. -->
          <button
            type="button"
            class="absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center text-gray-500 touch-manipulation"
            :aria-label="`Quitar ${elegido.archivo.name}`"
            @click="quitarArchivo(indice)"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 transition hover:bg-gray-100">
              <XMarkIcon class="h-3.5 w-3.5" />
            </span>
          </button>
        </li>
      </ul>

      <div class="flex items-end gap-2">
        <button
          v-if="permiteAdjuntos"
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 disabled:opacity-40 touch-manipulation"
          aria-label="Adjuntar archivo"
          :disabled="enviando || archivos.length >= MAX_ADJUNTOS"
          @click="entradaArchivos?.click()"
        >
          <PaperClipIcon class="h-5 w-5" />
        </button>

        <input
          ref="entradaArchivos"
          type="file"
          class="hidden"
          multiple
          :accept="MIMES_ADMITIDOS.join(',')"
          @change="elegirArchivos"
        />

        <!--
          text-base (16 px) es obligatorio: con menos, iOS hace zoom al enfocar el
          campo y deja la pantalla descolocada (RNF-02).
        -->
        <textarea
          ref="campo"
          :value="modelValue"
          rows="1"
          :maxlength="MAX_CUERPO"
          :placeholder="marcador"
          class="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-base leading-snug text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1B5E37] focus:ring-2 focus:ring-[#1B5E37]/30"
          :disabled="enviando"
          @input="alEscribir"
          @keydown.enter.exact.prevent="intentarEnviar"
        />

        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1B5E37] text-white shadow-sm transition hover:bg-[#155a32] disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
          aria-label="Enviar mensaje"
          :disabled="!puedeEnviar"
          @click="intentarEnviar"
        >
          <PaperAirplaneIcon v-if="!enviando" class="h-5 w-5" />
          <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </button>
      </div>

      <p v-if="cercaDelLimite" class="mt-1 px-1 text-right text-[0.6875rem] text-gray-500">
        {{ modelValue.length }} / {{ MAX_CUERPO }}
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  ExclamationTriangleIcon, LockClosedIcon, PaperAirplaneIcon,
  PaperClipIcon, PlusIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import { MAX_ADJUNTOS, MIMES_ADMITIDOS, useSoporteStore } from '../../stores/soporte'
import { comprimirImagen, crearVistaPrevia, esImagen, revocarVistasPrevias } from '../../utils/adjuntosSoporte'
import { useNotificationStore } from '../../stores/notifications'

const MAX_CUERPO = 4000

const props = defineProps({
  modelValue: { type: String, default: '' },
  enviando: { type: Boolean, default: false },
  bloqueado: { type: Boolean, default: false },
  motivoBloqueo: { type: String, default: 'Esta conversación está archivada y no admite mensajes nuevos.' },
  /** Si viene informado, se ofrece una salida bajo el motivo del bloqueo. */
  textoAccion: { type: String, default: '' },
  permiteAdjuntos: { type: Boolean, default: true },
  marcador: { type: String, default: 'Escribe tu mensaje…' },
  minimo: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue', 'enviar', 'accion'])

const soporte = useSoporteStore()
const notificaciones = useNotificationStore()

const campo = ref(null)
const entradaArchivos = ref(null)
const archivos = ref([])   // { archivo: File, previa: string|null }

const sinConexion = ref(typeof navigator !== 'undefined' && navigator.onLine === false)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { sinConexion.value = false })
  window.addEventListener('offline', () => { sinConexion.value = true })
}

const preparandoAdjuntos = computed(() => archivos.value.some((a) => a.preparando))

const puedeEnviar = computed(() =>
  !props.enviando
  && !preparandoAdjuntos.value
  && props.modelValue.trim().length >= props.minimo)

const cercaDelLimite = computed(() => props.modelValue.length > MAX_CUERPO - 200)

function alEscribir(evento) {
  emit('update:modelValue', evento.target.value)
  // El campo crece con el texto hasta el máximo de la clase (max-h-32).
  const el = evento.target
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

/*
 * El archivo se prepara al elegirlo, no al enviarlo.
 *
 * Comprimir en el momento del envío dejaba el mensaje escrito esperando a que
 * una foto de varios megas se encogiera y subiera. Haciéndolo aquí, mientras el
 * usuario todavía está escribiendo, al pulsar enviar el archivo ya está listo y
 * el envío es inmediato. De paso, el límite de 5 MB se mide sobre lo que de
 * verdad va a viajar.
 */
function elegirArchivos(evento) {
  const elegidos = Array.from(evento.target.files ?? [])
  evento.target.value = ''

  for (const archivo of elegidos) {
    if (archivos.value.length >= MAX_ADJUNTOS) {
      notificaciones.alerta(`Puedes adjuntar hasta ${MAX_ADJUNTOS} archivos por mensaje.`)
      break
    }
    // El tipo se comprueba antes de nada, indicando el motivo (caso borde 8).
    const problema = soporte.validarTipoArchivo(archivo)
    if (problema) {
      notificaciones.alerta(problema)
      continue
    }

    const entrada = { archivo, previa: crearVistaPrevia(archivo), preparando: esImagen(archivo.type) }
    archivos.value.push(entrada)

    if (entrada.preparando) prepararImagen(entrada)
    else rechazarSiPesaDemasiado(entrada)
  }
}

async function prepararImagen(entrada) {
  try {
    const listo = await comprimirImagen(entrada.archivo)
    // El usuario pudo quitarlo mientras se comprimía.
    if (!archivos.value.includes(entrada)) return
    entrada.archivo = listo
  } finally {
    entrada.preparando = false
    rechazarSiPesaDemasiado(entrada)
  }
}

function rechazarSiPesaDemasiado(entrada) {
  const problema = soporte.validarTamanoArchivo(entrada.archivo)
  if (!problema) return
  const indice = archivos.value.indexOf(entrada)
  if (indice >= 0) quitarArchivo(indice)
  notificaciones.alerta(problema)
}

function quitarArchivo(indice) {
  const [fuera] = archivos.value.splice(indice, 1)
  revocarVistasPrevias([fuera?.previa])
}

function soltarVistasPrevias() {
  revocarVistasPrevias(archivos.value.map((a) => a.previa))
}

// Las miniaturas son objetos en memoria del navegador: si no se sueltan, se
// quedan hasta recargar la página.
onBeforeUnmount(soltarVistasPrevias)

/*
 * Al enviar, el campo se deshabilita y el navegador le quita el foco; cuando se
 * vuelve a habilitar, el foco no regresa solo. Escribiendo con el teclado eso
 * corta la conversación: cada mensaje obliga a volver a pinchar en el campo.
 *
 * Se recuerda si el campo tenía el foco en el momento de enviar y se le
 * devuelve al terminar. Así distinguimos los dos gestos sin adivinar: con Enter
 * el foco estaba en el campo y vuelve; pulsando el botón de enviar el foco
 * estaba en el botón, y ahí no lo robamos.
 */
let teniaFoco = false

function intentarEnviar() {
  if (!puedeEnviar.value) return
  teniaFoco = typeof document !== 'undefined' && document.activeElement === campo.value
  emit('enviar', { cuerpo: props.modelValue.trim(), archivos: archivos.value.map((a) => a.archivo) })
}

watch(() => props.enviando, (enviandoAhora, enviandoAntes) => {
  if (!enviandoAntes || enviandoAhora || !teniaFoco) return
  teniaFoco = false
  // nextTick: hay que esperar a que `disabled` desaparezca del DOM, o el focus()
  // se pierde. Vale igual cuando el envío falla y el texto vuelve al campo.
  nextTick(() => campo.value?.focus())
})

/** El padre la llama cuando el envío se confirma: el texto solo se borra entonces. */
function limpiar() {
  // Las vistas previas locales ya no hacen falta: el hilo pinta las suyas con
  // el mensaje recién enviado.
  soltarVistasPrevias()
  archivos.value = []
  if (campo.value) campo.value.style.height = 'auto'
}

function enfocar() {
  campo.value?.focus()
}

defineExpose({ limpiar, enfocar })
</script>

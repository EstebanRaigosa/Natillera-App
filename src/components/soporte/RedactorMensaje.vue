<template>
  <div
    class="flex-shrink-0 border-t border-gray-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
  >
    <!--
      Solo lectura: se explica el motivo en lugar de dejar un campo muerto
      (RN-08). Cuando `textoDesbloqueo` viene informado, el bloqueo es
      reversible por el propio usuario: es el caso de una conversación resuelta,
      que RN-06 permite retomar escribiendo en ella.
    -->
    <div v-if="bloqueado" class="rounded-xl bg-gray-50 px-3 py-3 ring-1 ring-gray-200">
      <div class="flex items-start gap-2 text-xs text-gray-600">
        <LockClosedIcon class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p class="min-w-0 flex-1">{{ motivoBloqueo }}</p>
      </div>
      <button
        v-if="textoDesbloqueo"
        type="button"
        class="mt-2.5 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border border-[#1B5E37] px-4 text-sm font-semibold text-[#1B5E37] transition hover:bg-[#1B5E37]/5 touch-manipulation sm:w-auto"
        @click="$emit('desbloquear')"
      >
        <ArrowUturnLeftIcon class="mr-1.5 h-4 w-4" />
        {{ textoDesbloqueo }}
      </button>
    </div>

    <template v-else>
      <!-- Sin conexión: se avisa antes de escribir, no después de fallar -->
      <div v-if="sinConexion" class="mb-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
        <ExclamationTriangleIcon class="h-4 w-4 shrink-0" />
        <span>Sin conexión. Lo que escribas se enviará solo cuando vuelva la red.</span>
      </div>

      <!-- Adjuntos elegidos, antes de subir -->
      <ul v-if="archivos.length" class="mb-2 flex flex-wrap gap-1.5">
        <li
          v-for="(archivo, indice) in archivos"
          :key="`${archivo.name}-${indice}`"
          class="inline-flex max-w-full items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2.5 pr-1 text-xs text-gray-700 ring-1 ring-gray-200"
        >
          <PaperClipIcon class="h-3.5 w-3.5 shrink-0 text-gray-500" />
          <span class="min-w-0 truncate">{{ archivo.name }}</span>
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-200 touch-manipulation"
            :aria-label="`Quitar ${archivo.name}`"
            @click="quitarArchivo(indice)"
          >
            <XMarkIcon class="h-3.5 w-3.5" />
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
import { computed, nextTick, ref, watch } from 'vue'
import {
  ArrowUturnLeftIcon, ExclamationTriangleIcon, LockClosedIcon, PaperAirplaneIcon,
  PaperClipIcon, XMarkIcon,
} from '@heroicons/vue/24/outline'
import { MAX_ADJUNTOS, MIMES_ADMITIDOS, useSoporteStore } from '../../stores/soporte'
import { useNotificationStore } from '../../stores/notifications'

const MAX_CUERPO = 4000

const props = defineProps({
  modelValue: { type: String, default: '' },
  enviando: { type: Boolean, default: false },
  bloqueado: { type: Boolean, default: false },
  motivoBloqueo: { type: String, default: 'Esta conversación está archivada y no admite mensajes nuevos.' },
  /** Si viene informado, el bloqueo se puede levantar desde aquí. */
  textoDesbloqueo: { type: String, default: '' },
  permiteAdjuntos: { type: Boolean, default: true },
  marcador: { type: String, default: 'Escribe tu mensaje…' },
  minimo: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue', 'enviar', 'desbloquear'])

const soporte = useSoporteStore()
const notificaciones = useNotificationStore()

const campo = ref(null)
const entradaArchivos = ref(null)
const archivos = ref([])

const sinConexion = ref(typeof navigator !== 'undefined' && navigator.onLine === false)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { sinConexion.value = false })
  window.addEventListener('offline', () => { sinConexion.value = true })
}

const puedeEnviar = computed(() =>
  !props.enviando && props.modelValue.trim().length >= props.minimo)

const cercaDelLimite = computed(() => props.modelValue.length > MAX_CUERPO - 200)

function alEscribir(evento) {
  emit('update:modelValue', evento.target.value)
  // El campo crece con el texto hasta el máximo de la clase (max-h-32).
  const el = evento.target
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function elegirArchivos(evento) {
  const elegidos = Array.from(evento.target.files ?? [])
  evento.target.value = ''

  for (const archivo of elegidos) {
    if (archivos.value.length >= MAX_ADJUNTOS) {
      notificaciones.alerta(`Puedes adjuntar hasta ${MAX_ADJUNTOS} archivos por mensaje.`)
      break
    }
    // Se valida antes de subir nada, indicando el motivo (caso borde 8).
    const problema = soporte.validarArchivo(archivo)
    if (problema) {
      notificaciones.alerta(problema)
      continue
    }
    archivos.value.push(archivo)
  }
}

function quitarArchivo(indice) {
  archivos.value.splice(indice, 1)
}

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
  emit('enviar', { cuerpo: props.modelValue.trim(), archivos: [...archivos.value] })
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
  archivos.value = []
  if (campo.value) campo.value.style.height = 'auto'
}

function enfocar() {
  campo.value?.focus()
}

defineExpose({ limpiar, enfocar })
</script>

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
        <p class="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">{{ mensaje.cuerpo }}</p>

        <!-- Adjuntos: la URL se firma al pulsar y caduca a los 15 min (RF-17) -->
        <ul v-if="adjuntos.length" class="mt-2 space-y-1.5">
          <li v-for="adjunto in adjuntos" :key="adjunto.id || adjunto.ruta">
            <button
              type="button"
              :class="[
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition touch-manipulation',
                esPropio ? 'bg-white/15 hover:bg-white/25' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200',
              ]"
              :disabled="abriendo === adjunto.ruta"
              @click="abrirAdjunto(adjunto)"
            >
              <PaperClipIcon class="h-4 w-4 shrink-0" />
              <span class="min-w-0 flex-1 truncate">{{ adjunto.nombre }}</span>
              <span :class="['shrink-0 text-[0.6875rem]', esPropio ? 'text-white/70' : 'text-gray-500']">
                {{ abriendo === adjunto.ruta ? 'Abriendo…' : formatearTamano(adjunto.bytes) }}
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
import { computed, ref } from 'vue'
import { CheckIcon, ClockIcon, ExclamationTriangleIcon, PaperClipIcon } from '@heroicons/vue/24/outline'
import { useSoporteStore } from '../../stores/soporte'
import { useNotificationStore } from '../../stores/notifications'

const props = defineProps({
  mensaje: { type: Object, required: true },
  /** 'usuario' en la pantalla del usuario, 'soporte' en el panel */
  ladoPropio: { type: String, default: 'usuario' },
})

defineEmits(['reintentar'])

const soporte = useSoporteStore()
const notificaciones = useNotificationStore()
const abriendo = ref(null)

const esPropio = computed(() => props.mensaje.autor === props.ladoPropio)
const adjuntos = computed(() => props.mensaje.soporte_adjuntos ?? [])

const hora = computed(() => {
  const fecha = new Date(props.mensaje.created_at)
  if (Number.isNaN(fecha.getTime())) return ''
  return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
})

function formatearTamano(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function abrirAdjunto(adjunto) {
  abriendo.value = adjunto.ruta
  try {
    const url = await soporte.urlFirmada(adjunto.ruta)
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch {
    notificaciones.critica('No se pudo abrir el archivo. Puede que ya no exista.')
  } finally {
    abriendo.value = null
  }
}
</script>

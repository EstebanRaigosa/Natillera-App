<template>
  <div
    ref="contenedor"
    class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-[#F6F7F5] px-4 py-4"
    @scroll.passive="alDesplazar"
  >
    <!-- Carga inicial: esqueleto de burbujas -->
    <div v-if="cargandoInicial" class="space-y-3" aria-hidden="true">
      <div v-for="n in 4" :key="n" :class="['flex', n % 2 === 0 ? 'justify-end' : 'justify-start']">
        <div
          :class="[
            'h-16 animate-pulse rounded-2xl bg-gray-200',
            n % 2 === 0 ? 'w-3/5 rounded-br-md' : 'w-2/3 rounded-bl-md',
          ]"
        />
      </div>
    </div>

    <template v-else>
      <!-- Paginación hacia atrás: nunca se trae la conversación entera (RNF-04) -->
      <div v-if="hayMasAntiguos" class="mb-4 flex justify-center">
        <button
          type="button"
          class="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 touch-manipulation"
          :disabled="cargandoAntiguos"
          @click="$emit('cargar-antiguos')"
        >
          {{ cargandoAntiguos ? 'Cargando…' : 'Ver mensajes anteriores' }}
        </button>
      </div>

      <div class="space-y-3">
        <template v-for="(mensaje, indice) in mensajes" :key="mensaje.id || mensaje.client_id">
          <div v-if="mostrarFecha(indice)" class="flex justify-center py-1">
            <span class="rounded-full bg-white px-3 py-1 text-[0.6875rem] font-medium text-gray-500 shadow-sm">
              {{ etiquetaFecha(mensaje.created_at) }}
            </span>
          </div>
          <BurbujaMensaje
            :mensaje="mensaje"
            :lado-propio="ladoPropio"
            @reintentar="$emit('reintentar', $event)"
          />
        </template>
      </div>

      <!--
        Acuse de recibo. Va marcado como automático y con una forma distinta a
        las burbujas: ni sale a la izquierda como el soporte ni a la derecha
        como el usuario. Que se note que todavía no ha contestado nadie es parte
        de la información, no un adorno.
      -->
      <div v-if="acuse" class="mt-3 flex justify-center px-2">
        <div class="max-w-[85%] rounded-2xl bg-[#E8F5E9] px-4 py-2.5 text-center ring-1 ring-[#1B5E37]/12">
          <p class="flex items-center justify-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-[#1B5E37]/70">
            <SparklesIcon class="h-3.5 w-3.5" />
            Respuesta automática
          </p>
          <p class="mt-1 text-sm leading-relaxed text-gray-700">{{ acuse }}</p>
        </div>
      </div>

      <div v-if="!mensajes.length" class="flex h-full items-center justify-center">
        <p class="text-sm text-gray-500">Aún no hay mensajes en esta conversación.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import BurbujaMensaje from './BurbujaMensaje.vue'

const props = defineProps({
  /** Conversación que se está mostrando: al cambiar, el hilo baja al final. */
  conversacionId: { type: String, default: null },
  mensajes: { type: Array, default: () => [] },
  ladoPropio: { type: String, default: 'usuario' },
  cargandoInicial: { type: Boolean, default: false },
  cargandoAntiguos: { type: Boolean, default: false },
  hayMasAntiguos: { type: Boolean, default: false },
  /** Acuse a mostrar al final del hilo mientras nadie del soporte ha escrito. */
  acuse: { type: String, default: '' },
})

defineEmits(['cargar-antiguos', 'reintentar'])

const contenedor = ref(null)
// Si el usuario ha subido a leer mensajes viejos, un mensaje nuevo no debe
// arrastrarle al final de golpe.
const pegadoAbajo = ref(true)

function alDesplazar() {
  const el = contenedor.value
  if (!el) return
  pegadoAbajo.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

async function irAlFinal(forzar = false) {
  if (!forzar && !pegadoAbajo.value) return
  // Dos ciclos: el primero aplica los mensajes al DOM y el segundo espera a que
  // el navegador calcule su altura. Con uno solo, `scrollHeight` todavía es el
  // de antes y el hilo se queda a medio camino.
  await nextTick()
  await nextTick()
  const el = contenedor.value
  if (!el) return
  el.scrollTop = el.scrollHeight
  pegadoAbajo.value = true
}

watch(() => props.mensajes.length, () => { irAlFinal() })
watch(() => props.acuse, () => { irAlFinal() })
watch(() => props.cargandoInicial, (cargando) => { if (!cargando) irAlFinal(true) })

/*
 * Al abrir una conversación hay que ver lo último, que es lo que se acaba de
 * decir. No basta con reaccionar a que lleguen mensajes: el componente no se
 * remonta al cambiar de hilo, así que si vienes de otra conversación en la que
 * habías subido a leer, `pegadoAbajo` seguiría en false; y si el hilo ya estaba
 * en memoria, la lista ni siquiera cambia de longitud y no se dispara nada.
 */
watch(() => props.conversacionId, (id) => {
  if (!id) return
  pegadoAbajo.value = true
  irAlFinal(true)
}, { immediate: true })

function mismaFecha(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function mostrarFecha(indice) {
  if (indice === 0) return true
  return !mismaFecha(props.mensajes[indice].created_at, props.mensajes[indice - 1].created_at)
}

function etiquetaFecha(iso) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)

  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy'
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer'
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

defineExpose({ irAlFinal })
</script>

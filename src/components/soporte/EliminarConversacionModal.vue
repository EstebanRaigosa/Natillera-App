<template>
  <!--
    Borrado de una conversación (RF-19). Es irreversible y arrastra mensajes y
    adjuntos, así que exige teclear el número: un clic de más no basta.
    Patrón de la skill natillerapp-modals; el cuerpo es corto y no desborda en
    ninguna pantalla soportada, así que no lleva natiscroll.
  -->
  <ModalWrapper
    :show="!!conversacion"
    :z-index="70"
    align="bottom"
    :persistent="borrando"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera móvil = fila -->
    <div class="flex-shrink-0 bg-red-700 text-white sm:hidden">
      <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <TrashIcon class="h-5 w-5 text-red-700" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight text-white">Eliminar conversación</h3>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">Esta acción no se puede deshacer</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Cabecera desktop = icono arriba + textos centrados -->
    <div class="hidden sm:block flex-shrink-0 bg-red-700 text-white">
      <div class="flex items-start px-3 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div class="w-11 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <TrashIcon class="h-6 w-6 text-red-700" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">Eliminar conversación</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">Esta acción no se puede deshacer</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="flex-1 min-h-0 space-y-4 overflow-y-auto bg-white px-5 pb-5 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch]">
      <p class="text-sm leading-relaxed text-gray-700">
        Se borrarán el hilo de <span class="font-semibold text-gray-900">{{ conversacion?.user_email }}</span>,
        todos sus mensajes y sus archivos adjuntos.
      </p>

      <div>
        <label for="soporte-confirmar-numero" class="mb-1.5 block text-sm font-semibold text-gray-800">
          Escribe <span class="font-mono text-red-700">{{ codigo }}</span> para confirmar
        </label>
        <input
          id="soporte-confirmar-numero"
          v-model="confirmacion"
          type="text"
          autocapitalize="characters"
          autocomplete="off"
          class="w-full rounded-xl border-2 border-gray-200 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/30"
          :disabled="borrando"
        />
      </div>
    </div>

    <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div class="flex gap-3">
        <button type="button" class="btn-modal-secondary flex-1" :disabled="borrando" @click="cerrar">
          Cancelar
        </button>
        <!-- Acción destructiva: rojo, no el verde de marca -->
        <button
          type="button"
          class="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!puedeBorrar"
          @click="$emit('confirmar')"
        >
          {{ borrando ? 'Eliminando…' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import { codigoConversacion } from '../../stores/soporte'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'

const props = defineProps({
  conversacion: { type: Object, default: null },
  borrando: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirmar'])

const abierta = computed(() => !!props.conversacion)
useBodyScrollLock(abierta)

const confirmacion = ref('')
watch(abierta, (visible) => { if (visible) confirmacion.value = '' })

const codigo = computed(() => codigoConversacion(props.conversacion?.numero))

// Se acepta con o sin el prefijo «NT-» y sin distinguir mayúsculas: la
// confirmación existe para obligar a mirar el código, no para pelearse con él.
const puedeBorrar = computed(() => {
  if (props.borrando) return false
  const escrito = confirmacion.value.trim().toUpperCase().replace(/^NT-/, '')
  return escrito !== '' && escrito === codigo.value.replace(/^NT-/, '')
})

function cerrar() {
  if (props.borrando) return
  emit('close')
}
</script>

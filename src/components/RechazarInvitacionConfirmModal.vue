<template>
  <ModalWrapper
    :show="!!invitacion"
    :z-index="zIndex"
    :persistent="loading"
    overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    card-class="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
    @close="handleClose"
  >
    <div
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      aria-describedby="rechazar-invitacion-desc"
      class="flex max-h-[min(85dvh,90vh)] min-h-0 flex-col"
    >
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
      <div class="flex gap-4">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200/80"
          aria-hidden="true"
        >
          <ExclamationTriangleIcon class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1 pt-0.5">
          <h3 :id="titleId" class="font-display text-lg font-bold leading-tight text-gray-900">
            ¿Rechazar invitación?
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            No podrás deshacer esta decisión desde aquí.
          </p>
        </div>
      </div>

      <p
        id="rechazar-invitacion-desc"
        class="mt-5 text-sm leading-relaxed text-gray-700"
      >
        Vas a rechazar unirte como colaborador a
        <span class="font-semibold text-gray-900">«{{ nombreNatillera }}»</span>.
        Si cambias de idea, quien te invitó puede enviarte una nueva invitación cuando quiera.
      </p>
      </div>

      <div class="mt-6 flex flex-shrink-0 flex-col-reverse gap-3 border-t border-transparent pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[8rem]"
          :disabled="loading"
          @click="handleClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[10rem]"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          <span v-if="!loading">Sí, rechazar</span>
          <span v-else class="flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando…
          </span>
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import ModalWrapper from './ModalWrapper.vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'

const props = defineProps({
  invitacion: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  zIndex: { type: Number, default: 60 }
})

const modalAbierta = computed(() => !!props.invitacion)
useBodyScrollLock(modalAbierta)

const emit = defineEmits(['close', 'confirm'])

const titleId = 'rechazar-invitacion-modal-title'

const nombreNatillera = computed(() => {
  const n = props.invitacion?.natillera_nombre
  return (n && String(n).trim()) || 'esta natillera'
})

function handleClose() {
  if (!props.loading) {
    emit('close')
  }
}
</script>

<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    :persistent="cargando"
    overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    card-class="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-borde/90 bg-superficie-tarjeta shadow-2xl px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
    @close="cerrar"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reabrir-natillera-titulo"
      aria-describedby="reabrir-natillera-desc"
      class="flex max-h-[min(85dvh,90vh)] min-h-0 flex-col"
    >
      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        <div class="flex gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-marca-suave text-marca-tinta"
            aria-hidden="true"
          >
            <LockOpenIcon class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1 pt-0.5">
            <h3 id="reabrir-natillera-titulo" class="font-display text-lg font-bold leading-tight text-texto-fuerte">
              ¿Reabrir la natillera?
            </h3>
            <p class="mt-1 text-sm text-texto-secundario">Vuelve a quedar activa.</p>
          </div>
        </div>

        <p id="reabrir-natillera-desc" class="mt-5 text-sm leading-relaxed text-texto-medio">
          <span class="font-semibold text-texto-fuerte">«{{ nombre }}»</span> vuelve a como estaba antes
          del cierre: los socios, cuotas, préstamos y pagos siguen intactos y se pueden volver a registrar movimientos.
        </p>
      </div>

      <div class="mt-6 flex flex-shrink-0 flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="btn-modal-secondary inline-flex w-full sm:w-auto sm:min-w-[8rem] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="cargando"
          @click="cerrar"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-modal-primary inline-flex w-full sm:w-auto sm:min-w-[10rem] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="cargando"
          @click="$emit('confirmar')"
        >
          <span v-if="!cargando">Sí, reabrir</span>
          <span v-else class="flex items-center gap-2">
            <CargaBoton pequena />
            Reabriendo…
          </span>
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { toRef } from 'vue'
import { LockOpenIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import CargaBoton from '../carga/CargaBoton.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'

const props = defineProps({
  show: { type: Boolean, default: false },
  nombre: { type: String, default: 'esta natillera' },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirmar'])

useBodyScrollLock(toRef(props, 'show'))

function cerrar() {
  if (props.cargando) return
  emit('close')
}
</script>

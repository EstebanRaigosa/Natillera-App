<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :persistent="eliminando"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera móvil: una sola fila -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <TrashIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Eliminar movimiento</h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">Esta acción no se puede deshacer</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 touch-manipulation hover:bg-white/10"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Cabecera desktop: icono arriba, textos centrados, X en flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <TrashIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Eliminar movimiento</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Esta acción no se puede deshacer</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <div v-if="grupo" class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p class="font-display text-sm font-bold text-gray-800">
            {{ etiquetaConcepto(grupo.concepto) }}
            <span v-if="grupo.descripcion" class="font-normal text-gray-600">· {{ grupo.descripcion }}</span>
          </p>
          <p class="mt-1 text-sm text-gray-600">
            {{ formatDate(grupo.fecha) }} ·
            <span v-if="grupo.esTraslado">
              {{ etiquetaForma(grupo.formaOrigen) }} → {{ etiquetaForma(grupo.formaDestino) }}
            </span>
            <span v-else>{{ etiquetaForma(grupo.formaPago) }}</span>
          </p>
          <p class="mt-1 font-display text-lg font-extrabold tabular-nums text-gray-900">
            ${{ formatMoney(grupo.monto) }}
          </p>
        </div>

        <p class="text-sm leading-relaxed text-gray-600">{{ textoEfecto }}</p>

        <p
          v-if="grupo?.esTraslado"
          class="flex items-start gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs leading-relaxed text-indigo-900"
        >
          <InformationCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            Un traslado son dos apuntes: uno de salida y otro de entrada. Se eliminan los dos, porque
            dejar la mitad convertiría el traslado en un egreso y descuadraría la caja.
          </span>
        </p>

        <p
          v-if="avisoCorte"
          class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"
        >
          <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{{ avisoCorte }}</span>
        </p>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex flex-shrink-0 gap-3 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary flex-1" :disabled="eliminando" @click="cerrar">
        Cancelar
      </button>
      <!-- Acción destructiva: rojo en vez del verde de marca (excepción de la skill) -->
      <button
        type="button"
        class="flex min-h-[48px] flex-1 touch-manipulation items-center justify-center rounded-full bg-red-600 px-4 font-display text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        :disabled="eliminando"
        @click="emit('confirmar')"
      >
        {{ eliminando ? 'Eliminando…' : 'Sí, eliminar' }}
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import {
  TrashIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { etiquetaConcepto, etiquetaForma } from '../../composables/useMovimientosFondo'
import { formatDate } from '../../utils/formatDate'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  grupo: { type: Object, default: null },
  fechaUltimoCorte: { type: String, default: '' },
  eliminando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirmar'])

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
const { tapado } = useTapadoInferior()

const textoEfecto = computed(() => {
  const grupo = props.grupo
  if (!grupo) return ''
  if (grupo.esTraslado) {
    return 'Al eliminarlo, el dinero vuelve a contarse en la forma de pago de origen y desaparece de la de destino.'
  }
  const nombre = grupo.formaPago === 'efectivo' ? 'el efectivo' : 'la cuenta'
  return grupo.direccion === 'ingreso'
    ? `Al eliminarlo, el saldo esperado de ${nombre} baja $${formatMoney(grupo.monto)}.`
    : `Al eliminarlo, el saldo esperado de ${nombre} sube $${formatMoney(grupo.monto)}.`
})

const avisoCorte = computed(() => {
  if (!props.fechaUltimoCorte || !props.grupo?.fecha) return ''
  if (props.grupo.fecha > props.fechaUltimoCorte) return ''
  return `Este movimiento es anterior al corte sellado del ${formatDate(props.fechaUltimoCorte)}. El corte congeló su saldo y no se recalcula: quedará desactualizado.`
})

const cerrar = () => {
  if (props.eliminando) return
  emit('close')
}
</script>

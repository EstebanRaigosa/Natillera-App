<template>
  <ModalWrapper
    :show="show"
    :z-index="50"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <ArrowTrendingUpIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Utilidades acumuladas</h2>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/80">De dónde salieron</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Cabecera desktop: icono arriba, textos centrados, X en la tercera columna del flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <ArrowTrendingUpIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Utilidades acumuladas</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">De dónde salieron</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="emit('close')"
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
        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 text-center">
          <p class="font-display text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">Total generado</p>
          <p class="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#1B5E37]">
            ${{ formatMoney(bruto) }}
          </p>
        </div>

        <div>
          <p class="mb-1.5 font-display text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">
            Por concepto
          </p>
          <dl class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            <div
              v-for="concepto in conceptos"
              :key="concepto.tipo"
              class="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <dt class="min-w-0 truncate text-sm text-gray-700">{{ concepto.label }}</dt>
              <dd class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-gray-900">
                ${{ formatMoney(concepto.monto) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Solo si la administración toca las utilidades: si no, lo generado es lo repartido. -->
        <dl
          v-if="administracion?.deUtilidades > 0"
          class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200"
        >
          <div class="flex items-center justify-between gap-3 px-3 py-2.5">
            <dt class="min-w-0 text-sm text-gray-700">Administración ({{ administracion.porcentaje }} %)</dt>
            <dd class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-rose-700">
              −${{ formatMoney(administracion.deUtilidades) }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3 bg-[#E8F5E9] px-3 py-2.5">
            <dt class="min-w-0 text-sm font-semibold text-[#1B5E37]">Se reparte entre los socios</dt>
            <dd class="flex-shrink-0 font-display text-sm font-extrabold tabular-nums text-[#1B5E37]">
              ${{ formatMoney(neto) }}
            </dd>
          </div>
        </dl>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary w-full" @click="emit('close')">Cerrar</button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowTrendingUpIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from './ModalWrapper.vue'
import NatiscrollHint from './NatiscrollHint.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { useNatiscroll } from '../composables/useNatiscroll'
import { useTapadoInferior } from '../composables/useTapadoInferior'
import { formatMoney } from '../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** Lo que generó la natillera, antes de apartar administración. */
  bruto: { type: Number, default: 0 },
  /** Lo que queda para repartir. */
  neto: { type: Number, default: 0 },
  /** [{ tipo, label, monto }] */
  conceptos: { type: Array, default: () => [] },
  /** `administracion` tal como la devuelve `calcularCierreNatillera`. */
  administracion: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()
</script>

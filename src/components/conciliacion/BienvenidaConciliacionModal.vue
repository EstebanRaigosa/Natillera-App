<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="32rem"
    @close="$emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <ScaleIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Conciliar la caja</h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">Comprobar que la plata cuadra</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="$emit('close')"
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
            <ScaleIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Conciliar la caja</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Comprobar que la plata cuadra</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="$emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <!-- La idea entera dibujada: dos cifras enfrentadas y su resultado.
             El ejemplo con números explica en dos segundos lo que un párrafo no. -->
        <div class="rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 py-3">
          <div class="flex items-center gap-2">
            <CpuChipIcon class="h-4 w-4 flex-shrink-0 text-sky-700" />
            <p class="text-[0.6875rem] font-bold uppercase tracking-wide text-sky-700">La app dice</p>
          </div>
          <p class="mt-0.5 font-display text-2xl font-extrabold tabular-nums text-sky-900">$1.200.000</p>
        </div>

        <div class="my-2 flex items-center gap-3">
          <span class="h-px flex-1 bg-gray-200" />
          <span class="text-[0.6875rem] font-bold uppercase tracking-widest text-gray-400">contra</span>
          <span class="h-px flex-1 bg-gray-200" />
        </div>

        <div class="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3">
          <div class="flex items-center gap-2">
            <BanknotesIcon class="h-4 w-4 flex-shrink-0 text-emerald-700" />
            <p class="text-[0.6875rem] font-bold uppercase tracking-wide text-emerald-700">Tú cuentas</p>
          </div>
          <p class="mt-0.5 font-display text-2xl font-extrabold tabular-nums text-emerald-900">$1.150.000</p>
        </div>

        <div class="flex justify-center py-1.5" aria-hidden="true">
          <ChevronDoubleDownIcon class="h-5 w-5 text-gray-300" />
        </div>

        <div class="rounded-2xl bg-red-600 px-4 py-3 text-center text-white">
          <p class="text-[0.6875rem] font-bold uppercase tracking-widest text-white/75">Faltan</p>
          <p class="font-display text-3xl font-extrabold tabular-nums">$50.000</p>
        </div>

        <p class="mt-4 text-center text-sm font-semibold leading-snug text-gray-700">
          Y el libro de abajo te dice dónde.
        </p>

        <div class="mt-4 flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
          <LockClosedIcon class="h-4 w-4 flex-shrink-0 text-[#1B5E37]" />
          <p class="text-xs leading-snug text-gray-600">
            Al sellar, la próxima vez solo revisas lo nuevo.
          </p>
        </div>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 space-y-2 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-primary w-full" @click="$emit('recorrer')">
        Enséñame la pantalla
      </button>
      <button type="button" class="btn-modal-secondary w-full" @click="$emit('close')">
        Ya me ubico, gracias
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import {
  ScaleIcon,
  XMarkIcon,
  CpuChipIcon,
  BanknotesIcon,
  ChevronDoubleDownIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'

const props = defineProps({
  show: { type: Boolean, default: false }
})

defineEmits(['close', 'recorrer'])

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()
</script>

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
          <ArrowDownTrayIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Exportar</h2>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/80">Antes de confirmar el cierre</p>
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
            <ArrowDownTrayIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Exportar</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Antes de confirmar el cierre</p>
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
        <!-- Excel primero: es una sola acción, y así la lista larga de abajo no lo esconde -->
        <button
          type="button"
          class="flex min-h-[64px] w-full touch-manipulation items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-60"
          :disabled="exportandoExcel"
          @click="emit('excel')"
        >
          <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E37]">
            <TableCellsIcon class="h-5 w-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-display text-sm font-bold text-gray-900">{{ exportandoExcel ? 'Exportando…' : 'Excel completo' }}</span>
            <span class="block text-xs text-gray-500">Todos los socios y las utilidades por concepto</span>
          </span>
          <ArrowDownTrayIcon class="h-5 w-5 flex-shrink-0 text-gray-400" />
        </button>

        <!--
          Comprobantes en PDF: la selección se hace aquí mismo, socio por socio, en vez de
          ir abriendo cada uno desde la lista. Filas enteras tocables con casilla real.
        -->
        <section aria-labelledby="titulo-pdf-cierre">
          <div class="mb-2 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h3 id="titulo-pdf-cierre" class="font-display text-sm font-bold text-gray-900">Comprobantes en PDF</h3>
              <p class="text-xs text-gray-500">{{ seleccion.length }} de {{ socios.length }} {{ socios.length === 1 ? 'socio' : 'socios' }}</p>
            </div>
            <button
              type="button"
              class="min-h-[44px] flex-shrink-0 touch-manipulation rounded-full px-3 text-sm font-bold text-[#1B5E37] hover:bg-[#E8F5E9]"
              @click="emit('seleccionar-todos', !todosMarcados)"
            >
              {{ todosMarcados ? 'Quitar todos' : 'Marcar todos' }}
            </button>
          </div>

          <ul class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            <li v-for="socio in socios" :key="socio.id">
              <label
                class="flex min-h-[52px] cursor-pointer touch-manipulation items-center gap-3 px-3 py-2"
                :class="seleccion.includes(socio.id) ? 'bg-[#f6fbf7]' : 'bg-white'"
              >
                <input
                  type="checkbox"
                  class="h-5 w-5 flex-shrink-0 cursor-pointer rounded border-gray-300 text-[#1B5E37] focus:ring-[#1B5E37]"
                  :checked="seleccion.includes(socio.id)"
                  @change="emit('alternar', socio.id)"
                />
                <span class="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{{ socio.nombre }}</span>
                <span class="flex-shrink-0 text-xs font-bold tabular-nums" :class="socio.debe ? 'text-orange-700' : 'text-gray-500'">
                  {{ socio.debe ? 'Debe ' : '' }}${{ formatMoney(socio.monto) }}
                </span>
              </label>
            </li>
          </ul>
        </section>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <!-- La descarga en el pie: visible sin bajar hasta el final de la lista -->
    <div
      class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <div class="flex gap-3">
        <button type="button" class="btn-modal-secondary flex-1" @click="emit('close')">Cerrar</button>
        <button
          type="button"
          class="btn-modal-primary flex-[1.4] disabled:opacity-50"
          :disabled="seleccion.length === 0"
          @click="emit('pdf')"
        >
          <ArrowDownTrayIcon class="h-4 w-4" />
          PDF ({{ seleccion.length }})
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowDownTrayIcon, TableCellsIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** [{ id, nombre, monto, debe }], en el orden en que se muestran. */
  socios: { type: Array, default: () => [] },
  /** Ids de los socios que van en el PDF. */
  seleccion: { type: Array, default: () => [] },
  exportandoExcel: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'seleccionar-todos', 'alternar', 'pdf', 'excel'])

const todosMarcados = computed(() =>
  props.socios.length > 0 && props.socios.every(socio => props.seleccion.includes(socio.id))
)

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()
</script>

<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <WalletIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Caja</h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">
            Revisar el dinero y registrar lo que entra o sale
          </p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 touch-manipulation hover:bg-white/10"
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
            <WalletIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Caja</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">
            Revisar el dinero y registrar lo que entra o sale
          </p>
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
        class="flex-1 min-h-0 space-y-3 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <button
          v-for="opcion in opciones"
          :key="opcion.clave"
          type="button"
          class="flex w-full touch-manipulation items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors"
          :class="opcion.esActual
            ? 'border-[#1B5E37] bg-[#E8F5E9]'
            : 'border-gray-200 bg-white hover:bg-gray-50'"
          @click="ir(opcion.ruta)"
        >
          <div
            class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
            :class="opcion.fondoIcono"
            aria-hidden="true"
          >
            <component :is="opcion.icono" class="h-6 w-6" :class="opcion.colorIcono" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-1.5 font-display text-sm font-bold text-gray-900">
              {{ opcion.titulo }}
              <span v-if="opcion.esActual" class="ds-badge ds-badge--brand">Estás aquí</span>
            </p>
            <p class="mt-0.5 text-xs leading-snug text-gray-500">{{ opcion.descripcion }}</p>
          </div>
          <ChevronRightIcon class="h-5 w-5 flex-shrink-0 text-gray-300" aria-hidden="true" />
        </button>
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
import { useRoute, useRouter } from 'vue-router'
import {
  WalletIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from './ModalWrapper.vue'
import NatiscrollHint from './NatiscrollHint.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { useNatiscroll } from '../composables/useNatiscroll'
import { useTapadoInferior } from '../composables/useTapadoInferior'

const props = defineProps({
  show: { type: Boolean, default: false },
  natilleraId: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

/**
 * Las dos pantallas de dinero de la natillera. Viven agrupadas porque responden a
 * preguntas distintas y la barra inferior no tiene sitio para las dos: aquí caben con
 * su explicación, que es justo lo que hace falta para saber a cuál ir.
 */
const opciones = computed(() => {
  const base = `/natilleras/${props.natilleraId}`
  return [
    {
      clave: 'conciliacion',
      titulo: 'Conciliar caja',
      descripcion: '¿El dinero que dice el sistema es el que tienes de verdad?',
      icono: ScaleIcon,
      fondoIcono: 'bg-[#1B5E37]/10',
      colorIcono: 'text-[#1B5E37]',
      ruta: `${base}/conciliacion`,
      esActual: route.path.startsWith(`${base}/conciliacion`)
    },
    {
      clave: 'movimientos',
      titulo: 'Movimientos del fondo',
      descripcion: 'Ingresos, egresos y traslados que no vienen de una cuota',
      icono: ArrowsRightLeftIcon,
      fondoIcono: 'bg-indigo-50',
      colorIcono: 'text-indigo-600',
      ruta: `${base}/movimientos`,
      esActual: route.path.startsWith(`${base}/movimientos`)
    }
  ]
})

const ir = (ruta) => {
  emit('close')
  if (route.path === ruta) return
  router.push(ruta)
}
</script>

<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="32rem"
    @close="$emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <ClockIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Historial de cortes</h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">Cuándo cuadró y quién lo revisó</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 touch-manipulation hover:bg-white/10"
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
            <ClockIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Historial de cortes</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Cuándo cuadró y quién lo revisó</p>
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
        class="flex-1 min-h-0 space-y-3 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <p v-if="cortes.length === 0" class="py-8 text-center text-sm text-texto-suave">
          Todavía no has cerrado ningún corte. Al cerrar el primero, aquí quedará constancia de
          quién revisó, cuándo y qué se explicó de cada diferencia.
        </p>

        <article
          v-for="corte in cortes"
          :key="corte.id"
          class="rounded-xl border border-borde p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-display text-sm font-bold text-texto">{{ formatDate(corte.fecha_corte) }}</p>
              <p class="mt-0.5 text-xs text-texto-suave">
                {{ corte.creado_por_nombre }} · {{ formatDateWithTime(corte.creado_en) }}
              </p>
            </div>
            <span class="ds-badge flex-shrink-0" :class="claseBadge(corte)">
              {{ etiquetaDiferencia(corte) }}
            </span>
          </div>

          <dl class="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div class="rounded-lg bg-superficie-suave px-2.5 py-2">
              <dt class="text-texto-suave">Efectivo</dt>
              <dd class="mt-0.5 font-semibold tabular-nums text-texto">${{ formatMoney(corte.real_efectivo) }}</dd>
              <dd class="tabular-nums" :class="claseDiferencia(diferencias(corte).efectivo)">
                ${{ formatMoneyConSigno(diferencias(corte).efectivo) }}
              </dd>
            </div>
            <div class="rounded-lg bg-superficie-suave px-2.5 py-2">
              <dt class="text-texto-suave">Transferencia</dt>
              <dd class="mt-0.5 font-semibold tabular-nums text-texto">${{ formatMoney(corte.real_transferencia) }}</dd>
              <dd class="tabular-nums" :class="claseDiferencia(diferencias(corte).transferencia)">
                ${{ formatMoneyConSigno(diferencias(corte).transferencia) }}
              </dd>
            </div>
            <div class="rounded-lg bg-superficie-suave px-2.5 py-2">
              <dt class="text-texto-suave">Total</dt>
              <dd class="mt-0.5 font-semibold tabular-nums text-texto">
                ${{ formatMoney(corte.real_efectivo + corte.real_transferencia) }}
              </dd>
              <dd class="tabular-nums" :class="claseDiferencia(diferencias(corte).total)">
                ${{ formatMoneyConSigno(diferencias(corte).total) }}
              </dd>
            </div>
          </dl>

          <p v-if="corte.nota" class="mt-3 rounded-lg bg-amber-50 oscuro:bg-amber-500/15 px-3 py-2 text-xs leading-relaxed text-amber-900 oscuro:text-amber-300">
            {{ corte.nota }}
          </p>

          <p
            v-if="estaDesactualizado(corte)"
            class="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 oscuro:bg-orange-500/15 px-3 py-2 text-xs leading-relaxed text-orange-900 oscuro:text-orange-300"
          >
            <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              El sistema calcula hoy ${{ formatMoney(esperadoHoyTotal(corte)) }} para esta fecha, no
              ${{ formatMoney(corte.esperado_efectivo + corte.esperado_transferencia) }}. Alguien editó
              o borró un pago anterior al corte.
            </span>
          </p>

          <div class="mt-3 flex justify-end">
            <template v-if="corteAAnular === corte.id">
              <div class="flex items-center gap-2">
                <span class="text-xs text-texto-secundario">¿Anular este corte?</span>
                <button type="button" class="ds-btn ds-btn--ghost" @click="corteAAnular = null">No</button>
                <button type="button" class="ds-btn ds-btn--danger" @click="anular(corte.id)">Sí, anular</button>
              </div>
            </template>
            <button
              v-else
              type="button"
              class="ds-btn ds-btn--ghost text-red-600 oscuro:text-red-300"
              @click="corteAAnular = corte.id"
            >
              <TrashIcon class="h-4 w-4" />
              Anular
            </button>
          </div>
        </article>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 border-t border-borde bg-superficie-tarjeta px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary w-full" @click="$emit('close')">Cerrar</button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ClockIcon, XMarkIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { diferenciasDeCorte } from '../../composables/useCortesCaja'
import { formatDate, formatDateWithTime } from '../../utils/formatDate'
import { formatMoney, formatMoneyConSigno } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  cortes: { type: Array, default: () => [] },
  /**
   * Esperado que el sistema calcula HOY para la fecha de cada corte, indexado por id.
   * Sirve para avisar de que un corte sellado dejó de cuadrar porque se tocó el pasado.
   */
  esperadoRecalculado: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'anular'])

const corteAAnular = ref(null)

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

watch(visible, (abierto) => {
  if (!abierto) corteAAnular.value = null
})

const diferencias = (corte) => diferenciasDeCorte(corte)

const claseDiferencia = (valor) => {
  if (valor === 0) return 'text-texto-tenue'
  return valor > 0 ? 'text-emerald-700 oscuro:text-emerald-300' : 'text-red-600 oscuro:text-red-300'
}

const claseBadge = (corte) => {
  const total = diferencias(corte).total
  if (total === 0) return 'ds-badge--success'
  return total > 0 ? 'ds-badge--warning' : 'ds-badge--danger'
}

const etiquetaDiferencia = (corte) => {
  const total = diferencias(corte).total
  if (total === 0) return 'Cuadró'
  return total > 0 ? 'Sobró' : 'Faltó'
}

const esperadoHoyTotal = (corte) => {
  const recalculado = props.esperadoRecalculado[corte.id]
  if (!recalculado) return 0
  return recalculado.efectivo + recalculado.transferencia
}

const estaDesactualizado = (corte) => {
  const recalculado = props.esperadoRecalculado[corte.id]
  if (!recalculado) return false
  const sellado = (corte.esperado_efectivo || 0) + (corte.esperado_transferencia || 0)
  return Math.abs(esperadoHoyTotal(corte) - sellado) >= 1
}

const anular = (id) => {
  corteAAnular.value = null
  emit('anular', id)
}
</script>

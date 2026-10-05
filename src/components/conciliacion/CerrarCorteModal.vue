<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :persistent="guardando"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <LockClosedIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Cerrar corte</h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">
            Sella el saldo hasta el {{ formatDate(fechaCorte) }}
          </p>
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

    <!-- Cabecera desktop: icono arriba, textos centrados, X en la tercera columna del flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <LockClosedIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Cerrar corte</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">
            Sella el saldo hasta el {{ formatDate(fechaCorte) }}
          </p>
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
        class="flex-1 min-h-0 space-y-5 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <p class="text-sm leading-relaxed text-texto-secundario">
          Vas a sellar el periodo <strong class="text-texto">{{ formatDate(periodoDesde) }} → {{ formatDate(fechaCorte) }}</strong>.
          El saldo real que declares será el punto de partida del siguiente corte.
        </p>

        <div class="overflow-hidden rounded-xl border border-borde">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-superficie-suave text-[0.6875rem] uppercase tracking-wide text-texto-suave">
                <th class="px-3 py-2 text-left font-semibold">Concepto</th>
                <th class="px-3 py-2 text-right font-semibold">Efectivo</th>
                <th class="px-3 py-2 text-right font-semibold">Transferencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-borde-suave">
              <tr>
                <td class="px-3 py-2 text-texto-secundario">Debería haber</td>
                <td class="px-3 py-2 text-right tabular-nums text-texto">${{ formatMoney(esperado.efectivo) }}</td>
                <td class="px-3 py-2 text-right tabular-nums text-texto">${{ formatMoney(esperado.transferencia) }}</td>
              </tr>
              <tr>
                <td class="px-3 py-2 text-texto-secundario">Hay de verdad</td>
                <td class="px-3 py-2 text-right font-semibold tabular-nums text-texto-fuerte">${{ formatMoney(real.efectivo) }}</td>
                <td class="px-3 py-2 text-right font-semibold tabular-nums text-texto-fuerte">${{ formatMoney(real.transferencia) }}</td>
              </tr>
              <tr class="bg-superficie-suave">
                <td class="px-3 py-2 font-semibold text-texto-medio">Diferencia</td>
                <td class="px-3 py-2 text-right font-bold tabular-nums" :class="claseDiferencia(diferenciaEfectivo)">
                  ${{ formatMoneyConSigno(diferenciaEfectivo) }}
                </td>
                <td class="px-3 py-2 text-right font-bold tabular-nums" :class="claseDiferencia(diferenciaTransferencia)">
                  ${{ formatMoneyConSigno(diferenciaTransferencia) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
          :class="cuadra ? 'bg-emerald-50 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300' : 'bg-amber-50 oscuro:bg-amber-500/15 text-amber-900 oscuro:text-amber-300'"
        >
          <div class="flex min-w-0 items-center gap-2">
            <CheckCircleIcon v-if="cuadra" class="h-5 w-5 flex-shrink-0" />
            <ExclamationTriangleIcon v-else class="h-5 w-5 flex-shrink-0" />
            <span class="text-sm font-semibold">{{ cuadra ? 'Cuadra' : (diferenciaTotal > 0 ? 'Sobra dinero' : 'Falta dinero') }}</span>
          </div>
          <span class="flex-shrink-0 font-display text-lg font-extrabold tabular-nums">
            ${{ formatMoneyConSigno(diferenciaTotal) }}
          </span>
        </div>

        <div>
          <label for="nota-corte" class="ds-label">
            Nota
            <span v-if="notaObligatoria" class="text-red-600 oscuro:text-red-300">*</span>
            <span v-else class="font-normal text-texto-tenue">(opcional)</span>
          </label>
          <textarea
            id="nota-corte"
            v-model="nota"
            rows="3"
            class="ds-input resize-none"
            :class="{ 'ds-input--error': errorNota }"
            :placeholder="notaObligatoria ? 'Explica a qué se debe la diferencia' : 'Algo que quieras dejar anotado'"
          />
          <p v-if="errorNota" class="mt-1.5 text-xs font-medium text-red-600 oscuro:text-red-300">{{ errorNota }}</p>
          <p v-else-if="notaObligatoria" class="mt-1.5 text-xs text-texto-suave">
            La diferencia supera el umbral de ${{ formatMoney(umbral) }}, así que hace falta explicarla.
          </p>
        </div>

        <p class="rounded-xl bg-superficie-suave px-4 py-3 text-xs leading-relaxed text-texto-suave">
          Los importes se congelan al sellar. Si después se edita o borra un pago anterior a esta
          fecha, el corte no se recalcula y el historial lo marcará como desactualizado.
        </p>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex flex-shrink-0 gap-3 border-t border-borde bg-superficie-tarjeta px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary flex-1" :disabled="guardando" @click="cerrar">
        Cancelar
      </button>
      <button type="button" class="btn-modal-primary flex-1" :disabled="guardando" @click="confirmar">
        {{ guardando ? 'Sellando…' : 'Sellar corte' }}
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { LockClosedIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { formatDate } from '../../utils/formatDate'
import { formatMoney, formatMoneyConSigno } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  fechaCorte: { type: String, default: '' },
  periodoDesde: { type: String, default: '' },
  esperado: { type: Object, default: () => ({ efectivo: 0, transferencia: 0 }) },
  real: { type: Object, default: () => ({ efectivo: 0, transferencia: 0 }) },
  umbral: { type: Number, default: 0 },
  guardando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirmar'])

const nota = ref('')
const errorNota = ref('')

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

const diferenciaEfectivo = computed(() => (props.real.efectivo || 0) - (props.esperado.efectivo || 0))
const diferenciaTransferencia = computed(() => (props.real.transferencia || 0) - (props.esperado.transferencia || 0))
const diferenciaTotal = computed(() => diferenciaEfectivo.value + diferenciaTransferencia.value)
const cuadra = computed(() => diferenciaTotal.value === 0)
const notaObligatoria = computed(() => Math.abs(diferenciaTotal.value) > props.umbral)

const claseDiferencia = (valor) => {
  if (valor === 0) return 'text-texto-suave'
  return valor > 0 ? 'text-emerald-700 oscuro:text-emerald-300' : 'text-red-600 oscuro:text-red-300'
}

watch(visible, (abierto) => {
  if (!abierto) return
  nota.value = ''
  errorNota.value = ''
})

const cerrar = () => {
  if (props.guardando) return
  emit('close')
}

const confirmar = () => {
  if (notaObligatoria.value && !nota.value.trim()) {
    errorNota.value = 'Explica la diferencia antes de sellar el corte'
    return
  }
  errorNota.value = ''
  emit('confirmar', nota.value.trim())
}
</script>

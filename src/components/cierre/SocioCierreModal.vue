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
    <!-- Cabecera móvil: una sola fila (inicial + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-sm font-extrabold text-white">
          {{ iniciales }}
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="truncate font-display text-base font-bold leading-tight text-white">{{ nombre }}</h2>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/80">{{ subtitulo }}</p>
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

    <!-- Cabecera desktop: inicial arriba, textos centrados, X en la tercera columna del flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 font-display text-base font-extrabold text-white">
            {{ iniciales }}
          </div>
          <h2 class="max-w-full truncate font-display text-lg font-bold leading-tight text-white">{{ nombre }}</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">{{ subtitulo }}</p>
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
        v-if="dato"
        ref="scrollRef"
        class="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <!-- Lo que se venía a mirar: cuánto recibe o cuánto debe -->
        <div
          class="rounded-2xl px-4 py-3.5 text-center"
          :class="debe ? 'border border-orange-200 bg-orange-50' : 'bg-[#E8F5E9]'"
        >
          <p class="font-display text-[0.6875rem] font-bold uppercase tracking-wide" :class="debe ? 'text-orange-800' : 'text-[#1B5E37]'">
            {{ debe ? 'Queda debiendo' : 'Recibe' }}
          </p>
          <p class="mt-1 font-display text-3xl font-extrabold tabular-nums" :class="debe ? 'text-orange-700' : 'text-[#1B5E37]'">
            ${{ formatMoney(Math.abs(totalFinal)) }}
          </p>
        </div>

        <!-- La cuenta, de arriba abajo -->
        <dl class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
          <div class="flex items-start justify-between gap-3 px-3 py-2.5">
            <dt class="min-w-0">
              <span class="block text-sm text-gray-700">Ahorro</span>
              <span class="block text-xs text-gray-500">
                {{ dato.cantidadCuotasPagadas ?? 0 }} {{ (dato.cantidadCuotasPagadas || 0) === 1 ? 'cuota' : 'cuotas' }}
                de ${{ formatMoney(dato.montoAhorradoMensual) }} · {{ periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
              </span>
            </dt>
            <dd class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-gray-900">${{ formatMoney(dato.ahorro) }}</dd>
          </div>
          <div class="px-3 py-2.5">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-sm text-gray-700">+ Utilidades</dt>
              <dd class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-gray-900">${{ formatMoney(dato.utilidades) }}</dd>
            </div>
            <ul v-if="conceptos.length > 0" class="mt-1.5 space-y-0.5 border-l-2 border-[#E8F5E9] pl-3">
              <li v-for="concepto in conceptos" :key="concepto.tipo" class="flex items-center justify-between gap-3 text-xs">
                <span class="truncate text-gray-500">{{ concepto.label }}</span>
                <span class="flex-shrink-0 tabular-nums text-gray-600">${{ formatMoney(concepto.monto) }}</span>
              </li>
            </ul>
          </div>
          <!-- Solo cuando la administración no cupo en las utilidades y tocó su ahorro -->
          <div v-if="(dato.aporteAdministracion || 0) > 0" class="flex items-start justify-between gap-3 px-3 py-2.5">
            <dt class="min-w-0">
              <span class="block text-sm text-gray-700">− Administración</span>
              <span class="block text-xs text-gray-500">La parte que sale de su ahorro</span>
            </dt>
            <dd class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-red-700">−${{ formatMoney(dato.aporteAdministracion) }}</dd>
          </div>
          <div v-if="(dato.descuentos || 0) > 0" class="px-3 py-2.5">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-sm text-gray-700">− Descuentos</dt>
              <dd class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-red-700">−${{ formatMoney(dato.descuentos) }}</dd>
            </div>
            <ul v-if="dato.descuentosDesglose" class="mt-1.5 space-y-0.5 border-l-2 border-red-100 pl-3">
              <li v-if="dato.descuentosDesglose.prestamosPendientes > 0" class="flex items-center justify-between gap-3 text-xs">
                <span class="text-gray-500">Préstamos pendientes</span>
                <span class="tabular-nums text-gray-600">${{ formatMoney(dato.descuentosDesglose.prestamosPendientes) }}</span>
              </li>
              <li v-if="dato.descuentosDesglose.cuotasSinPagar > 0" class="flex items-center justify-between gap-3 text-xs">
                <span class="text-gray-500">Cuotas o sanciones pendientes</span>
                <span class="tabular-nums text-gray-600">${{ formatMoney(dato.descuentosDesglose.cuotasSinPagar) }}</span>
              </li>
            </ul>
          </div>
        </dl>

        <!-- Casilla real (no un div clicable): el lector de pantalla la anuncia y se marca con teclado -->
        <label class="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 touch-manipulation">
          <input
            type="checkbox"
            class="h-5 w-5 flex-shrink-0 cursor-pointer rounded border-gray-300 text-[#1B5E37] focus:ring-[#1B5E37]"
            :checked="enPdf"
            @change="emit('alternar-pdf')"
          />
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-gray-800">Incluir en el PDF</span>
            <span class="block text-xs text-gray-500">Para el PDF de comprobantes de «Exportar»</span>
          </span>
        </label>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <div class="flex gap-3">
        <button type="button" class="btn-modal-secondary flex-1" @click="emit('descargar')">
          <ArrowDownTrayIcon class="h-4 w-4" />
          Comprobante
        </button>
        <!-- WhatsApp conserva su verde propio (skill natillerapp-modals, excepciones) -->
        <button
          v-if="dato?.socio?.telefono"
          type="button"
          class="inline-flex min-h-[48px] flex-1 touch-manipulation items-center justify-center gap-2 rounded-full bg-[#128C7E] px-4 text-sm font-bold text-white hover:bg-[#0f7a6e]"
          @click="emit('whatsapp')"
        >
          <ChatBubbleLeftIcon class="h-4 w-4" />
          WhatsApp
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowDownTrayIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** Fila del cierre tal como la arma `NatilleraCierre` (socio, ahorro, utilidades, totalFinal…). */
  dato: { type: Object, default: null },
  periodicidad: { type: String, default: 'mensual' },
  /** Si el socio va en el PDF de comprobantes. */
  enPdf: { type: Boolean, default: false },
  /** Orden y nombres de los conceptos de utilidad. */
  tiposUtilidad: { type: Array, default: () => [] },
  etiquetasUtilidad: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'alternar-pdf', 'descargar', 'whatsapp'])

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

const nombre = computed(() => props.dato?.socio?.nombre || 'Socio')
const iniciales = computed(() =>
  nombre.value.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
)
const subtitulo = computed(() => props.dato?.socio?.telefono || 'Liquidación del socio')
const totalFinal = computed(() => parseFloat(props.dato?.totalFinal) || 0)
const debe = computed(() => totalFinal.value < 0)

const conceptos = computed(() => {
  const porConcepto = props.dato?.utilidadesPorConcepto || {}
  return props.tiposUtilidad
    .filter(tipo => (porConcepto[tipo] || 0) > 0)
    .map(tipo => ({ tipo, label: props.etiquetasUtilidad[tipo] || tipo, monto: porConcepto[tipo] }))
})
</script>

<template>
  <!-- Vista tarjeta (rejilla) -->
  <div
    v-if="variant === 'grid'"
    :class="[
      'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm',
      esCerrada
        ? 'opacity-[0.58] saturate-[0.5]'
        : 'transition-all duration-300 ease-out lg:hover:-translate-y-0.5 lg:hover:border-emerald-200/90 lg:hover:shadow-lg motion-reduce:transition-none motion-reduce:lg:hover:translate-y-0 motion-reduce:lg:hover:shadow-sm',
    ]"
  >
    <div
      v-if="ribbonOtroUsuario"
      class="pointer-events-none absolute right-0 top-0 z-20 h-32 w-32 overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="absolute right-[-42px] top-7 w-[11.5rem] bg-amber-200 py-1.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-amber-950 shadow-sm ring-1 ring-amber-500/65"
        style="transform: rotate(45deg)"
      >
        De otro usuario
      </span>
    </div>
    <div
      v-else-if="ribbonCompartida"
      class="pointer-events-none absolute right-0 top-0 z-20 h-28 w-28 overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="absolute right-[-36px] top-6 w-40 bg-yellow-100 py-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-950 shadow-sm ring-1 ring-yellow-400/80"
        style="transform: rotate(45deg)"
      >
        Compartida
      </span>
    </div>

    <div
      class="natillera-card-header relative flex min-h-[4.5rem] shrink-0 items-start overflow-hidden bg-gradient-to-br from-[#166534] via-[#166534] to-[#124a2c] px-3 pb-3 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:min-h-[4.75rem] sm:px-4 sm:pb-3.5 sm:pt-3.5"
    >
      <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          class="absolute -right-8 -top-20 h-[11rem] w-[11rem] rounded-full bg-white/[0.055] blur-[2px]"
        />
        <div
          class="absolute -bottom-14 -left-10 h-[7rem] w-[7rem] rounded-full bg-emerald-300/[0.09]"
        />
        <div
          class="absolute right-[10%] top-2 h-2 w-2 rounded-full bg-white/25 ring-1 ring-white/10"
        />
        <div class="absolute right-[22%] top-4 h-1 w-1 rounded-full bg-white/18" />
        <div class="absolute right-[30%] top-2.5 h-1.5 w-1.5 rounded-full bg-white/12" />
        <div
          class="absolute left-[6%] top-2 h-11 w-11 rounded-full border border-white/[0.07]"
        />
        <div
          class="absolute -right-4 top-1/2 h-[4.5rem] w-[4.5rem] -translate-y-1/2 rounded-full border border-white/[0.06]"
        />
        <div
          class="absolute bottom-2 left-[28%] h-5 w-5 rotate-12 rounded-md border border-white/[0.05]"
        />
        <div
          class="absolute bottom-3 right-[40%] h-3 w-3 -rotate-6 rounded-sm bg-white/[0.06]"
        />
      </div>
      <router-link
        :to="detalleUrl"
        class="relative z-10 block min-w-0 w-full"
      >
        <div class="min-w-0 pr-1">
          <h3
            class="font-body text-base font-bold leading-snug tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
          >
            {{ natillera.nombre }}
          </h3>
          <p
            class="mt-0.5 text-[10px] font-medium uppercase leading-tight tracking-wide text-emerald-100/90"
          >
            {{ lineaPeriodicidad }}
          </p>
        </div>
      </router-link>
    </div>

    <!-- Botones fuera de router-link: <button> dentro de <a> es HTML inválido y puede navegar al detalle. -->
    <div
      class="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4"
    >
      <div
        class="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <NatilleraCardCornerArt />
      </div>
      <div class="relative z-[1] flex min-h-0 flex-1 flex-col">
        <router-link
          :to="detalleUrl"
          class="block min-h-0 flex-1 text-left"
        >
          <div
            class="mb-2 flex min-w-0 flex-nowrap items-center justify-start gap-2 rounded-md border border-gray-100/90 bg-gray-50/70 px-2.5 py-1.5 text-left sm:px-3 sm:py-2"
          >
            <BanknotesIcon
              class="h-3.5 w-3.5 shrink-0 text-[#166534]"
              stroke-width="1.75"
              aria-hidden="true"
            />
            <span class="shrink-0 text-[9px] font-medium uppercase tracking-wide text-gray-400">
              Fondo total
            </span>
            <span
              class="min-w-0 truncate text-base font-semibold tabular-nums leading-none text-gray-900 sm:text-lg"
            >
              {{ formatoMoneda(fondoTotal) }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1',
                estadoNatillera === 'activa'
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : 'bg-slate-200/95 text-slate-900 ring-2 ring-slate-400/90 shadow-sm',
              ]"
            >
              <span
                v-if="estadoNatillera === 'activa'"
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600/45"
                aria-hidden="true"
              />
              <span
                v-else
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600"
                aria-hidden="true"
              />
              {{ estadoNatillera === 'activa' ? 'Activa' : 'Cerrada' }}
            </span>
          </div>

          <div class="mt-3 space-y-1.5 text-sm text-gray-700">
            <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <CalendarIcon
                class="h-3.5 w-3.5 shrink-0 text-[#166534]"
                stroke-width="1.75"
                aria-hidden="true"
              />
              <span class="font-semibold text-gray-500">Inicio</span>
              <span class="font-semibold text-gray-900">{{ etiquetaInicio }}</span>
            </p>
            <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <CalendarIcon
                class="h-3.5 w-3.5 shrink-0 text-[#166534]"
                stroke-width="1.75"
                aria-hidden="true"
              />
              <span class="font-semibold text-gray-500">Fin</span>
              <span class="font-semibold text-gray-900">{{ etiquetaFin }}</span>
            </p>
          </div>
        </router-link>

        <div
          class="mt-4 flex min-h-[2.5rem] items-center justify-between gap-3 text-gray-800"
        >
          <router-link
            :to="detalleUrl"
            class="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
          >
            <UserGroupIcon
              class="h-5 w-5 shrink-0 text-[#166534]"
              stroke-width="1.75"
              aria-hidden="true"
            />
            <span class="font-body text-sm font-semibold tabular-nums leading-snug">
              {{ natillera.socios_count ?? 0 }}
              <span class="font-medium text-gray-600"> socios</span>
            </span>
          </router-link>
          <div
            v-if="showPin || showDelete"
            class="flex shrink-0 items-center gap-2"
          >
            <button
              v-if="showPin"
              type="button"
              class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-indigo-200/90 bg-indigo-50 text-indigo-800 shadow-sm ring-1 ring-indigo-100/70 transition hover:bg-indigo-100 hover:ring-indigo-200/80 touch-manipulation"
              :title="pinned ? 'Quitar de fijadas' : 'Fijar arriba'"
              @click="$emit('toggle-pin')"
            >
              <PinThumbIcon :pinned="pinned" class="h-[1.35rem] w-[1.35rem]" />
            </button>
            <button
              v-if="showDelete"
              type="button"
              class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-red-200/95 bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100/80 transition hover:bg-red-100 hover:ring-red-200/90 hover:text-red-700 touch-manipulation"
              title="Eliminar natillera"
              aria-label="Eliminar natillera"
              @click="$emit('delete')"
            >
              <TrashIcon class="h-4 w-4" stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Vista lista (fila) -->
  <div
    v-else
    :class="[
      'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4',
      esCerrada
        ? 'opacity-[0.58] saturate-[0.5]'
        : 'transition-all duration-300 ease-out lg:hover:-translate-y-0.5 lg:hover:border-emerald-200/90 lg:hover:shadow-lg motion-reduce:transition-none motion-reduce:lg:hover:translate-y-0 motion-reduce:lg:hover:shadow-sm',
    ]"
  >
    <div
      v-if="ribbonOtroUsuario"
      class="pointer-events-none absolute right-0 top-0 z-20 h-32 w-32 overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="absolute right-[-42px] top-7 w-[11.5rem] bg-amber-200 py-1.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-amber-950 shadow-sm ring-1 ring-amber-500/65"
        style="transform: rotate(45deg)"
      >
        De otro usuario
      </span>
    </div>
    <div
      v-else-if="ribbonCompartida"
      class="pointer-events-none absolute right-0 top-0 z-20 h-28 w-28 overflow-hidden"
      aria-hidden="true"
    >
      <span
        class="absolute right-[-36px] top-6 w-40 bg-yellow-100 py-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-950 shadow-sm ring-1 ring-yellow-400/80"
        style="transform: rotate(45deg)"
      >
        Compartida
      </span>
    </div>

    <div
      class="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
      aria-hidden="true"
    >
      <NatilleraCardCornerArt compact />
    </div>

    <router-link
      :to="detalleUrl"
      class="relative z-[1] flex min-w-0 flex-1 flex-col gap-3"
    >
      <div class="min-w-0">
        <h3 class="font-body text-base font-bold leading-snug text-gray-900">
          {{ natillera.nombre }}
        </h3>
        <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {{ lineaPeriodicidad }}
        </p>
      </div>
      <div
        class="flex w-full min-w-0 flex-nowrap items-center justify-start gap-2 rounded-md border border-gray-100/90 bg-gray-50/70 px-2.5 py-1.5 text-left sm:py-2"
      >
        <BanknotesIcon
          class="h-3.5 w-3.5 shrink-0 text-[#166534]"
          stroke-width="1.75"
          aria-hidden="true"
        />
        <span class="shrink-0 text-[9px] font-medium uppercase tracking-wide text-gray-400">
          Fondo total
        </span>
        <span
          class="min-w-0 truncate text-base font-semibold tabular-nums leading-none text-gray-900 sm:text-lg"
        >
          {{ formatoMoneda(fondoTotal) }}
        </span>
      </div>
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
        <span class="inline-flex items-center gap-1">
          <CalendarIcon
            class="h-3.5 w-3.5 shrink-0 text-[#166534]"
            stroke-width="1.75"
            aria-hidden="true"
          />
          <span class="font-medium text-gray-400">Inicio</span>
          {{ etiquetaInicio }}
        </span>
        <span class="inline-flex items-center gap-1">
          <CalendarIcon
            class="h-3.5 w-3.5 shrink-0 text-[#166534]"
            stroke-width="1.75"
            aria-hidden="true"
          />
          <span class="font-medium text-gray-400">Fin</span>
          {{ etiquetaFin }}
        </span>
      </div>
    </router-link>

    <div
      class="relative z-[1] flex flex-1 flex-wrap items-center gap-4 border-t border-gray-100 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0"
    >
      <div class="flex items-center gap-2 text-gray-800">
        <UserGroupIcon class="h-5 w-5 shrink-0 text-[#166534]" stroke-width="1.75" />
        <span class="text-sm font-semibold tabular-nums">
          {{ natillera.socios_count ?? 0 }}
          <span class="font-medium text-gray-600"> socios</span>
        </span>
      </div>
      <span
        :class="[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1',
          estadoNatillera === 'activa'
            ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
            : 'bg-slate-200/95 text-slate-900 ring-2 ring-slate-400/90 shadow-sm',
        ]"
      >
        <span
          v-if="estadoNatillera === 'activa'"
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600/45"
          aria-hidden="true"
        />
        <span
          v-else
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600"
          aria-hidden="true"
        />
        {{ estadoNatillera === 'activa' ? 'Activa' : 'Cerrada' }}
      </span>
    </div>

    <div class="relative z-[1] flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
      <button
        v-if="showPin"
        type="button"
        class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-indigo-200/95 bg-indigo-50 text-indigo-800 shadow-sm ring-1 ring-indigo-100/80 transition hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-950 hover:ring-indigo-200/90 touch-manipulation"
        :title="pinned ? 'Quitar de fijadas' : 'Fijar arriba'"
        @click.stop="$emit('toggle-pin')"
      >
        <PinThumbIcon :pinned="pinned" class="h-5 w-5" />
      </button>
      <button
        v-if="showDelete"
        type="button"
        class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md border-2 border-red-300 bg-red-50 text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-100 hover:text-red-700 touch-manipulation"
        title="Eliminar natillera"
        aria-label="Eliminar natillera"
        @click.stop="$emit('delete')"
      >
        <TrashIcon class="h-4 w-4" stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrashIcon, UserGroupIcon, CalendarIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { parseDateLocal } from '../utils/formatDate'
import { formatearMesAnio } from '../utils/natilleraFormat'
import PinThumbIcon from './PinThumbIcon.vue'
import NatilleraCardCornerArt from './NatilleraCardCornerArt.vue'

const props = defineProps({
  natillera: { type: Object, required: true },
  ribbonCompartida: { type: Boolean, default: false },
  ribbonOtroUsuario: { type: Boolean, default: false },
  showPin: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  showDelete: { type: Boolean, default: false },
  /** Total del fondo (mismo cálculo que en detalle) */
  fondoTotal: { type: Number, default: 0 },
  /** 'grid' = tarjeta; 'list' = fila */
  variant: { type: String, default: 'grid' },
})

defineEmits(['toggle-pin', 'delete'])

const detalleUrl = computed(() => `/natilleras/${props.natillera.id}`)

const estadoNatillera = computed(() =>
  String(props.natillera.estado || 'activa').toLowerCase() === 'cerrada'
    ? 'cerrada'
    : 'activa'
)

const esCerrada = computed(() => estadoNatillera.value === 'cerrada')

const etiquetaInicio = computed(() => {
  const n = props.natillera
  const d = parseDateLocal(n.fecha_inicio)
  if (d && !isNaN(d.getTime())) {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ]
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`
  }
  return formatearMesAnio(n.mes_inicio || 1, n.anio_inicio || n.anio)
})

const etiquetaFin = computed(() => {
  const n = props.natillera
  return formatearMesAnio(n.mes_fin || 12, n.anio)
})

function periodicidadLabel(p) {
  const map = {
    quincenal: 'Quincenal',
    mensual: 'Mensual',
    semanal: 'Semanal',
  }
  return map[p?.toLowerCase?.()] || 'Natillera'
}

const lineaPeriodicidad = computed(() =>
  periodicidadLabel(props.natillera.periodicidad).toUpperCase()
)

function formatoMoneda(valor) {
  const n = Number(valor) || 0
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}
</script>

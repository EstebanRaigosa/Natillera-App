<template>
  <!--
    Tarjeta de actividad (lenguaje DS: tarjeta blanca limpia, icono en cuadrado marca,
    franja de estado slim, badges DS y chips de métrica neutros). Sustituye al estilo
    antiguo con gradientes y border-l-4. Usada en vista normal, agrupada e individual.
  -->
  <div
    :class="[
      'group relative overflow-hidden rounded-2xl bg-white border border-[color:var(--surface-divider)] shadow-[var(--shadow-xs)] transition-shadow duration-200',
      clickable ? 'cursor-pointer hover:shadow-[var(--shadow-md)] active:scale-[0.995]' : ''
    ]"
    @click="clickable && $emit('click')"
  >
    <!-- Franja de estado slim -->
    <div
      class="flex items-center gap-1.5 px-4 py-2 border-b text-xs font-semibold"
      :class="esLiquidada
        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
        : 'bg-amber-50 border-amber-100 text-amber-700'"
    >
      <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="esLiquidada ? 'bg-emerald-500' : 'bg-amber-500'"></span>
      <span>{{ esLiquidada ? 'Finalizada' : 'En curso' }}</span>
      <span class="ds-badge ds-badge--info ml-auto capitalize">{{ (actividad.tipo || 'otro').toLowerCase() }}</span>
    </div>

    <div class="p-4 sm:p-5">
      <!-- Cabecera: icono + título/fecha + eliminar -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center flex-shrink-0">
            <component :is="icono" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h3 class="font-display font-semibold text-gray-800 text-base leading-snug line-clamp-2">{{ actividad.descripcion }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(actividad.created_at) }}</p>
          </div>
        </div>
        <button
          type="button"
          @click.stop="$emit('eliminar')"
          class="-m-1 p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0 touch-manipulation"
          title="Eliminar actividad"
        >
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Métricas (chips neutros; valor con color semántico).
           Móvil: una columna, cada chip en fila (etiqueta izquierda + valor derecha) para
           que el número tenga todo el ancho y no haga wrap. Escritorio (sm+): 3 chips con
           etiqueta arriba y valor debajo. Valor siempre en una línea (nowrap + tabular-nums). -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <template v-if="esLiquidada">
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0 flex items-center justify-between gap-3 sm:block">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Ingresos</p>
            <p class="font-bold text-emerald-600 text-sm leading-tight sm:mt-0.5 whitespace-nowrap tabular-nums">${{ formatMoney(actividad.ingresos) }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0 flex items-center justify-between gap-3 sm:block">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Gastos</p>
            <p class="font-bold text-rose-600 text-sm leading-tight sm:mt-0.5 whitespace-nowrap tabular-nums">${{ formatMoney(actividad.gastos) }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0 flex items-center justify-between gap-3 sm:block">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Utilidad</p>
            <p class="font-bold text-violet-600 text-sm leading-tight sm:mt-0.5 whitespace-nowrap tabular-nums">${{ formatMoney(actividad.utilidad) }}</p>
          </div>
        </template>
        <template v-else>
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0 flex items-center justify-between gap-3 sm:block">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Fecha límite</p>
            <p class="font-bold text-gray-700 text-sm leading-tight sm:mt-0.5 whitespace-nowrap">
              {{ actividad.fecha_limite_pago ? formatDate(actividad.fecha_limite_pago) : '—' }}
            </p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0 flex items-center justify-between gap-3 sm:block">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Asignado</p>
            <p class="font-bold text-sky-600 text-sm leading-tight sm:mt-0.5 whitespace-nowrap tabular-nums">${{ formatMoney(actividad.total_asignado || 0) }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0 flex items-center justify-between gap-3 sm:block">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Recaudado</p>
            <p class="font-bold text-emerald-600 text-sm leading-tight sm:mt-0.5 whitespace-nowrap tabular-nums">${{ formatMoney(actividad.total_pagado || 0) }}</p>
          </div>
        </template>
      </div>

      <!-- Premio entregado (solo rifas liquidadas) -->
      <div
        v-if="esRifaLiquidada"
        class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"
      >
        <p class="text-xs text-gray-500">
          Premio: <span class="font-semibold text-gray-700">{{ formaPagoLabel }}</span>
        </p>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click.stop="$emit('ver-desglose')"
            class="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 text-xs font-semibold hover:bg-emerald-100 transition-colors touch-manipulation"
            title="Ver valores pagados"
          >
            <CurrencyDollarIcon class="w-3.5 h-3.5" />
            Valores
          </button>
          <button
            type="button"
            @click.stop="$emit('cambiar-forma-pago')"
            class="inline-flex items-center gap-1 rounded-lg bg-white text-gray-600 border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50 transition-colors touch-manipulation"
            title="Cambiar forma de pago"
          >
            <PencilSquareIcon class="w-3.5 h-3.5" />
            Cambiar
          </button>
        </div>
      </div>

      <!-- Acciones para actividades finalizadas que NO son rifa: ver quién pagó + registrar gastos -->
      <div v-if="esNoRifaLiquidada" class="mt-3 flex items-center justify-end gap-1.5">
        <button
          type="button"
          @click.stop="$emit('ver-miembros')"
          class="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 text-xs font-semibold hover:bg-emerald-100 transition-colors touch-manipulation"
          title="Ver miembros que pagaron"
        >
          <UsersIcon class="w-3.5 h-3.5" />
          Miembros
        </button>
        <button
          type="button"
          @click.stop="$emit('registrar-gastos')"
          class="inline-flex items-center gap-1 rounded-lg bg-white text-gray-600 border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50 transition-colors touch-manipulation"
          title="Registrar gastos"
        >
          <PencilSquareIcon class="w-3.5 h-3.5" />
          Gastos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  TicketIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  CubeIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'
import { formatDate } from '../utils/formatDate.js'

const props = defineProps({
  actividad: { type: Object, required: true },
})

defineEmits(['click', 'eliminar', 'ver-desglose', 'cambiar-forma-pago', 'ver-miembros', 'registrar-gastos'])

const esLiquidada = computed(
  () => props.actividad.estado === 'liquidada' || !props.actividad.estado
)
const esRifaLiquidada = computed(
  () => props.actividad.tipo === 'rifa' && props.actividad.estado === 'liquidada'
)
// Actividad finalizada que NO es rifa (colecta): permite ver quién pagó y registrar gastos
const esNoRifaLiquidada = computed(
  () => esLiquidada.value && props.actividad.tipo !== 'rifa'
)
const clickable = computed(
  () => props.actividad.estado === 'en_curso' || esRifaLiquidada.value
)
const formaPagoLabel = computed(() =>
  (props.actividad.forma_pago_liquidacion || 'efectivo').toLowerCase() === 'transferencia'
    ? 'Transferencia'
    : 'Efectivo'
)
const icono = computed(() => getIconoActividad(props.actividad.tipo, props.actividad.tipo_rifa))

function getIconoActividad(tipo, tipoRifa = null) {
  if (tipo === 'rifa' && tipoRifa) {
    if (tipoRifa === 'manual') return PencilSquareIcon
    if (tipoRifa === 'aleatoria') return CubeIcon
  }
  const iconos = {
    rifa: TicketIcon,
    bingo: SparklesIcon,
    venta: ShoppingBagIcon,
    evento: CalendarIcon,
    otro: ClipboardDocumentListIcon,
  }
  return iconos[tipo] || ClipboardDocumentListIcon
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}
// Cifras siempre en miles con separador es-CO (sin abreviatura K/M). Se conserva el
// nombre por compatibilidad con el markup de spans móvil/desktop.
function formatMoneyCompact(value) {
  return new Intl.NumberFormat('es-CO').format(Number(value) || 0)
}
</script>

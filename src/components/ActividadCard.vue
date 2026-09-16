<template>
  <!--
    Variante compacta: la usa la vista agrupada. Misma información que la tarjeta
    completa (estado, cifras, premio y acciones), pero en dos líneas y sin franja
    ni icono grande, para que una serie de 12 meses se recorra de un vistazo.
  -->
  <div
    v-if="compacta"
    :class="[
      'relative flex gap-2.5 rounded-xl border border-[color:var(--surface-divider)] bg-white py-2.5 pl-2.5 pr-3 transition-colors',
      clickable ? 'cursor-pointer hover:border-[color:var(--surface-divider-strong)] active:bg-gray-50' : ''
    ]"
    @click="clickable && $emit('click')"
  >
    <!-- Marca de estado: color a la izquierda en vez de franja superior -->
    <span
      class="mt-0.5 w-1 flex-shrink-0 self-stretch rounded-full"
      :class="esLiquidada ? 'bg-emerald-400' : 'bg-amber-400'"
      aria-hidden="true"
    ></span>

    <div class="min-w-0 flex-1">
      <!-- Línea 1: período + tipo + estado + eliminar -->
      <div class="flex items-center gap-2">
        <h3 class="truncate font-display text-sm font-bold leading-tight text-gray-800">
          {{ etiquetaPeriodo || actividad.descripcion }}
        </h3>
        <span
          class="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          :class="esLiquidada ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
        >{{ esLiquidada ? 'Liquidada' : 'En curso' }}</span>
        <button
          type="button"
          @click.stop="$emit('eliminar')"
          class="-my-1.5 -mr-1.5 ml-auto flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-rose-50 hover:text-rose-600 touch-manipulation"
          :title="`Eliminar ${etiquetaPeriodo || 'actividad'}`"
          aria-label="Eliminar actividad"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Cifras en columnas con su etiqueta encima: en móvil la línea corrida de
           «Ing. · Gas. · Util.» obligaba a leer qué era cada número -->
      <div class="mt-2 grid grid-cols-3 gap-2">
        <template v-if="esLiquidada">
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400">Ingresos</p>
            <p class="truncate text-[13px] font-bold leading-tight tabular-nums text-emerald-600">${{ formatMoney(actividad.ingresos) }}</p>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400">Gastos</p>
            <p class="truncate text-[13px] font-bold leading-tight tabular-nums text-rose-600">${{ formatMoney(actividad.gastos) }}</p>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400">Utilidad</p>
            <p class="truncate text-[13px] font-bold leading-tight tabular-nums text-violet-600">${{ formatMoney(actividad.utilidad) }}</p>
          </div>
        </template>
        <template v-else>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400">Recaudado</p>
            <p class="truncate text-[13px] font-bold leading-tight tabular-nums text-emerald-600">${{ formatMoney(actividad.total_pagado || 0) }}</p>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400">Asignado</p>
            <p class="truncate text-[13px] font-bold leading-tight tabular-nums text-sky-600">${{ formatMoney(actividad.total_asignado || 0) }}</p>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-400">Límite</p>
            <p class="truncate text-[13px] font-bold leading-tight text-gray-700">
              {{ actividad.fecha_limite_pago ? formatDate(actividad.fecha_limite_pago) : '—' }}
            </p>
          </div>
        </template>
      </div>

      <!-- Avance del recaudo (solo en curso): dice de un vistazo cuánto falta -->
      <div v-if="!esLiquidada" class="mt-2 flex items-center gap-2">
        <div class="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div class="h-full rounded-full bg-emerald-500 transition-all duration-500" :style="{ width: `${pctRecaudado}%` }"></div>
        </div>
        <span class="flex-shrink-0 text-[10px] font-bold tabular-nums text-gray-400">{{ pctRecaudado }}%</span>
      </div>

      <!-- Forma de pago del premio: dato con etiqueta, no texto suelto en la línea de cifras -->
      <div v-if="esRifaLiquidada" class="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
        <BanknotesIcon class="w-4 h-4 flex-shrink-0 text-gray-400" />
        <span class="text-[11px] text-gray-500">Premio pagado en</span>
        <span class="text-[11px] font-bold text-gray-800">{{ formaPagoLabel }}</span>
      </div>

      <!-- Acciones: botones con borde y 44 px, para que se vean tocables en móvil -->
      <div v-if="esRifaLiquidada || esNoRifaLiquidada" class="mt-2 flex items-stretch gap-1.5">
        <button
          v-if="esRifaLiquidada"
          type="button"
          @click.stop="$emit('ver-desglose')"
          class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95 touch-manipulation"
        >
          <CurrencyDollarIcon class="w-4 h-4 flex-shrink-0" />
          Ver valores
        </button>
        <button
          v-if="esRifaLiquidada"
          type="button"
          @click.stop="$emit('cambiar-forma-pago')"
          class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 touch-manipulation"
        >
          <PencilSquareIcon class="w-4 h-4 flex-shrink-0" />
          Cambiar pago
        </button>
        <button
          v-if="esNoRifaLiquidada"
          type="button"
          @click.stop="$emit('ver-miembros')"
          class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95 touch-manipulation"
        >
          <UsersIcon class="w-4 h-4 flex-shrink-0" />
          Quién pagó
        </button>
        <button
          v-if="esNoRifaLiquidada"
          type="button"
          @click.stop="$emit('registrar-gastos')"
          class="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-95 touch-manipulation"
        >
          <PencilSquareIcon class="w-4 h-4 flex-shrink-0" />
          Gastos
        </button>
      </div>
    </div>
  </div>

  <!--
    Tarjeta de actividad (lenguaje DS: tarjeta blanca limpia, icono en cuadrado marca,
    franja de estado slim, badges DS y chips de métrica neutros). Sustituye al estilo
    antiguo con gradientes y border-l-4. Usada en vista normal, agrupada e individual.
  -->
  <div
    v-else
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
          <!-- Dentro de una serie el título es el período: todas comparten descripción,
               así que el mes es lo único que permite distinguirlas de un vistazo -->
          <div class="min-w-0">
            <h3 class="font-display font-semibold text-gray-800 text-base leading-snug line-clamp-2">
              {{ etiquetaPeriodo || actividad.descripcion }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {{ etiquetaPeriodo ? actividad.descripcion : formatDate(actividad.created_at) }}
            </p>
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
  BanknotesIcon,
} from '@heroicons/vue/24/outline'
import { formatDate } from '../utils/formatDate.js'

const props = defineProps({
  actividad: { type: Object, required: true },
  // Período («Mar 2026»); solo lo pasa la vista agrupada, para titular por mes
  etiquetaPeriodo: { type: String, default: '' },
  // Variante de una línea para las actividades dentro de una serie
  compacta: { type: Boolean, default: false },
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
// Avance del recaudo, solo relevante mientras la actividad está en curso
const pctRecaudado = computed(() => {
  const asignado = Number(props.actividad.total_asignado) || 0
  if (asignado <= 0) return 0
  return Math.min(100, Math.round(((Number(props.actividad.total_pagado) || 0) / asignado) * 100))
})
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

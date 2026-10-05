<template>
  <!-- Vista tarjeta (rejilla) -->
  <div
    v-if="variant === 'grid'"
    :class="[
      'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-borde bg-superficie-tarjeta shadow-sm',
      esCerrada
        ? 'opacity-[0.58] saturate-[0.5]'
        : 'transition-all duration-300 ease-out lg:hover:-translate-y-0.5 lg:hover:border-emerald-200/90 oscuro:lg:hover:border-emerald-500/30 lg:hover:shadow-lg motion-reduce:transition-none motion-reduce:lg:hover:translate-y-0 motion-reduce:lg:hover:shadow-sm',
    ]"
  >

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
        class="relative z-10 flex min-w-0 w-full items-start gap-2"
      >
        <div class="min-w-0 flex-1 pr-1">
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
        <span :class="['etiqueta-natillera', 'etiqueta-natillera--cabecera', `etiqueta-natillera--${etiqueta.tipo}`]">
          <component :is="etiqueta.icono" class="h-3.5 w-3.5" stroke-width="2" aria-hidden="true" />
          {{ etiqueta.texto }}
        </span>
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
          <!-- Recolectado y utilidad, uno al lado del otro: los mismos dos indicadores
               que la natillera muestra en su detalle. -->
          <div class="mb-2 grid grid-cols-2 gap-2">
            <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:px-3 sm:py-2">
              <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
                <BanknotesIcon class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
                Recolectado
              </span>
              <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-texto-fuerte sm:text-lg">
                {{ formatoMoneda(totalRecolectado) }}
              </span>
            </div>
            <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:px-3 sm:py-2">
              <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
                <SparklesIcon class="h-3.5 w-3.5 shrink-0 text-[#3d6b28] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
                Utilidad
              </span>
              <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-[#C2185B] oscuro:text-pink-300 sm:text-lg">
                {{ formatoMoneda(utilidadGenerada) }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1',
                estadoNatillera === 'activa'
                  ? 'bg-emerald-50 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300 ring-emerald-200 oscuro:ring-emerald-500/30'
                  : 'bg-slate-200/95 oscuro:bg-borde/95 text-slate-900 oscuro:text-texto-fuerte ring-2 ring-slate-400/90 oscuro:ring-borde-fuerte/90 shadow-sm',
              ]"
            >
              <span
                v-if="estadoNatillera === 'activa'"
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600/45"
                aria-hidden="true"
              />
              <span
                v-else
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600 oscuro:bg-texto-tenue"
                aria-hidden="true"
              />
              {{ estadoNatillera === 'activa' ? 'Activa' : 'Cerrada' }}
            </span>
          </div>

          <div class="mt-3 space-y-1.5 text-sm text-texto-medio">
            <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <CalendarIcon
                class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta"
                stroke-width="1.75"
                aria-hidden="true"
              />
              <span class="font-semibold text-texto-suave">Inicio</span>
              <span class="font-semibold text-texto-fuerte">{{ etiquetaInicio }}</span>
            </p>
            <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <CalendarIcon
                class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta"
                stroke-width="1.75"
                aria-hidden="true"
              />
              <span class="font-semibold text-texto-suave">Fin</span>
              <span class="font-semibold text-texto-fuerte">{{ etiquetaFin }}</span>
            </p>
          </div>
        </router-link>

        <div
          class="mt-4 flex min-h-[2.5rem] items-center justify-between gap-3 text-texto"
        >
          <router-link
            :to="detalleUrl"
            class="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
          >
            <UserGroupIcon
              class="h-5 w-5 shrink-0 text-[#166534] oscuro:text-marca-tinta"
              stroke-width="1.75"
              aria-hidden="true"
            />
            <span class="font-body text-sm font-semibold tabular-nums leading-snug">
              {{ natillera.socios_count ?? 0 }}
              <span class="font-medium text-texto-secundario"> socios</span>
            </span>
          </router-link>
          <div
            v-if="showPin || showDelete"
            class="flex shrink-0 items-center gap-2"
          >
            <button
              v-if="showPin"
              type="button"
              class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-indigo-200/90 oscuro:border-indigo-500/30 bg-indigo-50 oscuro:bg-indigo-500/15 text-indigo-800 oscuro:text-indigo-300 shadow-sm ring-1 ring-indigo-100/70 oscuro:ring-indigo-500/30 transition hover:bg-indigo-100 oscuro:hover:bg-indigo-500/15 hover:ring-indigo-200/80 oscuro:hover:ring-indigo-500/30 touch-manipulation"
              :title="pinned ? 'Quitar de fijadas' : 'Fijar arriba'"
              @click="$emit('toggle-pin')"
            >
              <PinThumbIcon :pinned="pinned" class="h-[1.35rem] w-[1.35rem]" />
            </button>
            <button
              v-if="showDelete"
              type="button"
              class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-red-200/95 oscuro:border-red-500/30 bg-red-50 oscuro:bg-red-500/15 text-red-600 oscuro:text-red-300 shadow-sm ring-1 ring-red-100/80 oscuro:ring-red-500/30 transition hover:bg-red-100 oscuro:hover:bg-red-500/15 hover:ring-red-200/90 oscuro:hover:ring-red-500/30 hover:text-red-700 oscuro:hover:text-red-300 touch-manipulation"
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
      'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-borde bg-superficie-tarjeta p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4',
      esCerrada
        ? 'opacity-[0.58] saturate-[0.5]'
        : 'transition-all duration-300 ease-out lg:hover:-translate-y-0.5 lg:hover:border-emerald-200/90 oscuro:lg:hover:border-emerald-500/30 lg:hover:shadow-lg motion-reduce:transition-none motion-reduce:lg:hover:translate-y-0 motion-reduce:lg:hover:shadow-sm',
    ]"
  >

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
      <div class="flex min-w-0 items-start gap-2">
        <div class="min-w-0 flex-1">
          <h3 class="font-body text-base font-bold leading-snug text-texto-fuerte">
            {{ natillera.nombre }}
          </h3>
          <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-texto-suave">
            {{ lineaPeriodicidad }}
          </p>
        </div>
        <span :class="['etiqueta-natillera', `etiqueta-natillera--${etiqueta.tipo}`]">
          <component :is="etiqueta.icono" class="h-3.5 w-3.5" stroke-width="2" aria-hidden="true" />
          {{ etiqueta.texto }}
        </span>
      </div>
      <div class="grid w-full min-w-0 grid-cols-2 gap-2">
        <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:py-2">
          <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
            <BanknotesIcon class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
            Recolectado
          </span>
          <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-texto-fuerte sm:text-lg">
            {{ formatoMoneda(totalRecolectado) }}
          </span>
        </div>
        <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:py-2">
          <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
            <SparklesIcon class="h-3.5 w-3.5 shrink-0 text-[#3d6b28] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
            Utilidad
          </span>
          <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-[#C2185B] oscuro:text-pink-300 sm:text-lg">
            {{ formatoMoneda(utilidadGenerada) }}
          </span>
        </div>
      </div>
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-texto-secundario">
        <span class="inline-flex items-center gap-1">
          <CalendarIcon
            class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta"
            stroke-width="1.75"
            aria-hidden="true"
          />
          <span class="font-medium text-texto-tenue">Inicio</span>
          {{ etiquetaInicio }}
        </span>
        <span class="inline-flex items-center gap-1">
          <CalendarIcon
            class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta"
            stroke-width="1.75"
            aria-hidden="true"
          />
          <span class="font-medium text-texto-tenue">Fin</span>
          {{ etiquetaFin }}
        </span>
      </div>
    </router-link>

    <div
      class="relative z-[1] flex flex-1 flex-wrap items-center gap-4 border-t border-borde-suave pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0"
    >
      <div class="flex items-center gap-2 text-texto">
        <UserGroupIcon class="h-5 w-5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" />
        <span class="text-sm font-semibold tabular-nums">
          {{ natillera.socios_count ?? 0 }}
          <span class="font-medium text-texto-secundario"> socios</span>
        </span>
      </div>
      <span
        :class="[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1',
          estadoNatillera === 'activa'
            ? 'bg-emerald-50 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300 ring-emerald-200 oscuro:ring-emerald-500/30'
            : 'bg-slate-200/95 oscuro:bg-borde/95 text-slate-900 oscuro:text-texto-fuerte ring-2 ring-slate-400/90 oscuro:ring-borde-fuerte/90 shadow-sm',
        ]"
      >
        <span
          v-if="estadoNatillera === 'activa'"
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600/45"
          aria-hidden="true"
        />
        <span
          v-else
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600 oscuro:bg-texto-tenue"
          aria-hidden="true"
        />
        {{ estadoNatillera === 'activa' ? 'Activa' : 'Cerrada' }}
      </span>
    </div>

    <div class="relative z-[1] flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
      <button
        v-if="showPin"
        type="button"
        class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-indigo-200/95 oscuro:border-indigo-500/30 bg-indigo-50 oscuro:bg-indigo-500/15 text-indigo-800 oscuro:text-indigo-300 shadow-sm ring-1 ring-indigo-100/80 oscuro:ring-indigo-500/30 transition hover:border-indigo-300 oscuro:hover:border-indigo-500/30 hover:bg-indigo-100 oscuro:hover:bg-indigo-500/15 hover:text-indigo-950 oscuro:hover:text-indigo-300 hover:ring-indigo-200/90 oscuro:hover:ring-indigo-500/30 touch-manipulation"
        :title="pinned ? 'Quitar de fijadas' : 'Fijar arriba'"
        @click.stop="$emit('toggle-pin')"
      >
        <PinThumbIcon :pinned="pinned" class="h-5 w-5" />
      </button>
      <button
        v-if="showDelete"
        type="button"
        class="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md border-2 border-red-300 oscuro:border-red-500/30 bg-red-50 oscuro:bg-red-500/15 text-red-600 oscuro:text-red-300 shadow-sm transition hover:border-red-400 hover:bg-red-100 oscuro:hover:bg-red-500/15 hover:text-red-700 oscuro:hover:text-red-300 touch-manipulation"
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
import { TrashIcon, UserGroupIcon, CalendarIcon, BanknotesIcon, SparklesIcon, KeyIcon, ShareIcon, EyeIcon } from '@heroicons/vue/24/outline'
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
  /* Los dos indicadores de dinero, calculados con utils/indicadoresNatillera.js:
     son los mismos «Recaudado» y «Utilidad» que muestra el detalle de la natillera. */
  totalRecolectado: { type: Number, default: 0 },
  utilidadGenerada: { type: Number, default: 0 },
  /** 'grid' = tarjeta; 'list' = fila */
  variant: { type: String, default: 'grid' },
})

defineEmits(['toggle-pin', 'delete'])

const detalleUrl = computed(() => `/natilleras/${props.natillera.id}`)

/*
 * Qué relación tiene la cuenta con la natillera, en una etiqueta junto al nombre. Antes
 * eran cintas cruzadas en la esquina; ahora es el mismo formato de la tarjeta de socio
 * («Socio»), para que las cuatro se lean igual: Propia · Compartida · De otro usuario · Socio.
 */
const etiqueta = computed(() => {
  if (props.ribbonOtroUsuario) return { tipo: 'otro', texto: 'De otro usuario', icono: EyeIcon }
  if (props.ribbonCompartida) return { tipo: 'compartida', texto: 'Compartida', icono: ShareIcon }
  return { tipo: 'propia', texto: 'Propia', icono: KeyIcon }
})

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

<style scoped>
/*
 * Etiqueta de relación con la natillera (misma forma que «Socio» en la tarjeta de socio).
 * Paleta pensada contra el verde de marca: blanco para lo propio (lo normal), el acento
 * naranja de la marca para «Socio», azul para «Compartida» (frío, vecino del verde, no
 * choca con el naranja) y pizarra para la vista interna de superadmin. Solo «Propia» es
 * clara: con «Compartida» en azul cielo pálido las dos eran píldoras casi blancas y no se
 * distinguían de un vistazo. Relleno sólido contra relleno blanco sí se lee, sobre la
 * cabecera verde y sobre el blanco de la fila (blanco sobre #0369a1: 5,9:1).
 */
.etiqueta-natillera {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
}
/* tema-fijo: etiquetas sobre la cabecera verde de la tarjeta; se leen igual en los dos modos */
.etiqueta-natillera--propia { background: #ffffff; color: #1B5E37; box-shadow: inset 0 0 0 1px rgba(27, 94, 55, 0.22); }
.etiqueta-natillera--compartida { background: #0369a1; color: #ffffff; box-shadow: inset 0 0 0 1px rgba(3, 105, 161, 0.4); } /* tema-fijo */
.etiqueta-natillera--otro { background: #475569; color: #ffffff; box-shadow: inset 0 0 0 1px rgba(71, 85, 105, 0.4); } /* tema-fijo */
/* Sobre la cabecera verde, una sombra leve la despega del fondo y un filo claro separa
   el azul y la pizarra del verde oscuro. */
.etiqueta-natillera--cabecera { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.35); }

/* Modo oscuro: en la vista de lista la etiqueta «propia» va sobre la tarjeta, no
   sobre la cabecera verde; ahí la píldora blanca desentona y pasa a verde suave. */
:where([data-tema=oscuro]) .etiqueta-natillera--propia:not(.etiqueta-natillera--cabecera) {
  background: var(--marca-suave);
  color: var(--marca-tinta);
  box-shadow: inset 0 0 0 1px var(--marca-tinta-borde);
}
</style>

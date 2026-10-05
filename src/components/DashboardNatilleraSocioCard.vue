<template>
  <!--
    Tarjeta de una natillera donde la cuenta es SOCIO. Misma carcasa que
    DashboardNatilleraCard (cabecera verde, arte de esquina, píldoras, fechas) para que se
    lea como una natillera más; cambian el contenido —lo del socio, no lo de la natillera—
    y la etiqueta «Socio» junto al nombre, que es lo único con otro color (el acento
    naranja de la marca). Lleva al portal del socio, no al detalle del admin.
  -->
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
      class="relative flex min-h-[4.5rem] shrink-0 items-start overflow-hidden bg-gradient-to-br from-[#166534] via-[#166534] to-[#124a2c] px-3 pb-3 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:min-h-[4.75rem] sm:px-4 sm:pb-3.5 sm:pt-3.5"
    >
      <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div class="absolute -right-8 -top-20 h-[11rem] w-[11rem] rounded-full bg-white/[0.055] blur-[2px]" />
        <div class="absolute -bottom-14 -left-10 h-[7rem] w-[7rem] rounded-full bg-emerald-300/[0.09]" />
        <div class="absolute right-[10%] top-2 h-2 w-2 rounded-full bg-white/25 ring-1 ring-white/10" />
        <div class="absolute right-[22%] top-4 h-1 w-1 rounded-full bg-white/18" />
        <div class="absolute left-[6%] top-2 h-11 w-11 rounded-full border border-white/[0.07]" />
        <div class="absolute bottom-2 left-[28%] h-5 w-5 rotate-12 rounded-md border border-white/[0.05]" />
      </div>
      <router-link :to="portalUrl" class="relative z-10 flex min-w-0 w-full items-start gap-2">
        <div class="min-w-0 flex-1">
          <h3 class="font-body text-base font-bold leading-snug tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
            {{ item.natillera_nombre }}
          </h3>
          <p class="mt-0.5 text-[10px] font-medium uppercase leading-tight tracking-wide text-emerald-100/90">
            {{ lineaPeriodicidad }}
          </p>
        </div>
        <span class="etiqueta-socio etiqueta-socio--cabecera">
          <UserIcon class="h-3.5 w-3.5" stroke-width="2" aria-hidden="true" />
          Socio
        </span>
      </router-link>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
      <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <NatilleraCardCornerArt />
      </div>
      <router-link :to="portalUrl" class="relative z-[1] flex min-h-0 flex-1 flex-col text-left">
        <!-- Lo del socio, en el mismo formato que Recolectado / Utilidad -->
        <div class="mb-2 grid grid-cols-2 gap-2">
          <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:px-3 sm:py-2">
            <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
              <BanknotesIcon class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
              Ahorrado
            </span>
            <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-texto-fuerte sm:text-lg">
              {{ formatoMoneda(item.total_ahorrado) }}
            </span>
          </div>
          <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:px-3 sm:py-2">
            <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
              <CalendarDaysIcon class="h-3.5 w-3.5 shrink-0 text-[#3d6b28] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
              Tu cuota
            </span>
            <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-texto-fuerte sm:text-lg">
              {{ formatoMoneda(item.valor_cuota) }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1', estadoSocio.clase]">
            <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="estadoSocio.punto" aria-hidden="true" />
            {{ estadoSocio.texto }}
          </span>
          <span
            v-if="esCerrada"
            class="inline-flex items-center gap-1.5 rounded-full bg-slate-200/95 oscuro:bg-borde/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-900 oscuro:text-texto-fuerte ring-2 ring-slate-400/90 oscuro:ring-borde-fuerte/90"
          >Cerrada</span>
        </div>

        <div class="mt-3 space-y-1.5 text-sm text-texto-medio">
          <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <CalendarIcon class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
            <span class="font-semibold text-texto-suave">Inicio</span>
            <span class="font-semibold text-texto-fuerte">{{ etiquetaInicio }}</span>
          </p>
          <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <CalendarIcon class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
            <span class="font-semibold text-texto-suave">Fin</span>
            <span class="font-semibold text-texto-fuerte">{{ etiquetaFin }}</span>
          </p>
        </div>

        <span class="mt-4 flex min-h-[2.5rem] items-center gap-2 text-sm font-semibold text-[#166534] oscuro:text-marca-tinta">
          <WalletIcon class="h-5 w-5 shrink-0" stroke-width="1.75" aria-hidden="true" />
          Ver mi estado de cuenta
          <ChevronRightIcon class="ml-auto h-4 w-4" aria-hidden="true" />
        </span>
      </router-link>
    </div>
  </div>

  <!-- Vista lista (fila) -->
  <router-link
    v-else
    :to="portalUrl"
    :class="[
      'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-borde bg-superficie-tarjeta p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4',
      esCerrada
        ? 'opacity-[0.58] saturate-[0.5]'
        : 'transition-all duration-300 ease-out lg:hover:-translate-y-0.5 lg:hover:border-emerald-200/90 oscuro:lg:hover:border-emerald-500/30 lg:hover:shadow-lg motion-reduce:transition-none motion-reduce:lg:hover:translate-y-0 motion-reduce:lg:hover:shadow-sm',
    ]"
  >
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl" aria-hidden="true">
      <NatilleraCardCornerArt compact />
    </div>

    <div class="relative z-[1] flex min-w-0 flex-1 flex-col gap-3">
      <div class="flex min-w-0 items-start gap-2">
        <div class="min-w-0 flex-1">
          <h3 class="font-body text-base font-bold leading-snug text-texto-fuerte">{{ item.natillera_nombre }}</h3>
          <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-texto-suave">{{ lineaPeriodicidad }}</p>
        </div>
        <span class="etiqueta-socio">
          <UserIcon class="h-3.5 w-3.5" stroke-width="2" aria-hidden="true" />
          Socio
        </span>
      </div>
      <div class="grid w-full min-w-0 grid-cols-2 gap-2">
        <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:py-2">
          <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
            <BanknotesIcon class="h-3.5 w-3.5 shrink-0 text-[#166534] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
            Ahorrado
          </span>
          <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-texto-fuerte sm:text-lg">
            {{ formatoMoneda(item.total_ahorrado) }}
          </span>
        </div>
        <div class="min-w-0 rounded-md border border-borde-suave/90 bg-superficie-suave/70 px-2.5 py-1.5 text-left sm:py-2">
          <span class="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-texto-tenue">
            <CalendarDaysIcon class="h-3.5 w-3.5 shrink-0 text-[#3d6b28] oscuro:text-marca-tinta" stroke-width="1.75" aria-hidden="true" />
            Tu cuota
          </span>
          <span class="mt-0.5 block min-w-0 truncate text-base font-semibold tabular-nums leading-none text-texto-fuerte sm:text-lg">
            {{ formatoMoneda(item.valor_cuota) }}
          </span>
        </div>
      </div>
    </div>

    <div class="relative z-[1] flex flex-1 flex-wrap items-center gap-3 border-t border-borde-suave pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
      <span :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1', estadoSocio.clase]">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="estadoSocio.punto" aria-hidden="true" />
        {{ estadoSocio.texto }}
      </span>
      <span class="inline-flex items-center gap-1 text-sm font-semibold text-[#166534] oscuro:text-marca-tinta">
        Ver mi estado de cuenta
        <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronRightIcon,
  UserIcon,
  WalletIcon
} from '@heroicons/vue/24/outline'
import { parseDateLocal } from '../utils/formatDate'
import { formatearMesAnio } from '../utils/natilleraFormat'
import NatilleraCardCornerArt from './NatilleraCardCornerArt.vue'

const props = defineProps({
  /** Fila de `portal_mis_natilleras`. */
  item: { type: Object, required: true },
  /** 'grid' = tarjeta; 'list' = fila (igual que DashboardNatilleraCard). */
  variant: { type: String, default: 'grid' }
})

const portalUrl = computed(() => `/mi-natillera/${props.item.socio_natillera_id}`)
const esCerrada = computed(() => String(props.item.natillera_estado || 'activa').toLowerCase() === 'cerrada')

// Mismo semáforo que la página de Notificar: lo más urgente manda.
const estadoSocio = computed(() => {
  const i = props.item
  if (i.cuotas_mora > 0) {
    return {
      texto: i.cuotas_mora === 1 ? '1 cuota en mora' : `${i.cuotas_mora} cuotas en mora`,
      clase: 'bg-red-50 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300 ring-red-200 oscuro:ring-red-500/30',
      punto: 'bg-red-500'
    }
  }
  if (i.cuotas_pendientes > 0) {
    return {
      texto: i.cuotas_pendientes === 1 ? '1 por pagar' : `${i.cuotas_pendientes} por pagar`,
      clase: 'bg-amber-50 oscuro:bg-amber-500/15 text-amber-800 oscuro:text-amber-300 ring-amber-200 oscuro:ring-amber-500/30',
      punto: 'bg-amber-500'
    }
  }
  return { texto: 'Al día', clase: 'bg-emerald-50 oscuro:bg-emerald-500/15 text-emerald-800 oscuro:text-emerald-300 ring-emerald-200 oscuro:ring-emerald-500/30', punto: 'bg-emerald-600/45' }
})

const etiquetaInicio = computed(() => {
  const i = props.item
  const d = parseDateLocal(i.fecha_inicio)
  if (d && !isNaN(d.getTime())) {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`
  }
  return formatearMesAnio(i.mes_inicio || 1, i.anio_inicio || i.anio)
})

const etiquetaFin = computed(() => formatearMesAnio(props.item.mes_fin || 12, props.item.anio))

const lineaPeriodicidad = computed(() =>
  (props.item.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual').toUpperCase()
)

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(valor) || 0)
}
</script>

<style scoped>
/*
 * La tarjeta es idéntica a las demás (verde de marca). Lo único con otro color es la
 * etiqueta «Socio», en el acento naranja de la marca: el complementario cálido del verde,
 * contrasta sin desentonar. Mismo formato que Propia / Compartida (DashboardNatilleraCard).
 */
.etiqueta-socio {
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
  /* tema-fijo: chip naranja de rol sobre la cabecera verde; se lee igual en los dos modos */
  background: var(--color-accent-200, #fed7aa);
  color: var(--color-accent-900, #7c2d12); /* tema-fijo */
  box-shadow: inset 0 0 0 1px rgba(194, 65, 12, 0.22);
}
.etiqueta-socio--cabecera { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22); }

/* Modo oscuro: fuera de la cabecera verde (vista de lista) el chip va sobre la tarjeta */
:where([data-tema=oscuro]) .etiqueta-socio:not(.etiqueta-socio--cabecera) {
  background: rgb(249 115 22 / 0.15);
  color: #fdba74;
  box-shadow: inset 0 0 0 1px rgb(249 115 22 / 0.3);
}
</style>

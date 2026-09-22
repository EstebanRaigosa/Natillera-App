<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <ReceiptPercentIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">
              <span class="sm:hidden">Pagos</span>
              <span class="hidden sm:inline">Pagos de los socios</span>
            </h1>
            <p class="ds-page-header__sub hidden sm:block">
              Todo lo que ha pagado cada socio, mes a mes: cuotas, sanciones, actividades y préstamos
            </p>
          </div>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button type="button" class="ds-btn ds-btn--secondary" :disabled="cargando" @click="cargar">
            <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            class="ds-btn ds-btn--secondary"
            :disabled="exportando || visibles.length === 0"
            @click="exportarExcel"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span>{{ exportando ? 'Exportando…' : 'Excel' }}</span>
          </button>
        </div>
      </div>
    </header>

    <LoadingScreen :visible="cargando" text="Reuniendo los pagos de cada socio" />

    <template v-if="!cargando">
      <div
        v-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      >
        {{ error }}
        <button type="button" class="ml-2 font-semibold underline" @click="cargar">Reintentar</button>
      </div>

      <template v-else-if="pagos.length === 0">
        <section class="ds-empty-state">
          <div class="ds-empty-state__header">
            <div class="ds-empty-state__icon-wrap">
              <ReceiptPercentIcon class="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h2 class="ds-empty-state__title">Todavía no hay pagos registrados</h2>
            <p class="ds-empty-state__subtitle">
              En cuanto alguien pague una cuota, una sanción, un aporte a una actividad o una cuota de
              su préstamo, aparecerá aquí ordenado por mes.
            </p>
          </div>
        </section>
      </template>

      <template v-else>
        <!--
          Resumen de lo que hay a la vista, no del histórico: si se filtra un socio y un
          trimestre, estas cifras son las de ese socio en ese trimestre.
        -->
        <section
          class="overflow-hidden rounded-2xl border bg-gray-50/70"
          :class="unSoloSocio ? 'border-[#1B5E37]/25' : 'border-gray-200'"
        >
          <!--
            Con una sola persona a la vista, su nombre encabeza sus propias cifras en vez de
            repetirse en cada mes de la lista: es el mismo dato, dicho una vez y donde sirve.
          -->
          <div
            v-if="unSoloSocio"
            class="flex items-center gap-2.5 border-b border-[#1B5E37]/20 bg-[#1B5E37]/[0.07] px-3 py-2.5 sm:px-4"
          >
            <span
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
              :class="colorSocio(nombreSocioUnico)"
              aria-hidden="true"
            >{{ iniciales(nombreSocioUnico) }}</span>
            <span class="min-w-0 flex-1">
              <span class="block text-[0.625rem] font-semibold uppercase tracking-wide text-[#1B5E37]/70">Pagos de</span>
              <span class="block truncate font-display text-sm font-bold text-gray-900 sm:text-base">{{ nombreSocioUnico }}</span>
            </span>
            <button
              v-if="filtroSocio"
              type="button"
              class="flex min-h-[44px] flex-shrink-0 touch-manipulation items-center gap-1 rounded-full border border-[#1B5E37]/25 bg-white px-3 text-xs font-semibold text-[#1B5E37] transition-colors hover:bg-[#1B5E37]/8"
              @click="filtroSocio = ''"
            >
              <XMarkIcon class="h-3.5 w-3.5 flex-shrink-0" />
              <span>Ver a todos</span>
            </button>
          </div>

          <div class="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 bg-white">
            <div class="px-3 py-3 text-center">
              <p class="font-display text-base font-extrabold tabular-nums text-[#1B5E37] sm:text-xl">
                {{ formatMoney(totalVisible) }}
              </p>
              <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">Recaudado</p>
            </div>
            <div class="px-3 py-3 text-center">
              <p class="font-display text-base font-extrabold tabular-nums text-gray-800 sm:text-xl">
                {{ visibles.length }}
              </p>
              <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">Pagos</p>
            </div>
            <div class="px-3 py-3 text-center">
              <p class="font-display text-base font-extrabold tabular-nums text-gray-800 sm:text-xl">
                {{ unSoloSocio ? mesesVisibles : sociosVisibles }}
              </p>
              <p class="mt-0.5 text-[0.6875rem] uppercase tracking-wide text-gray-500">
                <template v-if="unSoloSocio">{{ mesesVisibles === 1 ? 'Mes' : 'Meses' }}</template>
                <template v-else>{{ sociosVisibles === 1 ? 'Socio' : 'Socios' }}</template>
              </p>
            </div>
          </div>

          <div v-if="desgloseVisible.length > 0" class="space-y-1.5 px-4 py-3">
            <div v-for="linea in desgloseVisible" :key="linea.tipo" class="flex items-center gap-2">
              <span class="h-2 w-2 flex-shrink-0 rounded-full" :class="colorTipo(linea.tipo)" aria-hidden="true" />
              <span class="w-24 flex-shrink-0 truncate text-xs text-gray-600 sm:w-40">{{ linea.etiqueta }}</span>
              <span class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-200">
                <span class="block h-full rounded-full" :class="colorTipo(linea.tipo)" :style="{ width: linea.porcentaje + '%' }" />
              </span>
              <span class="w-24 flex-shrink-0 text-right font-semibold tabular-nums text-xs text-gray-800 sm:w-28">
                {{ formatMoney(linea.total) }}
              </span>
            </div>
          </div>
        </section>

        <!--
          Filtros. En móvil solo se ve el buscador y el botón que abre el resto: el panel
          desplegado ocupaba media pantalla antes de llegar a los pagos, que es lo que se
          viene a mirar. Lo aplicado se sigue viendo plegado, en pastillas que se quitan de
          una en una. En escritorio nace abierto, que ahí sí sobra sitio.
        -->
        <section class="ds-card space-y-2.5">
          <div class="flex items-center gap-2">
            <div
              class="flex min-w-0 flex-1 items-center rounded-xl border border-[color:var(--surface-divider-strong)] bg-white focus-within:border-[#1B5E37] focus-within:shadow-[0_0_0_3px_rgba(27,94,55,0.18)]"
            >
              <span class="flex-shrink-0 pl-3 text-gray-400" aria-hidden="true">
                <MagnifyingGlassIcon class="h-5 w-5" />
              </span>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Buscar socio o concepto…"
                aria-label="Buscar pagos"
                class="min-w-0 flex-1 border-none bg-transparent px-2 py-3 text-base outline-none focus:ring-0"
              />
              <button
                v-if="busqueda.trim()"
                type="button"
                class="flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-400 touch-manipulation hover:text-gray-600"
                aria-label="Limpiar búsqueda"
                @click="busqueda = ''"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              class="relative flex min-h-[44px] flex-shrink-0 touch-manipulation items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors"
              :class="panelFiltros
                ? 'border-[#1B5E37] bg-[#1B5E37] text-white'
                : 'border-[color:var(--surface-divider-strong)] bg-white text-gray-600 hover:bg-gray-50'"
              :aria-expanded="panelFiltros"
              aria-label="Mostrar filtros"
              @click="panelFiltros = !panelFiltros"
            >
              <FunnelIcon class="h-4 w-4 flex-shrink-0" />
              <span class="hidden sm:inline">Filtros</span>
              <span
                v-if="chipsFiltros.length > 0"
                class="flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[0.625rem] font-bold"
                :class="panelFiltros ? 'bg-white text-[#1B5E37]' : 'bg-[#1B5E37] text-white'"
              >{{ chipsFiltros.length }}</span>
            </button>
          </div>

          <!-- Plegado, lo aplicado sigue a la vista: saber qué filtra no debe costar un toque. -->
          <div v-if="!panelFiltros && chipsFiltros.length > 0" class="flex flex-wrap gap-1.5">
            <button
              v-for="chip in chipsFiltros"
              :key="chip.clave"
              type="button"
              class="flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-full border border-[#1B5E37]/25 bg-[#1B5E37]/8 px-3 text-xs font-semibold text-[#14532d] transition-colors hover:bg-[#1B5E37]/12"
              :aria-label="`Quitar filtro ${chip.etiqueta}`"
              @click="chip.quitar()"
            >
              <span class="max-w-[10rem] truncate">{{ chip.etiqueta }}</span>
              <XMarkIcon class="h-3.5 w-3.5 flex-shrink-0" />
            </button>
          </div>

          <div v-if="panelFiltros" class="space-y-2 border-t border-gray-100 pt-2.5">
            <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <select
                v-model="filtroSocio"
                aria-label="Filtrar por socio"
                class="ds-input min-w-0 sm:w-auto sm:min-w-[12rem] sm:flex-none"
              >
                <option value="">Todos los socios</option>
                <option v-for="nombre in socios" :key="nombre" :value="nombre">{{ nombre }}</option>
              </select>

              <select
                v-model="filtroTipo"
                aria-label="Filtrar por concepto"
                class="ds-input min-w-0 sm:w-auto sm:min-w-[11rem] sm:flex-none"
              >
                <option value="">Todo concepto</option>
                <option v-for="t in TIPOS_PAGO_SOCIO" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>

              <!--
                El período era una rejilla de cinco botones: tres filas en un móvil de 360 px
                para elegir una sola cosa. Un desplegable dice lo mismo en una línea.
              -->
              <select
                v-model="periodo"
                aria-label="Filtrar por período"
                class="ds-input col-span-2 min-w-0 sm:w-auto sm:min-w-[12rem] sm:flex-none"
              >
                <option v-for="p in PERIODOS" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>

            <div v-if="periodo === 'rango'" class="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div>
                <label class="ds-label text-xs" for="pagos-desde">Desde</label>
                <input id="pagos-desde" v-model="desde" type="date" class="ds-input" />
              </div>
              <span class="hidden pt-5 text-xs text-gray-400 sm:block" aria-hidden="true">→</span>
              <div>
                <label class="ds-label text-xs" for="pagos-hasta">Hasta</label>
                <input id="pagos-hasta" v-model="hasta" type="date" class="ds-input" />
              </div>
            </div>

            <button
              v-if="hayFiltros"
              type="button"
              class="min-h-[44px] w-full touch-manipulation rounded-full px-3 text-xs font-semibold text-[#1B5E37] hover:bg-[#1B5E37]/8 sm:w-auto"
              @click="limpiarFiltros"
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        <div class="flex items-center gap-2">
          <!-- Misma lista, dos maneras de leerla: el mes como eje, o la persona como eje. -->
          <div v-if="!unSoloSocio" class="inline-flex flex-1 rounded-full border border-gray-200 bg-white p-1 sm:flex-none">
            <button
              v-for="modo in MODOS"
              :key="modo.value"
              type="button"
              class="min-h-[44px] flex-1 touch-manipulation rounded-full px-4 text-xs font-semibold transition-colors sm:flex-none"
              :class="agrupacion === modo.value ? 'bg-[#1B5E37] text-white' : 'text-gray-600 hover:bg-gray-50'"
              :aria-pressed="agrupacion === modo.value"
              @click="agrupacion = modo.value"
            >
              {{ modo.label }}
            </button>
          </div>

          <button
            type="button"
            class="ml-auto flex min-h-[44px] flex-shrink-0 touch-manipulation items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100"
            @click="alternarTodo"
          >
            <component :is="todoPlegado ? ChevronDoubleDownIcon : ChevronDoubleUpIcon" class="h-4 w-4 flex-shrink-0" />
            <span>{{ todoPlegado ? 'Expandir todo' : 'Colapsar todo' }}</span>
          </button>
        </div>

        <!-- Hay pagos, pero los filtros no dejan ver ninguno -->
        <section
          v-if="visibles.length === 0"
          class="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center"
        >
          <FunnelIcon class="mx-auto h-8 w-8 text-gray-300" />
          <p class="mt-3 font-display text-base font-bold text-gray-800">Ningún pago con estos filtros</p>
          <p class="mt-1 text-sm text-gray-500">
            Hay {{ pagos.length }} pagos registrados, pero ninguno encaja.
          </p>
          <button type="button" class="ds-btn ds-btn--secondary mt-4" @click="limpiarFiltros">Limpiar filtros</button>
        </section>

        <section v-else class="space-y-3">
          <article
            v-for="grupo in grupos"
            :key="grupo.clave"
            class="overflow-hidden rounded-2xl border bg-white"
            :class="grupo.esSocio ? 'border-gray-200' : 'border-[#1B5E37]/25'"
          >
            <!--
              Cabecera del grupo. El mes va en banda verde de marca y el socio en blanco con
              su avatar: verde = periodo, avatar = persona. Se aprende una vez y sirve en los
              dos ejes, que es lo que permite distinguir el mes de un vistazo al filtrar.
            -->
            <button
              v-if="grupo.esSocio"
              type="button"
              class="flex w-full touch-manipulation items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 sm:px-4"
              :aria-expanded="abierto1(grupo.clave)"
              @click="alternar1(grupo.clave)"
            >
              <span
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
                :class="colorSocio(grupo.titulo)"
                aria-hidden="true"
              >{{ iniciales(grupo.titulo) }}</span>

              <span class="min-w-0 flex-1">
                <span class="block truncate font-display text-base font-bold text-gray-900">{{ grupo.titulo }}</span>
                <span class="mt-0.5 block truncate text-xs text-gray-500">{{ grupo.subtitulo }}</span>
              </span>

              <span class="flex-shrink-0 font-display text-base font-extrabold tabular-nums text-[#1B5E37] sm:text-lg">
                {{ formatMoney(grupo.total) }}
              </span>

              <ChevronDownIcon
                class="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': abierto1(grupo.clave) }"
                aria-hidden="true"
              />
            </button>

            <button
              v-else
              type="button"
              class="flex w-full touch-manipulation items-center gap-3 bg-[#1B5E37] px-3 py-3.5 text-left text-white transition-colors hover:bg-[#174d2d] active:bg-[#123f25] sm:px-4"
              :aria-expanded="abierto1(grupo.clave)"
              @click="alternar1(grupo.clave)"
            >
              <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15" aria-hidden="true">
                <CalendarDaysIcon class="h-5 w-5" />
              </span>

              <span class="min-w-0 flex-1">
                <span class="block truncate font-display text-base font-extrabold tracking-tight sm:text-lg">{{ grupo.titulo }}</span>
                <span class="mt-0.5 block truncate text-xs text-emerald-100">{{ grupo.subtitulo }}</span>
              </span>

              <span class="flex-shrink-0 font-display text-base font-extrabold tabular-nums sm:text-lg">
                {{ formatMoney(grupo.total) }}
              </span>

              <ChevronDownIcon
                class="h-5 w-5 flex-shrink-0 text-white/70 transition-transform duration-200"
                :class="{ 'rotate-180': abierto1(grupo.clave) }"
                aria-hidden="true"
              />
            </button>

            <template v-if="abierto1(grupo.clave)">
              <!-- Un solo socio a la vista: sus pagos cuelgan directos del mes. -->
              <ul v-if="grupo.pagosDirectos" class="space-y-1 bg-gray-50/70 px-3 py-2 sm:px-4">
                <PagoFila v-for="pago in grupo.pagosDirectos" :key="pago.clave" :pago="pago" />
              </ul>

              <ul v-else class="divide-y divide-gray-100 border-t border-gray-100">
                <li v-for="hijo in grupo.hijos" :key="hijo.clave">
                  <!-- Segundo nivel: el socio dentro del mes, o el mes dentro del socio. -->
                  <button
                    type="button"
                    class="flex w-full touch-manipulation items-center gap-2.5 px-3 py-2.5 text-left transition-colors sm:px-4"
                    :class="grupo.esSocio
                      ? 'border-l-4 border-[#1B5E37] bg-[#1B5E37]/[0.07] hover:bg-[#1B5E37]/12 active:bg-[#1B5E37]/15'
                      : 'hover:bg-gray-50 active:bg-gray-100'"
                    :aria-expanded="abierto2(hijo.clave)"
                    @click="alternar2(hijo.clave)"
                  >
                    <span
                      v-if="grupo.esSocio"
                      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1B5E37]/12 text-[#1B5E37]"
                      aria-hidden="true"
                    >
                      <CalendarDaysIcon class="h-4 w-4" />
                    </span>
                    <span
                      v-else
                      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display text-[0.6875rem] font-bold"
                      :class="colorSocio(hijo.titulo)"
                      aria-hidden="true"
                    >{{ iniciales(hijo.titulo) }}</span>

                    <span class="min-w-0 flex-1">
                      <span
                        class="block truncate text-sm font-semibold"
                        :class="grupo.esSocio ? 'font-display font-bold text-[#14532d]' : 'text-gray-800'"
                      >{{ hijo.titulo }}</span>
                      <!-- Los conceptos como puntos de color: se ve de un vistazo si ese mes
                           pagó solo la cuota o también sanción y actividad. -->
                      <span class="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          v-for="t in hijo.tipos"
                          :key="t"
                          class="inline-flex items-center gap-1 rounded-full bg-white/80 px-1.5 py-0.5 text-[0.625rem] font-medium text-gray-600"
                        >
                          <span class="h-1.5 w-1.5 rounded-full" :class="colorTipo(t)" aria-hidden="true" />
                          {{ etiquetaTipo(t) }}
                        </span>
                      </span>
                    </span>

                    <span class="flex-shrink-0 font-display text-sm font-bold tabular-nums text-gray-900">
                      {{ formatMoney(hijo.total) }}
                    </span>

                    <ChevronDownIcon
                      class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
                      :class="{ 'rotate-180': abierto2(hijo.clave) }"
                      aria-hidden="true"
                    />
                  </button>

                  <!-- Tercer nivel: los apuntes uno a uno, con su fecha real y su forma de pago. -->
                  <ul v-if="abierto2(hijo.clave)" class="space-y-1 bg-gray-50/70 px-3 py-2 sm:px-4">
                    <PagoFila v-for="pago in hijo.pagos" :key="pago.clave" :pago="pago" />
                  </ul>
                </li>
              </ul>
            </template>
          </article>
        </section>

        <button
          v-if="visibles.length > 0"
          type="button"
          class="ds-btn ds-btn--secondary ds-btn--block sm:hidden"
          :disabled="exportando"
          @click="exportarExcel"
        >
          <ArrowDownTrayIcon class="h-4 w-4" />
          <span>{{ exportando ? 'Exportando…' : 'Exportar a Excel' }}</span>
        </button>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ReceiptPercentIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import LoadingScreen from '../../components/LoadingScreen.vue'
import PagoFila from '../../components/pagos/PagoFila.vue'
import {
  usePagosSocios,
  TIPOS_PAGO_SOCIO,
  etiquetaTipo,
  colorTipo,
  colorSocio,
  iniciales,
  nombreMes
} from '../../composables/usePagosSocios'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate, formatDateToLocalISO, getCurrentDateISO, parseDateLocal } from '../../utils/formatDate'
import { useNotificationStore } from '../../stores/notifications'

const route = useRoute()
const id = computed(() => route.params.id)
const notificaciones = useNotificationStore()

const { cargando, error, natillera, pagos, socios, cargar } = usePagosSocios(id)

onMounted(cargar)
watch(id, (nuevo, anterior) => {
  if (nuevo && nuevo !== anterior) cargar()
})

/* ---------------------------------- Filtros ---------------------------------- */

const hoy = getCurrentDateISO()

const PERIODOS = [
  { value: 'todo', label: 'Todo el tiempo' },
  { value: 'mes', label: 'Este mes' },
  { value: 'mes-anterior', label: 'Mes pasado' },
  { value: 'anio', label: 'Este año' },
  { value: 'rango', label: 'Entre dos fechas…' }
]

const MODOS = [
  { value: 'mes', label: 'Por mes' },
  { value: 'socio', label: 'Por socio' }
]

const busqueda = ref('')
const filtroSocio = ref('')
const filtroTipo = ref('')
const desde = ref('')
const hasta = ref('')
const periodo = ref('todo')
const agrupacion = ref('mes')

// En un móvil el panel abierto empuja los pagos fuera de la pantalla; en escritorio cabe
// todo y tenerlo plegado solo añade un clic. Se decide al montar y no vuelve a tocarse:
// que el panel se abra o cierre solo al girar el teléfono sería peor que cualquier default.
const panelFiltros = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(min-width: 640px)').matches
    : false
)

/** El rango se escribe a mano; los demás períodos calculan sus fechas al elegirlos. */
watch(periodo, (valor) => {
  const ahora = parseDateLocal(hoy) || new Date()
  if (valor === 'rango') return
  if (valor === 'todo') {
    desde.value = ''
    hasta.value = ''
    return
  }
  if (valor === 'mes') {
    desde.value = formatDateToLocalISO(new Date(ahora.getFullYear(), ahora.getMonth(), 1))
    hasta.value = hoy
    return
  }
  if (valor === 'mes-anterior') {
    desde.value = formatDateToLocalISO(new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1))
    hasta.value = formatDateToLocalISO(new Date(ahora.getFullYear(), ahora.getMonth(), 0))
    return
  }
  desde.value = formatDateToLocalISO(new Date(ahora.getFullYear(), 0, 1))
  hasta.value = hoy
})

const etiquetaPeriodo = computed(() => {
  if (periodo.value !== 'rango') {
    return PERIODOS.find(p => p.value === periodo.value)?.label || ''
  }
  if (desde.value && hasta.value) return `${formatDate(desde.value)} → ${formatDate(hasta.value)}`
  if (desde.value) return `Desde ${formatDate(desde.value)}`
  if (hasta.value) return `Hasta ${formatDate(hasta.value)}`
  return 'Entre dos fechas'
})

const hayFiltros = computed(() =>
  !!busqueda.value.trim() || !!filtroSocio.value || !!filtroTipo.value || !!desde.value || !!hasta.value
)

/** Lo aplicado, en pastillas que se quitan sueltas. La búsqueda no entra: se ve escrita. */
const chipsFiltros = computed(() => {
  const chips = []
  if (filtroSocio.value) {
    chips.push({ clave: 'socio', etiqueta: filtroSocio.value, quitar: () => { filtroSocio.value = '' } })
  }
  if (filtroTipo.value) {
    const etiqueta = TIPOS_PAGO_SOCIO.find(t => t.value === filtroTipo.value)?.label || filtroTipo.value
    chips.push({ clave: 'tipo', etiqueta, quitar: () => { filtroTipo.value = '' } })
  }
  if (periodo.value !== 'todo') {
    chips.push({ clave: 'periodo', etiqueta: etiquetaPeriodo.value, quitar: () => { periodo.value = 'todo' } })
  }
  return chips
})

function limpiarFiltros() {
  busqueda.value = ''
  filtroSocio.value = ''
  filtroTipo.value = ''
  periodo.value = 'todo'
  desde.value = ''
  hasta.value = ''
}

const visibles = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return pagos.value.filter(p => {
    if (filtroSocio.value && p.socio !== filtroSocio.value) return false
    if (filtroTipo.value && p.tipo !== filtroTipo.value) return false
    // Un pago sin fecha no puede afirmarse dentro de un rango: se esconde al acotar.
    if (desde.value && (!p.fecha || p.fecha < desde.value)) return false
    if (hasta.value && (!p.fecha || p.fecha > hasta.value)) return false
    if (texto) {
      const donde = `${p.socio} ${p.concepto} ${etiquetaTipo(p.tipo)} ${p.periodo}`.toLowerCase()
      if (!donde.includes(texto)) return false
    }
    return true
  })
})

/* ---------------------------------- Resumen ---------------------------------- */

const totalVisible = computed(() => visibles.value.reduce((suma, p) => suma + p.monto, 0))
const nombresVisibles = computed(() => new Set(visibles.value.map(p => p.socio)))
const sociosVisibles = computed(() => nombresVisibles.value.size)

/*
 * Vale tanto si se eligió a alguien en el desplegable como si la búsqueda dejó a una sola
 * persona: en ambos casos repetir su nombre en cada mes es ruido, no información.
 */
const unSoloSocio = computed(() => sociosVisibles.value === 1)
const mesesVisibles = computed(() => new Set(visibles.value.map(p => p.mesClave)).size)
const nombreSocioUnico = computed(() => [...nombresVisibles.value][0] || '')

const desgloseVisible = computed(() => {
  const acumulado = {}
  visibles.value.forEach(p => { acumulado[p.tipo] = (acumulado[p.tipo] || 0) + p.monto })
  const total = totalVisible.value || 1
  return TIPOS_PAGO_SOCIO
    .filter(t => acumulado[t.value] > 0)
    .map(t => ({
      tipo: t.value,
      etiqueta: t.label,
      total: acumulado[t.value],
      porcentaje: Math.round((acumulado[t.value] / total) * 100)
    }))
    .sort((a, b) => b.total - a.total)
})

/* --------------------------------- Agrupación -------------------------------- */

const SIN_FECHA = 'sin-fecha'

function tituloMes(clave) {
  return clave === SIN_FECHA ? 'Sin fecha de pago' : nombreMes(clave)
}

/**
 * Dos niveles con la misma forma, para que la lista se lea igual se agrupe como se agrupe:
 * nivel 1 es el eje elegido (mes o socio) y nivel 2 el otro.
 */
const grupos = computed(() => {
  // Con una sola persona a la vista el eje siempre es el mes: «por socio» agruparía una
  // única tarjeta y volvería a esconder el mes un nivel más abajo.
  const porSocio = agrupacion.value === 'socio' && !unSoloSocio.value
  const mapa = new Map()

  visibles.value.forEach(p => {
    const mesClave = p.mesClave || SIN_FECHA
    const clave1 = porSocio ? p.socio : mesClave
    const clave2 = porSocio ? mesClave : p.socio

    if (!mapa.has(clave1)) {
      mapa.set(clave1, {
        clave: clave1,
        esSocio: porSocio,
        titulo: porSocio ? p.socio : tituloMes(mesClave),
        total: 0,
        hijos: new Map()
      })
    }
    const grupo = mapa.get(clave1)
    grupo.total += p.monto

    if (!grupo.hijos.has(clave2)) {
      grupo.hijos.set(clave2, {
        clave: `${clave1}|${clave2}`,
        orden: clave2,
        titulo: porSocio ? tituloMes(mesClave) : p.socio,
        total: 0,
        tipos: new Set(),
        pagos: []
      })
    }
    const hijo = grupo.hijos.get(clave2)
    hijo.total += p.monto
    hijo.tipos.add(p.tipo)
    hijo.pagos.push(p)
  })

  const lista = [...mapa.values()].map(grupo => {
    const hijos = [...grupo.hijos.values()]
      .map(h => ({ ...h, tipos: [...h.tipos] }))
      // Dentro de un mes, los socios en orden alfabético: se busca a una persona por su
      // nombre, no por cuánto pagó. Dentro de un socio, los meses del más reciente atrás.
      .sort((a, b) => porSocio ? String(b.orden).localeCompare(String(a.orden)) : String(a.orden).localeCompare(String(b.orden), 'es'))
    const total = contarPagos(hijos)
    // Sin nivel intermedio que abrir, los apuntes del mes se sirven ya ordenados.
    const pagosDirectos = unSoloSocio.value ? hijos.flatMap(h => h.pagos) : null
    const eje = porSocio
      ? `${hijos.length} ${hijos.length === 1 ? 'mes' : 'meses'}`
      : `${hijos.length} ${hijos.length === 1 ? 'socio' : 'socios'}`
    return {
      ...grupo,
      hijos,
      pagosDirectos,
      subtitulo: unSoloSocio.value
        ? `${total} ${total === 1 ? 'pago' : 'pagos'}`
        : `${eje} · ${total} ${total === 1 ? 'pago' : 'pagos'}`
    }
  })

  return lista.sort((a, b) =>
    porSocio ? a.titulo.localeCompare(b.titulo, 'es') : String(b.clave).localeCompare(String(a.clave))
  )
})

function contarPagos(hijos) {
  return hijos.reduce((suma, h) => suma + h.pagos.length, 0)
}

/* ------------------------------ Abrir y cerrar ------------------------------- */

/*
 * La lista nace plegada salvo la primera tarjeta —la más reciente—: con un año de pagos,
 * abrirlo todo obliga a bajar mucho para llegar a lo que se busca. Vale también con
 * filtros puestos: la regla es una sola y así no hay que adivinar cuándo cambia.
 *
 * El segundo nivel sí se despliega solo cuando hay un socio o una búsqueda activos, porque
 * ahí lo que se ha pedido es justo el detalle.
 *
 * Se guardan las excepciones (qué se abrió a mano, qué se cerró a mano) en vez del estado
 * completo, para que cambiar un filtro no borre lo que el usuario acaba de desplegar.
 */
const abiertos1 = ref(new Set())
const cerrados1 = ref(new Set())
const abiertos2 = ref(new Set())
const cerrados2 = ref(new Set())

const detalleAuto = computed(() => !!filtroSocio.value || !!busqueda.value.trim())

/** La tarjeta que sale abierta de entrada: la primera, que es la más reciente. */
const claveInicial = computed(() => grupos.value[0]?.clave || '')

const abierto1 = (clave) => {
  if (abiertos1.value.has(clave)) return true
  return clave === claveInicial.value && !cerrados1.value.has(clave)
}
const abierto2 = (clave) =>
  detalleAuto.value ? !cerrados2.value.has(clave) : abiertos2.value.has(clave)

function alternar1(clave) {
  const estaAbierto = abierto1(clave)
  const nuevosAbiertos = new Set(abiertos1.value)
  const nuevosCerrados = new Set(cerrados1.value)
  if (estaAbierto) {
    nuevosAbiertos.delete(clave)
    nuevosCerrados.add(clave)
  } else {
    nuevosAbiertos.add(clave)
    nuevosCerrados.delete(clave)
  }
  abiertos1.value = nuevosAbiertos
  cerrados1.value = nuevosCerrados
}

/*
 * Plegar todo cierra también el segundo nivel: si solo se cerrara el primero, reabrir un
 * mes lo devolvería con los socios ya desplegados y el gesto no habría servido de nada.
 */
const todoPlegado = computed(() =>
  grupos.value.length > 0 && grupos.value.every(g => !abierto1(g.clave))
)

function alternarTodo() {
  const clavesGrupos = grupos.value.map(g => g.clave)
  const clavesHijos = grupos.value.flatMap(g => g.hijos.map(h => h.clave))
  if (todoPlegado.value) {
    abiertos1.value = new Set(clavesGrupos)
    cerrados1.value = new Set()
    abiertos2.value = new Set(clavesHijos)
    cerrados2.value = new Set()
    return
  }
  abiertos1.value = new Set()
  cerrados1.value = new Set(clavesGrupos)
  abiertos2.value = new Set()
  cerrados2.value = new Set(clavesHijos)
}

function alternar2(clave) {
  const estaAbierto = abierto2(clave)
  const nuevosAbiertos = new Set(abiertos2.value)
  const nuevosCerrados = new Set(cerrados2.value)
  if (estaAbierto) {
    nuevosAbiertos.delete(clave)
    nuevosCerrados.add(clave)
  } else {
    nuevosAbiertos.add(clave)
    nuevosCerrados.delete(clave)
  }
  abiertos2.value = nuevosAbiertos
  cerrados2.value = nuevosCerrados
}

// Cambiar de eje —o pasar a mirar a un solo socio— reordena las tarjetas: conservar qué
// estaba plegado dejaría medio listado cerrado sin que nadie lo haya cerrado.
watch([agrupacion, unSoloSocio], () => {
  abiertos1.value = new Set()
  cerrados1.value = new Set()
  abiertos2.value = new Set()
  cerrados2.value = new Set()
})

/* --------------------------------- Exportar ---------------------------------- */

// xlsx-js-style pesa ~600 KB: se carga solo al exportar para no inflar el chunk de la vista.
let XLSX = null
async function asegurarXLSX() {
  if (XLSX) return
  const modulo = await import('xlsx-js-style')
  XLSX = modulo.default || modulo
}

const exportando = ref(false)

async function exportarExcel() {
  if (visibles.value.length === 0) return
  exportando.value = true
  try {
    await asegurarXLSX()
    const filas = visibles.value.map(p => ({
      Socio: p.socio,
      Fecha: p.fecha ? formatDate(p.fecha) : 'Sin fecha',
      Mes: p.mesClave ? nombreMes(p.mesClave) : 'Sin fecha',
      Concepto: etiquetaTipo(p.tipo),
      Detalle: p.concepto,
      Período: p.periodo || '',
      Forma: p.formaPago === 'transferencia' ? 'Transferencia' : 'Efectivo',
      Monto: p.monto
    }))

    const hoja = XLSX.utils.json_to_sheet(filas)
    const rango = XLSX.utils.decode_range(hoja['!ref'])
    const columnaMonto = 7

    for (let columna = rango.s.c; columna <= rango.e.c; columna++) {
      const celda = XLSX.utils.encode_cell({ r: 0, c: columna })
      if (!hoja[celda]) continue
      hoja[celda].s = {
        fill: { fgColor: { rgb: '1B5E37' }, patternType: 'solid' },
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    for (let fila = 1; fila <= rango.e.r; fila++) {
      for (let columna = rango.s.c; columna <= rango.e.c; columna++) {
        const celda = XLSX.utils.encode_cell({ r: fila, c: columna })
        if (!hoja[celda]) continue
        const esNumero = columna === columnaMonto
        hoja[celda].s = {
          font: { sz: 10, color: { rgb: '1F2937' } },
          alignment: { horizontal: esNumero ? 'right' : 'left', vertical: 'center' }
        }
        if (esNumero) hoja[celda].z = '#,##0'
      }
    }

    hoja['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 30 }, { wch: 20 }, { wch: 14 }, { wch: 14 }]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Pagos por socio')
    const nombre = (natillera.value?.nombre || 'natillera').replace(/[^\w\sáéíóúñÁÉÍÓÚÑ-]/g, '').trim()
    XLSX.writeFile(libro, `Pagos ${nombre} ${hoy}.xlsx`)
  } catch (e) {
    console.error('No se pudo exportar los pagos:', e)
    notificaciones.error('No se pudo generar el archivo', 'Exportar')
  } finally {
    exportando.value = false
  }
}
</script>

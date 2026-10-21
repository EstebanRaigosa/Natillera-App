<template>
  <!--
    Ver como socio (solo superadmin): busca un socio en cualquier natillera y abre su portal
    tal como él lo ve. La búsqueda la responde `superadmin_buscar_socios` y el selector
    `superadmin_natilleras`, que rechazan a cualquier otra cuenta; el portal lo responde
    `portal_datos_socio`, que además deja huella de cada apertura en `superadmin_vistas_socio`
    (migraciones 063 y 065).
  -->
  <div class="mx-auto max-w-4xl space-y-4 pb-6 sm:space-y-5">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton to="/dashboard" :inline="true" />
          <div class="ds-page-header__icon">
            <EyeIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">Ver como socio</h1>
            <p class="ds-page-header__sub hidden sm:block">
              Abre el portal de un socio en solo lectura. Cada consulta queda registrada.
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Filtros: buscador, natillera y con/sin cuenta, en la misma tarjeta (ds-toolbar) -->
    <div class="ds-toolbar flex-col items-stretch">
      <!-- Mismo buscador en píldora que «Invitar socios» (ds-search): icono y campo en flex -->
      <form class="ds-search w-full flex-none" role="search" @submit.prevent="buscarYa">
        <MagnifyingGlassIcon class="h-4 w-4" aria-hidden="true" />
        <input
          v-model="filtros.texto"
          type="text"
          class="ds-search__input"
          placeholder="Nombre, natillera, documento, celular o correo"
          aria-label="Buscar socio por nombre, natillera, documento, celular o correo"
          autocomplete="off"
          enterkeyhint="search"
          @keydown.esc="filtros.texto = ''"
        />
        <button v-if="filtros.texto" type="button" class="ds-search__clear" aria-label="Limpiar búsqueda" @click="filtros.texto = ''">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </form>

      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <!--
          Natillera: una píldora que abre el selector. Con una elegida se tiñe de marca y
          muestra su icono, y la X la quita sin abrir nada (hermana en flex, no encima).
        -->
        <div
          class="flex min-h-11 min-w-0 items-center rounded-full border transition-colors sm:max-w-[60%]"
          :class="natilleraElegida ? 'border-marca-tinta-borde bg-marca-suave' : 'border-borde-fuerte bg-superficie-tarjeta'"
        >
          <button
            type="button"
            class="flex min-h-11 min-w-0 flex-1 touch-manipulation items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3 text-left"
            :aria-label="natilleraElegida ? `Natillera: ${natilleraElegida.nombre}. Cambiar` : 'Filtrar por natillera'"
            @click="selectorAbierto = true"
          >
            <span
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              :class="natilleraElegida ? 'bg-[color:var(--brand-primary)] text-white' : 'bg-superficie-hundida text-texto-medio'"
              aria-hidden="true"
            >
              <NatilleraDashboardIcon
                v-if="natilleraElegida"
                :natillera="{ id: natilleraElegida.natillera_id, dashboard_icon: natilleraElegida.dashboard_icon }"
              />
              <BuildingLibraryIcon v-else class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[0.625rem] font-bold uppercase tracking-[0.12em] text-texto-suave">Natillera</span>
              <span class="block truncate text-sm font-bold leading-tight" :class="natilleraElegida ? 'text-marca-tinta' : 'text-texto-fuerte'">
                {{ natilleraElegida?.nombre || 'Todas' }}
              </span>
            </span>
            <ChevronDownIcon v-if="!natilleraElegida" class="h-4 w-4 shrink-0 text-texto-suave" aria-hidden="true" />
          </button>
          <button
            v-if="natilleraElegida"
            type="button"
            class="mr-0.5 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-marca-tinta hover:bg-superficie-tarjeta/60"
            aria-label="Quitar filtro de natillera"
            @click="filtros.natilleraId = null"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>

        <SwitchSegmentado v-model="filtros.cuentas" :opciones="OPCIONES_CUENTAS" aria-label="Qué socios mostrar" />
      </div>
    </div>

    <section class="rounded-[var(--radius-lg)] border border-borde bg-superficie-tarjeta p-4 shadow-[var(--shadow-xs)] sm:p-5">
      <div class="flex items-center justify-between gap-3">
        <h2 class="inline-flex min-w-0 items-center gap-2 font-display text-[1.0625rem] font-extrabold text-texto-fuerte">
          <span class="truncate">{{ soloVinculados ? 'Socios con la app' : 'Todos los socios' }}</span>
          <span v-if="!cargando || resultados.length > 0" class="ds-badge ds-badge--muted shrink-0 tabular-nums">{{ resultados.length }}{{ resultados.length >= LIMITE ? '+' : '' }}</span>
        </h2>
        <span class="inline-flex shrink-0 items-center gap-1 text-xs text-texto-suave">
          <LockClosedIcon class="h-3.5 w-3.5" aria-hidden="true" />
          Solo lectura
        </span>
      </div>

      <CargaCaja v-if="cargando && resultados.length === 0" texto="Buscando socios" />

      <div v-else-if="error" class="mt-3 rounded-xl border border-peligro-borde bg-peligro-suave px-4 py-3 text-sm font-medium text-peligro">
        {{ error }}
        <button type="button" class="ml-2 -my-3 inline-flex min-h-11 items-center font-semibold underline touch-manipulation" @click="buscarYa">Reintentar</button>
      </div>

      <p v-else-if="resultados.length === 0" class="mt-3 text-sm text-texto-secundario">
        <template v-if="buscado">Nadie coincide con «{{ buscado }}».</template>
        <template v-else-if="natilleraElegida && soloVinculados">Nadie en {{ natilleraElegida.nombre }} tiene la app todavía. Elige «Todos» para ver sus socios.</template>
        <template v-else>Todavía no hay socios con cuenta vinculada.</template>
      </p>

      <template v-else>
        <ul class="mt-2 divide-y divide-borde transition-opacity" :class="{ 'opacity-60': cargando }">
          <li v-for="r in resultados" :key="r.socio_natillera_id">
            <router-link
              :to="{ name: 'PortalSocioSuperadmin', params: { socioNatilleraId: r.socio_natillera_id } }"
              class="group -mx-2 flex min-h-11 touch-manipulation items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-superficie-suave focus-visible:bg-superficie-suave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marca-tinta-borde"
              :aria-label="`Ver el portal de ${r.socio_nombre} en ${r.natillera_nombre}`"
            >
              <!-- Verde: tiene la app y está activo. Gris: retirado o sin cuenta (nunca ha visto su portal). -->
              <span
                class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-extrabold"
                :class="r.vinculado && r.estado_socio === 'activo' ? 'bg-[color:var(--brand-primary)] text-white' : 'bg-superficie-hundida text-texto-medio'"
                aria-hidden="true"
              >{{ inicial(r.socio_nombre) }}</span>
              <div class="min-w-0 flex-1">
                <p class="flex items-center gap-1.5">
                  <span class="truncate text-[0.9375rem] font-bold leading-tight text-texto-fuerte">{{ r.socio_nombre }}</span>
                  <span v-if="!r.vinculado" class="ds-badge ds-badge--muted shrink-0">Sin cuenta</span>
                  <span v-if="r.estado_socio !== 'activo'" class="ds-badge ds-badge--muted shrink-0">Retirado</span>
                </p>
                <!-- Con una natillera elegida su nombre ya está arriba: se muestra el celular -->
                <p class="mt-0.5 flex items-center gap-1.5 text-[0.8125rem] text-texto-secundario">
                  <template v-if="natilleraElegida">
                    <PhoneIcon class="h-3.5 w-3.5 shrink-0 text-texto-tenue" aria-hidden="true" />
                    <span class="truncate">{{ r.telefono || 'Sin celular' }}</span>
                  </template>
                  <template v-else>
                    <WalletIcon class="h-3.5 w-3.5 shrink-0 text-texto-tenue" aria-hidden="true" />
                    <span class="truncate">{{ r.natillera_nombre }}</span>
                    <span v-if="esCerrada(r)" class="ds-badge ds-badge--warning shrink-0">Cerrada</span>
                  </template>
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span v-if="r.ultima_vista" class="hidden text-right text-xs leading-tight text-texto-tenue sm:block">
                  Visto<br>{{ formatDateWithTime(r.ultima_vista) }}
                </span>
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-full text-marca-tinta transition-colors group-hover:bg-marca-suave">
                  <EyeIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </router-link>
          </li>
        </ul>
        <p v-if="resultados.length >= LIMITE" class="mt-3 text-xs text-texto-suave">Se muestran los primeros {{ LIMITE }}. Escribe o elige una natillera para afinar.</p>
      </template>
    </section>

    <SelectorNatilleraModal
      :show="selectorAbierto"
      :natilleras="natilleras"
      :seleccionada="filtros.natilleraId"
      :solo-vinculados="soloVinculados"
      @close="selectorAbierto = false"
      @elegir="elegirNatillera"
    />
  </div>
</template>

<script>
import { reactive } from 'vue'

/*
 * Filtros a nivel de módulo, no de instancia: al abrir un portal y volver, la vista se
 * vuelve a montar y sin esto se perdería lo que se estaba mirando. Viven lo que dura la
 * pestaña; no se guardan en ningún lado.
 */
const filtros = reactive({ texto: '', natilleraId: null, cuentas: 'vinculados' })
</script>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  BuildingLibraryIcon,
  ChevronDownIcon,
  EyeIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  WalletIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import NatilleraDashboardIcon from '../../components/NatilleraDashboardIcon.vue'
import SwitchSegmentado from '../../components/SwitchSegmentado.vue'
import SelectorNatilleraModal from '../../components/admin/SelectorNatilleraModal.vue'
import { supabase } from '../../lib/supabase'
import { formatDateWithTime } from '../../utils/formatDate'

const LIMITE = 50
const OPCIONES_CUENTAS = [
  { value: 'vinculados', label: 'Con la app' },
  { value: 'todos', label: 'Todos' }
]

const buscado = ref('')
const resultados = ref([])
const cargando = ref(false)
const error = ref('')
const natilleras = ref([])
const selectorAbierto = ref(false)

const soloVinculados = computed(() => filtros.cuentas === 'vinculados')
const natilleraElegida = computed(() => natilleras.value.find(n => n.natillera_id === filtros.natilleraId) || null)

let turno = 0
let espera = 0

async function buscar() {
  const consulta = filtros.texto.trim()
  const miTurno = ++turno
  cargando.value = true
  error.value = ''
  try {
    const { data, error: e } = await supabase.rpc('superadmin_buscar_socios', {
      p_texto: consulta,
      p_limite: LIMITE,
      p_natillera_id: filtros.natilleraId,
      p_solo_vinculados: soloVinculados.value
    })
    if (e) throw e
    // Si mientras respondía cambió algún filtro, esta respuesta ya no aplica.
    if (miTurno !== turno) return
    resultados.value = data || []
    buscado.value = consulta
  } catch (e) {
    if (miTurno !== turno) return
    console.error('Error buscando socios:', e)
    resultados.value = []
    error.value = e?.code === '42501' ? 'Esta opción es solo para el superadministrador.' : 'No se pudo buscar. Revisa tu conexión.'
  } finally {
    if (miTurno === turno) cargando.value = false
  }
}

function buscarYa() {
  clearTimeout(espera)
  buscar()
}

async function cargarNatilleras() {
  const { data, error: e } = await supabase.rpc('superadmin_natilleras')
  // Sin la lista el buscador sigue sirviendo; solo faltaría el selector.
  if (e) {
    console.warn('No se pudieron cargar las natilleras:', e)
    return
  }
  natilleras.value = data || []
}

function elegirNatillera(id) {
  filtros.natilleraId = id
  selectorAbierto.value = false
}

// El texto espera a que se deje de escribir; natillera y con/sin cuenta buscan al instante.
watch(() => filtros.texto, () => {
  clearTimeout(espera)
  espera = setTimeout(buscar, 300)
})
watch(() => [filtros.natilleraId, filtros.cuentas], buscarYa)

function inicial(nombre) {
  return (String(nombre || '').trim()[0] || '?').toUpperCase()
}

function esCerrada(r) {
  return String(r.natillera_estado || '').toLowerCase() === 'cerrada'
}

// Sin texto trae los primeros socios por nombre: sirve para entrar y elegir sin escribir.
onMounted(() => {
  buscar()
  cargarNatilleras()
})
onUnmounted(() => {
  clearTimeout(espera)
  turno++
})
</script>

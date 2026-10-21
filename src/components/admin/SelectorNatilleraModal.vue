<template>
  <!--
    Selector de natillera para «Ver como socio» (superadmin). Son decenas de natilleras: una
    fila de chips no cabe, así que se elige en una hoja con buscador. Patrón de la skill
    natillerapp-modals (cabecera marca móvil/desktop, cuerpo scrolleable con natiscroll y pie fijo).
  -->
  <ModalWrapper
    :show="show"
    :z-index="50"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md h-[85vh] supports-[height:100dvh]:h-[85dvh] sm:h-[min(42rem,85vh)] sm:supports-[height:100dvh]:h-[min(42rem,85vh)] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="28rem"
    @close="emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <BuildingLibraryIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Filtrar por natillera</h2>
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

    <!-- Cabecera desktop: icono arriba, textos centrados, X en la tercera columna del flex -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] px-6 pb-5 pt-[max(1rem,env(safe-area-inset-top))] sm:block">
      <div class="flex items-start">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <BuildingLibraryIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Filtrar por natillera</h2>
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

    <!-- Buscador fijo sobre la lista: icono y campo en flex (skill: nada de iconos absolutos) -->
    <div class="flex-shrink-0 border-b border-borde-suave bg-superficie-tarjeta px-4 py-3 sm:px-5">
      <div class="ds-search">
        <MagnifyingGlassIcon class="h-4 w-4" aria-hidden="true" />
        <input
          v-model="busqueda"
          type="text"
          class="ds-search__input"
          placeholder="Buscar natillera"
          aria-label="Buscar natillera"
          autocomplete="off"
          enterkeyhint="search"
          @keydown.esc.stop="busqueda = ''"
        />
        <button v-if="busqueda" type="button" class="ds-search__clear" aria-label="Limpiar búsqueda" @click="busqueda = ''">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta px-3 pb-6 pt-2 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-4"
        @scroll.passive="onScroll"
      >
        <ul class="space-y-1" role="listbox" aria-label="Natilleras">
          <li v-if="!busqueda.trim()">
            <button
              type="button"
              role="option"
              :aria-selected="!seleccionada"
              class="sel-nat"
              :class="{ 'sel-nat--activa': !seleccionada }"
              @click="emit('elegir', null)"
            >
              <span class="sel-nat__icono bg-superficie-hundida text-texto-medio">
                <Squares2X2Icon class="h-5 w-5" aria-hidden="true" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate font-bold text-texto-fuerte">Todas las natilleras</span>
                <span class="block text-xs text-texto-suave">{{ totalTodas }} {{ etiquetaSocios(totalTodas) }}</span>
              </span>
              <CheckCircleIcon v-if="!seleccionada" class="h-6 w-6 shrink-0 text-marca-tinta" aria-hidden="true" />
            </button>
          </li>

          <li v-for="n in filtradas" :key="n.natillera_id">
            <button
              type="button"
              role="option"
              :aria-selected="seleccionada === n.natillera_id"
              class="sel-nat"
              :class="{ 'sel-nat--activa': seleccionada === n.natillera_id }"
              @click="emit('elegir', n.natillera_id)"
            >
              <!-- El mismo icono que la natillera tiene en el inicio, para reconocerla de un vistazo -->
              <span class="sel-nat__icono bg-[color:var(--brand-primary)] text-white" :class="{ 'opacity-60': esCerrada(n) }">
                <NatilleraDashboardIcon :natillera="{ id: n.natillera_id, dashboard_icon: n.dashboard_icon }" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-1.5">
                  <span class="truncate font-bold text-texto-fuerte">{{ n.nombre }}</span>
                  <span v-if="esCerrada(n)" class="ds-badge ds-badge--warning shrink-0">Cerrada</span>
                </span>
                <span class="block text-xs text-texto-suave">
                  <template v-if="soloVinculados">{{ n.socios_vinculados }} con la app · {{ n.socios_total }} socios</template>
                  <template v-else>{{ n.socios_total }} {{ etiquetaSocios(n.socios_total) }} · {{ n.socios_vinculados }} con la app</template>
                </span>
              </span>
              <CheckCircleIcon v-if="seleccionada === n.natillera_id" class="h-6 w-6 shrink-0 text-marca-tinta" aria-hidden="true" />
            </button>
          </li>
        </ul>

        <p v-if="filtradas.length === 0" class="px-3 py-6 text-center text-sm text-texto-secundario">
          <template v-if="busqueda.trim()">Ninguna natillera coincide con «{{ busqueda.trim() }}».</template>
          <template v-else>Ninguna natillera tiene socios con la app todavía.</template>
        </p>
        <p v-else-if="soloVinculados && ocultas > 0" class="px-3 pt-4 text-center text-xs text-texto-suave">
          {{ ocultas }} {{ ocultas === 1 ? 'natillera sin socios' : 'natilleras sin socios' }} con la app no aparecen. Elige «Todos» para verlas.
        </p>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 border-t border-borde bg-superficie-tarjeta px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button v-if="seleccionada" type="button" class="btn-modal-secondary w-full" @click="emit('elegir', null)">Ver todas las natilleras</button>
      <button v-else type="button" class="btn-modal-secondary w-full" @click="emit('close')">Cerrar</button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { BuildingLibraryIcon, CheckCircleIcon, MagnifyingGlassIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import NatilleraDashboardIcon from '../NatilleraDashboardIcon.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** Filas de `superadmin_natilleras`. */
  natilleras: { type: Array, default: () => [] },
  /** natillera_id elegida, o null para todas. */
  seleccionada: { type: String, default: null },
  /** Con «Con la app» se ocultan las natilleras sin socios vinculados: ahí no hay nada que ver. */
  soloVinculados: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'elegir'])

const busqueda = ref('')

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

// Cada vez que se abre, la búsqueda empieza limpia.
watch(visible, v => { if (v) busqueda.value = '' })

const conteo = n => (props.soloVinculados ? Number(n.socios_vinculados) : Number(n.socios_total)) || 0

const disponibles = computed(() => props.natilleras.filter(n => conteo(n) > 0))
const ocultas = computed(() => props.natilleras.length - disponibles.value.length)
const totalTodas = computed(() => disponibles.value.reduce((suma, n) => suma + conteo(n), 0))

// Sin tildes ni mayúsculas: «Ahorro Medellin» encuentra «Ahorro Medellín».
const normalizar = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const filtradas = computed(() => {
  const q = normalizar(busqueda.value)
  if (!q) return disponibles.value
  return disponibles.value.filter(n => normalizar(n.nombre).includes(q))
})

const subtitulo = computed(() =>
  `${disponibles.value.length} ${disponibles.value.length === 1 ? 'natillera' : 'natilleras'}${props.soloVinculados ? ' con socios en la app' : ''}`)

function etiquetaSocios(n) {
  if (props.soloVinculados) return n === 1 ? 'socio con la app' : 'socios con la app'
  return n === 1 ? 'socio' : 'socios'
}

function esCerrada(n) {
  return String(n.estado || '').toLowerCase() === 'cerrada'
}
</script>

<style scoped>
.sel-nat {
  display: flex;
  width: 100%;
  min-height: 3.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.875rem;
  text-align: left;
  font-size: 0.9375rem;
  background: transparent;
  transition: background-color 150ms ease, border-color 150ms ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.sel-nat:hover { background: var(--superficie-suave); }
.sel-nat:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 2px; }
.sel-nat--activa,
.sel-nat--activa:hover {
  border-color: var(--marca-tinta-borde);
  background: var(--marca-suave);
}
.sel-nat__icono {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}
</style>

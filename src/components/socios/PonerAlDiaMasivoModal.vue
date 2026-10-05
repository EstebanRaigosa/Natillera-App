<template>
  <!--
    Poner al día a varios socios de una vez. Para la natillera que empezó antes de pasarse a
    la app: sus socios nacen con los meses anteriores en mora aunque ya los pagaron.

    Una fila por socio con cuotas vencidas sin pagar (cuántas, cuánto y desde cuándo); se
    marcan los que ya pagaron y se registra todo junto. Cada cuota queda pagada en su fecha
    límite, sin multa y en la caja, con el mismo camino del pago normal (usePonerAlDia).
    Registrar es de dos toques: son muchos pagos de golpe.
  -->
  <ModalWrapper
    :show="show"
    :z-index="50"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="36rem"
    @close="cerrar"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <CheckBadgeIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Poner socios al día</h2>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/80">Cuotas que ya pagaron por fuera de la app</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
          aria-label="Cerrar"
          :disabled="guardando"
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
            <CheckBadgeIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Poner socios al día</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Cuotas que ya pagaron por fuera de la app</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-40"
          aria-label="Cerrar"
          :disabled="guardando"
          @click="cerrar"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Controles fijos: no se van con el scroll de la lista -->
    <div v-if="!resultado && filas.length > 0" class="pad-controles flex-shrink-0 space-y-2.5 px-4 pb-3 pt-3 sm:px-6">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span class="ds-overline">Cómo pagaron</span>
        <SwitchSegmentado v-model="formaPago" :opciones="OPCIONES_FORMA_PAGO" />
        <!-- Opcional, como en el pago normal: el 4×1000 solo aplica a transferencias -->
        <label v-if="formaPago === 'transferencia'" class="pad-opcion" :class="{ 'is-activa': cobrar4x1000 }">
          <input v-model="cobrar4x1000" type="checkbox" class="sr-only" @change="confirmando = false" />
          <span class="pad-opcion__caja" aria-hidden="true"><CheckIcon v-if="cobrar4x1000" class="h-3.5 w-3.5" /></span>
          Cobrar 4×1000
        </label>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="ds-search min-w-0 flex-1 bg-superficie-tarjeta">
          <MagnifyingGlassIcon class="h-4 w-4" aria-hidden="true" />
          <input
            v-model="busqueda"
            type="search"
            class="ds-search__input"
            placeholder="Buscar socio"
            aria-label="Buscar socio por nombre"
            autocomplete="off"
          />
        </div>
        <button type="button" class="pad-todos" :class="{ 'is-activo': todosVisiblesMarcados }" @click="alternarTodos">
          <CheckIcon v-if="todosVisiblesMarcados" class="h-4 w-4" aria-hidden="true" />
          {{ todosVisiblesMarcados ? 'Quitar todos' : 'Seleccionar todos' }}
        </button>
      </div>
    </div>

    <!-- Resultado: reemplaza la lista al terminar -->
    <div v-if="resultado" class="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
      <span class="pad-exito" aria-hidden="true">
        <CheckBadgeIcon class="h-8 w-8" />
      </span>
      <p class="mt-4 font-display text-xl font-extrabold text-texto-fuerte">
        {{ resultado.socios }} {{ resultado.socios === 1 ? 'socio quedó al día' : 'socios quedaron al día' }}
      </p>
      <div class="mt-5 grid w-full max-w-sm grid-cols-2 gap-2.5 text-left">
        <div class="pad-metric pad-metric--marca">
          <p class="pad-metric__label">Cuotas registradas</p>
          <p class="pad-metric__valor">{{ resultado.registradas }}</p>
        </div>
        <div class="pad-metric">
          <p class="pad-metric__label">A la caja</p>
          <p class="pad-metric__valor">${{ formatMoney(resultado.valor + (resultado.valor4x1000 || 0)) }}</p>
          <p v-if="resultado.valor4x1000 > 0" class="pad-metric__nota">incluye ${{ formatMoney(resultado.valor4x1000) }} de 4×1000</p>
        </div>
      </div>
      <p v-if="resultado.fallidos.length" class="pad-aviso mt-4 max-w-sm text-left">
        <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span>Con {{ resultado.fallidos.join(', ') }} quedaron cuotas sin registrar. Siguen pendientes; puedes intentarlo de nuevo.</span>
      </p>
    </div>

    <div v-else class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="onScroll"
      >
        <CargaCaja v-if="preparando" texto="Buscando cuotas vencidas" detalle="Revisando a cada socio" />

        <div v-else-if="filas.length === 0" class="flex flex-col items-center px-6 py-12 text-center">
          <span class="pad-exito" aria-hidden="true"><CheckBadgeIcon class="h-8 w-8" /></span>
          <p class="mt-4 font-display text-lg font-extrabold text-texto-fuerte">Todos están al día</p>
          <p class="mt-1 max-w-xs text-sm text-texto-suave">Ningún socio tiene cuotas vencidas sin pagar.</p>
        </div>

        <template v-else>
          <!-- Qué hay por poner al día y qué pasa al registrarlo: se va con el scroll -->
          <div class="space-y-3 px-4 pt-4 sm:px-6">
            <div class="grid grid-cols-2 gap-2.5">
              <div class="pad-metric">
                <p class="pad-metric__label">Con cuotas vencidas</p>
                <p class="pad-metric__valor">{{ filas.length }} {{ filas.length === 1 ? 'socio' : 'socios' }}</p>
              </div>
              <div class="pad-metric pad-metric--debe">
                <p class="pad-metric__label">Suman</p>
                <p class="pad-metric__valor">${{ formatMoney(totalPendiente) }}</p>
              </div>
            </div>
            <p class="pad-nota">
              <InformationCircleIcon class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>Cada cuota queda pagada en su fecha límite, sin multa, y entra a la caja.</span>
            </p>
          </div>

          <p v-if="filasVisibles.length === 0" class="px-6 py-10 text-center text-sm text-texto-suave">
            Ningún socio con ese nombre.
          </p>

          <ul v-else class="space-y-2 px-4 pb-5 pt-3 sm:px-6">
            <li v-for="fila in filasVisibles" :key="fila.socioNatillera.id">
              <label class="pad-socio" :class="{ 'is-marcado': marcados.has(fila.socioNatillera.id) }">
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="marcados.has(fila.socioNatillera.id)"
                  @change="alternar(fila.socioNatillera.id)"
                />
                <span class="pad-socio__check" aria-hidden="true">
                  <CheckIcon class="h-3.5 w-3.5" />
                </span>
                <img
                  :src="getAvatarUrl(fila.nombre, fila.socioNatillera.socio?.avatar_seed, fila.socioNatillera.socio?.avatar_style)"
                  alt=""
                  class="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 oscuro:bg-superficie-hundida object-cover"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-bold text-slate-800 oscuro:text-texto">{{ fila.nombre }}</span>
                  <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span class="ds-badge ds-badge--warning">
                      {{ fila.cuotas.length }} {{ fila.cuotas.length === 1 ? 'cuota' : 'cuotas' }}
                    </span>
                    <span class="text-[11px] text-slate-500 oscuro:text-texto-suave">{{ rangoFechas(fila.cuotas) }}</span>
                  </span>
                </span>
                <span class="pad-socio__valor">${{ formatMoney(fila.valor) }}</span>
              </label>
            </li>
          </ul>
        </template>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 border-t border-borde bg-superficie-tarjeta px-4 pt-3 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <template v-if="resultado || (!preparando && filas.length === 0)">
        <button type="button" class="btn-modal-primary w-full" @click="cerrar">Listo</button>
      </template>
      <template v-else-if="confirmando">
        <!-- Segundo toque: lo que va a pasar, dicho antes de hacerlo -->
        <p class="pad-aviso mb-3">
          <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>
            Se registran <strong>{{ seleccion.cuotas }} cuotas</strong> de {{ seleccion.socios }} {{ seleccion.socios === 1 ? 'socio' : 'socios' }}
            como pagadas en su fecha límite, sin multa, y entran a la caja como
            <strong>{{ formaPago === 'efectivo' ? 'efectivo' : 'transferencia' }}</strong>: ${{ formatMoney(seleccion.valor) }}<template v-if="seleccion.valor4x1000 > 0">, más ${{ formatMoney(seleccion.valor4x1000) }} de 4×1000</template>.
          </span>
        </p>
        <div class="flex gap-3">
          <button type="button" class="btn-modal-secondary flex-1" @click="confirmando = false">Volver</button>
          <button type="button" class="btn-modal-primary flex-1 sm:flex-[1.4]" @click="registrar">Sí, ponerlos al día</button>
        </div>
      </template>
      <template v-else>
        <!-- Lo seleccionado: cuántos a la izquierda, el total destacado a la derecha -->
        <div class="mb-3 flex items-end justify-between gap-3">
          <div class="min-w-0">
            <p class="ds-overline">{{ seleccion.socios > 0 ? 'Seleccionados' : 'Sin seleccionar' }}</p>
            <p class="mt-0.5 truncate text-sm font-semibold text-slate-700 oscuro:text-texto-medio">
              {{ seleccion.socios > 0
                ? `${seleccion.socios} ${seleccion.socios === 1 ? 'socio' : 'socios'} · ${seleccion.cuotas} cuotas`
                : 'Marca los socios que ya pagaron' }}
            </p>
          </div>
          <div v-if="seleccion.socios > 0" class="flex-shrink-0 text-right">
            <p class="font-display text-xl font-extrabold tabular-nums leading-none text-marca-tinta">${{ formatMoney(seleccion.valor + seleccion.valor4x1000) }}</p>
            <p v-if="seleccion.valor4x1000 > 0" class="mt-1 text-[11px] text-slate-500 oscuro:text-texto-suave">incluye 4×1000 ${{ formatMoney(seleccion.valor4x1000) }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <!-- En móvil cierra la X de la cabecera: el ancho es para el botón que se usa -->
          <button type="button" class="btn-modal-secondary hidden flex-1 sm:inline-flex" @click="cerrar">Cancelar</button>
          <button
            type="button"
            class="btn-modal-primary flex-1 disabled:opacity-50 sm:flex-[1.4]"
            :disabled="seleccion.socios === 0 || preparando"
            @click="confirmando = true"
          >
            Poner al día
          </button>
        </div>
      </template>
    </div>

    <CargaCaja
      :visible="guardando"
      flotante
      texto="Poniendo al día"
      :detalle="progreso.total ? `Cuota ${progreso.hechas} de ${progreso.total}` : 'Un momento'"
    />
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CheckBadgeIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import SwitchSegmentado from '../SwitchSegmentado.vue'
import CargaCaja from '../carga/CargaCaja.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { cuotasParaPonerAlDiaPorSocio, ponerSociosAlDia, total4x1000DeCuotas } from '../../composables/usePonerAlDia'
import { formatMoney } from '../../utils/formatMoney'
import { parseDateLocal } from '../../utils/formatDate'
import { getAvatarUrl } from '../../utils/avatarSocio'

const props = defineProps({
  show: { type: Boolean, default: false },
  natilleraId: { type: String, required: true },
  natilleraNombre: { type: String, default: '' },
  /** Socios de la natillera (sociosStore.sociosNatillera); solo cuentan los activos. */
  socios: { type: Array, default: () => [] }
})
const emit = defineEmits(['close', 'guardado'])

const OPCIONES_FORMA_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' }
]

const preparando = ref(false)
const guardando = ref(false)
const confirmando = ref(false)
const resultado = ref(null)
const formaPago = ref('efectivo')
const cobrar4x1000 = ref(false)
const busqueda = ref('')
const filas = ref([]) // [{ socioNatillera, nombre, cuotas, valor }]
const marcados = ref(new Set())
const progreso = ref({ hechas: 0, total: 0 })

const filasVisibles = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return q ? filas.value.filter(f => f.nombre.toLowerCase().includes(q)) : filas.value
})
const todosVisiblesMarcados = computed(() =>
  filasVisibles.value.length > 0 && filasVisibles.value.every(f => marcados.value.has(f.socioNatillera.id))
)
const seleccion = computed(() => {
  const elegidas = filas.value.filter(f => marcados.value.has(f.socioNatillera.id))
  return {
    socios: elegidas.length,
    cuotas: elegidas.reduce((s, f) => s + f.cuotas.length, 0),
    valor: elegidas.reduce((s, f) => s + f.valor, 0),
    valor4x1000: elegidas.reduce((s, f) => s + total4x1000DeCuotas(f.cuotas, formaPago.value, cobrar4x1000.value), 0)
  }
})

const totalPendiente = computed(() => filas.value.reduce((s, f) => s + f.valor, 0))

// «dic 2025 → sep 2026»: de qué meses son sus cuotas vencidas, en corto.
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function mesCorto(fecha) {
  const d = parseDateLocal(fecha)
  return d ? `${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}` : ''
}
function rangoFechas(cuotas) {
  const desde = mesCorto(cuotas[0]?.fecha_limite)
  const hasta = mesCorto(cuotas[cuotas.length - 1]?.fecha_limite)
  return desde === hasta ? desde : `${desde} → ${hasta}`
}

function alternar(id) {
  const s = new Set(marcados.value)
  s.has(id) ? s.delete(id) : s.add(id)
  marcados.value = s
  confirmando.value = false
}

// Cambiar cómo pagaron cambia lo que se va a registrar: vuelve a pedir el segundo toque.
watch(formaPago, () => { confirmando.value = false })

// Sobre los visibles: con una búsqueda escrita, marca o quita solo a esos.
function alternarTodos() {
  const s = new Set(marcados.value)
  const quitar = todosVisiblesMarcados.value
  filasVisibles.value.forEach(f => (quitar ? s.delete(f.socioNatillera.id) : s.add(f.socioNatillera.id)))
  marcados.value = s
  confirmando.value = false
}

async function preparar() {
  preparando.value = true
  filas.value = []
  try {
    const activos = props.socios.filter(sn => sn.estado === 'activo')
    const porSocio = await cuotasParaPonerAlDiaPorSocio(activos.map(sn => sn.id))
    filas.value = activos
      .filter(sn => porSocio.has(sn.id))
      .map(sn => {
        const cuotas = porSocio.get(sn.id)
        return { socioNatillera: sn, nombre: sn.socio?.nombre || 'Socio', cuotas, valor: cuotas.reduce((s, c) => s + c.pendiente, 0) }
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  } catch (e) {
    console.error('Poner al día (masivo): cuotas', e)
  } finally {
    preparando.value = false
  }
}

async function registrar() {
  if (guardando.value || seleccion.value.socios === 0) return
  guardando.value = true
  confirmando.value = false
  const lote = filas.value
    .filter(f => marcados.value.has(f.socioNatillera.id))
    .map(f => ({ socioNatillera: f.socioNatillera, cuotas: f.cuotas }))
  progreso.value = { hechas: 0, total: lote.reduce((s, x) => s + x.cuotas.length, 0) }
  try {
    resultado.value = await ponerSociosAlDia({
      lote,
      natilleraId: props.natilleraId,
      natilleraNombre: props.natilleraNombre || null,
      formaPago: formaPago.value,
      cobrar4x1000: cobrar4x1000.value,
      alAvanzar: (hechas, total) => { progreso.value = { hechas, total } }
    })
    emit('guardado', resultado.value)
  } finally {
    guardando.value = false
  }
}

function cerrar() {
  if (guardando.value) return
  emit('close')
}

watch(() => props.show, abierto => {
  if (!abierto) return
  Object.assign(progreso.value, { hechas: 0, total: 0 })
  resultado.value = null
  confirmando.value = false
  busqueda.value = ''
  marcados.value = new Set()
  formaPago.value = 'efectivo'
  cobrar4x1000.value = false
  preparar()
}, { immediate: true })

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()
</script>

<style scoped>
/* Controles fijos: franja suave de marca, separa lo que se configura de la lista */
.pad-controles {
  background: linear-gradient(180deg, #f6fbf7 0%, #fff 100%);
  border-bottom: 1px solid var(--surface-divider, #e2e8f0);
}

/* 4×1000 y «Seleccionar todos»: píldoras con el mismo lenguaje que el resto de la app */
.pad-opcion,
.pad-todos {
  /* relative: contiene la casilla oculta (sr-only). Sin esto, al marcarla el navegador
     desplazaba el contenedor para enfocarla y dejaba un hueco en blanco. */
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1px solid rgba(27, 94, 55, 0.25);
  background: #fff;
  color: #1B5E37;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.pad-opcion.is-activa,
.pad-todos.is-activo {
  background: var(--brand-primary-soft, #e8f5ec);
  border-color: rgba(27, 94, 55, 0.45);
}
.pad-opcion:focus-within,
.pad-todos:focus-visible {
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18);
}
.pad-opcion__caja {
  display: flex;
  width: 1.125rem;
  height: 1.125rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.3rem;
  border: 1.5px solid rgba(27, 94, 55, 0.5);
  background: #fff;
}
.pad-opcion.is-activa .pad-opcion__caja {
  background: #1B5E37;
  border-color: #1B5E37;
  color: #fff;
}

/* Métricas: mismas proporciones que el resumen financiero del detalle del socio */
.pad-metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px solid var(--surface-divider, #e2e8f0);
  background: var(--surface-muted, #f8fafc);
}
.pad-metric__label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
}
.pad-metric__valor {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pad-metric__nota {
  font-size: 0.6875rem;
  color: #64748b;
}
.pad-metric--marca {
  background: var(--brand-primary-soft, #e8f5ec);
  border-color: rgba(27, 94, 55, 0.18);
}
.pad-metric--marca .pad-metric__label,
.pad-metric--marca .pad-metric__valor { color: #1B5E37; }
.pad-metric--debe {
  background: #fffbeb;
  border-color: #fde68a;
}
.pad-metric--debe .pad-metric__label,
.pad-metric--debe .pad-metric__valor { color: #b45309; }

/* Nota informativa y aviso: callouts compactos */
.pad-nota {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md, 0.625rem);
  background: #f0f7f2;
  color: #1B5E37;
  font-size: 0.75rem;
  line-height: 1.45;
}
.pad-aviso {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-md, 0.625rem);
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #78350f;
  font-size: 0.8125rem;
  line-height: 1.45;
}
.pad-aviso > svg { color: #b45309; margin-top: 0.0625rem; }

/* Tarjeta de socio: como las de la lista de Socios; al marcarla se tiñe de marca */
.pad-socio {
  position: relative; /* contiene la casilla oculta: ver .pad-opcion */
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 68px;
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px solid var(--surface-divider, #e2e8f0);
  background: #fff;
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.05));
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.pad-socio:hover { border-color: rgba(27, 94, 55, 0.3); }
.pad-socio:focus-within { box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18); }
.pad-socio.is-marcado {
  border-color: rgba(27, 94, 55, 0.45);
  background: linear-gradient(180deg, #f6fbf7 0%, #eef7f0 100%);
}
.pad-socio__check {
  display: flex;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 2px solid #cbd5e1;
  background: #fff;
  color: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.pad-socio.is-marcado .pad-socio__check {
  border-color: #1B5E37;
  background: #1B5E37;
  color: #fff;
}
.pad-socio__valor {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 800;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.pad-socio.is-marcado .pad-socio__valor { color: #1B5E37; }

/* Resultado y lista vacía: sello de marca */
.pad-exito {
  display: flex;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--brand-primary-soft, #e8f5ec);
  color: #1B5E37;
  box-shadow: 0 0 0 6px rgba(27, 94, 55, 0.08);
}

/* ==========================================================================
   Modo oscuro (skill natillerapp-modo-oscuro). Propuesto con
   scripts/tema/proponer-oscuro.mjs y revisado a mano. Solo lo que cambia: las
   reglas de claro de arriba quedan intactas.
   ========================================================================== */
:where([data-tema=oscuro]) .pad-controles:not(:where([data-tema=claro] *)) {
  background: linear-gradient(180deg, var(--superficie-suave) 0%, var(--superficie-tarjeta) 100%);
}
:where([data-tema=oscuro]) .pad-opcion:not(:where([data-tema=claro] *)),
:where([data-tema=oscuro]) .pad-todos:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: var(--superficie-tarjeta);
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .pad-opcion.is-activa:not(:where([data-tema=claro] *)),
:where([data-tema=oscuro]) .pad-todos.is-activo:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .pad-opcion__caja:not(:where([data-tema=claro] *)) {
  border: 1.5px solid var(--marca-tinta-borde);
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .pad-metric__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .pad-metric__valor:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .pad-metric__nota:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .pad-metric--marca:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .pad-metric--marca .pad-metric__label:not(:where([data-tema=claro] *)),
:where([data-tema=oscuro]) .pad-metric--marca .pad-metric__valor:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .pad-metric--debe:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .pad-metric--debe .pad-metric__label:not(:where([data-tema=claro] *)),
:where([data-tema=oscuro]) .pad-metric--debe .pad-metric__valor:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .pad-nota:not(:where([data-tema=claro] *)) {
  background: var(--marca-suave);
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .pad-aviso:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .pad-aviso > svg:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .pad-socio:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .pad-socio:hover:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .pad-socio.is-marcado:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
  background: linear-gradient(180deg, var(--superficie-suave) 0%, var(--marca-suave) 100%);
}
:where([data-tema=oscuro]) .pad-socio__check:not(:where([data-tema=claro] *)) {
  border: 2px solid var(--borde-fuerte);
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .pad-socio__valor:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .pad-socio.is-marcado .pad-socio__valor:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .pad-exito:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
</style>

<template>
  <!--
    Carga rápida de pagos: pasar el cuaderno de una vez. Una fila por socio con deuda; al
    abrirla salen sus conceptos como chips —cada mes pendiente, cada actividad con saldo y
    sus cuotas de préstamo vencidas—, se marca lo que pagó y se registra todo junto.

    Antes esto era una cuadrícula socios × meses: en el celular obligaba a deslizar en dos
    ejes y las casillas no decían de qué mes ni de cuánto eran. Por eso la lista.

    Cada socio se registra con el mismo camino del pago normal: cuotasStore.registrarPago por
    cada cuota y, en su último pago, las actividades y cuotas de préstamo (usePagoConceptosCuota),
    enlazadas a ese pago como cuando se cobran juntas desde el modal. Un solo recálculo de
    mora al final, no uno por pago.
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
          <TableCellsIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Carga rápida de pagos</h2>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/80">Pasa lo del cuaderno de una vez</p>
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
            <TableCellsIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Carga rápida de pagos</h2>
          <p class="mt-1 text-xs leading-snug text-white/80">Pasa lo del cuaderno de una vez</p>
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
    <div v-if="!resultado" class="flex-shrink-0 space-y-2.5 border-b border-borde-suave px-4 pb-3 pt-3 sm:space-y-3 sm:px-6 sm:pt-4">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <SwitchSegmentado v-model="formaPago" :opciones="OPCIONES_FORMA_PAGO" />
        <label v-if="formaPago === 'transferencia'" class="flex min-h-[44px] cursor-pointer touch-manipulation items-center gap-2 text-sm font-semibold text-texto-medio">
          <input v-model="cobrar4x1000" type="checkbox" class="h-5 w-5 rounded border-borde-fuerte text-marca-tinta focus:ring-[#1B5E37]" />
          Cobrar 4×1000
        </label>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="ds-search min-w-0 flex-1">
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
        <!-- El caso común del cuaderno: «este mes lo pagó casi todo el mundo» -->
        <button
          v-if="mesSugerido"
          type="button"
          class="min-h-[44px] flex-shrink-0 touch-manipulation rounded-full border border-[#1B5E37]/25 oscuro:border-marca-tinta/25 px-3 text-sm font-semibold text-marca-tinta hover:bg-marca-suave"
          @click="alternarColumna(mesSugerido.clave)"
        >
          {{ mesTodoMarcado ? 'Quitar' : 'Marcar' }} {{ mesSugerido.etiquetaLarga }}
        </button>
      </div>
    </div>

    <!-- Resultado: reemplaza la cuadrícula al terminar -->
    <div v-if="resultado" class="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <span class="flex h-14 w-14 items-center justify-center rounded-full bg-marca-suave">
        <CheckIcon class="h-7 w-7 text-marca-tinta" />
      </span>
      <p class="mt-3 font-display text-lg font-bold text-texto-fuerte">
        {{ resultado.registrados }} {{ resultado.registrados === 1 ? 'pago registrado' : 'pagos registrados' }}
      </p>
      <p v-if="resultado.fallidos.length" class="mt-2 max-w-sm text-sm text-amber-700 oscuro:text-amber-300">
        No se pudo con {{ resultado.fallidos.join(', ') }}. Lo que falló sigue pendiente; puedes intentarlo de nuevo.
      </p>
    </div>

    <div v-else class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <!--
        Una fila por socio, no una cuadrícula: en el celular una tabla de socios × meses
        obliga a deslizar de lado y a adivinar qué es cada casilla. Aquí cada concepto
        lleva su nombre y su monto, y la fila se abre solo cuando se va a cobrar.
      -->
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch]"
        @scroll.passive="onScroll"
      >
        <CargaCaja v-if="preparando" texto="Preparando la carga" />

        <p v-else-if="sociosVisibles.length === 0" class="px-6 py-10 text-center text-sm text-texto-suave">
          {{ socios.length === 0 ? 'Aún no hay cuotas para cargar.' : 'Ningún socio con ese nombre.' }}
        </p>

        <ul v-else class="divide-y divide-borde-suave">
          <li v-for="socio in sociosVisibles" :key="socio.id">
            <!--
              Dos gestos en la misma fila: el botón grande marca de una vez todo lo que el
              socio debía (el caso normal del cuaderno: pagó lo suyo) y el nombre abre el
              detalle solo cuando pagó una parte.
            -->
            <div class="flex items-stretch gap-1 px-2 sm:px-4" :class="{ 'bg-[#F2F8F3] oscuro:bg-marca-suave': abierto === socio.id }">
              <button
                type="button"
                class="flex min-h-[3.75rem] min-w-0 flex-1 touch-manipulation items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-[#F6FAF7] oscuro:hover:bg-superficie-suave"
                :aria-expanded="abierto === socio.id"
                :aria-label="`Ver los conceptos de ${socio.nombre}`"
                @click="alternarSocio(socio.id)"
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[0.9375rem] font-bold text-texto-fuerte">{{ socio.nombre }}</span>
                  <span class="block truncate text-xs" :class="socio.marcado > 0 ? 'text-marca-tinta font-semibold' : 'text-texto-suave'">
                    {{ socio.marcado > 0 ? socio.textoMarcado : socio.textoPendiente }}
                  </span>
                </span>
                <ChevronDownIcon
                  class="h-4 w-4 flex-shrink-0 text-texto-tenue transition-transform motion-reduce:transition-none"
                  :class="{ 'rotate-180': abierto === socio.id }"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                class="my-1.5 flex min-h-[3rem] flex-shrink-0 touch-manipulation items-center gap-1.5 rounded-xl border px-3 text-sm font-bold transition-colors"
                :class="socio.todoMarcado ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-[#1B5E37] text-white' : 'border-[#1B5E37]/25 oscuro:border-marca-tinta/25 bg-superficie-tarjeta text-marca-tinta'"
                :aria-pressed="socio.todoMarcado"
                :aria-label="`${socio.todoMarcado ? 'Quitar' : 'Marcar'} todo lo de ${socio.nombre}: ${formatMoney(socio.deuda)}`"
                @click="alternarTodoDelSocio(socio)"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
                <span class="tabular-nums">${{ formatMoney(socio.todoMarcado ? socio.marcado : socio.deuda) }}</span>
              </button>
            </div>

            <!-- Conceptos del socio: cada uno con su nombre y su valor -->
            <div v-if="abierto === socio.id" class="space-y-3 bg-[#FAFCFA] oscuro:bg-superficie-suave px-4 pb-4 pt-1 sm:px-6">
              <div v-if="socio.meses.length > 0">
                <div class="mb-1.5 flex items-center justify-between gap-2">
                  <p class="cr-titulo">Cuotas</p>
                  <button
                    type="button"
                    class="min-h-[2.25rem] touch-manipulation rounded-full px-2 text-xs font-bold text-marca-tinta hover:bg-marca-suave"
                    @click="alternarFila(socio.id)"
                  >
                    {{ socio.todasMarcadas ? 'Quitar todas' : 'Marcar todas' }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="m in socio.meses"
                    :key="m.clave"
                    type="button"
                    class="cr-chip"
                    :class="claseChip(m.marca)"
                    :aria-pressed="!!m.marca"
                    :aria-label="`${socio.nombre}, ${m.etiquetaLarga}: ${textoMarca(m.marca)}`"
                    @click="ciclarCelda(socio.id, m.clave)"
                  >
                    <CheckIcon v-if="m.marca" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>{{ m.etiquetaLarga }}</span>
                    <span class="tabular-nums opacity-80">${{ formatMoney(m.pendiente) }}</span>
                    <span v-if="m.marca === 'multa'" class="cr-chip__nota">+ multa</span>
                    <span v-else-if="m.parcial" class="cr-chip__nota">media</span>
                  </button>
                </div>
                <p v-if="hayMultas" class="mt-1.5 text-[0.6875rem] text-texto-suave">
                  Toca otra vez una cuota si la pagó con multa.
                </p>
              </div>

              <div v-if="socio.actividades.length > 0">
                <p class="cr-titulo mb-1.5">Actividades</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="a in socio.actividades"
                    :key="a.id"
                    type="button"
                    class="cr-chip"
                    :class="a.marcada ? 'cr-chip--act-on' : 'cr-chip--off'"
                    :aria-pressed="a.marcada"
                    @click="alternarActividad(a.id)"
                  >
                    <CheckIcon v-if="a.marcada" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span class="max-w-[10rem] truncate">{{ a.nombre }}</span>
                    <span class="tabular-nums opacity-80">${{ formatMoney(a.valor_pendiente) }}</span>
                  </button>
                </div>
              </div>

              <div v-if="socio.prestamo.total > 0">
                <p class="cr-titulo mb-1.5">Préstamo · {{ socio.prestamo.total }} {{ socio.prestamo.total === 1 ? 'cuota vencida' : 'cuotas vencidas' }}</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="cp in socio.prestamo.cuotas"
                    :key="cp.id"
                    type="button"
                    class="cr-chip"
                    :class="cp.marcada ? 'cr-chip--prest-on' : 'cr-chip--off'"
                    :aria-pressed="cp.marcada"
                    :aria-label="`Cuota ${cp.numero_cuota} del préstamo: ${formatMoney(cp.valor_pendiente)}`"
                    @click="marcarPrestamoHasta(socio.id, cp.indice)"
                  >
                    <CheckIcon v-if="cp.marcada" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span>Cuota {{ cp.numero_cuota }}</span>
                    <span class="tabular-nums opacity-80">${{ formatMoney(cp.valor_pendiente) }}</span>
                  </button>
                </div>
                <p class="mt-1.5 text-[0.6875rem] text-texto-suave">Se pagan en orden, de la más vieja a la más nueva.</p>
              </div>

              <p v-if="socio.necesitaCuota" class="rounded-xl bg-amber-50 oscuro:bg-amber-500/15 px-3 py-2 text-xs leading-relaxed text-amber-800 oscuro:text-amber-300">
                Marca también una cuota: la actividad o el préstamo se registran junto a ese pago.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 border-t border-borde bg-superficie-tarjeta px-4 pt-3 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <template v-if="resultado">
        <button type="button" class="btn-modal-primary w-full" @click="cerrar">Listo</button>
      </template>
      <template v-else>
        <!-- Total arriba y el detalle en una línea (en el celular se recorta: la cuadrícula manda) -->
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-texto-medio sm:whitespace-normal">
              {{ hayAlgo ? resumen.join(' · ') : 'Nada marcado todavía' }}
            </p>
          </div>
          <button
            v-if="hayAlgo"
            type="button"
            class="min-h-[44px] flex-shrink-0 touch-manipulation rounded-full px-3 text-sm font-semibold text-marca-tinta hover:bg-marca-suave"
            @click="limpiar"
          >
            Quitar marcas
          </button>
        </div>
        <!-- Actividades y préstamo se registran junto a un pago de cuota, como en el pago normal -->
        <p v-if="sinPortador.length" class="mb-3 rounded-xl bg-amber-50 oscuro:bg-amber-500/15 px-3 py-2 text-xs leading-relaxed text-amber-800 oscuro:text-amber-300">
          Marca también una cuota de {{ sinPortador.join(', ') }}: su actividad o préstamo se registra junto a ese pago.
        </p>
        <div class="flex gap-3">
          <!-- En móvil cierra la X de la cabecera: el ancho es para el botón que se usa -->
          <button type="button" class="btn-modal-secondary hidden flex-1 sm:inline-flex" :disabled="guardando" @click="cerrar">Cancelar</button>
          <button
            type="button"
            class="btn-modal-primary flex-1 disabled:opacity-50 sm:flex-[1.4]"
            :disabled="!hayAlgo || sinPortador.length > 0 || guardando"
            @click="registrar"
          >
            {{ hayAlgo ? `Registrar $${formatMoney(totalGeneral)}` : 'Registrar' }}
          </button>
        </div>
      </template>
    </div>

    <CargaCaja
      :visible="guardando"
      flotante
      texto="Registrando pagos"
      :detalle="`${progreso} de ${sociosAProcesar} socios`"
    />
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon, TableCellsIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import SwitchSegmentado from '../SwitchSegmentado.vue'
import CargaCaja from '../carga/CargaCaja.vue'
import { supabase } from '../../lib/supabase'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { registrarPagoCompletoDeCuota } from '../../composables/usePagoCuotaCompleto'
import { useCuotasStore, capitalCuotaCompleto } from '../../stores/cuotas'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  natilleraId: { type: String, required: true },
  natilleraNombre: { type: String, default: '' }
})

const emit = defineEmits(['close', 'guardado'])

const cuotasStore = useCuotasStore()

const OPCIONES_FORMA_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' }
]
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const formaPago = ref('efectivo')
const cobrar4x1000 = ref(false)
// Cuotas: 'socio|mes' → 'tiempo' | 'multa'
const marcas = ref(new Map())
// Actividades: ids de socios_actividad
const actMarcadas = ref(new Set())
// Préstamos: socio → cuántas cuotas vencidas pagó (las más viejas primero)
const prestMarcadas = ref(new Map())

const busqueda = ref('')
const abierto = ref(null) // socio con sus conceptos a la vista (uno a la vez)

const preparando = ref(false)
const guardando = ref(false)
const progreso = ref(0)
const sociosAProcesar = ref(0)
const resultado = ref(null)

// Datos que no están en el store de cuotas y se cargan al abrir
const configSanciones = ref(null)
const diasGracia = ref(3)
const sociosActividad = ref([]) // pendientes, con `actividad` y `valor_pendiente`
const cuotasPrestamo = ref([]) // vencidas sin pagar, con `socio_natillera_id` y `valor_pendiente`

const hoy = new Date()
const claveHoy = hoy.getFullYear() * 12 + hoy.getMonth()
const hoyIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

function claveMes(cuota) {
  return `${cuota.anio}-${String(cuota.mes).padStart(2, '0')}`
}
function pendienteDe(cuota) {
  return Math.max(0, (parseFloat(cuota.valor_cuota) || 0) - (parseFloat(cuota.valor_pagado) || 0))
}
function calcular4x1000(neto) {
  const n = Math.max(0, Math.floor(Number(neto) || 0))
  return n === 0 ? 0 : Math.round((n * 4) / 1000)
}

// ---------------------------------------------------------------- Cuotas

// Solo meses ya corridos (hasta el actual): el cuaderno no tiene pagos del futuro.
const cuotasVisibles = computed(() =>
  (cuotasStore.cuotas || []).filter(c =>
    c.anio && c.mes && c.anio * 12 + (c.mes - 1) <= claveHoy && c.socio_natillera?.estado !== 'inactivo'
  )
)

const meses = computed(() => {
  const claves = [...new Set(cuotasVisibles.value.map(claveMes))].sort()
  const variosAnios = new Set(claves.map(k => k.slice(0, 4))).size > 1
  return claves.map(clave => {
    const [anio, mes] = clave.split('-').map(Number)
    return {
      clave,
      etiqueta: MESES_CORTOS[mes - 1],
      anioCorto: variosAnios ? `'${String(anio).slice(2)}` : '',
      etiquetaLarga: `${MESES_LARGOS[mes - 1]} ${anio}`
    }
  })
})

// Cuotas agrupadas por socio y mes (quincenal = dos cuotas en la misma casilla).
const porSocioMes = computed(() => {
  const mapa = new Map()
  for (const c of cuotasVisibles.value) {
    const k = `${c.socio_natillera_id}|${claveMes(c)}`
    if (!mapa.has(k)) mapa.set(k, [])
    mapa.get(k).push(c)
  }
  return mapa
})

const socios = computed(() => {
  const vistos = new Map()
  for (const c of cuotasVisibles.value) {
    if (!vistos.has(c.socio_natillera_id)) {
      vistos.set(c.socio_natillera_id, {
        id: c.socio_natillera_id,
        nombre: c.socio_natillera?.socio?.nombre || c.nombre_socio || 'Socio',
        periodicidad: c.socio_natillera?.periodicidad || null
      })
    }
  }
  return [...vistos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
})

function celdaDe(socioId, mes) {
  const lista = porSocioMes.value.get(`${socioId}|${mes}`) || []
  if (lista.length === 0) return { tipo: 'vacia', pendientes: [] }
  const pendientes = lista.filter(c => !capitalCuotaCompleto(c))
  if (pendientes.length === 0) return { tipo: 'pagada', pendientes }
  return { tipo: 'pendiente', pendientes, parcial: pendientes.length < lista.length }
}

const marcaDe = (socioId, mes) => marcas.value.get(`${socioId}|${mes}`) || null

function claseChip(marca) {
  if (marca === 'multa') return 'cr-chip--multa'
  if (marca === 'tiempo') return 'cr-chip--on'
  return 'cr-chip--off'
}
function textoMarca(marca) {
  if (marca === 'multa') return 'pagada con multa'
  if (marca === 'tiempo') return 'pagada a tiempo'
  return 'pendiente'
}

function conMarcas(cambios) {
  const nuevo = new Map(marcas.value)
  for (const [k, v] of cambios) v ? nuevo.set(k, v) : nuevo.delete(k)
  marcas.value = nuevo
}

// Un toque: a tiempo. Otro: con multa (si la natillera cobra multas). Otro: sin marcar.
function ciclarCelda(socioId, mes) {
  const k = `${socioId}|${mes}`
  const actual = marcas.value.get(k)
  let siguiente = 'tiempo'
  if (actual === 'tiempo') siguiente = hayMultas.value ? 'multa' : null
  else if (actual === 'multa') siguiente = null
  conMarcas([[k, siguiente]])
}

// Fila y columna: si queda alguna sin marcar, se marcan todas a tiempo; si ya estaban todas, se desmarcan.
function pendientesDeFila(socioId) {
  return meses.value.map(m => m.clave).filter(mes => celdaDe(socioId, mes).tipo === 'pendiente')
}
function pendientesDeColumna(mes) {
  return socios.value.map(s => s.id).filter(id => celdaDe(id, mes).tipo === 'pendiente')
}

function alternarFila(socioId) {
  const lista = pendientesDeFila(socioId)
  const todas = lista.every(mes => marcaDe(socioId, mes))
  conMarcas(lista.map(mes => [`${socioId}|${mes}`, todas ? null : (marcaDe(socioId, mes) || 'tiempo')]))
}
function alternarColumna(mes) {
  const lista = pendientesDeColumna(mes)
  const todas = lista.every(id => marcaDe(id, mes))
  conMarcas(lista.map(id => [`${id}|${mes}`, todas ? null : (marcaDe(id, mes) || 'tiempo')]))
}

// ---------------------------------------------------------------- Multas

const hayMultas = computed(() => !!configSanciones.value?.activa)

// Primer día de mora de la cuota: el siguiente al vencimiento (o límite + gracia + 1).
function primerDiaMora(cuota) {
  const base = String(cuota.fecha_vencimiento || cuota.fecha_limite || '').slice(0, 10)
  if (!base) return hoyIso
  const [a, m, d] = base.split('-').map(Number)
  const x = new Date(a, m - 1, d)
  x.setDate(x.getDate() + (cuota.fecha_vencimiento ? 1 : (diasGracia.value || 0) + 1))
  const iso = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  return iso > hoyIso ? hoyIso : iso
}

/*
 * Multa de una cuota pagada tarde. El cuaderno no guarda el día exacto, así que se cobra la
 * del primer día de mora: la multa base de la natillera (simple o escalonada según la racha)
 * sin los intereses por días que se acumularon hasta hoy.
 */
function multaDe(cuota) {
  if (!hayMultas.value || cuota.no_calcular_multa) return 0
  const total = cuotasStore.calcularSancionCuotaAFecha(cuota, configSanciones.value, primerDiaMora(cuota), diasGracia.value)
  return Math.max(0, Math.round(total - (parseFloat(cuota.valor_pagado_sancion) || 0)))
}

// ---------------------------------------------------------------- Actividades

function alternarActividad(id) {
  const nuevo = new Set(actMarcadas.value)
  nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id)
  actMarcadas.value = nuevo
}

// ---------------------------------------------------------------- Préstamos

const prestamosPorSocio = computed(() => {
  const mapa = new Map()
  for (const cp of cuotasPrestamo.value) {
    if (!mapa.has(cp.socio_natillera_id)) mapa.set(cp.socio_natillera_id, [])
    mapa.get(cp.socio_natillera_id).push(cp)
  }
  return mapa
})
const prestamosDe = socioId => prestamosPorSocio.value.get(socioId) || []

/*
 * Las cuotas de préstamo se pagan en orden, así que tocar la tercera marca las tres; tocar
 * la última marcada las quita todas desde ahí. Antes era un contador «2/5» que no decía
 * cuáles ni cuánto.
 */
function marcarPrestamoHasta(socioId, indice) {
  const actual = prestMarcadas.value.get(socioId) || 0
  const nuevo = new Map(prestMarcadas.value)
  const siguiente = actual === indice + 1 ? indice : indice + 1
  siguiente > 0 ? nuevo.set(socioId, siguiente) : nuevo.delete(socioId)
  prestMarcadas.value = nuevo
}

function alternarSocio(socioId) {
  abierto.value = abierto.value === socioId ? null : socioId
}

/*
 * Un toque = «pagó todo lo suyo»: sus cuotas pendientes (a tiempo), sus actividades con
 * saldo y sus cuotas de préstamo vencidas. Si ya estaba todo marcado, lo quita.
 */
function alternarTodoDelSocio(socio) {
  const quitar = socio.todoMarcado
  conMarcas(socio.meses.map(m => [`${socio.id}|${m.clave}`, quitar ? null : (m.marca || 'tiempo')]))

  const acts = new Set(actMarcadas.value)
  for (const a of socio.actividades) quitar ? acts.delete(a.id) : acts.add(a.id)
  actMarcadas.value = acts

  const prest = new Map(prestMarcadas.value)
  if (quitar || socio.prestamo.total === 0) prest.delete(socio.id)
  else prest.set(socio.id, socio.prestamo.total)
  prestMarcadas.value = prest
}

// ---------------------------------------------------------------- Lista de socios

// Mes para la acción de arriba: el último con cuotas, que es el que se está cobrando.
const mesSugerido = computed(() => meses.value[meses.value.length - 1] || null)
const mesTodoMarcado = computed(() => {
  const m = mesSugerido.value
  if (!m) return false
  const pendientes = pendientesDeColumna(m.clave)
  return pendientes.length > 0 && pendientes.every(id => marcaDe(id, m.clave))
})

/*
 * Todo lo que una fila necesita pintar, ya resuelto: sus meses pendientes con valor, sus
 * actividades, sus cuotas de préstamo vencidas y lo que lleva marcado.
 */
const sociosConPendientes = computed(() => {
  const marcadoPorSocio = new Map(plan.value.map(p => {
    const cuotas = p.cuotas.reduce((t, c) => t + c.valor + c.multa, 0)
    const acts = p.actividades.reduce((t, a) => t + a.valor_pendiente, 0)
    const prest = p.prestamo.reduce((t, cp) => t + cp.valor_pendiente, 0)
    return [p.socioId, cuotas + acts + prest]
  }))

  return socios.value.map(s => {
    const mesesSocio = meses.value
      .map(m => ({ ...m, celda: celdaDe(s.id, m.clave) }))
      .filter(m => m.celda.tipo === 'pendiente')
      .map(m => ({
        clave: m.clave,
        etiquetaLarga: m.etiquetaLarga,
        parcial: m.celda.parcial,
        pendiente: m.celda.pendientes.reduce((t, c) => t + pendienteDe(c), 0),
        marca: marcaDe(s.id, m.clave)
      }))
    const actsSocio = sociosActividad.value
      .filter(sa => sa.socio_natillera_id === s.id)
      .map(sa => ({
        id: sa.id,
        nombre: sa.actividad?.descripcion || 'Actividad',
        valor_pendiente: sa.valor_pendiente,
        marcada: actMarcadas.value.has(sa.id)
      }))
    const marcadasPrest = prestMarcadas.value.get(s.id) || 0
    const cuotasPrest = prestamosDe(s.id).map((cp, i) => ({ ...cp, indice: i, marcada: i < marcadasPrest }))

    const deuda = mesesSocio.reduce((t, m) => t + m.pendiente, 0)
      + actsSocio.reduce((t, a) => t + a.valor_pendiente, 0)
      + cuotasPrest.reduce((t, cp) => t + cp.valor_pendiente, 0)
    const partes = []
    if (mesesSocio.length) partes.push(`${mesesSocio.length} ${mesesSocio.length === 1 ? 'cuota' : 'cuotas'}`)
    if (actsSocio.length) partes.push(`${actsSocio.length} ${actsSocio.length === 1 ? 'actividad' : 'actividades'}`)
    if (cuotasPrest.length) partes.push('préstamo')

    return {
      ...s,
      meses: mesesSocio,
      actividades: actsSocio,
      prestamo: { total: cuotasPrest.length, cuotas: cuotasPrest },
      deuda,
      // «3 cuotas · actividades · $180.000», o que ya no debe nada
      textoPendiente: partes.length ? `${partes.join(' · ')} · $${formatMoney(deuda)}` : 'Al día',
      textoMarcado: textoDeLoMarcado(s.id, mesesSocio, actsSocio, cuotasPrest),
      marcado: marcadoPorSocio.get(s.id) || 0,
      todasMarcadas: mesesSocio.length > 0 && mesesSocio.every(m => m.marca),
      // Todo lo que debía, marcado: es lo que decide el botón de un toque
      todoMarcado:
        mesesSocio.length + actsSocio.length + cuotasPrest.length > 0 &&
        mesesSocio.every(m => m.marca) &&
        actsSocio.every(a => a.marcada) &&
        cuotasPrest.every(cp => cp.marcada),
      // Actividad o préstamo marcados sin ninguna cuota que los lleve (ver repartirPagos)
      necesitaCuota: sinPortadorIds.value.has(s.id)
    }
  }).filter(s => s.deuda > 0 || s.marcado > 0)
})

// «2 cuotas · actividad marcadas», para leer la fila sin abrirla
function textoDeLoMarcado(socioId, mesesSocio, actsSocio, cuotasPrest) {
  const cuotas = mesesSocio.filter(m => m.marca).length
  const multas = mesesSocio.filter(m => m.marca === 'multa').length
  const acts = actsSocio.filter(a => a.marcada).length
  const prest = cuotasPrest.filter(cp => cp.marcada).length
  const partes = []
  if (cuotas) partes.push(`${cuotas} ${cuotas === 1 ? 'cuota' : 'cuotas'}`)
  if (multas) partes.push(`${multas} con multa`)
  if (acts) partes.push(`${acts} ${acts === 1 ? 'actividad' : 'actividades'}`)
  if (prest) partes.push(`${prest} de préstamo`)
  return `${partes.join(' · ')} marcado`
}

const sociosVisibles = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return sociosConPendientes.value
  return sociosConPendientes.value.filter(s => s.nombre.toLowerCase().includes(q))
})

// ---------------------------------------------------------------- Plan de pagos

/*
 * Qué se paga, por socio: sus cuotas marcadas (de la más vieja a la más nueva, cada una con
 * su fecha y su multa) y, colgadas del último pago, sus actividades y cuotas de préstamo.
 */
const plan = computed(() => {
  const porSocio = new Map()
  const socioDe = id => {
    if (!porSocio.has(id)) porSocio.set(id, { socioId: id, cuotas: [], actividades: [], prestamo: [] })
    return porSocio.get(id)
  }
  for (const [k, marca] of marcas.value) {
    const [socioId, mes] = k.split('|')
    for (const cuota of celdaDe(socioId, mes).pendientes) {
      const conMulta = marca === 'multa'
      socioDe(socioId).cuotas.push({
        cuota,
        valor: pendienteDe(cuota),
        multa: conMulta ? multaDe(cuota) : 0,
        // A tiempo: su fecha límite (sin multa). Con multa: su primer día de mora.
        fecha: conMulta ? primerDiaMora(cuota) : (String(cuota.fecha_limite || '').slice(0, 10) > hoyIso ? hoyIso : String(cuota.fecha_limite).slice(0, 10))
      })
    }
  }
  for (const sa of sociosActividad.value) {
    if (actMarcadas.value.has(sa.id)) socioDe(sa.socio_natillera_id).actividades.push(sa)
  }
  for (const [socioId, n] of prestMarcadas.value) {
    socioDe(socioId).prestamo.push(...prestamosDe(socioId).slice(0, n))
  }
  for (const p of porSocio.values()) {
    p.cuotas.sort((a, b) => String(a.cuota.fecha_limite).localeCompare(String(b.cuota.fecha_limite)))
  }
  return [...porSocio.values()]
})

const totales = computed(() => {
  let cuotas = 0, valorCuotas = 0, multas = 0, valorMultas = 0, acts = 0, valorActs = 0, prest = 0, valorPrest = 0
  for (const p of plan.value) {
    for (const c of p.cuotas) {
      cuotas++
      valorCuotas += c.valor
      if (c.multa > 0) { multas++; valorMultas += c.multa }
    }
    for (const a of p.actividades) { acts++; valorActs += a.valor_pendiente }
    for (const cp of p.prestamo) { prest++; valorPrest += cp.valor_pendiente }
  }
  return { cuotas, valorCuotas, multas, valorMultas, acts, valorActs, prest, valorPrest }
})
const netoGeneral = computed(() => totales.value.valorCuotas + totales.value.valorMultas + totales.value.valorActs + totales.value.valorPrest)
const aplica4x1000 = computed(() => formaPago.value === 'transferencia' && cobrar4x1000.value)
const total4x1000 = computed(() => {
  if (!aplica4x1000.value) return 0
  // Se liquida por cada pago, igual que el registro normal
  let t = 0
  for (const p of plan.value) {
    const pagos = repartirPagos(p)
    for (const pago of pagos) t += calcular4x1000(pago.valorPagado)
  }
  return t
})
const totalGeneral = computed(() => netoGeneral.value + total4x1000.value)
const hayAlgo = computed(() => plan.value.length > 0)

// Socios con actividades o préstamo marcados pero ninguna cuota a la cual asociarlos.
const sinPortadorIds = computed(
  () => new Set(plan.value.filter(p => repartirPagos(p).some(pago => pago.sinPortador)).map(p => p.socioId))
)
const sinPortador = computed(() => {
  const nombres = new Map(socios.value.map(s => [s.id, s.nombre]))
  return [...sinPortadorIds.value].map(id => nombres.get(id) || 'Socio')
})

const resumen = computed(() => {
  const t = totales.value
  const partes = []
  if (t.cuotas) partes.push(`${t.cuotas} ${t.cuotas === 1 ? 'cuota' : 'cuotas'}`)
  if (t.multas) partes.push(`${t.multas} con multa ($${formatMoney(t.valorMultas)})`)
  if (t.acts) partes.push(`${t.acts} ${t.acts === 1 ? 'actividad' : 'actividades'}`)
  if (t.prest) partes.push(`${t.prest} ${t.prest === 1 ? 'cuota de préstamo' : 'cuotas de préstamo'}`)
  if (total4x1000.value) partes.push(`4×1000 $${formatMoney(total4x1000.value)}`)
  return partes
})

function limpiar() {
  marcas.value = new Map()
  actMarcadas.value = new Set()
  prestMarcadas.value = new Map()
}

/*
 * Pagos concretos de un socio. Cada cuota marcada es un pago; actividades y préstamo van en
 * el último. Si el socio no tiene cuotas marcadas, van sobre su cuota pagada más reciente
 * (como un segundo abono), con fecha de hoy.
 */
function repartirPagos(p) {
  const totalActs = p.actividades.reduce((s, a) => s + a.valor_pendiente, 0)
  const totalPrest = p.prestamo.reduce((s, cp) => s + cp.valor_pendiente, 0)
  const pagos = p.cuotas.map(c => ({
    cuota: c.cuota, fecha: c.fecha, multa: c.multa, valorPagado: c.valor + c.multa, actividades: [], prestamo: []
  }))
  if (totalActs + totalPrest > 0) {
    let portador = pagos[pagos.length - 1]
    if (!portador) {
      const pagadas = (cuotasStore.cuotas || [])
        .filter(c => c.socio_natillera_id === p.socioId && capitalCuotaCompleto(c))
        .sort((a, b) => String(b.fecha_limite).localeCompare(String(a.fecha_limite)))
      if (!pagadas[0]) return [{ sinPortador: true, valorPagado: totalActs + totalPrest }]
      portador = { cuota: pagadas[0], fecha: hoyIso, multa: 0, valorPagado: 0, actividades: [], prestamo: [] }
      pagos.push(portador)
    }
    portador.actividades = p.actividades
    portador.prestamo = p.prestamo
    portador.valorPagado += totalActs + totalPrest
  }
  return pagos
}

// ---------------------------------------------------------------- Registrar

// El registro de cada pago es el compartido con el pago rápido (usePagoCuotaCompleto).
async function registrarPagoDe(pago, socio) {
  const { ok } = await registrarPagoCompletoDeCuota({
    pago,
    socio,
    natilleraId: props.natilleraId,
    natilleraNombre: props.natilleraNombre || null,
    formaPago: formaPago.value,
    cobrar4x1000: cobrar4x1000.value
  })
  return ok
}

async function registrar() {
  if (guardando.value || !hayAlgo.value) return
  guardando.value = true
  progreso.value = 0

  const sociosPorId = new Map(socios.value.map(s => [s.id, s]))
  const colas = plan.value.map(p => ({ socio: sociosPorId.get(p.socioId), pagos: repartirPagos(p) }))
  sociosAProcesar.value = colas.length

  let registrados = 0
  const fallidos = new Set()
  // Cada socio en orden (sus pagos de lo más viejo a lo más nuevo), tres socios a la vez.
  async function trabajador() {
    while (colas.length > 0) {
      const { socio, pagos } = colas.shift()
      for (const pago of pagos) {
        if (pago.sinPortador) {
          // Sin ninguna cuota a la cual asociar actividades o préstamo
          fallidos.add(`${socio?.nombre || 'un socio'} (marca también una cuota)`)
          continue
        }
        let ok = false
        try {
          ok = await registrarPagoDe(pago, socio)
        } catch (e) {
          console.warn('Carga rápida:', e)
        }
        if (ok) registrados++
        else fallidos.add(socio?.nombre || 'un socio')
      }
      progreso.value++
    }
  }
  await Promise.all([trabajador(), trabajador(), trabajador()])

  // Un solo recálculo de estados y multas para todo el lote.
  try {
    await cuotasStore.fetchCuotasNatillera(props.natilleraId)
  } catch (e) {
    console.warn('Carga rápida: recarga de cuotas', e)
  }

  limpiar()
  guardando.value = false
  resultado.value = { registrados, fallidos: [...fallidos] }
  emit('guardado', resultado.value)
}

function cerrar() {
  if (guardando.value) return
  emit('close')
}

// ---------------------------------------------------------------- Carga al abrir

async function cargarConceptos() {
  const socioIds = [...new Set((cuotasStore.cuotas || []).map(c => c.socio_natillera_id))]
  if (socioIds.length === 0) return

  const [natRes, saRes, prestRes] = await Promise.all([
    supabase.from('natilleras').select('reglas_multas').eq('id', props.natilleraId).single(),
    supabase.from('socios_actividad').select('*').in('socio_natillera_id', socioIds).in('estado', ['pendiente', 'parcial', 'mora']),
    supabase.from('prestamos').select('id, socio_natillera_id').in('socio_natillera_id', socioIds).eq('estado', 'activo')
  ])

  configSanciones.value = natRes.data?.reglas_multas?.sanciones || null
  diasGracia.value = natRes.data?.reglas_multas?.dias_gracia ?? 3

  // Actividades: con saldo y ya cobrables (su mes de pago no es futuro), como en el pago normal.
  const pendientes = (saRes.data || [])
    .map(sa => ({ ...sa, valor_pendiente: Math.max(0, (parseFloat(sa.valor_asignado) || 0) - (parseFloat(sa.valor_pagado) || 0)) }))
    .filter(sa => sa.valor_pendiente > 0 && sa.mes_pago && sa.anio_pago && sa.anio_pago * 12 + (sa.mes_pago - 1) <= claveHoy)
  const actividadIds = [...new Set(pendientes.map(sa => sa.actividad_id))]
  let actividadesMap = new Map()
  if (actividadIds.length > 0) {
    const { data } = await supabase.from('actividades').select('id, tipo, descripcion, fecha_limite_pago, estado').in('id', actividadIds)
    actividadesMap = new Map((data || []).map(a => [a.id, a]))
  }
  sociosActividad.value = pendientes
    .map(sa => ({ ...sa, actividad: actividadesMap.get(sa.actividad_id) }))
    .filter(sa => sa.actividad)

  // Préstamos: cuotas del plan ya vencidas y sin pagar.
  const prestamos = prestRes.data || []
  if (prestamos.length > 0) {
    const socioDePrestamo = new Map(prestamos.map(p => [p.id, p.socio_natillera_id]))
    const { data } = await supabase
      .from('plan_pagos_prestamo')
      .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, fecha_proyectada')
      .in('prestamo_id', prestamos.map(p => p.id))
      .eq('pagada', false)
      .lte('fecha_proyectada', hoyIso)
      .order('fecha_proyectada', { ascending: true })
    cuotasPrestamo.value = (data || [])
      .map(cp => ({
        ...cp,
        socio_natillera_id: socioDePrestamo.get(cp.prestamo_id),
        valor_pendiente: Math.max(0, (parseFloat(cp.valor_cuota) || 0) - (parseFloat(cp.valor_pagado) || 0))
      }))
      .filter(cp => cp.valor_pendiente > 0)
  } else {
    cuotasPrestamo.value = []
  }
}

// Al abrir: asegurar que existan las filas de cada mes corrido (las de un mes solo se crean
// al visitarlo), traer actividades, préstamos y reglas de multa, y empezar limpio.
watch(() => props.show, async (abierto) => {
  if (!abierto) return
  limpiar()
  resultado.value = null
  formaPago.value = 'efectivo'
  cobrar4x1000.value = false
  preparando.value = true
  try {
    const claves = [...new Set((cuotasStore.cuotas || []).map(claveMes))]
      .filter(k => {
        const [a, m] = k.split('-').map(Number)
        return a * 12 + (m - 1) <= claveHoy
      })
    let creadas = false
    for (const k of claves) {
      const [a, m] = k.split('-').map(Number)
      const r = await cuotasStore.generarCuotasFaltantes(props.natilleraId, m, a)
      if (r?.cuotasGeneradas > 0) creadas = true
    }
    if (creadas) await cuotasStore.fetchCuotasNatillera(props.natilleraId, { skipMoraUpdate: true })
    await cargarConceptos()
  } catch (e) {
    console.warn('Carga rápida: preparación', e)
  } finally {
    preparando.value = false
  }
})

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()
</script>

<style scoped>
.cr-titulo {
  font-family: var(--font-brand-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

/* Cada concepto es un chip con nombre y monto; área táctil de 44 px */
.cr-chip {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.75rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.2;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.cr-chip__nota {
  padding: 0.0625rem 0.375rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 0.625rem;
  font-weight: 800;
}
.cr-chip--off { border-color: #dbe3db; background: #fff; color: #475569; }
.cr-chip--on { border-color: #1B5E37; background: #1B5E37; color: #fff; }
.cr-chip--multa { border-color: #b45309; background: #b45309; color: #fff; }
.cr-chip--act-on { border-color: #6d28d9; background: #6d28d9; color: #fff; }
.cr-chip--prest-on { border-color: #1d4ed8; background: #1d4ed8; color: #fff; }
@media (hover: hover) {
  .cr-chip--off:hover { border-color: rgba(27, 94, 55, 0.45); background: #f4f8f5; }
}
@media (prefers-reduced-motion: reduce) {
  .cr-chip { transition: none; }
}

/* Modo oscuro (skill natillerapp-modo-oscuro): los chips activos son sólidos con
   texto blanco y valen igual; cambian el título y el chip apagado. */
:where([data-tema=oscuro]) .cr-titulo { color: var(--texto-suave); }
:where([data-tema=oscuro]) .cr-chip--off { border-color: var(--borde-fuerte); background: var(--superficie-tarjeta); color: var(--texto-secundario); }
@media (hover: hover) {
  :where([data-tema=oscuro]) .cr-chip--off:hover { border-color: var(--marca-tinta-borde); background: var(--superficie-suave); }
}
</style>

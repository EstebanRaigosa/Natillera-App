<template>
  <!--
    Pago rápido de un socio: todas sus cuotas con saldo, de cualquier mes, cada una con TODOS
    sus conceptos (cuota, sanción, actividades, cuotas de préstamo y 4×1000). Se marcan las
    que paga y se registran juntas; al terminar se abre el comprobante de varias cuotas.

    Cada cuota se registra por el camino del pago normal (usePagoCuotaCompleto). Los abonos a
    medias no van por aquí: «Pagar otro valor» abre el modal de pago de siempre.
  -->
  <ModalWrapper
    :show="show"
    :z-index="55"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="32rem"
    @close="cerrar"
  >
    <!-- Cabecera: móvil en fila [← | icono | títulos | X]; escritorio en columna. X y ← por flex. -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pl-2 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
          aria-label="Volver a socios"
          :disabled="guardando"
          @click="emit('volver')"
        >
          <ChevronLeftIcon class="h-6 w-6" />
        </button>
        <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <CurrencyDollarIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight">Registrar pago</h3>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/90">{{ socio?.nombre || 'Socio' }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
          aria-label="Cerrar"
          :disabled="guardando"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      <div class="hidden sm:flex items-start gap-1 px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="flex w-11 flex-shrink-0 justify-start">
          <button
            type="button"
            class="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
            aria-label="Volver a socios"
            :disabled="guardando"
            @click="emit('volver')"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <CurrencyDollarIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight">Registrar pago</h3>
          <p class="mt-1 text-xs leading-snug text-white/90">{{ socio?.nombre || 'Socio' }} · marca las cuotas que paga</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
          aria-label="Cerrar"
          :disabled="guardando"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="areaScroll"
        class="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta px-4 pt-4 pb-6 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-5"
        @scroll.passive="programarNatiscroll"
      >
        <CargaCaja v-if="cargando" texto="Buscando lo que debe" detalle="Cuotas, sanciones, actividades y préstamos de todos los meses." />

        <p v-else-if="errorCarga" class="rounded-xl border border-red-200 oscuro:border-red-500/30 bg-red-50 oscuro:bg-red-500/15 px-3 py-2.5 text-sm text-red-700 oscuro:text-red-300">{{ errorCarga }}</p>

        <div v-else-if="filas.length === 0" class="rounded-xl bg-marca-suave px-4 py-6 text-center">
          <CheckCircleIcon class="mx-auto h-8 w-8 text-marca-tinta" />
          <p class="mt-2 font-semibold text-marca-tinta">Está al día</p>
          <p class="mt-1 text-sm text-texto-secundario">No tiene cuotas ni conceptos con saldo.</p>
        </div>

        <template v-else>
          <!-- Cómo pagó: la forma decide el 4×1000. La fecha va en cada cuota. -->
          <section class="space-y-3 rounded-xl border border-borde bg-superficie-suave/60 p-3">
            <SwitchSegmentado v-model="formaPago" :opciones="OPCIONES_FORMA_PAGO" aria-label="Forma de pago" :disabled="guardando" />
            <label
              v-if="formaPago === 'transferencia'"
              class="flex min-h-[44px] cursor-pointer touch-manipulation items-center gap-2 text-sm font-semibold text-texto-medio"
            >
              <input v-model="cobrar4x1000" type="checkbox" class="h-5 w-5 rounded border-borde-fuerte text-marca-tinta focus:ring-[#1B5E37]" :disabled="guardando" />
              Cobrar 4×1000
            </label>
          </section>

          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase tracking-wide text-texto-suave">
              {{ filas.length }} {{ filas.length === 1 ? 'cuota con saldo' : 'cuotas con saldo' }}
            </p>
            <button
              v-if="indiceUltimaVencida >= 0"
              type="button"
              class="min-h-[44px] touch-manipulation px-2 text-xs font-semibold text-marca-tinta"
              :disabled="guardando"
              @click="marcarVencidas"
            >
              {{ vencidasMarcadas ? 'Quitar marcas' : 'Marcar todo lo vencido' }}
            </button>
          </div>

          <!-- Una tarjeta por cuota, de la más vieja a la más nueva -->
          <ul class="space-y-2.5">
            <li
              v-for="(fila, i) in filas"
              :key="fila.cuota.id"
              class="overflow-hidden rounded-xl border-2 transition-colors"
              :class="seleccion.has(fila.cuota.id) ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-[#F4FAF5] oscuro:bg-marca-suave' : 'border-borde bg-superficie-tarjeta'"
            >
              <button
                type="button"
                role="checkbox"
                :aria-checked="seleccion.has(fila.cuota.id)"
                class="flex min-h-[52px] w-full touch-manipulation items-center gap-3 px-3 pt-3 pb-2 text-left"
                :disabled="guardando"
                @click="alternar(i)"
              >
                <span
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2"
                  :class="seleccion.has(fila.cuota.id) ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-[#1B5E37] text-white' : 'border-borde-fuerte bg-superficie-tarjeta'"
                >
                  <CheckIcon v-if="seleccion.has(fila.cuota.id)" class="h-4 w-4" stroke-width="3" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-bold text-texto-fuerte">{{ fila.periodo }}</span>
                  <span class="mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-bold" :class="fila.estado.clase">{{ fila.estado.texto }}</span>
                </span>
                <span class="flex-shrink-0 text-right">
                  <span class="block text-base font-extrabold tabular-nums text-texto-fuerte">${{ formatMoney(fila.total) }}</span>
                </span>
              </button>

              <!-- Todos los conceptos de la cuota -->
              <ul class="mx-3 mb-2 space-y-0.5 border-l-2 border-[#E8F5E9] oscuro:border-borde pl-3 text-xs">
                <li v-for="(linea, j) in fila.lineas" :key="j" class="flex justify-between gap-3">
                  <span class="min-w-0" :class="linea.clase">{{ linea.nombre }}</span>
                  <span class="flex-shrink-0 tabular-nums font-semibold" :class="linea.clase">${{ formatMoney(linea.valor) }}</span>
                </li>
              </ul>

              <!--
                Fecha de este pago: por defecto hoy. La sanción de la cuota se calcula a esta fecha.
                Etiqueta encima y campo a lo ancho: en fila, el input date nativo de móvil se salía
                y se montaba sobre la etiqueta. DateInput es el campo de fecha de la app (texto
                dd/MM/aaaa + calendario nativo que funciona en iOS).
              -->
              <div class="mx-3 mb-2">
                <p class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-texto-secundario">
                  <CalendarDaysIcon class="h-4 w-4 text-texto-tenue" aria-hidden="true" />
                  Fecha de pago
                </p>
                <DateInput
                  :model-value="fechaDe(fila.cuota.id)"
                  :disabled="guardando"
                  @update:model-value="cambiarFecha(fila.cuota.id, $event)"
                />
              </div>

              <!-- Abono o valor distinto: el modal de pago de siempre -->
              <div class="px-3 pb-3">
                <button
                  type="button"
                  class="inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-full border-2 border-[#1B5E37]/30 oscuro:border-marca-tinta/30 bg-superficie-tarjeta px-4 text-sm font-semibold text-marca-tinta transition-colors hover:border-[#1B5E37] oscuro:hover:border-marca-tinta hover:bg-marca-suave disabled:opacity-50"
                  :disabled="guardando"
                  @click="emit('detalle', fila.cuota.id)"
                >
                  <PencilSquareIcon class="h-5 w-5" />
                  Pagar otro valor (abono)
                </button>
              </div>
            </li>
          </ul>

          <p class="text-xs leading-snug text-texto-suave">
            Las cuotas se pagan en orden: al marcar una se marcan las anteriores.
          </p>
        </template>
      </div>

      <NatiscrollHint :show="hayNatiscroll" />
    </div>

    <!-- Pie fijo. La barra de Safari tapa el pie de una hoja inferior: se suma `tapado` al padding. -->
    <div
      class="flex-shrink-0 space-y-2.5 border-t border-borde bg-superficie-tarjeta px-4 pt-3 sm:px-5"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <div v-if="filasElegidas.length > 0" class="flex items-baseline justify-between gap-3">
        <span class="min-w-0 text-xs text-texto-secundario">{{ resumenElegido }}</span>
        <span class="flex-shrink-0 text-lg font-extrabold tabular-nums text-marca-tinta">${{ formatMoney(totalElegido) }}</span>
      </div>
      <button
        type="button"
        class="btn-modal-primary w-full"
        :disabled="filasElegidas.length === 0 || guardando || cargando"
        @click="registrar"
      >
        {{ filasElegidas.length === 0 ? 'Marca las cuotas que paga' : `Registrar ${filasElegidas.length} ${filasElegidas.length === 1 ? 'pago' : 'pagos'}` }}
      </button>
      <button type="button" class="btn-modal-secondary w-full" :disabled="guardando" @click="cerrar">Cancelar</button>
    </div>

    <CargaCaja
      :visible="guardando"
      flotante
      texto="Registrando pagos"
      :detalle="`Cuota ${progreso} de ${filasElegidas.length}. No cierres la app.`"
    />
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import SwitchSegmentado from '../SwitchSegmentado.vue'
import CargaCaja from '../carga/CargaCaja.vue'
import DateInput from '../DateInput.vue'
import { supabase } from '../../lib/supabase'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { registrarPagoCompletoDeCuota, calcular4x1000 } from '../../composables/usePagoCuotaCompleto'
import { useCuotasStore, capitalCuotaCompleto, cuotaPagadaDentroDePlazo } from '../../stores/cuotas'
import { useNotificationStore } from '../../stores/notifications'
import { formatMoney } from '../../utils/formatMoney'
import { parseDateLocal } from '../../utils/formatDate'
import { calcularMoraCuota, reglasMoraNatillera } from '../../composables/usePagoPrestamo'

const props = defineProps({
  show: { type: Boolean, default: false },
  natilleraId: { type: String, required: true },
  natilleraNombre: { type: String, default: '' },
  socioNatilleraId: { type: String, default: '' }
})
const emit = defineEmits(['cerrar', 'volver', 'detalle', 'pagado'])

const cuotasStore = useCuotasStore()
const notificationStore = useNotificationStore()

const OPCIONES_FORMA_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' }
]
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const hoyIso = isoLocal(new Date())

const cargando = ref(false)
const errorCarga = ref('')
const guardando = ref(false)
const progreso = ref(0)

const formaPago = ref('efectivo')
const cobrar4x1000 = ref(false)
// Fecha de pago por cuota (id → 'YYYY-MM-DD'). Sin entrada, hoy.
const fechas = ref(new Map())
function fechaDe(cuotaId) {
  return fechas.value.get(cuotaId) || hoyIso
}
function cambiarFecha(cuotaId, valor) {
  const nuevo = new Map(fechas.value)
  // Vacía o futura no vale: vuelve a hoy.
  if (!valor || valor > hoyIso) nuevo.delete(cuotaId)
  else nuevo.set(cuotaId, valor)
  fechas.value = nuevo
}

const socio = ref(null)
const reglasMora = ref({ tasaMora: 0, diasGracia: 0 })
const cuotas = ref([])
const actividades = ref([])
const cuotasPrestamo = ref([])
const configSanciones = ref(null)
const diasGracia = ref(3)
const seleccion = ref(new Set())

useBodyScrollLock(computed(() => props.show))
const { tapado } = useTapadoInferior()

function aNumero(v) {
  return Number(v) || 0
}

function cerrar() {
  if (guardando.value) return
  emit('cerrar')
}

// ---------------------------------------------------------------- Carga

async function cargar() {
  if (!props.socioNatilleraId) return
  cargando.value = true
  errorCarga.value = ''
  seleccion.value = new Set()
  try {
    const [natRes, snRes, cuotasRes, saRes, prestRes] = await Promise.all([
      supabase.from('natilleras').select('reglas_multas, reglas_interes').eq('id', props.natilleraId).single(),
      supabase.from('socios_natillera').select('id, periodicidad, socio:socios(nombre, telefono)').eq('id', props.socioNatilleraId).single(),
      supabase.from('cuotas').select('*').eq('socio_natillera_id', props.socioNatilleraId),
      supabase.from('socios_actividad').select('*').eq('socio_natillera_id', props.socioNatilleraId).in('estado', ['pendiente', 'parcial', 'mora']),
      supabase.from('prestamos').select('id').eq('socio_natillera_id', props.socioNatilleraId).eq('estado', 'activo')
    ])
    for (const r of [natRes, snRes, cuotasRes, saRes, prestRes]) if (r.error) throw r.error

    configSanciones.value = natRes.data?.reglas_multas?.sanciones || null
    diasGracia.value = natRes.data?.reglas_multas?.dias_gracia ?? 3
    // Mora de préstamos: mismas reglas que Préstamos (tasa de mora y gracia del préstamo)
    reglasMora.value = reglasMoraNatillera(natRes.data || {})
    socio.value = {
      nombre: snRes.data?.socio?.nombre || 'Socio',
      telefono: snRes.data?.socio?.telefono || '',
      periodicidad: snRes.data?.periodicidad || 'mensual'
    }
    cuotas.value = cuotasRes.data || []

    const pendientes = (saRes.data || [])
      .map(sa => ({ ...sa, valor_pendiente: Math.max(0, aNumero(sa.valor_asignado) - aNumero(sa.valor_pagado)) }))
      .filter(sa => sa.valor_pendiente > 0)
    const actividadIds = [...new Set(pendientes.map(sa => sa.actividad_id))]
    let mapaActividades = new Map()
    if (actividadIds.length > 0) {
      const { data, error } = await supabase.from('actividades').select('id, tipo, descripcion, fecha_limite_pago, estado').in('id', actividadIds)
      if (error) throw error
      mapaActividades = new Map((data || []).map(a => [a.id, a]))
    }
    actividades.value = pendientes.map(sa => ({ ...sa, actividad: mapaActividades.get(sa.actividad_id) })).filter(sa => sa.actividad)

    const prestamoIds = (prestRes.data || []).map(p => p.id)
    if (prestamoIds.length > 0) {
      const { data, error } = await supabase
        .from('plan_pagos_prestamo')
        .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, capital, fecha_proyectada, mes, anio, quincena')
        .in('prestamo_id', prestamoIds)
        .eq('pagada', false)
        .order('fecha_proyectada', { ascending: true })
      if (error) throw error
      cuotasPrestamo.value = (data || [])
        .map(cp => ({ ...cp, valor_pendiente: Math.max(0, aNumero(cp.valor_cuota) - aNumero(cp.valor_pagado)) }))
        .filter(cp => cp.valor_pendiente > 0)
    } else {
      cuotasPrestamo.value = []
    }
  } catch (e) {
    errorCarga.value = e?.message || 'No se pudo cargar lo que debe el socio'
  } finally {
    cargando.value = false
  }
}

// ---------------------------------------------------------------- A qué cuota va cada concepto

function quincenaDeDia(fechaIso) {
  const dia = Number(String(fechaIso || '').slice(8, 10)) || 1
  return dia <= 15 ? 1 : 2
}

/*
 * Periodo (mes, año, quincena) al que pertenece un concepto, con la misma prioridad que el
 * modal de pago: primero lo que se guardó al crearlo (mes_pago / mes del plan) y si no, su
 * fecha. Para socios mensuales la quincena no cuenta.
 */
function claveCuota(cuota) {
  const q = socio.value?.periodicidad === 'quincenal' ? (cuota.quincena || 0) : 0
  return `${cuota.anio}-${cuota.mes}-${q}`
}
function clavePeriodo(mes, anio, quincena, fechaIso) {
  let m = mes
  let a = anio
  let q = quincena
  if (!m || !a) {
    if (!fechaIso) return null
    a = Number(String(fechaIso).slice(0, 4))
    m = Number(String(fechaIso).slice(5, 7))
  }
  if (socio.value?.periodicidad !== 'quincenal') q = 0
  else if (q !== 1 && q !== 2) q = quincenaDeDia(fechaIso)
  return `${a}-${m}-${q}`
}

function textoPeriodo(c) {
  const mes = MESES[(c.mes || 1) - 1] || ''
  if (c.quincena === 1 || c.quincena === 2) return `${mes} ${c.anio} · ${c.quincena === 1 ? '1ra' : '2da'} quincena`
  return `${mes} ${c.anio}`
}

function ordenCuota(c) {
  return `${String(c.fecha_limite || '').slice(0, 10)}#${Number(c.quincena) || 0}`
}

/*
 * Sanción pendiente, con las reglas de la vista de Cuotas:
 *  · Pagada a tiempo: ninguna.
 *  · Cuota ya pagada, pero tarde: la multa quedó fija al pagarla; se debe lo que falte de esa.
 *  · Cuota con saldo: la multa corre hasta la fecha del pago (calcularSancionCuotaAFecha).
 * Antes se calculaba a la fecha para todas, y esa función supone que la cuota se sigue
 * debiendo: las ya pagadas salían con sanción y «en mora».
 */
function sancionDe(cuota) {
  if (!configSanciones.value?.activa || cuota.no_calcular_multa) return 0
  if (cuotaPagadaDentroDePlazo(cuota)) return 0
  const pagada = aNumero(cuota.valor_pagado_sancion)
  if (capitalCuotaCompleto(cuota)) {
    return Math.max(0, Math.round(multaGuardada(cuota) - pagada))
  }
  let total = cuotasStore.calcularSancionCuotaAFecha(cuota, configSanciones.value, fechaDe(cuota.id), diasGracia.value, cuotas.value)
  // Respaldo: vencida y con multa guardada, pero el cálculo a la fecha no dio nada (fechas de
  // mora incompletas en la fila). Se usa la guardada, que es la que muestra la vista de Cuotas.
  if (!(total > 0) && enMoraPorFecha(cuota)) total = multaGuardada(cuota)
  return Math.max(0, Math.round(total - pagada))
}

function multaGuardada(cuota) {
  return aNumero(cuota.valor_multa) || (aNumero(cuota.valor_multa_base) + aNumero(cuota.valor_multa_intereses))
}

/** Vencida: hoy es posterior a su vencimiento (o a la fecha límite más los días de gracia). */
function enMoraPorFecha(cuota) {
  const venc = String(cuota.fecha_vencimiento || '').slice(0, 10)
  if (venc) return hoyIso > venc
  const limite = String(cuota.fecha_limite || '').slice(0, 10)
  if (!limite) return false
  const [a, m, d] = limite.split('-').map(Number)
  return hoyIso > isoLocal(new Date(a, m - 1, d + (diasGracia.value || 0)))
}

// El estado sale de lo que se ve en la tarjeta, no del `estado` guardado (puede estar viejo).
function estadoDe(cuota, sancion) {
  if (capitalCuotaCompleto(cuota)) {
    return sancion > 0
      ? { texto: 'Cuota pagada · debe sanción', clase: 'bg-red-100 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300' }
      : { texto: 'Cuota pagada · faltan conceptos', clase: 'bg-amber-100 oscuro:bg-amber-500/15 text-amber-800 oscuro:text-amber-300' }
  }
  // Mora es por fecha, no por sanción: sin multas activas o con «no calcular multa» una
  // cuota vencida sigue en mora aunque no cobre nada extra.
  if (sancion > 0 || enMoraPorFecha(cuota)) {
    return aNumero(cuota.valor_pagado) > 0
      ? { texto: 'En mora · pago parcial', clase: 'bg-red-100 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300' }
      : { texto: 'En mora', clase: 'bg-red-100 oscuro:bg-red-500/15 text-red-800 oscuro:text-red-300' }
  }
  if (aNumero(cuota.valor_pagado) > 0) return { texto: 'Pago parcial', clase: 'bg-violet-100 oscuro:bg-violet-500/15 text-violet-800 oscuro:text-violet-300' }
  if (String(cuota.fecha_limite || '').slice(0, 10) > hoyIso) return { texto: 'Adelantada', clase: 'bg-slate-100 oscuro:bg-superficie-hundida text-slate-700 oscuro:text-texto-medio' }
  return { texto: 'Pendiente', clase: 'bg-superficie-hundida text-texto' }
}

const filas = computed(() => {
  const ordenadas = [...cuotas.value].sort((a, b) => ordenCuota(a).localeCompare(ordenCuota(b)))
  const porClave = new Map(ordenadas.map(c => [claveCuota(c), c]))

  // Conceptos sin una cuota de su mismo periodo: si ya son cobrables (periodo pasado o sin
  // periodo), van a la cuota vigente —la más nueva que ya venció— para que ninguno se quede
  // sin mostrar. Uno de un periodo futuro sin cuota no se cobra todavía.
  const vigente = [...ordenadas].reverse().find(c => String(c.fecha_limite || '').slice(0, 10) <= hoyIso) || ordenadas[0]
  const [anioHoy, mesHoy] = hoyIso.split('-').map(Number)
  const esFuturo = clave => {
    if (!clave) return false
    const [a, m] = clave.split('-').map(Number)
    return a * 12 + m > anioHoy * 12 + mesHoy
  }
  const cuotaDe = clave => {
    if (clave && porClave.has(clave)) return porClave.get(clave)
    return esFuturo(clave) ? null : vigente
  }

  const actsPorCuota = new Map()
  for (const sa of actividades.value) {
    const c = cuotaDe(clavePeriodo(sa.mes_pago, sa.anio_pago, sa.quincena_pago, sa.fecha_limite_pago || sa.actividad?.fecha_limite_pago))
    if (!c) continue
    if (!actsPorCuota.has(c.id)) actsPorCuota.set(c.id, [])
    actsPorCuota.get(c.id).push(sa)
  }
  const prestPorCuota = new Map()
  for (const cp of cuotasPrestamo.value) {
    const c = cuotaDe(clavePeriodo(cp.mes, cp.anio, cp.quincena, cp.fecha_proyectada))
    if (!c) continue
    if (!prestPorCuota.has(c.id)) prestPorCuota.set(c.id, [])
    prestPorCuota.get(c.id).push(cp)
  }

  const conGmf = formaPago.value === 'transferencia' && cobrar4x1000.value
  return ordenadas
    .map(cuota => {
      const cuotaPend = Math.max(0, Math.round(aNumero(cuota.valor_cuota) - aNumero(cuota.valor_pagado)))
      const multa = sancionDe(cuota)
      const acts = actsPorCuota.get(cuota.id) || []
      // Cada cuota de préstamo lleva su mora a la fecha de este pago, calculada como en
      // Préstamos (capital pendiente × tasa/30 × días tras la gracia). Se cobra primero.
      const corte = parseDateLocal(fechaDe(cuota.id))
      const prest = (prestPorCuota.get(cuota.id) || []).map(cp => ({
        ...cp,
        mora: Math.round(calcularMoraCuota(cp, reglasMora.value.tasaMora, corte, reglasMora.value.diasGracia))
      }))
      const lineas = []
      if (cuotaPend > 0) lineas.push({ nombre: aNumero(cuota.valor_pagado) > 0 ? 'Cuota (lo que falta)' : 'Cuota', valor: cuotaPend, clase: 'text-texto-medio' })
      if (multa > 0) lineas.push({ nombre: 'Sanción', valor: multa, clase: 'text-red-700 oscuro:text-red-300' })
      acts.forEach(sa => lineas.push({ nombre: sa.actividad?.descripcion || 'Actividad', valor: Math.round(sa.valor_pendiente), clase: 'text-purple-800 oscuro:text-purple-300' }))
      prest.forEach(cp => {
        if (cp.mora > 0) lineas.push({ nombre: `Mora préstamo #${cp.numero_cuota}`, valor: cp.mora, clase: 'text-rose-700 oscuro:text-rose-300' })
        lineas.push({ nombre: `Cuota préstamo #${cp.numero_cuota}`, valor: Math.round(cp.valor_pendiente), clase: 'text-blue-800 oscuro:text-blue-300' })
      })
      const neto = lineas.reduce((s, l) => s + l.valor, 0)
      const gmf = conGmf ? calcular4x1000(neto) : 0
      if (gmf > 0) lineas.push({ nombre: '4×1000 (GMF)', valor: gmf, clase: 'text-sky-700 oscuro:text-sky-300' })
      return {
        cuota,
        periodo: textoPeriodo(cuota),
        estado: estadoDe(cuota, multa),
        vencida: String(cuota.fecha_limite || '').slice(0, 10) <= hoyIso,
        cuotaPend,
        multa,
        actividades: acts,
        prestamo: prest,
        neto,
        gmf,
        total: neto + gmf,
        lineas
      }
    })
    .filter(f => f.neto > 0)
})

// ---------------------------------------------------------------- Selección (en orden)

/*
 * Regla de la app: no se cobra un periodo mientras haya uno anterior sin pagar. Marcar una
 * cuota marca las anteriores; desmarcarla quita también las siguientes.
 */
function alternar(indice) {
  const id = filas.value[indice]?.cuota.id
  if (!id) return
  const nuevo = new Set()
  const marcar = !seleccion.value.has(id)
  filas.value.forEach((f, i) => {
    if (marcar ? i <= indice || seleccion.value.has(f.cuota.id) : i < indice && seleccion.value.has(f.cuota.id)) nuevo.add(f.cuota.id)
  })
  seleccion.value = nuevo
}

const indiceUltimaVencida = computed(() => {
  let ultimo = -1
  filas.value.forEach((f, i) => { if (f.vencida) ultimo = i })
  return ultimo
})
const vencidasMarcadas = computed(() =>
  indiceUltimaVencida.value >= 0 && filas.value.slice(0, indiceUltimaVencida.value + 1).every(f => seleccion.value.has(f.cuota.id))
)
function marcarVencidas() {
  if (vencidasMarcadas.value) {
    seleccion.value = new Set()
    return
  }
  seleccion.value = new Set(filas.value.slice(0, indiceUltimaVencida.value + 1).map(f => f.cuota.id))
}

// Si una cuota deja de tener saldo (cambió la fecha o se recargó), sale de la selección.
watch(filas, lista => {
  const ids = new Set(lista.map(f => f.cuota.id))
  if ([...seleccion.value].some(id => !ids.has(id))) seleccion.value = new Set([...seleccion.value].filter(id => ids.has(id)))
})

const filasElegidas = computed(() => filas.value.filter(f => seleccion.value.has(f.cuota.id)))
const totalElegido = computed(() => filasElegidas.value.reduce((s, f) => s + f.total, 0))
const resumenElegido = computed(() => {
  const n = filasElegidas.value.length
  const partes = [`${n} ${n === 1 ? 'cuota' : 'cuotas'}`]
  const multas = filasElegidas.value.filter(f => f.multa > 0).length
  const acts = filasElegidas.value.reduce((s, f) => s + f.actividades.length, 0)
  const prest = filasElegidas.value.reduce((s, f) => s + f.prestamo.length, 0)
  if (multas) partes.push(`${multas} con sanción`)
  if (acts) partes.push(`${acts} ${acts === 1 ? 'actividad' : 'actividades'}`)
  if (prest) partes.push(`${prest} de préstamo`)
  return partes.join(' · ')
})

// ---------------------------------------------------------------- Registrar

async function registrar() {
  if (guardando.value || filasElegidas.value.length === 0) return
  guardando.value = true
  progreso.value = 0
  const pagadas = []
  const historialIds = []
  const lote = [...filasElegidas.value]
  try {
    // En orden y de a una: cada pago cambia el saldo que ve el siguiente.
    for (const fila of lote) {
      progreso.value++
      const { ok, historialPagoId } = await registrarPagoCompletoDeCuota({
        pago: {
          cuota: fila.cuota,
          fecha: fechaDe(fila.cuota.id),
          multa: fila.multa,
          valorPagado: fila.neto,
          actividades: fila.actividades,
          prestamo: fila.prestamo
        },
        socio: socio.value,
        natilleraId: props.natilleraId,
        natilleraNombre: props.natilleraNombre || null,
        formaPago: formaPago.value,
        cobrar4x1000: cobrar4x1000.value
      })
      if (!ok) {
        notificationStore.error(
          `No se pudo registrar ${fila.periodo}.${pagadas.length ? ` Las ${pagadas.length} anteriores sí quedaron.` : ''}`,
          'Registrar pago',
          6000
        )
        break
      }
      pagadas.push(fila.cuota.id)
      if (historialPagoId) historialIds.push(historialPagoId)
    }
    // Un solo recálculo de estados y mora para todo el lote.
    await cuotasStore.fetchCuotasNatillera(props.natilleraId).catch(e => console.warn('Pago rápido: recarga de cuotas', e))
  } finally {
    guardando.value = false
  }
  if (pagadas.length > 0) {
    notificationStore.success(`${pagadas.length} ${pagadas.length === 1 ? 'pago registrado' : 'pagos registrados'}`, socio.value?.nombre || 'Pago', 3000)
    emit('pagado', { cuotaIds: pagadas, historialIds, socio: { ...socio.value, socioNatilleraId: props.socioNatilleraId } })
  }
}

// ---------------------------------------------------------------- Natiscroll

const areaScroll = ref(null)
const hayNatiscroll = ref(false)
let rafNatiscroll = null

function programarNatiscroll() {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = requestAnimationFrame(() => {
    rafNatiscroll = null
    const el = areaScroll.value
    hayNatiscroll.value = !!el && props.show &&
      el.scrollHeight > el.clientHeight + 1 &&
      el.scrollTop + el.clientHeight < el.scrollHeight - 1
  })
}

watch([() => filas.value.length, cargando, formaPago, cobrar4x1000], () => nextTick(programarNatiscroll), { flush: 'post' })

watch(() => [props.show, props.socioNatilleraId], ([abierto]) => {
  if (!abierto) {
    hayNatiscroll.value = false
    return
  }
  formaPago.value = 'efectivo'
  cobrar4x1000.value = false
  fechas.value = new Map()
  cargar()
}, { immediate: true })

onUnmounted(() => {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
})
</script>

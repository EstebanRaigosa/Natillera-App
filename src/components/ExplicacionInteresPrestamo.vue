<template>
  <!--
    Modal «¿Cómo se calcula el interés?» (crear y refinanciar préstamo).
    A propósito mínimo. Al crear: el mismo préstamo en simple y compuesto, cada uno con sus
    dos formas de cobro (normal / anticipado) en una tabla corta. Al refinanciar: los cuatro
    datos del préstamo nuevo y la cuenta en una frase.
    Se probó con comparaciones, gráficas y simulador y resultó demasiado; no volver a llenarlo.
    Patrón natillerapp-modals: ModalWrapper, cabecera marca compacta, pie fijo con safe-area +
    useTapadoInferior, useBodyScrollLock y natiscroll (con las dos tablas no cabe en un teléfono pequeño).
    Las cifras salen de utils/calculoPrestamos.js (las mismas funciones del plan real).
  -->
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- ── Cabecera marca (móvil = fila) ── -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <CalculatorIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-display text-base font-bold leading-tight text-white">¿Cómo se calcula el interés?</h3>
          <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ subtitulo }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>
    <!-- ── Cabecera marca (desktop = icono arriba + textos centrados, X por flex) ── -->
    <div class="hidden flex-shrink-0 bg-[#1B5E37] text-white sm:block">
      <div class="flex items-start px-3 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div class="w-11 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <CalculatorIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="mt-2 font-display text-lg font-bold leading-tight text-white">¿Cómo se calcula el interés?</h3>
          <p class="mt-1 text-xs text-white/90">{{ subtitulo }}</p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 touch-manipulation"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- ── Cuerpo + natiscroll ── -->
    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
    <div
      ref="scrollRef"
      class="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-white px-4 pt-4 pb-5 [-webkit-overflow-scrolling:touch]"
      @scroll.passive="onScroll"
    >
      <!-- Refinanciar: datos del préstamo nuevo + la cuenta -->
      <template v-if="refin">
        <dl class="grid grid-cols-2 gap-3">
          <div
            v-for="(dato, idx) in datos"
            :key="dato.etiqueta"
            class="explicacion-entra rounded-xl px-3 py-3"
            :class="dato.destacado ? 'bg-[#1B5E37] text-white' : 'bg-[#F6FBF7]'"
            :style="{ animationDelay: `${idx * 60}ms` }"
          >
            <dt class="text-xs" :class="dato.destacado ? 'text-white/85' : 'text-gray-500'">{{ dato.etiqueta }}</dt>
            <dd class="mt-1 font-display text-xl font-bold tabular-nums leading-tight" :class="dato.destacado ? 'text-white' : 'text-gray-900'">{{ dato.valor }}</dd>
            <p v-if="dato.nota" class="mt-0.5 text-[0.6875rem]" :class="dato.destacado ? 'text-white/85' : 'text-gray-500'">{{ dato.nota }}</p>
          </div>
        </dl>
        <p
          v-for="(frase, idx) in frases"
          :key="frase"
          class="explicacion-entra mt-4 text-base leading-relaxed text-gray-700"
          :style="{ animationDelay: `${240 + idx * 80}ms` }"
        >
          {{ frase }}
        </p>
      </template>

      <!-- Crear: el mismo préstamo en cada tipo, con sus dos formas de cobro -->
      <template v-else>
        <p class="explicacion-entra rounded-xl bg-[#F6FBF7] px-3 py-2.5 text-center text-sm text-gray-700">
          <span v-if="!usaFormulario" class="text-gray-500">Ejemplo: </span>
          <strong class="tabular-nums text-gray-900">{{ dinero(prestamo.capital) }}</strong>
          · <strong class="tabular-nums text-gray-900">{{ porcentaje(prestamo.tasa) }}</strong> mensual
          · <strong class="tabular-nums text-gray-900">{{ prestamo.cuotas }}</strong> {{ prestamo.cuotas === 1 ? 'cuota' : 'cuotas' }}{{ quincenal ? ' quincenales' : '' }}
        </p>

        <section
          v-for="(tipo, t) in variantes"
          :key="tipo.id"
          class="explicacion-entra mt-5"
          :style="{ animationDelay: `${120 + t * 120}ms` }"
        >
          <h4 class="font-display text-base font-bold text-gray-900">{{ tipo.nombre }}</h4>
          <p class="mt-0.5 text-sm leading-snug text-gray-600">{{ tipo.cuenta }}</p>

          <table class="mt-2 w-full table-fixed text-sm tabular-nums">
            <thead>
              <tr>
                <th class="w-[34%]" />
                <th
                  v-for="col in tipo.columnas"
                  :key="col.id"
                  class="rounded-t-lg px-2 pt-2 pb-1 text-right text-xs font-semibold"
                  :class="col.elegida ? 'bg-[#1B5E37] text-white' : 'text-gray-500'"
                >
                  {{ col.nombre }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, f) in filas" :key="fila.id" class="border-t border-gray-100">
                <th class="py-2 pr-2 text-left text-xs font-normal text-gray-500">{{ fila.etiqueta }}</th>
                <td
                  v-for="col in tipo.columnas"
                  :key="col.id"
                  class="px-2 py-2 text-right"
                  :class="[
                    col.elegida ? 'bg-[#E8F5E9] font-bold text-gray-900' : 'text-gray-800',
                    col.elegida && f === filas.length - 1 ? 'rounded-b-lg' : '',
                    fila.id === 'total' ? 'font-bold' : ''
                  ]"
                >
                  <span v-if="fila.id === 'ganancia'" class="text-xs">{{ col.ganancia }}</span>
                  <template v-else>{{ dinero(col[fila.id]) }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <p class="mt-4 text-xs leading-relaxed text-gray-500">
          En los dos casos el socio recibe {{ dinero(prestamo.capital) }} y paga lo mismo; solo cambia cuándo entra la ganancia a la natillera.
          <span class="whitespace-nowrap">En verde, lo que elegiste.</span>
        </p>
      </template>
    </div>
    <NatiscrollHint :show="hayMas" />
    </div>

    <!-- ── Pie fijo (la barra de Safari lo tapa: se suma `tapado` al padding) ── -->
    <div
      class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-3"
      :style="{ paddingBottom: `calc(max(1.1rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-primary w-full" @click="cerrar">Entendido</button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed } from 'vue'
import { CalculatorIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from './ModalWrapper.vue'
import NatiscrollHint from './NatiscrollHint.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { useTapadoInferior } from '../composables/useTapadoInferior'
import { useNatiscroll } from '../composables/useNatiscroll'
import { calcularCondicionesPrestamo, generarDesgloseCuotas, tasaPeriodica } from '../utils/calculoPrestamos'

const props = defineProps({
  show: { type: Boolean, default: false },
  capital: { type: [Number, String], default: 0 },
  tasaMensual: { type: [Number, String], default: 0 },
  numeroCuotas: { type: [Number, String], default: 0 },
  periodicidad: { type: String, default: 'mensual' },
  tipoInteres: { type: String, default: 'simple' },
  interesAnticipado: { type: Boolean, default: false },
  // Abierto desde refinanciar: muestra el préstamo nuevo con la vista previa
  refinanciacion: { type: Boolean, default: false },
  // Vista previa de la refinanciación (capitalPendiente, interesVencido, interesNuevo, totalAPagar, totalCuotas, valorCuota)
  refinanciacionDatos: { type: Object, default: null }
})
const emit = defineEmits(['close'])

const showRef = computed(() => props.show)
useBodyScrollLock(showRef)
const { scrollRef, hayMas, onScroll } = useNatiscroll(showRef)
const { tapado } = useTapadoInferior()

function cerrar() {
  emit('close')
}

const dinero = (valor) => `$${new Intl.NumberFormat('es-CO').format(Math.round(valor || 0))}`
const porcentaje = (valor) => `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(Number(valor) || 0)}%`

const compuesto = computed(() => props.tipoInteres === 'compuesto')
const quincenal = computed(() => props.periodicidad === 'quincenal')

// Datos del formulario; si faltan, un préstamo de ejemplo
const usaFormulario = computed(() => Number(props.capital) > 0 && Number(props.tasaMensual) > 0 && Number(props.numeroCuotas) >= 1)
const prestamo = computed(() => {
  const base = usaFormulario.value
    ? { capital: Math.round(Number(props.capital)), tasa: Number(props.tasaMensual), cuotas: Math.floor(Number(props.numeroCuotas)) }
    : { capital: 1000000, tasa: 2, cuotas: 12 }
  const entrada = {
    capital: base.capital,
    tasaMensual: base.tasa,
    numeroCuotas: base.cuotas,
    periodicidad: props.periodicidad,
    tipoInteres: props.tipoInteres
  }
  const { interesTotal, totalAPagar } = calcularCondicionesPrestamo(entrada)
  const plan = generarDesgloseCuotas({ ...entrada, interesTotal, interesAnticipado: props.interesAnticipado })
  return { ...base, interesTotal, totalAPagar, cuota: plan[0]?.valor_cuota || 0 }
})

const refin = computed(() => (props.refinanciacion ? props.refinanciacionDatos : null))

const subtitulo = computed(() => {
  const tipo = compuesto.value ? 'Interés compuesto' : 'Interés simple'
  if (refin.value) return `Refinanciación · ${tipo.toLowerCase()}`
  const cobro = props.interesAnticipado ? 'cobro anticipado' : 'cobro normal'
  return `${usaFormulario.value ? '' : 'Ejemplo · '}${tipo} · ${cobro}`
})

const textoCuotas = (n, valor) => `${n} ${n === 1 ? 'cuota' : 'cuotas'}${quincenal.value ? ' quincenales' : ''} de ${dinero(valor)}`

const datos = computed(() => {
  const r = refin.value
  if (r) {
    return [
      { etiqueta: 'Lo que falta del préstamo', valor: dinero(r.capitalPendiente) },
      { etiqueta: 'Interés', valor: porcentaje(props.tasaMensual), nota: 'mensual' },
      { etiqueta: 'Interés total', valor: dinero(r.interesNuevo + (r.interesVencido || 0)) },
      { etiqueta: 'Total a pagar', valor: dinero(r.totalAPagar), nota: textoCuotas(r.totalCuotas || 0, r.valorCuota), destacado: true }
    ]
  }
  const p = prestamo.value
  return [
    { etiqueta: 'Valor del préstamo', valor: dinero(p.capital) },
    { etiqueta: 'Interés', valor: porcentaje(p.tasa), nota: 'mensual' },
    { etiqueta: 'Interés total', valor: dinero(p.interesTotal) },
    { etiqueta: 'Total a pagar', valor: dinero(p.totalAPagar), nota: textoCuotas(p.cuotas, p.cuota), destacado: true }
  ]
})

// ── Crear: el préstamo en cada tipo con sus dos formas de cobro ──
const filas = [
  { id: 'interes', etiqueta: 'Interés total' },
  { id: 'total', etiqueta: 'Total a pagar' },
  { id: 'cuota', etiqueta: 'Cuota' },
  { id: 'ganancia', etiqueta: 'Ganancia natillera' }
]

function condicionesDe(tipoInteres, interesAnticipado) {
  const { capital, tasa, cuotas } = prestamo.value
  const entrada = { capital, tasaMensual: tasa, numeroCuotas: cuotas, periodicidad: props.periodicidad, tipoInteres }
  const { interesTotal, totalAPagar } = calcularCondicionesPrestamo(entrada)
  const plan = generarDesgloseCuotas({ ...entrada, interesTotal, interesAnticipado })
  return {
    // Mismos montos en normal y anticipado; solo cambia cuándo entra la utilidad
    ganancia: interesAnticipado ? 'Toda al inicio' : 'Con cada cuota',
    interes: interesTotal,
    total: totalAPagar,
    cuota: plan[0]?.valor_cuota || 0
  }
}

const variantes = computed(() => {
  const { capital, tasa, cuotas } = prestamo.value
  const tasaTexto = porcentaje(tasaPeriodica(tasa, props.periodicidad) * 100)
  const porPeriodo = quincenal.value ? 'por quincena' : 'mensual'
  const tipoElegido = compuesto.value ? 'compuesto' : 'simple'
  return ['simple', 'compuesto'].map((id) => {
    const normal = condicionesDe(id, false)
    return {
      id,
      nombre: id === 'simple' ? 'Interés simple' : 'Interés compuesto',
      cuenta: id === 'simple'
        ? `${dinero(capital)} × ${tasaTexto} ${porPeriodo} × ${cuotas} ${cuotas === 1 ? 'cuota' : 'cuotas'} = ${dinero(normal.interes)}.`
        : `El ${tasaTexto} ${porPeriodo} se cobra sobre lo que aún se debe, así que el interés baja cuota a cuota.`,
      columnas: [
        { id: 'normal', nombre: 'Normal', elegida: tipoElegido === id && !props.interesAnticipado, ...normal },
        { id: 'anticipado', nombre: 'Anticipado', elegida: tipoElegido === id && props.interesAnticipado, ...condicionesDe(id, true) }
      ]
    }
  })
})

// La cuenta en palabras: una frase, y otra solo si hay algo que el socio deba saber
const frases = computed(() => {
  const r = refin.value
  const base = r ? r.capitalPendiente : prestamo.value.capital
  const cuotas = r ? (r.totalCuotas || 0) : prestamo.value.cuotas
  const tasaTexto = porcentaje(tasaPeriodica(r ? props.tasaMensual : prestamo.value.tasa, props.periodicidad) * 100)
  const porPeriodo = quincenal.value ? 'por quincena' : 'mensual'
  const interes = r ? r.interesNuevo : prestamo.value.interesTotal

  const cuenta = compuesto.value
    ? `Cada cuota paga ${tasaTexto} ${porPeriodo} sobre lo que aún se debe; como la deuda baja, el interés también. En total: ${dinero(interes)}.`
    : `${dinero(base)} × ${tasaTexto} ${porPeriodo} × ${cuotas} ${cuotas === 1 ? 'cuota' : 'cuotas'} = ${dinero(interes)} de interés.`

  if (r) {
    const lista = [`El interés se calcula solo sobre lo que falta del préstamo. ${cuenta}`]
    if (r.interesVencido > 0) lista.push(`Incluye ${dinero(r.interesVencido)} de interés atrasado, sin intereses encima.`)
    return lista
  }
  return [cuenta]
})
</script>

<style scoped>
.explicacion-entra {
  -webkit-animation: explicacion-entra 260ms ease-out both;
  animation: explicacion-entra 260ms ease-out both;
}
@-webkit-keyframes explicacion-entra {
  from { opacity: 0; -webkit-transform: translate3d(0, 8px, 0); }
  to { opacity: 1; -webkit-transform: translate3d(0, 0, 0); }
}
@keyframes explicacion-entra {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .explicacion-entra {
    -webkit-animation: none;
    animation: none;
  }
}
</style>

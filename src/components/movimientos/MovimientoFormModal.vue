<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :persistent="guardando"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <ArrowsRightLeftIcon class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">
            {{ editando ? 'Editar movimiento' : 'Registrar movimiento' }}
          </h2>
          <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/80">
            Dinero que no viene de una cuota, un préstamo ni una actividad
          </p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 touch-manipulation hover:bg-white/10"
          aria-label="Cerrar"
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
            <ArrowsRightLeftIcon class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">
            {{ editando ? 'Editar movimiento' : 'Registrar movimiento' }}
          </h2>
          <p class="mt-1 text-xs leading-snug text-white/80">
            Dinero que no viene de una cuota, un préstamo ni una actividad
          </p>
        </div>
        <button
          type="button"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="scrollRef"
        class="flex-1 min-h-0 space-y-5 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <!-- Tipo: primero, porque de esto depende qué campos tienen sentido -->
        <div v-if="!editando">
          <span class="ds-label">¿Qué pasó con el dinero?</span>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opcion in OPCIONES_DIRECCION"
              :key="opcion.value"
              type="button"
              class="flex min-h-[4.5rem] touch-manipulation flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-colors"
              :class="direccion === opcion.value ? opcion.activo : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'"
              :aria-pressed="direccion === opcion.value"
              @click="cambiarDireccion(opcion.value)"
            >
              <component :is="opcion.icono" class="h-5 w-5" />
              <span>{{ opcion.label }}</span>
            </button>
          </div>
        </div>

        <p v-else class="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
          Estás editando {{ etiquetaDireccion }}. El tipo de movimiento no se puede cambiar: para
          convertirlo en otra cosa hay que eliminarlo y registrarlo de nuevo.
        </p>

        <!-- Monto -->
        <div>
          <label for="movimiento-monto" class="ds-label">Monto <span class="text-red-600">*</span></label>
          <div
            class="flex items-center rounded-xl border border-[color:var(--surface-divider-strong)] bg-white focus-within:border-[#1B5E37] focus-within:shadow-[0_0_0_3px_rgba(27,94,55,0.18)]"
            :class="{ 'border-red-300': errores.monto }"
          >
            <span class="flex-shrink-0 pl-4 font-semibold text-gray-400">$</span>
            <input
              id="movimiento-monto"
              :value="montoTexto"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="0"
              class="min-w-0 flex-1 border-none bg-transparent px-2 py-3 text-base font-semibold tabular-nums outline-none focus:ring-0"
              @input="alEscribirMonto($event.target.value)"
            />
          </div>
          <p v-if="errores.monto" class="mt-1.5 text-xs font-medium text-red-600">{{ errores.monto }}</p>
        </div>

        <!-- Forma de pago (ingreso / egreso) -->
        <div v-if="direccion !== 'traslado'">
          <span class="ds-label">¿En qué forma de pago?</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="forma in FORMAS"
              :key="forma.value"
              type="button"
              class="flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors"
              :class="formaPago === forma.value ? forma.activo : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'"
              :aria-pressed="formaPago === forma.value"
              @click="formaPago = forma.value"
            >
              <component :is="forma.icono" class="h-5 w-5" />
              <span>{{ forma.label }}</span>
            </button>
          </div>
        </div>

        <!-- Dirección del traslado -->
        <div v-else>
          <span class="ds-label">¿Desde dónde sale?</span>
          <div class="space-y-2">
            <button
              v-for="opcion in DIRECCIONES_TRASLADO"
              :key="opcion.value"
              type="button"
              class="flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors"
              :class="formaOrigen === opcion.value ? opcion.activo : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'"
              :aria-pressed="formaOrigen === opcion.value"
              @click="formaOrigen = opcion.value"
            >
              <span>{{ opcion.desde }}</span>
              <ArrowRightIcon class="h-4 w-4 flex-shrink-0" />
              <span>{{ opcion.hacia }}</span>
            </button>
          </div>
        </div>

        <!-- Bolsillo: la decisión con más impacto y la peor explicada hoy -->
        <div v-if="direccion !== 'traslado'">
          <span class="ds-label">
            {{ direccion === 'ingreso' ? '¿A quién pertenece este dinero?' : '¿De dónde sale el dinero?' }}
          </span>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="opcion in BOLSILLOS"
              :key="opcion.value"
              type="button"
              class="flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors"
              :class="bolsillo === opcion.value ? opcion.activo : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'"
              :aria-pressed="bolsillo === opcion.value"
              @click="bolsillo = opcion.value"
            >
              <component :is="opcion.icono" class="h-5 w-5" />
              <span>{{ opcion.label }}</span>
            </button>
          </div>
          <p class="mt-1.5 text-xs leading-relaxed text-gray-500">{{ explicacionBolsillo }}</p>
        </div>

        <!-- Fecha -->
        <div>
          <label for="movimiento-fecha" class="ds-label">¿Cuándo se movió el dinero?</label>
          <input
            id="movimiento-fecha"
            v-model="fecha"
            type="date"
            class="ds-input"
          />
          <p v-if="avisoCorte" class="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
            <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{{ avisoCorte }}</span>
          </p>
          <p v-else-if="fechaFutura" class="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
            <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>La fecha es futura. El saldo esperado lo contará desde ya, aunque el dinero no se haya movido.</span>
          </p>
        </div>

        <!-- Descripción -->
        <div>
          <label for="movimiento-descripcion" class="ds-label">
            Descripción <span class="font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            id="movimiento-descripcion"
            v-model="descripcion"
            rows="2"
            class="ds-input resize-none"
            :placeholder="placeholderDescripcion"
          />
        </div>

        <!-- RF-09: el efecto, antes de guardar -->
        <div class="rounded-xl border px-4 py-3" :class="efecto.clase">
          <p class="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide">
            <ScaleIcon class="h-4 w-4 flex-shrink-0" />
            Cómo queda la caja
          </p>
          <p class="mt-1.5 text-sm leading-relaxed">{{ efecto.texto }}</p>
          <p v-if="efecto.nota" class="mt-1.5 text-xs leading-relaxed opacity-80">{{ efecto.nota }}</p>
        </div>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex flex-shrink-0 gap-3 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary flex-1" :disabled="guardando" @click="cerrar">
        Cancelar
      </button>
      <button type="button" class="btn-modal-primary flex-1" :disabled="guardando" @click="confirmar">
        {{ guardando ? 'Guardando…' : (editando ? 'Guardar cambios' : 'Registrar') }}
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  ArrowsRightLeftIcon,
  ArrowRightIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { formatDate, getCurrentDateISO } from '../../utils/formatDate'
import { formatMoney, parsearMonto, formatearMontoInput } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** Grupo a editar, o null para registrar uno nuevo. */
  grupo: { type: Object, default: null },
  /** Saldo esperado actual por forma de pago, para poder contar el efecto (RF-09). */
  saldos: { type: Object, default: () => ({ efectivo: 0, transferencia: 0 }) },
  /** Fecha del último corte sellado, para avisar de que se edita el pasado (RF-13). */
  fechaUltimoCorte: { type: String, default: '' },
  guardando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'guardar'])

const OPCIONES_DIRECCION = [
  { value: 'ingreso', label: 'Entró', icono: ArrowDownCircleIcon, activo: 'border-lime-500 bg-lime-50 text-lime-800' },
  { value: 'egreso', label: 'Salió', icono: ArrowUpCircleIcon, activo: 'border-rose-500 bg-rose-50 text-rose-800' },
  { value: 'traslado', label: 'Se movió', icono: ArrowsRightLeftIcon, activo: 'border-indigo-500 bg-indigo-50 text-indigo-800' }
]

const FORMAS = [
  { value: 'efectivo', label: 'Efectivo', icono: BanknotesIcon, activo: 'border-green-500 bg-green-50 text-green-800' },
  { value: 'transferencia', label: 'Transferencia', icono: BuildingLibraryIcon, activo: 'border-blue-500 bg-blue-50 text-blue-800' }
]

const DIRECCIONES_TRASLADO = [
  { value: 'efectivo', desde: 'Efectivo', hacia: 'Cuenta', activo: 'border-green-500 bg-green-50 text-green-800' },
  { value: 'transferencia', desde: 'Cuenta', hacia: 'Efectivo', activo: 'border-blue-500 bg-blue-50 text-blue-800' }
]

const BOLSILLOS = [
  { value: 'recaudado', label: 'Recaudado', icono: BanknotesIcon, activo: 'border-green-500 bg-green-50 text-green-800' },
  { value: 'utilidades', label: 'Utilidades', icono: ChartBarIcon, activo: 'border-amber-500 bg-amber-50 text-amber-800' }
]

const direccion = ref('egreso')
const montoTexto = ref('')
const formaPago = ref('efectivo')
const formaOrigen = ref('efectivo')
const bolsillo = ref('recaudado')
const fecha = ref(getCurrentDateISO())
const descripcion = ref('')
const errores = ref({})

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

const editando = computed(() => !!props.grupo)
const monto = computed(() => parsearMonto(montoTexto.value))

const etiquetaDireccion = computed(() => {
  if (direccion.value === 'ingreso') return 'un ingreso'
  if (direccion.value === 'egreso') return 'un egreso'
  return 'un traslado'
})

const placeholderDescripcion = computed(() => {
  if (direccion.value === 'ingreso') return 'Ej: donación de la junta'
  if (direccion.value === 'egreso') return 'Ej: papelería para la reunión'
  return 'Ej: consignación semanal'
})

const explicacionBolsillo = computed(() => {
  if (bolsillo.value === 'utilidades') {
    return direccion.value === 'ingreso'
      ? 'Entra como utilidad: al cerrar la natillera se reparte entre los socios.'
      : 'Sale de las utilidades: al cerrar la natillera habrá menos que repartir.'
  }
  return direccion.value === 'ingreso'
    ? 'Entra al recaudo: es dinero del fondo, no utilidad a repartir.'
    : 'Sale del recaudo: no cambia lo que se reparte al cerrar, solo el fondo.'
})

const fechaFutura = computed(() => !!fecha.value && fecha.value > getCurrentDateISO())

const avisoCorte = computed(() => {
  if (!props.fechaUltimoCorte || !fecha.value) return ''
  if (fecha.value > props.fechaUltimoCorte) return ''
  return `Esta fecha es anterior al corte sellado del ${formatDate(props.fechaUltimoCorte)}. Ese corte congeló su saldo, así que quedará desactualizado y no se recalcula solo.`
})

/**
 * RF-09: decir cómo queda el saldo antes de confirmar, que es lo único que el usuario
 * quiere comprobar. Un egreso que deja la forma de pago en negativo se avisa pero no se
 * bloquea: es la pregunta 6 del levantamiento y bloquearlo impediría registrar la
 * realidad cuando el descuadre ya ocurrió.
 */
const efecto = computed(() => {
  const importe = monto.value
  const saldoEfectivo = Number(props.saldos.efectivo) || 0
  const saldoTransferencia = Number(props.saldos.transferencia) || 0

  if (importe <= 0) {
    return {
      clase: 'border-gray-200 bg-gray-50 text-gray-500',
      texto: 'Escribe un monto para ver cómo queda el saldo.',
      nota: ''
    }
  }

  if (direccion.value === 'traslado') {
    const origenEsEfectivo = formaOrigen.value === 'efectivo'
    const saldoOrigen = origenEsEfectivo ? saldoEfectivo : saldoTransferencia
    const saldoDestino = origenEsEfectivo ? saldoTransferencia : saldoEfectivo
    const nombreOrigen = origenEsEfectivo ? 'El efectivo' : 'La cuenta'
    const nombreDestino = origenEsEfectivo ? 'la cuenta' : 'el efectivo'
    return {
      clase: 'border-indigo-200 bg-indigo-50 text-indigo-900',
      texto: `${nombreOrigen} pasará de $${formatMoney(saldoOrigen)} a $${formatMoney(saldoOrigen - importe)}, y ${nombreDestino} de $${formatMoney(saldoDestino)} a $${formatMoney(saldoDestino + importe)}.`,
      nota: 'El total no cambia: el dinero solo cambia de sitio.'
    }
  }

  const esIngreso = direccion.value === 'ingreso'
  const usaEfectivo = formaPago.value === 'efectivo'
  const saldoActual = usaEfectivo ? saldoEfectivo : saldoTransferencia
  const saldoNuevo = esIngreso ? saldoActual + importe : saldoActual - importe
  const nombre = usaEfectivo ? 'El efectivo' : 'La cuenta'

  return {
    clase: esIngreso ? 'border-lime-200 bg-lime-50 text-lime-900' : 'border-rose-200 bg-rose-50 text-rose-900',
    texto: `${nombre} pasará de $${formatMoney(saldoActual)} a $${formatMoney(saldoNuevo)}.`,
    nota: saldoNuevo < 0 ? 'Ojo: el saldo queda en negativo. Se puede registrar, pero conviene revisar si falta algún ingreso.' : ''
  }
})

const cambiarDireccion = (valor) => {
  direccion.value = valor
  errores.value = {}
}

const alEscribirMonto = (valor) => {
  montoTexto.value = formatearMontoInput(valor)
  if (errores.value.monto) errores.value = {}
}

watch(visible, (abierto) => {
  if (!abierto) return
  errores.value = {}
  const grupo = props.grupo
  if (!grupo) {
    direccion.value = 'egreso'
    montoTexto.value = ''
    formaPago.value = 'efectivo'
    formaOrigen.value = 'efectivo'
    bolsillo.value = 'recaudado'
    fecha.value = getCurrentDateISO()
    descripcion.value = ''
    return
  }
  direccion.value = grupo.esTraslado ? 'traslado' : grupo.direccion
  montoTexto.value = formatearMontoInput(String(grupo.monto || ''))
  formaPago.value = grupo.formaPago || 'efectivo'
  formaOrigen.value = grupo.formaOrigen || 'efectivo'
  bolsillo.value = grupo.direccion === 'ingreso'
    ? (grupo.destinoIngreso || 'recaudado')
    : (grupo.origenEgreso || 'recaudado')
  fecha.value = grupo.fecha || getCurrentDateISO()
  descripcion.value = grupo.descripcion || ''
})

const cerrar = () => {
  if (props.guardando) return
  emit('close')
}

const confirmar = () => {
  if (monto.value <= 0) {
    errores.value = { monto: 'Escribe cuánto dinero se movió' }
    return
  }
  if (!fecha.value) {
    errores.value = { fecha: 'Elige la fecha del movimiento' }
    return
  }
  errores.value = {}
  emit('guardar', {
    direccion: direccion.value,
    monto: monto.value,
    formaPago: formaPago.value,
    formaOrigen: formaOrigen.value,
    bolsillo: bolsillo.value,
    fecha: fecha.value,
    descripcion: descripcion.value.trim()
  })
}
</script>

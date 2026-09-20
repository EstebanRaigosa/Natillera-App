<template>
  <ModalWrapper
    :show="show"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="emit('close')"
  >
    <!-- Cabecera móvil: una sola fila (icono + textos + X) -->
    <div class="flex-shrink-0 bg-[#1B5E37] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:hidden">
      <div class="flex min-h-[4.2rem] items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <component :is="iconoCabecera" class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-base font-bold leading-tight text-white">Detalle del movimiento</h2>
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
            <component :is="iconoCabecera" class="h-6 w-6 text-white" />
          </div>
          <h2 class="font-display text-lg font-bold leading-tight text-white">Detalle del movimiento</h2>
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

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        v-if="grupo"
        ref="scrollRef"
        class="flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-5 pb-4 pt-5 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <!-- El importe primero: es lo que se venía a mirar -->
        <div class="rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3.5 text-center">
          <span class="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold" :class="claseConcepto(grupo.concepto)">
            {{ etiquetaConcepto(grupo.concepto) }}
          </span>
          <p class="mt-2 font-display text-2xl font-extrabold tabular-nums" :class="claseImporte">
            {{ textoImporte }}
          </p>
          <p
            v-if="grupo.esTraslado"
            class="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600"
          >
            {{ etiquetaForma(grupo.formaOrigen) }}
            <ArrowRightIcon class="h-3.5 w-3.5 text-gray-400" />
            {{ etiquetaForma(grupo.formaDestino) }}
          </p>
          <p v-else class="mt-1 text-xs text-gray-500">{{ etiquetaForma(grupo.formaPago) }}</p>
        </div>

        <div>
          <p class="mb-1 font-display text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">
            Descripción
          </p>
          <p v-if="grupo.descripcion" class="whitespace-pre-line break-words text-sm leading-relaxed text-gray-800">
            {{ grupo.descripcion }}
          </p>
          <p v-else class="text-sm italic text-gray-400">Se registró sin descripción</p>
        </div>

        <div>
          <p class="mb-1.5 font-display text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">
            Ficha
          </p>
          <dl class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            <div v-for="dato in ficha" :key="dato.etiqueta" class="flex items-start justify-between gap-3 px-3 py-2">
              <dt class="flex-shrink-0 text-xs text-gray-500">{{ dato.etiqueta }}</dt>
              <dd class="min-w-0 text-right text-xs font-semibold text-gray-800">
                <span class="break-words">{{ dato.valor }}</span>
                <span v-if="dato.nota" class="mt-0.5 block font-normal text-gray-500">{{ dato.nota }}</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Qué le hizo este movimiento a cada bolsillo, con su signo -->
        <div>
          <p class="mb-1.5 font-display text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">
            Movimiento en cada bolsillo
          </p>
          <div class="space-y-1.5">
            <div
              v-for="linea in efectoBolsillos"
              :key="linea.clave"
              class="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2"
            >
              <div class="flex min-w-0 items-center gap-2">
                <component :is="linea.icono" class="h-4 w-4 flex-shrink-0" :class="linea.acento" />
                <span class="truncate text-xs font-semibold text-gray-700">{{ linea.titulo }}</span>
              </div>
              <span class="font-display text-sm font-bold tabular-nums" :class="linea.clase">{{ linea.texto }}</span>
            </div>
          </div>
          <p v-if="grupo.esTraslado" class="mt-1.5 text-[0.6875rem] leading-snug text-gray-500">
            Al total de la natillera no le pasó nada: el mismo dinero cambió de sitio.
          </p>
        </div>

        <!-- Avisos: cada uno explica una consecuencia, no solo un estado -->
        <div
          v-if="!grupo.esManual"
          class="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-gray-600"
        >
          <LockClosedIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>
            Lo generó {{ moduloOrigen || 'otro módulo' }} al cerrar su propio proceso, así que desde aquí no se
            puede editar ni borrar: habría que deshacerlo donde nació.
            <router-link
              v-if="rutaOrigen"
              :to="rutaOrigen"
              class="mt-1.5 inline-flex min-h-[44px] touch-manipulation items-center gap-1 font-semibold text-[#1B5E37] hover:underline"
              @click="emit('close')"
            >
              Ir a {{ moduloOrigen }}
              <ArrowRightIcon class="h-3 w-3" />
            </router-link>
          </span>
        </div>

        <div
          v-if="grupo.parAmbiguo"
          class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900"
        >
          <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            Este traslado se armó juntando dos apuntes por fecha y monto, y ese día había más de una
            combinación posible. Puede que las dos mitades emparejadas no sean las que van juntas.
          </span>
        </div>

        <div
          v-if="dentroDeCorteSellado"
          class="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-900"
        >
          <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            Cae en un periodo ya cerrado: el último corte sellado es del {{ formatDate(fechaUltimoCorte) }}. Si lo
            cambias o lo borras, ese corte deja de cuadrar con lo que hay registrado.
          </span>
        </div>

        <!-- Los apuntes reales de la tabla. Plegado porque solo hace falta al depurar
             un descuadre, pero es justo lo que explica que un traslado sean dos filas. -->
        <div class="overflow-hidden rounded-xl border border-gray-200">
          <button
            type="button"
            class="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 bg-gray-50 px-3 text-xs font-semibold text-gray-600"
            :aria-expanded="apuntesAbiertos"
            aria-controls="apuntes-movimiento"
            @click="apuntesAbiertos = !apuntesAbiertos"
          >
            <span>{{ grupo.filas.length === 1 ? 'Apunte registrado' : `${grupo.filas.length} apuntes registrados` }}</span>
            <ChevronDownIcon
              class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': apuntesAbiertos }"
            />
          </button>
          <div v-if="apuntesAbiertos" id="apuntes-movimiento" class="divide-y divide-gray-100 border-t border-gray-200">
            <div v-for="fila in grupo.filas" :key="fila.id" class="px-3 py-2.5">
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs font-semibold text-gray-700">
                  {{ fila.tipo === 'entrada' ? 'Entrada' : 'Salida' }} · {{ etiquetaForma(fila.forma_pago) }}
                </span>
                <span class="font-display text-xs font-bold tabular-nums text-gray-800">
                  ${{ formatMoney(Math.abs(Number(fila.monto) || 0)) }}
                </span>
              </div>
              <p class="mt-1 break-all font-mono text-[0.625rem] leading-snug text-gray-400">{{ fila.id }}</p>
            </div>
          </div>
        </div>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <div
      class="flex-shrink-0 space-y-2.5 border-t border-gray-200 bg-white px-5 pt-4 sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <div class="flex gap-3">
        <button type="button" class="btn-modal-secondary flex-1" @click="emit('close')">Cerrar</button>
        <button v-if="sePuedeTocar" type="button" class="btn-modal-primary flex-1" @click="emit('editar')">
          <PencilSquareIcon class="h-4 w-4" />
          Editar
        </button>
      </div>
      <!-- Destructivo: rojo, no verde marca (skill natillerapp-modals) -->
      <button
        v-if="sePuedeTocar"
        type="button"
        class="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-full border border-red-200 bg-white text-sm font-semibold text-red-700 hover:bg-red-50"
        @click="emit('eliminar')"
      >
        <TrashIcon class="h-4 w-4" />
        Eliminar movimiento
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  ArrowDownCircleIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  ArrowUpCircleIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import {
  claseConcepto,
  conceptoDefinicion,
  etiquetaConcepto,
  etiquetaForma,
  pantallaDeRegistro
} from '../../composables/useMovimientosFondo'
import { formatDate } from '../../utils/formatDate'
import { formatMoney, formatMoneyConSigno } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** Grupo tal como lo entrega `useMovimientosFondo`, con sus filas crudas dentro. */
  grupo: { type: Object, default: null },
  /** Si el usuario puede editar o borrar movimientos manuales. */
  puedeEscribir: { type: Boolean, default: false },
  /** Fecha del último corte sellado, para avisar de que se toca un periodo cerrado. */
  fechaUltimoCorte: { type: String, default: '' },
  /** Ruta del módulo que generó el movimiento, si es automático. */
  rutaOrigen: { type: String, default: '' }
})

const emit = defineEmits(['close', 'editar', 'eliminar'])

const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
// El pie va anclado abajo: en iOS la barra de Safari lo tapa y `env()` no la describe.
const { tapado } = useTapadoInferior()

const apuntesAbiertos = ref(false)
// Cada movimiento se abre con los apuntes plegados: si no, el estado del anterior se cuela.
watch(visible, abierto => {
  if (!abierto) apuntesAbiertos.value = false
})

const sePuedeTocar = computed(() => props.puedeEscribir && !!props.grupo?.esManual)

const moduloOrigen = computed(() => conceptoDefinicion(props.grupo?.concepto)?.modulo || '')

const iconoCabecera = computed(() => {
  if (!props.grupo) return ArrowsRightLeftIcon
  if (props.grupo.esTraslado) return ArrowsRightLeftIcon
  return props.grupo.signo > 0 ? ArrowDownCircleIcon : ArrowUpCircleIcon
})

const claseImporte = computed(() => {
  if (!props.grupo) return 'text-gray-900'
  if (props.grupo.esTraslado) return 'text-indigo-700'
  return props.grupo.signo > 0 ? 'text-lime-700' : 'text-rose-700'
})

// El traslado va sin signo: no cambia el total, solo de sitio.
const textoImporte = computed(() => {
  if (!props.grupo) return ''
  const { esTraslado, signo, monto } = props.grupo
  return esTraslado ? `$${formatMoney(monto)}` : `$${formatMoneyConSigno(signo * monto)}`
})

const subtitulo = computed(() => {
  if (!props.grupo) return ''
  return `${etiquetaConcepto(props.grupo.concepto)} · ${formatDate(props.grupo.fecha)}`
})

/**
 * `created_at` y `updated_at` son `timestamptz`: hay que leerlos como instante, no como
 * día. `formatDateWithTime` de utils no sirve aquí porque pasa por `parseDateLocal`, que
 * recorta la cadena en la 'T' y fija las 12:00, así que perdería la hora real y podría
 * mover un día los registros de la noche (Colombia es UTC-5).
 */
const instanteLocal = (valor) => {
  if (!valor) return ''
  const d = new Date(valor)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const etiquetaBolsillo = computed(() => {
  if (!props.grupo) return ''
  const valor = props.grupo.direccion === 'ingreso' ? props.grupo.destinoIngreso : props.grupo.origenEgreso
  if (!valor) return ''
  return valor === 'utilidades' ? 'Utilidades' : 'Recaudado'
})

/**
 * De dónde salió el movimiento. Para los automáticos es el módulo que lo creó, que se sabe
 * por el concepto. Para los manuales se deduce del apunte de auditoría y puede no saberse:
 * en ese caso se dice, no se rellena con una suposición.
 */
const registradoDesde = computed(() => {
  const g = props.grupo
  if (!g) return { valor: '', nota: '' }

  if (!g.esManual) {
    return {
      valor: moduloOrigen.value || 'Otro módulo',
      nota: 'Lo creó ese módulo al cerrar su proceso'
    }
  }

  const pantalla = pantallaDeRegistro(g.rastro?.apunte)
  if (pantalla === 'Movimientos') return { valor: 'Movimientos', nota: 'A mano, en esta pantalla' }
  if (pantalla === 'Totales') return { valor: 'Totales', nota: 'A mano, en la vista de totales' }
  return { valor: 'A mano', nota: 'La pantalla no quedó registrada' }
})

const ficha = computed(() => {
  const g = props.grupo
  if (!g) return []

  const filas = [{ etiqueta: 'Fecha del movimiento', valor: formatDate(g.fecha) }]

  if (g.esTraslado) {
    filas.push({ etiqueta: 'Salió de', valor: etiquetaForma(g.formaOrigen) })
    filas.push({ etiqueta: 'Entró a', valor: etiquetaForma(g.formaDestino) })
  } else {
    filas.push({ etiqueta: 'Forma de pago', valor: etiquetaForma(g.formaPago) })
  }

  if (etiquetaBolsillo.value) {
    filas.push({
      etiqueta: g.direccion === 'ingreso' ? 'Entró a la bolsa de' : 'Salió de la bolsa de',
      valor: etiquetaBolsillo.value,
      nota: etiquetaBolsillo.value === 'Utilidades' ? 'No es dinero de las cuotas' : 'Dinero de las cuotas'
    })
  }

  if (g.socio) filas.push({ etiqueta: 'Socio', valor: g.socio })

  filas.push({ etiqueta: 'Registrado desde', valor: registradoDesde.value.valor, nota: registradoDesde.value.nota })

  filas.push(
    g.autor
      ? { etiqueta: 'Lo registró', valor: g.autor }
      : {
          etiqueta: 'Lo registró',
          valor: 'Sin rastro',
          nota: g.esManual ? 'Se creó antes de que se auditara esta tabla' : 'Lo creó el sistema'
        }
  )

  const primeraFila = g.filas?.[0]
  const creado = instanteLocal(primeraFila?.created_at)
  if (creado) filas.push({ etiqueta: 'Quedó registrado', valor: creado })

  const editado = instanteLocal(primeraFila?.updated_at)
  if (editado && editado !== creado) filas.push({ etiqueta: 'Última edición', valor: editado })

  return filas
})

const FORMAS = {
  efectivo: { titulo: 'Efectivo', icono: BanknotesIcon, acento: 'text-green-700' },
  transferencia: { titulo: 'Cuenta', icono: BuildingLibraryIcon, acento: 'text-blue-700' }
}

const claseSigno = (valor) => {
  if (valor > 0) return 'text-lime-700'
  if (valor < 0) return 'text-rose-700'
  return 'text-gray-900'
}

/** Solo las formas que este movimiento tocó: listar la otra en cero sería ruido. */
const efectoBolsillos = computed(() => {
  const g = props.grupo
  if (!g) return []

  const efectos = g.esTraslado
    ? [
        { clave: g.formaOrigen, valor: -g.monto },
        { clave: g.formaDestino, valor: g.monto }
      ]
    : [{ clave: g.formaPago, valor: g.signo * g.monto }]

  return efectos.map(efecto => ({
    ...FORMAS[efecto.clave],
    clave: efecto.clave,
    texto: `$${formatMoneyConSigno(efecto.valor)}`,
    clase: claseSigno(efecto.valor)
  }))
})

const dentroDeCorteSellado = computed(
  () => !!props.fechaUltimoCorte && !!props.grupo?.fecha && props.grupo.fecha <= props.fechaUltimoCorte
)
</script>

<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <ArrowsRightLeftIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <!-- Igual que en conciliación: el título largo se parte en dos en móvil. -->
            <h1 class="ds-page-header__title truncate">
              <span class="sm:hidden">Movimientos</span>
              <span class="hidden sm:inline">Movimientos del fondo</span>
            </h1>
            <p class="ds-page-header__sub hidden sm:block">
              Dinero que entra o sale sin venir de una cuota, un préstamo ni una actividad
            </p>
          </div>
          <button
            v-if="puedeEscribir"
            type="button"
            class="ds-btn ds-btn--primary sm:hidden"
            aria-label="Registrar movimiento"
            @click="abrirNuevo"
          >
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button type="button" class="ds-btn ds-btn--secondary" :disabled="cargando" @click="recargarTodo">
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
          <button v-if="puedeEscribir" type="button" class="ds-btn ds-btn--primary" @click="abrirNuevo">
            <PlusIcon class="w-4 h-4" />
            <span>Registrar</span>
          </button>
        </div>
      </div>
    </header>

    <LoadingScreen :visible="cargando" text="Cargando los movimientos del fondo" />

    <template v-if="!cargando">
      <div
        v-if="errorCarga"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      >
        {{ errorCarga }}
        <button type="button" class="ml-2 font-semibold underline" @click="recargarTodo">Reintentar</button>
      </div>

      <template v-else>
        <!--
          Cómo quedó cada forma de pago con los movimientos a la vista. Aquí el traslado sí
          cuenta, y va en línea propia —no revuelto con «Salió»— para que un efectivo en
          negativo se lea «lo consigné» y no «lo perdí».
        -->
        <section v-if="visibles.length > 0" class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/70">
          <div class="px-4 py-3">
            <p class="mb-2 font-display text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">
              Movimiento en cada bolsillo
            </p>
            <div class="grid gap-2 sm:grid-cols-2">
              <div
                v-for="forma in efectoPorForma"
                :key="forma.clave"
                class="rounded-xl border border-gray-200 bg-white px-3 py-2.5"
              >
                <div class="flex items-center gap-2">
                  <component :is="forma.icono" class="h-4 w-4 flex-shrink-0" :class="forma.acento" />
                  <span class="font-display text-sm font-bold text-gray-800">{{ forma.titulo }}</span>
                </div>
                <dl class="mt-1.5 space-y-1 text-xs">
                  <div
                    v-for="linea in forma.lineas"
                    :key="linea.etiqueta"
                    class="flex items-baseline justify-between gap-3"
                  >
                    <dt class="text-gray-500">{{ linea.etiqueta }}</dt>
                    <dd class="font-semibold tabular-nums" :class="linea.clase">{{ linea.texto }}</dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3 border-t border-gray-100 pt-1.5">
                    <dt class="font-semibold text-gray-700">Cambio neto</dt>
                    <dd class="font-display text-sm font-extrabold tabular-nums" :class="forma.claseEfecto">
                      {{ forma.textoEfecto }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <!-- Solo lectura: se dice antes, no al intentar guardar -->
        <div
          v-if="!puedeEscribir"
          class="flex items-start gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
        >
          <LockClosedIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>Puedes consultar los movimientos, pero no registrarlos ni editarlos.</span>
        </div>

        <!-- D-02: el traslado se reconoce adivinando, y aquí había más de un candidato -->
        <div
          v-if="trasladosAmbiguos.length > 0"
          class="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            <strong class="font-semibold">
              {{ trasladosAmbiguos.length }}
              {{ trasladosAmbiguos.length === 1 ? 'traslado tiene' : 'traslados tienen' }}
              emparejado dudoso.
            </strong>
            Hay varios apuntes del mismo importe y fecha en sentidos opuestos, así que la pareja se
            eligió por criterio fijo y puede no ser la real. Se resuelve con la columna
            <code class="rounded bg-amber-100 px-1">grupo_traslado_id</code> del levantamiento.
          </span>
        </div>

        <!--
          Filtros. En móvil cada grupo ocupa su propia fila y nada se aprieta en horizontal:
          los `select` van a dos columnas y los atajos de fecha en rejilla, sin scroll lateral.
          El rango a mano se despliega solo si se pide, que es lo que más ancho consume.
        -->
        <section class="ds-card space-y-3">
          <div
            class="flex items-center rounded-xl border border-[color:var(--surface-divider-strong)] bg-white focus-within:border-[#1B5E37] focus-within:shadow-[0_0_0_3px_rgba(27,94,55,0.18)]"
          >
            <span class="flex-shrink-0 pl-3 text-gray-400" aria-hidden="true">
              <MagnifyingGlassIcon class="h-5 w-5" />
            </span>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar en la descripción…"
              aria-label="Buscar movimientos"
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

          <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <select
              v-model="filtroConcepto"
              aria-label="Filtrar por concepto"
              class="ds-input min-w-0 sm:w-auto sm:min-w-[10rem] sm:flex-none"
            >
              <option value="">Todo concepto</option>
              <option v-for="c in CONCEPTOS_MOVIMIENTO" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>

            <select
              v-model="filtroForma"
              aria-label="Filtrar por forma de pago"
              class="ds-input min-w-0 sm:w-auto sm:min-w-[10rem] sm:flex-none"
            >
              <option value="">Toda forma</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              v-for="preset in PRESETS_FECHA"
              :key="preset.value"
              type="button"
              class="min-h-[44px] touch-manipulation truncate rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4"
              :class="presetActivo === preset.value
                ? 'border-[#1B5E37] bg-[#1B5E37] text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
              @click="aplicarPreset(preset.value)"
            >
              {{ preset.label }}
            </button>

            <button
              type="button"
              class="col-span-2 flex min-h-[44px] touch-manipulation items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:col-span-1 sm:px-4"
              :class="rangoAbierto || !presetActivo
                ? 'border-[#1B5E37] bg-[#1B5E37] text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
              :aria-expanded="rangoAbierto"
              @click="rangoAbierto = !rangoAbierto"
            >
              <CalendarDaysIcon class="h-4 w-4 flex-shrink-0" />
              <span class="truncate">{{ etiquetaRango }}</span>
            </button>
          </div>

          <div v-if="rangoAbierto" class="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div>
              <label class="ds-label text-xs" for="filtro-desde">Desde</label>
              <input id="filtro-desde" v-model="desde" type="date" class="ds-input" @change="presetActivo = ''" />
            </div>
            <span class="hidden pt-5 text-xs text-gray-400 sm:block" aria-hidden="true">→</span>
            <div>
              <label class="ds-label text-xs" for="filtro-hasta">Hasta</label>
              <input id="filtro-hasta" v-model="hasta" type="date" class="ds-input" @change="presetActivo = ''" />
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <p class="text-xs text-gray-500">
              {{ visibles.length }} de {{ grupos.length }}
              {{ grupos.length === 1 ? 'movimiento' : 'movimientos' }}
            </p>
            <button
              v-if="hayFiltros"
              type="button"
              class="min-h-[44px] flex-shrink-0 touch-manipulation rounded-full px-3 text-xs font-semibold text-[#1B5E37] hover:bg-[#1B5E37]/8"
              @click="limpiarFiltros"
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        <!-- Nunca se ha registrado nada -->
        <section v-if="grupos.length === 0" class="ds-empty-state">
          <div class="ds-empty-state__header">
            <div class="ds-empty-state__icon-wrap">
              <ArrowsRightLeftIcon class="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <h2 class="ds-empty-state__title">Todavía no hay movimientos</h2>
            <p class="ds-empty-state__subtitle">
              Aquí va el dinero que entra o sale del fondo sin venir de una cuota, un préstamo ni una
              actividad: el arriendo del salón, una donación, o el traslado del efectivo al banco.
            </p>
          </div>
          <div v-if="puedeEscribir" class="ds-empty-state__body">
            <button type="button" class="ds-btn ds-btn--primary ds-btn--block" @click="abrirNuevo">
              <PlusIcon class="h-4 w-4" />
              <span>Registrar el primero</span>
            </button>
          </div>
        </section>

        <!-- Hay movimientos, pero los filtros no dejan ver ninguno -->
        <section
          v-else-if="visibles.length === 0"
          class="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center"
        >
          <FunnelIcon class="mx-auto h-8 w-8 text-gray-300" />
          <p class="mt-3 font-display text-base font-bold text-gray-800">Ningún movimiento con estos filtros</p>
          <p class="mt-1 text-sm text-gray-500">Hay {{ grupos.length }} movimientos registrados, pero ninguno encaja.</p>
          <button type="button" class="ds-btn ds-btn--secondary mt-4" @click="limpiarFiltros">Limpiar filtros</button>
        </section>

        <!-- Lista -->
        <section v-else class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <ul class="divide-y divide-gray-100">
            <li v-for="grupo in visibles" :key="grupo.clave" class="flex items-start gap-1 px-2 sm:px-3">
              <!--
                La fila entera abre el detalle. Editar y borrar quedan FUERA del botón: no se
                pueden anidar controles. El enlace «Generado desde…» se movió al detalle,
                donde cabe explicado; aquí gastaba una línea de 44 px en cada movimiento.
              -->
              <button
                type="button"
                class="min-w-0 flex-1 touch-manipulation rounded-xl px-1.5 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                :aria-label="`Ver detalle de ${etiquetaConcepto(grupo.concepto)} por ${formatMoney(grupo.monto)} pesos del ${formatDate(grupo.fecha)}`"
                @click="abrirDetalle(grupo)"
              >
                <!-- El flex va en un span interno y los hijos con `pointer-events-none`: así
                     el tap cae siempre en el <button>, como pide docs/compatibilidad-ios-safari.md. -->
                <span class="pointer-events-none flex w-full items-start gap-2.5 sm:gap-3">
                  <!--
                    La columna del día solo cabe en escritorio: en un móvil de 360 px se
                    llevaba 48 px y dejaba la descripción con ocho caracteres por línea.
                    En móvil la fecha se va a la línea de datos, delante de la forma de
                    pago; el `aria-label` del botón sigue diciéndola completa.
                  -->
                  <span class="hidden w-9 flex-shrink-0 pt-0.5 text-center sm:block">
                    <span class="block font-display text-base font-bold leading-none text-gray-800">{{ diaDelMes(grupo.fecha) }}</span>
                    <span class="mt-0.5 block text-[0.625rem] uppercase tracking-wide text-gray-400">{{ mesCorto(grupo.fecha) }}</span>
                  </span>

                  <span
                    class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    :class="estiloIcono(grupo).fondo"
                    aria-hidden="true"
                  >
                    <component :is="estiloIcono(grupo).icono" class="h-5 w-5" :class="estiloIcono(grupo).color" />
                  </span>

                  <span class="block min-w-0 flex-1">
                    <!-- El importe comparte línea con el concepto en vez de ser una
                         columna propia: cae en el mismo borde derecho de antes, pero le
                         devuelve su ancho a la descripción. -->
                    <span class="flex items-start gap-2">
                      <span class="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span class="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold" :class="claseConcepto(grupo.concepto)">
                          {{ etiquetaConcepto(grupo.concepto) }}
                        </span>
                        <LockClosedIcon v-if="!grupo.esManual" class="h-3.5 w-3.5 text-gray-400" aria-label="Generado por otro módulo" />
                        <span
                          v-if="grupo.parAmbiguo"
                          class="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-amber-800"
                        >
                          Pareja dudosa
                        </span>
                      </span>

                      <span
                        class="ml-auto flex-shrink-0 font-display text-sm font-bold tabular-nums sm:text-base"
                        :class="claseImporte(grupo)"
                      >
                        {{ textoImporte(grupo) }}
                      </span>
                    </span>

                    <!-- Hasta dos líneas: con `truncate` una descripción como «Pago
                         arriendo salón diciembre» se cortaba en la primera palabra útil. -->
                    <span class="mt-1.5 line-clamp-2 break-words text-sm leading-snug text-gray-800">
                      {{ grupo.descripcion || etiquetaConcepto(grupo.concepto) }}
                    </span>

                    <span class="mt-1 block truncate text-xs text-gray-500">
                      <span class="sm:hidden">{{ diaDelMes(grupo.fecha) }} {{ mesCorto(grupo.fecha) }} · </span>
                      <span v-if="grupo.esTraslado">
                        {{ etiquetaForma(grupo.formaOrigen) }} → {{ etiquetaForma(grupo.formaDestino) }}
                      </span>
                      <span v-else>{{ etiquetaForma(grupo.formaPago) }}</span>
                      <span v-if="etiquetaBolsillo(grupo)"> · {{ etiquetaBolsillo(grupo) }}</span>
                      <span v-if="grupo.socio"> · {{ grupo.socio }}</span>
                    </span>
                  </span>
                </span>
              </button>

              <div v-if="puedeEscribir && grupo.esManual" class="flex flex-shrink-0 items-center gap-0.5 py-3">
                <button
                  type="button"
                  class="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  :aria-label="`Editar ${etiquetaConcepto(grupo.concepto)} de ${formatMoney(grupo.monto)} pesos`"
                  @click="abrirEdicion(grupo)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                  :aria-label="`Eliminar ${etiquetaConcepto(grupo.concepto)} de ${formatMoney(grupo.monto)} pesos`"
                  @click="grupoAEliminar = grupo"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </section>

        <!-- Exportar, en móvil, al final de la lista -->
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

    <MovimientoDetalleModal
      :show="detalleAbierto"
      :grupo="grupoDetalle"
      :puede-escribir="puedeEscribir"
      :fecha-ultimo-corte="ultimoCorte?.fecha_corte || ''"
      :ruta-origen="rutaOrigenDetalle"
      @close="cerrarDetalle"
      @editar="editarDesdeDetalle"
      @eliminar="eliminarDesdeDetalle"
    />

    <MovimientoFormModal
      :show="modalFormAbierto"
      :grupo="grupoEnEdicion"
      :saldos="{ efectivo: esperadoEfectivo, transferencia: esperadoTransferencia }"
      :fecha-ultimo-corte="ultimoCorte?.fecha_corte || ''"
      :guardando="guardando"
      @close="cerrarForm"
      @guardar="guardar"
    />

    <EliminarMovimientoModal
      :show="!!grupoAEliminar"
      :grupo="grupoAEliminar"
      :fecha-ultimo-corte="ultimoCorte?.fecha_corte || ''"
      :eliminando="eliminando"
      @close="grupoAEliminar = null"
      @confirmar="confirmarEliminacion"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowsRightLeftIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import LoadingScreen from '../../components/LoadingScreen.vue'
import MovimientoFormModal from '../../components/movimientos/MovimientoFormModal.vue'
import MovimientoDetalleModal from '../../components/movimientos/MovimientoDetalleModal.vue'
import EliminarMovimientoModal from '../../components/movimientos/EliminarMovimientoModal.vue'
import {
  useMovimientosFondo,
  CONCEPTOS_MOVIMIENTO,
  claseConcepto,
  etiquetaConcepto,
  etiquetaForma,
  conceptoDefinicion
} from '../../composables/useMovimientosFondo'
import { useLibroCaja } from '../../composables/useLibroCaja'
import { useCortesCaja } from '../../composables/useCortesCaja'
import { useAuthStore } from '../../stores/auth'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useNotificationStore } from '../../stores/notifications'
import { formatDate, formatDateToLocalISO, getCurrentDateISO, parseDateLocal } from '../../utils/formatDate'
import { formatMoney, formatMoneyConSigno } from '../../utils/formatMoney'

const route = useRoute()
const id = computed(() => route.params.id)
const authStore = useAuthStore()
const colaboradoresStore = useColaboradoresStore()
const notificaciones = useNotificationStore()

const {
  cargando,
  error: errorCarga,
  grupos,
  trasladosAmbiguos,
  cargar,
  crearMovimiento,
  crearTraslado,
  actualizarGrupo,
  eliminarGrupo
} = useMovimientosFondo(id)

// El saldo esperado sale del mismo libro que usa la conciliación: así la cifra contra la
// que se registra un movimiento es exactamente la que dice «debería haber» (RF-08).
const { natillera, apuntes, cargar: cargarLibro } = useLibroCaja(id)
const { ultimoCorte } = useCortesCaja(id)

const hoy = getCurrentDateISO()

/* --------------------------------- Permisos ---------------------------------- */

const misPermisos = ref(null)

const esSuperUsuario = computed(() => (authStore.userEmail || '').toLowerCase().trim() === 'raigo.16@gmail.com')

const esAdmin = computed(() => {
  if (esSuperUsuario.value) return true
  if (!authStore.user || !natillera.value) return false
  return natillera.value.admin_id === authStore.user.id
})

// Mismo criterio que el RLS de la tabla: quien puede gestionar cuotas puede mover el fondo.
const puedeEscribir = computed(() => esAdmin.value || misPermisos.value?.permisos?.gestionar_cuotas === true)

/* ------------- Saldo esperado: solo para contar el efecto al guardar ---------- */

/*
 * Estas cifras NO se muestran en la pantalla: lo de arriba mide los movimientos a la vista,
 * no el histórico de la caja. Se calculan porque el formulario tiene que decir «el efectivo
 * pasará de X a Y» (RF-09), y eso solo significa algo contra el saldo real, que es el mismo
 * que la conciliación llama «debería haber».
 */

/** Día siguiente a una fecha 'YYYY-MM-DD', en local. */
function diaSiguiente(fechaIso) {
  const d = parseDateLocal(fechaIso)
  if (!d || isNaN(d.getTime())) return fechaIso
  d.setDate(d.getDate() + 1)
  return formatDateToLocalISO(d)
}

const sumaPorForma = (lista, forma) =>
  lista.filter(a => a.forma_pago === forma).reduce((suma, a) => suma + a.monto, 0)

const apuntesSinFecha = computed(() => apuntes.value.filter(a => !a.fecha))
const apuntesConFecha = computed(() => apuntes.value.filter(a => a.fecha))

const periodoDesde = computed(() => {
  if (ultimoCorte.value) return diaSiguiente(ultimoCorte.value.fecha_corte)
  return apuntesConFecha.value[0]?.fecha || hoy
})

// Con un corte previo se parte del saldo REAL sellado, igual que la conciliación.
const saldoInicialEfectivo = computed(() =>
  ultimoCorte.value ? ultimoCorte.value.real_efectivo : sumaPorForma(apuntesSinFecha.value, 'efectivo')
)
const saldoInicialTransferencia = computed(() =>
  ultimoCorte.value ? ultimoCorte.value.real_transferencia : sumaPorForma(apuntesSinFecha.value, 'transferencia')
)

const apuntesPeriodo = computed(() =>
  apuntesConFecha.value.filter(a => a.fecha >= periodoDesde.value && a.fecha <= hoy)
)

const esperadoEfectivo = computed(() => saldoInicialEfectivo.value + sumaPorForma(apuntesPeriodo.value, 'efectivo'))
const esperadoTransferencia = computed(() => saldoInicialTransferencia.value + sumaPorForma(apuntesPeriodo.value, 'transferencia'))

/* ---------------------------------- Filtros ---------------------------------- */

const PRESETS_FECHA = [
  { value: 'todo', label: 'Todo' },
  { value: 'mes', label: 'Este mes' },
  { value: 'mes-anterior', label: 'Mes pasado' },
  { value: '90', label: '90 días' }
]

const busqueda = ref('')
const filtroConcepto = ref('')
const filtroForma = ref('')
const desde = ref('')
const hasta = ref('')
const presetActivo = ref('todo')
const rangoAbierto = ref(false)

const etiquetaRango = computed(() => {
  if (presetActivo.value) return 'Otras fechas'
  if (desde.value && hasta.value) return `${formatDate(desde.value)} → ${formatDate(hasta.value)}`
  if (desde.value) return `Desde ${formatDate(desde.value)}`
  if (hasta.value) return `Hasta ${formatDate(hasta.value)}`
  return 'Otras fechas'
})

const aplicarPreset = (valor) => {
  presetActivo.value = valor
  if (valor === 'todo') rangoAbierto.value = false
  const ahora = parseDateLocal(hoy) || new Date()

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
  const inicio = new Date(ahora)
  inicio.setDate(inicio.getDate() - 90)
  desde.value = formatDateToLocalISO(inicio)
  hasta.value = hoy
}

const hayFiltros = computed(() =>
  !!busqueda.value.trim() || !!filtroConcepto.value || !!filtroForma.value || !!desde.value || !!hasta.value
)

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroConcepto.value = ''
  filtroForma.value = ''
  aplicarPreset('todo')
}

const visibles = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return grupos.value.filter(g => {
    if (filtroConcepto.value && g.concepto !== filtroConcepto.value) return false
    if (filtroForma.value) {
      const formas = g.esTraslado ? [g.formaOrigen, g.formaDestino] : [g.formaPago]
      if (!formas.includes(filtroForma.value)) return false
    }
    if (desde.value && (!g.fecha || g.fecha < desde.value)) return false
    if (hasta.value && (!g.fecha || g.fecha > hasta.value)) return false
    if (texto) {
      const donde = `${g.descripcion} ${etiquetaConcepto(g.concepto)} ${g.socio || ''}`.toLowerCase()
      if (!donde.includes(texto)) return false
    }
    return true
  })
})

/* ------------------------- Movimiento en cada bolsillo ------------------------ */

/**
 * Cuánto cambió cada forma de pago con los movimientos a la vista.
 *
 * No se totaliza el fondo entero —entró, salió, neto— porque en una vista de movimientos
 * la pregunta útil es cómo quedó cada bolsillo. El traslado, además, no le suma nada al
 * fondo: es el mismo dinero cambiando de sitio, y sumarlo como salida haría que quien
 * consigna el efectivo cada semana por seguridad lo viera siempre en negativo, midiendo
 * su costumbre de consignar en vez del dinero de la natillera.
 */
const totalesMovimientos = computed(() => {
  const porForma = {
    efectivo: { entro: 0, salio: 0, trasladoEntra: 0, trasladoSale: 0 },
    transferencia: { entro: 0, salio: 0, trasladoEntra: 0, trasladoSale: 0 }
  }
  visibles.value.forEach(g => {
    if (g.esTraslado) {
      porForma[g.formaOrigen].trasladoSale += g.monto
      porForma[g.formaDestino].trasladoEntra += g.monto
      return
    }
    porForma[g.formaPago][g.signo > 0 ? 'entro' : 'salio'] += g.monto
  })
  return porForma
})

const claseSigno = (valor) => {
  if (valor > 0) return 'text-lime-700'
  if (valor < 0) return 'text-rose-700'
  return 'text-gray-900'
}

const FORMAS_EFECTO = [
  { clave: 'efectivo', titulo: 'Efectivo', icono: BanknotesIcon, acento: 'text-green-700' },
  { clave: 'transferencia', titulo: 'Cuenta', icono: BuildingLibraryIcon, acento: 'text-blue-700' }
]

/**
 * Lo anterior, ya en forma de tarjeta. Aquí el traslado sí suma, con su signo: negativo en
 * la forma de la que salió y positivo en la que lo recibió.
 */
const efectoPorForma = computed(() =>
  FORMAS_EFECTO.map(forma => {
    const datos = totalesMovimientos.value[forma.clave]
    const traslado = datos.trasladoEntra - datos.trasladoSale
    const efecto = datos.entro - datos.salio + traslado

    const lineas = [
      { etiqueta: 'Entró', texto: `$${formatMoney(datos.entro)}`, clase: 'text-lime-700' },
      { etiqueta: 'Salió', texto: `$${formatMoney(datos.salio)}`, clase: 'text-rose-700' }
    ]
    if (datos.trasladoEntra > 0 || datos.trasladoSale > 0) {
      lineas.push({ etiqueta: 'Traslados', texto: `$${formatMoneyConSigno(traslado)}`, clase: claseSigno(traslado) })
    }

    return {
      ...forma,
      lineas,
      textoEfecto: `$${formatMoneyConSigno(efecto)}`,
      claseEfecto: claseSigno(efecto)
    }
  })
)

/* --------------------------------- Presentación ------------------------------- */

const diaDelMes = (fecha) => {
  const d = parseDateLocal(fecha)
  return d && !isNaN(d.getTime()) ? String(d.getDate()).padStart(2, '0') : '—'
}

const mesCorto = (fecha) => {
  const d = parseDateLocal(fecha)
  if (!d || isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')
}

const estiloIcono = (grupo) => {
  if (grupo.esTraslado) {
    return { icono: ArrowsRightLeftIcon, fondo: 'bg-indigo-50', color: 'text-indigo-600' }
  }
  if (grupo.signo > 0) {
    return { icono: ArrowDownCircleIcon, fondo: 'bg-lime-50', color: 'text-lime-600' }
  }
  return { icono: ArrowUpCircleIcon, fondo: 'bg-rose-50', color: 'text-rose-600' }
}

const claseImporte = (grupo) => {
  if (grupo.esTraslado) return 'text-indigo-700'
  return grupo.signo > 0 ? 'text-lime-700' : 'text-rose-700'
}

// El traslado va sin signo a propósito: no cambia el total, solo de sitio (RF-04).
const textoImporte = (grupo) =>
  grupo.esTraslado ? `$${formatMoney(grupo.monto)}` : `$${formatMoneyConSigno(grupo.signo * grupo.monto)}`

const etiquetaBolsillo = (grupo) => {
  const valor = grupo.direccion === 'ingreso' ? grupo.destinoIngreso : grupo.origenEgreso
  if (!valor) return ''
  return valor === 'utilidades' ? 'Utilidades' : 'Recaudado'
}

const rutaOrigen = (grupo) => {
  const ruta = conceptoDefinicion(grupo.concepto)?.ruta
  return ruta ? `/natilleras/${id.value}/${ruta}` : null
}

/* ------------------------------- Crear y editar ------------------------------- */

const modalFormAbierto = ref(false)
const grupoEnEdicion = ref(null)
const guardando = ref(false)

const abrirNuevo = () => {
  grupoEnEdicion.value = null
  modalFormAbierto.value = true
}

const abrirEdicion = (grupo) => {
  grupoEnEdicion.value = grupo
  modalFormAbierto.value = true
}

const cerrarForm = () => {
  if (guardando.value) return
  modalFormAbierto.value = false
  grupoEnEdicion.value = null
}

const guardar = async (datos) => {
  guardando.value = true
  try {
    if (grupoEnEdicion.value) {
      await actualizarGrupo(grupoEnEdicion.value, datos)
      notificaciones.exito('Movimiento actualizado.', 'Listo')
    } else if (datos.direccion === 'traslado') {
      await crearTraslado(datos)
      notificaciones.exito('Traslado registrado. El total no cambia, el dinero sí de sitio.', 'Listo')
    } else {
      await crearMovimiento(datos)
      notificaciones.exito('Movimiento registrado y reflejado en la conciliación.', 'Listo')
    }
    modalFormAbierto.value = false
    grupoEnEdicion.value = null
    // Releer el libro para que el saldo de la cabecera y el de la conciliación coincidan.
    await cargarLibro()
  } catch (e) {
    console.error('Movimientos: no se pudo guardar.', e)
    notificaciones.critica(e.message || 'No se pudo guardar el movimiento', 'Error')
  } finally {
    guardando.value = false
  }
}

/* --------------------------------- Eliminar ---------------------------------- */

const grupoAEliminar = ref(null)
const eliminando = ref(false)

const confirmarEliminacion = async () => {
  if (!grupoAEliminar.value) return
  eliminando.value = true
  try {
    await eliminarGrupo(grupoAEliminar.value)
    notificaciones.exito('Movimiento eliminado.', 'Listo')
    grupoAEliminar.value = null
    await cargarLibro()
  } catch (e) {
    console.error('Movimientos: no se pudo eliminar.', e)
    notificaciones.critica(e.message || 'No se pudo eliminar el movimiento', 'Error')
  } finally {
    eliminando.value = false
  }
}

/* ---------------------------------- Detalle ----------------------------------- */

/*
 * Se recuerda la clave del grupo, no el objeto. Los grupos se recalculan en cada carga,
 * así que guardar la referencia dejaría el detalle mostrando los datos de antes de editar.
 * De paso sale gratis lo correcto al eliminar: el grupo desaparece de la lista y el modal
 * se cierra solo.
 */
const claveDetalle = ref('')
const grupoDetalle = computed(() => grupos.value.find(g => g.clave === claveDetalle.value) || null)
const detalleAbierto = computed(() => !!grupoDetalle.value)

const rutaOrigenDetalle = computed(() => {
  const grupo = grupoDetalle.value
  if (!grupo || grupo.esManual) return ''
  return rutaOrigen(grupo) || ''
})

const abrirDetalle = (grupo) => {
  claveDetalle.value = grupo.clave
}

const cerrarDetalle = () => {
  claveDetalle.value = ''
}

// Editar y eliminar reutilizan los modales que ya existen: el detalle se cierra antes para
// no apilar dos overlays en el mismo z-index.
const editarDesdeDetalle = () => {
  const grupo = grupoDetalle.value
  cerrarDetalle()
  if (grupo) abrirEdicion(grupo)
}

const eliminarDesdeDetalle = () => {
  const grupo = grupoDetalle.value
  cerrarDetalle()
  if (grupo) grupoAEliminar.value = grupo
}

/* --------------------------------- Exportar ---------------------------------- */

const exportando = ref(false)

// xlsx-js-style pesa ~600 KB: se carga solo al exportar para no inflar el chunk de la vista.
let XLSX = null
async function asegurarXLSX() {
  if (XLSX) return
  const modulo = await import('xlsx-js-style')
  XLSX = modulo.default || modulo
}

const exportarExcel = async () => {
  if (visibles.value.length === 0) return
  exportando.value = true
  try {
    await asegurarXLSX()
    const filas = visibles.value.map(g => ({
      Fecha: formatDate(g.fecha),
      Concepto: etiquetaConcepto(g.concepto),
      Descripción: g.descripcion || '',
      Forma: g.esTraslado
        ? `${etiquetaForma(g.formaOrigen)} → ${etiquetaForma(g.formaDestino)}`
        : etiquetaForma(g.formaPago),
      Bolsillo: etiquetaBolsillo(g) || '',
      Origen: g.esManual ? 'Manual' : (conceptoDefinicion(g.concepto)?.modulo || 'Automático'),
      Monto: g.esTraslado ? g.monto : g.signo * g.monto
    }))

    const hoja = XLSX.utils.json_to_sheet(filas)
    const rango = XLSX.utils.decode_range(hoja['!ref'])

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
        const esNumero = columna === 6
        hoja[celda].s = {
          font: { sz: 10, color: { rgb: esNumero && hoja[celda].v < 0 ? 'B91C1C' : '1F2937' } },
          alignment: { horizontal: esNumero ? 'right' : 'left', vertical: 'center' }
        }
        if (esNumero) hoja[celda].z = '#,##0;[Red]-#,##0'
      }
    }

    hoja['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 34 }, { wch: 24 }, { wch: 12 }, { wch: 14 }, { wch: 14 }]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Movimientos')
    const nombre = (natillera.value?.nombre || 'Natillera').replace(/[^a-zA-Z0-9]/g, '_')
    XLSX.writeFile(libro, `Movimientos_${nombre}_${desde.value || 'inicio'}_a_${hasta.value || hoy}.xlsx`)
    notificaciones.exito('Archivo descargado con los filtros aplicados.', 'Exportado')
  } catch (e) {
    console.error('Movimientos: error exportando.', e)
    notificaciones.critica(e.message || 'No se pudo exportar', 'Error')
  } finally {
    exportando.value = false
  }
}

/* ------------------------------- Ciclo de vida -------------------------------- */

const recargarTodo = async () => {
  await Promise.all([cargar(), cargarLibro()])
}

watch(id, async (nuevoId) => {
  if (!nuevoId) return
  await recargarTodo()
  try {
    misPermisos.value = await colaboradoresStore.obtenerMisPermisos(nuevoId)
  } catch (e) {
    // Un fallo de permisos no debe dejar la pantalla en blanco: se cae a solo lectura.
    console.error('Movimientos: no se pudieron leer los permisos.', e)
    misPermisos.value = null
  }
}, { immediate: true })
</script>

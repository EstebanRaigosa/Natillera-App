<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <div class="relative">
      <Breadcrumbs />
      <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-3 min-w-0 w-full sm:w-auto sm:flex-1">
            <BackButton :to="`/natilleras/${id}`" :inline="true" />
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <CalculatorIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0">
              <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">Totales generales</h1>
              <p class="text-gray-500 mt-0.5 text-xs sm:text-sm leading-snug">Cuenta el dinero y contrasta con lo que debería haber</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pestañas: Totales | Simulador de cierre -->
    <div v-if="!loading" class="relative">
      <div class="flex rounded-xl bg-gray-100 p-1 border border-gray-200/80 shadow-inner">
        <button
          type="button"
          @click="tabActiva = 'totales'"
          :class="[
            'flex-1 sm:flex-none min-w-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
            tabActiva === 'totales'
              ? 'bg-white text-teal-700 shadow-md border border-gray-200'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          ]"
        >
          Totales
        </button>
        <button
          type="button"
          @click="tabActiva = 'simulador'"
          :class="[
            'flex-1 sm:flex-none min-w-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
            tabActiva === 'simulador'
              ? 'bg-white text-teal-700 shadow-md border border-gray-200'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          ]"
        >
          Simulador de cierre
        </button>
      </div>
    </div>

    <LoadingScreen
      :visible="loading"
      text="Calculando cuadre de caja"
    />

    <template v-if="!loading">
      <div v-show="tabActiva === 'totales'">
      <!-- Tarjetas: Total esperado por forma de pago (clic para desglose) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- Efectivo esperado -->
        <div
          class="text-left bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 sm:p-6 border-2 border-green-200 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <BanknotesIcon class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-gray-700 font-semibold">EFECTIVO</p>
            </div>
          </div>
          <p class="text-green-700 text-2xl sm:text-3xl font-extrabold tabular-nums">
            ${{ formatMoney(totalEsperadoEfectivo) }}
          </p>
          <div class="mt-3 pt-3 border-t border-green-200/60 text-xs text-gray-600 space-y-0.5">
            <p>• Cuotas + Cuotas préstamos + Sanciones + Actividades: ${{ formatMoney(recaudadoEfectivo - utilidadInteresAnticipadoEfectivo) }}</p>
            <p v-if="utilidadInteresAnticipadoEfectivo > 0">• + Utilidad por interés anticipado: ${{ formatMoney(utilidadInteresAnticipadoEfectivo) }}</p>
            <p>• − Préstamos entregados: ${{ formatMoney(prestamosEfectivo) }}</p>
            <p v-if="premiosEfectivo > 0">• − Premios rifa: ${{ formatMoney(premiosEfectivo) }}</p>
            <p v-if="movimientosEfectivoNeto !== 0">• {{ movimientosEfectivoNeto >= 0 ? '+' : '' }} Movimientos: ${{ formatMoney(movimientosEfectivoNeto) }}</p>
          </div>
        </div>

        <!-- Transferencia esperada -->
        <div
          class="text-left bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <ArrowPathIcon class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-gray-700 font-semibold">TRANSFERENCIA</p>
            </div>
          </div>
          <p class="text-blue-700 text-2xl sm:text-3xl font-extrabold tabular-nums">
            ${{ formatMoney(totalEsperadoTransferencia) }}
          </p>
          <div class="mt-3 pt-3 border-t border-blue-200/60 text-xs text-gray-600 space-y-0.5">
            <p>• Cuotas + Cuotas préstamos + Sanciones + Actividades: ${{ formatMoney(recaudadoTransferencia - utilidadInteresAnticipadoTransferencia - recaudadoGmf4x1000) }}</p>
            <p v-if="recaudadoGmf4x1000 > 0">• GMF 4×1000 (por transferencias): ${{ formatMoney(recaudadoGmf4x1000) }}</p>
            <p v-if="utilidadInteresAnticipadoTransferencia > 0">• + Utilidad por interés anticipado: ${{ formatMoney(utilidadInteresAnticipadoTransferencia) }}</p>
            <p>• − Préstamos entregados: ${{ formatMoney(prestamosTransferencia) }}</p>
            <p v-if="premiosTransferencia > 0">• − Premios rifa: ${{ formatMoney(premiosTransferencia) }}</p>
            <p v-if="movimientosTransferenciaNeto !== 0">• {{ movimientosTransferenciaNeto >= 0 ? '+' : '' }} Movimientos: ${{ formatMoney(movimientosTransferenciaNeto) }}</p>
          </div>
        </div>

        <!-- Total general (efectivo + transferencia) -->
        <div class="md:col-span-2 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 sm:p-6 border-2 border-teal-200 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <CalculatorIcon class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-gray-700 font-semibold">TOTAL GENERAL</p>
              <p class="text-gray-500 text-xs">Efectivo + Transferencia</p>
            </div>
          </div>
          <p class="text-teal-700 text-2xl sm:text-3xl font-extrabold tabular-nums">
            ${{ formatMoney(totalEsperadoGeneral) }}
          </p>
        </div>
      </div>

      <template v-if="false">
              <!-- Modal desglose efectivo/transferencia eliminado por solicitud -->
              <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <!-- Recaudado (cuotas ahorro) -->
                <div class="rounded-xl p-4 border-2" :class="modalDesgloseFormaPago === 'efectivo' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Recaudado (cuotas)</p>
                  <p class="text-2xl font-bold tabular-nums" :class="modalDesgloseFormaPago === 'efectivo' ? 'text-green-700' : 'text-blue-700'">
                    ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? recaudadoCuotasEfectivo : recaudadoCuotasTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Aportes de socios (valor cuota)</p>
                </div>
                <!-- Cuotas préstamos (pagos de cuotas de préstamos) -->
                <div v-if="(modalDesgloseFormaPago === 'efectivo' ? recaudadoCuotasPrestamoEfectivo : recaudadoCuotasPrestamoTransferencia) > 0" class="rounded-xl p-4 border-2 bg-teal-50 border-teal-200">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Cuotas préstamos</p>
                  <p class="text-2xl font-bold tabular-nums text-teal-700">
                    ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? recaudadoCuotasPrestamoEfectivo : recaudadoCuotasPrestamoTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Pagos de cuotas de préstamos según forma de pago</p>
                </div>
                <!-- Utilidad por interés anticipado (préstamos) -->
                <div v-if="(modalDesgloseFormaPago === 'efectivo' ? utilidadInteresAnticipadoEfectivo : utilidadInteresAnticipadoTransferencia) > 0" class="rounded-xl p-4 border-2 bg-amber-50 border-amber-200">
                  <p class="text-sm font-semibold text-gray-700 mb-1">+ Utilidad por interés anticipado</p>
                  <p class="text-2xl font-bold tabular-nums text-amber-700">
                    ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? utilidadInteresAnticipadoEfectivo : utilidadInteresAnticipadoTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Intereses cobrados por adelantado en préstamos (suma a la forma de pago)</p>
                </div>
                <!-- Utilidad (sanciones + actividades) -->
                <div class="rounded-xl p-4 border-2" :class="modalDesgloseFormaPago === 'efectivo' ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Utilidad (sanciones + actividades)</p>
                  <p class="text-2xl font-bold tabular-nums text-violet-700">
                    ${{ formatMoney(Math.max(0, (modalDesgloseFormaPago === 'efectivo' ? utilidadEfectivo : utilidadTransferencia) - (modalDesgloseFormaPago === 'efectivo' ? egresosUtilidadesEfectivo : egresosUtilidadesTransferencia) + (modalDesgloseFormaPago === 'efectivo' ? ingresosUtilidadesEfectivo : ingresosUtilidadesTransferencia))) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Multas y actividades extraordinarias</p>
                  <p v-if="(modalDesgloseFormaPago === 'efectivo' ? egresosUtilidadesEfectivo : egresosUtilidadesTransferencia) > 0" class="text-xs text-red-600 mt-0.5">(egresos de utilidades descontados: − ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? egresosUtilidadesEfectivo : egresosUtilidadesTransferencia) }})</p>
                  <p v-if="(modalDesgloseFormaPago === 'efectivo' ? ingresosUtilidadesEfectivo : ingresosUtilidadesTransferencia) > 0" class="text-xs text-green-600 mt-0.5">(ingresos sumados a utilidades: + ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? ingresosUtilidadesEfectivo : ingresosUtilidadesTransferencia) }})</p>
                </div>
                <!-- Egresos salidos de recaudado (restan del indicador recaudado) -->
                <div v-if="(modalDesgloseFormaPago === 'efectivo' ? egresosRecaudadoEfectivo : egresosRecaudadoTransferencia) > 0" class="rounded-xl p-4 border-2 bg-red-50 border-red-200">
                  <p class="text-sm font-semibold text-gray-700 mb-1">− Egresos salidos de recaudado</p>
                  <p class="text-xl font-bold tabular-nums text-red-700">
                    − ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? egresosRecaudadoEfectivo : egresosRecaudadoTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Egresos registrados como “sale de recaudado”</p>
                </div>
                <!-- Ingresos sumados a recaudado -->
                <div v-if="(modalDesgloseFormaPago === 'efectivo' ? ingresosRecaudadoEfectivo : ingresosRecaudadoTransferencia) > 0" class="rounded-xl p-4 border-2 bg-green-50 border-green-200">
                  <p class="text-sm font-semibold text-gray-700 mb-1">+ Ingresos sumados a recaudado</p>
                  <p class="text-xl font-bold tabular-nums text-green-700">
                    + ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? ingresosRecaudadoEfectivo : ingresosRecaudadoTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Ingresos registrados como “va a recaudado”</p>
                </div>
                <!-- Total recaudado y resta de préstamos -->
                <div class="rounded-xl p-4 bg-gray-50 border-2 border-gray-200 space-y-2">
                  <p class="text-sm font-semibold text-gray-700">Total recaudado (cuotas + utilidad)</p>
                  <p class="text-xl font-bold tabular-nums text-gray-800">
                    ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? recaudadoEfectivo : recaudadoTransferencia) }}
                  </p>
                  <p class="text-sm text-red-600 font-medium">− Préstamos entregados: ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? prestamosEfectivo : prestamosTransferencia) }}</p>
                  <p v-if="(modalDesgloseFormaPago === 'efectivo' ? premiosEfectivo : premiosTransferencia) > 0" class="text-sm text-red-600 font-medium">− Premios rifa: ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? premiosEfectivo : premiosTransferencia) }}</p>
                  <p class="text-sm font-semibold text-gray-700 pt-2 border-t border-gray-200">
                    Neto (recaudado − préstamos − premios): ${{ formatMoney(Math.max(0, (modalDesgloseFormaPago === 'efectivo' ? recaudadoEfectivo : recaudadoTransferencia) - (modalDesgloseFormaPago === 'efectivo' ? prestamosEfectivo : prestamosTransferencia) - (modalDesgloseFormaPago === 'efectivo' ? premiosEfectivo : premiosTransferencia))) }}
                  </p>
                </div>
                <!-- Movimientos -->
                <div v-if="(modalDesgloseFormaPago === 'efectivo' ? movimientosEfectivoNeto : movimientosTransferenciaNeto) !== 0" class="text-sm text-gray-600">
                  <p>{{ (modalDesgloseFormaPago === 'efectivo' ? movimientosEfectivoNeto : movimientosTransferenciaNeto) >= 0 ? '+' : '' }} Movimientos: ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? movimientosEfectivoNeto : movimientosTransferenciaNeto) }}</p>
                </div>
                <p class="pt-3 border-t-2 border-gray-300 font-bold text-lg">
                  Total: ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? totalEsperadoEfectivo : totalEsperadoTransferencia) }}
                </p>
              </div>
      </template>

      <!-- Detalle por concepto: Cuotas, Sanciones, Actividades, Préstamos -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <button
              @click="detalleExpandido = !detalleExpandido"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              :title="detalleExpandido ? 'Ocultar detalle' : 'Mostrar detalle'"
            >
              <ChevronDownIcon
                :class="['w-5 h-5 text-gray-600 transition-transform', detalleExpandido && 'rotate-180']"
              />
            </button>
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TableCellsIcon class="w-5 h-5 text-teal-600" />
              Detalle por concepto
                <span class="text-sm font-normal text-gray-500">({{ detalleFiltrado.length }} registros)</span>
            </h2>
            <p class="text-sm text-gray-500 mt-0.5">Cuotas, sanciones, actividades, GMF 4×1000 (transferencias) y más, con socio y forma de pago.</p>
            </div>
          </div>
          <button
            @click="exportarAExcel"
            :disabled="exportando || detalleFiltrado.length === 0"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
            {{ exportando ? 'Exportando...' : 'Exportar a Excel' }}
          </button>
        </div>
        
        <!-- Contenido colapsable -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[5000px]"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[5000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="detalleExpandido" class="overflow-hidden">
        <!-- Filtros -->
        <div class="flex flex-col gap-4 mb-4">
          <!-- Barra de búsqueda -->
          <div class="relative">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model.trim="filtroDetalleBusqueda"
              type="search"
              placeholder="Buscar por concepto o socio..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm placeholder-gray-400"
              autocomplete="off"
            />
          </div>
          <!-- Filtro por mes (solo meses que existen en la natillera) -->
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap">
            <label class="text-sm font-semibold text-gray-700 shrink-0">Mes:</label>
            <div class="flex items-center gap-2 flex-wrap">
              <select
                v-model="filtroDetalleMes"
                class="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm bg-white min-w-[11rem]"
              >
                <option value="">Todos los meses</option>
                <option
                  v-for="op in mesesEnNatillera"
                  :key="op.value"
                  :value="op.value"
                >{{ op.label }}</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 flex-wrap">
          <!-- Filtro categoría (dropdown con checkboxes) -->
          <div ref="dropdownCategoriasRef" class="relative flex flex-col gap-2 min-w-0">
            <label class="text-sm font-semibold text-gray-700 shrink-0">Categoría:</label>
            <button
              type="button"
              @click="dropdownCategoriasAbierto = !dropdownCategoriasAbierto"
              class="flex items-center justify-between gap-2 min-w-[11rem] px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span class="truncate">{{ etiquetaFiltroCategorias }}</span>
              <ChevronDownIcon :class="['w-5 h-5 text-gray-500 shrink-0 transition-transform', dropdownCategoriasAbierto && 'rotate-180']" />
            </button>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-show="dropdownCategoriasAbierto"
                class="absolute top-full left-0 mt-1 z-50 py-2 rounded-xl bg-white border-2 border-gray-200 shadow-xl min-w-[11rem] max-h-[16rem] overflow-y-auto"
              >
                <button
                  type="button"
                  @click="filtroDetalleCategorias = []; dropdownCategoriasAbierto = false"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50/80 transition-colors"
                  :class="filtroDetalleCategorias.length === 0 ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700'"
                >
                  <span class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0" :class="filtroDetalleCategorias.length === 0 ? 'border-teal-500 bg-teal-500' : 'border-gray-300'">
                    <CheckIcon v-if="filtroDetalleCategorias.length === 0" class="w-3.5 h-3.5 text-white" />
                  </span>
                  Todas
                </button>
                <div class="border-t border-gray-100 my-1" />
                <button
                  v-for="cat in CATEGORIAS_DETALLE"
                  :key="cat.value"
                  type="button"
                  @click="toggleFiltroCategoria(cat.value)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50/80 transition-colors"
                  :class="filtroDetalleCategorias.includes(cat.value) ? 'bg-teal-50/80 text-teal-800 font-medium' : 'text-gray-700'"
                >
                  <span class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0" :class="filtroDetalleCategorias.includes(cat.value) ? 'border-teal-500 bg-teal-500' : 'border-gray-300'">
                    <CheckIcon v-if="filtroDetalleCategorias.includes(cat.value)" class="w-3.5 h-3.5 text-white" />
                  </span>
                  {{ cat.label }}
                </button>
              </div>
            </Transition>
          </div>
          <!-- Filtro forma de pago -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              @click="filtroDetalleFormaPago = 'todos'"
              :class="['px-3 py-1.5 rounded-lg text-sm font-semibold transition-all', filtroDetalleFormaPago === 'todos' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >Todos</button>
            <button
              @click="filtroDetalleFormaPago = 'efectivo'"
              :class="['px-3 py-1.5 rounded-lg text-sm font-semibold transition-all', filtroDetalleFormaPago === 'efectivo' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >Efectivo</button>
            <button
              @click="filtroDetalleFormaPago = 'transferencia'"
              :class="['px-3 py-1.5 rounded-lg text-sm font-semibold transition-all', filtroDetalleFormaPago === 'transferencia' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            >Transferencia</button>
          </div>
          <!-- Ordenar por (varios criterios, prioridad de arriba a abajo en la lista) -->
          <div ref="dropdownOrdenarRef" class="relative flex flex-col gap-2 min-w-0">
            <label class="text-sm font-semibold text-gray-700 shrink-0">Ordenar por:</label>
            <button
              type="button"
              @click="dropdownOrdenarAbierto = !dropdownOrdenarAbierto"
              class="flex items-center justify-between gap-2 min-w-[10rem] max-w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm text-left bg-white hover:bg-gray-50 transition-colors"
              :title="etiquetaOrdenDetalle"
            >
              <span class="truncate">{{ etiquetaOrdenDetalle }}</span>
              <ChevronDownIcon :class="['w-5 h-5 text-gray-500 shrink-0 transition-transform', dropdownOrdenarAbierto && 'rotate-180']" />
            </button>
            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-show="dropdownOrdenarAbierto"
                class="absolute top-full left-0 mt-1 z-50 py-2 rounded-xl bg-white border-2 border-gray-200 shadow-xl min-w-[15rem] max-w-[min(100vw-2rem,22rem)] overflow-hidden"
              >
                <p class="px-3 pb-2 text-[11px] text-gray-500 leading-snug">
                  Marca uno o más criterios. El número indica la prioridad; usa las flechas para cambiar el orden.
                </p>
                <div
                  v-for="opt in OPCIONES_ORDENAR"
                  :key="opt.value"
                  class="flex items-stretch gap-1 px-1.5"
                >
                  <button
                    type="button"
                    class="flex flex-1 items-center gap-2 min-w-0 text-left text-sm rounded-lg px-2 py-2 transition-colors"
                    :class="ordenarDetalleCriterios.includes(opt.value) ? 'bg-teal-50 text-teal-800 font-medium' : 'text-gray-700 hover:bg-gray-50'"
                    @click="toggleCriterioOrden(opt.value)"
                  >
                    <span
                      class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                      :class="ordenarDetalleCriterios.includes(opt.value) ? 'border-teal-500 bg-teal-500' : 'border-gray-300'"
                    >
                      <CheckIcon v-if="ordenarDetalleCriterios.includes(opt.value)" class="w-3.5 h-3.5 text-white" />
                    </span>
                    <span v-if="indiceCriterioOrden(opt.value) >= 0" class="text-xs text-teal-600 font-semibold tabular-nums w-4 shrink-0">{{ indiceCriterioOrden(opt.value) + 1 }}.</span>
                    <span class="truncate">{{ opt.label }}</span>
                  </button>
                  <div
                    v-if="ordenarDetalleCriterios.includes(opt.value) && ordenarDetalleCriterios.length > 1"
                    class="flex flex-col justify-center shrink-0 border-l border-gray-100 pl-0.5"
                  >
                    <button
                      type="button"
                      class="p-0.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:pointer-events-none"
                      :disabled="indiceCriterioOrden(opt.value) <= 0"
                      aria-label="Subir prioridad"
                      @click.stop="moverCriterioOrden(opt.value, -1)"
                    >
                      <ChevronUpIcon class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      class="p-0.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:pointer-events-none"
                      :disabled="indiceCriterioOrden(opt.value) >= ordenarDetalleCriterios.length - 1"
                      aria-label="Bajar prioridad"
                      @click.stop="moverCriterioOrden(opt.value, 1)"
                    >
                      <ChevronDownIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          </div>
        </div>
            <!-- Grid desktop / Cards móvil -->
            <div v-if="detalleFiltrado.length === 0" class="text-center py-8 text-gray-500 rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <p class="font-medium">No hay registros para mostrar</p>
            </div>
            <div v-else>
              <!-- Desktop: tabla grid -->
              <div class="hidden sm:block overflow-x-auto -mx-1 mb-4">
                <table class="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr class="border-b-2 border-gray-200 text-left text-gray-600 font-semibold">
                      <th class="py-3 px-2">Concepto</th>
                      <th class="py-3 px-2">Socio</th>
                      <th class="py-3 px-2 whitespace-nowrap">Fecha mov.</th>
                      <th class="py-3 px-2">Forma de pago</th>
                      <th class="py-3 px-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, idx) in detallePaginado"
                      :key="`${item.tipo}-${idx}-${item.socio}-${item.monto}`"
                      class="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                    >
                      <td class="py-2.5 px-2">
                        <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium max-w-[200px] truncate', getConceptoClass(item.tipo, item.esParcial)]" :title="item.concepto">
                          {{ item.concepto }}
                        </span>
                        <span v-if="item.mes" class="text-gray-500 ml-1">{{ getMesLabel(item.mes) }} {{ item.anio }}</span>
                      </td>
                      <td class="py-2.5 px-2 font-medium text-gray-800">{{ item.socio || '—' }}</td>
                      <td class="py-2.5 px-2 text-gray-600 whitespace-nowrap tabular-nums">{{ formatDate(item.fecha_movimiento) }}</td>
                      <td class="py-2.5 px-2">
                        <span :class="item.forma_pago === 'transferencia' ? 'text-blue-600' : 'text-green-600'">{{ item.forma_pago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}</span>
                      </td>
                      <td class="py-2.5 px-2 text-right font-semibold" :class="item.monto >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ item.monto >= 0 ? '+' : '' }}${{ formatMoney(item.monto) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="border-t-2 border-gray-200">
                    <tr class="font-bold text-gray-800">
                      <td colspan="4" class="py-3 px-2">Total (filtrado)</td>
                      <td class="py-3 px-2 text-right" :class="totalDetalleFiltrado >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ totalDetalleFiltrado >= 0 ? '+' : '' }}${{ formatMoney(totalDetalleFiltrado) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- Móvil: cards apiladas -->
              <div class="sm:hidden space-y-2 mb-4">
                <div
                  v-for="(item, idx) in detallePaginado"
                  :key="`mob-${item.tipo}-${idx}-${item.socio}-${item.monto}`"
                  class="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span :class="['inline-flex px-2 py-0.5 rounded-lg text-xs font-medium shrink-0 max-w-full truncate', getConceptoClass(item.tipo, item.esParcial)]" :title="item.concepto">
                        {{ item.concepto }}
                      </span>
                      <span v-if="item.mes" class="text-gray-500 text-xs shrink-0">{{ getMesLabel(item.mes) }} {{ item.anio }}</span>
                    </div>
                    <p class="font-medium text-gray-800 truncate mt-0.5">{{ item.socio || '—' }}</p>
                    <p class="text-xs text-gray-500 tabular-nums">{{ formatDate(item.fecha_movimiento) }}</p>
                    <p class="text-xs" :class="item.forma_pago === 'transferencia' ? 'text-blue-600' : 'text-green-600'">
                      {{ item.forma_pago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                    </p>
                  </div>
                  <span class="font-bold shrink-0 tabular-nums" :class="item.monto >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ item.monto >= 0 ? '+' : '' }}${{ formatMoney(item.monto) }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-xl border-2 border-teal-200 bg-teal-50/50 font-bold">
                  <span class="text-gray-800">Total</span>
                  <span :class="totalDetalleFiltrado >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ totalDetalleFiltrado >= 0 ? '+' : '' }}${{ formatMoney(totalDetalleFiltrado) }}
                  </span>
                </div>
              </div>

              <!-- Paginación -->
              <div v-if="totalPaginas > 1" class="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div class="text-sm text-gray-600">
                  Mostrando {{ inicioPagina }} - {{ finPagina }} de {{ detalleFiltrado.length }} registros
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="paginaActual = Math.max(1, paginaActual - 1)"
                    :disabled="paginaActual === 1"
                    class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeftIcon class="w-5 h-5" />
                  </button>
                  <span class="px-4 py-2 text-sm font-semibold text-gray-700">
                    Página {{ paginaActual }} de {{ totalPaginas }}
                  </span>
                  <button
                    @click="paginaActual = Math.min(totalPaginas, paginaActual + 1)"
                    :disabled="paginaActual === totalPaginas"
                    class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRightIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Lista de movimientos -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ListBulletIcon class="w-5 h-5 text-teal-600" />
          Movimientos de caja
        </h2>
            <p class="text-sm text-gray-500 mt-0.5">Entradas y salidas manuales (depósitos, retiros, gastos operativos).</p>
          </div>
          <button
            @click="abrirModalMovimiento"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors shadow-md"
          >
            <PlusIcon class="w-5 h-5" />
            Nuevo Movimiento
          </button>
        </div>
        <div v-if="movimientos.length === 0" class="text-center py-8 text-gray-500 rounded-xl bg-gray-50 border border-dashed border-gray-200">
          <p class="font-medium">No hay movimientos registrados</p>
          <p class="text-sm mt-1">Los movimientos se suman o restan del total esperado.</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="item in movimientosParaLista"
            :key="item.tipo === 'traslado' ? `traslado-${item.salida.id}` : item.movimiento.id"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 hover:shadow-md transition-all"
            :class="item.tipo === 'traslado'
              ? 'border-teal-300 bg-gradient-to-r from-teal-50/80 to-cyan-50/50'
              : (item.movimiento.tipo === 'entrada' ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30')"
          >
            <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <!-- Icono: traslado (una tarjeta) o entrada/salida -->
              <div
                v-if="item.tipo === 'traslado'"
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-teal-500 text-white"
              >
                <ArrowPathIcon class="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div
                v-else
                :class="[
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
                  item.movimiento.tipo === 'entrada'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                ]"
              >
                <ArrowUpCircleIcon v-if="item.movimiento.tipo === 'entrada'" class="w-6 h-6 sm:w-7 sm:h-7" />
                <ArrowDownCircleIcon v-else class="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div class="flex-1 min-w-0">
                <!-- Traslado: una sola tarjeta con salida y entrada bien visibles -->
                <template v-if="item.tipo === 'traslado'">
                  <div class="flex items-center gap-2 flex-wrap mb-2">
                    <span class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs font-bold shrink-0 bg-teal-100 text-teal-800 border-2 border-teal-400">
                      🔄 Traslado
                    </span>
                  </div>
                  <!-- Salida y entrada en dos líneas claras -->
                  <div class="space-y-1.5 text-sm">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-red-600 font-semibold shrink-0">Salida</span>
                      <span class="px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-medium text-xs border border-green-300 shrink-0">
                        {{ item.salida.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia' }}
                      </span>
                      <span class="text-red-600 font-bold tabular-nums">−${{ formatMoney(item.salida.monto) }}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-green-600 font-semibold shrink-0">Entrada</span>
                      <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium text-xs border border-blue-300 shrink-0">
                        {{ item.entrada.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia' }}
                      </span>
                      <span class="text-green-600 font-bold tabular-nums">+${{ formatMoney(item.entrada.monto) }}</span>
                    </div>
                  </div>
                  <p v-if="(item.salida.descripcion || '').trim()" class="font-medium text-gray-700 text-sm mt-1.5 break-words">{{ item.salida.descripcion }}</p>
                  <p class="text-xs text-gray-500 font-medium mt-1">{{ formatDate(item.salida.fecha) }}</p>
                </template>
                <!-- Movimiento normal -->
                <template v-else>
                  <div class="flex items-center gap-2 flex-wrap mb-1.5 sm:mb-2">
                    <span
                      :class="[
                        'px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs font-bold shrink-0',
                        item.movimiento.forma_pago === 'efectivo'
                          ? 'bg-green-100 text-green-800 border-2 border-green-400'
                          : 'bg-blue-100 text-blue-800 border-2 border-blue-400'
                      ]"
                    >
                      {{ item.movimiento.forma_pago === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia' }}
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="font-semibold text-gray-900 text-sm sm:text-base leading-tight break-words">
                      {{ obtenerDescripcionLimpia(item.movimiento) }}
                    </p>
                    <p class="text-xs text-gray-500 font-medium">{{ formatDate(item.movimiento.fecha) }}</p>
                  </div>
                </template>
              </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-2 flex-shrink-0 sm:flex-shrink-0">
              <span
                v-if="item.tipo === 'traslado'"
                class="text-base sm:text-lg font-extrabold tabular-nums text-teal-700"
              >
                ${{ formatMoney(item.salida.monto) }}
              </span>
              <span
                v-else
                :class="[
                  'text-base sm:text-lg font-extrabold tabular-nums',
                  item.movimiento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ item.movimiento.tipo === 'entrada' ? '+' : '−' }}${{ formatMoney(item.movimiento.monto) }}
              </span>
              <div class="flex items-center gap-1 sm:gap-2">
                <button
                  v-if="puedeGestionarCuotas"
                  @click="abrirModalEditarMovimiento(item.tipo === 'traslado' ? item.salida : item.movimiento)"
                  class="p-1.5 sm:p-2 hover:bg-teal-50 rounded-lg text-teal-500 hover:text-teal-600 transition-colors"
                  :title="item.tipo === 'traslado' ? 'Editar traslado' : 'Editar movimiento'"
                >
                  <PencilIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  v-if="puedeGestionarCuotas"
                  @click="confirmarEliminarMovimiento(item.tipo === 'traslado' ? item.salida : item.movimiento)"
                  class="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                  :title="item.tipo === 'traslado' ? 'Eliminar traslado' : 'Eliminar movimiento'"
                >
                  <TrashIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

    <!-- Modal confirmar eliminar movimiento -->
    <ModalWrapper
      :show="!!movimientoAEliminar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6"
      card-max-width="24rem"
      @close="movimientoAEliminar = null"
    >
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ movimientoAEliminar && esParteDeTraslado(movimientoAEliminar) ? '¿Eliminar traslado?' : '¿Eliminar movimiento?' }}</h3>
        <p class="text-gray-600 text-sm mb-4">{{ movimientoAEliminar && esParteDeTraslado(movimientoAEliminar) ? 'Traslado entre formas de pago' : (movimientoAEliminar?.descripcion || (movimientoAEliminar?.tipo === 'entrada' ? 'Entrada' : 'Salida')) }} — ${{ formatMoney(movimientoAEliminar?.monto) }}</p>
        <div class="flex gap-3">
          <button @click="movimientoAEliminar = null" class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button @click="eliminarMovimientoConfirmado" :disabled="eliminandoMovimiento" class="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50">
            {{ eliminandoMovimiento ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal nuevo movimiento -->
    <ModalWrapper
      :show="modalMovimientoAbierto"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
      card-max-width="32rem"
      @close="cerrarModalMovimiento"
    >
            <!-- Header -->
            <div class="p-6 text-white bg-gradient-to-br from-teal-500 to-emerald-600">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">{{ editandoMovimiento ? 'Editar Movimiento' : 'Nuevo Movimiento' }}</h3>
                <button @click="cerrarModalMovimiento" class="p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <XMarkIcon class="w-6 h-6" />
                </button>
              </div>
              <p class="text-white/90 text-sm mt-1">{{ editandoMovimiento ? 'Modifica los datos del movimiento' : 'Registra transferencias, ingresos o egresos' }}</p>
            </div>

            <!-- Contenido -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Tipo de movimiento (solo si no está editando) -->
              <div v-if="!editandoMovimiento">
                <label class="block text-sm font-semibold text-gray-700 mb-3">Tipo de movimiento</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    @click="tipoMovimiento = 'transferencia'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all', tipoMovimiento === 'transferencia' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <ArrowPathIcon class="w-5 h-5 mx-auto mb-1" />
                    Transferencia
                  </button>
                  <button
                    @click="tipoMovimiento = 'ingreso'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all', tipoMovimiento === 'ingreso' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <BanknotesIcon class="w-5 h-5 mx-auto mb-1" />
                    Ingreso
                  </button>
                  <button
                    @click="tipoMovimiento = 'egreso'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all', tipoMovimiento === 'egreso' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <ArrowDownTrayIcon class="w-5 h-5 mx-auto mb-1 rotate-180" />
                    Egreso
                  </button>
                </div>
              </div>
              
              <!-- Información del movimiento (solo si está editando) -->
              <div v-if="editandoMovimiento" class="rounded-xl p-4 bg-gray-50 border-2 border-gray-200">
                <p class="text-sm font-semibold text-gray-700 mb-1">Movimiento actual:</p>
                <p class="text-sm text-gray-600">
                  <span :class="movimientoEditando?.tipo === 'entrada' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                    {{ movimientoEditando?.tipo === 'entrada' ? 'Entrada' : 'Salida' }}
                  </span>
                  · 
                  <span :class="movimientoEditando?.forma_pago === 'efectivo' ? 'text-green-600' : 'text-blue-600'">
                    {{ movimientoEditando?.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia' }}
                  </span>
                  · ${{ formatMoney(movimientoEditando?.monto) }}
                </p>
              </div>

              <!-- Transferencia entre formas de pago (solo si no está editando) -->
              <div v-if="!editandoMovimiento && tipoMovimiento === 'transferencia'">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Dirección de transferencia</label>
                <div class="space-y-2">
                  <button
                    @click="formMovimiento.direccionTransferencia = 'efectivo_transferencia'"
                    :class="['w-full px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.direccionTransferencia === 'efectivo_transferencia' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <BanknotesIcon class="w-5 h-5" />
                    <span>Efectivo</span>
                    <ArrowRightIcon class="w-4 h-4" />
                    <ArrowPathIcon class="w-5 h-5" />
                    <span>Transferencia</span>
                  </button>
                  <button
                    @click="formMovimiento.direccionTransferencia = 'transferencia_efectivo'"
                    :class="['w-full px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.direccionTransferencia === 'transferencia_efectivo' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <ArrowPathIcon class="w-5 h-5" />
                    <span>Transferencia</span>
                    <ArrowRightIcon class="w-4 h-4" />
                    <BanknotesIcon class="w-5 h-5" />
                    <span>Efectivo</span>
                  </button>
                </div>
              </div>

              <!-- Forma de pago (para ingresos/egresos o cuando está editando) -->
              <div v-if="editandoMovimiento || tipoMovimiento === 'ingreso' || tipoMovimiento === 'egreso'">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Forma de pago</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="formMovimiento.formaPago = 'efectivo'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.formaPago === 'efectivo' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <BanknotesIcon class="w-5 h-5" />
                    Efectivo
                  </button>
                  <button
                    @click="formMovimiento.formaPago = 'transferencia'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.formaPago === 'transferencia' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <ArrowPathIcon class="w-5 h-5" />
                    Transferencia
                  </button>
                </div>
              </div>

              <!-- Origen del egreso: de dónde sale el dinero (solo para egresos) -->
              <div v-if="(editandoMovimiento && movimientoEditando?.tipo === 'salida') || (!editandoMovimiento && tipoMovimiento === 'egreso')">
                <label class="block text-sm font-semibold text-gray-700 mb-2">¿De dónde sale el dinero?</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="formMovimiento.origenEgreso = 'recaudado'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.origenEgreso === 'recaudado' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <BanknotesIcon class="w-5 h-5" />
                    Recaudado
                  </button>
                  <button
                    @click="formMovimiento.origenEgreso = 'utilidades'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.origenEgreso === 'utilidades' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <span class="text-lg">📊</span>
                    Utilidades
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Se descontará del indicador correspondiente en el desglose</p>
              </div>

              <!-- Destino del ingreso: a dónde va el dinero (solo para ingresos) -->
              <div v-if="(editandoMovimiento && movimientoEditando?.tipo === 'entrada') || (!editandoMovimiento && tipoMovimiento === 'ingreso')">
                <label class="block text-sm font-semibold text-gray-700 mb-2">¿A dónde va el dinero?</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="formMovimiento.destinoIngreso = 'recaudado'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.destinoIngreso === 'recaudado' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <BanknotesIcon class="w-5 h-5" />
                    Recaudado
                  </button>
                  <button
                    @click="formMovimiento.destinoIngreso = 'utilidades'"
                    :class="['px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2', formMovimiento.destinoIngreso === 'utilidades' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
                  >
                    <span class="text-lg">📊</span>
                    Utilidades
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Se sumará al indicador correspondiente en el detalle de la natillera</p>
              </div>

              <!-- Monto -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Monto <span class="text-red-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    v-model="montoFormateado"
                    type="text"
                    @input="handleMontoInput"
                    @blur="handleMontoBlur"
                    placeholder="0"
                    class="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-lg font-semibold"
                    :class="erroresFormulario.monto ? 'border-red-500' : ''"
                  />
                </div>
                <p v-if="erroresFormulario.monto" class="text-red-500 text-xs mt-1">{{ erroresFormulario.monto }}</p>
              </div>

              <!-- Descripción -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea
                  v-model.trim="formMovimiento.descripcion"
                  rows="3"
                  placeholder="Ej: Transferencia para pagar gastos, Depósito adicional, etc."
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm resize-none"
                ></textarea>
              </div>

              <!-- Fecha -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                <input
                  v-model="formMovimiento.fecha"
                  type="date"
                  class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-200 flex gap-3">
              <button
                @click="cerrarModalMovimiento"
                :disabled="guardandoMovimiento"
                class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                @click="guardarMovimiento"
                :disabled="guardandoMovimiento"
                class="flex-1 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50"
              >
                {{ guardandoMovimiento ? (editandoMovimiento ? 'Actualizando...' : 'Guardando...') : (editandoMovimiento ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
    </ModalWrapper>

      <!-- Simulador de cierre -->
      <div v-show="tabActiva === 'simulador'">
        <div class="space-y-6">
          <div class="bg-white rounded-2xl p-5 sm:p-6 border-2 border-teal-200 shadow-sm">
            <h2 class="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <CalculatorIcon class="w-5 h-5 text-teal-600" />
              Simulador de cierre
            </h2>
            <p class="text-sm text-gray-500 mb-4">Valores estimados por socio a la fecha, sin ejecutar el cierre definitivo.</p>
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <label class="text-sm font-semibold text-gray-700">Fecha de corte:</label>
              <input
                v-model="simuladorFechaCorte"
                type="date"
                class="px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500 text-sm"
              />
              <button
                type="button"
                @click="ejecutarSimulador"
                :disabled="simuladorLoading"
                class="px-4 py-2 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
              >
                {{ simuladorLoading ? 'Calculando...' : 'Calcular' }}
              </button>
            </div>
            <div v-if="simuladorError" class="text-sm text-red-600 mb-4">{{ simuladorError }}            </div>
          </div>
          <div v-if="simuladorSocios.length > 0" class="space-y-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p class="text-sm font-semibold text-gray-700">Resumen por socio ({{ simuladorSocios.length }})</p>
              <button
                type="button"
                @click="exportarSimuladorAExcel"
                :disabled="exportandoSimulador"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors text-sm"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
                {{ exportandoSimulador ? 'Exportando...' : 'Exportar a Excel' }}
              </button>
            </div>
            
            <!-- Total General -->
            <div class="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-4 border-2 border-teal-200 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-teal-800 mb-1">Total a entregar</p>
                  <p class="text-xs text-teal-600">Dinero total que se debe tener disponible</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl sm:text-3xl font-extrabold text-teal-700 tabular-nums">
                    ${{ formatMoney(totalSimuladorGeneral) }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Vista Desktop: Tabla -->
            <div class="hidden sm:block overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3">Socio</th>
                    <th class="px-4 py-3 text-right">Ahorro</th>
                    <th class="px-4 py-3 text-right">Utilidades</th>
                    <th class="px-4 py-3 text-right">Total (Antes de desc.)</th>
                    <th class="px-4 py-3 text-right text-red-600">Descuentos</th>
                    <th class="px-4 py-3 text-right font-bold">A Entregar</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <template v-for="(dato, idx) in simuladorSociosFiltrados" :key="dato.socio?.id || dato.socioNatillera?.id || idx">
                    <tr class="hover:bg-gray-50/50 transition-colors">
                      <td class="px-4 py-3">
                        <button
                          type="button"
                          @click="simuladorDetalleId = simuladorDetalleId === (dato.socioNatillera?.id || dato.socio?.id) ? null : (dato.socioNatillera?.id || dato.socio?.id)"
                          class="flex items-center gap-2 text-left w-full hover:text-teal-600 transition-colors focus:outline-none"
                        >
                          <ChevronRightIcon :class="['w-4 h-4 text-gray-400 transition-transform flex-shrink-0', simuladorDetalleId === (dato.socioNatillera?.id || dato.socio?.id) && 'rotate-90']" />
                          <div>
                            <span class="font-bold text-gray-800">{{ dato.socio?.nombre || 'Socio' }}</span>
                            <span v-if="dato.socio?.telefono" class="block text-xs text-gray-500 font-normal mt-0.5">{{ dato.socio.telefono }}</span>
                          </div>
                        </button>
                      </td>
                      <td class="px-4 py-3 text-right font-medium text-sky-600 tabular-nums">${{ formatMoney(dato.ahorro) }}</td>
                      <td class="px-4 py-3 text-right font-medium text-purple-600 tabular-nums">${{ formatMoney(dato.utilidadesTotal) }}</td>
                      <td class="px-4 py-3 text-right font-medium text-gray-600 tabular-nums">${{ formatMoney(dato.totalAEntregar) }}</td>
                      <td class="px-4 py-3 text-right font-medium text-red-600 tabular-nums">${{ formatMoney(dato.descuentos) }}</td>
                      <td class="px-4 py-3 text-right">
                        <div class="tabular-nums font-bold" :class="dato.totalFinal >= 0 ? 'text-teal-600' : ''">
                          ${{ formatMoney(dato.totalFinal >= 0 ? dato.totalFinal : 0) }}
                        </div>
                        <div v-if="dato.totalFinal < 0" class="text-xs font-semibold text-red-600 mt-0.5">
                          Debe: ${{ formatMoney(-dato.totalFinal) }}
                        </div>
                      </td>
                    </tr>
                    <tr v-show="simuladorDetalleId === (dato.socioNatillera?.id || dato.socio?.id)" class="bg-gray-50/80">
                      <td colspan="6" class="px-4 py-3 border-t border-gray-100/50">
                        <div class="pl-6 space-y-3 text-xs">
                          <div v-if="dato.descuentos > 0 && dato.descuentosDesglose" class="flex flex-wrap items-center gap-4">
                            <span class="font-semibold text-red-600">Detalle del descuento (sanción):</span>
                            <span v-if="(dato.descuentosDesglose.prestamosPendientes || 0) > 0" class="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                              <span class="text-red-700">Préstamos pendientes:</span>
                              <span class="font-bold text-red-800">${{ formatMoney(dato.descuentosDesglose.prestamosPendientes || 0) }}</span>
                            </span>
                            <span v-if="(dato.descuentosDesglose.cuotasSinPagar || 0) > 0" class="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                              <span class="text-red-700">Cuotas sin pagar (en mora):</span>
                              <span class="font-bold text-red-800">${{ formatMoney(dato.descuentosDesglose.cuotasSinPagar || 0) }}</span>
                            </span>
                          </div>
                          <div class="flex items-center gap-4 flex-wrap">
                            <span class="font-semibold text-gray-600">Desglose de utilidades:</span>
                            <template v-for="tipo in TIPOS_UTILIDAD_SIMULADOR" :key="tipo">
                              <span v-show="(dato.utilidadesPorConcepto[tipo] || 0) > 0" class="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-gray-200">
                                <span class="text-gray-500">{{ LABELS_UTILIDAD_SIMULADOR[tipo] || tipo }}:</span>
                                <span class="font-bold text-gray-800">${{ formatMoney(dato.utilidadesPorConcepto[tipo] || 0) }}</span>
                              </span>
                            </template>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <!-- Vista Mobile: Cards -->
            <div class="block sm:hidden space-y-3">
              <div
                v-for="(dato, idx) in simuladorSociosFiltrados"
                :key="'m-'+(dato.socio?.id || dato.socioNatillera?.id || idx)"
                class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200"
                :class="simuladorDetalleId === (dato.socioNatillera?.id || dato.socio?.id) ? 'ring-2 ring-teal-500/20 border-teal-200' : ''"
              >
                <!-- Cabecera de la Card (Siempre visible) -->
                <button
                  type="button"
                  @click="simuladorDetalleId = simuladorDetalleId === (dato.socioNatillera?.id || dato.socio?.id) ? null : (dato.socioNatillera?.id || dato.socio?.id)"
                  class="w-full text-left p-3.5 bg-gray-50/50 hover:bg-teal-50/30 transition-colors flex items-center justify-between gap-3 border-b border-gray-100"
                >
                  <div class="min-w-0">
                    <span class="font-bold text-gray-800 text-sm truncate block">{{ dato.socio?.nombre || 'Socio' }}</span>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[11px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">Ah: ${{ formatMoney(dato.ahorro) }}</span>
                      <span class="text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Ut: ${{ formatMoney(dato.utilidadesTotal) }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end flex-shrink-0">
                    <span class="text-xs text-gray-500 mb-0.5">A entregar</span>
                    <span class="font-bold text-[15px]" :class="dato.totalFinal >= 0 ? 'text-teal-600' : ''">
                      ${{ formatMoney(dato.totalFinal >= 0 ? dato.totalFinal : 0) }}
                    </span>
                    <span v-if="dato.totalFinal < 0" class="text-[11px] font-semibold text-red-600 mt-0.5">
                      Debe: ${{ formatMoney(-dato.totalFinal) }}
                    </span>
                  </div>
                </button>
                
                <!-- Cuerpo Expandible (Detalle) -->
                <div
                  v-show="simuladorDetalleId === (dato.socioNatillera?.id || dato.socio?.id)"
                  class="p-3.5 space-y-3"
                >
                  <!-- Resumen Financiero Completo -->
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span class="text-gray-500 block mb-0.5">Total (antes desc.)</span>
                      <span class="font-semibold text-gray-700">${{ formatMoney(dato.totalAEntregar) }}</span>
                    </div>
                    <div class="bg-red-50 p-2 rounded-lg border border-red-100">
                      <span class="text-red-500/80 block mb-0.5">Descuentos</span>
                      <span class="font-semibold text-red-600">-${{ formatMoney(dato.descuentos) }}</span>
                    </div>
                  </div>

                  <!-- Detalle del descuento (sanción) cuando hay descuento -->
                  <div v-if="dato.descuentos > 0 && dato.descuentosDesglose" class="space-y-2">
                    <p class="text-[11px] font-bold text-red-600 uppercase tracking-wider">Detalle del descuento (sanción)</p>
                    <div class="grid grid-cols-2 gap-2">
                      <div v-if="(dato.descuentosDesglose.prestamosPendientes || 0) > 0" class="bg-red-50 p-2 rounded-lg border border-red-200">
                        <span class="text-[11px] text-red-700 block mb-0.5">Préstamos pendientes</span>
                        <span class="font-semibold text-red-800 text-[11px]">${{ formatMoney(dato.descuentosDesglose.prestamosPendientes || 0) }}</span>
                      </div>
                      <div v-if="(dato.descuentosDesglose.cuotasSinPagar || 0) > 0" class="bg-red-50 p-2 rounded-lg border border-red-200">
                        <span class="text-[11px] text-red-700 block mb-0.5">Cuotas sin pagar (en mora)</span>
                        <span class="font-semibold text-red-800 text-[11px]">${{ formatMoney(dato.descuentosDesglose.cuotasSinPagar || 0) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Desglose de utilidades -->
                  <div v-if="dato.utilidadesPorConcepto && Object.keys(dato.utilidadesPorConcepto).some(t => dato.utilidadesPorConcepto[t] > 0)">
                    <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Desglose de Utilidades</p>
                    <div class="grid grid-cols-2 gap-2">
                      <template v-for="tipo in TIPOS_UTILIDAD_SIMULADOR" :key="tipo">
                        <div
                          v-show="(dato.utilidadesPorConcepto[tipo] || 0) > 0"
                          class="flex justify-between items-center bg-purple-50/50 px-2 py-1.5 rounded border border-purple-100/50"
                        >
                          <span class="text-[11px] text-gray-600">{{ LABELS_UTILIDAD_SIMULADOR[tipo] || tipo }}</span>
                          <span class="font-semibold text-purple-700 text-[11px]">${{ formatMoney(dato.utilidadesPorConcepto[tipo] || 0) }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNatillerasStore } from '../../stores/natilleras'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import BackButton from '../../components/BackButton.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import LoadingScreen from '../../components/LoadingScreen.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
import { calcularCierreNatillera, TIPOS_UTILIDAD as TIPOS_UTILIDAD_SIMULADOR } from '../../composables/useCierreNatillera'
import {
  CalculatorIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ListBulletIcon,
  TrashIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import * as XLSX from 'xlsx-js-style'

const route = useRoute()
const id = computed(() => route.params.id)
const natillerasStore = useNatillerasStore()
const colaboradoresStore = useColaboradoresStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(true)
const natillera = ref(null)
const estadisticas = ref({
  recaudadoCompletoEfectivo: 0,
  recaudadoCompletoTransferencia: 0,
  totalDesembolsadoEfectivo: 0,
  totalDesembolsadoTransferencia: 0
})
const movimientos = ref([])
const detalleItems = ref([])
const CATEGORIAS_DETALLE = [
  { value: 'cuota', label: 'Cuota' },
  { value: 'cuota_prestamo', label: 'Cuota préstamo' },
  { value: 'sancion', label: 'Sanción' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'gmf_4x1000', label: '4x1000' },
  { value: 'prestamo', label: 'Préstamo' },
  { value: 'interes_anticipado', label: 'Utilidad por interés anticipado' },
  { value: 'liquidacion_salida', label: 'Liquidación por salida' },
  { value: 'premio_rifa', label: 'Premio rifa' }
]
const filtroDetalleCategorias = ref([]) // Array: vacío = todas, si tiene valores = filtrar por esas
const filtroDetalleFormaPago = ref('todos')
const filtroDetalleBusqueda = ref('')
const filtroDetalleMes = ref('') // '' = todos los meses; 'YYYY-MM' = mes específico (solo meses en la natillera)
/** Orden del detalle: array de claves en orden de prioridad (primer criterio desempata primero). */
const ordenarDetalleCriterios = ref(['socio'])
const OPCIONES_ORDENAR = [
  { value: 'socio', label: 'Socio' },
  { value: 'concepto', label: 'Concepto' },
  { value: 'monto', label: 'Monto' },
  { value: 'periodo', label: 'Período' }
]

const etiquetaOrdenDetalle = computed(() => {
  const c = ordenarDetalleCriterios.value
  if (!c.length) return 'Socio'
  const labels = c.map(v => OPCIONES_ORDENAR.find(o => o.value === v)?.label || v)
  if (labels.length === 1) return labels[0]
  return labels.join(' → ')
})

function indiceCriterioOrden(value) {
  return ordenarDetalleCriterios.value.indexOf(value)
}

function toggleCriterioOrden(value) {
  const arr = [...ordenarDetalleCriterios.value]
  const idx = arr.indexOf(value)
  if (idx >= 0) {
    if (arr.length <= 1) return
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  ordenarDetalleCriterios.value = arr
}

function moverCriterioOrden(value, delta) {
  const arr = [...ordenarDetalleCriterios.value]
  const idx = arr.indexOf(value)
  if (idx < 0) return
  const ni = idx + delta
  if (ni < 0 || ni >= arr.length) return
  ;[arr[idx], arr[ni]] = [arr[ni], arr[idx]]
  ordenarDetalleCriterios.value = arr
}

function compararDetallePorCriterio(a, b, criterio) {
  if (criterio === 'socio') return (a.socio || '—').localeCompare(b.socio || '—', 'es')
  if (criterio === 'concepto') return (a.concepto || '').localeCompare(b.concepto || '', 'es')
  if (criterio === 'monto') return (parseFloat(b.monto) || 0) - (parseFloat(a.monto) || 0)
  if (criterio === 'periodo') {
    const keyA = `${a.anio || 0}-${String(a.mes || 0).padStart(2, '0')}`
    const keyB = `${b.anio || 0}-${String(b.mes || 0).padStart(2, '0')}`
    return keyB.localeCompare(keyA)
  }
  return 0
}
const efectivoContado = ref(0)
const transferenciaContada = ref(0)

const modalDesgloseFormaPago = ref(null) // ya no se usa; se mantiene por compatibilidad con código residual
const tabActiva = ref('totales') // 'totales' | 'simulador'
const simuladorSocios = ref([])
const simuladorSociosFiltrados = ref([])
const simuladorLoading = ref(false)
const simuladorFechaCorte = ref(new Date().toISOString().split('T')[0])
const simuladorError = ref('')
const simuladorDetalleId = ref(null)
const LABELS_UTILIDAD_SIMULADOR = {
  prestamos: 'Préstamos',
  rifas: 'Rifas',
  bingo: 'Bingos',
  venta: 'Ventas',
  evento: 'Eventos',
  otro: 'Otros',
  sanciones: 'Sanciones'
}
async function ejecutarSimulador() {
  simuladorError.value = ''
  simuladorLoading.value = true
  simuladorSocios.value = []
  simuladorSociosFiltrados.value = []
  try {
    const opts = {}
    if (simuladorFechaCorte) opts.fechaCorte = simuladorFechaCorte
    const result = await calcularCierreNatillera(id.value, opts)
    if (result.error) {
      simuladorError.value = result.error
      return
    }
    
    const sociosMapeados = (result.socios || []).map(socio => {
      // Calcular el total a entregar antes de descuentos
      const totalAEntregar = (socio.ahorro || 0) + (socio.utilidadesTotal || 0)
      // El total final es lo que se entrega menos lo que debe
      const totalFinal = totalAEntregar - (socio.descuentos || 0)
      
      return {
        ...socio,
        totalAEntregar,
        totalFinal
      }
    })

    // Ordenar alfabéticamente por el nombre del socio
    const sociosOrdenados = sociosMapeados.sort((a, b) => {
      const nombreA = (a.socio?.nombre || '').toLowerCase()
      const nombreB = (b.socio?.nombre || '').toLowerCase()
      return nombreA.localeCompare(nombreB)
    })

    simuladorSocios.value = sociosOrdenados
    simuladorSociosFiltrados.value = sociosOrdenados
  } finally {
    simuladorLoading.value = false
  }
}

const dropdownCategoriasAbierto = ref(false)
const dropdownCategoriasRef = ref(null)
const dropdownOrdenarAbierto = ref(false)
const dropdownOrdenarRef = ref(null)
const movimientoAEliminar = ref(null)
const movimientoAEliminarOpen = computed(() => !!movimientoAEliminar.value)
useBodyScrollLock(movimientoAEliminarOpen)
const eliminandoMovimiento = ref(false)
const exportando = ref(false)
const exportandoSimulador = ref(false)

// Modal de nuevo movimiento
const modalMovimientoAbierto = ref(false)
useBodyScrollLock(modalMovimientoAbierto)
const editandoMovimiento = ref(false) // true si estamos editando, false si estamos creando
const movimientoEditando = ref(null) // Movimiento que se está editando
const tipoMovimiento = ref('transferencia') // 'transferencia' | 'ingreso' | 'egreso'
const formMovimiento = ref({
  direccionTransferencia: 'efectivo_transferencia', // 'efectivo_transferencia' | 'transferencia_efectivo'
  formaPago: 'efectivo', // 'efectivo' | 'transferencia'
  origenEgreso: 'recaudado', // 'recaudado' | 'utilidades' — solo para egresos
  destinoIngreso: 'recaudado', // 'recaudado' | 'utilidades' — solo para ingresos
  monto: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0]
})
const guardandoMovimiento = ref(false)
const erroresFormulario = ref({})
const montoFormateado = ref('')

// Detalle por concepto - colapsable y paginación
const detalleExpandido = ref(false)
const paginaActual = ref(1)
const itemsPorPagina = ref(20)

// Permisos
// Verificar si el usuario es superusuario (raigo.16@gmail.com)
const esSuperUsuario = computed(() => {
  if (!authStore.user) return false
  const email = (authStore.userEmail || '').toLowerCase().trim()
  return email === 'raigo.16@gmail.com'
})

const esAdmin = computed(() => {
  if (!authStore.user || !natillera.value) return false
  return (natillera.value?.admin_id && authStore.user?.id === natillera.value?.admin_id) || esSuperUsuario.value
})
const misPermisos = ref(null)
const puedeGestionarCuotas = computed(() => {
  if (esAdmin.value) return true
  if (esSuperUsuario.value) return true // Superusuario tiene todos los permisos
  return misPermisos.value?.permisos?.gestionar_cuotas === true
})

// Totales esperados: calculados desde detalleItems (fuente fiable) + movimientos
// detalleItems incluye: cuotas, sanciones, actividades, GMF 4×1000 (historial transferencias), préstamos (negativo)
const recaudadoEfectivo = computed(() => {
  return detalleItems.value.filter(i => (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const recaudadoTransferencia = computed(() => {
  return detalleItems.value.filter(i => (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const recaudadoGmf4x1000 = computed(() => {
  return detalleItems.value
    .filter(i => i.tipo === 'gmf_4x1000' && (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0)
    .reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
// Desglose: Recaudado (cuotas) vs Utilidad (sanciones + actividades)
const recaudadoCuotasEfectivo = computed(() => {
  return detalleItems.value.filter(i => i.tipo === 'cuota' && (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const recaudadoCuotasTransferencia = computed(() => {
  return detalleItems.value.filter(i => i.tipo === 'cuota' && (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const recaudadoCuotasPrestamoEfectivo = computed(() => {
  return detalleItems.value.filter(i => i.tipo === 'cuota_prestamo' && (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const recaudadoCuotasPrestamoTransferencia = computed(() => {
  return detalleItems.value.filter(i => i.tipo === 'cuota_prestamo' && (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const utilidadEfectivo = computed(() => {
  return detalleItems.value.filter(i => (i.tipo === 'sancion' || i.tipo === 'actividad') && (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const utilidadTransferencia = computed(() => {
  return detalleItems.value.filter(i => (i.tipo === 'sancion' || i.tipo === 'actividad') && (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
// Premios rifa se restan del recaudo (están en detalleItems como tipo 'premio_rifa')
const premiosEfectivo = computed(() => {
  return Math.abs(detalleItems.value.filter(i => i.tipo === 'premio_rifa' && (i.forma_pago || 'efectivo') === 'efectivo').reduce((s, i) => s + parseFloat(i.monto || 0), 0))
})
const premiosTransferencia = computed(() => {
  return Math.abs(detalleItems.value.filter(i => i.tipo === 'premio_rifa' && (i.forma_pago || 'efectivo') === 'transferencia').reduce((s, i) => s + parseFloat(i.monto || 0), 0))
})
const prestamosEfectivo = computed(() => {
  return Math.abs(detalleItems.value.filter(i => i.tipo === 'prestamo' && (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) < 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0))
})
const prestamosTransferencia = computed(() => {
  return Math.abs(detalleItems.value.filter(i => i.tipo === 'prestamo' && (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) < 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0))
})
// Utilidad por interés anticipado (préstamos): suma a la forma de pago correspondiente
const utilidadInteresAnticipadoEfectivo = computed(() => {
  return detalleItems.value.filter(i => i.tipo === 'interes_anticipado' && (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const utilidadInteresAnticipadoTransferencia = computed(() => {
  return detalleItems.value.filter(i => i.tipo === 'interes_anticipado' && (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
// Movimientos sin premios rifa (el premio ya se resta del recaudo vía detalleItems)
function esPremioRifaMovimiento(m) {
  if (m.tipo !== 'salida') return false
  const d = (m.descripcion ?? '').toString().toLowerCase().trim()
  return d.includes('premio rifa') || d.includes('rifa liquidada') || (d.includes('premio') && d.includes('rifa'))
}
/** Entradas "Recaudo … liquidada" van en detalle por concepto; no duplicar en el neto de movimientos */
function esEntradaRecaudoLiquidadaEnDetalle(m) {
  if (m.tipo !== 'entrada') return false
  const d = (m.descripcion ?? '').toString().toLowerCase().trim()
  return d.includes('recaudo actividad liquidada') || d.includes('recaudo rifa liquidada')
}
const movimientosSinPremios = computed(() => {
  return movimientos.value.filter(m => !esPremioRifaMovimiento(m) && !esEntradaRecaudoLiquidadaEnDetalle(m))
})
// Egresos clasificados por origen (solo salidas con origen_egreso definido)
const egresosRecaudadoEfectivo = computed(() => {
  return movimientosSinPremios.value
    .filter(m => m.tipo === 'salida' && m.forma_pago === 'efectivo' && m.origen_egreso === 'recaudado')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const egresosRecaudadoTransferencia = computed(() => {
  return movimientosSinPremios.value
    .filter(m => m.tipo === 'salida' && m.forma_pago === 'transferencia' && m.origen_egreso === 'recaudado')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const egresosUtilidadesEfectivo = computed(() => {
  return movimientosSinPremios.value
    .filter(m => m.tipo === 'salida' && m.forma_pago === 'efectivo' && m.origen_egreso === 'utilidades')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const egresosUtilidadesTransferencia = computed(() => {
  return movimientosSinPremios.value
    .filter(m => m.tipo === 'salida' && m.forma_pago === 'transferencia' && m.origen_egreso === 'utilidades')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
// Ingresos clasificados por destino (solo entradas con destino_ingreso definido)
const ingresosRecaudadoEfectivo = computed(() => {
  return movimientos.value
    .filter(m => m.tipo === 'entrada' && m.forma_pago === 'efectivo' && m.destino_ingreso === 'recaudado')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const ingresosRecaudadoTransferencia = computed(() => {
  return movimientos.value
    .filter(m => m.tipo === 'entrada' && m.forma_pago === 'transferencia' && m.destino_ingreso === 'recaudado')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const ingresosUtilidadesEfectivo = computed(() => {
  return movimientos.value
    .filter(m => m.tipo === 'entrada' && m.forma_pago === 'efectivo' && m.destino_ingreso === 'utilidades')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const ingresosUtilidadesTransferencia = computed(() => {
  return movimientos.value
    .filter(m => m.tipo === 'entrada' && m.forma_pago === 'transferencia' && m.destino_ingreso === 'utilidades')
    .reduce((s, m) => s + parseFloat(m.monto || 0), 0)
})
const movimientosEfectivoNeto = computed(() => {
  const entradas = movimientosSinPremios.value.filter(m => m.forma_pago === 'efectivo' && m.tipo === 'entrada').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
  const salidas = movimientosSinPremios.value.filter(m => m.forma_pago === 'efectivo' && m.tipo === 'salida').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
  return entradas - salidas
})
const movimientosTransferenciaNeto = computed(() => {
  const entradas = movimientosSinPremios.value.filter(m => m.forma_pago === 'transferencia' && m.tipo === 'entrada').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
  const salidas = movimientosSinPremios.value.filter(m => m.forma_pago === 'transferencia' && m.tipo === 'salida').reduce((s, m) => s + parseFloat(m.monto || 0), 0)
  return entradas - salidas
})

const totalEsperadoEfectivo = computed(() => {
  return Math.max(0, recaudadoEfectivo.value - prestamosEfectivo.value - premiosEfectivo.value) + movimientosEfectivoNeto.value
})
const totalEsperadoTransferencia = computed(() => {
  return Math.max(0, recaudadoTransferencia.value - prestamosTransferencia.value - premiosTransferencia.value) + movimientosTransferenciaNeto.value
})
const totalEsperadoGeneral = computed(() => {
  return totalEsperadoEfectivo.value + totalEsperadoTransferencia.value
})

// Log del cálculo de totales generales y valor de cada concepto (consola del navegador)
function logCalculoTotalesGenerales() {
  const fmt = (n) => (parseFloat(n) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  console.group('📊 Totales generales – Cálculo por concepto')
  console.log('--- EFECTIVO ---')
  console.log('  Recaudado (cuotas + cuotas préstamos + sanciones + actividades):', fmt(recaudadoEfectivo.value))
  console.log('  − Préstamos entregados:', fmt(prestamosEfectivo.value))
  console.log('  − Premios rifa:', fmt(premiosEfectivo.value))
  console.log('  Recaudado neto (recaudado − préstamos − premios):', fmt(Math.max(0, recaudadoEfectivo.value - prestamosEfectivo.value - premiosEfectivo.value)))
  console.log('  + Movimientos de fondo (neto, sin premios):', fmt(movimientosEfectivoNeto.value))
  console.log('  = Total esperado efectivo:', fmt(totalEsperadoEfectivo.value))
  console.log('--- TRANSFERENCIA ---')
  console.log('  Recaudado (cuotas + cuotas préstamos + sanciones + actividades + GMF 4×1000):', fmt(recaudadoTransferencia.value))
  if (recaudadoGmf4x1000.value > 0) {
    console.log('    de los cuales GMF 4×1000:', fmt(recaudadoGmf4x1000.value))
  }
  console.log('  − Préstamos entregados:', fmt(prestamosTransferencia.value))
  console.log('  − Premios rifa:', fmt(premiosTransferencia.value))
  console.log('  Recaudado neto:', fmt(Math.max(0, recaudadoTransferencia.value - prestamosTransferencia.value - premiosTransferencia.value)))
  console.log('  + Movimientos de fondo (neto, sin premios):', fmt(movimientosTransferenciaNeto.value))
  console.log('  = Total esperado transferencia:', fmt(totalEsperadoTransferencia.value))
  console.log('--- TOTAL ---')
  console.log('  Total esperado (efectivo + transferencia):', fmt(totalEsperadoEfectivo.value + totalEsperadoTransferencia.value))
  console.log('--- DETALLE (cantidad de ítems por tipo) ---')
  const porTipo = {}
  detalleItems.value.forEach(i => { porTipo[i.tipo] = (porTipo[i.tipo] || 0) + 1 })
  console.log(porTipo)
  console.groupEnd()
}

// Diferencias (lo contado - lo esperado): positivo = sobra, negativo = falta
const diferenciaEfectivo = computed(() => (efectivoContado.value || 0) - totalEsperadoEfectivo.value)
const diferenciaTransferencia = computed(() => (transferenciaContada.value || 0) - totalEsperadoTransferencia.value)
const diferenciaTotal = computed(() => diferenciaEfectivo.value + diferenciaTransferencia.value)

const movimientosOrdenados = computed(() => {
  return [...movimientos.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Lista para mostrar: traslados (efectivo ↔ transferencia) en una sola tarjeta, el resto igual
// Detectamos par de traslado por patrón: misma fecha, mismo monto, salida en una forma de pago y entrada en la otra (sin depender de la descripción)
function esParTraslado(m1, m2) {
  if (m1.id === m2.id) return false
  if (m1.tipo === m2.tipo) return false
  if (m1.forma_pago === m2.forma_pago) return false
  const fechaNorm = (s) => normalizarFechaParaConsulta(s)
  if (fechaNorm(m1.fecha) !== fechaNorm(m2.fecha)) return false
  const montos = parseFloat(m1.monto) === parseFloat(m2.monto)
  if (!montos) return false
  return true
}

const movimientosParaLista = computed(() => {
  const list = movimientosOrdenados.value
  const consumidos = new Set()
  const resultado = []
  for (const m of list) {
    if (consumidos.has(m.id)) continue
    const fechaNorm = normalizarFechaParaConsulta(m.fecha)
    const montoNorm = parseFloat(m.monto)
    const par = list.find(
      (m2) =>
        !consumidos.has(m2.id) &&
        esParTraslado(m, m2)
    )
    if (par) {
      consumidos.add(m.id)
      consumidos.add(par.id)
      const salida = m.tipo === 'salida' ? m : par
      const entrada = m.tipo === 'entrada' ? m : par
      resultado.push({ tipo: 'traslado', salida, entrada })
    } else {
      resultado.push({ tipo: 'movimiento', movimiento: m })
    }
  }
  return resultado
})

// Meses que realmente existen en el detalle de la natillera (para el filtro)
const mesesEnNatillera = computed(() => {
  const set = new Set()
  detalleItems.value.forEach(i => {
    if (i.mes != null && i.anio != null) {
      const key = `${i.anio}-${String(i.mes).padStart(2, '0')}`
      set.add(key)
    }
  })
  return Array.from(set)
    .sort((a, b) => b.localeCompare(a)) // más reciente primero
    .map(key => {
      const [anio, mes] = key.split('-')
      return { value: key, label: `${getMesLabel(Number(mes))} ${anio}` }
    })
})

const detalleFiltrado = computed(() => {
  let list = detalleItems.value
  if (filtroDetalleCategorias.value.length > 0) {
    list = list.filter(i => filtroDetalleCategorias.value.includes(i.tipo))
  }
  if (filtroDetalleFormaPago.value !== 'todos') {
    list = list.filter(i => (i.forma_pago || 'efectivo') === filtroDetalleFormaPago.value)
  }
  // Filtro por mes específico (formato YYYY-MM)
  if (filtroDetalleMes.value) {
    const [y, m] = filtroDetalleMes.value.split('-').map(Number)
    list = list.filter(i => Number(i.anio) === y && Number(i.mes) === m)
  }
  const busqueda = filtroDetalleBusqueda.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (busqueda) {
    list = list.filter(i => {
      const concepto = (i.concepto || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      const socio = (i.socio || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      return concepto.includes(busqueda) || socio.includes(busqueda)
    })
  }
  const criterios = ordenarDetalleCriterios.value.length ? ordenarDetalleCriterios.value : ['socio']
  return [...list].sort((a, b) => {
    for (const criterio of criterios) {
      const cmp = compararDetallePorCriterio(a, b, criterio)
      if (cmp !== 0) return cmp
    }
    return 0
  })
})
const totalDetalleFiltrado = computed(() => {
  return detalleFiltrado.value.reduce((s, i) => s + (parseFloat(i.monto) || 0), 0)
})

// Paginación del detalle
const totalPaginas = computed(() => {
  return Math.ceil(detalleFiltrado.value.length / itemsPorPagina.value)
})

const inicioPagina = computed(() => {
  return detalleFiltrado.value.length === 0 ? 0 : (paginaActual.value - 1) * itemsPorPagina.value + 1
})

const finPagina = computed(() => {
  return Math.min(paginaActual.value * itemsPorPagina.value, detalleFiltrado.value.length)
})

const detallePaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return detalleFiltrado.value.slice(inicio, fin)
})

// Resetear a página 1 cuando cambian los filtros
watch([filtroDetalleCategorias, filtroDetalleFormaPago, filtroDetalleBusqueda, filtroDetalleMes, ordenarDetalleCriterios], () => {
  paginaActual.value = 1
}, { deep: true })

// Si el mes seleccionado ya no está en la natillera, quitar filtro
watch(mesesEnNatillera, (nuevos) => {
  if (filtroDetalleMes.value && !nuevos.some(m => m.value === filtroDetalleMes.value)) {
    filtroDetalleMes.value = ''
  }
}, { immediate: true })

// Total a entregar: solo suma lo que se entrega (0 si el socio debe)
const totalSimuladorGeneral = computed(() => {
  return simuladorSociosFiltrados.value.reduce((sum, socio) => {
    const v = parseFloat(socio.totalFinal) || 0
    return sum + (v > 0 ? v : 0)
  }, 0)
})

const etiquetaFiltroCategorias = computed(() => {
  if (filtroDetalleCategorias.value.length === 0) return 'Todas'
  if (filtroDetalleCategorias.value.length === 1) {
    return CATEGORIAS_DETALLE.find(c => c.value === filtroDetalleCategorias.value[0])?.label || '1 categoría'
  }
  return `${filtroDetalleCategorias.value.length} categorías`
})

function toggleFiltroCategoria(value) {
  const arr = [...filtroDetalleCategorias.value]
  const idx = arr.indexOf(value)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  filtroDetalleCategorias.value = arr
}

function getConceptoLabel(tipo) {
  const map = { cuota: 'Cuota', cuota_prestamo: 'Cuota préstamo', sancion: 'Sanción', actividad: 'Actividad', gmf_4x1000: '4x1000', prestamo: 'Préstamo', interes_anticipado: 'Utilidad por interés anticipado', liquidacion_salida: 'Liquidación por salida', premio_rifa: 'Premio rifa' }
  return map[tipo] || tipo
}
function getConceptoClass(tipo, esParcial = false) {
  if (esParcial && (tipo === 'cuota' || tipo === 'cuota_prestamo')) {
    return 'bg-orange-100 text-orange-800 border border-orange-300/60'
  }
  const map = { cuota: 'bg-emerald-100 text-emerald-800', cuota_prestamo: 'bg-teal-100 text-teal-800', sancion: 'bg-red-100 text-red-800', actividad: 'bg-purple-100 text-purple-800', gmf_4x1000: 'bg-sky-100 text-sky-900 border border-sky-300/60', interes_anticipado: 'bg-amber-100 text-amber-800', prestamo: 'bg-blue-100 text-blue-800', liquidacion_salida: 'bg-amber-100 text-amber-800', premio_rifa: 'bg-amber-100 text-amber-800' }
  return map[tipo] || 'bg-gray-100 text-gray-700'
}
function getMesLabel(mes) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return meses[Number(mes) - 1] || mes
}

/** Formato de período para Excel: cuando es mensual solo "Ene 2025"; cuando es quincenal "Ene 2025 - 1ra quincena" */
function formatPeriodoExport(natillera, item) {
  const mes = item.mes
  const anio = item.anio
  if (!mes || !anio) return '—'
  const base = `${getMesLabel(mes)} ${anio}`
  if (item.socioEsMensual === true) return base
  const periodicidad = natillera?.periodicidad || 'mensual'
  if (periodicidad === 'quincenal' && item.quincena != null && (item.quincena === 1 || item.quincena === 2)) {
    return item.quincena === 1 ? `${base} - 1ra quincena` : `${base} - 2da quincena`
  }
  return base
}

/** Período para un movimiento de caja a partir de su fecha; cuando es mensual solo "Ene 2025" */
function formatPeriodoFromFecha(natillera, fechaStr) {
  if (!fechaStr) return '—'
  const d = new Date(fechaStr)
  if (isNaN(d.getTime())) return '—'
  const mes = d.getMonth() + 1
  const anio = d.getFullYear()
  const dia = d.getDate()
  const base = `${getMesLabel(mes)} ${anio}`
  const periodicidad = natillera?.periodicidad || 'mensual'
  if (periodicidad === 'quincenal') {
    const quincena = dia <= 15 ? 1 : 2
    return quincena === 1 ? `${base} - 1ra quincena` : `${base} - 2da quincena`
  }
  return base
}

function formatMoney(val) {
  const n = parseFloat(val) || 0
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

async function exportarAExcel() {
  if (detalleFiltrado.value.length === 0) return
  exportando.value = true
  try {
    const datosExportar = detalleFiltrado.value
      .slice()
      .sort((a, b) => {
        const socioCmp = (a.socio || '—').localeCompare(b.socio || '—', 'es')
        if (socioCmp !== 0) return socioCmp
        const anioA = Number(a.anio) || 9999
        const anioB = Number(b.anio) || 9999
        if (anioA !== anioB) return anioA - anioB
        const mesA = Number(a.mes) || 13
        const mesB = Number(b.mes) || 13
        if (mesA !== mesB) return mesA - mesB
        return (a.concepto || '').localeCompare(b.concepto || '', 'es')
      })
      .map(i => ({
        Concepto: i.concepto,
        Clasificación: getConceptoLabel(i.tipo),
        Socio: i.socio || '—',
        'Fecha mov.': formatDate(i.fecha_movimiento),
        'Forma de pago': i.forma_pago === 'transferencia' ? 'Transferencia' : 'Efectivo',
        Período: formatPeriodoExport(natillera.value, i),
        Monto: parseFloat(i.monto) || 0
      }))

    // Datos para hoja "Movimientos de Caja" (una fila por movimiento, ordenados por fecha desc)
    const idsTraslado = new Set()
    movimientosParaLista.value.forEach(item => {
      if (item.tipo === 'traslado') {
        idsTraslado.add(item.salida.id)
        idsTraslado.add(item.entrada.id)
      }
    })
    const movimientosExport = movimientosOrdenados.value.map(m => {
      const formaPago = m.forma_pago === 'transferencia' ? 'Transferencia' : 'Efectivo'
      const monto = parseFloat(m.monto) || 0
      const montoSigned = m.tipo === 'entrada' ? monto : -monto
      return [
        m.fecha ? formatDate(m.fecha) : '—',
        m.tipo === 'entrada' ? 'Entrada' : 'Salida',
        idsTraslado.has(m.id) ? 'Traslado' : 'Movimiento',
        formaPago,
        obtenerDescripcionLimpia(m),
        montoSigned
      ]
    })
    const movSheetName = 'Movimientos de Caja'
    const movDataRowStartExcel = 6 // En la hoja Movimientos, los datos empiezan en fila 6 (1-based)
    const movDataRowEndExcel = movimientosExport.length === 0 ? 5 : 5 + movimientosExport.length

    const wb = XLSX.utils.book_new()
    const totalRowDetalle = 5 + datosExportar.length + 2 // 0-based: header 5 + data + empty + total
    const rowTotalEfectivoDetalle = totalRowDetalle + 1
    const rowTotalTransferenciaDetalle = totalRowDetalle + 2
    const dataStartRow = 6
    const dataEndRow = dataStartRow + datosExportar.length - 1
    const totalRow = dataEndRow + 2
    const detalleExcelStart = dataStartRow + 1
    const detalleExcelEnd = dataEndRow + 1

    const wsData = [
      [natillera.value?.nombre || 'Natillera'],
      ['Cuadre de Caja - Detalle por concepto'],
      ['Exportado:', new Date().toLocaleString('es-CO')],
      ['Filtros:', `Categoría: ${filtroDetalleCategorias.value.length === 0 ? 'Todas' : filtroDetalleCategorias.value.map(c => getConceptoLabel(c)).join(', ')} | Forma de pago: ${filtroDetalleFormaPago.value === 'todos' ? 'Todas' : filtroDetalleFormaPago.value}${filtroDetalleMes.value ? ` | Mes: ${getMesLabel(Number(filtroDetalleMes.value.split('-')[1]))} ${filtroDetalleMes.value.split('-')[0]}` : ''}`],
      [],
      ['Socio', 'Concepto', 'Clasificación', 'Fecha mov.', 'Forma de pago', 'Período', 'Monto', ''],
      ...datosExportar.map(d => [d.Socio, d.Concepto, d.Clasificación, d['Fecha mov.'], d['Forma de pago'], d.Período, d.Monto, '']),
      [],
      ['TOTAL', '', '', '', '', '', totalDetalleFiltrado.value, ''],
      ['Total Efectivo (detalle)', '', '', '', '', '', 0, ''],
      ['Total Transferencia (detalle)', '', '', '', '', '', 0, '']
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rowTotalTransferenciaDetalle, c: 7 } })
    ws['!freeze'] = { xSplit: 0, ySplit: 6, topLeftCell: 'A7', state: 'frozen' }

    const colorTeal = { rgb: '14B8A6' }
    const colorTealOscuro = { rgb: '0D9488' }
    const colorVerde = { rgb: '10B981' }
    const colorRojo = { rgb: 'DC2626' }
    const colorGrisClaro = { rgb: 'F3F4F6' }
    const colorBlanco = { rgb: 'FFFFFF' }
    const colorBloqueSocioA = { rgb: 'FFFFFF' }
    const colorBloqueSocioB = { rgb: 'F0FDFA' }
    const colorSeparadorSocio = { rgb: '99A3AE' }

    ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
    ws['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
    ws['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }
    ws['A4'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }

    const headerRow = 5
    for (let col = 0; col < 8; col++) {
      const cell = XLSX.utils.encode_cell({ r: headerRow, c: col })
      ws[cell].s = {
        fill: { fgColor: colorTeal, patternType: 'solid' },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
      }
    }

    let socioBlockIndex = 0
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      const idx = row - dataStartRow
      const currentSocio = datosExportar[idx]?.Socio ?? ''
      const nextSocio = idx + 1 < datosExportar.length ? datosExportar[idx + 1]?.Socio : null
      const isFirstOfSocio = idx === 0 || (datosExportar[idx - 1]?.Socio !== currentSocio)
      if (isFirstOfSocio && idx > 0) socioBlockIndex++
      const isLastOfSocio = nextSocio === null || nextSocio !== currentSocio
      const blockColor = socioBlockIndex % 2 === 0 ? colorBloqueSocioA : colorBloqueSocioB
      const monto = datosExportar[idx]?.Monto ?? 0
      for (let col = 0; col < 8; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cell]) continue
        const borderBottom = isLastOfSocio
          ? { style: 'medium', color: colorSeparadorSocio }
          : { style: 'thin', color: { rgb: 'E5E7EB' } }
        const isSocioCol = col === 0
        ws[cell].s = {
          fill: { fgColor: blockColor, patternType: 'solid' },
          font: { sz: 10, bold: isSocioCol, color: col === 6 ? (monto >= 0 ? { rgb: '047857' } : colorRojo) : { rgb: '1F2937' } },
          alignment: { horizontal: col === 6 ? 'right' : 'left', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: borderBottom,
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          }
        }
        if (col === 6) ws[cell].z = monto >= 0 ? '#,##0' : '#,##0;[Red]-#,##0'
      }
    }

    const cellTotalLabel = XLSX.utils.encode_cell({ r: totalRow, c: 0 })
    const cellTotalVal = XLSX.utils.encode_cell({ r: totalRow, c: 6 })
    ws[cellTotalLabel].s = {
      fill: { fgColor: { rgb: 'CCFBF1' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '0F766E' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'medium', color: colorTealOscuro }, bottom: { style: 'medium', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    const formulaTotal = movimientosExport.length > 0
      ? `=SUM(G${detalleExcelStart}:G${detalleExcelEnd})+SUM('${movSheetName}'!F${movDataRowStartExcel}:F${movDataRowEndExcel})`
      : `=SUM(G${detalleExcelStart}:G${detalleExcelEnd})`
    ws[cellTotalVal].f = formulaTotal
    ws[cellTotalVal].t = 'n'
    if (ws[cellTotalVal].v != null) delete ws[cellTotalVal].v
    ws[cellTotalVal].s = {
      fill: { fgColor: { rgb: 'CCFBF1' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '047857' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'medium', color: colorTealOscuro }, bottom: { style: 'medium', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellTotalVal].z = '#,##0;[Red]-#,##0'

    // Totales por forma de pago en detalle + movimientos de caja (SUMIF detalle + SUMIF movimientos)
    const formulaEfectivoDetalle = movimientosExport.length > 0
      ? `=SUMIF(E${detalleExcelStart}:E${detalleExcelEnd},"Efectivo",G${detalleExcelStart}:G${detalleExcelEnd})+SUMIF('${movSheetName}'!D${movDataRowStartExcel}:D${movDataRowEndExcel},"Efectivo",'${movSheetName}'!F${movDataRowStartExcel}:F${movDataRowEndExcel})`
      : `=SUMIF(E${detalleExcelStart}:E${detalleExcelEnd},"Efectivo",G${detalleExcelStart}:G${detalleExcelEnd})`
    const formulaTransferenciaDetalle = movimientosExport.length > 0
      ? `=SUMIF(E${detalleExcelStart}:E${detalleExcelEnd},"Transferencia",G${detalleExcelStart}:G${detalleExcelEnd})+SUMIF('${movSheetName}'!D${movDataRowStartExcel}:D${movDataRowEndExcel},"Transferencia",'${movSheetName}'!F${movDataRowStartExcel}:F${movDataRowEndExcel})`
      : `=SUMIF(E${detalleExcelStart}:E${detalleExcelEnd},"Transferencia",G${detalleExcelStart}:G${detalleExcelEnd})`
    const cellEfectivoDetalleLabel = XLSX.utils.encode_cell({ r: rowTotalEfectivoDetalle, c: 0 })
    const cellEfectivoDetalleVal = XLSX.utils.encode_cell({ r: rowTotalEfectivoDetalle, c: 6 })
    const cellTransferenciaDetalleLabel = XLSX.utils.encode_cell({ r: rowTotalTransferenciaDetalle, c: 0 })
    const cellTransferenciaDetalleVal = XLSX.utils.encode_cell({ r: rowTotalTransferenciaDetalle, c: 6 })
    if (!ws[cellEfectivoDetalleLabel]) ws[cellEfectivoDetalleLabel] = { t: 's', v: 'Total Efectivo (detalle)' }
    ws[cellEfectivoDetalleLabel].s = {
      fill: { fgColor: { rgb: 'D1FAE5' }, patternType: 'solid' },
      font: { bold: true, sz: 11, color: { rgb: '047857' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    if (!ws[cellEfectivoDetalleVal]) ws[cellEfectivoDetalleVal] = { t: 'n', v: 0 }
    ws[cellEfectivoDetalleVal].f = formulaEfectivoDetalle
    ws[cellEfectivoDetalleVal].t = 'n'
    delete ws[cellEfectivoDetalleVal].v
    ws[cellEfectivoDetalleVal].s = {
      fill: { fgColor: { rgb: 'D1FAE5' }, patternType: 'solid' },
      font: { bold: true, sz: 11, color: { rgb: '047857' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellEfectivoDetalleVal].z = '#,##0;[Red]-#,##0'
    if (!ws[cellTransferenciaDetalleLabel]) ws[cellTransferenciaDetalleLabel] = { t: 's', v: 'Total Transferencia (detalle)' }
    ws[cellTransferenciaDetalleLabel].s = {
      fill: { fgColor: { rgb: 'CFFAFE' }, patternType: 'solid' },
      font: { bold: true, sz: 11, color: { rgb: '0369A1' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    if (!ws[cellTransferenciaDetalleVal]) ws[cellTransferenciaDetalleVal] = { t: 'n', v: 0 }
    ws[cellTransferenciaDetalleVal].f = formulaTransferenciaDetalle
    ws[cellTransferenciaDetalleVal].t = 'n'
    delete ws[cellTransferenciaDetalleVal].v
    ws[cellTransferenciaDetalleVal].s = {
      fill: { fgColor: { rgb: 'CFFAFE' }, patternType: 'solid' },
      font: { bold: true, sz: 11, color: { rgb: '0369A1' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellTransferenciaDetalleVal].z = '#,##0;[Red]-#,##0'

    ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 }]
    ws['!merges'] = []

    // Hoja "Movimientos de Caja": entradas/salidas manuales con formato claro
    const movHeaderRow = 0
    const movDataStart = 1
    const movWsData = [
      [natillera.value?.nombre || 'Natillera'],
      ['Movimientos de caja'],
      ['Exportado:', new Date().toLocaleString('es-CO')],
      [],
      ['Fecha', 'Tipo', 'Concepto', 'Forma de pago', 'Descripción', 'Monto'],
      ...movimientosExport
    ]
    const movWs = XLSX.utils.aoa_to_sheet(movWsData)
    const movLastRow = movDataStart + movimientosExport.length + 4 // 0-based: título + subtítulo + exportado + vacío + header + datos
    movWs['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: movLastRow, c: 5 } })
    movWs['!freeze'] = { xSplit: 0, ySplit: 5, topLeftCell: 'A6', state: 'frozen' }
    movWs['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
    movWs['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
    movWs['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }
    for (let col = 0; col < 6; col++) {
      const cell = XLSX.utils.encode_cell({ r: 4, c: col })
      if (movWs[cell]) {
        movWs[cell].s = {
          fill: { fgColor: colorTeal, patternType: 'solid' },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
        }
      }
    }
    for (let r = 0; r < movimientosExport.length; r++) {
      const row = 5 + r
      const monto = movimientosExport[r][5]
      const esIngreso = monto >= 0
      const colorFondo = esIngreso ? { rgb: 'D1FAE5' } : { rgb: 'FEE2E2' } // verde clarito ingresos, rojo clarito egresos
      for (let col = 0; col < 6; col++) {
        const cell = XLSX.utils.encode_cell({ r, c: col })
        if (!movWs[cell]) continue
        movWs[cell].s = {
          fill: { fgColor: colorFondo, patternType: 'solid' },
          font: { sz: 10, color: col === 5 ? (esIngreso ? { rgb: '047857' } : colorRojo) : { rgb: '1F2937' } },
          alignment: { horizontal: col === 5 ? 'right' : 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } }
        }
        if (col === 5) movWs[cell].z = esIngreso ? '#,##0' : '#,##0;[Red]-#,##0'
      }
    }
    movWs['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 32 }, { wch: 14 }]

    XLSX.utils.book_append_sheet(wb, ws, 'Cuadre de Caja')
    if (movimientosExport.length > 0) {
      XLSX.utils.book_append_sheet(wb, movWs, movSheetName)
    }
    const nombreArchivo = `Cuadre_Caja_${(natillera.value?.nombre || 'Natillera').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)
    notificationStore.success('Exportado a Excel correctamente', 'Éxito')
  } catch (e) {
    console.error('Error exportando a Excel:', e)
    notificationStore.error(e.message || 'Error al exportar', 'Error')
  } finally {
    exportando.value = false
  }
}
async function exportarSimuladorAExcel() {
  if (simuladorSociosFiltrados.value.length === 0) return
  exportandoSimulador.value = true
  try {
    const datosExportar = simuladorSociosFiltrados.value.map(d => {
      const totalFinal = parseFloat(d.totalFinal) || 0
      const aEntregar = totalFinal >= 0 ? totalFinal : 0
      const debe = totalFinal < 0 ? -totalFinal : 0
      return {
        Socio: d.socio?.nombre || 'Socio',
        Telefono: d.socio?.telefono || '',
        Ahorro: parseFloat(d.ahorro) || 0,
        Utilidades: parseFloat(d.utilidadesTotal) || 0,
        'Total (Antes de desc.)': parseFloat(d.totalAEntregar) || 0,
        Descuentos: parseFloat(d.descuentos) || 0,
        'A Entregar': aEntregar,
        Debe: debe
      }
    })

    const wb = XLSX.utils.book_new()
    const wsData = [
      [natillera.value?.nombre || 'Natillera'],
      ['Simulador de Cierre'],
      ['Fecha de corte:', simuladorFechaCorte.value],
      ['Exportado:', new Date().toLocaleString('es-CO')],
      [],
      ['Socio', 'Teléfono', 'Ahorro', 'Utilidades', 'Total (Antes de desc.)', 'Descuentos', 'A Entregar', 'Debe'],
      ...datosExportar.map(d => [d.Socio, d.Telefono, d.Ahorro, d.Utilidades, d['Total (Antes de desc.)'], d.Descuentos, d['A Entregar'], d.Debe]),
      [],
      ['TOTAL GENERAL', '', '', '', '', '', totalSimuladorGeneral.value, '']
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: wsData.length - 1, c: 7 } })
    ws['!freeze'] = { xSplit: 0, ySplit: 5, topLeftCell: 'A6', state: 'frozen' }

    const colorTeal = { rgb: '14B8A6' }
    const colorTealOscuro = { rgb: '0D9488' }
    const colorVerde = { rgb: '10B981' }
    const colorRojo = { rgb: 'DC2626' }

    ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
    ws['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
    ws['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }
    ws['A4'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }

    const headerRow = 5
    for (let col = 0; col < 8; col++) {
      const cell = XLSX.utils.encode_cell({ r: headerRow, c: col })
      ws[cell].s = {
        fill: { fgColor: colorTeal, patternType: 'solid' },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { top: { style: 'thin', color: colorTealOscuro }, bottom: { style: 'thin', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
      }
    }

    const dataStartRow = 6
    const dataEndRow = dataStartRow + datosExportar.length - 1
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      const idx = row - dataStartRow
      const aEntregar = datosExportar[idx]?.['A Entregar'] ?? 0
      const debe = datosExportar[idx]?.Debe ?? 0
      for (let col = 0; col < 8; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cell]) continue
        const isAEntregar = col === 6
        const isDebe = col === 7
        const color = isDebe && debe > 0 ? colorRojo : (isAEntregar ? { rgb: '047857' } : { rgb: '1F2937' })
        ws[cell].s = {
          fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' },
          font: { sz: 10, bold: col === 0, color },
          alignment: { horizontal: col >= 2 ? 'right' : 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } }
        }
        if (col >= 2) ws[cell].z = (isAEntregar || isDebe) ? '#,##0' : '#,##0'
      }
    }

    const totalRow = dataEndRow + 2
    const cellTotalLabel = XLSX.utils.encode_cell({ r: totalRow, c: 0 })
    const cellTotalVal = XLSX.utils.encode_cell({ r: totalRow, c: 6 })
    ws[cellTotalLabel].s = {
      fill: { fgColor: { rgb: 'CCFBF1' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '0F766E' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'medium', color: colorTealOscuro }, bottom: { style: 'medium', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellTotalVal].s = {
      fill: { fgColor: { rgb: 'CCFBF1' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '047857' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'medium', color: colorTealOscuro }, bottom: { style: 'medium', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellTotalVal].z = '#,##0;[Red]-#,##0'

    ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]

    XLSX.utils.book_append_sheet(wb, ws, 'Simulador de Cierre')
    const nombreArchivo = `Simulador_Cierre_${(natillera.value?.nombre || 'Natillera').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)
    notificationStore.success('Exportado a Excel correctamente', 'Éxito')
  } catch (e) {
    console.error('Error exportando simulador a Excel:', e)
    notificationStore.error(e.message || 'Error al exportar', 'Error')
  } finally {
    exportandoSimulador.value = false
  }
}

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Funciones helper para movimientos
function esTransferencia(m) {
  if (!m.descripcion) return false
  const desc = m.descripcion.toLowerCase()
  return desc.includes('transferencia') && (desc.includes('→') || desc.includes('efectivo') || desc.includes('transferencia'))
}

function obtenerOrigenTransferencia(m) {
  if (!esTransferencia(m)) return ''
  const desc = m.descripcion.toLowerCase()
  if (m.tipo === 'salida') {
    return m.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'
  } else {
    // Si es entrada, el origen es el opuesto
    return m.forma_pago === 'efectivo' ? 'Transferencia' : 'Efectivo'
  }
}

function obtenerDestinoTransferencia(m) {
  if (!esTransferencia(m)) return ''
  if (m.tipo === 'entrada') {
    return m.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'
  } else {
    // Si es salida, el destino es el opuesto
    return m.forma_pago === 'efectivo' ? 'Transferencia' : 'Efectivo'
  }
}

function obtenerDescripcionLimpia(m) {
  if (!m.descripcion) {
    return m.tipo === 'entrada' ? 'Ingreso manual' : 'Egreso manual'
  }
  // Si es transferencia, simplificar la descripción
  if (esTransferencia(m)) {
    return 'Transferencia entre formas de pago'
  }
  return m.descripcion
}

function buildDetalleItems(nat, prestamosData, sociosActividadData, movimientosData = null, cuotasPrestamoPagadas = [], historialImpuesto4x1000 = []) {
  const items = []
  if (!nat) return items
  const sociosMap = {}
  const periodicidadPorSocioId = {}
  ;(nat.socios_natillera || []).forEach(sn => {
    sociosMap[sn.id] = sn.socio?.nombre || 'Socio'
    periodicidadPorSocioId[sn.id] = (sn.periodicidad || 'mensual').toLowerCase()
  })
  const prestamoIdASocioNatilleraId = {}
  ;(prestamosData || []).forEach(p => {
    if (p?.id) prestamoIdASocioNatilleraId[p.id] = p.socio_natillera_id
  })
  // Incluir cuotas pagadas y con pago parcial (valor_pagado > 0)
  const cuotasConPago = (nat.cuotas || []).filter(c => c.estado === 'pagada' || (parseFloat(c.valor_pagado) || 0) > 0)
  const tipoPago = (t) => (String(t || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo')

  // Cuotas y sanciones (entradas) - soporte pago mixto con desglose
  cuotasConPago.forEach(c => {
    const fechaMovimiento = c.fecha_pago || c.updated_at || null
    const socio = sociosMap[c.socio_natillera_id] || '—'
    const vCuota = parseFloat(c.valor_cuota) || 0
    const vPagado = parseFloat(c.valor_pagado) || 0
    const esParcial = c.estado === 'parcial' || (vPagado > 0 && vPagado < vCuota)
    const montoCuota = esParcial ? vPagado : vCuota
    const vSancion = parseFloat(c.valor_pagado_sancion) || parseFloat(c.valor_multa) || 0
    const vEfectivo = parseFloat(c.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(c.valor_pagado_transferencia) || 0
    const totalDesglose = vEfectivo + vTransferencia
    const tieneDesglose = totalDesglose > 0 && (vEfectivo > 0 && vTransferencia > 0)
    const fp = tipoPago(c.tipo_pago)
    const pushCuota = (forma, monto) => {
      if (monto <= 0) return
      const socioEsMensual = (periodicidadPorSocioId[c.socio_natillera_id] || 'mensual') === 'mensual'
      items.push({
        tipo: 'cuota',
        concepto: esParcial ? 'Cuota (Parcial)' : 'Cuota',
        socio,
        forma_pago: forma,
        monto,
        mes: c.mes,
        anio: c.anio,
        quincena: c.quincena != null ? c.quincena : undefined,
        socioEsMensual,
        esParcial,
        fecha_movimiento: fechaMovimiento
      })
    }
    const pushSancion = (forma, monto) => {
      if (monto <= 0) return
      const socioEsMensual = (periodicidadPorSocioId[c.socio_natillera_id] || 'mensual') === 'mensual'
      items.push({ tipo: 'sancion', concepto: 'Sanción', socio, forma_pago: forma, monto, mes: c.mes, anio: c.anio, quincena: c.quincena != null ? c.quincena : undefined, socioEsMensual, fecha_movimiento: fechaMovimiento })
    }
    if (tieneDesglose && totalDesglose > 0) {
      const ratioCuota = montoCuota / totalDesglose
      const ratioSancion = vSancion / totalDesglose
      pushCuota('efectivo', Math.round(vEfectivo * ratioCuota))
      pushCuota('transferencia', Math.round(vTransferencia * ratioCuota))
      pushSancion('efectivo', Math.round(vEfectivo * ratioSancion))
      pushSancion('transferencia', Math.round(vTransferencia * ratioSancion))
    } else {
      if (montoCuota > 0) pushCuota(fp, montoCuota)
      if (vSancion > 0) pushSancion(fp, vSancion)
    }
  })

  // Cuotas de préstamos pagadas o con pago parcial - soporte pago mixto (período desde fecha_pago)
  ;(cuotasPrestamoPagadas || []).forEach(pp => {
    const vEfectivo = parseFloat(pp.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(pp.valor_pagado_transferencia) || 0
    const montoTotal = vEfectivo + vTransferencia
    const monto = montoTotal > 0 ? montoTotal : (parseFloat(pp.valor_pagado) ?? 0)
    if (monto <= 0) return
    const esParcial = pp.pagada === false && monto > 0
    const snIdCuotaPrestamo = pp.prestamo_id != null ? prestamoIdASocioNatilleraId[pp.prestamo_id] : null
    const socio =
      (pp.nombre_socio || pp.socio_nombre || '').trim() ||
      (snIdCuotaPrestamo != null ? sociosMap[snIdCuotaPrestamo] : '') ||
      '—'
    const baseConcepto = `Cuota préstamo ${pp.numero_cuota != null ? `#${pp.numero_cuota}` : ''}`.trim()
    const concepto = esParcial ? `${baseConcepto || 'Cuota préstamo'} (Parcial)` : (baseConcepto || 'Cuota préstamo')
    const fechaPago = pp.fecha_pago ? new Date(pp.fecha_pago) : null
    const mes = fechaPago ? fechaPago.getMonth() + 1 : undefined
    const anio = fechaPago ? fechaPago.getFullYear() : undefined
    const fechaMovPrestamo = pp.fecha_pago || null
    const periodoPago = { mes, anio, socioEsMensual: true, fecha_movimiento: fechaMovPrestamo }
    if (vEfectivo > 0 && vTransferencia > 0) {
      items.push({ tipo: 'cuota_prestamo', concepto: concepto + ' (Efectivo)', socio, forma_pago: 'efectivo', monto: vEfectivo, esParcial, ...periodoPago })
      items.push({ tipo: 'cuota_prestamo', concepto: concepto + ' (Transfer.)', socio, forma_pago: 'transferencia', monto: vTransferencia, esParcial, ...periodoPago })
    } else if (vEfectivo > 0 || vTransferencia > 0) {
      const fp = vEfectivo > 0 ? 'efectivo' : 'transferencia'
      items.push({ tipo: 'cuota_prestamo', concepto, socio, forma_pago: fp, monto: vEfectivo || vTransferencia, esParcial, ...periodoPago })
    } else {
      const fp = tipoPago(pp.forma_pago)
      items.push({ tipo: 'cuota_prestamo', concepto, socio, forma_pago: fp, monto, esParcial, ...periodoPago })
    }
  })

  // Actividades desglosadas - soporte pago mixto (con período desde socios_actividad o actividad)
  ;(sociosActividadData || []).forEach(sa => {
    const fechaMovActividad = sa.fecha_pago || sa.updated_at || null
    const socio = sa.socio_natillera?.socio?.nombre || sociosMap[sa.socio_natillera_id] || '—'
    const nombreActividad = sa.actividad?.descripcion || 'Actividad'
    const vEfectivo = parseFloat(sa.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(sa.valor_pagado_transferencia) || 0
    const monto = vEfectivo + vTransferencia || parseFloat(sa.valor_pagado) || 0
    if (monto <= 0) return
    const mes = sa.mes_pago ?? sa.actividad?.mes_pago
    const anio = sa.anio_pago ?? sa.actividad?.anio_pago
    const quincena = sa.quincena_pago ?? sa.actividad?.quincena_pago
    const socioEsMensual = (periodicidadPorSocioId[sa.socio_natillera_id] || 'mensual') === 'mensual'
    const periodo = { mes, anio, quincena: quincena != null ? quincena : undefined, socioEsMensual, fecha_movimiento: fechaMovActividad }
    if (vEfectivo > 0 && vTransferencia > 0) {
      items.push({ tipo: 'actividad', concepto: nombreActividad + ' (Efectivo)', socio, forma_pago: 'efectivo', monto: vEfectivo, ...periodo })
      items.push({ tipo: 'actividad', concepto: nombreActividad + ' (Transfer.)', socio, forma_pago: 'transferencia', monto: vTransferencia, ...periodo })
    } else if (vEfectivo > 0 || vTransferencia > 0) {
      const fp = vEfectivo > 0 ? 'efectivo' : 'transferencia'
      items.push({ tipo: 'actividad', concepto: nombreActividad, socio, forma_pago: fp, monto: vEfectivo || vTransferencia, ...periodo })
    } else {
      const fp = tipoPago(sa.forma_pago)
      items.push({ tipo: 'actividad', concepto: nombreActividad, socio, forma_pago: fp, monto, ...periodo })
    }
  })

  // Préstamos (salidas, monto negativo). Período según fecha de creación (created_at).
  ;(prestamosData || []).forEach(p => {
    const socio = sociosMap[p.socio_natillera_id] || '—'
    const fp = tipoPago(p.medio_entrega)
    const monto = parseFloat(p.monto) || 0
    if (monto > 0) {
      const aDescontar = p.interes_anticipado && p.interes_total != null
        ? monto + parseFloat(p.interes_total)
        : monto
      const fechaCreacion = p.created_at ? new Date(p.created_at) : null
      const mes = fechaCreacion ? fechaCreacion.getMonth() + 1 : undefined
      const anio = fechaCreacion ? fechaCreacion.getFullYear() : undefined
      items.push({ tipo: 'prestamo', concepto: 'Préstamo', socio, forma_pago: fp, monto: -aDescontar, mes, anio, socioEsMensual: true, fecha_movimiento: p.created_at || null })
    }
  })

  // Utilidad por interés anticipado: un registro por préstamo en Detalle por concepto (entrada que suma a la forma de pago)
  ;(prestamosData || []).forEach(p => {
    if (!p.interes_anticipado || p.interes_total == null) return
    const interesTotal = parseFloat(p.interes_total) || 0
    if (interesTotal <= 0) return
    const socio = sociosMap[p.socio_natillera_id] || '—'
    const fp = tipoPago(p.medio_entrega)
    const fechaCreacion = p.created_at ? new Date(p.created_at) : null
    const mes = fechaCreacion ? fechaCreacion.getMonth() + 1 : undefined
    const anio = fechaCreacion ? fechaCreacion.getFullYear() : undefined
    const conceptoPorPrestamo = `Utilidad por interés anticipado — ${socio}`
    items.push({ tipo: 'interes_anticipado', concepto: conceptoPorPrestamo, socio, forma_pago: fp, monto: interesTotal, mes, anio, socioEsMensual: true, fecha_movimiento: p.created_at || null })
  })

  // Premios rifa entregados (salidas que se restan del recaudo): desde movimientos_fondo o, si no hay, desde actividades liquidadas (gastos)
  const tipoPagoMov = (t) => (String(t || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo')
  const descripcionMov = (m) => (m && (m.descripcion ?? m.Descripcion ?? '')).toString().toLowerCase().trim()
  const esPremioRifaMov = (m) => {
    if (m.tipo !== 'salida') return false
    const d = descripcionMov(m)
    return d.includes('premio rifa') || d.includes('rifa liquidada') || (d.includes('premio') && d.includes('rifa'))
  }
  const premiosFromMov = (movimientosData || []).filter(esPremioRifaMov)
  premiosFromMov.forEach(m => {
    const fp = tipoPagoMov(m.forma_pago ?? m.Forma_pago)
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto > 0) {
      const conceptoDesc = (m.descripcion || m.Descripcion || '').toString().trim() || 'Premio rifa'
      items.push({ tipo: 'premio_rifa', concepto: conceptoDesc.length > 50 ? 'Premio rifa' : conceptoDesc, socio: '—', forma_pago: fp, monto: -monto, fecha_movimiento: m.fecha || null })
    }
  })
  // Si no hubo premios en movimientos_fondo, tomar de actividades liquidadas (gastos = premio entregado)
  if (premiosFromMov.length === 0 && (nat.actividades || []).length > 0) {
    ;(nat.actividades || []).filter(a => a.estado === 'liquidada' && (parseFloat(a.gastos) || 0) > 0).forEach(a => {
      const monto = parseFloat(a.gastos) || 0
      const concepto = (a.descripcion && a.descripcion.length <= 50) ? `Premio: ${a.descripcion}` : 'Premio rifa'
      items.push({ tipo: 'premio_rifa', concepto, socio: '—', forma_pago: 'efectivo', monto: -monto, fecha_movimiento: a.updated_at || a.created_at || null })
    })
  }

  // Liquidaciones por salida (desactivación de socio): salidas en movimientos_fondo con descripción "Liquidación por salida - ..."
  const esLiquidacionSalida = (m) => {
    if (m.tipo !== 'salida') return false
    const d = descripcionMov(m)
    return d.includes('liquidación por salida') || d.includes('liquidacion por salida')
  }
  const liquidacionesFromMov = (movimientosData || []).filter(esLiquidacionSalida)
  liquidacionesFromMov.forEach(m => {
    const fp = tipoPagoMov(m.forma_pago ?? m.Forma_pago)
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto > 0) {
      const desc = (m.descripcion || m.Descripcion || '').toString().trim()
      const socioDesc = desc.replace(/^Liquidación por salida\s*[-–]\s*/i, '').trim() || '—'
      const fechaMov = m.fecha ? new Date(m.fecha) : null
      const anio = fechaMov ? fechaMov.getFullYear() : 0
      const mes = fechaMov ? fechaMov.getMonth() + 1 : 0
      items.push({ tipo: 'liquidacion_salida', concepto: 'Liquidación por salida', socio: socioDesc, forma_pago: fp, monto: -monto, anio, mes, fecha_movimiento: m.fecha || null })
    }
  })

  // Recaudo al liquidar actividad (entrada en movimientos_fondo): línea en detalle por concepto (tipo actividad)
  const esMovEntradaRecaudoLiquidada = (m) => {
    if (!m || m.tipo !== 'entrada') return false
    const d = descripcionMov(m)
    return d.includes('recaudo actividad liquidada') || d.includes('recaudo rifa liquidada')
  }
  ;(movimientosData || []).filter(esMovEntradaRecaudoLiquidada).forEach(m => {
    const fp = tipoPagoMov(m.forma_pago ?? m.Forma_pago)
    const monto = parseFloat(m.monto ?? m.Monto) || 0
    if (monto <= 0) return
    const desc = (m.descripcion || m.Descripcion || '').toString().trim()
    const concepto = desc.length <= 70 ? desc : `${desc.slice(0, 67)}…`
    const fechaMov = m.fecha ? new Date(m.fecha) : null
    const mes = fechaMov && !isNaN(fechaMov.getTime()) ? fechaMov.getMonth() + 1 : undefined
    const anio = fechaMov && !isNaN(fechaMov.getTime()) ? fechaMov.getFullYear() : undefined
    items.push({
      tipo: 'actividad',
      concepto,
      socio: '—',
      forma_pago: fp,
      monto,
      mes,
      anio,
      socioEsMensual: true,
      fecha_movimiento: m.fecha || null
    })
  })

  // GMF 4×1000 por abono en transferencia (desde historial_pagos_cuota; un registro por fila de historial)
  ;(historialImpuesto4x1000 || []).forEach(h => {
    const imp = parseFloat(h.impuesto_4x1000) || 0
    if (imp <= 0) return
    const fpHist = String(h.forma_pago || '').toLowerCase().trim()
    if (fpHist !== 'transferencia') return
    const c = (nat.cuotas || []).find(x => x.id === h.cuota_id)
    const socio = (h.socio_nombre || '').trim() || (c ? sociosMap[c.socio_natillera_id] : null) || '—'
    const fechaPago = h.fecha_pago ? new Date(h.fecha_pago) : null
    const mes = fechaPago && !isNaN(fechaPago.getTime()) ? fechaPago.getMonth() + 1 : undefined
    const anio = fechaPago && !isNaN(fechaPago.getTime()) ? fechaPago.getFullYear() : undefined
    const quincena = c && c.quincena != null ? c.quincena : undefined
    const socioEsMensual = c ? (periodicidadPorSocioId[c.socio_natillera_id] || 'mensual') === 'mensual' : true
    items.push({
      tipo: 'gmf_4x1000',
      concepto: '4x1000',
      socio,
      forma_pago: 'transferencia',
      monto: imp,
      mes,
      anio,
      quincena,
      socioEsMensual,
      fecha_movimiento: h.fecha_pago || null
    })
  })

  // Ordenar: por año-mes desc, luego por tipo (cuota, cuota_prestamo, sancion, actividad, interes_anticipado, prestamo, liquidacion_salida, premio_rifa)
  const ordenTipo = { cuota: 0, cuota_prestamo: 0.5, sancion: 1, gmf_4x1000: 1.25, actividad: 2, interes_anticipado: 2.5, prestamo: 3, liquidacion_salida: 3.5, premio_rifa: 4 }
  items.sort((a, b) => {
    const keyA = `${a.anio || 0}-${String(a.mes || 0).padStart(2, '0')}-${ordenTipo[a.tipo] ?? 4}`
    const keyB = `${b.anio || 0}-${String(b.mes || 0).padStart(2, '0')}-${ordenTipo[b.tipo] ?? 4}`
    return keyB.localeCompare(keyA)
  })
  return items
}

async function cargarSociosActividadParaDetalle(natilleraId, idsSocioNatillera = null) {
  let ids = idsSocioNatillera
  if (!ids || ids.length === 0) {
    const { data: sociosNat } = await supabase.from('socios_natillera').select('id').eq('natillera_id', natilleraId)
    ids = (sociosNat || []).map(s => s.id)
  }
  if (ids.length === 0) return []
  const { data } = await supabase
    .from('socios_actividad')
    .select('valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, forma_pago, socio_natillera_id, mes_pago, anio_pago, quincena_pago, fecha_pago, updated_at, actividad:actividades(descripcion, mes_pago, anio_pago, quincena_pago)')
    .in('socio_natillera_id', ids)
    .gt('valor_pagado', 0)
  return data || []
}

async function cargarPrestamosParaDetalle(natilleraId, idsSocioNatillera = null) {
  let ids = idsSocioNatillera
  if (!ids || ids.length === 0) {
    const { data: sociosNat } = await supabase.from('socios_natillera').select('id').eq('natillera_id', natilleraId)
    ids = (sociosNat || []).map(s => s.id)
  }
  if (ids.length === 0) return []
  const { data: prestamos } = await supabase
    .from('prestamos')
    .select('id, monto, medio_entrega, socio_natillera_id, interes_anticipado, interes_total, created_at')
    .in('socio_natillera_id', ids)
    .in('estado', ['activo', 'pagado'])
  return prestamos || []
}

async function cargarCuotasPrestamoPagadasParaDetalle(prestamoIds) {
  if (!prestamoIds || prestamoIds.length === 0) return []
  const { data } = await supabase
    .from('plan_pagos_prestamo')
    .select('valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, valor_cuota, forma_pago, nombre_socio, socio_nombre, prestamo_id, numero_cuota, fecha_pago, pagada')
    .in('prestamo_id', prestamoIds)
    .gt('valor_pagado', 0)
  return data || []
}

async function cargarDatos() {
  if (!id.value) return
  loading.value = true
  try {
    const nat = await natillerasStore.fetchNatillera(id.value)
    natillera.value = nat
    if (!nat) {
      notificationStore.error('Natillera no encontrada', 'Error')
      return
    }

    const idsSocioNatillera = (nat.socios_natillera || []).map(s => s.id)

    const [movimientosResult, prestamosData, sociosActividadData, permisos] = await Promise.all([
      supabase
        .from('movimientos_fondo')
        .select('id, tipo, monto, forma_pago, descripcion, fecha, origen_egreso, destino_ingreso')
        .eq('natillera_id', id.value)
        .order('fecha', { ascending: false }),
      cargarPrestamosParaDetalle(id.value, idsSocioNatillera),
      cargarSociosActividadParaDetalle(id.value, idsSocioNatillera),
      colaboradoresStore.obtenerMisPermisos(id.value)
    ])

    const { data: movs, error } = movimientosResult
    if (error) throw error
    movimientos.value = movs || []

    const prestamoIds = (prestamosData || []).map(p => p.id)
    const cuotaIdsNat = (nat.cuotas || []).map(c => c.id).filter(Boolean)
    const [cuotasPrestamoPagadas, historialGmfRes] = await Promise.all([
      cargarCuotasPrestamoPagadasParaDetalle(prestamoIds),
      cuotaIdsNat.length === 0
        ? Promise.resolve({ data: [], error: null })
        : supabase
            .from('historial_pagos_cuota')
            .select('cuota_id, socio_nombre, fecha_pago, forma_pago, impuesto_4x1000')
            .in('cuota_id', cuotaIdsNat)
    ])
    let historialGmfRows = []
    if (historialGmfRes?.error) {
      console.warn('Cuadre: historial GMF 4×1000 no cargado (¿columna impuesto_4x1000 o RLS?):', historialGmfRes.error.message)
    } else {
      historialGmfRows = (historialGmfRes?.data || []).filter(r => (parseFloat(r.impuesto_4x1000) || 0) > 0)
    }
    detalleItems.value = buildDetalleItems(nat, prestamosData, sociosActividadData, movs || [], cuotasPrestamoPagadas, historialGmfRows)
    misPermisos.value = permisos
    await nextTick()
    logCalculoTotalesGenerales()
  } catch (e) {
    console.error('Error cargando cuadre:', e)
    notificationStore.error(e.message || 'Error al cargar datos', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarMovimiento(m) {
  movimientoAEliminar.value = m
}

async function eliminarMovimientoConfirmado() {
  if (!movimientoAEliminar.value) return
  eliminandoMovimiento.value = true
  try {
    const movimiento = movimientoAEliminar.value
    // Buscar par de traslado por patrón (misma fecha, monto, tipo y forma de pago opuestos); si existe, eliminar ambos
    const movimientoRelacionado = await buscarMovimientoRelacionadoTransferencia(movimiento)
    const esTraslado = !!movimientoRelacionado

    // Preparar datos completos del movimiento antes de eliminar
    const datosCompletosEliminacion = {
      id: movimiento.id,
      natillera_id: movimiento.natillera_id,
      tipo: movimiento.tipo,
      monto: movimiento.monto,
      forma_pago: movimiento.forma_pago,
      descripcion: movimiento.descripcion,
      fecha: movimiento.fecha,
      created_at: movimiento.created_at,
      updated_at: movimiento.updated_at
    }

    // Eliminar ambos si forman par de traslado
    if (esTraslado && movimientoRelacionado) {
      const { error: errorRelacionado } = await supabase
        .from('movimientos_fondo')
        .delete()
        .eq('id', movimientoRelacionado.id)

      if (errorRelacionado) {
        throw new Error(`Error al eliminar movimiento relacionado: ${errorRelacionado.message}`)
      }
    }

    const { error } = await supabase
      .from('movimientos_fondo')
      .delete()
      .eq('id', movimiento.id)

    if (error) {
      if (esTraslado && movimientoRelacionado) {
        console.error('❌ Error al eliminar movimiento original después de eliminar el relacionado.')
      }
      throw error
    }

    const auditoria = useAuditoria()
    const tipoMovimientoTexto = esTraslado
      ? 'TRANSFERENCIA'
      : (movimiento.tipo === 'entrada' ? 'INGRESO' : 'EGRESO')

    const descripcionEliminacion = `[${tipoMovimientoTexto} - ELIMINACIÓN] ${esTraslado ? 'Transferencia' : movimiento.tipo === 'entrada' ? 'Ingreso' : 'Egreso'} de $${movimiento.monto.toLocaleString('es-CO')} en ${movimiento.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}${movimiento.descripcion ? ` - ${movimiento.descripcion}` : ''} eliminado`

    if (esTraslado && movimientoRelacionado) {
      const datosRelacionadoCompletos = {
        id: movimientoRelacionado.id,
        natillera_id: movimientoRelacionado.natillera_id,
        tipo: movimientoRelacionado.tipo,
        monto: movimientoRelacionado.monto,
        forma_pago: movimientoRelacionado.forma_pago,
        descripcion: movimientoRelacionado.descripcion,
        fecha: movimientoRelacionado.fecha,
        created_at: movimientoRelacionado.created_at,
        updated_at: movimientoRelacionado.updated_at
      }

      // Registrar auditoría del movimiento relacionado eliminado
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarEliminacion(
          'movimientos_fondo',
          movimientoRelacionado.id,
          `[TRANSFERENCIA - ELIMINACIÓN] Movimiento relacionado (${movimientoRelacionado.tipo === 'entrada' ? 'entrada' : 'salida'}) de transferencia eliminado automáticamente junto con el movimiento principal`,
          datosRelacionadoCompletos,
          id.value,
          {
            tipo_movimiento: 'transferencia',
            monto_formateado: `$${movimientoRelacionado.monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(movimientoRelacionado.fecha).toLocaleDateString('es-CO'),
            forma_pago: movimientoRelacionado.forma_pago,
            descripcion: movimientoRelacionado.descripcion,
            movimiento_relacionado_id: movimiento.id,
            eliminacion_automatica: true,
            eliminacion_coherente: true,
            motivo_eliminacion: 'Eliminación automática por ser parte de transferencia eliminada. Ambos movimientos (entrada y salida) fueron eliminados para mantener coherencia.'
          }
        )
      )
      
      // Actualizar la descripción de eliminación del movimiento principal para indicar que se eliminaron ambos
      const descripcionEliminacionActualizada = `[${tipoMovimientoTexto} - ELIMINACIÓN] Transferencia completa eliminada (ambos movimientos: ${movimiento.tipo} y ${movimientoRelacionado.tipo}) de $${movimiento.monto.toLocaleString('es-CO')}${movimiento.descripcion ? ` - ${movimiento.descripcion}` : ''}`
      
      // Actualizar la auditoría del movimiento principal con información de que se eliminaron ambos
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarEliminacion(
          'movimientos_fondo',
          movimiento.id,
          descripcionEliminacionActualizada,
          datosCompletosEliminacion,
          id.value,
          {
            tipo_movimiento: 'transferencia',
            monto_formateado: `$${movimiento.monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(movimiento.fecha).toLocaleDateString('es-CO'),
            forma_pago: movimiento.forma_pago,
            descripcion: movimiento.descripcion,
            movimiento_relacionado_id: movimientoRelacionado.id,
            movimiento_relacionado_encontrado: true,
            eliminacion_coherente: true,
            ambos_movimientos_eliminados: true,
            motivo_eliminacion: 'Eliminación manual por usuario. Ambos movimientos de la transferencia fueron eliminados para mantener coherencia.'
          }
        )
      )
    } else {
      // Si no es traslado o no se encontró relacionado, usar la auditoría original
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarEliminacion(
          'movimientos_fondo',
          movimiento.id,
          descripcionEliminacion,
          datosCompletosEliminacion,
          id.value,
          {
            tipo_movimiento: esTraslado ? 'transferencia' : (movimiento.tipo === 'entrada' ? 'ingreso' : 'egreso'),
            monto_formateado: `$${movimiento.monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(movimiento.fecha).toLocaleDateString('es-CO'),
            forma_pago: movimiento.forma_pago,
            descripcion: movimiento.descripcion,
            movimiento_relacionado_id: movimientoRelacionado?.id || null,
            movimiento_relacionado_encontrado: !!movimientoRelacionado,
            motivo_eliminacion: esTraslado && !movimientoRelacionado
              ? 'Eliminación manual por usuario. No se encontró movimiento relacionado.'
              : 'Eliminación manual por usuario'
          }
        )
      )
    }

    movimientoAEliminar.value = null

    if (esTraslado && movimientoRelacionado) {
      notificationStore.success('Transferencia eliminada correctamente (ambos movimientos)', 'Eliminado')
    } else {
      notificationStore.success('Movimiento eliminado correctamente', 'Eliminado')
    }
    
    await cargarDatos()
  } catch (e) {
    console.error('Error eliminando movimiento:', e)
    notificationStore.error(e.message || 'Error al eliminar', 'Error')
  } finally {
    eliminandoMovimiento.value = false
  }
}

// Funciones para modal de nuevo movimiento
function abrirModalMovimiento() {
  editandoMovimiento.value = false
  movimientoEditando.value = null
  modalMovimientoAbierto.value = true
  // Resetear formulario
  tipoMovimiento.value = 'transferencia'
  formMovimiento.value = {
    direccionTransferencia: 'efectivo_transferencia',
    formaPago: 'efectivo',
    origenEgreso: 'recaudado',
    destinoIngreso: 'recaudado',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  }
  montoFormateado.value = ''
  erroresFormulario.value = {}
}

function abrirModalEditarMovimiento(movimiento) {
  editandoMovimiento.value = true
  movimientoEditando.value = movimiento
  modalMovimientoAbierto.value = true
  
  // Determinar tipo de movimiento (traslado por patrón o por descripción)
  const esTransferencia = esParteDeTraslado(movimiento) || esTransferenciaMovimiento(movimiento)
  if (esTransferencia) {
    tipoMovimiento.value = 'transferencia'
    // Determinar dirección de transferencia
    if (movimiento.tipo === 'salida') {
      formMovimiento.value.direccionTransferencia = movimiento.forma_pago === 'efectivo' ? 'efectivo_transferencia' : 'transferencia_efectivo'
    } else {
      formMovimiento.value.direccionTransferencia = movimiento.forma_pago === 'efectivo' ? 'transferencia_efectivo' : 'efectivo_transferencia'
    }
  } else {
    tipoMovimiento.value = movimiento.tipo === 'entrada' ? 'ingreso' : 'egreso'
  }
  
  // Llenar formulario con datos del movimiento
  formMovimiento.value = {
    direccionTransferencia: formMovimiento.value.direccionTransferencia || 'efectivo_transferencia',
    formaPago: movimiento.forma_pago || 'efectivo',
    origenEgreso: (movimiento.tipo === 'salida' && (movimiento.origen_egreso === 'recaudado' || movimiento.origen_egreso === 'utilidades')) ? movimiento.origen_egreso : 'recaudado',
    destinoIngreso: (movimiento.tipo === 'entrada' && (movimiento.destino_ingreso === 'recaudado' || movimiento.destino_ingreso === 'utilidades')) ? movimiento.destino_ingreso : 'recaudado',
    monto: movimiento.monto || '',
    descripcion: movimiento.descripcion || '',
    fecha: movimiento.fecha || new Date().toISOString().split('T')[0]
  }
  montoFormateado.value = formatearMonto(movimiento.monto)
  erroresFormulario.value = {}
}

function esTransferenciaMovimiento(m) {
  if (!m.descripcion) return false
  const desc = m.descripcion.toLowerCase()
  return desc.includes('transferencia') && (desc.includes('→') || desc.includes('efectivo'))
}

// Normalizar fecha a YYYY-MM-DD (la API puede devolver ISO con hora)
function normalizarFechaParaConsulta(fecha) {
  if (!fecha) return ''
  const s = typeof fecha === 'string' ? fecha : (fecha && fecha.toISOString ? fecha.toISOString() : String(fecha))
  return s.includes('T') ? s.split('T')[0] : s
}

// Buscar el movimiento "gemelo" de un traslado (el otro registro del par entrada/salida).
// Se identifica por patrón: misma fecha, mismo monto, tipo opuesto y forma de pago opuesta (efectivo ↔ transferencia).
async function buscarMovimientoRelacionadoTransferencia(movimiento) {
  const tipoOpuesto = movimiento.tipo === 'entrada' ? 'salida' : 'entrada'
  const formaPagoOpuesta = movimiento.forma_pago === 'efectivo' ? 'transferencia' : 'efectivo'
  const fechaNorm = normalizarFechaParaConsulta(movimiento.fecha)
  const montoNorm = parseFloat(movimiento.monto)
  if (!fechaNorm || isNaN(montoNorm)) return null

  // Buscar por misma fecha (normalizada), monto, tipo opuesto y forma de pago opuesta (sin filtrar por descripción)
  const { data: lista } = await supabase
    .from('movimientos_fondo')
    .select('*')
    .eq('natillera_id', id.value)
    .eq('fecha', fechaNorm)
    .eq('tipo', tipoOpuesto)
    .eq('forma_pago', formaPagoOpuesta)
    .eq('monto', montoNorm)
    .neq('id', movimiento.id)
    .limit(1)

  if (lista?.[0]) return lista[0]

  // Fallback: la columna fecha puede venir con hora; traer candidatos y filtrar por fecha en JS
  const { data: candidatos } = await supabase
    .from('movimientos_fondo')
    .select('*')
    .eq('natillera_id', id.value)
    .eq('tipo', tipoOpuesto)
    .eq('forma_pago', formaPagoOpuesta)
    .eq('monto', montoNorm)
    .neq('id', movimiento.id)
    .limit(5)

  if (!candidatos?.length) return null
  const relacionado = candidatos.find(m => normalizarFechaParaConsulta(m.fecha) === fechaNorm)
  return relacionado || null
}

// Comprueba si un movimiento forma parte de un par traslado (para el modal de eliminar)
function esParteDeTraslado(mov) {
  if (!mov || !movimientos.value?.length) return false
  const tipoOpuesto = mov.tipo === 'entrada' ? 'salida' : 'entrada'
  const formaOpuesta = mov.forma_pago === 'efectivo' ? 'transferencia' : 'efectivo'
  const fechaNorm = normalizarFechaParaConsulta(mov.fecha)
  const montoNorm = parseFloat(mov.monto)
  if (!fechaNorm || isNaN(montoNorm)) return false
  return movimientos.value.some(
    (m) =>
      m.id !== mov.id &&
      m.tipo === tipoOpuesto &&
      m.forma_pago === formaOpuesta &&
      normalizarFechaParaConsulta(m.fecha) === fechaNorm &&
      parseFloat(m.monto) === montoNorm
  )
}

// Formatear monto con separador de miles (coma)
function formatearMonto(value) {
  if (!value && value !== 0) return ''
  const numStr = String(value).replace(/\./g, '').replace(/[^\d]/g, '')
  if (numStr === '') return ''
  const num = parseFloat(numStr)
  if (isNaN(num)) return ''
  return num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Manejar input del monto
function handleMontoInput(event) {
  const valorOriginal = event.target.value
  // Remover comas y cualquier carácter no numérico
  const valorLimpio = valorOriginal.replace(/,/g, '').replace(/[^\d]/g, '')
  
  if (valorLimpio === '') {
    formMovimiento.value.monto = ''
    montoFormateado.value = ''
  } else {
    const numero = parseFloat(valorLimpio)
    if (!isNaN(numero) && numero >= 0) {
      formMovimiento.value.monto = numero
      montoFormateado.value = formatearMonto(numero)
    }
  }
}

// Manejar blur del monto para formatear correctamente
function handleMontoBlur(event) {
  if (formMovimiento.value.monto) {
    montoFormateado.value = formatearMonto(formMovimiento.value.monto)
  }
}

function cerrarModalMovimiento() {
  if (guardandoMovimiento.value) return
  modalMovimientoAbierto.value = false
  editandoMovimiento.value = false
  movimientoEditando.value = null
  erroresFormulario.value = {}
}

function validarFormulario() {
  erroresFormulario.value = {}
  let valido = true

  // Parsear el monto desde el formato con comas
  const montoNumerico = typeof formMovimiento.value.monto === 'string' 
    ? parseFloat(formMovimiento.value.monto.replace(/,/g, '')) 
    : parseFloat(formMovimiento.value.monto)

  if (!montoNumerico || isNaN(montoNumerico) || montoNumerico <= 0) {
    erroresFormulario.value.monto = 'El monto debe ser mayor a 0'
    valido = false
  } else {
    // Asegurar que el monto esté en formato numérico
    formMovimiento.value.monto = montoNumerico
  }

  return valido
}

async function guardarMovimiento() {
  if (!validarFormulario()) return

  // Validar permisos
  if (!puedeGestionarCuotas.value) {
    notificationStore.error('No tienes permisos para gestionar movimientos', 'Sin permisos')
    return
  }

  guardandoMovimiento.value = true
  try {
    const auditoria = useAuditoria()
    // Parsear monto (puede venir con comas del formato)
    const montoRaw = typeof formMovimiento.value.monto === 'string' 
      ? formMovimiento.value.monto.replace(/,/g, '') 
      : formMovimiento.value.monto
    const monto = parseFloat(montoRaw)
    if (isNaN(monto) || monto <= 0) {
      throw new Error('El monto debe ser un número válido mayor a 0')
    }
    const fecha = formMovimiento.value.fecha || new Date().toISOString().split('T')[0]

    // Si está editando, actualizar movimiento existente
    if (editandoMovimiento.value && movimientoEditando.value) {
      await actualizarMovimiento(movimientoEditando.value, monto, fecha, auditoria)
    } else if (tipoMovimiento.value === 'transferencia') {
      // Crear 2 movimientos: salida del origen y entrada al destino
      const esEfectivoATransferencia = formMovimiento.value.direccionTransferencia === 'efectivo_transferencia'
      const formaPagoOrigen = esEfectivoATransferencia ? 'efectivo' : 'transferencia'
      const formaPagoDestino = esEfectivoATransferencia ? 'transferencia' : 'efectivo'
      const descripcionBase = formMovimiento.value.descripcion || `Transferencia: ${formaPagoOrigen === 'efectivo' ? 'Efectivo' : 'Transferencia'} → ${formaPagoDestino === 'efectivo' ? 'Efectivo' : 'Transferencia'}`

      // Movimiento de salida (origen)
      const { data: movimientoSalida, error: errorSalida } = await supabase
        .from('movimientos_fondo')
        .insert({
          natillera_id: id.value,
          tipo: 'salida',
          monto: monto,
          forma_pago: formaPagoOrigen,
          descripcion: descripcionBase,
          fecha: fecha
        })
        .select()
        .single()

      if (errorSalida) throw errorSalida

      // Movimiento de entrada (destino)
      const { data: movimientoEntrada, error: errorEntrada } = await supabase
        .from('movimientos_fondo')
        .insert({
          natillera_id: id.value,
          tipo: 'entrada',
          monto: monto,
          forma_pago: formaPagoDestino,
          descripcion: descripcionBase,
          fecha: fecha
        })
        .select()
        .single()

      if (errorEntrada) {
        // Si falla la entrada, eliminar la salida creada
        await supabase.from('movimientos_fondo').delete().eq('id', movimientoSalida.id)
        throw errorEntrada
      }

      // Registrar auditoría detallada para ambos movimientos
      const descripcionAuditoria = `Transferencia interna de $${monto.toLocaleString('es-CO')} desde ${formaPagoOrigen === 'efectivo' ? 'Efectivo' : 'Transferencia'} hacia ${formaPagoDestino === 'efectivo' ? 'Efectivo' : 'Transferencia'}${descripcionBase && descripcionBase !== `Transferencia: ${formaPagoOrigen === 'efectivo' ? 'Efectivo' : 'Transferencia'} → ${formaPagoDestino === 'efectivo' ? 'Efectivo' : 'Transferencia'}` ? ` - ${descripcionBase}` : ''}`
      
      // Auditoría para movimiento de salida
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarCreacion(
          'movimientos_fondo',
          movimientoSalida.id,
          `[TRANSFERENCIA - SALIDA] ${descripcionAuditoria}`,
          {
            id: movimientoSalida.id,
            natillera_id: movimientoSalida.natillera_id,
            tipo: movimientoSalida.tipo,
            monto: movimientoSalida.monto,
            forma_pago: movimientoSalida.forma_pago,
            descripcion: movimientoSalida.descripcion,
            fecha: movimientoSalida.fecha,
            created_at: movimientoSalida.created_at
          },
          id.value,
          {
            tipo_movimiento: 'transferencia',
            direccion: formMovimiento.value.direccionTransferencia,
            origen: formaPagoOrigen,
            destino: formaPagoDestino,
            movimiento_entrada_id: movimientoEntrada.id,
            movimiento_salida_id: movimientoSalida.id,
            monto_formateado: `$${monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(fecha).toLocaleDateString('es-CO'),
            descripcion_usuario: descripcionBase
          }
        )
      )
      
      // Auditoría para movimiento de entrada
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarCreacion(
          'movimientos_fondo',
          movimientoEntrada.id,
          `[TRANSFERENCIA - ENTRADA] ${descripcionAuditoria}`,
          {
            id: movimientoEntrada.id,
            natillera_id: movimientoEntrada.natillera_id,
            tipo: movimientoEntrada.tipo,
            monto: movimientoEntrada.monto,
            forma_pago: movimientoEntrada.forma_pago,
            descripcion: movimientoEntrada.descripcion,
            fecha: movimientoEntrada.fecha,
            created_at: movimientoEntrada.created_at
          },
          id.value,
          {
            tipo_movimiento: 'transferencia',
            direccion: formMovimiento.value.direccionTransferencia,
            origen: formaPagoOrigen,
            destino: formaPagoDestino,
            movimiento_entrada_id: movimientoEntrada.id,
            movimiento_salida_id: movimientoSalida.id,
            monto_formateado: `$${monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(fecha).toLocaleDateString('es-CO'),
            descripcion_usuario: descripcionBase
          }
        )
      )

      notificationStore.success('Transferencia registrada correctamente', 'Éxito')
    } else if (tipoMovimiento.value === 'ingreso') {
      // Crear 1 movimiento de entrada
      const descripcion = formMovimiento.value.descripcion || `Ingreso manual - ${formMovimiento.value.formaPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}`

      const { data: movimiento, error } = await supabase
        .from('movimientos_fondo')
        .insert({
          natillera_id: id.value,
          tipo: 'entrada',
          monto: monto,
          forma_pago: formMovimiento.value.formaPago,
          descripcion: descripcion,
          fecha: fecha,
          destino_ingreso: formMovimiento.value.destinoIngreso || null
        })
        .select()
        .single()

      if (error) throw error

      // Registrar auditoría detallada
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarCreacion(
          'movimientos_fondo',
          movimiento.id,
          `[INGRESO MANUAL] Ingreso de $${monto.toLocaleString('es-CO')} en ${formMovimiento.value.formaPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}${descripcion && descripcion !== `Ingreso manual - ${formMovimiento.value.formaPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}` ? ` - ${descripcion}` : ''}`,
          {
            id: movimiento.id,
            natillera_id: movimiento.natillera_id,
            tipo: movimiento.tipo,
            monto: movimiento.monto,
            forma_pago: movimiento.forma_pago,
            descripcion: movimiento.descripcion,
            fecha: movimiento.fecha,
            created_at: movimiento.created_at
          },
          id.value,
          {
            tipo_movimiento: 'ingreso',
            forma_pago: formMovimiento.value.formaPago,
            monto_formateado: `$${monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(fecha).toLocaleDateString('es-CO'),
            descripcion_usuario: descripcion,
            es_manual: true
          }
        )
      )

      notificationStore.success('Ingreso registrado correctamente', 'Éxito')
    } else if (tipoMovimiento.value === 'egreso') {
      // Crear 1 movimiento de salida
      const descripcion = formMovimiento.value.descripcion || `Egreso manual - ${formMovimiento.value.formaPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}`

      const { data: movimiento, error } = await supabase
        .from('movimientos_fondo')
        .insert({
          natillera_id: id.value,
          tipo: 'salida',
          monto: monto,
          forma_pago: formMovimiento.value.formaPago,
          descripcion: descripcion,
          fecha: fecha,
          origen_egreso: formMovimiento.value.origenEgreso || null
        })
        .select()
        .single()

      if (error) throw error

      // Registrar auditoría detallada
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarCreacion(
          'movimientos_fondo',
          movimiento.id,
          `[EGRESO MANUAL] Egreso de $${monto.toLocaleString('es-CO')} en ${formMovimiento.value.formaPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}${descripcion && descripcion !== `Egreso manual - ${formMovimiento.value.formaPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}` ? ` - ${descripcion}` : ''}`,
          {
            id: movimiento.id,
            natillera_id: movimiento.natillera_id,
            tipo: movimiento.tipo,
            monto: movimiento.monto,
            forma_pago: movimiento.forma_pago,
            descripcion: movimiento.descripcion,
            fecha: movimiento.fecha,
            created_at: movimiento.created_at
          },
          id.value,
          {
            tipo_movimiento: 'egreso',
            forma_pago: formMovimiento.value.formaPago,
            monto_formateado: `$${monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(fecha).toLocaleDateString('es-CO'),
            descripcion_usuario: descripcion,
            es_manual: true
          }
        )
      )

      notificationStore.success('Egreso registrado correctamente', 'Éxito')
    }

    // Recargar datos
    await cargarDatos()
    
    // Cerrar modal después de un pequeño delay para que se vea la notificación
    guardandoMovimiento.value = false
    setTimeout(() => {
      cerrarModalMovimiento()
    }, 300)
  } catch (e) {
    console.error('Error guardando movimiento:', e)
    notificationStore.error(e.message || 'Error al guardar movimiento', 'Error')
    guardandoMovimiento.value = false
  }
}

// Función para actualizar un movimiento existente
async function actualizarMovimiento(movimientoOriginal, nuevoMonto, nuevaFecha, auditoria) {
  // Obtener datos anteriores completos para auditoría
  const datosAnteriores = {
    id: movimientoOriginal.id,
    natillera_id: movimientoOriginal.natillera_id,
    tipo: movimientoOriginal.tipo,
    monto: movimientoOriginal.monto,
    forma_pago: movimientoOriginal.forma_pago,
    descripcion: movimientoOriginal.descripcion,
    fecha: movimientoOriginal.fecha,
    origen_egreso: movimientoOriginal.origen_egreso ?? undefined,
    destino_ingreso: movimientoOriginal.destino_ingreso ?? undefined,
    created_at: movimientoOriginal.created_at,
    updated_at: movimientoOriginal.updated_at
  }

  const movimientoRelacionado = await buscarMovimientoRelacionadoTransferencia(movimientoOriginal)
  const esTransferencia = !!movimientoRelacionado

  if (esTransferencia) {
    // Actualizar ambos movimientos del par (origen y destino)
    const descripcionBase = formMovimiento.value.descripcion || movimientoOriginal.descripcion || 'Transferencia'
    const nuevaFormaPagoOpuesta = formMovimiento.value.formaPago === 'efectivo' ? 'transferencia' : 'efectivo'

    // Actualizar movimiento original
    const datosActualizados = {
      monto: nuevoMonto,
      forma_pago: formMovimiento.value.formaPago,
      descripcion: descripcionBase,
      fecha: nuevaFecha
    }

    const { data: movimientoActualizado, error: errorUpdate } = await supabase
      .from('movimientos_fondo')
      .update(datosActualizados)
      .eq('id', movimientoOriginal.id)
      .select()
      .single()

    if (errorUpdate) throw errorUpdate

    // Si existe movimiento relacionado, actualizarlo también con los mismos valores coherentes
    if (movimientoRelacionado) {
      // Asegurar que el movimiento relacionado tenga la forma de pago opuesta correcta
      const formaPagoRelacionado = nuevaFormaPagoOpuesta
      
      const datosRelacionados = {
        monto: nuevoMonto, // Mismo monto
        forma_pago: formaPagoRelacionado, // Forma de pago opuesta
        descripcion: descripcionBase, // Misma descripción
        fecha: nuevaFecha // Misma fecha
      }

      const { data: relacionadoActualizado, error: errorRelacionado } = await supabase
        .from('movimientos_fondo')
        .update(datosRelacionados)
        .eq('id', movimientoRelacionado.id)
        .select()
        .single()

      if (errorRelacionado) {
        // Revertir el cambio del movimiento original antes de lanzar el error
        await supabase
          .from('movimientos_fondo')
          .update({
            monto: datosAnteriores.monto,
            forma_pago: datosAnteriores.forma_pago,
            descripcion: datosAnteriores.descripcion,
            fecha: datosAnteriores.fecha
          })
          .eq('id', movimientoOriginal.id)
        throw new Error(`Error al actualizar movimiento relacionado: ${errorRelacionado.message}`)
      }
      
      // Verificar coherencia: ambos movimientos deben tener los mismos valores (excepto tipo y forma_pago)
      if (movimientoActualizado.monto !== relacionadoActualizado.monto ||
          movimientoActualizado.fecha !== relacionadoActualizado.fecha ||
          movimientoActualizado.descripcion !== relacionadoActualizado.descripcion) {
        console.error('❌ Error de coherencia: Los movimientos relacionados no tienen valores coherentes', {
          original: {
            monto: movimientoActualizado.monto,
            fecha: movimientoActualizado.fecha,
            descripcion: movimientoActualizado.descripcion
          },
          relacionado: {
            monto: relacionadoActualizado.monto,
            fecha: relacionadoActualizado.fecha,
            descripcion: relacionadoActualizado.descripcion
          }
        })
        // Intentar corregir automáticamente
        await supabase
          .from('movimientos_fondo')
          .update({
            monto: nuevoMonto,
            descripcion: descripcionBase,
            fecha: nuevaFecha
          })
          .eq('id', movimientoRelacionado.id)
      }
      
      // Verificar que la forma de pago sea opuesta
      if (movimientoActualizado.forma_pago === relacionadoActualizado.forma_pago) {
        console.error('❌ Error de coherencia: Ambos movimientos tienen la misma forma de pago', {
          forma_pago_original: movimientoActualizado.forma_pago,
          forma_pago_relacionado: relacionadoActualizado.forma_pago
        })
        // Corregir automáticamente
        await supabase
          .from('movimientos_fondo')
          .update({
            forma_pago: nuevaFormaPagoOpuesta
          })
          .eq('id', movimientoRelacionado.id)
        
        // Recargar el movimiento relacionado actualizado
        const { data: relacionadoCorregido } = await supabase
          .from('movimientos_fondo')
          .select('*')
          .eq('id', movimientoRelacionado.id)
          .single()
        
        if (relacionadoCorregido) {
          relacionadoActualizado.forma_pago = relacionadoCorregido.forma_pago
        }
      }

      // Obtener datos anteriores del movimiento relacionado
      const datosAnterioresRelacionado = {
        id: movimientoRelacionado.id,
        natillera_id: movimientoRelacionado.natillera_id,
        tipo: movimientoRelacionado.tipo,
        monto: movimientoRelacionado.monto,
        forma_pago: movimientoRelacionado.forma_pago,
        descripcion: movimientoRelacionado.descripcion,
        fecha: movimientoRelacionado.fecha,
        created_at: movimientoRelacionado.created_at,
        updated_at: movimientoRelacionado.updated_at
      }

      // Preparar datos nuevos completos
      const datosNuevosCompletos = {
        ...movimientoActualizado,
        monto_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
        fecha_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
      }

      const datosNuevosRelacionadoCompletos = {
        ...relacionadoActualizado,
        monto_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
        fecha_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
      }

      // Detectar cambios específicos
      const cambiosDetectados = {
        monto: datosAnteriores.monto !== nuevoMonto ? { anterior: datosAnteriores.monto, nuevo: nuevoMonto } : null,
        forma_pago: datosAnteriores.forma_pago !== formMovimiento.value.formaPago ? { anterior: datosAnteriores.forma_pago, nuevo: formMovimiento.value.formaPago } : null,
        descripcion: datosAnteriores.descripcion !== descripcionBase ? { anterior: datosAnteriores.descripcion, nuevo: descripcionBase } : null,
        fecha: datosAnteriores.fecha !== nuevaFecha ? { anterior: datosAnteriores.fecha, nuevo: nuevaFecha } : null
      }

      // Registrar auditoría detallada para movimiento original
      const descripcionCambios = Object.entries(cambiosDetectados)
        .filter(([_, cambio]) => cambio !== null)
        .map(([campo, cambio]) => {
          if (campo === 'monto') return `Monto: $${cambio.anterior.toLocaleString('es-CO')} → $${cambio.nuevo.toLocaleString('es-CO')}`
          if (campo === 'forma_pago') return `Forma de pago: ${cambio.anterior} → ${cambio.nuevo}`
          if (campo === 'descripcion') return `Descripción: "${cambio.anterior}" → "${cambio.nuevo}"`
          if (campo === 'fecha') return `Fecha: ${new Date(cambio.anterior).toLocaleDateString('es-CO')} → ${new Date(cambio.nuevo).toLocaleDateString('es-CO')}`
          return `${campo}: ${cambio.anterior} → ${cambio.nuevo}`
        })
        .join(' | ')

      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarActualizacion(
          'movimientos_fondo',
          movimientoOriginal.id,
          `[TRANSFERENCIA - ACTUALIZACIÓN] Movimiento de salida actualizado. Cambios: ${descripcionCambios || 'Sin cambios detectados'}`,
          datosAnteriores,
          datosNuevosCompletos,
          id.value,
          {
            tipo_movimiento: 'transferencia',
            movimiento_relacionado_id: movimientoRelacionado.id,
            cambios: cambiosDetectados,
            descripcion_cambios: descripcionCambios,
            monto_anterior_formateado: `$${datosAnteriores.monto.toLocaleString('es-CO')}`,
            monto_nuevo_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
            fecha_anterior_formateada: new Date(datosAnteriores.fecha).toLocaleDateString('es-CO'),
            fecha_nueva_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
          }
        )
      )

      // Registrar auditoría detallada para movimiento relacionado
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarActualizacion(
          'movimientos_fondo',
          movimientoRelacionado.id,
          `[TRANSFERENCIA - ACTUALIZACIÓN] Movimiento de entrada relacionado actualizado. Cambios: ${descripcionCambios || 'Sin cambios detectados'}`,
          datosAnterioresRelacionado,
          datosNuevosRelacionadoCompletos,
          id.value,
          {
            tipo_movimiento: 'transferencia',
            movimiento_relacionado_id: movimientoOriginal.id,
            cambios: cambiosDetectados,
            descripcion_cambios: descripcionCambios,
            monto_anterior_formateado: `$${datosAnterioresRelacionado.monto.toLocaleString('es-CO')}`,
            monto_nuevo_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
            fecha_anterior_formateada: new Date(datosAnterioresRelacionado.fecha).toLocaleDateString('es-CO'),
            fecha_nueva_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
          }
        )
      )

      notificationStore.success('Transferencia actualizada correctamente', 'Éxito')
    } else {
      // Si no se encontró movimiento relacionado, solo actualizar este
      const cambiosDetectadosSolo = {
        monto: datosAnteriores.monto !== nuevoMonto ? { anterior: datosAnteriores.monto, nuevo: nuevoMonto } : null,
        forma_pago: datosAnteriores.forma_pago !== formMovimiento.value.formaPago ? { anterior: datosAnteriores.forma_pago, nuevo: formMovimiento.value.formaPago } : null,
        descripcion: datosAnteriores.descripcion !== descripcionBase ? { anterior: datosAnteriores.descripcion, nuevo: descripcionBase } : null,
        fecha: datosAnteriores.fecha !== nuevaFecha ? { anterior: datosAnteriores.fecha, nuevo: nuevaFecha } : null
      }

      const descripcionCambiosSolo = Object.entries(cambiosDetectadosSolo)
        .filter(([_, cambio]) => cambio !== null)
        .map(([campo, cambio]) => {
          if (campo === 'monto') return `Monto: $${cambio.anterior.toLocaleString('es-CO')} → $${cambio.nuevo.toLocaleString('es-CO')}`
          if (campo === 'forma_pago') return `Forma de pago: ${cambio.anterior} → ${cambio.nuevo}`
          if (campo === 'descripcion') return `Descripción: "${cambio.anterior}" → "${cambio.nuevo}"`
          if (campo === 'fecha') return `Fecha: ${new Date(cambio.anterior).toLocaleDateString('es-CO')} → ${new Date(cambio.nuevo).toLocaleDateString('es-CO')}`
          return `${campo}: ${cambio.anterior} → ${cambio.nuevo}`
        })
        .join(' | ')

      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarActualizacion(
          'movimientos_fondo',
          movimientoOriginal.id,
          `[TRANSFERENCIA - ACTUALIZACIÓN] Movimiento actualizado (sin relación encontrada). Cambios: ${descripcionCambiosSolo || 'Sin cambios detectados'}`,
          datosAnteriores,
          {
            ...movimientoActualizado,
            monto_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
          },
          id.value,
          {
            tipo_movimiento: 'transferencia',
            movimiento_relacionado_encontrado: false,
            cambios: cambiosDetectadosSolo,
            descripcion_cambios: descripcionCambiosSolo,
            monto_anterior_formateado: `$${datosAnteriores.monto.toLocaleString('es-CO')}`,
            monto_nuevo_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
            fecha_anterior_formateada: new Date(datosAnteriores.fecha).toLocaleDateString('es-CO'),
            fecha_nueva_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
          }
        )
      )
      notificationStore.success('Movimiento actualizado correctamente', 'Éxito')
    }
  } else {
    // Si no es transferencia, solo actualizar este movimiento
    const datosActualizados = {
      monto: nuevoMonto,
      forma_pago: formMovimiento.value.formaPago,
      descripcion: formMovimiento.value.descripcion || (movimientoOriginal.tipo === 'entrada' ? 'Ingreso manual' : 'Egreso manual'),
      fecha: nuevaFecha
    }
    if (movimientoOriginal.tipo === 'salida') {
      datosActualizados.origen_egreso = formMovimiento.value.origenEgreso || null
    }
    if (movimientoOriginal.tipo === 'entrada') {
      datosActualizados.destino_ingreso = formMovimiento.value.destinoIngreso || null
    }

    const { data: movimientoActualizado, error: errorUpdate } = await supabase
      .from('movimientos_fondo')
      .update(datosActualizados)
      .eq('id', movimientoOriginal.id)
      .select()
      .single()

    if (errorUpdate) throw errorUpdate

    // Detectar cambios específicos
    const cambiosDetectadosIngresoEgreso = {
      monto: datosAnteriores.monto !== nuevoMonto ? { anterior: datosAnteriores.monto, nuevo: nuevoMonto } : null,
      forma_pago: datosAnteriores.forma_pago !== formMovimiento.value.formaPago ? { anterior: datosAnteriores.forma_pago, nuevo: formMovimiento.value.formaPago } : null,
      descripcion: datosAnteriores.descripcion !== datosActualizados.descripcion ? { anterior: datosAnteriores.descripcion, nuevo: datosActualizados.descripcion } : null,
      fecha: datosAnteriores.fecha !== nuevaFecha ? { anterior: datosAnteriores.fecha, nuevo: nuevaFecha } : null,
      origen_egreso: (movimientoOriginal.tipo === 'salida' && (datosAnteriores.origen_egreso !== (formMovimiento.value.origenEgreso || null))) ? { anterior: datosAnteriores.origen_egreso, nuevo: formMovimiento.value.origenEgreso || null } : null,
      destino_ingreso: (movimientoOriginal.tipo === 'entrada' && (datosAnteriores.destino_ingreso !== (formMovimiento.value.destinoIngreso || null))) ? { anterior: datosAnteriores.destino_ingreso, nuevo: formMovimiento.value.destinoIngreso || null } : null
    }

    const descripcionCambiosIngresoEgreso = Object.entries(cambiosDetectadosIngresoEgreso)
      .filter(([_, cambio]) => cambio !== null)
      .map(([campo, cambio]) => {
        if (campo === 'monto') return `Monto: $${cambio.anterior.toLocaleString('es-CO')} → $${cambio.nuevo.toLocaleString('es-CO')}`
        if (campo === 'forma_pago') return `Forma de pago: ${cambio.anterior} → ${cambio.nuevo}`
        if (campo === 'descripcion') return `Descripción: "${cambio.anterior}" → "${cambio.nuevo}"`
        if (campo === 'fecha') return `Fecha: ${new Date(cambio.anterior).toLocaleDateString('es-CO')} → ${new Date(cambio.nuevo).toLocaleDateString('es-CO')}`
        if (campo === 'origen_egreso') return `Origen egreso: ${cambio.anterior || '—'} → ${cambio.nuevo || '—'}`
        if (campo === 'destino_ingreso') return `Destino ingreso: ${cambio.anterior || '—'} → ${cambio.nuevo || '—'}`
        return `${campo}: ${cambio.anterior} → ${cambio.nuevo}`
      })
      .join(' | ')

    // Registrar auditoría detallada
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarActualizacion(
        'movimientos_fondo',
        movimientoOriginal.id,
        `[${movimientoOriginal.tipo === 'entrada' ? 'INGRESO' : 'EGRESO'} - ACTUALIZACIÓN] Movimiento ${movimientoOriginal.tipo === 'entrada' ? 'de ingreso' : 'de egreso'} actualizado. Cambios: ${descripcionCambiosIngresoEgreso || 'Sin cambios detectados'}`,
        datosAnteriores,
        {
          ...movimientoActualizado,
          monto_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
          fecha_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO')
        },
        id.value,
        {
          tipo_movimiento: movimientoOriginal.tipo === 'entrada' ? 'ingreso' : 'egreso',
          cambios: cambiosDetectadosIngresoEgreso,
          descripcion_cambios: descripcionCambiosIngresoEgreso,
          monto_anterior_formateado: `$${datosAnteriores.monto.toLocaleString('es-CO')}`,
          monto_nuevo_formateado: `$${nuevoMonto.toLocaleString('es-CO')}`,
          fecha_anterior_formateada: new Date(datosAnteriores.fecha).toLocaleDateString('es-CO'),
          fecha_nueva_formateada: new Date(nuevaFecha).toLocaleDateString('es-CO'),
          forma_pago_anterior: datosAnteriores.forma_pago,
          forma_pago_nueva: formMovimiento.value.formaPago,
          es_manual: true
        }
      )
    )

    notificationStore.success(`${movimientoOriginal.tipo === 'entrada' ? 'Ingreso' : 'Egreso'} actualizado correctamente`, 'Éxito')
  }
}

watch(id, cargarDatos, { immediate: true })

// Cerrar dropdown de categorías al hacer clic fuera
function handleClickOutsideDropdowns(e) {
  if (dropdownCategoriasAbierto.value && dropdownCategoriasRef.value && !dropdownCategoriasRef.value.contains(e.target)) {
    dropdownCategoriasAbierto.value = false
  }
  if (dropdownOrdenarAbierto.value && dropdownOrdenarRef.value && !dropdownOrdenarRef.value.contains(e.target)) {
    dropdownOrdenarAbierto.value = false
  }
}
onMounted(() => document.addEventListener('click', handleClickOutsideDropdowns))
onUnmounted(() => document.removeEventListener('click', handleClickOutsideDropdowns))
</script>

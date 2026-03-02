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

    <!-- Pantalla de carga -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-250 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="loading"
          class="cuadre-loading-screen"
          role="status"
          aria-live="polite"
          aria-label="Cargando totales generales"
        >
          <div class="cuadre-loading-screen__bg">
            <div class="cuadre-loading-screen__blur cuadre-loading-screen__blur--1"></div>
            <div class="cuadre-loading-screen__blur cuadre-loading-screen__blur--2"></div>
            <div class="cuadre-loading-screen__blur cuadre-loading-screen__blur--3"></div>
          </div>
          <div class="cuadre-loading-screen__content">
            <div class="cuadre-loading-screen__icon-wrap">
              <CalculatorIcon class="cuadre-loading-screen__icon" aria-hidden="true" />
            </div>
            <h2 class="cuadre-loading-screen__title">Totales generales</h2>
            <p class="cuadre-loading-screen__subtitle">Calculando cuadre de caja</p>
            <div class="cuadre-loading-screen__spinner" aria-hidden="true"></div>
            <div class="cuadre-loading-screen__dots" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <template v-if="!loading">
      <!-- Tarjetas: Total esperado por forma de pago (clic para desglose) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- Efectivo esperado -->
        <button
          type="button"
          @click="modalDesgloseFormaPago = 'efectivo'"
          class="text-left bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 sm:p-6 border-2 border-green-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <BanknotesIcon class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-gray-700 font-semibold">EFECTIVO</p>
              <p class="text-gray-500 text-xs">Toca para ver desglose</p>
            </div>
          </div>
          <p class="text-green-700 text-2xl sm:text-3xl font-extrabold tabular-nums">
            ${{ formatMoney(totalEsperadoEfectivo) }}
          </p>
          <div class="mt-3 pt-3 border-t border-green-200/60 text-xs text-gray-600 space-y-0.5">
            <p>• Cuotas + Cuotas préstamos + Sanciones + Actividades: ${{ formatMoney(recaudadoEfectivo) }}</p>
            <p>• − Préstamos entregados: ${{ formatMoney(prestamosEfectivo) }}</p>
            <p v-if="premiosEfectivo > 0">• − Premios rifa: ${{ formatMoney(premiosEfectivo) }}</p>
            <p v-if="movimientosEfectivoNeto !== 0">• {{ movimientosEfectivoNeto >= 0 ? '+' : '' }} Movimientos: ${{ formatMoney(movimientosEfectivoNeto) }}</p>
          </div>
        </button>

        <!-- Transferencia esperada -->
        <button
          type="button"
          @click="modalDesgloseFormaPago = 'transferencia'"
          class="text-left bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <ArrowPathIcon class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-gray-700 font-semibold">TRANSFERENCIA</p>
              <p class="text-gray-500 text-xs">Toca para ver desglose</p>
            </div>
          </div>
          <p class="text-blue-700 text-2xl sm:text-3xl font-extrabold tabular-nums">
            ${{ formatMoney(totalEsperadoTransferencia) }}
          </p>
          <div class="mt-3 pt-3 border-t border-blue-200/60 text-xs text-gray-600 space-y-0.5">
            <p>• Cuotas + Cuotas préstamos + Sanciones + Actividades: ${{ formatMoney(recaudadoTransferencia) }}</p>
            <p>• − Préstamos entregados: ${{ formatMoney(prestamosTransferencia) }}</p>
            <p v-if="premiosTransferencia > 0">• − Premios rifa: ${{ formatMoney(premiosTransferencia) }}</p>
            <p v-if="movimientosTransferenciaNeto !== 0">• {{ movimientosTransferenciaNeto >= 0 ? '+' : '' }} Movimientos: ${{ formatMoney(movimientosTransferenciaNeto) }}</p>
          </div>
        </button>

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

      <!-- Modal desglose Recaudado vs Utilidad -->
      <ModalWrapper
        :show="!!modalDesgloseFormaPago"
        :z-index="50"
        align="bottom"
        overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        card-class="relative w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border"
        card-max-width="28rem"
        @close="modalDesgloseFormaPago = null"
      >
            <div
              :class="modalDesgloseFormaPago === 'efectivo' ? 'border-green-200' : 'border-blue-200'"
            >
              <div
                class="p-6 text-white"
                :class="modalDesgloseFormaPago === 'efectivo' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'"
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold">
                    {{ modalDesgloseFormaPago === 'efectivo' ? 'EFECTIVO' : 'TRANSFERENCIA' }}
                  </h3>
                  <button @click="modalDesgloseFormaPago = null" class="p-2 rounded-lg hover:bg-white/20 transition-colors">
                    <XMarkIcon class="w-6 h-6" />
                  </button>
                </div>
                <p class="text-white/90 text-sm mt-1">Desglose: Recaudado vs Utilidad</p>
              </div>
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
            </div>
      </ModalWrapper>

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
            <p class="text-sm text-gray-500 mt-0.5">Cuotas, sanciones y actividades con socio y forma de pago.</p>
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
          <!-- Ordenar por -->
          <div ref="dropdownOrdenarRef" class="relative flex flex-col gap-2 min-w-0">
            <label class="text-sm font-semibold text-gray-700 shrink-0">Ordenar por:</label>
            <button
              type="button"
              @click="dropdownOrdenarAbierto = !dropdownOrdenarAbierto"
              class="flex items-center justify-between gap-2 min-w-[8rem] px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span class="truncate">{{ OPCIONES_ORDENAR.find(o => o.value === ordenarDetallePor)?.label || 'Socio' }}</span>
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
                class="absolute top-full left-0 mt-1 z-50 py-2 rounded-xl bg-white border-2 border-gray-200 shadow-xl min-w-[8rem] overflow-hidden"
              >
                <button
                  v-for="opt in OPCIONES_ORDENAR"
                  :key="opt.value"
                  type="button"
                  @click="ordenarDetallePor = opt.value; dropdownOrdenarAbierto = false"
                  class="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-teal-50/80 transition-colors text-sm"
                  :class="ordenarDetallePor === opt.value ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700'"
                >
                  {{ opt.label }}
                </button>
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
                <table class="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr class="border-b-2 border-gray-200 text-left text-gray-600 font-semibold">
                      <th class="py-3 px-2">Concepto</th>
                      <th class="py-3 px-2">Socio</th>
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
                      <td colspan="3" class="py-3 px-2">Total (filtrado)</td>
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
            v-for="m in movimientosOrdenados"
            :key="m.id"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 hover:shadow-md transition-all"
            :class="m.tipo === 'entrada' ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'"
          >
            <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <!-- Icono de entrada/salida -->
              <div
                :class="[
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
                  m.tipo === 'entrada' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                ]"
              >
                <ArrowUpCircleIcon v-if="m.tipo === 'entrada'" class="w-6 h-6 sm:w-7 sm:h-7" />
                <ArrowDownCircleIcon v-else class="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div class="flex-1 min-w-0">
                <!-- Forma de pago -->
                <div class="flex items-center gap-2 flex-wrap mb-1.5 sm:mb-2">
                  <span
                    :class="[
                      'px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs font-bold shrink-0',
                      m.forma_pago === 'efectivo'
                        ? 'bg-green-100 text-green-800 border-2 border-green-400'
                        : 'bg-blue-100 text-blue-800 border-2 border-blue-400'
                    ]"
                  >
                    {{ m.forma_pago === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia' }}
                  </span>
                </div>
                
                <!-- Información del movimiento -->
                <div class="space-y-1">
                  <!-- Si es transferencia, mostrar origen y destino claramente -->
                  <div v-if="esTransferencia(m)" class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <span class="font-semibold text-gray-700 shrink-0">Transferencia:</span>
                    <span class="px-1.5 sm:px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-medium text-xs border border-orange-300 shrink-0">
                      {{ obtenerOrigenTransferencia(m) }}
                    </span>
                    <ArrowRightIcon class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
                    <span class="px-1.5 sm:px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-medium text-xs border border-teal-300 shrink-0">
                      {{ obtenerDestinoTransferencia(m) }}
                    </span>
                  </div>
                  
                  <!-- Descripción -->
                  <p class="font-semibold text-gray-900 text-sm sm:text-base leading-tight break-words">
                    {{ obtenerDescripcionLimpia(m) }}
                  </p>
                  
                  <!-- Fecha -->
                  <p class="text-xs text-gray-500 font-medium">{{ formatDate(m.fecha) }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-2 flex-shrink-0 sm:flex-shrink-0">
              <span
                :class="[
                  'text-base sm:text-lg font-extrabold tabular-nums',
                  m.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                ]"
              >
                {{ m.tipo === 'entrada' ? '+' : '−' }}${{ formatMoney(m.monto) }}
              </span>
              <div class="flex items-center gap-1 sm:gap-2">
                <button
                  v-if="puedeGestionarCuotas"
                  @click="abrirModalEditarMovimiento(m)"
                  class="p-1.5 sm:p-2 hover:bg-teal-50 rounded-lg text-teal-500 hover:text-teal-600 transition-colors"
                  title="Editar movimiento"
                >
                  <PencilIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  v-if="puedeGestionarCuotas"
                  @click="confirmarEliminarMovimiento(m)"
                  class="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                  title="Eliminar movimiento"
                >
                  <TrashIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal confirmar eliminar movimiento -->
    <ModalWrapper
      :show="!!movimientoAEliminar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6"
      card-max-width="24rem"
      @close="movimientoAEliminar = null"
    >
        <h3 class="text-lg font-bold text-gray-800 mb-2">¿Eliminar movimiento?</h3>
        <p class="text-gray-600 text-sm mb-4">{{ movimientoAEliminar?.descripcion || (movimientoAEliminar?.tipo === 'entrada' ? 'Entrada' : 'Salida') }} — ${{ formatMoney(movimientoAEliminar?.monto) }}</p>
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
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
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
  { value: 'prestamo', label: 'Préstamo' },
  { value: 'liquidacion_salida', label: 'Liquidación por salida' },
  { value: 'premio_rifa', label: 'Premio rifa' }
]
const filtroDetalleCategorias = ref([]) // Array: vacío = todas, si tiene valores = filtrar por esas
const filtroDetalleFormaPago = ref('todos')
const filtroDetalleBusqueda = ref('')
const filtroDetalleMes = ref('') // '' = todos los meses; 'YYYY-MM' = mes específico (solo meses en la natillera)
const ordenarDetallePor = ref('socio') // 'socio' | 'concepto' | 'monto' | 'periodo'
const OPCIONES_ORDENAR = [
  { value: 'socio', label: 'Socio' },
  { value: 'concepto', label: 'Concepto' },
  { value: 'monto', label: 'Monto' },
  { value: 'periodo', label: 'Período' }
]
const efectivoContado = ref(0)
const transferenciaContada = ref(0)

const modalDesgloseFormaPago = ref(null) // 'efectivo' | 'transferencia' | null

// Bloquear scroll del body cuando las modales están abiertas
const modalDesgloseOpen = computed(() => !!modalDesgloseFormaPago.value)
useBodyScrollLock(modalDesgloseOpen)
const dropdownCategoriasAbierto = ref(false)
const dropdownCategoriasRef = ref(null)
const dropdownOrdenarAbierto = ref(false)
const dropdownOrdenarRef = ref(null)
const movimientoAEliminar = ref(null)
const movimientoAEliminarOpen = computed(() => !!movimientoAEliminar.value)
useBodyScrollLock(movimientoAEliminarOpen)
const eliminandoMovimiento = ref(false)
const exportando = ref(false)

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
// detalleItems incluye: cuotas (valor_cuota), sanciones (valor_pagado_sancion), actividades (socios_actividad), préstamos (negativo)
const recaudadoEfectivo = computed(() => {
  return detalleItems.value.filter(i => (i.forma_pago || 'efectivo') === 'efectivo' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
})
const recaudadoTransferencia = computed(() => {
  return detalleItems.value.filter(i => (i.forma_pago || 'efectivo') === 'transferencia' && (i.monto || 0) > 0).reduce((s, i) => s + parseFloat(i.monto || 0), 0)
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
// Movimientos sin premios rifa (el premio ya se resta del recaudo vía detalleItems)
function esPremioRifaMovimiento(m) {
  if (m.tipo !== 'salida') return false
  const d = (m.descripcion ?? '').toString().toLowerCase().trim()
  return d.includes('premio rifa') || d.includes('rifa liquidada') || (d.includes('premio') && d.includes('rifa'))
}
const movimientosSinPremios = computed(() => {
  return movimientos.value.filter(m => !esPremioRifaMovimiento(m))
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
  console.log('  Recaudado (cuotas + cuotas préstamos + sanciones + actividades):', fmt(recaudadoTransferencia.value))
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
  const orden = ordenarDetallePor.value
  return [...list].sort((a, b) => {
    if (orden === 'socio') return (a.socio || '—').localeCompare(b.socio || '—', 'es')
    if (orden === 'concepto') return (a.concepto || '').localeCompare(b.concepto || '', 'es')
    if (orden === 'monto') return (parseFloat(b.monto) || 0) - (parseFloat(a.monto) || 0) // mayor primero
    if (orden === 'periodo') {
      const keyA = `${a.anio || 0}-${String(a.mes || 0).padStart(2, '0')}`
      const keyB = `${b.anio || 0}-${String(b.mes || 0).padStart(2, '0')}`
      return keyB.localeCompare(keyA) // más reciente primero
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
watch([filtroDetalleCategorias, filtroDetalleFormaPago, filtroDetalleBusqueda, filtroDetalleMes, ordenarDetallePor], () => {
  paginaActual.value = 1
})

// Si el mes seleccionado ya no está en la natillera, quitar filtro
watch(mesesEnNatillera, (nuevos) => {
  if (filtroDetalleMes.value && !nuevos.some(m => m.value === filtroDetalleMes.value)) {
    filtroDetalleMes.value = ''
  }
}, { immediate: true })

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
  const map = { cuota: 'Cuota', cuota_prestamo: 'Cuota préstamo', sancion: 'Sanción', actividad: 'Actividad', prestamo: 'Préstamo', liquidacion_salida: 'Liquidación por salida', premio_rifa: 'Premio rifa' }
  return map[tipo] || tipo
}
function getConceptoClass(tipo, esParcial = false) {
  if (esParcial && (tipo === 'cuota' || tipo === 'cuota_prestamo')) {
    return 'bg-orange-100 text-orange-800 border border-orange-300/60'
  }
  const map = { cuota: 'bg-emerald-100 text-emerald-800', cuota_prestamo: 'bg-teal-100 text-teal-800', sancion: 'bg-red-100 text-red-800', actividad: 'bg-purple-100 text-purple-800', prestamo: 'bg-blue-100 text-blue-800', liquidacion_salida: 'bg-amber-100 text-amber-800', premio_rifa: 'bg-amber-100 text-amber-800' }
  return map[tipo] || 'bg-gray-100 text-gray-700'
}
function getMesLabel(mes) {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return meses[Number(mes) - 1] || mes
}

function formatMoney(val) {
  const n = parseFloat(val) || 0
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

async function exportarAExcel() {
  if (detalleFiltrado.value.length === 0) return
  exportando.value = true
  try {
    const datosExportar = detalleFiltrado.value.map(i => ({
      Concepto: i.concepto,
      Socio: i.socio || '—',
      'Forma de pago': i.forma_pago === 'transferencia' ? 'Transferencia' : 'Efectivo',
      Período: i.mes && i.anio ? `${getMesLabel(i.mes)} ${i.anio}` : '—',
      Monto: parseFloat(i.monto) || 0
    }))

    const wb = XLSX.utils.book_new()
    const wsData = [
      [natillera.value?.nombre || 'Natillera'],
      ['Cuadre de Caja - Detalle por concepto'],
      ['Exportado:', new Date().toLocaleString('es-CO')],
      ['Filtros:', `Categoría: ${filtroDetalleCategorias.value.length === 0 ? 'Todas' : filtroDetalleCategorias.value.map(c => getConceptoLabel(c)).join(', ')} | Forma de pago: ${filtroDetalleFormaPago.value === 'todos' ? 'Todas' : filtroDetalleFormaPago.value}${filtroDetalleMes.value ? ` | Mes: ${getMesLabel(Number(filtroDetalleMes.value.split('-')[1]))} ${filtroDetalleMes.value.split('-')[0]}` : ''}`],
      [],
      ['Concepto', 'Socio', 'Forma de pago', 'Período', 'Monto'],
      ...datosExportar.map(d => [d.Concepto, d.Socio, d['Forma de pago'], d.Período, d.Monto]),
      [],
      ['TOTAL', '', '', '', totalDetalleFiltrado.value]
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    const colorTeal = { rgb: '14B8A6' }
    const colorTealOscuro = { rgb: '0D9488' }
    const colorVerde = { rgb: '10B981' }
    const colorRojo = { rgb: 'DC2626' }
    const colorGrisClaro = { rgb: 'F3F4F6' }
    const colorBlanco = { rgb: 'FFFFFF' }

    ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
    ws['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
    ws['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }
    ws['A4'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }

    const headerRow = 5
    for (let col = 0; col < 5; col++) {
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
      const isEven = (row - dataStartRow) % 2 === 0
      const monto = datosExportar[row - dataStartRow]?.Monto ?? 0
      for (let col = 0; col < 5; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cell]) continue
        ws[cell].s = {
          fill: { fgColor: isEven ? colorBlanco : colorGrisClaro, patternType: 'solid' },
          font: { sz: 10, color: col === 4 ? (monto >= 0 ? { rgb: '047857' } : colorRojo) : { rgb: '1F2937' } },
          alignment: { horizontal: col === 4 ? 'right' : 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } }
        }
        if (col === 4) ws[cell].z = monto >= 0 ? '#,##0' : '#,##0;[Red]-#,##0'
      }
    }

    const totalRow = dataEndRow + 2 // una fila vacía + fila total
    const cellTotalLabel = XLSX.utils.encode_cell({ r: totalRow, c: 0 })
    const cellTotalVal = XLSX.utils.encode_cell({ r: totalRow, c: 4 })
    ws[cellTotalLabel].s = {
      fill: { fgColor: { rgb: 'CCFBF1' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '0F766E' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'medium', color: colorTealOscuro }, bottom: { style: 'medium', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellTotalVal].s = {
      fill: { fgColor: { rgb: 'CCFBF1' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: totalDetalleFiltrado.value >= 0 ? { rgb: '047857' } : colorRojo },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'medium', color: colorTealOscuro }, bottom: { style: 'medium', color: colorTealOscuro }, left: { style: 'thin', color: colorTealOscuro }, right: { style: 'thin', color: colorTealOscuro } }
    }
    ws[cellTotalVal].z = totalDetalleFiltrado.value >= 0 ? '#,##0' : '#,##0;[Red]-#,##0'

    ws['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 14 }]
    ws['!merges'] = []

    XLSX.utils.book_append_sheet(wb, ws, 'Cuadre de Caja')
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

function buildDetalleItems(nat, prestamosData, sociosActividadData, movimientosData = null, cuotasPrestamoPagadas = []) {
  const items = []
  if (!nat) return items
  const sociosMap = {}
  ;(nat.socios_natillera || []).forEach(sn => {
    sociosMap[sn.id] = sn.socio?.nombre || 'Socio'
  })
  // Incluir cuotas pagadas y con pago parcial (valor_pagado > 0)
  const cuotasConPago = (nat.cuotas || []).filter(c => c.estado === 'pagada' || (parseFloat(c.valor_pagado) || 0) > 0)
  const tipoPago = (t) => (String(t || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo')

  // Cuotas y sanciones (entradas) - soporte pago mixto con desglose
  cuotasConPago.forEach(c => {
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
      items.push({
        tipo: 'cuota',
        concepto: esParcial ? 'Cuota (Parcial)' : 'Cuota',
        socio,
        forma_pago: forma,
        monto,
        mes: c.mes,
        anio: c.anio,
        esParcial
      })
    }
    const pushSancion = (forma, monto) => {
      if (monto <= 0) return
      items.push({ tipo: 'sancion', concepto: 'Sanción', socio, forma_pago: forma, monto, mes: c.mes, anio: c.anio })
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

  // Cuotas de préstamos pagadas o con pago parcial - soporte pago mixto
  ;(cuotasPrestamoPagadas || []).forEach(pp => {
    const vEfectivo = parseFloat(pp.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(pp.valor_pagado_transferencia) || 0
    const montoTotal = vEfectivo + vTransferencia
    const monto = montoTotal > 0 ? montoTotal : (parseFloat(pp.valor_pagado) ?? 0)
    if (monto <= 0) return
    const esParcial = pp.pagada === false && monto > 0
    const socio = (pp.nombre_socio || '').trim() || '—'
    const baseConcepto = `Cuota préstamo ${pp.numero_cuota != null ? `#${pp.numero_cuota}` : ''}`.trim()
    const concepto = esParcial ? `${baseConcepto || 'Cuota préstamo'} (Parcial)` : (baseConcepto || 'Cuota préstamo')
    if (vEfectivo > 0 && vTransferencia > 0) {
      items.push({ tipo: 'cuota_prestamo', concepto: concepto + ' (Efectivo)', socio, forma_pago: 'efectivo', monto: vEfectivo, esParcial })
      items.push({ tipo: 'cuota_prestamo', concepto: concepto + ' (Transfer.)', socio, forma_pago: 'transferencia', monto: vTransferencia, esParcial })
    } else if (vEfectivo > 0 || vTransferencia > 0) {
      const fp = vEfectivo > 0 ? 'efectivo' : 'transferencia'
      items.push({ tipo: 'cuota_prestamo', concepto, socio, forma_pago: fp, monto: vEfectivo || vTransferencia, esParcial })
    } else {
      const fp = tipoPago(pp.forma_pago)
      items.push({ tipo: 'cuota_prestamo', concepto, socio, forma_pago: fp, monto, esParcial })
    }
  })

  // Actividades desglosadas - soporte pago mixto
  ;(sociosActividadData || []).forEach(sa => {
    const socio = sa.socio_natillera?.socio?.nombre || sociosMap[sa.socio_natillera_id] || '—'
    const nombreActividad = sa.actividad?.descripcion || 'Actividad'
    const vEfectivo = parseFloat(sa.valor_pagado_efectivo) || 0
    const vTransferencia = parseFloat(sa.valor_pagado_transferencia) || 0
    const monto = vEfectivo + vTransferencia || parseFloat(sa.valor_pagado) || 0
    if (monto <= 0) return
    if (vEfectivo > 0 && vTransferencia > 0) {
      items.push({ tipo: 'actividad', concepto: nombreActividad + ' (Efectivo)', socio, forma_pago: 'efectivo', monto: vEfectivo })
      items.push({ tipo: 'actividad', concepto: nombreActividad + ' (Transfer.)', socio, forma_pago: 'transferencia', monto: vTransferencia })
    } else if (vEfectivo > 0 || vTransferencia > 0) {
      const fp = vEfectivo > 0 ? 'efectivo' : 'transferencia'
      items.push({ tipo: 'actividad', concepto: nombreActividad, socio, forma_pago: fp, monto: vEfectivo || vTransferencia })
    } else {
      const fp = tipoPago(sa.forma_pago)
      items.push({ tipo: 'actividad', concepto: nombreActividad, socio, forma_pago: fp, monto })
    }
  })

  // Préstamos (salidas, monto negativo). Con interés anticipado se descuenta del fondo el total a pagar (monto + intereses).
  ;(prestamosData || []).forEach(p => {
    const socio = sociosMap[p.socio_natillera_id] || '—'
    const fp = tipoPago(p.medio_entrega)
    const monto = parseFloat(p.monto) || 0
    if (monto > 0) {
      const aDescontar = p.interes_anticipado && p.interes_total != null
        ? monto + parseFloat(p.interes_total)
        : monto
      items.push({ tipo: 'prestamo', concepto: 'Préstamo', socio, forma_pago: fp, monto: -aDescontar })
    }
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
      items.push({ tipo: 'premio_rifa', concepto: conceptoDesc.length > 50 ? 'Premio rifa' : conceptoDesc, socio: '—', forma_pago: fp, monto: -monto })
    }
  })
  // Si no hubo premios en movimientos_fondo, tomar de actividades liquidadas (gastos = premio entregado)
  if (premiosFromMov.length === 0 && (nat.actividades || []).length > 0) {
    ;(nat.actividades || []).filter(a => a.estado === 'liquidada' && (parseFloat(a.gastos) || 0) > 0).forEach(a => {
      const monto = parseFloat(a.gastos) || 0
      const concepto = (a.descripcion && a.descripcion.length <= 50) ? `Premio: ${a.descripcion}` : 'Premio rifa'
      items.push({ tipo: 'premio_rifa', concepto, socio: '—', forma_pago: 'efectivo', monto: -monto })
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
      items.push({ tipo: 'liquidacion_salida', concepto: 'Liquidación por salida', socio: socioDesc, forma_pago: fp, monto: -monto, anio, mes })
    }
  })

  // Ordenar: por año-mes desc, luego por tipo (cuota, cuota_prestamo, sancion, actividad, prestamo, liquidacion_salida, premio_rifa)
  const ordenTipo = { cuota: 0, cuota_prestamo: 0.5, sancion: 1, actividad: 2, prestamo: 3, liquidacion_salida: 3.5, premio_rifa: 4 }
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
    .select('valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, forma_pago, socio_natillera_id, actividad:actividades(descripcion)')
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
    .select('id, monto, medio_entrega, socio_natillera_id, interes_anticipado, interes_total')
    .in('socio_natillera_id', ids)
    .in('estado', ['activo', 'pagado'])
  return prestamos || []
}

async function cargarCuotasPrestamoPagadasParaDetalle(prestamoIds) {
  if (!prestamoIds || prestamoIds.length === 0) return []
  const { data } = await supabase
    .from('plan_pagos_prestamo')
    .select('valor_pagado, valor_pagado_efectivo, valor_pagado_transferencia, valor_cuota, forma_pago, nombre_socio, numero_cuota, fecha_pago, pagada')
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
    const cuotasPrestamoPagadas = await cargarCuotasPrestamoPagadasParaDetalle(prestamoIds)
    detalleItems.value = buildDetalleItems(nat, prestamosData, sociosActividadData, movs || [], cuotasPrestamoPagadas)
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
    const esTransferencia = esTransferenciaMovimiento(movimiento)
    
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

    // Si es transferencia, buscar el movimiento relacionado (par entrada/salida) para eliminar ambos
    let movimientoRelacionado = null
    if (esTransferencia) {
      movimientoRelacionado = await buscarMovimientoRelacionadoTransferencia(movimiento)
    }

    // Si es transferencia y no se encontró el movimiento relacionado, mostrar advertencia pero continuar
    if (esTransferencia && !movimientoRelacionado) {
      console.warn('⚠️ Advertencia: No se encontró movimiento relacionado para la transferencia. Se eliminará solo el movimiento seleccionado.')
    }

    // Eliminar ambos movimientos si es transferencia (o solo uno si no es transferencia)
    // Primero eliminar el movimiento relacionado si existe, luego el original
    if (esTransferencia && movimientoRelacionado) {
      // Eliminar primero el movimiento relacionado
      const { error: errorRelacionado } = await supabase
        .from('movimientos_fondo')
        .delete()
        .eq('id', movimientoRelacionado.id)
      
      if (errorRelacionado) {
        throw new Error(`Error al eliminar movimiento relacionado: ${errorRelacionado.message}`)
      }
    }

    // Eliminar el movimiento original
    const { error } = await supabase
      .from('movimientos_fondo')
      .delete()
      .eq('id', movimiento.id)
    
    if (error) {
      // Si falla la eliminación del original pero ya se eliminó el relacionado, 
      // intentar recrear el relacionado (rollback parcial)
      if (esTransferencia && movimientoRelacionado) {
        console.error('❌ Error al eliminar movimiento original después de eliminar el relacionado. Se intentará recrear el relacionado.')
        // No podemos recrear fácilmente, así que solo registramos el error
      }
      throw error
    }

    // Registrar auditoría detallada de eliminación
    const auditoria = useAuditoria()
    const tipoMovimientoTexto = esTransferencia 
      ? 'TRANSFERENCIA' 
      : (movimiento.tipo === 'entrada' ? 'INGRESO' : 'EGRESO')
    
    const descripcionEliminacion = `[${tipoMovimientoTexto} - ELIMINACIÓN] ${esTransferencia ? 'Transferencia' : movimiento.tipo === 'entrada' ? 'Ingreso' : 'Egreso'} de $${movimiento.monto.toLocaleString('es-CO')} en ${movimiento.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}${movimiento.descripcion ? ` - ${movimiento.descripcion}` : ''} eliminado`

    // Si existe movimiento relacionado, registrar auditoría de su eliminación
    if (esTransferencia && movimientoRelacionado) {
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
      // Si no es transferencia o no se encontró relacionado, usar la auditoría original
      registrarAuditoriaEnSegundoPlano(
        auditoria.registrarEliminacion(
          'movimientos_fondo',
          movimiento.id,
          descripcionEliminacion,
          datosCompletosEliminacion,
          id.value,
          {
            tipo_movimiento: esTransferencia ? 'transferencia' : (movimiento.tipo === 'entrada' ? 'ingreso' : 'egreso'),
            monto_formateado: `$${movimiento.monto.toLocaleString('es-CO')}`,
            fecha_formateada: new Date(movimiento.fecha).toLocaleDateString('es-CO'),
            forma_pago: movimiento.forma_pago,
            descripcion: movimiento.descripcion,
            movimiento_relacionado_id: movimientoRelacionado?.id || null,
            movimiento_relacionado_encontrado: !!movimientoRelacionado,
            motivo_eliminacion: esTransferencia && !movimientoRelacionado 
              ? 'Eliminación manual por usuario. No se encontró movimiento relacionado.' 
              : 'Eliminación manual por usuario'
          }
        )
      )
    }

    movimientoAEliminar.value = null
    
    // Mensaje de éxito según si se eliminaron ambos movimientos
    if (esTransferencia && movimientoRelacionado) {
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
  
  // Determinar tipo de movimiento
  const esTransferencia = esTransferenciaMovimiento(movimiento)
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

// Buscar el movimiento "gemelo" de una transferencia (el otro registro del par entrada/salida)
async function buscarMovimientoRelacionadoTransferencia(movimiento) {
  if (!esTransferenciaMovimiento(movimiento)) return null
  const tipoOpuesto = movimiento.tipo === 'entrada' ? 'salida' : 'entrada'
  const formaPagoOpuesta = movimiento.forma_pago === 'efectivo' ? 'transferencia' : 'efectivo'
  const fechaNorm = normalizarFechaParaConsulta(movimiento.fecha)
  const montoNorm = parseFloat(movimiento.monto)
  if (!fechaNorm || isNaN(montoNorm)) return null

  // Buscar por misma fecha (normalizada), monto, tipo opuesto y forma de pago opuesta
  const { data: lista } = await supabase
    .from('movimientos_fondo')
    .select('*')
    .eq('natillera_id', id.value)
    .eq('fecha', fechaNorm)
    .eq('tipo', tipoOpuesto)
    .eq('forma_pago', formaPagoOpuesta)
    .eq('monto', montoNorm)
    .neq('id', movimiento.id)
    .ilike('descripcion', '%transferencia%')
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
    .ilike('descripcion', '%transferencia%')
    .limit(5)

  if (!candidatos?.length) return null
  const relacionado = candidatos.find(m => normalizarFechaParaConsulta(m.fecha) === fechaNorm)
  return relacionado || null
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

  const esTransferencia = esTransferenciaMovimiento(movimientoOriginal)
  
  if (esTransferencia) {
    // Si es transferencia, encontrar y actualizar también el movimiento relacionado (par entrada/salida)
    const descripcionBase = formMovimiento.value.descripcion || movimientoOriginal.descripcion || 'Transferencia'
    const nuevaFormaPagoOpuesta = formMovimiento.value.formaPago === 'efectivo' ? 'transferencia' : 'efectivo'
    const movimientoRelacionado = await buscarMovimientoRelacionadoTransferencia(movimientoOriginal)

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

<style scoped>
.cuadre-loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  box-sizing: border-box;
}

.cuadre-loading-screen__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 35%, #ccfbf1 70%, #f0fdfa 100%);
}

.cuadre-loading-screen__blur {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: cuadre-loading-float 8s ease-in-out infinite;
}

.cuadre-loading-screen__blur--1 {
  width: 320px;
  height: 320px;
  background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 50%, transparent);
  top: -80px;
  right: -80px;
  animation-delay: 0s;
}

.cuadre-loading-screen__blur--2 {
  width: 280px;
  height: 280px;
  background: linear-gradient(225deg, #6ee7b7 0%, #34d399 50%, transparent);
  bottom: -60px;
  left: -60px;
  animation-delay: -2.5s;
}

.cuadre-loading-screen__blur--3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(180deg, #67e8f9 0%, #22d3ee 50%, transparent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: none;
}

@keyframes cuadre-loading-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(8px, -8px) scale(1.05); }
  66% { transform: translate(-6px, 6px) scale(0.98); }
}

.cuadre-loading-screen__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.cuadre-loading-screen__icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(145deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%);
  box-shadow: 0 20px 40px -12px rgba(13, 148, 136, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  animation: cuadre-loading-icon-pulse 2s ease-in-out infinite;
}

.cuadre-loading-screen__icon {
  width: 40px;
  height: 40px;
  color: white;
}

@keyframes cuadre-loading-icon-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 20px 40px -12px rgba(13, 148, 136, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset; }
  50% { transform: scale(1.05); box-shadow: 0 24px 48px -12px rgba(13, 148, 136, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.25) inset; }
}

.cuadre-loading-screen__title {
  font-family: var(--font-display), sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #134e4a;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.cuadre-loading-screen__subtitle {
  font-size: 0.9375rem;
  color: #0f766e;
  margin: 0 0 1.25rem 0;
  font-weight: 500;
}

.cuadre-loading-screen__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(20, 184, 166, 0.25);
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: cuadre-loading-spin 0.85s linear infinite;
}

@keyframes cuadre-loading-spin {
  to { transform: rotate(360deg); }
}

.cuadre-loading-screen__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cuadre-loading-screen__dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0d9488;
  animation: cuadre-loading-bounce 1.2s ease-in-out infinite both;
}

.cuadre-loading-screen__dots span:nth-child(1) { animation-delay: 0s; }
.cuadre-loading-screen__dots span:nth-child(2) { animation-delay: 0.15s; }
.cuadre-loading-screen__dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes cuadre-loading-bounce {
  0%, 80%, 100% { transform: scale(0.85); opacity: 0.6; }
  40% { transform: scale(1.2); opacity: 1; }
}
</style>

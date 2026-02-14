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
            <p>• Cuotas + Sanciones + Actividades: ${{ formatMoney(recaudadoEfectivo) }}</p>
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
            <p>• Cuotas + Sanciones + Actividades: ${{ formatMoney(recaudadoTransferencia) }}</p>
            <p>• − Préstamos entregados: ${{ formatMoney(prestamosTransferencia) }}</p>
            <p v-if="premiosTransferencia > 0">• − Premios rifa: ${{ formatMoney(premiosTransferencia) }}</p>
            <p v-if="movimientosTransferenciaNeto !== 0">• {{ movimientosTransferenciaNeto >= 0 ? '+' : '' }} Movimientos: ${{ formatMoney(movimientosTransferenciaNeto) }}</p>
          </div>
        </button>
      </div>

      <!-- Modal desglose Recaudado vs Utilidad -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="modalDesgloseFormaPago" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDesgloseFormaPago = null"></div>
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="modalDesgloseFormaPago"
              class="relative w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border"
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
                <!-- Recaudado (cuotas) -->
                <div class="rounded-xl p-4 border-2" :class="modalDesgloseFormaPago === 'efectivo' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Recaudado (cuotas)</p>
                  <p class="text-2xl font-bold tabular-nums" :class="modalDesgloseFormaPago === 'efectivo' ? 'text-green-700' : 'text-blue-700'">
                    ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? recaudadoCuotasEfectivo : recaudadoCuotasTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Aportes de socios (valor cuota)</p>
                </div>
                <!-- Utilidad (sanciones + actividades) -->
                <div class="rounded-xl p-4 border-2" :class="modalDesgloseFormaPago === 'efectivo' ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Utilidad (sanciones + actividades)</p>
                  <p class="text-2xl font-bold tabular-nums text-violet-700">
                    ${{ formatMoney(modalDesgloseFormaPago === 'efectivo' ? utilidadEfectivo : utilidadTransferencia) }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">Multas pagadas y actividades extraordinarias</p>
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
          </Transition>
        </div>
      </Transition>

      <!-- Detalle por concepto: Cuotas, Sanciones, Actividades, Préstamos -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TableCellsIcon class="w-5 h-5 text-teal-600" />
              Detalle por concepto
            </h2>
            <p class="text-sm text-gray-500 mt-0.5">Cuotas, sanciones y actividades con socio y forma de pago.</p>
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
          <div class="flex flex-col sm:flex-row gap-4 flex-wrap">
          <!-- Filtro categoría -->
          <div class="flex items-center gap-2 min-w-0">
            <label class="text-sm font-semibold text-gray-700 shrink-0">Categoría:</label>
            <select
              v-model="filtroDetalleCategoria"
              class="flex-1 sm:w-auto min-w-0 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm"
            >
              <option value="todos">Todas</option>
              <option value="cuota">Cuota</option>
              <option value="sancion">Sanción</option>
              <option value="actividad">Actividad</option>
              <option value="prestamo">Préstamo</option>
              <option value="premio_rifa">Premio rifa</option>
            </select>
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
          </div>
        </div>
        <!-- Grid desktop / Cards móvil -->
        <div v-if="detalleFiltrado.length === 0" class="text-center py-8 text-gray-500 rounded-xl bg-gray-50 border border-dashed border-gray-200">
          <p class="font-medium">No hay registros para mostrar</p>
        </div>
        <!-- Desktop: tabla grid -->
        <div v-else class="hidden sm:block overflow-x-auto -mx-1">
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
                v-for="(item, idx) in detalleFiltrado"
                :key="`${item.tipo}-${idx}-${item.socio}-${item.monto}`"
                class="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
              >
                <td class="py-2.5 px-2">
                  <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium max-w-[200px] truncate', getConceptoClass(item.tipo)]" :title="item.concepto">
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
        <div class="sm:hidden space-y-2">
          <div
            v-for="(item, idx) in detalleFiltrado"
            :key="`mob-${item.tipo}-${idx}-${item.socio}-${item.monto}`"
            class="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span :class="['inline-flex px-2 py-0.5 rounded-lg text-xs font-medium shrink-0 max-w-full truncate', getConceptoClass(item.tipo)]" :title="item.concepto">
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
      </div>

      <!-- Lista de movimientos -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ListBulletIcon class="w-5 h-5 text-teal-600" />
          Movimientos de caja
        </h2>
        <p class="text-sm text-gray-500 mb-4">Entradas y salidas manuales (depósitos, retiros, gastos operativos).</p>
        <div v-if="movimientos.length === 0" class="text-center py-8 text-gray-500 rounded-xl bg-gray-50 border border-dashed border-gray-200">
          <p class="font-medium">No hay movimientos registrados</p>
          <p class="text-sm mt-1">Los movimientos se suman o restan del total esperado.</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="m in movimientosOrdenados"
            :key="m.id"
            class="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-800 truncate">{{ m.descripcion || (m.tipo === 'entrada' ? 'Entrada' : 'Salida') }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(m.fecha) }} · {{ m.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia' }}</p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <span :class="m.tipo === 'entrada' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                {{ m.tipo === 'entrada' ? '+' : '−' }}${{ formatMoney(m.monto) }}
              </span>
              <button
                v-if="puedeGestionarCuotas"
                @click="confirmarEliminarMovimiento(m)"
                class="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                title="Eliminar movimiento"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal confirmar eliminar movimiento -->
    <div v-if="movimientoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" @click="movimientoAEliminar = null"></div>
      <div class="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-2">¿Eliminar movimiento?</h3>
        <p class="text-gray-600 text-sm mb-4">{{ movimientoAEliminar?.descripcion || (movimientoAEliminar?.tipo === 'entrada' ? 'Entrada' : 'Salida') }} — ${{ formatMoney(movimientoAEliminar?.monto) }}</p>
        <div class="flex gap-3">
          <button @click="movimientoAEliminar = null" class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button @click="eliminarMovimientoConfirmado" :disabled="eliminandoMovimiento" class="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50">
            {{ eliminandoMovimiento ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNatillerasStore } from '../../stores/natilleras'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'
import BackButton from '../../components/BackButton.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import {
  CalculatorIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ListBulletIcon,
  TrashIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  XMarkIcon
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
const filtroDetalleCategoria = ref('todos')
const filtroDetalleFormaPago = ref('todos')
const filtroDetalleBusqueda = ref('')
const efectivoContado = ref(0)
const transferenciaContada = ref(0)

const modalDesgloseFormaPago = ref(null) // 'efectivo' | 'transferencia' | null
const movimientoAEliminar = ref(null)
const eliminandoMovimiento = ref(false)
const exportando = ref(false)

// Permisos
const esAdmin = computed(() => {
  return natillera.value?.admin_id && authStore.user?.id === natillera.value?.admin_id
})
const misPermisos = ref(null)
const puedeGestionarCuotas = computed(() => {
  if (esAdmin.value) return true
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

// Log del cálculo de totales generales y valor de cada concepto (consola del navegador)
function logCalculoTotalesGenerales() {
  const fmt = (n) => (parseFloat(n) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  console.group('📊 Totales generales – Cálculo por concepto')
  console.log('--- EFECTIVO ---')
  console.log('  Recaudado (cuotas + sanciones + actividades):', fmt(recaudadoEfectivo.value))
  console.log('  − Préstamos entregados:', fmt(prestamosEfectivo.value))
  console.log('  − Premios rifa:', fmt(premiosEfectivo.value))
  console.log('  Recaudado neto (recaudado − préstamos − premios):', fmt(Math.max(0, recaudadoEfectivo.value - prestamosEfectivo.value - premiosEfectivo.value)))
  console.log('  + Movimientos de fondo (neto, sin premios):', fmt(movimientosEfectivoNeto.value))
  console.log('  = Total esperado efectivo:', fmt(totalEsperadoEfectivo.value))
  console.log('--- TRANSFERENCIA ---')
  console.log('  Recaudado (cuotas + sanciones + actividades):', fmt(recaudadoTransferencia.value))
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

const detalleFiltrado = computed(() => {
  let list = detalleItems.value
  if (filtroDetalleCategoria.value !== 'todos') {
    list = list.filter(i => i.tipo === filtroDetalleCategoria.value)
  }
  if (filtroDetalleFormaPago.value !== 'todos') {
    list = list.filter(i => (i.forma_pago || 'efectivo') === filtroDetalleFormaPago.value)
  }
  const busqueda = filtroDetalleBusqueda.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (busqueda) {
    list = list.filter(i => {
      const concepto = (i.concepto || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      const socio = (i.socio || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      return concepto.includes(busqueda) || socio.includes(busqueda)
    })
  }
  return list
})
const totalDetalleFiltrado = computed(() => {
  return detalleFiltrado.value.reduce((s, i) => s + (parseFloat(i.monto) || 0), 0)
})

function getConceptoLabel(tipo) {
  const map = { cuota: 'Cuota', sancion: 'Sanción', actividad: 'Actividad', prestamo: 'Préstamo', premio_rifa: 'Premio rifa' }
  return map[tipo] || tipo
}
function getConceptoClass(tipo) {
  const map = { cuota: 'bg-emerald-100 text-emerald-800', sancion: 'bg-red-100 text-red-800', actividad: 'bg-purple-100 text-purple-800', prestamo: 'bg-blue-100 text-blue-800', premio_rifa: 'bg-amber-100 text-amber-800' }
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
      ['Filtros:', `Categoría: ${filtroDetalleCategoria.value === 'todos' ? 'Todas' : getConceptoLabel(filtroDetalleCategoria.value)} | Forma de pago: ${filtroDetalleFormaPago.value === 'todos' ? 'Todas' : filtroDetalleFormaPago.value}`],
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

function buildDetalleItems(nat, prestamosData, sociosActividadData, movimientosData = null) {
  const items = []
  if (!nat) return items
  const sociosMap = {}
  ;(nat.socios_natillera || []).forEach(sn => {
    sociosMap[sn.id] = sn.socio?.nombre || 'Socio'
  })
  const cuotasPagadas = (nat.cuotas || []).filter(c => c.estado === 'pagada')
  const tipoPago = (t) => (String(t || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo')

  // Cuotas y sanciones (entradas) - usar valor_pagado_sancion para lo realmente cobrado
  cuotasPagadas.forEach(c => {
    const socio = sociosMap[c.socio_natillera_id] || '—'
    const fp = tipoPago(c.tipo_pago)
    const vCuota = parseFloat(c.valor_cuota) || 0
    const vSancion = parseFloat(c.valor_pagado_sancion) || parseFloat(c.valor_multa) || 0
    if (vCuota > 0) {
      items.push({ tipo: 'cuota', concepto: 'Cuota', socio, forma_pago: fp, monto: vCuota, mes: c.mes, anio: c.anio })
    }
    if (vSancion > 0) {
      items.push({ tipo: 'sancion', concepto: 'Sanción', socio, forma_pago: fp, monto: vSancion, mes: c.mes, anio: c.anio })
    }
  })

  // Actividades desglosadas por nombre (desde socios_actividad)
  ;(sociosActividadData || []).forEach(sa => {
    const socio = sa.socio_natillera?.socio?.nombre || sociosMap[sa.socio_natillera_id] || '—'
    const nombreActividad = sa.actividad?.descripcion || 'Actividad'
    const fp = tipoPago(sa.forma_pago)
    const monto = parseFloat(sa.valor_pagado) || 0
    if (monto > 0) {
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

  // Ordenar: por año-mes desc, luego por tipo (cuota, sancion, actividad, prestamo, premio_rifa)
  const ordenTipo = { cuota: 0, sancion: 1, actividad: 2, prestamo: 3, premio_rifa: 4 }
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
    .select('valor_pagado, forma_pago, socio_natillera_id, actividad:actividades(descripcion)')
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
        .select('id, tipo, monto, forma_pago, descripcion, fecha')
        .eq('natillera_id', id.value)
        .order('fecha', { ascending: false }),
      cargarPrestamosParaDetalle(id.value, idsSocioNatillera),
      cargarSociosActividadParaDetalle(id.value, idsSocioNatillera),
      colaboradoresStore.obtenerMisPermisos(id.value)
    ])

    const { data: movs, error } = movimientosResult
    if (error) throw error
    movimientos.value = movs || []

    detalleItems.value = buildDetalleItems(nat, prestamosData, sociosActividadData, movs || [])
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
    const { error } = await supabase
      .from('movimientos_fondo')
      .delete()
      .eq('id', movimientoAEliminar.value.id)
    if (error) throw error
    movimientoAEliminar.value = null
    notificationStore.success('Movimiento eliminado', 'Eliminado')
    await cargarDatos()
  } catch (e) {
    console.error('Error eliminando movimiento:', e)
    notificationStore.error(e.message || 'Error al eliminar', 'Error')
  } finally {
    eliminandoMovimiento.value = false
  }
}

watch(id, cargarDatos, { immediate: true })
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

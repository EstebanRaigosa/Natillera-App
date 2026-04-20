<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-b from-slate-100/50 via-white to-amber-50/40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-12 lg:pb-10">
      <div v-if="inicializando" class="flex flex-col items-center justify-center py-32 px-4">
        <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-6 shadow-inner">
          <div class="animate-spin w-8 h-8 border-[3px] border-rose-400 border-t-transparent rounded-full" />
        </div>
        <p class="text-gray-600 font-medium">Preparando la liquidación…</p>
        <p class="text-sm text-gray-400 mt-1">Un momento</p>
      </div>

      <div
        v-else-if="accesoDenegado"
        class="max-w-lg mx-auto text-center py-20 px-4 rounded-2xl border border-amber-200/80 bg-white/80 shadow-sm backdrop-blur-sm"
      >
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
          <ExclamationTriangleIcon class="w-9 h-9" />
        </div>
        <h1 class="text-2xl font-display font-bold text-gray-900 mb-2">No disponible</h1>
        <p class="text-gray-600 leading-relaxed">
          No tienes permiso para cerrar esta natillera o la natillera no está activa.
        </p>
      </div>

      <div v-else class="space-y-5 sm:space-y-6">
        <!-- Cabecera compacta -->
        <header>
          <div class="rounded-xl border border-stone-200/90 bg-white shadow-sm overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500" />
            <div class="p-4 sm:p-5">
              <div class="flex items-start gap-3 min-w-0">
                <BackButton :to="`/natilleras/${natilleraId}`" :inline="true" />
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-md shadow-rose-500/25"
                >
                  <ClipboardDocumentCheckIcon class="h-6 w-6" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-rose-600/90">
                    Cierre definitivo
                  </p>
                  <h1 class="text-xl sm:text-2xl font-display font-bold text-gray-900 tracking-tight">
                    Liquidación y cierre
                  </h1>
                  <p
                    v-if="natillera?.nombre"
                    class="text-sm text-stone-600 mt-0.5 truncate"
                    :title="natillera.nombre"
                  >
                    {{ natillera.nombre }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div v-if="calculandoCierre" class="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-stone-200 bg-white/60">
          <div class="animate-spin w-10 h-10 border-[3px] border-rose-400 border-t-transparent rounded-full mb-4" />
          <p class="text-gray-700 font-medium">Calculando datos de cierre…</p>
          <p class="text-sm text-gray-400 mt-1">Consultando ahorros, utilidades y descuentos</p>
        </div>

        <template v-else-if="datosCierre.length > 0">
          <!-- Indicadores (compactos) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-rose-700/85 mb-1">Total a entregar</p>
              <p class="text-2xl sm:text-3xl font-bold tabular-nums text-rose-700 tracking-tight">
                ${{ formatMoney(totalCierreGeneral) }}
              </p>
              <p class="text-xs text-rose-700/70 mt-1.5 leading-snug">
                Efectivo a tener disponible para liquidar.
              </p>
            </div>
            <div class="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Participantes</p>
              <p class="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
                {{ datosCierre.length }}
              </p>
              <p class="text-xs text-stone-500 mt-1.5">Socios en este cierre</p>
            </div>
          </div>

          <!-- Acciones (arriba de la tabla: siempre visibles sin scroll) -->
          <section
            class="rounded-xl border border-stone-200/90 bg-gradient-to-br from-white to-stone-50/60 p-4 sm:p-5 shadow-sm"
          >
            <p class="text-xs text-stone-500 mb-3 leading-relaxed">
              Exporta comprobantes o el Excel antes de confirmar. Al cerrar, la natillera queda en estado
              <span class="font-medium text-stone-700">cerrada</span> (no se puede deshacer).
            </p>
            <div class="flex flex-col gap-3">
              <div class="flex flex-row flex-nowrap gap-2 w-full sm:flex-wrap">
                <button
                  type="button"
                  class="inline-flex flex-1 min-w-0 sm:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg border border-teal-200 bg-white text-xs sm:text-sm font-semibold text-teal-900 hover:bg-teal-50 transition-colors"
                  @click="exportarComprobanteCierrePdf"
                >
                  <ArrowDownTrayIcon class="w-4 h-4 text-teal-600 shrink-0" />
                  <span class="truncate">PDF (selección)</span>
                </button>
                <button
                  type="button"
                  :disabled="exportandoCierreExcel"
                  class="inline-flex flex-1 min-w-0 sm:flex-initial items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg border border-amber-200 bg-white text-xs sm:text-sm font-semibold text-amber-950 hover:bg-amber-50 transition-colors disabled:opacity-50"
                  @click="exportarCierreAExcel"
                >
                  <ArrowDownTrayIcon class="w-4 h-4 text-amber-600 shrink-0" />
                  <span class="truncate">{{ exportandoCierreExcel ? 'Exportando…' : 'Excel completo' }}</span>
                </button>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end pt-1 border-t border-stone-200/70">
                <button
                  type="button"
                  class="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 text-white text-sm font-semibold shadow-sm hover:from-rose-700 hover:to-amber-700 sm:min-w-[200px]"
                  @click="confirmarCerrarNatillera"
                >
                  Confirmar cierre definitivo
                </button>
              </div>
            </div>
          </section>

          <!-- Listado -->
          <section class="space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-lg sm:text-xl font-bold text-gray-900 font-display">
                  Detalle por participante
                </h2>
              </div>
              <div class="relative w-full sm:max-w-[260px] flex-shrink-0">
                <MagnifyingGlassIcon class="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  v-model.trim="busquedaCierre"
                  type="search"
                  placeholder="Buscar…"
                  class="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
                  autocomplete="off"
                />
              </div>
            </div>

            <div class="rounded-2xl border border-stone-200/90 bg-white shadow-md shadow-stone-200/30 overflow-hidden">
              <div class="overflow-x-auto">
              <div class="hidden sm:block min-w-[640px]">
                <table class="w-full text-sm border-collapse">
                  <thead>
                    <tr class="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200 sticky top-0 z-10">
                      <th class="py-2.5 px-2 sm:px-3 w-12 text-center align-middle">
                        <input
                          v-model="todosSeleccionadosPdf"
                          type="checkbox"
                          class="h-4 w-4 cursor-pointer rounded border-stone-300 text-teal-600 shadow-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                          title="Seleccionar o quitar todos (filas visibles) para PDF"
                        />
                      </th>
                      <th class="text-left py-2.5 px-2 sm:px-3 font-bold text-gray-700 whitespace-nowrap">Socio</th>
                      <th class="text-right py-2.5 px-2 sm:px-3 font-bold text-sky-700 whitespace-nowrap">Ahorro</th>
                      <th class="text-right py-2.5 px-2 sm:px-3 font-bold text-purple-700 whitespace-nowrap">Utilidades</th>
                      <th class="text-right py-2.5 px-2 sm:px-3 font-bold text-teal-700 whitespace-nowrap">Total a ent.</th>
                      <th class="text-right py-2.5 px-2 sm:px-3 font-bold text-red-700 whitespace-nowrap">Descuentos</th>
                      <th class="text-right py-2.5 px-2 sm:px-3 font-bold text-gray-800 whitespace-nowrap">Total final</th>
                      <th class="text-center py-2.5 px-1 sm:px-2 font-bold text-gray-600 whitespace-nowrap w-20">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(dato, index) in datosCierreFiltrados" :key="dato.socio?.id || index">
                      <tr
                        :class="[
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/70',
                          'border-b border-gray-100 hover:bg-teal-50/50 transition-colors'
                        ]"
                      >
                        <td class="py-2 px-2 sm:px-3 text-center">
                          <input v-model="sociosSeleccionadosPdf" type="checkbox" :value="dato.socioNatillera?.id || dato.socio?.id" class="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer">
                        </td>
                        <td class="py-2 px-2 sm:px-3">
                          <div class="flex items-center gap-2 min-w-0">
                            <button
                              v-if="dato.utilidadesPorConcepto && Object.keys(dato.utilidadesPorConcepto).some(t => dato.utilidadesPorConcepto[t] > 0)"
                              type="button"
                              class="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-700"
                              :title="detalleCierreExpandidoId === (dato.socioNatillera?.id || dato.socio?.id) ? 'Ocultar detalle' : 'Ver utilidades por concepto'"
                              @click="detalleCierreExpandidoId = detalleCierreExpandidoId === (dato.socioNatillera?.id || dato.socio?.id) ? null : (dato.socioNatillera?.id || dato.socio?.id)"
                            >
                              <ChevronRightIcon :class="['w-4 h-4 transition-transform', detalleCierreExpandidoId === (dato.socioNatillera?.id || dato.socio?.id) && 'rotate-90']" />
                            </button>
                            <div class="min-w-0">
                              <p class="font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-[200px]" :title="dato.socio?.nombre">{{ dato.socio?.nombre || 'Socio' }}</p>
                              <p v-if="dato.socio?.telefono" class="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-[200px]">{{ dato.socio.telefono }}</p>
                            </div>
                          </div>
                        </td>
                        <td class="text-right py-2 px-2 sm:px-3 font-medium text-sky-600 tabular-nums">${{ formatMoney(dato.ahorro) }}</td>
                        <td class="text-right py-2 px-2 sm:px-3 font-medium text-purple-600 tabular-nums">${{ formatMoney(dato.utilidades) }}</td>
                        <td class="text-right py-2 px-2 sm:px-3 font-medium text-teal-600 tabular-nums">${{ formatMoney(dato.totalAEntregar) }}</td>
                        <td class="text-right py-2 px-2 sm:px-3 font-medium text-red-600 tabular-nums">${{ formatMoney(dato.descuentos) }}</td>
                        <td class="text-right py-2 px-2 sm:px-3">
                          <div class="tabular-nums font-bold" :class="dato.totalFinal >= 0 ? 'text-green-600' : ''">
                            ${{ formatMoney(dato.totalFinal >= 0 ? dato.totalFinal : 0) }}
                          </div>
                          <div v-if="dato.totalFinal < 0" class="text-xs font-semibold text-red-600 mt-0.5">
                            Debe: ${{ formatMoney(-dato.totalFinal) }}
                          </div>
                        </td>
                        <td class="py-2 px-1 sm:px-2">
                          <div class="flex items-center justify-center gap-0.5">
                            <button
                              type="button"
                              class="p-1.5 rounded-lg text-teal-600 hover:bg-teal-100 transition-colors"
                              title="Descargar comprobante"
                              @click="descargarComprobanteSocio(dato)"
                            >
                              <ArrowDownTrayIcon class="w-4 h-4" />
                            </button>
                            <button
                              v-if="dato.socio?.telefono"
                              type="button"
                              class="p-1.5 rounded-lg text-green-600 hover:bg-green-100 transition-colors inline-flex"
                              title="Compartir por WhatsApp"
                              @click="compartirComprobanteSocioWhatsApp(dato)"
                            >
                              <ChatBubbleLeftIcon class="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-if="dato.utilidadesPorConcepto && detalleCierreExpandidoId === (dato.socioNatillera?.id || dato.socio?.id)"
                        class="bg-purple-50/80 border-b border-purple-100"
                      >
                        <td colspan="8" class="py-2 px-3">
                          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            <span class="font-semibold text-purple-800">Utilidades por concepto:</span>
                            <template v-for="tipo in TIPOS_UTILIDAD_CIERRE" :key="tipo">
                              <span v-show="(dato.utilidadesPorConcepto[tipo] || 0) > 0" class="text-gray-700">
                                {{ LABELS_UTILIDAD_CIERRE[tipo] || tipo }}: <strong class="text-purple-700">${{ formatMoney(dato.utilidadesPorConcepto[tipo] || 0) }}</strong>
                              </span>
                            </template>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <div class="block sm:hidden space-y-2 px-3 pt-2 pb-1">
                <div class="flex items-start gap-3 pb-1">
                  <input
                    id="selectAllMobile"
                    v-model="todosSeleccionadosPdf"
                    type="checkbox"
                    class="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-stone-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
                    title="Seleccionar o quitar todos los socios visibles para el PDF"
                  />
                  <label
                    for="selectAllMobile"
                    class="min-w-0 flex-1 cursor-pointer select-none leading-tight"
                  >
                    <span class="block text-sm font-semibold text-stone-800">Seleccionar todos</span>
                    <span class="mt-0.5 block text-[11px] text-stone-500">Socios en pantalla · para comprobantes PDF</span>
                  </label>
                </div>
                <div
                  v-for="(dato, index) in datosCierreFiltrados"
                  :key="'m-'+(dato.socio?.id || index)"
                  class="rounded-lg border border-stone-200/90 bg-white overflow-hidden shadow-sm"
                >
                  <!-- Cabecera compacta: acciones arriba a la derecha -->
                  <div class="flex items-start gap-2 px-2.5 pt-2 pb-1.5">
                    <input
                      v-model="sociosSeleccionadosPdf"
                      type="checkbox"
                      :value="dato.socioNatillera?.id || dato.socio?.id"
                      class="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 shrink-0"
                    >
                    <div class="min-w-0 flex-1 pr-1">
                      <p class="text-sm font-semibold text-gray-900 leading-tight truncate" :title="dato.socio?.nombre">{{ dato.socio?.nombre || 'Socio' }}</p>
                      <p v-if="dato.socio?.telefono" class="text-[11px] text-stone-500 truncate tabular-nums">{{ dato.socio.telefono }}</p>
                    </div>
                    <div class="flex shrink-0 items-center justify-end gap-1 -mr-0.5">
                      <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100/80"
                        title="Descargar comprobante"
                        @click="descargarComprobanteSocio(dato)"
                      >
                        <ArrowDownTrayIcon class="w-4 h-4 shrink-0" />
                      </button>
                      <button
                        v-if="dato.socio?.telefono"
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-100/80"
                        title="WhatsApp"
                        @click="compartirComprobanteSocioWhatsApp(dato)"
                      >
                        <ChatBubbleLeftIcon class="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>

                  <!-- Siempre visible: ahorro, utilidad, total a entregar (neto) -->
                  <div class="grid grid-cols-3 gap-0.5 px-2 pb-2 border-b border-stone-100/90">
                    <div class="text-center px-0.5">
                      <p class="text-[9px] font-semibold uppercase tracking-wide text-sky-800/85 leading-none mb-1">Ahorro</p>
                      <p class="text-[13px] font-semibold tabular-nums text-sky-700 leading-tight">${{ formatMoney(dato.ahorro) }}</p>
                    </div>
                    <div class="text-center px-0.5 border-x border-stone-100">
                      <p class="text-[9px] font-semibold uppercase tracking-wide text-purple-800/85 leading-none mb-1">Utilidad</p>
                      <p class="text-[13px] font-semibold tabular-nums text-purple-700 leading-tight">${{ formatMoney(dato.utilidades) }}</p>
                    </div>
                    <div class="text-center px-0.5">
                      <p class="text-[9px] font-semibold uppercase tracking-wide text-emerald-900/85 leading-none mb-1">A entregar</p>
                      <p
                        class="text-[13px] font-bold tabular-nums leading-tight"
                        :class="dato.totalFinal >= 0 ? 'text-emerald-700' : 'text-red-700'"
                      >
                        ${{ formatMoney(dato.totalFinal >= 0 ? dato.totalFinal : 0) }}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="flex w-full items-center justify-center gap-1 py-1 text-[10px] font-medium text-stone-600 bg-stone-50/90 active:bg-stone-100"
                    @click="toggleCierreMobileDetalle(dato)"
                  >
                    <span>{{ cierreMobileDetalleId === idSocioCierre(dato) ? 'Menos' : 'Más' }}</span>
                    <ChevronRightIcon
                      :class="['w-3 h-3 text-stone-500 transition-transform duration-200', cierreMobileDetalleId === idSocioCierre(dato) && 'rotate-90']"
                    />
                  </button>

                  <div
                    v-show="cierreMobileDetalleId === idSocioCierre(dato)"
                    class="border-t border-stone-100 bg-stone-50/60 px-2 py-1.5 text-[10px] leading-snug text-stone-700 space-y-1"
                  >
                    <!-- Línea 1: cuotas · periodo · total ahorrado -->
                    <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <span class="text-stone-600">
                        <span class="font-semibold tabular-nums text-stone-900">{{ dato.cantidadCuotasPagadas ?? 0 }}</span>
                        {{ (dato.cantidadCuotasPagadas || 0) === 1 ? 'cuota' : 'cuotas' }}
                        <span class="text-stone-400 mx-0.5">·</span>
                        {{ natillera?.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                      </span>
                      <span class="shrink-0 font-bold tabular-nums text-sky-700">
                        Ahorro ${{ formatMoney(dato.ahorro) }}
                      </span>
                    </div>
                    <p class="text-[9px] text-stone-500 tabular-nums">
                      {{ dato.cantidadCuotasPagadas ?? 0 }}×${{ formatMoney(dato.montoAhorradoMensual) }} c/u
                    </p>

                    <div
                      v-if="(parseFloat(dato.descuentos) || 0) > 0"
                      class="flex flex-wrap items-center justify-between gap-x-2 gap-y-0 border-t border-dashed border-stone-200/80 pt-1 text-[9px]"
                    >
                      <span class="text-stone-500">Sub <span class="tabular-nums font-medium text-stone-800">${{ formatMoney(dato.totalAEntregar) }}</span></span>
                      <span class="text-stone-400">·</span>
                      <span class="text-red-700">Desc <span class="tabular-nums font-semibold">-${{ formatMoney(dato.descuentos) }}</span></span>
                    </div>

                    <div
                      v-if="dato.utilidadesPorConcepto && Object.keys(dato.utilidadesPorConcepto).some(t => (dato.utilidadesPorConcepto[t] || 0) > 0)"
                      class="border-t border-dashed border-stone-200/80 pt-1"
                    >
                      <p class="text-[9px] font-medium text-purple-900/90 mb-0.5">Util. por concepto</p>
                      <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
                        <template v-for="tipo in TIPOS_UTILIDAD_CIERRE" :key="tipo">
                          <template v-if="(dato.utilidadesPorConcepto[tipo] || 0) > 0">
                            <span class="text-stone-600 truncate">{{ LABELS_UTILIDAD_CIERRE[tipo] || tipo }}</span>
                            <span class="tabular-nums text-right font-medium text-purple-800">${{ formatMoney(dato.utilidadesPorConcepto[tipo] || 0) }}</span>
                          </template>
                        </template>
                      </div>
                    </div>

                    <div
                      v-if="dato.totalFinal < 0"
                      class="flex justify-between gap-2 border-t border-dashed border-red-200/60 pt-1 text-[9px] font-semibold text-red-800"
                    >
                      <span>Debe</span>
                      <span class="tabular-nums">${{ formatMoney(-dato.totalFinal) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <div class="border-t border-stone-100 bg-stone-50/50 px-4 py-3 sm:px-6">
                <div v-if="datosCierreFiltrados.length === 0" class="text-center text-stone-500 text-sm py-1">
                  No hay socios que coincidan con la búsqueda.
                </div>
                <p v-else class="text-xs text-stone-500 leading-relaxed">
                  <span class="hidden sm:inline">Toca la flecha junto al nombre para ver utilidades por concepto. </span>
                  <span class="sm:hidden">«Más»: cuotas, periodo, total ahorrado y desglose. </span>
                  Total en pantalla: <strong class="text-stone-700">{{ datosCierreFiltrados.length }}</strong>
                  {{ datosCierreFiltrados.length === 1 ? 'participante' : 'participantes' }}.
                </p>
              </div>
            </div>
          </section>
        </template>

        <div
          v-else-if="!calculandoCierre"
          class="rounded-2xl border border-dashed border-stone-200 bg-white/60 py-20 text-center px-4"
        >
          <p class="text-stone-600 font-medium">No hay datos para mostrar en este cierre.</p>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <button
        v-if="mostrarBotonArriba"
        type="button"
        class="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/30 transition hover:from-rose-700 hover:to-amber-700 touch-manipulation"
        title="Volver arriba"
        aria-label="Volver arriba"
        @click="scrollToTop"
      >
        <ArrowUpIcon class="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </Transition>

    <div style="position: absolute; left: -9999px; top: -9999px;">
      <div
        v-if="comprobanteActivo"
        id="comprobante-cierre-whatsapp"
        ref="comprobanteWhatsappRef"
        class="bg-white rounded-2xl overflow-hidden"
        style="width: 400px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); font-family: system-ui, -apple-system, sans-serif;"
      >
        <div class="comprobante-content" style="background: #f0f9ff; padding: 24px 20px; color: #1f2937;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
                </svg>
              </div>
              <h2 style="font-size: 24px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.5px;">
                Cierre de Natillera
              </h2>
            </div>
          </div>

          <div style="background: white; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-bottom: 16px;">
            <div style="text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px dashed #e5e7eb;">
              <p style="color: #6b7280; font-size: 10px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL ENTREGADO</p>
              <p style="font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px;" :style="{ color: ((comprobanteActivo.ahorro || 0) + Math.round((comprobanteActivo.utilidades || 0) / 50) * 50 - (comprobanteActivo.descuentos || 0)) >= 0 ? '#2563eb' : '#e11d48' }">
                ${{ formatMoney((comprobanteActivo.ahorro || 0) + Math.round((comprobanteActivo.utilidades || 0) / 50) * 50 - (comprobanteActivo.descuentos || 0)) }}
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; text-align: center;">
              <div>
                <p style="color: #9ca3af; font-size: 10px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">Socio Participante</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; color: #111827;">{{ comprobanteActivo.socio?.nombre }}</p>
              </div>
            </div>
          </div>

          <div style="background: white; padding: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <p style="color: #374151; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.5px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">
              Resumen Final
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
              <div style="display: flex; flex-direction: column; background: #ecfdf5; padding: 10px 12px; border-radius: 10px; border: 1px solid #d1fae5;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 28px; height: 28px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <span style="color: #047857; font-weight: 700;">Ahorro total</span>
                  </div>
                  <span style="font-weight: 800; color: #059669; font-size: 15px;">${{ formatMoney(comprobanteActivo.ahorro) }}</span>
                </div>
                <div style="margin-top: 6px; padding-left: 36px; font-size: 11px; color: #047857; display: flex; flex-direction: column; gap: 2px;">
                  <span>{{ comprobanteActivo.cantidadCuotasPagadas }} cuotas de ${{ formatMoney(comprobanteActivo.montoAhorradoMensual) }}</span>
                  <span>Periodicidad: {{ natillera?.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; background: #faf5ff; padding: 10px 12px; border-radius: 10px; border: 1px solid #f3e8ff;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 28px; height: 28px; background: #a855f7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                  </div>
                  <span style="color: #7e22ce; font-weight: 700;">Total Ganancias</span>
                </div>
                <span style="font-weight: 800; color: #9333ea; font-size: 15px;">${{ formatMoney(Math.round((comprobanteActivo.utilidades || 0) / 50) * 50) }}</span>
              </div>

              <div v-if="comprobanteActivo.descuentos > 0" style="display: flex; flex-direction: column; background: #fff1f2; padding: 10px 12px; border-radius: 10px; border: 1px solid #ffe4e6;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 28px; height: 28px; background: #f43f5e; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </div>
                    <span style="color: #be123c; font-weight: 700;">Total Descuentos</span>
                  </div>
                  <span style="font-weight: 800; color: #e11d48; font-size: 15px;">-${{ formatMoney(comprobanteActivo.descuentos) }}</span>
                </div>
                <div v-if="comprobanteActivo.descuentosDesglose" style="margin-top: 6px; padding-left: 36px; font-size: 11px; color: #be123c; display: flex; flex-direction: column; gap: 2px;">
                  <div v-if="comprobanteActivo.descuentosDesglose.prestamosPendientes > 0" style="display: flex; justify-content: space-between;">
                    <span>Préstamos pendientes</span>
                    <span>-${{ formatMoney(comprobanteActivo.descuentosDesglose.prestamosPendientes) }}</span>
                  </div>
                  <div v-if="comprobanteActivo.descuentosDesglose.cuotasSinPagar > 0" style="display: flex; justify-content: space-between;">
                    <span>Cuotas o Sanciones pendientes</span>
                    <span>-${{ formatMoney(comprobanteActivo.descuentosDesglose.cuotasSinPagar) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #9ca3af; font-size: 10px; margin: 0 0 6px 0;">
              Generado el {{ new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) }}
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="color: #d1d5db;">✨</span>
              <p style="color: #d1d5db; font-size: 10px; font-weight: 600; margin: 0; letter-spacing: 0.5px;">NATILLERAPP</p>
              <span style="color: #d1d5db;">✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toPng } from 'html-to-image'
import * as XLSX from 'xlsx-js-style'
import {
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { useNatillerasStore } from '../../stores/natilleras'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { supabase } from '../../lib/supabase'
import BackButton from '../../components/BackButton.vue'
import { calcularCierreNatillera, TIPOS_UTILIDAD as TIPOS_UTILIDAD_CIERRE } from '../../composables/useCierreNatillera'

const props = defineProps({
  id: { type: String, required: true }
})

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const colaboradoresStore = useColaboradoresStore()

const natilleraId = computed(() => props.id || route.params.id)
const natillera = computed(() => natillerasStore.natilleraActual)

const usuarioAutenticado = ref(null)
const misPermisos = ref(null)
const inicializando = ref(true)
const accesoDenegado = ref(false)

const esSuperUsuario = computed(() => {
  if (!usuarioAutenticado.value) return false
  const email = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  return email === 'raigo.16@gmail.com'
})

const esAdmin = computed(() => {
  if (!usuarioAutenticado.value || !natillera.value) return false
  return natillera.value.admin_id === usuarioAutenticado.value.id || esSuperUsuario.value
})

const puedeCerrarNatillera = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.cerrar_natillera === true
})

const datosCierre = ref([])
const busquedaCierre = ref('')
const sociosSeleccionadosPdf = ref([])
const comprobanteWhatsappRef = ref(null)
const comprobanteActivo = ref(null)

const todosSeleccionadosPdf = computed({
  get() {
    return datosCierreFiltrados.value.length > 0 &&
      datosCierreFiltrados.value.every(d => sociosSeleccionadosPdf.value.includes(d.socioNatillera?.id || d.socio?.id))
  },
  set(val) {
    if (val) {
      const nuevos = datosCierreFiltrados.value.map(d => d.socioNatillera?.id || d.socio?.id)
      sociosSeleccionadosPdf.value = [...new Set([...sociosSeleccionadosPdf.value, ...nuevos])]
    } else {
      const visibles = datosCierreFiltrados.value.map(d => d.socioNatillera?.id || d.socio?.id)
      sociosSeleccionadosPdf.value = sociosSeleccionadosPdf.value.filter(id => !visibles.includes(id))
    }
  }
})

const datosCierreFiltrados = computed(() => {
  let list = [...datosCierre.value]
  list.sort((a, b) => {
    const nombreA = (a.socio?.nombre || '').toLowerCase()
    const nombreB = (b.socio?.nombre || '').toLowerCase()
    return nombreA.localeCompare(nombreB)
  })
  const q = busquedaCierre.value.trim().toLowerCase()
  if (q) {
    list = list.filter(d => (d.socio?.nombre || '').toLowerCase().includes(q) || (d.socio?.telefono || '').includes(q))
  }
  return list
})

const totalCierreGeneral = computed(() => {
  return datosCierre.value.reduce((sum, socio) => {
    const v = parseFloat(socio.totalFinal) || 0
    return sum + (v > 0 ? v : 0)
  }, 0)
})

const calculandoCierre = ref(false)
const exportandoCierreExcel = ref(false)
const detalleCierreExpandidoId = ref(null)
/** Desplegable «Más detalles» en tarjetas móvil (solo una abierta a la vez) */
const cierreMobileDetalleId = ref(null)

const mostrarBotonArriba = ref(false)
let scrollContainerMain = null
const UMBRAL_SCROLL_ARRIBA_PX = 120

function scrollToTop() {
  const main = document.querySelector('main')
  if (main && main.scrollTop > 0) {
    main.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleScrollArriba() {
  if (!scrollContainerMain) scrollContainerMain = document.querySelector('main')
  let scrollTop = 0
  let scrollHeight = 0
  let clientHeight = 0
  if (scrollContainerMain) {
    scrollTop = scrollContainerMain.scrollTop
    scrollHeight = scrollContainerMain.scrollHeight
    clientHeight = scrollContainerMain.clientHeight
  } else {
    scrollTop = window.scrollY || document.documentElement.scrollTop
    scrollHeight = document.documentElement.scrollHeight
    clientHeight = window.innerHeight
  }
  const hayScroll = scrollHeight > clientHeight + 50
  const haBajado = scrollTop > UMBRAL_SCROLL_ARRIBA_PX
  mostrarBotonArriba.value = hayScroll && haBajado
}

const LABELS_UTILIDAD_CIERRE = {
  prestamos: 'Préstamos',
  rifas: 'Rifas',
  bingo: 'Bingos',
  venta: 'Ventas',
  evento: 'Eventos',
  otro: 'Otros',
  sanciones: 'Sanciones'
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function idSocioCierre(dato) {
  return dato.socioNatillera?.id || dato.socio?.id
}

function toggleCierreMobileDetalle(dato) {
  const id = idSocioCierre(dato)
  cierreMobileDetalleId.value = cierreMobileDetalleId.value === id ? null : id
}

async function calcularDatosCierre() {
  if (!natillera.value || calculandoCierre.value) return
  calculandoCierre.value = true
  try {
    const nid = natilleraId.value
    const result = await calcularCierreNatillera(nid, {
      configCierre: natillera.value.config_cierre
    })
    if (result.error) {
      alert('Error al calcular los datos de cierre: ' + result.error)
      datosCierre.value = []
      return
    }
    datosCierre.value = (result.socios || []).map(s => {
      const totalAEntregar = (s.ahorro || 0) + (s.utilidadesTotal || 0)
      const totalFinal = totalAEntregar - (s.descuentos || 0)
      return {
        ...s,
        utilidades: s.utilidadesTotal,
        totalAEntregar,
        totalFinal
      }
    })
    sociosSeleccionadosPdf.value = datosCierre.value.map(d => d.socioNatillera?.id || d.socio?.id)
  } catch (error) {
    console.error('Error calculando datos de cierre:', error)
    alert('Error al calcular los datos de cierre: ' + (error?.message || error))
    datosCierre.value = []
  } finally {
    calculandoCierre.value = false
  }
}

async function confirmarCerrarNatillera() {
  if (!confirm('¿Estás seguro de cerrar esta natillera? Esta acción no se puede deshacer.')) {
    return
  }
  const result = await natillerasStore.cerrarNatillera(natilleraId.value)
  if (result.success) {
    alert('Natillera cerrada exitosamente')
    router.push('/dashboard')
  } else {
    alert('Error al cerrar la natillera: ' + result.error)
  }
}

async function exportarCierreAExcel() {
  if (datosCierre.value.length === 0) return
  exportandoCierreExcel.value = true
  try {
    const datosExportar = datosCierre.value.map(d => {
      const totalFinal = parseFloat(d.totalFinal) || 0
      const aEntregar = totalFinal >= 0 ? totalFinal : 0
      const debe = totalFinal < 0 ? -totalFinal : 0
      return {
        Socio: d.socio?.nombre || 'Socio',
        Telefono: d.socio?.telefono || '',
        Ahorro: parseFloat(d.ahorro) || 0,
        Utilidades: parseFloat(d.utilidades) || 0,
        'Total (Antes de desc.)': parseFloat(d.totalAEntregar) || 0,
        Descuentos: parseFloat(d.descuentos) || 0,
        'A Entregar': aEntregar,
        Debe: debe
      }
    })

    const wb = XLSX.utils.book_new()
    const wsData = [
      [natillera.value?.nombre || 'Natillera'],
      ['Cierre de Natillera'],
      ['Exportado:', new Date().toLocaleString('es-CO')],
      [],
      ['Socio', 'Teléfono', 'Ahorro', 'Utilidades', 'Total (Antes de desc.)', 'Descuentos', 'A Entregar', 'Debe'],
      ...datosExportar.map(d => [d.Socio, d.Telefono, d.Ahorro, d.Utilidades, d['Total (Antes de desc.)'], d.Descuentos, d['A Entregar'], d.Debe]),
      [],
      ['TOTAL GENERAL', '', '', '', '', '', totalCierreGeneral.value, '']
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: wsData.length - 1, c: 7 } })
    ws['!freeze'] = { xSplit: 0, ySplit: 5, topLeftCell: 'A6', state: 'frozen' }

    const colorRed = { rgb: 'DC2626' }
    const colorRedOscuro = { rgb: 'B91C1C' }
    const colorRojo = { rgb: 'DC2626' }

    ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
    ws['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
    ws['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }

    const headerRow = 4
    for (let col = 0; col < 8; col++) {
      const cell = XLSX.utils.encode_cell({ r: headerRow, c: col })
      ws[cell].s = {
        fill: { fgColor: colorRed, patternType: 'solid' },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { top: { style: 'thin', color: colorRedOscuro }, bottom: { style: 'thin', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
      }
    }

    const dataStartRow = 5
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
      fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '991B1B' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'medium', color: colorRedOscuro }, bottom: { style: 'medium', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
    }
    ws[cellTotalVal].s = {
      fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '991B1B' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'medium', color: colorRedOscuro }, bottom: { style: 'medium', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
    }
    ws[cellTotalVal].z = '#,##0;[Red]-#,##0'

    ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]

    XLSX.utils.book_append_sheet(wb, ws, 'Cierre de Natillera')
    const nombreArchivo = `Cierre_Natillera_${(natillera.value?.nombre || 'Natillera').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)
    alert('Exportado a Excel correctamente')
  } catch (e) {
    console.error('Error exportando cierre a Excel:', e)
    alert('Error al exportar: ' + (e.message || 'Error desconocido'))
  } finally {
    exportandoCierreExcel.value = false
  }
}

function textoComprobanteSocio(dato) {
  const nombre = dato.socio?.nombre || 'Socio'
  const ahorro = formatMoney(dato.ahorro)
  const utilidades = formatMoney(dato.utilidadesTotal)
  const totalFinal = parseFloat(dato.totalFinal) || 0
  const total = formatMoney(totalFinal >= 0 ? totalFinal : 0)
  const debeTexto = totalFinal < 0 ? `\n⚠️ *DEBE: $${formatMoney(-totalFinal)}*` : ''

  let utilidadesDetalle = ''
  if (dato.utilidadesPorConcepto) {
    const detalles = []
    for (const tipo in dato.utilidadesPorConcepto) {
      if (dato.utilidadesPorConcepto[tipo] > 0) {
        const label = LABELS_UTILIDAD_CIERRE[tipo] || tipo
        detalles.push(`- ${label}: $${formatMoney(dato.utilidadesPorConcepto[tipo])}`)
      }
    }
    if (detalles.length > 0) {
      utilidadesDetalle = `\nDetalle ganancias:\n${detalles.join('\n')}`
    }
  }

  let descuentosDetalle = ''
  if (dato.descuentos > 0 && dato.descuentosDesglose) {
    const desc = []
    if (dato.descuentosDesglose.prestamosPendientes > 0) desc.push(`- Préstamos pendientes: $${formatMoney(dato.descuentosDesglose.prestamosPendientes)}`)
    if (dato.descuentosDesglose.cuotasSinPagar > 0) desc.push(`- Cuotas en deuda: $${formatMoney(dato.descuentosDesglose.cuotasSinPagar)}`)
    if (desc.length > 0) {
      descuentosDetalle = `\n\nDescuentos:\n${desc.join('\n')}`
    }
  }

  return `*Comprobante de cierre*\n👤 Participante: ${nombre}\n\n💰 Ahorro acumulado: $${ahorro}\n📈 Ganancias: $${utilidades}${utilidadesDetalle}${descuentosDetalle}\n\n💵 *TOTAL A ENTREGAR: $${total}*${debeTexto}`
}

async function compartirComprobanteSocioWhatsApp(dato) {
  const telefono = (dato.socio?.telefono || '').replace(/\D/g, '')
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado.')
    return
  }

  comprobanteActivo.value = dato
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 150))

  if (!comprobanteWhatsappRef.value) return

  try {
    const dataUrl = await toPng(comprobanteWhatsappRef.value, {
      backgroundColor: '#f0f9ff',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })

    const numero = telefono.length === 10 ? '57' + telefono : telefono
    const texto = textoComprobanteSocio(dato)

    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `comprobante-cierre-${dato.socio?.nombre?.replace(/\s+/g, '-') || 'socio'}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Comprobante de Cierre',
          text: texto
        })
        return
      }
    } catch (shareError) {
      console.warn('Web Share API no disponible o cancelado:', shareError)
    }

    const link = document.createElement('a')
    link.download = `comprobante-cierre-${dato.socio?.nombre?.replace(/\s+/g, '-') || 'socio'}.png`
    link.href = dataUrl
    link.click()

    setTimeout(() => {
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
      alert('📱 La imagen del comprobante se descargó. Ahora adjúntala en WhatsApp.')
    }, 500)
  } catch (error) {
    console.error('Error generando imagen de comprobante:', error)
    alert('Hubo un error al generar la imagen. Abriendo WhatsApp solo con texto.')
    const numero = telefono.length === 10 ? '57' + telefono : telefono
    const texto = textoComprobanteSocio(dato)
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
  } finally {
    comprobanteActivo.value = null
  }
}

function htmlComprobanteSocio(dato) {
  const nombre = dato.socio?.nombre || 'Socio'

  let descuentosTexto = ''
  if (dato.descuentos > 0 && dato.descuentosDesglose) {
    const desc = []
    if (dato.descuentosDesglose.prestamosPendientes > 0) desc.push(`Préstamos pendientes`)
    if (dato.descuentosDesglose.cuotasSinPagar > 0) desc.push(`Cuotas en deuda`)
    if (desc.length > 0) {
      descuentosTexto = ` <span style="font-size: 11px; color: #6b7280; font-weight: normal;">(${desc.join(', ')})</span>`
    }
  }

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 12px; max-width: 500px; margin: 0 auto; border: 1px dashed #9ca3af; background-color: #ffffff; break-inside: avoid; page-break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; width: 30%; color: #374151;">Participante</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 700; color: #111827;" colspan="3">${nombre}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Ahorro mensual</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;">$${formatMoney(dato.montoAhorradoMensual)}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Cuotas</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827; width: 15%;">${dato.cantidadCuotasPagadas}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Total Ahorro</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;" colspan="3">$${formatMoney(dato.ahorro)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Descuentos</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;" colspan="3">${dato.descuentos > 0 ? '$' + formatMoney(dato.descuentos) + descuentosTexto : ''}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Ganancias</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;" colspan="3">$${formatMoney(dato.utilidadesTotal)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: 700; background-color: #e5e7eb; color: #000000; text-transform: uppercase;">Total a entregar</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; background-color: #e5e7eb; color: #000000; font-weight: 800; font-size: 16px;" colspan="3">
              $${formatMoney((dato.totalFinal || 0) >= 0 ? (dato.totalFinal || 0) : 0)}
            </td>
          </tr>
          ${(dato.totalFinal || 0) < 0 ? `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: 700; background-color: #fef2f2; color: #991b1b; text-transform: uppercase;">Debe</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; background-color: #fef2f2; color: #991b1b; font-weight: 800; font-size: 16px;" colspan="3">
              $${formatMoney(-(dato.totalFinal || 0))}
            </td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `
}

async function descargarComprobanteSocio(dato) {
  comprobanteActivo.value = dato
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 150))

  if (!comprobanteWhatsappRef.value) return

  try {
    const dataUrl = await toPng(comprobanteWhatsappRef.value, {
      backgroundColor: '#f0f9ff',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })

    const link = document.createElement('a')
    link.download = `comprobante-cierre-${dato.socio?.nombre?.replace(/\s+/g, '-') || 'socio'}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Error generando imagen de comprobante:', error)
    alert('Hubo un error al generar la imagen del comprobante.')
  } finally {
    comprobanteActivo.value = null
  }
}

function exportarComprobanteCierrePdf() {
  const seleccionados = datosCierreFiltrados.value.filter(d =>
    sociosSeleccionadosPdf.value.includes(d.socioNatillera?.id || d.socio?.id)
  )

  if (seleccionados.length === 0) {
    alert('Por favor, selecciona al menos un socio para exportar su comprobante.')
    return
  }

  const nombreNatillera = natillera.value?.nombre || 'Natillera'
  const partes = seleccionados.map(d => htmlComprobanteSocio(d, nombreNatillera))
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comprobante de cierre - ${nombreNatillera}</title><style>body{font-family:system-ui,sans-serif;padding:1rem}.socio{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #eee}</style></head><body><h1 style="margin-bottom:1.5rem">Comprobante de cierre - ${nombreNatillera}</h1>${partes.map(p => `<div class="socio">${p}</div>`).join('')}</body></html>`
  const w = window.open('', '_blank')
  if (!w) {
    alert('Permite ventanas emergentes para exportar el comprobante.')
    return
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => {
    w.print()
    w.close()
  }, 250)
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user

  const nid = natilleraId.value
  await natillerasStore.fetchNatillera(nid)
  await nextTick()

  if (natillera.value) {
    if (!esAdmin.value) {
      try {
        await colaboradoresStore.obtenerMiRol(nid)
        const permisos = await colaboradoresStore.obtenerMisPermisos(nid)
        misPermisos.value = permisos
      } catch (err) {
        console.warn('Error obteniendo rol y permisos del usuario:', err)
        misPermisos.value = null
      }
    } else {
      misPermisos.value = {
        rol: 'administrador',
        esAdmin: true,
        permisos: {
          ver: true,
          editar_socios: true,
          gestionar_cuotas: true,
          gestionar_prestamos: true,
          gestionar_actividades: true,
          ver_auditoria: true,
          configurar: true,
          buscar_comprobante: true,
          invitar_colaboradores: true,
          notificar: true,
          cerrar_natillera: true
        }
      }
    }
  }

  await nextTick()

  if (!puedeCerrarNatillera.value || natillera.value?.estado !== 'activa') {
    accesoDenegado.value = true
    inicializando.value = false
    return
  }

  inicializando.value = false
  await calcularDatosCierre()

  scrollContainerMain = document.querySelector('main')
  if (scrollContainerMain) {
    scrollContainerMain.addEventListener('scroll', handleScrollArriba, { passive: true })
  }
  window.addEventListener('scroll', handleScrollArriba, { passive: true })
  await nextTick()
  handleScrollArriba()
})

onUnmounted(() => {
  if (scrollContainerMain) {
    scrollContainerMain.removeEventListener('scroll', handleScrollArriba)
    scrollContainerMain = null
  }
  window.removeEventListener('scroll', handleScrollArriba)
})
</script>

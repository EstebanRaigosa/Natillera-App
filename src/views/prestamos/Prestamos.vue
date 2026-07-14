<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <!-- Page header (DS) — patrón unificado Socios/Actividades/Cuotas/Préstamos -->
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <BanknotesIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Préstamos</h1>
            <p class="ds-page-header__sub hidden sm:block">Gestiona los préstamos internos del fondo</p>
          </div>
          <!-- Móvil: CTA primario en línea con el título (sm+ usa el bloque de actions) -->
          <button
            type="button"
            class="ds-btn ds-btn--primary sm:hidden prestamos-header-add"
            aria-label="Nuevo préstamo"
            @click="abrirModalNuevoPrestamo"
          >
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button
            type="button"
            class="ds-btn ds-btn--primary"
            aria-label="Nuevo préstamo"
            @click="abrirModalNuevoPrestamo"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Skeleton de carga inicial (resumen + lista) -->
    <PrestamosSkeleton v-if="cargaInicial" />

    <template v-else>
    <!-- Resumen (DS stat cards) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      <div class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <BanknotesIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">{{ prestamos.length }}</p>
        <p class="ds-stat-card__label">Total Préstamos</p>
      </div>

      <div class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">${{ formatMoney(totalPrestado) }}</p>
        <p class="ds-stat-card__label">Prestado</p>
      </div>

      <div class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">${{ formatMoney(totalPagado) }}</p>
        <p class="ds-stat-card__label">Total Pagado</p>
      </div>

      <div class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">${{ formatMoney(totalIntereses) }}</p>
        <p class="ds-stat-card__label">Intereses Ganados</p>
      </div>
    </div>

    <!-- Empty state: sin préstamos registrados (DS) -->
    <div v-if="prestamos.length === 0" class="ds-empty-state">
      <div class="ds-empty-state__header">
        <div class="ds-empty-state__icon-wrap">
          <BanknotesIcon class="w-7 h-7" />
        </div>
        <h3 class="ds-empty-state__title">No hay préstamos registrados</h3>
        <p class="ds-empty-state__subtitle">
          Los préstamos internos generan intereses para el fondo común
        </p>
      </div>
      <div class="ds-empty-state__body">
        <button
          type="button"
          class="ds-btn ds-btn--primary ds-btn--block"
          @click="abrirModalNuevoPrestamo"
        >
          <PlusIcon class="w-5 h-5" />
          Crear primer préstamo
        </button>
      </div>
    </div>

    <!-- Panel que envuelve las secciones (Por cobrar / Pagados) -->
    <section v-else class="prestamos-panel">
      <!-- Cabecera del panel: tabs + resumen de la sección activa -->
      <header class="prestamos-panel__head">
        <div class="prestamos-tabs" role="tablist" aria-label="Secciones de préstamos">
          <button
            type="button"
            role="tab"
            :aria-selected="tabPrestamos === 'por_cobrar'"
            class="prestamos-tab"
            :class="tabPrestamos === 'por_cobrar' ? 'prestamos-tab--active' : ''"
            @click="tabPrestamos = 'por_cobrar'"
          >
            <span>Por cobrar</span>
            <span class="prestamos-tab__count">{{ prestamosPorCobrar.length }}</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="tabPrestamos === 'pagados'"
            class="prestamos-tab"
            :class="tabPrestamos === 'pagados' ? 'prestamos-tab--active' : ''"
            @click="tabPrestamos = 'pagados'"
          >
            <span>Pagados</span>
            <span class="prestamos-tab__count">{{ prestamosPagados.length }}</span>
          </button>
        </div>

        <p class="prestamos-panel__summary">
          <span class="prestamos-panel__summary-label">
            {{ tabPrestamos === 'pagados' ? 'Total pagado' : 'Saldo por cobrar' }}
          </span>
          <span class="prestamos-panel__summary-value">
            ${{ formatMoney(tabPrestamos === 'pagados' ? montoPagadosSeccion : saldoPorCobrar) }}
          </span>
        </p>
      </header>

      <!-- Cuerpo del panel: envuelve las tarjetas -->
      <div class="prestamos-panel__body">
        <!-- Empty de la pestaña activa -->
        <div
          v-if="prestamosFiltrados.length === 0"
          class="prestamos-panel__empty"
        >
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">
            <BanknotesIcon class="w-6 h-6" />
          </div>
          <p class="font-display font-semibold text-gray-700">
            {{ tabPrestamos === 'pagados' ? 'No hay préstamos pagados' : 'No hay préstamos por cobrar' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ tabPrestamos === 'pagados'
              ? 'Los préstamos saldados aparecerán aquí.'
              : '¡Todo al día! Aún no hay préstamos pendientes de cobro.' }}
          </p>
        </div>

        <!-- Lista de la pestaña activa -->
        <div v-else class="space-y-3 sm:space-y-4">
        <div
          v-for="prestamo in prestamosFiltrados"
          :key="prestamo.id"
          @click="abrirModalDetalle(prestamo)"
          :class="[
            'group relative overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200 cursor-pointer',
            prestamo.tieneCuotasVencidas
              ? 'border border-rose-200'
              : 'border border-[color:var(--surface-divider)]'
          ]"
        >
          <!-- Franja slim de mora -->
          <div
            v-if="prestamo.tieneCuotasVencidas"
            class="flex items-center gap-1.5 bg-rose-50 border-b border-rose-100 px-4 py-2 text-rose-700"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-xs font-bold">En mora</span>
            <span class="text-xs font-semibold text-rose-500">· {{ prestamo.diasMora }} {{ prestamo.diasMora === 1 ? 'día' : 'días' }}</span>
            <span class="ml-auto text-xs font-bold whitespace-nowrap">${{ formatMoney(prestamo.valorCuotasEnDeuda || 0) }} en deuda</span>
          </div>

          <!-- Franja slim: al día (préstamo activo sin cuotas vencidas) -->
          <div
            v-else-if="prestamo.estado === 'activo'"
            class="flex items-center gap-1.5 bg-emerald-50 border-b border-emerald-100 px-4 py-2 text-emerald-700"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs font-bold">Al día</span>
          </div>

          <div class="p-4 sm:p-5">
            <!-- Socio + saldo -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  :class="[
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                    prestamo.tieneCuotasVencidas
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]'
                  ]"
                >
                  <BanknotesIcon class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <p class="font-display font-semibold text-gray-800 text-base truncate">
                    {{ prestamo.socio_natillera?.socio?.nombre || 'Socio' }}
                  </p>
                  <p class="text-xs text-gray-500">{{ formatDate(prestamo.created_at) }}</p>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-[0.625rem] font-semibold uppercase tracking-wide text-gray-400">Saldo</p>
                <p
                  class="font-display font-bold text-lg leading-tight"
                  :class="prestamo.saldo_actual > 0 ? 'text-gray-900' : 'text-[color:var(--brand-primary)]'"
                >
                  ${{ formatMoney(prestamo.saldo_actual) }}
                </p>
              </div>
            </div>

            <!-- Barra de progreso pagado / total -->
            <div class="mt-4">
              <div class="flex items-center justify-between mb-1.5 text-xs">
                <span class="font-semibold text-gray-600">{{ porcentajePagadoPrestamo(prestamo) }}% pagado</span>
                <span class="font-medium text-gray-400">
                  ${{ formatMoney(calcularValorPagadoDetalle(prestamo)) }} de ${{ formatMoney(calcularSaldoInicialTotal(prestamo)) }}
                </span>
              </div>
              <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="prestamo.tieneCuotasVencidas ? 'bg-rose-400' : 'bg-[color:var(--brand-primary)]'"
                  :style="{ width: porcentajePagadoPrestamo(prestamo) + '%' }"
                ></div>
              </div>
            </div>

            <!-- Metadatos secundarios -->
            <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span>Monto <strong class="font-semibold text-gray-700">${{ formatMoney(prestamo.monto) }}</strong></span>
              <span class="text-gray-300" aria-hidden="true">·</span>
              <span>Interés <strong class="font-semibold text-gray-700">{{ prestamo.interes }}%</strong></span>
              <span class="text-gray-300" aria-hidden="true">·</span>
              <span>Pagado <strong class="font-semibold text-blue-600">${{ formatMoney(calcularValorPagadoDetalle(prestamo)) }}</strong></span>
            </div>

            <!-- Acciones -->
            <div class="mt-4 flex items-center gap-2">
              <template v-if="prestamo.estado === 'activo'">
                <button
                  @click.stop="abrirModalAbono(prestamo)"
                  :class="[
                    'flex-1 sm:flex-none py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation text-white',
                    prestamo.tieneCuotasVencidas
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)]'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Abonar</span>
                </button>
                <button
                  @click.stop="abrirModalRefinanciar(prestamo)"
                  class="flex-1 sm:flex-none py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="hidden sm:inline">Refinanciar</span>
                  <span class="sm:hidden">Refin.</span>
                </button>
              </template>
              <button
                v-if="prestamo.estado === 'pagado'"
                @click.stop="enviarComprobantePagado(prestamo)"
                class="flex-1 sm:flex-none py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-white"
              >
                <PaperAirplaneIcon class="w-4 h-4 flex-shrink-0" />
                <span>Enviar comprobante</span>
              </button>
              <button
                @click.stop="confirmarEliminarPrestamo(prestamo)"
                class="ml-auto sm:ml-0 sm:flex-none py-2.5 px-3 text-sm font-semibold rounded-xl transition-colors active:scale-95 bg-white border border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 touch-manipulation"
                aria-label="Eliminar préstamo"
              >
                <TrashIcon class="w-4 h-4 flex-shrink-0" />
                <span class="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
    </template>

    <!-- Modal Nuevo Préstamo (paso a paso) — patrón ModalWrapper / skill modales -->
    <ModalWrapper
      :show="!!modalNuevoPrestamo"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil: flex para X siempre a la derecha; sm+: absoluta sobre bloque centrado) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Crear Préstamo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ ['Monto y socio', 'Plazo e interés', 'Resumen'][pasoNuevoPrestamo] }}</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Crear Préstamo</h3>
              <p class="text-white/90 text-xs mt-1">{{ ['Monto y socio', 'Plazo e interés', 'Resumen'][pasoNuevoPrestamo] }}</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Barra de progreso paso a paso -->
        <div class="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 flex-shrink-0 bg-white border-b border-gray-100">
          <div class="flex gap-0.5 sm:gap-1">
            <template v-for="(label, idx) in ['Monto', 'Plazo', 'Resumen']" :key="idx">
              <div class="flex-1 flex flex-col items-center min-w-0">
                <div
                  :class="[
                    'h-1 sm:h-1.5 w-full rounded-full transition-all duration-300',
                    idx <= pasoNuevoPrestamo ? 'bg-emerald-500' : 'bg-gray-100'
                  ]"
                ></div>
                <span
                  :class="[
                    'text-[10px] sm:text-[11px] font-medium mt-1.5 sm:mt-2 truncate w-full text-center',
                    idx <= pasoNuevoPrestamo ? 'text-gray-800' : 'text-gray-400'
                  ]"
                >{{ label }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Contenido por pasos: envoltorio ancla el hint al viewport del cuerpo (evita píldora a mitad en Safari/WebKit) -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalNuevoPrestamoScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="actualizarIndicadorScrollModalNuevoPrestamo"
        >
          <form @submit.prevent="pasoNuevoPrestamo < 2 ? pasoNuevoPrestamo++ : handleCrearPrestamo()" class="px-4 sm:px-6 pt-4 sm:pt-5 pb-0">
          <!-- Paso 0: Monto y socio -->
          <div v-show="pasoNuevoPrestamo === 0" class="space-y-4 sm:space-y-5">
          <!-- Selector de Socio -->
          <div class="relative selector-socio-container">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Socio</label>
            <div class="relative">
              <button
                type="button"
                @click="mostrarSelectorSocio = !mostrarSelectorSocio"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 bg-white',
                  formPrestamo.socio_natillera_id 
                    ? 'border-emerald-300 text-gray-800' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  mostrarSelectorSocio ? 'border-emerald-400 ring-2 ring-emerald-500/20' : ''
                ]"
              >
                <div v-if="socioSeleccionado" class="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)" 
                    :alt="socioSeleccionado.socio?.nombre"
                    class="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 object-cover"
                  />
                  <div class="flex-1 min-w-0 text-left">
                    <p class="font-semibold text-gray-800 truncate">{{ socioSeleccionado.socio?.nombre }}</p>
                    <p v-if="socioSeleccionado.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socioSeleccionado.socio.telefono }}</p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3 flex-1 text-gray-500">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon class="w-5 h-5 text-gray-400" />
                  </div>
                  <span>Selecciona un socio...</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
                    mostrarSelectorSocio ? 'transform rotate-180' : ''
                  ]"
                />
              </button>

              <!-- Dropdown de socios -->
              <div 
                v-if="mostrarSelectorSocio"
                @click.stop
                class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
              >
                <div class="p-2.5 border-b border-gray-100 sticky top-0 bg-white">
                  <input
                    v-model="busquedaSocio"
                    type="text"
                    placeholder="Buscar socio..."
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-colors"
                    @click.stop
                  />
                </div>
                <div class="overflow-y-auto max-h-64">
                  <button
                    v-for="socio in sociosFiltrados"
                    :key="socio.id"
                    type="button"
                    @click="seleccionarSocio(socio)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                    :class="formPrestamo.socio_natillera_id === socio.id ? 'bg-emerald-50/80' : ''"
                  >
                    <img 
                      :src="getAvatarUrl(socio.socio?.nombre || socio.id, socio.socio?.avatar_seed, socio.socio?.avatar_style)" 
                      :alt="socio.socio?.nombre"
                      class="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0 object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800 truncate">{{ socio.socio?.nombre }}</p>
                      <p v-if="socio.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socio.socio.telefono }}</p>
                      <p v-else-if="socio.socio?.email" class="text-xs text-gray-500 truncate">{{ socio.socio.email }}</p>
                    </div>
                    <div v-if="formPrestamo.socio_natillera_id === socio.id" class="flex-shrink-0">
                      <div class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </button>
                  <div v-if="sociosFiltrados.length === 0" class="p-4 text-center text-gray-500 text-sm">
                    No se encontraron socios
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="formPrestamo.socio_natillera_id && !cargandoTotalAhorradoSocio && totalAhorradoInformativoSocio !== null"
              class="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 shadow-sm ring-1 ring-emerald-500/15 sm:px-5 sm:py-4"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-base font-semibold text-gray-700">Total ahorrado por el socio</span>
                <span class="text-lg font-bold tabular-nums text-emerald-800 shrink-0">${{ formatMoney(totalAhorradoInformativoSocio) }}</span>
              </div>
            </div>
            <div
              v-else-if="formPrestamo.socio_natillera_id && cargandoTotalAhorradoSocio"
              class="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 shadow-sm ring-1 ring-emerald-500/15 sm:px-5 sm:py-4"
              aria-busy="true"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-base font-semibold text-gray-700">Total ahorrado por el socio</span>
                <span class="h-6 w-28 rounded-md bg-emerald-200/70 animate-pulse shrink-0" aria-hidden="true" />
              </div>
            </div>
          </div>

          <!-- Periodicidad de pago -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Periodicidad</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="formPrestamo.periodicidad = 'mensual'"
                :class="[
                  'p-3 rounded-xl border text-left transition-all duration-200',
                  formPrestamo.periodicidad === 'mensual'
                    ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                ]"
              >
                <div class="flex items-center gap-2">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.periodicidad === 'mensual' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500']">
                    <CalendarDaysIcon class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span :class="['font-semibold text-sm block', formPrestamo.periodicidad === 'mensual' ? 'text-emerald-800' : 'text-gray-700']">Mensual</span>
                    <span class="text-xs text-gray-500">Una cuota por mes</span>
                  </div>
                  <div v-if="formPrestamo.periodicidad === 'mensual'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  </div>
                </div>
              </button>
              <button
                type="button"
                @click="formPrestamo.periodicidad = 'quincenal'"
                :class="[
                  'p-3 rounded-xl border text-left transition-all duration-200',
                  formPrestamo.periodicidad === 'quincenal'
                    ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                ]"
              >
                <div class="flex items-center gap-2">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.periodicidad === 'quincenal' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500']">
                    <ClockIcon class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span :class="['font-semibold text-sm block', formPrestamo.periodicidad === 'quincenal' ? 'text-emerald-800' : 'text-gray-700']">Quincenal</span>
                    <span class="text-xs text-gray-500">Dos cuotas por mes</span>
                  </div>
                  <div v-if="formPrestamo.periodicidad === 'quincenal'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Monto del préstamo -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Monto del préstamo</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg z-10">$</div>
              <input 
                :value="montoFormateado"
                @input="actualizarMonto"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                type="text" 
                inputmode="numeric"
                class="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-lg font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-shadow"
                placeholder="100.000"
                required
              />
            </div>
            <p v-if="formPrestamo.monto >= 10000" class="mt-1.5 text-sm text-gray-500">
              <span class="font-medium text-emerald-600">${{ formatMoney(formPrestamo.monto) }}</span> pesos colombianos
            </p>
            <p v-else-if="formPrestamo.monto > 0" class="mt-1.5 text-sm text-amber-600">
              Monto mínimo ${{ formatMoney(10000) }}
            </p>
          </div>
          </div>

          <!-- Paso 1: Plazo e interés -->
          <div v-show="pasoNuevoPrestamo === 1" class="space-y-4 sm:space-y-5">
          <!-- Tipo de interés -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Tipo de interés</label>
            <div class="grid grid-cols-2 gap-2">
              <label :class="['flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200', formPrestamo.tipo_interes === 'simple' ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300']">
                <input type="radio" v-model="formPrestamo.tipo_interes" value="simple" class="sr-only" required />
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.tipo_interes === 'simple' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400']">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span :class="['font-semibold text-sm block', formPrestamo.tipo_interes === 'simple' ? 'text-emerald-800' : 'text-gray-700']">Simple</span>
                  <span class="text-xs text-gray-500">Sobre monto inicial</span>
                </div>
                <div v-if="formPrestamo.tipo_interes === 'simple'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
              </label>
              <label :class="['flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200', formPrestamo.tipo_interes === 'compuesto' ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300']">
                <input type="radio" v-model="formPrestamo.tipo_interes" value="compuesto" class="sr-only" required />
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.tipo_interes === 'compuesto' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400']">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span :class="['font-semibold text-sm block', formPrestamo.tipo_interes === 'compuesto' ? 'text-emerald-800' : 'text-gray-700']">Compuesto</span>
                  <span class="text-xs text-gray-500">Se acumula por periodo</span>
                </div>
                <div v-if="formPrestamo.tipo_interes === 'compuesto'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
              </label>
            </div>
          </div>

          <!-- Número de cuotas e Interés -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Nº de cuotas</label>
              <input 
                v-model.number="formPrestamo.numero_cuotas"
                type="number" 
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-center font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
                :placeholder="String(plazoMaximoCuotasCrear)"
                min="1"
                :max="plazoMaximoCuotasCrear"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                @blur="limitarNumeroCuotasCrearPrestamo"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Tasa % (mensual)</label>
              <input 
                v-model.number="formPrestamo.interes"
                type="number" 
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-center font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
                :placeholder="String(reglasInteresNatillera.porcentaje)"
                min="0"
                max="100"
                step="0.5"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                required
              />
            </div>
          </div>
          <p
            v-if="Number(formPrestamo.numero_cuotas) > plazoMaximoCuotasCrear"
            class="text-xs text-red-600 font-medium mt-1.5"
          >
            El plazo máximo permitido es {{ plazoMaximoCuotasCrear }} cuotas según la configuración de la natillera. Reduce el número de cuotas.
          </p>

          <!-- Fecha de pago (primera cuota) -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Primera cuota</label>
            <DateInput
              v-model="formPrestamo.fecha_pago"
              placeholder="dd/MM/yyyy"
              input-class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
              :required="true"
            />
            <p class="mt-1 text-xs text-gray-500">Siguientes cuotas {{ formPrestamo.periodicidad === 'quincenal' ? 'cada 15 días' : 'cada mes' }}.</p>
          </div>

          <!-- Medio de entrega -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Medio de entrega</label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="formPrestamo.medio_entrega = 'efectivo'"
                :class="['flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all', formPrestamo.medio_entrega === 'efectivo' ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']"
              >Efectivo</button>
              <button
                type="button"
                @click="formPrestamo.medio_entrega = 'transferencia'"
                :class="['flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all', formPrestamo.medio_entrega === 'transferencia' ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']"
              >Transferencia</button>
            </div>
          </div>

          <!-- Toggle Interés Normal / Anticipado -->
          <div v-if="formPrestamo.monto && formPrestamo.interes && formPrestamo.numero_cuotas">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Cobro del interés</label>
            <p class="text-xs text-gray-500 mb-1.5">Define si el interés se descuenta al desembolso (anticipado) o se reconoce al pagar cada cuota (normal).</p>
            <div class="rounded-xl border border-gray-200 bg-white p-1.5 flex gap-1">
              <button type="button" @click="mostrarInteresAnticipado = false" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all', !mostrarInteresAnticipado ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50']">Normal</button>
              <button type="button" @click="mostrarInteresAnticipado = true" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all', mostrarInteresAnticipado ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50']">Anticipado</button>
            </div>
          </div>
          </div>

          <!-- Paso 2: Resumen. Antes de crear: botón WhatsApp antes de Generar. Después de crear: comprobante con Descargar y WhatsApp -->
          <div v-show="pasoNuevoPrestamo === 2" class="space-y-3 sm:space-y-4">
            <!-- Vista antes de generar: sin comprobante; confirmar desde el footer -->
            <template v-if="!prestamoRecienCreado">
              <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
                <p class="text-sm font-semibold text-gray-800">Resumen</p>
                <p class="text-lg font-bold text-gray-900 leading-tight">{{ socioSeleccionado?.socio?.nombre || 'Socio' }}</p>
                <dl class="space-y-2 text-sm text-gray-700">
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Valor del préstamo</dt>
                    <dd class="font-semibold text-gray-900 tabular-nums">${{ formatMoney(formPrestamo.monto) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Intereses (total)</dt>
                    <dd class="font-semibold text-amber-800 tabular-nums">${{ formatMoney(Math.round(interesTotal)) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Tasa mensual</dt>
                    <dd class="font-semibold text-gray-900">{{ formPrestamo.interes }}%</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Nº cuotas</dt>
                    <dd class="font-semibold text-gray-900">{{ formPrestamo.numero_cuotas }}</dd>
                  </div>
                  <div class="flex justify-between gap-3 border-t border-emerald-200/80 pt-2 mt-1">
                    <dt class="text-gray-800 font-medium">Total a pagar</dt>
                    <dd class="font-bold text-emerald-700 tabular-nums">${{ formatMoney(Math.round(montoTotal)) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Primera cuota</dt>
                    <dd class="font-medium text-gray-900">{{ formPrestamo.fecha_pago ? formatDate(formPrestamo.fecha_pago) : '—' }}</dd>
                  </div>
                </dl>
                <p class="text-xs text-gray-500">Cuota estimada: ${{ formatMoney(cuotaMensual) }}</p>
              </div>
              <p class="text-xs text-gray-500 text-center">Revisa los datos antes de confirmar.</p>
              <div class="flex items-center gap-2 text-gray-400 text-xs">
                <LockClosedIcon class="w-4 h-4 flex-shrink-0" />
                <span>Transacción segura y encriptada</span>
              </div>
              <!-- Primero: Compartir por WhatsApp (vista previa) -->
              <button
                v-if="socioSeleccionado"
                type="button"
                @click="abrirModalCompartirPrestamoWhatsApp"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                <ChatBubbleLeftIcon class="w-5 h-5" />
                Compartir por WhatsApp
              </button>
            </template>

            <!-- Vista después de generar: comprobante con opciones Descargar y Enviar por WhatsApp -->
            <template v-else>
              <div v-if="datosComprobanteCreado" ref="resumenPrestamoNuevoRef" class="comprobante-prestamo-nuevo rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm" style="min-width: 280px;">
                <div class="comprobante-content" style="background: #ecfdf5; padding: 14px 12px; color: #1f2937;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 14px; padding-bottom: 4px;">
                    <div style="width: 44px; height: 44px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <h1 style="font-size: 22px; font-weight: 800; margin: 0; color: #374151; letter-spacing: -0.5px;">Comprobante de Préstamo</h1>
                  </div>
                  <div style="background: white; padding: 14px 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                    <p style="color: #6b7280; font-size: 9px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">MONTO DEL PRÉSTAMO</p>
                    <p style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.5px; color: #059669; text-align: center;">${{ formatMoney(datosComprobanteCreado.monto) }}</p>
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                      <div style="min-width: 0; flex: 1;">
                        <p style="color: #9ca3af; font-size: 9px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">SOCIO</p>
                        <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1f2937;">{{ datosComprobanteCreado.nombreSocio }}</p>
                      </div>
                      <span
                        style="flex-shrink: 0; align-self: flex-start; font-size: 9px; font-weight: 700; padding: 4px 8px; border-radius: 9999px; white-space: nowrap; line-height: 1.25; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;"
                      >Al día</span>
                    </div>
                  </div>
                  <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                    <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 10px 0;">DETALLES DEL PRÉSTAMO</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px;">
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERÉS MENSUAL</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ datosComprobanteCreado.interes }}%</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">N° DE CUOTAS</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ datosComprobanteCreado.numero_cuotas }}</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">VALOR CUOTA</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(datosComprobanteCreado.cuotaMensual) }}</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">TOTAL A PAGAR</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(datosComprobanteCreado.totalAPagar) }}</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERESES GENERADOS</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #ea580c;">${{ formatMoney(datosComprobanteCreado.interesTotal) }}</p></div>
                    </div>
                  </div>
                  <div v-if="datosComprobanteCreado.planPagos?.length > 0" style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                    <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 8px 0;">PLAN DE PAGOS</p>
                    <p style="color: #6b7280; font-size: 9px; margin: 0 0 6px 0;">Fecha de inicio: {{ formatDate(datosComprobanteCreado.fecha_pago) }}</p>
                    <div style="overflow-x: auto;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                        <thead>
                          <tr style="background: #f0fdf4; border-bottom: 2px solid #a7f3d0;">
                            <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Nº</th>
                            <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Fecha vencimiento</th>
                            <th style="text-align: right; padding: 6px 8px; font-weight: 700; color: #065f46;">Valor cuota</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cuota, idx) in datosComprobanteCreado.planPagos" :key="idx" :style="{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }">
                            <td style="padding: 5px 8px; color: #374151; font-weight: 600;">{{ cuota.numero_cuota }}</td>
                            <td style="padding: 5px 8px; color: #374151;">{{ formatDate(cuota.fecha_proyectada) }}</td>
                            <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #059669;">${{ formatMoney(cuota.valor_cuota) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p class="text-xs text-gray-500 text-center">Préstamo creado. Puedes descargar o compartir el comprobante.</p>
              <div class="flex flex-col gap-3 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  @click="descargarResumenPrestamoNuevo"
                  :disabled="generandoResumenPrestamo"
                  class="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-500/80 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all hover:border-emerald-600 hover:bg-emerald-50/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55"
                >
                  <ArrowDownTrayIcon class="w-5 h-5 text-emerald-600 shrink-0" />
                  {{ generandoResumenPrestamo ? 'Generando…' : 'Descargar' }}
                </button>
                <button
                  type="button"
                  @click="abrirModalCompartirPrestamoWhatsApp"
                  class="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1B5E37] to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-[#164a2c] hover:to-emerald-700 active:scale-[0.99]"
                >
                  <ChatBubbleLeftIcon class="w-5 h-5 shrink-0 opacity-95" />
                  Enviar por WhatsApp
                </button>
              </div>
            </template>
          </div>

          <!-- Acciones por paso (dentro del scroll; pie fijo eliminado) -->
          <div class="mt-6 pt-4 border-t border-gray-100 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <div v-if="pasoNuevoPrestamo === 0" class="flex gap-2">
              <button type="button" @click="requestCloseTopModal" class="btn-modal-secondary flex-1">Cancelar</button>
              <button type="button" @click="pasoNuevoPrestamo++" :disabled="!formPrestamo.socio_natillera_id || formPrestamo.monto < 10000" class="btn-modal-primary flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente <ChevronRightIcon class="w-4 h-4" /></button>
            </div>
            <div v-else-if="pasoNuevoPrestamo === 1" class="flex gap-2">
              <button type="button" @click="pasoNuevoPrestamo--" class="btn-modal-secondary flex-1 inline-flex items-center justify-center gap-1.5"><ArrowLeftIcon class="w-4 h-4" /> Atrás</button>
              <button type="button" @click="pasoNuevoPrestamo++" :disabled="!formPrestamo.fecha_pago || !formPrestamo.numero_cuotas || formPrestamo.interes == null || formPrestamo.numero_cuotas < 1 || formPrestamo.numero_cuotas > plazoMaximoCuotasCrear" class="btn-modal-primary flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente <ChevronRightIcon class="w-4 h-4" /></button>
            </div>
            <div v-else-if="!prestamoRecienCreado" class="flex gap-2">
              <button type="button" @click="pasoNuevoPrestamo--" class="btn-modal-secondary flex-1 inline-flex items-center justify-center gap-1.5"><ArrowLeftIcon class="w-4 h-4" /> Atrás</button>
              <button type="button" @click="handleCrearPrestamo" :disabled="loading" class="btn-modal-primary flex-1 disabled:opacity-50">{{ loading ? 'Creando...' : 'Confirmar' }}</button>
            </div>
            <div v-else class="flex gap-2">
              <button type="button" @click="requestCloseTopModal" class="btn-modal-secondary flex-1">Cerrar</button>
            </div>
          </div>
          </form>
        </div>

          <div
            v-show="hayMasContenidoAbajoModalNuevoPrestamo"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <!-- Sombrita / velo inferior: detrás del hint (z-0) -->
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <!-- Pastilla siempre por encima de la sombra -->
            <div
              class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
            >
              <div
                class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
              >
                <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                  Desliza para ver más
                </p>
                <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
              </div>
            </div>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Abono — patrón ModalWrapper / Crear préstamo (skill modales) -->
    <ModalWrapper
      :show="!!modalAbono"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Registrar abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Pago al préstamo</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Registrar abono</h3>
              <p class="text-white/90 text-xs mt-1">Pago al préstamo</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalAbonoScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="actualizarIndicadorScrollModalAbono"
        >
          <form @submit.prevent="handleRegistrarAbono" class="px-4 sm:px-6 pt-4 sm:pt-5 pb-0 space-y-4 sm:space-y-5">
            <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UserIcon class="w-5 h-5 text-white" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-gray-800 truncate">{{ prestamoSeleccionado?.socio_natillera?.socio?.nombre }}</p>
                  <p class="text-xs text-gray-600">Socio</p>
                </div>
              </div>
              <dl class="space-y-2 text-sm text-gray-700 border-t border-emerald-200/70 pt-3">
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-600">Saldo actual</dt>
                  <dd class="font-bold text-emerald-800 tabular-nums">${{ formatMoney(prestamoSeleccionado?.saldo_actual) }}</dd>
                </div>
                <div v-if="moraPrestamoAbono > 0" class="flex justify-between gap-3">
                  <dt class="text-rose-600">Interés de mora</dt>
                  <dd class="font-bold text-rose-700 tabular-nums">${{ formatMoney(moraPrestamoAbono) }}</dd>
                </div>
                <div v-if="moraPrestamoAbono > 0" class="flex justify-between gap-3 border-t border-emerald-200/70 pt-2">
                  <dt class="text-gray-800 font-semibold">Total a pagar</dt>
                  <dd class="font-bold text-gray-900 tabular-nums">${{ formatMoney(totalAPagarConMora) }}</dd>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <div class="rounded-lg border border-white/80 bg-white/70 px-3 py-2">
                    <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">Cuota</p>
                    <p class="text-sm font-bold text-gray-900 tabular-nums">${{ formatMoney(calcularCuotaMensualDetalle(prestamoSeleccionado)) }}</p>
                  </div>
                  <div class="rounded-lg border border-white/80 bg-white/70 px-3 py-2">
                    <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">Restantes</p>
                    <p class="text-sm font-bold text-gray-900">{{ calcularCuotasRestantes(prestamoSeleccionado) }}</p>
                  </div>
                </div>
              </dl>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Valor del abono *</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg z-10 pointer-events-none">$</div>
                <input
                  ref="inputValorAbonoRef"
                  :value="valorAbonoFormateado"
                  @input="actualizarValorAbono"
                  @focus="$event.target.select()"
                  type="text"
                  inputmode="numeric"
                  class="w-full pl-9 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-lg font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-shadow"
                  placeholder="0"
                  required
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <PencilIcon class="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
              <p class="mt-1.5 text-xs text-gray-500">Puedes modificar el valor a mano.</p>

              <div
                v-if="prestamoSeleccionado?.saldo_actual && formAbono.valor"
                class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3"
              >
                <div v-if="moraPagadaAbono > 0" class="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-emerald-200/70">
                  <span class="text-sm text-rose-600">Se cobra de mora</span>
                  <span class="text-sm font-bold tabular-nums text-rose-700">${{ formatMoney(moraPagadaAbono) }}</span>
                </div>
                <div v-if="moraPagadaAbono > 0" class="flex items-center justify-between gap-2 mb-2">
                  <span class="text-sm text-gray-600">Abono al préstamo</span>
                  <span class="text-sm font-bold tabular-nums text-gray-800">${{ formatMoney(abonoACapitalAbono) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-gray-700">Saldo después del abono</span>
                  <span class="text-base font-bold tabular-nums text-emerald-800">
                    ${{ formatMoney(saldoDespuesAbono) }}
                  </span>
                </div>
                <div v-if="saldoDespuesAbono <= 0" class="mt-2 pt-2 border-t border-emerald-200/80">
                  <p class="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircleIcon class="w-4 h-4 flex-shrink-0" />
                    El préstamo quedará pagado
                  </p>
                </div>
              </div>

              <div v-if="formAbono.valor && formAbono.valor < 1000" class="mt-2 text-xs text-amber-600 font-medium">
                El valor mínimo del abono es $1.000
              </div>
              <div v-if="formAbono.valor && parseFloat(formAbono.valor) > totalAPagarConMora" class="mt-2 text-xs text-red-600 font-medium">
                El abono no puede superar el total a pagar (máx. ${{ formatMoney(totalAPagarConMora) }})
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Forma de pago</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="formAbono.tipo_pago = 'efectivo'"
                  :class="[
                    'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    formAbono.tipo_pago === 'efectivo'
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  ]"
                >Efectivo</button>
                <button
                  type="button"
                  @click="formAbono.tipo_pago = 'transferencia'"
                  :class="[
                    'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    formAbono.tipo_pago === 'transferencia'
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  ]"
                >Transferencia</button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Fecha de pago *</label>
              <DateInput
                v-model="formAbono.fecha_pago"
                placeholder="dd/MM/yyyy"
                input-class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
                :required="true"
              />
              <p class="mt-1 text-xs text-gray-500">Fecha en que se hizo el pago.</p>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="requestCloseTopModal"
                  class="btn-modal-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  @click="handleRegistrarAbono"
                  class="btn-modal-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="loading || !formAbono.valor || formAbono.valor < 1000 || parseFloat(formAbono.valor) > totalAPagarConMora || abonoACapitalAbono <= 0"
                >
                  <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <CurrencyDollarIcon v-else class="w-5 h-5" />
                  {{ loading ? 'Registrando…' : 'Registrar abono' }}
                </button>
              </div>
            </div>
          </form>
        </div>

          <div
            v-show="hayMasContenidoAbajoModalAbono"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
            >
              <div
                class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
              >
                <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                  Desliza para ver más
                </p>
                <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
              </div>
            </div>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Comprobante de Abono -->
    <ModalWrapper
      :show="!!(modalComprobanteAbono && comprobanteAbono)"
      :z-index="70"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Comprobante de Abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Abono registrado exitosamente</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Comprobante de Abono</h3>
              <p class="text-white/90 text-xs mt-1">Abono registrado exitosamente</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6" style="background: #eef1f4;">
          <!-- Wrapper de captura: el padding da aire a las muescas laterales para que toPng no recorte los bordes -->
          <div
            ref="comprobanteRef"
            style="max-width: 388px; margin: 0 auto; padding: 14px; background: #eef1f4; border-radius: 28px;"
          >
          <!-- Comprobante estilo ticket -->
          <div
            id="comprobante-abono"
            style="width: 100%; position: relative; background: #ffffff; border-radius: 22px; overflow: hidden; font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 22px 44px -18px rgba(20,71,42,0.45); border: 1px solid rgba(20,71,42,0.10);"
          >
            <!-- Cabecera marca verde + hero del valor -->
            <div style="background: #1B5E37; padding: 22px 22px 22px; color: #ffffff;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div style="min-width: 0;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; letter-spacing: -0.2px; line-height: 1.15;">Comprobante de abono</p>
                  <p style="margin: 2px 0 0; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Abono a préstamo</p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Valor del abono</p>
                <p style="margin: 7px 0 0; font-size: 40px; font-weight: 800; letter-spacing: -1.8px; line-height: 1;">${{ formatMoney(comprobanteAbono.valor) }}</p>
                <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 13px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 9999px; padding: 5px 13px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; display: inline-block;"></span>
                  <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.3px; color: #d1fae5;">Registrado</span>
                </div>
              </div>
            </div>

            <!-- Perforación (dashed + muescas laterales que simulan el corte del ticket) -->
            <div style="position: relative; background: #ffffff; height: 22px;">
              <div style="position: absolute; left: 18px; right: 18px; top: 50%; border-top: 2px dashed #dfe3e8;"></div>
              <span style="position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
              <span style="position: absolute; right: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
            </div>

            <!-- Cuerpo: detalles -->
            <div style="background: #ffffff; padding: 2px 22px 22px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Socio</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ comprobanteAbono.socioNombre }}</span>
              </div>
              <div style="height: 1px; background: #eef2ee;"></div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Concepto</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">Abono a préstamo</span>
              </div>
              <div style="height: 1px; background: #eef2ee;"></div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Fecha</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">{{ comprobanteAbono.fecha }}</span>
              </div>
              <!-- Desglose si el pago incluyó mora -->
              <template v-if="comprobanteAbono.moraPagada > 0">
                <div style="height: 1px; background: #eef2ee;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                  <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Abono al préstamo</span>
                  <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">${{ formatMoney(comprobanteAbono.abonoAPrestamo) }}</span>
                </div>
                <div style="height: 1px; background: #eef2ee;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                  <span style="font-size: 12px; font-weight: 600; color: #b91c1c;">Interés de mora</span>
                  <span style="font-size: 13px; font-weight: 700; color: #dc2626; text-align: right;">${{ formatMoney(comprobanteAbono.moraPagada) }}</span>
                </div>
              </template>

              <!-- Saldos -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
                <div style="background: #f6faf6; border: 1px solid #e6efe6; border-radius: 12px; padding: 11px 12px;">
                  <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: #9aa39a;">Saldo anterior</p>
                  <p style="margin: 5px 0 0; font-size: 15px; font-weight: 800; color: #374151; letter-spacing: -0.3px;">${{ formatMoney(comprobanteAbono.saldoAnterior) }}</p>
                </div>
                <div style="background: #e8f5e9; border: 1px solid #bfe3c6; border-radius: 12px; padding: 11px 12px;">
                  <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: #3f8a54;">Saldo nuevo</p>
                  <p style="margin: 5px 0 0; font-size: 15px; font-weight: 800; color: #1B5E37; letter-spacing: -0.3px;">${{ formatMoney(comprobanteAbono.saldoNuevo) }}</p>
                </div>
              </div>

              <!-- Código -->
              <div v-if="comprobanteAbono.codigoComprobante" style="margin-top: 16px; padding-top: 16px; border-top: 2px dashed #e6efe6; text-align: center;">
                <p style="margin: 0 0 7px; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9aa39a;">Código de comprobante</p>
                <div style="display: inline-block; background: #f3f6f3; border: 1px solid #e2eae2; border-radius: 9px; padding: 8px 14px;">
                  <span style="font-family: 'Courier New', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #1B5E37;">{{ comprobanteAbono.codigoComprobante }}</span>
                </div>
              </div>

              <!-- Firma de marca -->
              <p style="margin: 16px 0 0; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.2px; color: #adb5ad;">Generado con Natillerapp</p>
            </div>
          </div>
          </div>
        </div>

        <!-- Footer fijo con botones de acción -->
        <div class="border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex-shrink-0 space-y-3">
          <div class="space-y-3">
            <button 
              @click="descargarComprobanteAbono"
              :disabled="generandoImagenComprobante"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon v-if="!generandoImagenComprobante" class="w-5 h-5" />
              <span v-if="generandoImagenComprobante" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ generandoImagenComprobante ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <button 
              @click="compartirWhatsAppAbono"
              :disabled="generandoImagenComprobante || !comprobanteAbono?.socioTelefono"
              :class="[
                'block sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all',
                (generandoImagenComprobante || !comprobanteAbono?.socioTelefono)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              ]"
              :title="!comprobanteAbono?.socioTelefono ? 'No hay teléfono registrado para este socio' : ''"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
              <span v-if="generandoImagenComprobante">Preparando...</span>
              <span v-else-if="!comprobanteAbono?.socioTelefono">📲 Sin teléfono registrado</span>
              <span v-else>📲 Compartir por WhatsApp</span>
            </button>
          </div>

          <p class="hidden sm:block text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>

          <button 
            @click="requestCloseTopModal"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal Comprobante de Préstamo Pagado -->
    <ModalWrapper
      :show="!!(modalComprobantePagado && comprobantePagado)"
      :z-index="70"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Préstamo pagado</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Comprobante de pago total</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Préstamo pagado</h3>
              <p class="text-white/90 text-xs mt-1">Comprobante de pago total</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Cuerpo con scroll -->
        <div v-if="comprobantePagado" class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6" style="background: #eef1f4;">
          <!-- Wrapper de captura: el padding da aire a las muescas laterales para que toPng no recorte los bordes -->
          <div
            ref="comprobantePagadoRef"
            style="max-width: 388px; margin: 0 auto; padding: 14px; background: #eef1f4; border-radius: 28px;"
          >
          <div
            id="comprobante-pagado"
            style="width: 100%; position: relative; background: #ffffff; border-radius: 22px; overflow: hidden; font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 22px 44px -20px rgba(15,23,42,0.35); border: 1px solid rgba(15,23,42,0.08);"
          >
            <!-- Cabecera marca verde + hero del total -->
            <div style="background: #1B5E37; padding: 22px 22px 22px; color: #ffffff;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div style="min-width: 0;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; letter-spacing: -0.2px; line-height: 1.15;">Comprobante de pago</p>
                  <p style="margin: 2px 0 0; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Préstamo liquidado</p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Total pagado</p>
                <p style="margin: 7px 0 0; font-size: 38px; font-weight: 800; letter-spacing: -1.6px; line-height: 1;">${{ formatMoney(comprobantePagado.totalPagado) }}</p>
                <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 13px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 9999px; padding: 5px 13px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; display: inline-block;"></span>
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #d1fae5;">Préstamo pagado</span>
                </div>
              </div>
            </div>

            <!-- Perforación -->
            <div style="position: relative; background: #ffffff; height: 22px;">
              <div style="position: absolute; left: 18px; right: 18px; top: 50%; border-top: 2px dashed #dfe3e8;"></div>
              <span style="position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
              <span style="position: absolute; right: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
            </div>

            <!-- Detalles + abonos -->
            <div style="background: #ffffff; padding: 4px 22px 22px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Socio</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ comprobantePagado.socioNombre }}</span>
              </div>
              <div style="height: 1px; background: #eef2ee;"></div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Monto del préstamo</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">${{ formatMoney(comprobantePagado.montoPrestamo) }}</span>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; margin-bottom: 10px;">
                <span style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9aa3af;">Abonos realizados</span>
                <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 7px; border-radius: 9999px; background: #e8f5e9; color: #1B5E37; font-size: 11px; font-weight: 800;">{{ comprobantePagado.numAbonos }}</span>
              </div>
              <div
                v-for="(ab, idx) in comprobantePagado.abonos"
                :key="idx"
                style="display: flex; align-items: center; gap: 11px; padding: 10px 12px; margin-bottom: 8px; background: #f5faf6; border: 1px solid #e2eee4; border-radius: 12px;"
              >
                <div style="width: 32px; height: 32px; border-radius: 10px; background: #e8f5e9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1B5E37" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div style="min-width: 0; flex: 1;">
                  <p style="margin: 0; font-size: 9px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; color: #9aa3af;">Abono {{ idx + 1 }}</p>
                  <p style="margin: 2px 0 0; font-size: 12px; font-weight: 600; color: #6b7280;">{{ ab.fecha }}</p>
                </div>
                <span style="font-size: 16px; font-weight: 800; color: #1B5E37; letter-spacing: -0.4px; white-space: nowrap;">${{ formatMoney(ab.valor) }}</span>
              </div>

              <p style="margin: 14px 0 0; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.2px; color: #adb5bd;">Generado con Natillerapp</p>
            </div>
          </div>
          </div>
        </div>

        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
          <button
            type="button"
            @click="descargarComprobantePagado"
            :disabled="generandoImagenComprobantePagado"
            class="btn-modal-primary w-full"
          >
            <ArrowDownTrayIcon v-if="!generandoImagenComprobantePagado" class="w-5 h-5" />
            <span v-if="generandoImagenComprobantePagado" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ generandoImagenComprobantePagado ? 'Generando...' : 'Descargar imagen' }}
          </button>

          <!-- WhatsApp: comparte imagen con Web Share (móvil) -->
          <button
            type="button"
            @click="compartirWhatsAppComprobantePagado"
            :disabled="generandoImagenComprobantePagado || !comprobantePagado?.socioTelefono"
            :class="[
              'block sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-full transition-colors min-h-[48px]',
              (generandoImagenComprobantePagado || !comprobantePagado?.socioTelefono)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            ]"
            :title="!comprobantePagado?.socioTelefono ? 'No hay teléfono registrado para este socio' : ''"
          >
            <ChatBubbleLeftIcon class="w-5 h-5" />
            <span v-if="!comprobantePagado?.socioTelefono">📲 Sin teléfono registrado</span>
            <span v-else>📲 Compartir por WhatsApp</span>
          </button>

          <p class="hidden sm:block text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>

          <button type="button" class="btn-modal-secondary w-full" @click="requestCloseTopModal">
            Cerrar
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal Editar Abono -->
    <ModalWrapper
      :show="!!(modalEditarAbono && abonoAEditar)"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Editar Abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Modifica el valor del abono registrado</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <PencilIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Editar Abono</h3>
              <p class="text-white/90 text-xs mt-1">Modifica el valor del abono registrado</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <form @submit.prevent="guardarAbonoEditado" class="p-5 sm:p-6 space-y-6">
            <!-- Información del abono actual -->
            <div class="relative bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-lg overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                    <CurrencyDollarIcon class="w-5 h-5 text-white" />
                  </div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abono Actual</p>
                </div>
                <p class="text-3xl font-bold text-blue-700 mb-1">${{ formatMoney(abonoAEditar?.valorOriginal || abonoAEditar?.valor) }}</p>
                <p class="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(abonoAEditar?.fecha) }}
                </p>
              </div>
            </div>

            <!-- Campo de nuevo valor -->
            <div class="space-y-3">
              <label class="label mb-3 flex items-center gap-2 text-base">
                <div class="w-8 h-8 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon class="w-4 h-4 text-white" />
                </div>
                <span class="font-bold">Nuevo valor del abono *</span>
              </label>
              <div class="relative">
                <div class="absolute left-5 top-1/2 -translate-y-1/2 text-natillera-600 font-bold text-2xl z-10">
                  $
                </div>
                <input 
                  :value="valorAbonoEditadoFormateado"
                  @input="actualizarValorAbonoEditado"
                  @focus="$event.target.select()"
                  type="text" 
                  inputmode="numeric"
                  class="w-full pl-14 pr-5 py-4 text-2xl font-bold text-natillera-700 bg-white border-2 border-natillera-200 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 transition-all shadow-sm hover:shadow-md"
                  placeholder="0"
                  required
                />
              </div>
              
              <!-- Información del cambio -->
              <div 
                v-if="abonoAEditar?.valor && abonoAEditar.valor !== parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)" 
                class="mt-4 p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-xl shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Diferencia:
                  </span>
                  <span :class="[
                    'text-xl font-bold',
                    (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 ? 'text-green-700' : 'text-red-700'
                  ]">
                    {{ (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 ? '+' : '' }}${{ formatMoney(Math.abs(abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor))) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm text-amber-800 bg-white/60 rounded-lg px-3 py-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {{ (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 
                      ? 'El saldo del préstamo disminuirá en esta cantidad' 
                      : 'El saldo del préstamo aumentará en esta cantidad' }}
                  </span>
                </div>
              </div>
              
              <!-- Validaciones -->
              <div v-if="abonoAEditar?.valor && abonoAEditar.valor < 1000" class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-medium">El valor mínimo del abono es $1.000</span>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-white px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex-shrink-0">
          <div class="flex gap-3">
            <button
              type="button"
              @click="requestCloseTopModal"
              class="btn-modal-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="guardarAbonoEditado"
              class="btn-modal-primary flex-1"
              :disabled="loading || !abonoAEditar?.valor || abonoAEditar.valor < 1000 || abonoAEditar.valor === parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)"
            >
              <PencilIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Refinanciar Préstamo -->
    <ModalWrapper
      :show="!!modalRefinanciar"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <ArrowPathIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Refinanciar Préstamo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Actualiza fecha de pago y recalcula intereses</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <ArrowPathIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Refinanciar Préstamo</h3>
              <p class="text-white/90 text-xs mt-1">Actualiza la fecha de pago y recalcula los intereses</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <!-- Pestañas -->
          <div class="border-b border-gray-200 bg-gray-50">
            <div class="flex">
              <button
                type="button"
                @click="formRefinanciar.tabActual = 'refinanciar'"
                :class="[
                  'flex-1 px-4 py-3 text-sm font-semibold transition-all',
                  formRefinanciar.tabActual === 'refinanciar'
                    ? 'border-b-2 border-purple-500 text-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                ]"
              >
                Refinanciar
              </button>
            </div>
          </div>

          <!-- Contenido de la pestaña Refinanciar -->
          <div v-if="formRefinanciar.tabActual === 'refinanciar'">
          <form @submit.prevent="handleRefinanciar" class="p-4 sm:p-6 space-y-6">
            <!-- Información del préstamo actual -->
            <div v-if="prestamoSeleccionado" class="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-purple-600" />
                Información del Préstamo
              </h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-600 mb-1">Saldo Actual</p>
                  <p class="font-bold text-gray-800">${{ formatMoney(prestamoSeleccionado.saldo_actual) }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Interés</p>
                  <p class="font-bold text-gray-800">{{ prestamoSeleccionado.interes }}%</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Tipo de Interés</p>
                  <p class="font-bold text-gray-800 capitalize">{{ prestamoSeleccionado.tipo_interes || 'simple' }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Periodicidad</p>
                  <p class="font-bold text-gray-800 capitalize">{{ prestamoSeleccionado.periodicidad || 'mensual' }}</p>
                </div>
              </div>
            </div>

            <!-- Campo de nueva fecha de pago -->
            <div>
              <label class="label mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Nueva fecha de pago *</span>
              </label>
              <DateInput
                v-model="formRefinanciar.fecha_pago"
                placeholder="dd/MM/yyyy"
                input-class="text-base font-semibold"
                :required="true"
              />
              <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Esta será la nueva fecha de inicio para recalcular el plan de pagos e intereses
              </p>
            </div>

            <!-- Número de cuotas para el refinanciamiento -->
            <div>
              <label class="label mb-2">Número de cuotas *</label>
              <input 
                v-model.number="formRefinanciar.numero_cuotas_nuevo"
                type="number" 
                min="1"
                max="60"
                class="input-field text-center text-lg font-semibold"
                placeholder="1"
                required
              />
              <p class="mt-2 text-xs text-gray-500">
                Número de cuotas para el nuevo plan de pagos. Los intereses se calcularán sobre el saldo actual (${{ formatMoney(prestamoSeleccionado?.saldo_actual || 0) }}).
              </p>
            </div>

            <!-- Tipo de interés -->
            <div>
              <label class="label mb-2">Tipo de interés *</label>
              <div class="grid grid-cols-2 gap-3">
                <label 
                  :class="[
                    'relative flex flex-row items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    formRefinanciar.tipo_interes_nuevo === 'simple'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                  ]"
                >
                  <input 
                    type="radio" 
                    v-model="formRefinanciar.tipo_interes_nuevo" 
                    value="simple"
                    class="sr-only"
                  />
                  <div 
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      formRefinanciar.tipo_interes_nuevo === 'simple'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 border-2 border-gray-200'
                    ]"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="font-bold text-xs block">Simple</span>
                  </div>
                  <div 
                    v-if="formRefinanciar.tipo_interes_nuevo === 'simple'"
                    class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </label>

                <label 
                  :class="[
                    'relative flex flex-row items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    formRefinanciar.tipo_interes_nuevo === 'compuesto'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                  ]"
                >
                  <input 
                    type="radio" 
                    v-model="formRefinanciar.tipo_interes_nuevo" 
                    value="compuesto"
                    class="sr-only"
                  />
                  <div 
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      formRefinanciar.tipo_interes_nuevo === 'compuesto'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                        : 'bg-gray-100 border-2 border-gray-200'
                    ]"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="font-bold text-xs block">Compuesto</span>
                  </div>
                  <div 
                    v-if="formRefinanciar.tipo_interes_nuevo === 'compuesto'"
                    class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            <!-- Tasa de interés (opcional) -->
            <div>
              <label class="label mb-2">Tasa de interés mensual (%)</label>
              <input 
                v-model.number="formRefinanciar.interes_nuevo"
                type="number" 
                step="0.1"
                min="0"
                max="100"
                class="input-field text-center text-lg font-semibold"
                :placeholder="`Dejar vacío para usar ${prestamoSeleccionado?.interes || 0}%`"
              />
              <p class="mt-2 text-xs text-gray-500">
                Si se deja vacío, se usará la tasa de interés original ({{ prestamoSeleccionado?.interes || 0 }}%)
              </p>
            </div>

            <!-- Vista previa -->
            <div v-if="vistaPreviaRefinanciacion" class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Previa del Refinanciamiento
              </h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-600 mb-1">Saldo a refinanciar</p>
                  <p class="font-bold text-gray-800">${{ formatMoney(vistaPreviaRefinanciacion.saldo) }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Total de cuotas</p>
                  <p class="font-bold text-gray-800">{{ vistaPreviaRefinanciacion.totalCuotas }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Interés total</p>
                  <p class="font-bold text-orange-600">${{ formatMoney(vistaPreviaRefinanciacion.interesTotal) }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Total a pagar</p>
                  <p class="font-bold text-green-600">${{ formatMoney(vistaPreviaRefinanciacion.totalPagar) }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-gray-600 mb-1">Valor de cuota</p>
                  <p class="font-bold text-lg text-green-700">${{ formatMoney(vistaPreviaRefinanciacion.valorCuota) }}</p>
                </div>
              </div>
            </div>

            <!-- Advertencia -->
            <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold text-amber-800 mb-1">Advertencia</p>
                  <p class="text-sm text-amber-700">
                    Al refinanciar, se eliminarán las cuotas pendientes del plan de pagos actual y se generará un nuevo plan basado en el saldo actual y la nueva fecha de pago. Los intereses se recalcularán automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </form>
          </div>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex-shrink-0">
          <div class="flex gap-3">
            <button
              type="button"
              @click="requestCloseTopModal"
              class="btn-modal-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="handleRefinanciar"
              class="btn-modal-primary flex-1"
              :disabled="loading || !formRefinanciar.fecha_pago || !formRefinanciar.numero_cuotas_nuevo || formRefinanciar.numero_cuotas_nuevo <= 0 || !vistaPreviaRefinanciacion"
            >
              <ArrowPathIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Refinanciando...' : 'Refinanciar' }}</span>
            </button>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Detalle Préstamo — patrón ModalWrapper / skill modales -->
    <ModalWrapper
      :show="!!modalDetalle"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-3xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="48rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <BanknotesIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Detalle del préstamo</h3>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <BanknotesIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Detalle del préstamo</h3>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalDetalleScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="actualizarIndicadorScrollModalDetalle"
        >
          <div class="px-4 sm:px-6 pt-4 sm:pt-5 pb-0 space-y-5 sm:space-y-6">
            <!-- Socio titular (avatar + nombre) -->
            <div
              v-if="prestamoDetalle"
              class="flex flex-col gap-3 rounded-xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/80 via-white to-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            >
              <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <img
                  :src="getAvatarUrl(
                    prestamoDetalle.socio_natillera?.socio?.nombre || prestamoDetalle.socio_natillera?.id,
                    prestamoDetalle.socio_natillera?.socio?.avatar_seed,
                    prestamoDetalle.socio_natillera?.socio?.avatar_style
                  )"
                  :alt="prestamoDetalle.socio_natillera?.socio?.nombre || 'Socio'"
                  class="h-14 w-14 shrink-0 rounded-2xl border-2 border-white object-cover shadow-md ring-2 ring-emerald-100 sm:h-16 sm:w-16"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-800/90">
                    Socio titular
                  </p>
                  <p class="font-display text-base font-bold leading-tight text-gray-900 sm:text-lg">
                    {{ prestamoDetalle.socio_natillera?.socio?.nombre || '—' }}
                  </p>
                  <p
                    v-if="prestamoDetalle.socio_natillera?.socio?.telefono"
                    class="mt-0.5 truncate text-xs text-gray-500"
                  >
                    {{ prestamoDetalle.socio_natillera.socio.telefono }}
                  </p>
                </div>
              </div>
              <button
                v-if="planPagosPrestamo.length > 0"
                type="button"
                class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-[#1B5E37] shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50/90 sm:w-auto sm:self-center sm:px-3 sm:py-2"
                @click="abrirPlanPagosYDesplazarDetalle"
              >
                <CalendarDaysIcon class="h-5 w-5 shrink-0" />
                <span>Ver plan de pagos</span>
              </button>
            </div>

            <!-- Información del préstamo -->
            <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div class="flex items-center justify-between mb-4 gap-3">
                <h4 class="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-1 min-w-0">
                  <CurrencyDollarIcon class="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span class="truncate">Información del préstamo</span>
                </h4>
                <button
                  type="button"
                  @click.stop="abrirModalCompartirPrestamo"
                  class="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-full bg-gradient-to-r from-[#1B5E37] to-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all hover:from-[#164a2c] hover:to-emerald-700 flex-shrink-0"
                  title="Enviar por WhatsApp"
                >
                  <ChatBubbleLeftIcon class="w-4 h-4 flex-shrink-0" />
                  <span class="hidden sm:inline">WhatsApp</span>
                </button>
              </div>

              <!-- Badge: forma en que se entregó el préstamo -->
              <div v-if="prestamoDetalle?.medio_entrega" class="mb-4 flex">
                <div
                  class="forma-pago-badge"
                  :class="prestamoDetalle.medio_entrega === 'efectivo'
                    ? 'forma-pago-badge--efectivo'
                    : 'forma-pago-badge--transferencia'"
                >
                  <span class="forma-pago-badge__icon-wrap" aria-hidden="true">
                    <BanknotesIcon
                      v-if="prestamoDetalle.medio_entrega === 'efectivo'"
                      class="w-4 h-4"
                    />
                    <ArrowsRightLeftIcon v-else class="w-4 h-4" />
                  </span>
                  <span class="forma-pago-badge__text">
                    <span class="forma-pago-badge__label">Entregado en</span>
                    <span class="forma-pago-badge__value">
                      {{ prestamoDetalle.medio_entrega === 'efectivo' ? 'Efectivo' : 'Transferencia' }}
                    </span>
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <!-- Primera columna -->
                <div class="space-y-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Monto del préstamo</p>
                    <p class="font-bold text-gray-800">${{ formatMoney(prestamoDetalle?.monto) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Interés generado</p>
                    <p class="font-bold text-orange-600">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Total a pagar</p>
                    <p class="font-bold text-natillera-700">${{ formatMoney((prestamoDetalle?.monto || 0) + (calcularInteresGeneradoDetalle(prestamoDetalle) || 0)) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Valor de la cuota</p>
                    <p class="font-bold text-purple-600">${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Saldo actual</p>
                    <p class="font-bold" :class="prestamoDetalle?.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">
                      ${{ formatMoney(prestamoDetalle?.saldo_actual) }}
                    </p>
                  </div>
                </div>
                <!-- Segunda columna -->
                <div class="space-y-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Estado</p>
                    <span 
                      :class="[
                        'inline-block px-2 py-1 rounded-full text-xs font-bold',
                        prestamoDetalle?.estado === 'pagado' 
                          ? 'bg-green-100 text-green-700' : 
                        prestamoDetalle?.estado === 'activo' 
                          ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-700'
                      ]"
                    >
                      {{ prestamoDetalle?.estado }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Fecha de creación</p>
                    <p class="font-semibold text-gray-700 text-sm">{{ formatDate(prestamoDetalle?.created_at) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Interés mensual</p>
                    <p class="font-bold text-blue-600">{{ prestamoDetalle?.interes }}%</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Número de cuotas</p>
                    <p class="font-bold text-gray-800">{{ prestamoDetalle?.numero_cuotas || 1 }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Total pagado</p>
                    <p class="font-bold text-emerald-600">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Aviso: este préstamo fue refinanciado (lleva a la sección de refinanciación) -->
            <button
              v-if="historialRefinanciaciones.length > 0"
              type="button"
              @click="irASeccionRefinanciacion"
              class="w-full flex items-center gap-3 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 text-left transition-shadow hover:shadow-md active:scale-[0.99] touch-manipulation"
            >
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow">
                <ArrowPathIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-purple-800">Este préstamo fue refinanciado</p>
                <p class="text-xs text-purple-600">
                  {{ historialRefinanciaciones.length }} {{ historialRefinanciaciones.length === 1 ? 'refinanciación' : 'refinanciaciones' }} · Toca para ver el detalle
                </p>
              </div>
              <svg class="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Resumen de pagos -->
            <div class="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <h4 class="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-emerald-600" />
                Resumen de pagos
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total de abonos</p>
                  <p class="font-bold text-gray-800">{{ pagosCicloActual.length }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total abonado</p>
                  <p class="font-bold text-green-600">
                    ${{ formatMoney(pagosCicloActual.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0)) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Saldo pendiente</p>
                  <p class="font-bold text-red-600">${{ formatMoney(prestamoDetalle?.saldo_actual) }}</p>
                </div>
              </div>
              <!-- Interés de mora acumulado (solo si hay mora y tasa configurada) -->
              <div
                v-if="prestamoDetalle?.moraAcumulada > 0"
                class="mt-3 flex items-center justify-between gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2"
              >
                <span class="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Interés de mora acumulado
                </span>
                <span class="text-sm font-bold text-rose-700 whitespace-nowrap">${{ formatMoney(prestamoDetalle.moraAcumulada) }}</span>
              </div>
              <!-- Total a pagar (saldo + mora) -->
              <div
                v-if="prestamoDetalle?.moraAcumulada > 0"
                class="mt-2 flex items-center justify-between gap-2 rounded-lg bg-gray-900 px-3 py-2.5"
              >
                <span class="text-xs font-semibold text-white/80 uppercase tracking-wide">Total a pagar</span>
                <span class="text-base font-bold text-white whitespace-nowrap">${{ formatMoney((parseFloat(prestamoDetalle?.saldo_actual) || 0) + (prestamoDetalle.moraAcumulada || 0)) }}</span>
              </div>
            </div>

            <!-- Plan de Pagos -->
            <div
              v-if="planPagosPrestamo.length > 0"
              ref="modalDetallePlanPagosSectionRef"
              class="scroll-mt-4"
              tabindex="-1"
            >
              <!-- Si solo hay 1 cuota, mostrarla directamente -->
              <div v-if="planPagosPrestamo.length === 1" class="mb-4">
                <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Plan de Pago
                </h4>
                <!-- Vista Desktop: Tabla -->
                <div class="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead class="bg-gradient-to-r from-natillera-50 to-emerald-50">
                        <tr>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cuota</th>
                          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha Proyectada</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Cuota</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Pagado</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Capital</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Interés</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo Restante</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr 
                        v-for="cuota in planPagosPrestamo" 
                        :key="cuota.id"
                        :class="[
                          'hover:bg-gray-50 transition-colors',
                          cuota.pagada ? 'bg-green-50/30' : '',
                          esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada ? 'bg-amber-50/30' : ''
                        ]"
                      >
                        <td class="px-4 py-3 text-sm font-semibold text-gray-800">
                          #{{ cuota.numero_cuota }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-700">
                          {{ formatDate(cuota.fecha_proyectada) }}
                          <span 
                            v-if="esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada"
                            class="ml-2 text-xs text-amber-600 font-semibold"
                          >
                            ⚠️ Vencida
                          </span>
                        </td>
                        <td class="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                          ${{ formatMoney(cuota.valor_cuota) }}
                        </td>
                        <td class="px-4 py-3 text-sm font-semibold text-right" :class="parseFloat(cuota.valor_pagado || 0) > 0 ? 'text-green-700' : 'text-gray-500'">
                          ${{ formatMoney(cuota.valor_pagado || 0) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600 text-right">
                          ${{ formatMoney(cuota.capital) }}
                        </td>
                          <td class="px-4 py-3 text-sm text-gray-600 text-right">
                            ${{ formatMoney(cuota.interes) }}
                          </td>
                          <td class="px-4 py-3 text-sm font-semibold text-right" :class="(parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0)) > 0 ? 'text-gray-700' : 'text-green-600'">
                            ${{ formatMoney(Math.max(0, parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0))) }}
                          </td>
                          <td class="px-4 py-3 text-center">
                            <span 
                              :class="[
                                'px-2 py-1 rounded-full text-xs font-semibold',
                                cuota.pagada 
                                  ? 'bg-green-100 text-green-700' 
                                  : esFechaVencida(cuota.fecha_proyectada)
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-600'
                              ]"
                            >
                              {{ cuota.pagada ? 'Pagada' : esFechaVencida(cuota.fecha_proyectada) ? 'Vencida' : 'Pendiente' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <!-- Vista Móvil: Tarjeta -->
                <div class="md:hidden">
                  <div 
                    v-for="cuota in planPagosPrestamo" 
                    :key="cuota.id"
                    :class="[
                      'bg-white border-2 rounded-xl p-4 shadow-sm transition-all',
                      cuota.pagada 
                        ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-white' 
                        : esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada
                        ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white'
                        : 'border-gray-200 hover:border-natillera-300'
                    ]"
                  >
                    <!-- Header de la tarjeta -->
                    <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                      <div class="flex items-center gap-2">
                        <div 
                          :class="[
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                            cuota.pagada 
                              ? 'bg-green-500 text-white' 
                              : esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada
                              ? 'bg-amber-500 text-white'
                              : 'bg-natillera-500 text-white'
                          ]"
                        >
                          #{{ cuota.numero_cuota }}
                        </div>
                        <div>
                          <p class="font-semibold text-gray-800 text-sm">Cuota #{{ cuota.numero_cuota }}</p>
                          <p class="text-xs text-gray-500">{{ formatDate(cuota.fecha_proyectada) }}</p>
                        </div>
                      </div>
                      <span 
                        :class="[
                          'px-2.5 py-1 rounded-full text-xs font-semibold',
                          cuota.pagada 
                            ? 'bg-green-100 text-green-700' 
                            : esFechaVencida(cuota.fecha_proyectada)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        ]"
                      >
                        {{ cuota.pagada ? 'Pagada' : esFechaVencida(cuota.fecha_proyectada) ? 'Vencida' : 'Pendiente' }}
                      </span>
                    </div>
                    <!-- Información de la cuota -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-gray-500">Valor de la cuota:</span>
                        <span class="text-sm font-bold text-gray-800">${{ formatMoney(cuota.valor_cuota) }}</span>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span class="text-xs text-gray-500">Valor pagado:</span>
                        <span 
                          :class="[
                            'text-sm font-bold',
                            parseFloat(cuota.valor_pagado || 0) > 0 ? 'text-green-700' : 'text-gray-500'
                          ]"
                        >
                          ${{ formatMoney(cuota.valor_pagado || 0) }}
                        </span>
                      </div>
                      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Capital</p>
                          <p class="text-sm font-semibold text-gray-700">${{ formatMoney(cuota.capital) }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Interés</p>
                          <p class="text-sm font-semibold text-gray-700">${{ formatMoney(cuota.interes) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span class="text-xs font-semibold text-gray-600">Saldo restante:</span>
                        <span 
                          :class="[
                            'text-sm font-bold',
                            (parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0)) > 0 ? 'text-gray-800' : 'text-green-600'
                          ]"
                        >
                          ${{ formatMoney(Math.max(0, parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0))) }}
                        </span>
                      </div>
                      <div 
                        v-if="esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada"
                        class="mt-2 pt-2 border-t border-amber-200"
                      >
                        <p class="text-xs text-amber-600 font-semibold flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Esta cuota está vencida
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Si hay más de 1 cuota, mostrar sección desplegable -->
              <div v-else class="mb-4">
                <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Plan de Pagos
                  <span class="text-sm font-normal text-gray-500">({{ planPagosPrestamo.length }} cuotas)</span>
                </h4>
                
                <!-- Resumen cuando está colapsado -->
                <div v-if="!planPagosExpandido" class="mb-4 space-y-3">
                  <!-- Próxima fecha de pago -->
                  <div 
                    v-if="proximaCuotaPago"
                    class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-natillera-100 rounded-lg flex items-center justify-center">
                          <svg class="w-5 h-5 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Próxima fecha de pago</p>
                          <p class="text-sm font-semibold text-gray-800">
                            {{ formatDate(proximaCuotaPago.fecha_proyectada) }}
                            <span class="text-xs font-normal text-gray-500 ml-1">• Cuota #{{ proximaCuotaPago.numero_cuota }}</span>
                          </p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-xs text-gray-500 mb-0.5">Valor</p>
                        <p class="text-base font-bold text-natillera-700">
                          ${{ formatMoney(proximaCuotaPago.valor_cuota || 0) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Estadísticas -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                      <p class="text-xl font-bold text-green-700">
                        {{ planPagosPrestamo.filter(c => c.pagada).length }}
                      </p>
                      <p class="text-xs text-green-600 mt-0.5">Pagadas</p>
                    </div>
                    <div class="bg-amber-50 rounded-lg p-3 border border-amber-200 text-center">
                      <p class="text-xl font-bold text-amber-700">
                        {{ planPagosPrestamo.filter(c => esFechaVencida(c.fecha_proyectada) && !c.pagada).length }}
                      </p>
                      <p class="text-xs text-amber-600 mt-0.5">Vencidas</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                      <p class="text-xl font-bold text-gray-700">
                        {{ planPagosPrestamo.filter(c => !c.pagada && !esFechaVencida(c.fecha_proyectada)).length }}
                      </p>
                      <p class="text-xs text-gray-600 mt-0.5">Pendientes</p>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                      <p class="text-xl font-bold text-blue-700">
                        {{ pagosCicloActual.length }}
                      </p>
                      <p class="text-xs text-blue-600 mt-0.5">Abonos</p>
                    </div>
                  </div>
                  
                  <!-- Total y botón -->
                  <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <span class="text-sm font-semibold text-gray-700">Total proyectado:</span>
                    <span class="text-base font-bold text-gray-800">
                      ${{ formatMoney(planPagosPrestamo.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)) }}
                    </span>
                  </div>
                  
                  <!-- Botón para expandir -->
                  <button
                    @click="planPagosExpandido = true"
                    class="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-natillera-600 hover:text-natillera-700 hover:bg-natillera-50 rounded-lg transition-colors"
                  >
                    <span>Ver todas las cuotas</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <!-- Botón para colapsar cuando está expandido -->
                <div v-else class="mb-4">
                  <button
                    @click="planPagosExpandido = false"
                    class="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>Ocultar cuotas</span>
                  </button>
                </div>
              
              <!-- Contenido desplegable -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[5000px]"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="opacity-100 max-h-[5000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="planPagosExpandido" class="overflow-hidden">
                  <!-- Vista Desktop: Tabla -->
                  <div class="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gradient-to-r from-natillera-50 to-emerald-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cuota</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha Proyectada</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Cuota</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Pagado</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Capital</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Interés</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo Restante</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr 
                        v-for="cuota in planPagosPrestamo" 
                        :key="cuota.id"
                        :class="[
                          'hover:bg-gray-50 transition-colors',
                          cuota.pagada ? 'bg-green-50/30' : '',
                          esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada ? 'bg-amber-50/30' : ''
                        ]"
                      >
                        <td class="px-4 py-3 text-sm font-semibold text-gray-800">
                          #{{ cuota.numero_cuota }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-700">
                          {{ formatDate(cuota.fecha_proyectada) }}
                          <span 
                            v-if="esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada"
                            class="ml-2 text-xs text-amber-600 font-semibold"
                          >
                            ⚠️ Vencida
                          </span>
                        </td>
                        <td class="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                          ${{ formatMoney(cuota.valor_cuota) }}
                        </td>
                        <td class="px-4 py-3 text-sm font-semibold text-right" :class="parseFloat(cuota.valor_pagado || 0) > 0 ? 'text-green-700' : 'text-gray-500'">
                          ${{ formatMoney(cuota.valor_pagado || 0) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600 text-right">
                          ${{ formatMoney(cuota.capital) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600 text-right">
                          ${{ formatMoney(cuota.interes) }}
                        </td>
                        <td class="px-4 py-3 text-sm font-semibold text-right" :class="(parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0)) > 0 ? 'text-gray-700' : 'text-green-600'">
                          ${{ formatMoney(Math.max(0, parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0))) }}
                        </td>
                        <td class="px-4 py-3 text-center">
                          <span 
                            :class="[
                              'px-2 py-1 rounded-full text-xs font-semibold',
                              cuota.pagada 
                                ? 'bg-green-100 text-green-700' 
                                : esFechaVencida(cuota.fecha_proyectada)
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                            ]"
                          >
                            {{ cuota.pagada ? 'Pagada' : esFechaVencida(cuota.fecha_proyectada) ? 'Vencida' : 'Pendiente' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

                  <!-- Vista Móvil: Tarjetas -->
                  <div class="md:hidden space-y-3">
                <div 
                  v-for="cuota in planPagosPrestamo" 
                  :key="cuota.id"
                  :class="[
                    'bg-white border-2 rounded-xl p-4 shadow-sm transition-all',
                    cuota.pagada 
                      ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-white' 
                      : esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada
                      ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white'
                      : 'border-gray-200 hover:border-natillera-300'
                  ]"
                >
                  <!-- Header de la tarjeta -->
                  <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <div class="flex items-center gap-2">
                      <div 
                        :class="[
                          'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                          cuota.pagada 
                            ? 'bg-green-500 text-white' 
                            : esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada
                            ? 'bg-amber-500 text-white'
                            : 'bg-natillera-500 text-white'
                        ]"
                      >
                        #{{ cuota.numero_cuota }}
                      </div>
                      <div>
                        <p class="font-semibold text-gray-800 text-sm">Cuota #{{ cuota.numero_cuota }}</p>
                        <p class="text-xs text-gray-500">{{ formatDate(cuota.fecha_proyectada) }}</p>
                      </div>
                    </div>
                    <span 
                      :class="[
                        'px-2.5 py-1 rounded-full text-xs font-semibold',
                        cuota.pagada 
                          ? 'bg-green-100 text-green-700' 
                          : esFechaVencida(cuota.fecha_proyectada)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      ]"
                    >
                      {{ cuota.pagada ? 'Pagada' : esFechaVencida(cuota.fecha_proyectada) ? 'Vencida' : 'Pendiente' }}
                    </span>
                  </div>

                  <!-- Información de la cuota -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">Valor de la cuota:</span>
                      <span class="text-sm font-bold text-gray-800">${{ formatMoney(cuota.valor_cuota) }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span class="text-xs text-gray-500">Valor pagado:</span>
                      <span 
                        :class="[
                          'text-sm font-bold',
                          parseFloat(cuota.valor_pagado || 0) > 0 ? 'text-green-700' : 'text-gray-500'
                        ]"
                      >
                        ${{ formatMoney(cuota.valor_pagado || 0) }}
                      </span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <p class="text-xs text-gray-500 mb-0.5">Capital</p>
                        <p class="text-sm font-semibold text-gray-700">${{ formatMoney(cuota.capital) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-0.5">Interés</p>
                        <p class="text-sm font-semibold text-gray-700">${{ formatMoney(cuota.interes) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span class="text-xs font-semibold text-gray-600">Saldo restante:</span>
                      <span 
                        :class="[
                          'text-sm font-bold',
                          (parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0)) > 0 ? 'text-gray-800' : 'text-green-600'
                        ]"
                      >
                        ${{ formatMoney(Math.max(0, parseFloat(cuota.valor_cuota) - parseFloat(cuota.valor_pagado || 0))) }}
                      </span>
                    </div>
                    <div 
                      v-if="esFechaVencida(cuota.fecha_proyectada) && !cuota.pagada"
                      class="mt-2 pt-2 border-t border-amber-200"
                    >
                      <p class="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Esta cuota está vencida
                      </p>
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </Transition>
              </div>
            </div>

            <!-- Historial de Refinanciaciones -->
            <div
              v-if="historialRefinanciaciones.length > 0"
              ref="modalDetalleRefinanciacionSectionRef"
              class="scroll-mt-4"
              tabindex="-1"
            >
              <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ArrowPathIcon class="w-5 h-5 text-purple-600" />
                Historial de Refinanciaciones
                <span class="text-sm font-normal text-gray-500">({{ historialRefinanciaciones.length }})</span>
              </h4>
              <div class="space-y-4">
                <div 
                  v-for="(historial, index) in historialRefinanciaciones" 
                  :key="historial.id"
                  class="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                >
                  <!-- Línea de tiempo -->
                  <div v-if="index < historialRefinanciaciones.length - 1" class="absolute left-8 top-16 bottom-0 w-0.5 bg-purple-300"></div>
                  
                  <!-- Icono y fecha -->
                  <div class="flex items-start gap-4 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <ArrowPathIcon class="w-6 h-6 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-800 text-sm mb-1">Refinanciación #{{ historialRefinanciaciones.length - index }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(historial.fecha_refinanciacion) }}</p>
                    </div>
                  </div>

                  <!-- Valores del préstamo antes de refinanciar -->
                  <div>
                    <!-- Valores Anteriores -->
                    <div class="bg-white/70 rounded-lg p-4 border border-purple-200">
                      <p class="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Valores Anteriores
                      </p>
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Monto:</span>
                          <span class="text-sm font-bold text-gray-700">${{ formatMoney(historial.monto_anterior) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Interés generado:</span>
                          <span class="text-sm font-bold text-orange-600">${{ formatMoney(historial.interes_generado_anterior || 0) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Interés:</span>
                          <span class="text-sm font-bold text-gray-700">{{ historial.interes_anterior }}%</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Cuotas:</span>
                          <span class="text-sm font-bold text-gray-700">{{ historial.numero_cuotas_anterior || 'N/A' }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Tipo interés:</span>
                          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">
                            {{ historial.tipo_interes_anterior || 'N/A' }}
                          </span>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span class="text-xs text-gray-500">Total a pagar:</span>
                          <span class="text-sm font-bold text-gray-700">${{ formatMoney((historial.monto_anterior || 0) + (historial.interes_generado_anterior || 0)) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Total pagado:</span>
                          <span class="text-sm font-bold text-green-600">${{ formatMoney(historial.total_pagado_anterior || 0) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Saldo pendiente:</span>
                          <span class="text-sm font-bold text-red-600">${{ formatMoney(historial.saldo_actual_anterior) }}</span>
                        </div>
                      </div>

                      <!-- Desplegable: plan de pagos anterior -->
                      <div
                        v-if="Array.isArray(historial.plan_pagos_anterior) && historial.plan_pagos_anterior.length > 0"
                        class="mt-3 pt-3 border-t border-gray-200"
                      >
                        <button
                          type="button"
                          @click="toggleHistorialPlan(historial.id)"
                          class="w-full flex items-center justify-between gap-2 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors touch-manipulation"
                          :aria-expanded="historialPlanExpandido.has(historial.id)"
                        >
                          <span class="flex items-center gap-1.5">
                            <BanknotesIcon class="w-3.5 h-3.5" />
                            Plan de pagos anterior ({{ historial.plan_pagos_anterior.length }})
                          </span>
                          <ChevronDownIcon
                            class="w-3.5 h-3.5 transition-transform"
                            :class="historialPlanExpandido.has(historial.id) ? 'rotate-180' : ''"
                          />
                        </button>
                        <div v-if="historialPlanExpandido.has(historial.id)" class="mt-2 space-y-1.5">
                          <div
                            v-for="(cuota, cidx) in historial.plan_pagos_anterior"
                            :key="`plan-ant-${historial.id}-${cidx}`"
                            class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200"
                          >
                            <div class="min-w-0">
                              <p class="text-[11px] font-semibold text-gray-700">Cuota {{ cuota.numero_cuota }}</p>
                              <p v-if="cuota.fecha_proyectada" class="text-[10px] text-gray-400">Fecha de cuota: {{ formatDate(cuota.fecha_proyectada) }}</p>
                            </div>
                            <div class="text-right flex-shrink-0">
                              <p class="text-[11px] font-bold text-gray-700">${{ formatMoney(cuota.valor_cuota) }}</p>
                              <span
                                class="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                :class="cuota.pagada ? 'bg-green-100 text-green-700' : ((cuota.valor_pagado || 0) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')"
                              >
                                {{ cuota.pagada ? 'Pagada' : ((cuota.valor_pagado || 0) > 0 ? 'Parcial' : 'Pendiente') }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Desplegable: abonos de este ciclo -->
                      <div
                        v-if="abonosDeRefinanciacion(historial.id).length > 0"
                        class="mt-3 pt-3 border-t border-gray-200"
                      >
                        <button
                          type="button"
                          @click="toggleHistorialAbonos(historial.id)"
                          class="w-full flex items-center justify-between gap-2 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors touch-manipulation"
                          :aria-expanded="historialAbonosExpandido.has(historial.id)"
                        >
                          <span class="flex items-center gap-1.5">
                            <BanknotesIcon class="w-3.5 h-3.5" />
                            Abonos realizados ({{ abonosDeRefinanciacion(historial.id).length }})
                          </span>
                          <ChevronDownIcon
                            class="w-3.5 h-3.5 transition-transform"
                            :class="historialAbonosExpandido.has(historial.id) ? 'rotate-180' : ''"
                          />
                        </button>
                        <div v-if="historialAbonosExpandido.has(historial.id)" class="mt-2 space-y-1.5">
                          <div
                            v-for="pago in abonosDeRefinanciacion(historial.id)"
                            :key="pago.id"
                            class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200"
                          >
                            <div class="min-w-0">
                              <p class="text-[11px] font-bold text-gray-700">${{ formatMoney(pago.valor) }}</p>
                              <p class="text-[10px] text-gray-400">Fecha de pago: {{ formatDate(pago.fecha) }}</p>
                            </div>
                            <span
                              v-if="formaPagoAbono(pago)"
                              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border flex-shrink-0"
                              :class="FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].clase"
                            >
                              <span aria-hidden="true">{{ FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].icon }}</span>
                              {{ FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].label }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Información adicional -->
                  <div v-if="historial.periodicidad_anterior || historial.periodicidad_nueva" class="mt-4 pt-4 border-t border-purple-200">
                    <div class="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span class="text-gray-500">Periodicidad anterior:</span>
                        <span class="ml-2 font-semibold text-gray-700 capitalize">{{ historial.periodicidad_anterior || 'N/A' }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Periodicidad nueva:</span>
                        <span class="ml-2 font-semibold text-green-700 capitalize">{{ historial.periodicidad_nueva || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Fecha de inicio -->
                  <div v-if="historial.fecha_inicio_anterior || historial.fecha_inicio_nueva" class="mt-3 pt-3 border-t border-purple-200">
                    <div class="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span class="text-gray-500">Fecha inicio anterior:</span>
                        <span class="ml-2 font-semibold text-gray-700">{{ historial.fecha_inicio_anterior ? formatDate(historial.fecha_inicio_anterior) : 'N/A' }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">Fecha inicio nueva:</span>
                        <span class="ml-2 font-semibold text-green-700">{{ formatDate(historial.fecha_inicio_nueva) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de pagos -->
            <div>
              <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-natillera-600" />
                Historial de Abonos
              </h4>
              <div v-if="pagosCicloActual.length === 0" class="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <BanknotesIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 text-sm">No hay abonos registrados</p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="pago in pagosCicloActual"
                  :key="pago.id"
                  class="group flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-natillera-300 transition-all"
                >
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <p class="font-semibold text-gray-800">${{ formatMoney(pago.valor) }}</p>
                        <span class="sm:hidden px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-semibold flex-shrink-0">
                          Abonado
                        </span>
                      </div>
                      <p class="text-xs text-gray-500">{{ formatDate(pago.fecha) }}</p>
                      <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <template v-if="Array.isArray(pago.numeros_cuota) && pago.numeros_cuota.length > 0">
                          <span
                            v-for="(periodo, idx) in periodosDeNumerosCuota(pago.numeros_cuota)"
                            :key="`${pago.id}-periodo-${idx}`"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-natillera-50 text-natillera-700 border border-natillera-200/70 text-[11px] font-semibold"
                            :title="`Cuota correspondiente al período ${periodo}`"
                          >
                            <BanknotesIcon class="w-3 h-3" />
                            {{ periodo }}
                          </span>
                        </template>
                        <span
                          v-if="formaPagoAbono(pago)"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                          :class="FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].clase"
                          :title="formaPagoAbono(pago) === 'mixto'
                            ? `Pago mixto · Efectivo: $${formatMoney(pago.valor_efectivo)} · Transferencia: $${formatMoney(pago.valor_transferencia)}`
                            : `Pagado en ${FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].label.toLowerCase()}`"
                        >
                          <span aria-hidden="true">{{ FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].icon }}</span>
                          {{ FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].label }}
                        </span>
                        <span
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                          :class="pago.origen === 'cuota_natillera'
                            ? 'bg-blue-50 text-blue-700 border-blue-200/70'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'"
                          :title="pago.origen === 'cuota_natillera'
                            ? 'Registrado al pagar la cuota de la natillera'
                            : 'Registrado desde la vista de Préstamos'"
                        >
                          {{ pago.origen === 'cuota_natillera' ? 'Desde Cuotas' : 'Desde Préstamos' }}
                        </span>
                      </div>
                      <p v-if="pago.codigo_comprobante" class="text-xs text-gray-400 font-mono mt-1">
                        Código: {{ pago.codigo_comprobante }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-shrink-0 justify-end pl-13 sm:pl-0 -mt-1 sm:mt-0">
                    <span class="hidden sm:inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Abonado
                    </span>
                    <button
                      v-if="pago.codigo_comprobante"
                      @click.stop="reenviarComprobanteAbono(pago)"
                      class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 inline-flex items-center justify-center text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors touch-manipulation"
                      title="Reenviar comprobante"
                    >
                      <ArrowPathIcon class="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      @click.stop="abrirModalEditarAbono(pago)"
                      class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 inline-flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all touch-manipulation"
                      title="Editar abono"
                    >
                      <PencilIcon class="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      @click.stop="confirmarEliminarAbono(pago)"
                      class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 inline-flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all touch-manipulation"
                      title="Eliminar abono"
                    >
                      <TrashIcon class="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <div class="flex flex-col-reverse gap-2 sm:flex-row sm:gap-2">
                <button
                  type="button"
                  @click="requestCloseTopModal"
                  class="btn-modal-secondary w-full sm:flex-1"
                >
                  Cerrar
                </button>
                <button
                  v-if="prestamoDetalle?.estado === 'activo'"
                  type="button"
                  @click="abrirModalAbono(prestamoDetalle)"
                  class="btn-modal-primary w-full sm:flex-1"
                >
                  Registrar abono
                </button>
              </div>
            </div>
          </div>
        </div>

          <div
            v-show="hayMasContenidoAbajoModalDetalle"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
            >
              <div
                class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
              >
                <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                  Desliza para ver más
                </p>
                <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
              </div>
            </div>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal información del préstamo / WhatsApp — patrón ModalWrapper (skill modales) -->
    <ModalWrapper
      :show="!!modalCompartirPrestamo"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4rem] items-start justify-between gap-2 pb-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-5 w-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Información del préstamo</h3>
                <p class="mt-0.5 text-[0.6875rem] text-white/80">Descargar o compartir por WhatsApp</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="flex h-[3.2rem] w-[3.2rem] flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Información del préstamo</h3>
              <p class="text-white/90 text-xs mt-1">Descargar o compartir por WhatsApp</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref="modalCompartirPrestamoScrollRef"
            class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] space-y-4 px-4 pb-0 pt-4 sm:px-6 sm:pt-5"
            @scroll.passive="onScrollModalCompartirPrestamo"
          >
            <!-- Wrapper de captura: el padding da aire para que toPng no recorte los bordes -->
            <div
              ref="prestamoRef"
              style="max-width: 404px; margin: 0 auto; padding: 14px; background: #eef1f4; border-radius: 28px;"
            >
            <div
              style="width: 100%; position: relative; background: #ffffff; border-radius: 22px; overflow: hidden; font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 22px 44px -20px rgba(15,23,42,0.35); border: 1px solid rgba(15,23,42,0.08);"
            >
              <!-- Cabecera marca verde + hero del monto (compacta) -->
              <div style="background: #1B5E37; padding: 16px 20px 18px; color: #ffffff;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 9px; min-width: 0;">
                    <div style="width: 30px; height: 30px; border-radius: 9px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <p style="margin: 0; font-size: 12.5px; font-weight: 800; letter-spacing: -0.1px; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Comprobante de préstamo</p>
                  </div>
                  <span style="flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 9999px; padding: 3px 10px;">
                    <span style="width: 5px; height: 5px; border-radius: 50%; background: #6ee7b7; display: inline-block;"></span>
                    <span style="font-size: 9px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: #d1fae5;">{{ prestamoDetalle?.estado }}</span>
                  </span>
                </div>

                <div style="text-align: center; margin-top: 12px;">
                  <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: rgba(255,255,255,0.7);">Monto del préstamo</p>
                  <p style="margin: 5px 0 0; font-size: 30px; font-weight: 800; letter-spacing: -1.2px; line-height: 1;">${{ formatMoney(prestamoDetalle?.monto) }}</p>
                </div>
              </div>

              <!-- Perforación -->
              <div style="position: relative; background: #ffffff; height: 22px;">
                <div style="position: absolute; left: 18px; right: 18px; top: 50%; border-top: 2px dashed #dfe3e8;"></div>
                <span style="position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
                <span style="position: absolute; right: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
              </div>

              <!-- Cuerpo -->
              <div style="background: #ffffff; padding: 6px 20px 20px;">
                <!-- Socio (jerarquía alta) -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 8px 0 12px; border-bottom: 1px solid #eef2ee;">
                  <div style="min-width: 0;">
                    <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #9aa3af;">Socio</p>
                    <p style="margin: 3px 0 0; font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.4px; line-height: 1.15;">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
                  </div>
                  <span v-if="resumenMoraComprobanteExistente.texto" style="flex-shrink: 0; margin-top: 2px;" :style="estiloAvisoMoraComprobanteExistente">{{ resumenMoraComprobanteExistente.texto }}</span>
                </div>

                <!-- Total a pagar (valor prestado + interés = suma de cuotas) -->
                <div style="margin-top: 14px; background: #f0f7f2; border: 1px solid #d5e9db; border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <div style="min-width: 0;">
                    <p style="margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase; color: #1B5E37;">Total a pagar</p>
                    <p style="margin: 2px 0 0; font-size: 10px; font-weight: 600; color: #7a8a7e;">Valor prestado + interés</p>
                  </div>
                  <p style="margin: 0; font-size: 22px; font-weight: 800; color: #1B5E37; letter-spacing: -0.5px; line-height: 1; white-space: nowrap;">${{ formatMoney(calcularSaldoInicialTotal(prestamoDetalle)) }}</p>
                </div>

                <!-- Pagado / Saldo (destacados, fáciles de identificar) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                  <div style="background: #edf7ef; border: 1px solid #cfe9d6; border-radius: 14px; padding: 13px 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 18px; height: 18px; border-radius: 6px; background: #1B5E37; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase; color: #1B5E37;">Pagado a la fecha</p>
                    </div>
                    <p style="margin: 8px 0 0; font-size: 23px; font-weight: 800; color: #1B5E37; letter-spacing: -0.6px; line-height: 1;">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</p>
                  </div>
                  <div
                    :style="{
                      borderRadius: '14px', padding: '13px 12px',
                      background: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#fef2f2' : '#edf7ef',
                      border: (prestamoDetalle?.saldo_actual || 0) > 0 ? '1px solid #fbcfcf' : '1px solid #cfe9d6'
                    }"
                  >
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span
                        :style="{
                          width: '18px', height: '18px', borderRadius: '6px', flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#dc2626' : '#1B5E37'
                        }"
                      >
                        <svg v-if="(prestamoDetalle?.saldo_actual || 0) > 0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase;" :style="{ color: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#b91c1c' : '#1B5E37' }">Saldo pendiente</p>
                    </div>
                    <p style="margin: 8px 0 0; font-size: 23px; font-weight: 800; letter-spacing: -0.6px; line-height: 1;" :style="{ color: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#dc2626' : '#1B5E37' }">${{ formatMoney(prestamoDetalle?.saldo_actual) }}</p>
                  </div>
                </div>

                <!-- Detalles (más legible) -->
                <p style="margin: 18px 0 0; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #1B5E37;">Detalles del préstamo</p>
                <div style="margin-top: 10px; background: #f8faf8; border: 1px solid #eaf0ea; border-radius: 14px; padding: 6px 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Interés mensual</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1f2937; letter-spacing: -0.2px;">{{ prestamoDetalle?.interes }}%</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">N° de cuotas</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1f2937; letter-spacing: -0.2px;">{{ prestamoDetalle?.numero_cuotas || 1 }}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Valor cuota</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1B5E37; letter-spacing: -0.2px;">${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Interés generado</span>
                    <span style="font-size: 15px; font-weight: 800; color: #b45309; letter-spacing: -0.2px;">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Fecha de creación</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1f2937; letter-spacing: -0.2px;">{{ formatDate(prestamoDetalle?.created_at) }}</span>
                  </div>
                  <div v-if="prestamoDetalle?.moraAcumulada > 0" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #b91c1c;">Interés de mora</span>
                    <span style="font-size: 15px; font-weight: 800; color: #dc2626; letter-spacing: -0.2px;">${{ formatMoney(prestamoDetalle.moraAcumulada) }}</span>
                  </div>
                </div>

                <!-- Refinanciamiento -->
                <div v-if="historialRefinanciaciones.length > 0" style="margin-top: 18px; padding-top: 16px; border-top: 2px dashed #e6efe6;">
                  <p style="margin: 0 0 10px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #6d28d9;">
                    {{ historialRefinanciaciones.length > 1 ? 'Refinanciamientos' : 'Refinanciamiento' }}
                  </p>
                  <div
                    v-for="(refin, idx) in historialRefinanciaciones"
                    :key="refin.id"
                    :style="{ marginTop: idx === 0 ? '0' : '10px', background: '#f6f3fc', border: '1px solid #e5ddf7', borderRadius: '14px', padding: '10px 14px' }"
                  >
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                      <span style="font-size: 10px; font-weight: 800; color: #6d28d9; letter-spacing: 0.3px;">Refinanciación #{{ historialRefinanciaciones.length - idx }}</span>
                      <span style="font-size: 10px; font-weight: 600; color: #8b8194;">{{ formatDate(refin.fecha_refinanciacion) }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid #ece6f7;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Valor inicial</span>
                      <span style="font-size: 13px; font-weight: 800; color: #1f2937;">${{ formatMoney((refin.monto_anterior || 0) + (refin.interes_generado_anterior || 0)) }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid #ece6f7;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Valor pagado</span>
                      <span style="font-size: 13px; font-weight: 800; color: #1B5E37;">${{ formatMoney(refin.total_pagado_anterior || 0) }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Monto refinanciado</span>
                      <span style="font-size: 13px; font-weight: 800; color: #6d28d9;">${{ formatMoney(refin.saldo_actual_anterior) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Plan de pagos -->
                <div v-if="planPagosComprobanteExistente.length > 0" style="margin-top: 18px; padding-top: 16px; border-top: 2px dashed #e6efe6;">
                  <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9aa3af;">Plan de pagos</p>
                  <p style="margin: 4px 0 10px; font-size: 10px; color: #9aa3af;">
                    Primera cuota: {{ planPagosComprobanteExistente[0]?.fecha_proyectada ? formatDate(planPagosComprobanteExistente[0].fecha_proyectada) : '—' }}
                  </p>
                  <div style="overflow-x: auto;">
                    <table style="width: 100%; min-width: 260px; border-collapse: collapse; font-size: 10px;">
                      <thead>
                        <tr style="border-bottom: 1.5px solid #e2eee4;">
                          <th style="text-align: left; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Nº</th>
                          <th style="text-align: left; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Vencimiento</th>
                          <th style="text-align: right; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Cuota</th>
                          <th style="text-align: right; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Abonado</th>
                          <th style="text-align: center; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(cuota, idx) in planPagosComprobanteExistente"
                          :key="cuota.id ?? idx"
                          :style="{ background: idx % 2 === 0 ? '#ffffff' : '#f7faf7' }"
                        >
                          <td style="padding: 5px 4px; color: #6b7280; font-weight: 700;">{{ cuota.numero_cuota }}</td>
                          <td style="padding: 5px 4px; color: #374151;">{{ formatDate(cuota.fecha_proyectada) }}</td>
                          <td style="padding: 5px 4px; text-align: right; font-weight: 700; color: #1f2937; vertical-align: top;">
                            <span>${{ formatMoney(cuota.valor_cuota) }}</span>
                            <span v-if="moraCuotaComprobante(cuota) > 0" style="display: block; font-size: 8.5px; font-weight: 700; color: #dc2626;">+${{ formatMoney(moraCuotaComprobante(cuota)) }} mora</span>
                          </td>
                          <td
                            style="padding: 5px 4px; text-align: right; font-weight: 700; vertical-align: top;"
                            :style="{ color: parseFloat(cuota.valor_pagado || 0) > 0 ? '#1B5E37' : '#9ca3af' }"
                          >
                            ${{ formatMoney(cuota.valor_pagado || 0) }}
                          </td>
                          <td style="padding: 5px 4px; text-align: center; vertical-align: top;">
                            <span :style="estiloBadgeEstadoCuotaComprobante(cuota)">{{ etiquetaEstadoCuotaComprobante(cuota) }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Total a pagar con mora (si hay mora acumulada) -->
                  <div v-if="prestamoDetalle?.moraAcumulada > 0" style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fef2f2; border: 1px solid #fbcfcf; border-radius: 10px; padding: 9px 12px;">
                    <div>
                      <p style="margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: #b91c1c;">Total a pagar con mora</p>
                      <p style="margin: 2px 0 0; font-size: 9px; font-weight: 600; color: #9aa3af;">Saldo ${{ formatMoney(prestamoDetalle?.saldo_actual) }} + mora ${{ formatMoney(prestamoDetalle.moraAcumulada) }}</p>
                    </div>
                    <p style="margin: 0; font-size: 16px; font-weight: 800; color: #dc2626; letter-spacing: -0.4px; white-space: nowrap;">${{ formatMoney((parseFloat(prestamoDetalle?.saldo_actual) || 0) + (prestamoDetalle.moraAcumulada || 0)) }}</p>
                  </div>
                </div>

                <p style="margin: 16px 0 0; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.2px; color: #adb5bd;">Generado con Natillerapp</p>
              </div>
            </div>
            </div>

            <div class="space-y-3 border-t border-gray-200 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
              <!-- Descargar: primario marca (excepción posible: azul solo si se prioriza semántica «archivo») -->
              <button
                type="button"
                @click="descargarPrestamo"
                :disabled="generandoImagenPrestamo"
                class="btn-modal-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon class="w-5 h-5" />
                {{ generandoImagenPrestamo ? 'Generando…' : 'Descargar imagen' }}
              </button>
              <button
                type="button"
                @click="compartirPrestamoWhatsApp"
                :disabled="generandoImagenPrestamo || !prestamoDetalle?.socio_natillera?.socio?.telefono"
                :class="[
                  'btn-modal-primary w-full',
                  (generandoImagenPrestamo || !prestamoDetalle?.socio_natillera?.socio?.telefono) ? 'opacity-50 cursor-not-allowed' : ''
                ]"
                :title="!prestamoDetalle?.socio_natillera?.socio?.telefono ? 'No hay teléfono registrado para este socio' : ''"
              >
                <ChatBubbleLeftIcon class="w-5 h-5" />
                <span v-if="generandoImagenPrestamo">Preparando…</span>
                <span v-else-if="!prestamoDetalle?.socio_natillera?.socio?.telefono">Sin teléfono registrado</span>
                <span v-else>Compartir por WhatsApp</span>
              </button>
              <p class="text-center text-xs text-gray-500">
                En celular puedes enviar la imagen directamente desde el menú compartir.
              </p>
              <button
                type="button"
                @click="requestCloseTopModal"
                class="btn-modal-secondary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>

          <div
            v-show="hayNatiscrollModalCompartirPrestamo"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
            >
              <div
                class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
              >
                <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                  Desliza para ver más
                </p>
                <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
              </div>
            </div>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Compartir Préstamo Nuevo por WhatsApp — mismo patrón que crear préstamo -->
    <ModalWrapper
      :show="!!modalCompartirPrestamoNuevo"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4rem] items-start justify-between gap-2 pb-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-5 w-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">{{ esComprobanteRealCompartir ? 'Compartir comprobante' : 'Compartir proyección' }}</h3>
                <p class="mt-0.5 text-[0.6875rem] text-white/80">Vista previa para WhatsApp</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="flex h-[3.2rem] w-[3.2rem] flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">{{ esComprobanteRealCompartir ? 'Compartir comprobante' : 'Compartir proyección' }}</h3>
              <p class="text-white/90 text-xs mt-1">Vista previa para WhatsApp</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalCompartirPrestamoNuevoScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] space-y-4 px-4 pb-0 pt-4 sm:px-6 sm:pt-5"
          @scroll.passive="onScrollModalCompartirPrestamoNuevo"
        >
          <div
            ref="prestamoNuevoRef"
            class="comprobante-prestamo-nuevo bg-white rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); min-width: 280px;"
          >
            <div class="comprobante-content" style="background: #ecfdf5; padding: 14px 12px; color: #1f2937;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; padding-bottom: 4px;">
                <div style="width: 44px; height: 44px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div style="text-align: center;">
                  <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #374151; letter-spacing: -0.5px; line-height: 1.2;">{{ ticketCompartir.titulo }}</h1>
                </div>
              </div>

              <div style="background: white; padding: 14px 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                <p style="color: #6b7280; font-size: 10px; margin: 0 0 4px 0; font-weight: 600; letter-spacing: 0.02em; text-align: center;">Monto del préstamo</p>
                <p style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.5px; color: #059669; text-align: center;">${{ formatMoney(ticketCompartir.monto) }}</p>
                <p style="color: #9ca3af; font-size: 10px; margin: 0 0 3px 0; font-weight: 600;">Socio</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; color: #1f2937;">{{ ticketCompartir.nombreSocio }}</p>
              </div>

              <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 10px 0;">{{ ticketCompartir.subtituloDetalles }}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px;">
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERÉS MENSUAL</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ ticketCompartir.interes }}%</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">N° DE CUOTAS</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ ticketCompartir.numero_cuotas }}</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">VALOR CUOTA</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(ticketCompartir.cuota) }}</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">TOTAL A PAGAR</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(ticketCompartir.totalAPagar) }}</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERESES GENERADOS</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #ea580c;">${{ formatMoney(ticketCompartir.interesTotal) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="ticketCompartir.plan.length > 0" style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 8px 0;">{{ ticketCompartir.tituloPlan }}</p>
                <p style="color: #6b7280; font-size: 9px; margin: 0 0 6px 0;">{{ ticketCompartir.etiquetaFechaPlan }}: {{ ticketCompartir.fechaPrimera ? formatDate(ticketCompartir.fechaPrimera) : '—' }}</p>
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                    <thead>
                      <tr style="background: #f0fdf4; border-bottom: 2px solid #a7f3d0;">
                        <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Nº</th>
                        <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Fecha vencimiento</th>
                        <th style="text-align: right; padding: 6px 8px; font-weight: 700; color: #065f46;">Valor cuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(cuota, idx) in ticketCompartir.plan" :key="idx" :style="{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }">
                        <td style="padding: 5px 8px; color: #374151; font-weight: 600;">{{ cuota.numero_cuota }}</td>
                        <td style="padding: 5px 8px; color: #374151;">{{ formatDate(cuota.fecha_proyectada) }}</td>
                        <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #059669;">${{ formatMoney(cuota.valor_cuota) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-1">
            <button
              type="button"
              @click="descargarPrestamoNuevo"
              :disabled="generandoImagenPrestamoNuevo"
              class="btn-modal-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ generandoImagenPrestamoNuevo ? 'Generando...' : 'Descargar imagen' }}
            </button>
            <button
              type="button"
              @click="compartirPrestamoNuevoWhatsApp"
              :disabled="generandoImagenPrestamoNuevo || !socioSeleccionado?.socio?.telefono"
              :class="[
                'btn-modal-primary w-full',
                (generandoImagenPrestamoNuevo || !socioSeleccionado?.socio?.telefono) ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :title="!socioSeleccionado?.socio?.telefono ? 'El socio no tiene teléfono registrado' : ''"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
              <span v-if="generandoImagenPrestamoNuevo">Preparando...</span>
              <span v-else-if="!socioSeleccionado?.socio?.telefono">Sin teléfono registrado</span>
              <span v-else>Compartir por WhatsApp</span>
            </button>
            <button
              type="button"
              @click="requestCloseTopModal"
              class="btn-modal-secondary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>

          <!-- Natiscroll: velo + «Desliza para ver más» (mismo patrón que crear préstamo) -->
          <div
            v-show="hayNatiscrollModalProyeccion"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
            >
              <div
                class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
              >
                <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                  Desliza para ver más
                </p>
                <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>

    <!-- Modal de confirmación para eliminar abono -->
    <ModalWrapper
      :show="!!abonoAEliminar"
      :z-index="70"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Eliminar Abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Actualizará el saldo del préstamo</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Eliminar Abono</h3>
              <p class="text-white/90 text-xs mt-1">Esta acción actualizará el saldo del préstamo</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Cuerpo scrolleable (confirm corto: sin natiscroll manual; footer fijo asegura la CTA visible) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-4 pb-4">
          <p class="text-gray-700 mb-3">
            ¿Estás seguro de que deseas eliminar el abono de <strong class="text-gray-900">${{ formatMoney(abonoAEliminar?.valor) }}</strong>?
          </p>
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-amber-600 text-lg">⚠️</span>
              </div>
              <div class="flex-1">
                <p class="font-bold text-amber-800 mb-2 text-sm">Al eliminar este abono:</p>
                <ul class="space-y-2 text-sm text-amber-700">
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>Se sumará ${{ formatMoney(abonoAEliminar?.valor) }} al saldo del préstamo</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>El estado del préstamo puede cambiar si el saldo aumenta</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>Esta acción no se puede deshacer</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer de acciones fijo (destructivo → botón ámbar, excepción de color permitida) -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex gap-3">
          <button type="button" class="btn-modal-secondary flex-1" @click="requestCloseTopModal">Cancelar</button>
          <button
            type="button"
            @click="eliminarAbonoConfirmado"
            :disabled="loading"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-4 font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon v-if="!loading" class="w-5 h-5" />
            <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal de confirmación para eliminar préstamo -->
    <ModalWrapper
      :show="!!prestamoAEliminar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Eliminar Préstamo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Eliminar Préstamo</h3>
              <p class="text-white/90 text-xs mt-1">Esta acción no se puede deshacer</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Cuerpo scrolleable (confirm corto: sin natiscroll manual; footer fijo asegura la CTA visible) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-4 pb-4">
          <p class="text-gray-700 mb-3">
            ¿Estás seguro de que deseas eliminar el préstamo de <strong class="text-gray-900">{{ prestamoAEliminar?.socio_natillera?.socio?.nombre || 'este socio' }}</strong>?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-red-600 text-lg">⚠️</span>
              </div>
              <div class="flex-1">
                <p class="font-bold text-red-800 mb-2 text-sm">Se perderá permanentemente:</p>
                <ul class="space-y-2 text-sm text-red-700">
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>El registro completo del préstamo</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>Todos los abonos y pagos registrados</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>Todo el historial de transacciones</span>
                  </li>
                </ul>
                <p class="mt-3 text-xs text-red-600 font-semibold bg-white/60 rounded-lg p-2">
                  💡 Esta acción es irreversible. Asegúrate de que realmente deseas eliminar este préstamo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer de acciones fijo (destructivo → botón rojo, excepción de color permitida) -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex gap-3">
          <button type="button" class="btn-modal-secondary flex-1" @click="requestCloseTopModal">Cancelar</button>
          <button
            type="button"
            @click="eliminarPrestamoConfirmado"
            :disabled="loading"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-4 font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon v-if="!loading" class="w-5 h-5" />
            <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
          </button>
        </div>
    </ModalWrapper>

    <!-- Ventana de carga al generar préstamo (compatible Safari/iPhone) -->
    <Teleport to="body">
      <Transition name="generando-prestamo">
        <div
          v-if="generandoPrestamo"
          class="generando-prestamo-overlay"
          role="status"
          aria-live="polite"
          aria-label="Generando préstamo"
        >
          <div class="generando-prestamo-card">
            <div class="generando-prestamo-icon-wrap">
              <BanknotesIcon class="generando-prestamo-icon" aria-hidden="true" />
            </div>
            <p class="generando-prestamo-title">Generando préstamo</p>
            <p class="generando-prestamo-subtitle">Estamos creando el plan de pagos y registrando el préstamo.</p>
            <div class="generando-prestamo-spinner" aria-hidden="true"></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
import { natilleraPrestamosDeshabilitados, parseReglasInteresPrestamo } from '../../utils/natilleraPrestamos'
import { useNatillerasStore } from '../../stores/natilleras'
import { useAuthStore } from '../../stores/auth'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
import { 
  ArrowLeftIcon,
  PlusIcon,
  BanknotesIcon,
  UserIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronRightIcon,
  LockClosedIcon,
  ArrowsRightLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline'
import { getAvatarUrl } from '../../utils/avatars'
import { getCurrentDateISO, formatDateToLocalISO, parseDateLocal, formatDate } from '../../utils/formatDate'
import DateInput from '../../components/DateInput.vue'

import BackButton from '../../components/BackButton.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useSessionDraftPersistence } from '../../composables/useSessionDraftPersistence'
import { useModalStack, __modalStackSync } from '../../composables/useModalStack'
import ModalWrapper from '../../components/ModalWrapper.vue'
import PrestamosSkeleton from '../../components/PrestamosSkeleton.vue'
import { toPng } from 'html-to-image'

/** Devuelve mes (1-12), anio y quincena (1 o 2) desde fecha_proyectada para plan_pagos_prestamo */
function periodoDesdeFechaProyectada(fechaProyectada) {
  if (!fechaProyectada) return { mes: null, anio: null, quincena: null }
  const d = new Date(fechaProyectada)
  if (isNaN(d.getTime())) return { mes: null, anio: null, quincena: null }
  const dia = d.getDate()
  return {
    mes: d.getMonth() + 1,
    anio: d.getFullYear(),
    quincena: dia <= 15 ? 1 : 2
  }
}

/**
 * Calcula la fecha proyectada para una cuota mensual respetando el día de pago.
 * Si el mes no tiene ese día (ej. 31 en febrero o en abril), usa el último día del mes.
 * Ej: día 31 → en febrero 28/29, en abril 30; día 30 → en febrero 28/29.
 */
function fechaProyectadaMensual(fechaInicio, numeroCuota) {
  const diaPago = fechaInicio.getDate()
  const anioInicio = fechaInicio.getFullYear()
  const mesInicio = fechaInicio.getMonth()
  const mesObjetivo = mesInicio + (numeroCuota - 1)
  const anioObjetivo = anioInicio + Math.floor(mesObjetivo / 12)
  const mes = ((mesObjetivo % 12) + 12) % 12
  const ultimoDiaDelMes = new Date(anioObjetivo, mes + 1, 0).getDate()
  const dia = Math.min(diaPago, ultimoDiaDelMes)
  return new Date(anioObjetivo, mes, dia, fechaInicio.getHours(), fechaInicio.getMinutes(), fechaInicio.getSeconds(), fechaInicio.getMilliseconds())
}

const notificationStore = useNotificationStore()
const natillerasStore = useNatillerasStore()
const authStore = useAuthStore()
const auditoria = useAuditoria()

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const id = props.id || route.params.id

const prestamos = ref([])
const socios = ref([])
const loading = ref(false)
// Carga inicial: controla el skeleton de la vista (solo el primer fetch, no los refetch)
const cargaInicial = ref(true)
// Pestaña de secciones de la lista: 'por_cobrar' | 'pagados'
const tabPrestamos = ref('por_cobrar')
const interesesGanadosUtilidades = ref(0) // Monto de intereses ganados desde utilidades_clasificadas
const todosLosPlanesPagos = ref([]) // Almacenar todos los planes de pagos para calcular total pagado
const modalNuevoPrestamo = ref(false)
const modalAbono = ref(false)
const modalEditarAbono = ref(false)
const modalDetalle = ref(false)
const modalRefinanciar = ref(false)
const prestamoSeleccionado = ref(null)
const prestamoDetalle = ref(null)
const pagosPrestamo = ref([])
const planPagosPrestamo = ref([])
const planPagosExpandido = ref(false)
// Abonos del ciclo vigente (los ya "cerrados" por una refinanciación quedan excluidos).
// El resumen de pagos del detalle solo debe contar estos.
const pagosCicloActual = computed(() => pagosPrestamo.value.filter(p => !p.refinanciacion_id))
// Ids de refinanciaciones cuyo desplegable de abonos está abierto en el detalle.
const historialAbonosExpandido = ref(new Set())
// Ids de refinanciaciones cuyo desplegable del plan de pagos anterior está abierto.
const historialPlanExpandido = ref(new Set())
const prestamoAEliminar = ref(null)
const abonoAEliminar = ref(null)
const abonoAEditar = ref(null)
const modalCompartirPrestamo = ref(false)
const modalCompartirPrestamoNuevo = ref(false)
const modalComprobanteAbono = ref(false)
const modalComprobantePagado = ref(false)
const generandoImagenPrestamo = ref(false)
const generandoImagenPrestamoNuevo = ref(false)
const generandoPrestamo = ref(false)
const contactoSeleccionadoWhatsApp = ref(null)
const historialRefinanciaciones = ref([])
const prestamoRef = ref(null)
const prestamoNuevoRef = ref(null)
const resumenPrestamoNuevoRef = ref(null)
const generandoResumenPrestamo = ref(false)
const prestamosMoraExpandidos = ref(new Set())

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalNuevoPrestamo)
useBodyScrollLock(modalAbono)
useBodyScrollLock(modalEditarAbono)
useBodyScrollLock(modalDetalle)
useBodyScrollLock(modalRefinanciar)
useBodyScrollLock(modalCompartirPrestamo)
useBodyScrollLock(modalCompartirPrestamoNuevo)
useBodyScrollLock(modalComprobanteAbono)
useBodyScrollLock(modalComprobantePagado)
useBodyScrollLock(computed(() => !!prestamoAEliminar.value))
useBodyScrollLock(computed(() => !!abonoAEliminar.value))

const modalDetalleScrollRef = ref(null)
const modalDetallePlanPagosSectionRef = ref(null)
const modalDetalleRefinanciacionSectionRef = ref(null)
const hayMasContenidoAbajoModalDetalle = ref(false)
let rafIndicadorScrollModalDetalle = null
function actualizarIndicadorScrollModalDetalle() {
  const el = modalDetalleScrollRef.value
  if (!el) {
    hayMasContenidoAbajoModalDetalle.value = false
    return
  }
  const umbral = 10
  hayMasContenidoAbajoModalDetalle.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarActualizarIndicadorScrollModalDetalle() {
  if (rafIndicadorScrollModalDetalle != null) cancelAnimationFrame(rafIndicadorScrollModalDetalle)
  rafIndicadorScrollModalDetalle = requestAnimationFrame(() => {
    rafIndicadorScrollModalDetalle = null
    actualizarIndicadorScrollModalDetalle()
  })
}

/** Expande el plan si hay varias cuotas y desplaza el scroll del modal hasta la tabla/grid. */
async function abrirPlanPagosYDesplazarDetalle() {
  if (!planPagosPrestamo.value.length) return
  const variasCuotas = planPagosPrestamo.value.length > 1
  if (variasCuotas) {
    planPagosExpandido.value = true
  }
  await nextTick()
  await nextTick()
  const ejecutarScroll = () => {
    const el = modalDetallePlanPagosSectionRef.value
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el?.focus({ preventScroll: true })
    programarActualizarIndicadorScrollModalDetalle()
  }
  if (variasCuotas) {
    window.setTimeout(ejecutarScroll, 340)
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(ejecutarScroll)
    })
  }
}

// Desplaza el detalle hasta la sección de refinanciaciones.
async function irASeccionRefinanciacion() {
  if (!historialRefinanciaciones.value.length) return
  await nextTick()
  const ejecutarScroll = () => {
    const el = modalDetalleRefinanciacionSectionRef.value
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el?.focus({ preventScroll: true })
    programarActualizarIndicadorScrollModalDetalle()
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(ejecutarScroll)
  })
}

watch(
  [
    modalDetalle,
    planPagosExpandido,
    () => pagosPrestamo.value.length,
    () => planPagosPrestamo.value.length,
    () => historialRefinanciaciones.value.length
  ],
  () => programarActualizarIndicadorScrollModalDetalle(),
  { flush: 'post' }
)

watch(modalDetalle, async (abierto) => {
  if (!abierto) {
    hayMasContenidoAbajoModalDetalle.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalDetalle()
})

// Función para toggle del desplegable de información de mora
const toggleMoraInfo = (prestamoId) => {
  if (prestamosMoraExpandidos.value.has(prestamoId)) {
    prestamosMoraExpandidos.value.delete(prestamoId)
  } else {
    prestamosMoraExpandidos.value.add(prestamoId)
  }
}

// parseReglasInteresPrestamo se importa desde utils/natilleraPrestamos (incluye tasa_mora)
const reglasInteresNatillera = ref(parseReglasInteresPrestamo(null))

const plazoMaximoCuotasCrear = computed(() => reglasInteresNatillera.value.plazo_maximo)

async function cargarReglasPrestamoNatillera() {
  try {
    const n = await natillerasStore.fetchNatillera(id)
    reglasInteresNatillera.value = parseReglasInteresPrestamo(n?.reglas_interes)
    return n
  } catch (e) {
    console.warn('No se cargaron reglas de préstamo de la natillera:', e)
    reglasInteresNatillera.value = parseReglasInteresPrestamo(null)
    return null
  }
}

function aplicarDefaultsFormularioCrearPrestamo() {
  const r = reglasInteresNatillera.value
  formPrestamo.interes = r.porcentaje
  formPrestamo.numero_cuotas = r.plazo_maximo
}

function limitarNumeroCuotasCrearPrestamo() {
  const max = reglasInteresNatillera.value.plazo_maximo
  const n = Number(formPrestamo.numero_cuotas)
  if (!Number.isFinite(n)) return
  if (n < 1) formPrestamo.numero_cuotas = 1
  else if (n > max) formPrestamo.numero_cuotas = max
}

const formPrestamo = reactive({
  socio_natillera_id: '',
  monto: 100000,
  interes: reglasInteresNatillera.value.porcentaje,
  numero_cuotas: reglasInteresNatillera.value.plazo_maximo,
  tipo_interes: 'simple', // 'simple' o 'compuesto'
  periodicidad: 'mensual', // 'mensual' o 'quincenal'
  fecha_pago: getCurrentDateISO(), // Fecha de pago de la primera cuota
  medio_entrega: 'efectivo' // efectivo | transferencia (cómo se entrega el préstamo al socio)
})

const montoFormateado = ref('100.000')
const mostrarSelectorSocio = ref(false)
const busquedaSocio = ref('')
const mostrarInteresAnticipado = ref(false)
const modalNuevoPrestamoScrollRef = ref(null)
const modalCompartirPrestamoNuevoScrollRef = ref(null)
const hayMasContenidoAbajoModalNuevoPrestamo = ref(false)
/** Natiscroll — modal compartir proyección (WhatsApp) */
const hayNatiscrollModalProyeccion = ref(false)

let rafIndicadorScrollModalNuevoPrestamo = null
function actualizarIndicadorScrollModalNuevoPrestamo() {
  const el = modalNuevoPrestamoScrollRef.value
  if (!el) {
    hayMasContenidoAbajoModalNuevoPrestamo.value = false
    return
  }
  const umbral = 10
  hayMasContenidoAbajoModalNuevoPrestamo.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarActualizarIndicadorScrollModalNuevoPrestamo() {
  if (rafIndicadorScrollModalNuevoPrestamo != null) cancelAnimationFrame(rafIndicadorScrollModalNuevoPrestamo)
  rafIndicadorScrollModalNuevoPrestamo = requestAnimationFrame(() => {
    rafIndicadorScrollModalNuevoPrestamo = null
    actualizarIndicadorScrollModalNuevoPrestamo()
  })
}

let rafNatiscrollModalProyeccion = null
function actualizarNatiscrollModalProyeccion() {
  const el = modalCompartirPrestamoNuevoScrollRef.value
  if (!el) {
    hayNatiscrollModalProyeccion.value = false
    return
  }
  const umbral = 10
  hayNatiscrollModalProyeccion.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarNatiscrollModalProyeccion() {
  if (rafNatiscrollModalProyeccion != null) cancelAnimationFrame(rafNatiscrollModalProyeccion)
  rafNatiscrollModalProyeccion = requestAnimationFrame(() => {
    rafNatiscrollModalProyeccion = null
    actualizarNatiscrollModalProyeccion()
  })
}

function onScrollModalCompartirPrestamoNuevo() {
  programarNatiscrollModalProyeccion()
}

const modalCompartirPrestamoScrollRef = ref(null)
const hayNatiscrollModalCompartirPrestamo = ref(false)

let rafNatiscrollModalCompartirPrestamo = null
function actualizarNatiscrollModalCompartirPrestamo() {
  const el = modalCompartirPrestamoScrollRef.value
  if (!el) {
    hayNatiscrollModalCompartirPrestamo.value = false
    return
  }
  const umbral = 10
  hayNatiscrollModalCompartirPrestamo.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarNatiscrollModalCompartirPrestamo() {
  if (rafNatiscrollModalCompartirPrestamo != null) cancelAnimationFrame(rafNatiscrollModalCompartirPrestamo)
  rafNatiscrollModalCompartirPrestamo = requestAnimationFrame(() => {
    rafNatiscrollModalCompartirPrestamo = null
    actualizarNatiscrollModalCompartirPrestamo()
  })
}

function onScrollModalCompartirPrestamo() {
  programarNatiscrollModalCompartirPrestamo()
}

watch(modalCompartirPrestamo, async (abierto) => {
  if (!abierto) {
    hayNatiscrollModalCompartirPrestamo.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarNatiscrollModalCompartirPrestamo()
})

watch(
  [
    modalCompartirPrestamo,
    () => planPagosPrestamo.value.length,
    () => todosLosPlanesPagos.value.length,
    () => prestamoDetalle.value?.id
  ],
  () => {
    if (modalCompartirPrestamo.value) programarNatiscrollModalCompartirPrestamo()
  },
  { flush: 'post' }
)

const pasoNuevoPrestamo = ref(0) // 0: Monto (socio, periodicidad, monto) | 1: Plazo (interés, cuotas, fecha, medio) | 2: Resumen
const prestamoRecienCreado = ref(null) // { prestamo, planPagos } después de crear; null antes. Cuando no es null se muestra comprobante con Descargar/WhatsApp

watch(
  [modalNuevoPrestamo, pasoNuevoPrestamo, prestamoRecienCreado, mostrarInteresAnticipado],
  () => programarActualizarIndicadorScrollModalNuevoPrestamo(),
  { flush: 'post' }
)

// Apertura "fresca" del modal (desde los botones): resetea el wizard y carga defaults.
// OJO: no meter este reseteo en el watch de modalNuevoPrestamo, porque useModalStack
// oculta/restaura (false→true) este modal al abrir/cerrar el de compartir, y eso
// dispararía el reseteo perdiendo el paso actual y los datos del formulario.
async function abrirModalNuevoPrestamo() {
  pasoNuevoPrestamo.value = 0
  prestamoRecienCreado.value = null
  modalNuevoPrestamo.value = true
  await cargarReglasPrestamoNatillera()
  aplicarDefaultsFormularioCrearPrestamo()
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalNuevoPrestamo()
}

watch(modalNuevoPrestamo, async (abierto) => {
  if (!abierto) {
    hayMasContenidoAbajoModalNuevoPrestamo.value = false
    return
  }
  // Re-apertura (p. ej. restauración desde el stack al cerrar «Compartir»):
  // solo recalcular el indicador de scroll, sin resetear el paso ni el formulario.
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalNuevoPrestamo()
})

watch(modalCompartirPrestamoNuevo, async (abierto) => {
  if (!abierto) {
    hayNatiscrollModalProyeccion.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarNatiscrollModalProyeccion()
})

const formAbono = reactive({
  valor: 0,
  fecha_pago: getCurrentDateISO(),
  tipo_pago: 'efectivo', // efectivo | transferencia
  valor_efectivo: 0,
  valor_transferencia: 0
})

const modalAbonoScrollRef = ref(null)
const hayMasContenidoAbajoModalAbono = ref(false)
let rafIndicadorScrollModalAbono = null
function actualizarIndicadorScrollModalAbono() {
  const el = modalAbonoScrollRef.value
  if (!el) {
    hayMasContenidoAbajoModalAbono.value = false
    return
  }
  const umbral = 10
  hayMasContenidoAbajoModalAbono.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarActualizarIndicadorScrollModalAbono() {
  if (rafIndicadorScrollModalAbono != null) cancelAnimationFrame(rafIndicadorScrollModalAbono)
  rafIndicadorScrollModalAbono = requestAnimationFrame(() => {
    rafIndicadorScrollModalAbono = null
    actualizarIndicadorScrollModalAbono()
  })
}

watch(
  [modalAbono, loading],
  () => programarActualizarIndicadorScrollModalAbono(),
  { flush: 'post' }
)

watch(
  () => formAbono.valor,
  () => {
    if (modalAbono.value) programarActualizarIndicadorScrollModalAbono()
  },
  { flush: 'post' }
)

watch(modalAbono, async (abierto) => {
  if (!abierto) {
    hayMasContenidoAbajoModalAbono.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalAbono()
})

const formRefinanciar = reactive({
  fecha_pago: getCurrentDateISO(), // Nueva fecha de pago
  numero_cuotas_nuevo: null, // Número de cuotas para el refinanciamiento (no se suma al anterior)
  tipo_interes_nuevo: 'simple', // Tipo de interés: simple o compuesto
  interes_nuevo: null, // Nueva tasa de interés (opcional, si null usa la original)
  tabActual: 'refinanciar' // Tab actual: 'refinanciar'
})
const valorAbonoFormateado = ref('')
const valorAbonoEditadoFormateado = ref('')
const inputValorAbonoRef = ref(null)
const comprobanteAbono = ref(null)

// ── Mora en el abono ───────────────────────────────────────────────
// El pago cubre PRIMERO la mora acumulada (va al fondo) y el resto baja el saldo
// de capital+interés. El saldo nunca capitaliza la mora.
const moraPrestamoAbono = computed(() => prestamoSeleccionado.value?.moraAcumulada || 0)
const saldoPrestamoAbono = computed(() => parseFloat(prestamoSeleccionado.value?.saldo_actual) || 0)
// Total a pagar (dinámico): saldo pendiente + mora acumulada a hoy
const totalAPagarConMora = computed(() => saldoPrestamoAbono.value + moraPrestamoAbono.value)
// Desglose del abono: la mora se cobra PROPORCIONAL a la(s) cuota(s) que se pagan
// (recorriendo las vencidas de la más antigua a la más nueva), no toda de golpe.
const desgloseAbono = computed(() => desglosarAbonoConMora(
  formAbono.valor,
  prestamoSeleccionado.value?.cuotasVencidasOrdenadas,
  reglasInteresNatillera.value.tasa_mora,
  new Date()
))
const moraPagadaAbono = computed(() => desgloseAbono.value.moraPagada)
const abonoACapitalAbono = computed(() => desgloseAbono.value.abonoAPrestamo)
const saldoDespuesAbono = computed(() => Math.max(0, saldoPrestamoAbono.value - abonoACapitalAbono.value))
const generandoImagenComprobante = ref(false)
const comprobanteRef = ref(null)

// Comprobante de préstamo PAGADO (total pagado + lista de abonos)
const comprobantePagado = ref(null)
const comprobantePagadoRef = ref(null)
const generandoImagenComprobantePagado = ref(false)

/** Borrador en sessionStorage si el navegador recarga al volver de otra app (móvil). */
function prestamosWorkDraftKey() {
  const uid = authStore.user?.id || 'anon'
  return `natillerapp:prestamos-work:${uid}:${id}`
}

function clearPrestamosWorkDraft() {
  try {
    sessionStorage.removeItem(prestamosWorkDraftKey())
  } catch {
    /* ignore */
  }
}

function getPrestamosWorkDraftPayload() {
  const natilleraId = String(id)
  if (modalComprobanteAbono.value && comprobanteAbono.value) {
    const c = comprobanteAbono.value
    return {
      kind: 'comprobante',
      natilleraId,
      comprobante: {
        pagoPrestamoId: c.pagoPrestamoId,
        prestamoId: c.prestamoId,
        valor: c.valor,
        codigoComprobante: c.codigoComprobante,
        socioNombre: c.socioNombre,
        socioTelefono: c.socioTelefono,
        fecha: c.fecha,
        saldoAnterior: c.saldoAnterior,
        saldoNuevo: c.saldoNuevo
      }
    }
  }
  if (modalAbono.value && prestamoSeleccionado.value?.id) {
    return {
      kind: 'abono',
      natilleraId,
      prestamoId: prestamoSeleccionado.value.id,
      formAbono: {
        valor: formAbono.valor,
        fecha_pago: formAbono.fecha_pago,
        tipo_pago: formAbono.tipo_pago,
        valor_efectivo: formAbono.valor_efectivo,
        valor_transferencia: formAbono.valor_transferencia
      },
      valorAbonoFormateado: valorAbonoFormateado.value || ''
    }
  }
  return null
}

useSessionDraftPersistence(prestamosWorkDraftKey, getPrestamosWorkDraftPayload)

function tryRestorePrestamosWorkDraft() {
  try {
    const raw = sessionStorage.getItem(prestamosWorkDraftKey())
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.v !== 1 || String(data.natilleraId) !== String(id)) return
    const maxAge = 48 * 60 * 60 * 1000
    if (data.savedAt && Date.now() - data.savedAt > maxAge) {
      clearPrestamosWorkDraft()
      return
    }

    if (data.kind === 'abono' && data.prestamoId) {
      const p = prestamos.value.find((x) => x.id === data.prestamoId)
      if (!p) {
        clearPrestamosWorkDraft()
        return
      }
      prestamoSeleccionado.value = p
      if (data.formAbono) {
        Object.assign(formAbono, {
          valor: data.formAbono.valor ?? 0,
          fecha_pago: data.formAbono.fecha_pago || getCurrentDateISO(),
          tipo_pago: data.formAbono.tipo_pago || 'efectivo',
          valor_efectivo: data.formAbono.valor_efectivo ?? 0,
          valor_transferencia: data.formAbono.valor_transferencia ?? 0
        })
      }
      valorAbonoFormateado.value =
        data.valorAbonoFormateado || formatMoney(formAbono.valor || 0)
      modalAbono.value = true
      nextTick(() => {
        notificationStore.info(
          'Se recuperó el abono que estabas registrando. Revisa los datos y confirma.',
          'Borrador guardado'
        )
      })
      return
    }

    if (data.kind === 'comprobante' && data.comprobante) {
      const c = data.comprobante
      const prestamoFromList =
        c.prestamoId && prestamos.value.find((x) => x.id === c.prestamoId)
      comprobanteAbono.value = {
        ...c,
        prestamo: prestamoFromList || null
      }
      modalComprobanteAbono.value = true
      nextTick(() => {
        notificationStore.info(
          'Se recuperó el comprobante de abono. Puedes compartirlo o descargarlo.',
          'Borrador guardado'
        )
      })
    }
  } catch {
    clearPrestamosWorkDraft()
  }
}

watch(modalComprobanteAbono, (open, wasOpen) => {
  if (wasOpen && !open) {
    clearPrestamosWorkDraft()
    comprobanteAbono.value = null
  }
})

const totalPrestado = computed(() => 
  prestamos.value.reduce((sum, p) => sum + p.monto, 0)
)

// El total de intereses se lee directamente de utilidades_clasificadas
// que se actualiza cuando se crea un préstamo nuevo con interés anticipado
// o cuando se pagan cuotas de préstamos refinanciados
const totalIntereses = computed(() => interesesGanadosUtilidades.value)

// Funciones auxiliares para manejar intereses por préstamo en utilidades_clasificadas
// Cada préstamo tiene su propio registro con id_actividad = prestamo_id
async function obtenerTotalInteresesPrestamos(natilleraId) {
  const { data: utilidades, error } = await supabase
    .from('utilidades_clasificadas')
    .select('monto')
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'prestamos')
    .is('fecha_cierre', null)
    .not('id_actividad', 'is', null) // Solo registros individuales por préstamo

  if (error) {
    console.error('Error obteniendo utilidades de préstamos:', error)
    return 0
  }

  // Sumar todos los montos de los registros individuales
  const total = (utilidades || []).reduce((sum, utilidad) => {
    return sum + parseFloat(utilidad.monto || 0)
  }, 0)

  return total
}

async function actualizarInteresPrestamo(natilleraId, prestamoId, interes, tipo = 'anticipado', esNuevo = true, esRefinanciacion = false, formaPago = null) {
  // Buscar si ya existe un registro para este préstamo (uno por préstamo; forma_pago se usa al crear)
  const { data: utilidadExistente, error: errorBusqueda } = await supabase
    .from('utilidades_clasificadas')
    .select('*')
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'prestamos')
    .eq('id_actividad', prestamoId)
    .is('fecha_cierre', null)
    .maybeSingle()

  if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
    console.error('Error buscando utilidad existente:', errorBusqueda)
  }

  let montoNuevo = parseFloat(interes)
  
  if (utilidadExistente && !esNuevo) {
    if (esRefinanciacion) {
      // Si es refinanciación, reemplazar el interés con el nuevo interés total completo
      montoNuevo = parseFloat(interes)
    } else {
      // Si no es refinanciación, sumar al interés existente (cuando se paga una cuota)
      montoNuevo = parseFloat(utilidadExistente.monto || 0) + parseFloat(interes)
    }
  }

  // Normalizar forma_pago (efectivo, transferencia, mixto) para clasificación
  const formaPagoNorm = (formaPago && ['efectivo', 'transferencia', 'mixto'].includes((formaPago || '').toLowerCase()))
    ? (formaPago || '').toLowerCase()
    : null

  let data, error

  if (utilidadExistente) {
    // Si existe, actualizar el registro existente
    const { data: updatedData, error: updateError } = await supabase
      .from('utilidades_clasificadas')
      .update({
        monto: montoNuevo,
        descripcion: `Intereses generados por préstamo ${prestamoId}`,
        detalles: {
          prestamo_id: prestamoId,
          tipo_interes: tipo,
          fecha_registro: utilidadExistente.detalles?.fecha_registro || new Date().toISOString(),
          fecha_ultima_actualizacion: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', utilidadExistente.id)
      .select()
      .single()

    data = updatedData
    error = updateError
  } else {
    // Si no existe, crear un nuevo registro (con forma_pago cuando aplica, ej. medio_entrega del préstamo)
    const insertPayload = {
      natillera_id: natilleraId,
      tipo: 'prestamos',
      id_actividad: prestamoId,
      monto: montoNuevo,
      fecha_cierre: null,
      descripcion: `Intereses generados por préstamo ${prestamoId}`,
      detalles: {
        prestamo_id: prestamoId,
        tipo_interes: tipo,
        fecha_registro: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }
    if (formaPagoNorm != null) insertPayload.forma_pago = formaPagoNorm

    const { data: insertedData, error: insertError } = await supabase
      .from('utilidades_clasificadas')
      .insert(insertPayload)
      .select()
      .single()

    data = insertedData
    error = insertError
  }

  if (error) {
    console.error('Error actualizando intereses de préstamo:', error)
    return null
  }

  // Actualizar el ref con el total de todos los préstamos
  const totalIntereses = await obtenerTotalInteresesPrestamos(natilleraId)
  interesesGanadosUtilidades.value = totalIntereses

  return data
}

async function eliminarInteresPrestamo(natilleraId, prestamoId) {
  // Eliminar el registro individual del préstamo
  const { error } = await supabase
    .from('utilidades_clasificadas')
    .delete()
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'prestamos')
    .eq('id_actividad', prestamoId)
    .is('fecha_cierre', null)

  if (error) {
    console.error('Error eliminando interés de préstamo:', error)
    return
  }

  // Actualizar el ref con el total de todos los préstamos restantes
  const totalIntereses = await obtenerTotalInteresesPrestamos(natilleraId)
  interesesGanadosUtilidades.value = totalIntereses
}

const totalPagado = computed(() => {
  // El total pagado es la suma del campo valor_cuota de las cuotas pagadas (pagada = true)
  // Solo considera préstamos de la natillera actual
  return todosLosPlanesPagos.value
    .filter(cuota => cuota.pagada === true)
    .reduce((sum, cuota) => {
      return sum + parseFloat(cuota.valor_cuota || 0)
    }, 0)
})

// Secciones «Por cobrar» (todo lo que no está pagado: activos + en mora) y «Pagados»
const prestamosPorCobrar = computed(() =>
  prestamos.value.filter(p => p.estado !== 'pagado')
)
const prestamosPagados = computed(() =>
  prestamos.value.filter(p => p.estado === 'pagado')
)
// Lista mostrada según la pestaña activa
const prestamosFiltrados = computed(() =>
  tabPrestamos.value === 'pagados' ? prestamosPagados.value : prestamosPorCobrar.value
)
// Totales por sección (para el resumen de la cabecera del panel)
const saldoPorCobrar = computed(() =>
  prestamosPorCobrar.value.reduce((s, p) => s + parseFloat(p.saldo_actual || 0), 0)
)
// «Total pagado» de la sección Pagados: misma métrica que el indicador global
// (suma de valor_cuota de cuotas pagadas = capital + interés), pero acotada a los
// préstamos ya pagados. Así es un subconjunto real del indicador «Total Pagado».
const montoPagadosSeccion = computed(() => {
  const idsPagados = new Set(prestamosPagados.value.map(p => p.id))
  return todosLosPlanesPagos.value
    .filter(c => c.pagada === true && idsPagados.has(c.prestamo_id))
    .reduce((s, c) => s + parseFloat(c.valor_cuota || 0), 0)
})

// Vista previa del refinanciamiento
const vistaPreviaRefinanciacion = computed(() => {
  if (!prestamoSeleccionado.value || !formRefinanciar.fecha_pago || !formRefinanciar.numero_cuotas_nuevo || formRefinanciar.numero_cuotas_nuevo <= 0) {
    return null
  }

  const prestamo = prestamoSeleccionado.value
  const saldoActual = parseFloat(prestamo.saldo_actual || 0)
  
  if (saldoActual <= 0) {
    return null
  }

  // El número de cuotas es el ingresado (no se suma al anterior)
  const totalCuotas = formRefinanciar.numero_cuotas_nuevo || 0

  if (totalCuotas <= 0) {
    return null
  }

  // Usar tasa de interés nueva si se especificó, sino usar la original
  const interes = formRefinanciar.interes_nuevo !== null && formRefinanciar.interes_nuevo !== undefined
    ? formRefinanciar.interes_nuevo
    : (prestamo.interes || 0)
  
  const tasaMensual = interes / 100
  const tipoInteres = formRefinanciar.tipo_interes_nuevo || prestamo.tipo_interes || 'simple'
  const periodicidad = prestamo.periodicidad || 'mensual'
  const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual

  // Obtener el interés inicial original del préstamo
  // Si el préstamo tiene interes_total_original (fue refinanciado), usar ese valor
  // Si no, usar el interes_total actual (es el inicial)
  const tieneInteresAnticipado = prestamo.interes_anticipado || false
  const interesInicialOriginal = prestamo.interes_total_original !== null && prestamo.interes_total_original !== undefined
    ? parseFloat(prestamo.interes_total_original)
    : (prestamo.interes_total ? parseFloat(prestamo.interes_total) : 0)
  
  // Calcular el nuevo interés total
  let interesTotalNuevoCalculado = 0
  let totalPagar = 0
  let valorCuota = 0

  if (tipoInteres === 'compuesto') {
    totalPagar = saldoActual * Math.pow(1 + tasaPeriodica, totalCuotas)
    interesTotalNuevoCalculado = totalPagar - saldoActual
    valorCuota = totalPagar / totalCuotas
  } else {
    interesTotalNuevoCalculado = saldoActual * tasaPeriodica * totalCuotas
    totalPagar = saldoActual + interesTotalNuevoCalculado
    valorCuota = totalPagar / totalCuotas
  }

  // El interés total que se muestra debe ser el nuevo completo
  // La diferencia (interesTotalNuevoCalculado - interesInicialOriginal) solo se distribuye en las cuotas
  // pero el interés_total del préstamo y el saldo_actual deben incluir el nuevo interés completo
  let interesTotalAMostrar = interesTotalNuevoCalculado

  return {
    saldo: saldoActual,
    totalCuotas,
    interesTotal: Math.round(interesTotalAMostrar),
    totalPagar: Math.round(totalPagar),
    valorCuota: Math.round(valorCuota),
    tasaInteres: interes,
    tipoInteres
  }
})

// Calcular liquidación a fecha

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function etiquetaPeriodoCuotaPrestamo(cuota, periodicidad) {
  if (!cuota) return null
  let mes = cuota.mes
  let anio = cuota.anio
  let quincena = cuota.quincena
  // Si falta cualquier dato (mes, anio o quincena cuando es quincenal), derivar de fecha_proyectada.
  if (mes == null || anio == null || ((periodicidad || 'mensual') === 'quincenal' && quincena == null)) {
    if (cuota.fecha_proyectada) {
      const d = parseDateLocal(cuota.fecha_proyectada) || new Date(cuota.fecha_proyectada)
      if (!isNaN(d.getTime())) {
        if (mes == null) mes = d.getMonth() + 1
        if (anio == null) anio = d.getFullYear()
        if (quincena == null) quincena = d.getDate() <= 15 ? 1 : 2
      }
    }
  }
  if (mes == null || anio == null) return null
  const nombreMes = MESES_ES[mes - 1] || ''
  if ((periodicidad || 'mensual') === 'quincenal') {
    const q = quincena === 2 ? '2da' : '1ra'
    return `${q} quincena ${nombreMes} ${anio}`
  }
  return `${nombreMes} ${anio}`
}

// Determina la forma de pago de un abono usando el desglose efectivo/transferencia.
function formaPagoAbono(pago) {
  if (!pago) return null
  const ef = parseFloat(pago.valor_efectivo) || 0
  const tr = parseFloat(pago.valor_transferencia) || 0
  if (ef > 0 && tr > 0) return 'mixto'
  if (ef > 0) return 'efectivo'
  if (tr > 0) return 'transferencia'
  return null
}

const FORMA_PAGO_ABONO_ESTILO = {
  efectivo: { label: 'Efectivo', icon: '💵', clase: 'bg-green-50 text-green-700 border-green-200/70' },
  transferencia: { label: 'Transferencia', icon: '🏦', clase: 'bg-blue-50 text-blue-700 border-blue-200/70' },
  mixto: { label: 'Mixto', icon: '🔀', clase: 'bg-purple-50 text-purple-700 border-purple-200/70' }
}

const cuotaPorNumeroMap = computed(() => {
  const map = new Map()
  for (const c of (planPagosPrestamo.value || [])) {
    if (c.numero_cuota != null) map.set(c.numero_cuota, c)
  }
  return map
})

function periodosDeNumerosCuota(numerosCuota) {
  if (!Array.isArray(numerosCuota) || numerosCuota.length === 0) return []
  // Mostrar quincena (1ra/2da) si el socio en la natillera es quincenal o si el préstamo lo es.
  const periodicidadSocio = prestamoDetalle.value?.socio_natillera?.periodicidad
  const periodicidadPrestamo = prestamoDetalle.value?.periodicidad
  const periodicidad = (periodicidadSocio === 'quincenal' || periodicidadPrestamo === 'quincenal')
    ? 'quincenal'
    : (periodicidadPrestamo || periodicidadSocio || 'mensual')
  const labels = []
  const seen = new Set()
  for (const n of numerosCuota) {
    const cuota = cuotaPorNumeroMap.value.get(n)
    const label = etiquetaPeriodoCuotaPrestamo(cuota, periodicidad)
    if (label && !seen.has(label)) {
      seen.add(label)
      labels.push(label)
    }
  }
  return labels
}

function formatCurrencyInput(value) {
  // Remover todos los caracteres no numéricos
  const numericValue = String(value).replace(/\D/g, '')
  // Formatear como número
  if (!numericValue) return ''
  return formatMoney(parseInt(numericValue))
}

function actualizarMonto(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    formPrestamo.monto = 0
    montoFormateado.value = ''
    return
  }
  
  // Convertir a número
  const numero = parseInt(valorSinFormato)
  
  // Validar que sea un número válido
  if (isNaN(numero)) {
    return
  }
  
  // Actualizar el valor numérico
  formPrestamo.monto = numero
  
  // Formatear para mostrar en el input
  montoFormateado.value = formatMoney(numero)
}

const socioSeleccionado = computed(() => {
  return socios.value.find(s => s.id === formPrestamo.socio_natillera_id)
})

/** Suma valor_cuota de cuotas pagadas (misma base que el resto de la app; solo informativo) */
const totalAhorradoInformativoSocio = ref(null)
const cargandoTotalAhorradoSocio = ref(false)

async function cargarTotalAhorradoInformativoSocio(socioNatilleraId) {
  totalAhorradoInformativoSocio.value = null
  if (!socioNatilleraId) return
  cargandoTotalAhorradoSocio.value = true
  try {
    const { data: cuotas, error } = await supabase
      .from('cuotas')
      .select('estado, valor_cuota')
      .eq('socio_natillera_id', socioNatilleraId)
    if (error) throw error
    const total = (cuotas || [])
      .filter((c) => c.estado === 'pagada')
      .reduce((sum, c) => sum + (Number(c.valor_cuota) || 0), 0)
    totalAhorradoInformativoSocio.value = total
  } catch (e) {
    console.error('Error cargando total ahorrado del socio:', e)
    totalAhorradoInformativoSocio.value = null
  } finally {
    cargandoTotalAhorradoSocio.value = false
  }
}

watch(
  () => formPrestamo.socio_natillera_id,
  (sid) => {
    void cargarTotalAhorradoInformativoSocio(sid)
  },
  { immediate: true }
)

const sociosFiltrados = computed(() => {
  if (!busquedaSocio.value) return socios.value
  const busqueda = busquedaSocio.value.toLowerCase()
  return socios.value.filter(s => 
    s.socio?.nombre?.toLowerCase().includes(busqueda) ||
    s.socio?.email?.toLowerCase().includes(busqueda) ||
    s.socio?.telefono?.includes(busqueda)
  )
})

// Capital que se va a prestar (siempre es el monto ingresado, igual en ambos casos)
const capitalAPrestar = computed(() => {
  return formPrestamo.monto || 0
})

// El interés se calcula SIEMPRE igual (como interés normal: simple o compuesto).
// La única diferencia entre anticipado y normal es CUÁNDO se suma a utilidades:
// - Anticipado: todo el interés se suma a utilidades al crear el préstamo.
// - Normal: el interés se va sumando a utilidades al pagar cada cuota (proporcional por cuota).
const interesTotal = computed(() => {
  if (!capitalAPrestar.value || !formPrestamo.interes || !formPrestamo.numero_cuotas) return 0
  
  const monto = capitalAPrestar.value
  const tasaMensual = formPrestamo.interes / 100
  const cuotas = formPrestamo.numero_cuotas
  const periodicidad = formPrestamo.periodicidad || 'mensual'
  const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
  
  if (formPrestamo.tipo_interes === 'compuesto') {
    // Interés compuesto: M = C * (1 + i)^n; Interés = M - C
    const montoFinal = monto * Math.pow(1 + tasaPeriodica, cuotas)
    return montoFinal - monto
  } else {
    // Interés simple: I = C * i * n
    return monto * tasaPeriodica * cuotas
  }
})

// Total a pagar por el socio: capital + intereses (igual para anticipado y normal)
const montoTotal = computed(() => {
  return capitalAPrestar.value + interesTotal.value
})

// El interés es el mismo para normal y anticipado, solo cambia cuándo se cobra
// Ya está calculado en interesTotal, no necesitamos una variable separada

// Calcular capital necesario para obtener un monto exacto a recibir (interés anticipado)
function calcularCapitalNecesario(montoARecibir, tasaMensual, cuotas, tipoInteres) {
  if (!montoARecibir || !tasaMensual || !cuotas || montoARecibir <= 0) return 0
  
  if (tipoInteres === 'simple') {
    // Monto a recibir = Capital × (1 - tasa × meses)
    // Capital = Monto a recibir / (1 - tasa × meses)
    const divisor = 1 - (tasaMensual * cuotas)
    if (divisor <= 0) return 0 // Evitar división por cero o negativa
    return montoARecibir / divisor
  } else {
    // Interés compuesto anticipado:
    // Monto a recibir = Capital - Capital × ((1 + tasa)^meses - 1)
    // Monto a recibir = Capital × (2 - (1 + tasa)^meses)
    // Capital = Monto a recibir / (2 - (1 + tasa)^meses)
    const factor = Math.pow(1 + tasaMensual, cuotas)
    const divisor = 2 - factor
    if (divisor <= 0) return 0 // Evitar división por cero o negativa
    return montoARecibir / divisor
  }
}

// El monto que recibe el socio (desembolso real)
const montoARecibir = computed(() => {
  if (mostrarInteresAnticipado.value) {
    // Con interés anticipado, el socio recibe el capital menos el interés (que se retiene y va a utilidades)
    const montoARecibirCalculado = capitalAPrestar.value - interesTotal.value
    return Math.max(0, montoARecibirCalculado)
  }
  return capitalAPrestar.value
})

// Movimiento total del fondo al inicio
const movimientoFondoInicio = computed(() => {
  if (mostrarInteresAnticipado.value) {
    // Con interés anticipado: capital que sale + interés que se retiene y queda en el fondo
    return capitalAPrestar.value + interesTotal.value
  }
  // Con interés normal: solo sale el capital
  return capitalAPrestar.value
})

// Valor total a pagar por el socio
const montoAPagar = computed(() => {
  // Con interés anticipado, el socio debe pagar capital + intereses
  // Con interés normal, el total a pagar es capital + intereses
  return montoTotal.value
})

// Cuota mensual: con anticipado solo se divide el capital, con normal se divide el total
const proximaCuotaPago = computed(() => {
  if (!planPagosPrestamo.value || planPagosPrestamo.value.length === 0) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const cuotasPendientes = planPagosPrestamo.value
    .filter(c => !c.pagada && parseDateLocal(c.fecha_proyectada) >= hoy)
    .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
  return cuotasPendientes.length > 0 ? cuotasPendientes[0] : null
})

// Helper para verificar si una fecha está vencida (para usar en el template)
function esFechaVencida(fecha) {
  if (!fecha) return false
  const fechaParsed = parseDateLocal(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fechaParsed.setHours(0, 0, 0, 0)
  return fechaParsed < hoy
}

function cuotaPagadaCompletaComprobante(cuota) {
  if (!cuota) return false
  if (cuota.pagada === true) return true
  const vc = parseFloat(cuota.valor_cuota || 0)
  const vp = parseFloat(cuota.valor_pagado || 0)
  if (vc <= 0) return false
  return vp >= vc - 0.009
}

function etiquetaEstadoCuotaComprobante(cuota) {
  if (cuotaPagadaCompletaComprobante(cuota)) return 'Pagada'
  const vp = parseFloat(cuota.valor_pagado || 0)
  if (vp > 0) return 'Parcial'
  if (esFechaVencida(cuota.fecha_proyectada)) return 'Vencida'
  return 'Pendiente'
}

// Mora acumulada a hoy de UNA cuota del plan (para mostrarla en el comprobante).
function moraCuotaComprobante(cuota) {
  return Math.round(calcularMoraCuota(cuota, reglasInteresNatillera.value.tasa_mora, new Date()))
}

function estiloBadgeEstadoCuotaComprobante(cuota) {
  const e = etiquetaEstadoCuotaComprobante(cuota)
  const base = {
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '9999px',
    display: 'inline-block',
    whiteSpace: 'nowrap'
  }
  if (e === 'Pagada') return { ...base, background: '#d1fae5', color: '#059669' }
  if (e === 'Parcial') return { ...base, background: '#dbeafe', color: '#1d4ed8' }
  if (e === 'Vencida') return { ...base, background: '#fef3c7', color: '#b45309' }
  return { ...base, background: '#f3f4f6', color: '#4b5563' }
}

/** Plan para el comprobante de préstamo existente: detalle cargado o fallback del listado global. */
const planPagosComprobanteExistente = computed(() => {
  const pid = prestamoDetalle.value?.id
  if (!pid) return []
  let rows =
    planPagosPrestamo.value.length > 0
      ? [...planPagosPrestamo.value]
      : todosLosPlanesPagos.value.filter((c) => c.prestamo_id === pid)
  return rows.sort((a, b) => (Number(a.numero_cuota) || 0) - (Number(b.numero_cuota) || 0))
})

/** Al día / en mora (N cuotas) junto al socio en el comprobante; si no hay plan, usa cuotasVencidas del listado. */
const resumenMoraComprobanteExistente = computed(() => {
  if (prestamoDetalle.value?.estado === 'pagado') {
    return { tipo: 'pagado', texto: 'Pagado' }
  }
  const plan = planPagosComprobanteExistente.value
  let cuotasMora = 0
  if (plan.length > 0) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    cuotasMora = plan.filter((cuota) => {
      if (cuotaPagadaCompletaComprobante(cuota)) return false
      const fv = parseDateLocal(cuota.fecha_proyectada)
      if (isNaN(fv.getTime())) return false
      fv.setHours(0, 0, 0, 0)
      return fv < hoy
    }).length
  } else {
    const pid = prestamoDetalle.value?.id
    const fila = prestamos.value.find((p) => p.id === pid)
    cuotasMora = Number(fila?.cuotasVencidas) || 0
  }
  if (cuotasMora > 0) {
    return {
      tipo: 'mora',
      texto: cuotasMora === 1 ? 'En mora · 1 cuota' : `En mora · ${cuotasMora} cuotas`,
      cuotasMora
    }
  }
  return { tipo: 'aldia', texto: 'Al día', cuotasMora: 0 }
})

const estiloAvisoMoraComprobanteExistente = computed(() => {
  const t = resumenMoraComprobanteExistente.value.tipo
  const base = {
    flexShrink: 0,
    alignSelf: 'center',
    fontSize: '12px',
    fontWeight: 800,
    padding: '7px 12px',
    borderRadius: '9999px',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    maxWidth: '16rem',
    textAlign: 'center',
    letterSpacing: '0.02em'
  }
  if (t === 'mora') {
    return { ...base, background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }
  }
  if (t === 'pagado') {
    return { ...base, background: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7' }
  }
  return { ...base, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }
})

const cuotaMensual = computed(() => {
  // Con interés anticipado o normal, la cuota es el total (capital + intereses) dividido entre las cuotas
  return montoTotal.value / formPrestamo.numero_cuotas
})

// Plan de pagos de vista previa para el comprobante (préstamo nuevo)
const planPagosComprobanteNuevo = computed(() => {
  if (!formPrestamo.monto || !formPrestamo.numero_cuotas) return []
  const prestamoVirtual = {
    id: 0,
    monto: parseFloat(formPrestamo.monto) || 0,
    numero_cuotas: parseInt(formPrestamo.numero_cuotas) || 1,
    interes: parseFloat(formPrestamo.interes) || 0,
    fecha_inicio: formPrestamo.fecha_pago || new Date().toISOString().slice(0, 10),
    periodicidad: formPrestamo.periodicidad || 'mensual',
    tipo_interes: formPrestamo.tipo_interes || 'simple',
    interes_anticipado: mostrarInteresAnticipado.value,
    interes_total: interesTotal.value
  }
  return generarPlanPagos(prestamoVirtual)
})

watch(planPagosComprobanteNuevo, () => {
  if (modalCompartirPrestamoNuevo.value) programarNatiscrollModalProyeccion()
}, { flush: 'post' })

// Datos del comprobante cuando el préstamo ya fue creado (vista después de Confirmar en el footer)
const datosComprobanteCreado = computed(() => {
  const p = prestamoRecienCreado.value
  if (!p?.prestamo) return null
  const prestamo = p.prestamo
  const plan = p.planPagos || []
  const monto = Number(prestamo.monto) || 0
  const interesTotalVal = Number(prestamo.interes_total) || 0
  const cuota = plan.length > 0 ? plan[0].valor_cuota : 0
  const totalAPagar = Math.round(monto + interesTotalVal)
  return {
    monto,
    nombreSocio: prestamo.socio_natillera?.socio?.nombre || 'Socio',
    interes: prestamo.interes,
    numero_cuotas: prestamo.numero_cuotas || 1,
    cuotaMensual: cuota,
    totalAPagar,
    interesTotal: interesTotalVal,
    planPagos: plan,
    fecha_pago: plan[0]?.fecha_proyectada || prestamo.created_at
  }
})

// Ticket del modal «Compartir por WhatsApp».
// Antes de crear → proyección (valores del formulario). Después de crear → comprobante real.
const esComprobanteRealCompartir = computed(() => !!prestamoRecienCreado.value)
const ticketCompartir = computed(() => {
  const creado = datosComprobanteCreado.value
  if (creado) {
    return {
      titulo: 'Comprobante de préstamo',
      subtituloDetalles: 'DETALLES DEL PRÉSTAMO',
      tituloPlan: 'PLAN DE PAGOS',
      etiquetaFechaPlan: 'Fecha de primera cuota',
      monto: creado.monto,
      nombreSocio: creado.nombreSocio,
      interes: creado.interes,
      numero_cuotas: creado.numero_cuotas,
      cuota: creado.cuotaMensual,
      totalAPagar: creado.totalAPagar,
      interesTotal: creado.interesTotal,
      fechaPrimera: creado.fecha_pago,
      plan: creado.planPagos
    }
  }
  return {
    titulo: 'Proyección de préstamo',
    subtituloDetalles: 'DETALLES PROYECTADOS',
    tituloPlan: 'PLAN DE PAGOS (PROYECTADO)',
    etiquetaFechaPlan: 'Fecha estimada de primera cuota',
    monto: parseFloat(formPrestamo.monto) || 0,
    nombreSocio: socioSeleccionado.value?.socio?.nombre,
    interes: formPrestamo.interes,
    numero_cuotas: formPrestamo.numero_cuotas || 1,
    cuota: cuotaMensual.value,
    totalAPagar: Math.round(montoTotal.value),
    interesTotal: interesTotal.value,
    fechaPrimera: formPrestamo.fecha_pago,
    plan: planPagosComprobanteNuevo.value
  }
})

// Sin scroll automático al cambiar tipo de interés o fecha: evitaba el salto y desmaquetado del modal

// Calcular cuota mensual para el detalle del préstamo
function calcularCuotaMensualDetalle(prestamo) {
  if (!prestamo) return 0
  const numeroCuotas = prestamo.numero_cuotas || 1
  const monto = prestamo.monto || 0
  const tasaMensual = (prestamo.interes || 0) / 100
  const cuotas = numeroCuotas
  
  // Calcular el total (capital + intereses) y dividir entre las cuotas
  // Tanto para interés anticipado como normal, la cuota incluye capital + intereses
  let interesTotal = 0
  if (prestamo.interes_anticipado && prestamo.interes_total) {
    // Si es interés anticipado, usar el interés_total guardado
    interesTotal = parseFloat(prestamo.interes_total) || 0
  } else {
    // Calcular el interés total
    if (prestamo.tipo_interes === 'compuesto') {
      const montoFinal = monto * Math.pow(1 + tasaMensual, cuotas)
      interesTotal = montoFinal - monto
    } else {
      interesTotal = monto * tasaMensual * cuotas
    }
  }
  
  const montoTotal = monto + interesTotal
  return montoTotal / numeroCuotas
}

// Calcular saldo inicial total (capital + intereses)
// Tanto para interés anticipado como normal, el total a pagar es monto + intereses
function calcularSaldoInicialTotal(prestamo) {
  if (!prestamo) return 0
  const monto = parseFloat(prestamo.monto || 0)
  const interesTotal = parseFloat(prestamo.interes_total || 0)
  return monto + interesTotal
}

// Calcular valor pagado a la fecha
function calcularValorPagadoDetalle(prestamo) {
  if (!prestamo) return 0
  const saldoInicialTotal = calcularSaldoInicialTotal(prestamo)
  const saldoActual = prestamo.saldo_actual || 0
  return saldoInicialTotal - saldoActual
}

// Porcentaje pagado (para la barra de progreso de la tarjeta)
function porcentajePagadoPrestamo(prestamo) {
  if (!prestamo) return 0
  if (prestamo.estado === 'pagado') return 100
  const total = calcularSaldoInicialTotal(prestamo)
  if (!total || total <= 0) return 0
  const pagado = calcularValorPagadoDetalle(prestamo)
  return Math.max(0, Math.min(100, Math.round((pagado / total) * 100)))
}

// ── Interés de mora ────────────────────────────────────────────────
// Mora de UNA cuota vencida: solo sobre el capital pendiente de esa cuota
// (no sobre el interés → sin anatocismo), proporcional a los días de atraso
// con base de 30 días. diasMora se cuenta desde el día siguiente al
// vencimiento hasta `fechaCorte` (hoy, o la fecha de pago al liquidar).
//   moraCuota = capitalPendienteCuota × (tasaMoraMensual/100/30) × diasMora
function calcularMoraCuota(cuota, tasaMora, fechaCorte) {
  const tasa = Number(tasaMora) || 0
  if (tasa <= 0 || !cuota) return 0
  const valorCuota = parseFloat(cuota.valor_cuota || 0)
  if (valorCuota <= 0) return 0
  const pendiente = Math.max(0, valorCuota - parseFloat(cuota.valor_pagado || 0))
  if (pendiente <= 0) return 0
  // Proporción de capital aún debida en esta cuota (excluye el interés)
  const capitalPendiente = parseFloat(cuota.capital || 0) * (pendiente / valorCuota)
  if (capitalPendiente <= 0) return 0
  const fv = parseDateLocal(cuota.fecha_proyectada)
  fv.setHours(0, 0, 0, 0)
  const corte = new Date(fechaCorte)
  corte.setHours(0, 0, 0, 0)
  const diasMora = Math.floor((corte - fv) / 86400000) // día siguiente al vencimiento = 1
  if (diasMora <= 0) return 0
  return capitalPendiente * (tasa / 100 / 30) * diasMora
}

// Mora acumulada de un préstamo = suma de la mora de sus cuotas vencidas.
function calcularMoraPrestamo(cuotasVencidasArray, tasaMora, fechaCorte) {
  return (cuotasVencidasArray || []).reduce(
    (sum, c) => sum + calcularMoraCuota(c, tasaMora, fechaCorte),
    0
  )
}

// Desglosa un abono en (mora, capital+interés) recorriendo las cuotas vencidas de la
// más antigua a la más nueva. Cada cuota "cuesta" pendiente + su mora; el pago cubre
// ese costo cuota por cuota (parcial proporcional en la última cuota alcanzada). Así la
// mora cobrada es PROPORCIONAL a la(s) cuota(s) que se pagan y coincide con el plan de
// pagos (pagar «valor_cuota + mora» de una cuota la liquida exacto). El excedente sobre
// las cuotas vencidas va al préstamo (cuotas futuras), sin mora.
function desglosarAbonoConMora(valor, cuotasVencidasOrdenadas, tasaMora, fechaCorte) {
  const total = parseFloat(valor) || 0
  let restante = total
  let mora = 0
  for (const c of (cuotasVencidasOrdenadas || [])) {
    if (restante <= 0) break
    const pendiente = Math.max(0, parseFloat(c.valor_cuota || 0) - parseFloat(c.valor_pagado || 0))
    if (pendiente <= 0) continue
    const moraC = calcularMoraCuota(c, tasaMora, fechaCorte)
    const costo = pendiente + moraC
    if (costo <= 0) continue
    if (restante >= costo) {
      mora += moraC
      restante -= costo
    } else {
      mora += moraC * (restante / costo)
      restante = 0
    }
  }
  const moraPagada = Math.round(mora)
  return { moraPagada, abonoAPrestamo: Math.max(0, Math.round(total - moraPagada)) }
}

// Registra en el fondo común (utilidades_clasificadas) el interés de mora COBRADO
// en un abono. Rubro separado (subtipo='mora', id_actividad=null → no se mezcla con
// el interés por préstamo ni con «Intereses ganados»). Se acumula por forma de pago
// (respetando el índice único de la tabla). NO modifica el saldo (no capitaliza).
async function registrarMoraCobradaEnFondo(natilleraId, montoMora, formaPago) {
  try {
    if (!natilleraId || !montoMora || montoMora <= 0) return
    const monto = Math.round(montoMora)

    const fpNorm = ['efectivo', 'transferencia', 'mixto'].includes((formaPago || '').toLowerCase())
      ? (formaPago || '').toLowerCase()
      : null

    let query = supabase
      .from('utilidades_clasificadas')
      .select('id, monto, detalles')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'prestamos')
      .is('id_actividad', null)
      .filter('detalles->>subtipo', 'eq', 'mora')
      .is('fecha_cierre', null)
    query = fpNorm != null ? query.eq('forma_pago', fpNorm) : query.is('forma_pago', null)
    const { data: filaMora } = await query.maybeSingle()

    if (filaMora) {
      await supabase
        .from('utilidades_clasificadas')
        .update({
          monto: parseFloat(filaMora.monto || 0) + monto,
          descripcion: 'Interés de mora de préstamos',
          detalles: { ...(filaMora.detalles || {}), subtipo: 'mora' },
          updated_at: new Date().toISOString()
        })
        .eq('id', filaMora.id)
    } else {
      await supabase
        .from('utilidades_clasificadas')
        .insert({
          natillera_id: natilleraId,
          tipo: 'prestamos',
          id_actividad: null,
          monto,
          fecha_cierre: null,
          forma_pago: fpNorm,
          descripcion: 'Interés de mora de préstamos',
          detalles: { subtipo: 'mora' }
        })
    }
  } catch (e) {
    console.error('Error registrando mora cobrada en el fondo:', e)
  }
}

// Calcular cuotas restantes
function calcularCuotasRestantes(prestamo) {
  if (!prestamo) return 0
  const cuotaMensual = calcularCuotaMensualDetalle(prestamo)
  if (cuotaMensual <= 0) return 0
  const saldoActual = prestamo.saldo_actual || 0
  const cuotasRestantes = Math.ceil(saldoActual / cuotaMensual)
  return cuotasRestantes
}

// Función para generar código único de comprobante
function generarCodigoComprobante() {
  // Generar código alfanumérico único: 8 caracteres
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

// Calcular interés generado para el detalle del préstamo
function calcularInteresGeneradoDetalle(prestamo) {
  if (!prestamo) return 0
  
  // Si es interés anticipado, usar el interés_total guardado
  if (prestamo.interes_anticipado && prestamo.interes_total) {
    return parseFloat(prestamo.interes_total) || 0
  }
  
  // Interés normal (mes vencido): el interés total del préstamo es monto * tasa * cuotas (simple) o compuesto
  // saldo_actual en BD es el saldo TOTAL a pagar (capital + interés), no solo capital, por eso no se puede
  // usar monto - saldo_actual para proporción. Mostramos el interés total del préstamo.
  const monto = parseFloat(prestamo.monto || 0)
  const tasaMensual = (prestamo.interes || 0) / 100
  const numeroCuotas = prestamo.numero_cuotas || 1
  
  if (prestamo.tipo_interes === 'compuesto') {
    const montoFinal = monto * Math.pow(1 + tasaMensual, numeroCuotas)
    return montoFinal - monto
  }
  return monto * tasaMensual * numeroCuotas
}

function seleccionarSocio(socio) {
  formPrestamo.socio_natillera_id = socio.id
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
}

function cerrarSelectorSocio() {
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
}

// formatDate se importa desde utils/formatDate.js con corrección de zona horaria

// Función auxiliar para recargar todos los planes de pagos
async function recargarTodosLosPlanesPagos() {
  try {
    const prestamoIds = prestamos.value.map(p => p.id)
    if (prestamoIds.length === 0) {
      todosLosPlanesPagos.value = []
      return
    }
    
    const { data: planPagos, error: planError } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .in('prestamo_id', prestamoIds)

    if (!planError && planPagos) {
      todosLosPlanesPagos.value = planPagos
    } else {
      todosLosPlanesPagos.value = []
    }
  } catch (e) {
    console.error('Error recargando planes de pagos:', e)
    todosLosPlanesPagos.value = []
  }
}

async function fetchPrestamos() {
  loading.value = true
  try {
    // Total de intereses del fondo: solo necesita el id de la natillera, así que se
    // dispara en paralelo con el resto de la cadena (no suma su latencia). No rechaza
    // (obtenerTotalInteresesPrestamos captura sus errores y devuelve 0).
    const totalInteresesPromise = obtenerTotalInteresesPrestamos(id)

    // Primero obtener los IDs de socios_natillera de esta natillera
    const { data: sociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(*)')
      .eq('natillera_id', id)

    if (!sociosNatillera || sociosNatillera.length === 0) {
      prestamos.value = []
      interesesGanadosUtilidades.value = await totalInteresesPromise
      return
    }

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    const { data, error } = await supabase
      .from('prestamos')
      .select('*, socio_natillera:socios_natillera(*, socio:socios(*))')
      .in('socio_natillera_id', socioNatilleraIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Obtener IDs de préstamos para cargar el plan de pagos
    const prestamoIds = (data || []).map(p => p.id)
    
    // Plan de pagos e historial de refinanciaciones EN PARALELO: ambos solo dependen
    // de prestamoIds. Antes eran dos round-trips secuenciales.
    let planPagosMap = {}
    let historialRefinanciacionesMap = {}
    todosLosPlanesPagos.value = []
    if (prestamoIds.length > 0) {
      const [planRes, historialRes] = await Promise.all([
        supabase
          .from('plan_pagos_prestamo')
          .select('*')
          .in('prestamo_id', prestamoIds),
        supabase
          .from('historial_refinanciaciones')
          .select('*')
          .in('prestamo_id', prestamoIds)
          .order('fecha_refinanciacion', { ascending: true }) // ascendente → primer registro = primera refinanciación
      ])

      const planPagos = !planRes.error ? planRes.data : null
      if (planPagos) {
        // Guardar todos los planes de pagos para calcular total pagado
        todosLosPlanesPagos.value = planPagos
        // Mapa por prestamo_id
        planPagosMap = planPagos.reduce((acc, cuota) => {
          if (!acc[cuota.prestamo_id]) acc[cuota.prestamo_id] = []
          acc[cuota.prestamo_id].push(cuota)
          return acc
        }, {})
      }

      const historialRefinanciaciones = !historialRes.error ? historialRes.data : null
      if (historialRefinanciaciones) {
        // Mapa por prestamo_id, guardando solo el primer registro (primera refinanciación)
        historialRefinanciacionesMap = historialRefinanciaciones.reduce((acc, historial) => {
          if (!acc[historial.prestamo_id]) acc[historial.prestamo_id] = historial
          return acc
        }, {})
      }
    }

    // Combinar con datos del socio y verificar cuotas vencidas
    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    // Cargar el monto total de utilidades_clasificadas para préstamos
    // Sumar todos los registros individuales por préstamo
    const totalIntereses = await totalInteresesPromise
    interesesGanadosUtilidades.value = totalIntereses

    prestamos.value = (data || []).map(prestamo => {
      // Usar la relación cargada o buscar en el array como fallback
      const socioNatillera = prestamo.socio_natillera || sociosNatillera.find(s => s.id === prestamo.socio_natillera_id)
      const planPagosPrestamo = planPagosMap[prestamo.id] || []
      
      // Obtener el historial de refinanciación si existe
      const historialRefinanciacion = historialRefinanciacionesMap[prestamo.id]
      
      // Si hay historial y el préstamo tenía interés anticipado, guardar el interés total original
      // para usarlo en el cálculo de intereses ganados
      const interesTotalOriginalParaInteresesGanados = historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior && historialRefinanciacion.interes_total_anterior
        ? parseFloat(historialRefinanciacion.interes_total_anterior)
        : null
      
      // Filtrar cuotas vencidas (no pagadas y con fecha anterior a hoy)
      const cuotasVencidasArray = planPagosPrestamo.filter(cuota => {
        const fechaVencimiento = parseDateLocal(cuota.fecha_proyectada)
        fechaVencimiento.setHours(0, 0, 0, 0)
        return !cuota.pagada && fechaVencimiento < fechaActual
      })

      // Verificar si tiene cuotas vencidas
      const tieneCuotasVencidas = cuotasVencidasArray.length > 0

      // Contar cuántas cuotas vencidas tiene
      const cuotasVencidas = cuotasVencidasArray.length

      // Calcular días de mora (desde la cuota más antigua vencida)
      let diasMora = 0
      let valorCuotasEnDeuda = 0
      let valorUnaCuotaVencida = 0
      let fechaPagoCuotaVencida = null
      
      if (cuotasVencidasArray.length > 0) {
        // Ordenar por fecha para obtener la más antigua
        const cuotaMasAntigua = cuotasVencidasArray.sort((a, b) => 
          parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada)
        )[0]
        
        const fechaVencimientoMasAntigua = parseDateLocal(cuotaMasAntigua.fecha_proyectada)
        fechaVencimientoMasAntigua.setHours(0, 0, 0, 0)
        
        // Calcular días de diferencia
        const diffTime = fechaActual - fechaVencimientoMasAntigua
        diasMora = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        // Sumar valor de todas las cuotas vencidas, restando lo ya pagado
        valorCuotasEnDeuda = cuotasVencidasArray.reduce((sum, cuota) => {
          const valorCuota = parseFloat(cuota.valor_cuota || 0)
          const valorPagado = parseFloat(cuota.valor_pagado || 0)
          const valorPendiente = valorCuota - valorPagado
          return sum + Math.max(0, valorPendiente) // Asegurar que no sea negativo
        }, 0)
        
        // Valor de una cuota vencida (la más antigua)
        valorUnaCuotaVencida = cuotaMasAntigua.valor_cuota || 0
        
        // Fecha de pago de la cuota vencida más antigua
        fechaPagoCuotaVencida = cuotaMasAntigua.fecha_proyectada
      }

      // Determinar si el préstamo inicial fue con interés anticipado
      const tieneInteresAnticipadoInicial = historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior !== undefined
        ? historialRefinanciacion.interes_anticipado_anterior
        : prestamo.interes_anticipado || false

      // Calcular intereses de cuotas pagadas si el préstamo inicial fue con interés anticipado
      let interesesCuotasPagadas = 0
      if (tieneInteresAnticipadoInicial && historialRefinanciacion) {
        // Si fue refinanciado y inicialmente fue con interés anticipado, usar intereses de cuotas pagadas
        const cuotasPagadas = planPagosPrestamo.filter(c => c.pagada)
        interesesCuotasPagadas = cuotasPagadas.reduce((sum, cuota) => sum + (parseFloat(cuota.interes || 0)), 0)
      }

      // Interés de mora acumulado a hoy (solo capital pendiente, por cuota vencida)
      const moraAcumulada = Math.round(
        calcularMoraPrestamo(cuotasVencidasArray, reglasInteresNatillera.value.tasa_mora, fechaActual)
      )
      // Cuotas vencidas (de la más antigua a la más nueva) para desglosar el abono con mora
      const cuotasVencidasOrdenadas = [...cuotasVencidasArray]
        .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
        .map(c => ({ valor_cuota: c.valor_cuota, valor_pagado: c.valor_pagado, capital: c.capital, fecha_proyectada: c.fecha_proyectada }))

      return {
        ...prestamo,
        socio_natillera: socioNatillera,
        tieneCuotasVencidas,
        cuotasVencidas,
        diasMora,
        valorCuotasEnDeuda,
        moraAcumulada,
        cuotasVencidasOrdenadas,
        valorUnaCuotaVencida,
        fechaPagoCuotaVencida,
        // Guardar el interés total original para el cálculo de intereses ganados
        // (solo si fue refinanciado con interés anticipado)
        interes_total_original: interesTotalOriginalParaInteresesGanados,
        // Guardar si el préstamo inicial fue con interés anticipado
        tiene_interes_anticipado_inicial: tieneInteresAnticipadoInicial,
        // Guardar intereses de cuotas pagadas para préstamos refinanciados con interés anticipado inicial
        intereses_cuotas_pagadas: interesesCuotasPagadas
      }
    })
  } catch (e) {
    console.error('Error cargando préstamos:', e)
  } finally {
    loading.value = false
    cargaInicial.value = false
  }
}

async function fetchSocios() {
  try {
    const { data, error } = await supabase
      .from('socios_natillera')
      .select(`*, socio:socios(*)`)
      .eq('natillera_id', id)
      .eq('estado', 'activo')

    if (error) throw error
    socios.value = data || []
  } catch (e) {
    console.error('Error cargando socios:', e)
  }
}

// Función para actualizar un préstamo específico en la lista con toda su información
async function actualizarPrestamoEnLista(prestamoId) {
  try {
    // Obtener el préstamo actualizado de la base de datos
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .select('*')
      .eq('id', prestamoId)
      .single()

    if (errorPrestamo || !prestamoActualizado) {
      console.error('Error obteniendo préstamo actualizado:', errorPrestamo)
      return
    }

    // Obtener el plan de pagos del préstamo
    const { data: planPagos, error: errorPlan } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorPlan) {
      console.error('Error obteniendo plan de pagos:', errorPlan)
      return
    }

    const planPagosPrestamo = planPagos || []

    // Obtener el socio_natillera
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(*)')
      .eq('id', prestamoActualizado.socio_natillera_id)
      .single()

    // Calcular información de cuotas vencidas
    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    const cuotasVencidasArray = planPagosPrestamo.filter(cuota => {
      const fechaVencimiento = parseDateLocal(cuota.fecha_proyectada)
      fechaVencimiento.setHours(0, 0, 0, 0)
      return !cuota.pagada && fechaVencimiento < fechaActual
    })

    const tieneCuotasVencidas = cuotasVencidasArray.length > 0
    const cuotasVencidas = cuotasVencidasArray.length

    // Calcular días de mora (desde la cuota más antigua vencida)
    let diasMora = 0
    let valorCuotasEnDeuda = 0
    let valorUnaCuotaVencida = 0
    let fechaPagoCuotaVencida = null

    if (cuotasVencidasArray.length > 0) {
      // Ordenar por fecha para obtener la más antigua
      const cuotaMasAntigua = cuotasVencidasArray.sort((a, b) => 
        parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada)
      )[0]

      const fechaVencimientoMasAntigua = parseDateLocal(cuotaMasAntigua.fecha_proyectada)
      fechaVencimientoMasAntigua.setHours(0, 0, 0, 0)

      // Calcular días de diferencia
      const diffTime = fechaActual - fechaVencimientoMasAntigua
      diasMora = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      // Sumar valor de todas las cuotas vencidas, restando lo ya pagado
      valorCuotasEnDeuda = cuotasVencidasArray.reduce((sum, cuota) => {
        const valorCuota = parseFloat(cuota.valor_cuota || 0)
        const valorPagado = parseFloat(cuota.valor_pagado || 0)
        const valorPendiente = valorCuota - valorPagado
        return sum + Math.max(0, valorPendiente) // Asegurar que no sea negativo
      }, 0)
      
      // Valor de una cuota vencida (la más antigua)
      valorUnaCuotaVencida = cuotaMasAntigua.valor_cuota || 0
      
      // Fecha de pago de la cuota vencida más antigua
      fechaPagoCuotaVencida = cuotaMasAntigua.fecha_proyectada
    }

    // Obtener historial de refinanciaciones si existe
    let historialRefinanciacion = null
    try {
      const { data: historial } = await supabase
        .from('historial_refinanciaciones')
        .select('*')
        .eq('prestamo_id', prestamoId)
        .order('fecha_refinanciacion', { ascending: false })
        .limit(1)
        .single()
      
      if (historial) {
        historialRefinanciacion = historial
      }
    } catch (e) {
      // No hay historial, continuar sin él
    }

    // Determinar si el préstamo inicial fue con interés anticipado
    const tieneInteresAnticipadoInicial = historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior !== undefined
      ? historialRefinanciacion.interes_anticipado_anterior
      : prestamoActualizado.interes_anticipado || false

    // Calcular intereses de cuotas pagadas si el préstamo inicial fue con interés anticipado
    let interesesCuotasPagadas = 0
    if (tieneInteresAnticipadoInicial && historialRefinanciacion) {
      const cuotasPagadas = planPagosPrestamo.filter(c => c.pagada)
      interesesCuotasPagadas = cuotasPagadas.reduce((sum, cuota) => sum + (parseFloat(cuota.interes || 0)), 0)
    }

    // Calcular interés total original para intereses ganados
    let interesTotalOriginalParaInteresesGanados = null
    if (historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior && historialRefinanciacion.interes_total_anterior) {
      interesTotalOriginalParaInteresesGanados = parseFloat(historialRefinanciacion.interes_total_anterior)
    }

    // Actualizar el préstamo en la lista
    const index = prestamos.value.findIndex(p => p.id === prestamoId)
    if (index !== -1) {
      prestamos.value[index] = {
        ...prestamoActualizado,
        socio_natillera: socioNatillera,
        tieneCuotasVencidas,
        cuotasVencidas,
        diasMora,
        valorCuotasEnDeuda,
        moraAcumulada: Math.round(
          calcularMoraPrestamo(cuotasVencidasArray, reglasInteresNatillera.value.tasa_mora, fechaActual)
        ),
        cuotasVencidasOrdenadas: [...cuotasVencidasArray]
          .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
          .map(c => ({ valor_cuota: c.valor_cuota, valor_pagado: c.valor_pagado, capital: c.capital, fecha_proyectada: c.fecha_proyectada })),
        valorUnaCuotaVencida,
        fechaPagoCuotaVencida,
        // Guardar el interés total original para el cálculo de intereses ganados
        interes_total_original: interesTotalOriginalParaInteresesGanados,
        // Guardar si el préstamo inicial fue con interés anticipado
        interes_anticipado_inicial: tieneInteresAnticipadoInicial,
        // Guardar intereses de cuotas pagadas
        intereses_cuotas_pagadas: interesesCuotasPagadas
      }
    }
  } catch (e) {
    console.error('Error actualizando préstamo en lista:', e)
  }
}

function abrirModalAbono(prestamo) {
  prestamoSeleccionado.value = prestamo
  // Valor sugerido: si hay cuotas vencidas, la más antigua (pendiente + su mora) para
  // liquidarla exacto según el plan; si no, la cuota estándar acotada al saldo.
  const overdue = prestamo.cuotasVencidasOrdenadas || []
  let valorInicial
  if (overdue.length > 0) {
    const c0 = overdue[0]
    const pend = Math.max(0, (parseFloat(c0.valor_cuota) || 0) - (parseFloat(c0.valor_pagado) || 0))
    const mora0 = calcularMoraCuota(c0, reglasInteresNatillera.value.tasa_mora, new Date())
    valorInicial = Math.round(pend + mora0)
  } else {
    const valorCuota = calcularCuotaMensualDetalle(prestamo)
    valorInicial = Math.round(valorCuota > prestamo.saldo_actual ? prestamo.saldo_actual : valorCuota)
  }
  formAbono.valor = valorInicial
  formAbono.fecha_pago = getCurrentDateISO() // Fecha actual por defecto
  valorAbonoFormateado.value = formatMoney(valorInicial)
  modalAbono.value = true
  // Guardar si el modal de detalle estaba abierto para este préstamo
  if (prestamoDetalle.value && prestamoDetalle.value.id === prestamo.id) {
    // No cerrar el modal de detalle, solo abrir el modal de abono encima
  }
}

function actualizarValorAbono(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    formAbono.valor = 0
    valorAbonoFormateado.value = ''
    return
  }
  
  const valorNumerico = parseInt(valorSinFormato)
  if (isNaN(valorNumerico)) return
  
  // Actualizar el valor numérico
  formAbono.valor = valorNumerico
  
  // Formatear el valor con puntos
  valorAbonoFormateado.value = formatMoney(valorNumerico)
}

function cerrarModalAbono() {
  modalAbono.value = false
  formAbono.valor = 0
  formAbono.fecha_pago = getCurrentDateISO()
  formAbono.tipo_pago = 'efectivo'
  formAbono.valor_efectivo = 0
  formAbono.valor_transferencia = 0
  valorAbonoFormateado.value = ''
  prestamoSeleccionado.value = null
  clearPrestamosWorkDraft()
  if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
}

async function abrirModalRefinanciar(prestamo) {
  prestamoSeleccionado.value = prestamo
  
  // Obtener la primera fecha del préstamo (fecha_inicio o primera cuota del plan de pagos)
  let primeraFecha = null
  
  if (prestamo.fecha_inicio) {
    primeraFecha = prestamo.fecha_inicio
  } else {
    // Buscar la primera cuota del plan de pagos
    try {
      const { data: planPagos } = await supabase
        .from('plan_pagos_prestamo')
        .select('fecha_proyectada')
        .eq('prestamo_id', prestamo.id)
        .order('numero_cuota', { ascending: true })
        .limit(1)
        .single()
      
      if (planPagos && planPagos.fecha_proyectada) {
        primeraFecha = planPagos.fecha_proyectada
      }
    } catch (e) {
      console.error('Error obteniendo primera fecha:', e)
    }
  }
  
  // Si no hay primera fecha, usar created_at o fecha actual
  if (!primeraFecha) {
    primeraFecha = prestamo.created_at ? prestamo.created_at.split('T')[0] : getCurrentDateISO()
  } else {
    // Asegurar formato YYYY-MM-DD
    primeraFecha = primeraFecha.split('T')[0]
  }
  
  formRefinanciar.fecha_pago = primeraFecha
  formRefinanciar.numero_cuotas_nuevo = prestamo.numero_cuotas || null // Por defecto el mismo número de cuotas
  formRefinanciar.tipo_interes_nuevo = prestamo.tipo_interes || 'simple'
  formRefinanciar.interes_nuevo = prestamo.interes || null // Cargar la tasa original por defecto
  formRefinanciar.tabActual = 'refinanciar' // Por defecto mostrar tab de refinanciación
  
  modalRefinanciar.value = true
}

function cerrarModalRefinanciar() {
  modalRefinanciar.value = false
  formRefinanciar.fecha_pago = getCurrentDateISO()
  formRefinanciar.numero_cuotas_nuevo = null
  formRefinanciar.tipo_interes_nuevo = 'simple'
  formRefinanciar.interes_nuevo = null
  formRefinanciar.tabActual = 'refinanciar'
  prestamoSeleccionado.value = null
  if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
}

// Genera la imagen del comprobante capturando el ticket del DOM (#comprobante-abono)
// con toPng. Así el preview y la imagen descargada/compartida son idénticos.
// Devuelve un <canvas> para no cambiar los callers (toDataURL / toBlob).
function generarImagenComprobanteAbono() {
  return new Promise((resolve) => {
    try {
      if (!comprobanteAbono.value || !comprobanteRef.value) {
        resolve(null)
        return
      }

      // #eef1f4 = fondo neutro claro: iguala el fondo del modal y las muescas del
      // ticket, de modo que el corte perforado se ve limpio en la imagen final.
      toPng(comprobanteRef.value, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#eef1f4',
      })
        .then((dataUrl) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            resolve(canvas)
          }
          img.onerror = () => resolve(null)
          img.src = dataUrl
        })
        .catch((e) => {
          console.error('Error generando imagen del comprobante:', e)
          resolve(null)
        })
    } catch (e) {
      console.error('Error generando imagen del comprobante:', e)
      resolve(null)
    }
  })
}

async function descargarComprobanteAbono() {
  if (!comprobanteAbono.value) {
    notificationStore.error('El comprobante no está listo. Intenta de nuevo.', 'Error')
    return
  }
  
  generandoImagenComprobante.value = true
  
  try {
    const canvas = await generarImagenComprobanteAbono()
    
    if (!canvas) {
      throw new Error('No se pudo generar el canvas')
    }
    
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `comprobante-abono-${comprobanteAbono.value?.socioNombre?.replace(/\s+/g, '-') || 'abono'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    notificationStore.success('Comprobante descargado exitosamente', 'Éxito')
    
    // Registrar auditoría de descarga de comprobante
    if (comprobanteAbono.value?.pagoPrestamoId) {
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrar({
        tipoAccion: 'DOWNLOAD',
        entidad: 'comprobante',
        entidadId: comprobanteAbono.value.pagoPrestamoId,
        descripcion: `Se descargó comprobante de abono a préstamo de ${comprobanteAbono.value.socioNombre || 'socio'} (Código: ${comprobanteAbono.value.codigoComprobante || 'N/A'})`,
        natilleraId: id,
        detalles: {
          tipo_comprobante: 'abono_prestamo',
          codigo_comprobante: comprobanteAbono.value.codigoComprobante,
          socio_nombre: comprobanteAbono.value.socioNombre,
          valor: comprobanteAbono.value.valor,
          prestamo_id: comprobanteAbono.value.prestamoId
        }
      }))
    }
  } catch (e) {
    console.error('Error al generar imagen:', e)
    notificationStore.error('Error al generar la imagen: ' + e.message, 'Error')
  } finally {
    generandoImagenComprobante.value = false
  }
}

async function reenviarComprobanteAbono(pago) {
  if (!pago || !pago.codigo_comprobante) {
    notificationStore.error('Este abono no tiene código de comprobante', 'Error')
    return
  }
  
  if (!prestamoDetalle.value) {
    notificationStore.error('No hay préstamo seleccionado', 'Error')
    return
  }
  
  try {
    // Obtener información completa del préstamo para calcular saldos
    const prestamo = prestamoDetalle.value
    const socioNombre = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = prestamo.socio_natillera?.socio?.telefono || null
    
    // Calcular saldo anterior (sumando el valor del abono al saldo actual)
    const saldoAnterior = (prestamo.saldo_actual || 0) + (parseFloat(pago.valor) || 0)
    const saldoNuevo = prestamo.saldo_actual || 0
    
    // Preparar datos del comprobante
    comprobanteAbono.value = {
      pagoPrestamoId: pago.id, // ID del pago de préstamo para auditoría
      prestamoId: prestamo.id, // ID del préstamo para auditoría
      valor: parseFloat(pago.valor) || 0,
      codigoComprobante: pago.codigo_comprobante,
      socioNombre: socioNombre,
      socioTelefono: socioTelefono,
      fecha: pago.fecha 
        ? (() => {
            const d = new Date(pago.fecha)
            const day = String(d.getDate()).padStart(2, '0')
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const year = d.getFullYear()
            const hours = String(d.getHours()).padStart(2, '0')
            const minutes = String(d.getMinutes()).padStart(2, '0')
            return `${day}/${month}/${year} ${hours}:${minutes}`
          })()
        : 'Fecha no disponible',
      saldoAnterior: saldoAnterior,
      saldoNuevo: saldoNuevo,
      prestamo: prestamo
    }
    
    // Registrar auditoría de reenvío de comprobante
    const auditoria = useAuditoria()
    registrarAuditoriaEnSegundoPlano(auditoria.registrar({
      tipoAccion: 'RESEND',
      entidad: 'comprobante',
      entidadId: pago.id,
      descripcion: `Se reenvió comprobante de abono a préstamo de ${socioNombre || 'socio'} (Código: ${pago.codigo_comprobante || 'N/A'})`,
      natilleraId: id,
      detalles: {
        tipo_comprobante: 'abono_prestamo',
        codigo_comprobante: pago.codigo_comprobante,
        socio_nombre: socioNombre,
        valor: parseFloat(pago.valor) || 0,
        prestamo_id: prestamo.id
      }
    }))
    
    // Abrir modal de comprobante
    modalComprobanteAbono.value = true
  } catch (e) {
    console.error('Error al preparar comprobante:', e)
    notificationStore.error('Error al preparar el comprobante: ' + e.message, 'Error')
  }
}

async function compartirWhatsAppAbono() {
  if (!comprobanteAbono.value) return
  
  generandoImagenComprobante.value = true
  
  try {
    const canvas = await generarImagenComprobanteAbono()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    
    // Incluir el nombre del socio en el nombre del archivo para mejor identificación
    const nombreArchivo = `comprobante-abono-${comprobanteAbono.value.socioNombre?.replace(/\s+/g, '-') || 'abono'}-${Date.now()}.png`
    const archivo = new File([blob], nombreArchivo, { type: 'image/png' })
    
    // Crear mensaje con el nombre del socio
    const mensajeCompartir = `Hola ${comprobanteAbono.value.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo en la natillera.\n\n¡Gracias por estar al día! 🙌`
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: `Comprobante de Abono - ${comprobanteAbono.value.socioNombre}`,
        text: mensajeCompartir
      })
      
      // Registrar auditoría de envío de comprobante
      if (comprobanteAbono.value?.pagoPrestamoId) {
        const auditoria = useAuditoria()
        registrarAuditoriaEnSegundoPlano(auditoria.registrar({
          tipoAccion: 'SEND',
          entidad: 'comprobante',
          entidadId: comprobanteAbono.value.pagoPrestamoId,
          descripcion: `Se envió comprobante de abono a préstamo por WhatsApp a ${comprobanteAbono.value.socioNombre || 'socio'} (Código: ${comprobanteAbono.value.codigoComprobante || 'N/A'})`,
          natilleraId: id,
          detalles: {
            tipo_comprobante: 'abono_prestamo',
            metodo_envio: 'whatsapp',
            codigo_comprobante: comprobanteAbono.value.codigoComprobante,
            socio_nombre: comprobanteAbono.value.socioNombre,
            socio_telefono: comprobanteAbono.value.socioTelefono,
            valor: comprobanteAbono.value.valor,
            prestamo_id: comprobanteAbono.value.prestamoId
          }
        }))
      }
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `comprobante-abono-${comprobanteAbono.value.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = comprobanteAbono.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${comprobanteAbono.value.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo. ¡Gracias por estar al día! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
          
          // Registrar auditoría de envío de comprobante (fallback)
          if (comprobanteAbono.value?.pagoPrestamoId) {
            const auditoria = useAuditoria()
            registrarAuditoriaEnSegundoPlano(auditoria.registrar({
              tipoAccion: 'SEND',
              entidad: 'comprobante',
              entidadId: comprobanteAbono.value.pagoPrestamoId,
              descripcion: `Se envió comprobante de abono a préstamo por WhatsApp (fallback) a ${comprobanteAbono.value.socioNombre || 'socio'} (Código: ${comprobanteAbono.value.codigoComprobante || 'N/A'})`,
              natilleraId: id,
              detalles: {
                tipo_comprobante: 'abono_prestamo',
                metodo_envio: 'whatsapp_fallback',
                codigo_comprobante: comprobanteAbono.value.codigoComprobante,
                socio_nombre: comprobanteAbono.value.socioNombre,
                socio_telefono: comprobanteAbono.value.socioTelefono,
                valor: comprobanteAbono.value.valor,
                prestamo_id: comprobanteAbono.value.prestamoId
              }
            }))
          }
        }
      }, 500)
    }
  } catch (e) {
    console.error('Error compartiendo por WhatsApp:', e)
    // Si falla el share API, intentar abrir WhatsApp directamente
    const telefono = comprobanteAbono.value.socioTelefono?.replace(/\D/g, '')
    if (telefono) {
      const mensaje = `Hola ${comprobanteAbono.value.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo en la natillera.\n\n¡Gracias por estar al día! 🙌`
      window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      
      // Registrar auditoría de envío de comprobante (solo texto)
      if (comprobanteAbono.value?.pagoPrestamoId) {
        const auditoria = useAuditoria()
        registrarAuditoriaEnSegundoPlano(auditoria.registrar({
          tipoAccion: 'SEND',
          entidad: 'comprobante',
          entidadId: comprobanteAbono.value.pagoPrestamoId,
          descripcion: `Se envió comprobante de abono a préstamo por WhatsApp (solo texto) a ${comprobanteAbono.value.socioNombre || 'socio'} (Código: ${comprobanteAbono.value.codigoComprobante || 'N/A'})`,
          natilleraId: id,
          detalles: {
            tipo_comprobante: 'abono_prestamo',
            metodo_envio: 'whatsapp_texto',
            codigo_comprobante: comprobanteAbono.value.codigoComprobante,
            socio_nombre: comprobanteAbono.value.socioNombre,
            socio_telefono: comprobanteAbono.value.socioTelefono,
            valor: comprobanteAbono.value.valor,
            prestamo_id: comprobanteAbono.value.prestamoId
          }
        }))
      }
    } else {
      notificationStore.error('No se pudo compartir el comprobante', 'Error')
    }
  } finally {
    generandoImagenComprobante.value = false
  }
}

// ============================================================
// Comprobante de PRÉSTAMO PAGADO (total pagado + lista de abonos)
// ============================================================
async function enviarComprobantePagado(prestamo) {
  if (!prestamo) return
  try {
    const socioNombre = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = prestamo.socio_natillera?.socio?.telefono || null

    // Abonos reales del préstamo (más antiguos primero para leer el historial en orden)
    const { data, error } = await supabase
      .from('pagos_prestamo')
      .select('id, valor, fecha, codigo_comprobante')
      .eq('prestamo_id', prestamo.id)
      .order('fecha', { ascending: true })
    if (error) throw error

    const abonos = (data || []).map(p => ({
      valor: parseFloat(p.valor) || 0,
      fecha: p.fecha ? formatDate(p.fecha) : 'Sin fecha',
    }))
    const totalPagado = abonos.reduce((s, a) => s + a.valor, 0)

    comprobantePagado.value = {
      prestamoId: prestamo.id,
      natilleraNombre: prestamo.nombre_natillera || 'Natillera',
      socioNombre,
      socioTelefono,
      montoPrestamo: parseFloat(prestamo.monto) || 0,
      totalPagado,
      numAbonos: abonos.length,
      abonos,
      fecha: abonos.length ? abonos[abonos.length - 1].fecha : formatDate(new Date().toISOString()),
    }
    modalComprobantePagado.value = true

    // Auditoría (mismo patrón que el comprobante de abono)
    const auditoria = useAuditoria()
    registrarAuditoriaEnSegundoPlano(auditoria.registrar({
      tipoAccion: 'VIEW',
      entidad: 'comprobante',
      entidadId: prestamo.id,
      descripcion: `Se abrió comprobante de préstamo pagado de ${socioNombre} (Total: $${totalPagado})`,
      natilleraId: id,
      detalles: {
        tipo_comprobante: 'prestamo_pagado',
        socio_nombre: socioNombre,
        total_pagado: totalPagado,
        num_abonos: abonos.length,
        prestamo_id: prestamo.id,
      },
    }))
  } catch (e) {
    console.error('Error preparando comprobante de préstamo pagado:', e)
    notificationStore.error('No se pudo preparar el comprobante: ' + e.message, 'Error')
  }
}

function generarImagenComprobantePagado() {
  return new Promise((resolve) => {
    try {
      if (!comprobantePagado.value || !comprobantePagadoRef.value) {
        resolve(null)
        return
      }
      toPng(comprobantePagadoRef.value, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#eef1f4',
      })
        .then((dataUrl) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            resolve(canvas)
          }
          img.onerror = () => resolve(null)
          img.src = dataUrl
        })
        .catch((e) => {
          console.error('Error generando imagen del comprobante pagado:', e)
          resolve(null)
        })
    } catch (e) {
      console.error('Error generando imagen del comprobante pagado:', e)
      resolve(null)
    }
  })
}

async function descargarComprobantePagado() {
  if (!comprobantePagado.value) {
    notificationStore.error('El comprobante no está listo. Intenta de nuevo.', 'Error')
    return
  }
  generandoImagenComprobantePagado.value = true
  try {
    const canvas = await generarImagenComprobantePagado()
    if (!canvas) throw new Error('No se pudo generar el canvas')
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `comprobante-pagado-${comprobantePagado.value?.socioNombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notificationStore.success('Comprobante descargado exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error al generar imagen:', e)
    notificationStore.error('Error al generar la imagen: ' + e.message, 'Error')
  } finally {
    generandoImagenComprobantePagado.value = false
  }
}

async function compartirWhatsAppComprobantePagado() {
  if (!comprobantePagado.value) return
  generandoImagenComprobantePagado.value = true
  try {
    const canvas = await generarImagenComprobantePagado()
    if (!canvas) throw new Error('No se pudo generar la imagen')

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    const nombreArchivo = `comprobante-pagado-${comprobantePagado.value.socioNombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
    const archivo = new File([blob], nombreArchivo, { type: 'image/png' })
    const mensajeCompartir = `¡Felicidades ${comprobantePagado.value.socioNombre}! 🎉\n\nTu préstamo en la natillera quedó *totalmente pagado*. Te envío el comprobante.\n\n¡Gracias por tu compromiso! 🙌`

    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: `Comprobante de préstamo pagado - ${comprobantePagado.value.socioNombre}`,
        text: mensajeCompartir,
      })
    } else {
      const link = document.createElement('a')
      link.download = nombreArchivo
      link.href = canvas.toDataURL('image/png')
      link.click()
      setTimeout(() => {
        const telefono = comprobantePagado.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensajeCompartir)}`, '_blank')
        }
      }, 500)
    }

    // Auditoría de envío
    const auditoria = useAuditoria()
    registrarAuditoriaEnSegundoPlano(auditoria.registrar({
      tipoAccion: 'SEND',
      entidad: 'comprobante',
      entidadId: comprobantePagado.value.prestamoId,
      descripcion: `Se envió comprobante de préstamo pagado por WhatsApp a ${comprobantePagado.value.socioNombre}`,
      natilleraId: id,
      detalles: {
        tipo_comprobante: 'prestamo_pagado',
        metodo_envio: 'whatsapp',
        socio_nombre: comprobantePagado.value.socioNombre,
        socio_telefono: comprobantePagado.value.socioTelefono,
        total_pagado: comprobantePagado.value.totalPagado,
        prestamo_id: comprobantePagado.value.prestamoId,
      },
    }))
  } catch (e) {
    if (e?.name !== 'AbortError') {
      console.error('Error compartiendo comprobante pagado:', e)
      notificationStore.error('No se pudo compartir el comprobante', 'Error')
    }
  } finally {
    generandoImagenComprobantePagado.value = false
  }
}

async function abrirModalDetalle(prestamo) {
  // Cerrar el desplegable antes de abrir el modal
  planPagosExpandido.value = false
  prestamoDetalle.value = prestamo
  modalDetalle.value = true
  await Promise.all([
    fetchPagosPrestamo(prestamo.id),
    fetchPlanPagosPrestamo(prestamo.id),
    fetchHistorialRefinanciaciones(prestamo.id)
  ])
}

// Abonos que quedaron asociados (cerrados) por una refinanciación concreta.
function abonosDeRefinanciacion(refinanciacionId) {
  return pagosPrestamo.value.filter(p => p.refinanciacion_id === refinanciacionId)
}

// Mostrar/ocultar el desplegable de abonos de una refinanciación en el detalle.
function toggleHistorialAbonos(refinanciacionId) {
  const set = new Set(historialAbonosExpandido.value)
  if (set.has(refinanciacionId)) {
    set.delete(refinanciacionId)
  } else {
    set.add(refinanciacionId)
  }
  historialAbonosExpandido.value = set
}

// Mostrar/ocultar el desplegable del plan de pagos anterior de una refinanciación.
function toggleHistorialPlan(refinanciacionId) {
  const set = new Set(historialPlanExpandido.value)
  if (set.has(refinanciacionId)) {
    set.delete(refinanciacionId)
  } else {
    set.add(refinanciacionId)
  }
  historialPlanExpandido.value = set
}

async function fetchHistorialRefinanciaciones(prestamoId) {
  try {
    const { data, error } = await supabase
      .from('historial_refinanciaciones')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha_refinanciacion', { ascending: false })

    if (error) {
      console.error('❌ Error cargando historial de refinanciaciones:', error)
      historialRefinanciaciones.value = []
      return
    }
    
    historialRefinanciaciones.value = data || []
  } catch (e) {
    console.error('❌ Error cargando historial de refinanciaciones:', e)
    historialRefinanciaciones.value = []
  }
}

async function fetchPagosPrestamo(prestamoId) {
  try {
    console.log('🔍 Buscando pagos para préstamo:', prestamoId)
    const { data, error } = await supabase
      .from('pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha', { ascending: false })

    if (error) {
      console.error('❌ Error en la consulta:', error)
      throw error
    }
    
    console.log('✅ Pagos encontrados:', data)
    pagosPrestamo.value = data || []
    console.log('📋 pagosPrestamo.value actualizado:', pagosPrestamo.value)
  } catch (e) {
    console.error('❌ Error cargando pagos del préstamo:', e)
    pagosPrestamo.value = []
  }
}

async function fetchPlanPagosPrestamo(prestamoId) {
  try {
    const { data, error } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (error) {
      console.error('❌ Error cargando plan de pagos:', error)
      planPagosPrestamo.value = []
      return
    }
    
    planPagosPrestamo.value = data || []
  } catch (e) {
    console.error('❌ Error cargando plan de pagos:', e)
    planPagosPrestamo.value = []
  }
}

// Función para aplicar abono a la primera cuota pendiente del plan de pagos
async function aplicarAbonoAPlanPagos(prestamoId, valorAbono, fechaPago) {
  try {
    // Obtener todas las cuotas ordenadas por número
    const { data: todasCuotas, error: errorCuotas } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorCuotas) {
      console.error('❌ Error obteniendo cuotas:', errorCuotas)
      return
    }

    // Filtrar cuotas que aún tienen saldo pendiente (no pagadas completamente)
    const cuotasPendientes = todasCuotas.filter(c => {
      const valorCuota = parseFloat(c.valor_cuota)
      const valorPagado = parseFloat(c.valor_pagado || 0)
      return valorPagado < valorCuota
    })

    if (errorCuotas) {
      console.error('❌ Error obteniendo cuotas pendientes:', errorCuotas)
      return
    }

    if (!cuotasPendientes || cuotasPendientes.length === 0) {
      console.log('ℹ️ No hay cuotas pendientes para aplicar el abono')
      return
    }

    let abonoRestante = parseFloat(valorAbono)
    let indiceCuota = 0

    // Aplicar el abono a las cuotas pendientes hasta que se agote
    while (abonoRestante > 0 && indiceCuota < cuotasPendientes.length) {
      const cuota = cuotasPendientes[indiceCuota]
      const valorCuota = parseFloat(cuota.valor_cuota)
      const valorPagadoActual = parseFloat(cuota.valor_pagado || 0)
      const valorRestanteCuota = valorCuota - valorPagadoActual
      
      if (abonoRestante >= valorRestanteCuota) {
        // El abono cubre completamente el resto de esta cuota
        // mes, anio, quincena según fecha_proyectada (periodo de vencimiento)
        const periodo = periodoDesdeFechaProyectada(cuota.fecha_proyectada)
        const { error: errorUpdate } = await supabase
          .from('plan_pagos_prestamo')
          .update({
            pagada: true,
            fecha_pago: fechaPago,
            valor_pagado: valorCuota,
            ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
          })
          .eq('id', cuota.id)

        if (errorUpdate) {
          console.error(`❌ Error actualizando cuota ${cuota.numero_cuota}:`, errorUpdate)
        } else {
          console.log(`✅ Cuota ${cuota.numero_cuota} marcada como pagada`)
        }

        abonoRestante -= valorRestanteCuota
        indiceCuota++
      } else {
        // El abono no cubre completamente el resto de la cuota
        // Actualizar solo el valor_pagado
        const nuevoValorPagado = valorPagadoActual + abonoRestante
        const { error: errorUpdate } = await supabase
          .from('plan_pagos_prestamo')
          .update({
            valor_pagado: nuevoValorPagado
          })
          .eq('id', cuota.id)

        if (errorUpdate) {
          console.error(`❌ Error actualizando valor pagado de cuota ${cuota.numero_cuota}:`, errorUpdate)
        } else {
          console.log(`ℹ️ Abono parcial de $${formatMoney(abonoRestante)} aplicado a cuota ${cuota.numero_cuota}`)
        }

        abonoRestante = 0
      }
    }

    // Actualizar los saldos proyectados de todas las cuotas pendientes restantes
    // basándose en el nuevo saldo del préstamo
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .select('saldo_actual')
      .eq('id', prestamoId)
      .single()

    if (!errorPrestamo && prestamoActualizado) {
      const saldoActual = parseFloat(prestamoActualizado.saldo_actual)
      
      // Obtener todas las cuotas para actualizar saldos
      const { data: todasCuotasActualizadas, error: errorTodas } = await supabase
        .from('plan_pagos_prestamo')
        .select('*')
        .eq('prestamo_id', prestamoId)
        .order('numero_cuota', { ascending: true })
      
      // Filtrar solo las pendientes (con saldo)
      const todasCuotasPendientes = todasCuotasActualizadas?.filter(c => {
        const valorCuota = parseFloat(c.valor_cuota)
        const valorPagado = parseFloat(c.valor_pagado || 0)
        return valorPagado < valorCuota
      }) || []

      if (!errorTodas && todasCuotasPendientes) {
        let saldoAcumulado = saldoActual
        
        // Actualizar saldos proyectados de las cuotas pendientes
        for (const cuota of todasCuotasPendientes) {
          const valorCuota = parseFloat(cuota.valor_cuota)
          const valorPagado = parseFloat(cuota.valor_pagado || 0)
          const valorRestanteCuota = valorCuota - valorPagado
          saldoAcumulado = Math.max(0, saldoAcumulado - valorRestanteCuota)
          
          const { error: errorSaldo } = await supabase
            .from('plan_pagos_prestamo')
            .update({
              saldo_proyectado: saldoAcumulado
            })
            .eq('id', cuota.id)

          if (errorSaldo) {
            console.error(`❌ Error actualizando saldo de cuota ${cuota.numero_cuota}:`, errorSaldo)
          }
        }
      }
    }

    // Recargar el plan de pagos para reflejar los cambios
    await fetchPlanPagosPrestamo(prestamoId)
    
    // Recargar todos los planes de pagos para actualizar el total pagado
    await recargarTodosLosPlanesPagos()
  } catch (e) {
    console.error('❌ Error aplicando abono al plan de pagos:', e)
  }
}

// Función para actualizar el plan de pagos después de editar un abono
async function actualizarPlanPagosDespuesDeEditarAbono(prestamoId, diferenciaAbono) {
  try {
    // Obtener información del préstamo para verificar si inicialmente fue con interés anticipado
    const { data: prestamoInfo, error: errorPrestamoInfo } = await supabase
      .from('prestamos')
      .select(`
        id,
        monto,
        saldo_actual,
        interes,
        interes_anticipado,
        socio_natillera:socios_natillera(
          natillera_id
        )
      `)
      .eq('id', prestamoId)
      .single()

    if (errorPrestamoInfo) {
      console.error('❌ Error obteniendo información del préstamo:', errorPrestamoInfo)
      return
    }

    const natilleraId = prestamoInfo.socio_natillera?.natillera_id || null

    // Obtener historial de refinanciaciones para verificar si el préstamo inicial fue con interés anticipado
    const { data: historialRefinanciaciones, error: errorHistorial } = await supabase
      .from('historial_refinanciaciones')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha_refinanciacion', { ascending: true })

    if (errorHistorial) {
      console.error('❌ Error obteniendo historial de refinanciaciones:', errorHistorial)
    }

    // Determinar si el préstamo inicial fue con interés anticipado
    let tieneInteresAnticipadoInicial = false
    if (historialRefinanciaciones && historialRefinanciaciones.length > 0) {
      // Si hay historial, verificar el interes_anticipado_anterior del primer registro
      tieneInteresAnticipadoInicial = historialRefinanciaciones[0].interes_anticipado_anterior || false
    } else {
      // Si no hay historial, el préstamo actual es el inicial
      tieneInteresAnticipadoInicial = prestamoInfo.interes_anticipado || false
    }

    // Obtener todos los pagos del préstamo ordenados por fecha
    const { data: todosPagos, error: errorPagos } = await supabase
      .from('pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha', { ascending: true })

    if (errorPagos) {
      console.error('❌ Error obteniendo pagos:', errorPagos)
      return
    }

    // Obtener todas las cuotas del plan de pagos
    const { data: todasCuotas, error: errorCuotas } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorCuotas) {
      console.error('❌ Error obteniendo cuotas:', errorCuotas)
      return
    }

    // Obtener el estado anterior de las cuotas para detectar cuáles se marcaron como pagadas
    const cuotasAnteriores = todasCuotas.map(c => ({
      id: c.id,
      pagada: c.pagada || false,
      valor_pagado: parseFloat(c.valor_pagado || 0)
    }))

    // Resetear todas las cuotas
    for (const cuota of todasCuotas) {
      await supabase
        .from('plan_pagos_prestamo')
        .update({
          valor_pagado: 0,
          valor_pagado_efectivo: 0,
          valor_pagado_transferencia: 0,
          pagada: false,
          fecha_pago: null
        })
        .eq('id', cuota.id)
    }

    // Totales de pagos (soportando desglose efectivo/transferencia)
    let abonoRestante = 0
    let abonoRestanteEfectivo = 0
    let abonoRestanteTransferencia = 0
    for (const pago of todosPagos) {
      const v = parseFloat(pago.valor) || 0
      const vEf = parseFloat(pago.valor_efectivo)
      const vTr = parseFloat(pago.valor_transferencia)
      abonoRestante += v
      if (!isNaN(vEf) && !isNaN(vTr)) {
        abonoRestanteEfectivo += vEf
        abonoRestanteTransferencia += vTr
      } else {
        abonoRestanteEfectivo += v
      }
    }

    // Ordenar las cuotas por número (ya están ordenadas, pero por seguridad)
    const cuotasOrdenadas = [...todasCuotas].sort((a, b) => a.numero_cuota - b.numero_cuota)

    // Aplicar todos los abonos a las cuotas en orden
    // Después del reset, todas las cuotas tienen valor_pagado = 0
    let indiceCuota = 0
    const cuotasPagadasNuevas = [] // Cuotas que se marcaron como pagadas en esta actualización

    while (abonoRestante > 0 && indiceCuota < cuotasOrdenadas.length) {
      const cuota = cuotasOrdenadas[indiceCuota]
      const valorCuota = parseFloat(cuota.valor_cuota)
      
      // Después del reset, el valor pagado es 0, pero lo calculamos dinámicamente
      // basándonos en las actualizaciones anteriores en este mismo proceso
      let valorPagadoActual = 0
      
      // Verificar si ya actualizamos esta cuota en este proceso
      // (esto es para manejar el caso donde una cuota se completa y seguimos con la siguiente)
      const valorRestanteCuota = valorCuota - valorPagadoActual

      if (abonoRestante >= valorCuota) {
        // El abono cubre completamente esta cuota
        const fechaUltimoPago = todosPagos[todosPagos.length - 1]?.fecha || new Date().toISOString()
        const periodo = periodoDesdeFechaProyectada(cuota.fecha_proyectada)
        const cuotaAnterior = cuotasAnteriores.find(c => c.id === cuota.id)
        const seMarcoComoPagada = !cuotaAnterior?.pagada
        const ratioEf = abonoRestante > 0 ? abonoRestanteEfectivo / abonoRestante : 1
        const vEf = Math.round(valorCuota * ratioEf)
        const vTr = valorCuota - vEf
        const updatePayload = {
          pagada: true,
          valor_pagado: valorCuota,
          fecha_pago: fechaUltimoPago,
          forma_pago: vEf > 0 && vTr > 0 ? null : (vEf > 0 ? 'efectivo' : 'transferencia'),
          ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
        }
        if (vEf > 0 || vTr > 0) {
          updatePayload.valor_pagado_efectivo = vEf
          updatePayload.valor_pagado_transferencia = vTr
        }
        await supabase
          .from('plan_pagos_prestamo')
          .update(updatePayload)
          .eq('id', cuota.id)

        // Si se marcó como pagada, registrar el interés según el tipo de préstamo
        // IMPORTANTE: NO registrar utilidades si el préstamo tiene interés anticipado,
        // porque el interés ya se cobró al inicio del préstamo
        if (seMarcoComoPagada && natilleraId && !tieneInteresAnticipadoInicial && !prestamoInfo.interes_anticipado) {
          // Para todos los tipos de préstamos, usar el interés que ya está calculado en la cuota
          // El interés de la cuota ya está correctamente calculado en el plan de pagos
          const interesCuota = parseFloat(cuota.interes || 0)
          if (interesCuota > 0) {
            cuotasPagadasNuevas.push({ cuota, interes: interesCuota })
          }
        }

        abonoRestante -= valorCuota
        abonoRestanteEfectivo -= vEf
        abonoRestanteTransferencia -= vTr
        indiceCuota++
      } else {
        // El abono no cubre completamente la cuota
        const ratioEf = abonoRestante > 0 ? abonoRestanteEfectivo / abonoRestante : 1
        const vEf = Math.round(abonoRestante * ratioEf)
        const vTr = abonoRestante - vEf
        const updatePayload = { valor_pagado: abonoRestante }
        if (vEf > 0 || vTr > 0) {
          updatePayload.valor_pagado_efectivo = vEf
          updatePayload.valor_pagado_transferencia = vTr
          updatePayload.forma_pago = vEf > 0 && vTr > 0 ? null : (vEf > 0 ? 'efectivo' : 'transferencia')
        }
        await supabase
          .from('plan_pagos_prestamo')
          .update(updatePayload)
          .eq('id', cuota.id)

        abonoRestante = 0
        abonoRestanteEfectivo = 0
        abonoRestanteTransferencia = 0
      }
    }

    // Registrar intereses ganados de las cuotas pagadas en utilidades_clasificadas
    // IMPORTANTE: NO registrar utilidades si el préstamo tiene interés anticipado,
    // porque el interés ya se cobró al inicio del préstamo
    if (cuotasPagadasNuevas.length > 0 && natilleraId && !tieneInteresAnticipadoInicial && !prestamoInfo.interes_anticipado) {
      const totalInteresesNuevos = cuotasPagadasNuevas.reduce((sum, item) => sum + item.interes, 0)
      
      if (totalInteresesNuevos > 0) {
        // Usar la función auxiliar para actualizar intereses por préstamo
        await actualizarInteresPrestamo(
          natilleraId,
          prestamoId,
          totalInteresesNuevos,
          'normal',
          false // no es nuevo, es actualización
        )
        console.log('✅ Intereses ganados actualizados:', {
          cuotasPagadas: cuotasPagadasNuevas.length,
          totalIntereses: totalInteresesNuevos
        })
      }
    } else if (tieneInteresAnticipadoInicial || prestamoInfo.interes_anticipado) {
      console.log('ℹ️ Préstamo con interés anticipado: no se registran utilidades adicionales al pagar cuotas (ya se cobraron al inicio)')
    }

    // Actualizar los saldos proyectados de todas las cuotas
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .select('saldo_actual')
      .eq('id', prestamoId)
      .single()

    if (!errorPrestamo && prestamoActualizado) {
      const saldoActual = parseFloat(prestamoActualizado.saldo_actual)
      
      // Obtener todas las cuotas nuevamente para actualizar saldos
      const { data: cuotasActualizadas, error: errorTodas } = await supabase
        .from('plan_pagos_prestamo')
        .select('*')
        .eq('prestamo_id', prestamoId)
        .order('numero_cuota', { ascending: true })

      if (!errorTodas && cuotasActualizadas) {
        let saldoAcumulado = saldoActual
        
        // Actualizar saldos proyectados de todas las cuotas
        for (const cuota of cuotasActualizadas) {
          const valorCuota = parseFloat(cuota.valor_cuota)
          const valorPagado = parseFloat(cuota.valor_pagado || 0)
          
          // El saldo proyectado es el saldo actual menos lo que falta pagar de esta cuota
          const valorRestanteCuota = valorCuota - valorPagado
          saldoAcumulado = Math.max(0, saldoAcumulado - valorRestanteCuota)
          
          await supabase
            .from('plan_pagos_prestamo')
            .update({
              saldo_proyectado: saldoAcumulado
            })
            .eq('id', cuota.id)
        }
      }
    }

    // Recalcular numeros_cuota por cada pago según el orden de aplicación.
    // Como los pagos se aplican en orden de fecha, cada pago "ocupa" un rango
    // [acumPrev, acumPrev + valor) sobre la suma total de valores de cuotas.
    // Las cuotas cuyo rango se solape con el rango del pago son las que tocó.
    try {
      const valoresCuota = cuotasOrdenadas.map(c => parseFloat(c.valor_cuota || 0))
      let acumPagos = 0
      const updatesNumerosCuota = []
      for (const pago of todosPagos) {
        const v = parseFloat(pago.valor) || 0
        const inicio = acumPagos
        const fin = acumPagos + v
        const numerosTocados = []
        let acumCuotas = 0
        for (let i = 0; i < cuotasOrdenadas.length; i++) {
          const cInicio = acumCuotas
          const cFin = acumCuotas + valoresCuota[i]
          if (fin > cInicio && inicio < cFin) {
            numerosTocados.push(cuotasOrdenadas[i].numero_cuota)
          }
          acumCuotas = cFin
        }
        acumPagos = fin
        updatesNumerosCuota.push(
          supabase.from('pagos_prestamo')
            .update({ numeros_cuota: numerosTocados.length > 0 ? numerosTocados : null })
            .eq('id', pago.id)
        )
      }
      await Promise.allSettled(updatesNumerosCuota)
    } catch (errNumeros) {
      console.error('⚠️ Error recalculando numeros_cuota de pagos:', errNumeros)
    }

    // Recargar el plan de pagos
    await fetchPlanPagosPrestamo(prestamoId)

    // Recargar todos los planes de pagos para actualizar el total pagado
    await recargarTodosLosPlanesPagos()

    // Recargar el historial de abonos para reflejar los numeros_cuota actualizados
    await fetchPagosPrestamo(prestamoId)
  } catch (e) {
    console.error('❌ Error actualizando plan de pagos después de editar abono:', e)
  }
}

// Función para generar el plan de pagos
function generarPlanPagos(prestamo) {
  const planPagos = []
  const numeroCuotas = prestamo.numero_cuotas || 1
  const monto = prestamo.monto || 0
  const interes = prestamo.interes || 0
  const tasaMensual = interes / 100
  // Resolver una sola vez el nombre del socio y de la natillera para todas las cuotas del plan.
  const nombreSocioPlan = prestamo.nombre_socio
    || prestamo.socio_natillera?.socio?.nombre
    || prestamo.socio_natillera?.nombre
    || null
  const nombreNatilleraPlan = prestamo.nombre_natillera
    || prestamo.socio_natillera?.natillera?.nombre
    || null
  // Usar fecha_inicio si está disponible, sino usar created_at, sino fecha actual
  // Usamos parseDateLocal para evitar problemas de zona horaria
  const fechaInicio = prestamo.fecha_inicio 
    ? parseDateLocal(prestamo.fecha_inicio) 
    : parseDateLocal(prestamo.created_at) || new Date()
  
  // Obtener periodicidad (por defecto mensual)
  const periodicidad = prestamo.periodicidad || 'mensual'
  
  // Calcular tasa de interés según periodicidad
  // Si es quincenal, el interés mensual se divide entre 2 (cada quincena tiene la mitad del interés mensual)
  const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
  
  // Calcular valor de cuota
  let valorCuota = 0
  let interesTotal = 0
  
  // El interés se calcula igual para anticipado y normal (simple o compuesto)
  if (prestamo.tipo_interes === 'compuesto') {
    const montoFinal = monto * Math.pow(1 + tasaPeriodica, numeroCuotas)
    interesTotal = montoFinal - monto
    valorCuota = (monto + interesTotal) / numeroCuotas
  } else {
    interesTotal = monto * tasaPeriodica * numeroCuotas
    valorCuota = (monto + interesTotal) / numeroCuotas
  }
  // Si hay interés_total guardado (ej. al crear/refinanciar), usarlo para consistencia
  if (prestamo.interes_total != null && prestamo.interes_total !== '' && !Number.isNaN(Number(prestamo.interes_total))) {
    interesTotal = Number(prestamo.interes_total)
    valorCuota = (monto + interesTotal) / numeroCuotas
  }
  
  // El saldo inicial siempre debe incluir capital + intereses (total a pagar)
  // Con interés anticipado, el total a pagar es el bruto calculado (monto + interesTotal)
  // Con interés normal, el total a pagar es monto + intereses
  let saldoRestante = monto + interesTotal
  
  for (let i = 1; i <= numeroCuotas; i++) {
    // Calcular fecha proyectada según periodicidad
    let fechaProyectada
    if (periodicidad === 'quincenal') {
      fechaProyectada = new Date(fechaInicio)
      // Para quincenal: sumar 15 días por cada cuota
      fechaProyectada.setDate(fechaProyectada.getDate() + (15 * (i - 1)))
    } else {
      // Para mensual: mismo día cada mes; si el mes no tiene ese día (ej. 31 en feb/abr), usar último día del mes
      fechaProyectada = fechaProyectadaMensual(fechaInicio, i)
    }

    // Calcular capital e interés de esta cuota
    let capitalCuota = 0
    let interesCuota = 0

    if (prestamo.interes_anticipado) {
      // Con interés anticipado, distribuir el interés proporcionalmente en las cuotas
      // El interés total ya está calculado y se distribuye equitativamente entre todas las cuotas
      interesCuota = interesTotal / numeroCuotas
      capitalCuota = valorCuota - interesCuota
    } else {
      if (prestamo.tipo_interes === 'compuesto') {
        // Interés compuesto: el interés se calcula sobre el saldo restante
        interesCuota = saldoRestante * tasaPeriodica
        capitalCuota = valorCuota - interesCuota
      } else {
        // Interés simple: el interés se calcula sobre el saldo restante (que incluye capital + intereses)
        interesCuota = saldoRestante * tasaPeriodica
        capitalCuota = valorCuota - interesCuota
      }
    }
    
    saldoRestante = Math.max(0, saldoRestante - capitalCuota)
    
    const fp = formatDateToLocalISO(fechaProyectada)
    const periodo = periodoDesdeFechaProyectada(fp)
    planPagos.push({
      prestamo_id: prestamo.id,
      numero_cuota: i,
      fecha_proyectada: fp,
      valor_cuota: Math.round(valorCuota),
      capital: Math.round(capitalCuota),
      interes: Math.round(interesCuota),
      saldo_proyectado: Math.round(saldoRestante),
      pagada: false,
      nombre_socio: nombreSocioPlan,
      socio_nombre: nombreSocioPlan,
      nombre_natillera: nombreNatilleraPlan,
      ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
    })
  }

  return planPagos
}

// Función para generar el plan de pagos refinanciado (basado en saldo actual)
// diferenciaIntereses: diferencia de intereses a distribuir en las cuotas (cuando el préstamo inicial fue con interés anticipado)
// mantenerInteresOriginal: si es true, solo distribuir la diferencia en las cuotas (no el interés nuevo completo)
// interesTotalNuevo: interés nuevo completo calculado sobre el monto base
function generarPlanPagosRefinanciado(prestamo, saldoActual, nuevaFechaInicio, diferenciaIntereses = 0, mantenerInteresOriginal = false, interesTotalNuevo = 0) {
  const planPagos = []
  const numeroCuotas = prestamo.numero_cuotas || 1
  const interes = prestamo.interes || 0
  const tasaMensual = interes / 100
  // Usamos parseDateLocal para evitar problemas de zona horaria
  const fechaInicio = parseDateLocal(nuevaFechaInicio)
  
  // Obtener periodicidad (por defecto mensual)
  const periodicidad = prestamo.periodicidad || 'mensual'
  
  // Calcular tasa de interés según periodicidad
  const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
  
  // Calcular valor de cuota basado en el saldo actual
  let valorCuota = 0
  
  // Calcular el valor de la cuota
  // SIEMPRE debe ser: (monto base + interés nuevo completo) / número de cuotas
  // El interés nuevo completo ya se calculó y se pasó como parámetro
  if (interesTotalNuevo > 0) {
    // Usar el interés nuevo completo que se pasó como parámetro
    valorCuota = Math.ceil((saldoActual + interesTotalNuevo) / numeroCuotas)
  } else {
    // Si no se pasó el interés nuevo completo, calcularlo
    if (prestamo.tipo_interes === 'compuesto') {
      const montoFinal = Math.ceil(saldoActual * Math.pow(1 + tasaPeriodica, numeroCuotas))
      valorCuota = Math.ceil(montoFinal / numeroCuotas)
    } else {
      const interesTotalCalculado = Math.ceil(saldoActual * tasaPeriodica * numeroCuotas)
      valorCuota = Math.ceil((saldoActual + interesTotalCalculado) / numeroCuotas)
    }
  }
  
  let saldoRestante = saldoActual
  
  // Si es interés compuesto y hay diferencia, calcular la distribución proporcional
  // Para interés compuesto, la diferencia se distribuye de forma que las primeras cuotas paguen más
  let distribucionDiferencia = []
  if (mantenerInteresOriginal && diferenciaIntereses > 0 && prestamo.tipo_interes === 'compuesto') {
    // Calcular cómo se distribuiría el interés compuesto normalmente sobre el saldo actual
    // Primero calcular el valor de cuota normal con interés compuesto (sin la diferencia)
    const interesTotalNormal = Math.ceil(saldoActual * tasaPeriodica * numeroCuotas) // Interés simple como aproximación
    const montoFinalNormal = Math.ceil(saldoActual * Math.pow(1 + tasaPeriodica, numeroCuotas))
    const valorCuotaNormal = Math.ceil(montoFinalNormal / numeroCuotas)
    
    let saldoTemp = saldoActual
    let diferenciaRestante = diferenciaIntereses
    
    // Calcular el interés de cada cuota como si fuera interés compuesto normal
    let interesesPorCuota = []
    for (let i = 1; i <= numeroCuotas; i++) {
      const interesCuotaNormal = Math.ceil(saldoTemp * tasaPeriodica)
      interesesPorCuota.push(interesCuotaNormal)
      const capitalCuotaNormal = Math.ceil(valorCuotaNormal - interesCuotaNormal)
      saldoTemp = Math.max(0, saldoTemp - capitalCuotaNormal)
    }
    
    // Calcular el total de interés que se pagaría normalmente
    const totalInteresNormal = interesesPorCuota.reduce((sum, interes) => sum + interes, 0)
    
    // Distribuir la diferencia proporcionalmente según el interés de cada cuota
    for (let i = 0; i < numeroCuotas; i++) {
      if (i === numeroCuotas - 1) {
        // En la última cuota, usar toda la diferencia restante para evitar errores de redondeo
        distribucionDiferencia.push(Math.ceil(diferenciaRestante))
      } else {
        const proporcion = totalInteresNormal > 0 ? interesesPorCuota[i] / totalInteresNormal : 1 / numeroCuotas
        const diferenciaCuota = diferenciaIntereses * proporcion
        distribucionDiferencia.push(Math.ceil(diferenciaCuota))
        diferenciaRestante -= diferenciaCuota
      }
    }
  }
  
  for (let i = 1; i <= numeroCuotas; i++) {
    // Calcular fecha proyectada según periodicidad
    let fechaProyectada
    if (periodicidad === 'quincenal') {
      fechaProyectada = new Date(fechaInicio)
      fechaProyectada.setDate(fechaProyectada.getDate() + (15 * (i - 1)))
    } else {
      // Para mensual: mismo día cada mes; si el mes no tiene ese día (ej. 31 en feb/abr), usar último día del mes
      fechaProyectada = fechaProyectadaMensual(fechaInicio, i)
    }

    // Calcular capital e interés de esta cuota
    let capitalCuota = 0
    let interesCuota = 0

    if (mantenerInteresOriginal && diferenciaIntereses > 0) {
      // Si el préstamo inicial fue con interés anticipado, solo distribuimos la diferencia
      let diferenciaPorCuota = 0
      if (prestamo.tipo_interes === 'compuesto' && distribucionDiferencia.length > 0) {
        // Usar la distribución proporcional calculada
        diferenciaPorCuota = distribucionDiferencia[i - 1] || 0
      } else {
        // Para interés simple, distribuir equitativamente y redondear hacia arriba
        diferenciaPorCuota = Math.ceil(diferenciaIntereses / numeroCuotas)
      }
      
      interesCuota = diferenciaPorCuota // Ya está redondeado hacia arriba
      capitalCuota = Math.ceil(valorCuota - interesCuota)
    } else {
      // Para refinanciaciones normales, calcular normalmente y redondear hacia arriba
      if (prestamo.tipo_interes === 'compuesto') {
        // Interés compuesto: el interés se calcula sobre el saldo restante
        interesCuota = Math.ceil(saldoRestante * tasaPeriodica)
        capitalCuota = Math.ceil(valorCuota - interesCuota)
      } else {
        // Interés simple: el interés es fijo por cuota basado en el saldo actual
        interesCuota = Math.ceil(saldoActual * tasaPeriodica)
        capitalCuota = Math.ceil(valorCuota - interesCuota)
      }
    }
    
    saldoRestante = Math.ceil(Math.max(0, saldoRestante - capitalCuota))
    
    const fp = formatDateToLocalISO(fechaProyectada)
    const periodo = periodoDesdeFechaProyectada(fp)
    planPagos.push({
      prestamo_id: prestamo.id,
      numero_cuota: i,
      fecha_proyectada: fp,
      valor_cuota: Math.ceil(valorCuota),
      capital: Math.ceil(capitalCuota),
      interes: Math.ceil(interesCuota),
      saldo_proyectado: Math.ceil(saldoRestante),
      pagada: false,
      valor_pagado: 0,
      ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
    })
  }
  
  return planPagos
}

async function handleRefinanciar() {
  if (!prestamoSeleccionado.value || !formRefinanciar.fecha_pago || !formRefinanciar.numero_cuotas_nuevo || formRefinanciar.numero_cuotas_nuevo <= 0) {
    notificationStore.warning('Por favor completa todos los campos', 'Campos incompletos')
    return
  }
  
  loading.value = true
  try {
    const prestamo = prestamoSeleccionado.value
    const prestamoId = prestamo.id
    const saldoActual = parseFloat(prestamo.saldo_actual || 0)
    
    if (saldoActual <= 0) {
      notificationStore.warning('El préstamo ya está completamente pagado', 'No se puede refinanciar')
      cerrarModalRefinanciar()
      return
    }

    // El número de cuotas es el ingresado (no se suma al anterior)
    const totalCuotas = formRefinanciar.numero_cuotas_nuevo

    if (totalCuotas <= 0) {
      notificationStore.warning('El número de cuotas debe ser mayor a 0', 'Error')
      return
    }

    // Usar tasa de interés nueva si se especificó, sino usar la original
    const interesNuevo = formRefinanciar.interes_nuevo !== null && formRefinanciar.interes_nuevo !== undefined
      ? formRefinanciar.interes_nuevo
      : (prestamo.interes || 0)
    
    const tipoInteresNuevo = formRefinanciar.tipo_interes_nuevo || 'simple'
    
    // Obtener el historial completo para encontrar el interés inicial original
    const { data: historialCompleto, error: errorHistorialCompleto } = await supabase
      .from('historial_refinanciaciones')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha_refinanciacion', { ascending: true })
    
    if (errorHistorialCompleto) {
      console.error('Error al obtener historial de refinanciaciones:', errorHistorialCompleto)
    }
    
    const esPrimeraRefinanciacion = !historialCompleto || historialCompleto.length === 0
    
    // Determinar si el préstamo INICIAL fue con interés anticipado
    // Si hay historial, verificar el interes_anticipado_anterior del primer registro
    // Si no hay historial, usar el interes_anticipado actual del préstamo
    let tieneInteresAnticipadoInicial = false
    if (historialCompleto && historialCompleto.length > 0) {
      // Verificar si el préstamo inicial tenía interés anticipado
      tieneInteresAnticipadoInicial = historialCompleto[0].interes_anticipado_anterior || false
    } else {
      // Si no hay historial, el préstamo actual es el inicial
      tieneInteresAnticipadoInicial = prestamo.interes_anticipado || false
    }
    
    // Obtener el interés inicial original del préstamo
    // Si hay historial, usar el interes_total_anterior del primer registro
    // Si no hay historial, usar el interes_total actual del préstamo
    let interesInicialOriginal = 0
    if (historialCompleto && historialCompleto.length > 0) {
      // Usar el interés anterior del primer registro (el interés inicial original)
      interesInicialOriginal = historialCompleto[0].interes_total_anterior 
        ? parseFloat(historialCompleto[0].interes_total_anterior) 
        : 0
    } else {
      // Si no hay historial, el interés inicial es el actual del préstamo
      interesInicialOriginal = prestamo.interes_total ? parseFloat(prestamo.interes_total) : 0
    }
    
    console.log('🔍 Verificación de refinanciación:', {
      esPrimeraRefinanciacion,
      tieneInteresAnticipadoInicial,
      historialExistente: historialCompleto?.length || 0,
      interesInicialOriginal
    })
    
    // Calcular diferencia de intereses si el préstamo INICIAL fue con interés anticipado
    // La diferencia se calcula siempre usando el interés inicial original
    // Esto se aplica en TODAS las refinanciaciones, no solo en la primera
    let diferenciaIntereses = 0
    let mantenerInteresTotalOriginal = false
    
    // Calcular el monto base para la refinanciación
    // Si el préstamo inicial fue con interés anticipado, el monto base es el saldo_actual
    // (que ya incluye el interés anticipado del préstamo anterior)
    // Si no, el monto base es el saldo_actual normal
    const montoBaseRefinanciacion = saldoActual
    
    // Calcular el nuevo interés total sobre el monto base de refinanciación
    const periodicidadNueva = prestamo.periodicidad || 'mensual'
    const tasaMensualNueva = interesNuevo / 100
    const tasaPeriodicaNueva = periodicidadNueva === 'quincenal' ? tasaMensualNueva / 2 : tasaMensualNueva
    let interesTotalNuevo = 0
    if (tipoInteresNuevo === 'compuesto') {
      const montoFinal = Math.ceil(montoBaseRefinanciacion * Math.pow(1 + tasaPeriodicaNueva, totalCuotas))
      interesTotalNuevo = Math.ceil(montoFinal - montoBaseRefinanciacion)
    } else {
      interesTotalNuevo = Math.ceil(montoBaseRefinanciacion * tasaPeriodicaNueva * totalCuotas)
    }
    
    if (tieneInteresAnticipadoInicial && interesInicialOriginal > 0) {
      console.log('⚠️ Refinanciación con interés anticipado inicial - usando interés inicial original:', interesInicialOriginal)
      
      // La diferencia es: interés nuevo - interés inicial original (siempre usar el inicial)
      // Esta diferencia es la que se debe distribuir en las nuevas cuotas
      diferenciaIntereses = Math.ceil(interesTotalNuevo - interesInicialOriginal)
      
      // Si la diferencia es negativa, significa que el nuevo interés es menor, no hay diferencia adicional a distribuir
      if (diferenciaIntereses < 0) {
        diferenciaIntereses = 0
      }
      
      // Marcar que debemos mantener el interés total original para intereses ganados
      mantenerInteresTotalOriginal = true
      
      console.log('📊 Cálculo de diferencia:', {
        montoBaseRefinanciacion,
        interesInicialOriginal,
        interesTotalNuevoCalculado: interesTotalNuevo,
        diferenciaIntereses,
        mantenerInteresTotalOriginal
      })
    } else {
      console.log('ℹ️ Refinanciación normal (el préstamo inicial no tenía interés anticipado o no hay interés inicial)')
    }
    
    // Obtener todas las cuotas del plan de pagos actual
    const { data: todasCuotas, error: errorCuotas } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })
    
    if (errorCuotas) {
      throw new Error('Error al obtener el plan de pagos actual')
    }
    
    // Snapshot del ciclo que se está cerrando (para el historial de refinanciación).
    // El interés generado se calcula con las condiciones vigentes ANTES de refinanciar.
    const interesGeneradoAnterior = Math.ceil(calcularInteresGeneradoDetalle(prestamo) || 0)

    // Total abonado en el ciclo vigente (abonos aún no asociados a una refinanciación).
    const { data: abonosCicloActual, error: errorAbonosCiclo } = await supabase
      .from('pagos_prestamo')
      .select('id, valor')
      .eq('prestamo_id', prestamoId)
      .is('refinanciacion_id', null)
    if (errorAbonosCiclo) {
      throw new Error('Error al obtener los abonos del ciclo actual')
    }
    const totalPagadoAnterior = (abonosCicloActual || [])
      .reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0)

    // El plan de cuotas se reinicia por completo: se eliminan TODAS las cuotas del plan
    // anterior (pagadas y pendientes) y se regenera desde la cuota #1 con las nuevas
    // condiciones. La trazabilidad del ciclo cerrado queda en los abonos (que se
    // conservan y se asocian a esta refinanciación más abajo) y en el historial.
    if (todasCuotas.length > 0) {
      const { error: errorEliminar } = await supabase
        .from('plan_pagos_prestamo')
        .delete()
        .eq('prestamo_id', prestamoId)

      if (errorEliminar) {
        throw new Error('Error al eliminar el plan de pagos anterior')
      }
    }

    // Crear objeto temporal del préstamo con los nuevos valores para generar el plan
    const prestamoTemporal = {
      ...prestamo,
      numero_cuotas: totalCuotas,
      interes: interesNuevo,
      tipo_interes: tipoInteresNuevo
    }
    
    // Generar nuevo plan de pagos basado en el monto base de refinanciación y la nueva fecha
    // Pasar la diferencia de intereses y el interés nuevo completo si el préstamo inicial fue con interés anticipado
    // Esto se aplica en TODAS las refinanciaciones, no solo en la primera
    const nuevoPlanPagos = generarPlanPagosRefinanciado(
      prestamoTemporal,
      montoBaseRefinanciacion, // Usar el monto base (saldo_actual que incluye intereses si es anticipado)
      formRefinanciar.fecha_pago,
      diferenciaIntereses, // Diferencia a distribuir en las cuotas
      mantenerInteresTotalOriginal,
      interesTotalNuevo // Interés nuevo completo para calcular el valor de la cuota correctamente
    )
    
    // Insertar el nuevo plan de pagos
    if (nuevoPlanPagos.length > 0) {
      const { error: errorPlan } = await supabase
        .from('plan_pagos_prestamo')
        .insert(nuevoPlanPagos)
      
      if (errorPlan) {
        throw new Error('Error al crear el nuevo plan de pagos')
      }
    }
    
    // El interés nuevo ya se calculó arriba sobre el montoBaseRefinanciacion
    // SIEMPRE guardamos el interés nuevo completo como interes_total
    // La diferencia solo se usa para distribuir en las cuotas, pero el interes_total debe ser el nuevo completo
    const interesTotalAGuardar = interesTotalNuevo
    
    // Guardar historial de refinanciación ANTES de actualizar el préstamo
    const historialRefinanciacion = {
      prestamo_id: prestamoId,
      // Valores anteriores (del préstamo actual antes de refinanciar)
      monto_anterior: parseFloat(prestamo.monto || 0),
      interes_anterior: parseFloat(prestamo.interes || 0),
      numero_cuotas_anterior: prestamo.numero_cuotas || null,
      tipo_interes_anterior: prestamo.tipo_interes || null,
      periodicidad_anterior: prestamo.periodicidad || null,
      // Fecha de inicio del plan anterior: si el préstamo no la tiene (préstamos viejos),
      // usar la fecha de la primera cuota del plan que se está cerrando.
      fecha_inicio_anterior: prestamo.fecha_inicio || (todasCuotas && todasCuotas.length > 0 ? todasCuotas[0].fecha_proyectada : null),
      saldo_actual_anterior: saldoActual,
      // Guardar el interés total que tenía el préstamo ANTES de esta refinanciación
      // (puede ser el inicial o el de una refinanciación anterior)
      interes_total_anterior: prestamo.interes_total ? parseFloat(prestamo.interes_total) : null,
      // Guardar si el préstamo tenía interés anticipado antes de esta refinanciación
      // Si es la primera refinanciación, esto indica si el préstamo inicial fue con interés anticipado
      interes_anticipado_anterior: tieneInteresAnticipadoInicial,
      // Valores nuevos
      monto_nuevo: montoBaseRefinanciacion, // El nuevo monto es el monto base (total a pagar anterior)
      interes_nuevo: interesNuevo,
      numero_cuotas_nuevo: totalCuotas,
      tipo_interes_nuevo: tipoInteresNuevo,
      periodicidad_nueva: periodicidadNueva,
      fecha_inicio_nueva: formRefinanciar.fecha_pago,
      saldo_actual_nuevo: Math.ceil(montoBaseRefinanciacion + interesTotalNuevo), // Monto base + interés nuevo completo (ya redondeado hacia arriba)
      // Resumen del ciclo cerrado (para mostrar en la tarjeta del historial)
      interes_generado_anterior: interesGeneradoAnterior,
      total_pagado_anterior: Math.ceil(totalPagadoAnterior),
      // Copia del plan de pagos anterior (se borra al reiniciar; aquí queda para el desplegable)
      plan_pagos_anterior: (todasCuotas || []).map(c => ({
        numero_cuota: c.numero_cuota,
        valor_cuota: parseFloat(c.valor_cuota || 0),
        valor_pagado: parseFloat(c.valor_pagado || 0),
        pagada: !!c.pagada,
        fecha_proyectada: c.fecha_proyectada
      }))
    }

    const { data: historialInsertado, error: errorHistorial } = await supabase
      .from('historial_refinanciaciones')
      .insert(historialRefinanciacion)
      .select()
      .single()

    if (errorHistorial) {
      console.error('Error al guardar historial de refinanciación:', errorHistorial)
      // No lanzar error, solo registrar en consola para no bloquear el proceso
    }

    // Asociar los abonos del ciclo vigente a esta refinanciación para conservar la
    // trazabilidad. Así el "Resumen de pagos" (que solo cuenta abonos con
    // refinanciacion_id NULL) vuelve a 0 y estos abonos se listan en el desplegable
    // del historial de refinanciación.
    if (historialInsertado?.id && abonosCicloActual && abonosCicloActual.length > 0) {
      const { error: errorAsociar } = await supabase
        .from('pagos_prestamo')
        .update({ refinanciacion_id: historialInsertado.id })
        .eq('prestamo_id', prestamoId)
        .is('refinanciacion_id', null)

      if (errorAsociar) {
        console.error('Error al asociar abonos a la refinanciación:', errorAsociar)
        // No bloquear el proceso; los abonos siguen existiendo aunque no queden agrupados
      }
    }

    // Actualizar el préstamo con los nuevos valores
    // El nuevo monto es el monto base de refinanciación (saldo_actual que incluye intereses si es anticipado)
    // El nuevo saldo_actual es: monto base + diferencia (si hay interés anticipado inicial) o monto base + interés nuevo completo
    const datosActualizacion = {
      monto: montoBaseRefinanciacion, // El nuevo monto es el monto base (total a pagar anterior)
      interes: interesNuevo,
      numero_cuotas: totalCuotas,
      tipo_interes: tipoInteresNuevo,
      periodicidad: periodicidadNueva,
      fecha_inicio: formRefinanciar.fecha_pago,
      interes_total: interesTotalAGuardar, // El interés nuevo completo (ya redondeado hacia arriba)
      saldo_actual: Math.ceil(montoBaseRefinanciacion + interesTotalNuevo), // Monto base + interés nuevo completo (ya redondeado hacia arriba)
      // Si el préstamo inicial fue con interés anticipado, mantenemos interes_anticipado como true
      // para que los intereses ganados sigan contabilizándose correctamente
      // La diferencia de intereses se cobrará en cuotas, pero el interés original ya se cobró anticipadamente
      interes_anticipado: mantenerInteresTotalOriginal ? true : prestamo.interes_anticipado
    }
    
    console.log('📊 Datos de la vista previa:', vistaPreviaRefinanciacion.value)
    console.log('🔄 Actualizando préstamo con datos:', datosActualizacion)
    console.log('📋 Valores usados:', {
      saldoActual,
      interesNuevo,
      totalCuotas,
      tipoInteresNuevo,
      periodicidadNueva,
      fechaPago: formRefinanciar.fecha_pago,
      interesTotalNuevo,
      mantenerInteresTotalOriginal
    })
    
    const { data: prestamoActualizadoData, error: errorUpdate } = await supabase
      .from('prestamos')
      .update(datosActualizacion)
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorUpdate) {
      console.error('❌ Error al actualizar préstamo:', errorUpdate)
      throw new Error('Error al actualizar el préstamo con los nuevos valores')
    }
    
    console.log('✅ Préstamo actualizado correctamente en BD:', prestamoActualizadoData)
    
    // Verificar que todos los campos se actualizaron
    if (prestamoActualizadoData) {
      console.log('🔍 Verificación de campos actualizados:')
      const camposCorrectos = {
        monto: prestamoActualizadoData.monto === saldoActual,
        interes: prestamoActualizadoData.interes === interesNuevo,
        numero_cuotas: prestamoActualizadoData.numero_cuotas === totalCuotas,
        tipo_interes: prestamoActualizadoData.tipo_interes === tipoInteresNuevo,
        periodicidad: prestamoActualizadoData.periodicidad === periodicidadNueva,
        fecha_inicio: prestamoActualizadoData.fecha_inicio === formRefinanciar.fecha_pago,
        interes_total: prestamoActualizadoData.interes_total === interesTotalNuevo,
        saldo_actual: prestamoActualizadoData.saldo_actual === datosActualizacion.saldo_actual
      }
      
      console.log('  - monto:', prestamoActualizadoData.monto, '(esperado:', saldoActual, ')', camposCorrectos.monto ? '✅' : '❌')
      console.log('  - interes:', prestamoActualizadoData.interes, '(esperado:', interesNuevo, ')', camposCorrectos.interes ? '✅' : '❌')
      console.log('  - numero_cuotas:', prestamoActualizadoData.numero_cuotas, '(esperado:', totalCuotas, ')', camposCorrectos.numero_cuotas ? '✅' : '❌')
      console.log('  - tipo_interes:', prestamoActualizadoData.tipo_interes, '(esperado:', tipoInteresNuevo, ')', camposCorrectos.tipo_interes ? '✅' : '❌')
      console.log('  - periodicidad:', prestamoActualizadoData.periodicidad, '(esperado:', periodicidadNueva, ')', camposCorrectos.periodicidad ? '✅' : '❌')
      console.log('  - fecha_inicio:', prestamoActualizadoData.fecha_inicio, '(esperado:', formRefinanciar.fecha_pago, ')', camposCorrectos.fecha_inicio ? '✅' : '❌')
      console.log('  - interes_total:', prestamoActualizadoData.interes_total, '(esperado:', interesTotalNuevo, ')', camposCorrectos.interes_total ? '✅' : '❌')
      console.log('  - saldo_actual:', prestamoActualizadoData.saldo_actual, '(esperado:', datosActualizacion.saldo_actual, ')', camposCorrectos.saldo_actual ? '✅' : '❌')
      
      const camposIncorrectos = Object.entries(camposCorrectos).filter(([_, correcto]) => !correcto)
      if (camposIncorrectos.length > 0) {
        console.error('❌ Campos que NO se actualizaron correctamente:', camposIncorrectos.map(([campo]) => campo))
      } else {
        console.log('✅ Todos los campos se actualizaron correctamente en BD')
      }
    }
    
    // Obtener el natillera_id para la auditoría y actualizar utilidades_clasificadas
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('id', prestamo.socio_natillera_id)
      .single()
    
    const nombreSocio = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    
    // Si el préstamo inicial fue con interés anticipado,
    // actualizar el registro en utilidades_clasificadas con el nuevo interés total completo
    // El interés inicial ya está registrado, pero al refinanciar debemos actualizar
    // para reflejar que ahora el préstamo tiene un nuevo interés total
    if (tieneInteresAnticipadoInicial && interesTotalNuevo > 0 && socioNatillera?.natillera_id) {
      console.log('📊 Actualizando utilidades_clasificadas al refinanciar préstamo con interés anticipado inicial')
      console.log('   Interés inicial registrado:', interesInicialOriginal)
      console.log('   Nuevo interés total:', interesTotalNuevo)
      console.log('   Diferencia a cobrar en cuotas:', diferenciaIntereses)
      
      // Actualizar el registro con el nuevo interés total completo
      // El interés inicial ya se cobró, pero ahora el préstamo tiene un nuevo interés total
      // La diferencia se cobrará a medida que se paguen las cuotas
      await actualizarInteresPrestamo(
        socioNatillera.natillera_id,
        prestamoId,
        interesTotalNuevo, // Usar el nuevo interés total completo
        'anticipado',
        false, // No es nuevo, es actualización por refinanciación
        true, // Es refinanciación, reemplazar el interés en lugar de sumarlo
        prestamo.medio_entrega || null // forma_pago (se mantiene el medio del préstamo)
      )
      console.log('✅ Utilidades_clasificadas actualizadas con nuevo interés total')
    }
    
    // Registrar en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarActualizacion(
        'prestamo',
        prestamoId,
        `Se refinanció el préstamo de ${nombreSocio} con nueva fecha de pago: ${formatDate(formRefinanciar.fecha_pago)}`,
        prestamo,
        { ...prestamo, ...datosActualizacion },
        socioNatillera?.natillera_id || null,
        {
          saldo_actual: saldoActual,
          nueva_fecha_pago: formRefinanciar.fecha_pago,
          cuotas_eliminadas: todasCuotas.length,
          cuotas_nuevas: nuevoPlanPagos.length,
          historial_refinanciacion_id: historialInsertado?.id || null
        }
      )
    )
    
    // Recargar los préstamos
    await fetchPrestamos()
    
    // Verificar que el préstamo se actualizó correctamente
    const prestamoActualizadoEnLista = prestamos.value.find(p => p.id === prestamoId)
    console.log('✅ Préstamo en lista después de recargar:', prestamoActualizadoEnLista)
    
    if (prestamoActualizadoEnLista) {
      console.log('🔍 Campos del préstamo recargado:')
      console.log('  - monto:', prestamoActualizadoEnLista.monto)
      console.log('  - interes:', prestamoActualizadoEnLista.interes)
      console.log('  - numero_cuotas:', prestamoActualizadoEnLista.numero_cuotas)
      console.log('  - tipo_interes:', prestamoActualizadoEnLista.tipo_interes)
      console.log('  - periodicidad:', prestamoActualizadoEnLista.periodicidad)
      console.log('  - fecha_inicio:', prestamoActualizadoEnLista.fecha_inicio)
      console.log('  - interes_total:', prestamoActualizadoEnLista.interes_total)
      console.log('  - saldo_actual:', prestamoActualizadoEnLista.saldo_actual)
      console.log('  - interes_anticipado:', prestamoActualizadoEnLista.interes_anticipado)
    } else {
      console.error('❌ No se encontró el préstamo actualizado en la lista')
    }
    
    if (prestamoActualizadoEnLista) {
      // Actualizar también prestamoSeleccionado si está activo
      if (prestamoSeleccionado.value && prestamoSeleccionado.value.id === prestamoId) {
        prestamoSeleccionado.value = { ...prestamoActualizadoEnLista }
      }
    }
    
    // Si el modal de detalle está abierto para este préstamo, recargar también
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      const prestamoActualizado = prestamos.value.find(p => p.id === prestamoId)
      if (prestamoActualizado) {
        await Promise.all([
          fetchPagosPrestamo(prestamoId),
          fetchPlanPagosPrestamo(prestamoId),
          fetchHistorialRefinanciaciones(prestamoId)
        ])
        prestamoDetalle.value = { ...prestamoActualizado }
      }
    }
    
    cerrarModalRefinanciar()
    notificationStore.success('Préstamo refinanciado exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error refinanciando préstamo:', e)
    notificationStore.error(e.message || 'Error al refinanciar el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

async function handleCrearPrestamo() {
  // Mostrar ventana de carga de inmediato al hacer clic
  generandoPrestamo.value = true
  loading.value = true
  await nextTick() // Dar tiempo a que se pinte el overlay antes de validaciones/async

  // Validar monto mínimo
  const capital = Math.round(capitalAPrestar.value)
  if (capital < 10000) {
    generandoPrestamo.value = false
    loading.value = false
    notificationStore.warning('El monto mínimo del préstamo es $10.000', 'Monto insuficiente')
    return
  }

  const maxCuotasPermitidas = reglasInteresNatillera.value.plazo_maximo
  limitarNumeroCuotasCrearPrestamo()
  const cuotasVal = Number(formPrestamo.numero_cuotas)
  if (!Number.isFinite(cuotasVal) || cuotasVal < 1 || cuotasVal > maxCuotasPermitidas) {
    generandoPrestamo.value = false
    loading.value = false
    notificationStore.warning(
      `El número de cuotas debe estar entre 1 y ${maxCuotasPermitidas}, según el plazo máximo configurado en la natillera.`,
      'Plazo no válido'
    )
    return
  }

  // Validar interés anticipado: d = interes × meses debe ser < 1
  if (mostrarInteresAnticipado.value) {
    const tasaMensual = formPrestamo.interes / 100
    const cuotas = formPrestamo.numero_cuotas
    const periodicidad = formPrestamo.periodicidad || 'mensual'
    const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
    const d = tasaPeriodica * cuotas

    if (d >= 1) {
      generandoPrestamo.value = false
      loading.value = false
      notificationStore.error(
        `El valor de interés × meses (${(d * 100).toFixed(2)}%) debe ser menor al 100%. Por favor, reduce el interés o aumenta el número de cuotas.`,
        'Error en cálculo de interés anticipado'
      )
      return
    }
  }

  // Validar que haya recaudado suficiente según la forma de pago seleccionada.
  // Lo que efectivamente sale del fondo en la forma de pago es lo que recibe el socio:
  // - Normal: capital completo
  // - Anticipado: capital - interés (el interés se retiene y queda como utilidad)
  const montoAfectaFondo = mostrarInteresAnticipado.value
    ? Math.max(0, capital - Math.round(interesTotal.value))
    : capital
  const natilleraId = id
  if (natilleraId) {
    try {
      const natillera = await natillerasStore.fetchNatillera(natilleraId)
      if (natillera) {
        const stats = await natillerasStore.calcularEstadisticas(natillera)
        const medio = (formPrestamo.medio_entrega || 'efectivo').toLowerCase()
        const disponibleEfectivo = Math.max(0, (stats.totalRecaudadoEfectivo || 0) - (stats.totalDesembolsadoEfectivo || 0))
        const disponibleTransferencia = Math.max(0, (stats.totalRecaudadoTransferencia || 0) - (stats.totalDesembolsadoTransferencia || 0))
        if (medio === 'efectivo' && montoAfectaFondo > disponibleEfectivo) {
          generandoPrestamo.value = false
          loading.value = false
          notificationStore.warning(
            `No hay suficiente recaudado en efectivo para este préstamo. Disponible: $${formatMoney(disponibleEfectivo)}. Valor a desembolsar: $${formatMoney(montoAfectaFondo)}.`,
            'Fondo insuficiente (efectivo)'
          )
          return
        }
        if (medio === 'transferencia' && montoAfectaFondo > disponibleTransferencia) {
          generandoPrestamo.value = false
          loading.value = false
          notificationStore.warning(
            `No hay suficiente recaudado por transferencia para este préstamo. Disponible: $${formatMoney(disponibleTransferencia)}. Valor a desembolsar: $${formatMoney(montoAfectaFondo)}.`,
            'Fondo insuficiente (transferencia)'
          )
          return
        }
      }
    } catch (e) {
      console.warn('No se pudo validar fondo por forma de pago:', e)
      // No bloquear la creación si falla la consulta de estadísticas
    }
  }

  try {
    // Calcular el interés total (siempre con la misma fórmula: simple o compuesto)
    const interesTotalCalculado = Math.round(interesTotal.value)
    // El saldo inicial siempre es capital + intereses (total a pagar por el socio)
    const saldoInicial = capital + interesTotalCalculado

    const socioNatReplica = socios.value.find(s => s.id === formPrestamo.socio_natillera_id)
    const nombreSocioReplica = socioNatReplica?.socio?.nombre || socioNatReplica?.nombre || null
    const natilleraReplica = await natillerasStore.fetchNatillera(id)
    const nombreNatilleraReplica = natilleraReplica?.nombre || null
    
    const { data, error } = await supabase
      .from('prestamos')
      .insert({
        socio_natillera_id: formPrestamo.socio_natillera_id,
        monto: capital,
        interes: formPrestamo.interes,
        saldo_actual: saldoInicial,
        estado: 'activo',
        tipo_interes: formPrestamo.tipo_interes,
        interes_anticipado: mostrarInteresAnticipado.value,
        interes_total: interesTotalCalculado,
        numero_cuotas: formPrestamo.numero_cuotas,
        periodicidad: formPrestamo.periodicidad,
        medio_entrega: formPrestamo.medio_entrega || 'efectivo',
        nombre_socio: nombreSocioReplica,
        nombre_natillera: nombreNatilleraReplica
      })
      .select(`
        *,
        socio_natillera:socios_natillera(*, socio:socios(*))
      `)
      .single()

    if (error) throw error
    
    // Obtener el natillera_id del socio_natillera
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('id', formPrestamo.socio_natillera_id)
      .single()
    
    const nombreSocio = data.socio_natillera?.socio?.nombre || 'Socio'
    
    // Generar plan de pagos usando la fecha del formulario
    // Resolver nombres con fallback al join recién devuelto y a las réplicas pre-calculadas
    const nombreSocioParaPlan = data.nombre_socio
      || data.socio_natillera?.socio?.nombre
      || nombreSocioReplica
      || null
    const nombreNatilleraParaPlan = data.nombre_natillera
      || nombreNatilleraReplica
      || null

    // Usamos la fecha directamente sin convertir a UTC para evitar problemas de zona horaria
    const planPagos = generarPlanPagos({
      ...data,
      tipo_interes: formPrestamo.tipo_interes,
      interes_anticipado: mostrarInteresAnticipado.value,
      numero_cuotas: formPrestamo.numero_cuotas,
      periodicidad: formPrestamo.periodicidad,
      fecha_inicio: formPrestamo.fecha_pago || data.created_at,
      nombre_socio: nombreSocioParaPlan,
      nombre_natillera: nombreNatilleraParaPlan
    })
    
    // Insertar plan de pagos en la base de datos
    if (planPagos.length > 0) {
      const { error: errorPlan } = await supabase
        .from('plan_pagos_prestamo')
        .insert(planPagos)
      
      if (errorPlan) {
        console.error('Error al crear plan de pagos:', errorPlan)
        // No lanzar error, solo registrar en consola
      }
    }
    
    // Registrar interés en utilidades_clasificadas SOLO para préstamos NUEVOS con interés anticipado
    if (mostrarInteresAnticipado.value && interesTotalCalculado > 0 && socioNatillera?.natillera_id) {
      await actualizarInteresPrestamo(
        socioNatillera.natillera_id,
        data.id,
        interesTotalCalculado,
        'anticipado',
        true, // esNuevo
        false,
        formPrestamo.medio_entrega || null // forma_pago para clasificación (medio de entrega del préstamo)
      )
      console.log('✅ Interés anticipado registrado en utilidades_clasificadas:', {
        prestamoId: data.id,
        interesTotal: interesTotalCalculado
      })
    }
    
    // Registrar en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarCreacion(
        'prestamo',
        data.id,
        `Se creó un préstamo de $${formatMoney(capital)} para ${nombreSocio}`,
        {
          monto: capital,
          interes: formPrestamo.interes,
          tipo_interes: formPrestamo.tipo_interes,
          numero_cuotas: formPrestamo.numero_cuotas,
          periodicidad: formPrestamo.periodicidad,
          interes_anticipado: mostrarInteresAnticipado.value,
          interes_total: interesTotalCalculado,
          saldo_actual: saldoInicial,
          estado: 'activo'
        },
        socioNatillera?.natillera_id || null
      )
    )
    
    // Recargar todos los préstamos para incluir el nuevo con toda su información calculada
    await fetchPrestamos()
    // Mostrar comprobante en el mismo modal con opciones Descargar y WhatsApp (no cerrar aún)
    prestamoRecienCreado.value = { prestamo: data, planPagos }
    notificationStore.success('Préstamo creado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al crear el préstamo', 'Error')
  } finally {
    loading.value = false
    generandoPrestamo.value = false
  }
}

function cerrarModalNuevoPrestamo() {
  modalNuevoPrestamo.value = false
  pasoNuevoPrestamo.value = 0
  prestamoRecienCreado.value = null
  formPrestamo.socio_natillera_id = ''
  formPrestamo.monto = 100000
  aplicarDefaultsFormularioCrearPrestamo()
  formPrestamo.tipo_interes = 'simple'
  formPrestamo.periodicidad = 'mensual'
  formPrestamo.fecha_pago = getCurrentDateISO()
  formPrestamo.medio_entrega = 'efectivo'
  montoFormateado.value = '100.000'
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
  mostrarInteresAnticipado.value = false
  if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
}

let stashAbonoEliminar = null
let stashPrestamoEliminar = null

const { requestCloseTop: requestCloseTopModal } = useModalStack({
  nuevoPrestamo: {
    isOpen: computed(() => !!modalNuevoPrestamo.value),
    hide: () => {
      modalNuevoPrestamo.value = false
    },
    show: () => {
      modalNuevoPrestamo.value = true
    },
    dismiss: cerrarModalNuevoPrestamo
  },
  abono: {
    isOpen: computed(() => !!modalAbono.value),
    hide: () => {
      modalAbono.value = false
    },
    show: () => {
      modalAbono.value = true
    },
    dismiss: cerrarModalAbono
  },
  comprobanteAbono: {
    isOpen: computed(() => !!(modalComprobanteAbono.value && comprobanteAbono.value)),
    hide: () => {
      modalComprobanteAbono.value = false
    },
    show: () => {
      modalComprobanteAbono.value = true
    },
    dismiss: () => {
      modalComprobanteAbono.value = false
    }
  },
  comprobantePagado: {
    isOpen: computed(() => !!(modalComprobantePagado.value && comprobantePagado.value)),
    hide: () => {
      modalComprobantePagado.value = false
    },
    show: () => {
      modalComprobantePagado.value = true
    },
    dismiss: () => {
      modalComprobantePagado.value = false
      comprobantePagado.value = null
    }
  },
  editarAbono: {
    isOpen: computed(() => !!(modalEditarAbono.value && abonoAEditar.value)),
    hide: () => {
      modalEditarAbono.value = false
    },
    show: () => {
      modalEditarAbono.value = true
    },
    dismiss: () => {
      modalEditarAbono.value = false
      abonoAEditar.value = null
    }
  },
  refinanciar: {
    isOpen: computed(() => !!modalRefinanciar.value),
    hide: () => {
      modalRefinanciar.value = false
    },
    show: () => {
      modalRefinanciar.value = true
    },
    dismiss: cerrarModalRefinanciar
  },
  detalle: {
    isOpen: computed(() => !!modalDetalle.value),
    hide: () => {
      modalDetalle.value = false
    },
    show: () => {
      modalDetalle.value = true
    },
    dismiss: () => {
      modalDetalle.value = false
    }
  },
  compartirPrestamo: {
    isOpen: computed(() => !!modalCompartirPrestamo.value),
    hide: () => {
      modalCompartirPrestamo.value = false
    },
    show: () => {
      modalCompartirPrestamo.value = true
    },
    dismiss: () => {
      modalCompartirPrestamo.value = false
    }
  },
  compartirPrestamoNuevo: {
    isOpen: computed(() => !!modalCompartirPrestamoNuevo.value),
    hide: () => {
      modalCompartirPrestamoNuevo.value = false
    },
    show: () => {
      modalCompartirPrestamoNuevo.value = true
    },
    dismiss: () => {
      modalCompartirPrestamoNuevo.value = false
    }
  },
  eliminarAbono: {
    isOpen: computed(() => !!abonoAEliminar.value),
    hide: () => {
      if (abonoAEliminar.value) {
        stashAbonoEliminar = abonoAEliminar.value
        abonoAEliminar.value = null
      }
    },
    show: () => {
      if (stashAbonoEliminar) {
        abonoAEliminar.value = stashAbonoEliminar
        stashAbonoEliminar = null
      }
    },
    dismiss: () => {
      stashAbonoEliminar = null
      abonoAEliminar.value = null
    }
  },
  eliminarPrestamo: {
    isOpen: computed(() => !!prestamoAEliminar.value),
    hide: () => {
      if (prestamoAEliminar.value) {
        stashPrestamoEliminar = prestamoAEliminar.value
        prestamoAEliminar.value = null
      }
    },
    show: () => {
      if (stashPrestamoEliminar) {
        prestamoAEliminar.value = stashPrestamoEliminar
        stashPrestamoEliminar = null
      }
    },
    dismiss: () => {
      stashPrestamoEliminar = null
      prestamoAEliminar.value = null
    }
  }
})

function handleClickOutside(event) {
  if (mostrarSelectorSocio.value && !event.target.closest('.selector-socio-container')) {
    cerrarSelectorSocio()
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  const nNat = await cargarReglasPrestamoNatillera()
  if (nNat && natilleraPrestamosDeshabilitados(nNat)) {
    notificationStore.info('La natillera no permite préstamos', 'Préstamos')
    router.replace(`/natilleras/${id}`)
    return
  }
  await fetchPrestamos()
  fetchSocios()
  tryRestorePrestamosWorkDraft()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function handleRegistrarAbono() {
  console.log('🚀 handleRegistrarAbono llamado')
  console.log('📋 prestamoSeleccionado.value:', prestamoSeleccionado.value)
  console.log('💰 formAbono.valor:', formAbono.valor)
  
  if (!prestamoSeleccionado.value) {
    console.error('❌ No hay préstamo seleccionado')
    notificationStore.error('No hay préstamo seleccionado', 'Error')
    return
  }
  
  if (!formAbono.valor || formAbono.valor <= 0) {
    console.error('❌ Valor del abono inválido:', formAbono.valor)
    notificationStore.error('El valor del abono debe ser mayor a 0', 'Error')
    return
  }
  
  console.log('⏳ Iniciando registro de abono...')
  loading.value = true

  try {
    // Split: la mora se cobra PROPORCIONAL a la(s) cuota(s) que se pagan (recorriendo
    // las vencidas de la más antigua a la más nueva); va al fondo, no baja el saldo. El
    // resto es el abono al préstamo (capital+interés) que sí reduce el saldo.
    const desgloseAbonoReg = desglosarAbonoConMora(
      formAbono.valor,
      prestamoSeleccionado.value.cuotasVencidasOrdenadas,
      reglasInteresNatillera.value.tasa_mora,
      new Date()
    )
    const moraPagada = desgloseAbonoReg.moraPagada
    const abonoAPrestamo = desgloseAbonoReg.abonoAPrestamo

    const nuevoSaldo = prestamoSeleccionado.value.saldo_actual - abonoAPrestamo
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'activo'

    // Verificar que el préstamo existe y pertenece al usuario antes de insertar
    console.log('🔍 Verificando préstamo antes de insertar...')
    const { data: prestamoVerificado, error: errorVerificacion } = await supabase
      .from('prestamos')
      .select(`
        id,
        socio_natillera_id,
        socios_natillera!inner(
          id,
          natillera_id,
          natilleras!inner(
            id,
            admin_id
          )
        )
      `)
      .eq('id', prestamoSeleccionado.value.id)
      .single()
    
    console.log('🔍 Resultado de verificación:', { prestamoVerificado, errorVerificacion })
    
    if (errorVerificacion || !prestamoVerificado) {
      console.error('❌ Error verificando préstamo:', errorVerificacion)
      throw new Error('No se pudo verificar el préstamo. Verifica que pertenezca a tu natillera.')
    }
    
    console.log('✅ Préstamo verificado correctamente')
    console.log('📋 Admin ID del préstamo:', prestamoVerificado.socios_natillera?.natilleras?.admin_id)
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Usuario actual:', user?.id)
    
    // Generar código de comprobante único
    let codigoComprobante = generarCodigoComprobante()
    let intentos = 0
    let codigoUnico = false
    while (!codigoUnico && intentos < 5) {
      const { data: codigoExistente } = await supabase
        .from('pagos_prestamo')
        .select('id')
        .eq('codigo_comprobante', codigoComprobante)
        .limit(1)
      
      if (!codigoExistente || codigoExistente.length === 0) {
        codigoUnico = true
      } else {
        codigoComprobante = generarCodigoComprobante()
      }
      intentos++
    }
    
    // Registrar el pago
    // Usar la fecha en formato YYYY-MM-DD directamente para evitar problemas de zona horaria
    // La base de datos guardará la fecha correctamente
    const fechaPago = formAbono.fecha_pago || formatDateToLocalISO(new Date())
    
    const fp = (formAbono.tipo_pago || 'efectivo').toLowerCase()
    // El pago registrado al préstamo es SOLO la porción de capital+interés (sin mora):
    // así el plan de pagos y el saldo reflejan únicamente la deuda del préstamo.
    const v = abonoAPrestamo
    const natilleraAbono = await natillerasStore.fetchNatillera(id)
    const datosPago = {
      prestamo_id: prestamoSeleccionado.value.id,
      valor: v,
      fecha: fechaPago,
      codigo_comprobante: codigoComprobante,
      valor_efectivo: fp === 'transferencia' ? 0 : v,
      valor_transferencia: fp === 'transferencia' ? v : 0,
      nombre_socio:
        prestamoSeleccionado.value?.socio_natillera?.socio?.nombre ||
        prestamoSeleccionado.value?.socio_natillera?.nombre ||
        null,
      nombre_natillera: natilleraAbono?.nombre || null,
      origen: 'prestamos'
    }
    
    console.log('💾 Registrando abono con datos:', datosPago)
    console.log('💾 Tipo de prestamo_id:', typeof datosPago.prestamo_id)
    console.log('💾 Tipo de valor:', typeof datosPago.valor)
    
    const { data: pagoInsertado, error: errorPago } = await supabase
      .from('pagos_prestamo')
      .insert(datosPago)
      .select()
    
    console.log('📥 Respuesta del insert:', { data: pagoInsertado, error: errorPago })
    
    if (errorPago) {
      console.error('❌ Error insertando pago:', errorPago)
      console.error('❌ Código del error:', errorPago.code)
      console.error('❌ Mensaje del error:', errorPago.message)
      console.error('❌ Detalles completos:', JSON.stringify(errorPago, null, 2))
      throw new Error('Error al registrar el abono: ' + (errorPago.message || 'Error desconocido'))
    }
    
    if (!pagoInsertado || pagoInsertado.length === 0) {
      console.error('❌ No se insertó ningún pago. Respuesta vacía:', pagoInsertado)
      console.error('❌ Esto puede indicar un problema con las políticas RLS')
      throw new Error('No se pudo registrar el abono. Verifica los permisos de la base de datos.')
    }
    
    console.log('✅ Pago insertado correctamente:', pagoInsertado)
    console.log('✅ ID del pago insertado:', pagoInsertado[0]?.id)

    // Obtener datos anteriores del préstamo para auditoría
    const datosAnteriores = {
      saldo_actual: prestamoSeleccionado.value.saldo_actual,
      estado: prestamoSeleccionado.value.estado
    }
    
    // Actualizar el préstamo
    const { data, error } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoSeleccionado.value.id)
      .select(`
        *,
        socio_natillera:socios_natillera(
          natillera_id,
          socio:socios(nombre)
        )
      `)
      .single()

    if (error) throw error

    // Obtener natillera_id
    const natilleraId = data.socio_natillera?.natillera_id || null
    const nombreSocio = data.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = data.socio_natillera?.socio?.telefono || null
    
    // Registrar pago en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarPago(
        pagoInsertado[0].id,
        `Se registró un abono de $${formatMoney(formAbono.valor)} al préstamo de ${nombreSocio}. Saldo anterior: $${formatMoney(datosAnteriores.saldo_actual)}, Saldo nuevo: $${formatMoney(Math.max(0, nuevoSaldo))}`,
        {
          prestamo_id: prestamoSeleccionado.value.id,
          valor_abono: formAbono.valor,
          saldo_anterior: datosAnteriores.saldo_actual,
          saldo_nuevo: Math.max(0, nuevoSaldo),
          estado_anterior: datosAnteriores.estado,
          estado_nuevo: nuevoEstado
        },
        natilleraId
      )
    )
    
    // Registrar actualización del préstamo en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarActualizacion(
        'prestamo',
        prestamoSeleccionado.value.id,
        `Se actualizó el préstamo de ${nombreSocio}. Saldo: $${formatMoney(datosAnteriores.saldo_actual)} → $${formatMoney(Math.max(0, nuevoSaldo))}`,
        datosAnteriores,
        {
          saldo_actual: Math.max(0, nuevoSaldo),
          estado: nuevoEstado
        },
        natilleraId
      )
    )
    
    const prestamoIdAbonado = prestamoSeleccionado.value.id
    const estabaEnDetalle = prestamoDetalle.value && prestamoDetalle.value.id === prestamoIdAbonado
    
    // Actualizar plan de pagos PRIMERO: recalcular todo desde cero con todos los pagos
    // Esto debe hacerse antes de actualizar el préstamo en la lista para que tenga los datos correctos
    await actualizarPlanPagosDespuesDeEditarAbono(prestamoIdAbonado, 0) // 0 porque es un nuevo abono, no una diferencia
    
    // Actualizar el préstamo en la lista DESPUÉS de actualizar el plan de pagos
    // para que use los datos actualizados del plan de pagos (con valor_pagado actualizado)
    await actualizarPrestamoEnLista(prestamoIdAbonado)

    // Registrar en el fondo la mora COBRADA en este abono (rubro separado, no capitaliza
    // al saldo). Fire-and-forget.
    if (moraPagada > 0) registrarMoraCobradaEnFondo(natilleraId, moraPagada, fp)
    
    // Si estaba viendo el detalle, recargar los datos
    if (estabaEnDetalle) {
      await Promise.all([
        fetchPagosPrestamo(prestamoIdAbonado),
        fetchPlanPagosPrestamo(prestamoIdAbonado)
      ])
      // Actualizar también el préstamo en el detalle
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
    }
    
    // Preparar datos del comprobante
    // Usar la fecha del formulario si está disponible, sino usar la fecha actual
    const fechaPagoComprobante = formAbono.fecha_pago 
      ? (() => {
          // Convertir fecha del formulario (YYYY-MM-DD) a formato dd/MM/yyyy
          const [year, month, day] = formAbono.fecha_pago.split('-')
          return `${day}/${month}/${year}`
        })()
      : (() => {
          // Si no hay fecha seleccionada, usar fecha y hora actual
          const d = new Date()
          const day = String(d.getDate()).padStart(2, '0')
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const year = d.getFullYear()
          const hours = String(d.getHours()).padStart(2, '0')
          const minutes = String(d.getMinutes()).padStart(2, '0')
          return `${day}/${month}/${year} ${hours}:${minutes}`
        })()
    
    comprobanteAbono.value = {
      pagoPrestamoId: pagoInsertado[0].id, // ID del pago de préstamo para auditoría
      prestamoId: prestamoSeleccionado.value.id, // ID del préstamo para auditoría
      valor: formAbono.valor, // total recibido (abono a préstamo + mora)
      moraPagada, // porción de mora cobrada
      abonoAPrestamo, // porción que baja el saldo
      codigoComprobante: codigoComprobante,
      socioNombre: nombreSocio,
      socioTelefono: socioTelefono,
      fecha: fechaPagoComprobante,
      saldoAnterior: datosAnteriores.saldo_actual,
      saldoNuevo: Math.max(0, nuevoSaldo),
      prestamo: prestamoSeleccionado.value
    }
    
    cerrarModalAbono()
    
    // Abrir modal de comprobante
    modalComprobanteAbono.value = true
    
    // SIEMPRE recargar los pagos si el modal de detalle está abierto para este préstamo
    if (estabaEnDetalle) {
      console.log('🔄 Actualizando modal de detalle después del abono')
      // Actualizar el préstamo en el detalle con los nuevos datos
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
      // Esperar un momento para que la base de datos se actualice completamente
      await new Promise(resolve => setTimeout(resolve, 500))
      // Recargar los pagos del préstamo
      console.log('🔄 Recargando pagos para préstamo:', prestamoIdAbonado)
      await fetchPagosPrestamo(prestamoIdAbonado)
      // Asegurarse de que el modal de detalle esté abierto y cerrar el desplegable
      planPagosExpandido.value = false // Cerrar el desplegable
      modalDetalle.value = true
      console.log('✅ Modal de detalle actualizado, pagos recargados. Total pagos:', pagosPrestamo.value.length)
      console.log('📋 Lista de pagos:', pagosPrestamo.value)
    } else if (modalDetalle.value && prestamoDetalle.value && prestamoDetalle.value.id === prestamoIdAbonado) {
      // Si el modal de detalle está abierto para este préstamo, recargar también
      console.log('🔄 Recargando pagos en modal de detalle abierto')
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchPagosPrestamo(prestamoIdAbonado)
      console.log('✅ Pagos recargados. Total:', pagosPrestamo.value.length)
    }
    
    notificationStore.success('Abono registrado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al registrar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function abrirModalEditarAbono(pago) {
  abonoAEditar.value = {
    ...pago,
    valorOriginal: parseFloat(pago.valor),
    valor: parseFloat(pago.valor)
  }
  valorAbonoEditadoFormateado.value = formatMoney(parseFloat(pago.valor))
  modalEditarAbono.value = true
}

function actualizarValorAbonoEditado(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    abonoAEditar.value.valor = 0
    valorAbonoEditadoFormateado.value = ''
    return
  }
  
  // Convertir a número
  const numero = parseInt(valorSinFormato)
  
  // Validar que sea un número válido
  if (isNaN(numero)) {
    return
  }
  
  // Actualizar el valor numérico
  abonoAEditar.value.valor = numero
  
  // Formatear para mostrar en el input
  valorAbonoEditadoFormateado.value = formatMoney(numero)
}

async function guardarAbonoEditado() {
  if (!abonoAEditar.value || !prestamoDetalle.value) return
  
  loading.value = true
  
  try {
    const valorOriginal = parseFloat(abonoAEditar.value.valorOriginal || abonoAEditar.value.valor)
    const nuevoValor = parseFloat(abonoAEditar.value.valor)
    const diferencia = nuevoValor - valorOriginal
    const prestamoId = abonoAEditar.value.prestamo_id
    const codigoAnterior = abonoAEditar.value.codigo_comprobante
    
    // Si hay código anterior, generar nuevo código y guardar en historial (incluso si el valor no cambió)
    let nuevoCodigoComprobante = null
    if (codigoAnterior) {
      // Generar nuevo código de comprobante cuando se modifica el abono
      nuevoCodigoComprobante = generarCodigoComprobante()
      let intentos = 0
      let codigoUnico = false
      while (!codigoUnico && intentos < 5) {
        const { data: codigoExistente } = await supabase
          .from('pagos_prestamo')
          .select('id')
          .eq('codigo_comprobante', nuevoCodigoComprobante)
          .limit(1)
        
        if (!codigoExistente || codigoExistente.length === 0) {
          codigoUnico = true
        } else {
          nuevoCodigoComprobante = generarCodigoComprobante()
        }
        intentos++
      }
      
      // Guardar en historial antes de actualizar
      if (codigoUnico && nuevoCodigoComprobante) {
        try {
          // Obtener información del préstamo antes de actualizar
          const { data: pagoInfo } = await supabase
            .from('pagos_prestamo')
            .select(`
              prestamo_id,
              prestamo:prestamos(
                id,
                socio_natillera_id
              )
            `)
            .eq('id', abonoAEditar.value.id)
            .single()
          
          const prestamoIdHistorial = pagoInfo?.prestamo_id || prestamoId
          const socioNatilleraId = pagoInfo?.prestamo?.socio_natillera_id || prestamoDetalle.value.socio_natillera_id || null
          const natilleraHistorial = await natillerasStore.fetchNatillera(id)
          const nombreSocioHistorial =
            prestamoDetalle.value?.socio_natillera?.socio?.nombre ||
            prestamoDetalle.value?.socio_natillera?.nombre ||
            null
          
          const { error: historialError } = await supabase
            .from('historial_comprobantes_prestamo')
            .insert({
              pago_prestamo_id: abonoAEditar.value.id,
              prestamo_id: prestamoIdHistorial,
              socio_natillera_id: socioNatilleraId,
              codigo_comprobante_anterior: codigoAnterior,
              codigo_comprobante_nuevo: nuevoCodigoComprobante,
              valor_abono_anterior: valorOriginal,
              valor_abono_nuevo: nuevoValor,
              motivo: 'actualizacion_pago',
              fecha_actualizacion: new Date().toISOString(),
              nombre_socio: nombreSocioHistorial,
              nombre_natillera: natilleraHistorial?.nombre || null
            })
          
          if (historialError) {
            console.error('Error guardando en historial:', historialError)
            throw historialError
          }
          console.log('✅ Historial guardado correctamente para actualización')
        } catch (e) {
          console.error('No se pudo guardar en historial de comprobantes:', e.message, e)
          // No lanzar el error aquí para que la actualización continúe
        }
      }
    }
    
    // Preparar datos de actualización
    const datosActualizar = {
      valor: nuevoValor
    }
    
    // Agregar el nuevo código si se generó
    if (nuevoCodigoComprobante) {
      datosActualizar.codigo_comprobante = nuevoCodigoComprobante
    }
    
    // Actualizar el abono
    const { error: errorActualizar } = await supabase
      .from('pagos_prestamo')
      .update(datosActualizar)
      .eq('id', abonoAEditar.value.id)
    
    if (errorActualizar) throw errorActualizar
    
    // Actualizar el saldo del préstamo (restar la diferencia)
    const nuevoSaldo = (prestamoDetalle.value.saldo_actual || 0) - diferencia
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : (nuevoSaldo >= prestamoDetalle.value.monto ? 'activo' : prestamoDetalle.value.estado)
    
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorPrestamo) throw errorPrestamo
    
    // Actualizar el préstamo en la lista con toda su información recalculada
    await actualizarPrestamoEnLista(prestamoId)
    
    // Actualizar el detalle si está abierto
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      const prestamoEnLista = prestamos.value.find(p => p.id === prestamoId)
      if (prestamoEnLista) {
        prestamoDetalle.value = { ...prestamoDetalle.value, ...prestamoEnLista }
      }
      // Recargar los pagos y actualizar el plan de pagos
      await Promise.all([
        fetchPagosPrestamo(prestamoId),
        actualizarPlanPagosDespuesDeEditarAbono(prestamoId, diferencia)
      ])
    }
    
    modalEditarAbono.value = false
    abonoAEditar.value = null
    if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    notificationStore.success('Abono actualizado correctamente', 'Éxito')
  } catch (e) {
    console.error('Error actualizando abono:', e)
    notificationStore.error(e.message || 'Error al actualizar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarAbono(pago) {
  abonoAEliminar.value = pago
}

async function eliminarAbonoConfirmado() {
  if (!abonoAEliminar.value || !prestamoDetalle.value) return
  
  loading.value = true
  
  try {
    const valorAbono = parseFloat(abonoAEliminar.value.valor)
    const prestamoId = abonoAEliminar.value.prestamo_id
    const codigoComprobante = abonoAEliminar.value.codigo_comprobante
    const nuevoSaldo = (prestamoDetalle.value.saldo_actual || 0) + valorAbono
    const nuevoEstado = nuevoSaldo >= prestamoDetalle.value.monto ? 'activo' : prestamoDetalle.value.estado
    
    // Obtener información del usuario que elimina
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'Usuario desconocido'
    
    // Guardar en historial ANTES de eliminar (si tiene código de comprobante)
    // Importante: guardar antes de eliminar para poder obtener la información del préstamo
    // Registrar TODOS los códigos relacionados (actual y anteriores) para trazabilidad completa
    if (codigoComprobante) {
      try {
        // Obtener información del préstamo antes de eliminar
        const { data: pagoInfo } = await supabase
          .from('pagos_prestamo')
          .select(`
            prestamo_id,
            prestamo:prestamos(
              id,
              socio_natillera_id
            )
          `)
          .eq('id', abonoAEliminar.value.id)
          .single()
        
        const prestamoIdHistorial = pagoInfo?.prestamo_id || prestamoId
        const socioNatilleraId = pagoInfo?.prestamo?.socio_natillera_id || prestamoDetalle.value.socio_natillera_id || null
        const natilleraElim = await natillerasStore.fetchNatillera(id)
        const nombreSocioElim =
          prestamoDetalle.value?.socio_natillera?.socio?.nombre ||
          prestamoDetalle.value?.socio_natillera?.nombre ||
          null
        
        // Buscar todos los códigos anteriores en el historial
        const { data: historialesAnteriores } = await supabase
          .from('historial_comprobantes_prestamo')
          .select('codigo_comprobante_anterior, codigo_comprobante_nuevo')
          .eq('pago_prestamo_id', abonoAEliminar.value.id)
          .order('fecha_actualizacion', { ascending: true })
        
        // Recolectar todos los códigos únicos (anteriores y actual)
        const codigosParaRegistrar = new Set()
        
        // Agregar el código actual
        codigosParaRegistrar.add(codigoComprobante)
        
        // Agregar todos los códigos anteriores del historial
        if (historialesAnteriores && historialesAnteriores.length > 0) {
          historialesAnteriores.forEach(hist => {
            if (hist.codigo_comprobante_anterior) {
              codigosParaRegistrar.add(hist.codigo_comprobante_anterior)
            }
            if (hist.codigo_comprobante_nuevo) {
              codigosParaRegistrar.add(hist.codigo_comprobante_nuevo)
            }
          })
        }
        
        // Registrar cada código en el historial con información de eliminación
        const registrosHistorial = Array.from(codigosParaRegistrar).map(codigo => ({
          pago_prestamo_id: abonoAEliminar.value.id,
          prestamo_id: prestamoIdHistorial,
          socio_natillera_id: socioNatilleraId,
          codigo_comprobante_anterior: codigo,
          codigo_comprobante_nuevo: null,
          valor_abono_anterior: valorAbono,
          valor_abono_nuevo: 0,
          motivo: 'eliminacion_pago',
          eliminado: true,
          eliminado_por: user?.id || null,
          eliminado_por_email: userEmail,
          eliminado_el: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          nombre_socio: nombreSocioElim,
          nombre_natillera: natilleraElim?.nombre || null
        }))
        
        // Insertar todos los registros
        const { error: historialError } = await supabase
          .from('historial_comprobantes_prestamo')
          .insert(registrosHistorial)
        
        if (historialError) {
          console.error('Error guardando en historial:', historialError)
          // No lanzar el error aquí para que la eliminación continúe
          // pero registrar el error para debugging
        } else {
          console.log(`✅ Historial guardado correctamente para eliminación. ${registrosHistorial.length} código(s) registrado(s):`, Array.from(codigosParaRegistrar))
        }
      } catch (e) {
        console.error('No se pudo guardar en historial de comprobantes:', e.message, e)
        // No lanzar el error aquí, solo registrar, para que la eliminación continúe
      }
    }
    
    // Eliminar el abono
    const { error: errorEliminar } = await supabase
      .from('pagos_prestamo')
      .delete()
      .eq('id', abonoAEliminar.value.id)
    
    if (errorEliminar) throw errorEliminar
    
    // Actualizar el saldo del préstamo
    const { data: prestamoActualizado, error: errorActualizar } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: nuevoSaldo,
        estado: nuevoEstado
      })
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorActualizar) throw errorActualizar
    
    // Actualizar el préstamo en la lista con toda su información recalculada
    await actualizarPrestamoEnLista(prestamoId)
    
    // Actualizar el detalle si está abierto
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      const prestamoEnLista = prestamos.value.find(p => p.id === prestamoId)
      if (prestamoEnLista) {
        prestamoDetalle.value = { ...prestamoDetalle.value, ...prestamoEnLista }
      }
      // Recargar los pagos y actualizar el plan de pagos
      await Promise.all([
        fetchPagosPrestamo(prestamoId),
        actualizarPlanPagosDespuesDeEditarAbono(prestamoId, -valorAbono) // Negativo porque se eliminó
      ])
    }
    
    abonoAEliminar.value = null
    if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    notificationStore.success('Abono eliminado correctamente', 'Éxito')
  } catch (e) {
    console.error('Error eliminando abono:', e)
    notificationStore.error(e.message || 'Error al eliminar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarPrestamo(prestamo) {
  prestamoAEliminar.value = prestamo
}

async function eliminarPrestamoConfirmado() {
  if (!prestamoAEliminar.value) return
  loading.value = true

  try {
    // Guardar datos del préstamo antes de eliminar para auditoría
    const prestamoEliminar = prestamoAEliminar.value
    const nombreSocio = prestamoEliminar.socio_natillera?.socio?.nombre || 'Socio'
    
    // Obtener natillera_id
    let natilleraId = null
    if (prestamoEliminar.socio_natillera_id) {
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', prestamoEliminar.socio_natillera_id)
        .single()
      natilleraId = socioNatillera?.natillera_id || null
    }
    
    // Primero eliminar todos los pagos relacionados
    const { error: errorPagos } = await supabase
      .from('pagos_prestamo')
      .delete()
      .eq('prestamo_id', prestamoAEliminar.value.id)

    if (errorPagos) {
      console.error('Error eliminando pagos:', errorPagos)
      // Continuar aunque haya error en pagos, puede que no haya pagos
    }

    // Eliminar el interés del préstamo de utilidades_clasificadas antes de eliminar el préstamo
    if (natilleraId) {
      await eliminarInteresPrestamo(natilleraId, prestamoAEliminar.value.id)
    }

    // Luego eliminar el préstamo
    const { error } = await supabase
      .from('prestamos')
      .delete()
      .eq('id', prestamoAEliminar.value.id)

    if (error) throw error

    // Registrar eliminación en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarEliminacion(
        'prestamo',
        prestamoEliminar.id,
        `Se eliminó el préstamo de $${formatMoney(prestamoEliminar.monto)} de ${nombreSocio}`,
        {
          monto: prestamoEliminar.monto,
          interes: prestamoEliminar.interes,
          saldo_actual: prestamoEliminar.saldo_actual,
          estado: prestamoEliminar.estado,
          tipo_interes: prestamoEliminar.tipo_interes,
          numero_cuotas: prestamoEliminar.numero_cuotas
        },
        natilleraId
      )
    )

    prestamoAEliminar.value = null
    if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    
    // Recargar todos los préstamos y planes de pago para actualizar los indicadores
    await fetchPrestamos()
    
    notificationStore.success('Préstamo eliminado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al eliminar el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

async function abrirModalCompartirPrestamo() {
  if (!prestamoDetalle.value) return
  modalCompartirPrestamo.value = true
  await Promise.all([
    fetchPlanPagosPrestamo(prestamoDetalle.value.id),
    fetchHistorialRefinanciaciones(prestamoDetalle.value.id)
  ])
  await nextTick()
  await nextTick()
  programarNatiscrollModalCompartirPrestamo()
  await new Promise((resolve) => setTimeout(resolve, 80))
}

async function generarImagenPrestamo() {
  if (!prestamoDetalle.value || !prestamoRef.value) return null
  try {
    await nextTick()
    return await toPng(prestamoRef.value, {
      backgroundColor: '#eef1f4',
      pixelRatio: 3,
      cacheBust: true
    })
  } catch (e) {
    console.error('Error generando imagen préstamo:', e)
    return null
  }
}

async function descargarPrestamo() {
  if (!prestamoDetalle.value) {
    notificationStore.error('No hay información del préstamo disponible.', 'Error')
    return
  }
  
  // Asegurar que el modal esté abierto
  if (!modalCompartirPrestamo.value) {
    await abrirModalCompartirPrestamo()
  }
  
  generandoImagenPrestamo.value = true
  
  try {
    const dataUrl = await generarImagenPrestamo()
    
    if (!dataUrl) {
      throw new Error('No se pudo generar la imagen')
    }
    
    const link = document.createElement('a')
    link.download = `prestamo-${prestamoDetalle.value?.socio_natillera?.socio?.nombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    notificationStore.success('Imagen descargada exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error completo:', e)
    notificationStore.error('Error al generar la imagen: ' + e.message, 'Error')
  } finally {
    generandoImagenPrestamo.value = false
  }
}

async function compartirPrestamoWhatsApp() {
  if (!prestamoDetalle.value) return
  
  // Asegurar que el modal esté abierto
  if (!modalCompartirPrestamo.value) {
    await abrirModalCompartirPrestamo()
  }
  
  generandoImagenPrestamo.value = true
  
  try {
    const dataUrl = await generarImagenPrestamo()
    if (!dataUrl) throw new Error('No se pudo generar la imagen')
    
    const blob = await fetch(dataUrl).then(r => r.blob())
    const nombreSocio = prestamoDetalle.value.socio_natillera?.socio?.nombre || 'prestamo'
    const nombreArchivo = `prestamo-${nombreSocio.replace(/\s+/g, '-')}-${Date.now()}.png`
    const archivo = new File([blob], nombreArchivo, { type: 'image/png' })
    
    // Crear mensaje con el nombre del socio
    const mensajeCompartir = `Hola ${nombreSocio} 👋\n\nTe envío la información de tu préstamo en la natillera.\n\n¡Gracias por confiar en nosotros! 🙌`
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: `Información del Préstamo - ${nombreSocio}`,
        text: mensajeCompartir
      })
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `prestamo-${prestamoDetalle.value?.socio_natillera?.socio?.nombre?.replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = prestamoDetalle.value.socio_natillera?.socio?.telefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${prestamoDetalle.value.socio_natillera?.socio?.nombre} 👋\n\nTe envío la información de tu préstamo. ¡Gracias por confiar en nosotros! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
      }, 500)
      
      notificationStore.info('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.', 'Descargado')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      // Fallback: solo abrir WhatsApp con texto
      const telefono = prestamoDetalle.value.socio_natillera?.socio?.telefono?.replace(/\D/g, '')
      if (telefono) {
        const mensaje = `Hola ${prestamoDetalle.value.socio_natillera?.socio?.nombre} 👋\n\nTe envío la información de tu préstamo en la natillera.\n\n¡Gracias por confiar en nosotros! 🙌`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }
    }
  } finally {
    generandoImagenPrestamo.value = false
  }
}

// Función para abrir el modal de compartir préstamo nuevo
function abrirModalCompartirPrestamoWhatsApp() {
  if (!socioSeleccionado.value) {
    notificationStore.error('Debes seleccionar un socio primero', 'Error')
    return
  }
  
  // Inicializar contacto seleccionado con el socio si tiene teléfono
  if (socioSeleccionado.value.socio?.telefono) {
    contactoSeleccionadoWhatsApp.value = {
      nombre: socioSeleccionado.value.socio.nombre,
      telefono: socioSeleccionado.value.socio.telefono
    }
  } else {
    contactoSeleccionadoWhatsApp.value = { nombre: '', telefono: '' }
  }
  
  modalCompartirPrestamoNuevo.value = true
}

// Función para generar imagen del préstamo nuevo (captura el comprobante del DOM)
async function generarImagenPrestamoNuevo() {
  if (!socioSeleccionado.value || !prestamoNuevoRef.value) return null
  try {
    await nextTick()
    return await toPng(prestamoNuevoRef.value, {
      backgroundColor: '#ecfdf5',
      pixelRatio: 2,
      cacheBust: true
    })
  } catch (e) {
    console.error('Error generando imagen préstamo nuevo:', e)
    return null
  }
}

// Descargar resumen del préstamo (paso Resumen del modal Crear Préstamo) como imagen
async function descargarResumenPrestamoNuevo() {
  if (!resumenPrestamoNuevoRef.value) return
  generandoResumenPrestamo.value = true
  try {
    await nextTick()
    const dataUrl = await toPng(resumenPrestamoNuevoRef.value, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true
    })
    if (!dataUrl) throw new Error('No se pudo generar la imagen')
    const link = document.createElement('a')
    const nombre = socioSeleccionado.value?.socio?.nombre?.replace(/\s+/g, '-') || 'resumen-prestamo'
    link.download = `resumen-prestamo-${nombre}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notificationStore.success('Resumen descargado', 'Éxito')
  } catch (e) {
    console.error('Error al descargar resumen:', e)
    notificationStore.error(e.message || 'No se pudo descargar el resumen', 'Error')
  } finally {
    generandoResumenPrestamo.value = false
  }
}

// Función para descargar imagen del préstamo nuevo
async function descargarPrestamoNuevo() {
  if (!socioSeleccionado.value) {
    notificationStore.error('No hay información del préstamo disponible', 'Error')
    return
  }
  
  generandoImagenPrestamoNuevo.value = true
  
  try {
    const dataUrl = await generarImagenPrestamoNuevo()
    
    if (!dataUrl) {
      throw new Error('No se pudo generar la imagen')
    }
    
    const prefijo = esComprobanteRealCompartir.value ? 'comprobante-prestamo' : 'proyeccion-prestamo'
    const link = document.createElement('a')
    link.download = `${prefijo}-${socioSeleccionado.value.socio?.nombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notificationStore.success(esComprobanteRealCompartir.value ? 'Imagen del comprobante descargada' : 'Imagen de proyección descargada', 'Éxito')
  } catch (e) {
    console.error('Error al generar imagen:', e)
    notificationStore.error('Error al generar la imagen: ' + e.message, 'Error')
  } finally {
    generandoImagenPrestamoNuevo.value = false
  }
}

// Función para compartir préstamo nuevo por WhatsApp
async function compartirPrestamoNuevoWhatsApp() {
  if (!socioSeleccionado.value || !contactoSeleccionadoWhatsApp.value?.telefono) {
    notificationStore.error('Debes seleccionar un contacto con teléfono', 'Error')
    return
  }
  
  generandoImagenPrestamoNuevo.value = true
  
  try {
    const dataUrl = await generarImagenPrestamoNuevo()
    if (!dataUrl) throw new Error('No se pudo generar la imagen')
    
    const blob = await fetch(dataUrl).then(r => r.blob())
    
    // El préstamo ya está creado → comprobante real; si no, proyección (simulación)
    const esReal = esComprobanteRealCompartir.value

    // Nombre del archivo
    const nombreContacto = contactoSeleccionadoWhatsApp.value.nombre || 'contacto'
    const prefijoArchivo = esReal ? 'comprobante-prestamo' : 'proyeccion-prestamo'
    const nombreArchivo = `${prefijoArchivo}-${nombreContacto.replace(/\s+/g, '-')}-${Date.now()}.png`
    const archivo = new File([blob], nombreArchivo, { type: 'image/png' })

    // Crear mensaje personalizado según si es comprobante real o proyección
    const nombreSocio = socioSeleccionado.value.socio?.nombre || 'Socio'
    const mensajeCompartir = esReal
      ? `Hola ${contactoSeleccionadoWhatsApp.value.nombre || nombreSocio} 👋\n\nTe envío el *comprobante* del préstamo de ${nombreSocio} en la natillera, ya registrado en el sistema.\n\n¡Gracias por confiar en nosotros! 🙌`
      : `Hola ${contactoSeleccionadoWhatsApp.value.nombre || nombreSocio} 👋\n\nTe envío una *proyección* del posible préstamo de ${nombreSocio} en la natillera (simulación con los datos actuales). *Aún no está registrado ni generado en el sistema*; al confirmarlo en la app recibirás el comprobante oficial.\n\n¡Gracias por confiar en nosotros! 🙌`

    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: esReal ? `Comprobante de préstamo — ${nombreSocio}` : `Proyección de préstamo (no oficial) — ${nombreSocio}`,
        text: mensajeCompartir
      })

      notificationStore.success(esReal ? 'Comprobante compartido' : 'Proyección compartida', 'Éxito')
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = nombreArchivo
      link.href = dataUrl
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = contactoSeleccionadoWhatsApp.value.telefono.replace(/\D/g, '')
        if (telefono) {
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensajeCompartir)}`, '_blank')
        }
      }, 500)
      
      notificationStore.info(
        esReal
          ? '📱 Imagen del comprobante descargada. Adjúntala en WhatsApp.'
          : '📱 Imagen de proyección descargada. Adjunta en WhatsApp; aún no es préstamo creado.',
        'Descargado'
      )
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      // Fallback: solo abrir WhatsApp con texto
      const telefono = contactoSeleccionadoWhatsApp.value.telefono?.replace(/\D/g, '')
      if (telefono) {
        const nombreSocio = socioSeleccionado.value.socio?.nombre || 'Socio'
        const mensaje = esComprobanteRealCompartir.value
          ? `Hola ${contactoSeleccionadoWhatsApp.value.nombre || nombreSocio} 👋\n\nTe envío el *comprobante* del préstamo de ${nombreSocio} en la natillera, ya registrado en el sistema.\n\n¡Gracias por confiar en nosotros! 🙌`
          : `Hola ${contactoSeleccionadoWhatsApp.value.nombre || nombreSocio} 👋\n\nTe envío una *proyección* del posible préstamo de ${nombreSocio} en la natillera. *Aún no está generado en el sistema*; el comprobante oficial sale al confirmar en la app.\n\n¡Gracias por confiar en nosotros! 🙌`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }
    }
  } finally {
    generandoImagenPrestamoNuevo.value = false
  }
}
</script>

<style>
/* Ventana de carga "Generando préstamo" - compatible Safari/iPhone (no scoped para Teleport a body) */
.generando-prestamo-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  touch-action: none;
  overflow: hidden;
}

.generando-prestamo-card {
  background: linear-gradient(145deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%);
  border-radius: 1.5rem;
  padding: 2rem 2rem 2.25rem;
  max-width: 20rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.8),
              0 0 40px rgba(16, 185, 129, 0.15);
}

.generando-prestamo-icon-wrap {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.25rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
}

.generando-prestamo-icon {
  width: 2rem;
  height: 2rem;
  color: white;
  flex-shrink: 0;
}

.generando-prestamo-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.generando-prestamo-subtitle {
  font-size: 0.875rem;
  color: #047857;
  margin: 0 0 1.5rem;
  line-height: 1.5;
  opacity: 0.95;
}

.generando-prestamo-spinner {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto;
  border: 3px solid #a7f3d0;
  border-top-color: #059669;
  border-radius: 50%;
  -webkit-animation: generando-prestamo-spin 0.8s linear infinite;
  animation: generando-prestamo-spin 0.8s linear infinite;
}

@-webkit-keyframes generando-prestamo-spin {
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes generando-prestamo-spin {
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

/* Transición de entrada/salida */
.generando-prestamo-enter-active,
.generando-prestamo-leave-active {
  transition: opacity 0.25s ease;
}

.generando-prestamo-enter-active .generando-prestamo-card,
.generando-prestamo-leave-active .generando-prestamo-card {
  transition: transform 0.25s ease;
}

.generando-prestamo-enter-from,
.generando-prestamo-leave-to {
  opacity: 0;
}

.generando-prestamo-enter-from .generando-prestamo-card,
.generando-prestamo-leave-to .generando-prestamo-card {
  transform: scale(0.95);
  opacity: 0;
}
</style>

<style scoped>
/* CTA «+» icon-only en la cabecera móvil (hereda color/radio de .ds-btn--primary) */
.prestamos-header-add {
  width: 44px;
  min-width: 44px;
  padding: 0;
  flex-shrink: 0;
}

/* ---------- Panel que envuelve las secciones de préstamos ---------- */
.prestamos-panel {
  background: #fff;
  border: 1px solid var(--surface-divider, #e5e7eb);
  border-radius: var(--radius-xl, 1rem);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.08));
  overflow: hidden;
}
.prestamos-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--surface-divider, #e5e7eb);
  background: linear-gradient(180deg, #fbfdfb 0%, #ffffff 100%);
}
@media (min-width: 640px) {
  .prestamos-panel__head { padding: 0.875rem 1.125rem; }
}
.prestamos-panel__summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
  margin-left: auto;
}
.prestamos-panel__summary-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.prestamos-panel__summary-value {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--brand-primary, #1b5e37);
  margin-top: 0.125rem;
}
.prestamos-panel__body {
  padding: 0.75rem;
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(200, 217, 200, 0.16) 0%, transparent 60%),
    #f8fafc;
}
@media (min-width: 640px) {
  .prestamos-panel__body { padding: 1rem; }
}
.prestamos-panel__empty {
  border: 1px dashed var(--surface-divider, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  background: #fff;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

/* ---------- Segmented control: Por cobrar / Pagados ---------- */
.prestamos-tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.75rem;
  background: #f1f5f9;
}
@media (max-width: 639px) {
  .prestamos-tabs { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
}
.prestamos-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  background: transparent;
  transition: color 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
}
.prestamos-tab:hover {
  color: #334155;
}
.prestamos-tab--active {
  color: var(--brand-primary, #1b5e37);
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(27, 94, 55, 0.12);
}
.prestamos-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  background: #e2e8f0;
  color: #475569;
}
.prestamos-tab--active .prestamos-tab__count {
  background: var(--brand-primary-soft, #e8f5e9);
  color: var(--brand-primary, #1b5e37);
}

/* Información de mora colapsable en móvil */
.mora-info-collapsed {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* En desktop, siempre visible */
@media (min-width: 640px) {
  .mora-info-collapsed {
    max-height: none !important;
    opacity: 1 !important;
    overflow: visible !important;
  }
}

.mora-info-expanded {
  max-height: 500px;
  opacity: 1;
}

/* Badge bonito para la forma en que se entregó el préstamo */
.forma-pago-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.85rem 0.5rem 0.55rem;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  background: #fff;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.forma-pago-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--fp-bg-grad);
  opacity: 0.55;
  z-index: -1;
}

.forma-pago-badge:hover {
  transform: translateY(-1px);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.08),
    0 2px 5px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.forma-pago-badge__icon-wrap {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--fp-icon-bg);
  box-shadow:
    0 4px 10px var(--fp-icon-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.forma-pago-badge__text {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.05;
  gap: 0.1rem;
}

.forma-pago-badge__label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fp-label);
  opacity: 0.78;
}

.forma-pago-badge__value {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--fp-value);
}

/* Variante: efectivo (verde marca) */
.forma-pago-badge--efectivo {
  --fp-bg-grad: linear-gradient(135deg, hsl(152 80% 95%) 0%, hsl(152 70% 88%) 100%);
  --fp-icon-bg: linear-gradient(135deg, hsl(152 69% 32%) 0%, hsl(152 69% 22%) 100%);
  --fp-icon-glow: hsl(152 69% 22% / 0.35);
  --fp-label: hsl(152 45% 30%);
  --fp-value: hsl(152 60% 22%);
  border-color: hsl(152 50% 70% / 0.6);
}

/* Variante: transferencia (azul/índigo) */
.forma-pago-badge--transferencia {
  --fp-bg-grad: linear-gradient(135deg, hsl(214 90% 96%) 0%, hsl(230 80% 92%) 100%);
  --fp-icon-bg: linear-gradient(135deg, hsl(217 80% 50%) 0%, hsl(230 75% 42%) 100%);
  --fp-icon-glow: hsl(220 70% 40% / 0.32);
  --fp-label: hsl(220 50% 35%);
  --fp-value: hsl(220 65% 28%);
  border-color: hsl(220 60% 75% / 0.55);
}
</style>


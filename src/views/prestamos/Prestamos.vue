<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <Breadcrumbs />
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl px-6 py-4 sm:px-8 sm:py-5 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <BackButton :to="`/natilleras/${id}`" />
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-14 sm:pl-0">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Préstamos
              </h1>
              <p class="text-gray-600 mt-0.5 text-sm sm:text-base font-medium">
                Gestiona los préstamos internos del fondo
              </p>
            </div>
          </div>
          <button @click="modalNuevoPrestamo = true" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            Nuevo Préstamo
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-1">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-400 to-natillera-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-natillera-500/30 mx-auto">
            <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ prestamos.length }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Total Préstamos</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-accent-50/30 to-orange-50/20 border border-accent-200/50 shadow-lg hover:shadow-xl hover:shadow-accent-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-2">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-400/15 to-orange-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalPrestado) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Prestado</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 border border-blue-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-3">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalPagado) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Total Pagado</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border border-green-200/50 shadow-lg hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-4">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalIntereses) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Intereses Ganados</p>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="prestamos.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
          <BanknotesIcon class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
          No hay préstamos registrados
        </h3>
        <p class="text-gray-600 mb-8 text-sm sm:text-base">
          Los préstamos internos generan intereses para el fondo común
        </p>
        <button @click="modalNuevoPrestamo = true" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <PlusIcon class="w-5 h-5" />
          Crear Préstamo
        </button>
      </div>
    </div>

    <div v-else class="space-y-4 sm:space-y-5">
      <div 
        v-for="prestamo in prestamos" 
        :key="prestamo.id"
        @click="abrirModalDetalle(prestamo)"
        :class="[
          'group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer',
          prestamo.tieneCuotasVencidas 
            ? 'bg-gradient-to-br from-white via-rose-50/40 to-amber-50/30 border-2 border-rose-300/60 hover:shadow-rose-500/25 mora-card' 
            : 'bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 hover:shadow-natillera-500/20 p-5 sm:p-6'
        ]"
      >
        <!-- Efectos decorativos mejorados -->
        <div 
          :class="[
            'absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2',
            prestamo.tieneCuotasVencidas
              ? 'bg-gradient-to-br from-rose-400/20 via-amber-400/15 to-orange-400/10'
              : 'bg-gradient-to-br from-natillera-400/15 to-emerald-400/10'
          ]"
        ></div>
        <div 
          :class="[
            'absolute bottom-0 left-0 w-28 h-28 rounded-full blur-xl translate-y-1/2 -translate-x-1/2',
            prestamo.tieneCuotasVencidas
              ? 'bg-gradient-to-tr from-amber-400/20 via-rose-400/15 to-red-400/10'
              : 'bg-gradient-to-tr from-teal-400/15 to-natillera-400/10'
          ]"
        ></div>
        
        <!-- Barra lateral de mora mejorada -->
        <div 
          v-if="prestamo.tieneCuotasVencidas"
          class="absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 bg-gradient-to-b from-rose-500 via-amber-500 to-orange-500 mora-bar rounded-l-3xl"
        ></div>
        
        <!-- Header de alerta de mora elegante -->
        <div 
          v-if="prestamo.tieneCuotasVencidas"
          class="relative z-10 mb-4 pt-5 px-6"
        >
          <!-- Header compacto en móvil, completo en desktop -->
          <div class="flex items-center justify-between gap-3 pb-4 border-b border-rose-200/60">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 mora-alert-icon flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display font-bold text-gray-800 text-base sm:text-lg">Préstamo en Morosidad</h3>
                <p class="text-xs sm:text-sm text-gray-600 font-medium hidden sm:block">Requiere atención inmediata</p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="mora-days-badge bg-gradient-to-r from-rose-500 to-amber-500 text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                <span class="font-bold">{{ prestamo.diasMora }}</span>
                <span class="text-xs opacity-90 hidden sm:inline">días</span>
              </span>
              <!-- Botón para expandir/colapsar en móvil -->
              <button
                @click.stop="toggleMoraInfo(prestamo.id)"
                class="sm:hidden p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-all"
              >
                <ChevronDownIcon 
                  :class="['w-5 h-5 transition-transform duration-300', prestamosMoraExpandidos.has(prestamo.id) ? 'rotate-180' : '']" 
                />
              </button>
            </div>
          </div>
          
          <!-- Información de mora destacada - Visible en desktop, colapsable en móvil -->
          <div 
            :class="[
              'grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 transition-all duration-300 ease-in-out',
              prestamosMoraExpandidos.has(prestamo.id) 
                ? 'mora-info-expanded' 
                : 'mora-info-collapsed'
            ]"
          >
            <div class="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-lg p-2.5 sm:p-3 border border-rose-200/50 backdrop-blur-sm">
              <p class="text-xs text-rose-700 font-semibold mb-0.5 sm:mb-1">Cuotas Vencidas</p>
              <p class="text-base sm:text-lg font-bold text-rose-800">{{ prestamo.cuotasVencidas }} {{ prestamo.cuotasVencidas === 1 ? 'cuota' : 'cuotas' }}</p>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-2.5 sm:p-3 border border-amber-200/50 backdrop-blur-sm">
              <p class="text-xs text-amber-700 font-semibold mb-0.5 sm:mb-1">Monto en Deuda</p>
              <p class="text-base sm:text-lg font-bold text-amber-800">${{ formatMoney(prestamo.valorCuotasEnDeuda || 0) }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-2.5 sm:p-3 border border-blue-200/50 backdrop-blur-sm col-span-2 sm:col-span-1">
              <p class="text-xs text-blue-700 font-semibold mb-0.5 sm:mb-1">Fecha de Pago</p>
              <p class="text-sm sm:text-base font-bold text-blue-800">{{ prestamo.fechaPagoCuotaVencida ? formatDate(prestamo.fechaPagoCuotaVencida) : 'N/A' }}</p>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-2.5 sm:p-3 border border-orange-200/50 backdrop-blur-sm col-span-2 sm:col-span-1">
              <p class="text-xs text-orange-700 font-semibold mb-0.5 sm:mb-1">Estado</p>
              <p class="text-sm sm:text-base font-bold text-orange-800 capitalize">{{ prestamo.estado }}</p>
            </div>
          </div>
        </div>
        
        <div :class="['relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5', prestamo.tieneCuotasVencidas ? 'px-6 pb-5' : '']">
          <div class="flex items-center gap-3">
            <div 
              :class="[
                'w-14 h-14 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 relative flex-shrink-0',
                prestamo.tieneCuotasVencidas 
                  ? 'bg-gradient-to-br from-rose-500 to-amber-500 shadow-rose-500/40' :
                prestamo.estado === 'pagado' ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 
                prestamo.estado === 'activo' ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 
                'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-500/30'
              ]"
            >
              <BanknotesIcon class="w-7 h-7 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-display font-semibold text-gray-800 text-lg sm:text-base truncate">
                {{ prestamo.socio_natillera?.socio?.nombre || 'Socio' }}
              </p>
              <p class="text-sm sm:text-xs text-gray-500 font-medium">
                {{ formatDate(prestamo.created_at) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-center lg:text-right">
            <div class="bg-white/60 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm border border-gray-200/50 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Monto</p>
              <p class="font-bold text-gray-800 text-sm sm:text-xs lg:text-sm">${{ formatMoney(prestamo.monto) }}</p>
            </div>
            <div class="bg-white/60 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm border border-blue-200/50 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Pagado</p>
              <p class="font-bold text-blue-600 text-sm sm:text-xs lg:text-sm">${{ formatMoney(calcularValorPagadoDetalle(prestamo)) }}</p>
            </div>
            <div class="bg-white/60 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm border border-accent-200/50 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Interés</p>
              <p class="font-bold text-accent-600 text-sm sm:text-xs lg:text-sm">{{ prestamo.interes }}%</p>
            </div>
            <div class="bg-white/60 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm border border-gray-200/50 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Saldo</p>
              <p class="font-bold text-sm sm:text-xs lg:text-sm" :class="prestamo.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">${{ formatMoney(prestamo.saldo_actual) }}</p>
            </div>
          </div>

          <!-- Botones - En móvil: 45% 45% 10%, en desktop flex normal -->
          <div class="w-full sm:w-auto flex sm:items-center sm:gap-2 sm:flex-wrap gap-2">
            <span 
              v-if="!prestamo.tieneCuotasVencidas"
              :class="[
                'hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                prestamo.estado === 'pagado' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 
                prestamo.estado === 'activo' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 
                  'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
              ]"
            >
              {{ prestamo.estado }}
            </span>
            
            <!-- Botones en móvil: 45% 45% 10% -->
            <template v-if="prestamo.estado === 'activo'">
              <button 
                @click.stop="abrirModalAbono(prestamo)"
                :class="[
                  'w-[45%] sm:w-auto sm:flex-none py-3 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-1.5',
                  prestamo.tieneCuotasVencidas
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/25'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/20'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Abonar</span>
              </button>
              <button 
                @click.stop="abrirModalRefinanciar(prestamo)"
                class="hidden w-[45%] sm:w-auto sm:flex-none py-3 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-purple-500/20 flex items-center justify-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="hidden sm:inline">Refinanciar</span>
                <span class="sm:hidden">Refin.</span>
              </button>
            </template>
            <button 
              @click.stop="confirmarEliminarPrestamo(prestamo)"
              class="w-[10%] sm:w-auto sm:flex-none py-3 px-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/20 flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <TrashIcon class="w-4 h-4 flex-shrink-0" />
              <span class="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Préstamo -->
    <div v-if="modalNuevoPrestamo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalNuevoPrestamo = false"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Nuevo Préstamo
                </h3>
                <p class="text-white/90 text-xs">Registra un nuevo préstamo para un socio</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div ref="modalNuevoPrestamoScrollRef" class="flex-1 overflow-y-auto">
          <form @submit.prevent="handleCrearPrestamo" class="p-4 sm:p-6 space-y-4">
          <!-- Selector de Socio -->
          <div class="relative selector-socio-container">
            <label class="label mb-2">Socio *</label>
            <div class="relative">
              <button
                type="button"
                @click="mostrarSelectorSocio = !mostrarSelectorSocio"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 rounded-xl transition-all',
                  formPrestamo.socio_natillera_id 
                    ? 'border-natillera-300 hover:border-natillera-400' 
                    : 'border-gray-200 hover:border-gray-300',
                  mostrarSelectorSocio ? 'border-natillera-500 shadow-lg' : ''
                ]"
              >
                <div v-if="socioSeleccionado" class="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)" 
                    :alt="socioSeleccionado.socio?.nombre"
                    class="w-10 h-10 rounded-xl border-2 border-natillera-200 flex-shrink-0 object-cover"
                  />
                  <div class="flex-1 min-w-0 text-left">
                    <p class="font-semibold text-gray-800 truncate">{{ socioSeleccionado.socio?.nombre }}</p>
                    <p v-if="socioSeleccionado.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socioSeleccionado.socio.telefono }}</p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3 flex-1 text-gray-500">
                  <div class="w-10 h-10 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
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
                class="absolute z-50 w-full mt-2 bg-white border-2 border-natillera-200 rounded-xl shadow-2xl max-h-80 overflow-hidden"
              >
                <!-- Búsqueda -->
                <div class="p-3 border-b border-gray-200 sticky top-0 bg-white">
                  <input
                    v-model="busquedaSocio"
                    type="text"
                    placeholder="Buscar socio..."
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                    @click.stop
                  />
                </div>
                <!-- Lista de socios -->
                <div class="overflow-y-auto max-h-64">
                  <button
                    v-for="socio in sociosFiltrados"
                    :key="socio.id"
                    type="button"
                    @click="seleccionarSocio(socio)"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-natillera-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    :class="formPrestamo.socio_natillera_id === socio.id ? 'bg-natillera-50' : ''"
                  >
                    <img 
                      :src="getAvatarUrl(socio.socio?.nombre || socio.id, socio.socio?.avatar_seed, socio.socio?.avatar_style)" 
                      :alt="socio.socio?.nombre"
                      class="w-10 h-10 rounded-xl border-2 border-natillera-200 flex-shrink-0 object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800 truncate">{{ socio.socio?.nombre }}</p>
                      <p v-if="socio.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socio.socio.telefono }}</p>
                      <p v-else-if="socio.socio?.email" class="text-xs text-gray-500 truncate">{{ socio.socio.email }}</p>
                    </div>
                    <div v-if="formPrestamo.socio_natillera_id === socio.id" class="flex-shrink-0">
                      <div class="w-5 h-5 bg-natillera-500 rounded-full flex items-center justify-center">
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
          </div>

          <!-- Periodicidad de pago -->
          <div>
            <label class="label mb-2">Periodicidad de pago *</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="formPrestamo.periodicidad = 'mensual'"
                :class="[
                  'relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  formPrestamo.periodicidad === 'mensual'
                    ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20 ring-2 ring-natillera-200'
                    : 'border-gray-200 bg-white hover:border-natillera-300 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <div 
                    :class="[
                      'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      formPrestamo.periodicidad === 'mensual'
                        ? 'bg-gradient-to-br from-natillera-500 to-emerald-600 shadow-lg shadow-natillera-500/30'
                        : 'bg-gray-100 border-2 border-gray-200'
                    ]"
                  >
                    <span class="text-lg sm:text-xl">📅</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span 
                      :class="[
                        'font-bold text-xs sm:text-sm block',
                        formPrestamo.periodicidad === 'mensual' ? 'text-natillera-700' : 'text-gray-700'
                      ]"
                    >
                      Mensual
                    </span>
                  </div>
                  <!-- Indicador de selección - mejorado para móvil -->
                  <div 
                    v-if="formPrestamo.periodicidad === 'mensual'"
                    class="w-4 h-4 sm:w-5 sm:h-5 bg-natillera-500 rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                  >
                    <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p 
                  :class="[
                    'text-xs',
                    formPrestamo.periodicidad === 'mensual' ? 'text-natillera-600' : 'text-gray-500'
                  ]"
                >
                  Una cuota por mes
                </p>
              </button>
              <button
                type="button"
                @click="formPrestamo.periodicidad = 'quincenal'"
                :class="[
                  'relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  formPrestamo.periodicidad === 'quincenal'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-200'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <div 
                    :class="[
                      'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      formPrestamo.periodicidad === 'quincenal'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30'
                        : 'bg-gray-100 border-2 border-gray-200'
                    ]"
                  >
                    <span class="text-lg sm:text-xl">🗓️</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span 
                      :class="[
                        'font-bold text-xs sm:text-sm block',
                        formPrestamo.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-gray-700'
                      ]"
                    >
                      Quincenal
                    </span>
                  </div>
                  <!-- Indicador de selección - mejorado para móvil -->
                  <div 
                    v-if="formPrestamo.periodicidad === 'quincenal'"
                    class="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                  >
                    <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <p 
                  :class="[
                    'text-xs',
                    formPrestamo.periodicidad === 'quincenal' ? 'text-purple-600' : 'text-gray-500'
                  ]"
                >
                  Dos cuotas por mes
                </p>
              </button>
            </div>
          </div>

          <!-- Monto del préstamo -->
          <div>
            <label class="label mb-2">Monto del préstamo *</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                $
              </div>
              <input 
                :value="montoFormateado"
                @input="actualizarMonto"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                type="text" 
                inputmode="numeric"
                class="input-field pl-10 text-xl font-semibold"
                placeholder="100.000"
                required
              />
            </div>
            <p v-if="formPrestamo.monto >= 10000" class="mt-2 text-sm text-gray-600">
              <span class="font-semibold text-natillera-600">${{ formatMoney(formPrestamo.monto) }}</span> pesos colombianos
            </p>
            <p v-else-if="formPrestamo.monto > 0" class="mt-2 text-sm text-amber-600">
              El monto mínimo es ${{ formatMoney(10000) }}
            </p>
          </div>

          <!-- Tipo de interés -->
          <div>
            <label class="label mb-2">Tipo de interés *</label>
            <div class="grid grid-cols-2 gap-3">
              <!-- Radio: Interés Simple -->
              <label 
                :class="[
                  'relative flex flex-row items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all duration-200',
                  formPrestamo.tipo_interes === 'simple'
                    ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                    : 'border-gray-200 bg-white hover:border-natillera-300 hover:bg-gray-50'
                ]"
              >
                <input 
                  type="radio" 
                  v-model="formPrestamo.tipo_interes" 
                  value="simple"
                  class="sr-only"
                  required
                />
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    formPrestamo.tipo_interes === 'simple'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 border-2 border-gray-200'
                  ]"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span 
                    :class="[
                      'font-bold text-xs block',
                      formPrestamo.tipo_interes === 'simple' ? 'text-natillera-700' : 'text-gray-700'
                    ]"
                  >
                    Interés Simple
                  </span>
                  <span 
                    :class="[
                      'text-xs block',
                      formPrestamo.tipo_interes === 'simple' ? 'text-natillera-600' : 'text-gray-500'
                    ]"
                  >
                    Sobre monto inicial
                  </span>
                </div>
                <!-- Indicador de selección -->
                <div 
                  v-if="formPrestamo.tipo_interes === 'simple'"
                  class="w-4 h-4 bg-natillera-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </label>

              <!-- Radio: Interés Compuesto -->
              <label 
                :class="[
                  'relative flex flex-row items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all duration-200',
                  formPrestamo.tipo_interes === 'compuesto'
                    ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                    : 'border-gray-200 bg-white hover:border-natillera-300 hover:bg-gray-50'
                ]"
              >
                <input 
                  type="radio" 
                  v-model="formPrestamo.tipo_interes" 
                  value="compuesto"
                  class="sr-only"
                  required
                />
                <div 
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    formPrestamo.tipo_interes === 'compuesto'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 border-2 border-gray-200'
                  ]"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span 
                    :class="[
                      'font-bold text-xs block',
                      formPrestamo.tipo_interes === 'compuesto' ? 'text-natillera-700' : 'text-gray-700'
                    ]"
                  >
                    Interés Compuesto
                  </span>
                  <span 
                    :class="[
                      'text-xs block',
                      formPrestamo.tipo_interes === 'compuesto' ? 'text-natillera-600' : 'text-gray-500'
                    ]"
                  >
                    Se acumula mensualmente
                  </span>
                </div>
                <!-- Indicador de selección -->
                <div 
                  v-if="formPrestamo.tipo_interes === 'compuesto'"
                  class="w-4 h-4 bg-natillera-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </label>
            </div>
            <p class="mt-2 text-xs text-gray-500 text-center">
              <span v-if="formPrestamo.tipo_interes === 'simple'">
                💡 El interés se calcula sobre el monto inicial solamente
              </span>
              <span v-else>
                💡 El interés se acumula {{ formPrestamo.periodicidad === 'quincenal' ? 'quincenalmente' : 'mensualmente' }} sobre el capital + intereses
              </span>
            </p>
          </div>

          <!-- Número de cuotas e Interés -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label mb-2">Número de cuotas *</label>
              <input 
                v-model.number="formPrestamo.numero_cuotas"
                type="number" 
                class="input-field text-center text-lg font-semibold"
                placeholder="1"
                min="1"
                max="36"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                required
              />
            </div>
            <div>
              <label class="label mb-2">Interés mensual (%) *</label>
              <input 
                v-model.number="formPrestamo.interes"
                type="number" 
                class="input-field text-center text-lg font-semibold"
                placeholder="2"
                min="0"
                max="100"
                step="0.5"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                required
              />
            </div>
          </div>

          <!-- Fecha de pago (primera cuota) -->
          <div>
            <label class="label mb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Fecha de pago *</span>
            </label>
            <div class="relative">
              <DateInput
                v-model="formPrestamo.fecha_pago"
                placeholder="dd/MM/yyyy"
                input-class="text-base font-semibold"
                :required="true"
              />
            </div>
            <p class="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-natillera-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Esta será la fecha de la primera cuota. Las siguientes cuotas se generarán {{ formPrestamo.periodicidad === 'quincenal' ? 'cada 15 días' : 'cada mes' }}</span>
            </p>
          </div>

          <!-- Resumen de intereses -->
          <div v-if="formPrestamo.monto && formPrestamo.interes && formPrestamo.numero_cuotas" class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden">
            <!-- Tabs para tipo de interés -->
            <div class="flex gap-2 p-3 border-b border-blue-200 bg-white/50">
              <button
                type="button"
                @click="mostrarInteresAnticipado = false"
                :class="[
                  'group relative px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 overflow-hidden flex-1',
                  !mostrarInteresAnticipado
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <div 
                  v-if="!mostrarInteresAnticipado"
                  class="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"
                ></div>
                <span class="relative flex items-center justify-center gap-1.5">
                  <span>📊</span>
                  Interés Normal
                </span>
              </button>
              <button
                type="button"
                @click="mostrarInteresAnticipado = true"
                :class="[
                  'group relative px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 overflow-hidden flex-1',
                  mostrarInteresAnticipado
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <div 
                  v-if="mostrarInteresAnticipado"
                  class="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600"
                ></div>
                <span class="relative flex items-center justify-center gap-1.5">
                  <span>💰</span>
                  Interés Anticipado
                </span>
              </button>
            </div>

            <div class="p-3 space-y-2">
              <!-- Vista Mes Vencido -->
              <template v-if="!mostrarInteresAnticipado">
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="text-gray-600">Desembolso:</span>
                  <span class="font-bold text-gray-800">${{ formatMoney(capitalAPrestar) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="text-gray-600">Interés cobrado al inicio:</span>
                  <span class="font-bold text-gray-500">${{ formatMoney(0) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="text-gray-600">Cuota mensual:</span>
                  <span class="font-bold text-blue-600">${{ formatMoney(cuotaMensual) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="font-semibold text-blue-800">Valor a entregar al socio:</span>
                  <span class="font-bold text-base text-blue-700">${{ formatMoney(valorAEntregarAlSocio) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm pt-2">
                  <span class="font-semibold text-blue-800">Valor total a pagar por el socio:</span>
                  <span class="font-bold text-base text-blue-700">${{ formatMoney(montoAPagar) }}</span>
                </div>
              </template>

              <!-- Vista Anticipado -->
              <template v-else>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Desembolso:</span>
                  <span class="font-bold text-gray-800">${{ formatMoney(capitalAPrestar) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Interés cobrado al inicio:</span>
                  <span class="font-bold text-orange-600">${{ formatMoney(interesTotal) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Movimiento fondo al inicio:</span>
                  <span class="font-bold text-natillera-700">${{ formatMoney(movimientoFondoInicio) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Cuota mensual:</span>
                  <span class="font-bold text-orange-600">${{ formatMoney(cuotaMensual) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="font-semibold text-orange-800">Valor a entregar al socio:</span>
                  <span class="font-bold text-base text-orange-700">${{ formatMoney(valorAEntregarAlSocio) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm pt-2">
                  <span class="font-semibold text-orange-800">Valor total a pagar por el socio:</span>
                  <span class="font-bold text-base text-orange-700">${{ formatMoney(montoAPagar) }}</span>
                </div>
              </template>
            </div>
          </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalNuevoPrestamo = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleCrearPrestamo"
              class="btn-primary flex-1"
              :disabled="loading || !formPrestamo.socio_natillera_id || formPrestamo.monto < 10000"
            >
              {{ loading ? 'Creando...' : 'Crear Préstamo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Abono -->
    <div v-if="modalAbono" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cerrarModalAbono"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Registrar Abono
                </h3>
                <p class="text-white/90 text-xs">Registra un pago al préstamo</p>
              </div>
            </div>
            <button 
              @click="cerrarModalAbono"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <form @submit.prevent="handleRegistrarAbono" class="p-4 sm:p-6 space-y-6">
            <!-- Información del socio y saldo -->
            <div class="relative bg-gradient-to-br from-natillera-50 via-emerald-50 to-teal-50 border-2 border-natillera-200 rounded-xl p-4 overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-natillera-200/30 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon class="w-6 h-6 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-lg truncate">{{ prestamoSeleccionado?.socio_natillera?.socio?.nombre }}</p>
                    <p class="text-xs text-gray-600">Socio del préstamo</p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t-2 border-natillera-200/50 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-gray-700">Saldo actual:</span>
                    <span class="text-2xl font-bold text-natillera-700">${{ formatMoney(prestamoSeleccionado?.saldo_actual) }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3 pt-3 border-t border-natillera-200/50">
                    <div class="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                      <p class="text-xs text-gray-500 font-medium mb-1">Valor de la cuota</p>
                      <p class="text-lg font-bold text-blue-700">${{ formatMoney(calcularCuotaMensualDetalle(prestamoSeleccionado)) }}</p>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                      <p class="text-xs text-gray-500 font-medium mb-1">Cuotas restantes</p>
                      <p class="text-lg font-bold text-purple-700">{{ calcularCuotasRestantes(prestamoSeleccionado) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campo de valor del abono -->
            <div>
              <label class="label mb-2 flex items-center gap-2">
                <CurrencyDollarIcon class="w-5 h-5 text-natillera-600" />
                <span>Valor del abono *</span>
                <span class="text-xs text-gray-500 font-normal">(Puedes modificar este valor)</span>
              </label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-600 font-bold text-xl z-10 pointer-events-none">
                  $
                </div>
                <input 
                  ref="inputValorAbonoRef"
                  :value="valorAbonoFormateado"
                  @input="actualizarValorAbono"
                  @focus="$event.target.select()"
                  type="text" 
                  inputmode="numeric"
                  class="input-field pl-12 pr-4 text-2xl font-bold text-natillera-700 focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 border-2 border-natillera-200 bg-white hover:border-natillera-300 transition-all cursor-text"
                  placeholder="0"
                  required
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <PencilIcon class="w-5 h-5 text-gray-400 group-hover:text-natillera-500 transition-colors" />
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Puedes escribir o modificar el valor directamente
              </p>
              
              <!-- Información del saldo restante -->
              <div v-if="prestamoSeleccionado?.saldo_actual && formAbono.valor" class="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-700">Saldo restante después del abono:</span>
                  <span class="text-xl font-bold text-green-700">
                    ${{ formatMoney(Math.max(0, (prestamoSeleccionado?.saldo_actual || 0) - (formAbono.valor || 0))) }}
                  </span>
                </div>
                <div v-if="(prestamoSeleccionado?.saldo_actual || 0) - (formAbono.valor || 0) <= 0" class="mt-2 pt-2 border-t border-green-200">
                  <p class="text-xs font-semibold text-green-700 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    El préstamo quedará completamente pagado
                  </p>
                </div>
              </div>
              
              <!-- Validaciones -->
              <div v-if="formAbono.valor && formAbono.valor < 1000" class="mt-2 text-xs text-amber-600 font-medium">
                ⚠️ El valor mínimo del abono es $1.000
              </div>
              <div v-if="formAbono.valor && prestamoSeleccionado?.saldo_actual && parseFloat(formAbono.valor) > parseFloat(prestamoSeleccionado.saldo_actual)" class="mt-2 text-xs text-red-600 font-medium">
                ⚠️ El abono no puede ser mayor al saldo actual (máximo: ${{ formatMoney(prestamoSeleccionado?.saldo_actual || 0) }})
              </div>
            </div>

            <!-- Campo de fecha de pago -->
            <div>
              <label class="label mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Fecha de pago *</span>
              </label>
              <DateInput
                v-model="formAbono.fecha_pago"
                placeholder="dd/MM/yyyy"
                input-class="text-base font-semibold"
                :required="true"
              />
              <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Selecciona la fecha en que se realizó el pago (formato: dd/MM/yyyy)
              </p>
            </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="cerrarModalAbono"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleRegistrarAbono" 
              class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              :disabled="loading || !formAbono.valor || formAbono.valor < 1000 || (prestamoSeleccionado?.saldo_actual && parseFloat(formAbono.valor) > parseFloat(prestamoSeleccionado.saldo_actual))"
            >
              <CurrencyDollarIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Registrando...' : 'Registrar Abono' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Comprobante de Abono -->
    <div v-if="modalComprobanteAbono && comprobanteAbono" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalComprobanteAbono = false"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CheckCircleIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Comprobante de Abono
                </h3>
                <p class="text-white/90 text-xs">Abono registrado exitosamente</p>
              </div>
            </div>
            <button 
              @click="modalComprobanteAbono = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
          <!-- Comprobante Visual -->
          <div 
            id="comprobante-abono"
            ref="comprobanteRef"
            class="rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
          >
            <!-- Header con gradiente -->
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #0d9488 100%); padding: 20px 18px; color: white;">
              <!-- Header del comprobante -->
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">
                    <span style="font-size: 22px;">✓</span>
                  </div>
                  <div>
                    <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                      Comprobante de Abono
                    </p>
                  </div>
                </div>
              </div>

              <!-- Valor grande destacado -->
              <div style="text-align: center; padding: 16px 0 14px 0; border-top: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15);">
                <p style="color: rgba(255,255,255,0.8); font-size: 10px; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Valor del Abono
                </p>
                <p style="font-size: 42px; font-weight: 800; margin: 0; letter-spacing: -3px; line-height: 1;">
                  ${{ formatMoney(comprobanteAbono.valor) }}
                </p>
              </div>

              <!-- Detalles del socio y préstamo -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
                <div style="background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255,255,255,0.25);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Socio</p>
                  <p style="font-weight: 700; font-size: 13px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.3px;">{{ comprobanteAbono.socioNombre }}</p>
                </div>
                <div style="background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255,255,255,0.25);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Tipo</p>
                  <p style="font-weight: 700; font-size: 13px; margin: 0; letter-spacing: -0.3px;">Abono a Préstamo</p>
                </div>
              </div>

              <!-- Saldo anterior y nuevo -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
                <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Saldo Anterior</p>
                  <p style="font-weight: 700; font-size: 14px; margin: 0; letter-spacing: -0.5px;">${{ formatMoney(comprobanteAbono.saldoAnterior) }}</p>
                </div>
                <div style="background: rgba(167, 243, 208, 0.2); border-radius: 8px; padding: 10px; border: 1px solid rgba(167, 243, 208, 0.3);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Saldo Nuevo</p>
                  <p style="font-weight: 700; font-size: 14px; margin: 0; color: #a7f3d0; letter-spacing: -0.5px;">${{ formatMoney(comprobanteAbono.saldoNuevo) }}</p>
                </div>
              </div>

              <!-- Fecha y Estado -->
              <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
                <div style="flex: 1;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Fecha de Pago</p>
                  <p style="font-weight: 700; font-size: 12px; margin: 0; letter-spacing: -0.2px;">{{ comprobanteAbono.fecha }}</p>
                </div>
                <div style="flex: 1; text-align: right;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Estado</p>
                  <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(167, 243, 208, 0.2); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(167, 243, 208, 0.3);">
                    <span style="font-size: 14px;">✓</span>
                    <p style="font-weight: 700; font-size: 15px; margin: 0; letter-spacing: -0.2px; color: #a7f3d0;">
                      Registrado
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Código de comprobante -->
              <div v-if="comprobanteAbono.codigoComprobante" style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2);">
                <p style="color: rgba(255,255,255,0.7); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 600; text-align: center;">Código de Comprobante</p>
                <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">
                  <p style="color: rgba(255,255,255,0.95); font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 2px; margin: 0;">
                    {{ comprobanteAbono.codigoComprobante }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer fijo con botones de acción -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
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
            @click="modalComprobanteAbono = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Abono -->
    <div v-if="modalEditarAbono && abonoAEditar" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalEditarAbono = false; abonoAEditar = null"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-5 sm:p-6 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <PencilIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  Editar Abono
                </h3>
                <p class="text-white/90 text-sm mt-0.5">Modifica el valor del abono registrado</p>
              </div>
            </div>
            <button 
              @click="modalEditarAbono = false; abonoAEditar = null"
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
        <div class="border-t-2 border-gray-200 bg-white p-5 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalEditarAbono = false; abonoAEditar = null"
              class="flex-1 px-5 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="guardarAbonoEditado" 
              class="flex-1 px-5 py-3.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              :disabled="loading || !abonoAEditar?.valor || abonoAEditar.valor < 1000 || abonoAEditar.valor === parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)"
            >
              <PencilIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Refinanciar Préstamo -->
    <div v-if="modalRefinanciar" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalRefinanciar"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <ArrowPathIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Refinanciar Préstamo
                </h3>
                <p class="text-white/90 text-xs">Actualiza la fecha de pago y recalcula los intereses</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto">
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
        <div class="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="cerrarModalRefinanciar"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleRefinanciar" 
              class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              :disabled="loading || !formRefinanciar.fecha_pago || !formRefinanciar.numero_cuotas_nuevo || formRefinanciar.numero_cuotas_nuevo <= 0 || !vistaPreviaRefinanciacion"
            >
              <ArrowPathIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Refinanciando...' : 'Refinanciar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Préstamo -->
    <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalle = false"></div>
      <div class="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <BanknotesIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Detalle del Préstamo
                </h3>
                <p class="text-white/90 text-xs">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
              </div>
            </div>
            <button 
              @click="modalDetalle = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 sm:p-6 space-y-6">
            <!-- Información del préstamo -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <div class="flex items-center justify-between mb-4 gap-3">
                <h4 class="font-semibold text-gray-800 flex items-center gap-2 flex-1 min-w-0">
                  <CurrencyDollarIcon class="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span class="truncate">Información del Préstamo</span>
                </h4>
                <button
                  @click.stop="abrirModalCompartirPrestamo"
                  class="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex-shrink-0"
                  title="Enviar información del préstamo por WhatsApp"
                >
                  <ChatBubbleLeftIcon class="w-4 h-4 flex-shrink-0" />
                  <span class="hidden lg:inline ml-1.5">Enviar por WhatsApp</span>
                </button>
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

            <!-- Resumen de pagos -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-green-600" />
                Resumen de Pagos
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total de abonos</p>
                  <p class="font-bold text-gray-800">{{ pagosPrestamo.length }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total abonado</p>
                  <p class="font-bold text-green-600">
                    ${{ formatMoney(pagosPrestamo.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0)) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Saldo pendiente</p>
                  <p class="font-bold text-red-600">${{ formatMoney(prestamoDetalle?.saldo_actual) }}</p>
                </div>
              </div>
            </div>

            <!-- Plan de Pagos -->
            <div v-if="planPagosPrestamo.length > 0">
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
                        {{ pagosPrestamo.length }}
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
            <div v-if="historialRefinanciaciones.length > 0">
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

                  <!-- Comparación de valores -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <span class="text-xs text-gray-500">Saldo:</span>
                          <span class="text-sm font-bold text-gray-700">${{ formatMoney(historial.saldo_actual_anterior) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Valores Nuevos -->
                    <div class="bg-white/70 rounded-lg p-4 border-2 border-green-300">
                      <p class="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Valores Nuevos
                      </p>
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Monto:</span>
                          <span class="text-sm font-bold text-green-700">${{ formatMoney(historial.monto_nuevo) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Interés:</span>
                          <span class="text-sm font-bold text-green-700">{{ historial.interes_nuevo }}%</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Cuotas:</span>
                          <span class="text-sm font-bold text-green-700">{{ historial.numero_cuotas_nuevo }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-gray-500">Tipo interés:</span>
                          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700 capitalize">
                            {{ historial.tipo_interes_nuevo }}
                          </span>
                        </div>
                        <div class="flex justify-between items-center pt-2 border-t border-green-200">
                          <span class="text-xs text-gray-500">Saldo:</span>
                          <span class="text-sm font-bold text-green-700">${{ formatMoney(historial.saldo_actual_nuevo) }}</span>
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
              <div v-if="pagosPrestamo.length === 0" class="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <BanknotesIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 text-sm">No hay abonos registrados</p>
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="pago in pagosPrestamo" 
                  :key="pago.id"
                  class="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-natillera-300 transition-all"
                >
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800">${{ formatMoney(pago.valor) }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(pago.fecha) }}</p>
                      <p v-if="pago.codigo_comprobante" class="text-xs text-gray-400 font-mono mt-1">
                        Código: {{ pago.codigo_comprobante }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Abonado
                    </span>
                    <button
                      v-if="pago.codigo_comprobante"
                      @click.stop="reenviarComprobanteAbono(pago)"
                      class="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Reenviar comprobante"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click.stop="abrirModalEditarAbono(pago)"
                      class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar abono"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click.stop="confirmarEliminarAbono(pago)"
                      class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar abono"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalDetalle = false"
              class="btn-secondary flex-1"
            >
              Cerrar
            </button>
            <button 
              v-if="prestamoDetalle?.estado === 'activo'"
              type="button"
              @click="abrirModalAbono(prestamoDetalle)"
              class="btn-primary flex-1"
            >
              Registrar Abono
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Compartir Préstamo por WhatsApp -->
    <div v-if="modalCompartirPrestamo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalCompartirPrestamo = false"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <ChatBubbleLeftIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Información del Préstamo
                </h3>
                <p class="text-white/90 text-xs">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
              </div>
            </div>
            <button 
              @click="modalCompartirPrestamo = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Información del préstamo para compartir -->
          <div 
            ref="prestamoRef"
            class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-4"
          >
            <div class="text-center mb-4">
              <h4 class="text-2xl font-bold text-gray-800 mb-2">Información del Préstamo</h4>
              <p class="text-sm text-gray-600">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Monto del préstamo</p>
                <p class="font-bold text-lg text-gray-800">${{ formatMoney(prestamoDetalle?.monto) }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Interés mensual</p>
                <p class="font-bold text-lg text-blue-600">{{ prestamoDetalle?.interes }}%</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Saldo actual</p>
                <p class="font-bold text-lg" :class="prestamoDetalle?.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">
                  ${{ formatMoney(prestamoDetalle?.saldo_actual) }}
                </p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Número de cuotas</p>
                <p class="font-bold text-lg text-gray-800">{{ prestamoDetalle?.numero_cuotas || 1 }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Valor de la cuota</p>
                <p class="font-bold text-lg text-purple-600">${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Interés generado</p>
                <p class="font-bold text-lg text-orange-600">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Monto pagado</p>
                <p class="font-bold text-lg text-emerald-600">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</p>
              </div>
            </div>
            
            <div class="bg-white/70 rounded-lg p-3 border border-blue-200 mt-4">
              <p class="text-xs text-gray-500 mb-1">Estado</p>
              <span 
                :class="[
                  'inline-block px-3 py-1 rounded-full text-sm font-bold',
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
            
            <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
              <p class="text-xs text-gray-500 mb-1">Fecha de creación</p>
              <p class="font-semibold text-gray-700">{{ formatDate(prestamoDetalle?.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Footer fijo con botones -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
          <div class="space-y-3">
            <button 
              @click="descargarPrestamo"
              :disabled="generandoImagenPrestamo"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ generandoImagenPrestamo ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <button 
              @click="compartirPrestamoWhatsApp"
              :disabled="generandoImagenPrestamo || !prestamoDetalle?.socio_natillera?.socio?.telefono"
              :class="[
                'block sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all',
                (generandoImagenPrestamo || !prestamoDetalle?.socio_natillera?.socio?.telefono)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              ]"
              :title="!prestamoDetalle?.socio_natillera?.socio?.telefono ? 'No hay teléfono registrado para este socio' : ''"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
              <span v-if="generandoImagenPrestamo">Preparando...</span>
              <span v-else-if="!prestamoDetalle?.socio_natillera?.socio?.telefono">📲 Sin teléfono registrado</span>
              <span v-else>📲 Compartir por WhatsApp</span>
            </button>
          </div>

          <p class="text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>

          <button 
            @click="modalCompartirPrestamo = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar abono -->
    <div v-if="abonoAEliminar" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="abonoAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-amber-100/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-lg">
              <TrashIcon class="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 class="text-xl font-display font-bold text-gray-800">Eliminar Abono</h3>
              <p class="text-sm text-gray-600">Esta acción actualizará el saldo del préstamo</p>
            </div>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-700 mb-3">
              ¿Estás seguro de que deseas eliminar el abono de <strong class="text-gray-900">${{ formatMoney(abonoAEliminar?.valor) }}</strong>?
            </p>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
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

          <div class="flex gap-3">
            <button
              @click="abonoAEliminar = null"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              @click="eliminarAbonoConfirmado"
              :disabled="loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrashIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar préstamo -->
    <div v-if="prestamoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="prestamoAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-red-100/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
              <TrashIcon class="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 class="text-xl font-display font-bold text-gray-800">Eliminar Préstamo</h3>
              <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-700 mb-3">
              ¿Estás seguro de que deseas eliminar el préstamo de <strong class="text-gray-900">{{ prestamoAEliminar?.socio_natillera?.socio?.nombre || 'este socio' }}</strong>?
            </p>
            <div class="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
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
                  <p class="mt-3 text-xs text-red-600 font-semibold bg-white/50 rounded-lg p-2">
                    💡 Esta acción es irreversible. Asegúrate de que realmente deseas eliminar este préstamo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="prestamoAEliminar = null"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              @click="eliminarPrestamoConfirmado"
              :disabled="loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrashIcon v-if="!loading" class="w-5 h-5" />
              <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
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
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { getAvatarUrl } from '../../utils/avatars'
import { getCurrentDateISO, formatDateToLocalISO, parseDateLocal, formatDate } from '../../utils/formatDate'
import DateInput from '../../components/DateInput.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'

const notificationStore = useNotificationStore()
const auditoria = useAuditoria()

const props = defineProps({
  id: String
})

const route = useRoute()
const id = props.id || route.params.id

const prestamos = ref([])
const socios = ref([])
const loading = ref(false)
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
const prestamoAEliminar = ref(null)
const abonoAEliminar = ref(null)
const abonoAEditar = ref(null)
const modalCompartirPrestamo = ref(false)
const generandoImagenPrestamo = ref(false)
const historialRefinanciaciones = ref([])
const prestamoRef = ref(null)
const prestamosMoraExpandidos = ref(new Set())

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalNuevoPrestamo)
useBodyScrollLock(modalAbono)
useBodyScrollLock(modalEditarAbono)
useBodyScrollLock(modalDetalle)
useBodyScrollLock(modalRefinanciar)
useBodyScrollLock(modalCompartirPrestamo)

// Función para toggle del desplegable de información de mora
const toggleMoraInfo = (prestamoId) => {
  if (prestamosMoraExpandidos.value.has(prestamoId)) {
    prestamosMoraExpandidos.value.delete(prestamoId)
  } else {
    prestamosMoraExpandidos.value.add(prestamoId)
  }
}

const formPrestamo = reactive({
  socio_natillera_id: '',
  monto: 100000,
  interes: 2,
  numero_cuotas: 1,
  tipo_interes: 'simple', // 'simple' o 'compuesto'
  periodicidad: 'mensual', // 'mensual' o 'quincenal'
  fecha_pago: getCurrentDateISO() // Fecha de pago de la primera cuota
})

const montoFormateado = ref('100.000')
const mostrarSelectorSocio = ref(false)
const busquedaSocio = ref('')
const mostrarInteresAnticipado = ref(false)
const modalNuevoPrestamoScrollRef = ref(null)

const formAbono = reactive({
  valor: 0,
  fecha_pago: getCurrentDateISO() // Fecha actual en formato YYYY-MM-DD
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
const modalComprobanteAbono = ref(false)
const comprobanteAbono = ref(null)
const generandoImagenComprobante = ref(false)
const comprobanteRef = ref(null)

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

async function actualizarInteresPrestamo(natilleraId, prestamoId, interes, tipo = 'anticipado', esNuevo = true, esRefinanciacion = false) {
  // Buscar si ya existe un registro para este préstamo
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
    // Si no existe, crear un nuevo registro
    const { data: insertedData, error: insertError } = await supabase
      .from('utilidades_clasificadas')
      .insert({
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
      })
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

const interesTotal = computed(() => {
  if (!capitalAPrestar.value || !formPrestamo.interes || !formPrestamo.numero_cuotas) return 0
  
  const monto = capitalAPrestar.value
  const tasaMensual = formPrestamo.interes / 100
  const cuotas = formPrestamo.numero_cuotas
  const periodicidad = formPrestamo.periodicidad || 'mensual'
  
  // Si es interés anticipado, usar la fórmula: Bruto = valorprestamo / (1 - d)
  // donde d = interes × meses
  if (mostrarInteresAnticipado.value) {
    // Calcular tasa periódica según periodicidad
    const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
    // d = interes × meses
    const d = tasaPeriodica * cuotas
    // Validar que d < 1 para evitar división por cero o valores negativos
    if (d >= 1) return 0
    // Bruto = valorprestamo / (1 - d)
    const bruto = monto / (1 - d)
    // Interés = Bruto - valorprestamo
    return bruto - monto
  }
  
  // Calcular tasa periódica según periodicidad
  const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
  
  if (formPrestamo.tipo_interes === 'compuesto') {
    // Interés compuesto: M = C * (1 + i)^n
    // Interés = M - C
    const montoFinal = monto * Math.pow(1 + tasaPeriodica, cuotas)
    return montoFinal - monto
  } else {
    // Interés simple: I = C * i * n
    return monto * tasaPeriodica * cuotas
  }
})

const montoTotal = computed(() => {
  // Si es interés anticipado, el monto total es el bruto calculado
  if (mostrarInteresAnticipado.value) {
    if (!capitalAPrestar.value || !formPrestamo.interes || !formPrestamo.numero_cuotas) return capitalAPrestar.value || 0
    
    const monto = capitalAPrestar.value
    const tasaMensual = formPrestamo.interes / 100
    const cuotas = formPrestamo.numero_cuotas
    const periodicidad = formPrestamo.periodicidad || 'mensual'
    const tasaPeriodica = periodicidad === 'quincenal' ? tasaMensual / 2 : tasaMensual
    const d = tasaPeriodica * cuotas
    
    if (d >= 1) return monto
    // Bruto = valorprestamo / (1 - d)
    return monto / (1 - d)
  }
  
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
    // Con interés anticipado, el socio recibe el capital menos el interés (que se retiene)
    // El interés se calcula con la nueva fórmula: Bruto = valorprestamo / (1 - d)
    const montoARecibirCalculado = capitalAPrestar.value - interesTotal.value
    // Asegurar que no sea negativo
    return Math.max(0, montoARecibirCalculado)
  }
  // Con interés normal, el socio recibe el capital completo
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

// Valor a entregar al socio (desembolso)
const valorAEntregarAlSocio = computed(() => {
  // Siempre es el capital, independientemente del tipo de interés
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

const cuotaMensual = computed(() => {
  // Con interés anticipado o normal, la cuota es el total (capital + intereses) dividido entre las cuotas
  return montoTotal.value / formPrestamo.numero_cuotas
})

// Watchers para hacer scroll automático cuando se selecciona tipo de interés o fecha de pago
watch(mostrarInteresAnticipado, () => {
  if (modalNuevoPrestamo.value && modalNuevoPrestamoScrollRef.value) {
    nextTick(() => {
      if (modalNuevoPrestamoScrollRef.value) {
        modalNuevoPrestamoScrollRef.value.scrollTo({
          top: modalNuevoPrestamoScrollRef.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  }
})

watch(() => formPrestamo.fecha_pago, () => {
  if (modalNuevoPrestamo.value && modalNuevoPrestamoScrollRef.value && formPrestamo.fecha_pago) {
    nextTick(() => {
      if (modalNuevoPrestamoScrollRef.value) {
        modalNuevoPrestamoScrollRef.value.scrollTo({
          top: modalNuevoPrestamoScrollRef.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  }
})

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
  
  // Si es interés mes vencido, calcular basado en lo pagado
  const monto = prestamo.monto || 0
  const saldoActual = prestamo.saldo_actual || 0
  const tasaMensual = (prestamo.interes || 0) / 100
  
  // Calcular el interés total del préstamo
  const numeroCuotas = prestamo.numero_cuotas || 1
  let interesTotal = 0
  
  if (prestamo.tipo_interes === 'compuesto') {
    const montoFinal = monto * Math.pow(1 + tasaMensual, numeroCuotas)
    interesTotal = montoFinal - monto
  } else {
    interesTotal = monto * tasaMensual * numeroCuotas
  }
  
  // Si ya está pagado, retornar el interés total
  if (saldoActual <= 0) {
    return interesTotal
  }
  
  // Calcular proporción pagada
  const montoPagado = monto - saldoActual
  const proporcionPagada = montoPagado / monto
  
  // Retornar interés generado proporcional a lo pagado
  return interesTotal * proporcionPagada
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
    // Primero obtener los IDs de socios_natillera de esta natillera
    const { data: sociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(*)')
      .eq('natillera_id', id)

    if (!sociosNatillera || sociosNatillera.length === 0) {
      prestamos.value = []
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
    
    // Cargar el plan de pagos para todos los préstamos en una sola consulta
    let planPagosMap = {}
    if (prestamoIds.length > 0) {
      const { data: planPagos, error: planError } = await supabase
        .from('plan_pagos_prestamo')
        .select('*')
        .in('prestamo_id', prestamoIds)

      if (!planError && planPagos) {
        // Guardar todos los planes de pagos para calcular total pagado
        todosLosPlanesPagos.value = planPagos
        
        // Crear un mapa por prestamo_id
        planPagosMap = planPagos.reduce((acc, cuota) => {
          if (!acc[cuota.prestamo_id]) {
            acc[cuota.prestamo_id] = []
          }
          acc[cuota.prestamo_id].push(cuota)
          return acc
        }, {})
      } else {
        todosLosPlanesPagos.value = []
      }
    }
    
    // Cargar historial de refinanciaciones para obtener el interés original cuando hay refinanciación
    let historialRefinanciacionesMap = {}
    if (prestamoIds.length > 0) {
      const { data: historialRefinanciaciones, error: historialError } = await supabase
        .from('historial_refinanciaciones')
        .select('*')
        .in('prestamo_id', prestamoIds)
        .order('fecha_refinanciacion', { ascending: true }) // Ordenar por fecha ascendente para obtener el primero

      if (!historialError && historialRefinanciaciones) {
        // Crear un mapa por prestamo_id, guardando solo el primer registro (la primera refinanciación)
        historialRefinanciacionesMap = historialRefinanciaciones.reduce((acc, historial) => {
          if (!acc[historial.prestamo_id]) {
            acc[historial.prestamo_id] = historial
          }
          return acc
        }, {})
      }
    }

    // Combinar con datos del socio y verificar cuotas vencidas
    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    // Cargar el monto total de utilidades_clasificadas para préstamos
    // Sumar todos los registros individuales por préstamo
    const totalIntereses = await obtenerTotalInteresesPrestamos(id)
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

      return {
        ...prestamo,
        socio_natillera: socioNatillera,
        tieneCuotasVencidas,
        cuotasVencidas,
        diasMora,
        valorCuotasEnDeuda,
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
  // Cargar el valor de la cuota por defecto
  const valorCuota = calcularCuotaMensualDetalle(prestamo)
  // Si el valor de la cuota es mayor al saldo, usar el saldo
  const valorInicial = valorCuota > prestamo.saldo_actual ? prestamo.saldo_actual : valorCuota
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
  valorAbonoFormateado.value = ''
  prestamoSeleccionado.value = null
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
}

function generarImagenComprobanteAbono() {
  return new Promise((resolve) => {
    try {
      if (!comprobanteAbono.value) {
        resolve(null)
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const codigoComprobante = comprobanteAbono.value.codigoComprobante
      const width = 480
      const height = 680
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // Agregar roundRect si no existe
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, w, h, r) {
          if (w < 2 * r) r = w / 2
          if (h < 2 * r) r = h / 2
          this.beginPath()
          this.moveTo(x + r, y)
          this.arcTo(x + w, y, x + w, y + h, r)
          this.arcTo(x + w, y + h, x, y + h, r)
          this.arcTo(x, y + h, x, y, r)
          this.arcTo(x, y, x + w, y, r)
          this.closePath()
        }
      }
      
      // === FONDO DEGRADADO MODERNO ===
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#0f172a')
      bgGradient.addColorStop(0.5, '#1e293b')
      bgGradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // === EFECTOS DE LUZ (glassmorphism style) ===
      // Luz superior derecha
      const light1 = ctx.createRadialGradient(width - 80, 100, 0, width - 80, 100, 200)
      light1.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      light1.addColorStop(1, 'transparent')
      ctx.fillStyle = light1
      ctx.fillRect(0, 0, width, height)
      
      // Luz inferior izquierda
      const light2 = ctx.createRadialGradient(80, height - 150, 0, 80, height - 150, 180)
      light2.addColorStop(0, 'rgba(6, 182, 212, 0.2)')
      light2.addColorStop(1, 'transparent')
      ctx.fillStyle = light2
      ctx.fillRect(0, 0, width, height)
      
      // === HEADER ===
      // "Comprobante de Abono" a la izquierda (grande, bold, blanco)
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Comprobante de Abono', 32, 52)
      
      // "natillerapp" a la derecha (pequeño, gris claro con contorno negro)
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      // Contorno negro
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = 0.7
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeText('natillerapp', width - 32, 52)
      // Relleno
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText('natillerapp', width - 32, 52)
      
      // Línea decorativa con gradiente verde-azul
      const lineGradient = ctx.createLinearGradient(32, 0, width - 32, 0)
      lineGradient.addColorStop(0, 'transparent')
      lineGradient.addColorStop(0.3, '#10b981')
      lineGradient.addColorStop(0.5, '#06b6d4')
      lineGradient.addColorStop(0.7, '#10b981')
      lineGradient.addColorStop(1, 'transparent')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 72)
      ctx.lineTo(width - 32, 72)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = 95
      const cardHeight = 485
      const cardMargin = 24
      
      // Fondo de la tarjeta blanca con glassmorphism
      ctx.fillStyle = 'rgba(255,255,255,0.98)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      
      // Sombra sutil para profundidad
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      const cardInnerX = cardMargin + 28
      const cardInnerWidth = width - cardMargin*2 - 56
      
      // === VALOR PAGADO (HERO) - Centrado ===
      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('VALOR PAGADO', width/2, cardY + 50)
      
      // Valor grande con gradiente verde
      const valorText = '$' + formatMoney(comprobanteAbono.value.valor)
      ctx.font = 'bold 52px Arial'
      const valorGradient = ctx.createLinearGradient(0, cardY + 55, 0, cardY + 110)
      valorGradient.addColorStop(0, '#059669')
      valorGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = valorGradient
      ctx.fillText(valorText, width/2, cardY + 105)
      
      // Badge "Pago Verificado" centrado debajo del monto
      const badgeY = cardY + 125
      ctx.fillStyle = '#dcfce7'
      ctx.beginPath()
      ctx.roundRect(width/2 - 60, badgeY, 120, 32, 16)
      ctx.fill()
      
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Pago Verificado', width/2, badgeY + 21)
      
      // === CÓDIGO DE COMPROBANTE (debajo de "Pago Verificado") ===
      let codigoY = null
      if (codigoComprobante) {
        codigoY = badgeY + 45
        // Código en negrita y visible, sin etiqueta
        ctx.fillStyle = '#64748b'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(codigoComprobante, width/2, codigoY)
      }
      
      // === DETALLES EN CARDS ===
      // Ajustar posición de los detalles si hay código
      const detailsY = codigoY ? codigoY + 25 : badgeY + 60
      
      // Card: Socio con mejor estilo
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 18, detailsY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(comprobanteAbono.value.socioNombre || 'Socio', cardInnerX + 18, detailsY + 46)
      
      // Card: Concepto con mejor estilo
      const conceptoY = detailsY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, conceptoY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, conceptoY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONCEPTO / CUOTA', cardInnerX + 18, conceptoY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Abono a Préstamo', cardInnerX + 18, conceptoY + 46)
      
      // Card: Fecha con mejor estilo
      const fechaY = conceptoY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, fechaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, fechaY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('FECHA Y HORA DEL PAGO', cardInnerX + 18, fechaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 15px Arial'
      ctx.fillText(comprobanteAbono.value.fecha || 'Fecha no disponible', cardInnerX + 18, fechaY + 46)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      // El botón debe quedar fuera de la tarjeta blanca, al final
      const btnY = cardY + cardHeight + 20
      
      // Sombra del botón para profundidad
      ctx.fillStyle = 'rgba(5, 150, 105, 0.3)'
      ctx.beginPath()
      ctx.roundRect(cardInnerX + 2, btnY + 2, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Botón con gradiente mejorado
      const btnGradient = ctx.createLinearGradient(cardInnerX, btnY, cardInnerX, btnY + 52)
      btnGradient.addColorStop(0, '#059669')
      btnGradient.addColorStop(0.5, '#10b981')
      btnGradient.addColorStop(1, '#047857')
      ctx.fillStyle = btnGradient
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Borde sutil del botón
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.stroke()
      
      // Texto del botón con sombra
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PAGO EXITOSO', cardInnerX + cardInnerWidth/2 + 1, btnY + 34)
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PAGO EXITOSO', cardInnerX + cardInnerWidth/2, btnY + 33)
      
      resolve(canvas)
    } catch (e) {
      console.error('Error generando canvas:', e)
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
        // Marcar como pagada y actualizar valor_pagado
        const { error: errorUpdate } = await supabase
          .from('plan_pagos_prestamo')
          .update({
            pagada: true,
            fecha_pago: fechaPago,
            valor_pagado: valorCuota
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

    // Resetear todas las cuotas: valor_pagado = 0, pagada = false
    for (const cuota of todasCuotas) {
      await supabase
        .from('plan_pagos_prestamo')
        .update({
          valor_pagado: 0,
          pagada: false,
          fecha_pago: null
        })
        .eq('id', cuota.id)
    }

    // Recalcular aplicando todos los pagos desde cero
    let abonoRestante = 0
    for (const pago of todosPagos) {
      abonoRestante += parseFloat(pago.valor)
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
        
        // Verificar si esta cuota se está marcando como pagada por primera vez
        const cuotaAnterior = cuotasAnteriores.find(c => c.id === cuota.id)
        const seMarcoComoPagada = !cuotaAnterior?.pagada

        await supabase
          .from('plan_pagos_prestamo')
          .update({
            pagada: true,
            valor_pagado: valorCuota,
            fecha_pago: fechaUltimoPago
          })
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
        indiceCuota++
      } else {
        // El abono no cubre completamente la cuota
        await supabase
          .from('plan_pagos_prestamo')
          .update({
            valor_pagado: abonoRestante
          })
          .eq('id', cuota.id)

        abonoRestante = 0
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

    // Recargar el plan de pagos
    await fetchPlanPagosPrestamo(prestamoId)
    
    // Recargar todos los planes de pagos para actualizar el total pagado
    await recargarTodosLosPlanesPagos()
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
  
  if (prestamo.interes_anticipado) {
    // Con interés anticipado, usar el interés_total guardado
    interesTotal = prestamo.interes_total || 0
    // Con interés anticipado, calcular el bruto usando la fórmula: Bruto = valorprestamo / (1 - d)
    // donde d = interes × meses
    const d = tasaPeriodica * numeroCuotas
    let montoTotalAPagar = monto + interesTotal
    if (d < 1) {
      // Si hay interés_total guardado, usarlo; si no, calcular con la fórmula
      if (!prestamo.interes_total || prestamo.interes_total === 0) {
        montoTotalAPagar = monto / (1 - d)
        interesTotal = montoTotalAPagar - monto
      } else {
        // Usar el interés_total guardado (ya calculado con la fórmula al crear el préstamo)
        montoTotalAPagar = monto + interesTotal
      }
    }
    // Con interés anticipado, la cuota incluye capital + intereses dividido entre las cuotas
    valorCuota = montoTotalAPagar / numeroCuotas
  } else {
    // Con interés normal
    if (prestamo.tipo_interes === 'compuesto') {
      const montoFinal = monto * Math.pow(1 + tasaPeriodica, numeroCuotas)
      interesTotal = montoFinal - monto
      valorCuota = montoFinal / numeroCuotas
    } else {
      interesTotal = monto * tasaPeriodica * numeroCuotas
      valorCuota = (monto + interesTotal) / numeroCuotas
    }
  }
  
  // El saldo inicial siempre debe incluir capital + intereses (total a pagar)
  // Con interés anticipado, el total a pagar es el bruto calculado (monto + interesTotal)
  // Con interés normal, el total a pagar es monto + intereses
  let saldoRestante = monto + interesTotal
  
  for (let i = 1; i <= numeroCuotas; i++) {
    // Calcular fecha proyectada según periodicidad
    const fechaProyectada = new Date(fechaInicio)
    if (periodicidad === 'quincenal') {
      // Para quincenal: sumar 15 días por cada cuota
      fechaProyectada.setDate(fechaProyectada.getDate() + (15 * (i - 1)))
    } else {
      // Para mensual: sumar 1 mes por cada cuota
      fechaProyectada.setMonth(fechaProyectada.getMonth() + (i - 1))
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
    
    planPagos.push({
      prestamo_id: prestamo.id,
      numero_cuota: i,
      fecha_proyectada: formatDateToLocalISO(fechaProyectada),
      valor_cuota: Math.round(valorCuota),
      capital: Math.round(capitalCuota),
      interes: Math.round(interesCuota),
      saldo_proyectado: Math.round(saldoRestante),
      pagada: false
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
    const fechaProyectada = new Date(fechaInicio)
    if (periodicidad === 'quincenal') {
      fechaProyectada.setDate(fechaProyectada.getDate() + (15 * (i - 1)))
    } else {
      fechaProyectada.setMonth(fechaProyectada.getMonth() + (i - 1))
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
    
    planPagos.push({
      prestamo_id: prestamo.id,
      numero_cuota: i,
      fecha_proyectada: formatDateToLocalISO(fechaProyectada),
      valor_cuota: Math.ceil(valorCuota),
      capital: Math.ceil(capitalCuota),
      interes: Math.ceil(interesCuota),
      saldo_proyectado: Math.ceil(saldoRestante),
      pagada: false,
      valor_pagado: 0
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
    
    // Eliminar solo las cuotas pendientes (no pagadas)
    const cuotasPendientes = todasCuotas.filter(cuota => {
      const valorCuota = parseFloat(cuota.valor_cuota || 0)
      const valorPagado = parseFloat(cuota.valor_pagado || 0)
      return valorPagado < valorCuota
    })
    
    if (cuotasPendientes.length > 0) {
      const cuotasPendientesIds = cuotasPendientes.map(c => c.id)
      const { error: errorEliminar } = await supabase
        .from('plan_pagos_prestamo')
        .delete()
        .in('id', cuotasPendientesIds)
      
      if (errorEliminar) {
        throw new Error('Error al eliminar las cuotas pendientes')
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
      fecha_inicio_anterior: prestamo.fecha_inicio || null,
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
      saldo_actual_nuevo: Math.ceil(montoBaseRefinanciacion + interesTotalNuevo) // Monto base + interés nuevo completo (ya redondeado hacia arriba)
    }
    
    const { error: errorHistorial } = await supabase
      .from('historial_refinanciaciones')
      .insert(historialRefinanciacion)
    
    if (errorHistorial) {
      console.error('Error al guardar historial de refinanciación:', errorHistorial)
      // No lanzar error, solo registrar en consola para no bloquear el proceso
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
        true // Es refinanciación, reemplazar el interés en lugar de sumarlo
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
          cuotas_eliminadas: cuotasPendientes.length,
          cuotas_nuevas: nuevoPlanPagos.length,
          historial_refinanciacion_id: historialRefinanciacion.id || null
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
  // Validar monto mínimo
  const capital = Math.round(capitalAPrestar.value)
  if (capital < 10000) {
    notificationStore.warning('El monto mínimo del préstamo es $10.000', 'Monto insuficiente')
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
      notificationStore.error(
        `El valor de interés × meses (${(d * 100).toFixed(2)}%) debe ser menor al 100%. Por favor, reduce el interés o aumenta el número de cuotas.`,
        'Error en cálculo de interés anticipado'
      )
      return
    }
  }
  
  loading.value = true
  try {
    // Calcular el interés total
    const interesTotalCalculado = Math.round(interesTotal.value)
    // El saldo inicial siempre debe incluir capital + intereses (total a pagar)
    // Con interés anticipado, se usa la fórmula: Bruto = valorprestamo / (1 - d)
    // donde d = interes × meses, y el saldo inicial es el bruto calculado
    // Con interés normal, el saldo inicial es capital + intereses
    const saldoInicial = mostrarInteresAnticipado.value 
      ? Math.round(montoTotal.value) 
      : capital + interesTotalCalculado
    
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
        periodicidad: formPrestamo.periodicidad
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
    // Usamos la fecha directamente sin convertir a UTC para evitar problemas de zona horaria
    const planPagos = generarPlanPagos({
      ...data,
      tipo_interes: formPrestamo.tipo_interes,
      interes_anticipado: mostrarInteresAnticipado.value,
      numero_cuotas: formPrestamo.numero_cuotas,
      periodicidad: formPrestamo.periodicidad,
      fecha_inicio: formPrestamo.fecha_pago || data.created_at
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
        true // esNuevo
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
    modalNuevoPrestamo.value = false
    formPrestamo.socio_natillera_id = ''
    formPrestamo.monto = 100000
    formPrestamo.interes = 2
    formPrestamo.numero_cuotas = 1
    formPrestamo.tipo_interes = 'simple'
    formPrestamo.periodicidad = 'mensual'
    formPrestamo.fecha_pago = getCurrentDateISO()
    montoFormateado.value = '100.000'
    mostrarSelectorSocio.value = false
    busquedaSocio.value = ''
    mostrarInteresAnticipado.value = false
    notificationStore.success('Préstamo creado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al crear el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

function handleClickOutside(event) {
  if (mostrarSelectorSocio.value && !event.target.closest('.selector-socio-container')) {
    cerrarSelectorSocio()
  }
}

onMounted(() => {
  fetchPrestamos()
  fetchSocios()
  document.addEventListener('click', handleClickOutside)
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
    const nuevoSaldo = prestamoSeleccionado.value.saldo_actual - formAbono.valor
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
    
    const datosPago = {
      prestamo_id: prestamoSeleccionado.value.id,
      valor: parseFloat(formAbono.valor),
      fecha: fechaPago,
      codigo_comprobante: codigoComprobante
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
      valor: formAbono.valor,
      codigoComprobante: codigoComprobante,
      socioNombre: nombreSocio,
      socioTelefono: socioTelefono,
      fecha: fechaPagoComprobante,
      saldoAnterior: datosAnteriores.saldo_actual,
      saldoNuevo: Math.max(0, nuevoSaldo),
      prestamo: prestamoSeleccionado.value
    }
    
    modalAbono.value = false
    formAbono.valor = 0
    valorAbonoFormateado.value = ''
    prestamoSeleccionado.value = null
    
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
              fecha_actualizacion: new Date().toISOString()
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
          fecha_actualizacion: new Date().toISOString()
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
  // Esperar a que el modal se renderice completamente
  await nextTick()
  // Dar un pequeño tiempo adicional para que el DOM se estabilice
  await new Promise(resolve => setTimeout(resolve, 100))
}

async function generarImagenPrestamo() {
  return new Promise((resolve) => {
    try {
      if (!prestamoDetalle.value) {
        throw new Error('No hay información del préstamo disponible')
      }

      const prestamo = prestamoDetalle.value
      const nombreSocio = prestamo.socio_natillera?.socio?.nombre || 'Socio'
      const saldoColor = prestamo.saldo_actual > 0 ? '#dc2626' : '#10b981'
      const estadoColor = prestamo.estado === 'pagado' ? '#10b981' : prestamo.estado === 'activo' ? '#2563eb' : '#64748b'
      const estadoBg = prestamo.estado === 'pagado' ? '#dcfce7' : prestamo.estado === 'activo' ? '#dbeafe' : '#f1f5f9'
      const estadoText = prestamo.estado === 'pagado' ? 'PAGADO' : prestamo.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const width = 480
      const height = 780
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // === FONDO DEGRADADO MODERNO (igual que comprobante de pago) ===
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#0f172a')
      bgGradient.addColorStop(0.5, '#1e293b')
      bgGradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // === EFECTOS DE LUZ (glassmorphism style) ===
      const light1 = ctx.createRadialGradient(width - 80, 100, 0, width - 80, 100, 200)
      light1.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      light1.addColorStop(1, 'transparent')
      ctx.fillStyle = light1
      ctx.fillRect(0, 0, width, height)
      
      const light2 = ctx.createRadialGradient(80, height - 150, 0, 80, height - 150, 180)
      light2.addColorStop(0, 'rgba(6, 182, 212, 0.2)')
      light2.addColorStop(1, 'transparent')
      ctx.fillStyle = light2
      ctx.fillRect(0, 0, width, height)
      
      // === HEADER ===
      // "Información del Préstamo" a la izquierda
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Información del Préstamo', 32, 52)
      
      // "natillerapp" a la derecha (con contorno negro)
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      // Contorno negro
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = 0.7
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2
      ctx.strokeText('natillerapp', width - 32, 52)
      // Relleno
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText('natillerapp', width - 32, 52)
      
      // Línea decorativa con gradiente verde-azul
      const lineGradient = ctx.createLinearGradient(32, 0, width - 32, 0)
      lineGradient.addColorStop(0, 'transparent')
      lineGradient.addColorStop(0.3, '#10b981')
      lineGradient.addColorStop(0.5, '#06b6d4')
      lineGradient.addColorStop(0.7, '#10b981')
      lineGradient.addColorStop(1, 'transparent')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 72)
      ctx.lineTo(width - 32, 72)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = 95
      const cardHeight = 570
      const cardMargin = 24
      
      // Fondo de la tarjeta blanca
      ctx.fillStyle = 'rgba(255,255,255,0.98)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      
      // Sombra sutil
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      const cardInnerX = cardMargin + 28
      const cardInnerWidth = width - cardMargin*2 - 56
      const cardHalfWidth = (cardInnerWidth - 12) / 2 // Ancho para cards de 2 columnas (con gap de 12px)
      
      // === MONTO DEL PRÉSTAMO (HERO) - Centrado ===
      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('MONTO DEL PRÉSTAMO', width/2, cardY + 50)
      
      // Valor grande con gradiente verde
      const montoText = '$' + formatMoney(prestamo.monto)
      ctx.font = 'bold 52px Arial'
      const montoGradient = ctx.createLinearGradient(0, cardY + 55, 0, cardY + 110)
      montoGradient.addColorStop(0, '#059669')
      montoGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = montoGradient
      ctx.fillText(montoText, width/2, cardY + 105)
      
      // Badge de estado centrado
      const badgeY = cardY + 125
      ctx.fillStyle = estadoBg
      ctx.beginPath()
      ctx.roundRect(width/2 - 50, badgeY, 100, 32, 16)
      ctx.fill()
      
      ctx.fillStyle = estadoColor
      ctx.font = 'bold 13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(estadoText, width/2, badgeY + 21)
      
      // === DETALLES EN CARDS ===
      let detailsY = badgeY + 50
      
      // Card: Socio (ancho completo)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 18, detailsY + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(nombreSocio, cardInnerX + 18, detailsY + 42)
      
      // Fila 1: Interés Mensual y Número de Cuotas (2 columnas)
      const row1Y = detailsY + 70
      
      // Card: Interés Mensual (izquierda)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row1Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row1Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('INTERÉS', cardInnerX + 14, row1Y + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(prestamo.interes + '%', cardInnerX + 14, row1Y + 42)
      
      // Card: Número de Cuotas (derecha)
      const cuotasX = cardInnerX + cardHalfWidth + 12
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cuotasX, row1Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cuotasX, row1Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CUOTAS', cuotasX + 14, row1Y + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText((prestamo.numero_cuotas || 1).toString(), cuotasX + 14, row1Y + 42)
      
      // Fila 2: Valor de la Cuota y Saldo Actual (2 columnas)
      const row2Y = row1Y + 70
      
      // Card: Valor de la Cuota (izquierda)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row2Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row2Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('VALOR CUOTA', cardInnerX + 14, row2Y + 22)
      
      ctx.fillStyle = '#9333ea'
      ctx.font = 'bold 14px Arial'
      const valorCuotaText = '$' + formatMoney(calcularCuotaMensualDetalle(prestamo))
      // Ajustar texto si es muy largo
      const maxWidthCuota = cardHalfWidth - 28
      if (ctx.measureText(valorCuotaText).width > maxWidthCuota) {
        ctx.font = 'bold 12px Arial'
      }
      ctx.fillText(valorCuotaText, cardInnerX + 14, row2Y + 42)
      
      // Card: Interés Generado (derecha)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cuotasX, row2Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cuotasX, row2Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('INTERÉS GEN.', cuotasX + 14, row2Y + 22)
      
      ctx.fillStyle = '#ea580c'
      ctx.font = 'bold 14px Arial'
      const interesGeneradoText = '$' + formatMoney(calcularInteresGeneradoDetalle(prestamo))
      // Ajustar texto si es muy largo
      const maxWidthInteres = cardHalfWidth - 28
      if (ctx.measureText(interesGeneradoText).width > maxWidthInteres) {
        ctx.font = 'bold 12px Arial'
      }
      ctx.fillText(interesGeneradoText, cuotasX + 14, row2Y + 42)
      
      // Fila 3: Valor Pagado y Fecha de Creación (2 columnas)
      const row3Y = row2Y + 70
      
      // Card: Valor Pagado (izquierda)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row3Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row3Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('VALOR PAGADO', cardInnerX + 14, row3Y + 22)
      
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 14px Arial'
      const valorPagadoText = '$' + formatMoney(calcularValorPagadoDetalle(prestamo))
      // Ajustar texto si es muy largo
      const maxWidth = cardHalfWidth - 28
      if (ctx.measureText(valorPagadoText).width > maxWidth) {
        ctx.font = 'bold 12px Arial'
      }
      ctx.fillText(valorPagadoText, cardInnerX + 14, row3Y + 42)
      
      // Card: Fecha de Creación (derecha)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cuotasX, row3Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cuotasX, row3Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('FECHA', cuotasX + 14, row3Y + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 13px Arial'
      const fechaText = formatDate(prestamo.created_at) || 'N/A'
      ctx.fillText(fechaText, cuotasX + 14, row3Y + 42)
      
      // Fila 4: Saldo Actual (ancho completo)
      const row4Y = row3Y + 70
      
      // Card: Saldo Actual (ancho completo)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row4Y, cardInnerWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row4Y, cardInnerWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SALDO ACTUAL', cardInnerX + 18, row4Y + 22)
      
      ctx.fillStyle = saldoColor
      ctx.font = 'bold 16px Arial'
      const saldoText = '$' + formatMoney(prestamo.saldo_actual)
      ctx.fillText(saldoText, cardInnerX + 18, row4Y + 42)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      const btnY = cardY + cardHeight + 20
      
      // Sombra del botón
      ctx.fillStyle = 'rgba(5, 150, 105, 0.3)'
      ctx.beginPath()
      ctx.roundRect(cardInnerX + 2, btnY + 2, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Botón con gradiente
      const btnGradient = ctx.createLinearGradient(cardInnerX, btnY, cardInnerX, btnY + 52)
      btnGradient.addColorStop(0, '#059669')
      btnGradient.addColorStop(0.5, '#10b981')
      btnGradient.addColorStop(1, '#047857')
      ctx.fillStyle = btnGradient
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Borde sutil del botón
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.stroke()
      
      // Texto del botón
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PRÉSTAMO REGISTRADO', cardInnerX + cardInnerWidth/2 + 1, btnY + 34)
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PRÉSTAMO REGISTRADO', cardInnerX + cardInnerWidth/2, btnY + 33)
      
      resolve(canvas)
    } catch (e) {
      console.error('Error generando canvas:', e)
      resolve(null)
    }
  })
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
    const canvas = await generarImagenPrestamo()
    
    if (!canvas) {
      throw new Error('No se pudo generar la imagen')
    }
    
    const dataUrl = canvas.toDataURL('image/png')
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
    const canvas = await generarImagenPrestamo()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    
    // Incluir el nombre del socio en el nombre del archivo para mejor identificación
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
      link.href = canvas.toDataURL('image/png')
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
</script>

<style scoped>
/* Tarjeta en mora - efecto sutil de brillo mejorado */
.mora-card {
  animation: mora-subtle-glow 4s ease-in-out infinite;
}

@keyframes mora-subtle-glow {
  0%, 100% {
    box-shadow: 0 10px 30px -5px rgba(244, 63, 94, 0.15),
                0 8px 16px -6px rgba(251, 191, 36, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
  50% {
    box-shadow: 0 20px 40px -5px rgba(244, 63, 94, 0.25),
                0 12px 24px -6px rgba(251, 191, 36, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

/* Barra lateral animada mejorada */
.mora-bar {
  animation: bar-glow 3s ease-in-out infinite;
  box-shadow: 2px 0 12px rgba(244, 63, 94, 0.4),
              0 0 20px rgba(251, 191, 36, 0.2);
}

@keyframes bar-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 2px 0 12px rgba(244, 63, 94, 0.4),
                0 0 20px rgba(251, 191, 36, 0.2);
  }
  50% {
    opacity: 0.9;
    box-shadow: 3px 0 16px rgba(244, 63, 94, 0.5),
                0 0 24px rgba(251, 191, 36, 0.3);
  }
}

/* Icono de alerta animado */
.mora-alert-icon {
  animation: alert-pulse 2s ease-in-out infinite;
}

@keyframes alert-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(244, 63, 94, 0.4);
  }
}

/* Badge de días en mora */
.mora-days-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25),
              0 2px 4px rgba(251, 191, 36, 0.15);
  animation: badge-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.2s ease;
}

.mora-days-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(244, 63, 94, 0.3),
              0 3px 6px rgba(251, 191, 36, 0.2);
}

@keyframes badge-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
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

/* Responsive: ajustes para móvil */
@media (max-width: 640px) {
  .mora-days-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }
  
  .mora-days-badge svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>


<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <router-link 
        :to="`/natilleras/${id}/cuotas`" 
        class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm"
      >
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
        </div>
        <span class="whitespace-nowrap">Volver a meses</span>
      </router-link>
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
                <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-4 flex-wrap">
                  <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                    Cuotas y Pagos
                  </h1>
                  <!-- Mes integrado - Más evidente -->
                  <div v-if="mesSeleccionado" class="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-natillera-100 via-emerald-50 to-teal-50 backdrop-blur-sm rounded-2xl border-2 border-natillera-300/50 shadow-lg hover:shadow-xl transition-all">
                    <span class="text-3xl sm:text-4xl transform hover:scale-110 transition-transform duration-300">{{ getMesEmoji(mesSeleccionado) }}</span>
                    <div>
                      <p class="text-base sm:text-lg font-bold text-natillera-800 leading-tight">{{ mesSeleccionadoLabel }}</p>
                      <p class="text-xs sm:text-sm text-natillera-600 font-semibold leading-tight">{{ anioMesSeleccionado }}</p>
                    </div>
                  </div>
                </div>
                <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                  Gestiona los cobros y registra pagos por mes
                </p>
              </div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <button @click="abrirModalGenerarCuotas" class="btn-primary inline-flex items-center justify-center gap-2 flex-1 md:flex-none text-sm sm:text-base">
                <PlusIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Generar Cuotas</span>
              </button>
              <button 
                v-if="mesSeleccionado && cuotasPendientesMes.length > 0"
                @click="confirmarBorrarCuotasMes" 
                class="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:from-red-100 hover:to-orange-100 hover:border-red-400 hover:shadow-lg transition-all shadow-md flex-1 md:flex-none text-sm sm:text-base"
              >
                <TrashIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Borrar Cuotas</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen del mes seleccionado (clickeable para filtrar) -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
      <button 
        @click="filtroEstado = filtroEstado === 'pagada' ? 'todos' : 'pagada'"
        :class="[
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-lg',
          filtroEstado === 'pagada' 
            ? 'border-green-300 shadow-xl shadow-green-500/20 scale-105 ring-2 ring-green-400' 
            : 'border-green-200/50 hover:shadow-xl hover:-translate-y-1 hover:border-green-300'
        ]"
      >
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{{ resumenMesActual.pagadas }}</p>
          <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Pagadas</p>
          <p v-if="filtroEstado === 'pagada'" class="text-xs text-green-600 font-bold mt-2 px-2 py-1 bg-green-100 rounded-full">✓ Filtrado</p>
        </div>
      </button>
      <button 
        @click="filtroEstado = filtroEstado === 'pendiente' ? 'todos' : 'pendiente'"
        :class="[
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 border backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-lg',
          filtroEstado === 'pendiente' 
            ? 'border-amber-300 shadow-xl shadow-amber-500/20 scale-105 ring-2 ring-amber-400' 
            : 'border-amber-200/50 hover:shadow-xl hover:-translate-y-1 hover:border-amber-300'
        ]"
      >
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{{ resumenMesActual.pendientes }}</p>
          <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Pendientes</p>
          <p v-if="filtroEstado === 'pendiente'" class="text-xs text-amber-600 font-bold mt-2 px-2 py-1 bg-amber-100 rounded-full">✓ Filtrado</p>
        </div>
      </button>
      <button 
        @click="filtroEstado = filtroEstado === 'mora' ? 'todos' : 'mora'"
        :class="[
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 border backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-lg',
          filtroEstado === 'mora' 
            ? 'border-red-300 shadow-xl shadow-red-500/20 scale-105 ring-2 ring-red-400' 
            : 'border-red-200/50 hover:shadow-xl hover:-translate-y-1 hover:border-red-300'
        ]"
      >
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{{ resumenMesActual.enMora }}</p>
          <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">En Mora</p>
          <p v-if="filtroEstado === 'mora'" class="text-xs text-red-600 font-bold mt-2 px-2 py-1 bg-red-100 rounded-full">✓ Filtrado</p>
        </div>
      </button>
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border border-green-200/50 backdrop-blur-sm shadow-lg">
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">${{ formatMoney(resumenMesActual.totalRecaudado || 0) }}</p>
          <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Total Recaudado</p>
        </div>
      </div>
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 backdrop-blur-sm shadow-lg col-span-2 lg:col-span-1">
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <!-- Texto a la izquierda -->
          <div class="flex-1">
            <p class="text-xs sm:text-sm font-semibold text-purple-700 mb-1">Progreso de recaudación</p>
            <p class="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">{{ (resumenMesActual.porcentajeRecaudado || 0).toFixed(0) }}%</p>
          </div>
          <!-- Círculo de progreso a la derecha -->
          <div class="relative flex-shrink-0">
            <svg class="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 transform -rotate-90" viewBox="0 0 100 100">
              <!-- Círculo de fondo -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                stroke-width="8"
                class="text-purple-200"
              />
              <!-- Círculo de progreso -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                stroke-width="8"
                stroke-linecap="round"
                class="text-purple-600 transition-all duration-500"
                :stroke-dasharray="`${2 * Math.PI * 45}`"
                :stroke-dashoffset="`${2 * Math.PI * 45 * (1 - (resumenMesActual.porcentajeRecaudado || 0) / 100)}`"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón para mostrar/ocultar filtros -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div class="flex items-center gap-2">
        <button
          @click="mostrarFiltros = !mostrarFiltros"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-natillera-300 hover:bg-natillera-50 hover:shadow-lg transition-all shadow-md"
        >
          <FunnelIcon class="w-5 h-5" />
          <span>{{ mostrarFiltros ? 'Ocultar' : 'Mostrar' }} Filtros</span>
          <ChevronDownIcon 
            :class="[
              'w-4 h-4 transition-transform duration-300',
              mostrarFiltros ? 'rotate-180' : ''
            ]"
          />
        </button>
        
        <!-- Botón Quitar Filtros -->
        <button
          v-if="filtroEstado !== 'todos' || filtroPeriodicidad !== 'todos' || busquedaCuotas.trim()"
          @click="quitarFiltros"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl font-semibold text-sm text-red-700 hover:from-red-100 hover:to-orange-100 hover:border-red-400 hover:shadow-lg transition-all shadow-md"
        >
          <XMarkIcon class="w-5 h-5" />
          <span>Quitar Filtros</span>
        </button>
      </div>
      
      <!-- Indicador de filtros activos -->
      <div v-if="filtroEstado !== 'todos' || filtroPeriodicidad !== 'todos' || busquedaCuotas.trim()" class="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-natillera-50 to-emerald-50 border border-natillera-200 rounded-xl text-sm text-natillera-700 shadow-sm">
        <span class="w-2.5 h-2.5 rounded-full bg-natillera-500 animate-pulse shadow-sm"></span>
        <span class="font-semibold">Filtros activos</span>
      </div>
    </div>

    <!-- Filtros elegantes -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-show="mostrarFiltros" class="card bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg mb-4 backdrop-blur-sm">
      <div class="flex flex-col gap-4">
        <!-- Filtros de Periodicidad -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Etiqueta -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <FunnelIcon class="w-5 h-5 text-gray-400" />
            <span class="text-sm font-semibold text-gray-700">Filtros de periodicidad</span>
          </div>
          
          <!-- Botones en la misma línea -->
          <div class="flex flex-wrap gap-2 flex-1">
            <!-- Botón Todos -->
            <button
              @click="filtroPeriodicidad = 'todos'"
              :class="[
                'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
                filtroPeriodicidad === 'todos'
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'todos'"
                class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
              ></div>
              <span class="relative flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="filtroPeriodicidad === 'todos' ? 'bg-white' : 'bg-gray-400'"></span>
                Todos
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    filtroPeriodicidad === 'todos' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ cuotasMesActual.length }}
                </span>
              </span>
            </button>

            <!-- Mensual -->
            <button
              @click="filtroPeriodicidad = filtroPeriodicidad === 'mensual' ? 'todos' : 'mensual'"
              :class="[
                'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
                filtroPeriodicidad === 'mensual'
                  ? 'text-white shadow-lg shadow-natillera-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'mensual'"
                class="absolute inset-0 bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500"
              ></div>
              <span class="relative flex items-center gap-2">
                <span class="text-lg">📅</span>
                Mensual
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    filtroPeriodicidad === 'mensual' ? 'bg-white/20 text-white' : 'bg-natillera-100 text-natillera-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => !c.quincena).length }}
                </span>
              </span>
            </button>

            <!-- Quincenal -->
            <button
              @click="filtroPeriodicidad = filtroPeriodicidad === 'quincenal' ? 'todos' : 'quincenal'"
              :class="[
                'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
                filtroPeriodicidad === 'quincenal'
                  ? 'text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'quincenal'"
                class="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"
              ></div>
              <span class="relative flex items-center gap-2">
                <span class="text-lg">🗓️</span>
                Quincenal
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    filtroPeriodicidad === 'quincenal' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => c.quincena).length }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Barra de búsqueda -->
        <div class="relative">
          <MagnifyingGlassIcon class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            ref="inputBusquedaRef"
            v-model="busquedaCuotas"
            type="text"
            placeholder="Buscar por nombre del socio, descripción de la cuota..."
            @keydown.esc="busquedaCuotas = ''"
            class="w-full pl-12 pr-12 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-natillera-500/50 focus:border-natillera-500 focus:bg-white transition-all shadow-sm"
          />
          <button
            v-if="busquedaCuotas.trim()"
            @click="busquedaCuotas = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Limpiar búsqueda"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- Lista de cuotas - Indicador de carga mejorado -->
    <div v-if="cuotasStore.loading || inicializando" class="flex flex-col items-center justify-center py-16 px-4">
      <div class="relative">
        <!-- Fondo con pulso suave -->
        <div class="absolute inset-0 w-20 h-20 -m-2 bg-natillera-100 rounded-full animate-pulse"></div>
        <!-- Círculo exterior -->
        <div class="relative w-16 h-16 border-4 border-natillera-200 rounded-full"></div>
        <!-- Círculo interior giratorio -->
        <div class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-natillera-500 border-r-natillera-400 rounded-full animate-spin"></div>
        <!-- Icono central -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg v-if="generandoCuotas" class="w-6 h-6 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else class="w-6 h-6 text-natillera-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <p class="text-gray-700 mt-6 font-semibold text-lg">
        {{ generandoCuotas ? 'Preparando cuotas del mes...' : 'Cargando cuotas...' }}
      </p>
      <p class="text-gray-400 text-sm mt-1">
        {{ generandoCuotas ? 'Generando cuotas para los socios' : 'Esto solo tomará un momento' }}
      </p>
    </div>

    <!-- Estado vacío: Sin cuotas generadas para el mes -->
    <div v-else-if="cuotasMesActual.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-natillera-100 to-emerald-100 mb-6">
          <CurrencyDollarIcon class="w-10 h-10 text-natillera-600" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-3">
          No hay cuotas para {{ mesSeleccionadoLabel }}
        </h3>
        <p class="text-gray-600 mt-2 mb-8 text-base">
          Genera las cuotas de este mes para comenzar a registrar pagos
        </p>
        <button @click="abrirModalGenerarCuotas" class="btn-primary inline-flex items-center gap-2 shadow-lg">
          <PlusIcon class="w-5 h-5" />
          Generar Cuotas de {{ mesSeleccionadoLabel }}
        </button>
      </div>
    </div>

    <!-- Estado vacío: Sin resultados con el filtro actual -->
    <div v-else-if="cuotasFiltradas.length === 0" class="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 rounded-3xl p-8 sm:p-12 border border-amber-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-orange-400/20 to-amber-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-6">
          <FunnelIcon class="w-10 h-10 text-amber-600" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-3">
          No hay cuotas con los filtros seleccionados
        </h3>
        <p class="text-gray-600 mt-2 mb-8 text-base">
          No se encontraron cuotas que coincidan con los filtros aplicados
        </p>
        <button 
          @click="quitarFiltros" 
          class="btn-secondary inline-flex items-center gap-2 shadow-md"
        >
          <XMarkIcon class="w-5 h-5" />
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Lista de cuotas filtradas -->
    <div v-else class="space-y-4">
      <!-- Título, contador y toggle de vista -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Título de sección de cuotas - Armónico y destacado -->
        <div v-if="cuotasMesActual.length > 0" class="flex-1 min-w-0">
          <div class="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-white via-natillera-50/80 to-emerald-50/60 border-2 border-natillera-300/50 shadow-lg sm:shadow-xl backdrop-blur-sm px-3 sm:px-5 py-2.5 sm:py-3.5">
            <!-- Efecto de fondo decorativo -->
            <div class="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-natillera-400/20 to-emerald-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-teal-400/20 to-natillera-400/15 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
            
            <div class="relative flex items-center gap-2 sm:gap-3">
              <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-natillera-500 to-emerald-600 flex items-center justify-center shadow-md sm:shadow-lg shadow-natillera-500/30 flex-shrink-0">
                <CurrencyDollarIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-sm sm:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span class="whitespace-nowrap">Cuotas del Mes</span>
                  <span class="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                    <span v-if="cuotasFiltradas.length === cuotasMesActual.length">
                      {{ cuotasMesActual.length }}
                    </span>
                    <template v-else>
                      <span class="hidden sm:inline">
                        Mostrando {{ cuotasFiltradas.length }} de {{ cuotasMesActual.length }}
                      </span>
                      <span class="sm:hidden">
                        {{ cuotasFiltradas.length }}/{{ cuotasMesActual.length }}
                      </span>
                    </template>
                  </span>
                  <span v-if="filtroPeriodicidad !== 'todos'" class="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full hidden sm:inline">
                    ({{ filtroPeriodicidad === 'mensual' ? 'mensuales' : 'quincenales' }})
                  </span>
                </h2>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <!-- Botón Exportar Excel (solo visible en vista Excel) -->
          <button
            v-if="vistaExcel"
            @click="abrirModalExportar"
            class="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-xl"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Exportar</span>
          </button>
          
          <!-- Toggle de vista -->
          <!-- Vista móvil: Switch animado -->
          <div class="md:hidden w-full relative bg-gray-100 rounded-2xl p-1.5 shadow-inner border-2 border-gray-200">
            <!-- Indicador deslizante animado -->
            <div 
              class="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-natillera-500 to-emerald-600 shadow-lg transition-all duration-300 ease-out"
              :style="{
                width: 'calc(50% - 3px)',
                left: vistaAgrupada ? 'calc(50% + 1.5px)' : '3px',
                transform: vistaAgrupada ? 'translateX(0)' : 'translateX(0)'
              }"
            ></div>
            
            <!-- Botones -->
            <div class="relative flex items-center">
              <button
                @click="vistaAgrupada = false; vistaExcel = false"
                class="flex-1 relative z-10 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
                :class="!vistaAgrupada && !vistaExcel ? 'text-white' : 'text-gray-600'"
              >
                <Squares2X2Icon class="w-5 h-5" />
                <span>Tarjetas</span>
              </button>
              <button
                @click="vistaAgrupada = true; vistaExcel = false"
                class="flex-1 relative z-10 py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
                :class="vistaAgrupada && !vistaExcel ? 'text-white' : 'text-gray-600'"
              >
                <UserGroupIcon class="w-5 h-5" />
                <span>Por Socio</span>
              </button>
            </div>
          </div>
          
          <!-- Vista desktop: Botones normales -->
          <div class="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2.5 self-stretch shadow-md">
            <button
              @click="vistaAgrupada = false; vistaExcel = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                !vistaAgrupada && !vistaExcel
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <Squares2X2Icon class="w-4 h-4" />
              <span>Tarjetas</span>
            </button>
            <button
              @click="vistaAgrupada = true; vistaExcel = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                vistaAgrupada && !vistaExcel
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <UserGroupIcon class="w-4 h-4" />
              <span>Por Socio</span>
            </button>
            <button
              @click="vistaExcel = true; vistaAgrupada = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                vistaExcel && !vistaAgrupada
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <TableCellsIcon class="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Vista Agrupada por Socio -->
      <template v-if="vistaAgrupada && !vistaExcel">
        <div class="space-y-4">
          <div 
            v-for="grupo in cuotasAgrupadasPorSocio" 
            :key="grupo.socioId"
            class="relative overflow-hidden rounded-2xl border border-gray-200/60 shadow-lg bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20"
          >
            <!-- Header del grupo (Socio) -->
            <div class="bg-gradient-to-r from-natillera-500/10 via-emerald-500/10 to-teal-500/10 border-b border-gray-200/60 p-4 sm:p-5">
              <div class="flex items-center gap-4">
                <img 
                  :src="getAvatarUrl(grupo.socio?.nombre || grupo.socioId, grupo.socio?.avatar_seed, grupo.socio?.avatar_style)" 
                  :alt="grupo.socio?.nombre"
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-natillera-300 shadow-md object-cover"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg sm:text-xl font-display font-bold text-gray-800 truncate">
                    {{ grupo.socio?.nombre || 'Socio' }}
                  </h3>
                  <div class="flex items-center gap-3 mt-1 flex-wrap">
                    <span class="text-sm text-gray-600 font-medium">
                      {{ grupo.cuotas.length }} cuota{{ grupo.cuotas.length !== 1 ? 's' : '' }}
                    </span>
                    <span class="text-sm font-semibold text-natillera-700">
                      Total: ${{ formatMoney(grupo.total) }}
                    </span>
                    <span class="text-sm font-semibold text-green-600">
                      Pagado: ${{ formatMoney(grupo.pagado) }}
                    </span>
                    <span class="text-sm font-semibold"
                      :class="grupo.pendiente > 0 ? 'text-red-600' : 'text-gray-500'"
                    >
                      Pendiente: ${{ formatMoney(grupo.pendiente) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de cuotas del socio -->
            <div class="p-4 sm:p-5 space-y-3">
              <div 
                v-for="cuota in grupo.cuotas" 
                :key="cuota.id"
                @click="abrirModalDetalleCuota(cuota)"
                class="relative overflow-hidden rounded-xl p-4 border cursor-pointer transition-all duration-300 group"
                :class="[
                  (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-gradient-to-br from-green-100 via-emerald-100 via-teal-50 to-green-50 border-2 border-green-400/80 shadow-lg shadow-green-200/60 hover:shadow-xl hover:shadow-green-300/70 hover:border-green-500' : 
                  (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-gradient-to-br from-red-100 via-red-50 to-rose-50 border-red-300/70 hover:border-red-400 hover:shadow-md' : 
                  (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-50/50 border-gray-200/60 hover:border-gray-300 hover:shadow-md' : 
                  (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-gradient-to-br from-white via-amber-50/50 to-orange-50/40 border-amber-300/70 hover:border-amber-400 border-2 hover:shadow-md' :
                  'bg-orange-50/50 border-orange-200/60 hover:border-orange-300 hover:shadow-md'
                ]"
              >
                <!-- Efectos decorativos para cuotas pagadas -->
                <template v-if="(cuota.estadoReal || cuota.estado) === 'pagada'">
                  <!-- Círculos decorativos con blur para crear profundidad -->
                  <div class="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-green-300/40 to-emerald-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/35 to-teal-200/25 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                  <!-- Línea decorativa superior más visible -->
                  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-md"></div>
                  <!-- Efecto de brillo sutil en hover -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </template>
                
                <!-- Indicador de pago parcial (considera cuota + sanción) -->
                <div 
                  v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))"
                  class="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl shadow-md z-20"
                >
                  ⚠️ PAGO PARCIAL
                </div>
                
                <!-- Indicador de ajuste de valor -->
                <div 
                  v-if="tieneAjuste(cuota)"
                  class="absolute top-0 left-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-xl shadow-md z-20 flex items-center gap-1"
                  :title="getTextoAjuste(cuota)"
                >
                  <InformationCircleIcon class="w-3 h-3" />
                  <span>AJUSTE</span>
                </div>
                
                <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl">{{ getMesEmoji(cuota.mes) }}</span>
                        <div>
                          <p class="font-bold text-gray-800 text-sm sm:text-base">
                            {{ getMesLabel(cuota.mes) }} {{ cuota.anio }}
                          </p>
                          <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <CalendarDaysIcon class="w-3 h-3" />
                            Vence: {{ formatDate(cuota.fecha_vencimiento || cuota.fecha_limite) }}
                          </p>
                        </div>
                      </div>
                      <!-- Badge de quincena -->
                      <span 
                        v-if="cuota.quincena"
                        class="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md border border-purple-400"
                      >
                        <span>{{ cuota.quincena === 1 ? '1er' : '2da' }} Quincena</span>
                      </span>
                      <span 
                        :class="[
                          'px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1',
                          (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400 shadow-sm' :
                          (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-100 text-red-700 border border-red-200' :
                          (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                          (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' :
                          'bg-orange-100 text-orange-700 border border-orange-200'
                        ]"
                      >
                        <CheckCircleIcon v-if="(cuota.estadoReal || cuota.estado) === 'pagada'" class="w-3.5 h-3.5" />
                        {{ (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagada' :
                            (cuota.estadoReal || cuota.estado) === 'mora' ? 'En Mora' :
                            (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' :
                            (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'Pago Parcial' :
                            'Pendiente' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 w-full sm:w-auto">
                    <div class="text-right flex-1 sm:flex-none">
                      <!-- Mostrar información de pago parcial si aplica -->
                      <template v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))">
                        <p class="text-xs text-gray-500 mb-0.5">Pendiente</p>
                        <p class="font-bold text-base sm:text-lg text-orange-600">
                          ${{ formatMoney(cuota.valor_cuota - (cuota.valor_pagado || 0)) }}
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">
                          Cuota: ${{ formatMoney(cuota.valor_cuota) }}
                        </p>
                        <p class="text-xs font-medium text-green-600 mt-0.5">
                          Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
                        </p>
                      </template>
                      <template v-else>
                        <p class="font-bold text-base sm:text-lg"
                          :class="(cuota.estadoReal || cuota.estado) === 'pagada' ? 'text-green-600' : (cuota.estadoReal || cuota.estado) === 'mora' ? 'text-red-600' : 'text-gray-800'"
                        >
                          ${{ formatMoney(cuota.valor_cuota) }}
                        </p>
                        <!-- Mostrar multa si se pagó con multa (debajo del monto a pagar) -->
                        <p 
                          v-if="(cuota.estadoReal || cuota.estado) === 'pagada' && cuota.valor_pagado > cuota.valor_cuota"
                          class="text-xs text-amber-600 font-semibold mt-0.5"
                        >
                          + Multa: ${{ formatMoney(cuota.valor_pagado - cuota.valor_cuota) }}
                        </p>
                        <p 
                          class="text-xs mt-1"
                          :class="(cuota.estadoReal || cuota.estado) === 'pagada' ? 'text-green-600 font-medium' : 'text-gray-500'"
                        >
                          Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
                        </p>
                      </template>
                    </div>
                    
                    <!-- Botones de acción desktop: diseño diferente para pago parcial -->
                    <template v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))">
                      <!-- Diseño para pago parcial: 50% Pagar, 25% Editar, 25% Reenviar -->
                      <div class="hidden sm:flex items-stretch gap-2" @click.stop>
                        <!-- Botón Pagar: 50% -->
                        <button 
                          @click="abrirModalPago(cuota)"
                          class="flex-[2] px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                        >
                          <CurrencyDollarIcon class="w-5 h-5" />
                          <span>Pagar</span>
                        </button>
                        
                        <!-- Botón Editar: 25% -->
                        <button 
                          @click="abrirModalEditar(cuota)"
                          class="flex-1 px-3 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-1.5"
                          title="Editar pago"
                        >
                          <PencilIcon class="w-4 h-4" />
                          <span class="hidden lg:inline">Editar</span>
                        </button>
                        
                        <!-- Botón Reenviar: 25% -->
                        <button 
                          @click="reenviarComprobante(cuota)"
                          class="flex-1 px-3 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-1.5"
                          title="Reenviar comprobante"
                        >
                          <ArrowPathIcon class="w-4 h-4" />
                          <span class="hidden lg:inline">Reenviar</span>
                        </button>
                      </div>
                    </template>
                    
                    <!-- Diseño normal para otras cuotas desktop -->
                    <template v-else>
                      <div class="flex items-center justify-end gap-2 sm:flex-shrink-0" @click.stop>
                        <button 
                          v-if="(cuota.estadoReal || cuota.estado) !== 'pagada'"
                          @click="abrirModalPago(cuota)"
                          class="hidden sm:flex px-4 py-2 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm whitespace-nowrap items-center gap-2"
                        >
                          <CurrencyDollarIcon class="w-4 h-4" />
                          <span>Pagar</span>
                        </button>

                        <button 
                          v-if="cuota.estado === 'pagada'"
                          @click="reenviarComprobante(cuota)"
                          class="hidden sm:flex px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm items-center gap-2"
                          title="Reenviar comprobante"
                        >
                          <ArrowPathIcon class="w-4 h-4" />
                          <span>Reenviar</span>
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
                
                <!-- Botones móvil: diseño diferente para pago parcial -->
                <template v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))">
                  <!-- Diseño para pago parcial en móvil -->
                  <div class="sm:hidden flex flex-col gap-2 mt-3" @click.stop>
                    <!-- Botón Pagar: ancho completo -->
                    <button 
                      @click="abrirModalPago(cuota)"
                      class="w-full px-6 py-3.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon class="w-5 h-5" />
                      <span>Pagar</span>
                    </button>
                    
                    <!-- Botones Editar y Reenviar: 50% cada uno -->
                    <div class="flex gap-2">
                      <button 
                        @click="abrirModalEditar(cuota)"
                        class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                      >
                        <PencilIcon class="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      
                      <button 
                        @click="reenviarComprobante(cuota)"
                        class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                      >
                        <ArrowPathIcon class="w-4 h-4" />
                        <span>Reenviar</span>
                      </button>
                    </div>
                  </div>
                </template>
                
                <!-- Botón Pagar móvil: ancho completo solo para cuotas normales -->
                <div v-else-if="(cuota.estadoReal || cuota.estado) !== 'pagada'" class="sm:hidden mt-2" @click.stop>
                  <button 
                    @click="abrirModalPago(cuota)"
                    class="w-full px-6 py-3.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    <CurrencyDollarIcon class="w-5 h-5" />
                    <span>Pagar</span>
                  </button>
                </div>
                
                <!-- Botón Reenviar comprobante móvil: para cuotas pagadas -->
                <div v-else-if="cuota.estado === 'pagada'" class="sm:hidden mt-2" @click.stop>
                  <button 
                    @click="reenviarComprobante(cuota)"
                    class="w-full px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon class="w-5 h-5" />
                    <span>Reenviar Comprobante</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vista Tarjetas -->
      <template v-else-if="!vistaExcel && !vistaAgrupada">
        <div 
          v-for="cuota in cuotasFiltradas" 
          :key="cuota.id"
          @click="abrirModalDetalleCuota(cuota)"
          class="relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer group"
          :class="[
            (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-gradient-to-br from-green-100 via-emerald-100 via-teal-50 to-green-50 border-2 border-green-400/80 shadow-xl shadow-green-200/70 hover:shadow-2xl hover:shadow-green-300/80 hover:border-green-500' : 
            (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-gradient-to-br from-red-100 via-red-50 to-rose-50 border-red-300/70 hover:border-red-400 shadow-md hover:shadow-lg' : 
            (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gradient-to-br from-white via-gray-50/40 to-slate-50/30 border-gray-200/60 hover:border-gray-300 shadow-md hover:shadow-lg' : 
            (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-gradient-to-br from-white via-amber-50/50 to-orange-50/40 border-amber-300/70 hover:border-amber-400 border-2 shadow-md hover:shadow-lg' :
            'bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 border-orange-200/60 hover:border-orange-300 shadow-md hover:shadow-lg'
          ]"
        >
          <!-- Efectos decorativos para cuotas pagadas -->
          <template v-if="(cuota.estadoReal || cuota.estado) === 'pagada'">
            <!-- Círculos decorativos con blur para crear profundidad -->
            <div class="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-green-300/40 to-emerald-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-200/35 to-teal-200/25 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            <!-- Línea decorativa superior más visible -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-md"></div>
            <!-- Efecto de brillo sutil en hover -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </template>
          
          <!-- Efectos decorativos de fondo para otros estados -->
          <div 
            v-if="(cuota.estadoReal || cuota.estado) !== 'pagada'"
            :class="[
              'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-20 transition-opacity duration-300 group-hover:opacity-30',
              (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-300' : 
              (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-300' : 
              (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-amber-300' :
              'bg-orange-300'
            ]"
          ></div>
          
          <!-- Línea decorativa superior para otros estados -->
          <div 
            v-if="(cuota.estadoReal || cuota.estado) !== 'pagada'"
            :class="[
              'absolute top-0 left-0 right-0 h-0.5',
              (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-400/60' : 
              (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-400/60' : 
              (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-amber-400/60' :
              'bg-orange-400/60'
            ]"
          ></div>
          
          <!-- Indicador de pago parcial -->
          <div 
            v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))"
            class="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl shadow-md z-20"
          >
            ⚠️ PAGO PARCIAL
          </div>
          
          <!-- Indicador de ajuste de valor -->
          <div 
            v-if="tieneAjuste(cuota)"
            class="absolute top-0 left-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-xl shadow-md z-20 flex items-center gap-1"
            :title="getTextoAjuste(cuota)"
          >
            <InformationCircleIcon class="w-3 h-3" />
            <span>AJUSTE</span>
          </div>
          
          <div class="relative z-10">
            <!-- Layout para móvil: más ordenado y vertical -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <!-- Sección superior en móvil / izquierda en desktop: Avatar y nombre del socio -->
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <!-- Avatar del socio más compacto -->
                <div class="relative flex-shrink-0">
                  <img 
                    @click.stop="verDetalleSocio(cuota.socio_natillera)"
                    :src="getAvatarUrl(cuota.socio_natillera?.socio?.nombre || cuota.socio_natillera?.id, cuota.socio_natillera?.socio?.avatar_seed, cuota.socio_natillera?.socio?.avatar_style)" 
                    :alt="cuota.socio_natillera?.socio?.nombre"
                    class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 shadow-md object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer hover:ring-2 hover:ring-natillera-400 hover:ring-offset-2"
                    :class="[
                      cuota.estado === 'pagada' ? 'border-green-300' : 
                      cuota.estado === 'mora' ? 'border-red-300' : 
                      (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'border-amber-300' :
                      cuota.estado === 'parcial' ? 'border-blue-300' : 
                      cuota.estado === 'programada' ? 'border-gray-300' : 'border-orange-300'
                    ]"
                  />
                  <!-- Badge de estado en el avatar más pequeño -->
                  <div 
                    :class="[
                      'absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-md border-2 border-white',
                      cuota.estado === 'pagada' ? 'bg-green-500' : 
                      cuota.estado === 'mora' ? 'bg-red-500' : 
                      (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-amber-500' :
                      cuota.estado === 'parcial' ? 'bg-blue-500' : 
                      cuota.estado === 'programada' ? 'bg-gray-400' : 'bg-orange-500'
                    ]"
                  >
                    <component 
                      :is="cuota.estado === 'pagada' ? CheckCircleIcon : 
                           cuota.estado === 'mora' ? ExclamationCircleIcon : 
                           cuota.estado === 'programada' ? CalendarIcon : ClockIcon"
                      class="w-3.5 h-3.5 text-white"
                    />
                  </div>
                </div>
                
                <!-- Información del socio más compacta -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 class="text-base sm:text-lg lg:text-xl font-bold text-gray-900 group-hover:text-natillera-700 transition-colors">
                      {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
                    </h3>
                    <!-- Badge de periodicidad más pequeño -->
                    <span 
                      v-if="cuota.quincena" 
                      class="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md border border-purple-400"
                    >
                      <span>{{ cuota.quincena === 1 ? '1er' : '2da' }} Quincena</span>
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center gap-1 px-2 py-0.5 bg-natillera-100 text-natillera-700 text-xs font-semibold rounded-lg border border-natillera-200"
                    >
                      <span>📅</span>
                      <span>Mensual</span>
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs text-gray-600 flex items-center gap-1.5">
                      <CalendarIcon class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>Vence: <span class="font-semibold">{{ formatDate(cuota.fecha_vencimiento || cuota.fecha_limite) }}</span></span>
                    </p>
                    <!-- Fecha de pago si está pagada -->
                    <p 
                      v-if="(cuota.estadoReal || cuota.estado) === 'pagada' && cuota.fecha_pago"
                      class="text-xs text-green-600 font-medium flex items-center gap-1.5"
                    >
                      <CheckCircleIcon class="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span>Pagado: <span class="font-semibold">{{ formatDate(cuota.fecha_pago) }}</span></span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Sección inferior en móvil / derecha en desktop: Valores, estado y acciones -->
              <div class="flex flex-col gap-3">
                <!-- Valores y estado en una fila -->
                <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <!-- Valores más compactos -->
                  <div class="text-left sm:text-right flex-shrink-0">
                    <!-- Estado mora con multa -->
                    <template v-if="(cuota.estadoReal || cuota.estado) === 'mora'">
                      <p class="text-xs text-gray-500 mb-0.5">Total a Pagar</p>
                      <p class="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                        ${{ formatMoney(getTotalAPagar(cuota)) }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        Cuota: ${{ formatMoney(cuota.valor_cuota) }}
                      </p>
                      <p v-if="getSancionCuota(cuota) > 0" class="text-xs font-semibold mt-0.5 text-red-600">
                        + Multa: ${{ formatMoney(getSancionCuota(cuota)) }}
                      </p>
                      <p v-if="cuota.valor_pagado > 0" class="text-xs font-medium mt-0.5 text-green-600">
                        Pagado: ${{ formatMoney(cuota.valor_pagado) }}
                      </p>
                    </template>
                    <!-- Estado parcial -->
                    <template v-else-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))">
                      <p class="text-xs text-gray-500 mb-0.5">Pendiente</p>
                      <p class="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">${{ formatMoney(cuota.valor_cuota - (cuota.valor_pagado || 0)) }}</p>
                      <p class="text-xs text-gray-500 mt-1">
                        Cuota: ${{ formatMoney(cuota.valor_cuota) }}
                      </p>
                      <p class="text-xs font-medium mt-0.5 text-green-600">
                        Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
                      </p>
                    </template>
                    <!-- Estado normal -->
                    <template v-else>
                      <p 
                        class="text-lg sm:text-xl lg:text-2xl font-bold"
                        :class="(cuota.estadoReal || cuota.estado) === 'pagada' ? 'text-green-600' : 'text-gray-900'"
                      >
                        ${{ formatMoney(cuota.valor_cuota) }}
                      </p>
                      <!-- Mostrar multa si se pagó con multa (debajo del monto a pagar) -->
                      <p 
                        v-if="(cuota.estadoReal || cuota.estado) === 'pagada' && cuota.valor_pagado > cuota.valor_cuota"
                        class="text-xs text-amber-600 font-semibold mt-0.5"
                      >
                        + Multa: ${{ formatMoney(cuota.valor_pagado - cuota.valor_cuota) }}
                      </p>
                      <p 
                        class="text-xs font-medium mt-1"
                        :class="(cuota.estadoReal || cuota.estado) === 'pagada' ? 'text-green-600 font-medium' : (cuota.valor_pagado > 0 ? 'text-green-600' : 'text-gray-400')"
                      >
                        Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
                      </p>
                    </template>
                  </div>
                  
                  <!-- Badge de estado más compacto -->
                  <span 
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1',
                      (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400 shadow-sm' : 
                      (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-100 text-red-800 border border-red-200' : 
                      (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-100 text-gray-700 border border-gray-200' : 
                      (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' :
                      'bg-orange-100 text-orange-800 border border-orange-200'
                    ]"
                  >
                    <CheckCircleIcon v-if="(cuota.estadoReal || cuota.estado) === 'pagada'" class="w-3.5 h-3.5" />
                    {{ (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' : 
                       (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagada' : 
                       (cuota.estadoReal || cuota.estado) === 'mora' ? 'En Mora' : 
                       (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))) ? 'Pago Parcial' :
                       'Pendiente' }}
                  </span>
                </div>

                <!-- Botones de acción: diseño diferente para pago parcial -->
                <template v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))">
                  <!-- Diseño para pago parcial: 50% Pagar, 25% Editar, 25% Reenviar -->
                  <div class="hidden sm:flex items-stretch gap-2 w-full" @click.stop>
                    <!-- Botón Pagar: 50% -->
                    <button 
                      @click="abrirModalPago(cuota)"
                      class="flex-[2] px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon class="w-5 h-5" />
                      <span>Pagar</span>
                    </button>
                    
                    <!-- Botón Editar: 25% -->
                    <button 
                      @click="abrirModalEditar(cuota)"
                      class="flex-1 px-3 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-1.5"
                      title="Editar pago"
                    >
                      <PencilIcon class="w-4 h-4" />
                      <span class="hidden lg:inline">Editar</span>
                    </button>
                    
                    <!-- Botón Reenviar: 25% -->
                    <button 
                      @click="reenviarComprobante(cuota)"
                      class="flex-1 px-3 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-1.5"
                      title="Reenviar comprobante"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                      <span class="hidden lg:inline">Reenviar</span>
                    </button>
                  </div>
                </template>
                
                <!-- Diseño normal para otras cuotas -->
                <template v-else>
                  <div class="flex items-center justify-end gap-2 sm:flex-shrink-0" @click.stop>
                    <button 
                      v-if="(cuota.estadoReal || cuota.estado) !== 'pagada'"
                      @click="abrirModalPago(cuota)"
                      class="hidden sm:flex px-4 py-2 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm whitespace-nowrap items-center gap-2"
                    >
                      <CurrencyDollarIcon class="w-4 h-4" />
                      <span>Pagar</span>
                    </button>

                    <button 
                      v-if="cuota.estado === 'pagada'"
                      @click="reenviarComprobante(cuota)"
                      class="hidden sm:flex px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm items-center gap-2"
                      title="Reenviar comprobante"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                      <span>Reenviar</span>
                    </button>
                  </div>
                </template>
              </div>
              
              <!-- Botones móvil: diseño diferente para pago parcial -->
              <template v-if="cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota))">
                <!-- Diseño para pago parcial en móvil -->
                <div class="sm:hidden flex flex-col gap-2 mt-3" @click.stop>
                  <!-- Botón Pagar: ancho completo -->
                  <button 
                    @click="abrirModalPago(cuota)"
                    class="w-full px-6 py-3.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                  >
                    <CurrencyDollarIcon class="w-5 h-5" />
                    <span>Pagar</span>
                  </button>
                  
                  <!-- Botones Editar y Reenviar: 50% cada uno -->
                  <div class="flex gap-2">
                    <button 
                      @click="abrirModalEditar(cuota)"
                      class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                    >
                      <PencilIcon class="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    
                    <button 
                      @click="reenviarComprobante(cuota)"
                      class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                      <span>Reenviar</span>
                    </button>
                  </div>
                </div>
              </template>
              
              <!-- Botón Pagar móvil: ancho completo solo para cuotas normales -->
              <div v-else-if="(cuota.estadoReal || cuota.estado) !== 'pagada'" class="sm:hidden mt-2" @click.stop>
                <button 
                  @click="abrirModalPago(cuota)"
                  class="w-full px-6 py-3.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <CurrencyDollarIcon class="w-5 h-5" />
                  <span>Pagar</span>
                </button>
              </div>
              
              <!-- Botón Reenviar comprobante móvil: para cuotas pagadas -->
              <div v-else-if="cuota.estado === 'pagada'" class="sm:hidden mt-2" @click.stop>
                <button 
                  @click="reenviarComprobante(cuota)"
                  class="w-full px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon class="w-5 h-5" />
                  <span>Reenviar Comprobante</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vista Excel (Tabla) -->
      <div v-else class="card overflow-x-auto shadow-xl">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gradient-to-r from-natillera-50 via-emerald-50 to-teal-50 border-b-2 border-natillera-200">
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Socio</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Descripción</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Periodicidad</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-natillera-700 uppercase tracking-wider">Valor Cuota</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-natillera-700 uppercase tracking-wider">Valor Pagado</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Fecha Límite</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-natillera-700 uppercase tracking-wider">Estado</th>
              <th class="px-4 py-3 text-center text-xs font-bold text-natillera-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="cuota in cuotasFiltradas" 
              :key="cuota.id"
              class="hover:bg-natillera-50/50 transition-colors border-b border-gray-100"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-800">
                {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ cuota.descripcion || 'Cuota' }}
              </td>
              <td class="px-4 py-3">
                <span 
                  v-if="cuota.quincena" 
                  class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
                >
                  Q{{ cuota.quincena }}
                </span>
                <span 
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-1 bg-natillera-100 text-natillera-700 text-xs font-semibold rounded-full"
                >
                  Mensual
                </span>
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-right" :class="cuota.estado === 'mora' ? 'text-red-600' : 'text-gray-800'">
                <!-- Estado mora con multa -->
                <template v-if="cuota.estado === 'mora'">
                  <div class="space-y-0.5">
                    <div>${{ formatMoney(getTotalAPagar(cuota)) }}</div>
                    <div class="text-xs text-gray-500 font-normal">Cuota: ${{ formatMoney(cuota.valor_cuota) }}</div>
                    <div v-if="getSancionCuota(cuota) > 0" class="text-xs text-red-500 font-semibold">+ Multa: ${{ formatMoney(getSancionCuota(cuota)) }}</div>
                  </div>
                </template>
                <!-- Estado parcial -->
                <template v-else-if="cuota.estado === 'parcial'">
                  <div class="space-y-0.5">
                    <div>${{ formatMoney(cuota.valor_cuota - (cuota.valor_pagado || 0)) }}</div>
                    <div class="text-xs text-gray-500 font-normal">Inicial: ${{ formatMoney(cuota.valor_cuota) }}</div>
                  </div>
                </template>
                <!-- Estado normal -->
                <div v-else>
                  ${{ formatMoney(cuota.valor_cuota) }}
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-right" :class="cuota.valor_pagado > 0 ? 'text-green-600 font-medium' : 'text-gray-400'">
                ${{ formatMoney(cuota.valor_pagado || 0) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ formatDate(cuota.fecha_limite) }}
              </td>
              <td class="px-4 py-3 text-center">
                <span 
                  :class="[
                    'badge',
                    cuota.estado === 'pagada' ? 'badge-success' : 
                    cuota.estado === 'mora' ? 'badge-danger' : 
                    cuota.estado === 'parcial' ? 'bg-blue-100 text-blue-800' : 
                    cuota.estado === 'programada' ? 'bg-gray-100 text-gray-700' : 
                    'bg-orange-100 text-orange-800'
                  ]"
                >
                  {{ cuota.estado === 'programada' ? 'Programada' : cuota.estado }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    v-if="cuota.estado === 'parcial' || (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota)))"
                    @click="abrirModalEditar(cuota)"
                    class="px-2 py-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    title="Editar cuota"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button 
                    v-if="cuota.estado !== 'pagada'"
                    @click="abrirModalPago(cuota)"
                    class="px-3 py-1.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    Pagar
                  </button>
                  <button 
                    v-else-if="cuota.estado === 'pagada' || (cuota.valor_pagado > 0 && cuota.valor_pagado < (cuota.valor_cuota + getSancionCuota(cuota)))"
                    @click="reenviarComprobante(cuota)"
                    class="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-1"
                    title="Reenviar comprobante"
                  >
                    <ArrowPathIcon class="w-3 h-3" />
                    Reenviar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-gradient-to-r from-natillera-100 via-emerald-100 to-teal-100 border-t-2 border-natillera-300 font-bold">
              <td class="px-4 py-4 text-sm text-natillera-800" colspan="3">
                <div class="flex items-center gap-2">
                  <CurrencyDollarIcon class="w-5 h-5 text-natillera-600" />
                  <span>TOTALES ({{ cuotasFiltradas.length }} cuota{{ cuotasFiltradas.length !== 1 ? 's' : '' }})</span>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-natillera-800 text-right font-bold">
                ${{ formatMoney(totalesExcel.totalValorCuota) }}
              </td>
              <td class="px-4 py-4 text-sm text-green-700 text-right font-bold">
                ${{ formatMoney(totalesExcel.totalValorPagado) }}
              </td>
              <td class="px-4 py-4 text-sm text-gray-600" colspan="2">
                —
              </td>
              <td class="px-4 py-4 text-sm text-orange-700 text-right font-bold">
                Pendiente: ${{ formatMoney(totalesExcel.totalPendiente) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal Confirmar Borrar Cuotas -->
    <div v-if="modalConfirmarBorrar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalConfirmarBorrar = false"></div>
      <div class="card relative max-w-md w-full">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <ExclamationCircleIcon class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 class="text-xl font-display font-bold text-gray-800">
              Confirmar Eliminación
            </h3>
            <p class="text-sm text-gray-500">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p class="text-gray-700 font-medium">
            ¿Estás seguro de que deseas borrar las cuotas de 
            <span class="font-bold text-red-600">
              {{ todosMeses.find(m => m.value === mesSeleccionado)?.label }} {{ anioMesSeleccionado }}
            </span>?
          </p>
          <p class="text-sm text-gray-600 mt-2">
            Se eliminarán <strong>{{ cuotasPendientesMes.length }}</strong> cuota(s) pendiente(s) de forma permanente.
          </p>
          <p class="text-xs text-amber-700 mt-2 font-medium">
            ⚠️ Solo se eliminarán las cuotas pendientes. Las cuotas pagadas o parciales no se pueden eliminar.
          </p>
        </div>

        <div class="flex gap-3">
          <button 
            @click="modalConfirmarBorrar = false"
            class="btn-secondary flex-1"
            :disabled="cuotasStore.loading"
          >
            Cancelar
          </button>
          <button 
            @click="borrarCuotasMes"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="cuotasStore.loading"
          >
            {{ cuotasStore.loading ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalle de Cuota -->
    <div v-if="modalDetalleCuota" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalleCuota = false"></div>
      <div class="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-4">
                <img 
                  v-if="cuotaDetalle"
                  :src="getAvatarUrl(cuotaDetalle.socio_natillera?.socio?.nombre || cuotaDetalle.socio_natillera?.id, cuotaDetalle.socio_natillera?.socio?.avatar_seed, cuotaDetalle.socio_natillera?.socio?.avatar_style)" 
                  :alt="cuotaDetalle.socio_natillera?.socio?.nombre"
                  class="w-16 h-16 rounded-2xl border-2 border-white/30 shadow-lg object-cover"
                />
                <div>
                  <h3 class="text-2xl font-display font-bold">
                    {{ cuotaDetalle?.socio_natillera?.socio?.nombre || 'Socio' }}
                  </h3>
                  <p class="text-white/90 text-sm">Detalle de la cuota</p>
                </div>
              </div>
              <button 
                @click="modalDetalleCuota = false"
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-5" v-if="cuotaDetalle">
          <!-- Estado de la cuota -->
          <div 
            :class="[
              'relative p-5 rounded-xl border-2 shadow-sm',
              cuotaDetalle.estado === 'pagada' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 
              cuotaDetalle.estado === 'mora' ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : 
              cuotaDetalle.estado === 'parcial' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' : 
              cuotaDetalle.estado === 'programada' ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200' : 
              'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
            ]"
          >
            <div class="flex items-center gap-3">
              <div 
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
                  cuotaDetalle.estado === 'pagada' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 
                  cuotaDetalle.estado === 'mora' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                  cuotaDetalle.estado === 'parcial' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 
                  cuotaDetalle.estado === 'programada' ? 'bg-gradient-to-br from-gray-400 to-slate-500' : 
                  'bg-gradient-to-br from-orange-500 to-amber-600'
                ]"
              >
                <component 
                  :is="cuotaDetalle.estado === 'pagada' ? CheckCircleIcon : 
                       cuotaDetalle.estado === 'mora' ? ExclamationCircleIcon : 
                       cuotaDetalle.estado === 'programada' ? CalendarIcon : ClockIcon"
                  class="w-6 h-6 text-white"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium mb-1">Estado</p>
                <p 
                  :class="[
                    'text-lg font-bold',
                    cuotaDetalle.estado === 'pagada' ? 'text-green-700' : 
                    cuotaDetalle.estado === 'mora' ? 'text-red-700' : 
                    cuotaDetalle.estado === 'parcial' ? 'text-blue-700' : 
                    cuotaDetalle.estado === 'programada' ? 'text-gray-700' : 'text-orange-700'
                  ]"
                >
                  {{ cuotaDetalle.estado === 'programada' ? 'Programada' : cuotaDetalle.estado === 'parcial' ? 'Pago Parcial' : cuotaDetalle.estado === 'pagada' ? 'Pagada' : cuotaDetalle.estado === 'mora' ? 'En Mora' : 'Pendiente' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Información financiera -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-natillera-50 to-emerald-50 p-5 rounded-xl border border-natillera-200 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-2">Valor de la Cuota</p>
              <p class="text-2xl font-bold text-natillera-700">${{ formatMoney(cuotaDetalle.valor_cuota) }}</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-2">Valor Pagado</p>
              <p class="text-2xl font-bold text-green-700">${{ formatMoney(cuotaDetalle.valor_pagado || 0) }}</p>
            </div>
            <div :class="[
              'p-5 rounded-xl border shadow-sm',
              (cuotaDetalle.estado === 'mora' || (getSancionCuotaDetalle(cuotaDetalle) > 0 && cuotaDetalle?.valor_pagado && cuotaDetalle.valor_pagado >= (cuotaDetalle?.valor_cuota || 0)))
                ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' 
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
            ]">
              <template v-if="getSancionCuotaDetalle(cuotaDetalle) > 0 && cuotaDetalle?.valor_pagado && cuotaDetalle.valor_pagado >= (cuotaDetalle?.valor_cuota || 0)">
                <p class="text-xs text-gray-500 font-medium mb-2">
                  Sanción
                </p>
                <p class="text-2xl font-bold text-red-700">
                  ${{ formatMoney(getSancionCuotaDetalle(cuotaDetalle)) }}
                </p>
              </template>
              <template v-else>
                <p class="text-xs text-gray-500 font-medium mb-2">
                  {{ cuotaDetalle.estado === 'mora' ? 'Total a Pagar' : 'Valor Pendiente' }}
                </p>
                <p :class="[
                  'text-2xl font-bold',
                  cuotaDetalle.estado === 'mora' ? 'text-red-700' : 'text-amber-700'
                ]">
                  ${{ formatMoney(Math.max(0, getTotalAPagar(cuotaDetalle))) }}
                </p>
                <p v-if="getSancionCuotaDetalle(cuotaDetalle) > 0" class="text-xs text-red-600 font-semibold mt-1">
                  Incluye multa de ${{ formatMoney(getSancionCuotaDetalle(cuotaDetalle)) }}
                </p>
              </template>
            </div>
          </div>
          
          <!-- Detalle de multa si está en mora -->
          <div v-if="cuotaDetalle.estado === 'mora' && getSancionCuota(cuotaDetalle) > 0" class="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border border-red-200 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ExclamationCircleIcon class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p class="font-bold text-red-800">Sanción por Mora</p>
                <p class="text-xs text-red-600">Calculada en tiempo real según configuración</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Valor de la multa</p>
                <p class="text-lg font-bold text-red-700">${{ formatMoney(getSancionCuota(cuotaDetalle)) }}</p>
                <div v-if="getDiasMora(cuotaDetalle) > 0" class="mt-3">
                  <p class="text-xs text-gray-500 mb-1">Días en mora</p>
                  <p class="text-lg font-bold text-red-700">{{ getDiasMora(cuotaDetalle) }} {{ getDiasMora(cuotaDetalle) === 1 ? 'día' : 'días' }}</p>
                </div>
              </div>
              <div v-if="cuotaDetalle.fecha_mora || cuotaDetalle.fecha_limite">
                <p class="text-xs text-gray-500 mb-1">En mora desde</p>
                <p class="text-lg font-bold text-gray-700">{{ formatDate(cuotaDetalle.fecha_mora || cuotaDetalle.fecha_limite) }}</p>
              </div>
            </div>
          </div>

          <!-- Información de fechas -->
          <div :class="[
            'grid gap-4',
            cuotaDetalle.estado === 'pagada' && cuotaDetalle.fecha_pago ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
          ]">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <CalendarIcon class="w-5 h-5 text-gray-500" />
                <p class="text-xs text-gray-500 font-medium">Fecha de Vencimiento</p>
              </div>
              <p class="text-lg font-bold text-gray-800">{{ formatDate(cuotaDetalle.fecha_vencimiento) || 'N/A' }}</p>
              <p class="text-xs text-gray-500 mt-1">Con días de gracia</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <ExclamationCircleIcon class="w-5 h-5 text-purple-500" />
                <p class="text-xs text-gray-500 font-medium">Fecha Límite</p>
              </div>
              <p class="text-lg font-bold text-gray-800">{{ formatDate(cuotaDetalle.fecha_limite) }}</p>
              <p class="text-xs text-gray-500 mt-1">Sin días de gracia</p>
            </div>
            <!-- Fecha de Pago (solo si está pagada) -->
            <div 
              v-if="cuotaDetalle.estado === 'pagada' && cuotaDetalle.fecha_pago"
              class="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm"
            >
              <div class="flex items-center gap-3 mb-2">
                <CheckCircleIcon class="w-5 h-5 text-green-600" />
                <p class="text-xs text-gray-500 font-medium">Fecha de Pago</p>
              </div>
              <p class="text-lg font-bold text-green-700">{{ formatDate(cuotaDetalle.fecha_pago) }}</p>
              <p class="text-xs text-green-600 mt-1 font-medium">Cuota pagada</p>
            </div>
          </div>

          <!-- Alerta de ajustes si existe -->
          <div v-if="tieneAjuste(cuotaDetalle)" class="p-3 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-sm">
            <button
              @click.stop="abrirModalHistorialAjustes(cuotaDetalle)"
              class="group w-full flex items-center justify-between gap-3 cursor-pointer"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <InformationCircleIcon class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-blue-800 group-hover:text-blue-900 transition-colors">
                    Esta cuota tiene ajustes de valor
                  </p>
                  <p class="text-xs text-blue-600 mt-0.5">
                    Haz clic para ver el historial completo de cambios
                  </p>
                </div>
              </div>
              <ChevronRightIcon class="w-5 h-5 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          </div>

          <!-- Periodicidad y descripción -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{{ cuotaDetalle.quincena ? '🗓️' : '📅' }}</span>
                <p class="text-xs text-gray-500 font-medium">Periodicidad</p>
              </div>
              <p class="text-lg font-bold text-gray-800">
                {{ cuotaDetalle.quincena ? `Quincenal - Q${cuotaDetalle.quincena}` : 'Mensual' }}
              </p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200 shadow-sm">
              <div class="flex items-center gap-3 mb-2">
                <DocumentTextIcon class="w-5 h-5 text-blue-500" />
                <p class="text-xs text-gray-500 font-medium">Descripción</p>
              </div>
              <p class="text-lg font-semibold text-gray-800">{{ cuotaDetalle.descripcion && !tieneAjuste(cuotaDetalle) ? cuotaDetalle.descripcion : 'Cuota' }}</p>
            </div>
          </div>

          <!-- Información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <p class="text-xs text-gray-500 font-medium mb-3">Información del Socio</p>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <UserIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Nombre</p>
                  <p class="font-semibold text-gray-800">{{ cuotaDetalle.socio_natillera?.socio?.nombre || 'N/A' }}</p>
                </div>
              </div>
              <div v-if="cuotaDetalle.socio_natillera?.socio?.telefono" class="flex items-center gap-3">
                <PhoneIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Teléfono</p>
                  <p class="font-semibold text-gray-800">{{ cuotaDetalle.socio_natillera?.socio?.telefono }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial de Pagos -->
          <div v-if="(cuotaDetalle.valor_pagado > 0 || cuotaDetalle.codigo_comprobante) && (historialPagosCuota.length > 0 || cargandoHistorialPagos)" class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-xl border border-indigo-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <ClockIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-sm font-bold text-gray-800">Historial de Pagos</p>
                <p class="text-xs text-gray-600">Registro completo de pagos realizados</p>
              </div>
            </div>

            <!-- Loading state -->
            <div v-if="cargandoHistorialPagos" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>

            <!-- Lista de pagos -->
            <div v-else-if="historialPagosCuota.length > 0" class="space-y-3">
              <div 
                v-for="(pago, index) in historialPagosCuota" 
                :key="index"
                :class="[
                  'p-4 rounded-lg border-2 transition-all',
                  pago.es_actual 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md' 
                    : pago.es_modificacion
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-md'
                    : 'bg-white border-indigo-200 shadow-sm hover:shadow-md'
                ]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          pago.es_actual 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : pago.es_modificacion
                            ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        ]"
                      >
                        <CheckCircleIcon class="w-4 h-4 text-white" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p 
                          :class="[
                            'text-sm font-bold',
                            pago.es_actual ? 'text-green-700' : pago.es_modificacion ? 'text-orange-700' : 'text-gray-800'
                          ]"
                        >
                          {{ pago.es_actual ? 'Pago Actual' : pago.es_modificacion ? 'Pago Modificado' : 'Pago Anterior' }}
                        </p>
                        <p v-if="pago.codigo_comprobante" class="text-xs font-mono text-gray-600 mt-0.5">
                          Código: {{ pago.codigo_comprobante }}
                        </p>
                        <p v-if="pago.es_modificacion && pago.codigo_nuevo" class="text-xs text-orange-600 mt-1 font-semibold">
                          → Modificado a código: {{ pago.codigo_nuevo }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Si es una modificación, mostrar antes y después -->
                    <div v-if="pago.es_modificacion" class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p class="text-xs font-semibold text-orange-800 mb-2">Detalle de la Modificación</p>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <p class="text-xs text-gray-600 mb-1">Valor Anterior</p>
                          <p class="text-sm font-bold text-gray-700">
                            ${{ formatMoney(pago.valor_pagado) }}
                          </p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-600 mb-1">Valor Nuevo</p>
                          <p class="text-sm font-bold text-orange-700">
                            ${{ formatMoney(pago.valor_nuevo) }}
                          </p>
                        </div>
                      </div>
                      <div class="mt-2 pt-2 border-t border-orange-200">
                        <p class="text-xs text-gray-500 mb-1">Fecha de Modificación</p>
                        <p class="text-xs font-semibold text-gray-700">
                          {{ formatDate(pago.fecha_actualizacion) }} {{ formatTime(pago.fecha_actualizacion) }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Si no es modificación, mostrar información normal -->
                    <div v-else class="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Valor Pagado</p>
                        <p 
                          :class="[
                            'text-lg font-bold',
                            pago.es_actual ? 'text-green-700' : 'text-gray-700'
                          ]"
                        >
                          ${{ formatMoney(pago.valor_pagado) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Fecha</p>
                        <p class="text-sm font-semibold text-gray-700">
                          {{ formatDate(pago.fecha_actualizacion) }}
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">
                          {{ formatTime(pago.fecha_actualizacion) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    v-if="pago.codigo_comprobante"
                    @click="reenviarComprobantePorCodigo(pago.codigo_comprobante, pago.valor_pagado)"
                    class="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0"
                    title="Ver/Reenviar comprobante"
                  >
                    <ArrowPathIcon class="w-4 h-4" />
                    Ver
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-6">
              <p class="text-sm text-gray-500">No hay historial de pagos disponible</p>
            </div>
          </div>
        </div>

        <!-- Footer con acciones -->
        <div class="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button 
            @click="modalDetalleCuota = false"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
          <button 
            v-if="cuotaDetalle?.estado !== 'pagada'"
            @click="modalDetalleCuota = false; abrirModalPago(cuotaDetalle)"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 hover:shadow-xl"
          >
            Registrar Pago
          </button>
          <button 
            v-if="cuotaDetalle?.estado === 'pagada' || (cuotaDetalle?.valor_pagado > 0 && cuotaDetalle?.valor_pagado < cuotaDetalle?.valor_cuota)"
            @click="reenviarComprobante(cuotaDetalle)"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-xl"
          >
            Reenviar Comprobante
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Generar Cuotas -->
    <div v-if="modalGenerarCuotas" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalGenerarCuotas = false"></div>
      <div class="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 w-full">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <PlusIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  Generar Cuotas del Mes
                </h3>
                <p class="text-white/90 text-sm mt-0.5">
                  Define las fechas límite de pago para cada quincena
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div ref="scrollContainerGenerarCuotas" class="overflow-y-auto flex-1 p-6">
          <form @submit.prevent="handleGenerarCuotas" class="space-y-6">
            <!-- Tipo de generación -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Generar cuotas para *</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="formCuotas.tipoGeneracion = 'todos'; formCuotas.socioSeleccionado = null"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all',
                    formCuotas.tipoGeneracion === 'todos'
                      ? 'bg-natillera-500 text-white border-natillera-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-natillera-400'
                  ]"
                >
                  <div class="font-semibold">Todos los socios</div>
                  <div :class="['text-xs mt-1', formCuotas.tipoGeneracion === 'todos' ? 'text-white/90' : 'text-gray-500']">
                    Todos los activos
                  </div>
                </button>
                <button
                  type="button"
                  @click="formCuotas.tipoGeneracion = 'unSocio'"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all',
                    formCuotas.tipoGeneracion === 'unSocio'
                      ? 'bg-natillera-500 text-white border-natillera-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-natillera-400'
                  ]"
                >
                  <div class="font-semibold">Un solo socio</div>
                  <div :class="['text-xs mt-1', formCuotas.tipoGeneracion === 'unSocio' ? 'text-white/90' : 'text-gray-500']">
                    Socio específico
                  </div>
                </button>
              </div>
            </div>

            <!-- Selector de socio (solo si se selecciona "Un solo socio") -->
            <div v-if="formCuotas.tipoGeneracion === 'unSocio'" class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700">Seleccionar socio *</label>
              
              <!-- Barra de búsqueda mejorada -->
              <div class="relative">
                <MagnifyingGlassIcon class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  v-model="busquedaSocioCuotas"
                  type="text"
                  placeholder="Buscar socio por nombre..."
                  class="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-natillera-500/50 focus:border-natillera-500 transition-all shadow-sm hover:shadow-md"
                />
                <button
                  v-if="busquedaSocioCuotas.trim()"
                  @click="busquedaSocioCuotas = ''"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
              
              <!-- Lista de socios mejorada -->
              <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div class="max-h-72 overflow-y-auto p-2 space-y-2">
                  <button 
                    v-for="socio in sociosFiltradosCuotas" 
                    :key="socio.id"
                    type="button"
                    @click="seleccionarSocio(socio.id)"
                    :class="[
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group',
                      formCuotas.socioSeleccionado === socio.id
                        ? 'bg-gradient-to-r from-natillera-50 to-emerald-50 border-2 border-natillera-500 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-natillera-200'
                    ]"
                  >
                    <div class="relative flex-shrink-0">
                      <img 
                        :src="getAvatarUrl(socio.socio?.nombre || socio.id, socio.socio?.avatar_seed, socio.socio?.avatar_style)" 
                        :alt="socio.socio?.nombre"
                        class="w-12 h-12 rounded-xl border-2 transition-all"
                        :class="formCuotas.socioSeleccionado === socio.id ? 'border-natillera-500 shadow-md' : 'border-gray-200 group-hover:border-natillera-300'"
                      />
                      <div 
                        v-if="formCuotas.socioSeleccionado === socio.id"
                        class="absolute -bottom-1 -right-1 w-5 h-5 bg-natillera-500 rounded-full border-2 border-white flex items-center justify-center shadow-md"
                      >
                        <CheckIcon class="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="font-semibold text-gray-900 truncate">{{ socio.socio?.nombre }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs font-medium text-gray-600">
                          ${{ formatMoney(socio.valor_cuota_individual) }}
                        </span>
                        <span class="text-gray-300">•</span>
                        <span 
                          :class="[
                            'text-xs font-semibold px-2 py-0.5 rounded-lg',
                            socio.periodicidad === 'quincenal' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          ]"
                        >
                          {{ socio.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                        </span>
                      </div>
                    </div>
                  </button>
                  
                  <!-- Mensaje cuando no hay resultados -->
                  <div v-if="sociosFiltradosCuotas.length === 0" class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <MagnifyingGlassIcon class="w-8 h-8 text-gray-400" />
                    </div>
                    <p class="text-gray-500 font-medium">No se encontraron socios</p>
                    <p class="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mes -->
            <div class="relative" ref="dropdownMesRef">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Mes a generar *</label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-500 z-10">
                  <CalendarIcon class="w-5 h-5" />
                </div>
                <button
                  type="button"
                  @click="dropdownMesAbierto = !dropdownMesAbierto"
                  class="w-full pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-natillera-500/50 focus:border-natillera-500 transition-all shadow-sm hover:shadow-md cursor-pointer text-left flex items-center justify-between"
                >
                  <span class="flex items-center gap-2">
                    <span v-if="formCuotas.mes">{{ getMesEmoji(formCuotas.mes) }}</span>
                    <span>{{ mesesNatillera.find(m => m.value === formCuotas.mes)?.label || 'Seleccionar mes' }}</span>
                  </span>
                  <svg 
                    class="w-5 h-5 text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-180': dropdownMesAbierto }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Dropdown de opciones -->
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 scale-95 -translate-y-2"
                  enter-to-class="opacity-100 scale-100 translate-y-0"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100 scale-100 translate-y-0"
                  leave-to-class="opacity-0 scale-95 -translate-y-2"
                >
                  <div
                    v-if="dropdownMesAbierto"
                    class="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div class="max-h-64 overflow-y-auto">
                      <button
                        v-for="mes in mesesNatillera"
                        :key="mes.value"
                        type="button"
                        @click="formCuotas.mes = mes.value; dropdownMesAbierto = false"
                        :class="[
                          'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                          formCuotas.mes === mes.value
                            ? 'bg-natillera-50 text-natillera-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        ]"
                      >
                        <span class="text-xl">{{ getMesEmoji(mes.value) }}</span>
                        <span class="flex-1">{{ mes.label }}</span>
                        <CheckIcon 
                          v-if="formCuotas.mes === mes.value"
                          class="w-5 h-5 text-natillera-600"
                        />
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Fechas de pago -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">Fechas Límite de Pago</label>
                <p v-if="periodicidadNatillera === 'mensual'" class="text-xs text-gray-500 mb-3">
                  Esta natillera está configurada como mensual
                </p>
                <p v-else class="text-xs text-gray-500 mb-3">
                  La 2da quincena aplica también para socios mensuales
                </p>
              </div>
              
              <div class="space-y-3">
                <!-- 1ra Quincena -->
                <div v-if="periodicidadNatillera === 'quincenal'" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="w-7 h-7 bg-purple-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                    <span class="font-medium text-gray-800">1ra Quincena</span>
                  </div>
                  <DatePicker 
                    v-model="formCuotas.fecha_quincena1"
                    placeholder="Seleccionar fecha"
                    input-class="bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                  />
                </div>

                <!-- 2da Quincena / Fecha Mensual -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex items-center gap-2 mb-3">
                    <span v-if="periodicidadNatillera === 'mensual'" class="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs">📅</span>
                    <span v-else class="w-7 h-7 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                    <span class="font-medium text-gray-800">
                      {{ periodicidadNatillera === 'mensual' ? 'Fecha Mensual' : '2da Quincena' }}
                    </span>
                  </div>
                  <DatePicker 
                    v-model="formCuotas.fecha_quincena2"
                    placeholder="Seleccionar fecha"
                    input-class="bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                  />
                </div>
              </div>
            </div>

            <!-- Resumen -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center gap-2 mb-3">
                <DocumentTextIcon class="w-5 h-5 text-natillera-600" />
                <p class="text-sm font-semibold text-gray-800">Resumen</p>
              </div>
              <div class="space-y-1.5 text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
              <template v-if="formCuotas.tipoGeneracion === 'todos'">
                <p>• <strong>{{ conteoSociosMensuales }}</strong> socio(s) mensual(es) → 1 cuota c/u</p>
                <p>• <strong>{{ conteoSociosQuincenales }}</strong> socio(s) quincenal(es) → 2 cuotas c/u</p>
                <p class="pt-1 border-t border-gray-200 mt-2 font-semibold text-gray-800">
                  Total: {{ conteoSociosMensuales + (conteoSociosQuincenales * 2) }} cuotas para {{ mesesNatillera.find(m => m.value === formCuotas.mes)?.label }}
                </p>
              </template>
              <template v-else-if="formCuotas.tipoGeneracion === 'unSocio' && formCuotas.socioSeleccionado">
                <template v-for="socio in sociosActivos" :key="socio.id">
                  <template v-if="socio.id === formCuotas.socioSeleccionado">
                    <p>• Socio: <strong>{{ socio.socio?.nombre }}</strong></p>
                    <p>• Periodicidad: <strong>{{ socio.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}</strong></p>
                    <p>• Valor cuota: <strong>${{ formatMoney(socio.valor_cuota_individual) }}</strong></p>
                    <p class="pt-1 border-t border-gray-200 mt-2 font-semibold text-gray-800">
                      Total: {{ socio.periodicidad === 'quincenal' ? '2' : '1' }} cuota(s) para {{ mesesNatillera.find(m => m.value === formCuotas.mes)?.label }}
                    </p>
                  </template>
                </template>
              </template>
                <template v-else>
                  <p class="text-gray-500 italic text-center py-2">Selecciona un socio para ver el resumen</p>
                </template>
              </div>
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
              <button 
                type="button"
                @click="modalGenerarCuotas = false"
                class="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="flex-1 px-4 py-3 bg-natillera-500 hover:bg-natillera-600 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="cuotasStore.loading"
              >
                {{ cuotasStore.loading ? 'Generando...' : 'Generar Cuotas' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Registrar Pago -->
    <div v-if="modalPago" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalPago = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-2xl font-display font-bold">
                Registrar Pago
              </h3>
            </div>
            <p class="text-white/90 text-sm">
              <span v-if="cuotaSeleccionada?.valor_pagado && cuotaSeleccionada.valor_pagado > 0">
                Agrega el saldo pendiente al pago parcial
              </span>
              <span v-else>
                Registra el pago de la cuota del socio
              </span>
            </p>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-6">
          <!-- Card de información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <!-- Alerta de ajustes si existe -->
            <div v-if="tieneAjuste(cuotaSeleccionada)" class="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-sm">
              <button
                @click.stop="abrirModalHistorialAjustes(cuotaSeleccionada)"
                class="group w-full flex items-center justify-between gap-3 cursor-pointer"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <InformationCircleIcon class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-blue-800 group-hover:text-blue-900 transition-colors">
                      Esta cuota tiene ajustes de valor
                    </p>
                    <p class="text-xs text-blue-600 mt-0.5">
                      Haz clic para ver el historial completo de cambios
                    </p>
                  </div>
                </div>
                <ChevronRightIcon class="w-5 h-5 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            </div>
            
            <div class="flex items-center gap-3 mb-4">
              <img 
                :src="getAvatarUrl(cuotaSeleccionada?.socio_natillera?.socio?.nombre || cuotaSeleccionada?.socio_natillera?.id, cuotaSeleccionada?.socio_natillera?.socio?.avatar_seed, cuotaSeleccionada?.socio_natillera?.socio?.avatar_style)" 
                :alt="cuotaSeleccionada?.socio_natillera?.socio?.nombre"
                class="w-14 h-14 rounded-xl flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate">
                  {{ cuotaSeleccionada?.socio_natillera?.socio?.nombre || 'Socio' }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ cuotaSeleccionada?.descripcion && !tieneAjuste(cuotaSeleccionada) ? cuotaSeleccionada.descripcion : 'Cuota' }}
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div>
                <p class="text-xs text-gray-500 mb-1">Valor Cuota</p>
                <p class="font-bold text-gray-800 text-lg">
                  ${{ formatMoney(cuotaSeleccionada?.valor_cuota || 0) }}
                </p>
                <p v-if="getSancionCuotaDetalle(cuotaSeleccionada) > 0 && (!cuotaSeleccionada?.valor_pagado || cuotaSeleccionada.valor_pagado <= (cuotaSeleccionada?.valor_cuota || 0))" class="text-xs text-red-600 font-semibold">
                  + Multa: ${{ formatMoney(getSancionCuotaDetalle(cuotaSeleccionada)) }}
                </p>
              </div>
              <div v-if="cuotaSeleccionada?.valor_pagado && cuotaSeleccionada.valor_pagado > 0">
                <p class="text-xs text-gray-500 mb-1">Ya Pagado</p>
                <p class="font-bold text-green-600 text-lg">
                  ${{ formatMoney(cuotaSeleccionada.valor_pagado) }}
                </p>
              </div>
              <div>
                <template v-if="getSancionCuotaDetalle(cuotaSeleccionada) > 0 && cuotaSeleccionada?.valor_pagado && cuotaSeleccionada.valor_pagado >= (cuotaSeleccionada?.valor_cuota || 0)">
                  <p class="text-xs text-gray-500 mb-1">Sanción</p>
                  <p class="font-bold text-lg text-red-600">
                    ${{ formatMoney(getSancionCuotaDetalle(cuotaSeleccionada)) }}
                  </p>
                </template>
                <template v-else>
                  <p class="text-xs text-gray-500 mb-1">{{ cuotaSeleccionada?.estado === 'mora' ? 'Total Pendiente' : 'Pendiente' }}</p>
                  <p :class="['font-bold text-lg', cuotaSeleccionada?.estado === 'mora' ? 'text-red-600' : 'text-orange-600']">
                    ${{ formatMoney(Math.max(0, getTotalAPagar(cuotaSeleccionada))) }}
                  </p>
                </template>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleRegistrarPago" class="space-y-5">
            <!-- Campo de valor del pago -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span v-if="cuotaSeleccionada?.valor_pagado && cuotaSeleccionada.valor_pagado > 0">
                  Valor adicional a agregar <span class="text-red-500">*</span>
                </span>
                <span v-else>
                  Valor del pago <span class="text-red-500">*</span>
                </span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-500 z-10">
                  <CurrencyDollarIcon class="w-5 h-5" />
                </div>
                <input 
                  ref="inputValorPagoRef"
                  :value="formatearValorPago(formPago.valor)"
                  @input="handleValorPagoInput($event)"
                  @focus="seleccionarValorPago"
                  @click="seleccionarValorPago"
                  type="text"
                  inputmode="decimal"
                  class="w-full pl-12 pr-4 py-3.5 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-natillera-500 focus:ring-2 focus:ring-natillera-200 transition-all outline-none"
                  :placeholder="`Máx: ${formatMoney(Math.max(0, getTotalAPagar(cuotaSeleccionada)))}`"
                  required
                />
              </div>
              <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>Máximo disponible:</span>
                <span :class="['font-semibold', cuotaSeleccionada?.estado === 'mora' ? 'text-red-600' : 'text-orange-600']">
                  ${{ formatMoney(Math.max(0, getTotalAPagar(cuotaSeleccionada))) }}
                </span>
                <span v-if="getSancionCuotaDetalle(cuotaSeleccionada) > 0 && (!cuotaSeleccionada?.valor_pagado || cuotaSeleccionada.valor_pagado < (cuotaSeleccionada?.valor_cuota || 0))" class="text-red-500 text-xs">(incluye multa)</span>
              </p>
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
              <button 
                type="button"
                @click="modalPago = false"
                class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all border border-gray-200"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="cuotasStore.loading || !formPago.valor || formPago.valor <= 0"
              >
                {{ cuotasStore.loading ? 'Registrando...' : 'Registrar Pago' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Historial de Ajustes -->
    <div v-if="modalHistorialAjustes" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalHistorialAjustes = false"></div>
      <div class="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <InformationCircleIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-2xl font-display font-bold">
                    Historial de Ajustes
                  </h3>
                  <p class="text-white/90 text-sm">
                    Cambios realizados en el valor de la cuota
                  </p>
                </div>
              </div>
              <button
                @click="modalHistorialAjustes = false"
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-colors"
              >
                <XMarkIcon class="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div class="flex items-center gap-3">
              <img 
                v-if="cuotaSeleccionada?.socio_natillera?.socio"
                :src="getAvatarUrl(cuotaSeleccionada.socio_natillera.socio.nombre, cuotaSeleccionada.socio_natillera.socio.avatar_seed, cuotaSeleccionada.socio_natillera.socio.avatar_style)" 
                :alt="cuotaSeleccionada.socio_natillera.socio.nombre"
                class="w-12 h-12 rounded-xl flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
              />
              <div class="flex-1">
                <p class="font-semibold text-gray-800">
                  {{ cuotaSeleccionada?.socio_natillera?.socio?.nombre || 'Socio' }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getMesLabel(cuotaSeleccionada?.mes) }} {{ cuotaSeleccionada?.anio }}
                  <span v-if="cuotaSeleccionada?.quincena" class="text-purple-600">- Q{{ cuotaSeleccionada.quincena }}</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 mb-1">Valor Actual</p>
                <p class="text-lg font-bold text-natillera-700">
                  ${{ formatMoney(cuotaSeleccionada?.valor_cuota || 0) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Lista de ajustes -->
          <div class="space-y-4">
            <div
              v-for="(ajuste, index) in obtenerAjustesFormateados(cuotaSeleccionada)"
              :key="index"
              class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all"
            >
              <div class="flex items-start gap-4">
                <!-- Icono y número -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <span class="text-white font-bold text-lg">{{ index + 1 }}</span>
                  </div>
                </div>
                
                <!-- Contenido del ajuste -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <CalendarIcon class="w-4 h-4 text-blue-600" />
                    <p class="text-xs font-semibold text-blue-700">
                      {{ ajuste.fecha }}
                    </p>
                  </div>
                  
                  <div class="space-y-3">
                    <!-- Cambio de valor -->
                    <div class="bg-white/60 rounded-lg p-3 border border-blue-100">
                      <p class="text-xs text-gray-600 mb-2 font-medium">Cambio de Valor</p>
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
                          ${{ formatMoney(ajuste.valorAnterior) }}
                        </span>
                        <ArrowRightIcon class="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span class="px-3 py-1.5 bg-blue-100 rounded-lg text-sm font-semibold text-blue-700">
                          ${{ formatMoney(ajuste.valorNuevo) }}
                        </span>
                        <span class="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          :class="ajuste.diferencia >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                          {{ ajuste.diferencia >= 0 ? '+' : '' }}${{ formatMoney(Math.abs(ajuste.diferencia)) }}
                        </span>
                      </div>
                    </div>

                    <!-- Estado del pago -->
                    <div v-if="ajuste.valorPagado !== null || ajuste.pendiente !== null" class="grid grid-cols-2 gap-2">
                      <div v-if="ajuste.valorPagado !== null" class="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p class="text-xs text-gray-600 mb-1 font-medium">Pagado</p>
                        <p class="text-sm font-bold text-green-700">
                          ${{ formatMoney(ajuste.valorPagado) }}
                        </p>
                      </div>
                      <div v-if="ajuste.pendiente !== null" class="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <p class="text-xs text-gray-600 mb-1 font-medium">Pendiente</p>
                        <p class="text-sm font-bold text-orange-700">
                          ${{ formatMoney(ajuste.pendiente) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensaje si no hay ajustes -->
            <div v-if="!tieneAjuste(cuotaSeleccionada)" class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <InformationCircleIcon class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-gray-500 font-medium">No hay ajustes registrados</p>
              <p class="text-sm text-gray-400 mt-1">Esta cuota no ha tenido cambios en su valor</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <button
            @click="modalHistorialAjustes = false"
            class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación de Pago con Comprobante Visual -->
    <div v-if="modalConfirmacion" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarConfirmacion"></div>
      <div class="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-emerald-500 via-natillera-500 to-teal-600 p-6 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 w-full">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  ¡Pago Registrado!
                </h3>
                <p class="text-white/90 text-sm mt-0.5">
                  Comprobante generado exitosamente
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div 
          ref="scrollComprobanteRef"
          @scroll="verificarScrollComprobante"
          class="overflow-y-auto flex-1 p-6 relative"
        >
          <!-- Indicador de scroll animado -->
          <Transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-300 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div 
              v-if="mostrarIndicadorScroll"
              class="absolute bottom-0 left-0 right-0 flex justify-center pb-3 pointer-events-none z-10"
              style="background: linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 60%, transparent 100%); padding-top: 20px;"
            >
              <div class="flex flex-col items-center gap-2">
                <div class="flex flex-col items-center gap-1.5 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-emerald-100" style="animation: pulse-gentle 4s ease-in-out infinite;">
                  <span class="text-xs text-emerald-600 font-semibold">Desliza para ver más</span>
                  <ChevronDownIcon class="w-4 h-4 text-emerald-500" style="animation: bounce-subtle 1.5s ease-in-out infinite;" />
                </div>
              </div>
            </div>
          </Transition>

          <!-- Comprobante Visual (esto se convierte en imagen) -->
          <div 
            id="comprobante-pago"
            ref="comprobanteRef"
            class="rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
          >
          <!-- Header con gradiente mejorado -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #0d9488 100%); padding: 20px 18px; color: white;">
            <!-- Header del comprobante -->
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 18px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">
                  <span style="font-size: 22px;">✓</span>
                </div>
                <div>
                  <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                    {{ pagoRegistrado?.esParcial ? 'Comprobante de Pago Parcial' : 'Comprobante de Pago' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Valor grande destacado -->
            <div style="text-align: center; padding: 16px 0 14px 0; border-top: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15);">
              <p style="color: rgba(255,255,255,0.8); font-size: 10px; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                {{ pagoRegistrado?.esParcial ? 'Valor Pagado' : 'Valor Pagado' }}
              </p>
              <p style="font-size: 42px; font-weight: 800; margin: 0; letter-spacing: -3px; line-height: 1;">
                ${{ formatMoney(pagoRegistrado?.valor) }}
              </p>
            </div>

            <!-- Información de pago parcial anterior (si se completó un pago parcial) -->
            <div v-if="pagoRegistrado?.teniaPagoParcial" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.2) 100%); border-radius: 14px; padding: 16px; margin-top: 18px; border: 2px solid rgba(59, 130, 246, 0.4); backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 28px; height: 28px; background: rgba(59, 130, 246, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 14px;">📋</span>
                </div>
                <p style="color: rgba(255,255,255,0.95); font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin: 0; font-weight: 700;">Pago Anterior</p>
              </div>
              
              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Valor del Pago Anterior</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; letter-spacing: -0.5px;">${{ formatMoney(pagoRegistrado?.valorPagoAnterior || 0) }}</p>
                <p v-if="pagoRegistrado?.fechaPagoAnterior" style="color: rgba(255,255,255,0.7); font-size: 9px; margin: 4px 0 0 0; font-weight: 500;">
                  Fecha: {{ pagoRegistrado.fechaPagoAnterior }}
                </p>
              </div>
              
              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Pago Actual (Completado)</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; letter-spacing: -0.5px; color: #10b981;">${{ formatMoney(pagoRegistrado?.valor || 0) }}</p>
              </div>
            </div>

            <!-- Información de pago parcial (si aplica) -->
            <div v-if="pagoRegistrado?.esParcial" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%); border-radius: 14px; padding: 16px; margin-top: 18px; border: 2px solid rgba(251, 191, 36, 0.4); backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <div style="width: 28px; height: 28px; background: rgba(251, 191, 36, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 14px;">⚠️</span>
                </div>
                <p style="color: rgba(255,255,255,0.95); font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin: 0; font-weight: 700;">Pago Parcial</p>
              </div>
              
              <!-- Valor Total de la Cuota primero -->
              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Valor Total de la Cuota</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; letter-spacing: -0.5px;">${{ formatMoney(pagoRegistrado?.valorCuota || 0) }}</p>
              </div>
              
              <!-- Total Pagado y Pendiente lado a lado -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Total Pagado</p>
                  <p style="font-weight: 700; font-size: 14px; margin: 0; letter-spacing: -0.5px;">${{ formatMoney(pagoRegistrado?.valorPagadoTotal || 0) }}</p>
                </div>
                <div style="background: rgba(251, 191, 36, 0.2); border-radius: 8px; padding: 10px; border: 1px solid rgba(251, 191, 36, 0.3);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Pendiente</p>
                  <p style="font-weight: 700; font-size: 14px; margin: 0; color: #fbbf24; letter-spacing: -0.5px;">${{ formatMoney(pagoRegistrado?.valorPendiente || 0) }}</p>
                </div>
              </div>
            </div>

            <!-- Detalles del socio y cuota -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
              <div style="background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255,255,255,0.25);">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Socio</p>
                <p style="font-weight: 700; font-size: 13px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.3px;">{{ pagoRegistrado?.socioNombre }}</p>
              </div>
              <div style="background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255,255,255,0.25);">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Cuota</p>
                <p style="font-weight: 700; font-size: 13px; margin: 0; letter-spacing: -0.3px;">{{ pagoRegistrado?.descripcionCuota || 'Cuota mensual' }}</p>
              </div>
            </div>

            <!-- Fecha y Estado -->
            <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
              <div style="flex: 1;">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Fecha de Pago</p>
                <p style="font-weight: 700; font-size: 12px; margin: 0; letter-spacing: -0.2px;">{{ pagoRegistrado?.fecha }}</p>
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Estado</p>
                <div :style="pagoRegistrado?.esParcial 
                  ? 'display: inline-flex; align-items: center; gap: 6px; background: rgba(251, 191, 36, 0.2); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);'
                  : 'display: inline-flex; align-items: center; gap: 6px; background: rgba(167, 243, 208, 0.2); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(167, 243, 208, 0.3);'">
                  <span style="font-size: 14px;">{{ pagoRegistrado?.esParcial ? '⚠️' : '✓' }}</span>
                  <p :style="'font-weight: 700; font-size: 15px; margin: 0; letter-spacing: -0.2px;' + (pagoRegistrado?.esParcial ? ' color: #fbbf24;' : ' color: #a7f3d0;')">
                    {{ pagoRegistrado?.esParcial ? 'Parcial' : 'Pagado' }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Código de comprobante -->
            <div v-if="pagoRegistrado?.codigoComprobante" style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="color: rgba(255,255,255,0.7); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 600; text-align: center;">Código de Comprobante</p>
              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">
                <p style="color: rgba(255,255,255,0.95); font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 2px; margin: 0;">
                  {{ pagoRegistrado.codigoComprobante }}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- Footer fijo con botones de acción -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
          <!-- Botones de acción -->
          <div class="space-y-3">
            <button 
              @click="descargarComprobante"
              :disabled="generandoImagen"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ generandoImagen ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <button 
              @click="compartirWhatsApp"
              :disabled="generandoImagen || !pagoRegistrado?.socioTelefono"
              :class="[
                'block sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all',
                (generandoImagen || !pagoRegistrado?.socioTelefono)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              ]"
              :title="!pagoRegistrado?.socioTelefono ? 'No hay teléfono registrado para este socio' : ''"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
              <span v-if="generandoImagen">Preparando...</span>
              <span v-else-if="!pagoRegistrado?.socioTelefono">📲 Sin teléfono registrado</span>
              <span v-else>📲 Compartir por WhatsApp</span>
            </button>
          </div>

          <p class="text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>

          <button 
            @click="cerrarConfirmacion"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Exportar a Excel -->
    <div v-if="modalExportar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalExportar = false"></div>
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Header con gradiente -->
        <div class="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-3xl p-6 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <ArrowDownTrayIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">Exportar a Excel</h3>
                <p class="text-sm text-white/80">Selecciona las columnas a exportar</p>
              </div>
            </div>
            <button 
              @click="modalExportar = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <label class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :checked="todasColumnasSeleccionadas"
                  @change="toggleTodasColumnas"
                  class="w-5 h-5 rounded border-gray-300 text-natillera-500 focus:ring-natillera-500"
                />
                <span class="font-semibold text-gray-700">Seleccionar todas</span>
              </label>
              <span class="text-sm text-gray-500">
                {{ columnasSeleccionadas.length }} de {{ columnasDisponibles.length }} seleccionadas
              </span>
            </div>

            <div class="space-y-2 max-h-96 overflow-y-auto">
              <label 
                v-for="columna in columnasDisponibles" 
                :key="columna.key"
                class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer hover:bg-natillera-50 hover:border-natillera-200"
                :class="columnasSeleccionadas.includes(columna.key) ? 'bg-natillera-50 border-natillera-300' : 'bg-white border-gray-200'"
              >
                <input 
                  type="checkbox" 
                  :value="columna.key"
                  v-model="columnasSeleccionadas"
                  class="w-5 h-5 rounded border-gray-300 text-natillera-500 focus:ring-natillera-500"
                />
                <div class="flex-1">
                  <p class="font-medium text-gray-800">{{ columna.label }}</p>
                  <p class="text-xs text-gray-500">{{ columna.description }}</p>
                </div>
                <div 
                  v-if="columnasSeleccionadas.includes(columna.key)"
                  class="w-6 h-6 rounded-full bg-gradient-to-br from-natillera-500 to-emerald-600 flex items-center justify-center"
                >
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer con botones -->
        <div class="p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div class="flex gap-3">
            <button 
              @click="modalExportar = false"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              @click="exportarAExcel"
              :disabled="columnasSeleccionadas.length === 0 || exportando"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowDownTrayIcon v-if="!exportando" class="w-5 h-5" />
              <span v-if="exportando">Exportando...</span>
              <span v-else>Exportar ({{ columnasSeleccionadas.length }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Cuota -->
    <div v-if="modalEditarCuota" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalEditarCuota = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <PencilIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-2xl font-display font-bold">
                Editar Cuota
              </h3>
            </div>
            <p class="text-white/90 text-sm">
              Modifica el valor de la cuota
            </p>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-6">
          <!-- Card de información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <img 
                :src="getAvatarUrl(cuotaEditando?.socio_natillera?.socio?.nombre || cuotaEditando?.socio_natillera?.id, cuotaEditando?.socio_natillera?.socio?.avatar_seed, cuotaEditando?.socio_natillera?.socio?.avatar_style)" 
                :alt="cuotaEditando?.socio_natillera?.socio?.nombre"
                class="w-14 h-14 rounded-xl flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate">
                  {{ cuotaEditando?.socio_natillera?.socio?.nombre || 'Socio' }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ cuotaEditando?.descripcion || 'Cuota' }}
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div>
                <p class="text-xs text-gray-500 mb-1">Valor Actual</p>
                <p class="font-bold text-gray-800 text-lg">
                  ${{ formatMoney(cuotaEditando?.valor_cuota || 0) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Pagado</p>
                <p class="font-bold text-green-600 text-lg">
                  ${{ formatMoney(cuotaEditando?.valor_pagado || 0) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Pendiente</p>
                <p class="font-bold text-orange-600 text-lg">
                  ${{ formatMoney((cuotaEditando?.valor_cuota || 0) - (cuotaEditando?.valor_pagado || 0)) }}
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="guardarEdicionCuota" class="space-y-5">
            <!-- Campo de valor de la cuota -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span v-if="cuotaEditando?.valor_pagado && cuotaEditando.valor_pagado > 0">
                  Valor Pagado <span class="text-red-500">*</span>
                </span>
                <span v-else>
                  Nuevo Valor de la Cuota <span class="text-red-500">*</span>
                </span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-500 z-10">
                  <CurrencyDollarIcon class="w-5 h-5" />
                </div>
                <input 
                  :value="formatearValorPago(formEditarCuota.valor_cuota)"
                  @input="handleValorCuotaEditarInput($event)"
                  @focus="$event.target.select()"
                  type="text"
                  inputmode="numeric"
                  class="w-full pl-12 pr-4 py-3.5 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-natillera-500 focus:ring-2 focus:ring-natillera-200 transition-all outline-none"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
              <button 
                type="button"
                @click="modalEditarCuota = false"
                class="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn-primary flex-1"
                :disabled="cuotasStore.loading"
              >
                {{ cuotasStore.loading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Editar Socio -->
    <div v-if="modalEditarSocio" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalEditarSocio"></div>
      <div class="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <PencilIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  Editar Socio
                </h3>
                <p class="text-white/90 text-sm">
                  Modifica la información del socio
                </p>
              </div>
            </div>
            <button 
              @click="cerrarModalEditarSocio"
              class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6">
          <form @submit.prevent="handleGuardarSocio" class="space-y-4">
            <!-- Selector de Avatar -->
            <div>
              <label class="label">Selecciona un avatar</label>
              <div class="flex items-center gap-4 mb-3">
                <img 
                  :src="getAvatarUrl(formSocio.avatar_seed || formSocio.nombre || 'nuevo', null, formSocio.avatar_style)" 
                  alt="Avatar seleccionado"
                  class="w-16 h-16 rounded-xl bg-natillera-100 border-2 border-natillera-300"
                />
                <button 
                  type="button"
                  @click="mostrarAvatares = !mostrarAvatares"
                  class="text-sm text-natillera-600 hover:text-natillera-700 font-medium"
                >
                  {{ mostrarAvatares ? 'Ocultar opciones' : 'Cambiar avatar' }}
                </button>
              </div>
              <div v-show="mostrarAvatares" class="bg-gray-50 rounded-xl overflow-hidden">
                <!-- Selector de estilo de avatar -->
                <div class="p-3 border-b border-gray-200">
                  <label class="text-xs text-gray-500 mb-2 block">Estilo de avatar</label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'adventurer'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'adventurer'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      🎨 Aventurero
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'avataaars'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'avataaars'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      👤 Avataaars
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'big-smile'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'big-smile'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      😊 Sonrisa
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'bottts'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'bottts'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      🤖 Robot
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'lorelei'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'lorelei'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      ✨ Lorelei
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'micah'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'micah'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      🎭 Micah
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'miniavs'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'miniavs'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      🎪 Mini
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'open-peeps'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'open-peeps'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      👥 Open Peeps
                    </button>
                    <button
                      type="button"
                      @click="formSocio.avatar_style = 'personas'"
                      :class="[
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all border-2',
                        formSocio.avatar_style === 'personas'
                          ? 'bg-natillera-500 text-white border-natillera-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      👤 Personas
                    </button>
                  </div>
                </div>
                
                <!-- Grid de avatares -->
                <div class="grid grid-cols-5 gap-2 p-3 max-h-52 overflow-y-auto">
                  <button
                    v-for="seed in avatarSeeds"
                    :key="seed"
                    type="button"
                    @click="formSocio.avatar_seed = seed"
                    :class="[
                      'p-1 rounded-lg transition-all',
                      formSocio.avatar_seed === seed 
                        ? 'ring-2 ring-natillera-500 bg-natillera-100' 
                        : 'hover:bg-gray-100'
                    ]"
                  >
                    <img 
                      :src="getAvatarUrl(seed, null, formSocio.avatar_style)" 
                      :alt="seed"
                      class="w-10 h-10 rounded-lg"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Nombre (obligatorio) -->
            <div>
              <label class="label">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="formSocio.nombre"
                type="text" 
                class="input-field"
                placeholder="Ej: María García"
                required
              />
            </div>

            <!-- Cuota (obligatorio) -->
            <div class="p-4 bg-natillera-50 rounded-xl border border-natillera-200">
              <label class="label text-natillera-700">
                💰 {{ textoLabelCuota }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input 
                  :value="formatearValorCuota(formSocio.valor_cuota)"
                  @input="handleValorCuotaInput($event)"
                  @focus="seleccionarMontoCuota"
                  @click="seleccionarMontoCuota"
                  type="text" 
                  class="input-field pl-8 text-lg font-semibold"
                  placeholder="50.000"
                  required
                />
              </div>
              <p class="text-xs text-natillera-600 mt-2">
                Este es el valor que el socio aportará en cada período
              </p>
            </div>

            <!-- Periodicidad -->
            <div>
              <label class="label">
                Periodicidad de pago
              </label>
              <div :class="periodicidadNatillera === 'mensual' ? '' : 'grid grid-cols-2 gap-3'">
                <button
                  type="button"
                  @click="periodicidadNatillera !== 'mensual' && (formSocio.periodicidad = 'mensual')"
                  :disabled="periodicidadNatillera === 'mensual'"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all text-left w-full',
                    formSocio.periodicidad === 'mensual'
                      ? 'border-natillera-500 bg-natillera-50 ring-2 ring-natillera-200'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                    periodicidadNatillera === 'mensual' ? 'cursor-default opacity-90' : ''
                  ]"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">📅</span>
                    <span class="font-semibold" :class="formSocio.periodicidad === 'mensual' ? 'text-natillera-700' : 'text-gray-700'">
                      Mensual
                    </span>
                    <span v-if="periodicidadNatillera === 'mensual'" class="ml-auto text-xs bg-natillera-200 text-natillera-700 px-2 py-0.5 rounded-full font-medium">
                      Único
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">1 cuota por mes</p>
                </button>
                <button
                  v-if="periodicidadNatillera === 'quincenal'"
                  type="button"
                  @click="formSocio.periodicidad = 'quincenal'"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all text-left',
                    formSocio.periodicidad === 'quincenal'
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  ]"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">🗓️</span>
                    <span class="font-semibold" :class="formSocio.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-gray-700'">
                      Quincenal
                    </span>
                  </div>
                  <p class="text-xs text-gray-500">2 cuotas por mes</p>
                </button>
              </div>
              <p v-if="periodicidadNatillera === 'mensual'" class="text-xs text-gray-500 mt-2">
                Esta natillera está configurada como mensual
              </p>
            </div>

            <!-- Información de contacto (colapsable) -->
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                type="button"
                @click="mostrarContacto = !mostrarContacto"
                class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span class="font-medium text-gray-700">
                  📱 Información de contacto
                  <span class="text-gray-400 font-normal text-sm">(opcional)</span>
                </span>
                <ChevronDownIcon 
                  :class="['w-5 h-5 text-gray-400 transition-transform', mostrarContacto ? 'rotate-180' : '']" 
                />
              </button>
              
              <div v-show="mostrarContacto" class="p-4 space-y-4 border-t border-gray-200">
                <div>
                  <label class="label">Teléfono / WhatsApp</label>
                  <input 
                    v-model="formSocio.telefono"
                    type="tel" 
                    class="input-field"
                    placeholder="3001234567"
                  />
                  <p class="text-xs text-gray-400 mt-1">Para enviar recordatorios de pago</p>
                </div>

                <div>
                  <label class="label">Correo electrónico</label>
                  <input 
                    v-model="formSocio.email"
                    type="email" 
                    class="input-field"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label class="label">Documento de identidad</label>
                  <input 
                    v-model="formSocio.documento"
                    type="text" 
                    class="input-field"
                    placeholder="Cédula (opcional)"
                  />
                </div>
              </div>
            </div>

            <div v-if="errorSocio" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {{ errorSocio }}
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                type="button"
                @click="cerrarModalEditarSocio"
                class="btn-secondary flex-1"
                :disabled="estadoGuardadoSocio !== ''"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn-primary flex-1 flex items-center justify-center gap-2"
                :disabled="estadoGuardadoSocio !== ''"
              >
                <svg v-if="estadoGuardadoSocio !== ''" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="estadoGuardadoSocio === 'guardando'">Guardando datos...</span>
                <span v-else-if="estadoGuardadoSocio === 'generando'">Generando cuotas...</span>
                <span v-else>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Socio -->
    <div v-if="modalDetalleSocio" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalleSocio = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <img 
                  :src="getAvatarUrl(socioSeleccionado?.socio?.nombre || socioSeleccionado?.id, socioSeleccionado?.socio?.avatar_seed, socioSeleccionado?.socio?.avatar_style)" 
                  :alt="socioSeleccionado?.socio?.nombre"
                  class="w-14 h-14 rounded-2xl border-2 border-white/30 shadow-lg object-cover"
                />
                <div>
                  <h3 class="text-xl font-display font-bold">
                    {{ socioSeleccionado?.socio?.nombre }}
                  </h3>
                  <p class="text-sm text-white/80">Información del socio</p>
                </div>
              </div>
              <button 
                @click="modalDetalleSocio = false"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-5">
          <!-- Valor de la cuota -->
          <div class="relative bg-gradient-to-br from-natillera-50 to-emerald-50 p-5 rounded-xl border border-natillera-200 shadow-sm">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Valor de la Cuota</p>
                <p class="text-2xl font-bold text-natillera-700">${{ formatMoney(socioSeleccionado?.valor_cuota_individual) }}</p>
              </div>
            </div>
          </div>

          <!-- Periodicidad -->
          <div class="relative p-5 rounded-xl border shadow-sm" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'">
                <span class="text-xl">{{ socioSeleccionado?.periodicidad === 'quincenal' ? '🗓️' : '📅' }}</span>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Periodicidad</p>
                <p class="text-xl font-bold" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-blue-700'">
                  {{ socioSeleccionado?.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Teléfono -->
          <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <PhoneIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-500 font-medium">Teléfono / WhatsApp</p>
                <p class="text-lg font-bold text-gray-800 truncate">{{ socioSeleccionado?.socio?.telefono || 'No registrado' }}</p>
              </div>
              <a 
                v-if="socioSeleccionado?.socio?.telefono"
                :href="`https://wa.me/57${socioSeleccionado.socio.telefono.replace(/\D/g, '')}`"
                target="_blank"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg flex-shrink-0"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <!-- Mensaje para más información -->
          <div class="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <UsersIcon class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-800 mb-2">¿Necesitas más información?</p>
                <p class="text-sm text-gray-600 mb-4">
                  Accede a la sección completa de socios para ver el historial de pagos, cuotas pendientes y toda la información detallada.
                </p>
                <router-link 
                  :to="`/natilleras/${id}/socios`"
                  @click="modalDetalleSocio = false"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 hover:shadow-xl"
                >
                  <UsersIcon class="w-5 h-5" />
                  <span>Ir a Socios</span>
                  <ArrowRightIcon class="w-4 h-4" />
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <button 
            @click="modalDetalleSocio = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { useSociosStore } from '../../stores/socios'
import { useNatillerasStore } from '../../stores/natilleras'
import { supabase } from '../../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
// Ya no necesitamos html2canvas, dibujamos directamente en canvas
import { 
  ArrowLeftIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  TableCellsIcon,
  Squares2X2Icon,
  XMarkIcon,
  PencilIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  UsersIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'
import DatePicker from '../../components/DatePicker.vue'
import * as XLSX from 'xlsx-js-style'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'

const props = defineProps({
  id: String
})

const route = useRoute()
const cuotasStore = useCuotasStore()
const sociosStore = useSociosStore()
const natillerasStore = useNatillerasStore()

const modalGenerarCuotas = ref(false)
const modalPago = ref(false)
const modalConfirmacion = ref(false)
const modalConfirmarBorrar = ref(false)
const modalExportar = ref(false)
const modalEditarCuota = ref(false)
const exportando = ref(false)
const cuotaSeleccionada = ref(null)
const cuotaEditando = ref(null)
const pagoRegistrado = ref(null)
const modalDetalleCuota = ref(false)
const cuotaDetalle = ref(null)
const historialPagosCuota = ref([])
const cargandoHistorialPagos = ref(false)
const modalDetalleSocio = ref(false)
const modalHistorialAjustes = ref(false)
const modalEditarSocio = ref(false)

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalGenerarCuotas)
useBodyScrollLock(modalPago)
useBodyScrollLock(modalConfirmacion)
useBodyScrollLock(modalConfirmarBorrar)
useBodyScrollLock(modalExportar)
useBodyScrollLock(modalEditarCuota)
useBodyScrollLock(modalDetalleCuota)
useBodyScrollLock(modalDetalleSocio)
useBodyScrollLock(modalHistorialAjustes)
useBodyScrollLock(modalEditarSocio)

const socioSeleccionado = ref(null)
const socioEditando = ref(null)
const cuotasSocio = ref([])
const mostrarAvatares = ref(false)
const mostrarContacto = ref(false)
const errorSocio = ref('')
const estadoGuardadoSocio = ref('') // '', 'guardando', 'generando'
const natilleraNombre = ref('')
const comprobanteRef = ref(null)
const generandoImagen = ref(false)
const scrollComprobanteRef = ref(null)
const mostrarIndicadorScroll = ref(false)
const scrollContainerGenerarCuotas = ref(null)
const dropdownMesAbierto = ref(false)
const dropdownMesRef = ref(null)
const sancionesDinamicas = ref({}) // Sanciones calculadas dinámicamente
const sancionesActivas = ref(false) // Indica si las sanciones están activadas
const diasGracia = ref(3) // Días de gracia de la natillera

// Configuración de meses de la natillera
const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())
const mesSeleccionado = ref(null)
const inicializando = ref(true) // Flag para evitar que el watch se dispare durante la inicialización
const generandoCuotas = ref(false) // Flag para evitar ejecuciones paralelas de generación
const filtroEstado = ref('todos')
const filtroPeriodicidad = ref('todos')
const busquedaCuotas = ref('')
const mostrarFiltros = ref(false)
const inputBusquedaRef = ref(null)
const inputValorPagoRef = ref(null)
const vistaExcel = ref(false) // false = vista tarjetas, true = vista Excel
const vistaAgrupada = ref(false) // true = vista agrupada por socio

// Configuración de exportación a Excel
const columnasDisponibles = [
  { key: 'socio', label: 'Socio', description: 'Nombre del socio' },
  { key: 'descripcion', label: 'Descripción', description: 'Descripción de la cuota' },
  { key: 'periodicidad', label: 'Periodicidad', description: 'Mensual o Quincenal' },
  { key: 'valor_cuota', label: 'Valor Cuota', description: 'Valor total de la cuota' },
  { key: 'valor_pagado', label: 'Valor Pagado', description: 'Monto pagado hasta el momento' },
  { key: 'valor_pendiente', label: 'Valor Pendiente', description: 'Monto restante por pagar' },
  { key: 'fecha_limite', label: 'Fecha Límite', description: 'Fecha límite de pago' },
  { key: 'fecha_vencimiento', label: 'Fecha Vencimiento', description: 'Fecha de vencimiento (sin días de gracia)' },
  { key: 'estado', label: 'Estado', description: 'Estado de la cuota' },
  { key: 'quincena', label: 'Quincena', description: 'Número de quincena (si aplica)' }
]

// Inicializar con todas las columnas seleccionadas por defecto
const columnasSeleccionadas = ref(columnasDisponibles.map(c => c.key))

const todasColumnasSeleccionadas = computed(() => {
  return columnasSeleccionadas.value.length === columnasDisponibles.length
})

const toggleTodasColumnas = () => {
  if (todasColumnasSeleccionadas.value) {
    columnasSeleccionadas.value = []
  } else {
    columnasSeleccionadas.value = columnasDisponibles.map(c => c.key)
  }
}

const abrirModalExportar = () => {
  modalExportar.value = true
  // Si no hay columnas seleccionadas, seleccionar todas por defecto
  if (columnasSeleccionadas.value.length === 0) {
    columnasSeleccionadas.value = columnasDisponibles.map(c => c.key)
  }
}

const exportarAExcel = async () => {
  if (columnasSeleccionadas.value.length === 0) return
  
  exportando.value = true
  
  try {
    // Preparar los datos para exportar
    const datosExportar = cuotasFiltradas.value.map(cuota => {
      const fila = {}
      
      // Mapeo de columnas
      if (columnasSeleccionadas.value.includes('socio')) {
        fila['Socio'] = cuota.socio_natillera?.socio?.nombre || 'N/A'
      }
      
      if (columnasSeleccionadas.value.includes('descripcion')) {
        fila['Descripción'] = cuota.descripcion || 'Cuota'
      }
      
      if (columnasSeleccionadas.value.includes('periodicidad')) {
        fila['Periodicidad'] = cuota.quincena ? `Quincena ${cuota.quincena}` : 'Mensual'
      }
      
      if (columnasSeleccionadas.value.includes('valor_cuota')) {
        fila['Valor Cuota'] = cuota.valor_cuota || 0
      }
      
      if (columnasSeleccionadas.value.includes('valor_pagado')) {
        fila['Valor Pagado'] = cuota.valor_pagado || 0
      }
      
      if (columnasSeleccionadas.value.includes('valor_pendiente')) {
        const pendiente = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
        fila['Valor Pendiente'] = pendiente > 0 ? pendiente : 0
      }
      
      if (columnasSeleccionadas.value.includes('fecha_limite')) {
        fila['Fecha Límite'] = cuota.fecha_limite ? formatDate(cuota.fecha_limite) : 'N/A'
      }
      
      if (columnasSeleccionadas.value.includes('fecha_vencimiento')) {
        fila['Fecha Vencimiento'] = cuota.fecha_vencimiento ? formatDate(cuota.fecha_vencimiento) : 'N/A'
      }
      
      if (columnasSeleccionadas.value.includes('estado')) {
        let estadoTexto = cuota.estado
        if (estadoTexto === 'programada') estadoTexto = 'Programada'
        else if (estadoTexto === 'pagada') estadoTexto = 'Pagada'
        else if (estadoTexto === 'pendiente') estadoTexto = 'Pendiente'
        else if (estadoTexto === 'parcial') estadoTexto = 'Parcial'
        else if (estadoTexto === 'mora') estadoTexto = 'En Mora'
        fila['Estado'] = estadoTexto
      }
      
      if (columnasSeleccionadas.value.includes('quincena')) {
        fila['Quincena'] = cuota.quincena || 'N/A'
      }
      
      return fila
    })
    
    // Crear el libro de trabajo
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(datosExportar)
    
    // Obtener el rango de celdas
    const range = XLSX.utils.decode_range(ws['!ref'])
    
    // Mapear las columnas seleccionadas a sus nombres en Excel
    const columnasMap = {
      'socio': 'Socio',
      'descripcion': 'Descripción',
      'periodicidad': 'Periodicidad',
      'valor_cuota': 'Valor Cuota',
      'valor_pagado': 'Valor Pagado',
      'valor_pendiente': 'Valor Pendiente',
      'fecha_limite': 'Fecha Límite',
      'fecha_vencimiento': 'Fecha Vencimiento',
      'estado': 'Estado',
      'quincena': 'Quincena'
    }
    
    // Obtener los nombres de las columnas en el orden correcto
    const nombresColumnas = columnasSeleccionadas.value.map(key => columnasMap[key])
    
    // Definir estilos
    // Colores del diseño (RGB en formato hexadecimal)
    const colorVerde = { rgb: '10B981' } // emerald-500
    const colorGrisClaro = { rgb: 'F3F4F6' } // gray-100
    const colorVerdeOscuro = { rgb: '047857' } // emerald-700
    const colorRojo = { rgb: 'DC2626' } // red-600
    const colorNaranja = { rgb: 'F97316' } // orange-500
    const colorAzul = { rgb: '3B82F6' } // blue-500
    const colorGrisEstado = { rgb: '9CA3AF' } // gray-400
    
    // Estilizar el header (fila 1)
    const headerRow = 0
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col })
      if (!ws[cellAddress]) continue
      
      ws[cellAddress].s = {
        fill: {
          fgColor: colorVerde,
          patternType: 'solid'
        },
        font: {
          bold: true,
          color: { rgb: 'FFFFFF' },
          sz: 11
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true
        },
        border: {
          top: { style: 'thin', color: { rgb: '047857' } },
          bottom: { style: 'thin', color: { rgb: '047857' } },
          left: { style: 'thin', color: { rgb: '047857' } },
          right: { style: 'thin', color: { rgb: '047857' } }
        }
      }
    }
    
    // Estilizar las filas de datos
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const isEven = (row - 1) % 2 === 0
      const dataRow = row - 1 // Índice en datosExportar
      const cuota = cuotasFiltradas.value[dataRow]
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cellAddress]) continue
        
        const cellValue = ws[cellAddress].v
        const colName = nombresColumnas[col]
        
        // Determinar color de fondo
        let bgColor = isEven ? { rgb: 'FFFFFF' } : colorGrisClaro
        
        // Determinar color de texto
        let textColor = { rgb: '1F2937' } // gray-800
        
        // Estilos especiales según el tipo de columna
        if (colName === 'Estado') {
          // Colores según el estado
          if (cellValue === 'Pagada') {
            bgColor = { rgb: 'D1FAE5' } // verde claro
            textColor = { rgb: '047857' } // verde oscuro
          } else if (cellValue === 'En Mora') {
            bgColor = { rgb: 'FEE2E2' } // rojo claro
            textColor = colorRojo
          } else if (cellValue === 'Parcial') {
            bgColor = { rgb: 'DBEAFE' } // azul claro
            textColor = colorAzul
          } else if (cellValue === 'Pendiente') {
            bgColor = { rgb: 'FED7AA' } // naranja claro
            textColor = colorNaranja
          } else if (cellValue === 'Programada') {
            bgColor = { rgb: 'F3F4F6' } // gris claro
            textColor = colorGrisEstado
          }
        } else if (colName === 'Valor Pagado' && typeof cellValue === 'number' && cellValue > 0) {
          textColor = colorVerdeOscuro
        } else if (colName === 'Valor Pendiente' && typeof cellValue === 'number' && cellValue > 0) {
          textColor = colorNaranja
        }
        
        // Aplicar estilos
        ws[cellAddress].s = {
          fill: {
            fgColor: bgColor,
            patternType: 'solid'
          },
          font: {
            color: textColor,
            sz: 10
          },
          alignment: {
            horizontal: colName && (colName.includes('Valor') || colName.includes('Pendiente')) ? 'right' : 'left',
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          }
        }
        
        // Formato de números para columnas de valores
        if (colName && (colName.includes('Valor') || colName.includes('Pendiente'))) {
          if (typeof cellValue === 'number') {
            ws[cellAddress].z = '#,##0'
          }
        }
      }
    }
    
    // Ajustar el ancho de las columnas
    const colWidths = columnasSeleccionadas.value.map((col, index) => {
      const colName = columnasDisponibles.find(c => c.key === col)?.label || ''
      // Ajustar ancho según el tipo de columna
      if (colName.includes('Valor') || colName.includes('Pendiente')) {
        return { wch: 18 }
      } else if (colName === 'Descripción') {
        return { wch: 25 }
      } else if (colName === 'Socio') {
        return { wch: 22 }
      } else if (colName.includes('Fecha')) {
        return { wch: 15 }
      }
      return { wch: 16 }
    })
    ws['!cols'] = colWidths
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Cuotas')
    
    // Generar el nombre del archivo
    const mesNombre = mesSeleccionadoLabel.value || 'Todos'
    const anioParaArchivo = mesSeleccionado.value 
      ? anioMesSeleccionado.value 
      : anioNatillera.value
    const nombreArchivo = `Cuotas_${mesNombre}_${anioParaArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo)
    
    // Cerrar el modal
    modalExportar.value = false
    
    // Mostrar mensaje de éxito (opcional)
    setTimeout(() => {
      exportando.value = false
    }, 500)
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    alert('Error al exportar el archivo. Por favor, intenta nuevamente.')
    exportando.value = false
  }
}

// Forzar vista de tarjetas en móvil (solo para Excel, no para agrupada)
const checkMobileView = () => {
  if (window.innerWidth < 768) { // md breakpoint de Tailwind
    vistaExcel.value = false
    // Permitir vista agrupada en móvil
  }
}

// Manejo del historial para modales
let modalHistoryState = null

function handleModalBack(modalRef, modalName) {
  watch(modalRef, (isOpen) => {
    if (isOpen) {
      // Verificar si hay otras modales abiertas
      const hayOtrasModales = modalPago.value || modalEditarCuota.value || 
                              modalDetalleSocio.value || modalHistorialAjustes.value ||
                              modalEditarSocio.value || modalGenerarCuotas.value ||
                              modalConfirmacion.value || modalConfirmarBorrar.value ||
                              modalExportar.value
      
      // Si es la primera modal que se abre (no hay otras modales), agregar primero
      // una entrada al historial que represente el estado "sin modales"
      if (!hayOtrasModales) {
        history.pushState({ modal: null }, '', window.location.href)
      }
      
      // Agregar entrada al historial cuando se abre la modal
      modalHistoryState = { modal: modalName }
      history.pushState(modalHistoryState, '', window.location.href)
    }
  })
}

// Listener para el botón atrás del navegador
function handlePopState(event) {
  // Modal de detalle de cuota
  if (modalDetalleCuota.value) {
    modalDetalleCuota.value = false
    // Si hay otra modal abierta debajo, no hacer nada más
    // La modal inferior ya tiene su entrada en el historial (fue agregada cuando se abrió)
    // El siguiente "atrás" naturalmente cerrará esa modal
    // Si no hay otras modales, no hacer nada más porque ya hay una entrada en el historial
    // que representa el estado "sin modales" (fue agregada cuando se abrió esta modal)
    return
  }
}

// Registrar watcher para la modal de detalle de cuota
handleModalBack(modalDetalleCuota, 'detalleCuota')

onMounted(() => {
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
  // Agregar listener para el botón atrás
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView)
  document.removeEventListener('click', handleClickOutside)
  // Remover listener para el botón atrás
  window.removeEventListener('popstate', handlePopState)
})

// Lista de todos los meses
const todosMeses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
]

// Meses configurados para esta natillera
const mesesNatillera = computed(() => {
  const meses = []
  let inicio = mesInicio.value
  let fin = mesFin.value
  
  if (inicio <= fin) {
    for (let i = inicio; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  } else {
    // Caso donde el período cruza el año (ej: Octubre a Febrero)
    for (let i = inicio; i <= 12; i++) {
      meses.push(todosMeses[i - 1])
    }
    for (let i = 1; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  }
  
  return meses
})

// Label del mes seleccionado
const mesSeleccionadoLabel = computed(() => {
  return todosMeses.find(m => m.value === mesSeleccionado.value)?.label || ''
})

// Año correcto para el mes seleccionado basado en el período de la natillera
const anioMesSeleccionado = computed(() => {
  if (!mesSeleccionado.value) return anioNatillera.value
  const anioCalculado = calcularAnioMes(
    mesSeleccionado.value,
    mesInicio.value,
    mesFin.value,
    anioNatillera.value
  )
  // Debug: verificar cálculo del año
  console.log('📅 Cálculo de año:', {
    mes: mesSeleccionado.value,
    mesInicio: mesInicio.value,
    mesFin: mesFin.value,
    anioBase: anioNatillera.value,
    anioCalculado: anioCalculado
  })
  return anioCalculado
})

// Cuotas del mes actual (sin filtro de estado)
const cuotasMesActual = computed(() => {
  if (!mesSeleccionado.value) return cuotasStore.cuotas
  // Calcular el año correcto para este mes basándose en el período de la natillera
  const anioCorrecto = calcularAnioMes(
    mesSeleccionado.value,
    mesInicio.value,
    mesFin.value,
    anioNatillera.value
  )
  return cuotasStore.getCuotasPorMes(mesSeleccionado.value, anioCorrecto)
})

// Cuotas filtradas por estado, periodicidad y búsqueda (para mostrar en la lista)
const cuotasFiltradas = computed(() => {
  let filtradas = cuotasMesActual.value.map(cuota => {
    // Calcular el estado real de cada cuota según las reglas
    const estadoReal = calcularEstadoRealCuota(cuota, diasGracia.value)
    return { ...cuota, estadoReal }
  })

  // Filtro por estado (usando estadoReal)
  if (filtroEstado.value !== 'todos') {
    if (filtroEstado.value === 'pendiente') {
      // Pendientes incluye tanto 'pendiente' como 'programada' (según las reglas)
      filtradas = filtradas.filter(c => c.estadoReal === 'pendiente' || c.estadoReal === 'programada')
    } else {
      filtradas = filtradas.filter(c => c.estadoReal === filtroEstado.value)
    }
  }

  // Filtro por periodicidad
  if (filtroPeriodicidad.value === 'mensual') {
    filtradas = filtradas.filter(c => !c.quincena)
  } else if (filtroPeriodicidad.value === 'quincenal') {
    filtradas = filtradas.filter(c => c.quincena)
  }

  // Filtro por búsqueda
  if (busquedaCuotas.value.trim()) {
    const busqueda = busquedaCuotas.value.toLowerCase().trim()
    filtradas = filtradas.filter(c => {
      const nombreSocio = c.socio_natillera?.socio?.nombre?.toLowerCase() || ''
      const descripcion = c.descripcion?.toLowerCase() || ''
      const documento = c.socio_natillera?.socio?.documento?.toLowerCase() || ''
      const telefono = c.socio_natillera?.socio?.telefono?.toLowerCase() || ''
      
      return nombreSocio.includes(busqueda) || 
             descripcion.includes(busqueda) || 
             documento.includes(busqueda) ||
             telefono.includes(busqueda)
    })
  }

  // Ordenar primero por estado (prioridad) y luego alfabéticamente
  filtradas.sort((a, b) => {
    // Definir prioridad de estados (menor número = mayor prioridad)
    const prioridadEstado = {
      'mora': 1,
      'pendiente': 2,
      'programada': 3,
      'pagada': 4
    }
    
    const prioridadA = prioridadEstado[a.estadoReal] || 5
    const prioridadB = prioridadEstado[b.estadoReal] || 5
    
    // Primero ordenar por estado (prioridad)
    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB
    }
    
    // Si tienen el mismo estado, ordenar alfabéticamente por nombre del socio
    const nombreA = (a.socio_natillera?.socio?.nombre || '').toLowerCase()
    const nombreB = (b.socio_natillera?.socio?.nombre || '').toLowerCase()
    return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' })
  })

  return filtradas
})

// Cuotas agrupadas por socio
const cuotasAgrupadasPorSocio = computed(() => {
  const grupos = {}
  
  cuotasFiltradas.value.forEach(cuota => {
    const socioId = cuota.socio_natillera?.id || 'sin-socio'
    const socio = cuota.socio_natillera?.socio
    
    if (!grupos[socioId]) {
      grupos[socioId] = {
        socioId,
        socio: {
          nombre: socio?.nombre || 'Socio',
          avatar_seed: socio?.avatar_seed,
          avatar_style: socio?.avatar_style,
          periodicidad: cuota.socio_natillera?.periodicidad
        },
        cuotas: [],
        total: 0,
        pagado: 0,
        pendiente: 0
      }
    }
    
    grupos[socioId].cuotas.push(cuota)
    grupos[socioId].total += cuota.valor_cuota || 0
    grupos[socioId].pagado += cuota.valor_pagado || 0
    
    // Calcular pendiente: solo incluir cuotas que NO estén en estado programada
    // Incluir cuotas pendientes, en mora o con pago parcial
    const estadoReal = cuota.estadoReal || cuota.estado
    if (estadoReal !== 'programada') {
      const pendiente = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
      grupos[socioId].pendiente += pendiente > 0 ? pendiente : 0
    }
  })
  
  // Ordenar las cuotas dentro de cada grupo: quincena 1 antes que quincena 2
  Object.values(grupos).forEach(grupo => {
    grupo.cuotas.sort((a, b) => {
      // Si ambas tienen quincena, ordenar por quincena (1 antes que 2)
      if (a.quincena && b.quincena) {
        return a.quincena - b.quincena
      }
      // Si solo una tiene quincena, la que tiene quincena va primero
      if (a.quincena && !b.quincena) return -1
      if (!a.quincena && b.quincena) return 1
      // Si ninguna tiene quincena, mantener el orden original
      return 0
    })
  })
  
  // Convertir a array y ordenar por nombre del socio
  return Object.values(grupos).sort((a, b) => {
    const nombreA = (a.socio?.nombre || '').toLowerCase()
    const nombreB = (b.socio?.nombre || '').toLowerCase()
    return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' })
  })
})

// Totales para la vista Excel
const totalesExcel = computed(() => {
  const totalValorCuota = cuotasFiltradas.value.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
  const totalValorPagado = cuotasFiltradas.value.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  const totalPendiente = cuotasFiltradas.value.reduce((sum, c) => {
    // Excluir cuotas programadas del cálculo del pendiente
    const estadoReal = c.estadoReal || c.estado
    if (estadoReal === 'programada') {
      return sum
    }
    const pendiente = (c.valor_cuota || 0) - (c.valor_pagado || 0)
    return sum + (pendiente > 0 ? pendiente : 0)
  }, 0)
  
  return {
    totalValorCuota,
    totalValorPagado,
    totalPendiente
  }
})

// Resumen del mes actual (usando estados reales calculados)
const resumenMesActual = computed(() => {
  let cuotas
  if (mesSeleccionado.value) {
    // Calcular el año correcto para este mes basándose en el período de la natillera
    const anioCorrecto = calcularAnioMes(
      mesSeleccionado.value,
      mesInicio.value,
      mesFin.value,
      anioNatillera.value
    )
    cuotas = cuotasStore.getCuotasPorMes(mesSeleccionado.value, anioCorrecto)
  } else {
    cuotas = cuotasStore.cuotas
  }
  
  // Calcular estados reales y contar por estado
  const cuotasConEstadoReal = cuotas.map(c => ({
    ...c,
    estadoReal: calcularEstadoRealCuota(c, diasGracia.value)
  }))
  
  // Calcular totales financieros
  const totalValor = cuotasConEstadoReal.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
  const totalPagado = cuotasConEstadoReal.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  const porcentajeRecaudado = totalValor > 0 ? (totalPagado / totalValor) * 100 : 0
  
  // Calcular total recaudado (suma de todos los pagos, completos y parciales)
  const totalRecaudado = cuotasConEstadoReal.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  
  return {
    pagadas: cuotasConEstadoReal.filter(c => c.estadoReal === 'pagada').length,
    pendientes: cuotasConEstadoReal.filter(c => c.estadoReal === 'pendiente').length,
    enMora: cuotasConEstadoReal.filter(c => c.estadoReal === 'mora').length,
    programadas: cuotasConEstadoReal.filter(c => c.estadoReal === 'programada').length,
    total: cuotasConEstadoReal.length,
    porcentajeRecaudado: isNaN(porcentajeRecaudado) ? 0 : porcentajeRecaudado,
    totalRecaudado: totalRecaudado
  }
})

// Función para obtener resumen de un mes específico (para los badges de los tabs)
function getResumenMes(mes) {
  // Calcular el año correcto para este mes basándose en el período de la natillera
  const anioCorrecto = calcularAnioMes(
    mes,
    mesInicio.value,
    mesFin.value,
    anioNatillera.value
  )
  return cuotasStore.getResumenPorMes(mes, anioCorrecto)
}

// Emoji representativo de cada mes
function getMesEmoji(mes) {
  const emojis = {
    1: '❄️',   // Enero - invierno/nuevo año
    2: '💝',   // Febrero - amor
    3: '🌸',   // Marzo - primavera
    4: '🌧️',   // Abril - lluvias
    5: '🌺',   // Mayo - flores
    6: '☀️',   // Junio - sol
    7: '🏖️',   // Julio - vacaciones
    8: '🌴',   // Agosto - verano
    9: '🍂',   // Septiembre - otoño
    10: '🎃',  // Octubre - halloween
    11: '🦃',  // Noviembre - acción de gracias
    12: '🎄'   // Diciembre - navidad
  }
  return emojis[mes] || '📅'
}

// Nombre del mes
function getMesLabel(mes) {
  const meses = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre'
  }
  return meses[mes] || 'Mes'
}

const formCuotas = reactive({
  fecha_quincena1: '',
  fecha_quincena2: '',
  mes: 1,
  tipoGeneracion: 'todos', // 'todos' o 'unSocio'
  socioSeleccionado: null
})

// Conteo de socios por periodicidad
const conteoSociosMensuales = ref(0)
const conteoSociosQuincenales = ref(0)

// Lista de socios activos para el selector
const sociosActivos = ref([])
const busquedaSocioCuotas = ref('')

// Socios filtrados para el selector
const sociosFiltradosCuotas = computed(() => {
  if (!busquedaSocioCuotas.value.trim()) {
    return sociosActivos.value
  }
  const busqueda = busquedaSocioCuotas.value.toLowerCase().trim()
  return sociosActivos.value.filter(socio => 
    socio.socio?.nombre?.toLowerCase().includes(busqueda)
  )
})

// Determinar si el socio seleccionado es mensual
const socioSeleccionadoEsMensual = computed(() => {
  if (formCuotas.tipoGeneracion !== 'unSocio' || !formCuotas.socioSeleccionado) {
    return false
  }
  const socio = sociosActivos.value.find(s => s.id === formCuotas.socioSeleccionado)
  return socio?.periodicidad === 'mensual'
})

const formPago = reactive({
  valor: 0
})

const formEditarCuota = reactive({
  valor_cuota: 0
})

// Función para formatear el valor del pago con puntos
function formatearValorPago(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

// Manejar input del valor del pago
function handleValorPagoInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    formPago.valor = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      // Usar la función getTotalAPagar que incluye la sanción dinámica
      const maxValor = getTotalAPagar(cuotaSeleccionada.value)
      // Limitar al máximo disponible
      formPago.valor = Math.min(numero, maxValor)
    }
  }
}

const id = props.id || route.params.id

// Función para calcular el estado real de una cuota basándose en la fecha actual
// Reglas según REGLAS.md:
// - Programada: fecha_actual < fecha_limite
// - Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
// - En Mora: fecha_actual > fecha_vencimiento
// - Pagada: valor_pagado >= valor_cuota
function calcularEstadoRealCuota(cuota, diasGracia) {
  const valorCuota = cuota.valor_cuota || 0
  const valorPagado = cuota.valor_pagado || 0
  
  // Pagada: valor_pagado >= valor_cuota (según REGLAS.md, sin incluir sanción)
  if (valorPagado >= valorCuota) {
    return 'pagada'
  }
  
  if (!cuota.fecha_limite) return cuota.estado || 'programada'
  
  const fechaActual = new Date()
  fechaActual.setHours(0, 0, 0, 0)
  
  // Parsear fecha_limite correctamente para evitar problemas de zona horaria
  // Si viene como string "YYYY-MM-DD", crear la fecha en hora local, no UTC
  let fechaLimite
  if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
    const [anio, mes, dia] = cuota.fecha_limite.split('-').map(Number)
    fechaLimite = new Date(anio, mes - 1, dia) // mes - 1 porque Date usa 0-11 para meses
  } else {
    fechaLimite = new Date(cuota.fecha_limite)
  }
  fechaLimite.setHours(0, 0, 0, 0)
  
  // Obtener fecha_vencimiento: usar el campo directamente si existe, o calcularlo
  let fechaVencimiento
  if (cuota.fecha_vencimiento) {
    // Usar fecha_vencimiento directamente si existe en la cuota
    if (typeof cuota.fecha_vencimiento === 'string' && cuota.fecha_vencimiento.includes('-')) {
      const [anio, mes, dia] = cuota.fecha_vencimiento.split('-').map(Number)
      fechaVencimiento = new Date(anio, mes - 1, dia)
    } else {
      fechaVencimiento = new Date(cuota.fecha_vencimiento)
    }
  } else {
    // Si no existe, calcularla como fecha_limite + dias_gracia (fallback)
    const diasGraciaUsar = diasGracia !== undefined ? diasGracia : (diasGracia?.value || 3)
    fechaVencimiento = new Date(fechaLimite)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGraciaUsar)
  }
  fechaVencimiento.setHours(0, 0, 0, 0)
  
  // Programada: fecha_actual < fecha_limite
  if (fechaActual < fechaLimite) {
    return 'programada'
  }
  
  // Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
  if (fechaActual >= fechaLimite && fechaActual <= fechaVencimiento) {
    return 'pendiente'
  }
  
  // En Mora: fecha_actual > fecha_vencimiento
  if (fechaActual > fechaVencimiento) {
    return 'mora'
  }
  
  // Por defecto, mantener el estado original
  return cuota.estado || 'programada'
}

// Función auxiliar para verificar si una cuota tiene pago parcial (para mostrar badge adicional)
function tienePagoParcialCuota(cuota) {
  const sancion = getSancionCuota(cuota)
  const totalAPagar = (cuota.valor_cuota || 0) + sancion
  const valorPagado = cuota.valor_pagado || 0
  return valorPagado > 0 && valorPagado < totalAPagar
}

const mesParam = computed(() => {
  const mes = route.params.mes
  return mes ? parseInt(mes, 10) : null
})

const resumen = computed(() => cuotasStore.calcularResumenCuotas())

// Cuando cambia el mes seleccionado (por interacción del usuario, NO durante inicialización)
watch(mesSeleccionado, async (nuevoMes, mesAnterior) => {
  // Ignorar durante la inicialización para evitar múltiples cargas
  if (inicializando.value) {
    console.log('⏭️ Watch ignorado - inicialización en curso')
    return
  }
  
  if (nuevoMes && nuevoMes !== mesAnterior) {
    formCuotas.mes = nuevoMes
    filtroPeriodicidad.value = 'todos' // Resetear filtro de periodicidad
    
    // Evitar ejecuciones paralelas de generación de cuotas
    if (generandoCuotas.value) {
      console.log('⏭️ Generación de cuotas ya en curso, ignorando...')
      return
    }
    
    // Generar cuotas automáticamente para el mes seleccionado si faltan
    try {
      generandoCuotas.value = true
      // Calcular el año correcto para este mes basándose en el período de la natillera
      const anioCorrecto = calcularAnioMes(
        nuevoMes,
        mesInicio.value,
        mesFin.value,
        anioNatillera.value
      )
      // Verificar primero con datos locales si faltan cuotas
      const cuotasActuales = cuotasStore.cuotas
      const faltanCuotas = verificarCuotasFaltantes(cuotasActuales, nuevoMes, anioCorrecto)
      
      if (faltanCuotas) {
        const result = await cuotasStore.generarCuotasFaltantes(id, nuevoMes, anioCorrecto)
        if (result.success && result.cuotasGeneradas > 0) {
          console.log(`✅ ${result.cuotasGeneradas} cuotas generadas automáticamente para el mes ${nuevoMes}`)
          // Recargar cuotas (skip mora porque son cuotas nuevas)
          await cuotasStore.fetchCuotasNatillera(id, { skipMoraUpdate: true })
        }
      }
    } catch (error) {
      console.error('Error en generación automática:', error)
    } finally {
      generandoCuotas.value = false
    }
    
    // Recalcular sanciones en segundo plano si están activadas
    if (sancionesActivas.value) {
      recalcularSancionesMes() // Sin await para no bloquear
    }
  }
})

// Cuando cambia el mes en el formulario, buscar fechas existentes
watch(() => formCuotas.mes, async (nuevoMes) => {
  if (nuevoMes && modalGenerarCuotas.value) {
    await cargarFechasDelMes(nuevoMes)
  }
})

// Cuando se muestran los filtros, enfocar la barra de búsqueda
watch(mostrarFiltros, (mostrar) => {
  if (mostrar) {
    // Usar setTimeout para esperar a que termine la animación del Transition
    setTimeout(() => {
      if (inputBusquedaRef.value) {
        inputBusquedaRef.value.focus()
      }
    }, 350) // Esperar un poco más que la duración de la animación (300ms)
  }
})

// Cuando cambia el tipo de filtro, mantener los filtros actuales
// El usuario puede usar "Todos" para resetear ambos filtros

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

// Función para recalcular sanciones del mes actual
async function recalcularSancionesMes() {
  if (!mesSeleccionado.value) return
  
  // Si las sanciones no están activadas, no calcular
  if (!sancionesActivas.value) {
    // Limpiar sanciones dinámicas si están desactivadas
    sancionesDinamicas.value = {}
    return
  }
  
  // Calcular el año correcto para este mes basándose en el período de la natillera
  const anioCorrecto = calcularAnioMes(
    mesSeleccionado.value,
    mesInicio.value,
    mesFin.value,
    anioNatillera.value
  )
  
  // Obtener las cuotas del mes actual
  const cuotasDelMes = cuotasStore.cuotas.filter(c => {
    if (!c.fecha_limite) return false
    const fecha = new Date(c.fecha_limite)
    const mes = fecha.getMonth() + 1
    const anio = fecha.getFullYear()
    return mes === mesSeleccionado.value && anio === anioCorrecto
  })
  
  if (cuotasDelMes.length === 0) return
  
  // Recalcular sanciones dinámicas para las cuotas del mes
  const resultSanciones = await cuotasStore.calcularSancionesTotales(id, cuotasDelMes)
  if (resultSanciones.success) {
    // Actualizar solo las sanciones de las cuotas del mes actual
    Object.keys(resultSanciones.sanciones || {}).forEach(cuotaId => {
      sancionesDinamicas.value[cuotaId] = resultSanciones.sanciones[cuotaId]
    })
    console.log('💰 Sanciones recalculadas para el mes:', Object.keys(resultSanciones.sanciones || {}).length, 'cuotas')
  }
}

// Obtener la sanción dinámica de una cuota (calculada en tiempo real)
function getSancionCuota(cuota) {
  // Si las sanciones no están activadas, retornar 0
  if (!sancionesActivas.value) return 0
  if (!cuota) return 0
  
  // Para cuotas en mora, usar la sanción calculada dinámicamente
  if (cuota.estado === 'mora') {
    return sancionesDinamicas.value[cuota.id] || cuota.valor_multa || 0
  }
  
  // Para cuotas con pago parcial que tienen valor_multa guardado (sanción pendiente),
  // seguir considerando la sanción hasta que se pague completamente
  // Esto cubre el caso de cuotas que estaban en mora y se les hizo un pago parcial
  if (cuota.valor_multa && cuota.valor_multa > 0) {
    const totalConSancion = (cuota.valor_cuota || 0) + cuota.valor_multa
    // Solo retornar la sanción si aún no se ha pagado el total
    if ((cuota.valor_pagado || 0) < totalConSancion) {
      return cuota.valor_multa
    }
  }
  
  return 0
}

// Función para obtener la sanción (pendiente o pagada) de una cuota
// Detecta cuando hay una sanción basándose en valor_multa o en el sobrepago
function getSancionCuotaDetalle(cuota) {
  if (!cuota) return 0
  
  const valorCuota = cuota.valor_cuota || 0
  const valorPagado = cuota.valor_pagado || 0
  const valorMulta = cuota.valor_multa || 0
  
  // Si hay valor_multa guardado, usarlo
  if (valorMulta > 0) {
    return valorMulta
  }
  
  // Si el valor pagado es mayor que el valor de la cuota, la diferencia es la sanción pagada
  // Esto cubre el caso cuando una cuota se pagó con sanción pero no quedó registrado en valor_multa
  if (valorPagado > valorCuota) {
    return valorPagado - valorCuota
  }
  
  // Para cuotas en mora, usar la sanción calculada dinámicamente
  if (cuota.estado === 'mora') {
    return sancionesDinamicas.value[cuota.id] || 0
  }
  
  // Para cuotas pendientes/parciales, verificar si hay sanción pendiente
  if (sancionesActivas.value) {
    const sancion = getSancionCuota(cuota)
    if (sancion > 0) {
      return sancion
    }
  }
  
  return 0
}

// Obtener el total a pagar de una cuota (valor_cuota + sanción - valor_pagado)
function getTotalAPagar(cuota) {
  if (!cuota) return 0
  const sancion = getSancionCuota(cuota)
  return (cuota.valor_cuota || 0) + sancion - (cuota.valor_pagado || 0)
}

// Calcular días en mora desde fecha_limite
// Función para verificar si una cuota tiene una anotación de ajuste
function tieneAjuste(cuota) {
  if (!cuota.descripcion) return false
  return cuota.descripcion.includes('Ajuste de valor') || cuota.descripcion.includes('Cuota ajustada')
}

// Función para obtener el texto de ajuste de una cuota
function getTextoAjuste(cuota) {
  if (!tieneAjuste(cuota)) return null
  // Extraer todas las anotaciones de ajuste de la descripción
  const descripcion = cuota.descripcion
  if (!descripcion) return null
  
  // Separar por | para obtener todas las anotaciones
  const partes = descripcion.split('|').map(p => p.trim())
  
  // Filtrar solo las partes que son anotaciones de ajuste
  const anotaciones = partes.filter(parte => 
    parte.includes('Ajuste de valor') || parte.includes('Cuota ajustada')
  )
  
  // Si hay múltiples anotaciones, mostrarlas todas separadas por saltos de línea
  if (anotaciones.length > 0) {
    return anotaciones.join('\n\n')
  }
  
  // Si no se encontraron anotaciones específicas, devolver la descripción completa
  return descripcion
}

function getDiasMora(cuota) {
  if (!cuota || cuota.estado !== 'mora') return 0
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // Usar fecha_limite como referencia (fecha desde la cual está en mora)
  const fechaReferencia = cuota.fecha_limite
  if (!fechaReferencia) return 0
  
  let fechaLimite
  if (typeof fechaReferencia === 'string') {
    const [anio, mes, dia] = fechaReferencia.split('-').map(Number)
    fechaLimite = new Date(anio, mes - 1, dia)
  } else {
    fechaLimite = new Date(fechaReferencia)
  }
  fechaLimite.setHours(0, 0, 0, 0)
  
  const diasMora = Math.floor((hoy - fechaLimite) / (1000 * 60 * 60 * 24))
  return Math.max(0, diasMora)
}

function getAvatarUrl(seed, avatarSeed = null, style = 'adventurer') {
  // Usar DiceBear Avatars con el estilo seleccionado
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  const avatarStyle = style || 'adventurer'
  
  // Colores de fondo según el estilo
  const backgroundColors = {
    'adventurer': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'avataaars': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'big-smile': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'bottts': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'lorelei': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'micah': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'miniavs': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'open-peeps': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'personas': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf'
  }
  
  const bgColors = backgroundColors[avatarStyle] || backgroundColors['adventurer']
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodedSeed}&backgroundColor=${bgColors}`
}

function formatDate(date) {
  if (!date) return ''
  // Si la fecha viene como string YYYY-MM-DD, parsearla manualmente para evitar problemas de zona horaria
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = date.split('-').map(Number)
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
  }
  // Si viene como objeto Date o string ISO, usar el método tradicional
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

async function reenviarComprobantePorCodigo(codigoComprobante, valorPagado) {
  if (!cuotaDetalle.value || !codigoComprobante) return
  
  // Crear un objeto cuota temporal con el código de comprobante del historial
  const cuotaTemporal = {
    ...cuotaDetalle.value,
    codigo_comprobante: codigoComprobante,
    valor_pagado: valorPagado
  }
  
  // Usar la función existente de reenviar comprobante
  await reenviarComprobante(cuotaTemporal)
}

async function abrirModalDetalleCuota(cuota) {
  cuotaDetalle.value = cuota
  modalDetalleCuota.value = true
  // Cargar historial de pagos si la cuota tiene pagos
  if (cuota && (cuota.valor_pagado > 0 || cuota.codigo_comprobante)) {
    await cargarHistorialPagosCuota(cuota.id)
  } else {
    historialPagosCuota.value = []
  }
}

async function cargarHistorialPagosCuota(cuotaId) {
  cargandoHistorialPagos.value = true
  historialPagosCuota.value = []
  
  try {
    // Obtener el historial de comprobantes de la cuota
    const { data: historial, error } = await supabase
      .from('historial_comprobantes')
      .select('*')
      .eq('cuota_id', cuotaId)
      .order('fecha_actualizacion', { ascending: false })
    
    if (error) {
      console.error('Error cargando historial de pagos:', error)
      historialPagosCuota.value = []
      return
    }
    
    // Construir el array de pagos
    const pagos = []
    const codigosAgregados = new Set()
    
    // SIEMPRE agregar el pago actual primero si existe
    if (cuotaDetalle.value && cuotaDetalle.value.codigo_comprobante && cuotaDetalle.value.valor_pagado > 0) {
      const codigoActual = cuotaDetalle.value.codigo_comprobante
      pagos.push({
        codigo_comprobante: codigoActual,
        valor_pagado: cuotaDetalle.value.valor_pagado,
        fecha_actualizacion: cuotaDetalle.value.fecha_pago || cuotaDetalle.value.updated_at || new Date().toISOString(),
        es_actual: true,
        motivo: 'pago_registrado'
      })
      codigosAgregados.add(codigoActual)
    }
    
    // Agregar los pagos del historial (excluyendo el actual si ya está agregado)
    if (historial && historial.length > 0) {
      historial.forEach(registro => {
        // Agregar el código anterior si no está ya agregado (para evitar duplicar el actual)
        if (registro.codigo_comprobante_anterior && !codigosAgregados.has(registro.codigo_comprobante_anterior)) {
          // Si hay un código nuevo, significa que fue una modificación
          const esModificacion = registro.codigo_comprobante_nuevo && 
                                 registro.codigo_comprobante_nuevo !== registro.codigo_comprobante_anterior
          
          pagos.push({
            codigo_comprobante: registro.codigo_comprobante_anterior,
            valor_pagado: registro.valor_pagado_anterior,
            fecha_actualizacion: registro.fecha_actualizacion,
            es_actual: false,
            es_modificacion: esModificacion,
            motivo: registro.motivo || 'actualizacion_pago',
            codigo_nuevo: registro.codigo_comprobante_nuevo,
            valor_nuevo: registro.valor_pagado_nuevo
          })
          codigosAgregados.add(registro.codigo_comprobante_anterior)
        }
      })
    }
    
    // Ordenar por fecha (más reciente primero)
    pagos.sort((a, b) => {
      const fechaA = new Date(a.fecha_actualizacion)
      const fechaB = new Date(b.fecha_actualizacion)
      return fechaB - fechaA
    })
    
    historialPagosCuota.value = pagos
  } catch (e) {
    console.error('Error cargando historial de pagos:', e)
    historialPagosCuota.value = []
  } finally {
    cargandoHistorialPagos.value = false
  }
}

function abrirModalPago(cuota) {
  cuotaSeleccionada.value = cuota
  // Inicializar con el total a pagar completo (incluye cuota + sanciones)
  const totalAPagar = getTotalAPagar(cuota)
  formPago.valor = totalAPagar > 0 ? totalAPagar : 0
  modalPago.value = true
}

function abrirModalHistorialAjustes(cuota) {
  cuotaSeleccionada.value = cuota
  modalHistorialAjustes.value = true
}

// Función para parsear y formatear las anotaciones de ajuste
function obtenerAjustesFormateados(cuota) {
  if (!cuota || !cuota.descripcion) return []
  
  const descripcion = cuota.descripcion
  const partes = descripcion.split('|').map(p => p.trim())
  
  // Filtrar solo las partes que son anotaciones de ajuste
  const anotaciones = partes.filter(parte => 
    parte.includes('Ajuste de valor') || parte.includes('Cuota ajustada')
  )
  
  return anotaciones.map(anotacion => {
    const ajuste = {
      fecha: null,
      valorAnterior: null,
      valorNuevo: null,
      valorPagado: null,
      pendiente: null,
      diferencia: 0,
      tipo: null
    }
    
    // Extraer fecha (formato: DD/MM/YYYY)
    const fechaMatch = anotacion.match(/\((\d{2}\/\d{2}\/\d{4})\)/)
    if (fechaMatch) {
      ajuste.fecha = fechaMatch[1]
    }
    
    // Extraer valores según el tipo de ajuste
    if (anotacion.includes('Ajuste de valor')) {
      ajuste.tipo = 'ajuste'
      // Formato: "Ajuste de valor: Cuota original $X → $Y. Pagado: $Z (fecha)"
      // o "Ajuste de valor: Cuota original $X → $Y. Pagado: $Z, Pendiente: $W (fecha)"
      // o "Ajuste de valor: Cuota original $X → $Y (fecha)"
      
      const valorAnteriorMatch = anotacion.match(/original \$([\d.,]+)/)
      const valorNuevoMatch = anotacion.match(/→ \$([\d.,]+)/)
      const valorPagadoMatch = anotacion.match(/Pagado: \$([\d.,]+)/)
      const pendienteMatch = anotacion.match(/Pendiente: \$([\d.,]+)/)
      
      if (valorAnteriorMatch) {
        const valorStr = valorAnteriorMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.valorAnterior = parseFloat(valorStr) || 0
      }
      if (valorNuevoMatch) {
        const valorStr = valorNuevoMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.valorNuevo = parseFloat(valorStr) || 0
      }
      if (valorPagadoMatch) {
        const valorStr = valorPagadoMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.valorPagado = parseFloat(valorStr) || 0
      }
      if (pendienteMatch) {
        const valorStr = pendienteMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.pendiente = parseFloat(valorStr) || 0
      }
    } else if (anotacion.includes('Cuota ajustada')) {
      ajuste.tipo = 'ajustada'
      // Formato: "Cuota ajustada: Valor original $X → $Y. Pendiente: $Z (fecha)"
      
      const valorAnteriorMatch = anotacion.match(/original \$([\d.,]+)/)
      const valorNuevoMatch = anotacion.match(/→ \$([\d.,]+)/)
      const pendienteMatch = anotacion.match(/Pendiente: \$([\d.,]+)/)
      
      if (valorAnteriorMatch) {
        const valorStr = valorAnteriorMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.valorAnterior = parseFloat(valorStr) || 0
      }
      if (valorNuevoMatch) {
        const valorStr = valorNuevoMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.valorNuevo = parseFloat(valorStr) || 0
      }
      if (pendienteMatch) {
        const valorStr = pendienteMatch[1].replace(/\./g, '').replace(',', '.')
        ajuste.pendiente = parseFloat(valorStr) || 0
      }
    }
    
    // Calcular diferencia
    if (ajuste.valorAnterior !== null && ajuste.valorNuevo !== null) {
      ajuste.diferencia = ajuste.valorNuevo - ajuste.valorAnterior
    }
    
    return ajuste
  }).reverse() // Mostrar el más reciente primero
}

function abrirModalEditar(cuota) {
  cuotaEditando.value = cuota
  // Si hay un pago parcial, cargar el valor pagado; de lo contrario, cargar el valor de la cuota
  if (cuota.valor_pagado && cuota.valor_pagado > 0) {
    formEditarCuota.valor_cuota = cuota.valor_pagado
  } else {
    formEditarCuota.valor_cuota = cuota.valor_cuota || 0
  }
  modalEditarCuota.value = true
}

// Formulario para editar socio
const formSocio = reactive({
  nombre: '',
  documento: '',
  email: '',
  telefono: '',
  valor_cuota: 50000,
  periodicidad: 'mensual',
  avatar_seed: '',
  avatar_style: 'adventurer'
})

// Lista de seeds para avatares predefinidos
const avatarSeeds = [
  'Sofia', 'Luna', 'Valentina', 'Camila', 'Isabella',
  'Mariana', 'Lucia', 'Gabriela', 'Daniela', 'Paula',
  'Andrea', 'Carolina', 'Natalia', 'Alejandra', 'Victoria',
  'Fernanda', 'Catalina', 'Sara', 'Laura', 'Maria',
  'Ana', 'Elena', 'Rosa', 'Carmen', 'Julia',
  'Claudia', 'Patricia', 'Monica', 'Sandra', 'Diana',
  'Adriana', 'Gloria', 'Teresa', 'Liliana', 'Rocio',
  'Paola', 'Angelica', 'Marcela', 'Lorena', 'Viviana',
  'Johana', 'Tatiana', 'Yolanda', 'Pilar', 'Beatriz',
  'Clara', 'Marta', 'Silvia', 'Esperanza', 'Blanca',
  'Isabel', 'Cristina', 'Mercedes', 'Dolores', 'Amparo',
  'Angela', 'Cecilia', 'Elisa', 'Francisca', 'Gisela',
  'Helena', 'Ines', 'Jimena', 'Karina', 'Leticia',
  'Magdalena', 'Nora', 'Olga', 'Rebeca', 'Susana',
  'Ursula', 'Veronica', 'Wendy', 'Ximena', 'Zoe',
  'Alicia', 'Bianca', 'Carla', 'Estefania', 'Fabiola',
  'Carlos', 'Juan', 'Miguel', 'Andres', 'Luis',
  'Jorge', 'David', 'Daniel', 'Felipe', 'Santiago',
  'Sebastian', 'Alejandro', 'Ricardo', 'Fernando', 'Diego',
  'Pablo', 'Eduardo', 'Gustavo', 'Oscar', 'Sergio',
  'Roberto', 'Javier', 'Antonio', 'Manuel', 'Pedro',
  'Francisco', 'Raul', 'Mario', 'Jaime', 'Hector',
  'Alberto', 'Cesar', 'Hugo', 'Ivan', 'Rodrigo',
  'Enrique', 'Gabriel', 'Nicolas', 'Camilo', 'Fabian',
  'Leonardo', 'Cristian', 'Mauricio', 'Julian', 'Arturo',
  'Victor', 'Guillermo', 'Alfonso', 'Ernesto', 'Ramon',
  'Emilio', 'Rafael', 'Alfredo', 'Jose', 'Esteban',
  'Adrian', 'Bruno', 'Cristobal', 'Dario', 'Federico',
  'Gonzalo', 'Hernan', 'Ignacio', 'Joaquin', 'Kevin',
  'Lucas', 'Mateo', 'Orlando', 'Patricio', 'Ramiro',
  'Samuel', 'Tomas', 'Ulises', 'Valentin', 'Walter',
  'Xavier', 'Yago', 'Zacarias', 'Agustin', 'Benjamin',
  'Domingo', 'Efrain', 'Felix', 'Gerardo', 'Horacio'
]

// Periodicidad de la natillera actual
const periodicidadNatillera = computed(() => {
  return natillerasStore.natilleraActual?.periodicidad || 'mensual'
})

// Texto del label de cuota según periodicidad
const textoLabelCuota = computed(() => {
  const periodicidad = formSocio.periodicidad
  if (periodicidad === 'quincenal') {
    return 'Valor de la cuota quincenal'
  } else if (periodicidad === 'semanal') {
    return 'Valor de la cuota semanal'
  } else {
    return 'Valor de la cuota mensual'
  }
})

function verDetalleSocio(socioNatillera) {
  // Abrir modal de edición directamente
  editarSocio(socioNatillera)
}

function editarSocio(sn) {
  socioEditando.value = sn
  formSocio.nombre = sn.socio?.nombre || ''
  formSocio.documento = sn.socio?.documento || ''
  formSocio.email = sn.socio?.email || ''
  formSocio.telefono = sn.socio?.telefono || ''
  formSocio.valor_cuota = sn.valor_cuota_individual
  formSocio.periodicidad = sn.periodicidad || 'mensual'
  formSocio.avatar_seed = sn.socio?.avatar_seed || ''
  formSocio.avatar_style = sn.socio?.avatar_style || 'adventurer'
  mostrarAvatares.value = false
  mostrarContacto.value = false
  modalEditarSocio.value = true
}

function cerrarModalEditarSocio() {
  modalEditarSocio.value = false
  socioEditando.value = null
  errorSocio.value = ''
  estadoGuardadoSocio.value = ''
  mostrarContacto.value = false
  mostrarAvatares.value = false
  Object.assign(formSocio, {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 50000,
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer'
  })
}

// Formatear valor de cuota con separadores de miles
function formatearValorCuota(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

// Manejar input del valor de cuota
function handleValorCuotaInput(event) {
  const valorOriginal = event.target.value
  // Remover puntos (separadores de miles) y cualquier carácter no numérico
  const valorLimpio = valorOriginal.replace(/\./g, '').replace(/[^\d]/g, '')
  
  console.log('📝 Input de cuota (Cuotas.vue) - Valor original:', valorOriginal)
  console.log('📝 Input de cuota (Cuotas.vue) - Valor limpio:', valorLimpio)
  
  if (valorLimpio === '') {
    formSocio.valor_cuota = 0
    console.log('📝 Input de cuota (Cuotas.vue) - Valor final: 0 (vacío)')
  } else {
    // Usar parseFloat para manejar números grandes correctamente (parseInt tiene límites)
    const numero = parseFloat(valorLimpio)
    if (!isNaN(numero) && numero >= 0) {
      formSocio.valor_cuota = numero
      console.log('📝 Input de cuota (Cuotas.vue) - Valor final parseado:', numero, 'Tipo:', typeof numero)
      console.log('📝 Input de cuota (Cuotas.vue) - formSocio.valor_cuota actualizado a:', formSocio.valor_cuota)
    } else {
      console.warn('⚠️ Input de cuota (Cuotas.vue) - Valor no válido:', valorLimpio)
    }
  }
}

function seleccionarMontoCuota(event) {
  const input = event?.target
  if (!input || typeof input.select !== 'function') return
  setTimeout(() => input.select(), 0)
}

function seleccionarValorPago(event) {
  const input = event?.target || inputValorPagoRef.value
  if (!input || typeof input.select !== 'function') return
  
  // Seleccionar el texto del input
  setTimeout(() => input.select(), 0)
  
  // Hacer scroll para mantener el campo visible cuando aparece el teclado en móvil
  // Usamos nextTick para asegurar que el DOM esté actualizado
  nextTick(() => {
    // Delay para que el teclado aparezca primero en móvil
    setTimeout(() => {
      // Detectar si es móvil (pantalla pequeña o touch)
      const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window
      
      if (isMobile) {
        // Primero hacer scrollIntoView para llevar el input a la vista
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
        
        // Luego, después de un delay adicional, ajustar la posición considerando el teclado
        setTimeout(() => {
          // Usar Visual Viewport API si está disponible (más preciso)
          const viewport = window.visualViewport || window
          const viewportHeight = viewport.height || window.innerHeight
          const inputRect = input.getBoundingClientRect()
          
          // Altura estimada del teclado
          const estimatedKeyboardHeight = window.visualViewport 
            ? Math.max(window.innerHeight - viewportHeight, 250)
            : 300
          
          // Calcular el espacio disponible sobre el teclado
          const availableHeight = viewportHeight
          const desiredTop = 80 // Posición deseada desde arriba (80px de padding)
          
          // Si el input está muy abajo o dentro del área del teclado
          if (inputRect.top > (availableHeight - estimatedKeyboardHeight) || inputRect.top < desiredTop) {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop
            const inputTopRelative = inputRect.top + currentScroll
            const targetScroll = inputTopRelative - desiredTop
            
            window.scrollTo({
              top: Math.max(0, targetScroll),
              behavior: 'smooth'
            })
          }
        }, 500) // Delay adicional después del scrollIntoView inicial
      } else {
        // En desktop, usar scrollIntoView normal
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    }, 300) // Delay inicial para dar tiempo al teclado
  })
}

async function handleGuardarSocio() {
  errorSocio.value = ''
  estadoGuardadoSocio.value = 'guardando'

  if (socioEditando.value) {
    try {
      console.log('🟢 handleGuardarSocio - Iniciando guardado')
      console.log('🟢 socioEditando.value:', socioEditando.value)
      console.log('🟢 formSocio:', formSocio)
      
      // Actualizar cuota del socio en socios_natillera
      // Asegurar que el valor sea un número y se guarde exactamente como se ingresa
      const valorCuotaNumerico = typeof formSocio.valor_cuota === 'string' 
        ? parseFloat(formSocio.valor_cuota.replace(/\./g, '').replace(/[^\d.-]/g, '')) || 0
        : Number(formSocio.valor_cuota) || 0
      
      // Validar que el valor sea positivo
      if (valorCuotaNumerico <= 0) {
        errorSocio.value = 'El valor de la cuota debe ser mayor a cero'
        estadoGuardadoSocio.value = ''
        return
      }
      
      console.log('🟢 handleGuardarSocio - Actualizando socio')
      console.log('🟢 valor_cuota (formSocio):', formSocio.valor_cuota, 'Tipo:', typeof formSocio.valor_cuota)
      console.log('🟢 valorCuotaNumerico calculado:', valorCuotaNumerico, 'Tipo:', typeof valorCuotaNumerico)
      console.log('🟢 periodicidad:', formSocio.periodicidad)
      console.log('🟢 IMPORTANTE: El valor debe guardarse exactamente como se ingresa, sin modificaciones por periodicidad')
      
      const datosParaActualizar = {
        valor_cuota_individual: valorCuotaNumerico, // Valor exacto sin modificaciones
        periodicidad: formSocio.periodicidad
      }
      
      console.log('🟢 Datos para actualizar socios_natillera:', datosParaActualizar)
      console.log('🟢 ID del socio_natillera:', socioEditando.value.id)
      
      const result = await sociosStore.actualizarSocioNatillera(socioEditando.value.id, datosParaActualizar)
      
      console.log('🟢 Resultado de actualizarSocioNatillera:', result)

      // Actualizar datos del socio en la tabla socios (nombre, teléfono, email, documento, avatar)
      if (socioEditando.value.socio?.id) {
        const datosActualizados = {
          nombre: formSocio.nombre,
          telefono: formSocio.telefono || null,
          email: formSocio.email || null,
          documento: formSocio.documento || null
        }
        
        // Solo incluir avatar_seed si se seleccionó uno
        if (formSocio.avatar_seed) {
          datosActualizados.avatar_seed = formSocio.avatar_seed
        }
        
        // Incluir avatar_style si se seleccionó uno
        if (formSocio.avatar_style) {
          datosActualizados.avatar_style = formSocio.avatar_style
        }
        
        const resultDatos = await sociosStore.actualizarDatosSocio(
          socioEditando.value.socio.id, 
          datosActualizados,
          id // natilleraId
        )
        
        if (!resultDatos.success) {
          throw new Error(resultDatos.error || 'Error al actualizar los datos del socio')
        }
      }

      if (!result.success) {
        console.error('❌ Error al actualizar socio_natillera:', result.error)
        throw new Error(result.error || 'Error al actualizar la información del socio')
      }

      console.log('✅ Socio_natillera actualizado correctamente')
      
      if (result.success) {
        // Cambiar estado a "generando cuotas"
        estadoGuardadoSocio.value = 'generando'
        
        // Usar el mes seleccionado en la vista de cuotas (como si se usara el menú de generar cuotas)
        const mesParaGenerar = mesSeleccionado.value || (new Date().getMonth() + 1)
        
        // Obtener días de gracia de la natillera
        const { data: natillera } = await supabase
          .from('natilleras')
          .select('reglas_multas, mes_inicio, mes_fin, anio, anio_inicio')
          .eq('id', id)
          .single()
        
        const diasGracia = natillera?.reglas_multas?.dias_gracia || 3
        
        // Usar anio_inicio como año base, con fallback a anio si no existe
        const anioBase = natillera?.anio_inicio !== null && natillera?.anio_inicio !== undefined 
          ? Number(natillera.anio_inicio) 
          : (natillera?.anio !== null && natillera?.anio !== undefined 
            ? Number(natillera.anio) 
            : anioNatillera.value)
        
        // Calcular el año correcto para este mes basándose en el período de la natillera
        const anioParaGenerar = calcularAnioMes(
          mesParaGenerar,
          natillera?.mes_inicio || mesInicio.value,
          natillera?.mes_fin || mesFin.value,
          anioBase
        )
        
        // Calcular fechas por defecto para el mes seleccionado
        const fechasPorDefecto = calcularFechasPorDefecto(mesParaGenerar, anioParaGenerar, diasGracia)
        
        // Obtener el nombre del mes para el label
        const mesLabel = todosMeses.find(m => m.value === mesParaGenerar)?.label || ''
        
        // Función para calcular fecha de vencimiento (sumando días de gracia a la fecha límite)
        function calcularFechaVencimiento(fechaLimiteStr) {
          if (!fechaLimiteStr) return fechaLimiteStr
          // Parsear la fecha manualmente para evitar problemas de zona horaria
          const [anio, mes, dia] = fechaLimiteStr.split('-').map(Number)
          const fechaLimite = new Date(anio, mes - 1, dia)
          fechaLimite.setDate(fechaLimite.getDate() + diasGracia)
          // Formatear manualmente para evitar problemas de zona horaria
          const year = fechaLimite.getFullYear()
          const month = String(fechaLimite.getMonth() + 1).padStart(2, '0')
          const day = String(fechaLimite.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        // Generar cuotas solo para el socio editado (mismo proceso que el menú "Generar Cuotas")
        try {
          const resultGenerar = await cuotasStore.generarCuotasPeriodo(
            id,
            {
              mensual: { 
                vencimiento: calcularFechaVencimiento(fechasPorDefecto.fecha_quincena2), 
                limite: fechasPorDefecto.fecha_quincena2 
              },
              quincena1: { 
                vencimiento: calcularFechaVencimiento(fechasPorDefecto.fecha_quincena1), 
                limite: fechasPorDefecto.fecha_quincena1 
              },
              quincena2: { 
                vencimiento: calcularFechaVencimiento(fechasPorDefecto.fecha_quincena2), 
                limite: fechasPorDefecto.fecha_quincena2 
              }
            },
            mesLabel,
            mesParaGenerar,
            anioParaGenerar,
            socioEditando.value.id // Solo para el socio editado
          )
          
          if (resultGenerar.success) {
            console.log(`✅ Cuotas regeneradas para el socio ${formSocio.nombre} en ${mesLabel} ${anioParaGenerar}`)
          }
        } catch (error) {
          console.error('Error regenerando cuotas:', error)
          // No mostrar error al usuario, solo loguear
        }
        
        // Recargar datos de los socios para actualizar la vista
        await sociosStore.fetchSociosNatillera(id)
        // Recargar cuotas para ver los cambios (importante: después de actualizar socios)
        await cuotasStore.fetchCuotasNatillera(id)
        cargarConteoSocios() // Recargar conteo de socios también
        estadoGuardadoSocio.value = ''
        cerrarModalEditarSocio()
      } else {
        estadoGuardadoSocio.value = ''
        errorSocio.value = result.error
      }
    } catch (error) {
      console.error('Error en handleGuardarSocio:', error)
      estadoGuardadoSocio.value = ''
      errorSocio.value = 'Error al guardar los cambios. Por favor, intenta nuevamente.'
    }
  } else {
    estadoGuardadoSocio.value = ''
  }
}

// Manejar input del valor de la cuota en edición
function handleValorCuotaEditarInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    formEditarCuota.valor_cuota = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      formEditarCuota.valor_cuota = numero
    }
  }
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

async function guardarEdicionCuota() {
  if (!cuotaEditando.value) return
  
  try {
    const nuevoValor = formEditarCuota.valor_cuota || 0
    const valorCuota = cuotaEditando.value.valor_cuota || 0
    const tienePagoParcial = cuotaEditando.value.valor_pagado && cuotaEditando.value.valor_pagado > 0
    const valorPagadoAnterior = cuotaEditando.value.valor_pagado || 0
    
    let datosActualizar = {}
    
    // Si hay un pago parcial, actualizar valor_pagado (reemplazar, no sumar)
    if (tienePagoParcial) {
      const nuevoValorPagado = nuevoValor
      // Calcular el nuevo estado basado en el valor pagado (incluyendo sanción)
      const sancion = getSancionCuota(cuotaEditando.value)
      const totalAPagar = valorCuota + sancion
      let nuevoEstado
      
      if (nuevoValorPagado >= totalAPagar) {
        nuevoEstado = 'pagada'
      } else if (nuevoValorPagado > 0) {
        // Pago parcial: calcular estado según fecha límite y fecha de vencimiento
        // Según REGLAS.md: cuotas con pago parcial siguen las mismas reglas de estado basadas en fecha
        if (!cuotaEditando.value.fecha_limite) {
          // Si no hay fecha límite, usar 'parcial' como fallback
          nuevoEstado = 'parcial'
        } else {
          const fechaActual = new Date()
          fechaActual.setHours(0, 0, 0, 0)
          
          // Parsear fecha_limite correctamente
          let fechaLimite
          if (typeof cuotaEditando.value.fecha_limite === 'string' && cuotaEditando.value.fecha_limite.includes('-')) {
            const [anio, mes, dia] = cuotaEditando.value.fecha_limite.split('-').map(Number)
            fechaLimite = new Date(anio, mes - 1, dia)
          } else {
            fechaLimite = new Date(cuotaEditando.value.fecha_limite)
          }
          fechaLimite.setHours(0, 0, 0, 0)
          
          // Obtener fecha_vencimiento
          let fechaVencimiento
          if (cuotaEditando.value.fecha_vencimiento) {
            if (typeof cuotaEditando.value.fecha_vencimiento === 'string' && cuotaEditando.value.fecha_vencimiento.includes('-')) {
              const [anio, mes, dia] = cuotaEditando.value.fecha_vencimiento.split('-').map(Number)
              fechaVencimiento = new Date(anio, mes - 1, dia)
            } else {
              fechaVencimiento = new Date(cuotaEditando.value.fecha_vencimiento)
            }
          } else {
            // Si no existe, usar fecha_limite como fallback
            fechaVencimiento = new Date(fechaLimite)
          }
          fechaVencimiento.setHours(0, 0, 0, 0)
          
          // Aplicar reglas de estado según fecha:
          // Programada: fecha_actual < fecha_limite
          if (fechaActual < fechaLimite) {
            nuevoEstado = 'programada'
          }
          // Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
          else if (fechaActual >= fechaLimite && fechaActual <= fechaVencimiento) {
            nuevoEstado = 'pendiente'
          }
          // En Mora: fecha_actual > fecha_vencimiento
          else if (fechaActual > fechaVencimiento) {
            nuevoEstado = 'mora'
          } else {
            // Fallback
            nuevoEstado = 'parcial'
          }
        }
      } else {
        // Si el valor pagado es 0, verificar la fecha de vencimiento
        const fechaActual = new Date()
        fechaActual.setHours(0, 0, 0, 0)
        
        if (cuotaEditando.value.fecha_limite) {
          // Parsear fecha_limite correctamente
          let fechaLimite
          if (typeof cuotaEditando.value.fecha_limite === 'string' && cuotaEditando.value.fecha_limite.includes('-')) {
            const [anio, mes, dia] = cuotaEditando.value.fecha_limite.split('-').map(Number)
            fechaLimite = new Date(anio, mes - 1, dia)
          } else {
            fechaLimite = new Date(cuotaEditando.value.fecha_limite)
          }
          fechaLimite.setHours(0, 0, 0, 0)
          
          // Obtener fecha_vencimiento
          let fechaVencimiento
          if (cuotaEditando.value.fecha_vencimiento) {
            if (typeof cuotaEditando.value.fecha_vencimiento === 'string' && cuotaEditando.value.fecha_vencimiento.includes('-')) {
              const [anio, mes, dia] = cuotaEditando.value.fecha_vencimiento.split('-').map(Number)
              fechaVencimiento = new Date(anio, mes - 1, dia)
            } else {
              fechaVencimiento = new Date(cuotaEditando.value.fecha_vencimiento)
            }
          } else {
            fechaVencimiento = new Date(fechaLimite)
          }
          fechaVencimiento.setHours(0, 0, 0, 0)
          
          // Aplicar reglas de estado según fecha
          if (fechaActual < fechaLimite) {
            nuevoEstado = 'programada'
          } else if (fechaActual >= fechaLimite && fechaActual <= fechaVencimiento) {
            nuevoEstado = 'pendiente'
          } else if (fechaActual > fechaVencimiento) {
            nuevoEstado = 'mora'
          } else {
            nuevoEstado = 'pendiente'
          }
        } else {
          // Si no hay fecha de vencimiento, mantener como pendiente
          nuevoEstado = 'pendiente'
        }
      }
      
      // Si el valor pagado cambió, generar un nuevo código de comprobante
      let nuevoCodigoComprobante = null
      const codigoAnterior = cuotaEditando.value.codigo_comprobante
      
      if (nuevoValorPagado !== valorPagadoAnterior && nuevoValorPagado > 0) {
        // Generar nuevo código de comprobante cuando se modifica el pago
        try {
          nuevoCodigoComprobante = generarCodigoComprobante()
          // Verificar que el código no exista (máximo 5 intentos)
          let intentos = 0
          let codigoUnico = false
          while (!codigoUnico && intentos < 5) {
            const { data: codigoExistente } = await supabase
              .from('cuotas')
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
        } catch (e) {
          console.warn('No se pudo generar código de comprobante:', e.message)
          nuevoCodigoComprobante = null
        }
      }
      
      // Actualizar fecha_pago cuando se modifica el valor pagado
      // Si el nuevo valor pagado es mayor que 0, actualizar la fecha de pago
      // Si se reduce a 0, eliminar la fecha de pago
      let fechaPagoActualizada = null
      if (nuevoValorPagado > 0) {
        fechaPagoActualizada = new Date().toISOString()
      } else {
        fechaPagoActualizada = null
      }
      
      datosActualizar = {
        valor_pagado: nuevoValorPagado,
        estado: nuevoEstado,
        fecha_pago: fechaPagoActualizada
      }
      
      // Agregar el nuevo código de comprobante si se generó
      if (nuevoCodigoComprobante) {
        datosActualizar.codigo_comprobante = nuevoCodigoComprobante
        
        // Guardar en historial si había un código anterior
        if (codigoAnterior) {
          try {
            await supabase
              .from('historial_comprobantes')
              .insert({
                cuota_id: cuotaEditando.value.id,
                codigo_comprobante_anterior: codigoAnterior,
                codigo_comprobante_nuevo: nuevoCodigoComprobante,
                valor_pagado_anterior: valorPagadoAnterior,
                valor_pagado_nuevo: nuevoValorPagado,
                motivo: 'actualizacion_pago',
                fecha_actualizacion: new Date().toISOString()
              })
          } catch (e) {
            // Si la tabla no existe, continuar sin guardar historial
            console.warn('No se pudo guardar en historial de comprobantes:', e.message)
          }
        }
      }
    } else {
      // Si no hay pago parcial, actualizar el valor de la cuota
      datosActualizar = {
        valor_cuota: nuevoValor
      }
    }
    
    const result = await cuotasStore.actualizarCuota(cuotaEditando.value.id, datosActualizar)
    
    if (result.success) {
      modalEditarCuota.value = false
      cuotaEditando.value = null
      // Recargar cuotas para asegurar que todo esté actualizado
      await cuotasStore.fetchCuotasNatillera(id)
      
      // Recalcular sanciones dinámicas después de actualizar la cuota
      await recalcularSancionesMes()
    } else {
      alert('Error al actualizar la cuota: ' + (result.error || 'Error desconocido'))
    }
  } catch (error) {
    console.error('Error guardando edición:', error)
    alert('Error al guardar los cambios. Por favor, intenta nuevamente.')
  }
}

async function handleGenerarCuotas() {
  // Validar que si es un solo socio, esté seleccionado
  if (formCuotas.tipoGeneracion === 'unSocio' && !formCuotas.socioSeleccionado) {
    alert('Por favor selecciona un socio')
    return
  }

  // Obtener días de gracia de la natillera
  const { data: natillera, error: natilleraError } = await supabase
    .from('natilleras')
    .select('reglas_multas, mes_inicio, mes_fin, anio, anio_inicio')
    .eq('id', id)
    .single()
  
  if (natilleraError) {
    alert('Error al obtener configuración de la natillera: ' + natilleraError.message)
    return
  }
  
  const reglasMultas = natillera.reglas_multas || {}
  const diasGracia = reglasMultas.dias_gracia || 3

  const mesLabel = todosMeses.find(m => m.value === formCuotas.mes)?.label || ''
  
  // Usar anio_inicio como año base, con fallback a anio si no existe
  const anioBase = natillera.anio_inicio !== null && natillera.anio_inicio !== undefined 
    ? Number(natillera.anio_inicio) 
    : (natillera.anio !== null && natillera.anio !== undefined 
      ? Number(natillera.anio) 
      : anioNatillera.value)
  
  // Calcular el año correcto para este mes basándose en el período de la natillera
  const anioCorrecto = calcularAnioMes(
    formCuotas.mes,
    natillera.mes_inicio || mesInicio.value,
    natillera.mes_fin || mesFin.value,
    anioBase
  )
  
  // Calcular fecha de vencimiento (sumando días de gracia a la fecha límite)
  function calcularFechaVencimiento(fechaLimiteStr) {
    if (!fechaLimiteStr) return fechaLimiteStr
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [anio, mes, dia] = fechaLimiteStr.split('-').map(Number)
    const fechaLimite = new Date(anio, mes - 1, dia)
    fechaLimite.setDate(fechaLimite.getDate() + diasGracia)
    // Formatear manualmente para evitar problemas de zona horaria
    const year = fechaLimite.getFullYear()
    const month = String(fechaLimite.getMonth() + 1).padStart(2, '0')
    const day = String(fechaLimite.getDate()).padStart(2, '0')
    const fechaVencimiento = `${year}-${month}-${day}`
    console.log(`📅 Calculando fecha vencimiento: ${fechaLimiteStr} + ${diasGracia} días = ${fechaVencimiento}`)
    return fechaVencimiento
  }
  
  // Calcular fechas de vencimiento
  const fechaVencimientoMensual = calcularFechaVencimiento(formCuotas.fecha_quincena2)
  const fechaVencimientoQ1 = calcularFechaVencimiento(formCuotas.fecha_quincena1)
  const fechaVencimientoQ2 = calcularFechaVencimiento(formCuotas.fecha_quincena2)
  
  console.log('📋 Fechas calculadas:', {
    mensual: { vencimiento: fechaVencimientoMensual, limite: formCuotas.fecha_quincena2 },
    quincena1: { vencimiento: fechaVencimientoQ1, limite: formCuotas.fecha_quincena1 },
    quincena2: { vencimiento: fechaVencimientoQ2, limite: formCuotas.fecha_quincena2 },
    diasGracia,
    mes: formCuotas.mes,
    anio: anioCorrecto
  })
  
  // La fecha mensual es la misma que la 2da quincena
  const result = await cuotasStore.generarCuotasPeriodo(
    id,
    {
      mensual: { 
        vencimiento: fechaVencimientoMensual, 
        limite: formCuotas.fecha_quincena2 
      },
      quincena1: { 
        vencimiento: fechaVencimientoQ1, 
        limite: formCuotas.fecha_quincena1 
      },
      quincena2: { 
        vencimiento: fechaVencimientoQ2, 
        limite: formCuotas.fecha_quincena2 
      }
    },
    mesLabel,
    formCuotas.mes,
    anioCorrecto,
    formCuotas.tipoGeneracion === 'unSocio' ? formCuotas.socioSeleccionado : null
  )

  if (result.success) {
    modalGenerarCuotas.value = false
    formCuotas.fecha_quincena1 = ''
    formCuotas.fecha_quincena2 = ''
    // Cambiar al mes generado
    mesSeleccionado.value = formCuotas.mes
    // Recargar cuotas y conteo (skip mora porque son cuotas nuevas)
    cuotasStore.fetchCuotasNatillera(id, { skipMoraUpdate: true })
    cargarConteoSocios()
  } else {
    alert('Error: ' + result.error)
  }
}

// Función para mostrar la fecha en formato corto dd/mm/yyyy
function formatearFechaCorta(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

async function handleRegistrarPago() {
  if (!cuotaSeleccionada.value) return

  const valorPagado = formPago.valor
  const socioNombre = cuotaSeleccionada.value.socio_natillera?.socio?.nombre
  const socioTelefono = cuotaSeleccionada.value.socio_natillera?.socio?.telefono
  const descripcionCuota = cuotaSeleccionada.value.descripcion || formatDate(cuotaSeleccionada.value.fecha_limite)

  const result = await cuotasStore.registrarPago(
    cuotaSeleccionada.value.id,
    valorPagado
  )

  if (result.success) {
    // Obtener la cuota actualizada para saber si es parcial o completa
    const cuotaActualizada = result.data
    const valorCuota = cuotaSeleccionada.value.valor_cuota
    const valorPagadoAnterior = cuotaSeleccionada.value.valor_pagado || 0
    const valorPagadoTotal = cuotaActualizada?.valor_pagado || (valorPagadoAnterior + valorPagado)
    // Considerar la sanción al calcular el total a pagar
    const sancion = getSancionCuota(cuotaActualizada || cuotaSeleccionada.value)
    const totalAPagar = valorCuota + sancion
    const valorPendiente = totalAPagar - valorPagadoTotal
    const esParcial = valorPendiente > 0 && valorPagadoTotal < totalAPagar
    
    // Detectar si había un pago parcial anterior y ahora se completa
    const teniaPagoParcial = valorPagadoAnterior > 0 && valorPagadoAnterior < totalAPagar
    const seCompletoPago = !esParcial && teniaPagoParcial
    
    // Obtener el código del comprobante
    const codigoComprobante = cuotaActualizada?.codigo_comprobante || null
    console.log('Código de comprobante obtenido:', codigoComprobante)
    console.log('Cuota actualizada completa:', cuotaActualizada)
    
    // Guardar info del pago para el modal de confirmación
    pagoRegistrado.value = {
      cuotaId: cuotaSeleccionada.value.id, // ID de la cuota para auditoría
      socioNombre,
      socioTelefono,
      valor: valorPagado, // Valor del pago actual
      valorCuota,
      valorPagadoTotal, // Total acumulado pagado
      valorPendiente,
      esParcial,
      descripcionCuota,
      codigoComprobante, // Código único del comprobante
      fecha: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      // Información del pago parcial anterior (si existía)
      teniaPagoParcial: seCompletoPago,
      valorPagoAnterior: seCompletoPago ? valorPagadoAnterior : null,
      fechaPagoAnterior: seCompletoPago && cuotaSeleccionada.value.fecha_pago 
        ? new Date(cuotaSeleccionada.value.fecha_pago).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null
    }
    
    console.log('pagoRegistrado.value completo:', pagoRegistrado.value)
    
    modalPago.value = false
    modalConfirmacion.value = true
    cuotaSeleccionada.value = null
    
    // Recargar cuotas para actualizar el resumen
    await cuotasStore.fetchCuotasNatillera(id)
    
    // Recalcular sanciones dinámicas después de registrar el pago
    await recalcularSancionesMes()
  } else {
    alert('Error: ' + result.error)
  }
}

function generarImagenComprobante() {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const esParcial = pagoRegistrado.value?.esParcial || false
      const teniaPagoParcial = pagoRegistrado.value?.teniaPagoParcial || false
      const codigoComprobante = pagoRegistrado.value?.codigoComprobante
      const width = 480
      // Altura ajustada: más espacio si hay pago parcial o información de pago anterior
      let height = 680
      if (esParcial) {
        height = 790
      } else if (teniaPagoParcial) {
        height = 750 // Espacio para información de pago anterior
      }
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
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
      // "Comprobante de Pago" a la izquierda (grande, bold, blanco)
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Comprobante de Pago', 32, 52)
      
      // "natillerapp" a la derecha (pequeño, gris claro)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
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
      // Ajustar altura de la tarjeta según el contenido
      let cardHeight = 485
      if (esParcial) {
        cardHeight = 600
      } else if (teniaPagoParcial) {
        cardHeight = 550 // Espacio para información de pago anterior
      }
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
      const valorText = '$' + formatMoney(pagoRegistrado.value?.valor)
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
        console.log('Código dibujado en el comprobante:', codigoComprobante)
      } else {
        console.warn('No hay código de comprobante para dibujar')
      }
      
      // Si había un pago parcial anterior y se completó, mostrar información del pago anterior
      let infoPagoAnteriorY = null
      
      if (teniaPagoParcial && !esParcial) {
        // Ajustar posición si hay código
        infoPagoAnteriorY = codigoY ? codigoY + 25 : badgeY + 50
        const infoPagoAnteriorHeight = 90
        
        // Card para información de pago anterior
        ctx.fillStyle = '#dbeafe'
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoPagoAnteriorY, cardInnerWidth, infoPagoAnteriorHeight, 14)
        ctx.fill()
        
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoPagoAnteriorY, cardInnerWidth, infoPagoAnteriorHeight, 14)
        ctx.stroke()
        
        // Título "PAGO ANTERIOR"
        ctx.fillStyle = '#1e40af'
        ctx.font = 'bold 11px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('PAGO ANTERIOR', cardInnerX + 18, infoPagoAnteriorY + 22)
        
        // Valor del pago anterior
        const valorPagoAnteriorY = infoPagoAnteriorY + 42
        ctx.fillStyle = '#1e40af'
        ctx.font = '10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Valor del Pago Anterior', cardInnerX + 18, valorPagoAnteriorY)
        
        ctx.fillStyle = '#1e3a8a'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorPagoAnterior || 0), cardInnerX + 18, valorPagoAnteriorY + 20)
        
        // Pago actual (completado)
        const pagoActualY = valorPagoAnteriorY + 35
        ctx.fillStyle = '#1e40af'
        ctx.font = '10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Pago Actual (Completado)', cardInnerX + 18, pagoActualY)
        
        ctx.fillStyle = '#10b981'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valor || 0), cardInnerX + 18, pagoActualY + 18)
      }
      
      // Si es pago parcial, mostrar información adicional
      if (esParcial) {
        // Ajustar posición si hay código o información de pago anterior
        const infoParcialY = infoPagoAnteriorY 
          ? infoPagoAnteriorY + 100 
          : (codigoY ? codigoY + 25 : badgeY + 50)
        const infoParcialHeight = 110
        
        // Card para información de pago parcial
        ctx.fillStyle = '#fef3c7'
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoParcialY, cardInnerWidth, infoParcialHeight, 14)
        ctx.fill()
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoParcialY, cardInnerWidth, infoParcialHeight, 14)
        ctx.stroke()
        
        // Título "PAGO PARCIAL"
        ctx.fillStyle = '#92400e'
        ctx.font = 'bold 11px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('PAGO PARCIAL', cardInnerX + 18, infoParcialY + 22)
        
        // Valor Total de la Cuota primero (más destacado)
        const valorCuotaY = infoParcialY + 42
        ctx.fillStyle = '#92400e'
        ctx.font = '10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Valor Total de la Cuota', cardInnerX + 18, valorCuotaY)
        
        ctx.fillStyle = '#78350f'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorCuota || 0), cardInnerX + 18, valorCuotaY + 20)
        
        // Línea divisoria
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cardInnerX + 18, valorCuotaY + 30)
        ctx.lineTo(cardInnerX + cardInnerWidth - 18, valorCuotaY + 30)
        ctx.stroke()
        
        // Total Pagado y Pendiente lado a lado
        const totalPendienteY = valorCuotaY + 40
        
        // Total Pagado (izquierda)
        ctx.fillStyle = '#92400e'
        ctx.font = '9px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Total Pagado', cardInnerX + 18, totalPendienteY)
        
        ctx.fillStyle = '#78350f'
        ctx.font = 'bold 14px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorPagadoTotal || 0), cardInnerX + 18, totalPendienteY + 18)
        
        // Pendiente (derecha)
        ctx.fillStyle = '#92400e'
        ctx.font = '9px Arial'
        ctx.textAlign = 'right'
        ctx.fillText('Pendiente', cardInnerX + cardInnerWidth - 18, totalPendienteY)
        
        ctx.fillStyle = '#d97706'
        ctx.font = 'bold 14px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorPendiente || 0), cardInnerX + cardInnerWidth - 18, totalPendienteY + 18)
      }
      
      // === DETALLES EN CARDS ===
      // Ajustar posición de los detalles según el contenido
      let detailsY
      if (esParcial) {
        detailsY = codigoY ? codigoY + 140 : badgeY + 165
      } else if (teniaPagoParcial) {
        // Si hay información de pago anterior, ajustar posición
        detailsY = infoPagoAnteriorY ? infoPagoAnteriorY + 100 : (codigoY ? codigoY + 25 : badgeY + 60)
      } else {
        detailsY = codigoY ? codigoY + 25 : badgeY + 60
      }
      
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
      ctx.fillText(pagoRegistrado.value?.socioNombre || 'Socio', cardInnerX + 18, detailsY + 46)
      
      // Card: Cuota con mejor estilo
      const cuotaY = detailsY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, cuotaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, cuotaY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONCEPTO / CUOTA', cardInnerX + 18, cuotaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(pagoRegistrado.value?.descripcionCuota || 'Cuota mensual', cardInnerX + 18, cuotaY + 46)
      
      // Card: Fecha con mejor estilo
      const fechaY = cuotaY + 75
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
      ctx.fillText(pagoRegistrado.value?.fecha || 'Fecha no disponible', cardInnerX + 18, fechaY + 46)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      // El botón debe quedar fuera de la tarjeta blanca, al final, igual en ambos casos
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

async function descargarComprobante() {
  console.log('Iniciando descarga...')
  
  if (!comprobanteRef.value) {
    alert('Error: El comprobante no está listo. Intenta de nuevo.')
    return
  }
  
  generandoImagen.value = true
  
  try {
    const canvas = await generarImagenComprobante()
    
    if (!canvas) {
      throw new Error('No se pudo generar el canvas')
    }
    
    console.log('Convirtiendo a imagen...')
    
    // Convertir a imagen y descargar
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-') || 'pago'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('Descarga completada')
    
    // Registrar auditoría de descarga de comprobante
    if (pagoRegistrado.value) {
      const auditoria = useAuditoria()
      const cuotaIdParaAuditoria = pagoRegistrado.value.cuotaId || null
      const natilleraIdParaAuditoria = id || null
      
      console.log('[Auditoría] Registrando descarga de comprobante:', {
        tieneCuotaId: !!cuotaIdParaAuditoria,
        cuotaId: cuotaIdParaAuditoria,
        natilleraId: natilleraIdParaAuditoria,
        pagoRegistrado: pagoRegistrado.value
      })
      
      const promesaAuditoria = auditoria.registrar({
        tipoAccion: 'DOWNLOAD',
        entidad: 'comprobante',
        entidadId: cuotaIdParaAuditoria,
        descripcion: `Se descargó comprobante de pago de ${pagoRegistrado.value.socioNombre || 'socio'} (Código: ${pagoRegistrado.value.codigoComprobante || 'N/A'})`,
        natilleraId: natilleraIdParaAuditoria,
        detalles: {
          tipo_comprobante: 'pago_cuota',
          codigo_comprobante: pagoRegistrado.value.codigoComprobante || null,
          socio_nombre: pagoRegistrado.value.socioNombre || null,
          valor: pagoRegistrado.value.valor || null,
          valor_total: pagoRegistrado.value.valorPagadoTotal || null,
          es_parcial: pagoRegistrado.value.esParcial || false,
          cuota_id: cuotaIdParaAuditoria
        }
      })
      
      registrarAuditoriaEnSegundoPlano(promesaAuditoria)
      
      // También loguear el resultado para debug
      promesaAuditoria.then(result => {
        if (result.success) {
          console.log('[Auditoría] ✅ Descarga registrada exitosamente:', result.id)
        } else {
          console.error('[Auditoría] ❌ Error registrando descarga:', result.error)
        }
      }).catch(error => {
        console.error('[Auditoría] ❌ Excepción al registrar descarga:', error)
      })
    } else {
      console.warn('[Auditoría] No se pudo registrar descarga: pagoRegistrado.value es null')
    }
  } catch (e) {
    console.error('Error completo:', e)
    alert('Error al generar la imagen: ' + e.message)
  } finally {
    generandoImagen.value = false
  }
}

async function compartirWhatsApp() {
  if (!pagoRegistrado.value) return
  
  generandoImagen.value = true
  
  try {
    const canvas = await generarImagenComprobante()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    
    const archivo = new File([blob], `comprobante-${Date.now()}.png`, { type: 'image/png' })
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Comprobante de Pago',
        text: `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago en la natillera "${natilleraNombre.value}".\n\n¡Gracias por estar al día! 🙌`
      })
      
      // Registrar auditoría de envío de comprobante
      if (pagoRegistrado.value?.cuotaId) {
        const auditoria = useAuditoria()
        registrarAuditoriaEnSegundoPlano(auditoria.registrar({
          tipoAccion: 'SEND',
          entidad: 'comprobante',
          entidadId: pagoRegistrado.value.cuotaId,
          descripcion: `Se envió comprobante de pago por WhatsApp a ${pagoRegistrado.value.socioNombre || 'socio'} (Código: ${pagoRegistrado.value.codigoComprobante || 'N/A'})`,
          natilleraId: id,
          detalles: {
            tipo_comprobante: 'pago_cuota',
            metodo_envio: 'whatsapp',
            codigo_comprobante: pagoRegistrado.value.codigoComprobante,
            socio_nombre: pagoRegistrado.value.socioNombre,
            socio_telefono: pagoRegistrado.value.socioTelefono,
            valor: pagoRegistrado.value.valor,
            valor_total: pagoRegistrado.value.valorPagadoTotal,
            es_parcial: pagoRegistrado.value.esParcial
          }
        }))
      }
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago. ¡Gracias por estar al día! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
          
          // Registrar auditoría de envío de comprobante (fallback)
          if (pagoRegistrado.value?.cuotaId) {
            const auditoria = useAuditoria()
            registrarAuditoriaEnSegundoPlano(auditoria.registrar({
              tipoAccion: 'SEND',
              entidad: 'comprobante',
              entidadId: pagoRegistrado.value.cuotaId,
              descripcion: `Se envió comprobante de pago por WhatsApp (fallback) a ${pagoRegistrado.value.socioNombre || 'socio'} (Código: ${pagoRegistrado.value.codigoComprobante || 'N/A'})`,
              natilleraId: id,
              detalles: {
                tipo_comprobante: 'pago_cuota',
                metodo_envio: 'whatsapp_fallback',
                codigo_comprobante: pagoRegistrado.value.codigoComprobante,
                socio_nombre: pagoRegistrado.value.socioNombre,
                socio_telefono: pagoRegistrado.value.socioTelefono,
                valor: pagoRegistrado.value.valor,
                valor_total: pagoRegistrado.value.valorPagadoTotal,
                es_parcial: pagoRegistrado.value.esParcial
              }
            }))
          }
        }
      }, 500)
      
      alert('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      // Fallback: solo abrir WhatsApp con texto
      const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
      if (telefono) {
        const mensaje = `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago en la natillera.\n\n¡Gracias por estar al día! 🙌`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        
        // Registrar auditoría de envío de comprobante (solo texto)
        if (pagoRegistrado.value?.cuotaId) {
          const auditoria = useAuditoria()
          registrarAuditoriaEnSegundoPlano(auditoria.registrar({
            tipoAccion: 'SEND',
            entidad: 'comprobante',
            entidadId: pagoRegistrado.value.cuotaId,
            descripcion: `Se envió comprobante de pago por WhatsApp (solo texto) a ${pagoRegistrado.value.socioNombre || 'socio'} (Código: ${pagoRegistrado.value.codigoComprobante || 'N/A'})`,
            natilleraId: id,
            detalles: {
              tipo_comprobante: 'pago_cuota',
              metodo_envio: 'whatsapp_texto',
              codigo_comprobante: pagoRegistrado.value.codigoComprobante,
              socio_nombre: pagoRegistrado.value.socioNombre,
              socio_telefono: pagoRegistrado.value.socioTelefono,
              valor: pagoRegistrado.value.valor,
              valor_total: pagoRegistrado.value.valorPagadoTotal,
              es_parcial: pagoRegistrado.value.esParcial
            }
          }))
        }
      }
    }
  } finally {
    generandoImagen.value = false
  }
}

function cerrarConfirmacion() {
  modalConfirmacion.value = false
  pagoRegistrado.value = null
  mostrarIndicadorScroll.value = false
}

function verificarScrollComprobante() {
  if (!scrollComprobanteRef.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollComprobanteRef.value
  const hayContenidoAbajo = scrollHeight > clientHeight
  const estaAlFinal = scrollTop + clientHeight >= scrollHeight - 10 // 10px de margen
  const haHechoScroll = scrollTop > 5 // Si ha hecho scroll más de 5px, ocultar
  
  // Ocultar inmediatamente si el usuario hace scroll
  if (haHechoScroll) {
    mostrarIndicadorScroll.value = false
    return
  }
  
  // Mostrar indicador solo si hay contenido para hacer scroll y no está al final
  mostrarIndicadorScroll.value = hayContenidoAbajo && !estaAlFinal
}

// Verificar si hay scroll disponible cuando se abre el modal
watch(modalConfirmacion, async (nuevoValor) => {
  if (nuevoValor) {
    await nextTick()
    setTimeout(() => {
      verificarScrollComprobante()
    }, 300) // Esperar un poco para que el contenido se renderice
  } else {
    mostrarIndicadorScroll.value = false
  }
})

function reenviarComprobante(cuota) {
  // Calcular si es parcial
  const valorCuota = cuota.valor_cuota || 0
  const valorPagadoTotal = cuota.valor_pagado || 0
  const valorPendiente = valorCuota - valorPagadoTotal
  // Es parcial si hay un pago pero no cubre toda la cuota
  const esParcial = valorPagadoTotal > 0 && valorPagadoTotal < valorCuota
  
  // Preparar datos del pago para mostrar el comprobante
  pagoRegistrado.value = {
    cuotaId: cuota.id, // ID de la cuota para auditoría
    socioNombre: cuota.socio_natillera?.socio?.nombre,
    socioTelefono: cuota.socio_natillera?.socio?.telefono,
    valor: valorPagadoTotal, // Para reenvío, mostrar el total pagado
    valorCuota,
    valorPagadoTotal,
    valorPendiente,
    esParcial,
    codigoComprobante: cuota.codigo_comprobante || null, // Incluir código del comprobante
    descripcionCuota: cuota.descripcion || formatDate(cuota.fecha_limite),
    fecha: cuota.fecha_pago 
      ? new Date(cuota.fecha_pago).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Fecha no registrada'
  }
  
  // Registrar auditoría de reenvío de comprobante
  const auditoria = useAuditoria()
  registrarAuditoriaEnSegundoPlano(auditoria.registrar({
    tipoAccion: 'RESEND',
    entidad: 'comprobante',
    entidadId: cuota.id,
    descripcion: `Se reenvió comprobante de pago de ${cuota.socio_natillera?.socio?.nombre || 'socio'} (Código: ${cuota.codigo_comprobante || 'N/A'})`,
    natilleraId: id,
    detalles: {
      tipo_comprobante: 'pago_cuota',
      codigo_comprobante: cuota.codigo_comprobante,
      socio_nombre: cuota.socio_natillera?.socio?.nombre,
      valor_total: valorPagadoTotal,
      es_parcial: esParcial
    }
  }))
  
  modalConfirmacion.value = true
}

// Caché de configuración de natillera para evitar consultas repetidas
let natilleraConfigCache = null

async function cargarNatillera() {
  // Si ya tenemos la config en caché, usarla
  if (natilleraConfigCache) {
    const data = natilleraConfigCache
    natilleraNombre.value = data.nombre
    mesInicio.value = data.mes_inicio || 1
    mesFin.value = data.mes_fin || 11
    diasGracia.value = data.reglas_multas?.dias_gracia || 3
    sancionesActivas.value = data.reglas_multas?.sanciones?.activa || false
    
    let anioCargado = data.anio_inicio ?? data.anio ?? new Date().getFullYear()
    anioNatillera.value = Number(anioCargado)
    return data
  }

  // Una sola consulta que trae TODO lo necesario
  const { data } = await supabase
    .from('natilleras')
    .select('nombre, mes_inicio, mes_fin, anio, anio_inicio, reglas_multas')
    .eq('id', id)
    .single()
  
  if (data) {
    // Guardar en caché
    natilleraConfigCache = data
    
    natilleraNombre.value = data.nombre
    mesInicio.value = data.mes_inicio || 1
    mesFin.value = data.mes_fin || 11
    
    // Cargar días de gracia y sanciones de la misma consulta
    diasGracia.value = data.reglas_multas?.dias_gracia || 3
    sancionesActivas.value = data.reglas_multas?.sanciones?.activa || false
    
    // Usar anio_inicio como año base
    let anioCargado
    if (data.anio_inicio !== null && data.anio_inicio !== undefined && data.anio_inicio !== '') {
      anioCargado = Number(data.anio_inicio)
    } else if (data.anio !== null && data.anio !== undefined && data.anio !== '') {
      anioCargado = Number(data.anio)
    } else {
      anioCargado = new Date().getFullYear()
    }
    
    anioNatillera.value = anioCargado
    
    // Si hay un mes en la ruta, usarlo; sino, seleccionar el mes actual si está en el rango, sino el primero
    if (mesParam.value) {
      mesSeleccionado.value = mesParam.value
    } else {
      const mesActual = new Date().getMonth() + 1
      const mesesDisponibles = mesesNatillera.value.map(m => m.value)
      
      if (mesesDisponibles.includes(mesActual)) {
        mesSeleccionado.value = mesActual
      } else {
        mesSeleccionado.value = mesesDisponibles[0] || 1
      }
    }
    
    // Actualizar el formulario con el mes seleccionado
    formCuotas.mes = mesSeleccionado.value
  }
  
  return data
}

// Función para verificar si faltan cuotas basándose en los datos ya cargados
function verificarCuotasFaltantes(cuotasCargadas, mes, anio) {
  // Obtener socios únicos de las cuotas cargadas del mes específico
  const cuotasDelMes = cuotasCargadas.filter(c => c.mes === mes && c.anio === anio)
  
  // Si no hay cuotas del mes, definitivamente faltan
  if (cuotasDelMes.length === 0) {
    return true
  }
  
  // Agrupar cuotas por socio para verificar completitud
  const cuotasPorSocio = {}
  cuotasDelMes.forEach(c => {
    if (!cuotasPorSocio[c.socio_natillera_id]) {
      cuotasPorSocio[c.socio_natillera_id] = {
        periodicidad: c.socio_natillera?.periodicidad || 'mensual',
        cuotas: []
      }
    }
    cuotasPorSocio[c.socio_natillera_id].cuotas.push(c)
  })
  
  // IMPORTANTE: Comparar el número de socios con cuotas contra el total de socios activos
  // Si el conteo está disponible, verificar que todos los socios tengan cuotas
  const totalSociosEsperados = conteoSociosMensuales.value + conteoSociosQuincenales.value
  const sociosConCuotas = Object.keys(cuotasPorSocio).length
  
  // Si el conteo total está disponible y hay menos socios con cuotas, faltan cuotas
  if (totalSociosEsperados > 0 && sociosConCuotas < totalSociosEsperados) {
    console.log(`⚠️ Faltan cuotas: ${sociosConCuotas} socios con cuotas vs ${totalSociosEsperados} socios activos`)
    return true
  }
  
  // Si el conteo no está disponible (0), asumir que potencialmente faltan cuotas
  // para que el store haga la verificación completa
  if (totalSociosEsperados === 0) {
    console.log('⚠️ Conteo de socios no disponible, asumiendo que potencialmente faltan cuotas')
    return true
  }
  
  // Verificar si algún socio tiene cuotas incompletas
  for (const socioId in cuotasPorSocio) {
    const { periodicidad, cuotas } = cuotasPorSocio[socioId]
    if (periodicidad === 'quincenal') {
      const tieneQ1 = cuotas.some(c => c.quincena === 1)
      const tieneQ2 = cuotas.some(c => c.quincena === 2)
      if (!tieneQ1 || !tieneQ2) return true
    } else {
      const tieneMensual = cuotas.some(c => c.quincena === null || c.quincena === undefined)
      if (!tieneMensual) return true
    }
  }
  
  return false
}

async function cargarConteoSocios() {
  const { data: socios } = await supabase
    .from('socios_natillera')
    .select('periodicidad')
    .eq('natillera_id', id)
    .eq('estado', 'activo')
  
  if (socios) {
    conteoSociosMensuales.value = socios.filter(s => s.periodicidad !== 'quincenal').length
    conteoSociosQuincenales.value = socios.filter(s => s.periodicidad === 'quincenal').length
  }
}

// Cargar socios activos para el selector
async function cargarSociosActivos() {
  const { data } = await supabase
    .from('socios_natillera')
    .select(`
      id,
      valor_cuota_individual,
      periodicidad,
      socio:socios(*)
    `)
    .eq('natillera_id', id)
    .eq('estado', 'activo')
    .order('created_at', { ascending: true })
  
  sociosActivos.value = data || []
}

// Función para cargar fechas de un mes que ya tiene cuotas
async function cargarFechasDelMes(mes) {
  // Calcular el año correcto para este mes basándose en el período de la natillera
  const anioCorrecto = calcularAnioMes(
    mes,
    mesInicio.value,
    mesFin.value,
    anioNatillera.value
  )
  
  // Obtener las cuotas del mes seleccionado con el año correcto
  const cuotasDelMes = cuotasStore.getCuotasPorMes(mes, anioCorrecto)
  
  if (cuotasDelMes.length > 0) {
    // Buscar fecha de la 1ra quincena
    const cuotaQuincena1 = cuotasDelMes.find(c => c.quincena === 1)
    if (cuotaQuincena1 && cuotaQuincena1.fecha_limite) {
      // Convertir fecha a formato YYYY-MM-DD para el input date
      const fecha1 = new Date(cuotaQuincena1.fecha_limite)
      formCuotas.fecha_quincena1 = fecha1.toISOString().split('T')[0]
    }
    
    // Buscar fecha de la 2da quincena o mensual
    const cuotaQuincena2 = cuotasDelMes.find(c => c.quincena === 2 || c.quincena === null)
    if (cuotaQuincena2 && cuotaQuincena2.fecha_limite) {
      // Convertir fecha a formato YYYY-MM-DD para el input date
      const fecha2 = new Date(cuotaQuincena2.fecha_limite)
      formCuotas.fecha_quincena2 = fecha2.toISOString().split('T')[0]
    }
  } else {
    // Si no hay cuotas, limpiar las fechas
    formCuotas.fecha_quincena1 = ''
    formCuotas.fecha_quincena2 = ''
  }
}

// Función para calcular el año correcto de un mes basándose en el período de la natillera
// Por ejemplo: si mes_inicio=12 (dic), mes_fin=11 (nov), anio_inicio=2025
//   - Diciembre (12) → 2025
//   - Enero-Nov (1-11) → 2026
function calcularAnioMes(mes, mesInicioNatillera, mesFinNatillera, anioInicioNatillera) {
  // Si el período cruza el año (mes_inicio > mes_fin, ej: dic a nov)
  if (mesInicioNatillera > mesFinNatillera) {
    // Si el mes está en la primera parte del período (mes_inicio a diciembre)
    if (mes >= mesInicioNatillera) {
      return anioInicioNatillera
    }
    // Si el mes está en la segunda parte del período (enero a mes_fin)
    if (mes <= mesFinNatillera) {
      return anioInicioNatillera + 1
    }
  } else {
    // Si el período no cruza el año (mes_inicio <= mes_fin, ej: ene a nov)
    return anioInicioNatillera
  }
  
  // Por defecto, devolver el año inicial
  return anioInicioNatillera
}

// Función para calcular fechas por defecto basadas en el mes (sin días de gracia)
function calcularFechasPorDefecto(mes, anio, diasGracia) {
  // Primera quincena: día 15 (sin días de gracia)
  const fechaQuincena1 = new Date(anio, mes - 1, 15)
  
  // Segunda quincena: último día del mes (30 o 31, sin días de gracia)
  // Obtener el último día del mes
  const ultimoDiaMes = new Date(anio, mes, 0).getDate() // 0 = último día del mes anterior (que es el último del mes actual)
  const fechaQuincena2 = new Date(anio, mes - 1, ultimoDiaMes)
  
  // Formatear a YYYY-MM-DD
  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return {
    fecha_quincena1: formatearFecha(fechaQuincena1),
    fecha_quincena2: formatearFecha(fechaQuincena2)
  }
}

// Función para seleccionar socio y hacer scroll
async function seleccionarSocio(socioId) {
  formCuotas.socioSeleccionado = socioId
  // Hacer scroll al final después de que el DOM se actualice
  await nextTick()
  if (scrollContainerGenerarCuotas.value) {
    scrollContainerGenerarCuotas.value.scrollTo({
      top: scrollContainerGenerarCuotas.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Función para abrir el modal y cargar socios
async function abrirModalGenerarCuotas() {
  modalGenerarCuotas.value = true
  await cargarSociosActivos()
  // Resetear formulario
  formCuotas.tipoGeneracion = 'todos'
  formCuotas.socioSeleccionado = null
  busquedaSocioCuotas.value = ''
  
  // Obtener el mes seleccionado (del formulario o del mes actual seleccionado)
  const mesParaCalcular = formCuotas.mes || mesSeleccionado.value
  
  if (mesParaCalcular) {
    // Primero intentar cargar fechas existentes si ya hay cuotas
    await cargarFechasDelMes(mesParaCalcular)
    
    // Si no hay fechas cargadas (no hay cuotas existentes), calcular fechas por defecto
    if (!formCuotas.fecha_quincena1 || !formCuotas.fecha_quincena2) {
      // Obtener días de gracia de la natillera
      const { data: natillera } = await supabase
        .from('natilleras')
        .select('reglas_multas, mes_inicio, mes_fin, anio, anio_inicio')
        .eq('id', id)
        .single()
      
      const diasGracia = natillera?.reglas_multas?.dias_gracia || 3
      
      // Usar anio_inicio como año base, con fallback a anio si no existe
      const anioBase = natillera?.anio_inicio !== null && natillera?.anio_inicio !== undefined 
        ? Number(natillera.anio_inicio) 
        : (natillera?.anio !== null && natillera?.anio !== undefined 
          ? Number(natillera.anio) 
          : anioNatillera.value)
      
      // Calcular el año correcto para este mes basándose en el período de la natillera
      const anioCorrecto = calcularAnioMes(
        mesParaCalcular,
        natillera?.mes_inicio || mesInicio.value,
        natillera?.mes_fin || mesFin.value,
        anioBase
      )
      
      // Calcular fechas por defecto
      const fechasPorDefecto = calcularFechasPorDefecto(
        mesParaCalcular,
        anioCorrecto,
        diasGracia
      )
      
      formCuotas.fecha_quincena1 = fechasPorDefecto.fecha_quincena1
      formCuotas.fecha_quincena2 = fechasPorDefecto.fecha_quincena2
    }
  }
}

// Función para abrir modal de confirmación de borrado
function confirmarBorrarCuotasMes() {
  if (!mesSeleccionado.value) return
  modalConfirmarBorrar.value = true
}

// Función para quitar todos los filtros
function quitarFiltros() {
  filtroEstado.value = 'todos'
  filtroPeriodicidad.value = 'todos'
  busquedaCuotas.value = ''
  mostrarFiltros.value = false
}

// Cuotas pendientes del mes (excluyendo pagadas y parciales)
const cuotasPendientesMes = computed(() => {
  return cuotasMesActual.value.filter(c => 
    c.estado !== 'pagada' && 
    c.estado !== 'parcial' && 
    (c.estado === 'pendiente' || c.estado === 'mora' || c.estado === 'programada')
  )
})

// Función para borrar cuotas del mes (solo pendientes y en mora)
async function borrarCuotasMes() {
  if (!mesSeleccionado.value) return
  
  try {
    cuotasStore.loading = true
    
    // Calcular el año correcto para este mes basándose en el período de la natillera
    const anioCorrecto = calcularAnioMes(
      mesSeleccionado.value,
      mesInicio.value,
      mesFin.value,
      anioNatillera.value
    )
    
    // Obtener los IDs de socios_natillera de esta natillera (incluyendo nombres para auditoría)
    const { data: sociosNatillera, error: sociosError } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(nombre)')
      .eq('natillera_id', id)

    if (sociosError) throw sociosError

    if (!sociosNatillera || sociosNatillera.length === 0) {
      return
    }

    // Crear mapeo de socio_natillera_id a nombre
    const socioNombreMap = {}
    sociosNatillera.forEach(s => {
      socioNombreMap[s.id] = s.socio?.nombre || 'Socio desconocido'
    })

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    // Obtener las cuotas que se van a eliminar para registrar en auditoría
    const { data: cuotasAEliminar, error: fetchError } = await supabase
      .from('cuotas')
      .select('*')
      .in('socio_natillera_id', socioNatilleraIds)
      .eq('mes', mesSeleccionado.value)
      .eq('anio', anioCorrecto)
      .in('estado', ['pendiente', 'mora', 'programada'])

    if (fetchError) throw fetchError

    // Eliminar solo las cuotas pendientes y en mora del mes y año seleccionados
    // NO eliminar las pagadas ni parciales
    const { error: deleteError } = await supabase
      .from('cuotas')
      .delete()
      .in('socio_natillera_id', socioNatilleraIds)
      .eq('mes', mesSeleccionado.value)
      .eq('anio', anioCorrecto)
      .in('estado', ['pendiente', 'mora', 'programada'])

    if (deleteError) throw deleteError

    // Registrar auditoría de eliminación masiva
    const auditoria = useAuditoria()
    const mesLabel = todosMeses.find(m => m.value === mesSeleccionado.value)?.label || mesSeleccionado.value
    const cantidadEliminadas = cuotasAEliminar?.length || 0
    
    if (cantidadEliminadas > 0) {
      // Obtener lista de nombres de socios afectados
      const sociosAfectados = [...new Set(cuotasAEliminar.map(c => socioNombreMap[c.socio_natillera_id]))]
      const sociosTexto = sociosAfectados.length <= 3 
        ? sociosAfectados.join(', ')
        : `${sociosAfectados.slice(0, 3).join(', ')} y ${sociosAfectados.length - 3} más`
      
      // Registrar auditoría de eliminación masiva (en segundo plano)
      registrarAuditoriaEnSegundoPlano(auditoria.registrarEliminacion(
        'cuota',
        null, // No hay un ID específico para eliminación masiva
        `Se eliminaron ${cantidadEliminadas} cuota(s) de ${mesLabel} ${anioCorrecto} para: ${sociosTexto}`,
        {
          cuotas_eliminadas: cuotasAEliminar.map(c => ({
            id: c.id,
            valor_cuota: c.valor_cuota,
            estado: c.estado,
            socio_natillera_id: c.socio_natillera_id,
            socio_nombre: socioNombreMap[c.socio_natillera_id]
          })),
          socios_afectados: sociosAfectados,
          total_eliminadas: cantidadEliminadas,
          mes: mesSeleccionado.value,
          anio: anioCorrecto
        },
        id, // natilleraId
        {
          accion: 'eliminacion_masiva',
          mes: mesLabel,
          anio: anioCorrecto,
          socios: sociosAfectados
        }
      ))
    }

    // Recargar cuotas
    await cuotasStore.fetchCuotasNatillera(id)
    
    // Recalcular sanciones dinámicas después de borrar cuotas
    await recalcularSancionesMes()
    
    modalConfirmarBorrar.value = false
  } catch (error) {
    console.error('Error borrando cuotas:', error)
    modalConfirmarBorrar.value = false
    alert('Error al borrar las cuotas: ' + error.message)
  } finally {
    cuotasStore.loading = false
  }
}


// Función para cerrar dropdown al hacer click fuera
function handleClickOutside(event) {
  if (dropdownMesRef.value && !dropdownMesRef.value.contains(event.target)) {
    dropdownMesAbierto.value = false
  }
}

onMounted(async () => {
  // Marcar que estamos inicializando para evitar que el watch se dispare
  inicializando.value = true
  const tiempoInicio = performance.now()
  
  try {
    // 1. Cargar natillera, cuotas Y conteo de socios EN PARALELO (operaciones independientes)
    const [natilleraData, cuotasCargadas] = await Promise.all([
      cargarNatillera(),
      cuotasStore.fetchCuotasNatillera(id),
      cargarConteoSocios() // Importante: cargar conteo de socios para verificar si faltan cuotas
    ])
    
    // Los datos de días de gracia y sanciones ya están cargados en cargarNatillera()
    console.log('📅 Días de gracia:', diasGracia.value, '| Sanciones activas:', sancionesActivas.value)
    console.log('👥 Socios: Mensuales:', conteoSociosMensuales.value, '| Quincenales:', conteoSociosQuincenales.value)
    
    // 2. Verificar si faltan cuotas USANDO LOS DATOS YA CARGADOS (sin nueva consulta)
    if (mesSeleccionado.value) {
      const anioCorrecto = calcularAnioMes(
        mesSeleccionado.value,
        mesInicio.value,
        mesFin.value,
        anioNatillera.value
      )
      
      // Verificar con datos locales si faltan cuotas
      const faltanCuotas = verificarCuotasFaltantes(cuotasCargadas, mesSeleccionado.value, anioCorrecto)
      
      if (faltanCuotas) {
        try {
          generandoCuotas.value = true
          const result = await cuotasStore.generarCuotasFaltantes(id, mesSeleccionado.value, anioCorrecto)
          if (result.success && result.cuotasGeneradas > 0) {
            console.log(`✅ ${result.cuotasGeneradas} cuotas generadas automáticamente`)
            // Recargar solo si se generaron nuevas (skip mora)
            await cuotasStore.fetchCuotasNatillera(id, { skipMoraUpdate: true })
          }
        } catch (error) {
          console.error('Error en generación automática:', error)
        } finally {
          generandoCuotas.value = false
        }
      }
    }
    
    // 3. Calcular sanciones solo si están activadas (en segundo plano si no es crítico)
    if (sancionesActivas.value && mesSeleccionado.value) {
      // Ejecutar sin await para no bloquear la UI
      cuotasStore.calcularSancionesTotales(id).then(resultSanciones => {
        if (resultSanciones.success) {
          sancionesDinamicas.value = resultSanciones.sanciones || {}
        }
      })
    } else {
      sancionesDinamicas.value = {}
    }
    
    const tiempoFin = performance.now()
    console.log(`✅ Inicialización completada en ${(tiempoFin - tiempoInicio).toFixed(0)}ms`)
  } finally {
    inicializando.value = false
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(4px);
    opacity: 0.8;
  }
}

@keyframes pulse-gentle {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  5% {
    opacity: 1;
    transform: scale(1);
  }
  15% {
    opacity: 1;
    transform: scale(1);
  }
  20% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

</style>


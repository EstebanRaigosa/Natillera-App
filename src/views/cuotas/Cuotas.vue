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
                      <p class="text-xs sm:text-sm text-natillera-600 font-semibold leading-tight">{{ anioNatillera }}</p>
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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 backdrop-blur-sm shadow-lg">
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{{ resumenMesActual.porcentajeRecaudado.toFixed(0) }}%</p>
          <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Recaudado</p>
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

    <!-- Lista de cuotas -->
    <div v-if="cuotasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando cuotas...</p>
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
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Título de sección de cuotas - Armónico y destacado -->
        <div v-if="cuotasMesActual.length > 0" class="flex-1 min-w-0">
          <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/80 to-emerald-50/60 border-2 border-natillera-300/50 shadow-xl backdrop-blur-sm px-5 py-3.5">
            <!-- Efecto de fondo decorativo -->
            <div class="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-natillera-400/20 to-emerald-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-natillera-400/15 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
            
            <div class="relative flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-natillera-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-3 flex-wrap">
                  <span>Cuotas del Mes</span>
                  <span class="px-3 py-1.5 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                    <span v-if="cuotasFiltradas.length === cuotasMesActual.length">
                      {{ cuotasMesActual.length }}
                    </span>
                    <span v-else>
                      Mostrando {{ cuotasFiltradas.length }} de {{ cuotasMesActual.length }}
                    </span>
                  </span>
                  <span v-if="filtroPeriodicidad !== 'todos'" class="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    ({{ filtroPeriodicidad === 'mensual' ? 'mensuales' : 'quincenales' }})
                  </span>
                </h2>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- Botón Exportar Excel (solo visible en vista Excel) -->
          <button
            v-if="vistaExcel"
            @click="abrirModalExportar"
            class="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-xl"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Exportar</span>
          </button>
          
          <!-- Toggle de vista (oculto en móvil) -->
          <div class="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2.5 self-stretch shadow-md">
            <button
              @click="vistaExcel = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                !vistaExcel 
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <Squares2X2Icon class="w-4 h-4" />
              <span class="hidden sm:inline">Tarjetas</span>
            </button>
            <button
              @click="vistaExcel = true"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                vistaExcel 
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <TableCellsIcon class="w-4 h-4" />
              <span class="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Vista Tarjetas -->
      <template v-if="!vistaExcel">
        <div 
          v-for="cuota in cuotasFiltradas" 
          :key="cuota.id"
          class="card hover:shadow-2xl hover:shadow-natillera-500/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
        <div class="flex items-center gap-4">
          <div 
            :class="[
              'w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg transition-all duration-300',
              cuota.estado === 'pagada' ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 
              cuota.estado === 'mora' ? 'bg-gradient-to-br from-red-100 to-rose-100' : 
              cuota.estado === 'parcial' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' : 
              cuota.estado === 'programada' ? 'bg-gradient-to-br from-gray-100 to-slate-100' : 'bg-gradient-to-br from-orange-100 to-amber-100'
            ]"
          >
            <component 
              :is="cuota.estado === 'pagada' ? CheckCircleIcon : 
                   cuota.estado === 'mora' ? ExclamationCircleIcon : 
                   cuota.estado === 'programada' ? CalendarIcon : ClockIcon"
              :class="[
                'w-7 h-7',
                cuota.estado === 'pagada' ? 'text-green-600' : 
                cuota.estado === 'mora' ? 'text-red-600' : 
                cuota.estado === 'parcial' ? 'text-blue-600' : 
                cuota.estado === 'programada' ? 'text-gray-500' : 'text-orange-600'
              ]"
            />
            <!-- Badge de quincena (solo para quincenales) -->
            <span 
              v-if="cuota.quincena"
              class="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-bold rounded-full shadow-lg"
            >
              Q{{ cuota.quincena }}
            </span>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium text-gray-800">
                {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
              </p>
              <!-- Badge de periodicidad -->
              <span 
                v-if="cuota.quincena" 
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200"
              >
                <span class="text-purple-500">🗓️</span>
                {{ cuota.quincena === 1 ? '1ra Quincena' : '2da Quincena' }}
              </span>
              <span 
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-natillera-100 to-emerald-100 text-natillera-700 text-[10px] font-bold rounded-full border border-natillera-200"
              >
                <span class="text-natillera-500">📅</span>
                Mensual
              </span>
            </div>
            <p class="text-sm text-gray-500">
              Vence: {{ formatDate(cuota.fecha_limite) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <template v-if="cuota.estado === 'parcial'">
              <p class="font-bold text-gray-800">${{ formatMoney(cuota.valor_cuota - (cuota.valor_pagado || 0)) }}</p>
              <p class="text-xs text-gray-500 mt-1">
                Valor inicial: ${{ formatMoney(cuota.valor_cuota) }}
              </p>
            </template>
            <template v-else>
              <p class="font-bold text-gray-800">${{ formatMoney(cuota.valor_cuota) }}</p>
            </template>
            <p class="text-sm" :class="cuota.valor_pagado > 0 ? 'text-green-600' : 'text-gray-400'">
              Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
            </p>
          </div>
          
          <span 
            :class="[
              'badge',
              cuota.estado === 'pagada' ? 'badge-success' : 
              cuota.estado === 'mora' ? 'badge-danger' : 
              cuota.estado === 'parcial' ? 'bg-blue-100 text-blue-800' : 
              cuota.estado === 'programada' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-800'
            ]"
          >
            {{ cuota.estado === 'programada' ? 'Programada' : cuota.estado }}
          </span>

          <button 
            v-if="cuota.estado === 'parcial' || (cuota.valor_pagado > 0 && cuota.valor_pagado < cuota.valor_cuota)"
            @click="abrirModalEditar(cuota)"
            class="flex items-center gap-1 py-2 px-3 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Editar cuota"
          >
            <PencilIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Editar</span>
          </button>

          <button 
            v-if="cuota.estado !== 'pagada'"
            @click="abrirModalPago(cuota)"
            class="btn-primary py-2 px-4 text-sm"
          >
            Registrar Pago
          </button>

          <button 
            v-if="cuota.estado === 'pagada'"
            @click="reenviarComprobante(cuota)"
            class="flex items-center gap-1 py-2 px-3 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Reenviar comprobante"
          >
            <ArrowPathIcon class="w-4 h-4" />
            Reenviar
          </button>
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
              <td class="px-4 py-3 text-sm font-semibold text-gray-800 text-right">
                <template v-if="cuota.estado === 'parcial'">
                  <div class="space-y-0.5">
                    <div>${{ formatMoney(cuota.valor_cuota - (cuota.valor_pagado || 0)) }}</div>
                    <div class="text-xs text-gray-500 font-normal">Inicial: ${{ formatMoney(cuota.valor_cuota) }}</div>
                  </div>
                </template>
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
                    v-if="cuota.estado === 'parcial' || (cuota.valor_pagado > 0 && cuota.valor_pagado < cuota.valor_cuota)"
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
                    v-else
                    @click="reenviarComprobante(cuota)"
                    class="px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
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
              {{ todosMeses.find(m => m.value === mesSeleccionado)?.label }} {{ anioNatillera }}
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

    <!-- Modal Generar Cuotas -->
    <div v-if="modalGenerarCuotas" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalGenerarCuotas = false"></div>
      <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto overflow-x-visible">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-2">
          Generar Cuotas del Mes
        </h3>
        <p class="text-gray-500 text-sm mb-6">
          Define las fechas límite de pago para cada quincena
        </p>

        <form @submit.prevent="handleGenerarCuotas" class="space-y-5">
          <!-- Tipo de generación -->
          <div>
            <label class="label">Generar cuotas para *</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="formCuotas.tipoGeneracion = 'todos'; formCuotas.socioSeleccionado = null"
                :class="[
                  'p-3 rounded-xl border-2 transition-all',
                  formCuotas.tipoGeneracion === 'todos'
                    ? 'bg-natillera-500 text-white border-natillera-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-natillera-400'
                ]"
              >
                <div class="font-semibold">Todos los socios</div>
                <div class="text-xs mt-1 opacity-90">Generar para todos los socios activos</div>
              </button>
              <button
                type="button"
                @click="formCuotas.tipoGeneracion = 'unSocio'"
                :class="[
                  'p-3 rounded-xl border-2 transition-all',
                  formCuotas.tipoGeneracion === 'unSocio'
                    ? 'bg-natillera-500 text-white border-natillera-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-natillera-400'
                ]"
              >
                <div class="font-semibold">Un solo socio</div>
                <div class="text-xs mt-1 opacity-90">Generar para un socio específico</div>
              </button>
            </div>
          </div>

          <!-- Selector de socio (solo si se selecciona "Un solo socio") -->
          <div v-if="formCuotas.tipoGeneracion === 'unSocio'">
            <label class="label">Seleccionar socio *</label>
            
            <!-- Barra de búsqueda -->
            <div class="relative mb-3">
              <MagnifyingGlassIcon class="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                v-model="busquedaSocioCuotas"
                type="text"
                placeholder="Buscar socio por nombre..."
                class="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-natillera-500 focus:bg-white transition-all"
              />
            </div>
            
            <!-- Lista de socios -->
            <div class="space-y-2 overflow-y-auto max-h-[40vh] sm:max-h-64 border border-gray-200 rounded-xl p-2 bg-gray-50">
              <button 
                v-for="socio in sociosFiltradosCuotas" 
                :key="socio.id"
                type="button"
                @click="formCuotas.socioSeleccionado = socio.id"
                :class="[
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                  formCuotas.socioSeleccionado === socio.id
                    ? 'bg-natillera-100 border-2 border-natillera-500 shadow-md'
                    : 'bg-white hover:bg-natillera-50 border-2 border-transparent hover:border-natillera-200'
                ]"
              >
                <img 
                  :src="getAvatarUrl(socio.socio?.nombre || socio.id, socio.socio?.avatar_seed)" 
                  :alt="socio.socio?.nombre"
                  class="w-10 h-10 rounded-full flex-shrink-0 border-2 border-natillera-200"
                />
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-gray-800 truncate text-sm sm:text-base">{{ socio.socio?.nombre }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <p class="text-xs sm:text-sm text-gray-600">
                      ${{ formatMoney(socio.valor_cuota_individual) }}
                    </p>
                    <span class="text-gray-400">•</span>
                    <span 
                      :class="[
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        socio.periodicidad === 'quincenal' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      ]"
                    >
                      {{ socio.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                    </span>
                  </div>
                </div>
                <div 
                  v-if="formCuotas.socioSeleccionado === socio.id"
                  class="w-6 h-6 rounded-full bg-natillera-500 flex items-center justify-center flex-shrink-0"
                >
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
              </button>
              
              <!-- Mensaje cuando no hay resultados -->
              <div v-if="sociosFiltradosCuotas.length === 0" class="text-center py-6">
                <p class="text-gray-400 text-sm">No se encontraron socios</p>
              </div>
            </div>
          </div>

          <!-- Mes -->
          <div>
            <label class="label">Mes a generar *</label>
            <select 
              v-model.number="formCuotas.mes"
              class="input-field"
              required
            >
              <option v-for="mes in mesesNatillera" :key="mes.value" :value="mes.value">
                {{ mes.label }}
              </option>
            </select>
          </div>

          <!-- Fechas de pago por quincena -->
          <div class="p-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-200 shadow-inner">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="font-semibold text-gray-800">Fechas Límite de Pago</p>
                <p class="text-xs text-gray-500">La fecha de la 2da quincena aplica también para socios mensuales</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
              <!-- 1ra Quincena -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-purple-100 relative">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                  <span class="font-medium text-purple-800">1ra Quincena</span>
                </div>
                <DatePicker 
                  v-model="formCuotas.fecha_quincena1"
                  placeholder="Seleccionar fecha"
                  input-class="bg-purple-50 border-purple-200 hover:border-purple-300"
                />
              </div>

              <!-- 2da Quincena -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 relative">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                  <span class="font-medium text-indigo-800">2da Quincena</span>
                </div>
                <DatePicker 
                  v-model="formCuotas.fecha_quincena2"
                  placeholder="Seleccionar fecha"
                  input-class="bg-indigo-50 border-indigo-200 hover:border-indigo-300"
                />
              </div>
            </div>

            <!-- Info de mensual -->
            <div class="mt-4 p-3 bg-white/70 rounded-xl border border-dashed border-gray-300 flex items-start gap-2">
              <span class="text-lg">💡</span>
              <p class="text-xs text-gray-600">
                <strong class="text-gray-700">Socios mensuales:</strong> Su fecha límite será la de la 2da quincena 
                <span v-if="formCuotas.fecha_quincena2" class="text-indigo-600 font-semibold">({{ formatearFechaCorta(formCuotas.fecha_quincena2) }})</span>
              </p>
            </div>
          </div>

          <!-- Resumen -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p class="text-sm font-medium text-gray-700 mb-2">📋 Resumen de cuotas a generar:</p>
            <div class="space-y-1 text-sm text-gray-600">
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
                <p class="text-gray-500 italic">Selecciona un socio para ver el resumen</p>
              </template>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              type="button"
              @click="modalGenerarCuotas = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="cuotasStore.loading"
            >
              {{ cuotasStore.loading ? 'Generando...' : 'Generar Cuotas' }}
            </button>
          </div>
        </form>
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
              Registra el pago de la cuota del socio
            </p>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-6">
          <!-- Card de información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <img 
                :src="getAvatarUrl(cuotaSeleccionada?.socio_natillera?.socio?.nombre || cuotaSeleccionada?.socio_natillera?.id, cuotaSeleccionada?.socio_natillera?.socio?.avatar_seed)" 
                :alt="cuotaSeleccionada?.socio_natillera?.socio?.nombre"
                class="w-14 h-14 rounded-xl flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate">
                  {{ cuotaSeleccionada?.socio_natillera?.socio?.nombre || 'Socio' }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ cuotaSeleccionada?.descripcion || 'Cuota' }}
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
              <div>
                <p class="text-xs text-gray-500 mb-1">Valor Cuota</p>
                <p class="font-bold text-gray-800 text-lg">
                  ${{ formatMoney(cuotaSeleccionada?.valor_cuota || 0) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Pendiente</p>
                <p class="font-bold text-orange-600 text-lg">
                  ${{ formatMoney((cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)) }}
                </p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleRegistrarPago" class="space-y-5">
            <!-- Campo de valor del pago -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Valor del pago <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-500 z-10">
                  <CurrencyDollarIcon class="w-5 h-5" />
                </div>
                <input 
                  :value="formatearValorPago(formPago.valor)"
                  @input="handleValorPagoInput($event)"
                  type="text" 
                  class="w-full pl-12 pr-4 py-3.5 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-natillera-500 focus:ring-2 focus:ring-natillera-200 transition-all outline-none"
                  :placeholder="`Máx: ${formatMoney((cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0))}`"
                  required
                />
              </div>
              <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>Máximo disponible:</span>
                <span class="font-semibold text-orange-600">${{ formatMoney((cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)) }}</span>
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

    <!-- Modal Confirmación de Pago con Comprobante Visual -->
    <div v-if="modalConfirmacion" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cerrarConfirmacion"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-4 text-center">
          ¡Pago Registrado! 🎉
        </h3>

        <!-- Comprobante Visual (esto se convierte en imagen) -->
        <div 
          id="comprobante-pago"
          ref="comprobanteRef"
          class="rounded-2xl overflow-hidden mb-4"
          style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
        >
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #0d9488 100%); padding: 24px; color: white;">
            <!-- Header del comprobante -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px;">✓</span>
                </div>
                <span style="font-weight: bold; font-size: 18px;">Natillera</span>
              </div>
              <span style="color: rgba(255,255,255,0.8); font-size: 14px;">Comprobante de Pago</span>
            </div>

            <!-- Nombre de la natillera -->
            <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Natillera</p>
              <p style="font-weight: 600; font-size: 18px; margin: 4px 0 0 0;">{{ natilleraNombre || 'Mi Natillera' }}</p>
            </div>

            <!-- Valor grande -->
            <div style="text-align: center; padding: 24px 0;">
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px 0;">Valor Pagado</p>
              <p style="font-size: 48px; font-weight: bold; margin: 0; letter-spacing: -2px;">
                ${{ formatMoney(pagoRegistrado?.valor) }}
              </p>
            </div>

            <!-- Información de pago parcial (si aplica) -->
            <div v-if="pagoRegistrado?.esParcial" style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; margin-top: 16px; border: 1.5px solid rgba(251, 191, 36, 0.3);">
              <p style="color: rgba(255,255,255,0.9); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; font-weight: bold;">Pago Parcial</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <p style="color: rgba(255,255,255,0.7); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Total Pagado</p>
                  <p style="font-weight: 600; font-size: 16px; margin: 4px 0 0 0;">${{ formatMoney(pagoRegistrado?.valorPagadoTotal) }}</p>
                </div>
                <div>
                  <p style="color: rgba(255,255,255,0.7); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Pendiente</p>
                  <p style="font-weight: 600; font-size: 16px; margin: 4px 0 0 0; color: #fbbf24;">${{ formatMoney(pagoRegistrado?.valorPendiente) }}</p>
                </div>
              </div>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
                <p style="color: rgba(255,255,255,0.7); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Valor Total de la Cuota</p>
                <p style="font-weight: 600; font-size: 18px; margin: 4px 0 0 0;">${{ formatMoney(pagoRegistrado?.valorCuota) }}</p>
              </div>
            </div>

            <!-- Detalles -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Socio</p>
                <p style="font-weight: 600; margin: 4px 0 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ pagoRegistrado?.socioNombre }}</p>
              </div>
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Cuota</p>
                <p style="font-weight: 600; margin: 4px 0 0 0;">{{ pagoRegistrado?.descripcionCuota || 'Cuota mensual' }}</p>
              </div>
            </div>

            <!-- Fecha -->
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Fecha de Pago</p>
                <p style="font-weight: 600; margin: 4px 0 0 0;">{{ pagoRegistrado?.fecha }}</p>
              </div>
              <div style="text-align: right;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Estado</p>
                <p style="font-weight: 600; color: #a7f3d0; margin: 4px 0 0 0;">✓ Pagado</p>
              </div>
            </div>
            
            <!-- Código de comprobante -->
            <div v-if="pagoRegistrado?.codigoComprobante" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); text-align: center;">
              <p style="color: rgba(255,255,255,0.9); font-weight: 600; font-size: 14px; font-family: monospace; letter-spacing: 2px; margin: 0;">
                {{ pagoRegistrado.codigoComprobante }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="space-y-3">
          <button 
            @click="descargarComprobante"
            :disabled="generandoImagen"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
            {{ generandoImagen ? 'Generando...' : 'Descargar Imagen' }}
          </button>

          <button 
            v-if="pagoRegistrado?.socioTelefono"
            @click="compartirWhatsApp"
            :disabled="generandoImagen"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <ChatBubbleLeftIcon class="w-5 h-5" />
            {{ generandoImagen ? 'Preparando...' : '📲 Compartir por WhatsApp' }}
          </button>
          
          <button 
            @click="cerrarConfirmacion"
            class="btn-secondary w-full"
          >
            Cerrar
          </button>
        </div>

        <p class="text-xs text-gray-400 text-center mt-4">
          💡 En celular podrás enviar la imagen directamente a WhatsApp
        </p>
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
                :src="getAvatarUrl(cuotaEditando?.socio_natillera?.socio?.nombre || cuotaEditando?.socio_natillera?.id, cuotaEditando?.socio_natillera?.socio?.avatar_seed)" 
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
                Nuevo Valor de la Cuota <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-500 z-10">
                  <CurrencyDollarIcon class="w-5 h-5" />
                </div>
                <input 
                  :value="formatearValorPago(formEditarCuota.valor_cuota)"
                  @input="handleValorCuotaEditarInput($event)"
                  type="text" 
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { useSociosStore } from '../../stores/socios'
import { supabase } from '../../lib/supabase'
// Ya no necesitamos html2canvas, dibujamos directamente en canvas
import { 
  ArrowLeftIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  TableCellsIcon,
  Squares2X2Icon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import DatePicker from '../../components/DatePicker.vue'
import * as XLSX from 'xlsx-js-style'

const props = defineProps({
  id: String
})

const route = useRoute()
const cuotasStore = useCuotasStore()
const sociosStore = useSociosStore()

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
const natilleraNombre = ref('')
const comprobanteRef = ref(null)
const generandoImagen = ref(false)

// Configuración de meses de la natillera
const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())
const mesSeleccionado = ref(null)
const filtroEstado = ref('todos')
const filtroPeriodicidad = ref('todos')
const busquedaCuotas = ref('')
const mostrarFiltros = ref(false)
const inputBusquedaRef = ref(null)
const vistaExcel = ref(false) // false = vista tarjetas, true = vista Excel

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
    const nombreArchivo = `Cuotas_${mesNombre}_${anioNatillera.value}_${new Date().toISOString().split('T')[0]}.xlsx`
    
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

// Forzar vista de tarjetas en móvil
const checkMobileView = () => {
  if (window.innerWidth < 768) { // md breakpoint de Tailwind
    vistaExcel.value = false
  }
}

onMounted(() => {
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView)
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

// Cuotas del mes actual (sin filtro de estado)
const cuotasMesActual = computed(() => {
  if (!mesSeleccionado.value) return cuotasStore.cuotas
  return cuotasStore.getCuotasPorMes(mesSeleccionado.value, anioNatillera.value)
})

// Cuotas filtradas por estado, periodicidad y búsqueda (para mostrar en la lista)
const cuotasFiltradas = computed(() => {
  let filtradas = cuotasMesActual.value

  // Filtro por estado
  if (filtroEstado.value !== 'todos') {
    if (filtroEstado.value === 'pendiente') {
      // Pendientes incluye tanto 'pendiente' como 'parcial'
      filtradas = filtradas.filter(c => c.estado === 'pendiente' || c.estado === 'parcial' || c.estado === 'programada')
    } else {
      filtradas = filtradas.filter(c => c.estado === filtroEstado.value)
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
      'parcial': 2, // Parcial tiene la misma prioridad que pendiente
      'programada': 3,
      'pagada': 4
    }
    
    const prioridadA = prioridadEstado[a.estado] || 5
    const prioridadB = prioridadEstado[b.estado] || 5
    
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

// Totales para la vista Excel
const totalesExcel = computed(() => {
  const totalValorCuota = cuotasFiltradas.value.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
  const totalValorPagado = cuotasFiltradas.value.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  const totalPendiente = cuotasFiltradas.value.reduce((sum, c) => {
    const pendiente = (c.valor_cuota || 0) - (c.valor_pagado || 0)
    return sum + (pendiente > 0 ? pendiente : 0)
  }, 0)
  
  return {
    totalValorCuota,
    totalValorPagado,
    totalPendiente
  }
})

// Resumen del mes actual
const resumenMesActual = computed(() => {
  if (!mesSeleccionado.value) return cuotasStore.calcularResumenCuotas()
  return cuotasStore.getResumenPorMes(mesSeleccionado.value, anioNatillera.value)
})

// Función para obtener resumen de un mes específico (para los badges de los tabs)
function getResumenMes(mes) {
  return cuotasStore.getResumenPorMes(mes, anioNatillera.value)
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
      const maxValor = (cuotaSeleccionada.value?.valor_cuota || 0) - (cuotaSeleccionada.value?.valor_pagado || 0)
      // Limitar al máximo disponible
      formPago.valor = Math.min(numero, maxValor)
    }
  }
}

const id = props.id || route.params.id
const mesParam = computed(() => {
  const mes = route.params.mes
  return mes ? parseInt(mes, 10) : null
})

const resumen = computed(() => cuotasStore.calcularResumenCuotas())

// Cuando cambia el mes seleccionado, actualizar el formulario y resetear filtros
watch(mesSeleccionado, async (nuevoMes) => {
  if (nuevoMes) {
    formCuotas.mes = nuevoMes
    filtroPeriodicidad.value = 'todos' // Resetear filtro de periodicidad
    
    // Solo generar cuotas automáticamente si el mes seleccionado es el mes actual
    const fechaActual = new Date()
    const mesActual = fechaActual.getMonth() + 1 // 1-12
    const anioActual = fechaActual.getFullYear()
    
    // Verificar que el mes seleccionado sea el mes actual y el año coincida
    if (nuevoMes === mesActual && anioNatillera.value === anioActual) {
      // Intentar generar cuotas automáticamente para el mes actual
      try {
        const result = await cuotasStore.generarCuotasAutomaticas(id, nuevoMes, anioNatillera.value)
        if (result.success && !result.yaExisten) {
          console.log(`✅ Cuotas generadas automáticamente para el mes ${nuevoMes}`)
          // Recargar cuotas para mostrar las nuevas
          await cuotasStore.fetchCuotasNatillera(id)
        }
      } catch (error) {
        console.error('Error en generación automática:', error)
        // No mostrar error al usuario, solo loguear
      }
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

function getAvatarUrl(seed, avatarSeed = null) {
  // Usar DiceBear Avatars con estilo "adventurer"
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
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

function abrirModalPago(cuota) {
  cuotaSeleccionada.value = cuota
  // Inicializar con el valor pendiente completo
  const valorPendiente = cuota.valor_cuota - (cuota.valor_pagado || 0)
  formPago.valor = valorPendiente > 0 ? valorPendiente : 0
  modalPago.value = true
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

async function guardarEdicionCuota() {
  if (!cuotaEditando.value) return
  
  try {
    const datosActualizar = {
      valor_cuota: formEditarCuota.valor_cuota || 0
    }
    
    const result = await cuotasStore.actualizarCuota(cuotaEditando.value.id, datosActualizar)
    
    if (result.success) {
      modalEditarCuota.value = false
      cuotaEditando.value = null
      // Recargar cuotas para asegurar que todo esté actualizado
      await cuotasStore.fetchCuotasNatillera(id)
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
    .select('reglas_multas')
    .eq('id', id)
    .single()
  
  if (natilleraError) {
    alert('Error al obtener configuración de la natillera: ' + natilleraError.message)
    return
  }
  
  const reglasMultas = natillera.reglas_multas || {}
  const diasGracia = reglasMultas.dias_gracia || 3

  const mesLabel = todosMeses.find(m => m.value === formCuotas.mes)?.label || ''
  
  // Calcular fecha de vencimiento (restando días de gracia de la fecha límite)
  function calcularFechaVencimiento(fechaLimiteStr) {
    if (!fechaLimiteStr) return fechaLimiteStr
    const fechaLimite = new Date(fechaLimiteStr)
    fechaLimite.setDate(fechaLimite.getDate() - diasGracia)
    return fechaLimite.toISOString().split('T')[0]
  }
  
  // La fecha mensual es la misma que la 2da quincena
  const result = await cuotasStore.generarCuotasPeriodo(
    id,
    {
      mensual: { 
        vencimiento: calcularFechaVencimiento(formCuotas.fecha_quincena2), 
        limite: formCuotas.fecha_quincena2 
      },
      quincena1: { 
        vencimiento: calcularFechaVencimiento(formCuotas.fecha_quincena1), 
        limite: formCuotas.fecha_quincena1 
      },
      quincena2: { 
        vencimiento: calcularFechaVencimiento(formCuotas.fecha_quincena2), 
        limite: formCuotas.fecha_quincena2 
      }
    },
    mesLabel,
    formCuotas.mes,
    anioNatillera.value,
    formCuotas.tipoGeneracion === 'unSocio' ? formCuotas.socioSeleccionado : null
  )

  if (result.success) {
    modalGenerarCuotas.value = false
    formCuotas.fecha_quincena1 = ''
    formCuotas.fecha_quincena2 = ''
    // Cambiar al mes generado
    mesSeleccionado.value = formCuotas.mes
    // Recargar cuotas y conteo
    cuotasStore.fetchCuotasNatillera(id)
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
    const valorPagadoTotal = cuotaActualizada?.valor_pagado || (cuotaSeleccionada.value.valor_pagado || 0) + valorPagado
    const valorPendiente = valorCuota - valorPagadoTotal
    const esParcial = valorPendiente > 0 && valorPagadoTotal < valorCuota
    
    // Obtener el código del comprobante
    const codigoComprobante = cuotaActualizada?.codigo_comprobante || null
    console.log('Código de comprobante obtenido:', codigoComprobante)
    console.log('Cuota actualizada completa:', cuotaActualizada)
    
    // Guardar info del pago para el modal de confirmación
    pagoRegistrado.value = {
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
      })
    }
    
    console.log('pagoRegistrado.value completo:', pagoRegistrado.value)
    
    modalPago.value = false
    modalConfirmacion.value = true
    cuotaSeleccionada.value = null
    
    // Recargar cuotas para actualizar el resumen
    cuotasStore.fetchCuotasNatillera(id)
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
      const codigoComprobante = pagoRegistrado.value?.codigoComprobante
      const width = 480
      // Altura normal (el código ahora está dentro del área del badge)
      const height = esParcial ? 760 : 680
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
      const cardHeight = esParcial ? 570 : 485
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
      
      // Si es pago parcial, mostrar información adicional
      if (esParcial) {
        // Ajustar posición si hay código
        const infoParcialY = codigoY ? codigoY + 25 : badgeY + 50
        // Card para información de pago parcial
        ctx.fillStyle = '#fef3c7'
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoParcialY, cardInnerWidth, 80, 14)
        ctx.fill()
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoParcialY, cardInnerWidth, 80, 14)
        ctx.stroke()
        
        // Título
        ctx.fillStyle = '#92400e'
        ctx.font = 'bold 11px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('PAGO PARCIAL', cardInnerX + 18, infoParcialY + 20)
        
        // Información del pago parcial
        ctx.fillStyle = '#78350f'
        ctx.font = 'bold 13px Arial'
        ctx.textAlign = 'left'
        
        // Total pagado
        const totalPagadoText = 'Total pagado: $' + formatMoney(pagoRegistrado.value?.valorPagadoTotal || 0)
        ctx.fillText(totalPagadoText, cardInnerX + 18, infoParcialY + 42)
        
        // Pendiente
        const pendienteText = 'Pendiente: $' + formatMoney(pagoRegistrado.value?.valorPendiente || 0)
        ctx.fillText(pendienteText, cardInnerX + 18, infoParcialY + 62)
        
        // Valor total de la cuota (derecha)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#92400e'
        ctx.font = '11px Arial'
        ctx.fillText('Valor cuota:', cardInnerX + cardInnerWidth - 18, infoParcialY + 42)
        ctx.fillStyle = '#78350f'
        ctx.font = 'bold 13px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorCuota || 0), cardInnerX + cardInnerWidth - 18, infoParcialY + 62)
      }
      
      // === DETALLES EN CARDS ===
      // Ajustar posición de los detalles si hay código
      let detailsY
      if (esParcial) {
        detailsY = codigoY ? codigoY + 75 : badgeY + 150
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
      }
    }
  } finally {
    generandoImagen.value = false
  }
}

function cerrarConfirmacion() {
  modalConfirmacion.value = false
  pagoRegistrado.value = null
}

function reenviarComprobante(cuota) {
  // Calcular si es parcial
  const valorCuota = cuota.valor_cuota
  const valorPagadoTotal = cuota.valor_pagado || 0
  const valorPendiente = valorCuota - valorPagadoTotal
  const esParcial = valorPendiente > 0 && cuota.estado === 'parcial'
  
  // Preparar datos del pago para mostrar el comprobante
  pagoRegistrado.value = {
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
  
  modalConfirmacion.value = true
}

async function cargarNatillera() {
  const { data } = await supabase
    .from('natilleras')
    .select('nombre, mes_inicio, mes_fin, anio')
    .eq('id', id)
    .single()
  
  if (data) {
    natilleraNombre.value = data.nombre
    mesInicio.value = data.mes_inicio || 1
    mesFin.value = data.mes_fin || 11
    anioNatillera.value = data.anio || new Date().getFullYear()
    
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
  
  // Cargar conteo de socios por periodicidad
  await cargarConteoSocios()
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
  // Obtener las cuotas del mes seleccionado
  const cuotasDelMes = cuotasStore.getCuotasPorMes(mes, anioNatillera.value)
  
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

// Función para calcular fechas por defecto basadas en el mes y días de gracia
function calcularFechasPorDefecto(mes, anio, diasGracia) {
  // Primera quincena: día 15 + días de gracia
  const fechaQuincena1 = new Date(anio, mes - 1, 15 + diasGracia)
  
  // Segunda quincena: último día del mes + días de gracia
  // Obtener el último día del mes
  const ultimoDiaMes = new Date(anio, mes, 0).getDate() // 0 = último día del mes anterior (que es el último del mes actual)
  const fechaQuincena2 = new Date(anio, mes - 1, ultimoDiaMes + diasGracia)
  
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
        .select('reglas_multas')
        .eq('id', id)
        .single()
      
      const diasGracia = natillera?.reglas_multas?.dias_gracia || 3
      
      // Calcular fechas por defecto
      const fechasPorDefecto = calcularFechasPorDefecto(
        mesParaCalcular,
        anioNatillera.value,
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
    
    // Obtener los IDs de socios_natillera de esta natillera
    const { data: sociosNatillera, error: sociosError } = await supabase
      .from('socios_natillera')
      .select('id')
      .eq('natillera_id', id)

    if (sociosError) throw sociosError

    if (!sociosNatillera || sociosNatillera.length === 0) {
      return
    }

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    // Eliminar solo las cuotas pendientes y en mora del mes y año seleccionados
    // NO eliminar las pagadas ni parciales
    const { error: deleteError } = await supabase
      .from('cuotas')
      .delete()
      .in('socio_natillera_id', socioNatilleraIds)
      .eq('mes', mesSeleccionado.value)
      .eq('anio', anioNatillera.value)
      .in('estado', ['pendiente', 'mora', 'programada'])

    if (deleteError) throw deleteError

    // Recargar cuotas
    await cuotasStore.fetchCuotasNatillera(id)
    
    modalConfirmarBorrar.value = false
  } catch (error) {
    console.error('Error borrando cuotas:', error)
    modalConfirmarBorrar.value = false
    alert('Error al borrar las cuotas: ' + error.message)
  } finally {
    cuotasStore.loading = false
  }
}


onMounted(() => {
  cargarNatillera().then(() => {
    cuotasStore.fetchCuotasNatillera(id)
  })
})
</script>


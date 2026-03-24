<template>
  <!-- Pantalla de carga inicial: en iPhone/Safari LoadingScreenIos; en Android la original -->
  <LoadingScreenIos
    v-if="inicializando && isIos"
    :show="true"
    title="Cargando Cuotas"
    message="Preparando la información"
  />
  <Transition
    v-else-if="inicializando"
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div class="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <!-- Fondo con gradiente animado -->
      <div class="absolute inset-0 bg-gradient-to-br from-natillera-50 via-emerald-50/80 to-teal-50"></div>
      
      <!-- Efectos decorativos de fondo -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Círculos grandes animados -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-natillera-200/40 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tr from-teal-200/40 to-natillera-200/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-natillera-100/30 via-emerald-100/20 to-teal-100/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>

      <!-- Contenido principal -->
      <div class="relative z-10 flex flex-col items-center justify-center">
        <!-- Contenedor del spinner -->
        <div class="relative mb-8">
          <!-- Círculo exterior con gradiente -->
          <div class="relative w-32 h-32">
            <!-- Anillo exterior animado -->
            <div class="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-natillera-200 via-emerald-200 to-teal-200 p-1">
              <div class="w-full h-full rounded-full bg-gradient-to-br from-natillera-50 via-emerald-50/80 to-teal-50"></div>
            </div>
            
            <!-- Anillo medio giratorio -->
            <div class="absolute inset-2 rounded-full border-4 border-transparent border-t-natillera-500 border-r-emerald-500 animate-spin" style="animation-duration: 1.5s;"></div>
            
            <!-- Anillo interior giratorio (dirección opuesta) -->
            <div class="absolute inset-4 rounded-full border-3 border-transparent border-b-teal-500 border-l-natillera-400 animate-spin" style="animation-duration: 1s; animation-direction: reverse;"></div>
            
            <!-- Icono central con efecto de pulso -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="relative">
                <!-- Fondo del icono con pulso -->
                <div class="absolute inset-0 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
                <!-- Icono -->
                <div class="relative bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full p-4 shadow-2xl shadow-natillera-500/50">
                  <CurrencyDollarIcon class="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Partículas decorativas alrededor -->
          <div class="absolute -top-4 -left-4 w-3 h-3 bg-natillera-400 rounded-full animate-ping" style="animation-delay: 0s;"></div>
          <div class="absolute -top-2 -right-6 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
          <div class="absolute -bottom-4 -left-6 w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping" style="animation-delay: 1s;"></div>
          <div class="absolute -bottom-2 -right-4 w-3 h-3 bg-natillera-300 rounded-full animate-ping" style="animation-delay: 1.5s;"></div>
        </div>

        <!-- Texto principal -->
        <div class="text-center space-y-3">
          <h2 class="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-natillera-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent animate-pulse">
            Cargando Cuotas
          </h2>
          <div class="flex items-center justify-center gap-2">
            <div class="w-2 h-2 bg-natillera-500 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
          </div>
          <p class="text-gray-600 text-base sm:text-lg font-medium mt-4">
            Preparando la información
          </p>
        </div>

        <!-- Barra de progreso decorativa -->
        <div class="mt-8 w-64 h-1.5 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
          <div class="h-full bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500 rounded-full progress-bar"></div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Pantalla de carga al reenviar comprobante (elegante, compatible Safari/iPhone) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-400 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cargandoComprobanteReenvio"
        class="cargando-comprobante-reenvio"
        role="status"
        aria-live="polite"
        aria-label="Preparando comprobante"
      >
        <!-- Fondo suave con orbes decorativos -->
        <div class="cargando-comprobante-reenvio__bg">
          <div class="cargando-comprobante-reenvio__orb cargando-comprobante-reenvio__orb--1"></div>
          <div class="cargando-comprobante-reenvio__orb cargando-comprobante-reenvio__orb--2"></div>
          <div class="cargando-comprobante-reenvio__orb cargando-comprobante-reenvio__orb--3"></div>
        </div>

        <div class="cargando-comprobante-reenvio__inner">
          <!-- Spinner doble anillo + icono central -->
          <div class="cargando-comprobante-reenvio__spinner-wrap">
            <div class="cargando-comprobante-reenvio__ring cargando-comprobante-reenvio__ring--outer"></div>
            <div class="cargando-comprobante-reenvio__ring cargando-comprobante-reenvio__ring--mid"></div>
            <div class="cargando-comprobante-reenvio__icon-wrap">
              <svg class="cargando-comprobante-reenvio__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <p class="cargando-comprobante-reenvio__title">Preparando comprobante</p>
          <p class="cargando-comprobante-reenvio__message">Listo en un momento</p>

          <!-- Barra de progreso sutil -->
          <div class="cargando-comprobante-reenvio__bar-wrap">
            <div class="cargando-comprobante-reenvio__bar"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <div v-if="!inicializando" class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header unificado - Desktop -->
    <div class="relative hidden md:block">
      <Breadcrumbs />
      <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <BackButton :to="`/natilleras/${id}/cuotas`" :inline="true" />
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3 flex-wrap">
                <div>
                  <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Cuotas y Pagos</h1>
                  <p class="text-gray-500 mt-0.5 text-sm">Gestiona las cuotas del mes seleccionado</p>
                </div>
                <div v-if="mesSeleccionado" class="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-xl border border-gray-200/80">
                  <span class="text-2xl">{{ getMesEmoji(mesSeleccionado) }}</span>
                  <div>
                    <p class="text-sm font-bold text-gray-800 leading-tight">{{ mesSeleccionadoLabel }}</p>
                    <p class="text-xs text-gray-500">{{ anioMesSeleccionado }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button v-if="!esVisor && esUsuarioAdmin" @click="abrirModalGenerarCuotas" class="btn-primary inline-flex items-center justify-center gap-2 text-sm sm:text-base">
              <PlusIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Generar Cuotas</span>
            </button>
            <button
              v-if="!esVisor && esUsuarioAdmin && mesSeleccionado && cuotasPendientesMes.length > 0"
              @click="confirmarBorrarCuotasMes"
              class="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-100 text-sm sm:text-base"
            >
              <TrashIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Borrar Cuotas</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Header unificado - Móvil -->
    <div class="relative md:hidden -mt-6 -mx-6 mb-[10px]">
      <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 mt-6 mx-6 border border-gray-200/80 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <BackButton :to="`/natilleras/${id}/cuotas`" :inline="true" />
          <div class="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <CurrencyDollarIcon class="w-5 h-5 text-white" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl font-bold text-gray-800">Cuotas y Pagos</h1>
            <p class="text-gray-500 mt-0.5 text-sm">Gestiona las cuotas del mes</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <p class="text-xs text-gray-500 font-medium">PERIODO</p>
          <button
            @click="abrirSelectorMes"
            class="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gray-200/80 text-left flex-1 min-w-0"
          >
            <span v-if="mesSeleccionado" class="text-xl flex-shrink-0">{{ getMesEmoji(mesSeleccionado) }}</span>
            <div class="min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ mesSeleccionadoLabel || 'Seleccionar' }}</p>
              <p v-if="mesSeleccionado" class="text-xs text-gray-500">{{ anioMesSeleccionado }}</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen del mes seleccionado - Desktop -->
    <div class="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
      <button 
        @click="filtroEstado = filtroEstado === 'pagada' ? 'todos' : 'pagada'"
        :class="[
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2',
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
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 border backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
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
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 border backdrop-blur-sm cursor-pointer transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
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

    <!-- Resumen del mes seleccionado - Móvil (2x2) -->
    <div class="md:hidden grid grid-cols-2 gap-3 mt-1 mb-3">
      <!-- Tarjeta Pagadas -->
      <button 
        @click="filtroEstado = filtroEstado === 'pagada' ? 'todos' : 'pagada'; cerrarFiltros()"
        :class="[
          'relative overflow-hidden rounded-xl p-4 flex flex-col items-start transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2',
          filtroEstado === 'pagada'
            ? 'bg-green-100 border-2 border-green-400 shadow-lg shadow-green-500/20 scale-105'
            : 'bg-green-50/80 border-2 border-transparent shadow-sm hover:shadow-md hover:bg-green-100/90'
        ]"
      >
        <div class="flex items-center justify-between w-full mb-2">
          <p class="text-xs font-medium text-gray-700 uppercase">PAGADAS</p>
          <span v-if="filtroEstado === 'pagada'" class="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs font-bold">✓</span>
        </div>
        <p class="text-3xl font-bold text-green-600 leading-tight">{{ resumenMesActual.pagadas }}</p>
      </button>
      
      <!-- Tarjeta Pendientes -->
      <button 
        @click="filtroEstado = filtroEstado === 'pendiente' ? 'todos' : 'pendiente'; cerrarFiltros()"
        :class="[
          'relative overflow-hidden rounded-xl p-4 flex flex-col items-start transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
          filtroEstado === 'pendiente'
            ? 'bg-amber-100 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
            : 'bg-amber-50/80 border-2 border-transparent shadow-sm hover:shadow-md hover:bg-amber-100/90'
        ]"
      >
        <div class="flex items-center justify-between w-full mb-2">
          <p class="text-xs font-medium text-gray-700 uppercase">PENDIENTES</p>
          <span v-if="filtroEstado === 'pendiente'" class="flex items-center justify-center w-5 h-5 bg-amber-500 text-white rounded-full text-xs font-bold">✓</span>
        </div>
        <p class="text-3xl font-bold text-orange-500 leading-tight">{{ resumenMesActual.pendientes }}</p>
      </button>
      
      <!-- Tarjeta En Mora -->
      <button 
        @click="filtroEstado = filtroEstado === 'mora' ? 'todos' : 'mora'; cerrarFiltros()"
        :class="[
          'relative overflow-hidden rounded-xl p-4 flex flex-col items-start transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
          filtroEstado === 'mora'
            ? 'bg-pink-100 border-2 border-red-400 shadow-lg shadow-red-500/20 scale-105'
            : 'bg-pink-50/80 border-2 border-transparent shadow-sm hover:shadow-md hover:bg-pink-100/90'
        ]"
      >
        <div class="flex items-center justify-between w-full mb-2">
          <p class="text-xs font-medium text-gray-700 uppercase">EN MORA</p>
          <span v-if="filtroEstado === 'mora'" class="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">✓</span>
        </div>
        <p class="text-3xl font-bold text-red-500 leading-tight">{{ resumenMesActual.enMora }}</p>
      </button>
      
      <!-- Tarjeta Total Recaudado -->
      <button 
        @click="modalDesgloseRecaudacion = true"
        class="relative overflow-hidden rounded-xl bg-green-50/80 p-4 flex flex-col items-start shadow-sm hover:shadow-md hover:bg-green-100/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 w-full"
      >
        <p class="text-xs font-medium text-gray-700 uppercase mb-2">TOTAL RECAUDADO</p>
        <p class="text-2xl font-bold text-green-600 leading-tight">${{ formatMoney(resumenMesActual.totalRecaudado || 0) }}</p>
      </button>
    </div>

    <!-- Barra de progreso móvil -->
    <div class="md:hidden mb-[10px]">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-purple-800 uppercase">PROGRESO DE RECAUDACIÓN</p>
          <p class="text-xs font-medium text-purple-800">{{ (resumenMesActual.porcentajeRecaudado || 0).toFixed(0) }}%</p>
        </div>
        <div class="relative w-full h-3 bg-purple-100 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
            :style="{ width: `${resumenMesActual.porcentajeRecaudado || 0}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Botón para mostrar/ocultar filtros - Desktop -->
    <div class="hidden md:flex items-center justify-between mb-4 flex-wrap gap-3">
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
          v-if="filtroEstado !== 'todos' || filtroPeriodicidad !== 'todos' || filtroTipoPago !== 'todos' || busquedaCuotas.trim()"
          @click="quitarFiltros"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl font-semibold text-sm text-red-700 hover:from-red-100 hover:to-orange-100 hover:border-red-400 hover:shadow-lg transition-all shadow-md"
        >
          <XMarkIcon class="w-5 h-5" />
          <span>Quitar Filtros</span>
        </button>
      </div>
      
      <!-- Indicador de filtros activos -->
      <div v-if="filtroEstado !== 'todos' || filtroPeriodicidad !== 'todos' || filtroTipoPago !== 'todos' || busquedaCuotas.trim()" class="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-natillera-50 to-emerald-50 border border-natillera-200 rounded-xl text-sm text-natillera-700 shadow-sm">
        <span class="w-2.5 h-2.5 rounded-full bg-natillera-500 animate-pulse shadow-sm"></span>
        <span class="font-semibold">Filtros activos</span>
      </div>
    </div>

    <!-- Panel de filtros (compartido desktop y móvil) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-active-class="transition-all duration-200 ease-in overflow-hidden"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="mostrarFiltros" class="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div class="border-t border-gray-200 bg-gray-50/50">
          <div class="flex flex-col gap-4 p-4">
        <!-- Filtros de Periodicidad -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Etiqueta -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <FunnelIcon class="w-5 h-5 text-gray-400" />
            <span class="text-sm font-semibold text-gray-700">Filtros de periodicidad</span>
          </div>
          
          <!-- Botones en la misma línea -->
          <div class="flex flex-nowrap gap-1 sm:gap-2 flex-1">
            <!-- Botón Todos -->
            <button
              @click="filtroPeriodicidad = 'todos'; cerrarFiltros()"
              :class="[
                'group relative px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden flex-shrink-0',
                filtroPeriodicidad === 'todos'
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'todos'"
                class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
              ></div>
              <span class="relative flex items-center gap-1 sm:gap-2">
                <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" :class="filtroPeriodicidad === 'todos' ? 'bg-white' : 'bg-gray-400'"></span>
                Todos
                <span 
                  :class="[
                    'px-1 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-bold',
                    filtroPeriodicidad === 'todos' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ cuotasMesActual.length }}
                </span>
              </span>
            </button>

            <!-- Mensual -->
            <button
              @click="filtroPeriodicidad = filtroPeriodicidad === 'mensual' ? 'todos' : 'mensual'; cerrarFiltros()"
              :class="[
                'group relative px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden flex-shrink-0',
                filtroPeriodicidad === 'mensual'
                  ? 'text-white shadow-lg shadow-natillera-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'mensual'"
                class="absolute inset-0 bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500"
              ></div>
              <span class="relative flex items-center gap-1 sm:gap-2">
                <span class="text-sm sm:text-lg">📅</span>
                <span class="hidden sm:inline">Mensual</span>
                <span class="sm:hidden">Mens.</span>
                <span 
                  :class="[
                    'px-1 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-bold',
                    filtroPeriodicidad === 'mensual' ? 'bg-white/20 text-white' : 'bg-natillera-100 text-natillera-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => c.quincena === 0 || c.quincena === null || !c.quincena).length }}
                </span>
              </span>
            </button>

            <!-- Quincenal -->
            <button
              @click="filtroPeriodicidad = filtroPeriodicidad === 'quincenal' ? 'todos' : 'quincenal'; cerrarFiltros()"
              :class="[
                'group relative px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden flex-shrink-0',
                filtroPeriodicidad === 'quincenal'
                  ? 'text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'quincenal'"
                class="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"
              ></div>
              <span class="relative flex items-center gap-1 sm:gap-2">
                <span class="text-sm sm:text-lg">🗓️</span>
                <span class="hidden sm:inline">Quincenal</span>
                <span class="sm:hidden">Quinc.</span>
                <span 
                  :class="[
                    'px-1 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-bold',
                    filtroPeriodicidad === 'quincenal' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => c.quincena).length }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Filtros de Forma de Pago -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Etiqueta -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <FunnelIcon class="w-5 h-5 text-gray-400" />
            <span class="text-sm font-semibold text-gray-700">Filtros de forma de pago</span>
          </div>
          
          <!-- Botones en la misma línea -->
          <div class="flex flex-nowrap gap-1 sm:gap-2 flex-1">
            <!-- Botón Todos -->
            <button
              @click="filtroTipoPago = 'todos'; cerrarFiltros()"
              :class="[
                'group relative px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden flex-shrink-0',
                filtroTipoPago === 'todos'
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroTipoPago === 'todos'"
                class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
              ></div>
              <span class="relative flex items-center gap-1 sm:gap-2">
                <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" :class="filtroTipoPago === 'todos' ? 'bg-white' : 'bg-gray-400'"></span>
                Todos
                <span 
                  :class="[
                    'px-1 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-bold',
                    filtroTipoPago === 'todos' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  ]"
                >
                  {{ cuotasMesActual.length }}
                </span>
              </span>
            </button>

            <!-- Efectivo -->
            <button
              @click="filtroTipoPago = filtroTipoPago === 'efectivo' ? 'todos' : 'efectivo'; cerrarFiltros()"
              :class="[
                'group relative px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden flex-shrink-0',
                filtroTipoPago === 'efectivo'
                  ? 'text-white shadow-lg shadow-green-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroTipoPago === 'efectivo'"
                class="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
              ></div>
              <span class="relative flex items-center gap-1 sm:gap-2">
                <span class="text-sm sm:text-lg">💵</span>
                <span class="hidden sm:inline">Efectivo</span>
                <span class="sm:hidden">Efect.</span>
                <span 
                  :class="[
                    'px-1 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-bold',
                    filtroTipoPago === 'efectivo' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => (c.tipo_pago || 'efectivo') === 'efectivo').length }}
                </span>
              </span>
            </button>

            <!-- Transferencia -->
            <button
              @click="filtroTipoPago = filtroTipoPago === 'transferencia' ? 'todos' : 'transferencia'; cerrarFiltros()"
              :class="[
                'group relative px-2 py-1.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden flex-shrink-0',
                filtroTipoPago === 'transferencia'
                  ? 'text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroTipoPago === 'transferencia'"
                class="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"
              ></div>
              <span class="relative flex items-center gap-1 sm:gap-2">
                <span class="text-sm sm:text-lg">💳</span>
                <span class="hidden sm:inline">Transferencia</span>
                <span class="sm:hidden">Transf.</span>
                <span 
                  :class="[
                    'px-1 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-xs font-bold',
                    filtroTipoPago === 'transferencia' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => c.tipo_pago === 'transferencia').length }}
                </span>
              </span>
            </button>
          </div>
        </div>
            </div>
          </div>
        </div>
    </Transition>

    <!-- Botón para mostrar/ocultar filtros - Móvil (arriba para que la búsqueda quede debajo) -->
    <div class="md:hidden mt-4 mb-4">
      <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 p-2">
          <button
            @click="mostrarFiltros = !mostrarFiltros"
            class="flex-1 flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-2">
              <FunnelIcon class="w-5 h-5 text-gray-600" />
              <span class="text-sm font-semibold text-gray-700">Mostrar Filtros</span>
              <span 
                v-if="cantidadFiltrosActivos > 0"
                class="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-natillera-500 text-white text-xs font-bold rounded-full"
              >
                {{ cantidadFiltrosActivos }}
              </span>
            </div>
            <ChevronDownIcon 
              :class="[
                'w-4 h-4 text-gray-600 transition-transform duration-300',
                mostrarFiltros ? 'rotate-180' : ''
              ]"
            />
          </button>
          
          <!-- Botón Quitar Filtros - Móvil -->
          <button
            v-if="filtroEstado !== 'todos' || filtroPeriodicidad !== 'todos' || filtroTipoPago !== 'todos' || busquedaCuotas.trim()"
            @click="quitarFiltros"
            class="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg font-semibold text-xs text-red-700 hover:from-red-100 hover:to-orange-100 hover:border-red-400 hover:shadow-lg transition-all shadow-md"
            title="Quitar Filtros"
          >
            <XMarkIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Quitar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda (debajo de la sección de filtros) -->
    <div class="mb-4">
      <div class="relative w-full md:max-w-md">
        <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
        </div>
        <input 
          ref="inputBusquedaRef"
          v-model="busquedaCuotas"
          type="text"
          placeholder="Buscar por nombre del socio, descripción de la cuota..."
          @keydown.esc="busquedaCuotas = ''"
          class="w-full pl-12 pr-12 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-natillera-500/50 focus:border-natillera-500 focus:bg-white transition-all shadow-sm"
        />
        <div v-if="busquedaCuotas.trim()" class="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
          <button
            @click="busquedaCuotas = ''"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Limpiar búsqueda"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

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
        <button v-if="!esVisor && esUsuarioAdmin" @click="abrirModalGenerarCuotas" class="btn-primary inline-flex items-center gap-2 shadow-lg">
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
      <!-- Título, contador y toggle de vista - Desktop -->
      <div class="hidden md:flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
          
          <!-- Vista desktop: Botones normales -->
          <div class="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-2.5 self-stretch shadow-md">
            <button
              @click="vistaAgrupada = false; vistaExcel = false; vistaLista = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                !vistaAgrupada && !vistaExcel && !vistaLista
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <Squares2X2Icon class="w-4 h-4" />
              <span>Tarjetas</span>
            </button>
            <button
              @click="vistaAgrupada = true; vistaExcel = false; vistaLista = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                vistaAgrupada && !vistaExcel && !vistaLista
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <UserGroupIcon class="w-4 h-4" />
              <span>Por Socio</span>
            </button>
            <button
              @click="vistaLista = true; vistaExcel = false; vistaAgrupada = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                vistaLista && !vistaExcel && !vistaAgrupada
                  ? 'bg-gradient-to-r from-natillera-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
            >
              <ListBulletIcon class="w-4 h-4" />
              <span>Lista</span>
            </button>
            <button
              @click="vistaExcel = true; vistaAgrupada = false; vistaLista = false"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold',
                vistaExcel && !vistaAgrupada && !vistaLista
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

      <!-- Sección móvil: Cuotas del Mes y Toggles -->
      <div class="md:hidden space-y-4">
        <!-- Sección "Cuotas del Mes" - Sin tarjeta -->
        <div v-if="cuotasMesActual.length > 0" class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon class="w-6 h-6 text-white" />
            </div>
            <span class="text-base font-semibold text-gray-800">Cuotas del Mes</span>
          </div>
          <span class="px-3 py-1.5 bg-green-500 text-white text-xs font-normal rounded-full whitespace-nowrap">
            {{ cuotasFiltradas.length === cuotasMesActual.length ? cuotasMesActual.length : `${cuotasFiltradas.length}/${cuotasMesActual.length}` }} Total
          </span>
        </div>

        <!-- Toggles de vista móvil -->
        <div class="grid grid-cols-3 gap-2">
          <button
            @click="vistaAgrupada = false; vistaExcel = false; vistaLista = false"
            class="py-3 px-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
            :class="!vistaAgrupada && !vistaExcel && !vistaLista 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border border-gray-200'"
          >
            <Squares2X2Icon class="w-5 h-5" />
            <span>Tarjetas</span>
          </button>
          <button
            @click="vistaAgrupada = true; vistaExcel = false; vistaLista = false"
            class="py-3 px-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
            :class="vistaAgrupada && !vistaExcel && !vistaLista 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border border-gray-200'"
          >
            <UserGroupIcon class="w-5 h-5" />
            <span>Por Socio</span>
          </button>
          <button
            @click="vistaLista = true; vistaExcel = false; vistaAgrupada = false"
            class="py-3 px-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-sm"
            :class="vistaLista && !vistaExcel && !vistaAgrupada 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-white text-gray-600 border border-gray-200'"
          >
            <ListBulletIcon class="w-5 h-5" />
            <span>Lista</span>
          </button>
        </div>
      </div>

      <!-- Vista Agrupada por Socio -->
      <template v-if="vistaAgrupada && !vistaExcel && !vistaLista">
        <div class="space-y-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4 md:space-y-0">
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
                    <span 
                      v-if="grupo.actividadesPendientes > 0"
                      class="text-sm font-semibold text-purple-600"
                    >
                      {{ getTextoActividadesGrupo(grupo) }}: ${{ formatMoney(grupo.actividadesPendientes) }}
                    </span>
                    <span 
                      v-if="grupo.cuotasPrestamosPendientes > 0"
                      class="text-sm font-semibold text-blue-600"
                    >
                      Cuotas de préstamos: ${{ formatMoney(grupo.cuotasPrestamosPendientes) }}
                    </span>
                    <span 
                      class="text-sm font-bold"
                      :class="grupo.totalAPagar > 0 ? 'text-red-700' : 'text-gray-500'"
                    >
                      Total a Pagar: ${{ formatMoney(grupo.totalAPagar) }}
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
                class="relative overflow-hidden rounded-2xl p-4 border cursor-pointer transition-all duration-200"
                :class="[
                  (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-50/95 border-2 border-green-300/85 shadow-md shadow-green-200/35' : 
                  (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-rose-50/95 border-2 border-red-300/75 shadow-md shadow-red-200/30' : 
                  (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-slate-50 border-2 border-slate-200/90 shadow-md shadow-slate-200/25' : 
                  tienePagoParcialCuota(cuota) ? 'bg-amber-50/95 border-2 border-amber-300/80 shadow-md shadow-amber-200/30' :
                  'bg-amber-50/90 border-2 border-amber-200/85 shadow-md shadow-amber-200/25'
                ]"
              >
                <!-- Etiqueta PAGO PARCIAL (solo cuando hay abono pero no está totalmente pagado) -->
                <div 
                  v-if="tienePagoParcialCuota(cuota)"
                  class="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-2xl z-20"
                >
                  ▲ PAGO PARCIAL
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
                        v-if="cuota.quincena === 1 || cuota.quincena === 2"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-md"
                      >
                        {{ cuota.quincena === 1 ? '1er' : '2da' }} Quincena
                      </span>
                      <span 
                        :class="[
                          'px-2.5 py-1 rounded-lg text-xs font-bold',
                          (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-100 text-green-700' :
                          (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-100 text-red-700' :
                          (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-100 text-gray-700' :
                          tienePagoParcialCuota(cuota) ? 'bg-amber-100 text-amber-800' :
                          'bg-orange-100 text-orange-700'
                        ]"
                      >
                        {{ (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagada' :
                            (cuota.estadoReal || cuota.estado) === 'mora' ? 'En Mora' :
                            (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' :
                            tienePagoParcialCuota(cuota) ? 'Pago Parcial' :
                            'Pendiente' }}
                      </span>
                      <!-- No calcular multa (solo raigo.16@gmail.com) -->
                      <label
                        v-if="esUsuarioAdmin"
                        class="flex items-center gap-1.5 ml-2 text-xs text-amber-700 cursor-pointer"
                        @click.stop
                      >
                        <input
                          type="checkbox"
                          :checked="!!cuota.no_calcular_multa"
                          @change="toggleNoCalcularMultaCuota(cuota)"
                          class="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>No calcular multa</span>
                      </label>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 w-full sm:w-auto">
                    <div class="text-right flex-1 sm:flex-none">
                      <!-- Información de pago parcial (total pagado > 0 pero < total a pagar) -->
                      <template v-if="tienePagoParcialCuota(cuota)">
                        <p class="text-xs text-gray-500 mb-0.5">Valor Pendiente</p>
                        <p class="font-bold text-base sm:text-lg text-orange-600">
                          ${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}
                        </p>
                        <p class="text-xs font-medium text-green-600 mt-1">
                          Pagado: ${{ formatMoney(getTotalPagadoConActividadesSocio(cuota)) }}
                        </p>
                        <!-- Desglose de lo pagado -->
                        <div class="mt-1 pt-1 border-t border-green-200/50">
                          <p 
                            v-if="(cuota.valor_pagado || 0) > 0"
                            class="text-xs font-semibold text-green-600"
                          >
                            <span class="inline-block w-2 h-2 bg-green-500 rounded-sm rotate-45 mr-1.5"></span>Cuota ${{ formatMoney(cuota.valor_pagado || 0) }}
                          </p>
                          <p 
                            v-if="(cuota.valor_pagado_sancion || 0) > 0"
                            class="text-xs font-semibold text-green-600 mt-0.5"
                          >
                            <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>Multa ${{ formatMoney(cuota.valor_pagado_sancion || 0) }}
                          </p>
                          <p 
                            v-if="getActividadesInfoSocio(cuota).pagadas > 0"
                            class="text-xs font-semibold text-emerald-600 mt-0.5"
                          >
                            <span class="inline-block w-2 h-2 bg-teal-500 rounded-sm mr-1.5"></span>{{ getTextoActividadesSocio(cuota) }} ${{ formatMoney(getActividadesInfoSocio(cuota).pagadas) }}
                          </p>
                        </div>
                      </template>
                      <template v-else>
                        <!-- Cuota pagada: mostrar total pagado y desglose (cuota + multa + actividades) -->
                        <template v-if="(cuota.estadoReal || cuota.estado) === 'pagada'">
                          <p class="text-xs text-gray-500 mb-0.5">Total pagado</p>
                          <p class="font-bold text-base sm:text-lg text-green-600">
                            ${{ formatMoney((cuota.valor_pagado || 0) + (cuota.valor_pagado_sancion || 0) + getActividadesInfoSocio(cuota).pagadas + getTotalCuotasPrestamosPagadasSocioSync(cuota)) }}
                          </p>
                          <p class="text-xs font-semibold mt-0.5 text-green-600">
                            <span class="inline-block w-2 h-2 bg-green-500 rounded-sm rotate-45 mr-1.5"></span>Cuota ${{ formatMoney(cuota.valor_cuota) }}
                          </p>
                          <p 
                            v-if="(cuota.valor_pagado_sancion || 0) > 0"
                            class="text-xs font-semibold mt-0.5 text-green-600"
                          >
                            <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>Multa ${{ formatMoney(cuota.valor_pagado_sancion || 0) }}
                          </p>
                          <p 
                            v-if="getActividadesInfoSocio(cuota).pagadas > 0"
                            class="text-xs font-semibold mt-0.5 text-emerald-600"
                          >
                            <span class="inline-block w-2 h-2 bg-teal-500 rounded-sm mr-1.5"></span>{{ getTextoActividadesSocio(cuota) }} ${{ formatMoney(getActividadesInfoSocio(cuota).pagadas) }}
                          </p>
                          <p 
                            v-if="getTotalCuotasPrestamosPagadasSocioSync(cuota) > 0"
                            class="text-xs font-semibold mt-0.5 text-blue-600"
                          >
                            <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>Cuotas de préstamos ${{ formatMoney(getTotalCuotasPrestamosPagadasSocioSync(cuota)) }}
                          </p>
                        </template>
                        <!-- Cuota pendiente o mora: total a pagar y desglose -->
                        <template v-else>
                          <p 
                            v-if="getActividadesPendientesSocio(cuota) > 0 || getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0 || getSancionCuota(cuota) > 0"
                            class="text-xs text-gray-500 mb-0.5"
                          >
                            Total a Pagar
                          </p>
                          <p class="font-bold text-base sm:text-lg"
                            :class="(cuota.estadoReal || cuota.estado) === 'mora' ? 'text-red-600' : 
                                    getActividadesPendientesSocio(cuota) > 0 || getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0 ? 'text-orange-600' : 'text-gray-800'"
                          >
                            ${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}
                          </p>
                          <p 
                            v-if="getSancionCuota(cuota) > 0 || getActividadesPendientesSocio(cuota) > 0"
                            class="text-xs font-semibold mt-0.5 text-gray-700"
                          >
                            <span class="inline-block w-2 h-2 bg-gray-600 rounded-sm rotate-45 mr-1.5"></span>Cuota ${{ formatMoney(cuota.valor_cuota) }}
                          </p>
                          <p 
                            v-if="getSancionCuota(cuota) > 0" 
                            class="text-xs font-semibold mt-0.5 text-red-600"
                          >
                            <span class="inline-block w-2 h-2 bg-red-600 rounded-full mr-1.5"></span>Sanción ${{ formatMoney(getSancionCuota(cuota)) }}
                          </p>
                          <p 
                            v-if="getActividadesPendientesSocio(cuota) > 0" 
                            class="text-xs font-semibold mt-0.5 text-purple-600"
                          >
                            <span class="inline-block w-2 h-2 bg-purple-600 rounded-sm mr-1.5"></span>{{ getTextoActividadesSocio(cuota) }} ${{ formatMoney(getActividadesPendientesSocio(cuota)) }}
                          </p>
                          <p 
                            v-if="getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" 
                            class="text-xs font-semibold mt-0.5 text-blue-600"
                          >
                            <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>Cuotas de préstamos ${{ formatMoney(getTotalCuotasPrestamosPendientesSocioSync(cuota)) }}
                          </p>
                          <p 
                            class="text-xs mt-1"
                            :class="getTotalPagadoConActividadesSocio(cuota) > 0 ? 'text-green-600 font-medium' : 'text-gray-500'"
                          >
                            Pagado: ${{ formatMoney(getTotalPagadoConActividadesSocio(cuota)) }}
                          </p>
                        </template>
                      </template>
                    </div>
                    
                    <!-- Botones desktop pago parcial: Pagar ancho completo, Editar y Reenviar mitad cada uno -->
                    <template v-if="tienePagoParcialCuota(cuota)">
                      <div class="hidden sm:flex flex-col gap-2 w-full min-w-0" @click.stop>
                        <button 
                          v-if="!esVisor"
                          @click="abrirModalPago(cuota)"
                          class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                          <CurrencyDollarIcon class="w-5 h-5" />
                          <span>$ Pagar</span>
                        </button>
                        <div class="flex gap-2 w-full">
                          <button 
                            v-if="!esVisor"
                            @click="abrirModalEditar(cuota)"
                            class="flex-1 min-w-0 px-3 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
                            title="Editar pago"
                          >
                            <CheckIcon class="w-4 h-4" />
                            <span class="hidden lg:inline">Editar</span>
                          </button>
                          <button 
                            @click="reenviarComprobante(cuota)"
                            class="flex-1 min-w-0 px-3 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5"
                            title="Reenviar comprobante"
                          >
                            <ArrowPathIcon class="w-4 h-4" />
                            <span class="hidden lg:inline">Reenviar</span>
                          </button>
                        </div>
                      </div>
                    </template>
                    
                    <!-- Otras cuotas desktop -->
                    <template v-else>
                      <div class="flex items-center justify-end gap-2 sm:flex-shrink-0" @click.stop>
                        <button 
                          v-if="!esVisor && (cuota.estadoReal || cuota.estado) !== 'pagada'"
                          @click="abrirModalPago(cuota)"
                          class="hidden sm:flex px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm whitespace-nowrap items-center gap-2"
                        >
                          <CurrencyDollarIcon class="w-4 h-4" />
                          <span>$ Pagar</span>
                        </button>
                        <template v-if="(cuota.estadoReal || cuota.estado) === 'pagada'">
                        <button 
                            v-if="!esVisor"
                            @click="abrirModalEditar(cuota)"
                            class="hidden sm:flex px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm items-center gap-2"
                            title="Editar pago"
                          >
                            <PencilIcon class="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          <button 
                          @click="reenviarComprobante(cuota)"
                          class="hidden sm:flex px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm items-center gap-2"
                          title="Reenviar comprobante"
                        >
                          <ArrowPathIcon class="w-4 h-4" />
                          <span>Reenviar</span>
                        </button>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
                
                <!-- Botones móvil flat -->
                <div class="sm:hidden flex flex-col gap-2 mt-3" @click.stop>
                  <template v-if="tienePagoParcialCuota(cuota)">
                    <button 
                      v-if="!esVisor"
                      @click="abrirModalPago(cuota)"
                      class="w-full px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon class="w-5 h-5" />
                      <span>$ Pagar</span>
                    </button>
                    <div v-if="!esVisor" class="flex gap-2">
                      <button 
                        @click="abrirModalEditar(cuota)"
                        class="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                      >
                        <CheckIcon class="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button 
                        @click="reenviarComprobante(cuota)"
                        class="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                      >
                        <ArrowPathIcon class="w-4 h-4" />
                        <span>Reenviar</span>
                      </button>
                    </div>
                  </template>
                  <button 
                    v-else-if="!esVisor && (cuota.estadoReal || cuota.estado) !== 'pagada'"
                    @click="abrirModalPago(cuota)"
                    class="w-full px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <CurrencyDollarIcon class="w-5 h-5" />
                    <span>$ Pagar</span>
                  </button>
                  <template v-else-if="(cuota.estadoReal || cuota.estado) === 'pagada'">
                  <button 
                      v-if="!esVisor"
                      @click="abrirModalEditar(cuota)"
                      class="w-full px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                    >
                      <PencilIcon class="w-5 h-5" />
                      <span>Editar</span>
                    </button>
                    <button 
                    @click="reenviarComprobante(cuota)"
                    class="w-full px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon class="w-5 h-5" />
                    <span>Reenviar Comprobante</span>
                  </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vista Tarjetas - Diseño flat según estado -->
      <template v-else-if="!vistaExcel && !vistaAgrupada && !vistaLista">
        <div class="space-y-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4 md:space-y-0">
          <div 
            v-for="cuota in cuotasFiltradas" 
            :key="cuota.id"
            @click="abrirModalDetalleCuota(cuota)"
            class="relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer"
            :class="[
              (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-50/95 border-2 border-green-300/85 shadow-md shadow-green-200/35' : 
              (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-rose-50/95 border-2 border-red-300/75 shadow-md shadow-red-200/30' : 
              (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-slate-50 border-2 border-slate-200/90 shadow-md shadow-slate-200/25' : 
              tienePagoParcialCuota(cuota) ? 'bg-amber-50/95 border-2 border-amber-300/80 shadow-md shadow-amber-200/30' :
              'bg-amber-50/90 border-2 border-amber-200/85 shadow-md shadow-amber-200/25'
            ]"
          >
            <!-- Etiqueta PAGO PARCIAL (esquina superior derecha, solo cuando hay abono pero no está totalmente pagado) -->
            <div 
              v-if="tienePagoParcialCuota(cuota)"
              class="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-2xl z-20"
            >
              ▲ PAGO PARCIAL
            </div>
            
            <!-- Indicador de ajuste de valor -->
            <div 
              v-if="tieneAjuste(cuota)"
              class="absolute top-0 left-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-2xl z-20 flex items-center gap-1"
              :title="getTextoAjuste(cuota)"
            >
              <InformationCircleIcon class="w-3 h-3" />
              <span>AJUSTE</span>
            </div>
            
            <div class="relative z-10">
            <!-- Encabezado: Avatar + Nombre + Etiquetas + Vencimiento -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3 flex-wrap">
                <!-- Avatar circular -->
                <div class="relative flex-shrink-0">
                  <img 
                    @click.stop="verDetalleSocio(cuota.socio_natillera)"
                    :src="getAvatarUrl(cuota.socio_natillera?.socio?.nombre || cuota.socio_natillera?.id, cuota.socio_natillera?.socio?.avatar_seed, cuota.socio_natillera?.socio?.avatar_style)" 
                    :alt="cuota.socio_natillera?.socio?.nombre"
                    class="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
                    :class="[
                      (cuota.estadoReal || cuota.estado) === 'pagada' ? 'ring-2 ring-green-400' : 
                      (cuota.estadoReal || cuota.estado) === 'mora' ? 'ring-2 ring-red-300' : 'ring-2 ring-gray-200'
                    ]"
                  />
                  <!-- Icono estado en avatar -->
                  <div 
                    :class="[
                      'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white',
                      (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-500 text-white' : 
                      (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                    ]"
                  >
                    <CheckCircleIcon v-if="(cuota.estadoReal || cuota.estado) === 'pagada'" class="w-3 h-3" />
                    <ExclamationCircleIcon v-else-if="(cuota.estadoReal || cuota.estado) === 'mora'" class="w-3 h-3" />
                    <CalendarIcon v-else class="w-3 h-3" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-base sm:text-lg font-bold text-gray-900">
                    {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span 
                      v-if="cuota.quincena === 1 || cuota.quincena === 2" 
                      class="inline-flex items-center px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-md"
                    >
                      {{ cuota.quincena === 1 ? '1er' : '2da' }} Quincena
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md"
                    >
                      Mensual
                    </span>
                    <span class="text-xs text-gray-600 flex items-center gap-1">
                      <CalendarIcon class="w-3.5 h-3.5 text-gray-400" />
                      Vence: {{ formatDate(cuota.fecha_vencimiento || cuota.fecha_limite) }}
                    </span>
                    <span 
                      v-if="(cuota.estadoReal || cuota.estado) === 'pagada' && cuota.fecha_pago"
                      class="text-xs text-green-600 flex items-center gap-1"
                    >
                      <CheckCircleIcon class="w-3.5 h-3.5" />
                      Pagado: {{ formatDate(cuota.fecha_pago) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Bloque de detalles: etiqueta estado + monto + desglose (flat) -->
              <div class="rounded-xl p-3 sm:p-4 bg-white/60 flex flex-col gap-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <!-- Pago parcial primero: si tiene abono pero no está pagado del todo → Valor Pendiente + naranja -->
                    <template v-if="tienePagoParcialCuota(cuota)">
                      <p class="text-xs text-gray-500">Valor Pendiente</p>
                      <p class="text-xl sm:text-2xl font-bold text-orange-600">
                        ${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}
                      </p>
                    </template>
                    <!-- Estado mora (sin pago parcial) -->
                    <template v-else-if="(cuota.estadoReal || cuota.estado) === 'mora'">
                      <p class="text-xs text-gray-500">Total a Pagar</p>
                      <p class="text-xl sm:text-2xl font-bold text-red-600">
                        ${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}
                      </p>
                    </template>
                    <!-- Pagada -->
                    <template v-else-if="(cuota.estadoReal || cuota.estado) === 'pagada'">
                      <p class="text-xs text-gray-500">Total pagado</p>
                      <p class="text-xl sm:text-2xl font-bold text-green-600">
                        ${{ formatMoney((cuota.valor_pagado || 0) + (cuota.valor_pagado_sancion || 0) + getActividadesInfoSocio(cuota).pagadas + getTotalCuotasPrestamosPagadasSocioSync(cuota)) }}
                      </p>
                    </template>
                    <!-- Pendiente / programada -->
                    <template v-else>
                      <p class="text-xs text-gray-500">Total a Pagar</p>
                      <p class="text-xl sm:text-2xl font-bold text-gray-800">
                        ${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}
                      </p>
                    </template>
                  </div>
                  <!-- Etiqueta estado flat: En Mora se mantiene cuando está en mora (aunque tenga pago parcial) -->
                  <span 
                    :class="[
                      'shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold',
                      (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-100 text-green-700' : 
                      (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-100 text-red-700' : 
                      (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-100 text-gray-700' : 
                      tienePagoParcialCuota(cuota) ? 'bg-amber-100 text-amber-800' :
                      'bg-orange-100 text-orange-700'
                    ]"
                  >
                    {{ (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagada' : 
                       (cuota.estadoReal || cuota.estado) === 'mora' ? 'En Mora' : 
                       (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' : 
                       tienePagoParcialCuota(cuota) ? 'Pago Parcial' : 'Pendiente' }}
                  </span>
                  <!-- No calcular multa (solo raigo.16@gmail.com) -->
                  <label
                    v-if="esUsuarioAdmin"
                    class="flex items-center gap-1.5 shrink-0 text-xs text-amber-700 cursor-pointer"
                    @click.stop
                  >
                    <input
                      type="checkbox"
                      :checked="!!cuota.no_calcular_multa"
                      @change="toggleNoCalcularMultaCuota(cuota)"
                      class="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>No calcular multa</span>
                  </label>
                </div>
                <!-- Desglose con viñetas ● -->
                <ul class="text-xs space-y-0.5 mt-1">
                  <!-- Mora o pendiente: cuota, sanción, rifa/actividades -->
                  <template v-if="(cuota.estadoReal || cuota.estado) !== 'pagada'">
                    <!-- Si hay pago parcial, mostrar Total a Pagar; si no, mostrar desglose normal -->
                    <template v-if="tienePagoParcialCuota(cuota)">
                      <li v-if="getTotalPagadoConActividadesSocio(cuota) > 0" class="text-green-600 font-medium mt-1">
                        Pagado: ${{ formatMoney(getTotalPagadoConActividadesSocio(cuota)) }}
                      </li>
                      <!-- Desglose de lo pagado en pago parcial -->
                      <template v-if="getTotalPagadoConActividadesSocio(cuota) > 0">
                        <li v-if="(cuota.valor_pagado || 0) > 0" class="text-green-600 mt-1"><span class="mr-1">●</span> Cuota ${{ formatMoney(cuota.valor_pagado || 0) }}</li>
                        <li v-if="(cuota.valor_pagado_sancion || 0) > 0" class="text-green-600"><span class="mr-1">●</span> Multa ${{ formatMoney(cuota.valor_pagado_sancion || 0) }}</li>
                        <li v-if="getActividadesInfoSocio(cuota).pagadas > 0" class="text-green-600"><span class="mr-1">●</span> {{ getTextoActividadesSocio(cuota) }} ${{ formatMoney(getActividadesInfoSocio(cuota).pagadas) }}</li>
                        <li v-if="getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" class="text-green-600"><span class="mr-1">●</span> Cuotas de préstamos ${{ formatMoney(getTotalCuotasPrestamosPendientesSocioSync(cuota)) }}</li>
                      </template>
                    </template>
                    <template v-else>
                      <li class="text-gray-700"><span class="text-gray-500 mr-1">●</span> Cuota ${{ formatMoney(cuota.valor_cuota) }}</li>
                      <li v-if="getSancionCuota(cuota) > 0" class="text-red-600 font-medium"><span class="mr-1">●</span> Sanción ${{ formatMoney(getSancionCuota(cuota)) }}</li>
                      <li 
                        v-if="(cuota.valor_rifa || 0) > 0" 
                        class="text-violet-600"
                      >
                        <span class="mr-1">●</span> Rifa {{ getMesLabel(cuota.mes) }} ${{ formatMoney(cuota.valor_rifa || 0) }}
                      </li>
                      <li 
                        v-if="getActividadesPendientesSocio(cuota) > 0" 
                        class="text-purple-600 font-medium"
                      >
                        <span class="mr-1">●</span> {{ getTextoActividadesSocio(cuota) }} ${{ formatMoney(getActividadesPendientesSocio(cuota)) }}
                      </li>
                      <li 
                        v-if="getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" 
                        class="text-blue-600 font-medium"
                      >
                        <span class="mr-1">●</span> Cuotas de préstamos ${{ formatMoney(getTotalCuotasPrestamosPendientesSocioSync(cuota)) }}
                      </li>
                      <li v-if="getTotalPagadoConActividadesSocio(cuota) > 0" class="text-green-600 font-medium mt-1">
                        Pagado: ${{ formatMoney(getTotalPagadoConActividadesSocio(cuota)) }}
                      </li>
                    </template>
                  </template>
                  <!-- Pagada: desglose en verde -->
                  <template v-else>
                    <li class="text-green-700"><span class="mr-1">●</span> Cuota ${{ formatMoney(cuota.valor_cuota) }}</li>
                    <li v-if="(cuota.valor_pagado_sancion || 0) > 0" class="text-green-700"><span class="mr-1">●</span> Multa ${{ formatMoney(cuota.valor_pagado_sancion || 0) }}</li>
                    <li v-if="(cuota.valor_rifa || 0) > 0" class="text-green-700"><span class="mr-1">●</span> Rifa {{ getMesLabel(cuota.mes) }} ${{ formatMoney(cuota.valor_rifa || 0) }}</li>
                    <li v-if="getActividadesInfoSocio(cuota).pagadas > 0" class="text-green-700"><span class="mr-1">●</span> {{ getTextoActividadesSocio(cuota) }} ${{ formatMoney(getActividadesInfoSocio(cuota).pagadas) }}</li>
                    <li v-if="getTotalCuotasPrestamosPagadasSocioSync(cuota) > 0" class="text-green-700"><span class="mr-1">●</span> Cuotas de préstamos ${{ formatMoney(getTotalCuotasPrestamosPagadasSocioSync(cuota)) }}</li>
                  </template>
                </ul>
              </div>

                <!-- Botones de acción flat: Pagar centrado 70% de la tarjeta -->
                <div class="flex flex-wrap justify-center gap-2 mt-3 w-full" @click.stop>
                  <template v-if="tienePagoParcialCuota(cuota)">
                    <!-- Primera fila: Pagar ocupando 100% del ancho. Segunda fila: Editar y Reenviar ocupando 50% cada uno -->
                    <div class="flex flex-col gap-2 w-full">
                      <button 
                        v-if="!esVisor"
                        @click="abrirModalPago(cuota)"
                        class="w-full min-w-0 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                      >
                        <CurrencyDollarIcon class="w-5 h-5" />
                        <span>Pagar restante</span>
                      </button>
                      <div class="flex gap-2 w-full min-w-0">
                        <button 
                          v-if="!esVisor"
                          @click="abrirModalEditar(cuota)"
                          class="flex-1 min-w-0 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                          title="Editar pago"
                        >
                          <PencilIcon class="w-4 h-4" />
                          <span>Editar</span>
                        </button>
                        <button 
                          @click="reenviarComprobante(cuota)"
                          class="flex-1 min-w-0 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                          title="Reenviar comprobante"
                        >
                          <ArrowPathIcon class="w-4 h-4" />
                          <span>Reenviar</span>
                        </button>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="(cuota.estadoReal || cuota.estado) !== 'pagada'">
                    <button 
                      v-if="!esVisor"
                      @click="abrirModalPago(cuota)"
                      class="w-full px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                    >
                      <CurrencyDollarIcon class="w-5 h-5" />
                      <span>$ Pagar</span>
                    </button>
                  </template>
                  <template v-else>
                    <!-- Desktop: Editar y Reenviar lado a lado, cada uno 50% -->
                    <!-- Móvil: Editar arriba, Reenviar abajo -->
                    <div class="flex flex-col gap-2 w-full md:flex-row md:gap-2">
                      <button 
                        v-if="!esVisor"
                        @click="abrirModalEditar(cuota)"
                        class="w-full md:w-[50%] min-w-0 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                        title="Editar pago"
                      >
                        <PencilIcon class="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    <button 
                      @click="reenviarComprobante(cuota)"
                        class="w-full md:w-[50%] min-w-0 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                      title="Reenviar comprobante"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                        <span>Reenviar</span>
                    </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vista Lista: móvil = lista expandible (barra estado + badges estado/fpago + total); desktop = tabla -->
      <template v-else-if="vistaLista && !vistaExcel && !vistaAgrupada">
        <!-- Móvil: lista expandible al pie de la letra (SOCIO/ESTADO | TOTAL, barra de color, badges, chevron, expandir detalles) -->
        <div class="md:hidden rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div class="flex justify-between items-center px-4 py-2.5 border-b border-gray-200 bg-gray-50">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Socio / Estado</span>
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Total</span>
          </div>
          <div class="divide-y divide-gray-200">
            <div
              v-for="cuota in cuotasFiltradas"
              :key="cuota.id"
              class="bg-white"
            >
              <div
                @click="toggleListaExpandida(cuota.id)"
                class="flex items-stretch cursor-pointer active:bg-gray-50 transition-colors"
              >
                <!-- Barra vertical de estado: verde Pagado, naranja Pendiente, rojo Atrasado -->
                <div
                  :class="[
                    'w-1 flex-shrink-0 rounded-l',
                    (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-500' :
                    (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-500' :
                    'bg-orange-500'
                  ]"
                />
                <div class="flex-1 min-w-0 flex items-center gap-2 py-3 px-3">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-900 truncate">
                      {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
                    </p>
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      <!-- Badge Estado: fondo y borde bien visible -->
                      <span
                        :class="[
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                          (cuota.estadoReal || cuota.estado) === 'pagada'
                            ? 'bg-green-100 text-green-800 border-green-200' :
                          (cuota.estadoReal || cuota.estado) === 'mora'
                            ? 'bg-red-100 text-red-800 border-red-200' :
                          (cuota.estadoReal || cuota.estado) === 'programada'
                            ? 'bg-gray-100 text-gray-700 border-gray-200' :
                          tienePagoParcialCuota(cuota)
                            ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-orange-100 text-orange-800 border-orange-200'
                        ]"
                      >
                        <CheckCircleIcon v-if="(cuota.estadoReal || cuota.estado) === 'pagada'" class="w-3.5 h-3.5 flex-shrink-0" />
                        <ExclamationCircleIcon v-else-if="(cuota.estadoReal || cuota.estado) === 'mora'" class="w-3.5 h-3.5 flex-shrink-0" />
                        <CurrencyDollarIcon v-else-if="tienePagoParcialCuota(cuota)" class="w-3.5 h-3.5 flex-shrink-0 text-amber-600" title="Pago parcial" />
                        <ClockIcon v-else class="w-3.5 h-3.5 flex-shrink-0" />
                        {{ (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagado' : (cuota.estadoReal || cuota.estado) === 'mora' ? 'Atrasado' : (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' : tienePagoParcialCuota(cuota) ? 'Pago Parcial' : 'Pendiente' }}
                      </span>
                      <span class="text-gray-300">|</span>
                      <!-- Badge Forma de pago con icono -->
                      <span class="inline-flex items-center gap-1 text-xs text-gray-500">
                        <BuildingOffice2Icon v-if="(cuota.estadoReal || cuota.estado) === 'pagada' && (cuota.tipo_pago || '').toLowerCase() === 'transferencia'" class="w-4 h-4 flex-shrink-0" />
                        <BanknotesIcon v-else-if="(cuota.estadoReal || cuota.estado) === 'pagada' && (cuota.tipo_pago || 'efectivo').toLowerCase() === 'efectivo'" class="w-4 h-4 flex-shrink-0" />
                        <CreditCardIcon v-else-if="(cuota.estadoReal || cuota.estado) === 'pagada' && (cuota.tipo_pago || '').toLowerCase() === 'tarjeta'" class="w-4 h-4 flex-shrink-0" />
                        <MinusIcon v-else class="w-4 h-4 flex-shrink-0" />
                        {{ (cuota.estadoReal || cuota.estado) === 'pagada' ? ((cuota.tipo_pago || 'efectivo').toLowerCase() === 'transferencia' ? 'Transf.' : (cuota.tipo_pago || '').toLowerCase() === 'tarjeta' ? 'Tarj.' : 'Efec.') : '---' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1 pr-3 py-3 flex-shrink-0">
                  <span class="font-bold text-gray-900 tabular-nums">
                    ${{ formatMoney((cuota.valor_pagado || 0) + (cuota.valor_pagado_sancion || 0) + (getActividadesInfoSocio(cuota).pagadas || 0) + (getTotalCuotasPrestamosPagadasSocioSync(cuota) || 0)) }}
                  </span>
                  <ChevronDownIcon
                    :class="['w-5 h-5 text-gray-400 transition-transform', listaExpandidos.has(cuota.id) ? 'rotate-180' : '']"
                  />
                </div>
              </div>
              <!-- Contenido expandido: cuota, sanción, actividad, préstamo, descripción -->
              <div
                v-show="listaExpandidos.has(cuota.id)"
                class="border-t border-gray-100 bg-gray-50/80 px-4 pb-3 pt-2"
                @click.stop
              >
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
                  <span>Cuota <span class="font-semibold text-gray-800">${{ formatMoney(cuota.valor_pagado || 0) }}</span></span>
                  <span>Sanción <span class="font-semibold text-gray-800">${{ formatMoney(cuota.valor_pagado_sancion || 0) }}</span></span>
                  <span>Actividad <span class="font-semibold text-gray-800">${{ formatMoney(getActividadesInfoSocio(cuota).pagadas || 0) }}</span></span>
                  <span>Préstamo <span class="font-semibold text-gray-800">${{ formatMoney(getTotalCuotasPrestamosPagadasSocioSync(cuota) || 0) }}</span></span>
                </div>
                <p class="mt-2 text-xs text-gray-500">Descripción: {{ getDescripcionLista(cuota) }}</p>
                <button
                  type="button"
                  @click="abrirModalDetalleCuota(cuota)"
                  class="mt-2 text-xs font-semibold text-[#1e3a5f] hover:underline"
                >
                  Ver detalle completo
                </button>
              </div>
            </div>
          </div>
          <!-- Totales móvil -->
          <div class="flex justify-between items-center px-4 py-3 border-t-2 border-[#1e3a5f]/30 bg-[#1e3a5f]/10 font-bold text-gray-800 text-sm">
            <span>TOTAL ({{ cuotasFiltradas.length }})</span>
            <span class="text-[#1e3a5f] tabular-nums">${{ formatMoney(totalesLista.totalTotal) }}</span>
          </div>
        </div>

        <!-- Desktop: tabla compacta -->
        <div class="hidden md:block rounded-xl border border-gray-200 shadow-md overflow-hidden bg-white">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[580px] border-collapse text-sm">
              <thead>
                <tr class="bg-[#1e3a5f] text-white">
                  <th class="sticky left-0 z-10 min-w-[100px] w-[100px] sm:min-w-0 sm:w-auto px-2 py-2.5 sm:px-3 sm:py-2.5 text-left text-xs font-bold bg-[#1e3a5f] shadow-[2px_0_6px_rgba(0,0,0,0.12)]">Socio</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold">Cuota</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold">Sanción</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold">Actividad</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold">Préstamo</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold">Descripción</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold">Fpago</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold text-center">Estado</th>
                  <th class="px-2 py-2.5 sm:px-3 whitespace-nowrap text-xs font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(cuota, idx) in cuotasFiltradas"
                  :key="cuota.id"
                  @click="abrirModalDetalleCuota(cuota)"
                  :class="[
                    'border-b border-gray-200 cursor-pointer transition-colors hover:opacity-90',
                    idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/70'
                  ]"
                >
                  <td
                    :class="[
                      'sticky left-0 z-10 min-w-[100px] w-[100px] sm:min-w-0 sm:w-auto px-2 py-1.5 sm:px-3 sm:py-2 text-gray-800 font-medium shadow-[2px_0_6px_rgba(0,0,0,0.08)]',
                      idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/70'
                    ]"
                  >
                    {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-right text-gray-800 tabular-nums whitespace-nowrap">
                    ${{ formatMoney(cuota.valor_pagado || 0) }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-right text-gray-800 tabular-nums whitespace-nowrap">
                    ${{ formatMoney(cuota.valor_pagado_sancion || 0) }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-right text-gray-800 tabular-nums whitespace-nowrap">
                    ${{ formatMoney(getActividadesInfoSocio(cuota).pagadas || 0) }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-right text-gray-800 tabular-nums whitespace-nowrap">
                    ${{ formatMoney(getTotalCuotasPrestamosPagadasSocioSync(cuota) || 0) }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-gray-600 whitespace-nowrap">
                    {{ getDescripcionLista(cuota) }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-gray-600 whitespace-nowrap">
                    {{ (cuota.estadoReal || cuota.estado) === 'pagada' ? ((cuota.tipo_pago || 'efectivo').toLowerCase() === 'transferencia' ? 'transferencia' : 'efectivo') : '—' }}
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-center whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                        (cuota.estadoReal || cuota.estado) === 'pagada' ? 'bg-green-100 text-green-800' :
                        (cuota.estadoReal || cuota.estado) === 'mora' ? 'bg-red-100 text-red-800' :
                        (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-100 text-gray-700' :
                        tienePagoParcialCuota(cuota) ? 'bg-amber-100 text-amber-800' :
                        'bg-orange-100 text-orange-800'
                      ]"
                    >
                      {{ (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' : (cuota.estadoReal || cuota.estado) === 'parcial' ? 'Pago Parcial' : (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagada' : (cuota.estadoReal || cuota.estado) === 'mora' ? 'En Mora' : tienePagoParcialCuota(cuota) ? 'Pago Parcial' : 'Pendiente' }}
                    </span>
                  </td>
                  <td class="px-2 py-1.5 sm:px-3 sm:py-2 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                    ${{ formatMoney((cuota.valor_pagado || 0) + (cuota.valor_pagado_sancion || 0) + (getActividadesInfoSocio(cuota).pagadas || 0) + (getTotalCuotasPrestamosPagadasSocioSync(cuota) || 0)) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-[#1e3a5f]/10 border-t-2 border-[#1e3a5f]/30 font-bold text-gray-800">
                  <td class="sticky left-0 z-10 min-w-[100px] w-[100px] sm:min-w-0 sm:w-auto px-2 py-2 sm:px-3 sm:py-2.5 text-left text-sm bg-[#1e3a5f]/10 shadow-[2px_0_6px_rgba(0,0,0,0.08)]">
                    TOTAL ({{ cuotasFiltradas.length }})
                  </td>
                  <td class="px-2 py-2 sm:px-3 sm:py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
                    ${{ formatMoney(totalesLista.totalCuota) }}
                  </td>
                  <td class="px-2 py-2 sm:px-3 sm:py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
                    ${{ formatMoney(totalesLista.totalSancion) }}
                  </td>
                  <td class="px-2 py-2 sm:px-3 sm:py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
                    ${{ formatMoney(totalesLista.totalActividad) }}
                  </td>
                  <td class="px-2 py-2 sm:px-3 sm:py-2.5 text-right text-sm tabular-nums whitespace-nowrap">
                    ${{ formatMoney(totalesLista.totalPrestamo) }}
                  </td>
                  <td class="px-2 py-2 sm:px-3 sm:py-2.5" colspan="3"></td>
                  <td class="px-2 py-2 sm:px-3 sm:py-2.5 text-right text-sm tabular-nums text-[#1e3a5f] whitespace-nowrap">
                    ${{ formatMoney(totalesLista.totalTotal) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </template>

      <!-- Vista Excel (Tabla) -->
      <div v-else-if="vistaExcel && !vistaLista && !vistaAgrupada" class="card overflow-x-auto shadow-xl">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gradient-to-r from-natillera-50 via-emerald-50 to-teal-50 border-b-2 border-natillera-200">
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Socio</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Descripción</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Periodicidad</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-natillera-700 uppercase tracking-wider">Valor Cuota</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-natillera-700 uppercase tracking-wider">Valor Pagado</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Fecha Límite</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-natillera-700 uppercase tracking-wider">Forma de pago</th>
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
              <td class="px-4 py-3 text-sm font-semibold text-right" :class="cuota.estado === 'mora' ? 'text-red-600' : cuota.estado === 'pagada' ? 'text-green-600' : 'text-gray-800'">
                <!-- Cuota pagada: desglose (cuota + multa + actividades) -->
                <template v-if="cuota.estado === 'pagada'">
                  <div class="space-y-0.5">
                    <div class="font-bold">Total: ${{ formatMoney((cuota.valor_pagado || 0) + (cuota.valor_pagado_sancion || 0) + getActividadesInfoSocio(cuota).pagadas + getTotalCuotasPrestamosPagadasSocioSync(cuota)) }}</div>
                    <div class="text-xs text-green-600 font-semibold">Cuota: ${{ formatMoney(cuota.valor_cuota) }}</div>
                    <div v-if="(cuota.valor_pagado_sancion || 0) > 0" class="text-xs text-green-600 font-semibold">+ Multa: ${{ formatMoney(cuota.valor_pagado_sancion || 0) }}</div>
                    <div v-if="getActividadesInfoSocio(cuota).pagadas > 0" class="text-xs text-emerald-600 font-semibold">+ {{ getTextoActividadesSocio(cuota) }}: ${{ formatMoney(getActividadesInfoSocio(cuota).pagadas) }}</div>
                    <div v-if="getTotalCuotasPrestamosPagadasSocioSync(cuota) > 0" class="text-xs text-blue-600 font-semibold">+ Cuotas de préstamos: ${{ formatMoney(getTotalCuotasPrestamosPagadasSocioSync(cuota)) }}</div>
                  </div>
                </template>
                <!-- Estado mora con multa -->
                <template v-else-if="cuota.estado === 'mora'">
                  <div class="space-y-0.5">
                    <div>${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}</div>
                    <div class="text-xs text-gray-500 font-normal">Cuota: ${{ formatMoney(cuota.valor_cuota) }}</div>
                    <div v-if="getSancionCuota(cuota) > 0" class="text-xs text-red-500 font-semibold">+ Multa: ${{ formatMoney(getSancionCuota(cuota)) }}</div>
                    <div v-if="getActividadesPendientesSocio(cuota) > 0" class="text-xs text-purple-600 font-semibold">+ {{ getTextoActividadesSocio(cuota) }}: ${{ formatMoney(getActividadesPendientesSocio(cuota)) }}</div>
                    <div v-if="getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" class="text-xs text-blue-600 font-semibold">+ Cuotas de préstamos: ${{ formatMoney(getTotalCuotasPrestamosPendientesSocioSync(cuota)) }}</div>
                  </div>
                </template>
                <!-- Estado parcial -->
                <template v-else-if="(cuota.estadoReal || cuota.estado) === 'parcial'">
                  <div class="space-y-0.5">
                    <div>${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}</div>
                    <div class="text-xs text-gray-500 font-normal">Cuota: ${{ formatMoney(cuota.valor_cuota - (cuota.valor_pagado || 0)) }}</div>
                    <div v-if="getActividadesPendientesSocio(cuota) > 0" class="text-xs text-purple-600 font-semibold">+ {{ getTextoActividadesSocio(cuota) }}: ${{ formatMoney(getActividadesPendientesSocio(cuota)) }}</div>
                    <div v-if="getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" class="text-xs text-blue-600 font-semibold">+ Cuotas de préstamos: ${{ formatMoney(getTotalCuotasPrestamosPendientesSocioSync(cuota)) }}</div>
                  </div>
                </template>
                <!-- Estado normal -->
                <div v-else>
                  <div v-if="getActividadesPendientesSocio(cuota) > 0 || getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" class="space-y-0.5">
                    <div>${{ formatMoney(getTotalAPagarConActividadesSocio(cuota)) }}</div>
                    <div class="text-xs text-gray-500 font-normal">Cuota: ${{ formatMoney(cuota.valor_cuota) }}</div>
                    <div v-if="getActividadesPendientesSocio(cuota) > 0" class="text-xs text-purple-600 font-semibold">+ {{ getTextoActividadesSocio(cuota) }}: ${{ formatMoney(getActividadesPendientesSocio(cuota)) }}</div>
                    <div v-if="getTotalCuotasPrestamosPendientesSocioSync(cuota) > 0" class="text-xs text-blue-600 font-semibold">+ Cuotas de préstamos: ${{ formatMoney(getTotalCuotasPrestamosPendientesSocioSync(cuota)) }}</div>
                  </div>
                  <div v-else>
                    ${{ formatMoney(cuota.valor_cuota) }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-right" :class="cuota.valor_pagado > 0 ? 'text-green-600 font-medium' : 'text-gray-400'">
                ${{ formatMoney(cuota.valor_pagado || 0) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                {{ formatDate(cuota.fecha_limite) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">
                <template v-if="cuota.estado === 'pagada'">
                  {{ (cuota.tipo_pago || 'efectivo').toLowerCase() === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                </template>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span 
                  :class="[
                    'badge',
                    (cuota.estadoReal || cuota.estado) === 'pagada' ? 'badge-success' : 
                    (cuota.estadoReal || cuota.estado) === 'mora' ? 'badge-danger' : 
                    (cuota.estadoReal || cuota.estado) === 'parcial' ? 'bg-blue-100 text-blue-800' : 
                    (cuota.estadoReal || cuota.estado) === 'programada' ? 'bg-gray-100 text-gray-700' : 
                    'bg-orange-100 text-orange-800'
                  ]"
                >
                  {{ (cuota.estadoReal || cuota.estado) === 'programada' ? 'Programada' : (cuota.estadoReal || cuota.estado) === 'parcial' ? 'Pago Parcial' : (cuota.estadoReal || cuota.estado) === 'pagada' ? 'Pagada' : (cuota.estadoReal || cuota.estado) === 'mora' ? 'En Mora' : (cuota.estadoReal || cuota.estado) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    v-if="!esVisor && ((cuota.estadoReal || cuota.estado) === 'parcial' || (getTotalPagadoConActividadesSocio(cuota) > 0 && getTotalPagadoConActividadesSocio(cuota) < getTotalAPagarConActividadesSocio(cuota)))"
                    @click="abrirModalEditar(cuota)"
                    class="px-2 py-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    title="Editar cuota"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button 
                    v-if="!esVisor && (cuota.estadoReal || cuota.estado) === 'pagada'"
                    @click="abrirModalEditar(cuota)"
                    class="px-2 py-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    title="Editar pago"
                  >
                    <PencilIcon class="w-3 h-3" />
                  </button>
                  <button 
                    v-if="!esVisor && (cuota.estadoReal || cuota.estado) !== 'pagada'"
                    @click="abrirModalPago(cuota)"
                    class="px-3 py-1.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    Pagar
                  </button>
                  <button 
                    v-if="(cuota.estadoReal || cuota.estado) === 'pagada' || (getTotalPagadoConActividadesSocio(cuota) > 0 && getTotalPagadoConActividadesSocio(cuota) < getTotalAPagarConActividadesSocio(cuota))"
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
              <td class="px-4 py-4 text-sm text-gray-600">—</td>
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

    <!-- Botón flotante "Volver arriba" - solo móvil, encima de todo -->
    <Teleport to="body">
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
          @click="scrollToTop"
          class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999] w-12 h-12 bg-gradient-to-br from-natillera-600 to-emerald-600 hover:from-natillera-700 hover:to-emerald-700 rounded-full shadow-xl shadow-natillera-900/30 flex items-center justify-center text-white touch-manipulation transition-all ring-2 ring-white/80"
          title="Volver arriba"
          aria-label="Volver arriba"
        >
          <ArrowUpIcon class="w-6 h-6" />
        </button>
      </Transition>
    </Teleport>

    <!-- Modal Confirmar Borrar Cuotas: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalConfirmarBorrar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="card relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6"
      @close="modalConfirmarBorrar = false"
    >
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
            @touchstart="modalConfirmarBorrar = false"
            class="btn-secondary flex-1"
            style="pointer-events: auto !important; touch-action: manipulation !important; -webkit-tap-highlight-color: rgba(34, 197, 94, 0.25);"
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
    </ModalWrapper>

    <!-- Modal Detalle de Cuota: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalDetalleCuota"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto"
      card-max-width="42rem"
      @close="cerrarModalDetalleCuota"
    >
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
                @click="cerrarModalDetalleCuota"
                @touchstart="cerrarModalDetalleCuota"
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                style="pointer-events: auto !important; touch-action: manipulation !important; -webkit-tap-highlight-color: rgba(255, 255, 255, 0.3); min-width: 44px; min-height: 44px; z-index: 20 !important;"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-6 space-y-5" v-if="cuotaDetalle">
          <!-- Estado de la cuota (usar estadoReal para reflejar estado calculado cuando cuota pagada completamente tras pago parcial) -->
          <div 
            :class="[
              'relative p-5 rounded-xl border-2 shadow-sm',
              (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 
              (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : 
              (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'parcial' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' : 
              (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'programada' ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200' : 
              'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
            ]"
          >
            <div class="flex items-center gap-3">
              <div 
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center shadow-md',
                  (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 
                  (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                  (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'parcial' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 
                  (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'programada' ? 'bg-gradient-to-br from-gray-400 to-slate-500' : 
                  'bg-gradient-to-br from-orange-500 to-amber-600'
                ]"
              >
                <component 
                  :is="(cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' ? CheckCircleIcon : 
                       (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? ExclamationCircleIcon : 
                       (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'programada' ? CalendarIcon : ClockIcon"
                  class="w-6 h-6 text-white"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium mb-1">Estado</p>
                <p 
                  :class="[
                    'text-lg font-bold',
                    (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' ? 'text-green-700' : 
                    (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? 'text-red-700' : 
                    (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'parcial' ? 'text-blue-700' : 
                    (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'programada' ? 'text-gray-700' : 'text-orange-700'
                  ]"
                >
                  {{ (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'programada' ? 'Programada' : (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'parcial' ? 'Pago Parcial' : (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' ? 'Pagada' : (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? 'En Mora' : 'Pendiente' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Resumen de valores: Valor cuota · Sanciones · Actividades · Total a pagar · Valor pagado (2 columnas en desktop) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 1. Valor cuota -->
            <div class="bg-gradient-to-br from-natillera-50 to-emerald-50 p-5 rounded-xl border border-natillera-200 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-1">Valor cuota</p>
              <p class="text-2xl font-bold text-natillera-700">${{ formatMoney(cuotaDetalle.valor_cuota) }}</p>
            </div>

            <!-- 2. Sanciones: cabecera con icono + título + total; desglose Mora / Intereses; Desde fecha -->
            <div v-if="desgloseSancionDetalle.total > 0" class="bg-gradient-to-br from-red-50 to-rose-50 p-3 rounded-xl border border-red-200 shadow-sm">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-red-200/80 flex items-center justify-center flex-shrink-0">
                    <ExclamationTriangleIcon class="w-4 h-4 text-red-700" />
                  </div>
                  <span class="text-sm font-bold text-gray-900">Sanciones</span>
                </div>
                <span class="font-bold text-red-700 text-lg shrink-0 leading-tight">${{ formatMoney(desgloseSancionDetalle.total) }}</span>
              </div>
              <ul class="space-y-1 mt-1.5 pt-1.5 border-t border-red-200/70">
                <li v-for="(item, idx) in desgloseSancionDetalle.items" :key="idx" class="flex justify-between items-center gap-2">
                  <span class="text-xs text-gray-800 min-w-0 truncate">
                    {{ item.nombre }}{{ item.textoDetalle ? ` (${item.textoDetalle})` : '' }}
                  </span>
                  <span class="font-semibold text-red-700 text-xs shrink-0">${{ formatMoney(item.valor) }}</span>
                </li>
              </ul>
              <p v-if="desgloseSancionDetalle.fechaDesde" class="text-[11px] text-gray-500 mt-1">
                Desde {{ formatDate(desgloseSancionDetalle.fechaDesde) }}
              </p>
              <p v-else-if="(cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' && getDiasMora(cuotaDetalle) > 0" class="text-[11px] text-gray-500 mt-1">
                {{ getDiasMora(cuotaDetalle) }} {{ getDiasMora(cuotaDetalle) === 1 ? 'día' : 'días' }} en mora
                <template v-if="cuotaDetalle.fecha_vencimiento || cuotaDetalle.fecha_limite"> desde {{ formatDate(cuotaDetalle.fecha_vencimiento || cuotaDetalle.fecha_limite) }}</template>
              </p>
            </div>

            <!-- 3. Actividades (si las hay), desglosadas por nombre -->
            <div v-if="getDesgloseActividadesCuota(cuotaDetalle).total > 0" class="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-2">Actividades</p>
              <ul class="space-y-2">
                <li v-for="(item, idx) in getDesgloseActividadesCuota(cuotaDetalle).items" :key="idx" class="flex justify-between items-center">
                  <span class="text-sm text-purple-800">{{ item.nombre }}</span>
                  <span class="font-bold text-purple-700">${{ formatMoney(item.valor) }}</span>
                </li>
              </ul>
            </div>

            <!-- 4. Total a pagar (obligación total: cuota + sanciones + actividades) -->
            <div :class="[
              'p-5 rounded-xl border shadow-sm',
              (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
            ]">
              <p class="text-xs text-gray-500 font-medium mb-1">Total a pagar</p>
              <p :class="['text-2xl font-bold', (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'mora' ? 'text-red-700' : 'text-amber-700']">
                ${{ formatMoney(totalAPagarDetalle.total) }}
              </p>
              <p class="text-xs text-gray-600 mt-1.5">
                Incluye: Cuota ${{ formatMoney(totalAPagarDetalle.cuota) }}
                <template v-if="totalAPagarDetalle.sanciones > 0"> + Sanciones ${{ formatMoney(totalAPagarDetalle.sanciones) }}</template>
                <template v-if="totalAPagarDetalle.actividades > 0"> + Actividades ${{ formatMoney(totalAPagarDetalle.actividades) }}</template>
              </p>
            </div>

            <!-- 5. Valor pagado -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm">
              <p class="text-xs text-gray-500 font-medium mb-1">Valor pagado</p>
              <p class="text-2xl font-bold text-green-700">${{ formatMoney(getTotalPagadoConActividadesSocio(cuotaDetalle)) }}</p>
            </div>
          </div>

          <!-- Información de fechas -->
          <div :class="[
            'grid gap-4',
            (cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' && cuotaDetalle.fecha_pago ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
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
              v-if="(cuotaDetalle.estadoReal || cuotaDetalle.estado) === 'pagada' && cuotaDetalle.fecha_pago"
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
                <span class="text-2xl">{{ (cuotaDetalle.quincena === 1 || cuotaDetalle.quincena === 2) ? '🗓️' : '📅' }}</span>
                <p class="text-xs text-gray-500 font-medium">Periodicidad</p>
              </div>
              <p class="text-lg font-bold text-gray-800">
                {{ (cuotaDetalle.quincena === 1 || cuotaDetalle.quincena === 2) ? `Quincenal - Q${cuotaDetalle.quincena}` : 'Mensual' }}
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
          <div v-if="(cuotaDetalle.valor_pagado > 0 || cuotaDetalle.codigo_comprobante) && (historialPagosCuota.length > 0 || cargandoHistorialPagos)" class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-3 sm:p-5 rounded-xl border border-indigo-200 shadow-sm">
            <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <ClockIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-gray-800">Historial de Pagos</p>
                <p class="text-xs text-gray-600">Registro completo de pagos realizados</p>
              </div>
            </div>

            <!-- Loading state -->
            <div v-if="cargandoHistorialPagos" class="flex items-center justify-center py-6 sm:py-8">
              <div class="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
            </div>

            <!-- Lista de pagos -->
            <div v-else-if="historialPagosCuota.length > 0" class="space-y-2 sm:space-y-3">
              <div
                v-for="(pago, index) in historialPagosCuota"
                :key="index"
                :class="[
                  'p-3 sm:p-4 rounded-lg border-2 transition-all',
                  pago.es_actual
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md'
                    : pago.es_modificacion
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-md'
                    : 'bg-white border-indigo-200 shadow-sm hover:shadow-md'
                ]"
              >
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-start gap-2 mb-2">
                      <div
                        :class="[
                          'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          pago.es_actual
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                            : pago.es_modificacion
                            ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        ]"
                      >
                        <CheckCircleIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          :class="[
                            'text-xs sm:text-sm font-bold',
                            pago.es_actual ? 'text-green-700' : pago.es_modificacion ? 'text-orange-700' : 'text-gray-800'
                          ]"
                        >
                          {{ pago.es_actual ? 'Pago Actual' : pago.es_modificacion ? 'Pago Modificado' : 'Pago Anterior' }}
                        </p>
                        <p v-if="pago.codigo_comprobante" class="text-xs font-mono text-gray-600 mt-0.5 break-all">
                          Código: {{ pago.codigo_comprobante }}
                        </p>
                        <p v-if="pago.es_modificacion && pago.codigo_nuevo" class="text-xs text-orange-600 mt-1 font-semibold break-all">
                          → Modificado a código: {{ pago.codigo_nuevo }}
                        </p>
                        <!-- Forma de pago: badge diferenciador -->
                        <p class="text-xs text-gray-600 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span class="font-medium text-gray-700">Forma de pago:</span>
                          <span
                            v-if="pago.forma_pago"
                            :class="[
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border',
                              (pago.forma_pago || '').toLowerCase() === 'transferencia'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : (pago.forma_pago || '').toLowerCase() === 'tarjeta'
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                            ]"
                          >
                            <BanknotesIcon v-if="(pago.forma_pago || '').toLowerCase() === 'efectivo'" class="w-3.5 h-3.5" />
                            <BuildingOffice2Icon v-else-if="(pago.forma_pago || '').toLowerCase() === 'transferencia'" class="w-3.5 h-3.5" />
                            <CreditCardIcon v-else-if="(pago.forma_pago || '').toLowerCase() === 'tarjeta'" class="w-3.5 h-3.5" />
                            <span class="capitalize">{{ (pago.forma_pago || 'efectivo').toLowerCase() === 'transferencia' ? 'Transferencia' : (pago.forma_pago || '').toLowerCase() === 'tarjeta' ? 'Tarjeta' : 'Efectivo' }}</span>
                          </span>
                          <span v-else class="text-gray-400">—</span>
                        </p>
                      </div>
                    </div>

                    <!-- Si es una modificación, mostrar antes y después -->
                    <div v-if="pago.es_modificacion" class="mt-2 sm:mt-3 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p class="text-xs font-semibold text-orange-800 mb-2">Detalle de la Modificación</p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                    <div v-else class="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                      <!-- Pago actual: desglose cuota + sanción + actividades -->
                      <div v-if="pago.es_actual && cuotaDetalle" class="p-2 sm:p-3 rounded-lg bg-white/80 border border-green-200/60 space-y-2">
                        <p class="text-xs font-semibold text-gray-700 mb-2">Desglose del pago</p>
                        <div class="flex justify-between text-xs sm:text-sm gap-2">
                          <span class="text-gray-600">Cuota</span>
                          <span class="font-semibold text-gray-800 shrink-0">${{ formatMoney(cuotaDetalle.valor_pagado || 0) }}</span>
                        </div>
                        <div v-if="(cuotaDetalle.valor_pagado_sancion || 0) > 0" class="flex justify-between text-xs sm:text-sm gap-2">
                          <span class="text-gray-600">Sanción / multa</span>
                          <span class="font-semibold text-red-700 shrink-0">${{ formatMoney(cuotaDetalle.valor_pagado_sancion || 0) }}</span>
                        </div>
                        <template v-if="getDesgloseActividadesCuota(cuotaDetalle).total > 0">
                          <div v-for="(item, idx) in getDesgloseActividadesCuota(cuotaDetalle).items" :key="idx" class="flex justify-between text-xs sm:text-sm gap-2">
                            <span class="text-gray-600 truncate min-w-0">{{ item.nombre }}</span>
                            <span class="font-semibold text-purple-700 shrink-0">${{ formatMoney(item.valor) }}</span>
                          </div>
                        </template>
                        <div class="flex justify-between text-xs sm:text-sm pt-2 border-t border-green-200/60 gap-2">
                          <span class="font-bold text-gray-800">Total pagado</span>
                          <span class="font-bold text-green-700 shrink-0">${{ formatMoney(getTotalPagadoConActividadesSocio(cuotaDetalle)) }}</span>
                        </div>
                      </div>
                      <!-- Pago no actual: solo valor y fecha -->
                      <div v-if="!pago.es_actual" class="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-sm">
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Valor Pagado</p>
                          <p class="text-base sm:text-lg font-bold text-gray-700">${{ formatMoney(pago.valor_pagado) }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500 mb-0.5">Fecha</p>
                          <p class="text-xs sm:text-sm font-semibold text-gray-700">{{ formatDate(pago.fecha_actualizacion) }}</p>
                          <p class="text-xs text-gray-500 mt-0.5">{{ formatTime(pago.fecha_actualizacion) }}</p>
                        </div>
                      </div>
                      <!-- Fecha cuando es pago actual -->
                      <div v-if="pago.es_actual" class="pt-1">
                        <p class="text-xs text-gray-500 mb-0.5">Fecha</p>
                        <p class="text-xs sm:text-sm font-semibold text-gray-700">{{ formatDate(pago.fecha_actualizacion) }} {{ formatTime(pago.fecha_actualizacion) }}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    v-if="pago.codigo_comprobante"
                    @click="reenviarComprobantePorCodigo(pago.codigo_comprobante, pago.valor_pagado)"
                    class="w-full sm:w-auto px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 order-first sm:order-none sm:mt-0"
                    title="Ver/Reenviar comprobante"
                  >
                    <ArrowPathIcon class="w-4 h-4" />
                    Ver
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-4 sm:py-6">
              <p class="text-xs sm:text-sm text-gray-500">No hay historial de pagos disponible</p>
            </div>
          </div>
        </div>

        <!-- Footer con acciones -->
        <div class="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button 
            @click="cerrarModalDetalleCuota"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
            <button
            v-if="(cuotaDetalle?.estadoReal || cuotaDetalle?.estado) !== 'pagada'"
            @click="cerrarModalDetalleCuota(); abrirModalPago(cuotaDetalle)"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 hover:shadow-xl"
          >
            Registrar Pago
          </button>
          <button 
            v-if="(cuotaDetalle?.estadoReal || cuotaDetalle?.estado) === 'pagada' || (cuotaDetalle?.valor_pagado > 0 && cuotaDetalle?.valor_pagado < (cuotaDetalle?.valor_cuota || 0))"
            @click="reenviarComprobante(cuotaDetalle)"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-xl"
          >
            Reenviar Comprobante
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal Generar Cuotas: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalGenerarCuotas"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
      card-max-width="42rem"
      @close="modalGenerarCuotas = false"
    >
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
                @touchstart="modalGenerarCuotas = false"
                class="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                style="pointer-events: auto !important; touch-action: manipulation !important; -webkit-tap-highlight-color: rgba(34, 197, 94, 0.25); min-height: 44px;"
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
    </ModalWrapper>

    <!-- Pantalla de carga al abrir registro de pago: en iPhone/Safari LoadingScreenIos; en Android la original -->
    <LoadingScreenIos
      v-if="preparandoModalPago && isIos"
      :show="true"
      title="Preparando registro de pago"
      message="Cargando información"
    />
    <Teleport to="body" v-else-if="preparandoModalPago">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-hidden" style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; height: 100dvh !important; height: -webkit-fill-available !important; min-height: 100vh !important; min-height: 100dvh !important; min-height: -webkit-fill-available !important; margin: 0 !important; touch-action: none; overscroll-behavior: none;">
          <!-- Fondo con blur y gradiente suave -->
          <div class="absolute inset-0 bg-gradient-to-br from-black/60 via-natillera-900/30 to-teal-900/40 backdrop-blur-md" style="position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important;"></div>
          <!-- Orbes decorativos animados -->
          <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-natillera-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s"></div>
          <div class="absolute top-1/2 left-1/2 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s"></div>

          <!-- Tarjeta con entrada animada -->
          <Transition
            enter-active-class="transition duration-400 ease-out"
            enter-from-class="opacity-0 scale-90 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div class="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 min-w-[280px] max-w-[90vw] overflow-hidden" style="position: relative !important; z-index: 10 !important; margin: 0 auto !important;">
              <!-- Borde superior con gradiente animado (shimmer) -->
              <div class="h-1 bg-gradient-to-r from-natillera-400 via-emerald-400 to-teal-400 preparando-shimmer"></div>
              <div class="p-8 flex flex-col items-center gap-6">
                <!-- Contenedor del spinner con anillos -->
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-16 h-16 rounded-full border-2 border-natillera-100 animate-spin" style="animation-duration: 1.8s"></div>
                  <div class="absolute w-12 h-12 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" style="animation-duration: 1.2s"></div>
                  <div class="absolute w-8 h-8 rounded-full border-2 border-transparent border-b-teal-500 animate-spin" style="animation-duration: 0.8s"></div>
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-natillera-500 to-teal-500 flex items-center justify-center shadow-lg shadow-natillera-500/30">
                    <CurrencyDollarIcon class="w-5 h-5 text-white animate-pulse" />
                  </div>
                </div>
                <!-- Textos con aparición escalonada -->
                <div class="text-center space-y-2">
                  <p class="text-lg font-bold text-gray-800 dark:text-white preparando-fade-in-up-1">Preparando registro de pago</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 preparando-fade-in-up-2">
                    <span>Cargando información</span>
                    <span class="inline-flex gap-0.5">
                      <span class="w-1 h-1 rounded-full bg-natillera-500 animate-bounce" style="animation-delay: 0s"></span>
                      <span class="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.15s"></span>
                      <span class="w-1 h-1 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 0.3s"></span>
                    </span>
                  </p>
                </div>
                <!-- Barra de progreso indeterminada -->
                <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full w-1/3 rounded-full bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500 preparando-progress-slide"></div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Registrar Pago: en iOS ModalWrapper (vista/scroll correctos); en Android estructura actual -->
    <ModalWrapper
      :show="!!modalPago"
      :z-index="60"
      align="bottom"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      card-class="relative max-w-md w-full bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 border-b-0 sm:border-b max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 my-0 sm:my-4"
      @close="modalPago = false; formPago.valor = 0; formPago.tipo_pago = 'efectivo'; formPago.aplicaImpuesto4x1000 = false; mostrandoAnimacionPago.value = false"
    >
        <!-- Header con gradiente (fijo) - tamaño reducido ~20% -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-xl font-display font-bold">
                Registrar Pago
              </h3>
            </div>
            <p class="text-white/90 text-xs">
              <span v-if="cuotaSeleccionada?.valor_pagado && cuotaSeleccionada.valor_pagado > 0">
                Agrega el saldo pendiente al pago parcial
              </span>
              <span v-else>
                Registra el pago de la cuota del socio
              </span>
            </p>
          </div>
        </div>

        <!-- Contenido con scroll (min-h-0 permite que flex reduzca y active overflow-y-auto) -->
        <div 
          ref="contenidoScrollRef"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-6 overscroll-contain relative"
          @scroll="handleScrollModalPago"
        >
          <!-- Card de información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm">
            <!-- Alerta de ajustes si existe -->
            <div v-if="tieneAjuste(cuotaSeleccionada)" class="mb-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-sm">
              <button
                @click.stop="abrirModalHistorialAjustes(cuotaSeleccionada)"
                class="group w-full flex items-center justify-between gap-2 cursor-pointer"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <InformationCircleIcon class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-blue-800 group-hover:text-blue-900 transition-colors">
                      Esta cuota tiene ajustes de valor
                    </p>
                    <p class="text-xs text-blue-600 mt-0.5">
                      Haz clic para ver el historial completo de cambios
                    </p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <img 
                :src="getAvatarUrl(cuotaSeleccionada?.socio_natillera?.socio?.nombre || cuotaSeleccionada?.socio_natillera?.id, cuotaSeleccionada?.socio_natillera?.socio?.avatar_seed, cuotaSeleccionada?.socio_natillera?.socio?.avatar_style)" 
                :alt="cuotaSeleccionada?.socio_natillera?.socio?.nombre"
                class="w-10 h-10 rounded-xl flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate text-sm">
                  {{ cuotaSeleccionada?.socio_natillera?.socio?.nombre || 'Socio' }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ cuotaSeleccionada?.descripcion && !tieneAjuste(cuotaSeleccionada) ? cuotaSeleccionada.descripcion : 'Cuota' }}
                </p>
              </div>
            </div>

            <!-- Cuota, Sanción y Actividades (solo cuando NO hay pago parcial) -->
            <div
              v-if="!tienePagoParcialCuota(cuotaSeleccionada)"
              class="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Cuota</span>
                <span class="font-semibold text-gray-800">${{ formatMoney(cuotaSeleccionada?.valor_cuota || 0) }}</span>
              </div>
              <div
                v-if="(getSancionTotalCuota(cuotaSeleccionada) || 0) > 0 || (cuotaSeleccionada?.valor_pagado_sancion || 0) > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Sanción</span>
                <span class="font-semibold text-red-600">${{ formatMoney(getSancionTotalCuota(cuotaSeleccionada) || cuotaSeleccionada?.valor_pagado_sancion || 0) }}</span>
              </div>
              <div
                v-if="actividadesSeleccionadas.size > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">{{ getTextoActividadesSocio(cuotaSeleccionada) || 'Actividades' }}</span>
                <span class="font-semibold text-purple-600">${{ formatMoney(getTotalActividadesSeleccionadas()) }}</span>
              </div>
              <div
                v-if="cuotasPrestamosSeleccionadas.size > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Cuotas de préstamos</span>
                <span class="font-semibold text-blue-600">${{ formatMoney(getTotalCuotasPrestamosSeleccionadas()) }}</span>
              </div>
              <div class="flex items-center justify-between text-base font-bold pt-2 mt-2 border-t border-gray-200">
                <span class="text-gray-700">Total a pagar</span>
                <span class="text-natillera-700">${{ formatMoney(getTotalMostrarResumenModalPago()) }}</span>
              </div>
            </div>

            <!-- Total a pagar, Pagado anteriormente y Total pendiente (solo cuando hay pago parcial) -->
            <div 
              v-if="tienePagoParcialCuota(cuotaSeleccionada)"
              class="mb-3 space-y-2"
            >
              <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600">Total a pagar</p>
                  <p class="font-bold text-gray-800 text-base">
                    ${{ formatMoney(Math.max(0, getTotalAPagarConActividades(cuotaSeleccionada)) + (cuotaSeleccionada?.valor_pagado || 0) + (cuotaSeleccionada?.valor_pagado_sancion || 0) + getActividadesInfoSocio(cuotaSeleccionada).pagadas) }}
                  </p>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600">Pagado anteriormente</p>
                  <p class="font-bold text-green-600 text-base">
                    ${{ formatMoney((cuotaSeleccionada?.valor_pagado || 0) + (cuotaSeleccionada?.valor_pagado_sancion || 0) + getActividadesInfoSocio(cuotaSeleccionada).pagadas) }}
                  </p>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600">Total pendiente</p>
                  <p :class="['font-bold text-base', cuotaSeleccionada?.estado === 'mora' ? 'text-red-600' : 'text-orange-600']">
                    ${{ formatMoney(getTotalPendienteMostrarModalPago()) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-5">
            <!-- Campo de tipo de pago -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de pago <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <!-- Opción Efectivo -->
                <button
                  type="button"
                  @click="alCambiarTipoPagoModal('efectivo')"
                  :class="[
                    'relative p-2.5 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02]',
                    formPago.tipo_pago === 'efectivo'
                      ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex flex-col items-center gap-1.5">
                    <!-- Icono -->
                    <div :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                      formPago.tipo_pago === 'efectivo'
                        ? 'bg-gradient-to-br from-natillera-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    ]">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <!-- Texto -->
                    <span :class="[
                      'font-semibold text-xs',
                      formPago.tipo_pago === 'efectivo'
                        ? 'text-natillera-700'
                        : 'text-gray-600'
                    ]">
                      Efectivo
                    </span>
                    <!-- Indicador de selección -->
                    <div v-if="formPago.tipo_pago === 'efectivo'" class="absolute top-1.5 right-1.5">
                      <div class="w-4 h-4 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                        <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                <!-- Opción Transferencia -->
                <button
                  type="button"
                  @click="alCambiarTipoPagoModal('transferencia')"
                  :class="[
                    'relative p-2.5 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02]',
                    formPago.tipo_pago === 'transferencia'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex flex-col items-center gap-1.5">
                    <!-- Icono -->
                    <div :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                      formPago.tipo_pago === 'transferencia'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    ]">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                    </div>
                    <!-- Texto -->
                    <span :class="[
                      'font-semibold text-xs',
                      formPago.tipo_pago === 'transferencia'
                        ? 'text-blue-700'
                        : 'text-gray-600'
                    ]">
                      Transferencia
                    </span>
                    <!-- Indicador de selección -->
                    <div v-if="formPago.tipo_pago === 'transferencia'" class="absolute top-1.5 right-1.5">
                      <div class="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

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
                  :value="formatearValorPago(valorMostrarModalRegistroPago())"
                  @input="handleValorPagoInput($event)"
                  @blur="handleValorPagoBlur"
                  @focus="seleccionarValorPago"
                  @click="seleccionarValorPago"
                  @keydown.enter.prevent="mostrarConfirmacionPago"
                  type="text"
                  inputmode="decimal"
                  class="w-full pl-12 pr-4 py-3.5 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-natillera-500 focus:ring-2 focus:ring-natillera-200 transition-all outline-none"
                  :placeholder="(
                    (getTotalActividadesSeleccionadas() > 0 || getTotalCuotasPrestamosSeleccionadas() > 0)
                      ? (formPago.tipo_pago === 'transferencia' ? `Máx: ${formatMoney(Math.max(0, getTotalObligacionNetaPagoActual()))}` : 'Ingresa el valor total')
                      : (formPago.tipo_pago === 'transferencia'
                        ? `Máx: ${formatMoney(Math.max(0, getTotalObligacionNetaPagoActual()))}`
                        : `Máx: ${formatMoney(Math.max(0, getTotalAPagar(cuotaSeleccionada)))}`)
                  )"
                  required
                />
              </div>
            </div>

            <!-- 4×1000 opcional (solo transferencia): monto neto en el campo; el impuesto se suma si se marca -->
            <div
              v-if="formPago.tipo_pago === 'transferencia'"
              class="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-slate-50 to-gray-50 p-4 space-y-3 shadow-sm"
            >
              <label class="flex items-start gap-3 cursor-pointer select-none">
                <input
                  v-model="formPago.aplicaImpuesto4x1000"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-natillera-600 focus:ring-natillera-500"
                />
                <div class="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-gray-800">Aplica 4×1000</span>
                  <span
                    v-if="formPago.aplicaImpuesto4x1000 && (formPago.valor || 0) > 0"
                    class="text-sm font-bold text-red-600 tabular-nums"
                  >
                    + ${{ formatMoney(calcularImpuesto4x1000(formPago.valor || 0)) }}
                  </span>
                </div>
              </label>
              <p
                v-if="formPago.aplicaImpuesto4x1000 && (formPago.valor || 0) > 0"
                class="text-xs text-gray-600 pl-7"
              >
                Se agregará ${{ formatMoney(calcularImpuesto4x1000(formPago.valor || 0)) }} sobre el valor ingresado
              </p>
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                <span class="text-sm font-semibold text-gray-700">Total a cobrar</span>
                <span class="text-xl font-bold text-natillera-700 tabular-nums">${{ formatMoney(getTotalACobrarModalPago()) }}</span>
              </div>
            </div>

            <!-- Desplegable de Actividades Pendientes -->
            <div class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <!-- Pantalla de carga: skeleton hasta que las actividades estén cargadas -->
              <div
                v-if="cargandoActividades"
                class="w-full p-4 bg-gradient-to-r from-purple-50/80 via-indigo-50/80 to-blue-50/80 border-b-0 flex items-center gap-3"
              >
                <div class="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0"></div>
                <div class="flex-1 min-w-0 space-y-2">
                  <div class="h-3.5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div v-if="cargandoActividades" class="p-6 flex flex-col items-center justify-center gap-3 border-t border-gray-100 bg-white">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-500"></div>
                <p class="text-sm font-medium text-gray-600">Cargando actividades pendientes...</p>
                <p class="text-xs text-gray-400">Obteniendo valores y estados</p>
              </div>

              <template v-else>
              <button
                type="button"
                @click="actividadesDesplegableAbierto = !actividadesDesplegableAbierto"
                :class="[
                  'w-full flex items-center justify-between p-4 transition-all duration-200',
                  actividadesSeleccionadas.size > 0
                    ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 hover:from-purple-100 hover:via-indigo-100 hover:to-purple-100'
                    : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 hover:from-purple-100 hover:via-indigo-100 hover:to-blue-100'
                ]"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <SparklesIcon class="w-5 h-5 text-white" />
                  </div>
                  <div class="text-left flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                      <span>Actividades pendientes</span>
                      <span 
                        v-if="actividadesSeleccionadas.size > 0"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500 text-white shadow-md shadow-emerald-500/30 whitespace-nowrap"
                      >
                        {{ actividadesSeleccionadas.size }} {{ actividadesSeleccionadas.size === 1 ? 'Seleccionado' : 'Seleccionados' }}
                      </span>
                      <span class="text-xs font-normal text-gray-600">
                        <span v-if="actividadesPendientes.length === 0">• No hay actividades pendientes</span>
                        <span v-else>• {{ actividadesPendientes.length }} actividad{{ actividadesPendientes.length !== 1 ? 'es' : '' }} pendiente{{ actividadesPendientes.length !== 1 ? 's' : '' }}</span>
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronDownIcon 
                  :class="['w-5 h-5 text-gray-500 transition-transform duration-200', actividadesDesplegableAbierto ? 'rotate-180' : '']" 
                />
              </button>
              
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[1000px]"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[1000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="actividadesDesplegableAbierto" class="border-t border-gray-200 bg-white">
                  <div v-if="actividadesPendientes.length === 0" class="p-6 text-center">
                    <p class="text-sm text-gray-500">No hay actividades pendientes</p>
                  </div>
                  <div v-else class="p-2 space-y-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="(actividad, index) in actividadesPendientes"
                      :key="actividad.id"
                      @click="toggleActividadSeleccionada(actividad.id)"
                      :class="[
                        'bg-gradient-to-br rounded-lg p-2.5 border transition-all',
                        actividadesDeLaCuotaActual.has(actividad.id) ? 'cursor-default' : 'cursor-pointer',
                        actividadesSeleccionadas.has(actividad.id)
                          ? 'from-purple-100 to-indigo-100 border-purple-400 shadow-md'
                          : 'from-gray-50 to-purple-50/30 border-gray-200 hover:border-purple-300 hover:shadow-sm'
                      ]"
                    >
                      <div class="flex items-center gap-2.5">
                        <!-- Checkbox -->
                        <div class="flex-shrink-0">
                          <div :class="[
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                            actividadesSeleccionadas.has(actividad.id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'bg-white border-gray-300'
                          ]">
                            <svg v-if="actividadesSeleccionadas.has(actividad.id)" class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <!-- Contenido compacto -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-2 mb-1">
                            <h4 class="font-semibold text-gray-800 truncate text-sm">
                              {{ limpiarDescripcionActividad(actividad.actividad?.descripcion) }}
                            </h4>
                            <p class="text-xs font-bold text-orange-600 flex-shrink-0">
                              ${{ formatMoney(actividad.valor_pendiente || 0) }}
                            </p>
                          </div>
                          <span
                            v-if="actividadesDeLaCuotaActual.has(actividad.id)"
                            class="text-[10px] font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded inline-block"
                          >
                            Incluida en esta cuota (no se puede quitar)
                          </span>
                          <div class="flex items-center gap-3 text-xs">
                            <span class="text-gray-500">
                              Asignado: <span class="font-semibold text-gray-700">${{ formatMoney(actividad.valor_asignado || 0) }}</span>
                            </span>
                            <span v-if="actividad.valor_pagado > 0" class="text-green-600">
                              Pagado: <span class="font-semibold">${{ formatMoney(actividad.valor_pagado || 0) }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
              </template>
            </div>

            <!-- Desplegable de Cuotas de Préstamos Pendientes -->
            <div 
              v-if="cuotasPrestamosPendientes.length > 0"
              class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <!-- Pantalla de carga: skeleton hasta que las cuotas estén cargadas -->
              <div
                v-if="cargandoCuotasPrestamos"
                class="w-full p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-b-0 flex items-center gap-3"
              >
                <div class="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0"></div>
                <div class="flex-1 min-w-0 space-y-2">
                  <div class="h-3.5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div v-if="cargandoCuotasPrestamos" class="p-6 flex flex-col items-center justify-center gap-3 border-t border-gray-100 bg-white">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-500"></div>
                <p class="text-sm font-medium text-gray-600">Cargando cuotas de préstamos pendientes...</p>
                <p class="text-xs text-gray-400">Obteniendo valores y estados</p>
              </div>

              <template v-else>
              <button
                type="button"
                @click="cuotasPrestamosDesplegableAbierto = !cuotasPrestamosDesplegableAbierto"
                :class="[
                  'w-full flex items-center justify-between p-4 transition-all duration-200',
                  cuotasPrestamosSeleccionadas.size > 0
                    ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 hover:from-blue-100 hover:via-indigo-100 hover:to-blue-100'
                    : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100'
                ]"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="text-left flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                      <span>Cuotas de préstamos pendientes</span>
                      <span 
                        v-if="cuotasPrestamosSeleccionadas.size > 0"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500 text-white shadow-md shadow-emerald-500/30 whitespace-nowrap"
                      >
                        {{ cuotasPrestamosSeleccionadas.size }} {{ cuotasPrestamosSeleccionadas.size === 1 ? 'Seleccionada' : 'Seleccionadas' }}
                      </span>
                      <span class="text-xs font-normal text-gray-600">
                        • {{ cuotasPrestamosPendientes.length }} cuota{{ cuotasPrestamosPendientes.length !== 1 ? 's' : '' }} pendiente{{ cuotasPrestamosPendientes.length !== 1 ? 's' : '' }}
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronDownIcon 
                  :class="['w-5 h-5 text-gray-500 transition-transform duration-200', cuotasPrestamosDesplegableAbierto ? 'rotate-180' : '']" 
                />
              </button>
              
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[1000px]"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[1000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="cuotasPrestamosDesplegableAbierto" class="border-t border-gray-200 bg-white">
                  <div v-if="cuotasPrestamosPendientes.length === 0" class="p-6 text-center">
                    <p class="text-sm text-gray-500">No hay cuotas de préstamos pendientes</p>
                  </div>
                  <div v-else class="p-2 space-y-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="(cuotaPrestamo, index) in cuotasPrestamosPendientes"
                      :key="cuotaPrestamo.id"
                      @click="toggleCuotaPrestamoSeleccionada(cuotaPrestamo.id)"
                      :class="[
                        'bg-gradient-to-br rounded-lg p-2.5 border transition-all',
                        cuotasPrestamosDeLaCuotaActual.has(cuotaPrestamo.id) ? 'cursor-default' : 'cursor-pointer',
                        cuotasPrestamosSeleccionadas.has(cuotaPrestamo.id)
                          ? 'from-blue-100 to-indigo-100 border-blue-400 shadow-md'
                          : 'from-gray-50 to-blue-50/30 border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      ]"
                    >
                      <div class="flex items-center gap-2.5">
                        <!-- Checkbox -->
                        <div class="flex-shrink-0">
                          <div :class="[
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                            cuotasPrestamosSeleccionadas.has(cuotaPrestamo.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-gray-300'
                          ]">
                            <svg v-if="cuotasPrestamosSeleccionadas.has(cuotaPrestamo.id)" class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <!-- Contenido compacto -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-2 mb-1">
                            <h4 class="font-semibold text-gray-800 truncate text-sm">
                              Cuota #{{ cuotaPrestamo.numero_cuota }} - {{ formatDate(cuotaPrestamo.fecha_proyectada) }}
                            </h4>
                            <p class="text-xs font-bold text-blue-600 flex-shrink-0">
                              ${{ formatMoney(cuotaPrestamo.valor_pendiente || 0) }}
                            </p>
                          </div>
                          <span
                            v-if="cuotasPrestamosDeLaCuotaActual.has(cuotaPrestamo.id)"
                            class="text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded inline-block"
                          >
                            Programada para este período (no se puede quitar)
                          </span>
                          <div class="flex items-center gap-3 text-xs">
                            <span class="text-gray-500">
                              Valor cuota: <span class="font-semibold text-gray-700">${{ formatMoney(cuotaPrestamo.valor_cuota || 0) }}</span>
                            </span>
                            <span v-if="cuotaPrestamo.valor_pagado > 0" class="text-green-600">
                              Pagado: <span class="font-semibold">${{ formatMoney(cuotaPrestamo.valor_pagado || 0) }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
              </template>
            </div>
          </div>
        </div>

        <!-- Indicador de scroll en el borde inferior de toda la modal (visible para el usuario) -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div 
            v-if="mostrarIndicadorScroll"
            class="flex-shrink-0 w-full py-2 px-4 pointer-events-none flex justify-center items-center gap-2 bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500 border-t border-natillera-600/30"
          >
            <span class="text-xs font-semibold text-white">Desliza para ver más</span>
            <ChevronDownIcon class="w-4 h-4 text-white flex-shrink-0" style="animation: bounce-subtle 1.5s ease-in-out infinite;" />
          </div>
        </Transition>

        <!-- Footer con botones (fijo, pegados al fondo del modal) -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalPago = false; formPago.valor = 0; formPago.tipo_pago = 'efectivo'; formPago.aplicaImpuesto4x1000 = false; mostrandoAnimacionPago.value = false"
              @touchstart="modalPago = false; formPago.valor = 0; formPago.tipo_pago = 'efectivo'; formPago.aplicaImpuesto4x1000 = false; mostrandoAnimacionPago.value = false"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all border border-gray-200"
              style="pointer-events: auto !important; touch-action: manipulation !important; -webkit-tap-highlight-color: rgba(34, 197, 94, 0.25); min-height: 44px; z-index: 20 !important;"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="mostrarConfirmacionPago"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="cuotasStore.loading || getValorPagoTotal() <= 0"
            >
              {{ cuotasStore.loading ? 'Registrando...' : 'Registrar Pago' }}
            </button>
          </div>
        </div>
    </ModalWrapper>

    <!-- Animación de registro de pago (Teleport + z-[70] para quedar por encima del modal de pago z-[60]) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="mostrandoAnimacionPago" class="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden" style="will-change: opacity, transform; touch-action: none; overscroll-behavior: none;">
        <!-- Fondo con blur y gradiente animado que bloquea interacciones -->
        <div 
          class="absolute inset-0 bg-gradient-to-br from-natillera-500/90 via-emerald-500/90 to-teal-600/90 backdrop-blur-sm" 
          @click.stop.prevent 
          @mousedown.stop.prevent 
          @touchstart.stop.prevent
          @wheel.stop.prevent
          @scroll.stop.prevent
          style="touch-action: none; overscroll-behavior: none;"
        ></div>
        
        <!-- Efectos decorativos de fondo animados -->
        <div class="absolute inset-0 overflow-hidden">
          <!-- Círculos grandes animados -->
          <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse-fast" style="will-change: opacity;"></div>
          <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse-fast" style="animation-delay: 0.5s; will-change: opacity;"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse-fast" style="animation-delay: 0.25s; will-change: opacity;"></div>
        </div>

        <!-- Contenido principal de la animación -->
        <div class="relative z-10 flex flex-col items-center justify-center">
          <!-- Contenedor del spinner principal -->
          <div class="relative mb-8">
            <!-- Anillo exterior con gradiente giratorio -->
            <div class="relative w-40 h-40" style="will-change: transform;">
              <!-- Anillo exterior grande -->
              <div class="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-white/30 via-white/50 to-white/30 p-1 animate-spin-fast" style="will-change: transform;">
                <div class="w-full h-full rounded-full bg-gradient-to-br from-natillera-500/90 via-emerald-500/90 to-teal-600/90"></div>
              </div>
              
              <!-- Anillo medio giratorio -->
              <div class="absolute inset-4 rounded-full border-4 border-transparent border-t-white border-r-white/80 animate-spin-fast-reverse" style="will-change: transform;"></div>
              
              <!-- Anillo interior giratorio (dirección opuesta) -->
              <div class="absolute inset-8 rounded-full border-3 border-transparent border-b-white/60 border-l-white/40 animate-spin-fast" style="will-change: transform;"></div>
              
              <!-- Icono central con efecto de pulso -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="relative">
                  <!-- Fondo del icono con pulso -->
                  <div class="absolute inset-0 bg-white/30 rounded-full blur-2xl animate-pulse-fast" style="will-change: opacity;"></div>
                  <!-- Icono de dinero -->
                  <div class="relative bg-white rounded-full p-6 shadow-2xl animate-bounce-fast" style="will-change: transform;">
                    <CurrencyDollarIcon class="w-12 h-12 text-natillera-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Partículas decorativas alrededor (reducidas para mejor rendimiento) -->
            <div class="absolute -top-6 -left-6 w-4 h-4 bg-white rounded-full animate-ping-fast" style="animation-delay: 0s; will-change: transform, opacity;"></div>
            <div class="absolute -top-4 -right-8 w-3 h-3 bg-emerald-200 rounded-full animate-ping-fast" style="animation-delay: 0.3s; will-change: transform, opacity;"></div>
            <div class="absolute -bottom-6 -left-8 w-3.5 h-3.5 bg-teal-200 rounded-full animate-ping-fast" style="animation-delay: 0.6s; will-change: transform, opacity;"></div>
            <div class="absolute -bottom-4 -right-6 w-4 h-4 bg-natillera-200 rounded-full animate-ping-fast" style="animation-delay: 0.9s; will-change: transform, opacity;"></div>
          </div>

          <!-- Texto principal -->
          <div class="text-center space-y-4">
            <h2 class="text-4xl sm:text-5xl font-display font-bold text-white drop-shadow-lg">
              Registrando Pago
            </h2>
            <div class="flex items-center justify-center gap-2">
              <div class="w-3 h-3 bg-white rounded-full animate-bounce-fast" style="animation-delay: 0s; will-change: transform;"></div>
              <div class="w-3 h-3 bg-white rounded-full animate-bounce-fast" style="animation-delay: 0.15s; will-change: transform;"></div>
              <div class="w-3 h-3 bg-white rounded-full animate-bounce-fast" style="animation-delay: 0.3s; will-change: transform;"></div>
            </div>
            <p class="text-white/90 text-lg sm:text-xl font-medium mt-4">
              Por favor espera un momento...
            </p>
          </div>

          <!-- Barra de progreso decorativa -->
          <div class="mt-10 w-72 h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div class="h-full bg-gradient-to-r from-white via-white/80 to-white rounded-full progress-bar-animated-fast"></div>
          </div>

          <!-- Efectos de partículas flotantes -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none" style="pointer-events: none;">
            <!-- Partículas de dinero flotantes -->
            <div class="absolute top-1/4 left-1/4 text-white/40 text-2xl animate-float-fast" style="animation-delay: 0s; will-change: transform, opacity;">
              💰
            </div>
            <div class="absolute top-1/3 right-1/4 text-white/40 text-2xl animate-float-fast" style="animation-delay: 0.25s; will-change: transform, opacity;">
              💵
            </div>
            <div class="absolute bottom-1/4 left-1/3 text-white/40 text-2xl animate-float-fast" style="animation-delay: 0.5s; will-change: transform, opacity;">
              💴
            </div>
            <div class="absolute bottom-1/3 right-1/3 text-white/40 text-2xl animate-float-fast" style="animation-delay: 0.75s; will-change: transform, opacity;">
              💶
            </div>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

    <!-- Modal Historial de Ajustes: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalHistorialAjustes"
      :z-index="70"
      overlay-class="fixed inset-0 z-[70] flex items-center justify-center p-4"
      card-class="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
      card-max-width="42rem"
      @close="modalHistorialAjustes = false"
    >
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
                  <span v-if="cuotaSeleccionada?.quincena === 1 || cuotaSeleccionada?.quincena === 2" class="text-purple-600">- Q{{ cuotaSeleccionada.quincena }}</span>
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
    </ModalWrapper>

    <!-- Modal Confirmación Antes de Registrar Pago -->
    <ModalWrapper
      :show="!!modalConfirmarPago"
      :z-index="65"
      overlay-class="fixed inset-0 z-[65] flex items-center justify-center p-4"
      card-class="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col"
      card-max-width="32rem"
      @close="modalConfirmarPago = false"
    >
      <!-- Header con gradiente -->
      <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden flex-shrink-0">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-display font-bold">
                Confirmar Pago
              </h3>
              <p class="text-white/90 text-sm">
                Revisa el desglose antes de registrar
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Valor Total -->
        <div class="bg-gradient-to-br from-natillera-50 to-emerald-50 rounded-xl p-5 border-2 border-natillera-200 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <span class="text-base font-semibold text-gray-700">Total a pagar</span>
            <span class="text-3xl font-bold text-natillera-700">${{ formatMoney(desglosePagoConfirmacion?.total || 0) }}</span>
          </div>

          <div
            v-if="desglosePagoConfirmacion?.tipoPago === 'transferencia' && (desglosePagoConfirmacion?.valorConsignadoTransferencia || 0) > 0"
            class="rounded-lg border border-blue-200 bg-blue-50/90 px-3 py-2.5 text-sm text-blue-900"
          >
            <p class="font-semibold">Total a consignar por transferencia</p>
            <p class="text-lg font-bold tabular-nums">${{ formatMoney(desglosePagoConfirmacion.valorConsignadoTransferencia) }}</p>
          </div>

          <!-- Pagado anteriormente (cuando ya hubo pagos parciales) -->
          <div 
            v-if="(desglosePagoConfirmacion?.valorPagadoAnteriorTotal || 0) > 0"
            class="mt-4 pt-4 border-t-2 border-natillera-200/50 flex items-center justify-between"
          >
            <span class="text-sm font-semibold text-emerald-700">Pagado anteriormente</span>
            <span class="text-xl font-bold text-emerald-700">${{ formatMoney(desglosePagoConfirmacion?.valorPagadoAnteriorTotal || 0) }}</span>
          </div>
          
          <!-- Forma de Pago - Destacada debajo del total -->
          <div class="mt-4 pt-4 border-t-2 border-natillera-200/50">
            <div class="flex items-center justify-between p-4 rounded-lg"
              :class="desglosePagoConfirmacion?.tipoPago === 'transferencia' 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm' 
                : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-sm'">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                  :class="desglosePagoConfirmacion?.tipoPago === 'transferencia' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'">
                  <span class="text-2xl">{{ desglosePagoConfirmacion?.tipoPago === 'transferencia' ? '💳' : '💵' }}</span>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Forma de pago</p>
                  <p class="text-lg font-bold"
                    :class="desglosePagoConfirmacion?.tipoPago === 'transferencia' 
                      ? 'text-blue-700' 
                      : 'text-emerald-700'">
                    {{ desglosePagoConfirmacion?.tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                  </p>
                </div>
              </div>
              <div class="w-6 h-6 rounded-full flex items-center justify-center"
                :class="desglosePagoConfirmacion?.tipoPago === 'transferencia' 
                  ? 'bg-blue-100' 
                  : 'bg-emerald-100'">
                <svg class="w-4 h-4"
                  :class="desglosePagoConfirmacion?.tipoPago === 'transferencia' 
                    ? 'text-blue-600' 
                    : 'text-emerald-600'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Pago parcial: lo que queda pendiente -->
        <div v-if="desglosePagoConfirmacion?.esParcial && (desglosePagoConfirmacion?.pendienteDespuesPago || 0) > 0" class="rounded-xl p-4 border-2 border-amber-200 bg-amber-50/80">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <span class="text-amber-600 text-lg">⏳</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-amber-800">Queda pendiente</p>
                <p class="text-xs text-amber-600">Después de este pago</p>
              </div>
            </div>
            <span class="text-xl font-bold text-amber-800">${{ formatMoney(desglosePagoConfirmacion?.pendienteDespuesPago || 0) }}</span>
          </div>
        </div>

        <!-- Desglose -->
        <div class="space-y-2">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Desglose del pago:</h4>
          
          <!-- Cuota -->
          <div v-if="(desglosePagoConfirmacion?.cuota || 0) > 0" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-blue-600 text-sm font-bold">C</span>
              </div>
              <span class="text-sm font-medium text-gray-700">Cuota</span>
            </div>
            <span class="text-sm font-semibold text-gray-800">${{ formatMoney(desglosePagoConfirmacion?.cuota || 0) }}</span>
          </div>

          <!-- Sanción -->
          <div v-if="(desglosePagoConfirmacion?.sancion || 0) > 0" class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span class="text-red-600 text-sm font-bold">S</span>
              </div>
              <span class="text-sm font-medium text-gray-700">Sanción</span>
            </div>
            <span class="text-sm font-semibold text-red-700">${{ formatMoney(desglosePagoConfirmacion?.sancion || 0) }}</span>
          </div>

          <!-- Actividades -->
          <div v-if="(desglosePagoConfirmacion?.actividades || 0) > 0" class="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span class="text-purple-600 text-sm font-bold">A</span>
              </div>
              <span class="text-sm font-medium text-gray-700">
                Actividades 
                <span class="text-xs text-gray-500">({{ desglosePagoConfirmacion?.cantidadActividades || 0 }})</span>
              </span>
            </div>
            <span class="text-sm font-semibold text-purple-700">${{ formatMoney(desglosePagoConfirmacion?.actividades || 0) }}</span>
          </div>

          <!-- Cuotas de Préstamos -->
          <div v-if="(desglosePagoConfirmacion?.cuotasPrestamos || 0) > 0" class="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
            <!-- Header con total -->
            <div class="flex items-center justify-between p-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 text-sm font-bold">P</span>
                </div>
                <span class="text-sm font-medium text-gray-700">
                  Cuotas de préstamos
                  <span class="text-xs text-gray-500">({{ desglosePagoConfirmacion?.cantidadCuotasPrestamos || 0 }})</span>
                </span>
              </div>
              <span class="text-sm font-semibold text-blue-700">${{ formatMoney(desglosePagoConfirmacion?.cuotasPrestamos || 0) }}</span>
            </div>
            <!-- Desglose individual de cada cuota de préstamo -->
            <div v-if="desglosePagoConfirmacion?.cuotasPrestamosDetalle && desglosePagoConfirmacion.cuotasPrestamosDetalle.length > 0" class="border-t border-blue-200 bg-blue-100/50 px-3 py-2 space-y-1.5">
              <div 
                v-for="(cuotaPrestamo, index) in desglosePagoConfirmacion.cuotasPrestamosDetalle" 
                :key="index"
                class="flex items-center justify-between text-xs"
              >
                <span class="text-gray-600 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {{ cuotaPrestamo.nombre }}
                </span>
                <span class="text-blue-700 font-semibold">${{ formatMoney(cuotaPrestamo.valor || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0 flex gap-3">
        <button
          @click="modalConfirmarPago = false"
          class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Cancelar
        </button>
        <button
          @click="confirmarYRegistrarPago"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25"
        >
          Confirmar y Registrar
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Confirmación de Pago con Comprobante Visual: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalConfirmacion"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      card-class="relative max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      card-max-width="32rem"
      @close="cerrarConfirmacion"
    >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-emerald-500 via-natillera-500 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 w-full flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 mb-2 min-w-0">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <div class="min-w-0">
                <h3 class="text-2xl font-display font-bold">
                  ¡Pago Registrado!
                </h3>
                <p class="text-white/90 text-sm mt-0.5">
                  Comprobante generado exitosamente
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="cerrarConfirmacion"
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors"
              aria-label="Cerrar"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div 
          ref="scrollComprobanteRef"
          @scroll="verificarScrollComprobante"
          class="overflow-y-auto flex-1 p-3 sm:p-6 relative"
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
            class="bg-white rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
          >
          <!-- Contenido del comprobante con fondo verdoso claro -->
          <div class="comprobante-content" style="background: #ecfdf5; padding: 14px 12px; color: #1f2937;">
            <!-- TÍTULO Y CHULO VERDE -->
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
                <!-- Chulo verde -->
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                  </svg>
                </div>
                <!-- Título -->
                <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.5px;">
                  Comprobante de Pago
                </h1>
              </div>
            </div>
            
            <!-- SECCIÓN 1: INFORMACIÓN DEL PAGO (Parte Superior) -->
            <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
              <!-- Valor pagado y estado -->
              <div style="text-align: center; margin-bottom: 10px;">
                <p style="color: #6b7280; font-size: 9px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">MONTO PAGADO</p>
                <p style="font-size: 28px; font-weight: 900; margin: 0 0 4px 0; letter-spacing: -1px; color: #059669;">
                  ${{ formatMoney(pagoRegistrado?.valor) }}
                </p>
                <div 
                  :style="pagoRegistrado?.esParcial
                    ? 'background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1.5px solid #fcd34d;'
                    : 'background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 1.5px solid #10b981;'"
                  style="border-radius: 12px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;"
                >
                  <span 
                    :style="pagoRegistrado?.esParcial
                      ? 'width: 5px; height: 5px; background: #f59e0b;'
                      : 'width: 5px; height: 5px; background: #10b981;'"
                    style="border-radius: 50%; display: inline-block;"
                  ></span>
                  <p 
                    :style="pagoRegistrado?.esParcial
                      ? 'color: #f59e0b;'
                      : 'color: #059669;'"
                    style="font-size: 9px; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;"
                  >
                    {{ pagoRegistrado?.esParcial ? 'PAGO PARCIAL' : 'PAGO COMPLETO' }}
                  </p>
                </div>
                <!-- Código de comprobante sutil -->
                <p v-if="pagoRegistrado?.codigoComprobante" style="color: #9ca3af; font-size: 11px; margin: 6px 0 0 0; font-weight: 500; letter-spacing: 0.3px; font-family: 'Courier New', monospace;">
                  {{ pagoRegistrado.codigoComprobante }}
                </p>
              </div>
              
              <!-- Grid compacto: Nombre, Período, Fecha, Forma de pago -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Socio</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.2;">{{ pagoRegistrado?.socioNombre }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Período</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.2;">{{ pagoRegistrado?.periodo || 'N/A' }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Fecha</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.4; white-space: pre-line;">{{ pagoRegistrado?.fecha || pagoRegistrado?.fechaCorta || 'N/A' }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Forma de Pago</p>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 12px;">{{ pagoRegistrado?.tipoPago === 'transferencia' ? '💳' : '💵' }}</span>
                    <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827;">
                      {{ pagoRegistrado?.tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Pagado anteriormente (solo valor, cuando hubo pago parcial previo) -->
              <div 
                v-if="(pagoRegistrado?.valorPagadoAnteriorTotal || 0) > 0"
                style="margin-top: 10px; padding: 8px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;"
              >
                <p style="color: #047857; font-size: 10px; margin: 0; font-weight: 700; text-transform: uppercase;">Pagado anteriormente</p>
                <p style="font-size: 14px; font-weight: 700; margin: 0; color: #059669;">
                  ${{ formatMoney(pagoRegistrado?.valorPagadoAnteriorTotal || 0) }}
                </p>
              </div>
            </div>

            <!-- SECCIÓN 2: CONCEPTOS PAGADOS (totales de la cuota; siempre visible al reenviar) -->
            <div style="margin-bottom: 10px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
              <p style="color: #6b7280; font-size: 9px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">CONCEPTOS PAGADOS</p>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <!-- Cuota -->
                <div v-if="pagoRegistrado?.valorCuotaPagada > 0" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">💵</span>
                    <p style="color: #065f46; font-size: 11px; margin: 0; font-weight: 600;">Cuota</p>
                  </div>
                  <p style="font-size: 13px; font-weight: 700; margin: 0; color: #065f46;">${{ formatMoney(pagoRegistrado?.valorCuotaPagada || 0) }}</p>
                </div>
                <!-- Sanción -->
                <div v-if="pagoRegistrado?.valorSancionPagada > 0" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);">
                      <span style="color: white; font-size: 12px; font-weight: 900; line-height: 1;">!</span>
                    </div>
                    <p style="color: #991b1b; font-size: 11px; margin: 0; font-weight: 600;">Sanción</p>
                  </div>
                  <p style="font-size: 13px; font-weight: 700; margin: 0; color: #dc2626;">${{ formatMoney(pagoRegistrado?.valorSancionPagada || 0) }}</p>
                </div>
                <!-- Actividades -->
                <template v-if="pagoRegistrado?.tieneActividades && (pagoRegistrado?.valorActividadesPagado || 0) > 0">
                  <template v-if="(pagoRegistrado.actividadesPagadas || []).length > 0">
                    <div 
                      v-for="(actividad, index) in pagoRegistrado.actividadesPagadas" 
                      :key="index"
                      style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"
                    >
                      <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                        <span style="font-size: 14px; flex-shrink: 0;">📅</span>
                        <p style="color: #6b21a8; font-size: 11px; margin: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ limpiarDescripcionActividad(actividad?.descripcion || actividad?.actividad?.descripcion || 'Actividad') }}
                        </p>
                      </div>
                      <p style="font-size: 13px; font-weight: 700; margin: 0; color: #6b21a8; flex-shrink: 0; margin-left: 8px;">
                        ${{ formatMoney((actividad?.valor_pendiente || 0) || (actividad?.valor_asignado || 0)) }}
                      </p>
                    </div>
                  </template>
                  <div v-else style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 14px;">📅</span>
                      <p style="color: #6b21a8; font-size: 11px; margin: 0; font-weight: 600;">Actividades</p>
                    </div>
                    <p style="font-size: 13px; font-weight: 700; margin: 0; color: #6b21a8;">${{ formatMoney(pagoRegistrado?.valorActividadesPagado || 0) }}</p>
                  </div>
                </template>
                <!-- Cuotas de préstamos -->
                <template v-if="pagoRegistrado?.tieneCuotasPrestamos && (pagoRegistrado?.valorCuotasPrestamosPagado || 0) > 0">
                  <template v-if="(pagoRegistrado.cuotasPrestamosPagadas || []).length > 0">
                    <div 
                      v-for="(cuotaPrestamo, index) in pagoRegistrado.cuotasPrestamosPagadas" 
                      :key="index"
                      style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"
                    >
                      <div style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                        <span style="font-size: 14px; flex-shrink: 0;">💰</span>
                        <p style="color: #1e40af; font-size: 11px; margin: 0; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ cuotaPrestamo.nombre }}
                        </p>
                      </div>
                      <p style="font-size: 13px; font-weight: 700; margin: 0; color: #1e40af; flex-shrink: 0; margin-left: 8px;">
                        ${{ formatMoney(cuotaPrestamo.valor || 0) }}
                      </p>
                    </div>
                  </template>
                  <div v-else style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 14px;">💰</span>
                      <p style="color: #1e40af; font-size: 11px; margin: 0; font-weight: 600;">Cuotas de préstamos</p>
                    </div>
                    <p style="font-size: 13px; font-weight: 700; margin: 0; color: #1e40af;">${{ formatMoney(pagoRegistrado?.valorCuotasPrestamosPagado || 0) }}</p>
                  </div>
                </template>
                <!-- 4×1000 (GMF): total acumulado; con varios abonos también en Historial por fila -->
                <div
                  v-if="(pagoRegistrado?.impuesto4x1000 || 0) > 0"
                  style="background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;"
                >
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">🏦</span>
                    <p style="color: #0c4a6e; font-size: 11px; margin: 0; font-weight: 600;">4×1000 (GMF)</p>
                  </div>
                  <p style="font-size: 13px; font-weight: 700; margin: 0; color: #0369a1;">${{ formatMoney(pagoRegistrado?.impuesto4x1000 || 0) }}</p>
                </div>
              </div>
            </div>

            <!-- SECCIÓN 2B: HISTORIAL DE PAGOS (varios abonos; en cada fila el 4×1000 si aplica) -->
            <div v-if="(pagoRegistrado?.historialPagos?.length || 0) > 1" class="overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 shadow-sm" style="margin-bottom: 12px; padding: 12px 14px; box-shadow: 0 2px 12px rgba(5, 150, 105, 0.08);">
              <div class="flex items-center gap-2 mb-3">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600" style="font-size: 11px; font-weight: 800;">📋</span>
                <p class="m-0 text-xs font-bold uppercase tracking-wider" style="color: #047857; letter-spacing: 0.8px;">Historial de pagos</p>
              </div>
              <div class="flex flex-col gap-3">
                <div 
                  v-for="(item, idx) in pagoRegistrado.historialPagos" 
                  :key="idx"
                  class="relative overflow-hidden rounded-lg border border-emerald-100 bg-white/90 shadow-sm"
                  style="padding: 10px 12px; padding-left: 14px; border-left: 3px solid #10b981;"
                >
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-1.5">
                      <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold">
                        {{ item.pago }}° Pago
                      </span>
                      <!-- Badge forma de pago diferenciada -->
                      <span
                        v-if="item.formaPagoTexto"
                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border"
                        :style="(item.formaPago || 'efectivo') === 'transferencia'
                          ? 'background: #dbeafe; color: #1e40af; border-color: #93c5fd;'
                          : (item.formaPago || '').toLowerCase() === 'tarjeta'
                          ? 'background: #f1f5f9; color: #475569; border-color: #cbd5e1;'
                          : 'background: #d1fae5; color: #047857; border-color: #6ee7b7;'"
                      >
                        <span v-if="(item.formaPago || 'efectivo') === 'transferencia'" style="font-size: 10px;">💳</span>
                        <span v-else-if="(item.formaPago || '').toLowerCase() === 'tarjeta'" style="font-size: 10px;">💳</span>
                        <span v-else style="font-size: 10px;">💵</span>
                        {{ item.formaPagoTexto }}
                      </span>
                    </div>
                    <span class="text-xs font-medium" style="color: #64748b;">{{ item.fecha }}</span>
                  </div>
                  <!-- Conceptos siempre en una columna (todos los anchos) -->
                  <div class="flex flex-col gap-1.5 mb-2 w-full">
                    <span 
                      v-for="(c, i) in item.conceptos" 
                      :key="i"
                      class="text-sm block w-full"
                      style="color: #475569;"
                    >
                      <span class="font-medium" style="color: #64748b;">{{ c.nombre }}:</span>
                      <strong class="ml-0.5 font-semibold" style="color: #0f766e;">${{ formatMoney(c.valor) }}</strong>
                    </span>
                  </div>
                  <div class="flex items-center justify-end border-t border-emerald-100/80 pt-2 mt-1">
                    <span class="text-sm font-bold" style="color: #059669;">Total: ${{ formatMoney(item.total) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECCIÓN 3: RESUMEN DE PAGO PARCIAL (solo si es pago parcial, queda pendiente) -->
            <div v-if="pagoRegistrado?.esParcial && pagoRegistrado?.valorPendiente > 0" style="margin-bottom: 10px; background: #fef3c7; border: 1.5px solid #fbbf24; border-radius: 12px; padding: 10px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <p style="color: #92400e; font-size: 9px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">RESUMEN PARCIAL</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <p style="color: #92400e; font-size: 8px; margin: 0 0 3px 0; font-weight: 600; text-transform: uppercase;">Total a Pagar</p>
                  <p style="color: #78350f; font-size: 13px; margin: 0; font-weight: 700;">${{ formatMoney((pagoRegistrado?.valorCuota || 0) + (pagoRegistrado?.sancion || 0) + (pagoRegistrado?.valorActividades || 0)) }}</p>
                </div>
                <div>
                  <p style="color: #92400e; font-size: 8px; margin: 0 0 3px 0; font-weight: 600; text-transform: uppercase;">Total Pagado</p>
                  <p style="color: #059669; font-size: 13px; margin: 0; font-weight: 700;">${{ formatMoney(pagoRegistrado?.valorPagadoTotal || 0) }}</p>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #fbbf24;">
                <p style="color: #92400e; font-size: 9px; margin: 0; font-weight: 800; text-transform: uppercase;">Pendiente</p>
                <p style="color: #f97316; font-size: 16px; margin: 0; font-weight: 900;">${{ formatMoney(pagoRegistrado?.valorPendiente || 0) }}</p>
              </div>
            </div>

            <!-- FOOTER -->
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                <div style="width: 3px; height: 3px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);"></div>
                <p style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 10px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">
                  Natillerapp
                </p>
                <div style="width: 3px; height: 3px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);"></div>
              </div>
            </div>

          </div>
        </div>
        </div>

        <!-- Footer fijo con botones de acción -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
          <!-- Móvil: dos botones píldora lado a lado + Cerrar como enlace -->
          <div class="flex sm:hidden flex-col items-center gap-4">
            <div class="flex items-center justify-center gap-3 w-full">
              <button 
                @click="descargarComprobante"
                :disabled="generandoImagen"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: #2563eb; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);"
              >
                <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
                {{ generandoImagen ? '...' : 'Descargar' }}
              </button>
              <button 
                @click="compartirWhatsApp"
                :disabled="generandoImagen || !pagoRegistrado?.socioTelefono"
                :class="[
                  'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all',
                  (generandoImagen || !pagoRegistrado?.socioTelefono)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : ''
                ]"
                :style="(generandoImagen || !pagoRegistrado?.socioTelefono) ? {} : { background: '#16a34a', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)' }"
                :title="!pagoRegistrado?.socioTelefono ? 'No hay teléfono registrado para este socio' : ''"
              >
                <ShareIcon class="w-5 h-5 flex-shrink-0" />
                <span v-if="generandoImagen">...</span>
                <span v-else-if="!pagoRegistrado?.socioTelefono">Compartir</span>
                <span v-else>Compartir</span>
              </button>
            </div>
          </div>

          <!-- Desktop: botones en columna y mensaje (sin botón WhatsApp, solo móvil) -->
          <div class="hidden sm:block space-y-3">
            <button 
              @click="descargarComprobante"
              :disabled="generandoImagen"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ generandoImagen ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <p class="text-xs text-gray-400 text-center">
              💡 En celular podrás enviar la imagen directamente a WhatsApp
            </p>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Comprobante de Modificación -->
    <ModalWrapper
      :show="!!modalModificacion"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      card-class="relative max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      card-max-width="32rem"
      @close="modalModificacion = false"
    >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 w-full flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 mb-2 min-w-0">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-2xl font-display font-bold">
                  Modificación Registrada
                </h3>
                <p class="text-white/90 text-sm mt-0.5">
                  Comprobante de actualización generado
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="modalModificacion = false"
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-colors"
              aria-label="Cerrar"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="overflow-y-auto flex-1 p-3 sm:p-6 relative">
          <!-- Comprobante Visual -->
          <div 
            id="comprobante-modificacion"
            ref="comprobanteModificacionRef"
            class="bg-white rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
          >
          <!-- Contenido del comprobante con fondo azulado claro -->
          <div class="comprobante-content" style="background: #eff6ff; padding: 14px 12px; color: #1f2937;">
            <!-- TÍTULO Y ICONO -->
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
                <!-- Icono de modificación -->
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <!-- Título -->
                <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.5px;">
                  Comprobante de Modificación
                </h1>
              </div>
            </div>
            
            <!-- SECCIÓN 1: INFORMACIÓN DE LA MODIFICACIÓN -->
            <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
              <!-- Motivo -->
              <div style="text-align: center; margin-bottom: 10px;">
                <p style="color: #6b7280; font-size: 9px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">MOTIVO</p>
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1.5px solid #3b82f6; border-radius: 12px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 4px;">
                  <span style="width: 5px; height: 5px; background: #3b82f6; border-radius: 50%; display: inline-block;"></span>
                  <p style="color: #1e40af; font-size: 10px; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                    {{ modificacionRegistrada?.motivo || 'Actualización de pago' }}
                  </p>
                </div>
              </div>
              
              <!-- Grid: Nombre, Período, Fecha -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Socio</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.2;">{{ modificacionRegistrada?.socioNombre || 'N/A' }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Período</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.2;">{{ modificacionRegistrada?.periodo || 'N/A' }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Fecha</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.4; white-space: pre-line;">{{ modificacionRegistrada?.fecha || modificacionRegistrada?.fechaCorta || 'N/A' }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Forma de Pago</p>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 12px;">{{ modificacionRegistrada?.tipoPago === 'transferencia' ? '💳' : '💵' }}</span>
                    <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827;">
                      {{ modificacionRegistrada?.tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECCIÓN 2: CÓDIGO DE COMPROBANTE -->
            <div style="margin-bottom: 10px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
              <p style="color: #6b7280; font-size: 9px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">CÓDIGO DE COMPROBANTE</p>
              <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 8px 10px;">
                <p style="color: #065f46; font-size: 8px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Código</p>
                <p style="color: #059669; font-size: 13px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 0.5px;">
                  {{ modificacionRegistrada?.codigoNuevo || 'N/A' }}
                </p>
              </div>
            </div>

            <!-- SECCIÓN 3: CAMBIOS EN VALORES (solo si hay diferencia) -->
            <div v-if="Math.abs(modificacionRegistrada?.diferencia || 0) > 0" style="margin-bottom: 10px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
              <p style="color: #6b7280; font-size: 9px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">CAMBIOS EN VALORES</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Valor anterior -->
                <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 10px;">
                  <p style="color: #6b7280; font-size: 8px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Valor Pagado Anterior</p>
                  <p style="color: #374151; font-size: 16px; font-weight: 700; margin: 0;">
                    ${{ formatMoney(modificacionRegistrada?.valorAnterior || 0) }}
                  </p>
                </div>
                <!-- Flecha -->
                <div style="text-align: center; margin: -4px 0;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #3b82f6;">
                    <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <!-- Valor nuevo -->
                <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 8px 10px;">
                  <p style="color: #1e40af; font-size: 8px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Valor Pagado Nuevo</p>
                  <p style="color: #2563eb; font-size: 16px; font-weight: 700; margin: 0;">
                    ${{ formatMoney(modificacionRegistrada?.valorNuevo || 0) }}
                  </p>
                </div>
                <!-- Diferencia -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1.5px solid #fbbf24; border-radius: 8px; padding: 8px 10px; margin-top: 4px;">
                  <p style="color: #92400e; font-size: 8px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Diferencia</p>
                  <p style="color: #d97706; font-size: 18px; font-weight: 900; margin: 0;">
                    {{ modificacionRegistrada?.diferencia >= 0 ? '+' : '' }}${{ formatMoney(Math.abs(modificacionRegistrada?.diferencia || 0)) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- SECCIÓN 4: CAMBIO DE FORMA DE PAGO (solo si cambió) -->
            <div v-if="modificacionRegistrada?.tipoPagoCambio" style="margin-bottom: 10px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
              <p style="color: #6b7280; font-size: 9px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">CAMBIO DE FORMA DE PAGO</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Forma de pago anterior -->
                <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 10px;">
                  <p style="color: #6b7280; font-size: 8px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Forma de Pago Anterior</p>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">{{ modificacionRegistrada?.tipoPagoAnterior === 'transferencia' ? '💳' : '💵' }}</span>
                    <p style="color: #374151; font-size: 14px; font-weight: 700; margin: 0;">
                      {{ modificacionRegistrada?.tipoPagoAnterior === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                    </p>
                  </div>
                </div>
                <!-- Flecha -->
                <div style="text-align: center; margin: -4px 0;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #3b82f6;">
                    <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <!-- Forma de pago nueva -->
                <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 8px 10px;">
                  <p style="color: #1e40af; font-size: 8px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Forma de Pago Nueva</p>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px;">{{ modificacionRegistrada?.tipoPago === 'transferencia' ? '💳' : '💵' }}</span>
                    <p style="color: #2563eb; font-size: 14px; font-weight: 700; margin: 0;">
                      {{ modificacionRegistrada?.tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- FOOTER -->
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                <div style="width: 3px; height: 3px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 50%; box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);"></div>
                <p style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 10px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">
                  Natillerapp
                </p>
                <div style="width: 3px; height: 3px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 50%; box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);"></div>
              </div>
            </div>

          </div>
        </div>
        </div>

        <!-- Footer fijo con botones de acción -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
          <!-- Móvil: dos botones píldora lado a lado -->
          <div class="flex sm:hidden flex-col items-center gap-4">
            <div class="flex items-center justify-center gap-3 w-full">
              <button 
                @click="descargarComprobanteModificacion"
                :disabled="generandoImagenModificacion"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: #2563eb; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);"
              >
                <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
                {{ generandoImagenModificacion ? '...' : 'Descargar' }}
              </button>
              <button 
                @click="compartirWhatsAppModificacion"
                :disabled="generandoImagenModificacion || !modificacionRegistrada?.socioTelefono"
                :class="[
                  'flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-md transition-all',
                  (generandoImagenModificacion || !modificacionRegistrada?.socioTelefono)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : ''
                ]"
                :style="(generandoImagenModificacion || !modificacionRegistrada?.socioTelefono) ? {} : { background: '#16a34a', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)' }"
                :title="!modificacionRegistrada?.socioTelefono ? 'No hay teléfono registrado para este socio' : ''"
              >
                <ShareIcon class="w-5 h-5 flex-shrink-0" />
                <span v-if="generandoImagenModificacion">...</span>
                <span v-else-if="!modificacionRegistrada?.socioTelefono">Compartir</span>
                <span v-else>Compartir</span>
              </button>
            </div>
          </div>

          <!-- Desktop: botones en columna -->
          <div class="hidden sm:block space-y-3">
            <button 
              @click="descargarComprobanteModificacion"
              :disabled="generandoImagenModificacion"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ generandoImagenModificacion ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <p class="text-xs text-gray-400 text-center">
              💡 En celular podrás enviar la imagen directamente a WhatsApp
            </p>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Exportar a Excel: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalExportar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      card-max-width="32rem"
      @close="modalExportar = false"
    >
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
    </ModalWrapper>

    <!-- Modal Editar Pago: en iOS ModalWrapper (vista/scroll correctos); en Android estructura actual -->
    <ModalWrapper
      :show="!!modalEditarCuota"
      :z-index="60"
      align="bottom"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      card-class="relative max-w-md w-full bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 border-b-0 sm:border-b max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 my-0 sm:my-4"
      @close="modalEditarCuota = false; formEditarCuota.valor = 0; formEditarCuota.tipo_pago = 'efectivo'"
    >
        <!-- Header con gradiente (fijo) - tamaño reducido ~20% -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 text-white relative overflow-hidden flex-shrink-0">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-xl font-display font-bold">
                Editar Pago
              </h3>
            </div>
            <p class="text-white/90 text-xs">
              <span v-if="(cuotaEditando?.estadoReal || cuotaEditando?.estado) === 'pagada'">
                Modifica el valor del pago registrado
              </span>
              <span v-else>
                Modifica el valor pagado de la cuota
              </span>
            </p>
          </div>
        </div>

        <!-- Contenido con scroll (min-h-0 permite que flex reduzca y active overflow-y-auto) -->
        <div 
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-6 overscroll-contain relative"
        >
          <!-- Card de información del socio -->
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200 shadow-sm">
            <!-- Alerta de ajustes si existe -->
            <div v-if="tieneAjuste(cuotaEditando)" class="mb-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-sm">
              <button
                @click.stop="abrirModalHistorialAjustes(cuotaEditando)"
                class="group w-full flex items-center justify-between gap-2 cursor-pointer"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <InformationCircleIcon class="w-4 h-4 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-blue-800 group-hover:text-blue-900 transition-colors">
                      Esta cuota tiene ajustes de valor
                    </p>
                    <p class="text-xs text-blue-600 mt-0.5">
                      Haz clic para ver el historial completo de cambios
                    </p>
                  </div>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </button>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <img 
                :src="getAvatarUrl(cuotaEditando?.socio_natillera?.socio?.nombre || cuotaEditando?.socio_natillera?.id, cuotaEditando?.socio_natillera?.socio?.avatar_seed, cuotaEditando?.socio_natillera?.socio?.avatar_style)" 
                :alt="cuotaEditando?.socio_natillera?.socio?.nombre"
                class="w-10 h-10 rounded-xl flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate text-sm">
                  {{ cuotaEditando?.socio_natillera?.socio?.nombre || 'Socio' }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ cuotaEditando?.descripcion && !tieneAjuste(cuotaEditando) ? cuotaEditando.descripcion : 'Cuota' }}
                </p>
              </div>
            </div>
            
            <!-- Cuota, Sanción y Actividades (solo cuando NO hay pago parcial) -->
            <div
              v-if="!tienePagoParcialCuota(cuotaEditando)"
              class="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Cuota</span>
                <span class="font-semibold text-gray-800">${{ formatMoney(cuotaEditando?.valor_cuota || 0) }}</span>
              </div>
              <div
                v-if="(getSancionTotalCuota(cuotaEditando) || 0) > 0 || (cuotaEditando?.valor_pagado_sancion || 0) > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Sanción</span>
                <span class="font-semibold text-red-600">${{ formatMoney(getSancionTotalCuota(cuotaEditando) || cuotaEditando?.valor_pagado_sancion || 0) }}</span>
              </div>
              <div
                v-if="getTotalActividadesPagadasEditar() > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">{{ getTextoActividadesSocio(cuotaEditando) || 'Actividades' }}</span>
                <span class="font-semibold text-purple-600">${{ formatMoney(getTotalActividadesPagadasEditar()) }}</span>
              </div>
              <div
                v-if="getTotalCuotasPrestamosPagadasEditar() > 0"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600">Cuotas de préstamos</span>
                <span class="font-semibold text-blue-600">${{ formatMoney(getTotalCuotasPrestamosPagadasEditar()) }}</span>
              </div>
              <div class="flex items-center justify-between text-base font-bold pt-2 mt-2 border-t border-gray-200">
                <span class="text-gray-700">Total pagado</span>
                <span class="text-natillera-700">${{ formatMoney((cuotaEditando?.valor_pagado || 0) + (cuotaEditando?.valor_pagado_sancion || 0) + getTotalActividadesPagadasEditar() + getTotalCuotasPrestamosPagadasEditar()) }}</span>
              </div>
            </div>

            <!-- Total a pagar, Abonado, Total pendiente y Ya abonado desplegable (solo cuando hay pago parcial) -->
            <div 
              v-if="tienePagoParcialCuota(cuotaEditando)"
              class="mb-3 space-y-2"
            >
              <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600">Total a pagar</p>
                  <p class="font-bold text-gray-800 text-base">
                    ${{ formatMoney(Math.max(0, getTotalAPagarConActividades(cuotaEditando)) + (cuotaEditando?.valor_pagado || 0) + (cuotaEditando?.valor_pagado_sancion || 0) + getTotalActividadesPagadasEditar() + getTotalCuotasPrestamosPagadasEditar()) }}
                </p>
              </div>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600">Abonado</p>
                  <p class="font-bold text-green-600 text-base">
                    ${{ formatMoney((cuotaEditando?.valor_pagado || 0) + (cuotaEditando?.valor_pagado_sancion || 0) + getTotalActividadesPagadasEditar() + getTotalCuotasPrestamosPagadasEditar()) }}
                </p>
              </div>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600">Total pendiente</p>
                  <p :class="['font-bold text-base', cuotaEditando?.estado === 'mora' ? 'text-red-600' : 'text-orange-600']">
                    ${{ formatMoney(Math.max(0, getTotalAPagarConActividades(cuotaEditando))) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-5">
            <!-- Campo de tipo de pago -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de pago <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <!-- Opción Efectivo -->
                <button
                  type="button"
                  @click="formEditarCuota.tipo_pago = 'efectivo'"
                  :class="[
                    'relative p-2.5 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02]',
                    formEditarCuota.tipo_pago === 'efectivo'
                      ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex flex-col items-center gap-1.5">
                    <!-- Icono -->
                    <div :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                      formEditarCuota.tipo_pago === 'efectivo'
                        ? 'bg-gradient-to-br from-natillera-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    ]">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <!-- Texto -->
                    <span :class="[
                      'font-semibold text-xs',
                      formEditarCuota.tipo_pago === 'efectivo'
                        ? 'text-natillera-700'
                        : 'text-gray-600'
                    ]">
                      Efectivo
                    </span>
                    <!-- Indicador de selección -->
                    <div v-if="formEditarCuota.tipo_pago === 'efectivo'" class="absolute top-1.5 right-1.5">
                      <div class="w-4 h-4 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                        <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                <!-- Opción Transferencia -->
                <button
                  type="button"
                  @click="formEditarCuota.tipo_pago = 'transferencia'"
                  :class="[
                    'relative p-2.5 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02]',
                    formEditarCuota.tipo_pago === 'transferencia'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  <div class="flex flex-col items-center gap-1.5">
                    <!-- Icono -->
                    <div :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                      formEditarCuota.tipo_pago === 'transferencia'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-400'
                    ]">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                    </div>
                    <!-- Texto -->
                    <span :class="[
                      'font-semibold text-xs',
                      formEditarCuota.tipo_pago === 'transferencia'
                        ? 'text-blue-700'
                        : 'text-gray-600'
                    ]">
                      Transferencia
                    </span>
                    <!-- Indicador de selección -->
                    <div v-if="formEditarCuota.tipo_pago === 'transferencia'" class="absolute top-1.5 right-1.5">
                      <div class="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Campo de valor del pago -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span v-if="(cuotaEditando?.estadoReal || cuotaEditando?.estado) === 'pagada'">
                  Valor pagado total <span class="text-red-500">*</span>
                  <span class="text-xs text-amber-600 font-normal ml-2">
                    (Al cambiar el valor se generará un nuevo código de comprobante)
                  </span>
                </span>
                <span v-else>
                  Valor pagado <span class="text-red-500">*</span>
                </span>
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-500 z-10">
                  <CurrencyDollarIcon class="w-5 h-5" />
                </div>
                <input 
                  :value="formatearValorPago(formEditarCuota.valor)"
                  @input="handleValorPagoEditarInput($event)"
                  @focus="seleccionarValorPagoEditar"
                  @click="seleccionarValorPagoEditar"
                  type="text"
                  inputmode="decimal"
                  class="w-full pl-12 pr-4 py-3.5 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-natillera-500 focus:ring-2 focus:ring-natillera-200 transition-all outline-none"
                  placeholder="Ingresa el valor total pagado"
                  required
                />
              </div>
            </div>

            <!-- Desplegable de Actividades Pagadas -->
            <div 
              v-if="actividadesPagadasEditar.length > 0"
              class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <button 
                type="button"
                @click="actividadesDesplegableAbiertoEditar = !actividadesDesplegableAbiertoEditar"
                class="w-full flex items-center justify-between p-4 transition-all duration-200 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 hover:from-green-100 hover:via-emerald-100 hover:to-green-100"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <SparklesIcon class="w-5 h-5 text-white" />
                  </div>
                  <div class="text-left flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                      <span>Actividades pagadas</span>
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500 text-white shadow-md shadow-emerald-500/30 whitespace-nowrap">
                        {{ actividadesPagadasEditar.length }} {{ actividadesPagadasEditar.length === 1 ? 'Pagada' : 'Pagadas' }}
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronDownIcon 
                  :class="['w-5 h-5 text-gray-500 transition-transform duration-200', actividadesDesplegableAbiertoEditar ? 'rotate-180' : '']" 
                />
              </button>
              
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[1000px]"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[1000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="actividadesDesplegableAbiertoEditar" class="border-t border-gray-200 bg-white">
                  <div class="p-2 space-y-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="actividad in actividadesPagadasEditar"
                      :key="actividad.id"
                      class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2.5 border border-green-200"
                    >
                      <div class="flex items-center gap-2.5">
                        <div class="flex-shrink-0">
                          <div class="w-5 h-5 rounded border-2 flex items-center justify-center bg-green-500 border-green-500">
                            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-2 mb-1">
                            <h4 class="font-semibold text-gray-800 truncate text-sm">
                              {{ limpiarDescripcionActividad(actividad.actividad?.descripcion) }}
                            </h4>
                            <p class="text-xs font-bold text-green-600 flex-shrink-0">
                              ${{ formatMoney(actividad.valor_pagado || 0) }}
                            </p>
                          </div>
                          <div class="flex items-center gap-3 text-xs">
                            <span class="text-gray-500">
                              Asignado: <span class="font-semibold text-gray-700">${{ formatMoney(actividad.valor_asignado || 0) }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Desplegable de Cuotas de Préstamos Pagadas -->
            <div 
              v-if="cuotasPrestamosPagadasEditar.length > 0"
              class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <button
                type="button"
                @click="cuotasPrestamosDesplegableAbiertoEditar = !cuotasPrestamosDesplegableAbiertoEditar"
                class="w-full flex items-center justify-between p-4 transition-all duration-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 hover:from-blue-100 hover:via-indigo-100 hover:to-blue-100"
              >
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="text-left flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                      <span>Cuotas de préstamos pagadas</span>
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500 text-white shadow-md shadow-emerald-500/30 whitespace-nowrap">
                        {{ cuotasPrestamosPagadasEditar.length }} {{ cuotasPrestamosPagadasEditar.length === 1 ? 'Pagada' : 'Pagadas' }}
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronDownIcon 
                  :class="['w-5 h-5 text-gray-500 transition-transform duration-200', cuotasPrestamosDesplegableAbiertoEditar ? 'rotate-180' : '']" 
                />
              </button>
              
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[1000px]"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 max-h-[1000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-show="cuotasPrestamosDesplegableAbiertoEditar" class="border-t border-gray-200 bg-white">
                  <div class="p-2 space-y-2 max-h-64 overflow-y-auto">
                    <div
                      v-for="cuotaPrestamo in cuotasPrestamosPagadasEditar"
                      :key="cuotaPrestamo.id"
                      class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-200"
                    >
                      <div class="flex items-center gap-2.5">
                        <div class="flex-shrink-0">
                          <div class="w-5 h-5 rounded border-2 flex items-center justify-center bg-blue-500 border-blue-500">
                            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-2 mb-1">
                            <h4 class="font-semibold text-gray-800 truncate text-sm">
                              Cuota #{{ cuotaPrestamo.numero_cuota }} - {{ formatDate(cuotaPrestamo.fecha_proyectada) }}
                            </h4>
                            <p class="text-xs font-bold text-blue-600 flex-shrink-0">
                              ${{ formatMoney(cuotaPrestamo.valor_pagado || 0) }}
                            </p>
                          </div>
                          <div class="flex items-center gap-3 text-xs">
                            <span class="text-gray-500">
                              Valor cuota: <span class="font-semibold text-gray-700">${{ formatMoney(cuotaPrestamo.valor_cuota || 0) }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Footer con botones (fijo, pegados al fondo del modal) -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalEditarCuota = false; formEditarCuota.valor = 0; formEditarCuota.tipo_pago = 'efectivo'"
              @touchstart="modalEditarCuota = false; formEditarCuota.valor = 0; formEditarCuota.tipo_pago = 'efectivo'"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all border border-gray-200"
              style="pointer-events: auto !important; touch-action: manipulation !important; -webkit-tap-highlight-color: rgba(34, 197, 94, 0.25); min-height: 44px; z-index: 20 !important;"
              >
                Cancelar
              </button>
              <button 
              type="button"
              @click="guardarEdicionCuota"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="cuotasStore.loading || !formEditarCuota.valor || formEditarCuota.valor <= 0"
              >
                {{ cuotasStore.loading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
        </div>
    </ModalWrapper>

    <!-- Modal Editar Socio: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalEditarSocio"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto"
      @close="cerrarModalEditarSocio"
    >
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
    </ModalWrapper>

    <!-- Modal de Progreso de Actualización de Socio - DISEÑO ULTRA MODERNO -->
    <ModalWrapper
      :show="modalProgreso"
      :z-index="60"
      overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      card-class="relative w-full max-w-sm"
      card-max-width="24rem"
    >
          <div class="relative w-full">
            <!-- Tarjeta principal con efecto 3D -->
            <div class="relative bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-emerald-500/20 overflow-hidden border border-white/50">
              <!-- Gradiente superior decorativo -->
              <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 opacity-10"></div>
              
              <!-- Anillos orbitales decorativos (cuando está procesando) -->
              <div v-if="!progresoCreacion.exito && !progresoCreacion.error" class="absolute inset-0 flex items-center justify-center pointer-events-none" style="top: -20px">
                <div class="w-40 h-40 border border-emerald-200/30 rounded-full animate-orbit-slow"></div>
                <div class="absolute w-32 h-32 border border-green-200/40 rounded-full animate-orbit-reverse"></div>
              </div>

              <div class="relative p-8 pb-10">
                <!-- Icono principal con múltiples capas de animación -->
                <div class="relative mx-auto mb-8 w-28 h-28">
                  <!-- Aura exterior pulsante -->
                  <div 
                    :class="[
                      'absolute -inset-4 rounded-full transition-all duration-700',
                      progresoCreacion.exito 
                        ? 'bg-emerald-400/20 animate-pulse-success' 
                        : progresoCreacion.error && progresoCreacion.paso === 0
                          ? 'bg-red-400/20 animate-pulse'
                          : 'bg-gradient-to-r from-emerald-400/15 via-green-400/20 to-teal-400/15 animate-pulse-slow'
                    ]"
                  ></div>
                  
                  <!-- Anillo giratorio exterior -->
                  <div 
                    v-if="!progresoCreacion.exito && progresoCreacion.paso > 0"
                    class="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-300/40 animate-spin-very-slow"
                  ></div>
                  
                  <!-- Círculo principal -->
                  <div 
                    :class="[
                      'absolute inset-0 rounded-full flex items-center justify-center transition-all duration-700 transform',
                      progresoCreacion.exito 
                        ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-2xl shadow-emerald-500/50 scale-110' 
                        : progresoCreacion.error && progresoCreacion.paso === 0
                          ? 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-500 shadow-2xl shadow-red-500/40'
                          : 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-xl shadow-emerald-500/30'
                    ]"
                  >
                    <!-- Efecto de brillo interior -->
                    <div class="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                    
                    <!-- Estado: Actualizando socio -->
                    <template v-if="progresoCreacion.paso === 1">
                      <div class="relative">
                        <UserIcon class="w-12 h-12 text-white drop-shadow-lg animate-bounce-gentle" />
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <PencilIcon class="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    </template>
                    
                    <!-- Estado: Generando cuotas -->
                    <template v-else-if="progresoCreacion.paso === 2">
                      <div class="relative">
                        <SparklesIcon class="w-12 h-12 text-white drop-shadow-lg animate-sparkle" />
                        <!-- Mini estrellas que salen -->
                        <div class="absolute -top-2 -right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                        <div class="absolute -bottom-1 -left-2 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style="animation-delay: 0.3s"></div>
                      </div>
                    </template>
                    
                    <!-- Estado: Completado con éxito -->
                    <template v-else-if="progresoCreacion.paso === 3 && progresoCreacion.exito">
                      <CheckCircleIcon class="w-14 h-14 text-white drop-shadow-lg animate-success-pop" />
                    </template>
                    
                    <!-- Estado: Error -->
                    <template v-else-if="progresoCreacion.error && progresoCreacion.paso === 0">
                      <XCircleIcon class="w-14 h-14 text-white drop-shadow-lg animate-shake" />
                    </template>
                    
                    <!-- Estado: Iniciando -->
                    <template v-else>
                      <div class="relative w-12 h-12">
                        <div class="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                        <div class="absolute inset-2 border-2 border-transparent border-b-white/60 rounded-full animate-spin-reverse"></div>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Nombre del socio con tipografía elegante -->
                <h3 class="text-2xl font-display font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent text-center mb-1">
                  {{ progresoCreacion.nombreSocio }}
                </h3>

                <!-- Mensaje de progreso con animación sutil -->
                <p 
                  :class="[
                    'text-center text-base font-medium mb-6 transition-all duration-500',
                    progresoCreacion.exito ? 'text-emerald-600' : 
                    progresoCreacion.error && progresoCreacion.paso === 0 ? 'text-red-500' : 'text-gray-500'
                  ]"
                >
                  {{ progresoCreacion.mensaje }}
                </p>

                <!-- Timeline de pasos - Diseño minimalista y elegante -->
                <div class="relative mb-8">
                  <!-- Línea de conexión -->
                  <div class="absolute top-4 left-8 right-8 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700 ease-out rounded-full"
                      :style="{ width: `${((progresoCreacion.paso - 1) / 2) * 100}%` }"
                    ></div>
                  </div>
                  
                  <div class="relative flex justify-between">
                    <!-- Paso 1: Socio -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 1 
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso > 1">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <UserIcon v-else-if="progresoCreacion.paso === 1" class="w-4 h-4" />
                        <span v-else class="text-xs font-bold">1</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 1 ? 'text-emerald-600' : 'text-gray-400']">Socio</span>
                    </div>
                    
                    <!-- Paso 2: Cuotas -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 2 
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso > 2">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <SparklesIcon v-else-if="progresoCreacion.paso === 2" class="w-4 h-4 animate-pulse" />
                        <span v-else class="text-xs font-bold">2</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 2 ? 'text-emerald-600' : 'text-gray-400']">Cuotas</span>
                    </div>
                    
                    <!-- Paso 3: Listo -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 3 
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso >= 3">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <span v-else class="text-xs font-bold">3</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 3 ? 'text-emerald-600' : 'text-gray-400']">¡Listo!</span>
                    </div>
                  </div>
                </div>

                <!-- Badge de cuotas generadas - Diseño premium -->
                <Transition
                  enter-active-class="transition-all duration-500 ease-out"
                  enter-from-class="opacity-0 scale-90 translate-y-4"
                  enter-to-class="opacity-100 scale-100 translate-y-0"
                >
                  <div 
                    v-if="progresoCreacion.paso >= 2 && progresoCreacion.cuotasGeneradas > 0"
                    class="flex justify-center"
                  >
                    <div class="relative group">
                      <!-- Glow effect -->
                      <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      
                      <div class="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-2xl">
                        <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <SparklesIcon class="w-5 h-5 text-white" />
                        </div>
                        <div class="text-left">
                          <p class="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {{ progresoCreacion.cuotasGeneradas }}
                          </p>
                          <p class="text-xs text-gray-500 font-medium">cuotas generadas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- Mensaje de éxito final -->
                <Transition
                  enter-active-class="transition-all duration-700 delay-300"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                >
                  <div v-if="progresoCreacion.exito" class="mt-6 text-center">
                    <p class="text-sm text-gray-400">El modal se cerrará automáticamente...</p>
                  </div>
                </Transition>

                <!-- Mensaje de error con botón de cerrar -->
                <div v-if="progresoCreacion.error && progresoCreacion.paso === 0" class="mt-6 text-center">
                  <div class="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p class="text-sm text-red-600">{{ progresoCreacion.error }}</p>
                  </div>
                  <button 
                    @click="cerrarModalProgreso"
                    class="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <!-- Barra de progreso inferior decorativa -->
              <div class="h-1.5 bg-gray-100">
                <div 
                  v-if="progresoCreacion.paso > 0 && !progresoCreacion.error"
                  class="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 transition-all duration-700 ease-out"
                  :style="{ width: `${(progresoCreacion.paso / 3) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
    </ModalWrapper>

    <!-- Modal Detalle Socio: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalDetalleSocio"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto"
      @close="modalDetalleSocio = false"
    >
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
    </ModalWrapper>
  </div>

  <!-- Modal Selector de Mes: en iOS ModalWrapper; en Android estructura actual -->
  <ModalWrapper
    :show="!!modalSelectorMes"
    :z-index="50"
    align="bottom"
    overlay-class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
    card-class="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
    @close="modalSelectorMes = false"
  >
      <Transition name="modal-scale" appear>
        <div class="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-gray-800">Seleccionar Mes</h3>
              <button 
                @click="modalSelectorMes = false"
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon class="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="mes in mesesNatillera"
                :key="mes.value"
                @click="mesSeleccionado = mes.value; modalSelectorMes = false"
                class="p-4 rounded-xl border-2 transition-all text-center"
                :class="mesSeleccionado === mes.value 
                  ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'"
              >
                <p class="font-semibold">{{ mes.label }}</p>
              </button>
            </div>
          </div>
        </div>
      </Transition>
  </ModalWrapper>

  <!-- Modal Desglose Recaudación: en iOS ModalWrapper; en Android estructura actual -->
  <ModalWrapper
    :show="!!modalDesgloseRecaudacion"
    :z-index="50"
    align="bottom"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    card-class="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
    card-max-width="32rem"
    @close="modalDesgloseRecaudacion = false"
  >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  Desglose de Recaudación
                </h3>
                <p class="text-white/90 text-sm">
                  Por tipo de pago
                </p>
              </div>
            </div>
            <button 
              @click="modalDesgloseRecaudacion = false"
              class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="overflow-y-auto flex-1 p-6 space-y-4">
          <!-- Recaudado en Efectivo -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-gray-700 text-sm font-semibold">EFECTIVO</p>
                  <p class="text-gray-500 text-xs">Pagos realizados en efectivo</p>
                </div>
              </div>
            </div>
            <p class="text-green-700 text-2xl sm:text-3xl font-extrabold mt-3">
              ${{ formatMoney(estadisticasRecaudacion.totalRecaudadoEfectivo || 0) }}
            </p>
          </div>
          
          <!-- Recaudado en Transferencia -->
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <p class="text-gray-700 text-sm font-semibold">TRANSFERENCIA</p>
                  <p class="text-gray-500 text-xs">Pagos realizados por transferencia</p>
                </div>
              </div>
            </div>
            <p class="text-blue-700 text-2xl sm:text-3xl font-extrabold mt-3">
              ${{ formatMoney(estadisticasRecaudacion.totalRecaudadoTransferencia || 0) }}
            </p>
          </div>
          
          <!-- Total Recaudado -->
          <div class="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 rounded-xl p-5 border-2 border-purple-300 relative overflow-hidden">
            <!-- Efectos decorativos -->
            <div class="absolute top-0 right-0 w-24 h-24 bg-purple-200/30 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div class="absolute bottom-0 left-0 w-20 h-20 bg-indigo-200/30 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-gray-700 text-sm font-semibold">TOTAL RECAUDADO</p>
                    <p class="text-gray-500 text-xs">Suma de todos los pagos</p>
                  </div>
                </div>
              </div>
              <p class="text-purple-700 text-2xl sm:text-3xl font-extrabold mt-3">
                ${{ formatMoney((estadisticasRecaudacion.totalRecaudadoEfectivo || 0) + (estadisticasRecaudacion.totalRecaudadoTransferencia || 0)) }}
              </p>
              
              <!-- Porcentajes -->
              <div class="mt-4 pt-4 border-t border-purple-200 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Efectivo:</span>
                  <span class="font-semibold text-green-700">
                    {{ estadisticasRecaudacion.totalAportado > 0 ? (((estadisticasRecaudacion.totalRecaudadoEfectivo || 0) / estadisticasRecaudacion.totalAportado) * 100).toFixed(1) : 0 }}%
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Transferencia:</span>
                  <span class="font-semibold text-blue-700">
                    {{ estadisticasRecaudacion.totalAportado > 0 ? (((estadisticasRecaudacion.totalRecaudadoTransferencia || 0) / estadisticasRecaudacion.totalAportado) * 100).toFixed(1) : 0 }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <button 
            @click="modalDesgloseRecaudacion = false"
            class="w-full btn-primary bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Cerrar
          </button>
        </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { useSociosStore } from '../../stores/socios'
import { useNatillerasStore } from '../../stores/natilleras'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../lib/supabase'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
import { toPng } from 'html-to-image'
import { 
  ArrowLeftIcon,
  ArrowUpIcon,
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
  CalendarDaysIcon,
  SparklesIcon,
  XCircleIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  BuildingOffice2Icon,
  BanknotesIcon,
  CreditCardIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'
import { UserIcon as UserIconSolid } from '@heroicons/vue/24/solid'
import DatePicker from '../../components/DatePicker.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import LoadingScreenIos from '../../components/LoadingScreenIos.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import * as XLSX from 'xlsx-js-style'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useIsIos } from '../../composables/useIsIos'

const props = defineProps({
  id: String,
  mes: String // Parámetro de ruta natilleras/:id/cuotas/:mes
})

const route = useRoute()
const cuotasStore = useCuotasStore()
const sociosStore = useSociosStore()
const natillerasStore = useNatillerasStore()
const colaboradoresStore = useColaboradoresStore()
const authStore = useAuthStore()

// Verificar si el usuario es raigo.16@gmail.com
const esUsuarioAdmin = computed(() => {
  return authStore.userEmail === 'raigo.16@gmail.com'
})

const modalGenerarCuotas = ref(false)
const modalPago = ref(false)
const preparandoModalPago = ref(false) // Pantalla de carga mientras se prepara el modal de registro de pago
const modalConfirmacion = ref(false)
const cargandoComprobanteReenvio = ref(false)
const modalConfirmarBorrar = ref(false)
const modalExportar = ref(false)
const modalConfirmarPago = ref(false) // Modal de confirmación antes de registrar el pago
const desglosePagoConfirmacion = ref(null) // Desglose del pago para mostrar en confirmación
const contenidoScrollRef = ref(null) // Referencia al contenedor scrolleable del modal de pago
const mostrarIndicadorScroll = ref(false) // Indica si se debe mostrar el indicador de scroll
const modalEditarCuota = ref(false)
const modalDesgloseRecaudacion = ref(false)
const exportando = ref(false)
const cuotaSeleccionada = ref(null)
const cuotaEditando = ref(null)
const pagoRegistrado = ref(null)
const modificacionRegistrada = ref(null)
const modalModificacion = ref(false)
const comprobanteModificacionRef = ref(null)
const generandoImagenModificacion = ref(false)
const modalDetalleCuota = ref(false)
const cuotaDetalle = ref(null)
const desgloseSancionDetalle = computed(() => getDesgloseSancionCuota(cuotaDetalle.value))
// Total a pagar en detalle: cuota + todas las sanciones + todas las actividades (obligación total)
const totalAPagarDetalle = computed(() => {
  const c = cuotaDetalle.value
  if (!c) return { total: 0, cuota: 0, sanciones: 0, actividades: 0 }

  const cuota = c.valor_cuota || 0
  const sanciones = desgloseSancionDetalle.value.total || 0

  // Actividades: usar el mejor dato disponible para la obligación total
  const desgloseAct = getDesgloseActividadesCuota(c)
  const infoAct = getActividadesInfoSocio(c)
  let actividades = desgloseAct.total || 0

  // Si el desglose no trae nada, intentar con totalOriginal (monto asignado)
  if (actividades <= 0 && (infoAct.totalOriginal || 0) > 0) {
    actividades = infoAct.totalOriginal || 0
  }

  // Si aún es 0, usar pendientes + pagadas (incluye abonado en esta cuota)
  if (actividades <= 0) {
    actividades = (getActividadesPendientesSocio(c) || 0) + (infoAct.pagadas || 0)
  }

  return {
    total: cuota + sanciones + actividades,
    cuota,
    sanciones,
    actividades
  }
})
const historialPagosCuota = ref([])
const cargandoHistorialPagos = ref(false)
const modalDetalleSocio = ref(false)
const modalHistorialAjustes = ref(false)
const modalEditarSocio = ref(false)
// Guardar scroll de main y window antes de abrir modal (al hacer clic en la tarjeta)
const scrollMainAntesModal = ref(0)
const scrollWindowAntesModal = ref(0)
const modalProgreso = ref(false)
const modalSelectorMes = ref(false)
const desplegableYaAbonadoOpen = ref(false)

// Ref para bloquear el fondo cuando se está registrando un pago (declarado antes de useBodyScrollLock)
const bloqueandoRegistroPago = ref(false)

const isIos = useIsIos()

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalGenerarCuotas)
useBodyScrollLock(modalPago)
useBodyScrollLock(preparandoModalPago)
useBodyScrollLock(modalConfirmarPago)
useBodyScrollLock(modalConfirmacion)
useBodyScrollLock(cargandoComprobanteReenvio)
useBodyScrollLock(modalConfirmarBorrar)
useBodyScrollLock(modalExportar)
useBodyScrollLock(modalEditarCuota)
useBodyScrollLock(modalDesgloseRecaudacion)
useBodyScrollLock(modalDetalleCuota)
useBodyScrollLock(modalDetalleSocio)
useBodyScrollLock(modalHistorialAjustes)
useBodyScrollLock(modalEditarSocio)
useBodyScrollLock(modalProgreso)
useBodyScrollLock(modalSelectorMes)
useBodyScrollLock(modalModificacion)

// Bloquear scroll cuando se está registrando un pago
useBodyScrollLock(bloqueandoRegistroPago)

const socioSeleccionado = ref(null)
const socioEditando = ref(null)
const cuotasSocio = ref([])
const mostrarAvatares = ref(false)
const mostrarContacto = ref(false)
const errorSocio = ref('')
const estadoGuardadoSocio = ref('') // '', 'guardando', 'generando'
const natilleraNombre = ref('')

// Variables para el modal de progreso de actualización de socio
const progresoCreacion = ref({
  paso: 0, // 0: iniciando, 1: actualizando socio, 2: generando cuotas, 3: completado
  mensaje: '',
  cuotasGeneradas: 0,
  cuotasTotales: 0,
  error: null,
  exito: false,
  nombreSocio: ''
})
const comprobanteRef = ref(null)
const generandoImagen = ref(false)
const scrollComprobanteRef = ref(null)
const scrollContainerGenerarCuotas = ref(null)
const dropdownMesAbierto = ref(false)
const dropdownMesRef = ref(null)
const sancionesDinamicas = ref({}) // Sanciones calculadas dinámicamente
const sancionesActivas = ref(false) // Indica si las sanciones están activadas
const diasGracia = ref(3) // Días de gracia de la natillera
const actividadesPendientes = ref([]) // Actividades pendientes del socio
const actividadesDesplegableAbierto = ref(false) // Estado del desplegable de actividades
const cargandoActividades = ref(false) // Estado de carga de actividades
const actividadesSeleccionadas = ref(new Set()) // IDs de actividades seleccionadas
const actividadesDeLaCuotaActual = ref(new Set()) // IDs de actividades que corresponden al periodo de la cuota actual (no se pueden deseleccionar)
const actividadesPendientesPorSocio = ref({}) // Total de actividades pendientes por socio_natillera_id
const mostrandoAnimacionPago = ref(false) // Controla la animación de registro de pago
useBodyScrollLock(mostrandoAnimacionPago) // Bloquear scroll durante la animación de pago
const cuotasPrestamosPendientes = ref([]) // Cuotas de préstamos pendientes del socio
const cuotasPrestamosDesplegableAbierto = ref(false) // Estado del desplegable de cuotas de préstamos
const cargandoCuotasPrestamos = ref(false) // Estado de carga de cuotas de préstamos
const cuotasPrestamosSeleccionadas = ref(new Set()) // IDs de cuotas de préstamos seleccionadas
const cuotasPrestamosDeLaCuotaActual = ref(new Set()) // IDs de cuotas de préstamos que corresponden al periodo de la cuota actual (no se pueden deseleccionar)
const cuotasPrestamosPagadasCache = ref(new Map()) // Caché de cuotas de préstamos pagadas por cuotaId
// Caché de total cuotas de préstamos pendientes por periodo (socio_natillera_id-mes-anio-quincena) para mostrar en tarjetas
const cuotasPrestamosPendientesPorPeriodo = ref(new Map())
// Variables para el modal de editar
const actividadesPagadasEditar = ref([]) // Actividades pagadas de la cuota que se está editando
const cuotasPrestamosPagadasEditar = ref([]) // Cuotas de préstamos pagadas de la cuota que se está editando
const actividadesDesplegableAbiertoEditar = ref(false) // Estado del desplegable de actividades en modal editar
const cuotasPrestamosDesplegableAbiertoEditar = ref(false) // Estado del desplegable de cuotas de préstamos en modal editar

// Computed para hacer reactivo el estado de loading del store
const loadingPago = computed(() => cuotasStore.loading)

// Watcher para actualizar el bloqueo cuando cambie el estado de carga
watch([mostrandoAnimacionPago, loadingPago, modalPago], ([animacion, loading, modal]) => {
  bloqueandoRegistroPago.value = animacion || (loading && modal)
}, { immediate: true })

// Configuración de meses de la natillera
const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())
const mesSeleccionado = ref(null)
const inicializando = ref(true) // Flag para evitar que el watch se dispare durante la inicialización
const generandoCuotas = ref(false) // Flag para evitar ejecuciones paralelas de generación
const filtroEstado = ref('todos')
const filtroPeriodicidad = ref('todos')
const filtroTipoPago = ref('todos')
const busquedaCuotas = ref('')
const mostrarFiltros = ref(false)
const inputBusquedaRef = ref(null)
const inputValorPagoRef = ref(null)
const vistaExcel = ref(false) // false = vista tarjetas, true = vista Excel
const vistaAgrupada = ref(false) // true = vista agrupada por socio
const vistaLista = ref(false) // true = vista lista simple
// IDs de filas expandidas en la vista lista móvil (lista expandible)
const listaExpandidos = ref(new Set())
function toggleListaExpandida(cuotaId) {
  const next = new Set(listaExpandidos.value)
  if (next.has(cuotaId)) next.delete(cuotaId)
  else next.add(cuotaId)
  listaExpandidos.value = next
}
const mostrarBotonArriba = ref(false) // Botón flotante "Volver arriba"
const miRol = ref(null)
const usuarioAutenticado = ref(null)

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
  { key: 'forma_pago', label: 'Forma de pago', description: 'Efectivo o transferencia (si la cuota está pagada)' },
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
        fila['Periodicidad'] = (cuota.quincena === 1 || cuota.quincena === 2) ? `Quincena ${cuota.quincena}` : 'Mensual'
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
      
      if (columnasSeleccionadas.value.includes('forma_pago')) {
        const fp = (cuota.tipo_pago || '').toLowerCase()
        fila['Forma de pago'] = fp === 'transferencia' ? 'Transferencia' : fp === 'efectivo' ? 'Efectivo' : cuota.estado === 'pagada' ? 'Efectivo' : '—'
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
        fila['Quincena'] = cuota.quincena === 0 || cuota.quincena === null || cuota.quincena === undefined ? 'N/A' : cuota.quincena
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
      'forma_pago': 'Forma de pago',
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

// Forzar desactivar vista Excel en móvil (solo disponible en desktop)
const checkMobileView = () => {
  if (window.innerWidth < 768) { // md breakpoint de Tailwind
    if (vistaExcel.value) {
      vistaExcel.value = false
      // Si estaba en Excel, cambiar a tarjetas por defecto
      if (!vistaAgrupada.value && !vistaLista.value) {
        // Ya está en tarjetas por defecto
      }
    }
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
  scrollContainerMain = document.querySelector('main')
  if (scrollContainerMain) {
    scrollContainerMain.addEventListener('scroll', handleScrollArriba, { passive: true })
  }
  window.addEventListener('scroll', handleScrollArriba, { passive: true })
  nextTick(() => {
    handleScrollArriba()
    // Revisar de nuevo tras pintar (por si el scroll está en main y aún no ha habido evento)
    setTimeout(handleScrollArriba, 100)
  })
  // Agregar listener para el botón atrás
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView)
  if (scrollContainerMain) {
    scrollContainerMain.removeEventListener('scroll', handleScrollArriba)
  }
  window.removeEventListener('scroll', handleScrollArriba)
  document.removeEventListener('click', handleClickOutside)
  scrollContainerMain = null
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

// IDs de socios inactivos que no tienen pago completo en el mes actual (no deben mostrarse en la vista de cuotas)
const sociosInactivosSinPagoCompletoIds = computed(() => {
  const cuotas = cuotasMesActual.value
  const porSocio = {}
  cuotas.forEach(c => {
    const sid = c.socio_natillera_id
    if (!porSocio[sid]) porSocio[sid] = []
    porSocio[sid].push(c)
  })
  const ocultar = new Set()
  Object.entries(porSocio).forEach(([socioNatilleraId, cuotasSocio]) => {
    const primera = cuotasSocio[0]
    if (primera?.socio_natillera?.estado !== 'inactivo') return
    const todasPagadas = cuotasSocio.every(c => (c.valor_pagado || 0) >= (c.valor_cuota || 0))
    if (!todasPagadas) ocultar.add(socioNatilleraId)
  })
  return ocultar
})

// Cuotas filtradas por estado, periodicidad y búsqueda (para mostrar en la lista)
const cuotasFiltradas = computed(() => {
  let filtradas = cuotasMesActual.value
    .filter(c => !sociosInactivosSinPagoCompletoIds.value.has(c.socio_natillera_id))
    .map(cuota => {
    // Calcular el estado real de cada cuota según las reglas
    const estadoReal = calcularEstadoRealCuota(cuota, diasGracia.value)
    return { ...cuota, estadoReal }
  })

  // Filtro por estado (usando estadoReal)
  if (filtroEstado.value !== 'todos') {
    if (filtroEstado.value === 'pendiente') {
      // Solo mostrar cuotas con estado 'pendiente', excluir 'programada'
      filtradas = filtradas.filter(c => c.estadoReal === 'pendiente')
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

  // Filtro por tipo de pago
  if (filtroTipoPago.value !== 'todos') {
    filtradas = filtradas.filter(c => {
      const tipoPago = c.tipo_pago || 'efectivo'
      return tipoPago === filtroTipoPago.value
    })
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
    const socioNatilleraId = cuota.socio_natillera_id
    
    if (!grupos[socioId]) {
      grupos[socioId] = {
        socioId,
        socioNatilleraId, // Guardar para buscar actividades pendientes
        socio: {
          nombre: socio?.nombre || 'Socio',
          avatar_seed: socio?.avatar_seed,
          avatar_style: socio?.avatar_style,
          periodicidad: cuota.socio_natillera?.periodicidad
        },
        cuotas: [],
        total: 0,
        pagado: 0,
        pendiente: 0,
        actividadesPendientes: 0, // Total de actividades pendientes
        cuotasPrestamosPendientes: 0, // Total de cuotas de préstamos pendientes
        totalAPagar: 0 // Total a pagar (pendiente + actividades pendientes + cuotas préstamos)
      }
    }
    
    grupos[socioId].cuotas.push(cuota)
    grupos[socioId].total += cuota.valor_cuota || 0
    grupos[socioId].pagado += cuota.valor_pagado || 0
    
    // Calcular pendiente: solo incluir cuotas que NO estén en estado programada
    // Incluir cuotas pendientes, en mora o con pago parcial
    // Usar getTotalAPagar para incluir sanciones en el cálculo
    const estadoReal = cuota.estadoReal || cuota.estado
    if (estadoReal !== 'programada') {
      const pendiente = Math.max(0, getTotalAPagar(cuota))
      grupos[socioId].pendiente += pendiente
    }
  })
  
  // Agregar actividades pendientes, cuotas de préstamos pendientes y calcular total a pagar
  Object.values(grupos).forEach(grupo => {
    grupo.actividadesPendientes = grupo.cuotas.reduce((sum, cuota) => {
      return sum + (getActividadesPendientesSocio(cuota) || 0)
    }, 0)
    grupo.cuotasPrestamosPendientes = grupo.cuotas.reduce((sum, cuota) => {
      return sum + (getTotalCuotasPrestamosPendientesSocioSync(cuota) || 0)
    }, 0)
    grupo.totalAPagar = grupo.pendiente + grupo.actividadesPendientes + grupo.cuotasPrestamosPendientes
  })
  
  // Ordenar las cuotas dentro de cada grupo: quincena 1 antes que quincena 2
  Object.values(grupos).forEach(grupo => {
    grupo.cuotas.sort((a, b) => {
      // Si ambas tienen quincena (1 o 2), ordenar por quincena (1 antes que 2)
      const aTieneQuincena = a.quincena === 1 || a.quincena === 2
      const bTieneQuincena = b.quincena === 1 || b.quincena === 2
      if (aTieneQuincena && bTieneQuincena) {
        return a.quincena - b.quincena
      }
      // Si solo una tiene quincena, la que tiene quincena va primero
      if (aTieneQuincena && !bTieneQuincena) return -1
      if (!aTieneQuincena && bTieneQuincena) return 1
      // Si ninguna tiene quincena (ambas son mensuales), mantener el orden original
      return 0
    })
  })

  // Convertir a array y ordenar por nombre del socio (socios inactivos sin pago completo ya excluidos en cuotasFiltradas)
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

// Totales para la vista Lista compacta (columnas Cuota, Sanción, Actividad, Préstamo, Total)
const totalesLista = computed(() => {
  return cuotasFiltradas.value.reduce(
    (acc, c) => {
      const cuota = (c.valor_pagado || 0)
      const sancion = (c.valor_pagado_sancion || 0)
      const actividad = getActividadesInfoSocio(c).pagadas || 0
      const prestamo = getTotalCuotasPrestamosPagadasSocioSync(c) || 0
      const total = cuota + sancion + actividad + prestamo
      return {
        totalCuota: acc.totalCuota + cuota,
        totalSancion: acc.totalSancion + sancion,
        totalActividad: acc.totalActividad + actividad,
        totalPrestamo: acc.totalPrestamo + prestamo,
        totalTotal: acc.totalTotal + total
      }
    },
    { totalCuota: 0, totalSancion: 0, totalActividad: 0, totalPrestamo: 0, totalTotal: 0 }
  )
})

// Descripción corta para vista lista: "1era Diciembre", "2da Enero", "Diciembre"
function getDescripcionLista(cuota) {
  if (cuota.descripcion && !cuota.descripcion.includes('Ajuste')) return cuota.descripcion
  const mesLabel = getMesLabel(cuota.mes)
  if (cuota.quincena === 1) return `1era ${mesLabel}`
  if (cuota.quincena === 2) return `2da ${mesLabel}`
  return mesLabel
}

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
  // Incluir valor_pagado_sancion y actividades pagadas
  const totalRecaudado = cuotasConEstadoReal.reduce((sum, c) => {
    const valorCuota = c.valor_pagado || 0
    const valorSancion = c.valor_pagado_sancion || 0
    const actividadesPagadas = getActividadesInfoSocio(c).pagadas || 0
    const cuotasPrestamosPagadas = getTotalCuotasPrestamosPagadasSocioSync(c) || 0
    return sum + valorCuota + valorSancion + actividadesPagadas + cuotasPrestamosPagadas
  }, 0)
  
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

// Computed para calcular estadísticas de recaudación por tipo de pago del mes actual
const estadisticasRecaudacion = computed(() => {
  let cuotas
  if (mesSeleccionado.value) {
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
  
  // Calcular total recaudado por tipo de pago
  // Incluir valor_pagado, valor_pagado_sancion, actividades pagadas y cuotas de préstamos pagadas
  const totalRecaudadoEfectivo = cuotas
    .filter(c => (c.tipo_pago || 'efectivo') === 'efectivo')
    .reduce((sum, c) => {
      const valorCuota = c.valor_pagado || 0
      const valorSancion = c.valor_pagado_sancion || 0
      const actividadesPagadas = getActividadesInfoSocio(c).pagadas || 0
      const cuotasPrestamosPagadas = getTotalCuotasPrestamosPagadasSocioSync(c) || 0
      return sum + valorCuota + valorSancion + actividadesPagadas + cuotasPrestamosPagadas
    }, 0)
  
  const totalRecaudadoTransferencia = cuotas
    .filter(c => c.tipo_pago === 'transferencia')
    .reduce((sum, c) => {
      const valorCuota = c.valor_pagado || 0
      const valorSancion = c.valor_pagado_sancion || 0
      const actividadesPagadas = getActividadesInfoSocio(c).pagadas || 0
      const cuotasPrestamosPagadas = getTotalCuotasPrestamosPagadasSocioSync(c) || 0
      return sum + valorCuota + valorSancion + actividadesPagadas + cuotasPrestamosPagadas
    }, 0)
  
  const totalAportado = cuotas.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
  
  return {
    totalRecaudadoEfectivo,
    totalRecaudadoTransferencia,
    totalAportado
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
function scrollToTop() {
  const main = document.querySelector('main')
  if (main && main.scrollTop > 0) {
    main.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Mostrar botón flotante "Volver arriba" cuando el usuario ha hecho scroll hacia abajo
let scrollContainerMain = null
const UMBRAL_SCROLL_PX = 120

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
  const haBajado = scrollTop > UMBRAL_SCROLL_PX
  mostrarBotonArriba.value = hayScroll && haBajado
}

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

/**
 * Obtiene el período limpio para el comprobante (sin texto de ajustes).
 * Mensual: "Enero 2025"
 * Quincenal: "Enero 2025 - 1ra Quincena" o "Enero 2025 - 2da Quincena"
 */
function obtenerPeriodoComprobante(cuota) {
  if (!cuota) return 'N/A'
  const mes = cuota.mes
  const anio = cuota.anio
  const quincena = cuota.quincena
  const mesLabel = getMesLabel(mes)
  if (!mes || !anio) return 'N/A'
  if (quincena === 1 || quincena === 2) {
    return `${mesLabel} ${anio} - ${quincena === 1 ? '1ra' : '2da'} Quincena`
  }
  return `${mesLabel} ${anio}`
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
  valor: 0,
  tipo_pago: 'efectivo', // efectivo | transferencia
  /** Solo transferencia: suma 4×1000 sobre el valor neto del campo (opcional). */
  aplicaImpuesto4x1000: false,
})

const formEditarCuota = reactive({
  valor: 0,
  tipo_pago: 'efectivo',
})

// Función para formatear el valor del pago con puntos
function formatearValorPago(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

/** GMF 4×1000 sobre el monto neto (Colombia). */
function calcularImpuesto4x1000(neto) {
  const n = Math.max(0, Math.floor(Number(neto) || 0))
  if (n === 0) return 0
  return Math.round((n * 4) / 1000)
}

/** Valor guardado en historial_pagos_cuota (numeric/string/null). */
function leerImpuesto4x1000DesdeHistorial(row) {
  if (!row) return 0
  const raw = row.impuesto_4x1000 ?? row.impuesto4x1000
  if (raw == null || raw === '') return 0
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'))
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.round(n))
}

/**
 * Obligación neta total del modal (cuota + sanción + actividades + cuotas préstamo seleccionadas).
 */
function getTotalObligacionNetaPagoActual() {
  if (!cuotaSeleccionada.value) return 0
  return Math.max(0, getTotalAPagarConActividades(cuotaSeleccionada.value))
}

/** Bruto consignado en transferencia: neto del campo + 4×1000 solo si el usuario lo marca. */
function getBrutoTransferenciaParaDistribucion() {
  if ((formPago.tipo_pago || 'efectivo') !== 'transferencia') {
    return Math.max(0, Math.floor(Number(formPago.valor) || 0))
  }
  const net = Math.max(0, Math.floor(Number(formPago.valor) || 0))
  if (!formPago.aplicaImpuesto4x1000) return net
  return net + calcularImpuesto4x1000(net)
}

/** Total a cobrar mostrado en la modal (transferencia: neto ± impuesto opcional). */
function getTotalACobrarModalPago() {
  return getBrutoTransferenciaParaDistribucion()
}

/** Resumen del modal: obligación neta total (sin 4×1000 automático). */
function getTotalMostrarResumenModalPago() {
  if (!cuotaSeleccionada.value) return 0
  return Math.max(0, getTotalAPagarConActividades(cuotaSeleccionada.value))
}

/** Pendiente mostrado en modal con pago parcial. */
function getTotalPendienteMostrarModalPago() {
  if (!cuotaSeleccionada.value) return 0
  return Math.max(0, getTotalAPagarConActividades(cuotaSeleccionada.value))
}

/**
 * Transferencia: el bruto consignado cubre primero toda la obligación neta; el remanente (hasta el tope 4×1000 sobre lo aplicado a conceptos) es GMF.
 * El GMF es opcional: si el bruto = obligación neta, pago completo sin GMF.
 */
function distribuirBrutoTransferencia(bruto, obligacionNeta) {
  const B = Math.max(0, Math.floor(Number(bruto) || 0))
  const O = Math.max(0, Math.floor(Number(obligacionNeta) || 0))
  const valorAConceptos = Math.min(B, O)
  const restante = B - valorAConceptos
  const topeGmf = calcularImpuesto4x1000(valorAConceptos)
  const impuestoGmf = Math.min(Math.max(0, restante), topeGmf)
  return {
    valorAConceptos,
    impuestoGmf,
    brutoConsignado: B
  }
}

/**
 * Transferencia: si aplica 4×1000, el campo es neto a obligaciones (cuota/sanción/etc.);
 * el impuesto se suma al consignado pero no reduce el saldo de la obligación.
 */
function distribuirTransferenciaPago(obligacionNeta) {
  const O = Math.max(0, Math.floor(Number(obligacionNeta) || 0))
  const net = Math.max(0, Math.floor(Number(formPago.valor) || 0))
  if (!formPago.aplicaImpuesto4x1000) {
    return distribuirBrutoTransferencia(net, O)
  }
  const valorAConceptos = Math.min(net, O)
  const impuestoGmf = calcularImpuesto4x1000(valorAConceptos)
  return {
    valorAConceptos,
    impuestoGmf,
    brutoConsignado: valorAConceptos + impuestoGmf
  }
}

/** Valor mostrado en el input: bruto consignado en transferencia; neto en efectivo. */
function valorMostrarModalRegistroPago() {
  return formPago.valor || 0
}

// Manejar input del valor del pago
function handleValorPagoInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    formPago.valor = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      const totalActividades = getTotalActividadesSeleccionadas()
      if (formPago.tipo_pago === 'transferencia') {
        const O = getTotalObligacionNetaPagoActual()
        // Transferencia: el campo es monto neto a obligaciones; el 4×1000 es opción aparte
        formPago.valor = Math.min(numero, O)
      } else if (totalActividades > 0) {
        formPago.valor = numero
      } else {
        const maxValor = getTotalAPagar(cuotaSeleccionada.value)
        formPago.valor = Math.min(numero, maxValor)
      }
    }
  }
}

/** Al salir del campo: recalcular tope neto (transferencia). */
function handleValorPagoBlur() {
  if ((formPago.tipo_pago || 'efectivo') !== 'transferencia') return
  const O = getTotalObligacionNetaPagoActual()
  const v = Math.max(0, Math.floor(Number(formPago.valor) || 0))
  formPago.valor = Math.min(v, O)
}

/** Monto neto que se aplica a sanción/actividades/préstamos/cuota (sin GMF). En transferencia, primero se satisface la obligación; el GMF es lo último. */
function getValorPagoTotal() {
  if (!cuotaSeleccionada.value) return 0
  if (formPago.tipo_pago !== 'transferencia') {
    return formPago.valor || 0
  }
  const O = getTotalObligacionNetaPagoActual()
  return distribuirTransferenciaPago(O).valorAConceptos
}

function alCambiarTipoPagoModal(tipo) {
  const prev = formPago.tipo_pago
  if (prev === tipo) return
  if (tipo === 'efectivo' && prev === 'transferencia') {
    formPago.aplicaImpuesto4x1000 = false
  }
  if (tipo === 'transferencia' && prev === 'efectivo') {
    const O = getTotalObligacionNetaPagoActual()
    formPago.valor = O <= 0 ? 0 : Math.min(formPago.valor || 0, O)
    formPago.aplicaImpuesto4x1000 = false
  }
  formPago.tipo_pago = tipo
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

// Función auxiliar para verificar si una cuota tiene pago parcial
// Pago parcial = ha pagado algo (totalPagado > 0) Y aún hay pendiente por pagar (pendiente > 0)
// getTotalAPagarConActividadesSocio retorna el PENDIENTE (lo que falta), no la obligación total
function tienePagoParcialCuota(cuota) {
  const totalPagado = getTotalPagadoConActividadesSocio(cuota)
  const pendiente = getTotalAPagarConActividadesSocio(cuota)
  return totalPagado > 0 && pendiente > 0
}

const mesParam = computed(() => {
  const mes = route.params.mes
  return mes ? parseInt(mes, 10) : null
})

const resumen = computed(() => cuotasStore.calcularResumenCuotas())

// Verificar si el usuario es visor
const esVisor = computed(() => {
  return miRol.value === 'visor'
})

// Verificar si el usuario es admin
const esAdmin = computed(() => {
  const natillera = natillerasStore.natilleraActual
  if (!natillera || !usuarioAutenticado.value) return false
  return natillera.admin_id === usuarioAutenticado.value.id
})

// Cuando cambia el mes seleccionado (por interacción del usuario, NO durante inicialización)
// Watcher para desactivar la animación cuando se cierre el modal de pago
// Función para verificar si hay contenido scrolleable y mostrar/ocultar el indicador
function verificarScrollDisponible() {
  if (!contenidoScrollRef.value) {
    mostrarIndicadorScroll.value = false
    return
  }
  
  const elemento = contenidoScrollRef.value
  const tieneScroll = elemento.scrollHeight > elemento.clientHeight
  const estaEnTop = elemento.scrollTop < 10
  
  // Mostrar indicador solo si hay scroll disponible y no está al final
  mostrarIndicadorScroll.value = tieneScroll && elemento.scrollTop + elemento.clientHeight < elemento.scrollHeight - 10
}

// Función para manejar el scroll del modal de pago
function handleScrollModalPago() {
  verificarScrollDisponible()
}

watch(modalPago, async (isOpen) => {
  if (isOpen) {
    // Esperar un momento para que el DOM se renderice completamente
    await nextTick()
    setTimeout(() => {
      verificarScrollDisponible()
    }, 300)
  } else {
    // Si el modal se cierra, desactivar la animación y ocultar el indicador
    mostrandoAnimacionPago.value = false
    mostrarIndicadorScroll.value = false
  }
})

// Cuando termina la carga inicial, recalcular si debe mostrarse el botón "Volver arriba"
watch(inicializando, (val) => {
  if (!val) {
    nextTick(() => {
      handleScrollArriba()
      setTimeout(handleScrollArriba, 200)
    })
  }
})

// Watch para actualizar el indicador de scroll cuando cambie el contenido del modal
watch([actividadesPendientes, cuotasPrestamosPendientes, modalPago], async () => {
  if (modalPago.value) {
    await nextTick()
    setTimeout(() => {
      verificarScrollDisponible()
    }, 100)
  }
}, { deep: true })

// Watch para cargar actividades pendientes y cuotas de préstamos pendientes cuando cambien las cuotas filtradas
watch(cuotasFiltradas, async () => {
  // Cargar actividades pendientes tanto en vista agrupada como en tarjetas individuales
  await cargarActividadesPendientesPorSocio()
  // Cargar total de cuotas de préstamos pendientes por periodo para mostrar en tarjetas (programadas, pendientes, etc.)
  await cargarCuotasPrestamosPendientesParaLista()
}, { immediate: true })

// Watch para cargar actividades cuando se cambie a vista agrupada
watch(vistaAgrupada, async (nuevaVista) => {
  if (nuevaVista) {
    await cargarActividadesPendientesPorSocio()
  }
})

watch(mesSeleccionado, async (nuevoMes, mesAnterior) => {
  // Ignorar durante la inicialización para evitar múltiples cargas
  if (inicializando.value) {
    console.log('⏭️ Watch ignorado - inicialización en curso')
    return
  }
  
  if (nuevoMes && nuevoMes !== mesAnterior) {
    formCuotas.mes = nuevoMes
    filtroPeriodicidad.value = 'todos' // Resetear filtro de periodicidad
    filtroTipoPago.value = 'todos' // Resetear filtro de tipo de pago
    
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

// Función para recalcular sanciones del mes actual Y todas las cuotas en mora
async function recalcularSancionesMes() {
  // Si las sanciones no están activadas, no calcular
  if (!sancionesActivas.value) {
    // Limpiar sanciones dinámicas si están desactivadas
    sancionesDinamicas.value = {}
    return
  }
  
  // IMPORTANTE: Calcular sanciones para TODAS las cuotas en mora, no solo las del mes seleccionado
  // Esto asegura que las sanciones se muestren correctamente sin importar el mes
  const cuotasEnMora = cuotasStore.cuotas.filter(c => c.estado === 'mora')
  
  // También incluir cuotas del mes seleccionado si hay un mes seleccionado
  let cuotasACalcular = [...cuotasEnMora]
  
  if (mesSeleccionado.value) {
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
    
    // Agregar cuotas del mes que no estén ya en la lista
    cuotasDelMes.forEach(c => {
      if (!cuotasACalcular.find(ca => ca.id === c.id)) {
        cuotasACalcular.push(c)
      }
    })
  }
  
  if (cuotasACalcular.length === 0) return
  
  // Recalcular sanciones dinámicas para todas las cuotas (en mora + mes seleccionado)
  const resultSanciones = await cuotasStore.calcularSancionesTotales(id, cuotasACalcular)
  if (resultSanciones.success && resultSanciones.sanciones && Object.keys(resultSanciones.sanciones).length > 0) {
    // Reemplazar el objeto para que Vue detecte el cambio y se muestren base + intereses por día
    sancionesDinamicas.value = { ...sancionesDinamicas.value, ...resultSanciones.sanciones }
    console.log('💰 Sanciones recalculadas:', Object.keys(resultSanciones.sanciones).length, 'cuotas (base + intereses por día)')
  }
}

// Lo abonado a la cuota es simplemente valor_pagado
function getAbonadoACuota(cuota) {
  return cuota ? (cuota.valor_pagado || 0) : 0
}

// Total pagado incluyendo sanciones y actividades
function getTotalPagadoConActividadesSocio(cuota) {
  if (!cuota) return 0
  const actividadesInfo = getActividadesInfoSocio(cuota)
  return (cuota.valor_pagado || 0) + (cuota.valor_pagado_sancion || 0) + (actividadesInfo.pagadas || 0)
}

// Obtener la sanción TOTAL de una cuota (sin restar pagos)
function getSancionTotalCuota(cuota) {
  // Si las sanciones no están activadas, retornar 0
  if (!sancionesActivas.value) return 0
  if (!cuota) return 0
  
  // Si la cuota tiene marcado no_calcular_multa, retornar 0
  if (cuota.no_calcular_multa) return 0
  
  // Para cuotas en mora, usar la sanción calculada dinámicamente
  if (cuota.estado === 'mora') {
    // Si ya está calculada, usarla
    if (sancionesDinamicas.value[cuota.id]) {
      return sancionesDinamicas.value[cuota.id]
    }
    // Si no está calculada pero hay valor_multa guardado, usarlo
    if (cuota.valor_multa && cuota.valor_multa > 0) {
      return cuota.valor_multa
    }
  }
  // Para cuotas con pago parcial que tienen valor_multa guardado (sanción pendiente)
  else if (cuota.valor_multa && cuota.valor_multa > 0) {
    return cuota.valor_multa
  }
  
  return 0
}

// Obtener la sanción dinámica de una cuota (calculada en tiempo real)
// IMPORTANTE: Retorna la sanción PENDIENTE, no la sanción total
// El orden de pago es: 1. Sanción, 2. Actividades, 3. Cuota
// valor_pagado en la tabla cuotas solo refleja lo pagado de la cuota
function getSancionCuota(cuota) {
  // Si las sanciones no están activadas, retornar 0
  if (!sancionesActivas.value) return 0
  if (!cuota) return 0
  
  // Si la cuota tiene marcado no_calcular_multa, retornar 0
  if (cuota.no_calcular_multa) return 0
  
  // Obtener la sanción total (sin restar pagos)
  const sancionTotal = getSancionTotalCuota(cuota)
  
  // Si no hay sanción total, retornar 0
  if (sancionTotal <= 0) return 0

  // Si hay pagos registrados de sanción, calcular pendiente con base en eso
  const sancionPagada = parseFloat(cuota.valor_pagado_sancion) || 0
  if (sancionPagada > 0) {
    return Math.max(0, sancionTotal - sancionPagada)
  }
  
  // Calcular cuánto se pagó de sanción según el orden de pago:
  // Orden: 1. Sanción, 2. Actividades, 3. Cuota
  // IMPORTANTE: valor_pagado solo refleja lo pagado de la cuota
  const valorCuota = cuota.valor_cuota || 0
  const valorPagado = cuota.valor_pagado || 0
  
  // Obtener actividades totales asignadas y cuánto se pagó de ellas
  const actividadesInfo = getActividadesInfoSocio(cuota)
  const actividadesPagadas = actividadesInfo.pagadas
  
  // Calcular cuánto se pagó de sanción según el orden de pago:
  // El orden es: sanción -> actividades -> cuota
  // El pago total real = sancionPagada + actividadesPagadas + valorPagado (cuota)
  
  // Si hay actividades pagadas, entonces se pagó toda la sanción (porque se paga primero)
  if (actividadesPagadas > 0) {
    return 0
  }
  
  // Si valor_pagado >= valor_cuota, significa que se pagó toda la cuota
  // Esto implica que se pagó toda la sanción primero (porque se paga primero)
  if (valorPagado >= valorCuota) {
    return 0
  }
  
  // Si valor_pagado < valor_cuota y no hay actividades pagadas,
  // entonces el pago fue: primero sanción, luego cuota
  // Calcular cuánto se pagó de sanción:
  // Si valor_pagado > 0, significa que se pagó al menos parte de la cuota
  // Esto implica que se pagó toda la sanción primero (porque se paga primero)
  // Ejemplo: cuota=100, sanción=2, pago=100 -> se pagan 2 de sanción, 98 de cuota
  // En este caso, valor_pagado = 98, y se pagó toda la sanción (2)
  if (valorPagado > 0) {
    // Se pagó al menos parte de la cuota, lo que significa que se pagó toda la sanción primero
    return 0
  }
  
  // Si valor_pagado = 0, el pago fue solo a la sanción (parcial o completa)
  // Sin más información, no podemos saber cuánto se pagó exactamente
  // Por ahora, asumimos que no se pagó nada de sanción
  // (aunque podría haberse pagado parcialmente)
  return sancionTotal
}

// Función auxiliar para obtener información de actividades (total y pagadas)
// IMPORTANTE: "pagadas" usa valor_pagado_actividades de la cuota para que el monto abonado
// a actividades se muestre en la cuota donde se pagó (aunque la actividad sea de otro periodo).
function getActividadesInfoSocio(cuota) {
  if (!cuota || !cuota.id) return { total: 0, pagadas: 0 }
  
  // Prioridad: lo abonado a actividades EN ESTA CUOTA (valor_pagado_actividades en BD).
  // Así, si se paga una actividad de otro periodo en esta cuota, el monto se muestra aquí y no en la otra.
  const pagadasEnEstaCuota = (typeof cuota.valor_pagado_actividades === 'number' || cuota.valor_pagado_actividades != null)
    ? (parseFloat(cuota.valor_pagado_actividades) || 0)
    : null

  const datos = actividadesPendientesPorSocio.value[cuota.id]
  if (typeof datos === 'number') {
    return {
      total: datos,
      pagadas: pagadasEnEstaCuota !== null ? pagadasEnEstaCuota : 0,
      totalOriginal: datos
    }
  }
  
  if (!datos) {
    return {
      total: 0,
      pagadas: pagadasEnEstaCuota !== null ? pagadasEnEstaCuota : 0,
      totalOriginal: 0
    }
  }
  
  const totalPendiente = datos.total || 0
  const totalPagado = pagadasEnEstaCuota !== null ? pagadasEnEstaCuota : (datos.totalPagado || 0)
  
  // Calcular el total original sumando todos los valor_asignado de las actividades
  let totalOriginal = 0
  if (datos.actividades && Array.isArray(datos.actividades)) {
    totalOriginal = datos.actividades.reduce((sum, act) => sum + (parseFloat(act.valor_asignado) || 0), 0)
  }
  if (totalOriginal === 0 && (totalPendiente > 0 || totalPagado > 0)) {
    totalOriginal = totalPendiente + totalPagado
  }
  
  return { total: totalPendiente, pagadas: totalPagado, totalOriginal: totalOriginal }
}

// Función para obtener la sanción (pendiente o pagada) de una cuota
// Detecta cuando hay una sanción basándose en valor_multa o en el sobrepago
function getSancionCuotaDetalle(cuota) {
  if (!cuota) return 0
  
  // Si la cuota tiene marcado no_calcular_multa, retornar 0
  if (cuota.no_calcular_multa) return 0
  
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

// Función auxiliar para limpiar la descripción de actividades (quitar el mes)
function limpiarDescripcionActividad(descripcion) {
  if (!descripcion) return 'Actividad'
  // Quitar todo desde el guion hacia adelante (incluyendo el guion)
  const descripcionLimpia = descripcion.split(' - ')[0].trim()
  return descripcionLimpia || 'Actividad'
}

// Nombres del tipo de sanción configurado para mostrar en el desglose
const NOMBRES_TIPO_SANCION = {
  diaria: 'Sanción por día',
  simple: 'Sanción por mora',
  escalonada: 'Sanción escalonada'
}

// Desglose de sanciones para el modal detalle.
// Formato por línea: NombreTipoSancion (X días × valor) ValorTotal
// Segunda línea si hay intereses: Adicionales (X días × valor) ValorTotal
function getDesgloseSancionCuota(cuota) {
  if (!cuota) return { total: 0, items: [], fechaDesde: null }
  const total = getSancionCuotaDetalle(cuota)
  if (total <= 0) return { total: 0, items: [], fechaDesde: null }
  const base = parseFloat(cuota.valor_multa_base) || 0
  const intereses = parseFloat(cuota.valor_multa_intereses) || 0
  const reglas = natilleraConfigCache?.reglas_multas || {}
  const configSanciones = reglas?.sanciones || {}
  const interesesConfig = configSanciones?.interesesAdicionales || configSanciones?.intereses_adicionales || {}
  const tipo = configSanciones?.tipo || 'simple'
  const diasGraciaVal = reglas?.dias_gracia ?? diasGracia.value ?? 3
  // Fecha desde la que corre la mora (primer día en mora)
  let fechaDesde = cuota.fecha_inicio_mora ? String(cuota.fecha_inicio_mora).substring(0, 10) : null
  if (!fechaDesde && (cuota.fecha_limite || cuota.fecha_vencimiento)) {
    const fl = cuota.fecha_vencimiento || cuota.fecha_limite
    const str = String(fl).substring(0, 10)
    const [anio, mes, dia] = str.split('-').map(Number)
    if (!Number.isNaN(anio) && !Number.isNaN(mes) && !Number.isNaN(dia)) {
      const f = new Date(anio, mes - 1, dia)
      f.setDate(f.getDate() + (cuota.fecha_vencimiento ? 1 : (diasGraciaVal || 0) + 1))
      fechaDesde = f.toISOString().split('T')[0]
    }
  }
  const diasMora = getDiasMora(cuota)
  const items = []

  const nombreTipo = NOMBRES_TIPO_SANCION[tipo] || 'Sanción por mora'

  // 1) Línea principal: NombreTipoSancion (X días × valor) ValorTotal
  if (base > 0) {
    let textoDetalle = null
    if (tipo === 'diaria') {
      const valorPorDia = Number(configSanciones?.valorPorDia) || 0
      if (valorPorDia > 0) {
        const diasBase = Math.round(base / valorPorDia)
        textoDetalle = `${diasBase} ${diasBase === 1 ? 'día' : 'días'} × $${formatMoney(valorPorDia)}`
      }
    } else {
      const valorFijo = Number(configSanciones?.valorFijo) || 0
      if (diasMora > 0 && valorFijo > 0) {
        textoDetalle = `${diasMora} ${diasMora === 1 ? 'día' : 'días'} en mora`
      } else if (diasMora > 0) {
        textoDetalle = `${diasMora} ${diasMora === 1 ? 'día' : 'días'} en mora`
      }
    }
    items.push({ nombre: nombreTipo, valor: base, textoDetalle: textoDetalle || undefined })
  }

  // 2) Intereses (X per. × valor) ValorTotal
  if (intereses > 0) {
    const cadaDias = Math.max(1, Number(interesesConfig?.dias) || 2)
    const valorPorPeriodo = Number(interesesConfig?.valor) || 0
    let textoDetalle = null
    if (valorPorPeriodo > 0) {
      const periodos = Math.round(intereses / valorPorPeriodo)
      textoDetalle = `${periodos} per. × $${formatMoney(valorPorPeriodo)}`
    }
    if (!textoDetalle && diasMora > 0) {
      const valorAprox = Math.round(intereses / diasMora)
      textoDetalle = `${diasMora} ${diasMora === 1 ? 'día' : 'días'} × $${formatMoney(valorAprox)}`
    }
    items.push({ nombre: 'Adicionales', valor: intereses, textoDetalle: textoDetalle || undefined })
  }

  // Si no hay base ni intereses en BD (ej. solo valor_multa), una sola línea con el tipo configurado
  if (items.length === 0 && total > 0) {
    const valorPorDia = Number(configSanciones?.valorPorDia) || 0
    if (tipo === 'diaria' && valorPorDia > 0) {
      const diasAprox = Math.round(total / valorPorDia)
      items.push({
        nombre: nombreTipo,
        valor: total,
        textoDetalle: `${diasAprox} ${diasAprox === 1 ? 'día' : 'días'} × $${formatMoney(valorPorDia)}`
      })
    } else {
      items.push({
        nombre: nombreTipo,
        valor: total,
        textoDetalle: diasMora > 0 ? `${diasMora} ${diasMora === 1 ? 'día' : 'días'} en mora` : undefined
      })
    }
  }

  return { total, items, fechaDesde }
}

// Desglose de actividades para el modal detalle: nombre y valor por actividad
function getDesgloseActividadesCuota(cuota) {
  if (!cuota || !cuota.id) return { total: 0, items: [] }
  const datos = actividadesPendientesPorSocio.value[cuota.id]
  if (typeof datos === 'number' || !datos?.actividades?.length) {
    const total = typeof datos === 'number' ? datos : (getActividadesPendientesSocio(cuota) + (getActividadesInfoSocio(cuota).pagadas || 0))
    return { total, items: total > 0 ? [{ nombre: 'Actividades', valor: total }] : [] }
  }
  const items = datos.actividades.map(act => ({
    nombre: limpiarDescripcionActividad(act.descripcion),
    valor: (parseFloat(act.valor_pendiente) || 0) + (parseFloat(act.valor_pagado) || 0) || (parseFloat(act.valor_asignado) || 0)
  })).filter(a => a.valor > 0)
  const total = items.reduce((s, a) => s + a.valor, 0)
  return { total, items }
}

// Obtener el total de actividades pendientes de una cuota específica
function getActividadesPendientesSocio(cuota) {
  if (!cuota || !cuota.id) return 0
  // Ahora actividadesPendientesPorSocio usa cuotaId como clave
  const datos = actividadesPendientesPorSocio.value[cuota.id]
  // Compatibilidad: si es un número (estructura antigua), devolverlo
  if (typeof datos === 'number') return datos
  // Si es objeto con nueva estructura, devolver el total
  return datos?.total || 0
}

// Obtener el texto a mostrar para las actividades (nombre si es una sola, "Actividades" si son varias)
function getTextoActividadesSocio(cuota) {
  if (!cuota || !cuota.id) return 'Actividades'
  const datos = actividadesPendientesPorSocio.value[cuota.id]
  // Si es estructura antigua (número), devolver "Actividades"
  if (typeof datos === 'number') return 'Actividades'
  // Si no hay actividades, devolver "Actividades"
  if (!datos || !datos.actividades || datos.actividades.length === 0) return 'Actividades'
  // Si hay solo una actividad, devolver su descripción sin el nombre del mes
  if (datos.actividades.length === 1) {
    return limpiarDescripcionActividad(datos.actividades[0].descripcion)
  }
  // Si hay más de una, devolver "Actividades"
  return 'Actividades'
}

// Obtener el total de cuotas de préstamos pendientes para una cuota específica
// Esta función calcula el total de cuotas de préstamos pendientes del socio que corresponden al periodo de la cuota
async function getTotalCuotasPrestamosPendientesSocio(cuota) {
  if (!cuota || !cuota.socio_natillera_id) return 0
  
  try {
    // Obtener préstamos activos del socio
    const { data: prestamos, error: errorPrestamos } = await supabase
      .from('prestamos')
      .select('id, periodicidad')
      .eq('socio_natillera_id', cuota.socio_natillera_id)
      .eq('estado', 'activo')

    if (errorPrestamos || !prestamos || prestamos.length === 0) return 0

    const prestamoIds = prestamos.map(p => p.id)
    
    // Obtener cuotas de préstamos pendientes
    const { data: planPagos, error: errorPlanPagos } = await supabase
      .from('plan_pagos_prestamo')
      .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, fecha_proyectada')
      .in('prestamo_id', prestamoIds)
      .eq('pagada', false)
      .order('fecha_proyectada', { ascending: true })

    if (errorPlanPagos || !planPagos || planPagos.length === 0) return 0

    // Filtrar cuotas que corresponden al periodo de la cuota
    const mesCuota = cuota.mes
    const anioCuota = cuota.anio
    const quincenaCuota = cuota.quincena || 0
    
    const prestamosMap = new Map(prestamos.map(p => [p.id, p]))
    
    const cuotasDelPeriodo = planPagos.filter(cuotaPrestamo => {
      const prestamo = prestamosMap.get(cuotaPrestamo.prestamo_id)
      if (!prestamo) return false
      
      const fechaProyectada = new Date(cuotaPrestamo.fecha_proyectada)
      const mesProyectado = fechaProyectada.getMonth() + 1
      const anioProyectado = fechaProyectada.getFullYear()
      
      // Determinar la quincena proyectada según la periodicidad del préstamo
      let quincenaProyectada = 0
      if (prestamo.periodicidad === 'quincenal') {
        const dia = fechaProyectada.getDate()
        quincenaProyectada = dia <= 15 ? 1 : 2
      }
      
      // Verificar si corresponde al periodo de la cuota
      const correspondePeriodo = mesProyectado === mesCuota && 
                                  anioProyectado === anioCuota &&
                                  (quincenaCuota === 0 || quincenaProyectada === quincenaCuota)
      
      return correspondePeriodo
    })
    
    // Calcular el total de valores pendientes
    const total = cuotasDelPeriodo.reduce((sum, cp) => {
      const valorCuota = parseFloat(cp.valor_cuota) || 0
      const valorPagado = parseFloat(cp.valor_pagado) || 0
      const valorPendiente = Math.max(0, valorCuota - valorPagado)
      return sum + valorPendiente
    }, 0)
    
    return total
  } catch (error) {
    console.error('Error obteniendo cuotas de préstamos pendientes:', error)
    return 0
  }
}

// Versión síncrona que usa datos en caché si están disponibles
function getTotalCuotasPrestamosPendientesSocioSync(cuota) {
  if (!cuota || !cuota.socio_natillera_id) return 0
  
  // 1) Usar caché por periodo (poblado al cargar la lista de cuotas)
  const mes = cuota.mes ?? (cuota.fecha_limite ? parseInt(String(cuota.fecha_limite).split('-')[1], 10) : null)
  const anio = cuota.anio ?? (cuota.fecha_limite ? parseInt(String(cuota.fecha_limite).split('-')[0], 10) : null)
  const quincena = cuota.quincena ?? 0
  if (mes != null && anio != null) {
    const key = `${cuota.socio_natillera_id}-${mes}-${anio}-${quincena}`
    const cached = cuotasPrestamosPendientesPorPeriodo.value.get(key)
    if (cached != null && cached > 0) return cached
  }
  
  // 2) Si tenemos las cuotas de préstamos pendientes cargadas para esta cuota (modal abierto), usarlas
  if (cuotaSeleccionada.value && cuotaSeleccionada.value.id === cuota.id && cuotasPrestamosPendientes.value.length > 0) {
    const total = cuotasPrestamosPendientes.value
      .filter(cp => cp.valor_pendiente > 0)
      .reduce((sum, cp) => sum + (cp.valor_pendiente || 0), 0)
    return total
  }
  
  return 0
}

// Obtener el total de cuotas de préstamos pagadas para una cuota específica
// Similar a getActividadesInfoSocio pero para cuotas de préstamos pagadas
async function getCuotasPrestamosPagadasSocio(cuota) {
  if (!cuota || !cuota.socio_natillera_id) return 0
  
  try {
    // Obtener préstamos del socio
    const { data: prestamos, error: errorPrestamos } = await supabase
      .from('prestamos')
      .select('id')
      .eq('socio_natillera_id', cuota.socio_natillera_id)
      .in('estado', ['activo', 'pagado'])
    
    if (errorPrestamos || !prestamos || prestamos.length === 0) return 0
    
    const prestamoIds = prestamos.map(p => p.id)
    
    // Obtener cuotas de préstamos pagadas del mismo periodo que la cuota
    const mesCuota = cuota.mes
    const anioCuota = cuota.anio
    const quincenaCuota = cuota.quincena || 0
    
    // Si no tenemos mes y año, intentar obtenerlos de fecha_limite
    let mes = mesCuota
    let anio = anioCuota
    if ((mes == null || anio == null) && cuota.fecha_limite) {
      const partes = String(cuota.fecha_limite).split('-')
      if (partes.length >= 2) {
        anio = parseInt(partes[0], 10)
        mes = parseInt(partes[1], 10)
      }
    }
    
    if (mes == null || anio == null) return 0
    
    // Buscar cuotas de préstamos pagadas en el mismo periodo (y misma quincena si aplica)
    let fechaInicioPeriodo = new Date(anio, mes - 1, 1)
    let fechaFinPeriodo = new Date(anio, mes, 0, 23, 59, 59)
    // En natilleras quincenales: restringir a la quincena de la cuota para que la cuota de préstamo
    // aparezca solo en la tarjeta de la quincena donde se pagó (no en las dos)
    if (quincenaCuota === 1) {
      fechaFinPeriodo = new Date(anio, mes - 1, 15, 23, 59, 59)
    } else if (quincenaCuota === 2) {
      fechaInicioPeriodo = new Date(anio, mes - 1, 16, 0, 0, 0)
    }
    // Si quincenaCuota es 0 o null (cuota mensual), se usa todo el mes como antes
    
    // Si la cuota tiene fecha_pago, buscar cuotas pagadas en la misma fecha o muy cercana
    let cuotasPrestamosData = null
    
    if (cuota.fecha_pago) {
      const fechaPagoCuota = new Date(cuota.fecha_pago)
      fechaPagoCuota.setHours(0, 0, 0, 0)
      const fechaFinDia = new Date(fechaPagoCuota)
      fechaFinDia.setHours(23, 59, 59, 999)
      // Además, para quincenales: solo incluir si la fecha cae en la quincena de esta cuota
      const diaPago = fechaPagoCuota.getDate()
      const enQuincenaCorrecta = (quincenaCuota === 1 && diaPago <= 15) || (quincenaCuota === 2 && diaPago >= 16) || (quincenaCuota !== 1 && quincenaCuota !== 2)
      if (!enQuincenaCorrecta) {
        return 0
      }
      const { data } = await supabase
        .from('plan_pagos_prestamo')
        .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, fecha_pago')
        .in('prestamo_id', prestamoIds)
        .eq('pagada', true)
        .gte('fecha_pago', fechaPagoCuota.toISOString())
        .lte('fecha_pago', fechaFinDia.toISOString())
      
      cuotasPrestamosData = data
    } else {
      // Si no hay fecha_pago, buscar en el mismo periodo (ya acotado por quincena si es quincenal)
      const { data } = await supabase
        .from('plan_pagos_prestamo')
        .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, fecha_pago')
        .in('prestamo_id', prestamoIds)
        .eq('pagada', true)
        .gte('fecha_pago', fechaInicioPeriodo.toISOString())
        .lte('fecha_pago', fechaFinPeriodo.toISOString())
      
      cuotasPrestamosData = data
    }
    
    if (!cuotasPrestamosData || cuotasPrestamosData.length === 0) return 0
    
    // Calcular el total de valores pagados
    const total = cuotasPrestamosData.reduce((sum, cp) => {
      const valorPagado = parseFloat(cp.valor_pagado) || parseFloat(cp.valor_cuota) || 0
      return sum + valorPagado
    }, 0)
    
    return total
  } catch (error) {
    console.error('Error obteniendo cuotas de préstamos pagadas:', error)
    return 0
  }
}

// Versión síncrona que usa datos en caché si están disponibles
// Para cuotas pagadas, intenta obtener las cuotas de préstamos pagadas del mismo periodo
function getTotalCuotasPrestamosPagadasSocioSync(cuota) {
  if (!cuota || !cuota.socio_natillera_id) return 0
  
  // Si la cuota está pagada y tenemos datos en caché de reenvío de comprobante, usarlos
  // Esto funcionará cuando se reenvía el comprobante y se cargan las cuotas de préstamos pagadas
  if ((cuota.estadoReal || cuota.estado) === 'pagada' && pagoRegistrado.value && pagoRegistrado.value.cuotaId === cuota.id) {
    const valor = pagoRegistrado.value.valorCuotasPrestamosPagado || 0
    // Guardar en caché para futuras consultas
    if (valor > 0) {
      cuotasPrestamosPagadasCache.value.set(cuota.id, valor)
    }
    return valor
  }
  
  // Intentar obtener del caché
  if (cuotasPrestamosPagadasCache.value.has(cuota.id)) {
    return cuotasPrestamosPagadasCache.value.get(cuota.id)
  }
  
  // Si la cuota está pagada y no tenemos datos en caché, cargar de forma asíncrona
  if ((cuota.estadoReal || cuota.estado) === 'pagada') {
    // Cargar de forma asíncrona y guardar en caché
    getCuotasPrestamosPagadasSocio(cuota).then(total => {
      if (total > 0) {
        cuotasPrestamosPagadasCache.value.set(cuota.id, total)
      }
    }).catch(err => {
      console.error('Error cargando cuotas de préstamos pagadas:', err)
    })
  }
  
  return 0
}

// Obtener el texto a mostrar para las actividades de un grupo (nombre si todas las cuotas tienen la misma actividad única, "Actividades" si hay múltiples)
function getTextoActividadesGrupo(grupo) {
  if (!grupo || !grupo.cuotas || grupo.cuotas.length === 0) return 'Actividades'
  
  // Recopilar todas las actividades de todas las cuotas del grupo
  const todasActividades = []
  grupo.cuotas.forEach(cuota => {
    if (cuota && cuota.id) {
      const datos = actividadesPendientesPorSocio.value[cuota.id]
      if (datos && typeof datos !== 'number' && datos.actividades && datos.actividades.length > 0) {
        datos.actividades.forEach(actividad => {
          const descripcionLimpia = limpiarDescripcionActividad(actividad.descripcion)
          if (!todasActividades.find(a => a === descripcionLimpia)) {
            todasActividades.push(descripcionLimpia)
          }
        })
      }
    }
  })
  
  // Si hay solo una actividad única en todo el grupo, devolver su descripción
  if (todasActividades.length === 1) {
    return todasActividades[0]
  }
  // Si hay más de una actividad diferente, devolver "Actividades"
  return 'Actividades'
}

// Obtener el total a pagar incluyendo actividades pendientes y cuotas de préstamos pendientes
function getTotalAPagarConActividadesSocio(cuota) {
  if (!cuota) return 0
  const totalCuota = getTotalAPagar(cuota)
  const actividadesPendientes = getActividadesPendientesSocio(cuota)
  const cuotasPrestamosPendientes = getTotalCuotasPrestamosPendientesSocioSync(cuota)
  return totalCuota + actividadesPendientes + cuotasPrestamosPendientes
}

// Calcular días en mora desde la fecha de vencimiento (primer día en mora = día siguiente al vencimiento)
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
  const enMora = cuota?.estado === 'mora' || cuota?.estadoReal === 'mora'
  if (!cuota || !enMora) return 0
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // Usar fecha_vencimiento como referencia: los días en mora se cuentan desde el vencimiento
  // (el primer día en mora es el día siguiente al vencimiento)
  const fechaReferencia = cuota.fecha_vencimiento || cuota.fecha_limite
  if (!fechaReferencia) return 0
  
  let fechaVencimiento
  if (typeof fechaReferencia === 'string') {
    const [anio, mes, dia] = fechaReferencia.split('-').map(Number)
    fechaVencimiento = new Date(anio, mes - 1, dia)
  } else {
    fechaVencimiento = new Date(fechaReferencia)
  }
  fechaVencimiento.setHours(0, 0, 0, 0)
  
  const diasMora = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24))
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

function guardarScrollMain() {
  const main = document.querySelector('main')
  const mainScroll = main ? main.scrollTop : 0
  const windowScroll = typeof window !== 'undefined' ? (window.scrollY || document.documentElement.scrollTop) : 0
  scrollMainAntesModal.value = mainScroll
  scrollWindowAntesModal.value = windowScroll
  // Para que useBodyScrollLock use esta posición al bloquear (evita que el scroll salte al abrir la modal)
  if (typeof window !== 'undefined') {
    window.__scrollPositionBeforeModal = { main: mainScroll, window: windowScroll }
  }
}

/** Reasignar la posición guardada justo antes de abrir la modal (el lock la usa al aplicar) */
function asignarScrollAntesDeAbrirModal() {
  if (typeof window !== 'undefined') {
    window.__scrollPositionBeforeModal = { main: scrollMainAntesModal.value, window: scrollWindowAntesModal.value }
  }
}

function restaurarScrollMain() {
  nextTick(() => {
    const main = document.querySelector('main')
    if (main && scrollMainAntesModal.value > 0) main.scrollTop = scrollMainAntesModal.value
  })
}

async function abrirModalDetalleCuota(cuota) {
  guardarScrollMain() // guardar scroll al instante del clic (antes de cualquier await)
  // Asegurar que tengamos reglas de la natillera para el desglose de sanciones en el modal
  if (!natilleraConfigCache) await cargarNatillera()
  // Asegurar estadoReal para mostrar correctamente cuando cuota pagada tras pago parcial
  const estadoReal = cuota?.estadoReal ?? calcularEstadoRealCuota(cuota, diasGracia.value)
  cuotaDetalle.value = { ...cuota, estadoReal }
  asignarScrollAntesDeAbrirModal() // que el lock use la posición guardada al hacer clic
  modalDetalleCuota.value = true
  // Forzar que main no pierda la posición (p. ej. iOS donde no se usa position:fixed en main)
  nextTick(() => {
    requestAnimationFrame(() => {
      const main = document.querySelector('main')
      if (main && scrollMainAntesModal.value > 0) main.scrollTop = scrollMainAntesModal.value
    })
  })
  // Cargar historial de pagos si la cuota tiene pagos
  if (cuota && (cuota.valor_pagado > 0 || cuota.codigo_comprobante)) {
    await cargarHistorialPagosCuota(cuota.id)
  } else {
    historialPagosCuota.value = []
  }
}

function cerrarModalDetalleCuota() {
  modalDetalleCuota.value = false
  restaurarScrollMain()
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
        motivo: 'pago_registrado',
        forma_pago: cuotaDetalle.value.tipo_pago || 'efectivo'
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
            valor_nuevo: registro.valor_pagado_nuevo,
            forma_pago: registro.forma_pago || null
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

// Función helper para normalizar quincena (0, null, undefined se consideran equivalentes para mensual)
function normalizarQuincena(quincena) {
  if (quincena === null || quincena === undefined || quincena === 0) {
    return 0
  }
  return quincena
}

// Función helper para determinar si una actividad debe mostrarse para una cuota específica
function actividadCorrespondeACuota(actividadSocio, cuota, actividad = null) {
  // PRIORIDAD 1: Usar los campos mes_pago, anio_pago, quincena_pago que se guardan al crear la actividad
  if (actividadSocio.mes_pago && actividadSocio.anio_pago) {
    const mesActividad = actividadSocio.mes_pago
    const anioActividad = actividadSocio.anio_pago
    let quincenaActividad = actividadSocio.quincena_pago ?? null

    // Verificar que el mes y año coincidan exactamente
    if (mesActividad !== cuota.mes || anioActividad !== cuota.anio) {
      return false
    }

    // Obtener la periodicidad del socio
    // IMPORTANTE: Si no está disponible en socio_natillera, inferirla de la quincena de la cuota
    let periodicidadSocio = cuota.socio_natillera?.periodicidad
    if (!periodicidadSocio) {
      // Fallback: inferir de la quincena de la cuota
      periodicidadSocio = (cuota.quincena === 0 || cuota.quincena === null || cuota.quincena === undefined) ? 'mensual' : 'quincenal'
    }
    
    // Normalizar quincena de la cuota según periodicidad
    // Para mensuales: normalizar (0, null, undefined → 0)
    // Para quincenales: mantener el valor exacto (1 o 2)
    const quincenaCuota = periodicidadSocio === 'mensual' 
      ? normalizarQuincena(cuota.quincena)
      : (cuota.quincena === 1 || cuota.quincena === 2 ? cuota.quincena : null)

    // Si el socio es mensual
    if (periodicidadSocio === 'mensual') {
      // Los socios mensuales solo tienen UNA cuota en el mes (quincena = 0)
      // Normalizar quincena de la actividad: si es 2 o null, tratarla como 0 (mensual)
      // También aceptar si la actividad tiene quincena_pago = 0 explícitamente
      if (quincenaActividad === 2 || quincenaActividad === null || quincenaActividad === undefined || quincenaActividad === 0) {
        quincenaActividad = 0
      }
      // La cuota mensual debe tener quincena 0 (normalizada) y la actividad también
      return quincenaCuota === 0 && quincenaActividad === 0
    }

    // Si el socio es quincenal
    if (periodicidadSocio === 'quincenal') {
      // Para quincenales: la quincena debe ser EXACTAMENTE 1 o 2
      // No normalizar null/undefined a 0, deben ser valores explícitos
      if (quincenaActividad === null || quincenaActividad === undefined || quincenaActividad === 0) {
        // Actividad sin quincena definida o mensual, no corresponde a cuota quincenal
        return false
      }
      // Solo aceptar quincena 1 o 2
      if (quincenaActividad !== 1 && quincenaActividad !== 2) {
        return false
      }
      // La quincena de la cuota también debe ser 1 o 2 (no normalizar)
      const quincenaCuotaExacta = cuota.quincena === 1 || cuota.quincena === 2 ? cuota.quincena : null
      if (quincenaCuotaExacta === null) {
        return false
      }
      // Comparar exactamente
      return quincenaActividad === quincenaCuotaExacta
    }

    return false
  }

  // PRIORIDAD 2: Si no tiene mes_pago/anio_pago, intentar calcular desde fecha_limite_pago (compatibilidad con datos antiguos)
  const fechaLimite = actividadSocio.fecha_limite_pago || actividad?.fecha_limite_pago
  
  if (!fechaLimite) {
    return false // No se puede determinar el período
  }

  try {
    // Parsear la fecha correctamente
    let fecha
    if (typeof fechaLimite === 'string') {
      const [anio, mes, dia] = fechaLimite.split('-').map(Number)
      fecha = new Date(anio, mes - 1, dia)
    } else {
      fecha = new Date(fechaLimite)
    }
    
    const mesActividad = fecha.getMonth() + 1
    const anioActividad = fecha.getFullYear()
    
    // Verificar que el mes y año coincidan
    if (mesActividad !== cuota.mes || anioActividad !== cuota.anio) {
      return false
    }

    // Determinar quincena basándose en el día del mes
    const dia = fecha.getDate()
    const periodicidadSocio = cuota.socio_natillera?.periodicidad || 'mensual'
    
    if (periodicidadSocio === 'quincenal') {
      const quincenaActividad = dia <= 15 ? 1 : 2
      return quincenaActividad === cuota.quincena
    } else {
      // Si es mensual, la cuota debe tener quincena 0 o null
      return cuota.quincena === 0 || cuota.quincena === null
    }
  } catch (e) {
    console.error('❌ Error parseando fecha_limite_pago:', e)
    return false
  }
}

// Función para cargar actividades pendientes de todos los socios
async function cargarActividadesPendientesPorSocio() {
  try {
    // Obtener todos los socio_natillera_id únicos de las cuotas filtradas
    const socioNatilleraIds = [...new Set(
      cuotasFiltradas.value
        .map(c => c.socio_natillera_id)
        .filter(id => id)
    )]

    if (socioNatilleraIds.length === 0) {
      actividadesPendientesPorSocio.value = {}
      return
    }

    // Obtener el mes y año actual que se está visualizando
    const mesActual = mesSeleccionado.value
    const anioActual = anioMesSeleccionado.value

    // Construir consultas para filtrar por periodo actual
    // Hacemos dos consultas: una para actividades con mes_pago/anio_pago y otra para compatibilidad
    let sociosActividadData = []
    
    if (mesActual && anioActual) {
      // Consulta 1: Actividades con mes_pago y anio_pago que coinciden con el periodo actual (pendientes y pagadas)
      const { data: actividadesConPeriodo, error: error1 } = await supabase
        .from('socios_actividad')
        .select('*')
        .in('socio_natillera_id', socioNatilleraIds)
        .in('estado', ['pendiente', 'parcial', 'mora', 'pagada', 'pagado'])
        .eq('mes_pago', mesActual)
        .eq('anio_pago', anioActual)

      if (error1) {
        console.error('❌ Error cargando actividades con periodo:', error1)
      } else if (actividadesConPeriodo) {
        sociosActividadData.push(...actividadesConPeriodo)
      }

      // Consulta 2: Actividades sin mes_pago/anio_pago (datos antiguos - compatibilidad)
      const { data: actividadesSinPeriodo, error: error2 } = await supabase
        .from('socios_actividad')
        .select('*')
        .in('socio_natillera_id', socioNatilleraIds)
        .in('estado', ['pendiente', 'parcial', 'mora', 'pagada', 'pagado'])
        .or('mes_pago.is.null,anio_pago.is.null')

      if (error2) {
        console.error('❌ Error cargando actividades sin periodo:', error2)
      } else if (actividadesSinPeriodo) {
        sociosActividadData.push(...actividadesSinPeriodo)
      }
    } else {
      // Si no hay mes seleccionado, cargar todas las actividades (pendientes y pagadas)
      const { data: todasActividades, error: errorSociosActividad } = await supabase
        .from('socios_actividad')
        .select('*')
        .in('socio_natillera_id', socioNatilleraIds)
        .in('estado', ['pendiente', 'parcial', 'mora', 'pagada', 'pagado'])

      if (errorSociosActividad) {
        console.error('❌ Error cargando actividades pendientes por socio:', errorSociosActividad)
        actividadesPendientesPorSocio.value = {}
        return
      }
      
      sociosActividadData = todasActividades || []
    }

    if (!sociosActividadData || sociosActividadData.length === 0) {
      actividadesPendientesPorSocio.value = {}
      return
    }

    // Obtener los IDs de las actividades
    const actividadIds = [...new Set(sociosActividadData.map(sa => sa.actividad_id))]

    // Obtener las actividades correspondientes
    const { data: actividadesData, error: errorActividades } = await supabase
      .from('actividades')
      .select('id, tipo, descripcion, fecha_limite_pago, estado')
      .in('id', actividadIds)

    if (errorActividades) {
      console.error('❌ Error cargando actividades:', errorActividades)
      return
    }

    // Crear un mapa de actividades por ID
    const actividadesMap = new Map((actividadesData || []).map(a => [a.id, a]))

    // Calcular total por CUOTA específica (no por socio)
    // Estructura: { cuotaId: { total: number, actividades: [{ descripcion, valor_pendiente }] } }
    const totalesPorCuota = {}
    
    console.log('🔍 Cargando actividades pendientes por cuota...')
    console.log('📊 Actividades encontradas en socios_actividad:', sociosActividadData.length)
    console.log('📊 Cuotas filtradas:', cuotasFiltradas.value.length)
    console.log('📅 Periodo actual:', { mes: mesActual, anio: anioActual })
    
    // Inicializar todas las cuotas con estructura vacía (total = pendiente, totalPagado = actividades ya pagadas)
    cuotasFiltradas.value.forEach(cuota => {
      if (!cuota.socio_natillera_id || !cuota.id) return
      totalesPorCuota[cuota.id] = { total: 0, totalPagado: 0, actividades: [] }
    })
    
    // Iterar sobre las actividades y asignarlas a las cuotas según quincena_pago
    let actividadesProcesadas = 0
    let actividadesAsignadas = 0
    
    sociosActividadData.forEach(sa => {
      const actividad = actividadesMap.get(sa.actividad_id)
      
      // Verificar que la actividad exista
      if (!actividad) {
        console.log('⚠️ Actividad no encontrada para socios_actividad:', sa.id, 'actividad_id:', sa.actividad_id)
        return
      }
      
      // Solo procesar actividades en curso (o ya pagadas, para mostrar en desglose; BD usa 'pagado')
      if (actividad.estado && actividad.estado !== 'en_curso' && sa.estado !== 'pagada' && sa.estado !== 'pagado') {
        console.log('⚠️ Actividad no está en curso:', actividad.id, 'estado:', actividad.estado)
        return
      }
      
      actividadesProcesadas++
      
      // Verificar que tenga mes_pago y anio_pago (periodo actual)
      if (!sa.mes_pago || !sa.anio_pago) {
        console.log('⚠️ Actividad sin periodo:', sa.id, 'mes_pago:', sa.mes_pago, 'anio_pago:', sa.anio_pago)
        return
      }
      
      // Verificar que coincida con el periodo actual
      if (mesActual && anioActual) {
        // Si hay mes y año seleccionados, verificar que coincidan
        if (sa.mes_pago !== mesActual || sa.anio_pago !== anioActual) {
          console.log('⚠️ Actividad no coincide con periodo actual:', {
            actividad: { mes: sa.mes_pago, anio: sa.anio_pago },
            periodo: { mes: mesActual, anio: anioActual }
          })
          return
        }
      }
      
      // Calcular el valor pendiente y pagado de la actividad
      const valorAsignado = parseFloat(sa.valor_asignado || 0)
      const valorPagado = parseFloat(sa.valor_pagado || 0)
      const valorPendiente = Math.max(0, valorAsignado - valorPagado)
      
      // Obtener la quincena_pago de la actividad (puede ser 0, 1, 2 o null)
      // IMPORTANTE: Normalizar quincena_pago - si es 2 pero el socio es mensual, debería ser 0
      let quincenaPago = sa.quincena_pago ?? null
      
      // Verificar si el socio es mensual y corregir quincena_pago si es necesario
      // Si quincena_pago es 2 pero debería ser 0 para socios mensuales, corregirlo
      if (quincenaPago === 2 || quincenaPago === 1) {
        // Verificar si la cuota correspondiente es mensual (quincena 0 o null)
        const cuotaMensual = cuotasFiltradas.value.find(cuota => 
          cuota.socio_natillera_id === sa.socio_natillera_id &&
          cuota.mes === sa.mes_pago &&
          cuota.anio === sa.anio_pago &&
          (cuota.quincena === null || cuota.quincena === 0)
        )
        
        // Si existe una cuota mensual, la actividad debería tener quincena_pago = 0
        // Esto aplica tanto si la natillera es mensual como si es quincenal pero el socio es mensual
        if (cuotaMensual) {
          console.log('⚠️ Corrigiendo quincena_pago de', quincenaPago, 'a 0 para actividad de socio mensual:', sa.id)
          quincenaPago = 0
        }
      }
      
      console.log('🔍 Buscando cuota para actividad:', {
        socio_natillera_id: sa.socio_natillera_id,
        mes_pago: sa.mes_pago,
        anio_pago: sa.anio_pago,
        quincena_pago_original: sa.quincena_pago,
        quincena_pago_corregida: quincenaPago,
        valor_pendiente: valorPendiente
      })
      
      // Buscar la cuota correspondiente según quincena_pago
      // Regla: la actividad va SOLO en una quincena. Si la cuota de esa quincena ya está pagada y la actividad sigue sin pagar, se muestra en la siguiente quincena.
      let cuotaCorrespondiente = cuotasFiltradas.value.find(cuota => {
        if (cuota.socio_natillera_id !== sa.socio_natillera_id) return false
        if (cuota.mes !== sa.mes_pago || cuota.anio !== sa.anio_pago) return false
        if (quincenaPago === null || quincenaPago === 0) {
          return cuota.quincena === null || cuota.quincena === 0
        }
        if (quincenaPago === 1) return cuota.quincena === 1
        if (quincenaPago === 2) return cuota.quincena === 2
        return false
      })

      // Si la actividad es de Q1, está sin pagar y la cuota Q1 ya está pagada → mostrarla en Q2 (se mueve a la siguiente quincena)
      if (cuotaCorrespondiente && quincenaPago === 1 && valorPendiente > 0) {
        const cuotaQ1 = cuotaCorrespondiente
        const q1Pagada = cuotaQ1.estado === 'pagada' || (parseFloat(cuotaQ1.valor_pagado || 0) >= parseFloat(cuotaQ1.valor_cuota || 0))
        if (q1Pagada) {
          const cuotaQ2 = cuotasFiltradas.value.find(cuota =>
            cuota.socio_natillera_id === sa.socio_natillera_id &&
            cuota.mes === sa.mes_pago &&
            cuota.anio === sa.anio_pago &&
            cuota.quincena === 2
          )
          if (cuotaQ2) cuotaCorrespondiente = cuotaQ2
        }
      }
      
      // Si se encontró la cuota correspondiente, agregar pendiente/pagado y detalles (solo en esa cuota)
      if (cuotaCorrespondiente && cuotaCorrespondiente.id) {
        const cuotaId = cuotaCorrespondiente.id
        if (!totalesPorCuota[cuotaId]) {
          totalesPorCuota[cuotaId] = { total: 0, totalPagado: 0, actividades: [] }
        }
        totalesPorCuota[cuotaId].total += valorPendiente
        totalesPorCuota[cuotaId].totalPagado += valorPagado
        totalesPorCuota[cuotaId].actividades.push({
          descripcion: actividad.descripcion || 'Actividad',
          valor_pendiente: valorPendiente,
          valor_pagado: valorPagado,
          valor_asignado: valorAsignado
        })
        actividadesAsignadas++
        if (valorPendiente > 0) {
          console.log('✅ Actividad asignada a cuota:', {
            actividad_id: sa.id,
            cuota_id: cuotaId,
            valor_pendiente: valorPendiente,
            total_cuota: totalesPorCuota[cuotaId].total,
            descripcion: actividad.descripcion
          })
        } else if (valorPagado > 0) {
          console.log('✅ Actividad pagada asignada a cuota (desglose):', {
            actividad_id: sa.id,
            cuota_id: cuotaId,
            valor_pagado: valorPagado,
            descripcion: actividad.descripcion
          })
        }
      } else {
        console.log('❌ No se encontró cuota correspondiente para actividad:', {
          socio_natillera_id: sa.socio_natillera_id,
          mes_pago: sa.mes_pago,
          anio_pago: sa.anio_pago,
          quincena_pago: quincenaPago,
          cuotas_disponibles: cuotasFiltradas.value
            .filter(c => c.socio_natillera_id === sa.socio_natillera_id)
            .map(c => ({ id: c.id, mes: c.mes, anio: c.anio, quincena: c.quincena }))
        })
      }
    })

    console.log('📊 Resumen:', {
      actividades_procesadas: actividadesProcesadas,
      actividades_asignadas: actividadesAsignadas,
      totales_por_cuota: totalesPorCuota
    })

    // Cambiar la estructura para usar cuotaId como clave
    actividadesPendientesPorSocio.value = totalesPorCuota
  } catch (e) {
    console.error('❌ Error cargando actividades pendientes por socio:', e)
    actividadesPendientesPorSocio.value = {}
  }
}

async function cargarActividadesPendientes(cuota) {
  if (!cuota || !cuota.socio_natillera_id) {
    console.log('❌ cargarActividadesPendientes: No hay cuota o socio_natillera_id')
    actividadesPendientes.value = []
    return false
  }

  console.log('🔍 cargarActividadesPendientes: socio_natillera_id =', cuota.socio_natillera_id, 'cuota:', { mes: cuota.mes, anio: cuota.anio, quincena: cuota.quincena })
  cargandoActividades.value = true
  try {
    // Obtener actividades pendientes del socio
    // Filtrar por socio_natillera_id y estados pendientes (pendiente, parcial, mora)
    const { data: sociosActividadData, error: errorSociosActividad } = await supabase
      .from('socios_actividad')
      .select('*')
      .eq('socio_natillera_id', cuota.socio_natillera_id)
      .in('estado', ['pendiente', 'parcial', 'mora'])
      .order('created_at', { ascending: false })

    if (errorSociosActividad) {
      console.error('❌ Error en consulta socios_actividad:', errorSociosActividad)
      throw errorSociosActividad
    }

    console.log('📊 Resultado de consulta socios_actividad:', sociosActividadData)
    console.log('📊 Cantidad de registros encontrados:', sociosActividadData?.length || 0)

    if (!sociosActividadData || sociosActividadData.length === 0) {
      actividadesPendientes.value = []
      return
    }

    // Obtener el periodo actual de la cuota (mes y año)
    const mesActual = cuota.mes
    const anioActual = cuota.anio

    // Filtrar actividades donde mes_pago <= periodo actual
    // Solo incluir actividades que tengan mes_pago y anio_pago definidos
    const actividadesConPeriodo = sociosActividadData.filter(sa => {
      if (!sa.mes_pago || !sa.anio_pago) {
        // Si no tiene mes_pago/anio_pago, excluir (solo mostrar actividades con periodo definido)
        return false
      }
      
      // Comparar periodo: mes_pago <= periodo actual
      // Si el año es menor, siempre incluir
      if (sa.anio_pago < anioActual) {
        return true
      }
      // Si el año es igual, verificar que el mes sea menor o igual
      if (sa.anio_pago === anioActual) {
        return sa.mes_pago <= mesActual
      }
      // Si el año es mayor, excluir
      return false
    })

    console.log('📊 Actividades con periodo <= periodo actual:', actividadesConPeriodo.length)

    if (actividadesConPeriodo.length === 0) {
      actividadesPendientes.value = []
      return
    }

    // Obtener los IDs de las actividades
    const actividadIds = [...new Set(actividadesConPeriodo.map(sa => sa.actividad_id))]

    // Obtener las actividades correspondientes
    // Nota: La tabla actividades no tiene columna 'nombre', usa 'descripcion' y 'tipo'
    const { data: actividadesData, error: errorActividades } = await supabase
      .from('actividades')
      .select('id, tipo, descripcion, fecha_limite_pago, estado')
      .in('id', actividadIds)

    if (errorActividades) {
      console.error('❌ Error en consulta actividades:', errorActividades)
      throw errorActividades
    }

    // Crear un mapa de actividades por ID para acceso rápido
    const actividadesMap = new Map((actividadesData || []).map(a => [a.id, a]))

    // Combinar datos y calcular valor pendiente
    // Mostrar actividades que no se hayan pagado completamente, incluso si están liquidadas
    const actividadesConValorPendiente = actividadesConPeriodo
      .map(sa => {
        const actividad = actividadesMap.get(sa.actividad_id)
        if (!actividad) {
          console.log('⚠️ Registro sin actividad relacionada:', sa.id)
          return null
        }
        
        // Calcular el valor pendiente
        const valorAsignado = parseFloat(sa.valor_asignado || 0)
        const valorPagado = parseFloat(sa.valor_pagado || 0)
        const valorPendiente = Math.max(0, valorAsignado - valorPagado)
        
        return {
          ...sa,
          actividad,
          valor_pendiente: valorPendiente
        }
      })
      .filter(sa => {
        // Filtrar solo actividades con valor pendiente > 0
        // No importa si la actividad está liquidada o en curso
        return sa !== null && sa.valor_pendiente > 0
      })

    console.log('📊 Actividades filtradas (con valor pendiente y periodo <= periodo actual):', actividadesConValorPendiente.length)

    // Asignar las actividades pendientes
    actividadesPendientes.value = actividadesConValorPendiente

    console.log('✅ Actividades pendientes finales:', actividadesPendientes.value.length)
    if (actividadesPendientes.value.length > 0) {
      console.log('📋 Actividades pendientes (incluye liquidadas con deuda):', actividadesPendientes.value.map(a => ({
        descripcion: a.actividad?.descripcion,
        tipo: a.actividad?.tipo,
        estado_actividad: a.actividad?.estado,
        valor_asignado: a.valor_asignado,
        valor_pagado: a.valor_pagado,
        valor_pendiente: a.valor_pendiente,
        mes_pago: a.mes_pago,
        anio_pago: a.anio_pago,
        quincena_pago: a.quincena_pago,
        estado: a.estado
      })))
    }

    // Obtener la periodicidad del socio para normalización
    // IMPORTANTE: Si no está disponible en socio_natillera, inferirla de la quincena de la cuota
    let periodicidadSocio = cuota.socio_natillera?.periodicidad
    if (!periodicidadSocio) {
      // Fallback: inferir de la quincena de la cuota
      periodicidadSocio = (cuota.quincena === 0 || cuota.quincena === null || cuota.quincena === undefined) ? 'mensual' : 'quincenal'
      console.log('⚠️ Periodicidad no encontrada en socio_natillera, inferida de quincena:', {
        quincena: cuota.quincena,
        periodicidadInferida: periodicidadSocio
      })
    }
    
    // Para mensuales: normalizar (0, null, undefined → 0)
    // Para quincenales: mantener el valor exacto (1 o 2, no normalizar)
    const quincenaCuota = periodicidadSocio === 'mensual' 
      ? normalizarQuincena(cuota.quincena)
      : (cuota.quincena === 1 || cuota.quincena === 2 ? cuota.quincena : null)
    
    // Buscar TODAS las actividades que coincidan con el mes, año y quincena de la cuota
    // Optimizar la búsqueda filtrando primero por periodo exacto
    let actividadesCoincidentes = []
    
    // Primero intentar encontrar actividades del periodo EXACTO (mes y año coinciden)
    const actividadesPeriodoExacto = actividadesPendientes.value.filter(actividad => {
      return actividad.mes_pago === cuota.mes && actividad.anio_pago === cuota.anio
    })
    
    console.log('🔍 Buscando actividades coincidentes:', {
      cuota: { 
        mes: cuota.mes, 
        anio: cuota.anio, 
        quincena: cuota.quincena, 
        quincenaNormalizada: quincenaCuota 
      },
      periodicidadSocio,
      periodicidadDesdeSocio: cuota.socio_natillera?.periodicidad,
      socio_natillera_id: cuota.socio_natillera_id,
      actividadesPeriodoExacto: actividadesPeriodoExacto.length,
      totalActividades: actividadesPendientes.value.length,
      actividadesPeriodoExactoDetalle: actividadesPeriodoExacto.map(a => ({
        id: a.id,
        quincena_pago: a.quincena_pago,
        mes_pago: a.mes_pago,
        anio_pago: a.anio_pago
      }))
    })
    
    // Buscar en las actividades del periodo exacto (todas las que coincidan en mes, año y quincena)
    for (const actividad of actividadesPeriodoExacto) {
      let quincenaActividad = actividad.quincena_pago ?? null
      
      // Normalizar quincena según periodicidad del socio
      if (periodicidadSocio === 'mensual') {
        // Para socios mensuales: 0, null, undefined, 2 se consideran mensuales (quincena 0)
        if (quincenaActividad === 2 || quincenaActividad === null || quincenaActividad === undefined || quincenaActividad === 0) {
          quincenaActividad = 0
        }
        // Si la actividad tiene quincena 1, no corresponde a una cuota mensual
        if (quincenaActividad === 1) {
          continue
        }
      } else {
        // Para socios quincenales: la quincena debe ser EXACTAMENTE 1 o 2
        // No normalizar null/undefined a 0, deben ser valores explícitos
        if (quincenaActividad === null || quincenaActividad === undefined || quincenaActividad === 0) {
          // Actividad sin quincena definida o mensual, no corresponde a cuota quincenal
          continue
        }
        // Solo aceptar quincena 1 o 2
        if (quincenaActividad !== 1 && quincenaActividad !== 2) {
          continue
        }
      }
      
      // Comparar quincenas
      // Para mensuales: ambas deben ser 0 (normalizadas)
      // Para quincenales: deben coincidir exactamente (1 === 1 o 2 === 2)
      console.log('🔍 Comparando quincenas:', {
        actividad_id: actividad.id,
        quincena_actividad_original: actividad.quincena_pago,
        quincena_actividad_normalizada: quincenaActividad,
        quincena_cuota_original: cuota.quincena,
        quincena_cuota_normalizada: quincenaCuota,
        periodicidadSocio,
        coincide: quincenaCuota === quincenaActividad
      })
      
      if (quincenaCuota === quincenaActividad) {
        actividadesCoincidentes.push(actividad)
      } else {
        console.log('❌ Quincenas no coinciden:', {
          quincena_cuota: quincenaCuota,
          quincena_actividad: quincenaActividad
        })
      }
    }
    if (actividadesCoincidentes.length > 0) {
      console.log('✅ Actividades encontradas por búsqueda optimizada:', actividadesCoincidentes.map(a => ({
        id: a.id,
        descripcion: a.actividad?.descripcion,
        quincena_actividad: a.quincena_pago,
        quincena_cuota: cuota.quincena,
        periodicidadSocio
      })))
    }

    // Si no hay coincidencia y la cuota es Q2: considerar actividades "movidas" (programadas en Q1, no pagadas, y cuota Q1 ya pagada)
    if (actividadesCoincidentes.length === 0 && periodicidadSocio === 'quincenal' && cuota.quincena === 2) {
      const cuotaQ1 = cuotasFiltradas.value.find(c =>
        c.socio_natillera_id === cuota.socio_natillera_id &&
        c.mes === cuota.mes &&
        c.anio === cuota.anio &&
        c.quincena === 1
      )
      const q1Pagada = cuotaQ1 && (cuotaQ1.estado === 'pagada' || (parseFloat(cuotaQ1.valor_pagado || 0) >= parseFloat(cuotaQ1.valor_cuota || 0)))
      if (q1Pagada) {
        const actividadesMovidas = actividadesPeriodoExacto.filter(a =>
          a.quincena_pago === 1 &&
          (a.valor_pendiente || 0) > 0
        )
        if (actividadesMovidas.length > 0) {
          actividadesCoincidentes = actividadesMovidas
          console.log('✅ Actividades movidas de Q1 a Q2 (Q1 pagada, sin pagar):', actividadesMovidas.map(a => ({ id: a.id, descripcion: a.actividad?.descripcion })))
        }
      }
    }
    
    // Si no se encontró con la búsqueda optimizada, usar la función helper como fallback (todas las coincidentes)
    if (actividadesCoincidentes.length === 0) {
      actividadesCoincidentes = actividadesPendientes.value.filter(actividad => {
        return actividadCorrespondeACuota(actividad, cuota, actividad.actividad)
      })
    }

    // Guardar IDs de actividades que corresponden a la cuota actual (no se podrán deseleccionar)
    actividadesDeLaCuotaActual.value = new Set(actividadesCoincidentes.map(a => a.id))

    // Marcar automáticamente todas las actividades coincidentes
    if (actividadesCoincidentes.length > 0) {
      console.log('✅ Actividades coincidentes marcadas automáticamente:', actividadesCoincidentes.map(a => ({
        id: a.id,
        descripcion: a.actividad?.descripcion,
        mes_pago: a.mes_pago,
        anio_pago: a.anio_pago,
        quincena_pago: a.quincena_pago,
        quincena_pago_normalizada: normalizarQuincena(a.quincena_pago),
        cuota_quincena: quincenaCuota,
        periodicidad_socio: periodicidadSocio
      })))
      actividadesCoincidentes.forEach(a => actividadesSeleccionadas.value.add(a.id))
      return true
    } else {
      console.log('ℹ️ No se encontró actividad coincidente para el periodo de la cuota:', {
        cuota: { mes: cuota.mes, anio: cuota.anio, quincena: cuota.quincena },
        actividades_disponibles: actividadesPendientes.value.map(a => ({
          mes: a.mes_pago,
          anio: a.anio_pago,
          quincena: a.quincena_pago
        }))
      })
      actividadesDeLaCuotaActual.value = new Set()
      return false
    }
  } catch (e) {
    console.error('❌ Error cargando actividades pendientes:', e)
    actividadesPendientes.value = []
    actividadesDeLaCuotaActual.value = new Set()
    return false
  } finally {
    cargandoActividades.value = false
  }
}

async function abrirModalPago(cuota) {
  preparandoModalPago.value = true
  
  cuotaSeleccionada.value = cuota
  desplegableYaAbonadoOpen.value = tienePagoParcialCuota(cuota)
  const totalAPagar = getTotalAPagar(cuota)
    formPago.valor = totalAPagar > 0 ? totalAPagar : 0
  formPago.tipo_pago = 'efectivo'
  formPago.aplicaImpuesto4x1000 = false
  actividadesDesplegableAbierto.value = false
  actividadesSeleccionadas.value.clear()
  actividadesDeLaCuotaActual.value = new Set()
  cuotasPrestamosDesplegableAbierto.value = false
  cuotasPrestamosSeleccionadas.value.clear()
  cuotasPrestamosDeLaCuotaActual.value = new Set()

  try {
    const actividadMarcada = await cargarActividadesPendientes(cuota)
    if (actividadMarcada && actividadesSeleccionadas.value.size > 0) {
      await nextTick()
      actualizarValorPagoConActividades()
      console.log('✅ Valor del pago actualizado con actividades seleccionadas automáticamente')
    }
    
    // Cargar cuotas de préstamos pendientes
    await cargarCuotasPrestamosPendientes(cuota)
  } catch (error) {
    console.error('❌ Error al cargar actividades pendientes:', error)
  } finally {
    preparandoModalPago.value = false
    modalPago.value = true
  }
}

// Función para alternar selección de actividad (las de la cuota actual no se pueden deseleccionar)
function toggleActividadSeleccionada(actividadId) {
  if (actividadesSeleccionadas.value.has(actividadId)) {
    // No permitir quitar la selección a actividades que corresponden a la cuota actual
    if (actividadesDeLaCuotaActual.value.has(actividadId)) return
    actividadesSeleccionadas.value.delete(actividadId)
  } else {
    actividadesSeleccionadas.value.add(actividadId)
  }
  // Actualizar el valor del pago para incluir actividades seleccionadas
  actualizarValorPagoConActividades()
}

// Calcular el total de actividades seleccionadas
function getTotalActividadesSeleccionadas() {
  let total = 0
  actividadesPendientes.value.forEach(actividad => {
    if (actividadesSeleccionadas.value.has(actividad.id)) {
      total += parseFloat(actividad.valor_pendiente || 0)
    }
  })
  return total
}

// Registrar pagos de actividades seleccionadas
async function registrarPagosActividades(valorTotalActividades, tipoPago = null, options = {}) {
  if (!cuotaSeleccionada.value || actividadesSeleccionadas.value.size === 0) return
  
  try {
    // Obtener natillera_id desde la cuota
    let natilleraId = cuotaSeleccionada.value.natillera_id || cuotaSeleccionada.value.socio_natillera?.natillera_id
    
    // Si no está disponible directamente, obtenerlo desde la base de datos
    if (!natilleraId && cuotaSeleccionada.value.socio_natillera_id) {
      try {
        const { data: socioNatillera, error: errorSocio } = await supabase
          .from('socios_natillera')
          .select('natillera_id')
          .eq('id', cuotaSeleccionada.value.socio_natillera_id)
          .single()
        
        if (!errorSocio && socioNatillera) {
          natilleraId = socioNatillera.natillera_id
        }
      } catch (e) {
        console.error('Error obteniendo natillera_id:', e)
      }
    }
    
    if (!natilleraId) {
      console.error('❌ No se pudo obtener natillera_id para registrar utilidades')
      return // No continuar si no tenemos natillera_id
    }
    
    // Forma de pago con la que se paga la cuota (se guarda en socios_actividad al pagar actividad desde cuota)
    const formaPagoAct = (tipoPago && ['efectivo', 'transferencia', 'mixto'].includes((tipoPago || '').toLowerCase()))
      ? (tipoPago || '').toLowerCase()
      : null
    
    // Obtener las actividades seleccionadas con sus valores pendientes e información de la actividad
    const actividadesParaPagar = actividadesPendientes.value
      .filter(a => actividadesSeleccionadas.value.has(a.id))
      .map(a => ({
        id: a.id,
        actividad_id: a.actividad_id,
        actividad: a.actividad, // Incluir información completa de la actividad
        valor_pendiente: a.valor_pendiente,
        valor_pagado_actual: a.valor_pagado || 0,
        valor_asignado: a.valor_asignado || 0
      }))
    
    // Calcular el total de actividades seleccionadas
    const totalActividades = actividadesParaPagar.reduce((sum, a) => sum + a.valor_pendiente, 0)
    
    // Si el valor total es mayor o igual al total de actividades, pagar todas completamente
    // Si es menor, distribuir proporcionalmente
    let valorRestante = valorTotalActividades
    
    // Array para rastrear los pagos por tipo de actividad para utilidades
    const pagosPorTipoUtilidad = {} // { tipo: { liquidada: valor, en_curso: valor } }
    
    if (valorRestante >= totalActividades) {
      // Pagar todas las actividades completamente
      for (const actividad of actividadesParaPagar) {
        const nuevoValorPagado = actividad.valor_asignado
        const valorPagadoEnEstaTransaccion = actividad.valor_pendiente // Lo que se paga ahora
        
        // Generar código de comprobante único para la actividad
        let codigoComprobante = null
        try {
          let intentos = 0
          let codigoUnico = false
          while (!codigoUnico && intentos < 5) {
            codigoComprobante = generarCodigoComprobante()
            // Verificar que el código no exista en socios_actividad
            const { data: codigoExistente, error: codigoError } = await supabase
              .from('socios_actividad')
              .select('id')
              .eq('codigo_comprobante', codigoComprobante)
              .limit(1)
            
            if (codigoError) {
              console.warn('Error verificando código de comprobante:', codigoError)
              codigoUnico = true // Continuar de todos modos
            } else if (!codigoExistente || codigoExistente.length === 0) {
              codigoUnico = true
            } else {
              codigoComprobante = null
            }
            intentos++
          }
        } catch (e) {
          console.warn('No se pudo generar código de comprobante para actividad:', e.message)
          codigoComprobante = null
        }
        
        const datosActualizar = {
          valor_pagado: nuevoValorPagado
        }
        
        // Solo agregar código si se generó exitosamente
        if (codigoComprobante) {
          datosActualizar.codigo_comprobante = codigoComprobante
        }
        
        if (formaPagoAct != null) datosActualizar.forma_pago = formaPagoAct
        if (formaPagoAct === 'mixto' && options.valorPagado > 0) {
          const ratioEf = (options.valorEfectivo || 0) / options.valorPagado
          datosActualizar.valor_pagado_efectivo = Math.round(valorPagadoEnEstaTransaccion * ratioEf)
          datosActualizar.valor_pagado_transferencia = valorPagadoEnEstaTransaccion - datosActualizar.valor_pagado_efectivo
        }
        
        const { error } = await supabase
          .from('socios_actividad')
          .update(datosActualizar)
          .eq('id', actividad.id)
        
        if (error) {
          console.error(`Error actualizando actividad ${actividad.id}:`, error)
        } else {
          console.log(`✅ Pago completo registrado para actividad ${actividad.id}${codigoComprobante ? ` con código ${codigoComprobante}` : ''}`)
          
          // Rastrear el pago para utilidades según el estado de la actividad
          if (actividad.actividad) {
            const estadoActividad = actividad.actividad.estado
            const tipoActividad = actividad.actividad.tipo || 'otro'
            const tipoUtilidad = tipoActividad === 'rifa' ? 'rifas' : tipoActividad
            
            if (!pagosPorTipoUtilidad[tipoUtilidad]) {
              pagosPorTipoUtilidad[tipoUtilidad] = { liquidada: 0, en_curso: 0 }
            }
            
            if (estadoActividad === 'liquidada') {
              pagosPorTipoUtilidad[tipoUtilidad].liquidada += valorPagadoEnEstaTransaccion
            } else {
              pagosPorTipoUtilidad[tipoUtilidad].en_curso += valorPagadoEnEstaTransaccion
            }
          }
        }
      }
    } else {
      // Distribuir proporcionalmente
      for (const actividad of actividadesParaPagar) {
        if (valorRestante <= 0) break
        
        // Calcular cuánto pagar de esta actividad (proporcional)
        const porcentaje = actividad.valor_pendiente / totalActividades
        const valorAPagar = Math.min(valorRestante, Math.round(actividad.valor_pendiente * porcentaje))
        
        // Calcular nuevo valor pagado
        const nuevoValorPagado = actividad.valor_pagado_actual + valorAPagar
        
        // Solo generar código de comprobante si se paga completamente
        let codigoComprobante = null
        if (nuevoValorPagado >= actividad.valor_asignado) {
          try {
            let intentos = 0
            let codigoUnico = false
            while (!codigoUnico && intentos < 5) {
              codigoComprobante = generarCodigoComprobante()
              // Verificar que el código no exista en socios_actividad
              const { data: codigoExistente, error: codigoError } = await supabase
                .from('socios_actividad')
                .select('id')
                .eq('codigo_comprobante', codigoComprobante)
                .limit(1)
              
              if (codigoError) {
                console.warn('Error verificando código de comprobante:', codigoError)
                codigoUnico = true // Continuar de todos modos
              } else if (!codigoExistente || codigoExistente.length === 0) {
                codigoUnico = true
              } else {
                codigoComprobante = null
              }
              intentos++
            }
          } catch (e) {
            console.warn('No se pudo generar código de comprobante para actividad:', e.message)
            codigoComprobante = null
          }
        }
        
        const datosActualizar = {
          valor_pagado: nuevoValorPagado
        }
        
        // Solo agregar código si se generó exitosamente y se pagó completamente
        if (codigoComprobante) {
          datosActualizar.codigo_comprobante = codigoComprobante
        }
        
        if (formaPagoAct != null) datosActualizar.forma_pago = formaPagoAct
        if (formaPagoAct === 'mixto' && options.valorPagado > 0) {
          const ratioEf = (options.valorEfectivo || 0) / options.valorPagado
          datosActualizar.valor_pagado_efectivo = Math.round(valorAPagar * ratioEf)
          datosActualizar.valor_pagado_transferencia = valorAPagar - (datosActualizar.valor_pagado_efectivo || 0)
        }
        
        // Actualizar la actividad en la base de datos
        const { error } = await supabase
          .from('socios_actividad')
          .update(datosActualizar)
          .eq('id', actividad.id)
        
        if (error) {
          console.error(`Error actualizando actividad ${actividad.id}:`, error)
        } else {
          console.log(`✅ Pago parcial registrado para actividad ${actividad.id}: $${valorAPagar}${codigoComprobante ? ` con código ${codigoComprobante}` : ''}`)
          
          // Rastrear el pago para utilidades según el estado de la actividad
          if (actividad.actividad) {
            const estadoActividad = actividad.actividad.estado
            const tipoActividad = actividad.actividad.tipo || 'otro'
            const tipoUtilidad = tipoActividad === 'rifa' ? 'rifas' : tipoActividad
            
            if (!pagosPorTipoUtilidad[tipoUtilidad]) {
              pagosPorTipoUtilidad[tipoUtilidad] = { liquidada: 0, en_curso: 0 }
            }
            
            if (estadoActividad === 'liquidada') {
              pagosPorTipoUtilidad[tipoUtilidad].liquidada += valorAPagar
            } else {
              // Las rifas en curso no se guardan en utilidades_clasificadas hasta que se liquide la actividad
              if (tipoUtilidad !== 'rifas') {
                pagosPorTipoUtilidad[tipoUtilidad].en_curso += valorAPagar
              }
            }
          }
          
          valorRestante -= valorAPagar
        }
      }
    }
    
    // Registrar utilidades según el estado de las actividades pagadas
    if (natilleraId && Object.keys(pagosPorTipoUtilidad).length > 0) {
      for (const [tipoUtilidad, pagos] of Object.entries(pagosPorTipoUtilidad)) {
        // Las rifas solo se registran en utilidades_clasificadas cuando se liquida la actividad desde el módulo Actividades, no al pagar la cuota
        if (tipoUtilidad === 'rifas') continue

        // Registrar pagos de actividades liquidadas directamente en utilidades del tipo correspondiente
        if (pagos.liquidada > 0) {
          try {
            const queryLiquidada = (q) => {
              let chain = q.eq('natillera_id', natilleraId).eq('tipo', tipoUtilidad).is('fecha_cierre', null)
              if (formaPagoAct != null) chain = chain.eq('forma_pago', formaPagoAct)
              else chain = chain.is('forma_pago', null)
              return chain
            }
            const { data: existLiquidada } = await queryLiquidada(supabase.from('utilidades_clasificadas').select('id, monto')).maybeSingle()
            const montoAnteriorLiquidada = parseFloat(existLiquidada?.monto) || 0
            const montoFinalLiquidada = montoAnteriorLiquidada + pagos.liquidada
            
            if (existLiquidada) {
              await supabase
                .from('utilidades_clasificadas')
                .update({
                  monto: montoFinalLiquidada,
                  descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades liquidadas)`,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existLiquidada.id)
            } else {
              const insertLiquidada = {
                natillera_id: natilleraId,
                tipo: tipoUtilidad,
                monto: montoFinalLiquidada,
                fecha_cierre: null,
                descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades liquidadas)`,
                detalles: {}
              }
              if (formaPagoAct != null) insertLiquidada.forma_pago = formaPagoAct
              await supabase.from('utilidades_clasificadas').insert(insertLiquidada)
            }
            console.log(`✅ Utilidad registrada para ${tipoUtilidad} (liquidada): $${pagos.liquidada}`)
          } catch (errLiquidada) {
            console.error(`❌ Error registrando utilidad de ${tipoUtilidad} (liquidada):`, errLiquidada)
          }
        }
        
        // Registrar pagos de actividades en curso con su tipo real (evento, otro, bingo, venta; rifas se excluyen arriba)
        if (pagos.en_curso > 0) {
          try {
            const queryEnCurso = (q) => {
              let chain = q.eq('natillera_id', natilleraId).eq('tipo', tipoUtilidad).is('fecha_cierre', null)
              if (formaPagoAct != null) chain = chain.eq('forma_pago', formaPagoAct)
              else chain = chain.is('forma_pago', null)
              return chain
            }
            const { data: existEnCurso } = await queryEnCurso(supabase.from('utilidades_clasificadas').select('id, monto')).maybeSingle()
            const montoAnteriorEnCurso = parseFloat(existEnCurso?.monto) || 0
            const montoFinalEnCurso = montoAnteriorEnCurso + pagos.en_curso
            
            if (existEnCurso) {
              await supabase
                .from('utilidades_clasificadas')
                .update({
                  monto: montoFinalEnCurso,
                  descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades en curso)`,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existEnCurso.id)
            } else {
              const insertEnCurso = {
                natillera_id: natilleraId,
                tipo: tipoUtilidad,
                monto: montoFinalEnCurso,
                fecha_cierre: null,
                descripcion: `Utilidad de ${tipoUtilidad} (incluye pagos de actividades en curso)`,
                detalles: {}
              }
              if (formaPagoAct != null) insertEnCurso.forma_pago = formaPagoAct
              await supabase.from('utilidades_clasificadas').insert(insertEnCurso)
            }
            console.log(`✅ Utilidad registrada para ${tipoUtilidad} (en curso): $${pagos.en_curso}`)
          } catch (errEnCurso) {
            console.error(`❌ Error registrando utilidad de ${tipoUtilidad} (en curso):`, errEnCurso)
          }
        }
      }
    }
    
    // Recargar actividades pendientes para reflejar los cambios
    await cargarActividadesPendientes(cuotaSeleccionada.value)
  } catch (error) {
    console.error('Error registrando pagos de actividades:', error)
  }
}

// Registrar pagos de cuotas de préstamos seleccionadas
async function registrarPagosCuotasPrestamos(valorTotalCuotasPrestamos, tipoPago = null) {
  if (!cuotaSeleccionada.value || cuotasPrestamosSeleccionadas.value.size === 0) return
  
  try {
    // Obtener las cuotas de préstamos seleccionadas con sus valores pendientes
    const cuotasPrestamosParaPagar = cuotasPrestamosPendientes.value
      .filter(cp => cuotasPrestamosSeleccionadas.value.has(cp.id))
      .map(cp => ({
        id: cp.id,
        prestamo_id: cp.prestamo_id,
        numero_cuota: cp.numero_cuota,
        valor_cuota: cp.valor_cuota,
        valor_pagado_actual: cp.valor_pagado || 0,
        valor_pendiente: cp.valor_pendiente
      }))
    
    // Calcular el total de cuotas de préstamos seleccionadas
    const totalCuotasPrestamos = cuotasPrestamosParaPagar.reduce((sum, cp) => sum + cp.valor_pendiente, 0)
    
    // Agrupar cuotas por préstamo para registrar pagos por préstamo
    const pagosPorPrestamo = {}
    cuotasPrestamosParaPagar.forEach(cp => {
      if (!pagosPorPrestamo[cp.prestamo_id]) {
        pagosPorPrestamo[cp.prestamo_id] = {
          prestamo_id: cp.prestamo_id,
          cuotas: [],
          valorTotal: 0
        }
      }
      pagosPorPrestamo[cp.prestamo_id].cuotas.push(cp)
      pagosPorPrestamo[cp.prestamo_id].valorTotal += cp.valor_pendiente
    })
    
    // Si el valor total es mayor o igual al total de cuotas, pagar todas completamente
    // Si es menor, distribuir proporcionalmente
    let valorRestante = valorTotalCuotasPrestamos
    const fechaPago = new Date().toISOString()
    
    // Función para generar código de comprobante único
    function generarCodigoComprobante() {
      const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let codigo = ''
      for (let i = 0; i < 8; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
      }
      return codigo
    }
    
    // Procesar cada préstamo
    for (const prestamoId in pagosPorPrestamo) {
      const infoPrestamo = pagosPorPrestamo[prestamoId]
      const cuotasDelPrestamo = infoPrestamo.cuotas
      
      // Calcular cuánto se pagará de este préstamo (proporcional al total)
      const proporcionPrestamo = infoPrestamo.valorTotal / totalCuotasPrestamos
      const valorAPagarPrestamo = Math.min(valorRestante, valorTotalCuotasPrestamos * proporcionPrestamo)
      
      if (valorAPagarPrestamo <= 0) continue
      
      // Generar código de comprobante único para el pago del préstamo
      let codigoComprobante = null
      let intentos = 0
      let codigoUnico = false
      while (!codigoUnico && intentos < 5) {
        codigoComprobante = generarCodigoComprobante()
        const { data: codigoExistente } = await supabase
          .from('pagos_prestamo')
          .select('id')
          .eq('codigo_comprobante', codigoComprobante)
          .limit(1)
        
        if (!codigoExistente || codigoExistente.length === 0) {
          codigoUnico = true
        } else {
          codigoComprobante = null
        }
        intentos++
      }
      
      // Registrar el pago en la tabla pagos_prestamo
      const datosPago = {
        prestamo_id: prestamoId,
        valor: valorAPagarPrestamo,
        fecha: fechaPago
      }
      
      if (codigoComprobante) {
        datosPago.codigo_comprobante = codigoComprobante
      }
      
      const { data: pagoInsertado, error: errorPago } = await supabase
        .from('pagos_prestamo')
        .insert(datosPago)
        .select()
        .single()
      
      if (errorPago) {
        console.error(`Error insertando pago de préstamo ${prestamoId}:`, errorPago)
        continue
      }
      
      console.log(`✅ Pago registrado en pagos_prestamo para préstamo ${prestamoId}: $${valorAPagarPrestamo}`)
      
      // Obtener información del préstamo
      const { data: prestamo, error: errorPrestamo } = await supabase
        .from('prestamos')
        .select('saldo_actual, estado')
        .eq('id', prestamoId)
        .single()
      
      if (errorPrestamo) {
        console.error(`Error obteniendo préstamo ${prestamoId}:`, errorPrestamo)
        continue
      }
      
      // Calcular nuevo saldo
      const saldoAnterior = parseFloat(prestamo.saldo_actual || 0)
      const nuevoSaldo = Math.max(0, saldoAnterior - valorAPagarPrestamo)
      
      // Determinar nuevo estado
      let nuevoEstado = prestamo.estado
      if (nuevoSaldo <= 0 && prestamo.estado === 'activo') {
        nuevoEstado = 'pagado'
      }
      
      // Actualizar el préstamo
      const { error: errorUpdatePrestamo } = await supabase
        .from('prestamos')
        .update({
          saldo_actual: nuevoSaldo,
          estado: nuevoEstado
        })
        .eq('id', prestamoId)
      
      if (errorUpdatePrestamo) {
        console.error(`Error actualizando préstamo ${prestamoId}:`, errorUpdatePrestamo)
      } else {
        console.log(`✅ Préstamo ${prestamoId} actualizado. Saldo: $${saldoAnterior} → $${nuevoSaldo}`)
      }
      
      // Distribuir el pago entre las cuotas del préstamo
      let valorRestantePrestamo = valorAPagarPrestamo
      
      // Ordenar cuotas por número
      const cuotasOrdenadas = [...cuotasDelPrestamo].sort((a, b) => a.numero_cuota - b.numero_cuota)
      
      for (const cuotaPrestamo of cuotasOrdenadas) {
        if (valorRestantePrestamo <= 0) break
        
        const valorAPagarCuota = Math.min(valorRestantePrestamo, cuotaPrestamo.valor_pendiente)
        const nuevoValorPagado = cuotaPrestamo.valor_pagado_actual + valorAPagarCuota
        const estaCompleta = nuevoValorPagado >= cuotaPrestamo.valor_cuota
        
        const datosActualizar = {
          valor_pagado: nuevoValorPagado
        }
        
        if (estaCompleta) {
          datosActualizar.pagada = true
          datosActualizar.fecha_pago = fechaPago
          // Periodo de vencimiento según fecha_proyectada (para que aparezca en la quincena correcta)
          if (cuotaPrestamo.fecha_proyectada) {
            const d = new Date(cuotaPrestamo.fecha_proyectada)
            if (!isNaN(d.getTime())) {
              datosActualizar.mes = d.getMonth() + 1
              datosActualizar.anio = d.getFullYear()
              datosActualizar.quincena = d.getDate() <= 15 ? 1 : 2
            }
          }
        }
        
        const { error: errorUpdateCuota } = await supabase
          .from('plan_pagos_prestamo')
          .update(datosActualizar)
          .eq('id', cuotaPrestamo.id)
        
        if (errorUpdateCuota) {
          console.error(`Error actualizando cuota de préstamo ${cuotaPrestamo.numero_cuota}:`, errorUpdateCuota)
        } else {
          console.log(`✅ Pago ${estaCompleta ? 'completo' : 'parcial'} registrado para cuota de préstamo #${cuotaPrestamo.numero_cuota}`)
        }
        
        valorRestantePrestamo -= valorAPagarCuota
      }
      
      valorRestante -= valorAPagarPrestamo
    }
    
    // Recargar cuotas de préstamos pendientes para reflejar los cambios
    await cargarCuotasPrestamosPendientes(cuotaSeleccionada.value)
  } catch (error) {
    console.error('Error registrando pagos de cuotas de préstamos:', error)
  }
}

// Función para cargar cuotas de préstamos pendientes del socio
async function cargarCuotasPrestamosPendientes(cuota) {
  if (!cuota || !cuota.socio_natillera_id) {
    console.log('❌ cargarCuotasPrestamosPendientes: No hay cuota o socio_natillera_id')
    cuotasPrestamosPendientes.value = []
    return
  }

  cargandoCuotasPrestamos.value = true
  try {
    // Obtener préstamos del socio que no estén completamente pagados
    const { data: prestamos, error: errorPrestamos } = await supabase
      .from('prestamos')
      .select('id, monto, periodicidad')
      .eq('socio_natillera_id', cuota.socio_natillera_id)
      .eq('estado', 'activo')

    if (errorPrestamos) {
      console.error('❌ Error cargando préstamos:', errorPrestamos)
      cuotasPrestamosPendientes.value = []
      return
    }

    if (!prestamos || prestamos.length === 0) {
      cuotasPrestamosPendientes.value = []
      return
    }

    // Obtener todas las cuotas de préstamos pendientes
    const prestamoIds = prestamos.map(p => p.id)
    const { data: planPagos, error: errorPlanPagos } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .in('prestamo_id', prestamoIds)
      .eq('pagada', false)
      .order('fecha_proyectada', { ascending: true })

    if (errorPlanPagos) {
      console.error('❌ Error cargando plan de pagos:', errorPlanPagos)
      cuotasPrestamosPendientes.value = []
      return
    }

    if (!planPagos || planPagos.length === 0) {
      cuotasPrestamosPendientes.value = []
      return
    }

    // Obtener información de los préstamos para cada cuota
    const prestamosMap = new Map(prestamos.map(p => [p.id, p]))

    // Procesar las cuotas y determinar cuáles están programadas para el período actual
    const mesActual = cuota.mes
    const anioActual = cuota.anio
    const quincenaActual = cuota.quincena

    const cuotasProcesadas = planPagos.map(cuotaPrestamo => {
      const prestamo = prestamosMap.get(cuotaPrestamo.prestamo_id)
      const fechaProyectada = new Date(cuotaPrestamo.fecha_proyectada)
      const mesProyectado = fechaProyectada.getMonth() + 1
      const anioProyectado = fechaProyectada.getFullYear()
      
      // Determinar la quincena proyectada según la periodicidad del préstamo
      let quincenaProyectada = null
      if (prestamo && prestamo.periodicidad === 'quincenal') {
        const dia = fechaProyectada.getDate()
        quincenaProyectada = dia <= 15 ? 1 : 2
      } else {
        // Para préstamos mensuales, la quincena es 0 o null
        quincenaProyectada = 0
      }

      // Verificar si está programada para el período actual
      const estaProgramada = estaCuotaPrestamoProgramadaParaPeriodo(
        mesProyectado,
        anioProyectado,
        quincenaProyectada,
        mesActual,
        anioActual,
        quincenaActual
      )

      const valorPendiente = parseFloat(cuotaPrestamo.valor_cuota || 0) - parseFloat(cuotaPrestamo.valor_pagado || 0)

      return {
        ...cuotaPrestamo,
        prestamo,
        mes_proyectado: mesProyectado,
        anio_proyectado: anioProyectado,
        quincena_proyectada: quincenaProyectada,
        valor_pendiente: Math.max(0, valorPendiente),
        esta_programada: estaProgramada
      }
    })

    cuotasPrestamosPendientes.value = cuotasProcesadas

    // Marcar las cuotas que están programadas para el período actual
    cuotasProcesadas.forEach(cuotaPrestamo => {
      if (cuotaPrestamo.esta_programada) {
        cuotasPrestamosDeLaCuotaActual.value.add(cuotaPrestamo.id)
        cuotasPrestamosSeleccionadas.value.add(cuotaPrestamo.id)
      }
    })

    // Actualizar el valor del pago si hay cuotas programadas
    if (cuotasPrestamosSeleccionadas.value.size > 0) {
      await nextTick()
      actualizarValorPagoConCuotasPrestamos()
    }
  } catch (error) {
    console.error('❌ Error cargando cuotas de préstamos:', error)
    cuotasPrestamosPendientes.value = []
  } finally {
    cargandoCuotasPrestamos.value = false
  }
}

// Función para determinar si una cuota de préstamo está programada para el período actual
function estaCuotaPrestamoProgramadaParaPeriodo(
  mesProyectado,
  anioProyectado,
  quincenaProyectada,
  mesActual,
  anioActual,
  quincenaActual
) {
  // Primero verificar que el año y mes coincidan
  if (anioProyectado !== anioActual || mesProyectado !== mesActual) {
    return false
  }

  // Si la cuota actual es mensual (quincena 0 o null)
  if (quincenaActual === null || quincenaActual === 0 || quincenaActual === undefined) {
    // La cuota de préstamo también debe ser mensual (quincena 0)
    return quincenaProyectada === 0 || quincenaProyectada === null
  }

  // Si la cuota actual es quincenal (1 o 2)
  if (quincenaActual === 1 || quincenaActual === 2) {
    // La cuota de préstamo debe tener la misma quincena
    return quincenaProyectada === quincenaActual
  }

  return false
}

// Cargar total de cuotas de préstamos pendientes por periodo para todas las cuotas visibles (tarjetas programadas, pendientes, etc.)
async function cargarCuotasPrestamosPendientesParaLista() {
  const cuotas = cuotasFiltradas.value
  if (!cuotas || cuotas.length === 0) {
    cuotasPrestamosPendientesPorPeriodo.value = new Map()
    return
  }
  const sociosUnicos = [...new Set(cuotas.map(c => c.socio_natillera_id).filter(Boolean))]
  if (sociosUnicos.length === 0) {
    cuotasPrestamosPendientesPorPeriodo.value = new Map()
    return
  }
  try {
    const { data: prestamos, error: errP } = await supabase
      .from('prestamos')
      .select('id, socio_natillera_id, periodicidad')
      .in('socio_natillera_id', sociosUnicos)
      .eq('estado', 'activo')
    if (errP || !prestamos?.length) {
      cuotasPrestamosPendientesPorPeriodo.value = new Map()
      return
    }
    const prestamoIds = prestamos.map(p => p.id)
    const prestamosMap = new Map(prestamos.map(p => [p.id, p]))
    const { data: planPagos, error: errPlan } = await supabase
      .from('plan_pagos_prestamo')
      .select('id, prestamo_id, valor_cuota, valor_pagado, fecha_proyectada')
      .in('prestamo_id', prestamoIds)
      .eq('pagada', false)
    if (errPlan || !planPagos?.length) {
      cuotasPrestamosPendientesPorPeriodo.value = new Map()
      return
    }
    const totalesPorPeriodo = new Map()
    for (const cp of planPagos) {
      const prestamo = prestamosMap.get(cp.prestamo_id)
      if (!prestamo) continue
      const fechaProyectada = new Date(cp.fecha_proyectada)
      const mesProyectado = fechaProyectada.getMonth() + 1
      const anioProyectado = fechaProyectada.getFullYear()
      let quincenaProyectada = 0
      if (prestamo.periodicidad === 'quincenal') {
        const dia = fechaProyectada.getDate()
        quincenaProyectada = dia <= 15 ? 1 : 2
      }
      const valorPendiente = Math.max(0, (parseFloat(cp.valor_cuota) || 0) - (parseFloat(cp.valor_pagado) || 0))
      if (valorPendiente <= 0) continue
      const key = `${prestamo.socio_natillera_id}-${mesProyectado}-${anioProyectado}-${quincenaProyectada}`
      totalesPorPeriodo.set(key, (totalesPorPeriodo.get(key) || 0) + valorPendiente)
    }
    cuotasPrestamosPendientesPorPeriodo.value = totalesPorPeriodo
  } catch (e) {
    console.error('Error cargando cuotas de préstamos pendientes para lista:', e)
    cuotasPrestamosPendientesPorPeriodo.value = new Map()
  }
}

// Función para alternar selección de cuota de préstamo (las de la cuota actual no se pueden deseleccionar)
function toggleCuotaPrestamoSeleccionada(cuotaPrestamoId) {
  if (cuotasPrestamosSeleccionadas.value.has(cuotaPrestamoId)) {
    // No permitir quitar la selección a cuotas que corresponden a la cuota actual
    if (cuotasPrestamosDeLaCuotaActual.value.has(cuotaPrestamoId)) return
    cuotasPrestamosSeleccionadas.value.delete(cuotaPrestamoId)
  } else {
    cuotasPrestamosSeleccionadas.value.add(cuotaPrestamoId)
  }
  // Actualizar el valor del pago para incluir cuotas de préstamos seleccionadas
  actualizarValorPagoConCuotasPrestamos()
}

// Calcular el total de cuotas de préstamos seleccionadas
function getTotalCuotasPrestamosSeleccionadas() {
  let total = 0
  cuotasPrestamosPendientes.value.forEach(cuotaPrestamo => {
    if (cuotasPrestamosSeleccionadas.value.has(cuotaPrestamo.id)) {
      total += parseFloat(cuotaPrestamo.valor_pendiente || 0)
    }
  })
  return total
}

// Actualizar el valor del pago cuando se seleccionan/deseleccionan cuotas de préstamos
function actualizarValorPagoConCuotasPrestamos() {
  if (!cuotaSeleccionada.value) return
  
  const totalCuota = getTotalAPagar(cuotaSeleccionada.value)
  const totalActividades = getTotalActividadesSeleccionadas()
  const totalCuotasPrestamos = getTotalCuotasPrestamosSeleccionadas()
  
  // Valor neto a obligaciones (en transferencia el 4×1000 es opcional vía checkbox)
  const O = totalCuota + totalActividades + totalCuotasPrestamos
  formPago.valor = O
}

// Función para obtener el total a pagar incluyendo actividades y cuotas de préstamos seleccionadas
function getTotalAPagarConActividades(cuota) {
  const totalCuota = getTotalAPagar(cuota)
  const totalActividades = getTotalActividadesSeleccionadas()
  const totalCuotasPrestamos = getTotalCuotasPrestamosSeleccionadas()
  return totalCuota + totalActividades + totalCuotasPrestamos
}

// Actualizar la función existente para incluir cuotas de préstamos
function actualizarValorPagoConActividades() {
  if (!cuotaSeleccionada.value) return
  
  const totalCuota = getTotalAPagar(cuotaSeleccionada.value)
  const totalActividades = getTotalActividadesSeleccionadas()
  const totalCuotasPrestamos = getTotalCuotasPrestamosSeleccionadas()
  
  const O = totalCuota + totalActividades + totalCuotasPrestamos
  // Si hay actividades o cuotas de préstamos seleccionadas, actualizar el valor automáticamente
  if (totalActividades > 0 || totalCuotasPrestamos > 0) {
    formPago.valor = O
  } else {
    if (formPago.tipo_pago === 'transferencia') {
      if ((formPago.valor || 0) > totalCuota) {
        formPago.valor = totalCuota
      }
    } else if (formPago.valor > totalCuota) {
      formPago.valor = totalCuota
    }
  }
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

async function abrirModalEditar(cuota) {
  cuotaEditando.value = cuota
  formEditarCuota.tipo_pago = cuota.tipo_pago || 'efectivo'
  
  // Cargar actividades y cuotas de préstamos pagadas
  await cargarActividadesPagadasEditar(cuota)
  await cargarCuotasPrestamosPagadasEditar(cuota)
  
  // Calcular el valor pagado total incluyendo actividades y cuotas de préstamos pagadas
  const valorCuotaPagado = cuota.valor_pagado || 0
  const valorSancionPagado = cuota.valor_pagado_sancion || 0
  const totalActividadesPagadas = getTotalActividadesPagadasEditar()
  const totalCuotasPrestamosPagadas = getTotalCuotasPrestamosPagadasEditar()
  const valorPagadoTotal = valorCuotaPagado + valorSancionPagado + totalActividadesPagadas + totalCuotasPrestamosPagadas
  
  formEditarCuota.valor = valorPagadoTotal > 0 ? valorPagadoTotal : (cuota.valor_pagado || 0)
  
  modalEditarCuota.value = true
}

// Función para obtener el total de actividades pagadas en el modal de editar
function getTotalActividadesPagadasEditar() {
  return actividadesPagadasEditar.value.reduce((total, actividad) => {
    return total + parseFloat(actividad.valor_pagado || 0)
  }, 0)
}

// Función para obtener el total de cuotas de préstamos pagadas en el modal de editar
function getTotalCuotasPrestamosPagadasEditar() {
  return cuotasPrestamosPagadasEditar.value.reduce((total, cuotaPrestamo) => {
    return total + parseFloat(cuotaPrestamo.valor_pagado || 0)
  }, 0)
}

// Función para cargar actividades pagadas de la cuota
async function cargarActividadesPagadasEditar(cuota) {
  if (!cuota || !cuota.socio_natillera_id) {
    actividadesPagadasEditar.value = []
    return
  }

  try {
    const { data: sociosActividadData, error } = await supabase
      .from('socios_actividad')
      .select('*, actividad:actividades(*)')
      .eq('socio_natillera_id', cuota.socio_natillera_id)
      .in('estado', ['pagada', 'pagado'])
      .eq('mes_pago', cuota.mes)
      .eq('anio_pago', cuota.anio)
      .gt('valor_pagado', 0)

    if (error) {
      console.error('Error cargando actividades pagadas:', error)
      actividadesPagadasEditar.value = []
      return
    }

    actividadesPagadasEditar.value = (sociosActividadData || []).filter(sa => sa.valor_pagado > 0)
  } catch (error) {
    console.error('Error cargando actividades pagadas:', error)
    actividadesPagadasEditar.value = []
  }
}

// Función para cargar cuotas de préstamos pagadas de la cuota
async function cargarCuotasPrestamosPagadasEditar(cuota) {
  if (!cuota || !cuota.socio_natillera_id) {
    cuotasPrestamosPagadasEditar.value = []
    return
  }

  try {
    // Obtener préstamos del socio
    const { data: prestamos, error: errorPrestamos } = await supabase
      .from('prestamos')
      .select('id')
      .eq('socio_natillera_id', cuota.socio_natillera_id)
      .eq('estado', 'activo')

    if (errorPrestamos || !prestamos || prestamos.length === 0) {
      cuotasPrestamosPagadasEditar.value = []
      return
    }

    const prestamoIds = prestamos.map(p => p.id)
    const mesActual = cuota.mes
    const anioActual = cuota.anio

    // Obtener cuotas de préstamos pagadas del período
    const { data: planPagos, error: errorPlanPagos } = await supabase
      .from('plan_pagos_prestamo')
      .select('*, prestamo:prestamos(*)')
      .in('prestamo_id', prestamoIds)
      .gt('valor_pagado', 0)

    if (errorPlanPagos) {
      console.error('Error cargando cuotas de préstamos pagadas:', errorPlanPagos)
      cuotasPrestamosPagadasEditar.value = []
      return
    }

    // Filtrar por período y que tengan valor pagado
    const fechaProyectada = new Date()
    cuotasPrestamosPagadasEditar.value = (planPagos || []).filter(cp => {
      if (!cp.fecha_proyectada) return false
      const fecha = new Date(cp.fecha_proyectada)
      return fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual && cp.valor_pagado > 0
    })
  } catch (error) {
    console.error('Error cargando cuotas de préstamos pagadas:', error)
    cuotasPrestamosPagadasEditar.value = []
  }
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
  guardarScrollMain() // guardar scroll al instante del clic
  asignarScrollAntesDeAbrirModal()
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
  nextTick(() => {
    requestAnimationFrame(() => {
      const main = document.querySelector('main')
      if (main && scrollMainAntesModal.value > 0) main.scrollTop = scrollMainAntesModal.value
    })
  })
}

function cerrarModalEditarSocio() {
  modalEditarSocio.value = false
  restaurarScrollMain()
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

// Función para limpiar número de teléfono (igual que en Socios.vue)
function limpiarNumeroTelefono(telefono) {
  if (!telefono) return ''
  // Remover caracteres no numéricos excepto el signo +
  let numeroLimpio = telefono.replace(/[^\d+]/g, '')
  
  // Si comienza con +, quitar el signo
  if (numeroLimpio.startsWith('+')) {
    numeroLimpio = numeroLimpio.substring(1)
  }
  
  // Quitar el indicativo de Colombia (57) si está presente
  // Si el número tiene más de 10 dígitos y comienza con 57, quitar el 57
  if (numeroLimpio.length > 10 && numeroLimpio.startsWith('57')) {
    numeroLimpio = numeroLimpio.substring(2)
  }
  
  // Si solo tiene caracteres no numéricos, limpiar todo
  if (!numeroLimpio || numeroLimpio.length === 0) {
    numeroLimpio = telefono.replace(/\D/g, '')
    // Aplicar la misma lógica de quitar el indicativo
    if (numeroLimpio.length > 10 && numeroLimpio.startsWith('57')) {
      numeroLimpio = numeroLimpio.substring(2)
    }
  }
  
  return numeroLimpio
}

// Función para generar cuotas para un socio (igual que en Socios.vue)
async function generarCuotasParaSocio(natilleraId, socioNatilleraId, natillera, valorCuota, periodicidad) {
  try {
    console.log('🚀 Iniciando generación optimizada de cuotas...')
    console.log('📋 Datos para generación:', {
      natilleraId,
      socioNatilleraId,
      valorCuota,
      periodicidad,
      natilleraDisponible: !!natillera,
      natilleraNombre: natillera?.nombre,
      natilleraMesInicio: natillera?.mes_inicio,
      natilleraMesFin: natillera?.mes_fin,
      natilleraAnio: natillera?.anio,
      natilleraAnioInicio: natillera?.anio_inicio
    })
    
    // Usar la nueva función batch que es ~10x más rápida
    const result = await cuotasStore.generarCuotasBatchParaSocio(
      natilleraId,
      socioNatilleraId,
      valorCuota,
      periodicidad,
      natillera
    )
    
    console.log('📊 Resultado de generación:', result)
    
    if (result.success) {
      progresoCreacion.value.cuotasGeneradas = result.cuotasGeneradas
      console.log(`✅ Cuotas generadas exitosamente en ${result.tiempoMs?.toFixed(0) || 0}ms`)
    } else {
      console.error('❌ Error en generación:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('❌ Error generando cuotas automáticas:', error)
    return { success: false, error: error.message, cuotasGeneradas: 0 }
  }
}

function cerrarModalProgreso() {
  modalProgreso.value = false
  progresoCreacion.value = {
    paso: 0,
    mensaje: '',
    cuotasGeneradas: 0,
    cuotasTotales: 0,
    error: null,
    exito: false,
    nombreSocio: ''
  }
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
      
      // Limpiar el teléfono y quitar el indicativo de país
      const telefonoLimpio = limpiarNumeroTelefono(formSocio.telefono)
      
      // Detectar si cambió la periodicidad
      const periodicidadAnterior = socioEditando.value.periodicidad || 'mensual'
      const periodicidadNueva = formSocio.periodicidad || 'mensual'
      const cambioPeriodicidad = periodicidadAnterior !== periodicidadNueva
      
      // Si cambió la periodicidad, necesitamos eliminar y regenerar cuotas
      if (cambioPeriodicidad) {
        // IMPORTANTE: Guardar TODOS los datos necesarios ANTES de cerrar el modal
        // porque cerrarModalEditarSocio() resetea el formulario
        const socioNatilleraId = socioEditando.value.id
        const socioId = socioEditando.value.socio?.id || null
        
        // Guardar todos los valores del formulario antes de que se reseteen
        const nombreGuardado = formSocio.nombre || socioEditando.value.socio?.nombre || ''
        const telefonoGuardado = telefonoLimpio || socioEditando.value.socio?.telefono || ''
        const emailGuardado = formSocio.email || socioEditando.value.socio?.email || null
        const documentoGuardado = formSocio.documento || socioEditando.value.socio?.documento || null
        const avatarSeedGuardado = formSocio.avatar_seed || socioEditando.value.socio?.avatar_seed || null
        
        // IMPORTANTE: Guardar el valor de cuota - usar el del formulario si es válido, sino el anterior
        let valorCuotaGuardado = typeof formSocio.valor_cuota === 'string' 
          ? parseFloat(formSocio.valor_cuota.replace(/\./g, '').replace(/[^\d.-]/g, '')) || 0
          : Number(formSocio.valor_cuota) || 0
        
        // Si el valor del formulario es 0 o inválido, usar el valor anterior del socio
        if (valorCuotaGuardado <= 0 || isNaN(valorCuotaGuardado)) {
          valorCuotaGuardado = socioEditando.value.valor_cuota_individual || 0
        }
        
        // Cerrar el modal de edición primero
        cerrarModalEditarSocio()
        
        // Iniciar el modal de progreso
        progresoCreacion.value = {
          paso: 1,
          mensaje: 'Actualizando periodicidad...',
          cuotasGeneradas: 0,
          cuotasTotales: 0,
          error: null,
          exito: false,
          nombreSocio: nombreGuardado
        }
        modalProgreso.value = true

        try {
          // Paso 1: Actualizar datos del socio (sin periodicidad aún)
          // IMPORTANTE: Usar los valores guardados antes de cerrar el modal
          const datosActualizados = {
            nombre: nombreGuardado,
            telefono: telefonoGuardado
          }
          
          // Solo incluir email si tiene valor (usar valor guardado)
          if (emailGuardado && emailGuardado.trim() !== '') {
            datosActualizados.email = emailGuardado.trim()
          }
          
          // Solo incluir documento si tiene valor (no puede ser null por constraint de BD)
          if (documentoGuardado && documentoGuardado.trim() !== '') {
            datosActualizados.documento = documentoGuardado.trim()
          }
          
          if (avatarSeedGuardado) {
            datosActualizados.avatar_seed = avatarSeedGuardado
          }

          // OPTIMIZACIÓN: Verificar unicidad del teléfono y actualizar datos en paralelo si es posible
          // (Solo si hay datos para actualizar)
          if (socioId && Object.keys(datosActualizados).length > 2) { // Más que solo nombre y telefono
            const [telefonoExiste, resultDatos] = await Promise.all([
              sociosStore.verificarTelefonoUnico(telefonoLimpio, id, socioId),
              sociosStore.actualizarDatosSocio(socioId, datosActualizados, id)
            ])
            
            if (!telefonoExiste) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
              estadoGuardadoSocio.value = ''
              return
            }
            
            if (!resultDatos.success) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = resultDatos.error || 'Error al actualizar los datos del socio'
              estadoGuardadoSocio.value = ''
              return
            }
          } else if (socioId) {
            // Si solo hay nombre y teléfono, verificar teléfono primero
            const telefonoExiste = await sociosStore.verificarTelefonoUnico(telefonoLimpio, id, socioId)
            if (!telefonoExiste) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
              estadoGuardadoSocio.value = ''
              return
            }
            
            const resultDatos = await sociosStore.actualizarDatosSocio(socioId, datosActualizados, id)
            if (!resultDatos.success) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = resultDatos.error || 'Error al actualizar los datos del socio'
              estadoGuardadoSocio.value = ''
              return
            }
          }

          // Paso 2: Eliminar todas las cuotas del socio
          progresoCreacion.value.paso = 2
          progresoCreacion.value.mensaje = 'Eliminando cuotas anteriores...'

          const resultEliminar = await cuotasStore.eliminarTodasLasCuotasSocio(socioNatilleraId)
          
          if (!resultEliminar.success) {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = resultEliminar.error || 'Error al eliminar las cuotas anteriores'
            estadoGuardadoSocio.value = ''
            return
          }

          // Paso 3: Actualizar periodicidad y valor de cuota
          progresoCreacion.value.mensaje = 'Actualizando configuración...'
          
          // IMPORTANTE: Usar el valor de cuota guardado antes de cerrar el modal
          const valorCuotaFinal = valorCuotaGuardado
          
          // Validar que el valor final sea válido
          if (valorCuotaFinal <= 0 || isNaN(valorCuotaFinal)) {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = 'El valor de la cuota debe ser mayor a cero'
            estadoGuardadoSocio.value = ''
            return
          }

          const result = await sociosStore.actualizarSocioNatillera(socioNatilleraId, {
            valor_cuota_individual: valorCuotaFinal,
            periodicidad: periodicidadNueva
          })

          if (!result.success) {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = result.error || 'Error al actualizar la periodicidad'
            estadoGuardadoSocio.value = ''
            return
          }

          // Paso 4: Generar nuevas cuotas
          progresoCreacion.value.paso = 2
          progresoCreacion.value.mensaje = 'Generando cuotas con nueva periodicidad...'
          
          // Asegurar que la natillera esté cargada
          let natillera = natillerasStore.natilleraActual
          if (!natillera || natillera.id !== id) {
            await natillerasStore.fetchNatillera(id)
            natillera = natillerasStore.natilleraActual
          }
          
          const resultCuotas = await generarCuotasParaSocio(
            id,
            socioNatilleraId,
            natillera,
            valorCuotaFinal,
            periodicidadNueva
          )

          if (resultCuotas.success) {
            progresoCreacion.value.cuotasGeneradas = resultCuotas.cuotasGeneradas
            progresoCreacion.value.paso = 3
            progresoCreacion.value.exito = true
            progresoCreacion.value.mensaje = '¡Periodicidad actualizada exitosamente!'
            
            // OPTIMIZACIÓN: Recargar cuotas y actualizar socio en paralelo
            await Promise.all([
              cuotasStore.fetchCuotasNatillera(id),
              sociosStore.fetchSociosNatillera(id)
            ])
            
            // Cerrar modal después de 1.5 segundos
            setTimeout(() => {
              cerrarModalProgreso()
            }, 1500)
          } else {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = resultCuotas.error || 'Error al generar las nuevas cuotas'
          }
        } catch (error) {
          progresoCreacion.value.paso = 0
          progresoCreacion.value.error = error.message || 'Error inesperado al cambiar la periodicidad'
        } finally {
          estadoGuardadoSocio.value = ''
        }
        return
      }

      // Si no cambió la periodicidad, actualizar normalmente
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
        // Verificar unicidad del teléfono dentro de la natillera (excepto el propio socio)
        const telefonoExiste = await sociosStore.verificarTelefonoUnico(telefonoLimpio, id, socioEditando.value.socio.id)
        if (!telefonoExiste) {
          errorSocio.value = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
          estadoGuardadoSocio.value = ''
          return
        }

        const datosActualizados = {
          nombre: formSocio.nombre,
          telefono: telefonoLimpio,
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
          if (resultDatos.error?.includes('unique') || resultDatos.error?.includes('duplicate')) {
            errorSocio.value = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
          } else {
            errorSocio.value = resultDatos.error || 'Error al actualizar los datos del socio'
          }
          estadoGuardadoSocio.value = ''
          return
        }
      }

      if (!result.success) {
        console.error('❌ Error al actualizar socio_natillera:', result.error)
        throw new Error(result.error || 'Error al actualizar la información del socio')
      }

      console.log('✅ Socio_natillera actualizado correctamente')
      
      if (result.success) {
        // Los stores ya actualizan localmente los datos, no es necesario recargar
        // Solo recargar cuotas si cambió el valor de cuota individual
        const cuotaCambio = socioEditando.value.valor_cuota_individual !== valorCuotaNumerico
        if (cuotaCambio) {
          // Recargar cuotas para ver los cambios
          await cuotasStore.fetchCuotasNatillera(id)
        }
        
        // Recargar datos de los socios para actualizar la vista
        await sociosStore.fetchSociosNatillera(id)
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
function handleValorPagoEditarInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    formEditarCuota.valor = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      formEditarCuota.valor = numero
    }
  }
}

function seleccionarValorPagoEditar(event) {
  const input = event?.target
  if (!input || typeof input.select !== 'function') return
  
  // Seleccionar el texto del input
  setTimeout(() => input.select(), 0)
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
    const nuevoValor = formEditarCuota.valor || 0
    const valorCuota = cuotaEditando.value.valor_cuota || 0
    const tienePagoParcial = cuotaEditando.value.valor_pagado && cuotaEditando.value.valor_pagado > 0
    const estaPagada = (cuotaEditando.value.estadoReal || cuotaEditando.value.estado) === 'pagada'
    const valorPagadoAnterior = cuotaEditando.value.valor_pagado || 0
    const valorPagadoSancionAnterior = cuotaEditando.value.valor_pagado_sancion || 0
    
    // Calcular el valor total anterior (cuota + sanciones + actividades + préstamos)
    const actividadesPagadasAnterior = getActividadesInfoSocio(cuotaEditando.value).pagadas || 0
    const cuotasPrestamosPagadasAnterior = getTotalCuotasPrestamosPagadasSocioSync(cuotaEditando.value) || 0
    const valorTotalAnterior = valorPagadoAnterior + valorPagadoSancionAnterior + actividadesPagadasAnterior + cuotasPrestamosPagadasAnterior
    
    // Declarar variables de código de comprobante fuera del bloque condicional
    let nuevoCodigoComprobante = null
    const codigoAnterior = cuotaEditando.value.codigo_comprobante
    let nuevoValorPagado = nuevoValor // Declarar fuera del bloque para que esté disponible después
    let valorCambio = false // Declarar fuera del bloque para que esté disponible después
    
    let datosActualizar = {}
    
    // Si hay un pago parcial o la cuota está pagada, actualizar valor_pagado (reemplazar, no sumar)
    if (tienePagoParcial || estaPagada) {
      nuevoValorPagado = nuevoValor
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
      
      // Si el valor total pagado cambió (comparando el total completo: cuota + sanciones + actividades + préstamos)
      // o la cuota está pagada o tiene pago parcial y se está editando, generar un nuevo código de comprobante
      valorCambio = nuevoValorPagado !== valorTotalAnterior
      // Verificar si cambió la forma de pago
      const tipoPagoAnterior = cuotaEditando.value.tipo_pago || 'efectivo'
      const tipoPagoCambio = formEditarCuota.tipo_pago !== tipoPagoAnterior
      // Generar código nuevo si: hay cambio de valor, o si está pagada/tiene pago parcial y hay cualquier cambio (valor o forma de pago)
      // Si la cuota está pagada o tiene pago parcial, siempre generar código nuevo al hacer cualquier modificación
      const debeGenerarCodigo = (valorCambio && nuevoValorPagado > 0) || ((estaPagada || tienePagoParcial) && (valorCambio || tipoPagoCambio))
      
      if (debeGenerarCodigo) {
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
      
      // Calcular el desglose del nuevo valor total
      // El nuevoValor es el total pagado (cuota + sanción + actividades + préstamos)
      // Necesitamos desglosarlo correctamente
      const valorSancionActual = cuotaEditando.value.valor_pagado_sancion || 0
      const valorActividadesActual = cuotaEditando.value.valor_pagado_actividades || 0
      
      // Obtener el total de cuotas de préstamos pagadas (puede no estar en la cuota directamente)
      const valorCuotasPrestamosActual = getTotalCuotasPrestamosPagadasSocioSync(cuotaEditando.value) || 0
      
      // El valor de la cuota base es el total menos los otros conceptos
      const nuevoValorCuotaBase = Math.max(0, nuevoValorPagado - valorSancionActual - valorActividadesActual - valorCuotasPrestamosActual)
      
      datosActualizar = {
        valor_pagado: nuevoValorCuotaBase,
        valor_pagado_sancion: valorSancionActual,
        valor_pagado_actividades: valorActividadesActual,
        estado: nuevoEstado,
        fecha_pago: fechaPagoActualizada
      }
      
      // Solo agregar valor_pagado_cuotas_prestamos si el campo existe en la tabla
      // (puede que no exista en todas las versiones de la BD)
      if (cuotaEditando.value.hasOwnProperty('valor_pagado_cuotas_prestamos')) {
        datosActualizar.valor_pagado_cuotas_prestamos = valorCuotasPrestamosActual
      }
      
      // Agregar tipo_pago si se proporciona
      if (formEditarCuota.tipo_pago) {
        datosActualizar.tipo_pago = formEditarCuota.tipo_pago
      }
      
      // Agregar el nuevo código de comprobante si se generó
      if (nuevoCodigoComprobante) {
        datosActualizar.codigo_comprobante = nuevoCodigoComprobante
        
        // Guardar en historial si había un código anterior (importante: siempre guardar el código anterior en el historial)
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
                motivo: estaPagada ? 'edicion_cuota_pagada' : 'actualizacion_pago',
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
      // Si se generó un nuevo código de comprobante, mostrar el comprobante de modificación
      // El código se genera cuando hay cambios (valor o forma de pago), así que si existe, mostrar el comprobante
      if (nuevoCodigoComprobante) {
        // Obtener información del socio
        const socioNombre = cuotaEditando.value.socio_natillera?.socio?.nombre || 'Socio'
        const socioTelefono = cuotaEditando.value.socio_natillera?.socio?.telefono || null
        
        // Formatear período
        const mesLabel = getMesLabel(cuotaEditando.value.mes)
        let periodo = `${mesLabel} ${cuotaEditando.value.anio}`
        if (cuotaEditando.value.quincena === 1 || cuotaEditando.value.quincena === 2) {
          periodo += ` - Q${cuotaEditando.value.quincena}`
        }
        
        // Formatear fecha
        const fecha = new Date()
        const fechaCorta = fecha.toLocaleDateString('es-CO', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        })
        const fechaCompleta = fecha.toLocaleDateString('es-CO', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        
        // Calcular si cambió la forma de pago
        const tipoPagoAnteriorComprobante = cuotaEditando.value.tipo_pago || 'efectivo'
        const tipoPagoNuevoComprobante = formEditarCuota.tipo_pago || 'efectivo'
        const tipoPagoCambioComprobante = tipoPagoAnteriorComprobante !== tipoPagoNuevoComprobante
        
        // Preparar datos del comprobante de modificación
        modificacionRegistrada.value = {
          cuotaId: cuotaEditando.value.id,
          socioNombre,
          socioTelefono,
          periodo,
          fecha: fechaCompleta,
          fechaCorta,
          codigoNuevo: nuevoCodigoComprobante,
          valorAnterior: valorTotalAnterior,
          valorNuevo: nuevoValorPagado,
          tipoPago: tipoPagoNuevoComprobante,
          tipoPagoAnterior: tipoPagoAnteriorComprobante,
          tipoPagoCambio: tipoPagoCambioComprobante,
          diferencia: nuevoValorPagado - valorTotalAnterior,
          motivo: estaPagada ? 'Edición de cuota pagada' : (tienePagoParcial ? 'Edición de pago parcial' : 'Actualización de pago')
        }
        
      modalEditarCuota.value = false
        // Esperar un momento para que el modal se cierre antes de abrir el nuevo
        await nextTick()
        setTimeout(() => {
          modalModificacion.value = true
        }, 300)
      } else {
        modalEditarCuota.value = false
      }
      
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

// Función para mostrar el modal de confirmación antes de registrar el pago
function mostrarConfirmacionPago() {
  if (!cuotaSeleccionada.value) return

  const totalActividades = getTotalActividadesSeleccionadas()
  const totalCuotasPrestamos = getTotalCuotasPrestamosSeleccionadas()
  const sancion = getSancionCuota(cuotaSeleccionada.value)
  const valorCuota = cuotaSeleccionada.value.valor_cuota || 0
  const valorPagadoAnterior = cuotaSeleccionada.value.valor_pagado || 0
  const valorCuotaPendiente = valorCuota - valorPagadoAnterior
  const totalAdeudado = sancion + totalActividades + totalCuotasPrestamos + valorCuotaPendiente

  let valorPagado
  let distTransferConfirm = null
  if ((formPago.tipo_pago || 'efectivo') === 'transferencia') {
    distTransferConfirm = distribuirTransferenciaPago(totalAdeudado)
    valorPagado = distTransferConfirm.valorAConceptos
  } else {
    valorPagado = formPago.valor || 0
  }

  // Calcular el desglose según el orden de pago (solo monto neto a obligaciones; GMF va al final y no afecta parcial/completo)
  let valorRestante = valorPagado
  let valorSancionPagada = 0
  let valorActividadesPagado = 0
  let valorCuotasPrestamosPagado = 0
  let valorCuotaPagado = 0
  
  // Paso 1: Pagar sanción primero
  if (sancion > 0 && valorRestante > 0) {
    if (valorRestante >= sancion) {
      valorSancionPagada = sancion
      valorRestante -= sancion
    } else {
      valorSancionPagada = valorRestante
      valorRestante = 0
    }
  }
  
  // Paso 2: Pagar actividades segundo
  if (totalActividades > 0 && valorRestante > 0) {
    if (valorRestante >= totalActividades) {
      valorActividadesPagado = totalActividades
      valorRestante -= totalActividades
    } else {
      valorActividadesPagado = valorRestante
      valorRestante = 0
    }
  }
  
  // Paso 3: Pagar cuotas de préstamos tercero
  if (totalCuotasPrestamos > 0 && valorRestante > 0) {
    if (valorRestante >= totalCuotasPrestamos) {
      valorCuotasPrestamosPagado = totalCuotasPrestamos
      valorRestante -= totalCuotasPrestamos
    } else {
      valorCuotasPrestamosPagado = valorRestante
      valorRestante = 0
    }
  }
  
  // Paso 4: Pagar cuota cuarto (con lo que reste)
  if (valorRestante > 0 && valorCuotaPendiente > 0) {
    if (valorRestante >= valorCuotaPendiente) {
      valorCuotaPagado = valorCuotaPendiente
      valorRestante -= valorCuotaPendiente
    } else {
      valorCuotaPagado = valorRestante
      valorRestante = 0
    }
  }

  // Obtener las cuotas de préstamos seleccionadas con sus detalles
  const cuotasPrestamosDetalle = cuotasPrestamosPendientes.value
    .filter(cp => cuotasPrestamosSeleccionadas.value.has(cp.id))
    .map(cp => ({
      nombre: `Cuota préstamo #${cp.numero_cuota}`,
      valor: cp.valor_pendiente || 0,
      numero_cuota: cp.numero_cuota,
      prestamo_id: cp.prestamo_id
    }))

  const esParcial = valorPagado < totalAdeudado
  const pendienteDespuesPago = esParcial ? totalAdeudado - valorPagado : 0

  // Total ya pagado antes (para mostrar "Pagado anteriormente" en la modal)
  const valorPagadoAnteriorTotal = (cuotaSeleccionada.value.valor_pagado || 0) +
    (parseFloat(cuotaSeleccionada.value?.valor_pagado_sancion) || 0) +
    (getActividadesInfoSocio(cuotaSeleccionada.value).pagadas || 0) +
    (getTotalCuotasPrestamosPagadasSocioSync(cuotaSeleccionada.value) || 0)

  const esTransferencia = (formPago.tipo_pago || 'efectivo') === 'transferencia'
  const impuesto4x1000Confirm = esTransferencia && distTransferConfirm ? distTransferConfirm.impuestoGmf : 0
  const valorConsignadoTransferencia = esTransferencia && distTransferConfirm ? distTransferConfirm.brutoConsignado : 0

  // Preparar el desglose para mostrar en el modal
  desglosePagoConfirmacion.value = {
    total: esTransferencia && valorConsignadoTransferencia > 0 ? valorConsignadoTransferencia : valorPagado,
    cuota: valorCuotaPagado,
    sancion: valorSancionPagada,
    actividades: valorActividadesPagado,
    cuotasPrestamos: valorCuotasPrestamosPagado,
    cantidadActividades: actividadesSeleccionadas.value.size,
    cantidadCuotasPrestamos: cuotasPrestamosSeleccionadas.value.size,
    cuotasPrestamosDetalle: cuotasPrestamosDetalle,
    tipoPago: formPago.tipo_pago || 'efectivo',
    valorEfectivo: formPago.tipo_pago === 'efectivo' ? valorPagado : 0,
    valorTransferencia: formPago.tipo_pago === 'transferencia' ? valorPagado : 0,
    impuesto4x1000: impuesto4x1000Confirm,
    valorConsignadoTransferencia,
    esParcial,
    totalAdeudado,
    pendienteDespuesPago,
    valorPagadoAnteriorTotal
  }

  // Mostrar el modal de confirmación
  modalConfirmarPago.value = true
}

// Función para confirmar y ejecutar el registro del pago
async function confirmarYRegistrarPago() {
  // Cerrar el modal de confirmación
  modalConfirmarPago.value = false
  
  // Ejecutar el registro del pago
  await handleRegistrarPago()
}

async function handleRegistrarPago() {
  if (!cuotaSeleccionada.value) return

  // Activar la animación de registro de pago
  mostrandoAnimacionPago.value = true

  const totalActividades = getTotalActividadesSeleccionadas()
  const totalCuotasPrestamos = getTotalCuotasPrestamosSeleccionadas()
  const sancion = getSancionCuota(cuotaSeleccionada.value)
  const valorCuota = cuotaSeleccionada.value.valor_cuota || 0
  const valorPagadoAnterior = cuotaSeleccionada.value.valor_pagado || 0
  const valorCuotaPendiente = valorCuota - valorPagadoAnterior
  const totalAdeudadoPago = sancion + totalActividades + totalCuotasPrestamos + valorCuotaPendiente

  const esPagoTransferencia = (formPago.tipo_pago || 'efectivo') === 'transferencia'
  let valorPagado
  let impuesto4x1000Pago = 0
  let valorConsignadoTransferenciaPago = 0
  if (esPagoTransferencia) {
    const dist = distribuirTransferenciaPago(totalAdeudadoPago)
    valorPagado = dist.valorAConceptos
    impuesto4x1000Pago = dist.impuestoGmf
    valorConsignadoTransferenciaPago = dist.brutoConsignado
  } else {
    valorPagado = formPago.valor || 0
  }

  // IMPORTANTE: Orden de pago según requerimientos:
  // 1. Primero se paga la sanción
  // 2. Segundo se pagan las actividades
  // 3. Tercero se pagan las cuotas de préstamos
  // 4. Cuarto se paga la cuota
  // (Transferencia: el GMF 4×1000 se liquida al final y no cuenta para parcial/completo de la obligación)
  
  let valorRestante = valorPagado
  let valorSancionPagada = 0
  let valorActividadesPagado = 0
  let valorCuotasPrestamosPagado = 0
  let valorCuotaPagado = 0
  
  // Paso 1: Pagar sanción primero
  if (sancion > 0 && valorRestante > 0) {
    if (valorRestante >= sancion) {
      valorSancionPagada = sancion
      valorRestante -= sancion
    } else {
      valorSancionPagada = valorRestante
      valorRestante = 0
    }
  }
  
  // Paso 2: Pagar actividades segundo
  if (totalActividades > 0 && valorRestante > 0) {
    if (valorRestante >= totalActividades) {
      valorActividadesPagado = totalActividades
      valorRestante -= totalActividades
    } else {
      valorActividadesPagado = valorRestante
      valorRestante = 0
    }
  }
  
  // Paso 3: Pagar cuotas de préstamos tercero
  if (totalCuotasPrestamos > 0 && valorRestante > 0) {
    if (valorRestante >= totalCuotasPrestamos) {
      valorCuotasPrestamosPagado = totalCuotasPrestamos
      valorRestante -= totalCuotasPrestamos
    } else {
      valorCuotasPrestamosPagado = valorRestante
      valorRestante = 0
    }
  }
  
  // Paso 4: Pagar cuota cuarto (con lo que reste)
  if (valorRestante > 0 && valorCuotaPendiente > 0) {
    if (valorRestante >= valorCuotaPendiente) {
      valorCuotaPagado = valorCuotaPendiente
      valorRestante -= valorCuotaPendiente
    } else {
      valorCuotaPagado = valorRestante
      valorRestante = 0
    }
  }
  
  const socioNombre = cuotaSeleccionada.value.socio_natillera?.socio?.nombre
  const socioTelefono = cuotaSeleccionada.value.socio_natillera?.socio?.telefono
  const descripcionCuota = cuotaSeleccionada.value.descripcion || formatDate(cuotaSeleccionada.value.fecha_limite)

  // Registrar pago de la cuota (incluye distribución automática de sanción, actividades y cuota)
  const valorEfectivo = formPago.tipo_pago === 'efectivo' ? valorPagado : 0
  const valorTransferencia = formPago.tipo_pago === 'transferencia' ? valorPagado : 0
  const result = await cuotasStore.registrarPago(
    cuotaSeleccionada.value.id,
    valorPagado,
    null, // comprobante
    formPago.tipo_pago,
    totalActividades,
    { valorEfectivo, valorTransferencia, impuesto4x1000: impuesto4x1000Pago }
  )
  
  // Obtener información de actividades pagadas antes de registrar
  let actividadesPagadas = totalActividades > 0 
    ? actividadesPendientes.value
        .filter(a => actividadesSeleccionadas.value.has(a.id))
        .map(a => ({
          id: a.id,
          descripcion: a.actividad?.descripcion || 'Actividad',
          tipo: a.actividad?.tipo || 'otro',
          valor_pendiente: a.valor_pendiente,
          valor_asignado: a.valor_asignado,
          valor_pagado_anterior: a.valor_pagado || 0
        }))
    : []
  
  // Si hay actividades seleccionadas y el pago fue exitoso, registrar pagos de actividades
  // Usar el valor calculado en registrarPago para asegurar consistencia
  const valorActividadesPagadoReal = result.valorActividadesPagado || valorActividadesPagado
  if (result.success && totalActividades > 0 && valorActividadesPagadoReal > 0) {
    await registrarPagosActividades(valorActividadesPagadoReal, formPago.tipo_pago, { valorEfectivo, valorTransferencia, valorPagado })
    
    // Recargar las actividades pagadas con sus códigos de comprobante actualizados
    if (actividadesPagadas.length > 0) {
      try {
        const actividadIds = actividadesPagadas.map(a => a.id)
        const { data: actividadesActualizadas, error: errorActividades } = await supabase
          .from('socios_actividad')
          .select('id, codigo_comprobante, valor_pagado')
          .in('id', actividadIds)
        
        if (!errorActividades && actividadesActualizadas) {
          // Crear un mapa de códigos por ID
          const codigosMap = new Map(
            actividadesActualizadas.map(a => [a.id, a.codigo_comprobante])
          )
          
          // Actualizar actividades pagadas con los códigos de comprobante
          actividadesPagadas = actividadesPagadas.map(a => ({
            ...a,
            codigo_comprobante: codigosMap.get(a.id) || null
          }))
        }
      } catch (e) {
        console.warn('Error recargando códigos de comprobante de actividades:', e)
      }
    }
  }
  
  // Si hay cuotas de préstamos seleccionadas y el pago fue exitoso, registrar pagos de cuotas de préstamos
  if (result.success && totalCuotasPrestamos > 0 && valorCuotasPrestamosPagado > 0) {
    await registrarPagosCuotasPrestamos(valorCuotasPrestamosPagado, formPago.tipo_pago, { valorEfectivo, valorTransferencia, valorPagado })
  }

  if (result.success) {
    // Obtener la cuota actualizada para saber si es parcial o completa
    const cuotaActualizada = result.data
    const valorCuota = cuotaSeleccionada.value.valor_cuota
    const valorPagadoAnterior = cuotaSeleccionada.value.valor_pagado || 0
    // Considerar la sanción al calcular el total a pagar
    const sancion = getSancionCuota(cuotaActualizada || cuotaSeleccionada.value)
    // El valorPagadoTotal y totalAPagar se calcularán después con la suma de los conceptos pagados
    
    // Obtener el código del comprobante
    const codigoComprobante = cuotaActualizada?.codigo_comprobante || null
    console.log('Código de comprobante obtenido:', codigoComprobante)
    console.log('Cuota actualizada completa:', cuotaActualizada)
    
    // Calcular cuánto se pagó de cada concepto según el orden de pago
    // Usar el valor_multa de la cuota actualizada si está disponible (es más preciso)
    // IMPORTANTE: Si la cuota tiene no_calcular_multa marcado, la sanción debe ser 0
    const tieneNoCalcularMulta = cuotaActualizada?.no_calcular_multa || cuotaSeleccionada.value?.no_calcular_multa
    const valorMultaEnBD = tieneNoCalcularMulta ? 0 : (parseFloat(cuotaActualizada?.valor_multa) || 0)
    const sancionTotal = tieneNoCalcularMulta ? 0 : (valorMultaEnBD > 0 ? valorMultaEnBD : sancion)
    
    // Usar los valores calculados en registrarPago para asegurar consistencia
    // IMPORTANTE: Si la cuota tiene no_calcular_multa marcado, forzar valorSancionPagada a 0
    const valorCuotaPagada = result.valorCuotaPagado || valorCuotaPagado
    const valorSancionPagadaCalculada = tieneNoCalcularMulta ? 0 : (result.valorSancionPagada || valorSancionPagada)
    const valorActividadesPagadoFinal = result.valorActividadesPagado || valorActividadesPagado
    const valorCuotasPrestamosPagadoFinal = valorCuotasPrestamosPagado
    
    // Total pagado en ESTA transacción (conceptos; comprobante suma GMF aparte si aplica)
    const valorPagadoEstaTransaccion = (valorCuotaPagada || 0) + (valorSancionPagadaCalculada || 0) + (valorActividadesPagadoFinal || 0) + (valorCuotasPrestamosPagadoFinal || 0)
    const valorPagadoEstaTransaccionConGmf = valorPagadoEstaTransaccion + (esPagoTransferencia ? impuesto4x1000Pago : 0)
    
    // Total pagado ACUMULADO (cuota actualizada + actividades pagadas antes, ya que están en socios_actividad)
    const actividadesPagadasAcumulado = (getActividadesInfoSocio(cuotaSeleccionada.value).pagadas || 0) + (valorActividadesPagadoFinal || 0)
    const valorPagadoAcumulado = (parseFloat(cuotaActualizada?.valor_pagado) || 0) +
      (parseFloat(cuotaActualizada?.valor_pagado_sancion) || 0) +
      actividadesPagadasAcumulado +
      (valorCuotasPrestamosPagadoFinal || 0)
    
    // Calcular el total a pagar incluyendo actividades y cuotas de préstamos (pendientes + ya pagadas, para obligación completa)
    const actividadesInfoPrev = getActividadesInfoSocio(cuotaSeleccionada.value)
    const valorActividadesObligacion = (actividadesInfoPrev.total || 0) + (actividadesInfoPrev.pagadas || 0) || totalActividades || 0
    const valorActividades = totalActividades || 0
    const totalAPagar = valorCuota + sancionTotal + (valorActividadesObligacion || valorActividades) + (totalCuotasPrestamos || 0)
    
    // Calcular pendiente y si es parcial usando el total ACUMULADO (no solo esta transacción)
    const valorPendienteCalculado = Math.max(0, totalAPagar - valorPagadoAcumulado)
    const esParcialCalculado = valorPendienteCalculado > 0
    
    // Si hay sanción pendiente, también calcularla
    const sancionPendiente = Math.max(0, sancionTotal - valorSancionPagadaCalculada)
    
    // Detectar si había un pago parcial anterior y ahora se completa (usar totalAPagar calculado)
    const totalPagadoAntes = (valorPagadoAnterior || 0) + (parseFloat(cuotaSeleccionada.value?.valor_pagado_sancion) || 0) + (getActividadesInfoSocio(cuotaSeleccionada.value).pagadas || 0)
    const teniaPagoParcial = totalPagadoAntes > 0 && totalPagadoAntes < totalAPagar
    const seCompletoPago = !esParcialCalculado && teniaPagoParcial
    
    // Cuando se completa un pago parcial: mostrar comprobante como pago normal (total + desglose completo)
    // IMPORTANTE: Si la cuota tiene no_calcular_multa marcado, no mostrar sanción en el comprobante
    // (tieneNoCalcularMulta ya está declarado arriba)
    const actividadesPagadasAntesComprobante = getActividadesInfoSocio(cuotaSeleccionada.value).pagadas || 0
    const valorParaComprobante = seCompletoPago ? valorPagadoAcumulado : valorPagadoEstaTransaccionConGmf
    const valorCuotaParaComprobante = seCompletoPago ? valorCuota : valorCuotaPagada
    const valorSancionParaComprobante = tieneNoCalcularMulta ? 0 : (seCompletoPago ? sancionTotal : valorSancionPagadaCalculada)
    // Al completar parcial: incluir actividades del 1er pago + las pagadas en este (para que aparezcan en conceptos)
    const valorActividadesParaComprobante = seCompletoPago 
      ? (actividadesPagadasAntesComprobante + (valorActividadesPagadoFinal || 0)) 
      : valorActividadesPagadoFinal
    const valorCuotasPrestamosParaComprobante = valorCuotasPrestamosPagadoFinal || 0
    
    // Para comprobante al completar: incluir actividades de actividadesPendientesPorSocio (tienen descripcion, valor)
    let actividadesParaConceptos = actividadesPagadas
    if (seCompletoPago && valorActividadesParaComprobante > 0 && actividadesPagadas.length === 0) {
      const datosAct = actividadesPendientesPorSocio.value[cuotaSeleccionada.value.id]
      if (datosAct?.actividades?.length > 0) {
        // Incluir actividades pagadas (valor_pagado>0) o pendientes (valor_pendiente>0) para mostrar en conceptos
        actividadesParaConceptos = datosAct.actividades
          .filter(a => (a.valor_pagado || 0) > 0 || (a.valor_pendiente || 0) > 0)
          .map(a => ({
            descripcion: a.descripcion,
            valor_pendiente: (a.valor_pendiente || 0) > 0 ? (a.valor_pendiente || 0) : (a.valor_pagado || 0),
            valor_pagado_anterior: a.valor_pagado || 0,
            valor_asignado: a.valor_asignado || 0
          }))
      }
    }
    
    // Obtener las cuotas de préstamos pagadas para mostrar en conceptos
    let cuotasPrestamosParaConceptos = []
    if (valorCuotasPrestamosParaComprobante > 0) {
      const cuotasPrestamosPagadas = cuotasPrestamosPendientes.value
        .filter(cp => cuotasPrestamosSeleccionadas.value.has(cp.id))
        .map(cp => ({
          nombre: `Cuota préstamo #${cp.numero_cuota}`,
          valor: cp.valor_pendiente || 0,
          numero_cuota: cp.numero_cuota,
          prestamo_id: cp.prestamo_id
        }))
      cuotasPrestamosParaConceptos = cuotasPrestamosPagadas
    }
    
    // Historial de pagos: obtenerlo siempre desde la tabla historial_pagos_cuota (fuente de verdad)
    let historialPagos = []
    try {
      const { data: historialRows } = await supabase
        .from('historial_pagos_cuota')
        .select('fecha_pago, forma_pago, valor_total, valor_cuota, valor_sancion, valor_actividades, valor_cuotas_prestamo, impuesto_4x1000')
        .eq('cuota_id', cuotaSeleccionada.value.id)
        .order('fecha_pago', { ascending: true })
      if (historialRows && historialRows.length > 0) {
        historialPagos = historialRows.map((row, idx) => {
          const conceptos = []
          if ((row.valor_cuota || 0) > 0) conceptos.push({ nombre: 'Cuota', valor: row.valor_cuota })
          if ((row.valor_sancion || 0) > 0 && !tieneNoCalcularMulta) conceptos.push({ nombre: 'Sanción', valor: row.valor_sancion })
          if ((row.valor_actividades || 0) > 0) conceptos.push({ nombre: 'Actividades', valor: row.valor_actividades })
          if ((row.valor_cuotas_prestamo || 0) > 0) conceptos.push({ nombre: 'Cuotas de préstamos', valor: row.valor_cuotas_prestamo })
          const impH = leerImpuesto4x1000DesdeHistorial(row)
          if (impH > 0) conceptos.push({ nombre: '4×1000 (GMF)', valor: impH })
          const formaPago = (row.forma_pago || 'efectivo').toLowerCase()
          const formaPagoTexto = formaPago === 'transferencia' ? 'Transferencia' : formaPago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'
          const fecha = row.fecha_pago
            ? new Date(row.fecha_pago).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A'
          const total = conceptos.reduce((sum, c) => sum + (parseFloat(c.valor) || 0), 0)
          return {
            pago: idx + 1,
            fecha,
            conceptos,
            total,
            formaPago,
            formaPagoTexto
          }
        })
      }
    } catch (eHist) {
      console.warn('No se pudo cargar historial_pagos_cuota para comprobante:', eHist.message)
    }
    
    // Guardar info del pago para el modal de confirmación
    pagoRegistrado.value = {
      cuotaId: cuotaSeleccionada.value.id, // ID de la cuota para auditoría
      socioNombre,
      socioTelefono,
      valor: valorParaComprobante, // Total (si completó parcial) o esta transacción
      valorCuota,
      valorPagadoTotal: valorPagadoAcumulado, // Total pagado acumulado (para resumen parcial)
      valorPendiente: valorPendienteCalculado,
      esParcial: esParcialCalculado,
      periodo: obtenerPeriodoComprobante(cuotaSeleccionada.value), // Período limpio (sin texto de ajustes)
      descripcionCuota,
      codigoComprobante, // Código único del comprobante
      sancion: tieneNoCalcularMulta ? 0 : sancionTotal, // Sanción total (pagada + pendiente), 0 si no_calcular_multa está marcado
      valorSancionPagada: valorSancionParaComprobante, // Para comprobante: total si completó, o de esta transacción (ya verifica no_calcular_multa)
      valorActividadesPagado: valorActividadesParaComprobante, // Para comprobante: total si completó, o de esta transacción
      valorCuotasPrestamosPagado: valorCuotasPrestamosParaComprobante, // Para comprobante: cuotas de préstamos pagadas
      valorCuotaPagada: valorCuotaParaComprobante, // Para comprobante: total si completó, o de esta transacción
      tieneSancion: !tieneNoCalcularMulta && sancionTotal > 0, // Indica si hay sanción (verifica no_calcular_multa)
      tipoPago: formPago.tipo_pago || 'efectivo', // Tipo de pago (efectivo o transferencia)
      valorEfectivo, // Total de esta transacción en efectivo
      valorTransferencia: esPagoTransferencia ? valorConsignadoTransferenciaPago : 0, // Bruto consignado (incluye GMF si lo pagó)
      impuesto4x1000: esPagoTransferencia ? impuesto4x1000Pago : 0,
      valorConsignadoTransferencia: esPagoTransferencia ? valorConsignadoTransferenciaPago : null,
      fecha: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fechaCorta: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hora: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      // Información del pago parcial anterior (si existía)
      teniaPagoParcial: seCompletoPago,
      valorPagoAnterior: seCompletoPago ? totalPagadoAntes : (esParcialCalculado ? Math.max(0, valorPagadoAcumulado - valorPagadoEstaTransaccion) : null),
      valorPagadoAnteriorTotal: seCompletoPago ? totalPagadoAntes : (esParcialCalculado ? Math.max(0, valorPagadoAcumulado - valorPagadoEstaTransaccion) : 0),
      valorActividades: valorActividades, // Total de actividades a pagar
      fechaPagoAnterior: seCompletoPago && cuotaSeleccionada.value.fecha_pago 
        ? new Date(cuotaSeleccionada.value.fecha_pago).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : null,
      // Información de actividades pagadas
      tieneActividades: totalActividades > 0 || valorActividadesParaComprobante > 0,
      valorActividades: totalActividades,
      cantidadActividades: actividadesSeleccionadas.value.size,
      actividadesPagadas: actividadesParaConceptos.length > 0 ? actividadesParaConceptos : actividadesPagadas,
      // Información de cuotas de préstamos pagadas
      tieneCuotasPrestamos: valorCuotasPrestamosParaComprobante > 0,
      cantidadCuotasPrestamos: cuotasPrestamosParaConceptos.length,
      cuotasPrestamosPagadas: cuotasPrestamosParaConceptos,
      // Historial de pagos cuando se completa un parcial (para sección en comprobante)
      historialPagos
    }
    
    console.log('pagoRegistrado.value completo:', pagoRegistrado.value)
    
    // Persistir el desglose real del historial para que al reenviar se muestren los valores correctos (no proporciones)
    if (seCompletoPago && historialPagos.length >= 2) {
      const historialId = result.insertedHistorialComprobanteId
      if (historialId) {
        try {
          await supabase
            .from('historial_comprobantes')
            .update({ historial_pagos: historialPagos })
            .eq('id', historialId)
        } catch (e) {
          console.warn('No se pudo guardar desglose del historial de pagos:', e)
        }
      } else {
        try {
          const cuotaIdGuardar = cuotaSeleccionada.value.id
          const { data: ultimoHistorial, error: errSel } = await supabase
            .from('historial_comprobantes')
            .select('id')
            .eq('cuota_id', cuotaIdGuardar)
            .eq('motivo', 'completar_pago_parcial')
            .order('fecha_actualizacion', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (!errSel && ultimoHistorial?.id) {
            await supabase
              .from('historial_comprobantes')
              .update({ historial_pagos: historialPagos })
              .eq('id', ultimoHistorial.id)
          }
        } catch (e) {
          console.warn('No se pudo guardar desglose del historial de pagos:', e)
        }
      }
    }
    
    // Cerrar modal de pago y desactivar animación
    modalPago.value = false
    mostrandoAnimacionPago.value = false
    modalConfirmacion.value = true
    cuotaSeleccionada.value = null
    // Reiniciar formulario y limpiar selección de actividades
    formPago.valor = 0
    formPago.tipo_pago = 'efectivo'
    formPago.aplicaImpuesto4x1000 = false
    actividadesSeleccionadas.value.clear()
    
    // Recargar cuotas para actualizar el resumen
    await cuotasStore.fetchCuotasNatillera(id)
    
    // Recalcular sanciones dinámicas después de registrar el pago
    await recalcularSancionesMes()
    
    // Recargar actividades pendientes por socio si está en vista agrupada
    if (vistaAgrupada.value) {
      await cargarActividadesPendientesPorSocio()
    }
  } else {
    // Si hay error, desactivar la animación
    mostrandoAnimacionPago.value = false
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
      const historialPagos = pagoRegistrado.value?.historialPagos || []
      const codigoComprobante = pagoRegistrado.value?.codigoComprobante
      const tieneSancion = pagoRegistrado.value?.tieneSancion && pagoRegistrado.value?.valorSancionPagada > 0
      const tieneActividades = pagoRegistrado.value?.tieneActividades && pagoRegistrado.value?.actividadesPagadas?.length > 0
      const cantidadActividades = tieneActividades ? pagoRegistrado.value.actividadesPagadas.length : 0
      // Contar actividades con códigos de comprobante para ajustar altura
      const actividadesConCodigo = tieneActividades 
        ? pagoRegistrado.value.actividadesPagadas.filter(a => a.codigo_comprobante).length 
        : 0
      const width = 480
      // Altura compacta: base más pequeña, secciones más compactas + espacio para header con chulo
      let height = 550 // Base más compacta + espacio para header
      // Agregar espacio para pago parcial si aplica
      if (esParcial) {
        height += 80
      }
      // Agregar espacio para historial de pagos (solo varios abonos; altura según líneas de conceptos)
      if (historialPagos.length > 1) {
        let histExtra = 22 + 10
        historialPagos.forEach((item) => {
          const n = (item.conceptos || []).length
          histExtra += 22 + n * 12 + 18
        })
        height += histExtra
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
      // Chulo verde y título "Comprobante de Pago"
      const headerY = 40
      const chuloSize = 48
      const chuloX = width / 2 - 100
      const chuloY = headerY
      
      // Círculo verde con gradiente para el chulo
      const chuloGradient = ctx.createRadialGradient(chuloX + chuloSize/2, chuloY + chuloSize/2, 0, chuloX + chuloSize/2, chuloY + chuloSize/2, chuloSize/2)
      chuloGradient.addColorStop(0, '#10b981')
      chuloGradient.addColorStop(1, '#059669')
      ctx.fillStyle = chuloGradient
      ctx.beginPath()
      ctx.arc(chuloX + chuloSize/2, chuloY + chuloSize/2, chuloSize/2, 0, Math.PI * 2)
      ctx.fill()
      
      // Sombra del chulo
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.beginPath()
      ctx.arc(chuloX + chuloSize/2, chuloY + chuloSize/2, chuloSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      // Checkmark blanco dentro del círculo
      ctx.strokeStyle = 'white'
      ctx.fillStyle = 'white'
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(chuloX + chuloSize/2 - 10, chuloY + chuloSize/2)
      ctx.lineTo(chuloX + chuloSize/2 - 4, chuloY + chuloSize/2 + 6)
      ctx.lineTo(chuloX + chuloSize/2 + 10, chuloY + chuloSize/2 - 8)
      ctx.stroke()
      
      // Título "Comprobante de Pago"
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Comprobante de Pago', chuloX + chuloSize + 16, chuloY + 32)
      
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
      ctx.moveTo(32, headerY + chuloSize + 15)
      ctx.lineTo(width - 32, headerY + chuloSize + 15)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = headerY + chuloSize + 35
      // Altura compacta de la tarjeta
      let cardHeight = height - cardY - 20 // Altura dinámica basada en el contenido total
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
      
      // === SECCIÓN 1: INFORMACIÓN DEL PAGO ===
      let currentY = cardY + 20
      
      // Etiqueta "MONTO PAGADO"
      ctx.fillStyle = '#6b7280'
      ctx.font = 'bold 9px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('MONTO PAGADO', width/2, currentY + 12)
      
      // Valor pagado
      const valorText = '$' + formatMoney(pagoRegistrado.value?.valor)
      ctx.font = 'bold 40px Arial'
      const valorGradient = ctx.createLinearGradient(0, currentY, 0, currentY + 50)
      valorGradient.addColorStop(0, '#059669')
      valorGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = valorGradient
      ctx.textAlign = 'center'
      ctx.fillText(valorText, width/2, currentY + 50)
      
      // Desglose por forma de pago (si existe)
      const vEf = pagoRegistrado.value?.valorEfectivo || 0
      const vTr = pagoRegistrado.value?.valorTransferencia || 0
      if (vEf > 0 || vTr > 0) {
        currentY += 30
        ctx.font = '9px Arial'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#4b5563'
        const partes = []
        if (vEf > 0) partes.push('Efectivo: $' + formatMoney(vEf))
        if (vTr > 0) partes.push('Transferencia: $' + formatMoney(vTr))
        ctx.fillText(partes.join('   ·   '), width/2, currentY + 4)
      }
      
      // Estado del pago
      currentY += 30
      const estadoBadgeY = currentY
      const esParcialEstado = pagoRegistrado.value?.esParcial || false
      ctx.fillStyle = esParcialEstado ? '#fef3c7' : '#dcfce7'
      ctx.beginPath()
      ctx.roundRect(width/2 - 55, estadoBadgeY, 110, 24, 12)
      ctx.fill()
      
      ctx.fillStyle = esParcialEstado ? '#f59e0b' : '#059669'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(esParcialEstado ? 'PAGO PARCIAL' : 'PAGO COMPLETO', width/2, estadoBadgeY + 16)
      
      // Código de comprobante sutil debajo del estado
      if (codigoComprobante) {
        ctx.fillStyle = '#9ca3af'
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(codigoComprobante, width/2, estadoBadgeY + 38)
      }
      
      // Grid compacto: Socio, Período, Fecha, Forma de pago
      currentY += 35
      const gridY = currentY
      const gridItemHeight = 35
      const gridItemWidth = (cardInnerWidth - 20) / 2
      
      // Socio
      ctx.fillStyle = '#9ca3af'
      ctx.font = '8px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 10, gridY + 12)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px Arial'
      const socioNombre = pagoRegistrado.value?.socioNombre || 'Socio'
      const maxSocioWidth = gridItemWidth - 20
      let socioTexto = socioNombre
      if (ctx.measureText(socioTexto).width > maxSocioWidth) {
        while (ctx.measureText(socioTexto + '...').width > maxSocioWidth && socioTexto.length > 0) {
          socioTexto = socioTexto.slice(0, -1)
        }
        socioTexto += '...'
      }
      ctx.fillText(socioTexto, cardInnerX + 10, gridY + 25)
      
      // Período
      ctx.fillStyle = '#9ca3af'
      ctx.font = '8px Arial'
      ctx.fillText('PERÍODO', cardInnerX + 10 + gridItemWidth, gridY + 12)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px Arial'
      const periodoTexto = (pagoRegistrado.value?.periodo || 'N/A').substring(0, 25)
      ctx.fillText(periodoTexto, cardInnerX + 10 + gridItemWidth, gridY + 25)
      
      // Fecha
      ctx.fillStyle = '#9ca3af'
      ctx.font = '8px Arial'
      ctx.fillText('FECHA', cardInnerX + 10, gridY + gridItemHeight + 12)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px Arial'
      const fechaTexto = pagoRegistrado.value?.fecha || pagoRegistrado.value?.fechaCorta || 'N/A'
      // Si la fecha contiene un salto de línea, dividirla en dos líneas
      if (fechaTexto.includes('\n')) {
        const [fechaParte, horaParte] = fechaTexto.split('\n')
        ctx.fillText(fechaParte, cardInnerX + 10, gridY + gridItemHeight + 22)
        ctx.font = 'bold 10px Arial'
        ctx.fillText(horaParte, cardInnerX + 10, gridY + gridItemHeight + 32)
      } else {
        ctx.font = 'bold 12px Arial'
        ctx.fillText(fechaTexto, cardInnerX + 10, gridY + gridItemHeight + 25)
      }
      
      // Forma de pago
      ctx.fillStyle = '#9ca3af'
      ctx.font = '8px Arial'
      ctx.fillText('FORMA DE PAGO', cardInnerX + 10 + gridItemWidth, gridY + gridItemHeight + 12)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 12px Arial'
      const tipoPagoTexto = pagoRegistrado.value?.tipoPago === 'transferencia' ? 'Transferencia' : 'Efectivo'
      ctx.fillText(tipoPagoTexto, cardInnerX + 10 + gridItemWidth, gridY + gridItemHeight + 25)
      
      currentY = gridY + gridItemHeight * 2 + 15
      
      // === SECCIÓN 2: CONCEPTOS PAGADOS ===
      const conceptosY = currentY
      const conceptosHeight = 60
      
      // Fondo de la sección
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, conceptosY, cardInnerWidth, conceptosHeight, 12)
      ctx.fill()
      
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, conceptosY, cardInnerWidth, conceptosHeight, 12)
      ctx.stroke()
      
      // Título
      ctx.fillStyle = '#6b7280'
      ctx.font = 'bold 9px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONCEPTOS PAGADOS', cardInnerX + 10, conceptosY + 15)
      
      // Conceptos en fila compacta
      let conceptoX = cardInnerX + 10
      const conceptoSpacing = 8
      const conceptoItemHeight = 35
      const conceptoY = conceptosY + 22
      
      // Cuota
      if (pagoRegistrado.value?.valorCuotaPagada > 0) {
        ctx.fillStyle = '#f0fdf4'
        ctx.beginPath()
        ctx.roundRect(conceptoX, conceptoY, 100, conceptoItemHeight, 8)
        ctx.fill()
        ctx.strokeStyle = '#bbf7d0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(conceptoX, conceptoY, 100, conceptoItemHeight, 8)
        ctx.stroke()
        
        ctx.fillStyle = '#065f46'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Cuota', conceptoX + 8, conceptoY + 14)
        ctx.font = 'bold 12px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorCuotaPagada || 0), conceptoX + 8, conceptoY + 28)
        conceptoX += 108
      }
      
      // Sanción
      if (tieneSancion) {
        ctx.fillStyle = '#fef2f2'
        ctx.beginPath()
        ctx.roundRect(conceptoX, conceptoY, 100, conceptoItemHeight, 8)
        ctx.fill()
        ctx.strokeStyle = '#fecaca'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(conceptoX, conceptoY, 100, conceptoItemHeight, 8)
        ctx.stroke()
        
        // Icono de sanción: círculo rojo con signo de admiración
        const iconX = conceptoX + 8
        const iconY = conceptoY + 8
        const iconSize = 14
        
        // Círculo de fondo rojo con gradiente
        const iconGradient = ctx.createRadialGradient(iconX + iconSize/2, iconY + iconSize/2, 0, iconX + iconSize/2, iconY + iconSize/2, iconSize/2)
        iconGradient.addColorStop(0, '#ef4444')
        iconGradient.addColorStop(1, '#dc2626')
        ctx.fillStyle = iconGradient
        ctx.beginPath()
        ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2)
        ctx.fill()
        
        // Sombra sutil
        ctx.shadowColor = 'rgba(220, 38, 38, 0.3)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 2
        ctx.beginPath()
        ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Signo de admiración blanco
        ctx.fillStyle = 'white'
        ctx.font = 'bold 11px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('!', iconX + iconSize/2, iconY + iconSize/2 + 4)
        
        // Texto "Sanción"
        ctx.fillStyle = '#991b1b'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('Sanción', iconX + iconSize + 6, conceptoY + 14)
        ctx.font = 'bold 12px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorSancionPagada || 0), conceptoX + 8, conceptoY + 28)
        conceptoX += 108
      }
      
      // Actividades - Mostrar cada una en su propia tarjeta o total si no hay detalle
      const tieneActividadesParaMostrar = tieneActividades || (pagoRegistrado.value?.valorActividadesPagado || 0) > 0
      const valorActividadesTotal = pagoRegistrado.value?.valorActividadesPagado || 0
      let actividadX = conceptoX
      let actividadY = conceptoY
      const actividadWidth = 100
      const actividadHeight = conceptoItemHeight
      const actividadSpacing = 8
      
      if (tieneActividadesParaMostrar) {
        // Mostrar todas las actividades pagadas (ya están filtradas en reenviarComprobante)
        const actividades = (pagoRegistrado.value?.actividadesPagadas || []).filter(a => a)
        
        (actividades.length > 0 ? actividades : [{ descripcion: 'Actividades', valor_pendiente: valorActividadesTotal, valor_asignado: valorActividadesTotal, valor_pagado_anterior: 0 }]).forEach((actividad, index) => {
          if (!actividad) return
          
          // Si no cabe en la fila actual, pasar a la siguiente
          if (actividadX + actividadWidth > cardInnerX + cardInnerWidth - 10) {
            actividadX = cardInnerX + 10
            actividadY += actividadHeight + actividadSpacing
          }
          
          const descripcionCompleta = actividad?.descripcion || actividad?.actividad?.descripcion || 'Actividad'
          let descripcionActividad = descripcionCompleta.split(' - ')[0].trim() || 'Actividad'
          
          // Truncar si es muy larga
          const maxWidth = actividadWidth - 16
          ctx.font = 'bold 10px Arial'
          if (ctx.measureText(descripcionActividad).width > maxWidth) {
            while (ctx.measureText(descripcionActividad + '...').width > maxWidth && descripcionActividad.length > 0) {
              descripcionActividad = descripcionActividad.slice(0, -1)
            }
            descripcionActividad += '...'
          }
          
          const valorActividad = (actividad?.valor_pendiente || 0) || (actividad?.valor_asignado || 0)
          
          // Fondo
          ctx.fillStyle = '#faf5ff'
          ctx.beginPath()
          ctx.roundRect(actividadX, actividadY, actividadWidth, actividadHeight, 8)
          ctx.fill()
          ctx.strokeStyle = '#e9d5ff'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.roundRect(actividadX, actividadY, actividadWidth, actividadHeight, 8)
          ctx.stroke()
          
          // Texto
          ctx.fillStyle = '#6b21a8'
          ctx.font = 'bold 10px Arial'
          ctx.textAlign = 'left'
          ctx.fillText(descripcionActividad, actividadX + 8, actividadY + 14)
          ctx.font = 'bold 12px Arial'
          ctx.fillText('$' + formatMoney(valorActividad), actividadX + 8, actividadY + 28)
          
          actividadX += actividadWidth + actividadSpacing
        })
      }
      
      // Cuotas de préstamos - Mostrar cada una en su propia tarjeta o total si no hay detalle
      const tieneCuotasPrestamosParaMostrar = pagoRegistrado.value?.tieneCuotasPrestamos || (pagoRegistrado.value?.valorCuotasPrestamosPagado || 0) > 0
      const valorCuotasPrestamosTotal = pagoRegistrado.value?.valorCuotasPrestamosPagado || 0
      
      if (tieneCuotasPrestamosParaMostrar) {
        const cuotasPrestamos = (pagoRegistrado.value?.cuotasPrestamosPagadas || []).filter(cp => cp)
        
        (cuotasPrestamos.length > 0 ? cuotasPrestamos : [{ nombre: 'Cuotas de préstamos', valor: valorCuotasPrestamosTotal }]).forEach((cuotaPrestamo, index) => {
          if (!cuotaPrestamo) return
          
          // Si no cabe en la fila actual, pasar a la siguiente
          if (actividadX + actividadWidth > cardInnerX + cardInnerWidth - 10) {
            actividadX = cardInnerX + 10
            actividadY += actividadHeight + actividadSpacing
          }
          
          let nombreCuotaPrestamo = cuotaPrestamo.nombre || `Cuota préstamo #${cuotaPrestamo.numero_cuota || ''}`
          
          // Truncar si es muy larga
          const maxWidth = actividadWidth - 16
          ctx.font = 'bold 10px Arial'
          if (ctx.measureText(nombreCuotaPrestamo).width > maxWidth) {
            while (ctx.measureText(nombreCuotaPrestamo + '...').width > maxWidth && nombreCuotaPrestamo.length > 0) {
              nombreCuotaPrestamo = nombreCuotaPrestamo.slice(0, -1)
            }
            nombreCuotaPrestamo += '...'
          }
          
          const valorCuotaPrestamo = cuotaPrestamo.valor || 0
          
          // Fondo
          ctx.fillStyle = '#eff6ff'
          ctx.beginPath()
          ctx.roundRect(actividadX, actividadY, actividadWidth, actividadHeight, 8)
          ctx.fill()
          ctx.strokeStyle = '#bfdbfe'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.roundRect(actividadX, actividadY, actividadWidth, actividadHeight, 8)
          ctx.stroke()
          
          // Texto
          ctx.fillStyle = '#1e40af'
          ctx.font = 'bold 10px Arial'
          ctx.textAlign = 'left'
          ctx.fillText(nombreCuotaPrestamo, actividadX + 8, actividadY + 14)
          ctx.font = 'bold 12px Arial'
          ctx.fillText('$' + formatMoney(valorCuotaPrestamo), actividadX + 8, actividadY + 28)
          
          actividadX += actividadWidth + actividadSpacing
        })
      }

      // GMF 4×1000: total en CONCEPTOS (misma lógica que el modal); con varios abonos el detalle sigue en Historial
      const impuestoGmfCanvas = parseFloat(pagoRegistrado.value?.impuesto4x1000) || 0
      const mostrarGmfEnBloqueConceptos = impuestoGmfCanvas > 0
      if (mostrarGmfEnBloqueConceptos) {
        if (actividadX + actividadWidth > cardInnerX + cardInnerWidth - 10) {
          actividadX = cardInnerX + 10
          actividadY += actividadHeight + actividadSpacing
        }
        ctx.fillStyle = '#f0f9ff'
        ctx.beginPath()
        ctx.roundRect(actividadX, actividadY, actividadWidth, actividadHeight, 8)
        ctx.fill()
        ctx.strokeStyle = '#7dd3fc'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(actividadX, actividadY, actividadWidth, actividadHeight, 8)
        ctx.stroke()
        ctx.fillStyle = '#0c4a6e'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('4×1000 (GMF)', actividadX + 8, actividadY + 14)
        ctx.font = 'bold 12px Arial'
        ctx.fillText('$' + formatMoney(impuestoGmfCanvas), actividadX + 8, actividadY + 28)
        actividadX += actividadWidth + actividadSpacing
      }
      
      // Ajustar altura de la sección si hay múltiples filas
      if (actividadY > conceptoY) {
        const alturaExtra = actividadY - conceptoY
        conceptosHeight = Math.max(conceptosHeight, alturaExtra + conceptoItemHeight + 10)
      }
      
      currentY = conceptosY + conceptosHeight + 10
      
      // === SECCIÓN 2B: HISTORIAL DE PAGOS (solo cuando hay más de 1 pago para la cuota) ===
      if (historialPagos.length > 1) {
        const historialY = currentY
        let historialHeight = 22
        historialPagos.forEach((item) => {
          const n = (item.conceptos || []).length
          historialHeight += 22 + n * 12 + 18
        })
        historialHeight += 10
        
        ctx.fillStyle = '#f8fafc'
        ctx.beginPath()
        ctx.roundRect(cardInnerX, historialY, cardInnerWidth, historialHeight, 12)
        ctx.fill()
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(cardInnerX, historialY, cardInnerWidth, historialHeight, 12)
        ctx.stroke()
        
        ctx.fillStyle = '#64748b'
        ctx.font = 'bold 9px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('HISTORIAL DE PAGOS', cardInnerX + 10, historialY + 15)
        
        let itemTop = historialY + 22
        historialPagos.forEach((item) => {
          const tituloPago = item.formaPagoTexto
            ? `${item.pago}° Pago (${item.formaPagoTexto})`
            : `${item.pago}° Pago`
          ctx.fillStyle = '#475569'
          ctx.font = 'bold 9px Arial'
          ctx.textAlign = 'left'
          ctx.fillText(tituloPago, cardInnerX + 10, itemTop + 8)
          ctx.font = '8px Arial'
          ctx.fillStyle = '#94a3b8'
          ctx.textAlign = 'right'
          ctx.fillText(item.fecha || '', cardInnerX + cardInnerWidth - 10, itemTop + 8)
          ctx.textAlign = 'left'
          const conceptos = item.conceptos || []
          let cy = itemTop + 20
          ctx.fillStyle = '#64748b'
          ctx.font = '9px Arial'
          conceptos.forEach((c) => {
            const linea = `${c.nombre}: $${formatMoney(c.valor)}`
            const texto = linea.length > 52 ? linea.substring(0, 49) + '...' : linea
            ctx.fillText(texto, cardInnerX + 10, cy)
            cy += 12
          })
          ctx.fillStyle = '#059669'
          ctx.font = 'bold 10px Arial'
          ctx.textAlign = 'right'
          ctx.fillText('Total: $' + formatMoney(item.total), cardInnerX + cardInnerWidth - 10, cy + 4)
          ctx.textAlign = 'left'
          itemTop = cy + 22
        })
        
        currentY = historialY + historialHeight + 10
      }
      
      // === SECCIÓN 3: RESUMEN DE PAGO PARCIAL ===
      if (esParcial) {
        const infoParcialY = currentY
        const infoParcialHeight = 70
        
        // Fondo de la sección
        ctx.fillStyle = '#fef3c7'
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoParcialY, cardInnerWidth, infoParcialHeight, 12)
        ctx.fill()
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(cardInnerX, infoParcialY, cardInnerWidth, infoParcialHeight, 12)
        ctx.stroke()
        
        // Título
        ctx.fillStyle = '#92400e'
        ctx.font = 'bold 9px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('RESUMEN PARCIAL', cardInnerX + 10, infoParcialY + 15)
        
        // Total a pagar = obligación completa (cuota + sanción + actividades)
        const totalObligacion = (pagoRegistrado.value?.valorCuota || 0) + 
          (tieneSancion ? (pagoRegistrado.value?.sancion || 0) : 0) + 
          (tieneActividades ? (pagoRegistrado.value?.valorActividades || 0) : 0)
        
        // Grid: Total a Pagar y Total Pagado
        const gridParcialY = infoParcialY + 22
        const gridItemWidth = (cardInnerWidth - 30) / 2
        
        // Total a Pagar (obligación completa)
        ctx.fillStyle = '#92400e'
        ctx.font = '8px Arial'
        ctx.fillText('TOTAL A PAGAR', cardInnerX + 10, gridParcialY + 10)
        ctx.fillStyle = '#78350f'
        ctx.font = 'bold 13px Arial'
        ctx.fillText('$' + formatMoney(totalObligacion), cardInnerX + 10, gridParcialY + 25)
        
        // Total Pagado
        ctx.fillStyle = '#92400e'
        ctx.font = '8px Arial'
        ctx.textAlign = 'right'
        ctx.fillText('TOTAL PAGADO', cardInnerX + cardInnerWidth - 10, gridParcialY + 10)
        ctx.fillStyle = '#059669'
        ctx.font = 'bold 13px Arial'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorPagadoTotal || 0), cardInnerX + cardInnerWidth - 10, gridParcialY + 25)
        
        // Línea divisoria
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cardInnerX + 10, gridParcialY + 32)
        ctx.lineTo(cardInnerX + cardInnerWidth - 10, gridParcialY + 32)
        ctx.stroke()
        
        // Pendiente
        ctx.fillStyle = '#92400e'
        ctx.font = 'bold 9px Arial'
        ctx.textAlign = 'left'
        ctx.fillText('PENDIENTE', cardInnerX + 10, gridParcialY + 45)
        ctx.fillStyle = '#f97316'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'right'
        ctx.fillText('$' + formatMoney(pagoRegistrado.value?.valorPendiente || 0), cardInnerX + cardInnerWidth - 10, gridParcialY + 45)
        
        currentY = infoParcialY + infoParcialHeight + 10
      }
      
      // === FOOTER ===
      const footerY = currentY + 8
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cardInnerX, footerY)
      ctx.lineTo(cardInnerX + cardInnerWidth, footerY)
      ctx.stroke()
      
      // Puntos decorativos
      const puntoSize = 3
      const puntoY = footerY + 14
      const textoFooter = 'Natillerapp'
      const textoWidth = ctx.measureText(textoFooter).width
      const puntoSpacing = 8
      
      // Punto izquierdo
      const puntoGradient1 = ctx.createRadialGradient(width/2 - textoWidth/2 - puntoSpacing, puntoY, 0, width/2 - textoWidth/2 - puntoSpacing, puntoY, puntoSize/2)
      puntoGradient1.addColorStop(0, '#10b981')
      puntoGradient1.addColorStop(1, '#059669')
      ctx.fillStyle = puntoGradient1
      ctx.beginPath()
      ctx.arc(width/2 - textoWidth/2 - puntoSpacing, puntoY, puntoSize/2, 0, Math.PI * 2)
      ctx.fill()
      
      // Sombra del punto izquierdo
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.beginPath()
      ctx.arc(width/2 - textoWidth/2 - puntoSpacing, puntoY, puntoSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      // Texto "Natillerapp" con gradiente
      const textoGradient = ctx.createLinearGradient(width/2 - textoWidth/2, footerY + 10, width/2 + textoWidth/2, footerY + 20)
      textoGradient.addColorStop(0, '#10b981')
      textoGradient.addColorStop(1, '#059669')
      ctx.fillStyle = textoGradient
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(textoFooter, width/2, footerY + 18)
      
      // Punto derecho
      const puntoGradient2 = ctx.createRadialGradient(width/2 + textoWidth/2 + puntoSpacing, puntoY, 0, width/2 + textoWidth/2 + puntoSpacing, puntoY, puntoSize/2)
      puntoGradient2.addColorStop(0, '#10b981')
      puntoGradient2.addColorStop(1, '#059669')
      ctx.fillStyle = puntoGradient2
      ctx.beginPath()
      ctx.arc(width/2 + textoWidth/2 + puntoSpacing, puntoY, puntoSize/2, 0, Math.PI * 2)
      ctx.fill()
      
      // Sombra del punto derecho
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.beginPath()
      ctx.arc(width/2 + textoWidth/2 + puntoSpacing, puntoY, puntoSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      
      currentY = footerY + 24
      
      // Actualizar altura de la tarjeta
      cardHeight = currentY - cardY + 10
      
      // === BOTÓN DE CONFIRMACIÓN ===
      // Actualizar altura total del canvas
      height = currentY + 80
      canvas.height = height * scale
      
      // El botón debe quedar fuera de la tarjeta blanca, al final
      const btnY = currentY + 10
      
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
    // Usar html-to-image para capturar el HTML directamente (mejor soporte para colores modernos)
    console.log('Capturando comprobante HTML...')
    
    const dataUrl = await toPng(comprobanteRef.value, {
      backgroundColor: '#ecfdf5',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })
    
    console.log('Imagen generada, iniciando descarga...')
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
  if (!pagoRegistrado.value || !comprobanteRef.value) return
  
  generandoImagen.value = true
  
  try {
    // Usar html-to-image para capturar el HTML directamente (mejor soporte para colores modernos)
    const dataUrl = await toPng(comprobanteRef.value, {
      backgroundColor: '#ecfdf5',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })
    
    // Convertir dataUrl a blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    
    // Incluir el nombre del socio en el nombre del archivo para mejor identificación
    const nombreArchivo = `comprobante-${pagoRegistrado.value.socioNombre?.replace(/\s+/g, '-') || 'pago'}-${Date.now()}.png`
    const archivo = new File([blob], nombreArchivo, { type: 'image/png' })
    
    // Crear mensaje simple: Nombre del Socio - Período del pago
    const periodo = pagoRegistrado.value?.periodo || pagoRegistrado.value?.descripcionCuota || 'N/A'
    const mensajeCompartir = `${pagoRegistrado.value.socioNombre || 'Socio'} - ${periodo}`
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: `Comprobante de Pago - ${pagoRegistrado.value.socioNombre}`,
        text: mensajeCompartir
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
      const dataUrl = await toPng(comprobanteRef.value, {
        backgroundColor: '#ecfdf5',
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true
      })
      const link = document.createElement('a')
      link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const periodo = pagoRegistrado.value?.periodo || pagoRegistrado.value?.descripcionCuota || 'N/A'
          const mensaje = `${pagoRegistrado.value.socioNombre || 'Socio'} - ${periodo}`
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
        const periodo = pagoRegistrado.value?.periodo || pagoRegistrado.value?.descripcionCuota || 'N/A'
        const mensaje = `${pagoRegistrado.value.socioNombre || 'Socio'} - ${periodo}`
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

async function descargarComprobanteModificacion() {
  console.log('Iniciando descarga de comprobante de modificación...')
  
  if (!comprobanteModificacionRef.value) {
    alert('Error: El comprobante no está listo. Intenta de nuevo.')
    return
  }
  
  generandoImagenModificacion.value = true
  
  try {
    const dataUrl = await toPng(comprobanteModificacionRef.value, {
      backgroundColor: '#eff6ff',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })
    
    console.log('Imagen generada, iniciando descarga...')
    const link = document.createElement('a')
    link.download = `comprobante-modificacion-${modificacionRegistrada.value?.socioNombre?.replace(/\s+/g, '-') || 'modificacion'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('Descarga completada')
    
    // Registrar auditoría de descarga de comprobante
    if (modificacionRegistrada.value) {
      const auditoria = useAuditoria()
      registrarAuditoriaEnSegundoPlano(auditoria.registrar({
        tipoAccion: 'DOWNLOAD',
        entidad: 'comprobante',
        entidadId: modificacionRegistrada.value.cuotaId,
        descripcion: `Se descargó comprobante de modificación de ${modificacionRegistrada.value.socioNombre || 'socio'} (Código anterior: ${modificacionRegistrada.value.codigoAnterior || 'N/A'}, Código nuevo: ${modificacionRegistrada.value.codigoNuevo || 'N/A'})`,
        natilleraId: id,
        detalles: {
          tipo_comprobante: 'modificacion_cuota',
          codigo_comprobante_anterior: modificacionRegistrada.value.codigoAnterior,
          codigo_comprobante_nuevo: modificacionRegistrada.value.codigoNuevo,
          socio_nombre: modificacionRegistrada.value.socioNombre,
          valor_anterior: modificacionRegistrada.value.valorAnterior,
          valor_nuevo: modificacionRegistrada.value.valorNuevo
        }
      }))
    }
  } catch (e) {
    console.error('Error completo:', e)
    alert('Error al generar la imagen: ' + e.message)
  } finally {
    generandoImagenModificacion.value = false
  }
}

async function compartirWhatsAppModificacion() {
  if (!modificacionRegistrada.value || !comprobanteModificacionRef.value) return
  
  generandoImagenModificacion.value = true
  
  try {
    const dataUrl = await toPng(comprobanteModificacionRef.value, {
      backgroundColor: '#eff6ff',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })
    
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    
    const nombreArchivo = `comprobante-modificacion-${modificacionRegistrada.value.socioNombre?.replace(/\s+/g, '-') || 'modificacion'}-${Date.now()}.png`
    const archivo = new File([blob], nombreArchivo, { type: 'image/png' })
    
    const periodo = modificacionRegistrada.value?.periodo || 'N/A'
    const mensajeCompartir = `${modificacionRegistrada.value.socioNombre || 'Socio'} - Modificación: ${periodo}`
    
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Comprobante de Modificación',
        text: mensajeCompartir
      })
      
      // Registrar auditoría de envío de comprobante
      if (modificacionRegistrada.value?.cuotaId) {
        const auditoria = useAuditoria()
        registrarAuditoriaEnSegundoPlano(auditoria.registrar({
          tipoAccion: 'SEND',
          entidad: 'comprobante',
          entidadId: modificacionRegistrada.value.cuotaId,
          descripcion: `Se envió comprobante de modificación por WhatsApp a ${modificacionRegistrada.value.socioNombre || 'socio'} (Código anterior: ${modificacionRegistrada.value.codigoAnterior || 'N/A'}, Código nuevo: ${modificacionRegistrada.value.codigoNuevo || 'N/A'})`,
          natilleraId: id,
          detalles: {
            tipo_comprobante: 'modificacion_cuota',
            metodo_envio: 'whatsapp_share',
            codigo_comprobante_anterior: modificacionRegistrada.value.codigoAnterior,
            codigo_comprobante_nuevo: modificacionRegistrada.value.codigoNuevo,
            socio_nombre: modificacionRegistrada.value.socioNombre,
            socio_telefono: modificacionRegistrada.value.socioTelefono,
            valor_anterior: modificacionRegistrada.value.valorAnterior,
            valor_nuevo: modificacionRegistrada.value.valorNuevo
          }
        }))
      }
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const dataUrl = await toPng(comprobanteModificacionRef.value, {
        backgroundColor: '#eff6ff',
        pixelRatio: 2,
        quality: 1.0,
        cacheBust: true
      })
      const link = document.createElement('a')
      link.download = `comprobante-modificacion-${modificacionRegistrada.value?.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
      
      setTimeout(() => {
        const telefono = modificacionRegistrada.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const periodo = modificacionRegistrada.value?.periodo || 'N/A'
          const mensaje = `${modificacionRegistrada.value.socioNombre || 'Socio'} - Modificación: ${periodo}`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
      }, 500)
      
      alert('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      const telefono = modificacionRegistrada.value.socioTelefono?.replace(/\D/g, '')
      if (telefono) {
        const periodo = modificacionRegistrada.value?.periodo || 'N/A'
        const mensaje = `${modificacionRegistrada.value.socioNombre || 'Socio'} - Modificación: ${periodo}`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }
    }
  } finally {
    generandoImagenModificacion.value = false
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

async function reenviarComprobante(cuota) {
  cargandoComprobanteReenvio.value = true
  // Lanzar historial en paralelo para reducir tiempo total (se espera más abajo)
  const historialPromise = supabase
    .from('historial_pagos_cuota')
    .select('fecha_pago, forma_pago, valor_total, valor_cuota, valor_sancion, valor_actividades, valor_cuotas_prestamo, impuesto_4x1000')
    .eq('cuota_id', cuota.id)
    .order('fecha_pago', { ascending: true })

  try {
  // Usar el campo valor_pagado_sancion de la BD: ahí se guarda lo abonado a sanciones.
  // valor_pagado en BD = solo lo abonado a la cuota; total = valor_pagado + valor_pagado_sancion.
  // IMPORTANTE: Si la cuota tiene no_calcular_multa marcado, la sanción debe ser 0
  const tieneNoCalcularMulta = cuota.no_calcular_multa
  const valorCuota = parseFloat(cuota.valor_cuota) || 0
  const valorCuotaPagada = parseFloat(cuota.valor_pagado) || 0
  const valorSancionPagada = tieneNoCalcularMulta ? 0 : (parseFloat(cuota.valor_pagado_sancion) || 0)
  const sancion = tieneNoCalcularMulta ? 0 : getSancionCuotaDetalle(cuota)
  const valorMultaEnBD = tieneNoCalcularMulta ? 0 : (parseFloat(cuota.valor_multa) || 0)
  const sancionTotal = tieneNoCalcularMulta ? 0 : (valorMultaEnBD > 0 ? valorMultaEnBD : sancion)
  // Desglose por forma de pago (columnas nuevas). Para cuotas antiguas sin desglose, derivar desde tipo_pago.
  let valorEfectivo = parseFloat(cuota.valor_pagado_efectivo) || 0
  let valorTransferencia = parseFloat(cuota.valor_pagado_transferencia) || 0
  const totalDesglose = valorEfectivo + valorTransferencia
  if (totalDesglose === 0) {
    const tipoPagoCuota = (cuota.tipo_pago || 'efectivo').toLowerCase()
    if (tipoPagoCuota === 'transferencia') {
      valorTransferencia = valorCuotaPagada + valorSancionPagada + (parseFloat(cuota.valor_pagado_actividades) || 0)
      valorEfectivo = 0
    } else {
      valorEfectivo = valorCuotaPagada + valorSancionPagada + (parseFloat(cuota.valor_pagado_actividades) || 0)
      valorTransferencia = 0
    }
  }
  
  // Fuente de verdad: lo abonado a actividades EN ESTA CUOTA (valor_pagado_actividades).
  // Así se incluyen actividades pagadas en esta cuota aunque pertenezcan a otro periodo.
  const valorActividadesPagadoEnCuota = parseFloat(cuota.valor_pagado_actividades) || 0
  
  // Buscar actividades pagadas que corresponden al mismo periodo y quincena que esta cuota
  // (para desglose por nombre cuando aplica)
  let actividadesPagadas = []
  let totalActividades = valorActividadesPagadoEnCuota
  let cuotasPrestamosPagadas = []
  let totalCuotasPrestamos = 0
  
  if (cuota.socio_natillera_id) {
    try {
      // Asegurar mes/anio/quincena de la cuota (por si no vienen en el objeto)
      let mesCuota = cuota.mes
      let anioCuota = cuota.anio
      const quincenaCuota = cuota.quincena
      if ((mesCuota == null || anioCuota == null) && cuota.fecha_limite) {
        const partes = String(cuota.fecha_limite).split('-')
        if (partes.length >= 2) {
          const anio = parseInt(partes[0], 10)
          const mes = parseInt(partes[1], 10)
          if (!Number.isNaN(mes) && !Number.isNaN(anio)) {
            mesCuota = mes
            anioCuota = anio
          }
        }
      }
      
      // Solo consultar si tenemos periodo válido (mes y año)
      if (mesCuota != null && anioCuota != null) {
        const tieneAlgunPago = (valorCuotaPagada + valorSancionPagada + valorActividadesPagadoEnCuota) > 0
        // Optimizar: solo consultar socios_actividad si realmente hay valor_pagado_actividades en esta cuota
        const promSociosActividad = valorActividadesPagadoEnCuota > 0
          ? supabase
              .from('socios_actividad')
              .select(`
                *,
                actividades(
                  id,
                  tipo,
                  descripcion
                )
              `)
              .eq('socio_natillera_id', cuota.socio_natillera_id)
              .eq('mes_pago', mesCuota)
              .eq('anio_pago', anioCuota)
              .in('estado', ['pagado', 'parcial'])
          : Promise.resolve({ data: [] })
        const promPrestamos = supabase
          .from('prestamos')
          .select('id')
          .eq('socio_natillera_id', cuota.socio_natillera_id)
          .in('estado', ['activo', 'pagado'])

        const [sociosActividadRes, prestamosRes] = await Promise.all([
          promSociosActividad,
          promPrestamos
        ])
        
        const sociosActividadData = sociosActividadRes.data
        if (sociosActividadData && sociosActividadData.length > 0) {
          // Cuota con mes/anio/quincena para actividadCorrespondeACuota (por si no los tenía)
          const cuotaConPeriodo = {
            ...cuota,
            mes: mesCuota ?? cuota.mes,
            anio: anioCuota ?? cuota.anio,
            quincena: quincenaCuota ?? cuota.quincena
          }
          // Solo incluir actividades que corresponden a ESTA cuota (misma quincena)
          actividadesPagadas = sociosActividadData
            .filter(sa => {
              const actividad = Array.isArray(sa.actividades) ? sa.actividades[0] : sa.actividades
              if (!actividad || sa.valor_pagado <= 0) return false
              return actividadCorrespondeACuota(sa, cuotaConPeriodo, actividad)
            })
            .map(sa => {
              const actividad = Array.isArray(sa.actividades) ? sa.actividades[0] : sa.actividades
              return {
                id: sa.id,
                descripcion: actividad?.descripcion || 'Actividad',
                tipo: actividad?.tipo || 'otro',
                valor_pendiente: sa.valor_pagado, // Para reenvío, mostrar lo que se pagó
                valor_asignado: sa.valor_asignado,
                valor_pagado_anterior: 0
              }
            })
          
          const totalDesdeQuery = actividadesPagadas.reduce((sum, a) => sum + (a.valor_pendiente || 0), 0)
          // Si en esta cuota se pagó más a actividades (ej. actividad de otro periodo), añadir línea genérica
          if (valorActividadesPagadoEnCuota > totalDesdeQuery) {
            const diferencia = valorActividadesPagadoEnCuota - totalDesdeQuery
            actividadesPagadas.push({
              id: null,
              descripcion: 'Actividades',
              tipo: 'otro',
              valor_pendiente: diferencia,
              valor_asignado: diferencia,
              valor_pagado_anterior: 0
            })
          }
          totalActividades = valorActividadesPagadoEnCuota
        } else if (valorActividadesPagadoEnCuota > 0) {
          // Actividad(es) pagada(s) en esta cuota pero de otro periodo: mostrar una línea genérica
          actividadesPagadas = [{
            id: null,
            descripcion: 'Actividades',
            tipo: 'otro',
            valor_pendiente: valorActividadesPagadoEnCuota,
            valor_asignado: valorActividadesPagadoEnCuota,
            valor_pagado_anterior: 0
          }]
        }
        
        // Obtener cuotas de préstamos pagadas (prestamos ya cargados en paralelo)
        const prestamosSocio = prestamosRes.data
        if (prestamosSocio && prestamosSocio.length > 0) {
          const prestamoIds = prestamosSocio.map(p => p.id)
          
          let cuotasPrestamosData = null
          
          if (cuota.fecha_pago) {
            // Si hay fecha_pago, buscar cuotas de préstamos pagadas en la misma fecha o muy cercana (mismo día)
            const fechaPagoCuota = new Date(cuota.fecha_pago)
            fechaPagoCuota.setHours(0, 0, 0, 0)
            const fechaFinDia = new Date(fechaPagoCuota)
            fechaFinDia.setHours(23, 59, 59, 999)
            
            const { data } = await supabase
              .from('plan_pagos_prestamo')
              .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, fecha_pago')
              .in('prestamo_id', prestamoIds)
              .eq('pagada', true)
              .gte('fecha_pago', fechaPagoCuota.toISOString())
              .lte('fecha_pago', fechaFinDia.toISOString())
            
            cuotasPrestamosData = data
          } else {
            // Si no hay fecha_pago, buscar en el mismo periodo
            const fechaInicioPeriodo = new Date(anioCuota, mesCuota - 1, 1)
            const fechaFinPeriodo = new Date(anioCuota, mesCuota, 0, 23, 59, 59)
            
            const { data } = await supabase
              .from('plan_pagos_prestamo')
              .select('id, prestamo_id, numero_cuota, valor_cuota, valor_pagado, fecha_pago')
              .in('prestamo_id', prestamoIds)
              .eq('pagada', true)
              .gte('fecha_pago', fechaInicioPeriodo.toISOString())
              .lte('fecha_pago', fechaFinPeriodo.toISOString())
            
            cuotasPrestamosData = data
          }
          
          if (cuotasPrestamosData && cuotasPrestamosData.length > 0) {
            cuotasPrestamosPagadas = cuotasPrestamosData.map(cp => ({
              nombre: `Cuota préstamo #${cp.numero_cuota}`,
              valor: cp.valor_pagado || cp.valor_cuota || 0,
              numero_cuota: cp.numero_cuota,
              prestamo_id: cp.prestamo_id
            }))
            totalCuotasPrestamos = cuotasPrestamosPagadas.reduce((sum, cp) => sum + (cp.valor || 0), 0)
          }
        }
      }
    } catch (error) {
      console.error('Error obteniendo actividades y cuotas de préstamos para reenvío:', error)
    }
  }
  
  // Calcular totales considerando sanciones, actividades y cuotas de préstamos pagadas (obligación; GMF aparte)
  const valorPagadoTotal = valorCuotaPagada + valorSancionPagada + totalActividades + totalCuotasPrestamos
  const totalAPagar = valorCuota + sancionTotal + totalActividades + totalCuotasPrestamos
  const valorPendiente = Math.max(0, totalAPagar - valorPagadoTotal)
  const esParcial = valorPagadoTotal > 0 && valorPagadoTotal < totalAPagar
  
  // Historial de pagos para comprobante reenviado: usar siempre historial_pagos_cuota (ya lanzado en paralelo)
  let historialPagosReenvio = []
  let totalGmfHistorialReenvio = 0
  try {
    const { data: historialRows, error: historialError } = await historialPromise
    // Log para depuración: registros encontrados en historial_pagos_cuota
    console.log('[Reenvío comprobante] historial_pagos_cuota:', {
      cuota_id: cuota.id,
      cantidad_registros: historialRows?.length ?? 0,
      error: historialError ? { message: historialError.message, code: historialError.code } : null,
      registros_raw: historialRows ?? []
    })
    if (historialError) {
      console.warn('[Reenvío comprobante] Error al consultar historial_pagos_cuota:', historialError.message)
    }
    if (!historialError && (!historialRows || historialRows.length === 0)) {
      console.warn('[Reenvío comprobante] 0 filas para cuota_id:', cuota.id, '- Si en Supabase sí ves filas para este cuota_id, aplica la migración fix_historial_pagos_cuota_rls.sql (RLS).')
    }
    if (historialRows && historialRows.length > 0) {
      totalGmfHistorialReenvio = historialRows.reduce((s, r) => s + leerImpuesto4x1000DesdeHistorial(r), 0)
      historialPagosReenvio = historialRows.map((row, idx) => {
        const conceptos = []
        if ((row.valor_cuota || 0) > 0) conceptos.push({ nombre: 'Cuota', valor: row.valor_cuota })
        if ((row.valor_sancion || 0) > 0 && !tieneNoCalcularMulta) conceptos.push({ nombre: 'Sanción', valor: row.valor_sancion })
        if ((row.valor_actividades || 0) > 0) conceptos.push({ nombre: 'Actividades', valor: row.valor_actividades })
        if ((row.valor_cuotas_prestamo || 0) > 0) conceptos.push({ nombre: 'Cuotas de préstamos', valor: row.valor_cuotas_prestamo })
        const impH = leerImpuesto4x1000DesdeHistorial(row)
        if (impH > 0) conceptos.push({ nombre: '4×1000 (GMF)', valor: impH })
        const formaPago = (row.forma_pago || 'efectivo').toLowerCase()
        const formaPagoTexto = formaPago === 'transferencia' ? 'Transferencia' : formaPago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'
        const fecha = row.fecha_pago
          ? new Date(row.fecha_pago).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'N/A'
        const total = conceptos.reduce((sum, c) => sum + (parseFloat(c.valor) || 0), 0)
        return {
          pago: idx + 1,
          fecha,
          conceptos,
          total,
          formaPago,
          formaPagoTexto
        }
      })
      console.log('[Reenvío comprobante] historialPagosReenvio construido (Historial UI si length > 1):', historialPagosReenvio)
    }
  } catch (e) {
    console.warn('Error construyendo historial de pagos para reenvío desde historial_pagos_cuota:', e)
    historialPagosReenvio = []
  }
  
  // Preparar datos del pago para mostrar el comprobante
  pagoRegistrado.value = {
    cuotaId: cuota.id, // ID de la cuota para auditoría
    socioNombre: cuota.socio_natillera?.socio?.nombre,
    socioTelefono: cuota.socio_natillera?.socio?.telefono,
    valor: valorPagadoTotal + totalGmfHistorialReenvio, // Obligación + GMF consignado (histórico)
    valorCuota,
    valorPagadoTotal,
    valorPendiente,
    esParcial,
    periodo: obtenerPeriodoComprobante(cuota), // Período limpio (sin texto de ajustes)
    codigoComprobante: cuota.codigo_comprobante || null, // Incluir código del comprobante
    descripcionCuota: cuota.descripcion || formatDate(cuota.fecha_limite),
    sancion: sancionTotal, // Sanción total (pagada + pendiente), 0 si no_calcular_multa está marcado
    valorSancionPagada, // Cuánto de sanción se pagó (ya verifica no_calcular_multa)
    valorCuotaPagada, // Cuánto de cuota se pagó
    tieneSancion: !tieneNoCalcularMulta && valorSancionPagada > 0, // Indica si se pagó sanción (verifica no_calcular_multa)
    tipoPago: cuota.tipo_pago || 'efectivo', // Tipo de pago (efectivo o transferencia)
    valorEfectivo,
    valorTransferencia,
    impuesto4x1000: totalGmfHistorialReenvio,
    fecha: cuota.fecha_pago 
      ? (() => {
          const d = new Date(cuota.fecha_pago)
          const fechaStr = d.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          const horaStr = d.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
          })
          return `${fechaStr}\n${horaStr}`
        })()
      : 'Fecha no registrada',
    fechaCorta: cuota.fecha_pago 
      ? new Date(cuota.fecha_pago).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Fecha no registrada',
    // Información de actividades pagadas
    tieneActividades: totalActividades > 0,
    valorActividades: totalActividades,
    valorActividadesPagado: totalActividades, // Valor pagado de actividades para mostrar en conceptos
    cantidadActividades: actividadesPagadas.length,
    actividadesPagadas: actividadesPagadas,
    // Información de cuotas de préstamos pagadas
    tieneCuotasPrestamos: totalCuotasPrestamos > 0,
    valorCuotasPrestamosPagado: totalCuotasPrestamos,
    cantidadCuotasPrestamos: cuotasPrestamosPagadas.length,
    cuotasPrestamosPagadas: cuotasPrestamosPagadas,
    // Historial de pagos (para mostrar en comprobante reenviado cuando hubo pagos parciales o desglose único)
    historialPagos: historialPagosReenvio
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
  } finally {
    cargandoComprobanteReenvio.value = false
  }
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
      const tieneMensual = cuotas.some(c => c.quincena === 0 || c.quincena === null || c.quincena === undefined)
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
    const cuotaQuincena2 = cuotasDelMes.find(c => c.quincena === 2 || c.quincena === 0 || c.quincena === null)
    if (cuotaQuincena2 && cuotaQuincena2.fecha_limite) {
      // Convertir fecha a formato YYYY-MM-DD para el input date
      const fecha2 = new Date(cuotaQuincena2.fecha_limite)
      formCuotas.fecha_quincena2 = fecha2.toISOString().split('T')[0]
    }
  } else {
    // Si no hay cuotas, calcular fechas por defecto
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
    const anioCorrectoParaFechas = calcularAnioMes(
      mes,
      natillera?.mes_inicio || mesInicio.value,
      natillera?.mes_fin || mesFin.value,
      anioBase
    )
    
    // Calcular fechas por defecto
    const fechasPorDefecto = calcularFechasPorDefecto(
      mes,
      anioCorrectoParaFechas,
      diasGracia
    )
    
    formCuotas.fecha_quincena1 = fechasPorDefecto.fecha_quincena1
    formCuotas.fecha_quincena2 = fechasPorDefecto.fecha_quincena2
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
  
  // Segunda quincena: día límite siempre 30, excepto febrero (28 o 29)
  const diaLimiteSegundaQuincena = mes === 2 ? new Date(anio, 2, 0).getDate() : 30
  const fechaQuincena2 = new Date(anio, mes - 1, diaLimiteSegundaQuincena)
  
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

// Toggle "No calcular multa" por cuota (solo visible para raigo.16@gmail.com)
// Si se marca, las sanciones de esa cuota se ponen en 0 de inmediato.
async function toggleNoCalcularMultaCuota(cuota) {
  const nuevoValor = !cuota.no_calcular_multa
  const datos = { no_calcular_multa: nuevoValor }
  if (nuevoValor) {
    datos.valor_multa = 0
    datos.valor_multa_base = 0
    datos.valor_multa_intereses = 0
  }
  try {
    await cuotasStore.actualizarCuota(cuota.id, datos)
    cuota.no_calcular_multa = nuevoValor
    if (nuevoValor) {
      cuota.valor_multa = 0
      cuota.valor_multa_base = 0
      cuota.valor_multa_intereses = 0
    }
  } catch (e) {
    console.error('Error actualizando no_calcular_multa en cuota:', e)
  }
}

// Función para abrir el modal y cargar socios
function abrirSelectorMes() {
  modalSelectorMes.value = true
}

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
    // cargarFechasDelMes ahora calcula automáticamente las fechas por defecto si no hay cuotas
    await cargarFechasDelMes(mesParaCalcular)
  }
}

// Función para abrir modal de confirmación de borrado
function confirmarBorrarCuotasMes() {
  if (!mesSeleccionado.value) return
  modalConfirmarBorrar.value = true
}

// Computed para contar filtros activos
const cantidadFiltrosActivos = computed(() => {
  let count = 0
  if (filtroEstado.value !== 'todos') count++
  if (filtroPeriodicidad.value !== 'todos') count++
  if (filtroTipoPago.value !== 'todos') count++
  if (busquedaCuotas.value.trim()) count++
  return count
})

// Función para cerrar el desplegable de filtros
function cerrarFiltros() {
  mostrarFiltros.value = false
}

// Función para quitar todos los filtros
function quitarFiltros() {
  filtroEstado.value = 'todos'
  filtroPeriodicidad.value = 'todos'
  filtroTipoPago.value = 'todos'
  busquedaCuotas.value = ''
  mostrarFiltros.value = false
}

// Cerrar desplegable cuando se busca
watch(busquedaCuotas, () => {
  if (busquedaCuotas.value.trim()) {
    // Pequeño delay para que el usuario vea que se aplicó el filtro
    setTimeout(() => {
      mostrarFiltros.value = false
    }, 300)
  }
})

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
  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user
  
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
    
    // Obtener el rol del usuario en la natillera
    await nextTick()
    const natillera = natillerasStore.natilleraActual
    if (natillera) {
      if (!esAdmin.value) {
        try {
          const rol = await colaboradoresStore.obtenerMiRol(id)
          miRol.value = rol
        } catch (err) {
          console.warn('Error obteniendo rol del usuario:', err)
          miRol.value = null
        }
      } else {
        // Si es admin, no necesita verificar rol
        miRol.value = 'administrador'
      }
    }
    
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
    
    // 3. Calcular sanciones para todas las cuotas en mora (en segundo plano si no es crítico)
    if (sancionesActivas.value) {
      // Ejecutar sin await para no bloquear la UI
      // Usar recalcularSancionesMes que ahora calcula para todas las cuotas en mora
      recalcularSancionesMes()
    } else {
      sancionesDinamicas.value = {}
    }
    
    // 4. Cargar actividades pendientes por socio (en segundo plano)
    cargarActividadesPendientesPorSocio()
    
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

@keyframes progress {
  0% {
    width: 0%;
    transform: translateX(0);
  }
  50% {
    width: 70%;
    transform: translateX(0);
  }
  100% {
    width: 100%;
    transform: translateX(0);
  }
}

.progress-bar {
  animation: progress 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* Animación de barra de progreso para el registro de pago (más rápida) */
@keyframes progress-animated-fast {
  0% {
    width: 0%;
    transform: translateX(0);
  }
  50% {
    width: 70%;
    transform: translateX(0);
  }
  100% {
    width: 100%;
    transform: translateX(0);
  }
}

.progress-bar-animated-fast {
  animation: progress-animated-fast 1.2s ease-in-out infinite;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  will-change: width, transform;
}

/* Pantalla de carga "Preparando registro de pago" */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes progressSlide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
.preparando-shimmer {
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}
.preparando-fade-in-up-1 {
  animation: fadeInUp 0.4s ease-out 0.2s both;
}
.preparando-fade-in-up-2 {
  animation: fadeInUp 0.4s ease-out 0.35s both;
}
.preparando-progress-slide {
  animation: progressSlide 1.5s ease-in-out infinite;
}

/* Animación de flotación para partículas (más rápida) */
@keyframes float-fast {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.4;
  }
  25% {
    transform: translateY(-15px) rotate(3deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-30px) rotate(-3deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-15px) rotate(3deg);
    opacity: 0.6;
  }
}

.animate-float-fast {
  animation: float-fast 1.8s ease-in-out infinite;
}

/* Animaciones rápidas optimizadas */
@keyframes spin-fast {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-fast-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes bounce-fast {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes ping-fast {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes pulse-fast {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-spin-fast {
  animation: spin-fast 1.2s linear infinite;
}

.animate-spin-fast-reverse {
  animation: spin-fast-reverse 0.9s linear infinite;
}

.animate-bounce-fast {
  animation: bounce-fast 1s ease-in-out infinite;
}

.animate-ping-fast {
  animation: ping-fast 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-pulse-fast {
  animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Estilos responsivos para el comprobante en móvil */
@media (min-width: 640px) {
  .comprobante-content {
    padding: 28px 32px !important;
  }
  
  .comprobante-grid {
    gap: 14px !important;
  }
  
  .comprobante-card {
    padding: 16px !important;
    border-radius: 14px !important;
  }
  
  .comprobante-section {
    padding: 20px !important;
    border-radius: 18px !important;
    margin-bottom: 20px !important;
  }
  
  .comprobante-amount {
    padding: 20px !important;
    border-radius: 18px !important;
    margin-bottom: 16px !important;
  }
  
  .comprobante-amount-text {
    font-size: 42px !important;
  }
  
  .comprobante-item {
    padding: 12px 14px !important;
    border-radius: 12px !important;
  }
  
  .comprobante-header > div {
    padding: 10px 16px !important;
    gap: 10px !important;
    border-radius: 14px !important;
  }
  
  .comprobante-header > div > div {
    width: 32px !important;
    height: 32px !important;
  }
  
  .comprobante-header > div > div > span {
    font-size: 18px !important;
  }
  
  .comprobante-header > div > p {
    font-size: 11px !important;
    letter-spacing: 1px !important;
  }
  
  .comprobante-status {
    margin-bottom: 22px !important;
  }
  
  .comprobante-status-badge {
    padding: 8px 16px !important;
    border-radius: 20px !important;
    gap: 6px !important;
  }
}

/* Pantalla de carga al reenviar comprobante (elegante, compatible Safari/iPhone) */
.cargando-comprobante-reenvio {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  min-height: 100vh !important;
  min-height: 100dvh !important;
  min-height: -webkit-fill-available !important;
  height: 100vh !important;
  height: 100dvh !important;
  height: -webkit-fill-available !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 35%, #d1fae5 70%, #ccfbf1 100%);
  touch-action: none;
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
  box-sizing: border-box;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.cargando-comprobante-reenvio__bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.cargando-comprobante-reenvio__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  -webkit-filter: blur(60px);
  opacity: 0.5;
  -webkit-animation: cargando-comprobante-float 6s ease-in-out infinite;
  animation: cargando-comprobante-float 6s ease-in-out infinite;
}

.cargando-comprobante-reenvio__orb--1 {
  width: 280px;
  height: 280px;
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
  top: 10%;
  left: 15%;
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}

.cargando-comprobante-reenvio__orb--2 {
  width: 240px;
  height: 240px;
  background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%);
  bottom: 20%;
  right: 10%;
  -webkit-animation-delay: 2s;
  animation-delay: 2s;
}

.cargando-comprobante-reenvio__orb--3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #99f6e4 0%, #5eead4 100%);
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  -webkit-animation-delay: 4s;
  animation-delay: 4s;
}

@-webkit-keyframes cargando-comprobante-float {
  0%, 100% { -webkit-transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  50% { -webkit-transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
}

@keyframes cargando-comprobante-float {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
}

.cargando-comprobante-reenvio__orb--1,
.cargando-comprobante-reenvio__orb--2 {
  -webkit-animation-name: cargando-comprobante-float-alt;
  animation-name: cargando-comprobante-float-alt;
}

@-webkit-keyframes cargando-comprobante-float-alt {
  0%, 100% { -webkit-transform: translate(0, 0) scale(1); opacity: 0.45; }
  50% { -webkit-transform: translate(10px, -10px) scale(1.08); opacity: 0.55; }
}

@keyframes cargando-comprobante-float-alt {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
  50% { transform: translate(10px, -10px) scale(1.08); opacity: 0.55; }
}

.cargando-comprobante-reenvio__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 2.5rem;
  max-width: 90%;
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  box-shadow: 0 32px 64px -12px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  border: 1px solid rgba(16, 185, 129, 0.12);
}

.cargando-comprobante-reenvio__spinner-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.cargando-comprobante-reenvio__ring {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
}

.cargando-comprobante-reenvio__ring--outer {
  inset: 0;
  border-width: 3px;
  border-top-color: #10b981;
  border-right-color: #34d399;
  -webkit-animation: cargando-comprobante-spin 1.2s linear infinite;
  animation: cargando-comprobante-spin 1.2s linear infinite;
}

.cargando-comprobante-reenvio__ring--mid {
  inset: 10px;
  border-width: 2px;
  border-bottom-color: #059669;
  border-left-color: #6ee7b7;
  -webkit-animation: cargando-comprobante-spin 0.9s linear infinite reverse;
  animation: cargando-comprobante-spin 0.9s linear infinite reverse;
}

@-webkit-keyframes cargando-comprobante-spin {
  to { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
}

@keyframes cargando-comprobante-spin {
  to { transform: rotate(360deg); }
}

.cargando-comprobante-reenvio__icon-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cargando-comprobante-reenvio__icon {
  width: 28px;
  height: 28px;
  color: #059669;
  -webkit-animation: cargando-comprobante-pulse 2s ease-in-out infinite;
  animation: cargando-comprobante-pulse 2s ease-in-out infinite;
}

@-webkit-keyframes cargando-comprobante-pulse {
  0%, 100% { opacity: 0.85; -webkit-transform: scale(1); transform: scale(1); }
  50% { opacity: 1; -webkit-transform: scale(1.05); transform: scale(1.05); }
}

@keyframes cargando-comprobante-pulse {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.cargando-comprobante-reenvio__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 0.35rem 0;
  text-align: center;
  letter-spacing: -0.02em;
}

.cargando-comprobante-reenvio__message {
  font-size: 0.9375rem;
  color: #047857;
  margin: 0;
  text-align: center;
  font-weight: 500;
  opacity: 0.9;
}

.cargando-comprobante-reenvio__bar-wrap {
  width: 120px;
  height: 4px;
  margin-top: 1.25rem;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.cargando-comprobante-reenvio__bar {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 999px;
  -webkit-animation: cargando-comprobante-bar 1.4s ease-in-out infinite;
  animation: cargando-comprobante-bar 1.4s ease-in-out infinite;
}

@-webkit-keyframes cargando-comprobante-bar {
  0% { -webkit-transform: translateX(-100%); transform: translateX(-100%); }
  100% { -webkit-transform: translateX(350%); transform: translateX(350%); }
}

@keyframes cargando-comprobante-bar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

</style>


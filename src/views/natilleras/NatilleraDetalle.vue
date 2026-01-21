<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden relative">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Pantalla de carga completa -->
    <template v-if="cargandoNatillera">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          key="loading-screen"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 backdrop-blur-md"
          @click.stop.prevent
          @wheel.stop.prevent
          @touchmove.stop.prevent
          @scroll.stop.prevent
          style="touch-action: none; overscroll-behavior: none;"
        >
          <!-- Efectos decorativos de fondo -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tr from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s;"></div>
          </div>
          
          <div class="relative z-10 flex flex-col items-center">
            <!-- Spinner moderno con gradientes y múltiples capas -->
            <div class="relative w-24 h-24 mb-6">
              <!-- Anillo exterior grande animado -->
              <div class="absolute inset-0 border-4 border-green-200/50 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin-smooth"></div>
              
              <!-- Anillo medio -->
              <div class="absolute inset-2 border-4 border-emerald-200/50 rounded-full"></div>
              <div class="absolute inset-2 border-4 border-transparent border-r-emerald-500 rounded-full animate-spin-reverse"></div>
              
              <!-- Anillo interior -->
              <div class="absolute inset-4 border-4 border-teal-200/50 rounded-full"></div>
              <div class="absolute inset-4 border-4 border-transparent border-b-teal-500 rounded-full animate-spin-smooth" style="animation-duration: 0.6s;"></div>
              
              <!-- Círculo central con gradiente animado -->
              <div class="absolute inset-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-glow-pulse">
                <BanknotesIcon class="w-5 h-5 text-white" />
              </div>
              
              <!-- Partículas flotantes -->
              <div class="absolute -top-2 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-float-1"></div>
              <div class="absolute top-1/4 -right-2 w-2 h-2 bg-emerald-400 rounded-full animate-float-2"></div>
              <div class="absolute -bottom-2 left-1/4 w-2 h-2 bg-teal-400 rounded-full animate-float-3"></div>
            </div>
            
            <!-- Texto de carga con efecto -->
            <div class="text-center">
              <p class="text-gray-700 font-semibold text-lg mb-1 animate-fade-in-out">
                {{ mensajeCargaActual }}
              </p>
              <div class="flex gap-1 justify-center mt-2">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                <div class="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <template v-else-if="natillera">
      <!-- Breadcrumbs (solo desktop) -->
      <div class="hidden sm:block relative mb-4">
        <Breadcrumbs />
      </div>

      <!-- Header principal -->
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden mb-4 sm:mb-6">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <!-- Botón volver atrás en esquina superior izquierda (solo móvil) -->
        <BackButton />
        
        <!-- Badge de estado en esquina superior derecha (móvil) -->
        <div class="absolute top-3 right-3 sm:hidden z-20">
          <div class="flex items-center gap-1.5">
            <div 
              :class="[
                'w-2 h-2 rounded-full',
                natillera.estado === 'activa' ? 'bg-green-500' : 'bg-amber-500'
              ]"
            ></div>
            <span 
              :class="[
                'px-2 py-1 rounded-full text-xs font-bold',
                natillera.estado === 'activa' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              ]"
            >
              {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
            </span>
          </div>
        </div>
        
        <div class="relative z-10 pt-12 sm:pt-0">
          <!-- Información superior -->
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent mb-2 break-words">
                {{ nombreNatilleraPascalCase }}
              </h1>
              
              <p class="text-gray-600 text-sm sm:text-base mb-1">
                Período: {{ rangoMesesTexto }}
              </p>
              
              <p class="text-gray-600 text-xs sm:text-sm">
                Desde {{ formatDate(natillera.fecha_inicio) }}
              </p>
            </div>
            
            <!-- Estado actual (solo desktop) -->
            <div class="hidden sm:flex items-center gap-2 sm:gap-3">
              <span class="text-gray-600 text-xs sm:text-sm font-medium">ESTADO ACTUAL</span>
              <div class="flex items-center gap-2">
                <div 
                  :class="[
                    'w-3 h-3 rounded-full',
                    natillera.estado === 'activa' ? 'bg-green-500' : 'bg-amber-500'
                  ]"
                ></div>
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-xs sm:text-sm font-bold',
                    natillera.estado === 'activa' 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  ]"
                >
                  {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Indicadores financieros -->
          <div class="space-y-4 sm:space-y-0">
            <!-- Fila superior en móvil: SOCIOS, RECAUDADO, PENDIENTE, UTILIDADES -->
            <!-- Fila única en desktop: todos los 5 indicadores -->
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
              <div class="flex flex-col">
                <p class="text-gray-600 text-xs sm:text-sm mb-1 font-medium">SOCIOS</p>
                <p class="text-gray-800 text-xl sm:text-2xl lg:text-3xl font-extrabold">{{ estadisticas.totalSocios }}</p>
              </div>
              <button 
                @click="modalDesgloseRecaudacion = true"
                class="flex flex-col group relative cursor-pointer hover:bg-green-50/50 active:bg-green-100/50 rounded-lg p-2 -m-2 transition-all duration-200"
              >
                <!-- Punto indicador sutil en la esquina superior derecha -->
                <div class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all duration-200 animate-pulse"></div>
                
                <div class="flex items-center gap-1 mb-1">
                  <p class="text-gray-600 text-xs sm:text-sm font-medium underline decoration-dotted decoration-green-400/50 underline-offset-2 group-hover:decoration-green-500/70 transition-colors">
                    RECAUDADO
                  </p>
                </div>
                <p class="text-green-600 text-xl sm:text-2xl lg:text-3xl font-extrabold group-hover:text-green-700 transition-colors">
                  <span class="sm:hidden">${{ formatMoneyShort(estadisticas.totalAportado) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(estadisticas.totalAportado) }}</span>
                </p>
              </button>
              <div class="flex flex-col">
                <p class="text-gray-600 text-xs sm:text-sm mb-1 font-medium">PENDIENTE</p>
                <p class="text-amber-700 text-xl sm:text-2xl lg:text-3xl font-extrabold">
                  <span class="sm:hidden">${{ formatMoneyShort(estadisticas.totalPendiente) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(estadisticas.totalPendiente) }}</span>
                </p>
              </div>
              <div class="flex flex-col">
                <p class="text-gray-600 text-xs sm:text-sm mb-1 font-medium">UTILIDADES</p>
                <p class="text-gray-800 text-xl sm:text-2xl lg:text-3xl font-extrabold">
                  <span class="sm:hidden">${{ formatMoneyShort(estadisticas.utilidadesRecogidas || 0) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(estadisticas.utilidadesRecogidas || 0) }}</span>
                </p>
              </div>
              <div class="hidden sm:flex flex-col">
                <p class="text-gray-600 text-xs sm:text-sm mb-1 font-medium">FONDO TOTAL</p>
                <p class="text-indigo-700 text-xl sm:text-2xl lg:text-3xl font-extrabold">${{ formatMoney(estadisticas.fondoTotal) }}</p>
              </div>
            </div>
            
            <!-- Fila inferior en móvil: FONDO TOTAL -->
            <div class="flex items-center justify-between pt-4 border-t-2 border-indigo-300 sm:hidden">
              <p class="text-gray-600 text-xs sm:text-sm font-medium">FONDO TOTAL</p>
              <p class="text-indigo-700 text-2xl sm:text-3xl lg:text-4xl font-extrabold">${{ formatMoney(estadisticas.fondoTotal) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de acciones rápidas -->
      <div class="relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:py-2 sm:px-4 lg:py-2.5 lg:px-5 shadow-lg border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
        <div class="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 lg:gap-4">
          <button 
            v-if="puedeBuscarComprobante"
            @click="modalBuscarComprobante = true"
            class="flex flex-col items-center justify-center gap-1 sm:gap-1 flex-1 sm:flex-none min-w-0 px-1 sm:px-2 py-2 sm:py-1.5 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            <MagnifyingGlassIcon class="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
            <span class="text-xs sm:text-sm text-center">
              <span class="sm:hidden">Buscar Comprob.</span>
              <span class="hidden sm:inline">Buscar Comprobante</span>
            </span>
          </button>
          
          <router-link 
            v-if="puedeConfigurar"
            :to="`/natilleras/${id}/configuracion`"
            class="flex flex-col items-center justify-center gap-1 sm:gap-1 flex-1 sm:flex-none min-w-0 px-1 sm:px-2 py-2 sm:py-1.5 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            <Cog6ToothIcon class="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
            <span class="text-xs sm:text-sm">Configurar</span>
          </router-link>
          
          <button 
            v-if="puedeInvitarColaboradores"
            @click="abrirFormularioInvitarColaborador"
            class="flex flex-col items-center justify-center gap-1 sm:gap-1 flex-1 sm:flex-none min-w-0 px-1 sm:px-2 py-2 sm:py-1.5 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
          >
            <UsersIcon class="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="text-xs sm:text-sm text-center">
              <span class="sm:hidden">Invitar Colabor.</span>
              <span class="hidden sm:inline">Invitar Colaboradores</span>
            </span>
          </button>
          
          <button 
            v-if="puedeNotificar"
            @click="modalWhatsApp = true"
            class="flex flex-col items-center justify-center gap-1 sm:gap-1 flex-1 sm:flex-none min-w-0 px-1 sm:px-2 py-2 sm:py-1.5 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all"
          >
            <ChatBubbleLeftIcon class="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="text-xs sm:text-sm">Notificar</span>
          </button>
          
          <button 
            v-if="puedeCerrarNatillera && natillera.estado === 'activa'"
            @click="handleCerrarNatillera"
            class="flex flex-col items-center justify-center gap-1 sm:gap-1 flex-1 sm:flex-none min-w-0 px-1 sm:px-2 py-2 sm:py-1.5 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all"
          >
            <DocumentCheckIcon class="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="text-xs sm:text-sm">Cerrar Natillera</span>
          </button>
        </div>
      </div>

      <!-- BANNER DE ALERTA DE MORA - Click para abrir modal -->
      <div 
        ref="bannerSociosEnMoraRef"
        v-if="sociosEnMora.length > 0"
        @click="modalSociosEnMora = true"
        class="relative rounded-2xl p-4 sm:p-5 border-2 shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 group animate-fade-in-alerta"
        :class="[
          sociosEnMora.length >= 3 
            ? 'bg-gradient-to-br from-red-50 via-red-100/80 to-rose-100 border-red-400 shadow-red-500/30 hover:border-red-500 hover:-translate-y-0.5' 
            : 'bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50 border-amber-400 shadow-amber-500/30 hover:border-amber-500 hover:-translate-y-0.5'
        ]"
      >
        <!-- Efecto de barrido automático -->
        <div 
          :class="[
            'absolute inset-0 rounded-2xl animate-sweep-hover pointer-events-none',
            sociosEnMora.length >= 3 
              ? 'bg-gradient-to-r from-transparent via-red-300/70 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-amber-300/70 to-transparent'
          ]"
        ></div>
        
        <div class="relative z-10 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 sm:gap-4 flex-1">
            <div :class="['w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow', sociosEnMora.length >= 3 ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/50' : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/50']">
              <ExclamationTriangleIcon :class="['w-6 h-6 sm:w-7 sm:h-7 text-white']" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 :class="['text-lg sm:text-xl font-display font-bold mb-0.5', sociosEnMora.length >= 3 ? 'text-red-800' : 'text-amber-800']">
                Hay {{ sociosEnMora.length }} {{ sociosEnMora.length === 1 ? 'socio' : 'socios' }} en mora
              </h2>
              <p :class="['text-sm font-medium', sociosEnMora.length >= 3 ? 'text-red-600' : 'text-amber-600']">
                {{ totalCuotasMora }} {{ totalCuotasMora === 1 ? 'cuota' : 'cuotas' }} en mora
                <span v-if="totalPrestamosVencidos > 0" class="ml-1.5">
                  • {{ totalPrestamosVencidos }} {{ totalPrestamosVencidos === 1 ? 'préstamo' : 'préstamos' }} vencido{{ totalPrestamosVencidos > 1 ? 's' : '' }}
                </span>
                <span class="block sm:inline sm:ml-1.5 mt-0.5 sm:mt-0">
                  • Total: ${{ formatMoneyShort(totalDeudaMora + totalDeudaPrestamosVencidos) }}
                </span>
              </p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <ChevronRightIcon :class="['w-6 h-6 transition-transform duration-300 group-hover:translate-x-1', sociosEnMora.length >= 3 ? 'text-red-600' : 'text-amber-600']" />
          </div>
        </div>
      </div>


      <!-- Menú Principal -->
      <div class="relative bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 overflow-hidden">
        <div class="relative z-10">
          <!-- Título del menú -->
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-1">
                Menú Principal
              </h2>
              <p class="hidden sm:block text-sm sm:text-base text-gray-600">
                Gestiona los módulos centrales de tu círculo de ahorro
              </p>
            </div>
            <div class="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <Squares2X2Icon class="w-4 h-4" />
              <span>NAVEGACIÓN</span>
            </div>
          </div>
          
          <!-- Grid de opciones: 2 columnas en móvil, 4 en desktop -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <router-link 
              v-if="puedeVerSocios"
              :to="`/natilleras/${id}/socios`"
              class="group relative flex flex-col items-center sm:items-start p-5 sm:p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-blue-200/60 group-hover:to-indigo-200/40 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/30 to-blue-100/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              <!-- Ícono con fondo colorido -->
              <div class="relative z-10 mb-4 flex justify-center sm:justify-start">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <UsersIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              
              <!-- Título y descripción -->
              <div class="relative z-10 text-center sm:text-left">
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-2 group-hover:text-blue-700 transition-colors">
                  Socios
                </h3>
                <p class="hidden sm:block text-sm text-gray-600 leading-relaxed">
                  Administración de miembros y roles del grupo.
                </p>
              </div>
            </router-link>
            
            <router-link 
              v-if="puedeVerCuotas"
              :to="`/natilleras/${id}/cuotas`"
              class="group relative flex flex-col items-center sm:items-start p-5 sm:p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-green-200/60 group-hover:to-emerald-200/40 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100/30 to-green-100/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              <!-- Ícono con fondo colorido -->
              <div class="relative z-10 mb-4 flex justify-center sm:justify-start">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <CurrencyDollarIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              
              <!-- Título y descripción -->
              <div class="relative z-10 text-center sm:text-left">
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-2 group-hover:text-green-700 transition-colors">
                  Cuotas
                </h3>
                <p class="hidden sm:block text-sm text-gray-600 leading-relaxed">
                  Registro y control de aportes periódicos.
                </p>
              </div>
            </router-link>
            
            <router-link 
              v-if="puedeVerPrestamos"
              :to="`/natilleras/${id}/prestamos`"
              class="group relative flex flex-col items-center sm:items-start p-5 sm:p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-orange-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-amber-200/60 group-hover:to-orange-200/40 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100/30 to-amber-100/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              <!-- Ícono con fondo colorido -->
              <div class="relative z-10 mb-4 flex justify-center sm:justify-start">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <BanknotesIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              
              <!-- Título y descripción -->
              <div class="relative z-10 text-center sm:text-left">
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-2 group-hover:text-amber-700 transition-colors">
                  Préstamos
                </h3>
                <p class="hidden sm:block text-sm text-gray-600 leading-relaxed">
                  Solicitudes, desembolsos y tabla de amortización.
                </p>
              </div>
            </router-link>
            
            <router-link 
              v-if="puedeVerActividades"
              :to="`/natilleras/${id}/actividades`"
              class="group relative flex flex-col items-center sm:items-start p-5 sm:p-6 bg-white rounded-3xl border-2 border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-indigo-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-purple-200/60 group-hover:to-indigo-200/40 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/30 to-purple-100/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              <!-- Ícono con fondo colorido -->
              <div class="relative z-10 mb-4 flex justify-center sm:justify-start">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <CalendarIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              
              <!-- Título y descripción -->
              <div class="relative z-10 text-center sm:text-left">
                <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-2 group-hover:text-purple-700 transition-colors">
                  Actividades
                </h3>
                <p class="hidden sm:block text-sm text-gray-600 leading-relaxed">
                  Eventos, rifas y fondos extraordinarios.
                </p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="card text-center py-12">
      <p class="text-gray-500">No se encontró la natillera</p>
      <router-link to="/natilleras" class="btn-primary mt-4 inline-block">
        Volver a natilleras
      </router-link>
    </div>

    <!-- Modal WhatsApp -->
    <div v-if="modalWhatsApp" data-modal="whatsapp" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50" @click="cerrarModalWhatsApp"></div>
      <div class="card relative w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col">
        <h3 class="text-lg sm:text-xl font-display font-bold text-gray-800 mb-2 sm:mb-3">
          Enviar Recordatorio por WhatsApp
        </h3>
        <p class="text-gray-500 text-xs sm:text-sm mb-3">
          Selecciona un socio para enviarle un recordatorio de pago.
        </p>
        
        <!-- Barra de búsqueda -->
        <div class="relative mb-3">
          <MagnifyingGlassIcon class="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            v-model="busquedaSocio"
            type="text"
            placeholder="Buscar socio por nombre o teléfono..."
            class="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
          />
        </div>
        
        <!-- Lista de socios -->
        <div class="space-y-2 overflow-y-auto flex-1 max-h-[45vh] sm:max-h-60">
          <button 
            v-for="sn in sociosFiltrados" 
            :key="sn.id"
            @click="enviarWhatsApp(sn)"
            :disabled="!sn.socio?.telefono"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
              sn.socio?.telefono 
                ? 'bg-gray-50 hover:bg-green-50 active:bg-green-100 cursor-pointer' 
                : 'bg-gray-100 opacity-50 cursor-not-allowed'
            ]"
          >
            <img 
              :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed)" 
              :alt="sn.socio?.nombre"
              :class="[
                'w-10 h-10 rounded-full flex-shrink-0 border-2',
                sn.socio?.telefono ? 'border-green-400' : 'border-gray-300 grayscale'
              ]"
            />
            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-800 truncate text-sm sm:text-base">{{ sn.socio?.nombre }}</p>
              <p class="text-xs sm:text-sm text-gray-500 truncate">{{ sn.socio?.telefono || 'Sin teléfono registrado' }}</p>
            </div>
            <div v-if="sn.socio?.telefono" class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </button>
          
          <!-- Mensaje cuando no hay resultados -->
          <div v-if="sociosFiltrados.length === 0" class="text-center py-6">
            <p class="text-gray-400 text-sm">No se encontraron socios</p>
          </div>
        </div>

        <button 
          @click="cerrarModalWhatsApp"
          class="btn-secondary w-full mt-4 flex-shrink-0"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- Modal Detalle Socio -->
    <div v-if="modalDetalle" data-modal="detalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalle = false"></div>
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
                @click="modalDetalle = false"
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
                  @click="modalDetalle = false"
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
            @click="modalDetalle = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Buscar Comprobante -->
    <div v-if="modalBuscarComprobante" data-modal="buscar-comprobante" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalBuscarComprobante"></div>
      <div class="relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <MagnifyingGlassIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  Buscar Comprobante
                </h3>
                <p class="text-white/90 text-sm">
                  Ingresa el código del comprobante
                </p>
              </div>
            </div>
            <button 
              @click="cerrarModalBuscarComprobante"
              class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="overflow-y-auto flex-1 p-6 space-y-6">
          <!-- Campo de búsqueda -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Código del Comprobante</label>
            <div class="relative">
              <input 
                ref="inputBusquedaRef"
                v-model="codigoBusqueda"
                type="text"
                placeholder="Ej: ABC12345"
                class="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 uppercase font-mono text-sm transition-all"
                @keydown.enter.prevent="buscarComprobante"
                maxlength="20"
                :disabled="buscandoComprobante"
              />
              <button
                @click="buscarComprobante"
                :disabled="!codigoBusqueda.trim() || buscandoComprobante"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-natillera-600 text-white rounded-lg hover:bg-natillera-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <MagnifyingGlassIcon v-if="!buscandoComprobante" class="w-5 h-5" />
                <svg v-else class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Resultado de la búsqueda -->
          <div v-if="comprobanteEncontrado" class="space-y-4">
            <!-- Alerta si es un comprobante antiguo -->
            <div v-if="infoComprobanteAntiguo" class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExclamationCircleIcon class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-amber-900 mb-1">⚠️ Comprobante Actualizado</h4>
                  <p class="text-sm text-amber-700">
                    Este código corresponde a un comprobante antiguo que fue actualizado.
                  </p>
                </div>
              </div>
              
              <div class="bg-white rounded-lg p-4 border border-amber-200 space-y-3 mb-4">
                <div class="flex items-center justify-between py-2 border-b border-amber-100">
                  <span class="text-sm text-amber-700 font-medium">Código Anterior:</span>
                  <span class="font-mono font-bold text-amber-900 text-lg">{{ infoComprobanteAntiguo.codigoAnterior }}</span>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm text-green-700 font-medium">Código Actual:</span>
                  <span class="font-mono font-bold text-green-800 text-lg">{{ infoComprobanteAntiguo.codigoNuevo }}</span>
                </div>
                <div v-if="infoComprobanteAntiguo.fechaActualizacion" class="pt-3 border-t border-amber-100">
                  <span class="text-xs text-amber-600">Actualizado el: {{ formatDate(infoComprobanteAntiguo.fechaActualizacion) }}</span>
                </div>
              </div>
              
              <!-- Botón para buscar el nuevo código -->
              <button
                @click="buscarPorCodigoNuevo"
                class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MagnifyingGlassIcon class="w-5 h-5" />
                Consultar Comprobante Actual
              </button>
            </div>
            
            <!-- Card de información del comprobante -->
            <div :class="[
              'border-2 rounded-xl p-5 shadow-sm',
              comprobanteEncontrado.tipo === 'abono_prestamo' 
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            ]">
              <div class="flex items-center gap-2 mb-4">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  comprobanteEncontrado.tipo === 'abono_prestamo' ? 'bg-amber-500' : 'bg-green-500'
                ]">
                  <CheckCircleIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 :class="[
                    'font-bold text-lg',
                    comprobanteEncontrado.tipo === 'abono_prestamo' ? 'text-amber-800' : 'text-green-800'
                  ]">
                    Comprobante Encontrado
                  </h4>
                  <p v-if="comprobanteEncontrado.tipo === 'abono_prestamo'" class="text-xs text-amber-700 font-semibold mt-0.5">
                    Abono a Préstamo
                  </p>
                </div>
              </div>
              
              <div class="bg-white rounded-lg p-5 space-y-4 border" :class="comprobanteEncontrado.tipo === 'abono_prestamo' ? 'border-amber-200' : 'border-green-200'">
                <div class="pb-3 border-b border-gray-100">
                  <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Código {{ infoComprobanteAntiguo ? 'Actual' : 'del Comprobante' }}</p>
                  <p class="font-mono font-bold text-xl text-gray-800">{{ comprobanteEncontrado.codigo_comprobante }}</p>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Socio</p>
                    <p class="font-semibold text-gray-800">{{ comprobanteEncontrado.socio_natillera?.socio?.nombre || 'N/A' }}</p>
                  </div>
                  
                  <div>
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Descripción</p>
                    <p class="text-gray-800">{{ comprobanteEncontrado.descripcion || 'N/A' }}</p>
                  </div>
                </div>
                
                <!-- Alerta de comprobante eliminado -->
                <div v-if="comprobanteEncontrado.eliminado" class="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ExclamationCircleIcon class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-red-800 mb-2">⚠️ COMPROBANTE ELIMINADO</p>
                      <div class="space-y-1 text-sm">
                        <p class="text-red-700">
                          <span class="font-semibold">Eliminado por:</span> {{ comprobanteEncontrado.eliminado_por }}
                        </p>
                        <p class="text-red-700">
                          <span class="font-semibold">Fecha de eliminación:</span> {{ formatDateWithTime(comprobanteEncontrado.eliminado_el) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Alerta de código actualizado -->
                <div v-else-if="comprobanteEncontrado.codigo_nuevo" class="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-4">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ExclamationTriangleIcon class="w-6 h-6 text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-red-800 mb-2 text-lg">⚠️ COMPROBANTE NO VÁLIDO</p>
                      <p class="text-sm text-red-700 mb-2 font-semibold">
                        Este comprobante fue actualizado y <span class="text-red-900 font-bold">ya no es válido</span>.
                      </p>
                      <p class="text-sm text-red-600 mb-3">
                        El comprobante válido tiene el siguiente código:
                      </p>
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class="font-mono font-bold text-red-900 bg-red-100 border-2 border-red-300 px-3 py-1.5 rounded-lg">
                          {{ comprobanteEncontrado.codigo_nuevo }}
                        </span>
                        <button
                          @click="codigoBusqueda = comprobanteEncontrado.codigo_nuevo; buscarComprobante()"
                          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          <ArrowRightIcon class="w-4 h-4" />
                          Ver comprobante válido
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Información específica según el tipo -->
                <template v-if="comprobanteEncontrado.tipo === 'abono_prestamo' || comprobanteEncontrado.tipo === 'abono_prestamo_eliminado' || comprobanteEncontrado.tipo === 'abono_prestamo_antiguo'">
                  <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p class="text-xs text-amber-700 mb-2 uppercase tracking-wide font-semibold">Información del Préstamo</p>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Monto del Préstamo</p>
                        <p class="font-bold text-gray-800">${{ formatMoney(comprobanteEncontrado.prestamo?.monto || 0) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Saldo Actual</p>
                        <p class="font-bold text-gray-800">${{ formatMoney(comprobanteEncontrado.prestamo?.saldo_actual || 0) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Interés</p>
                        <p class="font-bold text-gray-800">{{ comprobanteEncontrado.prestamo?.interes || 0 }}%</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Cuotas</p>
                        <p class="font-bold text-gray-800">{{ comprobanteEncontrado.prestamo?.numero_cuotas || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Valor del Abono</p>
                      <p class="font-bold text-amber-700 text-lg">${{ formatMoney(comprobanteEncontrado.valor_pagado || 0) }}</p>
                    </div>
                    <div v-if="!comprobanteEncontrado.eliminado" class="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Saldo Después del Abono</p>
                      <p class="font-bold text-green-600 text-lg">${{ formatMoney(Math.max(0, (comprobanteEncontrado.prestamo?.saldo_actual || 0) - (comprobanteEncontrado.valor_pagado || 0))) }}</p>
                    </div>
                  </div>
                </template>
                
                <template v-else>
                  <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Valor Cuota</p>
                      <p class="font-bold text-gray-800 text-lg">${{ formatMoney(comprobanteEncontrado.valor_cuota) }}</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-3">
                      <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Valor Pagado</p>
                      <p class="font-bold text-green-600 text-lg">${{ formatMoney(comprobanteEncontrado.valor_pagado || 0) }}</p>
                    </div>
                  </div>
                  
                  <div class="pt-3 border-t border-gray-200">
                    <p class="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Estado</p>
                    <span 
                      :class="[
                        'inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm',
                        comprobanteEncontrado.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        comprobanteEncontrado.estado === 'parcial' ? 'bg-blue-100 text-blue-800' :
                        comprobanteEncontrado.estado === 'mora' ? 'bg-red-100 text-red-800' :
                        comprobanteEncontrado.estado === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-700'
                      ]"
                    >
                      {{ comprobanteEncontrado.estado?.toUpperCase() || 'N/A' }}
                    </span>
                  </div>
                </template>
                
                <div class="pt-3 border-t border-gray-200">
                  <div :class="[
                    'rounded-lg p-3 border',
                    comprobanteEncontrado.tipo === 'abono_prestamo' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                  ]">
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Fecha de Pago</p>
                    <p v-if="comprobanteEncontrado.fecha_pago" :class="[
                      'font-bold text-lg',
                      comprobanteEncontrado.tipo === 'abono_prestamo' ? 'text-amber-800' : 'text-green-800'
                    ]">
                      {{ formatDateWithTime(comprobanteEncontrado.fecha_pago) }}
                    </p>
                    <p v-else class="text-gray-500 font-medium">No registrada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorBusqueda" class="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ExclamationCircleIcon class="w-6 h-6 text-white" />
              </div>
              <p class="text-red-800 font-semibold">{{ errorBusqueda }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <button 
            @click="cerrarModalBuscarComprobante"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cuotas del Socio por Mes -->
    <div v-if="modalCuotasSocio" data-modal="cuotas-socio" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalCuotasSocio"></div>
      <div class="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0 z-10">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <img 
                v-if="socioParaCuotas"
                :src="getAvatarUrl(socioParaCuotas.nombre || socioParaCuotas.id, socioParaCuotas.avatar_seed, socioParaCuotas.avatar_style)" 
                :alt="socioParaCuotas.nombre"
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-white/30 shadow-md object-cover flex-shrink-0"
              />
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0" v-else>
                <CalendarDaysIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg sm:text-2xl font-display font-bold truncate">
                  Cuotas de {{ socioParaCuotas?.nombre }}
                </h3>
                <p class="text-white/90 text-xs sm:text-sm">
                  Historial de cuotas por mes
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <!-- Toggle Vista Simplificada -->
              <button 
                @click="vistaSimplificadaCuotas = !vistaSimplificadaCuotas"
                class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                :title="vistaSimplificadaCuotas ? 'Vista completa' : 'Vista simplificada'"
              >
                <Squares2X2Icon v-if="!vistaSimplificadaCuotas" class="w-5 h-5" />
                <Bars3Icon v-else class="w-5 h-5" />
              </button>
              <button 
                @click="cerrarModalCuotasSocio"
                class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="overflow-y-auto flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4">
          <!-- Estado de carga -->
          <div v-if="loadingCuotasSocio" class="text-center py-12">
            <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-500 text-sm">Cargando cuotas...</p>
          </div>
          
          <!-- Sin cuotas -->
          <div v-else-if="cuotasSocioPorMes.length === 0" class="text-center py-12">
            <p class="text-gray-400 text-base sm:text-lg">No hay cuotas registradas</p>
          </div>
          
          <!-- Lista de cuotas agrupadas por mes -->
          <div v-else-if="!loadingCuotasSocio" class="space-y-4">
            <!-- Vista Completa -->
            <template v-if="!vistaSimplificadaCuotas">
              <!-- Iterar sobre grupos de meses -->
              <div
                v-for="(grupoMes, grupoIndex) in cuotasAgrupadasPorMes"
                :key="`${grupoMes.anio}-${grupoMes.mes}`"
                class="bg-gradient-to-br from-natillera-50 via-white to-emerald-50 rounded-3xl border-4 border-natillera-300 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden mb-6"
              >
                <!-- Encabezado del mes -->
                <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-natillera-200 via-natillera-100 to-emerald-200 border-b-4 border-natillera-400 backdrop-blur-sm">
                  <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200 flex items-center justify-center text-xl sm:text-4xl shadow-md sm:shadow-xl flex-shrink-0">
                    {{ getMesEmoji(grupoMes.mes) }}
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900 text-base sm:text-xl">
                      {{ getMesLabel(grupoMes.mes) }} {{ grupoMes.anio }}
                    </h4>
                    <p class="text-xs sm:text-sm text-emerald-600 font-semibold">
                      {{ grupoMes.cuotas.length }} {{ grupoMes.cuotas.length === 1 ? 'cuota' : 'cuotas' }}
                    </p>
                  </div>
                </div>
                
                <!-- Contenedor de cuotas del mes -->
                <div class="p-3 sm:p-4 space-y-3">
                <!-- Cuotas del mes -->
              <div
                v-for="(cuotaData, index) in grupoMes.cuotas"
                :key="cuotaData.id"
                class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                :style="{ animationDelay: `${index * 0.05}s` }"
                :class="[
                  cuotaData.estado === 'pagada' 
                    ? 'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40' :
                  cuotaData.estado === 'mora' 
                    ? `bg-red-50/90 border-[2.5px] border-red-300/80 shadow-md shadow-red-100/50 ring-1 ring-red-200/40 ${animacionesCuotasMora ? 'animate-mora-highlight' : ''}` :
                  cuotaData.estado === 'programada'
                    ? 'bg-gray-50/90 border-[2.5px] border-gray-300/80 shadow-md shadow-gray-100/50 ring-1 ring-gray-200/40' :
                  cuotaData.estado === 'pendiente'
                    ? 'bg-amber-50/90 border-[2.5px] border-amber-300/80 shadow-md shadow-amber-100/50 ring-1 ring-amber-200/40' :
                  'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40'
                ]"
              >
              <!-- Efecto de resaltado para cuotas en mora -->
              <div 
                v-if="cuotaData.estado === 'mora' && animacionesCuotasMora"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/50 to-transparent animate-shimmer-mora pointer-events-none z-0"
              ></div>
              <!-- Borde pulsante para cuotas en mora -->
              <div 
                v-if="cuotaData.estado === 'mora' && animacionesCuotasMora"
                class="absolute inset-0 border-2 border-red-500 rounded-xl animate-pulse pointer-events-none z-0"
                style="animation-duration: 1.5s;"
              ></div>
              <div class="p-4 sm:p-4 relative">
                <!-- Móvil: Layout estilo imagen -->
                <div class="sm:hidden flex flex-col gap-3">
                  <!-- Layout principal: izquierda (botones y fechas) y derecha (montos) -->
                  <div class="flex items-start justify-between gap-4">
                    <!-- Lado izquierdo: Botones y fechas -->
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <!-- Botón de quincena -->
                      <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-sm">
                        {{ cuotaData.quincena === 1 ? '1ER' : '2DO' }} QUINCENA
                      </div>
                      
                      <!-- Badge de ajuste -->
                      <div 
                        v-if="cuotaData.descripcion && (cuotaData.descripcion.includes('Ajuste de valor') || cuotaData.descripcion.includes('Cuota ajustada'))"
                        class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"
                        :title="cuotaData.descripcion"
                      >
                        <InformationCircleIcon class="w-3.5 h-3.5" />
                      </div>
                      
                      <!-- Badge de estado -->
                      <div class="self-start">
                        <!-- Pago parcial tiene prioridad sobre estado pagada -->
                        <span 
                          v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-200/90 text-orange-800 border border-orange-300/60 shadow-sm"
                        >
                          PAGO PARCIAL
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pagada' || (cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)))"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-200/90 text-green-800 border border-green-300/60 shadow-sm"
                        >
                          PAGADA
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'mora'"
                          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-200/90 text-red-800 border border-red-300/60 shadow-sm"
                        >
                          EN MORA
                          <span v-if="cuotaData.diasMora > 0" class="text-red-900 font-extrabold">
                            ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                          </span>
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pendiente' && !(cuotaData.valorPagado > 0)"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-200/90 text-amber-800 border border-amber-300/60 shadow-sm"
                        >
                          PENDIENTE
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'programada' || (!cuotaData.estado && cuotaData.valorPagado === 0)"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-200/90 text-gray-800 border border-gray-300/60 shadow-sm"
                        >
                          PROGRAMADA
                        </span>
                      </div>

                      <!-- Fecha de vencimiento -->
                      <div class="flex items-center gap-2 mt-1">
                        <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span class="text-xs text-gray-600">
                          Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                        </span>
                      </div>
                    </div>

                    <!-- Lado derecho: Montos -->
                    <div class="flex flex-col items-end text-right flex-shrink-0">
                      <!-- Etiqueta según estado -->
                      <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-green-600 mb-1">
                        TOTAL PAGADO
                      </p>
                      <p v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-amber-600 mb-1">
                        PENDIENTE
                      </p>
                      <p v-else class="text-xs font-medium text-gray-500 mb-1">
                        MONTO CUOTA
                      </p>
                      
                      <!-- Monto principal -->
                      <p class="text-2xl font-bold mb-1" :class="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-green-600' : (cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-orange-600' : (cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'))">
                        <template v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                          <!-- Pago parcial: mostrar restante -->
                          ${{ formatMoney((cuotaData.valorCuota + (cuotaData.sancion || 0)) - cuotaData.valorPagado) }}
                        </template>
                        <template v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                          <!-- Total pagado -->
                          ${{ formatMoney(cuotaData.valorPagado) }}
                        </template>
                        <template v-else>
                          <!-- Monto a pagar -->
                          ${{ formatMoney(cuotaData.valorCuota + (cuotaData.sancion || 0)) }}
                        </template>
                      </p>
                      
                      <!-- Detalles de la cuota -->
                      <div class="flex flex-col items-end gap-0.5">
                        <p class="text-xs text-gray-500">
                          Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                        </p>
                        <p v-if="cuotaData.sancion > 0" class="text-xs text-red-600 font-medium">
                          Sanción: ${{ formatMoney(cuotaData.sancion) }}
                        </p>
                        <!-- En pago parcial: mostrar lo pagado -->
                        <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs text-green-600 font-medium mt-1">
                          Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Fecha de pago (si está pagada o parcialmente pagada) -->
                  <div v-if="cuotaData.valorPagado > 0 && cuotaData.fechaPago" class="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <CheckCircleIcon class="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span class="text-xs text-green-600 font-medium">
                      Pagado el: {{ formatDate(cuotaData.fechaPago) }}
                    </span>
                  </div>

                  <!-- Botón WhatsApp (si aplica) -->
                  <button
                    v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.telefono"
                    @click="enviarWhatsAppCuota(cuotaData)"
                    class="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                    title="Enviar recordatorio por WhatsApp"
                  >
                    <ChatBubbleLeftIcon class="w-4 h-4 flex-shrink-0" />
                    <span class="text-sm font-semibold">Recordar cuota</span>
                  </button>
                </div>

                <!-- Desktop: Layout horizontal original -->
                <div class="hidden sm:flex sm:flex-col sm:gap-3">
                  <!-- Fila superior: Badges y botones -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                      <!-- Badge de quincena -->
                      <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center border-2 border-purple-700 shadow-md">
                        {{ cuotaData.quincena === 1 ? '1er' : '2da' }} Quincena
                      </div>
                      <!-- Badge de estado -->
                      <span 
                        v-if="cuotaData.estado === 'pagada'"
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-200/90 text-green-800 border border-green-300/70 shadow-sm"
                      >
                        pagada
                      </span>
                      <span 
                        v-else-if="cuotaData.estado === 'mora'"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-200/90 text-red-800 border border-red-300/70 shadow-sm"
                      >
                        en mora
                        <span v-if="cuotaData.diasMora > 0" class="text-red-900 font-extrabold">
                          ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                        </span>
                      </span>
                      <span 
                        v-else-if="cuotaData.estado === 'pendiente'"
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-200/90 text-amber-800 border border-amber-300/70 shadow-sm"
                      >
                        pendiente
                      </span>
                      <span 
                        v-else
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-200/90 text-gray-800 border border-gray-300/70 shadow-sm"
                      >
                        programada
                      </span>
                    </div>
                    <!-- Botón WhatsApp -->
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                      @click="enviarWhatsAppCuota(cuotaData)"
                      class="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <ChatBubbleLeftIcon class="w-5 h-5 flex-shrink-0" />
                    </button>
                  </div>

                  <!-- Fila media: Monto principal -->
                  <div class="flex items-baseline justify-between gap-3">
                    <div class="flex-1">
                      <p class="text-xl font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                        ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                      </p>
                      <div class="flex items-center gap-2 mt-1 flex-wrap">
                        <p class="text-sm text-gray-600 font-medium">
                          Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                        </p>
                        <p v-if="cuotaData.sancion > 0" class="text-sm text-red-600 font-semibold">
                          + Sanción: ${{ formatMoney(cuotaData.sancion) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Fila inferior: Detalles adicionales -->
                  <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
                    <div class="flex items-center gap-1.5">
                      <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span class="text-sm text-gray-600">
                        Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                      </span>
                    </div>
                    <p v-if="cuotaData.valorPagado > 0" class="text-sm font-semibold text-green-600 whitespace-nowrap">
                      Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                    </p>
                  </div>
                </div>
              </div>
              </div>
              <!-- Fin del contenedor de cuotas del mes -->
                </div>
              <!-- Fin del grupo de mes -->
            </div>
            </template>
            
            <!-- Vista Simplificada -->
            <template v-else>
              <!-- Iterar sobre grupos de meses -->
              <div
                v-for="(grupoMes, grupoIndex) in cuotasAgrupadasPorMes"
                :key="`${grupoMes.anio}-${grupoMes.mes}-simplificado`"
                class="bg-gradient-to-br from-natillera-50 via-white to-emerald-50 rounded-3xl border-4 border-natillera-300 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden mb-6"
              >
                <!-- Encabezado del mes -->
                <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-natillera-200 via-natillera-100 to-emerald-200 border-b-4 border-natillera-400 backdrop-blur-sm">
                  <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200 flex items-center justify-center text-xl sm:text-4xl shadow-md sm:shadow-xl flex-shrink-0">
                    {{ getMesEmoji(grupoMes.mes) }}
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900 text-base sm:text-xl">
                      {{ getMesLabel(grupoMes.mes) }} {{ grupoMes.anio }}
                    </h4>
                    <p class="text-xs sm:text-sm text-emerald-600 font-semibold">
                      {{ grupoMes.cuotas.length }} {{ grupoMes.cuotas.length === 1 ? 'cuota' : 'cuotas' }}
                    </p>
                  </div>
                </div>
                
                <!-- Contenedor de cuotas del mes -->
                <div class="p-3 sm:p-4 space-y-3">
                <!-- Cuotas del mes -->
              <div
                v-for="(cuotaData, index) in grupoMes.cuotas"
                :key="cuotaData.id"
                class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                :style="{ animationDelay: `${index * 0.03}s` }"
                :class="[
                  cuotaData.estado === 'pagada' 
                    ? 'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40' :
                  cuotaData.estado === 'mora' 
                    ? `bg-red-50/90 border-[2.5px] border-red-300/80 shadow-md shadow-red-100/50 ring-1 ring-red-200/40 ${animacionesCuotasMora ? 'animate-mora-highlight' : ''}` :
                  cuotaData.estado === 'programada'
                    ? 'bg-gray-50/90 border-[2.5px] border-gray-300/80 shadow-md shadow-gray-100/50 ring-1 ring-gray-200/40' :
                  cuotaData.estado === 'pendiente'
                    ? 'bg-amber-50/90 border-[2.5px] border-amber-300/80 shadow-md shadow-amber-100/50 ring-1 ring-amber-200/40' :
                  'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40'
                ]"
              >
                <!-- Efecto de resaltado para cuotas en mora -->
                <div 
                  v-if="cuotaData.estado === 'mora' && animacionesCuotasMora"
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/30 to-transparent animate-shimmer-mora pointer-events-none z-0"
                ></div>
                
                <div class="p-4 sm:p-4 relative z-10">
                  <!-- Móvil: Layout estilo imagen -->
                  <div class="sm:hidden flex flex-col gap-3">
                    <!-- Layout principal: izquierda (botones y fechas) y derecha (montos) -->
                    <div class="flex items-start justify-between gap-4">
                      <!-- Lado izquierdo: Botones y fechas -->
                      <div class="flex flex-col gap-2 flex-1 min-w-0">
                        <!-- Botón de quincena -->
                        <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-sm">
                          {{ cuotaData.quincena === 1 ? '1ER' : '2DO' }} QUINCENA
                        </div>
                        
                        <!-- Badge de ajuste -->
                        <div 
                          v-if="cuotaData.descripcion && (cuotaData.descripcion.includes('Ajuste de valor') || cuotaData.descripcion.includes('Cuota ajustada'))"
                          class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"
                          :title="cuotaData.descripcion"
                        >
                          <InformationCircleIcon class="w-3.5 h-3.5" />
                        </div>
                        
                        <!-- Badge de estado -->
                        <div class="self-start">
                          <!-- Pago parcial tiene prioridad sobre estado pagada -->
                          <span 
                            v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700"
                          >
                            PAGO PARCIAL
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'pagada' || (cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)))"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700"
                          >
                            PAGADA
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'mora'"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700"
                          >
                            EN MORA
                            <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                              ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                            </span>
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'pendiente' && !(cuotaData.valorPagado > 0)"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700"
                          >
                            PENDIENTE
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'programada' || (!cuotaData.estado && cuotaData.valorPagado === 0)"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700"
                          >
                            PROGRAMADA
                          </span>
                        </div>

                        <!-- Fecha de vencimiento -->
                        <div class="flex items-center gap-2 mt-1">
                          <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span class="text-xs text-gray-600">
                            Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                          </span>
                        </div>
                      </div>

                      <!-- Lado derecho: Montos -->
                      <div class="flex flex-col items-end text-right flex-shrink-0">
                        <!-- Etiqueta según estado -->
                        <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-green-600 mb-1">
                          TOTAL PAGADO
                        </p>
                        <p v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-orange-600 mb-1">
                          PAGO PARCIAL
                        </p>
                        <p v-else class="text-xs font-medium text-gray-500 mb-1">
                          MONTO CUOTA
                        </p>
                        
                        <!-- Monto principal -->
                        <p class="text-2xl font-bold mb-1" :class="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-green-600' : (cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-orange-600' : (cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'))">
                          <template v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                            <!-- Pago parcial: mostrar restante -->
                            ${{ formatMoney((cuotaData.valorCuota + (cuotaData.sancion || 0)) - cuotaData.valorPagado) }}
                          </template>
                          <template v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                            <!-- Total pagado -->
                            ${{ formatMoney(cuotaData.valorPagado) }}
                          </template>
                          <template v-else>
                            <!-- Monto a pagar -->
                            ${{ formatMoney(cuotaData.valorCuota + (cuotaData.sancion || 0)) }}
                          </template>
                        </p>
                        
                        <!-- Detalles de la cuota -->
                        <div class="flex flex-col items-end gap-0.5">
                          <p class="text-xs text-gray-500">
                            Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                          </p>
                          <p v-if="cuotaData.sancion > 0" class="text-xs text-red-600 font-medium">
                            Sanción: ${{ formatMoney(cuotaData.sancion) }}
                          </p>
                          <!-- En pago parcial: mostrar lo pagado -->
                          <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs text-green-600 font-medium mt-1">
                            Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Fecha de pago (si está pagada o parcialmente pagada) -->
                    <div v-if="cuotaData.valorPagado > 0 && cuotaData.fechaPago" class="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <CheckCircleIcon class="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span class="text-xs text-green-600 font-medium">
                        Pagado el: {{ formatDate(cuotaData.fechaPago) }}
                      </span>
                    </div>

                    <!-- Botón WhatsApp (si aplica) -->
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.telefono"
                      @click="enviarWhatsAppCuota(cuotaData)"
                      class="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <ChatBubbleLeftIcon class="w-4 h-4 flex-shrink-0" />
                      <span class="text-sm font-semibold">Recordar cuota</span>
                    </button>
                  </div>

                  <!-- Desktop: Layout horizontal original -->
                  <div class="hidden sm:flex sm:flex-col sm:gap-3">
                    <!-- Fila superior: Badges y botones -->
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <!-- Badge de quincena -->
                        <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center border-2 border-purple-700 shadow-md">
                          {{ cuotaData.quincena === 1 ? '1er' : '2da' }} Quincena
                        </div>
                        <!-- Badge de estado -->
                        <span 
                          v-if="cuotaData.estado === 'pagada'"
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm"
                        >
                          pagada
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'mora'"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm"
                        >
                          en mora
                          <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                            ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                          </span>
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pendiente'"
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm"
                        >
                          pendiente
                        </span>
                        <span 
                          v-else
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                        >
                          programada
                        </span>
                      </div>
                      <!-- Botón WhatsApp -->
                      <button
                        v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                        @click="enviarWhatsAppCuota(cuotaData)"
                        class="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <ChatBubbleLeftIcon class="w-5 h-5 flex-shrink-0" />
                      </button>
                    </div>

                    <!-- Fila media: Monto principal -->
                    <div class="flex items-baseline justify-between gap-3">
                      <div class="flex-1">
                        <p class="text-xl font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                          ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                        </p>
                        <div class="flex items-center gap-2 mt-1 flex-wrap">
                          <p class="text-sm text-gray-600 font-medium">
                            Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                          </p>
                          <p v-if="cuotaData.sancion > 0" class="text-sm text-red-600 font-semibold">
                            + Sanción: ${{ formatMoney(cuotaData.sancion) }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Fila inferior: Detalles adicionales -->
                    <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
                      <div class="flex items-center gap-1.5">
                        <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span class="text-sm text-gray-600">
                          Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                        </span>
                      </div>
                      <p v-if="cuotaData.valorPagado > 0" class="text-sm font-semibold text-green-600 whitespace-nowrap">
                        Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Fin del contenedor de cuotas del mes -->
                </div>
              <!-- Fin del grupo de mes simplificado -->
            </div>
            </template>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <button 
            @click="cerrarModalCuotasSocio"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Configurar Período de Meses -->
    <div v-if="modalConfigMeses" data-modal="config-meses" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalConfigMeses = false"></div>
      <div class="card relative w-full sm:max-w-md max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-2xl">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-natillera-700 rounded-xl flex items-center justify-center">
            <CalendarDaysIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-display font-bold text-gray-800">
              Configurar Período
            </h3>
            <p class="text-sm text-gray-500">
              Define los meses de duración de la natillera
            </p>
          </div>
        </div>

        <form @submit.prevent="guardarConfigMeses" class="space-y-4">
          <div>
            <label class="label">Año</label>
            <input 
              v-model.number="formConfigMeses.anio"
              type="number"
              class="input-field"
              :min="2020"
              :max="2100"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Mes de inicio</label>
              <select 
                v-model.number="formConfigMeses.mes_inicio"
                class="input-field"
                required
              >
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                  {{ mes.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="label">Mes de cierre</label>
              <select 
                v-model.number="formConfigMeses.mes_fin"
                class="input-field"
                required
              >
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                  {{ mes.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="bg-natillera-50 border border-natillera-200 rounded-xl p-4">
            <p class="text-sm text-natillera-700 font-medium">
              📅 La natillera tendrá cuotas desde <strong>{{ meses.find(m => m.value === formConfigMeses.mes_inicio)?.label }}</strong> 
              hasta <strong>{{ meses.find(m => m.value === formConfigMeses.mes_fin)?.label }}</strong> de <strong>{{ formConfigMeses.anio }}</strong>
            </p>
            <p class="text-xs text-natillera-600 mt-1">
              Total: {{ formConfigMeses.mes_fin >= formConfigMeses.mes_inicio 
                ? formConfigMeses.mes_fin - formConfigMeses.mes_inicio + 1 
                : 12 - formConfigMeses.mes_inicio + formConfigMeses.mes_fin + 1 }} meses
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalConfigMeses = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="natillerasStore.loading"
            >
              {{ natillerasStore.loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

    <!-- Modal Socios en Mora -->
    <div v-if="modalSociosEnMora" data-modal="socios-en-mora" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalSociosEnMora = false"></div>
      <div class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0 z-10" :class="sociosEnMora.length >= 3 ? 'from-red-500 via-rose-600 to-red-700' : 'from-amber-500 via-orange-600 to-amber-700'">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div class="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div :class="['w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg mt-0.5 sm:mt-0', sociosEnMora.length >= 3 ? 'bg-white/20 backdrop-blur-sm border border-white/30' : 'bg-white/20 backdrop-blur-sm border border-white/30']">
                <ExclamationTriangleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base sm:text-xl font-display font-bold mb-0.5 sm:mb-1">
                  Socios en Mora
                </h3>
                <p class="text-white/90 text-xs sm:text-sm leading-tight line-clamp-2">
                  {{ sociosEnMora.length }} {{ sociosEnMora.length === 1 ? 'socio requiere' : 'socios requieren' }} atención inmediata
                </p>
              </div>
            </div>
            <button 
              @click="modalSociosEnMora = false"
              class="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all mt-0.5 sm:mt-0"
            >
              <XMarkIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <!-- Resumen rápido -->
          <div :class="[
            'grid gap-3 sm:gap-4',
            totalSancionesMora > 0 && totalPrestamosVencidos > 0 
              ? 'grid-cols-2 sm:grid-cols-3' // 4 tarjetas en 2 filas: 3-1
              : totalSancionesMora > 0 || totalPrestamosVencidos > 0 
              ? 'grid-cols-2 sm:grid-cols-3' 
              : 'grid-cols-2 sm:grid-cols-2'
          ]">
            <div :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5',
              sociosEnMora.length >= 3 ? 'border-red-300/60 hover:border-red-400' : 'border-amber-300/60 hover:border-amber-400'
            ]">
              <p :class="[
                'font-bold mb-1',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl',
                sociosEnMora.length >= 3 ? 'text-red-600' : 'text-amber-600'
              ]">{{ totalCuotasMora }}</p>
              <p :class="[
                'font-semibold',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm',
                sociosEnMora.length >= 3 ? 'text-red-700' : 'text-amber-700'
              ]">Cuotas en mora</p>
            </div>
            <!-- Préstamos vencidos (solo si hay) -->
            <div v-if="totalPrestamosVencidos > 0" :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 border-purple-300/60 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5'
            ]">
              <p :class="[
                'font-bold mb-1 text-purple-600',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
              ]">{{ totalPrestamosVencidos }}</p>
              <p :class="[
                'font-semibold text-purple-700',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              ]">Préstamos vencidos</p>
              <p :class="[
                'text-purple-600 mt-0.5',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[8px] sm:text-[9px]' : 'text-[10px]'
              ]">{{ totalCuotasPrestamosVencidos }} {{ totalCuotasPrestamosVencidos === 1 ? 'cuota' : 'cuotas' }}</p>
            </div>
            <!-- Sanciones (solo si hay) -->
            <div v-if="totalSancionesMora > 0" :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 border-rose-300/60 hover:border-rose-400 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5'
            ]">
              <p :class="[
                'font-bold mb-1 text-rose-600',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
              ]">${{ formatMoneyShort(totalSancionesMora) }}</p>
              <p :class="[
                'font-semibold text-rose-700',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              ]">Total sanciones</p>
            </div>
            <div :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5 sm:col-span-2' : 'p-4 sm:p-5',
              sociosEnMora.length >= 3 ? 'border-orange-300/60 hover:border-orange-400' : 'border-yellow-300/60 hover:border-yellow-400'
            ]">
              <p :class="[
                'font-bold mb-1 text-orange-600',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
              ]">${{ formatMoneyShort(totalDeudaMora + totalDeudaPrestamosVencidos) }}</p>
              <p :class="[
                'font-semibold text-orange-700',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              ]">Total a cobrar</p>
            </div>
          </div>

          <!-- Lista de socios en mora -->
          <div class="space-y-3">
            <div 
              v-for="socioMora in sociosEnMora" 
              :key="socioMora.id"
              class="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-gray-200/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              :class="[
                socioMora.cuotasMora > 0 
                  ? 'bg-gradient-to-br from-white via-red-50/40 to-rose-50/30 border-red-200/60 hover:border-red-300' 
                  : 'bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 border-orange-200/60 hover:border-orange-300'
              ]"
            >
              <!-- Efectos decorativos de fondo -->
              <div 
                :class="[
                  'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-20 transition-opacity duration-300 group-hover:opacity-30',
                  socioMora.cuotasMora > 0 ? 'bg-red-300' : 'bg-orange-300'
                ]"
              ></div>
              
              <!-- Línea decorativa superior -->
              <div 
                :class="[
                  'absolute top-0 left-0 right-0 h-0.5',
                  socioMora.cuotasMora > 0 ? 'bg-red-400/60' : 'bg-orange-400/60'
                ]"
              ></div>
              <div class="relative z-10">
                <!-- Layout móvil: datos financieros arriba -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <!-- Primera fila en móvil: Avatar y nombre -->
                  <div class="flex items-start gap-3 min-w-0 flex-1">
                    <img 
                      :src="getAvatarUrl(socioMora.nombre || socioMora.id, socioMora.avatar_seed, socioMora.avatar_style)" 
                      :alt="socioMora.nombre"
                      class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 border-2 shadow-md object-cover group-hover:scale-105 transition-transform duration-300"
                      :class="[socioMora.cuotasMora > 0 ? 'border-red-300' : 'border-orange-300']"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-900 text-base sm:text-lg group-hover:text-natillera-700 transition-colors truncate">{{ socioMora.nombre }}</p>
                      <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span v-if="socioMora.cuotasMora > 0" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">
                          {{ socioMora.cuotasMora }} en mora
                        </span>
                        <span v-if="socioMora.cuotasMora > 0 && socioMora.diasMora > 0" class="text-xs text-red-600 font-semibold whitespace-nowrap">
                          {{ socioMora.diasMora }} {{ socioMora.diasMora === 1 ? 'día' : 'días' }}
                        </span>
                        <span v-if="socioMora.tienePrestamosVencidos" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Préstamo sin pagar
                        </span>
                      </div>
                      <!-- Información de préstamo vencido - Móvil compacto -->
                      <div v-if="socioMora.tienePrestamosVencidos && socioMora.fechaVencimientoPrestamo" class="mt-1.5 sm:mt-2">
                        <div class="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                          <div class="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                            <CalendarDaysIcon class="w-3 h-3 flex-shrink-0" />
                            <span class="font-medium">Fecha de pago:</span>
                            <span class="font-semibold">{{ formatDate(socioMora.fechaVencimientoPrestamo) }}</span>
                          </div>
                          <div v-if="socioMora.diasMoraPrestamo > 0" class="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                            <ExclamationCircleIcon class="w-3 h-3 flex-shrink-0" />
                            <span class="font-medium">{{ socioMora.diasMoraPrestamo }}d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Datos financieros en móvil: debajo del nombre, en una sola línea compacta -->
                  <div v-if="socioMora.cuotasMora > 0" class="sm:hidden w-full -mt-2 pt-2 border-t border-gray-200/60">
                    <div class="space-y-2">
                      <!-- Cuotas en mora -->
                      <div class="flex items-center justify-between gap-3">
                        <!-- Total a cobrar - destacado -->
                        <div class="flex-1 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg px-2.5 py-1.5 border border-red-200/60">
                          <p class="text-[9px] text-gray-600 font-medium mb-0.5">Total a cobrar (cuotas)</p>
                          <p class="text-base font-bold text-red-600 leading-tight">${{ formatMoney(socioMora.totalConSanciones || socioMora.totalDeuda) }}</p>
                        </div>
                        
                        <!-- Valor cuota y Sanción - lado derecho compacto -->
                        <div class="flex flex-col gap-1.5 text-right">
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] text-gray-500">Cuota:</span>
                            <span class="text-[11px] font-semibold text-gray-700">${{ formatMoney(socioMora.valorCuotaPromedio || 0) }}</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] text-gray-500">Sanción:</span>
                            <span class="text-[11px] font-semibold text-rose-600">${{ formatMoney(socioMora.totalSanciones || 0) }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Préstamo en mora (si existe) -->
                      <div v-if="socioMora.tienePrestamosVencidos" class="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 border border-purple-200/60">
                        <div class="flex-1">
                          <p class="text-[9px] text-gray-600 font-medium mb-0.5">Préstamo en mora</p>
                          <p class="text-base font-bold text-purple-600 leading-tight">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                        </div>
                        <div class="flex items-center gap-2 text-right">
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Cuotas</span>
                            <span class="text-xs font-semibold text-gray-700">{{ socioMora.cuotasVencidasPrestamo }}</span>
                          </div>
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Días</span>
                            <span class="text-xs font-semibold text-red-600">{{ socioMora.diasMoraPrestamo || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Si solo tiene préstamos vencidos (sin cuotas) en móvil -->
                  <div v-else-if="socioMora.tienePrestamosVencidos && !socioMora.cuotasMora && !socioMora.cuotasPendientes" class="sm:hidden w-full -mt-1 pt-2 border-t border-gray-200/60">
                    <div class="flex items-center justify-between gap-2">
                      <!-- Total a cobrar préstamo - destacado -->
                      <div class="flex-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 border border-purple-200/60">
                        <p class="text-[9px] text-gray-600 font-medium mb-0.5">Préstamo vencido</p>
                        <p class="text-base font-bold text-purple-600 leading-tight">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      
                      <!-- Información adicional - lado derecho compacto -->
                      <div class="flex items-center gap-2 text-right">
                        <div class="flex flex-col">
                          <span class="text-[9px] text-gray-500">Cuotas</span>
                          <span class="text-xs font-semibold text-gray-700">{{ socioMora.cuotasVencidasPrestamo }}</span>
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[9px] text-gray-500">Días</span>
                          <span class="text-xs font-semibold text-red-600">{{ socioMora.diasMoraPrestamo || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Si tiene cuotas en mora y también préstamos vencidos en móvil -->
                  <div v-else-if="socioMora.tienePrestamosVencidos && socioMora.cuotasMora > 0" class="sm:hidden w-full -mt-2 pt-2 border-t border-gray-200/60">
                    <div class="space-y-2">
                      <!-- Cuotas en mora -->
                      <div class="text-left">
                        <p class="text-xs font-bold text-red-600">${{ formatMoney(socioMora.totalDeuda) }}</p>
                        <p class="text-[10px] text-gray-500">cuotas en mora</p>
                      </div>
                      
                      <!-- Préstamo en mora -->
                      <div class="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 border border-purple-200/60">
                        <div class="flex-1">
                          <p class="text-[9px] text-gray-600 font-medium mb-0.5">Préstamo en mora</p>
                          <p class="text-base font-bold text-purple-600 leading-tight">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                        </div>
                        <div class="flex items-center gap-2 text-right">
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Cuotas</span>
                            <span class="text-xs font-semibold text-gray-700">{{ socioMora.cuotasVencidasPrestamo }}</span>
                          </div>
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Días</span>
                            <span class="text-xs font-semibold text-red-600">{{ socioMora.diasMoraPrestamo || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Fallback -->
                  <div v-else class="sm:hidden w-full -mt-2">
                    <div class="text-left">
                      <p class="text-xs font-bold text-amber-600">${{ formatMoney(socioMora.totalDeuda) }}</p>
                      <p class="text-[10px] text-gray-500">adeudado</p>
                    </div>
                  </div>
                
                <!-- Botón en móvil: abajo -->
                <div class="sm:hidden flex flex-col gap-2">
                  <button
                    v-if="socioMora.cuotasMora > 0"
                    @click.stop="verCuotasSocio(socioMora)"
                    class="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Ver cuotas
                  </button>
                  <button
                    v-if="socioMora.tienePrestamosVencidos"
                    @click.stop="verPrestamoSocio(socioMora)"
                    class="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Ir al préstamo
                  </button>
                </div>
                
                <!-- Layout desktop: lado derecho con datos financieros y botón -->
                <div v-if="socioMora.cuotasMora > 0" class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-start gap-3">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Columna de etiquetas -->
                    <div class="text-right space-y-1">
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Total a cobrar</p>
                      </div>
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Valor cuota</p>
                      </div>
                      <div v-if="!socioMora.tienePrestamosVencidos">
                        <p class="text-[10px] text-gray-500">Sanción</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="text-[10px] text-gray-500">Sanción</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="text-[10px] text-gray-500">Préstamo en mora</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos">
                        <p class="text-[10px] text-gray-500">Cuotas vencidas</p>
                      </div>
                    </div>
                    
                    <!-- Columna de valores -->
                    <div class="text-right space-y-1 min-w-[100px]">
                      <div class="mb-1">
                        <p class="font-bold text-red-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalConSanciones || socioMora.totalDeuda) }}</p>
                      </div>
                      <div class="mb-1">
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">${{ formatMoney(socioMora.valorCuotaPromedio || 0) }}</p>
                      </div>
                      <div v-if="!socioMora.tienePrestamosVencidos">
                        <p class="font-semibold text-rose-600 text-xs sm:text-sm">${{ formatMoney(socioMora.totalSanciones || 0) }}</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="font-semibold text-rose-600 text-xs sm:text-sm">${{ formatMoney(socioMora.totalSanciones || 0) }}</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos">
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">{{ socioMora.cuotasVencidasPrestamo || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botones -->
                  <div class="flex flex-col gap-2">
                    <button
                      @click.stop="verCuotasSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ver cuotas
                    </button>
                    <button
                      v-if="socioMora.tienePrestamosVencidos"
                      @click.stop="verPrestamoSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ir al préstamo
                    </button>
                  </div>
                </div>
                
                <!-- Layout desktop: solo préstamos vencidos -->
                <div v-else-if="socioMora.tienePrestamosVencidos && !socioMora.cuotasMora" class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-start gap-3">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Columna de etiquetas -->
                    <div class="text-right space-y-1">
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Préstamo vencido</p>
                      </div>
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Cuotas vencidas</p>
                      </div>
                      <div>
                        <p class="text-[10px] text-gray-500">Días sin pago</p>
                      </div>
                    </div>
                    
                    <!-- Columna de valores -->
                    <div class="text-right space-y-1 min-w-[100px]">
                      <div class="mb-1">
                        <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      <div class="mb-1">
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">{{ socioMora.cuotasVencidasPrestamo || 0 }}</p>
                      </div>
                      <div>
                        <p class="font-semibold text-red-600 text-xs sm:text-sm">{{ socioMora.diasMoraPrestamo || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botón Ir al préstamo -->
                  <button
                    @click.stop="verPrestamoSocio(socioMora)"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Ir al préstamo
                  </button>
                </div>
                
                <!-- Si tiene cuotas en mora y también préstamos vencidos en desktop -->
                <div v-else-if="socioMora.cuotasMora > 0 && socioMora.tienePrestamosVencidos" class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-start gap-3">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Columna de etiquetas -->
                    <div class="text-right space-y-1">
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Cuotas en mora</p>
                      </div>
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Préstamo en mora</p>
                      </div>
                      <div>
                        <p class="text-[10px] text-gray-500">Cuotas vencidas</p>
                      </div>
                    </div>
                    
                    <!-- Columna de valores -->
                    <div class="text-right space-y-1 min-w-[100px]">
                      <div class="mb-1">
                        <p class="font-bold text-red-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeuda) }}</p>
                      </div>
                      <div class="mb-1">
                        <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">{{ socioMora.cuotasVencidasPrestamo || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botones -->
                  <div class="flex flex-col gap-2">
                    <button
                      @click.stop="verCuotasSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ver cuotas
                    </button>
                    <button
                      @click.stop="verPrestamoSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ir al préstamo
                    </button>
                  </div>
                </div>
                
                <!-- Si solo tiene préstamos vencidos (sin cuotas en mora) en desktop -->
                <div v-else class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-center gap-2">
                  <div class="text-right">
                    <p class="text-sm sm:text-base font-bold text-purple-600">${{ formatMoney(socioMora.totalDeudaPrestamo) }}</p>
                    <p class="text-xs text-gray-500">préstamo vencido</p>
                  </div>
                  <button
                    @click.stop="verPrestamoSocio(socioMora)"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Ir al préstamo
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cierre de Natillera -->
    <div v-if="modalCierreNatillera" data-modal="cierre-natillera" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalCierreNatillera = false"></div>
      <div class="relative w-full sm:max-w-5xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-red-500 via-orange-600 to-amber-700 p-4 sm:p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div class="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div class="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg mt-0.5 sm:mt-0 bg-white/20 backdrop-blur-sm border border-white/30">
                <XMarkIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-45" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base sm:text-xl font-display font-bold mb-0.5 sm:mb-1">
                  Cierre de Natillera
                </h3>
                <p class="text-white/90 text-xs sm:text-sm leading-tight line-clamp-2">
                  Resumen de pagos y descuentos por socio
                </p>
              </div>
            </div>
            <button 
              @click="modalCierreNatillera = false"
              class="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all mt-0.5 sm:mt-0"
            >
              <XMarkIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Loading -->
          <div v-if="calculandoCierre" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
            <p class="text-gray-500 text-sm">Calculando datos de cierre...</p>
          </div>

          <!-- Lista de socios -->
          <div v-else-if="datosCierre.length > 0" class="space-y-4">
            <div 
              v-for="(dato, index) in datosCierre" 
              :key="dato.socio?.id || index"
              class="relative overflow-hidden rounded-2xl p-4 sm:p-5 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-gray-50/40 to-white"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <!-- Header del socio -->
              <div class="relative z-10 flex items-center gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-200">
                <img 
                  :src="getAvatarUrl(dato.socio?.nombre || 'default', dato.socio?.avatar_seed, dato.socio?.avatar_style)" 
                  :alt="dato.socio?.nombre"
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-natillera-200 flex-shrink-0 object-cover"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-lg sm:text-xl text-gray-800 truncate">
                    {{ dato.socio?.nombre || 'Socio sin nombre' }}
                  </h4>
                  <p v-if="dato.socio?.telefono" class="text-sm text-gray-500 truncate">
                    {{ dato.socio.telefono }}
                  </p>
                </div>
              </div>

              <!-- Información detallada -->
              <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <!-- Monto ahorrado mensualmente -->
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Monto ahorrado mensualmente</p>
                  <p class="font-bold text-blue-600 text-lg sm:text-xl">${{ formatMoney(dato.montoAhorradoMensual) }}</p>
                </div>

                <!-- Cantidad de cuotas pagadas -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Cuotas pagadas</p>
                  <p class="font-bold text-green-600 text-lg sm:text-xl">{{ dato.cantidadCuotasPagadas }}</p>
                </div>

                <!-- Cantidad de cuotas en deuda -->
                <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-amber-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Cuotas en deuda</p>
                  <p class="font-bold text-amber-600 text-lg sm:text-xl">{{ dato.cantidadCuotasDeuda }}</p>
                </div>

                <!-- Utilidades -->
                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-purple-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Utilidades</p>
                  <p class="font-bold text-purple-600 text-lg sm:text-xl">${{ formatMoney(dato.utilidades) }}</p>
                </div>

                <!-- Total a entregar -->
                <div class="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 sm:p-4 border border-teal-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Total a entregar</p>
                  <p class="font-bold text-teal-600 text-lg sm:text-xl">${{ formatMoney(dato.totalAEntregar) }}</p>
                </div>

                <!-- Descuentos -->
                <div class="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-3 sm:p-4 border border-red-200">
                  <p class="text-xs text-gray-600 font-medium mb-1">Descuentos</p>
                  <p class="font-bold text-red-600 text-lg sm:text-xl">${{ formatMoney(dato.descuentos) }}</p>
                  <div v-if="dato.descuentosDesglose" class="mt-2 pt-2 border-t border-red-200/50 space-y-1">
                    <p class="text-[10px] text-red-600">
                      Préstamos: ${{ formatMoney(dato.descuentosDesglose.prestamosPendientes) }}
                    </p>
                    <p class="text-[10px] text-red-600">
                      Cuotas: ${{ formatMoney(dato.descuentosDesglose.cuotasSinPagar) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Total final destacado -->
              <div class="relative z-10 mt-4 pt-4 border-t-2 border-gray-300">
                <div class="flex items-center justify-between">
                  <p class="text-sm sm:text-base font-bold text-gray-700">Total a pagar al socio:</p>
                  <p class="text-xl sm:text-2xl font-extrabold" :class="dato.totalFinal >= 0 ? 'text-green-600' : 'text-red-600'">
                    ${{ formatMoney(dato.totalFinal) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin datos -->
          <div v-else class="text-center py-12">
            <p class="text-gray-500">No hay datos para mostrar</p>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!calculandoCierre && datosCierre.length > 0" class="border-t border-gray-200 bg-gray-50 p-4 sm:p-5 flex-shrink-0">
          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              @click="modalCierreNatillera = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              @click="confirmarCerrarNatillera"
              class="btn-primary flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
            >
              Confirmar Cierre
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Desglose Recaudación -->
    <div v-if="modalDesgloseRecaudacion" data-modal="desglose-recaudacion" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDesgloseRecaudacion = false"></div>
      </Transition>
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
      >
        <div class="relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
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
                ${{ formatMoney(estadisticas.totalRecaudadoEfectivo || 0) }}
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
                ${{ formatMoney(estadisticas.totalRecaudadoTransferencia || 0) }}
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
                <p class="text-purple-700 text-3xl sm:text-4xl font-extrabold mt-3">
                  ${{ formatMoney(estadisticas.totalAportado) }}
                </p>
                
                <!-- Porcentajes -->
                <div class="mt-4 pt-4 border-t border-purple-200 space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Efectivo:</span>
                    <span class="font-semibold text-green-700">
                      {{ estadisticas.totalAportado > 0 ? ((estadisticas.totalRecaudadoEfectivo || 0) / estadisticas.totalAportado * 100).toFixed(1) : 0 }}%
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Transferencia:</span>
                    <span class="font-semibold text-blue-700">
                      {{ estadisticas.totalAportado > 0 ? ((estadisticas.totalRecaudadoTransferencia || 0) / estadisticas.totalAportado * 100).toFixed(1) : 0 }}%
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
        </div>
      </Transition>
    </div>

    <!-- Modal Sin Socios -->
    <div v-if="modalSinSocios" data-modal="sin-socios" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalSinSocios = false"></div>
      <div class="relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <UsersIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-display font-bold">
                  Sin Socios
                </h3>
                <p class="text-white/90 text-sm">
                  Tu natillera está lista para comenzar
                </p>
              </div>
            </div>
            <button 
              @click="modalSinSocios = false"
              class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido -->
        <div class="overflow-y-auto flex-1 p-6 space-y-6">
          <!-- Ilustración/Icono -->
          <div class="flex justify-center">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-natillera-100 to-emerald-100 flex items-center justify-center shadow-lg">
              <UsersIcon class="w-16 h-16 text-natillera-600" />
            </div>
          </div>

          <!-- Mensaje principal -->
          <div class="text-center space-y-3">
            <h4 class="text-xl font-display font-bold text-gray-800">
              ¡Comienza tu natillera agregando socios!
            </h4>
            <p class="text-gray-600 leading-relaxed">
              Para que tu natillera pueda empezar a funcionar, necesitas agregar al menos un socio. Los socios son los participantes que realizarán los aportes mensuales o quincenales.
            </p>
          </div>

          <!-- Información adicional -->
          <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200">
            <div class="flex items-start gap-3">
              <InformationCircleIcon class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div class="flex-1">
                <p class="font-semibold text-gray-800 mb-1">¿Qué sigue después?</p>
                <p class="text-sm text-gray-600">
                  Una vez agregues socios, podrás gestionar cuotas, préstamos, actividades y mucho más para tu natillera.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          <button 
            @click="modalSinSocios = false; router.push(`/natilleras/${id}/socios?agregar=true`)"
            class="w-full px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 hover:shadow-xl flex items-center justify-center gap-2"
          >
            <PlusIcon class="w-5 h-5" />
            <span>Crear Primer Socio</span>
          </button>
          <button 
            @click="modalSinSocios = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Componente ColaboradoresManager oculto para acceder a sus métodos -->
    <div class="hidden">
      <ColaboradoresManager
        ref="colaboradoresManagerRef"
        :natillera-id="id"
        :admin-id="natillera?.admin_id"
        :admin-email="adminActual?.email || ''"
        :admin-nombre="adminActual?.nombre || adminActual?.email || ''"
        :es-admin="esAdmin"
      />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  PlusIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChartBarIcon,
  Squares2X2Icon,
  DocumentCheckIcon
} from '@heroicons/vue/24/outline'
import { useSociosStore } from '../../stores/socios'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useCuotasStore } from '../../stores/cuotas'
import { useAuthStore } from '../../stores/auth'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { getNatilleraAvatarUrl } from '../../utils/avatars'
import { supabase } from '../../lib/supabase'
import ColaboradoresManager from '../../components/ColaboradoresManager.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { formatDate, formatDateWithTime } from '../../utils/formatDate'

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const sociosStore = useSociosStore()
const configStore = useConfiguracionStore()
const cuotasStore = useCuotasStore()
const authStore = useAuthStore()
const colaboradoresStore = useColaboradoresStore()

const modalWhatsApp = ref(false)
const modalDetalle = ref(false)
const modalConfigMeses = ref(false)
const modalBuscarComprobante = ref(false)
const modalCuotasSocio = ref(false)
const animacionesCuotasMora = ref(true) // Controla si se muestran las animaciones de cuotas en mora
const modalSociosEnMora = ref(false)
const modalDesgloseRecaudacion = ref(false)
const loadingCuotasSocio = ref(false)
const colaboradoresManagerRef = ref(null)
const vistaSimplificadaCuotas = ref(false)
const socioSeleccionado = ref(null)
const cuotasSocio = ref([])
const cuotasSocioPorMes = ref([])
const socioParaCuotas = ref(null)
const seccionActiva = ref('finanzas')
const busquedaSocio = ref('')
const codigoBusqueda = ref('')
const comprobanteEncontrado = ref(null)
const infoComprobanteAntiguo = ref(null)
const comprobanteNuevo = ref(null) // Guardar el comprobante nuevo cuando se encuentra uno antiguo
const errorBusqueda = ref('')
const buscandoComprobante = ref(false)
const inputBusquedaRef = ref(null)
const seccionAlertasRef = ref(null) // Ya no se usa, pero se mantiene por compatibilidad
const bannerSociosEnMoraRef = ref(null)
const cuotasNatillera = ref([])
const sancionesPorCuota = ref({}) // Sanciones calculadas dinámicamente
const configSancionesActiva = ref(false)
const prestamosVencidos = ref([]) // Préstamos con cuotas vencidas agrupadas por socio
const modalCierreNatillera = ref(false) // Modal de cierre de natillera
const modalSinSocios = ref(false) // Modal para cuando no hay socios
const datosCierre = ref([]) // Datos de cierre para cada socio
const calculandoCierre = ref(false) // Estado de carga de datos de cierre
const cargandoNatillera = ref(true) // Estado para la pantalla de carga completa

// Mensajes de carga que rotarán
const mensajesCarga = [
  'Calienta toda la suplencia...',
  'En poco estará todo listo',
  'Cargando datos de natilleras',
  'Ajustando condensador de flujo...',
  'Preparando todo para ti',
  'Cargando natillera...',
  'Abriendo el DRS',
  'Echandole mas agua a la sopa',
  'Poniendo neumaticos blandos',
  'Cargando informacion'
]
const mensajeCargaActual = ref(mensajesCarga[0])
let intervaloMensajeCarga = null

// Variable para mantener el índice anterior fuera del intervalo
let indiceMensajeAnterior = -1

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalWhatsApp)
useBodyScrollLock(modalDetalle)
useBodyScrollLock(modalConfigMeses)
useBodyScrollLock(modalBuscarComprobante)
useBodyScrollLock(modalCuotasSocio)
useBodyScrollLock(modalSociosEnMora)
useBodyScrollLock(modalCierreNatillera)
useBodyScrollLock(modalSinSocios)

// Obtener el ID de la natillera
const id = computed(() => props.id || route.params.id)

// Configuración de meses
const meses = [
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

const formConfigMeses = ref({
  mes_inicio: 1,
  mes_fin: 11,
  anio: new Date().getFullYear()
})

// Funciones para controlar el scroll del body
function bloquearScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

function desbloquearScroll() {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
}

// Función para iniciar la rotación de mensajes de carga (aleatoria)
function iniciarRotacionMensajes() {
  // Limpiar intervalo anterior si existe
  if (intervaloMensajeCarga) {
    clearInterval(intervaloMensajeCarga)
    intervaloMensajeCarga = null
  }
  
  // Seleccionar un mensaje aleatorio inicial
  indiceMensajeAnterior = Math.floor(Math.random() * mensajesCarga.length)
  mensajeCargaActual.value = mensajesCarga[indiceMensajeAnterior]
  
  // Cambiar mensaje cada 2 segundos de forma aleatoria
  intervaloMensajeCarga = setInterval(() => {
    let nuevoIndice
    // Si hay más de un mensaje, asegurarse de que no se repita el anterior
    if (mensajesCarga.length > 1) {
      do {
        nuevoIndice = Math.floor(Math.random() * mensajesCarga.length)
      } while (nuevoIndice === indiceMensajeAnterior)
    } else {
      nuevoIndice = 0
    }
    
    indiceMensajeAnterior = nuevoIndice
    mensajeCargaActual.value = mensajesCarga[nuevoIndice]
  }, 2000)
}

// Función para detener la rotación de mensajes
function detenerRotacionMensajes() {
  if (intervaloMensajeCarga) {
    clearInterval(intervaloMensajeCarga)
    intervaloMensajeCarga = null
  }
}

function abrirConfigMeses() {
  formConfigMeses.value = {
    mes_inicio: natillera.value?.mes_inicio || 1,
    mes_fin: natillera.value?.mes_fin || 11,
    anio: natillera.value?.anio || new Date().getFullYear()
  }
  modalConfigMeses.value = true
}

function abrirFormularioInvitarColaborador() {
  if (colaboradoresManagerRef.value) {
    colaboradoresManagerRef.value.abrirModalInvitar()
  }
}

async function guardarConfigMeses() {
  const result = await natillerasStore.actualizarNatillera(props.id || route.params.id, {
    mes_inicio: formConfigMeses.value.mes_inicio,
    mes_fin: formConfigMeses.value.mes_fin,
    anio: formConfigMeses.value.anio
  })
  
  if (result.success) {
    modalConfigMeses.value = false
    // Recargar la natillera para ver los cambios
    natillerasStore.fetchNatillera(props.id || route.params.id)
  } else {
    alert('Error al guardar la configuración: ' + result.error)
  }
}

// Computed para mostrar el rango de meses
const rangoMesesTexto = computed(() => {
  if (!natillera.value) return ''
  const inicio = meses.find(m => m.value === (natillera.value.mes_inicio || 1))?.label || 'Enero'
  const fin = meses.find(m => m.value === (natillera.value.mes_fin || 11))?.label || 'Noviembre'
  const anio = natillera.value.anio || new Date().getFullYear()
  return `${inicio} - ${fin} ${anio}`
})

// Socios filtrados por búsqueda en el modal de WhatsApp
const sociosFiltrados = computed(() => {
  if (!natillera.value?.socios_natillera) return []
  if (!busquedaSocio.value.trim()) return natillera.value.socios_natillera
  
  const busqueda = busquedaSocio.value.toLowerCase().trim()
  return natillera.value.socios_natillera.filter(sn => 
    sn.socio?.nombre?.toLowerCase().includes(busqueda) ||
    sn.socio?.telefono?.includes(busqueda)
  )
})

// Cuotas agrupadas por mes y año
const cuotasAgrupadasPorMes = computed(() => {
  if (!cuotasSocioPorMes.value || cuotasSocioPorMes.value.length === 0) return []
  
  const agrupadas = {}
  
  cuotasSocioPorMes.value.forEach(cuota => {
    const key = `${cuota.anio}-${cuota.mes}`
    if (!agrupadas[key]) {
      agrupadas[key] = {
        mes: cuota.mes,
        anio: cuota.anio,
        cuotas: []
      }
    }
    agrupadas[key].cuotas.push(cuota)
  })
  
  // Ordenar las cuotas dentro de cada grupo por quincena (si existe) o por fecha
  Object.keys(agrupadas).forEach(key => {
    agrupadas[key].cuotas.sort((a, b) => {
      if (a.quincena && b.quincena) {
        return a.quincena - b.quincena
      }
      if (a.quincena && !b.quincena) return -1
      if (!a.quincena && b.quincena) return 1
      return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    })
  })
  
  // Convertir a array y ordenar por año y mes (más antiguo primero)
  return Object.values(agrupadas).sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio
    return a.mes - b.mes
  })
})

const natillera = computed(() => natillerasStore.natilleraActual)

// Verificar si la natillera tiene socios
const tieneSocios = computed(() => {
  return natillera.value?.socios_natillera && natillera.value.socios_natillera.length > 0
})

// Convertir nombre a Upper Camel Case (con espacios)
const nombreNatilleraPascalCase = computed(() => {
  if (!natillera.value?.nombre) return ''
  return natillera.value.nombre
    .split(/\s+/)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ')
})

// Usuario autenticado y admin
const usuarioAutenticado = ref(null)
const adminActual = ref(null)
const miRol = ref(null)
const misPermisos = ref(null)

// Verificar si el usuario es superusuario
const esSuperUsuario = computed(() => {
  if (!usuarioAutenticado.value) return false
  const email = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  return email === 'raigo.16@gmail.com'
})

// Verificar si el usuario es admin de la natillera
const esAdmin = computed(() => {
  if (!usuarioAutenticado.value || !natillera.value) return false
  return natillera.value.admin_id === usuarioAutenticado.value.id || esSuperUsuario.value
})

// Verificar si el usuario es visor
const esVisor = computed(() => {
  return miRol.value === 'visor'
})

// Computed properties para verificar permisos específicos
const puedeVerSocios = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.editar_socios === true
})

const puedeVerCuotas = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.gestionar_cuotas === true
})

const puedeVerPrestamos = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.gestionar_prestamos === true
})

const puedeVerActividades = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.gestionar_actividades === true
})

const puedeConfigurar = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.configurar === true
})

const puedeBuscarComprobante = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.buscar_comprobante === true
})

const puedeInvitarColaboradores = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.invitar_colaboradores === true
})

const puedeNotificar = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.notificar === true
})

const puedeCerrarNatillera = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.cerrar_natillera === true
})

// Cargar información del administrador actual
async function cargarAdminActual() {
  if (!natillera.value?.admin_id) return

  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, email, nombre')
      .eq('id', natillera.value.admin_id)
      .single()

    adminActual.value = data
  } catch (e) {
    console.error('Error cargando administrador actual:', e)
  }
}

// Función para buscar comprobante
async function buscarComprobante() {
  if (!codigoBusqueda.value.trim()) return
  
  buscandoComprobante.value = true
  errorBusqueda.value = ''
  comprobanteEncontrado.value = null
  infoComprobanteAntiguo.value = null
  comprobanteNuevo.value = null
  
  try {
    // Primero buscar en cuotas
    const result = await cuotasStore.buscarCuotaPorCodigo(id.value, codigoBusqueda.value.trim())
    
    if (result.success) {
      // Si es un comprobante antiguo, mostrar información del código anterior
      if (result.esAntiguo && result.historial) {
        infoComprobanteAntiguo.value = result.historial
        comprobanteNuevo.value = result.data // Guardar el nuevo comprobante para cuando se consulte
        
        // Crear un objeto con la información del comprobante antiguo basado en el historial
        // Mostramos la información como era antes de la actualización
        comprobanteEncontrado.value = {
          ...result.data, // Mantener toda la información de la cuota (socio, descripción, etc.)
          codigo_comprobante: result.historial.codigoAnterior, // Código anterior
          valor_pagado: result.historial.valorPagadoAnterior, // Valor pagado anterior
          fecha_pago: null, // No hay fecha de pago para el código anterior ya que fue actualizado
          tipo: 'cuota' // Indicar que es una cuota
        }
      } else {
        // Si no es antiguo, mostrar normalmente
        comprobanteEncontrado.value = {
          ...result.data,
          tipo: 'cuota' // Indicar que es una cuota
        }
      }
    } else {
      // Si no se encuentra en cuotas, buscar en pagos de préstamos
      const codigo = codigoBusqueda.value.trim().toUpperCase()
      
      // Obtener los IDs de préstamos de esta natillera
      const { data: prestamosNatillera, error: prestamosError } = await supabase
        .from('prestamos')
        .select(`
          id,
          socio_natillera:socios_natillera!inner(
            id,
            natillera_id,
            socio:socios(*)
          )
        `)
        .eq('socios_natillera.natillera_id', id.value)
      
      if (prestamosError) throw prestamosError
      
      if (prestamosNatillera && prestamosNatillera.length > 0) {
        const prestamoIds = prestamosNatillera.map(p => p.id)
        
        // Primero buscar en pagos actuales
        const { data: pagoPrestamo, error: pagoError } = await supabase
          .from('pagos_prestamo')
          .select(`
            *,
            prestamo:prestamos(
              id,
              monto,
              saldo_actual,
              interes,
              numero_cuotas,
              tipo_interes,
              interes_anticipado,
              socio_natillera:socios_natillera(
                id,
                socio:socios(*)
              )
            )
          `)
          .eq('codigo_comprobante', codigo)
          .in('prestamo_id', prestamoIds)
          .maybeSingle()
        
        if (pagoError) throw pagoError
        
        if (pagoPrestamo) {
          // Formatear como comprobante de abono
          comprobanteEncontrado.value = {
            codigo_comprobante: pagoPrestamo.codigo_comprobante,
            valor_pagado: pagoPrestamo.valor,
            fecha_pago: pagoPrestamo.fecha,
            tipo: 'abono_prestamo', // Indicar que es un abono a préstamo
            socio_natillera: {
              socio: pagoPrestamo.prestamo?.socio_natillera?.socio || null
            },
            descripcion: 'Abono a Préstamo',
            prestamo: pagoPrestamo.prestamo,
            pago_prestamo: pagoPrestamo
          }
        } else {
          // Si no se encuentra en pagos actuales, buscar en historial
          try {
            // Buscar en historial directamente por código
            const { data: historialPrestamo, error: historialError } = await supabase
              .from('historial_comprobantes_prestamo')
              .select(`
                *,
                prestamo:prestamos(
                  id,
                  monto,
                  saldo_actual,
                  interes,
                  numero_cuotas,
                  tipo_interes,
                  interes_anticipado,
                  socio_natillera:socios_natillera(
                    id,
                    socio:socios(*)
                  )
                ),
                socio_natillera:socios_natillera(
                  id,
                  socio:socios(*)
                )
              `)
              .eq('codigo_comprobante_anterior', codigo)
              .order('fecha_actualizacion', { ascending: false })
              .limit(1)
              .maybeSingle()
            
            if (historialError && !historialError.message.includes('historial_comprobantes_prestamo')) {
              throw historialError
            }
            
            if (historialPrestamo) {
              // Obtener información del préstamo (puede venir del historial o de la relación)
              const prestamoHistorial = historialPrestamo.prestamo || null
              const socioNatillera = historialPrestamo.socio_natillera || prestamoHistorial?.socio_natillera || null
              
              // Verificar que el préstamo pertenezca a esta natillera
              const prestamoPerteneceNatillera = historialPrestamo.prestamo_id && 
                prestamoIds.includes(historialPrestamo.prestamo_id)
              
              if (prestamoPerteneceNatillera || !historialPrestamo.prestamo_id) {
                // Si fue eliminado, mostrar información de eliminación
                if (historialPrestamo.eliminado) {
                  comprobanteEncontrado.value = {
                    codigo_comprobante: historialPrestamo.codigo_comprobante_anterior,
                    valor_pagado: historialPrestamo.valor_abono_anterior,
                    fecha_pago: historialPrestamo.fecha_actualizacion,
                    tipo: 'abono_prestamo_eliminado',
                    eliminado: true,
                    eliminado_por: historialPrestamo.eliminado_por_email || 'Usuario desconocido',
                    eliminado_el: historialPrestamo.eliminado_el,
                    socio_natillera: {
                      socio: socioNatillera?.socio || null
                    },
                    descripcion: 'Abono a Préstamo (ELIMINADO)',
                    prestamo: prestamoHistorial || null,
                    historial: historialPrestamo
                  }
                } else {
                  // Si fue actualizado, mostrar información del código anterior
                  comprobanteEncontrado.value = {
                    codigo_comprobante: historialPrestamo.codigo_comprobante_anterior,
                    valor_pagado: historialPrestamo.valor_abono_anterior,
                    fecha_pago: historialPrestamo.fecha_actualizacion,
                    tipo: 'abono_prestamo_antiguo',
                    socio_natillera: {
                      socio: socioNatillera?.socio || null
                    },
                    descripcion: 'Abono a Préstamo (Código Actualizado)',
                    prestamo: prestamoHistorial || null,
                    codigo_nuevo: historialPrestamo.codigo_comprobante_nuevo,
                    historial: historialPrestamo
                  }
                }
              } else {
                errorBusqueda.value = 'No se encontró ningún comprobante con ese código'
              }
            } else {
              errorBusqueda.value = 'No se encontró ningún comprobante con ese código'
            }
          } catch (historialErr) {
            // Si hay error al buscar en historial, solo mostrar que no se encontró
            console.warn('Error buscando en historial:', historialErr)
            errorBusqueda.value = 'No se encontró ningún comprobante con ese código'
          }
        }
      } else {
        errorBusqueda.value = result.error || 'No se encontró el comprobante'
      }
    }
  } catch (e) {
    errorBusqueda.value = 'Error al buscar el comprobante: ' + e.message
  } finally {
    buscandoComprobante.value = false
  }
}

// Función para buscar por el código nuevo cuando se encuentra un comprobante antiguo
async function buscarPorCodigoNuevo() {
  if (!comprobanteNuevo.value) return
  
  // Mostrar el comprobante nuevo que ya tenemos guardado
  comprobanteEncontrado.value = comprobanteNuevo.value
  infoComprobanteAntiguo.value = null // Ocultar la alerta de comprobante antiguo
  codigoBusqueda.value = comprobanteNuevo.value.codigo_comprobante // Actualizar el campo de búsqueda
}

function cerrarModalBuscarComprobante() {
  modalBuscarComprobante.value = false
  codigoBusqueda.value = ''
  comprobanteEncontrado.value = null
  infoComprobanteAntiguo.value = null
  comprobanteNuevo.value = null
  errorBusqueda.value = ''
}

// Función para obtener préstamos con cuotas vencidas - OPTIMIZADA
async function obtenerPrestamosVencidos() {
  if (!id.value) return
  
  try {
    // OPTIMIZACIÓN: Una sola consulta con JOINs para obtener todos los datos necesarios
    // En lugar de 3 consultas secuenciales, usamos una consulta con relaciones anidadas
    const { data: prestamosConPagos, error: prestamosError } = await supabase
      .from('prestamos')
      .select(`
        id,
        socio_natillera_id,
        monto,
        saldo_actual,
        socio_natillera:socios_natillera!inner(
          id,
          natillera_id,
          socio:socios(*)
        ),
        plan_pagos_prestamo(
          id,
          numero_cuota,
          fecha_proyectada,
          valor_cuota,
          valor_pagado,
          pagada
        )
      `)
      .eq('socio_natillera.natillera_id', id.value)
      .eq('estado', 'activo')
    
    if (prestamosError) throw prestamosError
    if (!prestamosConPagos || prestamosConPagos.length === 0) {
      prestamosVencidos.value = []
      return
    }
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    // Procesar los datos en memoria (sin consultas adicionales)
    const sociosConPrestamosVencidos = {}
    
    prestamosConPagos.forEach(prestamo => {
      const planesPago = prestamo.plan_pagos_prestamo || []
      
      planesPago.forEach(plan => {
        const fechaProyectada = new Date(plan.fecha_proyectada)
        fechaProyectada.setHours(0, 0, 0, 0)
        
        // Verificar si la cuota está vencida y no está completamente pagada
        const valorCuota = parseFloat(plan.valor_cuota || 0)
        const valorPagado = parseFloat(plan.valor_pagado || 0)
        const estaVencida = hoy > fechaProyectada
        const noEstaPagada = !plan.pagada && valorPagado < valorCuota
        
        if (estaVencida && noEstaPagada) {
          const socioId = prestamo.socio_natillera_id
          
          if (!sociosConPrestamosVencidos[socioId]) {
            sociosConPrestamosVencidos[socioId] = {
              socio_natillera_id: socioId,
              socio: prestamo.socio_natillera?.socio,
              cuotasVencidas: 0,
              totalDeudaPrestamo: 0,
              diasMoraPrestamo: 0,
              fechaVencimientoMasAntigua: null,
              prestamoId: prestamo.id,
              cuotaVencidaMasAntigua: null
            }
          }
          
          sociosConPrestamosVencidos[socioId].cuotasVencidas++
          const deudaCuota = valorCuota - valorPagado
          sociosConPrestamosVencidos[socioId].totalDeudaPrestamo += deudaCuota
          
          // Calcular días de mora desde la fecha más antigua
          if (!sociosConPrestamosVencidos[socioId].fechaVencimientoMasAntigua || 
              fechaProyectada < sociosConPrestamosVencidos[socioId].fechaVencimientoMasAntigua) {
            sociosConPrestamosVencidos[socioId].fechaVencimientoMasAntigua = fechaProyectada
            sociosConPrestamosVencidos[socioId].cuotaVencidaMasAntigua = {
              id: plan.id,
              numero_cuota: plan.numero_cuota,
              fecha_proyectada: plan.fecha_proyectada,
              valor_cuota: valorCuota,
              valor_pagado: valorPagado,
              deuda: deudaCuota
            }
          }
        }
      })
    })
    
    // Calcular días de mora para cada socio
    Object.values(sociosConPrestamosVencidos).forEach(socio => {
      if (socio.fechaVencimientoMasAntigua) {
        socio.diasMoraPrestamo = Math.floor((hoy - socio.fechaVencimientoMasAntigua) / (1000 * 60 * 60 * 24))
        socio.diasMoraPrestamo = Math.max(0, socio.diasMoraPrestamo)
      }
    })
    
    prestamosVencidos.value = Object.values(sociosConPrestamosVencidos)
  } catch (error) {
    console.error('Error obteniendo préstamos vencidos:', error)
    prestamosVencidos.value = []
  }
}

// Socios con problemas de mora o pendientes vencidos (incluyendo préstamos)
const sociosEnMora = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // Agrupar cuotas por socio
  const sociosMap = {}
  
  // Procesar cuotas de natillera
  if (cuotasNatillera.value && cuotasNatillera.value.length > 0) {
    cuotasNatillera.value.forEach(cuota => {
      if (!cuota) return
      
      const socioId = cuota.socio_natillera_id
      if (!socioId) return
      
      const socioInfo = cuota.socio_natillera?.socio
      
      if (!sociosMap[socioId]) {
        sociosMap[socioId] = {
          id: socioId,
          nombre: socioInfo?.nombre || 'Sin nombre',
          avatar_seed: socioInfo?.avatar_seed || null,
          avatar_style: socioInfo?.avatar_style || 'adventurer',
          periodicidad: cuota.socio_natillera?.periodicidad || 'mensual',
          cuotasMora: 0,
          cuotasPendientes: 0,
          totalDeuda: 0,
          totalSanciones: 0,
          valorCuotaPromedio: 0,
          diasMora: 0,
          cuotasMoraList: [],
          socio: socioInfo || null,
          // Campos para préstamos
          tienePrestamosVencidos: false,
          cuotasVencidasPrestamo: 0,
          totalDeudaPrestamo: 0,
          diasMoraPrestamo: 0,
          prestamoId: null,
          fechaVencimientoPrestamo: null
        }
      }
      
      // Contar cuotas en mora
      if (cuota.estado === 'mora') {
        sociosMap[socioId].cuotasMora++
        const deudaCuota = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
        const sancionCuota = sancionesPorCuota.value[cuota.id] || 0
        sociosMap[socioId].totalDeuda += deudaCuota
        sociosMap[socioId].totalSanciones += sancionCuota
        sociosMap[socioId].cuotasMoraList.push(cuota)
        sociosMap[socioId].valorCuotaPromedio += cuota.valor_cuota || 0
      }
      // No contar cuotas pendientes vencidas - solo se muestran cuotas en mora
    })
  }
  
  // Agregar información de préstamos vencidos
  if (prestamosVencidos.value && prestamosVencidos.value.length > 0) {
    prestamosVencidos.value.forEach(prestamoVencido => {
      const socioId = prestamoVencido.socio_natillera_id
      
      if (!sociosMap[socioId]) {
        // Si el socio no tiene cuotas en mora pero sí préstamos vencidos, agregarlo
        sociosMap[socioId] = {
          id: socioId,
          nombre: prestamoVencido.socio?.nombre || 'Sin nombre',
          avatar_seed: prestamoVencido.socio?.avatar_seed || null,
          avatar_style: prestamoVencido.socio?.avatar_style || 'adventurer',
          periodicidad: 'mensual',
          cuotasMora: 0,
          cuotasPendientes: 0,
          totalDeuda: 0,
          totalSanciones: 0,
          valorCuotaPromedio: 0,
          diasMora: 0,
          cuotasMoraList: [],
          socio: prestamoVencido.socio || null,
          tienePrestamosVencidos: true,
          cuotasVencidasPrestamo: prestamoVencido.cuotasVencidas || 0,
          totalDeudaPrestamo: prestamoVencido.totalDeudaPrestamo || 0,
          diasMoraPrestamo: prestamoVencido.diasMoraPrestamo || 0,
          prestamoId: prestamoVencido.prestamoId || null,
          fechaVencimientoPrestamo: prestamoVencido.fechaVencimientoMasAntigua || null
        }
      } else {
        // Agregar información de préstamos vencidos al socio existente
        sociosMap[socioId].tienePrestamosVencidos = true
        sociosMap[socioId].cuotasVencidasPrestamo = prestamoVencido.cuotasVencidas || 0
        sociosMap[socioId].totalDeudaPrestamo = prestamoVencido.totalDeudaPrestamo || 0
        sociosMap[socioId].diasMoraPrestamo = prestamoVencido.diasMoraPrestamo || 0
        sociosMap[socioId].prestamoId = prestamoVencido.prestamoId || null
        sociosMap[socioId].fechaVencimientoPrestamo = prestamoVencido.fechaVencimientoMasAntigua || null
      }
    })
  }
  
  // Filtrar solo los que tienen problemas (cuotas en mora o préstamos vencidos) y calcular información adicional
  return Object.values(sociosMap)
    .filter(s => s.cuotasMora > 0 || s.tienePrestamosVencidos)
    .map(s => {
      // Calcular días de mora (basado en la cuota más antigua en mora)
      let diasMora = 0
      if (s.cuotasMoraList.length > 0) {
        const fechasLimite = s.cuotasMoraList
          .filter(c => c.fecha_limite)
          .map(c => {
            const fechaStr = c.fecha_limite
            let fechaLimite
            if (typeof fechaStr === 'string') {
              const [anio, mes, dia] = fechaStr.split('-').map(Number)
              fechaLimite = new Date(anio, mes - 1, dia)
            } else {
              fechaLimite = new Date(fechaStr)
            }
            fechaLimite.setHours(0, 0, 0, 0)
            return fechaLimite
          })
          .filter(f => !isNaN(f.getTime()))
          .sort((a, b) => a - b)
        
        if (fechasLimite.length > 0) {
          const fechaMasAntigua = fechasLimite[0]
          diasMora = Math.floor((hoy - fechaMasAntigua) / (1000 * 60 * 60 * 24))
          diasMora = Math.max(0, diasMora)
        }
      }
      
      // Si tiene préstamos vencidos, usar el mayor entre días de mora de cuotas y préstamos
      if (s.tienePrestamosVencidos && s.diasMoraPrestamo > diasMora) {
        diasMora = s.diasMoraPrestamo
      }
      
      // Calcular valor promedio de cuota
      const valorCuotaPromedio = s.cuotasMora > 0 
        ? Math.round(s.valorCuotaPromedio / s.cuotasMora)
        : 0
      
      // Obtener información completa del socio
      const socioCompleto = s.socio || (() => {
        const primeraCuota = s.cuotasMoraList[0] || cuotasNatillera.value?.find(c => c.socio_natillera_id === s.id)
        return primeraCuota?.socio_natillera?.socio || null
      })()
      
      // Calcular total de deuda incluyendo préstamos
      const totalDeudaCompleto = s.totalDeuda + (s.totalDeudaPrestamo || 0)
      
      return {
        ...s,
        // Total incluyendo sanciones y préstamos
        totalConSanciones: totalDeudaCompleto + s.totalSanciones,
        // Días de mora (mayor entre cuotas y préstamos)
        diasMora,
        // Valor promedio de cuota
        valorCuotaPromedio,
        // Información completa del socio
        socio: socioCompleto,
        // Total de deuda incluyendo préstamos
        totalDeuda: totalDeudaCompleto
      }
    })
    .sort((a, b) => {
      // Primero los que tienen más cuotas en mora o préstamos vencidos
      const problemasA = a.cuotasMora + a.cuotasVencidasPrestamo
      const problemasB = b.cuotasMora + b.cuotasVencidasPrestamo
      if (problemasB !== problemasA) return problemasB - problemasA
      // Luego por total de deuda con sanciones
      return b.totalConSanciones - a.totalConSanciones
    })
})

// Estadísticas de mora
const totalCuotasMora = computed(() => {
  if (!cuotasNatillera.value || !cuotasNatillera.value.length) return 0
  return cuotasNatillera.value.filter(c => c && c.estado === 'mora').length
})

const totalCuotasPendientes = computed(() => {
  if (!cuotasNatillera.value || !cuotasNatillera.value.length) return 0
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  return cuotasNatillera.value.filter(c => {
    if (!c || (c.estado !== 'pendiente' && c.estado !== 'parcial')) return false
    if (!c.fecha_limite) return false
    const fechaLimite = new Date(c.fecha_limite)
    fechaLimite.setHours(0, 0, 0, 0)
    return hoy > fechaLimite
  }).length
})

const totalDeudaMora = computed(() => {
  if (!sociosEnMora.value || !sociosEnMora.value.length) return 0
  return sociosEnMora.value.reduce((sum, s) => sum + (s?.totalConSanciones || s?.totalDeuda || 0), 0)
})

const totalSancionesMora = computed(() => {
  if (!sociosEnMora.value || !sociosEnMora.value.length) return 0
  return sociosEnMora.value.reduce((sum, s) => sum + (s?.totalSanciones || 0), 0)
})

// Estadísticas de préstamos vencidos
const totalPrestamosVencidos = computed(() => {
  if (!prestamosVencidos.value || !prestamosVencidos.value.length) return 0
  return prestamosVencidos.value.length
})

const totalCuotasPrestamosVencidos = computed(() => {
  if (!prestamosVencidos.value || !prestamosVencidos.value.length) return 0
  return prestamosVencidos.value.reduce((sum, p) => sum + (p?.cuotasVencidas || 0), 0)
})

const totalDeudaPrestamosVencidos = computed(() => {
  if (!prestamosVencidos.value || !prestamosVencidos.value.length) return 0
  return prestamosVencidos.value.reduce((sum, p) => sum + (p?.totalDeudaPrestamo || 0), 0)
})

// Resumen financiero del socio seleccionado
const resumenSocio = computed(() => {
  if (!cuotasSocio.value.length) {
    return {
      totalAportado: 0,
      totalPendiente: 0,
      cuotasPagadas: 0,
      cuotasPendientes: 0,
      cuotasMora: 0,
      alDia: true
    }
  }

  const pagadas = cuotasSocio.value.filter(c => c.estado === 'pagada')
  const pendientes = cuotasSocio.value.filter(c => c.estado === 'pendiente' || c.estado === 'parcial')
  const enMora = cuotasSocio.value.filter(c => c.estado === 'mora')

  // Calcular total aportado solo con valor_cuota (sin incluir sanciones)
  // Las sanciones se reflejan en utilidades
  const totalAportado = pagadas.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
  const totalPendiente = cuotasSocio.value
    .filter(c => c.estado !== 'pagada')
    .reduce((sum, c) => sum + (c.valor_cuota - (c.valor_pagado || 0)), 0)

  return {
    totalAportado,
    totalPendiente,
    cuotasPagadas: pagadas.length,
    cuotasPendientes: pendientes.length,
    cuotasMora: enMora.length,
    alDia: pendientes.length === 0 && enMora.length === 0
  }
})

const estadisticas = ref({
  totalSocios: 0,
  sociosActivos: 0,
  totalAportado: 0,
  totalPendiente: 0,
  utilidadActividades: 0,
  utilidadesRecogidas: 0,
  fondoTotal: 0,
  totalRecaudadoEfectivo: 0,
  totalRecaudadoTransferencia: 0
})

// Función para calcular estadísticas de forma asíncrona
async function calcularEstadisticasAsync() {
  if (!natillera.value) {
    estadisticas.value = {
      totalSocios: 0,
      sociosActivos: 0,
      totalAportado: 0,
      totalPendiente: 0,
      utilidadActividades: 0,
      utilidadesRecogidas: 0,
      fondoTotal: 0,
      totalRecaudadoEfectivo: 0,
      totalRecaudadoTransferencia: 0
    }
    return
  }
  
  const stats = await natillerasStore.calcularEstadisticas(natillera.value)
  estadisticas.value = stats || {
    totalSocios: 0,
    sociosActivos: 0,
    totalAportado: 0,
    totalPendiente: 0,
    utilidadActividades: 0,
    utilidadesRecogidas: 0,
    fondoTotal: 0,
    totalRecaudadoEfectivo: 0,
    totalRecaudadoTransferencia: 0
  }
}

function volverAtras() {
  // Navegar siempre al dashboard
  router.push('/dashboard')
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatMoneyShort(value) {
  const num = Math.abs(value || 0)
  
  if (num >= 1000000) {
    // Millones: 1M, 1.5M, 2.3M
    const millones = num / 1000000
    if (millones % 1 === 0) {
      return `${millones}M`
    }
    return `${millones.toFixed(1)}M`
  } else if (num >= 1000) {
    // Miles: 3.5K, 450K
    const miles = num / 1000
    if (miles % 1 === 0) {
      return `${miles}K`
    }
    return `${miles.toFixed(1)}K`
  }
  
  // Menos de 1000: mostrar el número completo
  return num.toString()
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

// Las funciones formatDate y formatDateWithTime ahora se importan desde utils/formatDate.js
// para evitar problemas de zona horaria. Las funciones locales fueron eliminadas.

function cerrarModalWhatsApp() {
  modalWhatsApp.value = false
  busquedaSocio.value = ''
}

function enviarWhatsApp(socioNatillera, cerrarModal = true) {
  const telefono = socioNatillera.socio?.telefono?.replace(/\D/g, '')
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado')
    return
  }

  // Usar el mensaje configurado con las variables reemplazadas
  const mensaje = configStore.generarMensajeIndividual(
    socioNatillera.socio?.nombre,
    formatMoney(socioNatillera.valor_cuota_individual)
  )

  const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
  if (cerrarModal) {
    cerrarModalWhatsApp()
  }
}

async function handleCerrarNatillera() {
  // Abrir modal de cierre
  await calcularDatosCierre()
  modalCierreNatillera.value = true
}

// Función para calcular los datos de cierre de la natillera
async function calcularDatosCierre() {
  if (!natillera.value || calculandoCierre.value) return
  
  calculandoCierre.value = true
  
  try {
    const natilleraId = id.value
    const socios = natillera.value.socios_natillera || []
    const cuotas = natillera.value.cuotas || []
    const actividades = natillera.value.actividades || []
    
    // Obtener préstamos pendientes
    const socioNatilleraIds = socios.map(s => s.id)
    const { data: prestamos, error: prestamosError } = await supabase
      .from('prestamos')
      .select(`
        id,
        socio_natillera_id,
        monto,
        saldo_actual,
        estado
      `)
      .in('socio_natillera_id', socioNatilleraIds)
      .in('estado', ['activo', 'pendiente'])
    
    if (prestamosError) {
      console.error('Error obteniendo préstamos:', prestamosError)
    }
    
    const prestamosPorSocio = {}
    ;(prestamos || []).forEach(p => {
      if (!prestamosPorSocio[p.socio_natillera_id]) {
        prestamosPorSocio[p.socio_natillera_id] = []
      }
      prestamosPorSocio[p.socio_natillera_id].push(p)
    })
    
    // Calcular utilidades totales
    const utilidadActividades = actividades.reduce((sum, a) => sum + (a.utilidad || 0), 0)
    
    // Obtener sanciones pagadas desde utilidades_clasificadas
    let sancionesPagadas = 0
    try {
      const { data: utilidadSanciones } = await supabase
        .from('utilidades_clasificadas')
        .select('monto')
        .eq('natillera_id', natilleraId)
        .eq('tipo', 'sanciones')
        .is('fecha_cierre', null)
        .maybeSingle()

      if (utilidadSanciones) {
        sancionesPagadas = parseFloat(utilidadSanciones.monto || 0)
      }
    } catch (e) {
      console.error('Error obteniendo sanciones desde utilidades_clasificadas:', e)
      // Fallback: calcular desde cuotas si hay error
      sancionesPagadas = cuotas
        .filter(c => c.estado === 'pagada' && c.valor_multa)
        .reduce((sum, c) => sum + (c.valor_multa || 0), 0)
    }
    
    // Obtener intereses de préstamos
    
    let interesesPrestamos = 0
    if (prestamos && prestamos.length > 0) {
      // Obtener préstamos pagados para calcular intereses
      const { data: prestamosPagados } = await supabase
        .from('prestamos')
        .select('monto, saldo_actual, interes, interes_anticipado, interes_total')
        .in('socio_natillera_id', socioNatilleraIds)
        .eq('estado', 'pagado')
      
      if (prestamosPagados) {
        interesesPrestamos = prestamosPagados.reduce((sum, prestamo) => {
          if (prestamo.interes_anticipado && prestamo.interes_total) {
            return sum + (parseFloat(prestamo.interes_total) || 0)
          }
          const monto = parseFloat(prestamo.monto || 0)
          const saldoActual = parseFloat(prestamo.saldo_actual || 0)
          const interes = parseFloat(prestamo.interes || 0)
          const interesGenerado = (monto - saldoActual) * (interes / 100)
          return sum + interesGenerado
        }, 0)
      }
    }
    
    const utilidadesTotales = sancionesPagadas + interesesPrestamos + utilidadActividades
    
    // Calcular total aportado (cuotas pagadas sin sanciones)
    // Usar valor_cuota directamente porque es el valor base sin sanción
    // Las sanciones se reflejan en utilidades
    const totalAportado = cuotas
      .filter(c => c.estado === 'pagada')
      .reduce((sum, c) => {
        const valorCuota = c.valor_cuota || 0
        return sum + valorCuota
      }, 0)
    
    // Calcular datos para cada socio
    const datosSocios = socios.map(socioNatillera => {
      const cuotasSocio = cuotas.filter(c => c.socio_natillera_id === socioNatillera.id)
      const cuotasPagadasSocio = cuotasSocio.filter(c => c.estado === 'pagada')
      const cuotasDeudaSocio = cuotasSocio.filter(c => c.estado !== 'pagada' && c.estado !== 'programada')
      
      // Calcular cuotas pagadas sin sanciones
      const totalCuotasPagadasSinSanciones = cuotasPagadasSocio.reduce((sum, c) => {
        const valorPagado = c.valor_pagado || 0
        const sancionPagada = c.valor_multa || 0
        return sum + (valorPagado - sancionPagada)
      }, 0)
      
      // Calcular valor de cuotas en deuda
      const valorCuotasDeuda = cuotasDeudaSocio.reduce((sum, c) => {
        return sum + ((c.valor_cuota || 0) - (c.valor_pagado || 0))
      }, 0)
      
      // Calcular préstamos pendientes
      const prestamosSocio = prestamosPorSocio[socioNatillera.id] || []
      const totalPrestamosPendientes = prestamosSocio.reduce((sum, p) => {
        return sum + (parseFloat(p.saldo_actual) || 0)
      }, 0)
      
      // Calcular utilidades del socio
      // Por ahora, distribuir proporcionalmente al aporte
      const porcentajeAporte = totalAportado > 0 ? totalCuotasPagadasSinSanciones / totalAportado : 0
      const utilidadesSocio = utilidadesTotales * porcentajeAporte
      
      // Total a entregar (cuotas pagadas sin sanciones + utilidades)
      const totalAEntregar = totalCuotasPagadasSinSanciones + utilidadesSocio
      
      // Descuentos (préstamos pendientes + cuotas sin pagar)
      const descuentos = totalPrestamosPendientes + valorCuotasDeuda
      
      // Total final (total a entregar - descuentos)
      const totalFinal = totalAEntregar - descuentos
      
      return {
        socio: socioNatillera.socio,
        montoAhorradoMensual: parseFloat(socioNatillera.valor_cuota_individual) || 0,
        cantidadCuotasPagadas: cuotasPagadasSocio.length,
        cantidadCuotasDeuda: cuotasDeudaSocio.length,
        utilidades: utilidadesSocio,
        totalAEntregar: totalAEntregar,
        descuentos: descuentos,
        descuentosDesglose: {
          prestamosPendientes: totalPrestamosPendientes,
          cuotasSinPagar: valorCuotasDeuda
        },
        totalFinal: totalFinal
      }
    })
    
    datosCierre.value = datosSocios
  } catch (error) {
    console.error('Error calculando datos de cierre:', error)
    alert('Error al calcular los datos de cierre: ' + error.message)
  } finally {
    calculandoCierre.value = false
  }
}

// Función para confirmar y cerrar la natillera
async function confirmarCerrarNatillera() {
  if (!confirm('¿Estás seguro de cerrar esta natillera? Esta acción no se puede deshacer.')) {
    return
  }
  
  const result = await natillerasStore.cerrarNatillera(props.id || route.params.id)
  if (result.success) {
    alert('Natillera cerrada exitosamente')
    modalCierreNatillera.value = false
    router.push('/dashboard')
  } else {
    alert('Error al cerrar la natillera: ' + result.error)
  }
}

function toggleSeccion(seccion) {
  seccionActiva.value = seccionActiva.value === seccion ? null : seccion
}

async function verDetalleSocio(sn) {
  socioSeleccionado.value = sn
  modalDetalle.value = true
  seccionActiva.value = 'finanzas'
  
  // Cargar cuotas del socio
  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  cuotasSocio.value = resumen?.cuotas || []
}

// Función para obtener el nombre del mes
function getMesLabel(mes) {
  const mesObj = meses.find(m => m.value === mes)
  return mesObj ? mesObj.label : `Mes ${mes}`
}

// Función para obtener el emoji del mes
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
    fechaVencimiento = new Date(fechaLimite)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
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

// Función para navegar a la vista de préstamos del socio
function verPrestamoSocio(socioMora) {
  if (socioMora.prestamoId) {
    // Navegar a la vista de préstamos con el ID del préstamo en el query
    router.push({
      path: `/natilleras/${id.value}/prestamos`,
      query: { prestamoId: socioMora.prestamoId }
    })
  } else {
    // Si no hay ID de préstamo, solo navegar a la vista de préstamos
    router.push(`/natilleras/${id.value}/prestamos`)
  }
}

// Función para abrir el modal de cuotas del socio
async function verCuotasSocio(socioMora) {
  // Desactivar animaciones de cuotas en mora al hacer clic en "ver cuotas"
  animacionesCuotasMora.value = false
  
  // Abrir la modal inmediatamente para una respuesta rápida
  socioParaCuotas.value = socioMora
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = true
  modalCuotasSocio.value = true
  
  // Cargar datos de forma asíncrona después de abrir la modal
  try {
    // Si viene de la modal de socios en mora y tiene cuotasMoraList, usar solo esas cuotas
    let cuotas = []
    if (socioMora.cuotasMoraList && socioMora.cuotasMoraList.length > 0) {
      // Usar solo las cuotas en mora
      cuotas = socioMora.cuotasMoraList
    } else {
      // Obtener las cuotas del socio (todas las cuotas, sin filtro de año)
      const resumen = await sociosStore.obtenerResumenSocio(socioMora.id)
      cuotas = resumen?.cuotas || []
    }
  
    // Obtener días de gracia de la natillera
    const diasGracia = natillera.value?.reglas_multas?.dias_gracia || 3
    
    // Calcular sanciones dinámicas para las cuotas del socio
    const natilleraId = props.id || route.params.id
    const resultSanciones = await cuotasStore.calcularSancionesTotales(natilleraId, cuotas)
    const sancionesSocio = resultSanciones.success ? (resultSanciones.sanciones || {}) : {}
    const sancionesActivas = resultSanciones.configActiva !== false // Verificar si las sanciones están activas
  
    // Procesar cada cuota individualmente
    const cuotasIndividuales = []
    
    cuotas.forEach(cuota => {
      if (!cuota.fecha_limite) return
      
      // Calcular el estado real de la cuota basándose en la fecha actual y días de gracia
      const estadoReal = calcularEstadoRealCuota(cuota, diasGracia)
      
      // Usar el campo mes de la cuota directamente (no calcular desde fecha_limite)
      const mes = cuota.mes || (() => {
        // Si no tiene campo mes, calcular desde fecha_limite como fallback
        let fecha
        if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
          const [anio, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
          fecha = new Date(anio, mesNum - 1, dia)
        } else {
          fecha = new Date(cuota.fecha_limite)
        }
        return fecha.getMonth() + 1
      })()
      
      // Usar el campo anio de la cuota directamente, o calcular desde fecha_limite como fallback
      const anio = cuota.anio || (() => {
        let fecha
        if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
          const [anioNum, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
          fecha = new Date(anioNum, mesNum - 1, dia)
        } else {
          fecha = new Date(cuota.fecha_limite)
        }
        return fecha.getFullYear()
      })()
      
      // Parsear fecha_limite correctamente y calcular fecha_vencimiento = fecha_limite + dias_gracia
      let fechaLimiteParaVencimiento
      if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
        const [anioNum, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
        fechaLimiteParaVencimiento = new Date(anioNum, mesNum - 1, dia)
      } else {
        fechaLimiteParaVencimiento = new Date(cuota.fecha_limite)
      }
      const fechaVencimiento = new Date(fechaLimiteParaVencimiento)
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
      
      // Obtener sanción de esta cuota - priorizar valor_multa persistido sobre sanciones dinámicas
      // Las multas deben persistir una vez asignadas, no recalcularse
      // Si las sanciones están inactivas, siempre usar 0
      let sancionCuota = 0
      if (sancionesActivas) {
        // IMPORTANTE: Priorizar valor_multa persistido sobre sanciones dinámicas
        // Esto asegura que las multas escalonadas persistan correctamente
        const valorMultaPersistido = parseFloat(cuota.valor_multa) || 0
        
        if (valorMultaPersistido > 0) {
          // Si hay multa persistida, usarla (no recalcular)
          sancionCuota = valorMultaPersistido
        } else if (cuota.estado === 'mora') {
          // Solo para cuotas en mora sin multa persistida, usar sanciones dinámicas
          sancionCuota = sancionesSocio[cuota.id] || 0
        } else {
          // Para cuotas con pago parcial que tienen valor_multa guardado (sanción pendiente),
          // seguir considerando la sanción hasta que se pague completamente
          if (cuota.valor_multa && cuota.valor_multa > 0) {
            const totalConSancion = (cuota.valor_cuota || 0) + cuota.valor_multa
            // Solo retornar la sanción si aún no se ha pagado el total
            if ((cuota.valor_pagado || 0) < totalConSancion) {
              sancionCuota = cuota.valor_multa
            }
          }
        }
      } else {
        // Si las sanciones están inactivas, no usar valor_multa antiguo
        sancionCuota = 0
      }
      
      // Calcular total con sanciones para esta cuota
      const deudaCuota = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
      let totalConSanciones = 0
      if (estadoReal !== 'pagada' && deudaCuota > 0) {
        totalConSanciones = deudaCuota + sancionCuota
      } else if (estadoReal === 'pagada') {
        totalConSanciones = 0
      } else {
        totalConSanciones = (cuota.valor_cuota || 0) + sancionCuota
      }
      
      // Calcular días en mora si está en mora
      let diasMora = 0
      if (estadoReal === 'mora' && fechaVencimiento) {
        const fechaActual = new Date()
        fechaActual.setHours(0, 0, 0, 0)
        const fechaVenc = new Date(fechaVencimiento)
        fechaVenc.setHours(0, 0, 0, 0)
        const diffTime = fechaActual.getTime() - fechaVenc.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        diasMora = Math.max(0, diffDays)
      }
      
      // Crear objeto de cuota individual para mostrar
      const cuotaIndividual = {
        id: cuota.id,
        mes, // Usar el campo mes de la cuota
        anio, // Usar el campo anio de la cuota
        estado: estadoReal, // Usar el estado real calculado
        valorCuota: cuota.valor_cuota || 0,
        valorPagado: cuota.valor_pagado || 0,
        sancion: sancionCuota,
        totalConSanciones: totalConSanciones,
        fechaVencimiento: fechaVencimiento, // Fecha de vencimiento parseada correctamente
        diasMora: diasMora,
        periodicidad: socioMora.periodicidad || 'mensual',
        quincena: cuota.quincena || null,
        descripcion: cuota.descripcion || null
      }
      
      cuotasIndividuales.push(cuotaIndividual)
    })
  
    // Si viene de la modal de socios en mora, filtrar solo las cuotas en estado "mora"
    let cuotasFiltradas = cuotasIndividuales
    if (socioMora.cuotasMoraList && socioMora.cuotasMoraList.length > 0) {
      cuotasFiltradas = cuotasIndividuales.filter(c => c.estado === 'mora')
    }
  
    // Ordenar por año, mes y fecha de vencimiento (más antiguo primero)
    cuotasSocioPorMes.value = cuotasFiltradas.sort((a, b) => {
      const anioA = a.anio || new Date(a.fechaVencimiento).getFullYear()
      const anioB = b.anio || new Date(b.fechaVencimiento).getFullYear()
      if (anioA !== anioB) return anioA - anioB
      
      const mesA = a.mes || new Date(a.fechaVencimiento).getMonth() + 1
      const mesB = b.mes || new Date(b.fechaVencimiento).getMonth() + 1
      if (mesA !== mesB) return mesA - mesB
      
      const fechaA = new Date(a.fechaVencimiento)
      const fechaB = new Date(b.fechaVencimiento)
      return fechaA.getTime() - fechaB.getTime()
    })
  } catch (error) {
    console.error('Error al cargar cuotas del socio:', error)
  } finally {
    loadingCuotasSocio.value = false
  }
}

function cerrarModalCuotasSocio() {
  modalCuotasSocio.value = false
  socioParaCuotas.value = null
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = false
}

// Funciones para controlar la visualización de la modal de socios en mora (máximo 2 veces por día)
function obtenerClaveModalSociosEnMora() {
  const fechaHoy = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return `modalSociosEnMora_${id.value}_${fechaHoy}`
}

function puedeMostrarModalSociosEnMora() {
  const clave = obtenerClaveModalSociosEnMora()
  const contador = parseInt(localStorage.getItem(clave) || '0', 10)
  return contador < 2
}

function incrementarContadorModalSociosEnMora() {
  const clave = obtenerClaveModalSociosEnMora()
  const contador = parseInt(localStorage.getItem(clave) || '0', 10)
  localStorage.setItem(clave, (contador + 1).toString())
}

// Función de debug para reiniciar el contador (solo para desarrollo)
function reiniciarContadorModalSociosEnMora() {
  const clave = obtenerClaveModalSociosEnMora()
  localStorage.removeItem(clave)
  console.log('✅ Contador de modal de socios en mora reiniciado para esta natillera')
  alert('Contador reiniciado. La modal se mostrará automáticamente la próxima vez que ingreses.')
}

// Exponer la función en window para acceso desde la consola (solo en desarrollo)
if (import.meta.env.DEV) {
  window.reiniciarContadorModalSociosEnMora = reiniciarContadorModalSociosEnMora
  window.verContadorModalSociosEnMora = () => {
    const clave = obtenerClaveModalSociosEnMora()
    const contador = parseInt(localStorage.getItem(clave) || '0', 10)
    console.log(`📊 Contador actual: ${contador}/2`)
    return contador
  }
}

// Función para enviar WhatsApp de una cuota específica
function enviarWhatsAppCuota(cuotaData) {
  // Obtener el teléfono del socio - puede venir de diferentes formas según el contexto
  let telefono = null
  let nombreSocio = 'Socio'
  
  if (socioParaCuotas.value) {
    // Si viene de la sección de alertas de mora (tiene socio.telefono)
    if (socioParaCuotas.value.socio?.telefono) {
      telefono = socioParaCuotas.value.socio.telefono
      nombreSocio = socioParaCuotas.value.socio.nombre || socioParaCuotas.value.nombre
    } 
    // Si viene directamente con telefono en el objeto raíz
    else if (socioParaCuotas.value.telefono) {
      telefono = socioParaCuotas.value.telefono
      nombreSocio = socioParaCuotas.value.nombre
    }
    // Si solo tiene nombre
    else {
      nombreSocio = socioParaCuotas.value.nombre || socioParaCuotas.value.socio?.nombre || 'Socio'
    }
  }
  
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado')
    return
  }
  
  const telefonoLimpio = telefono.replace(/\D/g, '')
  const mesLabel = getMesLabel(cuotaData.mes)
  const valorCuota = formatMoney(cuotaData.valorCuota)
  const sancion = formatMoney(cuotaData.sancion || 0)
  const totalAPagar = formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota)
  const fechaVencimiento = formatDate(cuotaData.fechaVencimiento)
  
  // Calcular días en mora si está en mora
  let diasMora = '0'
  if (cuotaData.estado === 'mora' && cuotaData.fechaVencimiento) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaVenc = new Date(cuotaData.fechaVencimiento)
    fechaVenc.setHours(0, 0, 0, 0)
    const diff = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24))
    diasMora = Math.max(0, diff).toString()
  }
  
  // Usar mensajes personalizados del store
  let mensaje
  if (cuotaData.estado === 'mora') {
    mensaje = configStore.generarMensajeCuotaMora(
      nombreSocio,
      mesLabel,
      cuotaData.anio?.toString() || '',
      valorCuota,
      sancion,
      totalAPagar,
      fechaVencimiento,
      diasMora
    )
  } else {
    mensaje = configStore.generarMensajeCuotaPendiente(
      nombreSocio,
      mesLabel,
      cuotaData.anio?.toString() || '',
      valorCuota,
      totalAPagar,
      fechaVencimiento
    )
  }
  
  const url = `https://wa.me/57${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}


// Observar cuando se abre la modal para poner el foco en el input
// Función para manejar el botón atrás del navegador en móvil
let modalHistoryState = null

function handleModalBack(modalRef, modalName) {
  watch(modalRef, (isOpen) => {
    if (isOpen) {
      // Verificar si hay otras modales abiertas
      const hayOtrasModales = modalWhatsApp.value || modalDetalle.value || 
                              modalConfigMeses.value || modalBuscarComprobante.value ||
                              (modalName !== 'sociosEnMora' && modalSociosEnMora.value) ||
                              (modalName !== 'cuotasSocio' && modalCuotasSocio.value)
      
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
  // Verificar modales en orden de z-index (las más altas primero)
  // Esto asegura que se cierre primero la modal superior cuando hay modales anidadas
  
  // Modal de cuotas del socio (z-60 - más alta)
  if (modalCuotasSocio.value) {
    cerrarModalCuotasSocio()
    // Si hay otra modal abierta debajo, no hacer nada más
    // La modal inferior ya tiene su entrada en el historial (fue agregada cuando se abrió)
    // El siguiente "atrás" naturalmente cerrará esa modal
    return
  }
  
  // Modal de socios en mora (z-50)
  if (modalSociosEnMora.value) {
    modalSociosEnMora.value = false
    // Si hay otra modal abierta debajo, no hacer nada más
    // La modal inferior ya tiene su entrada en el historial (fue agregada cuando se abrió)
    // El siguiente "atrás" naturalmente cerrará esa modal
    // Si no hay otras modales, no hacer nada más porque ya hay una entrada en el historial
    // que representa el estado "sin modales" (fue agregada cuando se abrió esta modal)
    return
  }
  
  // Modal WhatsApp (z-50)
  if (modalWhatsApp.value) {
    modalWhatsApp.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalDetalle.value) {
      history.pushState({ modal: 'detalle' }, '', window.location.href)
    } else if (modalConfigMeses.value) {
      history.pushState({ modal: 'configMeses' }, '', window.location.href)
    } else if (modalBuscarComprobante.value) {
      history.pushState({ modal: 'buscarComprobante' }, '', window.location.href)
    } else {
      // No hay otras modales, volver a la página anterior
      router.back()
    }
    return
  }
  
  // Modal Detalle (z-50)
  if (modalDetalle.value) {
    modalDetalle.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalConfigMeses.value) {
      history.pushState({ modal: 'configMeses' }, '', window.location.href)
    } else if (modalBuscarComprobante.value) {
      history.pushState({ modal: 'buscarComprobante' }, '', window.location.href)
    } else {
      // No hay otras modales, volver a la página anterior
      router.back()
    }
    return
  }
  
  // Modal Config Meses (z-50)
  if (modalConfigMeses.value) {
    modalConfigMeses.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalBuscarComprobante.value) {
      history.pushState({ modal: 'buscarComprobante' }, '', window.location.href)
    } else {
      // No hay otras modales, volver a la página anterior
      router.back()
    }
    return
  }
  
  // Modal Buscar Comprobante (z-50)
  if (modalBuscarComprobante.value) {
    modalBuscarComprobante.value = false
    // No hay otras modales, volver a la página anterior
    // Asegurar scroll antes de navegar
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    router.back()
    return
  }
  
  // Si no hay modales abiertas y se presionó atrás, asegurar que el scroll esté en la parte superior
  // Esto previene que el navegador restaure una posición de scroll anterior
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

// Registrar watchers para cada modal
handleModalBack(modalWhatsApp, 'whatsapp')
handleModalBack(modalDetalle, 'detalle')
handleModalBack(modalConfigMeses, 'configMeses')
handleModalBack(modalBuscarComprobante, 'buscarComprobante')
handleModalBack(modalCuotasSocio, 'cuotasSocio')
handleModalBack(modalSociosEnMora, 'sociosEnMora')

watch(modalBuscarComprobante, async (isOpen) => {
  if (isOpen) {
    // Esperar a que el DOM se actualice y luego poner el foco
    await nextTick()
    if (inputBusquedaRef.value) {
      inputBusquedaRef.value.focus()
    }
  }
})

// Función para hacer scroll al banner
async function scrollToBannerSociosEnMora() {
  if (!bannerSociosEnMoraRef.value) return
  
  await nextTick()
  
  // Hacer scroll suave al banner
  bannerSociosEnMoraRef.value.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  })
}

// Watch para detectar cuando hay socios en mora (scroll automático deshabilitado)
// watch(sociosEnMora, async (newValue, oldValue) => {
//   // Solo hacer scroll si antes no había socios en mora y ahora sí hay
//   if ((!oldValue || oldValue.length === 0) && newValue && newValue.length > 0) {
//     // Esperar un poco para que el DOM se actualice
//     await nextTick()
//     setTimeout(() => {
//       scrollToBannerSociosEnMora()
//     }, 300)
//   }
// }, { deep: true })

// Watch para recalcular estadísticas cuando cambie la natillera
watch(natillera, async () => {
  if (natillera.value) {
    await calcularEstadisticasAsync()
  }
}, { deep: true })

// Watch para asegurar scroll al inicio cuando se entra a la vista
watch(() => route.name, (newName, oldName) => {
  if (newName === 'NatilleraDetalle' && newName !== oldName) {
    // Asegurar que el scroll esté en la parte superior al entrar a la vista
    nextTick(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }, 50)
    })
  }
}, { immediate: true })

// Watch para detectar cambios en el ID de la natillera y recargar datos
watch(() => id.value, async (newId, oldId) => {
  // Solo recargar si el ID realmente cambió
  if (newId && newId !== oldId) {
    // Mostrar pantalla de carga cuando cambia el ID
    cargandoNatillera.value = true
    try {
      // OPTIMIZACIÓN: Cargar SOLO datos esenciales primero
      const [natilleraResult, cuotasResult] = await Promise.all([
        natillerasStore.fetchNatillera(newId),
        cuotasStore.fetchCuotasNatillera(newId, { skipMoraUpdate: true })
      ])
      
      cuotasNatillera.value = cuotasResult || []
      
      // Cargar configuración (no bloquea)
      configStore.cargarConfiguracion()
      
      // Ocultar pantalla de carga INMEDIATAMENTE después de datos esenciales
      await nextTick()
      cargandoNatillera.value = false
      
      // Cargar datos secundarios EN SEGUNDO PLANO (no bloquean la UI)
      Promise.all([
        calcularEstadisticasAsync(),
        obtenerPrestamosVencidos(),
        cuotasStore.calcularSancionesTotales(newId, cuotasResult)
      ]).then(([estadisticasResult, prestamosResult, sancionesResult]) => {
        if (sancionesResult?.success) {
          sancionesPorCuota.value = sancionesResult.sanciones || {}
          configSancionesActiva.value = sancionesResult.configActiva || false
        }
      }).catch(err => console.warn('Error cargando datos secundarios:', err))
      
      // Actualizar mora en segundo plano
      cuotasStore.actualizarEstadoMoraAutomatico(cuotasResult, newId)
        .then(() => cuotasStore.recalcularMultasCuotasMora(newId))
        .catch(err => console.warn('Error actualizando mora en segundo plano:', err))
    } catch (error) {
      console.error('Error recargando datos de natillera:', error)
      // Ocultar pantalla de carga incluso si hay error
      cargandoNatillera.value = false
    }
  }
})

// Watch para controlar el bloqueo de scroll cuando se muestra/oculta la animación
watch(cargandoNatillera, (mostrando) => {
  if (mostrando) {
    bloquearScroll()
    // Iniciar rotación con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      iniciarRotacionMensajes()
    }, 100)
  } else {
    desbloquearScroll()
    detenerRotacionMensajes()
  }
}, { immediate: true })

onMounted(async () => {
  // Activar pantalla de carga al inicio
  cargandoNatillera.value = true
  
  // Asegurar que el scroll esté en la parte superior al montar
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  
  // Prevenir restauración automática del scroll del navegador
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  
  // Agregar listener para el botón atrás
  window.addEventListener('popstate', handlePopState)
  
  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user
  
  try {
    const natilleraId = props.id || route.params.id
    
    // OPTIMIZACIÓN: Cargar SOLO datos esenciales primero para mostrar la UI lo más rápido posible
    // Fase 1: Cargar datos críticos en paralelo (solo lo necesario para renderizar)
    const [natilleraResult, cuotasResult] = await Promise.all([
      natillerasStore.fetchNatillera(natilleraId),
      // skipMoraUpdate: true para carga rápida inicial (mora se actualiza después)
      cuotasStore.fetchCuotasNatillera(natilleraId, { skipMoraUpdate: true })
    ])
    
    // Asignar cuotas inmediatamente
    cuotasNatillera.value = cuotasResult || []
    
    // Cargar configuración (no bloquea, se ejecuta en paralelo)
    configStore.cargarConfiguracion()
    
    // Cargar información del administrador (no crítico, puede ser en paralelo)
    cargarAdminActual().catch(err => console.warn('Error cargando admin:', err))
    
    // Obtener el rol y permisos del usuario en la natillera
    // Esperar a que natillera.value esté disponible
    await nextTick()
    if (natillera.value) {
      if (!esAdmin.value) {
        try {
          const rol = await colaboradoresStore.obtenerMiRol(natilleraId)
          miRol.value = rol
          
          // Obtener los permisos del usuario
          const permisos = await colaboradoresStore.obtenerMisPermisos(natilleraId)
          misPermisos.value = permisos
        } catch (err) {
          console.warn('Error obteniendo rol y permisos del usuario:', err)
          miRol.value = null
          misPermisos.value = null
        }
      } else {
        // Si es admin, no necesita verificar rol, tiene todos los permisos
        miRol.value = 'administrador'
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
    
    // IMPORTANTE: Ocultar pantalla de carga INMEDIATAMENTE después de tener datos esenciales
    // Esto permite que el usuario vea la UI mientras se cargan datos secundarios
    await nextTick()
    cargandoNatillera.value = false
    
    // Fase 2: Cargar datos secundarios EN SEGUNDO PLANO (no bloquean la UI)
    // Estas operaciones se ejecutan después de que la pantalla de carga se oculta
    Promise.all([
      calcularEstadisticasAsync(),
      obtenerPrestamosVencidos(),
      cuotasStore.calcularSancionesTotales(natilleraId, cuotasResult)
    ]).then(([estadisticasResult, prestamosResult, sancionesResult]) => {
      // Aplicar sanciones calculadas
      if (sancionesResult?.success) {
        sancionesPorCuota.value = sancionesResult.sanciones || {}
        configSancionesActiva.value = sancionesResult.configActiva || false
        console.log('💰 Sanciones calculadas:', Object.keys(sancionesPorCuota.value).length, 'cuotas')
      }
    }).catch(err => console.warn('Error cargando datos secundarios:', err))
    
    // Fase 3: Actualizar mora/multas en segundo plano (no bloquea la UI)
    cuotasStore.actualizarEstadoMoraAutomatico(cuotasResult, natilleraId)
      .then(() => cuotasStore.recalcularMultasCuotasMora(natilleraId))
      .catch(err => console.warn('Error actualizando mora en segundo plano:', err))
    
    // Asegurar scroll en la parte superior
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 50)
    
    // Mostrar modales después de un pequeño delay para que la UI se renderice primero
    setTimeout(() => {
      // Si no hay socios, mostrar modal para agregar socios
      if (!tieneSocios.value) {
        modalSinSocios.value = true
      }
      // Si hay socios en mora, abrir la modal automáticamente (máximo 2 veces por día)
      else if (sociosEnMora.value && sociosEnMora.value.length > 0) {
        if (puedeMostrarModalSociosEnMora()) {
          modalSociosEnMora.value = true
          incrementarContadorModalSociosEnMora()
        }
      }
    }, 300)
  } catch (error) {
    console.error('Error cargando datos de natillera:', error)
    // Ocultar pantalla de carga incluso si hay error
    cargandoNatillera.value = false
  }
})

onUnmounted(() => {
  // Remover listener del botón atrás
  window.removeEventListener('popstate', handlePopState)
  // Limpiar intervalos y desbloquear scroll
  detenerRotacionMensajes()
  desbloquearScroll()
})
</script>

<style scoped>
/* Animación de pulso lento para la sección de alertas */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.92;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Estilos para tooltips - funcionan con hover y focus */
.tooltip-container:hover .tooltip,
.tooltip-container:focus-within .tooltip {
  visibility: visible !important;
  opacity: 1 !important;
}

/* Animación de rebote lento para el icono */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* Efecto shimmer para llamar la atención */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
}

/* Animación de entrada para las cuotas */
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}

/* Animación de resaltado para cuotas en mora */
@keyframes mora-highlight {
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 20px 25px -5px rgba(239, 68, 68, 0.6), 0 10px 10px -5px rgba(239, 68, 68, 0.4), 0 0 0 4px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.5);
    transform: scale(1.03);
  }
}

.animate-mora-highlight {
  animation: mora-highlight 1.5s ease-in-out infinite;
}

/* Efecto shimmer especial para cuotas en mora */
@keyframes shimmer-mora {
  0% {
    transform: translateX(-100%) skewX(-15deg);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
    opacity: 0;
  }
}

.animate-shimmer-mora {
  animation: shimmer-mora 2s ease-in-out infinite;
}

/* Animación de entrada elegante para la sección de alerta */
@keyframes fade-in-alerta {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-alerta {
  animation: fade-in-alerta 0.6s ease-out forwards;
}

/* Efecto de barrido automático (como hover periódico) */
@keyframes sweep-hover {
  0% {
    transform: translateX(-100%) skewX(-15deg);
    opacity: 0;
  }
  5% {
    opacity: 0.8;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  95% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(100%) skewX(-15deg);
    opacity: 0;
  }
}

.animate-sweep-hover {
  animation: sweep-hover 3.5s ease-in-out infinite;
  width: 80%;
}

/* Animaciones para la pantalla de carga */
@keyframes spin-smooth {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-smooth {
  animation: spin-smooth 1s linear infinite;
}

.animate-spin-reverse {
  animation: spin-smooth 0.8s linear infinite reverse;
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(16, 185, 129, 0.4);
  }
}

.animate-glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes float-1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(10px, -15px) scale(1.2);
    opacity: 1;
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-12px, 10px) scale(1.1);
    opacity: 1;
  }
}

@keyframes float-3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(8px, 12px) scale(1.15);
    opacity: 1;
  }
}

.animate-float-1 {
  animation: float-1 2s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.animate-float-3 {
  animation: float-3 2.2s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-fade-in-out {
  animation: fade-in-out 2s ease-in-out infinite;
}
</style>

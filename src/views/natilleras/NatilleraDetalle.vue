<template>
  <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden relative">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Loading -->
    <div v-if="natillerasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando natillera...</p>
    </div>

    <template v-else-if="natillera">
      <!-- Header estilizado -->
      <div class="relative">
        <router-link to="/natilleras" class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm">
          <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
            <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
          </div>
          <span class="whitespace-nowrap">Volver</span>
        </router-link>
        
        <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
          <!-- Círculos decorativos -->
          <div class="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
              <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 sm:w-12 sm:h-14 lg:w-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
                  <BanknotesIcon class="w-5 h-5 sm:w-6 sm:h-7 lg:w-7 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 lg:gap-3 mb-1 sm:mb-2">
                    <h1 class="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent break-words">
                      {{ natillera.nombre }}
                    </h1>
                    <span 
                      :class="[
                        'px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs lg:text-sm font-bold shadow-sm',
                        natillera.estado === 'activa' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                          : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                      ]"
                    >
                      {{ natillera.estado }}
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <p class="flex items-center gap-1">
                      <CalendarDaysIcon class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span class="hidden xs:inline">Desde </span>{{ formatDate(natillera.fecha_inicio) }}
                    </p>
                    <span class="text-gray-300 hidden sm:inline">•</span>
                    <p class="flex items-center gap-1 text-natillera-600 font-medium">
                      <CalendarDaysIcon class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span class="hidden xs:inline">Período: </span>{{ rangoMesesTexto }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-1.5 sm:gap-2">
                <button 
                  @click="modalBuscarComprobante = true"
                  class="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:border-natillera-300 hover:bg-natillera-50 hover:shadow-md transition-all text-[10px] sm:text-xs lg:text-sm shadow-sm"
                >
                  <MagnifyingGlassIcon class="w-3.5 h-3.5 sm:w-4 sm:h-5 flex-shrink-0" />
                  <span class="hidden sm:inline">Buscar Comprobante</span>
                  <span class="sm:hidden">Buscar</span>
                </button>
                <router-link 
                  :to="`/natilleras/${id}/configuracion`"
                  class="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:border-natillera-300 hover:bg-natillera-50 hover:shadow-md transition-all text-[10px] sm:text-xs lg:text-sm shadow-sm"
                >
                  <Cog6ToothIcon class="w-3.5 h-3.5 sm:w-4 sm:h-5 flex-shrink-0" />
                  <span class="hidden sm:inline">Configuración</span>
                  <span class="sm:hidden">Config</span>
                </router-link>
                <button 
                  @click="modalWhatsApp = true"
                  class="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 font-semibold rounded-lg sm:rounded-xl hover:from-green-100 hover:to-emerald-100 hover:border-green-300 hover:shadow-md transition-all text-[10px] sm:text-xs lg:text-sm shadow-sm"
                >
                  <ChatBubbleLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-5 flex-shrink-0" />
                  <span>Notificar</span>
                </button>
                <button 
                  v-if="natillera.estado === 'activa'"
                  @click="handleCerrarNatillera"
                  class="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-600 font-semibold rounded-lg sm:rounded-xl hover:from-red-100 hover:to-orange-100 hover:border-red-400 hover:shadow-md transition-all text-[10px] sm:text-xs lg:text-sm shadow-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <div class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-4 sm:p-6 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <!-- Título del menú -->
          <div class="flex items-center gap-2 mb-4 sm:mb-5">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
              <Bars3Icon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 class="text-lg sm:text-xl font-display font-bold text-gray-800">
              Menú de Opciones
            </h2>
          </div>
          
          <!-- Grid de opciones: 2 columnas en móvil, 4 en desktop -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <router-link 
              :to="`/natilleras/${id}/socios`"
              class="group relative flex flex-col items-center justify-center gap-3 px-4 py-5 sm:px-5 sm:py-6 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 text-gray-900 font-bold text-sm sm:text-base rounded-2xl border-2 border-blue-200/60 shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1.5 hover:border-blue-400 hover:from-blue-50 hover:via-indigo-50/70 hover:to-blue-50/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-blue-400/30 group-hover:to-indigo-400/25 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-300/15 to-blue-300/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 group-hover:from-indigo-300/25 group-hover:to-blue-300/20 transition-all duration-300"></div>
              
              <!-- Efecto de brillo al hover -->
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:via-white/20 transition-all duration-500 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              
              <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:shadow-xl group-hover:shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 border-2 border-white/30">
                <UsersIcon class="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              </div>
              <span class="text-center relative z-10 font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Socios</span>
            </router-link>
            
            <router-link 
              :to="`/natilleras/${id}/cuotas`"
              class="group relative flex flex-col items-center justify-center gap-3 px-4 py-5 sm:px-5 sm:py-6 bg-gradient-to-br from-white via-green-50/50 to-emerald-50/30 text-gray-900 font-bold text-sm sm:text-base rounded-2xl border-2 border-green-200/60 shadow-xl hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1.5 hover:border-green-400 hover:from-green-50 hover:via-emerald-50/70 hover:to-green-50/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-green-400/30 group-hover:to-emerald-400/25 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-emerald-300/15 to-green-300/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 group-hover:from-emerald-300/25 group-hover:to-green-300/20 transition-all duration-300"></div>
              
              <!-- Efecto de brillo al hover -->
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:via-white/20 transition-all duration-500 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              
              <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:shadow-xl group-hover:shadow-green-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 border-2 border-white/30">
                <CurrencyDollarIcon class="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              </div>
              <span class="text-center relative z-10 font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">Cuotas</span>
            </router-link>
            
            <router-link 
              :to="`/natilleras/${id}/prestamos`"
              class="group relative flex flex-col items-center justify-center gap-3 px-4 py-5 sm:px-5 sm:py-6 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 text-gray-900 font-bold text-sm sm:text-base rounded-2xl border-2 border-amber-200/60 shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1.5 hover:border-amber-400 hover:from-amber-50 hover:via-orange-50/70 hover:to-amber-50/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-400/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-amber-400/30 group-hover:to-orange-400/25 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-300/15 to-amber-300/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 group-hover:from-orange-300/25 group-hover:to-amber-300/20 transition-all duration-300"></div>
              
              <!-- Efecto de brillo al hover -->
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:via-white/20 transition-all duration-500 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              
              <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover:shadow-xl group-hover:shadow-amber-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 border-2 border-white/30">
                <BanknotesIcon class="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              </div>
              <span class="text-center relative z-10 font-bold text-gray-900 group-hover:text-amber-700 transition-colors duration-300">Préstamos</span>
            </router-link>
            
            <router-link 
              :to="`/natilleras/${id}/actividades`"
              class="group relative flex flex-col items-center justify-center gap-3 px-4 py-5 sm:px-5 sm:py-6 bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/30 text-gray-900 font-bold text-sm sm:text-base rounded-2xl border-2 border-purple-200/60 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1.5 hover:border-purple-400 hover:from-purple-50 hover:via-indigo-50/70 hover:to-purple-50/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <!-- Efectos decorativos de fondo -->
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-400/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:from-purple-400/30 group-hover:to-indigo-400/25 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-300/15 to-purple-300/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 group-hover:from-indigo-300/25 group-hover:to-purple-300/20 transition-all duration-300"></div>
              
              <!-- Efecto de brillo al hover -->
              <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:via-white/20 transition-all duration-500 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              
              <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40 group-hover:shadow-xl group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10 border-2 border-white/30">
                <CalendarIcon class="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              </div>
              <span class="text-center relative z-10 font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">Actividades</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Indicadores -->
      <div class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-4 sm:p-6 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <!-- Título del contenedor -->
          <div class="flex items-center gap-2 mb-4 sm:mb-5">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
              <ChartBarIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 class="text-lg sm:text-xl font-display font-bold text-gray-800">
              Indicadores
            </h2>
          </div>
          
          <!-- Grid de indicadores -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border border-blue-200/50 backdrop-blur-sm shadow-lg">
          <!-- Círculo decorativo -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
            <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{{ estadisticas.totalSocios }}</p>
            <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Socios</p>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border border-green-200/50 backdrop-blur-sm shadow-lg">
          <!-- Círculo decorativo -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
            <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${{ formatMoneyShort(estadisticas.totalAportado) }}</p>
            <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Recaudado</p>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 border border-amber-200/50 backdrop-blur-sm shadow-lg">
          <!-- Círculo decorativo -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
            <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">${{ formatMoneyShort(estadisticas.totalPendiente) }}</p>
            <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Pendiente</p>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 backdrop-blur-sm shadow-lg">
          <!-- Círculo decorativo -->
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-400/15 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
            <p class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">${{ formatMoneyShort(estadisticas.fondoTotal) }}</p>
            <p class="text-sm sm:text-base lg:text-lg text-gray-700 font-semibold mt-2">Fondo Total</p>
          </div>
        </div>
          </div>
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
                {{ totalCuotasMora }} {{ totalCuotasMora === 1 ? 'cuota' : 'cuotas' }} en mora • Total: ${{ formatMoneyShort(totalDeudaMora) }}
              </p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <ChevronRightIcon :class="['w-6 h-6 transition-transform duration-300 group-hover:translate-x-1', sociosEnMora.length >= 3 ? 'text-red-600' : 'text-amber-600']" />
          </div>
        </div>
      </div>

      <!-- Mensaje de todo en orden (cuando no hay mora) -->
      <div 
        v-else-if="natillera.socios_natillera?.length > 0"
        class="relative bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 rounded-3xl p-6 sm:p-8 border border-green-200/50 shadow-xl backdrop-blur-sm overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-400/15 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative z-10 flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircleIcon class="w-8 h-8 text-white" />
          </div>
          <div class="flex-1">
            <h2 class="text-lg sm:text-xl font-display font-bold text-green-800">
              ✅ Todo en orden
            </h2>
            <p class="text-sm text-green-600">
              No hay socios con cuotas en mora o pendientes vencidas
            </p>
          </div>
          <router-link 
            :to="`/natilleras/${id}/cuotas`"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            Ver cuotas
            <ArrowRightIcon class="w-4 h-4" />
          </router-link>
        </div>
      </div>

      <!-- Mensaje cuando no hay socios -->
      <div 
        v-else
        class="relative bg-gradient-to-br from-white via-gray-50/30 to-slate-50/20 rounded-3xl p-6 sm:p-8 border border-gray-200/50 shadow-xl backdrop-blur-sm overflow-hidden"
      >
        <div class="relative z-10 text-center py-4">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
            <UsersIcon class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-600 font-medium mb-4">No hay socios registrados</p>
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="btn-primary inline-flex items-center gap-2 shadow-lg"
          >
            <PlusIcon class="w-4 h-4" />
            Agregar socios
          </router-link>
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
    <div v-if="modalWhatsApp" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
    <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
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
    <div v-if="modalBuscarComprobante" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon class="w-6 h-6 text-white" />
                </div>
                <h4 class="font-bold text-green-800 text-lg">Comprobante Encontrado</h4>
              </div>
              
              <div class="bg-white rounded-lg p-5 space-y-4 border border-green-200">
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
                
                <div class="pt-3 border-t border-gray-200">
                  <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Fecha de Pago</p>
                    <p v-if="comprobanteEncontrado.fecha_pago" class="text-green-800 font-bold text-lg">
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
    <div v-if="modalCuotasSocio" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalCuotasSocio"></div>
      <div class="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden">
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
          
          <!-- Lista de cuotas individuales -->
          <div v-else-if="!loadingCuotasSocio" class="space-y-3">
            <!-- Vista Completa -->
            <template v-if="!vistaSimplificadaCuotas">
              <div
                v-for="(cuotaData, index) in cuotasSocioPorMes"
                :key="cuotaData.id"
                class="relative overflow-hidden rounded-xl border-l-4 border-t-2 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm animate-fade-in-up"
                :style="{ animationDelay: `${index * 0.05}s` }"
                :class="[
                  (cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono
                    ? 'h-auto sm:h-auto' 
                    : 'h-[91px] sm:h-auto',
                  cuotaData.estado === 'pagada' 
                    ? 'border-l-green-500 border-t-green-500 bg-gradient-to-br from-green-100 via-green-50 to-white' :
                  cuotaData.estado === 'mora' 
                    ? 'border-l-red-500 border-t-red-500 bg-gradient-to-br from-red-100 via-red-50 to-white animate-mora-highlight' :
                  cuotaData.estado === 'pendiente'
                    ? 'border-l-amber-500 border-t-amber-500 bg-gradient-to-br from-orange-100 via-amber-50 to-white' :
                  'border-l-gray-400 border-t-gray-400 bg-gradient-to-br from-gray-100 via-gray-50 to-white'
                ]"
              >
              <!-- Efecto de resaltado para cuotas en mora -->
              <div 
                v-if="cuotaData.estado === 'mora'"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/50 to-transparent animate-shimmer-mora pointer-events-none z-0"
              ></div>
              <!-- Borde pulsante para cuotas en mora -->
              <div 
                v-if="cuotaData.estado === 'mora'"
                class="absolute inset-0 border-2 border-red-500 rounded-xl animate-pulse pointer-events-none z-0"
                style="animation-duration: 1.5s;"
              ></div>
              <div class="p-2 sm:p-2.5 h-full flex flex-col">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-1 min-h-0">
                  <!-- Lado izquierdo: Emoji y nombre del mes -->
                  <div class="flex items-center gap-2.5 flex-1 min-w-0">
                    <!-- Avatar del mes (emoji) -->
                    <div class="relative flex-shrink-0">
                      <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 flex items-center justify-center text-xl sm:text-2xl shadow-md">
                        {{ getMesEmoji(cuotaData.mes) }}
                      </div>
                      <!-- Badge de quincena si aplica -->
                      <div v-if="cuotaData.quincena" class="absolute -top-1 -left-1 w-5 h-5 bg-purple-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                        Q{{ cuotaData.quincena }}
                      </div>
                      <!-- Badge de estado pagada -->
                      <div v-if="cuotaData.estado === 'pagada'" class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <CheckCircleIcon class="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                      </div>
                    </div>
                    
                    <!-- Nombre del mes, monto y detalles -->
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between sm:block gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                          <p class="font-bold text-gray-800 text-sm sm:text-base">
                            {{ getMesLabel(cuotaData.mes) }} {{ cuotaData.anio }}
                            <span v-if="cuotaData.quincena" class="text-purple-600">- Q{{ cuotaData.quincena }}</span>
                          </p>
                          <!-- Badge de estado en móvil (junto al mes) -->
                          <span 
                            v-if="cuotaData.estado === 'pagada'"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm sm:hidden"
                          >
                            pagada
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'mora'"
                            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm sm:hidden"
                          >
                            en mora
                            <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                              ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                            </span>
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'pendiente'"
                            class="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm sm:hidden"
                          >
                            pendiente
                          </span>
                          <span 
                            v-else
                            class="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm sm:hidden"
                          >
                            programada
                          </span>
                        </div>
                        <!-- Monto en móvil -->
                        <div class="text-right sm:hidden">
                          <p class="text-base font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                            ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                          </p>
                          <div class="flex flex-col items-end gap-0.5 mt-0.5">
                            <p class="text-[9px] text-black font-medium">
                              Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                            </p>
                            <p v-if="cuotaData.sancion > 0" class="text-[9px] text-black font-semibold flex items-center gap-1">
                              <span>Sanción:</span>
                              <span>${{ formatMoney(cuotaData.sancion) }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Monto en desktop -->
                      <div class="hidden sm:block">
                        <p class="text-base sm:text-lg font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                          ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                        </p>
                        <div class="flex items-center gap-2 mt-0.5">
                          <p class="text-xs sm:text-sm text-black font-medium">
                            Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                          </p>
                          <p v-if="cuotaData.sancion > 0" class="text-xs sm:text-sm text-black font-semibold flex items-center gap-1">
                            <span>Sanción:</span>
                            <span>${{ formatMoney(cuotaData.sancion) }}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div class="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5">
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <CalendarDaysIcon class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 flex-shrink-0" />
                          <span class="text-[9px] sm:text-[10px] text-gray-500 whitespace-nowrap">
                            Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                          </span>
                        </div>
                        <p class="text-[9px] sm:text-[10px] font-semibold text-green-600 flex-shrink-0">
                          Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                        </p>
                        <!-- Badge de periodicidad (píldora compacta) -->
                        <span 
                          :class="[
                            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-semibold border whitespace-nowrap flex-shrink-0 self-start',
                            cuotaData.periodicidad === 'quincenal' 
                              ? 'bg-purple-100 text-purple-700 border-purple-200'
                              : 'bg-blue-100 text-blue-700 border-blue-200'
                          ]"
                        >
                          <CalendarDaysIcon class="w-1.5 h-1.5 sm:w-2 sm:h-2 flex-shrink-0" />
                          <span class="whitespace-nowrap">{{ cuotaData.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Lado derecho: Estado y botón WhatsApp (solo en desktop) -->
                  <div class="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <!-- Badge de estado -->
                    <span 
                      v-if="cuotaData.estado === 'pagada'"
                      class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm"
                    >
                      pagada
                    </span>
                    <span 
                      v-else-if="cuotaData.estado === 'mora'"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm"
                    >
                      en mora
                      <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                        ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                      </span>
                    </span>
                    <span 
                      v-else-if="cuotaData.estado === 'pendiente'"
                      class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm"
                    >
                      pendiente
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                    >
                      programada
                    </span>
                    
                    <!-- Botón WhatsApp (solo para pendiente o mora) -->
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                      @click="enviarWhatsAppCuota(cuotaData)"
                      class="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex-shrink-0"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <ChatBubbleLeftIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <!-- Botón WhatsApp en móvil (solo para pendiente o mora) - esquina inferior izquierda -->
                <button
                  v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                  @click="enviarWhatsAppCuota(cuotaData)"
                  class="sm:hidden absolute bottom-2 left-2 p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex-shrink-0 z-10"
                  title="Enviar recordatorio por WhatsApp"
                >
                  <ChatBubbleLeftIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            </template>
            
            <!-- Vista Simplificada -->
            <template v-else>
              <div
                v-for="(cuotaData, index) in cuotasSocioPorMes"
                :key="cuotaData.id"
                class="relative overflow-hidden rounded-xl border-l-4 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                :style="{ animationDelay: `${index * 0.03}s` }"
                :class="[
                  cuotaData.estado === 'pagada' 
                    ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' :
                  cuotaData.estado === 'mora' 
                    ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white animate-mora-highlight' :
                  cuotaData.estado === 'pendiente'
                    ? 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-white' :
                  'border-l-gray-400 bg-gradient-to-r from-gray-50 to-white'
                ]"
              >
                <!-- Efecto de resaltado para cuotas en mora -->
                <div 
                  v-if="cuotaData.estado === 'mora'"
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/30 to-transparent animate-shimmer-mora pointer-events-none z-0"
                ></div>
                
                <div class="p-3 sm:p-4 flex items-center justify-between gap-3 relative z-10">
                  <!-- Lado izquierdo: Emoji y mes -->
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="relative flex-shrink-0">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 flex items-center justify-center text-xl sm:text-2xl shadow-sm">
                        {{ getMesEmoji(cuotaData.mes) }}
                      </div>
                      <div v-if="cuotaData.quincena" class="absolute -top-1 -left-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-lg flex items-center justify-center border border-white shadow-sm">
                        Q{{ cuotaData.quincena }}
                      </div>
                      <div v-if="cuotaData.estado === 'pagada'" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                        <CheckCircleIcon class="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                      </div>
                    </div>
                    
                    <div class="min-w-0 flex-1">
                      <p class="font-bold text-gray-800 text-sm sm:text-base truncate">
                        {{ getMesLabel(cuotaData.mes) }} {{ cuotaData.anio }}
                        <span v-if="cuotaData.quincena" class="text-purple-600">- Q{{ cuotaData.quincena }}</span>
                      </p>
                      <!-- Badge de estado -->
                      <div class="flex items-center gap-2 mt-1">
                        <span 
                          v-if="cuotaData.estado === 'pagada'"
                          class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold bg-green-100 text-green-700 border border-green-200"
                        >
                          pagada
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'mora'"
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold bg-red-100 text-red-700 border border-red-200"
                        >
                          en mora
                          <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                            ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                          </span>
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pendiente'"
                          class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"
                        >
                          pendiente
                        </span>
                        <span 
                          v-else
                          class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          programada
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Lado derecho: Monto y botón WhatsApp -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <div class="text-right">
                      <p class="text-base sm:text-lg font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                        ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                      </p>
                      <p v-if="cuotaData.sancion > 0" class="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                        +${{ formatMoney(cuotaData.sancion) }} sanción
                      </p>
                    </div>
                    
                    <!-- Botón WhatsApp (solo para pendiente o mora) -->
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                      @click="enviarWhatsAppCuota(cuotaData)"
                      class="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex-shrink-0"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <ChatBubbleLeftIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
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
    <div v-if="modalConfigMeses" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
    <div v-if="modalSociosEnMora" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalSociosEnMora = false"></div>
      <div class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br p-4 sm:p-6 text-white relative overflow-hidden" :class="sociosEnMora.length >= 3 ? 'from-red-500 via-rose-600 to-red-700' : 'from-amber-500 via-orange-600 to-amber-700'">
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
          <div :class="['grid gap-3 sm:gap-4', totalSancionesMora > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3']">
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300" :class="sociosEnMora.length >= 3 ? 'border-red-300/60 hover:border-red-400' : 'border-amber-300/60 hover:border-amber-400'">
              <p class="text-3xl sm:text-4xl font-bold mb-1" :class="sociosEnMora.length >= 3 ? 'text-red-600' : 'text-amber-600'">{{ totalCuotasMora }}</p>
              <p class="text-xs sm:text-sm font-semibold" :class="sociosEnMora.length >= 3 ? 'text-red-700' : 'text-amber-700'">Cuotas en mora</p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300" :class="sociosEnMora.length >= 3 ? 'border-amber-300/60 hover:border-amber-400' : 'border-orange-300/60 hover:border-orange-400'">
              <p class="text-3xl sm:text-4xl font-bold mb-1 text-amber-600">{{ totalCuotasPendientes }}</p>
              <p class="text-xs sm:text-sm font-semibold text-amber-700">Cuotas pendientes</p>
            </div>
            <!-- Sanciones (solo si hay) -->
            <div v-if="totalSancionesMora > 0" class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center border-2 border-rose-300/60 hover:border-rose-400 shadow-lg hover:shadow-xl transition-all duration-300">
              <p class="text-3xl sm:text-4xl font-bold mb-1 text-rose-600">${{ formatMoneyShort(totalSancionesMora) }}</p>
              <p class="text-xs sm:text-sm font-semibold text-rose-700">Total sanciones</p>
            </div>
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300" :class="sociosEnMora.length >= 3 ? 'border-orange-300/60 hover:border-orange-400' : 'border-yellow-300/60 hover:border-yellow-400'">
              <p class="text-3xl sm:text-4xl font-bold mb-1 text-orange-600">${{ formatMoneyShort(totalDeudaMora) }}</p>
              <p class="text-xs sm:text-sm font-semibold text-orange-700">Total a cobrar</p>
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
                        <span v-if="socioMora.cuotasPendientes > 0" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
                          {{ socioMora.cuotasPendientes }} {{ socioMora.cuotasPendientes === 1 ? 'pend.' : 'pend.' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Datos financieros en móvil: debajo del nombre, en una sola línea compacta -->
                  <div v-if="socioMora.cuotasMora > 0" class="sm:hidden w-full -mt-2 pt-2 border-t border-gray-200/60">
                    <div class="flex items-center justify-between gap-3">
                      <!-- Total a cobrar - destacado -->
                      <div class="flex-1 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg px-2.5 py-1.5 border border-red-200/60">
                        <p class="text-[9px] text-gray-600 font-medium mb-0.5">Total a cobrar</p>
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
                  </div>
                  
                  <!-- Si solo tiene pendientes (sin mora) en móvil -->
                  <div v-else class="sm:hidden w-full -mt-2">
                    <div class="text-left">
                      <p class="text-xs font-bold text-amber-600">${{ formatMoney(socioMora.totalDeuda) }}</p>
                      <p class="text-[10px] text-gray-500">adeudado</p>
                    </div>
                  </div>
                
                <!-- Botón en móvil: abajo -->
                <div class="sm:hidden">
                  <button
                    @click.stop="verCuotasSocio(socioMora)"
                    class="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Ver cuotas
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
                      <div>
                        <p class="text-[10px] text-gray-500">Sanción</p>
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
                      <div>
                        <p class="font-semibold text-rose-600 text-xs sm:text-sm">${{ formatMoney(socioMora.totalSanciones || 0) }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botón Ver cuotas -->
                  <button
                    @click.stop="verCuotasSocio(socioMora)"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Ver cuotas
                  </button>
                </div>
                
                <!-- Si solo tiene pendientes (sin mora) en desktop -->
                <div v-else class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-center gap-2">
                  <div class="text-right">
                    <p class="text-sm sm:text-base font-bold text-amber-600">${{ formatMoney(socioMora.totalDeuda) }}</p>
                    <p class="text-xs text-gray-500">adeudado</p>
                  </div>
                  <button
                    @click.stop="verCuotasSocio(socioMora)"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Ver cuotas
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  Squares2X2Icon
} from '@heroicons/vue/24/outline'
import { useSociosStore } from '../../stores/socios'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useCuotasStore } from '../../stores/cuotas'

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const sociosStore = useSociosStore()
const configStore = useConfiguracionStore()
const cuotasStore = useCuotasStore()

const modalWhatsApp = ref(false)
const modalDetalle = ref(false)
const modalConfigMeses = ref(false)
const modalBuscarComprobante = ref(false)
const modalCuotasSocio = ref(false)
const modalSociosEnMora = ref(false)
const loadingCuotasSocio = ref(false)
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

function abrirConfigMeses() {
  formConfigMeses.value = {
    mes_inicio: natillera.value?.mes_inicio || 1,
    mes_fin: natillera.value?.mes_fin || 11,
    anio: natillera.value?.anio || new Date().getFullYear()
  }
  modalConfigMeses.value = true
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

const natillera = computed(() => natillerasStore.natilleraActual)

// Función para buscar comprobante
async function buscarComprobante() {
  if (!codigoBusqueda.value.trim()) return
  
  buscandoComprobante.value = true
  errorBusqueda.value = ''
  comprobanteEncontrado.value = null
  infoComprobanteAntiguo.value = null
  comprobanteNuevo.value = null
  
  try {
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
          fecha_pago: null // No hay fecha de pago para el código anterior ya que fue actualizado
        }
      } else {
        // Si no es antiguo, mostrar normalmente
        comprobanteEncontrado.value = result.data
      }
    } else {
      errorBusqueda.value = result.error || 'No se encontró el comprobante'
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

// Socios con problemas de mora o pendientes vencidos
const sociosEnMora = computed(() => {
  if (!cuotasNatillera.value || !cuotasNatillera.value.length) return []
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // Agrupar cuotas por socio
  const sociosMap = {}
  
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
        cuotasMoraList: [], // Para calcular días de mora
        socio: socioInfo || null // Guardar el objeto socio completo para acceder al teléfono
      }
    }
    
    // Contar cuotas en mora
    if (cuota.estado === 'mora') {
      sociosMap[socioId].cuotasMora++
      const deudaCuota = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
      // Obtener la sanción calculada dinámicamente para esta cuota
      const sancionCuota = sancionesPorCuota.value[cuota.id] || 0
      sociosMap[socioId].totalDeuda += deudaCuota
      sociosMap[socioId].totalSanciones += sancionCuota
      // Guardar cuota para calcular días de mora
      sociosMap[socioId].cuotasMoraList.push(cuota)
      // Acumular valor de cuota para promedio
      sociosMap[socioId].valorCuotaPromedio += cuota.valor_cuota || 0
    }
    // Contar cuotas pendientes vencidas
    else if (cuota.estado === 'pendiente' || cuota.estado === 'parcial') {
      if (cuota.fecha_limite) {
        const fechaLimite = new Date(cuota.fecha_limite)
        fechaLimite.setHours(0, 0, 0, 0)
        
        if (hoy > fechaLimite) {
          sociosMap[socioId].cuotasPendientes++
          sociosMap[socioId].totalDeuda += (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
        }
      }
    }
  })
  
  // Filtrar solo los que tienen problemas y calcular información adicional
  return Object.values(sociosMap)
    .filter(s => s.cuotasMora > 0 || s.cuotasPendientes > 0)
    .map(s => {
      // Calcular días de mora (basado en la cuota más antigua en mora)
      // Los días se calculan desde fecha_limite porque esa es la fecha desde la cual está en mora
      let diasMora = 0
      if (s.cuotasMoraList.length > 0) {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        // Encontrar la fecha_limite más antigua de todas las cuotas en mora
        const fechasLimite = s.cuotasMoraList
          .filter(c => c.fecha_limite) // Solo cuotas con fecha_limite
          .map(c => {
            // Parsear fecha_limite correctamente (puede venir como string YYYY-MM-DD)
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
          .filter(f => !isNaN(f.getTime())) // Filtrar fechas inválidas
          .sort((a, b) => a - b) // Ordenar de más antigua a más reciente
        
        if (fechasLimite.length > 0) {
          const fechaMasAntigua = fechasLimite[0] // La más antigua
          diasMora = Math.floor((hoy - fechaMasAntigua) / (1000 * 60 * 60 * 24))
          diasMora = Math.max(0, diasMora) // No permitir negativos
        }
      }
      
      // Calcular valor promedio de cuota
      const valorCuotaPromedio = s.cuotasMora > 0 
        ? Math.round(s.valorCuotaPromedio / s.cuotasMora)
        : 0
      
      // Obtener información completa del socio desde la primera cuota (si no existe ya)
      const socioCompleto = s.socio || (() => {
        const primeraCuota = s.cuotasMoraList[0] || cuotasNatillera.value.find(c => c.socio_natillera_id === s.id)
        return primeraCuota?.socio_natillera?.socio || null
      })()
      
      return {
        ...s,
        // Total incluyendo sanciones
        totalConSanciones: s.totalDeuda + s.totalSanciones,
        // Días de mora
        diasMora,
        // Valor promedio de cuota
        valorCuotaPromedio,
        // Información completa del socio (usar el que ya existe o buscar uno nuevo)
        socio: socioCompleto
      }
    })
    .sort((a, b) => {
      // Primero los que tienen más cuotas en mora
      if (b.cuotasMora !== a.cuotasMora) return b.cuotasMora - a.cuotasMora
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

  const totalAportado = cuotasSocio.value.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
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

const estadisticas = computed(() => {
  return natillerasStore.calcularEstadisticas(natillera.value) || {
    totalSocios: 0,
    sociosActivos: 0,
    totalAportado: 0,
    totalPendiente: 0,
    utilidadActividades: 0,
    fondoTotal: 0
  }
})

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatMoneyShort(value) {
  const num = value || 0
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return new Intl.NumberFormat('es-CO').format(num)
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
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatDateWithTime(date) {
  if (!date) return 'No registrada'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

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
  if (!confirm('¿Estás seguro de cerrar esta natillera? Esta acción no se puede deshacer.')) {
    return
  }
  
  const result = await natillerasStore.cerrarNatillera(props.id || route.params.id)
  if (result.success) {
    alert('Natillera cerrada exitosamente')
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

// Función para calcular el estado real de una cuota basándose en la fecha actual y días de gracia
// Reglas según REGLAS.md:
// - Programada: fecha_actual < (fecha_limite - dias_gracia)
// - Pendiente: (fecha_limite - dias_gracia) <= fecha_actual <= fecha_limite
// - En Mora: fecha_actual > fecha_limite
// - Pagada: valor_pagado >= valor_cuota
function calcularEstadoRealCuota(cuota, diasGracia) {
  // Si está pagada completamente, siempre es pagada
  if ((cuota.valor_pagado || 0) >= (cuota.valor_cuota || 0)) {
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
  
  // Calcular fecha límite - días de gracia (inicio del período pendiente)
  const fechaInicioPendiente = new Date(fechaLimite)
  fechaInicioPendiente.setDate(fechaInicioPendiente.getDate() - diasGracia)
  
  // Programada: fecha_actual < (fecha_limite - dias_gracia)
  if (fechaActual < fechaInicioPendiente) {
    return 'programada'
  }
  
  // Pendiente: (fecha_limite - dias_gracia) <= fecha_actual <= fecha_limite
  if (fechaActual >= fechaInicioPendiente && fechaActual <= fechaLimite) {
    return 'pendiente'
  }
  
  // En Mora: fecha_actual > fecha_limite
  if (fechaActual > fechaLimite) {
    return 'mora'
  }
  
  // Por defecto, mantener el estado original
  return cuota.estado || 'programada'
}

// Función para abrir el modal de cuotas del socio
async function verCuotasSocio(socioMora) {
  // Abrir la modal inmediatamente para una respuesta rápida
  socioParaCuotas.value = socioMora
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = true
  modalCuotasSocio.value = true
  
  // Cargar datos de forma asíncrona después de abrir la modal
  try {
    // Obtener las cuotas del socio (todas las cuotas, sin filtro de año)
    const resumen = await sociosStore.obtenerResumenSocio(socioMora.id)
    const cuotas = resumen?.cuotas || []
  
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
      
      // Parsear fecha_limite correctamente para la fecha de vencimiento
      let fechaVencimiento
      if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
        const [anioNum, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
        fechaVencimiento = new Date(anioNum, mesNum - 1, dia)
      } else {
        fechaVencimiento = new Date(cuota.fecha_limite)
      }
      
      // Obtener sanción de esta cuota - solo usar valor_multa si las sanciones están activas
      // Si las sanciones están inactivas, siempre usar 0
      let sancionCuota = 0
      if (sancionesActivas) {
        sancionCuota = sancionesSocio[cuota.id] || cuota.valor_multa || 0
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
  
    // Ordenar por año, mes y fecha de vencimiento (más antiguo primero)
    cuotasSocioPorMes.value = cuotasIndividuales.sort((a, b) => {
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
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalSociosEnMora.value) {
      // Agregar nueva entrada al historial para que el siguiente "atrás" cierre modalSociosEnMora
      history.pushState({ modal: 'sociosEnMora' }, '', window.location.href)
    } else if (modalWhatsApp.value) {
      history.pushState({ modal: 'whatsapp' }, '', window.location.href)
    } else if (modalDetalle.value) {
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
  
  // Modal de socios en mora (z-50)
  if (modalSociosEnMora.value) {
    modalSociosEnMora.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalWhatsApp.value) {
      history.pushState({ modal: 'whatsapp' }, '', window.location.href)
    } else if (modalDetalle.value) {
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
    router.back()
    return
  }
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

// Watch para detectar cuando hay socios en mora
watch(sociosEnMora, async (newValue, oldValue) => {
  // Solo hacer scroll si antes no había socios en mora y ahora sí hay
  if ((!oldValue || oldValue.length === 0) && newValue && newValue.length > 0) {
    // Esperar un poco para que el DOM se actualice
    await nextTick()
    setTimeout(() => {
      scrollToBannerSociosEnMora()
    }, 300)
  }
}, { deep: true })

onMounted(async () => {
  // Agregar listener para el botón atrás
  window.addEventListener('popstate', handlePopState)
  
  try {
    const natilleraId = props.id || route.params.id
    await natillerasStore.fetchNatillera(natilleraId)
    configStore.cargarConfiguracion()
    
    // Cargar cuotas para verificar mora
    const cuotas = await cuotasStore.fetchCuotasNatillera(natilleraId)
    cuotasNatillera.value = cuotas || []
    
    // Calcular sanciones dinámicas para las cuotas en mora
    const resultSanciones = await cuotasStore.calcularSancionesTotales(natilleraId, cuotas)
    if (resultSanciones.success) {
      sancionesPorCuota.value = resultSanciones.sanciones || {}
      configSancionesActiva.value = resultSanciones.configActiva || false
      console.log('💰 Sanciones calculadas:', Object.keys(sancionesPorCuota.value).length, 'cuotas')
    }
    
    // Si hay socios en mora, abrir la modal automáticamente (máximo 2 veces por día)
    await nextTick()
    if (sociosEnMora.value && sociosEnMora.value.length > 0) {
      if (puedeMostrarModalSociosEnMora()) {
        setTimeout(() => {
          modalSociosEnMora.value = true
          incrementarContadorModalSociosEnMora()
        }, 500)
      }
      
      // Hacer scroll al banner
      setTimeout(() => {
        scrollToBannerSociosEnMora()
      }, 800)
    }
  } catch (error) {
    console.error('Error cargando datos de natillera:', error)
  }
})

onUnmounted(() => {
  // Remover listener del botón atrás
  window.removeEventListener('popstate', handlePopState)
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
</style>

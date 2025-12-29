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

      <!-- Stats mejoradas -->
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

      <!-- Navegación tabs -->
      <div class="w-full">
        <div class="flex gap-2 sm:gap-3 w-full">
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="group flex flex-col items-center justify-center gap-2 flex-1 px-2 py-4 sm:px-4 sm:py-5 lg:py-3 bg-gradient-to-b from-natillera-50 to-natillera-100 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl border border-natillera-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-natillera-500/25 hover:-translate-y-1 hover:from-natillera-100 hover:to-natillera-200 transition-all duration-300 cursor-pointer"
          >
            <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-natillera-700 group-hover:scale-110 transition-transform duration-300" />
            <span class="text-center">Socios</span>
          </router-link>
          <router-link 
            :to="`/natilleras/${id}/cuotas`"
            class="group flex flex-col items-center justify-center gap-2 flex-1 px-2 py-4 sm:px-4 sm:py-5 lg:py-3 bg-gradient-to-b from-natillera-50 to-natillera-100 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl border border-natillera-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-natillera-500/25 hover:-translate-y-1 hover:from-natillera-100 hover:to-natillera-200 transition-all duration-300 cursor-pointer"
          >
            <CurrencyDollarIcon class="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-natillera-700 group-hover:scale-110 transition-transform duration-300" />
            <span class="text-center">Cuotas</span>
          </router-link>
          <router-link 
            :to="`/natilleras/${id}/prestamos`"
            class="group flex flex-col items-center justify-center gap-2 flex-1 px-2 py-4 sm:px-4 sm:py-5 lg:py-3 bg-gradient-to-b from-natillera-50 to-natillera-100 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl border border-natillera-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-natillera-500/25 hover:-translate-y-1 hover:from-natillera-100 hover:to-natillera-200 transition-all duration-300 cursor-pointer"
          >
            <BanknotesIcon class="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-natillera-700 group-hover:scale-110 transition-transform duration-300" />
            <span class="text-center">Préstamos</span>
          </router-link>
          <router-link 
            :to="`/natilleras/${id}/actividades`"
            class="group flex flex-col items-center justify-center gap-2 flex-1 px-2 py-4 sm:px-4 sm:py-5 lg:py-3 bg-gradient-to-b from-natillera-50 to-natillera-100 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl border border-natillera-200 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-natillera-500/25 hover:-translate-y-1 hover:from-natillera-100 hover:to-natillera-200 transition-all duration-300 cursor-pointer"
          >
            <CalendarIcon class="w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6 text-natillera-700 group-hover:scale-110 transition-transform duration-300" />
            <span class="text-center">Actividades</span>
          </router-link>
        </div>
      </div>

      <!-- Socios resumen estilizado -->
      <div class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-natillera-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-natillera-500/30">
                <UsersIcon class="w-5 h-5 text-white" />
              </div>
              <h2 class="text-base sm:text-xl font-display font-bold bg-gradient-to-r from-gray-800 to-natillera-700 bg-clip-text text-transparent">
                Socios Recientes
              </h2>
            </div>
            <router-link 
              :to="`/natilleras/${id}/socios`"
              class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white hover:from-natillera-600 hover:to-emerald-700 font-semibold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap flex-shrink-0"
            >
              Ver todos
              <ArrowRightIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </router-link>
          </div>

          <div v-if="natillera.socios_natillera?.length === 0" class="text-center py-8">
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

          <div v-else class="space-y-3">
            <div 
              v-for="sn in sociosRecientes" 
              :key="sn.id"
              class="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-xl hover:border-natillera-300 hover:-translate-y-0.5 transition-all duration-300 p-4"
            >
              <!-- Efecto decorativo sutil -->
              <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-natillera-100/30 to-emerald-100/20 rounded-full blur-lg -translate-y-1/2 translate-x-1/2"></div>
              
              <div class="relative flex items-center justify-between gap-3">
                <div 
                  @click="verDetalleSocio(sn)"
                  class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img 
                    :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed)" 
                    :alt="sn.socio?.nombre"
                    class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-natillera-100 flex-shrink-0 border-2 border-natillera-200 shadow-md object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-gray-800 text-sm sm:text-base truncate">{{ sn.socio?.nombre }}</p>
                    <p class="text-xs sm:text-sm text-gray-600 truncate mt-1 flex items-center gap-1.5">
                      <CurrencyDollarIcon class="w-3.5 h-3.5 text-natillera-500" />
                      <span class="font-semibold text-natillera-600">${{ formatMoney(sn.valor_cuota_individual) }}</span>
                    </p>
                  </div>
                </div>
                <span 
                  :class="[
                    'px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-sm flex-shrink-0',
                    sn.estado === 'activo' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                      : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                  ]"
                >
                  {{ sn.estado }}
                </span>
              </div>
            </div>
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
                  :src="getAvatarUrl(socioSeleccionado?.socio?.nombre || socioSeleccionado?.id, socioSeleccionado?.socio?.avatar_seed)" 
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
                <p class="text-xl font-bold" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-gray-700'">
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
      <div class="absolute inset-0 bg-black/50" @click="cerrarModalBuscarComprobante"></div>
      <div class="card relative w-full sm:max-w-md max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-natillera-700 rounded-xl flex items-center justify-center">
            <MagnifyingGlassIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-display font-bold text-gray-800">
              Buscar Comprobante
            </h3>
            <p class="text-sm text-gray-500">
              Ingresa el código del comprobante
            </p>
          </div>
          <button 
            @click="cerrarModalBuscarComprobante"
            class="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 flex-1 overflow-y-auto">
          <!-- Campo de búsqueda -->
          <div>
            <label class="label">Código del Comprobante</label>
            <div class="relative">
              <input 
                v-model="codigoBusqueda"
                type="text"
                placeholder="Ej: ABC12345"
                class="input-field pr-12 uppercase"
                @keyup.enter="buscarComprobante"
                maxlength="20"
              />
              <button
                @click="buscarComprobante"
                :disabled="!codigoBusqueda.trim() || buscandoComprobante"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-natillera-600 text-white rounded-lg hover:bg-natillera-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MagnifyingGlassIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Resultado de la búsqueda -->
          <div v-if="comprobanteEncontrado" class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <CheckCircleIcon class="w-6 h-6 text-green-600" />
              <h4 class="font-bold text-green-800">Comprobante Encontrado</h4>
            </div>
            
            <div class="bg-white rounded-lg p-4 space-y-3 border border-green-200">
              <div>
                <p class="text-xs text-gray-500 mb-1">Código</p>
                <p class="font-mono font-bold text-lg text-gray-800">{{ comprobanteEncontrado.codigo_comprobante }}</p>
              </div>
              
              <div>
                <p class="text-xs text-gray-500 mb-1">Socio</p>
                <p class="font-semibold text-gray-800">{{ comprobanteEncontrado.socio_natillera?.socio?.nombre || 'N/A' }}</p>
              </div>
              
              <div>
                <p class="text-xs text-gray-500 mb-1">Descripción</p>
                <p class="text-gray-800">{{ comprobanteEncontrado.descripcion || 'N/A' }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Valor Cuota</p>
                  <p class="font-bold text-gray-800">${{ formatMoney(comprobanteEncontrado.valor_cuota) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Valor Pagado</p>
                  <p class="font-bold text-green-600">${{ formatMoney(comprobanteEncontrado.valor_pagado || 0) }}</p>
                </div>
              </div>
              
              <div>
                <p class="text-xs text-gray-500 mb-1">Estado</p>
                <span 
                  :class="[
                    'badge',
                    comprobanteEncontrado.estado === 'pagada' ? 'badge-success' :
                    comprobanteEncontrado.estado === 'parcial' ? 'bg-blue-100 text-blue-800' :
                    comprobanteEncontrado.estado === 'mora' ? 'badge-danger' :
                    comprobanteEncontrado.estado === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ comprobanteEncontrado.estado?.toUpperCase() || 'N/A' }}
                </span>
              </div>
              
              <div v-if="comprobanteEncontrado.fecha_pago">
                <p class="text-xs text-gray-500 mb-1">Fecha de Pago</p>
                <p class="text-gray-800">{{ formatDate(comprobanteEncontrado.fecha_pago) }}</p>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorBusqueda" class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div class="flex items-center gap-2">
              <ExclamationCircleIcon class="w-6 h-6 text-red-600" />
              <p class="text-red-800 font-semibold">{{ errorBusqueda }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-gray-100 mt-4">
          <button 
            @click="cerrarModalBuscarComprobante"
            class="btn-secondary flex-1"
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
  ChevronDownIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  PlusIcon
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
const socioSeleccionado = ref(null)
const cuotasSocio = ref([])
const seccionActiva = ref('finanzas')
const busquedaSocio = ref('')
const codigoBusqueda = ref('')
const comprobanteEncontrado = ref(null)
const errorBusqueda = ref('')
const buscandoComprobante = ref(false)

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
  
  try {
    const result = await cuotasStore.buscarCuotaPorCodigo(id.value, codigoBusqueda.value.trim())
    
    if (result.success) {
      comprobanteEncontrado.value = result.data
    } else {
      errorBusqueda.value = result.error || 'No se encontró el comprobante'
    }
  } catch (e) {
    errorBusqueda.value = 'Error al buscar el comprobante: ' + e.message
  } finally {
    buscandoComprobante.value = false
  }
}

function cerrarModalBuscarComprobante() {
  modalBuscarComprobante.value = false
  codigoBusqueda.value = ''
  comprobanteEncontrado.value = null
  errorBusqueda.value = ''
}

// Socios ordenados por fecha de ingreso (más recientes primero)
const sociosRecientes = computed(() => {
  if (!natillera.value?.socios_natillera) return []
  
  return [...natillera.value.socios_natillera]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
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

function getAvatarUrl(seed, avatarSeed = null) {
  // Usar DiceBear Avatars con estilo "adventurer"
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
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

onMounted(() => {
  const natilleraId = props.id || route.params.id
  natillerasStore.fetchNatillera(natilleraId)
  configStore.cargarConfiguracion()
})
</script>


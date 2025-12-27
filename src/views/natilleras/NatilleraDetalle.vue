<template>
  <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
    <!-- Loading -->
    <div v-if="natillerasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando natillera...</p>
    </div>

    <template v-else-if="natillera">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <router-link to="/natilleras" class="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white text-natillera-700 font-semibold rounded-lg border border-natillera-200 shadow-sm hover:bg-natillera-50 hover:border-natillera-300 transition-all mb-2 sm:mb-3 text-sm sm:text-base">
            <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Volver
          </router-link>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-gray-800 flex flex-wrap items-center gap-2 sm:gap-3">
            <span class="break-words">{{ natillera.nombre }}</span>
            <span 
              :class="[
                'badge text-xs sm:text-sm',
                natillera.estado === 'activa' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ natillera.estado }}
            </span>
          </h1>
          <p class="text-gray-500 mt-1 text-sm sm:text-base">
            {{ natillera.periodicidad }} • Desde {{ formatDate(natillera.fecha_inicio) }}
          </p>
          <p class="text-natillera-600 font-medium text-sm mt-1 flex items-center gap-1">
            <CalendarDaysIcon class="w-4 h-4" />
            Período: {{ rangoMesesTexto }}
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2 w-full lg:w-auto lg:flex">
          <button 
            @click="abrirConfigMeses"
            class="btn-secondary py-2 px-2 sm:px-4 inline-flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
          >
            <Cog6ToothIcon class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Período</span>
          </button>
          <button 
            @click="modalWhatsApp = true"
            class="btn-secondary py-2 px-2 sm:px-4 inline-flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base"
          >
            <ChatBubbleLeftIcon class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Notificar</span>
          </button>
          <button 
            v-if="natillera.estado === 'activa'"
            @click="handleCerrarNatillera"
            class="px-2 sm:px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-xs sm:text-sm lg:text-base text-center"
          >
            Cerrar
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div class="stat-card">
          <p class="stat-value">{{ estadisticas.totalSocios }}</p>
          <p class="stat-label">Socios</p>
        </div>
        <div class="stat-card">
          <p class="stat-value text-natillera-600">${{ formatMoneyShort(estadisticas.totalAportado) }}</p>
          <p class="stat-label">Recaudado</p>
        </div>
        <div class="stat-card">
          <p class="stat-value text-amber-600">${{ formatMoneyShort(estadisticas.totalPendiente) }}</p>
          <p class="stat-label">Pendiente</p>
        </div>
        <div class="stat-card">
          <p class="stat-value text-purple-600">${{ formatMoneyShort(estadisticas.fondoTotal) }}</p>
          <p class="stat-label">Fondo Total</p>
        </div>
      </div>

      <!-- Navegación tabs -->
      <div class="w-full overflow-x-auto scrollbar-hide">
        <div class="flex gap-2 sm:gap-3 pb-2 min-w-min">
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="py-1.5 px-2.5 sm:py-2.5 sm:px-5 whitespace-nowrap inline-flex items-center gap-1 sm:gap-2 bg-white text-gray-700 font-semibold text-xs sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all flex-shrink-0"
          >
            <UsersIcon class="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Socios
          </router-link>
          <router-link 
            :to="`/natilleras/${id}/cuotas`"
            class="py-1.5 px-2.5 sm:py-2.5 sm:px-5 whitespace-nowrap inline-flex items-center gap-1 sm:gap-2 bg-white text-gray-700 font-semibold text-xs sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all flex-shrink-0"
          >
            <CurrencyDollarIcon class="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Cuotas
          </router-link>
          <router-link 
            :to="`/natilleras/${id}/prestamos`"
            class="py-1.5 px-2.5 sm:py-2.5 sm:px-5 whitespace-nowrap inline-flex items-center gap-1 sm:gap-2 bg-white text-gray-700 font-semibold text-xs sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all flex-shrink-0"
          >
            <BanknotesIcon class="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Préstamos
          </router-link>
          <router-link 
            :to="`/natilleras/${id}/actividades`"
            class="py-1.5 px-2.5 sm:py-2.5 sm:px-5 whitespace-nowrap inline-flex items-center gap-1 sm:gap-2 bg-white text-gray-700 font-semibold text-xs sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm hover:border-natillera-400 hover:text-natillera-700 hover:shadow-md transition-all flex-shrink-0"
          >
            <CalendarIcon class="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Actividades
          </router-link>
        </div>
      </div>

      <!-- Socios resumen -->
      <div class="card">
        <div class="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 class="text-base sm:text-xl font-display font-bold text-gray-800">
            Socios Recientes
          </h2>
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="inline-flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-natillera-600 text-white hover:bg-natillera-700 font-semibold text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap flex-shrink-0"
          >
            Ver todos
            <ArrowRightIcon class="w-3 h-3 sm:w-4 sm:h-4" />
          </router-link>
        </div>

        <div v-if="natillera.socios_natillera?.length === 0" class="text-center py-8">
          <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No hay socios registrados</p>
          <router-link 
            :to="`/natilleras/${id}/socios`"
            class="btn-primary mt-4 inline-block"
          >
            Agregar socios
          </router-link>
        </div>

        <div v-else class="space-y-2 sm:space-y-3">
          <div 
            v-for="sn in sociosRecientes" 
            :key="sn.id"
            class="flex items-center justify-between gap-2 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-natillera-200 transition-all"
          >
            <div 
              @click="verDetalleSocio(sn)"
              class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-80"
            >
              <img 
                :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed)" 
                :alt="sn.socio?.nombre"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-natillera-100 flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-800 text-sm sm:text-base truncate">{{ sn.socio?.nombre }}</p>
                <p class="text-xs sm:text-sm text-gray-500 truncate">Cuota: ${{ formatMoney(sn.valor_cuota_individual) }}</p>
              </div>
            </div>
            <span 
              :class="[
                'badge text-[10px] sm:text-xs flex-shrink-0',
                sn.estado === 'activo' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ sn.estado }}
            </span>
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
    <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalDetalle = false"></div>
      <div class="card relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl">
        <!-- Header del modal -->
        <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <img 
            :src="getAvatarUrl(socioSeleccionado?.socio?.nombre || socioSeleccionado?.id, socioSeleccionado?.socio?.avatar_seed)" 
            :alt="socioSeleccionado?.socio?.nombre"
            class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-natillera-100 shadow-lg flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h3 class="text-lg sm:text-xl font-display font-bold text-gray-800 truncate">
              {{ socioSeleccionado?.socio?.nombre }}
            </h3>
            <span 
              :class="[
                'badge mt-1',
                socioSeleccionado?.estado === 'activo' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ socioSeleccionado?.estado }}
            </span>
          </div>
          <button 
            @click="modalDetalle = false"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            <XMarkIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <!-- Indicador de estado (siempre visible) -->
        <div 
          :class="[
            'p-3 sm:p-4 rounded-xl mb-4 flex items-center gap-2 sm:gap-3',
            resumenSocio.alDia 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          ]"
        >
          <component 
            :is="resumenSocio.alDia ? CheckCircleIcon : ExclamationCircleIcon"
            :class="[
              'w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0',
              resumenSocio.alDia ? 'text-green-500' : 'text-red-500'
            ]"
          />
          <div class="min-w-0">
            <p :class="['font-semibold text-sm sm:text-base', resumenSocio.alDia ? 'text-green-700' : 'text-red-700']">
              {{ resumenSocio.alDia ? '¡Al día con los pagos!' : 'Tiene pagos pendientes' }}
            </p>
            <p class="text-xs sm:text-sm text-gray-600">
              {{ resumenSocio.alDia 
                ? 'Este socio ha cumplido con todas sus cuotas' 
                : `Debe ${resumenSocio.cuotasPendientes + resumenSocio.cuotasMora} cuota(s)` 
              }}
            </p>
          </div>
        </div>

        <!-- Secciones desplegables -->
        <div class="space-y-3">
          
          <!-- Sección: Resumen Financiero -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('finanzas')"
              class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-green-600" />
                Resumen Financiero
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'finanzas' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'finanzas'" class="p-3 sm:p-4 border-t border-gray-100 bg-white">
              <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                <div class="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p class="text-[10px] sm:text-xs font-medium text-green-600 mb-1">TOTAL APORTADO</p>
                  <p class="text-lg sm:text-2xl font-bold text-green-700">${{ formatMoney(resumenSocio.totalAportado) }}</p>
                </div>
                <div class="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                  <p class="text-[10px] sm:text-xs font-medium text-amber-600 mb-1">PENDIENTE</p>
                  <p class="text-lg sm:text-2xl font-bold text-amber-700">${{ formatMoney(resumenSocio.totalPendiente) }}</p>
                </div>
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cuotas</p>
              <div class="grid grid-cols-3 gap-1.5 sm:gap-2">
                <div class="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <p class="text-lg sm:text-xl font-bold text-green-600">{{ resumenSocio.cuotasPagadas }}</p>
                  <p class="text-[10px] sm:text-xs text-gray-500">Pagadas</p>
                </div>
                <div class="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <p class="text-lg sm:text-xl font-bold text-amber-600">{{ resumenSocio.cuotasPendientes }}</p>
                  <p class="text-[10px] sm:text-xs text-gray-500">Pendientes</p>
                </div>
                <div class="text-center p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <p class="text-lg sm:text-xl font-bold text-red-600">{{ resumenSocio.cuotasMora }}</p>
                  <p class="text-[10px] sm:text-xs text-gray-500">En Mora</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Información de Contacto -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('contacto')"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <UserIcon class="w-5 h-5 text-gray-600" />
                Información de Contacto
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'contacto' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'contacto'" class="p-3 sm:p-4 border-t border-gray-100 bg-white space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <PhoneIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div class="min-w-0 flex-1">
                    <p class="text-xs text-gray-500">Teléfono / WhatsApp</p>
                    <p class="font-medium text-gray-800 text-sm sm:text-base truncate">{{ socioSeleccionado?.socio?.telefono || 'No registrado' }}</p>
                  </div>
                </div>
                <a 
                  v-if="socioSeleccionado?.socio?.telefono"
                  :href="`https://wa.me/57${socioSeleccionado.socio.telefono.replace(/\D/g, '')}`"
                  target="_blank"
                  class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-200 transition-colors text-center flex-shrink-0"
                >
                  Enviar mensaje
                </a>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <p class="text-xs text-gray-500">Correo electrónico</p>
                  <p class="font-medium text-gray-800 text-sm sm:text-base truncate">{{ socioSeleccionado?.socio?.email || 'No registrado' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <IdentificationIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <p class="text-xs text-gray-500">Documento de identidad</p>
                  <p class="font-medium text-gray-800 text-sm sm:text-base truncate">{{ socioSeleccionado?.socio?.documento || 'No registrado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Configuración en la Natillera -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('config')"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <CurrencyDollarIcon class="w-5 h-5 text-gray-600" />
                Configuración de Cuotas
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'config' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'config'" class="p-3 sm:p-4 border-t border-gray-100 bg-white">
              <div class="grid grid-cols-2 gap-2 sm:gap-3">
                <div class="p-3 sm:p-4 bg-natillera-50 rounded-xl border border-natillera-100">
                  <p class="text-[10px] sm:text-xs text-gray-500 mb-1">Cuota mensual</p>
                  <p class="text-lg sm:text-xl font-bold text-natillera-700">${{ formatMoney(socioSeleccionado?.valor_cuota_individual) }}</p>
                </div>
                <div class="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p class="text-[10px] sm:text-xs text-gray-500 mb-1">Cuotas por período</p>
                  <p class="text-lg sm:text-xl font-bold text-gray-700">{{ socioSeleccionado?.cantidad_cuotas || 1 }}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Botón de cerrar -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <button 
            @click="modalDetalle = false"
            class="btn-primary w-full"
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
  CalendarDaysIcon
} from '@heroicons/vue/24/outline'
import { useSociosStore } from '../../stores/socios'
import { useConfiguracionStore } from '../../stores/configuracion'

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const sociosStore = useSociosStore()
const configStore = useConfiguracionStore()

const modalWhatsApp = ref(false)
const modalDetalle = ref(false)
const modalConfigMeses = ref(false)
const socioSeleccionado = ref(null)
const cuotasSocio = ref([])
const seccionActiva = ref('finanzas')
const busquedaSocio = ref('')

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


<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header con saludo -->
    <div class="relative">
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent mb-2">
              ¡Hola, {{ authStore.userName }}! 👋
            </h1>
            <p class="text-gray-600 text-sm sm:text-base font-medium">
              Bienvenido a tu panel de natilleras
            </p>
          </div>
          <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            <span>Nueva Natillera</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Invitaciones Pendientes -->
    <div v-if="colaboradoresStore.misInvitaciones.length > 0" class="relative animate-fade-in-up">
      <div class="relative bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/60 rounded-3xl p-5 sm:p-6 border-2 border-blue-200/60 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <EnvelopeIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Invitaciones Pendientes
                </h2>
                <p class="text-sm text-gray-600 mt-0.5">
                  Tienes {{ colaboradoresStore.misInvitaciones.length }} invitación{{ colaboradoresStore.misInvitaciones.length > 1 ? 'es' : '' }} para colaborar
                </p>
              </div>
            </div>
            <div class="px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg">
              {{ colaboradoresStore.misInvitaciones.length }}
            </div>
          </div>

          <!-- Lista de invitaciones -->
          <div class="space-y-3">
            <div
              v-for="invitacion in colaboradoresStore.misInvitaciones"
              :key="invitacion.id"
              class="relative bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300"
            >
              <!-- Efecto decorativo sutil -->
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div class="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                <!-- Avatar y info -->
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white flex-shrink-0">
                    <img
                      :src="getNatilleraAvatarUrl(invitacion.natillera_nombre)"
                      :alt="invitacion.natillera_nombre"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-display font-bold text-gray-800 text-lg sm:text-xl mb-1 truncate">
                      {{ invitacion.natillera_nombre }}
                    </h3>
                    <div class="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span class="flex items-center gap-1.5">
                        <UserGroupIcon class="w-4 h-4 text-blue-500" />
                        <span>Invitado por: <strong class="text-gray-800">{{ invitacion.invitado_por_nombre }}</strong></span>
                      </span>
                      <span class="text-gray-300 hidden sm:inline">•</span>
                      <span class="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs">
                        {{ formatearRol(invitacion.rol) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    @click="aceptarInvitacion(invitacion)"
                    :disabled="procesandoInvitacion === invitacion.id"
                    class="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  >
                    <CheckIcon class="w-5 h-5" />
                    <span class="hidden sm:inline">Aceptar</span>
                    <span class="sm:hidden">Aceptar</span>
                  </button>
                  <button
                    @click="rechazarInvitacion(invitacion)"
                    :disabled="procesandoInvitacion === invitacion.id"
                    class="px-4 py-2.5 sm:px-5 sm:py-3 bg-white border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-700 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  >
                    <XMarkIcon class="w-5 h-5" />
                    <span class="hidden sm:inline">Rechazar</span>
                    <span class="sm:hidden">Rechazar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-1">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-400 to-natillera-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-natillera-500/30">
            <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ natillerasStore.totalNatilleras }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Natilleras</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 border border-blue-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-2">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <UsersIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ totalSocios }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Socios</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-accent-50/30 to-orange-50/20 border border-accent-200/50 shadow-lg hover:shadow-xl hover:shadow-accent-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-3">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-400/15 to-orange-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent-500/30">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoneyShort(totalRecaudado) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Recaudado</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-4">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
            <ChartBarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ natillerasStore.natillerasActivas.length }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Activas</p>
        </div>
      </div>
    </div>

    <!-- Sección de Natilleras -->
    <div class="relative animate-fade-in-up stagger-5">
      <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">
          Tus Natilleras
        </h2>
        <p class="text-sm text-gray-600 mt-1">Gestiona tus grupos de ahorro</p>
      </div>

      <!-- Tabs: Todas / Propias / Compartidas -->
      <div class="flex gap-1 sm:gap-3 border-b border-gray-200 mb-6">
        <button
          @click="vistaActiva = 'todas'"
          :class="[
            'relative px-2 py-2 sm:px-4 sm:py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 flex-1 sm:flex-none justify-center',
            vistaActiva === 'todas'
              ? 'text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <span class="flex items-center gap-1 sm:gap-2">
            <Squares2X2Icon class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Todas</span>
            <span v-if="todasLasNatilleras.length > 0" class="px-1.5 py-0.5 sm:px-2 bg-purple-100 text-purple-700 rounded-full text-[10px] sm:text-xs font-bold">
              {{ todasLasNatilleras.length }}
            </span>
          </span>
          <div 
            v-if="vistaActiva === 'todas'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
          ></div>
        </button>
        <button
          @click="vistaActiva = 'propias'"
          :class="[
            'relative px-2 py-2 sm:px-4 sm:py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 flex-1 sm:flex-none justify-center',
            vistaActiva === 'propias'
              ? 'text-natillera-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <span class="flex items-center gap-1 sm:gap-2">
            <BanknotesIcon class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="hidden sm:inline">Mis Natilleras</span>
            <span class="sm:hidden">Mias</span>
            <span v-if="natillerasStore.natilleras.length > 0" class="px-1.5 py-0.5 sm:px-2 bg-natillera-100 text-natillera-700 rounded-full text-[10px] sm:text-xs font-bold">
              {{ natillerasStore.natilleras.length }}
            </span>
          </span>
          <div 
            v-if="vistaActiva === 'propias'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-natillera-500 to-emerald-500"
          ></div>
        </button>
        <button
          @click="vistaActiva = 'compartidas'"
          :class="[
            'relative px-2 py-2 sm:px-4 sm:py-3 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 flex-1 sm:flex-none justify-center',
            vistaActiva === 'compartidas'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <span class="flex items-center gap-1 sm:gap-2">
            <UserGroupIcon class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="hidden sm:inline">Compartidas Conmigo</span>
            <span class="sm:hidden">Compartidas</span>
            <span v-if="natillerasStore.natillerasCompartidas.length > 0" class="px-1.5 py-0.5 sm:px-2 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-bold">
              {{ natillerasStore.natillerasCompartidas.length }}
            </span>
          </span>
          <div 
            v-if="vistaActiva === 'compartidas'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"
          ></div>
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          @click="filtro = 'todas'"
          :class="[
            'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
            filtro === 'todas'
              ? 'text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
          ]"
        >
          <div 
            v-if="filtro === 'todas'"
            class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
          ></div>
          <span class="relative flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="filtro === 'todas' ? 'bg-white' : 'bg-gray-400'"></span>
            Todas
          </span>
        </button>
        <button 
          @click="filtro = 'activa'"
          :class="[
            'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
            filtro === 'activa'
              ? 'text-white shadow-lg shadow-natillera-500/30'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
          ]"
        >
          <div 
            v-if="filtro === 'activa'"
            class="absolute inset-0 bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500"
          ></div>
          <span class="relative flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="filtro === 'activa' ? 'bg-white' : 'bg-natillera-400'"></span>
            Activas
          </span>
        </button>
        <button 
          @click="filtro = 'cerrada'"
          :class="[
            'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
            filtro === 'cerrada'
              ? 'text-white shadow-lg shadow-amber-500/30'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 border border-gray-200 hover:border-amber-300 hover:shadow-md'
          ]"
        >
          <div 
            v-if="filtro === 'cerrada'"
            class="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
          ></div>
          <span class="relative flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="filtro === 'cerrada' ? 'bg-white' : 'bg-amber-400'"></span>
            Cerradas
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="natillerasStore.loading" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
        <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4 font-medium">Cargando natilleras...</p>
      </div>

      <!-- Vista: Todas (Propias + Compartidas) -->
      <template v-else-if="vistaActiva === 'todas'">
        <div v-if="todasLasNatillerasFiltradas.length === 0" class="relative bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 rounded-3xl p-8 sm:p-12 border border-purple-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
          <!-- Círculos decorativos -->
          <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-indigo-400/10 to-purple-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Squares2X2Icon class="w-10 h-10 text-white" />
            </div>
            <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
              {{ filtro === 'todas' ? 'No tienes natilleras aún' : `No hay natilleras ${filtro}s` }}
            </h3>
            <p class="text-gray-600 mb-8 text-sm sm:text-base">
              Crea tu primera natillera y comienza a ahorrar con tu comunidad
            </p>
            <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
              <PlusIcon class="w-5 h-5" />
              Crear Primera Natillera
            </router-link>
          </div>
        </div>

        <div v-else class="space-y-6">
          <!-- Sección: Natilleras Propias -->
          <div v-if="todasLasNatillerasFiltradas.filter(n => n.es_propia).length > 0">
            <div class="flex items-center gap-3 mb-4">
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-natillera-300 to-transparent"></div>
              <h3 class="text-sm font-bold text-natillera-700 uppercase tracking-wide flex items-center gap-2">
                <BanknotesIcon class="w-4 h-4" />
                Mis Natilleras ({{ todasLasNatillerasFiltradas.filter(n => n.es_propia).length }})
              </h3>
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-natillera-300 to-transparent"></div>
            </div>
            <div class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
              <div
                v-for="natillera in todasLasNatillerasFiltradas.filter(n => n.es_propia)" 
                :key="`propia-${natillera.id}`"
                class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                <router-link 
                  :to="`/natilleras/${natillera.id}`"
                  class="block p-6"
                >
                  <!-- Efectos decorativos -->
                  <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                  <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-start justify-between mb-4">
                      <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden border-2 border-white">
                        <img 
                          :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                          :alt="natillera.nombre"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <span 
                        :class="[
                          'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                          natillera.estado === 'activa' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                            : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                        ]"
                      >
                        {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
                      </span>
                    </div>
                    
                    <h3 class="font-display font-bold text-gray-800 text-xl mb-2 group-hover:text-natillera-700 transition-colors">
                      {{ natillera.nombre }}
                    </h3>
                    
                    <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span class="px-2.5 py-1 bg-natillera-100 text-natillera-700 rounded-lg font-semibold text-xs">
                        {{ natillera.periodicidad }}
                      </span>
                      <span class="text-gray-400">•</span>
                      <span class="text-gray-500">Desde {{ formatDate(natillera.fecha_inicio) }}</span>
                    </div>

                    <div class="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <UsersIcon class="w-4 h-4 text-gray-600" />
                        </div>
                        <span class="font-semibold">{{ natillera.socios_count || 0 }} {{ natillera.socios_count === 1 ? 'socio' : 'socios' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          v-if="puedeEliminarNatillera(natillera)"
                          @click.stop="confirmarEliminarNatillera(natillera)"
                          class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-red-200/50"
                          title="Eliminar natillera"
                        >
                          <TrashIcon class="w-4 h-4" />
                        </button>
                        <div class="w-8 h-8 rounded-lg bg-natillera-100 group-hover:bg-natillera-200 flex items-center justify-center transition-colors">
                          <ChevronRightIcon class="w-5 h-5 text-natillera-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Sección: Natilleras Compartidas -->
          <div v-if="todasLasNatillerasFiltradas.filter(n => !n.es_propia).length > 0">
            <div class="flex items-center gap-3 mb-4 mt-8">
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              <h3 class="text-sm font-bold text-blue-700 uppercase tracking-wide flex items-center gap-2">
                <UserGroupIcon class="w-4 h-4" />
                Compartidas Conmigo ({{ todasLasNatillerasFiltradas.filter(n => !n.es_propia).length }})
              </h3>
              <div class="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            </div>
            <div class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
              <div
                v-for="natillera in todasLasNatillerasFiltradas.filter(n => !n.es_propia)" 
                :key="`compartida-${natillera.id}`"
                class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border border-blue-200/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                <router-link 
                  :to="`/natilleras/${natillera.id}`"
                  class="block p-6"
                >
                  <!-- Efectos decorativos -->
                  <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                  <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-400/15 to-blue-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex items-start gap-3">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden border-2 border-white">
                          <img 
                            :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                            :alt="natillera.nombre"
                            class="w-full h-full object-cover"
                          />
                        </div>
                        <!-- Badge de rol -->
                        <div class="px-2 py-1 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg shadow-sm mt-0.5">
                          <span :class="[
                            'text-xs font-bold',
                            natillera.mi_rol === 'co_administrador' ? 'text-purple-600' :
                            natillera.mi_rol === 'colaborador' ? 'text-blue-600' : 'text-gray-600'
                          ]">
                            {{ formatearRol(natillera.mi_rol) }}
                          </span>
                        </div>
                      </div>
                      <span 
                        :class="[
                          'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                          natillera.estado === 'activa' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                            : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                        ]"
                      >
                        {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
                      </span>
                    </div>
                    
                    <h3 class="font-display font-bold text-gray-800 text-xl mb-2 group-hover:text-blue-700 transition-colors">
                      {{ natillera.nombre }}
                    </h3>
                    
                    <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span class="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs">
                        {{ natillera.periodicidad }}
                      </span>
                      <span class="text-gray-400">•</span>
                      <span class="text-gray-500">Desde {{ formatDate(natillera.fecha_inicio) }}</span>
                    </div>

                    <div class="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <UsersIcon class="w-4 h-4 text-gray-600" />
                        </div>
                        <span class="font-semibold">{{ natillera.socios_count || 0 }} socios</span>
                      </div>
                      <div class="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                        <ChevronRightIcon class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Vista: Mis Natilleras (propias) -->
      <template v-else-if="vistaActiva === 'propias'">
        <div v-if="natillerasFiltradas.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
          <!-- Círculos decorativos -->
          <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
              <BanknotesIcon class="w-10 h-10 text-white" />
            </div>
            <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
              {{ filtro === 'todas' ? 'No tienes natilleras aún' : `No hay natilleras ${filtro}s` }}
            </h3>
            <p class="text-gray-600 mb-8 text-sm sm:text-base">
              Crea tu primera natillera y comienza a ahorrar con tu comunidad
            </p>
            <router-link to="/natilleras/crear" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
              <PlusIcon class="w-5 h-5" />
              Crear Primera Natillera
            </router-link>
          </div>
        </div>

        <div v-else class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="natillera in natillerasFiltradas" 
            :key="natillera.id"
            class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300"
          >
            <router-link 
              :to="`/natilleras/${natillera.id}`"
              class="block p-6"
            >
              <!-- Efectos decorativos -->
              <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
              
              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden border-2 border-white">
                    <img 
                      :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                      :alt="natillera.nombre"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <span 
                    :class="[
                      'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                      natillera.estado === 'activa' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                        : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                    ]"
                  >
                    {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
                  </span>
                </div>
                
                <h3 class="font-display font-bold text-gray-800 text-xl mb-2 group-hover:text-natillera-700 transition-colors">
                  {{ natillera.nombre }}
                </h3>
                
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span class="px-2.5 py-1 bg-natillera-100 text-natillera-700 rounded-lg font-semibold text-xs">
                    {{ natillera.periodicidad }}
                  </span>
                  <span class="text-gray-400">•</span>
                  <span class="text-gray-500">Desde {{ formatDate(natillera.fecha_inicio) }}</span>
                </div>

                <div class="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <UsersIcon class="w-4 h-4 text-gray-600" />
                    </div>
                    <span class="font-semibold">{{ natillera.socios_count || 0 }} {{ natillera.socios_count === 1 ? 'socio' : 'socios' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      v-if="puedeEliminarNatillera(natillera)"
                      @click.stop="confirmarEliminarNatillera(natillera)"
                      class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-red-200/50"
                      title="Eliminar natillera"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                    <div class="w-8 h-8 rounded-lg bg-natillera-100 group-hover:bg-natillera-200 flex items-center justify-center transition-colors">
                      <ChevronRightIcon class="w-5 h-5 text-natillera-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </template>

      <!-- Vista: Natilleras Compartidas -->
      <template v-else-if="vistaActiva === 'compartidas'">
        <div v-if="natillerasCompartidasFiltradas.length === 0" class="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl p-8 sm:p-12 border border-blue-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
          <div class="relative z-10">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
              <UserGroupIcon class="w-10 h-10 text-blue-600" />
            </div>
            <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-3">
              No tienes natilleras compartidas
            </h3>
            <p class="text-gray-600 mt-2 text-base">
              Cuando alguien te invite a colaborar en una natillera, aparecerá aquí
            </p>
          </div>
        </div>
        
        <div v-else class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="natillera in natillerasCompartidasFiltradas" 
            :key="natillera.id"
            class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border border-blue-200/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
          >
            <router-link 
              :to="`/natilleras/${natillera.id}`"
              class="block p-6"
            >
              <!-- Efectos decorativos -->
              <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-400/15 to-blue-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
              
              <div class="relative z-10">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start gap-3">
                    <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden border-2 border-white">
                      <img 
                        :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                        :alt="natillera.nombre"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <!-- Badge de rol -->
                    <div class="px-2 py-1 bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg shadow-sm mt-0.5">
                      <span :class="[
                        'text-xs font-bold',
                        natillera.mi_rol === 'co_administrador' ? 'text-purple-600' :
                        natillera.mi_rol === 'colaborador' ? 'text-blue-600' : 'text-gray-600'
                      ]">
                        {{ formatearRol(natillera.mi_rol) }}
                      </span>
                    </div>
                  </div>
                  <span 
                    :class="[
                      'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                      natillera.estado === 'activa' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' 
                        : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                    ]"
                  >
                    {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
                  </span>
                </div>
                
                <h3 class="font-display font-bold text-gray-800 text-xl mb-2 group-hover:text-blue-700 transition-colors">
                  {{ natillera.nombre }}
                </h3>
                
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span class="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs">
                    {{ natillera.periodicidad }}
                  </span>
                  <span class="text-gray-400">•</span>
                  <span class="text-gray-500">Desde {{ formatDate(natillera.fecha_inicio) }}</span>
                </div>

                <div class="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <UsersIcon class="w-4 h-4 text-gray-600" />
                    </div>
                    <span class="font-semibold">{{ natillera.socios_count || 0 }} socios</span>
                  </div>
                  <div class="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <ChevronRightIcon class="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal de confirmación para eliminar natillera -->
    <div v-if="natilleraAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="natilleraAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <TrashIcon class="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Eliminar Natillera</h3>
            <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-700 mb-2">
            ¿Estás seguro de que deseas eliminar la natillera <strong>"{{ natilleraAEliminar.nombre }}"</strong>?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <p class="font-semibold mb-1">⚠️ Se eliminarán permanentemente:</p>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>Todos los socios asociados</li>
              <li>Todas las cuotas</li>
              <li>Todos los préstamos y pagos</li>
              <li>Todas las actividades</li>
              <li>Todos los registros de historial</li>
            </ul>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="natilleraAEliminar = null"
            class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="eliminarNatilleraConfirmado"
            :disabled="natillerasStore.loading"
            class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ natillerasStore.loading ? 'Eliminando...' : 'Sí, Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
import { useUsersStore } from '../stores/users'
import { useNotificationStore } from '../stores/notifications'
import { useColaboradoresStore } from '../stores/colaboradores'
import { supabase } from '../lib/supabase'
import { getNatilleraAvatarUrl } from '../utils/avatars'
import { 
  BanknotesIcon, 
  UsersIcon, 
  UserGroupIcon,
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  ChevronRightIcon,
  TrashIcon,
  Squares2X2Icon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()
const usersStore = useUsersStore()
const notificationStore = useNotificationStore()
const colaboradoresStore = useColaboradoresStore()

const totalRecaudado = ref(0)
const filtro = ref('todas')
const vistaActiva = ref('todas')
const natilleraAEliminar = ref(null)
const usuarioAutenticado = ref(null)
const procesandoInvitacion = ref(null)

const totalSocios = computed(() => {
  return natillerasStore.natilleras.reduce((sum, n) => {
    return sum + (n.socios_count || 0)
  }, 0)
})

const natillerasFiltradas = computed(() => {
  if (filtro.value === 'todas') {
    return natillerasStore.natilleras
  }
  return natillerasStore.natilleras.filter(n => n.estado === filtro.value)
})

const natillerasCompartidasFiltradas = computed(() => {
  if (filtro.value === 'todas') {
    return natillerasStore.natillerasCompartidas
  }
  return natillerasStore.natillerasCompartidas.filter(n => n.estado === filtro.value)
})

// Combinar natilleras propias y compartidas con flag de diferenciación
const todasLasNatilleras = computed(() => {
  const propias = natillerasStore.natilleras.map(n => ({ ...n, es_propia: true }))
  const compartidas = natillerasStore.natillerasCompartidas.map(n => ({ ...n, es_propia: false }))
  return [...propias, ...compartidas]
})

const todasLasNatillerasFiltradas = computed(() => {
  let todas = todasLasNatilleras.value
  
  if (filtro.value !== 'todas') {
    todas = todas.filter(n => n.estado === filtro.value)
  }
  
  // Ordenar: primero las propias, luego las compartidas
  return todas.sort((a, b) => {
    if (a.es_propia && !b.es_propia) return -1
    if (!a.es_propia && b.es_propia) return 1
    return 0
  })
})

async function calcularTotalRecaudado() {
  try {
    const natilleraIds = natillerasStore.natilleras.map(n => n.id)
    
    if (natilleraIds.length === 0) {
      totalRecaudado.value = 0
      return
    }

    const { data: sociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id')
      .in('natillera_id', natilleraIds)

    if (!sociosNatillera || sociosNatillera.length === 0) {
      totalRecaudado.value = 0
      return
    }

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    const { data: cuotas } = await supabase
      .from('cuotas')
      .select('valor_pagado')
      .in('socio_natillera_id', socioNatilleraIds)

    totalRecaudado.value = (cuotas || []).reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
  } catch (e) {
    console.error('Error calculando total recaudado:', e)
    totalRecaudado.value = 0
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value)
}

function formatMoneyShort(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return formatMoney(value)
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatearRol(rol) {
  const nombres = {
    co_administrador: 'Co-Admin',
    colaborador: 'Colaborador',
    visor: 'Visor'
  }
  return nombres[rol] || rol
}

function puedeEliminarNatillera(natillera) {
  if (!usuarioAutenticado.value) {
    return false
  }

  const emailUsuario = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  if (emailUsuario === 'raigo.16@gmail.com') {
    return true
  }

  return natillera.admin_id === usuarioAutenticado.value.id
}

function confirmarEliminarNatillera(natillera) {
  natilleraAEliminar.value = natillera
}

async function eliminarNatilleraConfirmado() {
  if (!natilleraAEliminar.value) return

  const resultado = await natillerasStore.eliminarNatillera(natilleraAEliminar.value.id)
  
  if (resultado.success) {
    natilleraAEliminar.value = null
    await natillerasStore.fetchNatilleras()
    await calcularTotalRecaudado()
    notificationStore.success('Natillera eliminada exitosamente', 'Éxito')
  } else {
    const mensajeError = resultado.error || 'Error desconocido al eliminar la natillera'
    
    if (mensajeError.includes('permisos') || mensajeError.includes('42501')) {
      notificationStore.error(
        `${mensajeError}\n\nPor favor, ejecuta la migración SQL en Supabase: add_cascade_delete_policies.sql`,
        'Error de permisos'
      )
    } else {
      notificationStore.error(
        `Error al eliminar la natillera:\n\n${mensajeError}\n\nRevisa la consola del navegador (F12) para más detalles.`,
        'Error'
      )
    }
  }
}

async function aceptarInvitacion(invitacion) {
  try {
    procesandoInvitacion.value = invitacion.id
    
    const resultado = await colaboradoresStore.aceptarInvitacion(invitacion.token_invitacion)
    
    if (resultado.success) {
      notificationStore.success(
        `¡Ahora eres colaborador de "${resultado.data.natillera_nombre}"!`,
        'Invitación aceptada'
      )
      // Recargar natilleras compartidas
      await natillerasStore.fetchNatillerasCompartidas()
    } else {
      notificationStore.error(resultado.error || 'Error al aceptar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al aceptar la invitación')
  } finally {
    procesandoInvitacion.value = null
  }
}

async function rechazarInvitacion(invitacion) {
  if (!confirm('¿Estás seguro de que deseas rechazar esta invitación?')) {
    return
  }

  try {
    procesandoInvitacion.value = invitacion.id
    
    const resultado = await colaboradoresStore.rechazarInvitacion(invitacion.token_invitacion)
    
    if (resultado.success) {
      notificationStore.info('Invitación rechazada')
    } else {
      notificationStore.error(resultado.error || 'Error al rechazar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al rechazar la invitación')
  } finally {
    procesandoInvitacion.value = null
  }
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user
  
  await usersStore.getCurrentUserProfile()
  await colaboradoresStore.fetchMisInvitaciones()
  await natillerasStore.fetchTodasLasNatilleras()
  await calcularTotalRecaudado()
})
</script>

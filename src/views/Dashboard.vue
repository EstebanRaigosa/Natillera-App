<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header móvil -->
    <div class="relative sm:hidden mb-6">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-display font-bold text-gray-800 mb-1">
            ¡Hola, {{ authStore.userName }}! 👋
          </h1>
          <p class="text-gray-600 text-sm font-medium">
            Panel de control
          </p>
        </div>
        <router-link 
          id="boton-crear-natillera-movil"
          to="/natilleras/crear" 
          class="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all flex-shrink-0"
        >
          <PlusIcon class="w-6 h-6 text-white" />
        </router-link>
      </div>
    </div>

    <!-- Header desktop -->
    <div class="relative hidden sm:block">
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
              class="relative bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300"
            >
              <!-- Efecto decorativo sutil -->
              <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div class="relative z-10 flex flex-col gap-2.5 sm:gap-4">
                <!-- Avatar y nombre de natillera -->
                <div class="flex items-center gap-2.5 sm:gap-4">
                  <div class="w-12 h-12 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shadow-md border-2 border-blue-200/60 bg-blue-50/50 flex-shrink-0 ring-1 ring-gray-100/50">
                    <img
                      :src="getNatilleraAvatarUrl(invitacion.natillera_nombre)"
                      :alt="invitacion.natillera_nombre"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-display font-bold text-gray-800 text-base sm:text-2xl mb-0.5 sm:mb-1 truncate">
                      {{ invitacion.natillera_nombre }}
                    </h3>
                    <span class="inline-block px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm">
                      {{ formatearRol(invitacion.rol) }}
                    </span>
                  </div>
                </div>

                <!-- Mensaje principal -->
                <div class="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/40 border-l-4 border-blue-500 rounded-lg p-2.5 sm:p-5 shadow-sm">
                  <div class="flex items-start gap-2 sm:gap-3">
                    <div class="flex-shrink-0 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <UserGroupIcon class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm sm:text-base text-gray-800 leading-snug sm:leading-relaxed">
                        <template v-if="invitacion.invitado_por_nombre || invitacion.invitado_por_email">
                          <span v-if="invitacion.invitado_por_nombre" class="font-bold text-gray-900">{{ invitacion.invitado_por_nombre }}</span>
                          <span v-if="invitacion.invitado_por_email" class="text-gray-600">
                            <span v-if="invitacion.invitado_por_nombre"> (<span class="text-xs sm:text-sm">{{ invitacion.invitado_por_email }}</span>)</span>
                            <span v-else>(<span class="text-xs sm:text-sm font-medium">{{ invitacion.invitado_por_email }}</span>)</span>
                          </span>
                        </template>
                        <span v-else class="font-bold text-gray-900">Alguien</span>
                        <span class="text-gray-700"> te invitó como </span>
                        <span class="font-semibold text-indigo-700">{{ formatearRol(invitacion.rol) }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Mensaje adicional de la invitación (notas) -->
                <div v-if="invitacion.notas" class="bg-amber-50/80 border-l-4 border-amber-400 rounded-lg p-2.5 sm:p-4">
                  <p class="text-xs sm:text-sm font-semibold text-amber-900 mb-0.5 sm:mb-1">💬 Mensaje:</p>
                  <p class="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words leading-snug sm:leading-relaxed">{{ invitacion.notas }}</p>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <button
                    @click="aceptarInvitacion(invitacion)"
                    :disabled="procesandoInvitacion === invitacion.id"
                    class="flex-1 px-3 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <CheckIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Aceptar</span>
                  </button>
                  <button
                    @click="rechazarInvitacion(invitacion)"
                    :disabled="procesandoInvitacion === invitacion.id"
                    class="flex-1 px-3 py-2 sm:px-5 sm:py-3 bg-white border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-700 font-semibold rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <XMarkIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats móvil -->
    <div v-if="todasLasNatilleras.length > 0" class="sm:hidden grid grid-cols-2 gap-3 mb-4">
      <div class="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-2">
            <BanknotesIcon class="w-5 h-5 text-white" />
          </div>
          <p class="text-2xl font-display font-bold text-gray-800 mb-0.5">{{ natillerasStore.totalNatilleras }}</p>
          <p class="text-xs font-semibold text-gray-600">Natilleras</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
            <UsersIcon class="w-5 h-5 text-white" />
          </div>
          <p class="text-2xl font-display font-bold text-gray-800 mb-0.5">{{ totalSocios }}</p>
          <p class="text-xs font-semibold text-gray-600">Socios</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-2">
            <CurrencyDollarIcon class="w-5 h-5 text-white" />
          </div>
          <p class="text-2xl font-display font-bold text-gray-800 mb-0.5">${{ formatMoneyShort(totalRecaudado) }}</p>
          <p class="text-xs font-semibold text-gray-600">Recaudado</p>
        </div>
      </div>

      <div class="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-2">
            <ChartBarIcon class="w-5 h-5 text-white" />
          </div>
          <p class="text-2xl font-display font-bold text-gray-800 mb-0.5">{{ natillerasStore.natillerasActivas.length }}</p>
          <p class="text-xs font-semibold text-gray-600">Activas</p>
        </div>
      </div>
    </div>

    <!-- Stats desktop -->
    <div v-if="todasLasNatilleras.length > 0" class="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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
      <!-- Pestañas de navegación móvil -->
      <div class="sm:hidden mb-4">
        <div class="bg-gray-100 rounded-xl p-1 flex gap-1 mb-4">
          <button
            @click="vistaActiva = 'todas'"
            :class="[
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all',
              vistaActiva === 'todas'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Todas
          </button>
          <button
            @click="vistaActiva = 'propias'"
            :class="[
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all',
              vistaActiva === 'propias'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Mis Natilleras
          </button>
          <button
            @click="vistaActiva = 'compartidas'"
            :class="[
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all',
              vistaActiva === 'compartidas'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Compartidas
          </button>
          <button
            @click="vistaActiva = 'socio'"
            :class="[
              'flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all',
              vistaActiva === 'socio'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            ]"
          >
            Como socio
          </button>
        </div>
      </div>

      <!-- Encabezado y Filtros desktop -->
      <div class="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <!-- Encabezado -->
        <div>
          <h2 class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">
            Tus Natilleras
          </h2>
          <p class="text-sm text-gray-600">Gestiona tus grupos de ahorro según tu rol</p>
        </div>

        <!-- Barra de Filtro Principal (Tipo) -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="vistaActiva = 'todas'"
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2',
              vistaActiva === 'todas'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            ]"
          >
            <Squares2X2Icon class="w-4 h-4" />
            <span>Todas</span>
          </button>
          <button
            @click="vistaActiva = 'propias'"
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2',
              vistaActiva === 'propias'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            ]"
          >
            <BanknotesIcon class="w-4 h-4" />
            <span>Mis Natilleras</span>
          </button>
          <button
            @click="vistaActiva = 'compartidas'"
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2',
              vistaActiva === 'compartidas'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            ]"
          >
            <UserGroupIcon class="w-4 h-4" />
            <span>Compartidas conmigo</span>
          </button>
          <button
            @click="vistaActiva = 'socio'"
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2',
              vistaActiva === 'socio'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            ]"
          >
            <UserIcon class="w-4 h-4" />
            <span>Como socio</span>
          </button>
        </div>
      </div>

      <!-- Título y filtros móvil -->
      <div class="sm:hidden flex items-center justify-between mb-4">
        <h2 class="text-xl font-display font-bold text-gray-800">
          Tus Natilleras
        </h2>
        <div class="flex items-center gap-2">
          <button 
            @click="filtro = 'activa'"
            :class="[
              'px-3 py-1.5 rounded-lg font-semibold text-xs transition-all',
              filtro === 'activa'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            Activas
          </button>
          <button 
            @click="filtro = 'cerrada'"
            :class="[
              'px-3 py-1.5 rounded-lg font-semibold text-xs transition-all',
              filtro === 'cerrada'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-600'
            ]"
          >
            Cerradas
          </button>
          <button class="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
            <FunnelIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Barra de Filtro Secundaria (Estado) desktop -->
      <div class="hidden sm:flex items-center gap-3 mb-6">
        <span class="text-sm font-semibold text-gray-700">ESTADO:</span>
        <div class="flex gap-2">
          <button 
            @click="filtro = 'todas'"
            :class="[
              'px-4 py-1.5 rounded-full font-semibold text-sm transition-all',
              filtro === 'todas'
                ? 'border-2 border-green-600 text-green-600 bg-green-50'
                : 'border-2 border-gray-300 text-gray-600 hover:border-gray-400'
            ]"
          >
            Todas
          </button>
          <button 
            @click="filtro = 'activa'"
            :class="[
              'px-4 py-1.5 rounded-full font-semibold text-sm transition-all',
              filtro === 'activa'
                ? 'border-2 border-green-600 text-green-600 bg-green-50'
                : 'border-2 border-gray-300 text-gray-600 hover:border-gray-400'
            ]"
          >
            Activas
          </button>
          <button 
            @click="filtro = 'cerrada'"
            :class="[
              'px-4 py-1.5 rounded-full font-semibold text-sm transition-all',
              filtro === 'cerrada'
                ? 'border-2 border-green-600 text-green-600 bg-green-50'
                : 'border-2 border-gray-300 text-gray-600 hover:border-gray-400'
            ]"
          >
            Cerradas
          </button>
        </div>
      </div>

      <!-- Loading - Solo mostrar si NO está verificando el modal y NO se está eliminando una natillera -->
      <div v-if="natillerasStore.loading && !verificandoModal && !eliminandoNatillera" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
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

        <div v-else class="grid gap-5 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="natillera in todasLasNatillerasFiltradas" 
            :key="natillera.id"
            class="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
          >
            <!-- Router-link que envuelve toda la tarjeta (excepto botones de acción) -->
            <router-link 
              :to="`/natilleras/${natillera.id}`"
              class="block cursor-pointer flex-1 flex flex-col"
            >
              <!-- Cabecera de la tarjeta -->
              <div class="p-5 pb-4 flex-1 flex flex-col">
              <div class="flex items-start gap-4 mb-4">
                <!-- Avatar grande de la natillera -->
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-gray-200/60 shadow-sm flex-shrink-0 ring-1 ring-gray-100/50" :class="{
                  'bg-green-50': obtenerTipoNatillera(natillera).color === 'green',
                  'bg-blue-50': obtenerTipoNatillera(natillera).color === 'blue',
                  'bg-orange-50': obtenerTipoNatillera(natillera).color === 'orange'
                }">
                  <img 
                    :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                    :alt="natillera.nombre"
                    class="w-full h-full object-cover"
                  />
                </div>
                
                <!-- Nombre y etiquetas -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h3 class="font-display font-bold text-gray-800 text-lg leading-tight">
                      {{ natillera.nombre }}
                    </h3>
                    <!-- Estado ACTIVA en esquina superior derecha -->
                    <span v-if="natillera.estado === 'activa'" class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span class="text-xs font-bold text-green-600">ACTIVA</span>
                    </span>
                    <span v-else class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                      <span class="text-xs font-bold text-gray-600">CERRADA</span>
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Etiqueta de rol/estado -->
                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold" :class="{
                      'bg-green-100 text-green-700': obtenerTipoNatillera(natillera).color === 'green',
                      'bg-blue-100 text-blue-700': obtenerTipoNatillera(natillera).color === 'blue',
                      'bg-orange-100 text-orange-700': obtenerTipoNatillera(natillera).color === 'orange'
                    }">
                      {{ obtenerTipoNatillera(natillera).tipo }}
                    </span>
                    <!-- Fecha de inicio -->
                    <span class="text-xs text-gray-600">
                      Inicia: {{ formatDate(natillera.fecha_inicio) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Cuerpo: SOCIOS y TOTAL RECAUDADO -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Columna SOCIOS -->
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-2">SOCIOS</p>
                  <div class="flex items-center gap-2">
                    <!-- Icono de usuarios -->
                    <UserGroupIcon class="w-6 h-6 text-blue-600" />
                    <!-- Número total de socios -->
                    <span class="text-lg font-bold text-gray-800">
                      {{ natillera.socios_count || 0 }}
                    </span>
                  </div>
                </div>

                <!-- Columna TOTAL RECAUDADO -->
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-2">TOTAL RECAUDADO</p>
                  <div class="flex items-center gap-2">
                    <!-- Icono de bolsa de dinero -->
                    <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
                    <!-- Cantidad recaudada -->
                    <span class="text-lg font-bold text-green-600">
                      ${{ formatMoneyShort(obtenerRecaudadoNatillera(natillera.id)) }}
                    </span>
                  </div>
                </div>
              </div>
              </div>

              <!-- Pie de la tarjeta: Rango de fechas -->
              <div class="px-5 pb-5 pt-0 border-t border-gray-100">
                <!-- Rango de fechas -->
                <div class="flex items-center gap-1.5 text-xs text-gray-600">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  <span>{{ formatearRangoMeses(natillera) }}</span>
                </div>
              </div>
            </router-link>
            
            <!-- Botón eliminar (fuera del router-link para que no active la navegación) -->
            <button
              v-if="puedeEliminarNatillera(natillera) && natillera.es_propia"
              @click.stop="confirmarEliminarNatillera(natillera)"
              class="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              title="Eliminar natillera"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Tarjeta crear nueva natillera -->
          <router-link 
            to="/natilleras/crear"
            class="group relative overflow-hidden rounded-2xl bg-white border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/30 transition-all duration-300 flex flex-col h-full"
          >
            <!-- Cabecera de la tarjeta (mismo padding que las demás) -->
            <div class="p-5 pb-4 flex-1 flex items-center justify-center">
              <div class="text-center w-full">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                  <PlusIcon class="w-8 h-8 text-green-600" />
                </div>
                <h3 class="font-display font-bold text-gray-800 text-xl mb-2">Crear nueva natillera</h3>
                <p class="text-sm text-gray-600">Inicia un nuevo grupo de ahorro</p>
              </div>
            </div>
            <!-- Pie de la tarjeta (mismo padding que las demás) -->
            <div class="px-5 pb-5 pt-0 border-t border-gray-100">
              <div class="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                <PlusIcon class="w-4 h-4 text-gray-400" />
                <span>Nueva natillera</span>
              </div>
            </div>
          </router-link>
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
            class="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
          >
            <!-- Router-link que envuelve toda la tarjeta (excepto botones de acción) -->
            <router-link 
              :to="`/natilleras/${natillera.id}`"
              class="block cursor-pointer flex-1 flex flex-col"
            >
              <!-- Cabecera de la tarjeta -->
              <div class="p-5 pb-4 flex-1 flex flex-col">
              <div class="flex items-start gap-4 mb-4">
                <!-- Avatar grande de la natillera -->
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-gray-200/60 shadow-sm flex-shrink-0 bg-green-50 ring-1 ring-gray-100/50">
                  <img 
                    :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                    :alt="natillera.nombre"
                    class="w-full h-full object-cover"
                  />
                </div>
                
                <!-- Nombre y etiquetas -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h3 class="font-display font-bold text-gray-800 text-lg leading-tight">
                      {{ natillera.nombre }}
                    </h3>
                    <!-- Estado ACTIVA en esquina superior derecha -->
                    <span v-if="natillera.estado === 'activa'" class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span class="text-xs font-bold text-green-600">ACTIVA</span>
                    </span>
                    <span v-else class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                      <span class="text-xs font-bold text-gray-600">CERRADA</span>
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Etiqueta de rol/estado -->
                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-700">
                      MÍA
                    </span>
                    <!-- Fecha de inicio -->
                    <span class="text-xs text-gray-600">
                      Inicia: {{ formatDate(natillera.fecha_inicio) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Cuerpo: SOCIOS y TOTAL RECAUDADO -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Columna SOCIOS -->
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-2">SOCIOS</p>
                  <div class="flex items-center gap-2">
                    <!-- Icono de usuarios -->
                    <UserGroupIcon class="w-6 h-6 text-blue-600" />
                    <!-- Número total de socios -->
                    <span class="text-lg font-bold text-gray-800">
                      {{ natillera.socios_count || 0 }}
                    </span>
                  </div>
                </div>

                <!-- Columna TOTAL RECAUDADO -->
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-2">TOTAL RECAUDADO</p>
                  <div class="flex items-center gap-2">
                    <!-- Icono de bolsa de dinero -->
                    <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
                    <!-- Cantidad recaudada -->
                    <span class="text-lg font-bold text-green-600">
                      ${{ formatMoneyShort(obtenerRecaudadoNatillera(natillera.id)) }}
                    </span>
                  </div>
                </div>
              </div>
              </div>

              <!-- Pie de la tarjeta: Rango de fechas -->
              <div class="px-5 pb-5 pt-0 border-t border-gray-100">
                <!-- Rango de fechas -->
                <div class="flex items-center gap-1.5 text-xs text-gray-600">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  <span>{{ formatearRangoMeses(natillera) }}</span>
                </div>
              </div>
            </router-link>
            
            <!-- Botón eliminar (fuera del router-link para que no active la navegación) -->
            <button
              v-if="puedeEliminarNatillera(natillera)"
              @click.stop="confirmarEliminarNatillera(natillera)"
              class="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              title="Eliminar natillera"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Tarjeta crear nueva natillera -->
          <router-link 
            to="/natilleras/crear"
            class="group relative overflow-hidden rounded-2xl bg-white border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/30 transition-all duration-300 flex flex-col h-full"
          >
            <!-- Cabecera de la tarjeta (mismo padding que las demás) -->
            <div class="p-5 pb-4 flex-1 flex items-center justify-center">
              <div class="text-center w-full">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                  <PlusIcon class="w-8 h-8 text-green-600" />
                </div>
                <h3 class="font-display font-bold text-gray-800 text-xl mb-2">Crear nueva natillera</h3>
                <p class="text-sm text-gray-600">Inicia un nuevo grupo de ahorro</p>
              </div>
            </div>
            <!-- Pie de la tarjeta (mismo padding que las demás) -->
            <div class="px-5 pb-5 pt-0 border-t border-gray-100">
              <div class="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                <PlusIcon class="w-4 h-4 text-gray-400" />
                <span>Nueva natillera</span>
              </div>
            </div>
          </router-link>
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
            class="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col"
          >
            <!-- Router-link que envuelve toda la tarjeta (excepto botones de acción) -->
            <router-link 
              :to="`/natilleras/${natillera.id}`"
              class="block cursor-pointer flex-1 flex flex-col"
            >
              <!-- Cabecera de la tarjeta -->
              <div class="p-5 pb-4 flex-1 flex flex-col">
              <div class="flex items-start gap-4 mb-4">
                <!-- Avatar grande de la natillera -->
                <div class="w-16 h-16 rounded-xl overflow-hidden border border-gray-200/60 shadow-sm flex-shrink-0 bg-blue-50 ring-1 ring-gray-100/50">
                  <img 
                    :src="getNatilleraAvatarUrl(natillera.nombre, natillera.avatar_seed)" 
                    :alt="natillera.nombre"
                    class="w-full h-full object-cover"
                  />
                </div>
                
                <!-- Nombre y etiquetas -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h3 class="font-display font-bold text-gray-800 text-lg leading-tight">
                      {{ natillera.nombre }}
                    </h3>
                    <!-- Estado ACTIVA en esquina superior derecha -->
                    <span v-if="natillera.estado === 'activa'" class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span class="text-xs font-bold text-green-600">ACTIVA</span>
                    </span>
                    <span v-else class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                      <span class="text-xs font-bold text-gray-600">CERRADA</span>
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2 flex-wrap">
                    <!-- Etiqueta de rol/estado -->
                    <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                      COMPARTIDA
                    </span>
                    <!-- Fecha de inicio -->
                    <span class="text-xs text-gray-600">
                      Inicia: {{ formatDate(natillera.fecha_inicio) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Cuerpo: SOCIOS y TOTAL RECAUDADO -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <!-- Columna SOCIOS -->
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-2">SOCIOS</p>
                  <div class="flex items-center gap-2">
                    <!-- Icono de usuarios -->
                    <UserGroupIcon class="w-6 h-6 text-blue-600" />
                    <!-- Número total de socios -->
                    <span class="text-lg font-bold text-gray-800">
                      {{ natillera.socios_count || 0 }}
                    </span>
                  </div>
                </div>

                <!-- Columna TOTAL RECAUDADO -->
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-2">TOTAL RECAUDADO</p>
                  <div class="flex items-center gap-2">
                    <!-- Icono de bolsa de dinero -->
                    <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
                    <!-- Cantidad recaudada -->
                    <span class="text-lg font-bold text-green-600">
                      ${{ formatMoneyShort(obtenerRecaudadoNatillera(natillera.id)) }}
                    </span>
                  </div>
                </div>
              </div>
              </div>

              <!-- Pie de la tarjeta: Rango de fechas -->
              <div class="px-5 pb-5 pt-0 border-t border-gray-100">
                <!-- Rango de fechas -->
                <div class="flex items-center gap-1.5 text-xs text-gray-600">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  <span>{{ formatearRangoMeses(natillera) }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </template>

      <!-- Vista: Como socio -->
      <template v-else-if="vistaActiva === 'socio'">
        <div class="relative bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 rounded-3xl p-8 sm:p-12 border border-orange-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
          <div class="relative z-10">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 mb-6">
              <UserIcon class="w-10 h-10 text-orange-600" />
            </div>
            <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-3">
              Natilleras como socio
            </h3>
            <p class="text-gray-600 mt-2 text-base">
              Esta funcionalidad está en desarrollo. Aquí aparecerán las natilleras donde participas como socio.
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal de confirmación para eliminar natillera -->
    <div v-if="natilleraAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cerrarModalEliminacion"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 overflow-hidden">
        <!-- Animación de fondo sutil durante la eliminación -->
        <div v-if="natillerasStore.loading" class="absolute inset-0 bg-gradient-to-br from-red-50/30 via-red-100/20 to-red-50/30"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="relative w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrashIcon v-if="!natillerasStore.loading" class="w-6 h-6 text-red-600" />
              <!-- Animación de carga moderna -->
              <div v-else class="relative w-6 h-6">
                <div class="absolute inset-0 border-3 border-red-200 rounded-full"></div>
                <div class="absolute inset-0 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">
                {{ natillerasStore.loading ? 'Eliminando Natillera...' : 'Eliminar Natillera' }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ natillerasStore.loading ? 'Por favor espera' : 'Esta acción no se puede deshacer' }}
              </p>
            </div>
          </div>
          
          <!-- Contenido del modal - siempre visible -->
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
            <!-- Indicador sutil de carga durante la eliminación -->
            <div v-if="natillerasStore.loading" class="mt-4 flex items-center gap-2 text-sm text-red-600">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Eliminando natillera, por favor espera...</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button
              @click="cerrarModalEliminacion"
              :disabled="natillerasStore.loading"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              @click="eliminarNatilleraConfirmado"
              :disabled="natillerasStore.loading"
              class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span v-if="!natillerasStore.loading">Sí, Eliminar</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminando...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Animación de carga mientras se verifica el modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="verificandoModal && !eliminandoNatillera" 
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

    <!-- Modal para crear primera natillera -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="mostrarModalCrearNatillera && !verificandoModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Overlay con blur -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          @click="mostrarModalCrearNatillera = false"
        ></div>
        
        <!-- Modal con animación -->
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 overflow-hidden transform transition-all duration-700">
          <!-- Efectos decorativos de fondo -->
          <div class="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div class="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-teal-400/20 to-green-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 animate-pulse" style="animation-delay: 0.5s"></div>
          
          <div class="relative z-10">
            <!-- Mensaje de Bienvenida -->
            <div class="text-center mb-8 animate-fade-in-up">
              <!-- Icono animado -->
              <div class="relative w-20 h-20 mx-auto mb-4">
                <div class="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce">
                  <BanknotesIcon class="w-10 h-10 text-white" />
                </div>
                <!-- Anillos pulsantes -->
                <div class="absolute inset-0 rounded-2xl border-4 border-green-400 animate-ping opacity-75"></div>
                <div class="absolute inset-0 rounded-2xl border-4 border-green-300 animate-ping opacity-50" style="animation-delay: 0.3s"></div>
              </div>
              
              <h2 class="text-2xl font-display font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
                ¡Bienvenido! 👋
              </h2>
              <p class="text-gray-600 text-base leading-relaxed mb-4">
                Estamos emocionados de tenerte aquí.
              </p>
              <p class="text-gray-700 text-base font-medium mb-2">
                Para empezar, crea tu primera natillera.
              </p>
            </div>

            <!-- Explicación breve -->
            <div class="bg-green-50 rounded-xl p-4 mb-6 border border-green-200/50">
              <p class="text-sm text-gray-700 text-center leading-relaxed">
                Una natillera te permite gestionar ahorros grupales de forma organizada, llevar control de cuotas, préstamos y actividades con tu comunidad de manera sencilla y eficiente.
              </p>
            </div>

            <!-- Botones -->
            <div class="flex flex-col gap-3">
              <!-- Botón principal con animación muy visible -->
              <router-link
                :to="esSocioEnAlgunaNatillera ? '/dashboard' : '/natilleras/crear'"
                @click="marcarModalComoMostrado(); mostrarModalCrearNatillera = false"
                class="relative w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-2xl hover:shadow-green-500/50 transform hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 text-lg overflow-hidden group animate-pulse-button"
                style="animation: pulse-glow 2s ease-in-out infinite, scale-bounce 1.5s ease-in-out infinite;"
              >
                <!-- Efecto de brillo animado continuo -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style="animation: shimmer 2s linear infinite;"></div>
                <!-- Anillos de pulso múltiples -->
                <div class="absolute inset-0 rounded-xl bg-green-400 opacity-0 animate-ping-ring" style="animation: ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div class="absolute inset-0 rounded-xl bg-green-300 opacity-0 animate-ping-ring" style="animation: ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s;"></div>
                <!-- Borde brillante animado -->
                <div class="absolute inset-0 rounded-xl border-2 border-white/50 animate-border-pulse" style="animation: border-pulse 1.5s ease-in-out infinite;"></div>
                <!-- Contenido del botón -->
                <div class="relative z-10 flex items-center gap-2 animate-content-bounce" style="animation: content-bounce 2s ease-in-out infinite;">
                  <PlusIcon v-if="!esSocioEnAlgunaNatillera" class="w-6 h-6 animate-spin-slow" style="animation: spin-slow 3s linear infinite;" />
                  <ArrowRightIcon v-else class="w-6 h-6 animate-bounce" style="animation: bounce 1s ease-in-out infinite;" />
                  <span class="font-bold">{{ esSocioEnAlgunaNatillera ? 'Navegar como socio' : 'Crear nueva natillera' }}</span>
                </div>
              </router-link>

              <!-- Botón para crear más tarde -->
              <button
                @click="marcarModalComoMostrado(); mostrarModalCrearNatillera = false"
                class="w-full px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Crear más tarde
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
import { useUsersStore } from '../stores/users'
import { useNotificationStore } from '../stores/notifications'
import { useColaboradoresStore } from '../stores/colaboradores'
import { supabase } from '../lib/supabase'
import { getNatilleraAvatarUrl, getAvatarUrl } from '../utils/avatars'
import { formatDate } from '../utils/formatDate'
import { 
  BanknotesIcon, 
  UsersIcon, 
  UserIcon,
  UserGroupIcon,
  CurrencyDollarIcon, 
  ChartBarIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  TrashIcon,
  Squares2X2Icon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ClockIcon,
  FunnelIcon,
  ChevronUpIcon,
  CalendarIcon
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
const eliminandoNatillera = ref(false) // Flag para rastrear cuando se está eliminando una natillera
const usuarioAutenticado = ref(null)
const procesandoInvitacion = ref(null)
const recaudadoPorNatillera = ref({})
const progresoPorNatillera = ref({})
const mostrarModalCrearNatillera = ref(false)
const natillerasDondeEsSocio = ref([])
const verificandoModal = ref(true) // Estado para la animación de carga
const finalizandoVerificacion = ref(false) // Flag para evitar múltiples ejecuciones
const sociosPorNatillera = ref({}) // Almacenar socios de cada natillera

// Mensajes de carga que rotarán
const mensajesCarga = [
  'Calienta toda la suplencia...',
  'En poco estará todo listo',
  'Cargando datos de natilleras',
  'Ajustando condensador de flujo...',
  'Preparando todo para ti',
  'Cargando natilleras',
  'Abriendo el DRS',
  'Echandole mas agua a la sopa',
  'Poniendo neumaticos blandos',
  'Cargando informacion'
]
const mensajeCargaActual = ref(mensajesCarga[0])
let intervaloMensajeCarga = null

// Mensajes específicos para eliminación de natillera
const mensajesEliminacion = [
  'Eliminando socios asociados...',
  'Borrando cuotas y registros...',
  'Limpiando préstamos y pagos...',
  'Eliminando actividades...',
  'Removiendo historial...',
  'Finalizando eliminación...'
]
const mensajeEliminacionActual = ref(mensajesEliminacion[0])
let intervaloMensajeEliminacion = null

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

// Verificar si el usuario es socio en alguna natillera
async function verificarNatillerasDondeEsSocio() {
  try {
    if (!usuarioAutenticado.value) return
    
    // Buscar el socio asociado al usuario por email
    const { data: socios, error } = await supabase
      .from('socios')
      .select('id')
      .eq('email', usuarioAutenticado.value.email)
      .limit(1)
    
    if (error || !socios || socios.length === 0) {
      natillerasDondeEsSocio.value = []
      return
    }
    
    const socioId = socios[0].id
    
    // Buscar natilleras donde este socio está registrado
    const { data: sociosNatillera, error: errorSN } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('socio_id', socioId)
    
    if (errorSN || !sociosNatillera || sociosNatillera.length === 0) {
      natillerasDondeEsSocio.value = []
      return
    }
    
    natillerasDondeEsSocio.value = sociosNatillera.map(sn => sn.natillera_id)
  } catch (e) {
    console.error('Error verificando natilleras donde es socio:', e)
    natillerasDondeEsSocio.value = []
  }
}

// Verificar si el modal ya fue mostrado antes (solo para usuarios que son socios)
const yaSeMostroModal = () => {
  if (!usuarioAutenticado.value?.id) return false
  const key = `modal_bienvenida_mostrado_${usuarioAutenticado.value.id}`
  return localStorage.getItem(key) === 'true'
}

const marcarModalComoMostrado = () => {
  const key = `modal_bienvenida_mostrado_${usuarioAutenticado.value?.id || 'anon'}`
  localStorage.setItem(key, 'true')
}

// Computed para saber si es socio
const esSocioEnAlgunaNatillera = computed(() => {
  return natillerasDondeEsSocio.value.length > 0
})

// Mostrar modal según las condiciones específicas
const debeMostrarModal = computed(() => {
  // No mostrar si está cargando
  if (natillerasStore.loading) return false
  
  // No mostrar si no hay usuario autenticado aún
  if (!usuarioAutenticado.value) return false
  
  // Verificar si tiene natilleras propias o compartidas
  const tieneNatilleras = todasLasNatilleras.value.length > 0
  const esSocio = esSocioEnAlgunaNatillera.value
  
  // Condición 1: Si NO tiene natilleras (ni propias/compartidas, ni como socio)
  // SIEMPRE mostrar, sin importar localStorage
  if (!tieneNatilleras && !esSocio) {
    return true
  }
  
  // Condición 2: Si tiene natilleras SOLO como socio (no propias ni compartidas)
  // Mostrar solo la primera vez (usar localStorage)
  if (!tieneNatilleras && esSocio) {
    return !yaSeMostroModal()
  }
  
  // Si tiene natilleras propias o compartidas, no mostrar
  return false
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

// Variable para mantener el índice anterior fuera del intervalo
let indiceMensajeAnterior = -1

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

// Variable para mantener el índice anterior de mensajes de eliminación
let indiceMensajeEliminacionAnterior = -1

// Función para iniciar la rotación de mensajes de eliminación
function iniciarRotacionMensajesEliminacion() {
  // Limpiar intervalo anterior si existe
  if (intervaloMensajeEliminacion) {
    clearInterval(intervaloMensajeEliminacion)
    intervaloMensajeEliminacion = null
  }
  
  // Seleccionar un mensaje aleatorio inicial
  indiceMensajeEliminacionAnterior = Math.floor(Math.random() * mensajesEliminacion.length)
  mensajeEliminacionActual.value = mensajesEliminacion[indiceMensajeEliminacionAnterior]
  
  // Cambiar mensaje cada 2 segundos de forma aleatoria
  intervaloMensajeEliminacion = setInterval(() => {
    let nuevoIndice
    // Si hay más de un mensaje, asegurarse de que no se repita el anterior
    if (mensajesEliminacion.length > 1) {
      do {
        nuevoIndice = Math.floor(Math.random() * mensajesEliminacion.length)
      } while (nuevoIndice === indiceMensajeEliminacionAnterior)
    } else {
      nuevoIndice = 0
    }
    
    indiceMensajeEliminacionAnterior = nuevoIndice
    mensajeEliminacionActual.value = mensajesEliminacion[nuevoIndice]
  }, 2000)
}

// Función para detener la rotación de mensajes de eliminación
function detenerRotacionMensajesEliminacion() {
  if (intervaloMensajeEliminacion) {
    clearInterval(intervaloMensajeEliminacion)
    intervaloMensajeEliminacion = null
  }
}

// Función auxiliar para finalizar la verificación y mostrar el modal si corresponde
async function finalizarVerificacionYMostrarModal() {
  // Evitar múltiples ejecuciones simultáneas
  if (finalizandoVerificacion.value || !verificandoModal.value) {
    return
  }
  
  // IMPORTANTE: Verificar que todo esté listo, especialmente que las natilleras hayan terminado de cargar
  if (!usuarioAutenticado.value) {
    return // No hay usuario, no hacer nada
  }
  
  // Verificar explícitamente que las natilleras hayan terminado de cargar
  if (natillerasStore.loading) {
    return // Las natilleras aún están cargando, esperar
  }
  
  // Marcar que estamos finalizando
  finalizandoVerificacion.value = true
  
  try {
    // Asegurar que se haya verificado si es socio
    await verificarNatillerasDondeEsSocio()
    
    // Verificar una vez más que las natilleras terminaron de cargar (por si cambió durante la verificación)
    if (natillerasStore.loading) {
      finalizandoVerificacion.value = false
      return // Si aún está cargando, salir y esperar al watch
    }
    
    // Esperar un momento para que los computed se actualicen
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Verificar una última vez que todo está listo
    if (!natillerasStore.loading && usuarioAutenticado.value) {
      // Detener rotación de mensajes
      detenerRotacionMensajes()
      
      // Desbloquear scroll del body
      desbloquearScroll()
      
      // TODO está listo, ocultar animación de carga
      verificandoModal.value = false
      
      // Pequeño delay antes de mostrar el modal para suavizar la transición
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mostrar el modal si corresponde
      if (debeMostrarModal.value) {
        mostrarModalCrearNatillera.value = true
      }
    }
  } finally {
    finalizandoVerificacion.value = false
  }
}

// Watch para controlar el bloqueo de scroll cuando se muestra/oculta la animación
watch(verificandoModal, (mostrando) => {
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
}, { immediate: true }) // immediate: true para que se ejecute al montar el componente

// Watch para cuando termine de cargar las natilleras - este es el momento principal
watch(() => natillerasStore.loading, async (loading, oldLoading) => {
  // Si las natilleras empiezan a cargar y no está la animación visible, mostrarla
  if (!oldLoading && loading && usuarioAutenticado.value && !verificandoModal.value) {
    verificandoModal.value = true
  }
  
  // Solo actuar cuando cambie de true a false (terminó de cargar) y si aún está verificando
  if (oldLoading && !loading && usuarioAutenticado.value && verificandoModal.value) {
    await finalizarVerificacionYMostrarModal()
  }
})

// Watch de respaldo: si el usuario se autentica después de que terminó la carga
watch(() => usuarioAutenticado.value, async (usuario) => {
  if (usuario && !natillerasStore.loading && verificandoModal.value) {
    await finalizarVerificacionYMostrarModal()
  }
})

// Watch para cuando se verifique si es socio - solo si aún está verificando
watch(esSocioEnAlgunaNatillera, async () => {
  if (usuarioAutenticado.value && !natillerasStore.loading && verificandoModal.value) {
    await finalizarVerificacionYMostrarModal()
  }
})

async function calcularTotalRecaudado() {
  try {
    // OPTIMIZACIÓN: Calcular total recaudado sumando los valores ya calculados por natillera
    // Si ya se calculó el recaudado por natillera, usar esos datos
    // Asegurar que siempre sean arrays antes de usar map
    const natillerasArray = Array.isArray(natillerasStore.natilleras) ? natillerasStore.natilleras : []
    const natillerasCompartidasArray = Array.isArray(natillerasStore.natillerasCompartidas) ? natillerasStore.natillerasCompartidas : []
    
    // Filtrar IDs válidos (no null, no undefined)
    const idsNatilleras = natillerasArray.map(n => n?.id).filter(id => id != null)
    const idsNatillerasCompartidas = natillerasCompartidasArray.map(n => n?.id).filter(id => id != null)
    const todasIds = [...idsNatilleras, ...idsNatillerasCompartidas]
    
    if (todasIds.length === 0) {
      totalRecaudado.value = 0
      return
    }

    // Si ya tenemos los recaudados por natillera calculados, sumarlos
    if (Object.keys(recaudadoPorNatillera.value).length > 0) {
      totalRecaudado.value = todasIds.reduce((sum, id) => {
        return sum + (recaudadoPorNatillera.value[id] || 0)
      }, 0)
      return
    }

    // Si no están calculados aún, hacer la query directamente (caso inicial)
    const natilleraIds = idsNatilleras
    
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

async function calcularRecaudadoYProgresoPorNatillera() {
  try {
    // Asegurar que siempre sean arrays antes de usar map
    const natillerasArray = Array.isArray(natillerasStore.natilleras) ? natillerasStore.natilleras : []
    const natillerasCompartidasArray = Array.isArray(natillerasStore.natillerasCompartidas) ? natillerasStore.natillerasCompartidas : []
    
    // Filtrar IDs válidos (no null, no undefined)
    const idsNatilleras = natillerasArray.map(n => n?.id).filter(id => id != null)
    const idsNatillerasCompartidas = natillerasCompartidasArray.map(n => n?.id).filter(id => id != null)
    const todasIds = [...idsNatilleras, ...idsNatillerasCompartidas]
    
    if (todasIds.length === 0) {
      return
    }

    // Obtener todos los socios_natillera de todas las natilleras en una sola query
    const { data: todosSociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id, natillera_id')
      .in('natillera_id', todasIds)
    
    if (!todosSociosNatillera || todosSociosNatillera.length === 0) {
      // Inicializar todos los valores en 0
      todasIds.forEach(id => {
        recaudadoPorNatillera.value[id] = 0
        progresoPorNatillera.value[id] = 0
      })
      return
    }

    // Agrupar socio_natillera_ids por natillera_id
    const sociosPorNatillera = {}
    todosSociosNatillera.forEach(sn => {
      if (!sociosPorNatillera[sn.natillera_id]) {
        sociosPorNatillera[sn.natillera_id] = []
      }
      sociosPorNatillera[sn.natillera_id].push(sn.id)
    })

    // Obtener todas las cuotas de todas las natilleras en una sola query
    const todosSocioNatilleraIds = todosSociosNatillera.map(sn => sn.id)
    const { data: todasCuotas } = await supabase
      .from('cuotas')
      .select('socio_natillera_id, valor_cuota, valor_pagado')
      .in('socio_natillera_id', todosSocioNatilleraIds)

    // Crear un mapa rápido de socio_natillera_id -> natillera_id
    const mapaSocioNatillera = {}
    todosSociosNatillera.forEach(sn => {
      mapaSocioNatillera[sn.id] = sn.natillera_id
    })

    // Agrupar cuotas por natillera_id
    const cuotasPorNatillera = {}
    todasCuotas?.forEach(cuota => {
      const natilleraId = mapaSocioNatillera[cuota.socio_natillera_id]
      if (!cuotasPorNatillera[natilleraId]) {
        cuotasPorNatillera[natilleraId] = []
      }
      cuotasPorNatillera[natilleraId].push(cuota)
    })

    // Calcular recaudado y progreso para cada natillera (en paralelo con procesamiento local)
    todasIds.forEach(natilleraId => {
      const cuotas = cuotasPorNatillera[natilleraId] || []
      const totalCuota = cuotas.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
      const totalPagado = cuotas.reduce((sum, c) => sum + (c.valor_pagado || 0), 0)
      
      recaudadoPorNatillera.value[natilleraId] = totalPagado
      progresoPorNatillera.value[natilleraId] = totalCuota > 0 ? (totalPagado / totalCuota) * 100 : 0
    })
  } catch (e) {
    console.error('Error calculando recaudado por natillera:', e)
  }
}

function obtenerRecaudadoNatillera(natilleraId) {
  return recaudadoPorNatillera.value[natilleraId] || 0
}

function obtenerProgresoNatillera(natilleraId) {
  return Math.min(100, Math.max(0, progresoPorNatillera.value[natilleraId] || 0))
}

function formatearPeriodicidad(periodicidad) {
  const periodos = {
    quincenal: 'QUINCENAL',
    mensual: 'MENSUAL',
    semanal: 'SEMANAL'
  }
  return periodos[periodicidad?.toLowerCase()] || periodicidad?.toUpperCase() || 'MENSUAL'
}

function obtenerTipoNatillera(natillera) {
  if (natillera.es_propia) return { tipo: 'MÍA', color: 'green' }
  if (natillera.mi_rol) return { tipo: 'COMPARTIDA', color: 'blue' }
  return { tipo: 'SOCIO', color: 'blue' }
}

// Función para obtener las iniciales de un nombre
function obtenerIniciales(nombre) {
  if (!nombre) return '??'
  const palabras = nombre.trim().split(/\s+/)
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

// Función para formatear el rango de meses (Ene 2024 - Dic 2024)
function formatearRangoMeses(natillera) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  const mesInicio = natillera.mes_inicio || 1
  const anioInicio = natillera.anio_inicio || natillera.anio || new Date().getFullYear()
  const mesFin = natillera.mes_fin || 12
  const anioFin = natillera.anio || anioInicio
  
  const mesInicioTexto = meses[mesInicio - 1] || 'Ene'
  const mesFinTexto = meses[mesFin - 1] || 'Dic'
  
  if (anioInicio === anioFin) {
    return `${mesInicioTexto} ${anioInicio} - ${mesFinTexto} ${anioFin}`
  }
  return `${mesInicioTexto} ${anioInicio} - ${mesFinTexto} ${anioFin}`
}

// Función optimizada para cargar socios de TODAS las natilleras en una sola query
async function cargarTodosLosSocios(natilleraIds) {
  try {
    // Asegurar que natilleraIds sea un array
    if (!natilleraIds) {
      console.warn('cargarTodosLosSocios: natilleraIds es null o undefined')
      return
    }
    
    // Convertir a array si no lo es y filtrar valores válidos
    let idsArray = []
    if (Array.isArray(natilleraIds)) {
      // Crear una copia del array y filtrar valores válidos
      idsArray = [...natilleraIds].filter(id => id != null && id !== undefined)
    } else {
      console.warn('cargarTodosLosSocios: natilleraIds no es un array:', typeof natilleraIds, natilleraIds)
      return
    }
    
    // Validación final: asegurar que idsArray es un array válido
    if (!Array.isArray(idsArray)) {
      console.error('cargarTodosLosSocios: idsArray no es un array después del filtrado:', typeof idsArray, idsArray)
      idsArray = [] // Forzar a array vacío
    }
    
    // Validación adicional: verificar que idsArray tiene el método forEach
    if (typeof idsArray.forEach !== 'function') {
      console.error('cargarTodosLosSocios: idsArray no tiene método forEach:', idsArray)
      idsArray = [] // Forzar a array vacío
    }
    
    if (idsArray.length === 0) {
      return
    }
    // OPTIMIZACIÓN: Una sola query para todos los socios de todas las natilleras
    const { data: todosSociosNatillera, error } = await supabase
      .from('socios_natillera')
      .select(`
        id,
        natillera_id,
        socio:socios(id, nombre, avatar_seed, avatar_style)
      `)
      .in('natillera_id', idsArray)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Agrupar socios por natillera_id
    // Validación adicional: asegurar que idsArray sigue siendo un array
    if (!Array.isArray(idsArray)) {
      console.error('cargarTodosLosSocios: idsArray no es un array después de la validación:', typeof idsArray, idsArray)
      return
    }
    
    // Validación adicional: verificar que idsArray tiene el método forEach antes de usarlo
    if (typeof idsArray.forEach !== 'function') {
      console.error('cargarTodosLosSocios: idsArray no tiene método forEach antes de usarlo:', {
        tipo: typeof idsArray,
        esArray: Array.isArray(idsArray),
        valor: idsArray,
        constructor: idsArray?.constructor?.name
      })
      return
    }
    
    const sociosAgrupados = {}
    try {
      idsArray.forEach(id => {
        sociosAgrupados[id] = []
      })
    } catch (forEachError) {
      console.error('cargarTodosLosSocios: Error en forEach:', {
        error: forEachError,
        idsArray: idsArray,
        tipo: typeof idsArray,
        esArray: Array.isArray(idsArray),
        constructor: idsArray?.constructor?.name
      })
      throw forEachError
    }
    
    (todosSociosNatillera || []).forEach(sn => {
      if (sn.natillera_id && sociosAgrupados[sn.natillera_id]) {
        // Solo guardar los primeros 6 por natillera
        if (sociosAgrupados[sn.natillera_id].length < 6) {
          sociosAgrupados[sn.natillera_id].push({
            id: sn.id,
            nombre: sn.socio?.nombre || 'Sin nombre',
            avatar_seed: sn.socio?.avatar_seed,
            avatar_style: sn.socio?.avatar_style || 'adventurer',
            iniciales: obtenerIniciales(sn.socio?.nombre)
          })
        }
      }
    })
    
    // Guardar en caché todos los resultados
    Object.keys(sociosAgrupados).forEach(natilleraId => {
      sociosPorNatillera.value[natilleraId] = sociosAgrupados[natilleraId]
    })
  } catch (e) {
    console.error('Error cargando socios de natilleras:', e)
  }
}

// Función para obtener socios de una natillera (usa caché si está disponible)
async function obtenerSociosNatillera(natilleraId) {
  // Si ya tenemos los socios en caché, retornarlos
  if (sociosPorNatillera.value[natilleraId]) {
    return sociosPorNatillera.value[natilleraId]
  }
  
  // Si no están en caché, cargar solo para esta natillera (fallback)
  try {
    const { data: sociosNatillera, error } = await supabase
      .from('socios_natillera')
      .select(`
        id,
        socio:socios(id, nombre, avatar_seed, avatar_style)
      `)
      .eq('natillera_id', natilleraId)
      .limit(6)
    
    if (error) throw error
    
    const socios = (sociosNatillera || []).map(sn => ({
      id: sn.id,
      nombre: sn.socio?.nombre || 'Sin nombre',
      avatar_seed: sn.socio?.avatar_seed,
      avatar_style: sn.socio?.avatar_style || 'adventurer',
      iniciales: obtenerIniciales(sn.socio?.nombre)
    }))
    
    // Guardar en caché
    sociosPorNatillera.value[natilleraId] = socios
    return socios
  } catch (e) {
    console.error('Error obteniendo socios de natillera:', e)
    return []
  }
}

// Función para obtener el color de fondo de avatar según índice
function obtenerColorAvatar(index) {
  const colores = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ]
  return colores[index % colores.length]
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
  eliminandoNatillera.value = false // Asegurar que el flag esté en false al abrir el modal
}

function cerrarModalEliminacion() {
  natilleraAEliminar.value = null
  eliminandoNatillera.value = false
  detenerRotacionMensajesEliminacion()
}

async function eliminarNatilleraConfirmado() {
  if (!natilleraAEliminar.value) return

  // Marcar que se está eliminando para mostrar la pantalla de carga específica
  eliminandoNatillera.value = true
  // Iniciar rotación de mensajes de eliminación
  iniciarRotacionMensajesEliminacion()
  
  try {
    const resultado = await natillerasStore.eliminarNatillera(natilleraAEliminar.value.id)
    
    if (resultado.success) {
      cerrarModalEliminacion()
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
  } finally {
    // Siempre resetear el flag y detener rotación, incluso si hay error
    eliminandoNatillera.value = false
    detenerRotacionMensajesEliminacion()
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

// Función auxiliar para inicializar el componente
async function inicializarComponente() {
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user
  
  if (!user) {
    verificandoModal.value = false
    return
  }
  
  // Si las natilleras están cargando, mostrar la animación de carga
  if (natillerasStore.loading) {
    verificandoModal.value = true
  }
  
  // OPTIMIZACIÓN CRÍTICA: Cargar SOLO datos esenciales primero - natilleras son lo más importante
  // Datos no críticos (perfil, invitaciones) se cargan DESPUÉS de mostrar la UI
  await natillerasStore.fetchTodasLasNatilleras()
  
  // Si después de cargar las natilleras aún están cargando, mantener la animación
  if (natillerasStore.loading) {
    verificandoModal.value = true
  }
  
  // OPTIMIZACIÓN: Calcular recaudado por natillera primero, luego usar esos datos para el total
  // Asegurar que siempre sean arrays antes de usar map
  const natillerasArray = Array.isArray(natillerasStore.natilleras) ? natillerasStore.natilleras : []
  const natillerasCompartidasArray = Array.isArray(natillerasStore.natillerasCompartidas) ? natillerasStore.natillerasCompartidas : []
  
  // Filtrar IDs válidos (no null, no undefined)
  const idsNatilleras = natillerasArray.map(n => n?.id).filter(id => id != null)
  const idsNatillerasCompartidas = natillerasCompartidasArray.map(n => n?.id).filter(id => id != null)
  const todasIds = [...idsNatilleras, ...idsNatillerasCompartidas]
  
  // Validación final: asegurar que todasIds es un array válido antes de pasarlo
  if (!Array.isArray(todasIds)) {
    console.error('inicializarComponente: todasIds no es un array:', typeof todasIds, todasIds)
    // Forzar a array vacío si no es un array
    const todasIdsArray = []
    await Promise.all([
      calcularRecaudadoYProgresoPorNatillera(),
      cargarTodosLosSocios(todasIdsArray)
    ])
  } else {
    // OPTIMIZACIÓN: Calcular recaudado y cargar TODOS los socios en paralelo (una sola query para socios)
    await Promise.all([
      calcularRecaudadoYProgresoPorNatillera(),
      cargarTodosLosSocios(todasIds)
    ])
  }
  
  // Calcular total recaudado usando los datos ya calculados (evita query duplicada)
  calcularTotalRecaudado()
  
  // IMPORTANTE: Ocultar animación de carga ANTES de cargar datos no críticos
  // para que el usuario vea la UI lo antes posible
  if (!natillerasStore.loading && verificandoModal.value) {
    await finalizarVerificacionYMostrarModal()
  }
  
  // OPTIMIZACIÓN: Cargar datos no críticos DESPUÉS de mostrar la UI (carga diferida)
  // Esto mejora significativamente la percepción de velocidad
  Promise.all([
    usersStore.getCurrentUserProfile(),
    colaboradoresStore.fetchMisInvitaciones()
  ]).catch(err => console.error('Error cargando datos secundarios:', err))
}

onMounted(async () => {
  // Activar animación de carga al inicio
  verificandoModal.value = true
  await inicializarComponente()
})

// Limpiar intervalos cuando el componente se desmonte
onBeforeUnmount(() => {
  detenerRotacionMensajes()
  detenerRotacionMensajesEliminacion()
  desbloquearScroll()
})

// Cuando el usuario regresa a esta ruta (desde otra página)
onActivated(async () => {
  // Si las natilleras están cargando al regresar, mostrar la animación
  if (natillerasStore.loading && !verificandoModal.value) {
    verificandoModal.value = true
  }
  
  // Si no hay usuario autenticado o las natilleras ya están cargadas, no hacer nada
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (!natillerasStore.loading && !verificandoModal.value)) {
    return
  }
  
  // Si las natilleras necesitan recargarse o están cargando, inicializar
  if (natillerasStore.loading || todasLasNatilleras.value.length === 0) {
    await inicializarComponente()
  }
})
</script>

<style scoped>
/* Animación de pulso y brillo */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.3);
  }
}

/* Animación de escala continua */
@keyframes scale-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Animación de brillo deslizante */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
  }
}

/* Animación de anillos de pulso */
@keyframes ping-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Animación de borde pulsante */
@keyframes border-pulse {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
  }
}

/* Animación de contenido que rebota suavemente */
@keyframes content-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Animación de rotación lenta del icono */
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Clase para la animación de shimmer */
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

/* Clase para la animación de ping ring */
.animate-ping-ring {
  animation: ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Clase para la animación de border pulse */
.animate-border-pulse {
  animation: border-pulse 1.5s ease-in-out infinite;
}

/* Clase para la animación de contenido */
.animate-content-bounce {
  animation: content-bounce 2s ease-in-out infinite;
}

/* Clase para la animación de spin slow */
.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* Clase para el botón con pulso y brillo */
.animate-pulse-button {
  animation: pulse-glow 2s ease-in-out infinite, scale-bounce 1.5s ease-in-out infinite;
}

/* Animación de rotación suave */
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

/* Animación de barra de progreso */
@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress {
  animation: progress 1.5s ease-in-out infinite;
}

/* Animación de rotación reversa */
.animate-spin-reverse {
  animation: spin-smooth 0.8s linear infinite reverse;
}

/* Animación de brillo pulsante para el centro */
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

/* Animaciones de partículas flotantes */
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

/* Animación de fade in-out para el texto */
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

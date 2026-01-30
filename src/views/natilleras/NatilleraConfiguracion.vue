<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header unificado -->
    <div class="relative">
      <Breadcrumbs />
      <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
        <div class="flex items-center gap-3">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cog6ToothIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Configuración</h1>
            <p class="text-gray-500 mt-0.5 text-sm">Configura el período, días de gracia y mensajes para esta natillera</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Opciones de configuración con contenido expandible -->
    <div class="space-y-4">
      
      <!-- === INFORMACIÓN BÁSICA === -->
      <div class="space-y-3">
      <button
        @click="seccionActiva = seccionActiva === 'basica' ? null : 'basica'"
        :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
          seccionActiva === 'basica'
              ? 'bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-500 border-natillera-400 shadow-natillera-500/30'
              : 'bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/40 border-natillera-100/50 shadow-natillera-500/10 hover:border-natillera-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'basica' ? 'bg-white/20' : 'bg-gradient-to-br from-natillera-500 to-emerald-500']">
              <CurrencyDollarIcon class="w-6 h-6 text-white" />
          </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'basica' ? 'text-white' : 'text-gray-800']">
            Información Básica
          </h3>
              <p :class="['text-sm', seccionActiva === 'basica' ? 'text-white/80' : 'text-gray-500']">
                Nombre, periodicidad y configuraciones iniciales
          </p>
          </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'basica' ? 'bg-white/20' : 'bg-natillera-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'basica' ? 'text-white rotate-180' : 'text-natillera-600']" />
          </div>
        </div>
      </button>

        <!-- Contenido Información Básica -->
    <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'basica'" class="relative overflow-hidden bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/40 rounded-2xl shadow-xl shadow-natillera-500/10 border-2 border-natillera-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-natillera-500 to-emerald-500"></div>
            <div class="relative p-5 sm:p-6 space-y-4">
              <!-- Nombre -->
              <div>
                <label class="label font-semibold text-gray-700">Nombre de la Natillera *</label>
                <input 
                  v-model="configBasica.nombre"
                  type="text"
                  class="input-field"
                  placeholder="Ej: Natillera Familiar 2024"
                  required
                />
              </div>

              <!-- Descripción -->
              <div>
                <label class="label font-semibold text-gray-700">Descripción</label>
                <textarea 
                  v-model="configBasica.descripcion"
                  class="input-field min-h-[100px]"
                  placeholder="Descripción opcional de la natillera..."
                ></textarea>
              </div>

              <!-- Periodicidad -->
              <div>
                <label class="label font-semibold text-gray-700">Periodicidad *</label>
                <select v-model="configBasica.periodicidad" class="input-field">
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
                <p class="text-xs text-gray-500 mt-2">
                  Frecuencia con la que se generan las cuotas.
                </p>
              </div>

              <!-- Fecha de Inicio -->
              <div>
                <label class="label font-semibold text-gray-700">Fecha de Inicio *</label>
                <input 
                  v-model="configBasica.fecha_inicio"
                  type="date"
                  class="input-field"
                  required
                />
                <p class="text-xs text-gray-500 mt-2">
                  Fecha en que inició o iniciará la natillera.
                </p>
              </div>

              <!-- Generación automática de cuotas -->
              <div class="p-4 bg-gradient-to-br from-emerald-50/80 to-green-50/80 rounded-xl border border-emerald-200/50">
                <div class="flex items-start gap-3 sm:gap-4">
                  <!-- Switch mejorado para móvil -->
                  <button 
                    type="button"
                    @click="configCuotasAuto.activo = !configCuotasAuto.activo"
                    :class="[
                      'relative flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2',
                      configCuotasAuto.activo 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30' 
                        : 'bg-gray-300'
                    ]"
                  >
                    <span 
                      :class="[
                        'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center',
                        configCuotasAuto.activo ? 'left-[22px]' : 'left-0.5'
                      ]"
                    >
                      <svg v-if="configCuotasAuto.activo" class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <svg v-else class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </span>
                  </button>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <SparklesIcon class="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span class="font-semibold text-gray-800 text-sm sm:text-base">Generación automática de cuotas</span>
                    </div>
                    <p class="text-xs text-gray-600 leading-relaxed">
                      Al activar esta opción, cuando agregues un nuevo socio se generarán automáticamente todas las cuotas del período de la natillera.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Sección de Cierre de Natillera -->
              <div class="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50/80 to-purple-50/60 rounded-2xl border-2 border-purple-200/50 shadow-lg p-5 sm:p-6 mt-6">
                <!-- Efectos decorativos -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-indigo-300/15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-300/15 to-purple-300/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div class="relative z-10">
                  <!-- Header -->
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <CurrencyDollarIcon class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-lg font-display font-bold text-gray-800">
                        Cierre de Natillera
                      </h3>
                      <p class="text-xs text-gray-600">
                        Configura cómo se repartirán las utilidades al cerrar
                      </p>
                    </div>
                  </div>

                  <!-- Configuración de Utilidades de Actividades -->
                  <div class="mb-6">
                    <label class="label font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CalendarDaysIcon class="w-4 h-4 text-purple-600" />
                      Utilidades de Actividades
                    </label>
                    <p class="text-xs text-gray-500 mb-3">
                      Selecciona si quieres configurar todas las actividades igual o cada una por separado
                    </p>
                    
                    <!-- Selector de modo -->
                    <div class="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-700">Modo de configuración</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          @click="configCierre.modoActividades = 'general'"
                          :class="[
                            'relative p-3 rounded-lg border-2 transition-all duration-200 text-center',
                            configCierre.modoActividades === 'general'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center justify-center gap-2">
                            <UsersIcon 
                              class="w-4 h-4 flex-shrink-0" 
                              :class="configCierre.modoActividades === 'general' ? 'text-purple-600' : 'text-gray-400'" 
                            />
                            <span 
                              :class="[
                                'font-semibold text-sm',
                                configCierre.modoActividades === 'general' ? 'text-purple-700' : 'text-gray-600'
                              ]"
                            >
                              General
                            </span>
                            <div 
                              v-if="configCierre.modoActividades === 'general'"
                              class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                          <p class="text-[10px] text-gray-500 mt-1">Igual para todas</p>
                        </button>
                        <button
                          type="button"
                          @click="configCierre.modoActividades = 'individual'"
                          :class="[
                            'relative p-3 rounded-lg border-2 transition-all duration-200 text-center',
                            configCierre.modoActividades === 'individual'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center justify-center gap-2">
                            <ChartBarIcon 
                              class="w-4 h-4 flex-shrink-0" 
                              :class="configCierre.modoActividades === 'individual' ? 'text-purple-600' : 'text-gray-400'" 
                            />
                            <span 
                              :class="[
                                'font-semibold text-sm',
                                configCierre.modoActividades === 'individual' ? 'text-purple-700' : 'text-gray-600'
                              ]"
                            >
                              Individual
                            </span>
                            <div 
                              v-if="configCierre.modoActividades === 'individual'"
                              class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                          <p class="text-[10px] text-gray-500 mt-1">Una por una</p>
                        </button>
                      </div>
                    </div>

                    <!-- Configuración General -->
                    <div v-if="configCierre.modoActividades === 'general'" class="space-y-3">
                      <p class="text-xs text-gray-500 mb-3">
                        Esta configuración aplicará a todas las actividades (Rifas, Bingos, Ventas, Eventos, Otros)
                      </p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          @click="configCierre.actividades.general = 'equitativa'"
                          :class="[
                            'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                            configCierre.actividades.general === 'equitativa'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-200'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center gap-3 mb-2">
                            <div 
                              :class="[
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                configCierre.actividades.general === 'equitativa'
                                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30'
                                  : 'bg-gray-100 border-2 border-gray-200'
                              ]"
                            >
                              <UsersIcon class="w-5 h-5" :class="configCierre.actividades.general === 'equitativa' ? 'text-white' : 'text-gray-400'" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <span 
                                :class="[
                                  'font-bold text-sm block',
                                  configCierre.actividades.general === 'equitativa' ? 'text-purple-700' : 'text-gray-700'
                                ]"
                              >
                                Equitativa
                              </span>
                            </div>
                            <div 
                              v-if="configCierre.actividades.general === 'equitativa'"
                              class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                          <p 
                            :class="[
                              'text-xs',
                              configCierre.actividades.general === 'equitativa' ? 'text-purple-600' : 'text-gray-500'
                            ]"
                          >
                            Las utilidades se reparten a partes iguales entre todos los socios
                          </p>
                        </button>
                        <button
                          type="button"
                          @click="configCierre.actividades.general = 'proporcional'"
                          :class="[
                            'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                            configCierre.actividades.general === 'proporcional'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-200'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center gap-3 mb-2">
                            <div 
                              :class="[
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                configCierre.actividades.general === 'proporcional'
                                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30'
                                  : 'bg-gray-100 border-2 border-gray-200'
                              ]"
                            >
                              <ChartBarIcon class="w-5 h-5" :class="configCierre.actividades.general === 'proporcional' ? 'text-white' : 'text-gray-400'" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <span 
                                :class="[
                                  'font-bold text-sm block',
                                  configCierre.actividades.general === 'proporcional' ? 'text-purple-700' : 'text-gray-700'
                                ]"
                              >
                                Proporcional
                              </span>
                            </div>
                            <div 
                              v-if="configCierre.actividades.general === 'proporcional'"
                              class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          </div>
                          <p 
                            :class="[
                              'text-xs',
                              configCierre.actividades.general === 'proporcional' ? 'text-purple-600' : 'text-gray-500'
                            ]"
                          >
                            Las utilidades se reparten según lo ahorrado por cada socio
                          </p>
                        </button>
                      </div>
                    </div>

                    <!-- Configuración Individual -->
                    <div v-else class="space-y-4">
                      <p class="text-xs text-gray-500 mb-3">
                        Configura cómo se repartirán las utilidades para cada tipo de actividad
                      </p>
                      <div
                        v-for="tipo in tiposActividades"
                        :key="tipo.valor"
                        class="relative overflow-hidden bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-all"
                      >
                        <div class="flex items-center justify-between mb-3">
                          <div>
                            <h4 class="font-semibold text-gray-800 text-sm">{{ tipo.label }}</h4>
                            <p class="text-xs text-gray-500 mt-0.5">{{ tipo.descripcion }}</p>
                          </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            @click="configCierre.actividades[tipo.valor] = 'equitativa'"
                            :class="[
                              'relative p-3 rounded-lg border-2 transition-all duration-200 text-left',
                              configCierre.actividades[tipo.valor] === 'equitativa'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                                : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-white'
                            ]"
                          >
                            <div class="flex items-center gap-2 mb-1">
                              <UsersIcon 
                                class="w-4 h-4 flex-shrink-0" 
                                :class="configCierre.actividades[tipo.valor] === 'equitativa' ? 'text-purple-600' : 'text-gray-400'" 
                              />
                              <span 
                                :class="[
                                  'font-semibold text-xs',
                                  configCierre.actividades[tipo.valor] === 'equitativa' ? 'text-purple-700' : 'text-gray-600'
                                ]"
                              >
                                Equitativa
                              </span>
                              <div 
                                v-if="configCierre.actividades[tipo.valor] === 'equitativa'"
                                class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                              >
                                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            </div>
                            <p class="text-[10px] text-gray-500">A partes iguales</p>
                          </button>
                          <button
                            type="button"
                            @click="configCierre.actividades[tipo.valor] = 'proporcional'"
                            :class="[
                              'relative p-3 rounded-lg border-2 transition-all duration-200 text-left',
                              configCierre.actividades[tipo.valor] === 'proporcional'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                                : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-white'
                            ]"
                          >
                            <div class="flex items-center gap-2 mb-1">
                              <ChartBarIcon 
                                class="w-4 h-4 flex-shrink-0" 
                                :class="configCierre.actividades[tipo.valor] === 'proporcional' ? 'text-purple-600' : 'text-gray-400'" 
                              />
                              <span 
                                :class="[
                                  'font-semibold text-xs',
                                  configCierre.actividades[tipo.valor] === 'proporcional' ? 'text-purple-700' : 'text-gray-600'
                                ]"
                              >
                                Proporcional
                              </span>
                              <div 
                                v-if="configCierre.actividades[tipo.valor] === 'proporcional'"
                                class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                              >
                                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            </div>
                            <p class="text-[10px] text-gray-500">Según lo ahorrado</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Configuración de Utilidades de Préstamos -->
                  <div>
                    <label class="label font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BanknotesIcon class="w-4 h-4 text-amber-600" />
                      Utilidades de Préstamos
                    </label>
                    <p class="text-xs text-gray-500 mb-3">
                      Selecciona cómo se repartirán los intereses generados por los préstamos
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        @click="configCierre.prestamos = 'equitativa'"
                        :class="[
                          'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                          configCierre.prestamos === 'equitativa'
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-500/20 ring-2 ring-amber-200'
                            : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-gray-50'
                        ]"
                      >
                        <div class="flex items-center gap-3 mb-2">
                          <div 
                            :class="[
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                              configCierre.prestamos === 'equitativa'
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30'
                                : 'bg-gray-100 border-2 border-gray-200'
                            ]"
                          >
                            <UsersIcon class="w-5 h-5" :class="configCierre.prestamos === 'equitativa' ? 'text-white' : 'text-gray-400'" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <span 
                              :class="[
                                'font-bold text-sm block',
                                configCierre.prestamos === 'equitativa' ? 'text-amber-700' : 'text-gray-700'
                              ]"
                            >
                              Equitativa
                            </span>
                          </div>
                          <div 
                            v-if="configCierre.prestamos === 'equitativa'"
                            class="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0"
                          >
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                        <p 
                          :class="[
                            'text-xs',
                            configCierre.prestamos === 'equitativa' ? 'text-amber-600' : 'text-gray-500'
                          ]"
                        >
                          Los intereses se reparten a partes iguales entre todos los socios
                        </p>
                      </button>
                      <button
                        type="button"
                        @click="configCierre.prestamos = 'proporcional'"
                        :class="[
                          'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                          configCierre.prestamos === 'proporcional'
                            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-500/20 ring-2 ring-amber-200'
                            : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-gray-50'
                        ]"
                      >
                        <div class="flex items-center gap-3 mb-2">
                          <div 
                            :class="[
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                              configCierre.prestamos === 'proporcional'
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30'
                                : 'bg-gray-100 border-2 border-gray-200'
                            ]"
                          >
                            <ChartBarIcon class="w-5 h-5" :class="configCierre.prestamos === 'proporcional' ? 'text-white' : 'text-gray-400'" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <span 
                              :class="[
                                'font-bold text-sm block',
                                configCierre.prestamos === 'proporcional' ? 'text-amber-700' : 'text-gray-700'
                              ]"
                            >
                              Proporcional
                            </span>
                          </div>
                          <div 
                            v-if="configCierre.prestamos === 'proporcional'"
                            class="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0"
                          >
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                        <p 
                          :class="[
                            'text-xs',
                            configCierre.prestamos === 'proporcional' ? 'text-amber-600' : 'text-gray-500'
                          ]"
                        >
                          Los intereses se reparten según lo ahorrado por cada socio
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4 border-t border-natillera-200 mt-4">
          <button 
            @click="guardarConfigBasica"
                  :disabled="guardandoBasica || esVisor"
                  class="btn-primary text-sm bg-gradient-to-r from-natillera-500 to-emerald-600"
          >
                  {{ guardandoBasica ? 'Guardando...' : 'Guardar Información' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>
      </div>

      <!-- === MENSAJES === -->
      <div class="space-y-3">
      <button
        @click="seccionActiva = seccionActiva === 'mensajes' ? null : 'mensajes'"
        :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
          seccionActiva === 'mensajes'
              ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 border-green-400 shadow-green-500/30'
              : 'bg-gradient-to-br from-white via-green-50/30 to-emerald-50/40 border-green-100/50 shadow-green-500/10 hover:border-green-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'mensajes' ? 'bg-white/20' : 'bg-gradient-to-br from-green-500 to-emerald-500']">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-white" />
          </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'mensajes' ? 'text-white' : 'text-gray-800']">
            Mensajes
          </h3>
              <p :class="['text-sm', seccionActiva === 'mensajes' ? 'text-white/80' : 'text-gray-500']">
                Personaliza los mensajes de WhatsApp
          </p>
          </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'mensajes' ? 'bg-white/20' : 'bg-green-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'mensajes' ? 'text-white rotate-180' : 'text-green-600']" />
          </div>
        </div>
      </button>

        <!-- Contenido Mensajes -->
    <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'mensajes'" class="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/40 rounded-2xl shadow-xl shadow-green-500/10 border-2 border-green-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500"></div>
            <div class="relative p-5 sm:p-6">
              <!-- Tabs para tipos de mensajes - Destacado -->
              <div class="mb-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-lg p-4">
                <div class="mb-2">
                  <h3 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Tipo de Mensaje
                  </h3>
                  <p class="text-xs text-gray-500 mt-0.5">Selecciona el tipo de mensaje que deseas configurar</p>
                </div>
                <div class="flex gap-2 overflow-x-auto pb-1">
                  <button
                    @click="tipoMensajeActivo = 'individual'"
                    :class="[
                      'px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap rounded-lg shadow-sm border-2 flex items-center gap-2',
                      tipoMensajeActivo === 'individual'
                        ? 'border-green-500 text-green-700 bg-green-50 shadow-md scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <UserIcon class="w-5 h-5" />
                    <span>Individual</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'general'"
                    :class="[
                      'px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap rounded-lg shadow-sm border-2 flex items-center gap-2',
                      tipoMensajeActivo === 'general'
                        ? 'border-purple-500 text-purple-700 bg-purple-50 shadow-md scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <UsersIcon class="w-5 h-5" />
                    <span>General</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'mora'"
                    :class="[
                      'px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap rounded-lg shadow-sm border-2 flex items-center gap-2',
                      tipoMensajeActivo === 'mora'
                        ? 'border-red-500 text-red-700 bg-red-50 shadow-md scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <ExclamationTriangleIcon class="w-5 h-5" />
                    <span>En Mora</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'pendiente'"
                    :class="[
                      'px-5 py-3 text-sm font-semibold transition-all whitespace-nowrap rounded-lg shadow-sm border-2 flex items-center gap-2',
                      tipoMensajeActivo === 'pendiente'
                        ? 'border-amber-500 text-amber-700 bg-amber-50 shadow-md scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <ClockIcon class="w-5 h-5" />
                    <span>Pendiente</span>
                  </button>
                </div>
              </div>

              <!-- Contenido según tab activo -->
              <div class="space-y-4">
                <!-- Mensaje Individual -->
                <div v-if="tipoMensajeActivo === 'individual'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje enviado a cada socio individualmente.
                  </p>
                  
                  <!-- Variables disponibles para Individual -->
                  <div class="p-3 bg-green-50/50 rounded-lg border border-green-200">
                    <h5 class="text-xs font-semibold text-green-700 mb-2">Variables Disponibles</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        type="button"
                        @click="insertarVariable('nombre')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-blue-600 font-semibold">{{nombre}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Nombre del socio</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </button>
                      <button 
                        type="button"
                        @click="insertarVariable('monto')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{monto}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Monto de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref="textareaIndividual"
                    v-model="mensajeIndividual"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje individual..."
                  ></textarea>
                  <div class="p-3 bg-green-50/50 border border-green-200 rounded-lg">
                    <p class="text-xs font-semibold text-green-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewIndividual }}</p>
                  </div>
                </div>

                <!-- Mensaje General -->
                <div v-if="tipoMensajeActivo === 'general'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje que se puede enviar a todos los socios a la vez. No usa variables personalizadas.
                  </p>
                  <textarea
                    v-model="mensajeGeneral"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje general..."
                  ></textarea>
                  <div class="p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
                    <p class="text-xs font-semibold text-purple-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ mensajeGeneral }}</p>
                  </div>
                </div>

                <!-- Mensaje Cuota en Mora -->
                <div v-if="tipoMensajeActivo === 'mora'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje que se envía cuando una cuota está en mora.
                  </p>
                  
                  <!-- Variables disponibles para Cuota en Mora -->
                  <div class="p-3 bg-red-50/50 rounded-lg border border-red-200">
                    <h5 class="text-xs font-semibold text-red-700 mb-2">Variables Disponibles</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        @click="insertarVariableCuota('nombre', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-blue-600 font-semibold">{{nombre}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Nombre del socio</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('mes', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{mes}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Mes de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('anio', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{anio}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Año de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('valor_cuota', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{valor_cuota}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Valor de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('sancion', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-orange-600 font-semibold">{{sancion}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Sanción aplicada</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('total', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-purple-600 font-semibold">{{total}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Total a pagar (cuota + sanción)</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('fecha_vencimiento', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-gray-600 font-semibold">{{fecha_vencimiento}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Fecha de vencimiento</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('dias_mora', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-red-600 font-semibold">{{dias_mora}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Días en mora</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref="textareaCuotaMora"
                    v-model="mensajeCuotaMora"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje para cuota en mora..."
                  ></textarea>
                  <div class="p-3 bg-red-50/50 border border-red-200 rounded-lg">
                    <p class="text-xs font-semibold text-red-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewCuotaMora }}</p>
                  </div>
                </div>

                <!-- Mensaje Cuota Pendiente -->
                <div v-if="tipoMensajeActivo === 'pendiente'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje que se envía cuando una cuota está pendiente.
                  </p>
                  
                  <!-- Variables disponibles para Cuota Pendiente -->
                  <div class="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <h5 class="text-xs font-semibold text-amber-700 mb-2">Variables Disponibles</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        @click="insertarVariableCuota('nombre', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-blue-600 font-semibold">{{nombre}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Nombre del socio</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('mes', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{mes}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Mes de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('anio', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{anio}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Año de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('valor_cuota', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{valor_cuota}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Valor de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('total', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-purple-600 font-semibold">{{total}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Total a pagar</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('fecha_vencimiento', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-gray-600 font-semibold">{{fecha_vencimiento}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Fecha de vencimiento</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref="textareaCuotaPendiente"
                    v-model="mensajeCuotaPendiente"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje para cuota pendiente..."
                  ></textarea>
                  <div class="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <p class="text-xs font-semibold text-amber-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewCuotaPendiente }}</p>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-green-200">
                <button @click="restaurarDefectoMensajes" :disabled="esVisor" class="btn-secondary text-sm">
            <ArrowPathIcon class="w-4 h-4" />
                  Restaurar
          </button>
          <button 
            @click="guardarMensajes"
            :disabled="guardandoMensajes || esVisor"
                  class="btn-primary flex-1 sm:flex-none text-sm bg-gradient-to-r from-green-500 to-emerald-600"
          >
            {{ guardandoMensajes ? 'Guardando...' : 'Guardar Mensajes' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>
      </div>

      <!-- === PERÍODO === -->
      <div class="space-y-3">
      <button
        @click="seccionActiva = seccionActiva === 'periodo' ? null : 'periodo'"
        :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
          seccionActiva === 'periodo'
              ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 border-blue-400 shadow-blue-500/30'
              : 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 border-blue-100/50 shadow-blue-500/10 hover:border-blue-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'periodo' ? 'bg-white/20' : 'bg-gradient-to-br from-blue-500 to-indigo-500']">
              <CalendarDaysIcon class="w-6 h-6 text-white" />
          </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'periodo' ? 'text-white' : 'text-gray-800']">
            Período
          </h3>
              <p :class="['text-sm', seccionActiva === 'periodo' ? 'text-white/80' : 'text-gray-500']">
                Define el período de cuotas
            </p>
          </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'periodo' ? 'bg-white/20' : 'bg-blue-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'periodo' ? 'text-white rotate-180' : 'text-blue-600']" />
          </div>
        </div>
      </button>

        <!-- Contenido Período -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'periodo'" class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl shadow-xl shadow-blue-500/10 border-2 border-blue-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
            <div class="relative p-5 sm:p-6">
        <!-- Información sobre el período -->
        <div class="mb-4 p-4 bg-blue-50/80 border border-blue-200/50 rounded-xl">
          <p class="text-sm text-blue-700 flex items-start gap-2">
            <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Puedes configurar un período que cruce de un año a otro. Por ejemplo: <strong>Diciembre 2025</strong> a <strong>Noviembre 2026</strong>.</span>
          </p>
        </div>

        <!-- Mes y Año de Inicio -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            Inicio del Período
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label font-semibold text-gray-700">Mes de Inicio *</label>
              <select v-model.number="configPeriodo.mes_inicio" class="input-field">
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
              </select>
            </div>
            <div>
              <label class="label font-semibold text-gray-700">Año de Inicio *</label>
              <select v-model.number="configPeriodo.anio_inicio" class="input-field">
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mes y Año de Fin -->
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
            Fin del Período
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label font-semibold text-gray-700">Mes de Fin *</label>
              <select v-model.number="configPeriodo.mes_fin" class="input-field">
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
              </select>
            </div>
            <div>
              <label class="label font-semibold text-gray-700">Año de Fin *</label>
              <select v-model.number="configPeriodo.anio" class="input-field">
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Resumen del período -->
        <div class="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <p class="text-sm text-gray-700 flex items-center gap-2">
            <span class="text-xl">📅</span>
            <span>
              <strong class="text-blue-800">{{ meses.find(m => m.value === configPeriodo.mes_inicio)?.label }} {{ configPeriodo.anio_inicio }}</strong>
              <span class="text-gray-500 mx-2">→</span>
              <strong class="text-indigo-800">{{ meses.find(m => m.value === configPeriodo.mes_fin)?.label }} {{ configPeriodo.anio }}</strong>
              <span class="text-xs text-gray-500 ml-2 bg-white/60 px-2 py-0.5 rounded-full">
                {{ cantidadMesesPeriodo }} {{ cantidadMesesPeriodo === 1 ? 'mes' : 'meses' }}
              </span>
            </span>
          </p>
        </div>

        <!-- Nota sobre período que cruza años -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0 -translate-y-2"
          enter-to-class="opacity-100 max-h-20 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-20 translate-y-0"
          leave-to-class="opacity-0 max-h-0 -translate-y-2"
        >
          <div v-if="configPeriodo.anio_inicio !== configPeriodo.anio" class="mt-3 p-3 bg-amber-50/80 border border-amber-200/50 rounded-xl">
            <p class="text-xs text-amber-700 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>Este período cruza de un año a otro. Ideal para natilleras que inician en diciembre y terminan el año siguiente.</span>
            </p>
          </div>
        </Transition>

              <div class="flex justify-end pt-4 border-t border-blue-200 mt-4">
          <button 
            @click="guardarConfigPeriodo"
                  :disabled="guardandoPeriodo || esVisor"
                  class="btn-primary text-sm bg-gradient-to-r from-blue-500 to-indigo-600"
          >
                  {{ guardandoPeriodo ? 'Guardando...' : 'Guardar Período' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>
      </div>

      <!-- === DÍAS DE GRACIA === -->
      <div class="space-y-3">
      <button
        @click="seccionActiva = seccionActiva === 'diasGracia' ? null : 'diasGracia'"
        :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
          seccionActiva === 'diasGracia'
              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 border-amber-400 shadow-amber-500/30'
              : 'bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 border-amber-100/50 shadow-amber-500/10 hover:border-amber-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'diasGracia' ? 'bg-white/20' : 'bg-gradient-to-br from-amber-500 to-orange-500']">
              <ClockIcon class="w-6 h-6 text-white" />
          </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'diasGracia' ? 'text-white' : 'text-gray-800']">
              Días de Gracia
          </h3>
              <p :class="['text-sm', seccionActiva === 'diasGracia' ? 'text-white/80' : 'text-gray-500']">
                Tiempo extra antes de mora
            </p>
          </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'diasGracia' ? 'bg-white/20' : 'bg-amber-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'diasGracia' ? 'text-white rotate-180' : 'text-amber-600']" />
          </div>
        </div>
      </button>

        <!-- Contenido Días de Gracia -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'diasGracia'" class="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 rounded-2xl shadow-xl shadow-amber-500/10 border-2 border-amber-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
            <div class="relative p-5 sm:p-6">
        <div>
          <label class="label font-semibold text-gray-700">Días de Gracia *</label>
          <input 
            v-model.number="configDiasGracia.dias_gracia" 
            type="number" 
                  class="input-field w-32"
            min="0"
            max="30"
          />
          <p class="text-xs text-gray-500 mt-2">
                  Días después de la fecha límite antes de considerar una cuota en mora.
          </p>
        </div>

              <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p class="text-sm text-gray-700">
                  ⏰ Las cuotas tendrán <strong>{{ configDiasGracia.dias_gracia }}</strong> día(s) de gracia.
          </p>
        </div>

              <div class="flex justify-end pt-4 border-t border-amber-200 mt-4">
                <button 
                  @click="guardarConfigDiasGracia"
                  :disabled="guardandoDiasGracia || esVisor"
                  class="btn-primary text-sm bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  {{ guardandoDiasGracia ? 'Guardando...' : 'Guardar Días de Gracia' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- === SANCIONES === -->
      <div class="space-y-3">
        <button 
          @click="seccionActiva = seccionActiva === 'sanciones' ? null : 'sanciones'"
          :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
            seccionActiva === 'sanciones'
              ? 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 border-red-400 shadow-red-500/30'
              : 'bg-gradient-to-br from-white via-red-50/30 to-rose-50/40 border-red-100/50 shadow-red-500/10 hover:border-red-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'sanciones' ? 'bg-white/20' : 'bg-gradient-to-br from-red-500 to-rose-500']">
              <ExclamationTriangleIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'sanciones' ? 'text-white' : 'text-gray-800']">
                Sanciones por Mora
              </h3>
              <p :class="['text-sm', seccionActiva === 'sanciones' ? 'text-white/80' : 'text-gray-500']">
                Multas e intereses por mora
              </p>
            </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'sanciones' ? 'bg-white/20' : 'bg-red-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'sanciones' ? 'text-white rotate-180' : 'text-red-600']" />
            </div>
          </div>
        </button>

        <!-- Contenido Sanciones -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'sanciones'" class="relative overflow-hidden bg-gradient-to-br from-white via-red-50/30 to-rose-50/40 rounded-2xl shadow-xl shadow-red-500/10 border-2 border-red-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-rose-500"></div>
            <div class="relative p-5 sm:p-6">
              <!-- Activar/Desactivar -->
              <div class="mb-5">
                <label class="flex items-center gap-3 cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="configSanciones.activa" class="sr-only peer" />
                    <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </div>
                  <span class="font-semibold text-gray-700">Activar sanciones por mora</span>
                </label>
              </div>

              <div v-if="configSanciones.activa" class="space-y-5">
                <!-- Tipo de sanción -->
                <div>
                  <label class="label font-semibold text-gray-700 mb-3 block">Tipo de Sanción</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      @click="configSanciones.tipo = 'simple'"
                      :class="['p-3 rounded-xl border-2 text-left transition-all', configSanciones.tipo === 'simple' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300']"
                    >
                      <CurrencyDollarIcon class="w-5 h-5 mb-1" :class="configSanciones.tipo === 'simple' ? 'text-red-500' : 'text-gray-400'" />
                      <p class="font-semibold text-sm text-gray-800">Simple</p>
                      <p class="text-xs text-gray-500">Valor fijo</p>
                    </button>
                    <button 
                      type="button"
                      @click="configSanciones.tipo = 'escalonada'"
                      :class="['p-3 rounded-xl border-2 text-left transition-all', configSanciones.tipo === 'escalonada' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300']"
                    >
                      <ChartBarIcon class="w-5 h-5 mb-1" :class="configSanciones.tipo === 'escalonada' ? 'text-red-500' : 'text-gray-400'" />
                      <p class="font-semibold text-sm text-gray-800">Escalonada</p>
                      <p class="text-xs text-gray-500">Progresiva</p>
                    </button>
                  </div>
                </div>

                <!-- Simple -->
                <div v-if="configSanciones.tipo === 'simple'" class="p-4 bg-white rounded-xl border border-gray-200">
                  <label class="label font-semibold text-gray-700">Valor de multa por mora</label>
                  <div class="relative mt-2">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <input 
                      :value="formatNumberWithSeparators(configSanciones.valorFijo)"
                      @input="(e) => {
                        const rawValue = removeNumberFormat(e.target.value)
                        configSanciones.valorFijo = rawValue ? parseInt(rawValue) || 0 : 0
                      }"
                      @focus="(e) => e.target.select()"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9.,]*"
                      class="input-field pl-8 w-full sm:w-48 font-semibold" 
                      placeholder="0"
                    />
                  </div>
                </div>

                <!-- Escalonada -->
                <div v-if="configSanciones.tipo === 'escalonada'" class="space-y-4">
                  <!-- Tabla niveles -->
                  <div class="p-4 bg-white rounded-xl border border-gray-200">
                    <label class="label font-semibold text-gray-700 mb-3 block">Intereses por cuotas vencidas</label>
                    <div class="space-y-2">
                      <div v-for="(nivel, index) in configSanciones.niveles" :key="index" class="flex items-center gap-3">
                        <span class="text-sm text-gray-600 w-20 font-medium">{{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}</span>
                        <div class="relative flex-1 max-w-[140px]">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
                          <input 
                            :value="formatNumberWithSeparators(nivel.valor)"
                            @input="(e) => {
                              const rawValue = removeNumberFormat(e.target.value)
                              nivel.valor = rawValue ? parseInt(rawValue) || 0 : 0
                            }"
                            @focus="(e) => e.target.select()"
                            type="text"
                            inputmode="numeric"
                            pattern="[0-9.,]*"
                            min="0"
                            class="input-field pl-7 py-1.5 text-sm font-semibold" 
                            placeholder="0"
                          />
                        </div>
                        <button v-if="configSanciones.niveles.length > 1" @click="eliminarNivel(index)" class="text-red-500 hover:text-red-700 p-1 transition-colors">
                          <XMarkIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button v-if="configSanciones.niveles.length < 10" @click="agregarNivel" class="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors">
                      <PlusIcon class="w-4 h-4" /> Agregar nivel
                    </button>
                  </div>

                  <!-- Intereses adicionales -->
                  <div class="p-4 sm:p-5 bg-white rounded-xl border-2 transition-all duration-200" 
                       :class="configSanciones.interesesAdicionales.activo ? 'border-red-300 bg-red-50/30 shadow-md' : 'border-gray-200 hover:border-gray-300'" 
                       @click.stop>
                    <label class="flex items-center gap-3 sm:gap-4 cursor-pointer mb-3 py-2 -mx-1 px-1 rounded-lg hover:bg-white/50 transition-colors" 
                           @click.stop.prevent="toggleInteresesAdicionales">
                      <div class="relative flex-shrink-0">
                        <input 
                          type="checkbox" 
                          :checked="configSanciones.interesesAdicionales.activo" 
                          @click.stop.prevent="toggleInteresesAdicionales" 
                          class="sr-only peer" 
                        />
                        <div class="w-11 h-6 sm:w-12 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] sm:after:top-[3px] sm:after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                      </div>
                      <span class="font-semibold text-gray-700 text-sm sm:text-base flex-1 select-none">
                        Intereses adicionales por días
                      </span>
                    </label>
                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-2"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-2"
                    >
                      <div v-if="configSanciones.interesesAdicionales.activo" class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 text-sm sm:text-base">
                          <span class="text-gray-600 font-medium whitespace-nowrap">Cada</span>
                          <input 
                            v-model.number="configSanciones.interesesAdicionales.dias" 
                            type="number" 
                            min="1" 
                            max="30" 
                            class="input-field w-20 sm:w-16 py-2 sm:py-1.5 text-center font-semibold border-2 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                          />
                          <span class="text-gray-600 font-medium whitespace-nowrap">días, sumar</span>
                          <div class="relative flex-1 sm:flex-initial">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
                            <input 
                              :value="formatNumberWithSeparators(configSanciones.interesesAdicionales.valor)"
                              @input="(e) => {
                                const rawValue = removeNumberFormat(e.target.value)
                                configSanciones.interesesAdicionales.valor = rawValue ? parseInt(rawValue) || 0 : 0
                              }"
                              @focus="(e) => e.target.select()"
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9.,]*"
                              class="input-field w-full sm:w-32 py-2 sm:py-1.5 pl-8 font-semibold border-2 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </div>

                  <!-- Devolución -->
                  <div class="p-4 sm:p-5 bg-white rounded-xl border-2 transition-all duration-200" 
                       :class="configSanciones.devolucion.activo ? 'border-red-300 bg-red-50/30 shadow-md' : 'border-gray-200 hover:border-gray-300'" 
                       @click.stop>
                    <label class="flex items-center gap-3 sm:gap-4 cursor-pointer mb-3 py-2 -mx-1 px-1 rounded-lg hover:bg-white/50 transition-colors" 
                           @click.stop.prevent="toggleDevolucion">
                      <div class="relative flex-shrink-0">
                        <input 
                          type="checkbox" 
                          :checked="configSanciones.devolucion.activo" 
                          @click.stop.prevent="toggleDevolucion" 
                          class="sr-only peer" 
                        />
                        <div class="w-11 h-6 sm:w-12 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] sm:after:top-[3px] sm:after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                      </div>
                      <span class="font-semibold text-gray-700 text-sm sm:text-base flex-1 select-none">
                        Devolución por mora excesiva
                      </span>
                    </label>
                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-2"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-2"
                    >
                      <div v-if="configSanciones.devolucion.activo" class="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 text-sm sm:text-base flex-wrap">
                          <span class="text-gray-600 font-medium whitespace-nowrap">Después de</span>
                          <input 
                            v-model.number="configSanciones.devolucion.cuotasLimite" 
                            type="number" 
                            min="1" 
                            max="12" 
                            class="input-field w-20 sm:w-16 py-2 sm:py-1.5 text-center font-semibold border-2 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                          />
                          <span class="text-gray-600 font-medium whitespace-nowrap">cuotas, multa del</span>
                          <input 
                            v-model.number="configSanciones.devolucion.porcentajeMulta" 
                            type="number" 
                            min="0" 
                            max="100" 
                            class="input-field w-20 sm:w-16 py-2 sm:py-1.5 text-center font-semibold border-2 focus:border-red-400 focus:ring-2 focus:ring-red-200" 
                          />
                          <span class="text-gray-600 font-medium">%</span>
                        </div>
                        <label class="flex items-center gap-3 sm:gap-4 cursor-pointer py-2 -mx-1 px-1 rounded-lg hover:bg-white/50 transition-colors" 
                               @click.stop.prevent="toggleSinUtilidades">
                          <div class="relative flex-shrink-0">
                            <input 
                              type="checkbox" 
                              :checked="configSanciones.devolucion.sinUtilidades" 
                              @click.stop.prevent="toggleSinUtilidades" 
                              class="sr-only peer" 
                            />
                            <div class="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] sm:after:top-[3px] sm:after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                          </div>
                          <span class="text-sm sm:text-base text-gray-700 font-medium select-none">
                            Devolución sin utilidades
                          </span>
                        </label>
                      </div>
                    </Transition>
                  </div>
                </div>

                <!-- Resumen -->
                <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p class="text-xs font-semibold text-red-700 mb-2">📋 Resumen</p>
                  <div v-if="configSanciones.tipo === 'simple'" class="text-sm text-gray-700">
                    Multa fija: <strong>${{ formatMoney(configSanciones.valorFijo) }}</strong>
                  </div>
                  <div v-else class="text-sm text-gray-700 space-y-1">
                    <p v-for="nivel in configSanciones.niveles" :key="nivel.cuotas">
                      {{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}: <strong>${{ formatMoney(nivel.valor) }}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end pt-4 border-t border-red-200 mt-4">
                <button 
                  @click="guardarConfigSanciones"
                  :disabled="guardandoSanciones || esVisor"
                  class="btn-primary text-sm bg-gradient-to-r from-red-500 to-rose-600"
                >
                  {{ guardandoSanciones ? 'Guardando...' : 'Guardar Sanciones' }}
        </button>
      </div>
      </div>
      </div>
    </Transition>
      </div>

      <!-- === REASIGNAR NATILLERA (Solo Superusuario) === -->
      <div v-if="esSuperUsuario" class="space-y-3">
        <button
          @click="seccionActiva = seccionActiva === 'reasignar' ? null : 'reasignar'"
          :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
            seccionActiva === 'reasignar'
              ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 border-purple-400 shadow-purple-500/30'
              : 'bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/40 border-purple-100/50 shadow-purple-500/10 hover:border-purple-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'reasignar' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-indigo-500']">
              <UserIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'reasignar' ? 'text-white' : 'text-gray-800']">
                Reasignar Administrador
              </h3>
              <p :class="['text-sm', seccionActiva === 'reasignar' ? 'text-white/80' : 'text-gray-500']">
                Cambiar el administrador de esta natillera
              </p>
            </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'reasignar' ? 'bg-white/20' : 'bg-purple-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'reasignar' ? 'text-white rotate-180' : 'text-purple-600']" />
            </div>
          </div>
        </button>

        <!-- Contenido Reasignar -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'reasignar'" class="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/40 rounded-2xl shadow-xl shadow-purple-500/10 border-2 border-purple-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
            <div class="relative p-5 sm:p-6">
              <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-2">Administrador Actual</h4>
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p class="text-sm text-gray-600 mb-1">Email:</p>
                  <p class="font-semibold text-gray-800">{{ adminActual?.email || 'Cargando...' }}</p>
                  <p v-if="adminActual?.nombre" class="text-sm text-gray-500 mt-1">{{ adminActual.nombre }}</p>
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar Nuevo Administrador
                </label>
                <div class="relative">
                  <input
                    v-model="busquedaUsuario"
                    type="text"
                    placeholder="Buscar usuario por email o nombre (o ver todos los usuarios abajo)..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    @input="buscarUsuarios"
                  />
                  <MagnifyingGlassIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <!-- Lista de usuarios -->
                <div v-if="buscandoUsuarios && !usuariosCargados" class="mt-4 text-center py-8">
                  <div class="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p class="text-sm text-gray-500">Cargando usuarios...</p>
                </div>

                <div v-else-if="usuariosEncontrados.length > 0" class="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                  <div class="p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <p class="text-xs text-gray-600 font-semibold">
                      {{ usuariosEncontrados.length }} {{ usuariosEncontrados.length === 1 ? 'usuario encontrado' : 'usuarios encontrados' }}
                    </p>
                  </div>
                  <button
                    v-for="usuario in usuariosEncontrados"
                    :key="usuario.id"
                    @click="seleccionarUsuario(usuario)"
                    :class="[
                      'w-full p-4 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0',
                      usuarioSeleccionado?.id === usuario.id ? 'bg-purple-100 border-purple-300' : ''
                    ]"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
                        {{ (usuario.nombre || usuario.email || 'U').charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1">
                        <p class="font-semibold text-gray-800">{{ usuario.nombre || 'Sin nombre' }}</p>
                        <p class="text-sm text-gray-500">{{ usuario.email }}</p>
                      </div>
                      <CheckCircleIcon v-if="usuarioSeleccionado?.id === usuario.id" class="w-6 h-6 text-purple-600" />
                    </div>
                  </button>
                </div>

                <div v-else-if="usuariosCargados && usuariosEncontrados.length === 0" class="mt-4 text-center py-8 text-gray-500">
                  <p class="text-sm">No se encontraron usuarios con ese criterio de búsqueda</p>
                  <button
                    @click="busquedaUsuario = ''; filtrarUsuarios()"
                    class="mt-2 text-sm text-purple-600 hover:text-purple-700 underline"
                  >
                    Ver todos los usuarios
                  </button>
                </div>
              </div>

              <div v-if="usuarioSeleccionado" class="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <p class="text-sm font-semibold text-purple-700 mb-2">Nuevo Administrador Seleccionado:</p>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                    {{ (usuarioSeleccionado.nombre || usuarioSeleccionado.email || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">{{ usuarioSeleccionado.nombre || 'Sin nombre' }}</p>
                    <p class="text-sm text-gray-600">{{ usuarioSeleccionado.email }}</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="cancelarReasignacion"
                  class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmarReasignacion"
                  :disabled="!usuarioSeleccionado || guardandoReasignacion"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ guardandoReasignacion ? 'Reasignando...' : 'Reasignar Natillera' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- === COLABORADORES === -->
      <div class="space-y-3">
        <button
          @click="seccionActiva = seccionActiva === 'colaboradores' ? null : 'colaboradores'"
          :class="[
            'w-full relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300',
            seccionActiva === 'colaboradores'
              ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 border-blue-400 shadow-blue-500/30'
              : 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 border-blue-100/50 shadow-blue-500/10 hover:border-blue-300 hover:shadow-xl'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shadow-md', seccionActiva === 'colaboradores' ? 'bg-white/20' : 'bg-gradient-to-br from-blue-500 to-indigo-500']">
              <UserGroupIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 text-left">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'colaboradores' ? 'text-white' : 'text-gray-800']">
                Colaboradores
              </h3>
              <p :class="['text-sm', seccionActiva === 'colaboradores' ? 'text-white/80' : 'text-gray-500']">
                Gestiona quién puede acceder a esta natillera
              </p>
            </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center', seccionActiva === 'colaboradores' ? 'bg-white/20' : 'bg-blue-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'colaboradores' ? 'text-white rotate-180' : 'text-blue-600']" />
            </div>
          </div>
        </button>

        <!-- Contenido Colaboradores -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'colaboradores'" class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl shadow-xl shadow-blue-500/10 border-2 border-blue-200/50 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
            <div class="relative p-5 sm:p-6">
              <ColaboradoresManager
                :natillera-id="id"
                :admin-id="natillera?.admin_id"
                :admin-email="adminActual?.email || ''"
                :admin-nombre="adminActual?.nombre || adminActual?.email || ''"
                :es-admin="esAdmin"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Mensaje de éxito/error -->
    <div v-if="mensaje" :class="[
      'p-3 rounded-xl text-sm flex items-center gap-2',
      mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    ]">
      <component :is="mensaje.tipo === 'exito' ? CheckCircleIcon : ExclamationCircleIcon" class="w-5 h-5" />
      {{ mensaje.texto }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useUsersStore } from '../../stores/users'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { supabase } from '../../lib/supabase'
import ColaboradoresManager from '../../components/ColaboradoresManager.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  UsersIcon,
  UserGroupIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const natillerasStore = useNatillerasStore()
const configStore = useConfiguracionStore()
const usersStore = useUsersStore()
const colaboradoresStore = useColaboradoresStore()
const guardandoBasica = ref(false)
const guardandoPeriodo = ref(false)
const guardandoDiasGracia = ref(false)
const guardandoMensajes = ref(false)
const guardandoSanciones = ref(false)
const guardandoReasignacion = ref(false)
const mensaje = ref(null)
const textareaIndividual = ref(null)
const seccionActiva = ref(null) // 'basica', 'mensajes', 'periodo', 'diasGracia', 'sanciones', 'reasignar' o null
const tipoMensajeActivo = ref('individual') // 'individual', 'general', 'mora', 'pendiente'
const esVisor = ref(false)

// Reasignación
const usuarioAutenticado = ref(null)
const busquedaUsuario = ref('')
const todosLosUsuarios = ref([]) // Lista completa de usuarios
const usuariosEncontrados = ref([]) // Usuarios filtrados
const usuarioSeleccionado = ref(null)
const adminActual = ref(null)
const buscandoUsuarios = ref(false)
const usuariosCargados = ref(false) // Flag para saber si ya se cargaron los usuarios

// Mensajes
const mensajeIndividual = ref('')
const mensajeGeneral = ref('')
const mensajeCuotaMora = ref('')
const mensajeCuotaPendiente = ref('')
const textareaCuotaMora = ref(null)
const textareaCuotaPendiente = ref(null)

const id = computed(() => route.params.id)
const natillera = computed(() => natillerasStore.natilleraActual)

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
async function verificarRolVisor() {
  try {
    if (!id.value) return
    
    const rol = await colaboradoresStore.obtenerMiRol(id.value)
    
    // Verificar si es visor y tiene permiso de configurar
    if (rol === 'visor') {
      const tienePermisoConfigurar = await colaboradoresStore.tienePermiso(id.value, 'configurar')
      esVisor.value = tienePermisoConfigurar
    } else {
      esVisor.value = false
    }
  } catch (e) {
    console.error('Error verificando rol visor:', e)
    esVisor.value = false
  }
}

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

// Configuración básica
const configBasica = ref({
  nombre: '',
  descripcion: '',
  periodicidad: 'mensual',
  fecha_inicio: new Date().toISOString().split('T')[0]
})

// Configuración de cierre
const configCierre = ref({
  modoActividades: 'general', // 'general' o 'individual'
  actividades: {
    general: 'equitativa', // Solo se usa cuando modoActividades es 'general'
    rifa: 'equitativa',
    bingo: 'equitativa',
    venta: 'equitativa',
    evento: 'equitativa',
    otro: 'equitativa'
  },
  prestamos: 'equitativa' // 'equitativa' o 'proporcional'
})

// Tipos de actividades disponibles
const tiposActividades = [
  { valor: 'rifa', label: '🎟️ Rifas', descripcion: 'Utilidades generadas por rifas' },
  { valor: 'bingo', label: '🎱 Bingos', descripcion: 'Utilidades generadas por bingos' },
  { valor: 'venta', label: '🛒 Ventas', descripcion: 'Utilidades generadas por ventas' },
  { valor: 'evento', label: '🎉 Eventos', descripcion: 'Utilidades generadas por eventos' },
  { valor: 'otro', label: '📋 Otros', descripcion: 'Utilidades de otras actividades' }
]

// Generar lista de años (desde 2 años atrás hasta 5 años adelante)
const anioActual = new Date().getFullYear()
const aniosDisponibles = computed(() => {
  const anios = []
  for (let i = anioActual - 2; i <= anioActual + 5; i++) {
    anios.push(i)
  }
  return anios
})

// Configuración de período
const anioActualDefault = new Date().getFullYear()
const configPeriodo = ref({
  mes_inicio: 1,
  anio_inicio: anioActualDefault,
  mes_fin: 11,
  anio: anioActualDefault
})

// Calcular el número de meses del período
const cantidadMesesPeriodo = computed(() => {
  if (configPeriodo.value.anio_inicio === configPeriodo.value.anio) {
    // Mismo año
    return configPeriodo.value.mes_fin >= configPeriodo.value.mes_inicio 
      ? configPeriodo.value.mes_fin - configPeriodo.value.mes_inicio + 1 
      : 12 - configPeriodo.value.mes_inicio + configPeriodo.value.mes_fin + 1
  } else if (configPeriodo.value.anio > configPeriodo.value.anio_inicio) {
    // Período cruza años
    const mesesPrimerAnio = 12 - configPeriodo.value.mes_inicio + 1
    const mesesSegundoAnio = configPeriodo.value.mes_fin
    const aniosIntermedios = (configPeriodo.value.anio - configPeriodo.value.anio_inicio - 1) * 12
    return mesesPrimerAnio + mesesSegundoAnio + aniosIntermedios
  }
  return 0
})

// Configuración de días de gracia
const configDiasGracia = ref({
  dias_gracia: 3
})

// Configuración de cuotas automáticas
const configCuotasAuto = ref({
  activo: true
})

// Configuración de sanciones por mora
const configSanciones = ref({
  activa: false,
  tipo: 'simple', // 'simple' o 'escalonada'
  valorFijo: 5000, // Para tipo simple
  niveles: [ // Para tipo escalonada
    { cuotas: 1, valor: 4000 },
    { cuotas: 2, valor: 4500 },
    { cuotas: 3, valor: 5000 },
    { cuotas: 4, valor: 6000 }
  ],
  interesesAdicionales: {
    activo: false,
    dias: 2,
    valor: 500
  },
  devolucion: {
    activo: false,
    cuotasLimite: 5,
    porcentajeMulta: 25,
    sinUtilidades: true
  }
})

// Formatear dinero
function formatMoney(value) {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('es-CO').format(value)
}

// Formatear número con separadores de miles
function formatNumberWithSeparators(value) {
  if (!value && value !== 0) return ''
  return new Intl.NumberFormat('es-CO').format(value)
}

// Remover formato de número (quitar puntos y comas)
function removeNumberFormat(value) {
  if (!value) return ''
  return String(value).replace(/\./g, '').replace(/,/g, '')
}

// Agregar nivel de sanción
function agregarNivel() {
  const ultimoNivel = configSanciones.value.niveles[configSanciones.value.niveles.length - 1]
  configSanciones.value.niveles.push({
    cuotas: ultimoNivel.cuotas + 1,
    valor: ultimoNivel.valor + 500
  })
}

// Eliminar nivel de sanción
function eliminarNivel(index) {
  if (configSanciones.value.niveles.length > 1) {
    configSanciones.value.niveles.splice(index, 1)
  }
}

// Métodos para actualizar checkboxes preservando el tipo
function toggleInteresesAdicionales() {
  const tipoActual = configSanciones.value.tipo
  configSanciones.value.interesesAdicionales.activo = !configSanciones.value.interesesAdicionales.activo
  // Preservar el tipo explícitamente
  configSanciones.value.tipo = tipoActual
}

function toggleDevolucion() {
  const tipoActual = configSanciones.value.tipo
  configSanciones.value.devolucion.activo = !configSanciones.value.devolucion.activo
  // Preservar el tipo explícitamente
  configSanciones.value.tipo = tipoActual
}

function toggleSinUtilidades() {
  const tipoActual = configSanciones.value.tipo
  configSanciones.value.devolucion.sinUtilidades = !configSanciones.value.devolucion.sinUtilidades
  // Preservar el tipo explícitamente
  configSanciones.value.tipo = tipoActual
}

async function guardarConfigBasica() {
  guardandoBasica.value = true
  mensaje.value = null
  
  // Validaciones
  if (!configBasica.value.nombre || configBasica.value.nombre.trim() === '') {
    mensaje.value = {
      tipo: 'error',
      texto: 'El nombre de la natillera es requerido'
    }
    guardandoBasica.value = false
    setTimeout(() => { mensaje.value = null }, 5000)
    return
  }

  if (!configBasica.value.fecha_inicio) {
    mensaje.value = {
      tipo: 'error',
      texto: 'La fecha de inicio es requerida'
    }
    guardandoBasica.value = false
    setTimeout(() => { mensaje.value = null }, 5000)
    return
  }
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    nombre: configBasica.value.nombre.trim(),
    descripcion: configBasica.value.descripcion?.trim() || null,
    periodicidad: configBasica.value.periodicidad,
    fecha_inicio: configBasica.value.fecha_inicio,
    cuotas_automaticas: configCuotasAuto.value.activo,
    config_cierre: {
      modoActividades: configCierre.value.modoActividades,
      actividades: configCierre.value.actividades,
      prestamos: configCierre.value.prestamos
    }
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Información básica guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      configBasica.value = {
        nombre: natillera.value.nombre || '',
        descripcion: natillera.value.descripcion || '',
        periodicidad: natillera.value.periodicidad || 'mensual',
        fecha_inicio: natillera.value.fecha_inicio || new Date().toISOString().split('T')[0]
      }
      configCuotasAuto.value = {
        activo: natillera.value.cuotas_automaticas !== false
      }
      // Cargar configuración de cierre
      const configCierreActual = natillera.value.config_cierre || {}
      const actividadesConfig = configCierreActual.actividades || {}
      const modoActividades = configCierreActual.modoActividades || 'general'
      
      // Si viene en formato antiguo (sin modoActividades), determinar el modo
      let modo = modoActividades
      if (!configCierreActual.modoActividades && actividadesConfig.general) {
        modo = 'general'
      } else if (!configCierreActual.modoActividades && (actividadesConfig.rifa || actividadesConfig.bingo)) {
        modo = 'individual'
      }
      
      configCierre.value = {
        modoActividades: modo,
        actividades: modo === 'general' 
          ? {
              general: actividadesConfig.general || 'equitativa',
              rifa: actividadesConfig.rifa || 'equitativa',
              bingo: actividadesConfig.bingo || 'equitativa',
              venta: actividadesConfig.venta || 'equitativa',
              evento: actividadesConfig.evento || 'equitativa',
              otro: actividadesConfig.otro || 'equitativa'
            }
          : {
              general: actividadesConfig.general || 'equitativa',
              rifa: actividadesConfig.rifa || 'equitativa',
              bingo: actividadesConfig.bingo || 'equitativa',
              venta: actividadesConfig.venta || 'equitativa',
              evento: actividadesConfig.evento || 'equitativa',
              otro: actividadesConfig.otro || 'equitativa'
            },
        prestamos: configCierreActual.prestamos || 'equitativa'
      }
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la información básica'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoBasica.value = false
}

async function guardarConfigPeriodo() {
  guardandoPeriodo.value = true
  mensaje.value = null
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    mes_inicio: configPeriodo.value.mes_inicio,
    anio_inicio: configPeriodo.value.anio_inicio,
    mes_fin: configPeriodo.value.mes_fin,
    anio: configPeriodo.value.anio
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de período guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      configPeriodo.value = {
        mes_inicio: natillera.value.mes_inicio || 1,
        anio_inicio: natillera.value.anio_inicio || natillera.value.anio || new Date().getFullYear(),
        mes_fin: natillera.value.mes_fin || 11,
        anio: natillera.value.anio || new Date().getFullYear()
      }
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de período'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoPeriodo.value = false
}

async function guardarConfigDiasGracia() {
  guardandoDiasGracia.value = true
  mensaje.value = null
  
  // Obtener las reglas de multas actuales
  const reglasMultasActuales = natillera.value?.reglas_multas || { activa: false }
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    reglas_multas: {
      ...reglasMultasActuales,
      dias_gracia: configDiasGracia.value.dias_gracia
    }
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de días de gracia guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      const reglasMultas = natillera.value.reglas_multas || {}
      configDiasGracia.value = {
        dias_gracia: reglasMultas.dias_gracia || 3
      }
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de días de gracia'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoDiasGracia.value = false
}


async function guardarConfigSanciones() {
  guardandoSanciones.value = true
  mensaje.value = null
  
  // Obtener las reglas de multas actuales
  const reglasMultasActuales = natillera.value?.reglas_multas || {}
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    reglas_multas: {
      ...reglasMultasActuales,
      sanciones: {
        activa: configSanciones.value.activa,
        tipo: configSanciones.value.tipo,
        valorFijo: configSanciones.value.valorFijo,
        niveles: configSanciones.value.niveles,
        interesesAdicionales: configSanciones.value.interesesAdicionales,
        devolucion: configSanciones.value.devolucion
      }
    }
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de sanciones guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de sanciones'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoSanciones.value = false
}

// Vista previa del mensaje individual con datos de ejemplo
const vistaPreviewIndividual = computed(() => {
  return mensajeIndividual.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{monto\}\}/g, '50.000')
})

// Vista previa del mensaje de cuota en mora
const vistaPreviewCuotaMora = computed(() => {
  return mensajeCuotaMora.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{mes\}\}/g, 'Diciembre')
    .replace(/\{\{anio\}\}/g, '2024')
    .replace(/\{\{valor_cuota\}\}/g, '50.000')
    .replace(/\{\{sancion\}\}/g, '5.000')
    .replace(/\{\{total\}\}/g, '55.000')
    .replace(/\{\{fecha_vencimiento\}\}/g, '15/12/2024')
    .replace(/\{\{dias_mora\}\}/g, '10')
})

// Vista previa del mensaje de cuota pendiente
const vistaPreviewCuotaPendiente = computed(() => {
  return mensajeCuotaPendiente.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{mes\}\}/g, 'Diciembre')
    .replace(/\{\{anio\}\}/g, '2024')
    .replace(/\{\{valor_cuota\}\}/g, '50.000')
    .replace(/\{\{total\}\}/g, '50.000')
    .replace(/\{\{fecha_vencimiento\}\}/g, '15/12/2024')
})

function insertarVariable(variable) {
  const textarea = textareaIndividual.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = mensajeIndividual.value
  const variableText = `{{${variable}}}`
  
  mensajeIndividual.value = text.substring(0, start) + variableText + text.substring(end)
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

function insertarVariableCuota(variable, tipo) {
  let textarea
  let texto
  
  if (tipo === 'mensajeCuotaMora') {
    textarea = textareaCuotaMora.value
    texto = mensajeCuotaMora.value
  } else if (tipo === 'mensajeCuotaPendiente') {
    textarea = textareaCuotaPendiente.value
    texto = mensajeCuotaPendiente.value
  }
  
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const variableText = `{{${variable}}}`
  
  const nuevoTexto = texto.substring(0, start) + variableText + texto.substring(end)
  
  if (tipo === 'mensajeCuotaMora') {
    mensajeCuotaMora.value = nuevoTexto
  } else if (tipo === 'mensajeCuotaPendiente') {
    mensajeCuotaPendiente.value = nuevoTexto
  }
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

// Función para insertar variable según el tipo de mensaje activo
function insertarVariableEnActivo(variable) {
  if (tipoMensajeActivo.value === 'individual') {
    insertarVariable(variable)
  } else if (tipoMensajeActivo.value === 'mora') {
    insertarVariableCuota(variable, 'mensajeCuotaMora')
  } else if (tipoMensajeActivo.value === 'pendiente') {
    insertarVariableCuota(variable, 'mensajeCuotaPendiente')
  }
  // 'general' no usa variables, así que no hace nada
}

async function guardarMensajes() {
  guardandoMensajes.value = true
  mensaje.value = null
  
  // Guardar en el store de configuración
  configStore.mensajeIndividual = mensajeIndividual.value
  configStore.mensajeGeneral = mensajeGeneral.value
  configStore.mensajeCuotaMora = mensajeCuotaMora.value
  configStore.mensajeCuotaPendiente = mensajeCuotaPendiente.value
  
  const result = await configStore.guardarConfiguracion()
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: result.message || 'Mensajes guardados correctamente'
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar los mensajes'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoMensajes.value = false
}

function restaurarDefectoMensajes() {
  if (confirm('¿Estás seguro de restaurar los mensajes a sus valores por defecto?')) {
    configStore.restaurarValoresPorDefecto()
    mensajeIndividual.value = configStore.mensajeIndividual
    mensajeGeneral.value = configStore.mensajeGeneral
    mensajeCuotaMora.value = configStore.mensajeCuotaMora
    mensajeCuotaPendiente.value = configStore.mensajeCuotaPendiente
    mensaje.value = {
      tipo: 'exito',
      texto: 'Valores restaurados. No olvides guardar los cambios.'
    }
  }
}

// Función para actualizar los valores locales desde la natillera
function actualizarValoresDesdeNatillera() {
  if (natillera.value) {
    configBasica.value = {
      nombre: natillera.value.nombre || '',
      descripcion: natillera.value.descripcion || '',
      periodicidad: natillera.value.periodicidad || 'mensual',
      fecha_inicio: natillera.value.fecha_inicio || new Date().toISOString().split('T')[0]
    }
    
    // Para anio_inicio: usar el valor guardado, o si no existe, usar el anio como fallback
    const anioInicio = natillera.value.anio_inicio || natillera.value.anio || new Date().getFullYear()
    
    configPeriodo.value = {
      mes_inicio: natillera.value.mes_inicio || 1,
      anio_inicio: anioInicio,
      mes_fin: natillera.value.mes_fin || 11,
      anio: natillera.value.anio || new Date().getFullYear()
    }
    
    const reglasMultas = natillera.value.reglas_multas || {}
    configDiasGracia.value = {
      dias_gracia: reglasMultas.dias_gracia || 3
    }
    
    // Cargar configuración de cuotas automáticas
    configCuotasAuto.value = {
      activo: natillera.value.cuotas_automaticas !== false // Por defecto true
    }
    
    // Cargar configuración de cierre
    const configCierreActual = natillera.value.config_cierre || {}
    const actividadesConfig = configCierreActual.actividades || {}
    const modoActividades = configCierreActual.modoActividades || 'general'
    
    // Si viene en formato antiguo (sin modoActividades), determinar el modo
    let modo = modoActividades
    if (!configCierreActual.modoActividades && actividadesConfig.general) {
      modo = 'general'
    } else if (!configCierreActual.modoActividades && (actividadesConfig.rifa || actividadesConfig.bingo)) {
      modo = 'individual'
    }
    
    configCierre.value = {
      modoActividades: modo,
      actividades: {
        general: actividadesConfig.general || 'equitativa',
        rifa: actividadesConfig.rifa || 'equitativa',
        bingo: actividadesConfig.bingo || 'equitativa',
        venta: actividadesConfig.venta || 'equitativa',
        evento: actividadesConfig.evento || 'equitativa',
        otro: actividadesConfig.otro || 'equitativa'
      },
      prestamos: configCierreActual.prestamos || 'equitativa'
    }
    
    // Cargar configuración de sanciones
    const sanciones = reglasMultas.sanciones || {}
    if (Object.keys(sanciones).length > 0) {
      configSanciones.value = {
        activa: sanciones.activa || false,
        tipo: sanciones.tipo || 'simple',
        valorFijo: sanciones.valorFijo || 5000,
        niveles: sanciones.niveles || [
          { cuotas: 1, valor: 4000 },
          { cuotas: 2, valor: 4500 },
          { cuotas: 3, valor: 5000 },
          { cuotas: 4, valor: 6000 }
        ],
        interesesAdicionales: sanciones.interesesAdicionales || {
          activo: false,
          dias: 2,
          valor: 500
        },
        devolucion: sanciones.devolucion || {
          activo: false,
          cuotasLimite: 5,
          porcentajeMulta: 25,
          sinUtilidades: true
        }
      }
    }
  }
}

// Watch para actualizar los valores cuando cambie la natillera (solo cuando cambie el ID, no en cada modificación)
watch(() => natillera.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    actualizarValoresDesdeNatillera()
  }
}, { immediate: true })

// Watch para cargar usuarios cuando se abre la sección de reasignación
watch(() => seccionActiva.value, (nuevaSeccion) => {
  if (nuevaSeccion === 'reasignar') {
    cargarTodosLosUsuarios()
  }
})

// Funciones para reasignación
async function cargarTodosLosUsuarios() {
  if (usuariosCargados.value) {
    // Si ya están cargados, solo filtrar
    filtrarUsuarios()
    return
  }

  try {
    buscandoUsuarios.value = true

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, nombre')
      .order('email', { ascending: true })

    if (error) {
      // Si el error es que la tabla no existe, mostrar mensaje más claro
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.error('Error: La tabla user_profiles no existe. Por favor ejecuta la migración create_users_profiles.sql en Supabase.')
        mensaje.value = {
          tipo: 'error',
          texto: 'Error: La tabla de usuarios no está configurada. Por favor ejecuta la migración create_users_profiles.sql en Supabase SQL Editor.'
        }
        throw new Error('Tabla user_profiles no encontrada. Ejecuta la migración create_users_profiles.sql')
      }
      throw error
    }

    todosLosUsuarios.value = data || []
    usuariosCargados.value = true
    filtrarUsuarios() // Mostrar todos inicialmente
  } catch (e) {
    console.error('Error cargando usuarios:', e)
    todosLosUsuarios.value = []
    usuariosEncontrados.value = []
    
    // Mostrar mensaje de error al usuario si no es un error de tabla no encontrada
    if (e.message && !e.message.includes('Tabla user_profiles no encontrada')) {
      mensaje.value = {
        tipo: 'error',
        texto: `Error cargando usuarios: ${e.message}`
      }
    }
  } finally {
    buscandoUsuarios.value = false
  }
}

function filtrarUsuarios() {
  if (!busquedaUsuario.value.trim()) {
    // Si no hay búsqueda, mostrar todos
    usuariosEncontrados.value = todosLosUsuarios.value
    return
  }

  const termino = busquedaUsuario.value.toLowerCase().trim()
  usuariosEncontrados.value = todosLosUsuarios.value.filter(usuario => {
    const email = (usuario.email || '').toLowerCase()
    const nombre = (usuario.nombre || '').toLowerCase()
    return email.includes(termino) || nombre.includes(termino)
  })
}

async function buscarUsuarios() {
  // Ahora solo filtra la lista ya cargada
  filtrarUsuarios()
}

function seleccionarUsuario(usuario) {
  usuarioSeleccionado.value = usuario
}

function cancelarReasignacion() {
  usuarioSeleccionado.value = null
  busquedaUsuario.value = ''
  usuariosEncontrados.value = []
  // No limpiar todosLosUsuarios ni usuariosCargados para mantenerlos en memoria
  seccionActiva.value = null
}

async function confirmarReasignacion() {
  if (!usuarioSeleccionado.value || !natillera.value) return

  if (!confirm(`¿Estás seguro de reasignar la natillera "${natillera.value.nombre}" a ${usuarioSeleccionado.value.email}?`)) {
    return
  }

  try {
    guardandoReasignacion.value = true

    const resultado = await natillerasStore.reasignarNatillera(
      natillera.value.id,
      usuarioSeleccionado.value.id
    )

    if (resultado.success) {
      mensaje.value = {
        tipo: 'exito',
        texto: `Natillera reasignada exitosamente a ${usuarioSeleccionado.value.email}`
      }
      
      // Recargar la natillera para ver los cambios
      await natillerasStore.fetchNatillera(id.value)
      
      // Cargar el nuevo administrador
      await cargarAdminActual()
      
      // Limpiar formulario
      cancelarReasignacion()
    } else {
      mensaje.value = {
        tipo: 'error',
        texto: resultado.error || 'Error al reasignar la natillera'
      }
    }
  } catch (e) {
    mensaje.value = {
      tipo: 'error',
      texto: e.message || 'Error al reasignar la natillera'
    }
  } finally {
    guardandoReasignacion.value = false
    setTimeout(() => {
      mensaje.value = null
    }, 5000)
  }
}

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

onMounted(async () => {
  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user

  // Cargar configuración de mensajes
  await configStore.cargarConfiguracion()
  mensajeIndividual.value = configStore.mensajeIndividual
  mensajeGeneral.value = configStore.mensajeGeneral
  mensajeCuotaMora.value = configStore.mensajeCuotaMora
  mensajeCuotaPendiente.value = configStore.mensajeCuotaPendiente
  
  // Cargar la natillera
  await natillerasStore.fetchNatillera(id.value)
  
  // Verificar si el usuario es visor (después de cargar la natillera para tener el id)
  await verificarRolVisor()
  
  // Actualizar valores después de cargar la natillera
  actualizarValoresDesdeNatillera()
  
  // Cargar administrador actual
  await cargarAdminActual()
})

// Watch para cargar admin cuando cambie la natillera
watch(() => natillera.value?.admin_id, async () => {
  await cargarAdminActual()
})
</script>


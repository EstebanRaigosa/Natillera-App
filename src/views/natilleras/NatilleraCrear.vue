<template>
  <div class="max-w-2xl mx-auto relative">
    <!-- Decoraciones de fondo animadas -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-0 w-72 h-72 bg-natillera-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" style="animation-delay: 0.5s;"></div>
    </div>

    <!-- Header -->
    <div class="relative mb-8 animate-fade-in-up">
      <BackButton />
      <div class="pt-12 sm:pt-0 pl-14 sm:pl-0">
        <Breadcrumbs />
        <div class="relative">
          <h1 class="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
            Crear Nueva Natillera
          </h1>
          <div class="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-natillera-400 via-emerald-400 to-natillera-400 rounded-full transform scale-x-0 animate-scale-x"></div>
        </div>
        <p class="text-gray-500 mt-3 text-sm sm:text-base">
          Configura tu grupo de ahorro comunitario
        </p>
      </div>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="card space-y-6 animate-fade-in-up stagger-1">
      <!-- Información básica -->
      <div class="space-y-6 animate-fade-in-up stagger-2">
        <div class="relative">
          <label class="label flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-natillera-500 animate-pulse"></span>
            Nombre de la natillera *
          </label>
          <div class="relative">
            <input 
              v-model="form.nombre"
              type="text" 
              class="input-field peer"
              placeholder="Ej: Natillera Familia García 2025"
              required
            />
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="relative group">
            <label class="label flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-natillera-500 animate-pulse"></span>
              Fecha de inicio *
            </label>
            <div class="relative">
              <input 
                v-model="form.fecha_inicio"
                type="date" 
                lang="es-CO"
                class="input-field peer"
                required
              />
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
            </div>
          </div>

          <div class="relative group">
            <label class="label flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-natillera-500 animate-pulse"></span>
              Periodicidad *
            </label>
            <div class="relative">
              <select v-model="form.periodicidad" class="input-field peer appearance-none cursor-pointer" required>
                <option value="">Selecciona...</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-natillera-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
            </div>
          </div>
        </div>

        <div class="relative">
          <label class="label">Descripción (opcional)</label>
          <textarea 
            v-model="form.descripcion"
            class="input-field peer resize-none"
            rows="3"
            placeholder="Describe brevemente el propósito de esta natillera..."
          ></textarea>
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-natillera-500/0 via-natillera-500/0 to-natillera-500/0 peer-focus:via-natillera-500/10 pointer-events-none transition-all duration-300"></div>
      </div>
      </div>

      <!-- Configuración del Período -->
      <div class="relative p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl border-2 border-blue-100/50 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 animate-fade-in-up stagger-4 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-blue-800 flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-5 text-base sm:text-lg">
            <div class="p-1 sm:p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
              <CalendarDaysIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span>Período de la Natillera</span>
          </h3>
          
          <div class="space-y-3 sm:space-y-5">
            <!-- Información sobre el período automático -->
            <div class="p-3 sm:p-4 bg-blue-50/80 border border-blue-200/50 rounded-lg sm:rounded-xl">
              <p class="text-xs sm:text-sm text-blue-700 flex items-start gap-2 leading-relaxed">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Selecciona el <strong>período de duración</strong> de la natillera (mes y año de inicio y fin). Los valores se calculan automáticamente y puedes ajustarlos desde aquí o más adelante.</span>
              </p>
            </div>

            <!-- Mes y Año de Inicio -->
            <div class="grid grid-cols-2 gap-2 sm:gap-4">
              <div class="relative">
                <label class="label text-blue-800 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></span>
                  <span class="hidden sm:inline">Mes de Inicio</span>
                  <span class="sm:hidden">Mes Inicio</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="form.mes_inicio" class="input-field bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-400/30 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5">
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="relative">
                <label class="label text-blue-800 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500"></span>
                  <span class="hidden sm:inline">Año de Inicio</span>
                  <span class="sm:hidden">Año Inicio</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="form.anio_inicio" class="input-field bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-400/30 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5">
                    <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mes y Año de Fin -->
            <div class="grid grid-cols-2 gap-2 sm:gap-4">
              <div class="relative">
                <label class="label text-blue-800 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500"></span>
                  <span class="hidden sm:inline">Mes de Fin</span>
                  <span class="sm:hidden">Mes Fin</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="form.mes_fin" class="input-field bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-400/30 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5">
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="relative">
                <label class="label text-blue-800 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                  <span class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-500"></span>
                  <span class="hidden sm:inline">Año de Fin</span>
                  <span class="sm:hidden">Año Fin</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select v-model.number="form.anio" class="input-field bg-white/90 border-blue-200 focus:border-blue-400 focus:ring-blue-400/30 appearance-none cursor-pointer text-sm sm:text-base py-2 sm:py-2.5">
                    <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen del período -->
            <div class="p-3 sm:p-4 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 border border-blue-200/50 rounded-lg sm:rounded-xl">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg sm:text-xl">📅</span>
                  <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <strong class="text-blue-800">{{ meses.find(m => m.value === form.mes_inicio)?.label }} {{ form.anio_inicio }}</strong>
                    <span class="text-gray-500">→</span>
                    <strong class="text-indigo-800">{{ meses.find(m => m.value === form.mes_fin)?.label }} {{ form.anio }}</strong>
                  </div>
                </div>
                <span class="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full self-start sm:self-auto">
                  {{ cantidadMeses }} {{ cantidadMeses === 1 ? 'mes' : 'meses' }}
                </span>
              </div>
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
              <div v-if="form.anio_inicio !== form.anio" class="p-2.5 sm:p-3 bg-amber-50/80 border border-amber-200/50 rounded-lg sm:rounded-xl">
                <p class="text-xs text-amber-700 flex items-start gap-2 leading-relaxed">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span>Este período cruza de un año a otro. Ideal para natilleras que inician en diciembre y terminan el año siguiente.</span>
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Reglas de multas -->
      <div class="relative p-5 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-amber-100/50 shadow-lg shadow-amber-100/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 animate-fade-in-up stagger-5 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-amber-800 flex items-center gap-2.5 mb-5 text-lg">
            <div class="p-1.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg shadow-md">
              <ExclamationTriangleIcon class="w-5 h-5 text-white" />
            </div>
            <span>Reglas de Multas</span>
          </h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-100/50 hover:bg-white/90 hover:shadow-md transition-all duration-300">
              <label for="multa_activa" class="relative flex items-center cursor-pointer group flex-1">
                <input 
                  type="checkbox" 
                  v-model="form.multa_activa"
                  id="multa_activa"
                  class="sr-only peer"
                />
                <!-- Toggle mejorado -->
                <div class="relative w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 peer-checked:shadow-lg peer-checked:shadow-amber-500/50 peer-focus:ring-2 peer-focus:ring-amber-500/50 peer-focus:ring-offset-2">
                  <!-- Círculo del toggle -->
                  <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                    <!-- Icono de check cuando está activo -->
                    <svg v-if="form.multa_activa" class="w-4 h-4 text-amber-600 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <!-- Icono de X cuando está inactivo -->
                    <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <!-- Efecto de brillo cuando está activo -->
                  <div v-if="form.multa_activa" class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-toggle"></div>
                </div>
                <span class="ml-4 text-gray-700 font-semibold group-hover:text-amber-800 transition-colors text-sm sm:text-base">
                  Aplicar multas por pago tardío
                </span>
              </label>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-4"
              enter-to-class="opacity-100 max-h-96 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-4"
            >
              <div v-if="form.multa_activa" class="space-y-5">
                <!-- Días de gracia -->
                <div class="relative">
                  <label class="label text-amber-800">Días de gracia</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.dias_gracia"
                      type="number" 
                      class="input-field bg-white/90 border-amber-200 focus:border-amber-400 focus:ring-amber-400/30"
                      placeholder="3"
                      min="0"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 peer-focus:via-amber-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>

                <!-- Tipo de sanción -->
                <div>
                  <label class="label font-semibold text-amber-800 mb-3 block">Tipo de Sanción</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      @click="form.tipo_sancion = 'simple'"
                      :class="['p-3 rounded-xl border-2 text-left transition-all', form.tipo_sancion === 'simple' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 bg-white hover:border-amber-300']"
                    >
                      <CurrencyDollarIcon class="w-5 h-5 mb-1" :class="form.tipo_sancion === 'simple' ? 'text-amber-600' : 'text-gray-400'" />
                      <p class="font-semibold text-sm text-gray-800">Simple</p>
                      <p class="text-xs text-gray-500">Valor fijo</p>
                    </button>
                    <button 
                      type="button"
                      @click="form.tipo_sancion = 'escalonada'"
                      :class="['p-3 rounded-xl border-2 text-left transition-all', form.tipo_sancion === 'escalonada' ? 'border-amber-500 bg-amber-50' : 'border-amber-200 bg-white hover:border-amber-300']"
                    >
                      <ChartBarIcon class="w-5 h-5 mb-1" :class="form.tipo_sancion === 'escalonada' ? 'text-amber-600' : 'text-gray-400'" />
                      <p class="font-semibold text-sm text-gray-800">Escalonada</p>
                      <p class="text-xs text-gray-500">Progresiva</p>
                    </button>
                  </div>
                </div>

                <!-- Simple -->
                <div v-if="form.tipo_sancion === 'simple'" class="space-y-4">
                  <div class="p-4 bg-white/70 rounded-xl border border-amber-200">
                    <label class="label font-semibold text-amber-800">Valor de multa por mora</label>
                    <div class="relative mt-2">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input 
                        :value="formatearValorMulta(form.valor_multa)"
                        @input="handleValorMultaInput"
                        type="text" 
                        inputmode="numeric"
                        class="input-field bg-white/90 border-amber-200 focus:border-amber-400 focus:ring-amber-400/30 pl-8 w-full max-w-[200px]" 
                        placeholder="5.000"
                      />
                    </div>
                  </div>
                  
                  <!-- Resumen Simple -->
                  <div class="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div class="flex items-start gap-2">
                      <CurrencyDollarIcon class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="text-xs font-semibold text-amber-800 mb-1">Resumen: Sanción Simple</p>
                        <p class="text-xs text-amber-700">
                          Se aplicará un valor fijo de <strong>${{ formatMoney(form.valor_multa) }}</strong> por cada cuota en mora.
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Info adicional -->
                  <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p class="text-xs text-blue-700">
                        💡 Puedes configurar <strong>intereses adicionales por días</strong> y <strong>devolución por mora excesiva</strong> en la sección de Configuración → Sanciones por mora.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Escalonada -->
                <div v-if="form.tipo_sancion === 'escalonada'" class="space-y-4">
                  <!-- Tabla niveles -->
                  <div class="p-4 bg-white/70 rounded-xl border border-amber-200">
                    <label class="label font-semibold text-amber-800 mb-3 block">Intereses por cuotas vencidas</label>
                    <div class="space-y-2">
                      <div v-for="(nivel, index) in form.niveles_sancion" :key="index" class="flex items-center gap-3">
                        <span class="text-sm text-gray-600 w-20">{{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}</span>
                        <div class="relative flex-1 max-w-[120px]">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input 
                            v-model.number="nivel.valor" 
                            type="number" 
                            min="0" 
                            class="input-field bg-white/90 border-amber-200 focus:border-amber-400 focus:ring-amber-400/30 pl-7 py-1.5 text-sm" 
                          />
                        </div>
                        <button 
                          v-if="form.niveles_sancion.length > 1" 
                          @click="eliminarNivel(index)" 
                          type="button"
                          class="text-red-500 hover:text-red-700 p-1 transition-colors"
                        >
                          <XMarkIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button 
                      v-if="form.niveles_sancion.length < 10" 
                      @click="agregarNivel" 
                      type="button"
                      class="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      <PlusIcon class="w-4 h-4" /> Agregar nivel
                    </button>
                  </div>

                  <!-- Resumen Escalonada -->
                  <div class="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div class="flex items-start gap-2">
                      <ChartBarIcon class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="text-xs font-semibold text-amber-800 mb-1">Resumen: Sanción Escalonada</p>
                        <p class="text-xs text-amber-700 mb-2">
                          El valor de la multa aumenta según la cantidad de cuotas en mora del socio:
                        </p>
                        <div class="space-y-1">
                          <div v-for="(nivel, index) in form.niveles_sancion.slice(0, 3)" :key="index" class="text-xs text-amber-700">
                            • {{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}: <strong>${{ formatMoney(nivel.valor) }}</strong>
                          </div>
                          <p v-if="form.niveles_sancion.length > 3" class="text-xs text-amber-600 italic">
                            ... y {{ form.niveles_sancion.length - 3 }} nivel{{ form.niveles_sancion.length - 3 > 1 ? 'es' : '' }} más
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Info adicional -->
                  <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-start gap-2">
                      <InformationCircleIcon class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p class="text-xs text-blue-700">
                        💡 Puedes configurar <strong>intereses adicionales por días</strong> y <strong>devolución por mora excesiva</strong> en la sección de Configuración → Sanciones por mora.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Generación automática de cuotas -->
      <div class="relative p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border-2 border-emerald-100/50 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 animate-fade-in-up stagger-5 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-emerald-800 flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-5 text-base sm:text-lg">
            <div class="p-1 sm:p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-md">
              <SparklesIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span>Generación de Cuotas Automáticas</span>
          </h3>
          
          <div class="space-y-3 sm:space-y-4">
            <!-- Toggle con mejor soporte móvil -->
            <div class="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100/50">
              <!-- Switch mejorado para móvil (usando botón en lugar de checkbox) -->
              <button 
                type="button"
                @click="form.cuotas_automaticas = !form.cuotas_automaticas"
                :class="[
                  'relative flex-shrink-0 w-12 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2',
                  form.cuotas_automaticas 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30' 
                    : 'bg-gray-300'
                ]"
              >
                <span 
                  :class="[
                    'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center',
                    form.cuotas_automaticas ? 'left-[22px]' : 'left-0.5'
                  ]"
                >
                  <svg v-if="form.cuotas_automaticas" class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <svg v-else class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </span>
              </button>
              
              <div class="flex-1 min-w-0">
                <span class="text-gray-700 font-semibold text-sm sm:text-base block mb-1">
                  Generar cuotas automáticamente
                </span>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Al agregar un nuevo socio, se crearán todas sus cuotas del período
                </p>
              </div>
            </div>

            <!-- Información explicativa -->
            <div class="p-3 sm:p-4 bg-emerald-50/80 border border-emerald-200/50 rounded-lg sm:rounded-xl">
              <p class="text-xs sm:text-sm text-emerald-700 flex items-start gap-2 leading-relaxed">
                <SparklesIcon class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Las cuotas se generarán desde <strong>{{ meses.find(m => m.value === form.mes_inicio)?.label }} {{ form.anio_inicio }}</strong> hasta <strong>{{ meses.find(m => m.value === form.mes_fin)?.label }} {{ form.anio }}</strong>, 
                  respetando la periodicidad configurada.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reglas de intereses -->
      <div class="relative p-5 sm:p-6 bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl border-2 border-cyan-100/50 shadow-lg shadow-cyan-100/50 hover:shadow-xl hover:shadow-cyan-200/50 transition-all duration-300 animate-fade-in-up stagger-7 overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-200/20 to-sky-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative">
          <h3 class="font-semibold text-cyan-800 flex items-center gap-2.5 mb-5 text-lg">
            <div class="p-1.5 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-lg shadow-md">
              <CurrencyDollarIcon class="w-5 h-5 text-white" />
            </div>
            <span>Reglas de Préstamos</span>
          </h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-cyan-100/50 hover:bg-white/90 hover:shadow-md transition-all duration-300">
              <label for="prestamos_activos" class="relative flex items-center cursor-pointer group flex-1">
                <input 
                  type="checkbox" 
                  v-model="form.prestamos_activos"
                  id="prestamos_activos"
                  class="sr-only peer"
                />
                <!-- Toggle mejorado -->
                <div class="relative w-14 h-7 bg-gray-300 rounded-full shadow-inner transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-sky-500 peer-checked:shadow-lg peer-checked:shadow-cyan-500/50 peer-focus:ring-2 peer-focus:ring-cyan-500/50 peer-focus:ring-offset-2">
                  <!-- Círculo del toggle -->
                  <div class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-7 flex items-center justify-center">
                    <!-- Icono de check cuando está activo -->
                    <svg v-if="form.prestamos_activos" class="w-4 h-4 text-cyan-600 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <!-- Icono de X cuando está inactivo -->
                    <svg v-else class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <!-- Efecto de brillo cuando está activo -->
                  <div v-if="form.prestamos_activos" class="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-toggle"></div>
                </div>
                <span class="ml-4 text-gray-700 font-semibold group-hover:text-cyan-800 transition-colors text-sm sm:text-base">
                  Permitir préstamos internos
                </span>
              </label>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0 -translate-y-4"
              enter-to-class="opacity-100 max-h-96 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96 translate-y-0"
              leave-to-class="opacity-0 max-h-0 -translate-y-4"
            >
              <div v-if="form.prestamos_activos" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="label text-cyan-800">Interés mensual (%)</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.interes_prestamo"
                      type="number" 
                      class="input-field bg-white/90 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400/30"
                      placeholder="2"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 peer-focus:via-cyan-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>
                <div class="relative">
                  <label class="label text-cyan-800">Plazo máximo (meses)</label>
                  <div class="relative">
                    <input 
                      v-model.number="form.plazo_maximo"
                      type="number" 
                      class="input-field bg-white/90 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400/30"
                      placeholder="6"
                      min="1"
                    />
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 peer-focus:via-cyan-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="error" class="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl text-red-700 text-sm shadow-md flex items-center gap-3 animate-fade-in-up">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>
      </Transition>

      <div class="flex flex-col sm:flex-row gap-3 pt-6 animate-fade-in-up stagger-7">
        <router-link to="/natilleras" class="btn-secondary flex-1 text-center group relative overflow-hidden">
          <span class="relative z-10">Cancelar</span>
          <div class="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </router-link>
        <button 
          type="submit" 
          class="btn-primary flex-1 relative overflow-hidden group"
          :disabled="natillerasStore.loading"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg v-if="natillerasStore.loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ natillerasStore.loading ? 'Creando...' : 'Crear Natillera' }}</span>
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-natillera-600 to-natillera-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div v-if="!natillerasStore.loading" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { Transition } from 'vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import { parseDateLocal, formatDateToLocalISO, getCurrentDateISO } from '../../utils/formatDate'

const router = useRouter()
const natillerasStore = useNatillerasStore()

const error = ref('')

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

// Generar lista de años (desde 2 años atrás hasta 5 años adelante)
const anioActual = new Date().getFullYear()
const aniosDisponibles = computed(() => {
  const anios = []
  for (let i = anioActual - 2; i <= anioActual + 5; i++) {
    anios.push(i)
  }
  return anios
})

const form = reactive({
  nombre: '',
  fecha_inicio: getCurrentDateISO(),
  periodicidad: 'mensual',
  descripcion: '',
  // Período
  mes_inicio: new Date().getMonth() + 1, // Mes actual (1-12)
  anio_inicio: new Date().getFullYear(),
  mes_fin: 11, // Noviembre por defecto
  anio: new Date().getFullYear(),
  // Generación automática de cuotas
  cuotas_automaticas: true,
  // Multas
  multa_activa: true,
  tipo_sancion: 'simple', // 'simple' o 'escalonada'
  valor_multa: 5000,
  dias_gracia: 3,
  niveles_sancion: [
    { cuotas: 1, valor: 4000 },
    { cuotas: 2, valor: 4500 },
    { cuotas: 3, valor: 5000 },
    { cuotas: 4, valor: 6000 }
  ],
  // Préstamos
  prestamos_activos: true,
  interes_prestamo: 2,
  plazo_maximo: 6
})

// Calcular automáticamente el período cuando cambia la fecha de inicio
watch(() => form.fecha_inicio, (nuevaFecha) => {
  if (nuevaFecha) {
    // Usar parseDateLocal para evitar problemas de zona horaria
    const fecha = parseDateLocal(nuevaFecha)
    if (!fecha || isNaN(fecha.getTime())) return
    
    const mes = fecha.getMonth() + 1 // getMonth() devuelve 0-11
    const anio = fecha.getFullYear()
    
    form.mes_inicio = mes
    form.anio_inicio = anio
    
    // Si el mes de inicio es diciembre, el año principal es el siguiente
    if (mes === 12) {
      form.anio = anio + 1
    } else {
      form.anio = anio
    }
  }
}, { immediate: true })

// Formatear dinero
function formatMoney(value) {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('es-CO').format(value)
}

// Formatear valor de multa para el input
function formatearValorMulta(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

// Manejar input del valor de multa
function handleValorMultaInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    form.valor_multa = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      form.valor_multa = numero
    }
  }
}

// Funciones para manejar niveles de sanción escalonada
function agregarNivel() {
  const ultimoNivel = form.niveles_sancion[form.niveles_sancion.length - 1]
  form.niveles_sancion.push({
    cuotas: ultimoNivel.cuotas + 1,
    valor: ultimoNivel.valor + 500
  })
}

function eliminarNivel(index) {
  if (form.niveles_sancion.length > 1) {
    form.niveles_sancion.splice(index, 1)
  }
}

// Calcular el número de meses del período
const cantidadMeses = computed(() => {
  if (form.anio_inicio === form.anio) {
    // Mismo año
    return form.mes_fin >= form.mes_inicio 
      ? form.mes_fin - form.mes_inicio + 1 
      : 12 - form.mes_inicio + form.mes_fin + 1
  } else if (form.anio > form.anio_inicio) {
    // Período cruza años
    const mesesPrimerAnio = 12 - form.mes_inicio + 1
    const mesesSegundoAnio = form.mes_fin
    const aniosIntermedios = (form.anio - form.anio_inicio - 1) * 12
    return mesesPrimerAnio + mesesSegundoAnio + aniosIntermedios
  }
  return 0
})

async function handleSubmit() {
  error.value = ''

  // Debug: Verificar la fecha antes de enviar
  console.log('📅 Fecha de inicio antes de enviar:', form.fecha_inicio)
  console.log('📅 Tipo de fecha:', typeof form.fecha_inicio)

  // Estructurar reglas_multas correctamente para activar las multas en la configuración
  const reglasMultas = form.multa_activa ? {
    activa: true,
    dias_gracia: form.dias_gracia,
    sanciones: {
      activa: true, // Esto activa las multas en la configuración
      tipo: form.tipo_sancion, // Usar el tipo seleccionado
      valorFijo: form.tipo_sancion === 'simple' ? form.valor_multa : (form.niveles_sancion[0]?.valor || 0),
      niveles: form.tipo_sancion === 'escalonada' ? form.niveles_sancion : [
        { cuotas: 1, valor: form.valor_multa },
        { cuotas: 2, valor: form.valor_multa },
        { cuotas: 3, valor: form.valor_multa },
        { cuotas: 4, valor: form.valor_multa }
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
    }
  } : { 
    activa: false,
    sanciones: {
      activa: false
    }
  }

  // Extraer año, mes y día directamente del string para evitar cualquier problema de zona horaria
  // El input de tipo date devuelve un string YYYY-MM-DD que ya está en hora local
  let fechaInicioFinal = form.fecha_inicio
  if (typeof form.fecha_inicio === 'string' && form.fecha_inicio.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
    // El string ya está en formato YYYY-MM-DD, usarlo directamente
    // Esto evita cualquier procesamiento que pueda causar problemas de zona horaria
    fechaInicioFinal = form.fecha_inicio
  } else {
    // Si no está en formato string YYYY-MM-DD, formatearlo
    fechaInicioFinal = formatDateToLocalISO(form.fecha_inicio)
  }

  const datos = {
    nombre: form.nombre,
    // Enviar la fecha directamente como string YYYY-MM-DD
    // Supabase maneja correctamente los strings YYYY-MM-DD para campos DATE
    fecha_inicio: fechaInicioFinal,
    periodicidad: form.periodicidad,
    descripcion: form.descripcion,
    avatar_seed: form.nombre, // Usar el nombre como seed del avatar
    // Período
    mes_inicio: form.mes_inicio,
    anio_inicio: form.anio_inicio,
    mes_fin: form.mes_fin,
    anio: form.anio,
    // Generación automática de cuotas
    cuotas_automaticas: form.cuotas_automaticas,
    // Reglas
    reglas_multas: reglasMultas,
    reglas_interes: form.prestamos_activos ? {
      activo: true,
      porcentaje: form.interes_prestamo,
      plazo_maximo: form.plazo_maximo
    } : { activo: false }
  }

  // Debug: Verificar los datos que se envían
  console.log('📤 Datos a enviar:', datos)
  console.log('📤 Fecha de inicio en datos:', datos.fecha_inicio)

  const result = await natillerasStore.crearNatillera(datos)

  if (result.success) {
    // Debug: Verificar la fecha que se guardó
    console.log('✅ Natillera creada:', result.data)
    console.log('📅 Fecha de inicio guardada:', result.data.fecha_inicio)
    router.push(`/natilleras/${result.data.id}`)
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
/* Animación de pulso lento para decoraciones */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

/* Animación de entrada escalonada */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
  opacity: 0;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }
.stagger-7 { animation-delay: 0.7s; }
.stagger-8 { animation-delay: 0.8s; }

/* Animación scale-x para la línea decorativa */
@keyframes scale-x {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }
  100% {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.animate-scale-x {
  animation: scale-x 0.8s ease-out 0.3s forwards;
}

/* Animación de entrada para el icono de check */
@keyframes scale-in {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

/* Animación shimmer para el toggle */
@keyframes shimmer-toggle {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer-toggle {
  animation: shimmer-toggle 2s ease-in-out infinite;
}
</style>


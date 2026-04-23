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
      
      <!-- === CONFIGURACIÓN GENERAL === -->
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
            Configuración General
          </h3>
              <p :class="['text-sm', seccionActiva === 'basica' ? 'text-white/80' : 'text-gray-500']">
                Período, cierre, sanciones y datos básicos
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
              <!-- Pantalla de carga al guardar -->
              <ModalWrapper
                :show="guardandoBasica"
                :z-index="100"
                overlay-class="fixed inset-0 z-[100] flex items-center justify-center"
                card-class="relative flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/95 shadow-2xl border border-white/20 max-w-sm mx-4"
                card-max-width="24rem"
              >
                    <div class="relative">
                      <div class="w-20 h-20 rounded-full border-4 border-natillera-200 border-t-natillera-500 animate-spin"></div>
                      <div class="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
                      <div class="absolute inset-2 w-16 h-16 rounded-full bg-gradient-to-br from-natillera-400 to-emerald-500 opacity-20 animate-pulse"></div>
                    </div>
                    <div class="text-center">
                      <p class="text-lg font-bold text-gray-800">Guardando configuración</p>
                      <p class="text-sm text-gray-500 mt-1">Un momento por favor...</p>
                    </div>
                    <div class="flex gap-1">
                      <span class="w-2 h-2 rounded-full bg-natillera-500 animate-bounce" style="animation-delay: 0ms"></span>
                      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
                      <span class="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
              </ModalWrapper>

              <!-- Tabs Configuración General: estilo pestañas que envuelven el contenido -->
              <div class="rounded-xl border-2 border-gray-200 bg-white shadow-md overflow-hidden mt-2">
                <!-- Barra de pestañas: en móvil grid 2x2, en desktop fila horizontal -->
                <div class="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 sm:gap-0.5 pt-2 px-2 pb-2 sm:pb-0 bg-gray-100 border-b border-gray-200 sm:min-h-[48px]">
                  <button
                    type="button"
                    @click="tabGeneralActiva = 'basica'"
                    :class="[
                      'flex-shrink-0 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-t-lg sm:rounded-b-none border sm:border-b-0',
                      tabGeneralActiva === 'basica'
                        ? 'bg-white text-natillera-700 border-natillera-300 sm:border-b-white -mb-px shadow-sm z-10'
                        : 'bg-gray-50/80 text-gray-500 border-gray-200 sm:border-transparent hover:text-gray-700 hover:bg-gray-100'
                    ]"
                  >
                    <CurrencyDollarIcon class="w-4 h-4 flex-shrink-0" />
                    <span class="sm:hidden">Básica</span>
                    <span class="hidden sm:inline">Información básica</span>
                  </button>
                  <button
                    type="button"
                    @click="tabGeneralActiva = 'periodo'"
                    :class="[
                      'flex-shrink-0 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-t-lg sm:rounded-b-none border sm:border-b-0',
                      tabGeneralActiva === 'periodo'
                        ? 'bg-white text-blue-700 border-blue-300 sm:border-b-white -mb-px shadow-sm z-10'
                        : 'bg-gray-50/80 text-gray-500 border-gray-200 sm:border-transparent hover:text-gray-700 hover:bg-gray-100'
                    ]"
                  >
                    <CalendarDaysIcon class="w-4 h-4 flex-shrink-0" />
                    <span class="sm:hidden">Período</span>
                    <span class="hidden sm:inline">Período</span>
                  </button>
                  <button
                    type="button"
                    @click="tabGeneralActiva = 'sanciones'"
                    :class="[
                      'flex-shrink-0 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-t-lg sm:rounded-b-none border sm:border-b-0',
                      tabGeneralActiva === 'sanciones'
                        ? 'bg-white text-red-700 border-red-300 sm:border-b-white -mb-px shadow-sm z-10'
                        : 'bg-gray-50/80 text-gray-500 border-gray-200 sm:border-transparent hover:text-gray-700 hover:bg-gray-100'
                    ]"
                  >
                    <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
                    <span class="sm:hidden">Sanciones</span>
                    <span class="hidden sm:inline">Sanciones por mora</span>
                  </button>
                  <button
                    type="button"
                    @click="tabGeneralActiva = 'cierre'"
                    :class="[
                      'flex-shrink-0 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-t-lg sm:rounded-b-none border sm:border-b-0',
                      tabGeneralActiva === 'cierre'
                        ? 'bg-white text-purple-700 border-purple-300 sm:border-b-white -mb-px shadow-sm z-10'
                        : 'bg-gray-50/80 text-gray-500 border-gray-200 sm:border-transparent hover:text-gray-700 hover:bg-gray-100'
                    ]"
                  >
                    <CurrencyDollarIcon class="w-4 h-4 flex-shrink-0" />
                    <span class="sm:hidden">Cierre</span>
                    <span class="hidden sm:inline">Cierre de Natillera</span>
                  </button>
                </div>

                <!-- Contenido de las pestañas (envuelto por el mismo panel) -->
                <div class="min-h-[200px] bg-white border-t border-gray-100">
              <!-- Tab Información básica -->
              <div v-if="tabGeneralActiva === 'basica'" class="p-5 sm:p-6 space-y-4">
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
                <div>
                  <label class="label font-semibold text-gray-700">Descripción</label>
                  <textarea 
                    v-model="configBasica.descripcion"
                    class="input-field min-h-[100px]"
                    placeholder="Descripción opcional de la natillera..."
                  ></textarea>
                </div>
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
              </div>

              <!-- Tab Período -->
              <div v-if="tabGeneralActiva === 'periodo'" class="p-5 sm:p-6 space-y-6">
                <!-- Bloque 1: Rango del período -->
                <section class="rounded-xl border border-blue-200/60 bg-blue-50/30 overflow-hidden">
                  <div class="px-4 py-3 border-b border-blue-200/60 bg-blue-100/50">
                    <h3 class="text-sm font-bold text-blue-800 flex items-center gap-2">
                      <CalendarDaysIcon class="w-4 h-4" />
                      Rango del período
                    </h3>
                    <p class="text-xs text-blue-600/90 mt-0.5">Define desde qué mes/año hasta qué mes/año se generan las cuotas.</p>
                  </div>
                  <div class="p-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Desde</label>
                        <div class="flex gap-2">
                          <select v-model.number="configPeriodo.mes_inicio" class="input-field flex-1 text-sm">
                            <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                          </select>
                          <select v-model.number="configPeriodo.anio_inicio" class="input-field flex-1 text-sm min-w-0">
                            <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                          </select>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hasta</label>
                        <div class="flex gap-2">
                          <select v-model.number="configPeriodo.mes_fin" class="input-field flex-1 text-sm">
                            <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                          </select>
                          <select v-model.number="configPeriodo.anio" class="input-field flex-1 text-sm min-w-0">
                            <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div class="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      <span class="font-semibold text-blue-800">{{ meses.find(m => m.value === configPeriodo.mes_inicio)?.label }} {{ configPeriodo.anio_inicio }}</span>
                      <span class="text-gray-400">→</span>
                      <span class="font-semibold text-indigo-800">{{ meses.find(m => m.value === configPeriodo.mes_fin)?.label }} {{ configPeriodo.anio }}</span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ cantidadMesesPeriodo }} {{ cantidadMesesPeriodo === 1 ? 'mes' : 'meses' }}
                      </span>
                      <span v-if="configPeriodo.anio_inicio !== configPeriodo.anio" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Cruza años
                      </span>
                    </div>
                  </div>
                </section>

                <!-- Bloque 2: Días de gracia -->
                <section class="rounded-xl border border-amber-200/60 bg-amber-50/30 overflow-hidden">
                  <div class="px-4 py-3 border-b border-amber-200/60 bg-amber-100/50">
                    <h3 class="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <ClockIcon class="w-4 h-4" />
                      Días de gracia
                    </h3>
                    <p class="text-xs text-amber-700/90 mt-0.5">Días extra después del vencimiento antes de que una cuota se considere en mora.</p>
                  </div>
                  <div class="p-4 space-y-3">
                    <div class="flex items-center gap-3">
                      <label class="text-sm font-semibold text-gray-700">Días</label>
                      <input
                        v-model.number="configDiasGracia.dias_gracia"
                        type="number"
                        class="input-field w-16 text-center text-base font-semibold py-1.5"
                        min="0"
                        max="30"
                      />
                    </div>
                    <p class="text-sm text-gray-600">
                      Las cuotas tendrán <strong>{{ configDiasGracia.dias_gracia }}</strong> {{ configDiasGracia.dias_gracia === 1 ? 'día' : 'días' }} de gracia.
                    </p>
                  </div>
                </section>
              </div>

              <!-- Tab Sanciones por mora -->
              <div v-if="tabGeneralActiva === 'sanciones'" class="p-3 sm:p-6">
                <!-- Activar/Desactivar -->
                <div class="mb-4 sm:mb-5">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <div class="relative">
                      <input type="checkbox" v-model="configSanciones.activa" class="sr-only peer" />
                      <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </div>
                    <span class="font-semibold text-gray-700 text-sm sm:text-base">Activar sanciones por mora</span>
                  </label>
                </div>

                <div v-if="configSanciones.activa" class="space-y-5">
                  <!-- Tipo de sanción -->
                  <div>
                    <label class="label font-semibold text-gray-700 mb-3 block text-sm sm:text-base">Tipo de Sanción</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        type="button"
                        @click="configSanciones.tipo = 'simple'"
                        :class="['p-3 sm:p-4 rounded-xl border-2 text-left transition-all', configSanciones.tipo === 'simple' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300']"
                      >
                        <CurrencyDollarIcon class="w-5 h-5 mb-1" :class="configSanciones.tipo === 'simple' ? 'text-red-500' : 'text-gray-400'" />
                        <p class="font-semibold text-sm text-gray-800">Simple</p>
                        <p class="text-xs text-gray-500 break-words">Valor fijo</p>
                      </button>
                      <button 
                        type="button"
                        @click="configSanciones.tipo = 'escalonada'"
                        :class="['p-3 sm:p-4 rounded-xl border-2 text-left transition-all', configSanciones.tipo === 'escalonada' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300']"
                      >
                        <ChartBarIcon class="w-5 h-5 mb-1" :class="configSanciones.tipo === 'escalonada' ? 'text-red-500' : 'text-gray-400'" />
                        <p class="font-semibold text-sm text-gray-800">Escalonada</p>
                        <p class="text-xs text-gray-500 break-words">Progresiva</p>
                      </button>
                      <button 
                        type="button"
                        @click="configSanciones.tipo = 'diaria'"
                        :class="['p-3 sm:p-4 rounded-xl border-2 text-left transition-all', configSanciones.tipo === 'diaria' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300']"
                      >
                        <ClockIcon class="w-5 h-5 mb-1" :class="configSanciones.tipo === 'diaria' ? 'text-red-500' : 'text-gray-400'" />
                        <p class="font-semibold text-sm text-gray-800">Por día</p>
                        <p class="text-xs text-gray-500 break-words">Por día de mora</p>
                      </button>
                    </div>
                  </div>

                  <!-- Simple -->
                  <div v-if="configSanciones.tipo === 'simple'" class="p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                    <label class="label font-semibold text-gray-700 text-sm sm:text-base">Valor de multa por mora</label>
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

                  <!-- Por día -->
                  <div v-if="configSanciones.tipo === 'diaria'" class="p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                    <label class="label font-semibold text-gray-700 text-sm sm:text-base">Valor por día de mora</label>
                    <p class="text-xs sm:text-sm text-gray-500 mb-2 break-words">Por cada día de atraso se suma este valor a la sanción.</p>
                    <div class="relative mt-2">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                      <input 
                        :value="formatNumberWithSeparators(configSanciones.valorPorDia)"
                        @input="(e) => {
                          const rawValue = removeNumberFormat(e.target.value)
                          configSanciones.valorPorDia = rawValue ? parseInt(rawValue) || 0 : 0
                        }"
                        @focus="(e) => e.target.select()"
                        type="text"
                        inputmode="numeric"
                        pattern="[0-9.,]*"
                        class="input-field pl-8 w-full sm:w-48 font-semibold" 
                        placeholder="500"
                      />
                    </div>
                  </div>

                  <!-- Intereses adicionales por días (visible para todos los tipos) -->
                  <div class="p-3 sm:p-5 bg-white rounded-xl border-2 transition-all duration-200" 
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
                      leave-active-class="transition duration-150 ease-out"
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

                  <!-- Escalonada -->
                  <div v-if="configSanciones.tipo === 'escalonada'" class="space-y-4">
                    <div class="p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                      <label class="label font-semibold text-gray-700 mb-3 block text-sm sm:text-base">Intereses por cuotas vencidas</label>
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
                  </div>

                  <!-- Devolución por mora excesiva (visible para todos los tipos) -->
                  <div class="p-3 sm:p-5 bg-white rounded-xl border-2 transition-all duration-200" 
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

                  <!-- Resumen -->
                  <div class="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p class="text-xs font-semibold text-red-700 mb-2">📋 Resumen</p>
                    <div v-if="configSanciones.tipo === 'simple'" class="text-sm text-gray-700">
                      Multa fija: <strong>${{ formatMoney(configSanciones.valorFijo) }}</strong>
                    </div>
                    <div v-else-if="configSanciones.tipo === 'diaria'" class="text-sm text-gray-700">
                      Por día de mora: <strong>${{ formatMoney(configSanciones.valorPorDia) }}</strong> por cada día después del vencimiento (y días de gracia).
                    </div>
                    <div v-else class="text-sm text-gray-700 space-y-1">
                      <p v-for="nivel in configSanciones.niveles" :key="nivel.cuotas">
                        {{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}: <strong>${{ formatMoney(nivel.valor) }}</strong>
                      </p>
                    </div>
                    <div v-if="configSanciones.interesesAdicionales?.activo" class="mt-3 pt-3 border-t border-red-200 text-sm text-gray-700">
                      <p class="font-medium text-red-800 mb-1">Intereses adicionales por días</p>
                      <p>
                        Cada <strong>{{ configSanciones.interesesAdicionales.dias }}</strong> {{ configSanciones.interesesAdicionales.dias === 1 ? 'día' : 'días' }} en mora después del vencimiento se suma <strong>${{ formatMoney(configSanciones.interesesAdicionales.valor) }}</strong> a la sanción de la cuota.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Cierre de Natillera -->
              <div v-if="tabGeneralActiva === 'cierre'" class="p-3 sm:p-6">
                <!-- Header -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                    <CurrencyDollarIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base sm:text-lg font-display font-bold text-gray-800">
                      Cierre de Natillera
                    </h3>
                    <p class="text-xs text-gray-600 mt-0.5">
                      Configura cómo se repartirán las utilidades al cerrar
                    </p>
                  </div>
                </div>

                <!-- Configuración de Utilidades de Actividades -->
                  <div class="mb-6">
                    <label class="label font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CalendarDaysIcon class="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span class="text-sm sm:text-base">Utilidades de Actividades</span>
                    </label>
                    <p class="text-xs text-gray-500 mb-3 break-words">
                      Selecciona si quieres configurar todas las actividades igual o cada una por separado
                    </p>
                    
                    <!-- Selector de modo -->
                    <div class="mb-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs sm:text-sm font-semibold text-gray-700">Modo de configuración</span>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          @click="configCierre.modoActividades = 'general'"
                          :class="[
                            'relative p-3 rounded-lg border-2 transition-all duration-200 text-center overflow-hidden',
                            configCierre.modoActividades === 'general'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center justify-center gap-2 min-w-0">
                            <UsersIcon 
                              class="w-4 h-4 flex-shrink-0" 
                              :class="configCierre.modoActividades === 'general' ? 'text-purple-600' : 'text-gray-400'" 
                            />
                            <span 
                              :class="[
                                'font-semibold text-sm min-w-0 truncate',
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
                            'relative p-3 rounded-lg border-2 transition-all duration-200 text-center overflow-hidden',
                            configCierre.modoActividades === 'individual'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center justify-center gap-2 min-w-0">
                            <ChartBarIcon 
                              class="w-4 h-4 flex-shrink-0" 
                              :class="configCierre.modoActividades === 'individual' ? 'text-purple-600' : 'text-gray-400'" 
                            />
                            <span 
                              :class="[
                                'font-semibold text-sm min-w-0 truncate',
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
                      <p class="text-xs text-gray-500 mb-3 break-words">
                        Esta configuración aplicará a todas las actividades (Rifas, Bingos, Ventas, Eventos, Otros)
                      </p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          @click="configCierre.actividades.general = 'equitativa'"
                          :class="[
                            'relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden',
                            configCierre.actividades.general === 'equitativa'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-200'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center gap-3 mb-2 min-w-0">
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
                                  'font-bold text-sm block truncate',
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
                              'text-xs break-words',
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
                            'relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden',
                            configCierre.actividades.general === 'proporcional'
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20 ring-2 ring-purple-200'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                          ]"
                        >
                          <div class="flex items-center gap-3 mb-2 min-w-0">
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
                                  'font-bold text-sm block truncate',
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
                              'text-xs break-words',
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
                      <p class="text-xs text-gray-500 mb-3 break-words">
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
                              'relative p-3 rounded-lg border-2 transition-all duration-200 text-left overflow-hidden',
                              configCierre.actividades[tipo.valor] === 'equitativa'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                                : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-white'
                            ]"
                          >
                            <div class="flex items-center gap-2 mb-1 min-w-0">
                              <UsersIcon 
                                class="w-4 h-4 flex-shrink-0" 
                                :class="configCierre.actividades[tipo.valor] === 'equitativa' ? 'text-purple-600' : 'text-gray-400'" 
                              />
                              <span 
                                :class="[
                                  'font-semibold text-xs min-w-0 truncate',
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
                              'relative p-3 rounded-lg border-2 transition-all duration-200 text-left overflow-hidden',
                              configCierre.actividades[tipo.valor] === 'proporcional'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md shadow-purple-500/20'
                                : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-white'
                            ]"
                          >
                            <div class="flex items-center gap-2 mb-1 min-w-0">
                              <ChartBarIcon 
                                class="w-4 h-4 flex-shrink-0" 
                                :class="configCierre.actividades[tipo.valor] === 'proporcional' ? 'text-purple-600' : 'text-gray-400'" 
                              />
                              <span 
                                :class="[
                                  'font-semibold text-xs min-w-0 truncate',
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
                      <BanknotesIcon class="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span class="text-sm sm:text-base">Utilidades de Préstamos</span>
                    </label>
                    <p class="text-xs text-gray-500 mb-3 break-words">
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
                                'font-bold text-sm block truncate',
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
                            'text-xs break-words',
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
                          'relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden',
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
                                'font-bold text-sm block truncate',
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
                            'text-xs break-words',
                            configCierre.prestamos === 'proporcional' ? 'text-amber-600' : 'text-gray-500'
                          ]"
                        >
                          Los intereses se reparten según lo ahorrado por cada socio
                        </p>
                      </button>
                    </div>
                  </div>

                  <!-- Configuración de Sanciones al cierre -->
                  <div class="mb-6">
                    <label class="label font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ExclamationTriangleIcon class="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span class="text-sm sm:text-base">Sanciones al cierre</span>
                    </label>
                    <p class="text-xs text-gray-500 mb-3 break-words">
                      Define cómo se reparten las multas por mora al momento del cierre
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        @click="configCierre.sanciones = 'equitativa'"
                        :class="[
                          'relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden',
                          configCierre.sanciones === 'equitativa'
                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-500/20 ring-2 ring-red-200'
                            : 'border-gray-200 bg-white hover:border-red-300 hover:bg-gray-50'
                        ]"
                      >
                        <div class="flex items-center gap-3 mb-2 min-w-0">
                          <div 
                            :class="[
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                              configCierre.sanciones === 'equitativa'
                                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                                : 'bg-gray-100 border-2 border-gray-200'
                            ]"
                          >
                            <UsersIcon class="w-5 h-5" :class="configCierre.sanciones === 'equitativa' ? 'text-white' : 'text-gray-400'" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <span 
                              :class="[
                                'font-bold text-sm block truncate',
                                configCierre.sanciones === 'equitativa' ? 'text-red-700' : 'text-gray-700'
                              ]"
                            >
                              Equitativa
                            </span>
                          </div>
                          <div 
                            v-if="configCierre.sanciones === 'equitativa'"
                            class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"
                          >
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                        <p 
                          :class="[
                            'text-xs break-words',
                            configCierre.sanciones === 'equitativa' ? 'text-red-600' : 'text-gray-500'
                          ]"
                        >
                          Las multas se reparten a partes iguales entre todos los socios
                        </p>
                      </button>
                      <button
                        type="button"
                        @click="configCierre.sanciones = 'proporcional'"
                        :class="[
                          'relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden',
                          configCierre.sanciones === 'proporcional'
                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg shadow-red-500/20 ring-2 ring-red-200'
                            : 'border-gray-200 bg-white hover:border-red-300 hover:bg-gray-50'
                        ]"
                      >
                        <div class="flex items-center gap-3 mb-2 min-w-0">
                          <div 
                            :class="[
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                              configCierre.sanciones === 'proporcional'
                                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                                : 'bg-gray-100 border-2 border-gray-200'
                            ]"
                          >
                            <ChartBarIcon class="w-5 h-5" :class="configCierre.sanciones === 'proporcional' ? 'text-white' : 'text-gray-400'" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <span 
                              :class="[
                                'font-bold text-sm block truncate',
                                configCierre.sanciones === 'proporcional' ? 'text-red-700' : 'text-gray-700'
                              ]"
                            >
                              Proporcional
                            </span>
                          </div>
                          <div 
                            v-if="configCierre.sanciones === 'proporcional'"
                            class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0"
                          >
                            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                        <p 
                          :class="[
                            'text-xs break-words',
                            configCierre.sanciones === 'proporcional' ? 'text-red-600' : 'text-gray-500'
                          ]"
                        >
                          Las multas se reparten según lo ahorrado por cada socio
                        </p>
                      </button>
                    </div>
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
            {{ guardandoBasica ? 'Guardando...' : 'Guardar toda la configuración' }}
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
                <div class="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 overflow-visible">
                  <button
                    @click="tipoMensajeActivo = 'individual'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'individual'
                        ? 'border-green-500 text-green-700 bg-green-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <UserIcon class="w-5 h-5 flex-shrink-0" />
                    <span>Individual</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'general'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'general'
                        ? 'border-purple-500 text-purple-700 bg-purple-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <UsersIcon class="w-5 h-5 flex-shrink-0" />
                    <span>General</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'mora'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'mora'
                        ? 'border-red-500 text-red-700 bg-red-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0" />
                    <span>En Mora</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'pendiente'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'pendiente'
                        ? 'border-amber-500 text-amber-700 bg-amber-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <ClockIcon class="w-5 h-5 flex-shrink-0" />
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
import { useCuotasStore } from '../../stores/cuotas'
import { supabase } from '../../lib/supabase'
import ColaboradoresManager from '../../components/ColaboradoresManager.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
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
  BanknotesIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const natillerasStore = useNatillerasStore()
const configStore = useConfiguracionStore()
const usersStore = useUsersStore()
const colaboradoresStore = useColaboradoresStore()
const cuotasStore = useCuotasStore()
const guardandoBasica = ref(false)
useBodyScrollLock(guardandoBasica)
const guardandoPeriodo = ref(false)
const guardandoDiasGracia = ref(false)
const guardandoMensajes = ref(false)
const guardandoSanciones = ref(false)
const guardandoReasignacion = ref(false)
const mensaje = ref(null)
const textareaIndividual = ref(null)
const seccionActiva = ref('basica') // 'basica' por defecto (Configuración General desplegada), 'mensajes', 'reasignar', 'colaboradores' o null
const tabGeneralActiva = ref('basica') // 'basica' | 'periodo' | 'cierre' | 'sanciones' (tabs dentro de Configuración General)
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
  prestamos: 'equitativa', // 'equitativa' o 'proporcional'
  sanciones: 'equitativa' // 'equitativa' o 'proporcional'
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
  tipo: 'simple', // 'simple', 'escalonada' o 'diaria'
  valorFijo: 5000, // Para tipo simple
  valorPorDia: 500, // Para tipo diaria
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

  const reglasMultasActuales = natillera.value?.reglas_multas || {}
  const payload = {
    nombre: configBasica.value.nombre.trim(),
    descripcion: configBasica.value.descripcion?.trim() || null,
    periodicidad: configBasica.value.periodicidad,
    fecha_inicio: configBasica.value.fecha_inicio,
    cuotas_automaticas: configCuotasAuto.value.activo,
    config_cierre: {
      modoActividades: configCierre.value.modoActividades,
      actividades: configCierre.value.actividades,
      prestamos: configCierre.value.prestamos,
      sanciones: configCierre.value.sanciones
    },
    mes_inicio: configPeriodo.value.mes_inicio,
    anio_inicio: configPeriodo.value.anio_inicio,
    mes_fin: configPeriodo.value.mes_fin,
    anio: configPeriodo.value.anio,
    reglas_multas: {
      ...reglasMultasActuales,
      dias_gracia: configDiasGracia.value.dias_gracia,
      sanciones: {
        activa: configSanciones.value.activa,
        tipo: configSanciones.value.tipo,
        valorFijo: configSanciones.value.valorFijo,
        valorPorDia: configSanciones.value.tipo === 'diaria' ? configSanciones.value.valorPorDia : undefined,
        niveles: configSanciones.value.niveles,
        interesesAdicionales: configSanciones.value.interesesAdicionales,
        devolucion: configSanciones.value.devolucion
      }
    }
  }
  
  const result = await natillerasStore.actualizarNatillera(id.value, payload)
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración general guardada correctamente'
    }
    await natillerasStore.fetchNatillera(id.value)
    actualizarValoresDesdeNatillera()
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración'
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
    // Si se desactivaron las sanciones, poner a 0 valor_multa en todas las cuotas (mora/pendiente/parcial)
    if (!configSanciones.value.activa) {
      const limpieza = await cuotasStore.limpiarSancionesNatillera(id.value)
      if (limpieza.actualizadas > 0) {
        mensaje.value.texto = `Configuración guardada. Se quitaron las sanciones a ${limpieza.actualizadas} cuota(s).`
      }
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
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
      prestamos: configCierreActual.prestamos || 'equitativa',
      sanciones: configCierreActual.sanciones || 'equitativa'
    }
    
    // Cargar configuración de sanciones
    const sanciones = reglasMultas.sanciones || {}
    if (Object.keys(sanciones).length > 0) {
      configSanciones.value = {
        activa: sanciones.activa || false,
        tipo: sanciones.tipo || 'simple',
        valorFijo: sanciones.valorFijo || 5000,
        valorPorDia: sanciones.valorPorDia ?? 500,
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


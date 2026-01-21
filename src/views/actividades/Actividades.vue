<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <Breadcrumbs />
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <BackButton :to="`/natilleras/${id}`" />
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10 pt-12 sm:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 flex-shrink-0">
              <CalendarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Actividades
              </h1>
              <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                Rifas, eventos y otras actividades del fondo
              </p>
            </div>
          </div>
          <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            Nueva Actividad
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border border-green-200/50 shadow-lg hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-1">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalIngresos) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Ingresos</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 border border-red-200/50 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-2">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/15 to-rose-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalGastos) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Gastos</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border border-purple-200/50 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-3">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-indigo-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(utilidadTotal) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Utilidad</p>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="actividades.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center shadow-lg shadow-accent-500/30">
          <CalendarIcon class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
          No hay actividades registradas
        </h3>
        <p class="text-gray-600 mb-8 text-sm sm:text-base">
          Las actividades generan fondos adicionales para la natillera
        </p>
        <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <PlusIcon class="w-5 h-5" />
          Crear Actividad
        </button>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:gap-5 lg:grid-cols-2">
      <div 
        v-for="actividad in actividades" 
        :key="actividad.id"
        @click="actividad.estado === 'en_curso' ? verDetalleActividad(actividad) : null"
        :class="[
          'group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6',
          actividad.estado === 'en_curso' ? 'cursor-pointer' : ''
        ]"
      >
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <component :is="getIconoActividad(actividad.tipo)" class="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 class="font-display font-semibold text-gray-800 text-lg">
                  {{ actividad.descripcion }}
                </h3>
                <p class="text-sm text-gray-500 font-medium">
                  {{ formatDate(actividad.created_at) }}
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-1 items-end">
              <span class="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200">
                {{ actividad.tipo || 'Otro' }}
              </span>
              <span 
                v-if="actividad.estado === 'en_curso'"
                class="px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200"
              >
                En curso
              </span>
            </div>
          </div>

          <!-- Vista para actividades liquidadas -->
          <template v-if="actividad.estado === 'liquidada' || !actividad.estado">
            <div class="grid grid-cols-3 gap-3 sm:gap-4">
              <div class="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50/50 rounded-xl p-3 sm:p-4 border border-green-200/50 backdrop-blur-sm">
                <p class="text-xs text-gray-500 font-medium mb-1">Ingresos</p>
                <p class="font-bold text-green-600 text-sm sm:text-base">${{ formatMoney(actividad.ingresos) }}</p>
              </div>
              <div class="relative bg-gradient-to-br from-red-50 via-rose-50 to-red-50/50 rounded-xl p-3 sm:p-4 border border-red-200/50 backdrop-blur-sm">
                <p class="text-xs text-gray-500 font-medium mb-1">Gastos</p>
                <p class="font-bold text-red-600 text-sm sm:text-base">${{ formatMoney(actividad.gastos) }}</p>
              </div>
              <div class="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50/50 rounded-xl p-3 sm:p-4 border border-purple-200/50 backdrop-blur-sm">
                <p class="text-xs text-gray-500 font-medium mb-1">Utilidad</p>
                <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(actividad.utilidad) }}</p>
              </div>
            </div>
          </template>

          <!-- Vista para actividades en curso -->
          <template v-else>
            <div class="grid grid-cols-3 gap-3 sm:gap-4">
              <div class="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50/50 rounded-xl p-3 sm:p-4 border border-amber-200/50 backdrop-blur-sm">
                <p class="text-xs text-gray-500 font-medium mb-1">Fecha límite</p>
                <p class="font-bold text-amber-700 text-sm sm:text-base">
                  {{ actividad.fecha_limite_pago ? formatDate(actividad.fecha_limite_pago) : 'No definida' }}
                </p>
              </div>
              <div class="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50/50 rounded-xl p-3 sm:p-4 border border-blue-200/50 backdrop-blur-sm">
                <p class="text-xs text-gray-500 font-medium mb-1">Total asignado</p>
                <p class="font-bold text-blue-600 text-sm sm:text-base">${{ formatMoney(actividad.total_asignado || 0) }}</p>
              </div>
              <div class="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50/50 rounded-xl p-3 sm:p-4 border border-green-200/50 backdrop-blur-sm">
                <p class="text-xs text-gray-500 font-medium mb-1">Total recaudado</p>
                <p class="font-bold text-green-600 text-sm sm:text-base">${{ formatMoney(actividad.total_pagado || 0) }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Actividad -->
    <div v-if="modalNuevaActividad" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalNuevaActividad = false"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-accent-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Nueva Actividad
                </h3>
                <p class="text-white/90 text-xs">Registra una nueva actividad del fondo</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto">
          <form @submit.prevent="handleCrearActividad" class="p-4 sm:p-6 space-y-4">
            <!-- Selector de tipo de proceso -->
            <div>
              <label class="label mb-3 block">Tipo de proceso *</label>
              <div class="grid grid-cols-2 gap-3">
                <!-- Opción: Liquidar Actividad -->
                <button
                  type="button"
                  @click="formActividad.tipoProceso = 'liquidar'; resetearFormularioPorTipo()"
                  :class="[
                    'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    formActividad.tipoProceso === 'liquidar'
                      ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                      formActividad.tipoProceso === 'liquidar'
                        ? 'bg-natillera-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    ]">
                      <CurrencyDollarIcon class="w-6 h-6" />
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-800 mb-1">💰 Liquidar Actividad</h4>
                      <p class="text-xs text-gray-600 leading-relaxed">
                        Para ingresar valores directamente de la actividad (Ingresos, gastos y utilidad)
                      </p>
                    </div>
                    <div v-if="formActividad.tipoProceso === 'liquidar'" class="flex-shrink-0">
                      <div class="w-5 h-5 rounded-full bg-natillera-500 flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                <!-- Opción: Actividad en curso -->
                <button
                  type="button"
                  @click="formActividad.tipoProceso = 'en_curso'; resetearFormularioPorTipo()"
                  :class="[
                    'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                    formActividad.tipoProceso === 'en_curso'
                      ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <div :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                      formActividad.tipoProceso === 'en_curso'
                        ? 'bg-natillera-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    ]">
                      <CalendarIcon class="w-6 h-6" />
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold text-gray-800 mb-1">🔄 Actividad en curso</h4>
                      <p class="text-xs text-gray-600 leading-relaxed">
                        Para crear una actividad en la que apenas se va a recoger el dinero
                      </p>
                    </div>
                    <div v-if="formActividad.tipoProceso === 'en_curso'" class="flex-shrink-0">
                      <div class="w-5 h-5 rounded-full bg-natillera-500 flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label class="label">Tipo de actividad</label>
              <select v-model="formActividad.tipo" class="input-field">
                <option value="rifa">🎟️ Rifa</option>
                <option value="bingo">🎱 Bingo</option>
                <option value="venta">🛒 Venta</option>
                <option value="evento">🎉 Evento</option>
                <option value="otro">📋 Otro</option>
              </select>
            </div>

            <div>
              <label class="label">Descripción *</label>
              <input 
                v-model="formActividad.descripcion"
                type="text" 
                class="input-field"
                placeholder="Ej: Rifa de Navidad 2025"
                required
              />
            </div>

            <!-- Formulario para Liquidar Actividad -->
            <template v-if="formActividad.tipoProceso === 'liquidar'">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Ingresos *</label>
                  <div class="relative">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                      $
                    </div>
                    <input 
                      v-model.number="formActividad.ingresos"
                      type="number" 
                      class="input-field pl-10 text-lg font-semibold"
                      placeholder="150000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label class="label">Gastos</label>
                  <div class="relative">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                      $
                    </div>
                    <input 
                      v-model.number="formActividad.gastos"
                      type="number" 
                      class="input-field pl-10 text-lg font-semibold"
                      placeholder="20000"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div class="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50/50 border-2 border-purple-200 rounded-xl p-4 overflow-hidden">
                <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-indigo-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                <div class="relative z-10">
                  <p class="text-sm text-gray-600 font-medium mb-1">Utilidad estimada:</p>
                  <p class="font-bold text-2xl text-purple-600">
                    ${{ formatMoney((formActividad.ingresos || 0) - (formActividad.gastos || 0)) }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Formulario para Actividad en curso -->
            <template v-else>
              <div>
                <label class="label">Fecha límite para pago *</label>
                <DateInput 
                  v-model="formActividad.fechaLimitePago"
                  placeholder="Seleccione la fecha límite"
                  required
                />
              </div>

              <!-- Selector de tipo de valores -->
              <div>
                <label class="label mb-3 block">Asignación de valores</label>
                <div class="grid grid-cols-2 gap-3">
                  <!-- Opción: Valores iguales -->
                  <button
                    type="button"
                    @click="formActividad.tipoValores = 'iguales'; aplicarValorIgual()"
                    :class="[
                      'relative p-3 rounded-xl border-2 transition-all duration-200 text-left',
                      formActividad.tipoValores === 'iguales'
                        ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    ]"
                  >
                    <div class="flex items-center gap-2">
                      <div :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                        formActividad.tipoValores === 'iguales'
                          ? 'bg-natillera-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      ]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-bold text-sm text-gray-800">Valores iguales</h4>
                        <p class="text-xs text-gray-600">Mismo valor para todos</p>
                      </div>
                      <div v-if="formActividad.tipoValores === 'iguales'" class="flex-shrink-0">
                        <div class="w-4 h-4 rounded-full bg-natillera-500 flex items-center justify-center">
                          <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>

                  <!-- Opción: Valores diferentes -->
                  <button
                    type="button"
                    @click="formActividad.tipoValores = 'diferentes'; limpiarValorIgual(); fetchSocios()"
                    :class="[
                      'relative p-3 rounded-xl border-2 transition-all duration-200 text-left',
                      formActividad.tipoValores === 'diferentes'
                        ? 'border-natillera-500 bg-gradient-to-br from-natillera-50 to-emerald-50 shadow-lg shadow-natillera-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    ]"
                  >
                    <div class="flex items-center gap-2">
                      <div :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                        formActividad.tipoValores === 'diferentes'
                          ? 'bg-natillera-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      ]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-bold text-sm text-gray-800">Valores diferentes</h4>
                        <p class="text-xs text-gray-600">Valor individual por socio</p>
                      </div>
                      <div v-if="formActividad.tipoValores === 'diferentes'" class="flex-shrink-0">
                        <div class="w-4 h-4 rounded-full bg-natillera-500 flex items-center justify-center">
                          <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Campo único para valores iguales -->
              <div v-if="formActividad.tipoValores === 'iguales'">
                <label class="label">Valor a pagar por socio *</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                    $
                  </div>
                  <input 
                    v-model.number="formActividad.valorIgual"
                    type="number" 
                    class="input-field pl-10 text-lg font-semibold"
                    placeholder="50000"
                    min="0"
                    step="0.01"
                    @input="aplicarValorIgual()"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Total a recaudar: <span class="font-bold text-natillera-600">${{ formatMoney(totalARecaudar) }}</span>
                  <span class="text-gray-400"> ({{ socios.length }} socios)</span>
                </p>
              </div>

              <!-- Lista de socios para valores diferentes -->
              <div v-else>
                <label class="label mb-2 block">Valor a pagar por socio</label>
                <div v-if="socios.length === 0" class="text-sm text-gray-500 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  No hay socios activos en esta natillera
                </div>
                <div v-else class="space-y-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-xl">
                  <div 
                    v-for="socio in socios" 
                    :key="socio.id"
                    class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-natillera-300 transition-colors"
                  >
                    <div class="flex-1">
                      <p class="font-semibold text-gray-800">{{ socio.socio?.nombre || 'Sin nombre' }}</p>
                      <p class="text-xs text-gray-500">{{ socio.socio?.telefono || '' }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="relative">
                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold z-10">
                          $
                        </div>
                        <input 
                          v-model.number="formActividad.valoresPorSocio[socio.id]"
                          type="number" 
                          class="input-field pl-8 w-32 text-sm font-semibold"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Total a recaudar: <span class="font-bold text-natillera-600">${{ formatMoney(totalARecaudar) }}</span>
                </p>
              </div>
            </template>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalNuevaActividad = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleCrearActividad" 
              class="btn-accent flex-1"
              :disabled="loading"
            >
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Actividad en Curso -->
    <div v-if="modalDetalleActividad && actividadSeleccionada" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalleActividad = false"></div>
      <div class="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-accent-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <CalendarIcon class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-display font-bold">
                    {{ actividadSeleccionada.descripcion }}
                  </h3>
                  <p class="text-white/90 text-xs">Detalle de actividad en curso</p>
                </div>
              </div>
              <button 
                @click="modalDetalleActividad = false"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Información general -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50/50 rounded-xl p-4 border border-amber-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">Fecha límite</p>
              <p class="font-bold text-amber-700 text-base">
                {{ actividadSeleccionada.fecha_limite_pago ? formatDate(actividadSeleccionada.fecha_limite_pago) : 'No definida' }}
              </p>
            </div>
            <div class="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50/50 rounded-xl p-4 border border-blue-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">Total asignado</p>
              <p class="font-bold text-blue-600 text-base">${{ formatMoney(actividadSeleccionada.total_asignado || 0) }}</p>
            </div>
            <div class="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50/50 rounded-xl p-4 border border-green-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">Total recaudado</p>
              <p class="font-bold text-green-600 text-base">${{ formatMoney(actividadSeleccionada.total_pagado || 0) }}</p>
            </div>
          </div>

          <!-- Lista de socios -->
          <div>
            <h4 class="font-bold text-gray-800 mb-4">Socios participantes</h4>
            <div v-if="sociosActividad.length === 0" class="text-center py-8 text-gray-500">
              <p>No hay socios asignados a esta actividad</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="socioAct in sociosActividad" 
                :key="socioAct.id"
                class="flex items-center justify-between p-4 bg-white rounded-xl border-2 transition-all"
                :class="{
                  'border-green-200 bg-green-50/30': socioAct.estado === 'pagado',
                  'border-amber-200 bg-amber-50/30': socioAct.estado === 'parcial',
                  'border-red-200 bg-red-50/30': socioAct.estado === 'mora',
                  'border-gray-200 bg-gray-50/30': socioAct.estado === 'pendiente'
                }"
              >
                <div class="flex-1">
                  <p class="font-semibold text-gray-800">{{ socioAct.socio_natillera?.socio?.nombre || 'Sin nombre' }}</p>
                  <p class="text-xs text-gray-500">{{ socioAct.socio_natillera?.socio?.telefono || '' }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-xs text-gray-500 mb-1">Asignado</p>
                    <p class="font-bold text-gray-800">${{ formatMoney(socioAct.valor_asignado) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-500 mb-1">Pagado</p>
                    <p class="font-bold text-green-600">${{ formatMoney(socioAct.valor_pagado || 0) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-500 mb-1">Pendiente</p>
                    <p class="font-bold text-red-600">${{ formatMoney((socioAct.valor_asignado || 0) - (socioAct.valor_pagado || 0)) }}</p>
                  </div>
                  <div>
                    <span 
                      class="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                      :class="{
                        'bg-green-100 text-green-700 border border-green-200': socioAct.estado === 'pagado',
                        'bg-amber-100 text-amber-700 border border-amber-200': socioAct.estado === 'parcial',
                        'bg-red-100 text-red-700 border border-red-200': socioAct.estado === 'mora',
                        'bg-gray-100 text-gray-700 border border-gray-200': socioAct.estado === 'pendiente'
                      }"
                    >
                      {{ getEstadoLabel(socioAct.estado) }}
                    </span>
                  </div>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import DateInput from '../../components/DateInput.vue'
import { 
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  TicketIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const notificationStore = useNotificationStore()

const props = defineProps({
  id: String
})

const route = useRoute()
const id = props.id || route.params.id

const actividades = ref([])
const loading = ref(false)
const modalNuevaActividad = ref(false)
const modalDetalleActividad = ref(false)
const actividadSeleccionada = ref(null)
const sociosActividad = ref([])
const socios = ref([])

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalNuevaActividad)
useBodyScrollLock(modalDetalleActividad)

const formActividad = reactive({
  tipoProceso: 'liquidar', // 'liquidar' o 'en_curso'
  tipo: 'rifa',
  descripcion: '',
  ingresos: 0,
  gastos: 0,
  fechaLimitePago: '',
  tipoValores: 'iguales', // 'iguales' o 'diferentes'
  valorIgual: 0, // Valor único cuando tipoValores es 'iguales'
  valoresPorSocio: {} // { socio_natillera_id: valor }
})

const totalIngresos = computed(() => 
  actividades.value.reduce((sum, a) => {
    if (a.estado === 'en_curso') {
      return sum + (a.total_pagado || 0) // Para actividades en curso, usar lo recaudado
    }
    return sum + (a.ingresos || 0)
  }, 0)
)

const totalGastos = computed(() => 
  actividades.value.reduce((sum, a) => sum + (a.gastos || 0), 0)
)

const utilidadTotal = computed(() => 
  actividades.value.reduce((sum, a) => {
    if (a.estado === 'en_curso') {
      // Para actividades en curso, la utilidad es lo recaudado menos gastos (si los hay)
      return sum + ((a.total_pagado || 0) - (a.gastos || 0))
    }
    return sum + (a.utilidad || 0)
  }, 0)
)

const totalARecaudar = computed(() => {
  if (formActividad.tipoProceso === 'en_curso' && formActividad.tipoValores === 'iguales') {
    return (formActividad.valorIgual || 0) * socios.value.length
  }
  return Object.values(formActividad.valoresPorSocio).reduce((sum, valor) => sum + (Number(valor) || 0), 0)
})

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function getIconoActividad(tipo) {
  const iconos = {
    rifa: TicketIcon,
    bingo: SparklesIcon,
    venta: ShoppingBagIcon,
    evento: CalendarIcon,
    otro: ClipboardDocumentListIcon
  }
  return iconos[tipo] || ClipboardDocumentListIcon
}

function getEstadoLabel(estado) {
  const labels = {
    pendiente: 'Pendiente',
    parcial: 'Parcial',
    pagado: 'Pagado',
    mora: 'En Mora'
  }
  return labels[estado] || estado
}

async function verDetalleActividad(actividad) {
  actividadSeleccionada.value = actividad
  modalDetalleActividad.value = true
  
  // Cargar socios de la actividad
  try {
    const { data, error } = await supabase
      .from('socios_actividad')
      .select(`
        *,
        socio_natillera:socios_natillera(
          *,
          socio:socios(*)
        )
      `)
      .eq('actividad_id', actividad.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    // Actualizar estados a mora si es necesario
    const fechaLimite = actividad.fecha_limite_pago
    if (fechaLimite) {
      const fechaLimiteDate = new Date(fechaLimite)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      fechaLimiteDate.setHours(0, 0, 0, 0)
      
      if (hoy > fechaLimiteDate) {
        // Actualizar estados a mora para los que no están pagados
        const sociosEnMora = data.filter(sa => 
          sa.estado !== 'pagado' && sa.valor_pagado < sa.valor_asignado
        )
        
        if (sociosEnMora.length > 0) {
          const idsEnMora = sociosEnMora.map(sa => sa.id)
          await supabase
            .from('socios_actividad')
            .update({ estado: 'mora' })
            .in('id', idsEnMora)
          
          // Recargar datos
          const { data: dataActualizada } = await supabase
            .from('socios_actividad')
            .select(`
              *,
              socio_natillera:socios_natillera(
                *,
                socio:socios(*)
              )
            `)
            .eq('actividad_id', actividad.id)
            .order('created_at', { ascending: true })
          
          sociosActividad.value = dataActualizada || []
          return
        }
      }
    }
    
    sociosActividad.value = data || []
  } catch (e) {
    console.error('Error cargando socios de actividad:', e)
    sociosActividad.value = []
  }
}

async function fetchActividades() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('natillera_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Para actividades en curso, cargar información de socios_actividad y actualizar estados
    const actividadesConTotales = await Promise.all(
      (data || []).map(async (actividad) => {
        if (actividad.estado === 'en_curso') {
          // Obtener totales de socios_actividad
          const { data: sociosActividad, error: errorSocios } = await supabase
            .from('socios_actividad')
            .select('id, valor_asignado, valor_pagado, estado')
            .eq('actividad_id', actividad.id)

          if (!errorSocios && sociosActividad) {
            // Actualizar estados a mora si es necesario
            const fechaLimite = actividad.fecha_limite_pago
            if (fechaLimite) {
              const fechaLimiteDate = new Date(fechaLimite)
              const hoy = new Date()
              hoy.setHours(0, 0, 0, 0)
              fechaLimiteDate.setHours(0, 0, 0, 0)
              
              if (hoy > fechaLimiteDate) {
                // Actualizar estados a mora para los que no están pagados
                const sociosEnMora = sociosActividad.filter(sa => 
                  sa.estado !== 'pagado' && sa.valor_pagado < sa.valor_asignado
                )
                
                if (sociosEnMora.length > 0) {
                  const idsEnMora = sociosEnMora.map(sa => sa.id)
                  await supabase
                    .from('socios_actividad')
                    .update({ estado: 'mora' })
                    .in('id', idsEnMora)
                  
                  // Actualizar estados en el array local
                  sociosActividad.forEach(sa => {
                    if (idsEnMora.includes(sa.id)) {
                      sa.estado = 'mora'
                    }
                  })
                }
              }
            }
            
            const totalAsignado = sociosActividad.reduce((sum, sa) => sum + (Number(sa.valor_asignado) || 0), 0)
            const totalPagado = sociosActividad.reduce((sum, sa) => sum + (Number(sa.valor_pagado) || 0), 0)
            
            return {
              ...actividad,
              total_asignado: totalAsignado,
              total_pagado: totalPagado
            }
          }
        }
        return actividad
      })
    )
    
    actividades.value = actividadesConTotales
  } catch (e) {
    console.error('Error cargando actividades:', e)
  } finally {
    loading.value = false
  }
}

async function fetchSocios() {
  try {
    const { data, error } = await supabase
      .from('socios_natillera')
      .select(`
        *,
        socio:socios(*)
      `)
      .eq('natillera_id', id)
      .eq('estado', 'activo')
      .order('created_at', { ascending: true })

    if (error) throw error
    socios.value = data || []
    
    // Inicializar valores por socio
    if (formActividad.tipoProceso === 'en_curso') {
      if (formActividad.tipoValores === 'iguales' && formActividad.valorIgual) {
        // Aplicar valor igual a todos
        socios.value.forEach(socio => {
          formActividad.valoresPorSocio[socio.id] = formActividad.valorIgual
        })
      } else {
        // Inicializar en 0 para valores diferentes
        socios.value.forEach(socio => {
          if (!formActividad.valoresPorSocio[socio.id]) {
            formActividad.valoresPorSocio[socio.id] = 0
          }
        })
      }
    }
  } catch (e) {
    console.error('Error cargando socios:', e)
    socios.value = []
  }
}

function resetearFormularioPorTipo() {
  if (formActividad.tipoProceso === 'liquidar') {
    formActividad.fechaLimitePago = ''
    formActividad.tipoValores = 'iguales'
    formActividad.valorIgual = 0
    formActividad.valoresPorSocio = {}
  } else {
    formActividad.ingresos = 0
    formActividad.gastos = 0
    formActividad.tipoValores = 'iguales'
    formActividad.valorIgual = 0
    // Cargar socios siempre para asegurar que estén actualizados
    fetchSocios()
  }
}

function aplicarValorIgual() {
  if (formActividad.tipoValores === 'iguales' && socios.value.length > 0) {
    const valor = formActividad.valorIgual || 0
    socios.value.forEach(socio => {
      formActividad.valoresPorSocio[socio.id] = valor
    })
  }
}

function limpiarValorIgual() {
  // Limpiar valores cuando se cambia a diferentes
  socios.value.forEach(socio => {
    formActividad.valoresPorSocio[socio.id] = 0
  })
}

async function handleCrearActividad() {
  loading.value = true
  try {
    // Validaciones básicas
    if (!formActividad.descripcion || formActividad.descripcion.trim() === '') {
      loading.value = false
      notificationStore.error('La descripción es requerida', 'Error')
      return
    }

    if (formActividad.tipoProceso === 'liquidar') {
      // Validaciones para Liquidar Actividad
      if (!formActividad.ingresos || formActividad.ingresos <= 0) {
        loading.value = false
        notificationStore.error('Los ingresos son requeridos y deben ser mayor a cero', 'Error')
        return
      }
    } else {
      // Validaciones para Actividad en curso
      if (!formActividad.fechaLimitePago || formActividad.fechaLimitePago.trim() === '') {
        loading.value = false
        notificationStore.error('La fecha límite de pago es requerida', 'Error')
        return
      }
      
      // Verificar que haya socios activos
      if (socios.value.length === 0) {
        loading.value = false
        notificationStore.error('No hay socios activos en esta natillera', 'Error')
        return
      }
      
      if (formActividad.tipoValores === 'iguales') {
        if (!formActividad.valorIgual || formActividad.valorIgual <= 0) {
          loading.value = false
          notificationStore.error('Debe ingresar un valor mayor a cero para cada socio', 'Error')
          return
        }
        // Aplicar el valor igual a todos los socios
        aplicarValorIgual()
      } else {
        // Validar valores diferentes
        const valoresConValor = Object.entries(formActividad.valoresPorSocio)
          .filter(([_, valor]) => valor && Number(valor) > 0)
        
        if (valoresConValor.length === 0) {
          loading.value = false
          notificationStore.error('Debe asignar al menos un valor a pagar para algún socio', 'Error')
          return
        }
      }
    }

    // Crear la actividad
    const actividadData = {
      natillera_id: id,
      tipo: formActividad.tipo,
      descripcion: formActividad.descripcion,
      estado: formActividad.tipoProceso === 'liquidar' ? 'liquidada' : 'en_curso',
      ingresos: formActividad.tipoProceso === 'liquidar' ? (formActividad.ingresos || 0) : 0,
      gastos: formActividad.tipoProceso === 'liquidar' ? (formActividad.gastos || 0) : 0,
      utilidad: formActividad.tipoProceso === 'liquidar' 
        ? ((formActividad.ingresos || 0) - (formActividad.gastos || 0))
        : 0,
      fecha_limite_pago: formActividad.tipoProceso === 'en_curso' ? formActividad.fechaLimitePago : null
    }

    const { data: actividad, error: errorActividad } = await supabase
      .from('actividades')
      .insert(actividadData)
      .select()
      .single()

    if (errorActividad) throw errorActividad

    // Si es actividad en curso, crear los registros en socios_actividad
    if (formActividad.tipoProceso === 'en_curso') {
      // Asegurar que todos los valores estén aplicados
      if (formActividad.tipoValores === 'iguales' && formActividad.valorIgual) {
        aplicarValorIgual()
      }
      
      // Obtener todos los socios activos y crear registros
      const sociosActividadData = []
      
      if (formActividad.tipoValores === 'iguales') {
        // Para valores iguales, crear registro para todos los socios
        socios.value.forEach(socio => {
          sociosActividadData.push({
            actividad_id: actividad.id,
            socio_natillera_id: socio.id,
            valor_asignado: Number(formActividad.valorIgual),
            valor_pagado: 0,
            estado: 'pendiente'
          })
        })
      } else {
        // Para valores diferentes, solo los que tienen valor asignado
        Object.entries(formActividad.valoresPorSocio)
          .filter(([_, valor]) => valor && Number(valor) > 0)
          .forEach(([socioNatilleraId, valor]) => {
            sociosActividadData.push({
              actividad_id: actividad.id,
              socio_natillera_id: socioNatilleraId,
              valor_asignado: Number(valor),
              valor_pagado: 0,
              estado: 'pendiente'
            })
          })
      }

      if (sociosActividadData.length > 0) {
        const { error: errorSociosActividad } = await supabase
          .from('socios_actividad')
          .insert(sociosActividadData)

        if (errorSociosActividad) {
          console.error('Error creando socios_actividad:', errorSociosActividad)
          throw errorSociosActividad
        }
      } else {
        loading.value = false
        notificationStore.error('No se pudo crear la actividad. No hay socios asignados.', 'Error')
        return
      }
    }
    
    actividades.value.unshift(actividad)
    modalNuevaActividad.value = false
    
    // Resetear formulario
    formActividad.tipoProceso = 'liquidar'
    formActividad.tipo = 'rifa'
    formActividad.descripcion = ''
    formActividad.ingresos = 0
    formActividad.gastos = 0
    formActividad.fechaLimitePago = ''
    formActividad.tipoValores = 'iguales'
    formActividad.valorIgual = 0
    formActividad.valoresPorSocio = {}
    
    // Recargar actividades
    await fetchActividades()
    
    notificationStore.success('Actividad creada exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error al crear actividad:', e)
    notificationStore.error(e.message || 'Error al crear la actividad', 'Error')
  } finally {
    loading.value = false
  }
}

// Cargar socios cuando se abre el modal y es actividad en curso
watch(modalNuevaActividad, (isOpen) => {
  if (isOpen) {
    if (formActividad.tipoProceso === 'en_curso') {
      fetchSocios()
    }
  } else {
    // Limpiar valores cuando se cierra el modal
    formActividad.valoresPorSocio = {}
    formActividad.valorIgual = 0
  }
})

onMounted(() => {
  fetchActividades()
})
</script>


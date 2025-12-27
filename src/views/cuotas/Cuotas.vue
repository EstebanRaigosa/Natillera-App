<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <router-link 
          :to="`/natilleras/${id}`" 
          class="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white text-natillera-700 font-semibold rounded-lg border border-natillera-200 shadow-sm hover:bg-natillera-50 hover:border-natillera-300 transition-all mb-2 sm:mb-3 text-sm sm:text-base"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Volver a natillera
        </router-link>
        <h1 class="text-2xl sm:text-3xl font-display font-bold text-gray-800">
          Cuotas y Pagos
        </h1>
        <p class="text-gray-500 mt-1 text-sm sm:text-base">
          Gestiona los cobros y registra pagos por mes
        </p>
      </div>
      <button @click="modalGenerarCuotas = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Generar Cuotas
      </button>
    </div>

    <!-- Tabs de meses - Diseño elegante tipo calendario -->
    <div v-if="mesesNatillera.length > 0" class="relative">
      <!-- Contenedor con scroll -->
      <div class="overflow-x-auto pb-4 -mb-4" style="scrollbar-width: none; -ms-overflow-style: none;">
        <div class="flex gap-4 px-1 py-2" style="min-width: max-content;">
          <button
            v-for="(mes, index) in mesesNatillera"
            :key="mes.value"
            @click="mesSeleccionado = mes.value"
            :class="[
              'group relative flex flex-col items-center w-20 sm:w-24 rounded-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden',
              mesSeleccionado === mes.value 
                ? 'scale-110 z-10' 
                : 'hover:scale-105 hover:-translate-y-1'
            ]"
          >
            <!-- Fondo con efecto -->
            <div 
              :class="[
                'absolute inset-0 rounded-2xl transition-all duration-500',
                mesSeleccionado === mes.value 
                  ? 'bg-gradient-to-br from-emerald-400 via-natillera-500 to-teal-600 shadow-2xl shadow-natillera-500/40' 
                  : 'bg-white shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:shadow-natillera-200/50'
              ]"
            ></div>
            
            <!-- Patrón decorativo para el seleccionado -->
            <div 
              v-if="mesSeleccionado === mes.value"
              class="absolute inset-0 opacity-30"
              style="background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%);"
            ></div>

            <!-- Contenido -->
            <div class="relative z-10 py-4 px-3 flex flex-col items-center">
              <!-- Emoji o icono del mes -->
              <span class="text-xl sm:text-2xl mb-1">{{ getMesEmoji(mes.value) }}</span>
              
              <!-- Número del mes -->
              <span 
                :class="[
                  'text-3xl sm:text-4xl font-black leading-none tracking-tight transition-all duration-300',
                  mesSeleccionado === mes.value 
                    ? 'text-white drop-shadow-lg' 
                    : 'text-natillera-600 group-hover:text-natillera-700'
                ]"
              >
                {{ String(mes.value).padStart(2, '0') }}
              </span>
              
              <!-- Nombre del mes -->
              <span 
                :class="[
                  'text-[11px] sm:text-xs font-bold uppercase tracking-widest mt-1 transition-colors',
                  mesSeleccionado === mes.value ? 'text-white/90' : 'text-gray-500 group-hover:text-natillera-600'
                ]"
              >
                {{ mes.label.substring(0, 3) }}
              </span>

              <!-- Indicador de estado con animación -->
              <div class="mt-3 flex items-center justify-center">
                <!-- Pendientes/Mora -->
                <span 
                  v-if="getResumenMes(mes.value).pendientes + getResumenMes(mes.value).enMora > 0"
                  :class="[
                    'flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold transition-all',
                    mesSeleccionado === mes.value 
                      ? 'bg-white/30 text-white backdrop-blur-sm' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200'
                  ]"
                >
                  {{ getResumenMes(mes.value).pendientes + getResumenMes(mes.value).enMora }}
                </span>
                <!-- Completo -->
                <span 
                  v-else-if="getResumenMes(mes.value).pagadas > 0"
                  :class="[
                    'flex items-center justify-center w-6 h-6 rounded-full transition-all',
                    mesSeleccionado === mes.value 
                      ? 'bg-white/30 text-white' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md shadow-green-200'
                  ]"
                >
                  ✓
                </span>
                <!-- Sin datos -->
                <span 
                  v-else
                  :class="[
                    'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-medium transition-all',
                    mesSeleccionado === mes.value 
                      ? 'bg-white/20 text-white/70' 
                      : 'bg-gray-100 text-gray-400 border border-dashed border-gray-300'
                  ]"
                >
                  —
                </span>
              </div>
            </div>

            <!-- Línea inferior decorativa -->
            <div 
              :class="[
                'absolute bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-500',
                mesSeleccionado === mes.value 
                  ? 'w-12 bg-white/50' 
                  : 'w-0 bg-natillera-400'
              ]"
            ></div>
          </button>
        </div>
      </div>
      
      <!-- Indicadores de scroll (flechas sutiles) -->
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-r from-slate-100 to-transparent pointer-events-none opacity-50"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-slate-100 to-transparent pointer-events-none opacity-50"></div>
    </div>

    <!-- Resumen del mes seleccionado (clickeable para filtrar) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <button 
        @click="filtroEstado = filtroEstado === 'pagada' ? 'todos' : 'pagada'"
        :class="[
          'stat-card cursor-pointer transition-all duration-300',
          filtroEstado === 'pagada' 
            ? 'ring-2 ring-natillera-500 shadow-lg shadow-natillera-500/20 scale-105' 
            : 'hover:shadow-xl hover:-translate-y-1'
        ]"
      >
        <p class="stat-value text-natillera-600">{{ resumenMesActual.pagadas }}</p>
        <p class="stat-label">Pagadas</p>
        <p v-if="filtroEstado === 'pagada'" class="text-xs text-natillera-600 font-semibold mt-1">✓ Filtrado</p>
      </button>
      <button 
        @click="filtroEstado = filtroEstado === 'pendiente' ? 'todos' : 'pendiente'"
        :class="[
          'stat-card cursor-pointer transition-all duration-300',
          filtroEstado === 'pendiente' 
            ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20 scale-105' 
            : 'hover:shadow-xl hover:-translate-y-1'
        ]"
      >
        <p class="stat-value text-amber-600">{{ resumenMesActual.pendientes }}</p>
        <p class="stat-label">Pendientes</p>
        <p v-if="filtroEstado === 'pendiente'" class="text-xs text-amber-600 font-semibold mt-1">✓ Filtrado</p>
      </button>
      <button 
        @click="filtroEstado = filtroEstado === 'mora' ? 'todos' : 'mora'"
        :class="[
          'stat-card cursor-pointer transition-all duration-300',
          filtroEstado === 'mora' 
            ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20 scale-105' 
            : 'hover:shadow-xl hover:-translate-y-1'
        ]"
      >
        <p class="stat-value text-red-600">{{ resumenMesActual.enMora }}</p>
        <p class="stat-label">En Mora</p>
        <p v-if="filtroEstado === 'mora'" class="text-xs text-red-600 font-semibold mt-1">✓ Filtrado</p>
      </button>
      <div class="stat-card">
        <p class="stat-value text-purple-600">{{ resumenMesActual.porcentajeRecaudado.toFixed(0) }}%</p>
        <p class="stat-label">Recaudado</p>
      </div>
    </div>

    <!-- Filtros elegantes con desplegable -->
    <div class="card bg-gradient-to-r from-slate-50 to-gray-50 border-0 shadow-inner">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <!-- Selector de tipo de filtro -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <FunnelIcon class="w-5 h-5 text-gray-400" />
          <div class="relative">
            <select 
              v-model="tipoFiltro"
              class="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:border-natillera-300 focus:border-natillera-500 focus:ring-2 focus:ring-natillera-200 transition-all cursor-pointer appearance-none pr-10"
            >
              <option value="estado">Por Estado</option>
              <option value="periodicidad">Por Periodicidad</option>
              <option value="ambos">Ambos</option>
            </select>
            <ChevronDownIcon class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Botones de filtro dinámicos -->
        <div class="flex flex-wrap gap-2 flex-1">
          <!-- Botón Todos (siempre visible) -->
          <button
            @click="filtroEstado = 'todos'; filtroPeriodicidad = 'todos'"
            :class="[
              'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
              filtroEstado === 'todos' && filtroPeriodicidad === 'todos'
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md'
            ]"
          >
            <div 
              v-if="filtroEstado === 'todos' && filtroPeriodicidad === 'todos'"
              class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900"
            ></div>
            <span class="relative flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :class="filtroEstado === 'todos' && filtroPeriodicidad === 'todos' ? 'bg-white' : 'bg-gray-400'"></span>
              Todos
              <span 
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  filtroEstado === 'todos' && filtroPeriodicidad === 'todos' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                ]"
              >
                {{ cuotasMesActual.length }}
              </span>
            </span>
          </button>

          <!-- Filtros de Estado (si tipoFiltro es 'estado' o 'ambos') -->
          <template v-if="tipoFiltro === 'estado' || tipoFiltro === 'ambos'">
            <!-- Parciales -->
            <button
              @click="filtroEstado = filtroEstado === 'parcial' ? 'todos' : 'parcial'"
              :class="[
                'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
                filtroEstado === 'parcial'
                  ? 'text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroEstado === 'parcial'"
                class="absolute inset-0 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600"
              ></div>
              <span class="relative flex items-center gap-2">
                <span class="w-4 h-4 flex items-center justify-center">
                  <span 
                    :class="[
                      'block w-3 h-3 rounded-full border-2',
                      filtroEstado === 'parcial' ? 'border-white bg-white/30' : 'border-purple-500 bg-purple-200'
                    ]"
                  ></span>
                </span>
                Parciales
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    filtroEstado === 'parcial' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                  ]"
                >
                  {{ resumenMesActual.parciales }}
                </span>
              </span>
            </button>
          </template>

          <!-- Filtros de Periodicidad (si tipoFiltro es 'periodicidad' o 'ambos') -->
          <template v-if="tipoFiltro === 'periodicidad' || tipoFiltro === 'ambos'">
            <!-- Mensual -->
            <button
              @click="filtroPeriodicidad = filtroPeriodicidad === 'mensual' ? 'todos' : 'mensual'"
              :class="[
                'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
                filtroPeriodicidad === 'mensual'
                  ? 'text-white shadow-lg shadow-natillera-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-natillera-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'mensual'"
                class="absolute inset-0 bg-gradient-to-r from-natillera-500 via-emerald-500 to-teal-500"
              ></div>
              <span class="relative flex items-center gap-2">
                <span class="text-lg">📅</span>
                Mensual
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    filtroPeriodicidad === 'mensual' ? 'bg-white/20 text-white' : 'bg-natillera-100 text-natillera-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => !c.quincena).length }}
                </span>
              </span>
            </button>

            <!-- Quincenal -->
            <button
              @click="filtroPeriodicidad = filtroPeriodicidad === 'quincenal' ? 'todos' : 'quincenal'"
              :class="[
                'group relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden',
                filtroPeriodicidad === 'quincenal'
                  ? 'text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              ]"
            >
              <div 
                v-if="filtroPeriodicidad === 'quincenal'"
                class="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"
              ></div>
              <span class="relative flex items-center gap-2">
                <span class="text-lg">🗓️</span>
                Quincenal
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    filtroPeriodicidad === 'quincenal' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                  ]"
                >
                  {{ cuotasMesActual.filter(c => c.quincena).length }}
                </span>
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Lista de cuotas -->
    <div v-if="cuotasStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando cuotas...</p>
    </div>

    <!-- Estado vacío: Sin cuotas generadas para el mes -->
    <div v-else-if="cuotasMesActual.length === 0" class="card text-center py-12">
      <CurrencyDollarIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="font-display font-semibold text-gray-800 text-lg">
        No hay cuotas para {{ mesSeleccionadoLabel }}
      </h3>
      <p class="text-gray-500 mt-2 mb-6">
        Genera las cuotas de este mes para comenzar a registrar pagos
      </p>
      <button @click="modalGenerarCuotas = true" class="btn-primary inline-flex items-center gap-2">
        <PlusIcon class="w-5 h-5" />
        Generar Cuotas de {{ mesSeleccionadoLabel }}
      </button>
    </div>

    <!-- Estado vacío: Sin resultados con el filtro actual -->
    <div v-else-if="cuotasFiltradas.length === 0" class="card text-center py-12">
      <FunnelIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="font-display font-semibold text-gray-800 text-lg">
        No hay cuotas con los filtros seleccionados
      </h3>
      <p class="text-gray-500 mt-2 mb-6">
        No se encontraron cuotas que coincidan con los filtros aplicados
      </p>
      <button 
        @click="filtroEstado = 'todos'; filtroPeriodicidad = 'todos'" 
        class="btn-secondary inline-flex items-center gap-2"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Lista de cuotas filtradas -->
    <div v-else class="space-y-4">
      <!-- Contador de resultados -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Mostrando <span class="font-semibold text-gray-700">{{ cuotasFiltradas.length }}</span> 
          {{ cuotasFiltradas.length === 1 ? 'cuota' : 'cuotas' }}
          <span v-if="filtroEstado !== 'todos' || filtroPeriodicidad !== 'todos'" class="text-natillera-600">
            (
            <span v-if="filtroEstado !== 'todos'">
              {{ filtroEstado === 'pagada' ? 'pagadas' : filtroEstado === 'pendiente' ? 'pendientes' : filtroEstado === 'mora' ? 'en mora' : 'parciales' }}
            </span>
            <span v-if="filtroEstado !== 'todos' && filtroPeriodicidad !== 'todos'"> • </span>
            <span v-if="filtroPeriodicidad !== 'todos'">
              {{ filtroPeriodicidad === 'mensual' ? 'mensuales' : 'quincenales' }}
            </span>
            )
          </span>
        </p>
      </div>

      <div 
        v-for="cuota in cuotasFiltradas" 
        :key="cuota.id"
        class="card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div 
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center relative',
              cuota.estado === 'pagada' ? 'bg-green-100' : 
              cuota.estado === 'mora' ? 'bg-red-100' : 
              cuota.estado === 'parcial' ? 'bg-amber-100' : 'bg-gray-100'
            ]"
          >
            <component 
              :is="cuota.estado === 'pagada' ? CheckCircleIcon : 
                   cuota.estado === 'mora' ? ExclamationCircleIcon : ClockIcon"
              :class="[
                'w-6 h-6',
                cuota.estado === 'pagada' ? 'text-green-600' : 
                cuota.estado === 'mora' ? 'text-red-600' : 
                cuota.estado === 'parcial' ? 'text-amber-600' : 'text-gray-400'
              ]"
            />
            <!-- Badge de quincena (solo para quincenales) -->
            <span 
              v-if="cuota.quincena"
              class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-purple-500 text-white text-[10px] font-bold rounded-full shadow"
            >
              Q{{ cuota.quincena }}
            </span>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-medium text-gray-800">
                {{ cuota.socio_natillera?.socio?.nombre || 'Socio' }}
              </p>
              <!-- Badge de periodicidad -->
              <span 
                v-if="cuota.quincena" 
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200"
              >
                <span class="text-purple-500">🗓️</span>
                {{ cuota.quincena === 1 ? '1ra Quincena' : '2da Quincena' }}
              </span>
              <span 
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-natillera-100 to-emerald-100 text-natillera-700 text-[10px] font-bold rounded-full border border-natillera-200"
              >
                <span class="text-natillera-500">📅</span>
                Mensual
              </span>
            </div>
            <p class="text-sm text-gray-500">
              Vence: {{ formatDate(cuota.fecha_limite) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="font-bold text-gray-800">${{ formatMoney(cuota.valor_cuota) }}</p>
            <p class="text-sm" :class="cuota.valor_pagado > 0 ? 'text-green-600' : 'text-gray-400'">
              Pagado: ${{ formatMoney(cuota.valor_pagado || 0) }}
            </p>
          </div>
          
          <span 
            :class="[
              'badge',
              cuota.estado === 'pagada' ? 'badge-success' : 
              cuota.estado === 'mora' ? 'badge-danger' : 
              cuota.estado === 'parcial' ? 'badge-warning' : 'badge-info'
            ]"
          >
            {{ cuota.estado }}
          </span>

          <button 
            v-if="cuota.estado !== 'pagada'"
            @click="abrirModalPago(cuota)"
            class="btn-primary py-2 px-4 text-sm"
          >
            Registrar Pago
          </button>

          <button 
            v-if="cuota.estado === 'pagada'"
            @click="reenviarComprobante(cuota)"
            class="flex items-center gap-1 py-2 px-3 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Reenviar comprobante"
          >
            <ArrowPathIcon class="w-4 h-4" />
            Reenviar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Generar Cuotas -->
    <div v-if="modalGenerarCuotas" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalGenerarCuotas = false"></div>
      <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-2">
          Generar Cuotas del Mes
        </h3>
        <p class="text-gray-500 text-sm mb-6">
          Define las fechas límite de pago para cada quincena
        </p>

        <form @submit.prevent="handleGenerarCuotas" class="space-y-5">
          <!-- Mes -->
          <div>
            <label class="label">Mes a generar *</label>
            <select 
              v-model.number="formCuotas.mes"
              class="input-field"
              required
            >
              <option v-for="mes in mesesNatillera" :key="mes.value" :value="mes.value">
                {{ mes.label }}
              </option>
            </select>
          </div>

          <!-- Fechas de pago por quincena -->
          <div class="p-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl border border-purple-200 shadow-inner">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="font-semibold text-gray-800">Fechas Límite de Pago</p>
                <p class="text-xs text-gray-500">La fecha de la 2da quincena aplica también para socios mensuales</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- 1ra Quincena -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                  <span class="font-medium text-purple-800">1ra Quincena</span>
                </div>
                <DatePicker 
                  v-model="formCuotas.fecha_quincena1"
                  placeholder="Seleccionar fecha"
                  input-class="bg-purple-50 border-purple-200 hover:border-purple-300"
                />
              </div>

              <!-- 2da Quincena -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                <div class="flex items-center gap-2 mb-3">
                  <span class="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                  <span class="font-medium text-indigo-800">2da Quincena</span>
                </div>
                <DatePicker 
                  v-model="formCuotas.fecha_quincena2"
                  placeholder="Seleccionar fecha"
                  input-class="bg-indigo-50 border-indigo-200 hover:border-indigo-300"
                />
              </div>
            </div>

            <!-- Info de mensual -->
            <div class="mt-4 p-3 bg-white/70 rounded-xl border border-dashed border-gray-300 flex items-start gap-2">
              <span class="text-lg">💡</span>
              <p class="text-xs text-gray-600">
                <strong class="text-gray-700">Socios mensuales:</strong> Su fecha límite será la de la 2da quincena 
                <span v-if="formCuotas.fecha_quincena2" class="text-indigo-600 font-semibold">({{ formatearFechaCorta(formCuotas.fecha_quincena2) }})</span>
              </p>
            </div>
          </div>

          <!-- Resumen -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p class="text-sm font-medium text-gray-700 mb-2">📋 Resumen de cuotas a generar:</p>
            <div class="space-y-1 text-sm text-gray-600">
              <p>• <strong>{{ conteoSociosMensuales }}</strong> socio(s) mensual(es) → 1 cuota c/u</p>
              <p>• <strong>{{ conteoSociosQuincenales }}</strong> socio(s) quincenal(es) → 2 cuotas c/u</p>
              <p class="pt-1 border-t border-gray-200 mt-2 font-semibold text-gray-800">
                Total: {{ conteoSociosMensuales + (conteoSociosQuincenales * 2) }} cuotas para {{ mesesNatillera.find(m => m.value === formCuotas.mes)?.label }}
              </p>
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              type="button"
              @click="modalGenerarCuotas = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="cuotasStore.loading"
            >
              {{ cuotasStore.loading ? 'Generando...' : 'Generar Cuotas' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Registrar Pago -->
    <div v-if="modalPago" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalPago = false"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          Registrar Pago
        </h3>

        <div class="bg-gray-50 p-4 rounded-xl mb-6">
          <p class="font-medium text-gray-800">{{ cuotaSeleccionada?.socio_natillera?.socio?.nombre }}</p>
          <p class="text-sm text-gray-500">
            Cuota: ${{ formatMoney(cuotaSeleccionada?.valor_cuota) }} • 
            Pendiente: ${{ formatMoney((cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)) }}
          </p>
        </div>

        <form @submit.prevent="handleRegistrarPago" class="space-y-4">
          <div>
            <label class="label">Valor del pago *</label>
            <input 
              v-model.number="formPago.valor"
              type="number" 
              class="input-field"
              :placeholder="`Máx: ${(cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)}`"
              :max="(cuotaSeleccionada?.valor_cuota || 0) - (cuotaSeleccionada?.valor_pagado || 0)"
              min="1"
              required
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalPago = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="cuotasStore.loading"
            >
              {{ cuotasStore.loading ? 'Registrando...' : 'Registrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmación de Pago con Comprobante Visual -->
    <div v-if="modalConfirmacion" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cerrarConfirmacion"></div>
      <div class="card relative max-w-md w-full">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-4 text-center">
          ¡Pago Registrado! 🎉
        </h3>

        <!-- Comprobante Visual (esto se convierte en imagen) -->
        <div 
          id="comprobante-pago"
          ref="comprobanteRef"
          class="rounded-2xl overflow-hidden mb-4"
          style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
        >
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #0d9488 100%); padding: 24px; color: white;">
            <!-- Header del comprobante -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px;">✓</span>
                </div>
                <span style="font-weight: bold; font-size: 18px;">Natillera</span>
              </div>
              <span style="color: rgba(255,255,255,0.8); font-size: 14px;">Comprobante de Pago</span>
            </div>

            <!-- Nombre de la natillera -->
            <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Natillera</p>
              <p style="font-weight: 600; font-size: 18px; margin: 4px 0 0 0;">{{ natilleraNombre || 'Mi Natillera' }}</p>
            </div>

            <!-- Valor grande -->
            <div style="text-align: center; padding: 24px 0;">
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px 0;">Valor Pagado</p>
              <p style="font-size: 48px; font-weight: bold; margin: 0; letter-spacing: -2px;">
                ${{ formatMoney(pagoRegistrado?.valor) }}
              </p>
            </div>

            <!-- Detalles -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Socio</p>
                <p style="font-weight: 600; margin: 4px 0 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ pagoRegistrado?.socioNombre }}</p>
              </div>
              <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Cuota</p>
                <p style="font-weight: 600; margin: 4px 0 0 0;">{{ pagoRegistrado?.descripcionCuota || 'Cuota mensual' }}</p>
              </div>
            </div>

            <!-- Fecha -->
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Fecha de Pago</p>
                <p style="font-weight: 600; margin: 4px 0 0 0;">{{ pagoRegistrado?.fecha }}</p>
              </div>
              <div style="text-align: right;">
                <p style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Estado</p>
                <p style="font-weight: 600; color: #a7f3d0; margin: 4px 0 0 0;">✓ Pagado</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="space-y-3">
          <button 
            @click="descargarComprobante"
            :disabled="generandoImagen"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            <ArrowDownTrayIcon class="w-5 h-5" />
            {{ generandoImagen ? 'Generando...' : 'Descargar Imagen' }}
          </button>

          <button 
            v-if="pagoRegistrado?.socioTelefono"
            @click="compartirWhatsApp"
            :disabled="generandoImagen"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <ChatBubbleLeftIcon class="w-5 h-5" />
            {{ generandoImagen ? 'Preparando...' : '📲 Compartir por WhatsApp' }}
          </button>
          
          <button 
            @click="cerrarConfirmacion"
            class="btn-secondary w-full"
          >
            Cerrar
          </button>
        </div>

        <p class="text-xs text-gray-400 text-center mt-4">
          💡 En celular podrás enviar la imagen directamente a WhatsApp
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCuotasStore } from '../../stores/cuotas'
import { supabase } from '../../lib/supabase'
// Ya no necesitamos html2canvas, dibujamos directamente en canvas
import { 
  ArrowLeftIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import DatePicker from '../../components/DatePicker.vue'

const props = defineProps({
  id: String
})

const route = useRoute()
const cuotasStore = useCuotasStore()

const modalGenerarCuotas = ref(false)
const modalPago = ref(false)
const modalConfirmacion = ref(false)
const cuotaSeleccionada = ref(null)
const pagoRegistrado = ref(null)
const natilleraNombre = ref('')
const comprobanteRef = ref(null)
const generandoImagen = ref(false)

// Configuración de meses de la natillera
const mesInicio = ref(1)
const mesFin = ref(11)
const anioNatillera = ref(new Date().getFullYear())
const mesSeleccionado = ref(null)
const filtroEstado = ref('todos')
const filtroPeriodicidad = ref('todos')
const tipoFiltro = ref('ambos') // 'estado', 'periodicidad', 'ambos'

// Lista de todos los meses
const todosMeses = [
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

// Meses configurados para esta natillera
const mesesNatillera = computed(() => {
  const meses = []
  let inicio = mesInicio.value
  let fin = mesFin.value
  
  if (inicio <= fin) {
    for (let i = inicio; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  } else {
    // Caso donde el período cruza el año (ej: Octubre a Febrero)
    for (let i = inicio; i <= 12; i++) {
      meses.push(todosMeses[i - 1])
    }
    for (let i = 1; i <= fin; i++) {
      meses.push(todosMeses[i - 1])
    }
  }
  
  return meses
})

// Label del mes seleccionado
const mesSeleccionadoLabel = computed(() => {
  return todosMeses.find(m => m.value === mesSeleccionado.value)?.label || ''
})

// Cuotas del mes actual (sin filtro de estado)
const cuotasMesActual = computed(() => {
  if (!mesSeleccionado.value) return cuotasStore.cuotas
  return cuotasStore.getCuotasPorMes(mesSeleccionado.value, anioNatillera.value)
})

// Cuotas filtradas por estado y periodicidad (para mostrar en la lista)
const cuotasFiltradas = computed(() => {
  let filtradas = cuotasMesActual.value

  // Filtro por estado
  if (filtroEstado.value !== 'todos') {
    filtradas = filtradas.filter(c => c.estado === filtroEstado.value)
  }

  // Filtro por periodicidad
  if (filtroPeriodicidad.value === 'mensual') {
    filtradas = filtradas.filter(c => !c.quincena)
  } else if (filtroPeriodicidad.value === 'quincenal') {
    filtradas = filtradas.filter(c => c.quincena)
  }

  return filtradas
})

// Resumen del mes actual
const resumenMesActual = computed(() => {
  if (!mesSeleccionado.value) return cuotasStore.calcularResumenCuotas()
  return cuotasStore.getResumenPorMes(mesSeleccionado.value, anioNatillera.value)
})

// Función para obtener resumen de un mes específico (para los badges de los tabs)
function getResumenMes(mes) {
  return cuotasStore.getResumenPorMes(mes, anioNatillera.value)
}

// Emoji representativo de cada mes
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

const formCuotas = reactive({
  fecha_quincena1: '',
  fecha_quincena2: '',
  mes: 1
})

// Conteo de socios por periodicidad
const conteoSociosMensuales = ref(0)
const conteoSociosQuincenales = ref(0)

const formPago = reactive({
  valor: 0
})

const id = props.id || route.params.id

const resumen = computed(() => cuotasStore.calcularResumenCuotas())

// Cuando cambia el mes seleccionado, actualizar el formulario y resetear filtros
watch(mesSeleccionado, (nuevoMes) => {
  if (nuevoMes) {
    formCuotas.mes = nuevoMes
    filtroEstado.value = 'todos' // Resetear filtro al cambiar de mes
    filtroPeriodicidad.value = 'todos' // Resetear filtro de periodicidad
  }
})

// Cuando cambia el tipo de filtro, mantener los filtros actuales
// El usuario puede usar "Todos" para resetear ambos filtros

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

function abrirModalPago(cuota) {
  cuotaSeleccionada.value = cuota
  formPago.valor = cuota.valor_cuota - (cuota.valor_pagado || 0)
  modalPago.value = true
}

async function handleGenerarCuotas() {
  const mesLabel = todosMeses.find(m => m.value === formCuotas.mes)?.label || ''
  
  // La fecha mensual es la misma que la 2da quincena
  const result = await cuotasStore.generarCuotasPeriodo(
    id,
    {
      mensual: formCuotas.fecha_quincena2, // Mensual = 2da quincena
      quincena1: formCuotas.fecha_quincena1,
      quincena2: formCuotas.fecha_quincena2
    },
    mesLabel,
    formCuotas.mes,
    anioNatillera.value
  )

  if (result.success) {
    modalGenerarCuotas.value = false
    formCuotas.fecha_quincena1 = ''
    formCuotas.fecha_quincena2 = ''
    // Cambiar al mes generado
    mesSeleccionado.value = formCuotas.mes
    // Recargar cuotas y conteo
    cuotasStore.fetchCuotasNatillera(id)
    cargarConteoSocios()
  } else {
    alert('Error: ' + result.error)
  }
}

// Función para mostrar la fecha en formato corto dd/mm/yyyy
function formatearFechaCorta(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

async function handleRegistrarPago() {
  if (!cuotaSeleccionada.value) return

  const valorPagado = formPago.valor
  const socioNombre = cuotaSeleccionada.value.socio_natillera?.socio?.nombre
  const socioTelefono = cuotaSeleccionada.value.socio_natillera?.socio?.telefono
  const descripcionCuota = cuotaSeleccionada.value.descripcion || formatDate(cuotaSeleccionada.value.fecha_limite)

  const result = await cuotasStore.registrarPago(
    cuotaSeleccionada.value.id,
    valorPagado
  )

  if (result.success) {
    // Guardar info del pago para el modal de confirmación
    pagoRegistrado.value = {
      socioNombre,
      socioTelefono,
      valor: valorPagado,
      descripcionCuota,
      fecha: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    modalPago.value = false
    modalConfirmacion.value = true
    cuotaSeleccionada.value = null
    
    // Recargar cuotas para actualizar el resumen
    cuotasStore.fetchCuotasNatillera(id)
  } else {
    alert('Error: ' + result.error)
  }
}

function generarImagenComprobante() {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const width = 480
      const height = 680
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // === FONDO DEGRADADO MODERNO ===
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#0f172a')
      bgGradient.addColorStop(0.5, '#1e293b')
      bgGradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // === EFECTOS DE LUZ (glassmorphism style) ===
      // Luz superior derecha
      const light1 = ctx.createRadialGradient(width - 80, 100, 0, width - 80, 100, 200)
      light1.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      light1.addColorStop(1, 'transparent')
      ctx.fillStyle = light1
      ctx.fillRect(0, 0, width, height)
      
      // Luz inferior izquierda
      const light2 = ctx.createRadialGradient(80, height - 150, 0, 80, height - 150, 180)
      light2.addColorStop(0, 'rgba(6, 182, 212, 0.2)')
      light2.addColorStop(1, 'transparent')
      ctx.fillStyle = light2
      ctx.fillRect(0, 0, width, height)
      
      // === HEADER MINIMALISTA ===
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = 'bold 26px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Natillera', 32, 50)
      
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '13px Arial'
      ctx.textAlign = 'right'
      ctx.fillText('Comprobante de Pago', width - 32, 50)
      
      // Línea decorativa
      const lineGradient = ctx.createLinearGradient(32, 0, width - 32, 0)
      lineGradient.addColorStop(0, '#10b981')
      lineGradient.addColorStop(0.5, '#06b6d4')
      lineGradient.addColorStop(1, '#10b981')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 70)
      ctx.lineTo(width - 32, 70)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = 95
      const cardHeight = 485
      const cardMargin = 24
      
      // Borde con gradiente
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.stroke()
      
      // Fondo de la tarjeta (glassmorphism)
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      
      const cardInnerX = cardMargin + 28
      const cardInnerWidth = width - cardMargin*2 - 56
      
      // === NOMBRE DE LA NATILLERA ===
      ctx.fillStyle = '#64748b'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('NATILLERA', cardInnerX, cardY + 40)
      
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 20px Arial'
      ctx.fillText(natilleraNombre.value || 'Mi Natillera', cardInnerX, cardY + 68)
      
      // === VALOR PAGADO (HERO) ===
      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('VALOR PAGADO', width/2, cardY + 115)
      
      // Valor grande con gradiente
      const valorText = '$' + formatMoney(pagoRegistrado.value?.valor)
      ctx.font = 'bold 52px Arial'
      const valorGradient = ctx.createLinearGradient(0, cardY + 120, 0, cardY + 175)
      valorGradient.addColorStop(0, '#059669')
      valorGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = valorGradient
      ctx.fillText(valorText, width/2, cardY + 170)
      
      // Badge de verificación
      ctx.fillStyle = '#dcfce7'
      ctx.beginPath()
      ctx.roundRect(width/2 - 60, cardY + 185, 120, 32, 16)
      ctx.fill()
      
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 13px Arial'
      ctx.fillText('Pago Verificado', width/2, cardY + 206)
      
      // === DETALLES EN CARDS ===
      const detailsY = cardY + 240
      
      // Card: Socio
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 18, detailsY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(pagoRegistrado.value?.socioNombre || 'Socio', cardInnerX + 18, detailsY + 46)
      
      // Card: Cuota
      const cuotaY = detailsY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, cuotaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONCEPTO / CUOTA', cardInnerX + 18, cuotaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(pagoRegistrado.value?.descripcionCuota || 'Cuota mensual', cardInnerX + 18, cuotaY + 46)
      
      // Card: Fecha
      const fechaY = cuotaY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, fechaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.stroke()
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('FECHA Y HORA DEL PAGO', cardInnerX + 18, fechaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 15px Arial'
      ctx.fillText(pagoRegistrado.value?.fecha || 'Fecha no disponible', cardInnerX + 18, fechaY + 46)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      const btnY = fechaY + 85
      const btnGradient = ctx.createLinearGradient(cardInnerX, btnY, cardInnerX + cardInnerWidth, btnY)
      btnGradient.addColorStop(0, '#059669')
      btnGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = btnGradient
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.fill()
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PAGO EXITOSO', cardInnerX + cardInnerWidth/2, btnY + 33)
      
      // === FOOTER ===
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Gracias por tu aporte a la comunidad', width/2, height - 42)
      
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px Arial'
      ctx.fillText('natillera.app', width/2, height - 20)
      
      resolve(canvas)
    } catch (e) {
      console.error('Error generando canvas:', e)
      resolve(null)
    }
  })
}

async function descargarComprobante() {
  console.log('Iniciando descarga...')
  
  if (!comprobanteRef.value) {
    alert('Error: El comprobante no está listo. Intenta de nuevo.')
    return
  }
  
  generandoImagen.value = true
  
  try {
    const canvas = await generarImagenComprobante()
    
    if (!canvas) {
      throw new Error('No se pudo generar el canvas')
    }
    
    console.log('Convirtiendo a imagen...')
    
    // Convertir a imagen y descargar
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-') || 'pago'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('Descarga completada')
  } catch (e) {
    console.error('Error completo:', e)
    alert('Error al generar la imagen: ' + e.message)
  } finally {
    generandoImagen.value = false
  }
}

async function compartirWhatsApp() {
  if (!pagoRegistrado.value) return
  
  generandoImagen.value = true
  
  try {
    const canvas = await generarImagenComprobante()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    
    const archivo = new File([blob], `comprobante-${Date.now()}.png`, { type: 'image/png' })
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Comprobante de Pago',
        text: `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago en la natillera "${natilleraNombre.value}".\n\n¡Gracias por estar al día! 🙌`
      })
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `comprobante-${pagoRegistrado.value?.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago. ¡Gracias por estar al día! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
      }, 500)
      
      alert('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      // Fallback: solo abrir WhatsApp con texto
      const telefono = pagoRegistrado.value.socioTelefono?.replace(/\D/g, '')
      if (telefono) {
        const mensaje = `Hola ${pagoRegistrado.value.socioNombre} 👋\n\nTe envío el comprobante de tu pago en la natillera.\n\n¡Gracias por estar al día! 🙌`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }
    }
  } finally {
    generandoImagen.value = false
  }
}

function cerrarConfirmacion() {
  modalConfirmacion.value = false
  pagoRegistrado.value = null
}

function reenviarComprobante(cuota) {
  // Preparar datos del pago para mostrar el comprobante
  pagoRegistrado.value = {
    socioNombre: cuota.socio_natillera?.socio?.nombre,
    socioTelefono: cuota.socio_natillera?.socio?.telefono,
    valor: cuota.valor_pagado || cuota.valor_cuota,
    descripcionCuota: cuota.descripcion || formatDate(cuota.fecha_limite),
    fecha: cuota.fecha_pago 
      ? new Date(cuota.fecha_pago).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Fecha no registrada'
  }
  
  modalConfirmacion.value = true
}

async function cargarNatillera() {
  const { data } = await supabase
    .from('natilleras')
    .select('nombre, mes_inicio, mes_fin, anio')
    .eq('id', id)
    .single()
  
  if (data) {
    natilleraNombre.value = data.nombre
    mesInicio.value = data.mes_inicio || 1
    mesFin.value = data.mes_fin || 11
    anioNatillera.value = data.anio || new Date().getFullYear()
    
    // Seleccionar el mes actual si está en el rango, sino el primero
    const mesActual = new Date().getMonth() + 1
    const mesesDisponibles = mesesNatillera.value.map(m => m.value)
    
    if (mesesDisponibles.includes(mesActual)) {
      mesSeleccionado.value = mesActual
    } else {
      mesSeleccionado.value = mesesDisponibles[0] || 1
    }
    
    // Actualizar el formulario con el mes seleccionado
    formCuotas.mes = mesSeleccionado.value
  }
  
  // Cargar conteo de socios por periodicidad
  await cargarConteoSocios()
}

async function cargarConteoSocios() {
  const { data: socios } = await supabase
    .from('socios_natillera')
    .select('periodicidad')
    .eq('natillera_id', id)
    .eq('estado', 'activo')
  
  if (socios) {
    conteoSociosMensuales.value = socios.filter(s => s.periodicidad !== 'quincenal').length
    conteoSociosQuincenales.value = socios.filter(s => s.periodicidad === 'quincenal').length
  }
}

onMounted(() => {
  cargarNatillera().then(() => {
    cuotasStore.fetchCuotasNatillera(id)
  })
})
</script>


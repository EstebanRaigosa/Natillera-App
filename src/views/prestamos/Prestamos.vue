<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <router-link 
        :to="`/natilleras/${id}`" 
        class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm"
      >
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
        </div>
        <span class="whitespace-nowrap">Volver a natillera</span>
      </router-link>
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Préstamos
              </h1>
              <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                Gestiona los préstamos internos del fondo
              </p>
            </div>
          </div>
          <button @click="modalNuevoPrestamo = true" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
            <PlusIcon class="w-5 h-5" />
            Nuevo Préstamo
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-1">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-400 to-natillera-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-natillera-500/30 mx-auto">
            <BanknotesIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">{{ prestamos.length }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Total Préstamos</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-accent-50/30 to-orange-50/20 border border-accent-200/50 shadow-lg hover:shadow-xl hover:shadow-accent-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-2">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-400/15 to-orange-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalPrestado) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Prestado</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 border border-blue-200/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-3">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-cyan-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalPagado) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Total Pagado</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 border border-green-200/50 shadow-lg hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 animate-fade-in-up stagger-4">
        <!-- Efecto decorativo -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10 text-center">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 mx-auto">
            <CurrencyDollarIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p class="text-2xl sm:text-3xl font-display font-bold text-gray-800 mb-1">${{ formatMoney(totalIntereses) }}</p>
          <p class="text-xs sm:text-sm font-semibold text-gray-600">Intereses Ganados</p>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="prestamos.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
          <BanknotesIcon class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
          No hay préstamos registrados
        </h3>
        <p class="text-gray-600 mb-8 text-sm sm:text-base">
          Los préstamos internos generan intereses para el fondo común
        </p>
        <button @click="modalNuevoPrestamo = true" class="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <PlusIcon class="w-5 h-5" />
          Crear Préstamo
        </button>
      </div>
    </div>

    <div v-else class="space-y-4 sm:space-y-5">
      <div 
        v-for="prestamo in prestamos" 
        :key="prestamo.id"
        @click="abrirModalDetalle(prestamo)"
        class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/20 hover:-translate-y-1 transition-all duration-300 p-6 sm:p-6 cursor-pointer"
      >
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/15 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-400/15 to-natillera-400/10 rounded-full blur-lg translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-4">
          <div class="flex items-center gap-4 sm:gap-4">
            <div 
              :class="[
                'w-16 h-16 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300',
                prestamo.estado === 'pagado' ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 
                prestamo.estado === 'activo' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30' : 
                'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-500/30'
              ]"
            >
              <BanknotesIcon class="w-8 h-8 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <p class="font-display font-semibold text-gray-800 text-xl sm:text-lg">
                {{ prestamo.socio_natillera?.socio?.nombre || 'Socio' }}
              </p>
              <p class="text-base sm:text-sm text-gray-500 font-medium">
                Fecha: {{ formatDate(prestamo.created_at) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-center lg:text-right">
            <div class="bg-white/50 rounded-xl p-4 sm:p-3 backdrop-blur-sm border border-gray-200/50">
              <p class="text-xs sm:text-xs text-gray-500 font-medium mb-1.5 sm:mb-1">Monto</p>
              <p class="font-bold text-gray-800 text-base sm:text-sm lg:text-base">${{ formatMoney(prestamo.monto) }}</p>
            </div>
            <div class="bg-white/50 rounded-xl p-4 sm:p-3 backdrop-blur-sm border border-blue-200/50">
              <p class="text-xs sm:text-xs text-gray-500 font-medium mb-1.5 sm:mb-1">Pagado</p>
              <p class="font-bold text-blue-600 text-base sm:text-sm lg:text-base">
                ${{ formatMoney(prestamo.monto - prestamo.saldo_actual) }}
              </p>
            </div>
            <div class="bg-white/50 rounded-xl p-4 sm:p-3 backdrop-blur-sm border border-accent-200/50">
              <p class="text-xs sm:text-xs text-gray-500 font-medium mb-1.5 sm:mb-1">Interés</p>
              <p class="font-bold text-accent-600 text-base sm:text-sm lg:text-base">{{ prestamo.interes }}%</p>
            </div>
            <div class="bg-white/50 rounded-xl p-4 sm:p-3 backdrop-blur-sm border border-gray-200/50">
              <p class="text-xs sm:text-xs text-gray-500 font-medium mb-1.5 sm:mb-1">Saldo</p>
              <p class="font-bold text-base sm:text-sm lg:text-base" :class="prestamo.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">
                ${{ formatMoney(prestamo.saldo_actual) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <span 
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-bold shadow-sm',
                prestamo.estado === 'pagado' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 
                prestamo.estado === 'activo' 
                  ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200' : 
                  'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
              ]"
            >
              {{ prestamo.estado }}
            </span>
            <button 
              v-if="prestamo.estado === 'activo'"
              @click.stop="abrirModalAbono(prestamo)"
              class="btn-secondary py-2 px-4 text-sm shadow-md hover:shadow-lg transition-all"
            >
              Abonar
            </button>
            <button 
              @click.stop="confirmarEliminarPrestamo(prestamo)"
              class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
              title="Eliminar préstamo"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Préstamo -->
    <div v-if="modalNuevoPrestamo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalNuevoPrestamo = false"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Nuevo Préstamo
                </h3>
                <p class="text-white/90 text-xs">Registra un nuevo préstamo para un socio</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto">
          <form @submit.prevent="handleCrearPrestamo" class="p-4 sm:p-6 space-y-4">
          <!-- Selector de Socio -->
          <div class="relative selector-socio-container">
            <label class="label mb-2">Socio *</label>
            <div class="relative">
              <button
                type="button"
                @click="mostrarSelectorSocio = !mostrarSelectorSocio"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 rounded-xl transition-all',
                  formPrestamo.socio_natillera_id 
                    ? 'border-natillera-300 hover:border-natillera-400' 
                    : 'border-gray-200 hover:border-gray-300',
                  mostrarSelectorSocio ? 'border-natillera-500 shadow-lg' : ''
                ]"
              >
                <div v-if="socioSeleccionado" class="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)" 
                    :alt="socioSeleccionado.socio?.nombre"
                    class="w-10 h-10 rounded-xl border-2 border-natillera-200 flex-shrink-0 object-cover"
                  />
                  <div class="flex-1 min-w-0 text-left">
                    <p class="font-semibold text-gray-800 truncate">{{ socioSeleccionado.socio?.nombre }}</p>
                    <p v-if="socioSeleccionado.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socioSeleccionado.socio.telefono }}</p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3 flex-1 text-gray-500">
                  <div class="w-10 h-10 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon class="w-5 h-5 text-gray-400" />
                  </div>
                  <span>Selecciona un socio...</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
                    mostrarSelectorSocio ? 'transform rotate-180' : ''
                  ]"
                />
              </button>

              <!-- Dropdown de socios -->
              <div 
                v-if="mostrarSelectorSocio"
                @click.stop
                class="absolute z-50 w-full mt-2 bg-white border-2 border-natillera-200 rounded-xl shadow-2xl max-h-80 overflow-hidden"
              >
                <!-- Búsqueda -->
                <div class="p-3 border-b border-gray-200 sticky top-0 bg-white">
                  <input
                    v-model="busquedaSocio"
                    type="text"
                    placeholder="Buscar socio..."
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                    @click.stop
                  />
                </div>
                <!-- Lista de socios -->
                <div class="overflow-y-auto max-h-64">
                  <button
                    v-for="socio in sociosFiltrados"
                    :key="socio.id"
                    type="button"
                    @click="seleccionarSocio(socio)"
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-natillera-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                    :class="formPrestamo.socio_natillera_id === socio.id ? 'bg-natillera-50' : ''"
                  >
                    <img 
                      :src="getAvatarUrl(socio.socio?.nombre || socio.id, socio.socio?.avatar_seed, socio.socio?.avatar_style)" 
                      :alt="socio.socio?.nombre"
                      class="w-10 h-10 rounded-xl border-2 border-natillera-200 flex-shrink-0 object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800 truncate">{{ socio.socio?.nombre }}</p>
                      <p v-if="socio.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socio.socio.telefono }}</p>
                      <p v-else-if="socio.socio?.email" class="text-xs text-gray-500 truncate">{{ socio.socio.email }}</p>
                    </div>
                    <div v-if="formPrestamo.socio_natillera_id === socio.id" class="flex-shrink-0">
                      <div class="w-5 h-5 bg-natillera-500 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </button>
                  <div v-if="sociosFiltrados.length === 0" class="p-4 text-center text-gray-500 text-sm">
                    No se encontraron socios
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monto del préstamo / Monto a recibir -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="label mb-0">{{ calcularPorMontoARecibir && mostrarInteresAnticipado ? 'Monto que necesita recibir (interés anticipado)' : 'Monto del préstamo' }} *</label>
              <button
                v-if="mostrarInteresAnticipado"
                type="button"
                @click="calcularPorMontoARecibir = !calcularPorMontoARecibir"
                class="text-xs text-natillera-600 hover:text-natillera-700 font-semibold underline"
              >
                {{ calcularPorMontoARecibir ? 'Cambiar a capital' : 'Calcular por monto a recibir' }}
              </button>
            </div>
            <p v-if="calcularPorMontoARecibir && !mostrarInteresAnticipado" class="mb-2 text-xs text-amber-600">
              ⚠️ Este cálculo funciona con interés anticipado. Cambia a la pestaña "Interés Anticipado" en el resumen.
            </p>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                $
              </div>
              <input 
                v-if="!calcularPorMontoARecibir || !mostrarInteresAnticipado"
                :value="montoFormateado"
                @input="actualizarMonto"
                type="text" 
                inputmode="numeric"
                class="input-field pl-10 text-xl font-semibold"
                placeholder="100.000"
                required
              />
              <input 
                v-else
                :value="montoARecibirFormateado"
                @input="actualizarMontoARecibir"
                type="text" 
                inputmode="numeric"
                class="input-field pl-10 text-xl font-semibold"
                placeholder="100.000"
                required
              />
            </div>
            <template v-if="!calcularPorMontoARecibir || !mostrarInteresAnticipado">
              <p v-if="formPrestamo.monto >= 10000" class="mt-2 text-sm text-gray-600">
                <span class="font-semibold text-natillera-600">${{ formatMoney(formPrestamo.monto) }}</span> pesos colombianos
              </p>
              <p v-else-if="formPrestamo.monto > 0" class="mt-2 text-sm text-amber-600">
                El monto mínimo es ${{ formatMoney(10000) }}
              </p>
            </template>
            <template v-else>
              <div v-if="capitalAPrestar >= 10000 && mostrarInteresAnticipado" class="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-semibold text-gray-700">Para recibir exactamente:</span>
                  <span class="text-xl font-bold text-green-700">${{ montoARecibirFormateado || formatMoney(formPrestamo.monto) }}</span>
                </div>
                <div class="flex justify-between items-center pt-3 border-t-2 border-green-200">
                  <span class="text-base font-bold text-gray-800">Se necesitan del fondo:</span>
                  <span class="text-2xl font-bold text-natillera-700">${{ formatMoney(movimientoFondoInicio) }}</span>
                </div>
                <p class="mt-3 text-xs text-gray-600 bg-white/50 rounded-lg p-2">
                  💡 Los intereses anticipados de <span class="font-semibold">${{ formatMoney(interesTotal) }}</span> se descuentan al inicio
                </p>
              </div>
              <p v-else-if="formPrestamo.monto > 0" class="mt-2 text-sm text-amber-600">
                Ingresa un monto válido
              </p>
            </template>
          </div>

          <!-- Tipo de interés -->
          <div>
            <label class="label mb-2">Tipo de interés *</label>
            <select v-model="formPrestamo.tipo_interes" class="input-field" required>
              <option value="simple">📊 Interés Simple</option>
              <option value="compuesto">💰 Interés Compuesto</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              <span v-if="formPrestamo.tipo_interes === 'simple'">
                Se calcula sobre el monto inicial solamente
              </span>
              <span v-else>
                El interés se acumula mensualmente
              </span>
            </p>
          </div>

          <!-- Número de cuotas e Interés -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label mb-2">Número de cuotas *</label>
              <input 
                v-model.number="formPrestamo.numero_cuotas"
                type="number" 
                class="input-field text-center text-lg font-semibold"
                placeholder="1"
                min="1"
                max="36"
                required
              />
            </div>
            <div>
              <label class="label mb-2">Interés mensual (%) *</label>
              <input 
                v-model.number="formPrestamo.interes"
                type="number" 
                class="input-field text-center text-lg font-semibold"
                placeholder="2"
                min="0"
                max="100"
                step="0.5"
                required
              />
            </div>
          </div>

          <!-- Resumen de intereses -->
          <div v-if="formPrestamo.monto && formPrestamo.interes && formPrestamo.numero_cuotas" class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl overflow-hidden">
            <!-- Tabs para tipo de interés -->
            <div class="flex gap-2 p-3 border-b border-blue-200 bg-white/50">
              <button
                type="button"
                @click="mostrarInteresAnticipado = false"
                :class="[
                  'group relative px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 overflow-hidden flex-1',
                  !mostrarInteresAnticipado
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <div 
                  v-if="!mostrarInteresAnticipado"
                  class="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"
                ></div>
                <span class="relative flex items-center justify-center gap-1.5">
                  <span>📊</span>
                  Interés Normal
                </span>
              </button>
              <button
                type="button"
                @click="mostrarInteresAnticipado = true"
                :class="[
                  'group relative px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 overflow-hidden flex-1',
                  mostrarInteresAnticipado
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                <div 
                  v-if="mostrarInteresAnticipado"
                  class="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600"
                ></div>
                <span class="relative flex items-center justify-center gap-1.5">
                  <span>💰</span>
                  Interés Anticipado
                </span>
              </button>
            </div>

            <div class="p-3 space-y-2">
              <!-- Vista Mes Vencido -->
              <template v-if="!mostrarInteresAnticipado">
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="text-gray-600">Desembolso:</span>
                  <span class="font-bold text-gray-800">${{ formatMoney(capitalAPrestar) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="text-gray-600">Interés cobrado al inicio:</span>
                  <span class="font-bold text-gray-500">${{ formatMoney(0) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-blue-200/50">
                  <span class="text-gray-600">Cuota mensual:</span>
                  <span class="font-bold text-blue-600">${{ formatMoney(cuotaMensual) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm pt-2">
                  <span class="font-semibold text-blue-800">Pago final estimado:</span>
                  <span class="font-bold text-base text-blue-700">${{ formatMoney(montoAPagar) }}</span>
                </div>
              </template>

              <!-- Vista Anticipado -->
              <template v-else>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Desembolso:</span>
                  <span class="font-bold text-gray-800">${{ formatMoney(capitalAPrestar) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Interés cobrado al inicio:</span>
                  <span class="font-bold text-orange-600">${{ formatMoney(interesTotal) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Movimiento fondo al inicio:</span>
                  <span class="font-bold text-natillera-700">${{ formatMoney(movimientoFondoInicio) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm py-1.5 border-b border-orange-200/50">
                  <span class="text-gray-600">Cuota mensual:</span>
                  <span class="font-bold text-orange-600">${{ formatMoney(cuotaMensual) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm pt-2">
                  <span class="font-semibold text-orange-800">Pago final estimado:</span>
                  <span class="font-bold text-base text-orange-700">${{ formatMoney(montoAPagar) }}</span>
                </div>
              </template>
            </div>
          </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalNuevoPrestamo = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleCrearPrestamo"
              class="btn-primary flex-1"
              :disabled="loading || !formPrestamo.socio_natillera_id || formPrestamo.monto < 10000"
            >
              {{ loading ? 'Creando...' : 'Crear Préstamo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Abono -->
    <div v-if="modalAbono" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cerrarModalAbono"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Registrar Abono
                </h3>
                <p class="text-white/90 text-xs">Registra un pago al préstamo</p>
              </div>
            </div>
            <button 
              @click="cerrarModalAbono"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <form @submit.prevent="handleRegistrarAbono" class="p-4 sm:p-6 space-y-6">
            <!-- Información del socio y saldo -->
            <div class="relative bg-gradient-to-br from-natillera-50 via-emerald-50 to-teal-50 border-2 border-natillera-200 rounded-xl p-4 overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-natillera-200/30 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon class="w-6 h-6 text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 text-lg truncate">{{ prestamoSeleccionado?.socio_natillera?.socio?.nombre }}</p>
                    <p class="text-xs text-gray-600">Socio del préstamo</p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t-2 border-natillera-200/50 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-gray-700">Saldo actual:</span>
                    <span class="text-2xl font-bold text-natillera-700">${{ formatMoney(prestamoSeleccionado?.saldo_actual) }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3 pt-3 border-t border-natillera-200/50">
                    <div class="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                      <p class="text-xs text-gray-500 font-medium mb-1">Valor de la cuota</p>
                      <p class="text-lg font-bold text-blue-700">${{ formatMoney(calcularCuotaMensualDetalle(prestamoSeleccionado)) }}</p>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                      <p class="text-xs text-gray-500 font-medium mb-1">Cuotas restantes</p>
                      <p class="text-lg font-bold text-purple-700">{{ calcularCuotasRestantes(prestamoSeleccionado) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Campo de valor del abono -->
            <div>
              <label class="label mb-2 flex items-center gap-2">
                <CurrencyDollarIcon class="w-5 h-5 text-natillera-600" />
                <span>Valor del abono *</span>
                <span class="text-xs text-gray-500 font-normal">(Puedes modificar este valor)</span>
              </label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-600 font-bold text-xl z-10 pointer-events-none">
                  $
                </div>
                <input 
                  :value="valorAbonoFormateado"
                  @input="actualizarValorAbono"
                  type="text" 
                  inputmode="numeric"
                  class="input-field pl-12 pr-4 text-2xl font-bold text-natillera-700 focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 border-2 border-natillera-200 bg-white hover:border-natillera-300 transition-all cursor-text"
                  placeholder="0"
                  required
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <PencilIcon class="w-5 h-5 text-gray-400 group-hover:text-natillera-500 transition-colors" />
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Puedes escribir o modificar el valor directamente
              </p>
              
              <!-- Información del saldo restante -->
              <div v-if="prestamoSeleccionado?.saldo_actual && formAbono.valor" class="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-700">Saldo restante después del abono:</span>
                  <span class="text-xl font-bold text-green-700">
                    ${{ formatMoney(Math.max(0, (prestamoSeleccionado?.saldo_actual || 0) - (formAbono.valor || 0))) }}
                  </span>
                </div>
                <div v-if="(prestamoSeleccionado?.saldo_actual || 0) - (formAbono.valor || 0) <= 0" class="mt-2 pt-2 border-t border-green-200">
                  <p class="text-xs font-semibold text-green-700 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    El préstamo quedará completamente pagado
                  </p>
                </div>
              </div>
              
              <!-- Validaciones -->
              <div v-if="formAbono.valor && formAbono.valor < 1000" class="mt-2 text-xs text-amber-600 font-medium">
                ⚠️ El valor mínimo del abono es $1.000
              </div>
              <div v-if="formAbono.valor && formAbono.valor > (prestamoSeleccionado?.saldo_actual || 0)" class="mt-2 text-xs text-red-600 font-medium">
                ⚠️ El abono no puede ser mayor al saldo actual
              </div>
            </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="cerrarModalAbono"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="handleRegistrarAbono" 
              class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              :disabled="loading || !formAbono.valor || formAbono.valor < 1000 || formAbono.valor > (prestamoSeleccionado?.saldo_actual || 0)"
            >
              <CurrencyDollarIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Registrando...' : 'Registrar Abono' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Comprobante de Abono -->
    <div v-if="modalComprobanteAbono && comprobanteAbono" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalComprobanteAbono = false"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <CheckCircleIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Comprobante de Abono
                </h3>
                <p class="text-white/90 text-xs">Abono registrado exitosamente</p>
              </div>
            </div>
            <button 
              @click="modalComprobanteAbono = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6">
          <!-- Comprobante Visual -->
          <div 
            id="comprobante-abono"
            ref="comprobanteRef"
            class="rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);"
          >
            <!-- Header con gradiente -->
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #0d9488 100%); padding: 20px 18px; color: white;">
              <!-- Header del comprobante -->
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">
                    <span style="font-size: 22px;">✓</span>
                  </div>
                  <div>
                    <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                      Comprobante de Abono
                    </p>
                  </div>
                </div>
              </div>

              <!-- Valor grande destacado -->
              <div style="text-align: center; padding: 16px 0 14px 0; border-top: 1px solid rgba(255,255,255,0.15); border-bottom: 1px solid rgba(255,255,255,0.15);">
                <p style="color: rgba(255,255,255,0.8); font-size: 10px; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Valor del Abono
                </p>
                <p style="font-size: 42px; font-weight: 800; margin: 0; letter-spacing: -3px; line-height: 1;">
                  ${{ formatMoney(comprobanteAbono.valor) }}
                </p>
              </div>

              <!-- Detalles del socio y préstamo -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
                <div style="background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255,255,255,0.25);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Socio</p>
                  <p style="font-weight: 700; font-size: 13px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.3px;">{{ comprobanteAbono.socioNombre }}</p>
                </div>
                <div style="background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px; border: 1px solid rgba(255,255,255,0.25);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Tipo</p>
                  <p style="font-weight: 700; font-size: 13px; margin: 0; letter-spacing: -0.3px;">Abono a Préstamo</p>
                </div>
              </div>

              <!-- Saldo anterior y nuevo -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
                <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Saldo Anterior</p>
                  <p style="font-weight: 700; font-size: 14px; margin: 0; letter-spacing: -0.5px;">${{ formatMoney(comprobanteAbono.saldoAnterior) }}</p>
                </div>
                <div style="background: rgba(167, 243, 208, 0.2); border-radius: 8px; padding: 10px; border: 1px solid rgba(167, 243, 208, 0.3);">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 3px 0; font-weight: 600;">Saldo Nuevo</p>
                  <p style="font-weight: 700; font-size: 14px; margin: 0; color: #a7f3d0; letter-spacing: -0.5px;">${{ formatMoney(comprobanteAbono.saldoNuevo) }}</p>
                </div>
              </div>

              <!-- Fecha y Estado -->
              <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
                <div style="flex: 1;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Fecha de Pago</p>
                  <p style="font-weight: 700; font-size: 12px; margin: 0; letter-spacing: -0.2px;">{{ comprobanteAbono.fecha }}</p>
                </div>
                <div style="flex: 1; text-align: right;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0; font-weight: 600;">Estado</p>
                  <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(167, 243, 208, 0.2); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(167, 243, 208, 0.3);">
                    <span style="font-size: 14px;">✓</span>
                    <p style="font-weight: 700; font-size: 15px; margin: 0; letter-spacing: -0.2px; color: #a7f3d0;">
                      Registrado
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Código de comprobante -->
              <div v-if="comprobanteAbono.codigoComprobante" style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.2);">
                <p style="color: rgba(255,255,255,0.7); font-size: 8px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0; font-weight: 600; text-align: center;">Código de Comprobante</p>
                <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.2);">
                  <p style="color: rgba(255,255,255,0.95); font-weight: 700; font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 2px; margin: 0;">
                    {{ comprobanteAbono.codigoComprobante }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer fijo con botones de acción -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
          <div class="space-y-3">
            <button 
              @click="descargarComprobanteAbono"
              :disabled="generandoImagenComprobante"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon v-if="!generandoImagenComprobante" class="w-5 h-5" />
              <span v-if="generandoImagenComprobante" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ generandoImagenComprobante ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <button 
              @click="compartirWhatsAppAbono"
              :disabled="generandoImagenComprobante || !comprobanteAbono?.socioTelefono"
              :class="[
                'block sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all',
                (generandoImagenComprobante || !comprobanteAbono?.socioTelefono)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              ]"
              :title="!comprobanteAbono?.socioTelefono ? 'No hay teléfono registrado para este socio' : ''"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
              <span v-if="generandoImagenComprobante">Preparando...</span>
              <span v-else-if="!comprobanteAbono?.socioTelefono">📲 Sin teléfono registrado</span>
              <span v-else>📲 Compartir por WhatsApp</span>
            </button>
          </div>

          <p class="hidden sm:block text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>

          <button 
            @click="modalComprobanteAbono = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Abono -->
    <div v-if="modalEditarAbono && abonoAEditar" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalEditarAbono = false; abonoAEditar = null"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Editar Abono
                </h3>
                <p class="text-white/90 text-xs">Modifica el valor del abono</p>
              </div>
            </div>
            <button 
              @click="modalEditarAbono = false; abonoAEditar = null"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
          <form @submit.prevent="guardarAbonoEditado" class="p-4 sm:p-6 space-y-6">
            <!-- Información del abono actual -->
            <div class="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 rounded-xl p-4 overflow-hidden">
              <div class="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <div class="relative z-10">
                <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Abono Actual</p>
                <p class="text-2xl font-bold text-blue-700">${{ formatMoney(abonoAEditar?.valorOriginal || abonoAEditar?.valor) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(abonoAEditar?.fecha) }}</p>
              </div>
            </div>

            <!-- Campo de nuevo valor -->
            <div>
              <label class="label mb-2 flex items-center gap-2">
                <CurrencyDollarIcon class="w-5 h-5 text-natillera-600" />
                Nuevo valor del abono *
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-natillera-600 font-bold text-xl z-10">
                  $
                </div>
                <input 
                  v-model.number="abonoAEditar.valor"
                  type="number" 
                  class="input-field pl-12 text-xl font-bold text-natillera-700 focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                  min="1000"
                  step="1000"
                  placeholder="0"
                  required
                />
              </div>
              
              <!-- Información del cambio -->
              <div v-if="abonoAEditar?.valor && abonoAEditar.valor !== parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)" class="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700">Diferencia:</span>
                  <span :class="[
                    'text-lg font-bold',
                    (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 ? 'text-green-700' : 'text-red-700'
                  ]">
                    {{ (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 ? '+' : '' }}${{ formatMoney(abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) }}
                  </span>
                </div>
                <p class="text-xs text-amber-700 mt-2">
                  {{ (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 
                    ? 'El saldo del préstamo disminuirá' 
                    : 'El saldo del préstamo aumentará' }}
                </p>
              </div>
              
              <!-- Validaciones -->
              <div v-if="abonoAEditar?.valor && abonoAEditar.valor < 1000" class="mt-2 text-xs text-amber-600 font-medium">
                ⚠️ El valor mínimo del abono es $1.000
              </div>
            </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalEditarAbono = false; abonoAEditar = null"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button 
              type="button"
              @click="guardarAbonoEditado" 
              class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              :disabled="loading || !abonoAEditar?.valor || abonoAEditar.valor < 1000 || abonoAEditar.valor === parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)"
            >
              <PencilIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Préstamo -->
    <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalDetalle = false"></div>
      <div class="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <BanknotesIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Detalle del Préstamo
                </h3>
                <p class="text-white/90 text-xs">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
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

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 sm:p-6 space-y-6">
            <!-- Información del préstamo -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                  <CurrencyDollarIcon class="w-5 h-5 text-blue-600" />
                  Información del Préstamo
                </h4>
                <button
                  @click="abrirModalCompartirPrestamo"
                  class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                  title="Enviar información del préstamo por WhatsApp"
                >
                  <ChatBubbleLeftIcon class="w-4 h-4" />
                  <span class="hidden sm:inline">Enviar por WhatsApp</span>
                  <span class="sm:hidden">WhatsApp</span>
                </button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Monto del préstamo</p>
                  <p class="font-bold text-gray-800">${{ formatMoney(prestamoDetalle?.monto) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Interés mensual</p>
                  <p class="font-bold text-blue-600">{{ prestamoDetalle?.interes }}%</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Saldo actual</p>
                  <p class="font-bold" :class="prestamoDetalle?.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">
                    ${{ formatMoney(prestamoDetalle?.saldo_actual) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Número de cuotas</p>
                  <p class="font-bold text-gray-800">{{ prestamoDetalle?.numero_cuotas || 1 }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Valor de la cuota</p>
                  <p class="font-bold text-purple-600">${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Interés generado</p>
                  <p class="font-bold text-orange-600">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Monto pagado</p>
                  <p class="font-bold text-emerald-600">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Estado</p>
                  <span 
                    :class="[
                      'inline-block px-2 py-1 rounded-full text-xs font-bold',
                      prestamoDetalle?.estado === 'pagado' 
                        ? 'bg-green-100 text-green-700' : 
                      prestamoDetalle?.estado === 'activo' 
                        ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ prestamoDetalle?.estado }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Fecha de creación</p>
                  <p class="font-semibold text-gray-700 text-sm">{{ formatDate(prestamoDetalle?.created_at) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total pagado</p>
                  <p class="font-bold text-green-600">
                    ${{ formatMoney((prestamoDetalle?.monto || 0) - (prestamoDetalle?.saldo_actual || 0)) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Resumen de pagos -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-green-600" />
                Resumen de Pagos
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total de abonos</p>
                  <p class="font-bold text-gray-800">{{ pagosPrestamo.length }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Total abonado</p>
                  <p class="font-bold text-green-600">
                    ${{ formatMoney(pagosPrestamo.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0)) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Saldo pendiente</p>
                  <p class="font-bold text-red-600">${{ formatMoney(prestamoDetalle?.saldo_actual) }}</p>
                </div>
              </div>
            </div>

            <!-- Lista de pagos -->
            <div>
              <h4 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-natillera-600" />
                Historial de Abonos
              </h4>
              <div v-if="pagosPrestamo.length === 0" class="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <BanknotesIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500 text-sm">No hay abonos registrados</p>
              </div>
              <div v-else class="space-y-2">
                <div 
                  v-for="pago in pagosPrestamo" 
                  :key="pago.id"
                  class="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-natillera-300 transition-all"
                >
                  <div class="flex items-center gap-3 flex-1">
                    <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CurrencyDollarIcon class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800">${{ formatMoney(pago.valor) }}</p>
                      <p class="text-xs text-gray-500">{{ formatDate(pago.fecha) }}</p>
                      <p v-if="pago.codigo_comprobante" class="text-xs text-gray-400 font-mono mt-1">
                        Código: {{ pago.codigo_comprobante }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Abonado
                    </span>
                    <button
                      v-if="pago.codigo_comprobante"
                      @click.stop="reenviarComprobanteAbono(pago)"
                      class="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Reenviar comprobante"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click.stop="abrirModalEditarAbono(pago)"
                      class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar abono"
                    >
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click.stop="confirmarEliminarAbono(pago)"
                      class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar abono"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <div class="flex gap-3">
            <button 
              type="button"
              @click="modalDetalle = false"
              class="btn-secondary flex-1"
            >
              Cerrar
            </button>
            <button 
              v-if="prestamoDetalle?.estado === 'activo'"
              type="button"
              @click="abrirModalAbono(prestamoDetalle)"
              class="btn-primary flex-1"
            >
              Registrar Abono
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Compartir Préstamo por WhatsApp -->
    <div v-if="modalCompartirPrestamo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalCompartirPrestamo = false"></div>
      <div class="relative max-w-md w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <ChatBubbleLeftIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">
                  Información del Préstamo
                </h3>
                <p class="text-white/90 text-xs">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
              </div>
            </div>
            <button 
              @click="modalCompartirPrestamo = false"
              class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <!-- Información del préstamo para compartir -->
          <div 
            ref="prestamoRef"
            class="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-4"
          >
            <div class="text-center mb-4">
              <h4 class="text-2xl font-bold text-gray-800 mb-2">Información del Préstamo</h4>
              <p class="text-sm text-gray-600">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Monto del préstamo</p>
                <p class="font-bold text-lg text-gray-800">${{ formatMoney(prestamoDetalle?.monto) }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Interés mensual</p>
                <p class="font-bold text-lg text-blue-600">{{ prestamoDetalle?.interes }}%</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Saldo actual</p>
                <p class="font-bold text-lg" :class="prestamoDetalle?.saldo_actual > 0 ? 'text-red-600' : 'text-green-600'">
                  ${{ formatMoney(prestamoDetalle?.saldo_actual) }}
                </p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Número de cuotas</p>
                <p class="font-bold text-lg text-gray-800">{{ prestamoDetalle?.numero_cuotas || 1 }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Valor de la cuota</p>
                <p class="font-bold text-lg text-purple-600">${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Interés generado</p>
                <p class="font-bold text-lg text-orange-600">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
                <p class="text-xs text-gray-500 mb-1">Monto pagado</p>
                <p class="font-bold text-lg text-emerald-600">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</p>
              </div>
            </div>
            
            <div class="bg-white/70 rounded-lg p-3 border border-blue-200 mt-4">
              <p class="text-xs text-gray-500 mb-1">Estado</p>
              <span 
                :class="[
                  'inline-block px-3 py-1 rounded-full text-sm font-bold',
                  prestamoDetalle?.estado === 'pagado' 
                    ? 'bg-green-100 text-green-700' : 
                  prestamoDetalle?.estado === 'activo' 
                    ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'
                ]"
              >
                {{ prestamoDetalle?.estado }}
              </span>
            </div>
            
            <div class="bg-white/70 rounded-lg p-3 border border-blue-200">
              <p class="text-xs text-gray-500 mb-1">Fecha de creación</p>
              <p class="font-semibold text-gray-700">{{ formatDate(prestamoDetalle?.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Footer fijo con botones -->
        <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 space-y-3">
          <div class="space-y-3">
            <button 
              @click="descargarPrestamo"
              :disabled="generandoImagenPrestamo"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
              {{ generandoImagenPrestamo ? 'Generando...' : 'Descargar Imagen' }}
            </button>

            <button 
              @click="compartirPrestamoWhatsApp"
              :disabled="generandoImagenPrestamo || !prestamoDetalle?.socio_natillera?.socio?.telefono"
              :class="[
                'block sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all',
                (generandoImagenPrestamo || !prestamoDetalle?.socio_natillera?.socio?.telefono)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              ]"
              :title="!prestamoDetalle?.socio_natillera?.socio?.telefono ? 'No hay teléfono registrado para este socio' : ''"
            >
              <ChatBubbleLeftIcon class="w-5 h-5" />
              <span v-if="generandoImagenPrestamo">Preparando...</span>
              <span v-else-if="!prestamoDetalle?.socio_natillera?.socio?.telefono">📲 Sin teléfono registrado</span>
              <span v-else>📲 Compartir por WhatsApp</span>
            </button>
          </div>

          <p class="text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>

          <button 
            @click="modalCompartirPrestamo = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar abono -->
    <div v-if="abonoAEliminar" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="abonoAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-amber-100/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-lg">
              <TrashIcon class="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 class="text-xl font-display font-bold text-gray-800">Eliminar Abono</h3>
              <p class="text-sm text-gray-600">Esta acción actualizará el saldo del préstamo</p>
            </div>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-700 mb-3">
              ¿Estás seguro de que deseas eliminar el abono de <strong class="text-gray-900">${{ formatMoney(abonoAEliminar?.valor) }}</strong>?
            </p>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-amber-600 text-lg">⚠️</span>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-amber-800 mb-2 text-sm">Al eliminar este abono:</p>
                  <ul class="space-y-2 text-sm text-amber-700">
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      <span>Se sumará ${{ formatMoney(abonoAEliminar?.valor) }} al saldo del préstamo</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      <span>El estado del préstamo puede cambiar si el saldo aumenta</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      <span>Esta acción no se puede deshacer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="abonoAEliminar = null"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              @click="eliminarAbonoConfirmado"
              :disabled="loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrashIcon v-if="!loading" class="w-5 h-5" />
              <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar préstamo -->
    <div v-if="prestamoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="prestamoAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-red-100/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
              <TrashIcon class="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h3 class="text-xl font-display font-bold text-gray-800">Eliminar Préstamo</h3>
              <p class="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-700 mb-3">
              ¿Estás seguro de que deseas eliminar el préstamo de <strong class="text-gray-900">{{ prestamoAEliminar?.socio_natillera?.socio?.nombre || 'este socio' }}</strong>?
            </p>
            <div class="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-red-600 text-lg">⚠️</span>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-red-800 mb-2 text-sm">Se perderá permanentemente:</p>
                  <ul class="space-y-2 text-sm text-red-700">
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>El registro completo del préstamo</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Todos los abonos y pagos registrados</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Todo el historial de transacciones</span>
                    </li>
                  </ul>
                  <p class="mt-3 text-xs text-red-600 font-semibold bg-white/50 rounded-lg p-2">
                    💡 Esta acción es irreversible. Asegúrate de que realmente deseas eliminar este préstamo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="prestamoAEliminar = null"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              @click="eliminarPrestamoConfirmado"
              :disabled="loading"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrashIcon v-if="!loading" class="w-5 h-5" />
              <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
import { 
  ArrowLeftIcon,
  PlusIcon,
  BanknotesIcon,
  UserIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { getAvatarUrl } from '../../utils/avatars'

const notificationStore = useNotificationStore()
const auditoria = useAuditoria()

const props = defineProps({
  id: String
})

const route = useRoute()
const id = props.id || route.params.id

const prestamos = ref([])
const socios = ref([])
const loading = ref(false)
const modalNuevoPrestamo = ref(false)
const modalAbono = ref(false)
const modalEditarAbono = ref(false)
const modalDetalle = ref(false)
const prestamoSeleccionado = ref(null)
const prestamoDetalle = ref(null)
const pagosPrestamo = ref([])
const prestamoAEliminar = ref(null)
const abonoAEliminar = ref(null)
const abonoAEditar = ref(null)
const modalCompartirPrestamo = ref(false)
const generandoImagenPrestamo = ref(false)
const prestamoRef = ref(null)

const formPrestamo = reactive({
  socio_natillera_id: '',
  monto: 100000,
  interes: 2,
  numero_cuotas: 1,
  tipo_interes: 'simple' // 'simple' o 'compuesto'
})

const montoFormateado = ref('100.000')
const mostrarSelectorSocio = ref(false)
const busquedaSocio = ref('')
const mostrarInteresAnticipado = ref(false)
const calcularPorMontoARecibir = ref(false)
const montoARecibirFormateado = ref('')

const formAbono = reactive({
  valor: 0
})
const valorAbonoFormateado = ref('')
const modalComprobanteAbono = ref(false)
const comprobanteAbono = ref(null)
const generandoImagenComprobante = ref(false)
const comprobanteRef = ref(null)

const totalPrestado = computed(() => 
  prestamos.value.reduce((sum, p) => sum + p.monto, 0)
)

const totalIntereses = computed(() => 
  prestamos.value.reduce((sum, p) => {
    // Si es interés anticipado, usar el interés_total guardado (ya se cobró al inicio)
    if (p.interes_anticipado && p.interes_total) {
      return sum + (parseFloat(p.interes_total) || 0)
    }
    // Si es interés mes vencido, calcular basado en lo pagado
    const interesGenerado = (p.monto - p.saldo_actual) * (p.interes / 100)
    return sum + interesGenerado
  }, 0)
)

const totalPagado = computed(() => 
  prestamos.value.reduce((sum, p) => {
    // El total pagado es la diferencia entre el monto original y el saldo actual
    const pagado = parseFloat(p.monto || 0) - parseFloat(p.saldo_actual || 0)
    return sum + Math.max(0, pagado) // Asegurar que no sea negativo
  }, 0)
)

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function formatCurrencyInput(value) {
  // Remover todos los caracteres no numéricos
  const numericValue = String(value).replace(/\D/g, '')
  // Formatear como número
  if (!numericValue) return ''
  return formatMoney(parseInt(numericValue))
}

function actualizarMonto(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    formPrestamo.monto = 0
    montoFormateado.value = ''
    return
  }
  
  // Convertir a número
  const numero = parseInt(valorSinFormato)
  
  // Validar que sea un número válido
  if (isNaN(numero)) {
    return
  }
  
  // Actualizar el valor numérico
  formPrestamo.monto = numero
  
  // Formatear para mostrar en el input
  montoFormateado.value = formatMoney(numero)
}

const socioSeleccionado = computed(() => {
  return socios.value.find(s => s.id === formPrestamo.socio_natillera_id)
})

const sociosFiltrados = computed(() => {
  if (!busquedaSocio.value) return socios.value
  const busqueda = busquedaSocio.value.toLowerCase()
  return socios.value.filter(s => 
    s.socio?.nombre?.toLowerCase().includes(busqueda) ||
    s.socio?.email?.toLowerCase().includes(busqueda) ||
    s.socio?.telefono?.includes(busqueda)
  )
})

// Capital que se va a prestar (siempre es el monto ingresado, igual en ambos casos)
const capitalAPrestar = computed(() => {
  return formPrestamo.monto || 0
})

const interesTotal = computed(() => {
  if (!capitalAPrestar.value || !formPrestamo.interes || !formPrestamo.numero_cuotas) return 0
  
  const monto = capitalAPrestar.value
  const tasaMensual = formPrestamo.interes / 100
  const cuotas = formPrestamo.numero_cuotas
  
  if (formPrestamo.tipo_interes === 'compuesto') {
    // Interés compuesto: M = C * (1 + i)^n
    // Interés = M - C
    const montoFinal = monto * Math.pow(1 + tasaMensual, cuotas)
    return montoFinal - monto
  } else {
    // Interés simple: I = C * i * n
    return monto * tasaMensual * cuotas
  }
})

const montoTotal = computed(() => {
  return capitalAPrestar.value + interesTotal.value
})

// El interés es el mismo para normal y anticipado, solo cambia cuándo se cobra
// Ya está calculado en interesTotal, no necesitamos una variable separada

// Calcular capital necesario para obtener un monto exacto a recibir (interés anticipado)
function calcularCapitalNecesario(montoARecibir, tasaMensual, cuotas, tipoInteres) {
  if (!montoARecibir || !tasaMensual || !cuotas || montoARecibir <= 0) return 0
  
  if (tipoInteres === 'simple') {
    // Monto a recibir = Capital × (1 - tasa × meses)
    // Capital = Monto a recibir / (1 - tasa × meses)
    const divisor = 1 - (tasaMensual * cuotas)
    if (divisor <= 0) return 0 // Evitar división por cero o negativa
    return montoARecibir / divisor
  } else {
    // Interés compuesto anticipado:
    // Monto a recibir = Capital - Capital × ((1 + tasa)^meses - 1)
    // Monto a recibir = Capital × (2 - (1 + tasa)^meses)
    // Capital = Monto a recibir / (2 - (1 + tasa)^meses)
    const factor = Math.pow(1 + tasaMensual, cuotas)
    const divisor = 2 - factor
    if (divisor <= 0) return 0 // Evitar división por cero o negativa
    return montoARecibir / divisor
  }
}

function actualizarMontoARecibir(event) {
  const valorSinFormato = event.target.value.replace(/\./g, '')
  if (!valorSinFormato) {
    formPrestamo.monto = 0
    montoARecibirFormateado.value = ''
    return
  }
  const montoNecesario = parseInt(valorSinFormato)
  if (isNaN(montoNecesario)) return
  
  // Calcular el capital necesario para que reciba exactamente ese monto
  const tasaMensual = formPrestamo.interes / 100
  const capitalNecesario = calcularCapitalNecesario(
    montoNecesario,
    tasaMensual,
    formPrestamo.numero_cuotas,
    formPrestamo.tipo_interes
  )
  formPrestamo.monto = Math.round(capitalNecesario)
  montoFormateado.value = formatMoney(formPrestamo.monto)
  montoARecibirFormateado.value = formatMoney(montoNecesario)
}

// El monto que recibe el socio (desembolso real)
const montoARecibir = computed(() => {
  if (mostrarInteresAnticipado.value) {
    // Con interés anticipado, el socio recibe el capital menos el interés (que se retiene)
    return capitalAPrestar.value - interesTotal.value
  }
  // Con interés normal, el socio recibe el capital completo
  return capitalAPrestar.value
})

// Movimiento total del fondo al inicio
const movimientoFondoInicio = computed(() => {
  if (mostrarInteresAnticipado.value) {
    // Con interés anticipado: capital que sale + interés que se retiene y queda en el fondo
    return capitalAPrestar.value + interesTotal.value
  }
  // Con interés normal: solo sale el capital
  return capitalAPrestar.value
})

// Total a pagar / Pago final estimado
const montoAPagar = computed(() => {
  if (mostrarInteresAnticipado.value) {
    // Con interés anticipado, el socio solo paga el capital (interés ya cobrado)
    return capitalAPrestar.value
  }
  // Con interés normal, el total a pagar es capital + intereses
  return montoTotal.value
})

// Cuota mensual: con anticipado solo se divide el capital, con normal se divide el total
const cuotaMensual = computed(() => {
  if (mostrarInteresAnticipado.value) {
    // Con interés anticipado, la cuota es solo el capital dividido entre las cuotas
    return capitalAPrestar.value / formPrestamo.numero_cuotas
  }
  // Con interés normal, la cuota es el total (capital + intereses) dividido entre las cuotas
  return montoTotal.value / formPrestamo.numero_cuotas
})

// Calcular cuota mensual para el detalle del préstamo
function calcularCuotaMensualDetalle(prestamo) {
  if (!prestamo) return 0
  const numeroCuotas = prestamo.numero_cuotas || 1
  
  if (prestamo.interes_anticipado) {
    // Con interés anticipado, la cuota es solo el capital dividido entre las cuotas
    return prestamo.monto / numeroCuotas
  } else {
    // Con interés normal, calcular el total (capital + intereses) y dividir entre las cuotas
    const monto = prestamo.monto || 0
    const tasaMensual = (prestamo.interes || 0) / 100
    const cuotas = numeroCuotas
    
    let interesTotal = 0
    if (prestamo.tipo_interes === 'compuesto') {
      const montoFinal = monto * Math.pow(1 + tasaMensual, cuotas)
      interesTotal = montoFinal - monto
    } else {
      interesTotal = monto * tasaMensual * cuotas
    }
    
    const montoTotal = monto + interesTotal
    return montoTotal / numeroCuotas
  }
}

// Calcular valor pagado a la fecha (capital amortizado)
function calcularValorPagadoDetalle(prestamo) {
  if (!prestamo) return 0
  const monto = prestamo.monto || 0
  const saldoActual = prestamo.saldo_actual || 0
  return monto - saldoActual
}

// Calcular cuotas restantes
function calcularCuotasRestantes(prestamo) {
  if (!prestamo) return 0
  const cuotaMensual = calcularCuotaMensualDetalle(prestamo)
  if (cuotaMensual <= 0) return 0
  const saldoActual = prestamo.saldo_actual || 0
  const cuotasRestantes = Math.ceil(saldoActual / cuotaMensual)
  return cuotasRestantes
}

// Función para generar código único de comprobante
function generarCodigoComprobante() {
  // Generar código alfanumérico único: 8 caracteres
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

// Calcular interés generado para el detalle del préstamo
function calcularInteresGeneradoDetalle(prestamo) {
  if (!prestamo) return 0
  
  // Si es interés anticipado, usar el interés_total guardado
  if (prestamo.interes_anticipado && prestamo.interes_total) {
    return parseFloat(prestamo.interes_total) || 0
  }
  
  // Si es interés mes vencido, calcular basado en lo pagado
  const monto = prestamo.monto || 0
  const saldoActual = prestamo.saldo_actual || 0
  const tasaMensual = (prestamo.interes || 0) / 100
  
  // Calcular el interés total del préstamo
  const numeroCuotas = prestamo.numero_cuotas || 1
  let interesTotal = 0
  
  if (prestamo.tipo_interes === 'compuesto') {
    const montoFinal = monto * Math.pow(1 + tasaMensual, numeroCuotas)
    interesTotal = montoFinal - monto
  } else {
    interesTotal = monto * tasaMensual * numeroCuotas
  }
  
  // Si ya está pagado, retornar el interés total
  if (saldoActual <= 0) {
    return interesTotal
  }
  
  // Calcular proporción pagada
  const montoPagado = monto - saldoActual
  const proporcionPagada = montoPagado / monto
  
  // Retornar interés generado proporcional a lo pagado
  return interesTotal * proporcionPagada
}

function seleccionarSocio(socio) {
  formPrestamo.socio_natillera_id = socio.id
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
}

function cerrarSelectorSocio() {
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function fetchPrestamos() {
  loading.value = true
  try {
    // Primero obtener los IDs de socios_natillera de esta natillera
    const { data: sociosNatillera } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(*)')
      .eq('natillera_id', id)

    if (!sociosNatillera || sociosNatillera.length === 0) {
      prestamos.value = []
      return
    }

    const socioNatilleraIds = sociosNatillera.map(s => s.id)

    const { data, error } = await supabase
      .from('prestamos')
      .select('*')
      .in('socio_natillera_id', socioNatilleraIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Combinar con datos del socio
    prestamos.value = (data || []).map(prestamo => {
      const socioNatillera = sociosNatillera.find(s => s.id === prestamo.socio_natillera_id)
      return {
        ...prestamo,
        socio_natillera: socioNatillera
      }
    })
  } catch (e) {
    console.error('Error cargando préstamos:', e)
  } finally {
    loading.value = false
  }
}

async function fetchSocios() {
  try {
    const { data, error } = await supabase
      .from('socios_natillera')
      .select(`*, socio:socios(*)`)
      .eq('natillera_id', id)
      .eq('estado', 'activo')

    if (error) throw error
    socios.value = data || []
  } catch (e) {
    console.error('Error cargando socios:', e)
  }
}

function abrirModalAbono(prestamo) {
  prestamoSeleccionado.value = prestamo
  formAbono.valor = prestamo.saldo_actual
  valorAbonoFormateado.value = formatMoney(prestamo.saldo_actual)
  modalAbono.value = true
  // Guardar si el modal de detalle estaba abierto para este préstamo
  if (prestamoDetalle.value && prestamoDetalle.value.id === prestamo.id) {
    // No cerrar el modal de detalle, solo abrir el modal de abono encima
  }
}

function actualizarValorAbono(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    formAbono.valor = 0
    valorAbonoFormateado.value = ''
    return
  }
  
  const valorNumerico = parseInt(valorSinFormato)
  if (isNaN(valorNumerico)) return
  
  // Actualizar el valor numérico
  formAbono.valor = valorNumerico
  
  // Formatear el valor con puntos
  valorAbonoFormateado.value = formatMoney(valorNumerico)
}

function cerrarModalAbono() {
  modalAbono.value = false
  formAbono.valor = 0
  valorAbonoFormateado.value = ''
  prestamoSeleccionado.value = null
}

function generarImagenComprobanteAbono() {
  return new Promise((resolve) => {
    try {
      if (!comprobanteAbono.value) {
        resolve(null)
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const codigoComprobante = comprobanteAbono.value.codigoComprobante
      const width = 480
      const height = 680
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // Agregar roundRect si no existe
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, w, h, r) {
          if (w < 2 * r) r = w / 2
          if (h < 2 * r) r = h / 2
          this.beginPath()
          this.moveTo(x + r, y)
          this.arcTo(x + w, y, x + w, y + h, r)
          this.arcTo(x + w, y + h, x, y + h, r)
          this.arcTo(x, y + h, x, y, r)
          this.arcTo(x, y, x + w, y, r)
          this.closePath()
        }
      }
      
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
      
      // === HEADER ===
      // "Comprobante de Abono" a la izquierda (grande, bold, blanco)
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Comprobante de Abono', 32, 52)
      
      // "natillerapp" a la derecha (pequeño, gris claro)
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      ctx.fillText('natillerapp', width - 32, 52)
      
      // Línea decorativa con gradiente verde-azul
      const lineGradient = ctx.createLinearGradient(32, 0, width - 32, 0)
      lineGradient.addColorStop(0, 'transparent')
      lineGradient.addColorStop(0.3, '#10b981')
      lineGradient.addColorStop(0.5, '#06b6d4')
      lineGradient.addColorStop(0.7, '#10b981')
      lineGradient.addColorStop(1, 'transparent')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 72)
      ctx.lineTo(width - 32, 72)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = 95
      const cardHeight = 485
      const cardMargin = 24
      
      // Fondo de la tarjeta blanca con glassmorphism
      ctx.fillStyle = 'rgba(255,255,255,0.98)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      
      // Sombra sutil para profundidad
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      const cardInnerX = cardMargin + 28
      const cardInnerWidth = width - cardMargin*2 - 56
      
      // === VALOR PAGADO (HERO) - Centrado ===
      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('VALOR PAGADO', width/2, cardY + 50)
      
      // Valor grande con gradiente verde
      const valorText = '$' + formatMoney(comprobanteAbono.value.valor)
      ctx.font = 'bold 52px Arial'
      const valorGradient = ctx.createLinearGradient(0, cardY + 55, 0, cardY + 110)
      valorGradient.addColorStop(0, '#059669')
      valorGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = valorGradient
      ctx.fillText(valorText, width/2, cardY + 105)
      
      // Badge "Pago Verificado" centrado debajo del monto
      const badgeY = cardY + 125
      ctx.fillStyle = '#dcfce7'
      ctx.beginPath()
      ctx.roundRect(width/2 - 60, badgeY, 120, 32, 16)
      ctx.fill()
      
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Pago Verificado', width/2, badgeY + 21)
      
      // === CÓDIGO DE COMPROBANTE (debajo de "Pago Verificado") ===
      let codigoY = null
      if (codigoComprobante) {
        codigoY = badgeY + 45
        // Código en negrita y visible, sin etiqueta
        ctx.fillStyle = '#64748b'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(codigoComprobante, width/2, codigoY)
      }
      
      // === DETALLES EN CARDS ===
      // Ajustar posición de los detalles si hay código
      const detailsY = codigoY ? codigoY + 25 : badgeY + 60
      
      // Card: Socio con mejor estilo
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 18, detailsY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(comprobanteAbono.value.socioNombre || 'Socio', cardInnerX + 18, detailsY + 46)
      
      // Card: Concepto con mejor estilo
      const conceptoY = detailsY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, conceptoY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, conceptoY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CONCEPTO / CUOTA', cardInnerX + 18, conceptoY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText('Abono a Préstamo', cardInnerX + 18, conceptoY + 46)
      
      // Card: Fecha con mejor estilo
      const fechaY = conceptoY + 75
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, fechaY, cardInnerWidth, 62, 14)
      ctx.fill()
      
      // Sombra sutil en las cards
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, fechaY, cardInnerWidth, 62, 14)
      ctx.stroke()
      
      // Resetear sombra
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('FECHA Y HORA DEL PAGO', cardInnerX + 18, fechaY + 24)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 15px Arial'
      ctx.fillText(comprobanteAbono.value.fecha || 'Fecha no disponible', cardInnerX + 18, fechaY + 46)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      // El botón debe quedar fuera de la tarjeta blanca, al final
      const btnY = cardY + cardHeight + 20
      
      // Sombra del botón para profundidad
      ctx.fillStyle = 'rgba(5, 150, 105, 0.3)'
      ctx.beginPath()
      ctx.roundRect(cardInnerX + 2, btnY + 2, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Botón con gradiente mejorado
      const btnGradient = ctx.createLinearGradient(cardInnerX, btnY, cardInnerX, btnY + 52)
      btnGradient.addColorStop(0, '#059669')
      btnGradient.addColorStop(0.5, '#10b981')
      btnGradient.addColorStop(1, '#047857')
      ctx.fillStyle = btnGradient
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Borde sutil del botón
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.stroke()
      
      // Texto del botón con sombra
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PAGO EXITOSO', cardInnerX + cardInnerWidth/2 + 1, btnY + 34)
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PAGO EXITOSO', cardInnerX + cardInnerWidth/2, btnY + 33)
      
      resolve(canvas)
    } catch (e) {
      console.error('Error generando canvas:', e)
      resolve(null)
    }
  })
}

async function descargarComprobanteAbono() {
  if (!comprobanteAbono.value) {
    notificationStore.error('El comprobante no está listo. Intenta de nuevo.', 'Error')
    return
  }
  
  generandoImagenComprobante.value = true
  
  try {
    const canvas = await generarImagenComprobanteAbono()
    
    if (!canvas) {
      throw new Error('No se pudo generar el canvas')
    }
    
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `comprobante-abono-${comprobanteAbono.value?.socioNombre?.replace(/\s+/g, '-') || 'abono'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    notificationStore.success('Comprobante descargado exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error al generar imagen:', e)
    notificationStore.error('Error al generar la imagen: ' + e.message, 'Error')
  } finally {
    generandoImagenComprobante.value = false
  }
}

async function reenviarComprobanteAbono(pago) {
  if (!pago || !pago.codigo_comprobante) {
    notificationStore.error('Este abono no tiene código de comprobante', 'Error')
    return
  }
  
  if (!prestamoDetalle.value) {
    notificationStore.error('No hay préstamo seleccionado', 'Error')
    return
  }
  
  try {
    // Obtener información completa del préstamo para calcular saldos
    const prestamo = prestamoDetalle.value
    const socioNombre = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = prestamo.socio_natillera?.socio?.telefono || null
    
    // Calcular saldo anterior (sumando el valor del abono al saldo actual)
    const saldoAnterior = (prestamo.saldo_actual || 0) + (parseFloat(pago.valor) || 0)
    const saldoNuevo = prestamo.saldo_actual || 0
    
    // Preparar datos del comprobante
    comprobanteAbono.value = {
      valor: parseFloat(pago.valor) || 0,
      codigoComprobante: pago.codigo_comprobante,
      socioNombre: socioNombre,
      socioTelefono: socioTelefono,
      fecha: pago.fecha 
        ? new Date(pago.fecha).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Fecha no disponible',
      saldoAnterior: saldoAnterior,
      saldoNuevo: saldoNuevo,
      prestamo: prestamo
    }
    
    // Abrir modal de comprobante
    modalComprobanteAbono.value = true
  } catch (e) {
    console.error('Error al preparar comprobante:', e)
    notificationStore.error('Error al preparar el comprobante: ' + e.message, 'Error')
  }
}

async function compartirWhatsAppAbono() {
  if (!comprobanteAbono.value) return
  
  generandoImagenComprobante.value = true
  
  try {
    const canvas = await generarImagenComprobanteAbono()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    
    const archivo = new File([blob], `comprobante-abono-${Date.now()}.png`, { type: 'image/png' })
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Comprobante de Abono',
        text: `Hola ${comprobanteAbono.value.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo en la natillera.\n\n¡Gracias por estar al día! 🙌`
      })
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `comprobante-abono-${comprobanteAbono.value.socioNombre?.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = comprobanteAbono.value.socioTelefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${comprobanteAbono.value.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo. ¡Gracias por estar al día! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
      }, 500)
    }
  } catch (e) {
    console.error('Error compartiendo por WhatsApp:', e)
    // Si falla el share API, intentar abrir WhatsApp directamente
    const telefono = comprobanteAbono.value.socioTelefono?.replace(/\D/g, '')
    if (telefono) {
      const mensaje = `Hola ${comprobanteAbono.value.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo en la natillera.\n\n¡Gracias por estar al día! 🙌`
      window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
    } else {
      notificationStore.error('No se pudo compartir el comprobante', 'Error')
    }
  } finally {
    generandoImagenComprobante.value = false
  }
}

async function abrirModalDetalle(prestamo) {
  prestamoDetalle.value = prestamo
  modalDetalle.value = true
  await fetchPagosPrestamo(prestamo.id)
}

async function fetchPagosPrestamo(prestamoId) {
  try {
    console.log('🔍 Buscando pagos para préstamo:', prestamoId)
    const { data, error } = await supabase
      .from('pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha', { ascending: false })

    if (error) {
      console.error('❌ Error en la consulta:', error)
      throw error
    }
    
    console.log('✅ Pagos encontrados:', data)
    pagosPrestamo.value = data || []
    console.log('📋 pagosPrestamo.value actualizado:', pagosPrestamo.value)
  } catch (e) {
    console.error('❌ Error cargando pagos del préstamo:', e)
    pagosPrestamo.value = []
  }
}

async function handleCrearPrestamo() {
  // Validar monto mínimo
  const capital = Math.round(capitalAPrestar.value)
  if (capital < 10000) {
    notificationStore.warning('El monto mínimo del préstamo es $10.000', 'Monto insuficiente')
    return
  }
  
  loading.value = true
  try {
    // Calcular el interés total
    const interesTotalCalculado = Math.round(interesTotal.value)
    
    const { data, error } = await supabase
      .from('prestamos')
      .insert({
        socio_natillera_id: formPrestamo.socio_natillera_id,
        monto: capital,
        interes: formPrestamo.interes,
        saldo_actual: capital,
        estado: 'activo',
        tipo_interes: formPrestamo.tipo_interes,
        interes_anticipado: mostrarInteresAnticipado.value,
        interes_total: interesTotalCalculado,
        numero_cuotas: formPrestamo.numero_cuotas
      })
      .select(`
        *,
        socio_natillera:socios_natillera(*, socio:socios(*))
      `)
      .single()

    if (error) throw error
    
    // Obtener el natillera_id del socio_natillera
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('id', formPrestamo.socio_natillera_id)
      .single()
    
    const nombreSocio = data.socio_natillera?.socio?.nombre || 'Socio'
    
    // Registrar en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarCreacion(
        'prestamo',
        data.id,
        `Se creó un préstamo de $${formatMoney(capital)} para ${nombreSocio}`,
        {
          monto: capital,
          interes: formPrestamo.interes,
          tipo_interes: formPrestamo.tipo_interes,
          numero_cuotas: formPrestamo.numero_cuotas,
          interes_anticipado: mostrarInteresAnticipado.value,
          interes_total: interesTotalCalculado,
          saldo_actual: capital,
          estado: 'activo'
        },
        socioNatillera?.natillera_id || null
      )
    )
    
    prestamos.value.unshift(data)
    modalNuevoPrestamo.value = false
    formPrestamo.socio_natillera_id = ''
    formPrestamo.monto = 100000
    formPrestamo.interes = 2
    formPrestamo.numero_cuotas = 1
    formPrestamo.tipo_interes = 'simple'
    montoFormateado.value = '100.000'
    montoARecibirFormateado.value = ''
    mostrarSelectorSocio.value = false
    busquedaSocio.value = ''
    calcularPorMontoARecibir.value = false
    mostrarInteresAnticipado.value = false
    montoFormateado.value = '100.000'
    formPrestamo.interes = 2
    formPrestamo.numero_cuotas = 1
    formPrestamo.tipo_interes = 'simple'
    mostrarSelectorSocio.value = false
    busquedaSocio.value = ''
    notificationStore.success('Préstamo creado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al crear el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

function handleClickOutside(event) {
  if (mostrarSelectorSocio.value && !event.target.closest('.selector-socio-container')) {
    cerrarSelectorSocio()
  }
}

onMounted(() => {
  fetchPrestamos()
  fetchSocios()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

async function handleRegistrarAbono() {
  console.log('🚀 handleRegistrarAbono llamado')
  console.log('📋 prestamoSeleccionado.value:', prestamoSeleccionado.value)
  console.log('💰 formAbono.valor:', formAbono.valor)
  
  if (!prestamoSeleccionado.value) {
    console.error('❌ No hay préstamo seleccionado')
    notificationStore.error('No hay préstamo seleccionado', 'Error')
    return
  }
  
  if (!formAbono.valor || formAbono.valor <= 0) {
    console.error('❌ Valor del abono inválido:', formAbono.valor)
    notificationStore.error('El valor del abono debe ser mayor a 0', 'Error')
    return
  }
  
  console.log('⏳ Iniciando registro de abono...')
  loading.value = true

  try {
    const nuevoSaldo = prestamoSeleccionado.value.saldo_actual - formAbono.valor
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'activo'

    // Verificar que el préstamo existe y pertenece al usuario antes de insertar
    console.log('🔍 Verificando préstamo antes de insertar...')
    const { data: prestamoVerificado, error: errorVerificacion } = await supabase
      .from('prestamos')
      .select(`
        id,
        socio_natillera_id,
        socios_natillera!inner(
          id,
          natillera_id,
          natilleras!inner(
            id,
            admin_id
          )
        )
      `)
      .eq('id', prestamoSeleccionado.value.id)
      .single()
    
    console.log('🔍 Resultado de verificación:', { prestamoVerificado, errorVerificacion })
    
    if (errorVerificacion || !prestamoVerificado) {
      console.error('❌ Error verificando préstamo:', errorVerificacion)
      throw new Error('No se pudo verificar el préstamo. Verifica que pertenezca a tu natillera.')
    }
    
    console.log('✅ Préstamo verificado correctamente')
    console.log('📋 Admin ID del préstamo:', prestamoVerificado.socios_natillera?.natilleras?.admin_id)
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Usuario actual:', user?.id)
    
    // Generar código de comprobante único
    let codigoComprobante = generarCodigoComprobante()
    let intentos = 0
    let codigoUnico = false
    while (!codigoUnico && intentos < 5) {
      const { data: codigoExistente } = await supabase
        .from('pagos_prestamo')
        .select('id')
        .eq('codigo_comprobante', codigoComprobante)
        .limit(1)
      
      if (!codigoExistente || codigoExistente.length === 0) {
        codigoUnico = true
      } else {
        codigoComprobante = generarCodigoComprobante()
      }
      intentos++
    }
    
    // Registrar el pago
    const datosPago = {
      prestamo_id: prestamoSeleccionado.value.id,
      valor: parseFloat(formAbono.valor),
      fecha: new Date().toISOString(),
      codigo_comprobante: codigoComprobante
    }
    
    console.log('💾 Registrando abono con datos:', datosPago)
    console.log('💾 Tipo de prestamo_id:', typeof datosPago.prestamo_id)
    console.log('💾 Tipo de valor:', typeof datosPago.valor)
    
    const { data: pagoInsertado, error: errorPago } = await supabase
      .from('pagos_prestamo')
      .insert(datosPago)
      .select()
    
    console.log('📥 Respuesta del insert:', { data: pagoInsertado, error: errorPago })
    
    if (errorPago) {
      console.error('❌ Error insertando pago:', errorPago)
      console.error('❌ Código del error:', errorPago.code)
      console.error('❌ Mensaje del error:', errorPago.message)
      console.error('❌ Detalles completos:', JSON.stringify(errorPago, null, 2))
      throw new Error('Error al registrar el abono: ' + (errorPago.message || 'Error desconocido'))
    }
    
    if (!pagoInsertado || pagoInsertado.length === 0) {
      console.error('❌ No se insertó ningún pago. Respuesta vacía:', pagoInsertado)
      console.error('❌ Esto puede indicar un problema con las políticas RLS')
      throw new Error('No se pudo registrar el abono. Verifica los permisos de la base de datos.')
    }
    
    console.log('✅ Pago insertado correctamente:', pagoInsertado)
    console.log('✅ ID del pago insertado:', pagoInsertado[0]?.id)

    // Obtener datos anteriores del préstamo para auditoría
    const datosAnteriores = {
      saldo_actual: prestamoSeleccionado.value.saldo_actual,
      estado: prestamoSeleccionado.value.estado
    }
    
    // Actualizar el préstamo
    const { data, error } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoSeleccionado.value.id)
      .select(`
        *,
        socio_natillera:socios_natillera(
          natillera_id,
          socio:socios(nombre)
        )
      `)
      .single()

    if (error) throw error

    // Obtener natillera_id
    const natilleraId = data.socio_natillera?.natillera_id || null
    const nombreSocio = data.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = data.socio_natillera?.socio?.telefono || null
    
    // Registrar pago en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarPago(
        pagoInsertado[0].id,
        `Se registró un abono de $${formatMoney(formAbono.valor)} al préstamo de ${nombreSocio}. Saldo anterior: $${formatMoney(datosAnteriores.saldo_actual)}, Saldo nuevo: $${formatMoney(Math.max(0, nuevoSaldo))}`,
        {
          prestamo_id: prestamoSeleccionado.value.id,
          valor_abono: formAbono.valor,
          saldo_anterior: datosAnteriores.saldo_actual,
          saldo_nuevo: Math.max(0, nuevoSaldo),
          estado_anterior: datosAnteriores.estado,
          estado_nuevo: nuevoEstado
        },
        natilleraId
      )
    )
    
    // Registrar actualización del préstamo en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarActualizacion(
        'prestamo',
        prestamoSeleccionado.value.id,
        `Se actualizó el préstamo de ${nombreSocio}. Saldo: $${formatMoney(datosAnteriores.saldo_actual)} → $${formatMoney(Math.max(0, nuevoSaldo))}`,
        datosAnteriores,
        {
          saldo_actual: Math.max(0, nuevoSaldo),
          estado: nuevoEstado
        },
        natilleraId
      )
    )

    // Actualizar en la lista local
    const index = prestamos.value.findIndex(p => p.id === prestamoSeleccionado.value.id)
    if (index !== -1) {
      prestamos.value[index] = { ...prestamos.value[index], ...data }
    }

    const prestamoIdAbonado = prestamoSeleccionado.value.id
    const estabaEnDetalle = prestamoDetalle.value && prestamoDetalle.value.id === prestamoIdAbonado
    
    // Preparar datos del comprobante
    comprobanteAbono.value = {
      valor: formAbono.valor,
      codigoComprobante: codigoComprobante,
      socioNombre: nombreSocio,
      socioTelefono: socioTelefono,
      fecha: new Date().toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      saldoAnterior: datosAnteriores.saldo_actual,
      saldoNuevo: Math.max(0, nuevoSaldo),
      prestamo: prestamoSeleccionado.value
    }
    
    modalAbono.value = false
    formAbono.valor = 0
    valorAbonoFormateado.value = ''
    prestamoSeleccionado.value = null
    
    // Abrir modal de comprobante
    modalComprobanteAbono.value = true
    
    // SIEMPRE recargar los pagos si el modal de detalle está abierto para este préstamo
    if (estabaEnDetalle) {
      console.log('🔄 Actualizando modal de detalle después del abono')
      // Actualizar el préstamo en el detalle con los nuevos datos
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
      // Esperar un momento para que la base de datos se actualice completamente
      await new Promise(resolve => setTimeout(resolve, 500))
      // Recargar los pagos del préstamo
      console.log('🔄 Recargando pagos para préstamo:', prestamoIdAbonado)
      await fetchPagosPrestamo(prestamoIdAbonado)
      // Asegurarse de que el modal de detalle esté abierto
      modalDetalle.value = true
      console.log('✅ Modal de detalle actualizado, pagos recargados. Total pagos:', pagosPrestamo.value.length)
      console.log('📋 Lista de pagos:', pagosPrestamo.value)
    } else if (modalDetalle.value && prestamoDetalle.value && prestamoDetalle.value.id === prestamoIdAbonado) {
      // Si el modal de detalle está abierto para este préstamo, recargar también
      console.log('🔄 Recargando pagos en modal de detalle abierto')
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchPagosPrestamo(prestamoIdAbonado)
      console.log('✅ Pagos recargados. Total:', pagosPrestamo.value.length)
    }
    
    notificationStore.success('Abono registrado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al registrar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function abrirModalEditarAbono(pago) {
  abonoAEditar.value = {
    ...pago,
    valorOriginal: parseFloat(pago.valor)
  }
  modalEditarAbono.value = true
}

async function guardarAbonoEditado() {
  if (!abonoAEditar.value || !prestamoDetalle.value) return
  
  loading.value = true
  
  try {
    const valorOriginal = parseFloat(abonoAEditar.value.valorOriginal || abonoAEditar.value.valor)
    const nuevoValor = parseFloat(abonoAEditar.value.valor)
    const diferencia = nuevoValor - valorOriginal
    const prestamoId = abonoAEditar.value.prestamo_id
    const codigoAnterior = abonoAEditar.value.codigo_comprobante
    
    // Si hay código anterior, generar nuevo código y guardar en historial (incluso si el valor no cambió)
    let nuevoCodigoComprobante = null
    if (codigoAnterior) {
      // Generar nuevo código de comprobante cuando se modifica el abono
      nuevoCodigoComprobante = generarCodigoComprobante()
      let intentos = 0
      let codigoUnico = false
      while (!codigoUnico && intentos < 5) {
        const { data: codigoExistente } = await supabase
          .from('pagos_prestamo')
          .select('id')
          .eq('codigo_comprobante', nuevoCodigoComprobante)
          .limit(1)
        
        if (!codigoExistente || codigoExistente.length === 0) {
          codigoUnico = true
        } else {
          nuevoCodigoComprobante = generarCodigoComprobante()
        }
        intentos++
      }
      
      // Guardar en historial antes de actualizar
      if (codigoUnico && nuevoCodigoComprobante) {
        try {
          // Obtener información del préstamo antes de actualizar
          const { data: pagoInfo } = await supabase
            .from('pagos_prestamo')
            .select(`
              prestamo_id,
              prestamo:prestamos(
                id,
                socio_natillera_id
              )
            `)
            .eq('id', abonoAEditar.value.id)
            .single()
          
          const prestamoIdHistorial = pagoInfo?.prestamo_id || prestamoId
          const socioNatilleraId = pagoInfo?.prestamo?.socio_natillera_id || prestamoDetalle.value.socio_natillera_id || null
          
          const { error: historialError } = await supabase
            .from('historial_comprobantes_prestamo')
            .insert({
              pago_prestamo_id: abonoAEditar.value.id,
              prestamo_id: prestamoIdHistorial,
              socio_natillera_id: socioNatilleraId,
              codigo_comprobante_anterior: codigoAnterior,
              codigo_comprobante_nuevo: nuevoCodigoComprobante,
              valor_abono_anterior: valorOriginal,
              valor_abono_nuevo: nuevoValor,
              motivo: 'actualizacion_pago',
              fecha_actualizacion: new Date().toISOString()
            })
          
          if (historialError) {
            console.error('Error guardando en historial:', historialError)
            throw historialError
          }
          console.log('✅ Historial guardado correctamente para actualización')
        } catch (e) {
          console.error('No se pudo guardar en historial de comprobantes:', e.message, e)
          // No lanzar el error aquí para que la actualización continúe
        }
      }
    }
    
    // Preparar datos de actualización
    const datosActualizar = {
      valor: nuevoValor
    }
    
    // Agregar el nuevo código si se generó
    if (nuevoCodigoComprobante) {
      datosActualizar.codigo_comprobante = nuevoCodigoComprobante
    }
    
    // Actualizar el abono
    const { error: errorActualizar } = await supabase
      .from('pagos_prestamo')
      .update(datosActualizar)
      .eq('id', abonoAEditar.value.id)
    
    if (errorActualizar) throw errorActualizar
    
    // Actualizar el saldo del préstamo (restar la diferencia)
    const nuevoSaldo = (prestamoDetalle.value.saldo_actual || 0) - diferencia
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : (nuevoSaldo >= prestamoDetalle.value.monto ? 'activo' : prestamoDetalle.value.estado)
    
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorPrestamo) throw errorPrestamo
    
    // Actualizar en la lista local
    const index = prestamos.value.findIndex(p => p.id === prestamoId)
    if (index !== -1) {
      prestamos.value[index] = { ...prestamos.value[index], ...prestamoActualizado }
    }
    
    // Actualizar el detalle si está abierto
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      prestamoDetalle.value = { ...prestamoDetalle.value, ...prestamoActualizado }
      // Recargar los pagos
      await fetchPagosPrestamo(prestamoId)
    }
    
    modalEditarAbono.value = false
    abonoAEditar.value = null
    notificationStore.success('Abono actualizado correctamente', 'Éxito')
  } catch (e) {
    console.error('Error actualizando abono:', e)
    notificationStore.error(e.message || 'Error al actualizar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarAbono(pago) {
  abonoAEliminar.value = pago
}

async function eliminarAbonoConfirmado() {
  if (!abonoAEliminar.value || !prestamoDetalle.value) return
  
  loading.value = true
  
  try {
    const valorAbono = parseFloat(abonoAEliminar.value.valor)
    const prestamoId = abonoAEliminar.value.prestamo_id
    const codigoComprobante = abonoAEliminar.value.codigo_comprobante
    const nuevoSaldo = (prestamoDetalle.value.saldo_actual || 0) + valorAbono
    const nuevoEstado = nuevoSaldo >= prestamoDetalle.value.monto ? 'activo' : prestamoDetalle.value.estado
    
    // Obtener información del usuario que elimina
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'Usuario desconocido'
    
    // Guardar en historial ANTES de eliminar (si tiene código de comprobante)
    // Importante: guardar antes de eliminar para poder obtener la información del préstamo
    // Registrar TODOS los códigos relacionados (actual y anteriores) para trazabilidad completa
    if (codigoComprobante) {
      try {
        // Obtener información del préstamo antes de eliminar
        const { data: pagoInfo } = await supabase
          .from('pagos_prestamo')
          .select(`
            prestamo_id,
            prestamo:prestamos(
              id,
              socio_natillera_id
            )
          `)
          .eq('id', abonoAEliminar.value.id)
          .single()
        
        const prestamoIdHistorial = pagoInfo?.prestamo_id || prestamoId
        const socioNatilleraId = pagoInfo?.prestamo?.socio_natillera_id || prestamoDetalle.value.socio_natillera_id || null
        
        // Buscar todos los códigos anteriores en el historial
        const { data: historialesAnteriores } = await supabase
          .from('historial_comprobantes_prestamo')
          .select('codigo_comprobante_anterior, codigo_comprobante_nuevo')
          .eq('pago_prestamo_id', abonoAEliminar.value.id)
          .order('fecha_actualizacion', { ascending: true })
        
        // Recolectar todos los códigos únicos (anteriores y actual)
        const codigosParaRegistrar = new Set()
        
        // Agregar el código actual
        codigosParaRegistrar.add(codigoComprobante)
        
        // Agregar todos los códigos anteriores del historial
        if (historialesAnteriores && historialesAnteriores.length > 0) {
          historialesAnteriores.forEach(hist => {
            if (hist.codigo_comprobante_anterior) {
              codigosParaRegistrar.add(hist.codigo_comprobante_anterior)
            }
            if (hist.codigo_comprobante_nuevo) {
              codigosParaRegistrar.add(hist.codigo_comprobante_nuevo)
            }
          })
        }
        
        // Registrar cada código en el historial con información de eliminación
        const registrosHistorial = Array.from(codigosParaRegistrar).map(codigo => ({
          pago_prestamo_id: abonoAEliminar.value.id,
          prestamo_id: prestamoIdHistorial,
          socio_natillera_id: socioNatilleraId,
          codigo_comprobante_anterior: codigo,
          codigo_comprobante_nuevo: null,
          valor_abono_anterior: valorAbono,
          valor_abono_nuevo: 0,
          motivo: 'eliminacion_pago',
          eliminado: true,
          eliminado_por: user?.id || null,
          eliminado_por_email: userEmail,
          eliminado_el: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        }))
        
        // Insertar todos los registros
        const { error: historialError } = await supabase
          .from('historial_comprobantes_prestamo')
          .insert(registrosHistorial)
        
        if (historialError) {
          console.error('Error guardando en historial:', historialError)
          // No lanzar el error aquí para que la eliminación continúe
          // pero registrar el error para debugging
        } else {
          console.log(`✅ Historial guardado correctamente para eliminación. ${registrosHistorial.length} código(s) registrado(s):`, Array.from(codigosParaRegistrar))
        }
      } catch (e) {
        console.error('No se pudo guardar en historial de comprobantes:', e.message, e)
        // No lanzar el error aquí, solo registrar, para que la eliminación continúe
      }
    }
    
    // Eliminar el abono
    const { error: errorEliminar } = await supabase
      .from('pagos_prestamo')
      .delete()
      .eq('id', abonoAEliminar.value.id)
    
    if (errorEliminar) throw errorEliminar
    
    // Actualizar el saldo del préstamo
    const { data: prestamoActualizado, error: errorActualizar } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: nuevoSaldo,
        estado: nuevoEstado
      })
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorActualizar) throw errorActualizar
    
    // Actualizar en la lista local
    const index = prestamos.value.findIndex(p => p.id === prestamoId)
    if (index !== -1) {
      prestamos.value[index] = { ...prestamos.value[index], ...prestamoActualizado }
    }
    
    // Actualizar el detalle si está abierto
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      prestamoDetalle.value = { ...prestamoDetalle.value, ...prestamoActualizado }
      // Recargar los pagos
      await fetchPagosPrestamo(prestamoId)
    }
    
    abonoAEliminar.value = null
    notificationStore.success('Abono eliminado correctamente', 'Éxito')
  } catch (e) {
    console.error('Error eliminando abono:', e)
    notificationStore.error(e.message || 'Error al eliminar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarPrestamo(prestamo) {
  prestamoAEliminar.value = prestamo
}

async function eliminarPrestamoConfirmado() {
  if (!prestamoAEliminar.value) return
  loading.value = true

  try {
    // Guardar datos del préstamo antes de eliminar para auditoría
    const prestamoEliminar = prestamoAEliminar.value
    const nombreSocio = prestamoEliminar.socio_natillera?.socio?.nombre || 'Socio'
    
    // Obtener natillera_id
    let natilleraId = null
    if (prestamoEliminar.socio_natillera_id) {
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', prestamoEliminar.socio_natillera_id)
        .single()
      natilleraId = socioNatillera?.natillera_id || null
    }
    
    // Primero eliminar todos los pagos relacionados
    const { error: errorPagos } = await supabase
      .from('pagos_prestamo')
      .delete()
      .eq('prestamo_id', prestamoAEliminar.value.id)

    if (errorPagos) {
      console.error('Error eliminando pagos:', errorPagos)
      // Continuar aunque haya error en pagos, puede que no haya pagos
    }

    // Luego eliminar el préstamo
    const { error } = await supabase
      .from('prestamos')
      .delete()
      .eq('id', prestamoAEliminar.value.id)

    if (error) throw error

    // Registrar eliminación en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarEliminacion(
        'prestamo',
        prestamoEliminar.id,
        `Se eliminó el préstamo de $${formatMoney(prestamoEliminar.monto)} de ${nombreSocio}`,
        {
          monto: prestamoEliminar.monto,
          interes: prestamoEliminar.interes,
          saldo_actual: prestamoEliminar.saldo_actual,
          estado: prestamoEliminar.estado,
          tipo_interes: prestamoEliminar.tipo_interes,
          numero_cuotas: prestamoEliminar.numero_cuotas
        },
        natilleraId
      )
    )

    // Remover de la lista local
    prestamos.value = prestamos.value.filter(p => p.id !== prestamoAEliminar.value.id)

    prestamoAEliminar.value = null
    notificationStore.success('Préstamo eliminado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al eliminar el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

async function abrirModalCompartirPrestamo() {
  if (!prestamoDetalle.value) return
  modalCompartirPrestamo.value = true
  // Esperar a que el modal se renderice completamente
  await nextTick()
  // Dar un pequeño tiempo adicional para que el DOM se estabilice
  await new Promise(resolve => setTimeout(resolve, 100))
}

async function generarImagenPrestamo() {
  return new Promise((resolve) => {
    try {
      if (!prestamoDetalle.value) {
        throw new Error('No hay información del préstamo disponible')
      }

      const prestamo = prestamoDetalle.value
      const nombreSocio = prestamo.socio_natillera?.socio?.nombre || 'Socio'
      const saldoColor = prestamo.saldo_actual > 0 ? '#dc2626' : '#10b981'
      const estadoColor = prestamo.estado === 'pagado' ? '#10b981' : prestamo.estado === 'activo' ? '#2563eb' : '#64748b'
      const estadoBg = prestamo.estado === 'pagado' ? '#dcfce7' : prestamo.estado === 'activo' ? '#dbeafe' : '#f1f5f9'
      const estadoText = prestamo.estado === 'pagado' ? 'PAGADO' : prestamo.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const width = 480
      const height = 780
      const scale = 2
      
      canvas.width = width * scale
      canvas.height = height * scale
      ctx.scale(scale, scale)
      
      // === FONDO DEGRADADO MODERNO (igual que comprobante de pago) ===
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#0f172a')
      bgGradient.addColorStop(0.5, '#1e293b')
      bgGradient.addColorStop(1, '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)
      
      // === EFECTOS DE LUZ (glassmorphism style) ===
      const light1 = ctx.createRadialGradient(width - 80, 100, 0, width - 80, 100, 200)
      light1.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      light1.addColorStop(1, 'transparent')
      ctx.fillStyle = light1
      ctx.fillRect(0, 0, width, height)
      
      const light2 = ctx.createRadialGradient(80, height - 150, 0, 80, height - 150, 180)
      light2.addColorStop(0, 'rgba(6, 182, 212, 0.2)')
      light2.addColorStop(1, 'transparent')
      ctx.fillStyle = light2
      ctx.fillRect(0, 0, width, height)
      
      // === HEADER ===
      // "Información del Préstamo" a la izquierda
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('Información del Préstamo', 32, 52)
      
      // "natillerapp" a la derecha
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '12px Arial'
      ctx.textAlign = 'right'
      ctx.fillText('natillerapp', width - 32, 52)
      
      // Línea decorativa con gradiente verde-azul
      const lineGradient = ctx.createLinearGradient(32, 0, width - 32, 0)
      lineGradient.addColorStop(0, 'transparent')
      lineGradient.addColorStop(0.3, '#10b981')
      lineGradient.addColorStop(0.5, '#06b6d4')
      lineGradient.addColorStop(0.7, '#10b981')
      lineGradient.addColorStop(1, 'transparent')
      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 72)
      ctx.lineTo(width - 32, 72)
      ctx.stroke()
      
      // === TARJETA GLASSMORPHISM ===
      const cardY = 95
      const cardHeight = 570
      const cardMargin = 24
      
      // Fondo de la tarjeta blanca
      ctx.fillStyle = 'rgba(255,255,255,0.98)'
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      
      // Sombra sutil
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.beginPath()
      ctx.roundRect(cardMargin, cardY, width - cardMargin*2, cardHeight, 24)
      ctx.fill()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      const cardInnerX = cardMargin + 28
      const cardInnerWidth = width - cardMargin*2 - 56
      const cardHalfWidth = (cardInnerWidth - 12) / 2 // Ancho para cards de 2 columnas (con gap de 12px)
      
      // === MONTO DEL PRÉSTAMO (HERO) - Centrado ===
      ctx.fillStyle = '#64748b'
      ctx.font = '13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('MONTO DEL PRÉSTAMO', width/2, cardY + 50)
      
      // Valor grande con gradiente verde
      const montoText = '$' + formatMoney(prestamo.monto)
      ctx.font = 'bold 52px Arial'
      const montoGradient = ctx.createLinearGradient(0, cardY + 55, 0, cardY + 110)
      montoGradient.addColorStop(0, '#059669')
      montoGradient.addColorStop(1, '#10b981')
      ctx.fillStyle = montoGradient
      ctx.fillText(montoText, width/2, cardY + 105)
      
      // Badge de estado centrado
      const badgeY = cardY + 125
      ctx.fillStyle = estadoBg
      ctx.beginPath()
      ctx.roundRect(width/2 - 50, badgeY, 100, 32, 16)
      ctx.fill()
      
      ctx.fillStyle = estadoColor
      ctx.font = 'bold 13px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(estadoText, width/2, badgeY + 21)
      
      // === DETALLES EN CARDS ===
      let detailsY = badgeY + 50
      
      // Card: Socio (ancho completo)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, detailsY, cardInnerWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SOCIO', cardInnerX + 18, detailsY + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(nombreSocio, cardInnerX + 18, detailsY + 42)
      
      // Fila 1: Interés Mensual y Número de Cuotas (2 columnas)
      const row1Y = detailsY + 70
      
      // Card: Interés Mensual (izquierda)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row1Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row1Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('INTERÉS', cardInnerX + 14, row1Y + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(prestamo.interes + '%', cardInnerX + 14, row1Y + 42)
      
      // Card: Número de Cuotas (derecha)
      const cuotasX = cardInnerX + cardHalfWidth + 12
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cuotasX, row1Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cuotasX, row1Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('CUOTAS', cuotasX + 14, row1Y + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 16px Arial'
      ctx.fillText((prestamo.numero_cuotas || 1).toString(), cuotasX + 14, row1Y + 42)
      
      // Fila 2: Valor de la Cuota y Saldo Actual (2 columnas)
      const row2Y = row1Y + 70
      
      // Card: Valor de la Cuota (izquierda)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row2Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row2Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('VALOR CUOTA', cardInnerX + 14, row2Y + 22)
      
      ctx.fillStyle = '#9333ea'
      ctx.font = 'bold 14px Arial'
      const valorCuotaText = '$' + formatMoney(calcularCuotaMensualDetalle(prestamo))
      // Ajustar texto si es muy largo
      const maxWidthCuota = cardHalfWidth - 28
      if (ctx.measureText(valorCuotaText).width > maxWidthCuota) {
        ctx.font = 'bold 12px Arial'
      }
      ctx.fillText(valorCuotaText, cardInnerX + 14, row2Y + 42)
      
      // Card: Interés Generado (derecha)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cuotasX, row2Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cuotasX, row2Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('INTERÉS GEN.', cuotasX + 14, row2Y + 22)
      
      ctx.fillStyle = '#ea580c'
      ctx.font = 'bold 14px Arial'
      const interesGeneradoText = '$' + formatMoney(calcularInteresGeneradoDetalle(prestamo))
      // Ajustar texto si es muy largo
      const maxWidthInteres = cardHalfWidth - 28
      if (ctx.measureText(interesGeneradoText).width > maxWidthInteres) {
        ctx.font = 'bold 12px Arial'
      }
      ctx.fillText(interesGeneradoText, cuotasX + 14, row2Y + 42)
      
      // Fila 3: Valor Pagado y Fecha de Creación (2 columnas)
      const row3Y = row2Y + 70
      
      // Card: Valor Pagado (izquierda)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row3Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row3Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('VALOR PAGADO', cardInnerX + 14, row3Y + 22)
      
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 14px Arial'
      const valorPagadoText = '$' + formatMoney(calcularValorPagadoDetalle(prestamo))
      // Ajustar texto si es muy largo
      const maxWidth = cardHalfWidth - 28
      if (ctx.measureText(valorPagadoText).width > maxWidth) {
        ctx.font = 'bold 12px Arial'
      }
      ctx.fillText(valorPagadoText, cardInnerX + 14, row3Y + 42)
      
      // Card: Fecha de Creación (derecha)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cuotasX, row3Y, cardHalfWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cuotasX, row3Y, cardHalfWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('FECHA', cuotasX + 14, row3Y + 22)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 13px Arial'
      const fechaText = formatDate(prestamo.created_at) || 'N/A'
      ctx.fillText(fechaText, cuotasX + 14, row3Y + 42)
      
      // Fila 4: Saldo Actual (ancho completo)
      const row4Y = row3Y + 70
      
      // Card: Saldo Actual (ancho completo)
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row4Y, cardInnerWidth, 58, 14)
      ctx.fill()
      
      ctx.shadowColor = 'rgba(0,0,0,0.05)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, row4Y, cardInnerWidth, 58, 14)
      ctx.stroke()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'left'
      ctx.fillText('SALDO ACTUAL', cardInnerX + 18, row4Y + 22)
      
      ctx.fillStyle = saldoColor
      ctx.font = 'bold 16px Arial'
      const saldoText = '$' + formatMoney(prestamo.saldo_actual)
      ctx.fillText(saldoText, cardInnerX + 18, row4Y + 42)
      
      // === BOTÓN DE CONFIRMACIÓN ===
      const btnY = cardY + cardHeight + 20
      
      // Sombra del botón
      ctx.fillStyle = 'rgba(5, 150, 105, 0.3)'
      ctx.beginPath()
      ctx.roundRect(cardInnerX + 2, btnY + 2, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Botón con gradiente
      const btnGradient = ctx.createLinearGradient(cardInnerX, btnY, cardInnerX, btnY + 52)
      btnGradient.addColorStop(0, '#059669')
      btnGradient.addColorStop(0.5, '#10b981')
      btnGradient.addColorStop(1, '#047857')
      ctx.fillStyle = btnGradient
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.fill()
      
      // Borde sutil del botón
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(cardInnerX, btnY, cardInnerWidth, 52, 14)
      ctx.stroke()
      
      // Texto del botón
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PRÉSTAMO REGISTRADO', cardInnerX + cardInnerWidth/2 + 1, btnY + 34)
      
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PRÉSTAMO REGISTRADO', cardInnerX + cardInnerWidth/2, btnY + 33)
      
      resolve(canvas)
    } catch (e) {
      console.error('Error generando canvas:', e)
      resolve(null)
    }
  })
}

async function descargarPrestamo() {
  if (!prestamoDetalle.value) {
    notificationStore.error('No hay información del préstamo disponible.', 'Error')
    return
  }
  
  // Asegurar que el modal esté abierto
  if (!modalCompartirPrestamo.value) {
    await abrirModalCompartirPrestamo()
  }
  
  generandoImagenPrestamo.value = true
  
  try {
    const canvas = await generarImagenPrestamo()
    
    if (!canvas) {
      throw new Error('No se pudo generar la imagen')
    }
    
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `prestamo-${prestamoDetalle.value?.socio_natillera?.socio?.nombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    notificationStore.success('Imagen descargada exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error completo:', e)
    notificationStore.error('Error al generar la imagen: ' + e.message, 'Error')
  } finally {
    generandoImagenPrestamo.value = false
  }
}

async function compartirPrestamoWhatsApp() {
  if (!prestamoDetalle.value) return
  
  // Asegurar que el modal esté abierto
  if (!modalCompartirPrestamo.value) {
    await abrirModalCompartirPrestamo()
  }
  
  generandoImagenPrestamo.value = true
  
  try {
    const canvas = await generarImagenPrestamo()
    if (!canvas) throw new Error('No se pudo generar la imagen')
    
    // Convertir canvas a blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    const archivo = new File([blob], `prestamo-${Date.now()}.png`, { type: 'image/png' })
    
    // Verificar si el navegador soporta Web Share API con archivos
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Información del Préstamo',
        text: `Hola ${prestamoDetalle.value.socio_natillera?.socio?.nombre} 👋\n\nTe envío la información de tu préstamo en la natillera.\n\n¡Gracias por confiar en nosotros! 🙌`
      })
    } else {
      // Fallback: descargar y abrir WhatsApp con mensaje
      const link = document.createElement('a')
      link.download = `prestamo-${prestamoDetalle.value?.socio_natillera?.socio?.nombre?.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      // Esperar un poco y abrir WhatsApp
      setTimeout(() => {
        const telefono = prestamoDetalle.value.socio_natillera?.socio?.telefono?.replace(/\D/g, '')
        if (telefono) {
          const mensaje = `Hola ${prestamoDetalle.value.socio_natillera?.socio?.nombre} 👋\n\nTe envío la información de tu préstamo. ¡Gracias por confiar en nosotros! 🙌`
          window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
        }
      }, 500)
      
      notificationStore.info('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.', 'Descargado')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error compartiendo:', e)
      // Fallback: solo abrir WhatsApp con texto
      const telefono = prestamoDetalle.value.socio_natillera?.socio?.telefono?.replace(/\D/g, '')
      if (telefono) {
        const mensaje = `Hola ${prestamoDetalle.value.socio_natillera?.socio?.nombre} 👋\n\nTe envío la información de tu préstamo en la natillera.\n\n¡Gracias por confiar en nosotros! 🙌`
        window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank')
      }
    }
  } finally {
    generandoImagenPrestamo.value = false
  }
}
</script>


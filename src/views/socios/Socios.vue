<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <router-link :to="`/natilleras/${id}`" class="group inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white hover:border-natillera-200 hover:shadow-sm transition-all duration-200 mb-2 sm:mb-4 text-xs sm:text-sm">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-natillera-500/10 to-emerald-500/10 flex items-center justify-center group-hover:from-natillera-500/20 group-hover:to-emerald-500/20 transition-all duration-200">
          <ArrowLeftIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-natillera-600 group-hover:text-natillera-700 group-hover:-translate-x-0.5 transition-all duration-200" />
        </div>
        <span class="whitespace-nowrap">Volver a natillera</span>
      </router-link>
      
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
                <UsersIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                  Socios
                </h1>
                <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                  Gestiona los participantes y sus cuotas personalizadas
                </p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button @click="modalImportar = true" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all shadow-sm">
                <ArrowUpTrayIcon class="w-5 h-5" />
                <span class="hidden sm:inline">Importar CSV</span>
              </button>
              <button @click="modalAgregar = true" class="btn-primary inline-flex items-center gap-2">
                <PlusIcon class="w-5 h-5" />
                <span>Agregar Socio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de búsqueda -->
    <div v-if="sociosStore.sociosNatillera.length > 0" class="relative">
      <div class="relative bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-4 shadow-lg">
        <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2" />
        <input 
          v-model="busqueda"
          type="text"
          placeholder="Buscar socio por nombre, documento o teléfono..."
          class="w-full pl-12 pr-12 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400"
          @keydown.esc="busqueda = ''"
        />
        <button 
          v-if="busqueda"
          @click="busqueda = ''"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Limpiar búsqueda"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Lista de socios -->
    <div v-if="sociosStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando socios...</p>
    </div>

    <div v-else-if="sociosStore.sociosNatillera.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-natillera-500/30">
          <UsersIcon class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
          No hay socios registrados
        </h3>
        <p class="text-gray-500 mb-8 text-sm sm:text-base">
          Agrega el primer socio para comenzar a gestionar las cuotas
        </p>
        <button @click="modalAgregar = true" class="btn-primary inline-flex items-center gap-2">
          <PlusIcon class="w-5 h-5" />
          Agregar Primer Socio
        </button>
      </div>
    </div>

    <!-- Sin resultados de búsqueda -->
    <div v-else-if="sociosFiltrados.length === 0" class="relative bg-gradient-to-br from-white via-gray-50/30 to-gray-50/20 rounded-3xl p-8 sm:p-12 border border-gray-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-gray-400/10 to-gray-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-gray-400/10 to-gray-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative z-10">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center shadow-lg">
          <MagnifyingGlassIcon class="w-10 h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-xl sm:text-2xl mb-2">
          No se encontraron socios
        </h3>
        <p class="text-gray-500 mb-8 text-sm sm:text-base">
          No hay socios que coincidan con "{{ busqueda }}"
        </p>
        <button @click="busqueda = ''" class="btn-secondary inline-flex items-center gap-2">
          <XMarkIcon class="w-4 h-4" />
          Limpiar búsqueda
        </button>
      </div>
    </div>

    <div v-else class="grid gap-4 sm:gap-5 lg:grid-cols-2">
      <div 
        v-for="sn in sociosFiltrados" 
        :key="sn.id"
        class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-2xl p-5 sm:p-6 border border-natillera-200/50 shadow-lg hover:shadow-2xl hover:shadow-natillera-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
        @click="verDetalleSocio(sn)"
      >
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
        
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <img 
                :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed, sn.socio?.avatar_style)" 
                :alt="sn.socio?.nombre"
                class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-natillera-200 shadow-md flex-shrink-0 object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-display font-bold text-gray-800 text-lg sm:text-xl mb-1 truncate">
                  {{ sn.socio?.nombre }}
                </h3>
                <p class="text-sm text-gray-500 truncate">{{ sn.socio?.email || 'Sin correo' }}</p>
              </div>
            </div>
            <span 
              :class="[
                'badge flex-shrink-0',
                sn.estado === 'activo' ? 'badge-success' : 'badge-warning'
              ]"
            >
              {{ sn.estado }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div class="relative p-4 bg-gradient-to-br from-natillera-50 to-emerald-50 rounded-xl border border-natillera-200/50 shadow-sm group-hover:shadow-md transition-shadow">
              <p class="text-xs text-gray-500 mb-1.5 font-medium">Cuota Individual</p>
              <p class="font-bold text-natillera-700 text-lg sm:text-xl">${{ formatMoney(sn.valor_cuota_individual) }}</p>
            </div>
            <div class="relative p-4 rounded-xl border shadow-sm group-hover:shadow-md transition-shadow" :class="sn.periodicidad === 'quincenal' ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200/50'">
              <p class="text-xs text-gray-500 mb-1.5 font-medium">Periodicidad</p>
              <p class="font-bold text-lg sm:text-xl" :class="sn.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-gray-700'">
                {{ sn.periodicidad === 'quincenal' ? '🗓️ Quincenal' : '📅 Mensual' }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200/50">
            <div class="text-sm text-gray-500 flex items-center gap-1.5">
              <PhoneIcon class="w-4 h-4" />
              <span class="truncate">{{ sn.socio?.telefono || 'Sin teléfono' }}</span>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button 
                @click.stop="editarSocio(sn)"
                class="p-2 text-gray-400 hover:text-natillera-600 hover:bg-natillera-50 rounded-lg transition-all hover:scale-110"
                title="Editar"
              >
                <PencilIcon class="w-5 h-5" />
              </button>
              <button 
                @click.stop="toggleEstado(sn)"
                :class="[
                  'p-2 rounded-lg transition-all hover:scale-110',
                  sn.estado === 'activo' 
                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                ]"
                :title="sn.estado === 'activo' ? 'Desactivar' : 'Activar'"
              >
                <component 
                  :is="sn.estado === 'activo' ? XCircleIcon : CheckCircleIcon" 
                  class="w-5 h-5" 
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalle Socio -->
    <div v-if="modalDetalle" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalDetalle = false"></div>
      <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Header del modal -->
        <div class="flex items-center gap-4 mb-6">
          <img 
            :src="getAvatarUrl(socioSeleccionado?.socio?.nombre || socioSeleccionado?.id, socioSeleccionado?.socio?.avatar_seed, socioSeleccionado?.socio?.avatar_style)" 
            :alt="socioSeleccionado?.socio?.nombre"
            class="w-16 h-16 rounded-2xl bg-natillera-100 shadow-lg"
          />
          <div class="flex-1">
            <h3 class="text-xl font-display font-bold text-gray-800">
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
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Indicador de estado (siempre visible) -->
        <div 
          :class="[
            'p-4 rounded-xl mb-4 flex items-center gap-3',
            resumenSocio.alDia 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          ]"
        >
          <component 
            :is="resumenSocio.alDia ? CheckCircleIcon : ExclamationCircleIcon"
            :class="[
              'w-8 h-8',
              resumenSocio.alDia ? 'text-green-500' : 'text-red-500'
            ]"
          />
          <div>
            <p :class="['font-semibold', resumenSocio.alDia ? 'text-green-700' : 'text-red-700']">
              {{ resumenSocio.alDia ? '¡Al día con los pagos!' : 'Tiene pagos pendientes' }}
            </p>
            <p class="text-sm text-gray-600">
              {{ resumenSocio.alDia 
                ? 'Este socio ha cumplido con todas sus cuotas' 
                : `Debe ${resumenSocio.cuotasPendientes + resumenSocio.cuotasMora} cuota(s)` 
              }}
            </p>
          </div>
        </div>

        <!-- Secciones desplegables -->
        <div class="space-y-3">
          
          <!-- Sección: Resumen Financiero (abierta por defecto) -->
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
            <div v-show="seccionActiva === 'finanzas'" class="p-4 border-t border-gray-100 bg-white">
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p class="text-xs font-medium text-green-600 mb-1">TOTAL APORTADO</p>
                  <p class="text-2xl font-bold text-green-700">${{ formatMoney(resumenSocio.totalAportado) }}</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                  <p class="text-xs font-medium text-amber-600 mb-1">PENDIENTE</p>
                  <p class="text-2xl font-bold text-amber-700">${{ formatMoney(resumenSocio.totalPendiente) }}</p>
                </div>
              </div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cuotas</p>
              <div class="grid grid-cols-3 gap-2">
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-xl font-bold text-green-600">{{ resumenSocio.cuotasPagadas }}</p>
                  <p class="text-xs text-gray-500">Pagadas</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-xl font-bold text-amber-600">{{ resumenSocio.cuotasPendientes }}</p>
                  <p class="text-xs text-gray-500">Pendientes</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-xl font-bold text-red-600">{{ resumenSocio.cuotasMora }}</p>
                  <p class="text-xs text-gray-500">En Mora</p>
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
            <div v-show="seccionActiva === 'contacto'" class="p-4 border-t border-gray-100 bg-white space-y-2">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon class="w-5 h-5 text-gray-400" />
                <div class="flex-1">
                  <p class="text-xs text-gray-500">Teléfono / WhatsApp</p>
                  <p class="font-medium text-gray-800">{{ socioSeleccionado?.socio?.telefono || 'No registrado' }}</p>
                </div>
                <a 
                  v-if="socioSeleccionado?.socio?.telefono"
                  :href="`https://wa.me/57${socioSeleccionado.socio.telefono.replace(/\D/g, '')}`"
                  target="_blank"
                  class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Enviar mensaje
                </a>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Correo electrónico</p>
                  <p class="font-medium text-gray-800">{{ socioSeleccionado?.socio?.email || 'No registrado' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <IdentificationIcon class="w-5 h-5 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Documento de identidad</p>
                  <p class="font-medium text-gray-800">{{ socioSeleccionado?.socio?.documento || 'No registrado' }}</p>
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
            <div v-show="seccionActiva === 'config'" class="p-4 border-t border-gray-100 bg-white">
              <div class="grid grid-cols-2 gap-3">
                <div class="p-4 bg-natillera-50 rounded-xl border border-natillera-100">
                  <p class="text-xs text-gray-500 mb-1">Cuota por período</p>
                  <p class="text-xl font-bold text-natillera-700">${{ formatMoney(socioSeleccionado?.valor_cuota_individual) }}</p>
                </div>
                <div class="p-4 rounded-xl border" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'">
                  <p class="text-xs text-gray-500 mb-1">Periodicidad</p>
                  <p class="text-xl font-bold" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-gray-700'">
                    {{ socioSeleccionado?.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                  </p>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-3 bg-gray-50 p-2 rounded-lg">
                {{ socioSeleccionado?.periodicidad === 'quincenal' 
                  ? '💡 Este socio paga 2 cuotas por mes (una cada quincena)' 
                  : '💡 Este socio paga 1 cuota por mes' }}
              </p>
            </div>
          </div>

        </div>

        <!-- Botones de acción -->
        <div class="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button 
            @click="modalDetalle = false; editarSocio(socioSeleccionado)"
            class="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
          >
            <PencilIcon class="w-4 h-4" />
            Editar
          </button>
          <button 
            @click="modalDetalle = false"
            class="btn-primary flex-1"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Importar CSV -->
    <div v-if="modalImportar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cerrarModalImportar"></div>
      <div class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-display font-bold text-gray-800">
            Importar Socios desde CSV
          </h3>
          <button @click="cerrarModalImportar" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Paso 1: Descargar ejemplo -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-start gap-3">
            <DocumentArrowDownIcon class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="font-semibold text-blue-800">Paso 1: Descarga el archivo de ejemplo</p>
              <p class="text-sm text-blue-700 mt-1">
                Descarga el archivo CSV de ejemplo para ver el formato correcto de los datos.
              </p>
              <button 
                @click="descargarEjemploCSV"
                class="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
                Descargar ejemplo.csv
              </button>
            </div>
          </div>
        </div>

        <!-- Paso 2: Subir archivo -->
        <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div class="flex items-start gap-3">
            <ArrowUpTrayIcon class="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="font-semibold text-gray-800">Paso 2: Sube tu archivo CSV</p>
              <p class="text-sm text-gray-600 mt-1">
                Selecciona el archivo CSV con los datos de los socios a importar.
              </p>
              <div class="mt-3">
                <input 
                  type="file" 
                  ref="inputCSV"
                  accept=".csv"
                  @change="handleArchivoCSV"
                  class="hidden"
                />
                <button 
                  @click="$refs.inputCSV.click()"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border-2 border-dashed border-gray-300 hover:border-natillera-400 hover:text-natillera-700 transition-colors"
                >
                  <DocumentTextIcon class="w-4 h-4" />
                  {{ archivoCSV ? archivoCSV.name : 'Seleccionar archivo...' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista previa de datos -->
        <div v-if="sociosPreview.length > 0" class="mb-6">
          <p class="font-semibold text-gray-800 mb-3">
            Vista previa ({{ sociosPreview.length }} socios encontrados)
          </p>
          <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th class="text-left p-3 font-semibold text-gray-700">Nombre</th>
                  <th class="text-left p-3 font-semibold text-gray-700">Cuota</th>
                  <th class="text-left p-3 font-semibold text-gray-700">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(socio, index) in sociosPreview" :key="index" class="border-t border-gray-100">
                  <td class="p-3 text-gray-800">{{ socio.nombre }}</td>
                  <td class="p-3 text-natillera-600 font-medium">${{ formatMoney(socio.valor_cuota) }}</td>
                  <td class="p-3 text-gray-500">{{ socio.telefono || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Error -->
        <div v-if="errorImportar" class="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {{ errorImportar }}
        </div>

        <!-- Éxito -->
        <div v-if="exitoImportar" class="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
          {{ exitoImportar }}
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button 
            @click="cerrarModalImportar"
            class="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button 
            @click="importarSocios"
            :disabled="sociosPreview.length === 0 || importando"
            class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ importando ? 'Importando...' : `Importar ${sociosPreview.length} socios` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Agregar Socio -->
    <div v-if="modalAgregar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="modalAgregar = false"></div>
      <div class="card relative max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-display font-bold text-gray-800 mb-6">
          {{ socioEditando ? 'Editar Socio' : 'Agregar Nuevo Socio' }}
        </h3>

        <form @submit.prevent="handleGuardarSocio" class="space-y-4">
          <!-- Selector de Avatar -->
          <div>
            <label class="label">Selecciona un avatar</label>
            <div class="flex items-center gap-4 mb-3">
              <img 
                :src="getAvatarUrl(formSocio.avatar_seed || formSocio.nombre || 'nuevo')" 
                alt="Avatar seleccionado"
                class="w-16 h-16 rounded-xl bg-natillera-100 border-2 border-natillera-300"
              />
              <button 
                type="button"
                @click="mostrarAvatares = !mostrarAvatares"
                class="text-sm text-natillera-600 hover:text-natillera-700 font-medium"
              >
                {{ mostrarAvatares ? 'Ocultar opciones' : 'Cambiar avatar' }}
              </button>
            </div>
            <div v-show="mostrarAvatares" class="bg-gray-50 rounded-xl overflow-hidden">
              <!-- Grid de avatares -->
              <div class="grid grid-cols-5 gap-2 p-3 max-h-52 overflow-y-auto">
                <button
                  v-for="seed in avatarSeeds"
                  :key="seed"
                  type="button"
                  @click="formSocio.avatar_seed = seed"
                  :class="[
                    'p-1 rounded-lg transition-all',
                    formSocio.avatar_seed === seed 
                      ? 'ring-2 ring-natillera-500 bg-natillera-100' 
                      : 'hover:bg-gray-100'
                  ]"
                >
                  <img 
                    :src="getAvatarUrl(seed, null, formSocio.avatar_style)" 
                    :alt="seed"
                    class="w-10 h-10 rounded-lg"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Nombre (obligatorio) -->
          <div>
            <label class="label">
              Nombre completo <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="formSocio.nombre"
              type="text" 
              class="input-field"
              placeholder="Ej: María García"
              required
            />
          </div>

          <!-- Cuota (obligatorio) - Lo más importante -->
          <div class="p-4 bg-natillera-50 rounded-xl border border-natillera-200">
            <label class="label text-natillera-700">
              💰 {{ textoLabelCuota }} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input 
                :value="formatearValorCuota(formSocio.valor_cuota)"
                @input="handleValorCuotaInput($event)"
                type="text" 
                class="input-field pl-8 text-lg font-semibold"
                placeholder="50.000"
                required
              />
            </div>
            <p class="text-xs text-natillera-600 mt-2">
              Este es el valor que el socio aportará en cada período
            </p>
          </div>

          <!-- Periodicidad -->
          <div>
            <label class="label">
              Periodicidad de pago
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="formSocio.periodicidad = 'mensual'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all text-left',
                  formSocio.periodicidad === 'mensual'
                    ? 'border-natillera-500 bg-natillera-50 ring-2 ring-natillera-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xl">📅</span>
                  <span class="font-semibold" :class="formSocio.periodicidad === 'mensual' ? 'text-natillera-700' : 'text-gray-700'">
                    Mensual
                  </span>
                </div>
                <p class="text-xs text-gray-500">1 cuota por mes</p>
              </button>
              <button
                type="button"
                @click="formSocio.periodicidad = 'quincenal'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all text-left',
                  formSocio.periodicidad === 'quincenal'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xl">🗓️</span>
                  <span class="font-semibold" :class="formSocio.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-gray-700'">
                    Quincenal
                  </span>
                </div>
                <p class="text-xs text-gray-500">2 cuotas por mes</p>
              </button>
            </div>
          </div>

          <!-- Información de contacto (colapsable) -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="mostrarContacto = !mostrarContacto"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span class="font-medium text-gray-700">
                📱 Información de contacto
                <span class="text-gray-400 font-normal text-sm">(opcional)</span>
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-400 transition-transform', mostrarContacto ? 'rotate-180' : '']" 
              />
            </button>
            
            <div v-show="mostrarContacto" class="p-4 space-y-4 border-t border-gray-200">
              <div>
                <label class="label">Teléfono / WhatsApp</label>
                <input 
                  v-model="formSocio.telefono"
                  type="tel" 
                  class="input-field"
                  placeholder="3001234567"
                />
                <p class="text-xs text-gray-400 mt-1">Para enviar recordatorios de pago</p>
              </div>

              <div>
                <label class="label">Correo electrónico</label>
                <input 
                  v-model="formSocio.email"
                  type="email" 
                  class="input-field"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label class="label">Documento de identidad</label>
                <input 
                  v-model="formSocio.documento"
                  type="text" 
                  class="input-field"
                  placeholder="Cédula (opcional)"
                />
              </div>
            </div>
          </div>

          <div v-if="errorSocio" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {{ errorSocio }}
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="cerrarModal"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="sociosStore.loading"
            >
              {{ sociosStore.loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSociosStore } from '../../stores/socios'
import { useCuotasStore } from '../../stores/cuotas'
import { 
  ArrowLeftIcon,
  PlusIcon,
  UsersIcon,
  PhoneIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  XMarkIcon,
  BanknotesIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  id: String
})

const route = useRoute()
const sociosStore = useSociosStore()
const cuotasStore = useCuotasStore()

const modalAgregar = ref(false)
const modalDetalle = ref(false)
const modalImportar = ref(false)
const socioEditando = ref(null)
const socioSeleccionado = ref(null)
const errorSocio = ref('')
const mostrarContacto = ref(false)
const cuotasSocio = ref([])
const loadingDetalle = ref(false)
const busqueda = ref('')

// Variables para importación CSV
const archivoCSV = ref(null)
const sociosPreview = ref([])
const errorImportar = ref('')
const exitoImportar = ref('')
const importando = ref(false)

// Sección activa del modal de detalle (solo una a la vez)
const seccionActiva = ref('finanzas')  // 'finanzas', 'contacto', 'config' o null

// Socios filtrados por búsqueda
const sociosFiltrados = computed(() => {
  if (!busqueda.value.trim()) {
    return sociosStore.sociosNatillera
  }
  const termino = busqueda.value.toLowerCase().trim()
  return sociosStore.sociosNatillera.filter(sn => 
    sn.socio?.nombre?.toLowerCase().includes(termino) ||
    sn.socio?.documento?.toLowerCase().includes(termino) ||
    sn.socio?.telefono?.includes(termino)
  )
})

function toggleSeccion(seccion) {
  seccionActiva.value = seccionActiva.value === seccion ? null : seccion
}

const formSocio = reactive({
  nombre: '',
  documento: '',
  email: '',
  telefono: '',
  valor_cuota: 50000,
  periodicidad: 'mensual',
  avatar_seed: '',
  avatar_style: 'adventurer'
})

const mostrarAvatares = ref(false)

// Lista de seeds para avatares predefinidos
const avatarSeeds = [
  'Sofia', 'Luna', 'Valentina', 'Camila', 'Isabella',
  'Mariana', 'Lucia', 'Gabriela', 'Daniela', 'Paula',
  'Andrea', 'Carolina', 'Natalia', 'Alejandra', 'Victoria',
  'Fernanda', 'Catalina', 'Sara', 'Laura', 'Maria',
  'Ana', 'Elena', 'Rosa', 'Carmen', 'Julia',
  'Claudia', 'Patricia', 'Monica', 'Sandra', 'Diana',
  'Adriana', 'Gloria', 'Teresa', 'Liliana', 'Rocio',
  'Paola', 'Angelica', 'Marcela', 'Lorena', 'Viviana',
  'Johana', 'Tatiana', 'Yolanda', 'Pilar', 'Beatriz',
  'Clara', 'Marta', 'Silvia', 'Esperanza', 'Blanca',
  'Isabel', 'Cristina', 'Mercedes', 'Dolores', 'Amparo',
  'Angela', 'Cecilia', 'Elisa', 'Francisca', 'Gisela',
  'Helena', 'Ines', 'Jimena', 'Karina', 'Leticia',
  'Magdalena', 'Nora', 'Olga', 'Rebeca', 'Susana',
  'Ursula', 'Veronica', 'Wendy', 'Ximena', 'Zoe',
  'Alicia', 'Bianca', 'Carla', 'Estefania', 'Fabiola',
  'Carlos', 'Juan', 'Miguel', 'Andres', 'Luis',
  'Jorge', 'David', 'Daniel', 'Felipe', 'Santiago',
  'Sebastian', 'Alejandro', 'Ricardo', 'Fernando', 'Diego',
  'Pablo', 'Eduardo', 'Gustavo', 'Oscar', 'Sergio',
  'Roberto', 'Javier', 'Antonio', 'Manuel', 'Pedro',
  'Francisco', 'Raul', 'Mario', 'Jaime', 'Hector',
  'Alberto', 'Cesar', 'Hugo', 'Ivan', 'Rodrigo',
  'Enrique', 'Gabriel', 'Nicolas', 'Camilo', 'Fabian',
  'Leonardo', 'Cristian', 'Mauricio', 'Julian', 'Arturo',
  'Victor', 'Guillermo', 'Alfonso', 'Ernesto', 'Ramon',
  'Emilio', 'Rafael', 'Alfredo', 'Jose', 'Esteban',
  'Adrian', 'Bruno', 'Cristobal', 'Dario', 'Federico',
  'Gonzalo', 'Hernan', 'Ignacio', 'Joaquin', 'Kevin',
  'Lucas', 'Mateo', 'Orlando', 'Patricio', 'Ramiro',
  'Samuel', 'Tomas', 'Ulises', 'Valentin', 'Walter',
  'Xavier', 'Yago', 'Zacarias', 'Agustin', 'Benjamin',
  'Domingo', 'Efrain', 'Felix', 'Gerardo', 'Horacio'
]

// Texto del label de cuota según periodicidad
const textoLabelCuota = computed(() => {
  const periodicidad = formSocio.periodicidad
  if (periodicidad === 'quincenal') {
    return 'Valor de la cuota quincenal'
  } else if (periodicidad === 'semanal') {
    return 'Valor de la cuota semanal'
  } else {
    return 'Valor de la cuota mensual'
  }
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

const id = props.id || route.params.id

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

// Formatear valor de cuota con separadores de miles
function formatearValorCuota(value) {
  if (!value && value !== 0) return ''
  const numero = typeof value === 'string' ? value.replace(/\./g, '') : value
  return new Intl.NumberFormat('es-CO').format(numero)
}

// Manejar input del valor de cuota
function handleValorCuotaInput(event) {
  const valor = event.target.value.replace(/\./g, '').replace(/[^\d]/g, '')
  if (valor === '') {
    formSocio.valor_cuota = 0
  } else {
    const numero = parseInt(valor, 10)
    if (!isNaN(numero) && numero >= 0) {
      formSocio.valor_cuota = numero
    }
  }
}

function getAvatarUrl(seed, avatarSeed = null, style = 'adventurer') {
  // Usar DiceBear Avatars con el estilo seleccionado
  // Si hay un avatar_seed guardado, usarlo; si no, usar el nombre
  const finalSeed = avatarSeed || seed || 'default'
  const encodedSeed = encodeURIComponent(finalSeed)
  const avatarStyle = style || 'adventurer'
  
  // Colores de fondo según el estilo
  const backgroundColors = {
    'adventurer': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'avataaars': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'big-smile': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'bottts': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'lorelei': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'micah': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'miniavs': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'open-peeps': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf',
    'personas': 'c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf'
  }
  
  const bgColors = backgroundColors[avatarStyle] || backgroundColors['adventurer']
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodedSeed}&backgroundColor=${bgColors}`
}

function editarSocio(sn) {
  socioEditando.value = sn
  formSocio.nombre = sn.socio?.nombre || ''
  formSocio.documento = sn.socio?.documento || ''
  formSocio.email = sn.socio?.email || ''
  formSocio.telefono = sn.socio?.telefono || ''
  formSocio.valor_cuota = sn.valor_cuota_individual
  formSocio.periodicidad = sn.periodicidad || 'mensual'
  formSocio.avatar_seed = sn.socio?.avatar_seed || ''
  mostrarAvatares.value = false
  modalAgregar.value = true
}

function cerrarModal() {
  modalAgregar.value = false
  socioEditando.value = null
  errorSocio.value = ''
  mostrarContacto.value = false
  mostrarAvatares.value = false
  Object.assign(formSocio, {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 50000,
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer'
  })
}

async function handleGuardarSocio() {
  errorSocio.value = ''

  if (socioEditando.value) {
    // Actualizar cuota del socio en socios_natillera
    const result = await sociosStore.actualizarSocioNatillera(socioEditando.value.id, {
      valor_cuota_individual: formSocio.valor_cuota,
      periodicidad: formSocio.periodicidad
    })

    // Actualizar datos del socio en la tabla socios (nombre, teléfono, email, documento, avatar)
    if (socioEditando.value.socio?.id) {
      const datosActualizados = {
        nombre: formSocio.nombre,
        telefono: formSocio.telefono || null,
        email: formSocio.email || null,
        documento: formSocio.documento || null
      }
      
      // Solo incluir avatar_seed si se seleccionó uno
      if (formSocio.avatar_seed) {
        datosActualizados.avatar_seed = formSocio.avatar_seed
      }
      
      await sociosStore.actualizarDatosSocio(socioEditando.value.socio.id, datosActualizados)
    }

    if (result.success) {
      // Recargar la lista para ver los cambios
      await sociosStore.fetchSociosNatillera(id)
      cerrarModal()
    } else {
      errorSocio.value = result.error
    }
  } else {
    // Agregar nuevo socio
    const datosSocio = {
      nombre: formSocio.nombre,
      documento: formSocio.documento,
      email: formSocio.email || null,
      telefono: formSocio.telefono || null,
      avatar_seed: formSocio.avatar_seed || null
    }

    const result = await sociosStore.agregarSocio(
      id,
      datosSocio,
      formSocio.valor_cuota,
      formSocio.periodicidad
    )

    if (result.success) {
      cerrarModal()
    } else {
      errorSocio.value = result.error
    }
  }
}

async function toggleEstado(sn) {
  const nuevoEstado = sn.estado === 'activo' ? 'inactivo' : 'activo'
  await sociosStore.cambiarEstadoSocio(sn.id, nuevoEstado)
}

// Funciones para importación CSV
function descargarEjemploCSV() {
  const contenido = `nombre,valor_cuota,cantidad_cuotas,telefono,email,documento
Juan Pérez,50000,1,3001234567,juan@email.com,1234567890
María García,75000,2,3009876543,maria@email.com,0987654321
Carlos López,50000,1,3005551234,,
Ana Martínez,100000,1,,,`

  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'ejemplo_socios.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

function handleArchivoCSV(event) {
  const file = event.target.files[0]
  if (!file) return

  archivoCSV.value = file
  errorImportar.value = ''
  exitoImportar.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const contenido = e.target.result
      const lineas = contenido.split('\n').filter(l => l.trim())
      
      if (lineas.length < 2) {
        errorImportar.value = 'El archivo debe tener al menos una fila de encabezados y una fila de datos'
        sociosPreview.value = []
        return
      }

      // Parsear encabezados
      const encabezados = lineas[0].split(',').map(h => h.trim().toLowerCase())
      
      // Validar encabezados requeridos
      if (!encabezados.includes('nombre') || !encabezados.includes('valor_cuota')) {
        errorImportar.value = 'El archivo debe tener las columnas "nombre" y "valor_cuota"'
        sociosPreview.value = []
        return
      }

      // Parsear datos
      const socios = []
      for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i].split(',').map(v => v.trim())
        const socio = {}
        
        encabezados.forEach((header, index) => {
          socio[header] = valores[index] || ''
        })

        // Validar datos mínimos
        if (socio.nombre && socio.valor_cuota) {
          socios.push({
            nombre: socio.nombre,
            valor_cuota: parseInt(socio.valor_cuota) || 50000,
            cantidad_cuotas: parseInt(socio.cantidad_cuotas) || 1,
            telefono: socio.telefono || null,
            email: socio.email || null,
            documento: socio.documento || null
          })
        }
      }

      sociosPreview.value = socios
      
      if (socios.length === 0) {
        errorImportar.value = 'No se encontraron socios válidos en el archivo'
      }
    } catch (err) {
      errorImportar.value = 'Error al leer el archivo: ' + err.message
      sociosPreview.value = []
    }
  }
  reader.readAsText(file)
}

async function importarSocios() {
  if (sociosPreview.value.length === 0) return

  importando.value = true
  errorImportar.value = ''
  exitoImportar.value = ''

  let importados = 0
  let errores = 0

  for (const socio of sociosPreview.value) {
    const result = await sociosStore.agregarSocio(
      id,
      {
        nombre: socio.nombre,
        documento: socio.documento,
        email: socio.email,
        telefono: socio.telefono
      },
      socio.valor_cuota,
      socio.cantidad_cuotas
    )

    if (result.success) {
      importados++
    } else {
      errores++
    }
  }

  importando.value = false

  if (errores === 0) {
    exitoImportar.value = `Se importaron ${importados} socios exitosamente`
    sociosPreview.value = []
    archivoCSV.value = null
  } else {
    exitoImportar.value = `Se importaron ${importados} socios. ${errores} tuvieron errores.`
  }
}

function cerrarModalImportar() {
  modalImportar.value = false
  archivoCSV.value = null
  sociosPreview.value = []
  errorImportar.value = ''
  exitoImportar.value = ''
}

async function verDetalleSocio(sn) {
  socioSeleccionado.value = sn
  loadingDetalle.value = true
  modalDetalle.value = true
  seccionActiva.value = 'finanzas'  // Reiniciar a la sección de finanzas
  
  // Cargar cuotas del socio
  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  cuotasSocio.value = resumen?.cuotas || []
  loadingDetalle.value = false
}


onMounted(() => {
  sociosStore.fetchSociosNatillera(id)
})
</script>


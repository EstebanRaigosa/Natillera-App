<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header unificado -->
    <div>
      <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
            <BackButton :to="`/natilleras/${id}`" :inline="true" />
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Socios</h1>
              <p class="hidden sm:block text-gray-500 mt-0.5 text-sm">Gestiona los participantes y sus cuotas personalizadas</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 justify-end sm:justify-end w-full sm:w-auto shrink-0">
            <button v-if="!esVisor" @click="modalImportar = true" class="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all shadow-sm">
              <ArrowUpTrayIcon class="w-5 h-5" />
              <span>Importar CSV</span>
            </button>
            <button v-if="!esVisor" @click="abrirModalAgregar" class="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto">
              <PlusIcon class="w-5 h-5" />
              <span>Agregar Socio</span>
            </button>
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
    <div v-if="cargaInicial && sociosStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-gray-400 mt-4">Cargando socios...</p>
    </div>

    <div v-else-if="!cargaInicial && sociosStore.sociosNatillera.length === 0" class="max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden border border-gray-200/60">
      <!-- Header verde -->
      <div class="bg-gradient-to-br from-natillera-700 to-natillera-800 px-8 pt-10 pb-8 text-center">
        <div class="w-16 h-16 mx-auto mb-5 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/10">
          <UsersIcon class="w-8 h-8 text-white" />
        </div>
        <h3 class="font-display font-bold text-white text-xl sm:text-2xl mb-1.5">
          No hay socios registrados
        </h3>
        <p class="text-natillera-200 text-sm sm:text-base">
          Agrega el primer socio para comenzar a gestionar las cuotas
        </p>
      </div>
      <!-- Cuerpo blanco -->
      <div class="bg-white px-8 py-8 text-center">
        <button v-if="!esVisor" @click="abrirModalAgregar" class="btn-primary w-full inline-flex items-center justify-center gap-2">
          <PlusIcon class="w-5 h-5" />
          Agregar Primer Socio
        </button>
      </div>
    </div>

    <!-- Sin resultados de búsqueda -->
    <div v-else-if="!cargaInicial && sociosStore.sociosNatillera.length > 0 && sociosFiltrados.length === 0" class="relative bg-gradient-to-br from-white via-gray-50/30 to-gray-50/20 rounded-3xl p-8 sm:p-12 border border-gray-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
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

    <TransitionGroup 
      v-else-if="sociosFiltrados.length > 0" 
      name="socio-card" 
      tag="div" 
      class="grid gap-4 sm:gap-5 lg:grid-cols-2"
    >
      <div 
        v-for="sn in sociosFiltrados" 
        :key="sn.id"
        :class="[
          'relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-2xl p-5 sm:p-6 border border-natillera-200/50 shadow-lg transition-all duration-300 overflow-hidden group socio-card-item',
          sn.estado === 'inactivo' 
            ? 'opacity-60 grayscale cursor-not-allowed' 
            : 'hover:shadow-2xl hover:shadow-natillera-500/10 hover:-translate-y-1'
        ]"
      >
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
        
        <div 
          :class="[
            'relative z-10',
            'cursor-pointer'
          ]"
          @click="sn.estado === 'activo' ? verDetalleSocio(sn) : verComprobanteSalida(sn)"
        >
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
                <p class="text-sm text-gray-500 truncate mt-1 flex items-center gap-1.5">
                  <EnvelopeIcon class="w-3.5 h-3.5 flex-shrink-0" />
                  <span v-if="sn.socio?.email">{{ sn.socio.email }}</span>
                  <span v-else class="text-gray-400">Sin correo</span>
                </p>
                <p class="text-sm text-gray-500 truncate mt-1 flex items-center gap-1.5">
                  <PhoneIcon class="w-3.5 h-3.5 flex-shrink-0" />
                  <span v-if="sn.socio?.telefono">{{ sn.socio.telefono }}</span>
                  <span v-else class="text-gray-400">Sin teléfono</span>
                </p>
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
              <p class="font-bold text-lg sm:text-xl" :class="sn.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-blue-700'">
                {{ sn.periodicidad === 'quincenal' ? '🗓️ Quincenal' : '📅 Mensual' }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end pt-4 border-t border-gray-200/50">
            <div class="flex gap-2 flex-shrink-0">
              <!-- Botones solo visibles cuando está activo -->
              <template v-if="sn.estado === 'activo'">
                <button 
                  @click.stop="verCuotasSocio(sn)"
                  class="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-lg transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                  title="Ver cuotas"
                >
                  Ver cuotas
                </button>
                <button 
                  v-if="!esVisor"
                  @click.stop="editarSocio(sn)"
                  class="p-2 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 bg-blue-50 rounded-lg transition-all hover:scale-110 shadow-sm hover:shadow-md flex items-center justify-center"
                  title="Editar"
                  aria-label="Editar socio"
                >
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button 
                  v-if="!esVisor"
                  @click.stop="confirmarEliminarSocio(sn)"
                  class="p-2 text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-600 bg-red-50 rounded-lg transition-all hover:scale-110 shadow-sm hover:shadow-md flex items-center justify-center"
                  title="Eliminar socio"
                  aria-label="Eliminar socio"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
                <button 
                  v-if="!esVisor"
                  @click.stop="abrirModalDesactivar(sn)"
                  class="p-2 text-amber-600 hover:text-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600 bg-amber-50 rounded-lg transition-all hover:scale-110 shadow-sm hover:shadow-md flex items-center justify-center"
                  title="Desactivar"
                  aria-label="Desactivar socio"
                >
                  <XCircleIcon class="w-5 h-5" />
                </button>
              </template>
              <!-- Solo botón de activar cuando está inactivo - Destacado con color vibrante -->
              <button 
                v-else-if="!esVisor"
                @click.stop="abrirModalActivar(sn)"
                class="px-4 py-2.5 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-2 border-green-400 rounded-lg transition-all hover:scale-105 shadow-lg hover:shadow-xl font-semibold flex items-center gap-2 animate-pulse hover:animate-none relative z-20"
                style="filter: none !important;"
                title="Activar socio"
                aria-label="Activar socio"
              >
                <CheckCircleIcon class="w-5 h-5" />
                <span class="text-sm">Activar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Modal Detalle Socio -->
    <ModalWrapper
      :show="!!modalDetalle"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto"
      card-max-width="32rem"
      @close="modalDetalle = false"
    >
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

          <!-- Sección: Cuotas pagadas (tabla + total) -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="toggleSeccion('cuotasPagadas')"
              class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-colors text-left"
            >
              <span class="font-semibold text-gray-800 flex items-center gap-2">
                <CalendarDaysIcon class="w-5 h-5 text-emerald-600" />
                Cuotas pagadas
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-500 transition-transform duration-200', seccionActiva === 'cuotasPagadas' ? 'rotate-180' : '']" 
              />
            </button>
            <div v-show="seccionActiva === 'cuotasPagadas'" class="p-4 border-t border-gray-100 bg-white">
              <div v-if="loadingDetalle" class="text-center py-8 text-gray-500 text-sm">
                Cargando cuotas pagadas…
              </div>
              <div v-else-if="cuotasPagadasDetalleSocio.length === 0" class="text-center py-8 text-gray-400 text-sm">
                No hay cuotas pagadas registradas
              </div>
              <div 
                v-else 
                class="overflow-x-auto max-h-[min(320px,45vh)] overflow-y-auto rounded-lg border border-emerald-100/80 shadow-sm"
              >
                <table class="w-full min-w-[280px] text-sm text-left border-collapse">
                  <thead class="sticky top-0 z-[1] bg-emerald-50 border-b border-emerald-100">
                    <tr>
                      <th scope="col" class="px-3 py-2.5 font-semibold text-gray-700">Cuota</th>
                      <th scope="col" class="px-3 py-2.5 font-semibold text-gray-700 text-right whitespace-nowrap">Valor</th>
                      <th scope="col" class="px-3 py-2.5 font-semibold text-gray-700 whitespace-nowrap">Fecha pago</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 bg-white">
                    <tr 
                      v-for="item in cuotasPagadasDetalleSocio" 
                      :key="item.id" 
                      class="hover:bg-emerald-50/50 transition-colors"
                    >
                      <td class="px-3 py-2 text-gray-800 align-top">{{ item.cuotaLabel }}</td>
                      <td class="px-3 py-2 text-right font-medium text-emerald-800 whitespace-nowrap align-top">${{ formatMoney(item.valorPagado) }}</td>
                      <td class="px-3 py-2 text-gray-600 whitespace-nowrap align-top">{{ item.fechaPago ? formatDate(item.fechaPago) : '—' }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-emerald-100/90 border-t-2 border-emerald-200">
                    <tr>
                      <th scope="row" class="px-3 py-2.5 text-left font-bold text-gray-900">Total</th>
                      <td class="px-3 py-2.5 text-right font-bold text-emerald-900 whitespace-nowrap">${{ formatMoney(totalValorCuotasPagadasDetalleSocio) }}</td>
                      <td class="px-3 py-2.5"></td>
                    </tr>
                  </tfoot>
                </table>
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
                <div class="p-4 rounded-xl border" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'">
                  <p class="text-xs text-gray-500 mb-1">Periodicidad</p>
                  <p class="text-xl font-bold" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-blue-700'">
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
            v-if="!esVisor"
            @click="modalDetalle = false; editarSocio(socioSeleccionado)"
            class="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
          >
            <PencilIcon class="w-4 h-4" />
            Editar
          </button>
          <button 
            @click="modalDetalle = false"
            :class="esVisor ? 'btn-primary w-full' : 'btn-primary flex-1'"
          >
            Cerrar
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal Importar CSV -->
    <ModalWrapper
      :show="!!modalImportar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="card relative max-w-lg w-full max-h-[90vh] overflow-y-auto"
      card-max-width="32rem"
      @close="cerrarModalImportar"
    >
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
                  <th class="text-left p-3 font-semibold text-gray-700">
                    Teléfono <span class="text-red-500 text-xs">*</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(socio, index) in sociosPreview" :key="index" class="border-t border-gray-100">
                  <td class="p-3 text-gray-800">{{ socio.nombre }}</td>
                  <td class="p-3 text-natillera-600 font-medium">${{ formatMoney(socio.valor_cuota) }}</td>
                  <td class="p-3" :class="socio.telefono ? 'text-gray-700' : 'text-red-500'">
                    {{ socio.telefono || '❌ Requerido' }}
                  </td>
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
    </ModalWrapper>

    <!-- Modal Agregar Socio: cabecera compacta (~30 % menos alto); formulario + CTAs en un solo scroll -->
    <ModalWrapper
      :show="!!modalAgregar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="cerrarModal"
    >
      <div class="flex-shrink-0 bg-[#1B5E37]">
        <!-- Móvil: X superpuesta (absolute); fila solo icono + títulos -->
        <div class="sm:hidden relative overflow-hidden">
          <button
            v-if="modalAgregarTieneScroll"
            type="button"
            class="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Cerrar"
            :disabled="guardando"
            @click="cerrarModal"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
          <div
            :class="[
              'flex items-center gap-3 pl-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] min-h-[5.25rem]',
              modalAgregarTieneScroll ? 'pr-14' : 'pr-4'
            ]"
          >
            <div class="w-12 h-12 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
              <PencilIcon v-if="socioEditando" class="w-6 h-6 text-[#1B5E37]" />
              <UserPlusIcon v-else class="w-6 h-6 text-[#1B5E37]" />
            </div>
            <div class="min-w-0 flex-1 text-left py-0.5 pr-2">
              <h3 class="font-display font-bold text-white text-xl leading-tight mb-1">
                {{ socioEditando ? 'Editar Socio' : 'Agregar Nuevo Socio' }}
              </h3>
              <p class="text-xs text-white/85 font-normal leading-relaxed">
                {{ socioEditando ? 'Actualiza los datos del participante' : 'Completa los datos para registrar un nuevo socio' }}
              </p>
            </div>
          </div>
        </div>

        <!-- sm+: cabecera centrada; X en esquina (absolute), sin fila extra -->
        <div class="hidden sm:block relative overflow-hidden text-center">
          <button
            v-if="modalAgregarTieneScroll"
            type="button"
            class="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-4 sm:right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Cerrar"
            :disabled="guardando"
            @click="cerrarModal"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
          <div
            class="px-6 pb-4 sm:pb-5 pt-[max(1rem,env(safe-area-inset-top))]"
          >
            <div class="w-[2.8rem] h-[2.8rem] mx-auto mb-2 sm:mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <PencilIcon v-if="socioEditando" class="w-6 h-6 text-[#1B5E37]" />
              <UserPlusIcon v-else class="w-6 h-6 text-[#1B5E37]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg sm:text-xl mb-1">
              {{ socioEditando ? 'Editar Socio' : 'Agregar Nuevo Socio' }}
            </h3>
            <p class="text-xs sm:text-sm text-white/85 font-normal leading-snug max-w-sm mx-auto">
              {{ socioEditando ? 'Actualiza los datos del participante' : 'Completa los datos para registrar un nuevo socio' }}
            </p>
          </div>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalAgregarSocio"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="programarNatiscrollModalAgregarSocio"
        >
        <form id="form-agregar-socio" @submit.prevent="handleGuardarSocio" class="space-y-4 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <!-- Selector de Avatar -->
          <div>
            <label class="label">Selecciona un avatar</label>
            <div class="flex items-center gap-4 mb-3">
              <img 
                :src="getAvatarUrl(formSocio.avatar_seed || 'nuevo', formSocio.avatar_seed, formSocio.avatar_style)" 
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
                  @click="formSocio.avatar_seed = seed; mostrarAvatares = false"
                  :class="[
                    'p-1 rounded-lg transition-all',
                    formSocio.avatar_seed === seed 
                      ? 'ring-2 ring-natillera-500 bg-natillera-100' 
                      : 'hover:bg-gray-100'
                  ]"
                >
                  <img 
                    :src="getAvatarUrl(seed, seed, formSocio.avatar_style)" 
                    :alt="seed"
                    class="w-10 h-10 rounded-lg object-cover"
                    loading="lazy"
                    @error="handleAvatarError($event, seed)"
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
              ref="inputNombreSocio"
              v-model="formSocio.nombre"
              type="text" 
              class="input-field"
              placeholder="Ej: María García"
              required
            />
          </div>

          <!-- Periodicidad -->
          <div>
            <label class="label">
              Periodicidad de pago
            </label>
            <div :class="periodicidadNatillera === 'mensual' ? '' : 'grid grid-cols-2 gap-3'">
              <button
                type="button"
                @click="periodicidadNatillera !== 'mensual' && (formSocio.periodicidad = 'mensual')"
                :disabled="periodicidadNatillera === 'mensual'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all text-left w-full',
                  formSocio.periodicidad === 'mensual'
                    ? 'border-natillera-500 bg-natillera-50 ring-2 ring-natillera-200'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                  periodicidadNatillera === 'mensual' ? 'cursor-default opacity-90' : ''
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xl">📅</span>
                  <span class="font-semibold" :class="formSocio.periodicidad === 'mensual' ? 'text-natillera-700' : 'text-gray-700'">
                    Mensual
                  </span>
                  <span v-if="periodicidadNatillera === 'mensual'" class="ml-auto text-xs bg-natillera-200 text-natillera-700 px-2 py-0.5 rounded-full font-medium">
                    Único
                  </span>
                </div>
                <p class="text-xs text-gray-500">1 cuota por mes</p>
              </button>
              <button
                v-if="periodicidadNatillera === 'quincenal'"
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
            <p v-if="periodicidadNatillera === 'mensual'" class="text-xs text-gray-500 mt-2">
              Esta natillera está configurada como mensual
            </p>
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
                @focus="seleccionarMontoCuota"
                @click="seleccionarMontoCuota"
                @blur="handleValorCuotaBlur"
                type="text"
                inputmode="numeric"
                class="input-field pl-8 text-lg font-semibold"
                placeholder="Ingrese el valor de la cuota (ej: 120.000)"
                required
              />
            </div>
            <div class="mt-2 space-y-2">
              <p class="text-xs text-natillera-600">
                Este es el valor que el socio aportará en cada período
              </p>
              
              <!-- Alerta breve siempre visible cuando se edita -->
              <div v-if="socioEditando" class="flex items-center gap-2 p-2.5 bg-amber-50/80 border border-amber-200/50 rounded-lg">
                <ExclamationTriangleIcon class="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p class="text-xs text-amber-700 flex-1">
                  Este cambio afectará todas las cuotas generadas
                </p>
                
                <!-- Botón de información detallada integrado -->
                <div class="relative flex-shrink-0">
                  <button 
                    type="button"
                    data-advertencia-button
                    @click.stop="mostrarAdvertenciaCuota = !mostrarAdvertenciaCuota"
                    class="flex items-center justify-center w-6 h-6 text-amber-600 hover:text-amber-700 active:text-amber-800 hover:bg-amber-100 rounded-full transition-all touch-manipulation"
                    title="Ver más detalles"
                  >
                    <InformationCircleIcon class="w-5 h-5" />
                  </button>
                
                <!-- Tooltip/Popover con la información completa -->
                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 translate-y-2 scale-95"
                  enter-to-class="opacity-100 translate-y-0 scale-100"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0 scale-100"
                  leave-to-class="opacity-0 translate-y-2 scale-95"
                >
                  <div 
                    v-show="mostrarAdvertenciaCuota"
                    data-advertencia-tooltip
                    class="absolute bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-2rem)] p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-xl z-50"
                    @click.stop
                  >
                    <div class="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-amber-50 border-r border-b border-amber-200"></div>
                    <p class="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                      <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                      Al modificar este valor:
                    </p>
                    <ul class="text-[11px] text-amber-700 space-y-1.5 leading-relaxed">
                      <li class="flex items-start gap-1.5">
                        <span class="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                        <span>Se actualizarán <strong>todas las cuotas</strong> generadas para este socio</span>
                      </li>
                      <li class="flex items-start gap-1.5">
                        <span class="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                        <span><strong>Valor mayor:</strong> Cuotas pagadas → pagos parciales</span>
                      </li>
                      <li class="flex items-start gap-1.5">
                        <span class="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                        <span><strong>Valor menor:</strong> Se mantienen pagadas con nota</span>
                      </li>
                    </ul>
                  </div>
                </Transition>
                </div>
              </div>
            </div>
          </div>

          <!-- Teléfono (obligatorio y único) -->
          <div>
            <label class="label">
              Teléfono / WhatsApp <span class="text-red-500">*</span>
              <span class="text-xs font-normal text-gray-500 ml-2">(único por socio)</span>
            </label>
            <div class="relative flex gap-2">
              <input 
                v-model="formSocio.telefono"
                type="tel" 
                class="input-field flex-1"
                placeholder="3001234567"
                required
              />
              <button
                v-if="contactPickerDisponible"
                @click="abrirSelectorContactos"
                type="button"
                class="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-natillera-500 to-emerald-500 hover:from-natillera-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                title="Seleccionar contacto del teléfono"
              >
                <MagnifyingGlassIcon class="w-5 h-5" />
                <span class="hidden sm:inline">Contactos</span>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              📱 Número único requerido para recordatorios de pago
              <span v-if="contactPickerDisponible" class="block mt-1">
                💡 Usa el botón "Contactos" para seleccionar desde tu agenda
              </span>
            </p>
            <p v-if="errorTelefonoDuplicado" class="text-xs text-red-600 mt-1">
              ⚠️ Este número de teléfono ya está registrado para otro socio
            </p>
          </div>

          <!-- Información de contacto adicional (colapsable) -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              type="button"
              @click="mostrarContacto = !mostrarContacto"
              class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <span class="font-medium text-gray-700">
                📧 Información de contacto adicional
                <span class="text-gray-400 font-normal text-sm">(opcional)</span>
              </span>
              <ChevronDownIcon 
                :class="['w-5 h-5 text-gray-400 transition-transform', mostrarContacto ? 'rotate-180' : '']" 
              />
            </button>
            
            <div v-show="mostrarContacto" class="p-4 space-y-4 border-t border-gray-200">
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

          <div class="space-y-3 pt-2">
            <button
              type="submit"
              class="w-full min-h-[48px] px-5 py-3.5 rounded-full bg-[#1B5E37] hover:bg-[#154a2d] active:bg-[#124228] text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm [-webkit-tap-highlight-color:transparent] touch-manipulation relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="guardando"
            >
              <span :class="['flex items-center justify-center gap-2 transition-opacity', guardando ? 'opacity-0' : 'opacity-100']">
                {{ socioEditando ? 'Guardar Cambios' : 'Agregar Socio' }}
              </span>
              <span
                v-if="guardando"
                class="absolute inset-0 flex items-center justify-center gap-2"
              >
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </span>
            </button>
            <button
              type="button"
              class="w-full min-h-[48px] px-5 py-3 rounded-full text-sm font-semibold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-50"
              :disabled="guardando"
              @click="cerrarModal"
            >
              Cancelar
            </button>
          </div>
        </form>
        </div>

        <div
          v-show="hayNatiscrollModalAgregarSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div
            class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
          >
            <div
              class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
            >
              <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                Desliza para ver más
              </p>
              <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>

    <!-- Modal Cuotas del Socio: patrón modales + natiscroll; lista compacta en rejilla -->
    <ModalWrapper
      :show="!!modalCuotasSocio"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="42rem"
      @close="cerrarModalCuotasSocio"
    >
      <!-- Cabecera marca — móvil: fila -->
      <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
        <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            <img
              v-if="socioParaCuotas"
              :src="getAvatarUrl(socioParaCuotas.socio?.nombre || socioParaCuotas.id, socioParaCuotas.socio?.avatar_seed, socioParaCuotas.socio?.avatar_style)"
              :alt="socioParaCuotas.socio?.nombre"
              class="h-full w-full object-cover"
            />
            <CalendarDaysIcon v-else class="w-5 h-5 text-[#1B5E37]" />
          </div>
          <div class="flex-1 min-w-0 text-left">
            <h3 class="text-base font-display font-bold leading-tight text-white truncate">
              Cuotas del socio
            </h3>
            <p class="text-white/90 text-[0.6875rem] leading-snug mt-0.5 truncate">
              {{ socioParaCuotas?.socio?.nombre || 'Socio' }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:bg-white/20 transition-colors touch-manipulation"
            aria-label="Cerrar"
            @click="cerrarModalCuotasSocio"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
      <!-- Cabecera marca — desktop -->
      <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
        <div class="flex items-start pt-[max(1rem,env(safe-area-inset-top))] pb-5 px-4">
          <div class="w-11 flex-shrink-0" aria-hidden="true" />
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-[3.2rem] h-[3.2rem] rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <img
                v-if="socioParaCuotas"
                :src="getAvatarUrl(socioParaCuotas.socio?.nombre || socioParaCuotas.id, socioParaCuotas.socio?.avatar_seed, socioParaCuotas.socio?.avatar_style)"
                :alt="socioParaCuotas.socio?.nombre"
                class="h-full w-full object-cover"
              />
              <CalendarDaysIcon v-else class="w-6 h-6 text-[#1B5E37]" />
            </div>
            <h3 class="text-lg font-display font-bold text-white mt-2.5 leading-tight">
              Cuotas del socio
            </h3>
            <p class="text-white/90 text-xs mt-1 leading-snug px-1">
              {{ socioParaCuotas?.socio?.nombre || 'Socio' }} · historial por mes
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full text-white hover:bg-white/15 active:bg-white/20 transition-colors touch-manipulation"
            aria-label="Cerrar"
            @click="cerrarModalCuotasSocio"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalCuotasSocio"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 pb-0 space-y-4 bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="programarNatiscrollModalCuotasSocio"
        >
          <div v-if="loadingCuotasSocio" class="text-center py-10">
            <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p class="text-gray-500 text-sm">Cargando cuotas…</p>
          </div>

          <div v-else-if="cuotasSocioPorMes.length === 0" class="text-center py-10 px-2">
            <p class="text-gray-500 text-sm">No hay cuotas registradas</p>
          </div>

          <div v-else class="rounded-xl border border-gray-200/90 bg-white overflow-hidden shadow-sm pb-2">
            <div
              class="sticky top-0 z-[1] grid grid-cols-[minmax(0,4.5rem)_minmax(0,3.25rem)_1fr_minmax(0,4.25rem)_2.25rem] gap-x-1.5 px-2 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
              role="row"
            >
              <span>Mes</span>
              <span>Cuota</span>
              <span class="text-right tabular-nums">Valor a pagar</span>
              <span class="text-right">Estado</span>
              <span class="text-center" aria-hidden="true" />
            </div>
            <div class="divide-y divide-gray-100">
              <div
                v-for="(cuotaData, idx) in cuotasSocioPorMes"
                :key="`${cuotaData.id}-${idx}`"
                role="row"
                class="grid grid-cols-[minmax(0,4.5rem)_minmax(0,3.25rem)_1fr_minmax(0,4.25rem)_2.25rem] gap-x-1.5 items-center px-2 py-2 text-[11px] sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-natillera-500/40 focus-visible:ring-inset"
                :class="[
                  !esVisor ? 'cursor-pointer hover:bg-emerald-50/40 active:bg-emerald-50/60' : '',
                  cuotaData.estado === 'mora' && animacionesCuotasMora ? 'bg-red-50/50' : '',
                  cuotaData.estado === 'pagada' || (cuotaData.valorPagado || 0) >= totalObligacionCuotaSocioModal(cuotaData) ? 'bg-green-50/25' : ''
                ]"
                :tabindex="!esVisor ? 0 : -1"
                @click="handleClickFilaCuotaSocioModal(cuotaData)"
                @keydown.enter.prevent="handleClickFilaCuotaSocioModal(cuotaData)"
              >
                <div class="text-gray-800 font-semibold leading-tight min-w-0">
                  <span class="block truncate" :title="etiquetaMesAnioCuotaSocioModal(cuotaData)">
                    {{ etiquetaMesAnioCuotaSocioModal(cuotaData) }}
                  </span>
                </div>
                <div class="text-gray-800 font-semibold tabular-nums leading-tight">
                  {{ etiquetaPeriodoCuotaSocioModal(cuotaData) }}
                </div>
                <div class="text-right min-w-0">
                  <p class="font-bold tabular-nums text-gray-900 leading-tight">
                    ${{ formatMoney(getMontoValorCuotaSocioModal(cuotaData)) }}
                  </p>
                  <p class="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5 truncate">
                    {{ subetiquetaValorCuotaSocioModal(cuotaData) }}
                  </p>
                </div>
                <div class="flex flex-col items-end gap-0.5 min-w-0 justify-self-end">
                  <span
                    class="inline-flex max-w-full items-center justify-center rounded-md border px-1 py-0.5 text-[9px] sm:text-[11px] font-bold leading-tight"
                    :class="clasesEstadoCuotaSocioModal(cuotaData).badge"
                  >
                    {{ etiquetaEstadoCuotaSocioModal(cuotaData) }}
                  </span>
                </div>
                <div class="flex justify-center" @click.stop>
                  <button
                    v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                    type="button"
                    class="h-9 w-9 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center touch-manipulation shadow-sm"
                    title="WhatsApp"
                    aria-label="Enviar recordatorio por WhatsApp"
                    @click="enviarWhatsAppCuota(cuotaData)"
                  >
                    <ChatBubbleLeftIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              class="w-full min-h-[48px] px-4 py-3 rounded-full border-2 border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors touch-manipulation"
              @click="cerrarModalCuotasSocio"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div
          v-show="hayNatiscrollModalCuotasSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div
            class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12"
          >
            <div
              class="desliza-modal-hint inline-flex max-w-[min(100%,17.5rem)] shrink-0 flex-row items-center gap-2.5 rounded-full border border-white/35 bg-[#1B5E37]/82 px-5 py-2.5 shadow-[0_8px_24px_-6px_rgba(27,94,55,0.45)] ring-1 ring-white/20 sm:max-w-[min(100%,19rem)] sm:gap-3 sm:px-6 sm:py-3"
            >
              <p class="min-w-0 flex-1 text-left font-display text-[0.8125rem] font-semibold leading-snug text-white sm:text-sm">
                Desliza para ver más
              </p>
              <ChevronDownIcon class="desliza-modal-hint__chevron h-5 w-5 shrink-0 text-white/95" stroke-width="2.25" />
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>

    <!-- Modal de confirmación para eliminar socio -->
    <ModalWrapper
      :show="!!socioAEliminar"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] border-2 border-red-200 overflow-hidden flex flex-col"
      card-max-width="28rem"
      @close="socioAEliminar = null"
    >
        <!-- Header con gradiente rojo -->
        <div class="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <ExclamationTriangleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg sm:text-xl font-bold truncate">⚠️ Eliminar Socio</h3>
                <p class="text-white/90 text-xs sm:text-sm">Esta acción es IRREVERSIBLE</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
          <!-- Mensaje principal -->
          <div class="text-center">
            <p class="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
              ¿Estás completamente seguro?
            </p>
            <p class="text-sm sm:text-base text-gray-600">
              Estás a punto de eliminar al socio <strong class="text-red-600">"{{ socioAEliminar.socio?.nombre }}"</strong> de esta natillera.
            </p>
          </div>

          <!-- Advertencia destacada -->
          <div class="bg-gradient-to-br from-red-50 via-rose-50 to-red-50 border-2 border-red-300 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <div class="flex items-start gap-2 sm:gap-3 mb-3">
              <ExclamationTriangleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-red-800 text-sm sm:text-base mb-2">
                  ⚠️ ADVERTENCIA: Se perderá TODA la información
                </p>
                <p class="text-xs sm:text-sm text-red-700 mb-2 font-semibold">
                  Esta acción eliminará PERMANENTEMENTE:
                </p>
                <ul class="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-red-700">
                  <li class="flex items-start gap-1.5 sm:gap-2">
                    <span class="text-red-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span><strong>Todas las cuotas</strong> (pagadas y pendientes)</span>
                  </li>
                  <li class="flex items-start gap-1.5 sm:gap-2">
                    <span class="text-red-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span><strong>Todos los préstamos</strong> y pagos</span>
                  </li>
                  <li class="flex items-start gap-1.5 sm:gap-2">
                    <span class="text-red-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span><strong>Todas las multas</strong> y sanciones</span>
                  </li>
                  <li class="flex items-start gap-1.5 sm:gap-2">
                    <span class="text-red-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span><strong>Todo el historial</strong> de comprobantes</span>
                  </li>
                  <li class="flex items-start gap-1.5 sm:gap-2">
                    <span class="text-red-600 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span><strong>Todos los registros financieros</strong></span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-red-200">
              <p class="text-xs text-red-600 font-semibold">
                💡 Nota: Solo se eliminará de esta natillera.
              </p>
            </div>
          </div>

          <!-- Mensaje final -->
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
            <p class="text-xs text-amber-800 text-center font-medium">
              ⚠️ Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <!-- Footer con botones -->
        <div class="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            @click="socioAEliminar = null"
            :disabled="eliminando"
            class="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="eliminarSocioConfirmado"
            :disabled="eliminando"
            class="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            <span v-if="eliminando" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Eliminando...</span>
            </span>
            <span v-else>Sí, Eliminar</span>
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal Desactivar Socio: sanción opcional y totales -->
    <ModalWrapper
      :show="!!socioADesactivar"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] border-2 border-amber-200 overflow-hidden flex flex-col"
      card-max-width="28rem"
      @close="cerrarModalDesactivar()"
    >
      <!-- Header -->
      <div class="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
        <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-2xl"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <XCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-bold truncate">Desactivar socio</h3>
              <p class="text-white/90 text-xs sm:text-sm truncate">{{ socioADesactivar?.socio?.nombre }}</p>
            </div>
          </div>
          <button type="button" @click="cerrarModalDesactivar()" class="p-2 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0" aria-label="Cerrar">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <!-- Check: Aplicar sanción por retiro (estiludo) -->
        <button
          type="button"
          @click="desactivarSancionar = !desactivarSancionar"
          :class="[
            'w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200',
            desactivarSancionar
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-md shadow-amber-200/40'
              : 'bg-gray-50 border-gray-200 hover:border-amber-200 hover:bg-amber-50/30'
          ]"
        >
          <span
            :class="[
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200',
              desactivarSancionar
                ? 'border-amber-500 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-inner'
                : 'border-gray-300 bg-white'
            ]"
          >
            <CheckIcon v-if="desactivarSancionar" class="w-4 h-4 stroke-[2.5]" />
          </span>
          <span class="min-w-0 flex-1 pt-0.5">
            <p class="font-semibold text-gray-800 text-sm sm:text-base">Aplicar sanción por retiro</p>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5">Descontar un porcentaje para el fondo (sanción por retiro)</p>
          </span>
        </button>

        <!-- Porcentaje de sanción (solo si aplica sanción) -->
        <div v-if="desactivarSancionar" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Porcentaje de sanción por retiro (%)</label>
          <input
            v-model.number="desactivarPorcentajeSancion"
            type="number"
            min="0"
            max="100"
            step="0.5"
            class="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-gray-800 font-medium"
            placeholder="0"
          />
        </div>

        <!-- Resumen: totales del socio -->
        <div class="rounded-xl border-2 border-gray-200 overflow-hidden">
          <div class="bg-gray-100 px-4 py-2.5 border-b border-gray-200">
            <p class="font-semibold text-gray-700 text-sm">Resumen del socio</p>
          </div>
          <div class="divide-y divide-gray-100">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-gray-600 text-sm">Total ahorrado</span>
              <span v-if="loadingTotalesDesactivar" class="text-gray-400 text-sm">Cargando...</span>
              <span v-else class="font-bold text-natillera-700 tabular-nums">${{ formatMoney(totalesDesactivar.totalAhorrado) }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-gray-600 text-sm">Total entregado en actividades</span>
              <span v-if="loadingTotalesDesactivar" class="text-gray-400 text-sm">—</span>
              <span v-else class="font-bold text-gray-800 tabular-nums">${{ formatMoney(totalesDesactivar.totalActividades) }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-gray-600 text-sm">Total pagado en sanciones</span>
              <span v-if="loadingTotalesDesactivar" class="text-gray-400 text-sm">—</span>
              <span v-else class="font-bold text-rose-600 tabular-nums">${{ formatMoney(totalesDesactivar.totalSancionesPagadas) }}</span>
            </div>
          </div>
        </div>

        <!-- Valor a entregar y valor para el fondo -->
        <div class="rounded-xl border-2 border-amber-200 bg-amber-50/50 overflow-hidden">
          <div class="bg-amber-100/80 px-4 py-2.5 border-b border-amber-200">
            <p class="font-semibold text-amber-900 text-sm">Liquidación al desactivar</p>
          </div>
          <div class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-700 font-medium">Valor a entregar al socio</span>
              <span class="font-bold text-lg text-natillera-700 tabular-nums">${{ formatMoney(valorEntregarDesactivar) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-700 font-medium">Valor para el fondo (sanción por retiro)</span>
              <span class="font-bold text-lg text-amber-700 tabular-nums">${{ formatMoney(valorFondoDesactivar) }}</span>
            </div>
          </div>
        </div>

        <!-- Forma de pago de la liquidación (resta de efectivo o transferencia) -->
        <div class="rounded-xl border-2 border-gray-200 overflow-hidden">
          <div class="bg-gray-100 px-4 py-2.5 border-b border-gray-200">
            <p class="font-semibold text-gray-700 text-sm">Forma de pago de la liquidación</p>
            <p class="text-xs text-gray-500 mt-0.5">Se descontará el total (entregar + sanción) de esta forma de pago en cuadre de caja</p>
          </div>
          <div class="p-4 flex gap-3">
            <button
              type="button"
              @click="desactivarFormaPago = 'efectivo'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all',
                desactivarFormaPago === 'efectivo'
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-amber-200'
              ]"
            >
              <BanknotesIcon class="w-5 h-5" />
              Efectivo
            </button>
            <button
              type="button"
              @click="desactivarFormaPago = 'transferencia'"
              :class="[
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all',
                desactivarFormaPago === 'transferencia'
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200'
              ]"
            >
              <BuildingOffice2Icon class="w-5 h-5" />
              Transferencia
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex gap-2 sm:gap-3 flex-shrink-0">
        <button
          type="button"
          @click="cerrarModalDesactivar()"
          :disabled="desactivando"
          class="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-sm sm:text-base rounded-xl transition-all shadow-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirmarDesactivarSocio"
          :disabled="desactivando"
          class="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="desactivando" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Desactivando...
          </span>
          <span v-else>Confirmar desactivar</span>
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Activar Socio: confirmación y reversión de movimientos -->
    <ModalWrapper
      :show="!!socioAActivar"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] border-2 border-emerald-200 overflow-hidden flex flex-col"
      card-max-width="28rem"
      @close="cerrarModalActivar()"
    >
      <div class="bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
        <div class="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 blur-2xl"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <CheckCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-bold truncate">Activar socio</h3>
              <p class="text-white/90 text-xs sm:text-sm truncate">{{ socioAActivar?.socio?.nombre }}</p>
            </div>
          </div>
          <button type="button" @click="cerrarModalActivar()" class="p-2 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0" aria-label="Cerrar">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <div class="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 overflow-hidden">
          <div class="bg-emerald-100/80 px-4 py-2.5 border-b border-emerald-200">
            <p class="font-semibold text-emerald-900 text-sm">Confirmar reactivación</p>
          </div>
          <div class="p-4 space-y-3">
            <p class="text-gray-700 text-sm leading-relaxed">
              El socio volverá a estar <strong>activo</strong> en la natillera. Si al desactivarse se generó liquidación (comprobante de salida), se revertirán automáticamente los movimientos de caja y la sanción por retiro asociados.
            </p>
            <p class="text-gray-600 text-sm">
              ¿Deseas continuar?
            </p>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0 p-4 sm:p-5 pt-0 flex gap-3">
        <button
          type="button"
          @click="cerrarModalActivar()"
          class="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm sm:text-base rounded-xl hover:bg-gray-50 transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="confirmarActivarSocio"
          :disabled="activando"
          class="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="activando" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Activando...
          </span>
          <span v-else>Confirmar activar</span>
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Comprobante de Desactivación -->
    <ModalWrapper
      :show="!!comprobanteDesactivacion"
      :z-index="55"
      align="bottom"
      overlay-class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[85vh] border-2 border-amber-200 overflow-hidden flex flex-col"
      card-max-width="28rem"
      @close="cerrarComprobanteDesactivacion()"
    >
      <div class="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden flex-shrink-0">
        <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <DocumentTextIcon class="w-5 h-5 text-white" />
            </div>
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-bold truncate">Comprobante de salida</h3>
              <p class="text-white/90 text-xs sm:text-sm truncate">Salida de la natillera</p>
            </div>
          </div>
          <button type="button" @click="cerrarComprobanteDesactivacion()" class="p-2 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0" aria-label="Cerrar">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
      <div class="overflow-y-auto flex-1 p-3 sm:p-4">
        <div
          ref="comprobanteDesactivacionRef"
          class="bg-white rounded-2xl overflow-hidden mx-auto"
          style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 340px;"
        >
          <div style="background: #fffbeb; padding: 14px 12px; color: #1f2937;">
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
                    <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.5px;">
                  Liquidación por Salida
                </h1>
              </div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
              <div style="text-align: center; margin-bottom: 10px;">
                <p style="color: #6b7280; font-size: 9px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">VALOR A ENTREGAR</p>
                <p style="font-size: 26px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -1px; color: #b45309;">
                  ${{ formatMoney(comprobanteDesactivacion?.valorEntregar) }}
                </p>
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1.5px solid #fcd34d; border-radius: 12px; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;">
                  <span style="width: 5px; height: 5px; background: #d97706; border-radius: 50%; display: inline-block;"></span>
                  <p style="color: #b45309; font-size: 9px; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">SALIDA DE LA NATILLERA</p>
                </div>
                <p v-if="comprobanteDesactivacion?.codigoComprobante" style="color: #9ca3af; font-size: 11px; margin: 6px 0 0 0; font-weight: 500; letter-spacing: 0.3px; font-family: 'Courier New', monospace;">
                  {{ comprobanteDesactivacion.codigoComprobante }}
                </p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Socio</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.2;">{{ comprobanteDesactivacion?.socioNombre }}</p>
                </div>
                <div>
                  <p style="color: #9ca3af; font-size: 8px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">Fecha</p>
                  <p style="font-weight: 600; font-size: 11px; margin: 0; color: #111827; line-height: 1.4;">{{ comprobanteDesactivacion?.fecha }}</p>
                </div>
              </div>
            </div>
            <div style="margin-bottom: 10px; background: white; padding: 10px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);">
              <p style="color: #6b7280; font-size: 9px; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">RESUMEN</p>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #065f46; font-size: 11px; font-weight: 600;">Total ahorrado</span>
                  <span style="font-size: 13px; font-weight: 700; color: #065f46;">${{ formatMoney(comprobanteDesactivacion?.totalAhorrado || 0) }}</span>
                </div>
                <div v-if="(comprobanteDesactivacion?.valorFondo || 0) > 0" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #991b1b; font-size: 11px; font-weight: 600;">Sanción por retiro</span>
                  <span style="font-size: 13px; font-weight: 700; color: #dc2626;">${{ formatMoney(comprobanteDesactivacion?.valorFondo) }}</span>
                </div>
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #b45309; font-size: 11px; font-weight: 700;">Valor a entregar</span>
                  <span style="font-size: 14px; font-weight: 800; color: #b45309;">${{ formatMoney(comprobanteDesactivacion?.valorEntregar) }}</span>
                </div>
              </div>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                <div style="width: 3px; height: 3px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%;"></div>
                <p style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 10px; margin: 0; font-weight: 700;">Natillerapp</p>
                <div style="width: 3px; height: 3px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0 flex gap-3">
        <button
          type="button"
          @click="descargarComprobanteDesactivacion"
          :disabled="generandoImagenDesactivacion"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
        >
          <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
          {{ generandoImagenDesactivacion ? '...' : 'Descargar' }}
        </button>
        <button
          type="button"
          @click="compartirWhatsAppDesactivacion"
          :disabled="generandoImagenDesactivacion"
          :class="['flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm shadow-md transition-all', comprobanteDesactivacion?.socioTelefono && !generandoImagenDesactivacion ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed']"
        >
          <ChatBubbleLeftIcon class="w-5 h-5 flex-shrink-0" />
          Compartir
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal de Progreso de Creación de Socio - DISEÑO ULTRA MODERNO -->
    <ModalWrapper
      :show="modalProgreso"
      :z-index="60"
      overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      card-class="relative w-full max-w-sm"
      card-max-width="24rem"
    >
          <div class="relative w-full">
            <!-- Tarjeta principal con efecto 3D -->
            <div class="relative bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-emerald-500/20 overflow-hidden border border-white/50">
              <!-- Gradiente superior decorativo -->
              <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 opacity-10"></div>
              
              <!-- Anillos orbitales decorativos (cuando está procesando) -->
              <div v-if="!progresoCreacion.exito && !progresoCreacion.error" class="absolute inset-0 flex items-center justify-center pointer-events-none" style="top: -20px">
                <div class="w-40 h-40 border border-emerald-200/30 rounded-full animate-orbit-slow"></div>
                <div class="absolute w-32 h-32 border border-green-200/40 rounded-full animate-orbit-reverse"></div>
              </div>

              <div class="relative p-8 pb-10">
                <!-- Icono principal con múltiples capas de animación -->
                <div class="relative mx-auto mb-8 w-28 h-28">
                  <!-- Aura exterior pulsante -->
                  <div 
                    :class="[
                      'absolute -inset-4 rounded-full transition-all duration-700',
                      progresoCreacion.exito 
                        ? 'bg-emerald-400/20 animate-pulse-success' 
                        : progresoCreacion.error && progresoCreacion.paso === 0
                          ? 'bg-red-400/20 animate-pulse'
                          : 'bg-gradient-to-r from-emerald-400/15 via-green-400/20 to-teal-400/15 animate-pulse-slow'
                    ]"
                  ></div>
                  
                  <!-- Anillo giratorio exterior -->
                  <div 
                    v-if="!progresoCreacion.exito && progresoCreacion.paso > 0"
                    class="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-300/40 animate-spin-very-slow"
                  ></div>
                  
                  <!-- Círculo principal -->
                  <div 
                    :class="[
                      'absolute inset-0 rounded-full flex items-center justify-center transition-all duration-700 transform',
                      progresoCreacion.exito 
                        ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-2xl shadow-emerald-500/50 scale-110' 
                        : progresoCreacion.error && progresoCreacion.paso === 0
                          ? 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-500 shadow-2xl shadow-red-500/40'
                          : 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-xl shadow-emerald-500/30'
                    ]"
                  >
                    <!-- Efecto de brillo interior -->
                    <div class="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                    
                    <!-- Estado: Creando socio -->
                    <template v-if="progresoCreacion.paso === 1">
                      <div class="relative">
                        <UserIcon class="w-12 h-12 text-white drop-shadow-lg animate-bounce-gentle" />
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <PlusIcon class="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    </template>
                    
                    <!-- Estado: Generando cuotas -->
                    <template v-else-if="progresoCreacion.paso === 2">
                      <div class="relative">
                        <SparklesIcon class="w-12 h-12 text-white drop-shadow-lg animate-sparkle" />
                        <!-- Mini estrellas que salen -->
                        <div class="absolute -top-2 -right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                        <div class="absolute -bottom-1 -left-2 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping" style="animation-delay: 0.3s"></div>
                      </div>
                    </template>
                    
                    <!-- Estado: Completado con éxito -->
                    <template v-else-if="progresoCreacion.paso === 3 && progresoCreacion.exito">
                      <CheckCircleIcon class="w-14 h-14 text-white drop-shadow-lg animate-success-pop" />
                    </template>
                    
                    <!-- Estado: Error -->
                    <template v-else-if="progresoCreacion.error && progresoCreacion.paso === 0">
                      <XCircleIcon class="w-14 h-14 text-white drop-shadow-lg animate-shake" />
                    </template>
                    
                    <!-- Estado: Iniciando -->
                    <template v-else>
                      <div class="relative w-12 h-12">
                        <div class="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                        <div class="absolute inset-2 border-2 border-transparent border-b-white/60 rounded-full animate-spin-reverse"></div>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Nombre del socio con tipografía elegante -->
                <h3 class="text-2xl font-display font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent text-center mb-1">
                  {{ progresoCreacion.nombreSocio }}
                </h3>

                <!-- Mensaje de progreso con animación sutil -->
                <p 
                  :class="[
                    'text-center text-base font-medium mb-6 transition-all duration-500',
                    progresoCreacion.exito ? 'text-emerald-600' : 
                    progresoCreacion.error && progresoCreacion.paso === 0 ? 'text-red-500' : 'text-gray-500'
                  ]"
                >
                  {{ progresoCreacion.mensaje }}
                </p>

                <!-- Timeline de pasos - Diseño minimalista y elegante -->
                <div class="relative mb-8">
                  <!-- Línea de conexión -->
                  <div class="absolute top-4 left-8 right-8 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700 ease-out rounded-full"
                      :style="{ width: `${((progresoCreacion.paso - 1) / 2) * 100}%` }"
                    ></div>
                  </div>
                  
                  <div class="relative flex justify-between">
                    <!-- Paso 1: Socio -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 1 
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso > 1">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <UserIcon v-else-if="progresoCreacion.paso === 1" class="w-4 h-4" />
                        <span v-else class="text-xs font-bold">1</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 1 ? 'text-emerald-600' : 'text-gray-400']">Socio</span>
                    </div>
                    
                    <!-- Paso 2: Cuotas -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 2 
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso > 2">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <SparklesIcon v-else-if="progresoCreacion.paso === 2" class="w-4 h-4 animate-pulse" />
                        <span v-else class="text-xs font-bold">2</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 2 ? 'text-emerald-600' : 'text-gray-400']">Cuotas</span>
                    </div>
                    
                    <!-- Paso 3: Listo -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 3 
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                            : 'bg-gray-100 text-gray-400'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso >= 3">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <span v-else class="text-xs font-bold">3</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 3 ? 'text-emerald-600' : 'text-gray-400']">¡Listo!</span>
                    </div>
                  </div>
                </div>

                <!-- Badge de cuotas generadas - Diseño premium -->
                <Transition
                  enter-active-class="transition-all duration-500 ease-out"
                  enter-from-class="opacity-0 scale-90 translate-y-4"
                  enter-to-class="opacity-100 scale-100 translate-y-0"
                >
                  <div 
                    v-if="progresoCreacion.paso >= 2 && progresoCreacion.cuotasGeneradas > 0"
                    class="flex justify-center"
                  >
                    <div class="relative group">
                      <!-- Glow effect -->
                      <div class="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      
                      <div class="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-2xl">
                        <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                          <SparklesIcon class="w-5 h-5 text-white" />
                        </div>
                        <div class="text-left">
                          <p class="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {{ progresoCreacion.cuotasGeneradas }}
                          </p>
                          <p class="text-xs text-gray-500 font-medium">cuotas generadas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- Mensaje de éxito final -->
                <Transition
                  enter-active-class="transition-all duration-700 delay-300"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                >
                  <div v-if="progresoCreacion.exito" class="mt-6 text-center">
                    <p class="text-sm text-gray-400">El modal se cerrará automáticamente...</p>
                  </div>
                </Transition>

                <!-- Mensaje de error con botón de cerrar -->
                <div v-if="progresoCreacion.error && progresoCreacion.paso === 0" class="mt-6 text-center">
                  <div class="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p class="text-sm text-red-600">{{ progresoCreacion.error }}</p>
                  </div>
                  <button 
                    @click="cerrarModalProgreso"
                    class="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <!-- Barra de progreso inferior decorativa -->
              <div class="h-1.5 bg-gray-100">
                <div 
                  class="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 transition-all duration-700 ease-out"
                  :style="{ width: `${(progresoCreacion.paso / 3) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch, Transition, TransitionGroup, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSociosStore } from '../../stores/socios'
import { useCuotasStore } from '../../stores/cuotas'
import { useNatillerasStore } from '../../stores/natilleras'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useNotificationStore } from '../../stores/notifications'
import { natilleraPrestamosDeshabilitados } from '../../utils/natilleraPrestamos'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { supabase } from '../../lib/supabase'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useModalBodyScrollOverflow } from '../../composables/useModalBodyScrollOverflow'
import { TOURS_ENABLED } from '../../config/toursEnabled'
import { shouldShowNatilleraMenuTour, startNatilleraMenuTour } from '../../composables/useNatilleraMenuTour'
import {
  shouldShowPrimerSocioSociosNavTour,
  startPrimerSocioSociosNavTour,
  consumePendingPrimerSocioNavTour
} from '../../composables/usePrimerSocioSociosNavTour'
import {
  setPendingCuotasDetalleTour,
  setPrimerFlujoSocioNatilleraId
} from '../../composables/usePrimerSocioCuotasMesTour'
import { toPng } from 'html-to-image'
import ModalWrapper from '../../components/ModalWrapper.vue'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'

import BackButton from '../../components/BackButton.vue'
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
  UserPlusIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  SparklesIcon,
  CheckIcon,
  BuildingOffice2Icon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const sociosStore = useSociosStore()
const cuotasStore = useCuotasStore()
const natillerasStore = useNatillerasStore()
const configStore = useConfiguracionStore()
const notificationStore = useNotificationStore()
const colaboradoresStore = useColaboradoresStore()
const dashboardSidebar = inject('dashboardSidebar', null)

const modalAgregar = ref(false)
const scrollAreaModalAgregarSocio = ref(null)
const { tieneScroll: modalAgregarTieneScroll } = useModalBodyScrollOverflow(
  modalAgregar,
  scrollAreaModalAgregarSocio
)
const hayNatiscrollModalAgregarSocio = ref(false)
let rafNatiscrollModalAgregarSocio = null

function actualizarNatiscrollModalAgregarSocio() {
  const el = scrollAreaModalAgregarSocio.value
  if (!el || !modalAgregar.value) {
    hayNatiscrollModalAgregarSocio.value = false
    return
  }
  hayNatiscrollModalAgregarSocio.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalAgregarSocio() {
  if (rafNatiscrollModalAgregarSocio != null) cancelAnimationFrame(rafNatiscrollModalAgregarSocio)
  rafNatiscrollModalAgregarSocio = requestAnimationFrame(() => {
    rafNatiscrollModalAgregarSocio = null
    actualizarNatiscrollModalAgregarSocio()
  })
}

const inputNombreSocio = ref(null)
const modalDetalle = ref(false)
const modalImportar = ref(false)
const modalCuotasSocio = ref(false)
const animacionesCuotasMora = ref(true) // Controla si se muestran las animaciones de cuotas en mora
const modalProgreso = ref(false)

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalAgregar)
watch(modalAgregar, (open) => {
  if (!open) {
    hayNatiscrollModalAgregarSocio.value = false
    return
  }
  nextTick(() => {
    programarNatiscrollModalAgregarSocio()
    requestAnimationFrame(() => {
      const el = inputNombreSocio.value
      if (el && typeof el.focus === 'function') {
        try {
          el.focus({ preventScroll: true })
        } catch {
          el.focus()
        }
      }
    })
  })
})
useBodyScrollLock(modalDetalle)
useBodyScrollLock(modalImportar)
useBodyScrollLock(modalCuotasSocio)
useBodyScrollLock(modalProgreso)

const loadingCuotasSocio = ref(false)
const socioEditando = ref(null)
const socioSeleccionado = ref(null)
const socioParaCuotas = ref(null)
const cuotasSocioPorMes = ref([])

const scrollAreaModalCuotasSocio = ref(null)
const hayNatiscrollModalCuotasSocio = ref(false)
let rafNatiscrollModalCuotasSocio = null

function actualizarNatiscrollModalCuotasSocio() {
  const el = scrollAreaModalCuotasSocio.value
  if (!el || !modalCuotasSocio.value) {
    hayNatiscrollModalCuotasSocio.value = false
    return
  }
  hayNatiscrollModalCuotasSocio.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalCuotasSocio() {
  if (rafNatiscrollModalCuotasSocio != null) cancelAnimationFrame(rafNatiscrollModalCuotasSocio)
  rafNatiscrollModalCuotasSocio = requestAnimationFrame(() => {
    rafNatiscrollModalCuotasSocio = null
    actualizarNatiscrollModalCuotasSocio()
  })
}

watch(
  [modalCuotasSocio, loadingCuotasSocio, () => cuotasSocioPorMes.value.length],
  () => {
    if (modalCuotasSocio.value) {
      nextTick(() => programarNatiscrollModalCuotasSocio())
    } else {
      hayNatiscrollModalCuotasSocio.value = false
    }
  },
  { flush: 'post' }
)

const errorSocio = ref('')
const errorTelefonoDuplicado = ref(false)
const mostrarContacto = ref(false)
const mostrarAdvertenciaCuota = ref(false)
const cuotasSocio = ref([])
const loadingDetalle = ref(false)
const busqueda = ref('')
const socioAEliminar = ref(null)
useBodyScrollLock(computed(() => !!socioAEliminar.value))

// Modal desactivar socio: sanción opcional y totales
const socioADesactivar = ref(null)
const desactivarSancionar = ref(false)
const desactivarPorcentajeSancion = ref(0)
const desactivarFormaPago = ref('efectivo') // efectivo | transferencia
const totalesDesactivar = ref({
  totalAhorrado: 0,
  totalActividades: 0,
  totalSancionesPagadas: 0,
  valorRecaudado: 0
})
const loadingTotalesDesactivar = ref(false)
const desactivando = ref(false)
const comprobanteDesactivacion = ref(null)
const comprobanteDesactivacionRef = ref(null)
const generandoImagenDesactivacion = ref(false)
const comprobantesSalidaGuardados = ref({})
const loadingComprobanteSalida = ref(false)
useBodyScrollLock(computed(() => !!socioADesactivar.value))
useBodyScrollLock(computed(() => !!comprobanteDesactivacion.value))

// Modal activar socio (confirmación y reversión)
const socioAActivar = ref(null)
const activando = ref(false)
useBodyScrollLock(computed(() => !!socioAActivar.value))

const guardando = ref(false)
const eliminando = ref(false)
const cargaInicial = ref(true) // Solo true durante la primera carga
const miRol = ref(null)

// Variables para el modal de progreso de creación de socio
const progresoCreacion = ref({
  paso: 0, // 0: iniciando, 1: creando socio, 2: generando cuotas, 3: completado
  mensaje: '',
  cuotasGeneradas: 0,
  cuotasTotales: 0,
  error: null,
  exito: false,
  nombreSocio: ''
})

// Variables para préstamos en mora
const prestamosEnMora = ref([])
const loadingPrestamos = ref(false)
const mostrarSeccionPrestamosEnMora = ref(false)

// Variables para cuotas de natillera en mora
const mostrarSeccionCuotasEnMora = ref(false)
const loadingCuotas = ref(false)

// Variables para importación CSV
const archivoCSV = ref(null)
const sociosPreview = ref([])
const errorImportar = ref('')
const exitoImportar = ref('')
const importando = ref(false)

// Sección activa del modal de detalle (solo una a la vez)
const seccionActiva = ref('finanzas')  // 'finanzas', 'cuotasPagadas', 'contacto', 'config' o null

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
  valor_cuota: 0, // Iniciar en 0 para forzar al usuario a ingresar un valor explícitamente
  periodicidad: 'mensual',
  avatar_seed: '',
  avatar_style: 'adventurer'
})

const mostrarAvatares = ref(false)

watch(
  [mostrarContacto, mostrarAvatares, socioEditando],
  () => {
    if (modalAgregar.value) {
      nextTick(() => programarNatiscrollModalAgregarSocio())
    }
  },
  { flush: 'post' }
)

// Verificar si la Contact Picker API está disponible
const contactPickerDisponible = ref(false)
const razonNoDisponible = ref('')

// Función auxiliar para detectar si estamos en un dispositivo móvil
function esDispositivoMovil() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768 && 'ontouchstart' in window)
}

// Verificar disponibilidad de la Contact Picker API al montar el componente
onMounted(() => {
  const esMovil = esDispositivoMovil()
  
  // Verificar si la Contact Picker API está disponible
  // Esta API está disponible principalmente en Chrome/Edge en Android
  if (!esMovil) {
    razonNoDisponible.value = 'La función de contactos solo está disponible en dispositivos móviles'
    contactPickerDisponible.value = false
    return
  }

  // Verificar si la API está disponible en el navegador
  if ('contacts' in navigator && 'select' in navigator.contacts) {
    contactPickerDisponible.value = true
    razonNoDisponible.value = ''
  } else if ('contacts' in navigator && 'pick' in navigator.contacts) {
    // API alternativa en algunos navegadores móviles
    contactPickerDisponible.value = true
    razonNoDisponible.value = ''
  } else {
    // Intentar verificar de otra manera (para APIs experimentales)
    try {
      if (navigator.contacts && typeof navigator.contacts.select === 'function') {
        contactPickerDisponible.value = true
        razonNoDisponible.value = ''
      } else if (navigator.contacts && typeof navigator.contacts.pick === 'function') {
        contactPickerDisponible.value = true
        razonNoDisponible.value = ''
      } else {
        // API no disponible - determinar la razón
        const userAgent = navigator.userAgent
        if (/iPhone|iPad|iPod/i.test(userAgent)) {
          razonNoDisponible.value = 'iOS Safari no soporta esta función. Usa Chrome o Edge en Android.'
        } else if (/Android/i.test(userAgent)) {
          razonNoDisponible.value = 'Esta función requiere Chrome o Edge en Android. Tu navegador actual no la soporta.'
        } else {
          razonNoDisponible.value = 'Tu navegador no soporta la selección de contactos. Prueba con Chrome o Edge en Android.'
        }
        contactPickerDisponible.value = false
      }
    } catch (e) {
      // API no disponible
      razonNoDisponible.value = 'Error al verificar la disponibilidad de la API de contactos'
      contactPickerDisponible.value = false
    }
  }
  
  // Debug: mostrar información en consola (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('Contact Picker API:', {
      disponible: contactPickerDisponible.value,
      esMovil,
      userAgent: navigator.userAgent,
      tieneContacts: 'contacts' in navigator,
      tieneSelect: 'contacts' in navigator && 'select' in navigator.contacts,
      tienePick: 'contacts' in navigator && 'pick' in navigator.contacts,
      razon: razonNoDisponible.value
    })
  }
})

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

// Periodicidad de la natillera actual
const periodicidadNatillera = computed(() => {
  // Si la natillera actual no coincide con el ID de la ruta, retornar 'mensual' por defecto
  // pero esto debería manejarse cargando la natillera cuando sea necesario
  if (natillerasStore.natilleraActual && natillerasStore.natilleraActual.id === id) {
    return natillerasStore.natilleraActual.periodicidad || 'mensual'
  }
  return 'mensual'
})

// Verificar si el usuario es visor
const esVisor = computed(() => {
  return miRol.value === 'visor'
})

// Usuario autenticado
const usuarioAutenticado = ref(null)

// Verificar si el usuario es admin
const esAdmin = computed(() => {
  const natillera = natillerasStore.natilleraActual
  if (!natillera || !usuarioAutenticado.value) return false
  return natillera.admin_id === usuarioAutenticado.value.id
})

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
    .filter(c => c.estado === 'pendiente' || c.estado === 'parcial' || c.estado === 'mora')
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
  const valorOriginal = event.target.value
  // Remover puntos (separadores de miles) y cualquier carácter no numérico
  const valorLimpio = valorOriginal.replace(/\./g, '').replace(/[^\d]/g, '')
  
  console.log('📝 Input de cuota - Valor original del input:', valorOriginal)
  console.log('📝 Input de cuota - Valor limpio (sin puntos):', valorLimpio)
  console.log('📝 Input de cuota - formSocio.valor_cuota ANTES:', formSocio.valor_cuota)
  
  if (valorLimpio === '' || valorLimpio === '0') {
    formSocio.valor_cuota = 0
    console.log('📝 Input de cuota - Valor final: 0 (vacío o cero)')
  } else {
    // Usar parseFloat para manejar números grandes correctamente (parseInt tiene límites)
    const numero = parseFloat(valorLimpio)
    if (!isNaN(numero) && numero > 0) {
      const valorAnterior = formSocio.valor_cuota
      formSocio.valor_cuota = numero
      console.log('✅ Input de cuota - Valor parseado:', numero, 'Tipo:', typeof numero)
      console.log('✅ Input de cuota - formSocio.valor_cuota actualizado de', valorAnterior, 'a', formSocio.valor_cuota)
      console.log('✅ Input de cuota - Verificación: formSocio.valor_cuota ===', formSocio.valor_cuota, ':', formSocio.valor_cuota === numero)
    } else {
      console.warn('⚠️ Input de cuota - Valor no válido (NaN o <= 0):', valorLimpio, '→', numero)
    }
  }
}

function seleccionarMontoCuota(event) {
  const input = event?.target
  if (!input || typeof input.select !== 'function') return
  // El click puede mover el cursor después de seleccionar; diferimos el select()
  setTimeout(() => input.select(), 0)
}

// Manejar blur del input para validar el valor final
function handleValorCuotaBlur(event) {
  const valorActual = formSocio.valor_cuota
  console.log('👋 Blur del input - Valor final en formSocio.valor_cuota:', valorActual)
  
  // Si el valor es 0, asegurar que el campo esté vacío visualmente
  if (valorActual === 0) {
    event.target.value = ''
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
  // Asegurar que la URL esté correctamente formateada
  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodedSeed}&backgroundColor=${bgColors}`
}

function handleAvatarError(event, seed) {
  // Si falla la carga, intentar con un seed por defecto
  const img = event.target
  const fallbackSeed = seed || img.alt || 'default'
  // Intentar con un seed simple sin caracteres especiales
  const simpleSeed = fallbackSeed.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  img.src = getAvatarUrl(simpleSeed, simpleSeed, 'adventurer')
}

async function abrirModalAgregar() {
  // Asegurar que la natillera esté cargada para obtener su periodicidad
  if (!natillerasStore.natilleraActual || natillerasStore.natilleraActual.id !== id) {
    await natillerasStore.fetchNatillera(id)
  }
  
  // IMPORTANTE: Resetear el formulario completamente antes de abrir el modal
  // para asegurar que no haya valores residuales
  Object.assign(formSocio, {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 0, // Iniciar en 0 para forzar al usuario a ingresar un valor
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer'
  })
  
  // Establecer la periodicidad inicial según la natillera
  // Si la natillera es quincenal, permitir ambas opciones (mensual y quincenal)
  // Si la natillera es mensual, solo permitir mensual
  const periodicidad = periodicidadNatillera.value
  if (periodicidad === 'mensual') {
    formSocio.periodicidad = 'mensual'
  } else {
    // Para natilleras quincenales, establecer mensual por defecto pero permitir ambas opciones
    formSocio.periodicidad = 'mensual'
  }
  
  // Generar un avatar_seed inicial aleatorio si no hay uno
  if (!formSocio.avatar_seed) {
    const randomIndex = Math.floor(Math.random() * avatarSeeds.length)
    formSocio.avatar_seed = avatarSeeds[randomIndex]
  }
  
  console.log('📝 Modal abierto - formSocio inicial:', { ...formSocio })
  modalAgregar.value = true
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
  errorTelefonoDuplicado.value = false
  mostrarContacto.value = false
  mostrarAvatares.value = false
  mostrarAdvertenciaCuota.value = false
  Object.assign(formSocio, {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 0, // Resetear a 0 para forzar al usuario a ingresar un valor
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer'
  })
}

// Función auxiliar para limpiar y formatear número de teléfono
// Quita el indicativo de país (57 o +57) para dejar solo el número
function limpiarNumeroTelefono(telefono) {
  if (!telefono) return ''
  // Remover caracteres no numéricos excepto el signo +
  let numeroLimpio = telefono.replace(/[^\d+]/g, '')
  
  // Si comienza con +, quitar el signo
  if (numeroLimpio.startsWith('+')) {
    numeroLimpio = numeroLimpio.substring(1)
  }
  
  // Quitar el indicativo de Colombia (57) si está presente
  // Si el número tiene más de 10 dígitos y comienza con 57, quitar el 57
  if (numeroLimpio.length > 10 && numeroLimpio.startsWith('57')) {
    numeroLimpio = numeroLimpio.substring(2)
  }
  
  // Si solo tiene caracteres no numéricos, limpiar todo
  if (!numeroLimpio || numeroLimpio.length === 0) {
    numeroLimpio = telefono.replace(/\D/g, '')
    // Aplicar la misma lógica de quitar el indicativo
    if (numeroLimpio.length > 10 && numeroLimpio.startsWith('57')) {
      numeroLimpio = numeroLimpio.substring(2)
    }
  }
  
  return numeroLimpio
}

// Función para abrir el selector de contactos del dispositivo móvil
async function abrirSelectorContactos() {
  try {
    // Verificar si la API está disponible
    if (!('contacts' in navigator)) {
      notificationStore.error(
        'El selector de contactos no está disponible en este navegador',
        'Función no disponible',
        3000
      )
      return
    }

    let contactos = null

    // Intentar usar la Contact Picker API estándar (Chrome/Edge en Android)
    if ('select' in navigator.contacts) {
      try {
        const props = ['tel']
        const opts = { multiple: false }
        contactos = await navigator.contacts.select(props, opts)
      } catch (error) {
        console.error('Error al usar navigator.contacts.select:', error)
        // Intentar con API alternativa
        if ('pick' in navigator.contacts) {
          contactos = await navigator.contacts.pick({ filterBy: ['tel'], multiple: false })
        }
      }
    } else if ('pick' in navigator.contacts) {
      // API alternativa
      contactos = await navigator.contacts.pick({ filterBy: ['tel'], multiple: false })
    }

    if (contactos && contactos.length > 0) {
      const contacto = contactos[0]
      
      // Extraer el número de teléfono - manejar diferentes formatos de respuesta
      let numeroTelefono = ''
      
      // Formato 1: contacto.tel (array de strings)
      if (contacto.tel && Array.isArray(contacto.tel) && contacto.tel.length > 0) {
        numeroTelefono = contacto.tel[0]
      } 
      // Formato 2: contacto.tel (string único)
      else if (contacto.tel && typeof contacto.tel === 'string') {
        numeroTelefono = contacto.tel
      }
      // Formato 3: contacto.phoneNumbers (array de objetos)
      else if (contacto.phoneNumbers && Array.isArray(contacto.phoneNumbers) && contacto.phoneNumbers.length > 0) {
        const phoneNumber = contacto.phoneNumbers[0]
        numeroTelefono = phoneNumber.value || phoneNumber.number || phoneNumber.tel || phoneNumber
      }
      // Formato 4: contacto.phoneNumber (string único)
      else if (contacto.phoneNumber && typeof contacto.phoneNumber === 'string') {
        numeroTelefono = contacto.phoneNumber
      }

      if (numeroTelefono) {
        // Limpiar y formatear el número
        formSocio.telefono = limpiarNumeroTelefono(numeroTelefono)
        
        // También intentar llenar el nombre si está vacío
        if (!formSocio.nombre) {
          if (contacto.name) {
            formSocio.nombre = Array.isArray(contacto.name) ? contacto.name[0] : contacto.name
          } else if (contacto.displayName) {
            formSocio.nombre = contacto.displayName
          } else if (contacto.givenName) {
            const nombreCompleto = [contacto.givenName, contacto.familyName].filter(Boolean).join(' ')
            if (nombreCompleto) {
              formSocio.nombre = nombreCompleto
            }
          }
        }

        // También intentar llenar el email si está vacío
        if (!formSocio.email) {
          if (contacto.email) {
            formSocio.email = Array.isArray(contacto.email) ? contacto.email[0] : contacto.email
          } else if (contacto.emails && Array.isArray(contacto.emails) && contacto.emails.length > 0) {
            const emailObj = contacto.emails[0]
            formSocio.email = emailObj.value || emailObj.address || emailObj
          }
        }

        notificationStore.success(
          'Contacto seleccionado correctamente',
          'Éxito',
          2000
        )
      } else {
        notificationStore.warning(
          'El contacto seleccionado no tiene número de teléfono',
          'Sin teléfono',
          3000
        )
      }
    } else {
      // El usuario canceló la selección - no mostrar error
      console.log('Selección de contacto cancelada')
    }
  } catch (error) {
    console.error('Error al abrir selector de contactos:', error)
    
    // Manejar diferentes tipos de errores
    if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
      notificationStore.warning(
        'Permiso denegado o acción cancelada',
        'Acceso a contactos',
        3000
      )
    } else if (error.name === 'NotSupportedError') {
      notificationStore.error(
        'El selector de contactos no está soportado en este dispositivo',
        'Función no soportada',
        3000
      )
    } else {
      notificationStore.error(
        'Error al acceder a los contactos: ' + (error.message || 'Error desconocido'),
        'Error',
        4000
      )
    }
  }
}

function programarTourMenuNatilleraSiCorresponde(eraListaVaciaAntes, natilleraId) {
  if (!TOURS_ENABLED) return
  if (!eraListaVaciaAntes || !natilleraId) return

  const veniaDeModalSinSocios = consumePendingPrimerSocioNavTour(natilleraId)
  if (veniaDeModalSinSocios && shouldShowPrimerSocioSociosNavTour(natilleraId)) {
    nextTick(() => {
      setTimeout(() => {
        startPrimerSocioSociosNavTour({
          natilleraId,
          prepareSidebarForTour: dashboardSidebar?.prepareSidebarForTour,
          clearSidebarAfterTour: dashboardSidebar?.clearSidebarAfterTour,
          onSociosTourClosed: (nid) => {
            setPendingCuotasDetalleTour(nid)
            // Navegar a Cuotas: el tour guiado continúa en el detalle del mes.
            router.push(`/natilleras/${nid}/cuotas`)
          }
        })
      }, 900)
    })
    return
  }

  if (!shouldShowNatilleraMenuTour(natilleraId)) return
  if (!dashboardSidebar?.openMobile || !dashboardSidebar?.closeMobile) return
  nextTick(() => {
    setTimeout(() => {
      startNatilleraMenuTour({
        natilleraId,
        openSidebar: () => dashboardSidebar.openMobile(),
        closeSidebar: () => dashboardSidebar.closeMobile()
      })
    }, 850)
  })
}

async function handleGuardarSocio() {
  errorSocio.value = ''
  errorTelefonoDuplicado.value = false
  guardando.value = true

  try {
    // Validar que el teléfono esté presente y no esté vacío
    if (!formSocio.telefono || formSocio.telefono.trim() === '') {
      errorSocio.value = 'El número de teléfono es obligatorio'
      guardando.value = false
      return
    }

    // Limpiar el teléfono y quitar el indicativo de país
    const telefonoLimpio = limpiarNumeroTelefono(formSocio.telefono)

    if (socioEditando.value) {
      // Detectar si cambió la periodicidad
      const periodicidadAnterior = socioEditando.value.periodicidad || 'mensual'
      const periodicidadNueva = formSocio.periodicidad || 'mensual'
      const cambioPeriodicidad = periodicidadAnterior !== periodicidadNueva

      // Si cambió la periodicidad, necesitamos eliminar y regenerar cuotas
      if (cambioPeriodicidad) {
        // IMPORTANTE: Guardar TODOS los datos necesarios ANTES de cerrar el modal
        // porque cerrarModal() resetea el formulario
        const socioNatilleraId = socioEditando.value.id
        const socioId = socioEditando.value.socio?.id || null
        
        // Guardar todos los valores del formulario antes de que se reseteen
        const nombreGuardado = formSocio.nombre || socioEditando.value.socio?.nombre || ''
        const telefonoGuardado = telefonoLimpio || socioEditando.value.socio?.telefono || ''
        const emailGuardado = formSocio.email || socioEditando.value.socio?.email || null
        const documentoGuardado = formSocio.documento || socioEditando.value.socio?.documento || null
        const avatarSeedGuardado = formSocio.avatar_seed || socioEditando.value.socio?.avatar_seed || null
        
        // IMPORTANTE: Guardar el valor de cuota - usar el del formulario si es válido, sino el anterior
        let valorCuotaGuardado = typeof formSocio.valor_cuota === 'string' 
          ? parseFloat(formSocio.valor_cuota.replace(/\./g, '').replace(/[^\d.-]/g, '')) || 0
          : Number(formSocio.valor_cuota) || 0
        
        // Si el valor del formulario es 0 o inválido, usar el valor anterior del socio
        if (valorCuotaGuardado <= 0 || isNaN(valorCuotaGuardado)) {
          valorCuotaGuardado = socioEditando.value.valor_cuota_individual || 0
        }
        
        // Cerrar el modal de edición primero
        cerrarModal()
        
        // Iniciar el modal de progreso
        progresoCreacion.value = {
          paso: 1,
          mensaje: 'Actualizando periodicidad...',
          cuotasGeneradas: 0,
          cuotasTotales: 0,
          error: null,
          exito: false,
          nombreSocio: nombreGuardado
        }
        modalProgreso.value = true

        try {
          // Paso 1: Actualizar datos del socio (sin periodicidad aún)
          // IMPORTANTE: Usar los valores guardados antes de cerrar el modal
          const datosActualizados = {
            nombre: nombreGuardado,
            telefono: telefonoGuardado
          }
          
          // Solo incluir email si tiene valor (usar valor guardado)
          if (emailGuardado && emailGuardado.trim() !== '') {
            datosActualizados.email = emailGuardado.trim()
          }
          
          // Solo incluir documento si tiene valor (no puede ser null por constraint de BD)
          if (documentoGuardado && documentoGuardado.trim() !== '') {
            datosActualizados.documento = documentoGuardado.trim()
          }
          
          if (avatarSeedGuardado) {
            datosActualizados.avatar_seed = avatarSeedGuardado
          }

          // OPTIMIZACIÓN: Verificar unicidad del teléfono y actualizar datos en paralelo si es posible
          // (Solo si hay datos para actualizar)
          if (socioId && Object.keys(datosActualizados).length > 2) { // Más que solo nombre y telefono
            const [telefonoExiste, resultDatos] = await Promise.all([
              sociosStore.verificarTelefonoUnico(telefonoLimpio, id, socioId),
              sociosStore.actualizarDatosSocio(socioId, datosActualizados, id)
            ])
            
            if (!telefonoExiste) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
              guardando.value = false
              return
            }
            
            if (!resultDatos.success) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = resultDatos.error || 'Error al actualizar los datos del socio'
              guardando.value = false
              return
            }
          } else if (socioId) {
            // Si solo hay nombre y teléfono, verificar teléfono primero
            const telefonoExiste = await sociosStore.verificarTelefonoUnico(telefonoLimpio, id, socioId)
            if (!telefonoExiste) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
              guardando.value = false
              return
            }
            
            const resultDatos = await sociosStore.actualizarDatosSocio(socioId, datosActualizados, id)
            if (!resultDatos.success) {
              progresoCreacion.value.paso = 0
              progresoCreacion.value.error = resultDatos.error || 'Error al actualizar los datos del socio'
              guardando.value = false
              return
            }
          }

          // Paso 2: Eliminar todas las cuotas del socio
          progresoCreacion.value.paso = 2
          progresoCreacion.value.mensaje = 'Eliminando cuotas anteriores...'

          const resultEliminar = await cuotasStore.eliminarTodasLasCuotasSocio(socioNatilleraId)
          
          if (!resultEliminar.success) {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = resultEliminar.error || 'Error al eliminar las cuotas anteriores'
            guardando.value = false
            return
          }

          // Paso 3: Actualizar periodicidad y valor de cuota
          progresoCreacion.value.mensaje = 'Actualizando configuración...'
          
          // IMPORTANTE: Usar el valor de cuota guardado antes de cerrar el modal
          const valorCuotaFinal = valorCuotaGuardado
          
          // Validar que el valor final sea válido
          if (valorCuotaFinal <= 0 || isNaN(valorCuotaFinal)) {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = 'El valor de la cuota debe ser mayor a cero'
            guardando.value = false
            return
          }

          const result = await sociosStore.actualizarSocioNatillera(socioNatilleraId, {
            valor_cuota_individual: valorCuotaFinal,
            periodicidad: periodicidadNueva
          })

          if (!result.success) {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = result.error || 'Error al actualizar la periodicidad'
            guardando.value = false
            return
          }

          // Paso 4: Generar nuevas cuotas
          progresoCreacion.value.paso = 2
          progresoCreacion.value.mensaje = 'Generando cuotas con nueva periodicidad...'
          
          const natillera = natillerasStore.natilleraActual
          const resultCuotas = await generarCuotasParaSocio(
            id,
            socioNatilleraId,
            natillera,
            valorCuotaFinal,
            periodicidadNueva
          )

          if (resultCuotas.success) {
            progresoCreacion.value.cuotasGeneradas = resultCuotas.cuotasGeneradas
            progresoCreacion.value.paso = 3
            progresoCreacion.value.exito = true
            progresoCreacion.value.mensaje = '¡Periodicidad actualizada exitosamente!'
            
            // OPTIMIZACIÓN: Recargar cuotas y actualizar socio en paralelo
            await Promise.all([
              cuotasStore.fetchCuotasNatillera(id),
              sociosStore.fetchSociosNatillera(id)
            ])
            
            // Actualizar el socioSeleccionado si está abierto el modal de detalle
            if (modalDetalle.value && socioSeleccionado.value?.id === socioNatilleraId) {
              const socioActualizado = sociosStore.sociosNatillera.find(s => s.id === socioNatilleraId)
              if (socioActualizado) {
                socioSeleccionado.value = socioActualizado
              }
            }
            
            // Cerrar modal después de 1.5 segundos (reducido de 2)
            setTimeout(() => {
              cerrarModalProgreso()
            }, 1500)
          } else {
            progresoCreacion.value.paso = 0
            progresoCreacion.value.error = resultCuotas.error || 'Error al generar las nuevas cuotas'
          }
        } catch (error) {
          progresoCreacion.value.paso = 0
          progresoCreacion.value.error = error.message || 'Error inesperado al cambiar la periodicidad'
        } finally {
          guardando.value = false
        }
        return
      }

      // Si no cambió la periodicidad, actualizar normalmente
      // Actualizar cuota del socio en socios_natillera
      const result = await sociosStore.actualizarSocioNatillera(socioEditando.value.id, {
        valor_cuota_individual: formSocio.valor_cuota,
        periodicidad: formSocio.periodicidad
      })

      // Actualizar datos del socio en la tabla socios (nombre, teléfono, email, documento, avatar)
      if (socioEditando.value.socio?.id) {
        // Verificar unicidad del teléfono dentro de la natillera (excepto el propio socio)
        const telefonoExiste = await sociosStore.verificarTelefonoUnico(telefonoLimpio, id, socioEditando.value.socio.id)
        if (!telefonoExiste) {
          errorTelefonoDuplicado.value = true
          errorSocio.value = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
          guardando.value = false
          return
        }

        const datosActualizados = {
          nombre: formSocio.nombre,
          telefono: telefonoLimpio,
          email: formSocio.email || null,
          documento: formSocio.documento || null
        }
        
        // Solo incluir avatar_seed si se seleccionó uno
        if (formSocio.avatar_seed) {
          datosActualizados.avatar_seed = formSocio.avatar_seed
        }
        
        const resultDatos = await sociosStore.actualizarDatosSocio(socioEditando.value.socio.id, datosActualizados, id)
        
        if (!resultDatos.success) {
          if (resultDatos.error?.includes('unique') || resultDatos.error?.includes('duplicate')) {
            errorTelefonoDuplicado.value = true
            errorSocio.value = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
          } else {
            errorSocio.value = resultDatos.error || 'Error al actualizar los datos del socio'
          }
          guardando.value = false
          return
        }
      }

      if (result.success) {
        // Los stores ya actualizan localmente los datos, no es necesario recargar
        // Solo recargar cuotas si cambió el valor de cuota individual
        const cuotaCambio = socioEditando.value.valor_cuota_individual !== formSocio.valor_cuota
        if (cuotaCambio) {
          // Recargar cuotas solo si cambió el valor para actualizar las cuotas pendientes
          cuotasStore.fetchCuotasNatillera(id)
        }
        
        // Actualizar el socioSeleccionado si está abierto el modal de detalle
        if (modalDetalle.value && socioSeleccionado.value?.id === socioEditando.value.id) {
          const socioActualizado = sociosStore.sociosNatillera.find(s => s.id === socioEditando.value.id)
          if (socioActualizado) {
            socioSeleccionado.value = socioActualizado
          }
        }
        
        // Mostrar notificación de éxito
        notificationStore.success(
          `Los datos de ${formSocio.nombre} han sido actualizados correctamente`,
          'Cambios guardados',
          3000
        )
        
        cerrarModal()
      } else {
        errorSocio.value = result.error
      }
    } else {
      // Agregar nuevo socio - verificar unicidad del teléfono dentro de la natillera
      const telefonoExiste = await sociosStore.verificarTelefonoUnico(telefonoLimpio, id)
      if (!telefonoExiste) {
        errorTelefonoDuplicado.value = true
        errorSocio.value = 'Este número de teléfono ya está registrado para otro socio en esta natillera'
        guardando.value = false
        return
      }

      const eraListaSociosVacia = sociosStore.sociosNatillera.length === 0

      const datosSocio = {
        nombre: formSocio.nombre,
        documento: formSocio.documento,
        email: formSocio.email || null,
        telefono: telefonoLimpio,
        avatar_seed: formSocio.avatar_seed || null
      }

      // IMPORTANTE: Validar y procesar el valor de cuota y periodicidad ANTES de cerrar el modal
      // para no perder los valores del formulario
      const valorCuotaParaGuardar = typeof formSocio.valor_cuota === 'string' 
        ? parseFloat(formSocio.valor_cuota.replace(/\./g, '').replace(/[^\d.-]/g, '')) || 0
        : Number(formSocio.valor_cuota) || 0
      
      // IMPORTANTE: Capturar la periodicidad seleccionada ANTES de cerrar el modal
      const periodicidadParaGuardar = formSocio.periodicidad || 'mensual'
      
      console.log('🚀 ANTES de cerrar modal - valor_cuota (formSocio):', formSocio.valor_cuota, 'Tipo:', typeof formSocio.valor_cuota)
      console.log('🚀 ANTES de cerrar modal - periodicidad (formSocio):', formSocio.periodicidad)
      console.log('🚀 ANTES de cerrar modal - valorCuotaParaGuardar (procesado):', valorCuotaParaGuardar, 'Tipo:', typeof valorCuotaParaGuardar)
      console.log('🚀 ANTES de cerrar modal - periodicidadParaGuardar:', periodicidadParaGuardar)
      
      if (valorCuotaParaGuardar <= 0) {
        errorSocio.value = 'El valor de la cuota debe ser mayor a cero'
        guardando.value = false
        return
      }
      
      // Verificar si la natillera tiene cuotas automáticas activadas
      const natillera = natillerasStore.natilleraActual
      const cuotasAutomaticas = natillera?.cuotas_automaticas !== false

      // Si tiene cuotas automáticas, mostrar el modal de progreso
      if (cuotasAutomaticas) {
        // Guardar los valores antes de cerrar el modal para no perderlos
        const valorCuotaGuardado = valorCuotaParaGuardar
        const periodicidadGuardada = periodicidadParaGuardar
        
        cerrarModal() // Cerrar el modal de agregar socio
        
        // Restaurar los valores después de cerrar (el modal los resetea)
        formSocio.valor_cuota = valorCuotaGuardado
        formSocio.periodicidad = periodicidadGuardada
        
        // Iniciar el modal de progreso
        progresoCreacion.value = {
          paso: 1,
          mensaje: 'Creando socio...',
          cuotasGeneradas: 0,
          cuotasTotales: 0,
          error: null,
          exito: false,
          nombreSocio: formSocio.nombre
        }
        modalProgreso.value = true

        // Pequeña pausa para que el usuario vea el estado inicial
        await new Promise(resolve => setTimeout(resolve, 500))

        // Paso 1: Crear el socio
        // Usar los valores guardados antes de cerrar el modal
        const valorCuotaFinal = valorCuotaGuardado // Ya validado y guardado antes de cerrar modal
        const periodicidadFinal = periodicidadGuardada // Ya capturada antes de cerrar modal
        
        console.log('🚀 Creando socio (con cuotas automáticas) - Datos completos:')
        console.log('🚀 - Nombre:', datosSocio.nombre)
        console.log('🚀 - valorCuotaFinal a guardar:', valorCuotaFinal, 'Tipo:', typeof valorCuotaFinal)
        console.log('🚀 - periodicidadFinal a guardar:', periodicidadFinal)
        console.log('🚀 - periodicidad en formSocio (después de restaurar):', formSocio.periodicidad)
        
        const result = await sociosStore.agregarSocio(
          id,
          datosSocio,
          valorCuotaFinal, // Usar el valor ya procesado y validado
          periodicidadFinal // Usar la periodicidad capturada antes de cerrar modal
        )

        if (!result.success) {
          progresoCreacion.value.paso = 0
          progresoCreacion.value.error = result.error
          progresoCreacion.value.mensaje = 'Error al crear el socio'
          guardando.value = false
          return
        }

        // Paso 2: Generar cuotas automáticas
        progresoCreacion.value.paso = 2
        progresoCreacion.value.mensaje = 'Generando cuotas del período...'
        
        await new Promise(resolve => setTimeout(resolve, 300))

        const socioNatilleraId = result.data.id
        console.log('🆔 Socio creado con éxito:', {
          socioNatilleraId,
          resultData: result.data,
          valorCuotaFinal: valorCuotaFinal,
          valorCuotaEnBD: result.data?.valor_cuota_individual,
          periodicidadFinal: periodicidadFinal,
          periodicidadEnBD: result.data?.periodicidad
        })
        
        // Verificar que la periodicidad se guardó correctamente
        if (result.data?.periodicidad !== periodicidadFinal) {
          console.error('⚠️ ADVERTENCIA: La periodicidad guardada difiere de la seleccionada!')
          console.error('⚠️ Periodicidad seleccionada:', periodicidadFinal)
          console.error('⚠️ Periodicidad guardada en BD:', result.data?.periodicidad)
        }
        
        // Usar el mismo valor procesado que se guardó en el socio
        const resultCuotas = await generarCuotasParaSocio(
          id, 
          socioNatilleraId, 
          natillera, 
          valorCuotaFinal, // Usar el mismo valor procesado
          periodicidadFinal // Usar la periodicidad capturada
        )

        if (resultCuotas.success) {
          progresoCreacion.value.cuotasGeneradas = resultCuotas.cuotasGeneradas
          progresoCreacion.value.cuotasTotales = resultCuotas.cuotasGeneradas
          progresoCreacion.value.paso = 3
          progresoCreacion.value.mensaje = '¡Socio creado exitosamente!'
          progresoCreacion.value.exito = true
        } else {
          // Si hubo error en las cuotas pero el socio se creó, mostrar mensaje parcial
          progresoCreacion.value.paso = 3
          progresoCreacion.value.mensaje = 'Socio creado. Algunas cuotas no se generaron.'
          progresoCreacion.value.error = resultCuotas.error
          progresoCreacion.value.exito = true // El socio sí se creó
        }

        // Esperar 2.5 segundos y cerrar automáticamente
        await new Promise(resolve => setTimeout(resolve, 2500))
        cerrarModalProgreso()
        if (eraListaSociosVacia && socioNatilleraId) {
          setPrimerFlujoSocioNatilleraId(id, socioNatilleraId)
        }
        programarTourMenuNatilleraSiCorresponde(eraListaSociosVacia, id)

      } else {
        // Sin cuotas automáticas, crear socio normalmente
        // Usar los valores ya procesados y validados arriba
        const valorCuotaFinal = valorCuotaParaGuardar // Ya validado arriba
        const periodicidadFinal = periodicidadParaGuardar // Ya capturada arriba
        
        console.log('🚀 Creando socio (sin cuotas automáticas) - Datos completos:')
        console.log('🚀 - Nombre:', datosSocio.nombre)
        console.log('🚀 - valorCuotaFinal a guardar:', valorCuotaFinal, 'Tipo:', typeof valorCuotaFinal)
        console.log('🚀 - periodicidadFinal a guardar:', periodicidadFinal)
        console.log('🚀 - periodicidad en formSocio:', formSocio.periodicidad)
        
        const result = await sociosStore.agregarSocio(
          id,
          datosSocio,
          valorCuotaFinal, // Usar el valor ya procesado y validado
          periodicidadFinal // Usar la periodicidad capturada
        )

        if (result.success) {
          notificationStore.success(
            `${formSocio.nombre} ha sido agregado a la natillera`,
            'Socio agregado',
            3000
          )
          cerrarModal()
          if (eraListaSociosVacia && result.data?.id) {
            setPrimerFlujoSocioNatilleraId(id, result.data.id)
          }
          programarTourMenuNatilleraSiCorresponde(eraListaSociosVacia, id)
        } else {
          if (result.error?.includes('unique') || result.error?.includes('duplicate') || result.error?.includes('teléfono')) {
            errorTelefonoDuplicado.value = true
            errorSocio.value = 'Este número de teléfono ya está registrado para otro socio'
          } else {
            errorSocio.value = result.error
          }
        }
      }
    }
  } finally {
    guardando.value = false
  }
}

// Función OPTIMIZADA para generar cuotas automáticas para un socio nuevo
// Usa batch insert para generar todas las cuotas en una sola operación
async function generarCuotasParaSocio(natilleraId, socioNatilleraId, natillera, valorCuota, periodicidad) {
  try {
    console.log('🚀 Iniciando generación optimizada de cuotas...')
    console.log('📋 Datos para generación:', {
      natilleraId,
      socioNatilleraId,
      valorCuota,
      periodicidad,
      natilleraDisponible: !!natillera,
      natilleraNombre: natillera?.nombre,
      natilleraMesInicio: natillera?.mes_inicio,
      natilleraMesFin: natillera?.mes_fin,
      natilleraAnio: natillera?.anio,
      natilleraAnioInicio: natillera?.anio_inicio
    })
    
    // Usar la nueva función batch que es ~10x más rápida
    const result = await cuotasStore.generarCuotasBatchParaSocio(
      natilleraId,
      socioNatilleraId,
      valorCuota,
      periodicidad,
      natillera
    )
    
    console.log('📊 Resultado de generación:', result)
    
    if (result.success) {
      progresoCreacion.value.cuotasGeneradas = result.cuotasGeneradas
      console.log(`✅ Cuotas generadas exitosamente en ${result.tiempoMs?.toFixed(0) || 0}ms`)
    } else {
      console.error('❌ Error en generación:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('❌ Error generando cuotas automáticas:', error)
    return { success: false, error: error.message, cuotasGeneradas: 0 }
  }
}

function cerrarModalProgreso() {
  modalProgreso.value = false
  progresoCreacion.value = {
    paso: 0,
    mensaje: '',
    cuotasGeneradas: 0,
    cuotasTotales: 0,
    error: null,
    exito: false,
    nombreSocio: ''
  }
}

// Totales para modal desactivar: valor recaudado = total ahorrado (base para %)
const valorEntregarDesactivar = computed(() => {
  const rec = totalesDesactivar.value.valorRecaudado || 0
  const pct = desactivarSancionar.value ? Math.min(100, Math.max(0, desactivarPorcentajeSancion.value)) : 0
  return rec * (1 - pct / 100)
})
const valorFondoDesactivar = computed(() => {
  const rec = totalesDesactivar.value.valorRecaudado || 0
  const pct = desactivarSancionar.value ? Math.min(100, Math.max(0, desactivarPorcentajeSancion.value)) : 0
  return rec * (pct / 100)
})

async function cargarTotalesDesactivar(socioNatilleraId) {
  if (!socioNatilleraId || !id) return
  loadingTotalesDesactivar.value = true
  totalesDesactivar.value = { totalAhorrado: 0, totalActividades: 0, totalSancionesPagadas: 0, valorRecaudado: 0 }
  try {
    const [
      { data: cuotas },
      { data: sociosActividad }
    ] = await Promise.all([
      supabase.from('cuotas').select('estado, valor_pagado, valor_multa').eq('socio_natillera_id', socioNatilleraId),
      supabase.from('socios_actividad').select('valor_pagado').eq('socio_natillera_id', socioNatilleraId)
    ])
    const pagadas = (cuotas || []).filter(c => c.estado === 'pagada')
    const totalAhorrado = pagadas.reduce((sum, c) => sum + (parseFloat(c.valor_pagado || 0) - parseFloat(c.valor_multa || 0)), 0)
    const totalSancionesPagadas = pagadas.reduce((sum, c) => sum + parseFloat(c.valor_multa || 0), 0)
    const totalActividades = (sociosActividad || []).reduce((sum, sa) => sum + parseFloat(sa.valor_pagado || 0), 0)
    const valorRecaudado = totalAhorrado
    totalesDesactivar.value = { totalAhorrado, totalActividades, totalSancionesPagadas, valorRecaudado }
  } catch (e) {
    console.error('Error cargando totales para desactivar:', e)
    totalesDesactivar.value = { totalAhorrado: 0, totalActividades: 0, totalSancionesPagadas: 0, valorRecaudado: 0 }
  } finally {
    loadingTotalesDesactivar.value = false
  }
}

function abrirModalDesactivar(sn) {
  if (sn.estado !== 'activo') return
  socioADesactivar.value = sn
  desactivarSancionar.value = false
  desactivarPorcentajeSancion.value = 0
  desactivarFormaPago.value = 'efectivo'
  cargarTotalesDesactivar(sn.id)
}

function cerrarModalDesactivar() {
  socioADesactivar.value = null
  desactivarSancionar.value = false
  desactivarPorcentajeSancion.value = 0
  desactivarFormaPago.value = 'efectivo'
}

function abrirModalActivar(sn) {
  if (sn.estado !== 'inactivo') return
  socioAActivar.value = sn
}

function cerrarModalActivar() {
  socioAActivar.value = null
}

async function confirmarActivarSocio() {
  const sn = socioAActivar.value
  if (!sn || !id) return
  const natilleraId = id
  const nombreSocio = sn.socio?.nombre || 'Socio'
  activando.value = true
  try {
    // Si existe comprobante de salida, revertir los movimientos que se hicieron al desactivar
    const { data: comprobante, error: errComp } = await supabase
      .from('comprobantes_salida')
      .select('socio_nombre, valor_entregar, valor_sancion')
      .eq('socio_natillera_id', sn.id)
      .maybeSingle()

    if (!errComp && comprobante) {
      const valorEntregar = parseFloat(comprobante.valor_entregar) || 0
      const valorSancion = parseFloat(comprobante.valor_sancion) || 0
      const totalSalida = valorEntregar + valorSancion
      const socioNombre = comprobante.socio_nombre || nombreSocio

      if (totalSalida > 0) {
        // Buscar el movimiento de salida para obtener forma_pago (mismo que se usó al desactivar)
        const descripcionSalida = `Liquidación por salida - ${socioNombre}`
        const { data: movs, error: errMovs } = await supabase
          .from('movimientos_fondo')
          .select('id, forma_pago, monto')
          .eq('natillera_id', natilleraId)
          .eq('tipo', 'salida')
          .eq('descripcion', descripcionSalida)
          .eq('monto', totalSalida)
          .order('created_at', { ascending: false })
          .limit(1)

        const formaPago = (movs?.[0]?.forma_pago || 'efectivo').toLowerCase().trim()
        const formaPagoNorm = formaPago === 'transferencia' ? 'transferencia' : 'efectivo'

        // Reversar: entrada por el mismo monto (restaura el fondo)
        const { error: errEntrada } = await supabase.from('movimientos_fondo').insert({
          natillera_id: natilleraId,
          tipo: 'entrada',
          monto: totalSalida,
          forma_pago: formaPagoNorm,
          descripcion: `Reversión reactivación - ${socioNombre}`,
          fecha: new Date().toISOString().split('T')[0]
        })
        if (errEntrada) throw errEntrada
      }

      // Revertir sanción por retiro en utilidades (si hubo sanción)
      if (valorSancion > 0) {
        const { data: utilList } = await supabase
          .from('utilidades_clasificadas')
          .select('id, forma_pago')
          .eq('natillera_id', natilleraId)
          .eq('tipo', 'sanciones')
          .eq('descripcion', `Sanción por retiro: ${socioNombre}`)
          .is('fecha_cierre', null)
          .order('created_at', { ascending: false })
          .limit(1)

        const utilExist = utilList?.[0]
        if (utilExist?.id) {
          const formaPagoUtil = (utilExist.forma_pago || 'efectivo').toLowerCase().trim()
          const formaPagoUtilNorm = formaPagoUtil === 'transferencia' ? 'transferencia' : 'efectivo'
          const { error: errUtil } = await supabase.from('utilidades_clasificadas').insert({
            natillera_id: natilleraId,
            tipo: 'sanciones',
            monto: -valorSancion,
            forma_pago: formaPagoUtilNorm,
            descripcion: `Reversión reactivación - Sanción por retiro: ${socioNombre}`
          })
          if (errUtil) throw errUtil
        }
      }

      // Eliminar comprobante de salida (el socio vuelve a estar activo, ya no aplica el comprobante)
      await supabase.from('comprobantes_salida').delete().eq('socio_natillera_id', sn.id)
      delete comprobantesSalidaGuardados.value[sn.id]
    }

    const resultado = await sociosStore.cambiarEstadoSocio(sn.id, 'activo')
    if (resultado.success) {
      cerrarModalActivar()
      if (modalDetalle.value && socioSeleccionado.value?.id === sn.id) {
        modalDetalle.value = false
        socioSeleccionado.value = null
      }
      notificationStore.success(
        `${nombreSocio} ha sido activado`,
        'Socio activado',
        2500
      )
    } else {
      notificationStore.error(resultado.error || 'No se pudo activar', 'Error')
    }
  } catch (e) {
    console.error('Error al activar socio:', e)
    notificationStore.error(e?.message || 'Error al activar socio', 'Error')
  } finally {
    activando.value = false
  }
}

function generarCodigoComprobanteSalida() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = 'SAL-'
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

function cerrarComprobanteDesactivacion() {
  comprobanteDesactivacion.value = null
}

async function descargarComprobanteDesactivacion() {
  if (!comprobanteDesactivacionRef.value) return
  generandoImagenDesactivacion.value = true
  try {
    const dataUrl = await toPng(comprobanteDesactivacionRef.value, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#fffbeb'
    })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `comprobante-salida-${(comprobanteDesactivacion.value?.socioNombre || 'socio').replace(/\s+/g, '-')}-${Date.now()}.png`
    link.click()
  } catch (e) {
    console.error('Error descargando comprobante:', e)
    notificationStore.error('No se pudo generar la imagen', 'Error')
  } finally {
    generandoImagenDesactivacion.value = false
  }
}

async function compartirWhatsAppDesactivacion() {
  if (!comprobanteDesactivacion.value || !comprobanteDesactivacionRef.value) return
  generandoImagenDesactivacion.value = true
  try {
    const dataUrl = await toPng(comprobanteDesactivacionRef.value, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#fffbeb'
    })
    const nombreArchivo = `comprobante-salida-${(comprobanteDesactivacion.value.socioNombre || 'socio').replace(/\s+/g, '-')}-${Date.now()}.png`
    const blob = await fetch(dataUrl).then(r => r.blob())
    const file = new File([blob], nombreArchivo, { type: 'image/png' })
    const tel = comprobanteDesactivacion.value.socioTelefono?.replace(/\D/g, '') || ''
    if (tel && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Comprobante de salida',
        text: `Liquidación por salida de la natillera - ${comprobanteDesactivacion.value.socioNombre}`,
        files: [file]
      })
    } else if (tel) {
      const url = `https://wa.me/57${tel}?text=${encodeURIComponent('Comprobante de salida de la natillera - Natillerapp')}`
      window.open(url, '_blank')
    }
  } catch (e) {
    console.error('Error compartiendo comprobante:', e)
    notificationStore.error('No se pudo compartir', 'Error')
  } finally {
    generandoImagenDesactivacion.value = false
  }
}

async function confirmarDesactivarSocio() {
  const sn = socioADesactivar.value
  if (!sn || !id) return
  desactivando.value = true
  const natilleraId = id
  const tot = totalesDesactivar.value
  const valorEntregar = valorEntregarDesactivar.value
  const valorFondo = valorFondoDesactivar.value
  const formaPago = (desactivarFormaPago.value || 'efectivo').toLowerCase().trim()
  const formaPagoNorm = formaPago === 'transferencia' ? 'transferencia' : 'efectivo'
  const nombreSocio = sn.socio?.nombre || 'Socio'
  try {
    // Sanción por retiro → utilidades (con forma de pago para cuadre)
    if (desactivarSancionar.value && desactivarPorcentajeSancion.value > 0 && valorFondo > 0) {
      const insertUtilidad = {
        natillera_id: natilleraId,
        tipo: 'sanciones',
        monto: valorFondo,
        forma_pago: formaPagoNorm,
        descripcion: `Sanción por retiro: ${nombreSocio}`
      }
      const { error } = await supabase.from('utilidades_clasificadas').insert(insertUtilidad)
      if (error) throw error
    }
    // Salida en movimientos_fondo: total entregado al socio + sanción (se descuenta de efectivo o transferencia)
    const totalSalida = valorEntregar + valorFondo
    if (totalSalida > 0) {
      const descripcionSalida = `Liquidación por salida - ${nombreSocio}`
      const { error: errMov } = await supabase.from('movimientos_fondo').insert({
        natillera_id: natilleraId,
        tipo: 'salida',
        monto: totalSalida,
        forma_pago: formaPagoNorm,
        descripcion: descripcionSalida,
        fecha: new Date().toISOString().split('T')[0]
      })
      if (errMov) throw errMov
    }
    const resultado = await sociosStore.cambiarEstadoSocio(sn.id, 'inactivo')
    if (resultado.success) {
      if (modalDetalle.value && socioSeleccionado.value?.id === sn.id) {
        modalDetalle.value = false
        socioSeleccionado.value = null
      }
      const codigoComprobante = generarCodigoComprobanteSalida()
      const fechaComprobante = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      const datosComprobante = {
        socioNombre: sn.socio?.nombre || 'Socio',
        socioTelefono: sn.socio?.telefono || null,
        fecha: fechaComprobante,
        totalAhorrado: tot.totalAhorrado || 0,
        totalActividades: tot.totalActividades || 0,
        totalSancionesPagadas: tot.totalSancionesPagadas || 0,
        valorEntregar,
        valorFondo,
        codigoComprobante
      }
      const { error: errComprobante } = await supabase.from('comprobantes_salida').upsert({
        socio_natillera_id: sn.id,
        socio_nombre: datosComprobante.socioNombre,
        socio_telefono: datosComprobante.socioTelefono || null,
        fecha: fechaComprobante,
        total_ahorrado: datosComprobante.totalAhorrado,
        valor_sancion: datosComprobante.valorFondo,
        valor_entregar: datosComprobante.valorEntregar,
        codigo_comprobante: codigoComprobante
      }, { onConflict: 'socio_natillera_id' })
      if (errComprobante) console.error('Error guardando comprobante de salida:', errComprobante)
      comprobanteDesactivacion.value = datosComprobante
      comprobantesSalidaGuardados.value[sn.id] = { ...datosComprobante }
      cerrarModalDesactivar()
      await nextTick()
      notificationStore.warning(
        `${sn.socio?.nombre || 'El socio'} ha sido desactivado`,
        'Socio desactivado',
        2500
      )
    } else {
      notificationStore.error(resultado.error || 'No se pudo desactivar', 'Error')
    }
  } catch (e) {
    console.error('Error al desactivar socio:', e)
    notificationStore.error(e?.message || 'Error al desactivar socio', 'Error')
  } finally {
    desactivando.value = false
  }
}

async function toggleEstado(sn) {
  const nuevoEstado = sn.estado === 'activo' ? 'inactivo' : 'activo'
  const resultado = await sociosStore.cambiarEstadoSocio(sn.id, nuevoEstado)
  
  if (resultado.success) {
    const nombreSocio = sn.socio?.nombre || 'El socio'
    if (nuevoEstado === 'activo') {
      notificationStore.success(
        `${nombreSocio} ha sido activado`,
        'Socio activado',
        2500
      )
    } else {
      notificationStore.warning(
        `${nombreSocio} ha sido desactivado`,
        'Socio desactivado',
        2500
      )
    }
  }
}

function confirmarEliminarSocio(socioNatillera) {
  socioAEliminar.value = socioNatillera
}

async function eliminarSocioConfirmado() {
  if (!socioAEliminar.value) return

  eliminando.value = true
  const socioId = socioAEliminar.value.id
  const nombreSocio = socioAEliminar.value.socio?.nombre || 'El socio'
  
  try {
    const resultado = await sociosStore.eliminarSocioNatillera(socioId)
    
    if (resultado.success) {
      // Cerrar modal de detalle si estaba abierto para este socio
      if (modalDetalle.value && socioSeleccionado.value?.id === socioId) {
        modalDetalle.value = false
        socioSeleccionado.value = null
      }
      socioAEliminar.value = null
      // El store ya elimina el socio localmente, no es necesario recargar
      
      // Mostrar notificación de éxito
      notificationStore.success(
        `${nombreSocio} ha sido eliminado de la natillera`,
        'Socio eliminado',
        3000
      )
    } else {
      notificationStore.error(
        resultado.error || 'No se pudo eliminar el socio',
        'Error al eliminar'
      )
    }
  } finally {
    eliminando.value = false
  }
}

// Función para obtener el nombre del mes
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

// Función para verificar si una cuota tiene una anotación de ajuste
function tieneAjuste(cuotaData) {
  if (!cuotaData.descripcion) return false
  return cuotaData.descripcion.includes('Ajuste de valor') || cuotaData.descripcion.includes('Cuota ajustada')
}

// Función para obtener el texto de ajuste de una cuota
function getTextoAjuste(cuotaData) {
  if (!tieneAjuste(cuotaData)) return null
  // Extraer todas las anotaciones de ajuste de la descripción
  const descripcion = cuotaData.descripcion
  if (!descripcion) return null
  
  // Separar por | para obtener todas las anotaciones
  const partes = descripcion.split('|').map(p => p.trim())
  
  // Filtrar solo las partes que son anotaciones de ajuste
  const anotaciones = partes.filter(parte => 
    parte.includes('Ajuste de valor') || parte.includes('Cuota ajustada')
  )
  
  // Si hay múltiples anotaciones, mostrarlas todas separadas por saltos de línea
  if (anotaciones.length > 0) {
    return anotaciones.join('\n\n')
  }
  
  // Si no se encontraron anotaciones específicas, devolver la descripción completa
  return descripcion
}

function getMesLabel(mes) {
  const mesObj = meses.find(m => m.value === mes)
  return mesObj ? mesObj.label : `Mes ${mes}`
}

/** Cuotas con estado pagada para el modal de detalle: etiqueta tipo "1.ª de Marzo 2026", valor y fecha (orden reciente primero). */
const cuotasPagadasDetalleSocio = computed(() => {
  const list = (cuotasSocio.value || []).filter((c) => c.estado === 'pagada')
  const items = list.map((c) => {
    let mes = c.mes
    let anio = c.anio
    if (c.fecha_limite && typeof c.fecha_limite === 'string' && c.fecha_limite.includes('-')) {
      const [y, m] = c.fecha_limite.split('-').map(Number)
      if (anio == null) anio = y
      if (mes == null) mes = m
    }
    const nombreMes = mes != null ? getMesLabel(mes) : null
    let cuotaLabel = 'Cuota'
    if (c.quincena === 1 && nombreMes != null && anio != null) {
      cuotaLabel = `1.ª de ${nombreMes} ${anio}`
    } else if (c.quincena === 2 && nombreMes != null && anio != null) {
      cuotaLabel = `2.ª de ${nombreMes} ${anio}`
    } else if (nombreMes != null && anio != null) {
      cuotaLabel = `${nombreMes} ${anio}`
    } else if (anio != null) {
      cuotaLabel = c.quincena === 1 ? `1.ª quincena ${anio}` : c.quincena === 2 ? `2.ª quincena ${anio}` : `${anio}`
    } else if (c.quincena === 1) {
      cuotaLabel = '1.ª quincena'
    } else if (c.quincena === 2) {
      cuotaLabel = '2.ª quincena'
    }

    const fechaPagoMs = c.fecha_pago ? new Date(c.fecha_pago).getTime() : 0
    let fechaLimiteMs = 0
    if (c.fecha_limite) {
      fechaLimiteMs = new Date(c.fecha_limite).getTime()
    }

    return {
      id: c.id,
      cuotaLabel,
      fechaPago: c.fecha_pago,
      valorPagado: c.valor_pagado || 0,
      fechaPagoMs,
      fechaLimiteMs
    }
  })
  return items.sort(
    (a, b) =>
      (b.fechaPagoMs || b.fechaLimiteMs) - (a.fechaPagoMs || a.fechaLimiteMs)
  )
})

const totalValorCuotasPagadasDetalleSocio = computed(() =>
  cuotasPagadasDetalleSocio.value.reduce((s, i) => s + (i.valorPagado || 0), 0)
)

// Función para obtener el emoji del mes
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

function formatDate(date) {
  if (!date) return 'No registrada'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Función para calcular el estado real de una cuota basándose en la fecha actual y días de gracia
// REGLA DEFINITIVA:
// - Programada: fecha_actual < fecha_limite
// - Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento (fecha_limite + dias_gracia)
// - En mora: fecha_actual > fecha_vencimiento
// Función para calcular el estado real de una cuota basándose en la fecha actual
// Reglas según REGLAS.md:
// - Programada: fecha_actual < fecha_limite
// - Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
// - En Mora: fecha_actual > fecha_vencimiento
// - Pagada: valor_pagado >= valor_cuota
function calcularEstadoRealCuota(cuota, diasGracia) {
  const valorCuota = cuota.valor_cuota || 0
  const valorPagado = cuota.valor_pagado || 0
  
  // Pagada: valor_pagado >= valor_cuota (según REGLAS.md, sin incluir sanción)
  if (valorPagado >= valorCuota) {
    return 'pagada'
  }
  
  if (!cuota.fecha_limite) return cuota.estado || 'programada'
  
  const fechaActual = new Date()
  fechaActual.setHours(0, 0, 0, 0)
  
  // Parsear fecha_limite correctamente para evitar problemas de zona horaria
  let fechaLimite
  if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
    const [anio, mes, dia] = cuota.fecha_limite.split('-').map(Number)
    fechaLimite = new Date(anio, mes - 1, dia)
  } else {
    fechaLimite = new Date(cuota.fecha_limite)
  }
  fechaLimite.setHours(0, 0, 0, 0)
  
  // Obtener fecha_vencimiento: usar el campo directamente si existe, o calcularlo
  let fechaVencimiento
  if (cuota.fecha_vencimiento) {
    // Usar fecha_vencimiento directamente si existe en la cuota
    if (typeof cuota.fecha_vencimiento === 'string' && cuota.fecha_vencimiento.includes('-')) {
      const [anio, mes, dia] = cuota.fecha_vencimiento.split('-').map(Number)
      fechaVencimiento = new Date(anio, mes - 1, dia)
    } else {
      fechaVencimiento = new Date(cuota.fecha_vencimiento)
    }
  } else {
    // Si no existe, calcularla como fecha_limite + dias_gracia (fallback)
    fechaVencimiento = new Date(fechaLimite)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
  }
  fechaVencimiento.setHours(0, 0, 0, 0)
  
  // Programada: fecha_actual < fecha_limite
  if (fechaActual < fechaLimite) {
    return 'programada'
  }
  
  // Pendiente: fecha_limite <= fecha_actual <= fecha_vencimiento
  if (fechaActual >= fechaLimite && fechaActual <= fechaVencimiento) {
    return 'pendiente'
  }
  
  // En Mora: fecha_actual > fecha_vencimiento
  if (fechaActual > fechaVencimiento) {
    return 'mora'
  }
  
  // Por defecto, mantener el estado original
  return cuota.estado || 'programada'
}

// Función auxiliar para verificar si una cuota tiene pago parcial (para mostrar badge adicional)
function tienePagoParcial(cuota) {
  const sancion = cuota.valor_multa || 0
  const totalAPagar = (cuota.valor_cuota || 0) + sancion
  const valorPagado = cuota.valor_pagado || 0
  return valorPagado > 0 && valorPagado < totalAPagar
}

function totalObligacionCuotaSocioModal(c) {
  return (c.valorCuota || 0) + (c.sancion || 0)
}

function etiquetaMesAnioCuotaSocioModal(c) {
  if (c.mes == null) {
    return c.anio != null ? String(c.anio) : '—'
  }
  const anio = c.anio != null ? c.anio : ''
  return `${getMesLabel(c.mes)}${anio !== '' ? ` ${anio}` : ''}`.trim()
}

function handleClickFilaCuotaSocioModal(c) {
  if (esVisor.value) return
  if (c.mes == null) return
  navegarACuotasMes(c.mes)
}

function etiquetaPeriodoCuotaSocioModal(c) {
  if (c.quincena === 1) return '1.ª Q'
  if (c.quincena === 2) return '2.ª Q'
  return 'Mes'
}

function getMontoValorCuotaSocioModal(c) {
  const total = totalObligacionCuotaSocioModal(c)
  const pagado = c.valorPagado || 0
  if (pagado >= total) return pagado
  if (pagado > 0 && pagado < total) return total - pagado
  return total
}

function subetiquetaValorCuotaSocioModal(c) {
  const total = totalObligacionCuotaSocioModal(c)
  const pagado = c.valorPagado || 0
  if (pagado >= total) return 'Liquidado'
  if (pagado > 0 && pagado < total) return `Pagado $${formatMoney(pagado)}`
  return 'Pendiente de pago'
}

function etiquetaEstadoCuotaSocioModal(c) {
  const total = totalObligacionCuotaSocioModal(c)
  const pagado = c.valorPagado || 0
  if (pagado > 0 && pagado < total) return 'Parcial'
  if (c.estado === 'pagada' || pagado >= total) return 'Pagada'
  if (c.estado === 'mora') return c.diasMora > 0 ? `Mora ${c.diasMora}d` : 'Mora'
  if (c.estado === 'pendiente') return 'Pend.'
  if (c.estado === 'programada') return 'Prog.'
  return '—'
}

function clasesEstadoCuotaSocioModal(c) {
  const total = totalObligacionCuotaSocioModal(c)
  const pagado = c.valorPagado || 0
  if (pagado > 0 && pagado < total) {
    return { badge: 'bg-orange-100 text-orange-900 border-orange-200' }
  }
  if (c.estado === 'pagada' || pagado >= total) {
    return { badge: 'bg-green-100 text-green-900 border-green-200' }
  }
  if (c.estado === 'mora') {
    return { badge: 'bg-red-100 text-red-900 border-red-200' }
  }
  if (c.estado === 'pendiente') {
    return { badge: 'bg-amber-100 text-amber-900 border-amber-200' }
  }
  if (c.estado === 'programada') {
    return { badge: 'bg-slate-100 text-slate-700 border-slate-200' }
  }
  return { badge: 'bg-gray-100 text-gray-800 border-gray-200' }
}

// Función para abrir el modal de cuotas del socio
async function verCuotasSocio(sn) {
  // Desactivar animaciones de cuotas en mora al hacer clic en "ver cuotas"
  animacionesCuotasMora.value = false
  
  // Abrir la modal inmediatamente para una respuesta rápida
  socioParaCuotas.value = sn
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = true
  modalCuotasSocio.value = true
  
  // Cargar datos de forma asíncrona después de abrir la modal
  try {
    // Obtener las cuotas del socio (todas las cuotas, sin filtro de año)
    const resumen = await sociosStore.obtenerResumenSocio(sn.id)
    const cuotas = resumen?.cuotas || []
    
    // Obtener días de gracia de la natillera (ya cargada en onMounted)
    const natillera = natillerasStore.natilleraActual
    const diasGracia = natillera?.reglas_multas?.dias_gracia ?? 3
    
    // Calcular sanciones dinámicas para las cuotas del socio
    const resultSanciones = await cuotasStore.calcularSancionesTotales(id, cuotas)
    const sancionesSocio = resultSanciones.success ? (resultSanciones.sanciones || {}) : {}
    const sancionesActivas = resultSanciones.configActiva !== false // Verificar si las sanciones están activas
    
    // Procesar cada cuota individualmente
    const cuotasIndividuales = []
    
    cuotas.forEach(cuota => {
      if (!cuota.fecha_limite) return
      
      // Calcular el estado real de la cuota basándose en la fecha actual y días de gracia
      const estadoReal = calcularEstadoRealCuota(cuota, diasGracia)
      
      // Usar el campo mes de la cuota directamente
      const mes = cuota.mes || (() => {
        let fecha
        if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
          const [anio, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
          fecha = new Date(anio, mesNum - 1, dia)
        } else {
          fecha = new Date(cuota.fecha_limite)
        }
        return fecha.getMonth() + 1
      })()
      
      // Usar el campo anio de la cuota directamente
      const anio = cuota.anio || (() => {
        let fecha
        if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
          const [anioNum, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
          fecha = new Date(anioNum, mesNum - 1, dia)
        } else {
          fecha = new Date(cuota.fecha_limite)
        }
        return fecha.getFullYear()
      })()
      
      // Parsear fecha_limite correctamente y calcular fecha_vencimiento = fecha_limite + dias_gracia
      let fechaLimiteParaVencimiento
      if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
        const [anioNum, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
        fechaLimiteParaVencimiento = new Date(anioNum, mesNum - 1, dia)
      } else {
        fechaLimiteParaVencimiento = new Date(cuota.fecha_limite)
      }
      const fechaVencimiento = new Date(fechaLimiteParaVencimiento)
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
      
      // Obtener sanción de esta cuota - priorizar valor_multa persistido sobre sanciones dinámicas
      // Las multas deben persistir una vez asignadas, no recalcularse
      // Si las sanciones están inactivas, siempre usar 0
      let sancionCuota = 0
      if (sancionesActivas) {
        // IMPORTANTE: Priorizar valor_multa persistido sobre sanciones dinámicas
        // Esto asegura que las multas escalonadas persistan correctamente
        const valorMultaPersistido = parseFloat(cuota.valor_multa) || 0
        
        if (valorMultaPersistido > 0) {
          // Si hay multa persistida, usarla (no recalcular)
          sancionCuota = valorMultaPersistido
        } else if (cuota.estado === 'mora') {
          // Solo para cuotas en mora sin multa persistida, usar sanciones dinámicas
          sancionCuota = sancionesSocio[cuota.id] || 0
        } else {
          // Para cuotas con pago parcial que tienen valor_multa guardado (sanción pendiente),
          // seguir considerando la sanción hasta que se pague completamente
          if (cuota.valor_multa && cuota.valor_multa > 0) {
            const totalConSancion = (cuota.valor_cuota || 0) + cuota.valor_multa
            // Solo retornar la sanción si aún no se ha pagado el total
            if ((cuota.valor_pagado || 0) < totalConSancion) {
              sancionCuota = cuota.valor_multa
            }
          }
        }
      } else {
        // Si las sanciones están inactivas, no usar valor_multa antiguo
        sancionCuota = 0
      }
      
      // Calcular total con sanciones
      const deudaCuota = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
      let totalConSanciones = 0
      if (estadoReal !== 'pagada' && deudaCuota > 0) {
        totalConSanciones = deudaCuota + sancionCuota
      } else if (estadoReal === 'pagada') {
        totalConSanciones = 0
      } else {
        totalConSanciones = (cuota.valor_cuota || 0) + sancionCuota
      }
      
      // Calcular días en mora si está en mora
      let diasMora = 0
      if (estadoReal === 'mora' && fechaVencimiento) {
        const fechaActual = new Date()
        fechaActual.setHours(0, 0, 0, 0)
        const fechaVenc = new Date(fechaVencimiento)
        fechaVenc.setHours(0, 0, 0, 0)
        const diffTime = fechaActual.getTime() - fechaVenc.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        diasMora = Math.max(0, diffDays)
      }
      
      cuotasIndividuales.push({
        id: cuota.id,
        mes,
        anio,
        estado: estadoReal,
        valorCuota: cuota.valor_cuota || 0,
        valorPagado: cuota.valor_pagado || 0,
        sancion: sancionCuota,
        totalConSanciones: totalConSanciones,
        fechaVencimiento: fechaVencimiento,
        fechaPago: cuota.fecha_pago || null,
        diasMora: diasMora,
        periodicidad: sn.periodicidad || 'mensual',
        quincena: cuota.quincena || null,
        descripcion: cuota.descripcion || null
      })
    })
    
    // Ordenar por año, mes y fecha de vencimiento (más antiguo primero)
    cuotasSocioPorMes.value = cuotasIndividuales.sort((a, b) => {
      const anioA = a.anio || new Date(a.fechaVencimiento).getFullYear()
      const anioB = b.anio || new Date(b.fechaVencimiento).getFullYear()
      if (anioA !== anioB) return anioA - anioB
      
      const mesA = a.mes || new Date(a.fechaVencimiento).getMonth() + 1
      const mesB = b.mes || new Date(b.fechaVencimiento).getMonth() + 1
      if (mesA !== mesB) return mesA - mesB
      
      const fechaA = new Date(a.fechaVencimiento)
      const fechaB = new Date(b.fechaVencimiento)
      return fechaA.getTime() - fechaB.getTime()
    })
  } catch (error) {
    console.error('Error al cargar cuotas del socio:', error)
    alert(`Error al cargar las cuotas: ${error?.message || 'Error desconocido'}`)
  } finally {
    loadingCuotasSocio.value = false
    nextTick(() => programarNatiscrollModalCuotasSocio())
  }
}

function cerrarModalCuotasSocio() {
  modalCuotasSocio.value = false
  socioParaCuotas.value = null
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = false
}

// Función para manejar el botón atrás del navegador en móvil
let modalHistoryState = null

function handleModalBack(modalRef, modalName) {
  watch(modalRef, (isOpen) => {
    if (isOpen) {
      // Verificar si hay otras modales abiertas
      const hayOtrasModales = modalAgregar.value || modalDetalle.value || 
                              modalImportar.value || modalProgreso.value ||
                              socioAEliminar.value ||
                              (modalName !== 'cuotasSocio' && modalCuotasSocio.value)
      
      // Si es la primera modal que se abre (no hay otras modales), agregar primero
      // una entrada al historial que represente el estado "sin modales"
      if (!hayOtrasModales) {
        history.pushState({ modal: null }, '', window.location.href)
      }
      
      // Agregar entrada al historial cuando se abre la modal
      modalHistoryState = { modal: modalName }
      history.pushState(modalHistoryState, '', window.location.href)
    }
  })
}

// Listener para el botón atrás del navegador
function handlePopState(event) {
  // Verificar modales en orden de z-index (las más altas primero)
  // Esto asegura que se cierre primero la modal superior cuando hay modales anidadas
  
  // Modal de progreso (z-60 - más alta)
  if (modalProgreso.value) {
    modalProgreso.value = false
    // Si hay otra modal abierta debajo, no hacer nada más
    return
  }
  
  // Modal de cuotas del socio (z-50)
  if (modalCuotasSocio.value) {
    cerrarModalCuotasSocio()
    // Si hay otra modal abierta debajo, no hacer nada más
    // La modal inferior ya tiene su entrada en el historial (fue agregada cuando se abrió)
    // El siguiente "atrás" naturalmente cerrará esa modal
    return
  }
  
  // Modal de eliminar socio (z-50)
  if (socioAEliminar.value) {
    socioAEliminar.value = null
    // Si hay otra modal abierta debajo, no hacer nada más
    return
  }
  
  // Modal Detalle (z-50)
  if (modalDetalle.value) {
    modalDetalle.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalAgregar.value) {
      history.pushState({ modal: 'agregar' }, '', window.location.href)
    } else if (modalImportar.value) {
      history.pushState({ modal: 'importar' }, '', window.location.href)
    } else {
      // No hay otras modales, no hacer nada más porque ya hay una entrada en el historial
      // que representa el estado "sin modales" (fue agregada cuando se abrió esta modal)
    }
    return
  }
  
  // Modal Agregar (z-50)
  if (modalAgregar.value) {
    modalAgregar.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalImportar.value) {
      history.pushState({ modal: 'importar' }, '', window.location.href)
    } else {
      // No hay otras modales, no hacer nada más
    }
    return
  }
  
  // Modal Importar (z-50)
  if (modalImportar.value) {
    modalImportar.value = false
    // No hay otras modales, no hacer nada más
    return
  }
}

// Registrar watchers para cada modal
handleModalBack(modalCuotasSocio, 'cuotasSocio')
handleModalBack(modalDetalle, 'detalle')
handleModalBack(modalAgregar, 'agregar')
handleModalBack(modalImportar, 'importar')
handleModalBack(modalProgreso, 'progreso')
watch(socioAEliminar, (value) => {
  if (value) {
    // Verificar si hay otras modales abiertas
    const hayOtrasModales = modalAgregar.value || modalDetalle.value || 
                            modalImportar.value || modalProgreso.value ||
                            modalCuotasSocio.value
    
    // Si es la primera modal que se abre (no hay otras modales), agregar primero
    // una entrada al historial que represente el estado "sin modales"
    if (!hayOtrasModales) {
      history.pushState({ modal: null }, '', window.location.href)
    }
    
    // Agregar entrada al historial cuando se abre la modal
    modalHistoryState = { modal: 'eliminarSocio' }
    history.pushState(modalHistoryState, '', window.location.href)
  }
})

// Función para navegar a la vista de cuotas con el mes seleccionado
function navegarACuotasMes(mes) {
  // Validar que el ID sea válido antes de navegar
  if (!id || id === 'undefined' || id === 'null') {
    console.warn('ID de natillera inválido, redirigiendo al dashboard', id)
    router.push('/dashboard')
    return
  }
  // Cerrar la modal primero
  cerrarModalCuotasSocio()
  // Navegar a la vista de cuotas con el mes como parámetro de ruta
  router.push(`/natilleras/${id}/cuotas/${mes}`)
}

// Función para enviar WhatsApp de una cuota específica
function enviarWhatsAppCuota(cuotaData) {
  if (!socioParaCuotas.value?.socio?.telefono) {
    alert('Este socio no tiene teléfono registrado')
    return
  }
  
  const telefono = socioParaCuotas.value.socio.telefono.replace(/\D/g, '')
  const nombreSocio = socioParaCuotas.value.socio?.nombre || 'Socio'
  const mesLabel = getMesLabel(cuotaData.mes)
  const valorCuota = formatMoney(cuotaData.valorCuota)
  const sancion = formatMoney(cuotaData.sancion || 0)
  const totalAPagar = formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota)
  const fechaVencimiento = formatDate(cuotaData.fechaVencimiento)
  
  // Calcular días en mora si está en mora
  let diasMora = '0'
  if (cuotaData.estado === 'mora' && cuotaData.fechaVencimiento) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaVenc = new Date(cuotaData.fechaVencimiento)
    fechaVenc.setHours(0, 0, 0, 0)
    const diff = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24))
    diasMora = Math.max(0, diff).toString()
  }
  
  // Usar mensajes personalizados del store
  let mensaje
  if (cuotaData.estado === 'mora') {
    mensaje = configStore.generarMensajeCuotaMora(
      nombreSocio,
      mesLabel,
      cuotaData.anio?.toString() || '',
      valorCuota,
      sancion,
      totalAPagar,
      fechaVencimiento,
      diasMora
    )
  } else {
    mensaje = configStore.generarMensajeCuotaPendiente(
      nombreSocio,
      mesLabel,
      cuotaData.anio?.toString() || '',
      valorCuota,
      totalAPagar,
      fechaVencimiento
    )
  }
  
  const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}

// Funciones para importación CSV
function descargarEjemploCSV() {
  const contenido = `nombre,valor_cuota,telefono,email,documento
Juan Pérez,50000,3001234567,juan@email.com,1234567890
María García,75000,3009876543,maria@email.com,0987654321
Carlos López,50000,3005551234,,
Ana Martínez,100000,3004445678,,0987654322`

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
      if (!encabezados.includes('nombre') || !encabezados.includes('valor_cuota') || !encabezados.includes('telefono')) {
        errorImportar.value = 'El archivo debe tener las columnas "nombre", "valor_cuota" y "telefono" (obligatorio y único)'
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

        // Validar datos mínimos (nombre, valor_cuota y telefono son obligatorios)
        if (socio.nombre && socio.valor_cuota && socio.telefono && socio.telefono.trim() !== '') {
          socios.push({
            nombre: socio.nombre,
            valor_cuota: parseInt(socio.valor_cuota) || 50000,
            cantidad_cuotas: parseInt(socio.cantidad_cuotas) || 1,
            telefono: socio.telefono.trim(), // Obligatorio y único
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

  // Validar que todos los socios tengan teléfono
  const sociosSinTelefono = sociosPreview.value.filter(s => !s.telefono || s.telefono.trim() === '')
  if (sociosSinTelefono.length > 0) {
    errorImportar.value = `Error: ${sociosSinTelefono.length} ${sociosSinTelefono.length === 1 ? 'socio no tiene' : 'socios no tienen'} teléfono. El teléfono es obligatorio y único.`
    return
  }

  importando.value = true
  errorImportar.value = ''
  exitoImportar.value = ''

  let importados = 0
  let errores = 0
  const erroresDetalle = []

  for (const socio of sociosPreview.value) {
    // Validar nuevamente el teléfono antes de agregar
    if (!socio.telefono || socio.telefono.trim() === '') {
      errores++
      erroresDetalle.push(`${socio.nombre}: teléfono requerido`)
      continue
    }

    const result = await sociosStore.agregarSocio(
      id,
      {
        nombre: socio.nombre,
        documento: socio.documento,
        email: socio.email,
        telefono: socio.telefono.trim() // Asegurar que esté limpio
      },
      socio.valor_cuota,
      'mensual' // Periodicidad por defecto para importación
    )

    if (result.success) {
      importados++
    } else {
      errores++
      erroresDetalle.push(`${socio.nombre}: ${result.error || 'Error desconocido'}`)
    }
  }

  importando.value = false

  // Registrar auditoría de importación masiva
  const auditoria = useAuditoria()
  const descripcionImportacion = errores === 0
    ? `Se importaron ${importados} socios desde CSV exitosamente`
    : `Se importaron ${importados} socios desde CSV. ${errores} ${errores === 1 ? 'tuvo error' : 'tuvieron errores'}`
  
  registrarAuditoriaEnSegundoPlano(auditoria.registrar({
    tipoAccion: 'CREATE',
    entidad: 'socios_natillera',
    entidadId: null, // Importación masiva, no tiene un ID único
    descripcion: descripcionImportacion,
    natilleraId: id,
    datosNuevos: {
      total_importados: importados,
      total_errores: errores,
      total_intentos: sociosPreview.value.length,
      metodo: 'importacion_csv'
    },
    detalles: {
      importacion_masiva: true,
      archivo_csv: archivoCSV.value?.name || 'desconocido',
      errores_detalle: erroresDetalle.length > 0 ? erroresDetalle.slice(0, 10) : null // Limitar a 10 errores para no sobrecargar
    }
  }))

  if (errores === 0) {
    exitoImportar.value = `Se importaron ${importados} socios exitosamente`
    sociosPreview.value = []
    archivoCSV.value = null
    // Recargar la lista de socios
    await sociosStore.fetchSociosNatillera(id)
  } else {
    const mensajeErrores = erroresDetalle.length > 0 
      ? '\n\nDetalles:\n' + erroresDetalle.slice(0, 5).join('\n') + (erroresDetalle.length > 5 ? `\n... y ${erroresDetalle.length - 5} más` : '')
      : ''
    errorImportar.value = `Se importaron ${importados} socios. ${errores} ${errores === 1 ? 'tuvo error' : 'tuvieron errores'}.${mensajeErrores}`
    if (importados > 0) {
      exitoImportar.value = `${importados} socios importados correctamente`
      // Recargar la lista de socios
      await sociosStore.fetchSociosNatillera(id)
    }
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

async function verComprobanteSalida(sn) {
  if (sn.estado !== 'inactivo') return
  const guardado = comprobantesSalidaGuardados.value[sn.id]
  if (guardado) {
    comprobanteDesactivacion.value = { ...guardado }
    return
  }
  loadingComprobanteSalida.value = true
  const { data: row, error } = await supabase
    .from('comprobantes_salida')
    .select('socio_nombre, socio_telefono, fecha, total_ahorrado, valor_sancion, valor_entregar, codigo_comprobante')
    .eq('socio_natillera_id', sn.id)
    .maybeSingle()
  loadingComprobanteSalida.value = false
  if (error) {
    console.error('Error cargando comprobante de salida:', error)
    notificationStore.error('No se pudo cargar el comprobante', 'Error')
    return
  }
  if (row) {
    comprobanteDesactivacion.value = {
      socioNombre: row.socio_nombre || sn.socio?.nombre || 'Socio',
      socioTelefono: row.socio_telefono || sn.socio?.telefono || null,
      fecha: row.fecha,
      totalAhorrado: parseFloat(row.total_ahorrado) || 0,
      valorFondo: parseFloat(row.valor_sancion) || 0,
      valorEntregar: parseFloat(row.valor_entregar) || 0,
      codigoComprobante: row.codigo_comprobante
    }
    comprobantesSalidaGuardados.value[sn.id] = { ...comprobanteDesactivacion.value }
  } else {
    notificationStore.warning(
      'No hay comprobante de salida para este socio. Se genera al desactivar desde la opción "Desactivar".',
      'Sin comprobante',
      4000
    )
  }
}


// Listener para cerrar el tooltip cuando se hace click fuera
let clickOutsideListener = null

watch(mostrarAdvertenciaCuota, (isOpen) => {
  if (isOpen) {
    // Agregar listener después de que Vue renderice
    nextTick(() => {
      clickOutsideListener = (event) => {
        const tooltip = document.querySelector('[data-advertencia-tooltip]')
        const button = event.target.closest('[data-advertencia-button]')
        
        if (tooltip && !tooltip.contains(event.target) && !button) {
          mostrarAdvertenciaCuota.value = false
        }
      }
      document.addEventListener('click', clickOutsideListener)
    })
  } else {
    // Remover listener cuando se cierra
    if (clickOutsideListener) {
      document.removeEventListener('click', clickOutsideListener)
      clickOutsideListener = null
    }
  }
})

// Watch para recargar la natillera cuando cambie el ID de la ruta o props
watch(() => props.id || route.params.id, async (newId) => {
  if (newId && newId !== natillerasStore.natilleraActual?.id) {
    await natillerasStore.fetchNatillera(newId)
  }
}, { immediate: false })

// Función para cargar préstamos en mora
async function fetchPrestamosEnMora() {
  loadingPrestamos.value = true
  try {
    // Reusar socios ya cargados por sociosStore en lugar de un fetch extra
    const sociosNatilleraData = sociosStore.sociosNatillera
    if (!sociosNatilleraData || sociosNatilleraData.length === 0) {
      prestamosEnMora.value = []
      return
    }

    const socioNatilleraIds = sociosNatilleraData.map(s => s.id)

    // Un solo request con nested select (antes: 3 queries secuenciales)
    const { data: prestamos, error: prestamosErr } = await supabase
      .from('prestamos')
      .select('*, plan_pagos_prestamo(prestamo_id, fecha_proyectada, pagada, valor_cuota)')
      .in('socio_natillera_id', socioNatilleraIds)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false })

    if (prestamosErr) throw prestamosErr

    if (!prestamos || prestamos.length === 0) {
      prestamosEnMora.value = []
      return
    }

    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    const prestamosConMora = prestamos.map(prestamo => {
      const socioNat = sociosNatilleraData.find(s => s.id === prestamo.socio_natillera_id)
      const planPagosPrestamo = prestamo.plan_pagos_prestamo || []

      const cuotasVencidasArray = planPagosPrestamo.filter(cuota => {
        if (cuota.pagada) return false
        const fv = new Date(cuota.fecha_proyectada)
        fv.setHours(0, 0, 0, 0)
        return fv < fechaActual
      })

      if (cuotasVencidasArray.length === 0) return null

      cuotasVencidasArray.sort((a, b) => new Date(a.fecha_proyectada) - new Date(b.fecha_proyectada))

      const fechaVencMasAntigua = new Date(cuotasVencidasArray[0].fecha_proyectada)
      fechaVencMasAntigua.setHours(0, 0, 0, 0)

      return {
        ...prestamo,
        socio_natillera: socioNat,
        tieneCuotasVencidas: true,
        cuotasVencidas: cuotasVencidasArray.length,
        diasMora: Math.floor((fechaActual - fechaVencMasAntigua) / 86400000),
        valorCuotasEnDeuda: cuotasVencidasArray.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
      }
    }).filter(Boolean)

    prestamosEnMora.value = prestamosConMora
  } catch (e) {
    console.error('Error cargando préstamos en mora:', e)
    prestamosEnMora.value = []
  } finally {
    loadingPrestamos.value = false
  }
}

// Computed para contar préstamos en mora
const cantidadPrestamosEnMora = computed(() => prestamosEnMora.value.length)

// Computed para socios con cuotas de natillera en mora
const sociosConCuotasEnMora = computed(() => {
  const cuotas = cuotasStore.cuotas
  if (!cuotas || cuotas.length === 0) return []
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // Obtener días de gracia de la natillera
  // Siempre calcular desde fecha_limite + dias_gracia para asegurar consistencia
  const natillera = natillerasStore.natilleraActual
  let diasGracia = 3 // Valor por defecto
  
  // Verificar si la natillera está cargada y coincide con el ID actual
  if (natillera && natillera.id === id) {
    diasGracia = natillera.reglas_multas?.dias_gracia ?? 3
  }
  
  // Debug: Log para verificar días de gracia usados
  if (process.env.NODE_ENV === 'development') {
    console.log('📅 Días de gracia usados para cálculo de mora:', diasGracia, 'Natillera ID:', natillera?.id, 'ID actual:', id)
  }
  
  // Agrupar cuotas en mora por socio
  const sociosMap = {}
  
  cuotas.forEach(cuota => {
    if (cuota.estado !== 'mora') return
    
    const socioId = cuota.socio_natillera_id
    if (!socioId) return
    
    const socioInfo = cuota.socio_natillera?.socio
    
    if (!sociosMap[socioId]) {
      sociosMap[socioId] = {
        id: socioId,
        nombre: socioInfo?.nombre || 'Sin nombre',
        avatar_seed: socioInfo?.avatar_seed || null,
        avatar_style: socioInfo?.avatar_style || 'adventurer',
        socio: socioInfo || null,
        cuotasMora: 0,
        totalDeuda: 0,
        diasMora: 0,
        fechaMoraAntigua: null,
        cuotasMoraList: []
      }
    }
    
    // Contar cuotas en mora
    sociosMap[socioId].cuotasMora++
    const deudaCuota = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0) + (cuota.valor_multa || 0)
    sociosMap[socioId].totalDeuda += deudaCuota
    sociosMap[socioId].cuotasMoraList.push(cuota)
    
    // Calcular días de mora desde la cuota más antigua usando fecha_vencimiento (que incluye días de gracia)
    // IMPORTANTE: Siempre calcular desde fecha_limite + dias_gracia para asegurar consistencia
    let fechaVencimiento = null
    
    if (cuota.fecha_limite) {
      // Siempre calcular fecha_vencimiento desde fecha_limite + dias_gracia
      // para asegurar que los días de gracia se tomen en cuenta correctamente
      if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
        const [anio, mes, dia] = cuota.fecha_limite.split('-').map(Number)
        fechaVencimiento = new Date(anio, mes - 1, dia)
      } else {
        fechaVencimiento = new Date(cuota.fecha_limite)
      }
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
    }
    
    if (fechaVencimiento) {
      fechaVencimiento.setHours(0, 0, 0, 0)
      
      if (!sociosMap[socioId].fechaMoraAntigua || fechaVencimiento < sociosMap[socioId].fechaMoraAntigua) {
        sociosMap[socioId].fechaMoraAntigua = fechaVencimiento
        const diasCalculados = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24))
        sociosMap[socioId].diasMora = diasCalculados
        
        // Debug: Log para verificar cálculo
        if (process.env.NODE_ENV === 'development' && diasCalculados > 0) {
          console.log('📊 Cálculo días mora:', {
            socio: socioInfo?.nombre,
            fechaLimite: cuota.fecha_limite,
            diasGracia,
            fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
            hoy: hoy.toISOString().split('T')[0],
            diasMora: diasCalculados
          })
        }
      }
    }
  })
  
  // Convertir a array y ordenar por días de mora (mayor primero)
  return Object.values(sociosMap).sort((a, b) => b.diasMora - a.diasMora)
})

// Computed para contar socios con cuotas en mora
const cantidadSociosCuotasEnMora = computed(() => sociosConCuotasEnMora.value.length)

// Total de cuotas en mora (suma de todas las cuotas de todos los socios)
const totalCuotasEnMora = computed(() => {
  return sociosConCuotasEnMora.value.reduce((sum, socio) => sum + socio.cuotasMora, 0)
})

// Navegar a préstamos
function irAPrestamos() {
  // Validar que el ID sea válido antes de navegar
  if (!id || id === 'undefined' || id === 'null') {
    console.warn('ID de natillera inválido, redirigiendo al dashboard', id)
    router.push('/dashboard')
    return
  }
  const n = natillerasStore.natilleraActual
  if (n && String(n.id) === String(id) && natilleraPrestamosDeshabilitados(n)) {
    notificationStore.info('La natillera no permite préstamos', 'Préstamos')
    return
  }
  router.push(`/natilleras/${id}/prestamos`)
}

// Navegar a cuotas
function irACuotas() {
  // Validar que el ID sea válido antes de navegar
  if (!id || id === 'undefined' || id === 'null') {
    console.warn('ID de natillera inválido, redirigiendo al dashboard', id)
    router.push('/dashboard')
    return
  }
  router.push(`/natilleras/${id}/cuotas`)
}

onMounted(async () => {
  // ── Phase 1: Cargas críticas en PARALELO ──
  // Antes: 6 awaits secuenciales (~6 round-trips).
  // Ahora: 3 fetches en paralelo (~1 round-trip) para mostrar la lista de socios lo antes posible.
  const needsNatillera = !natillerasStore.natilleraActual || natillerasStore.natilleraActual.id !== id

  const [userResult] = await Promise.all([
    supabase.auth.getUser(),
    needsNatillera
      ? supabase.from('natilleras').select('*').eq('id', id).maybeSingle().then(({ data }) => {
          if (data) natillerasStore.natilleraActual = data
        })
      : Promise.resolve(),
    sociosStore.fetchSociosNatillera(id)
  ])

  const user = userResult.data.user
  usuarioAutenticado.value = user
  cargaInicial.value = false

  // ── Phase 2: Poblar cuotas store sin re-fetch (datos ya en sociosStore) ──
  const sociosNat = sociosStore.sociosNatillera
  if (sociosNat.length > 0) {
    const allCuotas = sociosNat.flatMap(sn =>
      (sn.cuotas || []).map(c => ({ ...c, socio_natillera_id: sn.id }))
    )
    cuotasStore.aplicarCuotasDesdeCargaNatillera(
      sociosNat.map(sn => ({
        id: sn.id,
        valor_cuota_individual: sn.valor_cuota_individual,
        periodicidad: sn.periodicidad,
        estado: sn.estado,
        socio: sn.socio
      })),
      allCuotas
    )
  }

  // ── Phase 3: Trabajo secundario NO bloqueante ──
  const natillera = natillerasStore.natilleraActual
  if (natillera && user) {
    if (natillera.admin_id === user.id) {
      miRol.value = 'administrador'
    } else {
      colaboradoresStore.obtenerMiRol(id)
        .then(rol => { miRol.value = rol })
        .catch(() => { miRol.value = null })
    }
  }

  fetchPrestamosEnMora()

  loadingCuotas.value = true
  cuotasStore.fetchCuotasNatillera(id).finally(() => { loadingCuotas.value = false })

  window.addEventListener('popstate', handlePopState)

  if (route.query.agregar === 'true') {
    await nextTick()
    setTimeout(() => {
      abrirModalAgregar()
      router.replace({ query: {} })
    }, 300)
  }
})

onUnmounted(() => {
  if (rafNatiscrollModalAgregarSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalAgregarSocio)
    rafNatiscrollModalAgregarSocio = null
  }
  if (rafNatiscrollModalCuotasSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalCuotasSocio)
    rafNatiscrollModalCuotasSocio = null
  }
  // Limpiar listener al desmontar
  if (clickOutsideListener) {
    document.removeEventListener('click', clickOutsideListener)
  }
  // Remover listener para el botón atrás
  window.removeEventListener('popstate', handlePopState)
})
</script>

<style scoped>
/* Animación de entrada para las cuotas */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}

/* Animación de resaltado para cuotas en mora */
@keyframes mora-highlight {
  0%, 100% {
    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2), 0 0 0 2px rgba(239, 68, 68, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 20px 25px -5px rgba(239, 68, 68, 0.6), 0 10px 10px -5px rgba(239, 68, 68, 0.4), 0 0 0 4px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.5);
    transform: scale(1.03);
  }
}

.animate-mora-highlight {
  animation: mora-highlight 1.5s ease-in-out infinite;
}

/* Efecto shimmer especial para cuotas en mora */
@keyframes shimmer-mora {
  0% {
    transform: translateX(-100%) skewX(-15deg);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
    opacity: 0;
  }
}

.animate-shimmer-mora {
  animation: shimmer-mora 2s ease-in-out infinite;
}

/* Transiciones suaves para tarjetas de socios */
.socio-card-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.socio-card-enter-active {
  animation: socio-card-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.socio-card-leave-active {
  animation: socio-card-out 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

.socio-card-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes socio-card-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes socio-card-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}

/* Efecto de actualización exitosa */
@keyframes update-success {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(52, 211, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
  }
}

.animate-update-success {
  animation: update-success 0.6s ease-out;
}

/* Transiciones de modales */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  animation: modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  animation: modal-scale-out 0.2s ease-in;
}

@keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-scale-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(5px);
  }
}

/* Animaciones para el modal de progreso */
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

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

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
  animation: scale-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

/* ========================================
   ANIMACIONES MODAL DE PROGRESO PREMIUM
   ======================================== */

/* Partículas flotantes */
@keyframes float-particle {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-40px) translateX(-5px) scale(0.8);
    opacity: 0.4;
  }
  75% {
    transform: translateY(-20px) translateX(-15px) scale(1.1);
    opacity: 0.7;
  }
}

@keyframes float-particle-slow {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0.4;
  }
  33% {
    transform: translateY(-30px) translateX(20px) rotate(120deg);
    opacity: 0.7;
  }
  66% {
    transform: translateY(-15px) translateX(-10px) rotate(240deg);
    opacity: 0.5;
  }
}

.animate-float-particle {
  animation: float-particle 4s ease-in-out infinite;
}

.animate-float-particle-slow {
  animation: float-particle-slow 6s ease-in-out infinite;
}

/* Órbitas */
@keyframes orbit-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-orbit-slow {
  animation: orbit-slow 12s linear infinite;
}

.animate-orbit-reverse {
  animation: orbit-reverse 8s linear infinite;
}

/* Spin muy lento para anillos decorativos */
@keyframes spin-very-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-very-slow {
  animation: spin-very-slow 20s linear infinite;
}

/* Spin reverso */
@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-spin-reverse {
  animation: spin-reverse 1.5s linear infinite;
}

/* Bounce suave */
@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 1.5s ease-in-out infinite;
}

/* Efecto sparkle para iconos */
@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.9;
  }
  50% {
    transform: scale(0.95) rotate(-3deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.05) rotate(2deg);
    opacity: 0.95;
  }
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

/* Pop de éxito */
@keyframes success-pop {
  0% {
    transform: scale(0) rotate(-30deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.animate-success-pop {
  animation: success-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

/* Pulse de éxito */
@keyframes pulse-success {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.1);
  }
}

.animate-pulse-success {
  animation: pulse-success 1.5s ease-in-out infinite;
}

/* Shake para errores */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

.animate-shake {
  animation: shake 0.6s ease-in-out;
}

/* Animación de check dibujándose */
@keyframes check-draw {
  0% {
    stroke-dashoffset: 24;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-check-draw path {
  stroke-dasharray: 24;
  animation: check-draw 0.4s ease-out forwards;
}
</style>


<template>
  <div class="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <div class="relative bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <ClipboardDocumentListIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 to-emerald-700 bg-clip-text text-transparent">
                Auditoría del Sistema
              </h1>
              <p class="text-gray-600 mt-1 text-sm sm:text-base font-medium">
                Trazabilidad completa de todos los movimientos y modificaciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Filtros -->
      <div class="card bg-gradient-to-br from-white via-natillera-50/50 to-emerald-50/30 border border-natillera-200/50 mb-6 relative overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <!-- Header -->
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200/50">
            <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <FunnelIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-display font-bold text-gray-800">
                Filtros de Búsqueda
              </h2>
              <p class="text-sm text-gray-600 mt-1">Personaliza tu consulta de auditoría</p>
            </div>
          </div>
          
          <!-- Campos del formulario -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <!-- Filtro por Natillera -->
            <div class="space-y-2 min-w-0">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div class="w-2 h-2 rounded-full bg-natillera-500 flex-shrink-0"></div>
                <span class="truncate">Natillera</span>
              </label>
              <div class="relative">
                <select
                  v-model="filtros.natilleraId"
                  @change="aplicarFiltros"
                  class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-white focus:bg-white transition-colors text-sm"
                >
                  <option value="">Todas las natilleras</option>
                  <option v-for="natillera in natilleras" :key="natillera.id" :value="natillera.id">
                    {{ natillera.nombre }}
                  </option>
                </select>
                <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Filtro por Entidad -->
            <div class="space-y-2 min-w-0">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <span class="truncate">Entidad</span>
              </label>
              <div class="relative">
                <select
                  v-model="filtros.entidad"
                  @change="aplicarFiltros"
                  class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-white focus:bg-white transition-colors text-sm"
                >
                  <option value="">Todas las entidades</option>
                  <option value="natillera">Natillera</option>
                  <option value="socio">Socio</option>
                  <option value="socio_natillera">Socio en Natillera</option>
                  <option value="cuota">Cuota</option>
                  <option value="pago">Pago</option>
                  <option value="comprobante">Comprobante</option>
                  <option value="prestamo">Préstamo</option>
                  <option value="actividad">Actividad</option>
                </select>
                <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Filtro por Tipo de Acción -->
            <div class="space-y-2 min-w-0">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div class="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></div>
                <span class="truncate">Tipo de Acción</span>
              </label>
              <div class="relative">
                <select
                  v-model="filtros.tipoAccion"
                  @change="aplicarFiltros"
                  class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-white focus:bg-white transition-colors text-sm"
                >
                  <option value="">Todas las acciones</option>
                  <option value="CREATE">Crear</option>
                  <option value="UPDATE">Actualizar</option>
                  <option value="DELETE">Eliminar</option>
                  <option value="GENERATE">Generar</option>
                  <option value="REGISTER">Registrar</option>
                </select>
                <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Filtro por Fecha -->
            <div class="space-y-2 min-w-0 sm:col-span-2 xl:col-span-1">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div class="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                <span class="truncate">Rango de Fechas</span>
              </label>
              <div class="flex gap-2">
                <div class="relative flex-1 min-w-0">
                  <input
                    v-model="filtros.fechaDesde"
                    type="date"
                    class="input-field w-full pl-9 pr-3 hover:bg-white focus:bg-white transition-colors text-sm"
                  />
                  <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="relative flex-1 min-w-0">
                  <input
                    v-model="filtros.fechaHasta"
                    type="date"
                    class="input-field w-full pl-9 pr-3 hover:bg-white focus:bg-white transition-colors text-sm"
                  />
                  <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-3 mt-8 pt-6 border-t border-gray-200/50">
            <button
              @click="aplicarFiltros"
              class="btn-primary flex-1 inline-flex items-center justify-center gap-2 group"
            >
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Aplicar Filtros
            </button>
            <button
              @click="limpiarFiltros"
              class="btn-secondary inline-flex items-center justify-center gap-2 group"
            >
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de Resultados -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <!-- Header de la tabla -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">
              Registros de Auditoría
              <span v-if="totalRegistros > 0" class="text-sm font-normal text-gray-500 ml-2">
                ({{ totalRegistros }} registros)
              </span>
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">Mostrar:</span>
              <select
                v-model="filtros.limit"
                @change="aplicarFiltros"
                class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
              >
                <option :value="50">50</option>
                <option :value="100">100</option>
                <option :value="200">200</option>
                <option :value="500">500</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-natillera-500"></div>
          <p class="mt-4 text-gray-500">Cargando registros...</p>
        </div>

        <!-- Tabla -->
        <div v-else-if="registros.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entidad</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="registro in registros"
                :key="registro.id"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @click="verDetalle(registro)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatDate(registro.created_at) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatTime(registro.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ registro.usuario_email || 'Usuario eliminado' }}
                  </div>
                  <div v-if="registro.natillera_nombre" class="text-xs text-gray-500">
                    {{ registro.natillera_nombre }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getTipoAccionClass(registro.tipo_accion)
                    ]"
                  >
                    {{ getTipoAccionLabel(registro.tipo_accion) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      getEntidadClass(registro.entidad)
                    ]"
                  >
                    {{ getEntidadLabel(registro.entidad) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-md">
                    {{ registro.descripcion }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click.stop="verDetalle(registro)"
                    class="px-4 py-2 bg-natillera-500 text-white rounded-lg hover:bg-natillera-600 font-medium text-sm transition-colors shadow-sm hover:shadow-md"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sin resultados -->
        <div v-else class="p-12 text-center">
          <ClipboardDocumentListIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">No se encontraron registros</p>
          <p class="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalRegistros > filtros.limit" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          Mostrando {{ (filtros.offset || 0) + 1 }} - {{ Math.min((filtros.offset || 0) + filtros.limit, totalRegistros) }} de {{ totalRegistros }}
        </div>
        <div class="flex gap-2">
          <button
            @click="paginaAnterior"
            :disabled="!tienePaginaAnterior"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all',
              tienePaginaAnterior
                ? 'bg-natillera-500 text-white hover:bg-natillera-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            ]"
          >
            Anterior
          </button>
          <button
            @click="paginaSiguiente"
            :disabled="!tienePaginaSiguiente"
            :class="[
              'px-4 py-2 rounded-xl font-medium transition-all',
              tienePaginaSiguiente
                ? 'bg-natillera-500 text-white hover:bg-natillera-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            ]"
          >
            Siguiente
          </button>
        </div>
      </div>

    <!-- Modal de Detalle -->
    <Transition name="modal">
      <div
        v-if="registroSeleccionado"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="cerrarDetalle"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" @click="cerrarDetalle"></div>
        
        <!-- Modal Content -->
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="modal-content relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <!-- Header del Modal -->
            <div class="bg-gradient-to-r from-natillera-500 to-natillera-600 px-6 py-5">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-white">
                  Detalle del Registro de Auditoría
                </h3>
                <button
                  @click="cerrarDetalle"
                  class="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon class="w-6 h-6" />
                </button>
              </div>
            </div>

            <!-- Contenido del Modal -->
            <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <!-- Información General -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Fecha y Hora</p>
                  <p class="font-semibold text-gray-900">
                    {{ formatDate(registroSeleccionado.created_at) }} {{ formatTime(registroSeleccionado.created_at) }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Usuario</p>
                  <p class="font-semibold text-gray-900">
                    {{ registroSeleccionado.usuario_email || 'Usuario eliminado' }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Tipo de Acción</p>
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                      getTipoAccionClass(registroSeleccionado.tipo_accion)
                    ]"
                  >
                    {{ getTipoAccionLabel(registroSeleccionado.tipo_accion) }}
                  </span>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                  <p class="text-xs text-gray-500 mb-1">Entidad</p>
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-xs font-medium',
                      getEntidadClass(registroSeleccionado.entidad)
                    ]"
                  >
                    {{ getEntidadLabel(registroSeleccionado.entidad) }}
                  </span>
                </div>
              </div>

              <!-- Descripción -->
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Descripción</h4>
                <p class="text-gray-900 bg-gray-50 rounded-xl p-4">
                  {{ registroSeleccionado.descripcion }}
                </p>
              </div>

              <!-- Cambios (si es UPDATE) -->
              <div v-if="registroSeleccionado.cambios && Object.keys(registroSeleccionado.cambios).length > 0" class="mb-6">
                <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 bg-natillera-500 rounded-full"></span>
                  Cambios Realizados
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="(cambio, campo) in registroSeleccionado.cambios"
                    :key="campo"
                    class="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                      {{ formatFieldName(campo) }}
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <p class="text-xs font-semibold text-red-700 mb-2 flex items-center gap-2">
                          <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Valor Anterior
                        </p>
                        <p class="text-base text-red-900 font-semibold break-words">
                          {{ formatValue(cambio.anterior) }}
                        </p>
                      </div>
                      <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <p class="text-xs font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Valor Nuevo
                        </p>
                        <p class="text-base text-green-900 font-semibold break-words">
                          {{ formatValue(cambio.nuevo) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mostrar cambios también si hay datos_anteriores y datos_nuevos pero no cambios calculados -->
              <div v-else-if="registroSeleccionado.datos_anteriores && registroSeleccionado.datos_nuevos && registroSeleccionado.tipo_accion === 'UPDATE'" class="mb-6">
                <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 bg-natillera-500 rounded-full"></span>
                  Comparación de Datos
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                    <h5 class="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                      Estado Anterior
                    </h5>
                    <div class="space-y-2">
                      <div
                        v-for="(valor, campo) in registroSeleccionado.datos_anteriores"
                        :key="campo"
                        class="bg-white rounded-lg p-3 border border-red-100"
                      >
                        <p class="text-xs font-semibold text-red-600 mb-1 uppercase">{{ formatFieldName(campo) }}</p>
                        <p class="text-sm text-red-900 font-medium">{{ formatValue(valor) }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <h5 class="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      Estado Nuevo
                    </h5>
                    <div class="space-y-2">
                      <div
                        v-for="(valor, campo) in registroSeleccionado.datos_nuevos"
                        :key="campo"
                        class="bg-white rounded-lg p-3 border border-green-100"
                      >
                        <p class="text-xs font-semibold text-green-600 mb-1 uppercase">{{ formatFieldName(campo) }}</p>
                        <p class="text-sm text-green-900 font-medium">{{ formatValue(valor) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detalles Adicionales -->
              <div v-if="registroSeleccionado.detalles" class="mb-6">
                <h4 class="text-sm font-semibold text-gray-700 mb-3">Detalles Adicionales</h4>
                <pre class="bg-gray-50 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto">{{ JSON.stringify(registroSeleccionado.detalles, null, 2) }}</pre>
              </div>

              <!-- Datos Completos (si existen) -->
              <div v-if="registroSeleccionado.datos_anteriores || registroSeleccionado.datos_nuevos" class="grid grid-cols-2 gap-4">
                <div v-if="registroSeleccionado.datos_anteriores">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">Datos Anteriores</h4>
                  <pre class="bg-red-50 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto max-h-64 overflow-y-auto">{{ JSON.stringify(registroSeleccionado.datos_anteriores, null, 2) }}</pre>
                </div>
                <div v-if="registroSeleccionado.datos_nuevos">
                  <h4 class="text-sm font-semibold text-gray-700 mb-3">Datos Nuevos</h4>
                  <pre class="bg-green-50 rounded-xl p-4 text-xs text-gray-700 overflow-x-auto max-h-64 overflow-y-auto">{{ JSON.stringify(registroSeleccionado.datos_nuevos, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <!-- Footer del Modal -->
            <div class="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                @click="cerrarDetalle"
                class="px-6 py-2 bg-natillera-500 text-white rounded-xl hover:bg-natillera-600 transition-all font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuditoria } from '../../composables/useAuditoria'
import { useNatillerasStore } from '../../stores/natilleras'
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const auditoria = useAuditoria()
const natillerasStore = useNatillerasStore()

const loading = ref(false)
const registros = ref([])
const totalRegistros = ref(0)
const registroSeleccionado = ref(null)

// Función para obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaActual() {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
}

const filtros = ref({
  natilleraId: '',
  entidad: '',
  tipoAccion: '',
  fechaDesde: obtenerFechaActual(),
  fechaHasta: obtenerFechaActual(),
  limit: 50,
  offset: 0
})

const natilleras = computed(() => natillerasStore.natillerasActivas)

const tienePaginaAnterior = computed(() => (filtros.value.offset || 0) > 0)
const tienePaginaSiguiente = computed(() => {
  const offset = filtros.value.offset || 0
  const limit = filtros.value.limit || 50
  return offset + limit < totalRegistros.value
})

onMounted(async () => {
  await natillerasStore.fetchNatilleras()
  await cargarRegistros()
})

async function cargarRegistros() {
  loading.value = true
  try {
    const filtrosAplicar = {
      natilleraId: filtros.value.natilleraId || undefined,
      entidad: filtros.value.entidad || undefined,
      tipoAccion: filtros.value.tipoAccion || undefined,
      fechaDesde: filtros.value.fechaDesde ? new Date(filtros.value.fechaDesde) : undefined,
      fechaHasta: filtros.value.fechaHasta ? new Date(filtros.value.fechaHasta + 'T23:59:59') : undefined,
      limit: filtros.value.limit,
      offset: filtros.value.offset
    }

    const resultado = await auditoria.obtenerHistorial(filtrosAplicar)
    
    if (resultado.success) {
      registros.value = resultado.data || []
      totalRegistros.value = resultado.total || 0
    }
  } catch (error) {
    console.error('Error cargando registros:', error)
  } finally {
    loading.value = false
  }
}

function aplicarFiltros() {
  filtros.value.offset = 0
  cargarRegistros()
}

function limpiarFiltros() {
  const fechaActual = obtenerFechaActual()
  filtros.value = {
    natilleraId: '',
    entidad: '',
    tipoAccion: '',
    fechaDesde: fechaActual,
    fechaHasta: fechaActual,
    limit: 50,
    offset: 0
  }
  cargarRegistros()
}

function paginaAnterior() {
  if (tienePaginaAnterior.value) {
    filtros.value.offset = Math.max(0, (filtros.value.offset || 0) - filtros.value.limit)
    cargarRegistros()
  }
}

function paginaSiguiente() {
  if (tienePaginaSiguiente.value) {
    filtros.value.offset = (filtros.value.offset || 0) + filtros.value.limit
    cargarRegistros()
  }
}

function verDetalle(registro) {
  try {
    // Asegurar que los campos JSON se parseen correctamente si vienen como strings
    const registroParseado = {
      ...registro,
      cambios: registro.cambios 
        ? (typeof registro.cambios === 'string' ? JSON.parse(registro.cambios) : registro.cambios)
        : null,
      datos_anteriores: registro.datos_anteriores
        ? (typeof registro.datos_anteriores === 'string' ? JSON.parse(registro.datos_anteriores) : registro.datos_anteriores)
        : null,
      datos_nuevos: registro.datos_nuevos
        ? (typeof registro.datos_nuevos === 'string' ? JSON.parse(registro.datos_nuevos) : registro.datos_nuevos)
        : null,
      detalles: registro.detalles
        ? (typeof registro.detalles === 'string' ? JSON.parse(registro.detalles) : registro.detalles)
        : null,
      metadata: registro.metadata
        ? (typeof registro.metadata === 'string' ? JSON.parse(registro.metadata) : registro.metadata)
        : null
    }
    registroSeleccionado.value = registroParseado
    console.log('Registro seleccionado:', registroParseado)
  } catch (error) {
    console.error('Error parseando registro:', error)
    // Si hay error al parsear, usar el registro original
    registroSeleccionado.value = registro
  }
}

function cerrarDetalle() {
  registroSeleccionado.value = null
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatValue(value) {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') {
    // Si es un objeto, intentar formatearlo de manera más legible
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Vacío'
    }
    // Para objetos, mostrar campos clave
    const keys = Object.keys(value)
    if (keys.length === 0) return 'Objeto vacío'
    if (keys.length <= 3) {
      return keys.map(k => `${formatFieldName(k)}: ${formatValue(value[k])}`).join(', ')
    }
    return `${keys.length} campos`
  }
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...'
  }
  return String(value)
}

function formatFieldName(fieldName) {
  // Convertir nombres de campos de snake_case o camelCase a formato legible
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function getTipoAccionLabel(tipo) {
  const labels = {
    'CREATE': 'Crear',
    'UPDATE': 'Actualizar',
    'DELETE': 'Eliminar',
    'GENERATE': 'Generar',
    'REGISTER': 'Registrar',
    'CANCEL': 'Cancelar',
    'APPROVE': 'Aprobar',
    'REJECT': 'Rechazar'
  }
  return labels[tipo] || tipo
}

function getTipoAccionClass(tipo) {
  const classes = {
    'CREATE': 'bg-green-100 text-green-800',
    'UPDATE': 'bg-blue-100 text-blue-800',
    'DELETE': 'bg-red-100 text-red-800',
    'GENERATE': 'bg-purple-100 text-purple-800',
    'REGISTER': 'bg-indigo-100 text-indigo-800',
    'CANCEL': 'bg-yellow-100 text-yellow-800',
    'APPROVE': 'bg-emerald-100 text-emerald-800',
    'REJECT': 'bg-rose-100 text-rose-800'
  }
  return classes[tipo] || 'bg-gray-100 text-gray-800'
}

function getEntidadLabel(entidad) {
  const labels = {
    'natillera': 'Natillera',
    'socio': 'Socio',
    'socio_natillera': 'Socio en Natillera',
    'cuota': 'Cuota',
    'pago': 'Pago',
    'comprobante': 'Comprobante',
    'prestamo': 'Préstamo',
    'pago_prestamo': 'Pago de Préstamo',
    'actividad': 'Actividad',
    'multa': 'Multa',
    'configuracion': 'Configuración'
  }
  return labels[entidad] || entidad
}

function getEntidadClass(entidad) {
  const classes = {
    'natillera': 'bg-natillera-100 text-natillera-800',
    'socio': 'bg-blue-100 text-blue-800',
    'socio_natillera': 'bg-cyan-100 text-cyan-800',
    'cuota': 'bg-green-100 text-green-800',
    'pago': 'bg-emerald-100 text-emerald-800',
    'comprobante': 'bg-purple-100 text-purple-800',
    'prestamo': 'bg-orange-100 text-orange-800',
    'pago_prestamo': 'bg-amber-100 text-amber-800',
    'actividad': 'bg-pink-100 text-pink-800',
    'multa': 'bg-red-100 text-red-800',
    'configuracion': 'bg-gray-100 text-gray-800'
  }
  return classes[entidad] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

/* Estilos para select con icono */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em 1.25em;
  padding-right: 2.5rem;
}

select:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
}
</style>


<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 oscuro:from-natillera-500/15 to-emerald-200/20 oscuro:to-emerald-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 oscuro:from-teal-500/15 to-natillera-200/20 oscuro:to-natillera-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Header estilizado -->
    <div class="relative">
      <div class="relative bg-gradient-to-br from-superficie-tarjeta via-natillera-50/50 oscuro:via-natillera-500/10 to-emerald-50/30 oscuro:to-emerald-500/10 rounded-3xl p-6 sm:p-8 border border-natillera-200/50 oscuro:border-natillera-500/30 shadow-xl backdrop-blur-sm overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <ClipboardDocumentListIcon class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-gray-800 via-natillera-700 oscuro:from-texto-fuerte oscuro:via-natillera-300 oscuro:to-emerald-300 to-emerald-700 bg-clip-text text-transparent">
                Auditoría del Sistema
              </h1>
              <p class="text-texto-secundario mt-1 text-sm sm:text-base font-medium">
                Trazabilidad completa de todos los movimientos y modificaciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Filtros -->
      <div class="card bg-gradient-to-br from-superficie-tarjeta via-natillera-50/50 oscuro:via-natillera-500/10 to-emerald-50/30 oscuro:to-emerald-500/10 border border-natillera-200/50 oscuro:border-natillera-500/30 mb-6 relative overflow-hidden">
        <!-- Círculos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-natillera-400/20 to-emerald-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-400/20 to-natillera-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative z-10">
          <!-- Header -->
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-borde/50">
            <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-500/30 flex-shrink-0">
              <FunnelIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-display font-bold text-texto">
                Filtros de Búsqueda
              </h2>
              <p class="text-sm text-texto-secundario mt-1">Personaliza tu consulta de auditoría</p>
            </div>
          </div>
          
          <!-- Campos del formulario -->
          <div class="space-y-5">
            <!-- Primera fila: Filtros principales -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Filtro por Entidad -->
              <div class="space-y-2 min-w-0">
                <label class="flex items-center gap-2 text-sm font-semibold text-texto-medio">
                  <div class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <span class="truncate">Entidad</span>
                </label>
                <div class="relative">
                  <select
                    v-model="filtros.entidad"
                    @change="aplicarFiltros"
                    class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-superficie-tarjeta focus:bg-superficie-tarjeta transition-colors text-sm"
                  >
                    <option value="">Todas las entidades</option>
                    <option v-for="e in ENTIDADES" :key="e.valor" :value="e.valor">{{ e.etiqueta }}</option>
                  </select>
                  <!-- `appearance-none` quita la flecha nativa (en iOS no queda ninguna): se pone una propia. -->
                  <ChevronDownIcon class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden="true" />
                  <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-texto-tenue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Filtro por Tipo de Acción -->
              <div class="space-y-2 min-w-0">
                <label class="flex items-center gap-2 text-sm font-semibold text-texto-medio">
                  <div class="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></div>
                  <span class="truncate">Tipo de Acción</span>
                </label>
                <div class="relative">
                  <select
                    v-model="filtros.tipoAccion"
                    @change="aplicarFiltros"
                    class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-superficie-tarjeta focus:bg-superficie-tarjeta transition-colors text-sm"
                  >
                    <option value="">Todas las acciones</option>
                    <option v-for="t in TIPOS_ACCION" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
                  </select>
                  <!-- `appearance-none` quita la flecha nativa (en iOS no queda ninguna): se pone una propia. -->
                  <ChevronDownIcon class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden="true" />
                  <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-texto-tenue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Filtro por Fecha -->
              <div class="space-y-2 min-w-0">
                <label class="flex items-center gap-2 text-sm font-semibold text-texto-medio">
                  <div class="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <span class="truncate">Rango de Fechas</span>
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1 min-w-0">
                    <input
                      v-model="filtros.fechaDesde"
                      type="date"
                      lang="es-CO"
                      class="input-field w-full pl-9 pr-3 hover:bg-superficie-tarjeta focus:bg-superficie-tarjeta transition-colors text-sm"
                    />
                    <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg class="w-4 h-4 text-texto-tenue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="relative flex-1 min-w-0">
                    <input
                      v-model="filtros.fechaHasta"
                      type="date"
                      lang="es-CO"
                      class="input-field w-full pl-9 pr-3 hover:bg-superficie-tarjeta focus:bg-superficie-tarjeta transition-colors text-sm"
                    />
                    <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg class="w-4 h-4 text-texto-tenue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Segunda fila: Filtros exclusivos de super usuario -->
            <div v-if="esSuperUsuario" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-borde/50">
              <!-- Filtro por Natillera (solo para super usuario) -->
              <div class="space-y-2 min-w-0">
                <label class="flex items-center gap-2 text-sm font-semibold text-texto-medio">
                  <div class="w-2 h-2 rounded-full bg-natillera-500 flex-shrink-0"></div>
                  <span class="truncate">Natillera</span>
                </label>
                <div class="relative">
                  <select
                    v-model="filtros.natilleraId"
                    @change="aplicarFiltros"
                    class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-superficie-tarjeta focus:bg-superficie-tarjeta transition-colors text-sm"
                  >
                    <option value="">Todas las natilleras</option>
                    <option v-for="natillera in todasLasNatilleras" :key="natillera.id" :value="natillera.id">
                      {{ natillera.nombre }}
                    </option>
                  </select>
                  <!-- `appearance-none` quita la flecha nativa (en iOS no queda ninguna): se pone una propia. -->
                  <ChevronDownIcon class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden="true" />
                  <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-texto-tenue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Filtro por Usuario (solo para super usuario) -->
              <div class="space-y-2 min-w-0">
                <label class="flex items-center gap-2 text-sm font-semibold text-texto-medio">
                  <div class="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
                  <span class="truncate">Usuario</span>
                </label>
                <div class="relative">
                  <select
                    v-model="filtros.usuarioEmail"
                    @change="aplicarFiltros"
                    class="input-field w-full pl-9 pr-8 appearance-none cursor-pointer hover:bg-superficie-tarjeta focus:bg-superficie-tarjeta transition-colors text-sm"
                  >
                    <option value="">Todos los usuarios</option>
                    <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.email">
                      {{ usuario.email }}
                    </option>
                  </select>
                  <!-- `appearance-none` quita la flecha nativa (en iOS no queda ninguna): se pone una propia. -->
                  <ChevronDownIcon class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-tenue" aria-hidden="true" />
                  <div class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-texto-tenue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <label class="sm:col-span-2 flex min-h-11 cursor-pointer touch-manipulation items-center gap-3 text-sm font-medium text-texto-medio">
                <input
                  v-model="ocultarMiActividad"
                  type="checkbox"
                  class="h-5 w-5 flex-shrink-0 cursor-pointer rounded accent-natillera-600"
                  @change="aplicarFiltros"
                />
                <span>Ocultar mi actividad <span class="text-texto-suave">({{ authStore.userEmail }})</span></span>
              </label>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-3 mt-8 pt-6 border-t border-borde/50">
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
      <div class="bg-superficie-tarjeta rounded-2xl shadow-lg border border-borde overflow-hidden">
        <!-- Header de la tabla -->
        <div class="px-6 py-4 border-b border-borde bg-gradient-to-r from-superficie-suave to-superficie-tarjeta">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-texto">
              Registros de Auditoría
              <span v-if="totalRegistros > 0" class="text-sm font-normal text-texto-suave ml-2">
                ({{ totalRegistros }} registros)
              </span>
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-texto-suave">Mostrar:</span>
              <select
                v-model="filtros.limit"
                @change="aplicarFiltros"
                class="px-3 py-1.5 border border-borde-fuerte rounded-lg focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
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
        <CargaCaja v-if="loading" texto="Cargando registros" />

        <!-- Tabla -->
        <div v-else-if="registros.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-superficie-suave">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-texto-secundario uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-texto-secundario uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-texto-secundario uppercase tracking-wider">Acción</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-texto-secundario uppercase tracking-wider">Entidad</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-texto-secundario uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-texto-secundario uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-borde">
              <tr
                v-for="registro in registros"
                :key="registro.id"
                class="hover:bg-superficie-suave transition-colors cursor-pointer"
                @click="verDetalle(registro)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-texto-fuerte">
                    {{ formatDate(registro.created_at) }}
                  </div>
                  <div class="text-xs text-texto-suave">
                    {{ formatTime(registro.created_at) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-texto-fuerte">
                    {{ registro.usuario_email || 'Usuario eliminado' }}
                  </div>
                  <div v-if="registro.natillera_nombre" class="text-xs text-texto-suave">
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
                    {{ getTipoAccionLabel(registro.tipo_accion, registro) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      getEntidadClass(registro.entidad)
                    ]"
                  >
                    {{ getEntidadLabel(registro.entidad, registro) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-texto-fuerte max-w-md">
                    {{ registro.descripcion }}
                  </div>
                  <div
                    v-if="dispositivoDe(registro)"
                    class="mt-1 inline-flex max-w-md items-center gap-1.5 rounded-full bg-superficie-hundida px-2 py-0.5 text-xs font-medium text-texto-secundario"
                  >
                    <DevicePhoneMobileIcon v-if="dispositivoDe(registro).tipo !== 'escritorio'" class="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <ComputerDesktopIcon v-else class="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span class="truncate">{{ dispositivoDe(registro).etiqueta }}</span>
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
          <ClipboardDocumentListIcon class="w-16 h-16 text-gray-300 oscuro:text-texto-tenue mx-auto mb-4" />
          <p class="text-texto-suave text-lg">No se encontraron registros</p>
          <p class="text-texto-tenue text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalRegistros > filtros.limit" class="mt-6 flex items-center justify-between">
        <div class="text-sm text-texto-suave">
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
                : 'bg-superficie-hundida text-texto-tenue cursor-not-allowed'
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
                : 'bg-superficie-hundida text-texto-tenue cursor-not-allowed'
            ]"
          >
            Siguiente
          </button>
        </div>
      </div>

    <!-- Modal de Detalle -->
    <ModalWrapper
      :show="!!registroSeleccionado"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative bg-superficie-tarjeta rounded-2xl text-left overflow-hidden shadow-xl w-full max-w-4xl flex flex-col min-h-0 max-h-[90vh] supports-[height:100dvh]:max-h-[90dvh]"
      card-max-width="56rem"
      @close="cerrarDetalle"
    >
            <!-- Header del Modal -->
            <div class="flex-shrink-0 bg-gradient-to-r from-natillera-500 to-natillera-600 px-6 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div class="flex items-center justify-between gap-3">
                <h3 class="min-w-0 text-xl font-bold text-white">
                  Detalle del Registro de Auditoría
                </h3>
                <!-- tema-fijo: X sobre la cabecera verde del detalle -->
                <button class="-mr-2 flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-gray-200"
                  type="button"
                  aria-label="Cerrar detalle"
                  @click="cerrarDetalle"
                >
                  <XMarkIcon class="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            <!-- Contenido del Modal: el scroll lo lleva este bloque y no un `max-h-[70vh]`
                 fijo, que en iOS (vh = alto con la barra recogida) dejaba el pie fuera de pantalla. -->
            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-6 py-6">
              <!-- Información General -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-superficie-suave rounded-xl p-4">
                  <p class="text-xs text-texto-suave mb-1">Fecha y Hora</p>
                  <p class="font-semibold text-texto-fuerte">
                    {{ formatDate(registroSeleccionado.created_at) }} {{ formatTime(registroSeleccionado.created_at) }}
                  </p>
                </div>
                <div class="bg-superficie-suave rounded-xl p-4">
                  <p class="text-xs text-texto-suave mb-1">Usuario</p>
                  <p class="font-semibold text-texto-fuerte">
                    {{ registroSeleccionado.usuario_email || 'Usuario eliminado' }}
                  </p>
                </div>
                <div class="bg-superficie-suave rounded-xl p-4">
                  <p class="text-xs text-texto-suave mb-1">Tipo de Acción</p>
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                      getTipoAccionClass(registroSeleccionado.tipo_accion)
                    ]"
                  >
                    {{ getTipoAccionLabel(registroSeleccionado.tipo_accion, registroSeleccionado) }}
                  </span>
                </div>
                <div class="bg-superficie-suave rounded-xl p-4">
                  <p class="text-xs text-texto-suave mb-1">Entidad</p>
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-xs font-medium',
                      getEntidadClass(registroSeleccionado.entidad)
                    ]"
                  >
                    {{ getEntidadLabel(registroSeleccionado.entidad, registroSeleccionado) }}
                  </span>
                </div>
              </div>

              <!-- Descripción -->
              <div class="mb-6">
                <h4 class="text-sm font-semibold text-texto-medio mb-2">Descripción</h4>
                <p class="text-texto-fuerte bg-superficie-suave rounded-xl p-4">
                  {{ registroSeleccionado.descripcion }}
                </p>
              </div>

              <!-- Dispositivo: en los registros de sesión es lo que más se consulta -->
              <div v-if="dispositivoDe(registroSeleccionado)" class="mb-6">
                <h4 class="text-sm font-semibold text-texto-medio mb-2">Dispositivo</h4>
                <div class="rounded-xl bg-superficie-suave p-4">
                  <p class="font-semibold text-texto-fuerte">{{ dispositivoDe(registroSeleccionado).etiqueta }}</p>
                  <p class="mt-1 text-xs text-texto-suave">
                    <template v-if="dispositivoDe(registroSeleccionado).navegador">Navegador: {{ dispositivoDe(registroSeleccionado).navegador }} · </template>
                    <template v-if="dispositivoDe(registroSeleccionado).modoApp">
                      {{ dispositivoDe(registroSeleccionado).modoApp === 'app' ? 'Abierta desde la app instalada' : 'Abierta desde el navegador' }}
                    </template>
                    <template v-else>Sin dato de si era la app instalada (registro anterior)</template>
                  </p>
                </div>
              </div>

              <!-- Cambios (si es UPDATE) -->
              <div v-if="registroSeleccionado.cambios && Object.keys(registroSeleccionado.cambios).length > 0" class="mb-6">
                <h4 class="text-sm font-semibold text-texto-medio mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 bg-natillera-500 rounded-full"></span>
                  Cambios Realizados
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="(cambio, campo) in registroSeleccionado.cambios"
                    :key="campo"
                    class="bg-gradient-to-r from-superficie-suave to-superficie-tarjeta rounded-xl p-5 border border-borde shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p class="text-sm font-bold text-texto mb-3 uppercase tracking-wide">
                      {{ formatFieldName(campo) }}
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="bg-red-50 oscuro:bg-red-500/15 rounded-lg p-4 border-l-4 border-red-500">
                        <p class="text-xs font-semibold text-red-700 oscuro:text-red-300 mb-2 flex items-center gap-2">
                          <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Valor Anterior
                        </p>
                        <p class="text-base text-red-900 oscuro:text-red-300 font-semibold break-words">
                          {{ formatValue(cambio.anterior) }}
                        </p>
                      </div>
                      <div class="bg-green-50 oscuro:bg-green-500/15 rounded-lg p-4 border-l-4 border-green-500">
                        <p class="text-xs font-semibold text-green-700 oscuro:text-green-300 mb-2 flex items-center gap-2">
                          <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Valor Nuevo
                        </p>
                        <p class="text-base text-green-900 oscuro:text-green-300 font-semibold break-words">
                          {{ formatValue(cambio.nuevo) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mostrar cambios también si hay datos_anteriores y datos_nuevos pero no cambios calculados -->
              <div v-else-if="registroSeleccionado.datos_anteriores && registroSeleccionado.datos_nuevos && registroSeleccionado.tipo_accion === 'UPDATE'" class="mb-6">
                <h4 class="text-sm font-semibold text-texto-medio mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 bg-natillera-500 rounded-full"></span>
                  Comparación de Datos
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-red-50 oscuro:bg-red-500/15 rounded-xl p-4 border-2 border-red-200 oscuro:border-red-500/30">
                    <h5 class="text-sm font-bold text-red-800 oscuro:text-red-300 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                      Estado Anterior
                    </h5>
                    <div class="space-y-2">
                      <div
                        v-for="(valor, campo) in registroSeleccionado.datos_anteriores"
                        :key="campo"
                        class="bg-superficie-tarjeta rounded-lg p-3 border border-red-100 oscuro:border-red-500/30"
                      >
                        <p class="text-xs font-semibold text-red-600 oscuro:text-red-300 mb-1 uppercase">{{ formatFieldName(campo) }}</p>
                        <p class="text-sm text-red-900 oscuro:text-red-300 font-medium">{{ formatValue(valor) }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-green-50 oscuro:bg-green-500/15 rounded-xl p-4 border-2 border-green-200 oscuro:border-green-500/30">
                    <h5 class="text-sm font-bold text-green-800 oscuro:text-green-300 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      Estado Nuevo
                    </h5>
                    <div class="space-y-2">
                      <div
                        v-for="(valor, campo) in registroSeleccionado.datos_nuevos"
                        :key="campo"
                        class="bg-superficie-tarjeta rounded-lg p-3 border border-green-100 oscuro:border-green-500/30"
                      >
                        <p class="text-xs font-semibold text-green-600 oscuro:text-green-300 mb-1 uppercase">{{ formatFieldName(campo) }}</p>
                        <p class="text-sm text-green-900 oscuro:text-green-300 font-medium">{{ formatValue(valor) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detalles Adicionales -->
              <div v-if="registroSeleccionado.detalles" class="mb-6">
                <h4 class="text-sm font-semibold text-texto-medio mb-3">Detalles Adicionales</h4>
                <pre class="bg-superficie-suave rounded-xl p-4 text-xs text-texto-medio overflow-x-auto">{{ JSON.stringify(registroSeleccionado.detalles, null, 2) }}</pre>
              </div>

              <!-- Datos Completos (si existen) -->
              <div v-if="registroSeleccionado.datos_anteriores || registroSeleccionado.datos_nuevos" class="grid grid-cols-2 gap-4">
                <div v-if="registroSeleccionado.datos_anteriores">
                  <h4 class="text-sm font-semibold text-texto-medio mb-3">Datos Anteriores</h4>
                  <pre class="bg-red-50 oscuro:bg-red-500/15 rounded-xl p-4 text-xs text-texto-medio overflow-x-auto max-h-64 overflow-y-auto">{{ JSON.stringify(registroSeleccionado.datos_anteriores, null, 2) }}</pre>
                </div>
                <div v-if="registroSeleccionado.datos_nuevos">
                  <h4 class="text-sm font-semibold text-texto-medio mb-3">Datos Nuevos</h4>
                  <pre class="bg-green-50 oscuro:bg-green-500/15 rounded-xl p-4 text-xs text-texto-medio overflow-x-auto max-h-64 overflow-y-auto">{{ JSON.stringify(registroSeleccionado.datos_nuevos, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <!-- Footer del Modal -->
            <div class="flex flex-shrink-0 justify-end bg-superficie-suave px-6 pt-4 pb-[calc(max(1rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))]">
              <button
                type="button"
                @click="cerrarDetalle"
                class="min-h-11 touch-manipulation px-6 py-2 bg-natillera-500 text-white rounded-xl hover:bg-natillera-600 transition-all font-medium"
              >
                Cerrar
              </button>
            </div>
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuditoria } from '../../composables/useAuditoria'
import { useNatillerasStore } from '../../stores/natilleras'
import { useUsersStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'
import ModalWrapper from '../../components/ModalWrapper.vue'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useOcultarMiActividad } from '../../composables/useOcultarMiActividad'
import { TIPOS_ACCION, ENTIDADES, etiquetaAccion, claseAccion, etiquetaEntidad, claseEntidad, esRestauracionSesion } from '../../utils/catalogoAuditoria'
import { describirDispositivo } from '../../utils/dispositivo'
import {
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const auditoria = useAuditoria()
const natillerasStore = useNatillerasStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const { ocultarMiActividad } = useOcultarMiActividad()

const loading = ref(false)
const registros = ref([])
const totalRegistros = ref(0)
const registroSeleccionado = ref(null)

// Bloquear scroll del body cuando la modal está abierta
const registroSeleccionadoOpen = computed(() => !!registroSeleccionado.value)
useBodyScrollLock(registroSeleccionadoOpen)

// Verificar si el usuario es super usuario
const esSuperUsuario = computed(() => {
  return authStore.userEmail === 'raigo.16@gmail.com'
})

// Función para obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaActual() {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
}

const filtros = ref({
  natilleraId: '',
  entidad: '',
  tipoAccion: '',
  usuarioEmail: '', // Filtro por usuario (solo para super usuario)
  fechaDesde: obtenerFechaActual(),
  fechaHasta: obtenerFechaActual(),
  limit: 50,
  offset: 0
})

const natilleras = computed(() => natillerasStore.natillerasActivas)
// Para super usuario, mostrar todas las natilleras (no solo activas)
const todasLasNatilleras = computed(() => {
  if (esSuperUsuario.value) {
    return natillerasStore.natilleras || []
  }
  return natillerasStore.natillerasActivas || []
})
const usuarios = computed(() => usersStore.users || [])

const tienePaginaAnterior = computed(() => (filtros.value.offset || 0) > 0)
const tienePaginaSiguiente = computed(() => {
  const offset = filtros.value.offset || 0
  const limit = filtros.value.limit || 50
  return offset + limit < totalRegistros.value
})

onMounted(async () => {
  // Cargar natilleras (para super usuario cargará todas, para otros solo las suyas)
  await natillerasStore.fetchNatilleras()
  // Cargar usuarios solo si es super usuario
  if (esSuperUsuario.value) {
    await usersStore.fetchUsers()
  }
  await cargarRegistros()
})

async function cargarRegistros() {
  loading.value = true
  try {
    const filtrosAplicar = {
      natilleraId: filtros.value.natilleraId || undefined,
      entidad: filtros.value.entidad || undefined,
      tipoAccion: filtros.value.tipoAccion || undefined,
      usuarioEmail: filtros.value.usuarioEmail || undefined, // Filtro por usuario (solo para super usuario)
      // Si eligió su propio correo en «Usuario», quiere verse: el filtro explícito manda.
      excluirEmail: esSuperUsuario.value && ocultarMiActividad.value && !filtros.value.usuarioEmail
        ? authStore.userEmail
        : undefined,
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
    usuarioEmail: '', // Limpiar también el filtro de usuario
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
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
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

/*
 * Etiquetas y colores salen del catálogo único (utils/catalogoAuditoria). Las restauraciones
 * de sesión antiguas, que se guardaron como «inició sesión», se muestran como lo que son.
 */
function getTipoAccionLabel(tipo, registro = null) {
  if (esRestauracionSesion(registro)) return 'Sesión reanudada'
  return etiquetaAccion(tipo)
}

function getTipoAccionClass(tipo) {
  return claseAccion(tipo)
}

function getEntidadLabel(entidad, registro = null) {
  if (esRestauracionSesion(registro)) return 'Sesión'
  return etiquetaEntidad(entidad)
}

function getEntidadClass(entidad) {
  return claseEntidad(entidad)
}

/**
 * Dispositivo de un registro de sesión: el que guardó el cliente (registros nuevos) o el
 * deducido del user agent (anteriores). Solo para sesión: en el resto no aporta.
 */
function dispositivoDe(registro) {
  if (!registro) return null
  const esSesion = registro.entidad === 'sesion' || esRestauracionSesion(registro)
  if (!esSesion) return null
  const detalles = typeof registro.detalles === 'string' ? safeJson(registro.detalles) : registro.detalles
  if (detalles?.dispositivo?.etiqueta) return detalles.dispositivo
  const ua = detalles?.user_agent || registro.user_agent
  return ua ? describirDispositivo(ua) : null
}

function safeJson(texto) {
  try { return JSON.parse(texto) } catch { return null }
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


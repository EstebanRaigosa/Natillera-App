<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-6 sm:space-y-8 relative pb-6">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Header en tarjeta: título arriba; en móvil botón abajo dentro de la tarjeta, en desktop botón a la derecha -->
    <div class="relative">
      <Breadcrumbs />
      <div class="bg-gradient-to-br from-white via-emerald-50/50 to-teal-100/70 rounded-2xl p-4 sm:p-6 border border-gray-200/80 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0 w-full sm:w-auto sm:flex-1">
            <BackButton :to="`/natilleras/${id}`" :inline="true" />
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-natillera-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <CalendarIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div class="min-w-0">
              <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">Actividades</h1>
              <p class="text-gray-500 mt-0.5 text-xs sm:text-sm leading-snug">Rifas, eventos y otras actividades del fondo</p>
            </div>
          </div>
          <div class="w-full sm:w-auto flex-shrink-0">
            <button
              @click="modalNuevaActividad = true"
              class="w-full sm:w-auto btn-accent inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all rounded-xl py-3 sm:py-2.5 sm:px-5 text-sm sm:text-base font-semibold leading-tight"
            >
              <PlusIcon class="w-5 h-5 flex-shrink-0" />
              <span>Nueva Actividad</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Bienvenida / Tutorial -->
    <div v-if="mostrarModalBienvenida" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cerrarModalBienvenida"></div>
      <div class="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-accent-500 via-orange-500 to-amber-600 p-6 sm:p-8 text-white relative overflow-hidden flex-shrink-0">
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <CalendarIcon class="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 class="text-2xl sm:text-3xl font-display font-bold">
                    ¡Bienvenido a Actividades! 🎉
                  </h2>
                  <p class="text-white/90 text-sm mt-1">Aprende cómo crear y gestionar actividades</p>
                </div>
              </div>
              <button 
                @click="cerrarModalBienvenida"
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
        <div class="flex-1 overflow-y-auto p-6 sm:p-8">
          <div class="space-y-6">
            <!-- Sección: Tipos de Actividades -->
            <div class="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 rounded-2xl p-6 border-2 border-blue-200/50">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CurrencyDollarIcon class="w-6 h-6 text-white" />
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-display font-bold text-gray-800 mb-2">Tipos de Actividades</h3>
                  <p class="text-gray-600 text-sm mb-4">Existen dos formas de registrar actividades en el sistema:</p>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <!-- Liquidar Actividad -->
                <div class="bg-white rounded-xl p-5 border-2 border-green-200/50 shadow-md">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <span class="text-xl">💰</span>
                    </div>
                    <h4 class="font-bold text-gray-800">Liquidar Actividad</h4>
                  </div>
                  <p class="text-sm text-gray-600 mb-3">
                    Usa esta opción cuando la actividad ya terminó y conoces los resultados finales.
                  </p>
                  <ul class="space-y-2 text-xs text-gray-600">
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-1">✓</span>
                      <span>Ingresa los <strong>ingresos</strong> totales generados</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-1">✓</span>
                      <span>Registra los <strong>gastos</strong> incurridos (opcional)</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-500 mt-1">✓</span>
                      <span>La <strong>utilidad</strong> se calcula automáticamente</span>
                    </li>
                  </ul>
                </div>

                <!-- Actividad en Curso -->
                <div class="bg-white rounded-xl p-5 border-2 border-amber-200/50 shadow-md">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <span class="text-xl">🔄</span>
                    </div>
                    <h4 class="font-bold text-gray-800">Actividad en Curso</h4>
                  </div>
                  <p class="text-sm text-gray-600 mb-3">
                    Usa esta opción cuando la actividad apenas comienza y necesitas recaudar dinero.
                  </p>
                  <ul class="space-y-2 text-xs text-gray-600">
                    <li class="flex items-start gap-2">
                      <span class="text-amber-500 mt-1">✓</span>
                      <span>Asigna valores a pagar por cada socio</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-500 mt-1">✓</span>
                      <span>Define el <strong>período</strong> de pago (mes y año)</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-500 mt-1">✓</span>
                      <span>Selecciona la <strong>quincena</strong> si aplica</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-500 mt-1">✓</span>
                      <span>Puedes repetirla en <strong>varios meses</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Sección: Múltiples Meses -->
            <div class="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 rounded-2xl p-6 border-2 border-emerald-200/50">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-display font-bold text-gray-800 mb-2">Actividades Recurrentes</h3>
                  <p class="text-gray-600 text-sm mb-4">
                    Puedes crear actividades que se repitan en varios meses del período de la natillera.
                  </p>
                </div>
              </div>

              <div class="bg-white rounded-xl p-5 border-2 border-emerald-200/50">
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800 text-sm mb-1">Activa el switch "Varios meses"</p>
                      <p class="text-xs text-gray-600">Se mostrará un panel con todos los meses del período de la natillera</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800 text-sm mb-1">Selecciona los meses</p>
                      <p class="text-xs text-gray-600">Marca con checkboxes los meses en los que se debe pagar la actividad</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span class="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800 text-sm mb-1">Elige la quincena (si aplica)</p>
                      <p class="text-xs text-gray-600">Si la natillera es quincenal, selecciona si el pago será en la primera o segunda quincena de cada mes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sección: Valores -->
            <div class="bg-gradient-to-br from-purple-50 via-pink-50/50 to-rose-50/30 rounded-2xl p-6 border-2 border-purple-200/50">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-display font-bold text-gray-800 mb-2">Asignación de Valores</h3>
                  <p class="text-gray-600 text-sm mb-4">
                    Para actividades en curso, puedes asignar valores de dos formas:
                  </p>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl p-4 border-2 border-purple-200/50">
                  <h4 class="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span>✓</span>
                    <span>Valores Iguales</span>
                  </h4>
                  <p class="text-xs text-gray-600">
                    Todos los socios pagarán el mismo valor. Útil para rifas o eventos donde todos participan igual.
                  </p>
                </div>
                <div class="bg-white rounded-xl p-4 border-2 border-purple-200/50">
                  <h4 class="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span>✓</span>
                    <span>Valores Diferentes</span>
                  </h4>
                  <p class="text-xs text-gray-600">
                    Asigna un valor personalizado a cada socio. Útil cuando algunos socios participan más que otros.
                  </p>
                </div>
              </div>
            </div>

            <!-- Nota importante -->
            <div class="bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30 rounded-xl p-5 border-2 border-amber-300/50">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="font-bold text-gray-800 text-sm mb-2">💡 Consejo</h4>
                  <p class="text-xs text-gray-700 leading-relaxed">
                    Si hay socios con periodicidad <strong>mensual</strong> en una natillera <strong>quincenal</strong>, 
                    la fecha de pago se establecerá automáticamente en la <strong>segunda quincena</strong> del mes seleccionado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 sm:p-6 flex-shrink-0">
          <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="noMostrarDeNuevo"
                class="w-4 h-4 text-natillera-500 border-gray-300 rounded focus:ring-natillera-500"
              />
              <span class="text-sm text-gray-600">No mostrar este mensaje de nuevo</span>
            </label>
            <button 
              @click="cerrarModalBienvenida"
              class="btn-accent px-6 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Entendido, ¡empecemos!
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tarjetas de resumen financiero (blanco, icono en círculo, valor, etiqueta mayúsculas) -->
    <div class="grid grid-cols-3 gap-2 sm:gap-4">
      <div class="card rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center text-center min-w-0">
        <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-natillera-100 flex items-center justify-center mb-2 sm:mb-3 flex-shrink-0">
          <CurrencyDollarIcon class="w-5 h-5 sm:w-7 sm:h-7 text-natillera-600" />
        </div>
        <p class="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 leading-tight break-all">
          <span class="sm:hidden">${{ formatMoneyCompact(totalIngresos) }}</span>
          <span class="hidden sm:inline">${{ formatMoney(totalIngresos) }}</span>
        </p>
        <p class="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">Ingresos</p>
      </div>
      <div class="card rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center text-center min-w-0">
        <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-red-100 flex items-center justify-center mb-2 sm:mb-3 flex-shrink-0">
          <CurrencyDollarIcon class="w-5 h-5 sm:w-7 sm:h-7 text-red-600" />
        </div>
        <p class="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 leading-tight break-all">
          <span class="sm:hidden">${{ formatMoneyCompact(totalGastos) }}</span>
          <span class="hidden sm:inline">${{ formatMoney(totalGastos) }}</span>
        </p>
        <p class="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">Gastos</p>
      </div>
      <div class="card rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center text-center min-w-0">
        <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 sm:mb-3 flex-shrink-0">
          <BanknotesIcon class="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
        </div>
        <p class="text-base sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 leading-tight break-all">
          <span class="sm:hidden">${{ formatMoneyCompact(utilidadTotal) }}</span>
          <span class="hidden sm:inline">${{ formatMoney(utilidadTotal) }}</span>
        </p>
        <p class="text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">Utilidad</p>
      </div>
    </div>

    <!-- Selector de vista Normal / Agrupada (solo si hay actividades) -->
    <div class="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm overflow-hidden">
      <button
        @click="vistaAgrupada = false"
        :class="[
          'flex-1 px-3 sm:px-4 py-2.5 rounded-lg text-[13px] sm:text-sm font-medium transition-all leading-tight min-h-[44px]',
          !vistaAgrupada
            ? 'bg-natillera-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        ]"
      >
        Normal
      </button>
      <button
        @click="vistaAgrupada = true"
        :class="[
          'flex-1 px-3 sm:px-4 py-2.5 rounded-lg text-[13px] sm:text-sm font-medium transition-all leading-tight min-h-[44px]',
          vistaAgrupada
            ? 'bg-natillera-500 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        ]"
      >
        Agrupada
      </button>
    </div>

    <!-- Lista vacía -->
    <div v-if="actividades.length === 0" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-6 sm:p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
      <div class="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-natillera-400/10 to-emerald-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-teal-400/10 to-natillera-400/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-accent-500/30">
          <CalendarIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h3 class="font-display font-bold text-gray-800 text-lg sm:text-xl md:text-2xl mb-2 leading-tight px-2">
          No hay actividades registradas
        </h3>
        <p class="text-gray-600 mb-6 sm:mb-8 text-xs sm:text-sm md:text-base leading-snug px-2">
          Las actividades generan fondos adicionales para la natillera
        </p>
        <button @click="modalNuevaActividad = true" class="btn-accent inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base font-semibold py-3 px-5 touch-manipulation">
          <PlusIcon class="w-5 h-5 flex-shrink-0" />
          <span>Crear Actividad</span>
        </button>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Vista Normal: Todas las actividades sin agrupar (estilo referencia) -->
      <div v-if="!vistaAgrupada" class="space-y-4">
        <div 
          v-for="actividad in actividades" 
          :key="actividad.id"
          @click="actividad.tipo === 'rifa' && actividad.estado === 'liquidada' ? abrirModalGanadorRifa(actividad) : (actividad.estado === 'en_curso' ? verDetalleActividad(actividad) : null)"
          :class="[
            'card rounded-2xl p-3 sm:p-5 transition-all duration-300',
            (actividad.estado === 'en_curso' || (actividad.tipo === 'rifa' && actividad.estado === 'liquidada')) ? 'cursor-pointer hover:shadow-2xl' : ''
          ]"
        >
          <div class="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                <component :is="getIconoActividad(actividad.tipo, actividad.tipo_rifa)" class="w-5 h-5 sm:w-7 sm:h-7 text-accent-600" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-display font-bold text-gray-800 text-base sm:text-lg leading-snug line-clamp-2">
                  {{ actividad.descripcion }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-500 mt-0.5 leading-tight">
                  {{ formatDate(actividad.created_at) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 leading-tight">
                {{ (actividad.tipo || 'otro').toLowerCase() }}
              </span>
              <span 
                v-if="actividad.estado === 'en_curso'"
                class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-amber-100 text-amber-700 leading-tight whitespace-nowrap"
              >
                En curso
              </span>
              <span 
                v-if="actividad.estado === 'liquidada'"
                class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700 leading-tight whitespace-nowrap"
              >
                Finalizada
              </span>
              <button
                @click.stop="confirmarEliminarActividad(actividad)"
                class="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                title="Eliminar actividad"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Vista para actividades liquidadas -->
          <template v-if="actividad.estado === 'liquidada' || !actividad.estado">
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <div class="rounded-xl p-2 sm:p-3 bg-green-50 border border-green-200/50 min-w-0">
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Ingresos</p>
                <p class="font-bold text-green-600 text-xs sm:text-sm leading-tight break-all">
                  <span class="sm:hidden">${{ formatMoneyCompact(actividad.ingresos) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividad.ingresos) }}</span>
                </p>
              </div>
              <div class="rounded-xl p-2 sm:p-3 bg-red-50 border border-red-200/50 min-w-0">
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Gastos</p>
                <p class="font-bold text-red-600 text-xs sm:text-sm leading-tight break-all">
                  <span class="sm:hidden">${{ formatMoneyCompact(actividad.gastos) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividad.gastos) }}</span>
                </p>
              </div>
              <div class="rounded-xl p-2 sm:p-3 bg-purple-50 border border-purple-200/50 min-w-0">
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Utilidad</p>
                <p class="font-bold text-purple-600 text-xs sm:text-sm leading-tight break-all">
                  <span class="sm:hidden">${{ formatMoneyCompact(actividad.utilidad) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividad.utilidad) }}</span>
                </p>
              </div>
            </div>
          </template>

          <!-- Vista para actividades en curso: Fecha límite, Total asignado, Total recaudado -->
          <template v-else>
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <div class="rounded-xl p-2 sm:p-3 bg-amber-50 border border-amber-200/50 min-w-0">
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Fecha límite</p>
                <p class="font-bold text-amber-700 text-xs sm:text-sm leading-tight">
                  {{ actividad.fecha_limite_pago ? formatDate(actividad.fecha_limite_pago) : '—' }}
                </p>
              </div>
              <div class="rounded-xl p-2 sm:p-3 bg-blue-50 border border-blue-200/50 min-w-0">
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Total asignado</p>
                <p class="font-bold text-blue-600 text-xs sm:text-sm leading-tight break-all">
                  <span class="sm:hidden">${{ formatMoneyCompact(actividad.total_asignado || 0) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividad.total_asignado || 0) }}</span>
                </p>
              </div>
              <div class="rounded-xl p-2 sm:p-3 bg-green-50 border border-green-200/50 min-w-0">
                <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Total recaudado</p>
                <p class="font-bold text-green-600 text-xs sm:text-sm leading-tight break-all">
                  <span class="sm:hidden">${{ formatMoneyCompact(actividad.total_pagado || 0) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividad.total_pagado || 0) }}</span>
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Vista Agrupada: Grupos colapsables y actividades individuales -->
      <div v-else class="space-y-6">
        <!-- Grupos de actividades y actividades individuales -->
        <template v-for="(item, index) in actividadesAgrupadas" :key="item.tipo === 'grupo' ? item.serieId : (item.actividad?.id || `individual-${index}`)">
          <!-- Grupo de actividades (serie) - Tarjeta + contenedor integrados en un solo bloque -->
          <template v-if="item.tipo === 'grupo'">
            <div class="rounded-2xl overflow-hidden shadow-md shadow-indigo-900/5 border border-indigo-200/60 border-l-4 border-l-indigo-400">
              <!-- Encabezado del grupo: en móvil dos filas (título+chevron / subtítulo+acciones) para que no se vea apretado -->
              <div 
                @click="toggleGrupo(item.serieId)"
                :class="[
                  'p-3 sm:p-5 cursor-pointer transition-all duration-300 min-h-[72px]',
                  'bg-gradient-to-r from-indigo-50 via-violet-50/90 to-purple-50/80',
                  'hover:from-indigo-100 hover:via-violet-100/90 hover:to-purple-100/80 hover:shadow-lg hover:shadow-indigo-200/30',
                  isGrupoExpandido(item.serieId) ? 'rounded-b-none' : 'rounded-2xl'
                ]"
              >
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <!-- Fila 1 móvil / bloque izquierdo desktop: icono + título + (subtítulo solo sm) + badge + chevron -->
                  <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CubeIcon class="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-display font-bold text-gray-800 text-base sm:text-xl mb-0.5 leading-snug line-clamp-2">
                        {{ item.descripcionBase }}
                      </h3>
                      <p class="hidden sm:block text-xs sm:text-sm text-indigo-700/90 font-medium leading-tight">
                        <span v-if="!isGrupoExpandido(item.serieId)">
                          Toca para ver {{ item.actividades.length }} {{ item.actividades.length === 1 ? 'actividad' : 'actividades' }}
                        </span>
                        <span v-else class="text-indigo-600">
                          {{ item.actividades.length }} {{ item.actividades.length === 1 ? 'actividad' : 'actividades' }} — toca de nuevo para cerrar
                        </span>
                      </p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="hidden sm:inline-flex px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold bg-indigo-200/80 text-indigo-800 leading-tight whitespace-nowrap">
                        Grupo
                      </span>
                      <div 
                        class="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all duration-300 touch-manipulation"
                        :class="isGrupoExpandido(item.serieId) ? 'bg-indigo-500 text-white shadow-md' : 'bg-indigo-200/70 text-indigo-700'"
                      >
                        <ChevronDownIcon class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': isGrupoExpandido(item.serieId) }" />
                      </div>
                    </div>
                  </div>
                  <!-- Fila 2 móvil / bloque derecho desktop: subtítulo (solo móvil) + botones -->
                  <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <p class="sm:hidden w-full text-xs text-indigo-700/90 font-medium leading-tight">
                      <span v-if="!isGrupoExpandido(item.serieId)">
                        Toca para ver {{ item.actividades.length }} {{ item.actividades.length === 1 ? 'actividad' : 'actividades' }}
                      </span>
                      <span v-else class="text-indigo-600">
                        {{ item.actividades.length }} {{ item.actividades.length === 1 ? 'actividad' : 'actividades' }} — toca para cerrar
                      </span>
                    </p>
                    <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      @click.stop="confirmarEliminarGrupo(item)"
                      class="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-red-100 rounded-xl transition-colors text-red-600 touch-manipulation"
                      title="Eliminar grupo completo"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                    <button
                      @click.stop="exportarGrupoAExcel(item)"
                      class="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-indigo-100 rounded-xl transition-colors text-indigo-600 touch-manipulation"
                      title="Exportar grupo a Excel"
                    >
                      <ArrowDownTrayIcon class="w-5 h-5" />
                    </button>
                    <button
                      v-if="item.tipoActividad === 'rifa'"
                      @click.stop="abrirModalGanadoresGrupo(item)"
                      class="flex items-center gap-1.5 px-2.5 py-2.5 min-h-[44px] sm:px-3 hover:bg-amber-100 rounded-xl transition-colors text-amber-600 touch-manipulation"
                      title="Ver ganadores"
                    >
                      <TrophyIcon class="w-5 h-5 flex-shrink-0" />
                      <span class="hidden sm:inline text-sm font-semibold">Ver ganadores</span>
                    </button>
                  </div>
                  </div>
                </div>
              </div>
              
              <!-- Contenedor de actividades expandido: animación y buen espaciado en móvil -->
              <div 
                v-show="isGrupoExpandido(item.serieId)"
                class="rounded-b-2xl bg-indigo-50/70 sm:bg-indigo-50/50 border-t border-indigo-200/80 pt-4 pb-4 px-3 sm:px-5 overflow-hidden animate-fade-in-up"
              >
                <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3 px-0.5">
                  Actividades del grupo ({{ item.actividades.length }})
                </p>
                <div class="space-y-3 sm:space-y-4">
                  <div 
                    v-for="actividad in item.actividades" 
                    :key="actividad.id"
                    @click="actividad.tipo === 'rifa' && actividad.estado === 'liquidada' ? abrirModalGanadorRifa(actividad) : (actividad.estado === 'en_curso' ? verDetalleActividad(actividad) : null)"
                    :class="[
                      'card rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-300 min-w-0 overflow-hidden',
                      (actividad.estado === 'en_curso' || (actividad.tipo === 'rifa' && actividad.estado === 'liquidada')) ? 'cursor-pointer hover:shadow-2xl active:scale-[0.99]' : ''
                    ]"
                  >
                    <div class="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
                      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                          <component :is="getIconoActividad(actividad.tipo, actividad.tipo_rifa)" class="w-5 h-5 sm:w-7 sm:h-7 text-accent-600" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <h3 class="font-display font-bold text-gray-800 text-sm sm:text-lg leading-snug line-clamp-2">
                            {{ actividad.descripcion }}
                          </h3>
                          <p class="text-xs sm:text-sm text-gray-500 mt-0.5 leading-tight">
                            {{ formatDate(actividad.created_at) }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap justify-end">
                        <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 leading-tight">
                          {{ (actividad.tipo || 'otro').toLowerCase() }}
                        </span>
                        <span 
                          v-if="actividad.estado === 'en_curso'"
                          class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-amber-100 text-amber-700 leading-tight whitespace-nowrap"
                        >
                          En curso
                        </span>
                        <span 
                          v-if="actividad.estado === 'liquidada'"
                          class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700 leading-tight whitespace-nowrap"
                        >
                          Finalizada
                        </span>
                        <button
                          @click.stop="confirmarEliminarActividad(actividad)"
                          class="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-red-50 rounded-xl transition-colors text-red-600 touch-manipulation"
                          title="Eliminar actividad"
                        >
                          <TrashIcon class="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  <template v-if="actividad.estado === 'liquidada' || !actividad.estado">
                    <div class="grid grid-cols-3 gap-2 sm:gap-3 min-w-0">
                      <div class="rounded-xl p-2 sm:p-3 bg-green-50 border border-green-200/50 min-w-0 overflow-hidden">
                        <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Ingresos</p>
                        <p class="font-bold text-green-600 text-xs sm:text-sm leading-tight break-all">
                          <span class="sm:hidden">${{ formatMoneyCompact(actividad.ingresos) }}</span>
                          <span class="hidden sm:inline">${{ formatMoney(actividad.ingresos) }}</span>
                        </p>
                      </div>
                        <div class="rounded-xl p-2 sm:p-3 bg-red-50 border border-red-200/50 min-w-0">
                          <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Gastos</p>
                          <p class="font-bold text-red-600 text-xs sm:text-sm leading-tight break-all">
                            <span class="sm:hidden">${{ formatMoneyCompact(actividad.gastos) }}</span>
                            <span class="hidden sm:inline">${{ formatMoney(actividad.gastos) }}</span>
                          </p>
                        </div>
                        <div class="rounded-xl p-2 sm:p-3 bg-purple-50 border border-purple-200/50 min-w-0">
                          <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Utilidad</p>
                          <p class="font-bold text-purple-600 text-xs sm:text-sm leading-tight break-all">
                            <span class="sm:hidden">${{ formatMoneyCompact(actividad.utilidad) }}</span>
                            <span class="hidden sm:inline">${{ formatMoney(actividad.utilidad) }}</span>
                          </p>
                        </div>
                      </div>
                    </template>

                    <template v-else>
                      <div class="grid grid-cols-3 gap-2 sm:gap-3 min-w-0">
                        <div class="rounded-xl p-2 sm:p-3 bg-amber-50 border border-amber-200/50 min-w-0 overflow-hidden">
                          <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Fecha límite</p>
                          <p class="font-bold text-amber-700 text-xs sm:text-sm leading-tight">
                            {{ actividad.fecha_limite_pago ? formatDate(actividad.fecha_limite_pago) : '—' }}
                          </p>
                        </div>
                        <div class="rounded-xl p-2 sm:p-3 bg-blue-50 border border-blue-200/50 min-w-0">
                          <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Total asignado</p>
                          <p class="font-bold text-blue-600 text-xs sm:text-sm leading-tight break-all">
                            <span class="sm:hidden">${{ formatMoneyCompact(actividad.total_asignado || 0) }}</span>
                            <span class="hidden sm:inline">${{ formatMoney(actividad.total_asignado || 0) }}</span>
                          </p>
                        </div>
                        <div class="rounded-xl p-2 sm:p-3 bg-green-50 border border-green-200/50 min-w-0">
                          <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Total recaudado</p>
                          <p class="font-bold text-green-600 text-xs sm:text-sm leading-tight break-all">
                            <span class="sm:hidden">${{ formatMoneyCompact(actividad.total_pagado || 0) }}</span>
                            <span class="hidden sm:inline">${{ formatMoney(actividad.total_pagado || 0) }}</span>
                          </p>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
        
        <!-- Actividad individual (sin serie) - estilo referencia -->
        <template v-else-if="item.tipo === 'individual' && item.actividad && item.actividad.id">
          <div 
            :key="item.actividad.id"
            @click="item.actividad.tipo === 'rifa' && item.actividad.estado === 'liquidada' ? abrirModalGanadorRifa(item.actividad) : (item.actividad.estado === 'en_curso' ? verDetalleActividad(item.actividad) : null)"
            :class="[
              'card rounded-2xl p-3 sm:p-5 transition-all duration-300',
              (item.actividad.estado === 'en_curso' || (item.actividad.tipo === 'rifa' && item.actividad.estado === 'liquidada')) ? 'cursor-pointer hover:shadow-2xl' : ''
            ]"
          >
            <div class="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <component :is="getIconoActividad(item.actividad.tipo, item.actividad.tipo_rifa)" class="w-5 h-5 sm:w-7 sm:h-7 text-accent-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-display font-bold text-gray-800 text-base sm:text-lg leading-snug line-clamp-2">
                    {{ item.actividad.descripcion }}
                  </h3>
                  <p class="text-xs sm:text-sm text-gray-500 mt-0.5 leading-tight">
                    {{ formatDate(item.actividad.created_at) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 leading-tight">
                  {{ (item.actividad.tipo || 'otro').toLowerCase() }}
                </span>
                <span 
                  v-if="item.actividad.estado === 'en_curso'"
                  class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-amber-100 text-amber-700 leading-tight whitespace-nowrap"
                >
                  En curso
                </span>
                <span 
                  v-if="item.actividad.estado === 'liquidada'"
                  class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700 leading-tight whitespace-nowrap"
                >
                  Finalizada
                </span>
                <button
                  @click.stop="confirmarEliminarActividad(item.actividad)"
                  class="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 touch-manipulation"
                  title="Eliminar actividad"
                >
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <template v-if="item.actividad.estado === 'liquidada' || !item.actividad.estado">
              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <div class="rounded-xl p-2 sm:p-3 bg-green-50 border border-green-200/50 min-w-0">
                  <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Ingresos</p>
                  <p class="font-bold text-green-600 text-xs sm:text-sm leading-tight break-all">
                    <span class="sm:hidden">${{ formatMoneyCompact(item.actividad.ingresos) }}</span>
                    <span class="hidden sm:inline">${{ formatMoney(item.actividad.ingresos) }}</span>
                  </p>
                </div>
                <div class="rounded-xl p-2 sm:p-3 bg-red-50 border border-red-200/50 min-w-0">
                  <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Gastos</p>
                  <p class="font-bold text-red-600 text-xs sm:text-sm leading-tight break-all">
                    <span class="sm:hidden">${{ formatMoneyCompact(item.actividad.gastos) }}</span>
                    <span class="hidden sm:inline">${{ formatMoney(item.actividad.gastos) }}</span>
                  </p>
                </div>
                <div class="rounded-xl p-2 sm:p-3 bg-purple-50 border border-purple-200/50 min-w-0">
                  <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Utilidad</p>
                  <p class="font-bold text-purple-600 text-xs sm:text-sm leading-tight break-all">
                    <span class="sm:hidden">${{ formatMoneyCompact(item.actividad.utilidad) }}</span>
                    <span class="hidden sm:inline">${{ formatMoney(item.actividad.utilidad) }}</span>
                  </p>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <div class="rounded-xl p-2 sm:p-3 bg-amber-50 border border-amber-200/50 min-w-0">
                  <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Fecha límite</p>
                  <p class="font-bold text-amber-700 text-xs sm:text-sm leading-tight">
                    {{ item.actividad.fecha_limite_pago ? formatDate(item.actividad.fecha_limite_pago) : '—' }}
                  </p>
                </div>
                <div class="rounded-xl p-2 sm:p-3 bg-blue-50 border border-blue-200/50 min-w-0">
                  <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Total asignado</p>
                  <p class="font-bold text-blue-600 text-xs sm:text-sm leading-tight break-all">
                    <span class="sm:hidden">${{ formatMoneyCompact(item.actividad.total_asignado || 0) }}</span>
                    <span class="hidden sm:inline">${{ formatMoney(item.actividad.total_asignado || 0) }}</span>
                  </p>
                </div>
                <div class="rounded-xl p-2 sm:p-3 bg-green-50 border border-green-200/50 min-w-0">
                  <p class="text-[11px] sm:text-xs text-gray-500 font-medium mb-0.5 leading-tight">Total recaudado</p>
                  <p class="font-bold text-green-600 text-xs sm:text-sm leading-tight break-all">
                    <span class="sm:hidden">${{ formatMoneyCompact(item.actividad.total_pagado || 0) }}</span>
                    <span class="hidden sm:inline">${{ formatMoney(item.actividad.total_pagado || 0) }}</span>
                  </p>
                </div>
              </div>
            </template>
          </div>
        </template>
      </template>
      </div>
    </div>

    <!-- Modal Nueva Actividad -->
    <div v-if="modalNuevaActividad" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" @click="modalNuevaActividad = false"></div>
      <div class="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border border-natillera-200/60 shadow-2xl shadow-natillera-900/10 bg-gradient-to-b from-white to-natillera-50/30">
        <!-- Header con color -->
        <div class="bg-gradient-to-r from-natillera-500 via-natillera-600 to-emerald-600 px-5 py-4 flex-shrink-0 text-white">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <CalendarIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-display font-bold text-white">Nueva Actividad</h3>
              <p class="text-white/85 text-sm">Registra una nueva actividad del fondo</p>
            </div>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-natillera-50/20 to-slate-50/80">
          <form @submit.prevent="handleCrearActividad" class="p-4 sm:p-4 space-y-4">
            <!-- Bloque: Tipo de proceso -->
            <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Tipo de proceso</label>
              <div class="flex gap-2 rounded-xl bg-slate-100 p-1.5 w-full">
                <button
                  type="button"
                  @click="formActividad.tipoProceso = 'liquidar'; resetearFormularioPorTipo()"
                  :class="[
                    'flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-semibold transition-all min-h-[3rem]',
                    formActividad.tipoProceso === 'liquidar'
                      ? 'bg-white text-natillera-600 shadow-md border-2 border-natillera-200 ring-1 ring-natillera-500/20'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80'
                  ]"
                >
                  <CurrencyDollarIcon class="w-5 h-5 flex-shrink-0" />
                  Liquidar
                </button>
                <button
                  type="button"
                  @click="formActividad.tipoProceso = 'en_curso'; resetearFormularioPorTipo(); fetchNatillera()"
                  :class="[
                    'flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-semibold transition-all min-h-[3rem]',
                    formActividad.tipoProceso === 'en_curso'
                      ? 'bg-white text-natillera-600 shadow-md border-2 border-natillera-200 ring-1 ring-natillera-500/20'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50/80'
                  ]"
                >
                  <ArrowPathIcon class="w-5 h-5 flex-shrink-0" />
                  En curso
                </button>
              </div>
              <div v-if="formActividad.tipoProceso" class="mt-3 p-3 rounded-lg bg-natillera-50/80 border border-natillera-200/80">
                <p class="text-xs text-natillera-800 leading-relaxed flex items-start gap-2">
                  <InformationCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5 text-natillera-600" />
                  <span v-if="formActividad.tipoProceso === 'liquidar'">Ingresa valores finales: ingresos, gastos y utilidad.</span>
                  <span v-else>Asigna valores iniciales y haz seguimiento de pagos pendientes.</span>
                </p>
              </div>
            </div>

            <!-- Bloque: Actividad + Modo rifa (Modo rifa solo cuando tipo de proceso es "en curso") -->
            <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5 relative" :class="{ 'z-[60]': dropdownTipoActividad }">
              <div class="grid gap-4" :class="formActividad.tipoProceso === 'en_curso' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'">
                <!-- Columna: Tipo de actividad (dropdown personalizado con ítems estilizados) -->
                <div class="flex flex-col sm:min-h-[7.5rem]" :class="{ 'sm:min-h-0': formActividad.tipoProceso !== 'en_curso' }">
                  <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tipo de actividad</label>
                  <div class="relative flex-1" ref="dropdownTipoActividadRef">
                    <button
                      type="button"
                      @click.stop="dropdownTipoActividad = !dropdownTipoActividad"
                      class="w-full flex items-center gap-3 pl-4 pr-12 py-3 rounded-xl border-2 min-h-[3rem] sm:min-h-[3.25rem] transition-all text-left"
                      :class="[
                        dropdownTipoActividad ? 'border-natillera-400 ring-2 ring-natillera-500/20' : 'hover:border-slate-300',
                        formActividad.tipo === 'rifa' && 'border-l-4 border-l-natillera-500 bg-natillera-50/50',
                        formActividad.tipo === 'bingo' && 'border-l-4 border-l-amber-500 bg-amber-50/50',
                        formActividad.tipo === 'venta' && 'border-l-4 border-l-blue-500 bg-blue-50/50',
                        formActividad.tipo === 'evento' && 'border-l-4 border-l-purple-500 bg-purple-50/50',
                        formActividad.tipo === 'otro' && 'border-l-4 border-l-slate-400 bg-slate-50/80',
                        !['rifa','bingo','venta','evento','otro'].includes(formActividad.tipo) && 'border-slate-200 bg-slate-50/80'
                      ]"
                    >
                      <div class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                        :class="{
                          'bg-natillera-500': formActividad.tipo === 'rifa',
                          'bg-amber-500': formActividad.tipo === 'bingo',
                          'bg-blue-500': formActividad.tipo === 'venta',
                          'bg-purple-500': formActividad.tipo === 'evento',
                          'bg-slate-500': formActividad.tipo === 'otro'
                        }">
                        <TicketIcon v-if="formActividad.tipo === 'rifa'" class="w-5 h-5" />
                        <SparklesIcon v-else-if="formActividad.tipo === 'bingo'" class="w-5 h-5" />
                        <ShoppingBagIcon v-else-if="formActividad.tipo === 'venta'" class="w-5 h-5" />
                        <CalendarIcon v-else-if="formActividad.tipo === 'evento'" class="w-5 h-5" />
                        <ClipboardDocumentListIcon v-else class="w-5 h-5" />
                      </div>
                      <span class="flex-1 font-semibold text-slate-800">{{ opcionesTipoActividad.find(o => o.value === formActividad.tipo)?.label || 'Seleccionar' }}</span>
                      <ChevronDownIcon class="absolute right-3 w-5 h-5 text-slate-500 transition-transform" :class="{ 'rotate-180': dropdownTipoActividad }" />
                    </button>
                    <!-- Lista desplegable: Teleport para que quede por encima de todo el modal -->
                    <Teleport to="body">
                      <Transition
                        enter-active-class="transition duration-150 ease-out"
                        enter-from-class="opacity-0 scale-95"
                        enter-to-class="opacity-100 scale-100"
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100 scale-100"
                        leave-to-class="opacity-0 scale-95"
                      >
                        <div
                          v-if="dropdownTipoActividad && dropdownTipoActividadRef"
                          ref="dropdownTipoActividadPanelRef"
                          data-dropdown-tipo-actividad-panel
                          class="fixed py-2 rounded-xl bg-white border-2 border-natillera-200/80 shadow-xl shadow-natillera-900/20 max-h-[16rem] overflow-y-auto overflow-x-hidden min-w-[12rem] z-[9999]"
                          :style="dropdownTipoActividadStyle"
                        >
                          <button
                            v-for="opcion in opcionesTipoActividad"
                            :key="opcion.value"
                            type="button"
                            @click="formActividad.tipo = opcion.value; dropdownTipoActividad = false"
                            class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 first:pt-3 last:pb-3"
                            :class="formActividad.tipo === opcion.value ? 'bg-natillera-50/80' : ''"
                          >
                            <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                              :class="opcion.bgIcon">
                              <component :is="opcion.icon" class="w-5 h-5" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="font-semibold text-slate-800" :class="opcion.textColor">{{ opcion.label }}</p>
                              <p class="text-xs text-slate-500 mt-0.5">{{ opcion.desc }}</p>
                            </div>
                            <div v-if="formActividad.tipo === opcion.value" class="flex-shrink-0 w-5 h-5 rounded-full bg-natillera-500 flex items-center justify-center">
                              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            </div>
                          </button>
                        </div>
                      </Transition>
                    </Teleport>
                  </div>
                </div>
                <!-- Columna: Modo rifa (solo visible cuando tipo de proceso es "en curso") -->
                <div v-if="formActividad.tipoProceso === 'en_curso'" class="flex flex-col sm:min-h-[7.5rem]">
                  <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Modo rifa</label>
                  <template v-if="formActividad.tipo === 'rifa'">
                    <div class="flex-1 flex flex-col gap-2">
                      <div class="flex rounded-xl bg-slate-100 p-1 w-full min-h-[2.75rem]">
                        <button
                          type="button"
                          @click="formActividad.tipoRifa = 'manual'"
                          :class="[
                            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                            formActividad.tipoRifa === 'manual'
                              ? 'bg-white text-natillera-600 shadow-sm border border-slate-200/80'
                              : 'text-slate-500 hover:text-slate-700'
                          ]"
                        >
                          Manual
                        </button>
                        <button
                          type="button"
                          @click="formActividad.tipoRifa = 'aleatoria'"
                          :class="[
                            'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                            formActividad.tipoRifa === 'aleatoria'
                              ? 'bg-white text-natillera-600 shadow-sm border border-slate-200/80'
                              : 'text-slate-500 hover:text-slate-700'
                          ]"
                        >
                          Auto
                        </button>
                      </div>
                      <p v-if="formActividad.tipoRifa === 'manual'" class="text-xs text-slate-500 leading-snug">Asignas tú cada número (comprador, vendedor, valor).</p>
                      <p v-else-if="formActividad.tipoRifa === 'aleatoria'" class="text-xs text-slate-500 leading-snug">Números repartidos automáticamente entre socios.</p>
                    </div>
                  </template>
                  <div v-else class="flex-1 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/30 flex items-center justify-center min-h-[2.75rem] py-4 sm:py-0">
                    <span class="text-xs text-slate-400 text-center px-2">Selecciona Rifa para ver opciones</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bloque: Descripción + Repetir -->
            <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Descripción <span class="text-red-500">*</span></label>
              <textarea 
                v-model="formActividad.descripcion"
                rows="2"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-natillera-500/30 focus:border-natillera-400 focus:bg-white resize-none transition-colors"
                placeholder="Ej: Rifa de Navidad 2025"
                required
              />
              <label v-if="formActividad.tipoProceso === 'en_curso'" class="mt-3 flex items-center justify-between gap-3 py-3 px-4 rounded-xl border cursor-pointer transition-all min-h-[3.25rem] select-none active:scale-[0.99]"
                :class="formActividad.esMultiplesMeses ? 'bg-natillera-50 border-natillera-300 shadow-sm' : 'bg-slate-50/90 border-natillera-200/60 hover:border-natillera-300 hover:bg-natillera-50/50 hover:shadow-sm'">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all border-2 cursor-pointer ring-2 ring-transparent hover:ring-natillera-500/30 focus-within:ring-natillera-500/50 focus-within:ring-offset-2"
                    :class="formActividad.esMultiplesMeses
                      ? 'bg-natillera-500 border-natillera-500 text-white shadow-sm'
                      : 'bg-white border-slate-300 text-transparent hover:border-natillera-400 hover:bg-natillera-50/50'"
                  >
                    <input type="checkbox" v-model="formActividad.esMultiplesMeses" class="sr-only" />
                    <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div class="min-w-0">
                    <span class="text-sm font-semibold text-slate-800">Repetir actividad</span>
                    <p class="text-xs text-slate-500 mt-0.5">Aplicar a varios meses</p>
                  </div>
                </div>
                <ArrowPathIcon class="w-5 h-5 text-slate-400 flex-shrink-0 pointer-events-none" />
              </label>
            </div>

            <!-- Período / Mes (solo en curso) - arriba -->
            <template v-if="formActividad.tipoProceso === 'en_curso'">
              <template v-if="!formActividad.esMultiplesMeses">
                <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
                  <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Período y fecha</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col">
                      <label class="text-xs text-slate-500 mb-2 block">Período *</label>
                      <select 
                        v-model="periodoSeleccionadoValue" 
                        class="w-full h-11 px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-natillera-500/30 focus:border-natillera-400 focus:bg-white appearance-none cursor-pointer"
                      >
                        <option :value="null">Seleccione período</option>
                        <option v-for="opcion in opcionesPeriodo" :key="opcion.value" :value="opcion.value">{{ opcion.label }}</option>
                      </select>
                      <p v-if="opcionesPeriodo.length === 0" class="text-xs text-slate-500 mt-1.5">No hay períodos disponibles</p>
                    </div>
                    <div class="flex flex-col">
                      <label class="text-xs text-slate-500 mb-2 block">Fecha límite *</label>
                      <DateInput 
                        v-model="formActividad.fechaLimitePago"
                        placeholder="Se calcula automático"
                        required
                        :disabled="false"
                        input-class="!h-11 !pl-10 !py-2.5 text-sm rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-natillera-400"
                      />
                    </div>
                  </div>

                  <!-- Quincena de pago -->
                  <div v-if="natillera && natillera.periodicidad === 'quincenal'" class="mt-4">
                    <p class="text-xs text-slate-500 mb-2">Quincena de pago *</p>
                    <div class="grid grid-cols-2 gap-2 sm:gap-2">
                      <button
                        type="button"
                        @click="formActividad.quincenaPago = 1; calcularFechaLimitePago()"
                        :class="[
                          'relative p-3 rounded-xl border text-left transition-all',
                          formActividad.quincenaPago === 1
                            ? 'border-natillera-400 bg-natillera-50 shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                        ]"
                      >
                        <div class="flex items-center gap-2">
                          <div :class="['w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold', formActividad.quincenaPago === 1 ? 'bg-natillera-500 text-white' : 'bg-slate-200 text-slate-500']">1</div>
                          <div>
                            <p class="font-semibold text-sm text-slate-800">1ra Quincena</p>
                            <p class="text-xs text-slate-500">Día 15</p>
                          </div>
                        </div>
                        <div v-if="formActividad.quincenaPago === 1" class="absolute top-2 right-2 w-4 h-4 rounded-full bg-natillera-500 flex items-center justify-center">
                          <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        </div>
                      </button>
                      <button
                        type="button"
                        @click="formActividad.quincenaPago = 2; calcularFechaLimitePago()"
                        :class="[
                          'relative p-3 rounded-xl border text-left transition-all',
                          formActividad.quincenaPago === 2
                            ? 'border-natillera-400 bg-natillera-50 shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                        ]"
                      >
                        <div class="flex items-center gap-2">
                          <div :class="['w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold', formActividad.quincenaPago === 2 ? 'bg-natillera-500 text-white' : 'bg-slate-200 text-slate-500']">2</div>
                          <div>
                            <p class="font-semibold text-sm text-slate-800">2da Quincena</p>
                            <p class="text-xs text-slate-500">Fin de mes</p>
                          </div>
                        </div>
                        <div v-if="formActividad.quincenaPago === 2" class="absolute top-2 right-2 w-4 h-4 rounded-full bg-natillera-500 flex items-center justify-center">
                          <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Panel para múltiples meses -->
              <template v-else>
                <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5 space-y-4">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selecciona los meses *</label>
                    <div v-if="mesesDelPeriodo.length > 0" class="flex gap-2 flex-shrink-0">
                      <button type="button" @click="marcarTodosMeses" class="px-2.5 py-1.5 text-xs font-medium text-natillera-600 bg-natillera-50 hover:bg-natillera-100 rounded-lg border border-natillera-200">Todos</button>
                      <button type="button" @click="desmarcarTodosMeses" class="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200">Ninguno</button>
                    </div>
                  </div>
                  <div v-if="mesesDelPeriodo.length === 0" class="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    No hay meses disponibles en el período de la natillera
                  </div>
                  <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    <button
                      v-for="mesPeriodo in mesesDelPeriodo"
                      :key="`${mesPeriodo.mes}-${mesPeriodo.anio}`"
                      type="button"
                      @click="toggleMesSeleccionado(mesPeriodo.mes, mesPeriodo.anio)"
                      class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-left w-full"
                      :class="estaMesSeleccionado(mesPeriodo.mes, mesPeriodo.anio) ? 'border-natillera-400 bg-natillera-50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'"
                    >
                      <div class="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                        :class="estaMesSeleccionado(mesPeriodo.mes, mesPeriodo.anio) ? 'border-natillera-500 bg-natillera-500' : 'border-slate-300 bg-white'">
                        <svg v-if="estaMesSeleccionado(mesPeriodo.mes, mesPeriodo.anio)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-xs text-slate-800">{{ meses.find(m => m.value === mesPeriodo.mes)?.label || `Mes ${mesPeriodo.mes}` }}</p>
                        <p class="text-xs text-slate-500">{{ mesPeriodo.anio }}</p>
                      </div>
                    </button>
                  </div>
                  <p class="text-xs text-slate-500">Seleccionados: {{ formActividad.mesesSeleccionados.length }} mes(es)</p>
                  <div v-if="natillera && natillera.periodicidad === 'quincenal'">
                    <p class="text-xs text-slate-500 mb-2">Quincena de pago *</p>
                    <div class="grid grid-cols-2 gap-2">
                      <button type="button" @click="formActividad.quincenaPago = 1; actualizarQuincenaMeses()"
                        :class="['p-2.5 rounded-xl border text-left transition-all', formActividad.quincenaPago === 1 ? 'border-natillera-400 bg-natillera-50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300']">
                        <div class="flex items-center gap-2">
                          <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold', formActividad.quincenaPago === 1 ? 'bg-natillera-500 text-white' : 'bg-slate-200 text-slate-500']">1</div>
                          <div><p class="font-semibold text-xs text-slate-800">1ra</p><p class="text-xs text-slate-500">Día 15</p></div>
                        </div>
                      </button>
                      <button type="button" @click="formActividad.quincenaPago = 2; actualizarQuincenaMeses()"
                        :class="['p-2.5 rounded-xl border text-left transition-all', formActividad.quincenaPago === 2 ? 'border-natillera-400 bg-natillera-50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300']">
                        <div class="flex items-center gap-2">
                          <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold', formActividad.quincenaPago === 2 ? 'bg-natillera-500 text-white' : 'bg-slate-200 text-slate-500']">2</div>
                          <div><p class="font-semibold text-xs text-slate-800">2da</p><p class="text-xs text-slate-500">Fin de mes</p></div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <!-- Fecha de juego de la rifa (solo rifas en curso) -->
            <div v-if="formActividad.tipo === 'rifa' && formActividad.tipoProceso === 'en_curso'" class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Fecha de juego de la rifa *</label>
              <p class="text-xs text-slate-500 mb-3">Indica cuándo se jugará el sorteo. Si necesitas una fecha concreta, elige "Fecha específica" y asigna la fecha por mes.</p>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="opcion in opcionesCuandoJuegoRifa"
                    :key="opcion.value"
                    type="button"
                    @click="formActividad.cuandoJuegoRifa = opcion.value"
                    :class="[
                      'p-3 rounded-xl border text-left transition-all',
                      formActividad.cuandoJuegoRifa === opcion.value
                        ? 'border-natillera-400 bg-natillera-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                    ]"
                  >
                    <p class="font-semibold text-sm text-slate-800">{{ opcion.label }}</p>
                  </button>
                </div>
                <!-- Fecha específica: un solo mes -->
                <div v-if="formActividad.cuandoJuegoRifa === 'fecha_especifica' && !formActividad.esMultiplesMeses" class="mt-3">
                  <label class="text-xs text-slate-500 mb-2 block">Fecha de juego</label>
                  <DateInput
                    v-model="formActividad.fechaJuegoRifa"
                    placeholder="Seleccione fecha"
                    :disabled="false"
                    input-class="!h-11 !pl-10 !py-2.5 text-sm rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-natillera-400"
                  />
                </div>
                <!-- Fecha específica: varios meses → lista por mes -->
                <div v-if="formActividad.cuandoJuegoRifa === 'fecha_especifica' && formActividad.esMultiplesMeses && formActividad.mesesSeleccionados.length > 0" class="mt-3 space-y-3">
                  <p class="text-xs text-slate-500">Asigna la fecha de juego para cada mes:</p>
                  <div class="space-y-2 max-h-48 overflow-y-auto p-1">
                    <div v-for="mesInfo in formActividad.mesesSeleccionados" :key="`${mesInfo.mes}-${mesInfo.anio}`" class="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/30">
                      <span class="font-semibold text-sm text-slate-800 sm:w-28 flex-shrink-0">{{ meses.find(m => m.value === mesInfo.mes)?.label || `Mes ${mesInfo.mes}` }} {{ mesInfo.anio }}</span>
                      <DateInput
                        :model-value="formActividad.fechasJuegoPorMes[`${mesInfo.mes}-${mesInfo.anio}`] || ''"
                        @update:model-value="formActividad.fechasJuegoPorMes[`${mesInfo.mes}-${mesInfo.anio}`] = $event"
                        placeholder="Fecha de juego"
                        :disabled="false"
                        input-class="!h-10 !pl-10 !py-2 text-sm rounded-lg border-2 border-slate-200 bg-white focus:border-natillera-400 flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Números por socio (rifa en curso: obligatorio en modo Auto) -->
            <div v-if="formActividad.tipo === 'rifa' && formActividad.tipoProceso === 'en_curso'" class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Números por socio <span v-if="formActividad.tipoRifa === 'aleatoria'" class="text-red-500">*</span></label>
              <input 
                v-model.number="formActividad.cantidadNumerosPorSocio"
                type="number" 
                inputmode="numeric"
                :disabled="formActividad.tipoRifa !== 'aleatoria'"
                class="w-full sm:max-w-[140px] h-11 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-natillera-500/30 focus:border-natillera-400 transition-colors"
                :class="formActividad.tipoRifa === 'aleatoria' ? 'bg-slate-50/50 text-slate-800' : 'bg-slate-100/80 text-slate-400 cursor-not-allowed'"
                placeholder="Ej: 5"
                min="1"
                step="1"
                :required="formActividad.tipoRifa === 'aleatoria'"
              />
              <p v-if="formActividad.tipoRifa === 'manual'" class="text-xs text-slate-500 mt-1.5">Solo aplica en modo Auto (asignación automática de números).</p>
            </div>

            <!-- Bloque: Liquidar -->
            <template v-if="formActividad.tipoProceso === 'liquidar'">
              <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Valores de la actividad</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex flex-col">
                    <label class="text-xs text-slate-500 mb-2 block">Ingresos *</label>
                    <div class="relative flex-1">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                      <input 
                        :value="formatMilesInput(formActividad.ingresos)"
                        type="text"
                        inputmode="decimal"
                        class="w-full h-11 pl-8 pr-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-natillera-500/30 focus:border-natillera-400 focus:bg-white"
                        placeholder="150.000"
                        @input="formActividad.ingresos = parseMilesInput($event.target.value)"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <label class="text-xs text-slate-500 mb-2 block">Gastos</label>
                    <div class="relative flex-1">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                      <input 
                        :value="formatMilesInput(formActividad.gastos)"
                        type="text"
                        inputmode="decimal"
                        class="w-full h-11 pl-8 pr-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-natillera-500/30 focus:border-natillera-400 focus:bg-white"
                        placeholder="20.000"
                        @input="formActividad.gastos = parseMilesInput($event.target.value)"
                      />
                    </div>
                  </div>
                </div>
                <div class="mt-3 p-3 rounded-xl bg-natillera-50/80 border border-natillera-200/80">
                  <p class="text-xs text-natillera-800">Utilidad estimada: <span class="font-bold text-natillera-600">${{ formatMoney((formActividad.ingresos || 0) - (formActividad.gastos || 0)) }}</span></p>
                </div>
              </div>
            </template>

            <!-- Formulario para Actividad en curso -->
            <template v-else>
              <!-- Bloque: Asignación y valores -->
              <div class="rounded-xl border border-natillera-200/60 bg-white/90 backdrop-blur-sm p-4 shadow-md shadow-natillera-900/5">
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Asignación de valores</label>
                <div class="flex rounded-xl bg-slate-100 p-1 mb-4 w-full">
                  <button type="button" @click="formActividad.tipoValores = 'iguales'; aplicarValorIgual()"
                    :class="['flex-1 min-h-[2.75rem] px-4 py-2.5 rounded-lg text-sm font-medium transition-all', formActividad.tipoValores === 'iguales' ? 'bg-white text-natillera-600 shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-800']">
                    Iguales
                  </button>
                  <button type="button" @click="formActividad.tipoValores = 'diferentes'; limpiarValorIgual(); fetchSocios()"
                    :class="['flex-1 min-h-[2.75rem] px-4 py-2.5 rounded-lg text-sm font-medium transition-all', formActividad.tipoValores === 'diferentes' ? 'bg-white text-natillera-600 shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-800']">
                    Diferentes
                  </button>
                </div>

                <!-- Valor por socio + Total (cuando se elige Iguales) -->
                <div v-if="formActividad.tipoValores === 'iguales'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex flex-col">
                    <label class="text-xs text-slate-500 mb-2 block">Valor por socio</label>
                    <div class="relative flex-1">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                      <input 
                        :value="formatNumberWithSeparator(formActividad.valorIgual)"
                        @input="handleValorIgualInput($event)"
                        type="text" 
                        inputmode="decimal"
                        class="w-full h-11 pl-8 pr-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-natillera-500/30 focus:border-natillera-400 focus:bg-white"
                        placeholder="0"
                        pattern="[0-9.]*"
                        @blur="aplicarValorIgual()"
                      />
                    </div>
                    <p v-if="formActividad.tipo === 'rifa' && formActividad.tipoRifa === 'manual'" class="text-xs text-slate-500 mt-1.5">Por defecto por número vendido</p>
                  </div>
                  <div class="flex flex-col">
                    <label class="text-xs text-slate-500 mb-2 block">Total ({{ socios.length }} socios)</label>
                    <div class="flex items-center h-11 rounded-xl border-2 border-slate-100 bg-natillera-50/50 px-3 border-natillera-200/50">
                      <p class="text-lg font-bold text-natillera-600">${{ formatMoney(totalARecaudar) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Lista de socios (cuando se elige Diferentes) -->
                <div v-else>
                  <p class="text-xs text-slate-500 mb-2">Valor por socio</p>
                  <div v-if="socios.length === 0" class="text-sm text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    No hay socios activos en esta natillera
                  </div>
                  <div v-else class="space-y-2 max-h-48 overflow-y-auto p-1">
                    <div v-for="socio in socios" :key="socio.id" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50/50 transition-colors">
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-sm text-slate-800">{{ socio.socio?.nombre || 'Sin nombre' }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ socio.socio?.telefono || '' }}</p>
                      </div>
                      <div class="relative w-full sm:w-28 flex-shrink-0">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                        <input 
                          v-model.number="formActividad.valoresPorSocio[socio.id]"
                          type="number" 
                          class="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-natillera-500/30 min-h-[2.75rem] sm:w-28"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-slate-500 mt-2">Total: <span class="font-bold text-natillera-600">${{ formatMoney(totalARecaudar) }}</span></p>
                </div>
              </div>
            </template>
          </form>
        </div>

        <!-- Footer -->
        <div class="border-t border-natillera-200/80 bg-gradient-to-r from-white to-natillera-50/40 px-4 sm:px-5 py-4 flex-shrink-0">
          <div class="flex flex-col-reverse sm:flex-row gap-3">
            <button type="button" @click="modalNuevaActividad = false" class="w-full sm:flex-1 px-4 py-3.5 sm:py-2.5 rounded-xl border-2 border-natillera-200 bg-white text-slate-700 font-medium hover:bg-natillera-50/80 hover:border-natillera-300 transition-colors min-h-[2.75rem] active:scale-[0.98]">
              Cancelar
            </button>
            <button type="button" @click="handleCrearActividad" :disabled="loading" class="w-full sm:flex-1 px-4 py-3.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-natillera-500 to-natillera-600 text-white font-semibold hover:from-natillera-600 hover:to-natillera-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-natillera-500/25 min-h-[2.75rem] active:scale-[0.98]">
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
          <div class="grid grid-cols-3 gap-4 mb-6" :class="{ 'sm:grid-cols-4': actividadSeleccionada.tipo === 'rifa' }">
            <div class="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50/50 rounded-xl p-4 border border-amber-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">Fecha límite</p>
              <p class="font-bold text-amber-700 text-base">
                {{ actividadSeleccionada.fecha_limite_pago ? formatDate(actividadSeleccionada.fecha_limite_pago) : 'No definida' }}
              </p>
            </div>
            <div v-if="actividadSeleccionada.tipo === 'rifa'" class="relative bg-gradient-to-br from-natillera-50 via-emerald-50/50 to-teal-50/30 rounded-xl p-4 border border-natillera-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">Fecha de juego</p>
              <p class="font-bold text-natillera-700 text-base">
                {{ actividadSeleccionada.fecha_juego_rifa ? formatDate(actividadSeleccionada.fecha_juego_rifa) : (actividadSeleccionada.cuando_juego_rifa ? etiquetaCuandoJuegoRifa(actividadSeleccionada.cuando_juego_rifa) : '—') }}
              </p>
            </div>
            <div class="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50/50 rounded-xl p-4 border border-blue-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">
                {{ actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'manual' ? 'Total proyecto' : 'Total asignado' }}
              </p>
              <p class="font-bold text-blue-600 text-base">
                <span v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'manual'">
                  <span class="sm:hidden">${{ formatMoneyCompact(totalProyectoRifa) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(totalProyectoRifa) }}</span>
                </span>
                <span v-else>
                  <span class="sm:hidden">${{ formatMoneyCompact(actividadSeleccionada.total_asignado || 0) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividadSeleccionada.total_asignado || 0) }}</span>
                </span>
              </p>
            </div>
            <div class="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-50/50 rounded-xl p-4 border border-green-200/50">
              <p class="text-xs text-gray-500 font-medium mb-1">Total recaudado</p>
              <p class="font-bold text-green-600 text-base">
                <span v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'manual'">
                  <span class="sm:hidden">${{ formatMoneyCompact(totalRecaudadoRifa) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(totalRecaudadoRifa) }}</span>
                </span>
                <span v-else>
                  <span class="sm:hidden">${{ formatMoneyCompact(actividadSeleccionada.total_pagado || 0) }}</span>
                  <span class="hidden sm:inline">${{ formatMoney(actividadSeleccionada.total_pagado || 0) }}</span>
                </span>
              </p>
            </div>
          </div>

          <!-- Vista de números para rifa manual -->
          <div v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'manual'">
            <!-- Total vendido (arriba, visible en móvil y desktop) -->
            <div class="mb-4 text-center text-sm sm:text-base">
              <p class="text-gray-700">
                Total vendido: <span class="font-bold text-natillera-600 text-lg">{{ numerosRifaOrdenados.filter(n => n.estado === 'vendido' || n.estado === 'pagado').length }}</span> de <span class="font-bold text-lg">100</span> números
                <span v-if="filtroEstadoRifa !== 'todos'" class="ml-2 text-gray-500 text-sm">(Mostrando: {{ numerosRifaFiltrados.length }})</span>
              </p>
            </div>
            
            <div class="flex flex-col gap-4 mb-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h4 class="font-bold text-gray-800 text-lg">Números de la rifa</h4>
                
                <!-- Filtro de estados con botones estilizados -->
                <div class="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-gray-50 to-gray-100 p-1 sm:p-1.5 rounded-xl border-2 border-gray-200 shadow-inner flex-wrap sm:flex-nowrap">
                  <button
                    @click="filtroEstadoRifa = 'todos'"
                    :class="[
                      'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 flex-shrink-0',
                      filtroEstadoRifa === 'todos'
                        ? 'bg-gradient-to-br from-natillera-500 to-natillera-600 text-white shadow-lg shadow-natillera-200 scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    ]"
                  >
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span class="whitespace-nowrap">Todos</span>
                  </button>
                  <button
                    @click="filtroEstadoRifa = 'libre'"
                    :class="[
                      'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 flex-shrink-0',
                      filtroEstadoRifa === 'libre'
                        ? 'bg-white text-gray-800 shadow-md border-2 border-gray-300 scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    ]"
                  >
                    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-400 border border-gray-500 flex-shrink-0"></div>
                    <span class="whitespace-nowrap">Libres</span>
                  </button>
                  <button
                    @click="filtroEstadoRifa = 'vendido'"
                    :class="[
                      'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 flex-shrink-0',
                      filtroEstadoRifa === 'vendido'
                        ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-800 shadow-md border-2 border-amber-400 scale-105'
                        : 'text-amber-700 hover:text-amber-800 hover:bg-amber-50/50'
                    ]"
                  >
                    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400 border border-amber-500 flex-shrink-0"></div>
                    <span class="whitespace-nowrap">Vendidos</span>
                  </button>
                  <button
                    @click="filtroEstadoRifa = 'pagado'"
                    :class="[
                      'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-2 flex-shrink-0',
                      filtroEstadoRifa === 'pagado'
                        ? 'bg-gradient-to-br from-green-100 to-emerald-50 text-green-800 shadow-md border-2 border-green-500 scale-105'
                        : 'text-green-700 hover:text-green-800 hover:bg-green-50/50'
                    ]"
                  >
                    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border border-green-600 flex-shrink-0"></div>
                    <span class="whitespace-nowrap">Pagados</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-2.5 p-3 sm:p-4 bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-inner">
              <div
                v-for="numero in numerosRifaFiltrados"
                :key="numero.numero"
                @click="numero.estado === 'libre' ? abrirModalVenta(numero.numero) : (numero.estado === 'vendido' || numero.estado === 'pagado') ? abrirModalPagar(numero.numero) : null"
                :class="[
                  'aspect-square flex items-center justify-center rounded-lg text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 leading-none relative p-2 shadow-sm',
                  numero.estado === 'libre' 
                    ? 'bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-natillera-400 hover:shadow-md cursor-pointer hover:scale-105 active:scale-95 text-gray-700 hover:text-natillera-700' 
                    : numero.estado === 'vendido'
                    ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 border-2 border-amber-400 text-amber-800 cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 hover:border-amber-500 hover:from-amber-200 hover:to-amber-100'
                    : 'bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 border-2 border-green-500 text-green-800 cursor-pointer hover:scale-105 hover:shadow-md active:scale-95 hover:border-green-600 hover:from-green-200 hover:to-green-100',
                  (numero.estado === 'vendido' || numero.estado === 'pagado') ? 'cursor-pointer' : ''
                ]"
                :title="numero.estado === 'libre' ? 'Click para vender' : numero.estado === 'vendido' ? `Click para gestionar pago - ${numero.nombreComprador || 'Número'} - $${formatMoney(numero.valor || 0)}` : numero.estado === 'pagado' ? `Click para gestionar pago - ${numero.nombreComprador || 'Número'} - $${formatMoney(numero.valor || 0)} - Pagado` : ''"
              >
                <span class="drop-shadow-sm">{{ numero.numero }}</span>
              </div>
            </div>
          </div>

          <!-- Lista de socios (solo si NO es rifa manual) -->
          <div v-else>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h4 class="font-bold text-gray-800">Socios participantes</h4>
              
              <!-- Campo de búsqueda de números (solo para rifa automática) -->
              <div v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria'" class="flex-1 sm:max-w-xs">
                <div class="relative">
                  <input
                    v-model="busquedaNumero"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    placeholder="Buscar número (00-99)..."
                    class="w-full pl-10 pr-4 py-2 border-2 border-natillera-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-natillera-500 focus:border-transparent text-sm"
                  />
                  <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    v-if="busquedaNumero"
                    @click="busquedaNumero = ''"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="sociosActividad.length === 0" class="text-center py-8 text-gray-500">
              <p>No hay socios asignados a esta actividad</p>
            </div>
            <div v-else-if="busquedaNumero && sociosFiltrados.length === 0 && faltantesFiltrados.length === 0" class="text-center py-8 text-gray-500">
              <p>No se encontraron resultados para "{{ busquedaNumero }}"</p>
            </div>
            <div v-else class="space-y-3">
              <div 
                v-for="socioAct in sociosFiltrados" 
                :key="socioAct.id"
                class="p-4 bg-white rounded-xl border-2 transition-all"
                :class="{
                  'border-green-200 bg-green-50/30': getEstadoDisplaySocio(socioAct) === 'pagado',
                  'border-amber-200 bg-amber-50/30': getEstadoDisplaySocio(socioAct) === 'parcial',
                  'border-red-200 bg-red-50/30': getEstadoDisplaySocio(socioAct) === 'mora',
                  'border-gray-200 bg-gray-50/30': getEstadoDisplaySocio(socioAct) === 'pendiente'
                }"
              >
                <!-- Header: Nombre y Badge (móvil y desktop). En rifa aleatoria el estado se deriva de los números para coincidir con Valor pagado/Saldo -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-800 truncate">{{ socioAct.socio_natillera?.socio?.nombre || 'Sin nombre' }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ socioAct.socio_natillera?.socio?.telefono || '' }}</p>
                  </div>
                  <div class="flex-shrink-0">
                    <span 
                      class="inline-block px-3 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap"
                      :class="{
                        'bg-green-100 text-green-700 border border-green-200': getEstadoDisplaySocio(socioAct) === 'pagado',
                        'bg-amber-100 text-amber-700 border border-amber-200': getEstadoDisplaySocio(socioAct) === 'parcial',
                        'bg-red-100 text-red-700 border border-red-200': getEstadoDisplaySocio(socioAct) === 'mora',
                        'bg-gray-100 text-gray-700 border border-gray-200': getEstadoDisplaySocio(socioAct) === 'pendiente'
                      }"
                    >
                      {{ getEstadoLabel(getEstadoDisplaySocio(socioAct)) }}
                    </span>
                  </div>
                </div>
                
                <!-- Números asignados (solo para rifa automática) -->
                <div v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria'" class="mb-3">
                  <p class="text-xs text-gray-500 mb-2">Números asignados:</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span 
                      v-for="numero in getValoresSocioRifaAutomatica(socioAct).numeros"
                      :key="numero"
                      class="px-2 py-1 bg-gradient-to-br from-natillera-100 to-emerald-100 border border-natillera-300 rounded-lg text-xs font-semibold text-natillera-700"
                    >
                      {{ numero }}
                    </span>
                    <span v-if="getValoresSocioRifaAutomatica(socioAct).numeros.length === 0" class="text-xs text-gray-400 italic">
                      Sin números asignados
                    </span>
                  </div>
                </div>
                
                <!-- Valores: Grid responsive -->
                <div class="grid grid-cols-3 gap-2 sm:gap-4">
                  <div class="text-center sm:text-right">
                    <p class="text-xs text-gray-500 mb-1">Valor a pagar</p>
                    <p class="font-bold text-gray-800 text-sm sm:text-base break-words">
                      <span v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria'">
                        <span class="sm:hidden">${{ formatMoneyCompact(getValoresSocioRifaAutomatica(socioAct).valorAPagar) }}</span>
                        <span class="hidden sm:inline">${{ formatMoney(getValoresSocioRifaAutomatica(socioAct).valorAPagar) }}</span>
                      </span>
                      <span v-else>
                        <span class="sm:hidden">${{ formatMoneyCompact(socioAct.valor_asignado) }}</span>
                        <span class="hidden sm:inline">${{ formatMoney(socioAct.valor_asignado) }}</span>
                      </span>
                    </p>
                  </div>
                  <div class="text-center sm:text-right">
                    <p class="text-xs text-gray-500 mb-1">Valor pagado</p>
                    <p class="font-bold text-green-600 text-sm sm:text-base break-words">
                      <span v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria'">
                        <span class="sm:hidden">${{ formatMoneyCompact(getValoresSocioRifaAutomatica(socioAct).valorPagado) }}</span>
                        <span class="hidden sm:inline">${{ formatMoney(getValoresSocioRifaAutomatica(socioAct).valorPagado) }}</span>
                      </span>
                      <span v-else>
                        <span class="sm:hidden">${{ formatMoneyCompact(socioAct.valor_pagado || 0) }}</span>
                        <span class="hidden sm:inline">${{ formatMoney(socioAct.valor_pagado || 0) }}</span>
                      </span>
                    </p>
                  </div>
                  <div class="text-center sm:text-right">
                    <p class="text-xs text-gray-500 mb-1">Saldo</p>
                    <p class="font-bold text-red-600 text-sm sm:text-base break-words">
                      <span v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria'">
                        <span class="sm:hidden">${{ formatMoneyCompact(getValoresSocioRifaAutomatica(socioAct).saldo) }}</span>
                        <span class="hidden sm:inline">${{ formatMoney(getValoresSocioRifaAutomatica(socioAct).saldo) }}</span>
                      </span>
                      <span v-else>
                        <span class="sm:hidden">${{ formatMoneyCompact((socioAct.valor_asignado || 0) - (socioAct.valor_pagado || 0)) }}</span>
                        <span class="hidden sm:inline">${{ formatMoney((socioAct.valor_asignado || 0) - (socioAct.valor_pagado || 0)) }}</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Faltantes (solo para rifa automática) -->
              <div v-if="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria' && faltantesFiltrados.length > 0" class="mt-6">
                <h4 class="font-bold text-gray-800 mb-4">Faltantes</h4>
                <div class="space-y-3">
                  <div 
                    v-for="faltante in faltantesFiltrados" 
                    :key="faltante.nombre"
                    class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 transition-all"
                  >
                    <!-- Header: Nombre del faltante + Asignar (solo desktop) -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-800 truncate">{{ faltante.nombre }}</p>
                        <p class="text-xs text-gray-500 truncate">Números no asignados a socios</p>
                      </div>
                      <button
                        @click="abrirModalAsignarFaltante(faltante)"
                        class="hidden sm:flex shrink-0 px-4 py-2 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg items-center gap-2 text-sm"
                      >
                        <UserPlusIcon class="w-4 h-4" />
                        Asignar a socio
                      </button>
                    </div>
                    
                    <!-- Números asignados -->
                    <div class="mb-3">
                      <p class="text-xs text-gray-500 mb-2">Números asignados:</p>
                      <div class="flex flex-wrap gap-1.5">
                        <span 
                          v-for="numero in faltante.numeros"
                          :key="numero.numero"
                          class="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                          :class="{
                            'bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 text-yellow-900 shadow-md scale-105': busquedaNumero && numero.numero === busquedaNumero.trim().padStart(2, '0'),
                            'bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400 text-gray-700': !busquedaNumero || numero.numero !== busquedaNumero.trim().padStart(2, '0')
                          }"
                        >
                          {{ numero.numero }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Valores: Grid responsive -->
                    <div class="grid grid-cols-3 gap-2 sm:gap-4">
                      <div class="text-center sm:text-right">
                        <p class="text-xs text-gray-500 mb-1">Valor a pagar</p>
                        <p class="font-bold text-gray-800 text-sm sm:text-base break-words">
                          <span class="sm:hidden">${{ formatMoneyCompact(faltante.numeros.reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                          <span class="hidden sm:inline">${{ formatMoney(faltante.numeros.reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                        </p>
                      </div>
                      <div class="text-center sm:text-right">
                        <p class="text-xs text-gray-500 mb-1">Valor pagado</p>
                        <p class="font-bold text-green-600 text-sm sm:text-base break-words">
                          <span class="sm:hidden">${{ formatMoneyCompact(faltante.numeros.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                          <span class="hidden sm:inline">${{ formatMoney(faltante.numeros.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                        </p>
                      </div>
                      <div class="text-center sm:text-right">
                        <p class="text-xs text-gray-500 mb-1">Saldo</p>
                        <p class="font-bold text-red-600 text-sm sm:text-base break-words">
                          <span class="sm:hidden">${{ formatMoneyCompact(faltante.numeros.reduce((sum, n) => sum + (n.valor || 0), 0) - faltante.numeros.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                          <span class="hidden sm:inline">${{ formatMoney(faltante.numeros.reduce((sum, n) => sum + (n.valor || 0), 0) - faltante.numeros.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                        </p>
                      </div>
                    </div>

                    <!-- Botón Asignar al final (solo móvil) -->
                    <div class="mt-4 pt-3 border-t border-gray-300 sm:hidden">
                      <button
                        @click="abrirModalAsignarFaltante(faltante)"
                        class="w-full px-4 py-2 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                      >
                        <UserPlusIcon class="w-4 h-4" />
                        Asignar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer con botón Liquidar -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <button 
            @click="abrirModalLiquidar"
            :disabled="actividadSeleccionada.tipo !== 'rifa'"
            :class="[
              'w-full px-4 py-3 font-semibold rounded-xl transition-all shadow-lg',
              actividadSeleccionada.tipo === 'rifa'
                ? 'bg-gradient-to-r from-natillera-600 to-emerald-600 hover:from-natillera-700 hover:to-emerald-700 text-white hover:shadow-xl cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            Liquidar Actividad
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Liquidar Actividad -->
    <div v-if="modalLiquidarActividad && actividadSeleccionada" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalLiquidarActividad = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 p-4 sm:p-5 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <CurrencyDollarIcon class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-display font-bold">Liquidar Actividad</h3>
                  <p class="text-white/90 text-xs">{{ actividadSeleccionada.descripcion }}</p>
                </div>
              </div>
              <button 
                @click="modalLiquidarActividad = false"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-4 sm:p-6 space-y-4">
          <!-- Total recaudado (solo lectura) -->
          <div>
            <label class="label mb-2 block">Total recaudado</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                $
              </div>
              <input 
                :value="formatNumberWithSeparator(totalRecaudadoLiquidar)"
                type="text" 
                class="input-field pl-10 text-lg font-semibold bg-gray-100"
                readonly
                disabled
              />
            </div>
          </div>

          <!-- Premio entregado -->
          <div>
            <label class="label mb-2 block">Premio entregado *</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                $
              </div>
              <input 
                :value="formatNumberWithSeparator(formLiquidar.premioEntregado)"
                @input="handlePremioEntregadoInput($event)"
                type="text" 
                inputmode="decimal"
                class="input-field pl-10 text-lg font-semibold"
                placeholder="0"
                pattern="[0-9.]*"
                required
              />
            </div>
          </div>

          <!-- Número ganador (para mostrar ganador al abrir la rifa liquidada) -->
          <div>
            <label class="label mb-2 block">Número ganador *</label>
            <input 
              v-model="formLiquidar.numeroGanador"
              type="text" 
              inputmode="numeric"
              maxlength="2"
              class="input-field text-center text-xl font-bold tracking-[0.3em]"
              placeholder="00"
              @input="formLiquidar.numeroGanador = formLiquidar.numeroGanador.replace(/\D/g, '').slice(0, 2)"
            />
            <p class="text-xs text-gray-500 mt-1">Número de la rifa que ganó (00-99)</p>
          </div>

          <!-- Utilidad calculada -->
          <div class="relative bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50/50 border-2 border-purple-200 rounded-xl p-4 overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-indigo-200/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="relative z-10">
              <p class="text-sm text-gray-600 font-medium mb-1">Utilidad:</p>
              <p class="font-bold text-2xl text-purple-600">
                ${{ formatMoney(utilidadLiquidar) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex gap-3">
          <button 
            @click="modalLiquidarActividad = false"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
          <button 
            @click="guardarLiquidacion"
            :disabled="loading || !formLiquidar.premioEntregado || formLiquidar.premioEntregado <= 0 || !numeroGanadorValido"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Liquidando...' : 'Liquidar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Liquidación con Utilidad Negativa -->
    <div v-if="modalConfirmarLiquidacionNegativa && actividadSeleccionada" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalConfirmarLiquidacionNegativa = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Header con advertencia -->
        <div class="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-4 sm:p-5 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">Advertencia</h3>
                <p class="text-white/90 text-xs">Utilidad negativa detectada</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-4 sm:p-6 space-y-4">
          <div class="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl p-4 border-2 border-amber-200">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-gray-800 mb-2">Utilidad Negativa</h4>
                <p class="text-sm text-gray-700 leading-relaxed mb-3">
                  El valor calculado de la utilidad es <span class="font-bold text-red-600">${{ formatMoney(Math.abs(utilidadLiquidar)) }}</span> negativo.
                </p>
                <p class="text-sm text-gray-700 leading-relaxed mb-3">
                  Este valor se <span class="font-bold text-red-600">restará de las utilidades</span> de la natillera, lo que puede generar <span class="font-bold text-red-600">pérdidas</span> en el fondo común.
                </p>
                <p class="text-sm text-gray-700 leading-relaxed">
                  <span class="font-semibold">Se sugiere revisar:</span>
                </p>
                <ul class="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>El total recaudado de la actividad</li>
                  <li>El valor del premio entregado</li>
                  <li>Los valores registrados en los números vendidos</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Resumen de valores -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Total recaudado:</span>
                <span class="font-semibold text-gray-800">${{ formatMoney(totalRecaudadoLiquidar) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Premio entregado:</span>
                <span class="font-semibold text-gray-800">${{ formatMoney(formLiquidar.premioEntregado) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-gray-300">
                <span class="text-gray-700 font-semibold">Utilidad:</span>
                <span class="font-bold text-red-600">${{ formatMoney(utilidadLiquidar) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex gap-3">
          <button 
            @click="modalConfirmarLiquidacionNegativa = false"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
          <button 
            @click="confirmarLiquidacion"
            :disabled="loading"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Liquidando...' : 'Liquidar de todas formas' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ganador Rifa (rifa liquidada) -->
    <div v-if="modalGanadorRifa && actividadSeleccionada" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-modal="ganador-rifa">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modalGanadorRifa = false"></div>
      <div class="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:animate-none">
        <!-- Header con gradiente dorado/celebration -->
        <div class="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-6 sm:p-8 text-white overflow-hidden">
          <div class="absolute inset-0 opacity-30">
            <div class="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div class="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div class="relative z-10 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/25 backdrop-blur-sm rounded-2xl border-2 border-white/40 mb-4 shadow-lg">
              <span class="text-3xl sm:text-4xl">🏆</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-display font-bold tracking-tight drop-shadow-sm">
              ¡Rifa liquidada!
            </h2>
            <p class="text-white/95 text-sm sm:text-base mt-1 font-medium truncate px-2">
              {{ actividadSeleccionada.descripcion }}
            </p>
          </div>
        </div>

        <!-- Contenido: número ganador + ganador -->
        <div class="p-6 sm:p-8 space-y-6">
          <!-- Número ganador grande -->
          <div v-if="actividadSeleccionada.numero_ganador != null && actividadSeleccionada.numero_ganador !== ''" class="text-center">
            <p class="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Número ganador</p>
            <div class="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 shadow-lg shadow-amber-200/50">
              <span class="text-4xl sm:text-5xl font-black text-amber-800 tracking-widest">
                {{ String(actividadSeleccionada.numero_ganador).padStart(2, '0') }}
              </span>
            </div>
          </div>

          <!-- Caso: número ganador lo tenía un Faltante → gana la natillera -->
          <div v-if="actividadSeleccionada.ganador_es_faltante" class="text-center">
            <div class="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-natillera-50 via-emerald-50/80 to-teal-50 border-2 border-natillera-200 shadow-lg">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-natillera-400 to-emerald-600 flex items-center justify-center shadow-xl ring-4 ring-natillera-200">
                <span class="text-4xl sm:text-5xl">🏦</span>
              </div>
              <div class="space-y-2">
                <p class="font-display font-bold text-xl sm:text-2xl text-natillera-800">
                  ¡Gana la natillera!
                </p>
                <p class="text-sm sm:text-base text-gray-600 max-w-xs leading-relaxed">
                  Este número no estaba asignado a un socio todavía. El premio y la utilidad se suman al fondo de la natillera.
                </p>
              </div>
            </div>
          </div>

          <!-- Ganador: socio con avatar -->
          <div v-else-if="actividadSeleccionada.ganador_nombre && !actividadSeleccionada.ganador_es_faltante" class="text-center">
            <p class="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ganador / Ganadora</p>
            <div class="flex flex-col items-center gap-3">
              <div class="relative">
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-amber-200 shadow-xl overflow-hidden bg-gray-100">
                  <img 
                    :src="getAvatarUrl(actividadSeleccionada.ganador_nombre, null, 'adventurer')" 
                    :alt="actividadSeleccionada.ganador_nombre"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <span class="text-white text-sm">✓</span>
                </div>
              </div>
              <p class="font-display font-bold text-lg sm:text-xl text-gray-800">
                {{ actividadSeleccionada.ganador_nombre }}
              </p>
            </div>
          </div>

          <!-- Sin datos de ganador (rifas liquidadas antes de esta función) -->
          <div v-else-if="actividadSeleccionada.numero_ganador == null || actividadSeleccionada.numero_ganador === ''" class="text-center py-4">
            <p class="text-sm text-gray-500 italic">Datos del ganador no registrados para esta rifa.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 sm:p-5">
          <button 
            @click="modalGanadorRifa = false"
            class="w-full px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ver ganadores (grupo de rifas) -->
    <div v-if="grupoGanadoresSeleccionado" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" data-modal="ver-ganadores-grupo">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="grupoGanadoresSeleccionado = null"></div>
      <div class="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 sm:animate-none max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="relative bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 px-4 py-3 text-white flex-shrink-0 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center flex-shrink-0"><span class="text-xl">🏆</span></div>
          <div class="min-w-0 flex-1">
            <h2 class="text-base font-bold">Ganadores del grupo</h2>
            <p class="text-white/95 text-sm line-clamp-2">{{ grupoGanadoresSeleccionado?.descripcionBase }}</p>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 flex-shrink-0">{{ (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length }} rifa{{ (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Lista -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-0">
          <div v-if="!(grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length" class="text-center py-8 text-gray-500 text-sm">No hay rifas en este grupo.</div>
          <template v-else v-for="actividad in (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa')" :key="actividad.id">
            <div class="rounded-xl border border-amber-200/70 bg-amber-50/60 overflow-hidden">
              <div class="px-3 py-2 border-b border-amber-100/80">
                <p class="text-sm font-semibold text-gray-800 line-clamp-2">{{ actividad.descripcion }}</p>
              </div>
              <div class="px-3 py-2 flex flex-wrap items-stretch gap-3">
                <!-- Info ganador / estado (izq) -->
                <div class="min-w-0 flex-1 flex items-center gap-2">
                  <template v-if="actividad.estado !== 'liquidada'">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
                    <span class="text-sm text-slate-500">Pendiente de liquidar</span>
                  </template>
                  <template v-else-if="actividad.numero_ganador == null || actividad.numero_ganador === ''">
                    <span class="text-sm text-slate-500 italic">Datos del ganador no registrados</span>
                  </template>
                  <template v-else>
                    <div v-if="actividad.ganador_es_faltante" class="w-9 h-9 rounded-lg bg-natillera-200 flex items-center justify-center text-base flex-shrink-0">🏦</div>
                    <img v-else :src="getAvatarUrl(actividad.ganador_nombre || '', null, 'adventurer')" :alt="actividad.ganador_nombre" class="w-9 h-9 rounded-full ring-2 ring-amber-200 object-cover flex-shrink-0" />
                    <div class="min-w-0">
                      <span class="text-xs px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">Nº {{ String(actividad.numero_ganador).padStart(2, '0') }}</span>
                      <p class="text-sm font-semibold text-gray-800 truncate mt-0.5">{{ actividad.ganador_es_faltante ? '¡Gana la natillera!' : (actividad.ganador_nombre || 'Desconocido') }}</p>
                    </div>
                  </template>
                </div>
                <!-- Resultados R/E/N (derecha, al frente) -->
                <div v-if="actividad.estado === 'liquidada' && ((actividad.ingresos ?? 0) || (actividad.gastos ?? 0) || (actividad.utilidad ?? 0))" class="grid grid-cols-3 gap-2 text-center shrink-0">
                  <div class="rounded-lg bg-emerald-50 border border-emerald-200/70 py-1.5 px-2">
                    <p class="text-[10px] font-semibold text-emerald-600 uppercase">Recogido</p>
                    <p class="text-xs font-bold text-gray-800">${{ formatMoney(actividad.ingresos || 0) }}</p>
                  </div>
                  <div class="rounded-lg bg-amber-50 border border-amber-200/70 py-1.5 px-2">
                    <p class="text-[10px] font-semibold text-amber-600 uppercase">Entregado</p>
                    <p class="text-xs font-bold text-gray-800">${{ formatMoney(actividad.gastos || 0) }}</p>
                  </div>
                  <div class="rounded-lg bg-natillera-50 border border-natillera-200/70 py-1.5 px-2">
                    <p class="text-[10px] font-semibold text-natillera-600 uppercase">Natillera</p>
                    <p class="text-xs font-bold text-natillera-700">${{ formatMoney(actividad.utilidad || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Totalizador -->
        <div v-if="(grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa' && a.estado === 'liquidada').length" class="flex-shrink-0 border-t border-amber-200/60 bg-amber-50/80 px-3 py-3">
          <p class="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Totales (rifas liquidadas)</p>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-emerald-50 border border-emerald-200/70 px-2 py-2 text-center">
              <p class="text-[10px] font-bold text-emerald-600 uppercase">Recogido</p>
              <p class="text-sm font-bold text-gray-900">${{ formatMoney(totalesGanadoresGrupo.recogido) }}</p>
            </div>
            <div class="rounded-xl bg-amber-50 border border-amber-200/70 px-2 py-2 text-center">
              <p class="text-[10px] font-bold text-amber-600 uppercase">Entregado</p>
              <p class="text-sm font-bold text-gray-900">${{ formatMoney(totalesGanadoresGrupo.entregado) }}</p>
            </div>
            <div class="rounded-xl bg-natillera-50 border border-natillera-200/70 px-2 py-2 text-center">
              <p class="text-[10px] font-bold text-natillera-600 uppercase">Natillera</p>
              <p class="text-sm font-bold text-natillera-700">${{ formatMoney(totalesGanadoresGrupo.natillera) }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 p-3 flex-shrink-0">
          <button @click="grupoGanadoresSeleccionado = null" class="w-full py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-natillera-500 to-emerald-600 text-white hover:from-natillera-600 hover:to-emerald-700 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de venta de rifa -->
    <div v-if="modalVentaRifa" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalVentaRifa = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-br from-natillera-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <TicketIcon class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-display font-bold">Registrar Venta</h3>
                  <p class="text-white/90 text-xs">Número: {{ formVentaRifa.numero }}</p>
                </div>
              </div>
              <button 
                @click="modalVentaRifa = false"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-4 sm:p-6 space-y-4">
          <div>
            <label class="label">Nombre del comprador *</label>
            <input 
              v-model="formVentaRifa.nombreComprador"
              type="text" 
              class="input-field"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div>
            <label class="label">Teléfono del comprador</label>
            <input 
              v-model="formVentaRifa.telefonoComprador"
              type="text" 
              class="input-field"
              placeholder="Ej: 3001234567"
            />
          </div>

          <div class="relative" data-socio-desplegable>
            <label class="label">Socio vendedor *</label>
            <div class="relative">
              <!-- Botón del desplegable -->
              <button
                @click="desplegableSocioAbierto = !desplegableSocioAbierto"
                type="button"
                class="w-full px-4 py-3 pr-10 rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 hover:border-gray-300 cursor-pointer flex items-center gap-3 text-left"
                :class="formVentaRifa.socioVendedor ? '' : 'text-gray-400'"
              >
                <template v-if="formVentaRifa.socioVendedor">
                  <img
                    :src="getAvatarUrl(socios.find(s => s.id === formVentaRifa.socioVendedor)?.socio?.nombre || '', socios.find(s => s.id === formVentaRifa.socioVendedor)?.socio?.avatar_seed, socios.find(s => s.id === formVentaRifa.socioVendedor)?.socio?.avatar_style)"
                    :alt="socios.find(s => s.id === formVentaRifa.socioVendedor)?.socio?.nombre || ''"
                    class="w-8 h-8 rounded-lg border-2 border-gray-200 object-cover flex-shrink-0"
                  />
                  <span class="flex-1">{{ socios.find(s => s.id === formVentaRifa.socioVendedor)?.socio?.nombre || 'Sin nombre' }}</span>
                </template>
                <template v-else>
                  <div class="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span class="flex-1">Seleccione un socio</span>
                </template>
                <svg 
                  class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
                  :class="desplegableSocioAbierto ? 'rotate-180' : ''"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Lista desplegable -->
              <div
                v-if="desplegableSocioAbierto"
                class="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-xl max-h-64 overflow-y-auto"
                @click.stop
              >
                <div class="p-2">
                  <div
                    v-for="socio in socios"
                    :key="socio.id"
                    @click="formVentaRifa.socioVendedor = socio.id; desplegableSocioAbierto = false"
                    class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-natillera-50 hover:border-natillera-200 border-2"
                    :class="formVentaRifa.socioVendedor === socio.id ? 'bg-natillera-50 border-natillera-300' : 'border-transparent'"
                  >
                    <img
                      :src="getAvatarUrl(socio.socio?.nombre || '', socio.socio?.avatar_seed, socio.socio?.avatar_style)"
                      :alt="socio.socio?.nombre || ''"
                      class="w-10 h-10 rounded-lg border-2 border-gray-200 object-cover flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800 truncate">{{ socio.socio?.nombre || 'Sin nombre' }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ socio.socio?.telefono || '' }}</p>
                    </div>
                    <div
                      v-if="formVentaRifa.socioVendedor === socio.id"
                      class="w-6 h-6 bg-natillera-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                    >
                      <svg
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="label">Valor de la venta *</label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg z-10">
                $
              </div>
              <input 
                :value="formatNumberWithSeparator(formVentaRifa.valor)"
                @input="handleVentaRifaValorInput($event)"
                type="text" 
                inputmode="decimal"
                class="input-field pl-10 text-lg font-semibold"
                placeholder="50.000"
                pattern="[0-9.]*"
                required
              />
            </div>
          </div>

          <!-- Checkbox para indicar si ya pagó -->
          <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all">
            <label class="flex items-center gap-3 cursor-pointer flex-1 group">
              <!-- Checkbox personalizado circular -->
              <div class="relative flex-shrink-0">
                <input 
                  type="checkbox" 
                  v-model="formVentaRifa.yaPago"
                  class="sr-only"
                />
                <!-- Círculo exterior con animación -->
                <div 
                  class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-in-out shadow-sm group-hover:scale-110"
                  :class="formVentaRifa.yaPago 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200' 
                    : 'bg-white border-emerald-400 group-hover:border-emerald-500'"
                >
                  <!-- Checkmark con animación -->
                  <svg 
                    v-if="formVentaRifa.yaPago"
                    class="w-4 h-4 text-white transition-all duration-200"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    stroke-width="3.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <!-- Círculo interior cuando no está marcado -->
                  <div 
                    v-else
                    class="w-3 h-3 rounded-full transition-all duration-300"
                    :class="formVentaRifa.yaPago ? 'bg-white opacity-100' : 'bg-transparent'"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-1">
                <span class="font-semibold text-emerald-800">Marcar como pagada</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex gap-3">
          <button 
            @click="modalVentaRifa = false"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
          <button 
            @click="guardarVentaRifa"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-600 to-emerald-600 hover:from-natillera-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Guardar Venta
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de pago de rifa -->
    <div v-if="modalPagarRifa" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalPagarRifa = false"></div>
      <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-display font-bold">Gestionar Pago</h3>
                  <p class="text-white/90 text-xs">Número: {{ formPagarRifa.numero }}</p>
                </div>
              </div>
              <button 
                @click="modalPagarRifa = false"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-4 sm:p-6 space-y-4">
          <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
            <div class="space-y-2">
              <div>
                <label class="text-xs font-semibold text-amber-800 uppercase tracking-wide">Comprador</label>
                <p class="text-gray-800 font-medium">{{ formPagarRifa.nombreComprador || 'Sin nombre' }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-amber-800 uppercase tracking-wide">Valor</label>
                <p class="text-gray-800 font-semibold text-lg">${{ formatMoney(formPagarRifa.valor || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Checkbox para indicar si ya pagó -->
          <div class="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all">
            <label class="flex items-center gap-3 cursor-pointer flex-1 group">
              <!-- Checkbox personalizado circular -->
              <div class="relative flex-shrink-0">
                <input 
                  type="checkbox" 
                  v-model="formPagarRifa.yaPago"
                  class="sr-only"
                />
                <!-- Círculo exterior con animación -->
                <div 
                  class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-in-out shadow-sm group-hover:scale-110"
                  :class="formPagarRifa.yaPago 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200' 
                    : 'bg-white border-emerald-400 group-hover:border-emerald-500'"
                >
                  <!-- Checkmark con animación -->
                  <svg 
                    v-if="formPagarRifa.yaPago"
                    class="w-4 h-4 text-white transition-all duration-200"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    stroke-width="3.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <!-- Círculo interior cuando no está marcado -->
                  <div 
                    v-else
                    class="w-3 h-3 rounded-full transition-all duration-300"
                    :class="formPagarRifa.yaPago ? 'bg-white opacity-100' : 'bg-transparent'"
                  ></div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-1">
                <span class="font-semibold text-emerald-800">Marcar como pagada</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex gap-3">
          <button 
            @click="modalPagarRifa = false"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Cancelar
          </button>
          <button 
            @click="guardarPagoRifa"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar actividad -->
    <div v-if="actividadAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="actividadAEliminar = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">
        <!-- Efectos decorativos -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-red-100/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div class="relative z-10">
          <!-- Header -->
          <div class="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 p-4 sm:p-5 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <TrashIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-display font-bold">Eliminar Actividad</h3>
                  <p class="text-white/90 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-4 sm:p-6">
            <p class="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar la actividad <strong class="text-gray-900">"{{ actividadAEliminar?.descripcion }}"</strong>?
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
                      <span>El registro completo de la actividad</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Todos los registros de socios relacionados (socios_actividad)</span>
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Todo el historial de pagos y asignaciones</span>
                    </li>
                  </ul>
                  <p class="mt-3 text-xs text-red-600 font-semibold bg-white/50 rounded-lg p-2">
                    💡 Esta acción es irreversible. Asegúrate de que realmente deseas eliminar esta actividad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              @click="actividadAEliminar = null"
              :disabled="eliminando"
              class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="eliminarActividadConfirmado"
              :disabled="eliminando"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrashIcon v-if="!eliminando" class="w-5 h-5" />
              <span>{{ eliminando ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para eliminar grupo -->
  <div v-if="grupoAEliminar" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="grupoAEliminar = null"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden">
      <!-- Efectos decorativos -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-red-100/30 rounded-full -ml-12 -mb-12 blur-xl"></div>
      
      <div class="relative z-10">
        <!-- Header -->
        <div class="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 p-4 sm:p-5 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-display font-bold">Eliminar Grupo Completo</h3>
                <p class="text-white/90 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-4 sm:p-6">
          <p class="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar el grupo completo <strong class="text-gray-900">"{{ grupoAEliminar?.descripcionBase }}"</strong>?
          </p>
          <div class="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-red-600 text-lg">⚠️</span>
              </div>
              <div class="flex-1">
                <p class="font-bold text-red-800 mb-2 text-sm">Se eliminarán permanentemente:</p>
                <ul class="space-y-2 text-sm text-red-700">
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span><strong>{{ grupoAEliminar?.actividades?.length || 0 }} actividades</strong> del grupo</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>Todos los registros de socios relacionados (socios_actividad)</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>Todo el historial de pagos y asignaciones</span>
                  </li>
                </ul>
                <p class="mt-3 text-xs text-red-600 font-semibold bg-white/50 rounded-lg p-2">
                  💡 Esta acción es irreversible. Asegúrate de que realmente deseas eliminar todas las actividades de este grupo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            @click="grupoAEliminar = null"
            :disabled="eliminandoGrupo"
            class="flex-1 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="eliminarGrupoConfirmado"
            :disabled="eliminandoGrupo"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <TrashIcon v-if="!eliminandoGrupo" class="w-5 h-5" />
            <span>{{ eliminandoGrupo ? 'Eliminando...' : 'Sí, Eliminar Grupo' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para asignar faltante a socio -->
  <div v-if="modalAsignarFaltante && faltanteSeleccionado" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="modalAsignarFaltante = false"></div>
    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-natillera-500 to-emerald-600 text-white p-6 rounded-t-3xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold">Asignar números a socio</h3>
            <p class="text-sm text-white/80 mt-1">{{ faltanteSeleccionado.nombre }}</p>
          </div>
          <button
            @click="modalAsignarFaltante = false"
            class="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Contenido -->
      <div class="p-6 space-y-4">
        <!-- Información del faltante -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p class="text-sm font-semibold text-gray-700 mb-2">Números a asignar:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="numero in faltanteSeleccionado.numeros"
              :key="numero.numero"
              class="px-3 py-1 bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400 rounded-lg text-sm font-semibold text-gray-700"
            >
              {{ numero.numero }}
            </span>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            Total: {{ faltanteSeleccionado.numeros.length }} número(s)
          </p>
        </div>

        <!-- Selector de socio -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Seleccionar socio:
          </label>
          <select
            v-model="socioSeleccionadoParaFaltante"
            class="w-full px-4 py-3 border-2 border-natillera-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-natillera-500 focus:border-transparent text-sm font-medium"
          >
            <option value="">-- Seleccione un socio --</option>
            <option
              v-for="socio in sociosSinNumeros"
              :key="socio.socio_natillera_id"
              :value="socio.socio_natillera_id"
            >
              {{ socio.socio_natillera?.socio?.nombre || 'Sin nombre' }} - {{ socio.socio_natillera?.socio?.telefono || 'Sin teléfono' }}
            </option>
          </select>
          <p v-if="sociosSinNumeros.length === 0" class="text-xs text-amber-600 mt-2">
            No hay socios disponibles sin números asignados
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-3xl border-t border-gray-200 flex gap-3">
        <button
          @click="modalAsignarFaltante = false"
          class="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button
          @click="confirmarAsignarFaltante"
          :disabled="!socioSeleccionadoParaFaltante || asignandoFaltante"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ asignandoFaltante ? 'Asignando...' : 'Asignar números' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import BackButton from '../../components/BackButton.vue'
import DateInput from '../../components/DateInput.vue'
import { formatDate } from '../../utils/formatDate.js'
import { getAvatarUrl } from '../../utils/avatars.js'
import { 
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  TicketIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  TrashIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  CubeIcon,
  UserPlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrophyIcon,
  GiftIcon,
  BuildingLibraryIcon
} from '@heroicons/vue/24/outline'
import * as XLSX from 'xlsx-js-style'

const notificationStore = useNotificationStore()

const props = defineProps({
  id: String
})

const route = useRoute()
const id = props.id || route.params.id

const actividades = ref([])
const loading = ref(false)
const modalNuevaActividad = ref(false)
const dropdownTipoActividad = ref(false)
const dropdownTipoActividadRef = ref(null)
const dropdownTipoActividadStyle = ref({})
const modalDetalleActividad = ref(false)
const actividadSeleccionada = ref(null)
const sociosActividad = ref([])
const socios = ref([])
const numerosAsignadosPorSocio = ref({}) // { socio_id: [numeros] } para rifa automática
const faltantes = ref([]) // Array de faltantes para rifa automática
const busquedaNumero = ref('') // Término de búsqueda para números en rifa automática
const actividadAEliminar = ref(null)
const eliminando = ref(false)
const grupoAEliminar = ref(null)
const eliminandoGrupo = ref(false)
const natillera = ref(null)
const mostrarModalBienvenida = ref(false)
const noMostrarDeNuevo = ref(false)
const tooltipVisible = ref(null) // 'liquidar' | 'en_curso' | null
const numerosRifa = ref({}) // { '00': { estado: 'libre'|'vendido'|'pagado', ... }, ... }
const modalVentaRifa = ref(false)
const modalPagarRifa = ref(false)
const modalLiquidarActividad = ref(false)
const vistaAgrupada = ref(true) // true = vista agrupada, false = vista normal
const gruposExpandidos = ref({}) // Objeto { serieId: true/false } para rastrear grupos expandidos
const modalConfirmarLiquidacionNegativa = ref(false)
const modalGanadorRifa = ref(false) // Modal para rifa liquidada: número ganador + ganador
const grupoGanadoresSeleccionado = ref(null) // Grupo de rifas para modal "Ver ganadores"
const modalAsignarFaltante = ref(false)
const faltanteSeleccionado = ref(null)
const socioSeleccionadoParaFaltante = ref('')
const asignandoFaltante = ref(false)
const numeroSeleccionado = ref(null)
const desplegableSocioAbierto = ref(false)
const filtroEstadoRifa = ref('todos') // 'todos', 'libre', 'vendido', 'pagado'
const formVentaRifa = reactive({
  numero: '',
  nombreComprador: '',
  telefonoComprador: '',
  socioVendedor: null,
  valor: 0,
  yaPago: false
})
const formLiquidar = reactive({
  premioEntregado: 0,
  numeroGanador: '' // Número ganador de la rifa (00-99) para mostrar en modal ganador
})
const formPagarRifa = reactive({
  numero: '',
  nombreComprador: '',
  valor: 0,
  yaPago: false
})

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalNuevaActividad)
useBodyScrollLock(modalDetalleActividad)
useBodyScrollLock(mostrarModalBienvenida)
useBodyScrollLock(modalVentaRifa)
useBodyScrollLock(modalPagarRifa)
useBodyScrollLock(modalLiquidarActividad)
useBodyScrollLock(modalConfirmarLiquidacionNegativa)
useBodyScrollLock(modalGanadorRifa)
useBodyScrollLock(computed(() => !!grupoGanadoresSeleccionado.value))
useBodyScrollLock(modalAsignarFaltante)

// Opciones para el dropdown de tipo de actividad (ítems estilizados)
const opcionesTipoActividad = [
  { value: 'rifa', label: 'Rifa', icon: TicketIcon, bgIcon: 'bg-natillera-500', textColor: 'text-natillera-700', desc: 'Números y sorteos' },
  { value: 'bingo', label: 'Bingo', icon: SparklesIcon, bgIcon: 'bg-amber-500', textColor: 'text-amber-700', desc: 'Juego de azar' },
  { value: 'venta', label: 'Venta', icon: ShoppingBagIcon, bgIcon: 'bg-blue-500', textColor: 'text-blue-700', desc: 'Venta de productos' },
  { value: 'evento', label: 'Evento', icon: CalendarIcon, bgIcon: 'bg-purple-500', textColor: 'text-purple-700', desc: 'Eventos y celebraciones' },
  { value: 'otro', label: 'Otro', icon: ClipboardDocumentListIcon, bgIcon: 'bg-slate-500', textColor: 'text-slate-700', desc: 'Otra actividad' }
]

// Opciones para cuándo se juega la rifa (solo actividades tipo rifa en curso)
const opcionesCuandoJuegoRifa = [
  { value: 'primera_quincena', label: 'Primera quincena' },
  { value: 'segunda_quincena', label: 'Segunda quincena' },
  { value: 'viernes_despues_primera', label: 'Viernes después de la 1ª quincena' },
  { value: 'viernes_despues_segunda', label: 'Viernes después de la 2ª quincena' },
  { value: 'fecha_especifica', label: 'Fecha específica' }
]

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

const formActividad = reactive({
  tipoProceso: 'liquidar', // 'liquidar' o 'en_curso'
  tipo: 'rifa',
  descripcion: '',
  ingresos: 0,
  gastos: 0,
  fechaLimitePago: '',
  tipoValores: 'iguales', // 'iguales' o 'diferentes'
  valorIgual: 0, // Valor único cuando tipoValores es 'iguales'
  valoresPorSocio: {}, // { socio_natillera_id: valor }
  // Campo para período seleccionado (reemplaza mesPago y anioPago)
  periodoSeleccionado: null, // { mes, anio } o null
  quincenaPago: null, // 1 o 2, solo si la natillera es quincenal
  // Campos legacy para compatibilidad (se mantienen pero se derivan de periodoSeleccionado)
  mesPago: new Date().getMonth() + 1, // Mes actual (1-12) - se actualiza desde periodoSeleccionado
  anioPago: new Date().getFullYear(), // Se actualiza desde periodoSeleccionado
  // Campo para múltiples meses (esMultiplesMeses usado en template; actividadMultiplesMeses legacy)
  esMultiplesMeses: false,
  actividadMultiplesMeses: false,
  mesesSeleccionados: [], // Array de objetos { mes, anio } para múltiples meses
  // Campo para tipo de rifa
  tipoRifa: null, // 'manual' o 'aleatoria', solo aplica cuando tipo === 'rifa'
  // Campo para cantidad de números por socio (solo para rifa automática)
  cantidadNumerosPorSocio: null,
  // Fecha de juego de la rifa (solo tipo rifa, en curso)
  cuandoJuegoRifa: null, // 'primera_quincena' | 'segunda_quincena' | 'viernes_despues_primera' | 'viernes_despues_segunda' | 'fecha_especifica'
  fechaJuegoRifa: '', // fecha YYYY-MM-DD cuando un solo mes y fecha_especifica
  fechasJuegoPorMes: {} // { 'mes-anio': 'YYYY-MM-DD' } cuando múltiples meses y fecha_especifica
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

// Solo las rifas dependen de "liquidar" para sumar a utilidad; el resto al pagarse suma.
// Las rifas en curso: lo recaudado se ve en el acumulado de la actividad, no en utilidades.
const utilidadTotal = computed(() => 
  actividades.value.reduce((sum, a) => {
    if (a.estado === 'liquidada') return sum + (a.utilidad || 0)
    if (a.estado === 'en_curso' && a.tipo === 'rifa') return sum
    if (a.estado === 'en_curso') return sum + ((a.total_pagado || 0) - (a.gastos || 0))
    return sum + (a.utilidad || 0)
  }, 0)
)

const totalesGanadoresGrupo = computed(() => {
  const g = grupoGanadoresSeleccionado.value
  if (!g?.actividades) return { recogido: 0, entregado: 0, natillera: 0 }
  const rifas = (g.actividades || []).filter(a => a.tipo === 'rifa' && a.estado === 'liquidada')
  return {
    recogido: rifas.reduce((s, a) => s + (parseFloat(a.ingresos) || 0), 0),
    entregado: rifas.reduce((s, a) => s + (parseFloat(a.gastos) || 0), 0),
    natillera: rifas.reduce((s, a) => s + (parseFloat(a.utilidad) || 0), 0)
  }
})

const totalARecaudar = computed(() => {
  if (formActividad.tipoProceso === 'en_curso' && formActividad.tipoValores === 'iguales') {
    return (formActividad.valorIgual || 0) * socios.value.length
  }
  return Object.values(formActividad.valoresPorSocio).reduce((sum, valor) => sum + (Number(valor) || 0), 0)
})

// Números de rifa ordenados numéricamente (00-99)
const numerosRifaOrdenados = computed(() => {
  return Object.values(numerosRifa.value)
    .sort((a, b) => {
      // Convertir a número para ordenar correctamente
      const numA = parseInt(a.numero, 10)
      const numB = parseInt(b.numero, 10)
      return numA - numB
    })
})

// Números de rifa filtrados por estado
const numerosRifaFiltrados = computed(() => {
  if (filtroEstadoRifa.value === 'todos') {
    return numerosRifaOrdenados.value
  }
  return numerosRifaOrdenados.value.filter(numero => numero.estado === filtroEstadoRifa.value)
})

// Total proyecto para rifa manual (100 números * valor de la rifa)
const totalProyectoRifa = computed(() => {
  if (actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'manual') {
    const valorRifa = Number(actividadSeleccionada.value.valor_rifa) || 0
    return 100 * valorRifa
  }
  return 0
})

// Total recaudado para rifa manual (suma de valores de números con estado "pagado")
const totalRecaudadoRifa = computed(() => {
  if (actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'manual') {
    return numerosRifaOrdenados.value
      .filter(n => n.estado === 'pagado')
      .reduce((sum, n) => sum + (Number(n.valor) || 0), 0)
  }
  return 0
})

// Total recaudado para liquidación (rifa manual: solo pagados, otras actividades: total_pagado)
const totalRecaudadoLiquidar = computed(() => {
  if (actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'manual') {
    return totalRecaudadoRifa.value
  }
  return actividadSeleccionada.value?.total_pagado || 0
})

// Función de debug para verificar items
function debugItem(item, index) {
  console.log(`🔍 Item ${index}:`, {
    tipo: item.tipo,
    esGrupo: item.tipo === 'grupo',
    tieneSerieId: !!item.serieId,
    tieneActividades: !!item.actividades,
    cantidadActividades: item.actividades?.length,
    tieneActividad: !!item.actividad,
    actividadId: item.actividad?.id
  })
  return true
}

// Agrupar actividades por actividad_serie_id
const actividadesAgrupadas = computed(() => {
  console.log('🔄 Agrupando actividades. Total:', actividades.value.length)
  const grupos = new Map()
  const actividadesIndividuales = []
  
  actividades.value.forEach(actividad => {
    // Validar que la actividad tenga id
    if (!actividad || !actividad.id) {
      console.warn('⚠️ Actividad sin id encontrada:', actividad)
      return
    }
    
    // Verificar si tiene actividad_serie_id (puede ser null, undefined, o un UUID)
    const serieId = actividad.actividad_serie_id
    if (serieId && serieId !== null && serieId !== 'null' && serieId !== '') {
      console.log('📦 Actividad con serie:', actividad.id, 'Serie ID:', serieId, 'Tipo:', typeof serieId)
      // Actividad que pertenece a una serie
      if (!grupos.has(serieId)) {
        // Obtener descripción base (sin el mes si está presente)
        const descripcionBase = actividad.descripcion && actividad.descripcion.includes(' - ') 
          ? actividad.descripcion.split(' - ')[0] 
          : (actividad.descripcion || 'Sin descripción')
        
        grupos.set(serieId, {
          serieId: serieId,
          actividades: [],
          descripcionBase: descripcionBase,
          tipoActividad: actividad.tipo, // Guardar el tipo de actividad original
          tipoRifa: actividad.tipo_rifa
        })
        // Los grupos vienen cerrados por defecto (no expandir automáticamente)
      }
      grupos.get(serieId).actividades.push(actividad)
    } else {
      // Actividad individual (sin serie)
      actividadesIndividuales.push({
        tipo: 'individual',
        actividad: actividad
      })
    }
  })
  
  // Convertir grupos a array y ordenar actividades dentro de cada grupo
  const gruposArray = Array.from(grupos.values()).map(grupo => {
    // Ordenar actividades del grupo por año y mes
    grupo.actividades.sort((a, b) => {
      if (a.anio_pago && a.mes_pago && b.anio_pago && b.mes_pago) {
        if (a.anio_pago !== b.anio_pago) {
          return a.anio_pago - b.anio_pago
        }
        return a.mes_pago - b.mes_pago
      }
      return 0
    })
    // IMPORTANTE: Crear un nuevo objeto con tipo: 'grupo' primero, luego el resto de propiedades
    // Esto asegura que tipo siempre sea 'grupo' y no se sobrescriba
    return {
      tipo: 'grupo', // Esto debe ir primero para que no se sobrescriba
      serieId: grupo.serieId,
      actividades: grupo.actividades,
      descripcionBase: grupo.descripcionBase,
      tipoActividad: grupo.tipoActividad, // Usar tipoActividad que se guardó al crear el grupo
      tipoRifa: grupo.tipoRifa
    }
  })
  
  // Combinar grupos y actividades individuales, grupos primero
  // Asegurar que todas las actividades individuales tengan la estructura correcta
  const actividadesIndividualesValidadas = actividadesIndividuales.filter(item => 
    item && item.actividad && item.actividad.id
  )
  
  console.log('✅ Agrupación completada:', {
    grupos: gruposArray.length,
    individuales: actividadesIndividualesValidadas.length,
    total: gruposArray.length + actividadesIndividualesValidadas.length
  })
  
  // Debug: mostrar detalles de los grupos
  if (gruposArray.length > 0) {
    console.log('📦 Grupos encontrados:', gruposArray.map(g => ({
      tipo: g.tipo,
      serieId: g.serieId,
      descripcion: g.descripcionBase,
      tipoActividad: g.tipo,
      tipoRifa: g.tipoRifa,
      cantidad: g.actividades.length,
      actividades: g.actividades.map(a => ({ id: a.id, descripcion: a.descripcion }))
    })))
  }
  
  const resultado = [...gruposArray, ...actividadesIndividualesValidadas]
  console.log('📋 Resultado final de agrupación:', resultado.length, 'items')
  console.log('📋 Estructura del primer item:', resultado[0] ? {
    tipo: resultado[0].tipo,
    tieneSerieId: !!resultado[0].serieId,
    tieneActividades: !!resultado[0].actividades,
    tieneActividad: !!resultado[0].actividad
  } : 'No hay items')
  
  return resultado
})

// Función para obtener números asignados de un socio (rifa automática)
function getNumerosAsignadosSocio(socioId) {
  return numerosAsignadosPorSocio.value[socioId] || []
}

// Función para calcular valores de un socio en rifa automática.
// Valor pagado considera ambos: lo registrado por número (numeros_rifa.estado) y lo registrado por socio (socios_actividad.valor_pagado),
// así si el socio pagó a nivel de socio, se muestra correctamente.
function getValoresSocioRifaAutomatica(socioAct) {
  const numeros = getNumerosAsignadosSocio(socioAct.socio_natillera_id)
  const valorAPagar = numeros.reduce((sum, n) => sum + (n.valor || 0), 0)
  const valorPagadoPorNumeros = numeros
    .filter(n => n.estado === 'pagado')
    .reduce((sum, n) => sum + (n.valor || 0), 0)
  const valorPagadoSocio = Number(socioAct.valor_pagado) || 0
  // Si el socio está marcado como pagado pero no hay valor en números ni en valor_pagado, considerar pago completo
  const pagadoPorEstado = socioAct.estado === 'pagado' && valorAPagar > 0 ? valorAPagar : 0
  const valorPagado = Math.min(
    valorAPagar,
    Math.max(valorPagadoPorNumeros, valorPagadoSocio, pagadoPorEstado)
  )
  const saldo = valorAPagar - valorPagado
  
  return {
    numeros: numeros.map(n => n.numero).sort((a, b) => parseInt(a) - parseInt(b)),
    valorAPagar,
    valorPagado,
    saldo
  }
}

// Para rifa aleatoria: estado mostrado según números (valor pagado vs valor a pagar), así el badge coincide con Valor pagado/Saldo
function getEstadoDisplaySocio(socioAct) {
  if (actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'aleatoria') {
    const { valorAPagar, valorPagado, saldo } = getValoresSocioRifaAutomatica(socioAct)
    if (valorAPagar <= 0) return socioAct.estado || 'pendiente'
    if (saldo <= 0) return 'pagado'
    if (valorPagado > 0) return 'parcial'
    return 'pendiente'
  }
  return socioAct.estado || 'pendiente'
}

// Función para verificar si un socio tiene el número buscado
function socioTieneNumero(socioAct) {
  if (!busquedaNumero.value) return true
  const numeros = getValoresSocioRifaAutomatica(socioAct).numeros
  const busqueda = busquedaNumero.value.trim().padStart(2, '0')
  return numeros.some(n => n === busqueda || n.includes(busquedaNumero.value.trim()))
}

// Función para verificar si un faltante tiene el número buscado
function faltanteTieneNumero(faltante) {
  if (!busquedaNumero.value) return true
  const busqueda = busquedaNumero.value.trim().padStart(2, '0')
  return faltante.numeros.some(n => n.numero === busqueda || n.numero.includes(busquedaNumero.value.trim()))
}

// Computed para filtrar socios según búsqueda
const sociosFiltrados = computed(() => {
  if (!busquedaNumero.value || !(actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'aleatoria')) {
    return sociosActividad.value
  }
  return sociosActividad.value.filter(socio => socioTieneNumero(socio))
})

// Computed para filtrar faltantes según búsqueda
const faltantesFiltrados = computed(() => {
  if (!busquedaNumero.value || !(actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'aleatoria')) {
    return faltantes.value
  }
  return faltantes.value.filter(faltante => faltanteTieneNumero(faltante))
})

// Computed para obtener socios sin números asignados
const sociosSinNumeros = computed(() => {
  if (!actividadSeleccionada.value || actividadSeleccionada.value.tipo !== 'rifa' || actividadSeleccionada.value.tipo_rifa !== 'aleatoria') {
    return []
  }
  
  // Obtener IDs de socios que ya tienen números asignados
  // Convertir todas las claves a strings para comparación consistente
  const sociosConNumeros = new Set(
    Object.keys(numerosAsignadosPorSocio.value).map(id => String(id))
  )
  
  // Obtener IDs de socios que ya tienen registro en socios_actividad para esta actividad
  const sociosConRegistroEnActividad = new Set(
    sociosActividad.value.map(sa => String(sa.socio_natillera_id))
  )
  
  // Obtener todos los socios de la natillera (de socios_natillera)
  const todosLosSocios = socios.value || []
  
  // Filtrar socios que:
  // 1. Están en la natillera (socios_natillera)
  // 2. NO tienen registro en socios_actividad para esta actividad específica
  // 3. NO tienen números asignados
  const sociosElegibles = todosLosSocios.filter(socio => {
    const socioId = String(socio.id)
    
    // Excluir si ya tiene registro en socios_actividad para esta actividad
    if (sociosConRegistroEnActividad.has(socioId)) {
      return false
    }
    
    // Excluir si ya tiene números asignados
    const tieneNumerosEnMapa = sociosConNumeros.has(socioId)
    if (tieneNumerosEnMapa) {
      return false
    }
    
    // Verificar directamente si tiene números asignados
    const numerosDelSocio = getNumerosAsignadosSocio(socio.id)
    if (numerosDelSocio.length > 0) {
      return false
    }
    
    return true // Este socio es elegible
  })
  
  // Convertir a formato socios_actividad para mantener consistencia en el template
  // El objeto 'socio' ya tiene la estructura: { id, ..., socio: { nombre, telefono, ... } }
  // Necesitamos mantener esa estructura para que el template funcione correctamente
  return sociosElegibles.map(socioNatillera => ({
    id: null, // No tiene registro en socios_actividad aún
    socio_natillera_id: socioNatillera.id,
    socio_natillera: socioNatillera, // Este objeto ya tiene la estructura correcta con 'socio' anidado
    valor_asignado: 0,
    valor_pagado: 0,
    estado: 'pendiente'
  }))
})

// Utilidad calculada para liquidación
const utilidadLiquidar = computed(() => {
  const recaudado = totalRecaudadoLiquidar.value
  const premio = formLiquidar.premioEntregado || 0
  return recaudado - premio
})

// Número ganador válido (1 o 2 dígitos, 0-99) para liquidar rifa
const numeroGanadorValido = computed(() => {
  const n = String(formLiquidar.numeroGanador || '').replace(/\D/g, '')
  if (n.length === 0) return false
  const num = parseInt(n, 10)
  return num >= 0 && num <= 99
})

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

// Función para formatear número con separador de miles (punto)
function formatNumberWithSeparator(value) {
  if (!value && value !== 0) return ''
  const numStr = String(value).replace(/\./g, '')
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Función para parsear número con separador de miles
function parseNumberWithSeparator(value) {
  if (!value) return 0
  const numStr = String(value).replace(/\./g, '')
  const num = parseFloat(numStr) || 0
  return num
}

// Formatear valor para input: miles con punto, decimales con coma (es-CO)
function formatMilesInput(value) {
  if (value === null || value === undefined || value === '') return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  const [intPart, decPart] = num.toFixed(2).split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decTrimmed = decPart.replace(/0+$/, '')
  if (!decTrimmed) return formattedInt
  return formattedInt + ',' + decTrimmed
}

// Parsear valor de input con punto como miles y coma como decimal
function parseMilesInput(str) {
  if (!str || typeof str !== 'string') return 0
  const cleaned = str.trim().replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function formatMoneyCompact(value) {
  const num = Number(value) || 0
  if (num === 0) return '0'
  
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum >= 1000000) {
    // Millones
    const millions = absNum / 1000000
    if (millions % 1 === 0) {
      return `${sign}${millions}M`
    }
    return `${sign}${millions.toFixed(1)}M`
  } else if (absNum >= 1000) {
    // Miles
    const thousands = absNum / 1000
    if (thousands % 1 === 0) {
      return `${sign}${thousands}k`
    }
    return `${sign}${thousands.toFixed(1)}k`
  }
  
  return new Intl.NumberFormat('es-CO').format(num)
}

function getIconoActividad(tipo, tipoRifa = null) {
  // Si es rifa, personalizar según el tipo de rifa
  if (tipo === 'rifa' && tipoRifa) {
    if (tipoRifa === 'manual') {
      return PencilSquareIcon
    } else if (tipoRifa === 'aleatoria') {
      return CubeIcon
    }
  }
  
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

// Funciones para expandir/colapsar grupos
function toggleGrupo(serieId) {
  console.log('🔄 Toggle grupo:', serieId, 'Estado actual:', gruposExpandidos.value[serieId])
  // Usar Vue.set o simplemente asignar directamente para que Vue detecte el cambio
  gruposExpandidos.value[serieId] = !gruposExpandidos.value[serieId]
  console.log('✅ Nuevo estado:', gruposExpandidos.value[serieId] ? 'expandido' : 'colapsado')
}

function isGrupoExpandido(serieId) {
  return gruposExpandidos.value[serieId] === true
}

// Función para exportar un grupo de actividades a Excel
async function exportarGrupoAExcel(grupo) {
  try {
    // Verificar si es una rifa
    const esRifa = grupo.tipoActividad === 'rifa'
    
    // Obtener información de socios_actividad para cada actividad del grupo
    const datosExportar = []
    const datosRifaSocios = [] // Para la pestaña de socios con números (solo rifas)
    
    for (const actividad of grupo.actividades) {
      const nombreMes = actividad.mes_pago 
        ? meses.find(m => m.value === actividad.mes_pago)?.label || `Mes ${actividad.mes_pago}`
        : 'N/A'
      
      // Obtener socios_actividad para esta actividad
      const { data: sociosActividad, error } = await supabase
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
      
      if (error) {
        console.error('Error obteniendo socios_actividad:', error)
        continue
      }
      
      // Si es rifa, obtener números de rifa
      let numerosRifa = []
      if (esRifa) {
        const { data: numerosData, error: errorNumeros } = await supabase
          .from('numeros_rifa')
          .select(`
            *,
            socio_vendedor:socios_natillera(
              *,
              socio:socios(*)
            )
          `)
          .eq('actividad_id', actividad.id)
          .order('numero', { ascending: true })
        
        if (!errorNumeros && numerosData) {
          numerosRifa = numerosData
        }
      }
      
      // Agregar datos de cada socio
      if (sociosActividad && sociosActividad.length > 0) {
        sociosActividad.forEach(sa => {
          const nombreSocio = sa.socio_natillera?.socio?.nombre || 'N/A'
          
          // Para rifas: obtener números asignados a este socio
          let numerosSocio = []
          if (esRifa && numerosRifa.length > 0) {
            numerosSocio = numerosRifa
              .filter(n => n.socio_vendedor_id === sa.socio_natillera_id)
              .map(n => n.numero)
              .sort((a, b) => parseInt(a) - parseInt(b))
          }
          
          // Datos para la pestaña general (o cifras si es rifa)
          datosExportar.push({
            'Mes': nombreMes,
            'Año': actividad.anio_pago || 'N/A',
            'Socio': nombreSocio,
            'Valor Asignado': sa.valor_asignado || 0,
            'Valor Pagado': sa.valor_pagado || 0,
            'Valor Pendiente': (sa.valor_asignado || 0) - (sa.valor_pagado || 0),
            'Estado': sa.estado === 'pagado' ? 'Pagado' : 
                     sa.estado === 'parcial' ? 'Parcial' : 
                     sa.estado === 'mora' ? 'En Mora' : 'Pendiente',
            'Fecha Límite': sa.fecha_limite_pago ? formatDate(sa.fecha_limite_pago) : 'N/A'
          })
          
          // Para rifas: datos para la pestaña de socios con números
          if (esRifa) {
            datosRifaSocios.push({
              'Mes': nombreMes,
              'Año': actividad.anio_pago || 'N/A',
              'Socio': nombreSocio,
              'Números': numerosSocio.length > 0 ? numerosSocio.join(', ') : 'Sin números',
              'Cantidad Números': numerosSocio.length,
              'Valor Asignado': sa.valor_asignado || 0,
              'Valor Pagado': sa.valor_pagado || 0,
              'Valor Pendiente': (sa.valor_asignado || 0) - (sa.valor_pagado || 0),
              'Estado': sa.estado === 'pagado' ? 'Pagado' : 
                       sa.estado === 'parcial' ? 'Parcial' : 
                       sa.estado === 'mora' ? 'En Mora' : 'Pendiente'
            })
          }
        })
      } else {
        // Si no hay socios_actividad, agregar solo la información de la actividad
        datosExportar.push({
          'Mes': nombreMes,
          'Año': actividad.anio_pago || 'N/A',
          'Socio': 'Sin asignación',
          'Valor Asignado': 0,
          'Valor Pagado': actividad.ingresos || 0,
          'Valor Pendiente': 0,
          'Estado': actividad.estado === 'liquidada' ? 'Liquidada' : actividad.estado || 'N/A',
          'Fecha Límite': actividad.fecha_limite_pago ? formatDate(actividad.fecha_limite_pago) : 'N/A'
        })
      }
    }
    
    if (datosExportar.length === 0 && (!esRifa || datosRifaSocios.length === 0)) {
      notificationStore.warning('No hay datos para exportar en este grupo', 'Advertencia')
      return
    }
    
    // Calcular totales
    const titulo = grupo.descripcionBase
    const totalActividades = grupo.actividades.length
    const totalAsignado = datosExportar.reduce((sum, row) => sum + (Number(row['Valor Asignado']) || 0), 0)
    const totalPagado = datosExportar.reduce((sum, row) => sum + (Number(row['Valor Pagado']) || 0), 0)
    const totalPendiente = datosExportar.reduce((sum, row) => sum + (Number(row['Valor Pendiente']) || 0), 0)
    
    // Crear el libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Definir estilos y colores
    const colorIndigo = { rgb: '6366F1' } // indigo-500
    const colorIndigoOscuro = { rgb: '4338CA' } // indigo-700
    const colorGrisClaro = { rgb: 'F3F4F6' } // gray-100
    const colorRojo = { rgb: 'DC2626' } // red-600
    const colorNaranja = { rgb: 'F97316' } // orange-500
    const colorAzul = { rgb: '3B82F6' } // blue-500
    
    // Función auxiliar para estilizar una hoja
    function estilizarHoja(ws, columnas, datos, headerRow = 9, infoRows = null) {
      if (infoRows) {
        XLSX.utils.sheet_add_aoa(ws, infoRows, { origin: 'A1' })
      }
      
      XLSX.utils.sheet_add_aoa(ws, [columnas], { origin: `A${headerRow}` })
      XLSX.utils.sheet_add_json(ws, datos, { origin: `A${headerRow + 1}`, skipHeader: true })
      
      const range = XLSX.utils.decode_range(ws['!ref'])
      
      // Estilizar título si hay infoRows
      if (infoRows && infoRows.length > 0) {
        ws['A1'].s = {
          fill: { fgColor: colorIndigo, patternType: 'solid' },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 16 },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
        if (!ws['!merges']) ws['!merges'] = []
        ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: columnas.length - 1 } })
        
        if (infoRows.length > 1) {
          ws['A2'].s = {
            font: { bold: true, sz: 12, color: { rgb: '4B5563' } }
          }
          ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: columnas.length - 1 } })
        }
        
        if (infoRows.length > 3) {
          ws['A4'].s = {
            fill: { fgColor: colorGrisClaro, patternType: 'solid' },
            font: { bold: true, sz: 12, color: { rgb: '1F2937' } }
          }
        }
      }
      
      // Estilizar header
      for (let col = 0; col < columnas.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: col })
        if (!ws[cellAddress]) continue
        
        ws[cellAddress].s = {
          fill: { fgColor: colorIndigo, patternType: 'solid' },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: colorIndigoOscuro.rgb } },
            bottom: { style: 'thin', color: { rgb: colorIndigoOscuro.rgb } },
            left: { style: 'thin', color: { rgb: colorIndigoOscuro.rgb } },
            right: { style: 'thin', color: { rgb: colorIndigoOscuro.rgb } }
          }
        }
      }
      
      // Estilizar filas de datos
      for (let row = headerRow; row <= range.e.r; row++) {
        const isEven = (row - headerRow) % 2 === 0
        const dataRow = row - headerRow
        const fila = datos[dataRow]
        
        if (!fila) continue
        
        for (let col = 0; col < columnas.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!ws[cellAddress]) continue
          
          const colName = columnas[col]
          let bgColor = isEven ? { rgb: 'FFFFFF' } : colorGrisClaro
          let textColor = { rgb: '1F2937' }
          
          if (colName === 'Estado') {
            const estado = fila['Estado']
            if (estado === 'Pagado') {
              bgColor = { rgb: 'D1FAE5' }
              textColor = { rgb: '047857' }
            } else if (estado === 'En Mora') {
              bgColor = { rgb: 'FEE2E2' }
              textColor = colorRojo
            } else if (estado === 'Parcial') {
              bgColor = { rgb: 'DBEAFE' }
              textColor = colorAzul
            } else if (estado === 'Pendiente') {
              bgColor = { rgb: 'FED7AA' }
              textColor = colorNaranja
            }
          } else if (colName === 'Valor Pagado' && typeof fila['Valor Pagado'] === 'number' && fila['Valor Pagado'] > 0) {
            textColor = { rgb: '047857' }
          } else if (colName === 'Valor Pendiente' && typeof fila['Valor Pendiente'] === 'number' && fila['Valor Pendiente'] > 0) {
            textColor = colorNaranja
          }
          
          ws[cellAddress].s = {
            fill: { fgColor: bgColor, patternType: 'solid' },
            font: { color: textColor, sz: 10 },
            alignment: {
              horizontal: colName.includes('Valor') ? 'right' : 'left',
              vertical: 'center',
              wrapText: true
            },
            border: {
              top: { style: 'thin', color: { rgb: 'E5E7EB' } },
              bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
              left: { style: 'thin', color: { rgb: 'E5E7EB' } },
              right: { style: 'thin', color: { rgb: 'E5E7EB' } }
            }
          }
          
          if (colName.includes('Valor') && typeof fila[colName] === 'number') {
            ws[cellAddress].z = '#,##0'
          }
        }
      }
    }
    
    if (esRifa) {
      // PESTAÑA 1: Números por socio (formato de cuadrícula)
      // Mapeo de meses con abreviaturas según la imagen
      const mesesLabels = {
        1: 'ENERO',
        2: 'FEBRERO',
        3: 'MARZO',
        4: 'ABRIL',
        5: 'MAYO',
        6: 'JUNIO',
        7: 'JULIO',
        8: 'AGOSTO',
        9: 'SEPT',
        10: 'OCT',
        11: 'NOV',
        12: 'DIC'
      }
      
      // Obtener todos los meses únicos presentes en las actividades
      const mesesPresentes = new Set()
      const sociosUnicos = new Map() // Map<socio_id, {nombre, numerosPorMes}>
      
      // Obtener todos los datos de una vez (con paginación para evitar límite de 1000 filas de Supabase)
      const actividadesIds = grupo.actividades.map(a => a.id)
      const PAGE_SIZE = 1000

      // Helper: traer todas las filas paginando (Supabase limita 1000 filas por defecto)
      async function fetchAllRows (table, selectQuery) {
        const all = []
        let from = 0
        let hasMore = true
        while (hasMore) {
          const to = from + PAGE_SIZE - 1
          const query = supabase
            .from(table)
            .select(selectQuery)
            .in('actividad_id', actividadesIds)
            .order('id', { ascending: true })
            .range(from, to)
          const { data, error } = await query
          if (error) throw error
          if (!data || data.length === 0) break
          all.push(...data)
          hasMore = data.length === PAGE_SIZE
          from += PAGE_SIZE
        }
        return all
      }

      // Obtener todos los socios_actividad (todas las páginas)
      const todosSociosActividad = await fetchAllRows(
        'socios_actividad',
        `
          *,
          actividad:actividades(id, mes_pago),
          socio_natillera:socios_natillera(
            *,
            socio:socios(*)
          )
        `
      )

      // Obtener todos los números de rifa (todas las páginas)
      const todosNumerosRifa = await fetchAllRows('numeros_rifa', '*')
      
      // Procesar datos
      if (todosSociosActividad && todosSociosActividad.length > 0) {
        todosSociosActividad.forEach(sa => {
          const actividad = sa.actividad
          const mesValue = actividad?.mes_pago
          
          if (mesValue) {
            mesesPresentes.add(mesValue)
            
            const socioId = sa.socio_natillera_id
            const nombreSocio = sa.socio_natillera?.socio?.nombre || 'N/A'
            
            if (!sociosUnicos.has(socioId)) {
              sociosUnicos.set(socioId, {
                nombre: nombreSocio,
                numerosPorMes: {}
              })
            }
            
            // Obtener números de este socio para esta actividad
            const numerosSocio = todosNumerosRifa
              ?.filter(n => n.actividad_id === actividad.id && n.socio_vendedor_id === socioId)
              .map(n => n.numero)
              .sort((a, b) => parseInt(a) - parseInt(b)) || []
            
            if (!sociosUnicos.get(socioId).numerosPorMes[mesValue]) {
              sociosUnicos.get(socioId).numerosPorMes[mesValue] = []
            }
            // Agregar números sin duplicados
            const numerosExistentes = sociosUnicos.get(socioId).numerosPorMes[mesValue]
            numerosSocio.forEach(num => {
              if (!numerosExistentes.includes(num)) {
                numerosExistentes.push(num)
              }
            })
          }
        })
      }
      
      // Ordenar meses
      const mesesOrdenados = Array.from(mesesPresentes).sort((a, b) => a - b)
      
      // Cada mes tiene exactamente 4 columnas (como en la imagen)
      const COLUMNAS_POR_MES = 4
      
      // Crear estructura de datos para la hoja
      // Cada fila es un participante con sus números en cada mes
      const datosTabla = []
      
      sociosUnicos.forEach((socioData, socioId) => {
        const fila = []
        
        // Primero agregar el nombre del participante
        fila.push(socioData.nombre)
        
        // Luego, para cada mes, agregar los números que tiene este socio (máximo 4)
        mesesOrdenados.forEach(mesValue => {
          const numerosDelSocioEnEsteMes = (socioData.numerosPorMes[mesValue] || [])
            .sort((a, b) => parseInt(a) - parseInt(b))
            .slice(0, COLUMNAS_POR_MES) // Limitar a 4 números máximo
          
          // Agregar los números del socio (hasta 4)
          for (let i = 0; i < COLUMNAS_POR_MES; i++) {
            if (i < numerosDelSocioEnEsteMes.length) {
              fila.push(numerosDelSocioEnEsteMes[i])
            } else {
              fila.push('') // Llenar con vacío si tiene menos de 4 números
            }
          }
        })
        
        datosTabla.push(fila)
      })
      
      // Crear encabezados (solo una fila con nombres de meses fusionados)
      const headerRow = []
      
      // Primera fila: PARTICIPANTES + nombres de meses (cada mes fusionado sobre 4 columnas)
      headerRow.push('PARTICIPANTES')
      mesesOrdenados.forEach(mesValue => {
        const mesLabel = mesesLabels[mesValue] || `Mes ${mesValue}`
        headerRow.push(mesLabel)
        // Agregar espacios vacíos para las otras 3 columnas bajo este mes
        for (let i = 1; i < COLUMNAS_POR_MES; i++) {
          headerRow.push('')
        }
      })
      
      // Crear hoja con encabezados y datos (sin fila de números como encabezado)
      const wsSocios = XLSX.utils.aoa_to_sheet([headerRow, ...datosTabla])
      
      // Colores
      const colorAzulOscuro = { rgb: '3366FF' } // Azul oscuro para encabezados
      const colorAzulClaro = { rgb: 'DBE5F1' } // Azul claro para columnas pares
      const colorBlanco = { rgb: 'FFFFFF' } // Blanco para columnas impares
      const colorNegro = { rgb: '000000' } // Negro para bordes
      
      // Fusionar celdas para los encabezados de meses
      if (!wsSocios['!merges']) wsSocios['!merges'] = []
      
      // Fusionar PARTICIPANTES (no necesita fusionar, es solo una columna)
      // Fusionar cada mes sobre sus 4 columnas
      let currentCol = 1 // Empezar después de PARTICIPANTES (columna 0)
      mesesOrdenados.forEach(mesValue => {
        const startCol = currentCol
        const endCol = currentCol + COLUMNAS_POR_MES - 1
        wsSocios['!merges'].push({ s: { r: 0, c: startCol }, e: { r: 0, c: endCol } })
        currentCol += COLUMNAS_POR_MES
      })
      
      // Estilizar encabezado PARTICIPANTES (fila 0, columna 0)
      const cellParticipantes = XLSX.utils.encode_cell({ r: 0, c: 0 })
      if (wsSocios[cellParticipantes]) {
        wsSocios[cellParticipantes].s = {
          fill: { fgColor: colorAzulOscuro, patternType: 'solid' },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: colorNegro },
            bottom: { style: 'thin', color: colorNegro },
            left: { style: 'thin', color: colorNegro },
            right: { style: 'thin', color: colorNegro }
          }
        }
      }
      
      // Estilizar encabezados de meses (fila 0)
      currentCol = 1
      mesesOrdenados.forEach(mesValue => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: currentCol })
        if (wsSocios[cellAddress]) {
          wsSocios[cellAddress].s = {
            fill: { fgColor: colorAzulOscuro, patternType: 'solid' },
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: colorNegro },
              bottom: { style: 'thin', color: colorNegro },
              left: { style: 'thin', color: colorNegro },
              right: { style: 'thin', color: colorNegro }
            }
          }
        }
        currentCol += COLUMNAS_POR_MES
      })
      
      // Estilizar filas de datos (desde fila 1 en adelante)
      const range = XLSX.utils.decode_range(wsSocios['!ref'])
      for (let row = 1; row <= range.e.r; row++) {
        let col = 0
        
        // Columna PARTICIPANTES
        const cellParticipantes = XLSX.utils.encode_cell({ r: row, c: col })
        if (wsSocios[cellParticipantes]) {
          wsSocios[cellParticipantes].s = {
            fill: { fgColor: colorBlanco, patternType: 'solid' },
            font: { color: { rgb: '000000' }, sz: 10 },
            alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
            border: {
              top: { style: 'thin', color: colorNegro },
              bottom: { style: 'thin', color: colorNegro },
              left: { style: 'thin', color: colorNegro },
              right: { style: 'thin', color: colorNegro }
            }
          }
        }
        col++
        
        // Columnas de números por mes
        mesesOrdenados.forEach((mesValue, mesIndex) => {
          for (let numIndex = 0; numIndex < COLUMNAS_POR_MES; numIndex++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            if (!wsSocios[cellAddress]) {
              col++
              continue
            }
            
            // Sombreado alternado: meses pares (índice 0, 2, 4...) -> azul claro, impares -> blanco
            // Dentro de cada mes, columnas pares (0, 2) -> azul claro, impares (1, 3) -> blanco
            let bgColor = colorBlanco
            if (mesIndex % 2 === 0) {
              // Mes par (ENERO, MARZO, MAYO, etc.) - columnas pares azul claro
              if (numIndex % 2 === 0) {
                bgColor = colorAzulClaro
              }
            } else {
              // Mes impar (FEBRERO, ABRIL, JUNIO, etc.) - columnas impares azul claro
              if (numIndex % 2 === 1) {
                bgColor = colorAzulClaro
              }
            }
            
            wsSocios[cellAddress].s = {
              fill: { fgColor: bgColor, patternType: 'solid' },
              font: { color: { rgb: '000000' }, sz: 10 },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: {
                top: { style: 'thin', color: colorNegro },
                bottom: { style: 'thin', color: colorNegro },
                left: { style: 'thin', color: colorNegro },
                right: { style: 'thin', color: colorNegro }
              }
            }
            
            col++
          }
        })
      }
      
      // Ajustar ancho de columnas
      const colWidths = [{ wch: 25 }] // PARTICIPANTES
      mesesOrdenados.forEach(() => {
        // 4 columnas de 8 caracteres cada una por mes
        for (let i = 0; i < COLUMNAS_POR_MES; i++) {
          colWidths.push({ wch: 8 })
        }
      })
      wsSocios['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(wb, wsSocios, 'Números por socio')
      
      // PESTAÑA 2: Cifras
      const wsCifras = XLSX.utils.json_to_sheet(datosExportar)
      const columnasCifras = ['Mes', 'Año', 'Socio', 'Valor Asignado', 'Valor Pagado', 'Valor Pendiente', 'Estado', 'Fecha Límite']
      const infoRowsCifras = [
        [titulo],
        [`Rifa - Cifras y Resumen`],
        [`Actividades: ${totalActividades} meses`],
        [],
        ['Resumen'],
        [`Total Asignado: $${formatMoney(totalAsignado)}`],
        [`Total Pagado: $${formatMoney(totalPagado)}`],
        [`Total Pendiente: $${formatMoney(totalPendiente)}`],
        []
      ]
      estilizarHoja(wsCifras, columnasCifras, datosExportar, 10, infoRowsCifras)
      wsCifras['!cols'] = [
        { wch: 12 }, // Mes
        { wch: 8 },  // Año
        { wch: 25 }, // Socio
        { wch: 15 }, // Valor Asignado
        { wch: 15 }, // Valor Pagado
        { wch: 15 }, // Valor Pendiente
        { wch: 12 }, // Estado
        { wch: 15 }  // Fecha Límite
      ]
      XLSX.utils.book_append_sheet(wb, wsCifras, 'Cifras')
    } else {
      // Para actividades no-rifa: una sola pestaña
      const ws = XLSX.utils.json_to_sheet(datosExportar)
      const columnas = ['Mes', 'Año', 'Socio', 'Valor Asignado', 'Valor Pagado', 'Valor Pendiente', 'Estado', 'Fecha Límite']
      const infoRows = [
        [titulo],
        [`Actividades: ${totalActividades} meses`],
        [],
        ['Resumen'],
        [`Total Asignado: $${formatMoney(totalAsignado)}`],
        [`Total Pagado: $${formatMoney(totalPagado)}`],
        [`Total Pendiente: $${formatMoney(totalPendiente)}`],
        []
      ]
      estilizarHoja(ws, columnas, datosExportar, 9, infoRows)
      ws['!cols'] = [
        { wch: 12 }, // Mes
        { wch: 8 },  // Año
        { wch: 25 }, // Socio
        { wch: 15 }, // Valor Asignado
        { wch: 15 }, // Valor Pagado
        { wch: 15 }, // Valor Pendiente
        { wch: 12 }, // Estado
        { wch: 15 }  // Fecha Límite
      ]
      XLSX.utils.book_append_sheet(wb, ws, 'Actividades')
    }
    
    // Generar el nombre del archivo
    const nombreArchivo = `${grupo.descripcionBase.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo)
    
    notificationStore.success('Grupo exportado a Excel exitosamente', 'Éxito')
  } catch (error) {
    console.error('Error exportando grupo a Excel:', error)
    notificationStore.error('Error al exportar el grupo a Excel', 'Error')
  }
}

// Inicializar números de rifa del 00 al 99
function inicializarNumerosRifa() {
  const numeros = {}
  for (let i = 0; i <= 99; i++) {
    const numeroStr = String(i).padStart(2, '0')
    numeros[numeroStr] = {
      estado: 'libre',
      numero: numeroStr,
      nombreComprador: '',
      telefonoComprador: '',
      socioVendedor: null,
      valor: 0
    }
  }
  return numeros
}

async function verDetalleActividad(actividad) {
  actividadSeleccionada.value = actividad
  modalDetalleActividad.value = true
  
  // Si es rifa manual, inicializar números y cargar socios
  if (actividad.tipo === 'rifa' && actividad.tipo_rifa === 'manual') {
    numerosRifa.value = inicializarNumerosRifa()
    // Cargar socios para el selector de vendedor
    await fetchSocios()
    
    // Cargar números vendidos/pagados desde la base de datos
    try {
      const { data: numerosData, error } = await supabase
        .from('numeros_rifa')
        .select('*')
        .eq('actividad_id', actividad.id)
      
      if (error) throw error
      
      // Actualizar los números con los datos de la base de datos
      if (numerosData && numerosData.length > 0) {
        numerosData.forEach(numeroDb => {
          if (numerosRifa.value[numeroDb.numero]) {
            numerosRifa.value[numeroDb.numero] = {
              estado: numeroDb.estado,
              numero: numeroDb.numero,
              nombreComprador: numeroDb.nombre_comprador || '',
              telefonoComprador: numeroDb.telefono_comprador || '',
              socioVendedor: numeroDb.socio_vendedor_id,
              valor: Number(numeroDb.valor) || 0
            }
          }
        })
      }
    } catch (e) {
      console.error('Error cargando números de rifa:', e)
      // Continuar con números libres si hay error
    }
  }
  
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
    
    // Nota: El estado de mora se calcula y muestra en el frontend
    // No es necesario actualizar la BD cada vez que se abre el detalle
    
    sociosActividad.value = data || []
    
    // Limpiar búsqueda al cambiar de actividad
    busquedaNumero.value = ''
    
    // Si es rifa automática, cargar números asignados por socio y faltantes
    if (actividad.tipo === 'rifa' && actividad.tipo_rifa === 'aleatoria') {
      try {
        const { data: numerosData, error: errorNumeros } = await supabase
          .from('numeros_rifa')
          .select('numero, socio_vendedor_id, estado, valor, nombre_comprador')
          .eq('actividad_id', actividad.id)
        
        if (errorNumeros) throw errorNumeros
        
        // Agrupar números por socio y faltantes
        numerosAsignadosPorSocio.value = {}
        const faltantesMap = {} // { 'Faltante 1': [numeros], ... }
        
        if (numerosData && numerosData.length > 0) {
          numerosData.forEach(numero => {
            if (numero.socio_vendedor_id) {
              // Es un socio real
              if (!numerosAsignadosPorSocio.value[numero.socio_vendedor_id]) {
                numerosAsignadosPorSocio.value[numero.socio_vendedor_id] = []
              }
              numerosAsignadosPorSocio.value[numero.socio_vendedor_id].push({
                numero: numero.numero,
                estado: numero.estado,
                valor: Number(numero.valor) || 0
              })
            } else if (numero.nombre_comprador && numero.nombre_comprador.startsWith('Faltante')) {
              // Es un faltante
              const nombreFaltante = numero.nombre_comprador
              if (!faltantesMap[nombreFaltante]) {
                faltantesMap[nombreFaltante] = []
              }
              faltantesMap[nombreFaltante].push({
                numero: numero.numero,
                estado: numero.estado,
                valor: Number(numero.valor) || 0
              })
            }
          })
        }
        
        // Convertir faltantes map a array ordenado
        faltantes.value = Object.entries(faltantesMap)
          .map(([nombre, numeros]) => ({
            nombre,
            numeros: numeros.sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
          }))
          .sort((a, b) => {
            // Ordenar por número del faltante (Faltante 1, Faltante 2, etc.)
            const numA = parseInt(a.nombre.replace('Faltante ', ''))
            const numB = parseInt(b.nombre.replace('Faltante ', ''))
            return numA - numB
          })
      } catch (e) {
        console.error('Error cargando números asignados:', e)
        numerosAsignadosPorSocio.value = {}
        faltantes.value = []
      }
    } else {
      numerosAsignadosPorSocio.value = {}
      faltantes.value = []
    }
  } catch (e) {
    console.error('Error cargando socios de actividad:', e)
    sociosActividad.value = []
    numerosAsignadosPorSocio.value = {}
  }
}

function handleVentaRifaValorInput(event) {
  const inputValue = event.target.value
  // Permitir solo números y puntos
  const cleanedValue = inputValue.replace(/[^0-9.]/g, '')
  // Parsear el valor
  const parsedValue = parseNumberWithSeparator(cleanedValue)
  formVentaRifa.valor = parsedValue
  // Actualizar el input con formato
  event.target.value = formatNumberWithSeparator(parsedValue)
}

function handlePremioEntregadoInput(event) {
  const inputValue = event.target.value
  // Permitir solo números y puntos
  const cleanedValue = inputValue.replace(/[^0-9.]/g, '')
  // Parsear el valor
  const parsedValue = parseNumberWithSeparator(cleanedValue)
  formLiquidar.premioEntregado = parsedValue
  // Actualizar el input con formato
  event.target.value = formatNumberWithSeparator(parsedValue)
}

function abrirModalLiquidar() {
  // Solo permitir liquidar actividades de tipo rifa
  if (!actividadSeleccionada.value || actividadSeleccionada.value.tipo !== 'rifa') {
    notificationStore.error('Solo se pueden liquidar actividades de tipo rifa', 'Error')
    return
  }
  formLiquidar.premioEntregado = 0
  formLiquidar.numeroGanador = ''
  modalLiquidarActividad.value = true
}

function abrirModalGanadorRifa(actividad) {
  actividadSeleccionada.value = actividad
  modalGanadorRifa.value = true
}

function abrirModalGanadoresGrupo(grupo) {
  grupoGanadoresSeleccionado.value = grupo
}

async function guardarLiquidacion() {
  if (!actividadSeleccionada.value) {
    notificationStore.error('Error: actividad no seleccionada', 'Error')
    return
  }

  if (!formLiquidar.premioEntregado || formLiquidar.premioEntregado <= 0) {
    notificationStore.error('Debe ingresar el premio entregado', 'Error')
    return
  }

  const utilidad = utilidadLiquidar.value

  // Si la utilidad es negativa, mostrar modal de confirmación
  if (utilidad < 0) {
    modalConfirmarLiquidacionNegativa.value = true
    return
  }

  // Si la utilidad es positiva o cero, proceder directamente
  await confirmarLiquidacion()
}

async function confirmarLiquidacion() {
  loading.value = true
  try {
    const totalRecaudado = totalRecaudadoLiquidar.value
    const premioEntregado = formLiquidar.premioEntregado
    const utilidadNormal = utilidadLiquidar.value
    const numeroGanador = String(formLiquidar.numeroGanador || '').replace(/\D/g, '').padStart(2, '0')

    // Obtener ganador desde numeros_rifa (socio o Faltante)
    let ganadorNombre = 'Desconocido'
    let ganadorSocioNatilleraId = null
    let ganadorEsFaltante = false
    let utilidadFinal = utilidadNormal
    let gastosFinal = premioEntregado

    const { data: numeroGanadorData } = await supabase
      .from('numeros_rifa')
      .select('id, nombre_comprador, socio_vendedor_id, socio_vendedor:socios_natillera(socio:socios(nombre))')
      .eq('actividad_id', actividadSeleccionada.value.id)
      .eq('numero', numeroGanador)
      .maybeSingle()

    if (numeroGanadorData) {
      const esFaltante = numeroGanadorData.nombre_comprador && String(numeroGanadorData.nombre_comprador).trim().toLowerCase().startsWith('faltante')
      if (esFaltante) {
        ganadorEsFaltante = true
        ganadorNombre = 'Natillera'
        ganadorSocioNatilleraId = null
        // Premio + utilidad pasan a la natillera: utilidad = total recaudado, gastos = 0
        utilidadFinal = totalRecaudado
        gastosFinal = 0
      } else {
        ganadorNombre = numeroGanadorData.nombre_comprador || numeroGanadorData.socio_vendedor?.socio?.nombre || 'Desconocido'
        ganadorSocioNatilleraId = numeroGanadorData.socio_vendedor_id || null
      }
    }

    // 1. Actualizar la actividad a estado "liquidada", ingresos/gastos/utilidad y ganador
    const { error: errorActividad } = await supabase
      .from('actividades')
      .update({
        estado: 'liquidada',
        ingresos: totalRecaudado,
        gastos: gastosFinal,
        utilidad: utilidadFinal,
        numero_ganador: numeroGanador,
        ganador_nombre: ganadorNombre,
        ganador_socio_natillera_id: ganadorSocioNatilleraId,
        ganador_es_faltante: ganadorEsFaltante
      })
      .eq('id', actividadSeleccionada.value.id)

    if (errorActividad) throw errorActividad

    // 2. Guardar o actualizar en utilidades_clasificadas como tipo "rifas"
    // Primero verificar si ya existe un registro para esta actividad
    const { data: utilidadExistente, error: errorBuscar } = await supabase
      .from('utilidades_clasificadas')
      .select('id, monto')
      .eq('natillera_id', actividadSeleccionada.value.natillera_id)
      .eq('tipo', 'rifas')
      .eq('id_actividad', actividadSeleccionada.value.id)
      .maybeSingle()

    if (errorBuscar) throw errorBuscar

    if (utilidadExistente) {
      // Actualizar el registro existente (utilidadFinal = totalRecaudado cuando ganó Faltante)
      const { error: errorUpdate } = await supabase
        .from('utilidades_clasificadas')
        .update({
          monto: utilidadFinal,
          descripcion: `Utilidad de rifa: ${actividadSeleccionada.value.descripcion}`,
          detalles: {
            actividad_id: actividadSeleccionada.value.id,
            total_recaudado: totalRecaudado,
            premio_entregado: gastosFinal,
            ganador_es_faltante: ganadorEsFaltante,
            fecha_liquidacion: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', utilidadExistente.id)

      if (errorUpdate) throw errorUpdate
    } else {
      // Crear nuevo registro
      const { error: errorInsert } = await supabase
        .from('utilidades_clasificadas')
        .insert({
          natillera_id: actividadSeleccionada.value.natillera_id,
          tipo: 'rifas',
          id_actividad: actividadSeleccionada.value.id,
          monto: utilidadFinal,
          fecha_cierre: null,
          descripcion: `Utilidad de rifa: ${actividadSeleccionada.value.descripcion}`,
          detalles: {
            actividad_id: actividadSeleccionada.value.id,
            total_recaudado: totalRecaudado,
            premio_entregado: gastosFinal,
            ganador_es_faltante: ganadorEsFaltante,
            fecha_liquidacion: new Date().toISOString()
          }
        })

      if (errorInsert) throw errorInsert
    }

    // 3. Cerrar modales y recargar actividades
    modalLiquidarActividad.value = false
    modalConfirmarLiquidacionNegativa.value = false
    modalDetalleActividad.value = false
    busquedaNumero.value = '' // Limpiar búsqueda al cerrar
    notificationStore.success('Actividad liquidada exitosamente', 'Éxito')
    
    // Recargar actividades
    await fetchActividades()
  } catch (e) {
    console.error('Error liquidando actividad:', e)
    notificationStore.error(e.message || 'Error al liquidar la actividad', 'Error')
  } finally {
    loading.value = false
  }
}

function abrirModalVenta(numero) {
  numeroSeleccionado.value = numero
  formVentaRifa.numero = numero
  formVentaRifa.nombreComprador = ''
  formVentaRifa.telefonoComprador = ''
  formVentaRifa.socioVendedor = null
  // Usar el valor de la actividad si existe (valor_rifa para rifa manual)
  // Si no existe, intentar obtenerlo del primer socio_actividad o usar 0
  let valorPorDefecto = 0
  if (actividadSeleccionada.value?.valor_rifa) {
    valorPorDefecto = Number(actividadSeleccionada.value.valor_rifa) || 0
  } else if (sociosActividad.value && sociosActividad.value.length > 0) {
    // Si no hay valor_rifa, usar el valor_asignado del primer socio (para rifa no manual)
    valorPorDefecto = Number(sociosActividad.value[0]?.valor_asignado) || 0
  }
  formVentaRifa.valor = valorPorDefecto
  formVentaRifa.yaPago = false
  desplegableSocioAbierto.value = false
  modalVentaRifa.value = true
}

function abrirModalPagar(numero) {
  const numeroData = numerosRifa.value[numero]
  if (!numeroData || (numeroData.estado !== 'vendido' && numeroData.estado !== 'pagado')) return
  
  formPagarRifa.numero = numero
  formPagarRifa.nombreComprador = numeroData.nombreComprador || ''
  formPagarRifa.valor = numeroData.valor || 0
  formPagarRifa.yaPago = numeroData.estado === 'pagado'
  modalPagarRifa.value = true
}

async function guardarVentaRifa() {
  if (!formVentaRifa.nombreComprador || !formVentaRifa.socioVendedor || !formVentaRifa.valor || formVentaRifa.valor <= 0) {
    notificationStore.error('Debe completar todos los campos requeridos', 'Error')
    return
  }
  
  if (!actividadSeleccionada.value) {
    notificationStore.error('Error: actividad no seleccionada', 'Error')
    return
  }
  
  try {
    // Determinar el estado según si ya pagó o no
    const estado = formVentaRifa.yaPago ? 'pagado' : 'vendido'
    const fechaActual = new Date().toISOString()
    
    // Guardar en la base de datos
    const { data, error } = await supabase
      .from('numeros_rifa')
      .upsert({
        actividad_id: actividadSeleccionada.value.id,
        numero: formVentaRifa.numero,
        estado: estado,
        nombre_comprador: formVentaRifa.nombreComprador,
        telefono_comprador: formVentaRifa.telefonoComprador || null,
        socio_vendedor_id: formVentaRifa.socioVendedor,
        valor: formVentaRifa.valor,
        fecha_venta: fechaActual,
        fecha_pago: formVentaRifa.yaPago ? fechaActual : null
      }, {
        onConflict: 'actividad_id,numero'
      })
      .select()
      .single()

    if (error) throw error
    
    // Actualizar el número en el estado local
    numerosRifa.value[formVentaRifa.numero] = {
      ...numerosRifa.value[formVentaRifa.numero],
      estado: estado,
      nombreComprador: formVentaRifa.nombreComprador,
      telefonoComprador: formVentaRifa.telefonoComprador,
      socioVendedor: formVentaRifa.socioVendedor,
      valor: formVentaRifa.valor
    }
    
    modalVentaRifa.value = false
    const mensaje = formVentaRifa.yaPago ? 'Venta y pago registrados exitosamente' : 'Venta registrada exitosamente'
    notificationStore.success(mensaje, 'Éxito')
  } catch (e) {
    console.error('Error guardando venta:', e)
    notificationStore.error(e.message || 'Error al guardar la venta', 'Error')
  }
}

async function guardarPagoRifa() {
  if (!formPagarRifa.numero) {
    notificationStore.error('Error: número no válido', 'Error')
    return
  }
  
  if (!actividadSeleccionada.value) {
    notificationStore.error('Error: actividad no seleccionada', 'Error')
    return
  }
  
  try {
    // Determinar el estado según si ya pagó o no
    const estado = formPagarRifa.yaPago ? 'pagado' : 'vendido'
    const fechaActual = new Date().toISOString()
    
    // Actualizar en la base de datos
    const { error } = await supabase
      .from('numeros_rifa')
      .update({
        estado: estado,
        fecha_pago: formPagarRifa.yaPago ? fechaActual : null
      })
      .eq('actividad_id', actividadSeleccionada.value.id)
      .eq('numero', formPagarRifa.numero)

    if (error) throw error
    
    // Actualizar el número en el estado local
    numerosRifa.value[formPagarRifa.numero] = {
      ...numerosRifa.value[formPagarRifa.numero],
      estado: estado
    }
    
    modalPagarRifa.value = false
    const mensaje = formPagarRifa.yaPago ? 'Pago registrado exitosamente' : 'Pago desmarcado exitosamente'
    notificationStore.success(mensaje, 'Éxito')
  } catch (e) {
    console.error('Error guardando pago:', e)
    notificationStore.error(e.message || 'Error al guardar el pago', 'Error')
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

    if (error) {
      console.error('❌ Error al cargar actividades:', error)
      throw error
    }
    
    console.log('📊 Actividades cargadas:', data?.length || 0, 'actividades')
    if (data && data.length > 0) {
      console.log('📋 Primeras actividades:', data.slice(0, 3).map(a => ({
        id: a.id,
        descripcion: a.descripcion,
        actividad_serie_id: a.actividad_serie_id,
        estado: a.estado
      })))
    }
    
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
            // Nota: El estado de mora se calcula y muestra en el frontend
            // No es necesario actualizar la BD cada vez que se carga la vista
            
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
    
    // Ordenar actividades: primero por año (ascendente), luego por mes (ascendente, enero=1 a diciembre=12)
    // Las actividades sin mes_pago/anio_pago (liquidadas) van al final ordenadas por created_at
    actividadesConTotales.sort((a, b) => {
      // Si ambas tienen mes_pago y anio_pago, ordenar por año y mes
      if (a.anio_pago && a.mes_pago && b.anio_pago && b.mes_pago) {
        // Primero por año
        if (a.anio_pago !== b.anio_pago) {
          return a.anio_pago - b.anio_pago
        }
        // Luego por mes (enero=1, febrero=2, ..., diciembre=12)
        return a.mes_pago - b.mes_pago
      }
      
      // Si solo una tiene mes_pago/anio_pago, la que tiene va primero
      if (a.anio_pago && a.mes_pago && (!b.anio_pago || !b.mes_pago)) {
        return -1
      }
      if (b.anio_pago && b.mes_pago && (!a.anio_pago || !a.mes_pago)) {
        return 1
      }
      
      // Si ninguna tiene mes_pago/anio_pago, ordenar por created_at descendente
      const fechaA = new Date(a.created_at || 0)
      const fechaB = new Date(b.created_at || 0)
      return fechaB - fechaA
    })
    
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
    formActividad.periodoSeleccionado = null
    formActividad.mesPago = new Date().getMonth() + 1
    formActividad.anioPago = new Date().getFullYear()
    formActividad.quincenaPago = null
    formActividad.esMultiplesMeses = false
    formActividad.mesesSeleccionados = []
    formActividad.cuandoJuegoRifa = null
    formActividad.fechaJuegoRifa = ''
    formActividad.fechasJuegoPorMes = {}
  } else {
    formActividad.ingresos = 0
    formActividad.gastos = 0
    formActividad.tipoValores = 'iguales'
    formActividad.valorIgual = 0
    formActividad.periodoSeleccionado = null
    formActividad.mesPago = new Date().getMonth() + 1
    formActividad.anioPago = new Date().getFullYear()
    formActividad.quincenaPago = null
    formActividad.esMultiplesMeses = false
    formActividad.mesesSeleccionados = []
    formActividad.cuandoJuegoRifa = null
    formActividad.fechaJuegoRifa = ''
    formActividad.fechasJuegoPorMes = {}
    if (formActividad.tipo === 'rifa') formActividad.tipoRifa = 'manual'
    // Cargar socios siempre para asegurar que estén actualizados
    fetchSocios().then(() => {
      // Calcular fecha límite después de cargar socios
      calcularFechaLimitePago()
    })
  }
}

function handleValorIgualInput(event) {
  const inputValue = event.target.value
  // Permitir solo números y puntos
  const cleanedValue = inputValue.replace(/[^0-9.]/g, '')
  // Parsear el valor
  const parsedValue = parseNumberWithSeparator(cleanedValue)
  formActividad.valorIgual = parsedValue
  // Actualizar el input con formato
  event.target.value = formatNumberWithSeparator(parsedValue)
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

// Función para obtener la natillera (maybeSingle evita 406 cuando no hay fila)
async function fetchNatillera() {
  try {
    const { data, error } = await supabase
      .from('natilleras')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    natillera.value = data
  } catch (e) {
    console.error('Error cargando natillera:', e)
    natillera.value = null
  }
}

// Computed para obtener los meses del período de la natillera
const mesesDelPeriodo = computed(() => {
  if (!natillera.value) return []
  
  const mesInicio = natillera.value.mes_inicio || 1
  const anioInicio = natillera.value.anio_inicio || natillera.value.anio || new Date().getFullYear()
  const mesFin = natillera.value.mes_fin || 11
  const anioFin = natillera.value.anio || new Date().getFullYear()
  
  const meses = []
  
  if (anioInicio === anioFin) {
    // Mismo año
    for (let mes = mesInicio; mes <= mesFin; mes++) {
      meses.push({ mes, anio: anioInicio })
    }
  } else {
    // Período que cruza años
    for (let mes = mesInicio; mes <= 12; mes++) {
      meses.push({ mes, anio: anioInicio })
    }
    for (let anio = anioInicio + 1; anio < anioFin; anio++) {
      for (let mes = 1; mes <= 12; mes++) {
        meses.push({ mes, anio })
      }
    }
    for (let mes = 1; mes <= mesFin; mes++) {
      meses.push({ mes, anio: anioFin })
    }
  }
  
  return meses
})

// Computed para generar opciones del desplegable de periodo
const opcionesPeriodo = computed(() => {
  return mesesDelPeriodo.value.map(periodo => {
    const nombreMes = meses.find(m => m.value === periodo.mes)?.label || `Mes ${periodo.mes}`
    return {
      value: `${periodo.mes}-${periodo.anio}`, // Usar string como valor para comparación
      label: `${nombreMes} ${periodo.anio}`,
      mes: periodo.mes,
      anio: periodo.anio,
      periodo: periodo // Guardar el objeto completo para referencia
    }
  })
})

// Computed para obtener el valor del periodo seleccionado como string
const periodoSeleccionadoValue = computed({
  get: () => {
    if (!formActividad.periodoSeleccionado) return null
    return `${formActividad.periodoSeleccionado.mes}-${formActividad.periodoSeleccionado.anio}`
  },
  set: (value) => {
    if (!value) {
      formActividad.periodoSeleccionado = null
      return
    }
    const opcion = opcionesPeriodo.value.find(op => op.value === value)
    if (opcion) {
      formActividad.periodoSeleccionado = opcion.periodo
      onPeriodoSeleccionado()
    }
  }
})

// Función para toggle múltiples meses
function toggleMultiplesMeses() {
  formActividad.esMultiplesMeses = !formActividad.esMultiplesMeses
  if (formActividad.esMultiplesMeses) {
    // Limpiar selección de un solo mes
    formActividad.periodoSeleccionado = null
    formActividad.mesPago = new Date().getMonth() + 1
    formActividad.anioPago = new Date().getFullYear()
    formActividad.fechaLimitePago = ''
    // Inicializar meses seleccionados vacío
    formActividad.mesesSeleccionados = []
    // Si hay socios mensuales y es quincenal, usar segunda quincena por defecto
    if (natillera.value && natillera.value.periodicidad === 'quincenal') {
      const haySociosMensuales = socios.value.length > 0 && socios.value.some(socio => 
        socio.periodicidad === 'mensual'
      )
      formActividad.quincenaPago = haySociosMensuales ? 2 : 1
    }
  } else {
    // Limpiar selección de múltiples meses
    formActividad.mesesSeleccionados = []
    formActividad.periodoSeleccionado = null
    formActividad.mesPago = new Date().getMonth() + 1
    formActividad.anioPago = new Date().getFullYear()
    calcularFechaLimitePago()
  }
}

// Función para verificar si un mes está seleccionado
function estaMesSeleccionado(mes, anio) {
  return formActividad.mesesSeleccionados.some(m => m.mes === mes && m.anio === anio)
}

// Función para toggle selección de mes
function toggleMesSeleccionado(mes, anio) {
  const index = formActividad.mesesSeleccionados.findIndex(m => m.mes === mes && m.anio === anio)
  
  if (index >= 0) {
    // Deseleccionar
    formActividad.mesesSeleccionados.splice(index, 1)
  } else {
    // Seleccionar
    const quincena = natillera.value && natillera.value.periodicidad === 'quincenal' 
      ? (formActividad.quincenaPago || 1)
      : null
    
    // Verificar si hay socios mensuales para este mes
    const haySociosMensuales = socios.value.length > 0 && socios.value.some(socio => 
      socio.periodicidad === 'mensual'
    )
    
    const quincenaFinal = natillera.value && natillera.value.periodicidad === 'quincenal'
      ? (haySociosMensuales ? 2 : (quincena || 1))
      : null
    
    formActividad.mesesSeleccionados.push({
      mes,
      anio,
      quincena: quincenaFinal
    })
  }
}

// Función para marcar todos los meses (asignar nuevo array para forzar reactividad)
function marcarTodosMeses() {
  if (!natillera.value || mesesDelPeriodo.value.length === 0) return
  
  const quincena = natillera.value.periodicidad === 'quincenal' 
    ? (formActividad.quincenaPago || 1)
    : null
  
  const haySociosMensuales = socios.value.length > 0 && socios.value.some(socio => 
    socio.periodicidad === 'mensual'
  )
  
  const quincenaFinal = natillera.value.periodicidad === 'quincenal'
    ? (haySociosMensuales ? 2 : (quincena || 1))
    : null
  
  formActividad.mesesSeleccionados = mesesDelPeriodo.value.map(mesPeriodo => ({
    mes: mesPeriodo.mes,
    anio: mesPeriodo.anio,
    quincena: quincenaFinal
  }))
}

// Función para desmarcar todos los meses (asignar nuevo array para forzar reactividad)
function desmarcarTodosMeses() {
  formActividad.mesesSeleccionados = []
}

// Función para actualizar quincena en todos los meses seleccionados
function actualizarQuincenaMeses() {
  if (natillera.value && natillera.value.periodicidad === 'quincenal') {
    formActividad.mesesSeleccionados.forEach(mesSeleccionado => {
      mesSeleccionado.quincena = formActividad.quincenaPago
    })
  }
}

// Función que se ejecuta cuando se selecciona un periodo
function onPeriodoSeleccionado() {
  if (formActividad.periodoSeleccionado) {
    formActividad.mesPago = formActividad.periodoSeleccionado.mes
    formActividad.anioPago = formActividad.periodoSeleccionado.anio
    calcularFechaLimitePago()
  } else {
    formActividad.mesPago = null
    formActividad.anioPago = null
    formActividad.fechaLimitePago = ''
  }
}

// Función para calcular la fecha límite de pago basada en período y quincena
function calcularFechaLimitePago() {
  if (formActividad.tipoProceso !== 'en_curso') return

  // Usar periodo seleccionado si está disponible, sino usar mesPago y anioPago (compatibilidad)
  const mes = formActividad.periodoSeleccionado?.mes || formActividad.mesPago
  const anio = formActividad.periodoSeleccionado?.anio || formActividad.anioPago
  
  if (!mes || !anio) {
    formActividad.fechaLimitePago = ''
    return
  }

  // Día límite segunda quincena/mensual: siempre 30, excepto febrero (28 o 29)
  const diaLimiteSegundaQuincena = (mes, anio) => (mes === 2 ? new Date(anio, 2, 0).getDate() : 30)

  // Formatear fecha
  const formatearFecha = (anio, mes, dia) => {
    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  let diaPago = diaLimiteSegundaQuincena(mes, anio)

  // Si la natillera es quincenal
  if (natillera.value && natillera.value.periodicidad === 'quincenal') {
    // Si hay quincena seleccionada, usar esa
    if (formActividad.quincenaPago === 1) {
      diaPago = 15
    } else if (formActividad.quincenaPago === 2) {
      diaPago = diaLimiteSegundaQuincena(mes, anio)
    } else {
      // Si no hay quincena seleccionada, verificar si hay socios mensuales
      // Verificar si hay socios con periodicidad mensual
      const haySociosMensuales = socios.value.length > 0 && socios.value.some(socio => 
        socio.periodicidad === 'mensual'
      )
      
      if (haySociosMensuales) {
        // Para socios mensuales, usar segunda quincena (día límite 30 o 28/29 feb)
        diaPago = diaLimiteSegundaQuincena(mes, anio)
        formActividad.quincenaPago = 2
      } else {
        // Si no hay socios mensuales o no hay socios, usar primera quincena por defecto
        diaPago = 15
        formActividad.quincenaPago = 1
      }
    }
  } else {
    // Si la natillera es mensual, usar día límite (30 o 28/29 feb)
    formActividad.quincenaPago = null
    diaPago = diaLimiteSegundaQuincena(mes, anio)
  }

  formActividad.fechaLimitePago = formatearFecha(anio, mes, diaPago)
}

/** Calcula la fecha de juego de la rifa según el preset y mes/año. Devuelve YYYY-MM-DD o null si preset es fecha_especifica. */
function calcularFechaJuegoRifa(cuandoJuegoRifa, mes, anio) {
  if (!cuandoJuegoRifa || cuandoJuegoRifa === 'fecha_especifica') return null
  const formatear = (a, m, d) => `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  // Día límite segunda quincena: 30, o 28/29 en febrero
  const diaLimite = (m, a) => (m === 2 ? new Date(a, 2, 0).getDate() : 30)
  const diaSemana = (a, m, d) => new Date(a, m - 1, d).getDay() // 0=dom, 5=viernes

  if (cuandoJuegoRifa === 'primera_quincena') {
    return formatear(anio, mes, 15)
  }
  if (cuandoJuegoRifa === 'segunda_quincena') {
    return formatear(anio, mes, diaLimite(mes, anio))
  }
  if (cuandoJuegoRifa === 'viernes_despues_primera') {
    for (let d = 15; d <= diaLimite(mes, anio); d++) {
      if (diaSemana(anio, mes, d) === 5) return formatear(anio, mes, d)
    }
    return null
  }
  if (cuandoJuegoRifa === 'viernes_despues_segunda') {
    const mesSiguiente = mes === 12 ? 1 : mes + 1
    const anioSiguiente = mes === 12 ? anio + 1 : anio
    for (let d = 1; d <= 7; d++) {
      if (diaSemana(anioSiguiente, mesSiguiente, d) === 5) return formatear(anioSiguiente, mesSiguiente, d)
    }
    return null
  }
  return null
}

/** Etiqueta legible del preset de fecha de juego (para mostrar en detalle). */
function etiquetaCuandoJuegoRifa(cuandoJuegoRifa) {
  const o = opcionesCuandoJuegoRifa.find(x => x.value === cuandoJuegoRifa)
  return o ? o.label : (cuandoJuegoRifa || '—')
}

async function handleCrearActividad() {
  loading.value = true
  try {
    // Determinar si es rifa manual (necesario para validaciones y creación)
    const esRifaManual = formActividad.tipo === 'rifa' && formActividad.tipoRifa === 'manual'
    
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
      if (formActividad.esMultiplesMeses) {
        // Validar que haya al menos un mes seleccionado
        if (formActividad.mesesSeleccionados.length === 0) {
          loading.value = false
          notificationStore.error('Debe seleccionar al menos un mes', 'Error')
          return
        }

        // Si la natillera es quincenal, validar quincena
        if (natillera.value && natillera.value.periodicidad === 'quincenal' && !formActividad.quincenaPago) {
          loading.value = false
          notificationStore.error('Debe seleccionar la quincena de pago', 'Error')
          return
        }
      } else {
        // Validar periodo seleccionado
        if (!formActividad.periodoSeleccionado || !formActividad.periodoSeleccionado.mes || !formActividad.periodoSeleccionado.anio) {
          loading.value = false
          notificationStore.error('Debe seleccionar el período de pago', 'Error')
          return
        }

        // Si la natillera es quincenal, validar quincena
        if (natillera.value && natillera.value.periodicidad === 'quincenal' && !formActividad.quincenaPago) {
          loading.value = false
          notificationStore.error('Debe seleccionar la quincena de pago', 'Error')
          return
        }

        // Calcular fecha límite si no está calculada
        if (!formActividad.fechaLimitePago || formActividad.fechaLimitePago.trim() === '') {
          calcularFechaLimitePago()
          if (!formActividad.fechaLimitePago || formActividad.fechaLimitePago.trim() === '') {
            loading.value = false
            notificationStore.error('No se pudo calcular la fecha límite de pago', 'Error')
            return
          }
        }
      }
      
      // Validar valor: no permitir actividades con valor 0
      if (esRifaManual) {
        // Rifa manual: el valor por número debe ser mayor a cero
        if (!formActividad.valorIgual || Number(formActividad.valorIgual) <= 0) {
          loading.value = false
          notificationStore.error('El valor por número debe ser mayor a cero', 'Error')
          return
        }
      } else {
        // Verificar que haya socios activos
        if (socios.value.length === 0) {
          loading.value = false
          notificationStore.error('No hay socios activos en esta natillera', 'Error')
          return
        }
        
        if (formActividad.tipoValores === 'iguales') {
          if (!formActividad.valorIgual || Number(formActividad.valorIgual) <= 0) {
            loading.value = false
            notificationStore.error('El valor por socio debe ser mayor a cero', 'Error')
            return
          }
          // Aplicar el valor igual a todos los socios
          aplicarValorIgual()
        } else {
          // Validar valores diferentes: al menos un valor > 0 y total > 0
          const valoresConValor = Object.entries(formActividad.valoresPorSocio)
            .filter(([_, valor]) => valor && Number(valor) > 0)
          
          if (valoresConValor.length === 0) {
            loading.value = false
            notificationStore.error('Debe asignar al menos un valor mayor a cero a algún socio', 'Error')
            return
          }
          const total = totalARecaudar.value
          if (!total || total <= 0) {
            loading.value = false
            notificationStore.error('El total a recaudar debe ser mayor a cero', 'Error')
            return
          }
        }
      }
      
      // Validar que si es rifa, tenga tipoRifa seleccionado
      if (formActividad.tipo === 'rifa' && !formActividad.tipoRifa) {
        loading.value = false
        notificationStore.error('Debe seleccionar un tipo de rifa', 'Error')
        return
      }

      // Validar fecha de juego para rifas en curso
      if (formActividad.tipo === 'rifa') {
        if (!formActividad.cuandoJuegoRifa) {
          loading.value = false
          notificationStore.error('Debe indicar cuándo se jugará la rifa (fecha de juego)', 'Error')
          return
        }
        if (formActividad.cuandoJuegoRifa === 'fecha_especifica') {
          if (formActividad.esMultiplesMeses) {
            const mesesSinFecha = formActividad.mesesSeleccionados.filter(
              m => !formActividad.fechasJuegoPorMes[`${m.mes}-${m.anio}`]
            )
            if (mesesSinFecha.length > 0) {
              loading.value = false
              notificationStore.error('Debe asignar una fecha de juego para cada mes seleccionado', 'Error')
              return
            }
          } else {
            if (!formActividad.fechaJuegoRifa || formActividad.fechaJuegoRifa.trim() === '') {
              loading.value = false
              notificationStore.error('Debe indicar la fecha de juego de la rifa', 'Error')
              return
            }
          }
        }
      }
    }

    // Helper para calcular fecha límite por mes (día límite segunda quincena: 30, o 28/29 feb)
    const calcularFechaLimiteParaMes = (mes, anio, quincena) => {
      const diaLimiteSegundaQuincena = (m, a) => (m === 2 ? new Date(a, 2, 0).getDate() : 30)
      const formatearFecha = (anio, mes, dia) => `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      
      let diaPago = diaLimiteSegundaQuincena(mes, anio)
      if (natillera.value && natillera.value.periodicidad === 'quincenal' && quincena) {
        diaPago = quincena === 1 ? 15 : diaLimiteSegundaQuincena(mes, anio)
      }
      return formatearFecha(anio, mes, diaPago)
    }
    
    // Helper para obtener nombre del mes
    const obtenerNombreMes = (mes) => {
      return meses.find(m => m.value === mes)?.label || `Mes ${mes}`
    }
    
    // Determinar los meses para los que se creará la actividad
    const mesesParaActividad = formActividad.esMultiplesMeses
      ? formActividad.mesesSeleccionados
      : [{ 
          mes: formActividad.periodoSeleccionado?.mes || formActividad.mesPago, 
          anio: formActividad.periodoSeleccionado?.anio || formActividad.anioPago, 
          quincena: formActividad.quincenaPago 
        }]
    
    // Si es actividad en curso, asegurar que todos los valores estén aplicados
    if (formActividad.tipoProceso === 'en_curso') {
      if (formActividad.tipoValores === 'iguales' && formActividad.valorIgual) {
        aplicarValorIgual()
      }
    }
    
    // Estado inicial para registros de socios_actividad
    const estadoInicial = 'pendiente'
    
    // Generar un ID único para agrupar actividades que se repiten en múltiples meses
    // Si es una actividad única (no múltiples meses), este será null
    const actividadSerieId = formActividad.esMultiplesMeses && mesesParaActividad.length > 1
      ? crypto.randomUUID() // Generar UUID único para la serie
      : null
    
    // Array para almacenar todas las actividades creadas
    const actividadesCreadas = []
    
    // Crear una actividad por cada mes seleccionado
    for (const mesInfo of mesesParaActividad) {
      const fechaLimiteMes = formActividad.tipoProceso === 'en_curso'
        ? calcularFechaLimiteParaMes(mesInfo.mes, mesInfo.anio, mesInfo.quincena)
        : null
      
      // Crear descripción de la actividad (incluir mes si hay múltiples meses)
      let descripcionActividad = formActividad.descripcion
      if (formActividad.esMultiplesMeses && mesesParaActividad.length > 1) {
        const nombreMes = obtenerNombreMes(mesInfo.mes)
        descripcionActividad = `${formActividad.descripcion} - ${nombreMes} ${mesInfo.anio}`
      }
      
      // Crear la actividad para este mes
      const actividadData = {
        natillera_id: id,
        tipo: formActividad.tipo,
        descripcion: descripcionActividad,
        estado: formActividad.tipoProceso === 'liquidar' ? 'liquidada' : 'en_curso',
        ingresos: formActividad.tipoProceso === 'liquidar' ? (formActividad.ingresos || 0) : 0,
        gastos: formActividad.tipoProceso === 'liquidar' ? (formActividad.gastos || 0) : 0,
        utilidad: formActividad.tipoProceso === 'liquidar' 
          ? ((formActividad.ingresos || 0) - (formActividad.gastos || 0))
          : 0,
        fecha_limite_pago: fechaLimiteMes,
        mes_pago: formActividad.tipoProceso === 'en_curso' ? mesInfo.mes : null,
        anio_pago: formActividad.tipoProceso === 'en_curso' ? mesInfo.anio : null,
        quincena_pago: formActividad.tipoProceso === 'en_curso' 
          ? (natillera.value && natillera.value.periodicidad === 'mensual' ? 0 : (mesInfo.quincena || null))
          : null,
        tipo_rifa: formActividad.tipo === 'rifa' ? formActividad.tipoRifa : null,
        actividad_serie_id: actividadSerieId // ID que agrupa actividades de la misma serie
      }

      // Fecha de juego de la rifa (solo rifas en curso)
      if (formActividad.tipo === 'rifa' && formActividad.tipoProceso === 'en_curso' && formActividad.cuandoJuegoRifa) {
        actividadData.cuando_juego_rifa = formActividad.cuandoJuegoRifa
        if (formActividad.cuandoJuegoRifa === 'fecha_especifica') {
          actividadData.fecha_juego_rifa = formActividad.esMultiplesMeses
            ? (formActividad.fechasJuegoPorMes[`${mesInfo.mes}-${mesInfo.anio}`] || null)
            : (formActividad.fechaJuegoRifa || null) || null
        } else {
          actividadData.fecha_juego_rifa = calcularFechaJuegoRifa(formActividad.cuandoJuegoRifa, mesInfo.mes, mesInfo.anio)
        }
      }
      
      // Si es rifa manual, guardar el valor por defecto
      if (esRifaManual && formActividad.valorIgual) {
        // Guardar el valor - intentar guardarlo en un campo que pueda existir
        // Si el campo no existe en la BD, simplemente no se guardará pero no dará error
        try {
          actividadData.valor_rifa = formActividad.valorIgual
        } catch (e) {
          // Si el campo no existe, continuar sin guardarlo
          console.warn('Campo valor_rifa no disponible en la tabla actividades')
        }
      }

      console.log('📝 Creando actividad con datos:', {
        ...actividadData,
        actividad_serie_id: actividadSerieId
      })
      
      const { data: actividad, error: errorActividad } = await supabase
        .from('actividades')
        .insert(actividadData)
        .select()
        .single()

      if (errorActividad) {
        console.error('❌ Error al crear actividad:', errorActividad)
        // Si el error es por campo inexistente, intentar sin esos campos
        const msg = errorActividad.message || ''
        const sinSerie = msg.includes('actividad_serie_id')
        const sinFechaJuego = msg.includes('cuando_juego_rifa') || msg.includes('fecha_juego_rifa')
        if (sinSerie || sinFechaJuego) {
          const actividadDataFallback = { ...actividadData }
          if (sinSerie) delete actividadDataFallback.actividad_serie_id
          if (sinFechaJuego) {
            delete actividadDataFallback.cuando_juego_rifa
            delete actividadDataFallback.fecha_juego_rifa
          }
          const { data: actFallback, error: errFallback } = await supabase
            .from('actividades')
            .insert(actividadDataFallback)
            .select()
            .single()
          if (errFallback) throw errFallback
          actividadesCreadas.push(actFallback)
        } else {
          throw errorActividad
        }
      } else {
        console.log('✅ Actividad creada:', actividad.id, 'Serie ID:', actividad.actividad_serie_id)
        actividadesCreadas.push(actividad)
      }

      // Si es actividad en curso y NO es rifa manual, crear los registros en socios_actividad
      if (formActividad.tipoProceso === 'en_curso' && !esRifaManual) {
        let sociosActividadData = []
        
        // Si es rifa automática, asignar números aleatoriamente
        const esRifaAutomatica = formActividad.tipo === 'rifa' && formActividad.tipoRifa === 'aleatoria'
        let numerosAsignadosPorSocio = {} // { socio_id: [numeros] }
        let numerosAsignadosAFaltantes = {} // { 'Faltante 1': [numeros], 'Faltante 2': [numeros], ... }
        
        if (esRifaAutomatica) {
          console.log('🎲 Iniciando asignación de números para rifa automática')
          console.log('📊 Socios disponibles:', socios.value.length)
          console.log('🔢 Cantidad de números por socio:', formActividad.cantidadNumerosPorSocio)
          
          // Validar cantidad de números por socio
          if (!formActividad.cantidadNumerosPorSocio || formActividad.cantidadNumerosPorSocio <= 0) {
            loading.value = false
            notificationStore.error('Debe ingresar la cantidad de números por socio', 'Error')
            return
          }
          
          const cantidadPorSocio = formActividad.cantidadNumerosPorSocio
          const totalNumerosParaSocios = socios.value.length * cantidadPorSocio
          
          console.log('📈 Total números para socios:', totalNumerosParaSocios)
          
          if (totalNumerosParaSocios > 100) {
            loading.value = false
            notificationStore.error(`No hay suficientes números. Se necesitan ${totalNumerosParaSocios} números pero solo hay 100 disponibles.`, 'Error')
            return
          }
          
          // Generar todos los números disponibles (00-99)
          const numerosDisponibles = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'))
          console.log('🔢 Números disponibles generados:', numerosDisponibles.length)
          
          // Mezclar aleatoriamente usando Fisher-Yates shuffle para mejor aleatoriedad
          const numerosMezclados = [...numerosDisponibles]
          for (let i = numerosMezclados.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numerosMezclados[i], numerosMezclados[j]] = [numerosMezclados[j], numerosMezclados[i]]
          }
          
          console.log('🔀 Números mezclados:', numerosMezclados.slice(0, 10), '...')
          
          // Asignar números a cada socio
          let indiceNumero = 0
          socios.value.forEach(socio => {
            const numerosSocio = []
            for (let i = 0; i < cantidadPorSocio && indiceNumero < numerosMezclados.length; i++) {
              numerosSocio.push(numerosMezclados[indiceNumero])
              indiceNumero++
            }
            numerosAsignadosPorSocio[socio.id] = numerosSocio
            console.log(`👤 Socio ${socio.id} (${socio.socio?.nombre || 'Sin nombre'}):`, numerosSocio)
          })
          
          console.log('✅ Números asignados a socios:', Object.keys(numerosAsignadosPorSocio).length, 'socios')
          
          // Asignar números restantes a faltantes
          const numerosRestantes = numerosMezclados.slice(indiceNumero)
          console.log('📦 Números restantes para faltantes:', numerosRestantes.length)
          
          let numeroFaltante = 1
          let indiceFaltante = 0
          
          while (indiceFaltante < numerosRestantes.length) {
            const nombreFaltante = `Faltante ${numeroFaltante}`
            const numerosFaltante = []
            
            for (let i = 0; i < cantidadPorSocio && indiceFaltante < numerosRestantes.length; i++) {
              numerosFaltante.push(numerosRestantes[indiceFaltante])
              indiceFaltante++
            }
            
            if (numerosFaltante.length > 0) {
              numerosAsignadosAFaltantes[nombreFaltante] = numerosFaltante
              console.log(`📋 ${nombreFaltante}:`, numerosFaltante)
              numeroFaltante++
            }
          }
          
          console.log('✅ Faltantes creados:', Object.keys(numerosAsignadosAFaltantes).length)
          console.log('📊 Resumen:')
          console.log('  - Socios:', Object.keys(numerosAsignadosPorSocio).length)
          console.log('  - Faltantes:', Object.keys(numerosAsignadosAFaltantes).length)
          console.log('  - Total números asignados:', 
            Object.values(numerosAsignadosPorSocio).flat().length + 
            Object.values(numerosAsignadosAFaltantes).flat().length)
        }
        
        // Función helper para determinar la quincena correcta según la periodicidad del socio
        const determinarQuincenaParaSocio = (socio, quincenaSeleccionada) => {
          // IMPORTANTE: Si la natillera es mensual, SIEMPRE retornar 0 para que coincida con cuotas mensuales (quincena 0 o null)
          if (!natillera.value || natillera.value.periodicidad === 'mensual') {
            return 0
          }
          
          // Si la natillera es quincenal
          if (natillera.value.periodicidad === 'quincenal') {
            // Si el socio es mensual, siempre asignar a quincena 2 (segunda quincena del mes)
            if (socio.periodicidad === 'mensual') {
              return 2
            }
            // Para socios quincenales, usar la quincena seleccionada (1 o 2)
            return quincenaSeleccionada || null
          }
          
          // Por defecto, retornar 0 (mensual)
          return 0
        }

        // Obtener el nombre de la natillera una vez
        const nombreNatillera = natillera.value?.nombre || null
        
        if (formActividad.tipoValores === 'iguales') {
          // Para valores iguales, crear registro para todos los socios
          socios.value.forEach(socio => {
            const quincenaFinal = determinarQuincenaParaSocio(socio, mesInfo.quincena)
            const nombreSocio = socio.socio?.nombre || null
            sociosActividadData.push({
              actividad_id: actividad.id,
              socio_natillera_id: socio.id,
              valor_asignado: Number(formActividad.valorIgual),
              valor_pagado: 0,
              estado: estadoInicial,
              fecha_limite_pago: fechaLimiteMes,
              mes_pago: mesInfo.mes,
              anio_pago: mesInfo.anio,
              quincena_pago: quincenaFinal,
              nombre_socio: nombreSocio,
              nombre_natillera: nombreNatillera
            })
          })
        } else {
          // Para valores diferentes, solo los que tienen valor asignado
          Object.entries(formActividad.valoresPorSocio)
            .filter(([_, valor]) => valor && Number(valor) > 0)
            .forEach(([socioNatilleraId, valor]) => {
              // Buscar el socio para obtener su periodicidad
              const socio = socios.value.find(s => s.id === socioNatilleraId)
              let quincenaFinal
              if (socio) {
                quincenaFinal = determinarQuincenaParaSocio(socio, mesInfo.quincena)
              } else {
                // Si no se encuentra el socio, usar la lógica según periodicidad de la natillera
                // Por defecto, si la natillera es mensual, usar 0
                if (natillera.value && natillera.value.periodicidad === 'mensual') {
                  quincenaFinal = 0
                } else {
                  // Si la natillera es quincenal y no conocemos el socio, usar la quincena del formulario
                  quincenaFinal = mesInfo.quincena || null
                }
              }
              const nombreSocio = socio?.socio?.nombre || null
              sociosActividadData.push({
                actividad_id: actividad.id,
                socio_natillera_id: socioNatilleraId,
                valor_asignado: Number(valor),
                valor_pagado: 0,
                estado: estadoInicial,
                fecha_limite_pago: fechaLimiteMes,
                mes_pago: mesInfo.mes,
                anio_pago: mesInfo.anio,
                quincena_pago: quincenaFinal,
                nombre_socio: nombreSocio,
                nombre_natillera: nombreNatillera
              })
            })
        }

        if (sociosActividadData.length > 0) {
          // Validar que todos los estados sean válidos antes de insertar
          const estadosValidos = ['pendiente', 'parcial', 'pagado', 'mora']
          const datosInvalidos = sociosActividadData.filter(d => !estadosValidos.includes(d.estado))
          
          if (datosInvalidos.length > 0) {
            console.error('❌ Datos con estado inválido:', datosInvalidos)
            throw new Error(`Estado inválido detectado: ${datosInvalidos[0].estado}`)
          }
          
          // Asegurar que todos los datos tengan el estado correcto y válido
          const estadosValidosArray = ['pendiente', 'parcial', 'pagado', 'mora']
          sociosActividadData = sociosActividadData.map(d => {
            let estadoFinal = d.estado || estadoInicial || 'pendiente'
            
            if (!estadosValidosArray.includes(estadoFinal)) {
              console.warn('⚠️ Estado inválido detectado, corrigiendo:', estadoFinal, '→ pendiente')
              estadoFinal = 'pendiente'
            }
            
            return {
              actividad_id: d.actividad_id,
              socio_natillera_id: d.socio_natillera_id,
              valor_asignado: Number(d.valor_asignado),
              valor_pagado: Number(d.valor_pagado) || 0,
              estado: estadoFinal,
              fecha_limite_pago: d.fecha_limite_pago,
              mes_pago: d.mes_pago,
              anio_pago: d.anio_pago,
              quincena_pago: d.quincena_pago,
              nombre_socio: d.nombre_socio || null,
              nombre_natillera: d.nombre_natillera || null
            }
          })
          
          // Insertar registros de socios_actividad en lotes
          const BATCH_SIZE = 10
          const errores = []
          
          for (let i = 0; i < sociosActividadData.length; i += BATCH_SIZE) {
            const batch = sociosActividadData.slice(i, i + BATCH_SIZE)
            
            const { error: errorBatch } = await supabase
              .from('socios_actividad')
              .insert(batch)
            
            if (errorBatch) {
              console.error(`❌ Error en lote ${Math.floor(i / BATCH_SIZE) + 1}:`, errorBatch)
              errores.push({ lote: Math.floor(i / BATCH_SIZE) + 1, error: errorBatch, datos: batch })
            }
          }
          
          if (errores.length > 0) {
            console.error('❌ Errores al crear socios_actividad:', errores)
            throw new Error(`Error al crear registros de socios_actividad. ${errores.length} lote(s) fallaron. Primer error: ${errores[0].error.message}`)
          }
          
          // Si es rifa automática, asignar y guardar números
          if (esRifaAutomatica) {
            console.log('💾 Guardando números de rifa automática...')
            console.log('📊 Estado de asignaciones:')
            console.log('  - Socios con números:', Object.keys(numerosAsignadosPorSocio).length)
            console.log('  - Faltantes con números:', Object.keys(numerosAsignadosAFaltantes).length)
            
            if (Object.keys(numerosAsignadosPorSocio).length === 0 && Object.keys(numerosAsignadosAFaltantes).length === 0) {
              console.warn('⚠️ No hay números asignados para guardar')
            } else {
              const numerosRifaData = []
              // El valor por número es el valorIgual dividido entre la cantidad de números por socio
              // Asegurarse de que valorIgual sea un número válido
              let valorIgualNumerico = 0
              if (formActividad.valorIgual) {
                if (typeof formActividad.valorIgual === 'string') {
                  valorIgualNumerico = parseNumberWithSeparator(formActividad.valorIgual)
                } else {
                  valorIgualNumerico = Number(formActividad.valorIgual) || 0
                }
              }
              const valorPorNumero = formActividad.cantidadNumerosPorSocio && valorIgualNumerico > 0
                ? (valorIgualNumerico / formActividad.cantidadNumerosPorSocio) 
                : 0
              
              console.log('💰 Valor por número:', valorPorNumero)
              
              // Guardar números asignados a socios
              Object.entries(numerosAsignadosPorSocio).forEach(([socioId, numeros]) => {
                numeros.forEach(numero => {
                  numerosRifaData.push({
                    actividad_id: actividad.id,
                    numero: numero,
                    estado: 'libre', // Los números están asignados pero aún no vendidos
                    socio_vendedor_id: socioId, // Usamos este campo para guardar el socio asignado en rifa automática
                    valor: valorPorNumero
                  })
                })
              })
              
              console.log(`📝 Números para socios preparados: ${Object.values(numerosAsignadosPorSocio).flat().length}`)
              
              // Guardar números asignados a faltantes (usamos null en socio_vendedor_id y guardamos el nombre en nombre_comprador)
              Object.entries(numerosAsignadosAFaltantes).forEach(([nombreFaltante, numeros]) => {
                numeros.forEach(numero => {
                  numerosRifaData.push({
                    actividad_id: actividad.id,
                    numero: numero,
                    estado: 'libre',
                    socio_vendedor_id: null, // null para indicar que es un faltante
                    nombre_comprador: nombreFaltante, // Guardamos el nombre del faltante aquí
                    valor: valorPorNumero
                  })
                })
              })
              
              console.log(`📝 Números para faltantes preparados: ${Object.values(numerosAsignadosAFaltantes).flat().length}`)
              console.log(`📦 Total números a insertar: ${numerosRifaData.length}`)
              
              // Insertar números en lotes
              if (numerosRifaData.length > 0) {
                const NUMEROS_BATCH_SIZE = 20
                const erroresNumeros = []
                let numerosInsertados = 0
                
                for (let i = 0; i < numerosRifaData.length; i += NUMEROS_BATCH_SIZE) {
                  const batch = numerosRifaData.slice(i, i + NUMEROS_BATCH_SIZE)
                  
                  console.log(`💾 Insertando lote ${Math.floor(i / NUMEROS_BATCH_SIZE) + 1} (${batch.length} números)...`)
                  
                  const { error: errorBatchNumeros, data: dataBatch } = await supabase
                    .from('numeros_rifa')
                    .insert(batch)
                    .select()
                  
                  if (errorBatchNumeros) {
                    console.error(`❌ Error insertando números en lote ${Math.floor(i / NUMEROS_BATCH_SIZE) + 1}:`, errorBatchNumeros)
                    erroresNumeros.push({ lote: Math.floor(i / NUMEROS_BATCH_SIZE) + 1, error: errorBatchNumeros })
                  } else {
                    numerosInsertados += batch.length
                    console.log(`✅ Lote ${Math.floor(i / NUMEROS_BATCH_SIZE) + 1} insertado correctamente`)
                  }
                }
                
                if (erroresNumeros.length > 0) {
                  console.error('❌ Errores al crear números de rifa:', erroresNumeros)
                  notificationStore.error(`Se creó la actividad pero hubo errores al asignar algunos números. ${numerosInsertados}/${numerosRifaData.length} números insertados.`, 'Advertencia')
                } else {
                  console.log(`✅ ${numerosInsertados} números asignados correctamente para rifa automática`)
                }
              } else {
                console.warn('⚠️ No hay números para insertar')
              }
            }
          }
          
          console.log(`✅ Actividad creada para ${obtenerNombreMes(mesInfo.mes)} ${mesInfo.anio} con ${sociosActividadData.length} registros de socios`)
        } else {
          loading.value = false
          notificationStore.error('No se pudo crear la actividad. No hay socios asignados.', 'Error')
          return
        }
      }
    }
    
    // Recargar actividades para mantener el ordenamiento correcto por mes y año
    await fetchActividades()
    
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
    formActividad.periodoSeleccionado = null
    formActividad.mesPago = new Date().getMonth() + 1
    formActividad.anioPago = new Date().getFullYear()
    formActividad.quincenaPago = null
    formActividad.esMultiplesMeses = false
    formActividad.mesesSeleccionados = []
    formActividad.tipoRifa = null
    
    // Recargar actividades
    await fetchActividades()
    
    // Verificar si las actividades se crearon correctamente
    if (actividadesCreadas.length > 0) {
      const actividadesConSerie = actividadesCreadas.filter(a => a.actividad_serie_id).length
      if (formActividad.esMultiplesMeses && actividadesConSerie === 0 && actividadesCreadas.length > 1) {
        console.warn('⚠️ Las actividades se crearon pero sin actividad_serie_id. Ejecuta el script SQL AGREGAR_CAMPO_ACTIVIDAD_SERIE_ID.sql')
        notificationStore.warning('Actividades creadas, pero el campo de agrupación no está disponible. Ejecuta el script SQL para habilitar la agrupación.', 'Advertencia')
      } else {
        notificationStore.success(`Actividad${actividadesCreadas.length > 1 ? 'es' : ''} creada${actividadesCreadas.length > 1 ? 's' : ''} exitosamente`, 'Éxito')
      }
    } else {
      notificationStore.error('No se pudieron crear las actividades', 'Error')
    }
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
    // Asegurar que la natillera esté cargada
    if (!natillera.value) {
      fetchNatillera()
    }
    if (formActividad.tipoProceso === 'en_curso') {
      fetchSocios().then(() => {
        // Si hay periodos disponibles y no hay uno seleccionado, seleccionar el primero
        if (opcionesPeriodo.value.length > 0 && !formActividad.periodoSeleccionado) {
          const primerPeriodo = mesesDelPeriodo.value[0]
          formActividad.periodoSeleccionado = primerPeriodo
          onPeriodoSeleccionado()
        } else {
          calcularFechaLimitePago()
        }
      })
    }
  } else {
    dropdownTipoActividad.value = false
    formActividad.valoresPorSocio = {}
    formActividad.valorIgual = 0
    tooltipVisible.value = null // Cerrar tooltip al cerrar modal
  }
})

// Cerrar dropdown tipo actividad al hacer clic fuera y posicionar panel por encima de todo
let dropdownTipoActividadCloseHandler = null
watch(dropdownTipoActividad, (isOpen) => {
  if (dropdownTipoActividadCloseHandler) {
    document.removeEventListener('click', dropdownTipoActividadCloseHandler)
    dropdownTipoActividadCloseHandler = null
  }
  if (!isOpen) {
    dropdownTipoActividadStyle.value = {}
    return
  }
  nextTick(() => {
    const el = dropdownTipoActividadRef.value
    if (el) {
      const rect = el.getBoundingClientRect()
      dropdownTipoActividadStyle.value = {
        left: `${rect.left}px`,
        top: `${rect.bottom + 6}px`,
        minWidth: `${rect.width}px`
      }
    }
    dropdownTipoActividadCloseHandler = (e) => {
      const panel = document.querySelector('[data-dropdown-tipo-actividad-panel]')
      if (dropdownTipoActividadRef.value && !dropdownTipoActividadRef.value.contains(e.target) && panel && !panel.contains(e.target)) {
        dropdownTipoActividad.value = false
      }
    }
    // Retrasar el listener para que el clic que abrió el dropdown no lo cierre al burbujear
    setTimeout(() => {
      document.addEventListener('click', dropdownTipoActividadCloseHandler)
    }, 0)
  })
})

// Cerrar tooltip al hacer clic fuera
function handleClickOutside(event) {
  if (tooltipVisible.value && !event.target.closest('[data-tooltip-container]')) {
    tooltipVisible.value = null
  }
}

// Observar cambios en socios para recalcular fecha límite
watch(() => socios.value, () => {
  if (formActividad.tipoProceso === 'en_curso' && modalNuevaActividad.value) {
    calcularFechaLimitePago()
  }
}, { deep: true })

// Resetear tipoRifa cuando el tipo de actividad cambia y ya no es 'rifa'
watch(() => formActividad.tipo, (nuevoTipo) => {
  if (nuevoTipo !== 'rifa') {
    formActividad.tipoRifa = null
  }
})

// Función para abrir modal de asignar faltante
async function abrirModalAsignarFaltante(faltante) {
  faltanteSeleccionado.value = faltante
  socioSeleccionadoParaFaltante.value = ''
  
  // Asegurar que los socios estén cargados
  if (socios.value.length === 0) {
    await fetchSocios()
  }
  
  modalAsignarFaltante.value = true
}

// Función para confirmar asignación de faltante a socio
async function confirmarAsignarFaltante() {
  if (!socioSeleccionadoParaFaltante.value || !faltanteSeleccionado.value) {
    notificationStore.error('Debe seleccionar un socio', 'Error')
    return
  }

  asignandoFaltante.value = true
  try {
    const socioId = socioSeleccionadoParaFaltante.value
    const numerosFaltante = faltanteSeleccionado.value.numeros

    // Obtener los IDs de los números de rifa desde la base de datos
    const { data: numerosRifaData, error: errorFetch } = await supabase
      .from('numeros_rifa')
      .select('id, numero')
      .eq('actividad_id', actividadSeleccionada.value.id)
      .in('numero', numerosFaltante.map(n => n.numero))
      .is('socio_vendedor_id', null)
      .eq('nombre_comprador', faltanteSeleccionado.value.nombre)

    if (errorFetch) throw errorFetch

    if (!numerosRifaData || numerosRifaData.length === 0) {
      throw new Error('No se encontraron los números a asignar')
    }

    // Actualizar los números asignándolos al socio
    const numerosIdsToUpdate = numerosRifaData.map(n => n.id)
    
    const { error: errorUpdate } = await supabase
      .from('numeros_rifa')
      .update({
        socio_vendedor_id: socioId,
        nombre_comprador: null // Limpiar el nombre del faltante
      })
      .in('id', numerosIdsToUpdate)

    if (errorUpdate) throw errorUpdate

    // Verificar si el socio tiene un registro en socios_actividad
    const socioActividad = sociosActividad.value.find(sa => sa.socio_natillera_id === socioId)
    
    if (!socioActividad) {
      // Si no existe, crear el registro
      const valorTotal = numerosFaltante.reduce((sum, n) => sum + (n.valor || 0), 0)
      
      const { error: errorInsert } = await supabase
        .from('socios_actividad')
        .insert({
          actividad_id: actividadSeleccionada.value.id,
          socio_natillera_id: socioId,
          valor_asignado: valorTotal,
          valor_pagado: numerosFaltante.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0),
          estado: 'pendiente',
          fecha_limite_pago: actividadSeleccionada.value.fecha_limite_pago
        })

      if (errorInsert) throw errorInsert
    }

    notificationStore.success(`Números asignados correctamente al socio`, 'Éxito')

    // Cerrar modal y recargar datos
    modalAsignarFaltante.value = false
    faltanteSeleccionado.value = null
    socioSeleccionadoParaFaltante.value = ''

    // Recargar el detalle de la actividad
    await verDetalleActividad(actividadSeleccionada.value)
  } catch (e) {
    console.error('Error asignando faltante:', e)
    notificationStore.error(e.message || 'Error al asignar números al socio', 'Error')
  } finally {
    asignandoFaltante.value = false
  }
}

// Limpiar números de rifa cuando se cierra el modal de detalle
watch(modalDetalleActividad, (isOpen) => {
  if (!isOpen) {
    numerosRifa.value = {}
    numeroSeleccionado.value = null
    modalAsignarFaltante.value = false
    faltanteSeleccionado.value = null
    socioSeleccionadoParaFaltante.value = ''
  }
})

// Cerrar desplegable cuando se cierra el modal de venta
watch(modalVentaRifa, (isOpen) => {
  if (!isOpen) {
    desplegableSocioAbierto.value = false
  }
})

// Cerrar desplegable al hacer clic fuera
function handleClickOutsideDesplegable(event) {
  if (desplegableSocioAbierto.value && !event.target.closest('[data-socio-desplegable]')) {
    desplegableSocioAbierto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideDesplegable)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideDesplegable)
})

function confirmarEliminarActividad(actividad) {
  actividadAEliminar.value = actividad
}

async function eliminarActividadConfirmado() {
  if (!actividadAEliminar.value) return

  eliminando.value = true
  const actividadId = actividadAEliminar.value.id
  const descripcionActividad = actividadAEliminar.value.descripcion

  try {
    // Eliminar la actividad (los registros relacionados en socios_actividad se eliminarán automáticamente por CASCADE)
    const { error } = await supabase
      .from('actividades')
      .delete()
      .eq('id', actividadId)

    if (error) throw error

    // Remover la actividad de la lista local
    actividades.value = actividades.value.filter(a => a.id !== actividadId)
    
    // Cerrar modal de detalle si estaba abierto para esta actividad
    if (modalDetalleActividad.value && actividadSeleccionada.value?.id === actividadId) {
      modalDetalleActividad.value = false
    busquedaNumero.value = '' // Limpiar búsqueda al cerrar
      actividadSeleccionada.value = null
    }

    actividadAEliminar.value = null

    notificationStore.success(
      `La actividad "${descripcionActividad}" ha sido eliminada exitosamente`,
      'Actividad eliminada'
    )
  } catch (e) {
    console.error('Error eliminando actividad:', e)
    notificationStore.error(
      e.message || 'No se pudo eliminar la actividad',
      'Error al eliminar'
    )
  } finally {
    eliminando.value = false
  }
}

function confirmarEliminarGrupo(grupo) {
  grupoAEliminar.value = grupo
}

async function eliminarGrupoConfirmado() {
  if (!grupoAEliminar.value || !grupoAEliminar.value.actividades) return

  eliminandoGrupo.value = true
  const grupo = grupoAEliminar.value
  const serieId = grupo.serieId
  const descripcionGrupo = grupo.descripcionBase
  const cantidadActividades = grupo.actividades.length
  const idsActividades = grupo.actividades.map(a => a.id)

  try {
    // Eliminar todas las actividades del grupo
    // Los registros relacionados en socios_actividad se eliminarán automáticamente por CASCADE
    const { error } = await supabase
      .from('actividades')
      .delete()
      .in('id', idsActividades)

    if (error) throw error

    // Remover las actividades de la lista local
    actividades.value = actividades.value.filter(a => !idsActividades.includes(a.id))
    
    // Cerrar modal de detalle si estaba abierto para alguna actividad del grupo
    if (modalDetalleActividad.value && actividadSeleccionada.value && idsActividades.includes(actividadSeleccionada.value.id)) {
      modalDetalleActividad.value = false
      busquedaNumero.value = '' // Limpiar búsqueda al cerrar
      actividadSeleccionada.value = null
    }

    grupoAEliminar.value = null

    notificationStore.success(
      `El grupo "${descripcionGrupo}" con ${cantidadActividades} ${cantidadActividades === 1 ? 'actividad' : 'actividades'} ha sido eliminado exitosamente`,
      'Grupo eliminado'
    )
  } catch (e) {
    console.error('Error eliminando grupo:', e)
    notificationStore.error(
      e.message || 'No se pudo eliminar el grupo',
      'Error al eliminar'
    )
  } finally {
    eliminandoGrupo.value = false
  }
}

// Función para verificar si debe mostrarse el modal de bienvenida
function verificarModalBienvenida() {
  const clave = `actividades_bienvenida_${id}`
  const yaVisto = localStorage.getItem(clave)
  if (!yaVisto) {
    mostrarModalBienvenida.value = true
  }
}

// Función para cerrar el modal de bienvenida
function cerrarModalBienvenida() {
  mostrarModalBienvenida.value = false
  if (noMostrarDeNuevo.value) {
    const clave = `actividades_bienvenida_${id}`
    localStorage.setItem(clave, 'true')
  }
}

onMounted(() => {
  fetchActividades()
  fetchNatillera()
  verificarModalBienvenida()
  // Agregar listener para cerrar tooltip al hacer clic fuera
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside) // Para móvil
})

onUnmounted(() => {
  // Remover listener al desmontar
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
})
</script>


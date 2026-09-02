<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <!-- Page header (DS) — patrón unificado Socios/Cuotas/Préstamos/Actividades -->
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <CalendarIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Actividades</h1>
            <p class="ds-page-header__sub hidden sm:block">Rifas, eventos y otras actividades del fondo</p>
          </div>
          <!-- Móvil: CTA primario (acento) en línea con el título (sm+ usa el bloque de actions) -->
          <button
            type="button"
            class="ds-btn ds-btn--primary sm:hidden"
            aria-label="Nueva actividad"
            @click="modalNuevaActividad = true"
          >
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button
            type="button"
            class="ds-btn ds-btn--primary"
            aria-label="Nueva actividad"
            @click="modalNuevaActividad = true"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Nueva Actividad</span>
          </button>
        </div>
      </div>
    </header>
    <!-- Modal de Bienvenida / Tutorial -->
    <ModalWrapper
      :show="!!mostrarModalBienvenida"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-3xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="48rem"
      @close="cerrarModalBienvenida"
    >
        <!-- Cabecera de bienvenida (marca verde). Compacta móvil-fila / desktop-columna; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/30 bg-white/20 flex items-center justify-center">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">¡Bienvenido a Actividades! 🎉</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Aprende cómo crear y gestionar actividades</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/20 touch-manipulation" aria-label="Cerrar" @click="cerrarModalBienvenida">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <CalendarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">¡Bienvenido a Actividades! 🎉</h3>
              <p class="text-white/90 text-xs mt-1">Aprende cómo crear y gestionar actividades</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/20" aria-label="Cerrar" @click="cerrarModalBienvenida">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollBienvenida"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-6 sm:p-8"
          @scroll.passive="onScrollBienvenida"
        >
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
          <NatiscrollHint :show="hayMasBienvenida" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="noMostrarDeNuevo"
                class="w-4 h-4 text-natillera-500 border-gray-300 rounded focus:ring-natillera-500"
              />
              <span class="text-sm text-gray-600">No mostrar este mensaje de nuevo</span>
            </label>
            <!-- CTA de acento (identidad Actividades); w-full en móvil para área táctil cómoda -->
            <button type="button" @click="cerrarModalBienvenida" class="ds-btn ds-btn--primary w-full sm:w-auto">
              Entendido, ¡empecemos!
            </button>
          </div>
        </div>
    </ModalWrapper>

    <!-- Skeleton de carga inicial (resumen + selector + lista) -->
    <ActividadesSkeleton v-if="cargaInicial" />

    <template v-else>
    <!-- Tarjetas de resumen financiero (DS stat cards; color semántico por concepto) -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <div class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value whitespace-nowrap tabular-nums max-sm:text-[clamp(0.75rem,3.4vw,1.05rem)]">${{ formatMoney(totalIngresos) }}</p>
        <p class="ds-stat-card__label">Ingresos</p>
      </div>
      <div class="ds-stat-card">
        <div class="ds-stat-card__icon bg-red-100 text-red-600">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value text-red-600 whitespace-nowrap tabular-nums max-sm:text-[clamp(0.75rem,3.4vw,1.05rem)]">${{ formatMoney(totalGastos) }}</p>
        <p class="ds-stat-card__label">Gastos</p>
      </div>
      <div class="ds-stat-card">
        <div class="ds-stat-card__icon bg-purple-100 text-purple-600">
          <BanknotesIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value text-purple-600 whitespace-nowrap tabular-nums max-sm:text-[clamp(0.75rem,3.4vw,1.05rem)]">${{ formatMoney(utilidadTotal) }}</p>
        <p class="ds-stat-card__label">Utilidad</p>
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
    <!-- Empty state: sin actividades registradas (DS) -->
    <div v-if="actividades.length === 0" class="ds-empty-state">
      <div class="ds-empty-state__header">
        <div class="ds-empty-state__icon-wrap">
          <CalendarIcon class="w-7 h-7" />
        </div>
        <h3 class="ds-empty-state__title">No hay actividades registradas</h3>
        <p class="ds-empty-state__subtitle">
          Las actividades generan fondos adicionales para la natillera
        </p>
      </div>
      <div class="ds-empty-state__body">
        <button
          type="button"
          class="ds-btn ds-btn--primary ds-btn--block"
          @click="modalNuevaActividad = true"
        >
          <PlusIcon class="w-5 h-5" />
          Crear primera actividad
        </button>
      </div>
    </div>
    <div v-else class="space-y-6">
      <!-- Vista Normal: Todas las actividades sin agrupar (estilo referencia) -->
      <div v-if="!vistaAgrupada" class="space-y-4">
        <ActividadCard
          v-for="actividad in actividades"
          :key="actividad.id"
          :actividad="actividad"
          @click="actividad.tipo === 'rifa' && actividad.estado === 'liquidada' ? abrirModalGanadorRifa(actividad) : (actividad.estado === 'en_curso' ? verDetalleActividad(actividad) : null)"
          @eliminar="confirmarEliminarActividad(actividad)"
          @ver-desglose="abrirModalDesglosePagosRifa(actividad)"
          @cambiar-forma-pago="abrirModalFormaPagoLiquidacion(actividad)"
          @ver-miembros="abrirModalMiembrosPagaron(actividad)"
          @registrar-gastos="abrirModalRegistrarGastos(actividad)"
        />
      </div>
      <!-- Vista Agrupada: Grupos colapsables y actividades individuales -->
      <div v-else class="space-y-6">
        <!-- Grupos de actividades y actividades individuales -->
        <template v-for="(item, index) in actividadesAgrupadas" :key="item.tipo === 'grupo' ? item.serieId : (item.actividad?.id || `individual-${index}`)">
          <!-- Grupo de actividades (serie) - Tarjeta + contenedor integrados en un solo bloque -->
          <template v-if="item.tipo === 'grupo'">
            <div class="rounded-2xl overflow-hidden bg-white border border-indigo-200/60 shadow-[var(--shadow-xs)]">
              <!-- Franja de estado del grupo (color diferenciador índigo, análoga a Finalizada / En curso) -->
              <div class="flex items-center gap-1.5 px-4 py-2 border-b border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                <span>Grupo</span>
                <span class="ml-auto font-medium text-indigo-500">{{ item.actividades.length }} {{ item.actividades.length === 1 ? 'actividad' : 'actividades' }}</span>
              </div>
              <!-- Encabezado colapsable: en móvil dos filas (título+chevron / subtítulo+acciones) para que no se vea apretado -->
              <div
                @click="toggleGrupo(item.serieId)"
                :class="[
                  'p-3 sm:p-5 cursor-pointer transition-colors duration-200 min-h-[64px]',
                  isGrupoExpandido(item.serieId) ? 'bg-indigo-50/60' : 'bg-white hover:bg-indigo-50/50'
                ]"
              >
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <!-- Fila 1 móvil / bloque izquierdo desktop: icono + título + (subtítulo solo sm) + badge + chevron -->
                  <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div class="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CubeIcon class="w-5 h-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-display font-semibold text-gray-800 text-base sm:text-lg mb-0.5 leading-snug line-clamp-2">
                        {{ item.descripcionBase }}
                      </h3>
                      <p class="hidden sm:block text-xs text-indigo-600/80 font-medium leading-tight">
                        {{ isGrupoExpandido(item.serieId) ? 'Toca para cerrar el grupo' : 'Toca para ver el detalle' }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <div
                        class="w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 touch-manipulation"
                        :class="isGrupoExpandido(item.serieId) ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'"
                      >
                        <ChevronDownIcon class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': isGrupoExpandido(item.serieId) }" />
                      </div>
                    </div>
                  </div>
                  <!-- Fila 2 móvil / bloque derecho desktop: subtítulo (solo móvil) + botones -->
                  <div class="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <p class="sm:hidden w-full text-xs text-indigo-600/80 font-medium leading-tight">
                      {{ isGrupoExpandido(item.serieId) ? 'Toca para cerrar el grupo' : 'Toca para ver el detalle' }}
                    </p>
                    <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      @click.stop="confirmarEliminarGrupo(item)"
                      class="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors text-gray-400 hover:text-rose-600 hover:bg-rose-50 touch-manipulation"
                      title="Eliminar grupo completo"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                    <button
                      @click.stop="exportarGrupoAExcel(item)"
                      class="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 touch-manipulation"
                      title="Exportar grupo a Excel"
                    >
                      <ArrowDownTrayIcon class="w-5 h-5" />
                    </button>
                    <button
                      v-if="item.tipoActividad === 'rifa'"
                      @click.stop="abrirModalGanadoresGrupo(item)"
                      class="flex items-center gap-1.5 px-2.5 py-2.5 min-h-[44px] sm:px-3 rounded-xl transition-colors text-amber-600 hover:text-amber-700 hover:bg-white/80 touch-manipulation"
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
                class="border-t border-indigo-100 bg-indigo-50/50 pt-4 pb-4 px-3 sm:px-5 overflow-hidden animate-fade-in-up"
              >
                <p class="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-3 px-0.5">
                  Actividades del grupo ({{ item.actividades.length }})
                </p>
                <div class="space-y-3 sm:space-y-4">
                  <ActividadCard
                    v-for="actividad in item.actividades"
                    :key="actividad.id"
                    :actividad="actividad"
                    @click="actividad.tipo === 'rifa' && actividad.estado === 'liquidada' ? abrirModalGanadorRifa(actividad) : (actividad.estado === 'en_curso' ? verDetalleActividad(actividad) : null)"
                    @eliminar="confirmarEliminarActividad(actividad)"
                    @ver-desglose="abrirModalDesglosePagosRifa(actividad)"
                    @cambiar-forma-pago="abrirModalFormaPagoLiquidacion(actividad)"
                    @ver-miembros="abrirModalMiembrosPagaron(actividad)"
                    @registrar-gastos="abrirModalRegistrarGastos(actividad)"
                  />
                </div>
              </div>
            </div>
          </template>
        
        <!-- Actividad individual (sin serie) - estilo referencia -->
        <template v-else-if="item.tipo === 'individual' && item.actividad && item.actividad.id">
          <ActividadCard
            :key="item.actividad.id"
            :actividad="item.actividad"
            @click="item.actividad.tipo === 'rifa' && item.actividad.estado === 'liquidada' ? abrirModalGanadorRifa(item.actividad) : (item.actividad.estado === 'en_curso' ? verDetalleActividad(item.actividad) : null)"
            @eliminar="confirmarEliminarActividad(item.actividad)"
            @ver-desglose="abrirModalDesglosePagosRifa(item.actividad)"
            @cambiar-forma-pago="abrirModalFormaPagoLiquidacion(item.actividad)"
            @ver-miembros="abrirModalMiembrosPagaron(item.actividad)"
            @registrar-gastos="abrirModalRegistrarGastos(item.actividad)"
          />
        </template>
      </template>
      </div>
    </div>
    </template>
    <!-- Modal Nueva Actividad -->
    <ModalWrapper
      :show="!!modalNuevaActividad"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="modalNuevaActividad = false"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex (iOS-safe) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Nueva Actividad</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Registra una nueva actividad del fondo</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalNuevaActividad = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CalendarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Nueva Actividad</h3>
              <p class="text-white/90 text-xs mt-1">Registra una nueva actividad del fondo</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalNuevaActividad = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll (overlay del hint anclado al viewport del cuerpo) -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollNuevaActividad"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] bg-slate-50/60"
          @scroll.passive="onScrollNuevaActividad"
        >
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
          <NatiscrollHint :show="hayMasNuevaActividad" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalNuevaActividad = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button type="button" @click="handleCrearActividad" :disabled="loading" class="btn-modal-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </ModalWrapper>
    <!-- Modal Detalle Actividad en Curso -->
    <ModalWrapper
      :show="!!(modalDetalleActividad && actividadSeleccionada)"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-4xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="56rem"
      @close="modalDetalleActividad = false"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex (iOS-safe) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CalendarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-base font-display font-bold leading-tight">{{ actividadSeleccionada.descripcion }}</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Detalle de actividad en curso</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalDetalleActividad = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CalendarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3 line-clamp-2">{{ actividadSeleccionada.descripcion }}</h3>
              <p class="text-white/90 text-xs mt-1">Detalle de actividad en curso</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalDetalleActividad = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollDetalle"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6"
          @scroll.passive="onScrollDetalle"
        >
          <!-- Fechas (info secundaria: chips compactos) -->
          <div
            class="grid gap-2.5 mb-3"
            :class="actividadSeleccionada.tipo === 'rifa' ? 'grid-cols-2' : 'grid-cols-1'"
          >
            <div class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Fecha límite</p>
              <p class="font-semibold text-gray-700 text-[13px] sm:text-sm leading-tight mt-0.5 break-words">
                {{ actividadSeleccionada.fecha_limite_pago ? formatDate(actividadSeleccionada.fecha_limite_pago) : 'No definida' }}
              </p>
            </div>
            <div v-if="actividadSeleccionada.tipo === 'rifa'" class="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Fecha de juego</p>
              <p class="font-semibold text-gray-700 text-[13px] sm:text-sm leading-tight mt-0.5 break-words">
                {{ actividadSeleccionada.fecha_juego_rifa ? formatDate(actividadSeleccionada.fecha_juego_rifa) : (actividadSeleccionada.cuando_juego_rifa ? etiquetaCuandoJuegoRifa(actividadSeleccionada.cuando_juego_rifa) : '—') }}
              </p>
            </div>
          </div>
          <!-- Totales destacados (jerarquía: valor grande + acento de color) -->
          <div class="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3">
            <!-- Asignado / Proyecto -->
            <div class="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4">
              <div class="flex items-center gap-1.5 mb-1.5">
                <div class="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <CurrencyDollarIcon class="w-4 h-4" />
                </div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-blue-700/80 leading-tight">
                  {{ actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'manual' ? 'Proyecto' : 'Asignado' }}
                </p>
              </div>
              <p class="font-display font-extrabold text-blue-700 text-2xl sm:text-3xl leading-none break-all">
                <span class="sm:hidden">${{ formatMoneyCompact(detalleAsignado) }}</span>
                <span class="hidden sm:inline">${{ formatMoney(detalleAsignado) }}</span>
              </p>
            </div>
            <!-- Recaudado -->
            <div class="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-3 sm:p-4">
              <div class="flex items-center gap-1.5 mb-1.5">
                <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <BanknotesIcon class="w-4 h-4" />
                </div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80 leading-tight">Recaudado</p>
              </div>
              <p class="font-display font-extrabold text-emerald-700 text-2xl sm:text-3xl leading-none break-all">
                <span class="sm:hidden">${{ formatMoneyCompact(detalleRecaudado) }}</span>
                <span class="hidden sm:inline">${{ formatMoney(detalleRecaudado) }}</span>
              </p>
            </div>
          </div>
          <!-- Progreso recaudado / asignado -->
          <div v-if="detalleAsignado > 0" class="mb-5">
            <div class="flex items-center justify-between mb-1.5 text-[11px] sm:text-xs">
              <span class="font-semibold text-gray-600">{{ detallePctRecaudado }}% recaudado</span>
              <span class="font-medium text-gray-400">
                ${{ formatMoney(detalleRecaudado) }} de ${{ formatMoney(detalleAsignado) }}
              </span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-full rounded-full bg-emerald-500 transition-all duration-500"
                :style="{ width: detallePctRecaudado + '%' }"
              ></div>
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
              
              <!-- Buscador: por número (rifa aleatoria) y/o por nombre. Icono/borrar por flex (iOS-safe) -->
              <div v-if="sociosActividad.length > 0" class="flex-1 sm:max-w-xs">
                <div class="flex items-center border-2 border-natillera-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-natillera-500/50 focus-within:border-natillera-500 transition-colors">
                  <span class="pl-3 flex-shrink-0 text-gray-400 pointer-events-none">
                    <MagnifyingGlassIcon class="w-5 h-5" />
                  </span>
                  <input
                    v-model="busquedaNumero"
                    type="text"
                    :placeholder="actividadSeleccionada.tipo === 'rifa' && actividadSeleccionada.tipo_rifa === 'aleatoria' ? 'Buscar por número o nombre...' : 'Buscar por nombre...'"
                    class="flex-1 min-w-0 py-2.5 px-2 bg-transparent text-base outline-none border-none focus:ring-0"
                  />
                  <button
                    v-if="busquedaNumero.trim()"
                    type="button"
                    class="pr-3 flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600"
                    @click="busquedaNumero = ''"
                  >
                    <XMarkIcon class="w-4 h-4" />
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
                class="p-3 sm:p-4 bg-white rounded-xl border transition-all"
                :class="{
                  'border-green-200 bg-green-50/30': getEstadoDisplaySocio(socioAct) === 'pagado',
                  'border-amber-200 bg-amber-50/30': getEstadoDisplaySocio(socioAct) === 'parcial',
                  'border-red-200 bg-red-50/30': getEstadoDisplaySocio(socioAct) === 'mora',
                  'border-gray-200 bg-gray-50/30': getEstadoDisplaySocio(socioAct) === 'pendiente'
                }"
              >
                <!-- Header: Nombre + Badge en una sola fila (compacto en móvil). En rifa aleatoria el estado se deriva de los números para coincidir con Pagado/Saldo -->
                <div class="flex items-center justify-between gap-2 mb-2.5">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-800 text-sm truncate">{{ socioAct.socio_natillera?.socio?.nombre || 'Sin nombre' }}</p>
                    <p v-if="socioAct.socio_natillera?.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socioAct.socio_natillera.socio.telefono }}</p>
                  </div>
                  <span
                    class="flex-shrink-0 inline-block px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
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
                
                <!-- Valores: tira compacta de 3 segmentos con divisores (legible en móvil) -->
                <div class="grid grid-cols-3 rounded-xl bg-slate-50 border border-slate-100 divide-x divide-slate-200/70 overflow-hidden">
                  <div class="px-2 py-2 text-center min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">A pagar</p>
                    <p class="font-bold text-gray-800 text-[13px] sm:text-sm leading-tight mt-0.5 break-all">
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
                  <div class="px-2 py-2 text-center min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Pagado</p>
                    <p class="font-bold text-emerald-600 text-[13px] sm:text-sm leading-tight mt-0.5 break-all">
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
                  <div class="px-2 py-2 text-center min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">Saldo</p>
                    <p class="font-bold text-rose-600 text-[13px] sm:text-sm leading-tight mt-0.5 break-all">
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

                <!-- Eliminar el pago del socio. La confirmación es en línea (no abre otro modal):
                     este bloque vive dentro del modal de detalle y anidar overlays rompe iOS. -->
                <div v-if="getValorPagadoSocio(socioAct) > 0" class="mt-2.5">
                  <button
                    v-if="pagoAEliminar !== socioAct.id"
                    type="button"
                    class="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100 touch-manipulation"
                    @click="pedirConfirmacionEliminarPago(socioAct)"
                  >
                    <TrashIcon class="w-4 h-4" />
                    Eliminar pago
                  </button>

                  <div v-else class="rounded-xl border border-red-200 bg-red-50 p-3">
                    <p v-if="cargandoPreviewPago" class="text-[13px] text-red-800">Calculando el impacto…</p>
                    <template v-else>
                      <p class="text-[13px] font-bold text-red-800">
                        Se revertirán ${{ formatMoney(previewPago?.valorTotal || getValorPagadoSocio(socioAct)) }}
                      </p>
                      <ul v-if="previewPago?.avisos?.length" class="mt-2 space-y-1">
                        <li v-for="(aviso, i) in previewPago.avisos" :key="i" class="flex gap-1.5 text-[11px] leading-snug text-red-700">
                          <span class="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-red-500"></span>
                          <span>{{ aviso }}</span>
                        </li>
                      </ul>
                      <p class="mt-2 text-[11px] text-red-600">La actividad volverá a quedar pendiente para este socio.</p>
                    </template>
                    <div class="mt-3 flex gap-2">
                      <button
                        type="button"
                        :disabled="eliminandoPagoActividad"
                        class="flex-1 min-h-[44px] rounded-xl border border-gray-300 bg-white px-3 text-[13px] font-semibold text-gray-700 disabled:opacity-50 touch-manipulation"
                        @click="cancelarEliminarPago()"
                      >
                        Cancelar
                      </button>
                      <!-- Acción destructiva → rojo (excepción a btn-modal-primary) -->
                      <button
                        type="button"
                        :disabled="eliminandoPagoActividad || cargandoPreviewPago"
                        class="flex-1 min-h-[44px] rounded-xl bg-red-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 touch-manipulation"
                        @click="confirmarEliminarPagoActividad(socioAct)"
                      >
                        {{ eliminandoPagoActividad ? 'Eliminando…' : 'Sí, eliminar' }}
                      </button>
                    </div>
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
                        <p class="font-bold text-gray-800 text-[13px] sm:text-base break-words">
                          <span class="sm:hidden">${{ formatMoneyCompact(faltante.numeros.reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                          <span class="hidden sm:inline">${{ formatMoney(faltante.numeros.reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                        </p>
                      </div>
                      <div class="text-center sm:text-right">
                        <p class="text-xs text-gray-500 mb-1">Valor pagado</p>
                        <p class="font-bold text-green-600 text-[13px] sm:text-base break-words">
                          <span class="sm:hidden">${{ formatMoneyCompact(faltante.numeros.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                          <span class="hidden sm:inline">${{ formatMoney(faltante.numeros.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)) }}</span>
                        </p>
                      </div>
                      <div class="text-center sm:text-right">
                        <p class="text-xs text-gray-500 mb-1">Saldo</p>
                        <p class="font-bold text-red-600 text-[13px] sm:text-base break-words">
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
          <NatiscrollHint :show="hayMasDetalle" />
        </div>
        <!-- Footer de acciones fijo -->
        <!-- Footer de liquidación: solo disponible (visible + habilitado) para actividades tipo rifa -->
        <div v-if="actividadSeleccionada.tipo === 'rifa'" class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            @click="abrirModalLiquidar"
            class="btn-modal-primary w-full"
          >
            Liquidar Actividad
          </button>
        </div>
      </ModalWrapper>
    </div>
    <!-- Modal Liquidar Actividad -->
    <ModalWrapper
      :show="!!(modalLiquidarActividad && actividadSeleccionada)"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalLiquidarActividad = false"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex (iOS-safe) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Liquidar Actividad</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ actividadSeleccionada.descripcion }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalLiquidarActividad = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Liquidar Actividad</h3>
              <p class="text-white/90 text-xs mt-1 line-clamp-2">{{ actividadSeleccionada.descripcion }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalLiquidarActividad = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollLiquidar"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-4"
          @scroll.passive="onScrollLiquidar"
        >
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
          <!-- Forma de pago del premio (solo rifas) -->
          <div>
            <label class="label mb-2 block">Forma de pago del premio</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="formLiquidar.forma_pago = 'efectivo'"
                :class="[
                  'relative p-3 rounded-xl border-2 transition-all duration-200',
                  formLiquidar.forma_pago === 'efectivo'
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                ]"
              >
                <span class="text-2xl">💵</span>
                <span :class="formLiquidar.forma_pago === 'efectivo' ? 'font-semibold text-emerald-700' : 'text-gray-600'">Efectivo</span>
              </button>
              <button
                type="button"
                @click="formLiquidar.forma_pago = 'transferencia'"
                :class="[
                  'relative p-3 rounded-xl border-2 transition-all duration-200',
                  formLiquidar.forma_pago === 'transferencia'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                ]"
              >
                <span class="text-2xl">💳</span>
                <span :class="formLiquidar.forma_pago === 'transferencia' ? 'font-semibold text-blue-700' : 'text-gray-600'">Transferencia</span>
              </button>
            </div>
          </div>
          <!-- Número ganador (para mostrar ganador al abrir la rifa liquidada) -->
          <div>
            <label class="label mb-2 block">Número ganador *</label>
            <div class="relative flex items-center gap-2">
              <input 
                v-model="formLiquidar.numeroGanador"
                type="text" 
                inputmode="numeric"
                maxlength="2"
                class="input-field text-center text-xl font-bold tracking-[0.3em] flex-1"
                placeholder="00"
                :disabled="loadingNumeroGanador"
                @input="formLiquidar.numeroGanador = formLiquidar.numeroGanador.replace(/\D/g, '').slice(0, 2)"
              />
              <span v-if="loadingNumeroGanador" class="text-xs text-gray-500 whitespace-nowrap">Obteniendo...</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Número de la rifa que ganó (00-99). Si hay fecha de juego, se completa con las 2 últimas cifras del resultado de la Lotería de Medellín.</p>
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
          <NatiscrollHint :show="hayMasLiquidar" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalLiquidarActividad = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button
              type="button"
              @click="guardarLiquidacion"
              :disabled="loading || !formLiquidar.premioEntregado || formLiquidar.premioEntregado <= 0 || !numeroGanadorValido"
              class="btn-modal-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Liquidando...' : 'Liquidar' }}
            </button>
          </div>
        </div>
    </ModalWrapper>
    <!-- Modal Confirmar Liquidación con Utilidad Negativa -->
    <ModalWrapper
      :show="!!(modalConfirmarLiquidacionNegativa && actividadSeleccionada)"
      :z-index="60"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalConfirmarLiquidacionNegativa = false"
    >
        <!-- Cabecera de advertencia (ámbar, excepción semántica de color). Compacta móvil-fila / desktop-columna; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-amber-500 text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Advertencia</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Utilidad negativa detectada</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalConfirmarLiquidacionNegativa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Advertencia</h3>
              <p class="text-white/90 text-xs mt-1">Utilidad negativa detectada</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalConfirmarLiquidacionNegativa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollConfirmarNegativa"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-4"
          @scroll.passive="onScrollConfirmarNegativa"
        >
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
          <NatiscrollHint :show="hayMasConfirmarNegativa" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalConfirmarLiquidacionNegativa = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <!-- Acción destructiva/irreversible → rojo (excepción a btn-modal-primary verde marca) -->
            <button
              type="button"
              @click="confirmarLiquidacion"
              :disabled="loading"
              class="flex-1 inline-flex items-center justify-center min-h-[48px] rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-4 shadow-[0_4px_12px_-2px_rgba(220,38,38,0.32)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {{ loading ? 'Liquidando...' : 'Liquidar de todas formas' }}
            </button>
          </div>
        </div>
    </ModalWrapper>
    <!-- Modal Ganador Rifa (rifa liquidada) -->
    <ModalWrapper
      :show="!!(modalGanadorRifa && actividadSeleccionada)"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalGanadorRifa = false"
    >
        <!-- Cabecera celebración (oro/ámbar, excepción temática). Compacta móvil-fila / desktop-columna; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/40 bg-white/25 flex items-center justify-center text-lg">🏆</div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight drop-shadow-sm">¡Rifa liquidada!</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ actividadSeleccionada.descripcion }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/20 touch-manipulation" aria-label="Cerrar" @click="modalGanadorRifa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/25 rounded-xl flex items-center justify-center border border-white/40 text-2xl">🏆</div>
              <h3 class="text-lg font-display font-bold mt-3 drop-shadow-sm">¡Rifa liquidada!</h3>
              <p class="text-white/90 text-xs mt-1 line-clamp-2">{{ actividadSeleccionada.descripcion }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/20" aria-label="Cerrar" @click="modalGanadorRifa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollGanadorRifa"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-5 space-y-4"
          @scroll.passive="onScrollGanadorRifa"
        >
          <!-- Ganador / Ganadora o Gana la natillera (arriba) -->
          <div v-if="actividadSeleccionada.ganador_es_faltante" class="text-center">
            <div class="inline-flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-natillera-50 via-emerald-50/80 to-teal-50 border-2 border-natillera-200 shadow-md">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-natillera-400 to-emerald-600 flex items-center justify-center shadow-lg ring-2 ring-natillera-200 text-2xl sm:text-3xl">🏦</div>
              <p class="font-display font-bold text-base sm:text-lg text-natillera-800">¡Gana la natillera!</p>
              <p class="text-xs text-gray-600 max-w-xs leading-snug">
                Este número no estaba asignado. El premio y la utilidad se suman al fondo.
              </p>
            </div>
          </div>
          <div v-else-if="actividadSeleccionada.ganador_nombre && !actividadSeleccionada.ganador_es_faltante" class="text-center w-full">
            <div class="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-natillera-50 via-emerald-50/80 to-teal-50 border-2 border-natillera-200 shadow-md">
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl sm:text-3xl border-2 border-amber-300 shadow-lg ring-2 ring-natillera-200">🏆</div>
              <p class="text-xs font-medium text-natillera-600">Ganador/a</p>
              <p class="font-display font-bold text-lg sm:text-xl text-natillera-800">{{ actividadSeleccionada.ganador_nombre }}</p>
            </div>
          </div>
          <!-- Número ganador (justo después del ganador) -->
          <div v-if="actividadSeleccionada.numero_ganador != null && actividadSeleccionada.numero_ganador !== ''" class="text-center">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Número ganador</p>
            <div class="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-300 shadow-md">
              <span class="text-3xl sm:text-4xl font-black text-amber-800 tracking-widest">
                {{ String(actividadSeleccionada.numero_ganador).padStart(2, '0') }}
              </span>
            </div>
          </div>
          <!-- Bloque: información del sorteo Lotería de Medellín -->
          <div v-if="actividadSeleccionada.sorteo_loteria_medellin || actividadSeleccionada.numero_completo_loteria_medellin" class="rounded-xl border-2 border-red-200 bg-white p-3 shadow-md">
            <p class="text-red-700 font-bold text-sm sm:text-base mb-2">Resultado Lotería de Medellín</p>
            <p class="text-red-600 font-bold text-base mb-0.5">Sorteo {{ actividadSeleccionada.sorteo_loteria_medellin || '—' }}</p>
            <p class="text-red-600 text-xs mb-2">{{ formatDateSorteoDisplay(actividadSeleccionada.fecha_juego_rifa) || '—' }}</p>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <p class="text-red-600 text-xs font-semibold uppercase tracking-wider mb-1">Número</p>
                <div class="rounded-lg bg-red-600 text-white text-center py-2 px-2">
                  <span class="text-lg font-bold">{{ actividadSeleccionada.numero_completo_loteria_medellin || '—' }}</span>
                </div>
              </div>
              <div>
                <p class="text-red-600 text-xs font-semibold uppercase tracking-wider mb-1">Serie</p>
                <div class="rounded-lg bg-red-600 text-white text-center py-2 px-2">
                  <span class="text-lg font-bold">{{ actividadSeleccionada.serie_loteria_medellin || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Sin datos de ganador -->
          <div v-else-if="actividadSeleccionada.numero_ganador == null || actividadSeleccionada.numero_ganador === ''" class="text-center py-3">
            <p class="text-xs text-gray-500 italic">Datos del ganador no registrados para esta rifa.</p>
          </div>
        </div>
          <NatiscrollHint :show="hayMasGanadorRifa" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-2">
          <div class="grid gap-2" :class="isMobile ? 'grid-cols-2' : 'grid-cols-1'">
            <button 
              type="button"
              @click="descargarTarjetaGanador"
              :disabled="compartiendoODescargando"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>{{ compartiendoODescargando ? '...' : 'Descargar' }}</span>
            </button>
            <button 
              v-if="isMobile"
              type="button"
              @click="compartirGanadorWhatsApp"
              :disabled="compartiendoODescargando"
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span>{{ compartiendoODescargando ? '...' : 'WhatsApp' }}</span>
            </button>
            <p v-else class="text-center text-xs text-gray-500 py-1.5 px-2">
              En móvil puedes compartir por WhatsApp desde este mismo modal.
            </p>
          </div>
          <button type="button" @click="modalGanadorRifa = false" class="btn-modal-primary w-full">
            Cerrar
          </button>
          <!-- Solo en desarrollo: revertir liquidación para pruebas -->
          <button 
            v-if="isDev"
            type="button"
            @click="revertirLiquidacionRifa"
            :disabled="revertiendoLiquidacion"
            class="w-full px-4 py-2.5 text-sm font-medium rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ revertiendoLiquidacion ? 'Revirtiendo...' : 'Revertir liquidación (solo dev)' }}
          </button>
        </div>
    </ModalWrapper>
    <!-- Modal Cambiar forma de pago entrega premio (rifa liquidada) -->
    <ModalWrapper
      :show="!!actividadParaFormaPago"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-sm max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="24rem"
      @close="actividadParaFormaPago = null"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Forma de pago del premio</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ actividadParaFormaPago?.descripcion }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="actividadParaFormaPago = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Forma de pago del premio</h3>
              <p class="text-white/90 text-xs mt-1 line-clamp-2">{{ actividadParaFormaPago?.descripcion }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="actividadParaFormaPago = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable (corto: 2 opciones; natiscroll omitido por cuerpo mínimo que no desborda) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-5">
          <div class="flex gap-2">
            <button
              type="button"
              @click="formFormaPagoLiquidacion.forma_pago = 'efectivo'"
              :class="[
                'flex-1 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                formFormaPagoLiquidacion.forma_pago === 'efectivo'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              ]"
            >
              Efectivo
            </button>
            <button
              type="button"
              @click="formFormaPagoLiquidacion.forma_pago = 'transferencia'"
              :class="[
                'flex-1 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                formFormaPagoLiquidacion.forma_pago === 'transferencia'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              ]"
            >
              Transferencia
            </button>
          </div>
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="actividadParaFormaPago = null" class="btn-modal-secondary flex-1">Cancelar</button>
            <button type="button" @click="guardarFormaPagoLiquidacion" :disabled="guardandoFormaPago" class="btn-modal-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ guardandoFormaPago ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
    </ModalWrapper>
    <!-- Modal Desglose valores pagados (rifa liquidada) -->
    <ModalWrapper
      :show="!!actividadParaDesglosePagos"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="actividadParaDesglosePagos = null"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-base font-display font-bold leading-tight">{{ actividadParaDesglosePagos?.descripcion }}</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Miembros que pagaron</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="actividadParaDesglosePagos = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3 line-clamp-2">{{ actividadParaDesglosePagos?.descripcion }}</h3>
              <p class="text-white/90 text-xs mt-1">Miembros que pagaron</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="actividadParaDesglosePagos = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollDesglose"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-5"
          @scroll.passive="onScrollDesglose"
        >
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 sticky top-0">
              <tr>
                <th class="w-12 text-center py-2.5 px-2 font-semibold text-gray-700">Nº</th>
                <th class="text-left py-2.5 px-3 font-semibold text-gray-700">Nombre del socio</th>
                <th class="text-right py-2.5 px-3 font-semibold text-gray-700">Valor pagado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(p, i) in (actividadParaDesglosePagos?.valores_pagados_rifa || [])"
                :key="i"
                :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'"
                class="border-b border-gray-100"
              >
                <td class="py-2 px-2 text-center text-gray-500 font-medium">{{ i + 1 }}</td>
                <td class="py-2 px-3 text-gray-800">{{ p.nombre }}</td>
                <td class="py-2 px-3 text-right font-medium text-green-700">${{ formatMoney(p.valor_pagado) }}</td>
              </tr>
              <tr v-if="!(actividadParaDesglosePagos?.valores_pagados_rifa || []).length" class="bg-white">
                <td colspan="3" class="py-6 px-3 text-center text-gray-500">No hay registros de pagos.</td>
              </tr>
            </tbody>
            <tfoot v-if="(actividadParaDesglosePagos?.valores_pagados_rifa || []).length > 0" class="bg-emerald-50 border-t-2 border-emerald-200">
              <tr>
                <td class="py-2.5 px-2"></td>
                <td class="py-2.5 px-3 font-bold text-gray-800">Total</td>
                <td class="py-2.5 px-3 text-right font-bold text-emerald-700">
                  ${{ formatMoney((actividadParaDesglosePagos?.valores_pagados_rifa || []).reduce((s, p) => s + (p.valor_pagado || 0), 0)) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>
          <NatiscrollHint :show="hayMasDesglose" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" @click="actividadParaDesglosePagos = null" class="btn-modal-primary w-full">
            Cerrar
          </button>
        </div>
    </ModalWrapper>
    <!-- Modal Registrar gastos (actividades finalizadas que no son rifa) -->
    <ModalWrapper
      :show="!!(modalRegistrarGastos && actividadParaGastos)"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalRegistrarGastos = false"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Registrar gastos</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ actividadParaGastos?.descripcion }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalRegistrarGastos = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Registrar gastos</h3>
              <p class="text-white/90 text-xs mt-1 line-clamp-2">{{ actividadParaGastos?.descripcion }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalRegistrarGastos = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable (corto; natiscroll omitido, footer fijo asegura la CTA) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-4">
          <!-- Ingresos (solo lectura) -->
          <div class="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Ingresos</span>
            <span class="font-bold text-emerald-600 text-sm">${{ formatMoney(actividadParaGastos?.ingresos || 0) }}</span>
          </div>
          <!-- Gastos (editable) -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Gastos totales</label>
            <div class="flex items-center border-2 border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-natillera-500/40 focus-within:border-natillera-400 transition-colors">
              <span class="pl-3 flex-shrink-0 text-gray-400 font-semibold pointer-events-none">$</span>
              <input
                :value="formatMilesInput(formGastos.gastos)"
                @input="formGastos.gastos = parseMilesInput($event.target.value)"
                type="text"
                inputmode="decimal"
                pattern="[0-9.]*"
                placeholder="0"
                class="flex-1 min-w-0 py-3 px-2 bg-transparent text-base font-semibold text-gray-800 outline-none border-none focus:ring-0"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1.5">Registra el total de gastos de la actividad. La utilidad se recalcula automáticamente.</p>
          </div>
          <!-- Utilidad calculada -->
          <div class="rounded-xl border-2 px-4 py-3" :class="utilidadGastosPreview >= 0 ? 'border-violet-200 bg-violet-50/60' : 'border-rose-200 bg-rose-50/60'">
            <p class="text-sm text-gray-600 font-medium mb-0.5">Utilidad</p>
            <p class="font-display font-extrabold text-2xl leading-none" :class="utilidadGastosPreview >= 0 ? 'text-violet-600' : 'text-rose-600'">
              ${{ formatMoney(utilidadGastosPreview) }}
            </p>
          </div>
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalRegistrarGastos = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button type="button" @click="guardarGastos" :disabled="guardandoGastos" class="btn-modal-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ guardandoGastos ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
    </ModalWrapper>
    <!-- Modal Ver ganadores (grupo de rifas) -->
    <ModalWrapper
      :show="!!grupoGanadoresSeleccionado"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="grupoGanadoresSeleccionado = null"
    >
        <!-- Cabecera celebración (dorado, excepción temática). Compacta móvil-fila / desktop-columna; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-gradient-to-br from-[#F5CB5C] via-[#E0A620] to-[#BE870F] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/40 bg-white/25 flex items-center justify-center text-lg">🏆</div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Ganadores del grupo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length }} rifa{{ (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length !== 1 ? 's' : '' }} · {{ grupoGanadoresSeleccionado?.descripcionBase }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/20 touch-manipulation" aria-label="Cerrar" @click="grupoGanadoresSeleccionado = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/25 rounded-xl flex items-center justify-center border border-white/40 text-2xl">🏆</div>
              <h3 class="text-lg font-display font-bold mt-3">Ganadores del grupo</h3>
              <p class="text-white/90 text-xs mt-1 line-clamp-2">{{ (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length }} rifa{{ (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length !== 1 ? 's' : '' }} · {{ grupoGanadoresSeleccionado?.descripcionBase }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/20" aria-label="Cerrar" @click="grupoGanadoresSeleccionado = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Lista scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollGanadoresGrupo"
          class="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-3 sm:p-4 space-y-2.5 min-h-0"
          @scroll.passive="onScrollGanadoresGrupo"
        >
          <div v-if="!(grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa').length" class="text-center py-8 text-gray-500 text-sm">No hay rifas en este grupo.</div>
          <template v-else v-for="actividad in (grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa')" :key="actividad.id">
            <div class="rounded-xl border border-[#E7C877]/70 bg-[#FCF6E3]/70 overflow-hidden">
              <div class="px-3 py-2 border-b border-[#EAD79B]/70">
                <p class="text-sm font-semibold text-gray-800 line-clamp-2">{{ actividad.descripcion }}</p>
              </div>
              <div class="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                <!-- Info ganador / estado (arriba en móvil, izquierda en desktop) -->
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
                    <img v-else :src="getAvatarUrl(actividad.ganador_nombre || '', actividad.ganador_socio_natillera?.socio?.avatar_seed, actividad.ganador_socio_natillera?.socio?.avatar_style || 'adventurer')" :alt="actividad.ganador_nombre" class="w-9 h-9 rounded-full ring-2 ring-[#E7C877] object-cover flex-shrink-0" />
                    <div class="min-w-0">
                      <span class="text-xs px-1.5 py-0.5 rounded bg-[#EAD79B]/80 text-[#8A6A12] font-bold">Nº {{ String(actividad.numero_ganador).padStart(2, '0') }}</span>
                      <p class="text-sm font-semibold text-gray-800 truncate mt-0.5">{{ actividad.ganador_es_faltante ? '¡Gana la natillera!' : (actividad.ganador_nombre || 'Desconocido') }}</p>
                    </div>
                  </template>
                </div>
                <!-- Resultados R/E/N (full width en móvil, a la derecha en desktop) -->
                <div v-if="actividad.estado === 'liquidada' && ((actividad.ingresos ?? 0) || (actividad.gastos ?? 0) || (actividad.utilidad ?? 0))" class="grid grid-cols-3 gap-2 text-center w-full sm:w-auto sm:shrink-0">
                  <div class="rounded-lg bg-emerald-50 border border-emerald-200/70 py-1.5 px-2">
                    <p class="text-[10px] font-semibold text-emerald-600 uppercase">Recogido</p>
                    <p class="text-xs font-bold text-gray-800">${{ formatMoney(actividad.ingresos || 0) }}</p>
                  </div>
                  <div class="rounded-lg bg-[#FCF6E3] border border-[#E7C877]/70 py-1.5 px-2">
                    <p class="text-[10px] font-semibold text-[#B7860E] uppercase">Entregado</p>
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
          <NatiscrollHint :show="hayMasGanadoresGrupo" />
        </div>
        <!-- Totalizador -->
        <div v-if="(grupoGanadoresSeleccionado?.actividades || []).filter(a => a.tipo === 'rifa' && a.estado === 'liquidada').length" class="flex-shrink-0 border-t border-[#E7C877]/50 bg-[#FCF6E3]/80 px-3 py-3">
          <p class="text-[10px] font-bold text-[#8A6A12] uppercase tracking-wider mb-2">Totales (rifas liquidadas)</p>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-emerald-50 border border-emerald-200/70 px-2 py-2 text-center">
              <p class="text-[10px] font-bold text-emerald-600 uppercase">Recogido</p>
              <p class="text-sm font-bold text-gray-900">${{ formatMoney(totalesGanadoresGrupo.recogido) }}</p>
            </div>
            <div class="rounded-xl bg-[#FCF6E3] border border-[#E7C877]/70 px-2 py-2 text-center">
              <p class="text-[10px] font-bold text-[#B7860E] uppercase">Entregado</p>
              <p class="text-sm font-bold text-gray-900">${{ formatMoney(totalesGanadoresGrupo.entregado) }}</p>
            </div>
            <div class="rounded-xl bg-natillera-50 border border-natillera-200/70 px-2 py-2 text-center">
              <p class="text-[10px] font-bold text-natillera-600 uppercase">Natillera</p>
              <p class="text-sm font-bold text-natillera-700">${{ formatMoney(totalesGanadoresGrupo.natillera) }}</p>
            </div>
          </div>
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-3 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button type="button" @click="grupoGanadoresSeleccionado = null" class="btn-modal-primary w-full">
            Cerrar
          </button>
        </div>
    </ModalWrapper>
    <!-- Modal de venta de rifa -->
    <ModalWrapper
      :show="!!modalVentaRifa"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalVentaRifa = false"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TicketIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Registrar Venta</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Número: {{ formVentaRifa.numero }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalVentaRifa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TicketIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Registrar Venta</h3>
              <p class="text-white/90 text-xs mt-1">Número: {{ formVentaRifa.numero }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalVentaRifa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollVentaRifa"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-4"
          @scroll.passive="onScrollVentaRifa"
        >
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
          <NatiscrollHint :show="hayMasVentaRifa" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalVentaRifa = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button type="button" @click="guardarVentaRifa" class="btn-modal-primary flex-1">Guardar Venta</button>
          </div>
        </div>
      </ModalWrapper>
    <!-- Modal de pago de rifa -->
    <ModalWrapper
      :show="!!modalPagarRifa"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalPagarRifa = false"
    >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Gestionar Pago</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Número: {{ formPagarRifa.numero }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalPagarRifa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Gestionar Pago</h3>
              <p class="text-white/90 text-xs mt-1">Número: {{ formPagarRifa.numero }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalPagarRifa = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollPagarRifa"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-4"
          @scroll.passive="onScrollPagarRifa"
        >
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
          <NatiscrollHint :show="hayMasPagarRifa" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalPagarRifa = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button type="button" @click="guardarPagoRifa" class="btn-modal-primary flex-1">Guardar</button>
          </div>
        </div>
    </ModalWrapper>
    <!-- Modal de confirmación para eliminar actividad -->
    <ModalWrapper
      :show="!!actividadAEliminar"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="actividadAEliminar = null"
    >
        <!-- Cabecera destructiva (rojo, excepción semántica). Compacta móvil-fila / desktop-columna; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-red-600 text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Eliminar Actividad</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="actividadAEliminar = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Eliminar Actividad</h3>
              <p class="text-white/90 text-xs mt-1">Esta acción no se puede deshacer</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="actividadAEliminar = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
          <!-- Cuerpo scrolleable (confirmación; natiscroll omitido: cuerpo corto y footer fijo asegura la CTA) -->
          <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6">
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
          <!-- Footer de acciones fijo -->
          <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div class="flex gap-3">
              <button type="button" @click="actividadAEliminar = null" :disabled="eliminando" class="btn-modal-secondary flex-1 disabled:opacity-50">Cancelar</button>
              <!-- Acción destructiva irreversible → rojo (excepción a btn-modal-primary) -->
              <button
                type="button"
                @click="eliminarActividadConfirmado"
                :disabled="eliminando"
                class="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-4 shadow-[0_4px_12px_-2px_rgba(220,38,38,0.32)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <TrashIcon v-if="!eliminando" class="w-5 h-5" />
                <span>{{ eliminando ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
              </button>
            </div>
          </div>
    </ModalWrapper>
  <!-- Modal de confirmación para eliminar grupo -->
  <ModalWrapper
    :show="!!grupoAEliminar"
    :z-index="50"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="grupoAEliminar = null"
  >
        <!-- Cabecera destructiva (rojo, excepción semántica). Compacta móvil-fila / desktop-columna; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-red-600 text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Eliminar Grupo Completo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="grupoAEliminar = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Eliminar Grupo Completo</h3>
              <p class="text-white/90 text-xs mt-1">Esta acción no se puede deshacer</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="grupoAEliminar = null">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable (confirmación; natiscroll omitido: cuerpo corto y footer fijo asegura la CTA) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6">
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
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="grupoAEliminar = null" :disabled="eliminandoGrupo" class="btn-modal-secondary flex-1 disabled:opacity-50">Cancelar</button>
            <!-- Acción destructiva irreversible → rojo (excepción a btn-modal-primary) -->
            <button
              type="button"
              @click="eliminarGrupoConfirmado"
              :disabled="eliminandoGrupo"
              class="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-4 shadow-[0_4px_12px_-2px_rgba(220,38,38,0.32)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <TrashIcon v-if="!eliminandoGrupo" class="w-5 h-5" />
              <span>{{ eliminandoGrupo ? 'Eliminando...' : 'Sí, Eliminar Grupo' }}</span>
            </button>
          </div>
        </div>
  </ModalWrapper>
  <!-- Modal para asignar faltante a socio -->
  <ModalWrapper
    :show="!!(modalAsignarFaltante && faltanteSeleccionado)"
    :z-index="50"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="modalAsignarFaltante = false"
  >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <UserPlusIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Asignar números a socio</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ faltanteSeleccionado.nombre }}</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalAsignarFaltante = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <UserPlusIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Asignar números a socio</h3>
              <p class="text-white/90 text-xs mt-1 line-clamp-2">{{ faltanteSeleccionado.nombre }}</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalAsignarFaltante = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable + natiscroll -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="refScrollAsignarFaltante"
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-6 space-y-4"
          @scroll.passive="onScrollAsignarFaltante"
        >
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
          <NatiscrollHint :show="hayMasAsignarFaltante" />
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalAsignarFaltante = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button
              type="button"
              @click="alHacerClicAsignarFaltante"
              :disabled="!socioSeleccionadoParaFaltante || asignandoFaltante"
              class="btn-modal-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ asignandoFaltante ? 'Asignando...' : 'Asignar números' }}
            </button>
          </div>
        </div>
  </ModalWrapper>
  <!-- Modal de confirmación: asignar faltante en todos los meses de la actividad -->
  <ModalWrapper
    :show="!!modalConfirmarAsignarFaltanteTodosMeses"
    :z-index="60"
    align="bottom"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="modalConfirmarAsignarFaltanteTodosMeses = false"
  >
        <!-- Cabecera marca compacta: móvil = fila; sm+ = icono arriba + textos centrados; X por flex -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <UserPlusIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Asignar desde este mes</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Confirmar asignación en adelante</p>
              </div>
            </div>
            <button type="button" class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 touch-manipulation" aria-label="Cerrar" @click="modalConfirmarAsignarFaltanteTodosMeses = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <UserPlusIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Asignar desde este mes en adelante</h3>
              <p class="text-white/90 text-xs mt-1">Confirmar asignación</p>
            </div>
            <button type="button" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15" aria-label="Cerrar" @click="modalConfirmarAsignarFaltanteTodosMeses = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
        <!-- Cuerpo scrolleable (confirmación corta; natiscroll omitido, footer fijo asegura la CTA) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch] p-6">
          <p class="text-gray-600 text-sm">
            Se asignará el faltante <strong>{{ faltanteSeleccionado?.nombre }}</strong> al socio seleccionado desde <strong>este mes en adelante</strong> ({{ actividadesDelGrupoDesdeActualEnAdelante.length }} rifa(s)). Los meses anteriores quedarán sin asignar. ¿Desea continuar?
          </p>
        </div>
        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div class="flex gap-3">
            <button type="button" @click="modalConfirmarAsignarFaltanteTodosMeses = false" class="btn-modal-secondary flex-1">Cancelar</button>
            <button type="button" @click="confirmarAsignarFaltanteTodosMeses" :disabled="asignandoFaltante" class="btn-modal-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">Aceptar</button>
          </div>
        </div>
  </ModalWrapper>
  <!-- Tarjeta para captura (compartir/descargar): en viewport pero detrás del modal (z-40) para que se pinte y no salga en blanco -->
  <div
    v-show="modalGanadorRifa && actividadSeleccionada"
    ref="tarjetaGanadorRef"
    class="fixed left-0 top-0 w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden z-40"
    style="top: 0; left: 0"
  >
    <div class="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 py-4 px-4 text-white">
      <h2 class="text-lg font-bold tracking-tight truncate text-center">{{ actividadSeleccionada?.descripcion }}</h2>
    </div>
    <div class="p-5 space-y-4">
      <!-- Ganador / Ganadora o Gana la natillera (arriba) -->
      <div v-if="actividadSeleccionada?.ganador_es_faltante" class="text-center py-3 px-4 rounded-xl bg-natillera-50 border-2 border-natillera-200">
        <span class="text-3xl">🏦</span>
        <p class="font-bold text-natillera-800 text-lg mt-1">¡Gana la natillera!</p>
        <p class="text-xs text-gray-600 max-w-xs mx-auto leading-snug mt-1.5">
          Este número no estaba asignado. El premio y la utilidad se suman al fondo.
        </p>
      </div>
      <div v-else-if="actividadSeleccionada?.ganador_nombre" class="w-full text-center py-3 px-4 rounded-xl bg-gradient-to-br from-natillera-50 via-emerald-50/80 to-teal-50 border-2 border-natillera-200">
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl sm:text-3xl border-2 border-amber-300 shadow-lg ring-2 ring-natillera-200 mx-auto">🏆</div>
        <p class="text-xs font-medium text-natillera-600 mt-2">Ganador/a</p>
        <p class="font-bold text-lg sm:text-xl text-natillera-800 mt-0.5">{{ actividadSeleccionada.ganador_nombre }}</p>
      </div>
      <!-- Número ganador (justo después del ganador) -->
      <div v-if="actividadSeleccionada?.numero_ganador != null && actividadSeleccionada?.numero_ganador !== ''" class="text-center">
        <p class="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Número ganador</p>
        <div class="inline-flex w-20 h-20 items-center justify-center rounded-full bg-amber-100 border-2 border-amber-300">
          <span class="text-3xl font-black text-amber-800">{{ String(actividadSeleccionada?.numero_ganador || '').padStart(2, '0') }}</span>
        </div>
      </div>
      <div v-if="actividadSeleccionada?.sorteo_loteria_medellin || actividadSeleccionada?.numero_completo_loteria_medellin" class="rounded-xl border-2 border-red-200 bg-white p-3">
        <p class="text-red-700 font-bold text-sm sm:text-base mb-2">Resultado Lotería de Medellín</p>
        <p class="text-red-600 font-bold text-base mb-0.5">Sorteo {{ actividadSeleccionada?.sorteo_loteria_medellin || '—' }}</p>
        <p class="text-red-600 text-xs mb-3">{{ formatDateSorteoDisplay(actividadSeleccionada?.fecha_juego_rifa) || '—' }}</p>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-red-600 text-xs font-semibold uppercase mb-1">Número</p>
            <div class="rounded-lg bg-red-600 text-white text-center py-2"><span class="text-lg font-bold">{{ actividadSeleccionada?.numero_completo_loteria_medellin || '—' }}</span></div>
          </div>
          <div>
            <p class="text-red-600 text-xs font-semibold uppercase mb-1">Serie</p>
            <div class="rounded-lg bg-red-600 text-white text-center py-2"><span class="text-lg font-bold">{{ actividadSeleccionada?.serie_loteria_medellin || '—' }}</span></div>
          </div>
        </div>
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
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useEliminarPagoActividad } from '../../composables/useEliminarPagoActividad'
import ModalWrapper from '../../components/ModalWrapper.vue'
import NatiscrollHint from '../../components/NatiscrollHint.vue'
import ActividadCard from '../../components/ActividadCard.vue'
import ActividadesSkeleton from '../../components/ActividadesSkeleton.vue'

import BackButton from '../../components/BackButton.vue'
import DateInput from '../../components/DateInput.vue'
import { formatDate, parseDateLocal } from '../../utils/formatDate.js'
import {
  buscarSorteoPorFecha,
  extraerPremioMayor,
  consultarHtmlSorteo,
  ultimasDosCifras,
  fechaEsPosteriorAlUltimoSorteoCatalogo,
  getUltimaFechaCatalogo,
  obtenerCatalogoLoteria,
} from '../../utils/loteriaMedellin.js'
import { getAvatarUrl } from '../../utils/avatars.js'
import { normalizeText } from '../../utils/normalizeText.js'
import { toPng } from 'html-to-image'

const MESES_SORTEO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
function formatDateSorteoDisplay(date) {
  if (!date) return ''
  const d = parseDateLocal(date)
  if (!d || isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = MESES_SORTEO[d.getMonth()]
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
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
// xlsx-js-style (~600 KB) se carga de forma diferida solo al exportar: evita inflar
// el chunk de la vista y rompe el ciclo de chunks xlsx<->vendor (error TDZ en runtime).
let XLSX = null
async function ensureXLSX() {
  if (!XLSX) {
    const mod = await import('xlsx-js-style')
    XLSX = mod.default || mod
  }
}
const notificationStore = useNotificationStore()
const props = defineProps({
  id: String
})
const route = useRoute()
const id = props.id || route.params.id
const actividades = ref([])
const loading = ref(false)
const cargaInicial = ref(true) // true hasta que fetchActividades resuelva la primera carga (muestra skeleton)
const modalNuevaActividad = ref(false)
const dropdownTipoActividad = ref(false)
const dropdownTipoActividadRef = ref(null)
const dropdownTipoActividadStyle = ref({})
const modalDetalleActividad = ref(false)
const actividadSeleccionada = ref(null)
const sociosActividad = ref([])
// Eliminar el pago de un socio en la actividad (confirmación en línea dentro del modal de detalle)
const { previsualizarEliminacionPagoActividad, eliminarPagoActividad } = useEliminarPagoActividad()
const pagoAEliminar = ref(null)      // id de socios_actividad en confirmación
const previewPago = ref(null)        // impacto calculado del borrado
const cargandoPreviewPago = ref(false)
const eliminandoPagoActividad = ref(false)
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
const actividadParaFormaPago = ref(null) // Rifa liquidada para editar forma de pago entrega premio
const actividadParaDesglosePagos = ref(null) // Rifa liquidada para modal grilla valores pagados
const formFormaPagoLiquidacion = reactive({ forma_pago: 'efectivo' })
const guardandoFormaPago = ref(false)
// Registrar gastos (actividades finalizadas que no son rifa)
const modalRegistrarGastos = ref(false)
const actividadParaGastos = ref(null)
const formGastos = reactive({ gastos: 0 })
const guardandoGastos = ref(false)
const modalAsignarFaltante = ref(false)
const modalConfirmarAsignarFaltanteTodosMeses = ref(false)
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
const loadingNumeroGanador = ref(false) // Cargando resultado Lotería de Medellín por fecha de juego
/** Resultado completo del sorteo Lotería de Medellín (sorteo, numero, serie, fecha) para guardar al liquidar */
const resultadoSorteoMedellinRef = ref(null)
const isDev = import.meta.env.DEV
const revertiendoLiquidacion = ref(false)
const tarjetaGanadorRef = ref(null)
const compartiendoODescargando = ref(false)
const isMobile = ref(false)
function actualizarIsMobile() {
  isMobile.value = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window)
}
const formLiquidar = reactive({
  premioEntregado: 0,
  numeroGanador: '', // Número ganador de la rifa (00-99) para mostrar en modal ganador
  forma_pago: 'efectivo' // Forma de pago con la que se entrega el premio (efectivo | transferencia)
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
useBodyScrollLock(computed(() => !!actividadParaFormaPago.value))
useBodyScrollLock(computed(() => !!actividadParaDesglosePagos.value))
useBodyScrollLock(modalRegistrarGastos)
useBodyScrollLock(modalAsignarFaltante)
useBodyScrollLock(modalConfirmarAsignarFaltanteTodosMeses)
useBodyScrollLock(computed(() => !!actividadAEliminar.value))
useBodyScrollLock(computed(() => !!grupoAEliminar.value))

// Natiscroll por modal: velo + «Desliza para ver más» mientras el cuerpo tenga overflow
// y no se haya llegado al final (skill natillerapp-modals). Cada modal con cuerpo
// scrolleable expone { scrollRef, hayMas, onScroll }.
const { scrollRef: refScrollNuevaActividad, hayMas: hayMasNuevaActividad, onScroll: onScrollNuevaActividad } = useNatiscroll(modalNuevaActividad)
const { scrollRef: refScrollDetalle, hayMas: hayMasDetalle, onScroll: onScrollDetalle } = useNatiscroll(modalDetalleActividad)
const { scrollRef: refScrollLiquidar, hayMas: hayMasLiquidar, onScroll: onScrollLiquidar } = useNatiscroll(modalLiquidarActividad)
const { scrollRef: refScrollGanadorRifa, hayMas: hayMasGanadorRifa, onScroll: onScrollGanadorRifa } = useNatiscroll(modalGanadorRifa)
const { scrollRef: refScrollDesglose, hayMas: hayMasDesglose, onScroll: onScrollDesglose } = useNatiscroll(computed(() => !!actividadParaDesglosePagos.value))
const { scrollRef: refScrollGanadoresGrupo, hayMas: hayMasGanadoresGrupo, onScroll: onScrollGanadoresGrupo } = useNatiscroll(computed(() => !!grupoGanadoresSeleccionado.value))
const { scrollRef: refScrollVentaRifa, hayMas: hayMasVentaRifa, onScroll: onScrollVentaRifa } = useNatiscroll(modalVentaRifa)
const { scrollRef: refScrollPagarRifa, hayMas: hayMasPagarRifa, onScroll: onScrollPagarRifa } = useNatiscroll(modalPagarRifa)
const { scrollRef: refScrollAsignarFaltante, hayMas: hayMasAsignarFaltante, onScroll: onScrollAsignarFaltante } = useNatiscroll(modalAsignarFaltante)
const { scrollRef: refScrollBienvenida, hayMas: hayMasBienvenida, onScroll: onScrollBienvenida } = useNatiscroll(mostrarModalBienvenida)
const { scrollRef: refScrollConfirmarNegativa, hayMas: hayMasConfirmarNegativa, onScroll: onScrollConfirmarNegativa } = useNatiscroll(modalConfirmarLiquidacionNegativa)

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
// Totales del detalle (asignado/recaudado) — pareja correcta según tipo de rifa, para
// los indicadores destacados y la barra de progreso del modal de detalle.
const detalleAsignado = computed(() => {
  const a = actividadSeleccionada.value
  if (!a) return 0
  return a.tipo === 'rifa' && a.tipo_rifa === 'manual' ? totalProyectoRifa.value : (a.total_asignado || 0)
})
const detalleRecaudado = computed(() => {
  const a = actividadSeleccionada.value
  if (!a) return 0
  return a.tipo === 'rifa' && a.tipo_rifa === 'manual' ? totalRecaudadoRifa.value : (a.total_pagado || 0)
})
const detallePctRecaudado = computed(() => {
  const asig = detalleAsignado.value
  if (!asig || asig <= 0) return 0
  return Math.min(100, Math.round((detalleRecaudado.value / asig) * 100))
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
// Valor efectivamente pagado que ve el usuario en la tarjeta del socio. En rifa aleatoria sale
// de los números (puede superar a socios_actividad.valor_pagado), en el resto de la fila.
function getValorPagadoSocio(socioAct) {
  if (actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'aleatoria') {
    return getValoresSocioRifaAutomatica(socioAct).valorPagado
  }
  return Number(socioAct?.valor_pagado) || 0
}

// Abre la confirmación en línea y calcula el impacto real (utilidades, cuota que lo cobró,
// números de rifa) para que el usuario vea qué se va a revertir antes de confirmar.
async function pedirConfirmacionEliminarPago(socioAct) {
  pagoAEliminar.value = socioAct.id
  previewPago.value = null
  cargandoPreviewPago.value = true
  try {
    const res = await previsualizarEliminacionPagoActividad(socioAct.id)
    if (res.success) {
      previewPago.value = res.resumen
    } else {
      notificationStore.error(res.error || 'No se pudo calcular el impacto de la eliminación', 'Error')
      pagoAEliminar.value = null
    }
  } finally {
    cargandoPreviewPago.value = false
  }
}

function cancelarEliminarPago() {
  pagoAEliminar.value = null
  previewPago.value = null
}

async function confirmarEliminarPagoActividad(socioAct) {
  if (eliminandoPagoActividad.value) return
  eliminandoPagoActividad.value = true
  try {
    const res = await eliminarPagoActividad(socioAct.id, {
      socioNombre: socioAct.socio_natillera?.socio?.nombre || null,
      natilleraNombre: null,
    })
    if (!res.success) {
      notificationStore.error(res.error || 'No se pudo eliminar el pago', 'Error')
      return
    }

    cancelarEliminarPago()
    // Recargar: el detalle (valores del socio) y la lista (totales de la actividad).
    if (actividadSeleccionada.value) await verDetalleActividad(actividadSeleccionada.value)
    await fetchActividades()

    const problemas = res.problemas || []
    if (problemas.length > 0) {
      notificationStore.warning(
        'El pago se eliminó, pero hay cosas por revisar:\n• ' + problemas.join('\n• '),
        'Revisar'
      )
    } else {
      notificationStore.success(
        `Se eliminó el pago de $${formatMoney(res.valorRevertido || 0)}`,
        'Pago eliminado'
      )
    }
  } catch (e) {
    console.error('Error eliminando el pago de la actividad:', e)
    notificationStore.error(e.message || 'No se pudo eliminar el pago', 'Error')
  } finally {
    eliminandoPagoActividad.value = false
  }
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
// Coincidencia de un socio con la búsqueda: por nombre (siempre) o por número (rifa aleatoria)
function socioCoincideBusqueda(socioAct) {
  const q = normalizeText(busquedaNumero.value)
  if (!q) return true
  const nombre = normalizeText(socioAct.socio_natillera?.socio?.nombre)
  if (nombre.includes(q)) return true
  if (actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'aleatoria') {
    return socioTieneNumero(socioAct)
  }
  return false
}
// Computed para filtrar socios según búsqueda (por número o por nombre)
const sociosFiltrados = computed(() => {
  if (!(busquedaNumero.value || '').trim()) return sociosActividad.value
  return sociosActividad.value.filter(socio => socioCoincideBusqueda(socio))
})
// Computed para filtrar faltantes según búsqueda
const faltantesFiltrados = computed(() => {
  if (!busquedaNumero.value || !(actividadSeleccionada.value?.tipo === 'rifa' && actividadSeleccionada.value?.tipo_rifa === 'aleatoria')) {
    return faltantes.value
  }
  return faltantes.value.filter(faltante => faltanteTieneNumero(faltante))
})
// Actividades del mismo grupo que la actividad seleccionada (todas las rifas del grupo)
const actividadesDeLaSerieActual = computed(() => {
  const a = actividadSeleccionada.value
  if (!a?.id) return []
  const idActual = String(a.id)
  const agrupadas = actividadesAgrupadas.value
  for (const item of agrupadas) {
    if (item.tipo === 'grupo' && Array.isArray(item.actividades) && item.actividades.length > 0) {
      const estaEnEsteGrupo = item.actividades.some(act => act && String(act.id) === idActual)
      if (estaEnEsteGrupo) return [...item.actividades]
    }
    if (item.tipo === 'individual' && item.actividad && String(item.actividad.id) === idActual) return [a]
  }
  return [a]
})
// Actividades del grupo desde la actual en adelante (por fecha: anio_pago, mes_pago). Hacia atrás no se asignan.
const actividadesDelGrupoDesdeActualEnAdelante = computed(() => {
  const lista = actividadesDeLaSerieActual.value
  if (lista.length <= 1) return lista
  const a = actividadSeleccionada.value
  if (!a?.id) return [a].filter(Boolean)
  const ordenadas = [...lista].sort((x, y) => {
    const anioX = Number(x.anio_pago) || 0
    const anioY = Number(y.anio_pago) || 0
    if (anioX !== anioY) return anioX - anioY
    return (Number(x.mes_pago) || 0) - (Number(y.mes_pago) || 0)
  })
  const idx = ordenadas.findIndex(act => String(act.id) === String(a.id))
  if (idx < 0) return [a]
  return ordenadas.slice(idx)
})
// Computed para obtener socios sin números asignados (en esta actividad)
// Incluye tanto socios sin registro en la actividad como socios con registro pero 0 números
const sociosSinNumeros = computed(() => {
  if (!actividadSeleccionada.value || actividadSeleccionada.value.tipo !== 'rifa' || actividadSeleccionada.value.tipo_rifa !== 'aleatoria') {
    return []
  }
  
  // Obtener IDs de socios que ya tienen números asignados en esta actividad
  const sociosConNumeros = new Set(
    Object.keys(numerosAsignadosPorSocio.value).map(id => String(id))
  )
  
  // Obtener todos los socios de la natillera (socios_natillera activos)
  const todosLosSocios = socios.value || []
  
  // Elegibles: socios de la natillera que NO tienen números asignados en esta actividad.
  // No excluimos por tener registro en socios_actividad: un socio puede tener registro y 0 números.
  const sociosElegibles = todosLosSocios.filter(socio => {
    const socioId = String(socio.id)
    if (sociosConNumeros.has(socioId)) return false
    const numerosDelSocio = getNumerosAsignadosSocio(socio.id)
    if (numerosDelSocio.length > 0) return false
    return true
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
// Nota: se retiró la abreviatura K/M. Las cifras se muestran siempre en miles con
// separador es-CO (igual que formatMoney). Se mantiene el nombre por compatibilidad
// con el markup existente (spans móvil/desktop).
function formatMoneyCompact(value) {
  return new Intl.NumberFormat('es-CO').format(Number(value) || 0)
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
    await ensureXLSX()
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
async function abrirModalLiquidar() {
  // Solo permitir liquidar actividades de tipo rifa
  if (!actividadSeleccionada.value || actividadSeleccionada.value.tipo !== 'rifa') {
    notificationStore.error('Solo se pueden liquidar actividades de tipo rifa', 'Error')
    return
  }
  formLiquidar.premioEntregado = 0
  formLiquidar.numeroGanador = ''
  formLiquidar.forma_pago = 'efectivo'
  resultadoSorteoMedellinRef.value = null
  modalLiquidarActividad.value = true

  // Obtener número ganador desde Lotería de Medellín por fecha de juego (2 últimas cifras)
  const fechaJuego = actividadSeleccionada.value.fecha_juego_rifa
  if (!fechaJuego) return

  let dateStr = ''
  if (typeof fechaJuego === 'string') dateStr = fechaJuego.slice(0, 10)
  else if (fechaJuego instanceof Date) dateStr = fechaJuego.toISOString().slice(0, 10)
  else if (fechaJuego && typeof fechaJuego === 'object' && fechaJuego.toISOString) dateStr = fechaJuego.toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return

  console.log('[Lotería Medellín] Liquidar actividad — fecha de juego', {
    actividadId: actividadSeleccionada.value?.id,
    fecha_juego_rifa_raw: actividadSeleccionada.value?.fecha_juego_rifa,
    dateStr,
  })

  loadingNumeroGanador.value = true
  const TIMEOUT_MS = 15000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const catalogo = await obtenerCatalogoLoteria(controller.signal)
    const sorteoEntry = buscarSorteoPorFecha(dateStr, catalogo)
    if (!sorteoEntry) {
      const ultimaEnCatalogo = getUltimaFechaCatalogo(catalogo)
      const posteriorAlCatalogo = fechaEsPosteriorAlUltimoSorteoCatalogo(dateStr, catalogo)
      console.log('[Lotería Medellín] Sin entrada en catálogo para dateStr', {
        dateStr,
        ultimaFechaEnCatalogo: ultimaEnCatalogo,
        fechaPosteriorAlUltimoSorteoCatalogo: posteriorAlCatalogo,
      })
      if (posteriorAlCatalogo) {
        notificationStore.error(
          'No hay sorteo de Lotería de Medellín para esta fecha en el listado oficial (aún no publicado o posterior al último sorteo). Ingresa el número ganador manualmente si ya existe en la página.',
          'Sin sorteo para esta fecha'
        )
      } else {
        notificationStore.error(
          'No hay sorteo en el catálogo para esta fecha. Ingresa el número ganador manualmente.',
          'Catálogo no disponible'
        )
      }
      return
    }

    console.log('[Lotería Medellín] Catálogo resolvió sorteo', {
      dateStrPedida: dateStr,
      drawId: sorteoEntry.drawId,
      fechaResuelta: sorteoEntry.fechaResuelta,
      exacta: sorteoEntry.exacta,
      sorteoNum: sorteoEntry.sorteoNum,
    })

    const html = await consultarHtmlSorteo(sorteoEntry.drawId, controller.signal)
    const premio = extraerPremioMayor(html)
    if (!premio) {
      notificationStore.error(
        'No se pudo leer el premio mayor del resultado oficial. Ingresa el número ganador manualmente.',
        'Resultado no disponible'
      )
      return
    }

    resultadoSorteoMedellinRef.value = {
      sorteo: sorteoEntry.sorteoNum != null ? String(sorteoEntry.sorteoNum).trim() : null,
      numero: premio.numero,
      serie: premio.serie,
      fecha: sorteoEntry.fechaResuelta || dateStr,
    }
    formLiquidar.numeroGanador = ultimasDosCifras(premio.numero)

    if (!sorteoEntry.exacta) {
      notificationStore.warning(
        'No hay sorteo exacto para esa fecha; se usó el sorteo más cercano del calendario. Revisa el número si hace falta.',
        'Fecha aproximada'
      )
    }
  } catch (e) {
    if (e?.name === 'AbortError')
      notificationStore.error(
        'La consulta tardó demasiado. Ingresa el número ganador manualmente.',
        'Tiempo agotado'
      )
    else
      notificationStore.error(
        'No se pudo obtener el resultado de la Lotería de Medellín. Ingresa el número ganador manualmente.',
        'Resultado no disponible'
      )
  } finally {
    clearTimeout(timeoutId)
    loadingNumeroGanador.value = false
  }
}
function abrirModalGanadorRifa(actividad) {
  actividadSeleccionada.value = actividad
  modalGanadorRifa.value = true
}
function abrirModalFormaPagoLiquidacion(actividad) {
  actividadParaFormaPago.value = actividad
  formFormaPagoLiquidacion.forma_pago = (actividad.forma_pago_liquidacion || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo'
}
function abrirModalDesglosePagosRifa(actividad) {
  actividadParaDesglosePagos.value = actividad
}
// Ver miembros que pagaron (actividades finalizadas que no son rifa): carga los socios
// con valor_pagado > 0 y reutiliza el modal compacto de valores pagados.
async function abrirModalMiembrosPagaron(actividad) {
  if (!actividad?.id) return
  const { data, error } = await supabase
    .from('socios_actividad')
    .select('valor_pagado, socio_natillera:socios_natillera(socio:socios(nombre))')
    .eq('actividad_id', actividad.id)
    .gt('valor_pagado', 0)
  const pagos = (!error && data ? data : [])
    .map((sa) => ({
      nombre: sa.socio_natillera?.socio?.nombre || 'Socio',
      valor_pagado: Number(sa.valor_pagado) || 0
    }))
    .filter((p) => p.valor_pagado > 0)
    .sort((a, b) => b.valor_pagado - a.valor_pagado)
  actividadParaDesglosePagos.value = { ...actividad, valores_pagados_rifa: pagos }
}
// Registrar gastos de una actividad finalizada (no rifa): edita el total de gastos y
// recalcula la utilidad (ingresos - gastos).
function abrirModalRegistrarGastos(actividad) {
  actividadParaGastos.value = actividad
  formGastos.gastos = Number(actividad.gastos) || 0
  modalRegistrarGastos.value = true
}
const utilidadGastosPreview = computed(() => {
  const ing = Number(actividadParaGastos.value?.ingresos) || 0
  return ing - (Number(formGastos.gastos) || 0)
})
async function guardarGastos() {
  const act = actividadParaGastos.value
  if (!act?.id) return
  guardandoGastos.value = true
  try {
    const gastos = Math.max(0, Number(formGastos.gastos) || 0)
    const ingresos = Number(act.ingresos) || 0
    const { error } = await supabase
      .from('actividades')
      .update({ gastos, utilidad: ingresos - gastos })
      .eq('id', act.id)
    if (error) throw error
    notificationStore.success('Gastos actualizados correctamente', 'Listo')
    modalRegistrarGastos.value = false
    actividadParaGastos.value = null
    await fetchActividades()
  } catch (e) {
    console.error('Error al guardar gastos:', e)
    notificationStore.error('No se pudieron guardar los gastos', 'Error')
  } finally {
    guardandoGastos.value = false
  }
}
async function guardarFormaPagoLiquidacion() {
  const act = actividadParaFormaPago.value
  if (!act?.id) return
  const nuevaForma = (formFormaPagoLiquidacion.forma_pago || 'efectivo').toLowerCase().trim() === 'transferencia' ? 'transferencia' : 'efectivo'
  guardandoFormaPago.value = true
  try {
    const { error: errAct } = await supabase
      .from('actividades')
      .update({ forma_pago_liquidacion: nuevaForma })
      .eq('id', act.id)
    if (errAct) throw errAct
    const descPremio = `Premio rifa liquidada: ${act.descripcion || 'Rifa'}`
    const montoPremio = parseFloat(act.gastos) || 0
    const { data: movs } = await supabase
      .from('movimientos_fondo')
      .select('id')
      .eq('natillera_id', act.natillera_id)
      .eq('tipo', 'salida')
      .eq('descripcion', descPremio)
      .eq('monto', montoPremio)
      .limit(1)
    if (movs?.length) {
      await supabase.from('movimientos_fondo').update({ forma_pago: nuevaForma }).eq('id', movs[0].id)
    }
    await fetchActividades()
    actividadParaFormaPago.value = null
    notificationStore.success('Forma de pago actualizada', 'Listo')
  } catch (e) {
    console.error('Error actualizando forma de pago:', e)
    notificationStore.error(e?.message || 'No se pudo actualizar', 'Error')
  } finally {
    guardandoFormaPago.value = false
  }
}
/** Solo dev: revierte una rifa liquidada a "en curso" (elimina utilidades_clasificadas, movimiento premio, actualiza actividad) */
async function revertirLiquidacionRifa() {
  const act = actividadSeleccionada.value
  if (!act || act.tipo !== 'rifa' || act.estado !== 'liquidada') {
    notificationStore.error('Solo se puede revertir una rifa en estado liquidada', 'Error')
    return
  }
  revertiendoLiquidacion.value = true
  try {
    const natilleraId = act.natillera_id
    const actividadId = act.id
    const descripcionPremio = `Premio rifa liquidada: ${act.descripcion || 'Rifa'}`
    const montoPremio = parseFloat(act.gastos) || 0

    // 1. Eliminar registros de utilidades_clasificadas de esta rifa
    const { error: errUtil } = await supabase
      .from('utilidades_clasificadas')
      .delete()
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'rifas')
      .eq('id_actividad', actividadId)
    if (errUtil) throw errUtil

    // 2. Eliminar movimiento(s) de premio rifa en movimientos_fondo (descripción + monto para acotar)
    const { data: movs } = await supabase
      .from('movimientos_fondo')
      .select('id')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'salida')
      .eq('descripcion', descripcionPremio)
      .eq('monto', montoPremio)
    if (movs && movs.length > 0) {
      const idsToDelete = movs.map((m) => m.id)
      for (const id of idsToDelete) {
        const { error: errMov } = await supabase.from('movimientos_fondo').delete().eq('id', id)
        if (errMov) throw errMov
      }
    }

    // 3. Volver la actividad a "en curso" y limpiar datos de liquidación
    const { error: errAct } = await supabase
      .from('actividades')
      .update({
        estado: 'en_curso',
        ingresos: 0,
        gastos: 0,
        utilidad: 0,
        numero_ganador: null,
        ganador_nombre: null,
        ganador_socio_natillera_id: null,
        ganador_es_faltante: null,
        forma_pago_liquidacion: null,
        sorteo_loteria_medellin: null,
        numero_completo_loteria_medellin: null,
        serie_loteria_medellin: null
      })
      .eq('id', actividadId)
    if (errAct) throw errAct

    notificationStore.success('Rifa revertida a "en curso". Solo para pruebas en dev.', 'Revertido')
    modalGanadorRifa.value = false
    await fetchActividades()
  } catch (e) {
    console.error('Error revirtiendo liquidación:', e)
    notificationStore.error(e?.message || 'Error al revertir la liquidación', 'Error')
  } finally {
    revertiendoLiquidacion.value = false
  }
}
async function generarImagenTarjetaGanador() {
  if (!tarjetaGanadorRef.value) return null
  await nextTick()
  await new Promise((r) => requestAnimationFrame(r))
  await new Promise((r) => setTimeout(r, 50))
  return await toPng(tarjetaGanadorRef.value, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    quality: 1,
    cacheBust: true
  })
}
async function descargarTarjetaGanador() {
  const act = actividadSeleccionada.value
  if (!act || !tarjetaGanadorRef.value) return
  compartiendoODescargando.value = true
  try {
    const dataUrl = await generarImagenTarjetaGanador()
    if (!dataUrl) throw new Error('No se pudo generar la imagen')
    const nombre = `ganador-rifa-${(act.descripcion || 'rifa').replace(/\s+/g, '-').slice(0, 40)}.png`
    const link = document.createElement('a')
    link.download = nombre
    link.href = dataUrl
    link.click()
    notificationStore.success('Imagen descargada', 'Listo')
  } catch (e) {
    console.error('Error descargando tarjeta ganador:', e)
    notificationStore.error(e?.message || 'No se pudo descargar la imagen', 'Error')
  } finally {
    compartiendoODescargando.value = false
  }
}
async function compartirGanadorWhatsApp() {
  const act = actividadSeleccionada.value
  if (!act || !tarjetaGanadorRef.value) return
  compartiendoODescargando.value = true
  try {
    const dataUrl = await generarImagenTarjetaGanador()
    if (!dataUrl) throw new Error('No se pudo generar la imagen')
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const nombre = `ganador-rifa-${(act.descripcion || 'rifa').replace(/\s+/g, '-').slice(0, 30)}.png`
    const archivo = new File([blob], nombre, { type: 'image/png' })
    const mensaje = `${act.descripcion || 'Rifa'}\n${act.ganador_es_faltante ? 'Ganamos todos! 💃🕺' : act.ganador_nombre ? `Felicitaciones!! 🎉\nGanador/a: ${act.ganador_nombre}` : 'Nº ganador: ' + (act.numero_ganador || '—')}`
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: `Ganador - ${act.descripcion || 'Rifa'}`,
        text: mensaje
      })
      notificationStore.success('Compartido correctamente', 'Listo')
    } else {
      const link = document.createElement('a')
      link.download = nombre
      link.href = dataUrl
      link.click()
      const textoWa = encodeURIComponent(mensaje)
      window.open(`https://wa.me/?text=${textoWa}`, '_blank')
      notificationStore.success('Imagen descargada. Ábrela y compártela en WhatsApp.', 'Compartir')
    }
  } catch (e) {
    console.error('Error compartiendo ganador:', e)
    notificationStore.error(e?.message || 'No se pudo compartir', 'Error')
  } finally {
    compartiendoODescargando.value = false
  }
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
    // 1. Actualizar la actividad a estado "liquidada", ingresos/gastos/utilidad, ganador, forma de pago y datos del sorteo Lotería de Medellín
    const formaPagoLiquidacion = (formLiquidar.forma_pago || 'efectivo').toLowerCase() === 'transferencia' ? 'transferencia' : 'efectivo'
    const sorteoInfo = resultadoSorteoMedellinRef.value
    const updatePayload = {
      estado: 'liquidada',
      ingresos: totalRecaudado,
      gastos: gastosFinal,
      utilidad: utilidadFinal,
      numero_ganador: numeroGanador,
      ganador_nombre: ganadorNombre,
      ganador_socio_natillera_id: ganadorSocioNatilleraId,
      ganador_es_faltante: ganadorEsFaltante,
      forma_pago_liquidacion: formaPagoLiquidacion
    }
    if (sorteoInfo) {
      if (sorteoInfo.sorteo != null) updatePayload.sorteo_loteria_medellin = sorteoInfo.sorteo
      if (sorteoInfo.numero != null) updatePayload.numero_completo_loteria_medellin = sorteoInfo.numero
      if (sorteoInfo.serie != null) updatePayload.serie_loteria_medellin = sorteoInfo.serie
    }
    const { error: errorActividad } = await supabase
      .from('actividades')
      .update(updatePayload)
      .eq('id', actividadSeleccionada.value.id)
    if (errorActividad) throw errorActividad
    // 2. Utilidad de la rifa repartida por forma de pago (según cómo se recaudó)
    // Obtener recaudo por forma_pago desde socios_actividad de esta actividad
    const { data: sociosActividadRifa } = await supabase
      .from('socios_actividad')
      .select('valor_pagado, forma_pago')
      .eq('actividad_id', actividadSeleccionada.value.id)
      .gt('valor_pagado', 0)
    let recaudoEfectivo = 0
    let recaudoTransferencia = 0
    let recaudoOtro = 0
    ;(sociosActividadRifa || []).forEach((sa) => {
      const v = parseFloat(sa.valor_pagado) || 0
      const fp = (sa.forma_pago || '').toLowerCase().trim()
      if (fp === 'transferencia') recaudoTransferencia += v
      else if (fp === 'efectivo') recaudoEfectivo += v
      else recaudoOtro += v
    })
    const totalRecaudoFormaPago = recaudoEfectivo + recaudoTransferencia + recaudoOtro
    // Eliminar registros previos de utilidad de esta rifa (pueden ser uno o varios por forma_pago)
    const { error: errorDelete } = await supabase
      .from('utilidades_clasificadas')
      .delete()
      .eq('natillera_id', actividadSeleccionada.value.natillera_id)
      .eq('tipo', 'rifas')
      .eq('id_actividad', actividadSeleccionada.value.id)
    if (errorDelete) throw errorDelete
    const detallesComunes = {
      actividad_id: actividadSeleccionada.value.id,
      total_recaudado: totalRecaudado,
      premio_entregado: gastosFinal,
      ganador_es_faltante: ganadorEsFaltante,
      fecha_liquidacion: new Date().toISOString()
    }
    // Repartir utilidad por forma de pago (proporcional al recaudo) o un solo registro si no hay desglose
    if (totalRecaudoFormaPago > 0 && utilidadFinal > 0) {
      let uE = totalRecaudoFormaPago ? (utilidadFinal * recaudoEfectivo) / totalRecaudoFormaPago : 0
      let uT = totalRecaudoFormaPago ? (utilidadFinal * recaudoTransferencia) / totalRecaudoFormaPago : 0
      let uO = utilidadFinal - uE - uT
      uE = Math.round(uE * 100) / 100
      uT = Math.round(uT * 100) / 100
      uO = Math.round(utilidadFinal * 100) / 100 - uE - uT // Ajuste para que sumen exactamente utilidadFinal
      const filas = []
      if (uE > 0) filas.push({ forma_pago: 'efectivo', monto: uE })
      if (uT > 0) filas.push({ forma_pago: 'transferencia', monto: uT })
      if (uO > 0) filas.push({ forma_pago: null, monto: uO })
      if (filas.length === 0) filas.push({ forma_pago: null, monto: utilidadFinal })
      for (const f of filas) {
        const payload = {
          natillera_id: actividadSeleccionada.value.natillera_id,
          tipo: 'rifas',
          id_actividad: actividadSeleccionada.value.id,
          monto: f.monto,
          fecha_cierre: null,
          descripcion: `Utilidad de rifa: ${actividadSeleccionada.value.descripcion}`,
          detalles: detallesComunes
        }
        if (f.forma_pago != null) payload.forma_pago = f.forma_pago
        const { error: errIns } = await supabase.from('utilidades_clasificadas').insert(payload)
        if (errIns) throw errIns
      }
    } else if (utilidadFinal !== 0) {
      // Sin desglose por forma de pago (ej. rifa manual sin socios_actividad o utilidad negativa)
      const { error: errIns } = await supabase
        .from('utilidades_clasificadas')
        .insert({
          natillera_id: actividadSeleccionada.value.natillera_id,
          tipo: 'rifas',
          id_actividad: actividadSeleccionada.value.id,
          monto: utilidadFinal,
          fecha_cierre: null,
          descripcion: `Utilidad de rifa: ${actividadSeleccionada.value.descripcion}`,
          detalles: detallesComunes
        })
      if (errIns) throw errIns
    }
    // 3. Registrar salida del fondo por el premio entregado (forma de pago seleccionada en el modal)
    if (gastosFinal > 0) {
      const { error: errorMov } = await supabase
        .from('movimientos_fondo')
        .insert({
          natillera_id: actividadSeleccionada.value.natillera_id,
          tipo: 'salida',
          monto: gastosFinal,
          forma_pago: formaPagoLiquidacion,
          descripcion: `Premio rifa liquidada: ${actividadSeleccionada.value.descripcion || 'Rifa'}`,
          fecha: new Date().toISOString().slice(0, 10)
        })
      if (errorMov) throw errorMov
    }
    // 4. Cerrar modales de liquidación y recargar actividades
    modalLiquidarActividad.value = false
    modalConfirmarLiquidacionNegativa.value = false
    busquedaNumero.value = '' // Limpiar búsqueda al cerrar
    notificationStore.success('Actividad liquidada exitosamente', 'Éxito')
    
    // Recargar actividades para obtener la actividad con datos del ganador
    await fetchActividades()
    
    // Buscar la actividad actualizada con numero_ganador, ganador_nombre, datos del sorteo, etc.
    const actividadActualizada = actividades.value.find(a => a.id === actividadSeleccionada.value.id)
    if (actividadActualizada) {
      actividadSeleccionada.value = actividadActualizada
    } else {
      // Fallback: actualizar con los datos que ya calculamos (incl. info sorteo si la tenemos)
      const sorteoRef = resultadoSorteoMedellinRef.value
      actividadSeleccionada.value = {
        ...actividadSeleccionada.value,
        numero_ganador: numeroGanador,
        ganador_nombre: ganadorNombre,
        ganador_es_faltante: ganadorEsFaltante,
        ganador_socio_natillera_id: ganadorSocioNatilleraId,
        estado: 'liquidada',
        ...(sorteoRef && {
          sorteo_loteria_medellin: sorteoRef.sorteo,
          numero_completo_loteria_medellin: sorteoRef.numero,
          serie_loteria_medellin: sorteoRef.serie
        })
      }
    }
    resultadoSorteoMedellinRef.value = null
    // Cerrar modal de detalle y mostrar modal del ganador (inmediatamente después de liquidar)
    modalDetalleActividad.value = false
    modalGanadorRifa.value = true
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
      .select(`
        *,
        ganador_socio_natillera:socios_natillera!ganador_socio_natillera_id(
          socio:socios(nombre, avatar_seed, avatar_style)
        )
      `)
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
    
    // Para actividades en curso, cargar socios_actividad (totales). Para rifas liquidadas, cargar lista de valores pagados por socio.
    const actividadesConTotales = await Promise.all(
      (data || []).map(async (actividad) => {
        if (actividad.estado === 'en_curso') {
          // Obtener totales de socios_actividad
          const { data: sociosActividad, error: errorSocios } = await supabase
            .from('socios_actividad')
            .select('id, valor_asignado, valor_pagado, estado')
            .eq('actividad_id', actividad.id)
          if (!errorSocios && sociosActividad) {
            const totalAsignado = sociosActividad.reduce((sum, sa) => sum + (Number(sa.valor_asignado) || 0), 0)
            const totalPagado = sociosActividad.reduce((sum, sa) => sum + (Number(sa.valor_pagado) || 0), 0)
            // Auto-finalizar: las actividades NO liquidables (todo lo que no sea rifa) se marcan
            // como finalizadas apenas lo recaudado alcanza el valor asignado. Las rifas se
            // liquidan manualmente (premio/ganador), por eso quedan excluidas.
            if (actividad.tipo !== 'rifa' && totalAsignado > 0 && totalPagado >= totalAsignado) {
              const { error: errFinalizar } = await supabase
                .from('actividades')
                .update({
                  estado: 'liquidada',
                  ingresos: totalPagado,
                  gastos: 0,
                  utilidad: totalPagado
                })
                .eq('id', actividad.id)
              if (!errFinalizar) {
                return {
                  ...actividad,
                  estado: 'liquidada',
                  total_asignado: totalAsignado,
                  total_pagado: totalPagado,
                  ingresos: totalPagado,
                  gastos: 0,
                  utilidad: totalPagado
                }
              }
            }
            return {
              ...actividad,
              total_asignado: totalAsignado,
              total_pagado: totalPagado
            }
          }
        }
        if (actividad.estado === 'liquidada' && actividad.tipo === 'rifa') {
          // Lista rápida de valores pagados en esta rifa (para mostrar en la tarjeta)
          const { data: pagosRifa, error: errPagos } = await supabase
            .from('socios_actividad')
            .select('valor_pagado, socio_natillera:socios_natillera(socio:socios(nombre))')
            .eq('actividad_id', actividad.id)
            .gt('valor_pagado', 0)
          if (!errPagos && pagosRifa && pagosRifa.length > 0) {
            const valoresPagadosRifa = pagosRifa.map((sa) => {
              const nombre = sa.socio_natillera?.socio?.nombre || 'Socio'
              const valor = Number(sa.valor_pagado) || 0
              return { nombre, valor_pagado: valor }
            }).filter((p) => p.valor_pagado > 0)
            return { ...actividad, valores_pagados_rifa: valoresPagadosRifa }
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
    cargaInicial.value = false
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
          if (formActividad.tipoProceso === 'liquidar' && formActividad.tipo !== 'rifa' && (actFallback.utilidad || 0) !== 0) {
            try {
              await supabase.from('utilidades_clasificadas').insert({
                natillera_id: id,
                tipo: formActividad.tipo,
                id_actividad: actFallback.id,
                monto: actFallback.utilidad,
                fecha_cierre: null,
                descripcion: `Utilidad de ${formActividad.tipo}: ${descripcionActividad}`,
                detalles: { actividad_id: actFallback.id }
              })
            } catch (eUtil) {
              console.warn('Error registrando utilidad de actividad en utilidades_clasificadas:', eUtil)
            }
          }
          if (formActividad.tipoProceso === 'liquidar' && formActividad.tipo !== 'rifa' && (actFallback.ingresos || 0) > 0) {
            try {
              await supabase.from('movimientos_fondo').insert({
                natillera_id: id,
                tipo: 'entrada',
                monto: actFallback.ingresos,
                forma_pago: 'efectivo',
                destino_ingreso: 'recaudado',
                descripcion: `Recaudo actividad liquidada: ${descripcionActividad}`,
                fecha: new Date().toISOString().slice(0, 10)
              })
            } catch (eMov) {
              console.warn('Error registrando recaudo de actividad liquidada en movimientos_fondo:', eMov)
            }
          }
        } else {
          throw errorActividad
        }
      } else {
        console.log('✅ Actividad creada:', actividad.id, 'Serie ID:', actividad.actividad_serie_id)
        actividadesCreadas.push(actividad)
        // Si se creó liquidada y no es rifa, registrar utilidad en utilidades_clasificadas (indicador lee solo de esta tabla)
        if (formActividad.tipoProceso === 'liquidar' && formActividad.tipo !== 'rifa' && (actividad.utilidad || 0) !== 0) {
          try {
            await supabase.from('utilidades_clasificadas').insert({
              natillera_id: id,
              tipo: formActividad.tipo,
              id_actividad: actividad.id,
              monto: actividad.utilidad,
              fecha_cierre: null,
              descripcion: `Utilidad de ${formActividad.tipo}: ${descripcionActividad}`,
              detalles: { actividad_id: actividad.id }
            })
          } catch (eUtil) {
            console.warn('Error registrando utilidad de actividad en utilidades_clasificadas:', eUtil)
          }
        }
        if (formActividad.tipoProceso === 'liquidar' && formActividad.tipo !== 'rifa' && (actividad.ingresos || 0) > 0) {
          try {
            await supabase.from('movimientos_fondo').insert({
              natillera_id: id,
              tipo: 'entrada',
              monto: actividad.ingresos,
              forma_pago: 'efectivo',
              destino_ingreso: 'recaudado',
              descripcion: `Recaudo actividad liquidada: ${descripcionActividad}`,
              fecha: new Date().toISOString().slice(0, 10)
            })
          } catch (eMov) {
            console.warn('Error registrando recaudo de actividad liquidada en movimientos_fondo:', eMov)
          }
        }
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
// Al hacer clic en "Asignar números": si hay varios meses, mostrar confirmación; si no, asignar solo en este mes
function alHacerClicAsignarFaltante() {
  if (actividadesDeLaSerieActual.value.length > 1) {
    modalConfirmarAsignarFaltanteTodosMeses.value = true
  } else {
    confirmarAsignarFaltante(false)
  }
}
// Cerrar modal de confirmación y ejecutar asignación en todos los meses
function confirmarAsignarFaltanteTodosMeses() {
  modalConfirmarAsignarFaltanteTodosMeses.value = false
  confirmarAsignarFaltante(true)
}
// Función para confirmar asignación de faltante a socio (asignarEnTodosLosMeses: true = en todas las actividades del grupo)
async function confirmarAsignarFaltante(asignarEnTodosLosMeses = false) {
  if (!socioSeleccionadoParaFaltante.value || !faltanteSeleccionado.value) {
    notificationStore.error('Debe seleccionar un socio', 'Error')
    return
  }
  asignandoFaltante.value = true
  try {
    const socioId = socioSeleccionadoParaFaltante.value
    const numerosFaltante = faltanteSeleccionado.value.numeros
    const nombreFaltante = faltanteSeleccionado.value.nombre
    // Si hay grupo: asignar solo desde la actividad actual en adelante (febrero en adelante, no hacia atrás)
    const actividadesAAsignar = asignarEnTodosLosMeses && actividadesDeLaSerieActual.value.length > 1
      ? actividadesDelGrupoDesdeActualEnAdelante.value
      : [actividadSeleccionada.value]
    const actividadesIds = actividadesAAsignar.map(a => a.id)
    // Todos los números de rifa que son este faltante (por nombre) en las actividades del grupo, sin socio asignado
    const { data: numerosRifaData, error: errorFetch } = await supabase
      .from('numeros_rifa')
      .select('id, numero, actividad_id')
      .in('actividad_id', actividadesIds)
      .is('socio_vendedor_id', null)
      .eq('nombre_comprador', nombreFaltante)
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
    // Asegurar registro en socios_actividad por cada actividad donde se asignaron números
    const actividadesActualizadas = [...new Set(numerosRifaData.map(n => n.actividad_id))]
    const valorTotalFaltante = numerosFaltante.reduce((sum, n) => sum + (n.valor || 0), 0)
    const valorPagadoFaltanteActual = numerosFaltante.filter(n => n.estado === 'pagado').reduce((sum, n) => sum + (n.valor || 0), 0)
    for (const actividadId of actividadesActualizadas) {
      const actividad = actividadesAAsignar.find(a => a.id === actividadId)
      if (!actividad) continue
      const { data: sociosActividadData } = await supabase
        .from('socios_actividad')
        .select('id')
        .eq('actividad_id', actividadId)
        .eq('socio_natillera_id', socioId)
        .maybeSingle()
      if (sociosActividadData) continue // ya tiene registro
      const esActividadActual = actividadId === actividadSeleccionada.value.id
      const valorPagado = esActividadActual ? valorPagadoFaltanteActual : 0
      await supabase
        .from('socios_actividad')
        .insert({
          actividad_id: actividadId,
          socio_natillera_id: socioId,
          valor_asignado: valorTotalFaltante,
          valor_pagado: valorPagado,
          estado: 'pendiente',
          fecha_limite_pago: actividad.fecha_limite_pago
        })
    }
    const mensaje = asignarEnTodosLosMeses && actividadesAAsignar.length > 1
      ? `Números asignados al socio en los ${actividadesAAsignar.length} meses`
      : 'Números asignados correctamente al socio'
    notificationStore.success(mensaje, 'Éxito')
    // Cerrar modales y recargar datos
    modalAsignarFaltante.value = false
    modalConfirmarAsignarFaltanteTodosMeses.value = false
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
    modalConfirmarAsignarFaltanteTodosMeses.value = false
    faltanteSeleccionado.value = null
    socioSeleccionadoParaFaltante.value = ''
    // Nunca dejar una confirmación de borrado abierta para la próxima actividad que se mire.
    cancelarEliminarPago()
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
    const { error: errUtil } = await supabase
      .from('utilidades_clasificadas')
      .delete()
      .eq('id_actividad', actividadId)
    if (errUtil) throw errUtil
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
    const { error: errUtil } = await supabase
      .from('utilidades_clasificadas')
      .delete()
      .in('id_actividad', idsActividades)
    if (errUtil) throw errUtil
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
  actualizarIsMobile()
  window.addEventListener('resize', actualizarIsMobile)
  // Agregar listener para cerrar tooltip al hacer clic fuera
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside) // Para móvil
})
onUnmounted(() => {
  window.removeEventListener('resize', actualizarIsMobile)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
})
</script>
<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <!-- Page header (DS) — patrón unificado Socios/Actividades/Cuotas/Préstamos -->
    <header ref="headerRef" class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Socios</h1>
            <p class="ds-page-header__sub hidden sm:block">Gestiona los participantes y sus cuotas personalizadas</p>
          </div>
          <!-- Móvil: CTA primario en línea con el título (sm+ usa el bloque de actions) -->
          <button
            v-if="!esVisor"
            type="button"
            class="ds-btn ds-btn--primary sm:hidden socios-header-add"
            aria-label="Agregar socio"
            @click="abrirModalAgregar"
          >
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button
            v-if="!esVisor"
            type="button"
            class="ds-btn ds-btn--secondary hidden md:inline-flex"
            aria-label="Importar socios desde CSV"
            @click="modalImportar = true"
          >
            <ArrowUpTrayIcon class="w-4 h-4" />
            <span>Importar CSV</span>
          </button>
          <button
            v-if="!esVisor"
            type="button"
            class="ds-btn ds-btn--primary"
            aria-label="Agregar nuevo socio"
            @click="abrirModalAgregar"
          >
            <PlusIcon class="w-4 h-4" />
            <span>Agregar socio</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Estado: cargando -->
    <div v-if="cargaInicial && sociosStore.loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-slate-400 mt-4 text-sm">Cargando socios…</p>
    </div>

    <!-- Empty state: sin socios registrados (DS) -->
    <div v-else-if="!cargaInicial && sociosStore.sociosNatillera.length === 0" class="ds-empty-state">
      <div class="ds-empty-state__header">
        <div class="ds-empty-state__icon-wrap">
          <UsersIcon class="w-7 h-7" />
        </div>
        <h3 class="ds-empty-state__title">No hay socios registrados</h3>
        <p class="ds-empty-state__subtitle">
          Agrega el primer socio para comenzar a gestionar las cuotas
        </p>
      </div>
      <div class="ds-empty-state__body">
        <button
          v-if="!esVisor"
          type="button"
          class="ds-btn ds-btn--primary ds-btn--block"
          @click="abrirModalAgregar"
        >
          <PlusIcon class="w-5 h-5" />
          Agregar primer socio
        </button>
      </div>
    </div>

    <!-- Tabla de socios (toolbar + tabla/lista + paginación) -->
    <section
      v-else
      class="bg-white rounded-2xl border border-[color:var(--surface-divider)] shadow-[var(--shadow-xs)] overflow-hidden"
    >
      <!-- Toolbar: búsqueda + filtros -->
      <div class="socios-toolbar">
        <div class="socios-toolbar__search">
          <MagnifyingGlassIcon class="w-4 h-4" aria-hidden="true" />
          <input
            ref="inputBusquedaSocios"
            v-model="busqueda"
            type="text"
            :inputmode="inputModeBusqueda"
            placeholder="Buscar por nombre"
            class="socios-search__input"
            aria-label="Buscar socio por nombre, documento, email o teléfono"
            autocomplete="off"
            @pointerdown="habilitarTecladoSoftBusqueda"
            @touchstart.passive="habilitarTecladoSoftBusqueda"
            @keydown="habilitarTecladoSoftBusqueda"
            @keydown.esc="busqueda = ''"
          />
          <button
            v-if="busqueda"
            type="button"
            class="socios-search__clear"
            aria-label="Limpiar búsqueda"
            @click="busqueda = ''"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="socios-toolbar__filters">
          <select v-model="filtroEstado" class="socios-filter" aria-label="Filtrar por estado">
            <option value="todos">Estado: Todos</option>
            <option value="activo">Estado: Activos</option>
            <option value="inactivo">Estado: Inactivos</option>
          </select>
          <select v-model="filtroPeriodicidad" class="socios-filter" aria-label="Filtrar por periodicidad">
            <option value="todos">Periodicidad: Todas</option>
            <option value="mensual">Mensual</option>
            <option value="quincenal">Quincenal</option>
          </select>
        </div>
      </div>

      <!-- Sin resultados con filtros aplicados -->
      <div v-if="sociosFiltrados.length === 0" class="px-6 py-14 text-center">
        <div class="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
          <MagnifyingGlassIcon class="w-7 h-7 text-slate-400" />
        </div>
        <p class="font-display font-bold text-slate-800 text-base sm:text-lg mb-1">Sin resultados</p>
        <p class="text-sm text-slate-500 mb-5">
          No hay socios que coincidan con los filtros aplicados
        </p>
        <button type="button" class="ds-btn ds-btn--secondary" @click="limpiarFiltros">
          <XMarkIcon class="w-4 h-4" />
          Limpiar filtros
        </button>
      </div>

      <template v-else>
        <!-- Tabla — desktop (md+) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="socios-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Cuota</th>
                <th>Periodicidad</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sn in sociosPaginados"
                :key="sn.id"
                class="socios-table__row"
                :class="{ 'socios-table__row--inactivo': sn.estado !== 'activo' }"
                tabindex="0"
                :aria-label="`Ver detalle de ${sn.socio?.nombre}`"
                @click="abrirDetalleFila(sn)"
                @keydown.enter.self="abrirDetalleFila(sn)"
              >
                <td>
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed, sn.socio?.avatar_style)"
                      :alt="sn.socio?.nombre"
                      class="w-10 h-10 rounded-full object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div class="min-w-0">
                      <p class="font-bold text-slate-800 truncate leading-tight">
                        {{ sn.socio?.nombre || 'Socio sin nombre' }}
                      </p>
                      <p class="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                        {{ sn.socio?.documento ? `ID: ${sn.socio.documento}` : '—' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-sm text-slate-700 truncate">
                    {{ sn.socio?.email || '—' }}
                  </p>
                  <p class="text-xs text-slate-400 truncate mt-0.5">
                    {{ sn.socio?.telefono || 'Sin teléfono' }}
                  </p>
                </td>
                <td>
                  <span class="ds-badge" :class="badgeEstadoClase(sn.estado)">
                    <span class="badge-dot" :class="dotEstadoClase(sn.estado)" aria-hidden="true"></span>
                    {{ labelEstado(sn.estado) }}
                  </span>
                </td>
                <td>
                  <p class="font-bold text-slate-800 tabular-nums leading-tight">
                    $ {{ formatMoney(sn.valor_cuota_individual) }}
                  </p>
                  <span
                    v-if="estadoCuotaSocio(sn)"
                    class="cuota-status"
                    :class="estadoCuotaSocio(sn) === 'mora' ? 'cuota-status--mora' : 'cuota-status--ok'"
                  >
                    {{ estadoCuotaSocio(sn) === 'mora' ? 'Pendiente' : 'Al día' }}
                  </span>
                </td>
                <td>
                  <span class="text-sm text-slate-600 capitalize">
                    {{ sn.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                  </span>
                </td>
                <td>
                  <div class="flex items-center justify-end gap-0.5">
                    <template v-if="sn.estado === 'activo'">
                      <button
                        type="button"
                        class="action-btn action-btn--brand"
                        title="Ver cuotas"
                        aria-label="Ver cuotas del socio"
                        @click.stop="verCuotasSocio(sn)"
                      >
                        <CurrencyDollarIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="!esVisor"
                        type="button"
                        class="action-btn action-btn--info"
                        title="Editar"
                        aria-label="Editar socio"
                        @click.stop="editarSocio(sn)"
                      >
                        <PencilIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="!esVisor"
                        type="button"
                        class="action-btn action-btn--warning"
                        title="Desactivar"
                        aria-label="Desactivar socio"
                        @click.stop="abrirModalDesactivar(sn)"
                      >
                        <XCircleIcon class="w-5 h-5" />
                      </button>
                      <button
                        v-if="!esVisor"
                        type="button"
                        class="action-btn action-btn--danger"
                        title="Eliminar socio"
                        aria-label="Eliminar socio"
                        @click.stop="confirmarEliminarSocio(sn)"
                      >
                        <TrashIcon class="w-5 h-5" />
                      </button>
                    </template>
                    <button
                      v-else-if="!esVisor"
                      type="button"
                      class="ds-btn ds-btn--primary !min-h-[36px] !py-1.5 !px-3 !text-xs"
                      title="Activar socio"
                      aria-label="Activar socio"
                      @click.stop="abrirModalActivar(sn)"
                    >
                      <CheckCircleIcon class="w-4 h-4" />
                      Activar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Lista — solo móvil (<md). El wrapper lleva md:hidden: el scoped .socios-mobile-list { display:flex } solía anular el hidden del <ul> en desktop. -->
        <div class="md:hidden w-full">
        <ul class="socios-mobile-list">
          <li
            v-for="sn in sociosPaginados"
            :key="sn.id"
            class="socios-mobile-card"
            :class="{ 'socios-mobile-card--inactivo': sn.estado !== 'activo' }"
          >
            <button
              type="button"
              class="socios-mobile-card__main"
              :aria-label="`Ver detalle de ${sn.socio?.nombre}`"
              @click="abrirDetalleFila(sn)"
            >
              <!-- Avatar + bloque texto: nombre, correo y teléfono debajo del nombre -->
              <div class="flex items-start gap-2.5">
                <img
                  :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed, sn.socio?.avatar_style)"
                  :alt="sn.socio?.nombre"
                  class="w-10 h-10 rounded-full object-cover bg-slate-100 flex-shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="font-bold text-slate-800 truncate text-sm leading-snug">
                      {{ sn.socio?.nombre || 'Socio sin nombre' }}
                    </p>
                    <span class="ds-badge flex-shrink-0" :class="badgeEstadoClase(sn.estado)">
                      <span class="badge-dot" :class="dotEstadoClase(sn.estado)" aria-hidden="true"></span>
                      {{ labelEstado(sn.estado) }}
                    </span>
                  </div>
                  <p class="flex items-center gap-1 mt-1 text-[11px] text-slate-500 truncate leading-tight">
                    <EnvelopeIcon class="w-3 h-3 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span class="truncate">{{ sn.socio?.email || 'Sin correo' }}</span>
                  </p>
                  <p class="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 truncate leading-tight">
                    <PhoneIcon class="w-3 h-3 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span class="truncate">{{ sn.socio?.telefono || 'Sin teléfono' }}</span>
                  </p>
                </div>
              </div>

              <!-- Métricas (Cuota / Periodicidad) — bloque compacto -->
              <div class="socios-mobile-card__metrics">
                <div class="min-w-0">
                  <p class="socios-mobile-metric-label">Cuota</p>
                  <p class="font-bold text-slate-800 tabular-nums text-sm leading-none">
                    $ {{ formatMoney(sn.valor_cuota_individual) }}
                  </p>
                  <span
                    v-if="estadoCuotaSocio(sn)"
                    class="cuota-status cuota-status--compact mt-0.5"
                    :class="estadoCuotaSocio(sn) === 'mora' ? 'cuota-status--mora' : 'cuota-status--ok'"
                  >
                    {{ estadoCuotaSocio(sn) === 'mora' ? 'Pendiente' : 'Al día' }}
                  </span>
                </div>
                <div class="text-right min-w-0">
                  <p class="socios-mobile-metric-label">Periodicidad</p>
                  <p class="text-xs text-slate-700 capitalize leading-none">
                    {{ sn.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                  </p>
                </div>
              </div>
            </button>

            <!-- Acciones (pill suaves, fuera del button principal para evitar nesting) -->
            <div v-if="!esVisor" class="socios-mobile-card__actions">
              <template v-if="sn.estado === 'activo'">
                <button
                  type="button"
                  class="card-pill card-pill--brand"
                  aria-label="Ver cuotas del socio"
                  @click.stop="verCuotasSocio(sn)"
                >
                  <CurrencyDollarIcon class="w-4 h-4" />
                  Cuotas
                </button>
                <button
                  type="button"
                  class="card-pill card-pill--info"
                  aria-label="Editar socio"
                  @click.stop="editarSocio(sn)"
                >
                  <PencilIcon class="w-4 h-4" />
                  Editar
                </button>
                <button
                  type="button"
                  class="card-pill card-pill--warning"
                  aria-label="Desactivar socio"
                  @click.stop="abrirModalDesactivar(sn)"
                >
                  <XCircleIcon class="w-4 h-4" />
                  Inact.
                </button>
                <button
                  type="button"
                  class="card-pill card-pill--danger card-pill--icon"
                  aria-label="Eliminar socio"
                  @click.stop="confirmarEliminarSocio(sn)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </template>
              <button
                v-else
                type="button"
                class="ds-btn ds-btn--primary !min-h-[36px] !py-1.5 !px-3 !text-xs flex-1"
                aria-label="Activar socio"
                @click.stop="abrirModalActivar(sn)"
              >
                <CheckCircleIcon class="w-4 h-4" />
                Activar
              </button>
            </div>
            <!-- Visor (solo lectura): solo Cuotas si está activo -->
            <div v-else-if="sn.estado === 'activo'" class="socios-mobile-card__actions">
              <button
                type="button"
                class="card-pill card-pill--brand"
                aria-label="Ver cuotas del socio"
                @click.stop="verCuotasSocio(sn)"
              >
                <CurrencyDollarIcon class="w-4 h-4" />
                Cuotas
              </button>
            </div>
          </li>
        </ul>
        </div>

        <!-- Paginación -->
        <div class="socios-pagination">
          <div class="socios-pagination__info">
            <label class="socios-page-size">
              <span class="text-xs text-slate-500">Filas:</span>
              <select
                v-model.number="itemsPorPagina"
                class="socios-page-size__select"
                aria-label="Filas por página"
              >
                <option v-for="n in ITEMS_POR_PAGINA_OPCIONES" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <p class="text-xs text-slate-500">
              Mostrando
              <strong class="text-slate-700 font-semibold">{{ rangoMostrado }}</strong>
              de
              <strong class="text-slate-700 font-semibold">{{ sociosFiltrados.length }}</strong>
              {{ sociosFiltrados.length === 1 ? 'socio' : 'socios' }}
            </p>
          </div>
          <div v-if="totalPaginas > 1" class="flex items-center gap-1">
            <button
              type="button"
              class="socios-page-btn"
              :disabled="paginaActual === 1"
              aria-label="Página anterior"
              @click="paginaActual = Math.max(1, paginaActual - 1)"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <button
              v-for="p in paginasVisibles"
              :key="p"
              type="button"
              class="socios-page-btn"
              :class="{ 'socios-page-btn--active': p === paginaActual }"
              :aria-current="p === paginaActual ? 'page' : undefined"
              :aria-label="`Ir a página ${p}`"
              @click="paginaActual = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="socios-page-btn"
              :disabled="paginaActual === totalPaginas"
              aria-label="Página siguiente"
              @click="paginaActual = Math.min(totalPaginas, paginaActual + 1)"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>
    </section>

    <!-- FAB flotante (móvil + desktop): aparece cuando el header sale de viewport -->
    <Transition name="socios-fab">
      <button
        v-if="mostrarFab"
        type="button"
        class="socios-fab"
        aria-label="Agregar socio"
        @click="abrirModalAgregar"
      >
        <PlusIcon class="w-6 h-6" />
      </button>
    </Transition>

    <!-- Modal Detalle Socio — patrón estándar (skill natillerapp-modals + DS) -->
    <ModalWrapper
      :show="!!modalDetalle"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="modalDetalle = false"
    >
      <!-- Cabecera marca: avatar redondo blanco, nombre, badge de estado, X en flex -->
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <!-- Móvil: una sola fila [avatar | nombre+estado | X] -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <img
            v-if="socioSeleccionado"
            :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)"
            :alt="socioSeleccionado.socio?.nombre"
            class="w-10 h-10 shrink-0 rounded-full object-cover bg-white shadow-sm"
          />
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              {{ socioSeleccionado?.socio?.nombre || 'Socio' }}
            </h3>
            <span class="ds-badge mt-1" :class="badgeEstadoClase(socioSeleccionado?.estado)">
              <span class="badge-dot" :class="dotEstadoClase(socioSeleccionado?.estado)" aria-hidden="true"></span>
              {{ labelEstado(socioSeleccionado?.estado) }}
            </span>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="modalDetalle = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <!-- Desktop: avatar arriba centrado, nombre y badge debajo, X en flex (no absolute) -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <img
              v-if="socioSeleccionado"
              :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)"
              :alt="socioSeleccionado.socio?.nombre"
              class="w-14 h-14 mb-2 rounded-full object-cover bg-white shadow-sm"
            />
            <h3 class="font-display font-bold text-white text-lg leading-tight truncate max-w-full">
              {{ socioSeleccionado?.socio?.nombre || 'Socio' }}
            </h3>
            <span class="ds-badge mt-1.5" :class="badgeEstadoClase(socioSeleccionado?.estado)">
              <span class="badge-dot" :class="dotEstadoClase(socioSeleccionado?.estado)" aria-hidden="true"></span>
              {{ labelEstado(socioSeleccionado?.estado) }}
            </span>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="modalDetalle = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalDetalleSocio"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalDetalleSocio"
        >
          <!-- Estado de pagos: callout verde (al día) o ámbar (pendientes) -->
          <div
            class="ds-callout"
            :style="resumenSocio.alDia
              ? null
              : 'background: rgba(254, 243, 199, 0.6); color: #78350f;'"
          >
            <component
              :is="resumenSocio.alDia ? CheckCircleIcon : ExclamationCircleIcon"
              class="w-5 h-5 ds-callout__icon flex-shrink-0"
              :style="resumenSocio.alDia ? null : 'color: #b45309;'"
            />
            <div>
              <span
                class="ds-callout__title"
                :style="resumenSocio.alDia ? null : 'color: #78350f;'"
              >
                {{ resumenSocio.alDia ? '¡Al día con los pagos!' : 'Tiene pagos pendientes' }}
              </span>
              <span>
                {{ resumenSocio.alDia
                  ? 'Este socio ha cumplido con todas sus cuotas.'
                  : `Debe ${resumenSocio.cuotasPendientes + resumenSocio.cuotasMora} cuota${(resumenSocio.cuotasPendientes + resumenSocio.cuotasMora) === 1 ? '' : 's'}.` }}
              </span>
            </div>
          </div>

          <!-- Resumen Financiero — fijo, siempre visible (no desplegable) -->
          <section class="detalle-resumen" aria-labelledby="detalle-resumen-titulo">
            <div class="flex items-center gap-2 px-0.5">
              <BanknotesIcon class="w-4 h-4 text-[color:var(--brand-primary)]" />
              <h3 id="detalle-resumen-titulo" class="font-display font-bold text-slate-800 text-sm">
                Resumen financiero
              </h3>
            </div>

            <!-- Métricas (destacadas): Total aportado + Pendiente -->
            <div class="grid grid-cols-2 gap-2.5">
              <div class="detalle-metric detalle-metric--positivo">
                <p class="detalle-metric__label">Total aportado</p>
                <p class="detalle-metric__value">
                  $ {{ formatMoney(resumenSocio.totalAportado) }}
                </p>
              </div>
              <div
                class="detalle-metric"
                :class="resumenSocio.totalPendiente > 0 ? 'detalle-metric--debe' : 'detalle-metric--neutro'"
              >
                <p class="detalle-metric__label">Pendiente</p>
                <p class="detalle-metric__value">
                  $ {{ formatMoney(resumenSocio.totalPendiente) }}
                </p>
              </div>
            </div>

            <!-- Configuración (peso ligero): Cuota + Periodicidad -->
            <div>
              <p class="ds-overline mb-1.5">Configuración del socio</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="detalle-config-chip">
                  <p class="detalle-config-chip__label">Cuota</p>
                  <p class="detalle-config-chip__value detalle-config-chip__value--money">
                    $ {{ formatMoney(socioSeleccionado?.valor_cuota_individual) }}
                  </p>
                </div>
                <div class="detalle-config-chip">
                  <p class="detalle-config-chip__label">Periodicidad</p>
                  <p class="detalle-config-chip__value">
                    {{ socioSeleccionado?.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                  </p>
                  <p class="detalle-config-chip__hint">
                    {{ socioSeleccionado?.periodicidad === 'quincenal' ? '2 cuotas / mes' : '1 cuota / mes' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Mini stats de cuotas -->
            <div>
              <p class="ds-overline mb-1.5">Cuotas</p>
              <div class="grid grid-cols-3 gap-2">
                <div class="detalle-mini-stat">
                  <p class="detalle-mini-stat__value text-[color:var(--brand-success)]">{{ resumenSocio.cuotasPagadas }}</p>
                  <p class="detalle-mini-stat__label">Pagadas</p>
                </div>
                <div class="detalle-mini-stat">
                  <p class="detalle-mini-stat__value text-[color:var(--brand-warning)]">{{ resumenSocio.cuotasPendientes }}</p>
                  <p class="detalle-mini-stat__label">Pendientes</p>
                </div>
                <div class="detalle-mini-stat">
                  <p class="detalle-mini-stat__value text-[color:var(--brand-danger)]">{{ resumenSocio.cuotasMora }}</p>
                  <p class="detalle-mini-stat__label">En mora</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Cuotas pagadas -->
          <section class="detalle-seccion">
            <button
              type="button"
              class="detalle-seccion__head"
              :aria-expanded="seccionActiva === 'cuotasPagadas'"
              @click="toggleSeccion('cuotasPagadas')"
            >
              <span class="detalle-seccion__title">
                <CalendarDaysIcon class="w-4 h-4 text-[color:var(--brand-primary)]" />
                Cuotas pagadas
              </span>
              <ChevronDownIcon
                class="w-4 h-4 text-slate-400 transition-transform duration-200"
                :class="seccionActiva === 'cuotasPagadas' ? 'rotate-180' : ''"
              />
            </button>
            <div v-show="seccionActiva === 'cuotasPagadas'" class="detalle-seccion__body">
              <div v-if="loadingDetalle" class="text-center py-6 text-slate-500 text-sm">
                Cargando cuotas pagadas…
              </div>
              <div v-else-if="cuotasPagadasDetalleSocio.length === 0" class="text-center py-6 text-slate-400 text-sm">
                No hay cuotas pagadas registradas.
              </div>
              <div
                v-else
                class="overflow-x-auto max-h-[min(320px,45vh)] overflow-y-auto rounded-[var(--radius-md)] border border-[color:var(--surface-divider)]"
              >
                <table class="w-full min-w-[280px] text-sm text-left border-collapse">
                  <thead class="sticky top-0 z-[1] bg-[color:var(--surface-muted)] border-b border-[color:var(--surface-divider)]">
                    <tr>
                      <th scope="col" class="px-3 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Cuota</th>
                      <th scope="col" class="px-3 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right whitespace-nowrap">Valor</th>
                      <th scope="col" class="px-3 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap">Fecha pago</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                    <tr
                      v-for="item in cuotasPagadasDetalleSocio"
                      :key="item.id"
                      class="hover:bg-[color:var(--brand-primary-soft)] transition-colors"
                    >
                      <td class="px-3 py-2 text-slate-800 align-top">{{ item.cuotaLabel }}</td>
                      <td class="px-3 py-2 text-right font-semibold text-[color:var(--brand-primary)] tabular-nums whitespace-nowrap align-top">
                        $ {{ formatMoney(item.valorPagado) }}
                      </td>
                      <td class="px-3 py-2 text-slate-600 whitespace-nowrap align-top">
                        {{ item.fechaPago ? formatDate(item.fechaPago) : '—' }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-[color:var(--brand-primary-soft)] border-t border-[color:var(--surface-divider)]">
                    <tr>
                      <th scope="row" class="px-3 py-2.5 text-left font-bold text-slate-900 text-sm">Total</th>
                      <td class="px-3 py-2.5 text-right font-bold text-[color:var(--brand-primary)] tabular-nums whitespace-nowrap text-sm">
                        $ {{ formatMoney(totalValorCuotasPagadasDetalleSocio) }}
                      </td>
                      <td class="px-3 py-2.5"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>

          <!-- Información de Contacto -->
          <section class="detalle-seccion">
            <button
              type="button"
              class="detalle-seccion__head"
              :aria-expanded="seccionActiva === 'contacto'"
              @click="toggleSeccion('contacto')"
            >
              <span class="detalle-seccion__title">
                <UserIcon class="w-4 h-4 text-[color:var(--brand-primary)]" />
                Información de contacto
              </span>
              <ChevronDownIcon
                class="w-4 h-4 text-slate-400 transition-transform duration-200"
                :class="seccionActiva === 'contacto' ? 'rotate-180' : ''"
              />
            </button>
            <div v-show="seccionActiva === 'contacto'" class="detalle-seccion__body space-y-2">
              <div class="detalle-info-row">
                <PhoneIcon class="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="ds-overline mb-0.5">Teléfono / WhatsApp</p>
                  <p class="font-semibold text-slate-800 text-sm truncate">
                    {{ socioSeleccionado?.socio?.telefono || 'No registrado' }}
                  </p>
                </div>
                <a
                  v-if="socioSeleccionado?.socio?.telefono"
                  :href="`https://wa.me/57${socioSeleccionado.socio.telefono.replace(/\D/g, '')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ds-btn ds-btn--secondary !min-h-[36px] !py-1.5 !px-3 !text-xs flex-shrink-0"
                >
                  <ChatBubbleLeftIcon class="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
              <div class="detalle-info-row">
                <EnvelopeIcon class="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="ds-overline mb-0.5">Correo electrónico</p>
                  <p class="font-semibold text-slate-800 text-sm truncate">
                    {{ socioSeleccionado?.socio?.email || 'No registrado' }}
                  </p>
                </div>
              </div>
              <div class="detalle-info-row">
                <IdentificationIcon class="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="ds-overline mb-0.5">Documento</p>
                  <p class="font-semibold text-slate-800 text-sm truncate">
                    {{ socioSeleccionado?.socio?.documento || 'No registrado' }}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalDetalleSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo: 2 filas con jerarquía clara. Siempre visible. Hereda safe-area-bottom. -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-5 sm:px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-2">
        <!-- Fila 1: acciones principales (peso fuerte) -->
        <div class="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            class="btn-modal-secondary flex-1"
            @click="modalDetalle = false"
          >
            Cerrar
          </button>
          <button
            v-if="!esVisor"
            type="button"
            class="btn-modal-primary flex-1"
            @click="modalDetalle = false; editarSocio(socioSeleccionado)"
          >
            <PencilIcon class="w-4 h-4" />
            Editar
          </button>
        </div>
        <!-- Fila 2: acciones destructivas (peso ligero, ghost; solo admin) -->
        <div v-if="!esVisor" class="flex justify-center gap-1">
          <button
            v-if="socioSeleccionado?.estado === 'activo'"
            type="button"
            class="detalle-ghost-btn detalle-ghost-btn--warning"
            @click="modalDetalle = false; abrirModalDesactivar(socioSeleccionado)"
          >
            <XCircleIcon class="w-3.5 h-3.5" />
            Inactivar
          </button>
          <span
            v-if="socioSeleccionado?.estado === 'activo'"
            class="detalle-ghost-divider"
            aria-hidden="true"
          ></span>
          <button
            type="button"
            class="detalle-ghost-btn detalle-ghost-btn--danger"
            @click="modalDetalle = false; confirmarEliminarSocio(socioSeleccionado)"
          >
            <TrashIcon class="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </ModalWrapper>

    <!-- Modal Importar CSV — mismo shell que Agregar socio (skill natillerapp-modals + DS) -->
    <ModalWrapper
      :show="!!modalImportar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="cerrarModalImportar"
    >
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <ArrowUpTrayIcon class="w-5 h-5 text-[color:var(--brand-primary)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight">Importar socios</h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5">Plantilla o importación</p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="importando"
            @click="cerrarModalImportar"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ArrowUpTrayIcon class="w-6 h-6 text-[color:var(--brand-primary)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">Importar socios</h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">
              Descarga la plantilla de ejemplo o carga un CSV: son acciones independientes
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="importando"
            @click="cerrarModalImportar"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalImportar"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-5"
          @scroll.passive="programarNatiscrollModalImportar"
        >
          <span class="ds-overline">Descargar plantilla</span>
          <div class="ds-callout">
            <DocumentArrowDownIcon class="w-5 h-5 ds-callout__icon" />
            <div>
              <span class="ds-callout__title">Plantilla de ejemplo</span>
              <span>
                Baja un CSV de referencia para ver columnas y formato esperado. Es opcional y no tiene que hacerse antes ni después de importar.
              </span>
            </div>
          </div>
          <button
            type="button"
            class="ds-btn ds-btn--secondary w-full sm:w-auto"
            @click="descargarEjemploCSV"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            Descargar ejemplo.csv
          </button>

          <div class="space-y-3 border-t border-[color:var(--surface-divider)] pt-5">
            <span class="ds-overline">Cargar e importar</span>
            <div class="rounded-[var(--radius-lg)] border border-[color:var(--surface-divider)] bg-[color:var(--surface-muted)] p-4">
              <div class="flex items-start gap-3">
                <ArrowUpTrayIcon class="w-5 h-5 text-[color:var(--brand-primary)] flex-shrink-0 mt-0.5" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 text-sm">Importar desde tu equipo</p>
                  <p class="text-sm text-slate-600 mt-1 leading-snug">
                    Elige el archivo CSV con los socios que quieres dar de alta. Es un proceso aparte de descargar la plantilla.
                  </p>
                  <input
                    ref="inputArchivoCsv"
                    type="file"
                    accept=".csv"
                    class="hidden"
                    tabindex="-1"
                    @change="handleArchivoCSV"
                  />
                  <button
                    type="button"
                    class="ds-btn ds-btn--secondary mt-3 w-full sm:w-auto"
                    :aria-label="archivoCSV ? `Archivo seleccionado: ${archivoCSV.name}` : 'Seleccionar archivo CSV'"
                    @click="inputArchivoCsv?.click()"
                  >
                    <DocumentTextIcon class="w-4 h-4" />
                    {{ archivoCSV ? archivoCSV.name : 'Seleccionar archivo…' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="sociosPreview.length > 0" class="space-y-2">
            <p class="ds-label mb-0">
              Vista previa ({{ sociosPreview.length }} {{ sociosPreview.length === 1 ? 'socio' : 'socios' }})
            </p>
            <div class="max-h-48 overflow-y-auto rounded-[var(--radius-lg)] border border-[color:var(--surface-divider)] overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-[color:var(--surface-muted)] sticky top-0 z-[1]">
                  <tr>
                    <th class="text-left p-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nombre</th>
                    <th class="text-left p-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Cuota</th>
                    <th class="text-left p-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                      Teléfono <span class="text-[color:var(--brand-danger)]">*</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="(socio, index) in sociosPreview" :key="index">
                    <td class="p-3 text-slate-800">{{ socio.nombre }}</td>
                    <td class="p-3 font-semibold text-[color:var(--brand-primary)] tabular-nums">${{ formatMoney(socio.valor_cuota) }}</td>
                    <td class="p-3" :class="socio.telefono ? 'text-slate-700' : 'text-[color:var(--brand-danger)] font-medium'">
                      {{ socio.telefono || 'Requerido' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="errorImportar" class="ds-callout" role="alert" style="background: #fee2e2; color: #991b1b;">
            <ExclamationCircleIcon class="w-5 h-5 ds-callout__icon" style="color: #b91c1c;" />
            <div>{{ errorImportar }}</div>
          </div>

          <div v-if="exitoImportar" class="ds-callout" style="background: #dcfce7; color: #166534;">
            <CheckCircleIcon class="w-5 h-5 flex-shrink-0" style="color: var(--brand-success);" />
            <div>{{ exitoImportar }}</div>
          </div>
        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalImportar"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo: siempre visible -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row gap-2.5">
        <button
          type="button"
          class="btn-modal-secondary flex-1"
          :disabled="importando"
          @click="cerrarModalImportar"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-modal-primary flex-1"
          :disabled="sociosPreview.length === 0 || importando"
          @click="importarSocios"
        >
          <svg
            v-if="importando"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <ArrowUpTrayIcon v-else class="w-4 h-4" />
          {{ importando ? 'Importando…' : (sociosPreview.length > 0 ? `Importar ${sociosPreview.length} socios` : 'Importar socios') }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Agregar/Editar Socio: cabecera marca compacta + DS inputs/buttons + un solo scroll -->
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
      <!-- Cabecera marca (compacta ~20% según skill: X siempre en flex, nunca absolute) -->
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <!-- Móvil: una sola fila [icono | títulos | X] -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <PencilIcon v-if="socioEditando" class="w-5 h-5 text-[color:var(--brand-primary)]" />
            <UserPlusIcon v-else class="w-5 h-5 text-[color:var(--brand-primary)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight">
              {{ socioEditando ? 'Editar socio' : 'Agregar socio' }}
            </h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              {{ socioEditando ? 'Actualiza los datos del participante' : 'Completa los datos para registrar' }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Cerrar"
            :disabled="guardando"
            @click="cerrarModal"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Desktop / tablet: bloque centrado [w-11 vacío | centro icono+títulos | X w-11] -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <PencilIcon v-if="socioEditando" class="w-6 h-6 text-[color:var(--brand-primary)]" />
              <UserPlusIcon v-else class="w-6 h-6 text-[color:var(--brand-primary)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              {{ socioEditando ? 'Editar socio' : 'Agregar socio' }}
            </h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">
              {{ socioEditando ? 'Actualiza los datos del participante' : 'Completa los datos para registrar un nuevo socio' }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Cerrar"
            :disabled="guardando"
            @click="cerrarModal"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalAgregarSocio"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="programarNatiscrollModalAgregarSocio"
        >
          <form
            id="form-agregar-socio"
            class="space-y-5 px-5 sm:px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            @submit.prevent="handleGuardarSocio"
          >
            <!-- Avatar -->
            <div>
              <label class="ds-label">Avatar del socio</label>
              <div class="flex items-center gap-3">
                <img
                  :src="getAvatarUrl(formSocio.avatar_seed || 'nuevo', formSocio.avatar_seed, formSocio.avatar_style)"
                  alt="Avatar seleccionado"
                  class="w-14 h-14 rounded-full bg-[color:var(--brand-primary-soft)] border border-[color:var(--surface-divider-strong)] object-cover flex-shrink-0"
                />
                <button
                  type="button"
                  class="ds-btn ds-btn--secondary"
                  :aria-expanded="mostrarAvatares"
                  @click="mostrarAvatares = !mostrarAvatares"
                >
                  <SparklesIcon class="w-4 h-4" />
                  {{ mostrarAvatares ? 'Ocultar opciones' : 'Cambiar avatar' }}
                </button>
              </div>
              <div
                v-show="mostrarAvatares"
                class="mt-3 rounded-[var(--radius-md)] border border-[color:var(--surface-divider)] bg-[color:var(--surface-muted)] overflow-hidden"
              >
                <div class="grid grid-cols-5 gap-2 p-3 max-h-52 overflow-y-auto">
                  <button
                    v-for="seed in avatarSeeds"
                    :key="seed"
                    type="button"
                    :aria-label="`Elegir avatar ${seed}`"
                    :class="[
                      'p-1 rounded-[var(--radius-md)] transition-all touch-manipulation',
                      formSocio.avatar_seed === seed
                        ? 'ring-2 ring-[color:var(--brand-primary)] bg-white'
                        : 'hover:bg-white/70'
                    ]"
                    @click="formSocio.avatar_seed = seed; mostrarAvatares = false"
                  >
                    <img
                      :src="getAvatarUrl(seed, seed, formSocio.avatar_style)"
                      :alt="seed"
                      class="w-10 h-10 rounded-[var(--radius-sm)] object-cover"
                      loading="lazy"
                      @error="handleAvatarError($event, seed)"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Nombre -->
            <div>
              <label for="agregar-socio-nombre" class="ds-label">
                Nombre completo <span class="text-[color:var(--brand-danger)]">*</span>
              </label>
              <input
                id="agregar-socio-nombre"
                ref="inputNombreSocio"
                v-model="formSocio.nombre"
                type="text"
                class="ds-input"
                placeholder="Ej: María García"
                required
              />
            </div>

            <!-- Periodicidad -->
            <div>
              <label class="ds-label">Periodicidad de pago</label>
              <div :class="periodicidadNatillera === 'mensual' ? '' : 'grid grid-cols-2 gap-2.5'">
                <button
                  type="button"
                  :disabled="periodicidadNatillera === 'mensual'"
                  :class="[
                    'periodicidad-opcion',
                    formSocio.periodicidad === 'mensual' ? 'periodicidad-opcion--activa' : '',
                    periodicidadNatillera === 'mensual' ? 'periodicidad-opcion--unica' : ''
                  ]"
                  @click="periodicidadNatillera !== 'mensual' && (formSocio.periodicidad = 'mensual')"
                >
                  <CalendarIcon class="w-5 h-5 flex-shrink-0" />
                  <div class="min-w-0 flex-1 text-left">
                    <p class="font-semibold text-sm leading-tight">Mensual</p>
                    <p class="text-[0.6875rem] text-slate-500 mt-0.5">1 cuota por mes</p>
                  </div>
                  <span
                    v-if="periodicidadNatillera === 'mensual'"
                    class="ds-badge ds-badge--brand flex-shrink-0"
                  >
                    Único
                  </span>
                  <CheckCircleIcon
                    v-else-if="formSocio.periodicidad === 'mensual'"
                    class="w-4 h-4 text-[color:var(--brand-primary)] flex-shrink-0"
                  />
                </button>
                <button
                  v-if="periodicidadNatillera === 'quincenal'"
                  type="button"
                  :class="[
                    'periodicidad-opcion',
                    formSocio.periodicidad === 'quincenal' ? 'periodicidad-opcion--activa' : ''
                  ]"
                  @click="formSocio.periodicidad = 'quincenal'"
                >
                  <CalendarDaysIcon class="w-5 h-5 flex-shrink-0" />
                  <div class="min-w-0 flex-1 text-left">
                    <p class="font-semibold text-sm leading-tight">Quincenal</p>
                    <p class="text-[0.6875rem] text-slate-500 mt-0.5">2 cuotas por mes</p>
                  </div>
                  <CheckCircleIcon
                    v-if="formSocio.periodicidad === 'quincenal'"
                    class="w-4 h-4 text-[color:var(--brand-primary)] flex-shrink-0"
                  />
                </button>
              </div>
              <p v-if="periodicidadNatillera === 'mensual'" class="text-xs text-slate-500 mt-2">
                Esta natillera está configurada como mensual.
              </p>
            </div>

            <!-- Cuota (campo destacado) -->
            <div class="cuota-bloque">
              <label for="agregar-socio-cuota" class="ds-label flex items-center gap-1.5">
                <CurrencyDollarIcon class="w-4 h-4 text-[color:var(--brand-primary)]" />
                {{ textoLabelCuota }} <span class="text-[color:var(--brand-danger)]">*</span>
              </label>
              <div class="relative">
                <span class="cuota-bloque__prefix">$</span>
                <input
                  id="agregar-socio-cuota"
                  :value="formatearValorCuota(formSocio.valor_cuota)"
                  type="text"
                  inputmode="numeric"
                  class="ds-input cuota-bloque__input"
                  placeholder="120.000"
                  required
                  @input="handleValorCuotaInput($event)"
                  @focus="seleccionarMontoCuota"
                  @click="seleccionarMontoCuota"
                  @blur="handleValorCuotaBlur"
                />
              </div>
              <p class="text-xs text-[color:var(--brand-primary)] mt-2">
                Valor que el socio aportará en cada período.
              </p>

              <!-- Aviso al editar (callout warning consistente con DS) -->
              <div v-if="socioEditando" class="cuota-aviso">
                <ExclamationTriangleIcon class="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-amber-800 flex-1 leading-snug">
                  Este cambio afectará todas las cuotas generadas para este socio.
                </p>
                <div class="relative flex-shrink-0">
                  <button
                    type="button"
                    data-advertencia-button
                    class="inline-flex items-center justify-center w-7 h-7 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-full transition-colors touch-manipulation"
                    title="Ver más detalles"
                    aria-label="Ver detalles del impacto"
                    @click.stop="mostrarAdvertenciaCuota = !mostrarAdvertenciaCuota"
                  >
                    <InformationCircleIcon class="w-4 h-4" />
                  </button>
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
                      class="absolute bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-2rem)] p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)] shadow-xl z-50"
                      @click.stop
                    >
                      <div class="absolute bottom-0 right-3 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-amber-50 border-r border-b border-amber-200"></div>
                      <p class="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5">
                        <ExclamationTriangleIcon class="w-3.5 h-3.5" />
                        Al modificar este valor:
                      </p>
                      <ul class="text-[11px] text-amber-800 space-y-1.5 leading-relaxed">
                        <li class="flex items-start gap-1.5">
                          <span class="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                          <span>Se actualizarán <strong>todas las cuotas</strong> generadas para este socio.</span>
                        </li>
                        <li class="flex items-start gap-1.5">
                          <span class="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                          <span><strong>Valor mayor:</strong> las cuotas pagadas pasan a pagos parciales.</span>
                        </li>
                        <li class="flex items-start gap-1.5">
                          <span class="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                          <span><strong>Valor menor:</strong> se mantienen pagadas con nota.</span>
                        </li>
                      </ul>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <!-- Teléfono -->
            <div>
              <label for="agregar-socio-telefono" class="ds-label flex items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1.5">
                  <PhoneIcon class="w-4 h-4 text-[color:var(--brand-primary)]" />
                  Teléfono / WhatsApp <span class="text-[color:var(--brand-danger)]">*</span>
                </span>
                <span class="text-[0.6875rem] font-normal text-slate-500">único por socio</span>
              </label>
              <div class="flex gap-2">
                <input
                  id="agregar-socio-telefono"
                  v-model="formSocio.telefono"
                  type="tel"
                  class="ds-input flex-1"
                  :class="{ 'ds-input--error': errorTelefonoDuplicado }"
                  placeholder="3001234567"
                  required
                />
                <button
                  v-if="contactPickerDisponible"
                  type="button"
                  class="ds-btn ds-btn--secondary flex-shrink-0 !px-3"
                  title="Seleccionar contacto del teléfono"
                  aria-label="Seleccionar contacto"
                  @click.stop.prevent="abrirSelectorContactos"
                >
                  <UserIcon class="w-4 h-4" />
                  <span class="hidden sm:inline">Contactos</span>
                </button>
              </div>
              <p v-if="errorTelefonoDuplicado" class="text-xs text-[color:var(--brand-danger)] font-medium mt-1.5">
                Este número de teléfono ya está registrado para otro socio.
              </p>
              <p v-else class="text-xs text-slate-500 mt-1.5 leading-snug">
                Número único requerido para recordatorios de pago.
                <span v-if="contactPickerDisponible" class="block">
                  Usa el botón “Contactos” para elegir desde tu agenda.
                </span>
              </p>
            </div>

            <!-- Información de contacto adicional (colapsable) -->
            <div class="rounded-[var(--radius-lg)] border border-[color:var(--surface-divider)] overflow-hidden">
              <button
                type="button"
                class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[color:var(--surface-muted)] hover:bg-[color:var(--brand-primary-soft)] transition-colors text-left touch-manipulation min-h-[48px]"
                :aria-expanded="mostrarContacto"
                @click="mostrarContacto = !mostrarContacto"
              >
                <span class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <EnvelopeIcon class="w-4 h-4 text-[color:var(--brand-primary)]" />
                  Información de contacto adicional
                  <span class="text-slate-400 font-normal">(opcional)</span>
                </span>
                <ChevronDownIcon
                  :class="['w-5 h-5 text-slate-400 transition-transform flex-shrink-0', mostrarContacto ? 'rotate-180' : '']"
                />
              </button>
              <div v-show="mostrarContacto" class="p-4 space-y-4 border-t border-[color:var(--surface-divider)]">
                <div>
                  <label for="agregar-socio-email" class="ds-label">Correo electrónico</label>
                  <input
                    id="agregar-socio-email"
                    v-model="formSocio.email"
                    type="email"
                    class="ds-input"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label for="agregar-socio-documento" class="ds-label">Documento de identidad</label>
                  <input
                    id="agregar-socio-documento"
                    v-model="formSocio.documento"
                    type="text"
                    class="ds-input"
                    placeholder="Cédula (opcional)"
                  />
                </div>
              </div>
            </div>

            <!-- Error global -->
            <div v-if="errorSocio" class="ds-callout" role="alert" style="background: #fee2e2; color: #991b1b;">
              <ExclamationCircleIcon class="w-5 h-5 ds-callout__icon" style="color: #b91c1c;" />
              <div>{{ errorSocio }}</div>
            </div>

            <!-- Acciones (mismo scroll, safe-area) -->
            <div class="pt-4 border-t border-[color:var(--surface-divider)] space-y-2.5">
              <button
                type="submit"
                class="btn-modal-primary relative w-full overflow-hidden"
                :disabled="guardando"
              >
                <span :class="['inline-flex items-center justify-center gap-2 transition-opacity', guardando ? 'opacity-0' : 'opacity-100']">
                  <CheckIcon class="w-5 h-5" />
                  {{ socioEditando ? 'Guardar cambios' : 'Agregar socio' }}
                </span>
                <span
                  v-if="guardando"
                  class="absolute inset-0 inline-flex items-center justify-center gap-2"
                >
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando…</span>
                </span>
              </button>
              <button
                type="button"
                class="btn-modal-secondary w-full"
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
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 pb-5 space-y-4 bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="programarNatiscrollModalCuotasSocio"
        >
          <div v-if="loadingCuotasSocio" class="text-center py-10">
            <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p class="text-gray-500 text-sm">Cargando cuotas…</p>
          </div>

          <div v-else-if="cuotasSocioPorMes.length === 0" class="text-center py-10 px-2">
            <p class="text-gray-500 text-sm">No hay cuotas registradas</p>
          </div>

          <template v-else>
            <!-- Resumen de totales — siempre visible al inicio -->
            <section class="cuotas-resumen" aria-label="Resumen de cuotas">
              <div class="cuotas-resumen__top">
                <div class="cuotas-resumen__total">
                  <p class="cuotas-resumen__total-label">Total adeudado</p>
                  <p
                    class="cuotas-resumen__total-valor"
                    :class="totalesCuotasSocioModal.totalAdeudado > 0 ? 'is-debe' : 'is-aldia'"
                  >
                    $ {{ formatMoney(totalesCuotasSocioModal.totalAdeudado) }}
                  </p>
                  <p class="cuotas-resumen__total-sub">
                    Pagado $ {{ formatMoney(totalesCuotasSocioModal.totalPagado) }}
                    de $ {{ formatMoney(totalesCuotasSocioModal.totalObligacion) }}
                  </p>
                </div>
                <div class="cuotas-resumen__progress" aria-hidden="true">
                  <div
                    class="cuotas-resumen__progress-bar"
                    :style="{
                      width: totalesCuotasSocioModal.totalObligacion > 0
                        ? Math.min(100, Math.round((totalesCuotasSocioModal.totalPagado / totalesCuotasSocioModal.totalObligacion) * 100)) + '%'
                        : '0%'
                    }"
                  ></div>
                </div>
              </div>
              <div class="cuotas-resumen__chips">
                <div class="cuotas-resumen__chip cuotas-resumen__chip--pagadas">
                  <p class="cuotas-resumen__chip-valor">{{ totalesCuotasSocioModal.pagadas }}</p>
                  <p class="cuotas-resumen__chip-label">Pagadas</p>
                </div>
                <div
                  v-if="totalesCuotasSocioModal.parciales > 0"
                  class="cuotas-resumen__chip cuotas-resumen__chip--parciales"
                >
                  <p class="cuotas-resumen__chip-valor">{{ totalesCuotasSocioModal.parciales }}</p>
                  <p class="cuotas-resumen__chip-label">Parciales</p>
                </div>
                <div class="cuotas-resumen__chip cuotas-resumen__chip--pendientes">
                  <p class="cuotas-resumen__chip-valor">{{ totalesCuotasSocioModal.pendientes }}</p>
                  <p class="cuotas-resumen__chip-label">Pendientes</p>
                </div>
                <div class="cuotas-resumen__chip cuotas-resumen__chip--mora">
                  <p class="cuotas-resumen__chip-valor">{{ totalesCuotasSocioModal.mora }}</p>
                  <p class="cuotas-resumen__chip-label">En mora</p>
                </div>
              </div>
            </section>

            <!-- Móvil (<md): tarjetas compactas. Wrapper div para que md:hidden gane sobre el display:flex scoped del <ul>. -->
            <div class="md:hidden">
              <ul class="cuotas-mobile-list">
                <li
                  v-for="(cuotaData, idx) in cuotasSocioPorMes"
                  :key="`m-${cuotaData.id}-${idx}`"
                  class="cuotas-mobile-card"
                  :class="[
                    cuotaData.estado === 'pagada' || (cuotaData.valorPagado || 0) >= totalObligacionCuotaSocioModal(cuotaData) ? 'cuotas-mobile-card--pagada' : '',
                    cuotaData.estado === 'mora' && animacionesCuotasMora ? 'cuotas-mobile-card--mora' : '',
                    !esVisor && cuotaData.mes != null ? 'cuotas-mobile-card--clickable' : ''
                  ]"
                  :tabindex="!esVisor && cuotaData.mes != null ? 0 : -1"
                  :role="!esVisor && cuotaData.mes != null ? 'button' : null"
                  @click="handleClickFilaCuotaSocioModal(cuotaData)"
                  @keydown.enter.prevent="handleClickFilaCuotaSocioModal(cuotaData)"
                >
                  <!-- Fila 1: Q-badge + mes + valor + estado -->
                  <div class="cuotas-mobile-card__row">
                    <span
                      class="cuotas-mobile-card__qbadge"
                      :class="metaPeriodoCuotaSocioModal(cuotaData).cls"
                      :title="etiquetaPeriodoCuotaSocioModal(cuotaData)"
                      :aria-label="etiquetaPeriodoCuotaSocioModal(cuotaData)"
                    >
                      {{ metaPeriodoCuotaSocioModal(cuotaData).short }}
                    </span>
                    <p class="cuotas-mobile-card__mes">
                      {{ etiquetaMesAnioCuotaSocioModal(cuotaData) }}
                    </p>
                    <p class="cuotas-mobile-card__valor">
                      $ {{ formatMoney(getMontoValorCuotaSocioModal(cuotaData)) }}
                    </p>
                    <span
                      class="cuotas-mobile-card__badge"
                      :class="clasesEstadoCuotaSocioModal(cuotaData).badge"
                    >
                      {{ etiquetaEstadoCuotaSocioModal(cuotaData) }}
                    </span>
                  </div>
                  <!-- Fila 2: subetiqueta + acción WhatsApp -->
                  <div class="cuotas-mobile-card__sub-row">
                    <p class="cuotas-mobile-card__sub">
                      {{ subetiquetaValorCuotaSocioModal(cuotaData) }}
                    </p>
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                      type="button"
                      class="cuotas-mobile-card__wsp"
                      aria-label="Enviar recordatorio por WhatsApp"
                      @click.stop="enviarWhatsAppCuota(cuotaData)"
                    >
                      <ChatBubbleLeftIcon class="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

          <!-- Desktop (md+): rejilla compacta de 5 columnas -->
          <div class="hidden md:block rounded-xl border border-gray-200/90 bg-white overflow-hidden shadow-sm pb-2">
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
                :key="`d-${cuotaData.id}-${idx}`"
                role="row"
                class="grid grid-cols-[minmax(0,4.5rem)_minmax(0,3.25rem)_1fr_minmax(0,4.25rem)_2.25rem] gap-x-1.5 items-center px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-natillera-500/40 focus-visible:ring-inset"
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
                  <p class="text-[10px] text-gray-500 leading-tight mt-0.5 truncate">
                    {{ subetiquetaValorCuotaSocioModal(cuotaData) }}
                  </p>
                </div>
                <div class="flex flex-col items-end gap-0.5 min-w-0 justify-self-end">
                  <span
                    class="inline-flex max-w-full items-center justify-center rounded-md border px-1 py-0.5 text-[11px] font-bold leading-tight"
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
          </template>
        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalCuotasSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo: siempre visible. Hereda safe-area-bottom. -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-4 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          class="btn-modal-secondary w-full"
          @click="cerrarModalCuotasSocio"
        >
          Cerrar
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Eliminar Socio — patrón estándar (skill natillerapp-modals + DS) -->
    <ModalWrapper
      :show="!!socioAEliminar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="!eliminando && (socioAEliminar = null)"
    >
      <!-- Cabecera danger (rojo): comunica acción irreversible -->
      <div class="flex-shrink-0 bg-[color:var(--brand-danger)] text-white">
        <!-- Móvil: una sola fila -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <ExclamationTriangleIcon class="w-5 h-5 text-[color:var(--brand-danger)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              Eliminar socio
            </h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              Acción irreversible
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="eliminando"
            @click="socioAEliminar = null"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <!-- Desktop: icono arriba centrado, X en flex -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ExclamationTriangleIcon class="w-6 h-6 text-[color:var(--brand-danger)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              Eliminar socio
            </h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">
              Acción irreversible
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="eliminando"
            @click="socioAEliminar = null"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo scrolleable -->
      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalEliminarSocio"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalEliminarSocio"
        >
          <!-- Pregunta principal -->
          <div class="text-center">
            <p class="font-display font-bold text-slate-800 text-base sm:text-lg leading-tight">
              ¿Estás completamente seguro?
            </p>
            <p class="text-sm text-slate-600 mt-1.5 leading-snug">
              Estás a punto de eliminar al socio
              <strong class="text-[color:var(--brand-danger)]">«{{ socioAEliminar.socio?.nombre }}»</strong>
              de esta natillera.
            </p>
          </div>

          <!-- Advertencia: callout danger -->
          <div class="modal-callout-danger">
            <div class="flex items-start gap-2.5">
              <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 text-[color:var(--brand-danger)] mt-0.5" />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-[color:var(--brand-danger)] text-sm">
                  Se perderá toda la información
                </p>
                <p class="text-xs text-red-700 mt-0.5">
                  Esta acción eliminará permanentemente:
                </p>
                <ul class="mt-2 space-y-1.5 text-xs text-red-700">
                  <li class="flex items-start gap-1.5">
                    <CheckIcon class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Todas las cuotas</strong> (pagadas y pendientes)</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <CheckIcon class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Todos los préstamos</strong> y sus pagos</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <CheckIcon class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Todas las multas</strong> y sanciones</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <CheckIcon class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Todo el historial</strong> de comprobantes</span>
                  </li>
                  <li class="flex items-start gap-1.5">
                    <CheckIcon class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Registros financieros</strong> asociados</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Aviso de alcance: solo callout sutil -->
          <div class="ds-callout">
            <InformationCircleIcon class="w-5 h-5 ds-callout__icon" />
            <div>
              Solo se elimina de esta natillera; los datos en otras natilleras del socio no se ven afectados.
            </div>
          </div>
        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalEliminarSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo: siempre visible -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row gap-2.5">
        <button
          type="button"
          class="btn-modal-secondary flex-1"
          :disabled="eliminando"
          @click="socioAEliminar = null"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="ds-btn ds-btn--danger flex-1"
          :disabled="eliminando"
          @click="eliminarSocioConfirmado"
        >
          <svg
            v-if="eliminando"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <TrashIcon v-else class="w-4 h-4" />
          {{ eliminando ? 'Eliminando…' : 'Sí, eliminar' }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Desactivar Socio — patrón estándar (skill natillerapp-modals + DS) -->
    <ModalWrapper
      :show="!!socioADesactivar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="!desactivando && cerrarModalDesactivar()"
    >
      <!-- Cabecera warning (ámbar): comunica acción reversible pero crítica -->
      <div class="flex-shrink-0 bg-[color:var(--brand-warning)] text-white">
        <!-- Móvil: una sola fila -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <XCircleIcon class="w-5 h-5 text-[color:var(--brand-warning)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              Desactivar socio
            </h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              {{ socioADesactivar?.socio?.nombre }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="desactivando"
            @click="cerrarModalDesactivar()"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <!-- Desktop -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <XCircleIcon class="w-6 h-6 text-[color:var(--brand-warning)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              Desactivar socio
            </h3>
            <p class="text-xs text-white/85 leading-snug mt-1 truncate max-w-[20rem]">
              {{ socioADesactivar?.socio?.nombre }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="desactivando"
            @click="cerrarModalDesactivar()"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo scrolleable -->
      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalDesactivarSocio"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalDesactivarSocio"
        >

          <!-- 1. Sanción por retiro (toggle) -->
          <button
            type="button"
            class="modal-toggle-card"
            :class="{ 'is-active': desactivarSancionar }"
            :aria-pressed="desactivarSancionar"
            @click="desactivarSancionar = !desactivarSancionar"
          >
            <span class="modal-toggle-card__check" aria-hidden="true">
              <CheckIcon v-if="desactivarSancionar" class="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <span class="min-w-0 flex-1 text-left">
              <span class="block font-display font-semibold text-slate-800 text-sm">
                Aplicar sanción por retiro
              </span>
              <span class="block text-xs text-slate-500 mt-0.5 leading-snug">
                Descontar un porcentaje del ahorro para el fondo de la natillera.
              </span>
            </span>
          </button>

          <!-- 1.b Porcentaje de sanción -->
          <div v-if="desactivarSancionar" class="space-y-1.5">
            <label for="desactivar-porcentaje" class="ds-label">
              Porcentaje de sanción (%)
            </label>
            <input
              id="desactivar-porcentaje"
              v-model.number="desactivarPorcentajeSancion"
              type="number"
              min="0"
              max="100"
              step="0.5"
              inputmode="decimal"
              class="ds-input"
              placeholder="0"
            />
          </div>

          <!-- 2. Resumen del socio -->
          <section>
            <h4 class="ds-overline mb-2">Resumen del socio</h4>
            <div class="modal-data-list">
              <div class="modal-data-list__row">
                <span class="modal-data-list__label">Total ahorrado</span>
                <span v-if="loadingTotalesDesactivar" class="modal-data-list__value modal-data-list__value--muted">Cargando…</span>
                <span v-else class="modal-data-list__value modal-data-list__value--positive tabular-nums">
                  ${{ formatMoney(totalesDesactivar.totalAhorrado) }}
                </span>
              </div>
              <div class="modal-data-list__row">
                <span class="modal-data-list__label">Entregado en actividades</span>
                <span v-if="loadingTotalesDesactivar" class="modal-data-list__value modal-data-list__value--muted">—</span>
                <span v-else class="modal-data-list__value tabular-nums">
                  ${{ formatMoney(totalesDesactivar.totalActividades) }}
                </span>
              </div>
              <div class="modal-data-list__row">
                <span class="modal-data-list__label">Pagado en sanciones</span>
                <span v-if="loadingTotalesDesactivar" class="modal-data-list__value modal-data-list__value--muted">—</span>
                <span v-else class="modal-data-list__value modal-data-list__value--danger tabular-nums">
                  ${{ formatMoney(totalesDesactivar.totalSancionesPagadas) }}
                </span>
              </div>
            </div>
          </section>

          <!-- 3. Liquidación -->
          <section>
            <h4 class="ds-overline mb-2">Liquidación al desactivar</h4>
            <div class="modal-liquidacion">
              <div class="modal-liquidacion__row">
                <span class="modal-liquidacion__label">Entregar al socio</span>
                <span class="modal-liquidacion__value modal-liquidacion__value--main tabular-nums">
                  ${{ formatMoney(valorEntregarDesactivar) }}
                </span>
              </div>
              <div v-if="desactivarSancionar" class="modal-liquidacion__row">
                <span class="modal-liquidacion__label">Para el fondo (sanción)</span>
                <span class="modal-liquidacion__value modal-liquidacion__value--warning tabular-nums">
                  ${{ formatMoney(valorFondoDesactivar) }}
                </span>
              </div>
            </div>
          </section>

          <!-- 4. Forma de pago -->
          <section>
            <h4 class="ds-overline mb-2">Forma de pago</h4>
            <p class="text-[11px] text-slate-500 leading-snug mb-2">
              El total (entregar + sanción) se descontará en cuadre de caja con esta forma de pago.
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="modal-segmented"
                :class="{ 'is-active': desactivarFormaPago === 'efectivo' }"
                :aria-pressed="desactivarFormaPago === 'efectivo'"
                @click="desactivarFormaPago = 'efectivo'"
              >
                <BanknotesIcon class="w-4 h-4" />
                Efectivo
              </button>
              <button
                type="button"
                class="modal-segmented"
                :class="{ 'is-active': desactivarFormaPago === 'transferencia' }"
                :aria-pressed="desactivarFormaPago === 'transferencia'"
                @click="desactivarFormaPago = 'transferencia'"
              >
                <BuildingOffice2Icon class="w-4 h-4" />
                Transferencia
              </button>
            </div>
          </section>

        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalDesactivarSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row gap-2.5">
        <button
          type="button"
          class="btn-modal-secondary flex-1"
          :disabled="desactivando"
          @click="cerrarModalDesactivar()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="ds-btn modal-btn-warning flex-1"
          :disabled="desactivando"
          @click="confirmarDesactivarSocio"
        >
          <svg
            v-if="desactivando"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <XCircleIcon v-else class="w-4 h-4" />
          {{ desactivando ? 'Desactivando…' : 'Confirmar desactivar' }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Activar Socio — patrón estándar (skill natillerapp-modals + DS) -->
    <ModalWrapper
      :show="!!socioAActivar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="!activando && cerrarModalActivar()"
    >
      <!-- Cabecera success (verde) — reactivación positiva -->
      <div class="flex-shrink-0 bg-[color:var(--brand-success)] text-white">
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <CheckCircleIcon class="w-5 h-5 text-[color:var(--brand-success)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              Activar socio
            </h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              {{ socioAActivar?.socio?.nombre }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="activando"
            @click="cerrarModalActivar()"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-6 h-6 text-[color:var(--brand-success)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              Activar socio
            </h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem] truncate">
              {{ socioAActivar?.socio?.nombre }}
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="activando"
            @click="cerrarModalActivar()"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo scrolleable -->
      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalActivarSocio"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalActivarSocio"
        >
          <div class="text-center">
            <p class="font-display font-bold text-slate-800 text-base sm:text-lg leading-tight">
              ¿Reactivar a este socio?
            </p>
            <p class="text-sm text-slate-600 mt-1.5 leading-snug">
              <strong class="text-[color:var(--brand-success)]">«{{ socioAActivar?.socio?.nombre }}»</strong>
              volverá a estar activo en esta natillera.
            </p>
          </div>

          <div class="modal-callout-success">
            <CheckCircleIcon class="w-5 h-5 flex-shrink-0 text-[color:var(--brand-success)] mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[color:var(--brand-success)] text-sm">
                Movimientos automáticos
              </p>
              <p class="text-xs text-emerald-800/85 mt-0.5 leading-snug">
                Si al desactivarse se generó liquidación (comprobante de salida), se revertirán automáticamente los movimientos de caja y la sanción por retiro asociados.
              </p>
            </div>
          </div>

          <div class="ds-callout">
            <InformationCircleIcon class="w-5 h-5 ds-callout__icon" />
            <div>
              Las cuotas existentes y el historial del socio no se ven alterados; solo cambia su estado a activo.
            </div>
          </div>
        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalActivarSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo: siempre visible -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row gap-2.5">
        <button
          type="button"
          class="btn-modal-secondary flex-1"
          :disabled="activando"
          @click="cerrarModalActivar()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-modal-primary flex-1"
          :disabled="activando"
          @click="confirmarActivarSocio"
        >
          <svg
            v-if="activando"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <CheckCircleIcon v-else class="w-4 h-4" />
          {{ activando ? 'Activando…' : 'Confirmar activar' }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Comprobante de Desactivación — patrón estándar (skill natillerapp-modals + DS) -->
    <ModalWrapper
      :show="!!comprobanteDesactivacion"
      :z-index="55"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="!generandoImagenDesactivacion && cerrarComprobanteDesactivacion()"
    >
      <!-- Cabecera warning (ámbar) — continuidad visual con la modal de desactivar -->
      <div class="flex-shrink-0 bg-[color:var(--brand-warning)] text-white">
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <DocumentTextIcon class="w-5 h-5 text-[color:var(--brand-warning)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              Comprobante de salida
            </h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              Liquidación por salida de la natillera
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="generandoImagenDesactivacion"
            @click="cerrarComprobanteDesactivacion()"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <DocumentTextIcon class="w-6 h-6 text-[color:var(--brand-warning)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              Comprobante de salida
            </h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">
              Liquidación por salida de la natillera
            </p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            :disabled="generandoImagenDesactivacion"
            @click="cerrarComprobanteDesactivacion()"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo scrolleable con el ticket descargable -->
      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="scrollAreaModalComprobanteDesactivacion"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--surface-soft,#f8fafc)] overscroll-contain [-webkit-overflow-scrolling:touch] px-4 sm:px-5 py-4"
          @scroll.passive="programarNatiscrollModalComprobanteDesactivacion"
        >
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
                <div v-if="(comprobanteDesactivacion?.valorFondo || 0) > 0" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <span style="color: #991b1b; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; min-width: 0;">
                    <span style="white-space: nowrap;">Sanción por retiro</span>
                    <span style="display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 999px; background: #fecaca; color: #991b1b; font-size: 10px; font-weight: 800; line-height: 1.4; white-space: nowrap;">
                      {{ porcentajeSancionComprobante }}%
                    </span>
                  </span>
                  <span style="font-size: 13px; font-weight: 700; color: #dc2626; white-space: nowrap;">${{ formatMoney(comprobanteDesactivacion?.valorFondo) }}</span>
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

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalComprobanteDesactivacion"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-[var(--surface-soft,#f8fafc)]/95 via-[var(--surface-soft,#f8fafc)]/55 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-3 pt-10">
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

      <!-- Footer fijo: siempre visible -->
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-white px-5 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          class="ds-btn modal-btn-download flex-1"
          :disabled="generandoImagenDesactivacion"
          @click="descargarComprobanteDesactivacion"
        >
          <svg
            v-if="generandoImagenDesactivacion"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <ArrowDownTrayIcon v-else class="w-4 h-4" />
          {{ generandoImagenDesactivacion ? 'Generando…' : 'Descargar' }}
        </button>
        <button
          type="button"
          class="ds-btn modal-btn-whatsapp flex-1"
          :class="{ 'is-disabled': !comprobanteDesactivacion?.socioTelefono }"
          :disabled="generandoImagenDesactivacion || !comprobanteDesactivacion?.socioTelefono"
          @click="compartirWhatsAppDesactivacion"
        >
          <ChatBubbleLeftIcon class="w-4 h-4" />
          Compartir
        </button>
      </div>
    </ModalWrapper>

    <!--
      Modal de Progreso de Creación de Socio.
      Excepción justificada al patrón estándar (skill `natillerapp-modals`):
      es un loader transitorio (creando socio → generando cuotas → ¡listo!),
      el cuerpo cabe en altura razonable y se cierra solo al terminar. Por
      eso NO usa cabecera marca + cuerpo scrolleable + footer fijo + natiscroll;
      mantiene su diseño orgánico de “ultra moderno” con animaciones.
      Solo el botón “Cerrar” del estado de error usa `ds-btn` para coherencia.
    -->
    <ModalWrapper
      :show="modalProgreso"
      :z-index="60"
      overlay-class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      card-class="relative w-full max-w-sm"
      card-max-width="24rem"
    >
          <div class="relative w-full">
            <!-- Tarjeta principal con efecto 3D -->
            <div class="relative bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-natillera-700/20 overflow-hidden border border-white/50">
              <!-- Gradiente superior decorativo -->
              <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-natillera-600 via-natillera-700 to-natillera-800 opacity-10"></div>

              <!-- Anillos orbitales decorativos (cuando está procesando) -->
              <div v-if="!progresoCreacion.exito && !progresoCreacion.error" class="absolute inset-0 flex items-center justify-center pointer-events-none" style="top: -20px">
                <div class="w-40 h-40 border border-natillera-200/40 rounded-full animate-orbit-slow"></div>
                <div class="absolute w-32 h-32 border border-natillera-300/40 rounded-full animate-orbit-reverse"></div>
              </div>

              <div class="relative p-8 pb-10">
                <!-- Icono principal con múltiples capas de animación -->
                <div class="relative mx-auto mb-8 w-28 h-28">
                  <!-- Aura exterior pulsante -->
                  <div
                    :class="[
                      'absolute -inset-4 rounded-full transition-all duration-700',
                      progresoCreacion.exito
                        ? 'bg-natillera-500/25 animate-pulse-success'
                        : progresoCreacion.error && progresoCreacion.paso === 0
                          ? 'bg-red-400/20 animate-pulse'
                          : 'bg-gradient-to-r from-natillera-500/15 via-natillera-600/20 to-natillera-700/15 animate-pulse-slow'
                    ]"
                  ></div>

                  <!-- Anillo giratorio exterior -->
                  <div
                    v-if="!progresoCreacion.exito && progresoCreacion.paso > 0"
                    class="absolute -inset-2 rounded-full border-2 border-dashed border-natillera-400/50 animate-spin-very-slow"
                  ></div>

                  <!-- Círculo principal -->
                  <div
                    :class="[
                      'absolute inset-0 rounded-full flex items-center justify-center transition-all duration-700 transform',
                      progresoCreacion.exito
                        ? 'bg-gradient-to-br from-natillera-600 via-natillera-700 to-natillera-800 shadow-2xl shadow-natillera-700/50 scale-110'
                        : progresoCreacion.error && progresoCreacion.paso === 0
                          ? 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-500 shadow-2xl shadow-red-500/40'
                          : 'bg-gradient-to-br from-natillera-600 via-natillera-700 to-natillera-800 shadow-xl shadow-natillera-700/30'
                    ]"
                  >
                    <!-- Efecto de brillo interior -->
                    <div class="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent"></div>
                    
                    <!-- Estado: Creando socio -->
                    <template v-if="progresoCreacion.paso === 1">
                      <div class="relative">
                        <UserIcon class="w-12 h-12 text-white drop-shadow-lg animate-bounce-gentle" />
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <PlusIcon class="w-3 h-3 text-natillera-700" />
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
                    progresoCreacion.exito ? 'text-natillera-700' :
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
                      class="h-full bg-gradient-to-r from-natillera-600 to-natillera-700 transition-all duration-700 ease-out rounded-full"
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
                            ? 'bg-gradient-to-br from-natillera-600 to-natillera-800 text-white shadow-lg shadow-natillera-700/30 scale-110'
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
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 1 ? 'text-natillera-700' : 'text-gray-400']">Socio</span>
                    </div>

                    <!-- Paso 2: Cuotas -->
                    <div class="flex flex-col items-center">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 2
                            ? 'bg-gradient-to-br from-natillera-600 to-natillera-800 text-white shadow-lg shadow-natillera-700/30 scale-110'
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
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 2 ? 'text-natillera-700' : 'text-gray-400']">Cuotas</span>
                    </div>

                    <!-- Paso 3: Listo -->
                    <div class="flex flex-col items-center">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 3
                            ? 'bg-gradient-to-br from-natillera-600 to-natillera-800 text-white shadow-lg shadow-natillera-700/30 scale-110'
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
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 3 ? 'text-natillera-700' : 'text-gray-400']">¡Listo!</span>
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
                      <div class="absolute -inset-1 bg-gradient-to-r from-natillera-600 via-natillera-700 to-natillera-800 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>

                      <div class="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-natillera-50 to-natillera-100 border border-natillera-200/60 rounded-2xl">
                        <div class="w-10 h-10 bg-gradient-to-br from-natillera-600 to-natillera-800 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-700/30">
                          <SparklesIcon class="w-5 h-5 text-white" />
                        </div>
                        <div class="text-left">
                          <p class="text-2xl font-bold bg-gradient-to-r from-natillera-700 to-natillera-800 bg-clip-text text-transparent">
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
                    type="button"
                    class="ds-btn ds-btn--danger w-full sm:w-auto sm:px-8"
                    @click="cerrarModalProgreso"
                  >
                    <XMarkIcon class="w-4 h-4" />
                    Cerrar
                  </button>
                </div>
              </div>

              <!-- Barra de progreso inferior decorativa -->
              <div class="h-1.5 bg-gray-100">
                <div
                  class="h-full bg-gradient-to-r from-natillera-600 via-natillera-700 to-natillera-800 transition-all duration-700 ease-out"
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
import { TOURS_ENABLED } from '../../config/toursEnabled'
import { shouldShowNatilleraMenuTour, startNatilleraMenuTour } from '../../composables/useNatilleraMenuTour'
import {
  shouldShowPrimerSocioSociosNavTour,
  startPrimerSocioSociosNavTour,
  consumePendingPrimerSocioNavTour
} from '../../composables/usePrimerSocioSociosNavTour'
import {
  setPendingPrimerSocioCuotasMesTour,
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
  ChevronLeftIcon,
  ChevronRightIcon,
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
// Nota: la X de la cabecera es siempre visible en formularios largos (skill `natillerapp-modals`),
// por eso ya no usamos `useModalBodyScrollOverflow` para alternar su visibilidad.
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


// Totales agregados de la modal de cuotas del socio (mostrados al inicio)
const totalesCuotasSocioModal = computed(() => {
  const cuotas = cuotasSocioPorMes.value || []
  let pagadas = 0
  let parciales = 0
  let pendientes = 0
  let mora = 0
  let totalObligacion = 0
  let totalPagado = 0
  for (const c of cuotas) {
    const obligacion = (c.valorCuota || 0) + (c.sancion || 0)
    const pagado = c.valorPagado || 0
    totalObligacion += obligacion
    totalPagado += Math.min(pagado, obligacion)
    if (c.estado === 'pagada' || pagado >= obligacion) {
      pagadas++
    } else if (pagado > 0 && pagado < obligacion) {
      parciales++
    } else if (c.estado === 'mora') {
      mora++
    } else {
      pendientes++ // pendiente, programada u otro
    }
  }
  const totalAdeudado = Math.max(0, totalObligacion - totalPagado)
  return {
    total: cuotas.length,
    pagadas,
    parciales,
    pendientes,
    mora,
    totalObligacion,
    totalPagado,
    totalAdeudado,
  }
})

// Porcentaje de sanción aplicado a mostrar en la línea "Sanción por retiro" del comprobante.
// Si vino explícito (comprobante recién generado) lo usamos; si no, lo derivamos de los importes.
const porcentajeSancionComprobante = computed(() => {
  const c = comprobanteDesactivacion.value
  if (!c) return '0'
  let pct = Number(c.porcentajeSancion)
  if (!Number.isFinite(pct) || pct <= 0) {
    const fondo = Number(c.valorFondo) || 0
    const entregar = Number(c.valorEntregar) || 0
    const base = fondo + entregar
    pct = base > 0 ? (fondo / base) * 100 : 0
  }
  if (pct <= 0) return '0'
  const redondeado = Math.round(pct * 10) / 10
  return Number.isInteger(redondeado) ? String(redondeado) : redondeado.toFixed(1).replace(/\.0$/, '')
})

const errorSocio = ref('')
const errorTelefonoDuplicado = ref(false)
const mostrarContacto = ref(false)
const mostrarAdvertenciaCuota = ref(false)
const cuotasSocio = ref([])
const loadingDetalle = ref(false)
const busqueda = ref('')
const inputBusquedaSocios = ref(null)
/** Evita repetir el foco automático al entrar (p. ej. al importar más socios) */
const enfocoBusquedaInicialHecho = ref(false)
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

// FAB flotante: aparece cuando el header sale del viewport
const headerRef = ref(null)
const headerVisible = ref(true)
let headerObserver = null

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
const inputArchivoCsv = ref(null)
const sociosPreview = ref([])
const errorImportar = ref('')
const exitoImportar = ref('')
const importando = ref(false)

// Sección activa del modal de detalle (solo una a la vez)
const seccionActiva = ref('cuotasPagadas')  // 'cuotasPagadas', 'contacto' o null (el resumen financiero es fijo, no desplegable)

// ─────────────────────────────────────────────────────────────
// Natiscroll para modales estandarizadas (skill natillerapp-modals: obligatorio
// en cualquier modal con cuerpo scrolleable). Mantener cada bloque al lado del
// resto para localizarlo rápido.
// Sigue el mismo patrón que `cuotasSocio` y `agregarSocio`: ref del scroll,
// ref booleana, RAF, función de actualización y watch que reactive cuando se
// abre el modal o cambia el contenido.
// ─────────────────────────────────────────────────────────────

// Natiscroll · Modal Detalle del Socio
const scrollAreaModalDetalleSocio = ref(null)
const hayNatiscrollModalDetalleSocio = ref(false)
let rafNatiscrollModalDetalleSocio = null

function actualizarNatiscrollModalDetalleSocio() {
  const el = scrollAreaModalDetalleSocio.value
  if (!el || !modalDetalle.value) {
    hayNatiscrollModalDetalleSocio.value = false
    return
  }
  hayNatiscrollModalDetalleSocio.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalDetalleSocio() {
  if (rafNatiscrollModalDetalleSocio != null) cancelAnimationFrame(rafNatiscrollModalDetalleSocio)
  rafNatiscrollModalDetalleSocio = requestAnimationFrame(() => {
    rafNatiscrollModalDetalleSocio = null
    actualizarNatiscrollModalDetalleSocio()
  })
}

watch(
  [modalDetalle, loadingDetalle, () => cuotasSocio.value.length, seccionActiva],
  () => {
    if (modalDetalle.value) {
      nextTick(() => programarNatiscrollModalDetalleSocio())
    } else {
      hayNatiscrollModalDetalleSocio.value = false
    }
  },
  { flush: 'post' }
)

// Natiscroll · Modal Desactivar Socio
const scrollAreaModalDesactivarSocio = ref(null)
const hayNatiscrollModalDesactivarSocio = ref(false)
let rafNatiscrollModalDesactivarSocio = null

function actualizarNatiscrollModalDesactivarSocio() {
  const el = scrollAreaModalDesactivarSocio.value
  if (!el || !socioADesactivar.value) {
    hayNatiscrollModalDesactivarSocio.value = false
    return
  }
  hayNatiscrollModalDesactivarSocio.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalDesactivarSocio() {
  if (rafNatiscrollModalDesactivarSocio != null) cancelAnimationFrame(rafNatiscrollModalDesactivarSocio)
  rafNatiscrollModalDesactivarSocio = requestAnimationFrame(() => {
    rafNatiscrollModalDesactivarSocio = null
    actualizarNatiscrollModalDesactivarSocio()
  })
}

watch(
  [
    socioADesactivar,
    desactivarSancionar,
    desactivarPorcentajeSancion,
    loadingTotalesDesactivar,
  ],
  () => {
    if (socioADesactivar.value) {
      nextTick(() => programarNatiscrollModalDesactivarSocio())
    } else {
      hayNatiscrollModalDesactivarSocio.value = false
    }
  },
  { flush: 'post' }
)

// Natiscroll · Modal Eliminar Socio
const scrollAreaModalEliminarSocio = ref(null)
const hayNatiscrollModalEliminarSocio = ref(false)
let rafNatiscrollModalEliminarSocio = null

function actualizarNatiscrollModalEliminarSocio() {
  const el = scrollAreaModalEliminarSocio.value
  if (!el || !socioAEliminar.value) {
    hayNatiscrollModalEliminarSocio.value = false
    return
  }
  hayNatiscrollModalEliminarSocio.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalEliminarSocio() {
  if (rafNatiscrollModalEliminarSocio != null) cancelAnimationFrame(rafNatiscrollModalEliminarSocio)
  rafNatiscrollModalEliminarSocio = requestAnimationFrame(() => {
    rafNatiscrollModalEliminarSocio = null
    actualizarNatiscrollModalEliminarSocio()
  })
}

watch(socioAEliminar, () => {
  if (socioAEliminar.value) {
    nextTick(() => programarNatiscrollModalEliminarSocio())
  } else {
    hayNatiscrollModalEliminarSocio.value = false
  }
}, { flush: 'post' })

// Natiscroll · Modal Comprobante de Salida (ticket descargable)
const scrollAreaModalComprobanteDesactivacion = ref(null)
const hayNatiscrollModalComprobanteDesactivacion = ref(false)
let rafNatiscrollModalComprobanteDesactivacion = null

function actualizarNatiscrollModalComprobanteDesactivacion() {
  const el = scrollAreaModalComprobanteDesactivacion.value
  if (!el || !comprobanteDesactivacion.value) {
    hayNatiscrollModalComprobanteDesactivacion.value = false
    return
  }
  hayNatiscrollModalComprobanteDesactivacion.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalComprobanteDesactivacion() {
  if (rafNatiscrollModalComprobanteDesactivacion != null) cancelAnimationFrame(rafNatiscrollModalComprobanteDesactivacion)
  rafNatiscrollModalComprobanteDesactivacion = requestAnimationFrame(() => {
    rafNatiscrollModalComprobanteDesactivacion = null
    actualizarNatiscrollModalComprobanteDesactivacion()
  })
}

watch(comprobanteDesactivacion, () => {
  if (comprobanteDesactivacion.value) {
    nextTick(() => programarNatiscrollModalComprobanteDesactivacion())
  } else {
    hayNatiscrollModalComprobanteDesactivacion.value = false
  }
}, { flush: 'post' })

// Natiscroll · Modal Importar CSV
const scrollAreaModalImportar = ref(null)
const hayNatiscrollModalImportar = ref(false)
let rafNatiscrollModalImportar = null

function actualizarNatiscrollModalImportar() {
  const el = scrollAreaModalImportar.value
  if (!el || !modalImportar.value) {
    hayNatiscrollModalImportar.value = false
    return
  }
  hayNatiscrollModalImportar.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalImportar() {
  if (rafNatiscrollModalImportar != null) cancelAnimationFrame(rafNatiscrollModalImportar)
  rafNatiscrollModalImportar = requestAnimationFrame(() => {
    rafNatiscrollModalImportar = null
    actualizarNatiscrollModalImportar()
  })
}

watch(
  [modalImportar, () => sociosPreview.value.length, errorImportar, exitoImportar],
  () => {
    if (modalImportar.value) {
      nextTick(() => programarNatiscrollModalImportar())
    } else {
      hayNatiscrollModalImportar.value = false
    }
  },
  { flush: 'post' }
)

// Natiscroll · Modal Activar Socio
const scrollAreaModalActivarSocio = ref(null)
const hayNatiscrollModalActivarSocio = ref(false)
let rafNatiscrollModalActivarSocio = null

function actualizarNatiscrollModalActivarSocio() {
  const el = scrollAreaModalActivarSocio.value
  if (!el || !socioAActivar.value) {
    hayNatiscrollModalActivarSocio.value = false
    return
  }
  hayNatiscrollModalActivarSocio.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalActivarSocio() {
  if (rafNatiscrollModalActivarSocio != null) cancelAnimationFrame(rafNatiscrollModalActivarSocio)
  rafNatiscrollModalActivarSocio = requestAnimationFrame(() => {
    rafNatiscrollModalActivarSocio = null
    actualizarNatiscrollModalActivarSocio()
  })
}

watch(socioAActivar, () => {
  if (socioAActivar.value) {
    nextTick(() => programarNatiscrollModalActivarSocio())
  } else {
    hayNatiscrollModalActivarSocio.value = false
  }
}, { flush: 'post' })

// Filtros y paginación de la tabla
const filtroEstado = ref('todos')           // 'todos' | 'activo' | 'inactivo'
const filtroPeriodicidad = ref('todos')     // 'todos' | 'mensual' | 'quincenal'
const paginaActual = ref(1)

const ITEMS_POR_PAGINA_OPCIONES = [10, 25, 50, 100]
const ITEMS_POR_PAGINA_DEFECTO = 10
const STORAGE_KEY_ITEMS_POR_PAGINA = 'socios:itemsPorPagina'

function leerItemsPorPaginaInicial() {
  try {
    const guardado = Number(localStorage.getItem(STORAGE_KEY_ITEMS_POR_PAGINA))
    if (ITEMS_POR_PAGINA_OPCIONES.includes(guardado)) return guardado
  } catch { /* localStorage no disponible (SSR / privado) */ }
  return ITEMS_POR_PAGINA_DEFECTO
}

const itemsPorPagina = ref(leerItemsPorPaginaInicial())

watch(itemsPorPagina, (nv) => {
  paginaActual.value = 1
  try { localStorage.setItem(STORAGE_KEY_ITEMS_POR_PAGINA, String(nv)) } catch { /* noop */ }
})

const sociosFiltrados = computed(() => {
  let res = sociosStore.sociosNatillera
  const termino = busqueda.value.trim().toLowerCase()
  if (termino) {
    res = res.filter(sn =>
      sn.socio?.nombre?.toLowerCase().includes(termino) ||
      sn.socio?.documento?.toLowerCase().includes(termino) ||
      sn.socio?.telefono?.includes(termino) ||
      sn.socio?.email?.toLowerCase().includes(termino)
    )
  }
  if (filtroEstado.value !== 'todos') {
    res = res.filter(sn => sn.estado === filtroEstado.value)
  }
  if (filtroPeriodicidad.value !== 'todos') {
    res = res.filter(sn => sn.periodicidad === filtroPeriodicidad.value)
  }
  return [...res].sort((a, b) =>
    (a.socio?.nombre || '').localeCompare(b.socio?.nombre || '', 'es', { sensitivity: 'base' })
  )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(sociosFiltrados.value.length / itemsPorPagina.value)))

const sociosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * itemsPorPagina.value
  return sociosFiltrados.value.slice(start, start + itemsPorPagina.value)
})

const rangoMostrado = computed(() => {
  const total = sociosFiltrados.value.length
  if (total === 0) return '0'
  const start = (paginaActual.value - 1) * itemsPorPagina.value + 1
  const end = Math.min(start + itemsPorPagina.value - 1, total)
  return `${start}-${end}`
})

const paginasVisibles = computed(() => {
  const total = totalPaginas.value
  const cur = paginaActual.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

watch([busqueda, filtroEstado, filtroPeriodicidad], () => {
  paginaActual.value = 1
})

watch(totalPaginas, (nv) => {
  if (paginaActual.value > nv) paginaActual.value = nv
})

// inputmode del input de búsqueda. Se setea a 'none' durante el focus inicial
// programático en móvil para que el teclado virtual NO se abra automáticamente.
// El primer pointerdown / touchstart / keydown real del usuario lo restaura a 'text'.
const inputModeBusqueda = ref('text')
const tecladoSoftBusquedaRehabilitado = ref(false)

function habilitarTecladoSoftBusqueda() {
  if (tecladoSoftBusquedaRehabilitado.value) return
  tecladoSoftBusquedaRehabilitado.value = true
  inputModeBusqueda.value = 'text'
}

function enfocarInputBusquedaSocios() {
  // En móvil, evita el teclado virtual durante el focus inicial programático.
  // Se restaurará al primer touch/click/keydown del usuario sobre el input.
  if (!tecladoSoftBusquedaRehabilitado.value && esDispositivoMovil()) {
    inputModeBusqueda.value = 'none'
  }
  nextTick(() => {
    requestAnimationFrame(() => {
      const el = inputBusquedaSocios.value
      if (!el || typeof el.focus !== 'function') return
      try {
        el.focus({ preventScroll: true })
      } catch {
        el.focus()
      }
    })
  })
}

// Al abrir la vista con lista de socios: foco en la búsqueda (una sola vez por visita)
watch(
  [cargaInicial, () => sociosStore.sociosNatillera.length],
  ([cargando, cantidad]) => {
    if (cargando || enfocoBusquedaInicialHecho.value) return
    if (cantidad === 0) return
    enfocoBusquedaInicialHecho.value = true
    enfocarInputBusquedaSocios()
  },
  { flush: 'post' }
)

const moraPorSocioId = computed(() => {
  const map = new Map()
  if (Array.isArray(sociosConCuotasEnMora.value)) {
    sociosConCuotasEnMora.value.forEach(s => map.set(s.id, s))
  }
  return map
})

function estadoCuotaSocio(sn) {
  if (!sn || sn.estado !== 'activo') return null
  return moraPorSocioId.value.has(sn.id) ? 'mora' : 'aldia'
}

function badgeEstadoClase(estado) {
  if (estado === 'activo') return 'ds-badge--success'
  if (estado === 'inactivo') return 'ds-badge--warning'
  return 'ds-badge--danger'
}

function dotEstadoClase(estado) {
  if (estado === 'activo') return 'badge-dot--success'
  if (estado === 'inactivo') return 'badge-dot--warning'
  return 'badge-dot--danger'
}

function labelEstado(estado) {
  if (estado === 'activo') return 'Activo'
  if (estado === 'inactivo') return 'Inactivo'
  return 'Expulsado'
}

function abrirDetalleFila(sn) {
  if (sn.estado === 'activo') verDetalleSocio(sn)
  else verComprobanteSalida(sn)
}

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstado.value = 'todos'
  filtroPeriodicidad.value = 'todos'
}

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

// Detectar iOS / iPadOS / iPhone / iPod (cualquier navegador, incluido Chrome iOS).
// En iOS todos los navegadores usan WebKit y NINGUNO soporta Contact Picker API.
function esIosOIpadOS() {
  const ua = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  // iPadOS 13+ se reporta como Mac con touch (Apple cambió el UA en iPadOS).
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true
  return false
}

// Detectar Safari (macOS / iOS) — no soporta Contact Picker API.
function esSafari() {
  const ua = navigator.userAgent || ''
  // Safari sin ser Chrome/Edge/Opera/Brave/Firefox
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|EdgiOS|FxiOS|OPR|OPiOS|Brave/i.test(ua)
}

// Verificar disponibilidad de la Contact Picker API al montar el componente
onMounted(() => {
  // Lista de exclusión: contextos donde la Contact Picker API NO existe.
  // Ocultar el botón directamente para no exponer una funcionalidad rota.
  if (esIosOIpadOS()) {
    razonNoDisponible.value = 'iOS no soporta la selección de contactos vía web.'
    contactPickerDisponible.value = false
    return
  }
  if (esSafari()) {
    razonNoDisponible.value = 'Safari no soporta la selección de contactos vía web.'
    contactPickerDisponible.value = false
    return
  }

  // Solo dispositivos móviles (la API es exclusivamente móvil; en desktop no existe).
  const esMovil = esDispositivoMovil()
  if (!esMovil) {
    razonNoDisponible.value = 'La función de contactos solo está disponible en dispositivos móviles'
    contactPickerDisponible.value = false
    return
  }

  // Requiere contexto seguro (HTTPS o localhost).
  if (!window.isSecureContext) {
    razonNoDisponible.value = 'Necesitas HTTPS para usar el selector de contactos.'
    contactPickerDisponible.value = false
    return
  }

  // Verificación final: la API debe existir y exponer un método select/pick callable.
  try {
    const contactsApi = navigator.contacts
    if (contactsApi && typeof contactsApi.select === 'function') {
      contactPickerDisponible.value = true
      razonNoDisponible.value = ''
    } else if (contactsApi && typeof contactsApi.pick === 'function') {
      contactPickerDisponible.value = true
      razonNoDisponible.value = ''
    } else {
      contactPickerDisponible.value = false
      razonNoDisponible.value = 'Esta función requiere Chrome o Edge actualizados en Android.'
    }
  } catch {
    contactPickerDisponible.value = false
    razonNoDisponible.value = 'No se pudo verificar la API de contactos en este navegador.'
  }

  // Debug: mostrar información en consola (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('Contact Picker API:', {
      disponible: contactPickerDisponible.value,
      esMovil,
      esIos: esIosOIpadOS(),
      esSafari: esSafari(),
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
      tieneContacts: 'contacts' in navigator,
      tieneSelect: 'contacts' in navigator && typeof navigator.contacts?.select === 'function',
      tienePick: 'contacts' in navigator && typeof navigator.contacts?.pick === 'function',
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

// FAB flotante: aparece cuando el header sale del viewport y no hay modal abierto
const mostrarFab = computed(() =>
  !esVisor.value &&
  !cargaInicial.value &&
  sociosStore.sociosNatillera.length > 0 &&
  !headerVisible.value &&
  !modalAgregar.value &&
  !modalImportar.value &&
  !modalDetalle.value &&
  !modalCuotasSocio.value &&
  !modalProgreso.value &&
  !socioAEliminar.value &&
  !socioADesactivar.value &&
  !socioAActivar.value &&
  !comprobanteDesactivacion.value
)

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
  // Activar la bandera ANTES de cualquier acción async para que cualquier
  // popstate disparado por el browser durante el ciclo del picker se ignore.
  suprimirPopstateContactos = true

  try {
    // El Contact Picker API requiere contexto seguro (HTTPS o localhost)
    if (!window.isSecureContext) {
      notificationStore.error(
        'Necesitas abrir la app por HTTPS para usar el selector de contactos.',
        'Conexión no segura',
        3500
      )
      return
    }

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
  } finally {
    // Mantener la supresión un breve lapso adicional: algunos navegadores
    // disparan popstate justo después de que la promesa del picker resuelve.
    setTimeout(() => {
      suprimirPopstateContactos = false
    }, 600)
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
            setPendingPrimerSocioCuotasMesTour(nid)
            // Vista de selección de mes (CuotasMeses); el tour guiado continúa ahí.
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
      const porcentajeSancionAplicado = desactivarSancionar.value && desactivarPorcentajeSancion.value > 0
        ? Math.min(100, Math.max(0, Number(desactivarPorcentajeSancion.value) || 0))
        : 0
      const datosComprobante = {
        socioNombre: sn.socio?.nombre || 'Socio',
        socioTelefono: sn.socio?.telefono || null,
        fecha: fechaComprobante,
        totalAhorrado: tot.totalAhorrado || 0,
        totalActividades: tot.totalActividades || 0,
        totalSancionesPagadas: tot.totalSancionesPagadas || 0,
        valorEntregar,
        valorFondo,
        porcentajeSancion: porcentajeSancionAplicado,
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

// Meta corta para el badge de quincena (móvil): label + clase de color.
function metaPeriodoCuotaSocioModal(c) {
  if (c.quincena === 1) return { short: 'Q1', cls: 'is-q1' }
  if (c.quincena === 2) return { short: 'Q2', cls: 'is-q2' }
  return { short: 'M', cls: 'is-mes' }
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

// Bandera para suprimir handlePopState mientras el Contact Picker está abierto.
// Algunos navegadores (Chrome Android, WebViews) disparan popstate al cerrar el
// picker, lo que cerraba el modal de Agregar Socio sin que el usuario lo pidiera.
let suprimirPopstateContactos = false

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
  // Si el Contact Picker está activo, ignorar el popstate: algunos navegadores
  // disparan history.back() automático al cerrar el selector de contactos y eso
  // cerraba el modal de Agregar Socio.
  if (suprimirPopstateContactos) return

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
  if (inputArchivoCsv.value) inputArchivoCsv.value.value = ''
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
    const valorFondoRow = parseFloat(row.valor_sancion) || 0
    const valorEntregarRow = parseFloat(row.valor_entregar) || 0
    const baseRecaudada = valorFondoRow + valorEntregarRow
    const porcentajeDerivado = baseRecaudada > 0 ? (valorFondoRow / baseRecaudada) * 100 : 0
    comprobanteDesactivacion.value = {
      socioNombre: row.socio_nombre || sn.socio?.nombre || 'Socio',
      socioTelefono: row.socio_telefono || sn.socio?.telefono || null,
      fecha: row.fecha,
      totalAhorrado: parseFloat(row.total_ahorrado) || 0,
      valorFondo: valorFondoRow,
      valorEntregar: valorEntregarRow,
      porcentajeSancion: porcentajeDerivado,
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
  // Observer del header para mostrar/ocultar el FAB cuando sale del viewport
  if (typeof IntersectionObserver !== 'undefined' && headerRef.value) {
    headerObserver = new IntersectionObserver(
      ([entry]) => { headerVisible.value = entry.isIntersecting },
      { threshold: 0, rootMargin: '0px 0px -8px 0px' }
    )
    headerObserver.observe(headerRef.value)
  }

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
  if (headerObserver) {
    headerObserver.disconnect()
    headerObserver = null
  }
})
</script>

<style scoped>
/* ==========================================================================
   Tabla de Socios (DS) — toolbar, tabla desktop, lista móvil, paginación
   ========================================================================== */

/* ---------- Toolbar (search + filtros) ---------- */
.socios-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--surface-divider);
  background: var(--surface-muted);
  align-items: center;
}
@media (min-width: 640px) {
  .socios-toolbar { padding: 1rem 1.25rem; gap: 0.75rem; }
}

.socios-toolbar__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid var(--surface-divider-strong);
  border-radius: var(--radius-pill);
  padding: 0.4375rem 0.875rem;
  flex: 1 1 220px;
  min-height: 44px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.socios-toolbar__search:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18);
}
.socios-toolbar__search > svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.socios-search__input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-family: var(--font-body);
  font-size: 1rem; /* ≥16px → evita zoom Safari iOS */
  line-height: 1.4;
  color: #0f172a;
  min-width: 0;
}
.socios-search__input::placeholder { color: #94a3b8; }

.socios-search__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  color: #64748b;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background-color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.socios-search__clear:hover { background: rgba(15, 23, 42, 0.06); }

.socios-toolbar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Selects custom (appearance:none acotado a esta clase, no global) */
.socios-filter {
  appearance: none;
  -webkit-appearance: none;
  background-color: #fff;
  border: 1px solid var(--surface-divider-strong);
  border-radius: var(--radius-pill);
  padding: 0.5rem 2rem 0.5rem 0.875rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  min-height: 44px;
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}
.socios-filter:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18);
}
@media (max-width: 480px) {
  .socios-filter { flex: 1; min-width: 0; }
}

/* ---------- Tabla desktop ---------- */
.socios-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.socios-table thead th {
  font-family: var(--font-brand-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #94a3b8;
  text-align: left;
  padding: 0.875rem 1rem;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--surface-divider);
  white-space: nowrap;
}
.socios-table thead th.text-right { text-align: right; }
.socios-table tbody td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  vertical-align: middle;
  font-size: 0.875rem;
  color: #334155;
}
.socios-table tbody tr:last-child td { border-bottom: 0; }

.socios-table__row {
  cursor: pointer;
  transition: background-color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}
.socios-table__row:hover { background: var(--brand-primary-soft); }
.socios-table__row:focus-visible {
  outline: none;
  background: var(--brand-primary-soft);
  box-shadow: inset 3px 0 0 var(--brand-primary);
}
.socios-table__row--inactivo {
  opacity: 0.6;
}
.socios-table__row--inactivo:hover { background: rgba(15, 23, 42, 0.03); }

/* ---------- Lista móvil: fondo lienzo para diferenciar las tarjetas blancas ---------- */
.socios-mobile-list {
  background: var(--surface-canvas);
  /* Solo espacio vertical: las tarjetas usan todo el ancho del contenedor (sin márgenes laterales) */
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

/* ---------- Tarjeta móvil ---------- */
.socios-mobile-card {
  width: 100%;
  box-sizing: border-box;
  background: var(--surface-card);
  border: 1px solid var(--surface-divider-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--transition-base),
              border-color var(--transition-base),
              transform var(--transition-fast);
}
.socios-mobile-card:active {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.socios-mobile-card--inactivo { opacity: 0.6; }

.socios-mobile-card__main {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.625rem 0.75rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--transition-base);
}

/* Métricas compactas bajo el bloque nombre/contacto */
.socios-mobile-card__metrics {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--surface-divider);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}
.socios-mobile-metric-label {
  font-family: var(--font-brand-mono);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 0.25rem;
  line-height: 1;
}

/* Sub-estado cuota más pequeño dentro de tarjeta compacta */
.cuota-status--compact {
  font-size: 0.625rem;
  margin-top: 0.125rem;
}
.cuota-status--compact::before {
  width: 4px;
  height: 4px;
}
.socios-mobile-card__main:active { background: var(--brand-primary-soft); }
.socios-mobile-card__main:focus-visible {
  outline: none;
  background: var(--brand-primary-soft);
  box-shadow: inset 3px 0 0 var(--brand-primary);
}

.socios-mobile-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.5rem 0.625rem 0.625rem;
  border-top: 1px solid var(--surface-divider);
  background: var(--surface-muted);
}

/* Pills suaves para acciones de la tarjeta móvil (no usar gradientes vibrantes) */
.card-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex: 1 1 auto;
  min-height: 32px;
  padding: 0.3125rem 0.5rem;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.75rem;
  border: 0;
  cursor: pointer;
  transition: filter var(--transition-base), transform var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.card-pill:active { transform: scale(0.97); }
.card-pill--icon {
  flex: 0 0 auto;
  min-width: 32px;
  padding: 0.3125rem;
}
.card-pill--brand   { background: var(--brand-primary-soft); color: var(--brand-primary); }
.card-pill--info    { background: #dbeafe;                   color: #1d4ed8; }
.card-pill--warning { background: #fef3c7;                   color: #b45309; }
.card-pill--danger  { background: #fee2e2;                   color: #b91c1c; }
.card-pill--brand:hover,
.card-pill--info:hover,
.card-pill--warning:hover,
.card-pill--danger:hover { filter: brightness(0.96); }

/* ---------- Badge dot (estado con punto coloreado) ---------- */
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  display: inline-block;
  flex-shrink: 0;
}
.badge-dot--success { background: var(--brand-success); }
.badge-dot--warning { background: var(--brand-warning); }
.badge-dot--danger  { background: var(--brand-danger); }

/* ---------- Sub-estado de cuota (Al día / Pendiente) ---------- */
.cuota-status {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  font-size: 0.6875rem;
  font-weight: 600;
  margin-top: 0.1875rem;
  line-height: 1.2;
}
.cuota-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
  flex-shrink: 0;
}
.cuota-status--ok   { color: var(--brand-success); }
.cuota-status--mora { color: var(--brand-warning); }

/* ---------- Botones-icono de acción ---------- */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: #64748b;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background-color var(--transition-base), color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.action-btn:hover  { background: rgba(15, 23, 42, 0.06); color: #0f172a; }
.action-btn:active { transform: scale(0.96); }
.action-btn--brand:hover   { background: var(--brand-primary-soft); color: var(--brand-primary); }
.action-btn--info:hover    { background: #dbeafe; color: #1d4ed8; }
.action-btn--warning:hover { background: #fef3c7; color: #b45309; }
.action-btn--danger:hover  { background: #fee2e2; color: #b91c1c; }

/* ---------- Paginación ---------- */
.socios-pagination {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--surface-divider);
  background: var(--surface-muted);
}
@media (min-width: 640px) {
  .socios-pagination { flex-direction: row; padding: 0.875rem 1.25rem; }
}

.socios-pagination__info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  justify-content: center;
}
@media (min-width: 640px) {
  .socios-pagination__info { justify-content: flex-start; }
}

.socios-page-size {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.socios-page-size__select {
  appearance: none;
  -webkit-appearance: none;
  background-color: #fff;
  border: 1px solid var(--surface-divider-strong);
  border-radius: var(--radius-md);
  padding: 0.3125rem 1.625rem 0.3125rem 0.625rem;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  min-height: 32px;
  cursor: pointer;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/></svg>");
  background-repeat: no-repeat;
  background-position: right 0.4375rem center;
  background-size: 0.875rem;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.socios-page-size__select:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18);
}
/* En móviles muy pequeños, el select crece para mantener área táctil cómoda */
@media (max-width: 480px) {
  .socios-page-size__select { min-height: 36px; }
}

.socios-page-btn {
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 700;
  color: #475569;
  background: transparent;
  border: 1px solid var(--surface-divider);
  cursor: pointer;
  transition: background-color var(--transition-base),
              border-color var(--transition-base),
              color var(--transition-base),
              box-shadow var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.socios-page-btn:hover:not(:disabled) {
  background: #fff;
  border-color: rgba(27, 94, 55, 0.30);
  color: var(--brand-primary);
}
.socios-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.socios-page-btn--active,
.socios-page-btn--active:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: #fff;
  box-shadow: var(--shadow-brand);
}

/* ---------- Botón compacto «+» en la cabecera (móvil) ---------- */
.socios-header-add {
  width: 44px;
  min-width: 44px;
  padding: 0;
  flex-shrink: 0;
  /* hereda colores y radio del .ds-btn--primary; aquí solo lo hacemos icon-only */
}

/* ---------- FAB flotante «+» ---------- */
.socios-fab {
  position: fixed;
  z-index: 40;
  right: max(1rem, env(safe-area-inset-right, 0px));
  bottom: calc(6.25rem + env(safe-area-inset-bottom, 0px));
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: var(--brand-primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  box-shadow: 0 12px 28px -6px rgba(15, 83, 45, 0.45),
              0 4px 8px -2px rgba(15, 83, 45, 0.25);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--transition-base),
              transform var(--transition-fast),
              box-shadow var(--transition-base);
}
.socios-fab:hover { background: var(--brand-primary-hover); }
.socios-fab:active { transform: scale(0.96); }
@media (min-width: 1024px) {
  .socios-fab { bottom: max(1.5rem, env(safe-area-inset-bottom, 0px)); }
}

.socios-fab-enter-active,
.socios-fab-leave-active {
  transition: opacity 200ms ease,
              transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.socios-fab-enter-from,
.socios-fab-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(8px);
}

/* ---------- iOS: refuerzo táctil/scroll ---------- */
@supports (-webkit-touch-callout: none) {
  .socios-mobile-card,
  .socios-mobile-card__main,
  .socios-table__row,
  .action-btn,
  .card-pill,
  .socios-fab,
  .socios-page-btn,
  .socios-search__clear { -webkit-transform: translate3d(0, 0, 0); }
}

/* ==========================================================================
   Modal Agregar / Editar Socio — bloques DS
   ========================================================================== */

/* Selector de periodicidad (Mensual / Quincenal) — tonos verde marca, sin morado */
.periodicidad-opcion {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem 0.875rem;
  min-height: 56px;
  background: #fff;
  border: 1.5px solid var(--surface-divider-strong);
  border-radius: var(--radius-lg);
  color: #475569;
  cursor: pointer;
  transition: border-color var(--transition-base),
              background-color var(--transition-base),
              box-shadow var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  text-align: left;
}
.periodicidad-opcion:hover:not(:disabled) {
  border-color: rgba(27, 94, 55, 0.40);
}
.periodicidad-opcion--activa {
  border-color: var(--brand-primary);
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.10);
}
.periodicidad-opcion--activa > svg:first-child { color: var(--brand-primary); }
.periodicidad-opcion--unica {
  cursor: default;
  opacity: 0.95;
}

/* Bloque destacado de la cuota */
.cuota-bloque {
  padding: 1rem;
  background: var(--brand-primary-soft);
  border: 1px solid rgba(27, 94, 55, 0.18);
  border-radius: var(--radius-lg);
}
.cuota-bloque__prefix {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-weight: 600;
  font-size: 1rem;
  pointer-events: none;
}
.cuota-bloque__input {
  padding-left: 1.875rem;
  font-size: 1.0625rem;
  font-weight: 700;
}

/* Aviso warning dentro de la cuota (al editar) */
.cuota-aviso {
  margin-top: 0.625rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: rgba(254, 243, 199, 0.7);
  border: 1px solid rgba(180, 83, 9, 0.25);
  border-radius: var(--radius-md);
}

/* iOS: forzar GPU en elementos del modal con transforms/transitions */
@supports (-webkit-touch-callout: none) {
  .periodicidad-opcion,
  .cuota-bloque__input { -webkit-transform: translate3d(0, 0, 0); }
}

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

/* === Detalle del socio: secciones colapsables, mini-stats e info-rows === */
.detalle-seccion {
  border: 1px solid var(--surface-divider);
  border-radius: var(--radius-lg);
  background: #fff;
  overflow: hidden;
}
.detalle-seccion__head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-muted);
  text-align: left;
  transition: background-color 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}
.detalle-seccion__head:hover {
  background: var(--brand-primary-soft);
}
.detalle-seccion__title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}
.detalle-seccion__body {
  padding: 1rem;
  border-top: 1px solid var(--surface-divider);
  background: #fff;
}

.detalle-mini-stat {
  text-align: center;
  padding: 0.625rem 0.5rem;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-divider);
}
.detalle-mini-stat__value {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.detalle-mini-stat__label {
  font-size: 0.6875rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.detalle-info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: var(--surface-muted);
  border: 1px solid var(--surface-divider);
  border-radius: var(--radius-md);
}

/* === Modal Detalle Socio: Resumen Financiero === */

/* Wrapper del resumen fijo (no es desplegable): título + grupos espaciados */
.detalle-resumen {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* Métricas (destacadas): Total aportado + Pendiente — peso visual fuerte */
.detalle-metric {
  background: var(--surface-muted, #f8fafc);
  border: 1px solid var(--surface-divider, #e2e8f0);
  border-radius: var(--radius-lg);
  padding: 0.75rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.detalle-metric__label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  margin: 0;
}
.detalle-metric__value {
  font-family: var(--font-display, inherit);
  font-weight: 800;
  font-size: 1.25rem;
  line-height: 1.1;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detalle-metric--positivo {
  background: var(--brand-primary-soft, #e8f5ec);
  border-color: rgba(27, 94, 55, 0.18);
}
.detalle-metric--positivo .detalle-metric__label { color: var(--brand-primary, #1B5E37); }
.detalle-metric--positivo .detalle-metric__value { color: var(--brand-primary, #1B5E37); }
.detalle-metric--debe {
  background: #fffbeb;
  border-color: #fde68a;
}
.detalle-metric--debe .detalle-metric__label { color: #b45309; }
.detalle-metric--debe .detalle-metric__value { color: #b45309; }
.detalle-metric--neutro {
  background: var(--surface-muted, #f8fafc);
}

/* Chips de configuración (Cuota, Periodicidad) — peso ligero, dashed */
.detalle-config-chip {
  background: #fff;
  border: 1px dashed var(--surface-divider-strong, #cbd5e1);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}
.detalle-config-chip__label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0;
}
.detalle-config-chip__value {
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.2;
  color: #334155;
  margin: 0;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.detalle-config-chip__value--money {
  font-family: var(--font-display, inherit);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
  text-transform: none;
}
.detalle-config-chip__hint {
  font-size: 0.625rem;
  color: #94a3b8;
  margin: 0;
  margin-top: 0.0625rem;
}

/* === Modal Detalle Socio: botones ghost del footer (peso ligero) === */
.detalle-ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 0.375rem 0.75rem;
  min-height: 36px;
  font-family: var(--font-display, inherit);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.2;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  cursor: pointer;
}
.detalle-ghost-btn:active { transform: scale(0.98); }
.detalle-ghost-btn--warning { color: #b45309; }
.detalle-ghost-btn--warning:hover {
  background: #fffbeb;
  border-color: #fde68a;
}
.detalle-ghost-btn--warning:active {
  background: #fef3c7;
}
.detalle-ghost-btn--danger { color: #b91c1c; }
.detalle-ghost-btn--danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}
.detalle-ghost-btn--danger:active {
  background: #fee2e2;
}
.detalle-ghost-divider {
  width: 1px;
  height: 1.25rem;
  background: var(--surface-divider, #e2e8f0);
  align-self: center;
  flex-shrink: 0;
}

/* === Modal Cuotas del Socio: tarjetas compactas para móvil === */
.cuotas-mobile-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cuotas-mobile-card {
  background: #fff;
  border: 1px solid var(--surface-divider-strong, #e2e8f0);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 0.5rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  outline: none;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.cuotas-mobile-card--clickable {
  cursor: pointer;
  touch-action: manipulation;
}
.cuotas-mobile-card--clickable:hover {
  background: var(--brand-primary-soft);
  border-color: var(--brand-primary-soft);
}
.cuotas-mobile-card--clickable:active {
  transform: scale(0.99);
}
.cuotas-mobile-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.25);
  border-color: var(--brand-primary);
}
.cuotas-mobile-card--pagada {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.cuotas-mobile-card--mora {
  background: #fef2f2;
  border-color: #fecaca;
}

/* Fila 1: Q-badge | mes | valor | estado */
.cuotas-mobile-card__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.cuotas-mobile-card__qbadge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.375rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
}
.cuotas-mobile-card__qbadge.is-q1 {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.cuotas-mobile-card__qbadge.is-q2 {
  background: #ede9fe;
  color: #6d28d9;
  border-color: #ddd6fe;
}
.cuotas-mobile-card__qbadge.is-mes {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}
.cuotas-mobile-card__mes {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--font-display, inherit);
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.15;
  color: #0f172a;
  text-transform: capitalize;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cuotas-mobile-card__valor {
  flex-shrink: 0;
  font-family: var(--font-display, inherit);
  font-weight: 800;
  font-size: 0.9375rem;
  line-height: 1.1;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  margin: 0;
  white-space: nowrap;
}
.cuotas-mobile-card__badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
}

/* Fila 2: subetiqueta + WSP */
.cuotas-mobile-card__sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  /* alineamos con el inicio del mes (después del Q-badge) */
  padding-left: calc(1.875rem + 0.5rem);
  min-height: 1.125rem;
}
.cuotas-mobile-card__sub {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 0.6875rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cuotas-mobile-card__wsp {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  min-height: 26px;
  font-size: 0.6875rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.cuotas-mobile-card__wsp:hover {
  background: #15803d;
}
.cuotas-mobile-card__wsp:active {
  background: #166534;
}

/* === Modal Cuotas: bloque resumen al inicio === */
.cuotas-resumen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.875rem 1rem 1rem;
  border: 1px solid var(--surface-divider, #e2e8f0);
  background: var(--surface-muted, #f8fafc);
  border-radius: var(--radius-lg);
}
.cuotas-resumen__top {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.cuotas-resumen__total {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.cuotas-resumen__total-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
  margin: 0;
}
.cuotas-resumen__total-valor {
  font-family: var(--font-display, inherit);
  font-weight: 800;
  font-size: 1.5rem;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.cuotas-resumen__total-valor.is-debe { color: #b45309; }
.cuotas-resumen__total-valor.is-aldia { color: var(--brand-primary, #1B5E37); }
.cuotas-resumen__total-sub {
  font-size: 0.6875rem;
  color: #64748b;
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.cuotas-resumen__progress {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}
.cuotas-resumen__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-primary, #1B5E37), #22c55e);
  border-radius: 9999px;
  transition: width 0.4s ease;
  min-width: 0;
}
.cuotas-resumen__chips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}
@media (min-width: 480px) {
  .cuotas-resumen__chips {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.cuotas-resumen__chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.5rem 0.375rem;
  background: #fff;
  border: 1px solid var(--surface-divider, #e2e8f0);
  border-radius: var(--radius-md);
  text-align: center;
  min-height: 56px;
}
.cuotas-resumen__chip-valor {
  font-family: var(--font-display, inherit);
  font-weight: 800;
  font-size: 1.125rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.cuotas-resumen__chip-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
  margin: 0;
}
.cuotas-resumen__chip--pagadas    .cuotas-resumen__chip-valor { color: #15803d; }
.cuotas-resumen__chip--parciales  .cuotas-resumen__chip-valor { color: #c2410c; }
.cuotas-resumen__chip--pendientes .cuotas-resumen__chip-valor { color: #b45309; }
.cuotas-resumen__chip--mora       .cuotas-resumen__chip-valor { color: #b91c1c; }

/* ─────────────────────────────────────────────────────────────
   Modales de inactivar/eliminar — primitivas DS scoped
   ───────────────────────────────────────────────────────────── */

/* Callout danger (modal eliminar) */
.modal-callout-danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-lg, 0.875rem);
  padding: 0.875rem 1rem;
}

/* Callout success (modal activar — info positiva) */
.modal-callout-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-lg, 0.875rem);
  padding: 0.875rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
}

/* Toggle de tarjeta (modal desactivar — sanción) */
.modal-toggle-card {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px solid var(--surface-divider, #e5e7eb);
  background: var(--surface-soft, #f8fafc);
  text-align: left;
  transition: border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
}
.modal-toggle-card:hover { border-color: #d6b88a; }
.modal-toggle-card.is-active {
  background: #fffbeb;
  border-color: #f59e0b;
  box-shadow: 0 0 0 1px #f59e0b inset;
}
.modal-toggle-card__check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  border-radius: 0.375rem;
  border: 1.5px solid #cbd5e1;
  background: #fff;
  color: #fff;
  transition: background-color 160ms ease, border-color 160ms ease;
}
.modal-toggle-card.is-active .modal-toggle-card__check {
  background: var(--brand-warning, #b45309);
  border-color: var(--brand-warning, #b45309);
}

/* Lista de datos (resumen del socio) */
.modal-data-list {
  border: 1px solid var(--surface-divider, #e5e7eb);
  border-radius: var(--radius-lg, 0.875rem);
  background: #fff;
  overflow: hidden;
}
.modal-data-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6875rem 0.875rem;
  border-bottom: 1px solid var(--surface-divider, #e5e7eb);
}
.modal-data-list__row:last-child { border-bottom: none; }
.modal-data-list__label {
  font-size: 0.8125rem;
  color: #64748b;
}
.modal-data-list__value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.modal-data-list__value--positive { color: var(--brand-success, #15803d); }
.modal-data-list__value--danger   { color: var(--brand-danger,  #dc2626); }
.modal-data-list__value--muted    { color: #94a3b8; font-weight: 500; font-size: 0.8125rem; }

/* Bloque de liquidación */
.modal-liquidacion {
  border: 1px solid #fde68a;
  background: #fffbeb;
  border-radius: var(--radius-lg, 0.875rem);
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.modal-liquidacion__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.modal-liquidacion__label {
  font-size: 0.8125rem;
  color: #475569;
  font-weight: 500;
}
.modal-liquidacion__value {
  font-size: 1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.modal-liquidacion__value--main    { color: var(--brand-success, #15803d); }
.modal-liquidacion__value--warning { color: var(--brand-warning, #b45309); }

/* Segmented (forma de pago) */
.modal-segmented {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  min-height: 44px;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-md, 0.625rem);
  border: 1px solid var(--surface-divider, #e5e7eb);
  background: #fff;
  color: #475569;
  font-weight: 600;
  font-size: 0.8125rem;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
}
.modal-segmented:hover { border-color: #cbd5e1; }
.modal-segmented.is-active {
  background: #fffbeb;
  border-color: var(--brand-warning, #b45309);
  color: var(--brand-warning, #b45309);
  box-shadow: 0 0 0 1px var(--brand-warning, #b45309) inset;
}

/* Botón warning sólido (acción primaria de desactivar) */
.modal-btn-warning {
  background: var(--brand-warning, #b45309);
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(180, 83, 9, 0.32);
}
.modal-btn-warning:hover:not(:disabled) {
  background: #92400e;
  box-shadow: 0 6px 16px -2px rgba(180, 83, 9, 0.4);
}
.modal-btn-warning:active:not(:disabled) {
  background: #78350f;
  box-shadow: 0 2px 6px -1px rgba(180, 83, 9, 0.3);
}
.modal-btn-warning:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

/* Botón Descargar (azul info) — modal comprobante de salida */
.modal-btn-download {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.32);
}
.modal-btn-download:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 6px 16px -2px rgba(37, 99, 235, 0.4);
}
.modal-btn-download:active:not(:disabled) {
  background: #1e40af;
  box-shadow: 0 2px 6px -1px rgba(37, 99, 235, 0.3);
}
.modal-btn-download:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

/* Botón success sólido (acción primaria de activar / éxito) */
.modal-btn-success {
  background: var(--brand-success, #15803d);
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(21, 128, 61, 0.32);
}
.modal-btn-success:hover:not(:disabled) {
  background: #166534;
  box-shadow: 0 6px 16px -2px rgba(21, 128, 61, 0.4);
}
.modal-btn-success:active:not(:disabled) {
  background: #14532d;
  box-shadow: 0 2px 6px -1px rgba(21, 128, 61, 0.3);
}
.modal-btn-success:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

/* Botón WhatsApp (verde marca WhatsApp) — modal comprobante de salida */
.modal-btn-whatsapp {
  background: #16a34a;
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(22, 163, 74, 0.32);
}
.modal-btn-whatsapp:hover:not(:disabled) {
  background: #15803d;
  box-shadow: 0 6px 16px -2px rgba(22, 163, 74, 0.4);
}
.modal-btn-whatsapp:active:not(:disabled) {
  background: #166534;
  box-shadow: 0 2px 6px -1px rgba(22, 163, 74, 0.3);
}
.modal-btn-whatsapp:disabled,
.modal-btn-whatsapp.is-disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}
</style>


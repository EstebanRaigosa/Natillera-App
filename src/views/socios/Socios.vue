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
          <!-- Móvil: invitar (icono) + CTA primario en línea con el título (sm+ usa el bloque de actions) -->
          <button
            v-if="!esVisor"
            type="button"
            class="ds-btn ds-btn--secondary sm:hidden socios-header-add"
            aria-label="Invitar socios a la app"
            @click="irASociosEnApp"
          >
            <LinkIcon class="w-5 h-5" />
          </button>
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
            v-if="!esVisor && natilleraYaEmpezo"
            type="button"
            class="ds-btn ds-btn--secondary"
            @click="modalPonerAlDia = true"
          >
            <CheckBadgeIcon class="w-4 h-4" />
            <span>Poner al día</span>
          </button>
          <button
            v-if="!esVisor"
            type="button"
            class="ds-btn ds-btn--secondary"
            @click="irASociosEnApp"
          >
            <LinkIcon class="w-4 h-4" />
            <span>Invitar socios</span>
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

    <!--
      Natillera que empezó antes de pasarse a la app: sus socios nacen con los meses
      anteriores en mora aunque ya pagaron. El aviso lleva al proceso masivo; en el celular
      es la entrada, porque la cabecera solo tiene iconos.
    -->
    <button
      v-if="!esVisor && natilleraYaEmpezo && cantidadSociosCuotasEnMora > 0"
      type="button"
      class="al-dia-aviso mb-3"
      @click="modalPonerAlDia = true"
    >
      <span class="al-dia-aviso__icono" aria-hidden="true"><CheckBadgeIcon class="w-5 h-5" /></span>
      <span class="min-w-0 flex-1 text-left">
        <span class="al-dia-aviso__titulo">
          {{ cantidadSociosCuotasEnMora === 1 ? '1 socio en mora' : `${cantidadSociosCuotasEnMora} socios en mora` }}
        </span>
        <span class="al-dia-aviso__sub">¿Ya pagaron por fuera de la app? Regístralos de una vez.</span>
      </span>
      <span class="al-dia-aviso__cta">
        Poner al día
        <ChevronRightIcon class="w-4 h-4" aria-hidden="true" />
      </span>
    </button>

    <PonerAlDiaMasivoModal
      :show="!!modalPonerAlDia"
      :natillera-id="id"
      :natillera-nombre="natillerasStore.natilleraActual?.nombre || ''"
      :socios="sociosStore.sociosNatillera"
      @close="modalPonerAlDia = false"
    />

    <!-- Solicitudes para usar la app: el admin las aprueba (sabe quién es quién) -->
    <button
      v-if="!esVisor && solicitudesVinculo.length > 0"
      type="button"
      class="solicitudes-aviso"
      @click="irASociosEnApp"
    >
      <span class="solicitudes-aviso__icono" aria-hidden="true"><UserPlusIcon class="w-5 h-5" /></span>
      <span class="min-w-0 flex-1 text-left">
        <span class="solicitudes-aviso__titulo">
          {{ solicitudesVinculo.length === 1 ? '1 socio quiere usar la app' : `${solicitudesVinculo.length} socios quieren usar la app` }}
        </span>
        <span class="solicitudes-aviso__sub">Revisa con qué cuenta lo pidieron y apruébalos</span>
      </span>
      <ChevronRightIcon class="w-5 h-5 shrink-0" aria-hidden="true" />
    </button>

    <!-- Entrar a la vista sin datos: pantalla de carga completa (CLAUDE.md 2.1) -->
    <CargaPantalla :visible="cargandoPrimeraVez" text="Cargando socios" />

    <!-- Empty state: sin socios registrados (DS) -->
    <div v-if="!cargandoPrimeraVez && !cargaInicial && sociosStore.sociosNatillera.length === 0" class="ds-empty-state">
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
      v-else-if="!cargandoPrimeraVez"
      class="bg-superficie-tarjeta rounded-2xl border border-[color:var(--surface-divider)] shadow-[var(--shadow-xs)] overflow-hidden"
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
        <div class="w-14 h-14 mx-auto mb-4 bg-slate-100 oscuro:bg-superficie-hundida rounded-2xl flex items-center justify-center">
          <MagnifyingGlassIcon class="w-7 h-7 text-slate-400 oscuro:text-texto-tenue" />
        </div>
        <p class="font-display font-bold text-slate-800 oscuro:text-texto text-base sm:text-lg mb-1">Sin resultados</p>
        <p class="text-sm text-slate-500 oscuro:text-texto-suave mb-5">
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
                v-for="sn in sociosMostrados"
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
                      class="w-10 h-10 rounded-full object-cover bg-slate-100 oscuro:bg-superficie-hundida flex-shrink-0"
                    />
                    <div class="min-w-0">
                      <p class="font-bold text-slate-800 oscuro:text-texto truncate leading-tight">
                        {{ sn.socio?.nombre || 'Socio sin nombre' }}
                      </p>
                      <p class="text-[11px] text-slate-400 oscuro:text-texto-tenue truncate font-mono mt-0.5">
                        {{ sn.socio?.documento ? `ID: ${sn.socio.documento}` : '—' }}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-sm text-slate-700 oscuro:text-texto-medio truncate">
                    {{ sn.socio?.email || '—' }}
                  </p>
                  <p class="text-xs text-slate-400 oscuro:text-texto-tenue truncate mt-0.5">
                    {{ sn.socio?.telefono || 'Sin teléfono' }}
                  </p>
                  <p v-if="sn.socio?.usuario_id" class="socio-vinculado mt-1">
                    <CheckBadgeIcon class="w-3.5 h-3.5" aria-hidden="true" />
                    Usa la app
                  </p>
                </td>
                <td>
                  <span class="ds-badge" :class="badgeEstadoClase(sn.estado)">
                    <span class="badge-dot" :class="dotEstadoClase(sn.estado)" aria-hidden="true"></span>
                    {{ labelEstado(sn.estado) }}
                  </span>
                </td>
                <td>
                  <p class="font-bold text-slate-800 oscuro:text-texto tabular-nums leading-tight">
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
                  <span class="text-sm text-slate-600 oscuro:text-texto-secundario capitalize">
                    {{ sn.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                  </span>
                </td>
                <td>
                  <!-- Las mismas píldoras con texto de la tarjeta móvil: los iconos solos no
                       decían qué hacía cada botón. Solo «Eliminar» queda en icono, con title. -->
                  <div class="flex items-center justify-end gap-1.5">
                    <template v-if="sn.estado === 'activo'">
                      <button
                        type="button"
                        class="card-pill card-pill--tabla card-pill--brand"
                        aria-label="Ver cuotas del socio"
                        @click.stop="verCuotasSocio(sn)"
                      >
                        <CurrencyDollarIcon class="w-4 h-4" />
                        Cuotas
                      </button>
                      <button
                        v-if="!esVisor"
                        type="button"
                        class="card-pill card-pill--tabla card-pill--info"
                        aria-label="Editar socio"
                        @click.stop="editarSocio(sn)"
                      >
                        <PencilIcon class="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        v-if="!esVisor"
                        type="button"
                        class="card-pill card-pill--tabla card-pill--warning"
                        aria-label="Retirar socio de la natillera"
                        @click.stop="abrirModalDesactivar(sn)"
                      >
                        <XCircleIcon class="w-4 h-4" />
                        Retirar
                      </button>
                      <button
                        v-if="!esVisor"
                        type="button"
                        class="card-pill card-pill--tabla card-pill--danger card-pill--icon"
                        title="Eliminar socio"
                        aria-label="Eliminar socio"
                        @click.stop="confirmarEliminarSocio(sn)"
                      >
                        <TrashIcon class="w-4 h-4" />
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
            v-for="sn in sociosMostrados"
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
                  class="w-10 h-10 rounded-full object-cover bg-slate-100 oscuro:bg-superficie-hundida flex-shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="font-bold text-slate-800 oscuro:text-texto truncate text-sm leading-snug">
                      {{ sn.socio?.nombre || 'Socio sin nombre' }}
                    </p>
                    <span class="ds-badge flex-shrink-0" :class="badgeEstadoClase(sn.estado)">
                      <span class="badge-dot" :class="dotEstadoClase(sn.estado)" aria-hidden="true"></span>
                      {{ labelEstado(sn.estado) }}
                    </span>
                  </div>
                  <p class="flex items-center gap-1 mt-1 text-[11px] text-slate-500 oscuro:text-texto-suave truncate leading-tight">
                    <EnvelopeIcon class="w-3 h-3 flex-shrink-0 text-slate-400 oscuro:text-texto-tenue" aria-hidden="true" />
                    <span class="truncate">{{ sn.socio?.email || 'Sin correo' }}</span>
                  </p>
                  <p class="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500 oscuro:text-texto-suave truncate leading-tight">
                    <PhoneIcon class="w-3 h-3 flex-shrink-0 text-slate-400 oscuro:text-texto-tenue" aria-hidden="true" />
                    <span class="truncate">{{ sn.socio?.telefono || 'Sin teléfono' }}</span>
                  </p>
                  <p v-if="sn.socio?.usuario_id" class="socio-vinculado mt-1">
                    <CheckBadgeIcon class="w-3.5 h-3.5" aria-hidden="true" />
                    Usa la app
                  </p>
                </div>
              </div>

              <!-- Métricas (Cuota / Periodicidad) — bloque compacto -->
              <div class="socios-mobile-card__metrics">
                <div class="min-w-0">
                  <p class="socios-mobile-metric-label">Cuota</p>
                  <p class="font-bold text-slate-800 oscuro:text-texto tabular-nums text-sm leading-none">
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
                  <p class="text-xs text-slate-700 oscuro:text-texto-medio capitalize leading-none">
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
                  aria-label="Retirar socio de la natillera"
                  @click.stop="abrirModalDesactivar(sn)"
                >
                  <XCircleIcon class="w-4 h-4" />
                  Retirar
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

        <!-- Carga progresiva (useScrollInfinito): el centinela pide la tanda siguiente al
             acercarse, y el botón queda como respaldo si el observador no salta. -->
        <div v-if="hayMasSocios" ref="centinelaRef" class="socios-mas">
          <button
            type="button"
            class="ds-btn ds-btn--secondary w-full sm:w-auto"
            @click="cargarMasSocios"
          >
            <ChevronDownIcon class="w-4 h-4" />
            Ver más socios
          </button>
          <p class="text-xs text-slate-500 oscuro:text-texto-suave">
            Mostrando
            <strong class="text-slate-700 oscuro:text-texto-medio font-semibold">{{ sociosMostrados.length }}</strong>
            de
            <strong class="text-slate-700 oscuro:text-texto-medio font-semibold">{{ sociosFiltrados.length }}</strong>
            {{ sociosFiltrados.length === 1 ? 'socio' : 'socios' }}
          </p>
        </div>

        <p v-else class="socios-mas socios-mas--fin">
          <span v-if="hayVariasTandasDeSocios">
            Ya viste los {{ sociosFiltrados.length }} socios
          </span>
          <span v-else>
            {{ sociosFiltrados.length }} {{ sociosFiltrados.length === 1 ? 'socio' : 'socios' }}
          </span>
        </p>
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
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="32rem"
      @close="modalDetalle = false"
    >
      <!-- Cabecera marca: avatar redondo blanco, nombre, badge de estado, X en flex -->
      <div ref="cabeceraDetalleSocio" class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <!-- Móvil: una sola fila [avatar | nombre+estado | X] -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: avatar con fondo blanco sobre la cabecera de marca -->
          <img class="w-10 h-10 shrink-0 rounded-full object-cover bg-white shadow-sm"
            v-if="socioSeleccionado"
            :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)"
            :alt="socioSeleccionado.socio?.nombre"
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
          <!-- Solo superusuario: imagen del modal completo para soporte (useCapturaCompleta) -->
          <button
            v-if="puedeCapturarDetalle"
            type="button"
            class="no-captura h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-50"
            aria-label="Capturar el detalle completo"
            title="Capturar el detalle completo"
            :disabled="capturaDetalle.generando"
            @click="capturarDetalleSocio"
          >
            <CameraIcon class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="no-captura h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="modalDetalle = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <!-- Desktop: avatar arriba centrado, nombre y badge debajo, X en flex (no absolute) -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <!-- Columna izquierda: la captura (superusuario) o vacía por simetría con la X -->
          <div class="w-11 flex-shrink-0">
            <!-- Solo superusuario: imagen del modal completo para soporte (useCapturaCompleta) -->
            <button
              v-if="puedeCapturarDetalle"
              type="button"
              class="no-captura h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation disabled:opacity-50"
              aria-label="Capturar el detalle completo"
              title="Capturar el detalle completo"
              :disabled="capturaDetalle.generando"
              @click="capturarDetalleSocio"
            >
              <CameraIcon class="h-5 w-5" />
            </button>
          </div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <!-- tema-fijo: avatar con fondo blanco sobre la cabecera de marca -->
            <img class="w-14 h-14 mb-2 rounded-full object-cover bg-white shadow-sm"
              v-if="socioSeleccionado"
              :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)"
              :alt="socioSeleccionado.socio?.nombre"
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
            class="no-captura h-11 w-11 flex-shrink-0 inline-flex items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
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
          data-captura-expandir
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalDetalleSocio"
        >
          <!--
            Captura lista (superusuario). Descargar y compartir van en un segundo toque:
            Safari solo abre el menú de compartir pegado a un toque, y generar la imagen
            tarda. No sale en la imagen.
          -->
          <div v-if="capturaDetalle.archivo" class="captura-lista no-captura">
            <CameraIcon class="h-5 w-5 flex-shrink-0 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" aria-hidden="true" />
            <p class="min-w-0 flex-1 text-sm font-semibold text-slate-700 oscuro:text-texto-medio">Captura lista</p>
            <button type="button" class="btn-descargar btn-descargar--sm" @click="descargarCapturaDetalle">
              <ArrowDownTrayIcon class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              Descargar
            </button>
            <button v-if="puedeCompartirCaptura" type="button" class="btn-compartir btn-compartir--sm" @click="compartirCapturaDetalle">
              <ShareIcon class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              Compartir
            </button>
          </div>
          <!-- Estado de pagos: callout verde (al día) o ámbar (pendientes) -->
          <div
            class="ds-callout"
            :class="resumenSocio.alDia
              ? null
              : 'bg-amber-100/60 oscuro:bg-amber-500/15 text-amber-900 oscuro:text-amber-300'"
          >
            <component
              :is="resumenSocio.alDia ? CheckCircleIcon : ExclamationCircleIcon"
              class="w-5 h-5 ds-callout__icon flex-shrink-0"
              :class="resumenSocio.alDia ? null : 'text-alerta'"
            />
            <div>
              <span
                class="ds-callout__title"
                :class="resumenSocio.alDia ? null : 'text-[#78350f] oscuro:text-amber-300'"
              >
                {{ resumenSocio.alDia ? '¡Al día con los pagos!' : 'Tiene pagos pendientes' }}
              </span>
              <span>
                {{ resumenSocio.alDia
                  ? 'Este socio ha cumplido con todas sus cuotas.'
                  : `Debe ${resumenSocio.cuotasPendientes + resumenSocio.cuotasMora} cuota${(resumenSocio.cuotasPendientes + resumenSocio.cuotasMora) === 1 ? '' : 's'}.` }}
              </span>
              <!-- Ya pagó por fuera de la app (natillera que empezó antes de crearla aquí) -->
              <button
                v-if="!resumenSocio.alDia && !esVisor && !alDiaDetalle.abierto"
                type="button"
                class="poner-al-dia__abrir no-captura"
                @click="abrirPonerAlDia"
              >
                <CheckCircleIcon class="h-4 w-4" aria-hidden="true" />
                Ponerlo al día
              </button>
            </div>
          </div>

          <!--
            Poner al día, dentro del mismo detalle: cuántas cuotas vencidas se registran, cuánto
            suman y cómo pagó. Cada una queda pagada en su fecha límite, sin multa (usePonerAlDia).
          -->
          <div v-if="alDiaDetalle.abierto" class="poner-al-dia no-captura">
            <CargaCaja v-if="alDiaDetalle.cargando" texto="Buscando cuotas vencidas" />
            <template v-else-if="alDiaDetalle.cuotas.length > 0">
              <div class="flex items-center gap-2.5">
                <span class="poner-al-dia__sello" aria-hidden="true"><CheckBadgeIcon class="w-5 h-5" /></span>
                <div class="min-w-0">
                  <p class="poner-al-dia__titulo">Ponerlo al día</p>
                  <p class="poner-al-dia__sub">{{ rangoPonerAlDia }}</p>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <div class="detalle-metric">
                  <p class="detalle-metric__label">Cuotas</p>
                  <p class="detalle-metric__value">{{ alDiaDetalle.cuotas.length }}</p>
                </div>
                <div class="detalle-metric detalle-metric--positivo">
                  <p class="detalle-metric__label">{{ total4x1000PonerAlDia > 0 ? 'Con 4×1000' : 'Suman' }}</p>
                  <p class="detalle-metric__value">$ {{ formatMoney(totalPonerAlDia + total4x1000PonerAlDia) }}</p>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span class="ds-overline">Cómo pagó</span>
                <SwitchSegmentado v-model="alDiaDetalle.formaPago" :opciones="OPCIONES_FORMA_PAGO_AL_DIA" />
                <label v-if="alDiaDetalle.formaPago === 'transferencia'" class="poner-al-dia__opcion" :class="{ 'is-activa': alDiaDetalle.cobrar4x1000 }">
                  <input v-model="alDiaDetalle.cobrar4x1000" type="checkbox" class="sr-only" />
                  <span class="poner-al-dia__caja" aria-hidden="true"><CheckIcon v-if="alDiaDetalle.cobrar4x1000" class="h-3.5 w-3.5" /></span>
                  Cobrar 4×1000
                </label>
              </div>
              <p class="poner-al-dia__nota">
                <InformationCircleIcon class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Cada cuota queda pagada en su fecha límite, sin multa, y entra a la caja.</span>
              </p>
              <div class="mt-3 grid grid-cols-2 gap-2.5">
                <button type="button" class="btn-modal-secondary" @click="cerrarPonerAlDia">Cancelar</button>
                <button type="button" class="btn-modal-primary" @click="confirmarPonerAlDia">Ponerlo al día</button>
              </div>
            </template>
            <template v-else>
              <div class="flex items-start gap-2.5">
                <span class="poner-al-dia__sello" aria-hidden="true"><CheckBadgeIcon class="w-5 h-5" /></span>
                <p class="poner-al-dia__sub pt-1">
                  No tiene cuotas vencidas por registrar: lo que debe aún no ha llegado a su fecha límite.
                </p>
              </div>
              <button type="button" class="btn-modal-secondary mt-3 w-full" @click="cerrarPonerAlDia">Entendido</button>
            </template>
          </div>
          <CargaCaja :visible="capturaDetalle.generando" flotante texto="Preparando la captura" detalle="El detalle completo del socio" />
          <CargaCaja
            :visible="alDiaDetalle.guardando"
            flotante
            texto="Poniendo al día"
            :detalle="alDiaDetalle.total ? `Cuota ${alDiaDetalle.hechas} de ${alDiaDetalle.total}` : 'Un momento'"
          />

          <!-- Cuenta en la app: con qué correo se vinculó el socio (o que aún no lo hizo) -->
          <div class="socio-cuenta" :class="{ 'is-vinculado': socioSeleccionado?.socio?.usuario_id }">
            <component
              :is="socioSeleccionado?.socio?.usuario_id ? CheckBadgeIcon : LinkIcon"
              class="socio-cuenta__icono"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <template v-if="socioSeleccionado?.socio?.usuario_id">
                <p class="socio-cuenta__titulo">Usa la app</p>
                <p class="socio-cuenta__detalle">{{ socioSeleccionado.socio.vinculado_email || 'Cuenta vinculada' }}</p>
              </template>
              <template v-else>
                <p class="socio-cuenta__titulo">Aún no usa la app</p>
                <p class="socio-cuenta__detalle">Se vincula con el enlace de «Invitar socios».</p>
              </template>
            </div>
            <button
              v-if="socioSeleccionado?.socio?.usuario_id && !esVisor"
              type="button"
              class="socio-cuenta__accion no-captura"
              :disabled="desvinculando"
              @click="desvincularSocio(socioSeleccionado)"
            >
              {{ desvinculando ? '…' : 'Desvincular' }}
            </button>
          </div>

          <!-- Resumen Financiero — fijo, siempre visible (no desplegable) -->
          <section class="detalle-resumen" aria-labelledby="detalle-resumen-titulo">
            <div class="flex items-center gap-2 px-0.5">
              <BanknotesIcon class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" />
              <h3 id="detalle-resumen-titulo" class="font-display font-bold text-slate-800 oscuro:text-texto text-sm">
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
                  <p class="detalle-mini-stat__value text-[color:var(--brand-success)] oscuro:text-exito">{{ resumenSocio.cuotasPagadas }}</p>
                  <p class="detalle-mini-stat__label">Pagadas</p>
                </div>
                <div class="detalle-mini-stat">
                  <p class="detalle-mini-stat__value text-[color:var(--brand-warning)] oscuro:text-alerta">{{ resumenSocio.cuotasPendientes }}</p>
                  <p class="detalle-mini-stat__label">Pendientes</p>
                </div>
                <div class="detalle-mini-stat">
                  <p class="detalle-mini-stat__value text-[color:var(--brand-danger)] oscuro:text-peligro">{{ resumenSocio.cuotasMora }}</p>
                  <p class="detalle-mini-stat__label">En mora</p>
                </div>
              </div>
            </div>
          </section>

          <!--
            Aquí había un desplegable con una tabla de cuotas pagadas: repetía a medias la
            modal de cuotas del socio, que además muestra las pendientes y las de mora.
            Ahora es un botón que la abre encima; el «atrás» del móvil cierra esa y
            devuelve a este detalle, porque `handlePopState` mira cuotas antes que detalle.
          -->
          <button
            type="button"
            class="detalle-ir-cuotas"
            @click="verCuotasDesdeDetalle"
          >
            <span class="detalle-ir-cuotas__icono" aria-hidden="true">
              <CalendarDaysIcon class="w-4 h-4" />
            </span>
            <span class="detalle-ir-cuotas__texto">
              <span class="detalle-ir-cuotas__titulo">Ver las cuotas del socio</span>
              <span class="detalle-ir-cuotas__sub">Pagadas, pendientes y en mora, con su fecha de pago</span>
            </span>
            <ChevronRightIcon class="w-4 h-4 flex-shrink-0 text-slate-400 oscuro:text-texto-tenue" aria-hidden="true" />
          </button>

          <!-- Información de Contacto -->
          <section class="detalle-seccion">
            <button
              type="button"
              class="detalle-seccion__head"
              :aria-expanded="seccionActiva === 'contacto'"
              @click="toggleSeccion('contacto')"
            >
              <span class="detalle-seccion__title">
                <UserIcon class="w-4 h-4 text-[color:var(--brand-primary)] oscuro:text-marca-tinta" />
                Información de contacto
              </span>
              <ChevronDownIcon
                class="w-4 h-4 text-slate-400 oscuro:text-texto-tenue transition-transform duration-200"
                :class="seccionActiva === 'contacto' ? 'rotate-180' : ''"
              />
            </button>
            <div v-show="seccionActiva === 'contacto'" class="detalle-seccion__body space-y-2">
              <div class="detalle-info-row">
                <PhoneIcon class="w-4 h-4 text-slate-400 oscuro:text-texto-tenue flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="ds-overline mb-0.5">Teléfono / WhatsApp</p>
                  <p class="font-semibold text-slate-800 oscuro:text-texto text-sm truncate">
                    {{ socioSeleccionado?.socio?.telefono || 'No registrado' }}
                  </p>
                </div>
                <a
                  v-if="socioSeleccionado?.socio?.telefono"
                  :href="`https://wa.me/${numeroWhatsApp(socioSeleccionado.socio.telefono.replace(/\D/g, ''))}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-compartir btn-compartir--sm flex-shrink-0"
                >
                  <IconoWhatsApp class="w-4 h-4 flex-shrink-0" />
                  WhatsApp
                </a>
              </div>
              <div class="detalle-info-row">
                <EnvelopeIcon class="w-4 h-4 text-slate-400 oscuro:text-texto-tenue flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="ds-overline mb-0.5">Correo electrónico</p>
                  <p class="font-semibold text-slate-800 oscuro:text-texto text-sm truncate">
                    {{ socioSeleccionado?.socio?.email || 'No registrado' }}
                  </p>
                </div>
              </div>
              <div class="detalle-info-row">
                <IdentificationIcon class="w-4 h-4 text-slate-400 oscuro:text-texto-tenue flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="ds-overline mb-0.5">Documento</p>
                  <p class="font-semibold text-slate-800 oscuro:text-texto text-sm truncate">
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
          class="no-captura pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
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
      <div class="no-captura flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-3 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] space-y-2">
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
            Retirar
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
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="32rem"
      @close="cerrarModalImportar"
    >
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
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
            <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
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
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-5"
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
                <ArrowUpTrayIcon class="w-5 h-5 text-[color:var(--brand-primary)] oscuro:text-marca-tinta flex-shrink-0 mt-0.5" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 oscuro:text-texto text-sm">Importar desde tu equipo</p>
                  <p class="text-sm text-slate-600 oscuro:text-texto-secundario mt-1 leading-snug">
                    Elige el archivo CSV con los socios que quieres dar de alta. Es un proceso aparte de descargar la plantilla.
                  </p>
                  <input
                    ref="inputArchivoCsv"
                    type="file"
                    accept=".csv,text/csv,text/comma-separated-values,text/plain"
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
                <!-- sticky en cada th y no en thead: Safari no respeta position:sticky en thead/tr -->
                <thead>
                  <tr>
                    <th class="sticky top-0 z-[1] bg-[color:var(--surface-muted)] text-left p-3 font-semibold text-slate-600 oscuro:text-texto-secundario text-xs uppercase tracking-wide">Nombre</th>
                    <th class="sticky top-0 z-[1] bg-[color:var(--surface-muted)] text-left p-3 font-semibold text-slate-600 oscuro:text-texto-secundario text-xs uppercase tracking-wide">Cuota</th>
                    <th class="sticky top-0 z-[1] bg-[color:var(--surface-muted)] text-left p-3 font-semibold text-slate-600 oscuro:text-texto-secundario text-xs uppercase tracking-wide">
                      Teléfono <span class="text-[color:var(--brand-danger)] oscuro:text-peligro">*</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 oscuro:divide-borde-suave bg-superficie-tarjeta">
                  <tr v-for="(socio, index) in sociosPreview" :key="index">
                    <td class="p-3 text-slate-800 oscuro:text-texto">{{ socio.nombre }}</td>
                    <td class="p-3 font-semibold text-[color:var(--brand-primary)] oscuro:text-marca-tinta tabular-nums">${{ formatMoney(socio.valor_cuota) }}</td>
                    <td class="p-3" :class="socio.telefono ? 'text-slate-700 oscuro:text-texto-medio' : 'text-[color:var(--brand-danger)] oscuro:text-peligro font-medium'">
                      {{ socio.telefono || 'Requerido' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="errorImportar" class="ds-callout bg-[#fee2e2] oscuro:bg-red-500/15 text-[#991b1b] oscuro:text-red-300" role="alert">
            <ExclamationCircleIcon class="w-5 h-5 ds-callout__icon text-[#b91c1c] oscuro:text-red-300" />
            <div>{{ errorImportar }}</div>
          </div>

          <div v-if="exitoImportar" class="ds-callout bg-[#dcfce7] oscuro:bg-green-500/15 text-[#166534] oscuro:text-marca-tinta">
            <CheckCircleIcon class="w-5 h-5 flex-shrink-0 text-[color:var(--brand-success)] oscuro:text-exito" />
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
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
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
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex flex-col-reverse sm:flex-row gap-2.5">
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
          <CargaBoton v-if="importando" pequena />
          <ArrowUpTrayIcon v-else class="w-4 h-4" />
          {{ importando ? 'Importando…' : (sociosPreview.length > 0 ? `Importar ${sociosPreview.length} socios` : 'Importar socios') }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Agregar / editar socio: formulario compartido con Cuotas (SocioFormModal) -->
    <SocioFormModal
      :show="!!modalAgregar"
      :form="formSocio"
      :es-edicion="!!socioEditando"
      :periodicidad-natillera="periodicidadNatillera"
      :guardando="guardando"
      :error="errorSocio"
      :error-telefono-duplicado="errorTelefonoDuplicado"
      v-model:telefono-tocado="telefonoTocado"
      :ofrecer-al-dia="natilleraYaEmpezo"
      @guardar="handleGuardarSocio"
      @cerrar="cerrarModal"
      @selector-contactos="alSelectorContactos"
    />

    <!-- Modal Cuotas del Socio: patrón modales + natiscroll; lista compacta en rejilla -->
    <ModalWrapper
      :show="!!modalCuotasSocio"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="42rem"
      @close="cerrarModalCuotasSocio"
    >
      <!-- Cabecera marca — móvil: fila -->
      <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
        <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: avatar con fondo blanco sobre la cabecera de marca -->
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            <!-- tema-fijo: avatar e icono verde sobre el círculo blanco -->
            <img v-if="socioParaCuotas" :src="getAvatarUrl(socioParaCuotas.socio?.nombre || socioParaCuotas.id, socioParaCuotas.socio?.avatar_seed, socioParaCuotas.socio?.avatar_style)" :alt="socioParaCuotas.socio?.nombre" class="h-full w-full object-cover" />
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
            <!-- tema-fijo: avatar con fondo blanco sobre la cabecera de marca -->
            <div class="w-[3.2rem] h-[3.2rem] rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <!-- tema-fijo: avatar e icono verde sobre el círculo blanco -->
              <img v-if="socioParaCuotas" :src="getAvatarUrl(socioParaCuotas.socio?.nombre || socioParaCuotas.id, socioParaCuotas.socio?.avatar_seed, socioParaCuotas.socio?.avatar_style)" :alt="socioParaCuotas.socio?.nombre" class="h-full w-full object-cover" />
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
          class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 pb-5 space-y-4 bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="programarNatiscrollModalCuotasSocio"
        >
          <CargaCaja v-if="loadingCuotasSocio" texto="Cargando cuotas" />

          <div v-else-if="cuotasSocioPorMes.length === 0" class="text-center py-10 px-2">
            <p class="text-texto-suave text-sm">No hay cuotas registradas</p>
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
                  <!-- Fila 2: subetiqueta + fecha de pago + acción WhatsApp -->
                  <div class="cuotas-mobile-card__sub-row">
                    <p class="cuotas-mobile-card__sub">
                      {{ subetiquetaValorCuotaSocioModal(cuotaData) }}
                    </p>
                    <p
                      v-if="etiquetaFechaPagoCuotaSocioModal(cuotaData)"
                      class="cuotas-mobile-card__fecha"
                    >
                      {{ etiquetaFechaPagoCuotaSocioModal(cuotaData) }}
                    </p>
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                      type="button"
                      class="btn-compartir btn-compartir--sm flex-shrink-0"
                      aria-label="Enviar recordatorio por WhatsApp"
                      @click.stop="enviarWhatsAppCuota(cuotaData)"
                    >
                      <IconoWhatsApp class="w-4 h-4 flex-shrink-0" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>

          <!-- Desktop (md+): rejilla compacta de 5 columnas -->
          <div class="hidden md:block rounded-xl border border-borde/90 bg-superficie-tarjeta overflow-hidden shadow-sm pb-2">
            <div
              class="sticky top-0 z-[1] grid grid-cols-[minmax(0,4.5rem)_minmax(0,3.25rem)_1fr_minmax(0,4.25rem)_2.75rem] gap-x-1.5 px-2 py-2 bg-superficie-suave border-b border-borde text-[10px] font-semibold uppercase tracking-wide text-texto-suave"
              role="row"
            >
              <span>Mes</span>
              <span>Cuota</span>
              <span class="text-right tabular-nums">Valor a pagar</span>
              <span class="text-right">Estado</span>
              <span class="text-center" aria-hidden="true" />
            </div>
            <div class="divide-y divide-borde-suave">
              <div
                v-for="(cuotaData, idx) in cuotasSocioPorMes"
                :key="`d-${cuotaData.id}-${idx}`"
                role="row"
                class="grid grid-cols-[minmax(0,4.5rem)_minmax(0,3.25rem)_1fr_minmax(0,4.25rem)_2.75rem] gap-x-1.5 items-center px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-natillera-500/40 focus-visible:ring-inset"
                :class="[
                  !esVisor ? 'cursor-pointer hover:bg-emerald-50/40 oscuro:hover:bg-emerald-500/15 active:bg-emerald-50/60 oscuro:active:bg-emerald-500/15' : '',
                  cuotaData.estado === 'mora' && animacionesCuotasMora ? 'bg-red-50/50 oscuro:bg-red-500/15' : '',
                  cuotaData.estado === 'pagada' || (cuotaData.valorPagado || 0) >= totalObligacionCuotaSocioModal(cuotaData) ? 'bg-green-50/25 oscuro:bg-green-500/15' : ''
                ]"
                :tabindex="!esVisor ? 0 : -1"
                @click="handleClickFilaCuotaSocioModal(cuotaData)"
                @keydown.enter.prevent="handleClickFilaCuotaSocioModal(cuotaData)"
              >
                <div class="text-texto font-semibold leading-tight min-w-0">
                  <span class="block truncate" :title="etiquetaMesAnioCuotaSocioModal(cuotaData)">
                    {{ etiquetaMesAnioCuotaSocioModal(cuotaData) }}
                  </span>
                </div>
                <div class="text-texto font-semibold tabular-nums leading-tight">
                  {{ etiquetaPeriodoCuotaSocioModal(cuotaData) }}
                </div>
                <div class="text-right min-w-0">
                  <p class="font-bold tabular-nums text-texto-fuerte leading-tight">
                    ${{ formatMoney(getMontoValorCuotaSocioModal(cuotaData)) }}
                  </p>
                  <p class="text-[10px] text-texto-suave leading-tight mt-0.5 truncate">
                    {{ subetiquetaValorCuotaSocioModal(cuotaData) }}
                  </p>
                  <p
                    v-if="etiquetaFechaPagoCuotaSocioModal(cuotaData)"
                    class="text-[10px] text-texto-suave leading-tight truncate tabular-nums"
                  >
                    {{ etiquetaFechaPagoCuotaSocioModal(cuotaData) }}
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
                    class="h-11 w-11 rounded-lg text-marca-tinta hover:bg-marca-suave flex items-center justify-center touch-manipulation"
                    title="WhatsApp"
                    aria-label="Enviar recordatorio por WhatsApp"
                    @click="enviarWhatsAppCuota(cuotaData)"
                  >
                    <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
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
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
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
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-4 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))]">
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
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="28rem"
      @close="!eliminando && (socioAEliminar = null)"
    >
      <!-- Cabecera danger (rojo): comunica acción irreversible -->
      <div class="flex-shrink-0 bg-[color:var(--brand-danger)] text-white">
        <!-- Móvil: una sola fila -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
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
            <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
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
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalEliminarSocio"
        >
          <!-- Pregunta principal -->
          <div class="text-center">
            <p class="font-display font-bold text-slate-800 oscuro:text-texto text-base sm:text-lg leading-tight">
              ¿Estás completamente seguro?
            </p>
            <p class="text-sm text-slate-600 oscuro:text-texto-secundario mt-1.5 leading-snug">
              Estás a punto de eliminar al socio
              <strong class="text-[color:var(--brand-danger)] oscuro:text-peligro">«{{ socioAEliminar.socio?.nombre }}»</strong>
              de esta natillera.
            </p>
          </div>

          <!-- Advertencia: callout danger -->
          <div class="modal-callout-danger">
            <div class="flex items-start gap-2.5">
              <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0 text-[color:var(--brand-danger)] oscuro:text-peligro mt-0.5" />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-[color:var(--brand-danger)] oscuro:text-peligro text-sm">
                  Se perderá toda la información
                </p>
                <p class="text-xs text-red-700 oscuro:text-red-300 mt-0.5">
                  Esta acción eliminará permanentemente:
                </p>
                <ul class="mt-2 space-y-1.5 text-xs text-red-700 oscuro:text-red-300">
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
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
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
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex flex-col-reverse sm:flex-row gap-2.5">
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
          <CargaBoton v-if="eliminando" pequena />
          <TrashIcon v-else class="w-4 h-4" />
          {{ eliminando ? 'Eliminando…' : 'Sí, eliminar' }}
        </button>
      </div>
    </ModalWrapper>

    <!-- Modal Retirar Socio — patrón estándar (skill natillerapp-modals + DS).
         El estado en base de datos sigue siendo `inactivo`: solo cambia cómo se llama
         de cara al usuario, porque «desactivar» sonaba a borrado y no lo es. -->
    <ModalWrapper
      :show="!!socioADesactivar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="28rem"
      @close="!desactivando && cerrarModalDesactivar()"
    >
      <!-- Cabecera warning (ámbar): comunica acción reversible pero crítica -->
      <div class="flex-shrink-0 bg-[color:var(--brand-warning)] text-white">
        <!-- Móvil: una sola fila -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <XCircleIcon class="w-5 h-5 text-[color:var(--brand-warning)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              Retirar socio
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
            <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <XCircleIcon class="w-6 h-6 text-[color:var(--brand-warning)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              Retirar socio
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
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalDesactivarSocio"
        >

          <!--
            Orden deliberado: primero CUÁNTO se le entrega, que es la única cifra por la
            que se abre esta ventana; después de dónde sale; y al final las dos decisiones
            (sanción y forma de pago). Antes empezaba por el toggle de sanción, o sea
            pidiendo decidir un descuento sobre un número que todavía no se había visto.
          -->

          <!--
            La sanción va arriba del todo: es la única decisión que cambia la cifra de
            abajo, así que se decide antes de leerla. En rosa, no en el ámbar de la
            cabecera ni en el verde de lo que se entrega: es dinero que se resta.
          -->
          <section class="retiro-sancion" :class="{ 'is-active': desactivarSancionar }">
            <button
              type="button"
              class="retiro-sancion__cabecera"
              :aria-pressed="desactivarSancionar"
              @click="desactivarSancionar = !desactivarSancionar"
            >
              <span class="retiro-sancion__icono" aria-hidden="true">
                <ReceiptPercentIcon class="h-5 w-5" />
              </span>
              <span class="min-w-0 flex-1 text-left">
                <span class="retiro-sancion__titulo">Sanción por retiro</span>
                <span class="retiro-sancion__sub">Se descuenta del ahorro y queda en el fondo</span>
              </span>
              <span class="retiro-sancion__switch" aria-hidden="true">
                <span class="retiro-sancion__bolita"></span>
              </span>
            </button>

            <div v-if="desactivarSancionar" class="retiro-sancion__cuerpo">
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="pct in PORCENTAJES_SANCION_RETIRO"
                  :key="pct"
                  type="button"
                  class="retiro-pct"
                  :class="{ 'is-active': Number(desactivarPorcentajeSancion) === pct }"
                  @click="desactivarPorcentajeSancion = pct"
                >{{ pct }} %</button>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <label for="desactivar-porcentaje" class="whitespace-nowrap text-xs text-rose-700/80 oscuro:text-rose-300/80">Otro</label>
                <div class="relative flex-1">
                  <input
                    id="desactivar-porcentaje"
                    v-model.number="desactivarPorcentajeSancion"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    inputmode="decimal"
                    class="ds-input pr-8"
                    placeholder="0"
                  />
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 oscuro:text-texto-tenue">%</span>
                </div>
              </div>
            </div>
          </section>

          <!--
            Préstamo pendiente: lo que se le devuelve (ya sin la sanción) puede pagar lo que
            debe. Naranja, un tono distinto del rosa de la sanción y del verde de lo que se
            lleva: es dinero que tampoco sale, pero por otra razón.
          -->
          <section
            v-if="loadingPrestamosRetiro || deudaPrestamosRetiro > 0"
            class="retiro-prestamo"
            :class="{ 'is-active': cruzarPrestamoRetiro && deudaPrestamosRetiro > 0 }"
          >
            <p v-if="loadingPrestamosRetiro" class="px-4 py-3.5 text-sm text-slate-500 oscuro:text-texto-suave">Revisando préstamos…</p>
            <template v-else>
              <button
                type="button"
                class="retiro-prestamo__cabecera"
                :aria-pressed="cruzarPrestamoRetiro"
                @click="cruzarPrestamoRetiro = !cruzarPrestamoRetiro"
              >
                <span class="retiro-prestamo__icono" aria-hidden="true">
                  <BanknotesIcon class="h-5 w-5" />
                </span>
                <span class="min-w-0 flex-1 text-left">
                  <span class="retiro-prestamo__titulo">Debe ${{ formatMoney(deudaPrestamosRetiro) }} de préstamo</span>
                  <span class="retiro-prestamo__sub">Pagarlo con lo que se le devuelve</span>
                </span>
                <span class="retiro-prestamo__switch" aria-hidden="true">
                  <span class="retiro-prestamo__bolita"></span>
                </span>
              </button>

              <div class="retiro-prestamo__cuerpo">
                <div class="modal-data-list">
                  <div class="modal-data-list__row">
                    <span class="modal-data-list__label">Saldo del préstamo</span>
                    <span class="modal-data-list__value tabular-nums">${{ formatMoney(saldoPrestamosRetiro) }}</span>
                  </div>
                  <div v-if="moraPrestamosRetiro > 0" class="modal-data-list__row">
                    <span class="modal-data-list__label">Mora a hoy</span>
                    <span class="modal-data-list__value modal-data-list__value--danger tabular-nums">${{ formatMoney(moraPrestamosRetiro) }}</span>
                  </div>
                </div>
                <p v-if="cruzarPrestamoRetiro && pagoPrestamosRetiro > 0" class="retiro-prestamo__nota">
                  <template v-if="saldoPendienteRetiro > 0">
                    Alcanza para <strong>${{ formatMoney(pagoPrestamosRetiro) }}</strong>.
                    Queda debiendo <strong>${{ formatMoney(saldoPendienteRetiro) }}</strong>.
                  </template>
                  <template v-else>
                    Se paga completo: <strong>${{ formatMoney(pagoPrestamosRetiro) }}</strong>.
                  </template>
                </p>
                <p v-else-if="!cruzarPrestamoRetiro" class="retiro-prestamo__nota">
                  Se le entrega todo y el préstamo sigue abierto por ${{ formatMoney(deudaPrestamosRetiro) }}.
                </p>
              </div>
            </template>
          </section>

          <!-- 2. La cifra que manda -->
          <section class="retiro-hero">
            <p class="retiro-hero__label">
              {{ hayRepartoRetiro
                  ? `Cómo se reparte el ahorro de ${primerNombreSocioARetirar}`
                  : `Se le entrega a ${primerNombreSocioARetirar}` }}
            </p>
            <p v-if="loadingTotalesDesactivar" class="retiro-hero__valor retiro-hero__valor--cargando">
              Calculando…
            </p>
            <p
              v-else-if="!hayRepartoRetiro"
              class="retiro-hero__valor tabular-nums"
            >
              ${{ formatMoney(entregaFinalRetiro) }}
            </p>
            <!--
              El reparto explícito: quién se lleva qué. Antes era una nota al pie y el
              dinero que retiene la natillera se leía como letra pequeña, cuando es la
              mitad de la decisión.
            -->
            <div
              v-if="!loadingTotalesDesactivar && hayRepartoRetiro"
              class="retiro-reparto"
            >
              <div class="retiro-reparto__col">
                <span class="retiro-reparto__label">Se lleva el socio</span>
                <span class="retiro-reparto__valor retiro-reparto__valor--socio tabular-nums">
                  ${{ formatMoney(entregaFinalRetiro) }}
                </span>
              </div>
              <template v-if="pagoPrestamosRetiro > 0">
                <span class="retiro-reparto__sep" aria-hidden="true"></span>
                <div class="retiro-reparto__col">
                  <span class="retiro-reparto__label">Paga préstamo</span>
                  <span class="retiro-reparto__valor retiro-reparto__valor--prestamo tabular-nums">
                    ${{ formatMoney(pagoPrestamosRetiro) }}
                  </span>
                </div>
              </template>
              <span v-if="desactivarSancionar && valorFondoDesactivar > 0" class="retiro-reparto__sep" aria-hidden="true"></span>
              <div v-if="desactivarSancionar && valorFondoDesactivar > 0" class="retiro-reparto__col">
                <span class="retiro-reparto__label">Queda en el fondo</span>
                <span class="retiro-reparto__valor retiro-reparto__valor--fondo tabular-nums">
                  ${{ formatMoney(valorFondoDesactivar) }}
                </span>
                <span class="retiro-reparto__pie">{{ desactivarPorcentajeSancion }} % de sanción</span>
              </div>
            </div>
          </section>

          <!-- 3. De dónde sale esa cifra -->
          <section>
            <h4 class="ds-overline mb-2">De dónde sale</h4>
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

          <!-- 4. Forma de pago -->
          <section>
            <h4 class="ds-overline mb-2">¿Cómo se le entrega?</h4>
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
            <p class="mt-2 text-[11px] leading-snug text-slate-500 oscuro:text-texto-suave">
              Saldrá del cuadre de caja por esta forma de pago.
            </p>
          </section>

        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalDesactivarSocio"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
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
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex flex-col-reverse sm:flex-row gap-2.5">
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
          <CargaBoton v-if="desactivando" pequena />
          <XCircleIcon v-else class="w-4 h-4" />
          {{ desactivando ? 'Retirando…' : 'Confirmar retiro' }}
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
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="28rem"
      @close="!activando && cerrarModalActivar()"
    >
      <!-- Cabecera success (verde) — reactivación positiva -->
      <div class="flex-shrink-0 bg-[color:var(--brand-success)] text-white">
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
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
            <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
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
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-5 pb-5 space-y-4"
          @scroll.passive="programarNatiscrollModalActivarSocio"
        >
          <div class="text-center">
            <p class="font-display font-bold text-slate-800 oscuro:text-texto text-base sm:text-lg leading-tight">
              ¿Reactivar a este socio?
            </p>
            <p class="text-sm text-slate-600 oscuro:text-texto-secundario mt-1.5 leading-snug">
              <strong class="text-[color:var(--brand-success)] oscuro:text-exito">«{{ socioAActivar?.socio?.nombre }}»</strong>
              volverá a estar activo en esta natillera.
            </p>
          </div>

          <div class="modal-callout-success">
            <CheckCircleIcon class="w-5 h-5 flex-shrink-0 text-[color:var(--brand-success)] oscuro:text-exito mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[color:var(--brand-success)] oscuro:text-exito text-sm">
                Movimientos automáticos
              </p>
              <p class="text-xs text-emerald-800/85 oscuro:text-emerald-300/85 mt-0.5 leading-snug">
                Se deshace la liquidación del retiro: vuelve a la caja la plata que salió, se quita la sanción de las utilidades y, si su ahorro pagó un préstamo, el préstamo vuelve a quedar con ese saldo (y se descuenta la mora que se había cobrado).
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
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-superficie-tarjeta/88 via-superficie-tarjeta/40 to-transparent"
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
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex flex-col-reverse sm:flex-row gap-2.5">
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
          <CargaBoton v-if="activando" pequena />
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
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
      card-max-width="28rem"
      @close="!generandoImagenDesactivacion && cerrarComprobanteDesactivacion()"
    >
      <!-- Cabecera verde de marca: la misma del ticket que va dentro -->
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <DocumentTextIcon class="w-5 h-5 text-[color:var(--brand-primary)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight truncate">
              Comprobante de retiro
            </h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">
              Liquidación del socio al retirarse
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
            <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <DocumentTextIcon class="w-6 h-6 text-[color:var(--brand-primary)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">
              Comprobante de retiro
            </h3>
            <p class="text-xs text-white/85 leading-snug mt-1 max-w-[20rem]">
              Liquidación del socio al retirarse
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
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#eef2ee] oscuro:bg-superficie-hundida overscroll-contain [-webkit-overflow-scrolling:touch] px-4 sm:px-5 py-4"
          @scroll.passive="programarNatiscrollModalComprobanteDesactivacion"
        >
        <ComprobanteRetiroSocio
          v-if="comprobanteDesactivacion"
          :datos="comprobanteDesactivacion"
          :fluido="true"
        />
        </div>

        <!-- Natiscroll: overlay absoluto sobre el cuerpo, justo arriba del footer fijo -->
        <div
          v-show="hayNatiscrollModalComprobanteDesactivacion"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t from-[#eef2ee]/95 oscuro:from-superficie-hundida/95 via-[#eef2ee]/55 oscuro:via-superficie-hundida/55 to-transparent"
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
      <div class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex gap-3">
        <button
          type="button"
          class="btn-descargar flex-1"
          :disabled="!imagenDesactivacion"
          @click="descargarComprobanteDesactivacion"
        >
          <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
          Descargar
        </button>
        <!--
          Sin await antes de `navigator.share`: la imagen ya está hecha
          (`prepararImagenDesactivacion`). Safari solo abre el menú de compartir si la
          llamada va pegada al toque.
        -->
        <button
          type="button"
          class="btn-compartir flex-1"
          :disabled="!imagenDesactivacion"
          @click="compartirWhatsAppDesactivacion"
        >
          <ShareIcon class="w-5 h-5 flex-shrink-0" />
          {{ imagenDesactivacion ? 'Compartir' : 'Preparando…' }}
        </button>
      </div>
    </ModalWrapper>

    <!--
      Copia del comprobante de retiro a 380 px fijos, fuera de pantalla: es la que se
      convierte en imagen. La vista previa se ajusta al ancho del modal y saldría
      distinta en cada teléfono.
    -->
    <div
      v-if="comprobanteDesactivacion"
      class="pointer-events-none fixed left-[-10000px] top-0"
      aria-hidden="true"
    >
      <div ref="comprobanteDesactivacionRef" data-tema="claro" style="padding: 16px; background: #eef2ee;">
        <ComprobanteRetiroSocio :datos="comprobanteDesactivacion" />
      </div>
    </div>

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
            <div class="relative bg-superficie-tarjeta/95 rounded-[2rem] shadow-2xl shadow-natillera-700/20 overflow-hidden border border-white/50 oscuro:border-borde">
              <!-- Gradiente superior decorativo -->
              <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-natillera-600 via-natillera-700 to-natillera-800 opacity-10"></div>


              <div class="relative p-8 pb-10">
                <!--
                  Mientras trabaja (crear, generar cuotas, poner al día): la alcancía de todas
                  las esperas de la app (CLAUDE.md 2.1), no iconos ni giros propios.
                -->
                <FiguraAlcancia v-if="progresoProcesando" class="mx-auto mb-8 h-28 w-28" />
                <!-- Éxito o error: el círculo de marca con su icono -->
                <div v-else class="relative mx-auto mb-8 w-28 h-28">
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
                        <!-- tema-fijo: insignia blanca dentro del círculo verde -->
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <PlusIcon class="w-3 h-3 text-natillera-700" />
                        </div>
                      </div>
                    </template>
                    
                    <!-- Estado: Generando cuotas -->
                    <template v-else-if="progresoCreacion.paso === 2">
                      <div class="relative">
                        <SparklesIcon class="w-12 h-12 text-white drop-shadow-lg animate-sparkle" />
                        <!-- Mini estrellas que salen (tema-fijo: brillos amarillos dentro del círculo verde) -->
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
                <h3 class="text-2xl font-display font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 oscuro:from-texto-fuerte oscuro:via-texto oscuro:to-texto-fuerte bg-clip-text text-transparent text-center mb-1">
                  {{ progresoCreacion.nombreSocio }}
                </h3>

                <!-- Mensaje de progreso con animación sutil -->
                <p
                  :class="[
                    'text-center text-base font-medium mb-6 transition-all duration-500',
                    progresoCreacion.exito ? 'text-natillera-700 oscuro:text-natillera-300' :
                    progresoCreacion.error && progresoCreacion.paso === 0 ? 'text-red-500' : 'text-texto-suave'
                  ]"
                >
                  {{ progresoCreacion.mensaje }}
                </p>

                <!-- Timeline de pasos - Diseño minimalista y elegante -->
                <div class="relative mb-8">
                  <!-- Línea de conexión -->
                  <div class="absolute top-4 left-8 right-8 h-0.5 bg-superficie-hundida rounded-full overflow-hidden">
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
                            : 'bg-superficie-hundida text-texto-tenue'
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
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 1 ? 'text-natillera-700 oscuro:text-natillera-300' : 'text-texto-tenue']">Socio</span>
                    </div>

                    <!-- Paso 2: Cuotas -->
                    <div class="flex flex-col items-center">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 2
                            ? 'bg-gradient-to-br from-natillera-600 to-natillera-800 text-white shadow-lg shadow-natillera-700/30 scale-110'
                            : 'bg-superficie-hundida text-texto-tenue'
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
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 2 ? 'text-natillera-700 oscuro:text-natillera-300' : 'text-texto-tenue']">Cuotas</span>
                    </div>

                    <!-- Paso 3: Listo -->
                    <div class="flex flex-col items-center">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 transform',
                          progresoCreacion.paso >= 3
                            ? 'bg-gradient-to-br from-natillera-600 to-natillera-800 text-white shadow-lg shadow-natillera-700/30 scale-110'
                            : 'bg-superficie-hundida text-texto-tenue'
                        ]"
                      >
                        <template v-if="progresoCreacion.paso >= 3">
                          <svg class="w-4 h-4 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                        <span v-else class="text-xs font-bold">3</span>
                      </div>
                      <span :class="['text-xs mt-2 font-medium transition-colors', progresoCreacion.paso >= 3 ? 'text-natillera-700 oscuro:text-natillera-300' : 'text-texto-tenue']">¡Listo!</span>
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

                      <div class="relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-natillera-50 oscuro:from-natillera-500/15 to-natillera-100 oscuro:to-natillera-500/10 border border-natillera-200/60 oscuro:border-natillera-500/30 rounded-2xl">
                        <div class="w-10 h-10 bg-gradient-to-br from-natillera-600 to-natillera-800 rounded-xl flex items-center justify-center shadow-lg shadow-natillera-700/30">
                          <SparklesIcon class="w-5 h-5 text-white" />
                        </div>
                        <div class="text-left">
                          <p class="text-2xl font-bold bg-gradient-to-r from-natillera-700 to-natillera-800 oscuro:from-natillera-300 oscuro:to-natillera-400 bg-clip-text text-transparent">
                            {{ progresoCreacion.cuotasGeneradas }}
                          </p>
                          <p class="text-xs text-texto-suave font-medium">cuotas generadas</p>
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
                    <p class="text-sm text-texto-tenue">El modal se cerrará automáticamente...</p>
                  </div>
                </Transition>

                <!-- Mensaje de error con botón de cerrar -->
                <div v-if="progresoCreacion.error && progresoCreacion.paso === 0" class="mt-6 text-center">
                  <div class="mb-4 p-3 bg-red-50 oscuro:bg-red-500/15 border border-red-100 oscuro:border-red-500/30 rounded-xl">
                    <p class="text-sm text-red-600 oscuro:text-red-300">{{ progresoCreacion.error }}</p>
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
              <div class="h-1.5 bg-superficie-hundida">
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
import CargaBoton from '../../components/carga/CargaBoton.vue'
import { detectIosPlatform } from '../../composables/useIsIos'
import { cerrarRecorridosDriver } from '../../composables/recorridoDriverSeguro'
import SocioFormModal from '../../components/socios/SocioFormModal.vue'
import IconoWhatsApp from '../../components/iconos/IconoWhatsApp.vue'
import { avatarSeeds, getAvatarUrl } from '../../utils/avatarSocio'
import { useEditarSocio } from '../../composables/useEditarSocio'
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch, Transition, TransitionGroup, inject } from 'vue'
import { usePermisosNatillera } from '../../composables/usePermisosNatillera'
import { useRoute, useRouter } from 'vue-router'
import { useSociosStore } from '../../stores/socios'
import { useCuotasStore } from '../../stores/cuotas'
import { useNatillerasStore } from '../../stores/natilleras'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useNotificationStore } from '../../stores/notifications'
import { natilleraPrestamosDeshabilitados } from '../../utils/natilleraPrestamos'
import { normalizeText } from '../../utils/normalizeText.js'
import { normalizarCelular, esTelefonoValido, errorCelular, numeroWhatsApp } from '../../utils/telefono'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { supabase } from '../../lib/supabase'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useScrollInfinito } from '../../composables/useScrollInfinito'
import { isTourEnabled } from '../../config/toursEnabled'
import { shouldShowNatilleraMenuTour, startNatilleraMenuTour } from '../../composables/useNatilleraMenuTour'
import {
  shouldShowPrimerSocioSociosNavTour,
  startPrimerSocioSociosNavTour,
  consumePendingPrimerSocioNavTour
} from '../../composables/usePrimerSocioSociosNavTour'
import {
  setPendingPrimerSocioCuotasMesTour,
  setPrimerFlujoSocioNatilleraId,
  shouldShowPrimerSocioCuotasMesTour,
  startPrimerSocioCuotasNavHighlight
} from '../../composables/usePrimerSocioCuotasMesTour'
import { pedirGuiaDetalle } from '../../composables/useTourDetalleNatillera'
import { toPng } from 'html-to-image'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import FiguraAlcancia from '../../components/carga/FiguraAlcancia.vue'
import { useSoporteStore } from '../../stores/soporte'
import { capturarCompleto } from '../../composables/useCapturaCompleta'
import SwitchSegmentado from '../../components/SwitchSegmentado.vue'
import PonerAlDiaMasivoModal from '../../components/socios/PonerAlDiaMasivoModal.vue'
import { cuotasParaPonerAlDia, ponerSocioAlDia, total4x1000DeCuotas } from '../../composables/usePonerAlDia'
import CargaPantalla from '../../components/carga/CargaPantalla.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import ComprobanteRetiroSocio from '../../components/estado/ComprobanteRetiroSocio.vue'
import { cargarDeudaPrestamosSocio, registrarAbonoPrestamo, revertirAbonoPrestamo } from '../../composables/usePagoPrestamo'
import { EVENTO_SOLICITUDES, EVENTO_SOLICITUDES_CAMBIO } from '../../composables/useSolicitudesVinculo'
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
  CameraIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ShareIcon,
  TrashIcon,
  SparklesIcon,
  CheckIcon,
  BuildingOffice2Icon,
  ReceiptPercentIcon,
  LinkIcon,
  CheckBadgeIcon,
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
const { guardarEdicionSocio } = useEditarSocio()
const colaboradoresStore = useColaboradoresStore()
const dashboardSidebar = inject('dashboardSidebar', null)

const modalAgregar = ref(false)

const modalDetalle = ref(false)
const modalImportar = ref(false)
const modalCuotasSocio = ref(false)
const animacionesCuotasMora = ref(true) // Controla si se muestran las animaciones de cuotas en mora
const modalProgreso = ref(false)

// Bloquear scroll del body cuando las modales están abiertas
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


const errorSocio = ref('')
const errorTelefonoDuplicado = ref(false)
// El aviso de formato sale al salir del campo o al llegar a 10 dígitos, no con la primera tecla.
const telefonoTocado = ref(false)
const cuotasSocio = ref([])
const loadingDetalle = ref(false)
const busqueda = ref('')
const inputBusquedaSocios = ref(null)
/** Evita repetir el foco automático al entrar (p. ej. al importar más socios) */
const enfocoBusquedaInicialHecho = ref(false)
const socioAEliminar = ref(null)
useBodyScrollLock(computed(() => !!socioAEliminar.value))

/** Atajos de sanción por retiro. El 0 deja la sanción en cero sin apagar el toggle. */
const PORCENTAJES_SANCION_RETIRO = [0, 10, 20, 50]

/** Solo el primer nombre: «Se le entrega a María» lee mejor que el nombre completo. */
const primerNombreSocioARetirar = computed(() => {
  const nombre = (socioADesactivar.value?.socio?.nombre || '').trim()
  return nombre ? nombre.split(/\s+/)[0] : 'el socio'
})

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
/** Imagen del comprobante de retiro ya generada ({ dataUrl, archivo }), lista para compartir sin esperas. */
const imagenDesactivacion = ref(null)

/*
 * Préstamos vivos del socio que se retira: [{ id, saldo, mora, total, cuotasVencidasOrdenadas }].
 * Lo que se le devuelve (ya sin la sanción) puede pagarlos; por defecto se cruza, porque
 * es lo que dice cualquier reglamento: nadie se va con plata debiendo plata.
 */
/*
 * «Socios en la app» (invitar, aprobar, cuentas vinculadas) es una página propia:
 * SociosEnApp.vue. Aquí solo queda el aviso de solicitudes pendientes que lleva a ella.
 */
function irASociosEnApp() {
  router.push({ name: 'SociosEnApp', params: { id } })
}

const solicitudesVinculo = ref([])
const desvinculando = ref(false)

async function cargarSolicitudesVinculo() {
  if (!id) return
  const { data, error } = await supabase
    .from('solicitudes_vinculo')
    .select('id, socio_id, usuario_id, cuenta_email, cuenta_nombre, cuenta_telefono, creado_en')
    .eq('natillera_id', id)
    .eq('estado', 'pendiente')
    .order('creado_en', { ascending: true })
  if (error) {
    console.error('Error cargando solicitudes de vínculo:', error)
    return
  }
  solicitudesVinculo.value = data || []
}

// El socio puede volver a pedir acceso con el enlace: por eso no se pide confirmación.
async function desvincularSocio(sn) {
  if (!sn?.socio?.id) return
  desvinculando.value = true
  try {
    const { error } = await supabase.rpc('desvincular_socio', { p_socio_id: sn.socio.id })
    if (error) throw error
    sn.socio.usuario_id = null
    sn.socio.vinculado_email = null
    sn.socio.vinculado_en = null
    notificationStore.success(`${sn.socio.nombre || 'El socio'} ya no está vinculado a esa cuenta`, 'Desvinculado')
  } catch (e) {
    console.error('Error desvinculando socio:', e)
    notificationStore.error('No se pudo desvincular', 'Error')
  } finally {
    desvinculando.value = false
  }
}

/*
 * Si se aprueba o rechaza desde el aviso global (layout), reflejarlo aquí sin recargar:
 * quitar la solicitud y marcar al socio como vinculado.
 */
function alResolverSolicitudFuera(evento) {
  const { solicitud, aprobada } = evento.detail || {}
  if (!solicitud) return
  solicitudesVinculo.value = solicitudesVinculo.value.filter(s =>
    aprobada ? s.socio_id !== solicitud.socio_id : s.id !== solicitud.id)
  if (!aprobada) return
  const sn = (sociosStore.sociosNatillera || []).find(x => x.socio?.id === solicitud.socio_id)
  if (sn?.socio) {
    sn.socio.usuario_id = solicitud.usuario_id
    sn.socio.vinculado_email = solicitud.cuenta_email
  }
}
onMounted(() => {
  cargarSolicitudesVinculo()
  window.addEventListener(EVENTO_SOLICITUDES, alResolverSolicitudFuera)
  // Llegó una solicitud nueva (tiempo real, desde el aviso global): refrescar el aviso.
  window.addEventListener(EVENTO_SOLICITUDES_CAMBIO, cargarSolicitudesVinculo)
})
onUnmounted(() => {
  window.removeEventListener(EVENTO_SOLICITUDES, alResolverSolicitudFuera)
  window.removeEventListener(EVENTO_SOLICITUDES_CAMBIO, cargarSolicitudesVinculo)
})
const prestamosRetiro = ref([])
const loadingPrestamosRetiro = ref(false)
const cruzarPrestamoRetiro = ref(true)
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
// Primera entrada a la vista: pantalla completa. Las recargas posteriores no la muestran,
// para no tapar la lista que el usuario ya tiene delante.
const cargandoPrimeraVez = computed(() => cargaInicial.value && sociosStore.loading)
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
const seccionActiva = ref(null)  // 'contacto' o null (el resumen financiero es fijo y las cuotas se ven en su propia modal)

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
    // La sección del préstamo aparece al llegar la consulta y cambia el alto del cuerpo.
    loadingPrestamosRetiro,
    cruzarPrestamoRetiro,
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

// Filtros de la tabla
const filtroEstado = ref('todos')           // 'todos' | 'activo' | 'inactivo'
const filtroPeriodicidad = ref('todos')     // 'todos' | 'mensual' | 'quincenal'

const sociosFiltrados = computed(() => {
  let res = sociosStore.sociosNatillera
  const termino = normalizeText(busqueda.value)
  if (termino) {
    res = res.filter(sn =>
      normalizeText(sn.socio?.nombre).includes(termino) ||
      normalizeText(sn.socio?.documento).includes(termino) ||
      normalizeText(sn.socio?.telefono).includes(termino) ||
      normalizeText(sn.socio?.email).includes(termino)
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

/**
 * La lista crece al bajar, en vez de repartirse en páginas numeradas: con el pulgar es
 * más natural seguir deslizando que buscar el «3». Vale para la tabla de escritorio y
 * para las tarjetas de móvil, porque las dos leen `sociosMostrados`.
 */
const {
  centinelaRef,
  mostrados: sociosMostrados,
  hayMas: hayMasSocios,
  huboVariasTandas: hayVariasTandasDeSocios,
  cargarMas: cargarMasSocios,
  reiniciar: volverALaPrimeraTandaDeSocios
} = useScrollInfinito(sociosFiltrados, { porTanda: 10, margen: '250px 0px' })

watch([busqueda, filtroEstado, filtroPeriodicidad], volverALaPrimeraTandaDeSocios)

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

// Móvil: el foco programático de la búsqueda no debe abrir el teclado virtual.
// detectIosPlatform cubre el iPad que se anuncia como MacIntel, que el regex dejaba fuera.
function esDispositivoMovil() {
  if (detectIosPlatform()) return true
  if (/Android/i.test(navigator.userAgent)) return true
  return window.innerWidth <= 768 && 'ontouchstart' in window
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

/**
 * Del detalle al listado de cuotas. El detalle se queda abierto debajo a propósito: el
 * bloqueo de scroll lleva un contador global y `handlePopState` cierra la modal de cuotas
 * antes que el detalle, así que cerrar la de arriba devuelve al socio donde estaba.
 */
function verCuotasDesdeDetalle() {
  const socio = socioSeleccionado.value
  if (!socio) return
  verCuotasSocio(socio)
}

const formSocio = reactive({
  nombre: '',
  documento: '',
  email: '',
  telefono: '',
  valor_cuota: 0, // Iniciar en 0 para forzar al usuario a ingresar un valor explícitamente
  periodicidad: 'mensual',
  avatar_seed: '',
  avatar_style: 'adventurer',
  // «Ya está al día»: al crearlo, registrar como pagadas sus cuotas ya vencidas (usePonerAlDia)
  al_dia: false,
  al_dia_forma_pago: 'efectivo',
  al_dia_4x1000: false
})

/*
 * La natillera ya empezó (su primer mes es este o uno anterior) y genera cuotas solas: un
 * socio nuevo nacería con cuotas vencidas. Solo entonces se ofrece «Ya está al día».
 */
const natilleraYaEmpezo = computed(() => {
  const n = natillerasStore.natilleraActual
  if (!n || n.id !== id || n.cuotas_automaticas === false) return false
  const anio = Number(n.anio_inicio) || null
  const mes = Number(n.mes_inicio) || null
  if (!anio || !mes) return false
  const hoy = new Date()
  return anio * 12 + mes <= hoy.getFullYear() * 12 + hoy.getMonth() + 1
})





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
/*
 * Solo lectura según el nivel en «Socios» (Nada / Ver / Gestionar). Antes solo miraba si el
 * rol era visor, y un colaborador sin permiso de socios podía escribir. El nombre se queda
 * `esVisor` porque la plantilla lo usa en muchos sitios; hoy significa «no puede gestionar».
 */
const permisosNat = usePermisosNatillera(computed(() => props.id || route.params.id))
const esVisor = computed(() => !permisosNat.puedeGestionar('socios'))

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




async function abrirModalAgregar() {
  // Asegurar que la natillera esté cargada para obtener su periodicidad
  if (!natillerasStore.natilleraActual || natillerasStore.natilleraActual.id !== id) {
    await natillerasStore.fetchNatillera(id)
  }
  
  // IMPORTANTE: Resetear el formulario completamente antes de abrir el modal
  // para asegurar que no haya valores residuales
  telefonoTocado.value = false
  Object.assign(formSocio, {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 0, // Iniciar en 0 para forzar al usuario a ingresar un valor
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer',
    al_dia: false,
    al_dia_forma_pago: 'efectivo',
    al_dia_4x1000: false
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
  // Al editar se avisa de una vez si el número guardado no es un celular válido.
  telefonoTocado.value = true
  formSocio.valor_cuota = sn.valor_cuota_individual
  formSocio.periodicidad = sn.periodicidad || 'mensual'
  formSocio.avatar_seed = sn.socio?.avatar_seed || ''
  modalAgregar.value = true
}

function cerrarModal() {
  modalAgregar.value = false
  socioEditando.value = null
  errorSocio.value = ''
  errorTelefonoDuplicado.value = false
  telefonoTocado.value = false
  Object.assign(formSocio, {
    nombre: '',
    documento: '',
    email: '',
    telefono: '',
    valor_cuota: 0, // Resetear a 0 para forzar al usuario a ingresar un valor
    periodicidad: 'mensual',
    avatar_seed: '',
    avatar_style: 'adventurer',
    al_dia: false,
    al_dia_forma_pago: 'efectivo',
    al_dia_4x1000: false
  })
}

// Función auxiliar para limpiar y formatear número de teléfono
// Quita el indicativo de país (57 o +57) para dejar solo el número
function limpiarNumeroTelefono(telefono) {
  return normalizarCelular(telefono)
}


function programarTourMenuNatilleraSiCorresponde(eraListaVaciaAntes, natilleraId) {
  if (!eraListaVaciaAntes || !natilleraId) return

  /*
   * Acaba de nacer la natillera: se ha creado y ya tiene su primer socio. Es el
   * momento de enseñar la pantalla principal, cuando por fin hay algo que
   * mirar —antes estaba vacía y explicarla no habría servido de nada—.
   *
   * Se deja además la marca del recorrido de Cuotas: no se pierde, se retoma
   * cuando el usuario entre ahí. Encadenar dos guías a la vez sería abrumar.
   */
  setPendingPrimerSocioCuotasMesTour(natilleraId)
  pedirGuiaDetalle()
  router.push(`/natilleras/${natilleraId}`)
}

/**
 * Recorridos anteriores del primer socio (driver.js), que llevaban a Cuotas.
 *
 * Ya no se invocan: al crear el primer socio la app va al detalle y muestra
 * allí la guía nueva. Se conservan enteros, con sus banderas en
 * `config/toursEnabled.js`, porque el resalte de «Cuotas» sigue siendo útil y
 * puede volver a encadenarse aquí en cuanto se decida.
 */
// eslint-disable-next-line no-unused-vars
function programarToursAnterioresPrimerSocio(natilleraId) {
  const veniaDeModalSinSocios = consumePendingPrimerSocioNavTour(natilleraId)

  // Caso A: recorrido de «Socios» habilitado → resalta Socios y encadena a Cuotas al cerrarse.
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

  // Caso B: recorrido de «Cuotas» habilitado (sin el de «Socios») → al crear el primer socio
  // NO se navega solo: se deja la marca pendiente y se resalta «Cuotas» en la navegación
  // (barra lateral en escritorio, inferior en móvil). El usuario debe tocar «Cuotas»; al
  // aterrizar en esa vista el recorrido continúa resaltando «Registrar Pago».
  if (shouldShowPrimerSocioCuotasMesTour(natilleraId)) {
    setPendingPrimerSocioCuotasMesTour(natilleraId)
    nextTick(() => {
      setTimeout(() => {
        startPrimerSocioCuotasNavHighlight({
          natilleraId,
          prepareSidebarForTour: dashboardSidebar?.prepareSidebarForTour,
          clearSidebarAfterTour: dashboardSidebar?.clearSidebarAfterTour
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

/*
 * Edición: la regla vive en useEditarSocio (la misma que usa Cuotas). Aquí solo va lo de
 * esta vista: el modal de progreso cuando cambia la periodicidad y refrescar el detalle.
 */
async function guardarEdicionDesdeSocios() {
  const sn = socioEditando.value
  const datos = { ...formSocio }
  const cambiaPeriodicidad = (sn.periodicidad || 'mensual') !== (datos.periodicidad || 'mensual')

  const refrescarDetalle = () => {
    if (!modalDetalle.value || socioSeleccionado.value?.id !== sn.id) return
    const actualizado = sociosStore.sociosNatillera.find(s => s.id === sn.id)
    if (actualizado) socioSeleccionado.value = actualizado
  }

  if (cambiaPeriodicidad) {
    // El formulario se cierra y el progreso toma su lugar: regenerar cuotas tarda.
    cerrarModal()
    progresoCreacion.value = {
      paso: 1,
      mensaje: 'Actualizando periodicidad...',
      cuotasGeneradas: 0,
      cuotasTotales: 0,
      error: null,
      exito: false,
      nombreSocio: datos.nombre
    }
    modalProgreso.value = true
  }

  const resultado = await guardarEdicionSocio({
    natilleraId: id,
    socioNatillera: sn,
    datos,
    alProgreso: paso => Object.assign(progresoCreacion.value, paso)
  })

  // Cambiar el valor o la periodicidad rehace sus cuotas: la mora de la lista se recalcula.
  if (resultado.ok && (cambiaPeriodicidad || Number(datos.valor_cuota) !== Number(sn.valor_cuota_individual))) {
    refrescarCuotasNatillera()
  }

  if (cambiaPeriodicidad) {
    if (resultado.ok) {
      refrescarDetalle()
      setTimeout(() => cerrarModalProgreso(), 1500)
    }
    return
  }

  if (!resultado.ok) {
    if (resultado.telefonoDuplicado) errorTelefonoDuplicado.value = true
    errorSocio.value = resultado.error
    return
  }

  refrescarDetalle()
  notificationStore.success(`Los datos de ${datos.nombre} han sido actualizados correctamente`, 'Cambios guardados', 3000)
  cerrarModal()
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

    if (!esTelefonoValido(formSocio.telefono)) {
      telefonoTocado.value = true
      errorSocio.value = errorCelular(formSocio.telefono) || 'Escribe un celular de 10 dígitos que empiece por 3, o uno de otro país con + y el indicativo.'
      guardando.value = false
      return
    }

    // Limpiar el teléfono y quitar el indicativo de país
    const telefonoLimpio = limpiarNumeroTelefono(formSocio.telefono)

    if (socioEditando.value) {
      await guardarEdicionDesdeSocios()
      return
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
        const ponerAlDiaAlCrear = !!formSocio.al_dia && natilleraYaEmpezo.value
        const formaPagoAlDia = formSocio.al_dia_forma_pago || 'efectivo'
        const cobrar4x1000AlDia = formaPagoAlDia === 'transferencia' && !!formSocio.al_dia_4x1000
        
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

          // «Ya está al día»: sus cuotas vencidas se registran como pagadas en su fecha límite.
          let alDia = null
          if (ponerAlDiaAlCrear) {
            progresoCreacion.value.mensaje = 'Poniendo al día las cuotas anteriores...'
            alDia = await ponerSocioAlDia({
              socioNatillera: { id: socioNatilleraId, periodicidad: periodicidadFinal, socio: { nombre: datosSocio.nombre } },
              natilleraId: id,
              natilleraNombre: natillera?.nombre || null,
              formaPago: formaPagoAlDia,
              cobrar4x1000: cobrar4x1000AlDia,
              alAvanzar: (hechas, total) => { progresoCreacion.value.mensaje = `Poniendo al día: cuota ${hechas} de ${total}` }
            })
          }

          // «Al día» ya recarga al terminar; si no, se recarga aquí para que la mora se vea ya.
          if (!alDia) refrescarCuotasNatillera()

          progresoCreacion.value.paso = 3
          progresoCreacion.value.exito = true
          if (alDia?.fallidas > 0) {
            progresoCreacion.value.mensaje = 'Socio creado. Algunas cuotas no se pudieron poner al día.'
            progresoCreacion.value.error = `${alDia.fallidas} de ${alDia.total} cuotas quedaron pendientes. Puedes reintentarlo desde el detalle del socio.`
          } else if (alDia?.registradas > 0) {
            progresoCreacion.value.mensaje = `¡Socio creado y al día! ${alDia.registradas} cuota${alDia.registradas === 1 ? '' : 's'} registrada${alDia.registradas === 1 ? '' : 's'}.`
          } else {
            progresoCreacion.value.mensaje = '¡Socio creado exitosamente!'
          }
        } else {
          // Si hubo error en las cuotas pero el socio se creó, mostrar mensaje parcial
          refrescarCuotasNatillera()
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
/*
 * Recargar las cuotas de la natillera en segundo plano. Es lo que recalcula la mora
 * (`fetchCuotasNatillera`), y de ahí salen el aviso «N socios en mora» y el estado de cada
 * socio en la lista: sin esto, un socio recién creado con cuotas vencidas no aparecía en
 * mora hasta recargar la página.
 */
function refrescarCuotasNatillera() {
  loadingCuotas.value = true
  cuotasStore.fetchCuotasNatillera(id)
    .catch(e => console.warn('Socios: recarga de cuotas', e))
    .finally(() => { loadingCuotas.value = false })
}

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

// El modal de progreso está trabajando: ni terminó bien ni falló al crear.
const progresoProcesando = computed(() =>
  !progresoCreacion.value.exito && !(progresoCreacion.value.error && progresoCreacion.value.paso === 0)
)

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

const saldoPrestamosRetiro = computed(() => prestamosRetiro.value.reduce((s, p) => s + p.saldo, 0))
const moraPrestamosRetiro = computed(() => prestamosRetiro.value.reduce((s, p) => s + p.mora, 0))
const deudaPrestamosRetiro = computed(() => saldoPrestamosRetiro.value + moraPrestamosRetiro.value)
// Se paga lo que alcance de lo que se le devuelve: si debe más, queda debiendo el resto.
const pagoPrestamosRetiro = computed(() => {
  if (!cruzarPrestamoRetiro.value) return 0
  return Math.round(Math.max(0, Math.min(deudaPrestamosRetiro.value, valorEntregarDesactivar.value)))
})
const saldoPendienteRetiro = computed(() => Math.max(0, deudaPrestamosRetiro.value - pagoPrestamosRetiro.value))
const entregaFinalRetiro = computed(() => Math.max(0, valorEntregarDesactivar.value - pagoPrestamosRetiro.value))
const hayRepartoRetiro = computed(() =>
  (desactivarSancionar.value && valorFondoDesactivar.value > 0) || pagoPrestamosRetiro.value > 0
)

async function cargarPrestamosRetiro(socioNatilleraId) {
  loadingPrestamosRetiro.value = true
  prestamosRetiro.value = []
  try {
    const nat = natillerasStore.natilleraActual?.id === id ? natillerasStore.natilleraActual : null
    prestamosRetiro.value = await cargarDeudaPrestamosSocio(socioNatilleraId, nat)
  } catch (e) {
    console.error('Error cargando préstamos del socio a retirar:', e)
    notificationStore.error('No se pudieron revisar sus préstamos', 'Error')
  } finally {
    loadingPrestamosRetiro.value = false
  }
}

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

/**
 * Porcentaje de sanción por retiro que tiene configurado la natillera.
 *
 * Vive en `reglas_multas.sanciones.devolucion.porcentajeMulta`, el bloque «Devolución por
 * mora excesiva» de la configuración. Solo cuenta si ese bloque está activo: con la
 * devolución apagada, el reglamento no fija ninguna sanción y el modal arranca en 0.
 */
const porcentajeSancionRetiroConfigurado = computed(() => {
  const nat = natillerasStore.natilleraActual
  const devolucion = nat?.id === id ? nat?.reglas_multas?.sanciones?.devolucion : null
  if (!devolucion?.activo) return 0
  const pct = Number(devolucion.porcentajeMulta)
  return Number.isFinite(pct) && pct > 0 ? Math.min(100, pct) : 0
})

function abrirModalDesactivar(sn) {
  if (sn.estado !== 'activo') return
  socioADesactivar.value = sn
  // Se propone lo que dice el reglamento; si no hay nada configurado, nada que descontar.
  const pctConfigurado = porcentajeSancionRetiroConfigurado.value
  desactivarSancionar.value = pctConfigurado > 0
  desactivarPorcentajeSancion.value = pctConfigurado
  desactivarFormaPago.value = 'efectivo'
  cruzarPrestamoRetiro.value = true
  cargarTotalesDesactivar(sn.id)
  cargarPrestamosRetiro(sn.id)
}

function cerrarModalDesactivar() {
  socioADesactivar.value = null
  desactivarSancionar.value = false
  desactivarPorcentajeSancion.value = 0
  desactivarFormaPago.value = 'efectivo'
  prestamosRetiro.value = []
  cruzarPrestamoRetiro.value = true
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
      .select('socio_nombre, valor_entregar, valor_sancion, detalle_prestamos')
      .eq('socio_natillera_id', sn.id)
      .maybeSingle()
    // Sin poder leer el comprobante no se sabe qué deshacer: mejor no activar a medias.
    if (errComp) throw new Error(`No se pudo leer el comprobante de salida: ${errComp.message}`)

    if (comprobante) {
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

      // Deshacer el cruce con sus préstamos: vuelve a deber lo que se pagó con su ahorro,
      // porque la liquidación que lo pagó acaba de revertirse arriba.
      for (const d of (comprobante.detalle_prestamos || [])) {
        const { moraSinDescontar } = await revertirAbonoPrestamo({
          prestamoId: d.prestamo_id,
          pagoId: d.pago_id,
          abono: d.abono,
          mora: d.mora,
          formaPago: d.forma_pago,
          natilleraId
        })
        if (moraSinDescontar > 0) {
          notificationStore.warning(
            `No se pudo quitar de utilidades la mora del cruce ($${formatMoney(moraSinDescontar)}). Revísalo en el desglose de intereses.`,
            'Revisar mora',
            8000
          )
        }
      }

      // Eliminar comprobante de salida (el socio vuelve a estar activo, ya no aplica). Se
      // comprueba que de verdad se borró: si queda, la próxima reactivación lo revertiría otra vez.
      const { data: borrados, error: errBorrar } = await supabase
        .from('comprobantes_salida').delete().eq('socio_natillera_id', sn.id).select('id')
      if (errBorrar || !borrados?.length) {
        throw new Error(`No se pudo borrar el comprobante de salida${errBorrar ? `: ${errBorrar.message}` : ''}`)
      }
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

/*
 * La imagen se genera al abrir el comprobante, no al tocar «Compartir»: Safari solo abre
 * el menú de compartir si `navigator.share` va pegado al toque, y el `await` de generar
 * la imagen hacía caducar el gesto.
 */
let turnoImagenDesactivacion = 0
function nombreArchivoDesactivacion() {
  return `comprobante-retiro-${(comprobanteDesactivacion.value?.socioNombre || 'socio').trim().replace(/\s+/g, '-')}.png`
}
async function prepararImagenDesactivacion() {
  imagenDesactivacion.value = null
  if (!comprobanteDesactivacion.value) return
  const turno = ++turnoImagenDesactivacion
  generandoImagenDesactivacion.value = true
  try {
    await nextTick()
    if (!comprobanteDesactivacionRef.value) return
    const dataUrl = await toPng(comprobanteDesactivacionRef.value, { backgroundColor: '#eef2ee', pixelRatio: 2, cacheBust: true })
    const blob = await (await fetch(dataUrl)).blob()
    if (turno !== turnoImagenDesactivacion) return
    imagenDesactivacion.value = { dataUrl, archivo: new File([blob], nombreArchivoDesactivacion(), { type: 'image/png' }) }
  } catch (e) {
    console.error('Error generando la imagen del comprobante de retiro:', e)
  } finally {
    if (turno === turnoImagenDesactivacion) generandoImagenDesactivacion.value = false
  }
}
watch(comprobanteDesactivacion, prepararImagenDesactivacion)

function descargarPngDesactivacion() {
  if (!imagenDesactivacion.value) return
  const enlace = document.createElement('a')
  enlace.href = imagenDesactivacion.value.dataUrl
  enlace.download = nombreArchivoDesactivacion()
  enlace.click()
}

/**
 * En iOS un <a download> sobre data URL no guarda nada: abre la imagen en otra pestaña o
 * no hace nada, según la versión. Allí se guarda por el menú de compartir («Guardar
 * imagen»), con el File ya preparado y sin await antes de share para no perder el gesto.
 */
function descargarComprobanteDesactivacion() {
  const img = imagenDesactivacion.value
  if (!img) return
  if (!detectIosPlatform()) {
    descargarPngDesactivacion()
    return
  }
  const datos = { files: [img.archivo] }
  if (!navigator.canShare?.(datos)) {
    descargarPngDesactivacion()
    return
  }
  navigator.share(datos).catch(err => {
    if (err?.name !== 'AbortError') descargarPngDesactivacion()
  })
}

function compartirWhatsAppDesactivacion() {
  const c = comprobanteDesactivacion.value
  const img = imagenDesactivacion.value
  if (!c || !img) return
  const texto = `*👆 Abre la imagen para ver el detalle de tu liquidación*\n\nHola ${(c.socioNombre || '').split(/\s+/)[0]}, esta es tu liquidación por retiro de la natillera.`
  const datos = { files: [img.archivo], title: 'Liquidación por retiro', text: texto }
  const tel = (c.socioTelefono || '').replace(/\D/g, '')
  // Sin menú de compartir (escritorio): se descarga y, si hay número, se abre el chat.
  const abrirChat = () => {
    descargarPngDesactivacion()
    if (!tel) {
      notificationStore.info('La imagen se descargó. El socio no tiene teléfono: envíala desde WhatsApp.', 'Comprobante')
      return
    }
    const numero = numeroWhatsApp(tel)
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
  }
  if (navigator.canShare?.(datos)) {
    navigator.share(datos).catch(err => {
      if (err?.name !== 'AbortError') abrirChat()
    })
    return
  }
  abrirChat()
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
  const pagoPrestamos = pagoPrestamosRetiro.value
  const saldoPendientePrestamo = saldoPendienteRetiro.value
  const detallePrestamos = []
  // Lo que ya se escribió, para deshacerlo si algo posterior falla (no hay transacción).
  const hecho = { comprobante: false, sancionId: null, salidaId: null }
  try {
    /*
     * Cruce con los préstamos, lo primero: es lo más delicado y, si falla, el socio sigue
     * activo y no se ha movido nada más. Cada abono va por el mismo camino que «Abonar» en
     * Préstamos (mora aparte, plan recalculado). En el cuadre queda como un pago de
     * préstamo por la misma forma de pago que la liquidación, que sale completa: lo que
     * de verdad deja la caja es la diferencia, justo lo que el socio se lleva.
     */
    if (pagoPrestamos > 0) {
      const nat = natillerasStore.natilleraActual?.id === id ? natillerasStore.natilleraActual : { id: natilleraId }
      let restante = pagoPrestamos
      for (const prestamo of prestamosRetiro.value) {
        if (restante <= 0) break
        const valor = Math.min(restante, prestamo.total)
        if (valor <= 0) continue
        const r = await registrarAbonoPrestamo({ prestamo, valor, formaPago: formaPagoNorm, natillera: nat, nombreSocio })
        detallePrestamos.push({
          prestamo_id: prestamo.id,
          pago_id: r.pagoId,
          abono: r.abono,
          mora: r.mora,
          saldo_restante: r.saldoNuevo,
          forma_pago: formaPagoNorm
        })
        restante -= valor
      }
    }

    /*
     * El comprobante va justo después del cruce y antes de mover plata: es lo que la
     * reactivación lee para deshacer el retiro (abonos incluidos). Si no se puede guardar,
     * se aborta; antes el error solo iba a la consola y la reactivación leía un
     * comprobante viejo, dejando el préstamo pagado con plata que volvía a la caja.
     */
    const codigoComprobante = generarCodigoComprobanteSalida()
    const fechaComprobante = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const { error: errComprobante } = await supabase.from('comprobantes_salida').upsert({
      socio_natillera_id: sn.id,
      socio_nombre: nombreSocio,
      socio_telefono: sn.socio?.telefono || null,
      fecha: fechaComprobante,
      total_ahorrado: tot.totalAhorrado || 0,
      valor_sancion: valorFondo,
      valor_entregar: valorEntregar,
      codigo_comprobante: codigoComprobante,
      valor_prestamo: pagoPrestamos,
      detalle_prestamos: detallePrestamos
    }, { onConflict: 'socio_natillera_id' })
    if (errComprobante) throw new Error(`No se pudo guardar el comprobante de salida: ${errComprobante.message}`)
    hecho.comprobante = true

    // Sanción por retiro → utilidades (con forma de pago para cuadre)
    if (desactivarSancionar.value && desactivarPorcentajeSancion.value > 0 && valorFondo > 0) {
      const insertUtilidad = {
        natillera_id: natilleraId,
        tipo: 'sanciones',
        monto: valorFondo,
        forma_pago: formaPagoNorm,
        descripcion: `Sanción por retiro: ${nombreSocio}`
      }
      const { data: filaSancion, error } = await supabase.from('utilidades_clasificadas').insert(insertUtilidad).select('id').single()
      if (error) throw error
      hecho.sancionId = filaSancion?.id || null
    }
    // Salida en movimientos_fondo: total entregado al socio + sanción (se descuenta de efectivo o transferencia)
    const totalSalida = valorEntregar + valorFondo
    if (totalSalida > 0) {
      const descripcionSalida = `Liquidación por salida - ${nombreSocio}`
      const { data: filaSalida, error: errMov } = await supabase.from('movimientos_fondo').insert({
        natillera_id: natilleraId,
        tipo: 'salida',
        monto: totalSalida,
        forma_pago: formaPagoNorm,
        descripcion: descripcionSalida,
        fecha: new Date().toISOString().split('T')[0]
      }).select('id').single()
      if (errMov) throw errMov
      hecho.salidaId = filaSalida?.id || null
    }
    const resultado = await sociosStore.cambiarEstadoSocio(sn.id, 'inactivo')
    if (!resultado.success) throw new Error(resultado.error || 'No se pudo desactivar')
    if (modalDetalle.value && socioSeleccionado.value?.id === sn.id) {
      modalDetalle.value = false
      socioSeleccionado.value = null
    }
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
      valorPrestamo: pagoPrestamos,
      saldoPendientePrestamo,
      codigoComprobante
    }
    comprobanteDesactivacion.value = datosComprobante
    comprobantesSalidaGuardados.value[sn.id] = { ...datosComprobante }
    cerrarModalDesactivar()
    await nextTick()
    notificationStore.warning(
      `${sn.socio?.nombre || 'El socio'} fue retirado de la natillera`,
      'Socio retirado',
      2500
    )
  } catch (e) {
    console.error('Error al desactivar socio:', e)
    // Deshacer lo que alcanzó a escribirse, en orden inverso: el socio sigue activo y la
    // caja, las utilidades y el préstamo quedan como estaban antes del retiro.
    try {
      if (hecho.salidaId) await supabase.from('movimientos_fondo').delete().eq('id', hecho.salidaId)
      if (hecho.sancionId) await supabase.from('utilidades_clasificadas').delete().eq('id', hecho.sancionId)
      if (hecho.comprobante) await supabase.from('comprobantes_salida').delete().eq('socio_natillera_id', sn.id)
    } catch (errRev) {
      console.error('No se pudo deshacer el retiro:', errRev)
    }
    // Si el cruce ya se hizo y lo que venía después falló, el préstamo no debe quedar
    // abonado con una plata que no salió del retiro.
    for (const d of detallePrestamos.reverse()) {
      try {
        await revertirAbonoPrestamo({ prestamoId: d.prestamo_id, pagoId: d.pago_id, abono: d.abono, mora: d.mora, formaPago: d.forma_pago, natilleraId })
      } catch (errRev) {
        console.error('No se pudo deshacer el abono del retiro:', errRev)
      }
    }
    notificationStore.error(e?.message || 'Error al retirar el socio', 'Error')
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
        `${nombreSocio} fue retirado de la natillera`,
        'Socio retirado',
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

/**
 * Fecha que consta como pago en la cuota. En un pago parcial `fecha_pago` guarda el
 * último abono, no la liquidación, así que ahí la etiqueta no puede decir «pagada el».
 */
function etiquetaFechaPagoCuotaSocioModal(c) {
  if (!c.fechaPago) return ''
  const total = totalObligacionCuotaSocioModal(c)
  const pagado = c.valorPagado || 0
  return `${pagado >= total ? 'Pagada el' : 'Último pago'} ${formatDate(c.fechaPago)}`
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
    return { badge: 'bg-orange-100 oscuro:bg-orange-500/15 text-orange-900 oscuro:text-orange-300 border-orange-200 oscuro:border-orange-500/30' }
  }
  if (c.estado === 'pagada' || pagado >= total) {
    return { badge: 'bg-green-100 oscuro:bg-green-500/15 text-green-900 oscuro:text-green-300 border-green-200 oscuro:border-green-500/30' }
  }
  if (c.estado === 'mora') {
    return { badge: 'bg-red-100 oscuro:bg-red-500/15 text-red-900 oscuro:text-red-300 border-red-200 oscuro:border-red-500/30' }
  }
  if (c.estado === 'pendiente') {
    return { badge: 'bg-amber-100 oscuro:bg-amber-500/15 text-amber-900 oscuro:text-amber-300 border-amber-200 oscuro:border-amber-500/30' }
  }
  if (c.estado === 'programada') {
    return { badge: 'bg-slate-100 oscuro:bg-superficie-hundida text-slate-700 oscuro:text-texto-medio border-slate-200 oscuro:border-borde' }
  }
  return { badge: 'bg-superficie-hundida text-texto border-borde' }
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

// El formulario avisa cuando abre y cierra el selector. Al cerrar se mantiene la supresión
// un momento: algunos navegadores disparan popstate justo después de resolver el picker.
function alSelectorContactos(activo) {
  if (activo) {
    suprimirPopstateContactos = true
    return
  }
  setTimeout(() => { suprimirPopstateContactos = false }, 600)
}

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
  
  const url = `https://wa.me/${numeroWhatsApp(telefono)}?text=${encodeURIComponent(mensaje)}`
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
  // Revocar en el acto cancela la descarga en Safari: la lee de forma asíncrona tras el click.
  const url = link.href
  setTimeout(() => URL.revokeObjectURL(url), 30000)
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
            telefono: normalizarCelular(socio.telefono), // Obligatorio, único y celular
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

  // Celulares: se validan todos antes de importar, para no dejar la importación a medias.
  const conCelularInvalido = sociosPreview.value.filter(s => !esTelefonoValido(s.telefono))
  if (conCelularInvalido.length > 0) {
    const nombres = conCelularInvalido.slice(0, 5).map(s => `${s.nombre} (${s.telefono})`).join(', ')
    const resto = conCelularInvalido.length > 5 ? ` y ${conCelularInvalido.length - 5} más` : ''
    errorImportar.value = `Corrige el teléfono de: ${nombres}${resto}. Cada socio necesita un celular de 10 dígitos que empiece por 3, o uno de otro país con + y el indicativo.`
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
        telefono: normalizarCelular(socio.telefono)
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

/*
 * Poner al día desde el detalle: para un socio que ya pagó por fuera de la app (la
 * natillera empezó antes de crearla aquí). Ver usePonerAlDia.
 */
const OPCIONES_FORMA_PAGO_AL_DIA = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' }
]
/** Proceso masivo: elegir qué socios poner al día (PonerAlDiaMasivoModal). */
const modalPonerAlDia = ref(false)
const alDiaDetalle = reactive({ abierto: false, cargando: false, guardando: false, cuotas: [], formaPago: 'efectivo', cobrar4x1000: false, hechas: 0, total: 0 })
const totalPonerAlDia = computed(() => alDiaDetalle.cuotas.reduce((s, c) => s + c.pendiente, 0))
const total4x1000PonerAlDia = computed(() => total4x1000DeCuotas(alDiaDetalle.cuotas, alDiaDetalle.formaPago, alDiaDetalle.cobrar4x1000))
const rangoPonerAlDia = computed(() => {
  const lista = alDiaDetalle.cuotas
  if (!lista.length) return ''
  const primera = formatDate(lista[0].fecha_limite)
  const ultima = formatDate(lista[lista.length - 1].fecha_limite)
  return primera === ultima ? primera : `del ${primera} al ${ultima}`
})

function cerrarPonerAlDia() {
  Object.assign(alDiaDetalle, { abierto: false, cargando: false, guardando: false, cuotas: [], formaPago: 'efectivo', cobrar4x1000: false, hechas: 0, total: 0 })
}

async function abrirPonerAlDia() {
  const sn = socioSeleccionado.value
  if (!sn) return
  Object.assign(alDiaDetalle, { abierto: true, cargando: true, cuotas: [] })
  try {
    alDiaDetalle.cuotas = await cuotasParaPonerAlDia(sn.id)
  } catch (e) {
    console.error('Poner al día: cuotas', e)
    notificationStore.error('No se pudieron consultar las cuotas del socio. Intenta de nuevo.')
    cerrarPonerAlDia()
    return
  }
  alDiaDetalle.cargando = false
}

async function confirmarPonerAlDia() {
  const sn = socioSeleccionado.value
  if (!sn || alDiaDetalle.guardando || alDiaDetalle.cuotas.length === 0) return
  alDiaDetalle.guardando = true
  alDiaDetalle.total = alDiaDetalle.cuotas.length
  alDiaDetalle.hechas = 0
  const r = await ponerSocioAlDia({
    socioNatillera: sn,
    natilleraId: id,
    natilleraNombre: natillerasStore.natilleraActual?.nombre || null,
    formaPago: alDiaDetalle.formaPago,
    cobrar4x1000: alDiaDetalle.cobrar4x1000,
    cuotas: alDiaDetalle.cuotas,
    alAvanzar: (hechas) => { alDiaDetalle.hechas = hechas }
  })
  // El resumen del detalle sale de sus cuotas: se recargan para que diga «al día».
  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  if (socioSeleccionado.value?.id === sn.id) cuotasSocio.value = resumen?.cuotas || []
  cerrarPonerAlDia()
  if (r.fallidas > 0) {
    notificationStore.warning(`Se registraron ${r.registradas} de ${r.total} cuotas. Vuelve a intentarlo para las que faltan.`, 'Quedaron cuotas pendientes')
  } else {
    const con4x1000 = r.valor4x1000 > 0 ? ` más $${formatMoney(r.valor4x1000)} de 4×1000` : ''
    notificationStore.success(`${r.registradas} cuota${r.registradas === 1 ? '' : 's'} registrada${r.registradas === 1 ? '' : 's'} por $${formatMoney(r.valor)}${con4x1000}.`, `${sn.socio?.nombre || 'El socio'} quedó al día`)
  }
}

/*
 * Captura del detalle completo, solo para el superusuario: imágenes para soporte. El
 * rol lo decide la base (`es_super_admin`, vía el store de soporte), no el correo.
 */
const soporteStore = useSoporteStore()
const puedeCapturarDetalle = computed(() => soporteStore.esSoporte)
const cabeceraDetalleSocio = ref(null)
const capturaDetalle = reactive({ generando: false, archivo: null, dataUrl: '' })
const puedeCompartirCaptura = computed(() => {
  const archivo = capturaDetalle.archivo
  return !!archivo && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [archivo] })
})

function limpiarCapturaDetalle() {
  Object.assign(capturaDetalle, { generando: false, archivo: null, dataUrl: '' })
}

async function capturarDetalleSocio() {
  // La cabecera está dentro de la tarjeta del modal: esa es la que se captura entera.
  const tarjeta = cabeceraDetalleSocio.value?.parentElement
  if (!tarjeta || capturaDetalle.generando) return
  capturaDetalle.generando = true
  capturaDetalle.archivo = null
  try {
    const nombre = (socioSeleccionado.value?.socio?.nombre || 'socio').trim().replace(/\s+/g, '-')
    const { dataUrl, archivo } = await capturarCompleto(tarjeta, `detalle-${nombre}.png`)
    Object.assign(capturaDetalle, { dataUrl, archivo })
  } catch (e) {
    console.error('Captura del detalle del socio:', e)
    notificationStore.error('No se pudo preparar la captura. Intenta de nuevo.')
  } finally {
    capturaDetalle.generando = false
  }
}

function descargarCapturaDetalle() {
  if (!capturaDetalle.dataUrl) return
  // En iOS `a.download` con data URL abre otra pestaña: la hoja de compartir trae «Guardar imagen».
  const archivos = capturaDetalle.archivo ? { files: [capturaDetalle.archivo] } : null
  if (archivos && detectIosPlatform() && navigator.canShare?.(archivos)) {
    navigator.share(archivos).catch(() => {})
    return
  }
  const enlace = document.createElement('a')
  enlace.download = capturaDetalle.archivo?.name || 'detalle-socio.png'
  enlace.href = capturaDetalle.dataUrl
  enlace.click()
}

function compartirCapturaDetalle() {
  if (!capturaDetalle.archivo) return
  // Sin nada asíncrono antes: Safari exige el gesto del toque.
  navigator.share({ files: [capturaDetalle.archivo], title: 'Detalle del socio' }).catch(() => {})
}

async function verDetalleSocio(sn) {
  cerrarPonerAlDia()
  limpiarCapturaDetalle()
  // Resolver el rol (queda en caché): así el botón de captura ya está al abrir.
  soporteStore.comprobarRol().catch(() => {})
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
    .select('socio_nombre, socio_telefono, fecha, total_ahorrado, valor_sancion, valor_entregar, codigo_comprobante, valor_prestamo, detalle_prestamos')
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
      valorPrestamo: parseFloat(row.valor_prestamo) || 0,
      saldoPendientePrestamo: (row.detalle_prestamos || []).reduce((s, d) => s + (Number(d.saldo_restante) || 0), 0),
      codigoComprobante: row.codigo_comprobante
    }
    comprobantesSalidaGuardados.value[sn.id] = { ...comprobanteDesactivacion.value }
  } else {
    notificationStore.warning(
      'No hay comprobante de salida para este socio. Se genera al retirarlo desde la opción "Retirar".',
      'Sin comprobante',
      4000
    )
  }
}



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
  // El velo de driver.js vive en <body>: sin esto, un recorrido abierto (o a punto de
  // arrancar) sobrevive a la vista y tapa la pantalla siguiente.
  cerrarRecorridosDriver()
  // Todos los rAF del natiscroll: si el modal se desmonta con uno pendiente (volver deslizando
  // en Safari cierra la vista a media animación), el callback mediría nodos ya quitados.
  if (rafNatiscrollModalCuotasSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalCuotasSocio)
    rafNatiscrollModalCuotasSocio = null
  }
  if (rafNatiscrollModalDetalleSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalDetalleSocio)
    rafNatiscrollModalDetalleSocio = null
  }
  if (rafNatiscrollModalDesactivarSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalDesactivarSocio)
    rafNatiscrollModalDesactivarSocio = null
  }
  if (rafNatiscrollModalEliminarSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalEliminarSocio)
    rafNatiscrollModalEliminarSocio = null
  }
  if (rafNatiscrollModalComprobanteDesactivacion != null) {
    cancelAnimationFrame(rafNatiscrollModalComprobanteDesactivacion)
    rafNatiscrollModalComprobanteDesactivacion = null
  }
  if (rafNatiscrollModalImportar != null) {
    cancelAnimationFrame(rafNatiscrollModalImportar)
    rafNatiscrollModalImportar = null
  }
  if (rafNatiscrollModalActivarSocio != null) {
    cancelAnimationFrame(rafNatiscrollModalActivarSocio)
    rafNatiscrollModalActivarSocio = null
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
/* Captura lista (superusuario): franja con descargar y compartir; no sale en la imagen */
.captura-lista {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px solid rgba(27, 94, 55, 0.2);
  background: #f0f7f2;
}
/* Poner al día (detalle del socio): botón dentro del aviso ámbar y panel de confirmación */
.poner-al-dia__abrir {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px;
  margin-top: 0.5rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1px solid rgba(180, 83, 9, 0.35);
  background: #fff;
  color: #78350f;
  font-size: 0.8125rem;
  font-weight: 700;
  touch-action: manipulation;
}
.poner-al-dia__abrir:hover { background: #fffbeb; }
.poner-al-dia {
  border: 1px solid rgba(27, 94, 55, 0.2);
  background: linear-gradient(180deg, #f6fbf7 0%, #fff 100%);
  border-radius: var(--radius-lg, 0.875rem);
  padding: 0.875rem;
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.05));
}
.poner-al-dia__sello {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--brand-primary-soft, #e8f5ec);
  color: #1B5E37;
}
.poner-al-dia__titulo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.9375rem;
  color: #1B5E37;
  line-height: 1.2;
}
.poner-al-dia__sub {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #64748b;
}
.poner-al-dia__nota {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-md, 0.625rem);
  background: #f0f7f2;
  color: #1B5E37;
  font-size: 0.75rem;
  line-height: 1.45;
}
.poner-al-dia__opcion {
  position: relative; /* contiene la casilla oculta (sr-only): sin esto el foco desplaza el modal */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1px solid rgba(27, 94, 55, 0.25);
  background: #fff;
  color: #1B5E37;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}
.poner-al-dia__opcion.is-activa {
  background: var(--brand-primary-soft, #e8f5ec);
  border-color: rgba(27, 94, 55, 0.45);
}
.poner-al-dia__opcion:focus-within { box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18); }
.poner-al-dia__caja {
  display: flex;
  width: 1.125rem;
  height: 1.125rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.3rem;
  border: 1.5px solid rgba(27, 94, 55, 0.5);
  background: #fff;
}
.poner-al-dia__opcion.is-activa .poner-al-dia__caja {
  background: #1B5E37;
  border-color: #1B5E37;
  color: #fff;
}

/* Aviso de socios en mora que lleva al proceso masivo: tarjeta de marca con CTA en píldora */
.al-dia-aviso {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.75rem;
  padding: 0.75rem 0.875rem 0.75rem 1rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px solid rgba(27, 94, 55, 0.18);
  background: linear-gradient(135deg, #f6fbf7 0%, #fff 65%);
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.05));
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.al-dia-aviso:hover {
  border-color: rgba(27, 94, 55, 0.35);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(15, 23, 42, 0.08));
}
.al-dia-aviso:focus-visible { box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.18); }
.al-dia-aviso__icono {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #1B5E37;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(27, 94, 55, 0.1);
}
.al-dia-aviso__titulo {
  display: block;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 800;
  color: #0f172a;
}
.al-dia-aviso__sub {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
}
.al-dia-aviso__cta {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.25rem;
  padding: 0 0.75rem 0 0.875rem;
  border-radius: 9999px;
  background: #1B5E37;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
}
@media (max-width: 380px) {
  /* En pantallas muy angostas la píldora se reduce a la flecha: el texto ya lo dice */
  .al-dia-aviso__cta { padding: 0 0.5rem; font-size: 0; gap: 0; }
  .al-dia-aviso__cta svg { width: 1.125rem; height: 1.125rem; }
}
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
  /* 44px de área táctil; los márgenes negativos la meten en el padding de la barra para
     que la búsqueda no crezca al aparecer la X. */
  width: 44px;
  height: 44px;
  margin: -0.4375rem -0.625rem -0.4375rem 0;
  flex-shrink: 0;
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
/* En la fila de la tabla no se reparten el ancho: cada una mide lo que su texto. */
.card-pill--tabla {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0.3125rem 0.75rem;
  white-space: nowrap;
}
.card-pill--tabla.card-pill--icon { min-width: 36px; padding: 0.3125rem; }
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

/* ---------- Pie de carga progresiva ---------- */
.socios-mas {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--surface-divider);
  background: var(--surface-muted);
  text-align: center;
}
@media (min-width: 640px) {
  .socios-mas { padding: 0.875rem 1.25rem; }
}

/* Cuando ya no queda nada por traer, el pie es solo el recuento. */
.socios-mas--fin {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
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
  /* --tapado-inferior: la barra de Safari (iOS 15+) se dibuja encima del bottom nav y del FAB */
  bottom: calc(6.25rem + env(safe-area-inset-bottom, 0px) + var(--tapado-inferior, 0px));
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
  .socios-fab { bottom: calc(max(1.5rem, env(safe-area-inset-bottom, 0px)) + var(--tapado-inferior, 0px)); }
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
  .card-pill,
  .socios-fab,
  .socios-search__clear { -webkit-transform: translate3d(0, 0, 0); }
}

/* Formulario de agregar / editar socio: sus estilos viven en SocioFormModal.vue */

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

/* Acceso a la modal de cuotas: es una acción, no una sección que se despliega. */
.detalle-ir-cuotas {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  min-height: 56px;
  background: #fff;
  border: 1px solid var(--surface-divider);
  border-radius: var(--radius-lg);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.detalle-ir-cuotas:hover {
  background: var(--brand-primary-soft);
  border-color: rgba(27, 94, 55, 0.3);
}
.detalle-ir-cuotas:active {
  background: var(--surface-muted);
}
.detalle-ir-cuotas__icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
}
.detalle-ir-cuotas__texto {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1 1 auto;
}
.detalle-ir-cuotas__titulo {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.25;
}
.detalle-ir-cuotas__sub {
  font-size: 0.6875rem;
  color: #64748b;
  line-height: 1.3;
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
/* Fecha de pago: no se recorta, se recorta antes la subetiqueta de al lado. */
.cuotas-mobile-card__fecha {
  flex-shrink: 0;
  margin: 0;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  color: #475569;
  white-space: nowrap;
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
/*
 * Bloque protagonista del modal de retiro: lo que se le entrega al socio.
 *
 * Va primero y en grande porque es la única cifra por la que se abre esa ventana; el
 * resto del cuerpo existe para confirmarla. Verde de marca: es dinero que sale hacia el
 * socio, no una advertencia.
 */
.retiro-hero {
  border-radius: 1rem;
  border: 1px solid rgba(27, 94, 55, 0.18);
  background: linear-gradient(180deg, #f3faf4 0%, #ffffff 100%);
  padding: 1rem 1.125rem 1.125rem;
  text-align: center;
}

.retiro-hero__label {
  font-size: 0.75rem;
  line-height: 1.3;
  color: #64748b;
}

.retiro-hero__valor {
  margin-top: 0.25rem;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--brand-primary, #1B5E37);
}

.retiro-hero__valor--cargando {
  font-size: 1.125rem;
  font-weight: 600;
  color: #94a3b8;
}

.retiro-hero__nota {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #be185d;
}

/* Reparto del ahorro: a un lado el socio, al otro el fondo, con el mismo peso visual. */
.retiro-reparto {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  margin-top: 0.625rem;
}

.retiro-reparto__col {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.retiro-reparto__sep {
  width: 1px;
  flex-shrink: 0;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.12), transparent);
}

.retiro-reparto__label {
  font-size: 0.6875rem;
  line-height: 1.2;
  color: #64748b;
}

.retiro-reparto__valor {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.retiro-reparto__valor--socio { color: var(--brand-primary, #1B5E37); }
.retiro-reparto__valor--fondo { color: #be185d; }

.retiro-reparto__pie {
  font-size: 0.625rem;
  line-height: 1.2;
  color: #be185d;
  opacity: 0.8;
}

/*
 * Sanción por retiro. Rosa a propósito: la cabecera del modal es ámbar y la cifra que se
 * entrega es verde, así que un tercer tono evita que todo el cuerpo se lea igual — y el
 * rosa dice «esto resta» sin gritar como un rojo de error.
 *
 * Apagada es una tarjeta gris discreta; al encenderla se tiñe y despliega el porcentaje.
 */
.retiro-sancion {
  border-radius: 1rem;
  border: 1px solid var(--surface-divider-strong, #cbd5e1);
  background: #fff;
  overflow: hidden;
  transition: border-color 200ms ease, background-color 200ms ease;
}

.retiro-sancion.is-active {
  border-color: rgba(190, 24, 93, 0.28);
  background: linear-gradient(180deg, #fff1f5 0%, #ffffff 62%);
}

.retiro-sancion__cabecera {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.retiro-sancion__icono {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #f1f5f9;
  color: #94a3b8;
  transition: background-color 200ms ease, color 200ms ease;
}

.retiro-sancion.is-active .retiro-sancion__icono {
  background: #fce7f3;
  color: #be185d;
}

.retiro-sancion__titulo {
  display: block;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}

.retiro-sancion.is-active .retiro-sancion__titulo { color: #9d174d; }

.retiro-sancion__sub {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #94a3b8;
}

.retiro-sancion.is-active .retiro-sancion__sub { color: #be185d; opacity: 0.85; }

/* Interruptor: más claro que una casilla para algo que enciende un bloque entero. */
.retiro-sancion__switch {
  position: relative;
  display: inline-flex;
  height: 1.625rem;
  width: 2.875rem;
  flex-shrink: 0;
  align-items: center;
  border-radius: 9999px;
  background: #e2e8f0; /* tema-fijo: la pista se ajusta a mano justo debajo */
  transition: background-color 200ms ease;
}
/* Modo oscuro (a mano): pista visible sobre la tarjeta oscura */
:where([data-tema=oscuro]) .retiro-sancion__switch:not(:where([data-tema=claro] *)) { background: var(--borde-fuerte); }

.retiro-sancion.is-active .retiro-sancion__switch { background: #ec4899; }

.retiro-sancion__bolita {
  position: absolute;
  left: 0.1875rem;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 9999px;
  background: #fff; /* tema-fijo: la bolita del interruptor es blanca en los dos modos */
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.retiro-sancion.is-active .retiro-sancion__bolita {
  transform: translate3d(1.25rem, 0, 0);
}

.retiro-sancion__cuerpo {
  padding: 0 1rem 1rem;
}

/* Atajos de porcentaje, en la misma familia rosa del bloque. */
.retiro-pct {
  min-height: 2.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(190, 24, 93, 0.2);
  background: #fff;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: #9f1239;
  touch-action: manipulation;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}

.retiro-pct:hover { border-color: rgba(190, 24, 93, 0.45); }

.retiro-pct.is-active {
  border-color: #ec4899;
  background: #fce7f3;
  color: #9d174d;
  box-shadow: inset 0 0 0 1px #ec4899;
}

/* ─── Vínculo del socio con su cuenta (portal de socios) ─── */
.socio-vinculado {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1.4;
}
.socio-cuenta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px dashed var(--surface-divider-strong, #cbd5e1);
  background: #f8fafc;
}
.socio-cuenta.is-vinculado {
  border-style: solid;
  border-color: rgba(27, 94, 55, 0.2);
  background: linear-gradient(135deg, #eef7f0 0%, #fff 70%);
}
.socio-cuenta__icono {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  color: #94a3b8;
}
.socio-cuenta.is-vinculado .socio-cuenta__icono { color: var(--brand-primary); }
.socio-cuenta__titulo {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}
.socio-cuenta__detalle {
  margin-top: 0.0625rem;
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.socio-cuenta__accion {
  flex-shrink: 0;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #b91c1c;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.socio-cuenta__accion:hover:not(:disabled) { background: #fef2f2; }

/* ─── Solicitudes para usar la app ─── */
.solicitudes-aviso {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg, 0.875rem);
  border: 1px solid rgba(180, 83, 9, 0.25);
  background: linear-gradient(135deg, #fffbeb 0%, #fff 70%);
  color: #92400e;
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.solicitudes-aviso__icono {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #fef3c7;
  color: #b45309;
}
.solicitudes-aviso__titulo {
  display: block;
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: #78350f;
}
.solicitudes-aviso__sub {
  display: block;
  font-size: 0.75rem;
  color: #92400e;
  opacity: 0.85;
}
/*
 * Préstamo pendiente al retirarse. Misma estructura que la sanción (cabecera con
 * interruptor + cuerpo), en naranja: también es dinero que no se lleva el socio, pero no
 * se queda en el fondo como utilidad, paga su deuda. Encendida por defecto.
 */
.retiro-prestamo {
  border-radius: 1rem;
  border: 1px solid var(--surface-divider-strong, #cbd5e1);
  background: #fff;
  overflow: hidden;
  transition: border-color 200ms ease, background-color 200ms ease;
}
.retiro-prestamo.is-active {
  border-color: rgba(194, 65, 12, 0.3);
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 62%);
}
.retiro-prestamo__cabecera {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.retiro-prestamo__icono {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #f1f5f9;
  color: #94a3b8;
  transition: background-color 200ms ease, color 200ms ease;
}
.retiro-prestamo.is-active .retiro-prestamo__icono { background: #ffedd5; color: #c2410c; }
.retiro-prestamo__titulo {
  display: block;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
}
.retiro-prestamo.is-active .retiro-prestamo__titulo { color: #9a3412; }
.retiro-prestamo__sub {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #94a3b8;
}
.retiro-prestamo.is-active .retiro-prestamo__sub { color: #c2410c; opacity: 0.85; }
.retiro-prestamo__switch {
  position: relative;
  display: inline-flex;
  height: 1.625rem;
  width: 2.875rem;
  flex-shrink: 0;
  align-items: center;
  border-radius: 9999px;
  background: #e2e8f0; /* tema-fijo: la pista se ajusta a mano justo debajo */
  transition: background-color 200ms ease;
}
/* Modo oscuro (a mano): pista visible sobre la tarjeta oscura */
:where([data-tema=oscuro]) .retiro-prestamo__switch:not(:where([data-tema=claro] *)) { background: var(--borde-fuerte); }
.retiro-prestamo.is-active .retiro-prestamo__switch { background: #ea580c; }
.retiro-prestamo__bolita {
  position: absolute;
  left: 0.1875rem;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 9999px;
  background: #fff; /* tema-fijo: la bolita del interruptor es blanca en los dos modos */
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
.retiro-prestamo.is-active .retiro-prestamo__bolita { transform: translate3d(1.25rem, 0, 0); }
.retiro-prestamo__cuerpo { padding: 0 1rem 1rem; }
.retiro-prestamo__nota {
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #9a3412;
}
.retiro-reparto__valor--prestamo { color: #c2410c; }
/* Con tres columnas (socio · préstamo · fondo) la cifra se ajusta al ancho del teléfono. */
.retiro-reparto__valor { font-size: clamp(1rem, 4.6vw, 1.375rem); }

@media (prefers-reduced-motion: reduce) {
  .retiro-sancion,
  .retiro-sancion__icono,
  .retiro-sancion__switch,
  .retiro-sancion__bolita,
  .retiro-pct,
  .retiro-prestamo,
  .retiro-prestamo__icono,
  .retiro-prestamo__switch,
  .retiro-prestamo__bolita {
    transition: none;
  }
}

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

/* ==========================================================================
   Modo oscuro (skill natillerapp-modo-oscuro). Propuesto con
   scripts/tema/proponer-oscuro.mjs y revisado a mano. Solo lo que cambia: las
   reglas de claro de arriba quedan intactas.
   ========================================================================== */
:where([data-tema=oscuro]) .captura-lista:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: var(--marca-suave);
}
:where([data-tema=oscuro]) .poner-al-dia__abrir:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--alerta-borde);
  background: var(--superficie-tarjeta);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .poner-al-dia__abrir:hover:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .poner-al-dia:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: linear-gradient(180deg, var(--superficie-suave) 0%, var(--superficie-tarjeta) 100%);
}
:where([data-tema=oscuro]) .poner-al-dia__sello:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .poner-al-dia__titulo:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .poner-al-dia__sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .poner-al-dia__nota:not(:where([data-tema=claro] *)) {
  background: var(--marca-suave);
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .poner-al-dia__opcion:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: var(--superficie-tarjeta);
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .poner-al-dia__opcion.is-activa:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .poner-al-dia__caja:not(:where([data-tema=claro] *)) {
  border: 1.5px solid var(--marca-tinta-borde);
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .al-dia-aviso:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: linear-gradient(135deg, var(--superficie-suave) 0%, var(--superficie-tarjeta) 65%);
}
:where([data-tema=oscuro]) .al-dia-aviso:hover:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .al-dia-aviso__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .al-dia-aviso__sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .socios-toolbar__search:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .socios-toolbar__search:focus-within:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .socios-toolbar__search > svg:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .socios-search__input:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .socios-search__input:not(:where([data-tema=claro] *))::placeholder {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .socios-search__clear:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .socios-search__clear:hover:not(:where([data-tema=claro] *)) {
  background: rgb(255 255 255 / 0.04);
}
:where([data-tema=oscuro]) .socios-filter:not(:where([data-tema=claro] *)) {
  background-color: var(--superficie-tarjeta);
  color: var(--texto);
}
:where([data-tema=oscuro]) .socios-filter:focus:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .socios-table thead th:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .socios-table tbody td:not(:where([data-tema=claro] *)) {
  border-bottom: 1px solid rgb(255 255 255 / 0.04);
  color: var(--texto);
}
:where([data-tema=oscuro]) .socios-table__row--inactivo:hover:not(:where([data-tema=claro] *)) {
  background: rgb(255 255 255 / 0.04);
}
:where([data-tema=oscuro]) .socios-mobile-metric-label:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .card-pill--brand:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .card-pill--info:not(:where([data-tema=claro] *)) {
  background: var(--info-suave);
  color: var(--info);
}
:where([data-tema=oscuro]) .card-pill--warning:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .card-pill--danger:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
  color: var(--peligro);
}
:where([data-tema=oscuro]) .cuota-status--ok:not(:where([data-tema=claro] *)) {
  color: var(--exito);
}
:where([data-tema=oscuro]) .cuota-status--mora:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .socios-mas--fin:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .detalle-seccion:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .detalle-seccion__title:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .detalle-seccion__body:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .detalle-ir-cuotas:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .detalle-ir-cuotas:hover:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .detalle-ir-cuotas__icono:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .detalle-ir-cuotas__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .detalle-ir-cuotas__sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .detalle-mini-stat__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .detalle-metric__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .detalle-metric__value:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .detalle-metric--positivo:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .detalle-metric--positivo .detalle-metric__label:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .detalle-metric--positivo .detalle-metric__value:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .detalle-metric--debe:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .detalle-metric--debe .detalle-metric__label:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .detalle-metric--debe .detalle-metric__value:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .detalle-config-chip:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .detalle-config-chip__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .detalle-config-chip__value:not(:where([data-tema=claro] *)) {
  color: var(--texto);
}
:where([data-tema=oscuro]) .detalle-config-chip__value--money:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .detalle-config-chip__hint:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .detalle-ghost-btn--warning:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .detalle-ghost-btn--warning:hover:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .detalle-ghost-btn--warning:active:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .detalle-ghost-btn--danger:not(:where([data-tema=claro] *)) {
  color: var(--peligro);
}
:where([data-tema=oscuro]) .detalle-ghost-btn--danger:hover:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
  border-color: var(--peligro-borde);
}
:where([data-tema=oscuro]) .detalle-ghost-btn--danger:active:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
}
:where([data-tema=oscuro]) .cuotas-mobile-card:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .cuotas-mobile-card:focus-visible:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .cuotas-mobile-card--pagada:not(:where([data-tema=claro] *)) {
  background: var(--marca-suave);
  border-color: var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .cuotas-mobile-card--mora:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
  border-color: var(--peligro-borde);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__qbadge.is-q1:not(:where([data-tema=claro] *)) {
  background: var(--info-suave);
  color: var(--info);
  border-color: var(--info-borde);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__qbadge.is-q2:not(:where([data-tema=claro] *)) {
  background: color-mix(in oklab, #ede9fe 14%, var(--superficie-tarjeta));
  color: color-mix(in oklab, #6d28d9 55%, #fff);
  border-color: var(--borde);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__qbadge.is-mes:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
  color: var(--texto-medio);
  border-color: var(--borde);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__mes:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__valor:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .cuotas-mobile-card__fecha:not(:where([data-tema=claro] *)) {
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .cuotas-resumen__total-label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .cuotas-resumen__total-valor.is-debe:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .cuotas-resumen__total-valor.is-aldia:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .cuotas-resumen__total-sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .cuotas-resumen__progress:not(:where([data-tema=claro] *)) {
  background: var(--superficie-hundida);
}
:where([data-tema=oscuro]) .cuotas-resumen__chip:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .cuotas-resumen__chip-label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .cuotas-resumen__chip--pagadas    .cuotas-resumen__chip-valor:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .cuotas-resumen__chip--parciales  .cuotas-resumen__chip-valor:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .cuotas-resumen__chip--pendientes .cuotas-resumen__chip-valor:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .cuotas-resumen__chip--mora       .cuotas-resumen__chip-valor:not(:where([data-tema=claro] *)) {
  color: var(--peligro);
}
:where([data-tema=oscuro]) .modal-callout-danger:not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
  border: 1px solid var(--peligro-borde);
}
:where([data-tema=oscuro]) .modal-callout-success:not(:where([data-tema=claro] *)) {
  background: var(--marca-suave);
  border: 1px solid var(--marca-tinta-borde);
}
:where([data-tema=oscuro]) .modal-data-list:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .modal-data-list__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .modal-data-list__value:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .modal-data-list__value--positive:not(:where([data-tema=claro] *)) {
  color: var(--exito);
}
:where([data-tema=oscuro]) .modal-data-list__value--danger:not(:where([data-tema=claro] *)) {
  color: var(--peligro);
}
:where([data-tema=oscuro]) .modal-data-list__value--muted:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .retiro-hero:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--marca-tinta-borde);
  background: linear-gradient(180deg, var(--marca-suave) 0%, var(--superficie-tarjeta) 100%);
}
:where([data-tema=oscuro]) .retiro-hero__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .retiro-hero__valor:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .retiro-hero__valor--cargando:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .retiro-hero__nota:not(:where([data-tema=claro] *)) {
  color: color-mix(in oklab, #be185d 55%, #fff);
}
:where([data-tema=oscuro]) .retiro-reparto__sep:not(:where([data-tema=claro] *)) {
  background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.07), transparent);
}
:where([data-tema=oscuro]) .retiro-reparto__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .retiro-reparto__valor--socio:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .retiro-reparto__valor--fondo:not(:where([data-tema=claro] *)) {
  color: color-mix(in oklab, #be185d 55%, #fff);
}
:where([data-tema=oscuro]) .retiro-reparto__pie:not(:where([data-tema=claro] *)) {
  color: color-mix(in oklab, #be185d 55%, #fff);
}
:where([data-tema=oscuro]) .retiro-sancion:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .retiro-sancion.is-active:not(:where([data-tema=claro] *)) {
  background: linear-gradient(180deg, var(--peligro-suave) 0%, var(--superficie-tarjeta) 62%);
}
:where([data-tema=oscuro]) .retiro-sancion__icono:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .retiro-sancion.is-active .retiro-sancion__icono:not(:where([data-tema=claro] *)) {
  background: color-mix(in oklab, #fce7f3 14%, var(--superficie-tarjeta));
  color: color-mix(in oklab, #be185d 55%, #fff);
}
:where([data-tema=oscuro]) .retiro-sancion__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto);
}
:where([data-tema=oscuro]) .retiro-sancion.is-active .retiro-sancion__titulo:not(:where([data-tema=claro] *)) {
  color: color-mix(in oklab, #9d174d 55%, #fff);
}
:where([data-tema=oscuro]) .retiro-sancion__sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .retiro-sancion.is-active .retiro-sancion__sub:not(:where([data-tema=claro] *)) {
  color: color-mix(in oklab, #be185d 55%, #fff);
}
:where([data-tema=oscuro]) .retiro-pct:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
  color: var(--peligro);
}
:where([data-tema=oscuro]) .retiro-pct.is-active:not(:where([data-tema=claro] *)) {
  background: color-mix(in oklab, #fce7f3 14%, var(--superficie-tarjeta));
  color: color-mix(in oklab, #9d174d 55%, #fff);
}
:where([data-tema=oscuro]) .socio-vinculado:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .socio-cuenta:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
}
:where([data-tema=oscuro]) .socio-cuenta.is-vinculado:not(:where([data-tema=claro] *)) {
  border-color: var(--marca-tinta-borde);
  background: linear-gradient(135deg, var(--marca-suave) 0%, var(--superficie-tarjeta) 70%);
}
:where([data-tema=oscuro]) .socio-cuenta__icono:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .socio-cuenta.is-vinculado .socio-cuenta__icono:not(:where([data-tema=claro] *)) {
  color: var(--marca-tinta);
}
:where([data-tema=oscuro]) .socio-cuenta__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto-fuerte);
}
:where([data-tema=oscuro]) .socio-cuenta__detalle:not(:where([data-tema=claro] *)) {
  color: var(--texto-secundario);
}
:where([data-tema=oscuro]) .socio-cuenta__accion:not(:where([data-tema=claro] *)) {
  color: var(--peligro);
}
:where([data-tema=oscuro]) .socio-cuenta__accion:hover:not(:disabled):not(:where([data-tema=claro] *)) {
  background: var(--peligro-suave);
}
:where([data-tema=oscuro]) .solicitudes-aviso:not(:where([data-tema=claro] *)) {
  border: 1px solid var(--alerta-borde);
  background: linear-gradient(135deg, var(--alerta-suave) 0%, var(--superficie-tarjeta) 70%);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .solicitudes-aviso__icono:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .solicitudes-aviso__titulo:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .solicitudes-aviso__sub:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .retiro-prestamo:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
}
:where([data-tema=oscuro]) .retiro-prestamo.is-active:not(:where([data-tema=claro] *)) {
  border-color: var(--alerta-borde);
  background: linear-gradient(180deg, var(--alerta-suave) 0%, var(--superficie-tarjeta) 62%);
}
:where([data-tema=oscuro]) .retiro-prestamo__icono:not(:where([data-tema=claro] *)) {
  background: var(--superficie-suave);
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .retiro-prestamo.is-active .retiro-prestamo__icono:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  color: var(--alerta);
}
:where([data-tema=oscuro]) .retiro-prestamo__titulo:not(:where([data-tema=claro] *)) {
  color: var(--texto);
}
:where([data-tema=oscuro]) .retiro-prestamo.is-active .retiro-prestamo__titulo:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .retiro-prestamo__sub:not(:where([data-tema=claro] *)) {
  color: var(--texto-tenue);
}
:where([data-tema=oscuro]) .retiro-prestamo.is-active .retiro-prestamo__sub:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .retiro-prestamo__nota:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .retiro-reparto__valor--prestamo:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .modal-liquidacion:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
}
:where([data-tema=oscuro]) .modal-liquidacion__label:not(:where([data-tema=claro] *)) {
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .modal-liquidacion__value--main:not(:where([data-tema=claro] *)) {
  color: var(--exito);
}
:where([data-tema=oscuro]) .modal-liquidacion__value--warning:not(:where([data-tema=claro] *)) {
  color: var(--alerta);
}
:where([data-tema=oscuro]) .modal-segmented:not(:where([data-tema=claro] *)) {
  background: var(--superficie-tarjeta);
  color: var(--texto-medio);
}
:where([data-tema=oscuro]) .modal-segmented:hover:not(:where([data-tema=claro] *)) {
  border-color: var(--borde-fuerte);
}
:where([data-tema=oscuro]) .modal-segmented.is-active:not(:where([data-tema=claro] *)) {
  background: var(--alerta-suave);
  border-color: var(--alerta);
  color: var(--alerta);
}
</style>


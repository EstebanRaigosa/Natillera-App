<template>
  <div class="relative mx-auto max-w-7xl lg:max-w-6xl xl:max-w-7xl">
    <!-- Encabezado -->
    <header
      class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0 sm:gap-x-4 sm:gap-y-2"
    >
      <h1
        class="col-start-1 row-start-1 min-w-0 font-body text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-gray-900"
      >
        ¡Hola, <span class="text-[#166534]">{{ authStore.userName }}</span>!
      </h1>
      <router-link
        id="boton-crear-natillera-movil"
        to="/natilleras/crear"
        class="col-start-2 row-start-1 row-span-1 inline-flex min-h-[48px] shrink-0 items-center gap-2 justify-self-end rounded-full bg-[#166534] px-3 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#145a2d] sm:row-span-2 sm:self-center sm:px-5 sm:pl-3"
        aria-label="Crear nueva natillera"
      >
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <PlusIcon class="h-4 w-4 text-white" />
        </span>
        <span class="hidden sm:inline">Nueva Natillera</span>
      </router-link>
      <p
        class="col-span-2 col-start-1 row-start-2 text-[15px] font-medium leading-snug text-gray-600 sm:col-span-1 sm:row-start-2 sm:mt-0 sm:leading-relaxed"
      >
        Bienvenido a tu panel de natilleras
      </p>
    </header>

    <!-- Invitaciones (estilo panel verde / tarjeta info + acciones) -->
    <section
      v-if="colaboradoresStore.misInvitaciones.length > 0"
      class="relative mt-3 animate-fade-in-up sm:mt-4 rounded-2xl border border-emerald-200/70 bg-gradient-to-b from-emerald-50/90 via-emerald-50/40 to-white p-5 sm:p-6 shadow-sm"
      aria-labelledby="dashboard-invitaciones-titulo"
    >
      <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <h2
              id="dashboard-invitaciones-titulo"
              class="font-display text-xl font-bold tracking-tight text-[#166534] sm:text-2xl"
            >
              Invitaciones
            </h2>
            <span
              class="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-[#166534] px-2.5 text-sm font-bold text-white tabular-nums shadow-sm"
              aria-hidden="true"
            >
              {{ colaboradoresStore.misInvitaciones.length }}
            </span>
          </div>
          <p class="mt-1 max-w-xl text-sm font-medium text-[#3f6212]/90">
            Gestiona tus uniones a nuevos grupos de ahorro.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <article
          v-for="invitacion in colaboradoresStore.misInvitaciones"
          :key="invitacion.id"
          class="overflow-hidden rounded-2xl border border-emerald-200/60 bg-white shadow-sm ring-1 ring-emerald-100/40"
        >
          <div class="flex flex-col sm:flex-row sm:items-stretch">
            <!-- Columna info: fondo menta -->
            <div
              class="flex min-w-0 flex-1 gap-3 border-b border-emerald-100/80 bg-[#ecfdf5] p-4 sm:gap-4 sm:border-b-0 sm:border-r sm:p-5"
            >
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#166534] text-white shadow-sm"
                aria-hidden="true"
              >
                <BuildingLibraryIcon class="h-6 w-6" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-display text-base font-bold text-gray-900 sm:text-lg">
                  {{ invitacion.natillera_nombre }}
                </h3>
                <p class="mt-1.5">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#14532d]"
                  >
                    <component
                      :is="iconoRolInvitacion(invitacion.rol)"
                      class="h-3.5 w-3.5 text-[#166534]"
                      aria-hidden="true"
                    />
                    {{ formatearRol(invitacion.rol).toUpperCase() }}
                  </span>
                </p>
                <p class="mt-3 text-sm leading-relaxed text-gray-600">
                  Has sido invitado por
                  <span class="font-bold text-[#166534]">{{ emailInvitadorDestacado(invitacion) }}</span>
                  a participar en este círculo de confianza.
                </p>
                <div
                  v-if="invitacion.notas"
                  class="mt-3 rounded-lg border border-amber-200/60 bg-amber-50/90 px-3 py-2 text-xs text-gray-700"
                >
                  <span class="font-semibold text-amber-900">Mensaje: </span>
                  <span class="whitespace-pre-wrap break-words">{{ invitacion.notas }}</span>
                </div>
              </div>
            </div>

            <!-- Columna acciones: blanco -->
            <div
              class="flex w-full shrink-0 flex-col justify-center gap-2.5 bg-white px-4 py-4 sm:w-[min(100%,13.5rem)] sm:px-5"
            >
              <button
                type="button"
                @click="aceptarInvitacion(invitacion)"
                :disabled="procesandoInvitacion === invitacion.id"
                class="w-full rounded-full bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145a2d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aceptar
              </button>
              <button
                type="button"
                @click="abrirModalRechazarInvitacion(invitacion)"
                :disabled="procesandoInvitacion === invitacion.id"
                class="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rechazar
              </button>
              <p
                class="pt-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400"
              >
                {{ textoExpiracionInvitacion(invitacion) }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div
      role="separator"
      aria-orientation="horizontal"
      class="box-border w-full min-w-0 shrink-0 border-0 border-t border-solid border-[#166534]/30"
      :class="colaboradoresStore.misInvitaciones.length > 0 ? 'mt-3' : 'mt-2'"
    />

    <!-- Sección de Natilleras -->
    <div class="relative animate-fade-in-up stagger-5 pt-2 sm:pt-4">
      <div class="mb-5 flex flex-col gap-3 sm:mb-6">
        <div>
          <h2 class="font-body text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Tus Natilleras
          </h2>
          <p class="mt-1 hidden text-sm font-medium leading-relaxed text-gray-600 sm:block">
            Gestiona tus grupos de ahorro según tu rol
          </p>
        </div>

        <!-- Filtros: móvil — panel con jerarquía; desktop — fila sin panel. -->
        <div
          v-if="mostrarBarraFiltrosNatilleras"
          class="flex flex-col gap-3 rounded-2xl border border-gray-200/90 bg-gradient-to-b from-white to-emerald-50/35 p-3.5 shadow-sm ring-1 ring-gray-100/90 sm:rounded-none sm:border-0 sm:bg-none sm:p-0 sm:shadow-none sm:ring-0 sm:flex-row sm:items-end sm:justify-between sm:gap-8 lg:gap-10"
          role="region"
          aria-label="Filtros de natilleras"
        >
          <div
            class="flex items-center gap-2 border-b border-emerald-900/10 pb-2.5 sm:hidden"
          >
            <FunnelIcon class="h-4 w-4 shrink-0 text-[#166534]" aria-hidden="true" />
            <span class="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-800">Filtros</span>
          </div>
          <!-- Móvil: Propiedad primero; fila Estado + Vista. Desktop: Propiedad + Estado (sin caja). -->
          <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-8 lg:gap-12">
            <div class="min-w-0 w-full sm:w-auto">
              <span class="block text-[9px] font-semibold uppercase tracking-wide text-gray-600 sm:text-[10px]">Propiedad</span>
              <div
                class="mt-1.5 inline-flex w-full max-w-full flex-wrap rounded-full bg-white p-0.5 shadow-sm ring-1 ring-gray-100/90 sm:p-1"
              >
                <button
                  type="button"
                  class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-3.5"
                  :class="vistaActiva === 'todas' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                  @click="vistaActiva = 'todas'"
                >
                  Todas
                </button>
                <button
                  type="button"
                  class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-3.5"
                  :class="vistaActiva === 'propias' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                  @click="vistaActiva = 'propias'"
                >
                  Propias
                </button>
                <button
                  type="button"
                  class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-3.5"
                  :class="vistaActiva === 'compartidas' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                  @click="vistaActiva = 'compartidas'"
                >
                  Compartidas
                </button>
                <button
                  type="button"
                  class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-3.5"
                  :class="vistaActiva === 'socio' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                  @click="vistaActiva = 'socio'"
                >
                  De socios
                </button>
              </div>
            </div>

            <div class="flex min-w-0 flex-row items-end gap-2 sm:contents">
              <div class="min-w-0 flex-1 sm:flex-initial">
                <span class="block text-[9px] font-semibold uppercase tracking-wide text-gray-600 sm:text-[10px]">Estado</span>
                <div
                  class="mt-1.5 inline-flex w-full max-w-full flex-wrap rounded-full bg-white p-0.5 shadow-sm ring-1 ring-gray-100/90 sm:p-1"
                >
                  <button
                    type="button"
                    class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-4"
                    :class="filtro === 'todas' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                    @click="filtro = 'todas'"
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-4"
                    :class="filtro === 'activa' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                    @click="filtro = 'activa'"
                  >
                    Activas
                  </button>
                  <button
                    type="button"
                    class="min-h-[44px] flex-1 rounded-full px-1.5 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:min-h-[44px] sm:px-3 sm:py-2 sm:text-sm sm:flex-none sm:px-4"
                    :class="filtro === 'cerrada' ? 'bg-[#166534] text-white' : 'text-gray-600 hover:text-gray-900'"
                    @click="filtro = 'cerrada'"
                  >
                    Cerradas
                  </button>
                </div>
              </div>

              <div
                class="flex w-auto shrink-0 flex-col items-end gap-0.5 pb-0.5 sm:hidden"
              >
                <span class="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Vista</span>
                <div
                  class="inline-flex rounded-lg bg-gray-100/95 p-0.5 shadow-inner ring-1 ring-gray-200/70"
                  role="group"
                  aria-label="Tipo de vista"
                >
                  <button
                    type="button"
                    class="flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition"
                    :class="
                      vistaLayout === 'tarjetas'
                        ? 'bg-[#166534] text-white shadow-sm'
                        : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                    "
                    :aria-pressed="vistaLayout === 'tarjetas'"
                    title="Vista de tarjetas"
                    @click="vistaLayout = 'tarjetas'"
                  >
                    <Squares2X2Icon class="h-3.5 w-3.5 shrink-0 opacity-95" />
                  </button>
                  <button
                    type="button"
                    class="flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition"
                    :class="
                      vistaLayout === 'lista'
                        ? 'bg-[#166534] text-white shadow-sm'
                        : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                    "
                    :aria-pressed="vistaLayout === 'lista'"
                    title="Vista de lista"
                    @click="vistaLayout = 'lista'"
                  >
                    <ListBulletIcon class="h-3.5 w-3.5 shrink-0 opacity-95" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="hidden w-full shrink-0 flex-col items-end gap-1 pb-0.5 sm:flex sm:w-auto"
          >
            <span class="text-[9px] font-semibold uppercase tracking-wide text-gray-500 sm:text-end">
              Vista
            </span>
            <div
              class="inline-flex rounded-xl bg-gray-100/95 p-1 shadow-inner ring-1 ring-gray-200/70"
              role="group"
              aria-label="Tipo de vista"
            >
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:px-3"
                :class="
                  vistaLayout === 'tarjetas'
                    ? 'bg-[#166534] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                "
                :aria-pressed="vistaLayout === 'tarjetas'"
                title="Vista de tarjetas"
                @click="vistaLayout = 'tarjetas'"
              >
                <Squares2X2Icon class="h-4 w-4 shrink-0 opacity-95" />
                <span class="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:px-3"
                :class="
                  vistaLayout === 'lista'
                    ? 'bg-[#166534] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-white/70 hover:text-gray-800'
                "
                :aria-pressed="vistaLayout === 'lista'"
                title="Vista de lista"
                @click="vistaLayout = 'lista'"
              >
                <ListBulletIcon class="h-4 w-4 shrink-0 opacity-95" />
                <span class="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        <p
          v-if="mostrarBarraFiltrosNatilleras && vistaActiva !== 'socio'"
          class="text-[10px] font-medium uppercase tracking-wide text-gray-400"
        >
          Mostrando {{ mostrandoListadosVista }} de {{ totalListadosVista }} natilleras
        </p>
      </div>

      <!-- Loading - Solo mostrar si NO está verificando el modal y NO se está eliminando una natillera -->
      <div v-if="natillerasStore.loading && !verificandoModal && !eliminandoNatillera" class="relative bg-gradient-to-br from-white via-natillera-50/30 to-emerald-50/20 rounded-3xl p-12 border border-natillera-200/50 shadow-xl backdrop-blur-sm text-center overflow-hidden">
        <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-500 mt-4 font-medium">Cargando natilleras...</p>
      </div>

      <!-- Vista: Todas (Propias + Compartidas) -->
      <template v-else-if="vistaActiva === 'todas'">
        <div v-if="todasLasNatillerasFiltradas.length === 0" class="w-full">
          <DashboardEmptySinNatilleras
            v-if="todasLasNatilleras.length === 0"
            class="w-full"
          />
          <div v-else class="flex w-full justify-center">
            <DashboardFiltroSinResultados @ver-todas="filtro = 'todas'" />
          </div>
        </div>

        <div
          v-else
          :class="
            vistaLayout === 'tarjetas'
              ? 'grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3'
              : 'space-y-3'
          "
        >
          <DashboardNatilleraCard
            v-for="natillera in todasLasNatillerasFiltradas"
            :key="natillera.id"
            :natillera="natillera"
            :variant="vistaLayout === 'tarjetas' ? 'grid' : 'list'"
            :fondo-total="fondoPorNatillera[natillera.id] ?? 0"
            :ribbon-compartida="!natillera.es_propia"
            :ribbon-otro-usuario="mostrarBordeTealNatillera(natillera)"
            :show-pin="esUsuarioRaigo"
            :pinned="estaPineada(natillera.id)"
            :show-delete="puedeEliminarNatillera(natillera) && natillera.es_propia"
            @toggle-pin="togglePinNatillera(natillera.id)"
            @delete="confirmarEliminarNatillera(natillera)"
          />

          <router-link
            v-if="vistaLayout === 'tarjetas'"
            to="/natilleras/crear"
            class="group relative flex min-h-[280px] flex-col justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all duration-300 hover:border-[#166534] hover:bg-natillera-50/50"
          >
            <div class="px-5 py-8 text-center">
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-natillera-100 transition-colors group-hover:bg-natillera-200">
                <PlusIcon class="h-8 w-8 text-[#166534]" />
              </div>
              <h3 class="font-body text-lg font-bold text-gray-900">Crear nueva natillera</h3>
              <p class="mt-2 text-sm text-gray-600">Inicia un nuevo grupo de ahorro</p>
            </div>
            <div class="border-t border-gray-100 px-5 py-3">
              <div class="flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <PlusIcon class="h-4 w-4 text-gray-400" />
                <span>Nueva natillera</span>
              </div>
            </div>
          </router-link>
          <router-link
            v-else
            to="/natilleras/crear"
            class="flex min-h-[72px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white px-4 py-4 text-sm font-semibold text-[#166534] transition hover:border-[#166534] hover:bg-emerald-50/60"
          >
            <PlusIcon class="h-5 w-5 shrink-0" />
            Crear nueva natillera
          </router-link>
        </div>
      </template>

      <!-- Vista: Mis Natilleras (propias) -->
      <template v-else-if="vistaActiva === 'propias'">
        <div v-if="natillerasFiltradas.length === 0" class="w-full flex justify-center">
          <DashboardPropiedadSinResultados
            v-if="cantidadNatillerasPropiasUsuario === 0"
            titulo="No se encontraron natilleras propias"
            descripcion="No administras ninguna natillera en esta cuenta. Cambia el filtro de propiedad para ver «Todas» o las compartidas."
            @ver-todas="vistaActiva = 'todas'"
          />
          <DashboardFiltroSinResultados v-else @ver-todas="filtro = 'todas'" />
        </div>

        <div
          v-else
          :class="
            vistaLayout === 'tarjetas'
              ? 'grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3'
              : 'space-y-3'
          "
        >
          <DashboardNatilleraCard
            v-for="natillera in natillerasFiltradas"
            :key="natillera.id"
            :natillera="natillera"
            :variant="vistaLayout === 'tarjetas' ? 'grid' : 'list'"
            :fondo-total="fondoPorNatillera[natillera.id] ?? 0"
            :ribbon-compartida="false"
            :ribbon-otro-usuario="mostrarBordeTealNatillera(natillera)"
            :show-pin="esUsuarioRaigo"
            :pinned="estaPineada(natillera.id)"
            :show-delete="puedeEliminarNatillera(natillera)"
            @toggle-pin="togglePinNatillera(natillera.id)"
            @delete="confirmarEliminarNatillera(natillera)"
          />

          <router-link
            v-if="vistaLayout === 'tarjetas'"
            to="/natilleras/crear"
            class="group relative flex min-h-[280px] flex-col justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all duration-300 hover:border-[#166534] hover:bg-natillera-50/50"
          >
            <div class="px-5 py-8 text-center">
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-natillera-100 transition-colors group-hover:bg-natillera-200">
                <PlusIcon class="h-8 w-8 text-[#166534]" />
              </div>
              <h3 class="font-body text-lg font-bold text-gray-900">Crear nueva natillera</h3>
              <p class="mt-2 text-sm text-gray-600">Inicia un nuevo grupo de ahorro</p>
            </div>
            <div class="border-t border-gray-100 px-5 py-3">
              <div class="flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <PlusIcon class="h-4 w-4 text-gray-400" />
                <span>Nueva natillera</span>
              </div>
            </div>
          </router-link>
          <router-link
            v-else
            to="/natilleras/crear"
            class="flex min-h-[72px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white px-4 py-4 text-sm font-semibold text-[#166534] transition hover:border-[#166534] hover:bg-emerald-50/60"
          >
            <PlusIcon class="h-5 w-5 shrink-0" />
            Crear nueva natillera
          </router-link>
        </div>
      </template>

      <!-- Vista: Natilleras Compartidas -->
      <template v-else-if="vistaActiva === 'compartidas'">
        <div v-if="natillerasCompartidasFiltradas.length === 0" class="w-full flex justify-center">
          <DashboardPropiedadSinResultados
            v-if="natillerasStore.natillerasCompartidas.length === 0"
            titulo="No se encontraron natilleras compartidas"
            descripcion="No colaboras en ninguna natillera compartida. Cuando te inviten, aparecerán aquí. También puedes revisar «Todas»."
            @ver-todas="vistaActiva = 'todas'"
          />
          <DashboardFiltroSinResultados v-else @ver-todas="filtro = 'todas'" />
        </div>

        <div
          v-else
          :class="
            vistaLayout === 'tarjetas'
              ? 'grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3'
              : 'space-y-3'
          "
        >
          <DashboardNatilleraCard
            v-for="natillera in natillerasCompartidasFiltradas"
            :key="natillera.id"
            :natillera="natillera"
            :variant="vistaLayout === 'tarjetas' ? 'grid' : 'list'"
            :fondo-total="fondoPorNatillera[natillera.id] ?? 0"
            :ribbon-compartida="true"
            :ribbon-otro-usuario="false"
            :show-pin="esUsuarioRaigo"
            :pinned="estaPineada(natillera.id)"
            :show-delete="false"
            @toggle-pin="togglePinNatillera(natillera.id)"
          />
        </div>
      </template>

      <!-- Vista: Como socio -->
      <template v-else-if="vistaActiva === 'socio'">
        <div v-if="!esSocioEnAlgunaNatillera" class="w-full flex justify-center">
          <DashboardPropiedadSinResultados
            titulo="No se encontraron natilleras como socio"
            descripcion="No estás registrado como socio en ninguna natillera. Revisa «Todas» o las compartidas."
            @ver-todas="vistaActiva = 'todas'"
          />
        </div>
        <div
          v-else
          class="relative rounded-2xl border border-orange-200/70 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 p-8 sm:p-10 text-center shadow-sm"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <UserIcon class="w-8 h-8 text-orange-600" />
          </div>
          <h3 class="font-display font-bold text-gray-800 text-lg sm:text-xl mb-2">
            Natilleras como socio
          </h3>
          <p class="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
            Pronto verás aquí las natilleras en las que participas como socio. Mientras tanto, revisa la pestaña «Todas» si te han compartido alguna.
          </p>
        </div>
      </template>
    </div>

    <!-- Modal de confirmación para eliminar natillera: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!natilleraAEliminar"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 overflow-hidden"
      @close="cerrarModalEliminacion"
    >
        <!-- Animación de fondo sutil durante la eliminación -->
        <div v-if="natillerasStore.loading" class="absolute inset-0 bg-gradient-to-br from-red-50/30 via-red-100/20 to-red-50/30"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-4">
            <div class="relative w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrashIcon v-if="!natillerasStore.loading" class="w-6 h-6 text-red-600" />
              <!-- Animación de carga moderna -->
              <div v-else class="relative w-6 h-6">
                <div class="absolute inset-0 border-3 border-red-200 rounded-full"></div>
                <div class="absolute inset-0 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">
                {{ natillerasStore.loading ? 'Eliminando Natillera...' : 'Eliminar Natillera' }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ natillerasStore.loading ? 'Por favor espera' : 'Esta acción no se puede deshacer' }}
              </p>
            </div>
          </div>
          
          <!-- Contenido del modal - siempre visible -->
          <div class="mb-6">
            <p class="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar la natillera <strong>"{{ natilleraAEliminar.nombre }}"</strong>?
            </p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <p class="font-semibold mb-1">⚠️ Se eliminarán permanentemente:</p>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>Todos los socios asociados</li>
                <li>Todas las cuotas</li>
                <li>Todos los préstamos y pagos</li>
                <li>Todas las actividades</li>
                <li>Todos los registros de historial</li>
              </ul>
            </div>
            <!-- Indicador sutil de carga durante la eliminación -->
            <div v-if="natillerasStore.loading" class="mt-4 flex items-center gap-2 text-sm text-red-600">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Eliminando natillera, por favor espera...</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button
              @click="cerrarModalEliminacion"
              :disabled="natillerasStore.loading"
              class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              @click="eliminarNatilleraConfirmado"
              :disabled="natillerasStore.loading"
              class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span v-if="!natillerasStore.loading">Sí, Eliminar</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminando...
              </span>
            </button>
          </div>
        </div>
    </ModalWrapper>

    <RechazarInvitacionConfirmModal
      :invitacion="invitacionARechazar"
      :loading="!!invitacionARechazar && procesandoInvitacion === invitacionARechazar.id"
      @close="cerrarModalRechazarInvitacion"
      @confirm="confirmarRechazarInvitacion"
    />

    <LoadingScreen
      :visible="verificandoModal && !eliminandoNatillera"
      :text="mensajeCargaActual"
    />

    <!-- Modal para crear primera natillera -->
    <ModalWrapper
      :show="mostrarModalCrearNatillera && !verificandoModal"
      :z-index="50"
      align="center"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      backdrop-class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      card-class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 overflow-hidden"
      @close="mostrarModalCrearNatillera = false"
    >
          <!-- Efectos decorativos de fondo -->
          <div class="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div class="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-teal-400/20 to-green-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 animate-pulse" style="animation-delay: 0.5s"></div>
          
          <div class="relative z-10">
            <!-- Mensaje de Bienvenida -->
            <div class="text-center mb-8 animate-fade-in-up">
              <!-- Icono: círculo mismo tono que el botón principal -->
              <div class="relative w-[5.25rem] h-[5.25rem] mx-auto mb-4 flex items-center justify-center">
                <div
                  class="flex h-full w-full items-center justify-center rounded-full bg-[hsl(152_55%_24%)] text-white shadow-[0_6px_20px_hsla(152,45%,18%,0.28)]"
                >
                  <PiggyBankIcon class="w-10 h-10 shrink-0" />
                </div>
              </div>
              
              <h2 class="text-2xl font-display font-bold text-gray-900 mb-3">
                ¡Hola, <span class="text-[#166534]">{{ authStore.userName }}</span>!
              </h2>
              <p class="text-gray-600 text-base leading-relaxed mb-4">
                Estamos emocionados de tenerte aquí.
              </p>
              <p class="text-gray-700 text-base font-medium mb-2">
                Para empezar, crea tu primera natillera.
              </p>
            </div>

            <div class="h-px w-full max-w-sm mx-auto mb-5 bg-[hsl(120_8%_88%)]" role="presentation" />

            <section
              class="text-left max-w-sm mx-auto mb-8"
              aria-labelledby="modal-bienvenida-como-funciona"
            >
              <h3
                id="modal-bienvenida-como-funciona"
                class="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[hsl(215_18%_38%)] mb-4"
              >
                Como funciona
              </h3>
              <ul class="m-0 p-0 list-none flex flex-col gap-4">
                <li class="flex gap-3 items-start text-sm font-medium text-[hsl(220_12%_26%)] leading-snug">
                  <BanknotesIcon class="w-[1.375rem] h-[1.375rem] shrink-0 text-[hsl(152_52%_32%)] mt-0.5" aria-hidden="true" />
                  <span>La natillera te permite realizar ahorro colectivo</span>
                </li>
                <li class="flex gap-3 items-start text-sm font-medium text-[hsl(220_12%_26%)] leading-snug">
                  <UserPlusIcon class="w-[1.375rem] h-[1.375rem] shrink-0 text-[hsl(152_52%_32%)] mt-0.5" aria-hidden="true" />
                  <span>Invita a los socios de tu grupo para que se unan</span>
                </li>
                <li class="flex gap-3 items-start text-sm font-medium text-[hsl(220_12%_26%)] leading-snug">
                  <CalendarIcon class="w-[1.375rem] h-[1.375rem] shrink-0 text-[hsl(152_52%_32%)] mt-0.5" aria-hidden="true" />
                  <span>Define la cuota y la periodicidad de los pagos</span>
                </li>
                <li class="flex gap-3 items-start text-sm font-medium text-[hsl(220_12%_26%)] leading-snug">
                  <PresentationChartLineIcon class="w-[1.375rem] h-[1.375rem] shrink-0 text-[hsl(152_52%_32%)] mt-0.5" aria-hidden="true" />
                  <span>Lleva el control de pagos, multas y sorteos</span>
                </li>
              </ul>
            </section>

            <!-- Botones (misma forma píldora que tarjeta vacía; colores distintos) -->
            <div class="flex flex-col gap-3 max-w-sm mx-auto w-full">
              <router-link
                :to="esSocioEnAlgunaNatillera ? '/dashboard' : '/natilleras/crear'"
                @click="marcarModalComoMostrado(); mostrarModalCrearNatillera = false"
                class="inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 px-6 text-[0.9375rem] font-bold text-white bg-[hsl(152_55%_24%)] hover:bg-[hsl(152_58%_20%)] shadow-[0_6px_20px_hsla(152,45%,18%,0.28)] hover:shadow-[0_8px_24px_hsla(152,45%,16%,0.32)] transition-[background,box-shadow,transform] active:scale-[0.98]"
              >
                <span v-if="!esSocioEnAlgunaNatillera" class="text-xl font-semibold leading-none" aria-hidden="true">+</span>
                <ArrowRightIcon v-else class="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{{ esSocioEnAlgunaNatillera ? 'Navegar como socio' : 'Crear mi primera natillera' }}</span>
              </router-link>

              <button
                type="button"
                @click="marcarModalComoMostrado(); mostrarModalCrearNatillera = false"
                class="inline-flex w-full items-center justify-center rounded-full py-3.5 px-6 text-[0.9375rem] font-bold text-[hsl(220_12%_26%)] bg-[hsl(120_12%_97%)] border border-[hsl(120_8%_88%)] hover:bg-[hsl(120_10%_94%)] hover:border-[hsl(120_8%_82%)] shadow-[0_4px_14px_hsla(152,20%,12%,0.08)] transition-[background,border-color,box-shadow,transform] active:scale-[0.98]"
              >
                Crear más tarde
              </button>
            </div>
          </div>
    </ModalWrapper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNatillerasStore } from '../stores/natilleras'
import { useUsersStore } from '../stores/users'
import { useNotificationStore } from '../stores/notifications'
import { useColaboradoresStore } from '../stores/colaboradores'
import { supabase } from '../lib/supabase'
import { formatDate } from '../utils/formatDate'
import {
  formatearRolColaboradorInvitacion as formatearRol,
  emailInvitadorDestacado,
  textoExpiracionInvitacionColaborador as textoExpiracionInvitacion,
} from '../utils/invitacionesColaborador'
import LoadingScreen from '../components/LoadingScreen.vue'
import ModalWrapper from '../components/ModalWrapper.vue'
import RechazarInvitacionConfirmModal from '../components/RechazarInvitacionConfirmModal.vue'
import DashboardEmptySinNatilleras from '../components/DashboardEmptySinNatilleras.vue'
import DashboardPropiedadSinResultados from '../components/DashboardPropiedadSinResultados.vue'
import DashboardFiltroSinResultados from '../components/DashboardFiltroSinResultados.vue'
import DashboardNatilleraCard from '../components/DashboardNatilleraCard.vue'
import PiggyBankIcon from '../components/icons/PiggyBankIcon.vue'
import { useBodyScrollLock } from '../composables/useBodyScrollLock'
import { detectIosPlatform } from '../composables/useIsIos'
import { 
  BanknotesIcon, 
  UsersIcon, 
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  TrashIcon,
  BuildingLibraryIcon,
  EyeIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ClockIcon,
  ChevronUpIcon,
  CalendarIcon,
  UserPlusIcon,
  PresentationChartLineIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const natillerasStore = useNatillerasStore()
const usersStore = useUsersStore()
const notificationStore = useNotificationStore()
const colaboradoresStore = useColaboradoresStore()
const totalFondo = ref(0)
const filtro = ref('todas')
const vistaActiva = ref('todas')
/** 'tarjetas' | 'lista' — persistido en localStorage */
const vistaLayout = ref('tarjetas')
const DASHBOARD_VISTA_LAYOUT_KEY = 'dashboardVistaNatilleras'
const natilleraAEliminar = ref(null)
const eliminandoNatillera = ref(false) // Flag para rastrear cuando se está eliminando una natillera
const invitacionARechazar = ref(null)
useBodyScrollLock(computed(() => !!natilleraAEliminar.value))
const usuarioAutenticado = ref(null)
const procesandoInvitacion = ref(null)
const recaudadoPorNatillera = ref({})
const progresoPorNatillera = ref({})
const fondoPorNatillera = ref({}) // fondoTotal por natillera (mismo valor que en detalle)
const statsPorNatillera = ref({}) // { totalRecaudadoNeto, utilidadesRecogidas, fondoTotal } por id
const mostrarModalCrearNatillera = ref(false)
const natillerasDondeEsSocio = ref([])
const verificandoModal = ref(true) // Estado para la animación de carga
const finalizandoVerificacion = ref(false) // Flag para evitar múltiples ejecuciones
const sociosPorNatillera = ref({}) // Almacenar socios de cada natillera

// Natilleras fijadas (pin): persistidas en Supabase para que se mantengan en todos los navegadores/dispositivos
const natillerasPineadas = ref([])
const loadingPineadas = ref(false)

async function cargarPineadas(userId) {
  if (!userId) {
    natillerasPineadas.value = []
    return
  }
  loadingPineadas.value = true
  try {
    const { data, error } = await supabase
      .from('user_natillera_pinned')
      .select('natillera_id, orden')
      .eq('user_id', userId)
      .order('orden', { ascending: true })

    if (error) throw error
    natillerasPineadas.value = (data || []).map((r) => r.natillera_id)

    // Migración única: si es raigo y tenía datos en localStorage, subirlos a Supabase y limpiar
    if (esUsuarioRaigo.value && natillerasPineadas.value.length === 0) {
      try {
        const raw = localStorage.getItem('natilleras_pineadas_raigo')
        const legacy = raw ? JSON.parse(raw) : []
        const ids = Array.isArray(legacy) ? legacy : []
        if (ids.length > 0) {
          await supabase.from('user_natillera_pinned').insert(
            ids.map((natillera_id, index) => ({ user_id: userId, natillera_id, orden: index }))
          )
          localStorage.removeItem('natilleras_pineadas_raigo')
          const { data: after } = await supabase
            .from('user_natillera_pinned')
            .select('natillera_id')
            .eq('user_id', userId)
            .order('orden', { ascending: true })
          natillerasPineadas.value = (after || []).map((r) => r.natillera_id)
        }
      } catch (_) {
        // ignorar fallo de migración
      }
    }
  } catch (e) {
    console.error('Error cargando natilleras fijadas:', e)
    natillerasPineadas.value = []
  } finally {
    loadingPineadas.value = false
  }
}

async function togglePinNatillera(natilleraId) {
  const userId = usuarioAutenticado.value?.id
  if (!userId) return

  const arr = [...natillerasPineadas.value]
  const i = arr.indexOf(natilleraId)
  const isPinned = i >= 0

  if (isPinned) {
    arr.splice(i, 1)
    natillerasPineadas.value = arr
    const { error } = await supabase
      .from('user_natillera_pinned')
      .delete()
      .eq('user_id', userId)
      .eq('natillera_id', natilleraId)
    if (error) {
      natillerasPineadas.value = [...natillerasPineadas.value]
      if (i >= 0) natillerasPineadas.value.splice(i, 0, natilleraId)
      notificationStore.error('No se pudo quitar de fijadas')
    }
  } else {
    arr.push(natilleraId)
    natillerasPineadas.value = arr
    const { error } = await supabase.from('user_natillera_pinned').insert({
      user_id: userId,
      natillera_id: natilleraId,
      orden: arr.length - 1
    })
    if (error) {
      natillerasPineadas.value = natillerasPineadas.value.filter((id) => id !== natilleraId)
      notificationStore.error('No se pudo fijar la natillera')
    }
  }
}

function estaPineada(natilleraId) {
  return natillerasPineadas.value.includes(natilleraId)
}
function ordenarPineadasPrimero(lista) {
  if (!esUsuarioRaigo.value || !lista.length) return lista
  const orden = [...natillerasPineadas.value]
  return [...lista].sort((a, b) => {
    const ia = orden.indexOf(a.id)
    const ib = orden.indexOf(b.id)
    if (ia >= 0 && ib < 0) return -1
    if (ia < 0 && ib >= 0) return 1
    if (ia >= 0 && ib >= 0) return ia - ib
    return 0
  })
}

// Solo para raigo.16@gmail.com: resaltar con contorno teal las natilleras cuyo propietario NO es raigo.16@gmail.com
const esUsuarioRaigo = computed(() => (authStore.userEmail || '').toLowerCase().trim() === 'raigo.16@gmail.com')
const emailPorAdminId = ref({}) // admin_id -> email del propietario (para saber si es raigo)

function propietarioEsRaigo(natillera) {
  if (!natillera?.admin_id) return false
  const email = (emailPorAdminId.value[natillera.admin_id] || '').toLowerCase().trim()
  return email === 'raigo.16@gmail.com'
}

// Mostrar borde teal cuando el usuario es raigo, el propietario NO es raigo, y es natillera propia (no compartida)
function mostrarBordeTealNatillera(natillera) {
  if (!esUsuarioRaigo.value) return false
  if (natillera?.es_propia !== true) return false // Solo en propias, nunca en compartidas
  if (!natillera?.admin_id) return false
  const email = (emailPorAdminId.value[natillera.admin_id] ?? '').toString().toLowerCase().trim()
  if (email === '') return false // Aún no hemos cargado el email del propietario
  return email !== 'raigo.16@gmail.com'
}

// Mensajes de carga que rotarán
const mensajesCarga = [
  'Calienta toda la suplencia...',
  'En poco estará todo listo',
  'Cargando datos de natilleras',
  'Ajustando condensador de flujo...',
  'Preparando todo para ti',
  'Cargando natilleras',
  'Abriendo el DRS',
  'Echandole mas agua a la sopa',
  'Poniendo neumaticos blandos',
  'Cargando informacion'
]
const mensajeCargaActual = ref(mensajesCarga[0])
let intervaloMensajeCarga = null

// Mensajes específicos para eliminación de natillera
const mensajesEliminacion = [
  'Eliminando socios asociados...',
  'Borrando cuotas y registros...',
  'Limpiando préstamos y pagos...',
  'Eliminando actividades...',
  'Removiendo historial...',
  'Finalizando eliminación...'
]
const mensajeEliminacionActual = ref(mensajesEliminacion[0])
let intervaloMensajeEliminacion = null

const natillerasFiltradas = computed(() => {
  let list = filtro.value === 'todas'
    ? natillerasStore.natilleras
    : natillerasStore.natilleras.filter(n => n.estado === filtro.value)
  // En "Mías" solo mostrar natilleras donde el usuario es el propietario (admin).
  // Importante para superusuario raigo: excluye natilleras de otros que ve en el listado general.
  const userId = usuarioAutenticado.value?.id
  if (userId) {
    list = list.filter(n => n.admin_id === userId)
  }
  return ordenarPineadasPrimero(list)
})

const natillerasCompartidasFiltradas = computed(() => {
  let list = filtro.value === 'todas'
    ? natillerasStore.natillerasCompartidas
    : natillerasStore.natillerasCompartidas.filter(n => n.estado === filtro.value)
  return ordenarPineadasPrimero(list)
})

/** Natilleras creadas por el usuario (admin), para vacíos en pestaña «Mis natilleras». */
const cantidadNatillerasPropiasUsuario = computed(() => {
  const uid = usuarioAutenticado.value?.id
  if (!uid) return 0
  return natillerasStore.natilleras.filter((n) => n.admin_id === uid).length
})

// Combinar natilleras propias y compartidas con flag de diferenciación
const todasLasNatilleras = computed(() => {
  const propias = natillerasStore.natilleras.map(n => ({ ...n, es_propia: true }))
  const compartidas = natillerasStore.natillerasCompartidas.map(n => ({ ...n, es_propia: false }))
  return [...propias, ...compartidas]
})

const todasLasNatillerasFiltradas = computed(() => {
  let todas = todasLasNatilleras.value
  
  if (filtro.value !== 'todas') {
    todas = todas.filter(n => n.estado === filtro.value)
  }
  
  // Ordenar: primero las propias, luego las compartidas
  todas = todas.sort((a, b) => {
    if (a.es_propia && !b.es_propia) return -1
    if (!a.es_propia && b.es_propia) return 1
    return 0
  })
  return ordenarPineadasPrimero(todas)
})

const totalListadosVista = computed(() => {
  if (vistaActiva.value === 'todas') return todasLasNatilleras.value.length
  if (vistaActiva.value === 'propias') return natillerasStore.natilleras.length
  if (vistaActiva.value === 'compartidas') return natillerasStore.natillerasCompartidas.length
  return 0
})

const mostrandoListadosVista = computed(() => {
  if (vistaActiva.value === 'todas') return todasLasNatillerasFiltradas.value.length
  if (vistaActiva.value === 'propias') return natillerasFiltradas.value.length
  if (vistaActiva.value === 'compartidas') return natillerasCompartidasFiltradas.value.length
  return 0
})

// Verificar si el usuario es socio en alguna natillera
async function verificarNatillerasDondeEsSocio() {
  try {
    if (!usuarioAutenticado.value) return
    
    // Una sola query con join: socios -> socios_natillera
    const { data: socios, error } = await supabase
      .from('socios')
      .select('socios_natillera(natillera_id)')
      .eq('email', usuarioAutenticado.value.email)
      .limit(1)
    
    if (error || !socios || socios.length === 0) {
      natillerasDondeEsSocio.value = []
      return
    }
    
    natillerasDondeEsSocio.value = (socios[0].socios_natillera || []).map(sn => sn.natillera_id)
  } catch (e) {
    console.error('Error verificando natilleras donde es socio:', e)
    natillerasDondeEsSocio.value = []
  }
}

// Verificar si el modal ya fue mostrado antes (solo para usuarios que son socios)
const yaSeMostroModal = () => {
  if (!usuarioAutenticado.value?.id) return false
  const key = `modal_bienvenida_mostrado_${usuarioAutenticado.value.id}`
  return localStorage.getItem(key) === 'true'
}

const marcarModalComoMostrado = () => {
  const key = `modal_bienvenida_mostrado_${usuarioAutenticado.value?.id || 'anon'}`
  localStorage.setItem(key, 'true')
}

// Computed para saber si es socio
const esSocioEnAlgunaNatillera = computed(() => {
  return natillerasDondeEsSocio.value.length > 0
})

/** Barra Estado + Propiedad + Vista: no ocultar en «De socios» si hay datos en panel o registro como socio. */
const mostrarBarraFiltrosNatilleras = computed(() => {
  return todasLasNatilleras.value.length > 0 || esSocioEnAlgunaNatillera.value
})

// Mostrar modal según las condiciones específicas
const debeMostrarModal = computed(() => {
  // No mostrar si está cargando
  if (natillerasStore.loading) return false
  
  // No mostrar si no hay usuario autenticado aún
  if (!usuarioAutenticado.value) return false

  // Con invitaciones pendientes, el usuario debe ver primero el bloque de invitaciones, no el modal de "primera natillera"
  if (colaboradoresStore.misInvitaciones.length > 0) return false
  
  // Verificar si tiene natilleras propias o compartidas
  const tieneNatilleras = todasLasNatilleras.value.length > 0
  const esSocio = esSocioEnAlgunaNatillera.value
  
  // Condición 1: Si NO tiene natilleras (ni propias/compartidas, ni como socio)
  // SIEMPRE mostrar, sin importar localStorage
  if (!tieneNatilleras && !esSocio) {
    return true
  }
  
  // Condición 2: Si tiene natilleras SOLO como socio (no propias ni compartidas)
  // Mostrar solo la primera vez (usar localStorage)
  if (!tieneNatilleras && esSocio) {
    return !yaSeMostroModal()
  }
  
  // Si tiene natilleras propias o compartidas, no mostrar
  return false
})

watch(
  () => colaboradoresStore.misInvitaciones.length,
  (n) => {
    if (n > 0) mostrarModalCrearNatillera.value = false
  }
)

// Pantalla de verificación inicial: guardar scroll y restaurar (evita salto en iOS/Android con scroll en <main>)
let loaderScrollLockY = 0
let loaderScrollLockMainY = 0

function getLoaderScrollMain() {
  return document.querySelector('main.overflow-y-auto')
}

function bloquearScroll() {
  const html = document.documentElement
  loaderScrollLockY = window.scrollY || html.scrollTop
  const main = getLoaderScrollMain()
  loaderScrollLockMainY = main ? main.scrollTop : 0

  if (detectIosPlatform()) {
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'relative'
    document.body.style.height = '100%'
    document.body.style.touchAction = 'none'
    html.style.overflow = 'hidden'
    html.style.height = '100%'
    if (main) {
      main.style.overflow = 'hidden'
      main.style.touchAction = 'none'
    }
    return
  }

  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${loaderScrollLockY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  html.style.overflow = 'hidden'
  const mainEl = getLoaderScrollMain()
  if (mainEl) {
    mainEl.style.position = 'fixed'
    mainEl.style.top = `-${loaderScrollLockMainY}px`
    mainEl.style.left = '0'
    mainEl.style.right = '0'
    mainEl.style.width = '100%'
    mainEl.style.overflow = 'hidden'
  }
}

function desbloquearScroll() {
  const html = document.documentElement
  const main = getLoaderScrollMain()

  if (detectIosPlatform()) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.height = ''
    document.body.style.touchAction = ''
    html.style.overflow = ''
    html.style.height = ''
    if (main) {
      main.style.overflow = ''
      main.style.touchAction = ''
      requestAnimationFrame(() => {
        main.scrollTop = loaderScrollLockMainY
      })
    }
    requestAnimationFrame(() => {
      window.scrollTo(0, loaderScrollLockY)
    })
    return
  }

  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  html.style.overflow = ''
  if (main) {
    main.style.position = ''
    main.style.top = ''
    main.style.left = ''
    main.style.right = ''
    main.style.width = ''
    main.style.overflow = ''
    main.scrollTop = loaderScrollLockMainY
  }
  window.scrollTo(0, loaderScrollLockY)
}

// Variable para mantener el índice anterior fuera del intervalo
let indiceMensajeAnterior = -1

// Función para iniciar la rotación de mensajes de carga (aleatoria)
function iniciarRotacionMensajes() {
  // Limpiar intervalo anterior si existe
  if (intervaloMensajeCarga) {
    clearInterval(intervaloMensajeCarga)
    intervaloMensajeCarga = null
  }
  
  // Seleccionar un mensaje aleatorio inicial
  indiceMensajeAnterior = Math.floor(Math.random() * mensajesCarga.length)
  mensajeCargaActual.value = mensajesCarga[indiceMensajeAnterior]
  
  // Cambiar mensaje cada 2 segundos de forma aleatoria
  intervaloMensajeCarga = setInterval(() => {
    let nuevoIndice
    // Si hay más de un mensaje, asegurarse de que no se repita el anterior
    if (mensajesCarga.length > 1) {
      do {
        nuevoIndice = Math.floor(Math.random() * mensajesCarga.length)
      } while (nuevoIndice === indiceMensajeAnterior)
    } else {
      nuevoIndice = 0
    }
    
    indiceMensajeAnterior = nuevoIndice
    mensajeCargaActual.value = mensajesCarga[nuevoIndice]
  }, 2000)
}

// Función para detener la rotación de mensajes
function detenerRotacionMensajes() {
  if (intervaloMensajeCarga) {
    clearInterval(intervaloMensajeCarga)
    intervaloMensajeCarga = null
  }
}

// Variable para mantener el índice anterior de mensajes de eliminación
let indiceMensajeEliminacionAnterior = -1

// Función para iniciar la rotación de mensajes de eliminación
function iniciarRotacionMensajesEliminacion() {
  // Limpiar intervalo anterior si existe
  if (intervaloMensajeEliminacion) {
    clearInterval(intervaloMensajeEliminacion)
    intervaloMensajeEliminacion = null
  }
  
  // Seleccionar un mensaje aleatorio inicial
  indiceMensajeEliminacionAnterior = Math.floor(Math.random() * mensajesEliminacion.length)
  mensajeEliminacionActual.value = mensajesEliminacion[indiceMensajeEliminacionAnterior]
  
  // Cambiar mensaje cada 2 segundos de forma aleatoria
  intervaloMensajeEliminacion = setInterval(() => {
    let nuevoIndice
    // Si hay más de un mensaje, asegurarse de que no se repita el anterior
    if (mensajesEliminacion.length > 1) {
      do {
        nuevoIndice = Math.floor(Math.random() * mensajesEliminacion.length)
      } while (nuevoIndice === indiceMensajeEliminacionAnterior)
    } else {
      nuevoIndice = 0
    }
    
    indiceMensajeEliminacionAnterior = nuevoIndice
    mensajeEliminacionActual.value = mensajesEliminacion[nuevoIndice]
  }, 2000)
}

// Función para detener la rotación de mensajes de eliminación
function detenerRotacionMensajesEliminacion() {
  if (intervaloMensajeEliminacion) {
    clearInterval(intervaloMensajeEliminacion)
    intervaloMensajeEliminacion = null
  }
}

// Función auxiliar para finalizar la verificación y mostrar el modal si corresponde
async function finalizarVerificacionYMostrarModal() {
  // Evitar múltiples ejecuciones simultáneas
  if (finalizandoVerificacion.value || !verificandoModal.value) {
    return
  }
  
  // IMPORTANTE: Verificar que todo esté listo, especialmente que las natilleras hayan terminado de cargar
  if (!usuarioAutenticado.value) {
    return // No hay usuario, no hacer nada
  }
  
  // Verificar explícitamente que las natilleras hayan terminado de cargar
  if (natillerasStore.loading) {
    return // Las natilleras aún están cargando, esperar
  }
  
  finalizandoVerificacion.value = true
  
  try {
    await verificarNatillerasDondeEsSocio()
    
    if (natillerasStore.loading) {
      finalizandoVerificacion.value = false
      return
    }
    
    await nextTick()
    
    if (!natillerasStore.loading && usuarioAutenticado.value) {
      detenerRotacionMensajes()
      desbloquearScroll()
      verificandoModal.value = false
      
      await nextTick()
      
      if (debeMostrarModal.value) {
        mostrarModalCrearNatillera.value = true
      }
    }
  } finally {
    finalizandoVerificacion.value = false
  }
}

// Watch para controlar el bloqueo de scroll cuando se muestra/oculta la animación
watch(verificandoModal, (mostrando) => {
  if (mostrando) {
    bloquearScroll()
    // Iniciar rotación con un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      iniciarRotacionMensajes()
    }, 100)
  } else {
    desbloquearScroll()
    detenerRotacionMensajes()
  }
}, { immediate: true }) // immediate: true para que se ejecute al montar el componente

// Cargar emails de propietarios (admin_id -> email) para resaltar natilleras de otros cuando el usuario es raigo
async function cargarEmailsPropietarios() {
  if (!esUsuarioRaigo.value) return
  const propias = natillerasStore.natilleras || []
  const compartidas = natillerasStore.natillerasCompartidas || []
  const adminIds = [...new Set([
    ...propias.map(n => n?.admin_id).filter(Boolean),
    ...compartidas.map(n => n?.admin_id).filter(Boolean)
  ])]
  if (adminIds.length === 0) {
    emailPorAdminId.value = {}
    return
  }
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', adminIds)
    if (error) return
    emailPorAdminId.value = Object.fromEntries((data || []).map(p => [p.id, p.email || '']))
  } catch (e) {
    console.warn('Error cargando emails de propietarios:', e)
  }
}

// Watch para cuando termine de cargar las natilleras.
// Ya NO reactiva la pantalla de carga (verificandoModal) por un simple re-fetch del store:
// las tarjetas permanecen visibles con datos previos mientras se refrescan.
watch(() => natillerasStore.loading, async (loading, oldLoading) => {
  if (oldLoading && !loading && esUsuarioRaigo.value) {
    await cargarEmailsPropietarios()
  }
})

watch(() => usuarioAutenticado.value, async (usuario) => {
  if (usuario && esUsuarioRaigo.value && !natillerasStore.loading) {
    await cargarEmailsPropietarios()
  }
})


async function calcularTotalFondo() {
  try {
    const lista = todasLasNatilleras.value
    if (!lista || lista.length === 0) {
      totalFondo.value = 0
      fondoPorNatillera.value = {}
      statsPorNatillera.value = {}
      recaudadoPorNatillera.value = {}
      progresoPorNatillera.value = {}
      return
    }
    // Una sola carga en lote: fondo, stats y barras de progreso (evita duplicar queries con calcularRecaudadoYProgresoPorNatillera)
    const ids = lista.map(n => n?.id).filter(id => id != null)
    const batchResult = await natillerasStore.calcularEstadisticasParaDashboard(ids)
    const porId = {}
    const statsPorId = {}
    const recaudadoMap = {}
    const progresoMap = {}
    let suma = 0
    ids.forEach(id => {
      const s = batchResult[id] || {
        totalRecaudadoNeto: 0,
        totalRecaudadoNetoInclParciales: 0,
        utilidadesRecogidas: 0,
        fondoTotal: 0,
        recaudadoBrutoCuotas: 0,
        progresoCuotas: 0
      }
      porId[id] = s.fondoTotal
      statsPorId[id] = {
        totalRecaudadoNeto: s.totalRecaudadoNeto,
        totalRecaudadoNetoInclParciales: s.totalRecaudadoNetoInclParciales,
        utilidadesRecogidas: s.utilidadesRecogidas,
        fondoTotal: s.fondoTotal
      }
      recaudadoMap[id] = s.recaudadoBrutoCuotas ?? 0
      progresoMap[id] = s.progresoCuotas ?? 0
      suma += s.fondoTotal
    })
    fondoPorNatillera.value = porId
    statsPorNatillera.value = statsPorId
    recaudadoPorNatillera.value = recaudadoMap
    progresoPorNatillera.value = progresoMap
    totalFondo.value = suma
  } catch (e) {
    console.error('Error calculando total del fondo:', e)
    totalFondo.value = 0
    fondoPorNatillera.value = {}
    statsPorNatillera.value = {}
    recaudadoPorNatillera.value = {}
    progresoPorNatillera.value = {}
  }
}

function obtenerRecaudadoNetoNatillera(natilleraId) {
  return statsPorNatillera.value[natilleraId]?.totalRecaudadoNetoInclParciales ?? statsPorNatillera.value[natilleraId]?.totalRecaudadoNeto ?? 0
}

function obtenerUtilidadesNatillera(natilleraId) {
  return statsPorNatillera.value[natilleraId]?.utilidadesRecogidas ?? 0
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value)
}

function formatMoneyShort(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return formatMoney(value)
}

function obtenerRecaudadoNatillera(natilleraId) {
  return recaudadoPorNatillera.value[natilleraId] || 0
}

function obtenerProgresoNatillera(natilleraId) {
  return Math.min(100, Math.max(0, progresoPorNatillera.value[natilleraId] || 0))
}

function formatearPeriodicidad(periodicidad) {
  const periodos = {
    quincenal: 'QUINCENAL',
    mensual: 'MENSUAL',
    semanal: 'SEMANAL'
  }
  return periodos[periodicidad?.toLowerCase()] || periodicidad?.toUpperCase() || 'MENSUAL'
}

function obtenerTipoNatillera(natillera) {
  if (natillera.es_propia) return { tipo: 'MÍA', color: 'green' }
  if (natillera.mi_rol) return { tipo: 'COMPARTIDA', color: 'blue' }
  return { tipo: 'SOCIO', color: 'blue' }
}

// Función para obtener las iniciales de un nombre
function obtenerIniciales(nombre) {
  if (!nombre) return '??'
  const palabras = nombre.trim().split(/\s+/)
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

// Función optimizada para cargar socios de TODAS las natilleras en una sola query
async function cargarTodosLosSocios(natilleraIds) {
  try {
    // Asegurar que natilleraIds sea un array
    if (!natilleraIds) {
      console.warn('cargarTodosLosSocios: natilleraIds es null o undefined')
      return
    }
    
    // Convertir a array si no lo es y filtrar valores válidos
    let idsArray = []
    if (Array.isArray(natilleraIds)) {
      // Crear una copia del array y filtrar valores válidos
      idsArray = [...natilleraIds].filter(id => id != null && id !== undefined)
    } else {
      console.warn('cargarTodosLosSocios: natilleraIds no es un array:', typeof natilleraIds, natilleraIds)
      return
    }
    
    // Validación final: asegurar que idsArray es un array válido
    if (!Array.isArray(idsArray)) {
      console.error('cargarTodosLosSocios: idsArray no es un array después del filtrado:', typeof idsArray, idsArray)
      idsArray = [] // Forzar a array vacío
    }
    
    // Validación adicional: verificar que idsArray tiene el método forEach
    if (typeof idsArray.forEach !== 'function') {
      console.error('cargarTodosLosSocios: idsArray no tiene método forEach:', idsArray)
      idsArray = [] // Forzar a array vacío
    }
    
    if (idsArray.length === 0) {
      return
    }
    // OPTIMIZACIÓN: Una sola query para todos los socios de todas las natilleras
    const { data: todosSociosNatillera, error } = await supabase
      .from('socios_natillera')
      .select(`
        id,
        natillera_id,
        socio:socios(id, nombre, avatar_seed, avatar_style)
      `)
      .in('natillera_id', idsArray)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Agrupar socios por natillera_id
    // Validación adicional: asegurar que idsArray sigue siendo un array
    if (!Array.isArray(idsArray)) {
      console.error('cargarTodosLosSocios: idsArray no es un array después de la validación:', typeof idsArray, idsArray)
      return
    }
    
    // Validación adicional: verificar que idsArray tiene el método forEach antes de usarlo
    if (typeof idsArray.forEach !== 'function') {
      console.error('cargarTodosLosSocios: idsArray no tiene método forEach antes de usarlo:', {
        tipo: typeof idsArray,
        esArray: Array.isArray(idsArray),
        valor: idsArray,
        constructor: idsArray?.constructor?.name
      })
      return
    }
    
    const sociosAgrupados = {}
    try {
      idsArray.forEach(id => {
        sociosAgrupados[id] = []
      })
    } catch (forEachError) {
      console.error('cargarTodosLosSocios: Error en forEach:', {
        error: forEachError,
        idsArray: idsArray,
        tipo: typeof idsArray,
        esArray: Array.isArray(idsArray),
        constructor: idsArray?.constructor?.name
      })
      throw forEachError
    }
    
    (todosSociosNatillera || []).forEach(sn => {
      if (sn.natillera_id && sociosAgrupados[sn.natillera_id]) {
        // Solo guardar los primeros 6 por natillera
        if (sociosAgrupados[sn.natillera_id].length < 6) {
          sociosAgrupados[sn.natillera_id].push({
            id: sn.id,
            nombre: sn.socio?.nombre || 'Sin nombre',
            avatar_seed: sn.socio?.avatar_seed,
            avatar_style: sn.socio?.avatar_style || 'adventurer',
            iniciales: obtenerIniciales(sn.socio?.nombre)
          })
        }
      }
    })
    
    // Guardar en caché todos los resultados
    Object.keys(sociosAgrupados).forEach(natilleraId => {
      sociosPorNatillera.value[natilleraId] = sociosAgrupados[natilleraId]
    })
  } catch (e) {
    console.error('Error cargando socios de natilleras:', e)
  }
}

// Función para obtener socios de una natillera (usa caché si está disponible)
async function obtenerSociosNatillera(natilleraId) {
  // Si ya tenemos los socios en caché, retornarlos
  if (sociosPorNatillera.value[natilleraId]) {
    return sociosPorNatillera.value[natilleraId]
  }
  
  // Si no están en caché, cargar solo para esta natillera (fallback)
  try {
    const { data: sociosNatillera, error } = await supabase
      .from('socios_natillera')
      .select(`
        id,
        socio:socios(id, nombre, avatar_seed, avatar_style)
      `)
      .eq('natillera_id', natilleraId)
      .limit(6)
    
    if (error) throw error
    
    const socios = (sociosNatillera || []).map(sn => ({
      id: sn.id,
      nombre: sn.socio?.nombre || 'Sin nombre',
      avatar_seed: sn.socio?.avatar_seed,
      avatar_style: sn.socio?.avatar_style || 'adventurer',
      iniciales: obtenerIniciales(sn.socio?.nombre)
    }))
    
    // Guardar en caché
    sociosPorNatillera.value[natilleraId] = socios
    return socios
  } catch (e) {
    console.error('Error obteniendo socios de natillera:', e)
    return []
  }
}

// Función para obtener el color de fondo de avatar según índice
function obtenerColorAvatar(index) {
  const colores = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500'
  ]
  return colores[index % colores.length]
}

function iconoRolInvitacion(rol) {
  if (rol === 'visor') return EyeIcon
  if (rol === 'co_administrador') return ShieldCheckIcon
  return UsersIcon
}

function puedeEliminarNatillera(natillera) {
  if (!usuarioAutenticado.value) {
    return false
  }

  const emailUsuario = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  if (emailUsuario === 'raigo.16@gmail.com') {
    return true
  }

  return natillera.admin_id === usuarioAutenticado.value.id
}

function confirmarEliminarNatillera(natillera) {
  natilleraAEliminar.value = natillera
  eliminandoNatillera.value = false // Asegurar que el flag esté en false al abrir el modal
}

function cerrarModalEliminacion() {
  natilleraAEliminar.value = null
  eliminandoNatillera.value = false
  detenerRotacionMensajesEliminacion()
}

async function eliminarNatilleraConfirmado() {
  if (!natilleraAEliminar.value) return

  // Marcar que se está eliminando para mostrar la pantalla de carga específica
  eliminandoNatillera.value = true
  // Iniciar rotación de mensajes de eliminación
  iniciarRotacionMensajesEliminacion()
  
  try {
    const resultado = await natillerasStore.eliminarNatillera(natilleraAEliminar.value.id)
    
    if (resultado.success) {
      cerrarModalEliminacion()
      await natillerasStore.fetchTodasLasNatilleras()
      await calcularTotalFondo()
      // Ocultar ventana de carga que pudo activarse por el watcher al recargar natilleras
      verificandoModal.value = false
      notificationStore.success('Natillera eliminada exitosamente', 'Éxito')
    } else {
      const mensajeError = resultado.error || 'Error desconocido al eliminar la natillera'
      
      if (mensajeError.includes('permisos') || mensajeError.includes('42501')) {
        notificationStore.error(
          `${mensajeError}\n\nPor favor, ejecuta la migración SQL en Supabase: add_cascade_delete_policies.sql`,
          'Error de permisos'
        )
      } else {
        notificationStore.error(
          `Error al eliminar la natillera:\n\n${mensajeError}\n\nRevisa la consola del navegador (F12) para más detalles.`,
          'Error'
        )
      }
    }
  } finally {
    // Siempre resetear el flag y detener rotación, incluso si hay error
    eliminandoNatillera.value = false
    detenerRotacionMensajesEliminacion()
  }
}

async function aceptarInvitacion(invitacion) {
  try {
    procesandoInvitacion.value = invitacion.id
    
    const resultado = await colaboradoresStore.aceptarInvitacion(invitacion.token_invitacion)
    
    if (resultado.success) {
      notificationStore.success(
        `¡Ahora eres colaborador de "${resultado.data.natillera_nombre}"!`,
        'Invitación aceptada'
      )
      // Recargar natilleras compartidas
      await natillerasStore.fetchNatillerasCompartidas()
    } else {
      notificationStore.error(resultado.error || 'Error al aceptar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al aceptar la invitación')
  } finally {
    procesandoInvitacion.value = null
  }
}

function abrirModalRechazarInvitacion(invitacion) {
  invitacionARechazar.value = invitacion
}

function cerrarModalRechazarInvitacion() {
  if (procesandoInvitacion.value) return
  invitacionARechazar.value = null
}

async function confirmarRechazarInvitacion() {
  const inv = invitacionARechazar.value
  if (!inv) return

  try {
    procesandoInvitacion.value = inv.id

    const resultado = await colaboradoresStore.rechazarInvitacion(inv.token_invitacion)

    if (resultado.success) {
      invitacionARechazar.value = null
      notificationStore.info('Invitación rechazada')
    } else {
      notificationStore.error(resultado.error || 'Error al rechazar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al rechazar la invitación')
  } finally {
    procesandoInvitacion.value = null
  }
}

// Función auxiliar para inicializar el componente
async function inicializarComponente() {
  // Usar authStore.user (local, sin round-trip de red) en vez de getUser()
  const user = authStore.user
  usuarioAutenticado.value = user
  
  if (!user) {
    verificandoModal.value = false
    return
  }

  // ── FASE 1: Cargar natilleras + datos independientes en paralelo ──
  // Invitaciones y perfil NO dependen de natilleras, se lanzan al mismo tiempo.
  const invitacionesPromise = colaboradoresStore.fetchMisInvitaciones({ user })
    .catch(err => console.error('Error cargando invitaciones:', err))
  const perfilPromise = usersStore.getCurrentUserProfile()
    .catch(err => console.error('Error cargando datos secundarios:', err))

  await Promise.all([
    cargarPineadas(user.id),
    natillerasStore.fetchTodasLasNatilleras({ user }),
    invitacionesPromise,
    perfilPromise
  ])

  // Mostrar contenido inmediatamente: quitar pantalla de carga
  const tieneNatilleras = todasLasNatilleras.value.length > 0
  if (tieneNatilleras && verificandoModal.value) {
    detenerRotacionMensajes()
    desbloquearScroll()
    verificandoModal.value = false
  }

  // ── FASE 2: Cargar datos secundarios que dependen de natilleras (no bloquean la UI) ──
  const natillerasArray = Array.isArray(natillerasStore.natilleras) ? natillerasStore.natilleras : []
  const natillerasCompartidasArray = Array.isArray(natillerasStore.natillerasCompartidas) ? natillerasStore.natillerasCompartidas : []
  const todasIds = [
    ...natillerasArray.map(n => n?.id).filter(id => id != null),
    ...natillerasCompartidasArray.map(n => n?.id).filter(id => id != null)
  ]

  await Promise.all([
    calcularTotalFondo(),
    cargarTodosLosSocios(todasIds)
  ])

  // ── FASE 3: Verificar si debe mostrarse el modal de bienvenida ──
  if (!natillerasStore.loading && verificandoModal.value) {
    await finalizarVerificacionYMostrarModal()
  } else if (!tieneNatilleras && verificandoModal.value) {
    await finalizarVerificacionYMostrarModal()
  }
}

watch(vistaLayout, (v) => {
  try {
    localStorage.setItem(DASHBOARD_VISTA_LAYOUT_KEY, v)
  } catch (_) {
    /* ignore */
  }
})

onMounted(async () => {
  try {
    const saved = localStorage.getItem(DASHBOARD_VISTA_LAYOUT_KEY)
    if (saved === 'lista' || saved === 'tarjetas') vistaLayout.value = saved
  } catch (_) {
    /* ignore */
  }
  // Activar animación de carga al inicio; las pineadas se cargan dentro de inicializarComponente
  verificandoModal.value = true
  await inicializarComponente()
})

// Limpiar intervalos cuando el componente se desmonte
onBeforeUnmount(() => {
  detenerRotacionMensajes()
  detenerRotacionMensajesEliminacion()
  desbloquearScroll()
})

// Cuando el usuario regresa a esta ruta (desde otra página)
onActivated(async () => {
  const user = authStore.user
  if (!user) return

  // Si las natilleras necesitan recargarse o están cargando, inicializar todo
  if (natillerasStore.loading || todasLasNatilleras.value.length === 0) {
    if (!verificandoModal.value) verificandoModal.value = true
    await inicializarComponente()
    return
  }

  // Si ya hay natilleras cargadas, actualizar solo el total del fondo al volver
  calcularTotalFondo()
})
</script>

<style scoped>
/* Animación de pulso y brillo */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(16, 185, 129, 0.5), 0 0 80px rgba(16, 185, 129, 0.3);
  }
}

/* Animación de escala continua */
@keyframes scale-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Animación de brillo deslizante */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
  }
}

/* Animación de anillos de pulso */
@keyframes ping-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Animación de borde pulsante */
@keyframes border-pulse {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
  }
}

/* Animación de contenido que rebota suavemente */
@keyframes content-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Animación de rotación lenta del icono */
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Clase para la animación de shimmer */
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

/* Clase para la animación de ping ring */
.animate-ping-ring {
  animation: ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Clase para la animación de border pulse */
.animate-border-pulse {
  animation: border-pulse 1.5s ease-in-out infinite;
}

/* Clase para la animación de contenido */
.animate-content-bounce {
  animation: content-bounce 2s ease-in-out infinite;
}

/* Clase para la animación de spin slow */
.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* Clase para el botón con pulso y brillo */
.animate-pulse-button {
  animation: pulse-glow 2s ease-in-out infinite, scale-bounce 1.5s ease-in-out infinite;
}

/* Animación de rotación suave */
@keyframes spin-smooth {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-smooth {
  animation: spin-smooth 1s linear infinite;
}

/* Animación de barra de progreso */
@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress {
  animation: progress 1.5s ease-in-out infinite;
}

/* Animación de rotación reversa */
.animate-spin-reverse {
  animation: spin-smooth 0.8s linear infinite reverse;
}

/* Animación de brillo pulsante para el centro */
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(16, 185, 129, 0.4);
  }
}

.animate-glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Animaciones de partículas flotantes */
@keyframes float-1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(10px, -15px) scale(1.2);
    opacity: 1;
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-12px, 10px) scale(1.1);
    opacity: 1;
  }
}

@keyframes float-3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(8px, 12px) scale(1.15);
    opacity: 1;
  }
}

.animate-float-1 {
  animation: float-1 2s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.animate-float-3 {
  animation: float-3 2.2s ease-in-out infinite;
  animation-delay: 1s;
}

/* Animación de fade in-out para el texto */
@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-fade-in-out {
  animation: fade-in-out 2s ease-in-out infinite;
}
</style>

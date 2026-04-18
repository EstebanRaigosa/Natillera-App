<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-3 sm:space-y-5 lg:space-y-6 overflow-x-hidden relative">
    <!-- Efectos decorativos de fondo -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-natillera-200/30 to-emerald-200/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-natillera-200/20 rounded-full blur-3xl"></div>
    </div>
    <LoadingScreen
      :visible="cargandoNatillera"
      :text="mensajeCargaActual"
    />
    <template v-if="natillera && !cargandoNatillera">
      <!-- ─── Header: Saludo + Natillera + Estado ─── -->
      <header class="mb-1 sm:mb-2">
        <div class="flex items-center gap-2">
          <BackButton to="/dashboard" :inline="true" />
          <h1 class="min-w-0 flex-1 text-[clamp(1.25rem,3.6vw,1.75rem)] font-bold text-gray-900 leading-tight truncate">
            Hola, <span class="text-[#166534]">{{ authStore.userName }}</span>
          </h1>
          <button
            v-if="puedeUsarRecordatorio"
            type="button"
            @click="abrirModalRecordatorio"
            class="ml-auto flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-full sm:rounded-lg flex items-center justify-center gap-1.5 text-white bg-[#166534] hover:bg-[#145a2d] active:bg-[#124d26] shadow-sm transition-colors touch-manipulation"
            title="Recordatorios"
            aria-label="Recordatorios"
          >
            <BellAlertIcon class="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span class="text-xs font-semibold hidden sm:inline">Recordatorio</span>
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 mt-0.5">
          <p class="text-sm sm:text-base font-semibold text-gray-700 truncate">{{ nombreNatilleraPascalCase }}</p>
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold',
              natillera.estado === 'activa'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            ]"
          >
            <span
              :class="['w-1.5 h-1.5 rounded-full', natillera.estado === 'activa' ? 'bg-green-500' : 'bg-amber-500']"
            ></span>
            {{ natillera.estado === 'activa' ? 'Activa' : 'Cerrada' }}
          </span>
        </div>
      </header>

      <!-- ─── Indicadores (paleta: #2D2D2D · #E91E63 · #F58231 · #90D15B · #2EBA74) ─── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <!-- Socios -->
        <div class="flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-2.5 py-2 sm:px-3 sm:py-2 shadow-sm">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2D2D2D]/10 text-[#2D2D2D]">
            <UsersIcon class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] sm:text-xs font-medium text-gray-500 leading-tight">Socios</p>
            <p class="text-base sm:text-lg font-bold text-[#2D2D2D] tabular-nums leading-tight mt-0">{{ estadisticas.totalSocios }}</p>
          </div>
        </div>
        <!-- Recaudado -->
        <div class="flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-2.5 py-2 sm:px-3 sm:py-2 shadow-sm">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2EBA74]/18 text-[#1f9a5c]">
            <BanknotesIcon class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] sm:text-xs font-medium text-gray-500 leading-tight">Recaudado</p>
            <p class="text-base sm:text-lg font-bold text-[#188a52] tabular-nums leading-tight mt-0 break-words">${{ formatMoney(fondoTotalIndicador) }}</p>
          </div>
        </div>
        <!-- Pendiente -->
        <div class="flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-2.5 py-2 sm:px-3 sm:py-2 shadow-sm">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F58231]/16 text-[#F58231]">
            <ClipboardDocumentListIcon class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] sm:text-xs font-medium text-gray-500 leading-tight">Pendiente</p>
            <p class="text-base sm:text-lg font-bold text-[#d46a28] tabular-nums leading-tight mt-0 break-words">${{ formatMoney(estadisticas.totalPendiente) }}</p>
          </div>
        </div>
        <!-- Utilidad -->
        <div
          @click="abrirModalDesgloseUtilidades"
          class="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-2.5 py-2 transition-colors hover:bg-[#90D15B]/14 sm:px-3 sm:py-2 shadow-sm"
        >
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#90D15B]/35 text-[#3d6b28]">
            <SparklesIcon class="h-6 w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] sm:text-xs font-medium text-gray-500 leading-tight">Utilidad</p>
            <p class="text-base sm:text-lg font-bold text-[#C2185B] tabular-nums leading-tight mt-0 break-words">${{ formatMoney(utilidadNetoIndicador) }}</p>
          </div>
        </div>
      </div>

      <!-- ─── Configuración de la natillera (plegable en todos los tamaños; título corto en móvil) ─── -->
      <div class="mt-2 sm:mt-3">
        <div class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-4 lg:px-4 lg:py-3">
          <div
            class="flex items-center justify-between gap-3 lg:!mb-2"
            :class="datosNatilleraConfigPanelAbierto ? 'mb-5' : 'mb-0'"
          >
            <button
              type="button"
              class="-my-1 flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-xl py-1.5 pl-0 pr-1 text-left transition-colors hover:bg-gray-50 active:bg-gray-50 sm:my-0 sm:py-0 sm:pr-0"
              :aria-expanded="datosNatilleraConfigPanelAbierto"
              aria-controls="panel-datos-natillera"
              @click="toggleDatosNatilleraConfigPanel"
            >
              <InformationCircleIcon
                class="h-5 w-5 shrink-0 text-gray-800 lg:h-4 lg:w-4"
                stroke-width="1.75"
                aria-hidden="true"
              />
              <h3
                id="heading-datos-natillera"
                class="min-w-0 flex-1 text-sm font-bold text-gray-900 max-sm:normal-case max-sm:tracking-tight sm:uppercase sm:tracking-wide"
              >
                <span class="max-sm:inline sm:hidden">Conf. de la natillera</span>
                <span class="hidden sm:inline">Configuración de la Natillera</span>
              </h3>
              <ChevronDownIcon
                class="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200"
                :class="datosNatilleraConfigPanelAbierto ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>
            <router-link
              v-if="puedeConfigurar && id"
              :to="`/natilleras/${id}/configuracion`"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full text-[#166534] transition hover:bg-gray-100 active:bg-gray-200 [-webkit-tap-highlight-color:transparent] touch-manipulation lg:h-10 lg:w-10"
              aria-label="Editar configuración de la natillera"
              title="Editar configuración"
              @click.stop
            >
              <Cog6ToothIcon class="h-5 w-5 shrink-0 lg:h-6 lg:w-6" aria-hidden="true" />
            </router-link>
          </div>
          <div
            id="panel-datos-natillera"
            role="region"
            aria-labelledby="heading-datos-natillera"
            class="grid grid-cols-2 gap-x-4 gap-y-5 text-sm sm:gap-x-6 sm:gap-y-4 lg:gap-x-5 lg:gap-y-2"
            :class="{ hidden: !datosNatilleraConfigPanelAbierto }"
          >
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:text-[9px]">
                Periodicidad
              </p>
              <p class="mt-1 text-sm font-bold capitalize text-gray-900 sm:text-base lg:mt-0.5 lg:text-sm">
                {{ natillera.periodicidad || '—' }}
              </p>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:text-[9px]">
                Días de gracia
              </p>
              <p class="mt-1 text-sm font-bold tabular-nums text-gray-900 sm:text-base lg:mt-0.5 lg:text-sm">
                {{ natillera.reglas_multas?.dias_gracia ?? '—' }}
              </p>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:text-[9px]">
                Fecha inicio
              </p>
              <p class="mt-1 text-sm font-bold text-gray-900 sm:text-base lg:mt-0.5 lg:text-sm">
                {{ formatFechaCorta(natillera.fecha_inicio) }}
              </p>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:text-[9px]">
                Fecha final
              </p>
              <p class="mt-1 text-sm font-bold text-gray-900 sm:text-base lg:mt-0.5 lg:text-sm">
                {{ fechaFinConfiguracionTexto }}
              </p>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:text-[9px]">
                Préstamos
              </p>
              <p
                v-if="natilleraPrestamosDeshabilitados(natillera)"
                class="mt-1 text-sm font-bold text-gray-700 sm:text-base lg:mt-0.5 lg:text-sm"
              >
                No permitidos
              </p>
              <p v-else class="mt-1 text-sm font-bold text-[#166534] sm:text-base lg:mt-0.5 lg:text-sm">Permitidos</p>
            </div>
            <div class="col-span-2 min-w-0 sm:col-span-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 lg:text-[9px]">
                Sanciones
              </p>
              <template
                v-if="natillera.reglas_multas?.sanciones?.activa || natillera.reglas_multas?.activa"
              >
                <p class="mt-1 text-base font-bold text-[#166534] sm:text-lg lg:mt-0.5 lg:text-sm">
                  Activas
                </p>
                <p class="mt-2 text-sm font-normal leading-snug text-gray-900 lg:mt-1 lg:text-xs lg:leading-tight">
                  Tipo:
                  <span class="font-semibold">{{ etiquetaTipoSancionesNatillera }}</span>
                </p>
                <p class="mt-1 text-sm font-normal leading-snug text-gray-900 lg:mt-0.5 lg:text-xs lg:leading-tight">
                  Sanciones adicionales:
                  <span
                    :class="
                      sancionesAdicionalesNatilleraResumen.activas
                        ? 'font-semibold text-amber-800'
                        : 'font-semibold text-gray-800'
                    "
                  >
                    {{ sancionesAdicionalesNatilleraResumen.activas ? 'Sí' : 'No'
                    }}<template v-if="sancionesAdicionalesNatilleraResumen.activas">
                      — {{ sancionesAdicionalesNatilleraResumen.texto }}</template>
                  </span>
                </p>
              </template>
              <p v-else class="mt-1 text-sm font-bold text-gray-700 sm:text-base lg:mt-0.5 lg:text-sm">
                Desactivadas
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Invitaciones colaborador (notificación compacta) ─── -->
      <div
        v-if="misInvitacionesPendientesDetalle.length > 0"
        class="mt-3 space-y-2"
        role="status"
        aria-live="polite"
      >
        <div
          v-for="inv in misInvitacionesPendientesDetalle"
          :key="inv.id"
          class="invitacion-notify-card group relative overflow-hidden rounded-xl border border-emerald-400/45 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/90 pl-[3px] shadow-md shadow-emerald-700/10 ring-1 ring-emerald-500/25 animate-fade-in-invite"
        >
          <div
            class="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-l-[10px] bg-gradient-to-b from-emerald-400 via-emerald-600 to-teal-600 shadow-[0_0_12px_rgba(16,185,129,0.55)]"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-emerald-200/35 to-transparent animate-sweep-invite"
            aria-hidden="true"
          />
          <div class="relative flex flex-wrap items-stretch gap-2 px-2 py-1.5 pl-3 sm:gap-3 sm:px-3 sm:py-2">
            <div
              class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-900/25 ring-2 ring-white/80 sm:h-10 sm:w-10"
              aria-hidden="true"
            >
              <BellAlertIcon class="h-4 w-4 sm:h-5 sm:w-5 animate-bounce-slow-invite" />
              <span
                class="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white shadow-md ring-2 ring-white"
                aria-hidden="true"
              >1</span>
            </div>
            <div class="min-w-0 flex-1 basis-[min(100%,10rem)] self-center">
              <div class="mb-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span class="text-[10px] font-bold leading-snug text-emerald-900 sm:text-[11px]">
                  Te invitaron a participar en una natillera
                </span>
                <span
                  v-if="esInvitacionDeNatilleraActual(inv)"
                  class="inline-flex items-center rounded-full bg-emerald-700 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-white shadow-sm ring-1 ring-emerald-500/40 sm:text-[9px]"
                >
                  Esta natillera
                </span>
              </div>
              <p class="min-w-0 truncate text-[10px] leading-snug text-slate-800 sm:text-[11px]">
                <span class="font-semibold text-emerald-900">{{ inv.natillera_nombre || 'Natillera' }}</span>
                <span class="text-emerald-700/90"> · {{ formatearRolColaboradorInvitacion(inv.rol) }}</span>
                <span class="text-slate-500"> · </span>
                <span class="text-slate-600">{{ emailInvitadorDestacado(inv) }}</span>
              </p>
            </div>
            <div class="flex w-full shrink-0 items-center justify-end gap-1.5 sm:ml-auto sm:w-auto sm:justify-center sm:self-center">
              <button
                type="button"
                @click="aceptarInvitacionCompacta(inv)"
                :disabled="procesandoInvitacionCompacta === inv.id"
                class="inline-flex h-8 min-w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800 px-3 text-[10px] font-bold text-white shadow-md shadow-emerald-900/30 ring-1 ring-white/20 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 sm:h-7 sm:min-w-[4.25rem] sm:px-2.5"
              >
                <span v-if="procesandoInvitacionCompacta !== inv.id">Aceptar</span>
                <span v-else class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
              </button>
              <button
                type="button"
                @click="abrirModalRechazarInvitacionCompacta(inv)"
                :disabled="procesandoInvitacionCompacta === inv.id"
                class="inline-flex h-8 min-w-[4.5rem] items-center justify-center rounded-full border border-slate-300/90 bg-white/90 px-3 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50 sm:h-7 sm:min-w-[4.25rem] sm:px-2.5"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Empty state: sin alertas, sin movimientos, sin utilidades ─── -->
      <div
        v-if="sinActividadEnNatillera"
        class="natillera-empty mt-6 sm:mt-8 animate-fade-in-up"
      >
        <div class="natillera-empty__grid">
          <div class="natillera-empty__lead">
            <div class="natillera-empty__illustration" aria-hidden="true">
              <div class="natillera-empty__ring-outer">
                <div class="natillera-empty__ring-inner">
                  <CheckBadgeIcon class="natillera-empty__icon" />
                </div>
              </div>
              <div class="natillera-empty__badge">
                <PiggyBankIcon class="natillera-empty__badge-icon" />
              </div>
            </div>

            <h3 class="natillera-empty__title">Aún no hay movimientos</h3>
            <p class="natillera-empty__desc">
              No hay alertas, movimientos ni utilidades registradas aún.
              Cuando los socios empiecen a aportar, aquí verás toda la actividad.
            </p>
          </div>

          <div class="natillera-empty__divider" role="presentation" />

          <section
            class="natillera-empty__hints"
            aria-labelledby="natillera-empty-hints-heading"
          >
            <h4 id="natillera-empty-hints-heading" class="natillera-empty__hints-title">
              ¿Qué puedes hacer?
            </h4>
            <ul class="natillera-empty__hints-list">
              <li class="natillera-empty__hints-item">
                <UsersIcon class="natillera-empty__hints-icon" aria-hidden="true" />
                <span>Agrega socios desde la pestaña <strong>Socios</strong></span>
              </li>
              <li class="natillera-empty__hints-item">
                <BanknotesIcon class="natillera-empty__hints-icon" aria-hidden="true" />
                <span>Registra los pagos en la pestaña <strong>Cuotas</strong></span>
              </li>
              <li class="natillera-empty__hints-item">
                <CalendarIcon class="natillera-empty__hints-icon" aria-hidden="true" />
                <span>Revisa las actividades en la pestaña <strong>Actividades</strong></span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <!-- ─── Alertas recientes + Últimos movimientos (2 cols en desktop) ─── -->
      <div
        v-if="!sinActividadEnNatillera && (sociosEnMora.length > 0 || ultimosMovimientos.length > 0)"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6"
      >
        <!-- Alertas recientes -->
        <section
          v-if="sociosEnMora.length > 0"
          class="rounded-2xl border border-gray-200/80 bg-white shadow-sm"
        >
          <div class="px-5 pt-5 pb-3">
            <h2 class="text-base sm:text-lg font-bold text-gray-900">Alertas</h2>
          </div>
          <div class="px-3 pb-4 space-y-4">
            <!-- Cuotas en mora -->
            <div v-if="previewCuotasCount > 0">
              <div class="flex items-center gap-2 px-2 mb-2">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white" aria-hidden="true">
                  <ExclamationTriangleIconSolid class="h-3 w-3" />
                </span>
                <span class="text-xs font-bold text-red-700 uppercase tracking-wide">Cuotas en mora</span>
                <span class="text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 leading-none">{{ cantidadCuotasEnMoraAlertas }}</span>
              </div>
              <div class="space-y-0.5">
                <div
                  v-for="socioMora in sociosCuotasMoraLista.slice(0, previewCuotasCount)"
                  :key="'cm-' + socioMora.id"
                  class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/40 transition-colors"
                >
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-500" aria-hidden="true">
                    <ExclamationTriangleIconSolid class="h-3 w-3" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-[13px] font-semibold text-gray-900 truncate leading-tight">{{ socioMora.nombre }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {{ socioMora.cuotasMora }} {{ socioMora.cuotasMora === 1 ? 'cuota' : 'cuotas' }}
                      · {{ socioMora.diasMora }}d
                    </p>
                  </div>
                  <div class="flex-shrink-0 pl-2 text-right tabular-nums leading-tight">
                    <p class="text-sm font-bold text-red-600">${{ formatMoney(socioMora.totalDeudaCuotas + socioMora.totalSanciones) }}</p>
                    <p v-if="socioMora.totalSanciones > 0" class="text-[10px] text-gray-400 mt-1">
                      cuota <span class="text-gray-500">${{ formatMoney(socioMora.totalDeudaCuotas) }}</span>
                      + multa <span class="text-amber-600">${{ formatMoney(socioMora.totalSanciones) }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Separador si hay ambos tipos -->
            <div v-if="previewCuotasCount > 0 && previewPrestamosCount > 0" class="border-t border-gray-100 mx-2"></div>

            <!-- Préstamos en mora -->
            <div v-if="previewPrestamosCount > 0">
              <div class="flex items-center gap-2 px-2 mb-2">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white" aria-hidden="true">
                  <BanknotesIconSolid class="h-3 w-3" />
                </span>
                <span class="text-xs font-bold text-violet-700 uppercase tracking-wide">Préstamos en mora</span>
                <span class="text-[10px] font-bold text-white bg-violet-500 rounded-full px-1.5 py-0.5 leading-none">{{ prestamosEnMoraLista.length }}</span>
              </div>
              <div class="space-y-1">
                <button
                  v-for="p in prestamosEnMoraLista.slice(0, previewPrestamosCount)"
                  :key="'pm-' + p.prestamoId"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-violet-50/40 active:bg-violet-50/60"
                  @click="verPrestamoEnMora(p)"
                >
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-500" aria-hidden="true">
                    <BanknotesIconSolid class="h-3 w-3" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-[13px] font-semibold text-gray-900 truncate leading-tight">{{ p.nombreSocio }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {{ p.cuotasVencidas }} {{ p.cuotasVencidas === 1 ? 'cuota' : 'cuotas' }}
                      · {{ p.diasMoraPrestamo }}d
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0 pl-2">
                    <p class="text-[13px] font-bold text-violet-600 tabular-nums leading-tight">${{ formatMoney(p.totalDeudaPrestamo) }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Ver todos -->
            <div v-if="hayMasAlertasRecientes" class="pt-1 text-center">
              <button
                type="button"
                class="text-sm font-semibold text-[#166534] underline decoration-[#166534]/40 underline-offset-2 transition hover:text-[#145a2d] hover:decoration-[#145a2d]/50 active:opacity-90 [-webkit-tap-highlight-color:transparent] touch-manipulation"
                @click="modalTodasLasAlertas = true"
              >
                Ver todos
              </button>
            </div>
          </div>
        </section>

        <!-- Últimos movimientos -->
        <section
          v-if="ultimosMovimientos.length > 0"
          class="rounded-2xl border border-gray-200/80 bg-white shadow-sm"
        >
          <div class="px-5 pt-5 pb-3">
            <h2 class="text-base sm:text-lg font-bold text-gray-900">Últimos movimientos</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="px-5 pb-2.5 font-semibold text-gray-600 text-xs">Socio</th>
                  <th class="px-3 pb-2.5 font-semibold text-gray-600 text-xs hidden sm:table-cell">Detalle</th>
                  <th class="px-3 pb-2.5 font-semibold text-gray-600 text-xs text-right">Monto</th>
                  <th class="pl-2 pr-3 sm:px-5 pb-2.5 font-semibold text-gray-600 text-xs text-right">Tipo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="mov in ultimosMovimientos"
                  :key="mov.id"
                  class="hover:bg-gray-50/60 transition-colors"
                >
                  <td class="px-5 py-3 min-w-0 max-w-[11rem] sm:max-w-[10rem]">
                    <p class="font-medium text-gray-800 truncate">{{ mov.nombre }}</p>
                    <p class="sm:hidden text-xs text-gray-500 truncate mt-0.5">{{ mov.periodo }}</p>
                  </td>
                  <td class="px-3 py-3 text-gray-600 hidden sm:table-cell text-sm leading-snug min-w-0 max-w-[14rem]">{{ mov.periodo }}</td>
                  <td
                    class="px-3 py-3 font-semibold tabular-nums text-right whitespace-nowrap"
                    :class="Number(mov.monto) < 0 ? 'text-rose-700' : 'text-gray-800'"
                  >${{ formatMoney(mov.monto) }}</td>
                  <td class="pl-2 pr-3 sm:px-5 py-3 text-right align-middle min-w-0">
                    <span
                      :class="clasesBadgeUltimoMov(mov.estado)"
                      :title="tooltipTextoUltimoMovimiento(mov)"
                    >{{ mov.estadoEtiqueta }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- ─── Utilidades por categoría (gráfico) ─── -->
      <section
        v-if="utilidadesCategoriaGrafico.segments.length > 0"
        class="mt-4 sm:mt-6 rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden"
      >
        <div class="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-2">
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <ChartPieIcon class="h-5 w-5 shrink-0 text-[#73AA73]" aria-hidden="true" />
              Utilidades por categoría
            </h2>
          </div>
          <button
            type="button"
            @click="abrirModalDesgloseUtilidades"
            class="shrink-0 text-xs sm:text-sm font-semibold text-natillera-500 hover:text-natillera-600 active:text-natillera-700 underline underline-offset-2 decoration-natillera-400 hover:decoration-natillera-500"
          >
            Ver desglose completo
          </button>
        </div>
        <div class="px-5 pb-5 sm:pb-6 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div
            class="flex justify-center lg:justify-start shrink-0"
            role="img"
            :aria-label="'Utilidades recogidas por categoría, total ' + formatMoney(utilidadesCategoriaGrafico.total)"
          >
            <div
              class="relative h-[11rem] w-[11rem] sm:h-[12.5rem] sm:w-[12.5rem] rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]"
              :style="{ background: utilidadesCategoriaGrafico.conicGradient }"
            >
              <div
                class="absolute inset-[26%] rounded-full bg-white flex flex-col items-center justify-center px-2 text-center shadow-sm border border-[#73AA73]/28"
              >
                <span class="text-[10px] font-bold uppercase tracking-wide text-gray-400 leading-tight">Recogidas</span>
                <span class="text-lg sm:text-xl font-bold text-[#2EBA74] tabular-nums leading-tight mt-0.5">
                  ${{ formatMoney(utilidadesCategoriaGrafico.total) }}
                </span>
              </div>
            </div>
          </div>
          <ul class="flex-1 min-w-0 space-y-3 sm:space-y-3.5 list-none m-0 p-0" role="list">
            <li
              v-for="seg in utilidadesCategoriaGrafico.segments"
              :key="seg.id"
              class="min-w-0"
            >
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-black/5"
                  :style="{ backgroundColor: seg.color }"
                  aria-hidden="true"
                />
                <span class="text-sm font-semibold text-gray-800 truncate flex-1">{{ seg.label }}</span>
                <span class="text-sm font-bold text-gray-900 tabular-nums shrink-0">${{ formatMoney(seg.value) }}</span>
              </div>
              <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  class="h-full rounded-full min-w-px transition-[width] duration-500 ease-out"
                  :style="{ width: seg.pct + '%', backgroundColor: seg.color }"
                />
              </div>
              <p class="text-[11px] text-gray-500 mt-0.5 tabular-nums">{{ seg.pct.toFixed(1) }}% del total recogido</p>
            </li>
          </ul>
        </div>

        <!-- Puente visual: recogidas − egresos + ingresos = neto (no forma parte del donut; el donut sigue siendo 100% recogidas) -->
        <div class="px-5 pb-5 sm:pb-6">
          <div
            v-if="ajustesUtilidadesGrafico.tieneAjustes"
            class="rounded-xl border border-gray-200/90 bg-gradient-to-b from-natillera-50/50 to-white px-4 py-3.5 shadow-sm"
          >
            <p class="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-3">
              De lo recogido al neto en utilidades
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-3">
                <span class="text-gray-600">Recogidas</span>
                <span class="font-bold tabular-nums text-gray-900">${{ formatMoney(ajustesUtilidadesGrafico.recogidas) }}</span>
              </div>
              <div
                v-if="ajustesUtilidadesGrafico.egresos > 0"
                class="flex items-center justify-between gap-3"
              >
                <span class="text-red-700">Egresos de utilidades</span>
                <span class="font-bold tabular-nums text-red-600">− ${{ formatMoney(ajustesUtilidadesGrafico.egresos) }}</span>
              </div>
              <div
                v-if="ajustesUtilidadesGrafico.ingresos > 0"
                class="flex items-center justify-between gap-3"
              >
                <span class="text-natillera-800">Ingresos a utilidades</span>
                <span class="font-bold tabular-nums text-natillera-600">+ ${{ formatMoney(ajustesUtilidadesGrafico.ingresos) }}</span>
              </div>
              <div
                class="flex items-center justify-between gap-3 border-t border-gray-200 pt-2.5 mt-2"
              >
                <span class="font-semibold text-natillera-900">Neto</span>
                <span class="text-base font-bold tabular-nums text-natillera-700">${{ formatMoney(ajustesUtilidadesGrafico.neto) }}</span>
              </div>
            </div>
          </div>
          <p
            v-else
            class="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-3 py-2.5 text-center text-xs text-gray-600"
          >
            No hay egresos ni ingresos en el rubro utilidades: el <span class="font-semibold text-gray-800">neto</span> coincide con lo
            <span class="font-semibold text-gray-800">recogido</span>.
          </p>
        </div>
      </section>

    </template>
    <div v-else-if="!cargandoNatillera" class="card text-center py-12">
      <p class="text-gray-500">No se encontró la natillera</p>
      <router-link to="/natilleras" class="btn-primary mt-4 inline-block">
        Volver a natilleras
      </router-link>
    </div>
    <!-- Modal WhatsApp: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalWhatsApp"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="card relative w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col bg-white shadow-2xl border border-gray-200 p-6"
      @close="cerrarModalWhatsApp"
    >
        <h3 class="text-lg sm:text-xl font-display font-bold text-gray-800 mb-2 sm:mb-3">
          Comprobante de estado del socio
        </h3>
        <p class="text-gray-500 text-xs sm:text-sm mb-3">
          Selecciona un socio para generar un comprobante con su estado (ahorro, cuotas, sanciones, actividades y préstamos). Podrás descargarlo o enviarlo por WhatsApp.
        </p>
        
        <!-- Barra de búsqueda -->
        <div class="relative mb-3">
          <MagnifyingGlassIcon class="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            v-model="busquedaSocio"
            type="text"
            placeholder="Buscar socio por nombre o teléfono..."
            class="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
          />
        </div>
        
        <!-- Lista de socios -->
        <div class="space-y-2 overflow-y-auto flex-1 max-h-[45vh] sm:max-h-60">
          <button 
            v-for="sn in sociosFiltrados" 
            :key="sn.id"
            type="button"
            @click.stop="generarComprobanteEstadoSocio(sn)"
            :disabled="loadingEstadoSocio"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
              !loadingEstadoSocio
                ? 'bg-gray-50 hover:bg-teal-50 active:bg-teal-100 cursor-pointer' 
                : 'bg-gray-100 opacity-70 cursor-wait'
            ]"
          >
            <img 
              :src="getAvatarUrl(sn.socio?.nombre || sn.id, sn.socio?.avatar_seed)" 
              :alt="sn.socio?.nombre"
              class="w-10 h-10 rounded-full flex-shrink-0 border-2 border-teal-400"
            />
            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-800 truncate text-sm sm:text-base">{{ sn.socio?.nombre }}</p>
              <p class="text-xs sm:text-sm text-gray-500 truncate">{{ sn.socio?.telefono ? `Tel: ${sn.socio.telefono}` : 'Sin teléfono' }}</p>
            </div>
            <div class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
              <DocumentCheckIcon class="w-3.5 h-3.5 text-white" />
            </div>
          </button>
          
          <!-- Mensaje cuando no hay resultados -->
          <div v-if="sociosFiltrados.length === 0" class="text-center py-6">
            <p class="text-gray-400 text-sm">No se encontraron socios</p>
          </div>
        </div>
        <button 
          @click="cerrarModalWhatsApp"
          class="btn-secondary w-full mt-4 flex-shrink-0"
        >
          Cerrar
        </button>
    </ModalWrapper>

    <!-- Modal Comprobante de Estado del Socio (z-index por encima de otras modales z-50) -->
    <ModalWrapper
      :show="!!modalComprobanteEstadoSocio && !!comprobanteEstadoSocio"
      :z-index="60"
      align="bottom"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="card relative w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col bg-white shadow-2xl border border-gray-200 p-4 sm:p-6"
      @close="modalComprobanteEstadoSocio = false; comprobanteEstadoSocio = null"
    >
      <h3 class="text-lg sm:text-xl font-display font-bold text-gray-800 mb-3 flex-shrink-0">
        Comprobante de estado
      </h3>
      <div class="overflow-y-auto flex-1 min-h-0 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <!-- Comprobante visual (mismo ref para exportar a imagen) -->
        <div
          v-if="comprobanteEstadoSocio"
          ref="comprobanteEstadoRef"
          class="bg-white rounded-2xl overflow-hidden mx-auto"
          style="width: 360px; max-width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); font-family: system-ui, -apple-system, sans-serif;"
        >
          <div class="comprobante-content" style="background: #ecfdf5; padding: 20px 16px; color: #1f2937;">
            <!-- Título -->
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #111827; letter-spacing: -0.5px;">
                  Estado del socio
                </h1>
              </div>
            </div>

            <!-- Socio -->
            <div style="background: white; padding: 12px 14px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 12px; text-align: center;">
              <p style="color: #9ca3af; font-size: 9px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase;">Socio</p>
              <p style="font-size: 18px; font-weight: 800; margin: 0; color: #111827;">{{ comprobanteEstadoSocio.socio?.nombre || 'Socio' }}</p>
            </div>

            <!-- Resumen en tarjetas -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- Cuota actual -->
              <div v-if="(comprobanteEstadoSocio.cuotasPendientes || 0) > 0 || (comprobanteEstadoSocio.totalPendiente || 0) > 0" style="background: #fef3c7; padding: 10px 12px; border-radius: 10px; border: 1px solid #fde68a;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="color: #b45309; font-weight: 700; font-size: 12px;">Cuota actual {{ comprobanteEstadoSocio.cuotasPendientes ? `(${comprobanteEstadoSocio.cuotasPendientes})` : '' }}</span>
                  <span style="font-weight: 800; color: #d97706; font-size: 15px;">${{ formatMoney(comprobanteEstadoSocio.totalPendiente || 0) }}</span>
                </div>
                <div v-if="(comprobanteEstadoSocio.cuotasPendientesList || []).length > 0" style="font-size: 10px; color: #92400e; display: flex; flex-direction: column; gap: 2px;">
                  <span v-for="(item, i) in comprobanteEstadoSocio.cuotasPendientesList" :key="'p-' + i">{{ item.periodo }}: ${{ formatMoney(item.valor) }}</span>
                </div>
              </div>
              <!-- Cuotas en mora -->
              <div v-if="(comprobanteEstadoSocio.cuotasMora || 0) > 0 || (comprobanteEstadoSocio.totalMora || 0) > 0" style="background: #fef2f2; padding: 10px 12px; border-radius: 10px; border: 1px solid #fecaca;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="color: #b91c1c; font-weight: 700; font-size: 12px;">Cuotas en mora {{ comprobanteEstadoSocio.cuotasMora ? `(${comprobanteEstadoSocio.cuotasMora})` : '' }}</span>
                  <span style="font-weight: 800; color: #dc2626; font-size: 15px;">${{ formatMoney(comprobanteEstadoSocio.totalMora || 0) }}</span>
                </div>
                <div v-if="(comprobanteEstadoSocio.cuotasMoraList || []).length > 0" style="font-size: 10px; color: #991b1b; display: flex; flex-direction: column; gap: 2px;">
                  <span v-for="(item, i) in comprobanteEstadoSocio.cuotasMoraList" :key="'m-' + i">{{ item.periodo }}: ${{ formatMoney(item.valor) }}</span>
                </div>
              </div>
              <!-- Sanciones a pagar -->
              <div v-if="(comprobanteEstadoSocio.totalSancionesPendientes || 0) > 0" style="background: #fff1f2; padding: 10px 12px; border-radius: 10px; border: 1px solid #ffe4e6;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="color: #be123c; font-weight: 700; font-size: 12px;">Sanciones a pagar</span>
                  <span style="font-weight: 800; color: #e11d48; font-size: 15px;">${{ formatMoney(comprobanteEstadoSocio.totalSancionesPendientes) }}</span>
                </div>
                <div v-if="(comprobanteEstadoSocio.sancionesDesglose || []).length > 0" style="font-size: 10px; color: #be123c; display: flex; flex-direction: column; gap: 2px;">
                  <span v-for="(item, i) in comprobanteEstadoSocio.sancionesDesglose" :key="'s-' + i">{{ item.periodo }}: ${{ formatMoney(item.valor) }}</span>
                </div>
              </div>
              <!-- Actividades pendientes (a la fecha) -->
              <div v-if="(comprobanteEstadoSocio.actividadesPendientesTotal || 0) > 0" style="background: #eff6ff; padding: 10px 12px; border-radius: 10px; border: 1px solid #bfdbfe;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="color: #1d4ed8; font-weight: 700; font-size: 12px;">Actividades pendientes (a la fecha)</span>
                  <span style="font-weight: 800; color: #2563eb; font-size: 15px;">${{ formatMoney(comprobanteEstadoSocio.actividadesPendientesTotal) }}</span>
                </div>
                <div v-if="(comprobanteEstadoSocio.actividadesPendientesDesglose || []).length > 0" style="font-size: 10px; color: #1d4ed8; display: flex; flex-direction: column; gap: 2px;">
                  <span v-for="(item, i) in comprobanteEstadoSocio.actividadesPendientesDesglose" :key="'act-' + i">{{ item.periodo }}: ${{ formatMoney(item.valor) }}</span>
                </div>
              </div>
              <!-- Cuotas de préstamos pendientes (a la fecha) -->
              <div v-if="(comprobanteEstadoSocio.totalPrestamosPendiente || 0) > 0" style="background: #faf5ff; padding: 10px 12px; border-radius: 10px; border: 1px solid #f3e8ff;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="color: #6b21a8; font-weight: 700; font-size: 12px;">Cuotas de préstamos pendientes (a la fecha)</span>
                  <span style="font-weight: 800; color: #7e22ce; font-size: 15px;">${{ formatMoney(comprobanteEstadoSocio.totalPrestamosPendiente) }}</span>
                </div>
                <div v-if="(comprobanteEstadoSocio.prestamosPendientesDesglose || []).length > 0" style="font-size: 10px; color: #6b21a8; display: flex; flex-direction: column; gap: 2px;">
                  <span v-for="(item, i) in comprobanteEstadoSocio.prestamosPendientesDesglose" :key="'pr-' + i">{{ item.periodo }}: ${{ formatMoney(item.valor) }}</span>
                </div>
              </div>
            </div>

            <!-- Total a pagar para estar al día (destacado) -->
            <div style="margin-top: 14px; background: white; border-radius: 14px; padding: 14px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 2px solid #1d4ed8;">
              <p style="color: #1e40af; font-size: 10px; font-weight: 800; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total a pagar para estar al día</p>
              <p v-if="(comprobanteEstadoSocio.totalAPagar || 0) > 0" style="font-size: 26px; font-weight: 900; margin: 0; color: #1d4ed8; letter-spacing: -0.5px; line-height: 1.2;">${{ formatMoney(comprobanteEstadoSocio.totalAPagar) }}</p>
              <p v-else style="font-size: 22px; font-weight: 800; margin: 0; color: #059669; line-height: 1.2;">Al día ✓</p>
            </div>


            <!-- 4×1000: impuesto y total a consignar (siempre si hay total al día; el impuesto puede redondear a $0 en montos muy bajos) -->
            <div v-if="(comprobanteEstadoSocio.totalAPagar || 0) > 0" style="margin-top: 12px; background: #fefce8; border: 1px solid #fef08a; border-radius: 10px; padding: 10px 12px;">
              <p style="color: #854d0e; font-size: 10px; font-weight: 700; margin: 0 0 6px 0;">4×1000 (transferencia)</p>
              <p style="color: #713f12; font-size: 11px; margin: 0 0 8px 0;">Si paga por transferencia, tenga en cuenta el impuesto del 4×1000 en el total a consignar</p>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="color: #713f12; font-size: 12px; font-weight: 600;">Impuesto 4×1000</span>
                <span style="font-size: 14px; font-weight: 800; color: #a16207;">${{ formatMoney(comprobanteEstadoSocio.valor4x1000 || 0) }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-top: 6px; border-top: 1px dashed #fde047;">
                <span style="color: #713f12; font-size: 12px; font-weight: 700;">Total a consignar (incluye 4×1000)</span>
                <span style="font-size: 16px; font-weight: 900; color: #854d0e;">${{ formatMoney(comprobanteEstadoSocio.totalAPagarCon4x1000 != null ? comprobanteEstadoSocio.totalAPagarCon4x1000 : (comprobanteEstadoSocio.totalAPagar || 0) + (comprobanteEstadoSocio.valor4x1000 || 0)) }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 16px;">
              <p style="color: #9ca3af; font-size: 10px; margin: 0 0 4px 0;">
                Generado el {{ new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
              </p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span style="color: #d1d5db;">✨</span>
                <p style="color: #d1d5db; font-size: 10px; font-weight: 600; margin: 0;">NATILLERAPP</p>
                <span style="color: #d1d5db;">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones: Descargar y (solo móvil) Enviar por WhatsApp -->
      <div class="flex flex-col sm:flex-row gap-2 mt-4 flex-shrink-0">
        <button
          @click="descargarComprobanteEstadoSocio"
          :disabled="generandoImagenEstadoSocio"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowDownTrayIcon class="w-5 h-5" />
          Descargar
        </button>
        <button
          v-if="esMobile"
          @click="enviarComprobanteEstadoSocioWhatsApp"
          :disabled="generandoImagenEstadoSocio || !comprobanteEstadoSocio?.socio?.telefono"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChatBubbleLeftIcon class="w-5 h-5" />
          Enviar por WhatsApp
        </button>
      </div>
      <button
        @click="modalComprobanteEstadoSocio = false; comprobanteEstadoSocio = null"
        class="btn-secondary w-full mt-2 flex-shrink-0"
      >
        Cerrar
      </button>
    </ModalWrapper>

    <!-- Modal Detalle Socio: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalDetalle"
      :z-index="50"
      overlay-class="fixed inset-0 z-50 flex items-center justify-center p-4"
      card-class="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto"
      @close="modalDetalle = false"
    >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <img 
                  :src="getAvatarUrl(socioSeleccionado?.socio?.nombre || socioSeleccionado?.id, socioSeleccionado?.socio?.avatar_seed, socioSeleccionado?.socio?.avatar_style)" 
                  :alt="socioSeleccionado?.socio?.nombre"
                  class="w-14 h-14 rounded-2xl border-2 border-white/30 shadow-lg object-cover"
                />
                <div>
                  <h3 class="text-xl font-display font-bold">
                    {{ socioSeleccionado?.socio?.nombre }}
                  </h3>
                  <p class="text-sm text-white/80">Información del socio</p>
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
        </div>
        <!-- Contenido -->
        <div class="p-6 space-y-5">
          <!-- Valor de la cuota -->
          <div class="relative bg-gradient-to-br from-natillera-50 to-emerald-50 p-5 rounded-xl border border-natillera-200 shadow-sm">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Valor de la Cuota</p>
                <p class="text-2xl font-bold text-natillera-700">${{ formatMoney(socioSeleccionado?.valor_cuota_individual) }}</p>
              </div>
            </div>
          </div>
          <!-- Periodicidad -->
          <div class="relative p-5 rounded-xl border shadow-sm" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'">
                <span class="text-xl">{{ socioSeleccionado?.periodicidad === 'quincenal' ? '🗓️' : '📅' }}</span>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium">Periodicidad</p>
                <p class="text-xl font-bold" :class="socioSeleccionado?.periodicidad === 'quincenal' ? 'text-purple-700' : 'text-blue-700'">
                  {{ socioSeleccionado?.periodicidad === 'quincenal' ? 'Quincenal' : 'Mensual' }}
                </p>
              </div>
            </div>
          </div>
          <!-- Teléfono -->
          <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <PhoneIcon class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-500 font-medium">Teléfono / WhatsApp</p>
                <p class="text-lg font-bold text-gray-800 truncate">{{ socioSeleccionado?.socio?.telefono || 'No registrado' }}</p>
              </div>
              <a 
                v-if="socioSeleccionado?.socio?.telefono"
                :href="`https://wa.me/57${socioSeleccionado.socio.telefono.replace(/\D/g, '')}`"
                target="_blank"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg flex-shrink-0"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <!-- Mensaje para más información -->
          <div class="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
            <div class="flex items-start gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <UsersIcon class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-800 mb-2">¿Necesitas más información?</p>
                <p class="text-sm text-gray-600 mb-4">
                  Accede a la sección completa de socios para ver el historial de pagos, cuotas pendientes y toda la información detallada.
                </p>
                <router-link 
                  :to="`/natilleras/${id}/socios`"
                  @click="modalDetalle = false"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-natillera-500 to-emerald-600 hover:from-natillera-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-natillera-500/25 hover:shadow-xl"
                >
                  <UsersIcon class="w-5 h-5" />
                  <span>Ir a Socios</span>
                  <ArrowRightIcon class="w-4 h-4" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <button 
            @click="modalDetalle = false"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cerrar
          </button>
        </div>
    </ModalWrapper>
    <!-- Modal Buscar comprobante (patrón natillerapp-modals: velo 70 %, cabecera #1B5E37, cuerpo scroll, acciones al final) -->
    <ModalWrapper
      :show="!!modalBuscarComprobante"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white my-0 sm:my-4"
      card-max-width="28rem"
      @close="cerrarModalBuscarComprobante"
    >
      <!-- Móvil: fila — icono | títulos | X (sin absolute, iOS-safe) -->
      <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
        <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <MagnifyingGlassIcon class="h-5 w-5 text-[#1B5E37]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display text-base font-bold leading-tight text-white">
              Buscar comprobante
            </h3>
            <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">
              Ingresa el código del comprobante
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 active:bg-white/20 touch-manipulation [-webkit-tap-highlight-color:transparent]"
            aria-label="Cerrar"
            @click="cerrarModalBuscarComprobante"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>
      <!-- Desktop: icono arriba, textos centrados; X a la derecha -->
      <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
        <div class="flex items-start px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <div class="w-11 flex-shrink-0" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 flex-col items-center text-center">
            <div class="flex h-[3.2rem] w-[3.2rem] flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <MagnifyingGlassIcon class="h-6 w-6 text-[#1B5E37]" />
            </div>
            <h3 class="mt-2.5 font-display text-lg font-bold leading-tight text-white">
              Buscar comprobante
            </h3>
            <p class="mt-1 px-1 text-xs leading-snug text-white/90">
              Ingresa el código del comprobante
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 active:bg-white/20 touch-manipulation [-webkit-tap-highlight-color:transparent]"
            aria-label="Cerrar"
            @click="cerrarModalBuscarComprobante"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Cuerpo scrolleable: formulario, resultados y CTA al final (skill modales) -->
      <div
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-white px-6 pb-0 pt-5 [-webkit-overflow-scrolling:touch] space-y-5"
      >
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-800">Código del comprobante</label>
          <div
            class="flex items-center gap-0 rounded-xl border-2 border-gray-200 bg-white focus-within:border-[#1B5E37] focus-within:ring-2 focus-within:ring-[#1B5E37]/40"
          >
            <span class="pointer-events-none flex shrink-0 items-center pl-3 text-gray-400">
              <MagnifyingGlassIcon class="h-5 w-5" />
            </span>
            <input
              ref="inputBusquedaRef"
              v-model="codigoBusqueda"
              type="text"
              placeholder="Ej: ABC12345"
              class="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 font-mono text-sm uppercase outline-none focus:ring-0"
              maxlength="20"
              :disabled="buscandoComprobante"
              @keydown.enter.prevent="buscarComprobante"
            />
            <button
              type="button"
              class="m-1.5 shrink-0 rounded-lg bg-[#1B5E37] p-2.5 text-white shadow-sm transition-all hover:bg-[#155a32] disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation [-webkit-tap-highlight-color:transparent]"
              :disabled="!codigoBusqueda.trim() || buscandoComprobante"
              @click="buscarComprobante"
            >
              <MagnifyingGlassIcon v-if="!buscandoComprobante" class="h-5 w-5" />
              <svg
                v-else
                class="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Resultado de la búsqueda -->
        <div v-if="comprobanteEncontrado" class="space-y-4">
            <!-- Alerta si es un comprobante antiguo -->
            <div
              v-if="infoComprobanteAntiguo"
              class="rounded-xl border-2 border-amber-200 bg-amber-50/90 p-4 shadow-sm"
            >
              <div class="mb-4 flex items-start gap-3">
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500">
                  <ExclamationCircleIcon class="h-6 w-6 text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="mb-1 font-display font-bold text-amber-900">Comprobante actualizado</h4>
                  <p class="text-sm text-amber-800/90">
                    Este código corresponde a un comprobante antiguo que fue actualizado.
                  </p>
                </div>
              </div>

              <div class="mb-4 space-y-3 rounded-lg border border-amber-200 bg-white p-4">
                <div class="flex items-center justify-between py-2 border-b border-amber-100">
                  <span class="text-sm text-amber-700 font-medium">Código Anterior:</span>
                  <span class="font-mono font-bold text-amber-900 text-lg">{{ infoComprobanteAntiguo.codigoAnterior }}</span>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm text-green-700 font-medium">Código Actual:</span>
                  <span class="font-mono font-bold text-green-800 text-lg">{{ infoComprobanteAntiguo.codigoNuevo }}</span>
                </div>
                <div v-if="infoComprobanteAntiguo.fechaActualizacion" class="pt-3 border-t border-amber-100">
                  <span class="text-xs text-amber-600">Actualizado el: {{ formatDate(infoComprobanteAntiguo.fechaActualizacion) }}</span>
                </div>
              </div>
              
              <button
                type="button"
                class="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#1B5E37] px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#155a32] active:bg-[#134d2b] touch-manipulation [-webkit-tap-highlight-color:transparent]"
                @click="buscarPorCodigoNuevo"
              >
                <MagnifyingGlassIcon class="h-5 w-5 shrink-0" />
                Consultar comprobante actual
              </button>
            </div>
            
            <!-- Card de información del comprobante -->
            <div
              :class="[
                'rounded-xl border-2 p-4 shadow-sm sm:p-5',
                comprobanteEncontrado.tipo === 'abono_prestamo'
                  ? 'border-amber-200 bg-amber-50/80'
                  : 'border-emerald-200 bg-[#E8F5E9]/80',
              ]"
            >
              <div class="mb-4 flex items-center gap-2">
                <div
                  :class="[
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    comprobanteEncontrado.tipo === 'abono_prestamo' ? 'bg-amber-500' : 'bg-[#1B5E37]',
                  ]"
                >
                  <CheckCircleIcon class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4
                    :class="[
                      'font-display text-lg font-bold',
                      comprobanteEncontrado.tipo === 'abono_prestamo' ? 'text-amber-900' : 'text-[#14532d]',
                    ]"
                  >
                    Comprobante encontrado
                  </h4>
                  <p
                    v-if="comprobanteEncontrado.tipo === 'abono_prestamo'"
                    class="mt-0.5 text-xs font-semibold text-amber-800"
                  >
                    Abono a préstamo
                  </p>
                </div>
              </div>

              <div
                class="space-y-4 rounded-lg border bg-white p-4 sm:p-5"
                :class="comprobanteEncontrado.tipo === 'abono_prestamo' ? 'border-amber-200' : 'border-emerald-200'"
              >
                <div class="pb-3 border-b border-gray-100">
                  <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Código {{ infoComprobanteAntiguo ? 'Actual' : 'del Comprobante' }}</p>
                  <p class="font-mono font-bold text-xl text-gray-800">{{ comprobanteEncontrado.codigo_comprobante }}</p>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Socio</p>
                    <p class="font-semibold text-gray-800">{{ comprobanteEncontrado.socio_natillera?.socio?.nombre || 'N/A' }}</p>
                  </div>
                  
                  <div>
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Descripción</p>
                    <p class="text-gray-800">{{ comprobanteEncontrado.descripcion || 'N/A' }}</p>
                  </div>
                </div>
                
                <!-- Alerta de comprobante eliminado -->
                <div v-if="comprobanteEncontrado.eliminado" class="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ExclamationCircleIcon class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="mb-2 font-display font-bold text-red-800">Comprobante eliminado</p>
                      <div class="space-y-1 text-sm">
                        <p class="text-red-700">
                          <span class="font-semibold">Eliminado por:</span> {{ comprobanteEncontrado.eliminado_por }}
                        </p>
                        <p class="text-red-700">
                          <span class="font-semibold">Fecha de eliminación:</span> {{ formatDateWithTime(comprobanteEncontrado.eliminado_el) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Alerta de código actualizado -->
                <div v-else-if="comprobanteEncontrado.codigo_nuevo" class="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-4">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ExclamationTriangleIcon class="w-6 h-6 text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="mb-2 font-display text-lg font-bold text-red-800">Comprobante no válido</p>
                      <p class="text-sm text-red-700 mb-2 font-semibold">
                        Este comprobante fue actualizado y <span class="text-red-900 font-bold">ya no es válido</span>.
                      </p>
                      <p class="text-sm text-red-600 mb-3">
                        El comprobante válido tiene el siguiente código:
                      </p>
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class="font-mono font-bold text-red-900 bg-red-100 border-2 border-red-300 px-3 py-1.5 rounded-lg">
                          {{ comprobanteEncontrado.codigo_nuevo }}
                        </span>
                        <button
                          type="button"
                          class="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1B5E37] px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#155a32] active:bg-[#134d2b] touch-manipulation [-webkit-tap-highlight-color:transparent]"
                          @click="codigoBusqueda = comprobanteEncontrado.codigo_nuevo; buscarComprobante()"
                        >
                          <ArrowRightIcon class="h-4 w-4 shrink-0" />
                          Ver comprobante válido
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Información específica según el tipo -->
                <template v-if="comprobanteEncontrado.tipo === 'abono_prestamo' || comprobanteEncontrado.tipo === 'abono_prestamo_eliminado' || comprobanteEncontrado.tipo === 'abono_prestamo_antiguo'">
                  <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p class="text-xs text-amber-700 mb-2 uppercase tracking-wide font-semibold">Información del Préstamo</p>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Monto del Préstamo</p>
                        <p class="font-bold text-gray-800">${{ formatMoney(comprobanteEncontrado.prestamo?.monto || 0) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Saldo Actual</p>
                        <p class="font-bold text-gray-800">${{ formatMoney(comprobanteEncontrado.prestamo?.saldo_actual || 0) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Interés</p>
                        <p class="font-bold text-gray-800">{{ comprobanteEncontrado.prestamo?.interes || 0 }}%</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Cuotas</p>
                        <p class="font-bold text-gray-800">{{ comprobanteEncontrado.prestamo?.numero_cuotas || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Valor del Abono</p>
                      <p class="font-bold text-amber-700 text-lg">${{ formatMoney(comprobanteEncontrado.valor_pagado || 0) }}</p>
                    </div>
                    <div v-if="!comprobanteEncontrado.eliminado" class="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Saldo Después del Abono</p>
                      <p class="font-bold text-green-600 text-lg">${{ formatMoney(Math.max(0, (comprobanteEncontrado.prestamo?.saldo_actual || 0) - (comprobanteEncontrado.valor_pagado || 0))) }}</p>
                    </div>
                  </div>
                </template>
                
                <template v-else>
                  <!-- Badge de estado de pago destacado -->
                  <div v-if="comprobanteEncontrado.total_a_pagar_completo && comprobanteEncontrado.valor_pagado_completo" class="pt-3 border-t border-gray-200 mb-3">
                    <div 
                      :class="[
                        'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg',
                        (comprobanteEncontrado.valor_pagado_completo || 0) < (comprobanteEncontrado.total_a_pagar_completo || 0)
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      ]"
                    >
                      <CheckCircleIcon class="w-4 h-4" />
                      <span>{{ (comprobanteEncontrado.valor_pagado_completo || 0) < (comprobanteEncontrado.total_a_pagar_completo || 0) ? 'Pago Parcial' : 'Pago Completo' }}</span>
                    </div>
                  </div>
                  
                  <!-- Formato tipo resta matemática - Diseño moderno y compacto -->
                  <div v-if="comprobanteEncontrado.total_a_pagar_completo && comprobanteEncontrado.valor_pagado_completo" class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 shadow-lg">
                    <!-- Línea decorativa superior -->
                    <div 
                      :class="[
                        'absolute top-0 left-0 right-0 h-1',
                        (comprobanteEncontrado.valor_pagado_completo || 0) < (comprobanteEncontrado.total_a_pagar_completo || 0)
                          ? 'bg-gradient-to-r from-orange-400 to-amber-400'
                          : 'bg-gradient-to-r from-green-400 to-emerald-400'
                      ]"
                    ></div>
                    
                    <div class="p-4 space-y-3">
                      <!-- Total a Pagar -->
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total a Pagar</span>
                        <span class="text-2xl font-bold text-slate-900">${{ formatMoney(comprobanteEncontrado.total_a_pagar_completo || comprobanteEncontrado.valor_cuota || 0) }}</span>
                      </div>
                      
                      <!-- Línea divisoria con signo menos -->
                      <div class="relative flex items-center py-1">
                        <div class="flex-1 border-t-2 border-dashed border-slate-300"></div>
                        <span class="px-3 text-xl font-light text-slate-400">−</span>
                        <div class="flex-1 border-t-2 border-dashed border-slate-300"></div>
                      </div>
                      
                      <!-- Valor Pagado -->
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Valor Pagado</span>
                        <span class="text-2xl font-bold text-green-600">${{ formatMoney(comprobanteEncontrado.valor_pagado_completo || comprobanteEncontrado.valor_pagado || 0) }}</span>
                      </div>
                      
                      <!-- Línea divisoria final -->
                      <div class="border-t-2 border-slate-300"></div>
                      
                      <!-- Valor Restante -->
                      <div class="flex items-center justify-between pt-1">
                        <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Valor Restante</span>
                        <span 
                          :class="[
                            'text-2xl font-extrabold',
                            (comprobanteEncontrado.valor_pagado_completo || 0) < (comprobanteEncontrado.total_a_pagar_completo || 0)
                              ? 'text-orange-600'
                              : 'text-green-600'
                          ]"
                        >
                          ${{ formatMoney(Math.max(0, (comprobanteEncontrado.total_a_pagar_completo || 0) - (comprobanteEncontrado.valor_pagado_completo || 0))) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Fallback si no hay total_a_pagar_completo calculado -->
                  <div v-else class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm">
                      <p class="text-xs text-slate-600 mb-1.5 uppercase tracking-wide font-semibold">Total a Pagar</p>
                      <p class="font-bold text-slate-900 text-lg">${{ formatMoney(comprobanteEncontrado.valor_cuota || 0) }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                      <p class="text-xs text-green-700 mb-1.5 uppercase tracking-wide font-semibold">Total Pagado</p>
                      <p class="font-bold text-green-700 text-lg">${{ formatMoney(comprobanteEncontrado.valor_pagado || 0) }}</p>
                    </div>
                  </div>
                  
                  <!-- Desglose del total a pagar (desplegable): Cuota + Sanciones + Actividades + Préstamos -->
                  <div v-if="comprobanteEncontrado.desglose_a_pagar" class="pt-3 border-t border-gray-200">
                    <button
                      @click="desgloseAPagarAbierto = !desgloseAPagarAbierto"
                      class="w-full flex items-center justify-between text-left focus:outline-none rounded-xl p-3 hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                    >
                      <span class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Desglose del Total a Pagar</span>
                      <ChevronDownIcon 
                        :class="[
                          'w-4 h-4 text-slate-400 transition-transform duration-200',
                          desgloseAPagarAbierto ? 'transform rotate-180' : ''
                        ]"
                      />
                    </button>
                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 transform -translate-y-2"
                      enter-to-class="opacity-100 transform translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 transform translate-y-0"
                      leave-to-class="opacity-0 transform -translate-y-2"
                    >
                      <div v-if="desgloseAPagarAbierto" class="mt-2 ml-2 space-y-2 pl-4 border-l-2 border-slate-200">
                        <div v-if="comprobanteEncontrado.desglose_a_pagar.cuota > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Cuota</span>
                          <span class="font-bold text-slate-800">${{ formatMoney(comprobanteEncontrado.desglose_a_pagar.cuota) }}</span>
                        </div>
                        <div v-if="comprobanteEncontrado.desglose_a_pagar.sancion > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Sanciones</span>
                          <span class="font-bold text-red-600">${{ formatMoney(comprobanteEncontrado.desglose_a_pagar.sancion) }}</span>
                        </div>
                        <div v-if="comprobanteEncontrado.desglose_a_pagar.actividades > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Actividades</span>
                          <span class="font-bold text-blue-600">${{ formatMoney(comprobanteEncontrado.desglose_a_pagar.actividades) }}</span>
                        </div>
                        <div v-if="comprobanteEncontrado.desglose_a_pagar.prestamos > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Préstamos</span>
                          <span class="font-bold text-amber-600">${{ formatMoney(comprobanteEncontrado.desglose_a_pagar.prestamos) }}</span>
                        </div>
                      </div>
                    </Transition>
                  </div>
                  
                  <!-- Desglose del total pagado (desplegable) -->
                  <div v-if="comprobanteEncontrado.desglose_pagado && (comprobanteEncontrado.desglose_pagado.actividades > 0 || comprobanteEncontrado.desglose_pagado.sancion > 0 || comprobanteEncontrado.desglose_pagado.prestamos > 0)" class="pt-3 border-t border-gray-200">
                    <button
                      @click="desglosePagadoAbierto = !desglosePagadoAbierto"
                      class="w-full flex items-center justify-between text-left focus:outline-none rounded-xl p-3 hover:bg-green-50 transition-all duration-200 border border-transparent hover:border-green-200"
                    >
                      <span class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Desglose del Pago</span>
                      <ChevronDownIcon 
                        :class="[
                          'w-4 h-4 text-slate-400 transition-transform duration-200',
                          desglosePagadoAbierto ? 'transform rotate-180' : ''
                        ]"
                      />
                    </button>
                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 transform -translate-y-2"
                      enter-to-class="opacity-100 transform translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 transform translate-y-0"
                      leave-to-class="opacity-0 transform -translate-y-2"
                    >
                      <div v-if="desglosePagadoAbierto" class="mt-2 ml-2 space-y-2 pl-4 border-l-2 border-green-200">
                        <div v-if="comprobanteEncontrado.desglose_pagado.cuota > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Cuota</span>
                          <span class="font-bold text-slate-800">${{ formatMoney(comprobanteEncontrado.desglose_pagado.cuota) }}</span>
                        </div>
                        <div v-if="comprobanteEncontrado.desglose_pagado.sancion > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Sanciones</span>
                          <span class="font-bold text-red-600">${{ formatMoney(comprobanteEncontrado.desglose_pagado.sancion) }}</span>
                        </div>
                        <div v-if="comprobanteEncontrado.desglose_pagado.actividades > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Actividades</span>
                          <span class="font-bold text-blue-600">${{ formatMoney(comprobanteEncontrado.desglose_pagado.actividades) }}</span>
                        </div>
                        <div v-if="comprobanteEncontrado.desglose_pagado.prestamos > 0" class="flex items-center justify-between text-sm py-1">
                          <span class="text-slate-600 font-medium">Préstamos</span>
                          <span class="font-bold text-amber-600">${{ formatMoney(comprobanteEncontrado.desglose_pagado.prestamos) }}</span>
                        </div>
                      </div>
                    </Transition>
                  </div>
                  
                  <div class="pt-3 border-t border-gray-200">
                    <p class="text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold">Estado</p>
                    <span 
                      :class="[
                        'inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm',
                        comprobanteEncontrado.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        comprobanteEncontrado.estado === 'parcial' ? 'bg-blue-100 text-blue-800' :
                        comprobanteEncontrado.estado === 'mora' ? 'bg-red-100 text-red-800' :
                        comprobanteEncontrado.estado === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-700'
                      ]"
                    >
                      {{ comprobanteEncontrado.estado?.toUpperCase() || 'N/A' }}
                    </span>
                  </div>
                </template>
                
                <div class="pt-3 border-t border-gray-200">
                  <div :class="[
                    'rounded-lg p-3 border',
                    comprobanteEncontrado.tipo === 'abono_prestamo' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                  ]">
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-semibold">Fecha de Pago</p>
                    <p v-if="comprobanteEncontrado.fecha_pago" :class="[
                      'font-bold text-lg',
                      comprobanteEncontrado.tipo === 'abono_prestamo' ? 'text-amber-800' : 'text-green-800'
                    ]">
                      {{ formatDateWithTime(comprobanteEncontrado.fecha_pago) }}
                    </p>
                    <p v-else class="text-gray-500 font-medium">No registrada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Error -->
          <div v-if="errorBusqueda" class="rounded-xl border-2 border-red-200 bg-red-50/90 p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-500">
                <ExclamationCircleIcon class="h-6 w-6 text-white" />
              </div>
              <p class="font-semibold text-red-800">{{ errorBusqueda }}</p>
            </div>
          </div>

        <div class="border-t border-gray-200 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            class="min-h-[48px] w-full rounded-full border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50 touch-manipulation [-webkit-tap-highlight-color:transparent]"
            @click="cerrarModalBuscarComprobante"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalWrapper>
    <!-- Modal Cuotas del Socio por Mes: en iOS ModalWrapper; en Android estructura actual -->
    <ModalWrapper
      :show="!!modalCuotasSocio"
      :z-index="60"
      align="bottom"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
      card-max-width="42rem"
      @close="cerrarModalCuotasSocio"
    >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br from-natillera-500 via-emerald-500 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0 z-10">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <img 
                v-if="socioParaCuotas"
                :src="getAvatarUrl(socioParaCuotas.nombre || socioParaCuotas.id, socioParaCuotas.avatar_seed, socioParaCuotas.avatar_style)" 
                :alt="socioParaCuotas.nombre"
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-white/30 shadow-md object-cover flex-shrink-0"
              />
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0" v-else>
                <CalendarDaysIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg sm:text-2xl font-display font-bold truncate">
                  Cuotas de {{ socioParaCuotas?.nombre }}
                </h3>
                <p class="text-white/90 text-xs sm:text-sm">
                  Historial de cuotas por mes
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <!-- Toggle Vista Simplificada -->
              <button 
                @click="vistaSimplificadaCuotas = !vistaSimplificadaCuotas"
                class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                :title="vistaSimplificadaCuotas ? 'Vista completa' : 'Vista simplificada'"
              >
                <Squares2X2Icon v-if="!vistaSimplificadaCuotas" class="w-5 h-5" />
                <Bars3Icon v-else class="w-5 h-5" />
              </button>
              <button 
                @click="cerrarModalCuotasSocio"
                class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <!-- Contenido -->
        <div class="overflow-y-auto flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4">
          <!-- Estado de carga -->
          <div v-if="loadingCuotasSocio" class="text-center py-12">
            <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-500 text-sm">Cargando cuotas...</p>
          </div>
          
          <!-- Sin cuotas -->
          <div v-else-if="cuotasSocioPorMes.length === 0" class="text-center py-12">
            <p class="text-gray-400 text-base sm:text-lg">No hay cuotas registradas</p>
          </div>
          
          <!-- Lista de cuotas agrupadas por mes -->
          <div v-else-if="!loadingCuotasSocio" class="space-y-4">
            <!-- Vista Completa -->
            <template v-if="!vistaSimplificadaCuotas">
              <!-- Iterar sobre grupos de meses -->
              <div
                v-for="(grupoMes, grupoIndex) in cuotasAgrupadasPorMes"
                :key="`${grupoMes.anio}-${grupoMes.mes}`"
                class="bg-gradient-to-br from-natillera-50 via-white to-emerald-50 rounded-3xl border-4 border-natillera-300 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden mb-6"
              >
                <!-- Encabezado del mes -->
                <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-natillera-200 via-natillera-100 to-emerald-200 border-b-4 border-natillera-400 backdrop-blur-sm">
                  <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200 flex items-center justify-center text-xl sm:text-4xl shadow-md sm:shadow-xl flex-shrink-0">
                    {{ getMesEmoji(grupoMes.mes) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-900 text-base sm:text-xl">
                      {{ getMesLabel(grupoMes.mes) }} {{ grupoMes.anio }}
                    </h4>
                    <p class="text-xs sm:text-sm text-emerald-600 font-semibold">
                      {{ grupoMes.cuotas.length }} {{ grupoMes.cuotas.length === 1 ? 'cuota' : 'cuotas' }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="irACuotasDelMes(grupoMes)"
                    class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-natillera-300/80 text-natillera-700 font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
                    title="Ir a cuotas de este mes"
                  >
                    <span class="hidden sm:inline">Ir a cuotas</span>
                    <ArrowRightIcon class="w-4 h-4" />
                  </button>
                </div>
                
                <!-- Contenedor de cuotas del mes -->
                <div class="p-3 sm:p-4 space-y-3">
                <!-- Cuotas del mes -->
              <div
                v-for="(cuotaData, index) in grupoMes.cuotas"
                :key="cuotaData.id"
                class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                :style="{ animationDelay: `${index * 0.05}s` }"
                :class="[
                  cuotaData.estado === 'pagada' 
                    ? 'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40' :
                  cuotaData.estado === 'mora' 
                    ? `bg-red-50/90 border-[2.5px] border-red-300/80 shadow-md shadow-red-100/50 ring-1 ring-red-200/40 ${animacionesCuotasMora ? 'animate-mora-highlight' : ''}` :
                  cuotaData.estado === 'programada'
                    ? 'bg-gray-50/90 border-[2.5px] border-gray-300/80 shadow-md shadow-gray-100/50 ring-1 ring-gray-200/40' :
                  cuotaData.estado === 'pendiente'
                    ? 'bg-amber-50/90 border-[2.5px] border-amber-300/80 shadow-md shadow-amber-100/50 ring-1 ring-amber-200/40' :
                  'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40'
                ]"
              >
              <!-- Efecto de resaltado para cuotas en mora -->
              <div 
                v-if="cuotaData.estado === 'mora' && animacionesCuotasMora"
                class="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/50 to-transparent animate-shimmer-mora pointer-events-none z-0"
              ></div>
              <!-- Borde pulsante para cuotas en mora -->
              <div 
                v-if="cuotaData.estado === 'mora' && animacionesCuotasMora"
                class="absolute inset-0 border-2 border-red-500 rounded-xl animate-pulse pointer-events-none z-0"
                style="animation-duration: 1.5s;"
              ></div>
              <div class="p-4 sm:p-4 relative">
                <!-- Móvil: Layout estilo imagen -->
                <div class="sm:hidden flex flex-col gap-3">
                  <!-- Layout principal: izquierda (botones y fechas) y derecha (montos) -->
                  <div class="flex items-start justify-between gap-4">
                    <!-- Lado izquierdo: Botones y fechas -->
                    <div class="flex flex-col gap-2 flex-1 min-w-0">
                      <!-- Botón de quincena -->
                      <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-sm">
                        {{ cuotaData.quincena === 1 ? '1ER' : '2DO' }} QUINCENA
                      </div>
                      
                      <!-- Badge de ajuste -->
                      <div 
                        v-if="cuotaData.descripcion && (cuotaData.descripcion.includes('Ajuste de valor') || cuotaData.descripcion.includes('Cuota ajustada'))"
                        class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"
                        :title="cuotaData.descripcion"
                      >
                        <InformationCircleIcon class="w-3.5 h-3.5" />
                      </div>
                      
                      <!-- Badge de estado -->
                      <div class="self-start">
                        <!-- Pago parcial tiene prioridad sobre estado pagada -->
                        <span 
                          v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-200/90 text-orange-800 border border-orange-300/60 shadow-sm"
                        >
                          PAGO PARCIAL
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pagada' || (cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)))"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-200/90 text-green-800 border border-green-300/60 shadow-sm"
                        >
                          PAGADA
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'mora'"
                          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-200/90 text-red-800 border border-red-300/60 shadow-sm"
                        >
                          EN MORA
                          <span v-if="cuotaData.diasMora > 0" class="text-red-900 font-extrabold">
                            ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                          </span>
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pendiente' && !(cuotaData.valorPagado > 0)"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-200/90 text-amber-800 border border-amber-300/60 shadow-sm"
                        >
                          PENDIENTE
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'programada' || (!cuotaData.estado && cuotaData.valorPagado === 0)"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-200/90 text-gray-800 border border-gray-300/60 shadow-sm"
                        >
                          PROGRAMADA
                        </span>
                      </div>
                      <!-- Fecha de vencimiento -->
                      <div class="flex items-center gap-2 mt-1">
                        <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span class="text-xs text-gray-600">
                          Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                        </span>
                      </div>
                    </div>
                    <!-- Lado derecho: Montos -->
                    <div class="flex flex-col items-end text-right flex-shrink-0">
                      <!-- Etiqueta según estado -->
                      <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-green-600 mb-1">
                        TOTAL PAGADO
                      </p>
                      <p v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-amber-600 mb-1">
                        PENDIENTE
                      </p>
                      <p v-else class="text-xs font-medium text-gray-500 mb-1">
                        MONTO CUOTA
                      </p>
                      
                      <!-- Monto principal -->
                      <p class="text-2xl font-bold mb-1" :class="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-green-600' : (cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-orange-600' : (cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'))">
                        <template v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                          <!-- Pago parcial: mostrar restante -->
                          ${{ formatMoney((cuotaData.valorCuota + (cuotaData.sancion || 0)) - cuotaData.valorPagado) }}
                        </template>
                        <template v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                          <!-- Total pagado -->
                          ${{ formatMoney(cuotaData.valorPagado) }}
                        </template>
                        <template v-else>
                          <!-- Monto a pagar -->
                          ${{ formatMoney(cuotaData.valorCuota + (cuotaData.sancion || 0)) }}
                        </template>
                      </p>
                      
                      <!-- Detalles de la cuota -->
                      <div class="flex flex-col items-end gap-0.5">
                        <p class="text-xs text-gray-500">
                          Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                        </p>
                        <p v-if="cuotaData.sancion > 0" class="text-xs text-red-600 font-medium">
                          Sanción: ${{ formatMoney(cuotaData.sancion) }}
                        </p>
                        <!-- En pago parcial: mostrar lo pagado -->
                        <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs text-green-600 font-medium mt-1">
                          Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- Fecha de pago (si está pagada o parcialmente pagada) -->
                  <div v-if="cuotaData.valorPagado > 0 && cuotaData.fechaPago" class="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <CheckCircleIcon class="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span class="text-xs text-green-600 font-medium">
                      Pagado el: {{ formatDate(cuotaData.fechaPago) }}
                    </span>
                  </div>
                  <!-- Botón WhatsApp (si aplica) -->
                  <button
                    v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.telefono"
                    @click="enviarWhatsAppCuota(cuotaData)"
                    class="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                    title="Enviar recordatorio por WhatsApp"
                  >
                    <ChatBubbleLeftIcon class="w-4 h-4 flex-shrink-0" />
                    <span class="text-sm font-semibold">Recordar cuota</span>
                  </button>
                </div>
                <!-- Desktop: Layout horizontal original -->
                <div class="hidden sm:flex sm:flex-col sm:gap-3">
                  <!-- Fila superior: Badges y botones -->
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                      <!-- Badge de quincena -->
                      <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center border-2 border-purple-700 shadow-md">
                        {{ cuotaData.quincena === 1 ? '1er' : '2da' }} Quincena
                      </div>
                      <!-- Badge de estado -->
                      <span 
                        v-if="cuotaData.estado === 'pagada'"
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-200/90 text-green-800 border border-green-300/70 shadow-sm"
                      >
                        pagada
                      </span>
                      <span 
                        v-else-if="cuotaData.estado === 'mora'"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-200/90 text-red-800 border border-red-300/70 shadow-sm"
                      >
                        en mora
                        <span v-if="cuotaData.diasMora > 0" class="text-red-900 font-extrabold">
                          ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                        </span>
                      </span>
                      <span 
                        v-else-if="cuotaData.estado === 'pendiente'"
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-200/90 text-amber-800 border border-amber-300/70 shadow-sm"
                      >
                        pendiente
                      </span>
                      <span 
                        v-else
                        class="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-200/90 text-gray-800 border border-gray-300/70 shadow-sm"
                      >
                        programada
                      </span>
                    </div>
                    <!-- Botón WhatsApp -->
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                      @click="enviarWhatsAppCuota(cuotaData)"
                      class="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <ChatBubbleLeftIcon class="w-5 h-5 flex-shrink-0" />
                    </button>
                  </div>
                  <!-- Fila media: Monto principal -->
                  <div class="flex items-baseline justify-between gap-3">
                    <div class="flex-1">
                      <p class="text-xl font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                        ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                      </p>
                      <div class="flex items-center gap-2 mt-1 flex-wrap">
                        <p class="text-sm text-gray-600 font-medium">
                          Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                        </p>
                        <p v-if="cuotaData.sancion > 0" class="text-sm text-red-600 font-semibold">
                          + Sanción: ${{ formatMoney(cuotaData.sancion) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- Fila inferior: Detalles adicionales -->
                  <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
                    <div class="flex items-center gap-1.5">
                      <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span class="text-sm text-gray-600">
                        Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                      </span>
                    </div>
                    <p v-if="cuotaData.valorPagado > 0" class="text-sm font-semibold text-green-600 whitespace-nowrap">
                      Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                    </p>
                  </div>
                </div>
              </div>
              </div>
              <!-- Fin del contenedor de cuotas del mes -->
                </div>
              <!-- Fin del grupo de mes -->
            </div>
            </template>
            
            <!-- Vista Simplificada -->
            <template v-else>
              <!-- Iterar sobre grupos de meses -->
              <div
                v-for="(grupoMes, grupoIndex) in cuotasAgrupadasPorMes"
                :key="`${grupoMes.anio}-${grupoMes.mes}-simplificado`"
                class="bg-gradient-to-br from-natillera-50 via-white to-emerald-50 rounded-3xl border-4 border-natillera-300 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden mb-6"
              >
                <!-- Encabezado del mes -->
                <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-natillera-200 via-natillera-100 to-emerald-200 border-b-4 border-natillera-400 backdrop-blur-sm">
                  <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200 flex items-center justify-center text-xl sm:text-4xl shadow-md sm:shadow-xl flex-shrink-0">
                    {{ getMesEmoji(grupoMes.mes) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-900 text-base sm:text-xl">
                      {{ getMesLabel(grupoMes.mes) }} {{ grupoMes.anio }}
                    </h4>
                    <p class="text-xs sm:text-sm text-emerald-600 font-semibold">
                      {{ grupoMes.cuotas.length }} {{ grupoMes.cuotas.length === 1 ? 'cuota' : 'cuotas' }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="irACuotasDelMes(grupoMes)"
                    class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-natillera-300/80 text-natillera-700 font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all"
                    title="Ir a cuotas de este mes"
                  >
                    <span class="hidden sm:inline">Ir a cuotas</span>
                    <ArrowRightIcon class="w-4 h-4" />
                  </button>
                </div>
                
                <!-- Contenedor de cuotas del mes -->
                <div class="p-3 sm:p-4 space-y-3">
                <!-- Cuotas del mes -->
              <div
                v-for="(cuotaData, index) in grupoMes.cuotas"
                :key="cuotaData.id"
                class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                :style="{ animationDelay: `${index * 0.03}s` }"
                :class="[
                  cuotaData.estado === 'pagada' 
                    ? 'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40' :
                  cuotaData.estado === 'mora' 
                    ? `bg-red-50/90 border-[2.5px] border-red-300/80 shadow-md shadow-red-100/50 ring-1 ring-red-200/40 ${animacionesCuotasMora ? 'animate-mora-highlight' : ''}` :
                  cuotaData.estado === 'programada'
                    ? 'bg-gray-50/90 border-[2.5px] border-gray-300/80 shadow-md shadow-gray-100/50 ring-1 ring-gray-200/40' :
                  cuotaData.estado === 'pendiente'
                    ? 'bg-amber-50/90 border-[2.5px] border-amber-300/80 shadow-md shadow-amber-100/50 ring-1 ring-amber-200/40' :
                  'bg-green-50/90 border-[2.5px] border-green-300/80 shadow-md shadow-green-100/50 ring-1 ring-green-200/40'
                ]"
              >
                <!-- Efecto de resaltado para cuotas en mora -->
                <div 
                  v-if="cuotaData.estado === 'mora' && animacionesCuotasMora"
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/30 to-transparent animate-shimmer-mora pointer-events-none z-0"
                ></div>
                
                <div class="p-4 sm:p-4 relative z-10">
                  <!-- Móvil: Layout estilo imagen -->
                  <div class="sm:hidden flex flex-col gap-3">
                    <!-- Layout principal: izquierda (botones y fechas) y derecha (montos) -->
                    <div class="flex items-start justify-between gap-4">
                      <!-- Lado izquierdo: Botones y fechas -->
                      <div class="flex flex-col gap-2 flex-1 min-w-0">
                        <!-- Botón de quincena -->
                        <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-sm">
                          {{ cuotaData.quincena === 1 ? '1ER' : '2DO' }} QUINCENA
                        </div>
                        
                        <!-- Badge de ajuste -->
                        <div 
                          v-if="cuotaData.descripcion && (cuotaData.descripcion.includes('Ajuste de valor') || cuotaData.descripcion.includes('Cuota ajustada'))"
                          class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"
                          :title="cuotaData.descripcion"
                        >
                          <InformationCircleIcon class="w-3.5 h-3.5" />
                        </div>
                        
                        <!-- Badge de estado -->
                        <div class="self-start">
                          <!-- Pago parcial tiene prioridad sobre estado pagada -->
                          <span 
                            v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700"
                          >
                            PAGO PARCIAL
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'pagada' || (cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)))"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700"
                          >
                            PAGADA
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'mora'"
                            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700"
                          >
                            EN MORA
                            <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                              ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                            </span>
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'pendiente' && !(cuotaData.valorPagado > 0)"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700"
                          >
                            PENDIENTE
                          </span>
                          <span 
                            v-else-if="cuotaData.estado === 'programada' || (!cuotaData.estado && cuotaData.valorPagado === 0)"
                            class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700"
                          >
                            PROGRAMADA
                          </span>
                        </div>
                        <!-- Fecha de vencimiento -->
                        <div class="flex items-center gap-2 mt-1">
                          <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span class="text-xs text-gray-600">
                            Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                          </span>
                        </div>
                      </div>
                      <!-- Lado derecho: Montos -->
                      <div class="flex flex-col items-end text-right flex-shrink-0">
                        <!-- Etiqueta según estado -->
                        <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-green-600 mb-1">
                          TOTAL PAGADO
                        </p>
                        <p v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs font-medium text-orange-600 mb-1">
                          PAGO PARCIAL
                        </p>
                        <p v-else class="text-xs font-medium text-gray-500 mb-1">
                          MONTO CUOTA
                        </p>
                        
                        <!-- Monto principal -->
                        <p class="text-2xl font-bold mb-1" :class="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-green-600' : (cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0)) ? 'text-orange-600' : (cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'))">
                          <template v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                            <!-- Pago parcial: mostrar restante -->
                            ${{ formatMoney((cuotaData.valorCuota + (cuotaData.sancion || 0)) - cuotaData.valorPagado) }}
                          </template>
                          <template v-else-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado >= (cuotaData.valorCuota + (cuotaData.sancion || 0))">
                            <!-- Total pagado -->
                            ${{ formatMoney(cuotaData.valorPagado) }}
                          </template>
                          <template v-else>
                            <!-- Monto a pagar -->
                            ${{ formatMoney(cuotaData.valorCuota + (cuotaData.sancion || 0)) }}
                          </template>
                        </p>
                        
                        <!-- Detalles de la cuota -->
                        <div class="flex flex-col items-end gap-0.5">
                          <p class="text-xs text-gray-500">
                            Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                          </p>
                          <p v-if="cuotaData.sancion > 0" class="text-xs text-red-600 font-medium">
                            Sanción: ${{ formatMoney(cuotaData.sancion) }}
                          </p>
                          <!-- En pago parcial: mostrar lo pagado -->
                          <p v-if="cuotaData.valorPagado > 0 && cuotaData.valorPagado < (cuotaData.valorCuota + (cuotaData.sancion || 0))" class="text-xs text-green-600 font-medium mt-1">
                            Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <!-- Fecha de pago (si está pagada o parcialmente pagada) -->
                    <div v-if="cuotaData.valorPagado > 0 && cuotaData.fechaPago" class="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <CheckCircleIcon class="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span class="text-xs text-green-600 font-medium">
                        Pagado el: {{ formatDate(cuotaData.fechaPago) }}
                      </span>
                    </div>
                    <!-- Botón WhatsApp (si aplica) -->
                    <button
                      v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.telefono"
                      @click="enviarWhatsAppCuota(cuotaData)"
                      class="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <ChatBubbleLeftIcon class="w-4 h-4 flex-shrink-0" />
                      <span class="text-sm font-semibold">Recordar cuota</span>
                    </button>
                  </div>
                  <!-- Desktop: Layout horizontal original -->
                  <div class="hidden sm:flex sm:flex-col sm:gap-3">
                    <!-- Fila superior: Badges y botones -->
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <!-- Badge de quincena -->
                        <div v-if="cuotaData.quincena" class="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-lg flex items-center justify-center border-2 border-purple-700 shadow-md">
                          {{ cuotaData.quincena === 1 ? '1er' : '2da' }} Quincena
                        </div>
                        <!-- Badge de estado -->
                        <span 
                          v-if="cuotaData.estado === 'pagada'"
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm"
                        >
                          pagada
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'mora'"
                          class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm"
                        >
                          en mora
                          <span v-if="cuotaData.diasMora > 0" class="text-red-800 font-bold">
                            ({{ cuotaData.diasMora }} {{ cuotaData.diasMora === 1 ? 'día' : 'días' }})
                          </span>
                        </span>
                        <span 
                          v-else-if="cuotaData.estado === 'pendiente'"
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm"
                        >
                          pendiente
                        </span>
                        <span 
                          v-else
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                        >
                          programada
                        </span>
                      </div>
                      <!-- Botón WhatsApp -->
                      <button
                        v-if="(cuotaData.estado === 'pendiente' || cuotaData.estado === 'mora') && socioParaCuotas?.socio?.telefono"
                        @click="enviarWhatsAppCuota(cuotaData)"
                        class="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center flex-shrink-0"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <ChatBubbleLeftIcon class="w-5 h-5 flex-shrink-0" />
                      </button>
                    </div>
                    <!-- Fila media: Monto principal -->
                    <div class="flex items-baseline justify-between gap-3">
                      <div class="flex-1">
                        <p class="text-xl font-bold" :class="cuotaData.sancion > 0 ? 'text-red-600' : 'text-gray-800'">
                          ${{ formatMoney(cuotaData.totalConSanciones > 0 ? cuotaData.totalConSanciones : cuotaData.valorCuota) }}
                        </p>
                        <div class="flex items-center gap-2 mt-1 flex-wrap">
                          <p class="text-sm text-gray-600 font-medium">
                            Cuota: ${{ formatMoney(cuotaData.valorCuota) }}
                          </p>
                          <p v-if="cuotaData.sancion > 0" class="text-sm text-red-600 font-semibold">
                            + Sanción: ${{ formatMoney(cuotaData.sancion) }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <!-- Fila inferior: Detalles adicionales -->
                    <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
                      <div class="flex items-center gap-1.5">
                        <CalendarDaysIcon class="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span class="text-sm text-gray-600">
                          Vence: {{ formatDate(cuotaData.fechaVencimiento) }}
                        </span>
                      </div>
                      <p v-if="cuotaData.valorPagado > 0" class="text-sm font-semibold text-green-600 whitespace-nowrap">
                        Pagado: ${{ formatMoney(cuotaData.valorPagado) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Fin del contenedor de cuotas del mes -->
              </div>
              <!-- Fin del grupo de mes simplificado -->
            </div>
            </template>
          </div>
        </div>
        <!-- Footer -->
        <div class="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
          <button 
            @click="cerrarModalCuotasSocio"
            class="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
          >
            Cerrar
          </button>
        </div>
    </ModalWrapper>
    <!-- Modal Configurar Período de Meses -->
    <ModalWrapper
      :show="!!modalConfigMeses"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="card relative w-full sm:max-w-md max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-2xl"
      card-max-width="28rem"
      @close="modalConfigMeses = false"
    >
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-natillera-500 to-natillera-700 rounded-xl flex items-center justify-center">
            <CalendarDaysIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-display font-bold text-gray-800">
              Configurar Período
            </h3>
            <p class="text-sm text-gray-500">
              Define los meses de duración de la natillera
            </p>
          </div>
        </div>
        <form @submit.prevent="guardarConfigMeses" class="space-y-4">
          <div>
            <label class="label">Año</label>
            <input 
              v-model.number="formConfigMeses.anio"
              type="number"
              class="input-field"
              :min="2020"
              :max="2100"
              required
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Mes de inicio</label>
              <select 
                v-model.number="formConfigMeses.mes_inicio"
                class="input-field"
                required
              >
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                  {{ mes.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Mes de cierre</label>
              <select 
                v-model.number="formConfigMeses.mes_fin"
                class="input-field"
                required
              >
                <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                  {{ mes.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="bg-natillera-50 border border-natillera-200 rounded-xl p-4">
            <p class="text-sm text-natillera-700 font-medium">
              📅 La natillera tendrá cuotas desde <strong>{{ meses.find(m => m.value === formConfigMeses.mes_inicio)?.label }}</strong> 
              hasta <strong>{{ meses.find(m => m.value === formConfigMeses.mes_fin)?.label }}</strong> de <strong>{{ formConfigMeses.anio }}</strong>
            </p>
            <p class="text-xs text-natillera-600 mt-1">
              Total: {{ formConfigMeses.mes_fin >= formConfigMeses.mes_inicio 
                ? formConfigMeses.mes_fin - formConfigMeses.mes_inicio + 1 
                : 12 - formConfigMeses.mes_inicio + formConfigMeses.mes_fin + 1 }} meses
            </p>
          </div>
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="modalConfigMeses = false"
              class="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary flex-1"
              :disabled="natillerasStore.loading"
            >
              {{ natillerasStore.loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
    </ModalWrapper>
    <!-- Modal Socios en Mora -->
    <ModalWrapper
      :show="!!modalSociosEnMora"
      :z-index="50"
      align="bottom"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
      card-max-width="56rem"
      @close="modalSociosEnMora = false"
    >
        <!-- Header con gradiente -->
        <div class="bg-gradient-to-br p-4 sm:p-6 text-white relative overflow-hidden flex-shrink-0 z-10" :class="sociosEnMora.length >= 3 ? 'from-red-500 via-rose-600 to-red-700' : 'from-amber-500 via-orange-600 to-amber-700'">
          <!-- Efectos decorativos -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div class="relative z-10 flex items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div class="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div :class="['w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg mt-0.5 sm:mt-0', sociosEnMora.length >= 3 ? 'bg-white/20 backdrop-blur-sm border border-white/30' : 'bg-white/20 backdrop-blur-sm border border-white/30']">
                <ExclamationTriangleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base sm:text-xl font-display font-bold mb-0.5 sm:mb-1">
                  Socios en Mora
                </h3>
                <p class="text-white/90 text-xs sm:text-sm leading-tight line-clamp-2">
                  {{ sociosEnMora.length }} {{ sociosEnMora.length === 1 ? 'socio requiere' : 'socios requieren' }} atención inmediata
                </p>
              </div>
            </div>
            <button 
              @click="modalSociosEnMora = false"
              class="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all mt-0.5 sm:mt-0"
            >
              <XMarkIcon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
        <!-- Contenido -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <!-- Resumen rápido -->
          <div :class="[
            'grid gap-3 sm:gap-4',
            totalSancionesMora > 0 && totalPrestamosVencidos > 0 
              ? 'grid-cols-2 sm:grid-cols-3' // 4 tarjetas en 2 filas: 3-1
              : totalSancionesMora > 0 || totalPrestamosVencidos > 0 
              ? 'grid-cols-2 sm:grid-cols-3' 
              : 'grid-cols-2 sm:grid-cols-2'
          ]">
            <div :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5',
              sociosEnMora.length >= 3 ? 'border-red-300/60 hover:border-red-400' : 'border-amber-300/60 hover:border-amber-400'
            ]">
              <p :class="[
                'font-bold mb-1',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl',
                sociosEnMora.length >= 3 ? 'text-red-600' : 'text-amber-600'
              ]">{{ totalCuotasMora }}</p>
              <p :class="[
                'font-semibold',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm',
                sociosEnMora.length >= 3 ? 'text-red-700' : 'text-amber-700'
              ]">Cuotas en mora</p>
            </div>
            <!-- Préstamos vencidos (solo si hay) -->
            <div v-if="totalPrestamosVencidos > 0" :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 border-purple-300/60 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5'
            ]">
              <p :class="[
                'font-bold mb-1 text-purple-600',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
              ]">{{ totalPrestamosVencidos }}</p>
              <p :class="[
                'font-semibold text-purple-700',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              ]">Préstamos vencidos</p>
              <p :class="[
                'text-purple-600 mt-0.5',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[8px] sm:text-[9px]' : 'text-[10px]'
              ]">{{ totalCuotasPrestamosVencidos }} {{ totalCuotasPrestamosVencidos === 1 ? 'cuota' : 'cuotas' }}</p>
            </div>
            <!-- Sanciones (solo si hay) -->
            <div v-if="totalSancionesMora > 0" :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 border-rose-300/60 hover:border-rose-400 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5' : 'p-4 sm:p-5'
            ]">
              <p :class="[
                'font-bold mb-1 text-rose-600',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
              ]">${{ formatMoneyShort(totalSancionesMora) }}</p>
              <p :class="[
                'font-semibold text-rose-700',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              ]">Total sanciones</p>
            </div>
            <div :class="[
              'bg-white/80 backdrop-blur-sm rounded-2xl text-center border-2 shadow-lg hover:shadow-xl transition-all duration-300',
              totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'p-2 sm:p-2.5 sm:col-span-2' : 'p-4 sm:p-5',
              sociosEnMora.length >= 3 ? 'border-orange-300/60 hover:border-orange-400' : 'border-yellow-300/60 hover:border-yellow-400'
            ]">
              <p :class="[
                'font-bold mb-1 text-orange-600',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
              ]">${{ formatMoneyShort(totalDeudaMora + totalDeudaPrestamosVencidos) }}</p>
              <p :class="[
                'font-semibold text-orange-700',
                totalSancionesMora > 0 && totalPrestamosVencidos > 0 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
              ]">Total a cobrar</p>
            </div>
          </div>
          <!-- Lista de socios en mora -->
          <div class="space-y-3">
            <div 
              v-for="socioMora in sociosEnMora" 
              :key="socioMora.id"
              class="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-gray-200/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              :class="[
                socioMora.cuotasMora > 0 
                  ? 'bg-gradient-to-br from-white via-red-50/40 to-rose-50/30 border-red-200/60 hover:border-red-300' 
                  : 'bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 border-orange-200/60 hover:border-orange-300'
              ]"
            >
              <!-- Efectos decorativos de fondo -->
              <div 
                :class="[
                  'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-20 transition-opacity duration-300 group-hover:opacity-30',
                  socioMora.cuotasMora > 0 ? 'bg-red-300' : 'bg-orange-300'
                ]"
              ></div>
              
              <!-- Línea decorativa superior -->
              <div 
                :class="[
                  'absolute top-0 left-0 right-0 h-0.5',
                  socioMora.cuotasMora > 0 ? 'bg-red-400/60' : 'bg-orange-400/60'
                ]"
              ></div>
              <div class="relative z-10">
                <!-- Layout móvil: datos financieros arriba -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <!-- Primera fila en móvil: Avatar y nombre -->
                  <div class="flex items-start gap-3 min-w-0 flex-1">
                    <img 
                      :src="getAvatarUrl(socioMora.nombre || socioMora.id, socioMora.avatar_seed, socioMora.avatar_style)" 
                      :alt="socioMora.nombre"
                      class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 border-2 shadow-md object-cover group-hover:scale-105 transition-transform duration-300"
                      :class="[socioMora.cuotasMora > 0 ? 'border-red-300' : 'border-orange-300']"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-gray-900 text-base sm:text-lg group-hover:text-natillera-700 transition-colors truncate">{{ socioMora.nombre }}</p>
                      <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span v-if="socioMora.cuotasMora > 0" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">
                          {{ socioMora.cuotasMora }} en mora
                        </span>
                        <span v-if="socioMora.cuotasMora > 0 && socioMora.diasMora > 0" class="text-xs text-red-600 font-semibold whitespace-nowrap">
                          {{ socioMora.diasMora }} {{ socioMora.diasMora === 1 ? 'día' : 'días' }}
                        </span>
                        <span v-if="socioMora.tienePrestamosVencidos" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Préstamo sin pagar
                        </span>
                      </div>
                      <!-- Información de préstamo vencido - Móvil compacto -->
                      <div v-if="socioMora.tienePrestamosVencidos && socioMora.fechaVencimientoPrestamo" class="mt-1.5 sm:mt-2">
                        <div class="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                          <div class="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                            <CalendarDaysIcon class="w-3 h-3 flex-shrink-0" />
                            <span class="font-medium">Fecha de pago:</span>
                            <span class="font-semibold">{{ formatDate(socioMora.fechaVencimientoPrestamo) }}</span>
                          </div>
                          <div v-if="socioMora.diasMoraPrestamo > 0" class="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                            <ExclamationCircleIcon class="w-3 h-3 flex-shrink-0" />
                            <span class="font-medium">{{ socioMora.diasMoraPrestamo }}d</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Datos financieros en móvil: debajo del nombre, en una sola línea compacta -->
                  <div v-if="socioMora.cuotasMora > 0" class="sm:hidden w-full -mt-2 pt-2 border-t border-gray-200/60">
                    <div class="space-y-2">
                      <!-- Cuotas en mora -->
                      <div class="flex items-center justify-between gap-3">
                        <!-- Total a cobrar - destacado -->
                        <div class="flex-1 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg px-2.5 py-1.5 border border-red-200/60">
                          <p class="text-[9px] text-gray-600 font-medium mb-0.5">Total a cobrar (cuotas)</p>
                          <p class="text-base font-bold text-red-600 leading-tight">${{ formatMoney(socioMora.totalConSanciones || socioMora.totalDeuda) }}</p>
                        </div>
                        
                        <!-- Valor cuota y Sanción - lado derecho compacto -->
                        <div class="flex flex-col gap-1.5 text-right">
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] text-gray-500">Cuota:</span>
                            <span class="text-[11px] font-semibold text-gray-700">${{ formatMoney(socioMora.valorCuotaPromedio || 0) }}</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] text-gray-500">Sanción:</span>
                            <span class="text-[11px] font-semibold text-rose-600">${{ formatMoney(socioMora.totalSanciones || 0) }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Préstamo en mora (si existe) -->
                      <div v-if="socioMora.tienePrestamosVencidos" class="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 border border-purple-200/60">
                        <div class="flex-1">
                          <p class="text-[9px] text-gray-600 font-medium mb-0.5">Préstamo en mora</p>
                          <p class="text-base font-bold text-purple-600 leading-tight">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                        </div>
                        <div class="flex items-center gap-2 text-right">
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Cuotas</span>
                            <span class="text-xs font-semibold text-gray-700">{{ socioMora.cuotasVencidasPrestamo }}</span>
                          </div>
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Días</span>
                            <span class="text-xs font-semibold text-red-600">{{ socioMora.diasMoraPrestamo || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Si solo tiene préstamos vencidos (sin cuotas) en móvil -->
                  <div v-else-if="socioMora.tienePrestamosVencidos && !socioMora.cuotasMora && !socioMora.cuotasPendientes" class="sm:hidden w-full -mt-1 pt-2 border-t border-gray-200/60">
                    <div class="flex items-center justify-between gap-2">
                      <!-- Total a cobrar préstamo - destacado -->
                      <div class="flex-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 border border-purple-200/60">
                        <p class="text-[9px] text-gray-600 font-medium mb-0.5">Préstamo vencido</p>
                        <p class="text-base font-bold text-purple-600 leading-tight">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      
                      <!-- Información adicional - lado derecho compacto -->
                      <div class="flex items-center gap-2 text-right">
                        <div class="flex flex-col">
                          <span class="text-[9px] text-gray-500">Cuotas</span>
                          <span class="text-xs font-semibold text-gray-700">{{ socioMora.cuotasVencidasPrestamo }}</span>
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[9px] text-gray-500">Días</span>
                          <span class="text-xs font-semibold text-red-600">{{ socioMora.diasMoraPrestamo || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Si tiene cuotas en mora y también préstamos vencidos en móvil -->
                  <div v-else-if="socioMora.tienePrestamosVencidos && socioMora.cuotasMora > 0" class="sm:hidden w-full -mt-2 pt-2 border-t border-gray-200/60">
                    <div class="space-y-2">
                      <!-- Cuotas en mora -->
                      <div class="text-left">
                        <p class="text-xs font-bold text-red-600">${{ formatMoney(socioMora.totalDeuda) }}</p>
                        <p class="text-[10px] text-gray-500">cuotas en mora</p>
                      </div>
                      
                      <!-- Préstamo en mora -->
                      <div class="flex items-center justify-between gap-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 border border-purple-200/60">
                        <div class="flex-1">
                          <p class="text-[9px] text-gray-600 font-medium mb-0.5">Préstamo en mora</p>
                          <p class="text-base font-bold text-purple-600 leading-tight">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                        </div>
                        <div class="flex items-center gap-2 text-right">
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Cuotas</span>
                            <span class="text-xs font-semibold text-gray-700">{{ socioMora.cuotasVencidasPrestamo }}</span>
                          </div>
                          <div class="flex flex-col">
                            <span class="text-[9px] text-gray-500">Días</span>
                            <span class="text-xs font-semibold text-red-600">{{ socioMora.diasMoraPrestamo || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Fallback -->
                  <div v-else class="sm:hidden w-full -mt-2">
                    <div class="text-left">
                      <p class="text-xs font-bold text-amber-600">${{ formatMoney(socioMora.totalDeuda) }}</p>
                      <p class="text-[10px] text-gray-500">adeudado</p>
                    </div>
                  </div>
                
                <!-- Botón en móvil: abajo -->
                <div class="sm:hidden flex flex-col gap-2">
                  <button
                    v-if="socioMora.cuotasMora > 0"
                    @click.stop="verCuotasSocio(socioMora)"
                    class="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Ver cuotas
                  </button>
                  <button
                    v-if="socioMora.tienePrestamosVencidos"
                    @click.stop="verPrestamoSocio(socioMora)"
                    class="w-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Ir al préstamo
                  </button>
                </div>
                
                <!-- Layout desktop: lado derecho con datos financieros y botón -->
                <div v-if="socioMora.cuotasMora > 0" class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-start gap-3">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Columna de etiquetas -->
                    <div class="text-right space-y-1">
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Total a cobrar</p>
                      </div>
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Valor cuota</p>
                      </div>
                      <div v-if="!socioMora.tienePrestamosVencidos">
                        <p class="text-[10px] text-gray-500">Sanción</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="text-[10px] text-gray-500">Sanción</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="text-[10px] text-gray-500">Préstamo en mora</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos">
                        <p class="text-[10px] text-gray-500">Cuotas vencidas</p>
                      </div>
                    </div>
                    
                    <!-- Columna de valores -->
                    <div class="text-right space-y-1 min-w-[100px]">
                      <div class="mb-1">
                        <p class="font-bold text-red-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalConSanciones || socioMora.totalDeuda) }}</p>
                      </div>
                      <div class="mb-1">
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">${{ formatMoney(socioMora.valorCuotaPromedio || 0) }}</p>
                      </div>
                      <div v-if="!socioMora.tienePrestamosVencidos">
                        <p class="font-semibold text-rose-600 text-xs sm:text-sm">${{ formatMoney(socioMora.totalSanciones || 0) }}</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="font-semibold text-rose-600 text-xs sm:text-sm">${{ formatMoney(socioMora.totalSanciones || 0) }}</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos" class="mb-1">
                        <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      <div v-if="socioMora.tienePrestamosVencidos">
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">{{ socioMora.cuotasVencidasPrestamo || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botones -->
                  <div class="flex flex-col gap-2">
                    <button
                      @click.stop="verCuotasSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ver cuotas
                    </button>
                    <button
                      v-if="socioMora.tienePrestamosVencidos"
                      @click.stop="verPrestamoSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ir al préstamo
                    </button>
                  </div>
                </div>
                
                <!-- Layout desktop: solo préstamos vencidos -->
                <div v-else-if="socioMora.tienePrestamosVencidos && !socioMora.cuotasMora" class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-start gap-3">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Columna de etiquetas -->
                    <div class="text-right space-y-1">
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Préstamo vencido</p>
                      </div>
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Cuotas vencidas</p>
                      </div>
                      <div>
                        <p class="text-[10px] text-gray-500">Días sin pago</p>
                      </div>
                    </div>
                    
                    <!-- Columna de valores -->
                    <div class="text-right space-y-1 min-w-[100px]">
                      <div class="mb-1">
                        <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      <div class="mb-1">
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">{{ socioMora.cuotasVencidasPrestamo || 0 }}</p>
                      </div>
                      <div>
                        <p class="font-semibold text-red-600 text-xs sm:text-sm">{{ socioMora.diasMoraPrestamo || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botón Ir al préstamo -->
                  <button
                    @click.stop="verPrestamoSocio(socioMora)"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Ir al préstamo
                  </button>
                </div>
                
                <!-- Si tiene cuotas en mora y también préstamos vencidos en desktop -->
                <div v-else-if="socioMora.cuotasMora > 0 && socioMora.tienePrestamosVencidos" class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-start gap-3">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <!-- Columna de etiquetas -->
                    <div class="text-right space-y-1">
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Cuotas en mora</p>
                      </div>
                      <div class="mb-1">
                        <p class="text-[10px] text-gray-500">Préstamo en mora</p>
                      </div>
                      <div>
                        <p class="text-[10px] text-gray-500">Cuotas vencidas</p>
                      </div>
                    </div>
                    
                    <!-- Columna de valores -->
                    <div class="text-right space-y-1 min-w-[100px]">
                      <div class="mb-1">
                        <p class="font-bold text-red-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeuda) }}</p>
                      </div>
                      <div class="mb-1">
                        <p class="font-bold text-purple-600 text-sm sm:text-base">${{ formatMoney(socioMora.totalDeudaPrestamo || 0) }}</p>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-700 text-xs sm:text-sm">{{ socioMora.cuotasVencidasPrestamo || 0 }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Botones -->
                  <div class="flex flex-col gap-2">
                    <button
                      @click.stop="verCuotasSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-natillera-500 to-natillera-600 hover:from-natillera-600 hover:to-natillera-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ver cuotas
                    </button>
                    <button
                      @click.stop="verPrestamoSocio(socioMora)"
                      class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      Ir al préstamo
                    </button>
                  </div>
                </div>
                
                <!-- Si solo tiene préstamos vencidos (sin cuotas en mora) en desktop -->
                <div v-else class="hidden sm:flex flex-shrink-0 flex-col sm:flex-row items-end sm:items-center gap-2">
                  <div class="text-right">
                    <p class="text-sm sm:text-base font-bold text-purple-600">${{ formatMoney(socioMora.totalDeudaPrestamo) }}</p>
                    <p class="text-xs text-gray-500">préstamo vencido</p>
                  </div>
                  <button
                    @click.stop="verPrestamoSocio(socioMora)"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Ir al préstamo
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
    <!-- Modal Desglose de Utilidades (patrón natillerapp-modals: velo salvia, cabecera #1B5E37, scroll único) -->
    <ModalWrapper
      :show="!!modalDesgloseUtilidades"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="cerrarModalDesglose"
    >
      <!-- Móvil: fila icono + títulos + X (flex, sin absolute) -->
      <div class="sm:hidden flex-shrink-0 bg-[#1B5E37]">
        <div
          class="flex items-center gap-3 pl-4 pr-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] min-h-[4.2rem]"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <SparklesIcon class="h-5 w-5 text-[#1B5E37]" />
          </div>
          <div class="min-w-0 flex-1 py-0.5 pr-1 text-left">
            <h3 class="font-display text-base font-bold leading-tight text-white">
              Desglose de utilidades
            </h3>
            <p class="mt-0.5 text-[0.6875rem] font-normal leading-snug text-white/85">
              Por tipo de actividad
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/95 transition-colors hover:bg-white/15 active:bg-white/25 [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="cerrarModalDesglose"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>
      <!-- sm+: cabecera centrada + X a la derecha -->
      <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37]">
        <div
          class="flex items-start pt-[max(0.5rem,env(safe-area-inset-top))] pl-4 pr-3 pb-5"
        >
          <div class="w-11 shrink-0" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
            <div
              class="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <SparklesIcon class="h-6 w-6 text-[#1B5E37]" />
            </div>
            <h3 class="font-display text-lg font-bold leading-tight text-white">
              Desglose de utilidades
            </h3>
            <p class="mt-1 text-xs font-normal text-white/85">
              Por tipo de actividad
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/95 transition-colors hover:bg-white/15 active:bg-white/25 [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="cerrarModalDesglose"
          >
            <XMarkIcon class="h-[1.375rem] w-[1.375rem]" />
          </button>
        </div>
      </div>
      <div
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 [-webkit-overflow-scrolling:touch] sm:px-6 sm:pb-6 sm:pt-5"
      >
        <!-- Vista detalle Rifas (al hacer clic en Rifas) -->
        <div v-if="detalleRifasAbierto" class="space-y-4">
          <button
            type="button"
            @click="cerrarDetalleRifas"
            class="flex items-center gap-2 text-natillera-600 hover:text-natillera-800 font-medium text-sm"
          >
            <ChevronLeftIcon class="w-4 h-4 flex-shrink-0" />
            Volver al desglose
          </button>
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Rifas liquidadas</h4>
          <div v-if="detalleRifas.loading" class="flex justify-center py-10">
            <ArrowPathIcon class="w-8 h-8 text-natillera-400 animate-spin" />
          </div>
          <div v-else-if="!detalleRifas.porMes || detalleRifas.porMes.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No hay rifas liquidadas.
          </div>
          <div v-else class="space-y-6">
            <!-- Totales acumulados (todas las rifas) -->
            <div class="rounded-xl border-2 border-natillera-200 bg-gradient-to-br from-natillera-50 to-white p-4 shadow-sm">
              <p class="text-xs font-bold uppercase tracking-wider text-natillera-700 mb-3">Totales acumulados</p>
              <div class="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p class="text-gray-500">Recaudado</p>
                  <p class="font-bold text-natillera-600 text-sm">${{ formatMoney(totalesAcumuladosRifas.totalRecogido) }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Premio</p>
                  <p class="font-bold text-red-600 text-sm">${{ formatMoney(totalesAcumuladosRifas.totalPremio) }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Utilidad</p>
                  <p class="font-bold text-green-600 text-sm">${{ formatMoney(totalesAcumuladosRifas.totalUtilidad) }}</p>
                </div>
              </div>
            </div>
            <!-- Desglose por mes -->
            <div class="space-y-8">
              <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Desglose por mes</p>
              <div
                v-for="(bloque, idx) in detalleRifas.porMes"
                :key="idx"
                class="rounded-xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                <div class="p-3 space-y-3">
                  <div v-for="rifa in bloque.rifas" :key="rifa.id" class="rounded-xl bg-slate-50 border-2 border-slate-200 p-2.5 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-300/40 transition-shadow duration-200">
                  <p class="text-sm font-medium text-gray-800 line-clamp-2">{{ rifa.descripcion }}</p>
                  <div class="grid grid-cols-3 gap-2 text-center text-xs mt-2.5 py-2 px-2 rounded-lg bg-white/80 border border-gray-100">
                    <div>
                      <p class="text-gray-500">Recaudado</p>
                      <p class="font-semibold text-natillera-600">${{ formatMoney(rifa.totalRecogido) }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500"><span class="sm:hidden">Premio</span><span class="hidden sm:inline">Premio entregado</span></p>
                      <p class="font-semibold text-red-600">${{ formatMoney(rifa.premio) }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Utilidad</p>
                      <p class="font-semibold text-green-600">${{ formatMoney(rifa.utilidad) }}</p>
                    </div>
                  </div>
                  <div v-if="rifa.socios && rifa.socios.length" class="mt-2">
                    <button
                      type="button"
                      @click="toggleRifaDesplegable(rifa.id)"
                      class="flex items-center justify-between gap-2 w-full text-left py-2 px-2.5 -mx-0.5 rounded-lg border border-transparent transition-all duration-200"
                      :class="rifasDesplegados[rifa.id] ? 'bg-natillera-100/80 border-natillera-200/60 text-natillera-800' : 'hover:bg-natillera-50/80 border-natillera-100 text-gray-600 hover:text-natillera-700 hover:border-natillera-200/40'"
                    >
                      <span class="flex items-center gap-2">
                        <span class="text-xs font-semibold uppercase tracking-wide">Información de pagos</span>
                        <span class="text-[11px] text-gray-500 font-normal normal-case">({{ rifa.socios.length }} {{ rifa.socios.length === 1 ? 'pago' : 'pagos' }})</span>
                      </span>
                      <ChevronDownIcon :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', rifasDesplegados[rifa.id] ? 'rotate-180 text-natillera-600' : 'text-gray-400']" />
                    </button>
                    <div v-show="rifasDesplegados[rifa.id]" class="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                      <table class="w-full text-xs">
                        <thead>
                          <tr class="bg-gray-100 text-gray-600 font-semibold">
                            <th class="text-left py-2 px-3">Socio</th>
                            <th class="text-right py-2 px-3">Valor</th>
                            <th class="text-right py-2 px-3">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(s, i) in [...(rifa.socios || [])].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))"
                            :key="i"
                            class="border-t border-gray-100 transition-colors"
                            :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-100'"
                          >
                            <td class="py-2 px-3 text-gray-700 truncate max-w-[140px]">{{ s.nombre }}</td>
                            <td class="py-2 px-3 text-right tabular-nums font-medium text-natillera-600">${{ formatMoney(s.valorPagado) }}</td>
                            <td class="py-2 px-3 text-right text-gray-500">{{ s.fechaPago ? formatDate(s.fechaPago) : '—' }}</td>
                          </tr>
                          <tr class="border-t-2 border-gray-300 bg-gray-100/50">
                            <td colspan="3" class="py-0.5 px-0"></td>
                          </tr>
                          <tr class="bg-natillera-50/80 font-semibold text-gray-800">
                            <td class="py-2.5 px-3 border-t border-natillera-200">Total</td>
                            <td class="py-2.5 px-3 text-right tabular-nums text-natillera-600 border-t border-natillera-200">${{ formatMoney((rifa.socios || []).reduce((sum, s) => sum + (parseFloat(s.valorPagado) || 0), 0)) }}</td>
                            <td class="py-2.5 px-3 border-t border-natillera-200"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        <!-- Vista detalle Otros (al hacer clic en Otro) -->
        <div v-else-if="detalleOtrosAbierto" class="space-y-4">
          <button
            type="button"
            @click="cerrarDetalleOtros"
            class="flex items-center gap-2 text-natillera-600 hover:text-natillera-800 font-medium text-sm"
          >
            <ChevronLeftIcon class="w-4 h-4 flex-shrink-0" />
            Volver al desglose
          </button>
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Otros (por descripción de actividad)</h4>
          <div v-if="detalleOtros.loading" class="flex justify-center py-10">
            <ArrowPathIcon class="w-8 h-8 text-natillera-400 animate-spin" />
          </div>
          <div v-else-if="!detalleOtros.porActividad || detalleOtros.porActividad.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No hay utilidades clasificadas como &quot;Otro&quot;.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in detalleOtros.porActividad"
              :key="item.id"
              class="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <div class="px-3 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-gray-800 line-clamp-2">{{ item.descripcion }}</p>
                <p class="text-sm font-semibold text-green-600 flex-shrink-0">${{ formatMoney(item.total) }}</p>
              </div>
              <div class="p-3">
                <div v-if="item.pagos && item.pagos.length" class="mt-2">
                  <button
                    type="button"
                    @click="toggleOtroDesplegable(item.id)"
                    class="flex items-center justify-between gap-2 w-full text-left py-2 px-2.5 -mx-0.5 rounded-lg border border-transparent transition-all duration-200"
                    :class="otrosDesplegados[item.id] ? 'bg-slate-100/80 border-slate-200/60 text-slate-800' : 'hover:bg-slate-50/80 border-slate-100 text-gray-600 hover:text-slate-700 hover:border-slate-200/40'"
                  >
                    <span class="flex items-center gap-2">
                      <span class="text-xs font-semibold uppercase tracking-wide">Información de pagos</span>
                      <span class="text-[11px] text-gray-500 font-normal normal-case">({{ item.pagos.length }} {{ item.pagos.length === 1 ? 'pago' : 'pagos' }})</span>
                    </span>
                    <ChevronDownIcon :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', otrosDesplegados[item.id] ? 'rotate-180 text-slate-600' : 'text-gray-400']" />
                  </button>
                  <div v-show="otrosDesplegados[item.id]" class="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="bg-gray-100 text-gray-600 font-semibold">
                          <th class="text-left py-2 px-3">Socio</th>
                          <th class="text-right py-2 px-3">Valor</th>
                          <th class="text-right py-2 px-3">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(s, i) in [...(item.pagos || [])].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))"
                          :key="i"
                          class="border-t border-gray-100 transition-colors"
                          :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-100'"
                        >
                          <td class="py-2 px-3 text-gray-700 truncate max-w-[140px]">{{ s.nombre }}</td>
                          <td class="py-2 px-3 text-right tabular-nums font-medium text-green-600">${{ formatMoney(s.valorPagado) }}</td>
                          <td class="py-2 px-3 text-right text-gray-500">{{ s.fechaPago ? formatDate(s.fechaPago) : '—' }}</td>
                        </tr>
                        <tr class="bg-slate-50/80 font-semibold text-gray-800">
                          <td class="py-2.5 px-3 border-t border-slate-200">Total</td>
                          <td class="py-2.5 px-3 text-right tabular-nums text-green-600 border-t border-slate-200">${{ formatMoney((item.pagos || []).reduce((sum, s) => sum + (parseFloat(s.valorPagado) || 0), 0)) }}</td>
                          <td class="py-2.5 px-3 border-t border-slate-200"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p v-else class="text-xs text-gray-500 mt-1">Sin registros de pagos por socio.</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Vista detalle Sanciones (al hacer clic en Sanciones) -->
        <div v-else-if="detalleSancionesAbierto" class="space-y-4">
          <button
            type="button"
            @click="cerrarDetalleSanciones"
            class="flex items-center gap-2 text-natillera-600 hover:text-natillera-800 font-medium text-sm"
          >
            <ChevronLeftIcon class="w-4 h-4 flex-shrink-0" />
            Volver al desglose
          </button>
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sanciones (multas pagadas)</h4>
          <div v-if="detalleSanciones.loading" class="flex justify-center py-10">
            <ArrowPathIcon class="w-8 h-8 text-natillera-400 animate-spin" />
          </div>
          <div v-else-if="!detalleSanciones.lista || detalleSanciones.lista.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No hay sanciones pagadas registradas.
          </div>
          <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table class="w-full text-xs sm:text-sm">
              <thead>
                <tr class="bg-gray-100 text-gray-600 font-semibold">
                  <th class="text-left py-2.5 px-3">Socio</th>
                  <th class="text-right py-2.5 px-3">Valor sanción</th>
                  <th class="text-left py-2.5 px-3">Período</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, i) in detalleSanciones.lista"
                  :key="i"
                  class="border-t border-gray-100"
                  :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'"
                >
                  <td class="py-2.5 px-3 text-gray-800 truncate max-w-[160px]">{{ item.socio }}</td>
                  <td class="py-2.5 px-3 text-right tabular-nums font-semibold text-red-600">${{ formatMoney(item.valor) }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ item.periodo }}</td>
                </tr>
                <tr class="border-t-2 border-gray-300 bg-gray-100 font-semibold text-gray-800">
                  <td class="py-2.5 px-3">Total</td>
                  <td class="py-2.5 px-3 text-right tabular-nums text-red-600">${{ formatMoney(detalleSanciones.lista.reduce((s, it) => s + (it.valor || 0), 0)) }}</td>
                  <td class="py-2.5 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Vista detalle Intereses de préstamos (al hacer clic en Intereses de préstamos) -->
        <div v-else-if="detallePrestamosAbierto" class="space-y-4">
          <button
            type="button"
            @click="cerrarDetallePrestamos"
            class="flex items-center gap-2 text-natillera-600 hover:text-natillera-800 font-medium text-sm"
          >
            <ChevronLeftIcon class="w-4 h-4 flex-shrink-0" />
            Volver al desglose
          </button>
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Intereses por préstamo</h4>
          <div v-if="detallePrestamos.loading" class="flex justify-center py-10">
            <ArrowPathIcon class="w-8 h-8 text-natillera-400 animate-spin" />
          </div>
          <div v-else-if="!detallePrestamos.lista || detallePrestamos.lista.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No hay intereses de préstamos registrados.
          </div>
          <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table class="w-full text-xs sm:text-sm">
              <thead>
                <tr class="bg-gray-100 text-gray-600 font-semibold">
                  <th class="text-left py-2.5 px-3">Socio</th>
                  <th class="text-right py-2.5 px-3">Valor préstamo</th>
                  <th class="text-left py-2.5 px-3">Fecha</th>
                  <th class="text-right py-2.5 px-3">Intereses</th>
                  <th class="text-right py-2.5 px-3">% interés</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, i) in detallePrestamos.lista"
                  :key="i"
                  class="border-t border-gray-100"
                  :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'"
                >
                  <td class="py-2.5 px-3 text-gray-800">{{ item.socio }}</td>
                  <td class="py-2.5 px-3 text-right tabular-nums font-medium text-gray-800">${{ formatMoney(item.valorPrestamo) }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ item.fecha ? formatDate(item.fecha) : '—' }}</td>
                  <td class="py-2.5 px-3 text-right tabular-nums font-semibold text-green-600">${{ formatMoney(item.intereses) }}</td>
                  <td class="py-2.5 px-3 text-right tabular-nums text-gray-700">{{ item.porcentaje != null ? item.porcentaje + '%' : '—' }}</td>
                </tr>
                <tr class="border-t-2 border-gray-300 bg-gray-100 font-semibold text-gray-800">
                  <td class="py-2.5 px-3">Total</td>
                  <td class="py-2.5 px-3"></td>
                  <td class="py-2.5 px-3"></td>
                  <td class="py-2.5 px-3 text-right tabular-nums text-green-600">${{ formatMoney(detallePrestamos.lista.reduce((s, it) => s + (it.intereses || 0), 0)) }}</td>
                  <td class="py-2.5 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Vista "En desarrollo" para otros conceptos -->
        <div v-else-if="conceptoEnDesarrollo" class="space-y-4">
          <button
            type="button"
            @click="cerrarConceptoEnDesarrollo"
            class="flex items-center gap-2 text-natillera-600 hover:text-natillera-800 font-medium text-sm"
          >
            <ChevronLeftIcon class="w-4 h-4 flex-shrink-0" />
            Volver al desglose
          </button>
          <div class="rounded-xl border-2 border-dashed border-natillera-200 bg-natillera-50/50 p-8 text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-natillera-100 text-natillera-500 mb-4">
              <SparklesIcon class="w-7 h-7" />
            </div>
            <h4 class="text-lg font-semibold text-natillera-800 mb-1">{{ labelConceptoEnDesarrollo(conceptoEnDesarrollo) }}</h4>
            <p class="text-gray-600 text-sm mb-3">Este desglose está en el taller.</p>
            <p class="text-gray-500 text-xs max-w-xs mx-auto">Pronto podrás ver aquí el detalle por mes, quién pagó y cuánto. Mientras tanto, el total ya lo tienes en la lista. 🛠️</p>
          </div>
        </div>
        <!-- Vista normal: total + por tipo + egresos/ingresos -->
        <template v-else>
        <div class="rounded-xl bg-natillera-50 border border-natillera-200 p-4 mb-5">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-sm font-semibold text-natillera-800">Total utilidades (neto)</p>
            <span
              class="inline-flex text-natillera-500 hover:text-natillera-700 cursor-help"
              title="Se calcula: Utilidades recogidas (suma de todos los tipos) − Egresos de utilidades + Ingresos a utilidades."
            >
              <InformationCircleIcon class="w-4 h-4 flex-shrink-0" />
            </span>
          </div>
          <p class="text-2xl font-bold text-natillera-600 tabular-nums">
            ${{ formatMoney(Math.max(0, (estadisticas.utilidadesRecogidas || 0) - (estadisticas.egresosUtilidades ?? 0) + (estadisticas.ingresosUtilidades ?? 0))) }}
          </p>
        </div>
        <!-- Por tipo -->
        <div v-if="(estadisticas.utilidadesDesglose || []).length > 0" class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Por tipo</h4>
          <div class="space-y-2">
            <div
              v-for="item in estadisticas.utilidadesDesglose"
              :key="item.id"
              role="button"
              tabindex="0"
              @click="abrirConceptoPorTipo(item)"
              @keydown.enter="abrirConceptoPorTipo(item)"
              class="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-natillera-50/50 hover:border-natillera-200/50 transition-colors cursor-pointer"
            >
              <div class="min-w-0">
                <p class="font-medium text-gray-800">{{ item.label }}</p>
                <p v-if="item.desc" class="text-xs text-gray-500 mt-0.5">{{ item.desc }}</p>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-natillera-600 tabular-nums whitespace-nowrap">${{ formatMoney(item.value || 0) }}</span>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
        <!-- Egresos e ingresos de utilidades (solo si hay algún valor) -->
        <div v-if="(estadisticas.egresosUtilidades ?? 0) > 0 || (estadisticas.ingresosUtilidades ?? 0) > 0" class="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Egresos e ingresos</h4>
          <div v-if="(estadisticas.egresosUtilidades ?? 0) > 0" class="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-red-50 border border-red-100">
            <p class="text-sm font-medium text-red-800">Egresos de utilidades</p>
            <span class="font-bold text-red-600 tabular-nums">− ${{ formatMoney(estadisticas.egresosUtilidades) }}</span>
          </div>
          <div v-if="(estadisticas.ingresosUtilidades ?? 0) > 0" class="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-green-50 border border-green-100">
            <p class="text-sm font-medium text-green-800">Ingresos a utilidades</p>
            <span class="font-bold text-green-600 tabular-nums">+ ${{ formatMoney(estadisticas.ingresosUtilidades) }}</span>
          </div>
        </div>
        <!-- Sin desglose -->
        <div v-if="!(estadisticas.utilidadesDesglose || []).length" class="text-center py-8 text-gray-500">
          <SparklesIcon class="w-12 h-12 mx-auto mb-2 text-natillera-200" />
          <p>No hay utilidades registradas aún.</p>
        </div>
        </template>
      </div>
    </ModalWrapper>
    <!-- Modal Recordatorio personal (solo raigo.16@gmail.com). z-index alto para verse en móvil encima de otros modales. -->
    <ModalWrapper
      v-if="puedeUsarRecordatorio"
      :show="showRecordatorioModal"
      :z-index="9998"
      align="bottom"
      overlay-class="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4"
      card-class="relative w-full sm:max-w-md max-h-[90vh] max-h-[85dvh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#166534]/20"
      card-max-width="28rem"
      @close="cerrarRecordatorioModal"
    >
      <div class="relative flex shrink-0 items-center gap-2.5 bg-[#166534] px-3 py-3 text-white sm:gap-3 sm:px-4 sm:py-3.5">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/30 text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] ring-2 ring-white/55 sm:h-11 sm:w-11"
        >
          <CalendarDaysIcon class="h-5 w-5" stroke-width="2" />
        </div>
        <div class="relative z-10 flex min-w-0 flex-1 items-center">
          <h3 class="font-body text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
            {{ editandoRecordatorio ? 'Configurar recordatorio' : 'Recordatorio programado' }}
          </h3>
        </div>
      </div>
      <!-- flex-1 + min-h-0: el scroll solo en el cuerpo; el pie queda fijo (iOS/Android) -->
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <!-- Modo ver lista de recordatorios -->
        <template v-if="!editandoRecordatorio">
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [-webkit-overflow-scrolling:touch]"
          >
            <div v-if="loadingRecordatorios" class="py-6 text-center text-xs font-medium text-gray-700 sm:text-sm">
              Cargando recordatorios…
            </div>
            <div v-else-if="listRecordatorios.length > 0" class="space-y-2">
              <article
                v-for="(item, idx) in listRecordatorios"
                :key="item.id"
                class="flex overflow-hidden rounded-lg border border-gray-200/90 bg-white shadow-sm"
              >
                <div class="w-1 shrink-0 bg-[#166534]" aria-hidden="true" />
                <div class="flex min-w-0 flex-1 flex-col gap-1 p-3">
                  <p class="text-xs font-semibold leading-relaxed text-gray-900 whitespace-pre-wrap sm:text-[13px]">
                    {{ item.texto }}
                  </p>
                  <div class="flex items-center gap-1 text-[11px] font-medium text-gray-500 sm:text-xs">
                    <CalendarDaysIcon class="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                    <span>Pendiente</span>
                  </div>
                  <div class="mt-0.5 flex items-center justify-end gap-0 border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      @click="abrirRecordatorioParaEditar(idx)"
                      class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 [-webkit-tap-highlight-color:transparent]"
                      title="Editar"
                    >
                      <PencilSquareIcon class="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="eliminarRecordatorio(item.id)"
                      class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 [-webkit-tap-highlight-color:transparent]"
                      title="Eliminar"
                    >
                      <TrashIcon class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            </div>
            <p
              v-else
              class="rounded-lg border border-emerald-100/80 bg-emerald-50/50 px-2 py-4 text-center text-xs text-gray-800 sm:text-sm"
            >
              Aún no tienes recordatorios. Pulsa <span class="font-semibold text-[#124d26]">Agregar recordatorio</span> para crear uno.
            </p>
          </div>
          <div class="flex flex-shrink-0 flex-row gap-2 border-t border-emerald-100/90 bg-emerald-50/95 p-3 sm:gap-3 sm:p-4">
            <button
              type="button"
              @click="cerrarRecordatorioModal"
              class="inline-flex min-h-[42px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#166534] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145a2d] sm:gap-2 sm:px-4"
            >
              <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CheckCircleIcon class="h-3.5 w-3.5 text-white" />
              </span>
              <span class="truncate">Entendido</span>
            </button>
            <button
              type="button"
              @click="abrirRecordatorioParaEditar(-1)"
              class="inline-flex min-h-[42px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3 py-2 text-sm font-semibold text-gray-950 shadow-sm transition hover:bg-emerald-50/80 sm:gap-2 sm:px-4"
            >
              <PlusIcon class="h-5 w-5 shrink-0 text-[#124d26]" />
              <span class="text-center leading-tight">Agregar recordatorio</span>
            </button>
          </div>
        </template>
        <!-- Modo editar / nuevo recordatorio -->
        <template v-else>
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [-webkit-overflow-scrolling:touch]"
          >
            <label class="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#124d26]">Tu nota</label>
            <textarea
              v-model="recordatorioEdicion"
              rows="5"
              class="w-full rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-[#166534] focus:ring-2 focus:ring-[#166534]"
              placeholder="Escribe aquí tu nota o recordatorio..."
            />
          </div>
          <div class="flex flex-shrink-0 flex-row gap-2 border-t border-emerald-100/90 bg-emerald-50/95 p-3 sm:gap-3 sm:p-4">
            <button
              type="button"
              @click="guardarRecordatorio"
              class="inline-flex min-h-[42px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#166534] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#145a2d]"
            >
              <CheckCircleIcon class="h-5 w-5 shrink-0" />
              Guardar
            </button>
            <button
              type="button"
              @click="cancelarEdicionRecordatorio"
              class="inline-flex min-h-[42px] min-w-0 flex-1 items-center justify-center rounded-full border border-gray-200/90 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-emerald-50/80"
            >
              Cancelar
            </button>
          </div>
        </template>
      </div>
    </ModalWrapper>
    <!-- Modal Sin Socios (skill natillerapp-modals: ModalWrapper, velo 70 %, cabecera móvil horizontal / sm+ centrada, cuerpo scroll, pie CTA) -->
    <ModalWrapper
      :show="!!modalSinSocios"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalSinSocios = false"
    >
          <!-- Móvil: icono izq. + título (más grande) + subtítulo + X -->
          <div class="sm:hidden flex-shrink-0 bg-[#1B5E37]">
            <div class="flex items-center gap-3 pl-4 pr-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] min-h-[5.25rem]">
              <div class="w-12 h-12 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
                <UsersIcon class="w-6 h-6 text-[#1B5E37]" />
              </div>
              <div class="min-w-0 flex-1 text-left py-0.5 pr-2">
                <h3 class="font-display font-bold text-white text-xl leading-tight mb-1">
                  Sin Socios
                </h3>
                <p class="text-xs text-white/85 font-normal leading-relaxed">
                  Tu natillera está lista para comenzar
                </p>
              </div>
              <button
                v-if="modalSinSociosTieneScroll"
                type="button"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
                aria-label="Cerrar"
                @click="modalSinSocios = false"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
          </div>
          <!-- sm+: fila X + cabecera centrada (X solo si el cuerpo hace scroll) -->
          <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-center">
            <div
              v-if="modalSinSociosTieneScroll"
              class="flex justify-end pt-[max(0.2rem,env(safe-area-inset-top))] pr-4 sm:pr-5"
            >
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/95 hover:bg-white/15 active:bg-white/25 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
                aria-label="Cerrar"
                @click="modalSinSocios = false"
              >
                <XMarkIcon class="h-[1.375rem] w-[1.375rem]" />
              </button>
            </div>
            <div
              class="px-6 pb-7 sm:pt-1"
              :class="modalSinSociosTieneScroll ? 'pt-0' : 'pt-[max(0.5rem,env(safe-area-inset-top))]'"
            >
              <div class="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <UsersIcon class="w-8 h-8 text-[#1B5E37]" />
              </div>
              <h3 class="font-display font-bold text-white text-xl sm:text-2xl mb-1.5">
                Sin Socios
              </h3>
              <p class="text-sm sm:text-base text-white/85 font-normal leading-snug max-w-sm mx-auto">
                Tu natillera está lista para comenzar
              </p>
            </div>
          </div>
          <!-- Cuerpo (min-h-0 flex-1: scroll iOS con flex) -->
          <div
            ref="scrollAreaModalSinSocios"
            class="min-h-0 overflow-y-auto flex-1 px-6 pt-6 pb-2 space-y-5 bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          >
            <div>
              <h4 class="text-lg font-display font-bold text-gray-900 mb-2">
                ¡Comienza tu natillera agregando socios!
              </h4>
              <p class="text-gray-600 text-sm leading-relaxed">
                Para que tu natillera pueda empezar a funcionar, necesitas agregar al menos un socio. Los socios son los participantes que realizarán los aportes mensuales o quincenales.
              </p>
            </div>
            <div class="rounded-xl bg-[#E8F5E9] px-4 py-3.5 flex gap-3 items-start">
              <InformationCircleIcon class="w-5 h-5 text-[#1B5E37] flex-shrink-0 mt-0.5" />
              <div class="text-left text-sm text-gray-800 leading-relaxed">
                <span class="font-semibold text-[#1B5E37]">¿Qué sigue después?</span>
                <span class="text-gray-700">
                  Una vez agregues socios, podrás gestionar cuotas, préstamos, actividades y mucho más para tu natillera.
                </span>
              </div>
            </div>
          </div>
          <!-- Pie: safe-area para home indicator en iPhone -->
          <div class="flex-shrink-0 px-6 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 bg-white">
            <button
              type="button"
              @click="modalSinSocios = false; if (id && id !== 'undefined' && id !== 'null') { markPendingPrimerSocioNavTourFromModal(id); router.push(`/natilleras/${id}/socios?agregar=true`) } else { router.push('/dashboard') }"
              class="w-full min-h-[48px] px-5 py-3.5 rounded-full bg-[#1B5E37] hover:bg-[#154a2d] active:bg-[#124228] text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm [-webkit-tap-highlight-color:transparent] touch-manipulation"
            >
              <PlusIcon class="w-5 h-5 shrink-0" />
              <span>Crear Primer Socio</span>
            </button>
            <button
              type="button"
              @click="modalSinSocios = false"
              class="w-full min-h-[48px] px-5 py-3 rounded-full text-sm font-semibold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-colors [-webkit-tap-highlight-color:transparent] touch-manipulation"
            >
              Cerrar
            </button>
          </div>
      </ModalWrapper>

    <!-- Modal: todas las alertas — patrón natillerapp-modals (cabecera #1B5E37, cuerpo scroll único, CTA al final del scroll) -->
    <ModalWrapper
      :show="modalTodasLasAlertas"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white my-0 sm:my-4"
      card-max-width="28rem"
      @close="modalTodasLasAlertas = false"
    >
      <!-- Móvil: fila — icono | títulos | X (flex, sin absolute; skill modales) -->
      <div class="flex-shrink-0 bg-[#1B5E37] text-white sm:hidden">
        <div class="flex items-center gap-2 pl-3 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <BellAlertIcon class="h-5 w-5 text-[#1B5E37]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display text-base font-bold leading-tight text-white">
              Todas las alertas
            </h3>
            <p class="mt-0.5 text-[0.6875rem] leading-snug text-white/90">
              Cuotas de la natillera y préstamos en mora
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:bg-white/20 [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="modalTodasLasAlertas = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>
      <!-- Desktop: tres columnas — reserva | icono+títulos centrados | X -->
      <div class="hidden sm:block flex-shrink-0 bg-[#1B5E37] text-white">
        <div class="flex items-start px-4 pb-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <div class="w-11 shrink-0" aria-hidden="true" />
          <div class="flex min-w-0 flex-1 flex-col items-center text-center">
            <div class="flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <BellAlertIcon class="h-6 w-6 text-[#1B5E37]" />
            </div>
            <h3 class="mt-2.5 font-display text-lg font-bold leading-tight text-white">
              Todas las alertas
            </h3>
            <p class="mt-1 px-1 text-xs leading-snug text-white/90">
              Cuotas de la natillera y préstamos en mora
            </p>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:bg-white/20 [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Cerrar"
            @click="modalTodasLasAlertas = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div
        ref="scrollAreaModalTodasLasAlertas"
        class="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain bg-white px-6 pt-5 pb-0 [-webkit-overflow-scrolling:touch]"
      >
        <!-- Cuotas en mora -->
        <div v-if="cantidadCuotasEnMoraAlertas > 0">
          <div class="flex items-center gap-2 mb-3">
            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white" aria-hidden="true">
              <ExclamationTriangleIconSolid class="h-3 w-3" />
            </span>
            <span class="text-xs font-bold text-red-700 uppercase tracking-wide">Cuotas en mora</span>
            <span class="text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5 leading-none">{{ cantidadCuotasEnMoraAlertas }}</span>
          </div>
          <div class="space-y-0.5">
            <div
              v-for="socioMora in sociosCuotasMoraLista"
              :key="'cma-' + socioMora.id"
              class="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-red-50/40 transition-colors"
            >
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-500" aria-hidden="true">
                <ExclamationTriangleIconSolid class="h-3 w-3" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900 truncate leading-tight">{{ socioMora.nombre }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                  {{ socioMora.cuotasMora }} {{ socioMora.cuotasMora === 1 ? 'cuota' : 'cuotas' }}
                  · {{ socioMora.diasMora }} {{ socioMora.diasMora === 1 ? 'día' : 'días' }}
                </p>
              </div>
              <div class="flex-shrink-0 pl-2 text-right tabular-nums leading-tight">
                <p class="text-sm font-bold text-red-600">${{ formatMoney(socioMora.totalDeudaCuotas + socioMora.totalSanciones) }}</p>
                <p v-if="socioMora.totalSanciones > 0" class="text-[10px] text-gray-400 mt-1">
                  cuota <span class="text-gray-500">${{ formatMoney(socioMora.totalDeudaCuotas) }}</span>
                  + multa <span class="text-amber-600">${{ formatMoney(socioMora.totalSanciones) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Separador -->
        <div v-if="cantidadCuotasEnMoraAlertas > 0 && prestamosEnMoraLista.length > 0" class="border-t border-gray-100"></div>

        <!-- Préstamos en mora -->
        <div v-if="prestamosEnMoraLista.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white" aria-hidden="true">
              <BanknotesIconSolid class="h-3 w-3" />
            </span>
            <span class="text-xs font-bold text-violet-700 uppercase tracking-wide">Préstamos en mora</span>
            <span class="text-[10px] font-bold text-white bg-violet-500 rounded-full px-1.5 py-0.5 leading-none">{{ prestamosEnMoraLista.length }}</span>
          </div>
          <div class="space-y-1">
            <button
              v-for="p in prestamosEnMoraLista"
              :key="'pma-' + p.prestamoId"
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-violet-50/40 active:bg-violet-50/60"
              @click="cerrarModalTodasLasAlertasYVerPrestamo(p)"
            >
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-500" aria-hidden="true">
                <BanknotesIconSolid class="h-3 w-3" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900 truncate leading-tight">{{ p.nombreSocio }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5 leading-tight">
                  {{ p.cuotasVencidas }} {{ p.cuotasVencidas === 1 ? 'cuota' : 'cuotas' }}
                  · {{ p.diasMoraPrestamo }} {{ p.diasMoraPrestamo === 1 ? 'día' : 'días' }}
                </p>
              </div>
              <div class="text-right flex-shrink-0 pl-2">
                <p class="text-sm font-bold text-violet-600 tabular-nums leading-tight">${{ formatMoney(p.totalDeudaPrestamo) }}</p>
              </div>
            </button>
          </div>
        </div>

        <div
          class="space-y-3 border-t border-gray-200 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            class="w-full min-h-[48px] rounded-full border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 [-webkit-tap-highlight-color:transparent] touch-manipulation"
            @click="modalTodasLasAlertas = false"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalWrapper>

      <RechazarInvitacionConfirmModal
        :invitacion="invitacionARechazarCompacta"
        :loading="!!invitacionARechazarCompacta && procesandoInvitacionCompacta === invitacionARechazarCompacta.id"
        @close="cerrarModalRechazarInvitacionCompacta"
        @confirm="confirmarRechazarInvitacionCompacta"
      />
    </div>
    <!-- Componente ColaboradoresManager oculto para acceder a sus métodos -->
    <div class="hidden">
      <ColaboradoresManager
        ref="colaboradoresManagerRef"
        :natillera-id="id"
        :admin-id="natillera?.admin_id"
        :admin-email="adminActual?.email || ''"
        :admin-nombre="adminActual?.nombre || adminActual?.email || ''"
        :es-admin="esAdmin"
      />
    </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toPng } from 'html-to-image'
import { useNatillerasStore } from '../../stores/natilleras'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  PlusIcon,
  ArrowPathIcon,
  Bars3Icon,
  SparklesIcon,
  Squares2X2Icon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartPieIcon,
  CheckBadgeIcon,
} from '@heroicons/vue/24/outline'
import {
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  BanknotesIcon as BanknotesIconSolid,
} from '@heroicons/vue/24/solid'
import { useSociosStore } from '../../stores/socios'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useCuotasStore } from '../../stores/cuotas'
import { useAuthStore } from '../../stores/auth'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { getNatilleraAvatarUrl } from '../../utils/avatars'
import { supabase } from '../../lib/supabase'
import ColaboradoresManager from '../../components/ColaboradoresManager.vue'
import RechazarInvitacionConfirmModal from '../../components/RechazarInvitacionConfirmModal.vue'
import { useNotificationStore } from '../../stores/notifications'
import {
  formatearRolColaboradorInvitacion,
  emailInvitadorDestacado,
} from '../../utils/invitacionesColaborador'
import BackButton from '../../components/BackButton.vue'
import PiggyBankIcon from '../../components/icons/PiggyBankIcon.vue'
import LoadingScreen from '../../components/LoadingScreen.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useModalBodyScrollOverflow } from '../../composables/useModalBodyScrollOverflow'
import {
  pendingNatilleraSidebarAction,
  clearPendingNatilleraSidebarAction
} from '../../composables/useNatilleraSidebarActions'
import { markPendingPrimerSocioNavTourFromModal } from '../../composables/usePrimerSocioSociosNavTour'
import {
  shouldShowNatilleraDetalleNavTour,
  startNatilleraDetalleNavTour
} from '../../composables/useNatilleraDetalleNavTour'
import { formatDate, formatDateWithTime } from '../../utils/formatDate'
import { clearLastNatilleraId } from '../../utils/lastNatillera'
import { natilleraPrestamosDeshabilitados } from '../../utils/natilleraPrestamos'
const props = defineProps({
  id: String
})
const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const sociosStore = useSociosStore()
const configStore = useConfiguracionStore()
const cuotasStore = useCuotasStore()
const authStore = useAuthStore()
const colaboradoresStore = useColaboradoresStore()
const notificationStore = useNotificationStore()
const invitacionARechazarCompacta = ref(null)
const procesandoInvitacionCompacta = ref(null)
const dashboardSidebar = inject('dashboardSidebar', null)
const modalWhatsApp = ref(false)
const modalComprobanteEstadoSocio = ref(false)
const comprobanteEstadoSocio = ref(null)
const loadingEstadoSocio = ref(false)
const comprobanteEstadoRef = ref(null)
const generandoImagenEstadoSocio = ref(false)
const modalDetalle = ref(false)
const modalConfigMeses = ref(false)
const modalBuscarComprobante = ref(false)
const modalCuotasSocio = ref(false)
const animacionesCuotasMora = ref(true) // Controla si se muestran las animaciones de cuotas en mora
const modalSociosEnMora = ref(false)
/** Panel «Configuración de la natillera»: plegable en móvil y desktop */
const datosNatilleraConfigPanelAbierto = ref(false)

function toggleDatosNatilleraConfigPanel() {
  datosNatilleraConfigPanelAbierto.value = !datosNatilleraConfigPanelAbierto.value
}

/** Timeout que abre modales automáticos (sin socios, mora, recordatorio) tras cargar; se cancela al abrir comprobante estado socio */
let postCargaModalesTimeoutId = null
/** Tour menú lateral / inferior + acciones (primera visita a detalle) */
let detalleNavTourTimeoutId = null
let detalleNavTourIntentos = 0
/** Evita modales automáticos (sin socios, mora, recordatorio) mientras el recorrido está activo */
const recorridoDetalleNavActivo = ref(false)
/** Modales post-carga en cola hasta terminar o fallar el tour */
const modalesPostCargaRetenidosPorTour = ref(false)
const modalDesgloseUtilidades = ref(false)
const yaVioDesgloseUtilidades = ref(false)
const detalleRifasAbierto = ref(false)
const detalleRifas = ref({ loading: false, porMes: [] })
const totalesAcumuladosRifas = computed(() => {
  const porMes = detalleRifas.value?.porMes || []
  return porMes.reduce(
    (acc, b) => ({
      totalRecogido: acc.totalRecogido + (b.totalRecogido || 0),
      totalPremio: acc.totalPremio + (b.totalPremio || 0),
      totalUtilidad: acc.totalUtilidad + (b.totalUtilidad || 0)
    }),
    { totalRecogido: 0, totalPremio: 0, totalUtilidad: 0 }
  )
})
const rifasDesplegados = ref({})
const detalleOtrosAbierto = ref(false)
const detalleOtros = ref({ loading: false, porActividad: [] })
const otrosDesplegados = ref({})
const detalleSancionesAbierto = ref(false)
const detalleSanciones = ref({ loading: false, lista: [] })
const detallePrestamosAbierto = ref(false)
const detallePrestamos = ref({ loading: false, lista: [] })
const conceptoEnDesarrollo = ref(null)
const loadingCuotasSocio = ref(false)
const colaboradoresManagerRef = ref(null)
const vistaSimplificadaCuotas = ref(false)
const socioSeleccionado = ref(null)
const cuotasSocio = ref([])
const cuotasSocioPorMes = ref([])
const socioParaCuotas = ref(null)
const seccionActiva = ref('finanzas')
const busquedaSocio = ref('')
const codigoBusqueda = ref('')
const comprobanteEncontrado = ref(null)
const infoComprobanteAntiguo = ref(null)
const comprobanteNuevo = ref(null) // Guardar el comprobante nuevo cuando se encuentra uno antiguo
const desgloseAPagarAbierto = ref(false)
const desglosePagadoAbierto = ref(false)
const errorBusqueda = ref('')
const buscandoComprobante = ref(false)
const inputBusquedaRef = ref(null)
const seccionAlertasRef = ref(null) // Ya no se usa, pero se mantiene por compatibilidad
const bannerSociosEnMoraRef = ref(null)
const cuotasNatillera = ref([])
/** Movimientos extra (préstamos, actividades, rifas, liquidaciones) cargados en segundo plano */
const movimientosNatilleraExtra = ref([])
const sancionesPorCuota = ref({}) // Sanciones calculadas dinámicamente
const configSancionesActiva = ref(false)
const prestamosVencidos = ref([]) // Préstamos con cuotas vencidas agrupadas por socio
/** Un elemento por préstamo activo con al menos una cuota del plan vencida e impaga */
const prestamosEnMoraLista = ref([])
const modalSinSocios = ref(false) // Modal para cuando no hay socios
const modalTodasLasAlertas = ref(false)
const scrollAreaModalTodasLasAlertas = ref(null)
const scrollAreaModalSinSocios = ref(null)
const { tieneScroll: modalSinSociosTieneScroll } = useModalBodyScrollOverflow(
  modalSinSocios,
  scrollAreaModalSinSocios
)
// Recordatorio personal (solo usuario raigo.16@gmail.com) — persistidos en Supabase
const RECORDATORIO_EMAIL = 'raigo.16@gmail.com'
const RECORDATORIO_STORAGE_KEY_LEGACY = 'natillerapp_recordatorio' // migración desde localStorage
const showRecordatorioModal = ref(false)
const editandoRecordatorio = ref(false)
const recordatorioEdicion = ref('')
const recordatorioEdicionId = ref(null) // uuid al editar, null al crear
const listRecordatorios = ref([]) // { id, texto }[] desde Supabase
const loadingRecordatorios = ref(false)
const cargandoNatillera = ref(true) // Estado para la pantalla de carga completa
// Mensajes de carga que rotarán
const mensajesCarga = [
  'Calienta toda la suplencia...',
  'En poco estará todo listo',
  'Cargando datos de natilleras',
  'Ajustando condensador de flujo...',
  'Preparando todo para ti',
  'Cargando natillera...',
  'Abriendo el DRS',
  'Echandole mas agua a la sopa',
  'Poniendo neumaticos blandos',
  'Cargando informacion'
]
const mensajeCargaActual = ref(mensajesCarga[0])
let intervaloMensajeCarga = null
// Variable para mantener el índice anterior fuera del intervalo
let indiceMensajeAnterior = -1
// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalWhatsApp)
useBodyScrollLock(modalComprobanteEstadoSocio)
useBodyScrollLock(modalDetalle)
useBodyScrollLock(modalConfigMeses)
useBodyScrollLock(modalBuscarComprobante)
useBodyScrollLock(modalCuotasSocio)
useBodyScrollLock(modalSociosEnMora)
useBodyScrollLock(modalSinSocios)
useBodyScrollLock(modalTodasLasAlertas)
useBodyScrollLock(modalDesgloseUtilidades)
useBodyScrollLock(showRecordatorioModal)
// Obtener el ID de la natillera
const id = computed(() => props.id || route.params.id)

/** Todas las invitaciones pendientes (visibles en cualquier natillera que abra el socio) */
const misInvitacionesPendientesDetalle = computed(() => {
  const list = colaboradoresStore.misInvitaciones || []
  const nid = id.value
  const arr = [...list]
  if (nid) {
    arr.sort((a, b) => {
      const aHere = String(a.natillera_id) === String(nid) ? 0 : 1
      const bHere = String(b.natillera_id) === String(nid) ? 0 : 1
      return aHere - bHere
    })
  }
  return arr
})

function esInvitacionDeNatilleraActual(inv) {
  const nid = id.value
  if (!nid || !inv?.natillera_id) return false
  return String(inv.natillera_id) === String(nid)
}

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
const formConfigMeses = ref({
  mes_inicio: 1,
  mes_fin: 11,
  anio: new Date().getFullYear()
})
// Funciones para controlar el scroll del body
function bloquearScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}
function desbloquearScroll() {
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
}
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
function abrirConfigMeses() {
  formConfigMeses.value = {
    mes_inicio: natillera.value?.mes_inicio || 1,
    mes_fin: natillera.value?.mes_fin || 11,
    anio: natillera.value?.anio || new Date().getFullYear()
  }
  modalConfigMeses.value = true
}
function abrirFormularioInvitarColaborador() {
  if (colaboradoresManagerRef.value) {
    colaboradoresManagerRef.value.abrirModalInvitar()
  }
}
async function guardarConfigMeses() {
  const result = await natillerasStore.actualizarNatillera(props.id || route.params.id, {
    mes_inicio: formConfigMeses.value.mes_inicio,
    mes_fin: formConfigMeses.value.mes_fin,
    anio: formConfigMeses.value.anio
  })
  
  if (result.success) {
    modalConfigMeses.value = false
    // Recargar la natillera para ver los cambios
    natillerasStore.fetchNatillera(props.id || route.params.id)
  } else {
    alert('Error al guardar la configuración: ' + result.error)
  }
}
// Etiquetas cortas de meses (Nov, Oct, etc.)
const mesesCorto = { 1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic' }
// Computed para mostrar el rango de meses
const rangoMesesTexto = computed(() => {
  if (!natillera.value) return ''
  const inicio = meses.find(m => m.value === (natillera.value.mes_inicio || 1))?.label || 'Enero'
  const fin = meses.find(m => m.value === (natillera.value.mes_fin || 11))?.label || 'Noviembre'
  const anio = natillera.value.anio || new Date().getFullYear()
  return `${inicio} - ${fin} ${anio}`
})
// Rango de meses abreviado para la tarjeta (ej: Nov 2025 - Oct 2026)
const rangoMesesCorto = computed(() => {
  if (!natillera.value) return ''
  const mesInicio = natillera.value.mes_inicio || 1
  const mesFin = natillera.value.mes_fin || 11
  const anio = natillera.value.anio || new Date().getFullYear()
  return `${mesesCorto[mesInicio]} ${anio} - ${mesesCorto[mesFin]} ${anio}`
})
// Fecha de inicio completa con año (ej: Desde 01/11/2025)
const fechaInicioCorta = computed(() => {
  if (!natillera.value?.fecha_inicio) return ''
  const d = new Date(natillera.value.fecha_inicio)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `Desde ${day}/${month}/${year}`
})
// Socios filtrados por búsqueda en el modal de WhatsApp
const sociosFiltrados = computed(() => {
  if (!natillera.value?.socios_natillera) return []
  if (!busquedaSocio.value.trim()) return natillera.value.socios_natillera
  
  const busqueda = busquedaSocio.value.toLowerCase().trim()
  return natillera.value.socios_natillera.filter(sn => 
    sn.socio?.nombre?.toLowerCase().includes(busqueda) ||
    sn.socio?.telefono?.includes(busqueda)
  )
})
// Cuotas agrupadas por mes y año
const cuotasAgrupadasPorMes = computed(() => {
  if (!cuotasSocioPorMes.value || cuotasSocioPorMes.value.length === 0) return []
  
  const agrupadas = {}
  
  cuotasSocioPorMes.value.forEach(cuota => {
    const key = `${cuota.anio}-${cuota.mes}`
    if (!agrupadas[key]) {
      agrupadas[key] = {
        mes: cuota.mes,
        anio: cuota.anio,
        cuotas: []
      }
    }
    agrupadas[key].cuotas.push(cuota)
  })
  
  // Ordenar las cuotas dentro de cada grupo por quincena (si existe) o por fecha
  Object.keys(agrupadas).forEach(key => {
    agrupadas[key].cuotas.sort((a, b) => {
      if (a.quincena && b.quincena) {
        return a.quincena - b.quincena
      }
      if (a.quincena && !b.quincena) return -1
      if (!a.quincena && b.quincena) return 1
      return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
    })
  })
  
  // Convertir a array y ordenar por año y mes (más antiguo primero)
  return Object.values(agrupadas).sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio
    return a.mes - b.mes
  })
})
const natillera = computed(() => natillerasStore.natilleraActual)
// Verificar si la natillera tiene socios
const tieneSocios = computed(() => {
  return natillera.value?.socios_natillera && natillera.value.socios_natillera.length > 0
})
// Convertir nombre a Upper Camel Case (con espacios)
const nombreNatilleraPascalCase = computed(() => {
  if (!natillera.value?.nombre) return ''
  return natillera.value.nombre
    .split(/\s+/)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ')
})

const fondoTotalIndicador = computed(() => {
  return Math.max(
    0,
    (estadisticas.value.totalRecaudadoNetoInclParciales
      ?? estadisticas.value.totalRecaudadoNeto
      ?? estadisticas.value.totalAportado)
    - (estadisticas.value.egresosRecaudado ?? 0)
    + (estadisticas.value.ingresosRecaudado ?? 0)
  )
})

const utilidadNetoIndicador = computed(() => {
  const s = estadisticas.value
  return Math.max(
    0,
    (s.utilidadesRecogidas || 0)
    - (s.egresosUtilidades ?? 0)
    + (s.ingresosUtilidades ?? 0)
  )
})

/**
 * Colores del gráfico de utilidades: solo tonos vivos (sin carbón #453D45 ni teal oscuro #436E6E).
 * Se mantienen los ya usados (#E91E63, #90D15B, #F58231, #2EBA74) y se suman #73AA73, #B9E55D, #F47B3E.
 */
const COLORES_UTILIDAD_TIPO = {
  sanciones: '#E91E63',
  prestamos: '#73AA73',
  rifas: '#90D15B',
  bingo: '#F58231',
  venta: '#B9E55D',
  evento: '#2EBA74',
  otro: '#F47B3E',
  actividades_en_curso: '#2EBA74',
}

const COLORES_GRAFICO_UTILIDAD_ROTACION = [
  '#2EBA74',
  '#73AA73',
  '#B9E55D',
  '#F47B3E',
  '#90D15B',
  '#F58231',
  '#E91E63',
]

const utilidadesCategoriaGrafico = computed(() => {
  const raw = estadisticas.value.utilidadesDesglose || []
  const items = raw.filter((i) => (i.value || 0) > 0)
  const total = items.reduce((s, i) => s + (Number(i.value) || 0), 0)
  if (total <= 0) {
    return { segments: [], total: 0, conicGradient: 'conic-gradient(#e5e7eb 0% 100%)' }
  }
  const segments = items.map((i, idx) => {
    const value = Number(i.value) || 0
    const pct = (value / total) * 100
    const mapped = COLORES_UTILIDAD_TIPO[i.id]
    const color =
      mapped ||
      COLORES_GRAFICO_UTILIDAD_ROTACION[idx % COLORES_GRAFICO_UTILIDAD_ROTACION.length]
    return {
      id: i.id,
      label: i.label || i.id,
      value,
      pct,
      color,
    }
  })
  let acc = 0
  const stops = segments.map((s) => {
    const start = acc
    acc += s.pct
    return `${s.color} ${start}% ${acc}%`
  })
  return {
    segments,
    total,
    conicGradient: `conic-gradient(from -90deg, ${stops.join(', ')})`,
  }
})

/** Egresos/ingresos del rubro utilidades: el donut sigue siendo 100% «recogidas» por categoría; esto enlaza con el neto. */
const ajustesUtilidadesGrafico = computed(() => {
  const s = estadisticas.value
  const recogidas = Math.max(0, Number(s.utilidadesRecogidas) || 0)
  const egresos = Math.max(0, Number(s.egresosUtilidades) || 0)
  const ingresos = Math.max(0, Number(s.ingresosUtilidades) || 0)
  const neto = Math.max(0, recogidas - egresos + ingresos)
  return {
    recogidas,
    egresos,
    ingresos,
    neto,
    tieneAjustes: egresos > 0 || ingresos > 0,
  }
})

const sinActividadEnNatillera = computed(() =>
  sociosEnMora.value.length === 0 &&
  ultimosMovimientos.value.length === 0 &&
  utilidadesCategoriaGrafico.value.segments.length === 0
)

function formatFechaCorta(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Fin del ciclo según BD; si no hay fecha_fin, último día del mes_fin en anio (configuración). */
const fechaFinConfiguracionTexto = computed(() => {
  const n = natillera.value
  if (!n) return '—'
  if (n.fecha_fin) return formatFechaCorta(n.fecha_fin)
  const mes = Number(n.mes_fin ?? 12)
  const anio = Number(n.anio ?? new Date().getFullYear())
  if (!Number.isFinite(mes) || mes < 1 || mes > 12 || !Number.isFinite(anio)) return '—'
  const ultimo = new Date(anio, mes, 0)
  if (isNaN(ultimo.getTime())) return '—'
  const y = ultimo.getFullYear()
  const mo = String(ultimo.getMonth() + 1).padStart(2, '0')
  const da = String(ultimo.getDate()).padStart(2, '0')
  return formatFechaCorta(`${y}-${mo}-${da}`)
})

const etiquetaTipoSancionesNatillera = computed(() => {
  const t = (natillera.value?.reglas_multas?.sanciones?.tipo || '').toString().toLowerCase().trim()
  if (t === 'simple') return 'Simple (valor fijo)'
  if (t === 'escalonada') return 'Escalonada'
  if (t === 'diaria') return 'Diaria (por día)'
  if (t) return t
  return '—'
})

/** Intereses adicionales por días y/o devolución por mora (reglas_multas.sanciones). */
const sancionesAdicionalesNatilleraResumen = computed(() => {
  const s = natillera.value?.reglas_multas?.sanciones
  if (!s) return { activas: false, texto: 'No' }
  const intereses = !!s.interesesAdicionales?.activo
  const devolucion = !!s.devolucion?.activo
  if (!intereses && !devolucion) return { activas: false, texto: 'No' }
  const partes = []
  if (intereses) partes.push('intereses adicionales por días')
  if (devolucion) partes.push('devolución por mora excesiva')
  return { activas: true, texto: partes.join(' · ') }
})

function _isoOrdenMovimiento(s) {
  const t = (s || '').toString().trim()
  return t || '1970-01-01T00:00:00.000Z'
}

/** Milisegundos para ordenar movimientos solo por tiempo (más reciente primero). */
function _tsOrdenMovimiento(isoOTexto) {
  const raw = (isoOTexto || '').toString().trim()
  if (!raw) return 0
  let ms = Date.parse(raw)
  if (!Number.isFinite(ms) && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    ms = Date.parse(`${raw}T12:00:00`)
  }
  return Number.isFinite(ms) ? ms : 0
}

function tooltipTextoUltimoMovimiento(mov) {
  const a = (mov?.estadoEtiqueta || '').toString().trim()
  const b = (mov?.periodo || '').toString().trim()
  if (a && b) return `${a} — ${b}`
  return a || b || ''
}

/** Estilos compactos y legibles para la columna «Tipo» (badges). Colores por categoría bien diferenciados. */
function clasesBadgeUltimoMov(estado) {
  const base =
    'inline-flex min-w-0 max-w-[6.85rem] sm:max-w-[10.25rem] items-center justify-center rounded-md border px-2 py-1 text-[10px] sm:text-[11px] font-semibold leading-tight shadow-sm truncate whitespace-nowrap'
  const porEstado = {
    // Cuota pagada: verde natillera
    pago_cuota: 'border-green-500/35 bg-green-50 text-green-950',
    pago_cuota_parcial: 'border-blue-400/70 bg-blue-50 text-blue-950',
    pagado: 'border-green-500/35 bg-green-50 text-green-950',
    mora: 'border-orange-400/80 bg-orange-50 text-orange-950',
    parcial: 'border-blue-400/70 bg-blue-50 text-blue-950',
    // Préstamos: violeta (abono) vs índigo (otorgamiento)
    abono_prestamo: 'border-purple-400/75 bg-purple-50 text-purple-950',
    prestamo_nuevo: 'border-indigo-400/80 bg-indigo-100 text-indigo-950',
    // Actividades: turquesa · Rifas: fucsia (no confundir con egreso rojo)
    pago_actividad: 'border-teal-400/80 bg-teal-50 text-teal-950',
    pago_rifa: 'border-fuchsia-400/75 bg-fuchsia-50 text-fuchsia-950',
    // Liquidación: ámbar (cierre), distinto del verde de cuota
    liquidacion: 'border-amber-400/90 bg-amber-100 text-amber-950',
    // Caja: cian (entra) vs rojo (sale), distintos del azul parcial y del fucsia rifa
    ingreso_fondo: 'border-cyan-400/85 bg-cyan-50 text-cyan-950',
    egreso_fondo: 'border-red-400/90 bg-red-50 text-red-950',
  }
  return [base, porEstado[estado] || 'border-slate-300 bg-slate-100 text-slate-900']
}

async function cargarMovimientosRecientesNatillera(natilleraId) {
  if (!natilleraId) {
    movimientosNatilleraExtra.value = []
    return
  }
  try {
    // Ronda 1: obtener IDs de socios (necesario para queries de préstamos)
    const { data: snRows, error: errSn } = await supabase
      .from('socios_natillera')
      .select('id')
      .eq('natillera_id', natilleraId)
    if (errSn) throw errSn
    const socioNatilleraIds = (snRows || []).map(r => r.id)
    const out = []

    // Ronda 2: todas las queries independientes en paralelo
    const [prestamosRes, liquidadasRes, saRes, movsFondoRes] = await Promise.all([
      socioNatilleraIds.length > 0
        ? supabase.from('prestamos')
            .select('id, monto, created_at, socio_natillera:socios_natillera(socio:socios(nombre))')
            .in('socio_natillera_id', socioNatilleraIds)
            .order('created_at', { ascending: false })
            .limit(30)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('actividades')
        .select('id, descripcion, tipo, estado, utilidad, ingresos, updated_at, created_at')
        .eq('natillera_id', natilleraId)
        .eq('estado', 'liquidada')
        .order('updated_at', { ascending: false })
        .limit(30),
      supabase.from('socios_actividad')
        .select(`
          id, valor_pagado, updated_at, created_at,
          actividad:actividades!inner(id, descripcion, tipo, estado, natillera_id),
          socio_natillera:socios_natillera(socio:socios(nombre))
        `)
        .eq('actividad.natillera_id', natilleraId)
        .gt('valor_pagado', 0)
        .order('updated_at', { ascending: false })
        .limit(45),
      supabase.from('movimientos_fondo')
        .select('id, tipo, monto, forma_pago, descripcion, fecha, origen_egreso, destino_ingreso, created_at, updated_at')
        .eq('natillera_id', natilleraId)
        .order('created_at', { ascending: false })
        .limit(55)
    ])

    // Procesar préstamos
    const prestList = prestamosRes.data || []
    const prestamoIds = prestList.map(p => p.id)
    const nombrePorPrestamo = new Map(
      prestList.map(p => [p.id, p.socio_natillera?.socio?.nombre || 'Socio'])
    )
    for (const p of prestList) {
      out.push({
        id: `prestamo-nuevo-${p.id}`,
        sortAt: _isoOrdenMovimiento(p.created_at),
        nombre: nombrePorPrestamo.get(p.id) || 'Socio',
        periodo: 'Préstamo otorgado',
        monto: Number(p.monto) || 0,
        estado: 'prestamo_nuevo',
        estadoEtiqueta: 'Préstamo',
      })
    }

    // Ronda 3: pagos de préstamo (depende de prestamoIds)
    if (prestamoIds.length > 0) {
      const { data: pagosPrest, error: errPp } = await supabase
        .from('pagos_prestamo')
        .select('id, valor, fecha, prestamo_id')
        .in('prestamo_id', prestamoIds)
        .order('fecha', { ascending: false })
        .limit(45)
      if (!errPp && pagosPrest) {
        for (const pay of pagosPrest) {
          out.push({
            id: `pago-prestamo-${pay.id}`,
            sortAt: _isoOrdenMovimiento(pay.fecha),
            nombre: nombrePorPrestamo.get(pay.prestamo_id) || 'Socio',
            periodo: 'Abono a préstamo',
            monto: Number(pay.valor) || 0,
            estado: 'abono_prestamo',
            estadoEtiqueta: 'Abono prést.',
          })
        }
      }
    }

    // Procesar actividades liquidadas
    if (!liquidadasRes.error) {
      for (const a of liquidadasRes.data || []) {
        const util = Number(a.utilidad)
        const ing = Number(a.ingresos)
        const raw = Number.isFinite(util) && util !== 0 ? util : ing
        const monto = Math.max(0, Number.isFinite(raw) ? raw : 0)
        const tipo = (a.tipo || '').toLowerCase()
        const esRifa = tipo === 'rifa'
        out.push({
          id: `liq-act-${a.id}`,
          sortAt: _isoOrdenMovimiento(a.updated_at || a.created_at),
          nombre: '—',
          periodo: `${esRifa ? 'Rifa liquidada' : 'Actividad liquidada'} · ${(a.descripcion || 'Sin título').trim() || 'Sin título'}`,
          monto,
          estado: 'liquidacion',
          estadoEtiqueta: esRifa ? 'Liq. rifa' : 'Liquidación',
        })
      }
    }

    // Procesar pagos de actividad
    if (!saRes.error && saRes.data) {
      for (const sa of saRes.data) {
        const act = sa.actividad
        const tipoAct = (act?.tipo || '').toLowerCase()
        const esRifa = tipoAct === 'rifa'
        out.push({
          id: `pago-act-sa-${sa.id}`,
          sortAt: _isoOrdenMovimiento(sa.updated_at || sa.created_at),
          nombre: sa.socio_natillera?.socio?.nombre || 'Socio',
          periodo: (act?.descripcion || 'Actividad').trim() || 'Actividad',
          monto: Number(sa.valor_pagado) || 0,
          estado: esRifa ? 'pago_rifa' : 'pago_actividad',
          estadoEtiqueta: esRifa ? 'Rifa' : 'Actividad',
        })
      }
    }

    // Procesar movimientos de fondo
    if (!movsFondoRes.error && movsFondoRes.data) {
      for (const m of movsFondoRes.data) {
        const tipoMov = (m.tipo || '').toLowerCase()
        if (tipoMov !== 'salida' && tipoMov !== 'entrada') continue
        const raw = Number(m.monto) || 0
        const abs = Math.abs(raw)
        const esSalida = tipoMov === 'salida'
        const montoSigned = esSalida ? -abs : abs
        const fp = (m.forma_pago || '').toString().toLowerCase()
        const formaTxt =
          fp === 'efectivo' ? 'Efectivo' :
          fp === 'transferencia' ? 'Transferencia' :
          (m.forma_pago || '—').toString()
        const orig = (m.origen_egreso || '').toString().toLowerCase()
        const dest = (m.destino_ingreso || '').toString().toLowerCase()
        let estado = ''
        let estadoEtiqueta = ''
        if (esSalida) {
          estado = 'egreso_fondo'
          estadoEtiqueta =
            orig === 'utilidades' ? 'Egreso util.' :
            orig === 'recaudado' ? 'Egreso caja' :
            'Egreso'
        } else {
          estado = 'ingreso_fondo'
          estadoEtiqueta =
            dest === 'utilidades' ? 'Ingreso util.' :
            dest === 'recaudado' ? 'Ingreso caja' :
            'Ingreso'
        }
        const desc = (m.descripcion || '').toString().trim() || 'Movimiento de fondo'
        const fechaIso =
          m.created_at ||
          m.updated_at ||
          (m.fecha ? `${String(m.fecha).slice(0, 10)}T12:00:00` : '')
        out.push({
          id: `mf-${m.id}`,
          sortAt: _isoOrdenMovimiento(fechaIso),
          nombre: 'Fondo',
          periodo: `${desc} · ${formaTxt}`,
          monto: montoSigned,
          estado,
          estadoEtiqueta,
        })
      }
    }

    movimientosNatilleraExtra.value = out
  } catch (e) {
    console.warn('Error cargando movimientos recientes de la natillera:', e)
    movimientosNatilleraExtra.value = []
  }
}

const ultimosMovimientos = computed(() => {
  const items = []
  const cuotas = cuotasNatillera.value || []
  for (const c of cuotas) {
    const est = (c.estado || 'pendiente').toLowerCase()
    // En BD / store la cuota pagada es «pagada» (no «pagado»).
    const esCuotaPagadaCompleta = est === 'pagada' || est === 'pagado'
    // Pago parcial: estado explícito O cuota con abono parcial (valor_pagado > 0 pero < valor_cuota)
    const valorPagado = Number(c.valor_pagado) || 0
    const valorCuota = Number(c.valor_cuota) || 0
    const esCuotaParcial = est === 'parcial' || (!esCuotaPagadaCompleta && valorPagado > 0 && valorPagado < valorCuota)
    if (!esCuotaPagadaCompleta && !esCuotaParcial) continue
    const nombreSocio =
      (c.socio_natillera?.socio?.nombre || '').trim() ||
      (c.nombre_socio || '').trim() ||
      'Socio'
    const sortAt = _isoOrdenMovimiento(c.fecha_pago || c.updated_at || c.created_at)
    const q = c.quincena ? `Q${c.quincena} ` : ''
    const mesNombre = mesesCorto[c.mes] || ''
    const montoCuota = Math.max(0, Number(c.valor_pagado) || 0) || Math.max(0, Number(c.valor_cuota) || 0)
    items.push({
      id: `cuota-${c.id}`,
      sortAt,
      nombre: nombreSocio,
      periodo: `${q}${mesNombre} ${c.anio || ''}`.trim() || 'Cuota',
      monto: montoCuota,
      estado: esCuotaPagadaCompleta ? 'pago_cuota' : 'pago_cuota_parcial',
      estadoEtiqueta: esCuotaPagadaCompleta ? 'Cuota' : 'Parcial',
    })
  }
  for (const m of movimientosNatilleraExtra.value || []) {
    items.push({ ...m })
  }
  // Solo por fecha/hora (más reciente arriba); sin agrupar por tipo. Desempate estable por id.
  items.sort((a, b) => {
    const tb = _tsOrdenMovimiento(b.sortAt)
    const ta = _tsOrdenMovimiento(a.sortAt)
    if (tb !== ta) return tb - ta
    return String(b.id).localeCompare(String(a.id))
  })
  return items.slice(0, 6).map(({ sortAt: _s, ...rest }) => rest)
})

// Usuario autenticado y admin
const usuarioAutenticado = ref(null)
const adminActual = ref(null)
const miRol = ref(null)
const misPermisos = ref(null)
// Verificar si el usuario es superusuario
const esSuperUsuario = computed(() => {
  if (!usuarioAutenticado.value) return false
  const email = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  return email === 'raigo.16@gmail.com'
})
// Verificar si el usuario es admin de la natillera
const esAdmin = computed(() => {
  if (!usuarioAutenticado.value || !natillera.value) return false
  return natillera.value.admin_id === usuarioAutenticado.value.id || esSuperUsuario.value
})

async function refrescarRolYPermisosTrasInvitacionAceptada() {
  const natilleraId = id.value
  if (!natilleraId || !natillera.value) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (esAdmin.value) return
  try {
    const [rol, permisos] = await Promise.all([
      colaboradoresStore.obtenerMiRol(natilleraId),
      colaboradoresStore.obtenerMisPermisos(natilleraId, { user, skipAdminCheck: true })
    ])
    miRol.value = rol
    misPermisos.value = permisos
  } catch (e) {
    console.warn('Error refrescando rol tras aceptar invitación:', e)
  }
}

function abrirModalRechazarInvitacionCompacta(inv) {
  if (inv) invitacionARechazarCompacta.value = inv
}

function cerrarModalRechazarInvitacionCompacta() {
  if (procesandoInvitacionCompacta.value) return
  invitacionARechazarCompacta.value = null
}

async function confirmarRechazarInvitacionCompacta() {
  const inv = invitacionARechazarCompacta.value
  if (!inv) return
  try {
    procesandoInvitacionCompacta.value = inv.id
    const resultado = await colaboradoresStore.rechazarInvitacion(inv.token_invitacion)
    if (resultado.success) {
      invitacionARechazarCompacta.value = null
      notificationStore.info('Invitación rechazada')
      await colaboradoresStore.fetchMisInvitaciones()
    } else {
      notificationStore.error(resultado.error || 'Error al rechazar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al rechazar la invitación')
  } finally {
    procesandoInvitacionCompacta.value = null
  }
}

async function aceptarInvitacionCompacta(inv) {
  if (!inv) return
  try {
    procesandoInvitacionCompacta.value = inv.id
    const resultado = await colaboradoresStore.aceptarInvitacion(inv.token_invitacion)
    if (resultado.success) {
      notificationStore.success(
        `¡Ahora eres colaborador de "${resultado.data.natillera_nombre}"!`,
        'Invitación aceptada'
      )
      await natillerasStore.fetchNatillerasCompartidas()
      await colaboradoresStore.fetchMisInvitaciones()
      await refrescarRolYPermisosTrasInvitacionAceptada()
    } else {
      notificationStore.error(resultado.error || 'Error al aceptar la invitación')
    }
  } catch (e) {
    notificationStore.error(e.message || 'Error al aceptar la invitación')
  } finally {
    procesandoInvitacionCompacta.value = null
  }
}

// Recordatorio personal: solo disponible para raigo.16@gmail.com
const puedeUsarRecordatorio = computed(() => authStore.userEmail === RECORDATORIO_EMAIL)

async function fetchRecordatorios() {
  const user = usuarioAutenticado.value || authStore.user
  const userId = user?.id
  const natilleraId = id.value
  if (!userId || !natilleraId) return
  loadingRecordatorios.value = true
  try {
    const { data, error } = await supabase
      .from('recordatorios_usuario')
      .select('id, texto, created_at')
      .eq('user_id', userId)
      .eq('natillera_id', natilleraId)
      .order('created_at', { ascending: true })
    if (error) throw error
    listRecordatorios.value = (data || []).map(r => ({ id: r.id, texto: r.texto }))
    // Migrar datos antiguos de localStorage una sola vez (se guardan en la natillera actual)
    if (listRecordatorios.value.length === 0 && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(RECORDATORIO_STORAGE_KEY_LEGACY)
      if (raw?.trim()) {
        const textos = raw.startsWith('[') ? (() => { try { return JSON.parse(raw).filter(Boolean) } catch { return [raw] } })() : [raw]
        for (const texto of textos) {
          if (!String(texto).trim()) continue
          await supabase.from('recordatorios_usuario').insert({ user_id: userId, natillera_id: natilleraId, texto: String(texto).trim() })
        }
        if (textos.length > 0) {
          localStorage.removeItem(RECORDATORIO_STORAGE_KEY_LEGACY)
          const { data: data2 } = await supabase.from('recordatorios_usuario').select('id, texto').eq('user_id', userId).eq('natillera_id', natilleraId).order('created_at', { ascending: true })
          listRecordatorios.value = (data2 || []).map(r => ({ id: r.id, texto: r.texto }))
        }
      }
    }
  } catch (e) {
    console.warn('Error cargando recordatorios:', e)
  } finally {
    loadingRecordatorios.value = false
  }
}

function abrirRecordatorioParaEditar(indice) {
  recordatorioEdicionId.value = indice >= 0 && listRecordatorios.value[indice] ? listRecordatorios.value[indice].id : null
  recordatorioEdicion.value = indice >= 0 && listRecordatorios.value[indice] ? listRecordatorios.value[indice].texto : ''
  editandoRecordatorio.value = true
}

async function guardarRecordatorio() {
  const texto = (recordatorioEdicion.value || '').trim()
  const user = usuarioAutenticado.value || authStore.user
  const userId = user?.id
  if (!userId) return
  const natilleraId = id.value
  if (!natilleraId) return
  try {
    const recordatorioId = recordatorioEdicionId.value
    if (recordatorioId) {
      if (texto) {
        const { error } = await supabase.from('recordatorios_usuario').update({ texto }).eq('id', recordatorioId).eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('recordatorios_usuario').delete().eq('id', recordatorioId).eq('user_id', userId)
        if (error) throw error
      }
    } else if (texto) {
      const { error } = await supabase.from('recordatorios_usuario').insert({ user_id: userId, natillera_id: natilleraId, texto })
      if (error) throw error
    }
    await fetchRecordatorios()
    recordatorioEdicionId.value = null
    editandoRecordatorio.value = false
    showRecordatorioModal.value = false
  } catch (e) {
    console.warn('Error guardando recordatorio:', e)
  }
}

async function eliminarRecordatorio(id) {
  const user = usuarioAutenticado.value || authStore.user
  if (!user?.id) return
  try {
    const { error } = await supabase.from('recordatorios_usuario').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    listRecordatorios.value = listRecordatorios.value.filter(r => r.id !== id)
    if (recordatorioEdicionId.value === id) {
      recordatorioEdicionId.value = null
      editandoRecordatorio.value = false
    }
  } catch (e) {
    console.warn('Error eliminando recordatorio:', e)
  }
}

function cerrarRecordatorioModal() {
  showRecordatorioModal.value = false
  editandoRecordatorio.value = false
  recordatorioEdicionId.value = null
}

function cancelarEdicionRecordatorio() {
  editandoRecordatorio.value = false
  recordatorioEdicionId.value = null
}

async function abrirModalRecordatorio() {
  recordatorioEdicionId.value = null
  recordatorioEdicion.value = ''
  await fetchRecordatorios()
  editandoRecordatorio.value = listRecordatorios.value.length === 0
  showRecordatorioModal.value = true
}
// Verificar si el usuario es visor
const esVisor = computed(() => {
  return miRol.value === 'visor'
})
// Computed properties para verificar permisos específicos
const puedeVerSocios = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.editar_socios === true
})
const puedeVerCuotas = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.gestionar_cuotas === true
})
const puedeVerPrestamos = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.gestionar_prestamos === true
})
const puedeVerActividades = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.gestionar_actividades === true
})
const puedeConfigurar = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.configurar === true
})
const puedeBuscarComprobante = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.buscar_comprobante === true
})
const puedeInvitarColaboradores = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.invitar_colaboradores === true
})
const puedeNotificar = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.notificar === true
})
// Cargar información del administrador actual
async function cargarAdminActual() {
  if (!natillera.value?.admin_id) return
  try {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, email, nombre')
      .eq('id', natillera.value.admin_id)
      .single()
    adminActual.value = data
  } catch (e) {
    console.error('Error cargando administrador actual:', e)
  }
}
// Función para buscar comprobante
// Función auxiliar para calcular el total a pagar de una cuota incluyendo todos los conceptos
async function calcularTotalAPagarCompleto(cuota) {
  if (!cuota || !cuota.socio_natillera_id) {
    return {
      totalAPagar: 0,
      desglose: {
        cuota: 0,
        sancion: 0,
        actividades: 0,
        prestamos: 0
      }
    }
  }
  // Valor de la cuota base
  const valorCuota = parseFloat(cuota.valor_cuota || 0)
  
  // Sanciones: respetar no_calcular_multa; usar valor_multa si existe, o 0 si está en mora sin valor persistido
  const tieneNoCalcularMulta = !!(cuota.no_calcular_multa)
  let valorSancion = 0
  if (!tieneNoCalcularMulta) {
    if (cuota.valor_multa != null && parseFloat(cuota.valor_multa) > 0) {
      valorSancion = parseFloat(cuota.valor_multa)
    }
    // Si está en mora y no hay valor_multa, se deja en 0 (debe persistirse vía recalcularMultasCuotasMora antes de consultar)
  }
  
  // Obtener mes y año de la cuota
  let mesCuota = cuota.mes
  let anioCuota = cuota.anio
  let quincenaCuota = cuota.quincena || 0
  if ((mesCuota == null || anioCuota == null) && cuota.fecha_limite) {
    const partes = String(cuota.fecha_limite).split('-')
    if (partes.length >= 2) {
      anioCuota = parseInt(partes[0], 10)
      mesCuota = parseInt(partes[1], 10)
    }
  }
  let valorActividades = 0
  let valorPrestamos = 0
  // Calcular actividades pendientes del mismo periodo
  if (mesCuota != null && anioCuota != null) {
    try {
      const { data: sociosActividadData } = await supabase
        .from('socios_actividad')
        .select('valor_asignado, valor_pagado, quincena_pago')
        .eq('socio_natillera_id', cuota.socio_natillera_id)
        .eq('mes_pago', mesCuota)
        .eq('anio_pago', anioCuota)
        .in('estado', ['pendiente', 'parcial', 'mora', 'pagada', 'pagado'])
      if (sociosActividadData && sociosActividadData.length > 0) {
        // Filtrar actividades que corresponden a esta cuota (misma quincena)
        const actividadesDelPeriodo = sociosActividadData.filter(sa => {
          // Si la cuota es mensual (quincena 0 o null), la actividad debe tener quincena_pago 0 o null
          // Si la cuota es quincenal, la actividad debe tener la misma quincena
          const quincenaActividad = sa.quincena_pago ?? 0
          if (quincenaCuota === 0 || quincenaCuota === null) {
            return quincenaActividad === 0 || quincenaActividad === null
          }
          return quincenaActividad === quincenaCuota
        })
        // Calcular el valor total de actividades (valor_asignado, no pendiente)
        valorActividades = actividadesDelPeriodo.reduce((sum, sa) => {
          const valorAsignado = parseFloat(sa.valor_asignado || 0)
          return sum + valorAsignado
        }, 0)
      }
    } catch (error) {
      console.error('Error calculando actividades a pagar:', error)
    }
    // Calcular cuotas de préstamos pendientes del mismo periodo
    try {
      // Obtener préstamos del socio
      const { data: prestamosSocio } = await supabase
        .from('prestamos')
        .select('id, periodicidad')
        .eq('socio_natillera_id', cuota.socio_natillera_id)
        .in('estado', ['activo', 'pagado'])
      if (prestamosSocio && prestamosSocio.length > 0) {
        const prestamoIds = prestamosSocio.map(p => p.id)
        // Crear un mapa de préstamo_id -> periodicidad para acceso rápido
        const periodicidadPorPrestamo = new Map(prestamosSocio.map(p => [p.id, p.periodicidad || 'mensual']))
        
        // Buscar cuotas de préstamos pendientes que corresponden al periodo de la cuota
        const fechaInicioPeriodo = new Date(anioCuota, mesCuota - 1, 1)
        const fechaFinPeriodo = new Date(anioCuota, mesCuota, 0, 23, 59, 59)
        
        // Obtener todas las cuotas pendientes de los préstamos
        const { data: planPagosData } = await supabase
          .from('plan_pagos_prestamo')
          .select('valor_cuota, fecha_proyectada, prestamo_id')
          .in('prestamo_id', prestamoIds)
          .eq('pagada', false)
          .gte('fecha_proyectada', fechaInicioPeriodo.toISOString())
          .lte('fecha_proyectada', fechaFinPeriodo.toISOString())
        if (planPagosData && planPagosData.length > 0) {
          // Filtrar cuotas que corresponden al periodo según la periodicidad del préstamo
          const cuotasDelPeriodo = planPagosData.filter(cuotaPrestamo => {
            const fechaProyectada = new Date(cuotaPrestamo.fecha_proyectada)
            const mesProyectado = fechaProyectada.getMonth() + 1
            const anioProyectado = fechaProyectada.getFullYear()
            
            // Verificar si corresponde al mismo mes y año
            if (mesProyectado === mesCuota && anioProyectado === anioCuota) {
              const periodicidad = periodicidadPorPrestamo.get(cuotaPrestamo.prestamo_id) || 'mensual'
              
              // Si el préstamo es mensual, incluir todas las cuotas del mes
              if (periodicidad === 'mensual') {
                return true
              }
              
              // Si el préstamo es quincenal, verificar la quincena
              if (periodicidad === 'quincenal') {
                const dia = fechaProyectada.getDate()
                const quincenaProyectada = dia <= 15 ? 1 : 2
                return quincenaProyectada === quincenaCuota
              }
              
              return true
            }
            return false
          })
          valorPrestamos = cuotasDelPeriodo.reduce((sum, cp) => {
            return sum + (parseFloat(cp.valor_cuota) || 0)
          }, 0)
        }
      }
    } catch (error) {
      console.error('Error calculando préstamos a pagar:', error)
    }
  }
  const totalAPagar = valorCuota + valorSancion + valorActividades + valorPrestamos
  return {
    totalAPagar,
    desglose: {
      cuota: valorCuota,
      sancion: valorSancion,
      actividades: valorActividades,
      prestamos: valorPrestamos
    }
  }
}
// Función auxiliar para calcular el total pagado de una cuota incluyendo todos los conceptos
async function calcularTotalPagadoCompleto(cuota) {
  if (!cuota || !cuota.socio_natillera_id) {
    return {
      totalPagado: 0,
      desglose: {
        cuota: 0,
        sancion: 0,
        actividades: 0,
        prestamos: 0
      }
    }
  }
  // Valor pagado de la cuota base
  const valorPagadoCuota = parseFloat(cuota.valor_pagado || 0)
  
  // Valor pagado de sanciones
  const valorPagadoSancion = parseFloat(cuota.valor_pagado_sancion || 0)
  
  // Obtener mes y año de la cuota
  let mesCuota = cuota.mes
  let anioCuota = cuota.anio
  if ((mesCuota == null || anioCuota == null) && cuota.fecha_limite) {
    const partes = String(cuota.fecha_limite).split('-')
    if (partes.length >= 2) {
      anioCuota = parseInt(partes[0], 10)
      mesCuota = parseInt(partes[1], 10)
    }
  }
  let valorPagadoActividades = 0
  let valorPagadoPrestamos = 0

  // 1) Actividades pagadas del mismo periodo (se mantienen como antes, por mes/año)
  if (mesCuota != null && anioCuota != null) {
    try {
      const { data: sociosActividadData } = await supabase
        .from('socios_actividad')
        .select('valor_pagado')
        .eq('socio_natillera_id', cuota.socio_natillera_id)
        .eq('mes_pago', mesCuota)
        .eq('anio_pago', anioCuota)
        .in('estado', ['pagada', 'pagado'])
        .gt('valor_pagado', 0)
      if (sociosActividadData && sociosActividadData.length > 0) {
        valorPagadoActividades = sociosActividadData.reduce((sum, sa) => {
          return sum + (parseFloat(sa.valor_pagado) || 0)
        }, 0)
      }
    } catch (error) {
      console.error('Error calculando actividades pagadas:', error)
    }
  }

  // 2) Préstamos: PRIORIDAD = historial de ESTA cuota (monto pagado por préstamos en esta cuota)
  if (cuota.id) {
    try {
      const { data: historialRows } = await supabase
        .from('historial_pagos_cuota')
        .select('valor_cuotas_prestamo')
        .eq('cuota_id', cuota.id)
      if (historialRows && historialRows.length > 0) {
        valorPagadoPrestamos = historialRows.reduce((s, r) => s + (parseFloat(r.valor_cuotas_prestamo) || 0), 0)
      }
    } catch (e) {
      console.warn('Error obteniendo valor préstamos desde historial_pagos_cuota:', e)
    }
  }

  // 3) Fallback antiguo: si por alguna razón no hay historial (comprobantes viejos),
  // usar las cuotas de préstamo totalmente pagadas del periodo, como antes.
  if (valorPagadoPrestamos === 0 && mesCuota != null && anioCuota != null) {
    try {
      const { data: prestamosSocio } = await supabase
        .from('prestamos')
        .select('id')
        .eq('socio_natillera_id', cuota.socio_natillera_id)
        .in('estado', ['activo', 'pagado'])
      if (prestamosSocio && prestamosSocio.length > 0) {
        const prestamoIds = prestamosSocio.map(p => p.id)

        const fechaInicioPeriodo = new Date(anioCuota, mesCuota - 1, 1)
        const fechaFinPeriodo = new Date(anioCuota, mesCuota, 0, 23, 59, 59)

        let cuotasPrestamosData = null
        if (cuota.fecha_pago) {
          const fechaPagoCuota = new Date(cuota.fecha_pago)
          fechaPagoCuota.setHours(0, 0, 0, 0)
          const fechaFinDia = new Date(fechaPagoCuota)
          fechaFinDia.setHours(23, 59, 59, 999)

          const { data } = await supabase
            .from('plan_pagos_prestamo')
            .select('valor_pagado')
            .in('prestamo_id', prestamoIds)
            .eq('pagada', true)
            .gte('fecha_pago', fechaPagoCuota.toISOString())
            .lte('fecha_pago', fechaFinDia.toISOString())
          cuotasPrestamosData = data
        } else {
          const { data } = await supabase
            .from('plan_pagos_prestamo')
            .select('valor_pagado')
            .in('prestamo_id', prestamoIds)
            .eq('pagada', true)
            .gte('fecha_pago', fechaInicioPeriodo.toISOString())
            .lte('fecha_pago', fechaFinPeriodo.toISOString())
          cuotasPrestamosData = data
        }

        if (cuotasPrestamosData && cuotasPrestamosData.length > 0) {
          valorPagadoPrestamos = cuotasPrestamosData.reduce((sum, cp) => {
            return sum + (parseFloat(cp.valor_pagado) || 0)
          }, 0)
        }
      }
    } catch (error) {
      console.error('Error calculando préstamos pagados (fallback periodo):', error)
    }
  }
  const totalPagado = valorPagadoCuota + valorPagadoSancion + valorPagadoActividades + valorPagadoPrestamos
  return {
    totalPagado,
    desglose: {
      cuota: valorPagadoCuota,
      sancion: valorPagadoSancion,
      actividades: valorPagadoActividades,
      prestamos: valorPagadoPrestamos
    }
  }
}
async function buscarComprobante() {
  if (!codigoBusqueda.value.trim()) return
  
  buscandoComprobante.value = true
  errorBusqueda.value = ''
  comprobanteEncontrado.value = null
  infoComprobanteAntiguo.value = null
  comprobanteNuevo.value = null
  
  try {
    // Primero buscar en cuotas
    const result = await cuotasStore.buscarCuotaPorCodigo(id.value, codigoBusqueda.value.trim())
    
    if (result.success) {
      let cuotaParaCalcular = result.data
      // Si la cuota está en mora y no tiene sanción persistida, recalcular multas para que valor_multa quede actualizado
      const enMoraSinMulta = (cuotaParaCalcular.estado === 'mora' || cuotaParaCalcular.estadoReal === 'mora') &&
        !cuotaParaCalcular.no_calcular_multa &&
        (cuotaParaCalcular.valor_multa == null || parseFloat(cuotaParaCalcular.valor_multa) === 0)
      if (enMoraSinMulta) {
        await cuotasStore.recalcularMultasCuotasMora(id.value)
        const { data: cuotaActualizada } = await supabase
          .from('cuotas')
          .select('*')
          .eq('id', cuotaParaCalcular.id)
          .maybeSingle()
        if (cuotaActualizada) {
          cuotaParaCalcular = { ...cuotaParaCalcular, ...cuotaActualizada }
        }
      }
      // Calcular el total pagado completo y el total a pagar completo incluyendo todos los conceptos (cuota + sanciones + actividades + préstamos)
      const totalPagadoCompleto = await calcularTotalPagadoCompleto(cuotaParaCalcular)
      const totalAPagarCompleto = await calcularTotalAPagarCompleto(cuotaParaCalcular)
      
      // Si es un comprobante antiguo, mostrar información del código anterior
      if (result.esAntiguo && result.historial) {
        infoComprobanteAntiguo.value = result.historial
        comprobanteNuevo.value = cuotaParaCalcular // Guardar el nuevo comprobante para cuando se consulte
        
        // Crear un objeto con la información del comprobante antiguo basado en el historial
        // Mostramos la información como era antes de la actualización
        comprobanteEncontrado.value = {
          ...cuotaParaCalcular, // Mantener toda la información de la cuota (socio, descripción, valor_multa actualizado, etc.)
          codigo_comprobante: result.historial.codigoAnterior, // Código anterior
          valor_pagado: result.historial.valorPagadoAnterior, // Valor pagado anterior (solo cuota)
          valor_pagado_completo: totalPagadoCompleto.totalPagado, // Total pagado completo
          desglose_pagado: totalPagadoCompleto.desglose, // Desglose del total pagado
          total_a_pagar_completo: totalAPagarCompleto.totalAPagar, // Total a pagar completo
          desglose_a_pagar: totalAPagarCompleto.desglose, // Desglose del total a pagar
          fecha_pago: null, // No hay fecha de pago para el código anterior ya que fue actualizado
          tipo: 'cuota' // Indicar que es una cuota
        }
      } else {
        // Si no es antiguo, mostrar normalmente con el total pagado completo y total a pagar completo
        comprobanteEncontrado.value = {
          ...cuotaParaCalcular,
          valor_pagado_completo: totalPagadoCompleto.totalPagado, // Total pagado completo
          desglose_pagado: totalPagadoCompleto.desglose, // Desglose del total pagado
          total_a_pagar_completo: totalAPagarCompleto.totalAPagar, // Total a pagar completo
          desglose_a_pagar: totalAPagarCompleto.desglose, // Desglose del total a pagar
          tipo: 'cuota' // Indicar que es una cuota
        }
      }
    } else {
      // Si no se encuentra en cuotas, buscar en pagos de préstamos
      const codigo = codigoBusqueda.value.trim().toUpperCase()
      
      // Obtener los IDs de préstamos de esta natillera
      const { data: prestamosNatillera, error: prestamosError } = await supabase
        .from('prestamos')
        .select(`
          id,
          socio_natillera:socios_natillera!inner(
            id,
            natillera_id,
            socio:socios(*)
          )
        `)
        .eq('socios_natillera.natillera_id', id.value)
      
      if (prestamosError) throw prestamosError
      
      if (prestamosNatillera && prestamosNatillera.length > 0) {
        const prestamoIds = prestamosNatillera.map(p => p.id)
        
        // Primero buscar en pagos actuales
        const { data: pagoPrestamo, error: pagoError } = await supabase
          .from('pagos_prestamo')
          .select(`
            *,
            prestamo:prestamos(
              id,
              monto,
              saldo_actual,
              interes,
              numero_cuotas,
              tipo_interes,
              interes_anticipado,
              socio_natillera:socios_natillera(
                id,
                socio:socios(*)
              )
            )
          `)
          .eq('codigo_comprobante', codigo)
          .in('prestamo_id', prestamoIds)
          .maybeSingle()
        
        if (pagoError) throw pagoError
        
        if (pagoPrestamo) {
          // Formatear como comprobante de abono
          comprobanteEncontrado.value = {
            codigo_comprobante: pagoPrestamo.codigo_comprobante,
            valor_pagado: pagoPrestamo.valor,
            fecha_pago: pagoPrestamo.fecha,
            tipo: 'abono_prestamo', // Indicar que es un abono a préstamo
            socio_natillera: {
              socio: pagoPrestamo.prestamo?.socio_natillera?.socio || null
            },
            descripcion: 'Abono a Préstamo',
            prestamo: pagoPrestamo.prestamo,
            pago_prestamo: pagoPrestamo
          }
        } else {
          // Si no se encuentra en pagos actuales, buscar en historial
          try {
            // Buscar en historial directamente por código
            const { data: historialPrestamo, error: historialError } = await supabase
              .from('historial_comprobantes_prestamo')
              .select(`
                *,
                prestamo:prestamos(
                  id,
                  monto,
                  saldo_actual,
                  interes,
                  numero_cuotas,
                  tipo_interes,
                  interes_anticipado,
                  socio_natillera:socios_natillera(
                    id,
                    socio:socios(*)
                  )
                ),
                socio_natillera:socios_natillera(
                  id,
                  socio:socios(*)
                )
              `)
              .eq('codigo_comprobante_anterior', codigo)
              .order('fecha_actualizacion', { ascending: false })
              .limit(1)
              .maybeSingle()
            
            if (historialError && !historialError.message.includes('historial_comprobantes_prestamo')) {
              throw historialError
            }
            
            if (historialPrestamo) {
              // Obtener información del préstamo (puede venir del historial o de la relación)
              const prestamoHistorial = historialPrestamo.prestamo || null
              const socioNatillera = historialPrestamo.socio_natillera || prestamoHistorial?.socio_natillera || null
              
              // Verificar que el préstamo pertenezca a esta natillera
              const prestamoPerteneceNatillera = historialPrestamo.prestamo_id && 
                prestamoIds.includes(historialPrestamo.prestamo_id)
              
              if (prestamoPerteneceNatillera || !historialPrestamo.prestamo_id) {
                // Si fue eliminado, mostrar información de eliminación
                if (historialPrestamo.eliminado) {
                  comprobanteEncontrado.value = {
                    codigo_comprobante: historialPrestamo.codigo_comprobante_anterior,
                    valor_pagado: historialPrestamo.valor_abono_anterior,
                    fecha_pago: historialPrestamo.fecha_actualizacion,
                    tipo: 'abono_prestamo_eliminado',
                    eliminado: true,
                    eliminado_por: historialPrestamo.eliminado_por_email || 'Usuario desconocido',
                    eliminado_el: historialPrestamo.eliminado_el,
                    socio_natillera: {
                      socio: socioNatillera?.socio || null
                    },
                    descripcion: 'Abono a Préstamo (ELIMINADO)',
                    prestamo: prestamoHistorial || null,
                    historial: historialPrestamo
                  }
                } else {
                  // Si fue actualizado, mostrar información del código anterior
                  comprobanteEncontrado.value = {
                    codigo_comprobante: historialPrestamo.codigo_comprobante_anterior,
                    valor_pagado: historialPrestamo.valor_abono_anterior,
                    fecha_pago: historialPrestamo.fecha_actualizacion,
                    tipo: 'abono_prestamo_antiguo',
                    socio_natillera: {
                      socio: socioNatillera?.socio || null
                    },
                    descripcion: 'Abono a Préstamo (Código Actualizado)',
                    prestamo: prestamoHistorial || null,
                    codigo_nuevo: historialPrestamo.codigo_comprobante_nuevo,
                    historial: historialPrestamo
                  }
                }
              } else {
                errorBusqueda.value = 'No se encontró ningún comprobante con ese código'
              }
            } else {
              errorBusqueda.value = 'No se encontró ningún comprobante con ese código'
            }
          } catch (historialErr) {
            // Si hay error al buscar en historial, solo mostrar que no se encontró
            console.warn('Error buscando en historial:', historialErr)
            errorBusqueda.value = 'No se encontró ningún comprobante con ese código'
          }
        }
      } else {
        errorBusqueda.value = result.error || 'No se encontró el comprobante'
      }
    }
  } catch (e) {
    errorBusqueda.value = 'Error al buscar el comprobante: ' + e.message
  } finally {
    buscandoComprobante.value = false
  }
}
// Función para buscar por el código nuevo cuando se encuentra un comprobante antiguo
async function buscarPorCodigoNuevo() {
  if (!comprobanteNuevo.value) return
  
  // Calcular el total pagado completo y el total a pagar completo para el comprobante nuevo
  const totalPagadoCompleto = await calcularTotalPagadoCompleto(comprobanteNuevo.value)
  const totalAPagarCompleto = await calcularTotalAPagarCompleto(comprobanteNuevo.value)
  
  // Mostrar el comprobante nuevo que ya tenemos guardado con el total pagado completo y total a pagar completo
  comprobanteEncontrado.value = {
    ...comprobanteNuevo.value,
    valor_pagado_completo: totalPagadoCompleto.totalPagado,
    desglose_pagado: totalPagadoCompleto.desglose,
    total_a_pagar_completo: totalAPagarCompleto.totalAPagar,
    desglose_a_pagar: totalAPagarCompleto.desglose
  }
  infoComprobanteAntiguo.value = null // Ocultar la alerta de comprobante antiguo
  codigoBusqueda.value = comprobanteNuevo.value.codigo_comprobante // Actualizar el campo de búsqueda
}
function cerrarModalBuscarComprobante() {
  modalBuscarComprobante.value = false
  codigoBusqueda.value = ''
  comprobanteEncontrado.value = null
  infoComprobanteAntiguo.value = null
  comprobanteNuevo.value = null
  errorBusqueda.value = ''
  desgloseAPagarAbierto.value = false
  desglosePagadoAbierto.value = false
}
// Función para obtener préstamos con cuotas vencidas - OPTIMIZADA
async function obtenerPrestamosVencidos() {
  if (!id.value) return
  
  try {
    // OPTIMIZACIÓN: Una sola consulta con JOINs para obtener todos los datos necesarios
    // En lugar de 3 consultas secuenciales, usamos una consulta con relaciones anidadas
    const { data: prestamosConPagos, error: prestamosError } = await supabase
      .from('prestamos')
      .select(`
        id,
        socio_natillera_id,
        monto,
        saldo_actual,
        socio_natillera:socios_natillera!inner(
          id,
          natillera_id,
          socio:socios(*)
        ),
        plan_pagos_prestamo(
          id,
          numero_cuota,
          fecha_proyectada,
          valor_cuota,
          valor_pagado,
          pagada
        )
      `)
      .eq('socio_natillera.natillera_id', id.value)
      .eq('estado', 'activo')
    
    if (prestamosError) throw prestamosError
    if (!prestamosConPagos || prestamosConPagos.length === 0) {
      prestamosVencidos.value = []
      prestamosEnMoraLista.value = []
      return
    }
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    const sociosConPrestamosVencidos = {}
    const prestamosLista = []
    
    prestamosConPagos.forEach(prestamo => {
      const planesPago = prestamo.plan_pagos_prestamo || []
      let cuotasEstePrestamo = 0
      let deudaEstePrestamo = 0
      let fechaAntiguaEstePrestamo = null
      
      planesPago.forEach(plan => {
        const fechaProyectada = new Date(plan.fecha_proyectada)
        fechaProyectada.setHours(0, 0, 0, 0)
        
        const valorCuota = parseFloat(plan.valor_cuota || 0)
        const valorPagado = parseFloat(plan.valor_pagado || 0)
        const estaVencida = hoy > fechaProyectada
        const noEstaPagada = !plan.pagada && valorPagado < valorCuota
        
        if (estaVencida && noEstaPagada) {
          const socioId = prestamo.socio_natillera_id
          const deudaCuota = valorCuota - valorPagado
          
          cuotasEstePrestamo++
          deudaEstePrestamo += deudaCuota
          if (!fechaAntiguaEstePrestamo || fechaProyectada < fechaAntiguaEstePrestamo) {
            fechaAntiguaEstePrestamo = fechaProyectada
          }
          
          if (!sociosConPrestamosVencidos[socioId]) {
            sociosConPrestamosVencidos[socioId] = {
              socio_natillera_id: socioId,
              socio: prestamo.socio_natillera?.socio,
              cuotasVencidas: 0,
              totalDeudaPrestamo: 0,
              diasMoraPrestamo: 0,
              fechaVencimientoMasAntigua: null,
              prestamoId: prestamo.id,
              cuotaVencidaMasAntigua: null
            }
          }
          
          sociosConPrestamosVencidos[socioId].cuotasVencidas++
          sociosConPrestamosVencidos[socioId].totalDeudaPrestamo += deudaCuota
          
          if (!sociosConPrestamosVencidos[socioId].fechaVencimientoMasAntigua ||
              fechaProyectada < sociosConPrestamosVencidos[socioId].fechaVencimientoMasAntigua) {
            sociosConPrestamosVencidos[socioId].fechaVencimientoMasAntigua = fechaProyectada
            sociosConPrestamosVencidos[socioId].cuotaVencidaMasAntigua = {
              id: plan.id,
              numero_cuota: plan.numero_cuota,
              fecha_proyectada: plan.fecha_proyectada,
              valor_cuota: valorCuota,
              valor_pagado: valorPagado,
              deuda: deudaCuota
            }
            sociosConPrestamosVencidos[socioId].prestamoId = prestamo.id
          }
        }
      })
      
      if (cuotasEstePrestamo > 0 && fechaAntiguaEstePrestamo) {
        const diasM = Math.max(
          0,
          Math.floor((hoy - fechaAntiguaEstePrestamo) / (1000 * 60 * 60 * 24))
        )
        const socioData = prestamo.socio_natillera?.socio
        prestamosLista.push({
          prestamoId: prestamo.id,
          socio_natillera_id: prestamo.socio_natillera_id,
          nombreSocio: socioData?.nombre || 'Sin nombre',
          socio: socioData || null,
          cuotasVencidas: cuotasEstePrestamo,
          totalDeudaPrestamo: deudaEstePrestamo,
          diasMoraPrestamo: diasM,
          saldo_actual: parseFloat(prestamo.saldo_actual) || 0
        })
      }
    })
    
    Object.values(sociosConPrestamosVencidos).forEach(socio => {
      if (socio.fechaVencimientoMasAntigua) {
        socio.diasMoraPrestamo = Math.floor((hoy - socio.fechaVencimientoMasAntigua) / (1000 * 60 * 60 * 24))
        socio.diasMoraPrestamo = Math.max(0, socio.diasMoraPrestamo)
      }
    })
    
    prestamosLista.sort((a, b) => {
      if (b.diasMoraPrestamo !== a.diasMoraPrestamo) return b.diasMoraPrestamo - a.diasMoraPrestamo
      return b.totalDeudaPrestamo - a.totalDeudaPrestamo
    })
    prestamosEnMoraLista.value = prestamosLista
    prestamosVencidos.value = Object.values(sociosConPrestamosVencidos)
  } catch (error) {
    console.error('Error obteniendo préstamos vencidos:', error)
    prestamosVencidos.value = []
    prestamosEnMoraLista.value = []
  }
}
// Socios con problemas de mora o pendientes vencidos (incluyendo préstamos)
const sociosEnMora = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // Obtener días de gracia de la natillera
  const diasGracia = natillera.value?.reglas_multas?.dias_gracia || 3
  
  // Agrupar cuotas por socio
  const sociosMap = {}
  
  // Procesar cuotas de natillera
  if (cuotasNatillera.value && cuotasNatillera.value.length > 0) {
    cuotasNatillera.value.forEach(cuota => {
      if (!cuota) return
      
      const socioId = cuota.socio_natillera_id
      if (!socioId) return
      
      const socioInfo = cuota.socio_natillera?.socio
      
      if (!sociosMap[socioId]) {
        sociosMap[socioId] = {
          id: socioId,
          nombre: socioInfo?.nombre || 'Sin nombre',
          avatar_seed: socioInfo?.avatar_seed || null,
          avatar_style: socioInfo?.avatar_style || 'adventurer',
          periodicidad: cuota.socio_natillera?.periodicidad || 'mensual',
          cuotasMora: 0,
          cuotasPendientes: 0,
          totalDeuda: 0,
          totalSanciones: 0,
          valorCuotaPromedio: 0,
          diasMora: 0,
          cuotasMoraList: [],
          socio: socioInfo || null,
          // Campos para préstamos
          tienePrestamosVencidos: false,
          cuotasVencidasPrestamo: 0,
          totalDeudaPrestamo: 0,
          diasMoraPrestamo: 0,
          prestamoId: null,
          fechaVencimientoPrestamo: null
        }
      }
      
      // IMPORTANTE: Calcular el estado real de la cuota basándose en fechas, no solo en el estado guardado
      // Esto asegura que las cuotas que deberían estar en mora se detecten aunque no estén actualizadas en la BD
      const estadoReal = calcularEstadoRealCuota(cuota, diasGracia)
      
      // Contar cuotas en mora (usar estado real calculado, no solo el estado guardado)
      if (estadoReal === 'mora') {
        sociosMap[socioId].cuotasMora++
        const deudaCuota = (cuota.valor_cuota || 0) - (cuota.valor_pagado || 0)
        const sancionCuota = sancionesPorCuota.value[cuota.id] || 0
        sociosMap[socioId].totalDeuda += deudaCuota
        sociosMap[socioId].totalSanciones += sancionCuota
        sociosMap[socioId].cuotasMoraList.push(cuota)
        sociosMap[socioId].valorCuotaPromedio += cuota.valor_cuota || 0
      }
      // No contar cuotas pendientes vencidas - solo se muestran cuotas en mora
    })
  }
  
  // Agregar información de préstamos vencidos
  if (prestamosVencidos.value && prestamosVencidos.value.length > 0) {
    prestamosVencidos.value.forEach(prestamoVencido => {
      const socioId = prestamoVencido.socio_natillera_id
      
      if (!sociosMap[socioId]) {
        // Si el socio no tiene cuotas en mora pero sí préstamos vencidos, agregarlo
        sociosMap[socioId] = {
          id: socioId,
          nombre: prestamoVencido.socio?.nombre || 'Sin nombre',
          avatar_seed: prestamoVencido.socio?.avatar_seed || null,
          avatar_style: prestamoVencido.socio?.avatar_style || 'adventurer',
          periodicidad: 'mensual',
          cuotasMora: 0,
          cuotasPendientes: 0,
          totalDeuda: 0,
          totalSanciones: 0,
          valorCuotaPromedio: 0,
          diasMora: 0,
          cuotasMoraList: [],
          socio: prestamoVencido.socio || null,
          tienePrestamosVencidos: true,
          cuotasVencidasPrestamo: prestamoVencido.cuotasVencidas || 0,
          totalDeudaPrestamo: prestamoVencido.totalDeudaPrestamo || 0,
          diasMoraPrestamo: prestamoVencido.diasMoraPrestamo || 0,
          prestamoId: prestamoVencido.prestamoId || null,
          fechaVencimientoPrestamo: prestamoVencido.fechaVencimientoMasAntigua || null
        }
      } else {
        // Agregar información de préstamos vencidos al socio existente
        sociosMap[socioId].tienePrestamosVencidos = true
        sociosMap[socioId].cuotasVencidasPrestamo = prestamoVencido.cuotasVencidas || 0
        sociosMap[socioId].totalDeudaPrestamo = prestamoVencido.totalDeudaPrestamo || 0
        sociosMap[socioId].diasMoraPrestamo = prestamoVencido.diasMoraPrestamo || 0
        sociosMap[socioId].prestamoId = prestamoVencido.prestamoId || null
        sociosMap[socioId].fechaVencimientoPrestamo = prestamoVencido.fechaVencimientoMasAntigua || null
      }
    })
  }
  
  // Filtrar solo los que tienen problemas (cuotas en mora o préstamos vencidos) y calcular información adicional
  return Object.values(sociosMap)
    .filter(s => s.cuotasMora > 0 || s.tienePrestamosVencidos)
    .map(s => {
      // Calcular días de mora (basado en la cuota más antigua en mora)
      // IMPORTANTE: Los días de mora se calculan desde fecha_vencimiento, no desde fecha_limite
      // fecha_vencimiento = fecha_limite + días de gracia
      let diasMora = 0
      if (s.cuotasMoraList.length > 0) {
        const fechasVencimiento = s.cuotasMoraList
          .filter(c => c.fecha_limite || c.fecha_vencimiento)
          .map(c => {
            // Usar fecha_vencimiento si existe, sino calcularla como fecha_limite + días de gracia
            let fechaVencimiento
            if (c.fecha_vencimiento) {
              const fechaStr = c.fecha_vencimiento
              if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
                const [anio, mes, dia] = fechaStr.split('-').map(Number)
                fechaVencimiento = new Date(anio, mes - 1, dia)
              } else {
                fechaVencimiento = new Date(fechaStr)
              }
            } else if (c.fecha_limite) {
              // Calcular fecha_vencimiento = fecha_limite + días de gracia
              const fechaStr = c.fecha_limite
              let fechaLimite
              if (typeof fechaStr === 'string' && fechaStr.includes('-')) {
                const [anio, mes, dia] = fechaStr.split('-').map(Number)
                fechaLimite = new Date(anio, mes - 1, dia)
              } else {
                fechaLimite = new Date(fechaStr)
              }
              fechaLimite.setHours(0, 0, 0, 0)
              fechaVencimiento = new Date(fechaLimite)
              fechaVencimiento.setDate(fechaVencimiento.getDate() + diasGracia)
            } else {
              return null
            }
            fechaVencimiento.setHours(0, 0, 0, 0)
            return fechaVencimiento
          })
          .filter(f => f !== null && !isNaN(f.getTime()))
          .sort((a, b) => a - b)
        
        if (fechasVencimiento.length > 0) {
          const fechaVencimientoMasAntigua = fechasVencimiento[0]
          diasMora = Math.floor((hoy - fechaVencimientoMasAntigua) / (1000 * 60 * 60 * 24))
          diasMora = Math.max(0, diasMora)
        }
      }
      
      // Si tiene préstamos vencidos, usar el mayor entre días de mora de cuotas y préstamos
      if (s.tienePrestamosVencidos && s.diasMoraPrestamo > diasMora) {
        diasMora = s.diasMoraPrestamo
      }
      
      // Calcular valor promedio de cuota
      const valorCuotaPromedio = s.cuotasMora > 0 
        ? Math.round(s.valorCuotaPromedio / s.cuotasMora)
        : 0
      
      // Obtener información completa del socio
      const socioCompleto = s.socio || (() => {
        const primeraCuota = s.cuotasMoraList[0] || cuotasNatillera.value?.find(c => c.socio_natillera_id === s.id)
        return primeraCuota?.socio_natillera?.socio || null
      })()
      
      // Deuda solo de cuotas (sin préstamos)
      const totalDeudaCuotas = s.totalDeuda
      // Deuda total incluyendo préstamos
      const totalDeudaCompleto = totalDeudaCuotas + (s.totalDeudaPrestamo || 0)

      return {
        ...s,
        // Deuda solo de cuotas (para alertas de cuotas)
        totalDeudaCuotas,
        // Total incluyendo sanciones y préstamos
        totalConSanciones: totalDeudaCompleto + s.totalSanciones,
        // Días de mora (mayor entre cuotas y préstamos)
        diasMora,
        // Valor promedio de cuota
        valorCuotaPromedio,
        // Información completa del socio
        socio: socioCompleto,
        // Total de deuda incluyendo préstamos
        totalDeuda: totalDeudaCompleto
      }
    })
    .sort((a, b) => {
      // Primero los que tienen más cuotas en mora o préstamos vencidos
      const problemasA = a.cuotasMora + a.cuotasVencidasPrestamo
      const problemasB = b.cuotasMora + b.cuotasVencidasPrestamo
      if (problemasB !== problemasA) return problemasB - problemasA
      // Luego por total de deuda con sanciones
      return b.totalConSanciones - a.totalConSanciones
    })
})
/** Total de cuotas de la natillera en mora (mismo criterio que sociosEnMora / estado real) */
const cantidadCuotasEnMoraAlertas = computed(() =>
  sociosEnMora.value.reduce((acc, s) => acc + (s.cuotasMora || 0), 0)
)

/** Máximo de filas en vista previa de Alertas recientes antes de «Ver todas» */
const ALERTAS_RECIENTES_PREVIEW = 5

const sociosCuotasMoraLista = computed(() => sociosEnMora.value.filter((s) => s.cuotasMora > 0))

/** Vista previa: como máximo 5 filas en total (primero cuotas de la natillera, luego préstamos). */
const previewCuotasCount = computed(() => {
  const nC = sociosCuotasMoraLista.value.length
  const nP = prestamosEnMoraLista.value.length
  if (nC + nP <= ALERTAS_RECIENTES_PREVIEW) return nC
  return Math.min(nC, ALERTAS_RECIENTES_PREVIEW)
})

const previewPrestamosCount = computed(() => {
  const nC = sociosCuotasMoraLista.value.length
  const nP = prestamosEnMoraLista.value.length
  if (nC + nP <= ALERTAS_RECIENTES_PREVIEW) return nP
  const cShown = Math.min(nC, ALERTAS_RECIENTES_PREVIEW)
  return Math.min(nP, ALERTAS_RECIENTES_PREVIEW - cShown)
})

const hayMasAlertasRecientes = computed(() => {
  const nC = sociosCuotasMoraLista.value.length
  const nP = prestamosEnMoraLista.value.length
  return nC + nP > ALERTAS_RECIENTES_PREVIEW
})

// Estadísticas de mora
const totalCuotasMora = computed(() => {
  if (!cuotasNatillera.value || !cuotasNatillera.value.length) return 0
  return cuotasNatillera.value.filter(c => c && c.estado === 'mora').length
})
const totalCuotasPendientes = computed(() => {
  if (!cuotasNatillera.value || !cuotasNatillera.value.length) return 0
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  return cuotasNatillera.value.filter(c => {
    if (!c || (c.estado !== 'pendiente' && c.estado !== 'parcial')) return false
    if (!c.fecha_limite) return false
    const fechaLimite = new Date(c.fecha_limite)
    fechaLimite.setHours(0, 0, 0, 0)
    return hoy > fechaLimite
  }).length
})
const totalDeudaMora = computed(() => {
  if (!sociosEnMora.value || !sociosEnMora.value.length) return 0
  return sociosEnMora.value.reduce((sum, s) => sum + (s?.totalConSanciones || s?.totalDeuda || 0), 0)
})
const totalSancionesMora = computed(() => {
  if (!sociosEnMora.value || !sociosEnMora.value.length) return 0
  return sociosEnMora.value.reduce((sum, s) => sum + (s?.totalSanciones || 0), 0)
})
// Estadísticas de préstamos vencidos (un préstamo = un registro en prestamosEnMoraLista)
const totalPrestamosVencidos = computed(() => prestamosEnMoraLista.value?.length || 0)
const totalCuotasPrestamosVencidos = computed(() => {
  if (!prestamosEnMoraLista.value?.length) return 0
  return prestamosEnMoraLista.value.reduce((sum, p) => sum + (p?.cuotasVencidas || 0), 0)
})
const totalDeudaPrestamosVencidos = computed(() => {
  if (!prestamosEnMoraLista.value?.length) return 0
  return prestamosEnMoraLista.value.reduce((sum, p) => sum + (p?.totalDeudaPrestamo || 0), 0)
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
  // Calcular total aportado solo con valor_cuota (sin incluir sanciones)
  // Las sanciones se reflejan en utilidades
  const totalAportado = pagadas.reduce((sum, c) => sum + (c.valor_cuota || 0), 0)
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
const estadisticas = ref({
  totalSocios: 0,
  sociosActivos: 0,
  totalAportado: 0,
  totalPendiente: 0,
  utilidadActividades: 0,
  utilidadesRecogidas: 0,
  utilidadesDesglose: [],
  utilidadesPorFormaPago: [],
  fondoTotal: 0,
  totalRecaudadoNeto: 0,
  totalRecaudadoNetoInclParciales: 0,
  totalDesembolsadoPrestamos: 0,
  totalDesembolsadoEfectivo: 0,
  totalDesembolsadoTransferencia: 0,
  totalRecaudadoEfectivo: 0,
  totalRecaudadoTransferencia: 0,
  sancionesEfectivo: 0,
  sancionesTransferencia: 0,
  actividadesEfectivo: 0,
  actividadesTransferencia: 0,
  pagosPrestamosEfectivo: 0,
  pagosPrestamosTransferencia: 0,
  recaudadoCompletoEfectivo: 0,
  recaudadoCompletoTransferencia: 0,
  recaudadoCompletoTotal: 0,
  movimientosEfectivoNeto: 0,
  movimientosTransferenciaNeto: 0,
  egresosRecaudado: 0,
  egresosUtilidades: 0,
  ingresosRecaudado: 0,
  ingresosUtilidades: 0
})
// Función para calcular estadísticas de forma asíncrona
async function calcularEstadisticasAsync() {
  if (!natillera.value) {
    estadisticas.value = {
      totalSocios: 0,
      sociosActivos: 0,
      totalAportado: 0,
      totalPendiente: 0,
      utilidadActividades: 0,
      utilidadesRecogidas: 0,
      utilidadesDesglose: [],
      utilidadesPorFormaPago: [],
      fondoTotal: 0,
      totalRecaudadoNeto: 0,
      totalDesembolsadoPrestamos: 0,
      totalDesembolsadoEfectivo: 0,
      totalDesembolsadoTransferencia: 0,
      totalRecaudadoEfectivo: 0,
      totalRecaudadoTransferencia: 0,
      sancionesEfectivo: 0,
      sancionesTransferencia: 0,
      actividadesEfectivo: 0,
      actividadesTransferencia: 0,
      pagosPrestamosEfectivo: 0,
      pagosPrestamosTransferencia: 0,
      recaudadoCompletoEfectivo: 0,
      recaudadoCompletoTransferencia: 0,
      recaudadoCompletoTotal: 0,
      movimientosEfectivoNeto: 0,
      movimientosTransferenciaNeto: 0,
      egresosRecaudado: 0,
      egresosUtilidades: 0,
      ingresosRecaudado: 0,
      ingresosUtilidades: 0
    }
    return
  }
  
  const stats = await natillerasStore.calcularEstadisticas(natillera.value)
  estadisticas.value = stats || {
    totalSocios: 0,
    sociosActivos: 0,
    totalAportado: 0,
    totalPendiente: 0,
    utilidadActividades: 0,
    utilidadesRecogidas: 0,
    utilidadesDesglose: [],
    utilidadesPorFormaPago: [],
    fondoTotal: 0,
    totalRecaudadoNeto: 0,
    totalDesembolsadoPrestamos: 0,
    totalDesembolsadoEfectivo: 0,
    totalDesembolsadoTransferencia: 0,
    totalRecaudadoEfectivo: 0,
    totalRecaudadoTransferencia: 0,
    sancionesEfectivo: 0,
    sancionesTransferencia: 0,
    actividadesEfectivo: 0,
    actividadesTransferencia: 0,
    pagosPrestamosEfectivo: 0,
    pagosPrestamosTransferencia: 0,
    recaudadoCompletoEfectivo: 0,
    recaudadoCompletoTransferencia: 0,
    recaudadoCompletoTotal: 0,
    movimientosEfectivoNeto: 0,
    movimientosTransferenciaNeto: 0,
    egresosRecaudado: 0,
    egresosUtilidades: 0,
    ingresosRecaudado: 0,
    ingresosUtilidades: 0
  }
}
const MESES_NOMBRE = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
async function cargarDetalleRifas() {
  const natilleraId = id.value || route.params.id
  if (!natilleraId) return
  detalleRifasAbierto.value = true
  detalleRifas.value = { loading: true, porMes: [] }
  try {
    const { data: actividades, error: errAct } = await supabase
      .from('actividades')
      .select('id, descripcion, gastos, utilidad, ingresos, created_at')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'rifa')
      .eq('estado', 'liquidada')
      .order('created_at', { ascending: true })
    if (errAct) throw errAct
    const lista = actividades || []
    if (lista.length === 0) {
      detalleRifas.value = { loading: false, porMes: [] }
      return
    }
    const actividadIds = lista.map(a => a.id)
    const { data: sociosActividad, error: errSa } = await supabase
      .from('socios_actividad')
      .select('actividad_id, socio_natillera_id, valor_pagado, updated_at')
      .in('actividad_id', actividadIds)
      .gt('valor_pagado', 0)
    if (errSa) throw errSa
    const saList = sociosActividad || []
    const socioNatilleraIds = [...new Set(saList.map(s => s.socio_natillera_id))]
    let nombresPorSn = {}
    if (socioNatilleraIds.length > 0) {
      const { data: snData } = await supabase
        .from('socios_natillera')
        .select('id, socio:socios(nombre)')
        .in('id', socioNatilleraIds)
      ;(snData || []).forEach(sn => {
        nombresPorSn[sn.id] = sn.socio?.nombre || 'Socio'
      })
    }
    const porActividad = {}
    saList.forEach(sa => {
      if (!porActividad[sa.actividad_id]) porActividad[sa.actividad_id] = []
      porActividad[sa.actividad_id].push({
        nombre: nombresPorSn[sa.socio_natillera_id] || 'Socio',
        valorPagado: parseFloat(sa.valor_pagado) || 0,
        fechaPago: sa.updated_at || null
      })
    })
    const porMesMap = {}
    lista.forEach(a => {
      const d = a.created_at ? new Date(a.created_at) : new Date()
      const anio = d.getFullYear()
      const mes = d.getMonth() + 1
      const key = `${anio}-${String(mes).padStart(2, '0')}`
      if (!porMesMap[key]) {
        porMesMap[key] = { anio, mes, label: `${MESES_NOMBRE[mes - 1]} ${anio}`, totalRecogido: 0, totalPremio: 0, totalUtilidad: 0, rifas: [] }
      }
      const socios = porActividad[a.id] || []
      const totalRecogido = socios.reduce((s, x) => s + x.valorPagado, 0) || parseFloat(a.ingresos) || 0
      const premio = parseFloat(a.gastos) || 0
      const utilidad = parseFloat(a.utilidad) || 0
      porMesMap[key].totalRecogido += totalRecogido
      porMesMap[key].totalPremio += premio
      porMesMap[key].totalUtilidad += utilidad
      porMesMap[key].rifas.push({
        id: a.id,
        descripcion: a.descripcion || 'Rifa',
        totalRecogido,
        premio,
        utilidad,
        socios: socios.sort((x, y) => new Date(y.fechaPago || 0) - new Date(x.fechaPago || 0))
      })
    })
    const porMes = Object.keys(porMesMap)
      .sort()
      .reverse()
      .map(k => porMesMap[k])
    detalleRifas.value = { loading: false, porMes }
  } catch (e) {
    console.error('Error cargando detalle rifas:', e)
    detalleRifas.value = { loading: false, porMes: [] }
  }
}
function cerrarDetalleRifas() {
  detalleRifasAbierto.value = false
  detalleRifas.value = { loading: false, porMes: [] }
  rifasDesplegados.value = {}
}
async function cargarDetalleOtros() {
  const natilleraId = id.value || route.params.id
  if (!natilleraId) return
  detalleOtrosAbierto.value = true
  detalleOtros.value = { loading: true, porActividad: [] }
  try {
    const { data: filasUtilidades, error: errUc } = await supabase
      .from('utilidades_clasificadas')
      .select('id_actividad, monto')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'otro')
    if (errUc) throw errUc
    const { data: actividades, error: errAct } = await supabase
      .from('actividades')
      .select('id, descripcion, estado')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'otro')
    if (errAct) throw errAct
    const actividadesList = actividades || []
    const actividadIds = actividadesList.map(a => a.id)
    const montosPorActividad = {}
    ;(filasUtilidades || []).forEach((r) => {
      const aid = r.id_actividad
      const m = parseFloat(r.monto) || 0
      if (aid) {
        montosPorActividad[aid] = (montosPorActividad[aid] || 0) + m
      }
    })
    let sociosActividad = []
    if (actividadIds.length > 0) {
      const { data: saData, error: errSa } = await supabase
        .from('socios_actividad')
        .select('actividad_id, socio_natillera_id, valor_pagado, updated_at')
        .in('actividad_id', actividadIds)
        .gt('valor_pagado', 0)
      if (!errSa && saData?.length) sociosActividad = saData
    }
    const socioNatilleraIds = [...new Set(sociosActividad.map(s => s.socio_natillera_id))]
    let nombresPorSn = {}
    if (socioNatilleraIds.length > 0) {
      const { data: snData } = await supabase
        .from('socios_natillera')
        .select('id, socio:socios(nombre)')
        .in('id', socioNatilleraIds)
      ;(snData || []).forEach(sn => {
        nombresPorSn[sn.id] = sn.socio?.nombre || 'Socio'
      })
    }
    const pagosPorActividad = {}
    sociosActividad.forEach(sa => {
      if (!pagosPorActividad[sa.actividad_id]) pagosPorActividad[sa.actividad_id] = []
      pagosPorActividad[sa.actividad_id].push({
        nombre: nombresPorSn[sa.socio_natillera_id] || 'Socio',
        valorPagado: parseFloat(sa.valor_pagado) || 0,
        fechaPago: sa.updated_at || null
      })
    })
    const porActividad = actividadesList.map((a) => {
      const total = montosPorActividad[a.id] ?? 0
      const pagos = pagosPorActividad[a.id] || []
      const totalPagos = pagos.reduce((sum, p) => sum + p.valorPagado, 0)
      const valorMostrar = total > 0 ? total : totalPagos
      return {
        id: a.id,
        descripcion: a.descripcion || 'Sin descripción',
        total: valorMostrar,
        pagos: pagos.sort((x, y) => new Date(y.fechaPago || 0) - new Date(x.fechaPago || 0))
      }
    }).filter((item) => item.total > 0)
    porActividad.sort((a, b) => (b.total || 0) - (a.total || 0))
    detalleOtros.value = { loading: false, porActividad }
  } catch (e) {
    console.error('Error cargando detalle otros:', e)
    detalleOtros.value = { loading: false, porActividad: [] }
  }
}
function cerrarDetalleOtros() {
  detalleOtrosAbierto.value = false
  detalleOtros.value = { loading: false, porActividad: [] }
  otrosDesplegados.value = {}
}
async function cargarDetalleSanciones() {
  const natilleraId = id.value || route.params.id
  if (!natilleraId) return
  detalleSancionesAbierto.value = true
  detalleSanciones.value = { loading: true, lista: [] }
  try {
    const { data: sociosNatillera, error: errSn } = await supabase
      .from('socios_natillera')
      .select('id')
      .eq('natillera_id', natilleraId)
    if (errSn) throw errSn
    const snIds = (sociosNatillera || []).map(sn => sn.id)
    if (snIds.length === 0) {
      detalleSanciones.value = { loading: false, lista: [] }
      return
    }
    const { data: cuotasConSancion, error: errCuotas } = await supabase
      .from('cuotas')
      .select('socio_natillera_id, valor_pagado_sancion, mes, anio, quincena, fecha_limite, fecha_vencimiento')
      .in('socio_natillera_id', snIds)
      .gt('valor_pagado_sancion', 0)
    if (errCuotas) throw errCuotas
    const filas = cuotasConSancion || []
    if (filas.length === 0) {
      detalleSanciones.value = { loading: false, lista: [] }
      return
    }
    const socioNatilleraIdsUnicos = [...new Set(filas.map(c => c.socio_natillera_id))]
    const { data: snData } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(nombre)')
      .in('id', socioNatilleraIdsUnicos)
    const nombresPorSn = {}
    ;(snData || []).forEach(sn => {
      nombresPorSn[sn.id] = sn.socio?.nombre || 'Socio'
    })
    const lista = filas.map((c) => {
      const valor = parseFloat(c.valor_pagado_sancion) || 0
      const anio = c.anio != null ? Number(c.anio) : 9999
      const mes = c.mes != null ? Number(c.mes) : 13
      let periodo = ''
      if (c.mes != null && c.anio != null) {
        const mesNombre = MESES_NOMBRE[Number(c.mes) - 1] || c.mes
        if (c.quincena === 1 || c.quincena === 2) {
          periodo = `Quincena ${c.quincena} - ${mesNombre} ${c.anio}`
        } else {
          periodo = `${mesNombre} ${c.anio}`
        }
      } else if (c.fecha_limite || c.fecha_vencimiento) {
        const f = c.fecha_limite || c.fecha_vencimiento
        const str = String(f).substring(0, 10)
        if (str) periodo = formatDate(str)
        else periodo = str || '—'
      } else {
        periodo = '—'
      }
      return {
        socio: nombresPorSn[c.socio_natillera_id] || 'Socio',
        valor,
        periodo,
        anio,
        mes
      }
    })
    // Ordenar por mes: enero primero, luego febrero, etc. (por año y luego por mes; dentro del mismo mes por valor desc)
    lista.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio
      if (a.mes !== b.mes) return a.mes - b.mes
      return (b.valor || 0) - (a.valor || 0)
    })
    detalleSanciones.value = { loading: false, lista }
  } catch (e) {
    console.error('Error cargando detalle sanciones:', e)
    detalleSanciones.value = { loading: false, lista: [] }
  }
}
function cerrarDetalleSanciones() {
  detalleSancionesAbierto.value = false
  detalleSanciones.value = { loading: false, lista: [] }
}
async function cargarDetallePrestamos() {
  const natilleraId = id.value || route.params.id
  if (!natilleraId) return
  detallePrestamosAbierto.value = true
  detallePrestamos.value = { loading: true, lista: [] }
  try {
    const { data: filasUtilidades, error: errUc } = await supabase
      .from('utilidades_clasificadas')
      .select('id_actividad, monto')
      .eq('natillera_id', natilleraId)
      .eq('tipo', 'prestamos')
      .not('id_actividad', 'is', null)
    if (errUc) throw errUc
    const prestamoIds = [...new Set((filasUtilidades || []).map(r => r.id_actividad).filter(Boolean))]
    if (prestamoIds.length === 0) {
      detallePrestamos.value = { loading: false, lista: [] }
      return
    }
    const montosPorPrestamo = {}
    ;(filasUtilidades || []).forEach((r) => {
      const pid = r.id_actividad
      if (!pid) return
      montosPorPrestamo[pid] = (montosPorPrestamo[pid] || 0) + (parseFloat(r.monto) || 0)
    })
    const { data: prestamosData, error: errP } = await supabase
      .from('prestamos')
      .select('id, monto, interes, created_at, numero_cuotas, socio_natillera_id')
      .in('id', prestamoIds)
    if (errP) throw errP
    const prestamosList = prestamosData || []

    const socioNatilleraIdsUnicos = [...new Set(prestamosList.map(p => p.socio_natillera_id).filter(Boolean))]
    let nombresPorSn = {}
    if (socioNatilleraIdsUnicos.length > 0) {
      const { data: snData } = await supabase
        .from('socios_natillera')
        .select('id, socio:socios(nombre)')
        .in('id', socioNatilleraIdsUnicos)
      ;(snData || []).forEach(sn => {
        nombresPorSn[sn.id] = sn.socio?.nombre || 'Socio'
      })
    }

    const lista = prestamosList
      .map((p) => {
        const intereses = montosPorPrestamo[p.id] ?? 0
        const numeroCuotas = p.numero_cuotas != null ? Number(p.numero_cuotas) : null
        return {
          socio: nombresPorSn[p.socio_natillera_id] || 'Desconocido',
          valorPrestamo: parseFloat(p.monto) || 0,
          fecha: p.created_at || null,
          intereses,
          porcentaje: parseFloat(p.interes) != null ? Number(p.interes) : null,
          numeroCuotas
        }
      })
      .filter((item) => item.intereses > 0)
    lista.sort((a, b) => (b.intereses || 0) - (a.intereses || 0))
    detallePrestamos.value = { loading: false, lista }
  } catch (e) {
    console.error('Error cargando detalle intereses préstamos:', e)
    detallePrestamos.value = { loading: false, lista: [] }
  }
}
function cerrarDetallePrestamos() {
  detallePrestamosAbierto.value = false
  detallePrestamos.value = { loading: false, lista: [] }
}
function abrirModalDesgloseUtilidades() {
  yaVioDesgloseUtilidades.value = true
  modalDesgloseUtilidades.value = true
}
function cerrarModalDesglose() {
  modalDesgloseUtilidades.value = false
  detalleRifasAbierto.value = false
  detalleOtrosAbierto.value = false
  detalleSancionesAbierto.value = false
  detallePrestamosAbierto.value = false
  conceptoEnDesarrollo.value = null
}
function abrirConceptoPorTipo(item) {
  if (item.id === 'rifas') {
    cargarDetalleRifas()
    conceptoEnDesarrollo.value = null
    detalleOtrosAbierto.value = false
    detalleSancionesAbierto.value = false
    detallePrestamosAbierto.value = false
  } else if (item.id === 'otro') {
    cargarDetalleOtros()
    conceptoEnDesarrollo.value = null
    detalleRifasAbierto.value = false
    detalleSancionesAbierto.value = false
    detallePrestamosAbierto.value = false
  } else if (item.id === 'sanciones') {
    cargarDetalleSanciones()
    conceptoEnDesarrollo.value = null
    detalleRifasAbierto.value = false
    detalleOtrosAbierto.value = false
    detallePrestamosAbierto.value = false
  } else if (item.id === 'prestamos') {
    cargarDetallePrestamos()
    conceptoEnDesarrollo.value = null
    detalleRifasAbierto.value = false
    detalleOtrosAbierto.value = false
    detalleSancionesAbierto.value = false
  } else {
    conceptoEnDesarrollo.value = item.id
    detalleRifasAbierto.value = false
    detalleOtrosAbierto.value = false
    detalleSancionesAbierto.value = false
    detallePrestamosAbierto.value = false
  }
}
function cerrarConceptoEnDesarrollo() {
  conceptoEnDesarrollo.value = null
}
function labelConceptoEnDesarrollo(tipo) {
  const labels = { sanciones: 'Sanciones', prestamos: 'Intereses de préstamos', bingo: 'Bingo', venta: 'Venta', evento: 'Evento', otro: 'Otro' }
  return labels[tipo] || tipo
}
function toggleRifaDesplegable(rifaId) {
  const next = { ...rifasDesplegados.value, [rifaId]: !rifasDesplegados.value[rifaId] }
  rifasDesplegados.value = next
}
function toggleOtroDesplegable(actividadId) {
  const next = { ...otrosDesplegados.value, [actividadId]: !otrosDesplegados.value[actividadId] }
  otrosDesplegados.value = next
}
function volverAtras() {
  // Navegar siempre al dashboard
  router.push('/dashboard')
}
function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}
function formatMoneyShort(value) {
  const num = Math.abs(value || 0)
  
  if (num >= 1000000) {
    // Millones: 1M, 1.5M, 2.3M
    const millones = num / 1000000
    if (millones % 1 === 0) {
      return `${millones}M`
    }
    return `${millones.toFixed(1)}M`
  } else if (num >= 1000) {
    // Miles: 3.5K, 450K
    const miles = num / 1000
    if (miles % 1 === 0) {
      return `${miles}K`
    }
    return `${miles.toFixed(1)}K`
  }
  
  // Menos de 1000: mostrar el número completo
  return num.toString()
}
function getAvatarUrl(seed, avatarSeed = null, style = 'adventurer') {
  // Usar DiceBear Avatars con el estilo seleccionado
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
// Las funciones formatDate y formatDateWithTime ahora se importan desde utils/formatDate.js
// para evitar problemas de zona horaria. Las funciones locales fueron eliminadas.
function cerrarModalWhatsApp() {
  modalWhatsApp.value = false
  busquedaSocio.value = ''
}

// Calcular estado del socio para el comprobante (ahorro, cuotas, sanciones, actividades, préstamos)
async function calcularEstadoSocioParaComprobante(sn) {
  const natilleraId = props.id || route.params.id
  const diasGracia = natillera.value?.reglas_multas?.dias_gracia || 3

  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  const cuotas = resumen?.cuotas || []

  let totalAhorrado = 0
  let cuotasPendientes = 0
  let cuotasMora = 0
  let totalPendiente = 0
  let totalMora = 0
  let totalSancionesPendientes = 0
  const cuotasPendientesList = []
  const cuotasMoraList = []
  const sancionesDesglose = []

  const resultSanciones = await cuotasStore.calcularSancionesTotales(natilleraId, cuotas)
  const sancionesMap = resultSanciones.success ? (resultSanciones.sanciones || {}) : {}

  cuotas.forEach(cuota => {
    const estadoReal = calcularEstadoRealCuota(cuota, diasGracia)
    const valorCuota = parseFloat(cuota.valor_cuota || 0)
    const valorPagado = parseFloat(cuota.valor_pagado || 0)
    const deuda = valorCuota - valorPagado
    const periodo = formatoPeriodoCuotaComprobante(cuota)

    if (estadoReal === 'pagada') {
      totalAhorrado += valorCuota
      return
    }
    if (estadoReal === 'mora') {
      cuotasMora++
      totalMora += deuda
      cuotasMoraList.push({ periodo, valor: deuda })
      const sancion = sancionesMap[cuota.id] ?? parseFloat(cuota.valor_multa || 0)
      if (sancion > 0) {
        totalSancionesPendientes += sancion
        sancionesDesglose.push({ periodo, valor: sancion })
      }
    } else if (estadoReal === 'pendiente') {
      cuotasPendientes++
      totalPendiente += deuda
      cuotasPendientesList.push({ periodo, valor: deuda })
      const sancion = parseFloat(cuota.valor_multa || 0)
      if (sancion > 0) {
        totalSancionesPendientes += sancion
        sancionesDesglose.push({ periodo, valor: sancion })
      }
    }
  })

  // Actividades pendientes solo "a la fecha": solo periodos ya vencidos o el periodo actual (nunca futuros)
  let actividadesPendientesTotal = 0
  const actividadesPendientesDesglose = []
  const mesesCortoAct = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  try {
    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1
    const anioActual = hoy.getFullYear()
    const quincenaActual = hoy.getDate() <= 15 ? 1 : 2

    const { data: sociosActividad } = await supabase
      .from('socios_actividad')
      .select('valor_asignado, valor_pagado, mes_pago, anio_pago, quincena_pago, actividad:actividades(descripcion, fecha_limite_pago)')
      .eq('socio_natillera_id', sn.id)
    if (sociosActividad && sociosActividad.length > 0) {
      sociosActividad.forEach(sa => {
        const asignado = parseFloat(sa.valor_asignado || 0)
        const pagado = parseFloat(sa.valor_pagado || 0)
        if (asignado <= pagado) return

        const mes = sa.mes_pago != null ? Number(sa.mes_pago) : null
        const anio = sa.anio_pago != null ? Number(sa.anio_pago) : null
        const quincena = sa.quincena_pago != null ? Number(sa.quincena_pago) : null
        // Fecha límite de pago (rifas y actividades con vencimiento): prioridad sobre mes/anio/quincena
        const fechaLimitePago = sa.actividad?.fecha_limite_pago

        let esPeriodoALaFecha = false

        if (fechaLimitePago) {
          // Rifas y actividades con fecha límite: solo mostrar si la fecha actual es SUPERIOR a la fecha límite (ya venció) y está pendiente
          try {
            let fechaLimite
            if (typeof fechaLimitePago === 'string' && fechaLimitePago.includes('-')) {
              const [y, m, d] = fechaLimitePago.split('-').map(Number)
              fechaLimite = new Date(y, (m || 1) - 1, d || 1)
              fechaLimite.setHours(23, 59, 59, 999)
            } else {
              fechaLimite = new Date(fechaLimitePago)
            }
            const hoyEod = new Date(hoy)
            hoyEod.setHours(23, 59, 59, 999)
            esPeriodoALaFecha = hoyEod.getTime() > fechaLimite.getTime()
          } catch (e) {
            esPeriodoALaFecha = false
          }
        } else {
          // Sin fecha límite: usar periodo mes/anio/quincena (excluir siempre periodos futuros)
          if (anio == null || mes == null) {
            esPeriodoALaFecha = false
          } else {
            if (anio > anioActual) esPeriodoALaFecha = false
            else if (anio === anioActual && mes > mesActual) esPeriodoALaFecha = false
            else if (anio === anioActual && mes === mesActual) {
              if (quincena == null || quincena === 0) {
                esPeriodoALaFecha = true
              } else if (quincena <= quincenaActual) {
                esPeriodoALaFecha = true
              } else {
                esPeriodoALaFecha = false
              }
            } else {
              esPeriodoALaFecha = true
            }
          }
        }

        if (esPeriodoALaFecha) {
          const valorPendiente = asignado - pagado
          actividadesPendientesTotal += valorPendiente
          const descripcion = sa.actividad?.descripcion || (mes && anio ? `${mesesCortoAct[mes - 1] || ''} ${anio}` + (quincena === 1 ? ' - 1ra quincena' : quincena === 2 ? ' - 2da quincena' : '') : 'Actividad')
          actividadesPendientesDesglose.push({ periodo: descripcion.trim() || 'Actividad', valor: valorPendiente })
        }
      })
    }
  } catch (e) {
    console.warn('Error cargando actividades pendientes:', e)
  }

  // Solo cuotas de préstamos pendientes a la fecha (fecha_proyectada <= hoy), no el valor total del préstamo
  let totalPrestamosPendiente = 0
  let cuotasPrestamosPendientes = 0
  const prestamosPendientesDesglose = []
  try {
    const hoy = new Date()
    hoy.setHours(23, 59, 59, 999)

    const { data: prestamos } = await supabase
      .from('prestamos')
      .select('id')
      .eq('socio_natillera_id', sn.id)
      .in('estado', ['activo', 'pagado'])
    if (prestamos && prestamos.length > 0) {
      const prestamoIds = prestamos.map(p => p.id)
      const { data: planPagos } = await supabase
        .from('plan_pagos_prestamo')
        .select('valor_cuota, valor_pagado, pagada, fecha_proyectada, numero_cuota')
        .in('prestamo_id', prestamoIds)
      if (planPagos) {
        planPagos.forEach(pp => {
          if (pp.pagada) return
          const fechaProyectada = pp.fecha_proyectada ? new Date(pp.fecha_proyectada) : null
          if (fechaProyectada && fechaProyectada.getTime() > hoy.getTime()) return // cuota futura, no incluir
          cuotasPrestamosPendientes++
          const valorCuota = parseFloat(pp.valor_cuota || 0)
          const valorPagado = parseFloat(pp.valor_pagado || 0)
          const pendiente = Math.max(0, valorCuota - valorPagado)
          totalPrestamosPendiente += pendiente
          const periodo = fechaProyectada
            ? fechaProyectada.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }).replace(/\./g, '') + (pp.numero_cuota != null ? ` (cuota ${pp.numero_cuota})` : '')
            : (pp.numero_cuota != null ? `Cuota ${pp.numero_cuota}` : 'Préstamo')
          prestamosPendientesDesglose.push({ periodo, valor: pendiente })
        })
      }
    }
  } catch (e) {
    console.warn('Error cargando préstamos pendientes:', e)
  }

  // Total a pagar (base para 4x1000 si paga por transferencia)
  const totalAPagar = totalPendiente + totalMora + totalSancionesPendientes + actividadesPendientesTotal + totalPrestamosPendiente
  const valor4x1000 = Math.round(totalAPagar * 0.004)
  const totalAPagarCon4x1000 = totalAPagar + valor4x1000

  return {
    socio: sn.socio || { nombre: 'Socio', telefono: sn.socio?.telefono },
    nombreNatillera: natillera.value?.nombre || 'Natillera',
    totalAhorrado,
    cuotasPendientes,
    cuotasMora,
    totalPendiente,
    totalMora,
    cuotasPendientesList,
    cuotasMoraList,
    totalSancionesPendientes,
    sancionesDesglose,
    actividadesPendientesTotal,
    actividadesPendientesDesglose,
    totalPrestamosPendiente,
    cuotasPrestamosPendientes,
    prestamosPendientesDesglose,
    totalAPagar,
    valor4x1000,
    totalAPagarCon4x1000
  }
}

function formatoPeriodoCuotaComprobante(cuota) {
  let mes = cuota.mes
  let anio = cuota.anio
  const quincena = cuota.quincena != null ? Number(cuota.quincena) : null
  if ((mes == null || anio == null) && cuota.fecha_limite) {
    const str = String(cuota.fecha_limite)
    if (str.includes('-')) {
      const [y, m] = str.split('-')
      anio = parseInt(y, 10)
      mes = parseInt(m, 10)
    }
  }
  const mesesCorto = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const mesLabel = (mes >= 1 && mes <= 12) ? mesesCorto[mes - 1] : `Mes ${mes}`
  let label = `${mesLabel} ${anio || ''}`
  if (quincena === 1) label += ' - 1ra quincena'
  else if (quincena === 2) label += ' - 2da quincena'
  return label
}

async function generarComprobanteEstadoSocio(sn) {
  if (loadingEstadoSocio.value) return
  if (postCargaModalesTimeoutId != null) {
    clearTimeout(postCargaModalesTimeoutId)
    postCargaModalesTimeoutId = null
  }
  loadingEstadoSocio.value = true
  try {
    const estado = await calcularEstadoSocioParaComprobante(sn)
    comprobanteEstadoSocio.value = estado
    cerrarModalWhatsApp()
    modalDetalle.value = false
    modalConfigMeses.value = false
    cerrarModalBuscarComprobante()
    cerrarModalCuotasSocio()
    modalSociosEnMora.value = false
    cerrarModalDesglose()
    modalSinSocios.value = false
    cerrarRecordatorioModal()
    modalComprobanteEstadoSocio.value = true
    await nextTick()
  } catch (e) {
    console.error('Error generando comprobante de estado:', e)
    alert('No se pudo generar el comprobante. Intenta de nuevo.')
  } finally {
    loadingEstadoSocio.value = false
  }
}

function textoComprobanteEstadoSocio(estado) {
  const total = estado.totalAPagar || 0
  const cuatroPorMil = estado.valor4x1000 || 0
  const totalCon4x1000 = estado.totalAPagarCon4x1000 != null ? estado.totalAPagarCon4x1000 : total + cuatroPorMil

  let text = '*_Abre la imagen para ver toda la información_*\n\n'
  text += '*Valor a pagar para estar al día*\n\n'
  if (total > 0) {
    text += `💰 $${formatMoney(total)}\n\n`
    text += `📋 4×1000 (impuesto): $${formatMoney(cuatroPorMil)}\n`
    text += `💳 Total a consignar si paga por transferencia (incluye 4×1000): $${formatMoney(totalCon4x1000)}\n`
  } else {
    text += '✅ Al día\n'
  }
  return text.trim()
}

async function descargarComprobanteEstadoSocio() {
  if (!comprobanteEstadoRef.value || !comprobanteEstadoSocio.value) return
  generandoImagenEstadoSocio.value = true
  try {
    await nextTick()
    await new Promise(r => setTimeout(r, 150))
    const dataUrl = await toPng(comprobanteEstadoRef.value, {
      backgroundColor: '#ecfdf5',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })
    const nombre = (comprobanteEstadoSocio.value.socio?.nombre || 'socio').replace(/\s+/g, '-')
    const link = document.createElement('a')
    link.download = `estado-socio-${nombre}.png`
    link.href = dataUrl
    link.click()
  } catch (e) {
    console.error('Error descargando comprobante:', e)
    alert('No se pudo descargar la imagen. Intenta de nuevo.')
  } finally {
    generandoImagenEstadoSocio.value = false
  }
}

async function enviarComprobanteEstadoSocioWhatsApp() {
  if (!comprobanteEstadoRef.value || !comprobanteEstadoSocio.value) return
  const telefono = (comprobanteEstadoSocio.value.socio?.telefono || '').replace(/\D/g, '')
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado.')
    return
  }
  generandoImagenEstadoSocio.value = true
  try {
    await nextTick()
    await new Promise(r => setTimeout(r, 150))
    const dataUrl = await toPng(comprobanteEstadoRef.value, {
      backgroundColor: '#ecfdf5',
      pixelRatio: 2,
      quality: 1.0,
      cacheBust: true
    })
    const numero = telefono.length === 10 ? '57' + telefono : telefono
    const texto = textoComprobanteEstadoSocio(comprobanteEstadoSocio.value)
    const nombre = (comprobanteEstadoSocio.value.socio?.nombre || 'socio').replace(/\s+/g, '-')

    try {
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `estado-socio-${nombre}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Estado del socio',
          text: texto
        })
        return
      }
    } catch (shareErr) {
      console.warn('Web Share no disponible o cancelado:', shareErr)
    }

    const link = document.createElement('a')
    link.download = `estado-socio-${nombre}.png`
    link.href = dataUrl
    link.click()
    setTimeout(() => {
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
      alert('La imagen se descargó. Adjúntala en WhatsApp para enviarla al socio.')
    }, 500)
  } catch (e) {
    console.error('Error enviando comprobante por WhatsApp:', e)
    alert('No se pudo generar la imagen. Abriendo WhatsApp solo con texto.')
    const numero = telefono.length === 10 ? '57' + telefono : telefono
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(textoComprobanteEstadoSocio(comprobanteEstadoSocio.value))}`, '_blank')
  } finally {
    generandoImagenEstadoSocio.value = false
  }
}

function enviarWhatsApp(socioNatillera, cerrarModal = true) {
  const telefono = socioNatillera.socio?.telefono?.replace(/\D/g, '')
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado')
    return
  }
  // Usar el mensaje configurado con las variables reemplazadas
  const mensaje = configStore.generarMensajeIndividual(
    socioNatillera.socio?.nombre,
    formatMoney(socioNatillera.valor_cuota_individual)
  )
  const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
  if (cerrarModal) {
    cerrarModalWhatsApp()
  }
}
function aplicarAccionPendienteBarraLateral() {
  const p = pendingNatilleraSidebarAction.value
  if (!p || String(p.natilleraId) !== String(props.id || route.params.id)) return
  if (!esAdmin.value && !misPermisos.value) return
  const t = p.type
  if (t === 'buscar' && puedeBuscarComprobante.value) {
    modalBuscarComprobante.value = true
  } else if (t === 'invitar' && puedeInvitarColaboradores.value) {
    nextTick(() => abrirFormularioInvitarColaborador())
  } else if (t === 'notificar' && puedeNotificar.value) {
    modalWhatsApp.value = true
  }
  clearPendingNatilleraSidebarAction()
}

watch(
  [pendingNatilleraSidebarAction, misPermisos, esAdmin],
  () => {
    aplicarAccionPendienteBarraLateral()
  },
  { deep: true }
)

const esMobile = computed(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))

function toggleSeccion(seccion) {
  seccionActiva.value = seccionActiva.value === seccion ? null : seccion
}
async function verDetalleSocio(sn) {
  socioSeleccionado.value = sn
  modalDetalle.value = true
  seccionActiva.value = 'finanzas'
  
  // Cargar cuotas del socio
  const resumen = await sociosStore.obtenerResumenSocio(sn.id)
  cuotasSocio.value = resumen?.cuotas || []
}
// Función para obtener el nombre del mes
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
  // Si viene como string "YYYY-MM-DD", crear la fecha en hora local, no UTC
  let fechaLimite
  if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
    const [anio, mes, dia] = cuota.fecha_limite.split('-').map(Number)
    fechaLimite = new Date(anio, mes - 1, dia) // mes - 1 porque Date usa 0-11 para meses
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
function verPrestamoEnMora(item) {
  if (!id.value || id.value === 'undefined' || id.value === 'null') {
    console.warn('ID de natillera inválido, redirigiendo al dashboard', id.value)
    router.push('/dashboard')
    return
  }
  if (natilleraPrestamosDeshabilitados(natillera.value)) {
    notificationStore.info('La natillera no permite préstamos', 'Préstamos')
    return
  }
  if (!item?.prestamoId) {
    router.push(`/natilleras/${id.value}/prestamos`)
    return
  }
  router.push({
    path: `/natilleras/${id.value}/prestamos`,
    query: { prestamoId: item.prestamoId }
  })
}

function cerrarModalTodasLasAlertasYVerPrestamo(p) {
  modalTodasLasAlertas.value = false
  verPrestamoEnMora(p)
}
// Función para navegar a la vista de préstamos del socio
function verPrestamoSocio(socioMora) {
  // Validar que el ID sea válido antes de navegar
  if (!id.value || id.value === 'undefined' || id.value === 'null') {
    console.warn('ID de natillera inválido, redirigiendo al dashboard', id.value)
    router.push('/dashboard')
    return
  }
  if (natilleraPrestamosDeshabilitados(natillera.value)) {
    notificationStore.info('La natillera no permite préstamos', 'Préstamos')
    return
  }

  if (socioMora.prestamoId) {
    // Navegar a la vista de préstamos con el ID del préstamo en el query
    router.push({
      path: `/natilleras/${id.value}/prestamos`,
      query: { prestamoId: socioMora.prestamoId }
    })
  } else {
    // Si no hay ID de préstamo, solo navegar a la vista de préstamos
    router.push(`/natilleras/${id.value}/prestamos`)
  }
}
// Función para abrir el modal de cuotas del socio
async function verCuotasSocio(socioMora) {
  // Desactivar animaciones de cuotas en mora al hacer clic en "ver cuotas"
  animacionesCuotasMora.value = false
  
  // Abrir la modal inmediatamente para una respuesta rápida
  socioParaCuotas.value = socioMora
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = true
  modalCuotasSocio.value = true
  
  // Cargar datos de forma asíncrona después de abrir la modal
  try {
    // Si viene de la modal de socios en mora y tiene cuotasMoraList, usar solo esas cuotas
    let cuotas = []
    if (socioMora.cuotasMoraList && socioMora.cuotasMoraList.length > 0) {
      // Usar solo las cuotas en mora
      cuotas = socioMora.cuotasMoraList
    } else {
      // Obtener las cuotas del socio (todas las cuotas, sin filtro de año)
      const resumen = await sociosStore.obtenerResumenSocio(socioMora.id)
      cuotas = resumen?.cuotas || []
    }
  
    // Obtener días de gracia de la natillera
    const diasGracia = natillera.value?.reglas_multas?.dias_gracia || 3
    
    // Calcular sanciones dinámicas para las cuotas del socio
    const natilleraId = props.id || route.params.id
    const resultSanciones = await cuotasStore.calcularSancionesTotales(natilleraId, cuotas)
    const sancionesSocio = resultSanciones.success ? (resultSanciones.sanciones || {}) : {}
    const sancionesActivas = resultSanciones.configActiva !== false // Verificar si las sanciones están activas
  
    // Procesar cada cuota individualmente
    const cuotasIndividuales = []
    
    cuotas.forEach(cuota => {
      if (!cuota.fecha_limite) return
      
      // Calcular el estado real de la cuota basándose en la fecha actual y días de gracia
      const estadoReal = calcularEstadoRealCuota(cuota, diasGracia)
      
      // Usar el campo mes de la cuota directamente (no calcular desde fecha_limite)
      const mes = cuota.mes || (() => {
        // Si no tiene campo mes, calcular desde fecha_limite como fallback
        let fecha
        if (typeof cuota.fecha_limite === 'string' && cuota.fecha_limite.includes('-')) {
          const [anio, mesNum, dia] = cuota.fecha_limite.split('-').map(Number)
          fecha = new Date(anio, mesNum - 1, dia)
        } else {
          fecha = new Date(cuota.fecha_limite)
        }
        return fecha.getMonth() + 1
      })()
      
      // Usar el campo anio de la cuota directamente, o calcular desde fecha_limite como fallback
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
      
      // Calcular total con sanciones para esta cuota
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
      
      // Crear objeto de cuota individual para mostrar
      const cuotaIndividual = {
        id: cuota.id,
        mes, // Usar el campo mes de la cuota
        anio, // Usar el campo anio de la cuota
        estado: estadoReal, // Usar el estado real calculado
        valorCuota: cuota.valor_cuota || 0,
        valorPagado: cuota.valor_pagado || 0,
        sancion: sancionCuota,
        totalConSanciones: totalConSanciones,
        fechaVencimiento: fechaVencimiento, // Fecha de vencimiento parseada correctamente
        diasMora: diasMora,
        periodicidad: socioMora.periodicidad || 'mensual',
        quincena: cuota.quincena || null,
        descripcion: cuota.descripcion || null
      }
      
      cuotasIndividuales.push(cuotaIndividual)
    })
  
    // Si viene de la modal de socios en mora, filtrar solo las cuotas en estado "mora"
    let cuotasFiltradas = cuotasIndividuales
    if (socioMora.cuotasMoraList && socioMora.cuotasMoraList.length > 0) {
      cuotasFiltradas = cuotasIndividuales.filter(c => c.estado === 'mora')
    }
  
    // Ordenar por año, mes y fecha de vencimiento (más antiguo primero)
    cuotasSocioPorMes.value = cuotasFiltradas.sort((a, b) => {
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
  } finally {
    loadingCuotasSocio.value = false
  }
}
function cerrarModalCuotasSocio() {
  modalCuotasSocio.value = false
  socioParaCuotas.value = null
  cuotasSocioPorMes.value = []
  loadingCuotasSocio.value = false
}

function irACuotasDelMes(grupoMes) {
  if (!id.value || !grupoMes?.mes) return
  cerrarModalCuotasSocio()
  router.push(`/natilleras/${id.value}/cuotas/${grupoMes.mes}`)
}
// Funciones para controlar la visualización de la modal de socios en mora (máximo 2 veces por día)
function obtenerClaveModalSociosEnMora() {
  const fechaHoy = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return `modalSociosEnMora_${id.value}_${fechaHoy}`
}
function puedeMostrarModalSociosEnMora() {
  const clave = obtenerClaveModalSociosEnMora()
  const contador = parseInt(localStorage.getItem(clave) || '0', 10)
  return contador < 2
}
function incrementarContadorModalSociosEnMora() {
  const clave = obtenerClaveModalSociosEnMora()
  const contador = parseInt(localStorage.getItem(clave) || '0', 10)
  localStorage.setItem(clave, (contador + 1).toString())
}

async function ejecutarModalesAutomaticosPostCarga() {
  if (recorridoDetalleNavActivo.value) return
  if (!tieneSocios.value) {
    modalSinSocios.value = true
  }
  const email = authStore.userEmail || usuarioAutenticado.value?.email || ''
  if (email === RECORDATORIO_EMAIL) {
    await fetchRecordatorios()
    if (listRecordatorios.value.length > 0) {
      showRecordatorioModal.value = true
      editandoRecordatorio.value = false
      recordatorioEdicionId.value = null
    }
  }
}

function liberarModalesPostCargaRetenidosTrasTour() {
  if (!modalesPostCargaRetenidosPorTour.value) return
  modalesPostCargaRetenidosPorTour.value = false
  void ejecutarModalesAutomaticosPostCarga()
}

// Función de debug para reiniciar el contador (solo para desarrollo)
function reiniciarContadorModalSociosEnMora() {
  const clave = obtenerClaveModalSociosEnMora()
  localStorage.removeItem(clave)
  console.log('✅ Contador de modal de socios en mora reiniciado para esta natillera')
  alert('Contador reiniciado. La modal se mostrará automáticamente la próxima vez que ingreses.')
}
// Exponer la función en window para acceso desde la consola (solo en desarrollo)
if (import.meta.env.DEV) {
  window.reiniciarContadorModalSociosEnMora = reiniciarContadorModalSociosEnMora
  window.verContadorModalSociosEnMora = () => {
    const clave = obtenerClaveModalSociosEnMora()
    const contador = parseInt(localStorage.getItem(clave) || '0', 10)
    console.log(`📊 Contador actual: ${contador}/2`)
    return contador
  }
}
// Función para enviar WhatsApp de una cuota específica
function enviarWhatsAppCuota(cuotaData) {
  // Obtener el teléfono del socio - puede venir de diferentes formas según el contexto
  let telefono = null
  let nombreSocio = 'Socio'
  
  if (socioParaCuotas.value) {
    // Si viene de la sección de alertas de mora (tiene socio.telefono)
    if (socioParaCuotas.value.socio?.telefono) {
      telefono = socioParaCuotas.value.socio.telefono
      nombreSocio = socioParaCuotas.value.socio.nombre || socioParaCuotas.value.nombre
    } 
    // Si viene directamente con telefono en el objeto raíz
    else if (socioParaCuotas.value.telefono) {
      telefono = socioParaCuotas.value.telefono
      nombreSocio = socioParaCuotas.value.nombre
    }
    // Si solo tiene nombre
    else {
      nombreSocio = socioParaCuotas.value.nombre || socioParaCuotas.value.socio?.nombre || 'Socio'
    }
  }
  
  if (!telefono) {
    alert('Este socio no tiene teléfono registrado')
    return
  }
  
  const telefonoLimpio = telefono.replace(/\D/g, '')
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
  
  const url = `https://wa.me/57${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}
// Observar cuando se abre la modal para poner el foco en el input
// Función para manejar el botón atrás del navegador en móvil
let modalHistoryState = null
function handleModalBack(modalRef, modalName) {
  watch(modalRef, (isOpen) => {
    if (isOpen) {
      // Verificar si hay otras modales abiertas
const hayOtrasModales = modalComprobanteEstadoSocio.value || modalWhatsApp.value || modalDetalle.value ||
                              modalConfigMeses.value || modalBuscarComprobante.value ||
                              (modalName !== 'sociosEnMora' && modalSociosEnMora.value) ||
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
  
  // Modal de cuotas del socio (z-60 - más alta)
  if (modalCuotasSocio.value) {
    cerrarModalCuotasSocio()
    // Si hay otra modal abierta debajo, no hacer nada más
    // La modal inferior ya tiene su entrada en el historial (fue agregada cuando se abrió)
    // El siguiente "atrás" naturalmente cerrará esa modal
    return
  }
  
  // Modal de socios en mora (z-50)
  if (modalSociosEnMora.value) {
    modalSociosEnMora.value = false
    // Si hay otra modal abierta debajo, no hacer nada más
    // La modal inferior ya tiene su entrada en el historial (fue agregada cuando se abrió)
    // El siguiente "atrás" naturalmente cerrará esa modal
    // Si no hay otras modales, no hacer nada más porque ya hay una entrada en el historial
    // que representa el estado "sin modales" (fue agregada cuando se abrió esta modal)
    return
  }
  
  // Modal Comprobante Estado Socio (z-50) - se abre después de cerrar WhatsApp, no hay modal debajo
  if (modalComprobanteEstadoSocio.value) {
    modalComprobanteEstadoSocio.value = false
    comprobanteEstadoSocio.value = null
    return
  }
  // Modal WhatsApp (z-50)
  if (modalWhatsApp.value) {
    modalWhatsApp.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalDetalle.value) {
      history.pushState({ modal: 'detalle' }, '', window.location.href)
    } else if (modalConfigMeses.value) {
      history.pushState({ modal: 'configMeses' }, '', window.location.href)
    } else if (modalBuscarComprobante.value) {
      history.pushState({ modal: 'buscarComprobante' }, '', window.location.href)
    } else {
      // No hay otras modales, volver a la página anterior
      router.back()
    }
    return
  }
  
  // Modal Detalle (z-50)
  if (modalDetalle.value) {
    modalDetalle.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalConfigMeses.value) {
      history.pushState({ modal: 'configMeses' }, '', window.location.href)
    } else if (modalBuscarComprobante.value) {
      history.pushState({ modal: 'buscarComprobante' }, '', window.location.href)
    } else {
      // No hay otras modales, volver a la página anterior
      router.back()
    }
    return
  }
  
  // Modal Config Meses (z-50)
  if (modalConfigMeses.value) {
    modalConfigMeses.value = false
    // Si hay otra modal abierta debajo, agregar su estado al historial
    if (modalBuscarComprobante.value) {
      history.pushState({ modal: 'buscarComprobante' }, '', window.location.href)
    } else {
      // No hay otras modales, volver a la página anterior
      router.back()
    }
    return
  }
  
  // Modal Buscar Comprobante (z-50)
  if (modalBuscarComprobante.value) {
    modalBuscarComprobante.value = false
    // No hay otras modales, volver a la página anterior
    // Asegurar scroll antes de navegar
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    router.back()
    return
  }
  
  // Si no hay modales abiertas y se presionó atrás, asegurar que el scroll esté en la parte superior
  // Esto previene que el navegador restaure una posición de scroll anterior
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}
// Registrar watchers para cada modal
handleModalBack(modalComprobanteEstadoSocio, 'comprobanteEstado')
handleModalBack(modalWhatsApp, 'whatsapp')
handleModalBack(modalDetalle, 'detalle')
handleModalBack(modalConfigMeses, 'configMeses')
handleModalBack(modalBuscarComprobante, 'buscarComprobante')
handleModalBack(modalCuotasSocio, 'cuotasSocio')
handleModalBack(modalSociosEnMora, 'sociosEnMora')
watch(modalBuscarComprobante, async (isOpen) => {
  if (isOpen) {
    // Esperar a que el DOM se actualice y luego poner el foco
    await nextTick()
    if (inputBusquedaRef.value) {
      inputBusquedaRef.value.focus()
    }
  }
})
// Función para hacer scroll al banner
async function scrollToBannerSociosEnMora() {
  if (!bannerSociosEnMoraRef.value) return
  
  await nextTick()
  
  // Hacer scroll suave al banner
  bannerSociosEnMoraRef.value.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  })
}
// Watch para detectar cuando hay socios en mora (scroll automático deshabilitado)
// watch(sociosEnMora, async (newValue, oldValue) => {
//   // Solo hacer scroll si antes no había socios en mora y ahora sí hay
//   if ((!oldValue || oldValue.length === 0) && newValue && newValue.length > 0) {
//     // Esperar un poco para que el DOM se actualice
//     await nextTick()
//     setTimeout(() => {
//       scrollToBannerSociosEnMora()
//     }, 300)
//   }
// }, { deep: true })
// Watch para asegurar scroll al inicio cuando se entra a la vista
watch(() => route.name, (newName, oldName) => {
  if (newName === 'NatilleraDetalle' && newName !== oldName) {
    // Asegurar que el scroll esté en la parte superior al entrar a la vista
    nextTick(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }, 50)
    })
  }
}, { immediate: true })
// Watch para detectar cambios en el ID de la natillera y recargar datos
watch(() => id.value, async (newId, oldId) => {
  // Solo recargar si el ID realmente cambió
  if (newId && newId !== oldId) {
    movimientosNatilleraExtra.value = []
    // Mostrar pantalla de carga cuando cambia el ID
    cargandoNatillera.value = true
    try {
      // fetchNatillera ya trae socios + cuotas; evitar duplicar consultas con fetchCuotasNatillera
      const natilleraResult = await natillerasStore.fetchNatillera(newId)
      if (!natilleraResult) {
        const uid = usuarioAutenticado.value?.id || authStore.user?.id
        if (uid) clearLastNatilleraId(uid)
        cargandoNatillera.value = false
        router.replace({ name: 'Dashboard' })
        return
      }
      let cuotasResult = []
      if (natilleraResult?.socios_natillera && natilleraResult?.cuotas) {
        cuotasResult = cuotasStore.aplicarCuotasDesdeCargaNatillera(natilleraResult.socios_natillera, natilleraResult.cuotas)
      } else {
        cuotasResult = await cuotasStore.fetchCuotasNatillera(newId, { skipMoraUpdate: true })
      }
      cuotasNatillera.value = cuotasResult || []
      
      // Cargar configuración (no bloquea)
      configStore.cargarConfiguracion()
      
      // Ocultar pantalla de carga INMEDIATAMENTE después de datos esenciales
      await nextTick()
      cargandoNatillera.value = false
      
      // Cargar datos secundarios EN SEGUNDO PLANO (no bloquean la UI)
      const configCacheWatch = natillera.value
      Promise.all([
        calcularEstadisticasAsync(),
        obtenerPrestamosVencidos(),
        cuotasStore.calcularSancionesTotales(newId, cuotasResult, configCacheWatch),
        colaboradoresStore.fetchMisInvitaciones().catch(() => {}),
        cargarMovimientosRecientesNatillera(newId)
      ]).then(([estadisticasResult, prestamosResult, sancionesResult]) => {
        if (sancionesResult?.success) {
          sancionesPorCuota.value = sancionesResult.sanciones || {}
          configSancionesActiva.value = sancionesResult.configActiva || false
        }
      }).catch(err => console.warn('Error cargando datos secundarios:', err))
      
      // Actualizar mora en segundo plano (no encadenar recalcularMultasCuotasMora: ya se calcula arriba)
      cuotasStore.actualizarEstadoMoraAutomatico(cuotasResult, newId, configCacheWatch)
        .catch(err => console.warn('Error actualizando mora en segundo plano:', err))
    } catch (error) {
      console.error('Error recargando datos de natillera:', error)
      // Ocultar pantalla de carga incluso si hay error
      cargandoNatillera.value = false
    }
  }
})
// Watch para controlar el bloqueo de scroll cuando se muestra/oculta la animación
watch(cargandoNatillera, (mostrando) => {
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
}, { immediate: true })
onMounted(async () => {
  // Activar pantalla de carga al inicio
  cargandoNatillera.value = true
  
  // Asegurar que el scroll esté en la parte superior al montar
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  
  // Prevenir restauración automática del scroll del navegador
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
  
  // Agregar listener para el botón atrás
  window.addEventListener('popstate', handlePopState)
  
  try {
    const natilleraId = props.id || route.params.id
    
    // Usar authStore.user (local, sin round-trip de red) en vez de getUser()
    const user = authStore.user
    usuarioAutenticado.value = user
    colaboradoresStore.fetchMisInvitaciones({ user }).catch(() => {})
    const natilleraResult = await natillerasStore.fetchNatillera(natilleraId)
    if (!natilleraResult) {
      if (user?.id) clearLastNatilleraId(user.id)
      cargandoNatillera.value = false
      router.replace({ name: 'Dashboard' })
      return
    }
    let cuotasResult = []
    if (natilleraResult?.socios_natillera && natilleraResult?.cuotas) {
      cuotasResult = cuotasStore.aplicarCuotasDesdeCargaNatillera(natilleraResult.socios_natillera, natilleraResult.cuotas)
    } else {
      cuotasResult = await cuotasStore.fetchCuotasNatillera(natilleraId, { skipMoraUpdate: true })
    }
    cuotasNatillera.value = cuotasResult || []
    
    // Cargar configuración (no bloquea, se ejecuta en paralelo)
    configStore.cargarConfiguracion()
    
    // Cargar información del administrador (no crítico, puede ser en paralelo)
    cargarAdminActual().catch(err => console.warn('Error cargando admin:', err))
    
    // Para admin: asignar permisos de inmediato (no requiere query).
    // Para colaborador: asignar defaults y cargar en background.
    if (natillera.value) {
      if (esAdmin.value) {
        miRol.value = 'administrador'
        misPermisos.value = {
          rol: 'administrador',
          esAdmin: true,
          permisos: {
            ver: true,
            editar_socios: true,
            gestionar_cuotas: true,
            gestionar_prestamos: true,
            gestionar_actividades: true,
            ver_auditoria: true,
            configurar: true,
            buscar_comprobante: true,
            invitar_colaboradores: true,
            notificar: true,
            cerrar_natillera: true
          }
        }
      }
    }
    
    await nextTick()
    cargandoNatillera.value = false
    
    // Fase 2: Cargar datos secundarios EN SEGUNDO PLANO (no bloquean la UI)
    const configCache = natillera.value
    const backgroundTasks = [
      calcularEstadisticasAsync(),
      obtenerPrestamosVencidos(),
      cuotasStore.calcularSancionesTotales(natilleraId, cuotasResult, configCache),
      cargarMovimientosRecientesNatillera(natilleraId)
    ]
    // Rol y permisos de colaborador: cargar en background (no bloquea el render)
    if (natillera.value && !esAdmin.value) {
      backgroundTasks.push(
        Promise.all([
          colaboradoresStore.obtenerMiRol(natilleraId),
          colaboradoresStore.obtenerMisPermisos(natilleraId, { user, skipAdminCheck: true })
        ]).then(([rol, permisos]) => {
          miRol.value = rol
          misPermisos.value = permisos
        }).catch(err => {
          console.warn('Error obteniendo rol y permisos del usuario:', err)
          miRol.value = null
          misPermisos.value = null
        })
      )
    }
    Promise.all(backgroundTasks).then((results) => {
      const sancionesResult = results[2]
      // Aplicar sanciones calculadas
      if (sancionesResult?.success) {
        sancionesPorCuota.value = sancionesResult.sanciones || {}
        configSancionesActiva.value = sancionesResult.configActiva || false
        console.log('💰 Sanciones calculadas:', Object.keys(sancionesPorCuota.value).length, 'cuotas')
      }
    }).catch(err => console.warn('Error cargando datos secundarios:', err))
    
    // Fase 3: Actualizar mora/multas en segundo plano (no bloquea la UI).
    // No encadenar recalcularMultasCuotasMora: Fase 2 ya ejecuta calcularSancionesTotales
    // y actualizarEstadoMoraAutomatico aplica sanciones a cuotas que transicionan a mora.
    cuotasStore.actualizarEstadoMoraAutomatico(cuotasResult, natilleraId, configCache)
      .catch(err => console.warn('Error actualizando mora en segundo plano:', err))
    
    // Asegurar scroll en la parte superior
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }, 50)

    const intentarTourNavDetalle = () => {
      detalleNavTourTimeoutId = null
      const nid = String(natilleraId || '')
      const uid = usuarioAutenticado.value?.id
      const ctxTour = {
        natilleraId: nid,
        userId: uid,
        userCreatedAt: usuarioAutenticado.value?.created_at,
        natilleraCreatedAt: natillera.value?.created_at
      }
      if (!nid || !uid || !shouldShowNatilleraDetalleNavTour(ctxTour)) {
        liberarModalesPostCargaRetenidosTrasTour()
        return
      }
      if (cargandoNatillera.value) {
        if (detalleNavTourIntentos < 10) {
          detalleNavTourIntentos++
          detalleNavTourTimeoutId = setTimeout(intentarTourNavDetalle, 500)
        } else {
          liberarModalesPostCargaRetenidosTrasTour()
        }
        return
      }
      if (modalSinSocios.value || modalSociosEnMora.value || showRecordatorioModal.value) {
        if (detalleNavTourIntentos < 15) {
          detalleNavTourIntentos++
          detalleNavTourTimeoutId = setTimeout(intentarTourNavDetalle, 1800)
        } else {
          liberarModalesPostCargaRetenidosTrasTour()
        }
        return
      }
      detalleNavTourIntentos = 0
      startNatilleraDetalleNavTour({
        natilleraId: nid,
        userId: uid,
        prepareSidebarForTour: dashboardSidebar?.prepareSidebarForTour,
        clearSidebarAfterTour: dashboardSidebar?.clearSidebarAfterTour,
        openSidebar: () => dashboardSidebar?.openMobile?.(),
        closeSidebar: () => dashboardSidebar?.closeMobile?.(),
        onTourStart: () => {
          recorridoDetalleNavActivo.value = true
        },
        onTourEnd: () => {
          recorridoDetalleNavActivo.value = false
          liberarModalesPostCargaRetenidosTrasTour()
        }
      })
    }
    detalleNavTourIntentos = 0
    detalleNavTourTimeoutId = setTimeout(intentarTourNavDetalle, 1400)
    
    // Mostrar modales después de un pequeño delay para que la UI se renderice primero
    postCargaModalesTimeoutId = setTimeout(async () => {
      postCargaModalesTimeoutId = null
      const ctxTourPostCarga = {
        natilleraId: String(natilleraId || ''),
        userId: usuarioAutenticado.value?.id,
        userCreatedAt: usuarioAutenticado.value?.created_at,
        natilleraCreatedAt: natillera.value?.created_at
      }
      if (
        ctxTourPostCarga.userId &&
        shouldShowNatilleraDetalleNavTour(ctxTourPostCarga)
      ) {
        modalesPostCargaRetenidosPorTour.value = true
        return
      }
      await ejecutarModalesAutomaticosPostCarga()
    }, 300)
  } catch (error) {
    console.error('Error cargando datos de natillera:', error)
    // Ocultar pantalla de carga incluso si hay error
    cargandoNatillera.value = false
  }
})


onUnmounted(() => {
  if (postCargaModalesTimeoutId != null) {
    clearTimeout(postCargaModalesTimeoutId)
    postCargaModalesTimeoutId = null
  }
  if (detalleNavTourTimeoutId != null) {
    clearTimeout(detalleNavTourTimeoutId)
    detalleNavTourTimeoutId = null
  }
  // Remover listener del botón atrás
  window.removeEventListener('popstate', handlePopState)
  // Limpiar intervalos y desbloquear scroll
  detenerRotacionMensajes()
  desbloquearScroll()
})
</script>
<style scoped>
/* Animación de pulso lento para la sección de alertas */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.92;
  }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
/* Estilos para tooltips - funcionan con hover y focus */
.tooltip-container:hover .tooltip,
.tooltip-container:focus-within .tooltip {
  visibility: visible !important;
  opacity: 1 !important;
}
/* Animación de rebote lento para el icono */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
/* Efecto shimmer para llamar la atención */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
}
/* Animación de entrada para las cuotas */
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
/* Animación de resaltado para cuotas en mora */
@keyframes mora-highlight {
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
/* Animación de entrada elegante para la sección de alerta */
@keyframes fade-in-alerta {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-alerta {
  animation: fade-in-alerta 0.6s ease-out forwards;
}
/* Efecto de barrido automático (como hover periódico) */
@keyframes sweep-hover {
  0% {
    transform: translateX(-100%) skewX(-15deg);
    opacity: 0;
  }
  5% {
    opacity: 0.8;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  95% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(100%) skewX(-15deg);
    opacity: 0;
  }
}
.animate-sweep-hover {
  animation: sweep-hover 3.5s ease-in-out infinite;
  width: 80%;
}
/* Animaciones para la pantalla de carga */
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
.animate-spin-reverse {
  animation: spin-smooth 0.8s linear infinite reverse;
}
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

/* Notificación compacta de invitación colaborador */
@keyframes fade-in-invite {
  0% {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-fade-in-invite {
  animation: fade-in-invite 0.45s ease-out forwards;
}
@keyframes sweep-invite {
  0% {
    transform: translateX(-120%) skewX(-12deg);
    opacity: 0;
  }
  12% {
    opacity: 0.5;
  }
  35% {
    opacity: 0.85;
  }
  100% {
    transform: translateX(120%) skewX(-12deg);
    opacity: 0;
  }
}
.animate-sweep-invite {
  animation: sweep-invite 4s ease-in-out infinite;
}
@keyframes bounce-slow-invite {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
.animate-bounce-slow-invite {
  animation: bounce-slow-invite 2.2s ease-in-out infinite;
}

.invitacion-notify-card {
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}
.invitacion-notify-card:hover {
  box-shadow:
    0 12px 28px -8px rgba(5, 80, 60, 0.18),
    0 4px 12px -4px rgba(16, 185, 129, 0.12),
    0 0 0 1px rgba(16, 185, 129, 0.12);
}

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

/* ─── Empty state: sin movimientos (1 col móvil, 2 cols desktop) ─── */
.natillera-empty {
  --ne-bg: hsl(120 12% 97%);
  --ne-mint: hsl(152 42% 88%);
  --ne-forest: hsl(152 55% 24%);
  --ne-pig: hsl(152 50% 28%);
  --ne-section: hsl(215 18% 38%);
  --ne-muted: hsl(215 9% 46%);

  max-width: 26rem;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1.5rem 2.25rem;
  text-align: center;
  background: var(--ne-bg);
  border-radius: 1rem;
  border: 1px solid hsl(120 8% 90%);
}

@media (min-width: 640px) {
  .natillera-empty {
    max-width: 28rem;
    padding: 2.5rem 2rem 2.5rem;
    border-radius: 1.125rem;
  }
}

@media (min-width: 1024px) {
  .natillera-empty {
    max-width: none;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 2.25rem 2.5rem 2.5rem;
    border-radius: 1.25rem;
  }
}

.natillera-empty__grid {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@media (min-width: 1024px) {
  .natillera-empty__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0 2.5rem;
    align-items: center;
  }
}

.natillera-empty__lead {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.natillera-empty__illustration {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 1.75rem;
}

@media (min-width: 1024px) {
  .natillera-empty__illustration {
    margin-bottom: 1.5rem;
  }
}

.natillera-empty__ring-outer {
  width: 7.25rem;
  height: 7.25rem;
  border-radius: 50%;
  border: 2px dashed hsl(120 6% 78%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

@media (min-width: 640px) {
  .natillera-empty__ring-outer {
    width: 7.75rem;
    height: 7.75rem;
  }
}

.natillera-empty__ring-inner {
  width: 5.25rem;
  height: 5.25rem;
  border-radius: 50%;
  background: var(--ne-mint);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .natillera-empty__ring-inner {
    width: 5.5rem;
    height: 5.5rem;
  }
}

.natillera-empty__icon {
  display: block;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--ne-pig);
}

@media (min-width: 640px) {
  .natillera-empty__icon {
    width: 2.625rem;
    height: 2.625rem;
  }
}

.natillera-empty__badge {
  position: absolute;
  bottom: 0;
  right: calc(50% - 3.625rem - 0.25rem);
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--ne-forest);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

@media (min-width: 640px) {
  .natillera-empty__badge {
    width: 2.25rem;
    height: 2.25rem;
    right: calc(50% - 3.875rem - 0.3rem);
  }
}

.natillera-empty__badge-icon {
  width: 1rem;
  height: 1rem;
  color: white;
}

@media (min-width: 640px) {
  .natillera-empty__badge-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}

.natillera-empty__title {
  margin: 0;
  font-family: var(--font-display, ui-sans-serif, system-ui, sans-serif);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: hsl(220 14% 14%);
}

@media (min-width: 640px) {
  .natillera-empty__title {
    font-size: 1.5rem;
  }
}

.natillera-empty__desc {
  margin: 0.875rem auto 0;
  max-width: 22rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--ne-muted);
  font-weight: 400;
}

@media (min-width: 1024px) {
  .natillera-empty__desc {
    max-width: 26rem;
  }
}

.natillera-empty__divider {
  margin-top: 1.75rem;
  margin-bottom: 1.5rem;
  height: 1px;
  width: 100%;
  max-width: 22rem;
  margin-left: auto;
  margin-right: auto;
  background: hsl(120 8% 88%);
}

@media (min-width: 1024px) {
  .natillera-empty__divider {
    display: none;
  }
}

.natillera-empty__hints {
  text-align: left;
  max-width: 22rem;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 1024px) {
  .natillera-empty__hints {
    max-width: none;
    margin: 0;
    padding-left: 2.5rem;
    border-left: 1px solid hsl(120 8% 88%);
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.natillera-empty__hints-title {
  margin: 0 0 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ne-section);
}

.natillera-empty__hints-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.natillera-empty__hints-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.45;
  color: hsl(220 12% 26%);
  font-weight: 500;
}

.natillera-empty__hints-icon {
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  color: hsl(152 52% 32%);
  margin-top: 0.1rem;
}
</style>
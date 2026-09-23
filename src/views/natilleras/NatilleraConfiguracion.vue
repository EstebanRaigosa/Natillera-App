<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page header (DS) -->
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <Cog6ToothIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Configuración</h1>
            <p class="ds-page-header__sub hidden sm:block">Configura el período, días de gracia y reglas de esta natillera</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Opciones de configuración con contenido expandible -->
    <div class="space-y-4">
      
      <!-- === CONFIGURACIÓN GENERAL === -->
      <div class="space-y-3">
      <button
        @click="seccionActiva = seccionActiva === 'basica' ? null : 'basica'"
        :class="[
            'w-full relative overflow-hidden rounded-2xl border transition-all duration-300 touch-manipulation',
          seccionActiva === 'basica'
              ? 'bg-[var(--brand-primary)] border-transparent shadow-lg'
              : 'bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', seccionActiva === 'basica' ? 'bg-white/20' : 'bg-[var(--brand-primary-soft)]']">
              <CurrencyDollarIcon :class="['w-6 h-6', seccionActiva === 'basica' ? 'text-white' : 'text-[var(--brand-primary)]']" />
          </div>
            <div class="flex-1 text-left min-w-0">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'basica' ? 'text-white' : 'text-gray-800']">
            Configuración General
          </h3>
              <p :class="['text-sm', seccionActiva === 'basica' ? 'text-white/80' : 'text-gray-500']">
                Período, cierre, sanciones y datos básicos
          </p>
          </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', seccionActiva === 'basica' ? 'bg-white/20' : 'bg-gray-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'basica' ? 'text-white rotate-180' : 'text-gray-500']" />
          </div>
        </div>
      </button>

        <!-- Contenido Información Básica -->
    <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'basica'" class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary)]"></div>
            <div class="relative p-5 sm:p-6 space-y-4">
              <!-- Pantalla de carga al guardar -->
              <ModalWrapper
                :show="guardandoBasica"
                :z-index="100"
                overlay-class="fixed inset-0 z-[100] flex items-center justify-center"
                card-class="relative flex flex-col items-center gap-6 p-8 rounded-3xl bg-white/95 shadow-2xl border border-white/20 max-w-sm mx-4"
                card-max-width="24rem"
              >
                    <div class="relative">
                      <div class="w-20 h-20 rounded-full border-4 border-natillera-200 border-t-natillera-500 animate-spin"></div>
                      <div class="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
                      <div class="absolute inset-2 w-16 h-16 rounded-full bg-gradient-to-br from-natillera-400 to-emerald-500 opacity-20 animate-pulse"></div>
                    </div>
                    <div class="text-center">
                      <p class="text-lg font-bold text-gray-800">Guardando configuración</p>
                      <p class="text-sm text-gray-500 mt-1">Un momento por favor...</p>
                    </div>
                    <div class="flex gap-1">
                      <span class="w-2 h-2 rounded-full bg-natillera-500 animate-bounce" style="animation-delay: 0ms"></span>
                      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
                      <span class="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
              </ModalWrapper>

              <!--
                Pestañas de Configuración General con el segmentado del design system
                (`ds-segmented`), el mismo control que usan Cuotas y el resto de la app.
                Antes eran cinco botones repetidos con paleta propia por pestaña.
              -->
              <div class="cfg-tabs">
                <!-- La barra es quien ancla las sombras: si las anclara el contenedor de
                     fuera, el degradado se estiraría sobre el contenido de la pestaña. -->
                <div class="cfg-tabs__barra">
                <div
                  ref="listaTabsGeneral"
                  class="ds-segmented cfg-tabs__lista"
                  role="tablist"
                  aria-label="Secciones de configuración general"
                  @scroll.passive="programarSombraTabs"
                >
                  <button
                    v-for="tab in TABS_GENERAL"
                    :key="tab.value"
                    type="button"
                    role="tab"
                    :data-tab="tab.value"
                    :aria-selected="tabGeneralActiva === tab.value"
                    :class="['ds-segmented__opt inline-flex items-center gap-1.5', tabGeneralActiva === tab.value ? 'is-selected' : '']"
                    @click="seleccionarTabGeneral(tab.value, $event)"
                  >
                    <component :is="tab.icono" class="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span class="sm:hidden">{{ tab.corto }}</span>
                    <span class="hidden sm:inline">{{ tab.largo }}</span>
                  </button>
                </div>
                <!--
                  En móvil no caben las cinco pestañas. Un degradado solo no se entiende:
                  estas flechas aparecen cuando queda fila por su lado y además desplazan
                  al tocarlas, así que la señal y la acción son la misma cosa.
                -->
                <Transition name="cfg-flecha">
                  <button
                    v-show="hayMasTabsIzquierda"
                    type="button"
                    class="cfg-tabs__flecha cfg-tabs__flecha--izq"
                    aria-label="Ver pestañas anteriores"
                    @click="desplazarTabs(-1)"
                  >
                    <ChevronLeftIcon class="cfg-tabs__flecha-icono w-4 h-4" />
                  </button>
                </Transition>
                <Transition name="cfg-flecha">
                  <button
                    v-show="hayMasTabsDerecha"
                    type="button"
                    class="cfg-tabs__flecha"
                    aria-label="Ver más pestañas"
                    @click="desplazarTabs(1)"
                  >
                    <ChevronRightIcon class="cfg-tabs__flecha-icono w-4 h-4" />
                  </button>
                </Transition>
                </div>

                <p v-show="hayMasTabsDerecha || hayMasTabsIzquierda" class="cfg-tabs__pista sm:hidden">
                  Desliza para ver más pestañas
                </p>

                <!-- Contenido: sin caja propia, para que se lea como parte de la pestaña -->
                <div class="cfg-tabs__panel">
              <!-- Tab Información básica -->
              <div v-if="tabGeneralActiva === 'basica'" class="cfg-tab space-y-5">
                <section class="cfg-card">
                  <header class="cfg-card__header">
                    <span class="cfg-card__icono">
                      <UserGroupIcon class="w-5 h-5" />
                    </span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Identidad</p>
                      <h3 class="cfg-card__titulo">Nombre y descripción</h3>
                      <p class="cfg-card__sub">Cómo ven la natillera los socios.</p>
                    </div>
                  </header>

                  <div class="cfg-card__body space-y-4">
                    <div>
                      <label class="ds-label" for="cfg-nombre">Nombre de la natillera *</label>
                      <input
                        id="cfg-nombre"
                        v-model="configBasica.nombre"
                        type="text"
                        class="ds-input"
                        placeholder="Ej: Natillera Familiar 2026"
                        :disabled="esVisor"
                        required
                      />
                    </div>
                    <div>
                      <div class="flex items-baseline justify-between gap-2">
                        <label class="ds-label" for="cfg-descripcion">Descripción</label>
                        <span class="text-xs text-gray-400 tabular-nums">
                          {{ (configBasica.descripcion || '').length }}/200
                        </span>
                      </div>
                      <textarea
                        id="cfg-descripcion"
                        v-model="configBasica.descripcion"
                        class="ds-input min-h-[96px]"
                        maxlength="200"
                        placeholder="Para qué es esta natillera, quién participa…"
                        :disabled="esVisor"
                      ></textarea>
                    </div>
                  </div>
                </section>

                <section class="cfg-card">
                  <header class="cfg-card__header">
                    <span class="cfg-card__icono">
                      <ArrowPathIcon class="w-5 h-5" />
                    </span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Ritmo</p>
                      <h3 class="cfg-card__titulo">Periodicidad e inicio</h3>
                      <p class="cfg-card__sub">Cada cuánto se cobra y desde cuándo.</p>
                    </div>
                  </header>

                  <!-- En escritorio, periodicidad y fecha lado a lado; en móvil, una debajo de otra. -->
                  <div class="cfg-card__body grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-start">
                    <div>
                      <label class="ds-label" id="etiqueta-periodicidad">Periodicidad *</label>
                      <!-- Mismo desplegable propio que «Tipo de sanción»: con icono y ayuda. -->
                      <div class="cfg-select" ref="selectPeriodicidad">
                        <button
                          type="button"
                          class="cfg-select__trigger"
                          :class="{ 'is-open': menuPeriodicidad }"
                          aria-haspopup="listbox"
                          :aria-expanded="menuPeriodicidad"
                          aria-labelledby="etiqueta-periodicidad"
                          :disabled="esVisor"
                          @click="menuPeriodicidad = !menuPeriodicidad"
                        >
                          <span class="cfg-select__icono">
                            <component :is="periodicidadActiva.icono" class="w-5 h-5" aria-hidden="true" />
                          </span>
                          <span class="cfg-select__texto">
                            <span class="cfg-select__titulo">{{ periodicidadActiva.label }}</span>
                            <span class="cfg-select__ayuda">{{ periodicidadActiva.ayuda }}</span>
                          </span>
                          <ChevronDownIcon class="cfg-select__chevron" aria-hidden="true" />
                        </button>

                        <Transition name="cfg-select">
                          <ul v-if="menuPeriodicidad" class="cfg-select__menu" role="listbox" :aria-activedescendant="'periodicidad-' + configBasica.periodicidad">
                            <li
                              v-for="opcion in OPCIONES_PERIODICIDAD"
                              :key="opcion.value"
                              :id="'periodicidad-' + opcion.value"
                              role="option"
                              :aria-selected="configBasica.periodicidad === opcion.value"
                              :class="['cfg-select__opcion', configBasica.periodicidad === opcion.value ? 'is-selected' : '']"
                              tabindex="0"
                              @click="elegirPeriodicidad(opcion.value)"
                              @keydown.enter.prevent="elegirPeriodicidad(opcion.value)"
                              @keydown.space.prevent="elegirPeriodicidad(opcion.value)"
                            >
                              <span class="cfg-select__icono">
                                <component :is="opcion.icono" class="w-5 h-5" aria-hidden="true" />
                              </span>
                              <span class="cfg-select__texto">
                                <span class="cfg-select__titulo">{{ opcion.label }}</span>
                                <span class="cfg-select__ayuda">{{ opcion.ayuda }}</span>
                              </span>
                              <CheckIcon v-if="configBasica.periodicidad === opcion.value" class="w-4 h-4 shrink-0 text-[color:var(--brand-primary)]" aria-hidden="true" />
                            </li>
                          </ul>
                        </Transition>
                      </div>
                    </div>

                    <div>
                      <label class="ds-label" for="cfg-fecha-inicio">Fecha de inicio *</label>
                      <input
                        id="cfg-fecha-inicio"
                        v-model="configBasica.fecha_inicio"
                        type="date"
                        class="ds-input w-full sm:min-h-[3.5rem]"
                        :disabled="esVisor"
                        required
                      />
                      <p class="text-xs text-gray-500 mt-2">
                        Fecha en que inició o iniciará la natillera.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Tab Período -->
              <div v-if="tabGeneralActiva === 'periodo'" class="cfg-tab space-y-5">
                <!--
                  Antes cada bloque traía su propia paleta (azul el rango, ámbar la gracia).
                  Ahora ambos usan la tarjeta del DS y el verde de marca; el color pasa a
                  significar algo (el aviso de «cruza años» sigue en ámbar).
                -->
                <section class="cfg-card">
                  <header class="cfg-card__header">
                    <span class="cfg-card__icono">
                      <CalendarDaysIcon class="w-5 h-5" />
                    </span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Rango</p>
                      <h3 class="cfg-card__titulo">Período de la natillera</h3>
                      <p class="cfg-card__sub">Desde qué mes y año hasta cuál se generan las cuotas.</p>
                    </div>
                  </header>

                  <div class="cfg-card__body grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="ds-label">Desde</label>
                      <div class="flex gap-2">
                        <select v-model.number="configPeriodo.mes_inicio" class="ds-input flex-1 min-w-0">
                          <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                        </select>
                        <select v-model.number="configPeriodo.anio_inicio" class="ds-input w-28 shrink-0">
                          <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label class="ds-label">Hasta</label>
                      <div class="flex gap-2">
                        <select v-model.number="configPeriodo.mes_fin" class="ds-input flex-1 min-w-0">
                          <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
                        </select>
                        <select v-model.number="configPeriodo.anio" class="ds-input w-28 shrink-0">
                          <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Pie de la tarjeta: el rango ya resuelto, para confirmar de un vistazo -->
                  <div class="cfg-card__pie">
                    <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span class="font-display font-bold text-[color:var(--brand-primary)]">
                        {{ meses.find(m => m.value === configPeriodo.mes_inicio)?.label }} {{ configPeriodo.anio_inicio }}
                      </span>
                      <ArrowLongRightIcon class="w-5 h-5 text-gray-400 shrink-0" aria-hidden="true" />
                      <span class="font-display font-bold text-[color:var(--brand-primary)]">
                        {{ meses.find(m => m.value === configPeriodo.mes_fin)?.label }} {{ configPeriodo.anio }}
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 mt-2">
                      <span class="ds-badge ds-badge--brand">
                        {{ cantidadMesesPeriodo }} {{ cantidadMesesPeriodo === 1 ? 'mes' : 'meses' }}
                      </span>
                      <span v-if="configPeriodo.anio_inicio !== configPeriodo.anio" class="ds-badge ds-badge--warning">
                        <ExclamationCircleIcon class="w-3.5 h-3.5" aria-hidden="true" />
                        Cruza años
                      </span>
                    </div>
                  </div>
                </section>

                <section class="cfg-card">
                  <header class="cfg-card__header">
                    <span class="cfg-card__icono">
                      <ClockIcon class="w-5 h-5" />
                    </span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Mora</p>
                      <h3 class="cfg-card__titulo">Días de gracia</h3>
                      <p class="cfg-card__sub">Días extra tras el vencimiento antes de que una cuota entre en mora.</p>
                    </div>
                  </header>

                  <div class="cfg-card__body flex flex-wrap items-center gap-3">
                    <label class="ds-label mb-0" for="dias-gracia-cuotas">Días</label>
                    <input
                      id="dias-gracia-cuotas"
                      v-model.number="configDiasGracia.dias_gracia"
                      type="number"
                      class="ds-input w-20 text-center font-semibold"
                      min="0"
                      max="30"
                      :disabled="esVisor"
                    />
                    <p class="text-sm text-gray-600 basis-full sm:basis-auto">
                      Las cuotas tendrán
                      <strong class="text-gray-900">{{ configDiasGracia.dias_gracia }}</strong>
                      {{ configDiasGracia.dias_gracia === 1 ? 'día' : 'días' }} de gracia.
                    </p>
                  </div>
                </section>
              </div>

              <!-- Tab Reglas de préstamos -->
              <div v-if="tabGeneralActiva === 'prestamos'" class="cfg-tab">
                <!-- Interruptor maestro: sin esto, el resto de la pestaña no aplica -->
                <label class="cfg-switch cfg-switch--destacado mb-5">
                  <input type="checkbox" v-model="configPrestamos.activo" class="cfg-switch__input" :disabled="esVisor" />
                  <span class="cfg-switch__pista" aria-hidden="true"></span>
                  <span class="min-w-0">
                    <span class="cfg-switch__titulo">Préstamos</span>
                    <span class="cfg-switch__ayuda">
                      {{ configPrestamos.activo ? 'Los socios pueden pedir prestado.' : 'No se pueden crear préstamos.' }}
                    </span>
                  </span>
                </label>

                <div v-if="configPrestamos.activo" class="space-y-4">
                  <section class="cfg-card">
                  <header class="cfg-card__header">
                    <span class="cfg-card__icono">
                      <BanknotesIcon class="w-5 h-5" />
                    </span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Condiciones</p>
                      <h3 class="cfg-card__titulo">Condiciones del préstamo</h3>
                      <p class="cfg-card__sub">Valores por defecto al crear un préstamo nuevo.</p>
                    </div>
                  </header>

                    <div class="cfg-card__body grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="ds-label">Interés mensual (%)</label>
                        <input
                          v-model.number="configPrestamos.porcentaje"
                          type="number"
                          class="ds-input"
                          min="0"
                          max="100"
                          step="0.5"
                          :disabled="esVisor"
                        />
                      </div>
                      <div>
                        <label class="ds-label">Plazo máximo (meses)</label>
                        <input
                          v-model.number="configPrestamos.plazo_maximo"
                          type="number"
                          class="ds-input"
                          min="1"
                          :disabled="esVisor"
                        />
                      </div>
                    </div>
                  </section>

                  <section class="cfg-card">
                  <header class="cfg-card__header cfg-card__header--peligro">
                    <span class="cfg-card__icono">
                      <ExclamationTriangleIcon class="w-5 h-5" />
                    </span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Atraso</p>
                      <h3 class="cfg-card__titulo">Interés de mora</h3>
                      <p class="cfg-card__sub">Sobre el capital pendiente y proporcional a los días de atraso (base de 30 días). No se capitaliza al saldo.</p>
                    </div>
                  </header>

                    <div class="cfg-card__body space-y-2">
                      <label class="ds-label">Tasa de mora (% mensual)</label>
                      <input
                        v-model.number="configPrestamos.tasa_mora"
                        type="number"
                        class="ds-input sm:max-w-[12rem]"
                        min="0"
                        max="100"
                        step="0.5"
                        :disabled="esVisor"
                      />
                      <p class="text-sm text-gray-600">
                        <template v-if="configPrestamos.tasa_mora > 0">
                          Mora diaria ≈ <strong>{{ (configPrestamos.tasa_mora / 30).toFixed(3) }}%</strong> del capital pendiente por día de atraso.
                        </template>
                        <template v-else>
                          En <strong>0</strong> no se cobra interés de mora.
                        </template>
                      </p>

                      <!-- Días de gracia propios de préstamos. Heredan el valor de
                           las cuotas hasta que se guarda uno aquí; apagados, la mora
                           corre desde el día siguiente a la fecha de la cuota. -->
                      <div class="mt-4 pt-4 border-t border-[color:var(--surface-divider)] space-y-3">
                        <label class="cfg-switch">
                          <input type="checkbox" v-model="configPrestamos.dias_gracia_activo" class="cfg-switch__input" :disabled="esVisor" />
                          <span class="cfg-switch__pista" aria-hidden="true"></span>
                          <span class="cfg-switch__titulo">Días de gracia antes de cobrar mora</span>
                        </label>

                        <div v-if="configPrestamos.dias_gracia_activo" class="space-y-2">
                          <div class="flex items-center gap-3">
                            <label class="text-sm font-semibold text-gray-700">Días</label>
                            <!-- text-base: con menos de 16 px iOS hace zoom al enfocar -->
                            <input
                              v-model.number="configPrestamos.dias_gracia"
                              type="number"
                              class="ds-input w-16 text-center text-base font-semibold py-1.5"
                              min="0"
                              max="30"
                              :disabled="esVisor"
                            />
                          </div>
                          <p class="text-sm text-gray-600">
                            La mora de una cuota del préstamo empieza a contar
                            <strong>{{ Number(configPrestamos.dias_gracia) || 0 }}</strong>
                            {{ Number(configPrestamos.dias_gracia) === 1 ? 'día' : 'días' }} después de su fecha.
                            <template v-if="Number(configPrestamos.dias_gracia) === Number(configDiasGracia.dias_gracia)">
                              Es el mismo valor que en las cuotas.
                            </template>
                            <template v-else>
                              En las cuotas son <strong>{{ configDiasGracia.dias_gracia }}</strong>; aquí se puede fijar otro.
                            </template>
                          </p>
                        </div>
                        <p v-else class="text-sm text-gray-600">
                          Apagado: la mora corre desde el día siguiente a la fecha de cada cuota.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

              </div>

              <!-- Tab Sanciones por mora -->
              <div v-if="tabGeneralActiva === 'sanciones'" class="cfg-tab space-y-5">
                <!-- Interruptor maestro: sin esto, el resto de la pestaña no aplica -->
                <label class="cfg-switch cfg-switch--destacado">
                  <input type="checkbox" v-model="configSanciones.activa" class="cfg-switch__input" :disabled="esVisor" />
                  <span class="cfg-switch__pista" aria-hidden="true"></span>
                  <span class="min-w-0">
                    <span class="cfg-switch__titulo">Sanciones por mora</span>
                    <span class="cfg-switch__ayuda">
                      {{ configSanciones.activa ? 'Se cobra multa a quien se atrase.' : 'Nadie paga multa por atrasarse.' }}
                    </span>
                  </span>
                </label>

                <div v-if="configSanciones.activa" class="space-y-5">
                  <!-- Tipo de sanción -->
                  <section class="cfg-card">
                    <header class="cfg-card__header cfg-card__header--peligro">
                      <span class="cfg-card__icono">
                        <ExclamationTriangleIcon class="w-5 h-5" />
                      </span>
                      <div class="min-w-0">
                        <p class="cfg-card__overline">Multa</p>
                        <h3 class="cfg-card__titulo">Tipo de sanción</h3>
                        <p class="cfg-card__sub">Cómo se calcula lo que debe quien se atrasa.</p>
                      </div>
                    </header>

                    <div class="cfg-card__body space-y-4">
                      <!--
                        Selector desplegable propio (no `<select>` nativo): así cabe el
                        icono y la explicación de cada tipo, que es lo que de verdad
                        distingue «Escalonada» de «Por día».
                      -->
                      <div class="sm:hidden">
                        <label class="ds-label" id="etiqueta-tipo-sancion">Tipo de sanción</label>
                        <div class="cfg-select" ref="selectTipoSancion">
                          <button
                            type="button"
                            class="cfg-select__trigger"
                            :class="{ 'is-open': menuTipoSancion }"
                            aria-haspopup="listbox"
                            :aria-expanded="menuTipoSancion"
                            aria-labelledby="etiqueta-tipo-sancion"
                            @click="menuTipoSancion = !menuTipoSancion"
                          >
                            <span class="cfg-select__icono">
                              <component :is="tipoSancionActivo.icono" class="w-5 h-5" aria-hidden="true" />
                            </span>
                            <span class="cfg-select__texto">
                              <span class="cfg-select__titulo">{{ tipoSancionActivo.label }}</span>
                              <span class="cfg-select__ayuda">{{ tipoSancionActivo.ayuda }}</span>
                            </span>
                            <ChevronDownIcon class="cfg-select__chevron" aria-hidden="true" />
                          </button>

                          <Transition name="cfg-select">
                            <ul v-if="menuTipoSancion" class="cfg-select__menu" role="listbox" :aria-activedescendant="'tipo-' + configSanciones.tipo">
                              <li
                                v-for="tipo in TIPOS_SANCION"
                                :key="tipo.value"
                                :id="'tipo-' + tipo.value"
                                role="option"
                                :aria-selected="configSanciones.tipo === tipo.value"
                                :class="['cfg-select__opcion', configSanciones.tipo === tipo.value ? 'is-selected' : '']"
                                tabindex="0"
                                @click="elegirTipoSancion(tipo.value)"
                                @keydown.enter.prevent="elegirTipoSancion(tipo.value)"
                                @keydown.space.prevent="elegirTipoSancion(tipo.value)"
                              >
                                <span class="cfg-select__icono">
                                  <component :is="tipo.icono" class="w-5 h-5" aria-hidden="true" />
                                </span>
                                <span class="cfg-select__texto">
                                  <span class="cfg-select__titulo">{{ tipo.label }}</span>
                                  <span class="cfg-select__ayuda">{{ tipo.ayuda }}</span>
                                </span>
                                <CheckIcon v-if="configSanciones.tipo === tipo.value" class="w-4 h-4 shrink-0 text-[color:var(--brand-primary)]" aria-hidden="true" />
                              </li>
                            </ul>
                          </Transition>
                        </div>
                      </div>

                      <!-- En escritorio caben las tres a la vista, sin desplegar nada -->
                      <div class="hidden sm:block">
                        <label class="ds-label">Tipo de sanción</label>
                        <div class="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Tipo de sanción">
                          <button
                            v-for="tipo in TIPOS_SANCION"
                            :key="tipo.value"
                            type="button"
                            role="radio"
                            :aria-checked="configSanciones.tipo === tipo.value"
                            :class="['cfg-opcion cfg-opcion--compacta', configSanciones.tipo === tipo.value ? 'is-selected' : '']"
                            @click="configSanciones.tipo = tipo.value"
                          >
                            <span class="cfg-opcion__marca" aria-hidden="true">
                              <CheckIcon class="w-3 h-3" />
                            </span>
                            <component :is="tipo.icono" class="cfg-opcion__icono" aria-hidden="true" />
                            <span class="cfg-opcion__titulo">{{ tipo.label }}</span>
                            <span class="cfg-opcion__ayuda">{{ tipo.ayuda }}</span>
                          </button>
                        </div>
                      </div>

                      <!-- Simple -->
                      <div v-if="configSanciones.tipo === 'simple'">
                        <label class="ds-label" for="cfg-valor-fijo">Valor de multa por mora</label>
                        <div class="cfg-money">
                          <span class="cfg-money__signo" aria-hidden="true">$</span>
                          <input
                            id="cfg-valor-fijo"
                            :value="formatNumberWithSeparators(configSanciones.valorFijo)"
                            @input="(e) => {
                              const rawValue = removeNumberFormat(e.target.value)
                              configSanciones.valorFijo = rawValue ? parseInt(rawValue) || 0 : 0
                            }"
                            @focus="(e) => e.target.select()"
                            type="text"
                            inputmode="numeric"
                            pattern="[0-9.,]*"
                            class="ds-input pl-8 w-full sm:w-52 font-semibold"
                            placeholder="0"
                            :disabled="esVisor"
                          />
                        </div>
                      </div>

                      <!-- Por día -->
                      <div v-if="configSanciones.tipo === 'diaria'">
                        <label class="ds-label" for="cfg-valor-dia">Valor por día de mora</label>
                        <p class="text-xs text-gray-500 -mt-1 mb-2">Por cada día de atraso se suma este valor a la sanción.</p>
                        <div class="cfg-money">
                          <span class="cfg-money__signo" aria-hidden="true">$</span>
                          <input
                            id="cfg-valor-dia"
                            :value="formatNumberWithSeparators(configSanciones.valorPorDia)"
                            @input="(e) => {
                              const rawValue = removeNumberFormat(e.target.value)
                              configSanciones.valorPorDia = rawValue ? parseInt(rawValue) || 0 : 0
                            }"
                            @focus="(e) => e.target.select()"
                            type="text"
                            inputmode="numeric"
                            pattern="[0-9.,]*"
                            class="ds-input pl-8 w-full sm:w-52 font-semibold"
                            placeholder="500"
                            :disabled="esVisor"
                          />
                        </div>
                      </div>

                      <!-- Escalonada -->
                      <div v-if="configSanciones.tipo === 'escalonada'">
                        <label class="ds-label">Multa según cuotas vencidas</label>
                        <div class="space-y-2">
                          <div v-for="(nivel, index) in configSanciones.niveles" :key="index" class="flex items-center gap-2.5">
                            <span class="text-sm text-gray-600 w-20 shrink-0 font-medium">
                              {{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}
                            </span>
                            <div class="cfg-money flex-1 max-w-[150px]">
                              <span class="cfg-money__signo" aria-hidden="true">$</span>
                              <input
                                :value="formatNumberWithSeparators(nivel.valor)"
                                @input="(e) => {
                                  const rawValue = removeNumberFormat(e.target.value)
                                  nivel.valor = rawValue ? parseInt(rawValue) || 0 : 0
                                }"
                                @focus="(e) => e.target.select()"
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9.,]*"
                                min="0"
                                class="ds-input pl-8 font-semibold"
                                placeholder="0"
                                :disabled="esVisor"
                              />
                            </div>
                            <button
                              v-if="configSanciones.niveles.length > 1"
                              type="button"
                              class="cfg-icono-btn cfg-icono-btn--peligro"
                              aria-label="Eliminar nivel"
                              @click="eliminarNivel(index)"
                            >
                              <XMarkIcon class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <button
                          v-if="configSanciones.niveles.length < 10"
                          type="button"
                          class="ds-btn ds-btn--secondary mt-3"
                          @click="agregarNivel"
                        >
                          <PlusIcon class="w-4 h-4" />
                          Agregar nivel
                        </button>
                      </div>
                    </div>
                  </section>

                  <!-- Intereses adicionales por días (aplica a cualquier tipo) -->
                  <section class="cfg-card">
                    <header class="cfg-card__header cfg-card__header--peligro">
                      <span class="cfg-card__icono">
                        <ClockIcon class="w-5 h-5" />
                      </span>
                      <div class="min-w-0 flex-1">
                        <p class="cfg-card__overline">Recargo</p>
                        <h3 class="cfg-card__titulo">Intereses adicionales por días</h3>
                        <p class="cfg-card__sub">Suma extra mientras la cuota siga sin pagarse.</p>
                      </div>
                      <!--
                        El handler va en el `label`, no en el `input`: al tocar el label el
                        navegador reenvía un click sintético al input y el estado se invertía
                        dos veces, así que el interruptor no cambiaba.
                      -->
                      <label class="cfg-switch cfg-switch--cabecera" @click.prevent.stop="toggleInteresesAdicionales">
                        <input
                          type="checkbox"
                          class="cfg-switch__input"
                          tabindex="0"
                          :checked="configSanciones.interesesAdicionales.activo"
                          @keydown.enter.prevent="toggleInteresesAdicionales"
                        />
                        <span class="cfg-switch__pista" aria-hidden="true"></span>
                        <span class="sr-only">Activar intereses adicionales por días</span>
                      </label>
                    </header>

                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-2"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-150 ease-out"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-2"
                    >
                      <div v-if="configSanciones.interesesAdicionales.activo" class="cfg-card__body">
                        <div class="flex flex-wrap items-center gap-2 text-sm">
                          <span class="text-gray-600 font-medium">Cada</span>
                          <input
                            v-model.number="configSanciones.interesesAdicionales.dias"
                            type="number"
                            min="1"
                            max="30"
                            class="ds-input w-20 text-center font-semibold"
                            :disabled="esVisor"
                          />
                          <span class="text-gray-600 font-medium">días, sumar</span>
                          <div class="cfg-money w-full sm:w-40">
                            <span class="cfg-money__signo" aria-hidden="true">$</span>
                            <input
                              :value="formatNumberWithSeparators(configSanciones.interesesAdicionales.valor)"
                              @input="(e) => {
                                const rawValue = removeNumberFormat(e.target.value)
                                configSanciones.interesesAdicionales.valor = rawValue ? parseInt(rawValue) || 0 : 0
                              }"
                              @focus="(e) => e.target.select()"
                              type="text"
                              inputmode="numeric"
                              pattern="[0-9.,]*"
                              class="ds-input pl-8 font-semibold"
                              placeholder="0"
                              :disabled="esVisor"
                            />
                          </div>
                        </div>
                      </div>
                    </Transition>
                  </section>

                  <!-- Devolución por mora excesiva (aplica a cualquier tipo) -->
                  <section class="cfg-card">
                    <header class="cfg-card__header cfg-card__header--peligro">
                      <span class="cfg-card__icono">
                        <ArrowPathIcon class="w-5 h-5" />
                      </span>
                      <div class="min-w-0 flex-1">
                        <p class="cfg-card__overline">Retiro</p>
                        <h3 class="cfg-card__titulo">Devolución por mora excesiva</h3>
                        <p class="cfg-card__sub">Qué pasa con quien acumula demasiadas cuotas sin pagar.</p>
                      </div>
                      <!--
                        El handler va en el `label`, no en el `input`: al tocar el label el
                        navegador reenvía un click sintético al input y el estado se invertía
                        dos veces, así que el interruptor no cambiaba.
                      -->
                      <label class="cfg-switch cfg-switch--cabecera" @click.prevent.stop="toggleDevolucion">
                        <input
                          type="checkbox"
                          class="cfg-switch__input"
                          tabindex="0"
                          :checked="configSanciones.devolucion.activo"
                          @keydown.enter.prevent="toggleDevolucion"
                        />
                        <span class="cfg-switch__pista" aria-hidden="true"></span>
                        <span class="sr-only">Activar devolución por mora excesiva</span>
                      </label>
                    </header>

                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-2"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-2"
                    >
                      <div v-if="configSanciones.devolucion.activo" class="cfg-card__body space-y-4">
                        <div class="flex flex-wrap items-center gap-2 text-sm">
                          <span class="text-gray-600 font-medium">Después de</span>
                          <input
                            v-model.number="configSanciones.devolucion.cuotasLimite"
                            type="number"
                            min="1"
                            max="12"
                            class="ds-input w-20 text-center font-semibold"
                            :disabled="esVisor"
                          />
                          <span class="text-gray-600 font-medium">cuotas, multa del</span>
                          <input
                            v-model.number="configSanciones.devolucion.porcentajeMulta"
                            type="number"
                            min="0"
                            max="100"
                            class="ds-input w-20 text-center font-semibold"
                            :disabled="esVisor"
                          />
                          <span class="text-gray-600 font-medium">%</span>
                        </div>
                        <label class="cfg-switch" @click.prevent.stop="toggleSinUtilidades">
                          <input
                            type="checkbox"
                            class="cfg-switch__input"
                            tabindex="0"
                            :checked="configSanciones.devolucion.sinUtilidades"
                            @keydown.enter.prevent="toggleSinUtilidades"
                          />
                          <span class="cfg-switch__pista" aria-hidden="true"></span>
                          <span class="min-w-0">
                            <span class="cfg-switch__titulo">Devolución sin utilidades</span>
                            <span class="cfg-switch__ayuda">Se le devuelve solo lo ahorrado.</span>
                          </span>
                        </label>
                      </div>
                    </Transition>
                  </section>

                  <!-- Resumen de lo configurado -->
                  <div class="ds-callout">
                    <ClipboardDocumentListIcon class="ds-callout__icon w-5 h-5" />
                    <div class="min-w-0">
                      <p><span class="ds-callout__title">Resumen.</span>
                        <template v-if="configSanciones.tipo === 'simple'">
                          Multa fija de <strong>${{ formatMoney(configSanciones.valorFijo) }}</strong> por cuota en mora.
                        </template>
                        <template v-else-if="configSanciones.tipo === 'diaria'">
                          <strong>${{ formatMoney(configSanciones.valorPorDia) }}</strong> por cada día después del vencimiento (y de los días de gracia).
                        </template>
                        <template v-else>Multa progresiva según las cuotas vencidas:</template>
                      </p>
                      <ul v-if="configSanciones.tipo === 'escalonada'" class="mt-1.5 space-y-0.5">
                        <li v-for="nivel in configSanciones.niveles" :key="nivel.cuotas">
                          {{ nivel.cuotas }} {{ nivel.cuotas === 1 ? 'cuota' : 'cuotas' }}:
                          <strong>${{ formatMoney(nivel.valor) }}</strong>
                        </li>
                      </ul>
                      <p v-if="configSanciones.interesesAdicionales?.activo" class="mt-2">
                        Además, cada <strong>{{ configSanciones.interesesAdicionales.dias }}</strong>
                        {{ configSanciones.interesesAdicionales.dias === 1 ? 'día' : 'días' }} en mora se suman
                        <strong>${{ formatMoney(configSanciones.interesesAdicionales.valor) }}</strong> a la sanción.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab Cierre de Natillera -->
              <div v-if="tabGeneralActiva === 'cierre'" class="cfg-tab">
                <div class="ds-callout mb-5">
                  <ArchiveBoxIcon class="ds-callout__icon w-5 h-5" />
                  <p>
                    <span class="ds-callout__title">Al cerrar.</span>
                    Primero se aparta la administración y con lo que queda se calcula cuánto
                    le toca a cada socio, según lo que configures aquí.
                  </p>
                </div>

                <!--
                  Administración. Va lo primero porque se descuenta ANTES de repartir: lo
                  que se configure debajo se aplica sobre lo que quede después de esto.
                  Mismo lenguaje visual que el resto de la pestaña (tarjetas seleccionables
                  con check), y con el valor en pesos a la vista: un «2 %» no dice nada
                  hasta que se ve que son seiscientos mil.
                -->
                <div class="cfg-seccion mb-5">
                  <header class="cfg-card__header cfg-seccion__header">
                    <span class="cfg-card__icono"><BanknotesIcon class="w-5 h-5" /></span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Antes de repartir</p>
                      <h3 class="cfg-card__titulo">Gastos de administración</h3>
                      <p class="cfg-card__sub">Define el porcentaje que se queda la natillera para cubrir sus gastos de administración.</p>
                    </div>
                  </header>

                  <div>
                    <!-- Cuánto -->
                    <label class="ds-label">¿Qué porcentaje?</label>
                    <div class="grid grid-cols-4 gap-2 mb-3">
                      <button
                        v-for="opcion in PORCENTAJES_ADMINISTRACION"
                        :key="opcion"
                        type="button"
                        :aria-pressed="Number(configCierre.administracion.porcentaje) === opcion"
                        :class="['cfg-chip', Number(configCierre.administracion.porcentaje) === opcion ? 'is-selected' : '']"
                        @click="configCierre.administracion.porcentaje = opcion"
                      >{{ opcion }}%</button>
                    </div>

                    <div class="mb-3 flex items-center gap-2">
                      <label for="admin-porcentaje" class="text-xs text-gray-600 whitespace-nowrap">Otro valor</label>
                      <div class="relative flex-1">
                        <input
                          id="admin-porcentaje"
                          v-model.number="configCierre.administracion.porcentaje"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          inputmode="decimal"
                          class="ds-input w-full pr-8"
                          placeholder="0"
                        />
                        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                      </div>
                    </div>

                    <!-- Sobre qué -->
                    <label class="ds-label">¿Sobre qué se calcula?</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        v-for="base in BASES_ADMINISTRACION"
                        :key="base.valor"
                        type="button"
                        role="radio"
                        :aria-checked="configCierre.administracion.base === base.valor"
                        :class="['cfg-opcion', configCierre.administracion.base === base.valor ? 'is-selected' : '']"
                        @click="configCierre.administracion.base = base.valor"
                      >
                        <span class="cfg-opcion__marca" aria-hidden="true">
                          <CheckIcon class="w-3 h-3" />
                        </span>
                        <span class="cfg-opcion__titulo">{{ base.titulo }}</span>
                        <span class="cfg-opcion__ayuda">{{ base.detalle }}</span>
                      </button>
                    </div>

                    <!-- Cuánto es eso en plata, con los datos de hoy -->
                    <div
                      v-if="Number(configCierre.administracion.porcentaje) > 0"
                      class="cfg-estimado mt-3"
                    >
                      <div v-if="baseAdministracion.cargando" class="text-xs text-gray-500">
                        Calculando con los datos de hoy…
                      </div>
                      <template v-else-if="baseAdministracion.total > 0">
                        <div class="flex items-baseline justify-between gap-3">
                          <span class="text-xs text-gray-600">Hoy serían</span>
                          <span class="font-display text-lg font-extrabold tabular-nums text-[color:var(--brand-primary)]">
                            ${{ formatMoney(montoAdministracionEstimado) }}
                          </span>
                        </div>
                        <p class="mt-1 text-[11px] leading-snug text-gray-500">
                          {{ configCierre.administracion.porcentaje }}% de
                          ${{ formatMoney(baseAdministracion.total) }}
                          ({{ configCierre.administracion.base === 'total'
                              ? 'ahorros + utilidades'
                              : 'utilidades' }}).
                          Quedarían ${{ formatMoney(baseAdministracion.total - montoAdministracionEstimado) }}
                          para repartir entre los socios.
                        </p>
                      </template>
                      <p v-else class="text-xs text-gray-500">
                        Todavía no hay nada recogido para estimarlo.
                      </p>
                    </div>
                  </div>
                </div>

                <!--
                  Reparto. Cada decisión es binaria (equitativa / proporcional), así que va
                  en un switch segmentado en vez de dos tarjetas: se lee de un vistazo y la
                  ayuda de la opción elegida queda debajo, en una sola línea.
                -->
                <!-- Configuración de Utilidades de Actividades -->
                <div class="cfg-seccion mb-5">
                  <header class="cfg-card__header cfg-seccion__header">
                    <span class="cfg-card__icono"><CalendarDaysIcon class="w-5 h-5" /></span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Reparto</p>
                      <h3 class="cfg-card__titulo">Utilidades de actividades</h3>
                      <p class="cfg-card__sub">Todas las actividades igual, o cada una por separado.</p>
                    </div>
                  </header>

                  <label class="ds-label">Modo de configuración</label>
                  <SwitchSegmentado
                    v-model="configCierre.modoActividades"
                    :opciones="MODOS_CONFIG_ACTIVIDADES"
                    aria-label="Modo de configuración de actividades"
                    class="mb-4"
                  />

                  <!-- Configuración General -->
                  <div v-if="configCierre.modoActividades === 'general'">
                    <label class="ds-label">Reparto de todas las actividades</label>
                    <SwitchSegmentado
                      v-model="configCierre.actividades.general"
                      :opciones="MODOS_ACTIVIDADES"
                      aria-label="Reparto de las utilidades de todas las actividades"
                    />
                  </div>

                  <!-- Configuración Individual -->
                  <ul v-else class="divide-y divide-[color:var(--surface-divider)]">
                    <li
                      v-for="tipo in tiposActividades"
                      :key="tipo.valor"
                      class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div class="min-w-0">
                        <h4 class="font-semibold text-gray-800 text-sm">{{ tipo.label }}</h4>
                        <p class="text-xs text-gray-500 mt-0.5">{{ tipo.descripcion }}</p>
                      </div>
                      <SwitchSegmentado
                        v-model="configCierre.actividades[tipo.valor]"
                        :opciones="MODOS_ACTIVIDADES_TIPO"
                        :aria-label="`Reparto de ${tipo.label}`"
                        class="sm:w-64 sm:shrink-0"
                      />
                    </li>
                  </ul>
                </div>

                <!-- Configuración de Utilidades de Préstamos -->
                <div class="cfg-seccion mb-5">
                  <header class="cfg-card__header cfg-seccion__header">
                    <span class="cfg-card__icono"><BanknotesIcon class="w-5 h-5" /></span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Reparto</p>
                      <h3 class="cfg-card__titulo">Utilidades de préstamos</h3>
                      <p class="cfg-card__sub">Cómo se reparten los intereses que generaron los préstamos.</p>
                    </div>
                  </header>
                  <SwitchSegmentado
                    v-model="configCierre.prestamos"
                    :opciones="MODOS_PRESTAMOS"
                    aria-label="Reparto de las utilidades de préstamos"
                  />
                </div>

                <!-- Configuración de Sanciones al cierre -->
                <div class="cfg-seccion mb-5">
                  <header class="cfg-card__header cfg-card__header--peligro cfg-seccion__header">
                    <span class="cfg-card__icono"><ExclamationTriangleIcon class="w-5 h-5" /></span>
                    <div class="min-w-0">
                      <p class="cfg-card__overline">Reparto</p>
                      <h3 class="cfg-card__titulo">Sanciones al cierre</h3>
                      <p class="cfg-card__sub">Cómo se reparten las multas por mora al cerrar.</p>
                    </div>
                  </header>
                  <SwitchSegmentado
                    v-model="configCierre.sanciones"
                    :opciones="MODOS_SANCIONES"
                    aria-label="Reparto de las sanciones al cierre"
                  />
                </div>

                <!--
                  Utilidades adicionales (ingresos desde el Cuadre de Caja). La explicación
                  va en línea bajo la cabecera y no en un tooltip flotante: `.cfg-seccion`
                  tiene `overflow: hidden` y lo recortaría.
                -->
                <div class="cfg-seccion mb-6">
                  <header class="cfg-card__header cfg-seccion__header">
                    <span class="cfg-card__icono"><ArrowTrendingUpIcon class="w-5 h-5" /></span>
                    <div class="min-w-0 flex-1">
                      <p class="cfg-card__overline">Reparto</p>
                      <h3 class="cfg-card__titulo">Utilidades adicionales</h3>
                      <p class="cfg-card__sub">Los ingresos a utilidades registrados desde el Cuadre de Caja.</p>
                    </div>
                    <button
                      type="button"
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 active:bg-white/25 touch-manipulation"
                      :aria-expanded="tooltipUtilidadesAdicionales"
                      aria-controls="ayuda-utilidades-adicionales"
                      aria-label="Información sobre utilidades adicionales"
                      @click="tooltipUtilidadesAdicionales = !tooltipUtilidadesAdicionales"
                    >
                      <InformationCircleIcon class="w-5 h-5" />
                    </button>
                  </header>
                  <p
                    v-show="tooltipUtilidadesAdicionales"
                    id="ayuda-utilidades-adicionales"
                    class="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-snug text-emerald-900"
                  >
                    Son las que se ingresan desde el <strong>Cuadre de Caja</strong> con
                    <em>Ingreso → Utilidades</em> (donaciones, intereses extra, ajustes a favor
                    del fondo). Los egresos a «utilidades» se restan antes de repartir.
                  </p>
                  <SwitchSegmentado
                    v-model="configCierre.utilidades_adicionales"
                    :opciones="MODOS_ADICIONALES"
                    aria-label="Reparto de las utilidades adicionales"
                  />
                </div>
              </div>

                </div>
                </div>

              <div class="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button
            @click="guardarConfigBasica"
            :disabled="guardandoBasica || esVisor"
            class="ds-btn ds-btn--primary"
          >
            {{ guardandoBasica ? 'Guardando...' : 'Guardar toda la configuración' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>
      </div>

      <!--
        === MENSAJES ===
        Oculta a petición del usuario: la sección se retoma más adelante, por eso queda
        el bloque completo en su sitio y solo se apaga con el flag.
      -->
      <div v-if="MOSTRAR_SECCION_MENSAJES" class="space-y-3">
      <button
        @click="seccionActiva = seccionActiva === 'mensajes' ? null : 'mensajes'"
        :class="[
            'w-full relative overflow-hidden rounded-2xl border transition-all duration-300 touch-manipulation',
          seccionActiva === 'mensajes'
              ? 'bg-[var(--brand-primary)] border-transparent shadow-lg'
              : 'bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', seccionActiva === 'mensajes' ? 'bg-white/20' : 'bg-[var(--brand-primary-soft)]']">
              <ChatBubbleLeftRightIcon :class="['w-6 h-6', seccionActiva === 'mensajes' ? 'text-white' : 'text-[var(--brand-primary)]']" />
          </div>
            <div class="flex-1 text-left min-w-0">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'mensajes' ? 'text-white' : 'text-gray-800']">
            Mensajes
          </h3>
              <p :class="['text-sm', seccionActiva === 'mensajes' ? 'text-white/80' : 'text-gray-500']">
                Personaliza los mensajes de WhatsApp
          </p>
          </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', seccionActiva === 'mensajes' ? 'bg-white/20' : 'bg-gray-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'mensajes' ? 'text-white rotate-180' : 'text-gray-500']" />
          </div>
        </div>
      </button>

        <!-- Contenido Mensajes -->
    <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'mensajes'" class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary)]"></div>
            <div class="relative p-5 sm:p-6">
              <!-- Tabs para tipos de mensajes - Destacado -->
              <div class="mb-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-lg p-4">
                <div class="mb-2">
                  <h3 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Tipo de Mensaje
                  </h3>
                  <p class="text-xs text-gray-500 mt-0.5">Selecciona el tipo de mensaje que deseas configurar</p>
                </div>
                <div class="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 overflow-visible">
                  <button
                    @click="tipoMensajeActivo = 'individual'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'individual'
                        ? 'border-green-500 text-green-700 bg-green-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <UserIcon class="w-5 h-5 flex-shrink-0" />
                    <span>Individual</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'general'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'general'
                        ? 'border-purple-500 text-purple-700 bg-purple-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <UsersIcon class="w-5 h-5 flex-shrink-0" />
                    <span>General</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'mora'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'mora'
                        ? 'border-red-500 text-red-700 bg-red-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <ExclamationTriangleIcon class="w-5 h-5 flex-shrink-0" />
                    <span>En Mora</span>
                  </button>
                  <button
                    @click="tipoMensajeActivo = 'pendiente'"
                    :class="[
                      'px-3 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold transition-all rounded-lg shadow-sm border-2 flex items-center justify-center gap-1.5 sm:gap-2',
                      tipoMensajeActivo === 'pendiente'
                        ? 'border-amber-500 text-amber-700 bg-amber-50 shadow-md sm:scale-105'
                        : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                    ]"
                  >
                    <ClockIcon class="w-5 h-5 flex-shrink-0" />
                    <span>Pendiente</span>
                  </button>
                </div>
              </div>

              <!-- Contenido según tab activo -->
              <div class="space-y-4">
                <!-- Mensaje Individual -->
                <div v-if="tipoMensajeActivo === 'individual'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje enviado a cada socio individualmente.
                  </p>
                  
                  <!-- Variables disponibles para Individual -->
                  <div class="p-3 bg-green-50/50 rounded-lg border border-green-200">
                    <h5 class="text-xs font-semibold text-green-700 mb-2">Variables Disponibles</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        type="button"
                        @click="insertarVariable('nombre')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-blue-600 font-semibold">{{nombre}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Nombre del socio</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </button>
                      <button 
                        type="button"
                        @click="insertarVariable('monto')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-green-200 hover:border-green-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{monto}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Monto de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref="textareaIndividual"
                    v-model="mensajeIndividual"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje individual..."
                  ></textarea>
                  <div class="p-3 bg-green-50/50 border border-green-200 rounded-lg">
                    <p class="text-xs font-semibold text-green-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewIndividual }}</p>
                  </div>
                </div>

                <!-- Mensaje General -->
                <div v-if="tipoMensajeActivo === 'general'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje que se puede enviar a todos los socios a la vez. No usa variables personalizadas.
                  </p>
                  <textarea
                    v-model="mensajeGeneral"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje general..."
                  ></textarea>
                  <div class="p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
                    <p class="text-xs font-semibold text-purple-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ mensajeGeneral }}</p>
                  </div>
                </div>

                <!-- Mensaje Cuota en Mora -->
                <div v-if="tipoMensajeActivo === 'mora'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje que se envía cuando una cuota está en mora.
                  </p>
                  
                  <!-- Variables disponibles para Cuota en Mora -->
                  <div class="p-3 bg-red-50/50 rounded-lg border border-red-200">
                    <h5 class="text-xs font-semibold text-red-700 mb-2">Variables Disponibles</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        @click="insertarVariableCuota('nombre', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-blue-600 font-semibold">{{nombre}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Nombre del socio</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('mes', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{mes}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Mes de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('anio', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{anio}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Año de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('valor_cuota', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{valor_cuota}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Valor de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('sancion', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-orange-600 font-semibold">{{sancion}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Sanción aplicada</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('total', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-purple-600 font-semibold">{{total}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Total a pagar (cuota + sanción)</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('fecha_vencimiento', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-gray-600 font-semibold">{{fecha_vencimiento}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Fecha de vencimiento</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('dias_mora', 'mensajeCuotaMora')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-red-600 font-semibold">{{dias_mora}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Días en mora</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref="textareaCuotaMora"
                    v-model="mensajeCuotaMora"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje para cuota en mora..."
                  ></textarea>
                  <div class="p-3 bg-red-50/50 border border-red-200 rounded-lg">
                    <p class="text-xs font-semibold text-red-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewCuotaMora }}</p>
                  </div>
                </div>

                <!-- Mensaje Cuota Pendiente -->
                <div v-if="tipoMensajeActivo === 'pendiente'" class="space-y-4">
                  <p class="text-xs text-gray-500">
                    Mensaje que se envía cuando una cuota está pendiente.
                  </p>
                  
                  <!-- Variables disponibles para Cuota Pendiente -->
                  <div class="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <h5 class="text-xs font-semibold text-amber-700 mb-2">Variables Disponibles</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button 
                        @click="insertarVariableCuota('nombre', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-blue-600 font-semibold">{{nombre}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Nombre del socio</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('mes', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{mes}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Mes de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('anio', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{anio}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Año de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('valor_cuota', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-green-600 font-semibold">{{valor_cuota}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Valor de la cuota</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('total', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-purple-600 font-semibold">{{total}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Total a pagar</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                      <button 
                        @click="insertarVariableCuota('fecha_vencimiento', 'mensajeCuotaPendiente')"
                        class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div>
                          <code class="text-xs font-mono text-gray-600 font-semibold">{{fecha_vencimiento}}</code>
                          <p class="text-[10px] text-gray-500 mt-0.5">Fecha de vencimiento</p>
                        </div>
                        <PlusIcon class="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref="textareaCuotaPendiente"
                    v-model="mensajeCuotaPendiente"
                    @keydown.enter.stop
                    class="input-field min-h-[140px] font-mono text-sm"
                    placeholder="Escribe el mensaje para cuota pendiente..."
                  ></textarea>
                  <div class="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <p class="text-xs font-semibold text-amber-700 mb-1.5">Vista previa</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ vistaPreviewCuotaPendiente }}</p>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button @click="restaurarDefectoMensajes" :disabled="esVisor" class="ds-btn ds-btn--secondary">
            <ArrowPathIcon class="w-4 h-4" />
                  Restaurar
          </button>
          <button
            @click="guardarMensajes"
            :disabled="guardandoMensajes || esVisor"
                  class="ds-btn ds-btn--primary flex-1 sm:flex-none"
          >
            {{ guardandoMensajes ? 'Guardando...' : 'Guardar Mensajes' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>
      </div>


      <!-- === REASIGNAR NATILLERA (Solo Superusuario) === -->
      <div v-if="esSuperUsuario" class="space-y-3">
        <button
          @click="seccionActiva = seccionActiva === 'reasignar' ? null : 'reasignar'"
          :class="[
            'w-full relative overflow-hidden rounded-2xl border transition-all duration-300 touch-manipulation',
            seccionActiva === 'reasignar'
              ? 'bg-[var(--brand-primary)] border-transparent shadow-lg'
              : 'bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', seccionActiva === 'reasignar' ? 'bg-white/20' : 'bg-[var(--brand-primary-soft)]']">
              <UserIcon :class="['w-6 h-6', seccionActiva === 'reasignar' ? 'text-white' : 'text-[var(--brand-primary)]']" />
            </div>
            <div class="flex-1 text-left min-w-0">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'reasignar' ? 'text-white' : 'text-gray-800']">
                Reasignar Administrador
              </h3>
              <p :class="['text-sm', seccionActiva === 'reasignar' ? 'text-white/80' : 'text-gray-500']">
                Cambiar el administrador de esta natillera
              </p>
            </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', seccionActiva === 'reasignar' ? 'bg-white/20' : 'bg-gray-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'reasignar' ? 'text-white rotate-180' : 'text-gray-500']" />
            </div>
          </div>
        </button>

        <!-- Contenido Reasignar -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'reasignar'" class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary)]"></div>
            <div class="relative p-5 sm:p-6">
              <div class="mb-6">
                <h4 class="text-lg font-bold text-gray-800 mb-2">Administrador Actual</h4>
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p class="text-sm text-gray-600 mb-1">Email:</p>
                  <p class="font-semibold text-gray-800">{{ adminActual?.email || 'Cargando...' }}</p>
                  <p v-if="adminActual?.nombre" class="text-sm text-gray-500 mt-1">{{ adminActual.nombre }}</p>
                </div>
              </div>

              <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar Nuevo Administrador
                </label>
                <div class="relative">
                  <input
                    v-model="busquedaUsuario"
                    type="text"
                    placeholder="Buscar usuario por email o nombre (o ver todos los usuarios abajo)..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500"
                    @input="buscarUsuarios"
                  />
                  <MagnifyingGlassIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <!-- Lista de usuarios -->
                <div v-if="buscandoUsuarios && !usuariosCargados" class="mt-4 text-center py-8">
                  <div class="animate-spin w-8 h-8 border-4 border-natillera-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p class="text-sm text-gray-500">Cargando usuarios...</p>
                </div>

                <div v-else-if="usuariosEncontrados.length > 0" class="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                  <div class="p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    <p class="text-xs text-gray-600 font-semibold">
                      {{ usuariosEncontrados.length }} {{ usuariosEncontrados.length === 1 ? 'usuario encontrado' : 'usuarios encontrados' }}
                    </p>
                  </div>
                  <button
                    v-for="usuario in usuariosEncontrados"
                    :key="usuario.id"
                    @click="seleccionarUsuario(usuario)"
                    :class="[
                      'w-full p-4 text-left hover:bg-natillera-50 transition-colors border-b border-gray-100 last:border-b-0',
                      usuarioSeleccionado?.id === usuario.id ? 'bg-natillera-100 border-natillera-300' : ''
                    ]"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white font-semibold">
                        {{ (usuario.nombre || usuario.email || 'U').charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex-1">
                        <p class="font-semibold text-gray-800">{{ usuario.nombre || 'Sin nombre' }}</p>
                        <p class="text-sm text-gray-500">{{ usuario.email }}</p>
                      </div>
                      <CheckCircleIcon v-if="usuarioSeleccionado?.id === usuario.id" class="w-6 h-6 text-[var(--brand-primary)]" />
                    </div>
                  </button>
                </div>

                <div v-else-if="usuariosCargados && usuariosEncontrados.length === 0" class="mt-4 text-center py-8 text-gray-500">
                  <p class="text-sm">No se encontraron usuarios con ese criterio de búsqueda</p>
                  <button
                    @click="busquedaUsuario = ''; filtrarUsuarios()"
                    class="mt-2 text-sm text-natillera-700 hover:text-natillera-800 underline"
                  >
                    Ver todos los usuarios
                  </button>
                </div>
              </div>

              <div v-if="usuarioSeleccionado" class="mb-6 p-4 bg-natillera-50 border-2 border-natillera-200 rounded-xl">
                <p class="text-sm font-semibold text-natillera-700 mb-2">Nuevo Administrador Seleccionado:</p>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold text-lg">
                    {{ (usuarioSeleccionado.nombre || usuarioSeleccionado.email || 'U').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-800">{{ usuarioSeleccionado.nombre || 'Sin nombre' }}</p>
                    <p class="text-sm text-gray-600">{{ usuarioSeleccionado.email }}</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="cancelarReasignacion"
                  class="ds-btn ds-btn--secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  @click="confirmarReasignacion"
                  :disabled="!usuarioSeleccionado || guardandoReasignacion"
                  class="ds-btn ds-btn--primary flex-1"
                >
                  {{ guardandoReasignacion ? 'Reasignando...' : 'Reasignar Natillera' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- === COLABORADORES === -->
      <div class="space-y-3">
        <button
          @click="seccionActiva = seccionActiva === 'colaboradores' ? null : 'colaboradores'"
          :class="[
            'w-full relative overflow-hidden rounded-2xl border transition-all duration-300 touch-manipulation',
            seccionActiva === 'colaboradores'
              ? 'bg-[var(--brand-primary)] border-transparent shadow-lg'
              : 'bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
          ]"
        >
          <div class="relative p-4 sm:p-5 flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', seccionActiva === 'colaboradores' ? 'bg-white/20' : 'bg-[var(--brand-primary-soft)]']">
              <UserGroupIcon :class="['w-6 h-6', seccionActiva === 'colaboradores' ? 'text-white' : 'text-[var(--brand-primary)]']" />
            </div>
            <div class="flex-1 text-left min-w-0">
              <h3 :class="['text-lg font-display font-bold', seccionActiva === 'colaboradores' ? 'text-white' : 'text-gray-800']">
                Colaboradores
              </h3>
              <p :class="['text-sm', seccionActiva === 'colaboradores' ? 'text-white/80' : 'text-gray-500']">
                Gestiona quién puede acceder a esta natillera
              </p>
            </div>
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', seccionActiva === 'colaboradores' ? 'bg-white/20' : 'bg-gray-100']">
              <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', seccionActiva === 'colaboradores' ? 'text-white rotate-180' : 'text-gray-500']" />
            </div>
          </div>
        </button>

        <!-- Contenido Colaboradores -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="seccionActiva === 'colaboradores'" class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 ml-4 sm:ml-6">
            <div class="absolute top-0 left-0 w-1 h-full bg-[var(--brand-primary)]"></div>
            <div class="relative p-5 sm:p-6">
              <ColaboradoresManager
                :natillera-id="id"
                :admin-id="natillera?.admin_id"
                :admin-email="adminActual?.email || ''"
                :admin-nombre="adminActual?.nombre || adminActual?.email || ''"
                :es-admin="esAdmin"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Mensaje de éxito/error -->
    <div v-if="mensaje" :class="[
      'p-3 rounded-xl text-sm flex items-center gap-2',
      mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    ]">
      <component :is="mensaje.tipo === 'exito' ? CheckCircleIcon : ExclamationCircleIcon" class="w-5 h-5" />
      {{ mensaje.texto }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNatillerasStore } from '../../stores/natilleras'
import { useConfiguracionStore } from '../../stores/configuracion'
import { useUsersStore } from '../../stores/users'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useCuotasStore } from '../../stores/cuotas'
import { parseReglasInteresPrestamo } from '../../utils/natilleraPrestamos'
import { supabase } from '../../lib/supabase'
import { calcularUtilidadesReales } from '../../composables/useUtilidadesReales'
import ColaboradoresManager from '../../components/ColaboradoresManager.vue'

import BackButton from '../../components/BackButton.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import SwitchSegmentado from '../../components/SwitchSegmentado.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { 
  ArrowLeftIcon,
  ArrowLongRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  UsersIcon,
  UserGroupIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const natillerasStore = useNatillerasStore()
const configStore = useConfiguracionStore()
const usersStore = useUsersStore()
const colaboradoresStore = useColaboradoresStore()
const cuotasStore = useCuotasStore()
const guardandoBasica = ref(false)
useBodyScrollLock(guardandoBasica)
const guardandoPeriodo = ref(false)
const guardandoDiasGracia = ref(false)
const guardandoMensajes = ref(false)
const guardandoSanciones = ref(false)
const guardandoReasignacion = ref(false)
const mensaje = ref(null)
const textareaIndividual = ref(null)
const seccionActiva = ref('basica') // 'basica' por defecto (Configuración General desplegada), 'mensajes', 'reasignar', 'colaboradores' o null
// Interruptor de la sección de Mensajes: apagada hasta que se retome (no se borró nada).
const MOSTRAR_SECCION_MENSAJES = false
const tabGeneralActiva = ref('basica') // 'basica' | 'periodo' | 'cierre' | 'sanciones' (tabs dentro de Configuración General)
// Pestañas de Configuración General: la lista vive aquí para no repetir cinco botones
// casi idénticos en el template.
// Reparto al cierre: los dos modos posibles, con la explicación propia de cada contexto.
const MODOS_CONFIG_ACTIVIDADES = [
  { value: 'general', label: 'General', ayuda: 'El mismo reparto para todas las actividades' },
  { value: 'individual', label: 'Individual', ayuda: 'Un reparto distinto para cada tipo de actividad' }
]
const MODOS_ACTIVIDADES = [
  { value: 'equitativa', label: 'Equitativa', ayuda: 'Las utilidades se reparten a partes iguales entre todos los socios' },
  { value: 'proporcional', label: 'Proporcional', ayuda: 'Las utilidades se reparten según lo ahorrado por cada socio' }
]
const MODOS_ACTIVIDADES_TIPO = [
  { value: 'equitativa', label: 'Equitativa', ayuda: 'A partes iguales' },
  { value: 'proporcional', label: 'Proporcional', ayuda: 'Según lo ahorrado' }
]
const MODOS_PRESTAMOS = [
  { value: 'equitativa', label: 'Equitativa', ayuda: 'Los intereses se reparten a partes iguales entre todos los socios' },
  { value: 'proporcional', label: 'Proporcional', ayuda: 'Los intereses se reparten según lo ahorrado por cada socio' }
]
const MODOS_SANCIONES = [
  { value: 'equitativa', label: 'Equitativa', ayuda: 'Las multas se reparten a partes iguales entre todos los socios' },
  { value: 'proporcional', label: 'Proporcional', ayuda: 'Las multas se reparten según lo ahorrado por cada socio' }
]
const MODOS_ADICIONALES = [
  { value: 'equitativa', label: 'Equitativa', ayuda: 'Las utilidades adicionales se reparten a partes iguales entre todos los socios' },
  { value: 'proporcional', label: 'Proporcional', ayuda: 'Las utilidades adicionales se reparten según lo ahorrado por cada socio' }
]

// Tipos de sanción por mora, para no repetir tres botones iguales en el template.
const TIPOS_SANCION = [
  { value: 'simple', label: 'Simple', ayuda: 'Un valor fijo', icono: CurrencyDollarIcon },
  { value: 'escalonada', label: 'Escalonada', ayuda: 'Sube con las cuotas', icono: ChartBarIcon },
  { value: 'diaria', label: 'Por día', ayuda: 'Por día de atraso', icono: ClockIcon }
]

const menuTipoSancion = ref(false)
const selectTipoSancion = ref(null)
const tipoSancionActivo = computed(
  () => TIPOS_SANCION.find(t => t.value === configSanciones.value.tipo) || TIPOS_SANCION[0]
)

function elegirTipoSancion(valor) {
  configSanciones.value.tipo = valor
  menuTipoSancion.value = false
}

// Cerrar al tocar fuera o con Escape. En iOS el `click` fuera solo llega si el documento
// tiene algo que lo reciba, por eso se escucha también `touchstart`.
function alTocarFueraTipoSancion(evento) {
  if (menuTipoSancion.value && !selectTipoSancion.value?.contains(evento.target)) menuTipoSancion.value = false
  if (menuPeriodicidad.value && !selectPeriodicidad.value?.contains(evento.target)) menuPeriodicidad.value = false
}
function alTeclaTipoSancion(evento) {
  if (evento.key !== 'Escape') return
  menuTipoSancion.value = false
  menuPeriodicidad.value = false
}

onMounted(() => {
  document.addEventListener('click', alTocarFueraTipoSancion)
  document.addEventListener('touchstart', alTocarFueraTipoSancion, { passive: true })
  document.addEventListener('keydown', alTeclaTipoSancion)
})
onUnmounted(() => {
  document.removeEventListener('click', alTocarFueraTipoSancion)
  document.removeEventListener('touchstart', alTocarFueraTipoSancion)
  document.removeEventListener('keydown', alTeclaTipoSancion)
})

const OPCIONES_PERIODICIDAD = [
  { value: 'quincenal', label: 'Quincenal', ayuda: 'Dos cuotas al mes', icono: CalendarDaysIcon },
  { value: 'mensual', label: 'Mensual', ayuda: 'Una cuota al mes', icono: CalendarIcon }
]

const menuPeriodicidad = ref(false)
const selectPeriodicidad = ref(null)
const periodicidadActiva = computed(
  () => OPCIONES_PERIODICIDAD.find(o => o.value === configBasica.value.periodicidad) || OPCIONES_PERIODICIDAD[0]
)

function elegirPeriodicidad(valor) {
  configBasica.value.periodicidad = valor
  menuPeriodicidad.value = false
}

const TABS_GENERAL = [
  { value: 'basica', corto: 'Básica', largo: 'Información básica', icono: CurrencyDollarIcon },
  { value: 'periodo', corto: 'Período', largo: 'Período', icono: CalendarDaysIcon },
  { value: 'prestamos', corto: 'Préstamos', largo: 'Préstamos', icono: BanknotesIcon },
  { value: 'sanciones', corto: 'Sanciones', largo: 'Sanciones por mora', icono: ExclamationTriangleIcon },
  { value: 'cierre', corto: 'Cierre', largo: 'Cierre de natillera', icono: ArchiveBoxIcon }
]

/*
 * En móvil las cinco pestañas no caben y la fila hace scroll. Sin una señal, parece que
 * solo hay tres: estas sombras laterales aparecen solo mientras quede fila por ese lado.
 */
const listaTabsGeneral = ref(null)
const hayMasTabsDerecha = ref(false)
const hayMasTabsIzquierda = ref(false)
let rafSombraTabs = null

function actualizarSombraTabs() {
  const el = listaTabsGeneral.value
  if (!el) {
    hayMasTabsDerecha.value = false
    hayMasTabsIzquierda.value = false
    return
  }
  hayMasTabsIzquierda.value = el.scrollLeft > 1
  hayMasTabsDerecha.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function programarSombraTabs() {
  if (rafSombraTabs != null) cancelAnimationFrame(rafSombraTabs)
  rafSombraTabs = requestAnimationFrame(() => {
    rafSombraTabs = null
    actualizarSombraTabs()
  })
}

// Desplaza la fila algo menos de un ancho visible, para que quede solapamiento.
function desplazarTabs(direccion) {
  const el = listaTabsGeneral.value
  if (!el) return
  const salto = direccion * Math.round(el.clientWidth * 0.7)
  /*
   * Safari anterior a 15.4 ignora `scrollBy` con objeto de opciones —no lanza, sencillamente
   * no hace nada— y la flecha se quedaría muerta. Si el navegador no declara soporte de
   * scroll suave, se mueve el scroll a pelo.
   */
  const admiteSuave = typeof document !== 'undefined' && 'scrollBehavior' in document.documentElement.style
  if (admiteSuave) {
    el.scrollBy({ left: salto, behavior: 'smooth' })
  } else {
    el.scrollLeft += salto
  }
  nextTick(() => programarSombraTabs())
}

// Al elegir una pestaña, centrarla: si estaba medio tapada, deja ver que hay más al lado.
function seleccionarTabGeneral(valor, evento) {
  tabGeneralActiva.value = valor
  const boton = evento?.currentTarget
  if (boton && typeof boton.scrollIntoView === 'function') {
    boton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
  nextTick(() => programarSombraTabs())
}

watch([() => seccionActiva.value, () => tabGeneralActiva.value], () => {
  nextTick(() => programarSombraTabs())
})
const tipoMensajeActivo = ref('individual') // 'individual', 'general', 'mora', 'pendiente'
const esVisor = ref(false)

// Reasignación
const usuarioAutenticado = ref(null)
const busquedaUsuario = ref('')
const todosLosUsuarios = ref([]) // Lista completa de usuarios
const usuariosEncontrados = ref([]) // Usuarios filtrados
const usuarioSeleccionado = ref(null)
const adminActual = ref(null)
const buscandoUsuarios = ref(false)
const usuariosCargados = ref(false) // Flag para saber si ya se cargaron los usuarios

// Mensajes
const mensajeIndividual = ref('')
const mensajeGeneral = ref('')
const mensajeCuotaMora = ref('')
const mensajeCuotaPendiente = ref('')
const textareaCuotaMora = ref(null)
const textareaCuotaPendiente = ref(null)

const id = computed(() => route.params.id)
const natillera = computed(() => natillerasStore.natilleraActual)

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

// Verificar si el usuario es visor
async function verificarRolVisor() {
  try {
    if (!id.value) return
    
    const rol = await colaboradoresStore.obtenerMiRol(id.value)
    
    // Verificar si es visor y tiene permiso de configurar
    if (rol === 'visor') {
      const tienePermisoConfigurar = await colaboradoresStore.tienePermiso(id.value, 'configurar')
      esVisor.value = tienePermisoConfigurar
    } else {
      esVisor.value = false
    }
  } catch (e) {
    console.error('Error verificando rol visor:', e)
    esVisor.value = false
  }
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

// Configuración básica
const configBasica = ref({
  nombre: '',
  descripcion: '',
  periodicidad: 'mensual',
  fecha_inicio: new Date().toISOString().split('T')[0]
})

// Configuración de cierre
const configCierre = ref({
  modoActividades: 'general', // 'general' o 'individual'
  actividades: {
    general: 'equitativa', // Solo se usa cuando modoActividades es 'general'
    rifa: 'equitativa',
    bingo: 'equitativa',
    venta: 'equitativa',
    evento: 'equitativa',
    otro: 'equitativa'
  },
  prestamos: 'equitativa', // 'equitativa' o 'proporcional'
  sanciones: 'equitativa', // 'equitativa' o 'proporcional'
  utilidades_adicionales: 'equitativa', // Ingresos a 'utilidades' desde el Cuadre de Caja
  administracion: { porcentaje: 0, base: 'total' }
})

/** Atajos: el 2 % es lo que suele fijar el reglamento; el 0 sirve para desactivarlo. */
const PORCENTAJES_ADMINISTRACION = [0, 1, 2, 3]

const BASES_ADMINISTRACION = [
  { valor: 'total', titulo: 'Todo lo recogido', detalle: 'Ahorros + utilidades' },
  { valor: 'utilidades', titulo: 'Solo utilidades', detalle: 'Sin tocar el ahorro' }
]

/*
 * Cuánto sería ese porcentaje HOY, con lo que lleva recogido la natillera.
 *
 * Un «2 %» no dice nada hasta que se ve que son seiscientos mil. Se calcula al abrir la
 * pestaña de cierre —no al entrar a configuración— porque son dos consultas y la mayoría
 * de las visitas no vienen a tocar esto.
 */
const baseAdministracion = ref({ cargando: false, ahorro: 0, utilidades: 0, total: 0, cargado: false })

const montoAdministracionEstimado = computed(() => {
  const pct = Math.max(0, Math.min(100, Number(configCierre.value.administracion?.porcentaje) || 0))
  return Math.round((baseAdministracion.value.total || 0) * pct / 100)
})

async function cargarBaseAdministracion() {
  const natId = natillera.value?.id
  if (!natId || baseAdministracion.value.cargando) return
  baseAdministracion.value = { ...baseAdministracion.value, cargando: true }
  try {
    const { data: sociosAct } = await supabase
      .from('socios_natillera')
      .select('id')
      .eq('natillera_id', natId)
      .eq('estado', 'activo')
    const ids = (sociosAct || []).map(sn => sn.id)

    let ahorro = 0
    if (ids.length > 0) {
      const { data: cuotasData } = await supabase
        .from('cuotas')
        .select('valor_cuota, valor_pagado, estado')
        .in('socio_natillera_id', ids)
      // Mismo criterio que el cierre: la cuota completa cuenta entera y del abono
      // parcial cuenta lo abonado, nunca más que la propia cuota.
      ahorro = (cuotasData || []).reduce((suma, c) => {
        const cuota = parseFloat(c.valor_cuota) || 0
        const pagado = parseFloat(c.valor_pagado) || 0
        if (c.estado === 'pagada' || pagado >= cuota) return suma + cuota
        return suma + Math.min(pagado, cuota)
      }, 0)
    }

    const { porTipo } = await calcularUtilidadesReales(natId, { idsSocioNatillera: ids })
    const utilidades = Object.values(porTipo || {}).reduce((suma, v) => suma + v, 0)

    baseAdministracion.value = { cargando: false, cargado: true, ahorro, utilidades, total: 0 }
    recalcularBaseAdministracion()
  } catch (e) {
    console.error('No se pudo estimar la base de administración:', e)
    baseAdministracion.value = { cargando: false, cargado: true, ahorro: 0, utilidades: 0, total: 0 }
  }
}

/** La base cambia según se elija «todo lo recogido» o «solo utilidades». */
function recalcularBaseAdministracion() {
  const b = baseAdministracion.value
  const total = configCierre.value.administracion?.base === 'utilidades'
    ? b.utilidades
    : b.ahorro + b.utilidades
  baseAdministracion.value = { ...b, total: Math.max(0, Math.round(total)) }
}

watch(() => configCierre.value.administracion?.base, () => {
  if (baseAdministracion.value.cargado) recalcularBaseAdministracion()
})

/*
 * Se dispara al abrir la pestaña y también cuando la natillera termina de cargar: si el
 * usuario llega directo a «cierre» antes de que haya datos, la primera pasada sale sin id
 * y la estimación se quedaría vacía para siempre.
 */
watch([tabGeneralActiva, () => natillera.value?.id], ([tab, natId]) => {
  if (tab === 'cierre' && natId && !baseAdministracion.value.cargado) cargarBaseAdministracion()
}, { immediate: true })

const tooltipUtilidadesAdicionales = ref(false)

// Tipos de actividades disponibles
const tiposActividades = [
  { valor: 'rifa', label: '🎟️ Rifas', descripcion: 'Utilidades generadas por rifas' },
  { valor: 'bingo', label: '🎱 Bingos', descripcion: 'Utilidades generadas por bingos' },
  { valor: 'venta', label: '🛒 Ventas', descripcion: 'Utilidades generadas por ventas' },
  { valor: 'evento', label: '🎉 Eventos', descripcion: 'Utilidades generadas por eventos' },
  { valor: 'otro', label: '📋 Otros', descripcion: 'Utilidades de otras actividades' }
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

// Configuración de período
const anioActualDefault = new Date().getFullYear()
const configPeriodo = ref({
  mes_inicio: 1,
  anio_inicio: anioActualDefault,
  mes_fin: 11,
  anio: anioActualDefault
})

// Calcular el número de meses del período
const cantidadMesesPeriodo = computed(() => {
  if (configPeriodo.value.anio_inicio === configPeriodo.value.anio) {
    // Mismo año
    return configPeriodo.value.mes_fin >= configPeriodo.value.mes_inicio 
      ? configPeriodo.value.mes_fin - configPeriodo.value.mes_inicio + 1 
      : 12 - configPeriodo.value.mes_inicio + configPeriodo.value.mes_fin + 1
  } else if (configPeriodo.value.anio > configPeriodo.value.anio_inicio) {
    // Período cruza años
    const mesesPrimerAnio = 12 - configPeriodo.value.mes_inicio + 1
    const mesesSegundoAnio = configPeriodo.value.mes_fin
    const aniosIntermedios = (configPeriodo.value.anio - configPeriodo.value.anio_inicio - 1) * 12
    return mesesPrimerAnio + mesesSegundoAnio + aniosIntermedios
  }
  return 0
})

// Configuración de días de gracia
const configDiasGracia = ref({
  dias_gracia: 3
})

// Reglas de préstamos (reglas_interes): interés, plazo máximo y tasa de mora
const configPrestamos = ref(parseReglasInteresPrestamo(null))

// Configuración de cuotas automáticas
const configCuotasAuto = ref({
  activo: true
})

// Configuración de sanciones por mora
const configSanciones = ref({
  activa: false,
  tipo: 'simple', // 'simple', 'escalonada' o 'diaria'
  valorFijo: 5000, // Para tipo simple
  valorPorDia: 500, // Para tipo diaria
  niveles: [ // Para tipo escalonada
    { cuotas: 1, valor: 4000 },
    { cuotas: 2, valor: 4500 },
    { cuotas: 3, valor: 5000 },
    { cuotas: 4, valor: 6000 }
  ],
  interesesAdicionales: {
    activo: false,
    dias: 2,
    valor: 500
  },
  devolucion: {
    activo: false,
    cuotasLimite: 5,
    porcentajeMulta: 25,
    sinUtilidades: true
  }
})

// Formatear dinero
function formatMoney(value) {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('es-CO').format(value)
}

// Formatear número con separadores de miles
function formatNumberWithSeparators(value) {
  if (!value && value !== 0) return ''
  return new Intl.NumberFormat('es-CO').format(value)
}

// Remover formato de número (quitar puntos y comas)
function removeNumberFormat(value) {
  if (!value) return ''
  return String(value).replace(/\./g, '').replace(/,/g, '')
}

// Agregar nivel de sanción
function agregarNivel() {
  const ultimoNivel = configSanciones.value.niveles[configSanciones.value.niveles.length - 1]
  configSanciones.value.niveles.push({
    cuotas: ultimoNivel.cuotas + 1,
    valor: ultimoNivel.valor + 500
  })
}

// Eliminar nivel de sanción
function eliminarNivel(index) {
  if (configSanciones.value.niveles.length > 1) {
    configSanciones.value.niveles.splice(index, 1)
  }
}

// Métodos para actualizar checkboxes preservando el tipo
function toggleInteresesAdicionales() {
  const tipoActual = configSanciones.value.tipo
  configSanciones.value.interesesAdicionales.activo = !configSanciones.value.interesesAdicionales.activo
  // Preservar el tipo explícitamente
  configSanciones.value.tipo = tipoActual
}

function toggleDevolucion() {
  const tipoActual = configSanciones.value.tipo
  configSanciones.value.devolucion.activo = !configSanciones.value.devolucion.activo
  // Preservar el tipo explícitamente
  configSanciones.value.tipo = tipoActual
}

function toggleSinUtilidades() {
  const tipoActual = configSanciones.value.tipo
  configSanciones.value.devolucion.sinUtilidades = !configSanciones.value.devolucion.sinUtilidades
  // Preservar el tipo explícitamente
  configSanciones.value.tipo = tipoActual
}

async function guardarConfigBasica() {
  guardandoBasica.value = true
  mensaje.value = null
  
  // Validaciones
  if (!configBasica.value.nombre || configBasica.value.nombre.trim() === '') {
    mensaje.value = {
      tipo: 'error',
      texto: 'El nombre de la natillera es requerido'
    }
    guardandoBasica.value = false
    setTimeout(() => { mensaje.value = null }, 5000)
    return
  }

  if (!configBasica.value.fecha_inicio) {
    mensaje.value = {
      tipo: 'error',
      texto: 'La fecha de inicio es requerida'
    }
    guardandoBasica.value = false
    setTimeout(() => { mensaje.value = null }, 5000)
    return
  }

  const reglasMultasActuales = natillera.value?.reglas_multas || {}
  const payload = {
    nombre: configBasica.value.nombre.trim(),
    descripcion: configBasica.value.descripcion?.trim() || null,
    periodicidad: configBasica.value.periodicidad,
    fecha_inicio: configBasica.value.fecha_inicio,
    cuotas_automaticas: configCuotasAuto.value.activo,
    config_cierre: {
      modoActividades: configCierre.value.modoActividades,
      actividades: configCierre.value.actividades,
      prestamos: configCierre.value.prestamos,
      sanciones: configCierre.value.sanciones,
      utilidades_adicionales: configCierre.value.utilidades_adicionales,
      administracion: {
        porcentaje: Math.max(0, Math.min(100, Number(configCierre.value.administracion?.porcentaje) || 0)),
        base: configCierre.value.administracion?.base === 'utilidades' ? 'utilidades' : 'total'
      }
    },
    mes_inicio: configPeriodo.value.mes_inicio,
    anio_inicio: configPeriodo.value.anio_inicio,
    mes_fin: configPeriodo.value.mes_fin,
    anio: configPeriodo.value.anio,
    // Las reglas de préstamos ya no tienen botón propio: se guardan con el resto.
    reglas_interes: {
      activo: configPrestamos.value.activo !== false,
      porcentaje: Number(configPrestamos.value.porcentaje) >= 0 ? Number(configPrestamos.value.porcentaje) : 0,
      plazo_maximo: Number(configPrestamos.value.plazo_maximo) >= 1 ? Math.floor(Number(configPrestamos.value.plazo_maximo)) : 1,
      tasa_mora: Number(configPrestamos.value.tasa_mora) >= 0 ? Number(configPrestamos.value.tasa_mora) : 0,
      dias_gracia_activo: configPrestamos.value.dias_gracia_activo === true,
      // Se guarda siempre, activo o no: así el valor editado no se pierde al
      // apagar el interruptor y volverlo a encender.
      dias_gracia: Number(configPrestamos.value.dias_gracia) >= 0 ? Math.floor(Number(configPrestamos.value.dias_gracia)) : 0
    },
    reglas_multas: {
      ...reglasMultasActuales,
      dias_gracia: configDiasGracia.value.dias_gracia,
      sanciones: {
        activa: configSanciones.value.activa,
        tipo: configSanciones.value.tipo,
        valorFijo: configSanciones.value.valorFijo,
        valorPorDia: configSanciones.value.tipo === 'diaria' ? configSanciones.value.valorPorDia : undefined,
        niveles: configSanciones.value.niveles,
        interesesAdicionales: configSanciones.value.interesesAdicionales,
        devolucion: configSanciones.value.devolucion
      }
    }
  }
  
  const result = await natillerasStore.actualizarNatillera(id.value, payload)
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración general guardada correctamente'
    }
    await natillerasStore.fetchNatillera(id.value)
    actualizarValoresDesdeNatillera()
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoBasica.value = false
}

async function guardarConfigPeriodo() {
  guardandoPeriodo.value = true
  mensaje.value = null
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    mes_inicio: configPeriodo.value.mes_inicio,
    anio_inicio: configPeriodo.value.anio_inicio,
    mes_fin: configPeriodo.value.mes_fin,
    anio: configPeriodo.value.anio
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de período guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      configPeriodo.value = {
        mes_inicio: natillera.value.mes_inicio || 1,
        anio_inicio: natillera.value.anio_inicio || natillera.value.anio || new Date().getFullYear(),
        mes_fin: natillera.value.mes_fin || 11,
        anio: natillera.value.anio || new Date().getFullYear()
      }
    }
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de período'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoPeriodo.value = false
}

async function guardarConfigDiasGracia() {
  guardandoDiasGracia.value = true
  mensaje.value = null
  
  // Obtener las reglas de multas actuales
  const reglasMultasActuales = natillera.value?.reglas_multas || { activa: false }
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    reglas_multas: {
      ...reglasMultasActuales,
      dias_gracia: configDiasGracia.value.dias_gracia
    }
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de días de gracia guardada correctamente'
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
    // Actualizar los valores locales con los datos recargados
    if (natillera.value) {
      const reglasMultas = natillera.value.reglas_multas || {}
      configDiasGracia.value = {
        dias_gracia: reglasMultas.dias_gracia || 3
      }
      // Si préstamos hereda la gracia de las cuotas, que el formulario lo refleje ya.
      configPrestamos.value = parseReglasInteresPrestamo(natillera.value.reglas_interes, {
        diasGraciaCuotas: reglasMultas.dias_gracia || 3
      })
    }
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de días de gracia'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoDiasGracia.value = false
}


async function guardarConfigSanciones() {
  guardandoSanciones.value = true
  mensaje.value = null
  
  // Obtener las reglas de multas actuales
  const reglasMultasActuales = natillera.value?.reglas_multas || {}
  
  const result = await natillerasStore.actualizarNatillera(id.value, {
    reglas_multas: {
      ...reglasMultasActuales,
      sanciones: {
        activa: configSanciones.value.activa,
        tipo: configSanciones.value.tipo,
        valorFijo: configSanciones.value.valorFijo,
        niveles: configSanciones.value.niveles,
        interesesAdicionales: configSanciones.value.interesesAdicionales,
        devolucion: configSanciones.value.devolucion
      }
    }
  })
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: 'Configuración de sanciones guardada correctamente'
    }
    // Si se desactivaron las sanciones, poner a 0 valor_multa en todas las cuotas (mora/pendiente/parcial)
    if (!configSanciones.value.activa) {
      const limpieza = await cuotasStore.limpiarSancionesNatillera(id.value)
      if (limpieza.actualizadas > 0) {
        mensaje.value.texto = `Configuración guardada. Se quitaron las sanciones a ${limpieza.actualizadas} cuota(s).`
      }
    }
    // Recargar la natillera para ver los cambios
    await natillerasStore.fetchNatillera(id.value)
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar la configuración de sanciones'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoSanciones.value = false
}


// Vista previa del mensaje individual con datos de ejemplo
const vistaPreviewIndividual = computed(() => {
  return mensajeIndividual.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{monto\}\}/g, '50.000')
})

// Vista previa del mensaje de cuota en mora
const vistaPreviewCuotaMora = computed(() => {
  return mensajeCuotaMora.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{mes\}\}/g, 'Diciembre')
    .replace(/\{\{anio\}\}/g, '2024')
    .replace(/\{\{valor_cuota\}\}/g, '50.000')
    .replace(/\{\{sancion\}\}/g, '5.000')
    .replace(/\{\{total\}\}/g, '55.000')
    .replace(/\{\{fecha_vencimiento\}\}/g, '15/12/2024')
    .replace(/\{\{dias_mora\}\}/g, '10')
})

// Vista previa del mensaje de cuota pendiente
const vistaPreviewCuotaPendiente = computed(() => {
  return mensajeCuotaPendiente.value
    .replace(/\{\{nombre\}\}/g, 'María García')
    .replace(/\{\{mes\}\}/g, 'Diciembre')
    .replace(/\{\{anio\}\}/g, '2024')
    .replace(/\{\{valor_cuota\}\}/g, '50.000')
    .replace(/\{\{total\}\}/g, '50.000')
    .replace(/\{\{fecha_vencimiento\}\}/g, '15/12/2024')
})

function insertarVariable(variable) {
  const textarea = textareaIndividual.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = mensajeIndividual.value
  const variableText = `{{${variable}}}`
  
  mensajeIndividual.value = text.substring(0, start) + variableText + text.substring(end)
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

function insertarVariableCuota(variable, tipo) {
  let textarea
  let texto
  
  if (tipo === 'mensajeCuotaMora') {
    textarea = textareaCuotaMora.value
    texto = mensajeCuotaMora.value
  } else if (tipo === 'mensajeCuotaPendiente') {
    textarea = textareaCuotaPendiente.value
    texto = mensajeCuotaPendiente.value
  }
  
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const variableText = `{{${variable}}}`
  
  const nuevoTexto = texto.substring(0, start) + variableText + texto.substring(end)
  
  if (tipo === 'mensajeCuotaMora') {
    mensajeCuotaMora.value = nuevoTexto
  } else if (tipo === 'mensajeCuotaPendiente') {
    mensajeCuotaPendiente.value = nuevoTexto
  }
  
  // Posicionar cursor después de la variable insertada
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variableText.length, start + variableText.length)
  }, 0)
}

// Función para insertar variable según el tipo de mensaje activo
function insertarVariableEnActivo(variable) {
  if (tipoMensajeActivo.value === 'individual') {
    insertarVariable(variable)
  } else if (tipoMensajeActivo.value === 'mora') {
    insertarVariableCuota(variable, 'mensajeCuotaMora')
  } else if (tipoMensajeActivo.value === 'pendiente') {
    insertarVariableCuota(variable, 'mensajeCuotaPendiente')
  }
  // 'general' no usa variables, así que no hace nada
}

async function guardarMensajes() {
  guardandoMensajes.value = true
  mensaje.value = null
  
  // Guardar en el store de configuración
  configStore.mensajeIndividual = mensajeIndividual.value
  configStore.mensajeGeneral = mensajeGeneral.value
  configStore.mensajeCuotaMora = mensajeCuotaMora.value
  configStore.mensajeCuotaPendiente = mensajeCuotaPendiente.value
  
  const result = await configStore.guardarConfiguracion()
  
  if (result.success) {
    mensaje.value = {
      tipo: 'exito',
      texto: result.message || 'Mensajes guardados correctamente'
    }
    // Cerrar la sección después de guardar
    seccionActiva.value = null
  } else {
    mensaje.value = {
      tipo: 'error',
      texto: result.error || 'Error al guardar los mensajes'
    }
  }
  
  setTimeout(() => {
    mensaje.value = null
  }, 5000)
  guardandoMensajes.value = false
}

function restaurarDefectoMensajes() {
  if (confirm('¿Estás seguro de restaurar los mensajes a sus valores por defecto?')) {
    configStore.restaurarValoresPorDefecto()
    mensajeIndividual.value = configStore.mensajeIndividual
    mensajeGeneral.value = configStore.mensajeGeneral
    mensajeCuotaMora.value = configStore.mensajeCuotaMora
    mensajeCuotaPendiente.value = configStore.mensajeCuotaPendiente
    mensaje.value = {
      tipo: 'exito',
      texto: 'Valores restaurados. No olvides guardar los cambios.'
    }
  }
}

// Función para actualizar los valores locales desde la natillera
function actualizarValoresDesdeNatillera() {
  if (natillera.value) {
    configBasica.value = {
      nombre: natillera.value.nombre || '',
      descripcion: natillera.value.descripcion || '',
      periodicidad: natillera.value.periodicidad || 'mensual',
      fecha_inicio: natillera.value.fecha_inicio || new Date().toISOString().split('T')[0]
    }
    
    // Para anio_inicio: usar el valor guardado, o si no existe, usar el anio como fallback
    const anioInicio = natillera.value.anio_inicio || natillera.value.anio || new Date().getFullYear()
    
    configPeriodo.value = {
      mes_inicio: natillera.value.mes_inicio || 1,
      anio_inicio: anioInicio,
      mes_fin: natillera.value.mes_fin || 11,
      anio: natillera.value.anio || new Date().getFullYear()
    }
    
    const reglasMultas = natillera.value.reglas_multas || {}
    configDiasGracia.value = {
      dias_gracia: reglasMultas.dias_gracia || 3
    }

    // Cargar reglas de préstamos (interés, plazo, tasa de mora, días de gracia).
    // Sin gracia propia guardada, el campo arranca con la de las cuotas.
    configPrestamos.value = parseReglasInteresPrestamo(natillera.value.reglas_interes, {
      diasGraciaCuotas: reglasMultas.dias_gracia || 3
    })

    // Cargar configuración de cuotas automáticas
    configCuotasAuto.value = {
      activo: natillera.value.cuotas_automaticas !== false // Por defecto true
    }
    
    // Cargar configuración de cierre
    const configCierreActual = natillera.value.config_cierre || {}
    const actividadesConfig = configCierreActual.actividades || {}
    const modoActividades = configCierreActual.modoActividades || 'general'
    
    // Si viene en formato antiguo (sin modoActividades), determinar el modo
    let modo = modoActividades
    if (!configCierreActual.modoActividades && actividadesConfig.general) {
      modo = 'general'
    } else if (!configCierreActual.modoActividades && (actividadesConfig.rifa || actividadesConfig.bingo)) {
      modo = 'individual'
    }
    
    configCierre.value = {
      modoActividades: modo,
      actividades: {
        general: actividadesConfig.general || 'equitativa',
        rifa: actividadesConfig.rifa || 'equitativa',
        bingo: actividadesConfig.bingo || 'equitativa',
        venta: actividadesConfig.venta || 'equitativa',
        evento: actividadesConfig.evento || 'equitativa',
        otro: actividadesConfig.otro || 'equitativa'
      },
      prestamos: configCierreActual.prestamos || 'equitativa',
      sanciones: configCierreActual.sanciones || 'equitativa',
      utilidades_adicionales: configCierreActual.utilidades_adicionales || 'equitativa',
      administracion: {
        porcentaje: Number(configCierreActual.administracion?.porcentaje) || 0,
        base: configCierreActual.administracion?.base === 'utilidades' ? 'utilidades' : 'total'
      }
    }
    
    // Cargar configuración de sanciones
    const sanciones = reglasMultas.sanciones || {}
    if (Object.keys(sanciones).length > 0) {
      configSanciones.value = {
        activa: sanciones.activa || false,
        tipo: sanciones.tipo || 'simple',
        valorFijo: sanciones.valorFijo || 5000,
        valorPorDia: sanciones.valorPorDia ?? 500,
        niveles: sanciones.niveles || [
          { cuotas: 1, valor: 4000 },
          { cuotas: 2, valor: 4500 },
          { cuotas: 3, valor: 5000 },
          { cuotas: 4, valor: 6000 }
        ],
        interesesAdicionales: sanciones.interesesAdicionales || {
          activo: false,
          dias: 2,
          valor: 500
        },
        devolucion: sanciones.devolucion || {
          activo: false,
          cuotasLimite: 5,
          porcentajeMulta: 25,
          sinUtilidades: true
        }
      }
    }
  }
}

// Watch para actualizar los valores cuando cambie la natillera (solo cuando cambie el ID, no en cada modificación)
watch(() => natillera.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    actualizarValoresDesdeNatillera()
  }
}, { immediate: true })

// Watch para cargar usuarios cuando se abre la sección de reasignación
watch(() => seccionActiva.value, (nuevaSeccion) => {
  if (nuevaSeccion === 'reasignar') {
    cargarTodosLosUsuarios()
  }
})

// Funciones para reasignación
async function cargarTodosLosUsuarios() {
  if (usuariosCargados.value) {
    // Si ya están cargados, solo filtrar
    filtrarUsuarios()
    return
  }

  try {
    buscandoUsuarios.value = true

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, nombre')
      .order('email', { ascending: true })

    if (error) {
      // Si el error es que la tabla no existe, mostrar mensaje más claro
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.error('Error: La tabla user_profiles no existe. Por favor ejecuta la migración create_users_profiles.sql en Supabase.')
        mensaje.value = {
          tipo: 'error',
          texto: 'Error: La tabla de usuarios no está configurada. Por favor ejecuta la migración create_users_profiles.sql en Supabase SQL Editor.'
        }
        throw new Error('Tabla user_profiles no encontrada. Ejecuta la migración create_users_profiles.sql')
      }
      throw error
    }

    todosLosUsuarios.value = data || []
    usuariosCargados.value = true
    filtrarUsuarios() // Mostrar todos inicialmente
  } catch (e) {
    console.error('Error cargando usuarios:', e)
    todosLosUsuarios.value = []
    usuariosEncontrados.value = []
    
    // Mostrar mensaje de error al usuario si no es un error de tabla no encontrada
    if (e.message && !e.message.includes('Tabla user_profiles no encontrada')) {
      mensaje.value = {
        tipo: 'error',
        texto: `Error cargando usuarios: ${e.message}`
      }
    }
  } finally {
    buscandoUsuarios.value = false
  }
}

function filtrarUsuarios() {
  if (!busquedaUsuario.value.trim()) {
    // Si no hay búsqueda, mostrar todos
    usuariosEncontrados.value = todosLosUsuarios.value
    return
  }

  const termino = busquedaUsuario.value.toLowerCase().trim()
  usuariosEncontrados.value = todosLosUsuarios.value.filter(usuario => {
    const email = (usuario.email || '').toLowerCase()
    const nombre = (usuario.nombre || '').toLowerCase()
    return email.includes(termino) || nombre.includes(termino)
  })
}

async function buscarUsuarios() {
  // Ahora solo filtra la lista ya cargada
  filtrarUsuarios()
}

function seleccionarUsuario(usuario) {
  usuarioSeleccionado.value = usuario
}

function cancelarReasignacion() {
  usuarioSeleccionado.value = null
  busquedaUsuario.value = ''
  usuariosEncontrados.value = []
  // No limpiar todosLosUsuarios ni usuariosCargados para mantenerlos en memoria
  seccionActiva.value = null
}

async function confirmarReasignacion() {
  if (!usuarioSeleccionado.value || !natillera.value) return

  if (!confirm(`¿Estás seguro de reasignar la natillera "${natillera.value.nombre}" a ${usuarioSeleccionado.value.email}?`)) {
    return
  }

  try {
    guardandoReasignacion.value = true

    const resultado = await natillerasStore.reasignarNatillera(
      natillera.value.id,
      usuarioSeleccionado.value.id
    )

    if (resultado.success) {
      mensaje.value = {
        tipo: 'exito',
        texto: `Natillera reasignada exitosamente a ${usuarioSeleccionado.value.email}`
      }
      
      // Recargar la natillera para ver los cambios
      await natillerasStore.fetchNatillera(id.value)
      
      // Cargar el nuevo administrador
      await cargarAdminActual()
      
      // Limpiar formulario
      cancelarReasignacion()
    } else {
      mensaje.value = {
        tipo: 'error',
        texto: resultado.error || 'Error al reasignar la natillera'
      }
    }
  } catch (e) {
    mensaje.value = {
      tipo: 'error',
      texto: e.message || 'Error al reasignar la natillera'
    }
  } finally {
    guardandoReasignacion.value = false
    setTimeout(() => {
      mensaje.value = null
    }, 5000)
  }
}

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

onMounted(async () => {
  nextTick(() => programarSombraTabs())
  // Obtener usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  usuarioAutenticado.value = user

  // Cargar configuración de mensajes
  await configStore.cargarConfiguracion()
  mensajeIndividual.value = configStore.mensajeIndividual
  mensajeGeneral.value = configStore.mensajeGeneral
  mensajeCuotaMora.value = configStore.mensajeCuotaMora
  mensajeCuotaPendiente.value = configStore.mensajeCuotaPendiente
  
  // Cargar la natillera
  await natillerasStore.fetchNatillera(id.value)
  
  // Verificar si el usuario es visor (después de cargar la natillera para tener el id)
  await verificarRolVisor()
  
  // Actualizar valores después de cargar la natillera
  actualizarValoresDesdeNatillera()
  
  // Cargar administrador actual
  await cargarAdminActual()
})

// Watch para cargar admin cuando cambie la natillera
watch(() => natillera.value?.admin_id, async () => {
  await cargarAdminActual()
})

onUnmounted(() => {
  if (rafSombraTabs != null) cancelAnimationFrame(rafSombraTabs)
})

</script>

<style scoped>
/* ---------- Desplegable propio ----------
   Un `<select>` nativo no admite icono ni segunda línea, y el manual desaconseja
   maquillarlo con `appearance: none`. Este va por encima del contenido, así que la
   tarjeta que lo contiene no puede recortar (ver `.cfg-card` sin overflow hidden). */
.cfg-select {
  position: relative;
}
.cfg-select__trigger,
.cfg-select__opcion {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.5rem;
  padding: 0.625rem 0.875rem;
  text-align: left;
  background: #fff;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.cfg-select__trigger {
  border: 1px solid var(--surface-divider-strong);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.cfg-select__trigger.is-open,
.cfg-select__trigger:focus-visible {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(27, 94, 55, 0.12);
  outline: none;
}
.cfg-select__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.cfg-select__icono {
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cfg-select__texto {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.cfg-select__titulo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9375rem;
  color: #0f172a;
  line-height: 1.2;
}
.cfg-select__ayuda {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.3;
  margin-top: 0.0625rem;
}
.cfg-select__chevron {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform var(--transition-base);
}
.cfg-select__trigger.is-open .cfg-select__chevron {
  transform: rotate(180deg);
}

.cfg-select__menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.375rem);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-divider);
  background: #fff;
  box-shadow: var(--shadow-lg);
  max-height: 60dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.cfg-select__opcion {
  border-radius: var(--radius-sm, 0.5rem);
}
.cfg-select__opcion:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: -2px;
}
.cfg-select__opcion.is-selected {
  background: var(--brand-primary-soft);
}
.cfg-select__opcion:not(.is-selected):hover {
  background: rgba(15, 23, 42, 0.04);
}

.cfg-select-enter-active,
.cfg-select-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.cfg-select-enter-from,
.cfg-select-leave-to {
  opacity: 0;
  transform: translate3d(0, -0.375rem, 0);
}
@media (prefers-reduced-motion: reduce) {
  .cfg-select__chevron,
  .cfg-select-enter-active,
  .cfg-select-leave-active { transition: none; }
}

/* Variante compacta: tres opciones en una fila incluso a 320 px. El icono sustituye al
   espacio que ya no hay para texto largo, y la palomita se superpone a él. */
.cfg-opcion--compacta {
  align-items: center;
  text-align: center;
  padding: 0.625rem 0.375rem;
  min-height: 5.5rem;
  gap: 0;
}
.cfg-opcion--compacta .cfg-opcion__marca {
  align-self: center;
  margin-bottom: 0.375rem;
}
.cfg-opcion__icono {
  width: 1.25rem;
  height: 1.25rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}
.cfg-opcion.is-selected .cfg-opcion__icono { color: var(--brand-primary); }
.cfg-opcion--compacta .cfg-opcion__titulo {
  font-size: 0.8125rem;
  line-height: 1.15;
}
.cfg-opcion--compacta .cfg-opcion__ayuda {
  font-size: 0.6875rem;
  line-height: 1.25;
  margin-top: 0.125rem;
  overflow-wrap: anywhere;
}
@media (min-width: 640px) {
  .cfg-opcion--compacta { padding: 0.75rem 0.875rem; min-height: 6rem; }
  .cfg-opcion--compacta .cfg-opcion__titulo { font-size: 0.9375rem; }
  .cfg-opcion--compacta .cfg-opcion__ayuda { font-size: 0.75rem; }
  .cfg-opcion__icono { width: 1.5rem; height: 1.5rem; }
}

/* ---------- Pestañas de Configuración General ----------
   Una sola caja: la fila de pestañas y su contenido comparten contenedor, sin panel
   intermedio con borde. El contenido entra con un fundido corto para que se lea como
   parte de la pestaña que se acaba de tocar. */
.cfg-tabs__barra {
  position: relative;
}
.cfg-tabs__lista {
  width: 100%;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
}
.cfg-tabs__lista > * {
  scroll-snap-align: center;
}
.cfg-tabs__flecha {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid rgba(27, 94, 55, 0.25);
  background: #fff;
  color: var(--brand-primary);
  box-shadow: -6px 0 12px -4px rgba(15, 23, 42, 0.18);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
/* El toque vale 44 px aunque el círculo se vea de 32: así no tapa media pestaña. */
.cfg-tabs__flecha::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2.75rem;
  height: 2.75rem;
  transform: translate(-50%, -50%);
}
.cfg-tabs__flecha:active { background: var(--brand-primary-soft); }
.cfg-tabs__flecha--izq {
  right: auto;
  left: 0;
  box-shadow: 6px 0 12px -4px rgba(15, 23, 42, 0.18);
}

/* La flecha «empuja» hacia su lado de vez en cuando: dice que hay más fila sin
   necesidad de leer la pista. Se anima el icono y no el botón, porque el botón ya usa
   `transform` para centrarse en vertical y la animación se lo pisaría. */
.cfg-tabs__flecha-icono {
  -webkit-animation: cfg-flecha-der 2.4s ease-in-out infinite;
  animation: cfg-flecha-der 2.4s ease-in-out infinite;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}
/* Dos keyframes y no uno con `var()`: Safari antiguo no recalcula variables dentro de
   `@keyframes`. */
.cfg-tabs__flecha--izq .cfg-tabs__flecha-icono {
  -webkit-animation-name: cfg-flecha-izq;
  animation-name: cfg-flecha-izq;
}
@-webkit-keyframes cfg-flecha-der {
  0%, 55%, 100% { -webkit-transform: translate3d(0, 0, 0); }
  65% { -webkit-transform: translate3d(3px, 0, 0); }
  75% { -webkit-transform: translate3d(-1px, 0, 0); }
  85% { -webkit-transform: translate3d(2px, 0, 0); }
}
@keyframes cfg-flecha-der {
  0%, 55%, 100% { transform: translate3d(0, 0, 0); }
  65% { transform: translate3d(3px, 0, 0); }
  75% { transform: translate3d(-1px, 0, 0); }
  85% { transform: translate3d(2px, 0, 0); }
}
@-webkit-keyframes cfg-flecha-izq {
  0%, 55%, 100% { -webkit-transform: translate3d(0, 0, 0); }
  65% { -webkit-transform: translate3d(-3px, 0, 0); }
  75% { -webkit-transform: translate3d(1px, 0, 0); }
  85% { -webkit-transform: translate3d(-2px, 0, 0); }
}
@keyframes cfg-flecha-izq {
  0%, 55%, 100% { transform: translate3d(0, 0, 0); }
  65% { transform: translate3d(-3px, 0, 0); }
  75% { transform: translate3d(1px, 0, 0); }
  85% { transform: translate3d(-2px, 0, 0); }
}
/* Entrada y salida solo con opacidad, por el mismo motivo del `transform`. */
.cfg-flecha-enter-active,
.cfg-flecha-leave-active { transition: opacity 200ms ease; }
.cfg-flecha-enter-from,
.cfg-flecha-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .cfg-tabs__flecha-icono { -webkit-animation: none; animation: none; }
  .cfg-flecha-enter-active,
  .cfg-flecha-leave-active { transition: none; }
}
.cfg-tabs__pista {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
}
.cfg-tabs__panel {
  padding-top: 1.25rem;
}
.cfg-tab {
  animation: cfg-tab-entra 0.18s ease-out;
}
@keyframes cfg-tab-entra {
  from { opacity: 0; transform: translate3d(0, 0.375rem, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@-webkit-keyframes cfg-tab-entra {
  from { opacity: 0; -webkit-transform: translate3d(0, 0.375rem, 0); }
  to { opacity: 1; -webkit-transform: translate3d(0, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .cfg-tabs__lista { scroll-behavior: auto; }
  .cfg-tab { animation: none; }
}

/* Estimación en pesos de la administración: resultado, no control. */
.cfg-estimado {
  border-radius: var(--radius-md);
  border: 1px solid rgba(27, 94, 55, 0.18);
  background: linear-gradient(135deg, #f3faf5 0%, #fff 60%);
  padding: 0.625rem 0.875rem;
}

/* Chip de valor rápido (porcentaje de administración). */
.cfg-chip {
  min-height: 2.75rem;
  padding: 0 0.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-divider-strong);
  background: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9375rem;
  color: #475569;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--transition-base), background-color var(--transition-base), color var(--transition-base);
}
.cfg-chip:hover:not(.is-selected) { border-color: rgba(27, 94, 55, 0.4); }
.cfg-chip.is-selected {
  border-color: var(--brand-primary);
  background: var(--brand-primary);
  color: #fff;
}
@media (prefers-reduced-motion: reduce) {
  .cfg-chip { transition: none; }
}

/* ---------- Sección de configuración ----------
   Igual que `.cfg-card` pero sin un div de cuerpo aparte: la cabecera se sangra con
   márgenes negativos para llegar a los bordes. Así se pudo aplicar a los bloques que ya
   existían sin reestructurar su árbol de etiquetas. */
.cfg-seccion {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
  padding: 1rem;
  overflow: hidden;
}
@media (min-width: 640px) {
  .cfg-seccion { padding: 1.25rem; }
}
.cfg-seccion__header {
  margin: -1rem -1rem 1rem;
}
@media (min-width: 640px) {
  .cfg-seccion__header { margin: -1.25rem -1.25rem 1.25rem; }
}

/* ---------- Interruptor ----------
   Sustituye el patrón `peer` de Tailwind que estaba copiado media docena de veces con
   medidas distintas en cada copia. El input real sigue ahí (accesible y enfocable), solo
   que invisible: la pista es un hermano, no un pseudo-elemento del input. */
.cfg-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.cfg-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  /* Sin `pointer-events: none`: hace falta que siga siendo enfocable por teclado. El
     click no le llega porque el label lo intercepta con `.prevent`. */
  margin: 0;
}
.cfg-switch__pista {
  position: relative;
  flex-shrink: 0;
  width: 2.75rem;
  height: 1.625rem;
  border-radius: 9999px;
  background: #cbd5e1;
  transition: background-color var(--transition-base);
}
.cfg-switch__pista::after {
  content: '';
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
  transition: transform var(--transition-base);
}
.cfg-switch__input:checked + .cfg-switch__pista { background: var(--brand-primary); }
.cfg-switch__input:checked + .cfg-switch__pista::after { transform: translateX(1.125rem); }
.cfg-switch__input:focus-visible + .cfg-switch__pista {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
.cfg-switch__input:disabled + .cfg-switch__pista { opacity: 0.5; }
.cfg-switch__titulo {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9375rem;
  color: #0f172a;
  line-height: 1.2;
}
.cfg-switch__ayuda {
  display: block;
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.35;
  margin-top: 0.125rem;
}

/* Interruptor maestro de una pestaña: va en su propia tarjeta, no suelto sobre el fondo. */
.cfg-switch--destacado {
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
  min-height: var(--tap-min);
}

/* Interruptor dentro de una cabecera de color: pista clara sobre fondo oscuro. */
.cfg-switch--cabecera {
  flex-shrink: 0;
  align-self: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  justify-content: center;
}
.cfg-switch--cabecera .cfg-switch__pista { background: rgba(255, 255, 255, 0.35); }
.cfg-switch--cabecera .cfg-switch__input:checked + .cfg-switch__pista { background: #fff; }
.cfg-switch--cabecera .cfg-switch__input:checked + .cfg-switch__pista::after { background: var(--brand-primary); }
.cfg-card__header--peligro .cfg-switch__input:checked + .cfg-switch__pista::after { background: #b91c1c; }
.cfg-switch--cabecera .cfg-switch__input:focus-visible + .cfg-switch__pista {
  outline-color: #fff;
}

/* ---------- Campo de dinero ----------
   El signo `$` iba con `absolute` + `top-1/2 -translate-y-1/2`, que en Safari se descoloca
   cuando el input cambia de alto al enfocarse. Aquí el contenedor es el que posiciona. */
.cfg-money {
  position: relative;
  display: flex;
  align-items: stretch;
}
.cfg-money__signo {
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  color: #64748b;
  font-weight: 600;
  pointer-events: none;
}
.cfg-money .ds-input { width: 100%; }

/* Botón de icono suelto (eliminar nivel): 44x44 reales. */
.cfg-icono-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: color var(--transition-base), background-color var(--transition-base);
}
.cfg-icono-btn--peligro:hover { color: #b91c1c; background: #fef2f2; }

@media (prefers-reduced-motion: reduce) {
  .cfg-switch__pista,
  .cfg-switch__pista::after,
  .cfg-icono-btn { transition: none; }
}

/* Selector de periodicidad: tarjeta grande, fácil de acertar con el dedo. */
.cfg-opcion {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  min-height: 4.25rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--surface-divider-strong);
  background: #fff;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--transition-base), background-color var(--transition-base),
              box-shadow var(--transition-base), transform var(--transition-fast);
}
.cfg-opcion:hover:not(:disabled):not(.is-selected) { border-color: rgba(27, 94, 55, 0.4); }
.cfg-opcion:active:not(:disabled) { transform: scale(0.99); }
.cfg-opcion:disabled { opacity: 0.55; cursor: not-allowed; }
.cfg-opcion.is-selected {
  border-color: var(--brand-primary);
  background: var(--brand-primary-soft);
  box-shadow: 0 0 0 1px var(--brand-primary) inset;
}
.cfg-opcion__titulo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9375rem;
  color: #0f172a;
}
.cfg-opcion__ayuda {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.3;
}
/* Palomita de la opción activa: en flex dentro de la esquina, sin  en iOS. */
.cfg-opcion__marca {
  align-self: flex-end;
  order: -1;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  border: 1px solid var(--surface-divider-strong);
  background: #fff;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}
.cfg-opcion.is-selected .cfg-opcion__marca {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: #fff;
}
@media (prefers-reduced-motion: reduce) {
  .cfg-opcion { transition: none; }
  .cfg-opcion:active:not(:disabled) { transform: none; }
}

/*
 * Tarjeta de configuración: cabecera propia (banda con icono, overline, título y ayuda)
 * y cuerpo debajo. Reemplaza las cabeceras de color que cada bloque traía por su cuenta,
 * que hacían ver la pantalla como un mosaico de paletas.
 */
.cfg-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
  /* Sin `overflow: hidden`: recortaría el menú del desplegable. La cabecera redondea
     sus propias esquinas para seguir encajando con el borde de la tarjeta. */
}
.cfg-card > .cfg-card__header:first-child {
  border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
}
.cfg-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  /* Verde de marca sólido, el mismo de las cabeceras de modal: la tarjeta se lee de lejos. */
  background: var(--brand-primary);
  color: #fff;
}
@media (min-width: 640px) {
  .cfg-card__header { padding: 1rem 1.25rem; }
}
.cfg-card__icono {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: #fff;
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.cfg-card__overline {
  font-family: var(--font-brand-mono);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.cfg-card__titulo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.cfg-card__sub {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  margin-top: 0.125rem;
}
.cfg-card__body {
  padding: 1rem;
}
@media (min-width: 640px) {
  .cfg-card__body { padding: 1.25rem; }
}

/* Variante de aviso: mismo formato, rojo donde el bloque habla de mora. */
.cfg-card__header--peligro {
  background: #b91c1c;
}
.cfg-card__header--peligro .cfg-card__icono {
  color: #b91c1c;
}

/* Pie de la tarjeta: resume lo configurado arriba. Mismo verde suave que la cabecera. */
.cfg-card__pie {
  border-top: 1px solid var(--surface-divider);
  background: linear-gradient(180deg, #fff 0%, #f6fbf7 100%);
  padding: 0.875rem 1rem;
}
@media (min-width: 640px) {
  .cfg-card__pie { padding: 1rem 1.25rem; }
}
</style>
<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <!-- El icono de marca se esconde en móvil: esta fila ya lleva el botón de volver
               y dos acciones, y con el icono no quedaba ancho para el título. -->
          <div class="ds-page-header__icon hidden sm:flex">
            <ScaleIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <!-- «Conciliación de caja» no cabe en una línea en móvil, y partido en dos la
                 cabecera queda descuadrada. El resto de vistas usan títulos cortos
                 («Socios», «Préstamos»), así que en estrecho se recorta igual. -->
            <h1 class="ds-page-header__title truncate">
              <span class="sm:hidden">Conciliación</span>
              <span class="hidden sm:inline">Conciliación de caja</span>
            </h1>
            <p class="ds-page-header__sub hidden sm:block">
              ¿El dinero que dice el sistema es el que tienes de verdad?
            </p>
          </div>
          <button
            type="button"
            class="ds-btn ds-btn--secondary sm:hidden"
            aria-label="Actualizar datos"
            :disabled="cargando"
            @click="recargar"
          >
            <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': cargando }" />
          </button>
          <button
            type="button"
            class="ds-btn ds-btn--secondary sm:hidden"
            aria-label="Ver historial de cortes"
            data-tour="historial"
            @click="modalHistorial = true"
          >
            <ClockIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <button type="button" class="ds-btn ds-btn--secondary" :disabled="cargando" @click="recargar">
            <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': cargando }" />
            <span>Actualizar</span>
          </button>
          <button type="button" class="ds-btn ds-btn--secondary" data-tour="historial" @click="modalHistorial = true">
            <ClockIcon class="w-4 h-4" />
            <span>Historial ({{ cortes.length }})</span>
          </button>
        </div>
      </div>
    </header>

    <LoadingScreen :visible="cargando" text="Reconstruyendo el libro de caja" />

    <template v-if="!cargando">
      <div
        v-if="errorCarga"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
      >
        {{ errorCarga }}
      </div>

      <template v-else>
        <!-- ================= El corte: la pregunta «¿cuadra hoy?» ================= -->
        <section class="ds-card ds-card--brand space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Cada cifra de esta pantalla solo se entiende sabiendo desde cuándo se
                 cuenta, así que el periodo va primero en la jerarquía. Gana presencia por
                 aislamiento y contención —superficie propia, filete de marca y la fecha
                 despegada de su etiqueta—, no agrandando la letra ni subiendo el tono. -->
            <p class="flex items-center gap-2.5 rounded-lg border-l-[3px] border-[#1B5E37] bg-[#1B5E37]/[0.06] py-1.5 pl-2.5 pr-3.5">
              <CalendarDaysIcon class="h-4 w-4 flex-shrink-0 text-[#1B5E37]" />
              <span class="flex flex-col leading-tight">
                <span class="text-[0.6875rem] uppercase tracking-wide text-gray-500">Periodo abierto</span>
                <strong class="text-sm font-semibold tabular-nums text-gray-900">{{ formatDate(periodoDesde) }} → hoy</strong>
              </span>
            </p>
            <!--
              La fila envuelve y el botón no se encoge: con la insignia larga al lado, en
              móvil «Cómo funciona» quedaba aplastado contra el borde y no se veía que
              fuera la forma de volver a abrir la guía, que solo salta sola una vez.
            -->
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="ultimoCorte" class="ds-badge ds-badge--brand">
                <CheckIcon class="h-3.5 w-3.5" />
                Último corte {{ formatDate(ultimoCorte.fecha_corte) }}
              </span>
              <span v-else class="ds-badge ds-badge--muted">
                Sin cortes previos<span class="hidden sm:inline"> · se revisa todo el histórico</span>
              </span>
              <button
                type="button"
                class="inline-flex min-h-[44px] flex-shrink-0 touch-manipulation items-center gap-1.5 rounded-lg border border-[#1B5E37]/20 bg-white px-3 text-xs font-semibold text-[#1B5E37] hover:bg-[#1B5E37]/8 sm:border-transparent sm:bg-transparent sm:px-2"
                @click="abrirTutorial"
              >
                <QuestionMarkCircleIcon class="h-4 w-4" />
                Cómo funciona
              </button>
            </div>
          </div>

          <!-- Móvil: las tres formas en filas de dos líneas dentro de una sola tarjeta.
               Con el diseño de escritorio apilado, cada forma medía media pantalla y las
               tres no caben ni en dos: había que desplazarse tanto que se perdía el hilo
               de lo que se estaba haciendo. Aquí las tres se ven juntas y cada fila se
               resume sola, porque el veredicto va en su cabecera.

               El `data-tour` está repetido aquí y en el bloque de escritorio a propósito:
               el recorrido se queda con el que esté visible. -->
          <div
            class="divide-y divide-gray-200 overflow-hidden rounded-xl border-2 border-gray-200 bg-white sm:hidden"
            data-tour="panel-corte"
          >
            <div v-for="columna in columnasCorte" :key="columna.clave" class="px-3 py-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="flex min-w-0 items-center gap-1.5">
                  <component :is="columna.icono" class="h-4 w-4 flex-shrink-0" :class="columna.acento" />
                  <span class="truncate font-display text-sm font-bold" :class="columna.acento">{{ columna.titulo }}</span>
                </span>
                <span
                  class="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold"
                  :class="claseFondoDiferencia(columna.diferencia)"
                  :data-tour="columna.clave === 'efectivo' ? 'diferencia' : null"
                >
                  <span>{{ etiquetaDiferencia(columna.diferencia) }}</span>
                  <span class="font-display font-extrabold tabular-nums">${{ formatMoneyConSigno(columna.diferencia) }}</span>
                </span>
              </div>

              <div class="mt-1.5 flex items-end gap-3">
                <div class="min-w-0 flex-1" :data-tour="columna.clave === 'efectivo' ? 'esperado' : null">
                  <p class="text-[0.6875rem] leading-tight text-gray-500">Debería haber</p>
                  <p class="font-display text-base font-extrabold tabular-nums" :class="columna.acento">
                    ${{ formatMoney(columna.esperado) }}
                  </p>
                </div>

                <div class="min-w-0 flex-1" :data-tour="columna.clave === 'efectivo' ? 'real' : null">
                  <template v-if="columna.clave === 'total'">
                    <p class="text-[0.6875rem] leading-tight text-gray-500">Hay de verdad</p>
                    <p class="font-display text-base font-extrabold tabular-nums text-gray-900">
                      ${{ formatMoney(columna.real) }}
                    </p>
                  </template>
                  <template v-else>
                    <label :for="`real-movil-${columna.clave}`" class="block text-[0.6875rem] leading-tight text-gray-500">
                      Hay de verdad
                    </label>
                    <div class="mt-0.5 flex items-center gap-1">
                      <span class="flex-shrink-0 text-sm font-semibold text-gray-400">$</span>
                      <input
                        :id="`real-movil-${columna.clave}`"
                        :value="columna.realTexto"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        placeholder="0"
                        class="ds-input w-full min-w-0 px-2 tabular-nums disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        :disabled="!puedeConciliar"
                        @input="alEscribirReal(columna.clave, $event.target.value)"
                      />
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- «Saldo al inicio» y «Movimientos» explican de dónde sale la cifra, pero no
                 se consultan en cada revisión: plegados dejan sitio a lo que sí. -->
            <button
              type="button"
              class="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 bg-gray-50/70 px-3 text-xs font-semibold text-gray-600"
              :aria-expanded="origenAbierto"
              aria-controls="origen-corte"
              @click="origenAbierto = !origenAbierto"
            >
              <span>¿De dónde sale «debería haber»?</span>
              <ChevronDownIcon
                class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': origenAbierto }"
              />
            </button>

            <div v-if="origenAbierto" id="origen-corte" class="space-y-2.5 bg-gray-50/70 px-3 py-2.5 text-xs">
              <div v-for="columna in columnasCorte" :key="`desglose-${columna.clave}`">
                <p class="font-semibold" :class="columna.acento">{{ columna.titulo }}</p>
                <dl class="mt-0.5 space-y-0.5">
                  <div class="flex items-baseline justify-between gap-2">
                    <dt class="text-gray-500">Saldo al inicio</dt>
                    <dd class="tabular-nums text-gray-700">${{ formatMoney(columna.saldoInicial) }}</dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-2">
                    <dt class="text-gray-500">Movimientos del periodo</dt>
                    <dd class="tabular-nums text-gray-700">${{ formatMoneyConSigno(columna.movimientos) }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <!-- Escritorio: hay ancho para las tres columnas completas, con el desglose a la
               vista y la diferencia al final, que se lee como el resultado de una suma. -->
          <div class="hidden gap-3 sm:grid sm:grid-cols-3" data-tour="panel-corte">
            <article
              v-for="columna in columnasCorte"
              :key="columna.clave"
              class="rounded-xl border-2 bg-white p-4"
              :class="columna.borde"
            >
              <div class="mb-3 flex items-center gap-2">
                <component :is="columna.icono" class="h-5 w-5 flex-shrink-0" :class="columna.acento" />
                <h2 class="font-display text-sm font-bold" :class="columna.acento">{{ columna.titulo }}</h2>
              </div>

              <dl class="space-y-1.5 text-sm">
                <div class="flex items-baseline justify-between gap-2">
                  <dt class="text-gray-500">Saldo al inicio</dt>
                  <dd class="tabular-nums text-gray-700">${{ formatMoney(columna.saldoInicial) }}</dd>
                </div>
                <div class="flex items-baseline justify-between gap-2">
                  <dt class="text-gray-500">Movimientos</dt>
                  <dd class="tabular-nums text-gray-700">${{ formatMoneyConSigno(columna.movimientos) }}</dd>
                </div>
                <div
                  class="flex items-baseline justify-between gap-2 border-t border-gray-200 pt-1.5"
                  :data-tour="columna.clave === 'efectivo' ? 'esperado' : null"
                >
                  <dt class="font-semibold text-gray-700">Debería haber</dt>
                  <dd class="font-display text-base font-extrabold tabular-nums" :class="columna.acento">
                    ${{ formatMoney(columna.esperado) }}
                  </dd>
                </div>
              </dl>

              <div class="mt-3" :data-tour="columna.clave === 'efectivo' ? 'real' : null">
                <label
                  v-if="columna.clave !== 'total'"
                  :for="`real-${columna.clave}`"
                  class="mb-1 block text-xs font-semibold text-gray-600"
                >
                  Hay de verdad
                </label>
                <div v-if="columna.clave !== 'total'" class="flex items-center gap-1.5">
                  <span class="text-sm font-semibold text-gray-400">$</span>
                  <input
                    :id="`real-${columna.clave}`"
                    :value="columna.realTexto"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="0"
                    class="ds-input tabular-nums disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    :disabled="!puedeConciliar"
                    @input="alEscribirReal(columna.clave, $event.target.value)"
                  />
                </div>
                <div v-else class="flex items-baseline justify-between gap-2">
                  <span class="text-xs font-semibold text-gray-600">Hay de verdad</span>
                  <span class="font-display text-base font-extrabold tabular-nums text-gray-900">
                    ${{ formatMoney(columna.real) }}
                  </span>
                </div>
              </div>

              <div
                class="mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                :class="claseFondoDiferencia(columna.diferencia)"
                :data-tour="columna.clave === 'efectivo' ? 'diferencia' : null"
              >
                <span class="text-xs font-semibold">{{ etiquetaDiferencia(columna.diferencia) }}</span>
                <span class="font-display text-sm font-extrabold tabular-nums">
                  ${{ formatMoneyConSigno(columna.diferencia) }}
                </span>
              </div>
            </article>
          </div>

          <div
            v-if="apuntesFuturos.length > 0"
            class="flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-900"
          >
            <InformationCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Hay {{ apuntesFuturos.length }} {{ apuntesFuturos.length === 1 ? 'movimiento fechado' : 'movimientos fechados' }}
              después de hoy, por ${{ formatMoney(totalApuntesFuturos) }}. No entran en «debería haber»: es un
              desfase de tiempo, no un descuadre.
            </span>
          </div>

          <div
            v-if="apuntesSinFecha.length > 0"
            class="flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600"
          >
            <InformationCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              {{ apuntesSinFecha.length }} {{ apuntesSinFecha.length === 1 ? 'apunte no tiene' : 'apuntes no tienen' }}
              fecha registrada. Cuentan dentro del saldo al inicio, no en el libro del periodo.
            </span>
          </div>

          <!-- En móvil el umbral y el botón van uno debajo de otro y el botón a todo el
               ancho: en fila envuelta, el botón quedaba encajado en el hueco que dejaba la
               etiqueta y perdía el peso que le toca a la acción principal. -->
          <div
            class="space-y-3 border-t border-gray-200/80 pt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:space-y-0"
            data-tour="sellar"
          >
            <div class="flex items-center justify-between gap-3 sm:justify-start sm:gap-2">
              <label for="umbral" class="text-xs font-semibold leading-snug text-gray-600">
                Pedir nota si la diferencia supera
              </label>
              <div class="flex flex-shrink-0 items-center gap-1">
                <span class="text-sm text-gray-400">$</span>
                <input
                  id="umbral"
                  :value="umbralTexto"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  class="ds-input w-24 tabular-nums disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 sm:w-28"
                  :disabled="!puedeConciliar"
                  @input="alEscribirUmbral($event.target.value)"
                />
              </div>
            </div>

            <div class="w-full sm:w-auto">
              <button
                type="button"
                class="ds-btn ds-btn--primary w-full sm:w-auto"
                :disabled="!puedeConciliar || sinNadaQueConciliar || saldoRealSinDeclarar"
                @click="modalCerrarCorte = true"
              >
                <LockClosedIcon class="h-4 w-4" />
                <span>Cerrar corte</span>
              </button>
              <p
                v-if="puedeConciliar && !sinNadaQueConciliar && saldoRealSinDeclarar"
                class="mt-1.5 text-center text-xs text-gray-500 sm:text-right"
              >
                Escribe cuánto hay de verdad para poder cerrar.
              </p>
            </div>
          </div>

          <p
            v-if="!puedeConciliar"
            class="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"
          >
            <ExclamationTriangleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Estás en modo consulta: los campos del saldo real están bloqueados porque solo el
              administrador de la natillera, o un colaborador con permiso de gestión de cuotas, puede
              declararlo y sellar un corte.
            </span>
          </p>
        </section>

        <!-- ================= El libro: «¿dónde está la diferencia?» ================= -->
        <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
            <div class="min-w-0">
              <h2 class="font-display text-base font-bold text-gray-800 sm:text-lg">Movimientos del periodo</h2>
              <p class="mt-0.5 text-xs text-gray-500">
                {{ apuntesVisibles.length }} de {{ apuntesRango.length }} apuntes · saldo corrido para acotar la diferencia
              </p>
            </div>
            <button
              type="button"
              class="ds-btn ds-btn--secondary"
              :disabled="exportando || apuntesVisibles.length === 0"
              @click="exportarExcel"
            >
              <ArrowDownTrayIcon class="h-4 w-4" />
              <span>{{ exportando ? 'Exportando…' : 'Excel' }}</span>
            </button>
          </div>

          <!-- Filtros.
               En móvil solo se ven los dos de siempre —rango rápido y búsqueda— y el resto
               vive detrás de «Más filtros»: puestos todos en fila envuelta, cada control con
               un ancho distinto, la zona se volvía un amontonamiento ilegible. En pantalla
               ancha caben todos a la vez y el desplegable no aplica. -->
          <div class="space-y-3 border-b border-gray-200 bg-gray-50/60 px-4 py-4 sm:px-5" data-tour="filtros">
            <!-- Rango rápido: tres opciones iguales, que en móvil es lo único que se entiende -->
            <div class="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
              <button
                v-for="preset in presetsRango"
                :key="preset.clave"
                type="button"
                class="flex min-h-[44px] touch-manipulation items-center justify-center rounded-lg px-2 text-center text-xs font-semibold leading-tight transition-all sm:px-3 sm:text-sm"
                :class="presetActivo === preset.clave ? 'bg-[#1B5E37] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
                @click="aplicarPreset(preset.clave)"
              >
                {{ preset.label }}
              </button>
            </div>

            <div class="flex items-center rounded-xl border border-gray-300 bg-white focus-within:border-[#1B5E37] focus-within:ring-2 focus-within:ring-[#1B5E37]/20 sm:max-w-xs">
              <span class="flex-shrink-0 pl-3 text-gray-400">
                <MagnifyingGlassIcon class="h-5 w-5" />
              </span>
              <input
                id="busqueda"
                v-model="filtroBusqueda"
                type="text"
                aria-label="Buscar movimientos"
                placeholder="Concepto, socio, nota…"
                class="min-w-0 flex-1 border-none bg-transparent px-2 py-3 text-base outline-none focus:ring-0"
              />
              <button
                v-if="filtroBusqueda"
                type="button"
                class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
                @click="filtroBusqueda = ''"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>

            <!-- Interruptor de los filtros avanzados: solo existe en móvil -->
            <button
              type="button"
              class="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 sm:hidden"
              :aria-expanded="filtrosAbiertos"
              aria-controls="filtros-avanzados"
              @click="filtrosAbiertos = !filtrosAbiertos"
            >
              <span class="flex items-center gap-2">
                <FunnelIcon class="h-4 w-4 text-gray-400" />
                Más filtros
                <span
                  v-if="filtrosAvanzadosActivos > 0"
                  class="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#1B5E37] px-1.5 text-[0.6875rem] font-bold text-white"
                >
                  {{ filtrosAvanzadosActivos }}
                </span>
              </span>
              <ChevronDownIcon
                class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': filtrosAbiertos }"
              />
            </button>

            <div
              id="filtros-avanzados"
              class="space-y-3 sm:flex sm:flex-wrap sm:items-end sm:gap-3 sm:space-y-0"
              :class="{ 'hidden': !filtrosAbiertos }"
            >
              <div class="grid grid-cols-2 gap-2 sm:flex sm:items-end sm:gap-3">
                <div>
                  <label for="desde" class="mb-1 block text-xs font-semibold text-gray-600">Desde</label>
                  <input id="desde" v-model="filtroDesde" type="date" class="ds-input w-full sm:w-auto" />
                </div>
                <div>
                  <label for="hasta" class="mb-1 block text-xs font-semibold text-gray-600">Hasta</label>
                  <input id="hasta" v-model="filtroHasta" type="date" class="ds-input w-full sm:w-auto" />
                </div>
              </div>

              <div ref="dropdownConceptosRef" class="relative">
                <label class="mb-1 block text-xs font-semibold text-gray-600">Concepto</label>
                <button
                  type="button"
                  class="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-left text-sm hover:bg-gray-50 sm:min-w-[11rem]"
                  @click="dropdownConceptos = !dropdownConceptos"
                >
                  <span class="truncate">{{ etiquetaConceptos }}</span>
                  <ChevronDownIcon class="h-4 w-4 flex-shrink-0 text-gray-400" />
                </button>
                <div
                  v-show="dropdownConceptos"
                  class="absolute inset-x-0 top-full z-50 mt-1 max-h-[16rem] overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl sm:inset-x-auto sm:left-0 sm:min-w-[13rem]"
                >
                  <button
                    type="button"
                    class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-emerald-50/80"
                    :class="filtroConceptos.length === 0 ? 'bg-emerald-50 font-semibold text-[#1B5E37]' : 'text-gray-700'"
                    @click="filtroConceptos = []"
                  >
                    Todos los conceptos
                  </button>
                  <button
                    v-for="categoria in categoriasPresentes"
                    :key="categoria.value"
                    type="button"
                    class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50/80"
                    @click="alternarConcepto(categoria.value)"
                  >
                    <span
                      class="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border"
                      :class="filtroConceptos.includes(categoria.value) ? 'border-[#1B5E37] bg-[#1B5E37]' : 'border-gray-300'"
                    >
                      <CheckIcon v-if="filtroConceptos.includes(categoria.value)" class="h-3 w-3 text-white" />
                    </span>
                    {{ categoria.label }}
                  </button>
                </div>
              </div>

              <div>
                <label for="socio" class="mb-1 block text-xs font-semibold text-gray-600">Socio</label>
                <select id="socio" v-model="filtroSocio" class="ds-input w-full sm:w-auto sm:min-w-[10rem]">
                  <option value="">Todos los socios</option>
                  <option v-for="socio in sociosPresentes" :key="socio" :value="socio">{{ socio }}</option>
                </select>
              </div>

              <div>
                <span class="mb-1 block text-xs font-semibold text-gray-600">Forma de pago</span>
                <div class="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
                  <button
                    v-for="opcion in opcionesFormaPago"
                    :key="opcion.valor"
                    type="button"
                    class="flex min-h-[44px] touch-manipulation items-center justify-center rounded-lg px-2 text-center text-xs font-semibold leading-tight transition-all sm:px-3 sm:text-sm"
                    :class="filtroFormaPago === opcion.valor ? opcion.claseActiva : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
                    @click="filtroFormaPago = opcion.valor"
                  >
                    {{ opcion.label }}
                  </button>
                </div>
              </div>

              <button
                v-if="hayFiltrosActivos"
                type="button"
                class="ds-btn ds-btn--ghost w-full justify-center sm:w-auto"
                @click="limpiarFiltros"
              >
                <XMarkIcon class="h-4 w-4" />
                Quitar filtros
              </button>
            </div>

            <p v-if="!rangoEsPeriodoAbierto" class="text-xs leading-relaxed text-gray-500">
              Estás mirando un rango distinto al periodo abierto. El saldo corrido arranca en
              ${{ formatMoney(saldoBaseVisible) }}, que es lo que el sistema calcula justo antes del
              {{ formatDate(filtroDesde) }}.
            </p>
          </div>

          <!-- Total de lo filtrado: responde «¿cuánto se recogió por este concepto?» -->
          <div
            v-if="apuntesVisibles.length > 0"
            class="border-b border-gray-200 bg-white px-4 py-4 sm:px-5"
            data-tour="total-filtrado"
          >
            <p class="text-xs font-semibold text-gray-500">{{ etiquetaResumen }}</p>
            <div class="mt-2 grid grid-cols-3 gap-3">
              <div>
                <p class="text-[0.6875rem] uppercase tracking-wide text-gray-400">Entradas</p>
                <p class="font-display text-base font-extrabold tabular-nums text-emerald-700 sm:text-lg">
                  ${{ formatMoney(resumenFiltrado.entradas) }}
                </p>
              </div>
              <div>
                <p class="text-[0.6875rem] uppercase tracking-wide text-gray-400">Salidas</p>
                <p class="font-display text-base font-extrabold tabular-nums text-red-600 sm:text-lg">
                  ${{ formatMoney(Math.abs(resumenFiltrado.salidas)) }}
                </p>
              </div>
              <div>
                <p class="text-[0.6875rem] uppercase tracking-wide text-gray-400">Neto</p>
                <p class="font-display text-base font-extrabold tabular-nums text-gray-900 sm:text-lg">
                  ${{ formatMoneyConSigno(resumenFiltrado.neto) }}
                </p>
              </div>
            </div>

            <!-- Desglose plegado: quien solo quiere el total no tiene que verlo, y al abrirlo
                 son filas alineadas y no chips, para poder comparar las cifras de un vistazo. -->
            <div v-if="totalesPorConcepto.length > 1" class="mt-2 border-t border-gray-100 pt-1">
              <button
                type="button"
                class="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 rounded-lg px-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                :aria-expanded="desgloseAbierto"
                aria-controls="desglose-conceptos"
                @click="desgloseAbierto = !desgloseAbierto"
              >
                <span>Desglose por concepto ({{ totalesPorConcepto.length }})</span>
                <ChevronDownIcon
                  class="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': desgloseAbierto }"
                />
              </button>

              <ul v-show="desgloseAbierto" id="desglose-conceptos" class="pb-1">
                <li
                  v-for="total in totalesPorConcepto"
                  :key="total.tipo"
                  class="flex items-center gap-2.5 py-1"
                >
                  <span class="h-2 w-2 flex-shrink-0 rounded-full" :class="colorTipo(total.tipo)" />
                  <span class="min-w-0 flex-1 truncate text-xs text-gray-600">{{ etiquetaTipo(total.tipo) }}</span>
                  <span class="flex-shrink-0 text-[0.6875rem] tabular-nums text-gray-400">{{ total.cantidad }}</span>
                  <span
                    class="w-28 flex-shrink-0 text-right text-xs font-semibold tabular-nums"
                    :class="total.monto < 0 ? 'text-red-600' : 'text-gray-800'"
                  >
                    ${{ formatMoneyConSigno(total.monto) }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Vacío: nunca una tabla en blanco sin salida (§7 del levantamiento) -->
          <div v-if="apuntesVisibles.length === 0" class="px-4 py-12 text-center">
            <MagnifyingGlassIcon class="mx-auto h-10 w-10 text-gray-300" />
            <p class="mt-3 font-display text-sm font-bold text-gray-700">{{ vacio.titulo }}</p>
            <p class="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-gray-500">{{ vacio.texto }}</p>
            <div v-if="vacio.conSalidas" class="mt-4 flex flex-wrap justify-center gap-2">
              <button v-if="hayFiltrosActivos" type="button" class="ds-btn ds-btn--secondary" @click="limpiarFiltros">
                <XMarkIcon class="h-4 w-4" />
                Quitar los filtros
              </button>
              <button type="button" class="ds-btn ds-btn--secondary" @click="aplicarPreset('todo')">
                <CalendarDaysIcon class="h-4 w-4" />
                Ver todo el histórico
              </button>
            </div>
          </div>

          <!-- Tabla desktop -->
          <div v-else class="hidden overflow-x-auto lg:block" data-tour="saldo">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th class="px-4 py-3 text-left font-semibold">
                    <button type="button" class="inline-flex items-center gap-1 hover:text-gray-700" @click="alternarOrden">
                      Fecha
                      <ChevronUpIcon v-if="ordenAscendente" class="h-3.5 w-3.5" />
                      <ChevronDownIcon v-else class="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th class="px-4 py-3 text-left font-semibold">Concepto</th>
                  <th class="px-4 py-3 text-left font-semibold">Socio</th>
                  <th class="px-4 py-3 text-left font-semibold">Forma</th>
                  <th class="px-4 py-3 text-right font-semibold">Monto</th>
                  <th class="px-4 py-3 text-right font-semibold">Saldo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="apunte in apuntesMostrados" :key="apunte.clave" class="hover:bg-gray-50/70">
                  <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                    {{ formatDate(apunte.fecha) }}
                    <span
                      v-if="apunte.fechaEstimada"
                      class="ml-1 text-xs font-medium text-amber-600"
                      title="Sin fecha de pago registrada. Se usa la última modificación del registro o el inicio de su período, así que puede no ser el día en que entró el dinero."
                    >aprox.</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="claseTipo(apunte.tipo, apunte.esParcial)">
                      {{ apunte.concepto }}
                    </span>
                    <p v-if="apunte.observaciones" class="mt-1 text-xs text-gray-500">{{ apunte.observaciones }}</p>
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ apunte.socio }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="apunte.forma_pago === 'efectivo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
                    >
                      {{ apunte.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia' }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums" :class="apunte.monto >= 0 ? 'text-emerald-700' : 'text-red-600'">
                    ${{ formatMoneyConSigno(apunte.monto) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-gray-900">
                    ${{ formatMoney(apunte.saldo) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tarjetas móvil -->
          <ul v-if="apuntesVisibles.length > 0" class="divide-y divide-gray-100 lg:hidden" data-tour="saldo">
            <li v-for="apunte in apuntesMostrados" :key="apunte.clave" class="px-4 py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="claseTipo(apunte.tipo, apunte.esParcial)">
                    {{ apunte.concepto }}
                  </span>
                  <p class="mt-1 truncate text-sm text-gray-700">{{ apunte.socio }}</p>
                  <p class="mt-0.5 text-xs text-gray-500">
                    {{ formatDate(apunte.fecha) }}<span v-if="apunte.fechaEstimada" class="text-amber-600"> aprox.</span>
                    · {{ apunte.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia' }}
                  </p>
                  <p v-if="apunte.observaciones" class="mt-1 text-xs text-gray-500">{{ apunte.observaciones }}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                  <p class="font-semibold tabular-nums" :class="apunte.monto >= 0 ? 'text-emerald-700' : 'text-red-600'">
                    ${{ formatMoneyConSigno(apunte.monto) }}
                  </p>
                  <p class="mt-0.5 text-xs text-gray-500">
                    Saldo <span class="font-bold tabular-nums text-gray-800">${{ formatMoney(apunte.saldo) }}</span>
                  </p>
                </div>
              </div>
            </li>
          </ul>

          <!-- Carga progresiva (useScrollInfinito): el centinela pide la tanda siguiente
               al acercarse, y el botón queda como respaldo cuando el observador no salta. -->
          <div
            v-if="hayMasApuntes"
            ref="centinelaRef"
            class="border-t border-gray-200 px-4 py-4 text-center sm:px-5"
          >
            <button type="button" class="ds-btn ds-btn--secondary w-full sm:w-auto" @click="cargarMasApuntes">
              <ChevronDownIcon class="h-4 w-4" />
              <span>Ver más movimientos</span>
            </button>
            <p class="mt-2 text-xs text-gray-400">
              Mostrando {{ apuntesMostrados.length }} de {{ apuntesVisibles.length }}
            </p>
          </div>

          <p
            v-else-if="hayVariasTandasDeApuntes"
            class="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-400 sm:px-5"
          >
            Ya has visto los {{ apuntesVisibles.length }} movimientos.
          </p>
        </section>
      </template>
    </template>

    <CerrarCorteModal
      :show="modalCerrarCorte"
      :fecha-corte="hoy"
      :periodo-desde="periodoDesde"
      :esperado="{ efectivo: esperadoEfectivo, transferencia: esperadoTransferencia }"
      :real="{ efectivo: realEfectivo, transferencia: realTransferencia }"
      :umbral="umbralDiferencia"
      :guardando="sellando"
      @close="modalCerrarCorte = false"
      @confirmar="sellarCorte"
    />

    <BienvenidaConciliacionModal
      :show="modalBienvenida"
      @close="cerrarBienvenida"
      @recorrer="empezarRecorrido"
    />

    <RecorridoGuiado :show="recorridoAbierto" :pasos="pasosRecorrido" @close="cerrarRecorrido" />

    <ConciliacionAyudaModal :show="modalAyuda" @close="modalAyuda = false" />

    <HistorialCortesModal
      :show="modalHistorial"
      :cortes="cortes"
      :esperado-recalculado="esperadoRecalculadoPorCorte"
      @close="modalHistorial = false"
      @anular="anularCorteConfirmado"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ScaleIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  LockClosedIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  WalletIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  FunnelIcon,
  QuestionMarkCircleIcon,
  CpuChipIcon,
  ArrowsRightLeftIcon,
  CalculatorIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import LoadingScreen from '../../components/LoadingScreen.vue'
import RecorridoGuiado from '../../components/RecorridoGuiado.vue'
import BienvenidaConciliacionModal from '../../components/conciliacion/BienvenidaConciliacionModal.vue'
import ConciliacionAyudaModal from '../../components/conciliacion/ConciliacionAyudaModal.vue'
import CerrarCorteModal from '../../components/conciliacion/CerrarCorteModal.vue'
import HistorialCortesModal from '../../components/conciliacion/HistorialCortesModal.vue'
import { useLibroCaja, CATEGORIAS_LIBRO, claseTipo, etiquetaTipo, colorTipo } from '../../composables/useLibroCaja'
import { useCortesCaja } from '../../composables/useCortesCaja'
import { useScrollInfinito } from '../../composables/useScrollInfinito'
import { useAuthStore } from '../../stores/auth'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useNotificationStore } from '../../stores/notifications'
import { formatDate, formatDateToLocalISO, getCurrentDateISO, parseDateLocal } from '../../utils/formatDate'
import { formatMoney, formatMoneyConSigno, parsearMonto, formatearMontoInput } from '../../utils/formatMoney'

const route = useRoute()
const id = computed(() => route.params.id)
const authStore = useAuthStore()
const colaboradoresStore = useColaboradoresStore()
const notificaciones = useNotificationStore()

const { cargando, error: errorCarga, natillera, apuntes, cargar } = useLibroCaja(id)
const { cortes, ultimoCorte, umbralDiferencia, cerrarCorte, anularCorte, guardarUmbral, cargar: cargarCortes } = useCortesCaja(id)

const hoy = getCurrentDateISO()

/* ---------------------------------- Permisos --------------------------------- */

const misPermisos = ref(null)

// Mismo criterio que la vista de totales: el superusuario entra a cualquier natillera.
const esSuperUsuario = computed(() => (authStore.userEmail || '').toLowerCase().trim() === 'raigo.16@gmail.com')

const esAdmin = computed(() => {
  if (esSuperUsuario.value) return true
  if (!authStore.user || !natillera.value) return false
  return natillera.value.admin_id === authStore.user.id
})

const puedeConciliar = computed(() => esAdmin.value || misPermisos.value?.permisos?.gestionar_cuotas === true)

/* ------------------------- Periodo abierto y saldo base ----------------------- */

/** Día siguiente a una fecha 'YYYY-MM-DD', en local. */
function diaSiguiente(fechaIso) {
  const d = parseDateLocal(fechaIso)
  if (!d || isNaN(d.getTime())) return fechaIso
  d.setDate(d.getDate() + 1)
  return formatDateToLocalISO(d)
}

const sumaPorForma = (lista, forma) =>
  lista.filter(a => a.forma_pago === forma).reduce((suma, a) => suma + a.monto, 0)

const apuntesSinFecha = computed(() => apuntes.value.filter(a => !a.fecha))
const apuntesConFecha = computed(() => apuntes.value.filter(a => a.fecha))

const primeraFecha = computed(() => apuntesConFecha.value[0]?.fecha || hoy)

const periodoDesde = computed(() => {
  if (ultimoCorte.value) return diaSiguiente(ultimoCorte.value.fecha_corte)
  return primeraFecha.value
})

/**
 * Saldo con el que arranca el periodo abierto. Con un corte previo es el saldo REAL que
 * se selló, no el esperado: el corte da por buena la diferencia y el siguiente periodo
 * parte de la realidad, igual que el cierre de turno de un POS.
 *
 * Sin cortes previos el arranque son los apuntes sin fecha: están en la caja pero no
 * pueden aparecer en un libro ordenado por día, así que se acumulan aquí.
 */
const saldoInicialEfectivo = computed(() =>
  ultimoCorte.value ? ultimoCorte.value.real_efectivo : sumaPorForma(apuntesSinFecha.value, 'efectivo')
)
const saldoInicialTransferencia = computed(() =>
  ultimoCorte.value ? ultimoCorte.value.real_transferencia : sumaPorForma(apuntesSinFecha.value, 'transferencia')
)

/** Apuntes del periodo abierto: posteriores al último corte y no fechados en el futuro. */
const apuntesPeriodo = computed(() =>
  apuntesConFecha.value.filter(a => a.fecha >= periodoDesde.value && a.fecha <= hoy)
)

const apuntesFuturos = computed(() => apuntesConFecha.value.filter(a => a.fecha > hoy))
const totalApuntesFuturos = computed(() => apuntesFuturos.value.reduce((suma, a) => suma + a.monto, 0))

const movimientosEfectivo = computed(() => sumaPorForma(apuntesPeriodo.value, 'efectivo'))
const movimientosTransferencia = computed(() => sumaPorForma(apuntesPeriodo.value, 'transferencia'))

const esperadoEfectivo = computed(() => saldoInicialEfectivo.value + movimientosEfectivo.value)
const esperadoTransferencia = computed(() => saldoInicialTransferencia.value + movimientosTransferencia.value)

/* ------------------------------ Saldo declarado ------------------------------- */

const realEfectivoTexto = ref('')
const realTransferenciaTexto = ref('')

const realEfectivo = computed(() => parsearMonto(realEfectivoTexto.value))
const realTransferencia = computed(() => parsearMonto(realTransferenciaTexto.value))

const diferenciaEfectivo = computed(() => realEfectivo.value - esperadoEfectivo.value)
const diferenciaTransferencia = computed(() => realTransferencia.value - esperadoTransferencia.value)

const alEscribirReal = (clave, valor) => {
  const formateado = formatearMontoInput(valor)
  if (clave === 'efectivo') realEfectivoTexto.value = formateado
  else realTransferenciaTexto.value = formateado
}

/** Solo en móvil: el desglose de «debería haber» arranca plegado (ver plantilla). */
const origenAbierto = ref(false)

const umbralTexto = ref('')
const alEscribirUmbral = (valor) => {
  umbralTexto.value = formatearMontoInput(valor)
  guardarUmbral(parsearMonto(valor))
}

const columnasCorte = computed(() => [
  {
    clave: 'efectivo',
    titulo: 'Efectivo',
    icono: BanknotesIcon,
    acento: 'text-green-700',
    borde: 'border-green-200',
    saldoInicial: saldoInicialEfectivo.value,
    movimientos: movimientosEfectivo.value,
    esperado: esperadoEfectivo.value,
    real: realEfectivo.value,
    realTexto: realEfectivoTexto.value,
    diferencia: diferenciaEfectivo.value
  },
  {
    clave: 'transferencia',
    titulo: 'Transferencia',
    icono: BuildingLibraryIcon,
    acento: 'text-blue-700',
    borde: 'border-blue-200',
    saldoInicial: saldoInicialTransferencia.value,
    movimientos: movimientosTransferencia.value,
    esperado: esperadoTransferencia.value,
    real: realTransferencia.value,
    realTexto: realTransferenciaTexto.value,
    diferencia: diferenciaTransferencia.value
  },
  {
    clave: 'total',
    titulo: 'Total',
    icono: WalletIcon,
    acento: 'text-[#1B5E37]',
    borde: 'border-[#1B5E37]/30',
    saldoInicial: saldoInicialEfectivo.value + saldoInicialTransferencia.value,
    movimientos: movimientosEfectivo.value + movimientosTransferencia.value,
    esperado: esperadoEfectivo.value + esperadoTransferencia.value,
    real: realEfectivo.value + realTransferencia.value,
    realTexto: '',
    diferencia: diferenciaEfectivo.value + diferenciaTransferencia.value
  }
])

const sinNadaQueConciliar = computed(() => apuntesPeriodo.value.length === 0 && !ultimoCorte.value)

/**
 * Sellar sin haber tocado los campos daría por declarado un saldo de cero y dejaría una
 * diferencia enorme firmada por descuido. Un «0» escrito a mano sí vale como respuesta.
 */
const saldoRealSinDeclarar = computed(
  () => realEfectivoTexto.value.trim() === '' && realTransferenciaTexto.value.trim() === ''
)

const claseFondoDiferencia = (valor) => {
  if (valor === 0) return 'bg-emerald-50 text-emerald-800'
  return valor > 0 ? 'bg-amber-50 text-amber-900' : 'bg-red-50 text-red-800'
}

const etiquetaDiferencia = (valor) => {
  if (valor === 0) return 'Cuadra'
  return valor > 0 ? 'Sobra' : 'Falta'
}

/* --------------------------------- El libro ----------------------------------- */

const filtroDesde = ref('')
const filtroHasta = ref('')
const filtroFormaPago = ref('todos')
const filtroConceptos = ref([])
const filtroSocio = ref('')
const filtroBusqueda = ref('')
const ordenAscendente = ref(false)

const opcionesFormaPago = [
  { valor: 'todos', label: 'Todas', claseActiva: 'bg-[#1B5E37] text-white' },
  { valor: 'efectivo', label: 'Efectivo', claseActiva: 'bg-green-600 text-white' },
  { valor: 'transferencia', label: 'Transferencia', claseActiva: 'bg-blue-600 text-white' }
]

const presetsRango = [
  { clave: 'periodo', label: 'Periodo abierto' },
  { clave: 'mes', label: 'Este mes' },
  { clave: 'todo', label: 'Todo' }
]

const ultimaFecha = computed(() =>
  apuntesConFecha.value.length ? apuntesConFecha.value[apuntesConFecha.value.length - 1].fecha : hoy
)

const aplicarPreset = (clave) => {
  if (clave === 'periodo') {
    filtroDesde.value = periodoDesde.value
    filtroHasta.value = hoy
    return
  }
  if (clave === 'mes') {
    const d = parseDateLocal(hoy)
    filtroDesde.value = formatDateToLocalISO(new Date(d.getFullYear(), d.getMonth(), 1))
    filtroHasta.value = hoy
    return
  }
  filtroDesde.value = primeraFecha.value
  filtroHasta.value = ultimaFecha.value
}

const presetActivo = computed(() => {
  if (filtroDesde.value === periodoDesde.value && filtroHasta.value === hoy) return 'periodo'
  const d = parseDateLocal(hoy)
  const inicioMes = formatDateToLocalISO(new Date(d.getFullYear(), d.getMonth(), 1))
  if (filtroDesde.value === inicioMes && filtroHasta.value === hoy) return 'mes'
  // Sin este caso, «Todo» nunca se marcaba como activo y además contaba como rango a mano.
  if (filtroDesde.value === primeraFecha.value && filtroHasta.value === ultimaFecha.value) return 'todo'
  return ''
})

const rangoEsPeriodoAbierto = computed(() => filtroDesde.value === periodoDesde.value && filtroHasta.value === hoy)

/** Lo acumulado antes del inicio del rango: es el punto de partida del saldo corrido. */
const saldoBase = computed(() => {
  if (rangoEsPeriodoAbierto.value) {
    // Mismo arranque que el panel del corte, para que el último saldo del libro coincida
    // exactamente con «debería haber».
    return { efectivo: saldoInicialEfectivo.value, transferencia: saldoInicialTransferencia.value }
  }
  const anteriores = apuntes.value.filter(a => !a.fecha || a.fecha < filtroDesde.value)
  return {
    efectivo: sumaPorForma(anteriores, 'efectivo'),
    transferencia: sumaPorForma(anteriores, 'transferencia')
  }
})

const saldoBaseVisible = computed(() => {
  if (filtroFormaPago.value === 'efectivo') return saldoBase.value.efectivo
  if (filtroFormaPago.value === 'transferencia') return saldoBase.value.transferencia
  return saldoBase.value.efectivo + saldoBase.value.transferencia
})

/** Apuntes del rango, en orden cronológico y ya restringidos a la forma de pago elegida. */
const apuntesRango = computed(() => {
  const desde = filtroDesde.value
  const hasta = filtroHasta.value
  return apuntesConFecha.value.filter(a => {
    if (desde && a.fecha < desde) return false
    if (hasta && a.fecha > hasta) return false
    if (filtroFormaPago.value !== 'todos' && a.forma_pago !== filtroFormaPago.value) return false
    return true
  })
})

/**
 * Saldo corrido. Se acumula sobre el rango completo, no sobre lo filtrado por concepto o
 * socio: así la columna sigue siendo el saldo real de la caja y permite localizar una
 * diferencia por bisección, como en un extracto bancario.
 */
const apuntesConSaldo = computed(() => {
  let saldo = saldoBaseVisible.value
  return apuntesRango.value.map(apunte => {
    saldo += apunte.monto
    return { ...apunte, saldo }
  })
})

const sinAcentos = (texto) =>
  String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const apuntesVisibles = computed(() => {
  const busqueda = sinAcentos(filtroBusqueda.value.trim())
  const lista = apuntesConSaldo.value.filter(a => {
    if (filtroConceptos.value.length > 0 && !filtroConceptos.value.includes(a.tipo)) return false
    if (filtroSocio.value && a.socio !== filtroSocio.value) return false
    if (!busqueda) return true
    return (
      sinAcentos(a.concepto).includes(busqueda) ||
      sinAcentos(a.socio).includes(busqueda) ||
      sinAcentos(a.observaciones).includes(busqueda)
    )
  })
  return ordenAscendente.value ? lista : [...lista].reverse()
})

/** Totales de lo que se está viendo, con todos los filtros ya aplicados. */
const resumenFiltrado = computed(() => {
  let entradas = 0
  let salidas = 0
  apuntesVisibles.value.forEach(a => {
    if (a.monto >= 0) entradas += a.monto
    else salidas += a.monto
  })
  return { entradas, salidas, neto: entradas + salidas }
})

const desgloseAbierto = ref(false)

/** Desglose del filtrado por concepto, de mayor a menor peso. */
const totalesPorConcepto = computed(() => {
  const porTipo = new Map()
  apuntesVisibles.value.forEach(a => {
    const acumulado = porTipo.get(a.tipo) || { tipo: a.tipo, monto: 0, cantidad: 0 }
    acumulado.monto += a.monto
    acumulado.cantidad += 1
    porTipo.set(a.tipo, acumulado)
  })
  return [...porTipo.values()].sort((x, y) => Math.abs(y.monto) - Math.abs(x.monto))
})

const etiquetaResumen = computed(() => {
  if (filtroConceptos.value.length === 0) return 'Total de los movimientos que estás viendo'
  const nombres = filtroConceptos.value.map(v => CATEGORIAS_LIBRO.find(c => c.value === v)?.label || v)
  if (nombres.length === 1) return `Total de ${nombres[0]}`
  return `Total de ${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
})

const categoriasPresentes = computed(() => {
  const tiposEnRango = new Set(apuntesRango.value.map(a => a.tipo))
  return CATEGORIAS_LIBRO.filter(c => tiposEnRango.has(c.value))
})

const sociosPresentes = computed(() => {
  const nombres = new Set(apuntesRango.value.map(a => a.socio).filter(s => s && s !== '—'))
  return [...nombres].sort((a, b) => a.localeCompare(b, 'es'))
})

const etiquetaConceptos = computed(() => {
  if (filtroConceptos.value.length === 0) return 'Todos los conceptos'
  if (filtroConceptos.value.length === 1) {
    return CATEGORIAS_LIBRO.find(c => c.value === filtroConceptos.value[0])?.label || '1 concepto'
  }
  return `${filtroConceptos.value.length} conceptos`
})

const alternarConcepto = (valor) => {
  const actuales = [...filtroConceptos.value]
  const indice = actuales.indexOf(valor)
  if (indice >= 0) actuales.splice(indice, 1)
  else actuales.push(valor)
  filtroConceptos.value = actuales
}

const hayFiltrosActivos = computed(() =>
  filtroFormaPago.value !== 'todos' ||
  filtroConceptos.value.length > 0 ||
  !!filtroSocio.value ||
  !!filtroBusqueda.value
)

/** Qué decir cuando no hay nada que mostrar: no es lo mismo «aún no hay datos» que «filtraste de más». */
const vacio = computed(() => {
  if (apuntes.value.length === 0) {
    return {
      titulo: 'Todavía no hay movimientos',
      texto: 'Cuando se registre el primer pago, préstamo o actividad, aparecerá aquí y podrás cerrar tu primer corte.',
      conSalidas: false
    }
  }
  if (filtroDesde.value && filtroHasta.value && filtroDesde.value > filtroHasta.value) {
    return {
      titulo: 'El rango de fechas está al revés',
      texto: `«Desde» (${formatDate(filtroDesde.value)}) es posterior a «Hasta» (${formatDate(filtroHasta.value)}), así que no puede haber nada en medio.`,
      conSalidas: true
    }
  }
  return {
    titulo: 'Nada cumple estos filtros',
    texto: 'Hay movimientos registrados, pero ninguno dentro de lo que estás pidiendo. Prueba a ampliar el rango o a quitar algún filtro.',
    conSalidas: true
  }
})

const limpiarFiltros = () => {
  filtroFormaPago.value = 'todos'
  filtroConceptos.value = []
  filtroSocio.value = ''
  filtroBusqueda.value = ''
}

const filtrosAbiertos = ref(false)

/** Cuántos de los filtros que en móvil quedan escondidos están puestos. */
const filtrosAvanzadosActivos = computed(() => {
  let total = 0
  if (filtroConceptos.value.length > 0) total += 1
  if (filtroSocio.value) total += 1
  if (filtroFormaPago.value !== 'todos') total += 1
  if (!presetActivo.value) total += 1
  return total
})

const alternarOrden = () => {
  ordenAscendente.value = !ordenAscendente.value
}

/** Carga progresiva de la lista de apuntes; el centinela va al final de la tabla. */
const {
  centinelaRef,
  mostrados: apuntesMostrados,
  hayMas: hayMasApuntes,
  huboVariasTandas: hayVariasTandasDeApuntes,
  cargarMas: cargarMasApuntes,
  reiniciar: volverALaPrimeraTandaDeApuntes
} = useScrollInfinito(apuntesVisibles, { porTanda: 50 })

// Cambiar de filtro devuelve la lista a la primera tanda: seguir mostrando 400 filas de
// un resultado que ya no es el que se pedía sería una espera gratis.
watch(
  [filtroDesde, filtroHasta, filtroFormaPago, filtroConceptos, filtroSocio, filtroBusqueda, ordenAscendente],
  volverALaPrimeraTandaDeApuntes,
  { deep: true }
)

/* ------------------------------ Cortes sellados -------------------------------- */

const modalCerrarCorte = ref(false)
const modalHistorial = ref(false)
const sellando = ref(false)

/**
 * Recalcula, con los datos de hoy, el esperado de cada corte ya sellado. Encadena los
 * periodos igual que al sellarlos (cada uno parte del real del anterior) para que la
 * comparación sea justa y solo salte cuando de verdad se tocó el pasado.
 */
const esperadoRecalculadoPorCorte = computed(() => {
  const resultado = {}
  const ascendentes = [...cortes.value].sort((a, b) => (a.fecha_corte || '').localeCompare(b.fecha_corte || ''))
  let baseEfectivo = 0
  let baseTransferencia = 0
  let desde = null

  ascendentes.forEach(corte => {
    const delPeriodo = apuntes.value.filter(a => {
      if (!a.fecha) return desde === null
      if (desde && a.fecha < desde) return false
      return a.fecha <= corte.fecha_corte
    })
    resultado[corte.id] = {
      efectivo: baseEfectivo + sumaPorForma(delPeriodo, 'efectivo'),
      transferencia: baseTransferencia + sumaPorForma(delPeriodo, 'transferencia')
    }
    baseEfectivo = corte.real_efectivo || 0
    baseTransferencia = corte.real_transferencia || 0
    desde = diaSiguiente(corte.fecha_corte)
  })

  return resultado
})

const sellarCorte = async (nota) => {
  sellando.value = true
  try {
    await cerrarCorte({
      fechaCorte: hoy,
      esperadoEfectivo: esperadoEfectivo.value,
      realEfectivo: realEfectivo.value,
      esperadoTransferencia: esperadoTransferencia.value,
      realTransferencia: realTransferencia.value,
      nota,
      creadoPor: authStore.userName
    })
    modalCerrarCorte.value = false
    realEfectivoTexto.value = ''
    realTransferenciaTexto.value = ''
    notificaciones.exito('El periodo queda sellado y el siguiente arranca desde este saldo.', 'Corte cerrado')
  } catch (e) {
    // El modal se queda abierto con la nota escrita: reintentar no debe costar volver a redactarla.
    notificaciones.error(e.message, 'No se pudo cerrar el corte')
  } finally {
    sellando.value = false
  }
}

/** Las correcciones se hacen en otros módulos; esto trae los datos frescos sin recargar la página. */
const recargar = async () => {
  await Promise.all([cargar(), cargarCortes()])
  notificaciones.informacion('Movimientos actualizados.', 'Listo')
}

const anularCorteConfirmado = async (idCorte) => {
  try {
    await anularCorte(idCorte)
    notificaciones.informacion('El corte se anuló y el periodo vuelve a abrirse.', 'Corte anulado')
  } catch (e) {
    notificaciones.error(e.message, 'No se pudo anular')
  }
}

/* ------------------------------ Tutorial guiado -------------------------------- */

/**
 * La primera visita abre la bienvenida sola. Después queda el botón «Cómo funciona».
 *
 * La marca es por usuario y no global: en un móvil compartido, el segundo tesorero
 * también merece la explicación. Y lleva versión: cuando el tutorial cambia de verdad,
 * subir el número lo vuelve a ofrecer a todo el mundo, que es justo lo que hay que
 * hacer para que un rediseño le llegue a quien ya había visto el anterior.
 */
const VERSION_TUTORIAL = 3

const claveTutorial = computed(
  () => `natillerapp:conciliacion:tutorial-visto:v${VERSION_TUTORIAL}:${authStore.user?.id || 'anonimo'}`
)

const modalBienvenida = ref(false)
const recorridoAbierto = ref(false)
/** La guía animada de móvil, alternativa al recorrido con foco (ver `abrirTutorial`). */
const modalAyuda = ref(false)

/**
 * Qué mecanismo explica la pantalla depende del ancho, no del gusto: ver `abrirTutorial`.
 * Los pasos de abajo son solo para escritorio, así que hablan de columnas y de filtros a
 * la vista sin ramificar.
 */
const esAncha = ref(typeof window !== 'undefined' ? window.innerWidth >= 640 : true)
const medirAncho = () => { esAncha.value = window.innerWidth >= 640 }

const pasosRecorrido = [
  {
    selector: '[data-tour="panel-corte"]',
    icono: ScaleIcon,
    titulo: '¿Cuadra o no?',
    texto: 'Se resuelve aquí arriba, en tres columnas.',
    pistas: [
      { texto: 'Efectivo', clase: 'bg-green-100 text-green-800' },
      { texto: 'Transferencia', clase: 'bg-blue-100 text-blue-800' },
      { texto: 'Total', clase: 'bg-[#1B5E37]/10 text-[#1B5E37]' }
    ]
  },
  {
    selector: '[data-tour="esperado"]',
    icono: CpuChipIcon,
    titulo: 'Lo que dice la app',
    texto: 'Saldo al inicio + todo lo registrado después.'
  },
  {
    selector: '[data-tour="real"]',
    icono: BanknotesIcon,
    titulo: 'Lo que cuentas tú',
    texto: 'El único dato que pones en esta pantalla.'
  },
  {
    selector: '[data-tour="diferencia"]',
    icono: ArrowsRightLeftIcon,
    titulo: 'La diferencia sale sola',
    pistas: [
      { texto: 'Verde: cuadra', clase: 'bg-emerald-100 text-emerald-800' },
      { texto: 'Ámbar: sobra', clase: 'bg-amber-100 text-amber-900' },
      { texto: 'Rojo: falta', clase: 'bg-red-100 text-red-700' }
    ]
  },
  {
    selector: '[data-tour="sellar"]',
    icono: LockClosedIcon,
    titulo: 'Séllalo',
    texto: 'Congela las cifras y abre un periodo nuevo.'
  },
  {
    selector: '[data-tour="filtros"]',
    icono: MagnifyingGlassIcon,
    titulo: '¿No cuadra? Filtra',
    pistas: [
      { texto: 'Fecha', clase: 'bg-gray-100 text-gray-700' },
      { texto: 'Concepto', clase: 'bg-gray-100 text-gray-700' },
      { texto: 'Socio', clase: 'bg-gray-100 text-gray-700' },
      { texto: 'Forma de pago', clase: 'bg-gray-100 text-gray-700' }
    ]
  },
  {
    selector: '[data-tour="total-filtrado"]',
    icono: CalculatorIcon,
    titulo: 'Total de lo filtrado',
    texto: 'Cuánto se recogió por cada concepto.'
  },
  {
    selector: '[data-tour="saldo"]',
    icono: ListBulletIcon,
    titulo: 'La columna Saldo delata',
    texto: 'Baja hasta la línea donde deja de cuadrar.'
  },
  {
    selector: '[data-tour="historial"]',
    icono: ClockIcon,
    titulo: 'Todo queda firmado',
    texto: 'Quién revisó, cuándo y qué explicó.'
  }
]

/**
 * En pantalla estrecha se explica con la guía animada y no con el recorrido de foco.
 *
 * El recorrido señala elementos reales, y eso en móvil se rompe de dos maneras a la vez:
 * la burbuja del paso es casi tan ancha como la pantalla y acaba tapando justo lo que
 * señala, y los objetivos que no caben en el hueco iluminado dejan un recuadro marcando
 * nada. La guía animada no depende del DOM: dibuja la pantalla y la anima, así que
 * enseña lo mismo sin pelearse por el espacio. En escritorio el foco sí funciona y se
 * mantiene, que es donde vale la pena señalar la pantalla de verdad.
 */
const abrirTutorial = () => {
  recorridoAbierto.value = false
  if (!esAncha.value) {
    modalAyuda.value = true
    marcarTutorialVisto()
    return
  }
  modalBienvenida.value = true
}

const marcarTutorialVisto = () => {
  try {
    localStorage.setItem(claveTutorial.value, '1')
  } catch (e) {
    // Modo privado de Safari: perder la marca solo significa volver a ofrecer el tutorial.
    console.warn('Conciliación: no se pudo recordar que el tutorial ya se vio.', e)
  }
}

const cerrarBienvenida = () => {
  modalBienvenida.value = false
  marcarTutorialVisto()
}

const empezarRecorrido = () => {
  modalBienvenida.value = false
  marcarTutorialVisto()
  // Un tick para que el modal se desmonte: si no, el foco mide el fondo bloqueado.
  // Se vuelve a mirar el ancho: la ventana puede haberse estrechado con la bienvenida
  // abierta, y el foco en estrecho es justo lo que no queremos.
  setTimeout(() => {
    if (esAncha.value) recorridoAbierto.value = true
    else modalAyuda.value = true
  }, 260)
}

const cerrarRecorrido = () => {
  recorridoAbierto.value = false
}

function ofrecerTutorialSiEsLaPrimeraVez() {
  // Puerta de escape para probarlo: `?ayuda=1` lo abre siempre y no deja marca, así que
  // se puede repetir. Misma convención que la guía de Cuotas.
  const forzar = route.query.ayuda === '1' || route.query.ayuda === 'true'
  if (forzar) {
    if (esAncha.value) modalBienvenida.value = true
    else modalAyuda.value = true
    return
  }

  try {
    if (localStorage.getItem(claveTutorial.value)) return
  } catch (e) {
    return
  }
  // En móvil la guía animada se abre directa: ya trae su propio paso de bienvenida, así
  // que la pantalla de antesala sobraba y solo añadía un toque.
  if (!esAncha.value) {
    modalAyuda.value = true
    marcarTutorialVisto()
    return
  }
  modalBienvenida.value = true
}

/* --------------------------------- Exportar ------------------------------------ */

const exportando = ref(false)

// xlsx-js-style pesa ~600 KB: se carga solo al exportar para no inflar el chunk de la vista.
let XLSX = null
async function asegurarXLSX() {
  if (XLSX) return
  const modulo = await import('xlsx-js-style')
  XLSX = modulo.default || modulo
}

const exportarExcel = async () => {
  if (apuntesVisibles.value.length === 0) return
  exportando.value = true
  try {
    await asegurarXLSX()
    const filas = apuntesVisibles.value.map(a => ({
      Fecha: formatDate(a.fecha),
      Concepto: a.concepto,
      Socio: a.socio,
      Forma: a.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia',
      Nota: a.observaciones || '',
      Monto: a.monto,
      Saldo: a.saldo
    }))

    const hoja = XLSX.utils.json_to_sheet(filas)
    const rango = XLSX.utils.decode_range(hoja['!ref'])

    for (let columna = rango.s.c; columna <= rango.e.c; columna++) {
      const celda = XLSX.utils.encode_cell({ r: 0, c: columna })
      if (!hoja[celda]) continue
      hoja[celda].s = {
        fill: { fgColor: { rgb: '1B5E37' }, patternType: 'solid' },
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
    for (let fila = 1; fila <= rango.e.r; fila++) {
      for (let columna = rango.s.c; columna <= rango.e.c; columna++) {
        const celda = XLSX.utils.encode_cell({ r: fila, c: columna })
        if (!hoja[celda]) continue
        const esNumero = columna >= 5
        hoja[celda].s = {
          font: { sz: 10, color: { rgb: esNumero && hoja[celda].v < 0 ? 'B91C1C' : '1F2937' } },
          alignment: { horizontal: esNumero ? 'right' : 'left', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          }
        }
        if (esNumero) hoja[celda].z = '#,##0;[Red]-#,##0'
      }
    }
    // Fila de totales: el mismo número que se ve en pantalla, para que el Excel se sostenga solo.
    const filaTotales = rango.e.r + 2
    XLSX.utils.sheet_add_aoa(
      hoja,
      [[etiquetaResumen.value, '', '', '', 'Neto', resumenFiltrado.value.neto, '']],
      { origin: filaTotales }
    )
    for (const columna of [0, 4, 5]) {
      const celda = XLSX.utils.encode_cell({ r: filaTotales, c: columna })
      if (!hoja[celda]) continue
      hoja[celda].s = {
        fill: { fgColor: { rgb: 'E8F5E9' }, patternType: 'solid' },
        font: { bold: true, sz: 11, color: { rgb: '1B5E37' } },
        alignment: { horizontal: columna === 5 ? 'right' : 'left', vertical: 'center' }
      }
      if (columna === 5) hoja[celda].z = '#,##0;[Red]-#,##0'
    }

    hoja['!cols'] = [{ wch: 12 }, { wch: 32 }, { wch: 22 }, { wch: 10 }, { wch: 28 }, { wch: 14 }, { wch: 14 }]

    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Conciliación')
    const nombre = (natillera.value?.nombre || 'Natillera').replace(/[^a-zA-Z0-9]/g, '_')
    XLSX.writeFile(libro, `Conciliacion_${nombre}_${filtroDesde.value}_a_${filtroHasta.value}.xlsx`)
    notificaciones.exito('Archivo descargado con los filtros aplicados.', 'Exportado')
  } catch (e) {
    console.error('Error exportando la conciliación:', e)
    notificaciones.critica(e.message || 'No se pudo exportar', 'Error')
  } finally {
    exportando.value = false
  }
}

/* ------------------------------- Ciclo de vida --------------------------------- */

const dropdownConceptosRef = ref(null)
const dropdownConceptos = ref(false)

const cerrarDropdownFuera = (evento) => {
  if (!dropdownConceptos.value) return
  if (dropdownConceptosRef.value?.contains(evento.target)) return
  dropdownConceptos.value = false
}

onMounted(() => {
  document.addEventListener('click', cerrarDropdownFuera)
  // `orientationchange` además de `resize`: en iOS girar el aparato no siempre dispara
  // el segundo a tiempo (docs/compatibilidad-ios-safari.md §4).
  window.addEventListener('resize', medirAncho)
  window.addEventListener('orientationchange', medirAncho)
  medirAncho()
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarDropdownFuera)
  window.removeEventListener('resize', medirAncho)
  window.removeEventListener('orientationchange', medirAncho)
})

watch(id, async (nuevoId) => {
  if (!nuevoId) return
  // Los permisos no dependen del libro de caja: pedirlos a la vez ahorra una ida y vuelta
  // entera antes de que la pantalla se pueda dibujar.
  const promesaPermisos = colaboradoresStore.obtenerMisPermisos(nuevoId).catch(e => {
    // Un fallo aquí no debe dejar la pantalla bloqueada sin explicación: se registra y
    // el usuario cae al modo consulta, con el aviso de permisos visible.
    console.error('Conciliación: no se pudieron leer los permisos.', e)
    return null
  })
  await cargar()
  misPermisos.value = await promesaPermisos
  // Después de cargar: si la pantalla no ha terminado de dibujarse, el recorrido
  // enfocaría elementos que aún no existen.
  if (!errorCarga.value) ofrecerTutorialSiEsLaPrimeraVez()
}, { immediate: true })

// El rango por defecto es el periodo abierto; al sellar un corte se recoloca solo.
watch([periodoDesde, cargando], () => {
  if (cargando.value) return
  if (!filtroDesde.value || presetActivo.value === 'periodo' || filtroDesde.value < periodoDesde.value) {
    aplicarPreset('periodo')
  }
}, { immediate: true })

watch(umbralDiferencia, (valor) => {
  umbralTexto.value = valor ? formatearMontoInput(String(valor)) : ''
}, { immediate: true })
</script>

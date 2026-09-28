<template>
  <div class="max-w-7xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-6">
    <RecorridoInteractivo :pasos="pasosGuiaPrestamos" :activo="guiaPrestamosActiva" @terminar="cerrarGuiaPrestamos" />
    <!-- FAB: la acción principal sigue a mano cuando la cabecera sale de pantalla -->
    <Transition name="ds-fab">
      <button
        v-if="mostrarFab && !soloLectura"
        type="button"
        class="ds-fab"
        aria-label="Nuevo préstamo"
        @click="abrirModalNuevoPrestamo"
      >
        <PlusIcon class="w-6 h-6" />
      </button>
    </Transition>
    <!-- Page header (DS) — patrón unificado Socios/Actividades/Cuotas/Préstamos -->
    <header ref="headerRef" class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton :to="`/natilleras/${id}`" :inline="true" />
          <div class="ds-page-header__icon">
            <BanknotesIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title">Préstamos</h1>
            <p class="ds-page-header__sub hidden sm:block">Gestiona los préstamos internos del fondo</p>
          </div>
          <!-- Relanza el recorrido guiado a voluntad; no gasta las visitas en que sale solo. -->
          <button
            type="button"
            data-guia="boton-recorrido"
            class="flex h-11 min-w-[2.75rem] flex-shrink-0 touch-manipulation items-center justify-center gap-1.5 rounded-full border border-[#166534]/25 bg-white text-[#166534] shadow-sm transition-colors hover:bg-[#f0fdf4] active:bg-[#dcfce7] sm:h-auto sm:px-3 sm:py-2 sm:rounded-lg [-webkit-tap-highlight-color:transparent]"
            title="¿Cómo funciona esta pantalla?"
            aria-label="¿Cómo funciona esta pantalla? Ver el recorrido guiado"
            @click="abrirGuiaPrestamos({ manual: true })"
          >
            <QuestionMarkCircleIcon class="h-5 w-5 flex-shrink-0 sm:h-4 sm:w-4" />
            <span class="hidden text-xs font-semibold sm:inline">¿Cómo funciona?</span>
          </button>
        </div>
        <!-- CTA primario. En móvil `__row` es columna, así que cae como fila propia bajo
             el título y cabe el texto completo; antes era un «+» sin etiqueta apretado
             junto al título, que no decía qué hacía. -->
        <div class="ds-page-header__actions">
          <button
            v-if="!soloLectura"
            type="button"
            data-guia="prestamos-nuevo"
            class="ds-btn ds-btn--primary w-full sm:w-auto"
            aria-label="Registrar préstamo"
            @click="abrirModalNuevoPrestamo"
          >
            <PlusIcon class="w-5 h-5 sm:w-4 sm:h-4" />
            <span class="sm:hidden">Registrar préstamo</span>
            <span class="hidden sm:inline">Nuevo Préstamo</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="soloLectura && permisos.cargado.value" class="ds-callout">
      <InformationCircleIcon class="ds-callout__icon h-5 w-5" />
      <p><span class="ds-callout__title">Solo lectura.</span> Puedes ver los préstamos, pero no registrar ni cambiar nada.</p>
    </div>

    <!-- Skeleton de carga inicial (resumen + lista) -->
    <PrestamosSkeleton v-if="cargaInicial" />

    <template v-else>
    <!-- Resumen (DS stat cards) -->
    <div data-guia="prestamos-resumen" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      <div data-guia="prestamos-resumen-total" class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <BanknotesIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">{{ prestamos.length }}</p>
        <p class="ds-stat-card__label">Total Préstamos</p>
      </div>

      <div data-guia="prestamos-resumen-prestado" class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">${{ formatMoney(totalPrestado) }}</p>
        <p class="ds-stat-card__label">Prestado</p>
      </div>

      <div data-guia="prestamos-resumen-pagado" class="ds-stat-card">
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">${{ formatMoney(totalPagado) }}</p>
        <p class="ds-stat-card__label">Total Pagado</p>
      </div>

      <!-- Se toca para ver de dónde sale: préstamo por préstamo y la mora cobrada -->
      <button
        type="button"
        data-guia="prestamos-resumen-intereses"
        class="ds-stat-card w-full touch-manipulation text-left transition hover:border-[color:var(--brand-primary)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-primary)]"
        aria-label="Ver el desglose de los intereses ganados"
        @click="modalInteresesGanados = true"
      >
        <div class="ds-stat-card__icon">
          <CurrencyDollarIcon class="w-5 h-5" />
        </div>
        <p class="ds-stat-card__value">${{ formatMoney(totalIntereses) }}</p>
        <p class="ds-stat-card__label inline-flex items-center gap-1">
          Intereses Ganados
          <ChevronRightIcon class="h-3.5 w-3.5 flex-shrink-0" />
        </p>
      </button>
    </div>

    <!-- Empty state: sin préstamos registrados (DS) -->
    <div v-if="prestamos.length === 0" class="ds-empty-state">
      <div class="ds-empty-state__header">
        <div class="ds-empty-state__icon-wrap">
          <BanknotesIcon class="w-7 h-7" />
        </div>
        <h3 class="ds-empty-state__title">No hay préstamos registrados</h3>
        <p class="ds-empty-state__subtitle">
          Los préstamos internos generan intereses para el fondo común
        </p>
      </div>
      <div v-if="!soloLectura" class="ds-empty-state__body">
        <button
          type="button"
          class="ds-btn ds-btn--primary ds-btn--block"
          @click="abrirModalNuevoPrestamo"
        >
          <PlusIcon class="w-5 h-5" />
          Crear primer préstamo
        </button>
      </div>
    </div>

    <!-- Panel que envuelve las secciones (Por cobrar / Pagados) -->
    <section v-else class="prestamos-panel">
      <!-- Cabecera del panel: tabs + resumen de la sección activa -->
      <header class="prestamos-panel__head">
        <div data-guia="prestamos-pestanas" class="prestamos-tabs" role="tablist" aria-label="Secciones de préstamos">
          <button
            type="button"
            role="tab"
            :aria-selected="tabPrestamos === 'por_cobrar'"
            class="prestamos-tab"
            :class="tabPrestamos === 'por_cobrar' ? 'prestamos-tab--active' : ''"
            @click="tabPrestamos = 'por_cobrar'"
          >
            <span>Por cobrar</span>
            <span class="prestamos-tab__count">{{ prestamosPorCobrar.length }}</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="tabPrestamos === 'pagados'"
            class="prestamos-tab"
            :class="tabPrestamos === 'pagados' ? 'prestamos-tab--active' : ''"
            @click="tabPrestamos = 'pagados'"
          >
            <span>Pagados</span>
            <span class="prestamos-tab__count">{{ prestamosPagados.length }}</span>
          </button>
        </div>

        <p data-guia="prestamos-saldo-seccion" class="prestamos-panel__summary">
          <span class="prestamos-panel__summary-label">
            {{ tabPrestamos === 'pagados' ? 'Total pagado' : 'Saldo por cobrar' }}
          </span>
          <span class="prestamos-panel__summary-value">
            ${{ formatMoney(tabPrestamos === 'pagados' ? montoPagadosSeccion : saldoPorCobrar) }}
          </span>
        </p>
      </header>

      <!-- Cuerpo del panel: envuelve las tarjetas -->
      <div data-guia="prestamos-lista" class="prestamos-panel__body">
        <!-- Empty de la pestaña activa -->
        <div
          v-if="prestamosFiltrados.length === 0"
          class="prestamos-panel__empty"
        >
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">
            <BanknotesIcon class="w-6 h-6" />
          </div>
          <p class="font-display font-semibold text-gray-700">
            {{ tabPrestamos === 'pagados' ? 'No hay préstamos pagados' : 'No hay préstamos por cobrar' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ tabPrestamos === 'pagados'
              ? 'Los préstamos saldados aparecerán aquí.'
              : '¡Todo al día! Aún no hay préstamos pendientes de cobro.' }}
          </p>
        </div>

        <!-- Lista de la pestaña activa: ds-card compacta (nombre → saldo → Monto/Interés/Pagado) -->
        <!--
          Una tarjeta por fila, a todo el ancho. En tres columnas las cifras del crédito
          se apretaban y el nombre del socio se truncaba; a lo ancho la tarjeta se parte en
          dos y el bloque de mora se lee sin romperse.
        -->
        <!--
          Pagados: en escritorio van en cuadrícula y apilados por dentro. Una tarjeta pagada no
          tiene saldo, mora ni próximo pago; a todo el ancho, su columna izquierda quedaba casi
          vacía. En móvil es la misma pila de siempre.
        -->
        <div
          v-else
          class="grid grid-cols-1 items-start gap-4"
          :class="{ 'md:grid-cols-2 xl:grid-cols-3': tabPrestamos === 'pagados' }"
        >
        <div
          v-for="(prestamo, idx) in prestamosFiltrados"
          :key="prestamo.id"
          :data-guia="idx === 0 ? 'prestamos-tarjeta' : undefined"
          @click="abrirModalDetalle(prestamo)"
          class="ds-card ds-card--hover cursor-pointer"
          :class="{ 'lg:flex lg:items-start lg:gap-6': prestamo.estado !== 'pagado' }"
        >
          <!-- Jerarquía de la tarjeta, de más a menos importante:
               1. quién y cómo va       → nombre + badge de estado
               2. cuánto debe           → saldo (cifra protagonista) + progreso del plan
               3. qué hacer y cuándo    → UN solo bloque resaltado: mora o próximo pago
               4. condiciones del crédito → monto/tasa/intereses/pagado, en letra de referencia
               5. acciones
               Nunca compiten dos bloques resaltados: en mora, el próximo pago baja a
               línea secundaria dentro del bloque rojo.
               Del 4 en adelante viven en un panel lateral en escritorio (ver más abajo). -->

          <!-- Columna izquierda: quién es, cuánto debe y qué toca hacer. -->
          <div class="flex min-w-0 flex-1 flex-col gap-3">

          <!-- 1. Identidad y estado -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-display text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">
                {{ prestamo.socio_natillera?.socio?.nombre || 'Socio' }}
              </p>
              <!-- En activos el progreso va bajo el saldo; aquí solo el resumen del plan saldado -->
              <p v-if="prestamo.estado === 'pagado' && prestamo.cuotasTotales > 0" class="mt-0.5 text-sm text-slate-500 tabular-nums">
                {{ prestamo.cuotasTotales }} {{ prestamo.cuotasTotales === 1 ? 'cuota' : 'cuotas' }}
              </p>
            </div>
            <span v-if="prestamo.enMora" data-guia-parte="estado" class="ds-badge ds-badge--danger flex-shrink-0 whitespace-nowrap">
              <ExclamationTriangleIcon class="h-3.5 w-3.5" />
              <template v-if="prestamo.tieneCuotasVencidas">En mora · {{ prestamo.diasMora }} {{ prestamo.diasMora === 1 ? 'día' : 'días' }}</template>
              <template v-else>En mora · intereses</template>
            </span>
            <span v-else-if="prestamo.estado === 'activo'" data-guia-parte="estado" class="ds-badge ds-badge--success flex-shrink-0 whitespace-nowrap">
              <CheckCircleIcon class="h-3.5 w-3.5" />
              Al día
            </span>
            <span v-else-if="prestamo.estado === 'pagado'" data-guia-parte="estado" class="ds-badge ds-badge--muted flex-shrink-0 whitespace-nowrap">
              <CheckCircleIcon class="h-3.5 w-3.5" />
              Pagado
            </span>
          </div>

          <!-- 2. Saldo: la cifra que manda en la tarjeta, con el avance del plan debajo.
               Un préstamo pagado no tiene saldo que mostrar. -->
          <div v-if="prestamo.estado !== 'pagado'" data-guia-parte="saldo">
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-sm text-slate-500">Saldo</span>
              <span
                class="font-display text-2xl font-extrabold leading-none tabular-nums"
                :class="prestamo.enMora ? 'text-[color:var(--brand-danger)]' : 'text-slate-900'"
              >
                ${{ formatMoney(saldoConMora(prestamo)) }}
              </span>
            </div>
            <!-- El saldo lleva sus dos intereses: los del plan y los de mora -->
            <p v-if="desgloseSaldoPrestamo(prestamo.id)" class="mt-0.5 text-right text-xs tabular-nums text-slate-500">
              Capital ${{ formatMoney(desgloseSaldoPrestamo(prestamo.id).capital) }}
              · Intereses <span class="font-semibold text-[color:var(--brand-warning)]">${{ formatMoney(desgloseSaldoPrestamo(prestamo.id).interes) }}</span>
              <template v-if="desgloseSaldoPrestamo(prestamo.id).mora > 0">
                · Mora <span class="font-semibold text-[color:var(--brand-danger)]">${{ formatMoney(desgloseSaldoPrestamo(prestamo.id).mora) }}</span>
              </template>
            </p>
            <div v-if="prestamo.cuotasTotales > 0" class="mt-2">
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-divider)]">
                <div
                  class="h-full rounded-full bg-[color:var(--brand-primary)]"
                  :style="{ width: porcentajePagadoPrestamo(prestamo) + '%' }"
                ></div>
              </div>
              <p class="mt-1 flex items-baseline justify-between gap-2 text-xs text-slate-500 tabular-nums">
                <span>{{ prestamo.cuotasPagadas }} de {{ prestamo.cuotasTotales }} cuotas</span>
                <span>{{ porcentajePagadoPrestamo(prestamo) }}% pagado</span>
              </p>
            </div>
          </div>

          <!-- 3a. En mora: lo que se paga hoy para ponerse al día (cuotas vencidas + interés
               de mora). Absorbe el próximo pago como línea menor para no partir la atención. -->
          <div v-if="prestamo.enMora" class="ds-callout prestamo-callout--mora !block tabular-nums">
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-semibold">Para ponerse al día</span>
              <span class="font-display text-base font-bold text-[color:var(--brand-danger)]">
                ${{ formatMoney((prestamo.valorCuotasEnDeuda || 0) + (prestamo.moraAcumulada || 0)) }}
              </span>
            </div>
            <p class="text-xs">
              <template v-if="prestamo.tieneCuotasVencidas">Vencido ${{ formatMoney(prestamo.valorCuotasEnDeuda || 0) }}</template>
              <strong v-if="prestamo.moraAcumulada > 0" class="font-bold">{{ prestamo.tieneCuotasVencidas ? '+ ' : '' }}mora pendiente ${{ formatMoney(prestamo.moraAcumulada) }}</strong>
            </p>
            <p v-if="prestamo.proximoPago" class="mt-1 border-t border-[color:rgba(153,27,27,0.15)] pt-1 text-xs opacity-90">
              Siguiente cuota {{ formatDate(prestamo.proximoPago.fechaLimite) }} ·
              ${{ formatMoney(prestamo.proximoPago.valor) }}
            </p>
          </div>

          <!-- 3b. Al día: cuándo toca el próximo pago. La fecha ya incluye los días de
               gracia, o sea que es hasta cuándo se puede pagar sin mora. Una línea que se
               parte en dos en móviles estrechos (`flex-wrap` + `ml-auto`); el detalle
               —número de cuota, gracia, fecha nominal— vive en el modal de detalle. -->
          <div
            v-else-if="prestamo.estado === 'activo' && prestamo.proximoPago"
            data-guia-parte="proximo"
            class="ds-callout prestamo-callout--proximo tabular-nums"
            :class="{ 'prestamo-callout--proximo-urgente': prestamo.proximoPago.diasRestantes <= 2 }"
          >
            <span class="min-w-0 font-semibold">
              Próximo pago
              <span class="font-normal">{{ formatDate(prestamo.proximoPago.fechaLimite) }}</span>
              <span class="whitespace-nowrap text-xs">· {{ textoProximoPago(prestamo.proximoPago) }}</span>
            </span>
            <span class="ml-auto flex-shrink-0 font-display text-base font-bold">
              ${{ formatMoney(prestamo.proximoPago.valor) }}
            </span>
          </div>

          </div>

          <!--
            Columna derecha: las condiciones y los botones. A lo ancho, una fila de
            acciones de borde a borde queda ridícula —un «Abonar» de mil píxeles—, así que
            en escritorio se recogen en un panel lateral de ancho fijo separado por una
            línea. En móvil vuelve todo a la pila de siempre.
          -->
          <div
            class="mt-3 flex flex-col gap-3 border-t border-[color:var(--surface-divider)] pt-3"
            :class="{ 'lg:mt-0 lg:w-72 lg:flex-shrink-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0': prestamo.estado !== 'pagado' }"
          >

          <!-- 4. Condiciones del crédito: referencia, no protagonismo -->
          <div data-guia-parte="cifras" class="grid grid-cols-2 gap-2">
            <div class="flex min-w-0 flex-col">
              <span class="text-[0.6875rem] uppercase tracking-wide text-slate-400">Monto</span>
              <span class="truncate text-sm font-semibold tabular-nums text-slate-700">${{ formatMoney(prestamo.monto) }}</span>
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="text-[0.6875rem] uppercase tracking-wide text-slate-400">Interés</span>
              <span class="truncate text-sm font-semibold tabular-nums text-slate-700">{{ prestamo.interes }}%</span>
            </div>
            <!--
              Lo que el préstamo le deja al fondo, en pesos. La tasa sola no dice nada:
              un 5 % a una cuota y un 5 % a seis dejan cosas muy distintas.
            -->
            <div class="flex min-w-0 flex-col">
              <span class="text-[0.6875rem] uppercase tracking-wide text-slate-400">Intereses</span>
              <span class="truncate text-sm font-semibold tabular-nums text-amber-700">
                ${{ formatMoney(calcularInteresesGeneradosDetalle(prestamo)) }}
              </span>
            </div>
            <div class="flex min-w-0 flex-col">
              <span class="text-[0.6875rem] uppercase tracking-wide text-slate-400">Pagado</span>
              <span class="truncate text-sm font-semibold tabular-nums text-[color:var(--brand-primary)]">${{ formatMoney(calcularValorPagadoDetalle(prestamo)) }}</span>
            </div>
          </div>

          <!-- Acciones: una principal + «⋯» que despliega el resto en la misma tarjeta.
               Desplegable en línea y no modal: la pila de modales ocultaría el menú y lo
               restauraría al cerrar Refinanciar/Eliminar, y cerrar uno y abrir otro en el
               mismo gesto descuadra el history (ver replaceTop en useModalStack). -->
          <div class="flex items-center gap-2">
            <button
              v-if="prestamo.estado === 'activo' && !soloLectura"
              type="button"
              data-guia-parte="abonar"
              class="ds-btn ds-btn--primary flex-1"
              @click.stop="abrirModalAbono(prestamo)"
            >
              <PlusIcon class="h-4 w-4" />
              Abonar
            </button>
            <button
              v-else-if="prestamo.estado === 'pagado'"
              type="button"
              class="ds-btn ds-btn--primary flex-1"
              @click.stop="enviarComprobantePagado(prestamo)"
            >
              <PaperAirplaneIcon class="h-4 w-4" />
              Enviar comprobante
            </button>
            <!-- «⋯» solo despliega Refinanciar y Eliminar: sin permiso quedaría vacío. -->
            <button
              v-if="!soloLectura"
              type="button"
              data-guia-parte="mas"
              class="ds-btn ds-btn--secondary prestamo-card__mas ml-auto"
              :aria-expanded="accionesPrestamoAbiertas === prestamo.id"
              aria-label="Más acciones"
              @click.stop="alternarAccionesPrestamo(prestamo.id)"
            >
              <EllipsisHorizontalIcon class="h-5 w-5" />
            </button>
          </div>
          <div v-if="accionesPrestamoAbiertas === prestamo.id && !soloLectura" class="flex items-center gap-2">
            <button
              v-if="prestamo.estado === 'activo'"
              type="button"
              class="ds-btn ds-btn--secondary flex-1"
              @click.stop="accionesPrestamoAbiertas = null; abrirModalRefinanciar(prestamo)"
            >
              <ArrowPathIcon class="h-4 w-4" />
              Refinanciar
            </button>
            <button
              type="button"
              class="ds-btn ds-btn--ghost prestamo-card__eliminar flex-1"
              @click.stop="accionesPrestamoAbiertas = null; confirmarEliminarPrestamo(prestamo)"
            >
              <TrashIcon class="h-4 w-4" />
              Eliminar
            </button>
          </div>

          </div>
        </div>
      </div>
      </div>
    </section>
    </template>

    <InteresesGanadosModal
      :show="!!modalInteresesGanados"
      :natillera-id="id"
      :natillera-nombre="natillerasStore.natilleraActual?.nombre || ''"
      @cerrar="requestCloseTopModal"
    />

    <!-- Ayuda «¿Cómo se calcula el interés?» (se abre desde crear o refinanciar; la pila de modales oculta el formulario y lo restaura al cerrar) -->
    <ExplicacionInteresPrestamo
      :show="modalAyudaInteres"
      v-bind="propsAyudaInteres"
      @close="requestCloseTopModal"
    />

    <!-- Modal Nuevo Préstamo (paso a paso) — patrón ModalWrapper / skill modales -->
    <ModalWrapper
      :show="!!modalNuevoPrestamo"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil: flex para X siempre a la derecha; sm+: absoluta sobre bloque centrado) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Crear Préstamo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">{{ ['Monto y socio', 'Plazo e interés', 'Resumen'][pasoNuevoPrestamo] }}</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Crear Préstamo</h3>
              <p class="text-white/90 text-xs mt-1">{{ ['Monto y socio', 'Plazo e interés', 'Resumen'][pasoNuevoPrestamo] }}</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Barra de progreso paso a paso -->
        <div class="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 flex-shrink-0 bg-white border-b border-gray-100">
          <div class="flex gap-0.5 sm:gap-1">
            <template v-for="(label, idx) in ['Monto', 'Plazo', 'Resumen']" :key="idx">
              <div class="flex-1 flex flex-col items-center min-w-0">
                <div
                  :class="[
                    'h-1 sm:h-1.5 w-full rounded-full transition-all duration-300',
                    idx <= pasoNuevoPrestamo ? 'bg-emerald-500' : 'bg-gray-100'
                  ]"
                ></div>
                <span
                  :class="[
                    'text-[10px] sm:text-[11px] font-medium mt-1.5 sm:mt-2 truncate w-full text-center',
                    idx <= pasoNuevoPrestamo ? 'text-gray-800' : 'text-gray-400'
                  ]"
                >{{ label }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Contenido por pasos: envoltorio ancla el hint al viewport del cuerpo (evita píldora a mitad en Safari/WebKit) -->
        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalNuevoPrestamoScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="actualizarIndicadorScrollModalNuevoPrestamo"
        >
          <form @submit.prevent="pasoNuevoPrestamo < 2 ? pasoNuevoPrestamo++ : handleCrearPrestamo()" class="px-4 sm:px-6 pt-4 sm:pt-5 pb-0">
          <!-- Paso 0: Monto y socio -->
          <div v-show="pasoNuevoPrestamo === 0" class="space-y-4 sm:space-y-5">
          <!-- Selector de Socio -->
          <div class="relative selector-socio-container">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Socio</label>
            <div class="relative">
              <button
                type="button"
                @click="mostrarSelectorSocio = !mostrarSelectorSocio"
                :class="[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 bg-white',
                  formPrestamo.socio_natillera_id 
                    ? 'border-emerald-300 text-gray-800' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  mostrarSelectorSocio ? 'border-emerald-400 ring-2 ring-emerald-500/20' : ''
                ]"
              >
                <div v-if="socioSeleccionado" class="flex items-center gap-3 flex-1 min-w-0">
                  <img 
                    :src="getAvatarUrl(socioSeleccionado.socio?.nombre || socioSeleccionado.id, socioSeleccionado.socio?.avatar_seed, socioSeleccionado.socio?.avatar_style)" 
                    :alt="socioSeleccionado.socio?.nombre"
                    class="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 object-cover"
                  />
                  <div class="flex-1 min-w-0 text-left">
                    <p class="font-semibold text-gray-800 truncate">{{ socioSeleccionado.socio?.nombre }}</p>
                    <p v-if="socioSeleccionado.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socioSeleccionado.socio.telefono }}</p>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3 flex-1 text-gray-500">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon class="w-5 h-5 text-gray-400" />
                  </div>
                  <span>Selecciona un socio...</span>
                </div>
                <ChevronDownIcon 
                  :class="[
                    'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
                    mostrarSelectorSocio ? 'transform rotate-180' : ''
                  ]"
                />
              </button>

              <!-- Dropdown de socios -->
              <div 
                v-if="mostrarSelectorSocio"
                @click.stop
                class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden"
              >
                <div class="p-2.5 border-b border-gray-100 sticky top-0 bg-white">
                  <input
                    v-model="busquedaSocio"
                    type="text"
                    placeholder="Buscar socio..."
                    class="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-colors"
                    @click.stop
                  />
                </div>
                <div class="overflow-y-auto max-h-64">
                  <button
                    v-for="socio in sociosFiltrados"
                    :key="socio.id"
                    type="button"
                    @click="seleccionarSocio(socio)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                    :class="formPrestamo.socio_natillera_id === socio.id ? 'bg-emerald-50/80' : ''"
                  >
                    <img 
                      :src="getAvatarUrl(socio.socio?.nombre || socio.id, socio.socio?.avatar_seed, socio.socio?.avatar_style)" 
                      :alt="socio.socio?.nombre"
                      class="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0 object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800 truncate">{{ socio.socio?.nombre }}</p>
                      <p v-if="socio.socio?.telefono" class="text-xs text-gray-500 truncate">{{ socio.socio.telefono }}</p>
                      <p v-else-if="socio.socio?.email" class="text-xs text-gray-500 truncate">{{ socio.socio.email }}</p>
                    </div>
                    <div v-if="formPrestamo.socio_natillera_id === socio.id" class="flex-shrink-0">
                      <div class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </button>
                  <div v-if="sociosFiltrados.length === 0" class="p-4 text-center text-gray-500 text-sm">
                    No se encontraron socios
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="formPrestamo.socio_natillera_id && !cargandoTotalAhorradoSocio && totalAhorradoInformativoSocio !== null"
              class="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 shadow-sm ring-1 ring-emerald-500/15 sm:px-5 sm:py-4"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-base font-semibold text-gray-700">Total ahorrado por el socio</span>
                <span class="text-lg font-bold tabular-nums text-emerald-800 shrink-0">${{ formatMoney(totalAhorradoInformativoSocio) }}</span>
              </div>
            </div>
            <div
              v-else-if="formPrestamo.socio_natillera_id && cargandoTotalAhorradoSocio"
              class="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 shadow-sm ring-1 ring-emerald-500/15 sm:px-5 sm:py-4"
              aria-busy="true"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-base font-semibold text-gray-700">Total ahorrado por el socio</span>
                <span class="h-6 w-28 rounded-md bg-emerald-200/70 animate-pulse shrink-0" aria-hidden="true" />
              </div>
            </div>
          </div>

          <!-- Periodicidad de pago -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Periodicidad</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="formPrestamo.periodicidad = 'mensual'"
                :class="[
                  'p-3 rounded-xl border text-left transition-all duration-200',
                  formPrestamo.periodicidad === 'mensual'
                    ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                ]"
              >
                <div class="flex items-center gap-2">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.periodicidad === 'mensual' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500']">
                    <CalendarDaysIcon class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span :class="['font-semibold text-sm block', formPrestamo.periodicidad === 'mensual' ? 'text-emerald-800' : 'text-gray-700']">Mensual</span>
                    <span class="text-xs text-gray-500">Una cuota por mes</span>
                  </div>
                  <div v-if="formPrestamo.periodicidad === 'mensual'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  </div>
                </div>
              </button>
              <button
                type="button"
                @click="formPrestamo.periodicidad = 'quincenal'"
                :class="[
                  'p-3 rounded-xl border text-left transition-all duration-200',
                  formPrestamo.periodicidad === 'quincenal'
                    ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                ]"
              >
                <div class="flex items-center gap-2">
                  <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.periodicidad === 'quincenal' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500']">
                    <ClockIcon class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span :class="['font-semibold text-sm block', formPrestamo.periodicidad === 'quincenal' ? 'text-emerald-800' : 'text-gray-700']">Quincenal</span>
                    <span class="text-xs text-gray-500">Dos cuotas por mes</span>
                  </div>
                  <div v-if="formPrestamo.periodicidad === 'quincenal'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Monto del préstamo -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Monto del préstamo</label>
            <div class="relative">
              <div class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg z-10" aria-hidden="true">$</div>
              <input 
                :value="montoFormateado"
                @input="actualizarMonto"
                @pointerdown="alPresionarMonto"
                @focus="seleccionarTodoMonto"
                @click="alTocarMonto"
                type="text" 
                inputmode="numeric"
                class="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-lg font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-shadow"
                placeholder="100.000"
                required
              />
            </div>
            <p v-if="formPrestamo.monto >= 10000" class="mt-1.5 text-sm text-gray-500">
              <span class="font-medium text-emerald-600">${{ formatMoney(formPrestamo.monto) }}</span> pesos colombianos
            </p>
            <p v-else-if="formPrestamo.monto > 0" class="mt-1.5 text-sm text-amber-600">
              Monto mínimo ${{ formatMoney(10000) }}
            </p>
          </div>
          </div>

          <!-- Paso 1: Plazo e interés -->
          <div v-show="pasoNuevoPrestamo === 1" class="space-y-4 sm:space-y-5">
          <!-- Tipo de interés -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Tipo de interés</label>
            <div class="grid grid-cols-2 gap-2">
              <label :class="['flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200', formPrestamo.tipo_interes === 'simple' ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300']">
                <input type="radio" v-model="formPrestamo.tipo_interes" value="simple" class="sr-only" required />
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.tipo_interes === 'simple' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400']">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span :class="['font-semibold text-sm block', formPrestamo.tipo_interes === 'simple' ? 'text-emerald-800' : 'text-gray-700']">Simple</span>
                  <span class="text-xs text-gray-500">Interés fijo sobre el monto</span>
                </div>
                <div v-if="formPrestamo.tipo_interes === 'simple'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
              </label>
              <label :class="['flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200', formPrestamo.tipo_interes === 'compuesto' ? 'border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300']">
                <input type="radio" v-model="formPrestamo.tipo_interes" value="compuesto" class="sr-only" required />
                <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', formPrestamo.tipo_interes === 'compuesto' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400']">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span :class="['font-semibold text-sm block', formPrestamo.tipo_interes === 'compuesto' ? 'text-emerald-800' : 'text-gray-700']">Compuesto</span>
                  <span class="text-xs text-gray-500">Cuota fija, interés sobre saldo</span>
                </div>
                <div v-if="formPrestamo.tipo_interes === 'compuesto'" class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                </div>
              </label>
            </div>
            <button
              type="button"
              class="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-[#1B5E37] underline-offset-2 hover:underline touch-manipulation"
              @click="abrirAyudaInteres('crear')"
            >
              <QuestionMarkCircleIcon class="h-5 w-5 flex-shrink-0" />
              ¿Cómo se calcula el interés?
            </button>
          </div>

          <!-- Número de cuotas e Interés -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Nº de cuotas</label>
              <input 
                v-model.number="formPrestamo.numero_cuotas"
                type="number" 
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-center font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
                :placeholder="String(plazoMaximoCuotasCrear)"
                min="1"
                :max="plazoMaximoCuotasCrear"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                @blur="limitarNumeroCuotasCrearPrestamo"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Tasa % (mensual)</label>
              <input 
                v-model.number="formPrestamo.interes"
                type="number" 
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 text-center font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
                :placeholder="String(reglasInteresNatillera.porcentaje)"
                min="0"
                max="100"
                step="0.5"
                @focus="$event.target.select()"
                @click="$event.target.select()"
                required
              />
            </div>
          </div>
          <p
            v-if="Number(formPrestamo.numero_cuotas) > plazoMaximoCuotasCrear"
            class="text-xs text-red-600 font-medium mt-1.5"
          >
            El plazo máximo permitido es {{ plazoMaximoCuotasCrear }} cuotas según la configuración de la natillera. Reduce el número de cuotas.
          </p>

          <!-- Fecha de pago (primera cuota) -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Primera cuota</label>
            <DateInput
              v-model="formPrestamo.fecha_pago"
              placeholder="dd/MM/yyyy"
              input-class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
              :required="true"
            />
            <p class="mt-1 text-xs text-gray-500">Siguientes cuotas {{ formPrestamo.periodicidad === 'quincenal' ? 'cada quincena (si eliges el 15 o fin de mes: el 15 y el último día de cada mes)' : 'cada mes' }}.</p>
          </div>

          <!-- Medio de entrega -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Medio de entrega</label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="formPrestamo.medio_entrega = 'efectivo'"
                :class="['flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all', formPrestamo.medio_entrega === 'efectivo' ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']"
              >Efectivo</button>
              <button
                type="button"
                @click="formPrestamo.medio_entrega = 'transferencia'"
                :class="['flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all', formPrestamo.medio_entrega === 'transferencia' ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300']"
              >Transferencia</button>
            </div>
          </div>

          <!-- Toggle Interés Normal / Anticipado -->
          <div v-if="formPrestamo.monto && formPrestamo.interes && formPrestamo.numero_cuotas">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">Cobro del interés</label>
            <p class="text-xs text-gray-500 mb-1.5">El socio recibe y paga lo mismo. Anticipado: el interés entra a las utilidades al crear el préstamo. Normal: entra con cada cuota pagada.</p>
            <div class="rounded-xl border border-gray-200 bg-white p-1.5 flex gap-1">
              <button type="button" @click="mostrarInteresAnticipado = false" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all', !mostrarInteresAnticipado ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50']">Normal</button>
              <button type="button" @click="mostrarInteresAnticipado = true" :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-all', mostrarInteresAnticipado ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50']">Anticipado</button>
            </div>
          </div>
          </div>

          <!-- Paso 2: Resumen. Antes de crear: botón WhatsApp antes de Generar. Después de crear: comprobante con Descargar y WhatsApp -->
          <div v-show="pasoNuevoPrestamo === 2" class="space-y-3 sm:space-y-4">
            <!-- Vista antes de generar: sin comprobante; confirmar desde el footer -->
            <template v-if="!prestamoRecienCreado">
              <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
                <p class="text-sm font-semibold text-gray-800">Resumen</p>
                <p class="text-lg font-bold text-gray-900 leading-tight">{{ socioSeleccionado?.socio?.nombre || 'Socio' }}</p>
                <dl class="space-y-2 text-sm text-gray-700">
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Valor del préstamo</dt>
                    <dd class="font-semibold text-gray-900 tabular-nums">${{ formatMoney(formPrestamo.monto) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Intereses (total)</dt>
                    <dd class="font-semibold text-amber-800 tabular-nums">${{ formatMoney(Math.round(interesTotal)) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Tasa mensual</dt>
                    <dd class="font-semibold text-gray-900">{{ formPrestamo.interes }}%</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Nº cuotas</dt>
                    <dd class="font-semibold text-gray-900">{{ formPrestamo.numero_cuotas }}</dd>
                  </div>
                  <div class="flex justify-between gap-3 border-t border-emerald-200/80 pt-2 mt-1">
                    <dt class="text-gray-800 font-medium">Total a pagar</dt>
                    <dd class="font-bold text-emerald-700 tabular-nums">${{ formatMoney(Math.round(montoTotal)) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-gray-600">Primera cuota</dt>
                    <dd class="font-medium text-gray-900">{{ formPrestamo.fecha_pago ? formatDate(formPrestamo.fecha_pago) : '—' }}</dd>
                  </div>
                </dl>
                <p class="text-xs text-gray-500">Cuota estimada: ${{ formatMoney(cuotaMensual) }}</p>
              </div>
              <p class="text-xs text-gray-500 text-center">Revisa los datos antes de confirmar.</p>
              <div class="flex items-center gap-2 text-gray-400 text-xs">
                <LockClosedIcon class="w-4 h-4 flex-shrink-0" />
                <span>Transacción segura y encriptada</span>
              </div>
              <!-- Primero: Compartir por WhatsApp (vista previa) -->
              <button
                v-if="socioSeleccionado"
                type="button"
                @click="abrirModalCompartirPrestamoWhatsApp"
                class="btn-compartir w-full"
              >
                <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
                WhatsApp
              </button>
            </template>

            <!-- Vista después de generar: comprobante con opciones Descargar y Enviar por WhatsApp -->
            <template v-else>
              <div v-if="datosComprobanteCreado" ref="resumenPrestamoNuevoRef" class="comprobante-prestamo-nuevo rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm" style="min-width: 280px;">
                <div class="comprobante-content" style="background: #ecfdf5; padding: 14px 12px; color: #1f2937;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 14px; padding-bottom: 4px;">
                    <div style="width: 44px; height: 44px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <h1 style="font-size: 22px; font-weight: 800; margin: 0; color: #374151; letter-spacing: -0.5px;">Comprobante de Préstamo</h1>
                  </div>
                  <div style="background: white; padding: 14px 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                    <p style="color: #6b7280; font-size: 9px; margin: 0 0 4px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">MONTO DEL PRÉSTAMO</p>
                    <p style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.5px; color: #059669; text-align: center;">${{ formatMoney(datosComprobanteCreado.monto) }}</p>
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
                      <div style="min-width: 0; flex: 1;">
                        <p style="color: #9ca3af; font-size: 9px; margin: 0 0 3px 0; font-weight: 700; text-transform: uppercase;">SOCIO</p>
                        <p style="font-weight: 700; font-size: 13px; margin: 0; color: #1f2937;">{{ datosComprobanteCreado.nombreSocio }}</p>
                      </div>
                      <span
                        style="flex-shrink: 0; align-self: flex-start; font-size: 9px; font-weight: 700; padding: 4px 8px; border-radius: 9999px; white-space: nowrap; line-height: 1.25; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;"
                      >Al día</span>
                    </div>
                  </div>
                  <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                    <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 10px 0;">DETALLES DEL PRÉSTAMO</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px;">
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERÉS MENSUAL</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ datosComprobanteCreado.interes }}%</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">N° DE CUOTAS</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ datosComprobanteCreado.numero_cuotas }}</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">VALOR CUOTA</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(datosComprobanteCreado.cuotaMensual) }}</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">TOTAL A PAGAR</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(datosComprobanteCreado.totalAPagar) }}</p></div>
                      <div><p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERESES GENERADOS</p><p style="font-weight: 700; font-size: 12px; margin: 0; color: #ea580c;">${{ formatMoney(datosComprobanteCreado.interesTotal) }}</p></div>
                    </div>
                  </div>
                  <div v-if="datosComprobanteCreado.planPagos?.length > 0" style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                    <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 8px 0;">PLAN DE PAGOS</p>
                    <p style="color: #6b7280; font-size: 9px; margin: 0 0 6px 0;">Fecha de inicio: {{ formatDate(datosComprobanteCreado.fecha_pago) }}</p>
                    <div style="overflow-x: auto;">
                      <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                        <thead>
                          <tr style="background: #f0fdf4; border-bottom: 2px solid #a7f3d0;">
                            <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Nº</th>
                            <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Fecha vencimiento</th>
                            <th style="text-align: right; padding: 6px 8px; font-weight: 700; color: #065f46;">Valor cuota</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(cuota, idx) in datosComprobanteCreado.planPagos" :key="idx" :style="{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }">
                            <td style="padding: 5px 8px; color: #374151; font-weight: 600;">{{ cuota.numero_cuota }}</td>
                            <td style="padding: 5px 8px; color: #374151;">{{ formatDate(cuota.fecha_proyectada) }}</td>
                            <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #059669;">${{ formatMoney(cuota.valor_cuota) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <p class="text-xs text-gray-500 text-center">Préstamo creado. Puedes descargar o compartir el comprobante.</p>
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="descargarResumenPrestamoNuevo"
                  :disabled="generandoResumenPrestamo || !archivoImagenResumenPrestamo"
                  class="btn-descargar flex-1"
                >
                  <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
                  {{ generandoResumenPrestamo ? 'Preparando…' : 'Descargar' }}
                </button>
                <button
                  type="button"
                  @click="abrirModalCompartirPrestamoWhatsApp"
                  class="btn-compartir flex-1"
                >
                  <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
                  WhatsApp
                </button>
              </div>
            </template>
          </div>

          <!-- Acciones por paso (dentro del scroll; pie fijo eliminado) -->
          <div class="mt-6 pt-4 border-t border-gray-100 space-y-3 pb-[calc(max(1rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))]">
            <div v-if="pasoNuevoPrestamo === 0" class="flex gap-2">
              <button type="button" @click="requestCloseTopModal" class="btn-modal-secondary flex-1">Cancelar</button>
              <button type="button" @click="pasoNuevoPrestamo++" :disabled="!formPrestamo.socio_natillera_id || formPrestamo.monto < 10000" class="btn-modal-primary flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente <ChevronRightIcon class="w-4 h-4" /></button>
            </div>
            <div v-else-if="pasoNuevoPrestamo === 1" class="flex gap-2">
              <button type="button" @click="pasoNuevoPrestamo--" class="btn-modal-secondary flex-1 inline-flex items-center justify-center gap-1.5"><ArrowLeftIcon class="w-4 h-4" /> Atrás</button>
              <button type="button" @click="pasoNuevoPrestamo++" :disabled="!formPrestamo.fecha_pago || !formPrestamo.numero_cuotas || formPrestamo.interes == null || formPrestamo.numero_cuotas < 1 || formPrestamo.numero_cuotas > plazoMaximoCuotasCrear" class="btn-modal-primary flex-1 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente <ChevronRightIcon class="w-4 h-4" /></button>
            </div>
            <div v-else-if="!prestamoRecienCreado" class="flex gap-2">
              <button type="button" @click="pasoNuevoPrestamo--" class="btn-modal-secondary flex-1 inline-flex items-center justify-center gap-1.5"><ArrowLeftIcon class="w-4 h-4" /> Atrás</button>
              <button type="button" @click="handleCrearPrestamo" :disabled="loading" class="btn-modal-primary flex-1 disabled:opacity-50">{{ loading ? 'Creando...' : 'Confirmar' }}</button>
            </div>
            <div v-else class="flex gap-2">
              <button type="button" @click="requestCloseTopModal" class="btn-modal-secondary flex-1">Cerrar</button>
            </div>
          </div>
          </form>
        </div>

          <div
            v-show="hayMasContenidoAbajoModalNuevoPrestamo"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <!-- Sombrita / velo inferior: detrás del hint (z-0) -->
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <!-- Pastilla siempre por encima de la sombra -->
            <div
              class="relative z-[2] flex justify-center px-5 pb-[calc(max(0.85rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))] pt-12"
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

    <!-- Modal Abono — patrón ModalWrapper / Crear préstamo (skill modales) -->
    <ModalWrapper
      :show="!!modalAbono"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CurrencyDollarIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Registrar abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Pago al préstamo</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CurrencyDollarIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Registrar abono</h3>
              <p class="text-white/90 text-xs mt-1">Pago al préstamo</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
              aria-label="Cerrar"
              :disabled="loading"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalAbonoScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="actualizarIndicadorScrollModalAbono"
        >
          <form @submit.prevent="handleRegistrarAbono" class="px-4 sm:px-6 pt-4 sm:pt-5 pb-0 space-y-4 sm:space-y-5">
            <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UserIcon class="w-5 h-5 text-white" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-gray-800 truncate">{{ prestamoSeleccionado?.socio_natillera?.socio?.nombre }}</p>
                  <p class="text-xs text-gray-600">Socio</p>
                </div>
              </div>
              <dl class="space-y-2 text-sm text-gray-700 border-t border-emerald-200/70 pt-3">
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-600">Saldo actual</dt>
                  <dd class="font-bold text-emerald-800 tabular-nums">${{ formatMoney(prestamoSeleccionado?.saldo_actual) }}</dd>
                </div>
                <div v-if="moraPrestamoAbono > 0" class="flex justify-between gap-3">
                  <dt class="text-rose-600">Interés de mora</dt>
                  <dd class="font-bold text-rose-700 tabular-nums">${{ formatMoney(moraPrestamoAbono) }}</dd>
                </div>
                <div v-if="moraPrestamoAbono > 0" class="flex justify-between gap-3 border-t border-emerald-200/70 pt-2">
                  <dt class="text-gray-800 font-semibold">Total a pagar</dt>
                  <dd class="font-bold text-gray-900 tabular-nums">${{ formatMoney(totalAPagarConMora) }}</dd>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <div class="rounded-lg border border-white/80 bg-white/70 px-3 py-2">
                    <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">Cuota</p>
                    <p class="text-sm font-bold text-gray-900 tabular-nums">${{ formatMoney(calcularCuotaMensualDetalle(prestamoSeleccionado)) }}</p>
                  </div>
                  <div class="rounded-lg border border-white/80 bg-white/70 px-3 py-2">
                    <p class="text-[10px] font-medium uppercase tracking-wide text-gray-500">Restantes</p>
                    <p class="text-sm font-bold text-gray-900">{{ calcularCuotasRestantes(prestamoSeleccionado) }}</p>
                  </div>
                </div>
              </dl>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Valor del abono *</label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg z-10 pointer-events-none">$</div>
                <input
                  ref="inputValorAbonoRef"
                  :value="valorAbonoFormateado"
                  @input="actualizarValorAbono"
                  @focus="$event.target.select()"
                  type="text"
                  inputmode="numeric"
                  class="w-full pl-9 pr-11 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-lg font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-shadow"
                  placeholder="0"
                  required
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <PencilIcon class="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
              <p class="mt-1.5 text-xs text-gray-500">Puedes modificar el valor a mano.</p>


              <div
                v-if="prestamoSeleccionado?.saldo_actual && formAbono.valor"
                class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3"
              >
                <div v-if="moraPagadaAbono > 0" class="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-emerald-200/70">
                  <span class="text-sm text-rose-600">Se cobra de mora</span>
                  <span class="text-sm font-bold tabular-nums text-rose-700">${{ formatMoney(moraPagadaAbono) }}</span>
                </div>
                <div v-if="moraPagadaAbono > 0" class="flex items-center justify-between gap-2 mb-2">
                  <span class="text-sm text-gray-600">Abono al préstamo</span>
                  <span class="text-sm font-bold tabular-nums text-gray-800">${{ formatMoney(abonoACapitalAbono) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-gray-700">Saldo después del abono</span>
                  <span class="text-base font-bold tabular-nums text-emerald-800">
                    ${{ formatMoney(saldoDespuesAbono) }}
                  </span>
                </div>
                <div v-if="saldoDespuesAbono <= 0" class="mt-2 pt-2 border-t border-emerald-200/80">
                  <p class="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircleIcon class="w-4 h-4 flex-shrink-0" />
                    El préstamo quedará pagado
                  </p>
                </div>
              </div>

              <div v-if="formAbono.valor && formAbono.valor < 1000" class="mt-2 text-xs text-amber-600 font-medium">
                El valor mínimo del abono es $1.000
              </div>
              <div v-if="formAbono.valor && parseFloat(formAbono.valor) > totalAPagarConMora" class="mt-2 text-xs text-red-600 font-medium">
                El abono no puede superar el total a pagar (máx. ${{ formatMoney(totalAPagarConMora) }})
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Forma de pago</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="formAbono.tipo_pago = 'efectivo'"
                  :class="[
                    'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    formAbono.tipo_pago === 'efectivo'
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  ]"
                >Efectivo</button>
                <button
                  type="button"
                  @click="formAbono.tipo_pago = 'transferencia'"
                  :class="[
                    'flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    formAbono.tipo_pago === 'transferencia'
                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  ]"
                >Transferencia</button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">Fecha de pago *</label>
              <DateInput
                v-model="formAbono.fecha_pago"
                placeholder="dd/MM/yyyy"
                input-class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none"
                :required="true"
              />
              <p class="mt-1 text-xs text-gray-500">Fecha en que se hizo el pago.</p>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 space-y-3 pb-[calc(max(1rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))]">
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="requestCloseTopModal"
                  class="btn-modal-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  @click="handleRegistrarAbono"
                  class="btn-modal-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="loading || !formAbono.valor || formAbono.valor < 1000 || parseFloat(formAbono.valor) > totalAPagarConMora || abonoACapitalAbono <= 0"
                >
                  <CurrencyDollarIcon class="w-5 h-5" />
                  {{ loading ? 'Registrando…' : 'Registrar abono' }}
                </button>
              </div>
            </div>
          </form>
        </div>

          <div
            v-show="hayMasContenidoAbajoModalAbono"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[calc(max(0.85rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))] pt-12"
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

    <!-- Modal Comprobante de Abono -->
    <ModalWrapper
      :show="!!(modalComprobanteAbono && comprobanteAbono)"
      :z-index="70"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Comprobante de Abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Abono registrado exitosamente</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Comprobante de Abono</h3>
              <p class="text-white/90 text-xs mt-1">Abono registrado exitosamente</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6" style="background: #eef1f4;">
          <!-- Wrapper de captura: el padding da aire a las muescas laterales para que toPng no recorte los bordes -->
          <div
            ref="comprobanteRef"
            style="max-width: 388px; margin: 0 auto; padding: 14px; background: #eef1f4; border-radius: 28px;"
          >
          <!-- Comprobante estilo ticket -->
          <div
            id="comprobante-abono"
            style="width: 100%; position: relative; background: #ffffff; border-radius: 22px; overflow: hidden; font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 22px 44px -18px rgba(20,71,42,0.45); border: 1px solid rgba(20,71,42,0.10);"
          >
            <!-- Cabecera marca verde + hero del valor -->
            <div style="background: #1B5E37; padding: 14px 20px 16px; color: #ffffff;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div style="min-width: 0;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; letter-spacing: -0.2px; line-height: 1.15;">Comprobante de abono</p>
                  <p style="margin: 2px 0 0; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Abono a préstamo</p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 10px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Valor pagado</p>
                <p style="margin: 4px 0 0; font-size: 32px; font-weight: 800; letter-spacing: -1.4px; line-height: 1;">${{ formatMoney(comprobanteAbono.valor) }}</p>
                <!-- Si la cuota no quedó completa, se dice desde arriba: no es un pago completo -->
                <div
                  v-if="(comprobanteAbono.cuotasPendientes || []).length > 0"
                  style="display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 9999px; padding: 5px 13px;"
                >
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #d97706; display: inline-block;"></span>
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.3px; color: #92400e;">Pago incompleto</span>
                </div>
                <div v-else style="display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 9999px; padding: 5px 13px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; display: inline-block;"></span>
                  <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.3px; color: #d1fae5;">Registrado</span>
                </div>
              </div>
            </div>

            <!-- Perforación (dashed + muescas laterales que simulan el corte del ticket) -->
            <div style="position: relative; background: #ffffff; height: 22px;">
              <div style="position: absolute; left: 18px; right: 18px; top: 50%; border-top: 2px dashed #dfe3e8;"></div>
              <span style="position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
              <span style="position: absolute; right: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
            </div>

            <!-- Cuerpo: detalles -->
            <div style="background: #ffffff; padding: 2px 22px 22px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Socio</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ comprobanteAbono.socioNombre }}</span>
              </div>
              <div style="height: 1px; background: #eef2ee;"></div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Fecha</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">{{ comprobanteAbono.fecha }}</span>
              </div>
              <!-- Pago completo y sin mora: el concepto dice todo, no hace falta desglose -->
              <template v-if="!(comprobanteAbono.moraPagada > 0) && !(comprobanteAbono.cuotasPendientes || []).length">
                <div style="height: 1px; background: #eef2ee;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                  <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Concepto</span>
                  <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">Abono a préstamo</span>
                </div>
              </template>
              <!-- 1. Lo que se pagó: solo si hubo mora o quedó pendiente (si no, basta el concepto de arriba) -->
              <div v-if="comprobanteAbono.moraPagada > 0 || (comprobanteAbono.cuotasPendientes || []).length > 0" style="margin-top: 14px;">
                <p style="margin: 0 0 5px; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #1B5E37;">Lo que se pagó</p>
                <div style="padding: 5px 12px; border-left: 3px solid #81c784; background: #f6fbf7; border-radius: 0 10px 10px 0;">
                  <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.8; color: #334155;">
                    <span>Abono al préstamo</span>
                    <span style="font-weight: 700; white-space: nowrap;">${{ formatMoney(comprobanteAbono.abonoAPrestamo ?? comprobanteAbono.valor) }}</span>
                  </div>
                  <div v-if="comprobanteAbono.moraPagada > 0" style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.8; color: #334155;">
                    <span>Interés de mora</span>
                    <span style="font-weight: 700; white-space: nowrap;">${{ formatMoney(comprobanteAbono.moraPagada) }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.8; color: #1B5E37;">
                    <span style="font-weight: 800;">Total pagado</span>
                    <span style="font-weight: 800; white-space: nowrap;">${{ formatMoney(comprobanteAbono.valor) }}</span>
                  </div>
                </div>
              </div>

              <!--
                2. Lo que queda pendiente de la(s) cuota(s) que tocó el abono. La mora se cobra
                primero, así que pagar justo el valor de la cuota la deja corta en lo que fue a mora.
              -->
              <div v-if="(comprobanteAbono.cuotasPendientes || []).length > 0" style="margin-top: 12px;">
                <p style="margin: 0 0 5px; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #c2410c;">Queda pendiente</p>
                <div style="padding: 5px 12px; border-left: 3px solid #fb923c; background: #fff7ed; border-radius: 0 10px 10px 0;">
                  <div
                    v-for="cp in comprobanteAbono.cuotasPendientes"
                    :key="cp.numero"
                    style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.8; color: #9a3412;"
                  >
                    <span>Cuota #{{ cp.numero }}</span>
                    <span style="font-weight: 700; white-space: nowrap;">${{ formatMoney(cp.pendiente) }}</span>
                  </div>
                  <p style="margin: 2px 0 0; font-size: 11px; line-height: 1.4; color: #9a3412;">
                    El pago no alcanzó para completar {{ comprobanteAbono.cuotasPendientes.length === 1 ? 'la cuota' : 'las cuotas' }}<template v-if="comprobanteAbono.moraPagada > 0">: primero se cobró el interés de mora</template>. Mientras no se pague, sigue en mora.
                  </p>
                </div>
              </div>

              <!-- Saldos -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
                <div style="background: #f6faf6; border: 1px solid #e6efe6; border-radius: 12px; padding: 11px 12px;">
                  <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: #9aa39a;">Saldo anterior</p>
                  <p style="margin: 5px 0 0; font-size: 15px; font-weight: 800; color: #374151; letter-spacing: -0.3px;">${{ formatMoney(comprobanteAbono.saldoAnterior) }}</p>
                </div>
                <div style="background: #e8f5e9; border: 1px solid #bfe3c6; border-radius: 12px; padding: 11px 12px;">
                  <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: #3f8a54;">Saldo nuevo</p>
                  <p style="margin: 5px 0 0; font-size: 15px; font-weight: 800; color: #1B5E37; letter-spacing: -0.3px;">${{ formatMoney(comprobanteAbono.saldoNuevo) }}</p>
                </div>
              </div>

              <!-- Código y marca en una sola línea discreta: es referencia, no lo que se viene a mirar -->
              <p style="margin: 12px 0 0; padding-top: 10px; border-top: 2px dashed #e6efe6; text-align: center; font-size: 10px; font-weight: 600; color: #adb5ad;">
                <template v-if="comprobanteAbono.codigoComprobante">Código <span style="font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 1px; color: #6b7a6b;">{{ comprobanteAbono.codigoComprobante }}</span> · </template>Generado con Natillerapp</p>
            </div>
          </div>
          </div>
        </div>

        <!-- Footer fijo: Descargar y WhatsApp en una fila. Sin botón «Cerrar»: la X de la
             cabecera ya lo hace. WhatsApp solo en celular; en escritorio Descargar ocupa la fila. -->
        <div class="border-t border-gray-200 bg-white px-4 pt-4 pb-[calc(max(1rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex-shrink-0 space-y-3">
          <div class="flex gap-3">
            <button
              type="button"
              @click="descargarComprobanteAbono"
              :disabled="generandoImagenComprobante || !archivoImagenAbono"
              class="btn-descargar flex-1"
            >
              <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
              <span class="truncate">{{ generandoImagenComprobante ? 'Preparando…' : 'Descargar' }}</span>
            </button>

            <button
              type="button"
              @click="compartirWhatsAppAbono"
              :disabled="generandoImagenComprobante || !archivoImagenAbono"
              class="btn-compartir flex sm:hidden flex-1"
            >
              <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
              <span class="truncate">{{ generandoImagenComprobante ? 'Preparando…' : 'WhatsApp' }}</span>
            </button>
          </div>

          <p class="hidden sm:block text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>
        </div>
    </ModalWrapper>

    <!-- Modal Comprobante de Préstamo Pagado -->
    <ModalWrapper
      :show="!!(modalComprobantePagado && comprobantePagado)"
      :z-index="70"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <CheckCircleIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Préstamo pagado</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Comprobante de pago total</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Préstamo pagado</h3>
              <p class="text-white/90 text-xs mt-1">Comprobante de pago total</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Cuerpo con scroll -->
        <div v-if="comprobantePagado" class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-4 sm:p-6" style="background: #eef1f4;">
          <!-- Wrapper de captura: el padding da aire a las muescas laterales para que toPng no recorte los bordes -->
          <div
            ref="comprobantePagadoRef"
            style="max-width: 388px; margin: 0 auto; padding: 14px; background: #eef1f4; border-radius: 28px;"
          >
          <div
            id="comprobante-pagado"
            style="width: 100%; position: relative; background: #ffffff; border-radius: 22px; overflow: hidden; font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 22px 44px -20px rgba(15,23,42,0.35); border: 1px solid rgba(15,23,42,0.08);"
          >
            <!-- Cabecera marca verde + hero del total -->
            <div style="background: #1B5E37; padding: 22px 22px 22px; color: #ffffff;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div style="min-width: 0;">
                  <p style="margin: 0; font-size: 14px; font-weight: 800; letter-spacing: -0.2px; line-height: 1.15;">Comprobante de pago</p>
                  <p style="margin: 2px 0 0; font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Préstamo liquidado</p>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.72);">Total pagado</p>
                <p style="margin: 7px 0 0; font-size: 38px; font-weight: 800; letter-spacing: -1.6px; line-height: 1;">${{ formatMoney(comprobantePagado.totalPagado) }}</p>
                <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 13px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 9999px; padding: 5px 13px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; display: inline-block;"></span>
                  <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #d1fae5;">Préstamo pagado</span>
                </div>
              </div>
            </div>

            <!-- Perforación -->
            <div style="position: relative; background: #ffffff; height: 22px;">
              <div style="position: absolute; left: 18px; right: 18px; top: 50%; border-top: 2px dashed #dfe3e8;"></div>
              <span style="position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
              <span style="position: absolute; right: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
            </div>

            <!-- Detalles + abonos -->
            <div style="background: #ffffff; padding: 4px 22px 22px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Socio</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ comprobantePagado.socioNombre }}</span>
              </div>
              <div style="height: 1px; background: #eef2ee;"></div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0;">
                <span style="font-size: 12px; font-weight: 600; color: #8a938a;">Monto del préstamo</span>
                <span style="font-size: 13px; font-weight: 700; color: #1f2937; text-align: right;">${{ formatMoney(comprobantePagado.montoPrestamo) }}</span>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px; margin-bottom: 10px;">
                <span style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9aa3af;">Abonos realizados</span>
                <span style="display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 7px; border-radius: 9999px; background: #e8f5e9; color: #1B5E37; font-size: 11px; font-weight: 800;">{{ comprobantePagado.numAbonos }}</span>
              </div>
              <div
                v-for="(ab, idx) in comprobantePagado.abonos"
                :key="idx"
                style="display: flex; align-items: center; gap: 11px; padding: 10px 12px; margin-bottom: 8px; background: #f5faf6; border: 1px solid #e2eee4; border-radius: 12px;"
              >
                <div style="width: 32px; height: 32px; border-radius: 10px; background: #e8f5e9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1B5E37" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <div style="min-width: 0; flex: 1;">
                  <p style="margin: 0; font-size: 9px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; color: #9aa3af;">Abono {{ idx + 1 }}</p>
                  <p style="margin: 2px 0 0; font-size: 12px; font-weight: 600; color: #6b7280;">{{ ab.fecha }}</p>
                </div>
                <span style="font-size: 16px; font-weight: 800; color: #1B5E37; letter-spacing: -0.4px; white-space: nowrap;">${{ formatMoney(ab.valor) }}</span>
              </div>

              <p style="margin: 14px 0 0; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.2px; color: #adb5bd;">Generado con Natillerapp</p>
            </div>
          </div>
          </div>
        </div>

        <!-- Footer de acciones fijo -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-4 pb-[calc(max(1rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] space-y-3">
          <!-- WhatsApp comparte la imagen con Web Share: solo en celular; en escritorio Descargar ocupa la fila -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="descargarComprobantePagado"
              :disabled="generandoImagenComprobantePagado || !archivoImagenPagado"
              class="btn-descargar flex-1"
            >
              <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
              {{ generandoImagenComprobantePagado ? 'Preparando…' : 'Descargar' }}
            </button>
            <button
              type="button"
              @click="compartirWhatsAppComprobantePagado"
              :disabled="generandoImagenComprobantePagado || !archivoImagenPagado"
              class="btn-compartir flex sm:hidden flex-1"
            >
              <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
              {{ generandoImagenComprobantePagado ? 'Preparando…' : 'WhatsApp' }}
            </button>
          </div>

          <p class="hidden sm:block text-xs text-gray-400 text-center">
            💡 En celular podrás enviar la imagen directamente a WhatsApp
          </p>
        </div>
    </ModalWrapper>

    <!-- Modal Editar Abono -->
    <ModalWrapper
      :show="!!(modalEditarAbono && abonoAEditar)"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <PencilIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Editar Abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Modifica el valor del abono registrado</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <PencilIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Editar Abono</h3>
              <p class="text-white/90 text-xs mt-1">Modifica el valor del abono registrado</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <form @submit.prevent="guardarAbonoEditado" class="p-5 sm:p-6 space-y-6">
            <!-- Información del abono actual -->
            <div class="relative bg-white border-2 border-blue-200 rounded-2xl p-5 shadow-lg overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                    <CurrencyDollarIcon class="w-5 h-5 text-white" />
                  </div>
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Abono Actual</p>
                </div>
                <p class="text-3xl font-bold text-blue-700 mb-1">${{ formatMoney(abonoAEditar?.valorOriginal || abonoAEditar?.valor) }}</p>
                <p class="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(abonoAEditar?.fecha) }}
                </p>
              </div>
            </div>

            <!-- Campo de nuevo valor -->
            <div class="space-y-3">
              <label class="label mb-3 flex items-center gap-2 text-base">
                <div class="w-8 h-8 bg-gradient-to-br from-natillera-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon class="w-4 h-4 text-white" />
                </div>
                <span class="font-bold">Nuevo valor del abono *</span>
              </label>
              <div class="relative">
                <div class="absolute left-5 top-1/2 -translate-y-1/2 text-natillera-600 font-bold text-2xl z-10">
                  $
                </div>
                <input 
                  :value="valorAbonoEditadoFormateado"
                  @input="actualizarValorAbonoEditado"
                  @focus="$event.target.select()"
                  type="text" 
                  inputmode="numeric"
                  class="w-full pl-14 pr-5 py-4 text-2xl font-bold text-natillera-700 bg-white border-2 border-natillera-200 rounded-xl focus:ring-2 focus:ring-natillera-500 focus:border-natillera-500 transition-all shadow-sm hover:shadow-md"
                  placeholder="0"
                  required
                />
              </div>
              
              <!-- Información del cambio -->
              <div 
                v-if="abonoAEditar?.valor && abonoAEditar.valor !== parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)" 
                class="mt-4 p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-xl shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Diferencia:
                  </span>
                  <span :class="[
                    'text-xl font-bold',
                    (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 ? 'text-green-700' : 'text-red-700'
                  ]">
                    {{ (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 ? '+' : '' }}${{ formatMoney(Math.abs(abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor))) }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm text-amber-800 bg-white/60 rounded-lg px-3 py-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {{ (abonoAEditar.valor - parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)) > 0 
                      ? 'El saldo del préstamo disminuirá en esta cantidad' 
                      : 'El saldo del préstamo aumentará en esta cantidad' }}
                  </span>
                </div>
              </div>
              
              <!-- Validaciones -->
              <div v-if="abonoAEditar?.valor && abonoAEditar.valor < 1000" class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-medium">El valor mínimo del abono es $1.000</span>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-white px-5 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex-shrink-0">
          <div class="flex gap-3">
            <button
              type="button"
              @click="requestCloseTopModal"
              class="btn-modal-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="guardarAbonoEditado"
              class="btn-modal-primary flex-1"
              :disabled="loading || !abonoAEditar?.valor || abonoAEditar.valor < 1000 || abonoAEditar.valor === parseFloat(abonoAEditar.valorOriginal || abonoAEditar.valor)"
            >
              <PencilIcon class="w-5 h-5" />
              <span>{{ loading ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Refinanciar Préstamo -->
    <ModalWrapper
      :show="!!modalRefinanciar"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <ArrowPathIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Refinanciar Préstamo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Actualiza fecha de pago y recalcula intereses</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <ArrowPathIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Refinanciar Préstamo</h3>
              <p class="text-white/90 text-xs mt-1">Actualiza la fecha de pago y recalcula los intereses</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Contenido con scroll -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <!-- Pestañas -->
          <div class="border-b border-gray-200 bg-gray-50">
            <div class="flex">
              <button
                type="button"
                @click="formRefinanciar.tabActual = 'refinanciar'"
                :class="[
                  'flex-1 px-4 py-3 text-sm font-semibold transition-all',
                  formRefinanciar.tabActual === 'refinanciar'
                    ? 'border-b-2 border-purple-500 text-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                ]"
              >
                Refinanciar
              </button>
            </div>
          </div>

          <!-- Contenido de la pestaña Refinanciar -->
          <div v-if="formRefinanciar.tabActual === 'refinanciar'">
          <form @submit.prevent="handleRefinanciar" class="p-4 sm:p-6 space-y-6">
            <!-- Información del préstamo actual -->
            <div v-if="prestamoSeleccionado" class="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BanknotesIcon class="w-5 h-5 text-purple-600" />
                Información del Préstamo
              </h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-gray-600 mb-1">Saldo Actual</p>
                  <p class="font-bold text-gray-800">${{ formatMoney(prestamoSeleccionado.saldo_actual) }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Interés</p>
                  <p class="font-bold text-gray-800">{{ prestamoSeleccionado.interes }}%</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Tipo de Interés</p>
                  <p class="font-bold text-gray-800 capitalize">{{ prestamoSeleccionado.tipo_interes || 'simple' }}</p>
                </div>
                <div>
                  <p class="text-gray-600 mb-1">Periodicidad</p>
                  <p class="font-bold text-gray-800 capitalize">{{ prestamoSeleccionado.periodicidad || 'mensual' }}</p>
                </div>
              </div>
            </div>

            <!-- Campo de nueva fecha de pago -->
            <div>
              <label class="label mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Nueva fecha de pago *</span>
              </label>
              <DateInput
                v-model="formRefinanciar.fecha_pago"
                placeholder="dd/MM/yyyy"
                input-class="text-base font-semibold"
                :required="true"
              />
              <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Esta será la nueva fecha de inicio para recalcular el plan de pagos e intereses
              </p>
            </div>

            <!-- Número de cuotas para el refinanciamiento -->
            <div>
              <label class="label mb-2">Número de cuotas *</label>
              <input 
                v-model.number="formRefinanciar.numero_cuotas_nuevo"
                type="number" 
                min="1"
                max="60"
                class="input-field text-center text-lg font-semibold"
                placeholder="1"
                required
              />
              <p class="mt-2 text-xs text-gray-500">
                Número de cuotas del nuevo plan. El interés nuevo se calcula solo sobre el capital pendiente.
              </p>
            </div>

            <!-- Tipo de interés -->
            <div>
              <label class="label mb-2">Tipo de interés *</label>
              <div class="grid grid-cols-2 gap-3">
                <label 
                  :class="[
                    'relative flex flex-row items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    formRefinanciar.tipo_interes_nuevo === 'simple'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                  ]"
                >
                  <input 
                    type="radio" 
                    v-model="formRefinanciar.tipo_interes_nuevo" 
                    value="simple"
                    class="sr-only"
                  />
                  <div 
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      formRefinanciar.tipo_interes_nuevo === 'simple'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 border-2 border-gray-200'
                    ]"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="font-bold text-xs block">Simple</span>
                    <span class="text-[0.6875rem] text-gray-500 block leading-tight">Fijo sobre el capital</span>
                  </div>
                  <div 
                    v-if="formRefinanciar.tipo_interes_nuevo === 'simple'"
                    class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </label>

                <label 
                  :class="[
                    'relative flex flex-row items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    formRefinanciar.tipo_interes_nuevo === 'compuesto'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/20'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                  ]"
                >
                  <input 
                    type="radio" 
                    v-model="formRefinanciar.tipo_interes_nuevo" 
                    value="compuesto"
                    class="sr-only"
                  />
                  <div 
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      formRefinanciar.tipo_interes_nuevo === 'compuesto'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                        : 'bg-gray-100 border-2 border-gray-200'
                    ]"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="font-bold text-xs block">Compuesto</span>
                    <span class="text-[0.6875rem] text-gray-500 block leading-tight">Cuota fija, sobre saldo</span>
                  </div>
                  <div 
                    v-if="formRefinanciar.tipo_interes_nuevo === 'compuesto'"
                    class="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="button"
              class="-mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-[#1B5E37] underline-offset-2 hover:underline touch-manipulation"
              @click="abrirAyudaInteres('refinanciar')"
            >
              <QuestionMarkCircleIcon class="h-5 w-5 flex-shrink-0" />
              ¿Cómo se calcula el interés?
            </button>

            <!-- Tasa de interés (opcional) -->
            <div>
              <label class="label mb-2">Tasa de interés mensual (%)</label>
              <input 
                v-model.number="formRefinanciar.interes_nuevo"
                type="number" 
                step="0.1"
                min="0"
                max="100"
                class="input-field text-center text-lg font-semibold"
                :placeholder="`Dejar vacío para usar ${prestamoSeleccionado?.interes || 0}%`"
              />
              <p class="mt-2 text-xs text-gray-500">
                Si se deja vacío, se usará la tasa de interés original ({{ prestamoSeleccionado?.interes || 0 }}%)
              </p>
            </div>

            <!-- Vista previa: qué se refinancia (capital, interés vencido, interés futuro, mora) -->
            <div v-if="vistaPreviaRefinanciacion" class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Previa del Refinanciamiento
              </h4>
              <dl class="space-y-2 text-sm tabular-nums">
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-600">Saldo actual</dt>
                  <dd class="font-semibold text-gray-800">${{ formatMoney(vistaPreviaRefinanciacion.saldoActual) }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-600">Capital pendiente</dt>
                  <dd class="font-bold text-gray-800">${{ formatMoney(vistaPreviaRefinanciacion.capitalPendiente) }}</dd>
                </div>
                <div v-if="vistaPreviaRefinanciacion.interesVencido > 0" class="flex justify-between gap-3">
                  <dt class="text-gray-600">Interés vencido sin pagar <span class="block text-xs text-gray-500">Se cobra en las cuotas, sin intereses</span></dt>
                  <dd class="font-semibold text-gray-800">${{ formatMoney(vistaPreviaRefinanciacion.interesVencido) }}</dd>
                </div>
                <div v-if="vistaPreviaRefinanciacion.interesFuturo > 0" class="flex justify-between gap-3">
                  <dt class="text-gray-600">Interés futuro que se elimina</dt>
                  <dd class="font-semibold text-gray-500">− ${{ formatMoney(vistaPreviaRefinanciacion.interesFuturo) }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-gray-600">Interés nuevo <span class="block text-xs text-gray-500">{{ vistaPreviaRefinanciacion.tasaInteres }}% · {{ vistaPreviaRefinanciacion.totalCuotas }} cuotas · {{ vistaPreviaRefinanciacion.tipoInteres === 'compuesto' ? 'compuesto' : 'simple' }}</span></dt>
                  <dd class="font-bold text-orange-600">${{ formatMoney(vistaPreviaRefinanciacion.interesNuevo) }}</dd>
                </div>
                <div class="flex justify-between gap-3 border-t border-green-200 pt-2">
                  <dt class="font-semibold text-gray-800">Total a pagar</dt>
                  <dd class="font-bold text-green-600">${{ formatMoney(vistaPreviaRefinanciacion.totalAPagar) }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="font-semibold text-gray-800">Valor de cuota</dt>
                  <dd class="font-bold text-lg text-green-700">${{ formatMoney(vistaPreviaRefinanciacion.valorCuota) }}</dd>
                </div>
              </dl>
              <p v-if="vistaPreviaRefinanciacion.moraPendiente > 0" class="mt-3 rounded-lg bg-amber-100/70 px-3 py-2 text-xs text-amber-800">
                Mora pendiente: <strong>${{ formatMoney(vistaPreviaRefinanciacion.moraPendiente) }}</strong>. No se suma al préstamo refinanciado; si la vas a cobrar, registra el abono antes de refinanciar.
              </p>
            </div>

            <!-- Advertencia -->
            <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1">
                  <p class="font-semibold text-amber-800 mb-1">Advertencia</p>
                  <p class="text-sm text-amber-700">
                    Al refinanciar se reemplaza el plan de pagos. El nuevo plan parte del capital pendiente, el interés vencido se cobra en las nuevas cuotas sin intereses adicionales y el interés futuro del plan anterior se cambia por el de las nuevas condiciones.
                  </p>
                </div>
              </div>
            </div>
          </form>
          </div>
        </div>

        <!-- Footer fijo -->
        <div class="border-t border-gray-200 bg-white px-4 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex-shrink-0">
          <div class="flex gap-3">
            <button
              type="button"
              @click="requestCloseTopModal"
              class="btn-modal-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="handleRefinanciar"
              class="btn-modal-primary flex-1"
              :disabled="loading || !formRefinanciar.fecha_pago || !formRefinanciar.numero_cuotas_nuevo || formRefinanciar.numero_cuotas_nuevo <= 0 || !vistaPreviaRefinanciacion"
            >
              <ArrowPathIcon class="w-5 h-5" />
              <span>{{ loading ? 'Refinanciando...' : 'Refinanciar' }}</span>
            </button>
          </div>
        </div>
    </ModalWrapper>

    <!-- Modal Detalle Préstamo — patrón ModalWrapper / skill modales -->
    <ModalWrapper
      :show="!!modalDetalle"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-3xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="48rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <BanknotesIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Detalle del préstamo</h3>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <BanknotesIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Detalle del préstamo</h3>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalDetalleScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#f6f8f6] overscroll-contain [-webkit-overflow-scrolling:touch]"
          @scroll.passive="actualizarIndicadorScrollModalDetalle"
        >
          <!--
            Detalle en tres niveles, de lo que se viene a mirar a lo de referencia:
              1. Quién y en qué estado (una sola etiqueta).
              2. Las tres cifras: prestado, pagado y saldo, con el avance.
              3. Pestañas: plan de pagos, abonos y condiciones. Antes todo iba en una sola
                 columna larga y el total pagado o el conteo de cuotas salían dos o tres veces.
          -->
          <div v-if="prestamoDetalle" class="space-y-4 px-4 pb-6 pt-4 sm:px-6 sm:pt-5">
            <!-- 1. Socio y estado -->
            <section class="flex items-center gap-3">
              <img
                :src="getAvatarUrl(
                  prestamoDetalle.socio_natillera?.socio?.nombre || prestamoDetalle.socio_natillera?.id,
                  prestamoDetalle.socio_natillera?.socio?.avatar_seed,
                  prestamoDetalle.socio_natillera?.socio?.avatar_style
                )"
                :alt="prestamoDetalle.socio_natillera?.socio?.nombre || 'Socio'"
                class="h-12 w-12 flex-shrink-0 rounded-full border border-gray-200 bg-[#E8F5E9] object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-base font-extrabold leading-tight text-gray-900 sm:text-lg">
                  {{ prestamoDetalle.socio_natillera?.socio?.nombre || '—' }}
                </p>
                <span :class="['ds-badge mt-1 max-w-full whitespace-normal text-left leading-snug', estadoResumenDetalle.clase]">
                  <ExclamationTriangleIcon v-if="estadoResumenDetalle.alerta" class="h-3.5 w-3.5" />
                  {{ estadoResumenDetalle.texto }}
                </span>
              </div>
              <button
                type="button"
                class="btn-compartir btn-compartir--sm flex-shrink-0"
                aria-label="Enviar información del préstamo por WhatsApp"
                @click.stop="abrirModalCompartirPrestamo"
              >
                <IconoWhatsApp class="w-4 h-4 flex-shrink-0" />
                <span class="hidden sm:inline">WhatsApp</span>
              </button>
            </section>

            <!-- 2. Las tres cifras del préstamo -->
            <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <dl class="grid grid-cols-3 divide-x divide-gray-100">
                <!-- En 360 px caben tres cifras de 7 dígitos: letra 15 px y relleno corto -->
                <div class="min-w-0 px-1.5 py-3 text-center sm:px-3">
                  <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-[11px]">Prestado</dt>
                  <dd class="mt-0.5 font-display text-[15px] font-extrabold tabular-nums text-gray-900 sm:text-lg">${{ formatMoney(prestamoDetalle.monto) }}</dd>
                  <dd class="text-[10px] leading-tight tabular-nums text-gray-500 sm:text-[11px]">+ interés ${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</dd>
                </div>
                <div class="min-w-0 px-1.5 py-3 text-center sm:px-3">
                  <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-[11px]">Pagado</dt>
                  <dd class="mt-0.5 font-display text-[15px] font-extrabold tabular-nums text-[#1B5E37] sm:text-lg">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</dd>
                  <dd class="text-[10px] leading-tight tabular-nums text-gray-500 sm:text-[11px]">{{ pagosCicloActual.length }} {{ pagosCicloActual.length === 1 ? 'abono' : 'abonos' }}</dd>
                </div>
                <div class="min-w-0 px-1.5 py-3 text-center sm:px-3">
                  <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-[11px]">Saldo</dt>
                  <dd
                    class="mt-0.5 font-display text-[15px] font-extrabold tabular-nums sm:text-lg"
                    :class="prestamoDetalle.estado === 'pagado' ? 'text-gray-400' : (estadoResumenDetalle.alerta ? 'text-[color:var(--brand-danger)]' : 'text-gray-900')"
                  >${{ formatMoney(prestamoDetalle.estado === 'pagado' ? 0 : saldoConMora(prestamoDetalle)) }}</dd>
                  <dd v-if="prestamoDetalle.estado !== 'pagado' && prestamoDetalle.moraAcumulada > 0" class="text-[10px] leading-tight tabular-nums text-[color:var(--brand-danger)] sm:text-[11px]">
                    incluye mora ${{ formatMoney(prestamoDetalle.moraAcumulada) }}
                  </dd>
                  <dd v-else class="text-[10px] leading-tight text-gray-500 sm:text-[11px]">{{ prestamoDetalle.estado === 'pagado' ? 'Pagado' : 'por pagar' }}</dd>
                </div>
              </dl>
              <div class="border-t border-gray-100 px-4 py-3">
                <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div class="h-full rounded-full bg-[#1B5E37]" :style="{ width: porcentajePagadoPrestamo(prestamoDetalle) + '%' }" />
                </div>
                <p class="mt-1.5 flex justify-between gap-2 text-xs tabular-nums text-gray-600">
                  <span>{{ porcentajePagadoPrestamo(prestamoDetalle) }}% pagado</span>
                  <span v-if="planPagosPrestamo.length > 0">{{ cuotasPagadasDetalle }} de {{ planPagosPrestamo.length }} cuotas</span>
                </p>
              </div>

              <!-- En mora: lo que hay que pagar hoy para ponerse al día -->
              <div v-if="prestamoDetalle.estado !== 'pagado' && (prestamoDetalle.moraAcumulada > 0 || cuotasVencidasDetalle > 0)" class="border-t border-red-100 bg-red-50 px-4 py-3 tabular-nums">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm font-bold text-red-900">Para ponerse al día</span>
                  <span class="font-display text-lg font-extrabold text-[color:var(--brand-danger)]">
                    ${{ formatMoney((prestamoDetalle.valorCuotasEnDeuda || 0) + (prestamoDetalle.moraAcumulada || 0)) }}
                  </span>
                </div>
                <p class="text-xs text-red-800">
                  Cuotas vencidas ${{ formatMoney(prestamoDetalle.valorCuotasEnDeuda || 0) }} + mora ${{ formatMoney(prestamoDetalle.moraAcumulada || 0) }}
                </p>
              </div>
              <!-- Al día: cuándo toca la próxima -->
              <div v-else-if="prestamoDetalle.estado !== 'pagado' && proximaCuotaPago" class="flex items-center justify-between gap-3 border-t border-gray-100 bg-[#f6fbf7] px-4 py-3">
                <span class="min-w-0">
                  <span class="block text-xs text-gray-500">Próxima cuota · #{{ proximaCuotaPago.numero_cuota }}</span>
                  <span class="block text-sm font-bold text-gray-900">{{ formatDate(proximaCuotaPago.fecha_proyectada) }}</span>
                </span>
                <span class="font-display text-base font-extrabold tabular-nums text-[#1B5E37]">
                  ${{ formatMoney(Math.max(0, (parseFloat(proximaCuotaPago.valor_cuota) || 0) - (parseFloat(proximaCuotaPago.valor_pagado) || 0))) }}
                </span>
              </div>
            </section>

            <!-- 3. Lo demás, en pestañas -->
            <SwitchSegmentado v-model="pestanaDetalle" :opciones="opcionesPestanaDetalle" aria-label="Información del préstamo" />

            <!-- Plan de pagos: completo, con lo que falta de cada cuota -->
            <section
              v-if="pestanaDetalle === 'plan'"
              ref="modalDetallePlanPagosSectionRef"
              class="scroll-mt-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm"
              tabindex="-1"
            >
              <p v-if="planPagosPrestamo.length === 0" class="px-4 py-5 text-sm text-gray-500">Este préstamo no tiene plan de pagos.</p>
              <ul v-else class="divide-y divide-gray-100">
                <li
                  v-for="cuota in planPagosPrestamo"
                  :key="cuota.id"
                  class="flex items-center gap-3 px-4 py-3"
                  :class="proximaCuotaPago && cuota.id === proximaCuotaPago.id ? 'bg-[#f6fbf7]' : ''"
                >
                  <span
                    :class="[
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold',
                      estadoCuotaDetalle(cuota).circulo
                    ]"
                  >{{ cuota.numero_cuota }}</span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-semibold text-gray-900">
                      {{ formatDate(cuota.fecha_proyectada) }}
                      <span v-if="proximaCuotaPago && cuota.id === proximaCuotaPago.id" class="ml-1 text-[11px] font-bold text-[#1B5E37]">· próxima</span>
                    </span>
                    <span class="block text-xs tabular-nums text-gray-500">
                      Capital ${{ formatMoney(cuota.capital) }} · Interés ${{ formatMoney(cuota.interes) }}
                    </span>
                    <span
                      v-if="!cuota.pagada && (parseFloat(cuota.valor_pagado) || 0) > 0"
                      class="mt-0.5 block text-xs font-semibold tabular-nums text-amber-800"
                    >
                      Pagó ${{ formatMoney(cuota.valor_pagado) }} · faltan ${{ formatMoney((parseFloat(cuota.valor_cuota) || 0) - (parseFloat(cuota.valor_pagado) || 0)) }}
                    </span>
                    <span v-if="!cuota.pagada && moraCuotaComprobante(cuota) > 0" class="mt-0.5 block text-xs font-semibold tabular-nums text-rose-700">
                      Mora a hoy ${{ formatMoney(moraCuotaComprobante(cuota)) }}
                    </span>
                  </span>
                  <span class="flex flex-shrink-0 flex-col items-end gap-1">
                    <span class="font-display text-sm font-extrabold tabular-nums text-gray-900">${{ formatMoney(cuota.valor_cuota) }}</span>
                    <span :class="['ds-badge', estadoCuotaDetalle(cuota).clase]">{{ estadoCuotaDetalle(cuota).texto }}</span>
                  </span>
                </li>
              </ul>
            </section>

            <!-- Abonos -->
            <section v-if="pestanaDetalle === 'abonos'" class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <p v-if="pagosCicloActual.length === 0" class="px-4 py-5 text-sm text-gray-500">Todavía no hay abonos registrados.</p>
              <ul v-else class="divide-y divide-gray-100">
                <!--
                  Móvil primero: valor y fecha arriba, periodo en una etiqueta, forma de pago y
                  origen como texto (antes eran tres etiquetas que se amontonaban), y las acciones
                  como botones con nombre en su propia fila (antes, tres íconos grises sueltos).
                -->
                <li v-for="pago in pagosCicloActual" :key="pago.id" class="px-4 py-3">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <!-- Lo que pagó el socio. Si incluyó mora, se separa: esa parte fue a utilidades y no bajó el saldo. -->
                      <p class="font-display text-lg font-extrabold leading-tight tabular-nums text-gray-900">${{ formatMoney((parseFloat(pago.valor) || 0) + (parseFloat(pago.mora_cobrada) || 0)) }}</p>
                      <p v-if="(parseFloat(pago.mora_cobrada) || 0) > 0" class="text-xs tabular-nums text-gray-600">
                        ${{ formatMoney(pago.valor) }} al préstamo · <span class="font-semibold text-rose-700">${{ formatMoney(pago.mora_cobrada) }} mora</span>
                      </p>
                    </div>
                    <span class="flex-shrink-0 pt-1 text-xs font-semibold text-gray-500">{{ formatDate(pago.fecha) }}</span>
                  </div>

                  <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <template v-if="Array.isArray(pago.numeros_cuota) && pago.numeros_cuota.length > 0">
                      <span
                        v-for="(periodo, idx) in periodosDeNumerosCuota(pago.numeros_cuota)"
                        :key="`${pago.id}-periodo-${idx}`"
                        class="inline-flex items-center whitespace-nowrap rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[11px] font-bold text-[#1B5E37]"
                        :title="`Cuota correspondiente al período ${periodo}`"
                      >{{ periodo }}</span>
                    </template>
                    <span class="text-[11px] text-gray-500">
                      <template v-if="formaPagoAbono(pago)">{{ FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].label }} · </template>{{ pago.origen === 'cuota_natillera' ? 'desde Cuotas' : 'desde Préstamos' }}
                    </span>
                  </div>

                  <div v-if="pago.codigo_comprobante || !soloLectura" class="mt-2.5 grid grid-cols-3 gap-2">
                    <button
                      v-if="pago.codigo_comprobante"
                      type="button"
                      class="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-1.5 rounded-full border border-[#1B5E37]/30 bg-white px-2 text-xs font-bold text-[#1B5E37] hover:bg-[#E8F5E9] active:bg-[#E8F5E9]"
                      aria-label="Reenviar comprobante"
                      @click.stop="reenviarComprobanteAbono(pago)"
                    >
                      <PaperAirplaneIcon class="h-4 w-4 flex-shrink-0" />
                      Reenviar
                    </button>
                    <button
                      v-if="!soloLectura"
                      type="button"
                      class="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white px-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                      aria-label="Editar abono"
                      @click.stop="abrirModalEditarAbono(pago)"
                    >
                      <PencilIcon class="h-4 w-4 flex-shrink-0" />
                      Editar
                    </button>
                    <button
                      v-if="!soloLectura"
                      type="button"
                      class="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-1.5 rounded-full border border-red-200 bg-white px-2 text-xs font-bold text-red-700 hover:bg-red-50 active:bg-red-50"
                      aria-label="Eliminar abono"
                      @click.stop="confirmarEliminarAbono(pago)"
                    >
                      <TrashIcon class="h-4 w-4 flex-shrink-0" />
                      Eliminar
                    </button>
                  </div>
                </li>
              </ul>
            </section>

            <!-- Condiciones del crédito y refinanciaciones: referencia -->
            <template v-if="pestanaDetalle === 'condiciones'">
              <section class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
                <dl class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Monto prestado</dt>
                    <dd class="font-bold tabular-nums text-gray-900">${{ formatMoney(prestamoDetalle.monto) }}</dd>
                  </div>
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Interés mensual</dt>
                    <dd class="font-bold tabular-nums text-gray-900">{{ prestamoDetalle.interes }}%</dd>
                  </div>
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Tipo de interés</dt>
                    <dd class="font-bold text-gray-900">{{ prestamoDetalle.tipo_interes === 'compuesto' ? 'Compuesto' : 'Simple' }}</dd>
                  </div>
                  <!-- Anticipado: el interés se descontó al entregar el préstamo; si no, va dentro de cada cuota -->
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Cobro del interés</dt>
                    <dd class="font-bold" :class="interesAnticipadoDetalle ? 'text-[color:var(--brand-warning)]' : 'text-gray-900'">
                      {{ interesAnticipadoDetalle ? 'Anticipado' : 'Con cada cuota' }}
                    </dd>
                    <dd class="text-[11px] leading-tight text-gray-500">
                      {{ interesAnticipadoDetalle ? 'Se descontó al entregar el préstamo' : 'Normal: va dentro de cada cuota' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Interés generado</dt>
                    <dd class="font-bold tabular-nums text-[color:var(--brand-warning)]">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</dd>
                  </div>
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Total a pagar</dt>
                    <dd class="font-bold tabular-nums text-gray-900">${{ formatMoney((prestamoDetalle.monto || 0) + (calcularInteresGeneradoDetalle(prestamoDetalle) || 0)) }}</dd>
                  </div>
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Cuotas</dt>
                    <dd class="font-bold tabular-nums text-gray-900">
                      {{ prestamoDetalle.numero_cuotas || 1 }} × ${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}
                      <span v-if="prestamoDetalle.periodicidad" class="font-normal text-gray-500">· {{ prestamoDetalle.periodicidad }}</span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Creado el</dt>
                    <dd class="font-semibold text-gray-700">{{ formatDate(prestamoDetalle.created_at) }}</dd>
                  </div>
                  <div v-if="prestamoDetalle.medio_entrega">
                    <dt class="text-[11px] uppercase tracking-wide text-gray-500">Entregado en</dt>
                    <dd class="font-semibold text-gray-700">{{ prestamoDetalle.medio_entrega === 'efectivo' ? 'Efectivo' : 'Transferencia' }}</dd>
                  </div>
                </dl>
              </section>

            <!-- Historial de refinanciaciones -->
            <section
              v-if="historialRefinanciaciones.length > 0"
              ref="modalDetalleRefinanciacionSectionRef"
              class="scroll-mt-4 space-y-3"
              tabindex="-1"
            >
              <h4 class="px-1 font-display text-sm font-extrabold text-gray-900">
                Refinanciaciones <span class="font-normal text-gray-500">· {{ historialRefinanciaciones.length }}</span>
              </h4>
              <div
                v-for="(historial, index) in historialRefinanciaciones"
                :key="historial.id"
                class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm"
              >
                <div class="mb-3 flex items-center gap-3">
                  <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E37]">
                    <ArrowPathIcon class="h-4 w-4" />
                  </span>
                  <span class="min-w-0">
                    <span class="block text-sm font-bold text-gray-900">Refinanciación #{{ historialRefinanciaciones.length - index }}</span>
                    <span class="block text-xs text-gray-500">{{ formatDate(historial.fecha_refinanciacion) }}</span>
                  </span>
                </div>

                <p class="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">Valores anteriores</p>
                <dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 text-sm tabular-nums">
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Monto</dt><dd class="font-bold text-gray-900">${{ formatMoney(historial.monto_anterior) }}</dd></div>
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Interés</dt><dd class="font-bold text-gray-900">{{ historial.interes_anterior }}% · {{ historial.tipo_interes_anterior || '—' }}</dd></div>
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Interés generado</dt><dd class="font-bold text-[color:var(--brand-warning)]">${{ formatMoney(historial.interes_generado_anterior || 0) }}</dd></div>
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Cuotas</dt><dd class="font-bold text-gray-900">{{ historial.numero_cuotas_anterior || '—' }}</dd></div>
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Total a pagar</dt><dd class="font-bold text-gray-900">${{ formatMoney((historial.monto_anterior || 0) + (historial.interes_generado_anterior || 0)) }}</dd></div>
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Total pagado</dt><dd class="font-bold text-[#1B5E37]">${{ formatMoney(historial.total_pagado_anterior || 0) }}</dd></div>
                  <div class="flex justify-between gap-3 px-3 py-2"><dt class="text-gray-600">Saldo pendiente</dt><dd class="font-bold text-red-700">${{ formatMoney(historial.saldo_actual_anterior) }}</dd></div>
                  <div v-if="historial.periodicidad_anterior || historial.periodicidad_nueva" class="flex justify-between gap-3 px-3 py-2">
                    <dt class="text-gray-600">Periodicidad</dt>
                    <dd class="font-semibold capitalize text-gray-900">{{ historial.periodicidad_anterior || '—' }} → {{ historial.periodicidad_nueva || '—' }}</dd>
                  </div>
                  <div v-if="historial.fecha_inicio_anterior || historial.fecha_inicio_nueva" class="flex justify-between gap-3 px-3 py-2">
                    <dt class="text-gray-600">Fecha de inicio</dt>
                    <dd class="font-semibold text-gray-900">
                      {{ historial.fecha_inicio_anterior ? formatDate(historial.fecha_inicio_anterior) : '—' }} → {{ formatDate(historial.fecha_inicio_nueva) }}
                    </dd>
                  </div>
                </dl>

                <div v-if="Array.isArray(historial.plan_pagos_anterior) && historial.plan_pagos_anterior.length > 0" class="mt-2">
                  <button
                    type="button"
                    class="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 text-sm font-bold text-[#1B5E37]"
                    :aria-expanded="historialPlanExpandido.has(historial.id)"
                    @click="toggleHistorialPlan(historial.id)"
                  >
                    Plan de pagos anterior ({{ historial.plan_pagos_anterior.length }})
                    <ChevronDownIcon :class="['h-4 w-4 transition-transform', historialPlanExpandido.has(historial.id) ? 'rotate-180' : '']" />
                  </button>
                  <ul v-if="historialPlanExpandido.has(historial.id)" class="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    <li
                      v-for="(cuota, cidx) in historial.plan_pagos_anterior"
                      :key="`plan-ant-${historial.id}-${cidx}`"
                      class="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <span class="min-w-0">
                        <span class="block text-xs font-semibold text-gray-800">Cuota {{ cuota.numero_cuota }}</span>
                        <span v-if="cuota.fecha_proyectada" class="block text-[11px] text-gray-500">{{ formatDate(cuota.fecha_proyectada) }}</span>
                      </span>
                      <span class="flex flex-shrink-0 items-center gap-2">
                        <span class="text-xs font-bold tabular-nums text-gray-800">${{ formatMoney(cuota.valor_cuota) }}</span>
                        <span :class="['ds-badge', cuota.pagada ? 'ds-badge--success' : ((cuota.valor_pagado || 0) > 0 ? 'ds-badge--warning' : 'ds-badge--muted')]">
                          {{ cuota.pagada ? 'Pagada' : ((cuota.valor_pagado || 0) > 0 ? 'Parcial' : 'Pendiente') }}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>

                <div v-if="abonosDeRefinanciacion(historial.id).length > 0" class="mt-1">
                  <button
                    type="button"
                    class="flex min-h-[44px] w-full touch-manipulation items-center justify-between gap-2 text-sm font-bold text-[#1B5E37]"
                    :aria-expanded="historialAbonosExpandido.has(historial.id)"
                    @click="toggleHistorialAbonos(historial.id)"
                  >
                    Abonos de ese ciclo ({{ abonosDeRefinanciacion(historial.id).length }})
                    <ChevronDownIcon :class="['h-4 w-4 transition-transform', historialAbonosExpandido.has(historial.id) ? 'rotate-180' : '']" />
                  </button>
                  <ul v-if="historialAbonosExpandido.has(historial.id)" class="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    <li v-for="pago in abonosDeRefinanciacion(historial.id)" :key="pago.id" class="flex items-center justify-between gap-2 px-3 py-2">
                      <span class="min-w-0">
                        <span class="block text-xs font-bold tabular-nums text-gray-800">${{ formatMoney(pago.valor) }}</span>
                        <span class="block text-[11px] text-gray-500">{{ formatDate(pago.fecha) }}</span>
                      </span>
                      <span v-if="formaPagoAbono(pago)" class="ds-badge ds-badge--muted">{{ FORMA_PAGO_ABONO_ESTILO[formaPagoAbono(pago)].label }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            </template>
          </div>
        </div>

          <div
            v-show="hayMasContenidoAbajoModalDetalle"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-[#f6f8f6]/90 via-[#f6f8f6]/40 to-transparent"
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
        <!-- Acciones fijas: siempre a la vista, sin bajar hasta el final -->
        <div
          class="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 pt-3 sm:flex-row sm:px-6"
          :style="{ paddingBottom: `calc(max(1rem, env(safe-area-inset-bottom, 0px)) + ${tapadoDetalle}px)` }"
        >
          <button type="button" class="btn-modal-secondary w-full sm:flex-1" @click="requestCloseTopModal">
            Cerrar
          </button>
          <button
            v-if="prestamoDetalle?.estado === 'activo' && !soloLectura"
            type="button"
            class="btn-modal-primary w-full sm:flex-1"
            @click="abrirModalAbono(prestamoDetalle)"
          >
            Registrar abono
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal información del préstamo / WhatsApp — patrón ModalWrapper (skill modales) -->
    <ModalWrapper
      :show="!!modalCompartirPrestamo"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4rem] items-start justify-between gap-2 pb-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-5 w-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Información del préstamo</h3>
                <p class="mt-0.5 text-[0.6875rem] text-white/80">Descargar o compartir por WhatsApp</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="flex h-[3.2rem] w-[3.2rem] flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Información del préstamo</h3>
              <p class="text-white/90 text-xs mt-1">Descargar o compartir por WhatsApp</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref="modalCompartirPrestamoScrollRef"
            class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] space-y-4 px-4 pb-0 pt-4 sm:px-6 sm:pt-5"
            @scroll.passive="onScrollModalCompartirPrestamo"
          >
            <!-- Wrapper de captura: el padding da aire para que toPng no recorte los bordes -->
            <div
              ref="prestamoRef"
              style="max-width: 404px; margin: 0 auto; padding: 14px; background: #eef1f4; border-radius: 28px;"
            >
            <div
              style="width: 100%; position: relative; background: #ffffff; border-radius: 22px; overflow: hidden; font-family: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif; box-shadow: 0 22px 44px -20px rgba(15,23,42,0.35); border: 1px solid rgba(15,23,42,0.08);"
            >
              <!-- Cabecera marca verde + hero del monto (compacta) -->
              <div style="background: #1B5E37; padding: 16px 20px 18px; color: #ffffff;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 9px; min-width: 0;">
                    <div style="width: 30px; height: 30px; border-radius: 9px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <p style="margin: 0; font-size: 12.5px; font-weight: 800; letter-spacing: -0.1px; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Comprobante de préstamo</p>
                  </div>
                  <span style="flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.26); border-radius: 9999px; padding: 3px 10px;">
                    <span style="width: 5px; height: 5px; border-radius: 50%; background: #6ee7b7; display: inline-block;"></span>
                    <span style="font-size: 9px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: #d1fae5;">{{ prestamoDetalle?.estado }}</span>
                  </span>
                </div>

                <div style="text-align: center; margin-top: 12px;">
                  <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: rgba(255,255,255,0.7);">Monto del préstamo</p>
                  <p style="margin: 5px 0 0; font-size: 30px; font-weight: 800; letter-spacing: -1.2px; line-height: 1;">${{ formatMoney(prestamoDetalle?.monto) }}</p>
                </div>
              </div>

              <!-- Perforación -->
              <div style="position: relative; background: #ffffff; height: 22px;">
                <div style="position: absolute; left: 18px; right: 18px; top: 50%; border-top: 2px dashed #dfe3e8;"></div>
                <span style="position: absolute; left: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
                <span style="position: absolute; right: -11px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; border-radius: 50%; background: #eef1f4;"></span>
              </div>

              <!-- Cuerpo -->
              <div style="background: #ffffff; padding: 6px 20px 20px;">
                <!-- Socio (jerarquía alta) -->
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 8px 0 12px; border-bottom: 1px solid #eef2ee;">
                  <div style="min-width: 0;">
                    <p style="margin: 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #9aa3af;">Socio</p>
                    <p style="margin: 3px 0 0; font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.4px; line-height: 1.15;">{{ prestamoDetalle?.socio_natillera?.socio?.nombre }}</p>
                  </div>
                  <span v-if="resumenMoraComprobanteExistente.texto" style="flex-shrink: 0; margin-top: 2px;" :style="estiloAvisoMoraComprobanteExistente">{{ resumenMoraComprobanteExistente.texto }}</span>
                </div>

                <!-- Total a pagar (valor prestado + interés = suma de cuotas) -->
                <div style="margin-top: 14px; background: #f0f7f2; border: 1px solid #d5e9db; border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <div style="min-width: 0;">
                    <p style="margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase; color: #1B5E37;">Total a pagar</p>
                    <p style="margin: 2px 0 0; font-size: 10px; font-weight: 600; color: #7a8a7e;">Valor prestado + interés</p>
                  </div>
                  <p style="margin: 0; font-size: 22px; font-weight: 800; color: #1B5E37; letter-spacing: -0.5px; line-height: 1; white-space: nowrap;">${{ formatMoney(calcularSaldoInicialTotal(prestamoDetalle)) }}</p>
                </div>

                <!-- Pagado / Saldo (destacados, fáciles de identificar) -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                  <div style="background: #edf7ef; border: 1px solid #cfe9d6; border-radius: 14px; padding: 13px 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 18px; height: 18px; border-radius: 6px; background: #1B5E37; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase; color: #1B5E37;">Pagado a la fecha</p>
                    </div>
                    <p style="margin: 8px 0 0; font-size: 23px; font-weight: 800; color: #1B5E37; letter-spacing: -0.6px; line-height: 1;">${{ formatMoney(calcularValorPagadoDetalle(prestamoDetalle)) }}</p>
                  </div>
                  <div
                    :style="{
                      borderRadius: '14px', padding: '13px 12px',
                      background: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#fef2f2' : '#edf7ef',
                      border: (prestamoDetalle?.saldo_actual || 0) > 0 ? '1px solid #fbcfcf' : '1px solid #cfe9d6'
                    }"
                  >
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span
                        :style="{
                          width: '18px', height: '18px', borderRadius: '6px', flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#dc2626' : '#1B5E37'
                        }"
                      >
                        <svg v-if="(prestamoDetalle?.saldo_actual || 0) > 0" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase;" :style="{ color: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#b91c1c' : '#1B5E37' }">Saldo pendiente</p>
                    </div>
                    <p style="margin: 8px 0 0; font-size: 23px; font-weight: 800; letter-spacing: -0.6px; line-height: 1;" :style="{ color: (prestamoDetalle?.saldo_actual || 0) > 0 ? '#dc2626' : '#1B5E37' }">${{ formatMoney(prestamoDetalle?.saldo_actual) }}</p>
                  </div>
                </div>

                <!-- Detalles (más legible) -->
                <p style="margin: 18px 0 0; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #1B5E37;">Detalles del préstamo</p>
                <div style="margin-top: 10px; background: #f8faf8; border: 1px solid #eaf0ea; border-radius: 14px; padding: 6px 14px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Interés mensual</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1f2937; letter-spacing: -0.2px;">{{ prestamoDetalle?.interes }}%</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">N° de cuotas</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1f2937; letter-spacing: -0.2px;">{{ prestamoDetalle?.numero_cuotas || 1 }}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Valor cuota</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1B5E37; letter-spacing: -0.2px;">${{ formatMoney(calcularCuotaMensualDetalle(prestamoDetalle)) }}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Interés generado</span>
                    <span style="font-size: 15px; font-weight: 800; color: #b45309; letter-spacing: -0.2px;">${{ formatMoney(calcularInteresGeneradoDetalle(prestamoDetalle)) }}</span>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #6b7280;">Fecha de creación</span>
                    <span style="font-size: 15px; font-weight: 800; color: #1f2937; letter-spacing: -0.2px;">{{ formatDate(prestamoDetalle?.created_at) }}</span>
                  </div>
                  <div v-if="prestamoDetalle?.moraAcumulada > 0" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #eef2ee;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #b91c1c;">Interés de mora</span>
                    <span style="font-size: 15px; font-weight: 800; color: #dc2626; letter-spacing: -0.2px;">${{ formatMoney(prestamoDetalle.moraAcumulada) }}</span>
                  </div>
                </div>

                <!-- Refinanciamiento -->
                <div v-if="historialRefinanciaciones.length > 0" style="margin-top: 18px; padding-top: 16px; border-top: 2px dashed #e6efe6;">
                  <p style="margin: 0 0 10px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #6d28d9;">
                    {{ historialRefinanciaciones.length > 1 ? 'Refinanciamientos' : 'Refinanciamiento' }}
                  </p>
                  <div
                    v-for="(refin, idx) in historialRefinanciaciones"
                    :key="refin.id"
                    :style="{ marginTop: idx === 0 ? '0' : '10px', background: '#f6f3fc', border: '1px solid #e5ddf7', borderRadius: '14px', padding: '10px 14px' }"
                  >
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                      <span style="font-size: 10px; font-weight: 800; color: #6d28d9; letter-spacing: 0.3px;">Refinanciación #{{ historialRefinanciaciones.length - idx }}</span>
                      <span style="font-size: 10px; font-weight: 600; color: #8b8194;">{{ formatDate(refin.fecha_refinanciacion) }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid #ece6f7;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Valor inicial</span>
                      <span style="font-size: 13px; font-weight: 800; color: #1f2937;">${{ formatMoney((refin.monto_anterior || 0) + (refin.interes_generado_anterior || 0)) }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid #ece6f7;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Valor pagado</span>
                      <span style="font-size: 13px; font-weight: 800; color: #1B5E37;">${{ formatMoney(refin.total_pagado_anterior || 0) }}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 5px 0;">
                      <span style="font-size: 12px; font-weight: 600; color: #6b7280;">Monto refinanciado</span>
                      <span style="font-size: 13px; font-weight: 800; color: #6d28d9;">${{ formatMoney(refin.saldo_actual_anterior) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Plan de pagos -->
                <div v-if="planPagosComprobanteExistente.length > 0" style="margin-top: 18px; padding-top: 16px; border-top: 2px dashed #e6efe6;">
                  <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9aa3af;">Plan de pagos</p>
                  <p style="margin: 4px 0 10px; font-size: 10px; color: #9aa3af;">
                    Primera cuota: {{ planPagosComprobanteExistente[0]?.fecha_proyectada ? formatDate(planPagosComprobanteExistente[0].fecha_proyectada) : '—' }}
                  </p>
                  <div style="overflow-x: auto;">
                    <table style="width: 100%; min-width: 260px; border-collapse: collapse; font-size: 10px;">
                      <thead>
                        <tr style="border-bottom: 1.5px solid #e2eee4;">
                          <th style="text-align: left; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Nº</th>
                          <th style="text-align: left; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Vencimiento</th>
                          <th style="text-align: right; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Cuota</th>
                          <th style="text-align: right; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Abonado</th>
                          <th style="text-align: center; padding: 6px 4px; font-weight: 700; color: #1B5E37;">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(cuota, idx) in planPagosComprobanteExistente"
                          :key="cuota.id ?? idx"
                          :style="{ background: idx % 2 === 0 ? '#ffffff' : '#f7faf7' }"
                        >
                          <td style="padding: 5px 4px; color: #6b7280; font-weight: 700;">{{ cuota.numero_cuota }}</td>
                          <td style="padding: 5px 4px; color: #374151;">{{ formatDate(cuota.fecha_proyectada) }}</td>
                          <td style="padding: 5px 4px; text-align: right; font-weight: 700; color: #1f2937; vertical-align: top;">
                            <span>${{ formatMoney(cuota.valor_cuota) }}</span>
                            <span v-if="moraCuotaComprobante(cuota) > 0" style="display: block; font-size: 8.5px; font-weight: 700; color: #dc2626;">+${{ formatMoney(moraCuotaComprobante(cuota)) }} mora</span>
                          </td>
                          <td
                            style="padding: 5px 4px; text-align: right; font-weight: 700; vertical-align: top;"
                            :style="{ color: parseFloat(cuota.valor_pagado || 0) > 0 ? '#1B5E37' : '#9ca3af' }"
                          >
                            ${{ formatMoney(cuota.valor_pagado || 0) }}
                          </td>
                          <td style="padding: 5px 4px; text-align: center; vertical-align: top;">
                            <span :style="estiloBadgeEstadoCuotaComprobante(cuota)">{{ etiquetaEstadoCuotaComprobante(cuota) }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Total a pagar con mora (si hay mora acumulada) -->
                  <div v-if="prestamoDetalle?.moraAcumulada > 0" style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fef2f2; border: 1px solid #fbcfcf; border-radius: 10px; padding: 9px 12px;">
                    <div>
                      <p style="margin: 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: #b91c1c;">Total a pagar con mora</p>
                      <p style="margin: 2px 0 0; font-size: 9px; font-weight: 600; color: #9aa3af;">Saldo ${{ formatMoney(prestamoDetalle?.saldo_actual) }} + mora ${{ formatMoney(prestamoDetalle.moraAcumulada) }}</p>
                    </div>
                    <p style="margin: 0; font-size: 16px; font-weight: 800; color: #dc2626; letter-spacing: -0.4px; white-space: nowrap;">${{ formatMoney((parseFloat(prestamoDetalle?.saldo_actual) || 0) + (prestamoDetalle.moraAcumulada || 0)) }}</p>
                  </div>
                </div>

                <p style="margin: 16px 0 0; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.2px; color: #adb5bd;">Generado con Natillerapp</p>
              </div>
            </div>
            </div>

            <div class="space-y-3 border-t border-gray-200 pt-4 pb-[calc(max(1rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))]">
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="descargarPrestamo"
                  :disabled="generandoImagenPrestamo || !archivoImagenPrestamo"
                  class="btn-descargar flex-1"
                >
                  <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
                  {{ generandoImagenPrestamo ? 'Preparando…' : 'Descargar' }}
                </button>
                <button
                  type="button"
                  @click="compartirPrestamoWhatsApp"
                  :disabled="generandoImagenPrestamo || !archivoImagenPrestamo"
                  class="btn-compartir flex-1"
                >
                  <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
                  {{ generandoImagenPrestamo ? 'Preparando…' : 'WhatsApp' }}
                </button>
              </div>
              <p class="text-center text-xs text-gray-500">
                En celular puedes enviar la imagen directamente desde el menú compartir.
              </p>
            </div>
          </div>

          <div
            v-show="hayNatiscrollModalCompartirPrestamo"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[calc(max(0.85rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))] pt-12"
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

    <!-- Modal Compartir Préstamo Nuevo por WhatsApp — mismo patrón que crear préstamo -->
    <ModalWrapper
      :show="!!modalCompartirPrestamoNuevo"
      :z-index="60"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div
            class="sm:hidden flex min-h-[4rem] items-start justify-between gap-2 pb-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-5 w-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">{{ esComprobanteRealCompartir ? 'Compartir comprobante' : 'Compartir proyección' }}</h3>
                <p class="mt-0.5 text-[0.6875rem] text-white/80">Vista previa para WhatsApp</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (icono arriba + textos centrados, X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="flex h-[3.2rem] w-[3.2rem] flex-shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
                <ChatBubbleLeftIcon class="h-6 w-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">{{ esComprobanteRealCompartir ? 'Compartir comprobante' : 'Compartir proyección' }}</h3>
              <p class="text-white/90 text-xs mt-1">Vista previa para WhatsApp</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="modalCompartirPrestamoNuevoScrollRef"
          class="scrollbar-thin flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] space-y-4 px-4 pb-0 pt-4 sm:px-6 sm:pt-5"
          @scroll.passive="onScrollModalCompartirPrestamoNuevo"
        >
          <div
            ref="prestamoNuevoRef"
            class="comprobante-prestamo-nuevo bg-white rounded-2xl overflow-hidden"
            style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); min-width: 280px;"
          >
            <div class="comprobante-content" style="background: #ecfdf5; padding: 14px 12px; color: #1f2937;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; padding-bottom: 4px;">
                <div style="width: 44px; height: 44px; background: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div style="text-align: center;">
                  <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #374151; letter-spacing: -0.5px; line-height: 1.2;">{{ ticketCompartir.titulo }}</h1>
                </div>
              </div>

              <div style="background: white; padding: 14px 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                <p style="color: #6b7280; font-size: 10px; margin: 0 0 4px 0; font-weight: 600; letter-spacing: 0.02em; text-align: center;">Monto del préstamo</p>
                <p style="font-size: 24px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.5px; color: #059669; text-align: center;">${{ formatMoney(ticketCompartir.monto) }}</p>
                <p style="color: #9ca3af; font-size: 10px; margin: 0 0 3px 0; font-weight: 600;">Socio</p>
                <p style="font-weight: 700; font-size: 16px; margin: 0; color: #1f2937;">{{ ticketCompartir.nombreSocio }}</p>
              </div>

              <div style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 10px 0;">{{ ticketCompartir.subtituloDetalles }}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px;">
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERÉS MENSUAL</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ ticketCompartir.interes }}%</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">N° DE CUOTAS</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #1f2937;">{{ ticketCompartir.numero_cuotas }}</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">VALOR CUOTA</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(ticketCompartir.cuota) }}</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">TOTAL A PAGAR</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #059669;">${{ formatMoney(ticketCompartir.totalAPagar) }}</p>
                  </div>
                  <div>
                    <p style="color: #9ca3af; font-size: 9px; margin: 0 0 2px 0; font-weight: 700; text-transform: uppercase;">INTERESES GENERADOS</p>
                    <p style="font-weight: 700; font-size: 12px; margin: 0; color: #ea580c;">${{ formatMoney(ticketCompartir.interesTotal) }}</p>
                  </div>
                </div>
              </div>

              <div v-if="ticketCompartir.plan.length > 0" style="background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); margin-bottom: 10px;">
                <p style="color: #1f2937; font-size: 11px; font-weight: 700; margin: 0 0 8px 0;">{{ ticketCompartir.tituloPlan }}</p>
                <p style="color: #6b7280; font-size: 9px; margin: 0 0 6px 0;">{{ ticketCompartir.etiquetaFechaPlan }}: {{ ticketCompartir.fechaPrimera ? formatDate(ticketCompartir.fechaPrimera) : '—' }}</p>
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                    <thead>
                      <tr style="background: #f0fdf4; border-bottom: 2px solid #a7f3d0;">
                        <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Nº</th>
                        <th style="text-align: left; padding: 6px 8px; font-weight: 700; color: #065f46;">Fecha vencimiento</th>
                        <th style="text-align: right; padding: 6px 8px; font-weight: 700; color: #065f46;">Valor cuota</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(cuota, idx) in ticketCompartir.plan" :key="idx" :style="{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }">
                        <td style="padding: 5px 8px; color: #374151; font-weight: 600;">{{ cuota.numero_cuota }}</td>
                        <td style="padding: 5px 8px; color: #374151;">{{ formatDate(cuota.fecha_proyectada) }}</td>
                        <td style="padding: 5px 8px; text-align: right; font-weight: 600; color: #059669;">${{ formatMoney(cuota.valor_cuota) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3 pb-[calc(max(1rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))] pt-1">
            <div class="flex gap-3">
              <button
                type="button"
                @click="descargarPrestamoNuevo"
                :disabled="generandoImagenPrestamoNuevo || !archivoImagenPrestamoNuevo"
                class="btn-descargar flex-1"
              >
                <ArrowDownTrayIcon class="w-5 h-5 flex-shrink-0" />
                {{ generandoImagenPrestamoNuevo ? 'Preparando…' : 'Descargar' }}
              </button>
              <button
                type="button"
                @click="compartirPrestamoNuevoWhatsApp"
                :disabled="generandoImagenPrestamoNuevo || !archivoImagenPrestamoNuevo"
                class="btn-compartir flex-1"
              >
                <IconoWhatsApp class="w-5 h-5 flex-shrink-0" />
                {{ generandoImagenPrestamoNuevo ? 'Preparando…' : 'WhatsApp' }}
              </button>
            </div>
          </div>
        </div>

          <!-- Natiscroll: velo + «Desliza para ver más» (mismo patrón que crear préstamo) -->
          <div
            v-show="hayNatiscrollModalProyeccion"
            class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
            aria-hidden="true"
          >
            <div
              class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
              aria-hidden="true"
            />
            <div
              class="relative z-[2] flex justify-center px-5 pb-[calc(max(0.85rem,env(safe-area-inset-bottom,0px))+var(--tapado-inferior,0px))] pt-12"
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

    <!-- Modal de confirmación para eliminar abono -->
    <ModalWrapper
      :show="!!abonoAEliminar"
      :z-index="70"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Eliminar Abono</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Actualizará el saldo del préstamo</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Eliminar Abono</h3>
              <p class="text-white/90 text-xs mt-1">Esta acción actualizará el saldo del préstamo</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Cuerpo scrolleable (confirm corto: sin natiscroll manual; footer fijo asegura la CTA visible) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-4 pb-4">
          <p class="text-gray-700 mb-3">
            ¿Estás seguro de que deseas eliminar el abono de <strong class="text-gray-900">${{ formatMoney(abonoAEliminar?.valor) }}</strong>?
          </p>
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-amber-600 text-lg">⚠️</span>
              </div>
              <div class="flex-1">
                <p class="font-bold text-amber-800 mb-2 text-sm">Al eliminar este abono:</p>
                <ul class="space-y-2 text-sm text-amber-700">
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>Se sumará ${{ formatMoney(abonoAEliminar?.valor) }} al saldo del préstamo</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>El estado del préstamo puede cambiar si el saldo aumenta</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span>Esta acción no se puede deshacer</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer de acciones fijo (destructivo → botón ámbar, excepción de color permitida) -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex gap-3">
          <button type="button" class="btn-modal-secondary flex-1" @click="requestCloseTopModal">Cancelar</button>
          <button
            type="button"
            @click="eliminarAbonoConfirmado"
            :disabled="loading"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-4 font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon class="w-5 h-5" />
            <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
          </button>
        </div>
    </ModalWrapper>

    <!-- Modal de confirmación para eliminar préstamo -->
    <ModalWrapper
      :show="!!prestamoAEliminar"
      :z-index="50"
      align="bottom"
      :persistent="true"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="requestCloseTopModal"
    >
        <!-- Cabecera marca compacta (móvil = fila, desktop = icono arriba + textos centrados) -->
        <div class="relative w-full flex-shrink-0 bg-[#1B5E37] text-white overflow-hidden">
          <div class="sm:hidden flex min-h-[4.2rem] items-center gap-2 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <div class="w-10 h-10 flex-shrink-0 rounded-xl border border-white/25 bg-white/15 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-display font-bold leading-tight">Eliminar Préstamo</h3>
                <p class="mt-0.5 truncate text-[0.6875rem] text-white/90">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button
              type="button"
              class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          <!-- Desktop: 3 columnas flex (X sin absolute → iOS-safe) -->
          <div class="hidden sm:flex items-start w-full px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
            <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
            <div class="flex-1 min-w-0 flex flex-col items-center text-center">
              <div class="w-[3.2rem] h-[3.2rem] bg-white/15 rounded-xl flex items-center justify-center border border-white/25">
                <TrashIcon class="w-6 h-6 text-white" />
              </div>
              <h3 class="text-lg font-display font-bold mt-3">Eliminar Préstamo</h3>
              <p class="text-white/90 text-xs mt-1">Esta acción no se puede deshacer</p>
            </div>
            <button
              type="button"
              class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/15"
              aria-label="Cerrar"
              @click="requestCloseTopModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Cuerpo scrolleable (confirm corto: sin natiscroll manual; footer fijo asegura la CTA visible) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white overscroll-contain [-webkit-overflow-scrolling:touch] px-5 sm:px-6 pt-4 pb-4">
          <p class="text-gray-700 mb-3">
            ¿Estás seguro de que deseas eliminar el préstamo de <strong class="text-gray-900">{{ prestamoAEliminar?.socio_natillera?.socio?.nombre || 'este socio' }}</strong>?
          </p>
          <div class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-red-600 text-lg">⚠️</span>
              </div>
              <div class="flex-1">
                <p class="font-bold text-red-800 mb-2 text-sm">Se perderá permanentemente:</p>
                <ul class="space-y-2 text-sm text-red-700">
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>El registro completo del préstamo</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>Todos los abonos y pagos registrados</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>Todo el historial de transacciones</span>
                  </li>
                </ul>
                <p class="mt-3 text-xs text-red-600 font-semibold bg-white/60 rounded-lg p-2">
                  💡 Esta acción es irreversible. Asegúrate de que realmente deseas eliminar este préstamo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer de acciones fijo (destructivo → botón rojo, excepción de color permitida) -->
        <div class="flex-shrink-0 border-t border-gray-200 bg-white px-5 sm:px-6 pt-4 pb-[calc(max(1.25rem,env(safe-area-inset-bottom))+var(--tapado-inferior,0px))] flex gap-3">
          <button type="button" class="btn-modal-secondary flex-1" @click="requestCloseTopModal">Cancelar</button>
          <button
            type="button"
            @click="eliminarPrestamoConfirmado"
            :disabled="loading"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-4 font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon class="w-5 h-5" />
            <span>{{ loading ? 'Eliminando...' : 'Sí, Eliminar' }}</span>
          </button>
        </div>
    </ModalWrapper>

    <!-- Operación en curso que bloquea la página: caja flotante estándar -->
    <CargaCaja
      :visible="generandoPrestamo"
      flotante
      texto="Generando préstamo"
      detalle="Creando el plan de pagos y registrando el préstamo."
    />
    <!--
      Abonos, refinanciación, eliminaciones e imágenes: en Préstamos la espera se ve con la
      caja flotante, no dentro del botón. El botón solo se deshabilita y cambia su texto.
    -->
    <CargaCaja
      :visible="!!cargaOperacion"
      flotante
      :texto="cargaOperacion?.texto"
      :detalle="cargaOperacion?.detalle"
    />
  </div>
</template>

<script setup>
import { numeroWhatsApp } from '../../utils/telefono'
import IconoWhatsApp from '../../components/iconos/IconoWhatsApp.vue'
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useNotificationStore } from '../../stores/notifications'
import { natilleraPrestamosDeshabilitados, parseReglasInteresPrestamo, diasGraciaPrestamo } from '../../utils/natilleraPrestamos'
import {
  periodoDesdeFechaProyectada,
  fechaLimiteSinMora,
  calcularMoraCuota,
  calcularMoraPrestamo,
  desglosarAbonoConMora,
  desglosarAbono,
  aplicarMovimientosMora,
  moraPendienteGuardada,
  cuotasConMoraPendienteDe,
  registrarMoraCobradaEnFondoNegativa,
  registrarMoraCobradaEnFondo,
  guardarInteresPrestamo,
  recalcularPlanPagosPrestamo
} from '../../composables/usePagoPrestamo'
import { calcularCondicionesPrestamo, generarDesgloseCuotas, calcularRefinanciacion } from '../../utils/calculoPrestamos'
import { useNatillerasStore } from '../../stores/natilleras'
import { useAuthStore } from '../../stores/auth'
import { useAuditoria, registrarAuditoriaEnSegundoPlano } from '../../composables/useAuditoria'
import { calcularUtilidadesReales } from '../../composables/useUtilidadesReales'
import { 
  ArrowLeftIcon,
  PlusIcon,
  BanknotesIcon,
  UserIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronRightIcon,
  LockClosedIcon,
  ArrowsRightLeftIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  RectangleStackIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'
import { getAvatarUrl } from '../../utils/avatars'
import { getCurrentDateISO, formatDateToLocalISO, parseDateLocal, formatDate } from '../../utils/formatDate'
import DateInput from '../../components/DateInput.vue'

import BackButton from '../../components/BackButton.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useSessionDraftPersistence } from '../../composables/useSessionDraftPersistence'
import { useModalStack, __modalStackSync } from '../../composables/useModalStack'
import ModalWrapper from '../../components/ModalWrapper.vue'
import PrestamosSkeleton from '../../components/PrestamosSkeleton.vue'
import ExplicacionInteresPrestamo from '../../components/ExplicacionInteresPrestamo.vue'
import RecorridoInteractivo from '../../components/RecorridoInteractivo.vue'
import SwitchSegmentado from '../../components/SwitchSegmentado.vue'
import InteresesGanadosModal from '../../components/prestamos/InteresesGanadosModal.vue'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { detectIosPlatform } from '../../composables/useIsIos'
import CargaCaja from '../../components/carga/CargaCaja.vue'
import { crearContadorGuia } from '../../composables/useContadorGuia'
import { usePermisosNatillera } from '../../composables/usePermisosNatillera'
import { toPng } from 'html-to-image'


/**
 * Calcula la fecha proyectada para una cuota mensual respetando el día de pago.
 * Si el mes no tiene ese día (ej. 31 en febrero o en abril), usa el último día del mes.
 * Ej: día 31 → en febrero 28/29, en abril 30; día 30 → en febrero 28/29.
 */
function fechaProyectadaMensual(fechaInicio, numeroCuota) {
  const diaPago = fechaInicio.getDate()
  const anioInicio = fechaInicio.getFullYear()
  const mesInicio = fechaInicio.getMonth()
  const mesObjetivo = mesInicio + (numeroCuota - 1)
  const anioObjetivo = anioInicio + Math.floor(mesObjetivo / 12)
  const mes = ((mesObjetivo % 12) + 12) % 12
  const ultimoDiaDelMes = new Date(anioObjetivo, mes + 1, 0).getDate()
  const dia = Math.min(diaPago, ultimoDiaDelMes)
  return new Date(anioObjetivo, mes, dia, fechaInicio.getHours(), fechaInicio.getMinutes(), fechaInicio.getSeconds(), fechaInicio.getMilliseconds())
}

const notificationStore = useNotificationStore()
const natillerasStore = useNatillerasStore()
const authStore = useAuthStore()
const auditoria = useAuditoria()

const props = defineProps({
  id: String
})

const route = useRoute()
const router = useRouter()
const id = props.id || route.params.id

// Quien solo tiene «ver» en préstamos no debe tropezar con errores al intentar escribir:
// aquí solo se esconden los botones; lo que de verdad bloquea es la base de datos (RLS).
const permisos = usePermisosNatillera(id)
const soloLectura = computed(() => !permisos.puedeGestionar('prestamos'))

const prestamos = ref([])
const socios = ref([])
const loading = ref(false)
// Carga inicial: controla el skeleton de la vista (solo el primer fetch, no los refetch)
const cargaInicial = ref(true)
// Pestaña de secciones de la lista: 'por_cobrar' | 'pagados'
const tabPrestamos = ref('por_cobrar')
const interesesGanadosUtilidades = ref(0) // Monto de intereses ganados desde utilidades_clasificadas
const todosLosPlanesPagos = ref([]) // Almacenar todos los planes de pagos para calcular total pagado
const modalNuevoPrestamo = ref(false)
const modalAbono = ref(false)
const modalEditarAbono = ref(false)
const modalDetalle = ref(false)
const modalRefinanciar = ref(false)
const prestamoSeleccionado = ref(null)
const prestamoDetalle = ref(null)
const pagosPrestamo = ref([])
const planPagosPrestamo = ref([])
const planPagosExpandido = ref(false)
// Pestaña del detalle del préstamo: plan de pagos, abonos o condiciones.
const pestanaDetalle = ref('plan')
// Desglose del indicador «Intereses ganados»
const modalInteresesGanados = ref(false)
// La barra de Safari tapa el pie fijo de la hoja inferior: se suma al padding.
const { tapado: tapadoDetalle } = useTapadoInferior()
// Abonos del ciclo vigente (los ya "cerrados" por una refinanciación quedan excluidos).
// El resumen de pagos del detalle solo debe contar estos.
const pagosCicloActual = computed(() => pagosPrestamo.value.filter(p => !p.refinanciacion_id))
// Ids de refinanciaciones cuyo desplegable de abonos está abierto en el detalle.
const historialAbonosExpandido = ref(new Set())
// Ids de refinanciaciones cuyo desplegable del plan de pagos anterior está abierto.
const historialPlanExpandido = ref(new Set())
const prestamoAEliminar = ref(null)
// Id del préstamo con el desplegable «⋯» (Refinanciar / Eliminar) abierto en la lista.
const accionesPrestamoAbiertas = ref(null)
// Ayuda del interés: desde qué formulario se abrió define los datos del simulador
const modalAyudaInteres = ref(false)
const contextoAyudaInteres = ref('crear') // 'crear' | 'refinanciar'
function abrirAyudaInteres(contexto) {
  contextoAyudaInteres.value = contexto
  modalAyudaInteres.value = true
}
const propsAyudaInteres = computed(() => {
  if (contextoAyudaInteres.value === 'refinanciar') {
    const p = prestamoSeleccionado.value
    return {
      capital: vistaPreviaRefinanciacion.value?.capitalPendiente || 0,
      tasaMensual: p ? tasaRefinanciacionElegida(p) : 0,
      numeroCuotas: formRefinanciar.numero_cuotas_nuevo || 0,
      periodicidad: p?.periodicidad || 'mensual',
      tipoInteres: formRefinanciar.tipo_interes_nuevo,
      interesAnticipado: !!p?.interes_anticipado,
      refinanciacion: true,
      refinanciacionDatos: vistaPreviaRefinanciacion.value
    }
  }
  return {
    capital: formPrestamo.monto,
    tasaMensual: formPrestamo.interes,
    numeroCuotas: formPrestamo.numero_cuotas,
    periodicidad: formPrestamo.periodicidad,
    tipoInteres: formPrestamo.tipo_interes,
    interesAnticipado: mostrarInteresAnticipado.value,
    refinanciacion: false,
    refinanciacionDatos: null
  }
})
function alternarAccionesPrestamo(id) {
  accionesPrestamoAbiertas.value = accionesPrestamoAbiertas.value === id ? null : id
}
const abonoAEliminar = ref(null)
const abonoAEditar = ref(null)
const modalCompartirPrestamo = ref(false)
const modalCompartirPrestamoNuevo = ref(false)
const modalComprobanteAbono = ref(false)
const modalComprobantePagado = ref(false)

// FAB flotante: aparece cuando la cabecera (con «Nuevo Préstamo») sale del viewport
const headerRef = ref(null)
const headerVisible = ref(true)
let headerObserver = null
const hayModalAbiertaPrestamos = computed(() =>
  modalNuevoPrestamo.value || modalAbono.value || modalEditarAbono.value || modalDetalle.value ||
  modalRefinanciar.value || modalAyudaInteres.value || modalCompartirPrestamo.value ||
  modalCompartirPrestamoNuevo.value || modalComprobanteAbono.value || modalComprobantePagado.value ||
  !!prestamoAEliminar.value || !!abonoAEliminar.value || !!abonoAEditar.value
)
// Lee `guiaPrestamosActiva`, declarada más abajo: al ser computed solo se evalúa al pintar,
// cuando el setup ya terminó (no repetir el patrón con un watch, que sí evaluaría ya).
const mostrarFab = computed(() =>
  !cargaInicial.value &&
  prestamos.value.length > 0 &&
  !headerVisible.value &&
  !hayModalAbiertaPrestamos.value &&
  !guiaPrestamosActiva.value
)
const generandoImagenPrestamo = ref(false)
const generandoImagenPrestamoNuevo = ref(false)
const generandoPrestamo = ref(false)

// Qué operación está esperando, según el modal abierto: `loading` es uno solo para todas.
// Va del modal más alto al más bajo, porque eliminar un abono se abre sobre el detalle.
const cargaOperacion = computed(() => {
  // La imagen de los comprobantes se prepara sola al abrirlos (ver crearImagenPreparada): no es
  // una operación del usuario y la carga flotante taparía el comprobante que se quiere ver.
  if (!loading.value) return null
  if (prestamoAEliminar.value) return { texto: 'Eliminando préstamo', detalle: 'Borrando el préstamo y sus pagos.' }
  if (abonoAEliminar.value) return { texto: 'Eliminando abono', detalle: 'Recalculando el saldo del préstamo.' }
  if (modalEditarAbono.value) return { texto: 'Guardando abono', detalle: 'Recalculando el saldo del préstamo.' }
  if (modalRefinanciar.value) return { texto: 'Refinanciando préstamo', detalle: 'Creando el nuevo plan de pagos.' }
  if (modalAbono.value) return { texto: 'Registrando abono', detalle: 'Actualizando el saldo del préstamo.' }
  return null
})
const contactoSeleccionadoWhatsApp = ref(null)
const historialRefinanciaciones = ref([])
const prestamoRef = ref(null)
const prestamoNuevoRef = ref(null)
const resumenPrestamoNuevoRef = ref(null)
const generandoResumenPrestamo = ref(false)
const prestamosMoraExpandidos = ref(new Set())

// Bloquear scroll del body cuando las modales están abiertas
useBodyScrollLock(modalNuevoPrestamo)
useBodyScrollLock(modalAbono)
useBodyScrollLock(modalEditarAbono)
useBodyScrollLock(modalDetalle)
useBodyScrollLock(modalRefinanciar)
useBodyScrollLock(modalCompartirPrestamo)
useBodyScrollLock(modalCompartirPrestamoNuevo)
useBodyScrollLock(modalComprobanteAbono)
useBodyScrollLock(modalComprobantePagado)
useBodyScrollLock(computed(() => !!prestamoAEliminar.value))
useBodyScrollLock(computed(() => !!abonoAEliminar.value))

const modalDetalleScrollRef = ref(null)
const modalDetallePlanPagosSectionRef = ref(null)
const modalDetalleRefinanciacionSectionRef = ref(null)
const hayMasContenidoAbajoModalDetalle = ref(false)
let rafIndicadorScrollModalDetalle = null
function actualizarIndicadorScrollModalDetalle() {
  const el = modalDetalleScrollRef.value
  if (!el) {
    hayMasContenidoAbajoModalDetalle.value = false
    return
  }
  const umbral = 10
  hayMasContenidoAbajoModalDetalle.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarActualizarIndicadorScrollModalDetalle() {
  if (rafIndicadorScrollModalDetalle != null) cancelAnimationFrame(rafIndicadorScrollModalDetalle)
  rafIndicadorScrollModalDetalle = requestAnimationFrame(() => {
    rafIndicadorScrollModalDetalle = null
    actualizarIndicadorScrollModalDetalle()
  })
}

/*
 * Desplazar el cuerpo del detalle hasta una sección. No con `scrollIntoView`: en iOS mueve
 * también los ancestros (la card y el overlay fijos), y la hoja quedaba corrida o con un
 * hueco. Se calcula el destino y se desplaza solo el contenedor scrolleable.
 */
let temporizadorScrollDetalle = null
let rafScrollDetalle = null
function cancelarScrollDetalle() {
  clearTimeout(temporizadorScrollDetalle)
  temporizadorScrollDetalle = null
  if (rafScrollDetalle != null) cancelAnimationFrame(rafScrollDetalle)
  rafScrollDetalle = null
}
function desplazarDetalleHasta(el) {
  const contenedor = modalDetalleScrollRef.value
  if (!el || !contenedor) return
  const destino = el.getBoundingClientRect().top - contenedor.getBoundingClientRect().top + contenedor.scrollTop
  contenedor.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' })
  el.focus({ preventScroll: true })
  programarActualizarIndicadorScrollModalDetalle()
}
// Dos frames: el primero aplica el cambio de pestaña, el segundo ya tiene el layout final.
function desplazarDetalleEnDosFrames(obtenerEl) {
  cancelarScrollDetalle()
  rafScrollDetalle = requestAnimationFrame(() => {
    rafScrollDetalle = requestAnimationFrame(() => {
      rafScrollDetalle = null
      desplazarDetalleHasta(obtenerEl())
    })
  })
}

/** Expande el plan si hay varias cuotas y desplaza el scroll del modal hasta la tabla/grid. */
async function abrirPlanPagosYDesplazarDetalle() {
  if (!planPagosPrestamo.value.length) return
  pestanaDetalle.value = 'plan'
  const variasCuotas = planPagosPrestamo.value.length > 1
  if (variasCuotas) {
    planPagosExpandido.value = true
  }
  await nextTick()
  await nextTick()
  if (!variasCuotas) {
    desplazarDetalleEnDosFrames(() => modalDetallePlanPagosSectionRef.value)
    return
  }
  // Espera a que termine la animación de expandir el plan
  cancelarScrollDetalle()
  temporizadorScrollDetalle = window.setTimeout(() => {
    temporizadorScrollDetalle = null
    desplazarDetalleHasta(modalDetallePlanPagosSectionRef.value)
  }, 340)
}

// Desplaza el detalle hasta la sección de refinanciaciones.
async function irASeccionRefinanciacion() {
  if (!historialRefinanciaciones.value.length) return
  pestanaDetalle.value = 'condiciones'
  await nextTick()
  desplazarDetalleEnDosFrames(() => modalDetalleRefinanciacionSectionRef.value)
}

watch(
  [
    modalDetalle,
    planPagosExpandido,
    pestanaDetalle,
    () => pagosPrestamo.value.length,
    () => planPagosPrestamo.value.length,
    () => historialRefinanciaciones.value.length
  ],
  () => programarActualizarIndicadorScrollModalDetalle(),
  { flush: 'post' }
)

watch(modalDetalle, async (abierto) => {
  if (!abierto) {
    hayMasContenidoAbajoModalDetalle.value = false
    return
  }
  pestanaDetalle.value = 'plan'
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalDetalle()
})

// Función para toggle del desplegable de información de mora
const toggleMoraInfo = (prestamoId) => {
  if (prestamosMoraExpandidos.value.has(prestamoId)) {
    prestamosMoraExpandidos.value.delete(prestamoId)
  } else {
    prestamosMoraExpandidos.value.add(prestamoId)
  }
}

// parseReglasInteresPrestamo se importa desde utils/natilleraPrestamos (incluye tasa_mora)
const reglasInteresNatillera = ref(parseReglasInteresPrestamo(null))
// Días de gracia efectivos de la natillera para préstamos (0 si la regla está
// apagada). Se leen de aquí en todos los cálculos para que el interruptor de la
// configuración tenga un solo punto de verdad.
const diasGraciaPrestamos = computed(() => diasGraciaPrestamo(reglasInteresNatillera.value))


const plazoMaximoCuotasCrear = computed(() => reglasInteresNatillera.value.plazo_maximo)

async function cargarReglasPrestamoNatillera() {
  try {
    /*
     * Consulta directa en vez de `natillerasStore.fetchNatillera(id)`.
     *
     * De toda la natillera aquí solo se usa `reglas_interes`: para las reglas de
     * interés y para saber si la natillera tiene los préstamos deshabilitados.
     * `fetchNatillera` en cambio hace dos rondas de consultas y se trae socios,
     * actividades, socios_actividad y TODAS las cuotas de la natillera —en la
     * más grande, 384 filas y ~378 KB de JSON— que esta vista no usa en ningún
     * sitio. Y como esto va con `await` antes de `fetchPrestamos()`, ese peso se
     * pagaba entero antes de empezar a pedir los préstamos.
     */
    const { data: n, error: e } = await supabase
      .from('natilleras')
      .select('id, reglas_interes, reglas_multas')
      .eq('id', id)
      .maybeSingle()
    if (e) throw e
    // `reglas_multas` solo se usa para heredar los días de gracia de las cuotas
    // cuando préstamos no tiene los suyos guardados.
    reglasInteresNatillera.value = parseReglasInteresPrestamo(n?.reglas_interes, {
      diasGraciaCuotas: n?.reglas_multas?.dias_gracia ?? 3
    })
    return n
  } catch (e) {
    console.warn('No se cargaron reglas de préstamo de la natillera:', e)
    reglasInteresNatillera.value = parseReglasInteresPrestamo(null)
    return null
  }
}

function aplicarDefaultsFormularioCrearPrestamo() {
  const r = reglasInteresNatillera.value
  formPrestamo.interes = r.porcentaje
  formPrestamo.numero_cuotas = r.plazo_maximo
}

function limitarNumeroCuotasCrearPrestamo() {
  const max = reglasInteresNatillera.value.plazo_maximo
  const n = Number(formPrestamo.numero_cuotas)
  if (!Number.isFinite(n)) return
  if (n < 1) formPrestamo.numero_cuotas = 1
  else if (n > max) formPrestamo.numero_cuotas = max
}

const formPrestamo = reactive({
  socio_natillera_id: '',
  monto: 100000,
  interes: reglasInteresNatillera.value.porcentaje,
  numero_cuotas: reglasInteresNatillera.value.plazo_maximo,
  tipo_interes: 'simple', // 'simple' o 'compuesto'
  periodicidad: 'mensual', // 'mensual' o 'quincenal'
  fecha_pago: getCurrentDateISO(), // Fecha de pago de la primera cuota
  medio_entrega: 'efectivo' // efectivo | transferencia (cómo se entrega el préstamo al socio)
})

const montoFormateado = ref('100.000')
const mostrarSelectorSocio = ref(false)
const busquedaSocio = ref('')
const mostrarInteresAnticipado = ref(false)
const modalNuevoPrestamoScrollRef = ref(null)
const modalCompartirPrestamoNuevoScrollRef = ref(null)
const hayMasContenidoAbajoModalNuevoPrestamo = ref(false)
/** Natiscroll — modal compartir proyección (WhatsApp) */
const hayNatiscrollModalProyeccion = ref(false)

let rafIndicadorScrollModalNuevoPrestamo = null
function actualizarIndicadorScrollModalNuevoPrestamo() {
  const el = modalNuevoPrestamoScrollRef.value
  if (!el) {
    hayMasContenidoAbajoModalNuevoPrestamo.value = false
    return
  }
  const umbral = 10
  hayMasContenidoAbajoModalNuevoPrestamo.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarActualizarIndicadorScrollModalNuevoPrestamo() {
  if (rafIndicadorScrollModalNuevoPrestamo != null) cancelAnimationFrame(rafIndicadorScrollModalNuevoPrestamo)
  rafIndicadorScrollModalNuevoPrestamo = requestAnimationFrame(() => {
    rafIndicadorScrollModalNuevoPrestamo = null
    actualizarIndicadorScrollModalNuevoPrestamo()
  })
}

let rafNatiscrollModalProyeccion = null
function actualizarNatiscrollModalProyeccion() {
  const el = modalCompartirPrestamoNuevoScrollRef.value
  if (!el) {
    hayNatiscrollModalProyeccion.value = false
    return
  }
  const umbral = 10
  hayNatiscrollModalProyeccion.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarNatiscrollModalProyeccion() {
  if (rafNatiscrollModalProyeccion != null) cancelAnimationFrame(rafNatiscrollModalProyeccion)
  rafNatiscrollModalProyeccion = requestAnimationFrame(() => {
    rafNatiscrollModalProyeccion = null
    actualizarNatiscrollModalProyeccion()
  })
}

function onScrollModalCompartirPrestamoNuevo() {
  programarNatiscrollModalProyeccion()
}

const modalCompartirPrestamoScrollRef = ref(null)
const hayNatiscrollModalCompartirPrestamo = ref(false)

let rafNatiscrollModalCompartirPrestamo = null
function actualizarNatiscrollModalCompartirPrestamo() {
  const el = modalCompartirPrestamoScrollRef.value
  if (!el) {
    hayNatiscrollModalCompartirPrestamo.value = false
    return
  }
  const umbral = 10
  hayNatiscrollModalCompartirPrestamo.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarNatiscrollModalCompartirPrestamo() {
  if (rafNatiscrollModalCompartirPrestamo != null) cancelAnimationFrame(rafNatiscrollModalCompartirPrestamo)
  rafNatiscrollModalCompartirPrestamo = requestAnimationFrame(() => {
    rafNatiscrollModalCompartirPrestamo = null
    actualizarNatiscrollModalCompartirPrestamo()
  })
}

function onScrollModalCompartirPrestamo() {
  programarNatiscrollModalCompartirPrestamo()
}

watch(modalCompartirPrestamo, async (abierto) => {
  if (!abierto) {
    hayNatiscrollModalCompartirPrestamo.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarNatiscrollModalCompartirPrestamo()
})

watch(
  [
    modalCompartirPrestamo,
    () => planPagosPrestamo.value.length,
    () => todosLosPlanesPagos.value.length,
    () => prestamoDetalle.value?.id
  ],
  () => {
    if (modalCompartirPrestamo.value) programarNatiscrollModalCompartirPrestamo()
  },
  { flush: 'post' }
)

const pasoNuevoPrestamo = ref(0) // 0: Monto (socio, periodicidad, monto) | 1: Plazo (interés, cuotas, fecha, medio) | 2: Resumen
const prestamoRecienCreado = ref(null) // { prestamo, planPagos } después de crear; null antes. Cuando no es null se muestra comprobante con Descargar/WhatsApp

watch(
  [modalNuevoPrestamo, pasoNuevoPrestamo, prestamoRecienCreado, mostrarInteresAnticipado],
  () => programarActualizarIndicadorScrollModalNuevoPrestamo(),
  { flush: 'post' }
)

// Apertura "fresca" del modal (desde los botones): resetea el wizard y carga defaults.
// OJO: no meter este reseteo en el watch de modalNuevoPrestamo, porque useModalStack
// oculta/restaura (false→true) este modal al abrir/cerrar el de compartir, y eso
// dispararía el reseteo perdiendo el paso actual y los datos del formulario.
async function abrirModalNuevoPrestamo() {
  if (soloLectura.value) return
  pasoNuevoPrestamo.value = 0
  prestamoRecienCreado.value = null
  modalNuevoPrestamo.value = true
  await cargarReglasPrestamoNatillera()
  aplicarDefaultsFormularioCrearPrestamo()
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalNuevoPrestamo()
}

watch(modalNuevoPrestamo, async (abierto) => {
  if (!abierto) {
    hayMasContenidoAbajoModalNuevoPrestamo.value = false
    return
  }
  // Re-apertura (p. ej. restauración desde el stack al cerrar «Compartir»):
  // solo recalcular el indicador de scroll, sin resetear el paso ni el formulario.
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalNuevoPrestamo()
})

watch(modalCompartirPrestamoNuevo, async (abierto) => {
  if (!abierto) {
    hayNatiscrollModalProyeccion.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarNatiscrollModalProyeccion()
})

const formAbono = reactive({
  valor: 0,
  fecha_pago: getCurrentDateISO(),
  tipo_pago: 'efectivo', // efectivo | transferencia
  valor_efectivo: 0,
  valor_transferencia: 0
})

const modalAbonoScrollRef = ref(null)
const hayMasContenidoAbajoModalAbono = ref(false)
let rafIndicadorScrollModalAbono = null
function actualizarIndicadorScrollModalAbono() {
  const el = modalAbonoScrollRef.value
  if (!el) {
    hayMasContenidoAbajoModalAbono.value = false
    return
  }
  const umbral = 10
  hayMasContenidoAbajoModalAbono.value =
    el.scrollTop + el.clientHeight < el.scrollHeight - umbral
}
function programarActualizarIndicadorScrollModalAbono() {
  if (rafIndicadorScrollModalAbono != null) cancelAnimationFrame(rafIndicadorScrollModalAbono)
  rafIndicadorScrollModalAbono = requestAnimationFrame(() => {
    rafIndicadorScrollModalAbono = null
    actualizarIndicadorScrollModalAbono()
  })
}

watch(
  [modalAbono, loading],
  () => programarActualizarIndicadorScrollModalAbono(),
  { flush: 'post' }
)

watch(
  () => formAbono.valor,
  () => {
    if (modalAbono.value) programarActualizarIndicadorScrollModalAbono()
  },
  { flush: 'post' }
)

watch(modalAbono, async (abierto) => {
  if (!abierto) {
    hayMasContenidoAbajoModalAbono.value = false
    return
  }
  await nextTick()
  await nextTick()
  programarActualizarIndicadorScrollModalAbono()
})

const formRefinanciar = reactive({
  fecha_pago: getCurrentDateISO(), // Nueva fecha de pago
  numero_cuotas_nuevo: null, // Número de cuotas para el refinanciamiento (no se suma al anterior)
  tipo_interes_nuevo: 'simple', // Tipo de interés: simple o compuesto
  interes_nuevo: null, // Nueva tasa de interés (opcional, si null usa la original)
  tabActual: 'refinanciar' // Tab actual: 'refinanciar'
})
const valorAbonoFormateado = ref('')
const valorAbonoEditadoFormateado = ref('')
const inputValorAbonoRef = ref(null)
const comprobanteAbono = ref(null)

// ── Mora en el abono ───────────────────────────────────────────────
// El pago cubre PRIMERO la mora acumulada (va al fondo) y el resto baja el saldo
// de capital+interés. El saldo nunca capitaliza la mora.
/*
 * Fecha a la que se liquida la mora del abono: la que el usuario registra como
 * fecha de pago, no «hoy». Un pago que se anota tarde (el socio pagó el 5 y se
 * registra el 12) debe cobrar la mora hasta el 5; uno con fecha posterior,
 * hasta esa fecha. Si el campo está vacío o es inválido, se cae a hoy.
 */
const fechaCorteAbono = computed(() => {
  const f = formAbono.fecha_pago ? parseDateLocal(formAbono.fecha_pago) : null
  const corte = f && !Number.isNaN(f.getTime()) ? f : new Date()
  corte.setHours(0, 0, 0, 0)
  return corte
})
// Mora del préstamo a la fecha de pago (no la acumulada «a hoy» del listado), más la que
// quedó pendiente de abonos anteriores.
const moraPrestamoAbono = computed(() => Math.round(calcularMoraPrestamo(
  prestamoSeleccionado.value?.cuotasVencidasOrdenadas,
  reglasInteresNatillera.value.tasa_mora,
  fechaCorteAbono.value,
  diasGraciaPrestamos.value
)) + moraPendienteGuardada(prestamoSeleccionado.value?.cuotasConMoraPendiente))
const saldoPrestamoAbono = computed(() => parseFloat(prestamoSeleccionado.value?.saldo_actual) || 0)
// Total a pagar (dinámico): saldo pendiente + mora a la fecha de pago
const totalAPagarConMora = computed(() => saldoPrestamoAbono.value + moraPrestamoAbono.value)
// Desglose del abono: primero el interés de mora (va a utilidades), proporcional a la(s)
// cuota(s) que se pagan; el resto se abona al préstamo.
const desgloseAbono = computed(() => desglosarAbono({
  valor: formAbono.valor,
  cuotasVencidasOrdenadas: prestamoSeleccionado.value?.cuotasVencidasOrdenadas,
  cuotasConMoraPendiente: prestamoSeleccionado.value?.cuotasConMoraPendiente,
  tasaMora: reglasInteresNatillera.value.tasa_mora,
  fechaCorte: fechaCorteAbono.value,
  diasGracia: diasGraciaPrestamos.value,
  cobrarMora: true
}))
const moraPagadaAbono = computed(() => desgloseAbono.value.moraPagada)
const abonoACapitalAbono = computed(() => desgloseAbono.value.abonoAPrestamo)
const saldoDespuesAbono = computed(() => Math.max(0, saldoPrestamoAbono.value - abonoACapitalAbono.value))
const generandoImagenComprobante = ref(false)
const comprobanteRef = ref(null)

// Comprobante de préstamo PAGADO (total pagado + lista de abonos)
const comprobantePagado = ref(null)
const comprobantePagadoRef = ref(null)
const generandoImagenComprobantePagado = ref(false)

/** Borrador en sessionStorage si el navegador recarga al volver de otra app (móvil). */
function prestamosWorkDraftKey() {
  const uid = authStore.user?.id || 'anon'
  return `natillerapp:prestamos-work:${uid}:${id}`
}

function clearPrestamosWorkDraft() {
  try {
    sessionStorage.removeItem(prestamosWorkDraftKey())
  } catch {
    /* ignore */
  }
}

function getPrestamosWorkDraftPayload() {
  const natilleraId = String(id)
  if (modalComprobanteAbono.value && comprobanteAbono.value) {
    const c = comprobanteAbono.value
    return {
      kind: 'comprobante',
      natilleraId,
      comprobante: {
        pagoPrestamoId: c.pagoPrestamoId,
        prestamoId: c.prestamoId,
        valor: c.valor,
        codigoComprobante: c.codigoComprobante,
        socioNombre: c.socioNombre,
        socioTelefono: c.socioTelefono,
        fecha: c.fecha,
        saldoAnterior: c.saldoAnterior,
        saldoNuevo: c.saldoNuevo
      }
    }
  }
  if (modalAbono.value && prestamoSeleccionado.value?.id) {
    return {
      kind: 'abono',
      natilleraId,
      prestamoId: prestamoSeleccionado.value.id,
      formAbono: {
        valor: formAbono.valor,
        fecha_pago: formAbono.fecha_pago,
        tipo_pago: formAbono.tipo_pago,
        valor_efectivo: formAbono.valor_efectivo,
        valor_transferencia: formAbono.valor_transferencia
      },
      valorAbonoFormateado: valorAbonoFormateado.value || ''
    }
  }
  return null
}

useSessionDraftPersistence(prestamosWorkDraftKey, getPrestamosWorkDraftPayload)

function tryRestorePrestamosWorkDraft() {
  try {
    const raw = sessionStorage.getItem(prestamosWorkDraftKey())
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.v !== 1 || String(data.natilleraId) !== String(id)) return
    const maxAge = 48 * 60 * 60 * 1000
    if (data.savedAt && Date.now() - data.savedAt > maxAge) {
      clearPrestamosWorkDraft()
      return
    }

    if (data.kind === 'abono' && data.prestamoId) {
      if (soloLectura.value) {
        clearPrestamosWorkDraft()
        return
      }
      const p = prestamos.value.find((x) => x.id === data.prestamoId)
      if (!p) {
        clearPrestamosWorkDraft()
        return
      }
      prestamoSeleccionado.value = p
      if (data.formAbono) {
        Object.assign(formAbono, {
          valor: data.formAbono.valor ?? 0,
          fecha_pago: data.formAbono.fecha_pago || getCurrentDateISO(),
          tipo_pago: data.formAbono.tipo_pago || 'efectivo',
          valor_efectivo: data.formAbono.valor_efectivo ?? 0,
          valor_transferencia: data.formAbono.valor_transferencia ?? 0
        })
      }
      valorAbonoFormateado.value =
        data.valorAbonoFormateado || formatMoney(formAbono.valor || 0)
      modalAbono.value = true
      nextTick(() => {
        notificationStore.info(
          'Se recuperó el abono que estabas registrando. Revisa los datos y confirma.',
          'Borrador guardado'
        )
      })
      return
    }

    if (data.kind === 'comprobante' && data.comprobante) {
      const c = data.comprobante
      const prestamoFromList =
        c.prestamoId && prestamos.value.find((x) => x.id === c.prestamoId)
      comprobanteAbono.value = {
        ...c,
        prestamo: prestamoFromList || null
      }
      modalComprobanteAbono.value = true
      nextTick(() => {
        notificationStore.info(
          'Se recuperó el comprobante de abono. Puedes compartirlo o descargarlo.',
          'Borrador guardado'
        )
      })
    }
  } catch {
    clearPrestamosWorkDraft()
  }
}

watch(modalComprobanteAbono, (open, wasOpen) => {
  if (wasOpen && !open) {
    clearPrestamosWorkDraft()
    comprobanteAbono.value = null
  }
})

const totalPrestado = computed(() => 
  prestamos.value.reduce((sum, p) => sum + p.monto, 0)
)

const totalIntereses = computed(() => interesesGanadosUtilidades.value)

/**
 * Intereses ganados por los préstamos de la natillera.
 *
 * Se CALCULA con `calcularUtilidadesReales`, la misma pieza que usan el desglose de
 * utilidades y el cierre. Antes se sumaban las filas de `utilidades_clasificadas` con
 * `id_actividad`, y eso daba dos problemas: se dejaba fuera el interés de mora —que va en
 * una fila aparte, sin préstamo asociado— y arrastraba cualquier desviación del acumulador,
 * así que esta tarjeta y el desglose mostraban cifras distintas del mismo dinero.
 */
async function obtenerTotalInteresesPrestamos(natilleraId) {
  if (!natilleraId) return 0
  const { porTipo, error } = await calcularUtilidadesReales(natilleraId)
  if (error) console.error('Error obteniendo utilidades de préstamos:', error)
  return porTipo?.prestamos || 0
}

async function actualizarInteresPrestamo(natilleraId, prestamoId, interes, tipo = 'anticipado', esNuevo = true, esRefinanciacion = false, formaPago = null) {
  const data = await guardarInteresPrestamo(natilleraId, prestamoId, interes, tipo, esNuevo, esRefinanciacion, formaPago)
  if (!data) return null
  // Actualizar el ref con el total de todos los préstamos
  interesesGanadosUtilidades.value = await obtenerTotalInteresesPrestamos(natilleraId)
  return data
}

async function eliminarInteresPrestamo(natilleraId, prestamoId) {
  // Eliminar el registro individual del préstamo
  const { error } = await supabase
    .from('utilidades_clasificadas')
    .delete()
    .eq('natillera_id', natilleraId)
    .eq('tipo', 'prestamos')
    .eq('id_actividad', prestamoId)
    .is('fecha_cierre', null)

  if (error) {
    console.error('Error eliminando interés de préstamo:', error)
    return
  }

  // Actualizar el ref con el total de todos los préstamos restantes
  const totalIntereses = await obtenerTotalInteresesPrestamos(natilleraId)
  interesesGanadosUtilidades.value = totalIntereses
}

const totalPagado = computed(() => {
  // El total pagado es la suma del campo valor_cuota de las cuotas pagadas (pagada = true)
  // Solo considera préstamos de la natillera actual
  return todosLosPlanesPagos.value
    .filter(cuota => cuota.pagada === true)
    .reduce((sum, cuota) => {
      return sum + parseFloat(cuota.valor_cuota || 0)
    }, 0)
})

// Secciones «Por cobrar» (todo lo que no está pagado: activos + en mora) y «Pagados»
const prestamosPorCobrar = computed(() =>
  prestamos.value.filter(p => p.estado !== 'pagado')
)
const prestamosPagados = computed(() =>
  prestamos.value.filter(p => p.estado === 'pagado')
)
// Lista mostrada según la pestaña activa
const prestamosFiltrados = computed(() =>
  tabPrestamos.value === 'pagados' ? prestamosPagados.value : prestamosPorCobrar.value
)
// Totales por sección (para el resumen de la cabecera del panel)
const saldoPorCobrar = computed(() =>
  prestamosPorCobrar.value.reduce((s, p) => s + saldoConMora(p), 0)
)
// «Total pagado» de la sección Pagados: misma métrica que el indicador global
// (suma de valor_cuota de cuotas pagadas = capital + interés), pero acotada a los
// préstamos ya pagados. Así es un subconjunto real del indicador «Total Pagado».
const montoPagadosSeccion = computed(() => {
  const idsPagados = new Set(prestamosPagados.value.map(p => p.id))
  return todosLosPlanesPagos.value
    .filter(c => c.pagada === true && idsPagados.has(c.prestamo_id))
    .reduce((s, c) => s + parseFloat(c.valor_cuota || 0), 0)
})

// Vista previa del refinanciamiento
// Tasa elegida al refinanciar: vacía = la del préstamo
function tasaRefinanciacionElegida(prestamo) {
  const t = formRefinanciar.interes_nuevo
  return t === null || t === undefined || t === '' ? (parseFloat(prestamo?.interes) || 0) : Number(t)
}

const vistaPreviaRefinanciacion = computed(() => {
  const prestamo = prestamoSeleccionado.value
  const totalCuotas = Number(formRefinanciar.numero_cuotas_nuevo) || 0
  if (!prestamo || !formRefinanciar.fecha_pago || totalCuotas <= 0) return null
  if ((parseFloat(prestamo.saldo_actual) || 0) <= 0) return null

  const tasaInteres = tasaRefinanciacionElegida(prestamo)
  const tipoInteres = formRefinanciar.tipo_interes_nuevo || prestamo.tipo_interes || 'simple'
  const refinanciacion = calcularRefinanciacion({
    prestamo,
    plan: planDePrestamo(prestamo),
    fechaCorte: getCurrentDateISO(),
    tasaMensual: tasaInteres,
    numeroCuotas: totalCuotas,
    tipoInteres
  })
  return {
    ...refinanciacion,
    totalCuotas,
    tasaInteres,
    tipoInteres,
    moraPendiente: Math.round(prestamo.moraAcumulada || 0)
  }
})

// Calcular liquidación a fecha

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function etiquetaPeriodoCuotaPrestamo(cuota, periodicidad) {
  if (!cuota) return null
  let mes = cuota.mes
  let anio = cuota.anio
  let quincena = cuota.quincena
  // Si falta cualquier dato (mes, anio o quincena cuando es quincenal), derivar de fecha_proyectada.
  if (mes == null || anio == null || ((periodicidad || 'mensual') === 'quincenal' && quincena == null)) {
    if (cuota.fecha_proyectada) {
      const d = parseDateLocal(cuota.fecha_proyectada) || new Date(cuota.fecha_proyectada)
      if (!isNaN(d.getTime())) {
        if (mes == null) mes = d.getMonth() + 1
        if (anio == null) anio = d.getFullYear()
        if (quincena == null) quincena = d.getDate() <= 15 ? 1 : 2
      }
    }
  }
  if (mes == null || anio == null) return null
  const nombreMes = MESES_ES[mes - 1] || ''
  if ((periodicidad || 'mensual') === 'quincenal') {
    const q = quincena === 2 ? '2da' : '1ra'
    return `${q} quincena ${nombreMes} ${anio}`
  }
  return `${nombreMes} ${anio}`
}

// Determina la forma de pago de un abono usando el desglose efectivo/transferencia.
function formaPagoAbono(pago) {
  if (!pago) return null
  const ef = parseFloat(pago.valor_efectivo) || 0
  const tr = parseFloat(pago.valor_transferencia) || 0
  if (ef > 0 && tr > 0) return 'mixto'
  if (ef > 0) return 'efectivo'
  if (tr > 0) return 'transferencia'
  return null
}

const FORMA_PAGO_ABONO_ESTILO = {
  efectivo: { label: 'Efectivo', icon: '💵', clase: 'bg-green-50 text-green-700 border-green-200/70' },
  transferencia: { label: 'Transferencia', icon: '🏦', clase: 'bg-blue-50 text-blue-700 border-blue-200/70' },
  mixto: { label: 'Mixto', icon: '🔀', clase: 'bg-purple-50 text-purple-700 border-purple-200/70' }
}

const cuotaPorNumeroMap = computed(() => {
  const map = new Map()
  for (const c of (planPagosPrestamo.value || [])) {
    if (c.numero_cuota != null) map.set(c.numero_cuota, c)
  }
  return map
})

function periodosDeNumerosCuota(numerosCuota) {
  if (!Array.isArray(numerosCuota) || numerosCuota.length === 0) return []
  // Mostrar quincena (1ra/2da) si el socio en la natillera es quincenal o si el préstamo lo es.
  const periodicidadSocio = prestamoDetalle.value?.socio_natillera?.periodicidad
  const periodicidadPrestamo = prestamoDetalle.value?.periodicidad
  const periodicidad = (periodicidadSocio === 'quincenal' || periodicidadPrestamo === 'quincenal')
    ? 'quincenal'
    : (periodicidadPrestamo || periodicidadSocio || 'mensual')
  const labels = []
  const seen = new Set()
  for (const n of numerosCuota) {
    const cuota = cuotaPorNumeroMap.value.get(n)
    const label = etiquetaPeriodoCuotaPrestamo(cuota, periodicidad)
    if (label && !seen.has(label)) {
      seen.add(label)
      labels.push(label)
    }
  }
  return labels
}

function formatCurrencyInput(value) {
  // Remover todos los caracteres no numéricos
  const numericValue = String(value).replace(/\D/g, '')
  // Formatear como número
  if (!numericValue) return ''
  return formatMoney(parseInt(numericValue))
}

// Campo Monto: el primer toque selecciona todo (para reemplazar el valor de un golpe);
// con el campo ya enfocado, tocar deja el cursor donde se tocó.
let montoSeleccionarAlTocar = false

function alPresionarMonto(event) {
  montoSeleccionarAlTocar = document.activeElement !== event.target
}

function seleccionarTodoMonto(event) {
  // setSelectionRange y no select(): en iOS select() a veces no marca el texto
  const input = event.target
  input.setSelectionRange(0, input.value.length)
}

function alTocarMonto(event) {
  // En iOS/Android el toque que enfoca coloca el cursor DESPUÉS del focus y deshace la
  // selección; por eso se vuelve a seleccionar aquí, solo en ese primer toque.
  if (!montoSeleccionarAlTocar) return
  montoSeleccionarAlTocar = false
  seleccionarTodoMonto(event)
}

function actualizarMonto(event) {
  const input = event.target
  // Dígitos a la izquierda del cursor: al reformatear con puntos de miles el cursor
  // debe quedar tras el mismo dígito, no saltar al final.
  const digitosAntesDelCursor = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, '').length

  // Obtener el valor del input sin formatear
  const valorSinFormato = input.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    formPrestamo.monto = 0
    montoFormateado.value = ''
    return
  }
  
  // Convertir a número
  const numero = parseInt(valorSinFormato)
  
  // Validar que sea un número válido
  if (isNaN(numero)) {
    return
  }
  
  // Actualizar el valor numérico
  formPrestamo.monto = numero
  
  // Formatear para mostrar en el input
  const formateado = formatMoney(numero)
  montoFormateado.value = formateado
  // Vue reescribe el value en el siguiente render; el cursor se recoloca después
  nextTick(() => {
    if (document.activeElement !== input) return
    let posicion = 0
    let digitos = 0
    while (posicion < formateado.length && digitos < digitosAntesDelCursor) {
      if (/\d/.test(formateado[posicion])) digitos++
      posicion++
    }
    input.setSelectionRange(posicion, posicion)
  })
}

const socioSeleccionado = computed(() => {
  return socios.value.find(s => s.id === formPrestamo.socio_natillera_id)
})

/** Suma valor_cuota de cuotas pagadas (misma base que el resto de la app; solo informativo) */
const totalAhorradoInformativoSocio = ref(null)
const cargandoTotalAhorradoSocio = ref(false)

async function cargarTotalAhorradoInformativoSocio(socioNatilleraId) {
  totalAhorradoInformativoSocio.value = null
  if (!socioNatilleraId) return
  cargandoTotalAhorradoSocio.value = true
  try {
    const { data: cuotas, error } = await supabase
      .from('cuotas')
      .select('estado, valor_cuota')
      .eq('socio_natillera_id', socioNatilleraId)
    if (error) throw error
    const total = (cuotas || [])
      .filter((c) => c.estado === 'pagada')
      .reduce((sum, c) => sum + (Number(c.valor_cuota) || 0), 0)
    totalAhorradoInformativoSocio.value = total
  } catch (e) {
    console.error('Error cargando total ahorrado del socio:', e)
    totalAhorradoInformativoSocio.value = null
  } finally {
    cargandoTotalAhorradoSocio.value = false
  }
}

watch(
  () => formPrestamo.socio_natillera_id,
  (sid) => {
    void cargarTotalAhorradoInformativoSocio(sid)
  },
  { immediate: true }
)

const sociosFiltrados = computed(() => {
  if (!busquedaSocio.value) return socios.value
  const busqueda = busquedaSocio.value.toLowerCase()
  return socios.value.filter(s => 
    s.socio?.nombre?.toLowerCase().includes(busqueda) ||
    s.socio?.email?.toLowerCase().includes(busqueda) ||
    s.socio?.telefono?.includes(busqueda)
  )
})

// Capital que se va a prestar (siempre es el monto ingresado, igual en ambos casos)
const capitalAPrestar = computed(() => {
  return formPrestamo.monto || 0
})

// El interés se calcula SIEMPRE igual (como interés normal: simple o compuesto).
// La única diferencia entre anticipado y normal es CUÁNDO se suma a utilidades:
// - Anticipado: todo el interés se suma a utilidades al crear el préstamo.
// - Normal: el interés se va sumando a utilidades al pagar cada cuota (proporcional por cuota).
const interesTotal = computed(() => {
  if (!capitalAPrestar.value || !formPrestamo.interes || !formPrestamo.numero_cuotas) return 0
  return calcularCondicionesPrestamo({
    capital: capitalAPrestar.value,
    tasaMensual: formPrestamo.interes,
    numeroCuotas: formPrestamo.numero_cuotas,
    periodicidad: formPrestamo.periodicidad || 'mensual',
    tipoInteres: formPrestamo.tipo_interes
  }).interesTotal
})

// Total a pagar por el socio: capital + intereses (igual para anticipado y normal)
const montoTotal = computed(() => {
  return capitalAPrestar.value + interesTotal.value
})

// El interés es el mismo para normal y anticipado, solo cambia cuándo se cobra
// Ya está calculado en interesTotal, no necesitamos una variable separada

// Calcular capital necesario para obtener un monto exacto a recibir (interés anticipado)
function calcularCapitalNecesario(montoARecibir, tasaMensual, cuotas, tipoInteres) {
  if (!montoARecibir || !tasaMensual || !cuotas || montoARecibir <= 0) return 0
  
  if (tipoInteres === 'simple') {
    // Monto a recibir = Capital × (1 - tasa × meses)
    // Capital = Monto a recibir / (1 - tasa × meses)
    const divisor = 1 - (tasaMensual * cuotas)
    if (divisor <= 0) return 0 // Evitar división por cero o negativa
    return montoARecibir / divisor
  } else {
    // Interés compuesto anticipado:
    // Monto a recibir = Capital - Capital × ((1 + tasa)^meses - 1)
    // Monto a recibir = Capital × (2 - (1 + tasa)^meses)
    // Capital = Monto a recibir / (2 - (1 + tasa)^meses)
    const factor = Math.pow(1 + tasaMensual, cuotas)
    const divisor = 2 - factor
    if (divisor <= 0) return 0 // Evitar división por cero o negativa
    return montoARecibir / divisor
  }
}

// El socio recibe el capital completo en normal y en anticipado: el anticipado NO descuenta
// el interés del desembolso, solo adelanta cuándo ese interés entra a las utilidades.
const montoARecibir = computed(() => capitalAPrestar.value)

// Del fondo sale el capital en los dos casos
const movimientoFondoInicio = computed(() => capitalAPrestar.value)

// Valor total a pagar por el socio
const montoAPagar = computed(() => {
  // Con interés anticipado, el socio debe pagar capital + intereses
  // Con interés normal, el total a pagar es capital + intereses
  return montoTotal.value
})

// Cuota mensual: con anticipado solo se divide el capital, con normal se divide el total
const proximaCuotaPago = computed(() => {
  if (!planPagosPrestamo.value || planPagosPrestamo.value.length === 0) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const cuotasPendientes = planPagosPrestamo.value
    .filter(c => !c.pagada && parseDateLocal(c.fecha_proyectada) >= hoy)
    .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
  return cuotasPendientes.length > 0 ? cuotasPendientes[0] : null
})

// Helper para verificar si una fecha está vencida (para usar en el template)
function esFechaVencida(fecha) {
  if (!fecha) return false
  const fechaParsed = parseDateLocal(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fechaParsed.setHours(0, 0, 0, 0)
  return fechaParsed < hoy
}

/*
 * Estado del préstamo en palabras para el detalle. «activo» es un valor de la base, no
 * algo que se le diga a nadie: un préstamo con saldo es «Pendiente» (la mora va en su
 * propia etiqueta), y sin saldo es «Pagado».
 */
const estadoPrestamoDetalle = computed(() =>
  prestamoDetalle.value?.estado === 'pagado'
    ? { texto: 'Pagado', clase: 'ds-badge--success' }
    : { texto: 'Pendiente', clase: 'ds-badge--warning' }
)
const cuotasPagadasDetalle = computed(() => planPagosPrestamo.value.filter(c => c.pagada).length)
const cuotasVencidasDetalle = computed(() =>
  planPagosPrestamo.value.filter(c => !c.pagada && esFechaVencida(c.fecha_proyectada)).length
)
const porcentajeCuotasDetalle = computed(() => {
  const total = planPagosPrestamo.value.length
  return total > 0 ? Math.round((cuotasPagadasDetalle.value / total) * 100) : 0
})

/*
 * Cuánto del saldo es capital y cuánto intereses, sacado del plan: de cada cuota sin
 * pagar se toma lo que falta y se reparte en la misma proporción capital/interés de la
 * cuota. Sin plan no hay de dónde sacarlo y no se muestra.
 */
/*
 * Lo que de verdad se debe: el saldo del préstamo (capital + intereses del plan) más el
 * interés de mora acumulado. La mora no baja ni sube `saldo_actual` —se cobra aparte y va
 * al fondo—, pero es plata que el socio debe, así que el saldo que se muestra la incluye.
 */
function saldoConMora(prestamo) {
  if (!prestamo) return 0
  return (parseFloat(prestamo.saldo_actual) || 0) + (Number(prestamo.moraAcumulada) || 0)
}

function desgloseSaldoPrestamo(prestamoId) {
  const plan = prestamoDetalle.value?.id === prestamoId && planPagosPrestamo.value.length > 0
    ? planPagosPrestamo.value
    : todosLosPlanesPagos.value.filter(c => c.prestamo_id === prestamoId)
  if (!plan.length) return null
  let capital = 0
  let interes = 0
  for (const cuota of plan) {
    if (cuota.pagada) continue
    const valor = parseFloat(cuota.valor_cuota) || 0
    const falta = Math.max(0, valor - (parseFloat(cuota.valor_pagado) || 0))
    if (valor <= 0 || falta <= 0) continue
    const proporcionInteres = (parseFloat(cuota.interes) || 0) / valor
    interes += falta * proporcionInteres
    capital += falta * (1 - proporcionInteres)
  }
  if (capital + interes <= 0) return null
  // El plan redondea cada cuota a pesos y puede diferir del saldo en unos pocos: se toma
  // el interés del plan y el capital como lo que falta, así la suma cuadra con el saldo.
  const prestamo = prestamos.value.find(p => p.id === prestamoId) ||
    (prestamoDetalle.value?.id === prestamoId ? prestamoDetalle.value : null)
  const mora = Math.round(Number(prestamo?.moraAcumulada) || 0)
  const saldo = parseFloat(prestamo?.saldo_actual)
  const interesRedondo = Math.round(interes)
  if (Number.isFinite(saldo) && saldo > 0) {
    const interesAjustado = Math.min(interesRedondo, Math.round(saldo))
    return { capital: Math.round(saldo) - interesAjustado, interes: interesAjustado, mora }
  }
  return { capital: Math.round(capital), interes: interesRedondo, mora }
}

/** Etiqueta y colores de una cuota del plan en el detalle (lista y círculo del número). */
/*
 * Un solo estado para el detalle, en palabras: pagado, en mora (con cuántas cuotas) o al día.
 * Antes había tres etiquetas a la vez (estado, cuotas vencidas, medio de entrega).
 */
const estadoResumenDetalle = computed(() => {
  const p = prestamoDetalle.value
  if (!p) return { texto: '', clase: 'ds-badge--muted', alerta: false }
  if (p.estado === 'pagado') return { texto: 'Pagado', clase: 'ds-badge--success', alerta: false }
  const vencidas = cuotasVencidasDetalle.value
  if (vencidas > 0) {
    return { texto: `En mora · ${vencidas} ${vencidas === 1 ? 'cuota vencida' : 'cuotas vencidas'}`, clase: 'ds-badge--danger', alerta: true }
  }
  if ((p.moraAcumulada || 0) > 0) return { texto: 'En mora · intereses', clase: 'ds-badge--danger', alerta: true }
  return { texto: 'Al día', clase: 'ds-badge--success', alerta: false }
})

// Si el préstamo fue refinanciado, lo que manda es cómo se pactó al inicio.
const interesAnticipadoDetalle = computed(() => {
  const p = prestamoDetalle.value
  if (!p) return false
  if (typeof p.interes_anticipado_inicial === 'boolean') return p.interes_anticipado_inicial || !!p.interes_anticipado
  return !!p.interes_anticipado
})

const opcionesPestanaDetalle = computed(() => [
  { value: 'plan', label: `Plan (${planPagosPrestamo.value.length})` },
  { value: 'abonos', label: `Abonos (${pagosCicloActual.value.length})` },
  { value: 'condiciones', label: 'Condiciones' }
])

function estadoCuotaDetalle(cuota) {
  if (cuota.pagada) return { texto: 'Pagada', clase: 'ds-badge--success', circulo: 'bg-[#E8F5E9] text-[#1B5E37]' }
  if (parseFloat(cuota.valor_pagado || 0) > 0) return { texto: 'Parcial', clase: 'ds-badge--warning', circulo: 'bg-amber-100 text-amber-800' }
  if (esFechaVencida(cuota.fecha_proyectada)) return { texto: 'Vencida', clase: 'ds-badge--danger', circulo: 'bg-red-100 text-red-700' }
  return { texto: 'Pendiente', clase: 'ds-badge--muted', circulo: 'bg-gray-100 text-gray-600' }
}

function cuotaPagadaCompletaComprobante(cuota) {
  if (!cuota) return false
  if (cuota.pagada === true) return true
  const vc = parseFloat(cuota.valor_cuota || 0)
  const vp = parseFloat(cuota.valor_pagado || 0)
  if (vc <= 0) return false
  return vp >= vc - 0.009
}

function etiquetaEstadoCuotaComprobante(cuota) {
  if (cuotaPagadaCompletaComprobante(cuota)) return 'Pagada'
  const vp = parseFloat(cuota.valor_pagado || 0)
  if (vp > 0) return 'Parcial'
  if (esFechaVencida(cuota.fecha_proyectada)) return 'Vencida'
  return 'Pendiente'
}

// Mora acumulada a hoy de UNA cuota del plan (para mostrarla en el comprobante).
function moraCuotaComprobante(cuota) {
  return Math.round(calcularMoraCuota(cuota, reglasInteresNatillera.value.tasa_mora, new Date(), diasGraciaPrestamos.value))
}

function estiloBadgeEstadoCuotaComprobante(cuota) {
  const e = etiquetaEstadoCuotaComprobante(cuota)
  const base = {
    fontSize: '9px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '9999px',
    display: 'inline-block',
    whiteSpace: 'nowrap'
  }
  if (e === 'Pagada') return { ...base, background: '#d1fae5', color: '#059669' }
  if (e === 'Parcial') return { ...base, background: '#dbeafe', color: '#1d4ed8' }
  if (e === 'Vencida') return { ...base, background: '#fef3c7', color: '#b45309' }
  return { ...base, background: '#f3f4f6', color: '#4b5563' }
}

/** Plan para el comprobante de préstamo existente: detalle cargado o fallback del listado global. */
const planPagosComprobanteExistente = computed(() => {
  const pid = prestamoDetalle.value?.id
  if (!pid) return []
  let rows =
    planPagosPrestamo.value.length > 0
      ? [...planPagosPrestamo.value]
      : todosLosPlanesPagos.value.filter((c) => c.prestamo_id === pid)
  return rows.sort((a, b) => (Number(a.numero_cuota) || 0) - (Number(b.numero_cuota) || 0))
})

/** Al día / en mora (N cuotas) junto al socio en el comprobante; si no hay plan, usa cuotasVencidas del listado. */
const resumenMoraComprobanteExistente = computed(() => {
  if (prestamoDetalle.value?.estado === 'pagado') {
    return { tipo: 'pagado', texto: 'Pagado' }
  }
  const plan = planPagosComprobanteExistente.value
  let cuotasMora = 0
  if (plan.length > 0) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    cuotasMora = plan.filter((cuota) => {
      if (cuotaPagadaCompletaComprobante(cuota)) return false
      const fv = parseDateLocal(cuota.fecha_proyectada)
      if (isNaN(fv.getTime())) return false
      fv.setHours(0, 0, 0, 0)
      return fv < hoy
    }).length
  } else {
    const pid = prestamoDetalle.value?.id
    const fila = prestamos.value.find((p) => p.id === pid)
    cuotasMora = Number(fila?.cuotasVencidas) || 0
  }
  if (cuotasMora > 0) {
    return {
      tipo: 'mora',
      texto: cuotasMora === 1 ? 'En mora · 1 cuota' : `En mora · ${cuotasMora} cuotas`,
      cuotasMora
    }
  }
  // Sin cuotas vencidas pero con intereses de mora sin pagar: sigue en mora.
  const moraPend = (plan.length > 0 ? plan : []).reduce((t, c) => t + (parseFloat(c.mora_pendiente) || 0), 0)
  if (moraPend > 0) return { tipo: 'mora', texto: 'En mora · intereses', cuotasMora: 0 }
  return { tipo: 'aldia', texto: 'Al día', cuotasMora: 0 }
})

const estiloAvisoMoraComprobanteExistente = computed(() => {
  const t = resumenMoraComprobanteExistente.value.tipo
  const base = {
    flexShrink: 0,
    alignSelf: 'center',
    fontSize: '12px',
    fontWeight: 800,
    padding: '7px 12px',
    borderRadius: '9999px',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    maxWidth: '16rem',
    textAlign: 'center',
    letterSpacing: '0.02em'
  }
  if (t === 'mora') {
    return { ...base, background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }
  }
  if (t === 'pagado') {
    return { ...base, background: '#d1fae5', color: '#047857', border: '1px solid #6ee7b7' }
  }
  return { ...base, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }
})

const cuotaMensual = computed(() => {
  // La cuota sale del plan proyectado: en compuesto (francés) la última puede variar unos pesos
  return planPagosComprobanteNuevo.value[0]?.valor_cuota ?? montoTotal.value / formPrestamo.numero_cuotas
})

// Plan de pagos de vista previa para el comprobante (préstamo nuevo)
const planPagosComprobanteNuevo = computed(() => {
  if (!formPrestamo.monto || !formPrestamo.numero_cuotas) return []
  const prestamoVirtual = {
    id: 0,
    monto: parseFloat(formPrestamo.monto) || 0,
    numero_cuotas: parseInt(formPrestamo.numero_cuotas) || 1,
    interes: parseFloat(formPrestamo.interes) || 0,
    fecha_inicio: formPrestamo.fecha_pago || new Date().toISOString().slice(0, 10),
    periodicidad: formPrestamo.periodicidad || 'mensual',
    tipo_interes: formPrestamo.tipo_interes || 'simple',
    interes_anticipado: mostrarInteresAnticipado.value,
    interes_total: interesTotal.value
  }
  return generarPlanPagos(prestamoVirtual)
})

watch(planPagosComprobanteNuevo, () => {
  if (modalCompartirPrestamoNuevo.value) programarNatiscrollModalProyeccion()
}, { flush: 'post' })

// Datos del comprobante cuando el préstamo ya fue creado (vista después de Confirmar en el footer)
const datosComprobanteCreado = computed(() => {
  const p = prestamoRecienCreado.value
  if (!p?.prestamo) return null
  const prestamo = p.prestamo
  const plan = p.planPagos || []
  const monto = Number(prestamo.monto) || 0
  const interesTotalVal = Number(prestamo.interes_total) || 0
  const cuota = plan.length > 0 ? plan[0].valor_cuota : 0
  const totalAPagar = Math.round(monto + interesTotalVal)
  return {
    monto,
    nombreSocio: prestamo.socio_natillera?.socio?.nombre || 'Socio',
    interes: prestamo.interes,
    numero_cuotas: prestamo.numero_cuotas || 1,
    cuotaMensual: cuota,
    totalAPagar,
    interesTotal: interesTotalVal,
    planPagos: plan,
    fecha_pago: plan[0]?.fecha_proyectada || prestamo.created_at
  }
})

// Ticket del modal «Compartir por WhatsApp».
// Antes de crear → proyección (valores del formulario). Después de crear → comprobante real.
const esComprobanteRealCompartir = computed(() => !!prestamoRecienCreado.value)
const ticketCompartir = computed(() => {
  const creado = datosComprobanteCreado.value
  if (creado) {
    return {
      titulo: 'Comprobante de préstamo',
      subtituloDetalles: 'DETALLES DEL PRÉSTAMO',
      tituloPlan: 'PLAN DE PAGOS',
      etiquetaFechaPlan: 'Fecha de primera cuota',
      monto: creado.monto,
      nombreSocio: creado.nombreSocio,
      interes: creado.interes,
      numero_cuotas: creado.numero_cuotas,
      cuota: creado.cuotaMensual,
      totalAPagar: creado.totalAPagar,
      interesTotal: creado.interesTotal,
      fechaPrimera: creado.fecha_pago,
      plan: creado.planPagos
    }
  }
  return {
    titulo: 'Proyección de préstamo',
    subtituloDetalles: 'DETALLES PROYECTADOS',
    tituloPlan: 'PLAN DE PAGOS (PROYECTADO)',
    etiquetaFechaPlan: 'Fecha estimada de primera cuota',
    monto: parseFloat(formPrestamo.monto) || 0,
    nombreSocio: socioSeleccionado.value?.socio?.nombre,
    interes: formPrestamo.interes,
    numero_cuotas: formPrestamo.numero_cuotas || 1,
    cuota: cuotaMensual.value,
    totalAPagar: Math.round(montoTotal.value),
    interesTotal: interesTotal.value,
    fechaPrimera: formPrestamo.fecha_pago,
    plan: planPagosComprobanteNuevo.value
  }
})

// Sin scroll automático al cambiar tipo de interés o fecha: evitaba el salto y desmaquetado del modal

// Calcular cuota mensual para el detalle del préstamo
/**
 * Plan de pagos de un préstamo, esté donde esté cargado: el del detalle abierto
 * o el del listado global (que trae los planes de toda la natillera).
 */
function planDePrestamo(prestamo) {
  const pid = prestamo?.id
  if (!pid) return []
  if (prestamoDetalle.value?.id === pid && planPagosPrestamo.value.length > 0) return planPagosPrestamo.value
  return todosLosPlanesPagos.value.filter((c) => c.prestamo_id === pid)
}

/*
 * Valor de la cuota de un préstamo.
 *
 * La verdad es el PLAN DE PAGOS, no una fórmula: el plan ya incorporó la
 * periodicidad (en quincenal la tasa mensual se divide entre dos), el interés
 * total tal como se guardó y cualquier refinanciación. Recalcular desde
 * monto × tasa × cuotas ignoraba todo eso: a un préstamo de 500.000 al 5 % en
 * 4 quincenas le mostraba 150.000 de cuota cuando el plan decía 137.500.
 *
 * Orden de preferencia:
 *   1. el plan (la primera cuota pendiente, o la primera si ya está pagado),
 *   2. el `interes_total` guardado con el préstamo,
 *   3. la fórmula, y solo entonces, con la misma tasa periódica que usa el
 *      generador del plan.
 */
function calcularCuotaMensualDetalle(prestamo) {
  if (!prestamo) return 0

  const plan = planDePrestamo(prestamo)
  if (plan.length > 0) {
    const ordenado = [...plan].sort((a, b) => (Number(a.numero_cuota) || 0) - (Number(b.numero_cuota) || 0))
    const referencia = ordenado.find((c) => !c.pagada) || ordenado[0]
    const valor = parseFloat(referencia?.valor_cuota)
    if (Number.isFinite(valor) && valor > 0) return valor
  }

  const numeroCuotas = Number(prestamo.numero_cuotas) || 1
  const monto = parseFloat(prestamo.monto) || 0
  const interesGuardado = parseFloat(prestamo.interes_total)
  if (Number.isFinite(interesGuardado) && interesGuardado >= 0) {
    return (monto + interesGuardado) / numeroCuotas
  }

  return calcularCondicionesPrestamo({
    capital: monto,
    tasaMensual: prestamo.interes,
    numeroCuotas,
    periodicidad: prestamo.periodicidad,
    tipoInteres: prestamo.tipo_interes
  }).valorCuota
}

/**
 * Intereses que genera el préstamo, en pesos.
 *
 * Mismo orden de preferencia que `calcularCuotaMensualDetalle`, y por el mismo motivo: el
 * plan es la única fuente que ya tiene en cuenta la periodicidad (en quincenal la tasa
 * mensual se parte por dos) y las refinanciaciones. Recalcular desde monto × tasa × cuotas
 * daría una cifra que no coincide con la que el socio tiene en su plan de pagos.
 */
function calcularInteresesGeneradosDetalle(prestamo) {
  if (!prestamo) return 0

  const plan = planDePrestamo(prestamo)
  if (plan.length > 0) {
    const suma = plan.reduce((total, cuota) => total + (parseFloat(cuota.interes) || 0), 0)
    if (suma > 0) return Math.round(suma)
  }

  const guardado = parseFloat(prestamo.interes_total)
  if (Number.isFinite(guardado) && guardado >= 0) return Math.round(guardado)

  return Math.round(calcularCondicionesPrestamo({
    capital: parseFloat(prestamo.monto) || 0,
    tasaMensual: prestamo.interes,
    numeroCuotas: Number(prestamo.numero_cuotas) || 1,
    periodicidad: prestamo.periodicidad,
    tipoInteres: prestamo.tipo_interes
  }).interesTotal)
}

// Calcular saldo inicial total (capital + intereses)
// Tanto para interés anticipado como normal, el total a pagar es monto + intereses
function calcularSaldoInicialTotal(prestamo) {
  if (!prestamo) return 0
  const monto = parseFloat(prestamo.monto || 0)
  const interesTotal = parseFloat(prestamo.interes_total || 0)
  return monto + interesTotal
}

// Calcular valor pagado a la fecha
function calcularValorPagadoDetalle(prestamo) {
  if (!prestamo) return 0
  const saldoInicialTotal = calcularSaldoInicialTotal(prestamo)
  const saldoActual = prestamo.saldo_actual || 0
  return saldoInicialTotal - saldoActual
}

// Porcentaje pagado (para la barra de progreso de la tarjeta)
function porcentajePagadoPrestamo(prestamo) {
  if (!prestamo) return 0
  if (prestamo.estado === 'pagado') return 100
  const total = calcularSaldoInicialTotal(prestamo)
  if (!total || total <= 0) return 0
  const pagado = calcularValorPagadoDetalle(prestamo)
  return Math.max(0, Math.min(100, Math.round((pagado / total) * 100)))
}

// ── Interés de mora ────────────────────────────────────────────────
// Último día en que la cuota se puede pagar sin mora: la fecha proyectada más
// los días de gracia. Mismo criterio que las cuotas de la natillera
// (`fecha_limite + dias_gracia + 1 = primer día en mora`, ver stores/cuotas.js).

// Próxima cuota a pagar: la más cercana de las que todavía no están vencidas.
// Una cuota cuya fecha proyectada ya pasó pero sigue dentro de la gracia NO está
// vencida: aún es el próximo pago, y su fecha límite real es la de la gracia.
function calcularProximoPago(plan, diasGracia, fechaActual) {
  const cuota = (plan || [])
    .filter(c => !c.pagada && fechaLimiteSinMora(c, diasGracia) >= fechaActual)
    .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))[0]
  if (!cuota) return null

  const limite = fechaLimiteSinMora(cuota, diasGracia)
  const proyectada = parseDateLocal(cuota.fecha_proyectada)
  proyectada.setHours(0, 0, 0, 0)
  const valor = Math.max(0, (parseFloat(cuota.valor_cuota) || 0) - (parseFloat(cuota.valor_pagado) || 0))

  return {
    numero_cuota: cuota.numero_cuota,
    fecha_proyectada: cuota.fecha_proyectada,
    // Fecha hasta la que se puede pagar sin mora (ya incluye los días de gracia)
    fechaLimite: formatDateToLocalISO(limite),
    valor,
    diasRestantes: Math.round((limite - fechaActual) / 86400000),
    enGracia: proyectada < fechaActual,
    diasGracia: Number(diasGracia) || 0
  }
}

// Texto de urgencia de la tarjeta: «Vence hoy», «Vence mañana», «En 5 días».
function textoProximoPago(proximo) {
  if (!proximo) return ''
  const dias = proximo.diasRestantes
  const plazo = dias <= 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `En ${dias} días`
  return proximo.enGracia ? `En gracia · ${plazo}` : plazo
}





// Calcular cuotas restantes
function calcularCuotasRestantes(prestamo) {
  if (!prestamo) return 0
  // Con plan, las cuotas restantes son las que faltan por pagar: dividir el
  // saldo por una cuota teórica se desviaba en cuanto la cuota real no coincidía.
  const plan = planDePrestamo(prestamo)
  if (plan.length > 0) return plan.filter((c) => !c.pagada).length
  const cuotaMensual = calcularCuotaMensualDetalle(prestamo)
  if (cuotaMensual <= 0) return 0
  const saldoActual = parseFloat(prestamo.saldo_actual) || 0
  return Math.ceil(saldoActual / cuotaMensual)
}

// Función para generar código único de comprobante
function generarCodigoComprobante() {
  // Generar código alfanumérico único: 8 caracteres
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I, O, 0, 1 para evitar confusión
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

// Calcular interés generado para el detalle del préstamo
function calcularInteresGeneradoDetalle(prestamo) {
  if (!prestamo) return 0
  
  // El interés pactado es el guardado al crear o refinanciar. Recalcularlo aquí ignoraba la
  // periodicidad quincenal (mostraba el doble) y cambiaba la cifra de préstamos ya creados.
  const guardado = parseFloat(prestamo.interes_total)
  if (Number.isFinite(guardado)) return guardado
  return calcularCondicionesPrestamo({
    capital: prestamo.monto,
    tasaMensual: prestamo.interes,
    numeroCuotas: prestamo.numero_cuotas,
    periodicidad: prestamo.periodicidad,
    tipoInteres: prestamo.tipo_interes
  }).interesTotal
}

function seleccionarSocio(socio) {
  formPrestamo.socio_natillera_id = socio.id
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
}

function cerrarSelectorSocio() {
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
}

// formatDate se importa desde utils/formatDate.js con corrección de zona horaria

// Función auxiliar para recargar todos los planes de pagos
async function recargarTodosLosPlanesPagos() {
  try {
    const prestamoIds = prestamos.value.map(p => p.id)
    if (prestamoIds.length === 0) {
      todosLosPlanesPagos.value = []
      return
    }
    
    const { data: planPagos, error: planError } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .in('prestamo_id', prestamoIds)

    if (!planError && planPagos) {
      todosLosPlanesPagos.value = planPagos
    } else {
      todosLosPlanesPagos.value = []
    }
  } catch (e) {
    console.error('Error recargando planes de pagos:', e)
    todosLosPlanesPagos.value = []
  }
}

async function fetchPrestamos() {
  loading.value = true
  try {
    // Total de intereses del fondo: solo necesita el id de la natillera, así que se
    // dispara en paralelo con el resto de la cadena (no suma su latencia). No rechaza
    // (obtenerTotalInteresesPrestamos captura sus errores y devuelve 0).
    const totalInteresesPromise = obtenerTotalInteresesPrestamos(id)

    /*
     * Una sola consulta en vez de dos.
     *
     * Antes se pedían los `socios_natillera` de la natillera solo para sacar sus
     * ids y filtrar los préstamos con `.in(...)`: dos viajes encadenados, y el
     * primero además se traía cada socio entero sin usarlo. Con `!inner` el
     * filtro por natillera viaja dentro del propio join, así que se pide una vez
     * y devuelve exactamente los mismos préstamos (comprobado contra la base:
     * mismos ids, sin diferencias en ningún sentido).
     */
    const { data, error } = await supabase
      .from('prestamos')
      .select('*, socio_natillera:socios_natillera!inner(*, socio:socios(*))')
      .eq('socio_natillera.natillera_id', id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      prestamos.value = []
      interesesGanadosUtilidades.value = await totalInteresesPromise
      return
    }

    // Obtener IDs de préstamos para cargar el plan de pagos
    const prestamoIds = (data || []).map(p => p.id)
    
    // Plan de pagos e historial de refinanciaciones EN PARALELO: ambos solo dependen
    // de prestamoIds. Antes eran dos round-trips secuenciales.
    let planPagosMap = {}
    let historialRefinanciacionesMap = {}
    todosLosPlanesPagos.value = []
    if (prestamoIds.length > 0) {
      const [planRes, historialRes] = await Promise.all([
        supabase
          .from('plan_pagos_prestamo')
          .select('*')
          .in('prestamo_id', prestamoIds),
        supabase
          .from('historial_refinanciaciones')
          .select('*')
          .in('prestamo_id', prestamoIds)
          .order('fecha_refinanciacion', { ascending: true }) // ascendente → primer registro = primera refinanciación
      ])

      const planPagos = !planRes.error ? planRes.data : null
      if (planPagos) {
        // Guardar todos los planes de pagos para calcular total pagado
        todosLosPlanesPagos.value = planPagos
        // Mapa por prestamo_id
        planPagosMap = planPagos.reduce((acc, cuota) => {
          if (!acc[cuota.prestamo_id]) acc[cuota.prestamo_id] = []
          acc[cuota.prestamo_id].push(cuota)
          return acc
        }, {})
      }

      const historialRefinanciaciones = !historialRes.error ? historialRes.data : null
      if (historialRefinanciaciones) {
        // Mapa por prestamo_id, guardando solo el primer registro (primera refinanciación)
        historialRefinanciacionesMap = historialRefinanciaciones.reduce((acc, historial) => {
          if (!acc[historial.prestamo_id]) acc[historial.prestamo_id] = historial
          return acc
        }, {})
      }
    }

    // Combinar con datos del socio y verificar cuotas vencidas
    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    // Cargar el monto total de utilidades_clasificadas para préstamos
    // Sumar todos los registros individuales por préstamo
    const totalIntereses = await totalInteresesPromise
    interesesGanadosUtilidades.value = totalIntereses

    prestamos.value = (data || []).map(prestamo => {
      // `!inner` garantiza la relación en todas las filas: si no viniera, el
      // préstamo no estaría en el resultado.
      const socioNatillera = prestamo.socio_natillera
      const planPagosPrestamo = planPagosMap[prestamo.id] || []
      
      // Obtener el historial de refinanciación si existe
      const historialRefinanciacion = historialRefinanciacionesMap[prestamo.id]
      
      // Si hay historial y el préstamo tenía interés anticipado, guardar el interés total original
      // para usarlo en el cálculo de intereses ganados
      const interesTotalOriginalParaInteresesGanados = historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior && historialRefinanciacion.interes_total_anterior
        ? parseFloat(historialRefinanciacion.interes_total_anterior)
        : null
      
      // Filtrar cuotas vencidas (no pagadas y con fecha anterior a hoy)
      // Vencida = pasó la fecha proyectada MÁS los días de gracia. Dentro de la
      // gracia la cuota está pendiente, no en mora: ni cuenta ni cobra.
      const cuotasVencidasArray = planPagosPrestamo.filter(cuota =>
        !cuota.pagada && fechaLimiteSinMora(cuota, diasGraciaPrestamos.value) < fechaActual
      )

      // Verificar si tiene cuotas vencidas
      const tieneCuotasVencidas = cuotasVencidasArray.length > 0

      // Contar cuántas cuotas vencidas tiene
      const cuotasVencidas = cuotasVencidasArray.length
      // Progreso del plan para la tarjeta: «3 de 12 cuotas pagadas»
      const cuotasTotales = planPagosPrestamo.length
      const cuotasPagadas = planPagosPrestamo.filter(c => c.pagada).length

      // Próximo pago (con días de gracia aplicados) para mostrarlo en la tarjeta
      const proximoPago = calcularProximoPago(planPagosPrestamo, diasGraciaPrestamos.value, fechaActual)

      // Calcular días de mora (desde la cuota más antigua vencida)
      let diasMora = 0
      let valorCuotasEnDeuda = 0
      let valorUnaCuotaVencida = 0
      let fechaPagoCuotaVencida = null
      
      if (cuotasVencidasArray.length > 0) {
        // Ordenar por fecha para obtener la más antigua
        const cuotaMasAntigua = cuotasVencidasArray.sort((a, b) => 
          parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada)
        )[0]
        
        // Los días de mora se cuentan desde que se agotó la gracia, no desde
        // la fecha proyectada.
        const fechaVencimientoMasAntigua = fechaLimiteSinMora(cuotaMasAntigua, diasGraciaPrestamos.value)

        // Calcular días de diferencia
        const diffTime = fechaActual - fechaVencimientoMasAntigua
        diasMora = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        // Sumar valor de todas las cuotas vencidas, restando lo ya pagado
        valorCuotasEnDeuda = cuotasVencidasArray.reduce((sum, cuota) => {
          const valorCuota = parseFloat(cuota.valor_cuota || 0)
          const valorPagado = parseFloat(cuota.valor_pagado || 0)
          const valorPendiente = valorCuota - valorPagado
          return sum + Math.max(0, valorPendiente) // Asegurar que no sea negativo
        }, 0)
        
        // Valor de una cuota vencida (la más antigua)
        valorUnaCuotaVencida = cuotaMasAntigua.valor_cuota || 0
        
        // Fecha de pago de la cuota vencida más antigua
        fechaPagoCuotaVencida = cuotaMasAntigua.fecha_proyectada
      }

      // Determinar si el préstamo inicial fue con interés anticipado
      const tieneInteresAnticipadoInicial = historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior !== undefined
        ? historialRefinanciacion.interes_anticipado_anterior
        : prestamo.interes_anticipado || false

      // Calcular intereses de cuotas pagadas si el préstamo inicial fue con interés anticipado
      let interesesCuotasPagadas = 0
      if (tieneInteresAnticipadoInicial && historialRefinanciacion) {
        // Si fue refinanciado y inicialmente fue con interés anticipado, usar intereses de cuotas pagadas
        const cuotasPagadas = planPagosPrestamo.filter(c => c.pagada)
        interesesCuotasPagadas = cuotasPagadas.reduce((sum, cuota) => sum + (parseFloat(cuota.interes || 0)), 0)
      }

      // Mora pendiente guardada: la de cuotas que se pagaron sin cobrarles la mora.
      const cuotasConMoraPendiente = cuotasConMoraPendienteDe(planPagosPrestamo)
      // Interés de mora a hoy (capital pendiente de cuotas vencidas) + la pendiente guardada
      const moraAcumulada = Math.round(
        calcularMoraPrestamo(cuotasVencidasArray, reglasInteresNatillera.value.tasa_mora, fechaActual, diasGraciaPrestamos.value)
      ) + moraPendienteGuardada(cuotasConMoraPendiente)
      // Cuotas vencidas (de la más antigua a la más nueva) para desglosar el abono con mora.
      // Con `id` para poder guardar su mora si el abono no la cobra.
      const cuotasVencidasOrdenadas = [...cuotasVencidasArray]
        .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
        .map(c => ({ id: c.id, valor_cuota: c.valor_cuota, valor_pagado: c.valor_pagado, capital: c.capital, fecha_proyectada: c.fecha_proyectada }))

      return {
        ...prestamo,
        socio_natillera: socioNatillera,
        tieneCuotasVencidas,
        cuotasVencidas,
        cuotasTotales,
        cuotasPagadas,
        proximoPago,
        diasMora,
        valorCuotasEnDeuda,
        moraAcumulada,
        cuotasVencidasOrdenadas,
        cuotasConMoraPendiente,
        // En mora: cuotas vencidas o intereses de mora sin pagar.
        enMora: tieneCuotasVencidas || moraAcumulada > 0,
        valorUnaCuotaVencida,
        fechaPagoCuotaVencida,
        // Guardar el interés total original para el cálculo de intereses ganados
        // (solo si fue refinanciado con interés anticipado)
        interes_total_original: interesTotalOriginalParaInteresesGanados,
        // Guardar si el préstamo inicial fue con interés anticipado
        tiene_interes_anticipado_inicial: tieneInteresAnticipadoInicial,
        // Guardar intereses de cuotas pagadas para préstamos refinanciados con interés anticipado inicial
        intereses_cuotas_pagadas: interesesCuotasPagadas
      }
    })
  } catch (e) {
    console.error('Error cargando préstamos:', e)
  } finally {
    loading.value = false
    cargaInicial.value = false
  }
}

async function fetchSocios() {
  try {
    const { data, error } = await supabase
      .from('socios_natillera')
      .select(`*, socio:socios(*)`)
      .eq('natillera_id', id)
      .eq('estado', 'activo')

    if (error) throw error
    socios.value = data || []
  } catch (e) {
    console.error('Error cargando socios:', e)
  }
}

// Función para actualizar un préstamo específico en la lista con toda su información
async function actualizarPrestamoEnLista(prestamoId) {
  try {
    // Obtener el préstamo actualizado de la base de datos
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .select('*')
      .eq('id', prestamoId)
      .single()

    if (errorPrestamo || !prestamoActualizado) {
      console.error('Error obteniendo préstamo actualizado:', errorPrestamo)
      return
    }

    // Obtener el plan de pagos del préstamo
    const { data: planPagos, error: errorPlan } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorPlan) {
      console.error('Error obteniendo plan de pagos:', errorPlan)
      return
    }

    const planPagosPrestamo = planPagos || []

    // Obtener el socio_natillera
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('id, socio:socios(*)')
      .eq('id', prestamoActualizado.socio_natillera_id)
      .single()

    // Calcular información de cuotas vencidas
    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0)

    // Vencida = pasó la fecha proyectada MÁS los días de gracia. Dentro de la
    // gracia la cuota está pendiente, no en mora: ni cuenta ni cobra.
    const cuotasVencidasArray = planPagosPrestamo.filter(cuota =>
      !cuota.pagada && fechaLimiteSinMora(cuota, diasGraciaPrestamos.value) < fechaActual
    )

    const tieneCuotasVencidas = cuotasVencidasArray.length > 0
    const cuotasVencidas = cuotasVencidasArray.length
    const cuotasTotales = planPagosPrestamo.length
    const cuotasPagadas = planPagosPrestamo.filter(c => c.pagada).length

    // Próximo pago (con días de gracia aplicados) para mostrarlo en la tarjeta
    const proximoPago = calcularProximoPago(planPagosPrestamo, diasGraciaPrestamos.value, fechaActual)

    // Calcular días de mora (desde la cuota más antigua vencida)
    let diasMora = 0
    let valorCuotasEnDeuda = 0
    let valorUnaCuotaVencida = 0
    let fechaPagoCuotaVencida = null

    if (cuotasVencidasArray.length > 0) {
      // Ordenar por fecha para obtener la más antigua
      const cuotaMasAntigua = cuotasVencidasArray.sort((a, b) => 
        parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada)
      )[0]

      // Los días de mora se cuentan desde que se agotó la gracia, no desde
      // la fecha proyectada.
      const fechaVencimientoMasAntigua = fechaLimiteSinMora(cuotaMasAntigua, diasGraciaPrestamos.value)

      // Calcular días de diferencia
      const diffTime = fechaActual - fechaVencimientoMasAntigua
      diasMora = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      // Sumar valor de todas las cuotas vencidas, restando lo ya pagado
      valorCuotasEnDeuda = cuotasVencidasArray.reduce((sum, cuota) => {
        const valorCuota = parseFloat(cuota.valor_cuota || 0)
        const valorPagado = parseFloat(cuota.valor_pagado || 0)
        const valorPendiente = valorCuota - valorPagado
        return sum + Math.max(0, valorPendiente) // Asegurar que no sea negativo
      }, 0)
      
      // Valor de una cuota vencida (la más antigua)
      valorUnaCuotaVencida = cuotaMasAntigua.valor_cuota || 0
      
      // Fecha de pago de la cuota vencida más antigua
      fechaPagoCuotaVencida = cuotaMasAntigua.fecha_proyectada
    }

    // Obtener historial de refinanciaciones si existe
    let historialRefinanciacion = null
    try {
      const { data: historial } = await supabase
        .from('historial_refinanciaciones')
        .select('*')
        .eq('prestamo_id', prestamoId)
        .order('fecha_refinanciacion', { ascending: false })
        .limit(1)
        .single()
      
      if (historial) {
        historialRefinanciacion = historial
      }
    } catch (e) {
      // No hay historial, continuar sin él
    }

    // Determinar si el préstamo inicial fue con interés anticipado
    const tieneInteresAnticipadoInicial = historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior !== undefined
      ? historialRefinanciacion.interes_anticipado_anterior
      : prestamoActualizado.interes_anticipado || false

    // Calcular intereses de cuotas pagadas si el préstamo inicial fue con interés anticipado
    let interesesCuotasPagadas = 0
    if (tieneInteresAnticipadoInicial && historialRefinanciacion) {
      const cuotasPagadas = planPagosPrestamo.filter(c => c.pagada)
      interesesCuotasPagadas = cuotasPagadas.reduce((sum, cuota) => sum + (parseFloat(cuota.interes || 0)), 0)
    }

    // Calcular interés total original para intereses ganados
    let interesTotalOriginalParaInteresesGanados = null
    if (historialRefinanciacion && historialRefinanciacion.interes_anticipado_anterior && historialRefinanciacion.interes_total_anterior) {
      interesTotalOriginalParaInteresesGanados = parseFloat(historialRefinanciacion.interes_total_anterior)
    }

    // Actualizar el préstamo en la lista
    const index = prestamos.value.findIndex(p => p.id === prestamoId)
    if (index !== -1) {
      prestamos.value[index] = {
        ...prestamoActualizado,
        socio_natillera: socioNatillera,
        tieneCuotasVencidas,
        cuotasVencidas,
        cuotasTotales,
        cuotasPagadas,
        proximoPago,
        diasMora,
        valorCuotasEnDeuda,
        moraAcumulada: Math.round(
          calcularMoraPrestamo(cuotasVencidasArray, reglasInteresNatillera.value.tasa_mora, fechaActual, diasGraciaPrestamos.value)
        ) + moraPendienteGuardada(cuotasConMoraPendienteDe(planPagosPrestamo)),
        cuotasVencidasOrdenadas: [...cuotasVencidasArray]
          .sort((a, b) => parseDateLocal(a.fecha_proyectada) - parseDateLocal(b.fecha_proyectada))
          .map(c => ({ id: c.id, valor_cuota: c.valor_cuota, valor_pagado: c.valor_pagado, capital: c.capital, fecha_proyectada: c.fecha_proyectada })),
        cuotasConMoraPendiente: cuotasConMoraPendienteDe(planPagosPrestamo),
        enMora: tieneCuotasVencidas || moraPendienteGuardada(cuotasConMoraPendienteDe(planPagosPrestamo)) > 0,
        valorUnaCuotaVencida,
        fechaPagoCuotaVencida,
        // Guardar el interés total original para el cálculo de intereses ganados
        interes_total_original: interesTotalOriginalParaInteresesGanados,
        // Guardar si el préstamo inicial fue con interés anticipado
        interes_anticipado_inicial: tieneInteresAnticipadoInicial,
        // Guardar intereses de cuotas pagadas
        intereses_cuotas_pagadas: interesesCuotasPagadas
      }
    }
  } catch (e) {
    console.error('Error actualizando préstamo en lista:', e)
  }
}

/*
 * Valor sugerido: si hay cuotas vencidas, la más antigua (pendiente + su mora) para
 * liquidarla exacto según el plan; si no, la cuota estándar acotada al saldo.
 */
/**
 * Cuotas que tocó un abono y siguen sin completarse, con lo que les falta. Sale del plan
 * actual: si después se completaron, ya no aparecen.
 */
async function cuotasPendientesDelAbono(prestamoId, pagoId) {
  try {
    const { data: pago } = await supabase.from('pagos_prestamo').select('numeros_cuota').eq('id', pagoId).maybeSingle()
    const numeros = Array.isArray(pago?.numeros_cuota) ? pago.numeros_cuota : []
    if (numeros.length === 0) return []
    const { data: plan } = await supabase
      .from('plan_pagos_prestamo')
      .select('numero_cuota, valor_cuota, valor_pagado, pagada')
      .eq('prestamo_id', prestamoId)
      .in('numero_cuota', numeros)
    return (plan || [])
      .filter(c => !c.pagada)
      .map(c => ({ numero: c.numero_cuota, pendiente: Math.round((parseFloat(c.valor_cuota) || 0) - (parseFloat(c.valor_pagado) || 0)) }))
      .filter(c => c.pendiente > 0)
      .sort((a, b) => a.numero - b.numero)
  } catch {
    return []
  }
}

function abrirModalAbono(prestamo) {
  if (soloLectura.value) return
  prestamoSeleccionado.value = prestamo
  const overdue = prestamo.cuotasVencidasOrdenadas || []
  let valorInicial
  if (overdue.length > 0) {
    const c0 = overdue[0]
    const pend = Math.max(0, (parseFloat(c0.valor_cuota) || 0) - (parseFloat(c0.valor_pagado) || 0))
    const mora0 = calcularMoraCuota(c0, reglasInteresNatillera.value.tasa_mora, new Date(), diasGraciaPrestamos.value)
    valorInicial = Math.round(pend + mora0)
  } else {
    const valorCuota = calcularCuotaMensualDetalle(prestamo)
    valorInicial = Math.round(valorCuota > prestamo.saldo_actual ? prestamo.saldo_actual : valorCuota)
  }
  formAbono.valor = valorInicial
  formAbono.fecha_pago = getCurrentDateISO() // Fecha actual por defecto
  valorAbonoFormateado.value = formatMoney(valorInicial)
  modalAbono.value = true
}

function actualizarValorAbono(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    formAbono.valor = 0
    valorAbonoFormateado.value = ''
    return
  }
  
  const valorNumerico = parseInt(valorSinFormato)
  if (isNaN(valorNumerico)) return
  
  // Actualizar el valor numérico
  formAbono.valor = valorNumerico
  
  // Formatear el valor con puntos
  valorAbonoFormateado.value = formatMoney(valorNumerico)
}

function cerrarModalAbono() {
  modalAbono.value = false
  formAbono.valor = 0
  formAbono.fecha_pago = getCurrentDateISO()
  formAbono.tipo_pago = 'efectivo'
  formAbono.valor_efectivo = 0
  formAbono.valor_transferencia = 0
  valorAbonoFormateado.value = ''
  prestamoSeleccionado.value = null
  clearPrestamosWorkDraft()
  if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
}

async function abrirModalRefinanciar(prestamo) {
  if (soloLectura.value) return
  prestamoSeleccionado.value = prestamo
  
  // Obtener la primera fecha del préstamo (fecha_inicio o primera cuota del plan de pagos)
  let primeraFecha = null
  
  if (prestamo.fecha_inicio) {
    primeraFecha = prestamo.fecha_inicio
  } else {
    // Buscar la primera cuota del plan de pagos
    try {
      const { data: planPagos } = await supabase
        .from('plan_pagos_prestamo')
        .select('fecha_proyectada')
        .eq('prestamo_id', prestamo.id)
        .order('numero_cuota', { ascending: true })
        .limit(1)
        .single()
      
      if (planPagos && planPagos.fecha_proyectada) {
        primeraFecha = planPagos.fecha_proyectada
      }
    } catch (e) {
      console.error('Error obteniendo primera fecha:', e)
    }
  }
  
  // Si no hay primera fecha, usar created_at o fecha actual
  if (!primeraFecha) {
    primeraFecha = prestamo.created_at ? prestamo.created_at.split('T')[0] : getCurrentDateISO()
  } else {
    // Asegurar formato YYYY-MM-DD
    primeraFecha = primeraFecha.split('T')[0]
  }
  
  formRefinanciar.fecha_pago = primeraFecha
  formRefinanciar.numero_cuotas_nuevo = prestamo.numero_cuotas || null // Por defecto el mismo número de cuotas
  formRefinanciar.tipo_interes_nuevo = prestamo.tipo_interes || 'simple'
  formRefinanciar.interes_nuevo = prestamo.interes || null // Cargar la tasa original por defecto
  formRefinanciar.tabActual = 'refinanciar' // Por defecto mostrar tab de refinanciación
  
  modalRefinanciar.value = true
}

function cerrarModalRefinanciar() {
  modalRefinanciar.value = false
  formRefinanciar.fecha_pago = getCurrentDateISO()
  formRefinanciar.numero_cuotas_nuevo = null
  formRefinanciar.tipo_interes_nuevo = 'simple'
  formRefinanciar.interes_nuevo = null
  formRefinanciar.tabActual = 'refinanciar'
  prestamoSeleccionado.value = null
  if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
}

/*
 * Imágenes de comprobantes listas ANTES del toque. Safari solo abre el menú de compartir si
 * `navigator.share` sale directo del gesto: cualquier `await` antes (toPng, fetch, consultar
 * Supabase) lo hace caducar y el menú no aparece. Por eso cada imagen se genera al abrir su
 * modal (o al cambiar lo que muestra) y los botones esperan deshabilitados. La espera corta
 * agrupa los cambios que llegan justo después de abrir (p. ej. las cuotas pendientes del
 * abono) para no capturar dos veces.
 */
const descartesImagenes = []
function crearImagenPreparada({ preparando, capturar, nombre }) {
  const archivo = ref(null)
  let turno = 0
  let temporizador = null
  function descartar() {
    clearTimeout(temporizador)
    temporizador = null
    turno++
    archivo.value = null
    preparando.value = false
  }
  function programar() {
    descartar()
    preparando.value = true
    const mio = turno
    temporizador = setTimeout(async () => {
      temporizador = null
      try {
        await nextTick()
        const dataUrl = await capturar()
        if (mio !== turno) return
        if (!dataUrl) throw new Error('No se pudo generar la imagen')
        const blob = await (await fetch(dataUrl)).blob()
        if (mio !== turno) return
        archivo.value = new File([blob], nombre(), { type: 'image/png' })
      } catch (e) {
        if (mio !== turno) return
        console.error('Error preparando la imagen:', e)
        notificationStore.error('No se pudo generar la imagen. Cierra y vuelve a abrir el comprobante.', 'Error')
      } finally {
        if (mio === turno) preparando.value = false
      }
    }, 250)
  }
  descartesImagenes.push(descartar)
  return { archivo, programar, descartar }
}
onUnmounted(() => descartesImagenes.forEach(descartar => descartar()))

/*
 * iOS ignora `download` sobre data URLs (en la PWA no hace nada; en Safari abre la imagen en
 * otra pestaña): allí se entrega con la hoja de compartir, que trae «Guardar imagen». Se llama
 * sin ningún `await` por delante, dentro del toque. Si el navegador no comparte archivos, se
 * descarga con un enlace, como antes.
 */
function entregarArchivo(archivo) {
  if (!archivo) return
  if (detectIosPlatform() && navigator.canShare?.({ files: [archivo] })) {
    navigator.share({ files: [archivo] }).catch(e => {
      if (e?.name !== 'AbortError') console.error('Error entregando el archivo:', e)
    })
    return
  }
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.download = archivo.name
  enlace.href = url
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Comprobante de abono: captura del ticket del DOM (#comprobante-abono). #eef1f4 iguala el
// fondo del modal y las muescas del ticket, así el corte perforado se ve limpio en la imagen.
const imagenAbono = crearImagenPreparada({
  preparando: generandoImagenComprobante,
  capturar: () => (comprobanteAbono.value && comprobanteRef.value
    ? toPng(comprobanteRef.value, { pixelRatio: 3, cacheBust: true, backgroundColor: '#eef1f4' })
    : null),
  nombre: () => `comprobante-abono-${comprobanteAbono.value?.socioNombre?.replace(/\s+/g, '-') || 'abono'}-${Date.now()}.png`
})
const archivoImagenAbono = imagenAbono.archivo
watch([modalComprobanteAbono, comprobanteAbono], ([abierto, datos]) => {
  if (abierto && datos) imagenAbono.programar()
  else imagenAbono.descartar()
})

function descargarComprobanteAbono() {
  const c = comprobanteAbono.value
  if (!c || !archivoImagenAbono.value) return
  entregarArchivo(archivoImagenAbono.value)

  // Registrar auditoría de descarga de comprobante
  if (!c.pagoPrestamoId) return
  const auditoria = useAuditoria()
  registrarAuditoriaEnSegundoPlano(auditoria.registrar({
    tipoAccion: 'DOWNLOAD',
    entidad: 'comprobante',
    entidadId: c.pagoPrestamoId,
    descripcion: `Se descargó comprobante de abono a préstamo de ${c.socioNombre || 'socio'} (Código: ${c.codigoComprobante || 'N/A'})`,
    natilleraId: id,
    detalles: {
      tipo_comprobante: 'abono_prestamo',
      codigo_comprobante: c.codigoComprobante,
      socio_nombre: c.socioNombre,
      valor: c.valor,
      prestamo_id: c.prestamoId
    }
  }))
}

async function reenviarComprobanteAbono(pago) {
  if (!pago || !pago.codigo_comprobante) {
    notificationStore.error('Este abono no tiene código de comprobante', 'Error')
    return
  }
  
  if (!prestamoDetalle.value) {
    notificationStore.error('No hay préstamo seleccionado', 'Error')
    return
  }
  
  try {
    // Obtener información completa del préstamo para calcular saldos
    const prestamo = prestamoDetalle.value
    const socioNombre = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = prestamo.socio_natillera?.socio?.telefono || null
    
    // Saldo anterior = saldo nuevo + lo que se abonó + la mora que se cobró: lo que debía
    // antes del pago, mora incluida, para que la resta cuadre con el valor pagado.
    const saldoNuevo = parseFloat(prestamo.saldo_actual) || 0
    const saldoAnterior = saldoNuevo + (parseFloat(pago.valor) || 0) + (Math.round(parseFloat(pago.mora_cobrada) || 0))
    
    // Preparar datos del comprobante
    // Mora cobrada en el abono: va aparte del valor que bajó el saldo.
    const moraCobradaPago = Math.round(parseFloat(pago.mora_cobrada) || 0)
    comprobanteAbono.value = {
      pagoPrestamoId: pago.id, // ID del pago de préstamo para auditoría
      prestamoId: prestamo.id, // ID del préstamo para auditoría
      valor: (parseFloat(pago.valor) || 0) + moraCobradaPago,
      moraPagada: moraCobradaPago,
      abonoAPrestamo: parseFloat(pago.valor) || 0,
      codigoComprobante: pago.codigo_comprobante,
      socioNombre: socioNombre,
      socioTelefono: socioTelefono,
      // Solo la fecha: la hora que guarda `pago.fecha` es la del registro, no la
      // del pago, y en el comprobante confundía.
      fecha: pago.fecha ? formatDate(pago.fecha) : 'Fecha no disponible',
      saldoAnterior: saldoAnterior,
      saldoNuevo: saldoNuevo,
      prestamo: prestamo
    }
    
    // Registrar auditoría de reenvío de comprobante
    const auditoria = useAuditoria()
    registrarAuditoriaEnSegundoPlano(auditoria.registrar({
      tipoAccion: 'RESEND',
      entidad: 'comprobante',
      entidadId: pago.id,
      descripcion: `Se reenvió comprobante de abono a préstamo de ${socioNombre || 'socio'} (Código: ${pago.codigo_comprobante || 'N/A'})`,
      natilleraId: id,
      detalles: {
        tipo_comprobante: 'abono_prestamo',
        codigo_comprobante: pago.codigo_comprobante,
        socio_nombre: socioNombre,
        valor: parseFloat(pago.valor) || 0,
        prestamo_id: prestamo.id
      }
    }))
    
    // Abrir modal de comprobante
    modalComprobanteAbono.value = true
    cuotasPendientesDelAbono(prestamo.id, pago.id).then(lista => {
      if (comprobanteAbono.value?.pagoPrestamoId === pago.id) comprobanteAbono.value = { ...comprobanteAbono.value, cuotasPendientes: lista }
    })
  } catch (e) {
    console.error('Error al preparar comprobante:', e)
    notificationStore.error('Error al preparar el comprobante: ' + e.message, 'Error')
  }
}

/**
 * Abre WhatsApp con un mensaje ya escrito.
 *
 * Sin teléfono NO se calla: `wa.me` sin número abre WhatsApp con el mensaje
 * listo y deja que la persona elija a quién enviárselo. Antes, cuando el socio
 * no tenía número registrado, este camino simplemente no hacía nada y el
 * comprobante se quedaba en la carpeta de descargas sin explicación.
 */
function abrirWhatsAppConMensaje(telefonoCrudo, mensaje) {
  const t = (telefonoCrudo || '').replace(/\D/g, '')
  const texto = encodeURIComponent(mensaje)
  window.open(t ? `https://wa.me/${numeroWhatsApp(t)}?text=${texto}` : `https://wa.me/?text=${texto}`, '_blank')
}

function auditarEnvioAbono(c, metodo, etiqueta) {
  if (!c?.pagoPrestamoId) return
  const auditoria = useAuditoria()
  registrarAuditoriaEnSegundoPlano(auditoria.registrar({
    tipoAccion: 'SEND',
    entidad: 'comprobante',
    entidadId: c.pagoPrestamoId,
    descripcion: `Se envió comprobante de abono a préstamo por WhatsApp${etiqueta} a ${c.socioNombre || 'socio'} (Código: ${c.codigoComprobante || 'N/A'})`,
    natilleraId: id,
    detalles: {
      tipo_comprobante: 'abono_prestamo',
      metodo_envio: metodo,
      codigo_comprobante: c.codigoComprobante,
      socio_nombre: c.socioNombre,
      socio_telefono: c.socioTelefono,
      valor: c.valor,
      prestamo_id: c.prestamoId
    }
  }))
}

// Síncrono de principio a fin: la imagen ya está lista y `share`/`window.open` salen del toque.
function compartirWhatsAppAbono() {
  const c = comprobanteAbono.value
  const archivo = archivoImagenAbono.value
  if (!c || !archivo) return
  const mensajeCompartir = `Hola ${c.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo en la natillera.\n\n¡Gracias por estar al día! 🙌`
  if (navigator.canShare?.({ files: [archivo] })) {
    navigator.share({
      files: [archivo],
      title: `Comprobante de Abono - ${c.socioNombre}`,
      text: mensajeCompartir
    })
      .then(() => auditarEnvioAbono(c, 'whatsapp', ''))
      .catch(e => {
        // Cancelar el menú no es error. Y abrir WhatsApp desde aquí ya no tendría gesto:
        // Safari bloquearía la ventana.
        if (e?.name === 'AbortError') return
        console.error('Error compartiendo por WhatsApp:', e)
        notificationStore.error('No se pudo compartir el comprobante', 'Error')
      })
    return
  }
  // Sin menú de compartir archivos (escritorio): descarga y chat de WhatsApp en el mismo toque
  entregarArchivo(archivo)
  abrirWhatsAppConMensaje(c.socioTelefono, `Hola ${c.socioNombre} 👋\n\nTe envío el comprobante de tu abono al préstamo. ¡Gracias por estar al día! 🙌`)
  auditarEnvioAbono(c, 'whatsapp_fallback', ' (fallback)')
}

// ============================================================
// Comprobante de PRÉSTAMO PAGADO (total pagado + lista de abonos)
// ============================================================
async function enviarComprobantePagado(prestamo) {
  if (!prestamo) return
  try {
    const socioNombre = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = prestamo.socio_natillera?.socio?.telefono || null

    // Abonos reales del préstamo (más antiguos primero para leer el historial en orden)
    const { data, error } = await supabase
      .from('pagos_prestamo')
      .select('id, valor, fecha, codigo_comprobante')
      .eq('prestamo_id', prestamo.id)
      .order('fecha', { ascending: true })
    if (error) throw error

    const abonos = (data || []).map(p => ({
      valor: parseFloat(p.valor) || 0,
      fecha: p.fecha ? formatDate(p.fecha) : 'Sin fecha',
    }))
    const totalPagado = abonos.reduce((s, a) => s + a.valor, 0)

    comprobantePagado.value = {
      prestamoId: prestamo.id,
      natilleraNombre: prestamo.nombre_natillera || 'Natillera',
      socioNombre,
      socioTelefono,
      montoPrestamo: parseFloat(prestamo.monto) || 0,
      totalPagado,
      numAbonos: abonos.length,
      abonos,
      fecha: abonos.length ? abonos[abonos.length - 1].fecha : formatDate(new Date().toISOString()),
    }
    modalComprobantePagado.value = true

    // Auditoría (mismo patrón que el comprobante de abono)
    const auditoria = useAuditoria()
    registrarAuditoriaEnSegundoPlano(auditoria.registrar({
      tipoAccion: 'VIEW',
      entidad: 'comprobante',
      entidadId: prestamo.id,
      descripcion: `Se abrió comprobante de préstamo pagado de ${socioNombre} (Total: $${totalPagado})`,
      natilleraId: id,
      detalles: {
        tipo_comprobante: 'prestamo_pagado',
        socio_nombre: socioNombre,
        total_pagado: totalPagado,
        num_abonos: abonos.length,
        prestamo_id: prestamo.id,
      },
    }))
  } catch (e) {
    console.error('Error preparando comprobante de préstamo pagado:', e)
    notificationStore.error('No se pudo preparar el comprobante: ' + e.message, 'Error')
  }
}

const imagenPagado = crearImagenPreparada({
  preparando: generandoImagenComprobantePagado,
  capturar: () => (comprobantePagado.value && comprobantePagadoRef.value
    ? toPng(comprobantePagadoRef.value, { pixelRatio: 3, cacheBust: true, backgroundColor: '#eef1f4' })
    : null),
  nombre: () => `comprobante-pagado-${comprobantePagado.value?.socioNombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
})
const archivoImagenPagado = imagenPagado.archivo
watch([modalComprobantePagado, comprobantePagado], ([abierto, datos]) => {
  if (abierto && datos) imagenPagado.programar()
  else imagenPagado.descartar()
})

function descargarComprobantePagado() {
  if (!comprobantePagado.value || !archivoImagenPagado.value) return
  entregarArchivo(archivoImagenPagado.value)
}

// Síncrono: la imagen ya está lista y `share`/`window.open` salen del toque.
function compartirWhatsAppComprobantePagado() {
  const c = comprobantePagado.value
  const archivo = archivoImagenPagado.value
  if (!c || !archivo) return
  const mensajeCompartir = `¡Felicidades ${c.socioNombre}! 🎉\n\nTu préstamo en la natillera quedó *totalmente pagado*. Te envío el comprobante.\n\n¡Gracias por tu compromiso! 🙌`
  const auditarEnvio = () => {
    const auditoria = useAuditoria()
    registrarAuditoriaEnSegundoPlano(auditoria.registrar({
      tipoAccion: 'SEND',
      entidad: 'comprobante',
      entidadId: c.prestamoId,
      descripcion: `Se envió comprobante de préstamo pagado por WhatsApp a ${c.socioNombre}`,
      natilleraId: id,
      detalles: {
        tipo_comprobante: 'prestamo_pagado',
        metodo_envio: 'whatsapp',
        socio_nombre: c.socioNombre,
        socio_telefono: c.socioTelefono,
        total_pagado: c.totalPagado,
        prestamo_id: c.prestamoId,
      },
    }))
  }
  if (navigator.canShare?.({ files: [archivo] })) {
    navigator.share({
      files: [archivo],
      title: `Comprobante de préstamo pagado - ${c.socioNombre}`,
      text: mensajeCompartir,
    })
      .then(auditarEnvio)
      .catch(e => {
        if (e?.name === 'AbortError') return
        console.error('Error compartiendo comprobante pagado:', e)
        notificationStore.error('No se pudo compartir el comprobante', 'Error')
      })
    return
  }
  entregarArchivo(archivo)
  abrirWhatsAppConMensaje(c.socioTelefono, mensajeCompartir)
  auditarEnvio()
}

async function abrirModalDetalle(prestamo) {
  // Cerrar el desplegable antes de abrir el modal
  planPagosExpandido.value = false
  prestamoDetalle.value = prestamo
  modalDetalle.value = true
  await Promise.all([
    fetchPagosPrestamo(prestamo.id),
    fetchPlanPagosPrestamo(prestamo.id),
    fetchHistorialRefinanciaciones(prestamo.id)
  ])
}

// Abonos que quedaron asociados (cerrados) por una refinanciación concreta.
function abonosDeRefinanciacion(refinanciacionId) {
  return pagosPrestamo.value.filter(p => p.refinanciacion_id === refinanciacionId)
}

// Mostrar/ocultar el desplegable de abonos de una refinanciación en el detalle.
function toggleHistorialAbonos(refinanciacionId) {
  const set = new Set(historialAbonosExpandido.value)
  if (set.has(refinanciacionId)) {
    set.delete(refinanciacionId)
  } else {
    set.add(refinanciacionId)
  }
  historialAbonosExpandido.value = set
}

// Mostrar/ocultar el desplegable del plan de pagos anterior de una refinanciación.
function toggleHistorialPlan(refinanciacionId) {
  const set = new Set(historialPlanExpandido.value)
  if (set.has(refinanciacionId)) {
    set.delete(refinanciacionId)
  } else {
    set.add(refinanciacionId)
  }
  historialPlanExpandido.value = set
}

async function fetchHistorialRefinanciaciones(prestamoId) {
  try {
    const { data, error } = await supabase
      .from('historial_refinanciaciones')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha_refinanciacion', { ascending: false })

    if (error) {
      console.error('❌ Error cargando historial de refinanciaciones:', error)
      historialRefinanciaciones.value = []
      return
    }
    
    historialRefinanciaciones.value = data || []
  } catch (e) {
    console.error('❌ Error cargando historial de refinanciaciones:', e)
    historialRefinanciaciones.value = []
  }
}

async function fetchPagosPrestamo(prestamoId) {
  try {
    console.log('🔍 Buscando pagos para préstamo:', prestamoId)
    const { data, error } = await supabase
      .from('pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha', { ascending: false })

    if (error) {
      console.error('❌ Error en la consulta:', error)
      throw error
    }
    
    console.log('✅ Pagos encontrados:', data)
    pagosPrestamo.value = data || []
    console.log('📋 pagosPrestamo.value actualizado:', pagosPrestamo.value)
  } catch (e) {
    console.error('❌ Error cargando pagos del préstamo:', e)
    pagosPrestamo.value = []
  }
}

async function fetchPlanPagosPrestamo(prestamoId) {
  try {
    const { data, error } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (error) {
      console.error('❌ Error cargando plan de pagos:', error)
      planPagosPrestamo.value = []
      return
    }
    
    planPagosPrestamo.value = data || []
  } catch (e) {
    console.error('❌ Error cargando plan de pagos:', e)
    planPagosPrestamo.value = []
  }
}

// Función para aplicar abono a la primera cuota pendiente del plan de pagos
async function aplicarAbonoAPlanPagos(prestamoId, valorAbono, fechaPago) {
  try {
    // Obtener todas las cuotas ordenadas por número
    const { data: todasCuotas, error: errorCuotas } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorCuotas) {
      console.error('❌ Error obteniendo cuotas:', errorCuotas)
      return
    }

    // Filtrar cuotas que aún tienen saldo pendiente (no pagadas completamente)
    const cuotasPendientes = todasCuotas.filter(c => {
      const valorCuota = parseFloat(c.valor_cuota)
      const valorPagado = parseFloat(c.valor_pagado || 0)
      return valorPagado < valorCuota
    })

    if (errorCuotas) {
      console.error('❌ Error obteniendo cuotas pendientes:', errorCuotas)
      return
    }

    if (!cuotasPendientes || cuotasPendientes.length === 0) {
      console.log('ℹ️ No hay cuotas pendientes para aplicar el abono')
      return
    }

    let abonoRestante = parseFloat(valorAbono)
    let indiceCuota = 0

    // Aplicar el abono a las cuotas pendientes hasta que se agote
    while (abonoRestante > 0 && indiceCuota < cuotasPendientes.length) {
      const cuota = cuotasPendientes[indiceCuota]
      const valorCuota = parseFloat(cuota.valor_cuota)
      const valorPagadoActual = parseFloat(cuota.valor_pagado || 0)
      const valorRestanteCuota = valorCuota - valorPagadoActual
      
      if (abonoRestante >= valorRestanteCuota) {
        // El abono cubre completamente el resto de esta cuota
        // mes, anio, quincena según fecha_proyectada (periodo de vencimiento)
        const periodo = periodoDesdeFechaProyectada(cuota.fecha_proyectada)
        const { error: errorUpdate } = await supabase
          .from('plan_pagos_prestamo')
          .update({
            pagada: true,
            fecha_pago: fechaPago,
            fecha_causacion: new Date().toISOString(),
            valor_pagado: valorCuota,
            ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
          })
          .eq('id', cuota.id)

        if (errorUpdate) {
          console.error(`❌ Error actualizando cuota ${cuota.numero_cuota}:`, errorUpdate)
        } else {
          console.log(`✅ Cuota ${cuota.numero_cuota} marcada como pagada`)
        }

        abonoRestante -= valorRestanteCuota
        indiceCuota++
      } else {
        // El abono no cubre completamente el resto de la cuota
        // Actualizar solo el valor_pagado
        const nuevoValorPagado = valorPagadoActual + abonoRestante
        const { error: errorUpdate } = await supabase
          .from('plan_pagos_prestamo')
          .update({
            valor_pagado: nuevoValorPagado,
            // Abono parcial: la cuota no queda saldada, así que no lleva fecha_pago, pero sí
            // deja constancia de que hoy se movió dinero en ella.
            fecha_causacion: new Date().toISOString()
          })
          .eq('id', cuota.id)

        if (errorUpdate) {
          console.error(`❌ Error actualizando valor pagado de cuota ${cuota.numero_cuota}:`, errorUpdate)
        } else {
          console.log(`ℹ️ Abono parcial de $${formatMoney(abonoRestante)} aplicado a cuota ${cuota.numero_cuota}`)
        }

        abonoRestante = 0
      }
    }

    // Actualizar los saldos proyectados de todas las cuotas pendientes restantes
    // basándose en el nuevo saldo del préstamo
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .select('saldo_actual')
      .eq('id', prestamoId)
      .single()

    if (!errorPrestamo && prestamoActualizado) {
      const saldoActual = parseFloat(prestamoActualizado.saldo_actual)
      
      // Obtener todas las cuotas para actualizar saldos
      const { data: todasCuotasActualizadas, error: errorTodas } = await supabase
        .from('plan_pagos_prestamo')
        .select('*')
        .eq('prestamo_id', prestamoId)
        .order('numero_cuota', { ascending: true })
      
      // Filtrar solo las pendientes (con saldo)
      const todasCuotasPendientes = todasCuotasActualizadas?.filter(c => {
        const valorCuota = parseFloat(c.valor_cuota)
        const valorPagado = parseFloat(c.valor_pagado || 0)
        return valorPagado < valorCuota
      }) || []

      if (!errorTodas && todasCuotasPendientes) {
        let saldoAcumulado = saldoActual
        
        // Actualizar saldos proyectados de las cuotas pendientes
        for (const cuota of todasCuotasPendientes) {
          const valorCuota = parseFloat(cuota.valor_cuota)
          const valorPagado = parseFloat(cuota.valor_pagado || 0)
          const valorRestanteCuota = valorCuota - valorPagado
          saldoAcumulado = Math.max(0, saldoAcumulado - valorRestanteCuota)
          
          const { error: errorSaldo } = await supabase
            .from('plan_pagos_prestamo')
            .update({
              saldo_proyectado: saldoAcumulado
            })
            .eq('id', cuota.id)

          if (errorSaldo) {
            console.error(`❌ Error actualizando saldo de cuota ${cuota.numero_cuota}:`, errorSaldo)
          }
        }
      }
    }

    // Recargar el plan de pagos para reflejar los cambios
    await fetchPlanPagosPrestamo(prestamoId)
    
    // Recargar todos los planes de pagos para actualizar el total pagado
    await recargarTodosLosPlanesPagos()
  } catch (e) {
    console.error('❌ Error aplicando abono al plan de pagos:', e)
  }
}

// Función para actualizar el plan de pagos después de editar un abono
async function actualizarPlanPagosDespuesDeEditarAbono(prestamoId, diferenciaAbono) {
  const { interesRegistrado } = await recalcularPlanPagosPrestamo(prestamoId)
  if (interesRegistrado) interesesGanadosUtilidades.value = await obtenerTotalInteresesPrestamos(id)

  // Recargar el plan de pagos
  await fetchPlanPagosPrestamo(prestamoId)

  // Recargar todos los planes de pagos para actualizar el total pagado
  await recargarTodosLosPlanesPagos()

  // Recargar el historial de abonos para reflejar los numeros_cuota actualizados
  await fetchPagosPrestamo(prestamoId)
}

// Fecha de la cuota i del plan: quincenal por quincenas del calendario; mensual el mismo
// día de cada mes (si el mes no tiene ese día, el último del mes).
function fechaCuotaDelPlan(fechaInicio, periodicidad, i) {
  if (periodicidad === 'quincenal') return fechaProyectadaQuincenal(fechaInicio, i)
  return fechaProyectadaMensual(fechaInicio, i)
}

/*
 * Cuota quincenal i: dos fechas fijas por mes, como las quincenas de la natillera.
 *
 * Antes era «la anterior + 15 días», y como los meses no tienen 30 días las fechas se iban
 * corriendo: 30 ago → 14 sep → 29 sep → 14 oct, cuando las quincenas son el 15 y el último
 * día. La mora cuenta desde esa fecha, así que un día corrido cobraba un día de más.
 *
 * El par de días del mes sale de la primera cuota:
 *   · el 15, o del 28 en adelante (fin de mes) → 15 y último día del mes;
 *   · antes del 15 (p. ej. 10)                  → 10 y 25;
 *   · entre el 16 y el 27 (p. ej. 20)           → 5 y 20.
 * La primera cuota queda en la fecha que se eligió; las demás alternan entre los dos días.
 */
function fechaProyectadaQuincenal(fechaInicio, numeroCuota) {
  const inicio = new Date(fechaInicio)
  if (numeroCuota <= 1) return inicio
  const dia = inicio.getDate()
  const ultimoDe = (anio, mes) => new Date(anio, mes + 1, 0).getDate()
  const finDeMes = dia >= 28 || dia === ultimoDe(inicio.getFullYear(), inicio.getMonth())

  let primero, segundo, posicion
  if (dia === 15 || finDeMes) {
    primero = 15
    segundo = null // último día del mes
    posicion = dia === 15 ? 0 : 1
  } else if (dia < 15) {
    primero = dia
    segundo = dia + 15
    posicion = 0
  } else {
    primero = dia - 15
    segundo = dia
    posicion = 1
  }

  const k = posicion + (numeroCuota - 1)
  const mesAbs = inicio.getMonth() + Math.floor(k / 2)
  const anio = inicio.getFullYear() + Math.floor(mesAbs / 12)
  const mes = ((mesAbs % 12) + 12) % 12
  const ultimo = ultimoDe(anio, mes)
  const diaCuota = k % 2 === 0 ? Math.min(primero, ultimo) : (segundo == null ? ultimo : Math.min(segundo, ultimo))
  return new Date(anio, mes, diaCuota, inicio.getHours(), inicio.getMinutes(), inicio.getSeconds(), inicio.getMilliseconds())
}

// Función para generar el plan de pagos (préstamo nuevo). Los montos salen de
// utils/calculoPrestamos.js; aquí solo se ponen fechas y datos del socio.
function generarPlanPagos(prestamo) {
  const numeroCuotas = prestamo.numero_cuotas || 1
  const monto = prestamo.monto || 0
  // Resolver una sola vez el nombre del socio y de la natillera para todas las cuotas del plan.
  const nombreSocioPlan = prestamo.nombre_socio
    || prestamo.socio_natillera?.socio?.nombre
    || prestamo.socio_natillera?.nombre
    || null
  const nombreNatilleraPlan = prestamo.nombre_natillera
    || prestamo.socio_natillera?.natillera?.nombre
    || null
  // Usar fecha_inicio si está disponible, sino usar created_at, sino fecha actual
  // Usamos parseDateLocal para evitar problemas de zona horaria
  const fechaInicio = prestamo.fecha_inicio
    ? parseDateLocal(prestamo.fecha_inicio)
    : parseDateLocal(prestamo.created_at) || new Date()
  const periodicidad = prestamo.periodicidad || 'mensual'

  // El interés guardado es lo pactado con el socio; sin él se calcula con las mismas reglas
  const guardado = Number(prestamo.interes_total)
  const interesTotal = prestamo.interes_total != null && prestamo.interes_total !== '' && Number.isFinite(guardado)
    ? guardado
    : calcularCondicionesPrestamo({
      capital: monto,
      tasaMensual: prestamo.interes,
      numeroCuotas,
      periodicidad,
      tipoInteres: prestamo.tipo_interes
    }).interesTotal

  const desglose = generarDesgloseCuotas({
    capital: monto,
    interesTotal,
    tasaMensual: prestamo.interes,
    numeroCuotas,
    periodicidad,
    tipoInteres: prestamo.tipo_interes,
    interesAnticipado: !!prestamo.interes_anticipado
  })

  return desglose.map((cuota) => {
    const fp = formatDateToLocalISO(fechaCuotaDelPlan(fechaInicio, periodicidad, cuota.numero_cuota))
    const periodo = periodoDesdeFechaProyectada(fp)
    return {
      prestamo_id: prestamo.id,
      numero_cuota: cuota.numero_cuota,
      fecha_proyectada: fp,
      valor_cuota: cuota.valor_cuota,
      capital: cuota.capital,
      interes: cuota.interes,
      saldo_proyectado: cuota.saldo_proyectado,
      pagada: false,
      nombre_socio: nombreSocioPlan,
      socio_nombre: nombreSocioPlan,
      nombre_natillera: nombreNatilleraPlan,
      ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
    }
  })
}

// Plan del nuevo ciclo tras refinanciar: los montos vienen de calcularRefinanciacion
// y las fechas corren desde la nueva fecha de inicio.
function generarPlanPagosRefinanciado(prestamo, desglose, nuevaFechaInicio) {
  // Usamos parseDateLocal para evitar problemas de zona horaria
  const fechaInicio = parseDateLocal(nuevaFechaInicio)
  const periodicidad = prestamo.periodicidad || 'mensual'
  return desglose.map((cuota) => {
    const fp = formatDateToLocalISO(fechaCuotaDelPlan(fechaInicio, periodicidad, cuota.numero_cuota))
    const periodo = periodoDesdeFechaProyectada(fp)
    return {
      prestamo_id: prestamo.id,
      numero_cuota: cuota.numero_cuota,
      fecha_proyectada: fp,
      valor_cuota: cuota.valor_cuota,
      capital: cuota.capital,
      interes: cuota.interes,
      saldo_proyectado: cuota.saldo_proyectado,
      pagada: false,
      valor_pagado: 0,
      ...(periodo.mes != null && { mes: periodo.mes, anio: periodo.anio, quincena: periodo.quincena })
    }
  })
}

async function handleRefinanciar() {
  if (soloLectura.value) return
  if (!prestamoSeleccionado.value || !formRefinanciar.fecha_pago || !formRefinanciar.numero_cuotas_nuevo || formRefinanciar.numero_cuotas_nuevo <= 0) {
    notificationStore.warning('Por favor completa todos los campos', 'Campos incompletos')
    return
  }
  
  loading.value = true
  try {
    const prestamo = prestamoSeleccionado.value
    const prestamoId = prestamo.id
    const saldoActual = parseFloat(prestamo.saldo_actual || 0)
    
    if (saldoActual <= 0) {
      notificationStore.warning('El préstamo ya está completamente pagado', 'No se puede refinanciar')
      cerrarModalRefinanciar()
      return
    }

    // El número de cuotas es el ingresado (no se suma al anterior)
    const totalCuotas = formRefinanciar.numero_cuotas_nuevo

    if (totalCuotas <= 0) {
      notificationStore.warning('El número de cuotas debe ser mayor a 0', 'Error')
      return
    }

    const interesNuevo = tasaRefinanciacionElegida(prestamo)
    const tipoInteresNuevo = formRefinanciar.tipo_interes_nuevo || 'simple'
    const periodicidadNueva = prestamo.periodicidad || 'mensual'

    // Si el préstamo NACIÓ con interés anticipado (queda en el primer registro del historial)
    const { data: historialCompleto, error: errorHistorialCompleto } = await supabase
      .from('historial_refinanciaciones')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha_refinanciacion', { ascending: true })

    if (errorHistorialCompleto) {
      console.error('Error al obtener historial de refinanciaciones:', errorHistorialCompleto)
    }

    const tieneInteresAnticipadoInicial = historialCompleto && historialCompleto.length > 0
      ? !!historialCompleto[0].interes_anticipado_anterior
      : !!prestamo.interes_anticipado

    // Plan vigente leído de la BD: de él sale lo que realmente se debe hoy
    const { data: todasCuotas, error: errorCuotas } = await supabase
      .from('plan_pagos_prestamo')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('numero_cuota', { ascending: true })

    if (errorCuotas) {
      throw new Error('Error al obtener el plan de pagos actual')
    }

    // Refinanciación como en un crédito real (ver utils/calculoPrestamos.js):
    // interés nuevo solo sobre el capital pendiente, interés vencido diferido sin
    // intereses, interés futuro del plan anterior eliminado y mora sin capitalizar.
    const refinanciacion = calcularRefinanciacion({
      prestamo,
      plan: todasCuotas || [],
      fechaCorte: getCurrentDateISO(),
      tasaMensual: interesNuevo,
      numeroCuotas: totalCuotas,
      tipoInteres: tipoInteresNuevo
    })

    if (refinanciacion.totalAPagar <= 0) {
      notificationStore.warning('No hay capital pendiente para refinanciar', 'No se puede refinanciar')
      return
    }

    // Snapshot del ciclo que se está cerrando (para el historial de refinanciación).
    // El interés generado se calcula con las condiciones vigentes ANTES de refinanciar.
    const interesGeneradoAnterior = Math.ceil(calcularInteresGeneradoDetalle(prestamo) || 0)

    // Total abonado en el ciclo vigente (abonos aún no asociados a una refinanciación).
    const { data: abonosCicloActual, error: errorAbonosCiclo } = await supabase
      .from('pagos_prestamo')
      .select('id, valor')
      .eq('prestamo_id', prestamoId)
      .is('refinanciacion_id', null)
    if (errorAbonosCiclo) {
      throw new Error('Error al obtener los abonos del ciclo actual')
    }
    const totalPagadoAnterior = (abonosCicloActual || [])
      .reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0)

    // El plan de cuotas se reinicia por completo: se eliminan TODAS las cuotas del plan
    // anterior (pagadas y pendientes) y se regenera desde la cuota #1 con las nuevas
    // condiciones. La trazabilidad del ciclo cerrado queda en los abonos (que se
    // conservan y se asocian a esta refinanciación más abajo) y en el historial.
    if (todasCuotas.length > 0) {
      const { error: errorEliminar } = await supabase
        .from('plan_pagos_prestamo')
        .delete()
        .eq('prestamo_id', prestamoId)

      if (errorEliminar) {
        throw new Error('Error al eliminar el plan de pagos anterior')
      }
    }

    // Crear objeto temporal del préstamo con los nuevos valores para generar el plan
    const prestamoTemporal = {
      ...prestamo,
      numero_cuotas: totalCuotas,
      interes: interesNuevo,
      tipo_interes: tipoInteresNuevo
    }

    const nuevoPlanPagos = generarPlanPagosRefinanciado(prestamoTemporal, refinanciacion.desglose, formRefinanciar.fecha_pago)

    // Insertar el nuevo plan de pagos
    if (nuevoPlanPagos.length > 0) {
      const { error: errorPlan } = await supabase
        .from('plan_pagos_prestamo')
        .insert(nuevoPlanPagos)
      
      if (errorPlan) {
        throw new Error('Error al crear el nuevo plan de pagos')
      }
    }
    
    // Guardar historial de refinanciación ANTES de actualizar el préstamo
    const historialRefinanciacion = {
      prestamo_id: prestamoId,
      // Valores anteriores (del préstamo actual antes de refinanciar)
      monto_anterior: parseFloat(prestamo.monto || 0),
      interes_anterior: parseFloat(prestamo.interes || 0),
      numero_cuotas_anterior: prestamo.numero_cuotas || null,
      tipo_interes_anterior: prestamo.tipo_interes || null,
      periodicidad_anterior: prestamo.periodicidad || null,
      // Fecha de inicio del plan anterior: si el préstamo no la tiene (préstamos viejos),
      // usar la fecha de la primera cuota del plan que se está cerrando.
      fecha_inicio_anterior: prestamo.fecha_inicio || (todasCuotas && todasCuotas.length > 0 ? todasCuotas[0].fecha_proyectada : null),
      saldo_actual_anterior: saldoActual,
      // Guardar el interés total que tenía el préstamo ANTES de esta refinanciación
      // (puede ser el inicial o el de una refinanciación anterior)
      interes_total_anterior: prestamo.interes_total ? parseFloat(prestamo.interes_total) : null,
      // Guardar si el préstamo tenía interés anticipado antes de esta refinanciación
      // Si es la primera refinanciación, esto indica si el préstamo inicial fue con interés anticipado
      interes_anticipado_anterior: tieneInteresAnticipadoInicial,
      // Valores nuevos
      monto_nuevo: refinanciacion.montoNuevo, // Capital pendiente (+ interés vencido si ya era utilidad)
      interes_nuevo: interesNuevo,
      numero_cuotas_nuevo: totalCuotas,
      tipo_interes_nuevo: tipoInteresNuevo,
      periodicidad_nueva: periodicidadNueva,
      fecha_inicio_nueva: formRefinanciar.fecha_pago,
      saldo_actual_nuevo: refinanciacion.totalAPagar,
      // Resumen del ciclo cerrado (para mostrar en la tarjeta del historial)
      interes_generado_anterior: interesGeneradoAnterior,
      total_pagado_anterior: Math.ceil(totalPagadoAnterior),
      // Copia del plan de pagos anterior (se borra al reiniciar; aquí queda para el desplegable)
      plan_pagos_anterior: (todasCuotas || []).map(c => ({
        numero_cuota: c.numero_cuota,
        valor_cuota: parseFloat(c.valor_cuota || 0),
        valor_pagado: parseFloat(c.valor_pagado || 0),
        pagada: !!c.pagada,
        fecha_proyectada: c.fecha_proyectada
      }))
    }

    const { data: historialInsertado, error: errorHistorial } = await supabase
      .from('historial_refinanciaciones')
      .insert(historialRefinanciacion)
      .select()
      .single()

    if (errorHistorial) {
      console.error('Error al guardar historial de refinanciación:', errorHistorial)
      // No lanzar error, solo registrar en consola para no bloquear el proceso
    }

    // Asociar los abonos del ciclo vigente a esta refinanciación para conservar la
    // trazabilidad. Así el "Resumen de pagos" (que solo cuenta abonos con
    // refinanciacion_id NULL) vuelve a 0 y estos abonos se listan en el desplegable
    // del historial de refinanciación.
    if (historialInsertado?.id && abonosCicloActual && abonosCicloActual.length > 0) {
      const { error: errorAsociar } = await supabase
        .from('pagos_prestamo')
        .update({ refinanciacion_id: historialInsertado.id })
        .eq('prestamo_id', prestamoId)
        .is('refinanciacion_id', null)

      if (errorAsociar) {
        console.error('Error al asociar abonos a la refinanciación:', errorAsociar)
        // No bloquear el proceso; los abonos siguen existiendo aunque no queden agrupados
      }
    }

    // Nuevo ciclo del préstamo. La modalidad (normal/anticipado) se conserva porque define
    // cómo se reconoce la utilidad y cómo lo leen el libro de caja y el cuadre.
    const datosActualizacion = {
      monto: refinanciacion.montoNuevo,
      interes: interesNuevo,
      numero_cuotas: totalCuotas,
      tipo_interes: tipoInteresNuevo,
      periodicidad: periodicidadNueva,
      fecha_inicio: formRefinanciar.fecha_pago,
      interes_total: refinanciacion.interesTotalNuevo,
      saldo_actual: refinanciacion.totalAPagar,
      interes_anticipado: !!(prestamo.interes_anticipado || tieneInteresAnticipadoInicial)
    }

    const { data: prestamoActualizadoData, error: errorUpdate } = await supabase
      .from('prestamos')
      .update(datosActualizacion)
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorUpdate) {
      console.error('❌ Error al actualizar préstamo:', errorUpdate)
      throw new Error('Error al actualizar el préstamo con los nuevos valores')
    }
    
    // Obtener el natillera_id para la auditoría y actualizar utilidades_clasificadas
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('id', prestamo.socio_natillera_id)
      .single()
    
    const nombreSocio = prestamo.socio_natillera?.socio?.nombre || 'Socio'
    
    // Anticipado: el interés nuevo del ciclo se reconoce como utilidad al refinanciar, igual que
    // al crear. Se SUMA al ya registrado: el interés del ciclo anterior se ganó y no se revierte
    // (antes se reemplazaba y esa utilidad se perdía). En interés normal la utilidad entra al
    // pagar cada cuota, como siempre.
    if (datosActualizacion.interes_anticipado && refinanciacion.interesNuevo > 0 && socioNatillera?.natillera_id) {
      await actualizarInteresPrestamo(
        socioNatillera.natillera_id,
        prestamoId,
        refinanciacion.interesNuevo,
        'anticipado',
        false, // no es nuevo
        false, // sumar, no reemplazar
        prestamo.medio_entrega || null
      )
    }

    // Registrar en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarActualizacion(
        'prestamo',
        prestamoId,
        `Se refinanció el préstamo de ${nombreSocio} con nueva fecha de pago: ${formatDate(formRefinanciar.fecha_pago)}`,
        prestamo,
        { ...prestamo, ...datosActualizacion },
        socioNatillera?.natillera_id || null,
        {
          saldo_actual: saldoActual,
          nueva_fecha_pago: formRefinanciar.fecha_pago,
          cuotas_eliminadas: todasCuotas.length,
          cuotas_nuevas: nuevoPlanPagos.length,
          historial_refinanciacion_id: historialInsertado?.id || null
        }
      )
    )
    
    // Recargar los préstamos
    await fetchPrestamos()
    
    // Verificar que el préstamo se actualizó correctamente
    const prestamoActualizadoEnLista = prestamos.value.find(p => p.id === prestamoId)
    console.log('✅ Préstamo en lista después de recargar:', prestamoActualizadoEnLista)
    
    if (prestamoActualizadoEnLista) {
      console.log('🔍 Campos del préstamo recargado:')
      console.log('  - monto:', prestamoActualizadoEnLista.monto)
      console.log('  - interes:', prestamoActualizadoEnLista.interes)
      console.log('  - numero_cuotas:', prestamoActualizadoEnLista.numero_cuotas)
      console.log('  - tipo_interes:', prestamoActualizadoEnLista.tipo_interes)
      console.log('  - periodicidad:', prestamoActualizadoEnLista.periodicidad)
      console.log('  - fecha_inicio:', prestamoActualizadoEnLista.fecha_inicio)
      console.log('  - interes_total:', prestamoActualizadoEnLista.interes_total)
      console.log('  - saldo_actual:', prestamoActualizadoEnLista.saldo_actual)
      console.log('  - interes_anticipado:', prestamoActualizadoEnLista.interes_anticipado)
    } else {
      console.error('❌ No se encontró el préstamo actualizado en la lista')
    }
    
    if (prestamoActualizadoEnLista) {
      // Actualizar también prestamoSeleccionado si está activo
      if (prestamoSeleccionado.value && prestamoSeleccionado.value.id === prestamoId) {
        prestamoSeleccionado.value = { ...prestamoActualizadoEnLista }
      }
    }
    
    // Si el modal de detalle está abierto para este préstamo, recargar también
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      const prestamoActualizado = prestamos.value.find(p => p.id === prestamoId)
      if (prestamoActualizado) {
        await Promise.all([
          fetchPagosPrestamo(prestamoId),
          fetchPlanPagosPrestamo(prestamoId),
          fetchHistorialRefinanciaciones(prestamoId)
        ])
        prestamoDetalle.value = { ...prestamoActualizado }
      }
    }
    
    cerrarModalRefinanciar()
    notificationStore.success('Préstamo refinanciado exitosamente', 'Éxito')
  } catch (e) {
    console.error('Error refinanciando préstamo:', e)
    notificationStore.error(e.message || 'Error al refinanciar el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

async function handleCrearPrestamo() {
  if (soloLectura.value) return
  // Mostrar ventana de carga de inmediato al hacer clic
  generandoPrestamo.value = true
  loading.value = true
  await nextTick() // Dar tiempo a que se pinte el overlay antes de validaciones/async

  // Validar monto mínimo
  const capital = Math.round(capitalAPrestar.value)
  if (capital < 10000) {
    generandoPrestamo.value = false
    loading.value = false
    notificationStore.warning('El monto mínimo del préstamo es $10.000', 'Monto insuficiente')
    return
  }

  const maxCuotasPermitidas = reglasInteresNatillera.value.plazo_maximo
  limitarNumeroCuotasCrearPrestamo()
  const cuotasVal = Number(formPrestamo.numero_cuotas)
  if (!Number.isFinite(cuotasVal) || cuotasVal < 1 || cuotasVal > maxCuotasPermitidas) {
    generandoPrestamo.value = false
    loading.value = false
    notificationStore.warning(
      `El número de cuotas debe estar entre 1 y ${maxCuotasPermitidas}, según el plazo máximo configurado en la natillera.`,
      'Plazo no válido'
    )
    return
  }

  // Validar que haya recaudado suficiente según la forma de pago seleccionada.
  // Lo que sale del fondo es lo que recibe el socio: el capital completo, sea normal o anticipado.
  const montoAfectaFondo = capital
  const natilleraId = id
  if (natilleraId) {
    try {
      const natillera = await natillerasStore.fetchNatillera(natilleraId)
      if (natillera) {
        const stats = await natillerasStore.calcularEstadisticas(natillera)
        const medio = (formPrestamo.medio_entrega || 'efectivo').toLowerCase()
        const disponibleEfectivo = Math.max(0, (stats.totalRecaudadoEfectivo || 0) - (stats.totalDesembolsadoEfectivo || 0))
        const disponibleTransferencia = Math.max(0, (stats.totalRecaudadoTransferencia || 0) - (stats.totalDesembolsadoTransferencia || 0))
        if (medio === 'efectivo' && montoAfectaFondo > disponibleEfectivo) {
          generandoPrestamo.value = false
          loading.value = false
          notificationStore.warning(
            `No hay suficiente recaudado en efectivo para este préstamo. Disponible: $${formatMoney(disponibleEfectivo)}. Valor a desembolsar: $${formatMoney(montoAfectaFondo)}.`,
            'Fondo insuficiente (efectivo)'
          )
          return
        }
        if (medio === 'transferencia' && montoAfectaFondo > disponibleTransferencia) {
          generandoPrestamo.value = false
          loading.value = false
          notificationStore.warning(
            `No hay suficiente recaudado por transferencia para este préstamo. Disponible: $${formatMoney(disponibleTransferencia)}. Valor a desembolsar: $${formatMoney(montoAfectaFondo)}.`,
            'Fondo insuficiente (transferencia)'
          )
          return
        }
      }
    } catch (e) {
      console.warn('No se pudo validar fondo por forma de pago:', e)
      // No bloquear la creación si falla la consulta de estadísticas
    }
  }

  try {
    // Calcular el interés total (siempre con la misma fórmula: simple o compuesto)
    const interesTotalCalculado = Math.round(interesTotal.value)
    // El saldo inicial siempre es capital + intereses (total a pagar por el socio)
    const saldoInicial = capital + interesTotalCalculado

    const socioNatReplica = socios.value.find(s => s.id === formPrestamo.socio_natillera_id)
    const nombreSocioReplica = socioNatReplica?.socio?.nombre || socioNatReplica?.nombre || null
    const natilleraReplica = await natillerasStore.fetchNatillera(id)
    const nombreNatilleraReplica = natilleraReplica?.nombre || null
    
    const { data, error } = await supabase
      .from('prestamos')
      .insert({
        socio_natillera_id: formPrestamo.socio_natillera_id,
        monto: capital,
        interes: formPrestamo.interes,
        saldo_actual: saldoInicial,
        estado: 'activo',
        tipo_interes: formPrestamo.tipo_interes,
        interes_anticipado: mostrarInteresAnticipado.value,
        interes_total: interesTotalCalculado,
        numero_cuotas: formPrestamo.numero_cuotas,
        periodicidad: formPrestamo.periodicidad,
        medio_entrega: formPrestamo.medio_entrega || 'efectivo',
        nombre_socio: nombreSocioReplica,
        nombre_natillera: nombreNatilleraReplica
      })
      .select(`
        *,
        socio_natillera:socios_natillera(*, socio:socios(*))
      `)
      .single()

    if (error) throw error
    
    // Obtener el natillera_id del socio_natillera
    const { data: socioNatillera } = await supabase
      .from('socios_natillera')
      .select('natillera_id')
      .eq('id', formPrestamo.socio_natillera_id)
      .single()
    
    const nombreSocio = data.socio_natillera?.socio?.nombre || 'Socio'
    
    // Generar plan de pagos usando la fecha del formulario
    // Resolver nombres con fallback al join recién devuelto y a las réplicas pre-calculadas
    const nombreSocioParaPlan = data.nombre_socio
      || data.socio_natillera?.socio?.nombre
      || nombreSocioReplica
      || null
    const nombreNatilleraParaPlan = data.nombre_natillera
      || nombreNatilleraReplica
      || null

    // Usamos la fecha directamente sin convertir a UTC para evitar problemas de zona horaria
    const planPagos = generarPlanPagos({
      ...data,
      tipo_interes: formPrestamo.tipo_interes,
      interes_anticipado: mostrarInteresAnticipado.value,
      numero_cuotas: formPrestamo.numero_cuotas,
      periodicidad: formPrestamo.periodicidad,
      fecha_inicio: formPrestamo.fecha_pago || data.created_at,
      nombre_socio: nombreSocioParaPlan,
      nombre_natillera: nombreNatilleraParaPlan
    })
    
    // Insertar plan de pagos en la base de datos
    if (planPagos.length > 0) {
      const { error: errorPlan } = await supabase
        .from('plan_pagos_prestamo')
        .insert(planPagos)
      
      if (errorPlan) {
        console.error('Error al crear plan de pagos:', errorPlan)
        // No lanzar error, solo registrar en consola
      }
    }
    
    // Registrar interés en utilidades_clasificadas SOLO para préstamos NUEVOS con interés anticipado
    if (mostrarInteresAnticipado.value && interesTotalCalculado > 0 && socioNatillera?.natillera_id) {
      await actualizarInteresPrestamo(
        socioNatillera.natillera_id,
        data.id,
        interesTotalCalculado,
        'anticipado',
        true, // esNuevo
        false,
        formPrestamo.medio_entrega || null // forma_pago para clasificación (medio de entrega del préstamo)
      )
      console.log('✅ Interés anticipado registrado en utilidades_clasificadas:', {
        prestamoId: data.id,
        interesTotal: interesTotalCalculado
      })
    }
    
    // Registrar en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarCreacion(
        'prestamo',
        data.id,
        `Se creó un préstamo de $${formatMoney(capital)} para ${nombreSocio}`,
        {
          monto: capital,
          interes: formPrestamo.interes,
          tipo_interes: formPrestamo.tipo_interes,
          numero_cuotas: formPrestamo.numero_cuotas,
          periodicidad: formPrestamo.periodicidad,
          interes_anticipado: mostrarInteresAnticipado.value,
          interes_total: interesTotalCalculado,
          saldo_actual: saldoInicial,
          estado: 'activo'
        },
        socioNatillera?.natillera_id || null
      )
    )
    
    // Recargar todos los préstamos para incluir el nuevo con toda su información calculada
    await fetchPrestamos()
    // Mostrar comprobante en el mismo modal con opciones Descargar y WhatsApp (no cerrar aún)
    prestamoRecienCreado.value = { prestamo: data, planPagos }
    notificationStore.success('Préstamo creado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al crear el préstamo', 'Error')
  } finally {
    loading.value = false
    generandoPrestamo.value = false
  }
}

function cerrarModalNuevoPrestamo() {
  modalNuevoPrestamo.value = false
  pasoNuevoPrestamo.value = 0
  prestamoRecienCreado.value = null
  formPrestamo.socio_natillera_id = ''
  formPrestamo.monto = 100000
  aplicarDefaultsFormularioCrearPrestamo()
  formPrestamo.tipo_interes = 'simple'
  formPrestamo.periodicidad = 'mensual'
  formPrestamo.fecha_pago = getCurrentDateISO()
  formPrestamo.medio_entrega = 'efectivo'
  montoFormateado.value = '100.000'
  mostrarSelectorSocio.value = false
  busquedaSocio.value = ''
  mostrarInteresAnticipado.value = false
  if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
}

let stashAbonoEliminar = null
let stashPrestamoEliminar = null

const { requestCloseTop: requestCloseTopModal, hasOpenModal } = useModalStack({
  interesesGanados: {
    isOpen: computed(() => !!modalInteresesGanados.value),
    hide: () => { modalInteresesGanados.value = false },
    show: () => { modalInteresesGanados.value = true },
    dismiss: () => {
      modalInteresesGanados.value = false
      if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    }
  },
  nuevoPrestamo: {
    isOpen: computed(() => !!modalNuevoPrestamo.value),
    hide: () => {
      modalNuevoPrestamo.value = false
    },
    show: () => {
      modalNuevoPrestamo.value = true
    },
    dismiss: cerrarModalNuevoPrestamo
  },
  abono: {
    isOpen: computed(() => !!modalAbono.value),
    hide: () => {
      modalAbono.value = false
    },
    show: () => {
      modalAbono.value = true
    },
    dismiss: cerrarModalAbono
  },
  comprobanteAbono: {
    isOpen: computed(() => !!(modalComprobanteAbono.value && comprobanteAbono.value)),
    hide: () => {
      modalComprobanteAbono.value = false
    },
    show: () => {
      modalComprobanteAbono.value = true
    },
    dismiss: () => {
      modalComprobanteAbono.value = false
    }
  },
  comprobantePagado: {
    isOpen: computed(() => !!(modalComprobantePagado.value && comprobantePagado.value)),
    hide: () => {
      modalComprobantePagado.value = false
    },
    show: () => {
      modalComprobantePagado.value = true
    },
    dismiss: () => {
      modalComprobantePagado.value = false
      comprobantePagado.value = null
    }
  },
  editarAbono: {
    isOpen: computed(() => !!(modalEditarAbono.value && abonoAEditar.value)),
    hide: () => {
      modalEditarAbono.value = false
    },
    show: () => {
      modalEditarAbono.value = true
    },
    dismiss: () => {
      modalEditarAbono.value = false
      abonoAEditar.value = null
    }
  },
  refinanciar: {
    isOpen: computed(() => !!modalRefinanciar.value),
    hide: () => {
      modalRefinanciar.value = false
    },
    show: () => {
      modalRefinanciar.value = true
    },
    dismiss: cerrarModalRefinanciar
  },
  detalle: {
    isOpen: computed(() => !!modalDetalle.value),
    hide: () => {
      modalDetalle.value = false
    },
    show: () => {
      modalDetalle.value = true
    },
    dismiss: () => {
      modalDetalle.value = false
    }
  },
  compartirPrestamo: {
    isOpen: computed(() => !!modalCompartirPrestamo.value),
    hide: () => {
      modalCompartirPrestamo.value = false
    },
    show: () => {
      modalCompartirPrestamo.value = true
    },
    dismiss: () => {
      modalCompartirPrestamo.value = false
    }
  },
  compartirPrestamoNuevo: {
    isOpen: computed(() => !!modalCompartirPrestamoNuevo.value),
    hide: () => {
      modalCompartirPrestamoNuevo.value = false
    },
    show: () => {
      modalCompartirPrestamoNuevo.value = true
    },
    dismiss: () => {
      modalCompartirPrestamoNuevo.value = false
    }
  },
  eliminarAbono: {
    isOpen: computed(() => !!abonoAEliminar.value),
    hide: () => {
      if (abonoAEliminar.value) {
        stashAbonoEliminar = abonoAEliminar.value
        abonoAEliminar.value = null
      }
    },
    show: () => {
      if (stashAbonoEliminar) {
        abonoAEliminar.value = stashAbonoEliminar
        stashAbonoEliminar = null
      }
    },
    dismiss: () => {
      stashAbonoEliminar = null
      abonoAEliminar.value = null
    }
  },
  ayudaInteres: {
    isOpen: computed(() => !!modalAyudaInteres.value),
    hide: () => {
      modalAyudaInteres.value = false
    },
    show: () => {
      modalAyudaInteres.value = true
    },
    dismiss: () => {
      modalAyudaInteres.value = false
    }
  },
  eliminarPrestamo: {
    isOpen: computed(() => !!prestamoAEliminar.value),
    hide: () => {
      if (prestamoAEliminar.value) {
        stashPrestamoEliminar = prestamoAEliminar.value
        prestamoAEliminar.value = null
      }
    },
    show: () => {
      if (stashPrestamoEliminar) {
        prestamoAEliminar.value = stashPrestamoEliminar
        stashPrestamoEliminar = null
      }
    },
    dismiss: () => {
      stashPrestamoEliminar = null
      prestamoAEliminar.value = null
    }
  }
})

// ─── Recorrido guiado de Préstamos (skill natillerapp-recorrido-guiado) ──────
// Va después de useModalStack y de cargaInicial: el watch de arranque los lee al crearse.
const contadorGuiaPrestamos = crearContadorGuia('prestamos')
const guiaPrestamosActiva = ref(false)
/* Se construyen al abrir: dependen del DOM (sin préstamos no hay tarjeta que señalar). */
const pasosGuiaPrestamos = ref([])
let guiaPrestamosAMano = false
/** Una vez por visita: si se cierra, no vuelve a salir sola. */
let guiaPrestamosIntentada = false
let temporizadorGuiaPrestamos = null

/*
 * Sin navegación ni soporte: ya los enseña el recorrido del detalle. Aquí, lo propio:
 * dónde se crea un préstamo, los números de arriba, las dos secciones y qué cuenta
 * cada tarjeta.
 *
 * No abre ninguna modal. Se probó abriendo el formulario de «Nuevo préstamo» y lo que
 * enseñaba era un formulario —que se entiende solo al verlo— a cambio de la parada más
 * lenta del recorrido: la modal tarda en montar, tapa la pantalla que se está enseñando
 * y hay que cerrarla al salir del paso, viniendo de donde se viniera. Señalar el botón
 * cuesta un segundo y deja el recorrido entero en la pantalla real.
 */

/*
 * Cuatro paradas y fuera. Enseña el circuito —crear, mirar, cobrar, cerrar— con las
 * tarjetas y las secciones que ya están a la vista, no cada dato ni cada campo: eso se
 * lee solo, y cada paso de más es uno que la gente se salta.
 */
function construirPasosGuiaPrestamos({ manual = false } = {}) {
  const nombre = String(authStore.userName || '').trim().split(/\s+/)[0]
  const tarjeta = '[data-guia="prestamos-tarjeta"]'
  const pasos = [
    {
      tipo: 'bienvenida',
      // Héroe propio: quien ya vio el del detalle o el de Actividades lo saltaría
      // creyendo que es el mismo recorrido.
      heroe: 'monedas',
      heroePiezas: ['🪙', '💵', '🪙'],
      titulo: nombre ? `¡Hola, ${nombre}!` : '¡Hola!',
      texto: 'Te enseño a manejar los préstamos en menos de un minuto.'
    },
    // Si el botón no está (un visor no puede crear), el filtro del final quita el paso.
    {
      selector: '[data-guia="prestamos-nuevo"]',
      icono: PlusIcon,
      gesto: 'tocar',
      titulo: 'Presta dinero',
      texto: 'Aquí creas un préstamo: monto, plazo e interés.',
      radio: 24,
      margen: 6
    },
    {
      selector: '[data-guia="prestamos-resumen"]',
      icono: ChartBarIcon,
      titulo: 'Tus números',
      texto: 'Lo prestado, lo que volvió y lo que ganó la natillera.',
      recorrer: [
        { selector: '[data-guia="prestamos-resumen-total"]', etiqueta: 'Total · préstamos creados' },
        { selector: '[data-guia="prestamos-resumen-prestado"]', etiqueta: 'Prestado · dinero entregado' },
        { selector: '[data-guia="prestamos-resumen-pagado"]', etiqueta: 'Pagado · lo que ya volvió' },
        { selector: '[data-guia="prestamos-resumen-intereses"]', etiqueta: 'Intereses · ganancia de la natillera' }
      ]
    },
    {
      selector: '[data-guia="prestamos-pestanas"]',
      icono: CheckCircleIcon,
      titulo: 'Por cobrar y pagados',
      texto: 'Aquí los que aún deben; al lado, los que ya terminaron.',
      // Se señalan las dos pestañas en vez de cambiar de sección: el subfoco las nombra
      // sin mover la lista que se enseña en el paso siguiente. Con etiqueta propia porque
      // el texto del botón trae pegado su contador («Por cobrar3»).
      recorrer: [
        { selector: '[data-guia="prestamos-pestanas"] .prestamos-tab:nth-child(1)', etiqueta: 'Por cobrar · todavía deben dinero' },
        { selector: '[data-guia="prestamos-pestanas"] .prestamos-tab:nth-child(2)', etiqueta: 'Pagados · terminaron de pagar' }
      ],
      radio: 20,
      margen: 6
    },
    {
      selector: tarjeta,
      icono: UserIcon,
      titulo: 'Cada préstamo',
      texto: 'Saldo, próximo pago y abono. Tócala para ver el detalle.',
      // El abono va aquí dentro: era una parada propia para señalar un botón que ya se
      // ve en la tarjeta que se está enfocando.
      recorrer: [
        { selector: `${tarjeta} [data-guia-parte="estado"]`, etiqueta: 'Estado · al día, en mora o pagado' },
        { selector: `${tarjeta} [data-guia-parte="saldo"]`, etiqueta: 'Saldo · lo que falta pagar' },
        { selector: `${tarjeta} [data-guia-parte="proximo"]`, etiqueta: 'Próximo pago · con los días de gracia' },
        { selector: `${tarjeta} [data-guia-parte="abonar"]`, etiqueta: 'Abonar · cuando el socio pague' }
      ].filter((item) => document.querySelector(item.selector))
    },
    {
      tipo: 'final',
      titulo: '¡Listo para prestar!',
      // Quien lo abrió a mano ya sabe dónde está el botón: no gasta un paso en decírselo.
      texto: manual
        ? 'Ya sabes crear, abonar y cerrar préstamos.'
        : 'Repítelo cuando quieras con «¿Cómo funciona?».'
    }
  ]
  return pasos.filter((paso) => !paso.selector || paso.antes || document.querySelector(paso.selector))
}

/** ¿Sale solo en esta visita? `?guia=1` lo fuerza para probarlo sin tocar localStorage. */
function tocaGuiaPrestamos() {
  if (route.query.guia === '1') return true
  return contadorGuiaPrestamos.hayPendiente() || contadorGuiaPrestamos.debeMostrar(authStore.user?.id)
}

function abrirGuiaPrestamos({ manual = false } = {}) {
  if (guiaPrestamosActiva.value) return
  // Abierta por cualquier vía cuenta como intentada: al cerrarla la pantalla vuelve a
  // estar «lista» y, sin esto, saldría otra vez sola.
  guiaPrestamosIntentada = true
  guiaPrestamosAMano = manual
  // Un menú «⋯» desplegado cambiaría la tarjeta mientras se enseña
  accionesPrestamoAbiertas.value = null
  pasosGuiaPrestamos.value = construirPasosGuiaPrestamos({ manual })
  guiaPrestamosActiva.value = true
}

/** El abierto a mano no cuenta: verlo a voluntad no debe gastar las visitas en que sale solo. */
function cerrarGuiaPrestamos({ completado } = {}) {
  guiaPrestamosActiva.value = false
  contadorGuiaPrestamos.limpiarPendiente()
  if (!guiaPrestamosAMano) contadorGuiaPrestamos.registrarVista(authStore.user?.id, { completado })
  guiaPrestamosAMano = false
}

/*
 * Arranque automático: con los datos cargados (sin esqueleto) y sin ninguna modal abierta
 * (p. ej. un borrador de abono restaurado al entrar). Tras un respiro, se vuelve a comprobar.
 */
const pantallaPrestamosLista = computed(() => !cargaInicial.value && !hasOpenModal.value)

watch(pantallaPrestamosLista, (lista) => {
  clearTimeout(temporizadorGuiaPrestamos)
  if (!lista || guiaPrestamosIntentada || !tocaGuiaPrestamos()) return
  // Las tarjetas entran con animación: medirlas antes descuadra el foco.
  temporizadorGuiaPrestamos = setTimeout(() => {
    if (!pantallaPrestamosLista.value || guiaPrestamosIntentada) return
    guiaPrestamosIntentada = true
    abrirGuiaPrestamos()
  }, 650)
})

onUnmounted(() => clearTimeout(temporizadorGuiaPrestamos))

/*
 * Cierre del selector de socio al tocar fuera. En `pointerdown` y en fase de captura: el
 * `click` en document nunca llegaba desde dentro del modal (la card lo corta con
 * `@click.stop`), y iOS ni siquiera dispara `click` al tocar zonas que no son clicables.
 */
function handleClickOutside(event) {
  if (mostrarSelectorSocio.value && !event.target.closest?.('.selector-socio-container')) {
    cerrarSelectorSocio()
  }
}

onMounted(async () => {
  document.addEventListener('pointerdown', handleClickOutside, true)

  // Observer de la cabecera para mostrar/ocultar el FAB
  if (typeof IntersectionObserver !== 'undefined' && headerRef.value) {
    headerObserver = new IntersectionObserver(
      ([entrada]) => { headerVisible.value = entrada.isIntersecting },
      { threshold: 0, rootMargin: '0px 0px -8px 0px' }
    )
    headerObserver.observe(headerRef.value)
  }

  /*
   * Las reglas y los préstamos no dependen unos de otros, así que van a la vez.
   * Antes las reglas se esperaban enteras antes de empezar siquiera a pedir los
   * préstamos, y eso era un viaje de ida y vuelta a us-east-1 de puro tiempo
   * muerto. Si resulta que la natillera no permite préstamos se redirige igual;
   * lo único que se pierde es una consulta que ya iba en paralelo, y ese es el
   * caso raro.
   */
  const [nNat] = await Promise.all([
    cargarReglasPrestamoNatillera(),
    fetchPrestamos(),
  ])

  if (nNat && natilleraPrestamosDeshabilitados(nNat)) {
    notificationStore.info('La natillera no permite préstamos', 'Préstamos')
    router.replace(`/natilleras/${id}`)
    return
  }

  fetchSocios()
  tryRestorePrestamosWorkDraft()
})

onUnmounted(() => {
  headerObserver?.disconnect()
  document.removeEventListener('pointerdown', handleClickOutside, true)
  // Frames y temporizadores pendientes no deben tocar refs de una vista ya desmontada
  cancelarScrollDetalle()
  for (const raf of [
    rafIndicadorScrollModalDetalle,
    rafIndicadorScrollModalNuevoPrestamo,
    rafNatiscrollModalProyeccion,
    rafNatiscrollModalCompartirPrestamo,
    rafIndicadorScrollModalAbono
  ]) {
    if (raf != null) cancelAnimationFrame(raf)
  }
})

async function handleRegistrarAbono() {
  if (soloLectura.value) return
  console.log('🚀 handleRegistrarAbono llamado')
  console.log('📋 prestamoSeleccionado.value:', prestamoSeleccionado.value)
  console.log('💰 formAbono.valor:', formAbono.valor)
  
  if (!prestamoSeleccionado.value) {
    console.error('❌ No hay préstamo seleccionado')
    notificationStore.error('No hay préstamo seleccionado', 'Error')
    return
  }
  
  if (!formAbono.valor || formAbono.valor <= 0) {
    console.error('❌ Valor del abono inválido:', formAbono.valor)
    notificationStore.error('El valor del abono debe ser mayor a 0', 'Error')
    return
  }
  
  console.log('⏳ Iniciando registro de abono...')
  loading.value = true

  try {
    // Split: la mora se cobra PROPORCIONAL a la(s) cuota(s) que se pagan (recorriendo
    // las vencidas de la más antigua a la más nueva); va al fondo, no baja el saldo. El
    // resto es el abono al préstamo (capital+interés) que sí reduce el saldo.
    // Primero el interés de mora (a utilidades); el resto se abona al préstamo.
    const desgloseAbonoReg = desglosarAbono({
      valor: formAbono.valor,
      cuotasVencidasOrdenadas: prestamoSeleccionado.value.cuotasVencidasOrdenadas,
      cuotasConMoraPendiente: prestamoSeleccionado.value.cuotasConMoraPendiente,
      tasaMora: reglasInteresNatillera.value.tasa_mora,
      fechaCorte: fechaCorteAbono.value,       // la misma fecha que vio el usuario en el desglose
      diasGracia: diasGraciaPrestamos.value,
      cobrarMora: true
    })
    const moraPagada = desgloseAbonoReg.moraPagada
    const abonoAPrestamo = desgloseAbonoReg.abonoAPrestamo
    const movimientosMora = desgloseAbonoReg.movimientos

    const nuevoSaldo = prestamoSeleccionado.value.saldo_actual - abonoAPrestamo
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'activo'

    // Verificar que el préstamo existe y pertenece al usuario antes de insertar
    console.log('🔍 Verificando préstamo antes de insertar...')
    const { data: prestamoVerificado, error: errorVerificacion } = await supabase
      .from('prestamos')
      .select(`
        id,
        socio_natillera_id,
        socios_natillera!inner(
          id,
          natillera_id,
          natilleras!inner(
            id,
            admin_id
          )
        )
      `)
      .eq('id', prestamoSeleccionado.value.id)
      .single()
    
    console.log('🔍 Resultado de verificación:', { prestamoVerificado, errorVerificacion })
    
    if (errorVerificacion || !prestamoVerificado) {
      console.error('❌ Error verificando préstamo:', errorVerificacion)
      throw new Error('No se pudo verificar el préstamo. Verifica que pertenezca a tu natillera.')
    }
    
    console.log('✅ Préstamo verificado correctamente')
    console.log('📋 Admin ID del préstamo:', prestamoVerificado.socios_natillera?.natilleras?.admin_id)
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Usuario actual:', user?.id)
    
    // Generar código de comprobante único
    let codigoComprobante = generarCodigoComprobante()
    let intentos = 0
    let codigoUnico = false
    while (!codigoUnico && intentos < 5) {
      const { data: codigoExistente } = await supabase
        .from('pagos_prestamo')
        .select('id')
        .eq('codigo_comprobante', codigoComprobante)
        .limit(1)
      
      if (!codigoExistente || codigoExistente.length === 0) {
        codigoUnico = true
      } else {
        codigoComprobante = generarCodigoComprobante()
      }
      intentos++
    }
    
    // Registrar el pago
    // Usar la fecha en formato YYYY-MM-DD directamente para evitar problemas de zona horaria
    // La base de datos guardará la fecha correctamente
    const fechaPago = formAbono.fecha_pago || formatDateToLocalISO(new Date())
    
    const fp = (formAbono.tipo_pago || 'efectivo').toLowerCase()
    // El pago registrado al préstamo es SOLO la porción de capital+interés (sin mora):
    // así el plan de pagos y el saldo reflejan únicamente la deuda del préstamo.
    const v = abonoAPrestamo
    const natilleraAbono = await natillerasStore.fetchNatillera(id)
    const datosPago = {
      prestamo_id: prestamoSeleccionado.value.id,
      valor: v,
      fecha: fechaPago,
      // `fecha` es el día en que entró el dinero (lo elige el usuario); la causación es
      // cuándo se digitó. Se separan para poder auditar los abonos retroactivos.
      fecha_causacion: new Date().toISOString(),
      codigo_comprobante: codigoComprobante,
      valor_efectivo: fp === 'transferencia' ? 0 : v,
      valor_transferencia: fp === 'transferencia' ? v : 0,
      nombre_socio:
        prestamoSeleccionado.value?.socio_natillera?.socio?.nombre ||
        prestamoSeleccionado.value?.socio_natillera?.nombre ||
        null,
      nombre_natillera: natilleraAbono?.nombre || null,
      origen: 'prestamos',
      mora_cobrada: moraPagada,
      mora_movimientos: movimientosMora.length ? movimientosMora : null
    }
    
    console.log('💾 Registrando abono con datos:', datosPago)
    console.log('💾 Tipo de prestamo_id:', typeof datosPago.prestamo_id)
    console.log('💾 Tipo de valor:', typeof datosPago.valor)
    
    const { data: pagoInsertado, error: errorPago } = await supabase
      .from('pagos_prestamo')
      .insert(datosPago)
      .select()
    
    console.log('📥 Respuesta del insert:', { data: pagoInsertado, error: errorPago })
    
    if (errorPago) {
      console.error('❌ Error insertando pago:', errorPago)
      console.error('❌ Código del error:', errorPago.code)
      console.error('❌ Mensaje del error:', errorPago.message)
      console.error('❌ Detalles completos:', JSON.stringify(errorPago, null, 2))
      throw new Error('Error al registrar el abono: ' + (errorPago.message || 'Error desconocido'))
    }
    
    if (!pagoInsertado || pagoInsertado.length === 0) {
      console.error('❌ No se insertó ningún pago. Respuesta vacía:', pagoInsertado)
      console.error('❌ Esto puede indicar un problema con las políticas RLS')
      throw new Error('No se pudo registrar el abono. Verifica los permisos de la base de datos.')
    }
    
    console.log('✅ Pago insertado correctamente:', pagoInsertado)
    console.log('✅ ID del pago insertado:', pagoInsertado[0]?.id)

    // Obtener datos anteriores del préstamo para auditoría
    const datosAnteriores = {
      saldo_actual: prestamoSeleccionado.value.saldo_actual,
      estado: prestamoSeleccionado.value.estado
    }
    
    // Actualizar el préstamo
    const { data, error } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoSeleccionado.value.id)
      .select(`
        *,
        socio_natillera:socios_natillera(
          natillera_id,
          socio:socios(nombre)
        )
      `)
      .single()

    if (error) throw error

    // Obtener natillera_id
    const natilleraId = data.socio_natillera?.natillera_id || null
    const nombreSocio = data.socio_natillera?.socio?.nombre || 'Socio'
    const socioTelefono = data.socio_natillera?.socio?.telefono || null
    
    // Registrar pago en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarPago(
        pagoInsertado[0].id,
        `Se registró un abono de $${formatMoney(formAbono.valor)} al préstamo de ${nombreSocio}. Saldo anterior: $${formatMoney(datosAnteriores.saldo_actual)}, Saldo nuevo: $${formatMoney(Math.max(0, nuevoSaldo))}`,
        {
          prestamo_id: prestamoSeleccionado.value.id,
          valor_abono: formAbono.valor,
          saldo_anterior: datosAnteriores.saldo_actual,
          saldo_nuevo: Math.max(0, nuevoSaldo),
          estado_anterior: datosAnteriores.estado,
          estado_nuevo: nuevoEstado
        },
        natilleraId
      )
    )
    
    // Registrar actualización del préstamo en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarActualizacion(
        'prestamo',
        prestamoSeleccionado.value.id,
        `Se actualizó el préstamo de ${nombreSocio}. Saldo: $${formatMoney(datosAnteriores.saldo_actual)} → $${formatMoney(Math.max(0, nuevoSaldo))}`,
        datosAnteriores,
        {
          saldo_actual: Math.max(0, nuevoSaldo),
          estado: nuevoEstado
        },
        natilleraId
      )
    )
    
    const prestamoIdAbonado = prestamoSeleccionado.value.id
    const estabaEnDetalle = prestamoDetalle.value && prestamoDetalle.value.id === prestamoIdAbonado
    
    // Actualizar plan de pagos PRIMERO: recalcular todo desde cero con todos los pagos
    // Esto debe hacerse antes de actualizar el préstamo en la lista para que tenga los datos correctos
    await actualizarPlanPagosDespuesDeEditarAbono(prestamoIdAbonado, 0) // 0 porque es un nuevo abono, no una diferencia
    // Mora que el abono dejó pendiente (o que cobró de la pendiente) en cada cuota del plan.
    await aplicarMovimientosMora(movimientosMora, 1)
    
    // Actualizar el préstamo en la lista DESPUÉS de actualizar el plan de pagos
    // para que use los datos actualizados del plan de pagos (con valor_pagado actualizado)
    await actualizarPrestamoEnLista(prestamoIdAbonado)

    // Registrar en el fondo la mora COBRADA en este abono (rubro separado, no capitaliza
    // al saldo). Fire-and-forget.
    if (moraPagada > 0) registrarMoraCobradaEnFondo(natilleraId, moraPagada, fp)
    
    // Si estaba viendo el detalle, recargar los datos
    if (estabaEnDetalle) {
      await Promise.all([
        fetchPagosPrestamo(prestamoIdAbonado),
        fetchPlanPagosPrestamo(prestamoIdAbonado)
      ])
      // Actualizar también el préstamo en el detalle
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
    }
    
    // Preparar datos del comprobante
    // Usar la fecha del formulario si está disponible, sino usar la fecha actual
    // Fecha del pago tal como la registró el usuario, sin hora (la hora era la
    // del momento de registrar, no la del pago, y en el comprobante confundía).
    const fechaPagoComprobante = formatDate(formAbono.fecha_pago || getCurrentDateISO())
    
    comprobanteAbono.value = {
      pagoPrestamoId: pagoInsertado[0].id, // ID del pago de préstamo para auditoría
      prestamoId: prestamoSeleccionado.value.id, // ID del préstamo para auditoría
      valor: formAbono.valor, // total recibido (abono a préstamo + mora)
      moraPagada, // porción de mora cobrada
      abonoAPrestamo, // porción que baja el saldo
      codigoComprobante: codigoComprobante,
      socioNombre: nombreSocio,
      socioTelefono: socioTelefono,
      fecha: fechaPagoComprobante,
      // Lo que debía antes del pago incluye la mora que se cobró: así saldo anterior − valor
      // pagado = saldo nuevo. La mora no está en `saldo_actual` (se cobra aparte, a utilidades).
      saldoAnterior: (parseFloat(datosAnteriores.saldo_actual) || 0) + moraPagada,
      saldoNuevo: Math.max(0, nuevoSaldo),
      prestamo: prestamoSeleccionado.value
    }
    
    cerrarModalAbono()
    
    // Abrir modal de comprobante
    modalComprobanteAbono.value = true
    // El plan ya se recalculó: se ve qué quedó debiendo de las cuotas que tocó el abono.
    const pagoIdComprobante = pagoInsertado[0].id
    cuotasPendientesDelAbono(prestamoIdAbonado, pagoIdComprobante).then(lista => {
      if (comprobanteAbono.value?.pagoPrestamoId === pagoIdComprobante) comprobanteAbono.value = { ...comprobanteAbono.value, cuotasPendientes: lista }
    })
    
    // SIEMPRE recargar los pagos si el modal de detalle está abierto para este préstamo
    if (estabaEnDetalle) {
      console.log('🔄 Actualizando modal de detalle después del abono')
      // Actualizar el préstamo en el detalle con los nuevos datos
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
      // Esperar un momento para que la base de datos se actualice completamente
      await new Promise(resolve => setTimeout(resolve, 500))
      // Recargar los pagos del préstamo
      console.log('🔄 Recargando pagos para préstamo:', prestamoIdAbonado)
      await fetchPagosPrestamo(prestamoIdAbonado)
      // Asegurarse de que el modal de detalle esté abierto y cerrar el desplegable
      planPagosExpandido.value = false // Cerrar el desplegable
      modalDetalle.value = true
      console.log('✅ Modal de detalle actualizado, pagos recargados. Total pagos:', pagosPrestamo.value.length)
      console.log('📋 Lista de pagos:', pagosPrestamo.value)
    } else if (modalDetalle.value && prestamoDetalle.value && prestamoDetalle.value.id === prestamoIdAbonado) {
      // Si el modal de detalle está abierto para este préstamo, recargar también
      console.log('🔄 Recargando pagos en modal de detalle abierto')
      prestamoDetalle.value = { ...prestamoDetalle.value, ...data }
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchPagosPrestamo(prestamoIdAbonado)
      console.log('✅ Pagos recargados. Total:', pagosPrestamo.value.length)
    }
    
    notificationStore.success('Abono registrado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al registrar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function abrirModalEditarAbono(pago) {
  if (soloLectura.value) return
  abonoAEditar.value = {
    ...pago,
    valorOriginal: parseFloat(pago.valor),
    valor: parseFloat(pago.valor)
  }
  valorAbonoEditadoFormateado.value = formatMoney(parseFloat(pago.valor))
  modalEditarAbono.value = true
}

function actualizarValorAbonoEditado(event) {
  // Obtener el valor del input sin formatear
  const valorSinFormato = event.target.value.replace(/\./g, '')
  
  // Si está vacío, establecer en 0
  if (!valorSinFormato || valorSinFormato === '') {
    abonoAEditar.value.valor = 0
    valorAbonoEditadoFormateado.value = ''
    return
  }
  
  // Convertir a número
  const numero = parseInt(valorSinFormato)
  
  // Validar que sea un número válido
  if (isNaN(numero)) {
    return
  }
  
  // Actualizar el valor numérico
  abonoAEditar.value.valor = numero
  
  // Formatear para mostrar en el input
  valorAbonoEditadoFormateado.value = formatMoney(numero)
}

async function guardarAbonoEditado() {
  if (soloLectura.value) return
  if (!abonoAEditar.value || !prestamoDetalle.value) return
  
  loading.value = true
  
  try {
    const valorOriginal = parseFloat(abonoAEditar.value.valorOriginal || abonoAEditar.value.valor)
    const nuevoValor = parseFloat(abonoAEditar.value.valor)
    const diferencia = nuevoValor - valorOriginal
    const prestamoId = abonoAEditar.value.prestamo_id
    const codigoAnterior = abonoAEditar.value.codigo_comprobante
    
    // Si hay código anterior, generar nuevo código y guardar en historial (incluso si el valor no cambió)
    let nuevoCodigoComprobante = null
    if (codigoAnterior) {
      // Generar nuevo código de comprobante cuando se modifica el abono
      nuevoCodigoComprobante = generarCodigoComprobante()
      let intentos = 0
      let codigoUnico = false
      while (!codigoUnico && intentos < 5) {
        const { data: codigoExistente } = await supabase
          .from('pagos_prestamo')
          .select('id')
          .eq('codigo_comprobante', nuevoCodigoComprobante)
          .limit(1)
        
        if (!codigoExistente || codigoExistente.length === 0) {
          codigoUnico = true
        } else {
          nuevoCodigoComprobante = generarCodigoComprobante()
        }
        intentos++
      }
      
      // Guardar en historial antes de actualizar
      if (codigoUnico && nuevoCodigoComprobante) {
        try {
          // Obtener información del préstamo antes de actualizar
          const { data: pagoInfo } = await supabase
            .from('pagos_prestamo')
            .select(`
              prestamo_id,
              prestamo:prestamos(
                id,
                socio_natillera_id
              )
            `)
            .eq('id', abonoAEditar.value.id)
            .single()
          
          const prestamoIdHistorial = pagoInfo?.prestamo_id || prestamoId
          const socioNatilleraId = pagoInfo?.prestamo?.socio_natillera_id || prestamoDetalle.value.socio_natillera_id || null
          const natilleraHistorial = await natillerasStore.fetchNatillera(id)
          const nombreSocioHistorial =
            prestamoDetalle.value?.socio_natillera?.socio?.nombre ||
            prestamoDetalle.value?.socio_natillera?.nombre ||
            null
          
          const { error: historialError } = await supabase
            .from('historial_comprobantes_prestamo')
            .insert({
              pago_prestamo_id: abonoAEditar.value.id,
              prestamo_id: prestamoIdHistorial,
              socio_natillera_id: socioNatilleraId,
              codigo_comprobante_anterior: codigoAnterior,
              codigo_comprobante_nuevo: nuevoCodigoComprobante,
              valor_abono_anterior: valorOriginal,
              valor_abono_nuevo: nuevoValor,
              motivo: 'actualizacion_pago',
              fecha_actualizacion: new Date().toISOString(),
              nombre_socio: nombreSocioHistorial,
              nombre_natillera: natilleraHistorial?.nombre || null
            })
          
          if (historialError) {
            console.error('Error guardando en historial:', historialError)
            throw historialError
          }
          console.log('✅ Historial guardado correctamente para actualización')
        } catch (e) {
          console.error('No se pudo guardar en historial de comprobantes:', e.message, e)
          // No lanzar el error aquí para que la actualización continúe
        }
      }
    }
    
    // Preparar datos de actualización
    const datosActualizar = {
      valor: nuevoValor
    }
    
    // Agregar el nuevo código si se generó
    if (nuevoCodigoComprobante) {
      datosActualizar.codigo_comprobante = nuevoCodigoComprobante
    }
    
    // Actualizar el abono
    const { error: errorActualizar } = await supabase
      .from('pagos_prestamo')
      .update(datosActualizar)
      .eq('id', abonoAEditar.value.id)
    
    if (errorActualizar) throw errorActualizar
    
    // Actualizar el saldo del préstamo (restar la diferencia)
    const nuevoSaldo = (prestamoDetalle.value.saldo_actual || 0) - diferencia
    // Igual que al borrar un abono: con saldo es «activo», sin saldo «pagado».
    const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : 'activo'
    
    const { data: prestamoActualizado, error: errorPrestamo } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: Math.max(0, nuevoSaldo),
        estado: nuevoEstado
      })
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorPrestamo) throw errorPrestamo
    
    // Actualizar el préstamo en la lista con toda su información recalculada
    await actualizarPrestamoEnLista(prestamoId)
    
    // Actualizar el detalle si está abierto
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      const prestamoEnLista = prestamos.value.find(p => p.id === prestamoId)
      if (prestamoEnLista) {
        prestamoDetalle.value = { ...prestamoDetalle.value, ...prestamoEnLista }
      }
      // Recargar los pagos y actualizar el plan de pagos
      await Promise.all([
        fetchPagosPrestamo(prestamoId),
        actualizarPlanPagosDespuesDeEditarAbono(prestamoId, diferencia)
      ])
    }
    
    modalEditarAbono.value = false
    abonoAEditar.value = null
    if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    notificationStore.success('Abono actualizado correctamente', 'Éxito')
  } catch (e) {
    console.error('Error actualizando abono:', e)
    notificationStore.error(e.message || 'Error al actualizar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarAbono(pago) {
  if (soloLectura.value) return
  abonoAEliminar.value = pago
}

async function eliminarAbonoConfirmado() {
  if (soloLectura.value) return
  if (!abonoAEliminar.value || !prestamoDetalle.value) return
  
  loading.value = true
  
  try {
    const valorAbono = parseFloat(abonoAEliminar.value.valor)
    const prestamoId = abonoAEliminar.value.prestamo_id
    const codigoComprobante = abonoAEliminar.value.codigo_comprobante
    const nuevoSaldo = (prestamoDetalle.value.saldo_actual || 0) + valorAbono
    // El estado sale del saldo, nunca del estado anterior: antes solo volvía a «activo»
    // si el saldo recuperaba el monto completo, y un préstamo pagado al que se le
    // borraba un abono se quedaba «pagado» debiendo plata.
    const nuevoEstado = nuevoSaldo > 0 ? 'activo' : 'pagado'
    
    // Obtener información del usuario que elimina
    const { data: { user } } = await supabase.auth.getUser()
    const userEmail = user?.email || 'Usuario desconocido'
    
    // Guardar en historial ANTES de eliminar (si tiene código de comprobante)
    // Importante: guardar antes de eliminar para poder obtener la información del préstamo
    // Registrar TODOS los códigos relacionados (actual y anteriores) para trazabilidad completa
    if (codigoComprobante) {
      try {
        // Obtener información del préstamo antes de eliminar
        const { data: pagoInfo } = await supabase
          .from('pagos_prestamo')
          .select(`
            prestamo_id,
            prestamo:prestamos(
              id,
              socio_natillera_id
            )
          `)
          .eq('id', abonoAEliminar.value.id)
          .single()
        
        const prestamoIdHistorial = pagoInfo?.prestamo_id || prestamoId
        const socioNatilleraId = pagoInfo?.prestamo?.socio_natillera_id || prestamoDetalle.value.socio_natillera_id || null
        const natilleraElim = await natillerasStore.fetchNatillera(id)
        const nombreSocioElim =
          prestamoDetalle.value?.socio_natillera?.socio?.nombre ||
          prestamoDetalle.value?.socio_natillera?.nombre ||
          null
        
        // Buscar todos los códigos anteriores en el historial
        const { data: historialesAnteriores } = await supabase
          .from('historial_comprobantes_prestamo')
          .select('codigo_comprobante_anterior, codigo_comprobante_nuevo')
          .eq('pago_prestamo_id', abonoAEliminar.value.id)
          .order('fecha_actualizacion', { ascending: true })
        
        // Recolectar todos los códigos únicos (anteriores y actual)
        const codigosParaRegistrar = new Set()
        
        // Agregar el código actual
        codigosParaRegistrar.add(codigoComprobante)
        
        // Agregar todos los códigos anteriores del historial
        if (historialesAnteriores && historialesAnteriores.length > 0) {
          historialesAnteriores.forEach(hist => {
            if (hist.codigo_comprobante_anterior) {
              codigosParaRegistrar.add(hist.codigo_comprobante_anterior)
            }
            if (hist.codigo_comprobante_nuevo) {
              codigosParaRegistrar.add(hist.codigo_comprobante_nuevo)
            }
          })
        }
        
        // Registrar cada código en el historial con información de eliminación
        const registrosHistorial = Array.from(codigosParaRegistrar).map(codigo => ({
          pago_prestamo_id: abonoAEliminar.value.id,
          prestamo_id: prestamoIdHistorial,
          socio_natillera_id: socioNatilleraId,
          codigo_comprobante_anterior: codigo,
          codigo_comprobante_nuevo: null,
          valor_abono_anterior: valorAbono,
          valor_abono_nuevo: 0,
          motivo: 'eliminacion_pago',
          eliminado: true,
          eliminado_por: user?.id || null,
          eliminado_por_email: userEmail,
          eliminado_el: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          nombre_socio: nombreSocioElim,
          nombre_natillera: natilleraElim?.nombre || null
        }))
        
        // Insertar todos los registros
        const { error: historialError } = await supabase
          .from('historial_comprobantes_prestamo')
          .insert(registrosHistorial)
        
        if (historialError) {
          console.error('Error guardando en historial:', historialError)
          // No lanzar el error aquí para que la eliminación continúe
          // pero registrar el error para debugging
        } else {
          console.log(`✅ Historial guardado correctamente para eliminación. ${registrosHistorial.length} código(s) registrado(s):`, Array.from(codigosParaRegistrar))
        }
      } catch (e) {
        console.error('No se pudo guardar en historial de comprobantes:', e.message, e)
        // No lanzar el error aquí, solo registrar, para que la eliminación continúe
      }
    }
    
    // Lo que el abono hizo con la mora, para deshacerlo: la que dejó pendiente (o cobró de
    // la pendiente) en cada cuota, y la que cobró y fue al fondo.
    const { data: moraDelAbono } = await supabase
      .from('pagos_prestamo')
      .select('mora_cobrada, mora_movimientos, valor_transferencia')
      .eq('id', abonoAEliminar.value.id)
      .maybeSingle()

    // Eliminar el abono
    const { error: errorEliminar } = await supabase
      .from('pagos_prestamo')
      .delete()
      .eq('id', abonoAEliminar.value.id)
    
    if (errorEliminar) throw errorEliminar

    await aplicarMovimientosMora(moraDelAbono?.mora_movimientos, -1)
    const moraCobradaAbono = parseFloat(moraDelAbono?.mora_cobrada) || 0
    if (moraCobradaAbono > 0) {
      const fpMora = (parseFloat(moraDelAbono?.valor_transferencia) || 0) > 0 ? 'transferencia' : 'efectivo'
      try {
        await registrarMoraCobradaEnFondoNegativa(id, moraCobradaAbono, fpMora)
      } catch (e) {
        console.error(e)
        notificationStore.warning(`No se pudo quitar de utilidades la mora de este abono ($${formatMoney(moraCobradaAbono)}).`, 'Revisar mora', 8000)
      }
    }
    
    // Actualizar el saldo del préstamo
    const { data: prestamoActualizado, error: errorActualizar } = await supabase
      .from('prestamos')
      .update({
        saldo_actual: nuevoSaldo,
        estado: nuevoEstado
      })
      .eq('id', prestamoId)
      .select()
      .single()
    
    if (errorActualizar) throw errorActualizar
    
    // Actualizar el préstamo en la lista con toda su información recalculada
    await actualizarPrestamoEnLista(prestamoId)
    
    // Actualizar el detalle si está abierto
    if (prestamoDetalle.value && prestamoDetalle.value.id === prestamoId) {
      const prestamoEnLista = prestamos.value.find(p => p.id === prestamoId)
      if (prestamoEnLista) {
        prestamoDetalle.value = { ...prestamoDetalle.value, ...prestamoEnLista }
      }
      // Recargar los pagos y actualizar el plan de pagos
      await Promise.all([
        fetchPagosPrestamo(prestamoId),
        actualizarPlanPagosDespuesDeEditarAbono(prestamoId, -valorAbono) // Negativo porque se eliminó
      ])
    }
    
    abonoAEliminar.value = null
    if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    notificationStore.success('Abono eliminado correctamente', 'Éxito')
  } catch (e) {
    console.error('Error eliminando abono:', e)
    notificationStore.error(e.message || 'Error al eliminar el abono', 'Error')
  } finally {
    loading.value = false
  }
}

function confirmarEliminarPrestamo(prestamo) {
  if (soloLectura.value) return
  prestamoAEliminar.value = prestamo
}

async function eliminarPrestamoConfirmado() {
  if (soloLectura.value) return
  if (!prestamoAEliminar.value) return
  loading.value = true

  try {
    // Guardar datos del préstamo antes de eliminar para auditoría
    const prestamoEliminar = prestamoAEliminar.value
    const nombreSocio = prestamoEliminar.socio_natillera?.socio?.nombre || 'Socio'
    
    // Obtener natillera_id
    let natilleraId = null
    if (prestamoEliminar.socio_natillera_id) {
      const { data: socioNatillera } = await supabase
        .from('socios_natillera')
        .select('natillera_id')
        .eq('id', prestamoEliminar.socio_natillera_id)
        .single()
      natilleraId = socioNatillera?.natillera_id || null
    }
    
    // La mora que cobraron sus abonos está en el fondo de utilidades: al borrar el préstamo
    // hay que quitarla, o queda contada (y si el préstamo se vuelve a crear, dos veces).
    const { data: moraDeAbonos } = await supabase
      .from('pagos_prestamo')
      .select('mora_cobrada, valor_transferencia')
      .eq('prestamo_id', prestamoAEliminar.value.id)
      .gt('mora_cobrada', 0)

    // Primero eliminar todos los pagos relacionados
    const { error: errorPagos } = await supabase
      .from('pagos_prestamo')
      .delete()
      .eq('prestamo_id', prestamoAEliminar.value.id)

    if (errorPagos) {
      console.error('Error eliminando pagos:', errorPagos)
      // Continuar aunque haya error en pagos, puede que no haya pagos
    } else if (natilleraId) {
      for (const pago of moraDeAbonos || []) {
        const fpMora = (parseFloat(pago.valor_transferencia) || 0) > 0 ? 'transferencia' : 'efectivo'
        try {
          await registrarMoraCobradaEnFondoNegativa(natilleraId, Math.round(parseFloat(pago.mora_cobrada) || 0), fpMora)
        } catch (e) {
          console.error(e)
          notificationStore.warning('No se pudo quitar de utilidades la mora de los abonos de este préstamo.', 'Revisar mora', 8000)
        }
      }
    }

    // Eliminar el interés del préstamo de utilidades_clasificadas antes de eliminar el préstamo
    if (natilleraId) {
      await eliminarInteresPrestamo(natilleraId, prestamoAEliminar.value.id)
    }

    // Luego eliminar el préstamo
    const { error } = await supabase
      .from('prestamos')
      .delete()
      .eq('id', prestamoAEliminar.value.id)

    if (error) throw error

    // Registrar eliminación en auditoría
    registrarAuditoriaEnSegundoPlano(
      auditoria.registrarEliminacion(
        'prestamo',
        prestamoEliminar.id,
        `Se eliminó el préstamo de $${formatMoney(prestamoEliminar.monto)} de ${nombreSocio}`,
        {
          monto: prestamoEliminar.monto,
          interes: prestamoEliminar.interes,
          saldo_actual: prestamoEliminar.saldo_actual,
          estado: prestamoEliminar.estado,
          tipo_interes: prestamoEliminar.tipo_interes,
          numero_cuotas: prestamoEliminar.numero_cuotas
        },
        natilleraId
      )
    )

    prestamoAEliminar.value = null
    if (!__modalStackSync.skip) __modalStackSync.afterDismiss?.()
    
    // Recargar todos los préstamos y planes de pago para actualizar los indicadores
    await fetchPrestamos()
    
    notificationStore.success('Préstamo eliminado exitosamente', 'Éxito')
  } catch (e) {
    notificationStore.error(e.message || 'Error al eliminar el préstamo', 'Error')
  } finally {
    loading.value = false
  }
}

async function abrirModalCompartirPrestamo() {
  if (!prestamoDetalle.value) return
  modalCompartirPrestamo.value = true
  await Promise.all([
    fetchPlanPagosPrestamo(prestamoDetalle.value.id),
    fetchHistorialRefinanciaciones(prestamoDetalle.value.id)
  ])
  await nextTick()
  await nextTick()
  programarNatiscrollModalCompartirPrestamo()
  // La imagen se captura cuando el plan y el historial ya están pintados
  if (modalCompartirPrestamo.value) imagenPrestamo.programar()
}

const imagenPrestamo = crearImagenPreparada({
  preparando: generandoImagenPrestamo,
  capturar: () => (prestamoDetalle.value && prestamoRef.value
    ? toPng(prestamoRef.value, { backgroundColor: '#eef1f4', pixelRatio: 3, cacheBust: true })
    : null),
  nombre: () => `prestamo-${prestamoDetalle.value?.socio_natillera?.socio?.nombre?.replace(/\s+/g, '-') || 'prestamo'}-${Date.now()}.png`
})
const archivoImagenPrestamo = imagenPrestamo.archivo
// Al volver de la pila de modales (false→true) no pasa por abrirModalCompartirPrestamo
watch(modalCompartirPrestamo, abierto => {
  if (abierto) imagenPrestamo.programar()
  else imagenPrestamo.descartar()
})

function descargarPrestamo() {
  if (!prestamoDetalle.value || !archivoImagenPrestamo.value) return
  entregarArchivo(archivoImagenPrestamo.value)
}

// Síncrono: antes esperaba a abrir el modal (consulta a Supabase + 80 ms) y a toPng, y en
// Safari el menú de compartir ya no salía. Los botones viven en el modal, que ya está abierto.
function compartirPrestamoWhatsApp() {
  const prestamo = prestamoDetalle.value
  const archivo = archivoImagenPrestamo.value
  if (!prestamo || !archivo) return
  const nombreSocio = prestamo.socio_natillera?.socio?.nombre || 'prestamo'
  const telefono = prestamo.socio_natillera?.socio?.telefono
  const mensajeCompartir = `Hola ${nombreSocio} 👋\n\nTe envío la información de tu préstamo en la natillera.\n\n¡Gracias por confiar en nosotros! 🙌`
  if (navigator.canShare?.({ files: [archivo] })) {
    navigator.share({
      files: [archivo],
      title: `Información del Préstamo - ${nombreSocio}`,
      text: mensajeCompartir
    }).catch(e => {
      if (e?.name === 'AbortError') return
      console.error('Error compartiendo:', e)
      notificationStore.error('No se pudo compartir la imagen', 'Error')
    })
    return
  }
  entregarArchivo(archivo)
  abrirWhatsAppConMensaje(telefono, `Hola ${nombreSocio} 👋\n\nTe envío la información de tu préstamo. ¡Gracias por confiar en nosotros! 🙌`)
  notificationStore.info('📱 La imagen se descargó. Ahora adjúntala en WhatsApp.', 'Descargado')
}

// Función para abrir el modal de compartir préstamo nuevo
function abrirModalCompartirPrestamoWhatsApp() {
  if (!socioSeleccionado.value) {
    notificationStore.error('Debes seleccionar un socio primero', 'Error')
    return
  }
  
  // Inicializar contacto seleccionado con el socio si tiene teléfono
  if (socioSeleccionado.value.socio?.telefono) {
    contactoSeleccionadoWhatsApp.value = {
      nombre: socioSeleccionado.value.socio.nombre,
      telefono: socioSeleccionado.value.socio.telefono
    }
  } else {
    contactoSeleccionadoWhatsApp.value = { nombre: '', telefono: '' }
  }
  
  modalCompartirPrestamoNuevo.value = true
}

// Comprobante (o proyección) del préstamo nuevo, capturado al abrir su modal
const imagenPrestamoNuevo = crearImagenPreparada({
  preparando: generandoImagenPrestamoNuevo,
  capturar: () => (socioSeleccionado.value && prestamoNuevoRef.value
    ? toPng(prestamoNuevoRef.value, { backgroundColor: '#ecfdf5', pixelRatio: 2, cacheBust: true })
    : null),
  nombre: () => {
    const prefijo = esComprobanteRealCompartir.value ? 'comprobante-prestamo' : 'proyeccion-prestamo'
    const nombreContacto = contactoSeleccionadoWhatsApp.value?.nombre || socioSeleccionado.value?.socio?.nombre || 'prestamo'
    return `${prefijo}-${nombreContacto.replace(/\s+/g, '-')}-${Date.now()}.png`
  }
})
const archivoImagenPrestamoNuevo = imagenPrestamoNuevo.archivo
watch(modalCompartirPrestamoNuevo, abierto => {
  if (abierto) imagenPrestamoNuevo.programar()
  else imagenPrestamoNuevo.descartar()
})

// Resumen del paso final de «Crear préstamo»: se captura en cuanto el préstamo queda creado
const imagenResumenPrestamo = crearImagenPreparada({
  preparando: generandoResumenPrestamo,
  capturar: () => (resumenPrestamoNuevoRef.value
    ? toPng(resumenPrestamoNuevoRef.value, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true })
    : null),
  nombre: () => `resumen-prestamo-${socioSeleccionado.value?.socio?.nombre?.replace(/\s+/g, '-') || 'resumen-prestamo'}-${Date.now()}.png`
})
const archivoImagenResumenPrestamo = imagenResumenPrestamo.archivo
watch([modalNuevoPrestamo, datosComprobanteCreado, pasoNuevoPrestamo], ([abierto, creado, paso]) => {
  if (abierto && creado && paso === 2) {
    if (!archivoImagenResumenPrestamo.value) imagenResumenPrestamo.programar()
    return
  }
  imagenResumenPrestamo.descartar()
})

function descargarResumenPrestamoNuevo() {
  if (!archivoImagenResumenPrestamo.value) return
  entregarArchivo(archivoImagenResumenPrestamo.value)
}

function descargarPrestamoNuevo() {
  if (!socioSeleccionado.value || !archivoImagenPrestamoNuevo.value) return
  entregarArchivo(archivoImagenPrestamoNuevo.value)
}

// Síncrono: la imagen ya está lista y `share`/`window.open` salen del toque.
function compartirPrestamoNuevoWhatsApp() {
  // Sin número no se corta: se comparte igual y es WhatsApp quien pregunta a
  // quién enviarlo. Exigirlo aquí dejaba el botón activo pero la acción muerta.
  if (!socioSeleccionado.value) {
    notificationStore.error('Debes seleccionar un socio', 'Error')
    return
  }
  const archivo = archivoImagenPrestamoNuevo.value
  if (!archivo) return

  // El préstamo ya está creado → comprobante real; si no, proyección (simulación)
  const esReal = esComprobanteRealCompartir.value
  const contacto = contactoSeleccionadoWhatsApp.value || { nombre: '', telefono: '' }
  const nombreSocio = socioSeleccionado.value.socio?.nombre || 'Socio'
  const mensajeCompartir = esReal
    ? `Hola ${contacto.nombre || nombreSocio} 👋\n\nTe envío el *comprobante* del préstamo de ${nombreSocio} en la natillera, ya registrado en el sistema.\n\n¡Gracias por confiar en nosotros! 🙌`
    : `Hola ${contacto.nombre || nombreSocio} 👋\n\nTe envío una *proyección* del posible préstamo de ${nombreSocio} en la natillera (simulación con los datos actuales). *Aún no está registrado ni generado en el sistema*; al confirmarlo en la app recibirás el comprobante oficial.\n\n¡Gracias por confiar en nosotros! 🙌`

  if (navigator.canShare?.({ files: [archivo] })) {
    navigator.share({
      files: [archivo],
      title: esReal ? `Comprobante de préstamo — ${nombreSocio}` : `Proyección de préstamo (no oficial) — ${nombreSocio}`,
      text: mensajeCompartir
    })
      .then(() => notificationStore.success(esReal ? 'Comprobante compartido' : 'Proyección compartida', 'Éxito'))
      .catch(e => {
        if (e?.name === 'AbortError') return
        console.error('Error compartiendo:', e)
        notificationStore.error('No se pudo compartir la imagen', 'Error')
      })
    return
  }
  entregarArchivo(archivo)
  abrirWhatsAppConMensaje(contacto.telefono, mensajeCompartir)
  notificationStore.info(
    esReal
      ? '📱 Imagen del comprobante descargada. Adjúntala en WhatsApp.'
      : '📱 Imagen de proyección descargada. Adjunta en WhatsApp; aún no es préstamo creado.',
    'Descargado'
  )
}
</script>

<style scoped>
/* ---------- Tarjeta de préstamo (ds-card) ---------- */
/* «⋯» icon-only: .ds-btn trae padding horizontal de pill; aquí va cuadrado de 44px */
.prestamo-card__mas {
  width: var(--tap-min, 44px);
  min-width: var(--tap-min, 44px);
  padding: 0;
  flex-shrink: 0;
}
/* .ds-btn--ghost anula min-height; en la tarjeta se recupera el área táctil de 44px */
.prestamo-card__eliminar {
  min-height: var(--tap-min, 44px);
  color: var(--brand-danger, #dc2626);
}
.prestamo-card__eliminar:hover:not(:disabled) {
  background: #fef2f2;
}
/* ds-callout no tiene variante de peligro: mismos radio y padding, con la paleta de .ds-badge--danger */
.prestamo-callout--mora {
  background: #fef2f2;
  color: #991b1b;
  padding: 0.5rem 0.75rem;
}

/* Próximo pago: mismo radio y padding compacto que el callout de mora, en tono marca;
   ámbar cuando quedan 2 días o menos (la gracia ya está incluida en la fecha).
   `flex-wrap` porque en móviles estrechos «Próximo pago 25/09/2026 · En 5 días» y el
   valor no caben en una línea: se parten en dos en vez de desbordar la tarjeta. */
.prestamo-callout--proximo {
  background: var(--brand-primary-soft, #eef5f0);
  color: #1f2937;
  padding: 0.5rem 0.75rem;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
}
.prestamo-callout--proximo-urgente {
  background: #fffbeb;
  color: #92400e;
}

/* ---------- Panel que envuelve las secciones de préstamos ---------- */
.prestamos-panel {
  background: #fff;
  border: 1px solid var(--surface-divider, #e5e7eb);
  border-radius: var(--radius-xl, 1rem);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.08));
  overflow: hidden;
}
.prestamos-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--surface-divider, #e5e7eb);
  background: linear-gradient(180deg, #fbfdfb 0%, #ffffff 100%);
}
@media (min-width: 640px) {
  .prestamos-panel__head { padding: 0.875rem 1.125rem; }
}
.prestamos-panel__summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
  margin-left: auto;
}
.prestamos-panel__summary-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.prestamos-panel__summary-value {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--brand-primary, #1b5e37);
  margin-top: 0.125rem;
}
.prestamos-panel__body {
  padding: 0.75rem;
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(200, 217, 200, 0.16) 0%, transparent 60%),
    #f8fafc;
}
@media (min-width: 640px) {
  .prestamos-panel__body { padding: 1rem; }
}
.prestamos-panel__empty {
  border: 1px dashed var(--surface-divider, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  background: #fff;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

/* ---------- Segmented control: Por cobrar / Pagados ---------- */
.prestamos-tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.75rem;
  background: #f1f5f9;
}
@media (max-width: 639px) {
  .prestamos-tabs { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
}
.prestamos-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  background: transparent;
  transition: color 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  cursor: pointer;
}
.prestamos-tab:hover {
  color: #334155;
}
.prestamos-tab--active {
  color: var(--brand-primary, #1b5e37);
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(27, 94, 55, 0.12);
}
.prestamos-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  background: #e2e8f0;
  color: #475569;
}
.prestamos-tab--active .prestamos-tab__count {
  background: var(--brand-primary-soft, #e8f5e9);
  color: var(--brand-primary, #1b5e37);
}

/* Información de mora colapsable en móvil */
.mora-info-collapsed {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* En desktop, siempre visible */
@media (min-width: 640px) {
  .mora-info-collapsed {
    max-height: none !important;
    opacity: 1 !important;
    overflow: visible !important;
  }
}

.mora-info-expanded {
  max-height: 500px;
  opacity: 1;
}

/* Badge bonito para la forma en que se entregó el préstamo */
.forma-pago-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.85rem 0.5rem 0.55rem;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  background: #fff;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.forma-pago-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--fp-bg-grad);
  opacity: 0.55;
  z-index: -1;
}

.forma-pago-badge:hover {
  transform: translateY(-1px);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.08),
    0 2px 5px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.forma-pago-badge__icon-wrap {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--fp-icon-bg);
  box-shadow:
    0 4px 10px var(--fp-icon-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

.forma-pago-badge__text {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.05;
  gap: 0.1rem;
}

.forma-pago-badge__label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fp-label);
  opacity: 0.78;
}

.forma-pago-badge__value {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--fp-value);
}

/* Variante: efectivo (verde marca) */
.forma-pago-badge--efectivo {
  --fp-bg-grad: linear-gradient(135deg, hsl(152 80% 95%) 0%, hsl(152 70% 88%) 100%);
  --fp-icon-bg: linear-gradient(135deg, hsl(152 69% 32%) 0%, hsl(152 69% 22%) 100%);
  --fp-icon-glow: hsl(152 69% 22% / 0.35);
  --fp-label: hsl(152 45% 30%);
  --fp-value: hsl(152 60% 22%);
  border-color: hsl(152 50% 70% / 0.6);
}

/* Variante: transferencia (azul/índigo) */
.forma-pago-badge--transferencia {
  --fp-bg-grad: linear-gradient(135deg, hsl(214 90% 96%) 0%, hsl(230 80% 92%) 100%);
  --fp-icon-bg: linear-gradient(135deg, hsl(217 80% 50%) 0%, hsl(230 75% 42%) 100%);
  --fp-icon-glow: hsl(220 70% 40% / 0.32);
  --fp-label: hsl(220 50% 35%);
  --fp-value: hsl(220 65% 28%);
  border-color: hsl(220 60% 75% / 0.55);
}
</style>


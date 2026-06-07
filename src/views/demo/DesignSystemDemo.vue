<template>
  <div class="ds-demo-page max-w-5xl mx-auto pb-12 space-y-10">

    <!-- ===== Page header (DS) ============================================ -->
    <header class="ds-page-header">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <div class="ds-page-header__icon">
            <SwatchIcon class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0">
            <h1 class="ds-page-header__title">Sistema de Diseño · Demo</h1>
            <p class="ds-page-header__sub">
              Tipografía Mulish · Color marca <code class="font-mono">#1B5E37</code> · Tokens, componentes y Nati-Notificación
            </p>
          </div>
        </div>
        <div class="ds-page-header__actions">
          <button class="ds-btn ds-btn--secondary" type="button" @click="lanzarDemo">
            <SparklesIcon class="w-4 h-4" />
            Demo combinada
          </button>
          <button class="ds-btn ds-btn--primary" type="button" @click="nati.exito('Toast lanzado desde el page header', 'Listo')">
            <BellAlertIcon class="w-4 h-4" />
            Probar toast
          </button>
        </div>
      </div>
    </header>

    <!-- ===== Tipografía =================================================== -->
    <section class="space-y-3">
      <span class="ds-overline">Tipografía</span>
      <div class="ds-card space-y-4">
        <div>
          <p class="ds-overline mb-2">Display · Mulish 800</p>
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Natilleras claras, equipos tranquilos.
          </h1>
        </div>
        <hr class="border-slate-100" />
        <div>
          <p class="ds-overline mb-2">Encabezado sección · Mulish 700</p>
          <h2 class="text-xl sm:text-2xl font-semibold text-slate-800">
            Préstamos, cuotas y actividades en un lenguaje único
          </h2>
        </div>
        <hr class="border-slate-100" />
        <div>
          <p class="ds-overline mb-2">Cuerpo · Mulish 400</p>
          <p class="text-base text-slate-600 leading-relaxed">
            Mulish es la única fuente del sistema. Cubre títulos (peso 700–800),
            cuerpo (400) y etiquetas técnicas (700, mayúsculas, tracking ancho)
            sin importar tipografías adicionales. Una sola fuente = bundle más
            ligero y coherencia automática.
          </p>
        </div>
        <hr class="border-slate-100" />
        <div>
          <p class="ds-overline mb-2">Numérico KPI · Mulish 800</p>
          <p class="font-display text-4xl font-bold text-[color:var(--brand-primary)] tabular-nums">
            $ 1.245.000
          </p>
        </div>
      </div>
    </section>

    <!-- ===== Paleta y tokens ============================================= -->
    <section class="space-y-3">
      <span class="ds-overline">Tokens de marca</span>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="t in tokens"
          :key="t.name"
          class="ds-card !p-3 flex flex-col gap-2"
        >
          <div
            class="h-14 rounded-md border border-slate-100"
            :style="{ background: t.value }"
          />
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ t.label }}</p>
            <p class="text-xs text-slate-500 font-mono">{{ t.value }}</p>
            <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ t.name }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Botones ====================================================== -->
    <section class="space-y-3">
      <span class="ds-overline">Botones</span>
      <div class="ds-card space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <button class="ds-btn ds-btn--primary"   type="button">
            <CheckIcon class="w-4 h-4" />
            Primary
          </button>
          <button class="ds-btn ds-btn--secondary" type="button">
            <PencilIcon class="w-4 h-4" />
            Secondary
          </button>
          <button class="ds-btn ds-btn--ghost"     type="button">
            <ArrowPathIcon class="w-4 h-4" />
            Ghost
          </button>
          <button class="ds-btn ds-btn--accent"    type="button">
            <SparklesIcon class="w-4 h-4" />
            Accent
          </button>
          <button class="ds-btn ds-btn--danger"    type="button">
            <TrashIcon class="w-4 h-4" />
            Danger
          </button>
          <button class="ds-btn ds-btn--primary"   type="button" disabled>
            <CheckIcon class="w-4 h-4" />
            Disabled
          </button>
        </div>
        <hr class="border-slate-100" />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
          <button class="ds-btn ds-btn--primary ds-btn--block" type="button">
            <PlusIcon class="w-4 h-4" />
            Block primary
          </button>
          <button class="ds-btn ds-btn--secondary ds-btn--block" type="button">
            <ArrowDownTrayIcon class="w-4 h-4" />
            Block secondary
          </button>
        </div>
      </div>
    </section>

    <!-- ===== Inputs / Form ================================================ -->
    <section class="space-y-3">
      <span class="ds-overline">Formulario</span>
      <div class="ds-card grid sm:grid-cols-2 gap-4">
        <div>
          <label class="ds-label">Nombre completo</label>
          <input v-model="form.nombre" class="ds-input" placeholder="Ej. Esteban R." />
        </div>
        <div>
          <label class="ds-label">Cuota mensual</label>
          <input
            v-model="form.cuota"
            class="ds-input"
            :class="{ 'ds-input--error': form.error }"
            placeholder="$ 50.000"
            inputmode="numeric"
          />
          <p v-if="form.error" class="text-xs text-[color:var(--brand-danger)] font-medium mt-1.5">
            La cuota debe ser mayor a cero.
          </p>
        </div>
        <div class="sm:col-span-2">
          <div class="ds-callout">
            <InformationCircleIcon class="w-5 h-5 ds-callout__icon" />
            <div>
              <span class="ds-callout__title">Importante</span>
              <span>El cambio de cuota se aplicará al siguiente periodo, no afecta meses ya generados.</span>
            </div>
          </div>
        </div>
        <div class="sm:col-span-2 flex justify-end gap-2">
          <button class="ds-btn ds-btn--ghost" type="button" @click="resetForm">
            Cancelar
          </button>
          <button class="ds-btn ds-btn--primary" type="button" @click="guardar">
            <CheckIcon class="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    </section>

    <!-- ===== Stat cards ================================================== -->
    <section class="space-y-3">
      <span class="ds-overline">KPIs</span>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="ds-stat-card">
          <div class="ds-stat-card__icon">
            <UsersIcon class="w-5 h-5" />
          </div>
          <p class="ds-stat-card__value">24</p>
          <p class="ds-stat-card__label">Socios activos</p>
        </div>
        <div class="ds-stat-card">
          <div class="ds-stat-card__icon">
            <BanknotesIcon class="w-5 h-5" />
          </div>
          <p class="ds-stat-card__value">$ 1.85M</p>
          <p class="ds-stat-card__label">Prestado</p>
        </div>
        <div class="ds-stat-card">
          <div class="ds-stat-card__icon">
            <ArrowTrendingUpIcon class="w-5 h-5" />
          </div>
          <p class="ds-stat-card__value">$ 320K</p>
          <p class="ds-stat-card__label">Intereses</p>
        </div>
        <div class="ds-stat-card">
          <div class="ds-stat-card__icon">
            <CalendarIcon class="w-5 h-5" />
          </div>
          <p class="ds-stat-card__value">3</p>
          <p class="ds-stat-card__label">Actividades</p>
        </div>
      </div>
    </section>

    <!-- ===== Cards y badges ============================================== -->
    <section class="space-y-3">
      <span class="ds-overline">Tarjetas y badges</span>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="ds-card ds-card--hover">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-slate-800">Cuota junio</p>
              <p class="text-sm text-slate-500">Vence 30/06/2026</p>
            </div>
            <span class="ds-badge ds-badge--success">Pagada</span>
          </div>
          <p class="mt-3 text-2xl font-bold font-display text-[color:var(--brand-primary)]">
            $ 50.000
          </p>
        </div>

        <div class="ds-card ds-card--brand">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-slate-800">Cuota julio</p>
              <p class="text-sm text-slate-500">Vence 30/07/2026</p>
            </div>
            <span class="ds-badge ds-badge--warning">Pendiente</span>
          </div>
          <p class="mt-3 text-2xl font-bold font-display text-slate-800">
            $ 50.000
          </p>
        </div>

        <div class="ds-card">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-slate-800">Cuota mayo</p>
              <p class="text-sm text-slate-500">Vencida hace 12 días</p>
            </div>
            <span class="ds-badge ds-badge--danger">Atrasada</span>
          </div>
          <p class="mt-3 text-2xl font-bold font-display text-[color:var(--brand-danger)]">
            $ 52.500
          </p>
        </div>

        <div class="ds-card ds-card--elevated">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-slate-800">Cuota agosto</p>
              <p class="text-sm text-slate-500">Generada automáticamente</p>
            </div>
            <span class="ds-badge ds-badge--info">Próxima</span>
          </div>
          <p class="mt-3 text-2xl font-bold font-display text-slate-800">
            $ 50.000
          </p>
        </div>

        <div class="ds-card !p-4 sm:col-span-2 flex flex-wrap gap-2">
          <span class="ds-badge ds-badge--brand">Marca</span>
          <span class="ds-badge ds-badge--success">Éxito</span>
          <span class="ds-badge ds-badge--warning">Alerta</span>
          <span class="ds-badge ds-badge--danger">Crítica</span>
          <span class="ds-badge ds-badge--info">Info</span>
          <span class="ds-badge ds-badge--muted">Neutro</span>
        </div>
      </div>
    </section>

    <!-- ===== Empty state ================================================= -->
    <section class="space-y-3">
      <span class="ds-overline">Empty state</span>
      <div class="ds-empty-state">
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
          <button class="ds-btn ds-btn--primary ds-btn--block" type="button">
            <PlusIcon class="w-5 h-5" />
            Agregar Primer Socio
          </button>
        </div>
      </div>
    </section>

    <!-- ===== Modales ===================================================== -->
    <section class="space-y-3">
      <span class="ds-overline">Modales</span>
      <div class="ds-card space-y-3">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Patrón canónico</h3>
          <p class="text-sm text-slate-500">
            <code class="font-mono">ModalWrapper</code> + cabecera verde marca + cuerpo blanco + CTA pill.
            Bottom sheet en móvil, centrado en desktop. Backdrop salvia
            <code class="font-mono">#C8D9C8/70</code> · scroll lock automático ·
            safe-area iOS · X en flex (no <code class="font-mono">absolute</code>).
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="ds-btn ds-btn--primary" type="button" @click="modalEstandar = true">
            <RectangleStackIcon class="w-4 h-4" />
            Modal estándar
          </button>
          <button class="ds-btn ds-btn--secondary" type="button" @click="modalScroll = true">
            <Bars3BottomLeftIcon class="w-4 h-4" />
            Modal con Nati-scroll
          </button>
        </div>
      </div>
    </section>

    <!-- ===== Nati-Notificación =========================================== -->
    <section class="space-y-3">
      <span class="ds-overline">Nati-Notificación</span>
      <div class="ds-card space-y-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Variantes</h3>
          <p class="text-sm text-slate-500">
            Pulsa cada botón para ver el toast en la esquina superior derecha.
            Las variantes <code class="font-mono">alerta</code> y
            <code class="font-mono">critica</code> usan
            <code class="font-mono">role="alert"</code> +
            <code class="font-mono">aria-live="assertive"</code>.
          </p>
        </div>

        <fieldset class="space-y-3">
          <legend class="ds-label !mb-0">Elige una variante</legend>
          <div class="grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Variante de Nati-Notificación">
            <label
              v-for="opt in opcionesVariante"
              :key="opt.value"
              :class="[
                'nati-radio',
                `nati-radio--${opt.value}`,
                { 'nati-radio--checked': varianteSeleccionada === opt.value }
              ]"
            >
              <input
                v-model="varianteSeleccionada"
                type="radio"
                name="nati-variante"
                :value="opt.value"
                class="nati-radio__input"
              />
              <span class="nati-radio__check" aria-hidden="true">
                <span class="nati-radio__dot" />
              </span>
              <component :is="opt.icon" class="nati-radio__icon w-5 h-5" />
              <span class="nati-radio__text">
                <span class="nati-radio__title">{{ opt.label }}</span>
                <span class="nati-radio__hint">{{ opt.hint }}</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="ds-btn ds-btn--primary"
            type="button"
            @click="lanzarVariante"
          >
            <BellAlertIcon class="w-4 h-4" />
            Mostrar notificación
          </button>
          <button class="ds-btn ds-btn--ghost" type="button" @click="lanzarPersistente">
            Toast persistente
          </button>
          <button class="ds-btn ds-btn--ghost" type="button" @click="store.clear()">
            <XMarkIcon class="w-4 h-4" />
            Limpiar todas
          </button>
        </div>

        <pre class="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 overflow-x-auto"><code>// API canónica del DS
const nati = useNotificationStore()

nati.informacion('Mensaje neutro')
nati.exito('Pago registrado', 'Listo')
nati.alerta('Cuota próxima a vencer')
nati.critica('Sin conexión', 'Error')

// Personalizada
nati.show({
  type: 'alerta',
  title: 'Confirmar',
  message: 'Esta acción no se puede deshacer',
  duration: 0   // 0 = persistente
})</code></pre>
      </div>
    </section>

    <p class="text-center text-xs text-slate-400 pt-2">
      Sistema de diseño Natillerapp · Mulish + #1B5E37 · Documentación en
      <code class="font-mono">Funcionalidades/sistema-diseno.md</code>
    </p>

    <!-- ============================================================= -->
    <!-- Modal estándar — patrón "Sin Socios" (cabecera marca compacta) -->
    <!-- ============================================================= -->
    <ModalWrapper
      :show="modalEstandar"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="28rem"
      @close="modalEstandar = false"
    >
      <!-- Cabecera marca (móvil = fila · desktop = bloque centrado) -->
      <header class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <!-- Móvil -->
        <div class="sm:hidden flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <RectangleStackIcon class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-display font-bold text-base leading-tight">Modal estándar</h2>
            <p class="text-[0.6875rem] text-white/85 leading-snug">Patrón canónico del DS</p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex items-center justify-center rounded-xl text-white/90 active:bg-white/15 touch-manipulation flex-shrink-0"
            aria-label="Cerrar"
            @click="modalEstandar = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <!-- Desktop -->
        <div class="hidden sm:flex items-start px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-[3.2rem] h-[3.2rem] rounded-full bg-white/15 flex items-center justify-center mb-3">
              <RectangleStackIcon class="w-6 h-6 text-white" />
            </div>
            <h2 class="font-display font-bold text-lg leading-tight">Modal estándar</h2>
            <p class="text-xs text-white/85 leading-snug mt-1">Patrón canónico del DS</p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/15 touch-manipulation flex-shrink-0"
            aria-label="Cerrar"
            @click="modalEstandar = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Wrapper relative: aloja el scroll + velo natiscroll absoluto -->
      <div class="relative flex-1 min-h-0">
        <!-- Cuerpo (un solo scroll) + acciones al final -->
        <div
          ref="scrollAreaModalEstandar"
          class="h-full overflow-y-auto bg-white px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 [-webkit-overflow-scrolling:touch] overscroll-contain"
          @scroll.passive="programarNatiscrollModalEstandar"
        >
          <p class="text-sm text-slate-700 leading-relaxed">
            Este es el patrón base. Encabezado verde marca compacto, cuerpo blanco
            con texto e iconos del DS, y las acciones (CTA primario + ghost) al
            final dentro del mismo scroll. No hay pie fijo: si el contenido crece,
            todo el bloque se desplaza junto.
          </p>
          <div class="ds-callout">
            <InformationCircleIcon class="w-5 h-5 ds-callout__icon" />
            <div>
              <span class="ds-callout__title">Cuándo usarlo</span>
              <span>Confirmaciones, formularios cortos, mensajes informativos con CTA.</span>
            </div>
          </div>
          <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <button class="ds-btn ds-btn--ghost" type="button" @click="modalEstandar = false">
              Cancelar
            </button>
            <button class="ds-btn ds-btn--primary" type="button" @click="confirmarEstandar">
              <CheckIcon class="w-4 h-4" />
              Entendido
            </button>
          </div>
        </div>

        <!-- Natiscroll: velo + pastilla "Desliza para ver más" (solo si hay overflow no consumido) -->
        <div
          v-show="hayNatiscrollModalEstandar"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-10">
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

    <!-- ============================================================= -->
    <!-- Modal con Nati-scroll — mismo patrón, contenido largo -->
    <!-- ============================================================= -->
    <ModalWrapper
      :show="modalScroll"
      :z-index="50"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
      card-max-width="32rem"
      @close="modalScroll = false"
    >
      <!-- Cabecera marca -->
      <header class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <div class="sm:hidden flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <div class="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Bars3BottomLeftIcon class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-display font-bold text-base leading-tight">Modal con Nati-scroll</h2>
            <p class="text-[0.6875rem] text-white/85 leading-snug">Contenido extenso · scroll interno</p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex items-center justify-center rounded-xl text-white/90 active:bg-white/15 touch-manipulation flex-shrink-0"
            aria-label="Cerrar"
            @click="modalScroll = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="hidden sm:flex items-start px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <div class="w-[3.2rem] h-[3.2rem] rounded-full bg-white/15 flex items-center justify-center mb-3">
              <Bars3BottomLeftIcon class="w-6 h-6 text-white" />
            </div>
            <h2 class="font-display font-bold text-lg leading-tight">Modal con Nati-scroll</h2>
            <p class="text-xs text-white/85 leading-snug mt-1">Contenido extenso · scroll interno</p>
          </div>
          <button
            type="button"
            class="h-11 w-11 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/15 touch-manipulation flex-shrink-0"
            aria-label="Cerrar"
            @click="modalScroll = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Wrapper relative: scroll + velo natiscroll -->
      <div class="relative flex-1 min-h-0">
        <!-- Cuerpo scrolleable: TODO va aquí (texto, lista larga, acciones).
             No usar pie fijo — la skill `natillerapp-modals` lo desaconseja. -->
        <div
          ref="scrollAreaModalScroll"
          class="h-full overflow-y-auto bg-white px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 scrollbar-thin [-webkit-overflow-scrolling:touch] overscroll-contain"
          @scroll.passive="programarNatiscrollModalScroll"
        >
          <p class="text-sm text-slate-700 leading-relaxed">
            Cuando el contenido excede la altura disponible, el cuerpo del modal
            es la única superficie que hace scroll (no la página detrás). La
            cabecera queda anclada arriba; las acciones se ven al final del
            scroll, no en un pie fijo.
          </p>
          <div class="ds-callout">
            <InformationCircleIcon class="w-5 h-5 ds-callout__icon" />
            <div>
              <span class="ds-callout__title">Comprobaciones del DS</span>
              <span>Body lock activo · safe-area abajo · scrollbar fina con tokens marca · natiscroll activo.</span>
            </div>
          </div>

          <div class="space-y-3">
            <p class="ds-overline">Lista de socios (ejemplo)</p>
            <ul class="space-y-2">
              <li
                v-for="socio in sociosDemo"
                :key="socio.id"
                class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white"
              >
                <div class="w-9 h-9 rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {{ socio.iniciales }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ socio.nombre }}</p>
                  <p class="text-xs text-slate-500">Cuota {{ socio.cuota }} · {{ socio.estado }}</p>
                </div>
                <span :class="['ds-badge', socio.badge]">{{ socio.estadoLabel }}</span>
              </li>
            </ul>
          </div>

          <div class="space-y-2">
            <p class="ds-overline">Notas adicionales</p>
            <p class="text-sm text-slate-600 leading-relaxed">
              Lorem ipsum, párrafo extra para forzar el scroll y verificar que la
              cabecera no se mueve, que la safe-area inferior respeta el home
              indicator en iOS, y que al cerrar el modal el body recupera el
              scroll original sin saltos.
            </p>
            <p class="text-sm text-slate-600 leading-relaxed">
              La scrollbar usa los tokens del DS (verde marca sobre blanco).
              En móviles iOS la goma del overscroll está contenida con
              <code class="font-mono">overscroll-contain</code> para evitar que
              el gesto se propague al fondo.
            </p>
            <p class="text-sm text-slate-600 leading-relaxed">
              Mientras quede contenido por debajo del viewport del modal verás
              una pastilla flotante con «Desliza para ver más». Al llegar al
              final del scroll desaparece automáticamente.
            </p>
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <button class="ds-btn ds-btn--ghost" type="button" @click="modalScroll = false">
              Cerrar
            </button>
            <button class="ds-btn ds-btn--primary" type="button" @click="confirmarScroll">
              <CheckIcon class="w-4 h-4" />
              Continuar
            </button>
          </div>
        </div>

        <!-- Natiscroll: velo + pastilla "Desliza para ver más" -->
        <div
          v-show="hayNatiscrollModalScroll"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          aria-hidden="true"
        >
          <div
            class="absolute inset-x-0 bottom-0 z-0 h-36 bg-gradient-to-t from-white/88 via-white/40 to-transparent"
            aria-hidden="true"
          />
          <div class="relative z-[2] flex justify-center px-5 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-12">
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

  </div>
</template>

<script setup>
import { ref, reactive, markRaw, watch, watchEffect, nextTick, onUnmounted } from 'vue'
import { useNotificationStore } from '../../stores/notifications'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import ModalWrapper from '../../components/ModalWrapper.vue'
import {
  SwatchIcon,
  SparklesIcon,
  BellAlertIcon,
  CheckIcon,
  PencilIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  XMarkIcon,
  RectangleStackIcon,
  Bars3BottomLeftIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/solid'

const store = useNotificationStore()
const nati = store

const form = reactive({
  nombre: '',
  cuota: '',
  error: false
})

// Modales de la demo — scroll lock cuando cualquiera de los dos esté abierto
const modalEstandar = ref(false)
const modalScroll = ref(false)
const algunModalAbierto = ref(false)
watchEffect(() => {
  algunModalAbierto.value = modalEstandar.value || modalScroll.value
})
useBodyScrollLock(algunModalAbierto)

const sociosDemo = [
  { id: 1, iniciales: 'ER', nombre: 'Esteban Raigosa',  cuota: '$50.000', estado: 'al día',     estadoLabel: 'Pagada',    badge: 'ds-badge--success' },
  { id: 2, iniciales: 'MV', nombre: 'María Velásquez',  cuota: '$50.000', estado: 'pendiente',  estadoLabel: 'Pendiente', badge: 'ds-badge--warning' },
  { id: 3, iniciales: 'JC', nombre: 'Juan Carlos Pérez', cuota: '$50.000', estado: 'atrasada',  estadoLabel: 'Atrasada',  badge: 'ds-badge--danger' },
  { id: 4, iniciales: 'AL', nombre: 'Ana López',        cuota: '$50.000', estado: 'al día',     estadoLabel: 'Pagada',    badge: 'ds-badge--success' },
  { id: 5, iniciales: 'CM', nombre: 'Camilo Martínez',  cuota: '$50.000', estado: 'al día',     estadoLabel: 'Pagada',    badge: 'ds-badge--success' },
  { id: 6, iniciales: 'SR', nombre: 'Sofía Restrepo',   cuota: '$50.000', estado: 'pendiente',  estadoLabel: 'Pendiente', badge: 'ds-badge--warning' },
  { id: 7, iniciales: 'DG', nombre: 'Diego Guzmán',     cuota: '$50.000', estado: 'al día',     estadoLabel: 'Pagada',    badge: 'ds-badge--success' },
  { id: 8, iniciales: 'LP', nombre: 'Laura Patiño',     cuota: '$50.000', estado: 'pendiente',  estadoLabel: 'Pendiente', badge: 'ds-badge--warning' }
]

function confirmarEstandar() {
  modalEstandar.value = false
  nati.exito('Acción confirmada desde el modal estándar.', 'Listo')
}

function confirmarScroll() {
  modalScroll.value = false
  nati.exito('Continuando desde el modal con scroll.', 'Listo')
}

// =====================================================================
// Natiscroll — patrón canónico (skill `natillerapp-modals`):
//   velo degradado + pastilla "Desliza para ver más" mientras quede
//   contenido sin ver. Implementación con RAF + @scroll.passive.
// =====================================================================
const scrollAreaModalEstandar = ref(null)
const hayNatiscrollModalEstandar = ref(false)
let rafNatiscrollModalEstandar = null

function actualizarNatiscrollModalEstandar() {
  const el = scrollAreaModalEstandar.value
  if (!el || !modalEstandar.value) {
    hayNatiscrollModalEstandar.value = false
    return
  }
  hayNatiscrollModalEstandar.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalEstandar() {
  if (rafNatiscrollModalEstandar != null) cancelAnimationFrame(rafNatiscrollModalEstandar)
  rafNatiscrollModalEstandar = requestAnimationFrame(() => {
    rafNatiscrollModalEstandar = null
    actualizarNatiscrollModalEstandar()
  })
}

const scrollAreaModalScroll = ref(null)
const hayNatiscrollModalScroll = ref(false)
let rafNatiscrollModalScroll = null

function actualizarNatiscrollModalScroll() {
  const el = scrollAreaModalScroll.value
  if (!el || !modalScroll.value) {
    hayNatiscrollModalScroll.value = false
    return
  }
  hayNatiscrollModalScroll.value =
    el.scrollHeight > el.clientHeight + 1 &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function programarNatiscrollModalScroll() {
  if (rafNatiscrollModalScroll != null) cancelAnimationFrame(rafNatiscrollModalScroll)
  rafNatiscrollModalScroll = requestAnimationFrame(() => {
    rafNatiscrollModalScroll = null
    actualizarNatiscrollModalScroll()
  })
}

// Re-medir al abrir cada modal (tras pintar el contenido) y resetear al cerrar
watch(modalEstandar, async (visible) => {
  if (!visible) {
    if (rafNatiscrollModalEstandar != null) {
      cancelAnimationFrame(rafNatiscrollModalEstandar)
      rafNatiscrollModalEstandar = null
    }
    hayNatiscrollModalEstandar.value = false
    return
  }
  await nextTick()
  await nextTick()
  actualizarNatiscrollModalEstandar()
})

watch(modalScroll, async (visible) => {
  if (!visible) {
    if (rafNatiscrollModalScroll != null) {
      cancelAnimationFrame(rafNatiscrollModalScroll)
      rafNatiscrollModalScroll = null
    }
    hayNatiscrollModalScroll.value = false
    return
  }
  await nextTick()
  await nextTick()
  actualizarNatiscrollModalScroll()
})

onUnmounted(() => {
  if (rafNatiscrollModalEstandar != null) cancelAnimationFrame(rafNatiscrollModalEstandar)
  if (rafNatiscrollModalScroll != null) cancelAnimationFrame(rafNatiscrollModalScroll)
})

// Selector de variante para Nati-Notificación
const varianteSeleccionada = ref('informacion')

const opcionesVariante = [
  {
    value: 'informacion',
    label: 'Información',
    hint: 'Mensaje neutro · 5000 ms',
    icon: markRaw(InformationCircleIcon),
    title: 'Información',
    message: 'Tu sesión expira en 2 minutos por inactividad.'
  },
  {
    value: 'exito',
    label: 'Éxito',
    hint: 'Acción completada · 4500 ms',
    icon: markRaw(CheckCircleIcon),
    title: 'Listo',
    message: 'Cuota registrada correctamente.'
  },
  {
    value: 'alerta',
    label: 'Alerta',
    hint: 'Advertencia · 6500 ms',
    icon: markRaw(ExclamationTriangleIcon),
    title: 'Atención',
    message: 'Hay 3 cuotas a punto de vencer este mes.'
  },
  {
    value: 'critica',
    label: 'Crítica',
    hint: 'Error grave · 8000 ms',
    icon: markRaw(XCircleIcon),
    title: 'Sin conexión',
    message: 'No se pudo conectar con el servidor. Revisa tu conexión.'
  }
]

function lanzarVariante() {
  const opt = opcionesVariante.find(o => o.value === varianteSeleccionada.value)
  if (!opt) return
  nati[opt.value](opt.message, opt.title)
}

const tokens = [
  { name: '--brand-primary',         label: 'Primary',         value: '#1B5E37' },
  { name: '--brand-primary-hover',   label: 'Primary hover',   value: '#154a2d' },
  { name: '--brand-primary-active',  label: 'Primary active',  value: '#124228' },
  { name: '--brand-primary-soft',    label: 'Primary soft',    value: '#E8F5E9' },
  { name: '--brand-shell-deep',      label: 'Shell deep',      value: '#0f3d22' },
  { name: '--brand-backdrop-sage',   label: 'Backdrop sage',   value: '#C8D9C8' },
  { name: '--brand-success',         label: 'Success',         value: '#15803d' },
  { name: '--brand-warning',         label: 'Warning',         value: '#b45309' },
  { name: '--brand-danger',          label: 'Danger',          value: '#dc2626' },
  { name: '--brand-info',            label: 'Info',            value: '#1d4ed8' },
  { name: '--surface-canvas',        label: 'Canvas',          value: 'hsl(220, 13%, 92%)' },
  { name: '--surface-card',          label: 'Card',            value: '#ffffff' }
]

function guardar() {
  if (!form.cuota || Number(String(form.cuota).replace(/\D/g, '')) <= 0) {
    form.error = true
    nati.alerta('Revisa los campos del formulario.', 'Datos incompletos')
    return
  }
  form.error = false
  nati.exito(`Cuota guardada: ${form.cuota}`, 'Cambios aplicados')
}

function resetForm() {
  form.nombre = ''
  form.cuota = ''
  form.error = false
  nati.informacion('Formulario reiniciado.')
}

function lanzarPersistente() {
  nati.show({
    type: 'alerta',
    title: 'Acción requerida',
    message: 'Este toast no se cierra solo. Pulsa la X para descartar.',
    duration: 0
  })
}

function lanzarDemo() {
  nati.exito('Sistema de diseño cargado correctamente.', 'Mulish + verde bosque')
  setTimeout(() => nati.informacion('Explora cada sección de la página.'), 700)
}
</script>

<style scoped>
.ds-demo-page {
  font-family: var(--font-body);
  color: #0f172a;
}

.ds-demo-page :deep(code) {
  font-family: var(--font-brand-mono);
  font-size: 0.75em;
  background: rgba(15, 23, 42, 0.06);
  padding: 0.05em 0.35em;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

/* Selector de variante (radios) — comunica el color de cada toast */
.nati-radio {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem 0.75rem 1.125rem;
  background: var(--surface-card, #fff);
  border: 1px solid var(--surface-divider, rgba(15, 23, 42, 0.08));
  border-radius: var(--radius-md, 0.75rem);
  font-family: var(--font-body);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 200ms ease, box-shadow 200ms ease,
              background-color 200ms ease, transform 150ms ease;
  overflow: hidden;
  user-select: none;
}

.nati-radio::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--nati-color);
  opacity: 0.85;
}

.nati-radio:hover {
  border-color: var(--nati-color);
}

.nati-radio:active {
  transform: scale(0.99);
}

.nati-radio--checked {
  border-color: var(--nati-color);
  background: color-mix(in srgb, var(--nati-color) 6%, #fff);
  box-shadow: 0 4px 14px -4px var(--nati-shadow, rgba(15, 83, 45, 0.22));
}

.nati-radio:focus-within {
  outline: 2px solid color-mix(in srgb, var(--nati-color) 50%, transparent);
  outline-offset: 2px;
}

/* Esconde el input nativo manteniéndolo accesible (teclado/lector) */
.nati-radio__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  white-space: nowrap;
}

/* Indicador circular del radio (replicado visualmente) */
.nati-radio__check {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  border: 2px solid color-mix(in srgb, var(--nati-color) 45%, #cbd5e1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.nati-radio--checked .nati-radio__check {
  border-color: var(--nati-color);
}

.nati-radio__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--nati-color);
  transform: scale(0);
  transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nati-radio--checked .nati-radio__dot {
  transform: scale(1);
}

.nati-radio__icon {
  flex-shrink: 0;
  color: var(--nati-color);
}

.nati-radio__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nati-radio__title {
  font-weight: 700;
  font-size: 0.875rem;
  color: #0f172a;
  line-height: 1.2;
}

.nati-radio__hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.nati-radio--informacion { --nati-color: var(--brand-primary, #1B5E37); --nati-shadow: rgba(27, 94, 55, 0.22); }
.nati-radio--exito       { --nati-color: var(--brand-success, #15803d); --nati-shadow: rgba(21, 128, 61, 0.22); }
.nati-radio--alerta      { --nati-color: var(--brand-warning, #b45309); --nati-shadow: rgba(180, 83, 9, 0.22); }
.nati-radio--critica     { --nati-color: var(--brand-danger, #dc2626);  --nati-shadow: rgba(220, 38, 38, 0.22); }
</style>

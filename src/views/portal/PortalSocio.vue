<template>
  <!--
    Portal del socio (Especificaciones/portal-socio, RF-07 a RF-11 y RF-14): su natillera,
    de solo lectura. Los datos llegan de `portal_datos_socio`, que solo responde si esta
    cuenta está vinculada a ese socio y que ya viene filtrada por lo que el admin decidió
    mostrar (ganancias, datos del grupo). El estado de cuenta usa el mismo cálculo que
    Notificar (`construirEstadoSocio`): el socio ve lo mismo que le mandaría el admin.
  -->
  <div
    class="portal mx-auto max-w-4xl space-y-5 pb-8 sm:space-y-6 xl:max-w-7xl"
    :class="{ 'portal--con-barra': !!datos }"
    :style="{ '--tapado-inferior': tapado + 'px' }"
  >
    <!-- En móvil la tarjeta principal hace de cabecera; esta queda para escritorio -->
    <header class="ds-page-header max-lg:hidden">
      <div class="ds-page-header__row">
        <div class="ds-page-header__lead">
          <BackButton to="/dashboard" :inline="true" />
          <div class="ds-page-header__icon">
            <WalletIcon class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h1 class="ds-page-header__title truncate">{{ datos?.natillera?.nombre || 'Mi natillera' }}</h1>
            <p class="ds-page-header__sub">Tu cuenta como socio</p>
          </div>
        </div>
        <div class="ds-page-header__actions hidden sm:flex">
          <!-- Solo para quien además administra esta natillera (dueño o colaborador) -->
          <router-link v-if="natilleraQueAdministra" :to="`/natilleras/${natilleraQueAdministra}`" class="ds-btn ds-btn--secondary">
            <ArrowUturnLeftIcon class="h-4 w-4" aria-hidden="true" />
            <span>Volver a la natillera</span>
          </router-link>
          <button type="button" class="ds-btn ds-btn--secondary" :disabled="cargando" @click="cargar">
            <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': cargando }" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mientras carga no se pinta nada debajo: la pantalla de carga lo cubre todo -->
    <CargaPantalla :visible="cargando" text="Cargando tu natillera" />

    <template v-if="cargando" />

    <div v-else-if="error" class="rounded-2xl border border-red-200 oscuro:border-red-500/30 bg-red-50 oscuro:bg-red-500/15 px-4 py-3 text-sm font-medium text-red-800 oscuro:text-red-300 oscuro:border-peligro-borde oscuro:bg-peligro-suave oscuro:text-peligro">
      {{ error }}
      <!-- min-h-11 con margen negativo: 44 px táctiles sin engordar la línea del aviso -->
      <button type="button" class="ml-2 -my-3 inline-flex min-h-11 items-center font-semibold underline touch-manipulation" @click="cargar">Reintentar</button>
    </div>

    <section v-else-if="!datos" class="ds-empty-state">
      <div class="ds-empty-state__header">
        <div class="ds-empty-state__icon-wrap"><LockClosedIcon class="h-7 w-7 sm:h-8 sm:w-8" /></div>
        <h2 class="ds-empty-state__title">No tienes acceso a esta natillera</h2>
        <p class="ds-empty-state__subtitle">Si eres socio, pídele al administrador que revise tu vínculo.</p>
      </div>
      <div class="ds-empty-state__body">
        <router-link to="/dashboard" class="ds-btn ds-btn--primary">Ir al inicio</router-link>
      </div>
    </section>

    <template v-else>
      <!-- Avisos de estado: natillera cerrada o socio retirado -->
      <div v-if="natilleraCerrada" class="ds-callout">
        <ArchiveBoxIcon class="ds-callout__icon h-5 w-5" />
        <p><span class="ds-callout__title">Natillera cerrada.</span> Las cifras ya son definitivas.</p>
      </div>
      <div v-else-if="socioRetirado" class="ds-callout" style="background: #fff7ed; color: #7c2d12;">
        <InformationCircleIcon class="ds-callout__icon h-5 w-5" style="color: #c2410c;" />
        <p><span class="ds-callout__title" style="color: #9a3412;">Te retiraste de esta natillera.</span> Tu historial sigue aquí para que lo consultes.</p>
      </div>

      <!--
        Desde 1280 px, dos columnas: el resumen fijo a la izquierda y el detalle a la derecha,
        para que el tablero use el ancho en vez de quedarse en una columna de 56 rem.
        Por debajo, una sola columna como siempre.
      -->
      <div class="portal-columnas">
        <!-- ═══ Tablero ═══ -->
        <aside class="portal-columnas__resumen">
          <!-- 1. Tarjeta principal (talonario): el ahorro y, desprendible, lo que debe -->
          <section class="tablero-talon">
            <div class="tablero-talon__ahorro">
              <span class="tablero-talon__circulo tablero-talon__circulo--a" aria-hidden="true" />
              <!-- El marranito de la portada y del login, asomado junto a lo ahorrado (celular) -->
              <EscenaAlcancia compacta disco-translucido class="tablero-talon__alcancia" />
              <!--
                El saludo abre la tarjeta; en móvil el marranito va arriba a la derecha y, si esta
                cuenta administra la natillera, «Administrar» junto al saludo. Actualizar queda
                solo en escritorio (cabecera de la página). El nombre de la natillera va en la
                cabecera de la app.
              -->
              <div class="tablero-talon__fila-hola relative flex items-center gap-2">
                <p class="tablero-talon__hola min-w-0 flex-1 truncate">Hola, {{ primerNombre }}</p>
                <router-link
                  v-if="natilleraQueAdministra"
                  :to="`/natilleras/${natilleraQueAdministra}`"
                  class="tablero-talon__boton lg:hidden"
                >
                  <ArrowUturnLeftIcon class="h-4 w-4" aria-hidden="true" />
                  Administrar
                </router-link>
              </div>
              <p class="tablero-etiqueta tablero-etiqueta--clara relative mt-4">Llevas ahorrado</p>
              <p class="tablero-talon__valor relative mt-1 tabular-nums">${{ formatMoney(estado.totalAhorrado) }}</p>
              <!--
                Una casilla por cuota, agrupadas por mes con el mes debajo: en quincenal las dos
                quincenas quedan pegadas y separadas del mes vecino, que es lo que las distingue.
                La leyenda dice qué es cada color y cuántas hay.
              -->
              <template v-if="cuotas.length > 0">
                <ol class="tablero-casillas" aria-hidden="true">
                  <li v-for="m in casillasPorMes" :key="m.clave" class="tablero-casillas__mes-grupo">
                    <span class="tablero-casillas__par">
                      <span
                        v-for="c in m.cuotas"
                        :key="c.id"
                        class="tablero-casilla"
                        :class="`tablero-casilla--${c.estadoReal}`"
                        :title="`${c.periodo}: ${ETIQUETA_ESTADO[c.estadoReal]}`"
                      />
                    </span>
                    <span class="tablero-casillas__mes">{{ m.mes }}</span>
                  </li>
                </ol>
                <ul class="tablero-casillas__leyenda" aria-label="Tus cuotas">
                  <li v-for="g in leyendaCasillas" :key="g.estado">
                    <span class="tablero-casilla tablero-casilla--muestra" :class="`tablero-casilla--${g.estado}`" aria-hidden="true" />
                    <strong class="tabular-nums">{{ g.cantidad }}</strong> {{ g.texto }}
                  </li>
                </ul>
              </template>
            </div>

            <!-- Perforación del talonario -->
            <div class="tablero-talon__corte" aria-hidden="true" />

            <!--
              Lo que debe, en tres partes que se leen de arriba abajo: de qué se trata (con su
              estado y el botón al estado de cuenta), cuánto es, y de qué se compone en una lista
              concepto → valor. Al día, solo el aviso con su ícono.
            -->
            <div class="tablero-talon__deuda" :class="`tablero-talon__deuda--${nivelDeuda}`">
              <!--
                La onda del login y de la portada (misma curva): la parte de lo que debe sube
                sobre el verde. Toma el color de su fondo (currentColor) y baja 1 px dentro para
                que no quede costura de antialias. Solo en celular.
              -->
              <svg class="tablero-talon__onda" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 23 V12 C 14 2, 28 1, 44 9 S 76 21, 100 6 V23 Z" fill="currentColor" />
              </svg>
              <template v-if="estado.totalAPagar > 0">
                <div class="deuda__cabecera">
                  <span class="tablero-etiqueta deuda__titulo">Debes hoy</span>
                  <span class="deuda__estado">{{ nivelDeuda === 'mora' ? 'En mora' : 'Pendiente' }}</span>
                  <button type="button" class="tablero-talon__accion deuda__boton" @click="abrirEstado">
                    <DocumentTextIcon class="h-4 w-4" aria-hidden="true" />
                    Estado
                  </button>
                </div>
                <p class="tablero-talon__debe tabular-nums">${{ formatMoney(estado.totalAPagar) }}</p>
                <!-- Lo que de verdad consigna si paga por transferencia: pegado a la cifra -->
                <p v-if="estado.valor4x1000 > 0" class="deuda__4x1000">
                  Por transferencia <strong class="tabular-nums">${{ formatMoney(estado.totalAPagarCon4x1000) }}</strong>
                  <span class="deuda__4x1000-nota">incluye 4×1000</span>
                </p>
                <ul v-if="renglonesDeuda.length > 0" class="deuda__lista">
                  <li v-for="r in renglonesDeuda" :key="r.clave" class="deuda__fila">
                    <span>{{ r.corto }}</span>
                    <strong class="tabular-nums">${{ formatMoney(r.valor) }}</strong>
                  </li>
                </ul>
              </template>
              <template v-else>
                <div class="deuda__aldia">
                  <span class="deuda__aldia-icono"><CheckCircleIcon class="h-6 w-6" aria-hidden="true" /></span>
                  <span class="min-w-0">
                    <span class="block font-display text-lg font-extrabold text-marca-tinta">Estás al día</span>
                    <span class="block text-xs text-slate-500 oscuro:text-texto-suave">{{ proximoPago ? 'No tienes nada vencido' : 'No debes nada a la fecha' }}</span>
                  </span>
                </div>
                <!-- Al día, lo útil es saber qué sigue -->
                <div v-if="proximoPago" class="deuda__proxima">
                  <span class="min-w-0">
                    <span class="block text-[0.6875rem] font-bold uppercase tracking-wide text-slate-500 oscuro:text-texto-suave">Próxima cuota</span>
                    <span class="block text-sm font-semibold text-slate-800 oscuro:text-texto">{{ proximoPago.fecha }} · {{ proximoPago.cuando }}</span>
                  </span>
                  <strong class="flex-shrink-0 font-display text-lg font-extrabold tabular-nums text-marca-tinta">${{ formatMoney(proximoPago.valor) }}</strong>
                </div>
              </template>
            </div>
          </section>

          <!-- 2. Próximo pago: una línea, no una tarjeta. Solo cuando queda algo por venir. -->
          <!-- Al día, la próxima cuota ya va dentro del talonario -->
          <section v-if="proximoPago && estado.totalAPagar > 0" class="tablero-proximo">
            <span class="tablero-proximo__icono"><CalendarDaysIcon class="h-5 w-5" aria-hidden="true" /></span>
            <div class="min-w-0 flex-1">
              <p class="tablero-proximo__titulo">Próximo pago · {{ proximoPago.cuando }}</p>
              <p class="tablero-proximo__sub">{{ proximoPago.fecha }}</p>
            </div>
            <p class="tablero-proximo__valor tabular-nums">${{ formatMoney(proximoPago.valor) }}</p>
          </section>

          <!-- 3. Ganancias y préstamo: dos filas que llevan a su sección, no dos tarjetas más -->
          <section v-if="ganancias || prestamoResumen" class="tablero-card tablero-card--filas">
            <button v-if="ganancias" type="button" class="tablero-atajo" @click="irASeccion('ganancias')">
              <span class="tablero-atajo__icono tablero-atajo__icono--rosa"><SparklesIcon class="h-5 w-5" aria-hidden="true" /></span>
              <span class="min-w-0 flex-1 text-left">
                <span class="tablero-atajo__titulo">Ganancias</span>
                <span class="tablero-atajo__sub">{{ natilleraCerrada ? 'Definitivo' : 'Estimado, se define al cierre' }}</span>
              </span>
              <span class="tablero-atajo__valor tabular-nums text-[#C2185B] oscuro:text-pink-300">${{ formatMoney(ganancias.utilidadesTotal) }}</span>
              <ChevronRightIcon class="h-4 w-4 shrink-0 text-slate-400 oscuro:text-texto-tenue" aria-hidden="true" />
            </button>
            <button v-if="prestamoResumen" type="button" class="tablero-atajo" @click="irASeccion('prestamos')">
              <span class="tablero-atajo__icono tablero-atajo__icono--azul"><BanknotesIcon class="h-5 w-5" aria-hidden="true" /></span>
              <span class="min-w-0 flex-1 text-left">
                <span class="tablero-atajo__titulo">{{ prestamoResumen.titulo }}</span>
                <span class="tablero-atajo__sub">{{ prestamoResumen.detalle }}</span>
              </span>
              <span class="tablero-atajo__valor tabular-nums text-info">${{ formatMoney(prestamoResumen.saldo) }}</span>
              <ChevronRightIcon class="h-4 w-4 shrink-0 text-slate-400 oscuro:text-texto-tenue" aria-hidden="true" />
            </button>
          </section>

          <!-- 4. Últimos pagos -->
          <section class="tablero-card">
            <div class="tablero-seccion">
              <h2 class="tablero-card__titulo">Tus pagos</h2>
              <button v-if="pagos.length > pagosVisibles" type="button" class="tablero-seccion__ver" @click="verTodosLosPagos">
                Ver los {{ pagos.length }}<ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p v-if="pagos.length === 0" class="py-6 text-center text-sm text-slate-500 oscuro:text-texto-suave">Aún no hay pagos registrados.</p>
            <ol v-else class="tablero-linea">
              <li v-for="p in pagos.slice(0, pagosVisibles)" :key="p.clave" class="tablero-linea__item">
                <span class="tablero-linea__punto" aria-hidden="true" />
                <button type="button" class="tablero-linea__pago" @click="abrirPago(p)">
                  <span class="min-w-0 flex-1 text-left">
                    <span class="block text-[0.9375rem] font-extrabold tabular-nums text-slate-900 oscuro:text-texto-fuerte">${{ formatMoney(p.total) }}</span>
                    <span class="block truncate text-xs text-slate-500 oscuro:text-texto-suave">{{ p.periodo }} · {{ p.fecha }}<template v-if="p.formaPago"> · {{ p.formaPago }}</template></span>
                    <span v-if="num(p.sancion) > 0" class="tablero-linea__sancion">Incluye sanción ${{ formatMoney(p.sancion) }}</span>
                  </span>
                  <span class="tablero-linea__ver"><ReceiptPercentIcon class="h-4 w-4" aria-hidden="true" /> Comprobante</span>
                </button>
              </li>
            </ol>
          </section>
        </aside>

        <div class="portal-columnas__detalle">
          <!-- ─── Detalle ─── -->
          <!-- En móvil las secciones se eligen en la barra inferior: aquí solo va el título. En
               escritorio (sin barra) van las pestañas, salvo que haya una sola sección. -->
          <div ref="seccionesRef" class="scroll-mt-4">
            <!-- Desde 1280 px la barra lateral, siempre visible, hace de pestañas: aquí queda solo el título -->
            <h2 class="tablero-card__titulo px-1" :class="{ 'lg:max-xl:hidden': pestanas.length > 1 }">{{ tituloSeccion }}</h2>
            <div v-if="pestanas.length > 1" class="ds-segmented w-full max-lg:hidden xl:hidden" role="tablist" aria-label="Más detalle">
              <button
                v-for="tab in pestanas"
                :key="tab.valor"
                type="button"
                role="tab"
                :aria-selected="pestana === tab.valor"
                :class="['ds-segmented__opt', pestana === tab.valor ? 'is-selected' : '']"
                @click="pestana = tab.valor"
              >
                {{ tab.etiqueta }}
              </button>
            </div>
          </div>
          <!-- Aportes (RF-08) -->
          <section v-if="pestana === 'aportes'" class="space-y-3">
            <p class="px-1 text-xs text-slate-500 oscuro:text-texto-suave">
              Aportado <strong class="tabular-nums text-slate-900 oscuro:text-texto-fuerte">${{ formatMoney(totalAportado) }}</strong>
              de <span class="tabular-nums">${{ formatMoney(totalProgramado) }}</span>
              <!-- Las sanciones ya pagadas no merecen tarjeta propia, pero sí constar -->
              <template v-if="totalSancionesPagadas > 0">
                · has pagado <strong class="tabular-nums text-slate-700 oscuro:text-texto-medio">${{ formatMoney(totalSancionesPagadas) }}</strong>
                en sanciones, en {{ cuotasConSancion }} {{ cuotasConSancion === 1 ? 'cuota' : 'cuotas' }}
              </template>
            </p>
            <!-- Detalle de sanciones: solo si el admin lo deja ver (config_portal_socio.mostrar_sanciones) -->
            <button
              v-if="puedeVerSanciones"
              type="button"
              class="portal-sanciones"
              @click="verSanciones = true"
            >
              <span class="portal-sanciones__icono"><ScaleIcon class="h-5 w-5" aria-hidden="true" /></span>
              <span class="min-w-0 flex-1 text-left">
                <span class="portal-sanciones__titulo">
                  {{ hayHistorialSanciones ? 'Ver el detalle de tus sanciones' : '¿Cómo funcionan las sanciones?' }}
                </span>
                <span class="portal-sanciones__sub">
                  {{ hayHistorialSanciones ? 'Días de retraso, base, intereses y lo pagado' : 'Plazos y valores de tu natillera' }}
                </span>
              </span>
              <ChevronRightIcon class="h-4 w-4 flex-shrink-0 text-texto-tenue" aria-hidden="true" />
            </button>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar aportes">
              <button
                v-for="f in FILTROS_APORTES"
                :key="f.valor"
                type="button"
                :aria-pressed="filtroAportes === f.valor"
                :class="['portal-filtro', filtroAportes === f.valor ? 'is-activo' : '']"
                @click="filtroAportes = f.valor"
              >
                {{ f.etiqueta }}
                <span class="portal-filtro__n">{{ conteoAportes[f.valor] }}</span>
              </button>
            </div>

            <p v-if="cuotasFiltradas.length === 0" class="portal-panel py-6 text-center text-sm text-texto-suave">
              {{ datos.cuotas.length === 0 ? 'Tu administrador aún no ha generado tus cuotas.' : 'No hay cuotas con este filtro.' }}
            </p>
            <div v-else class="portal-panel portal-panel--lista">
              <template v-for="grupo in cuotasPorAnio" :key="grupo.anio">
                <p class="portal-lista__anio">{{ grupo.anio }}</p>
                <ul class="portal-lista">
                  <li v-for="c in grupo.cuotas" :key="c.id">
                    <button
                      type="button"
                      class="portal-fila"
                      :aria-expanded="cuotaAbierta === c.id"
                      :disabled="!tieneDesglose(c)"
                      @click="cuotaAbierta = cuotaAbierta === c.id ? null : c.id"
                    >
                      <span class="portal-fila__punto" :class="`portal-fila__punto--${c.estadoReal}`" aria-hidden="true" />
                      <span class="min-w-0 flex-1 text-left">
                        <span class="portal-fila__titulo">{{ c.periodo }}</span>
                        <span class="portal-fila__sub">{{ textoFechaCuota(c) }}</span>
                      </span>
                      <!-- Con pagos, lo que pagó en total en esta cuota (todos los conceptos); sin pagos, lo que vale -->
                      <span class="shrink-0 text-right">
                        <template v-if="pagadoEnCuota(c).total > 0">
                          <span class="block text-[10px] font-bold uppercase tracking-wide text-texto-tenue">Pagaste</span>
                          <span class="portal-fila__valor tabular-nums">${{ formatMoney(pagadoEnCuota(c).total) }}</span>
                        </template>
                        <span v-else class="portal-fila__valor tabular-nums">${{ formatMoney(c.valor_cuota) }}</span>
                        <span class="portal-estado" :class="`portal-estado--${c.estadoReal}`">{{ ETIQUETA_ESTADO[c.estadoReal] }}</span>
                      </span>
                      <ChevronDownIcon
                        v-if="tieneDesglose(c)"
                        class="h-4 w-4 shrink-0 text-texto-tenue transition-transform motion-reduce:transition-none"
                        :class="{ 'rotate-180': cuotaAbierta === c.id }"
                        aria-hidden="true"
                      />
                      <span v-else class="w-4 shrink-0" aria-hidden="true" />
                    </button>
                    <!-- Desglose del pago (CA-11) -->
                    <dl v-if="cuotaAbierta === c.id" class="portal-desglose">
                      <div v-if="num(c.valor_pagado_cuota) > 0" class="portal-dl"><dt>Cuota</dt><dd class="tabular-nums">${{ formatMoney(c.valor_pagado_cuota) }}</dd></div>
                      <div v-if="num(c.valor_pagado_sancion) > 0" class="portal-dl"><dt>Sanción</dt><dd class="tabular-nums">${{ formatMoney(c.valor_pagado_sancion) }}</dd></div>
                      <div v-if="num(c.valor_pagado_actividades) > 0" class="portal-dl"><dt>Actividades</dt><dd class="tabular-nums">${{ formatMoney(c.valor_pagado_actividades) }}</dd></div>
                      <div v-if="pagadoEnCuota(c).prestamo > 0" class="portal-dl"><dt>Préstamo</dt><dd class="tabular-nums">${{ formatMoney(pagadoEnCuota(c).prestamo) }}</dd></div>
                      <div v-if="num(c.impuesto_4x1000) > 0" class="portal-dl"><dt>4×1000</dt><dd class="tabular-nums">${{ formatMoney(c.impuesto_4x1000) }}</dd></div>
                      <div v-if="pagadoEnCuota(c).total > 0" class="portal-dl portal-dl--total"><dt>Total pagado</dt><dd class="tabular-nums">${{ formatMoney(pagadoEnCuota(c).total) }}</dd></div>
                      <div v-if="num(c.valor_pagado_efectivo) > 0" class="portal-dl"><dt>En efectivo</dt><dd class="tabular-nums">${{ formatMoney(c.valor_pagado_efectivo) }}</dd></div>
                      <div v-if="num(c.valor_pagado_transferencia) > 0" class="portal-dl"><dt>Por transferencia</dt><dd class="tabular-nums">${{ formatMoney(c.valor_pagado_transferencia) }}</dd></div>
                      <div v-if="c.estadoReal !== 'pagada' && num(c.valor_pagado) > 0" class="portal-dl"><dt>Abonado</dt><dd class="tabular-nums">${{ formatMoney(c.valor_pagado) }}</dd></div>
                      <!-- Un comprobante por cada pago (una cuota puede tener varios abonos) -->
                      <div v-if="(pagosPorCuota[c.id] || []).length > 0" class="portal-desglose__pagos">
                        <button
                          v-for="p in pagosPorCuota[c.id]"
                          :key="p.clave"
                          type="button"
                          class="portal-desglose__comprobante"
                          @click="abrirPago(p)"
                        >
                          <ReceiptPercentIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span class="flex-1 text-left">Comprobante · {{ p.fecha }}</span>
                          <span class="tabular-nums">${{ formatMoney(p.total) }}</span>
                        </button>
                      </div>
                    </dl>
                  </li>
                </ul>
              </template>
            </div>
          </section>

          <!-- Ganancias (RF-09): por concepto y cómo se reparte cada uno -->
          <section v-else-if="pestana === 'ganancias' && ganancias" class="space-y-3">
            <div class="portal-panel">
              <div class="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p class="ds-overline">Tus ganancias</p>
                  <p class="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#C2185B] oscuro:text-pink-300">${{ formatMoney(ganancias.utilidadesTotal) }}</p>
                </div>
                <span v-if="!natilleraCerrada" class="portal-estimado portal-estimado--grande">Estimado, sujeto al cierre</span>
              </div>
              <ul v-if="conceptosGanancia.length > 0" class="mt-4 space-y-3">
                <li v-for="c in conceptosGanancia" :key="c.tipo">
                  <div class="flex items-baseline justify-between gap-3 text-sm">
                    <span class="font-semibold text-texto">{{ c.etiqueta }}</span>
                    <span class="font-bold tabular-nums" :class="c.monto < 0 ? 'text-red-700 oscuro:text-red-300 oscuro:text-peligro' : 'text-texto-fuerte'">{{ c.monto < 0 ? '−' : '' }}${{ formatMoney(Math.abs(c.monto)) }}</span>
                  </div>
                  <!-- Negativo: los gastos pagados con utilidades superaron lo que entró; resta -->
                  <div class="portal-barra mt-1.5" :class="{ 'portal-barra--resta': c.monto < 0 }"><span :style="{ width: c.porcentaje + '%' }" /></div>
                  <p class="mt-1 text-xs text-texto-suave">{{ c.modo === 'proporcional' ? 'Se reparte según lo que has ahorrado' : 'Se reparte en partes iguales entre los socios' }}</p>
                </li>
              </ul>
              <p v-else class="mt-3 text-sm text-texto-suave">Todavía no hay utilidades para repartir.</p>
            </div>
            <div class="portal-panel text-sm">
              <p class="ds-overline">Al cierre</p>
              <dl class="mt-2 space-y-2">
                <div class="portal-dl"><dt>Tu ahorro</dt><dd class="tabular-nums">${{ formatMoney(ganancias.ahorro) }}</dd></div>
                <div class="portal-dl"><dt>+ Tus ganancias</dt><dd class="tabular-nums">${{ formatMoney(ganancias.utilidadesTotal) }}</dd></div>
                <div v-if="num(ganancias.descuentos) > 0" class="portal-dl"><dt>− Lo que debes</dt><dd class="tabular-nums">${{ formatMoney(ganancias.descuentos) }}</dd></div>
                <div class="portal-dl portal-dl--total"><dt>Recibirías</dt><dd class="tabular-nums">${{ formatMoney(ganancias.totalFinal) }}</dd></div>
              </dl>
              <p v-if="calculadoEnTexto" class="mt-3 text-xs text-texto-tenue">Calculado {{ calculadoEnTexto }}.</p>
            </div>
          </section>

          <!-- Préstamos (RF-10) -->
          <section v-else-if="pestana === 'prestamos'" class="space-y-3">
            <article v-for="p in prestamos" :key="p.id" class="portal-panel">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="ds-overline">Préstamo del {{ formatDate(p.fecha_inicio || p.created_at) }}</p>
                  <p class="mt-0.5 font-display text-xl font-bold tabular-nums text-texto-fuerte">${{ formatMoney(p.monto) }}</p>
                  <p v-if="num(p.interes) > 0" class="text-xs text-texto-suave">
                    Interés {{ p.interes }} % mensual{{ p.interes_anticipado ? ' · cobrado por adelantado' : '' }}
                  </p>
                </div>
                <span
                  class="portal-estado"
                  :class="p.estado === 'pagado' ? 'portal-estado--pagada' : p.cuotasEnMora > 0 ? 'portal-estado--mora' : 'portal-estado--pendiente'"
                >
                  {{ p.estado === 'pagado' ? 'Pagado' : p.cuotasEnMora > 0 ? 'En mora' : 'Activo' }}
                </span>
              </div>
              <div class="mt-3">
                <div class="flex items-baseline justify-between text-xs text-texto-suave">
                  <span>{{ p.pagadas }} de {{ p.plan.length }} cuotas pagadas</span>
                  <span>Te falta <strong class="tabular-nums text-texto-fuerte">${{ formatMoney(p.saldo_actual) }}</strong></span>
                </div>
                <div class="portal-barra mt-1.5"><span :style="{ width: p.porcentaje + '%' }" /></div>
              </div>
              <!-- Lo vencido primero: es lo que hay que pagar ya -->
              <div v-if="p.cuotasEnMora > 0" class="portal-aviso portal-aviso--mora">
                <span class="portal-fila__punto portal-fila__punto--mora" aria-hidden="true" />
                <span>
                  {{ p.cuotasEnMora === 1 ? 'Cuota vencida' : `${p.cuotasEnMora} cuotas vencidas` }}:
                  <strong class="tabular-nums">${{ formatMoney(p.totalEnMora) }}</strong>
                  <template v-if="p.primeraEnMora"> · desde el {{ formatDate(p.primeraEnMora.fecha_proyectada) }}</template>
                </span>
              </div>
              <div v-if="p.proxima" class="portal-aviso portal-aviso--proxima">
                <span class="portal-fila__punto portal-fila__punto--pendiente" aria-hidden="true" />
                <span>
                  Siguiente cuota: <strong class="tabular-nums">${{ formatMoney(p.proxima.valor) }}</strong>
                  el {{ formatDate(p.proxima.fecha_proyectada) }}
                </span>
              </div>
              <button
                v-if="p.plan.length > 0"
                type="button"
                class="portal-ver-plan"
                :aria-expanded="prestamoAbierto === p.id"
                @click="prestamoAbierto = prestamoAbierto === p.id ? null : p.id"
              >
                {{ prestamoAbierto === p.id ? 'Ocultar plan de pagos' : 'Ver plan de pagos' }}
                <ChevronDownIcon class="h-4 w-4" :class="{ 'rotate-180': prestamoAbierto === p.id }" aria-hidden="true" />
              </button>
              <ul v-if="prestamoAbierto === p.id" class="portal-plan">
                <li
                  v-for="c in p.plan"
                  :key="c.numero_cuota"
                  class="portal-plan__fila"
                  :class="{ 'is-mora': c.estadoCuota === 'mora', 'is-siguiente': c.esSiguiente }"
                >
                  <span class="portal-fila__punto" :class="`portal-fila__punto--${c.colorPunto}`" aria-hidden="true" />
                  <span class="min-w-0 flex-1">
                    <span class="block">
                      Cuota {{ c.numero_cuota }} · {{ formatDate(c.fecha_proyectada) }}
                      <span v-if="c.estadoCuota === 'mora'" class="portal-estado portal-estado--mora ml-1">Vencida</span>
                      <span v-else-if="c.esSiguiente" class="portal-estado portal-estado--pendiente ml-1">Siguiente</span>
                    </span>
                    <!-- Cuándo se pagó (o cuánto se ha abonado) y el comprobante de cada abono -->
                    <span v-if="c.pagada && c.fecha_pago" class="block text-xs font-semibold text-marca-tinta">Pagada el {{ formatDate(c.fecha_pago) }}</span>
                    <span v-else-if="num(c.valor_pagado) > 0" class="block text-xs font-semibold text-amber-800 oscuro:text-amber-300 oscuro:text-alerta">
                      Abonado ${{ formatMoney(c.valor_pagado) }} · faltan ${{ formatMoney(c.pendiente) }}
                    </span>
                    <span v-if="c.abonos.length > 0" class="mt-1 flex flex-wrap gap-1.5">
                      <button
                        v-for="ab in c.abonos"
                        :key="ab.id"
                        type="button"
                        class="portal-plan__comprobante"
                        @click="abrirComprobanteAbono(p, ab)"
                      >
                        <ReceiptPercentIcon class="h-4 w-4" aria-hidden="true" />
                        Comprobante<template v-if="c.abonos.length > 1"> · {{ formatDate(ab.fecha) }}</template>
                      </button>
                    </span>
                  </span>
                  <span class="tabular-nums font-semibold">${{ formatMoney(c.valor_cuota) }}</span>
                </li>
              </ul>
            </article>
          </section>

          <!-- Actividades (RF-11): de la más antigua a la más reciente; las rifas, con su resultado -->
          <section v-else-if="pestana === 'actividades'">
            <!--
              Una tarjeta por actividad, con el estilo de las demás del portal. La fecha va dentro,
              como línea pequeña (la columna aparte le quitaba ancho a todo en el celular). En las
              rifas, la balota con el número y el resultado: el ganador como etiqueta + nombre,
              con el trofeo en verde de marca, sin pastillas doradas.
            -->
            <ol class="act-lista">
              <li
                v-for="a in actividades"
                :key="a.clave"
                class="act-item"
                :class="{ 'act-item--mia': a.esRifa && a.soyGanador }"
              >
                <div class="act-item__cabecera">
                  <div class="min-w-0 flex-1">
                    <p class="act-item__fecha">{{ a.fechaDia }} {{ a.fechaMes }}<template v-if="!a.esRifa && a.tipo"> · {{ a.tipo }}</template></p>
                    <p class="act-item__titulo">{{ a.descripcion }}</p>
                  </div>
                  <span class="text-right">
                    <span v-if="!a.esRifa" class="block text-sm font-extrabold tabular-nums text-texto-fuerte">${{ formatMoney(a.asignado) }}</span>
                    <span
                      class="portal-estado"
                      :class="a.pendiente > 0 ? 'portal-estado--pendiente' : 'portal-estado--pagada'"
                      :title="a.loteria || undefined"
                    >
                      {{ a.pendiente > 0 ? `${a.esRifa ? 'Debes' : 'Faltan'} $${formatMoney(a.pendiente)}` : 'Pagada' }}
                    </span>
                  </span>
                </div>

                <template v-if="a.esRifa">
                  <div class="act-rifa">
                    <div
                      class="rifa__balota"
                      :class="{ 'rifa__balota--pendiente': !a.jugada }"
                      :aria-label="a.jugada ? `Número ganador ${a.numeroGanador}` : 'Aún sin número ganador'"
                    >
                      {{ a.jugada ? a.numeroGanador : '?' }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <template v-if="a.soyGanador">
                        <p class="act-rifa__etiqueta">Resultado</p>
                        <p class="act-rifa__ganador act-rifa__ganador--mio">
                          <TrophyIcon class="act-rifa__trofeo" aria-hidden="true" />¡Ganaste!
                        </p>
                      </template>
                      <template v-else-if="a.ganaNatillera">
                        <p class="act-rifa__etiqueta">Resultado</p>
                        <p class="act-rifa__ganador">
                          <BuildingLibraryIcon class="act-rifa__trofeo" aria-hidden="true" />Ganó la natillera
                        </p>
                      </template>
                      <template v-else-if="a.jugada">
                        <p class="act-rifa__etiqueta">Ganador</p>
                        <p class="act-rifa__ganador">
                          <TrophyIcon class="act-rifa__trofeo" aria-hidden="true" />{{ a.ganadorNombre || 'No registrado' }}
                        </p>
                      </template>
                      <template v-else>
                        <p class="act-rifa__etiqueta">Sorteo</p>
                        <p class="act-rifa__ganador act-rifa__ganador--pendiente">Se juega {{ a.fechaJuego ? `el ${formatDate(a.fechaJuego)}` : 'pronto' }}</p>
                      </template>
                    </div>
                  </div>
                  <p v-if="a.misNumeros.length > 0" class="rifa__numeros">
                    Tus números:
                    <span
                      v-for="n in a.misNumeros"
                      :key="n"
                      class="rifa__numero"
                      :class="{ 'rifa__numero--ganador': a.jugada && n === a.numeroGanador }"
                    >{{ n }}</span>
                  </p>
                </template>
              </li>
            </ol>
          </section>

          <!-- Grupo (RF-14): según el nivel que eligió el admin -->
          <section v-else-if="pestana === 'grupo' && datos.grupo" class="space-y-3">
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <article class="portal-kpi"><p class="portal-kpi__etiqueta"><UserGroupIcon class="h-4 w-4" aria-hidden="true" /> Socios</p><p class="portal-kpi__valor tabular-nums">{{ datos.grupo.socios_activos }}</p></article>
              <article class="portal-kpi"><p class="portal-kpi__etiqueta"><BanknotesIcon class="h-4 w-4" aria-hidden="true" /> Ahorro del grupo</p><p class="portal-kpi__valor tabular-nums">${{ formatMoney(datos.grupo.ahorro_total) }}</p></article>
              <article class="portal-kpi"><p class="portal-kpi__etiqueta"><ArrowTrendingUpIcon class="h-4 w-4" aria-hidden="true" /> Prestado hoy</p><p class="portal-kpi__valor tabular-nums">${{ formatMoney(datos.grupo.prestado_vigente) }}</p></article>
              <article v-if="datos.config?.mostrar_ganancias !== false && datos.grupo.utilidades_estimadas != null" class="portal-kpi">
                <p class="portal-kpi__etiqueta"><SparklesIcon class="h-4 w-4" aria-hidden="true" /> Utilidades</p>
                <p class="portal-kpi__valor tabular-nums text-[#C2185B] oscuro:text-pink-300">${{ formatMoney(datos.grupo.utilidades_estimadas) }}</p>
                <span v-if="!natilleraCerrada" class="portal-estimado">Estimado</span>
              </article>
            </div>
            <div v-if="datos.grupo.estados" class="portal-panel portal-panel--lista">
              <p class="portal-lista__anio">Cómo va cada socio</p>
              <ul class="portal-lista">
                <li v-for="(s, i) in datos.grupo.estados" :key="i" class="portal-fila portal-fila--estatica">
                  <span class="portal-fila__punto" :class="`portal-fila__punto--${s.estado === 'al_dia' ? 'pagada' : s.estado}`" aria-hidden="true" />
                  <span class="min-w-0 flex-1 truncate font-semibold text-texto">{{ s.nombre }}</span>
                  <span class="portal-estado" :class="`portal-estado--${s.estado === 'al_dia' ? 'pagada' : s.estado}`">
                    {{ s.estado === 'al_dia' ? 'Al día' : s.estado === 'mora' ? 'En mora' : 'Por pagar' }}
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <p class="text-center text-xs text-texto-tenue">
            Información de solo lectura. Si ves algo que no cuadra, habla con el administrador.
          </p>
        </div>
      </div>
    </template>

    <!--
      Vista previa y descarga del estado de cuenta o de un comprobante de pago
      (skill natillerapp-modals). La imagen se prepara al abrir, no al tocar «Compartir»:
      Safari solo abre el menú de compartir si `navigator.share` va pegado al toque.
    -->
    <ModalWrapper
      :show="!!comprobante"
      :z-index="60"
      align="bottom"
      :ios-soft-backdrop="true"
      overlay-class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
      card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 oscuro:border-borde bg-superficie-tarjeta"
      card-max-width="28rem"
      @close="cerrarComprobante"
    >
      <div class="flex-shrink-0 bg-[color:var(--brand-primary)] text-white">
        <!-- Móvil: [icono | títulos | X] -->
        <div class="sm:hidden flex items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 min-h-[4.2rem]">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <component :is="comprobante?.tipo === 'pago' ? ReceiptPercentIcon : DocumentTextIcon" class="w-5 h-5 text-[color:var(--brand-primary)]" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <h3 class="font-display font-bold text-white text-base leading-tight">{{ tituloComprobante }}</h3>
            <p class="text-[0.6875rem] text-white/85 leading-snug mt-0.5 truncate">{{ subtituloComprobante }}</p>
          </div>
          <button type="button" class="portal-modal__x" aria-label="Cerrar" @click="cerrarComprobante">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <!-- Desktop: [hueco | icono + títulos | X] -->
        <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
          <div class="w-11 flex-shrink-0" aria-hidden="true"></div>
          <div class="flex-1 min-w-0 flex flex-col items-center text-center">
            <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
            <div class="w-11 h-11 mb-2 bg-white rounded-full flex items-center justify-center shadow-sm">
              <component :is="comprobante?.tipo === 'pago' ? ReceiptPercentIcon : DocumentTextIcon" class="w-6 h-6 text-[color:var(--brand-primary)]" />
            </div>
            <h3 class="font-display font-bold text-white text-lg leading-tight">{{ tituloComprobante }}</h3>
            <p class="text-xs text-white/85 leading-snug mt-1">{{ subtituloComprobante }}</p>
          </div>
          <button type="button" class="portal-modal__x" aria-label="Cerrar" @click="cerrarComprobante">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref="areaScrollComprobante"
          class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#eef2ee] oscuro:bg-superficie-hundida overscroll-contain [-webkit-overflow-scrolling:touch] px-4 pt-5 pb-6"
          @scroll.passive="programarNatiscroll"
        >
          <!-- Lo que se captura como imagen: siempre en claro, se comparte por WhatsApp -->
          <div ref="ticketRef" class="portal-modal__ticket" data-tema="claro">
            <ComprobanteEstadoSocio v-if="comprobante?.tipo === 'estado'" :estado="estado" :incluir4x1000="false" :fluido="true" />
            <ComprobantePagoSocio v-else-if="comprobante?.tipo === 'pago'" :pago="comprobante.pago" :fluido="true" />
          </div>
        </div>
        <NatiscrollHint :show="hayNatiscroll" />
      </div>

      <!-- Pie fijo. `align="bottom"`: la barra de Safari lo tapa, se suma lo que mide (§4.1) -->
      <div
        class="flex-shrink-0 border-t border-[color:var(--surface-divider)] bg-superficie-tarjeta px-5 sm:px-6 pt-4 flex flex-row gap-3"
        :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
      >
        <button type="button" class="btn-descargar flex-1" :disabled="!imagen" @click="descargarImagen">
          <ArrowDownTrayIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          {{ imagen ? 'Descargar' : 'Preparando…' }}
        </button>
        <!-- Solo donde el navegador puede compartir archivos (móvil) -->
        <button v-if="puedeCompartir" type="button" class="btn-compartir flex-1" :disabled="!imagen" @click="compartirImagen">
          <ShareIcon class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Compartir
        </button>
      </div>
    </ModalWrapper>

    <SancionesSocioModal
      :show="verSanciones"
      :cuotas="cuotas"
      :reglas-multas="datos?.natillera?.reglas_multas || null"
      :natillera-nombre="datos?.natillera?.nombre || ''"
      @cerrar="verSanciones = false"
    />

    <!-- Barra inferior del socio (móvil): volver a las natilleras y moverse por el portal -->
    <PortalBottomNav
      v-if="datos"
      :activa="seccionNavActiva"
      :secciones="pestanas"
      @elegir="elegirDesdeBarra"
    />
  </div>
</template>

<script setup>
import EscenaAlcancia from '../../components/publico/EscenaAlcancia.vue'
import { gananciasSinAdministracion } from '../../utils/gananciasPortal'
import { ref, computed, watch, watchEffect, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PortalBottomNav from '../../components/portal/PortalBottomNav.vue'
import SancionesSocioModal from '../../components/portal/SancionesSocioModal.vue'
import { normalizarReglas } from '../../utils/desgloseSanciones'
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowUturnLeftIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ShareIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon,
  WalletIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import BackButton from '../../components/BackButton.vue'
import CargaPantalla from '../../components/carga/CargaPantalla.vue'
import ComprobanteEstadoSocio from '../../components/estado/ComprobanteEstadoSocio.vue'
import ComprobantePagoSocio from '../../components/estado/ComprobantePagoSocio.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import NatiscrollHint from '../../components/NatiscrollHint.vue'
import { toPng } from 'html-to-image'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import { usePortalNavegacion } from '../../composables/usePortalNavegacion'
import { construirEstadoSocio, calcularEstadoRealCuota, formatoPeriodoCuota } from '../../composables/useEstadoSocio'
import { formatMoney } from '../../utils/formatMoney'
import { formatDate, parseDateLocal } from '../../utils/formatDate'

const route = useRoute()
const router = useRouter()
const socioNatilleraId = computed(() => route.params.socioNatilleraId)

const cargando = ref(true)
const error = ref('')
const datos = ref(null)
const pagosRaw = ref([])
const pestana = ref('aportes')
const seccionesRef = ref(null)
const filtroAportes = ref('todas')
const cuotaAbierta = ref(null)
const prestamoAbierto = ref(null)

const num = v => Number(v) || 0

const ETIQUETA_ESTADO = { pagada: 'Pagada', pendiente: 'Por pagar', mora: 'En mora', programada: 'Próxima' }
const ETIQUETA_UTILIDAD = {
  prestamos: 'Intereses de préstamos',
  rifas: 'Rifas',
  bingo: 'Bingos',
  venta: 'Ventas',
  evento: 'Eventos',
  otro: 'Otras actividades',
  sanciones: 'Sanciones',
  utilidades_adicionales: 'Otros ingresos'
}
const FILTROS_APORTES = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'pagada', etiqueta: 'Pagadas' },
  { valor: 'pendiente', etiqueta: 'Por pagar' },
  { valor: 'mora', etiqueta: 'En mora' }
]

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const id = socioNatilleraId.value
    const [res, resPagos] = await Promise.all([
      supabase.rpc('portal_datos_socio', { p_socio_natillera_id: id }),
      supabase.rpc('portal_pagos_socio', { p_socio_natillera_id: id })
    ])
    if (res.error) throw res.error
    datos.value = res.data || null
    // Sin los pagos el portal sigue sirviendo: solo faltarían los comprobantes.
    if (resPagos.error) console.warn('No se pudieron cargar los pagos del socio:', resPagos.error)
    pagosRaw.value = resPagos.data || []
  } catch (e) {
    console.error('Error cargando el portal del socio:', e)
    error.value = 'No se pudo cargar tu información. Revisa tu conexión.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
watch(socioNatilleraId, cargar)

/*
 * Quien además de socio administra esta natillera (dueño o colaborador aceptado) ve un atajo
 * para volver a ella: es la contraparte de «Mi portal» en la vista de la natillera. Mismo
 * criterio que la lista de natilleras (admin_id y natillera_colaboradores aceptadas).
 * Guarda el id de la natillera, o null si no la administra o la consulta falla.
 */
const authStore = useAuthStore()
const natilleraQueAdministra = ref(null)
let turnoAdministra = 0
async function comprobarSiAdministra(natilleraId) {
  const turno = ++turnoAdministra
  natilleraQueAdministra.value = null
  const usuarioId = authStore.user?.id
  if (!natilleraId || !usuarioId) return
  try {
    const [dueno, colaborador] = await Promise.all([
      supabase.from('natilleras').select('id').eq('id', natilleraId).eq('admin_id', usuarioId).limit(1),
      supabase.from('natillera_colaboradores').select('natillera_id')
        .eq('natillera_id', natilleraId).eq('usuario_id', usuarioId).eq('estado', 'aceptada').limit(1)
    ])
    // Si cambió de portal mientras respondía, esta respuesta ya no aplica.
    if (turno !== turnoAdministra) return
    if ((dueno.data || []).length > 0 || (colaborador.data || []).length > 0) natilleraQueAdministra.value = natilleraId
  } catch (e) {
    console.warn('No se pudo comprobar si administra la natillera:', e)
  }
}
// También depende del usuario: la sesión puede terminar de cargar después que los datos.
watch(() => [datos.value?.natillera?.id, authStore.user?.id], ([natilleraId]) => comprobarSiAdministra(natilleraId), { immediate: true })

const diasGracia = computed(() => datos.value?.natillera?.reglas_multas?.dias_gracia || 3)
const natilleraCerrada = computed(() => String(datos.value?.natillera?.estado || '').toLowerCase() === 'cerrada')
const socioRetirado = computed(() => String(datos.value?.socio?.estado || 'activo') !== 'activo')
const primerNombre = computed(() => (datos.value?.socio?.nombre || '').trim().split(/\s+/)[0] || '')

// La sanción es la guardada en cada cuota: la mantiene al día la app del admin. El socio no
// la recalcula (recalcular escribe en la base, y el portal es de solo lectura).
const estado = computed(() => {
  if (!datos.value) return null
  return construirEstadoSocio({
    socio: { nombre: datos.value.socio.nombre, telefono: datos.value.socio.telefono },
    natillera: datos.value.natillera,
    cuotas: datos.value.cuotas || [],
    sancionesMap: {},
    sociosActividad: datos.value.actividades || [],
    planPagos: (datos.value.prestamos || []).flatMap(p => p.plan || [])
  })
})

const cuotas = computed(() =>
  (datos.value?.cuotas || []).map(c => {
    const real = calcularEstadoRealCuota(c, diasGracia.value)
    return { ...c, estadoReal: ETIQUETA_ESTADO[real] ? real : 'programada', periodo: formatoPeriodoCuota(c) }
  })
)

// Leyenda de las casillas del ahorro: solo los estados que el socio tiene, con cuántas hay.
const LEYENDA_CASILLAS = [
  { estado: 'pagada', uno: 'pagada', varias: 'pagadas' },
  { estado: 'pendiente', uno: 'por pagar', varias: 'por pagar' },
  { estado: 'mora', uno: 'en mora', varias: 'en mora' },
  { estado: 'programada', uno: 'por venir', varias: 'por venir' }
]
// Cuotas agrupadas por mes, en su orden: una casilla en mensual, dos en quincenal.
const casillasPorMes = computed(() => {
  const grupos = []
  for (const c of cuotas.value) {
    const clave = `${c.anio}-${c.mes}`
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.clave === clave) ultimo.cuotas.push(c)
    else grupos.push({ clave, mes: MESES_ABREV[(Number(c.mes) || 1) - 1] || '', cuotas: [c] })
  }
  return grupos
})
const leyendaCasillas = computed(() =>
  LEYENDA_CASILLAS
    .map(l => {
      const cantidad = cuotas.value.filter(c => c.estadoReal === l.estado).length
      return { estado: l.estado, cantidad, texto: cantidad === 1 ? l.uno : l.varias }
    })
    .filter(l => l.cantidad > 0)
)

const totalAportado = computed(() => cuotas.value.reduce((s, c) => s + num(c.valor_pagado_cuota || (c.estadoReal === 'pagada' ? c.valor_cuota : 0)), 0))
const totalSancionesPagadas = computed(() => cuotas.value.reduce((s, c) => s + num(c.valor_pagado_sancion), 0))

// Próximo pago: la primera cuota sin pagar que aún no está en mora (las vencidas ya se ven en «Debes»).
const proximoPago = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const siguiente = cuotas.value
    .filter(c => c.estadoReal === 'pendiente' || c.estadoReal === 'programada')
    .sort((a, b) => parseDateLocal(a.fecha_limite) - parseDateLocal(b.fecha_limite))[0]
  if (!siguiente) return null
  const limite = parseDateLocal(siguiente.fecha_vencimiento || siguiente.fecha_limite)
  const dias = limite ? Math.round((limite - hoy) / 86400000) : null
  const cuando = dias == null ? '' : dias < 0 ? 'Vencida' : dias === 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `Vence en ${dias} días`
  return {
    valor: Math.max(0, num(siguiente.valor_cuota) - num(siguiente.valor_pagado)),
    cuando,
    fecha: formatDate(siguiente.fecha_vencimiento || siguiente.fecha_limite),
    texto: `${cuando} · ${formatDate(siguiente.fecha_vencimiento || siguiente.fecha_limite)}`
  }
})

const conteoAportes = computed(() => ({
  todas: cuotas.value.length,
  pagada: cuotas.value.filter(c => c.estadoReal === 'pagada').length,
  pendiente: cuotas.value.filter(c => c.estadoReal === 'pendiente' || c.estadoReal === 'programada').length,
  mora: cuotas.value.filter(c => c.estadoReal === 'mora').length
}))

const cuotasFiltradas = computed(() => {
  const f = filtroAportes.value
  const lista = f === 'todas'
    ? cuotas.value
    : f === 'pendiente'
      ? cuotas.value.filter(c => c.estadoReal === 'pendiente' || c.estadoReal === 'programada')
      : cuotas.value.filter(c => c.estadoReal === f)
  return [...lista].reverse()
})

const cuotasPorAnio = computed(() => {
  const grupos = []
  for (const c of cuotasFiltradas.value) {
    const anio = c.anio || '—'
    let g = grupos.find(x => x.anio === anio)
    if (!g) grupos.push(g = { anio, cuotas: [] })
    g.cuotas.push(c)
  }
  return grupos
})

function tieneDesglose(c) {
  return (pagosPorCuota.value[c.id] || []).length > 0 || ['valor_pagado_cuota', 'valor_pagado_sancion', 'valor_pagado_actividades', 'impuesto_4x1000', 'valor_pagado_efectivo', 'valor_pagado_transferencia']
    .some(k => num(c[k]) > 0) || (c.estadoReal !== 'pagada' && num(c.valor_pagado) > 0)
}

function textoFechaCuota(c) {
  if (c.estadoReal === 'pagada') return c.fecha_pago ? `Pagada el ${formatDate(c.fecha_pago)}` : 'Pagada'
  if (c.estadoReal === 'mora') return `Venció el ${formatDate(c.fecha_vencimiento || c.fecha_limite)}`
  return `Vence el ${formatDate(c.fecha_vencimiento || c.fecha_limite)}`
}

// Ganancias: foto que guarda la app del admin (usePortalGanancias). Null si el admin las
// oculta —entonces ni siquiera llegan— o si todavía no se han calculado.
const ganancias = computed(() => {
  const g = datos.value?.ganancias?.datos
  if (!g) return null
  // La administración no se le muestra al socio: va descontada de sus ganancias. Las fotos
  // nuevas ya llegan así; esto cubre las guardadas antes, que aún traen el aporte aparte.
  return { ...g, ...gananciasSinAdministracion(g), aporteAdministracion: 0, administracion: null }
})
const calculadoEnTexto = computed(() => {
  const f = datos.value?.ganancias?.calculado_en
  return f ? `el ${formatDate(f)}` : ''
})
const conceptosGanancia = computed(() => {
  const g = ganancias.value
  if (!g) return []
  const lista = Object.entries(g.utilidadesPorConcepto || {})
    .map(([tipo, monto]) => ({ tipo, monto: num(monto), etiqueta: ETIQUETA_UTILIDAD[tipo] || tipo, modo: g.modos?.[tipo] || 'equitativa' }))
    .filter(c => Math.abs(c.monto) >= 1)
    .sort((a, b) => b.monto - a.monto)
  const max = Math.max(...lista.map(c => Math.abs(c.monto)), 1)
  return lista.map(c => ({
    ...c,
    etiqueta: c.monto < 0 && c.tipo === 'utilidades_adicionales' ? 'Gastos pagados con utilidades' : c.etiqueta,
    porcentaje: Math.round((Math.abs(c.monto) / max) * 100)
  }))
})

/*
 * A qué cuotas se aplicó cada abono. Lo dice `numeros_cuota`; los abonos viejos no lo
 * guardaron, y sin eso su cuota no tenía botón de comprobante. A esos se les asigna en
 * orden —el abono más viejo a la cuota más vieja—, que es como la app aplica los abonos
 * al plan (recalcularPlanPagosPrestamo).
 */
function abonosConCuotas(prestamo) {
  const abonos = [...(prestamo.abonos || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  if (abonos.every(a => Array.isArray(a.numeros_cuota) && a.numeros_cuota.length > 0)) return abonos
  const cuotas = [...(prestamo.plan || [])].sort((a, b) => a.numero_cuota - b.numero_cuota)
  const falta = cuotas.map(c => num(c.valor_cuota))
  let i = 0
  return abonos.map(a => {
    let restante = num(a.valor)
    const tocadas = []
    while (restante > 0.5 && i < cuotas.length) {
      const aplica = Math.min(restante, falta[i])
      if (aplica > 0) tocadas.push(cuotas[i].numero_cuota)
      falta[i] -= aplica
      restante -= aplica
      if (falta[i] <= 0.5) i++
    }
    if (Array.isArray(a.numeros_cuota) && a.numeros_cuota.length > 0) return a
    return { ...a, numeros_cuota: tocadas }
  })
}

const prestamos = computed(() => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return (datos.value?.prestamos || []).map(p0 => {
    const p = { ...p0, abonos: abonosConCuotas(p0) }
    // Estado de cada cuota del plan: pagada, en mora (venció sin pagar) o por venir. La
    // primera que aún no vence es «la siguiente»; el resto quedan programadas.
    const plan = (p.plan || []).map(c => {
      const fecha = parseDateLocal(c.fecha_proyectada)
      const pendiente = Math.max(0, num(c.valor_cuota) - num(c.valor_pagado))
      const estadoCuota = c.pagada ? 'pagada' : fecha && fecha < hoy ? 'mora' : 'programada'
      // Abonos que se aplicaron a esta cuota: cada uno tiene su comprobante.
      const abonos = (p.abonos || []).filter(a => Array.isArray(a.numeros_cuota) && a.numeros_cuota.includes(c.numero_cuota))
      return { ...c, pendiente, estadoCuota, abonos, esSiguiente: false, colorPunto: estadoCuota }
    })
    const siguiente = plan.find(c => c.estadoCuota === 'programada')
    if (siguiente) {
      siguiente.esSiguiente = true
      // La que sigue se pinta como pendiente, no como una programada más
      siguiente.colorPunto = 'pendiente'
    }

    const enMora = plan.filter(c => c.estadoCuota === 'mora')
    const pagadas = plan.filter(c => c.estadoCuota === 'pagada').length
    return {
      ...p,
      plan,
      pagadas,
      porcentaje: plan.length > 0 ? Math.round((pagadas / plan.length) * 100) : 0,
      cuotasEnMora: enMora.length,
      // Lo vencido se cobra completo, no solo la cuota más vieja
      totalEnMora: enMora.reduce((s, c) => s + c.pendiente, 0),
      primeraEnMora: enMora[0] || null,
      proxima: siguiente ? { valor: siguiente.pendiente, fecha_proyectada: siguiente.fecha_proyectada } : null
    }
  })
})
const saldoPrestamos = computed(() => prestamos.value.filter(p => p.estado === 'activo').reduce((s, p) => s + num(p.saldo_actual), 0))

// Fila de préstamo en el resumen: solo si hay saldo vivo. Con uno solo se dice en qué va;
// con varios, cuántos son, que es lo que cabe en una línea.
const prestamoResumen = computed(() => {
  const activos = prestamos.value.filter(p => p.estado === 'activo')
  if (activos.length === 0 || saldoPrestamos.value <= 0) return null
  if (activos.length > 1) {
    return { titulo: `${activos.length} préstamos activos`, detalle: 'Saldo por pagar', saldo: saldoPrestamos.value }
  }
  const p = activos[0]
  const cuotas = p.plan.length > 0 ? `${p.pagadas} de ${p.plan.length} cuotas pagadas` : 'Sin plan de pagos registrado'
  const proxima = p.proxima ? ` · próxima el ${formatDate(p.proxima.fecha_proyectada)}` : ''
  return { titulo: 'Préstamo activo', detalle: `${cuotas}${proxima}`, saldo: p.saldo_actual }
})

const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Fecha que ordena y rotula cada actividad: el día del sorteo en las rifas; si no, el
// límite de pago o el mes al que se cobra.
function fechaDeActividad(a) {
  const act = a.actividad || {}
  const texto = act.fecha_juego_rifa || a.fecha_limite_pago || act.fecha_limite_pago
  if (texto) return parseDateLocal(texto)
  const anio = a.anio_pago || act.anio_pago
  const mes = a.mes_pago || act.mes_pago
  if (anio && mes) return new Date(anio, mes - 1, 1)
  return act.created_at ? new Date(act.created_at) : null
}

function textoLoteria(act) {
  if (!act.sorteo_loteria_medellin && !act.numero_completo_loteria_medellin) return ''
  const partes = ['Lotería de Medellín']
  if (act.sorteo_loteria_medellin) partes.push(`sorteo ${act.sorteo_loteria_medellin}`)
  if (act.numero_completo_loteria_medellin) {
    partes.push(`salió ${act.numero_completo_loteria_medellin}${act.serie_loteria_medellin ? ` serie ${act.serie_loteria_medellin}` : ''}`)
  }
  return partes.join(' · ')
}

const actividades = computed(() =>
  (datos.value?.actividades || [])
    .map((a, i) => {
      const act = a.actividad || {}
      const fecha = fechaDeActividad(a)
      const numeroGanador = act.numero_ganador != null && act.numero_ganador !== '' ? String(act.numero_ganador).padStart(2, '0') : ''
      return {
        clave: act.id || i,
        orden: fecha ? fecha.getTime() : Number.MAX_SAFE_INTEGER,
        fechaDia: fecha ? String(fecha.getDate()) : '—',
        fechaMes: fecha ? `${MESES_ABREV[fecha.getMonth()]} ${String(fecha.getFullYear()).slice(2)}` : '',
        descripcion: (act.descripcion || 'Actividad').trim(),
        tipo: ETIQUETA_UTILIDAD[act.tipo] || (act.tipo ? act.tipo[0].toUpperCase() + act.tipo.slice(1) : 'Actividad'),
        asignado: num(a.valor_asignado),
        pendiente: Math.max(0, num(a.valor_asignado) - num(a.valor_pagado)),
        esRifa: act.tipo === 'rifa',
        fechaJuego: act.fecha_juego_rifa || '',
        jugada: !!numeroGanador,
        numeroGanador,
        ganadorNombre: (act.ganador_nombre || '').trim(),
        ganaNatillera: !!act.ganador_es_faltante,
        soyGanador: !!act.ganador_soy_yo,
        loteria: textoLoteria(act),
        misNumeros: (a.mis_numeros || []).map(n => String(n).padStart(2, '0'))
      }
    })
    .sort((x, y) => x.orden - y.orden)
)

// ─── Tablero ───
const nivelDeuda = computed(() => {
  const e = estado.value
  if (!e || e.totalAPagar <= 0) return 'ok'
  return e.cuotasMora > 0 ? 'mora' : 'pendiente'
})

const renglonesDeuda = computed(() => {
  const e = estado.value
  if (!e) return []
  return [
    { clave: 'mora', corto: e.cuotasMora === 1 ? '1 cuota en mora' : `${e.cuotasMora} cuotas en mora`, valor: e.totalMora },
    { clave: 'pendiente', corto: e.cuotasPendientes === 1 ? '1 cuota pendiente' : `${e.cuotasPendientes} cuotas pendientes`, valor: e.totalPendiente },
    { clave: 'sanciones', corto: 'Sanciones', valor: e.totalSancionesPendientes },
    { clave: 'actividades', corto: 'Actividades', valor: e.actividadesPendientesTotal },
    { clave: 'prestamos', corto: 'Préstamo', valor: e.totalPrestamosPendiente }
  ].filter(r => num(r.valor) > 0)
})

const totalProgramado = computed(() => cuotas.value.reduce((s, c) => s + num(c.valor_cuota), 0))
const cuotasConSancion = computed(() => cuotas.value.filter(c => num(c.valor_pagado_sancion) > 0).length)

// Detalle de sanciones: lo decide el admin (por defecto visible). Se ofrece si la natillera
// cobra sanciones o si el socio tuvo alguna, aunque luego se hayan desactivado.
const verSanciones = ref(false)
const hayHistorialSanciones = computed(() =>
  cuotas.value.some(c => num(c.valor_multa) > 0 || num(c.valor_pagado_sancion) > 0 || c.no_calcular_multa))
const puedeVerSanciones = computed(() =>
  datos.value?.config?.mostrar_sanciones === true &&
  (hayHistorialSanciones.value || normalizarReglas(datos.value?.natillera?.reglas_multas).activa))

// Pagos a la vista: 3 en móvil (la pantalla es corta), 6 en escritorio.
const esEscritorio = ref(false)
let consultaEscritorio = null
function alCambiarAncho() {
  esEscritorio.value = !!consultaEscritorio?.matches
}
onMounted(() => {
  consultaEscritorio = window.matchMedia('(min-width: 1024px)')
  alCambiarAncho()
  consultaEscritorio.addEventListener?.('change', alCambiarAncho)
})
onUnmounted(() => consultaEscritorio?.removeEventListener?.('change', alCambiarAncho))
const pagosVisibles = computed(() => (esEscritorio.value ? 6 : 3))

const TITULOS_SECCION = {
  aportes: 'Tus aportes',
  ganancias: 'Tus ganancias',
  prestamos: 'Tus préstamos',
  actividades: 'Actividades',
  grupo: 'El grupo'
}
const tituloSeccion = computed(() => TITULOS_SECCION[pestana.value] || 'Detalle')

function irASeccion(valor) {
  elegirDesdeBarra(valor)
}

// «Ver los N» solo lleva a la sección: cambiar además el filtro escondía las cuotas que el
// socio tenía delante y dejaba la lista distinta según por dónde se hubiera entrado.
function verTodosLosPagos() {
  irASeccion('aportes')
}

// ─── Pagos (uno por transacción) ───
function textoFormaPago(forma) {
  const f = String(forma || '').toLowerCase()
  if (f.includes('transfer')) return 'Transferencia'
  if (f.includes('efectivo')) return 'Efectivo'
  if (f.includes('mixt') || f.includes('ambos')) return 'Efectivo y transferencia'
  return forma ? forma[0].toUpperCase() + forma.slice(1) : ''
}

function armarPago({ clave, cuotaId, fecha, forma, cuota, sancion, actividades, prestamo, impuesto, total, codigo, periodo, detalleActividades, detalleCuotasPrestamo }) {
  const totalCalculado = num(cuota) + num(sancion) + num(actividades) + num(prestamo) + num(impuesto)
  return {
    clave,
    cuotaId,
    fechaOrden: fecha ? new Date(fecha).getTime() : 0,
    fecha: fecha ? formatDate(fecha) : 'Sin fecha',
    periodo,
    formaPago: textoFormaPago(forma),
    cuota, sancion, actividades, prestamo,
    detalleActividades: detalleActividades || null,
    detalleCuotasPrestamo: detalleCuotasPrestamo || null,
    impuesto4x1000: impuesto,
    total: num(total) > 0 ? num(total) + (num(total) < totalCalculado ? num(impuesto) : 0) : totalCalculado,
    codigo: codigo || '',
    socioNombre: datos.value?.socio?.nombre || '',
    natilleraNombre: datos.value?.natillera?.nombre || ''
  }
}

// Una entrada por abono. `portal_pagos_socio` ya incluye las cuotas pagadas antes de que
// existiera el historial, y todos los abonos de una cuota traen el código de esa cuota.
const pagos = computed(() => {
  const porCuota = new Map(cuotas.value.map(c => [c.id, c]))
  const lista = (pagosRaw.value || []).map(p => {
    const c = porCuota.get(p.cuota_id)
    return armarPago({
      clave: p.id,
      cuotaId: p.cuota_id,
      fecha: p.fecha_pago,
      forma: p.forma_pago,
      cuota: p.valor_cuota,
      sancion: p.valor_sancion,
      actividades: p.valor_actividades,
      prestamo: p.valor_cuotas_prestamo,
      impuesto: p.impuesto_4x1000,
      total: p.valor_total,
      codigo: p.codigo_comprobante,
      periodo: c?.periodo || formatoPeriodoCuota(p),
      detalleActividades: p.detalle_actividades,
      detalleCuotasPrestamo: p.detalle_cuotas_prestamo
    })
  })
  return lista.sort((a, b) => b.fechaOrden - a.fechaOrden)
})

const pagosPorCuota = computed(() => {
  const mapa = {}
  for (const p of pagos.value) (mapa[p.cuotaId] ||= []).push(p)
  return mapa
})

/*
 * Lo que el socio pagó en una cuota, sumando todo lo que se cobró con ella: cuota, sanción,
 * actividades, cuotas de préstamo y 4×1000. Sale de sus pagos (cada uno trae el total de su
 * transacción); una cuota vieja sin historial se suma desde sus columnas, que no guardan el
 * préstamo.
 */
function pagadoEnCuota(c) {
  const lista = pagosPorCuota.value[c.id] || []
  if (lista.length > 0) {
    return {
      total: lista.reduce((t, p) => t + num(p.total), 0),
      prestamo: lista.reduce((t, p) => t + num(p.prestamo), 0)
    }
  }
  const total = num(c.valor_pagado) + num(c.valor_pagado_sancion) + num(c.valor_pagado_actividades) + num(c.impuesto_4x1000)
  return { total, prestamo: 0 }
}

// ─── Modal del comprobante ───
const comprobante = ref(null) // { tipo: 'estado' } | { tipo: 'pago', pago }
const ticketRef = ref(null)
const areaScrollComprobante = ref(null)
const imagen = ref(null)
const hayNatiscroll = ref(false)
let turnoImagen = 0
let rafNatiscroll = 0
const { tapado } = useTapadoInferior()
useBodyScrollLock(computed(() => !!comprobante.value))

const puedeCompartir = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'

const tituloComprobante = computed(() => comprobante.value?.tipo === 'pago' ? 'Comprobante de pago' : 'Estado de cuenta')
const subtituloComprobante = computed(() => {
  const c = comprobante.value
  if (!c) return ''
  if (c.tipo === 'pago') return `${c.pago.periodo} · ${c.pago.fecha}`
  return datos.value?.natillera?.nombre || ''
})

function nombreArchivo() {
  const nombre = (datos.value?.socio?.nombre || 'socio').trim().replace(/\s+/g, '_')
  if (comprobante.value?.tipo === 'pago') {
    return `comprobante_${nombre}_${comprobante.value.pago.codigo || comprobante.value.pago.clave.slice(0, 8)}.png`
  }
  return `estado_cuenta_${nombre}.png`
}

async function prepararImagen() {
  imagen.value = null
  if (!comprobante.value) return
  const turno = ++turnoImagen
  try {
    await nextTick()
    if (!ticketRef.value) return
    const dataUrl = await toPng(ticketRef.value, { backgroundColor: '#eef2ee', pixelRatio: 2, cacheBust: true })
    const blob = await (await fetch(dataUrl)).blob()
    if (turno !== turnoImagen) return
    imagen.value = { dataUrl, archivo: new File([blob], nombreArchivo(), { type: 'image/png' }) }
  } catch (e) {
    console.error('Error generando la imagen del comprobante:', e)
  }
}

function abrirEstado() {
  comprobante.value = { tipo: 'estado' }
}

// Se completa al abrir con lo que depende de la cuota: si quedó parcial y los otros abonos.
function abrirPago(pago) {
  const cuota = cuotas.value.find(c => c.id === pago.cuotaId)
  const abonos = [...(pagosPorCuota.value[pago.cuotaId] || [])]
    .sort((a, b) => a.fechaOrden - b.fechaOrden)
    .map(a => ({ fecha: a.fecha, total: a.total, actual: a.clave === pago.clave }))
  comprobante.value = {
    tipo: 'pago',
    pago: {
      ...pago,
      abonos,
      esParcial: !!cuota && cuota.estadoReal !== 'pagada',
      pendienteCuota: cuota ? Math.max(0, num(cuota.valor_cuota) - num(cuota.valor_pagado)) : 0
    }
  }
}

/*
 * Comprobante de un abono a préstamo, con el mismo diseño que el de una cuota. Un abono
 * puede cubrir varias cuotas y traer interés de mora (va aparte: no baja el saldo).
 */
function abrirComprobanteAbono(prestamo, abono) {
  const numeros = Array.isArray(abono.numeros_cuota) ? [...abono.numeros_cuota].sort((a, b) => a - b) : []
  const cuotasDelAbono = prestamo.plan.filter(c => numeros.includes(c.numero_cuota))
  const mora = num(abono.mora_cobrada)
  const valor = num(abono.valor)
  const forma = num(abono.valor_transferencia) > 0 && num(abono.valor_efectivo) > 0
    ? 'mixto'
    : num(abono.valor_transferencia) > 0 ? 'transferencia' : 'efectivo'
  const etiquetaCuotas = numeros.length === 1 ? `Cuota #${numeros[0]}` : `Cuotas #${numeros.join(', #')}`
  const detalle = [{ nombre: `Préstamo · ${etiquetaCuotas}`, valor }]
  if (mora > 0) detalle.push({ nombre: 'Interés de mora', valor: mora })
  // Otros abonos de las mismas cuotas, para ver este dentro de la historia de la cuota.
  const abonosCuota = (prestamo.abonos || [])
    .filter(a => Array.isArray(a.numeros_cuota) && a.numeros_cuota.some(n => numeros.includes(n)))
    .map(a => ({ fecha: formatDate(a.fecha), total: num(a.valor) + num(a.mora_cobrada), actual: a.id === abono.id }))
  comprobante.value = {
    tipo: 'pago',
    pago: {
      ...armarPago({
        clave: abono.id,
        cuotaId: null,
        fecha: abono.fecha,
        forma,
        prestamo: valor + mora,
        total: valor + mora,
        codigo: abono.codigo_comprobante,
        periodo: `Préstamo · ${etiquetaCuotas}`,
        detalleCuotasPrestamo: detalle
      }),
      abonos: abonosCuota,
      esParcial: cuotasDelAbono.some(c => !c.pagada),
      pendienteCuota: cuotasDelAbono.reduce((t, c) => t + (c.pagada ? 0 : c.pendiente), 0)
    }
  }
}

function cerrarComprobante() {
  comprobante.value = null
  turnoImagen++
  imagen.value = null
}

watch(comprobante, () => {
  prepararImagen()
  nextTick(programarNatiscroll)
})

function descargarImagen() {
  if (!imagen.value) return
  const enlace = document.createElement('a')
  enlace.download = imagen.value.archivo.name
  enlace.href = imagen.value.dataUrl
  enlace.click()
}

function compartirImagen() {
  const img = imagen.value
  if (!img) return
  const datosCompartir = { files: [img.archivo], title: tituloComprobante.value }
  // Nada asíncrono antes del share: ver el comentario de la modal.
  if (!navigator.canShare?.(datosCompartir)) {
    descargarImagen()
    return
  }
  navigator.share(datosCompartir).catch(err => {
    if (err?.name !== 'AbortError') descargarImagen()
  })
}

function actualizarNatiscroll() {
  const el = areaScrollComprobante.value
  if (!el) {
    hayNatiscroll.value = false
    return
  }
  hayNatiscroll.value = el.scrollHeight > el.clientHeight + 1 && el.scrollTop + el.clientHeight < el.scrollHeight - 8
}

function programarNatiscroll() {
  cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = requestAnimationFrame(actualizarNatiscroll)
}

/*
 * Barra inferior (móvil). «Resumen» es el tablero de arriba; el resto son las pestañas
 * de detalle, a las que se baja al elegirlas. Al volver arriba a mano, se marca Resumen.
 */
const seccionNav = ref('resumen')
const seccionNavActiva = computed(() => (comprobante.value?.tipo === 'estado' ? 'estado' : seccionNav.value))

function contenedorScroll() {
  return document.querySelector('main.overflow-y-auto')
}

function elegirDesdeBarra(valor) {
  if (valor === 'natilleras') {
    router.push('/dashboard')
    return
  }
  if (valor === 'estado') {
    abrirEstado()
    return
  }
  if (valor === 'resumen') {
    seccionNav.value = 'resumen'
    contenedorScroll()?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  pestana.value = valor
  seccionNav.value = valor
  nextTick(() => seccionesRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

let rafScrollNav = 0
function alScrollNav() {
  cancelAnimationFrame(rafScrollNav)
  rafScrollNav = requestAnimationFrame(() => {
    const el = contenedorScroll()
    if (el && el.scrollTop < 120) seccionNav.value = 'resumen'
  })
}
onMounted(() => contenedorScroll()?.addEventListener('scroll', alScrollNav, { passive: true }))

// Si la pestaña cambia desde las pestañas de la página, la barra la acompaña.
watch(pestana, v => { seccionNav.value = v })

onUnmounted(() => {
  contenedorScroll()?.removeEventListener('scroll', alScrollNav)
  cancelAnimationFrame(rafScrollNav)
  cancelAnimationFrame(rafNatiscroll)
  turnoImagen++
})

const pestanas = computed(() => {
  const lista = [
    { valor: 'aportes', etiqueta: 'Aportes' }
  ]
  if (ganancias.value) lista.push({ valor: 'ganancias', etiqueta: 'Ganancias' })
  if (prestamos.value.length > 0) lista.push({ valor: 'prestamos', etiqueta: 'Préstamos' })
  if (actividades.value.length > 0) lista.push({ valor: 'actividades', etiqueta: 'Actividades' })
  if (datos.value?.grupo) lista.push({ valor: 'grupo', etiqueta: 'Grupo' })
  return lista
})

/*
 * La barra lateral (escritorio) ofrece las mismas secciones que la barra inferior: se le
 * publican aquí y ella devuelve la elegida por el mismo camino que la barra inferior.
 */
const portalNav = usePortalNavegacion()
const darseDeBaja = portalNav.registrarPortal(elegirDesdeBarra)
watchEffect(() => {
  portalNav.secciones.value = datos.value ? pestanas.value : []
  portalNav.activa.value = seccionNavActiva.value
  portalNav.natilleraQueAdministra.value = natilleraQueAdministra.value
})
onUnmounted(darseDeBaja)
</script>

<style scoped>

/* Hueco para la barra inferior del portal (solo móvil; en escritorio no hay barra) */
@media (max-width: 1023px) {
  .portal--con-barra { padding-bottom: calc(6.25rem + env(safe-area-inset-bottom, 0px) + var(--tapado-inferior, 0px)); }
}

/*
  Un solo código de color para los cuatro estados. Antes la tira usaba un juego (#f59e0b,
  #dc2626) y las etiquetas otro (#fef3c7/#fee2e2): el mismo significado con dos colores.
  Aquí el tono fuerte pinta barras y puntos, y el par claro las etiquetas.
*/
.portal {
  --est-pagada: #1B5E37;
  --est-pendiente: #b45309;
  --est-mora: #b91c1c;
  --est-programada: #cbd5e1;
}

/* ═══ Columnas: una sola hasta 1279 px; desde 1280, resumen a la izquierda y detalle a la derecha ═══ */
.portal-columnas,
.portal-columnas__resumen,
.portal-columnas__detalle { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
@media (min-width: 640px) {
  .portal-columnas,
  .portal-columnas__resumen,
  .portal-columnas__detalle { gap: 1.5rem; }
}
@media (min-width: 1280px) {
  .portal-columnas {
    display: grid;
    grid-template-columns: 22rem minmax(0, 1fr);
    align-items: start;
    gap: 1.5rem;
  }
  .portal-columnas__resumen,
  .portal-columnas__detalle { gap: 1rem; }
}

/* ═══ Tablero ═══ */
.tablero-etiqueta {
  font-family: var(--font-brand-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #64748b;
}
.tablero-etiqueta--clara { color: rgba(255, 255, 255, 0.72); }

/* Talonario: en móvil, el ahorro arriba y lo que debe desprendible abajo; en escritorio, lado a lado */
.tablero-talon {
  display: flex;
  flex-direction: column;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: 0 18px 40px -24px rgba(18, 66, 40, 0.65), 0 0 0 1px rgba(27, 94, 55, 0.08);
  overflow: hidden;
}
/* Lado a lado solo cuando el talón ocupa todo el ancho; en la columna de 22 rem va apilado */
@media (min-width: 768px) and (max-width: 1279px) {
  .tablero-talon { flex-direction: row; }
}
.tablero-talon__ahorro {
  position: relative;
  flex: 1.6 1 0%;
  overflow: hidden;
  padding: 1.25rem 1.25rem 1.375rem;
  background: #1B5E37;
  background: linear-gradient(145deg, #1f6b40 0%, #1B5E37 45%, #124228 100%);
  color: #fff;
}
@media (min-width: 640px) {
  .tablero-talon__ahorro { padding: 1.5rem 1.75rem; }
}
.tablero-talon__circulo { position: absolute; border-radius: 9999px; pointer-events: none; }
.tablero-talon__circulo--a { width: 14rem; height: 14rem; right: -5rem; top: -7rem; background: rgba(255, 255, 255, 0.06); }
.tablero-talon__hola { font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; line-height: 1.2; color: #fff; }
/*
  La cifra es lo que el socio viene a ver: grande, pero medida contra el ancho de la tarjeta
  (cqi) y no de la pantalla, porque en escritorio la tarjeta vive en una columna de 22 rem y
  «$12.500.000» no cabría a 56 px. Sin container queries (iOS < 16) se queda en 2.75 rem.
*/
.tablero-talon__ahorro { container-type: inline-size; }
.tablero-talon__valor {
  font-family: var(--font-display);
  font-size: 2.75rem;
  font-size: clamp(2.25rem, 14cqi, 3.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

/* Casillas del ahorro: una por cuota, sin rótulos; la leyenda va debajo */
.tablero-casillas {
  position: relative;
  display: flex;
  gap: 0.375rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}
.tablero-casillas__mes-grupo {
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
}
/* Las quincenas de un mes, pegadas: 2 px entre ellas frente a los 6 px entre meses */
.tablero-casillas__par { display: flex; width: 100%; gap: 2px; }
.tablero-casilla {
  display: block;
  flex: 1 1 0%;
  min-width: 0;
  height: 0.875rem;
  border-radius: 0.25rem;
}
@media (min-width: 640px) {
  .tablero-casilla { height: 1.125rem; }
}
/* Rótulo del mes: tenue para no competir con la cifra */
.tablero-casillas__mes {
  min-height: 0.75rem;
  font-size: 0.5625rem;
  font-weight: 700;
  line-height: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: capitalize;
  white-space: nowrap;
}
@media (min-width: 640px) {
  .tablero-casillas__mes { font-size: 0.625rem; }
}
.tablero-casilla--pagada { background: rgba(255, 255, 255, 0.92); }
.tablero-casilla--pendiente { background: #fcd34d; }
.tablero-casilla--mora { background: #fca5a5; }
.tablero-casilla--programada { background: rgba(255, 255, 255, 0.16); }
.tablero-casilla--muestra { flex: none; width: 0.625rem; height: 0.625rem; border-radius: 0.1875rem; }
.tablero-casillas__leyenda {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.875rem;
  margin: 0.625rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.78);
}
@media (min-width: 640px) {
  .tablero-casillas__leyenda { font-size: 0.8125rem; }
}
.tablero-casillas__leyenda li { display: inline-flex; align-items: center; gap: 0.375rem; }
.tablero-casillas__leyenda strong { color: #fff; }

/* Perforación: línea discontinua con muescas, horizontal en móvil y vertical en escritorio */
.tablero-talon__corte {
  position: relative;
  height: 0;
  border-top: 2px dashed #d1d5db;
  margin: 0 1.25rem;
}
.tablero-talon__corte::before,
.tablero-talon__corte::after {
  content: '';
  position: absolute;
  top: -0.75rem;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 9999px;
  background: var(--app-canvas-surface, #e8eaee);
}
.tablero-talon__corte::before { left: -2rem; }
.tablero-talon__corte::after { right: -2rem; }
@media (min-width: 768px) and (max-width: 1279px) {
  .tablero-talon__corte { height: auto; margin: 1.25rem 0; border-top: 0; border-left: 2px dashed #d1d5db; }
  .tablero-talon__corte::before,
  .tablero-talon__corte::after { left: -0.75rem; right: auto; }
  .tablero-talon__corte::before { top: -2rem; }
  .tablero-talon__corte::after { top: auto; bottom: -2rem; }
}

.tablero-talon__deuda {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.125rem 1.25rem 1.25rem;
}
@media (min-width: 640px) {
  .tablero-talon__deuda { padding: 1.5rem 1.75rem; }
}
.tablero-talon__debe {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.tablero-talon__deuda--mora .tablero-talon__debe { color: #b91c1c; }
.tablero-talon__deuda--pendiente .tablero-talon__debe { color: #b45309; }
.tablero-talon__debe--ok { display: flex; align-items: center; gap: 0.375rem; font-size: 1.375rem; color: #1B5E37; }
/* Lo que debe: cabecera (título, estado, botón), valor y lista concepto → valor */
.deuda__cabecera { display: flex; align-items: center; gap: 0.5rem; }
.deuda__titulo { color: #475569; }
.deuda__estado {
  display: inline-flex; align-items: center; padding: 0.125rem 0.5rem; border-radius: 9999px;
  font-size: 0.6875rem; font-weight: 800; background: #fef3c7; color: #92400e;
}
.tablero-talon__deuda--mora .deuda__estado { background: #fee2e2; color: #991b1b; }
.deuda__boton { margin-left: auto; }
.tablero-talon__deuda .tablero-talon__debe { margin-top: 0.25rem; }
.deuda__lista { margin-top: 0.625rem; border-top: 1px solid rgba(15, 23, 42, 0.08); }
.deuda__fila {
  display: flex; justify-content: space-between; gap: 0.75rem; padding: 0.4375rem 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06); font-size: 0.8125rem; color: #475569;
}
.deuda__fila:last-child { border-bottom: 0; }
.deuda__fila strong { color: #0f172a; font-weight: 800; }
.tablero-talon__deuda--mora .deuda__fila strong { color: #991b1b; }
.deuda__4x1000 {
  display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.375rem;
  margin-top: 0.375rem; padding: 0.3125rem 0.625rem; border-radius: 0.625rem;
  background: #e0f2fe; border: 1px solid #bae6fd; color: #075985; font-size: 0.8125rem;
}
.deuda__4x1000 strong { font-weight: 800; color: #0c4a6e; }
.deuda__4x1000-nota { font-size: 0.6875rem; font-weight: 700; color: #0369a1; }
.deuda__proxima {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(15, 23, 42, 0.08);
}
.deuda__aldia { display: flex; align-items: center; gap: 0.75rem; }
.deuda__aldia-icono {
  display: flex; width: 2.75rem; height: 2.75rem; flex-shrink: 0; align-items: center; justify-content: center;
  border-radius: 9999px; background: #E8F5E9; color: #1B5E37;
}
.tablero-talon__boton {
  display: inline-flex;
  flex-shrink: 0;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.375rem;
  padding: 0 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.tablero-talon__boton:active { background: rgba(255, 255, 255, 0.22); }
.tablero-talon__boton:disabled { opacity: 0.7; }
/*
  Móvil: una tarjeta, dos partes, con la identidad de la portada. El ahorro en verde, con el
  marranito asomado a la derecha; lo que debe sube sobre el verde con la misma onda del
  login y la portada, del color de su fondo (blanco, o un tinte muy leve según el estado).

  Una sola escala de espacios: 20 px a los lados en las dos partes, 16–20 px entre grupos
  (saludo → ahorro → casillas → botones; cabecera → cifra → desglose) y 4 px entre una
  etiqueta y su cifra. Antes cada bloque tenía el suyo y no cuadraban.
*/
.tablero-talon__alcancia { display: none; }
.tablero-talon__onda { display: none; }
@media (max-width: 767px) {
  .tablero-talon__corte { display: none; }
  .tablero-talon__ahorro { padding: 1.25rem 1.25rem 3.25rem; }
  /* El marranito arriba a la derecha, junto al saludo; la fila le deja su espacio */
  .tablero-talon__alcancia {
    display: block;
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
    width: 5rem;
    pointer-events: none;
  }
  .tablero-talon__fila-hola { padding-right: 4.75rem; min-height: 2.75rem; }
  .tablero-casillas { margin-top: 1.25rem; }
  .tablero-casillas__leyenda { margin-top: 0.625rem; }

  .tablero-talon__deuda {
    position: relative;
    z-index: 1;
    padding: 1rem 1.25rem 1.25rem;
    background: #fff;
  }
  .tablero-talon__onda {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: calc(-2.25rem + 1px);
    width: 100%;
    height: 2.25rem;
    color: #fff;
    pointer-events: none;
  }
  .tablero-talon__deuda .tablero-talon__debe { margin-top: 0.5rem; }
  .deuda__4x1000 { margin-top: 0.625rem; }
  .deuda__lista { margin-top: 1rem; }
  .deuda__fila { padding: 0.5rem 0; }
  .deuda__proxima { margin-top: 1rem; padding-top: 1rem; }
  .tablero-talon__deuda--mora { background: #fff8f8; }
  .tablero-talon__deuda--mora .tablero-talon__onda { color: #fff8f8; }
  .tablero-talon__deuda--pendiente { background: #fffcf3; }
  .tablero-talon__deuda--pendiente .tablero-talon__onda { color: #fffcf3; }
}

/* Encabezado de cada tarjeta: título a la izquierda, «Ver todo» a la derecha */
.tablero-seccion { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.tablero-seccion__ver {
  display: inline-flex;
  flex-shrink: 0;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.125rem;
  margin: -0.625rem -0.375rem 0 0;
  padding: 0 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1B5E37;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
/* Atajo «Natillera» (admin que también es socio): la píldora se ve pequeña, pero el área de
   toque es de 44 px de alto; el margen negativo evita que agrande la fila */
.tablero-talon__accion {
  display: inline-flex;
  flex-shrink: 0;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.375rem;
  padding: 0 1rem;
  border-radius: 9999px;
  background: #1B5E37;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #fff;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
/* Tarjetas del tablero */
.tablero-card {
  padding: 1rem 1.125rem 1.125rem;
  border-radius: 1.25rem;
  border: 1px solid var(--surface-divider);
  background: var(--surface-card, #fff);
  box-shadow: var(--shadow-xs);
}
.tablero-card__titulo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: #0f172a; }

/* Próximo pago: una línea tintada, no una tarjeta más */
.tablero-proximo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 1.125rem;
  border: 1px solid rgba(27, 94, 55, 0.18);
  background: var(--brand-primary-soft, #e8f5e9);
}
.tablero-proximo__icono {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #fff;
  color: #1B5E37;
}
.tablero-proximo__titulo { font-size: 0.75rem; font-weight: 700; color: #15803d; }
.tablero-proximo__sub { font-size: 0.8125rem; color: #475569; }
.tablero-proximo__valor { flex-shrink: 0; font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: #0f172a; }

/* Ganancias y préstamo: filas de una misma tarjeta que llevan a su sección */
.tablero-card--filas { padding: 0.25rem 0; }
.tablero-atajo {
  display: flex;
  width: 100%;
  min-height: 3.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.125rem;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.tablero-atajo + .tablero-atajo { border-top: 1px solid var(--surface-divider); }
@media (hover: hover) {
  .tablero-atajo:hover { background: #f4f8f5; }
}
.tablero-atajo__icono {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}
.tablero-atajo__icono--rosa { background: #fce7f3; color: #C2185B; }
.tablero-atajo__icono--azul { background: #dbeafe; color: #1d4ed8; }
.tablero-atajo__titulo { display: block; font-size: 0.875rem; font-weight: 700; color: #0f172a; }
.tablero-atajo__sub { display: block; font-size: 0.75rem; color: #64748b; }
.tablero-atajo__valor { flex-shrink: 0; font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; }

/* Línea de tiempo de pagos */
.tablero-linea { position: relative; margin: 0.5rem 0 0; padding: 0 0 0 1.25rem; list-style: none; }
.tablero-linea::before {
  content: '';
  position: absolute;
  left: 0.3125rem;
  top: 0.75rem;
  bottom: 0.75rem;
  width: 2px;
  background: #dbe5db;
}
.tablero-linea__item { position: relative; }
.tablero-linea__punto {
  position: absolute;
  left: -1.25rem;
  top: 1.125rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: #1B5E37;
  box-shadow: 0 0 0 3px #e8f3ea;
}
.tablero-linea__pago {
  display: flex;
  width: 100%;
  min-height: 3.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.25rem 0.625rem 0.5rem;
  border-radius: 0.875rem;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
@media (hover: hover) {
  .tablero-linea__pago:hover { background: #f4f8f5; }
}
.tablero-linea__sancion {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.0625rem 0.5rem;
  border-radius: 9999px;
  background: #fef2f2;
  font-size: 0.625rem;
  font-weight: 700;
  color: #b91c1c;
}
.tablero-linea__ver {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  border-radius: 9999px;
  background: #e8f3ea;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #1B5E37;
}

/* ─── Actividades: línea de tiempo ─── */
.act-lista { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.625rem; }
.act-item {
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--surface-divider);
  background: #fff;
}
.act-item--mia { border-color: #a7d7b5; background: #f4faf5; }
.act-item__cabecera { display: flex; align-items: flex-start; gap: 0.75rem; }
.act-item__fecha { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; }
.act-item__titulo { margin-top: 0.125rem; font-weight: 800; font-size: 0.9375rem; line-height: 1.3; color: #0f172a; overflow-wrap: anywhere; }

/* Rifa: la balota con el número y el resultado, bajo la cabecera */
.act-rifa {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--surface-divider);
}
.act-rifa__etiqueta { font-size: 0.625rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; }
.act-rifa__ganador { display: flex; align-items: flex-start; gap: 0.375rem; margin-top: 0.125rem; font-size: 0.9375rem; font-weight: 800; line-height: 1.3; color: #0f172a; overflow-wrap: anywhere; }
.act-rifa__ganador--mio { color: #1B5E37; }
.act-rifa__ganador--pendiente { font-weight: 600; color: #475569; }
.act-rifa__trofeo { width: 1.125rem; height: 1.125rem; flex-shrink: 0; margin-top: 0.0625rem; color: #1B5E37; }
.rifa__balota {
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #f2c94c;
  background: radial-gradient(circle at 32% 28%, #fff6c9 0%, #f6d266 40%, #d9a521 100%);
  box-shadow: inset 0 -3px 6px rgba(138, 106, 18, 0.3);
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 800;
  color: #5c4308;
}
.rifa__balota--pendiente { background: #f1f5f9; box-shadow: inset 0 0 0 2px #cbd5e1; color: #94a3b8; }
.rifa__numeros { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; margin-top: 0.625rem; font-size: 0.75rem; color: #64748b; }
.rifa__numero {
  display: inline-flex;
  min-width: 1.75rem;
  height: 1.5rem;
  align-items: center;
  justify-content: center;
  padding: 0 0.375rem;
  border-radius: 9999px;
  background: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
}
.rifa__numero--ganador { background: #1B5E37; color: #fff; }

/* ─── Barras ─── */
.portal-barra {
  height: 0.5rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
}
.portal-barra > span {
  display: block;
  height: 100%;
  border-radius: 9999px;
  background: #1B5E37;
  transition: width 500ms ease;
}
.portal-barra--resta > span { background: #dc2626; }

/* ─── Indicadores ─── */
.portal-kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem;
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
}
.portal-kpi__etiqueta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}
.portal-kpi__etiqueta svg { color: #1B5E37; }
.portal-kpi__valor {
  font-family: var(--font-display);
  font-size: 1.3125rem;
  font-weight: 800;
  line-height: 1.15;
  color: #0f172a;
}
/* Estimado: rótulo permanente, no nota al pie (RF-07, §7 de la especificación). */
.portal-estimado {
  align-self: flex-start;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--color-accent-100, #ffedd5);
  color: var(--color-accent-800, #9a3412);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.portal-estimado--grande { font-size: 0.6875rem; padding: 0.25rem 0.625rem; }

/* ─── Paneles y listas ─── */
/* `portal-panel` y `tablero-card` eran la misma caja con dos nombres: ahora es una sola regla */
.portal-panel {
  display: block;
  padding: 1rem 1.125rem;
  border-radius: 1.25rem;
  border: 1px solid var(--surface-divider);
  background: var(--surface-card);
  box-shadow: var(--shadow-xs);
}
.portal-panel--lista { padding: 0.25rem 0; }
.portal-lista { margin: 0; padding: 0; list-style: none; }
.portal-lista__anio {
  padding: 0.75rem 1rem 0.25rem;
  font-family: var(--font-brand-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #1B5E37;
}
.portal-fila {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.625rem 1rem;
  text-align: left;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.portal-fila:disabled { cursor: default; }
.portal-lista li + li { border-top: 1px solid var(--surface-divider); }
.portal-fila__punto { width: 0.625rem; height: 0.625rem; flex-shrink: 0; border-radius: 0.1875rem; background: var(--est-programada); }
.portal-fila__punto--pagada { background: var(--est-pagada); }
.portal-fila__punto--pendiente { background: var(--est-pendiente); }
.portal-fila__punto--mora { background: var(--est-mora); }
/* Fila que solo informa (la lista del grupo): misma caja, sin gesto de pulsación */
.portal-fila--estatica { cursor: default; }
.portal-fila__titulo { display: block; font-weight: 700; font-size: 0.9375rem; color: #0f172a; }
.portal-fila__sub { display: block; font-size: 0.75rem; color: #64748b; }
.portal-fila__valor { display: block; font-weight: 700; font-size: 0.9375rem; color: #0f172a; }
.portal-estado {
  display: inline-block;
  margin-top: 0.125rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  white-space: nowrap;
}
.portal-estado--pagada { background: #dcfce7; color: #166534; }
.portal-estado--pendiente { background: #fef3c7; color: #92400e; }
.portal-estado--mora { background: #fee2e2; color: #991b1b; }
.portal-estado--programada { background: #f1f5f9; color: #475569; }
.portal-desglose {
  margin: 0 1rem 0.75rem 2.375rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.875rem;
  background: #f8fafc;
  font-size: 0.8125rem;
}
.portal-dl { display: flex; justify-content: space-between; gap: 1rem; }
.portal-dl dt { color: #64748b; }
.portal-dl dd { font-weight: 600; color: #0f172a; }
.portal-desglose .portal-dl + .portal-dl { margin-top: 0.25rem; }
.portal-dl--total { padding-top: 0.5rem; border-top: 1px solid var(--surface-divider); }
.portal-dl--total dt, .portal-dl--total dd { font-weight: 800; color: #1B5E37; font-size: 1rem; }

/* ─── Filtros ─── */
.portal-filtro {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1px solid var(--surface-divider-strong);
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #475569;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.portal-filtro.is-activo { border-color: #1B5E37; background: #1B5E37; color: #fff; }
.portal-filtro__n {
  min-width: 1.25rem;
  padding: 0 0.3rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.07);
  font-size: 0.6875rem;
  text-align: center;
}
.portal-filtro.is-activo .portal-filtro__n { background: rgba(255, 255, 255, 0.2); }

/* ─── Préstamos ─── */
.portal-plan__comprobante {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(27, 94, 55, 0.3);
  background: #fff;
  color: #1B5E37;
  font-size: 0.75rem;
  font-weight: 700;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.portal-plan__comprobante:hover { background: #E8F5E9; }
.portal-ver-plan {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.75rem;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1B5E37;
  touch-action: manipulation;
}
.portal-plan { margin: 0.25rem 0 0; padding: 0; list-style: none; font-size: 0.8125rem; }
.portal-plan__fila { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0; color: #334155; }
.portal-plan__fila + .portal-plan__fila { border-top: 1px dashed var(--surface-divider); }
/* La vencida sí se tiñe entera (es deuda); la que sigue solo se marca con su etiqueta */
.portal-plan__fila.is-mora {
  margin: 0 -0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0.625rem;
  font-weight: 700;
  background: #fef2f2;
  color: var(--est-mora);
}
.portal-plan__fila.is-siguiente { font-weight: 700; color: #0f172a; }

/* Avisos del préstamo: lo vencido y lo que sigue, antes de abrir el plan */
.portal-aviso {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.875rem;
  font-size: 0.8125rem;
}
.portal-aviso--mora { background: #fef2f2; color: #991b1b; }
.portal-aviso--proxima { background: var(--brand-primary-soft, #e8f5e9); color: var(--brand-primary, #1B5E37); }
.portal-aviso .portal-fila__punto { flex-shrink: 0; }

/* ─── Pagos y comprobantes ─── */
.portal-desglose__pagos {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--surface-divider);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.portal-desglose__comprobante {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(27, 94, 55, 0.25);
  background: #fff;
  font-weight: 700;
  color: #1B5E37;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.portal-modal__x {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.95);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.portal-modal__ticket { padding: 0.25rem 0.5rem 0.5rem; background: #eef2ee; }

@media (prefers-reduced-motion: reduce) {
  .portal-barra > span { transition: none; }
}

/* Acceso al detalle de sanciones (con tokens: vale igual en claro y en oscuro) */
.portal-sanciones {
  display: flex;
  width: 100%;
  min-height: 3.5rem;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px solid var(--borde);
  background: var(--superficie-tarjeta);
  padding: 0.75rem 1rem;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.15s ease;
}
@media (hover: hover) {
  .portal-sanciones:hover { background: var(--superficie-suave); }
}
.portal-sanciones__icono {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--alerta-suave);
  color: var(--alerta);
}
.portal-sanciones__titulo { display: block; font-size: 0.875rem; font-weight: 700; color: var(--texto-fuerte); }
.portal-sanciones__sub { display: block; font-size: 0.75rem; color: var(--texto-suave); }

/* ==========================================================================
   Modo oscuro (docs/plan-modo-oscuro.md)
   Solo lo que cambia: el claro de arriba queda intacto. `:where()` no suma
   especificidad, así que cada regla pesa lo mismo que la original y gana por
   ir después. Lo que va sobre el verde del tablero (texto blanco) no cambia.
   El ticket que se captura como imagen lleva data-tema="claro" y no entra aquí.
   ========================================================================== */
:where([data-tema=oscuro]) .portal { --est-programada: #3a4a42; }
:where([data-tema=oscuro]) .tablero-etiqueta { color: var(--texto-suave); }
:where([data-tema=oscuro]) .tablero-talon {
  background: var(--superficie-tarjeta);
  box-shadow: 0 18px 40px -24px rgb(0 0 0 / 0.8), 0 0 0 1px var(--borde-suave);
}
:where([data-tema=oscuro]) .tablero-talon__corte { border-color: var(--borde-fuerte); }
:where([data-tema=oscuro]) .tablero-talon__debe--ok { color: var(--marca-texto); }
:where([data-tema=oscuro]) .tablero-talon__deuda--mora .tablero-talon__debe { color: var(--peligro); }
:where([data-tema=oscuro]) .tablero-talon__deuda--pendiente .tablero-talon__debe { color: var(--alerta); }
:where([data-tema=oscuro]) .deuda__titulo { color: var(--texto-secundario); }
:where([data-tema=oscuro]) .deuda__estado { background: var(--alerta-suave); color: var(--alerta); }
:where([data-tema=oscuro]) .tablero-talon__deuda--mora .deuda__estado { background: var(--peligro-suave); color: var(--peligro); }
:where([data-tema=oscuro]) .deuda__lista,
:where([data-tema=oscuro]) .deuda__proxima { border-color: var(--borde); }
:where([data-tema=oscuro]) .deuda__fila { border-color: var(--borde-suave); color: var(--texto-secundario); }
:where([data-tema=oscuro]) .deuda__fila strong { color: var(--texto-fuerte); }
:where([data-tema=oscuro]) .tablero-talon__deuda--mora .deuda__fila strong { color: var(--peligro); }
:where([data-tema=oscuro]) .deuda__4x1000 { background: var(--info-suave); border-color: var(--info-borde); color: var(--info); }
:where([data-tema=oscuro]) .deuda__4x1000 strong { color: var(--texto-fuerte); }
:where([data-tema=oscuro]) .deuda__4x1000-nota { color: var(--info); }
:where([data-tema=oscuro]) .deuda__aldia-icono { background: var(--marca-suave); color: var(--marca-texto); }
@media (max-width: 767px) {
  /* La onda toma el color de la sección de deuda que se monta sobre el verde */
  :where([data-tema=oscuro]) .tablero-talon__deuda { background: var(--superficie-tarjeta); }
  :where([data-tema=oscuro]) .tablero-talon__onda { color: var(--superficie-tarjeta); }
  :where([data-tema=oscuro]) .tablero-talon__deuda--mora { background: #241718; }
  :where([data-tema=oscuro]) .tablero-talon__deuda--mora .tablero-talon__onda { color: #241718; }
  :where([data-tema=oscuro]) .tablero-talon__deuda--pendiente { background: #242015; }
  :where([data-tema=oscuro]) .tablero-talon__deuda--pendiente .tablero-talon__onda { color: #242015; }
}

:where([data-tema=oscuro]) .tablero-seccion__ver,
:where([data-tema=oscuro]) .portal-ver-plan { color: var(--marca-tinta); }
:where([data-tema=oscuro]) .tablero-card__titulo,
:where([data-tema=oscuro]) .tablero-atajo__titulo,
:where([data-tema=oscuro]) .tablero-proximo__valor { color: var(--texto-fuerte); }
:where([data-tema=oscuro]) .tablero-proximo { border-color: var(--marca-tinta-borde); background: var(--marca-suave); }
:where([data-tema=oscuro]) .tablero-proximo__icono { background: var(--superficie-tarjeta); color: var(--marca-tinta); }
:where([data-tema=oscuro]) .tablero-proximo__titulo { color: var(--marca-texto); }
:where([data-tema=oscuro]) .tablero-proximo__sub { color: var(--texto-secundario); }
:where([data-tema=oscuro]) .tablero-atajo__sub { color: var(--texto-suave); }
@media (hover: hover) {
  :where([data-tema=oscuro]) .tablero-atajo:hover,
  :where([data-tema=oscuro]) .tablero-linea__pago:hover { background: var(--superficie-suave); }
}
:where([data-tema=oscuro]) .tablero-atajo__icono--rosa { background: rgb(236 72 153 / 0.15); color: #f9a8d4; }
:where([data-tema=oscuro]) .tablero-atajo__icono--azul { background: var(--info-suave); color: var(--info); }
:where([data-tema=oscuro]) .tablero-linea::before { background: var(--borde-fuerte); }
:where([data-tema=oscuro]) .tablero-linea__punto { box-shadow: 0 0 0 3px var(--marca-suave); }
:where([data-tema=oscuro]) .tablero-linea__sancion { background: var(--peligro-suave); color: var(--peligro); }
:where([data-tema=oscuro]) .tablero-linea__ver { background: var(--marca-suave); color: var(--marca-texto); }

:where([data-tema=oscuro]) .act-item { background: var(--superficie-tarjeta); }
:where([data-tema=oscuro]) .act-item--mia { border-color: var(--marca-tinta-borde); background: var(--marca-suave); }
:where([data-tema=oscuro]) .act-item__fecha { color: var(--texto-suave); }
:where([data-tema=oscuro]) .act-item__titulo,
:where([data-tema=oscuro]) .act-rifa__ganador { color: var(--texto-fuerte); }
:where([data-tema=oscuro]) .act-rifa__etiqueta { color: var(--texto-tenue); }
:where([data-tema=oscuro]) .act-rifa__ganador--mio,
:where([data-tema=oscuro]) .act-rifa__trofeo { color: var(--marca-texto); }
:where([data-tema=oscuro]) .act-rifa__ganador--pendiente { color: var(--texto-secundario); }
:where([data-tema=oscuro]) .rifa__balota--pendiente { background: var(--superficie-hundida); box-shadow: inset 0 0 0 2px var(--borde-fuerte); color: var(--texto-tenue); }
:where([data-tema=oscuro]) .rifa__numeros { color: var(--texto-suave); }
:where([data-tema=oscuro]) .rifa__numero { background: var(--superficie-hundida); color: var(--texto-secundario); }

:where([data-tema=oscuro]) .portal-barra { background: rgb(255 255 255 / 0.1); }
:where([data-tema=oscuro]) .portal-kpi__etiqueta { color: var(--texto-suave); }
:where([data-tema=oscuro]) .portal-kpi__etiqueta svg { color: var(--marca-texto); }
:where([data-tema=oscuro]) .portal-kpi__valor,
:where([data-tema=oscuro]) .portal-fila__titulo,
:where([data-tema=oscuro]) .portal-fila__valor,
:where([data-tema=oscuro]) .portal-dl dd,
:where([data-tema=oscuro]) .portal-plan__fila.is-siguiente { color: var(--texto-fuerte); }
:where([data-tema=oscuro]) .portal-estimado { background: rgb(249 115 22 / 0.15); color: #fdba74; }
:where([data-tema=oscuro]) .portal-lista__anio,
:where([data-tema=oscuro]) .portal-dl--total dt,
:where([data-tema=oscuro]) .portal-dl--total dd { color: var(--marca-texto); }
:where([data-tema=oscuro]) .portal-fila__sub,
:where([data-tema=oscuro]) .portal-dl dt { color: var(--texto-suave); }
:where([data-tema=oscuro]) .portal-estado--pagada { background: var(--exito-suave); color: var(--exito); }
:where([data-tema=oscuro]) .portal-estado--pendiente { background: var(--alerta-suave); color: var(--alerta); }
:where([data-tema=oscuro]) .portal-estado--mora { background: var(--peligro-suave); color: var(--peligro); }
:where([data-tema=oscuro]) .portal-estado--programada { background: var(--superficie-hundida); color: var(--texto-secundario); }
:where([data-tema=oscuro]) .portal-desglose { background: var(--superficie-suave); }
:where([data-tema=oscuro]) .portal-filtro { background: var(--superficie-tarjeta); color: var(--texto-secundario); }
:where([data-tema=oscuro]) .portal-filtro.is-activo { background: #1B5E37; border-color: #1B5E37; color: #fff; }
:where([data-tema=oscuro]) .portal-filtro__n { background: rgb(255 255 255 / 0.1); }
:where([data-tema=oscuro]) .portal-plan__comprobante,
:where([data-tema=oscuro]) .portal-desglose__comprobante { border-color: var(--marca-tinta-borde); background: var(--superficie-tarjeta); color: var(--marca-tinta); }
:where([data-tema=oscuro]) .portal-plan__comprobante:hover { background: var(--marca-suave); }
:where([data-tema=oscuro]) .portal-plan__fila { color: var(--texto-medio); }
:where([data-tema=oscuro]) .portal-plan__fila.is-mora { background: var(--peligro-suave); }
:where([data-tema=oscuro]) .portal-aviso--mora { background: var(--peligro-suave); color: var(--peligro); }
:where([data-tema=oscuro]) .portal-aviso--proxima { background: var(--marca-suave); color: var(--marca-texto); }
</style>

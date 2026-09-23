<template>
  <div :style="{ '--hueco-barra-app': huecoBarraApp + 'px' }">
    <div class="mx-auto max-w-6xl pb-2 lg:pb-6">
      <div v-if="inicializando" class="flex flex-col items-center justify-center py-32 px-4">
        <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5E9]">
          <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-[#1B5E37] border-t-transparent" />
        </div>
        <p class="text-gray-600 font-medium">Preparando la liquidación…</p>
        <p class="text-sm text-gray-400 mt-1">Un momento</p>
      </div>

      <div
        v-else-if="accesoDenegado"
        class="max-w-lg mx-auto text-center py-20 px-4 rounded-2xl border border-amber-200/80 bg-white/80 shadow-sm backdrop-blur-sm"
      >
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
          <ExclamationTriangleIcon class="w-9 h-9" />
        </div>
        <h1 class="text-2xl font-display font-bold text-gray-900 mb-2">No disponible</h1>
        <p class="text-gray-600 leading-relaxed">
          No tienes permiso para cerrar esta natillera o la natillera no está activa.
        </p>
      </div>

      <div v-else class="space-y-4 lg:space-y-6">
        <!--
          Cabecera en verde de marca, como las del resto de la app. En <lg lleva además
          las pestañas «Resumen | Socios»: con veinte socios, la lista y el resumen en
          una sola columna obligaban a bajar media página para pasar de uno a otro.
        -->
        <header class="rounded-2xl bg-[#1B5E37] px-3 pb-3 pt-3 text-white shadow-sm sm:px-5 sm:pt-4 lg:px-6 lg:py-5">
          <div class="flex items-center gap-2 sm:gap-3">
            <router-link
              :to="`/natilleras/${natilleraId}`"
              class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/10"
              aria-label="Volver a la natillera"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </router-link>
            <div class="min-w-0 flex-1">
              <p class="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 lg:block">Cierre definitivo</p>
              <h1 class="font-display text-[17px] font-extrabold leading-tight sm:text-xl lg:text-2xl">Liquidación y cierre</h1>
              <p v-if="natillera?.nombre" class="truncate text-xs text-white/80 sm:text-sm" :title="natillera.nombre">
                {{ natillera.nombre }}
              </p>
            </div>
            <span class="flex-shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] lg:hidden">
              Borrador
            </span>
            <!-- En escritorio las exportaciones van a la vista, sin pasar por el modal -->
            <div v-if="datosCierre.length > 0 && !calculandoCierre" class="hidden flex-shrink-0 gap-2 lg:flex">
              <button
                type="button"
                class="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/40 px-4 text-sm font-bold text-white hover:bg-white/10"
                @click="abrirExportar"
              >
                <ArrowDownTrayIcon class="h-4 w-4" />
                PDF
              </button>
              <button
                type="button"
                class="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/40 px-4 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-60"
                :disabled="exportandoCierreExcel"
                @click="exportarCierreAExcel"
              >
                <ArrowDownTrayIcon class="h-4 w-4" />
                {{ exportandoCierreExcel ? 'Exportando…' : 'Excel' }}
              </button>
            </div>
          </div>

          <nav
            v-if="datosCierre.length > 0 && !calculandoCierre"
            aria-label="Secciones del cierre"
            class="mt-3 flex gap-1 rounded-full bg-black/20 p-1 lg:hidden"
          >
            <button
              v-for="pestana in PESTANAS_CIERRE"
              :key="pestana.valor"
              type="button"
              :aria-pressed="vistaMovil === pestana.valor"
              :class="[
                'flex min-h-[44px] flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-full text-sm transition-colors',
                vistaMovil === pestana.valor ? 'bg-white font-extrabold text-[#1B5E37] shadow' : 'font-bold text-white/90'
              ]"
              @click="cambiarVistaMovil(pestana.valor)"
            >
              {{ pestana.etiqueta }}
              <span
                v-if="pestana.valor === 'socios'"
                :class="[
                  'rounded-full px-1.5 text-[11px] font-extrabold tabular-nums',
                  vistaMovil === 'socios' ? 'bg-[#E8F5E9] text-[#1B5E37]' : 'bg-white/20 text-white'
                ]"
              >{{ datosCierre.length }}</span>
            </button>
          </nav>
        </header>

        <div v-if="calculandoCierre" class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/70 py-24">
          <div class="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#1B5E37] border-t-transparent" />
          <p class="font-medium text-gray-700">Calculando datos de cierre…</p>
          <p class="mt-1 text-sm text-gray-400">Consultando ahorros, utilidades y descuentos</p>
        </div>

        <!--
          Escritorio: resumen a la izquierda y socios a la derecha, las dos a la vista.
          Móvil: una columna a la vez, según la pestaña.
        -->
        <div
          v-else-if="datosCierre.length > 0"
          class="lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-6"
        >
          <!-- ===== Resumen ===== -->
          <aside :class="['space-y-3 lg:sticky lg:top-4 lg:block lg:space-y-4', vistaMovil === 'resumen' ? 'block' : 'hidden']">
            <!--
              El total arriba y, debajo, la cuenta que lo explica: ahorros + utilidades
              − administración − deudas descontadas. Así se ve de dónde sale cada peso
              sin abrir nada.
            -->
            <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <div class="bg-[#f6fbf7] px-4 pb-4 pt-5 text-center lg:text-left">
                <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-600">Total a entregar</p>
                <p class="mt-1 font-display text-[34px] font-extrabold leading-tight tracking-tight text-[#1B5E37] tabular-nums lg:text-4xl">
                  ${{ formatMoney(totalCierreGeneral) }}
                </p>
                <p class="mt-1 text-xs text-gray-500">Efectivo a tener listo para liquidar</p>
              </div>
              <dl class="divide-y divide-gray-100 border-t border-gray-100">
                <div class="flex min-h-[48px] items-center justify-between gap-3 px-4">
                  <dt class="text-sm text-gray-600">Ahorros</dt>
                  <dd class="font-display text-[15px] font-bold tabular-nums text-gray-900">${{ formatMoney(totalAhorros) }}</dd>
                </div>
                <div v-if="utilidadesCierre && utilidadesCierre.bruto !== 0">
                  <!-- Fila entera como botón: abre el desglose por concepto -->
                  <button
                    v-if="hayDesgloseUtilidades"
                    type="button"
                    class="flex min-h-[56px] w-full touch-manipulation items-center justify-between gap-3 px-4 text-left hover:bg-[#f6fbf7] active:bg-[#E8F5E9]"
                    aria-haspopup="dialog"
                    @click="abrirDesgloseUtilidades"
                  >
                    <span class="min-w-0">
                      <span class="block text-sm text-gray-600">+ Utilidades</span>
                      <span class="block text-xs font-bold text-[#1B5E37]">Ver desglose</span>
                    </span>
                    <span class="flex flex-shrink-0 items-center gap-2">
                      <span class="font-display text-[15px] font-bold tabular-nums text-gray-900">${{ formatMoney(utilidadesCierre.bruto) }}</span>
                      <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E37]">
                        <ChevronRightIcon class="h-4 w-4" />
                      </span>
                    </span>
                  </button>
                  <div v-else class="flex min-h-[48px] items-center justify-between gap-3 px-4">
                    <dt class="text-sm text-gray-600">+ Utilidades</dt>
                    <dd class="font-display text-[15px] font-bold tabular-nums text-gray-900">${{ formatMoney(utilidadesCierre.bruto) }}</dd>
                  </div>
                </div>
                <!--
                  Administración: se aparta ANTES de repartir. Sin esta fila la suma de lo
                  entregado no cuadraría con lo recogido y parecería que falta plata.
                -->
                <div
                  v-if="administracionCierre && administracionCierre.monto > 0"
                  class="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2"
                >
                  <dt class="min-w-0">
                    <span class="block text-sm text-gray-600">− Administración {{ administracionCierre.porcentaje }} %</span>
                    <span class="block text-xs text-gray-500">
                      Sobre {{ administracionCierre.base === 'total' ? 'ahorros + utilidades' : 'las utilidades' }}
                    </span>
                  </dt>
                  <dd class="flex-shrink-0 font-display text-[15px] font-bold tabular-nums text-red-700">
                    −${{ formatMoney(administracionCierre.monto) }}
                  </dd>
                </div>
                <div v-if="totalDescontado > 0" class="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2">
                  <dt class="min-w-0">
                    <span class="block text-sm text-gray-600">− Deudas descontadas</span>
                    <span class="block text-xs text-gray-500">Préstamos y cuotas pendientes</span>
                  </dt>
                  <dd class="flex-shrink-0 font-display text-[15px] font-bold tabular-nums text-red-700">
                    −${{ formatMoney(totalDescontado) }}
                  </dd>
                </div>
              </dl>
            </section>

            <!--
              Queda por cobrar: la deuda de quien se va debiendo más de lo que ahorró. No
              se resta del total a entregar porque no es un descuento: es plata que hay
              que ir a buscar. Lleva a la lista ya filtrada por quienes deben.
            -->
            <button
              v-if="totalPorCobrar > 0"
              type="button"
              class="flex min-h-[64px] w-full touch-manipulation items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-3.5 py-3 text-left hover:bg-orange-100/70"
              @click="verSociosQueDeben"
            >
              <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                <ExclamationTriangleIcon class="h-5 w-5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-extrabold text-orange-800">${{ formatMoney(totalPorCobrar) }} por cobrar</span>
                <span class="block text-xs text-orange-800">
                  {{ sociosQueDeben }} {{ sociosQueDeben === 1 ? 'socio se va debiendo' : 'socios se van debiendo' }}
                </span>
              </span>
              <ChevronRightIcon class="h-4 w-4 flex-shrink-0 text-orange-700" />
            </button>

            <div class="flex items-start gap-2.5 rounded-2xl bg-[#E8F5E9] px-3.5 py-3 text-[13px] leading-snug text-[#14532d]">
              <InformationCircleIcon class="mt-px h-[18px] w-[18px] flex-shrink-0" />
              <span>Exporta los comprobantes antes de confirmar. Al cerrar no se puede deshacer.</span>
            </div>

            <!-- Escritorio: el botón vive en la columna del resumen -->
            <button type="button" class="btn-modal-primary hidden w-full lg:inline-flex" @click="confirmarCerrarNatillera">
              Confirmar cierre definitivo
            </button>

            <!-- Móvil: al final del resumen, en su sitio, sin flotar sobre el contenido -->
            <div class="flex gap-2.5 pt-1 lg:hidden">
              <button type="button" class="btn-modal-secondary flex-1" @click="abrirExportar">
                <ArrowDownTrayIcon class="h-[18px] w-[18px]" />
                Exportar
              </button>
              <button type="button" class="btn-modal-primary flex-[1.4]" @click="confirmarCerrarNatillera">
                Confirmar cierre
              </button>
            </div>
          </aside>

          <!-- ===== Socios ===== -->
          <section
            :class="['lg:block', vistaMovil === 'socios' ? 'block' : 'hidden']"
            aria-labelledby="titulo-socios-cierre"
          >
            <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              <div class="space-y-3 border-b border-gray-100 p-3 sm:p-4 lg:flex lg:items-center lg:gap-4 lg:space-y-0">
                <h2 id="titulo-socios-cierre" class="hidden flex-1 font-display text-lg font-extrabold text-gray-900 lg:block">
                  Detalle por socio
                </h2>
                <!-- Lupa por flex, no por `absolute`: en iOS el search cambia de alto al enfocar -->
                <div class="flex min-h-[48px] items-center rounded-xl border border-gray-200 bg-white focus-within:border-[#1B5E37] focus-within:ring-2 focus-within:ring-[#1B5E37]/15 lg:w-72">
                  <span class="flex-shrink-0 pl-3 text-gray-400"><MagnifyingGlassIcon class="h-[18px] w-[18px]" /></span>
                  <input
                    v-model.trim="busquedaCierre"
                    type="search"
                    placeholder="Buscar socio"
                    aria-label="Buscar socio"
                    autocomplete="off"
                    class="min-w-0 flex-1 border-none bg-transparent px-2 py-2.5 text-base text-gray-900 placeholder-gray-400 outline-none focus:ring-0 lg:text-sm"
                  />
                </div>
                <div class="flex gap-1.5" role="group" aria-label="Filtrar socios">
                  <button
                    v-for="filtro in FILTROS_SOCIOS"
                    :key="filtro.valor"
                    type="button"
                    :aria-pressed="filtroSocios === filtro.valor"
                    :class="[
                      'min-h-[44px] touch-manipulation whitespace-nowrap rounded-full px-3.5 lg:min-h-[36px] text-[13px] font-bold transition-colors',
                      filtroSocios === filtro.valor ? 'bg-[#1B5E37] text-white' : 'border border-gray-200 bg-white text-gray-700 hover:border-[#1B5E37]/40'
                    ]"
                    @click="filtroSocios = filtro.valor"
                  >
                    {{ filtro.etiqueta }}<template v-if="filtro.valor === 'todos'"> · {{ datosCierre.length }}</template>
                  </button>
                </div>
              </div>

              <!-- Escritorio: tabla -->
              <table class="hidden w-full border-collapse text-sm lg:table">
                <thead>
                  <tr class="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th class="w-12 px-3 py-2.5 text-center">
                      <input
                        v-model="todosSeleccionadosPdf"
                        type="checkbox"
                        class="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#1B5E37] focus:ring-[#1B5E37]"
                        aria-label="Incluir en el PDF a todos los socios visibles"
                      />
                    </th>
                    <th class="px-3 py-2.5 text-left">Socio</th>
                    <th class="px-3 py-2.5 text-right">Ahorro</th>
                    <th class="px-3 py-2.5 text-right">Utilidades</th>
                    <th class="px-3 py-2.5 text-right">Descuentos</th>
                    <th class="px-3 py-2.5 text-right">A entregar</th>
                    <th class="w-12 px-2 py-2.5"><span class="sr-only">Detalle</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="dato in datosCierreFiltrados"
                    :key="idSocioCierre(dato)"
                    class="cursor-pointer border-t border-gray-100 hover:bg-[#f6fbf7]"
                    @click="abrirSocio(dato)"
                  >
                    <td class="px-3 py-2 text-center" @click.stop>
                      <input
                        v-model="sociosSeleccionadosPdf"
                        type="checkbox"
                        :value="idSocioCierre(dato)"
                        class="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#1B5E37] focus:ring-[#1B5E37]"
                        :aria-label="`Incluir a ${dato.socio?.nombre || 'este socio'} en el PDF`"
                      />
                    </td>
                    <td class="px-3 py-2">
                      <div class="flex min-w-0 items-center gap-2.5">
                        <span
                          :class="[
                            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold',
                            dato.totalFinal < 0 ? 'bg-orange-100 text-orange-700' : 'bg-[#E8F5E9] text-[#1B5E37]'
                          ]"
                        >{{ inicialesSocio(dato) }}</span>
                        <span class="min-w-0">
                          <span class="block max-w-[220px] truncate font-bold text-gray-900" :title="dato.socio?.nombre">{{ dato.socio?.nombre || 'Socio' }}</span>
                          <span v-if="dato.socio?.telefono" class="block truncate text-xs text-gray-500">{{ dato.socio.telefono }}</span>
                        </span>
                      </div>
                    </td>
                    <td class="px-3 py-2 text-right tabular-nums text-gray-600">${{ formatMoney(dato.ahorro) }}</td>
                    <td class="px-3 py-2 text-right tabular-nums text-gray-600">${{ formatMoney(dato.utilidades) }}</td>
                    <td class="px-3 py-2 text-right tabular-nums" :class="dato.descuentos > 0 ? 'text-red-700' : 'text-gray-400'">
                      {{ dato.descuentos > 0 ? `−$${formatMoney(dato.descuentos)}` : '—' }}
                    </td>
                    <td class="px-3 py-2 text-right">
                      <span class="block font-display font-extrabold tabular-nums" :class="dato.totalFinal < 0 ? 'text-orange-700' : 'text-[#1B5E37]'">
                        ${{ formatMoney(Math.abs(dato.totalFinal)) }}
                      </span>
                      <span v-if="dato.totalFinal < 0" class="block text-[11px] font-bold text-orange-700">Debe</span>
                    </td>
                    <td class="px-2 py-2">
                      <button
                        type="button"
                        class="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        :aria-label="`Ver detalle de ${dato.socio?.nombre || 'socio'}`"
                        @click.stop="abrirSocio(dato)"
                      >
                        <ChevronRightIcon class="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Móvil: lista de filas tocables; el detalle y las acciones van en el modal -->
              <ul class="divide-y divide-gray-100 lg:hidden">
                <li v-for="dato in datosCierreFiltrados" :key="'m-' + idSocioCierre(dato)">
                  <button
                    type="button"
                    class="flex min-h-[64px] w-full touch-manipulation items-center gap-3 px-3.5 py-2.5 text-left active:bg-[#f6fbf7]"
                    @click="abrirSocio(dato)"
                  >
                    <span
                      :class="[
                        'flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold',
                        dato.totalFinal < 0 ? 'bg-orange-100 text-orange-700' : 'bg-[#E8F5E9] text-[#1B5E37]'
                      ]"
                    >{{ inicialesSocio(dato) }}</span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-[15px] font-bold text-gray-900">{{ dato.socio?.nombre || 'Socio' }}</span>
                      <!--
                        Utilidades a la vista, sin abrir el socio. Cada cifra en su propia
                        línea: juntas en una sola, el recorte con «…» se comía la de utilidades.
                      -->
                      <span class="block whitespace-nowrap text-xs tabular-nums text-gray-500">Ahorro ${{ formatMoney(dato.ahorro) }}</span>
                      <span class="block whitespace-nowrap text-xs font-bold tabular-nums text-[#1B5E37]">Utilidades ${{ formatMoney(dato.utilidades) }}</span>
                    </span>
                    <span class="flex flex-shrink-0 flex-col items-end">
                      <span class="font-display text-[15px] font-extrabold tabular-nums" :class="dato.totalFinal < 0 ? 'text-orange-700' : 'text-[#1B5E37]'">
                        ${{ formatMoney(Math.abs(dato.totalFinal)) }}
                      </span>
                      <span class="text-[11px] font-bold" :class="dato.totalFinal < 0 ? 'text-orange-700' : 'text-[#1B5E37]'">
                        {{ dato.totalFinal < 0 ? 'Debe' : 'Recibe' }}
                      </span>
                    </span>
                    <ChevronRightIcon class="h-4 w-4 flex-shrink-0 text-gray-300" />
                  </button>
                </li>
              </ul>

              <p v-if="datosCierreFiltrados.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
                No hay socios que coincidan.
              </p>
            </div>
          </section>

          <!--
            Barra de acciones de la pestaña «Socios» en móvil: `sticky`, acompaña el scroll
            de la lista y queda anclada justo encima de la barra inferior de la app, cuyo
            alto se mide en vivo (`useHuecoBarraInferior`, relativo al <main>: por eso es
            sticky y no fixed). En «Resumen» no sale: allí los botones van al final.
          -->
          <div
            v-if="vistaMovil === 'socios'"
            class="cierre-barra-acciones sticky z-20 mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_8px_24px_-8px_rgba(15,83,45,0.35)] lg:hidden"
          >
            <div class="flex gap-2.5">
              <button type="button" class="btn-modal-secondary flex-1" @click="abrirExportar">
                <ArrowDownTrayIcon class="h-[18px] w-[18px]" />
                Exportar
              </button>
              <button type="button" class="btn-modal-primary flex-[1.4]" @click="confirmarCerrarNatillera">
                Confirmar cierre
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-4 py-20 text-center"
        >
          <p class="font-medium text-gray-600">No hay datos para mostrar en este cierre.</p>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <!-- En móvil sube por encima de la barra de acciones y de la barra inferior de la app -->
      <button
        v-if="mostrarBotonArriba"
        type="button"
        class="cierre-boton-arriba fixed right-4 z-40 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-[#1B5E37] text-white shadow-lg shadow-[#1B5E37]/30 transition hover:bg-[#154a2d] sm:right-6 lg:h-14 lg:w-14"
        title="Volver arriba"
        aria-label="Volver arriba"
        @click="scrollToTop"
      >
        <ArrowUpIcon class="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
    </Transition>

    <DesgloseUtilidadesModal
      :show="modalDesgloseUtilidades"
      :bruto="utilidadesCierre?.bruto || 0"
      :neto="utilidadesCierre?.neto || 0"
      :conceptos="conceptosUtilidadesCierre"
      :administracion="administracionCierre"
      @close="modalDesgloseUtilidades = false"
    />

    <SocioCierreModal
      :show="!!socioAbierto"
      :dato="socioAbierto"
      :periodicidad="natillera?.periodicidad || 'mensual'"
      :en-pdf="socioAbierto ? sociosSeleccionadosPdf.includes(idSocioCierre(socioAbierto)) : false"
      :tipos-utilidad="TIPOS_UTILIDAD_CIERRE"
      :etiquetas-utilidad="LABELS_UTILIDAD_CIERRE"
      @close="socioAbierto = null"
      @alternar-pdf="alternarSocioEnPdf(socioAbierto)"
      @descargar="comprobanteAbierto = socioAbierto"
      @whatsapp="comprobanteAbierto = socioAbierto"
    />

    <ComprobanteCierrePreviewModal
      :show="!!comprobanteAbierto"
      :dato="comprobanteAbierto"
      :periodicidad="natillera?.periodicidad || 'mensual'"
      :tipos-utilidad="TIPOS_UTILIDAD_CIERRE"
      :etiquetas-utilidad="LABELS_UTILIDAD_CIERRE"
      :texto="comprobanteAbierto ? textoComprobanteSocio(comprobanteAbierto) : ''"
      @close="comprobanteAbierto = null"
      @sin-compartir="notificationStore.informacion('La imagen se descargó: adjúntala en el chat de WhatsApp que se abrió.', 'Comprobante listo')"
    />

    <ExportarCierreModal
      :show="modalExportar"
      :socios="sociosParaPdf"
      :seleccion="sociosSeleccionadosPdf"
      :exportando-excel="exportandoCierreExcel"
      @close="modalExportar = false"
      @seleccionar-todos="seleccionarTodosPdf"
      @alternar="alternarIdEnPdf"
      @pdf="exportarComprobanteCierrePdf"
      @excel="exportarCierreAExcel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// xlsx-js-style (~600 KB) se carga de forma diferida solo al exportar: evita inflar
// el chunk de la vista y rompe el ciclo de chunks xlsx<->vendor (error TDZ en runtime).
let XLSX = null
async function ensureXLSX() {
  if (!XLSX) {
    const mod = await import('xlsx-js-style')
    XLSX = mod.default || mod
  }
}
import {
  ArrowDownTrayIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import { useNatillerasStore } from '../../stores/natilleras'
import { useColaboradoresStore } from '../../stores/colaboradores'
import { useNotificationStore } from '../../stores/notifications'
import { supabase } from '../../lib/supabase'
import DesgloseUtilidadesModal from '../../components/DesgloseUtilidadesModal.vue'
import SocioCierreModal from '../../components/cierre/SocioCierreModal.vue'
import ExportarCierreModal from '../../components/cierre/ExportarCierreModal.vue'
import ComprobanteCierrePreviewModal from '../../components/cierre/ComprobanteCierrePreviewModal.vue'
import { useHuecoBarraInferior } from '../../composables/useHuecoBarraInferior'
import { calcularCierreNatillera, getModoDistribucion, TIPOS_UTILIDAD as TIPOS_UTILIDAD_CIERRE } from '../../composables/useCierreNatillera'

const props = defineProps({
  id: { type: String, required: true }
})

const route = useRoute()
const router = useRouter()
const natillerasStore = useNatillerasStore()
const colaboradoresStore = useColaboradoresStore()
const notificationStore = useNotificationStore()

const natilleraId = computed(() => props.id || route.params.id)
const { hueco: huecoBarraApp } = useHuecoBarraInferior()
const natillera = computed(() => natillerasStore.natilleraActual)

const usuarioAutenticado = ref(null)
const misPermisos = ref(null)
const inicializando = ref(true)
const accesoDenegado = ref(false)

const esSuperUsuario = computed(() => {
  if (!usuarioAutenticado.value) return false
  const email = (usuarioAutenticado.value.email || '').toLowerCase().trim()
  return email === 'raigo.16@gmail.com'
})

const esAdmin = computed(() => {
  if (!usuarioAutenticado.value || !natillera.value) return false
  return natillera.value.admin_id === usuarioAutenticado.value.id || esSuperUsuario.value
})

const puedeCerrarNatillera = computed(() => {
  if (esAdmin.value) return true
  if (!misPermisos.value) return false
  return misPermisos.value.permisos?.cerrar_natillera === true
})

const datosCierre = ref([])
const busquedaCierre = ref('')

const PESTANAS_CIERRE = [
  { valor: 'resumen', etiqueta: 'Resumen' },
  { valor: 'socios', etiqueta: 'Socios' }
]
const FILTROS_SOCIOS = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'reciben', etiqueta: 'Reciben' },
  { valor: 'deben', etiqueta: 'Deben' }
]
/** Pestaña visible en <lg. En escritorio se ven las dos columnas y esto no pinta. */
const vistaMovil = ref('resumen')
const filtroSocios = ref('todos')
const socioAbierto = ref(null)
const modalExportar = ref(false)
const sociosSeleccionadosPdf = ref([])
/** Socio cuyo comprobante se está viendo antes de enviarlo o descargarlo. */
const comprobanteAbierto = ref(null)

const todosSeleccionadosPdf = computed({
  get() {
    return datosCierreFiltrados.value.length > 0 &&
      datosCierreFiltrados.value.every(d => sociosSeleccionadosPdf.value.includes(d.socioNatillera?.id || d.socio?.id))
  },
  set(val) {
    if (val) {
      const nuevos = datosCierreFiltrados.value.map(d => d.socioNatillera?.id || d.socio?.id)
      sociosSeleccionadosPdf.value = [...new Set([...sociosSeleccionadosPdf.value, ...nuevos])]
    } else {
      const visibles = datosCierreFiltrados.value.map(d => d.socioNatillera?.id || d.socio?.id)
      sociosSeleccionadosPdf.value = sociosSeleccionadosPdf.value.filter(id => !visibles.includes(id))
    }
  }
})

const datosCierreFiltrados = computed(() => {
  let list = [...datosCierre.value]
  list.sort((a, b) => {
    const nombreA = (a.socio?.nombre || '').toLowerCase()
    const nombreB = (b.socio?.nombre || '').toLowerCase()
    return nombreA.localeCompare(nombreB)
  })
  const q = busquedaCierre.value.trim().toLowerCase()
  if (q) {
    list = list.filter(d => (d.socio?.nombre || '').toLowerCase().includes(q) || (d.socio?.telefono || '').includes(q))
  }
  if (filtroSocios.value === 'deben') list = list.filter(d => (parseFloat(d.totalFinal) || 0) < 0)
  if (filtroSocios.value === 'reciben') list = list.filter(d => (parseFloat(d.totalFinal) || 0) >= 0)
  return list
})

const totalCierreGeneral = computed(() => {
  return datosCierre.value.reduce((sum, socio) => {
    const v = parseFloat(socio.totalFinal) || 0
    return sum + (v > 0 ? v : 0)
  }, 0)
})

/*
 * Lo que el fondo NO entrega porque el socio debe más de lo que ahorró.
 *
 * Un total negativo no se compensa con los positivos: es plata que alguien le queda
 * debiendo a la natillera y que hay que cobrar aparte o asumir como pérdida. Sumado a
 * los positivos daría un «total a entregar» más bajo del real y taparía la deuda.
 */
const totalPorCobrar = computed(() => {
  return datosCierre.value.reduce((sum, socio) => {
    const v = parseFloat(socio.totalFinal) || 0
    return sum + (v < 0 ? -v : 0)
  }, 0)
})

const totalAhorros = computed(() =>
  datosCierre.value.reduce((sum, socio) => sum + (parseFloat(socio.ahorro) || 0), 0)
)

/*
 * Lo que las deudas de los socios (préstamos, cuotas) le quitan al total a entregar.
 * Se saca por diferencia y no sumando `descuentos`: a quien debe más de lo que tiene
 * solo se le puede descontar hasta dejarlo en cero —el resto va a «por cobrar»—, y así
 * la cuenta del resumen cierra exacta con el total de arriba.
 */
const totalDescontado = computed(() => {
  const bruto = utilidadesCierre.value?.bruto || 0
  const administracion = administracionCierre.value?.monto || 0
  const diferencia = totalAhorros.value + bruto - administracion - totalCierreGeneral.value
  return diferencia >= 1 ? diferencia : 0
})

const sociosQueDeben = computed(() =>
  datosCierre.value.filter(socio => (parseFloat(socio.totalFinal) || 0) < 0).length
)

/** Lo que se destina a gastos de administración, según el reglamento configurado. */
const administracionCierre = ref(null)
/*
 * Utilidades acumuladas del ciclo: el bruto (lo que generó la natillera) y el neto que
 * se reparte tras apartar administración. Van juntas porque la diferencia entre ambas
 * es justo lo que se aparta, y verlo antes de cerrar evita la pregunta de «¿y el resto?».
 */
const utilidadesCierre = ref(null)
const modalDesgloseUtilidades = ref(false)
const hayDesgloseUtilidades = computed(() => conceptosUtilidadesCierre.value.length > 0)
function abrirDesgloseUtilidades() {
  if (!hayDesgloseUtilidades.value) return
  modalDesgloseUtilidades.value = true
}
const conceptosUtilidadesCierre = computed(() => {
  const porTipo = utilidadesCierre.value?.porTipo || {}
  return Object.keys(porTipo)
    .filter(tipo => (porTipo[tipo] || 0) !== 0)
    .sort((a, b) => (porTipo[b] || 0) - (porTipo[a] || 0))
    .map(tipo => ({ tipo, label: LABELS_UTILIDAD_CIERRE[tipo] || tipo, monto: porTipo[tipo] || 0 }))
})

const calculandoCierre = ref(false)
const exportandoCierreExcel = ref(false)

const mostrarBotonArriba = ref(false)
let scrollContainerMain = null
const UMBRAL_SCROLL_ARRIBA_PX = 120

function scrollToTop() {
  const main = document.querySelector('main')
  if (main && main.scrollTop > 0) {
    main.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleScrollArriba() {
  if (!scrollContainerMain) scrollContainerMain = document.querySelector('main')
  let scrollTop = 0
  let scrollHeight = 0
  let clientHeight = 0
  if (scrollContainerMain) {
    scrollTop = scrollContainerMain.scrollTop
    scrollHeight = scrollContainerMain.scrollHeight
    clientHeight = scrollContainerMain.clientHeight
  } else {
    scrollTop = window.scrollY || document.documentElement.scrollTop
    scrollHeight = document.documentElement.scrollHeight
    clientHeight = window.innerHeight
  }
  const hayScroll = scrollHeight > clientHeight + 50
  const haBajado = scrollTop > UMBRAL_SCROLL_ARRIBA_PX
  mostrarBotonArriba.value = hayScroll && haBajado
}

const LABELS_UTILIDAD_CIERRE = {
  prestamos: 'Préstamos',
  rifas: 'Rifas',
  bingo: 'Bingos',
  venta: 'Ventas',
  evento: 'Eventos',
  otro: 'Otros',
  sanciones: 'Sanciones',
  utilidades_adicionales: 'Adicionales'
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO').format(value || 0)
}

function idSocioCierre(dato) {
  return dato.socioNatillera?.id || dato.socio?.id
}

function inicialesSocio(dato) {
  return (dato.socio?.nombre || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

function cambiarVistaMovil(vista) {
  if (vistaMovil.value === vista) return
  vistaMovil.value = vista
  scrollToTop()
}

// Desde el aviso de «por cobrar»: la lista ya filtrada, sin tener que buscar a nadie.
function verSociosQueDeben() {
  filtroSocios.value = 'deben'
  busquedaCierre.value = ''
  cambiarVistaMovil('socios')
  if (window.matchMedia?.('(min-width: 1024px)').matches) {
    document.getElementById('titulo-socios-cierre')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function abrirSocio(dato) {
  socioAbierto.value = dato
}

function abrirExportar() {
  modalExportar.value = true
}

function alternarIdEnPdf(id) {
  const seleccion = sociosSeleccionadosPdf.value
  sociosSeleccionadosPdf.value = seleccion.includes(id) ? seleccion.filter(x => x !== id) : [...seleccion, id]
}

function alternarSocioEnPdf(dato) {
  if (!dato) return
  alternarIdEnPdf(idSocioCierre(dato))
}

/** Lista del modal «Exportar»: todos los socios por nombre, con lo que reciben o deben. */
const sociosParaPdf = computed(() =>
  [...datosCierre.value]
    .sort((a, b) => (a.socio?.nombre || '').localeCompare(b.socio?.nombre || ''))
    .map(d => {
      const total = parseFloat(d.totalFinal) || 0
      return { id: idSocioCierre(d), nombre: d.socio?.nombre || 'Socio', monto: Math.abs(total), debe: total < 0 }
    })
)

function seleccionarTodosPdf(todos) {
  sociosSeleccionadosPdf.value = todos ? datosCierre.value.map(idSocioCierre) : []
}

async function calcularDatosCierre() {
  if (!natillera.value || calculandoCierre.value) return
  calculandoCierre.value = true
  try {
    const nid = natilleraId.value
    const result = await calcularCierreNatillera(nid, {
      configCierre: natillera.value.config_cierre
    })
    if (result.error) {
      alert('Error al calcular los datos de cierre: ' + result.error)
      datosCierre.value = []
      utilidadesCierre.value = null
      return
    }
    administracionCierre.value = result.administracion || null
    utilidadesCierre.value = {
      bruto: result.totalUtilidadesBruto || 0,
      neto: result.totalUtilidades || 0,
      porTipo: result.utilidadesPorTipoBruto || {}
    }
    datosCierre.value = (result.socios || []).map(s => {
      // El total a entregar lo calcula el composable: ya viene con la administración
      // descontada. Recalcularlo aquí como ahorro + utilidades se la comía.
      const totalAEntregar = s.totalAEntregar != null
        ? s.totalAEntregar
        : (s.ahorro || 0) + (s.utilidadesTotal || 0) - (s.aporteAdministracion || 0)
      const totalFinal = totalAEntregar - (s.descuentos || 0)
      return {
        ...s,
        utilidades: s.utilidadesTotal,
        totalAEntregar,
        totalFinal
      }
    })
    sociosSeleccionadosPdf.value = datosCierre.value.map(d => d.socioNatillera?.id || d.socio?.id)
  } catch (error) {
    console.error('Error calculando datos de cierre:', error)
    alert('Error al calcular los datos de cierre: ' + (error?.message || error))
    datosCierre.value = []
  } finally {
    calculandoCierre.value = false
  }
}

async function confirmarCerrarNatillera() {
  if (!confirm('¿Estás seguro de cerrar esta natillera? Esta acción no se puede deshacer.')) {
    return
  }
  const result = await natillerasStore.cerrarNatillera(natilleraId.value)
  if (result.success) {
    alert('Natillera cerrada exitosamente')
    router.push('/dashboard')
  } else {
    alert('Error al cerrar la natillera: ' + result.error)
  }
}

async function exportarCierreAExcel() {
  if (datosCierre.value.length === 0) return
  exportandoCierreExcel.value = true
  try {
    await ensureXLSX()
    const datosOrdenados = [...datosCierre.value].sort((a, b) => {
      const nombreA = (a.socio?.nombre || '').toLowerCase()
      const nombreB = (b.socio?.nombre || '').toLowerCase()
      return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' })
    })

    const datosExportar = datosOrdenados.map(d => {
      const totalFinal = parseFloat(d.totalFinal) || 0
      const aEntregar = totalFinal >= 0 ? totalFinal : 0
      const debe = totalFinal < 0 ? -totalFinal : 0
      return {
        Socio: d.socio?.nombre || 'Socio',
        Telefono: d.socio?.telefono || '',
        Ahorro: parseFloat(d.ahorro) || 0,
        Utilidades: parseFloat(d.utilidades) || 0,
        'Total (Antes de desc.)': parseFloat(d.totalAEntregar) || 0,
        Descuentos: parseFloat(d.descuentos) || 0,
        'A Entregar': aEntregar,
        Debe: debe
      }
    })

    const wb = XLSX.utils.book_new()
    const wsData = [
      [natillera.value?.nombre || 'Natillera'],
      ['Cierre de Natillera'],
      ['Exportado:', new Date().toLocaleString('es-CO')],
      [],
      ['Socio', 'Teléfono', 'Ahorro', 'Utilidades', 'Total (Antes de desc.)', 'Descuentos', 'A Entregar', 'Debe'],
      ...datosExportar.map(d => [d.Socio, d.Telefono, d.Ahorro, d.Utilidades, d['Total (Antes de desc.)'], d.Descuentos, d['A Entregar'], d.Debe]),
      [],
      ['TOTAL GENERAL', '', '', '', '', '', totalCierreGeneral.value, totalPorCobrar.value]
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: wsData.length - 1, c: 7 } })
    ws['!freeze'] = { xSplit: 0, ySplit: 5, topLeftCell: 'A6', state: 'frozen' }

    const colorRed = { rgb: 'DC2626' }
    const colorRedOscuro = { rgb: 'B91C1C' }
    const colorRojo = { rgb: 'DC2626' }

    ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
    ws['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
    ws['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }

    const headerRow = 4
    for (let col = 0; col < 8; col++) {
      const cell = XLSX.utils.encode_cell({ r: headerRow, c: col })
      ws[cell].s = {
        fill: { fgColor: colorRed, patternType: 'solid' },
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { top: { style: 'thin', color: colorRedOscuro }, bottom: { style: 'thin', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
      }
    }

    const dataStartRow = 5
    const dataEndRow = dataStartRow + datosExportar.length - 1
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      const idx = row - dataStartRow
      const aEntregar = datosExportar[idx]?.['A Entregar'] ?? 0
      const debe = datosExportar[idx]?.Debe ?? 0
      for (let col = 0; col < 8; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col })
        if (!ws[cell]) continue
        const isAEntregar = col === 6
        const isDebe = col === 7
        const color = isDebe && debe > 0 ? colorRojo : (isAEntregar ? { rgb: '047857' } : { rgb: '1F2937' })
        ws[cell].s = {
          fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' },
          font: { sz: 10, bold: col === 0, color },
          alignment: { horizontal: col >= 2 ? 'right' : 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } }
        }
        if (col >= 2) ws[cell].z = (isAEntregar || isDebe) ? '#,##0' : '#,##0'
      }
    }

    const totalRow = dataEndRow + 2
    const cellTotalLabel = XLSX.utils.encode_cell({ r: totalRow, c: 0 })
    const cellTotalVal = XLSX.utils.encode_cell({ r: totalRow, c: 6 })
    ws[cellTotalLabel].s = {
      fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '991B1B' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { top: { style: 'medium', color: colorRedOscuro }, bottom: { style: 'medium', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
    }
    ws[cellTotalVal].s = {
      fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' },
      font: { bold: true, sz: 12, color: { rgb: '991B1B' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'medium', color: colorRedOscuro }, bottom: { style: 'medium', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
    }
    ws[cellTotalVal].z = '#,##0;[Red]-#,##0'

    ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]

    XLSX.utils.book_append_sheet(wb, ws, 'Cierre de Natillera')

    construirHojaUtilidadesPorSocio(wb, datosOrdenados)

    const nombreArchivo = `Cierre_Natillera_${(natillera.value?.nombre || 'Natillera').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, nombreArchivo)
    notificationStore.exito('El archivo se descargó correctamente.', 'Excel exportado')
  } catch (e) {
    console.error('Error exportando cierre a Excel:', e)
    notificationStore.critica(e.message || 'Error desconocido', 'No se pudo exportar')
  } finally {
    exportandoCierreExcel.value = false
  }
}

/**
 * Construye y agrega la hoja «Aportes y Utilidades» al libro:
 * por cada socio (orden alfabético) muestra el % aportado al ahorro total
 * y el valor recibido en cada tipo de utilidad (solo se incluyen tipos con monto > 0).
 */
function construirHojaUtilidadesPorSocio(wb, datosOrdenados) {
  if (!datosOrdenados || datosOrdenados.length === 0) return

  const totalAhorro = datosOrdenados.reduce((s, d) => s + (parseFloat(d.ahorro) || 0), 0)
  const configCierre = natillera.value?.config_cierre || {}

  // Solo incluir tipos con utilidad > 0 sumada entre todos los socios
  const tiposActivos = TIPOS_UTILIDAD_CIERRE.filter(tipo => {
    const totalTipo = datosOrdenados.reduce((s, d) => {
      return s + (parseFloat(d.utilidadesPorConcepto?.[tipo]) || 0)
    }, 0)
    return totalTipo > 0
  })

  const modoPorTipo = {}
  tiposActivos.forEach(tipo => {
    modoPorTipo[tipo] = getModoDistribucion(configCierre, tipo)
  })

  const labelsTipos = tiposActivos.map(t => {
    const modo = modoPorTipo[t]
    const sigla = modo === 'proporcional' ? 'P' : 'E'
    return `${LABELS_UTILIDAD_CIERRE[t] || t}\n(${sigla})`
  })
  const headers = ['Socio', '% Aportado', 'Ahorro', ...labelsTipos, 'Total Utilidades']
  const totalCols = headers.length

  const filasSocios = datosOrdenados.map(d => {
    const ahorro = parseFloat(d.ahorro) || 0
    const porcentaje = totalAhorro > 0 ? (ahorro / totalAhorro) : 0
    const valoresTipos = tiposActivos.map(tipo => parseFloat(d.utilidadesPorConcepto?.[tipo]) || 0)
    const totalUtilidades = valoresTipos.reduce((s, v) => s + v, 0)
    return [
      d.socio?.nombre || 'Socio',
      porcentaje,
      ahorro,
      ...valoresTipos,
      totalUtilidades
    ]
  })

  const filaTotales = ['TOTAL', 1, totalAhorro]
  tiposActivos.forEach(tipo => {
    const totalTipo = datosOrdenados.reduce((s, d) => s + (parseFloat(d.utilidadesPorConcepto?.[tipo]) || 0), 0)
    filaTotales.push(totalTipo)
  })
  const totalUtilidadesGeneral = datosOrdenados.reduce((s, d) => {
    return s + tiposActivos.reduce((ss, tipo) => ss + (parseFloat(d.utilidadesPorConcepto?.[tipo]) || 0), 0)
  }, 0)
  filaTotales.push(totalUtilidadesGeneral)

  const wsData = [
    [natillera.value?.nombre || 'Natillera'],
    ['Aportes y Utilidades por Socio'],
    ['Exportado:', new Date().toLocaleString('es-CO')],
    ['(E) Equitativa · (P) Proporcional al ahorro'],
    headers,
    ...filasSocios,
    [],
    filaTotales
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: wsData.length - 1, c: totalCols - 1 } })
  ws['!freeze'] = { xSplit: 1, ySplit: 5, topLeftCell: 'B6', state: 'frozen' }

  const colorRed = { rgb: 'DC2626' }
  const colorRedOscuro = { rgb: 'B91C1C' }

  if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '1F2937' } } }
  if (ws['A2']) ws['A2'].s = { font: { sz: 12, color: { rgb: '4B5563' } } }
  if (ws['A3']) ws['A3'].s = { font: { sz: 10, color: { rgb: '6B7280' } } }
  if (ws['A4']) ws['A4'].s = { font: { sz: 10, italic: true, color: { rgb: '6B7280' } } }

  const headerRow = 4
  for (let col = 0; col < totalCols; col++) {
    const cell = XLSX.utils.encode_cell({ r: headerRow, c: col })
    if (!ws[cell]) continue
    ws[cell].s = {
      fill: { fgColor: colorRed, patternType: 'solid' },
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: { top: { style: 'thin', color: colorRedOscuro }, bottom: { style: 'thin', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
    }
  }
  ws['!rows'] = ws['!rows'] || []
  ws['!rows'][headerRow] = { hpt: 32 }

  const dataStartRow = 5
  const dataEndRow = dataStartRow + filasSocios.length - 1
  for (let row = dataStartRow; row <= dataEndRow; row++) {
    for (let col = 0; col < totalCols; col++) {
      const cell = XLSX.utils.encode_cell({ r: row, c: col })
      if (!ws[cell]) continue
      const isPorcentaje = col === 1
      const isUltimaCol = col === totalCols - 1
      const color = isUltimaCol ? { rgb: '7E22CE' } : { rgb: '1F2937' }
      ws[cell].s = {
        fill: { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' },
        font: { sz: 10, bold: col === 0 || isUltimaCol, color },
        alignment: { horizontal: col >= 1 ? 'right' : 'left', vertical: 'center' },
        border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } }
      }
      if (isPorcentaje) {
        ws[cell].z = '0.00%'
      } else if (col >= 2) {
        ws[cell].z = '#,##0'
      }
    }
  }

  const totalRow = dataEndRow + 2
  for (let col = 0; col < totalCols; col++) {
    const cell = XLSX.utils.encode_cell({ r: totalRow, c: col })
    if (!ws[cell]) continue
    ws[cell].s = {
      fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' },
      font: { bold: true, sz: 11, color: { rgb: '991B1B' } },
      alignment: { horizontal: col === 0 ? 'left' : 'right', vertical: 'center' },
      border: { top: { style: 'medium', color: colorRedOscuro }, bottom: { style: 'medium', color: colorRedOscuro }, left: { style: 'thin', color: colorRedOscuro }, right: { style: 'thin', color: colorRedOscuro } }
    }
    if (col === 1) {
      ws[cell].z = '0.00%'
    } else if (col >= 2) {
      ws[cell].z = '#,##0'
    }
  }

  const cols = [{ wch: 28 }, { wch: 12 }, { wch: 14 }]
  for (let i = 0; i < tiposActivos.length; i++) cols.push({ wch: 14 })
  cols.push({ wch: 16 })
  ws['!cols'] = cols

  XLSX.utils.book_append_sheet(wb, ws, 'Aportes y Utilidades')
}

/*
 * Mensaje que acompaña la imagen en WhatsApp. Corto y en el mismo orden que el
 * comprobante: la imagen trae el detalle, el texto dice lo esencial por si no carga.
 * Sin emojis: en WhatsApp de escritorio y en algunos Android salen como cuadros.
 */
function textoComprobanteSocio(dato) {
  const nombre = (dato.socio?.nombre || 'socio').split(/\s+/)[0]
  const nombreNatillera = natillera.value?.nombre || 'la natillera'
  const totalFinal = parseFloat(dato.totalFinal) || 0
  const lineas = [
    `Hola ${nombre}, este es tu comprobante del cierre de *${nombreNatillera}*.`,
    '',
    `Ahorro: $${formatMoney(dato.ahorro)}`,
    `Utilidades: $${formatMoney(dato.utilidades)}`
  ]
  if ((dato.aporteAdministracion || 0) > 0) lineas.push(`Administración: −$${formatMoney(dato.aporteAdministracion)}`)
  if ((dato.descuentos || 0) > 0) lineas.push(`Descuentos: −$${formatMoney(dato.descuentos)}`)
  lineas.push('')
  lineas.push(totalFinal >= 0
    ? `*Recibes: $${formatMoney(totalFinal)}*`
    : `*Quedas debiendo: $${formatMoney(-totalFinal)}*`)
  return lineas.join('\n')
}

function htmlComprobanteSocio(dato) {
  const nombre = dato.socio?.nombre || 'Socio'

  let descuentosTexto = ''
  if (dato.descuentos > 0 && dato.descuentosDesglose) {
    const desc = []
    if (dato.descuentosDesglose.prestamosPendientes > 0) desc.push(`Préstamos pendientes`)
    if (dato.descuentosDesglose.cuotasSinPagar > 0) desc.push(`Cuotas en deuda`)
    if (desc.length > 0) {
      descuentosTexto = ` <span style="font-size: 11px; color: #6b7280; font-weight: normal;">(${desc.join(', ')})</span>`
    }
  }

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 12px; max-width: 500px; margin: 0 auto; border: 1px dashed #9ca3af; background-color: #ffffff; break-inside: avoid; page-break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; width: 30%; color: #374151;">Participante</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 700; color: #111827;" colspan="3">${nombre}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Ahorro mensual</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;">$${formatMoney(dato.montoAhorradoMensual)}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Cuotas</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827; width: 15%;">${dato.cantidadCuotasPagadas}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Total Ahorro</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;" colspan="3">$${formatMoney(dato.ahorro)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Descuentos</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;" colspan="3">${dato.descuentos > 0 ? '$' + formatMoney(dato.descuentos) + descuentosTexto : ''}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; font-weight: 600; color: #374151;">Ganancias</td>
            <td style="border: 1px solid #d1d5db; padding: 6px 10px; text-align: right; color: #111827;" colspan="3">$${formatMoney(dato.utilidadesTotal)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: 700; background-color: #e5e7eb; color: #000000; text-transform: uppercase;">Total a entregar</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; background-color: #e5e7eb; color: #000000; font-weight: 800; font-size: 16px;" colspan="3">
              $${formatMoney((dato.totalFinal || 0) >= 0 ? (dato.totalFinal || 0) : 0)}
            </td>
          </tr>
          ${(dato.totalFinal || 0) < 0 ? `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: 700; background-color: #fef2f2; color: #991b1b; text-transform: uppercase;">Debe</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; background-color: #fef2f2; color: #991b1b; font-weight: 800; font-size: 16px;" colspan="3">
              $${formatMoney(-(dato.totalFinal || 0))}
            </td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `
}

function exportarComprobanteCierrePdf() {
  // Sobre todos los socios y no sobre los filtrados: el modal «Exportar» cuenta la
  // selección completa, y un filtro olvidado dejaría gente fuera del PDF sin avisar.
  const seleccionados = datosCierre.value
    .filter(d => sociosSeleccionadosPdf.value.includes(idSocioCierre(d)))
    .sort((x, y) => (x.socio?.nombre || '').localeCompare(y.socio?.nombre || ''))

  if (seleccionados.length === 0) {
    alert('Por favor, selecciona al menos un socio para exportar su comprobante.')
    return
  }

  const nombreNatillera = natillera.value?.nombre || 'Natillera'
  const partes = seleccionados.map(d => htmlComprobanteSocio(d, nombreNatillera))
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Comprobante de cierre - ${nombreNatillera}</title><style>body{font-family:system-ui,sans-serif;padding:1rem}.socio{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #eee}</style></head><body><h1 style="margin-bottom:1.5rem">Comprobante de cierre - ${nombreNatillera}</h1>${partes.map(p => `<div class="socio">${p}</div>`).join('')}</body></html>`
  const w = window.open('', '_blank')
  if (!w) {
    alert('Permite ventanas emergentes para exportar el comprobante.')
    return
  }
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => {
    w.print()
    w.close()
  }, 250)
}

onMounted(async () => {
  const nid = natilleraId.value

  // Quién eres y qué natillera es no dependen el uno del otro: se piden a la vez
  // en lugar de encadenar dos viajes al servidor.
  const [{ data: { user } }] = await Promise.all([
    supabase.auth.getUser(),
    natillerasStore.fetchNatillera(nid),
  ])
  usuarioAutenticado.value = user

  await nextTick()

  if (natillera.value) {
    if (!esAdmin.value) {
      try {
        // Rol y permisos son dos consultas distintas y ninguna necesita a la
        // otra. Además se le pasa el `user` ya resuelto: sin él,
        // `obtenerMisPermisos` vuelve a pedirlo por su cuenta.
        const [, permisos] = await Promise.all([
          colaboradoresStore.obtenerMiRol(nid),
          colaboradoresStore.obtenerMisPermisos(nid, { user }),
        ])
        misPermisos.value = permisos
      } catch (err) {
        console.warn('Error obteniendo rol y permisos del usuario:', err)
        misPermisos.value = null
      }
    } else {
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

  if (!puedeCerrarNatillera.value || natillera.value?.estado !== 'activa') {
    accesoDenegado.value = true
    inicializando.value = false
    return
  }

  inicializando.value = false
  await calcularDatosCierre()

  scrollContainerMain = document.querySelector('main')
  if (scrollContainerMain) {
    scrollContainerMain.addEventListener('scroll', handleScrollArriba, { passive: true })
  }
  window.addEventListener('scroll', handleScrollArriba, { passive: true })
  await nextTick()
  handleScrollArriba()
})

onUnmounted(() => {
  if (scrollContainerMain) {
    scrollContainerMain.removeEventListener('scroll', handleScrollArriba)
    scrollContainerMain = null
  }
  window.removeEventListener('scroll', handleScrollArriba)
})
</script>

<style scoped>
/*
 * Encima de la barra inferior de la app, con 8px de aire. `--hueco-barra-app` es su alto
 * medido en vivo (ya incluye safe-area y lo que la levante la barra de Safari en iOS).
 */
.cierre-barra-acciones {
  bottom: calc(var(--hueco-barra-app, 0px) + 0.5rem);
}
/* El «volver arriba» se apila sobre la barra de acciones en móvil. */
.cierre-boton-arriba {
  bottom: calc(var(--hueco-barra-app, 0px) + 6rem);
}
@media (min-width: 1024px) {
  .cierre-boton-arriba { bottom: 1.5rem; }
}
</style>

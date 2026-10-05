<template>
  <ModalWrapper
    :show="show"
    :z-index="55"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-velo-modal backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-borde/60 bg-superficie-tarjeta"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera marca compacta: móvil en fila [← | icono | títulos | X], escritorio en columna; ← y X por flex -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white">
      <div
        class="sm:hidden flex min-h-[4.2rem] items-center pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3"
        :class="mostrarVolver ? 'gap-2 pl-2' : 'gap-3 pl-4'"
      >
        <button
          v-if="mostrarVolver"
          type="button"
          class="flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/15 [-webkit-tap-highlight-color:transparent]"
          aria-label="Volver al socio"
          @click="emit('volver')"
        >
          <ChevronLeftIcon class="h-6 w-6" />
        </button>
        <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <ClipboardDocumentListIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight">Comprobante de varias cuotas</h3>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/85">{{ socioNombre }}</p>
        </div>
        <button
          type="button"
          class="inline-flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/95 hover:bg-white/15 [-webkit-tap-highlight-color:transparent]"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
      <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="flex w-11 flex-shrink-0 justify-start" :aria-hidden="mostrarVolver ? undefined : 'true'">
          <button
            v-if="mostrarVolver"
            type="button"
            class="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-white hover:bg-white/15"
            aria-label="Volver al socio"
            @click="emit('volver')"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <!-- tema-fijo: círculo blanco con icono verde sobre la cabecera de marca -->
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <ClipboardDocumentListIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="font-display text-lg font-bold leading-tight">Comprobante de varias cuotas</h3>
          <p class="mt-1 text-xs leading-snug text-white/85">{{ socioNombre }}</p>
        </div>
        <button
          type="button"
          class="inline-flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-full text-white/95 hover:bg-white/15"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref="areaScroll"
        class="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-superficie-tarjeta px-4 pt-4 pb-6 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-5"
        @scroll.passive="programarNatiscroll"
      >
        <CargaCaja v-if="cargando" texto="Cargando pagos" detalle="Buscando las cuotas que ha pagado." />

        <p v-else-if="errorCarga" class="rounded-xl border border-red-200 oscuro:border-red-500/30 bg-red-50 oscuro:bg-red-500/15 px-3 py-2.5 text-sm text-red-700 oscuro:text-red-300">
          {{ errorCarga }}
        </p>

        <p v-else-if="periodos.length === 0" class="rounded-xl bg-superficie-suave px-3 py-6 text-center text-sm text-texto-suave">
          Este socio todavía no tiene pagos registrados.
        </p>

        <template v-else>
          <!-- 1. Qué cuotas entran. Por defecto, las del último día en que pagó. En el recibo
               de un pago recién hecho no se elige: se muestra lo que se pagó. -->
          <section v-if="!esReciboDePago">
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="text-xs font-bold uppercase tracking-wide text-texto-suave">Cuotas a incluir</p>
              <button
                type="button"
                class="min-h-[44px] touch-manipulation px-2 text-xs font-semibold text-marca-tinta"
                @click="alternarTodas"
              >
                {{ todasSeleccionadas ? 'Quitar todas' : 'Elegir todas' }}
              </button>
            </div>
            <ul class="space-y-1.5">
              <li v-for="p in periodos" :key="p.clave">
                <button
                  type="button"
                  role="checkbox"
                  :aria-checked="seleccion.has(p.clave)"
                  class="flex min-h-[48px] w-full touch-manipulation items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors"
                  :class="seleccion.has(p.clave) ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-marca-suave' : 'border-borde bg-superficie-tarjeta hover:bg-superficie-suave'"
                  @click="alternar(p.clave)"
                >
                  <span
                    class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2"
                    :class="seleccion.has(p.clave) ? 'border-[#1B5E37] oscuro:border-marca-tinta bg-[#1B5E37] text-white' : 'border-borde-fuerte bg-superficie-tarjeta'"
                  >
                    <CheckIcon v-if="seleccion.has(p.clave)" class="h-3.5 w-3.5" stroke-width="3" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-semibold text-texto-fuerte">{{ p.periodo }}</span>
                    <span class="block text-xs text-texto-suave">
                      Pagado {{ p.fechasTexto }}<template v-if="p.pendiente > 0"> · <span class="font-semibold text-amber-700 oscuro:text-amber-300">parcial, quedan ${{ formatMoney(p.pendiente) }}</span></template>
                    </span>
                  </span>
                  <span class="flex-shrink-0 text-sm font-bold tabular-nums text-texto-fuerte">${{ formatMoney(p.total) }}</span>
                </button>
              </li>
            </ul>
          </section>

          <!-- 2. El comprobante tal cual se va a enviar: esto es lo que se convierte en imagen -->
          <section v-if="periodosElegidos.length > 0">
            <p v-if="!esReciboDePago" class="mb-2 text-xs font-bold uppercase tracking-wide text-texto-suave">Así se enviará</p>
            <!--
              Misma línea que el comprobante de cierre: banda verde marca, el total arriba
              en salvia, Mulish, sin degradados ni emojis. Estilos en línea a propósito:
              html-to-image no resuelve bien los colores modernos de Tailwind 4, y así la
              imagen sale igual en todos los navegadores.
            -->
            <div
              ref="comprobanteRef"
              data-tema="claro"
              style="box-sizing: border-box; width: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; font-family: Mulish, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #0f172a;"
            >
              <div style="background: #1B5E37; color: #ffffff; padding: 18px 20px 16px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.75);">
                  Comprobante de pago · {{ conteoElegidos }}
                </p>
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 12px;">
                  <span style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 9999px; background: rgba(255,255,255,0.16); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800;">{{ iniciales }}</span>
                  <span style="min-width: 0; font-size: 18px; font-weight: 800; line-height: 1.2;">{{ socioNombre }}</span>
                </div>
              </div>

              <div style="padding: 16px 20px 4px;">
                <!-- Lo que se venía a mirar -->
                <div style="border-radius: 16px; padding: 14px 16px; text-align: center; background: #E8F5E9;">
                  <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #1B5E37;">Total pagado</p>
                  <p style="margin: 4px 0 0; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; color: #1B5E37;">${{ formatMoney(totalGeneral) }}</p>
                  <p style="margin: 6px 0 0; font-size: 12px; color: #475569;">{{ fechasElegidasTexto }} · {{ formasElegidasTexto }}</p>
                </div>

                <!--
                  Punto medio entre tarjeta y ticket: cada cuota en su tarjeta (fondo suave y
                  borde verde) para ubicarla de un vistazo, pero con renglones de puntos guía y
                  el corte con muescas antes del resumen, como un ticket. Lo pagado en ella
                  viene de donde venga (Cuotas, Préstamos o Actividades); las etiquetas y el
                  punto de cada renglón llevan el color de su concepto, el mismo del resumen.
                  Si quedó saldo, la tarjeta lo dice: «Pago parcial» y cuánto falta.
                -->
                <div
                  v-for="p in periodosElegidos"
                  :key="p.clave"
                  style="margin-top: 12px; border-radius: 12px; padding: 10px 12px; border-left: 4px solid #1B5E37; background: #F3F9F4;"
                >
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span
                      v-for="t in tiposDe(p)"
                      :key="t"
                      :style="{ color: COLORES_TIPO[t], background: '#ffffff' }"
                      style="padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5;"
                    >{{ ETIQUETAS_TIPO[t] }}</span>
                    <span
                      v-if="p.pendiente > 0"
                      style="padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.5; color: #b45309; background: #FEF3C7;"
                    >Pago parcial</span>
                  </div>
                  <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: baseline; gap: 12px;">
                    <span style="min-width: 0; font-size: 14px; font-weight: 800; color: #0f172a;">{{ p.periodo }}</span>
                    <span style="font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap;">${{ formatMoney(p.total) }}</span>
                  </div>
                  <div style="margin-top: 4px;">
                    <div
                      v-for="(linea, j) in p.lineas"
                      :key="j"
                      style="display: flex; align-items: baseline; gap: 6px; font-size: 12px; line-height: 1.7; color: #475569;"
                    >
                      <span :style="{ background: COLORES_TIPO[linea.tipo] }" style="width: 6px; height: 6px; border-radius: 9999px; flex-shrink: 0; transform: translateY(-1px);" />
                      <span style="max-width: 68%; overflow-wrap: anywhere;">{{ linea.nombre }}</span>
                      <span style="flex: 1; min-width: 12px; border-bottom: 1px dotted #b9cbbd; transform: translateY(-3px);" />
                      <span style="white-space: nowrap; color: #334155; font-weight: 600;">${{ formatMoney(linea.valor) }}</span>
                    </div>
                  </div>
                  <!-- Lo que quedó debiendo en esta cuota -->
                  <div
                    v-if="p.pendiente > 0"
                    style="margin-top: 8px; padding: 7px 10px; border-radius: 10px; background: #FFFBEB; border: 1px dashed #FCD34D;"
                  >
                    <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px; font-weight: 800; color: #b45309;">
                      <span>Queda pendiente</span>
                      <span style="white-space: nowrap;">${{ formatMoney(p.pendiente) }}</span>
                    </div>
                    <div
                      v-for="(pend, j) in (p.pendientes.length > 1 ? p.pendientes : [])"
                      :key="'pend-' + j"
                      style="display: flex; justify-content: space-between; gap: 12px; font-size: 11px; line-height: 1.6; color: #92400e;"
                    >
                      <span style="min-width: 0;">{{ pend.nombre }}</span>
                      <span style="white-space: nowrap;">${{ formatMoney(pend.valor) }}</span>
                    </div>
                    <p v-if="p.pendientes.length === 1" style="margin: 0; font-size: 11px; color: #92400e;">{{ p.pendientes[0].nombre }}</p>
                  </div>
                </div>
              </div>

              <!-- Corte del ticket: línea punteada con muescas a los lados -->
              <div style="position: relative; height: 22px; margin-top: 14px;">
                <span style="position: absolute; left: -11px; top: 0; width: 22px; height: 22px; border-radius: 9999px; background: #ffffff; border: 1px solid #e5e7eb; box-sizing: border-box;" />
                <span style="position: absolute; right: -11px; top: 0; width: 22px; height: 22px; border-radius: 9999px; background: #ffffff; border: 1px solid #e5e7eb; box-sizing: border-box;" />
                <span style="position: absolute; left: 18px; right: 18px; top: 10px; border-top: 2px dashed #d1d5db;" />
              </div>

              <div style="padding: 4px 20px 4px;">
                <!-- Por concepto y total -->
                <div>
                  <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8;">Total por concepto</p>
                  <div
                    v-for="c in totalesPorConcepto"
                    :key="c.clave"
                    style="display: flex; align-items: baseline; gap: 8px; font-size: 13px; line-height: 1.8; color: #334155;"
                  >
                    <span :style="{ background: COLORES_TIPO[c.clave] }" style="width: 8px; height: 8px; border-radius: 9999px; flex-shrink: 0;" />
                    <span>{{ c.nombre }}</span>
                    <span style="flex: 1; min-width: 12px; border-bottom: 1px dotted #cbd5e1; transform: translateY(-4px);" />
                    <span style="font-weight: 700; white-space: nowrap;">${{ formatMoney(c.valor) }}</span>
                  </div>
                  <div
                    v-if="pendienteGeneral > 0"
                    style="display: flex; align-items: baseline; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e5e7eb; font-size: 13px; line-height: 1.8; font-weight: 700; color: #b45309;"
                  >
                    <span>Queda pendiente</span>
                    <span style="flex: 1; min-width: 12px; border-bottom: 1px dotted #F59E0B; transform: translateY(-4px);" />
                    <span style="white-space: nowrap;">${{ formatMoney(pendienteGeneral) }}</span>
                  </div>
                  <div style="margin-top: 8px; padding: 12px 14px; border-radius: 14px; background: #1B5E37; color: #ffffff; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Total</span>
                    <span style="font-size: 20px; font-weight: 800; white-space: nowrap;">${{ formatMoney(totalGeneral) }}</span>
                  </div>
                </div>
              </div>

              <div style="margin: 14px 20px 0; padding: 12px 0 16px; border-top: 1px dashed #d1d5db; text-align: center; font-size: 11px; color: #94a3b8;">
                <span>Generado el {{ fechaEmision }}</span>
                <span style="display: block; margin-top: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em;">Natillerapp</span>
              </div>
            </div>
          </section>
          <p v-else class="rounded-xl bg-superficie-suave px-3 py-4 text-center text-sm text-texto-suave">
            Elige al menos una cuota para armar el comprobante.
          </p>
        </template>
      </div>

      <NatiscrollHint :show="hayNatiscroll" />
    </div>

    <!-- Acciones fijas. La barra de Safari tapa el pie de una hoja inferior: se suma `tapado` al padding. -->
    <div
      class="flex-shrink-0 space-y-2.5 border-t border-borde bg-superficie-tarjeta px-4 pt-4 sm:px-5"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <!--
        La imagen se prepara antes (al cambiar la selección) para que `navigator.share`
        salga directo del toque: en Safari, un `await` antes lo rechaza por falta de gesto.
      -->
      <div class="flex gap-3">
        <button
          type="button"
          class="btn-descargar flex-1"
          :disabled="!archivo || preparando"
          @click="descargar"
        >
          <ArrowDownTrayIcon class="h-5 w-5 flex-shrink-0" />
          Descargar
        </button>
        <button
          type="button"
          class="btn-compartir flex-1"
          :disabled="!archivo || preparando"
          @click="compartir"
        >
          <CargaBoton v-if="preparando" pequena />
          <IconoWhatsApp v-else class="h-5 w-5 flex-shrink-0" />
          {{ preparando ? 'Preparando imagen…' : 'WhatsApp' }}
        </button>
      </div>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue'
import { toPng } from 'html-to-image'
import {
  ArrowDownTrayIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClipboardDocumentListIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import CargaCaja from '../carga/CargaCaja.vue'
import CargaBoton from '../carga/CargaBoton.vue'
import { supabase } from '../../lib/supabase'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { detectIosPlatform } from '../../composables/useIsIos'
import { useNotificationStore } from '../../stores/notifications'
import { formatMoney } from '../../utils/formatMoney'
import { numeroWhatsApp } from '../../utils/telefono'
import IconoWhatsApp from '../iconos/IconoWhatsApp.vue'

/*
 * Un solo comprobante para varias cuotas pagadas: cada cuota con lo que se pagó en ella,
 * concepto por concepto, y al final el total por concepto y el total general.
 *
 * Los montos salen de lo abonado en cada cuota (ver `cargarPagos`); el historial de pagos
 * solo pone los nombres y las fechas de cada abono cuando existen.
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  socioNatilleraId: { type: String, default: '' },
  socioNombre: { type: String, default: '' },
  socioTelefono: { type: String, default: '' },
  natilleraNombre: { type: String, default: '' },
  /** Cuotas a dejar marcadas al abrir (p. ej. las recién pagadas). Vacío: las del último día. */
  cuotasIniciales: { type: Array, default: () => [] },
  /**
   * Filas de `historial_pagos_cuota` de un pago recién hecho. Con ellas el comprobante
   * muestra SOLO lo de esa transacción (no lo abonado antes a esas cuotas) y no ofrece
   * elegir cuotas: es el recibo de lo que se acaba de pagar.
   */
  historialIds: { type: Array, default: () => [] },
  /** Abierto desde otra modal (la del socio): «←» devuelve a ella; la X cierra todo. */
  mostrarVolver: { type: Boolean, default: false }
})

const esReciboDePago = computed(() => props.cuotasIniciales.length > 0)
const emit = defineEmits(['cerrar', 'volver'])

const notificationStore = useNotificationStore()
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const cargando = ref(false)
const errorCarga = ref('')
const pagos = ref([])
const abonosPrestamo = ref([])
const actividadesAparte = ref([])
// Estado actual de lo pagado, para decir cuánto quedó pendiente: actividades del socio
// por id y plan de sus préstamos por «préstamo-número».
const actividadesSocio = ref({})
const planSocio = ref({})
const seleccion = reactive(new Set())

useBodyScrollLock(computed(() => props.show))
const { tapado } = useTapadoInferior()

function cerrar() {
  emit('cerrar')
}

function aNumero(v) {
  return Number(v) || 0
}

function textoPeriodo(p) {
  const mes = MESES[(p.mes || 1) - 1] || ''
  if (p.quincena === 1 || p.quincena === 2) return `${mes} ${p.anio} · ${p.quincena === 1 ? '1ra' : '2da'} quincena`
  return `${mes} ${p.anio}`
}

function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function diaDe(iso) {
  return new Date(iso).toLocaleDateString('en-CA')
}

/*
 * La fuente es la CUOTA, no el historial: muchas cuotas están pagadas sin fila en
 * `historial_pagos_cuota` (pagos anteriores a ese registro, o por flujos que no lo
 * escriben), y el comprobante debe mostrarlas todas. El historial y el plan de préstamos
 * solo aportan detalle: nombres de actividades, cuotas de préstamo y fechas de cada abono.
 */
async function cargarPagos() {
  if (!props.socioNatilleraId) return
  cargando.value = true
  errorCarga.value = ''
  try {
    const { data: cuotas, error } = await supabase
      .from('cuotas')
      .select('id, mes, anio, quincena, valor_cuota, valor_pagado, valor_pagado_sancion, valor_pagado_actividades, valor_pagado_efectivo, valor_pagado_transferencia, impuesto_4x1000, fecha_pago, tipo_pago')
      .eq('socio_natillera_id', props.socioNatilleraId)
    if (error) throw error
    const ids = (cuotas || []).map(c => c.id)
    let historial = []
    let planPrestamo = []
    if (ids.length > 0) {
      const [resHist, resPlan] = await Promise.all([
        supabase
          .from('historial_pagos_cuota')
          .select('cuota_id, fecha_pago, forma_pago, valor_actividades, valor_cuotas_prestamo, detalle_actividades, detalle_cuotas_prestamo')
          .in('cuota_id', ids)
          .order('fecha_pago', { ascending: true }),
        supabase
          .from('plan_pagos_prestamo')
          .select('cuota_id, prestamo_id, numero_cuota, valor_pagado, valor_cuota, pagada, fecha_pago, forma_pago')
          .in('cuota_id', ids)
      ])
      if (resHist.error) throw resHist.error
      historial = resHist.data || []
      // El plan de préstamos es opcional para el comprobante: si falla, solo falta ese detalle.
      planPrestamo = resPlan.error ? [] : (resPlan.data || [])
    }
    // Recibo de un pago recién hecho: las filas exactas de esa transacción.
    let transaccion = []
    if (props.historialIds.length > 0) {
      const { data, error: errTx } = await supabase
        .from('historial_pagos_cuota')
        .select('cuota_id, fecha_pago, forma_pago, valor_cuota, valor_sancion, valor_actividades, valor_cuotas_prestamo, impuesto_4x1000, detalle_actividades, detalle_cuotas_prestamo')
        .in('id', props.historialIds)
      if (errTx) throw errTx
      transaccion = data || []
    }
    await cargarPagosAparte(cuotas || [], historial)
    pagos.value = (cuotas || []).map(c => {
      const deEsta = transaccion.filter(h => h.cuota_id === c.id)
      return {
        cuota: c,
        historial: historial.filter(h => h.cuota_id === c.id),
        plan: planPrestamo.filter(pp => pp.cuota_id === c.id && (aNumero(pp.valor_pagado) > 0 || pp.pagada)),
        transaccion: deEsta.length > 0 ? deEsta : null
      }
    })
    seleccionarUltimoDia()
  } catch (e) {
    errorCarga.value = e?.message || 'No se pudieron cargar los pagos'
    pagos.value = []
    abonosPrestamo.value = []
    actividadesAparte.value = []
    actividadesSocio.value = {}
    planSocio.value = {}
  } finally {
    cargando.value = false
  }
}

/*
 * Préstamos y actividades pagados por su propia pantalla, no con la cuota. Así el recibo
 * de «pagó varias cosas de una vez» queda completo aunque una parte no pasara por Cuotas.
 *
 * - Abonos de préstamo: los de `pagos_prestamo` que no vienen de una cuota
 *   (origen `cuota_natillera`) ni de una refinanciación. Los de origen null son anteriores
 *   a esa columna y todos son abonos directos.
 * - Actividades: `socios_actividad` también se llena cuando se paga desde la cuota, y
 *   no guarda el origen. Se descuenta lo que el historial de cuotas detalla por
 *   `socio_actividad_id`; y como los pagos viejos no traen ese detalle, se dejan fuera
 *   las actividades del periodo o del día de una cuota que pagó actividades sin detallarlas.
 *
 * Carga también el estado de actividades y plan de préstamos para el saldo pendiente; en
 * el recibo de un pago recién hecho solo se usa eso (no se ofrecen pagos aparte).
 */
async function cargarPagosAparte(cuotas, historial) {
  abonosPrestamo.value = []
  actividadesAparte.value = []
  actividadesSocio.value = {}
  planSocio.value = {}
  const [resPrestamos, resActividades] = await Promise.all([
    supabase.from('prestamos').select('id').eq('socio_natillera_id', props.socioNatilleraId),
    supabase
      .from('socios_actividad')
      .select('id, valor_asignado, valor_pagado, fecha_pago, forma_pago, valor_pagado_efectivo, valor_pagado_transferencia, mes_pago, anio_pago, quincena_pago, actividad:actividades(descripcion, tipo)')
      .eq('socio_natillera_id', props.socioNatilleraId)
  ])
  // Si alguna falla, el comprobante sigue con las cuotas: estos datos son un añadido.
  const idsPrestamo = resPrestamos.error ? [] : (resPrestamos.data || []).map(pr => pr.id)
  if (idsPrestamo.length > 0) {
    const [resAbonos, resPlan] = await Promise.all([
      supabase
        .from('pagos_prestamo')
        .select('id, prestamo_id, valor, mora_cobrada, fecha, numeros_cuota, valor_efectivo, valor_transferencia, origen, refinanciacion_id')
        .in('prestamo_id', idsPrestamo),
      supabase
        .from('plan_pagos_prestamo')
        .select('prestamo_id, numero_cuota, valor_cuota, valor_pagado, pagada, mes, anio, quincena, fecha_proyectada')
        .in('prestamo_id', idsPrestamo)
    ])
    if (!resPlan.error) {
      planSocio.value = Object.fromEntries((resPlan.data || []).map(pp => [`${pp.prestamo_id}-${pp.numero_cuota}`, pp]))
    }
    if (!resAbonos.error && !esReciboDePago.value) {
      abonosPrestamo.value = (resAbonos.data || []).filter(a => a.origen !== 'cuota_natillera' && !a.refinanciacion_id && a.fecha)
    }
  }
  if (resActividades.error) return
  actividadesSocio.value = Object.fromEntries((resActividades.data || []).map(sa => [sa.id, sa]))
  if (esReciboDePago.value) return

  const pagadoPorCuota = {}
  historial.forEach(h => (Array.isArray(h.detalle_actividades) ? h.detalle_actividades : []).forEach(a => {
    if (a.socio_actividad_id) pagadoPorCuota[a.socio_actividad_id] = (pagadoPorCuota[a.socio_actividad_id] || 0) + aNumero(a.valor)
  }))
  const conDetalle = new Set(historial.filter(h => Array.isArray(h.detalle_actividades) && h.detalle_actividades.length > 0).map(h => h.cuota_id))
  const cuotasSinDetalle = cuotas.filter(c => aNumero(c.valor_pagado_actividades) > 0 && !conDetalle.has(c.id))
  const diasSinDetalle = new Set(cuotasSinDetalle.filter(c => c.fecha_pago).map(c => diaDe(c.fecha_pago)))
  const periodosSinDetalle = new Set(cuotasSinDetalle.map(c => `${c.anio}-${c.mes}-${c.quincena || 0}`))

  actividadesAparte.value = (resActividades.data || [])
    .filter(sa => sa.fecha_pago && aNumero(sa.valor_pagado) > 0)
    .filter(sa => !diasSinDetalle.has(diaDe(sa.fecha_pago)) && !periodosSinDetalle.has(`${sa.anio_pago}-${sa.mes_pago}-${sa.quincena_pago || 0}`))
    .map(sa => ({ ...sa, valorAparte: Math.round(aNumero(sa.valor_pagado) - (pagadoPorCuota[sa.id] || 0)) }))
    .filter(sa => sa.valorAparte > 0)
}

// ---- Lo que quedó pendiente (estado actual de cada cosa pagada) ----
function saldo(total, pagado) {
  return Math.max(0, Math.round(aNumero(total) - aNumero(pagado)))
}

function pendienteCuotaPrestamo(prestamoId, numero) {
  const pp = planSocio.value[`${prestamoId}-${numero}`]
  if (!pp || pp.pagada) return null
  const valor = saldo(pp.valor_cuota, pp.valor_pagado)
  return valor > 0 ? { nombre: `Cuota préstamo #${numero}`, valor } : null
}

function pendienteActividad(id) {
  const sa = actividadesSocio.value[id]
  if (!sa) return null
  const valor = saldo(sa.valor_asignado, sa.valor_pagado)
  return valor > 0 ? { nombre: sa.actividad?.descripcion || 'Actividad', valor } : null
}

/** Pendientes de una cuota: la cuota misma, y las actividades y cuotas de préstamo que se abonaron con ella. */
function pendientesDeCuota(c, detallesAct, detallesPre, plan, extra = []) {
  const lista = []
  const cuota = saldo(c.valor_cuota, c.valor_pagado)
  if (cuota > 0) lista.push({ nombre: 'Cuota', valor: cuota })
  const vistas = new Set()
  detallesAct.forEach(a => {
    if (!a.socio_actividad_id || vistas.has(a.socio_actividad_id)) return
    vistas.add(a.socio_actividad_id)
    const p = pendienteActividad(a.socio_actividad_id)
    if (p) lista.push(p)
  })
  const prestamos = detallesPre.length > 0
    ? detallesPre.filter(pp => pp.prestamo_id).map(pp => [pp.prestamo_id, pp.numero_cuota])
    : plan.map(pp => [pp.prestamo_id, pp.numero_cuota])
  new Set(prestamos.map(([id, n]) => `${id}|${n}`)).forEach(k => {
    const [id, n] = k.split('|')
    const p = pendienteCuotaPrestamo(id, n)
    if (p) lista.push(p)
  })
  // Pendientes de lo pagado por fuera en esta cuota, sin repetir lo ya listado
  extra.forEach(p => {
    if (!lista.some(l => l.nombre === p.nombre && l.valor === p.valor)) lista.push(p)
  })
  return lista
}

function conPendientes(periodo, pendientes) {
  return { ...periodo, pendientes, pendiente: pendientes.reduce((s, p) => s + p.valor, 0) }
}

function nombreForma(forma) {
  return String(forma || '').toLowerCase() === 'transferencia' ? 'transferencia' : 'efectivo'
}

/** Cuota armada solo con las filas de una transacción: lo que se pagó en ese momento. */
function periodoDeTransaccion(c, filas, lineas, agregar, plan) {
  agregar('Cuota', 'cuota', filas.reduce((t, h) => t + aNumero(h.valor_cuota), 0))
  agregar('Sanción', 'sancion', filas.reduce((t, h) => t + aNumero(h.valor_sancion), 0))
  for (const h of filas) {
    const acts = Array.isArray(h.detalle_actividades) ? h.detalle_actividades : []
    if (acts.length > 0) acts.forEach(a => agregar(a.nombre || 'Actividad', 'actividades', a.valor))
    else agregar('Actividades', 'actividades', h.valor_actividades)
    const pres = Array.isArray(h.detalle_cuotas_prestamo) ? h.detalle_cuotas_prestamo : []
    if (pres.length > 0) pres.forEach(pp => {
      // La mora de préstamo cobrada con el pago va en su propia línea (no está en `valor`)
      if (aNumero(pp.mora) > 0) agregar(`Mora préstamo #${pp.numero_cuota}`, 'prestamos', pp.mora)
      agregar(pp.nombre || `Cuota préstamo #${pp.numero_cuota}`, 'prestamos', pp.valor)
    })
    else agregar('Cuotas de préstamo', 'prestamos', h.valor_cuotas_prestamo)
  }
  agregar('4×1000 (GMF)', 'gmf', filas.reduce((t, h) => t + aNumero(h.impuesto_4x1000), 0))
  const fechas = filas.map(h => h.fecha_pago)
  const dias = [...new Set(fechas.map(diaDe))].sort()
  const pendientes = pendientesDeCuota(
    c,
    filas.flatMap(h => (Array.isArray(h.detalle_actividades) ? h.detalle_actividades : [])),
    filas.flatMap(h => (Array.isArray(h.detalle_cuotas_prestamo) ? h.detalle_cuotas_prestamo : [])),
    plan
  )
  return conPendientes({
    clave: c.id,
    cuotaId: c.id,
    anio: c.anio,
    mes: c.mes,
    quincena: c.quincena,
    periodo: textoPeriodo(c),
    lineas,
    total: lineas.reduce((t, l) => t + l.valor, 0),
    fechas,
    formas: new Set(filas.map(h => nombreForma(h.forma_pago))),
    dias,
    ultimoDia: dias[dias.length - 1] || '',
    fechasTexto: [...new Set(fechas.map(fechaCorta))].join(', ')
  }, pendientes)
}

const periodosCuotas = computed(() => {
  return pagos.value
    .map(({ cuota: c, historial: historialCuota, plan, transaccion }) => {
      const lineas = []
      const agregar = (nombre, tipo, valor) => {
        const v = Math.round(aNumero(valor))
        if (v > 0) lineas.push({ nombre, tipo, valor: v })
      }
      if (transaccion) return periodoDeTransaccion(c, transaccion, lineas, agregar, plan)
      const historial = historialCuota
      const fuera = porFueraPorCuota.value[c.id]

      agregar('Cuota', 'cuota', c.valor_pagado)
      agregar('Sanción', 'sancion', c.valor_pagado_sancion)

      // Actividades: con nombre si el historial las detalla completas; si no, en una línea.
      const totalActividades = Math.round(aNumero(c.valor_pagado_actividades))
      const detalleAct = historial.flatMap(h => (Array.isArray(h.detalle_actividades) ? h.detalle_actividades : []))
      const sumaDetalleAct = Math.round(detalleAct.reduce((s, a) => s + aNumero(a.valor), 0))
      if (totalActividades > 0 && sumaDetalleAct === totalActividades) {
        detalleAct.forEach(a => agregar(a.nombre || 'Actividad', 'actividades', a.valor))
      } else {
        agregar('Actividades', 'actividades', totalActividades)
      }

      // Cuotas de préstamo pagadas con esta cuota: del historial, o del plan del préstamo.
      const detallePre = historial.flatMap(h => (Array.isArray(h.detalle_cuotas_prestamo) ? h.detalle_cuotas_prestamo : []))
      if (detallePre.length > 0) {
        detallePre.forEach(pp => {
          if (aNumero(pp.mora) > 0) agregar(`Mora préstamo #${pp.numero_cuota}`, 'prestamos', pp.mora)
          agregar(pp.nombre || `Cuota préstamo #${pp.numero_cuota}`, 'prestamos', pp.valor)
        })
      } else if (plan.length > 0) {
        plan.forEach(pp => agregar(`Cuota préstamo #${pp.numero_cuota}`, 'prestamos', aNumero(pp.valor_pagado) || aNumero(pp.valor_cuota)))
      } else {
        agregar('Cuotas de préstamo', 'prestamos', historial.reduce((s, h) => s + aNumero(h.valor_cuotas_prestamo), 0))
      }

      // Lo pagado desde Préstamos o Actividades que corresponde a esta cuota
      fuera?.lineas.forEach(l => agregar(l.nombre, l.tipo, l.valor))

      // El 4×1000 se cobra ENCIMA de lo pagado: la columna de la cuota lleva el acumulado.
      agregar('4×1000 (GMF)', 'gmf', c.impuesto_4x1000)

      const pagoEnCuota = aNumero(c.valor_pagado) > 0 || aNumero(c.valor_pagado_sancion) > 0 || aNumero(c.valor_pagado_actividades) > 0
      const fechas = historial.length > 0 ? historial.map(h => h.fecha_pago) : (pagoEnCuota && c.fecha_pago ? [c.fecha_pago] : [])
      const formas = new Set()
      historial.forEach(h => formas.add(nombreForma(h.forma_pago)))
      if (formas.size === 0 && pagoEnCuota) {
        if (aNumero(c.valor_pagado_efectivo) > 0) formas.add('efectivo')
        if (aNumero(c.valor_pagado_transferencia) > 0) formas.add('transferencia')
        if (formas.size === 0 && c.tipo_pago) formas.add(nombreForma(c.tipo_pago))
      }
      if (fuera) {
        fechas.push(...fuera.fechas)
        fuera.formas.forEach(f => formas.add(f))
        fechas.sort()
      }

      const dias = [...new Set(fechas.map(diaDe))].sort()
      return conPendientes({
        clave: c.id,
            cuotaId: c.id,
        anio: c.anio,
        mes: c.mes,
        quincena: c.quincena,
        periodo: textoPeriodo(c),
        lineas,
        total: lineas.reduce((s, l) => s + l.valor, 0),
        fechas,
        formas,
        dias,
        ultimoDia: dias[dias.length - 1] || '',
        fechasTexto: fechas.length ? [...new Set(fechas.map(fechaCorta))].join(', ') : 'sin fecha'
      }, pendientesDeCuota(c, detalleAct, detallePre, plan, fuera?.pendientes))
    })
    .filter(p => p.total > 0)
    .sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes) || ((a.quincena || 0) - (b.quincena || 0)))
})

function formasDe(fila, efectivo, transferencia) {
  const formas = []
  if (aNumero(efectivo) > 0) formas.push('efectivo')
  if (aNumero(transferencia) > 0) formas.push('transferencia')
  if (formas.length === 0 && fila.forma_pago) formas.push(nombreForma(fila.forma_pago))
  return formas
}

/*
 * Lo pagado por fuera de Cuotas va en la cuota en que debía pagarse:
 * - la actividad, en la cuota de su periodo (mes/año/quincena de pago de la actividad);
 * - la cuota de préstamo, en la del periodo de esa cuota en el plan. Un abono que cubre
 *   varias cuotas del plan se reparte entre ellas (cada una hasta su valor, la última se
 *   lleva el resto) y la mora va con la primera.
 * Si no hay cuota para ese periodo (p. ej. fuera del calendario), se usa la de la fecha
 * del pago; y si tampoco, la más cercana anterior.
 */
const cuotasOrdenadas = computed(() =>
  pagos.value.map(x => x.cuota).sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes) || ((a.quincena || 0) - (b.quincena || 0)))
)

function cuotaDePeriodo(anio, mes, quincena) {
  const lista = cuotasOrdenadas.value
  if (!anio || !mes) return null
  const delMes = lista.filter(c => c.anio === Number(anio) && c.mes === Number(mes))
  if (delMes.length === 0) return null
  return delMes.find(c => (c.quincena || 0) === (Number(quincena) || 0)) ||
    delMes.find(c => c.quincena === Number(quincena)) ||
    // Actividad mensual en natillera quincenal (o al revés): la primera cuota del mes
    delMes[0]
}

function cuotaDeFecha(iso) {
  const d = new Date(iso)
  const exacta = cuotaDePeriodo(d.getFullYear(), d.getMonth() + 1, d.getDate() <= 15 ? 1 : 2)
  if (exacta) return exacta
  const clave = d.getFullYear() * 100 + d.getMonth() + 1
  const anteriores = cuotasOrdenadas.value.filter(c => c.anio * 100 + c.mes <= clave)
  return anteriores[anteriores.length - 1] || cuotasOrdenadas.value[0] || null
}

function periodoDeCuotaPrestamo(prestamoId, numero) {
  const pp = planSocio.value[`${prestamoId}-${numero}`]
  if (!pp) return null
  if (pp.anio && pp.mes) return cuotaDePeriodo(pp.anio, pp.mes, pp.quincena)
  return pp.fecha_proyectada ? cuotaDeFecha(`${pp.fecha_proyectada}T12:00:00`) : null
}

const porFueraPorCuota = computed(() => {
  const mapa = {}
  const de = cuota => {
    if (!mapa[cuota.id]) mapa[cuota.id] = { lineas: [], fechas: [], formas: new Set(), pendientes: [] }
    return mapa[cuota.id]
  }
  const anotar = (cuota, linea, fecha, formas, pendiente) => {
    if (!cuota) return
    const entrada = de(cuota)
    if (linea && linea.valor > 0) entrada.lineas.push(linea)
    if (!entrada.fechas.includes(fecha)) entrada.fechas.push(fecha)
    formas.forEach(f => entrada.formas.add(f))
    if (pendiente) entrada.pendientes.push(pendiente)
  }

  abonosPrestamo.value.forEach(a => {
    const numeros = Array.isArray(a.numeros_cuota) ? a.numeros_cuota : []
    const formas = formasDe({}, a.valor_efectivo, a.valor_transferencia)
    let resto = Math.round(aNumero(a.valor))
    const mora = Math.round(aNumero(a.mora_cobrada))
    if (numeros.length === 0) {
      const cuota = cuotaDeFecha(a.fecha)
      anotar(cuota, { nombre: 'Abono al préstamo', tipo: 'prestamos', valor: resto }, a.fecha, formas)
      anotar(cuota, { nombre: 'Mora préstamo', tipo: 'prestamos', valor: mora }, a.fecha, formas)
      return
    }
    numeros.forEach((n, i) => {
      const pp = planSocio.value[`${a.prestamo_id}-${n}`]
      const parte = i === numeros.length - 1 ? resto : Math.min(resto, Math.round(aNumero(pp?.valor_cuota)) || resto)
      resto -= parte
      const cuota = periodoDeCuotaPrestamo(a.prestamo_id, n) || cuotaDeFecha(a.fecha)
      if (i === 0) anotar(cuota, { nombre: `Mora préstamo #${n}`, tipo: 'prestamos', valor: mora }, a.fecha, formas)
      anotar(cuota, { nombre: `Cuota préstamo #${n}`, tipo: 'prestamos', valor: parte }, a.fecha, formas, pendienteCuotaPrestamo(a.prestamo_id, n))
    })
  })

  actividadesAparte.value.forEach(sa => {
    const cuota = cuotaDePeriodo(sa.anio_pago, sa.mes_pago, sa.quincena_pago) || cuotaDeFecha(sa.fecha_pago)
    anotar(
      cuota,
      { nombre: sa.actividad?.descripcion || 'Actividad', tipo: 'actividades', valor: sa.valorAparte },
      sa.fecha_pago,
      formasDe(sa, sa.valor_pagado_efectivo, sa.valor_pagado_transferencia),
      pendienteActividad(sa.id)
    )
  })
  return mapa
})

const periodos = computed(() => periodosCuotas.value)

// Por defecto: las cuotas pagadas el último día que el socio pagó (el caso típico de
// «pagó varias de una vez»).
function seleccionarUltimoDia() {
  seleccion.clear()
  const lista = periodos.value
  if (lista.length === 0) return
  if (props.cuotasIniciales.length > 0) {
    const pedidas = new Set(props.cuotasIniciales)
    lista.filter(p => pedidas.has(p.cuotaId)).forEach(p => seleccion.add(p.clave))
    if (seleccion.size > 0) return
  }
  const ultimo = lista.reduce((max, p) => (p.ultimoDia > max ? p.ultimoDia : max), '')
  lista.filter(p => p.dias.includes(ultimo)).forEach(p => seleccion.add(p.clave))
}

const todasSeleccionadas = computed(() => periodos.value.length > 0 && periodos.value.every(p => seleccion.has(p.clave)))

function alternar(clave) {
  if (seleccion.has(clave)) seleccion.delete(clave)
  else seleccion.add(clave)
}

function alternarTodas() {
  if (todasSeleccionadas.value) seleccion.clear()
  else periodos.value.forEach(p => seleccion.add(p.clave))
}

const periodosElegidos = computed(() => periodos.value.filter(p => seleccion.has(p.clave)))

const conteoElegidos = computed(() => {
  const n = periodosElegidos.value.length
  return `${n} ${n === 1 ? 'cuota' : 'cuotas'}`
})

// Color por concepto: punto de cada renglón, etiqueta de la tarjeta y resumen.
const COLORES_TIPO = { cuota: '#1B5E37', sancion: '#be123c', actividades: '#1d4ed8', prestamos: '#7c3aed', gmf: '#64748b' }
const ETIQUETAS_TIPO = { cuota: 'Cuota', sancion: 'Sanción', actividades: 'Actividades', prestamos: 'Préstamo', gmf: '4×1000' }

// Etiquetas de lo que trae cada cuota (sin el 4×1000, que no es algo que se pague aparte)
function tiposDe(p) {
  const tipos = new Set(p.lineas.map(l => l.tipo))
  return Object.keys(ETIQUETAS_TIPO).filter(t => t !== 'gmf' && tipos.has(t))
}

const NOMBRES_TIPO = { cuota: 'Cuotas', sancion: 'Sanciones', actividades: 'Actividades', prestamos: 'Cuotas de préstamo', gmf: '4×1000 (GMF)' }

const totalesPorConcepto = computed(() => {
  const totales = {}
  for (const p of periodosElegidos.value) {
    for (const l of p.lineas) totales[l.tipo] = (totales[l.tipo] || 0) + l.valor
  }
  return Object.keys(NOMBRES_TIPO)
    .filter(t => totales[t] > 0)
    .map(t => ({ clave: t, nombre: NOMBRES_TIPO[t], valor: totales[t] }))
})

const totalGeneral = computed(() => periodosElegidos.value.reduce((s, p) => s + p.total, 0))
const pendienteGeneral = computed(() => periodosElegidos.value.reduce((s, p) => s + p.pendiente, 0))

const fechasElegidasTexto = computed(() => {
  const dias = [...new Set(periodosElegidos.value.flatMap(p => p.fechas.map(fechaCorta)))]
  return dias.length <= 2 ? dias.join(' y ') : `${dias[0]} a ${dias[dias.length - 1]}`
})

const formasElegidasTexto = computed(() => {
  const formas = new Set(periodosElegidos.value.flatMap(p => [...p.formas]))
  const nombres = [...formas].sort().map(f => (f === 'transferencia' ? 'Transferencia' : 'Efectivo'))
  return nombres.length ? nombres.join(' y ') : '—'
})

const iniciales = computed(() =>
  (props.socioNombre || 'Socio').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
)

const fechaEmision = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

// ---- Imagen lista antes del toque ----
const comprobanteRef = ref(null)
const archivo = ref(null)
const preparando = ref(false)
let temporizadorImagen = null
let versionImagen = 0

function nombreArchivo() {
  return `comprobante-${(props.socioNombre || 'socio').trim().replace(/\s+/g, '-')}-${periodosElegidos.value.length}-cuotas.png`
}

function programarImagen() {
  archivo.value = null
  clearTimeout(temporizadorImagen)
  if (!props.show || periodosElegidos.value.length === 0) {
    preparando.value = false
    return
  }
  preparando.value = true
  temporizadorImagen = setTimeout(prepararImagen, 350)
}

async function prepararImagen() {
  const version = ++versionImagen
  await nextTick()
  if (!comprobanteRef.value) {
    preparando.value = false
    return
  }
  try {
    const dataUrl = await toPng(comprobanteRef.value, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true })
    const blob = await (await fetch(dataUrl)).blob()
    // Si la selección cambió mientras se generaba, esta imagen ya no sirve.
    if (version !== versionImagen) return
    archivo.value = new File([blob], nombreArchivo(), { type: 'image/png' })
  } catch (e) {
    if (version === versionImagen) notificationStore.error(e?.message || 'No se pudo generar la imagen', 'Comprobante')
  } finally {
    if (version === versionImagen) preparando.value = false
  }
}

watch(() => [...seleccion].join(','), programarImagen)

function textoMensaje() {
  return `${props.socioNombre || 'Socio'} - Comprobante de ${conteoElegidos.value}: $${formatMoney(totalGeneral.value)}`
}

function descargar() {
  if (!archivo.value) return
  // iOS: <a download> sobre una imagen abre una vista previa (o nada en la PWA instalada);
  // la hoja de compartir ofrece «Guardar imagen». El archivo ya está listo: sin await.
  if (detectIosPlatform() && navigator.canShare && navigator.canShare({ files: [archivo.value] })) {
    navigator.share({ files: [archivo.value] }).catch(e => {
      if (e?.name !== 'AbortError') notificationStore.error('No se pudo guardar la imagen', 'Comprobante')
    })
    return
  }
  const url = URL.createObjectURL(archivo.value)
  const link = document.createElement('a')
  link.download = archivo.value.name
  link.href = url
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function compartir() {
  if (!archivo.value) return
  const datos = { files: [archivo.value], title: 'Comprobante de pago', text: textoMensaje() }
  if (navigator.canShare && navigator.canShare({ files: [archivo.value] })) {
    navigator.share(datos).catch(e => {
      if (e?.name !== 'AbortError') notificationStore.error('No se pudo compartir la imagen', 'Comprobante')
    })
    return
  }
  // Sin compartir archivos (escritorio): se descarga y se abre WhatsApp con el texto.
  descargar()
  const telefono = (props.socioTelefono || '').replace(/\D/g, '')
  const destino = telefono ? `https://wa.me/${numeroWhatsApp(telefono)}` : 'https://wa.me/'
  window.open(`${destino}?text=${encodeURIComponent(textoMensaje())}`, '_blank')
  notificationStore.success('La imagen se descargó: adjúntala en el chat de WhatsApp.', 'Comprobante', 4000)
}

// ---- Natiscroll ----
const areaScroll = ref(null)
const hayNatiscroll = ref(false)
let rafNatiscroll = null

function programarNatiscroll() {
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
  rafNatiscroll = requestAnimationFrame(() => {
    rafNatiscroll = null
    const el = areaScroll.value
    hayNatiscroll.value = !!el && props.show &&
      el.scrollHeight > el.clientHeight + 1 &&
      el.scrollTop + el.clientHeight < el.scrollHeight - 1
  })
}

watch([() => periodos.value.length, () => periodosElegidos.value.length, cargando], () => {
  nextTick(programarNatiscroll)
}, { flush: 'post' })

watch(() => props.show, abierto => {
  if (abierto) {
    cargarPagos()
    return
  }
  clearTimeout(temporizadorImagen)
  versionImagen++
  archivo.value = null
  preparando.value = false
  hayNatiscroll.value = false
}, { immediate: true })

onUnmounted(() => {
  clearTimeout(temporizadorImagen)
  if (rafNatiscroll != null) cancelAnimationFrame(rafNatiscroll)
})
</script>

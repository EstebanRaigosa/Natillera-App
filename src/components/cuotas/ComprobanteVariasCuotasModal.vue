<template>
  <ModalWrapper
    :show="show"
    :z-index="55"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-md max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="28rem"
    @close="cerrar"
  >
    <!-- Cabecera marca compacta: móvil en fila, escritorio en columna; X siempre por flex -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="sm:hidden flex min-h-[4.2rem] items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <DocumentDuplicateIcon class="h-5 w-5 text-[#1B5E37]" />
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
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <DocumentDuplicateIcon class="h-6 w-6 text-[#1B5E37]" />
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
        class="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-4 pt-4 pb-6 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-5"
        @scroll.passive="programarNatiscroll"
      >
        <CargaCaja v-if="cargando" texto="Cargando pagos" detalle="Buscando las cuotas que ha pagado." />

        <p v-else-if="errorCarga" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {{ errorCarga }}
        </p>

        <p v-else-if="periodos.length === 0" class="rounded-xl bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
          Este socio todavía no tiene pagos registrados.
        </p>

        <template v-else>
          <!-- 1. Qué cuotas entran. Por defecto, las del último día en que pagó. En el recibo
               de un pago recién hecho no se elige: se muestra lo que se pagó. -->
          <section v-if="!esReciboDePago">
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="text-xs font-bold uppercase tracking-wide text-gray-500">Cuotas a incluir</p>
              <button
                type="button"
                class="min-h-[44px] touch-manipulation px-2 text-xs font-semibold text-[#1B5E37]"
                @click="alternarTodas"
              >
                {{ todasSeleccionadas ? 'Quitar todas' : 'Elegir todas' }}
              </button>
            </div>
            <ul class="space-y-1.5">
              <li v-for="p in periodos" :key="p.cuotaId">
                <button
                  type="button"
                  role="checkbox"
                  :aria-checked="seleccion.has(p.cuotaId)"
                  class="flex min-h-[48px] w-full touch-manipulation items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors"
                  :class="seleccion.has(p.cuotaId) ? 'border-[#1B5E37] bg-[#E8F5E9]' : 'border-gray-200 bg-white hover:bg-gray-50'"
                  @click="alternar(p.cuotaId)"
                >
                  <span
                    class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2"
                    :class="seleccion.has(p.cuotaId) ? 'border-[#1B5E37] bg-[#1B5E37] text-white' : 'border-gray-300 bg-white'"
                  >
                    <CheckIcon v-if="seleccion.has(p.cuotaId)" class="h-3.5 w-3.5" stroke-width="3" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-sm font-semibold text-gray-900">{{ p.periodo }}</span>
                    <span class="block text-xs text-gray-500">Pagado {{ p.fechasTexto }}</span>
                  </span>
                  <span class="flex-shrink-0 text-sm font-bold tabular-nums text-gray-900">${{ formatMoney(p.total) }}</span>
                </button>
              </li>
            </ul>
          </section>

          <!-- 2. El comprobante tal cual se va a enviar: esto es lo que se convierte en imagen -->
          <section v-if="periodosElegidos.length > 0">
            <p v-if="!esReciboDePago" class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Así se enviará</p>
            <!--
              Misma línea que el comprobante de cierre: banda verde marca, el total arriba
              en salvia, Mulish, sin degradados ni emojis. Estilos en línea a propósito:
              html-to-image no resuelve bien los colores modernos de Tailwind 4, y así la
              imagen sale igual en todos los navegadores.
            -->
            <div
              ref="comprobanteRef"
              style="box-sizing: border-box; width: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; font-family: Mulish, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #0f172a;"
            >
              <div style="background: #1B5E37; color: #ffffff; padding: 18px 20px 16px;">
                <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.75);">
                  Comprobante de pago · {{ periodosElegidos.length }} {{ periodosElegidos.length === 1 ? 'cuota' : 'cuotas' }}
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

                <!-- Cada cuota con lo que se pagó en ella -->
                <div
                  v-for="p in periodosElegidos"
                  :key="p.cuotaId"
                  style="margin-top: 14px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;"
                >
                  <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px;">
                    <span style="font-size: 14px; font-weight: 800; color: #0f172a;">{{ p.periodo }}</span>
                    <span style="font-size: 14px; font-weight: 800; color: #0f172a; white-space: nowrap;">${{ formatMoney(p.total) }}</span>
                  </div>
                  <div style="margin-top: 6px; padding-left: 12px; border-left: 2px solid #E8F5E9;">
                    <div
                      v-for="(linea, i) in p.lineas"
                      :key="i"
                      style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px; line-height: 1.7; color: #64748b;"
                    >
                      <span style="min-width: 0;">{{ linea.nombre }}</span>
                      <span style="white-space: nowrap; color: #334155;">${{ formatMoney(linea.valor) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Por concepto y total -->
                <div style="margin-top: 14px;">
                  <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8;">Total por concepto</p>
                  <div
                    v-for="c in totalesPorConcepto"
                    :key="c.clave"
                    style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.8; color: #334155;"
                  >
                    <span>{{ c.nombre }}</span>
                    <span style="font-weight: 700; white-space: nowrap;">${{ formatMoney(c.valor) }}</span>
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
          <p v-else class="rounded-xl bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
            Elige al menos una cuota para armar el comprobante.
          </p>
        </template>
      </div>

      <NatiscrollHint :show="hayNatiscroll" />
    </div>

    <!-- Acciones fijas. La barra de Safari tapa el pie de una hoja inferior: se suma `tapado` al padding. -->
    <div
      class="flex-shrink-0 space-y-2.5 border-t border-gray-200 bg-white px-4 pt-4 sm:px-5"
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
  DocumentDuplicateIcon,
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
  historialIds: { type: Array, default: () => [] }
})

const esReciboDePago = computed(() => props.cuotasIniciales.length > 0)
const emit = defineEmits(['cerrar'])

const notificationStore = useNotificationStore()
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const cargando = ref(false)
const errorCarga = ref('')
const pagos = ref([])
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
      .select('id, mes, anio, quincena, valor_pagado, valor_pagado_sancion, valor_pagado_actividades, valor_pagado_efectivo, valor_pagado_transferencia, impuesto_4x1000, fecha_pago, tipo_pago')
      .eq('socio_natillera_id', props.socioNatilleraId)
      .or('valor_pagado.gt.0,valor_pagado_sancion.gt.0,valor_pagado_actividades.gt.0')
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
          .select('cuota_id, numero_cuota, valor_pagado, valor_cuota, pagada, fecha_pago, forma_pago')
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
  } finally {
    cargando.value = false
  }
}

function nombreForma(forma) {
  return String(forma || '').toLowerCase() === 'transferencia' ? 'transferencia' : 'efectivo'
}

/** Cuota armada solo con las filas de una transacción: lo que se pagó en ese momento. */
function periodoDeTransaccion(c, filas, lineas, agregar) {
  agregar('Cuota', 'cuota', filas.reduce((t, h) => t + aNumero(h.valor_cuota), 0))
  agregar('Sanción', 'sancion', filas.reduce((t, h) => t + aNumero(h.valor_sancion), 0))
  for (const h of filas) {
    const acts = Array.isArray(h.detalle_actividades) ? h.detalle_actividades : []
    if (acts.length > 0) acts.forEach(a => agregar(a.nombre || 'Actividad', 'actividades', a.valor))
    else agregar('Actividades', 'actividades', h.valor_actividades)
    const pres = Array.isArray(h.detalle_cuotas_prestamo) ? h.detalle_cuotas_prestamo : []
    if (pres.length > 0) pres.forEach(pp => agregar(pp.nombre || `Cuota préstamo #${pp.numero_cuota}`, 'prestamos', pp.valor))
    else agregar('Cuotas de préstamo', 'prestamos', h.valor_cuotas_prestamo)
  }
  agregar('4×1000 (GMF)', 'gmf', filas.reduce((t, h) => t + aNumero(h.impuesto_4x1000), 0))
  const fechas = filas.map(h => h.fecha_pago)
  const dias = [...new Set(fechas.map(diaDe))].sort()
  return {
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
  }
}

const periodos = computed(() => {
  return pagos.value
    .map(({ cuota: c, historial: historialCuota, plan, transaccion }) => {
      const lineas = []
      const agregar = (nombre, tipo, valor) => {
        const v = Math.round(aNumero(valor))
        if (v > 0) lineas.push({ nombre, tipo, valor: v })
      }
      if (transaccion) return periodoDeTransaccion(c, transaccion, lineas, agregar)
      const historial = historialCuota

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
        detallePre.forEach(pp => agregar(pp.nombre || `Cuota préstamo #${pp.numero_cuota}`, 'prestamos', pp.valor))
      } else if (plan.length > 0) {
        plan.forEach(pp => agregar(`Cuota préstamo #${pp.numero_cuota}`, 'prestamos', aNumero(pp.valor_pagado) || aNumero(pp.valor_cuota)))
      } else {
        agregar('Cuotas de préstamo', 'prestamos', historial.reduce((s, h) => s + aNumero(h.valor_cuotas_prestamo), 0))
      }

      // El 4×1000 se cobra ENCIMA de lo pagado: la columna de la cuota lleva el acumulado.
      agregar('4×1000 (GMF)', 'gmf', c.impuesto_4x1000)

      const fechas = historial.length > 0 ? historial.map(h => h.fecha_pago) : (c.fecha_pago ? [c.fecha_pago] : [])
      const formas = new Set()
      historial.forEach(h => formas.add(nombreForma(h.forma_pago)))
      if (formas.size === 0) {
        if (aNumero(c.valor_pagado_efectivo) > 0) formas.add('efectivo')
        if (aNumero(c.valor_pagado_transferencia) > 0) formas.add('transferencia')
        if (formas.size === 0 && c.tipo_pago) formas.add(nombreForma(c.tipo_pago))
      }

      const dias = [...new Set(fechas.map(diaDe))].sort()
      return {
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
      }
    })
    .filter(p => p.total > 0)
    .sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes) || ((a.quincena || 0) - (b.quincena || 0)))
})

// Por defecto: las cuotas pagadas el último día que el socio pagó (el caso típico de
// «pagó varias de una vez»).
function seleccionarUltimoDia() {
  seleccion.clear()
  const lista = periodos.value
  if (lista.length === 0) return
  if (props.cuotasIniciales.length > 0) {
    const pedidas = new Set(props.cuotasIniciales)
    lista.filter(p => pedidas.has(p.cuotaId)).forEach(p => seleccion.add(p.cuotaId))
    if (seleccion.size > 0) return
  }
  const ultimo = lista.reduce((max, p) => (p.ultimoDia > max ? p.ultimoDia : max), '')
  lista.filter(p => p.dias.includes(ultimo)).forEach(p => seleccion.add(p.cuotaId))
}

const todasSeleccionadas = computed(() => periodos.value.length > 0 && periodos.value.every(p => seleccion.has(p.cuotaId)))

function alternar(cuotaId) {
  if (seleccion.has(cuotaId)) seleccion.delete(cuotaId)
  else seleccion.add(cuotaId)
}

function alternarTodas() {
  if (todasSeleccionadas.value) seleccion.clear()
  else periodos.value.forEach(p => seleccion.add(p.cuotaId))
}

const periodosElegidos = computed(() => periodos.value.filter(p => seleccion.has(p.cuotaId)))

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
  return `${props.socioNombre || 'Socio'} - Comprobante de ${periodosElegidos.value.length} ${periodosElegidos.value.length === 1 ? 'cuota' : 'cuotas'}: $${formatMoney(totalGeneral.value)}`
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

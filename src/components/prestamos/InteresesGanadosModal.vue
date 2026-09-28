<template>
  <!--
    De dónde sale «Intereses ganados»: préstamo por préstamo y la mora cobrada, con las mismas
    reglas que el indicador (useUtilidadesReales › desgloseInteresesPrestamos), así la suma de
    aquí es siempre la cifra de la tarjeta. Se puede exportar a Excel.
  -->
  <ModalWrapper
    :show="show"
    :z-index="50"
    align="bottom"
    :persistent="true"
    :ios-soft-backdrop="true"
    overlay-class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    backdrop-class="absolute inset-0 bg-[#C8D9C8]/70 backdrop-blur-[2px]"
    card-class="relative w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col min-h-0 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 bg-white"
    card-max-width="42rem"
    @close="cerrar"
  >
    <!-- Cabecera marca compacta: móvil en fila, escritorio en columna; X por flex -->
    <div class="flex-shrink-0 bg-[#1B5E37] text-white">
      <div class="sm:hidden flex min-h-[4.2rem] items-center gap-3 pl-4 pr-2 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <CurrencyDollarIcon class="h-5 w-5 text-[#1B5E37]" />
        </div>
        <div class="min-w-0 flex-1 text-left">
          <h3 class="font-display text-base font-bold leading-tight">Intereses ganados</h3>
          <p class="mt-0.5 truncate text-[0.6875rem] leading-snug text-white/85">De dónde sale cada peso</p>
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
      <div class="hidden sm:flex items-start px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <div class="w-11 flex-shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-1 flex-col items-center text-center">
          <div class="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <CurrencyDollarIcon class="h-6 w-6 text-[#1B5E37]" />
          </div>
          <h3 class="font-display text-lg font-bold leading-tight">Intereses ganados</h3>
          <p class="mt-1 text-xs leading-snug text-white/85">Préstamo por préstamo y la mora cobrada</p>
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
        ref="scrollRef"
        class="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-[#f6f8f6] px-4 pt-4 pb-6 overscroll-contain [-webkit-overflow-scrolling:touch] sm:px-6"
        @scroll.passive="onScroll"
      >
        <CargaCaja v-if="cargando" texto="Calculando intereses" detalle="Revisando cada préstamo y la mora cobrada." />

        <p v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{{ error }}</p>

        <template v-else>
          <!-- Total y de qué se compone -->
          <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
            <div class="px-4 py-3 text-center">
              <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">Total intereses ganados</p>
              <p class="mt-0.5 font-display text-3xl font-extrabold tabular-nums text-[#1B5E37]">${{ formatMoney(datos.total) }}</p>
            </div>
            <dl class="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 sm:grid-cols-3">
              <div class="px-3 py-2.5 text-center">
                <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-500">Anticipado</dt>
                <dd class="font-display text-sm font-extrabold tabular-nums text-gray-900">${{ formatMoney(totalAnticipado) }}</dd>
              </div>
              <div class="px-3 py-2.5 text-center">
                <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-500">Con cada cuota</dt>
                <dd class="font-display text-sm font-extrabold tabular-nums text-gray-900">${{ formatMoney(totalCorriente) }}</dd>
              </div>
              <div class="col-span-2 border-t border-gray-100 px-3 py-2.5 text-center sm:col-span-1 sm:border-t-0">
                <dt class="text-[10px] font-bold uppercase tracking-wide text-gray-500">Mora cobrada</dt>
                <dd class="font-display text-sm font-extrabold tabular-nums text-[color:var(--brand-danger)]">${{ formatMoney(datos.mora.total) }}</dd>
              </div>
            </dl>
          </section>

          <!-- Cómo se cuenta: una línea, no un tratado -->
          <p class="flex items-start gap-2 rounded-xl border border-[#1B5E37]/10 bg-[#E8F5E9] px-3 py-2.5 text-xs leading-snug text-[#1B5E37]">
            <InformationCircleIcon class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>Anticipado cuenta el interés completo desde que se presta; con cada cuota, solo el de las cuotas pagadas. La mora cuenta solo cuando se cobra, en cualquier préstamo.</span>
          </p>

          <!-- Préstamo por préstamo -->
          <section>
            <p class="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-gray-500">
              {{ datos.prestamos.length }} {{ datos.prestamos.length === 1 ? 'préstamo' : 'préstamos' }}
            </p>
            <p v-if="datos.prestamos.length === 0" class="rounded-xl bg-white px-4 py-5 text-center text-sm text-gray-500">No hay préstamos activos ni pagados.</p>
            <ul v-else class="space-y-2">
              <li v-for="p in prestamosOrdenados" :key="p.id" class="rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-extrabold text-gray-900">{{ p.socio }}</p>
                    <p class="text-xs tabular-nums text-gray-500">
                      ${{ formatMoney(p.monto) }} · {{ p.tasa }}% · {{ formatFecha(p.fecha) }}
                    </p>
                  </div>
                  <p class="flex-shrink-0 font-display text-base font-extrabold tabular-nums text-[#1B5E37]">${{ formatMoney(p.interesGanado) }}</p>
                </div>
                <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    class="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold"
                    :class="p.anticipado ? 'bg-amber-100 text-amber-800' : 'bg-[#E8F5E9] text-[#1B5E37]'"
                  >{{ p.anticipado ? 'Anticipado' : 'Con cada cuota' }}</span>
                  <span
                    class="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold"
                    :class="p.estado === 'pagado' ? 'bg-gray-100 text-gray-600' : 'bg-sky-50 text-sky-800'"
                  >{{ p.estado === 'pagado' ? 'Pagado' : 'Activo' }}</span>
                  <span class="text-[11px] tabular-nums text-gray-500">{{ p.cuotasPagadas }} de {{ p.cuotas }} cuotas</span>
                </div>
                <!-- Contado pero aún no recibido: solo en anticipados que siguen activos -->
                <p class="mt-1 text-xs tabular-nums text-gray-600">
                  Recibido en cuotas ${{ formatMoney(p.interesRecibido) }}
                  <span v-if="p.porRecibir > 0" class="font-semibold text-amber-800"> · por recibir ${{ formatMoney(p.porRecibir) }}</span>
                </p>
              </li>
            </ul>
          </section>

          <!-- La mora no queda asociada a un préstamo: va en su propia fila -->
          <section v-if="datos.mora.total > 0" class="rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-extrabold text-gray-900">Interés de mora cobrado</p>
                <p class="text-xs text-gray-500">Solo la ya pagada en abonos; la que se debe entra cuando se cobre</p>
              </div>
              <p class="flex-shrink-0 font-display text-base font-extrabold tabular-nums text-[color:var(--brand-danger)]">${{ formatMoney(datos.mora.total) }}</p>
            </div>
            <p class="mt-1 text-xs tabular-nums text-gray-600">
              Efectivo ${{ formatMoney(datos.mora.efectivo) }} · Transferencia ${{ formatMoney(datos.mora.transferencia) }}
            </p>
          </section>
        </template>
      </div>

      <NatiscrollHint :show="hayMas" />
    </div>

    <!-- Acciones fijas. La barra de Safari tapa el pie de una hoja inferior: se suma `tapado`. -->
    <div
      class="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 pt-3 sm:flex-row sm:px-6"
      :style="{ paddingBottom: `calc(max(1.25rem, env(safe-area-inset-bottom, 0px)) + ${tapado}px)` }"
    >
      <button type="button" class="btn-modal-secondary w-full sm:flex-1" @click="cerrar">Cerrar</button>
      <button
        type="button"
        class="btn-modal-primary w-full sm:flex-1 inline-flex items-center justify-center gap-2"
        :disabled="cargando || !!error || exportando || !xlsxListo"
        @click="exportarExcel"
      >
        <CargaBoton v-if="exportando" pequena />
        <ArrowDownTrayIcon v-else class="h-5 w-5" />
        Exportar a Excel
      </button>
    </div>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowDownTrayIcon, CurrencyDollarIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import ModalWrapper from '../ModalWrapper.vue'
import NatiscrollHint from '../NatiscrollHint.vue'
import CargaCaja from '../carga/CargaCaja.vue'
import CargaBoton from '../carga/CargaBoton.vue'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { useNatiscroll } from '../../composables/useNatiscroll'
import { useTapadoInferior } from '../../composables/useTapadoInferior'
import { detectIosPlatform } from '../../composables/useIsIos'
import { desgloseInteresesPrestamos } from '../../composables/useUtilidadesReales'
import { useNotificationStore } from '../../stores/notifications'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  show: { type: Boolean, default: false },
  natilleraId: { type: String, required: true },
  natilleraNombre: { type: String, default: '' }
})
const emit = defineEmits(['cerrar'])

const notificationStore = useNotificationStore()
const visible = computed(() => props.show)
useBodyScrollLock(visible)
const { scrollRef, hayMas, onScroll } = useNatiscroll(visible)
const { tapado } = useTapadoInferior()

const cargando = ref(false)
const exportando = ref(false)
const error = ref('')
const datos = ref({ prestamos: [], mora: { efectivo: 0, transferencia: 0, total: 0 }, total: 0 })

const prestamosOrdenados = computed(() => [...datos.value.prestamos].sort((a, b) => b.interesGanado - a.interesGanado))
const totalAnticipado = computed(() => datos.value.prestamos.filter(p => p.anticipado).reduce((s, p) => s + p.interesGanado, 0))
const totalCorriente = computed(() => datos.value.prestamos.filter(p => !p.anticipado).reduce((s, p) => s + p.interesGanado, 0))

function cerrar() {
  emit('cerrar')
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function cargar() {
  cargando.value = true
  error.value = ''
  const r = await desgloseInteresesPrestamos(props.natilleraId)
  if (r.error) error.value = r.error
  datos.value = r
  cargando.value = false
}

/*
 * xlsx-js-style (~600 KB) se carga al abrir el modal, no al tocar «Exportar»: en iOS el libro
 * se entrega con la hoja de compartir («Guardar en Archivos»), y Safari la rechaza si entre el
 * toque y `navigator.share` hay un `await` (el `import()` lo era). Con el módulo ya cargado,
 * la exportación es síncrona.
 */
let XLSX = null
let cargaXlsx = null
const xlsxListo = ref(false)
function precargarXlsx() {
  cargaXlsx ??= import('xlsx-js-style')
    .then(mod => {
      XLSX = mod.default || mod
      xlsxListo.value = true
    })
    .catch(e => {
      cargaXlsx = null
      console.error('No se pudo cargar xlsx-js-style:', e)
    })
  return cargaXlsx
}

watch(() => props.show, abierto => {
  if (!abierto) return
  cargar()
  precargarXlsx()
}, { immediate: true })

/*
 * En iOS `XLSX.writeFile` descarga con un enlace sobre un blob: en la PWA instalada no hace
 * nada y en Safari abre una vista previa sin forma clara de guardar. Allí va por compartir.
 */
function entregarLibro(wb, nombreArchivo) {
  if (!detectIosPlatform()) {
    XLSX.writeFile(wb, nombreArchivo)
    return
  }
  const archivo = new File([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], nombreArchivo, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  if (!navigator.canShare?.({ files: [archivo] })) {
    XLSX.writeFile(wb, nombreArchivo)
    return
  }
  navigator.share({ files: [archivo] }).catch(e => {
    if (e?.name !== 'AbortError') notificationStore.error(e?.message || 'No se pudo exportar', 'Exportar a Excel')
  })
}

// Síncrono a propósito (ver precargarXlsx): el botón no se habilita hasta tener el módulo.
function exportarExcel() {
  if (exportando.value || !XLSX) return
  exportando.value = true
  try {
    const filas = prestamosOrdenados.value.map(p => ({
      Socio: p.socio,
      'Fecha del préstamo': formatFecha(p.fecha),
      Monto: p.monto,
      'Tasa mensual (%)': p.tasa,
      'Tipo de interés': p.tipoInteres,
      'Cobro del interés': p.anticipado ? 'Anticipado' : 'Con cada cuota',
      Estado: p.estado === 'pagado' ? 'Pagado' : 'Activo',
      Cuotas: p.cuotas,
      'Cuotas pagadas': p.cuotasPagadas,
      'Interés total del préstamo': Math.round(p.interesTotal),
      'Interés recibido en cuotas': Math.round(p.interesRecibido),
      'Interés contado como ganado': Math.round(p.interesGanado),
      'Por recibir': Math.round(p.porRecibir)
    }))
    const m = datos.value.mora
    filas.push({})
    filas.push({ Socio: 'Interés de mora cobrado en abonos (efectivo)', 'Interés contado como ganado': Math.round(m.efectivo) })
    filas.push({ Socio: 'Interés de mora cobrado en abonos (transferencia)', 'Interés contado como ganado': Math.round(m.transferencia) })
    filas.push({})
    filas.push({ Socio: 'TOTAL INTERESES GANADOS', 'Interés contado como ganado': Math.round(datos.value.total) })

    const ws = XLSX.utils.json_to_sheet(filas)
    ws['!cols'] = [30, 16, 14, 14, 14, 16, 10, 8, 14, 22, 22, 24, 14].map(wch => ({ wch }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Intereses ganados')
    const nombre = (props.natilleraNombre || 'natillera').trim().replace(/\s+/g, '-')
    entregarLibro(wb, `intereses-ganados-${nombre}-${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (e) {
    notificationStore.error(e?.message || 'No se pudo exportar', 'Exportar a Excel')
  } finally {
    exportando.value = false
  }
}
</script>

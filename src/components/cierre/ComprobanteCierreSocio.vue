<template>
  <!--
    Comprobante de cierre de un socio. Es a la vez la vista previa y lo que se convierte
    en imagen (html-to-image): para la imagen va a 400px fijos y con estilos en línea,
    así sale igual se genere en el móvil o en el escritorio. Colores y tipografía del sistema
    de diseño (verde #1B5E37, Mulish), sin gradientes ni emojis.
  -->
  <div
    :style="{ width: fluido ? '100%' : '400px' }"
    style="box-sizing: border-box; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; font-family: Mulish, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #0f172a;"
  >
    <div style="background: #1B5E37; color: #ffffff; padding: 20px 22px 18px;">
      <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.75);">Comprobante de cierre</p>
      <div style="margin-top: 10px; display: flex; align-items: center; gap: 12px;">
        <span style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 9999px; background: rgba(255,255,255,0.16); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800;">{{ iniciales }}</span>
        <span style="min-width: 0; font-size: 18px; font-weight: 800; line-height: 1.2;">{{ nombre }}</span>
      </div>
    </div>

    <div style="padding: 18px 22px 8px;">
      <!-- Lo que se venía a mirar -->
      <div
        :style="{
          borderRadius: '16px',
          padding: '14px 16px',
          textAlign: 'center',
          background: debe ? '#fff7ed' : '#E8F5E9',
          border: debe ? '1px solid #fed7aa' : '1px solid #E8F5E9'
        }"
      >
        <p :style="{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: debe ? '#9a3412' : '#1B5E37' }">
          {{ debe ? 'Queda debiendo' : 'Recibe' }}
        </p>
        <p :style="{ margin: '4px 0 0', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: debe ? '#c2410c' : '#1B5E37' }">
          ${{ formatMoney(Math.abs(totalFinal)) }}
        </p>
      </div>

      <!-- La cuenta, de arriba abajo -->
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
          <span>
            <span style="display: block; font-size: 14px; color: #334155;">Ahorro</span>
            <span style="display: block; font-size: 12px; color: #64748b;">
              {{ dato.cantidadCuotasPagadas ?? 0 }} {{ (dato.cantidadCuotasPagadas || 0) === 1 ? 'cuota' : 'cuotas' }} de ${{ formatMoney(dato.montoAhorradoMensual) }}
            </span>
          </span>
          <span style="font-size: 14px; font-weight: 700; white-space: nowrap;">${{ formatMoney(dato.ahorro) }}</span>
        </div>

        <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <span style="font-size: 14px; color: #334155;">+ Utilidades</span>
            <span style="font-size: 14px; font-weight: 700; white-space: nowrap;">${{ formatMoney(dato.utilidades) }}</span>
          </div>
          <div v-if="conceptos.length > 0" style="margin-top: 6px; padding-left: 12px; border-left: 2px solid #E8F5E9;">
            <div
              v-for="concepto in conceptos"
              :key="concepto.tipo"
              style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: #64748b; line-height: 1.6;"
            >
              <span>{{ concepto.label }}</span>
              <span style="white-space: nowrap;">${{ formatMoney(concepto.monto) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="(dato.aporteAdministracion || 0) > 0"
          style="display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9;"
        >
          <span style="font-size: 14px; color: #334155;">− Administración</span>
          <span style="font-size: 14px; font-weight: 700; color: #b91c1c; white-space: nowrap;">−${{ formatMoney(dato.aporteAdministracion) }}</span>
        </div>

        <div v-if="(dato.descuentos || 0) > 0" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <span style="font-size: 14px; color: #334155;">− Descuentos</span>
            <span style="font-size: 14px; font-weight: 700; color: #b91c1c; white-space: nowrap;">−${{ formatMoney(dato.descuentos) }}</span>
          </div>
          <div v-if="dato.descuentosDesglose" style="margin-top: 6px; padding-left: 12px; border-left: 2px solid #fee2e2;">
            <div
              v-if="dato.descuentosDesglose.prestamosPendientes > 0"
              style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: #64748b; line-height: 1.6;"
            >
              <span>Préstamos pendientes</span>
              <span style="white-space: nowrap;">${{ formatMoney(dato.descuentosDesglose.prestamosPendientes) }}</span>
            </div>
            <div
              v-if="dato.descuentosDesglose.cuotasSinPagar > 0"
              style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: #64748b; line-height: 1.6;"
            >
              <span>Cuotas o sanciones pendientes</span>
              <span style="white-space: nowrap;">${{ formatMoney(dato.descuentosDesglose.cuotasSinPagar) }}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0 4px;">
          <span :style="{ fontSize: '14px', fontWeight: 800, color: debe ? '#9a3412' : '#1B5E37' }">{{ debe ? 'Queda debiendo' : 'Total a recibir' }}</span>
          <span :style="{ fontSize: '17px', fontWeight: 800, whiteSpace: 'nowrap', color: debe ? '#c2410c' : '#1B5E37' }">${{ formatMoney(Math.abs(totalFinal)) }}</span>
        </div>
      </div>
    </div>

    <div style="margin: 12px 22px 0; padding: 12px 0 16px; border-top: 1px dashed #d1d5db; text-align: center; font-size: 11px; color: #94a3b8;">
      <span>Generado el {{ fecha }}</span>
      <span style="display: block; margin-top: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8;">Natillerapp</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  /** Fila del cierre tal como la arma `NatilleraCierre`. */
  dato: { type: Object, required: true },
  periodicidad: { type: String, default: 'mensual' },
  tiposUtilidad: { type: Array, default: () => [] },
  etiquetasUtilidad: { type: Object, default: () => ({}) },
  /** true en la vista previa (se ajusta al ancho del modal); false para generar la imagen. */
  fluido: { type: Boolean, default: false }
})

const nombre = computed(() => props.dato?.socio?.nombre || 'Socio')
const iniciales = computed(() =>
  nombre.value.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
)
const totalFinal = computed(() => parseFloat(props.dato?.totalFinal) || 0)
const debe = computed(() => totalFinal.value < 0)

const conceptos = computed(() => {
  const porConcepto = props.dato?.utilidadesPorConcepto || {}
  return props.tiposUtilidad
    .filter(tipo => (porConcepto[tipo] || 0) > 0)
    .map(tipo => ({ tipo, label: props.etiquetasUtilidad[tipo] || tipo, monto: porConcepto[tipo] }))
})

const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <!--
    Comprobante de estado del socio, en forma de ticket. Es la vista previa y también lo
    que se convierte en imagen (html-to-image): estilos en línea y, para la imagen, 380px
    fijos, así sale igual se genere desde el móvil o el escritorio. Cada deuda va en su
    sección con subtotal, y el total cierra el ticket.
  -->
  <div
    :style="{ width: fluido ? '100%' : '380px', maxWidth: fluido ? '380px' : 'none' }"
    style="box-sizing: border-box; margin: 0 auto; font-family: Mulish, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #0f172a;"
  >
    <div style="position: relative; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px -12px rgba(15, 83, 45, 0.35);">
      <!-- Cabecera -->
      <div style="background: #1B5E37; color: #ffffff; padding: 18px 20px 16px;">
        <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.75);">Estado de cuenta</p>
        <p style="margin: 6px 0 0; font-size: 19px; font-weight: 800; line-height: 1.2;">{{ nombre }}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">Corte al {{ fecha }}</p>
      </div>

      <!-- Secciones -->
      <div style="padding: 6px 20px 4px;">
        <template v-if="secciones.length > 0">
          <div
            v-for="(seccion, i) in secciones"
            :key="seccion.clave"
            :style="{ padding: '14px 0 12px', borderTop: i === 0 ? 'none' : '1px dashed #d1d5db' }"
          >
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <span style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <span :style="{ width: '8px', height: '8px', borderRadius: '9999px', background: seccion.color, flexShrink: 0 }" />
                <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #334155;">{{ seccion.titulo }}</span>
                <span
                  v-if="seccion.items.length > 0"
                  style="font-size: 11px; font-weight: 700; color: #94a3b8;"
                >· {{ seccion.items.length }}</span>
              </span>
              <span :style="{ fontSize: '15px', fontWeight: 800, whiteSpace: 'nowrap', color: seccion.color }">${{ formatMoney(seccion.total) }}</span>
            </div>
            <!-- Renglones con puntos guía, como en un ticket -->
            <div v-if="seccion.items.length > 0" style="margin-top: 6px; padding-left: 16px;">
              <div
                v-for="(item, j) in seccion.items"
                :key="seccion.clave + '-' + j"
                style="display: flex; align-items: baseline; gap: 6px; font-size: 12px; line-height: 1.7; color: #64748b;"
              >
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">{{ item.periodo }}</span>
                <span style="flex: 1; min-width: 12px; border-bottom: 1px dotted #cbd5e1; transform: translateY(-3px);" />
                <span style="white-space: nowrap; color: #334155; font-weight: 600;">${{ formatMoney(item.valor) }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else style="padding: 22px 0 16px; text-align: center;">
          <span style="display: inline-flex; width: 44px; height: 44px; border-radius: 9999px; background: #E8F5E9; align-items: center; justify-content: center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B5E37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
          <p style="margin: 8px 0 0; font-size: 18px; font-weight: 800; color: #1B5E37;">Al día</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">No tiene nada pendiente</p>
        </div>
      </div>

      <!-- Corte del ticket: línea punteada con muescas a los lados -->
      <div v-if="total > 0" style="position: relative; height: 22px;">
        <span style="position: absolute; left: -11px; top: 0; width: 22px; height: 22px; border-radius: 9999px; background: #eef2ee;" />
        <span style="position: absolute; right: -11px; top: 0; width: 22px; height: 22px; border-radius: 9999px; background: #eef2ee;" />
        <span style="position: absolute; left: 18px; right: 18px; top: 10px; border-top: 2px dashed #d1d5db;" />
      </div>

      <!-- Totales -->
      <div v-if="total > 0" style="padding: 4px 20px 18px;">
        <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.9; color: #475569;">
          <span>Subtotal</span>
          <span style="font-weight: 700; color: #0f172a; white-space: nowrap;">${{ formatMoney(total) }}</span>
        </div>
        <div
          v-if="incluir4x1000"
          style="display: flex; justify-content: space-between; gap: 12px; font-size: 13px; line-height: 1.9; color: #475569;"
        >
          <span>4×1000 <span style="color: #94a3b8;">· si paga por transferencia</span></span>
          <span style="font-weight: 700; color: #0f172a; white-space: nowrap;">${{ formatMoney(valor4x1000) }}</span>
        </div>
        <div style="margin-top: 10px; border-radius: 14px; background: #1B5E37; color: #ffffff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.3; color: rgba(255,255,255,0.85);">Total para<br>estar al día</span>
          <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.02em; white-space: nowrap;">${{ formatMoney(totalFinal) }}</span>
        </div>
      </div>
    </div>

    <p style="margin: 10px 0 0; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8;">Natillerapp</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  /** Resultado de `calcularEstadoSocio` (composables/useEstadoSocio). */
  estado: { type: Object, required: true },
  /** Suma el 4×1000 al total (lo paga quien consigna por transferencia). */
  incluir4x1000: { type: Boolean, default: true },
  /** true en la vista previa (se ajusta al modal); false para generar la imagen. */
  fluido: { type: Boolean, default: false }
})

const nombre = computed(() => props.estado?.socio?.nombre || 'Socio')
const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

// Orden: lo más urgente primero. Solo salen las secciones con saldo.
const secciones = computed(() => {
  const e = props.estado || {}
  return [
    { clave: 'mora', titulo: 'Cuotas en mora', color: '#b91c1c', total: e.totalMora, items: e.cuotasMoraList },
    { clave: 'sanciones', titulo: 'Sanciones', color: '#be123c', total: e.totalSancionesPendientes, items: e.sancionesDesglose },
    { clave: 'pendiente', titulo: 'Cuotas pendientes', color: '#b45309', total: e.totalPendiente, items: e.cuotasPendientesList },
    { clave: 'prestamos', titulo: 'Préstamos', color: '#1B5E37', total: e.totalPrestamosPendiente, items: e.prestamosPendientesDesglose },
    { clave: 'actividades', titulo: 'Actividades', color: '#1d4ed8', total: e.actividadesPendientesTotal, items: e.actividadesPendientesDesglose }
  ]
    .map(s => ({ ...s, total: Number(s.total) || 0, items: s.items || [] }))
    .filter(s => s.total > 0)
})

const total = computed(() => Number(props.estado?.totalAPagar) || 0)
const valor4x1000 = computed(() => Number(props.estado?.valor4x1000) || 0)
const totalFinal = computed(() => total.value + (props.incluir4x1000 ? valor4x1000.value : 0))
</script>

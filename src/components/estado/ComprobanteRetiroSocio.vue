<template>
  <!--
    Liquidación por retiro de un socio, en el mismo formato de ticket que el estado de
    cuenta (ComprobanteEstadoSocio): cabecera verde de marca, renglones con puntos guía y
    el total en un bloque sólido. Estilos en línea porque también se convierte en imagen
    (html-to-image); 380 px fijos para la imagen, fluido para la vista previa.
  -->
  <div
    :style="{ width: fluido ? '100%' : '380px', maxWidth: fluido ? '380px' : 'none' }"
    style="box-sizing: border-box; margin: 0 auto; font-family: Mulish, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #0f172a;"
  >
    <div style="position: relative; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px -12px rgba(15, 83, 45, 0.35);">
      <!-- Cabecera -->
      <div style="background: #1B5E37; color: #ffffff; padding: 18px 20px 16px;">
        <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.75);">Liquidación por retiro</p>
        <p style="margin: 6px 0 0; font-size: 19px; font-weight: 800; line-height: 1.2;">{{ datos.socioNombre || 'Socio' }}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">{{ datos.fecha }}</p>
      </div>

      <!-- Renglones: del ahorro a lo que se entrega -->
      <div style="padding: 14px 20px 6px;">
        <div
          v-for="renglon in renglones"
          :key="renglon.clave"
          style="display: flex; align-items: baseline; gap: 6px; font-size: 13px; line-height: 2; color: #475569;"
        >
          <span style="white-space: nowrap;">
            {{ renglon.etiqueta }}
            <span v-if="renglon.nota" style="color: #94a3b8; font-size: 11px;">· {{ renglon.nota }}</span>
          </span>
          <span style="flex: 1; min-width: 12px; border-bottom: 1px dotted #cbd5e1; transform: translateY(-4px);" />
          <span :style="{ whiteSpace: 'nowrap', fontWeight: 700, color: renglon.color }">
            {{ renglon.signo }}${{ formatMoney(renglon.valor) }}
          </span>
        </div>
      </div>

      <!-- Corte del ticket: línea punteada con muescas a los lados -->
      <div style="position: relative; height: 22px;">
        <span style="position: absolute; left: -11px; top: 0; width: 22px; height: 22px; border-radius: 9999px; background: #eef2ee;" />
        <span style="position: absolute; right: -11px; top: 0; width: 22px; height: 22px; border-radius: 9999px; background: #eef2ee;" />
        <span style="position: absolute; left: 18px; right: 18px; top: 10px; border-top: 2px dashed #d1d5db;" />
      </div>

      <div style="padding: 4px 20px 18px;">
        <div style="border-radius: 14px; background: #1B5E37; color: #ffffff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.3; color: rgba(255,255,255,0.85);">Se le<br>entrega</span>
          <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.02em; white-space: nowrap;">${{ formatMoney(entregaFinal) }}</span>
        </div>

        <!-- Si el ahorro no alcanzó para saldar el préstamo, que quede escrito -->
        <div
          v-if="saldoPendiente > 0"
          style="margin-top: 10px; border-radius: 12px; background: #fff7ed; border: 1px solid #fed7aa; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;"
        >
          <span style="font-size: 12px; font-weight: 700; color: #9a3412; line-height: 1.3;">Queda debiendo<br><span style="font-weight: 600; color: #c2410c;">al préstamo</span></span>
          <span style="font-size: 17px; font-weight: 800; color: #c2410c; white-space: nowrap;">${{ formatMoney(saldoPendiente) }}</span>
        </div>

        <p
          v-if="datos.codigoComprobante"
          style="margin: 12px 0 0; text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: #94a3b8; font-family: 'Courier New', monospace;"
        >{{ datos.codigoComprobante }}</p>
      </div>
    </div>

    <p style="margin: 10px 0 0; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8;">Natillerapp</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  /**
   * Datos del retiro: socioNombre, fecha, totalAhorrado, valorFondo (sanción),
   * porcentajeSancion, valorEntregar (después de la sanción), valorPrestamo (lo que se
   * cruzó con su préstamo), saldoPendientePrestamo y codigoComprobante.
   */
  datos: { type: Object, required: true },
  /** true en la vista previa (se ajusta al modal); false para generar la imagen. */
  fluido: { type: Boolean, default: false }
})

const numero = v => Number(v) || 0

const entregaFinal = computed(() => Math.max(0, numero(props.datos.valorEntregar) - numero(props.datos.valorPrestamo)))
const saldoPendiente = computed(() => numero(props.datos.saldoPendientePrestamo))

const porcentajeTexto = computed(() => {
  const pct = numero(props.datos.porcentajeSancion)
  if (pct <= 0) return ''
  const redondeado = Math.round(pct * 10) / 10
  return `${Number.isInteger(redondeado) ? redondeado : redondeado.toFixed(1)} %`
})

const renglones = computed(() => {
  const d = props.datos
  const filas = [
    { clave: 'ahorro', etiqueta: 'Total ahorrado', valor: numero(d.totalAhorrado), signo: '', color: '#0f172a' }
  ]
  if (numero(d.valorFondo) > 0) {
    filas.push({ clave: 'sancion', etiqueta: 'Sanción por retiro', nota: porcentajeTexto.value, valor: numero(d.valorFondo), signo: '− ', color: '#b91c1c' })
  }
  if (numero(d.valorPrestamo) > 0) {
    filas.push({ clave: 'prestamo', etiqueta: 'Pago a su préstamo', valor: numero(d.valorPrestamo), signo: '− ', color: '#c2410c' })
  }
  return filas
})
</script>

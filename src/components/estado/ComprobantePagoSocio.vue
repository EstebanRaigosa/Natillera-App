<template>
  <!--
    Comprobante de un pago para el portal del socio. Sigue la estructura por secciones del
    comprobante que genera Cuotas (monto, datos, conceptos, abonos, saldo), pero con la línea
    visual del sistema: cabecera verde de marca, tarjetas blancas sobre salvia y el total en
    bloque sólido. Estilos en línea porque se convierte en imagen (html-to-image); sin emojis
    ni degradados en texto, que no siempre salen bien en la imagen.
  -->
  <div
    :style="{ width: fluido ? '100%' : '380px', maxWidth: fluido ? '380px' : 'none' }"
    style="box-sizing: border-box; margin: 0 auto; font-family: Mulish, system-ui, -apple-system, 'Segoe UI', sans-serif; color: #0f172a;"
  >
    <div style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px -12px rgba(15, 83, 45, 0.35);">
      <!-- Cabecera: marca + sello de pago -->
      <div style="position: relative; overflow: hidden; background: #1B5E37; color: #ffffff; padding: 18px 20px 46px;">
        <span style="position: absolute; right: -40px; top: -60px; width: 150px; height: 150px; border-radius: 9999px; background: rgba(255,255,255,0.07);" />
        <div style="position: relative; display: flex; align-items: center; gap: 12px;">
          <span style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 9999px; background: #ffffff; display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.2 4.2L19 7" stroke="#1B5E37" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div style="min-width: 0;">
            <p style="margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.75);">Comprobante de pago</p>
            <p style="margin: 3px 0 0; font-size: 17px; font-weight: 800; line-height: 1.2;">{{ pago.natilleraNombre || 'Natillera' }}</p>
          </div>
        </div>
      </div>

      <div style="background: #eef2ee; padding: 0 14px 14px;">
        <!-- Sección 1: monto, estado y datos del pago (sube sobre la cabecera) -->
        <div style="position: relative; margin-top: -32px; background: #ffffff; border-radius: 16px; padding: 16px 16px 14px; box-shadow: 0 6px 18px -10px rgba(15, 23, 42, 0.25);">
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #64748b;">Monto pagado</p>
            <p style="margin: 4px 0 0; font-size: 30px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; color: #1B5E37;">${{ formatMoney(pago.total) }}</p>
            <span
              :style="pago.esParcial
                ? 'background: #fef3c7; color: #92400e; border-color: #fcd34d;'
                : 'background: #dcfce7; color: #166534; border-color: #86efac;'"
              style="display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 4px 12px; border: 1px solid; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;"
            >
              <span :style="{ background: pago.esParcial ? '#f59e0b' : '#16a34a' }" style="width: 6px; height: 6px; border-radius: 9999px;" />
              {{ pago.esParcial ? 'Abono parcial' : 'Cuota al día' }}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; margin-top: 14px; padding-top: 12px; border-top: 1px dashed #d1d5db;">
            <div v-for="dato in datosPago" :key="dato.etiqueta" style="min-width: 0;">
              <p style="margin: 0; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8;">{{ dato.etiqueta }}</p>
              <p style="margin: 2px 0 0; font-size: 12.5px; font-weight: 700; line-height: 1.3; color: #0f172a; overflow-wrap: anywhere;">{{ dato.valor }}</p>
            </div>
          </div>
        </div>

        <!-- Sección 2: conceptos pagados, cada uno con su color -->
        <div v-if="conceptos.length > 0" style="margin-top: 10px; background: #ffffff; border-radius: 16px; padding: 12px 14px;">
          <p style="margin: 0 0 8px; font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #1B5E37;">Conceptos pagados</p>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div
              v-for="c in conceptos"
              :key="c.clave"
              :style="{ background: c.fondo, borderColor: c.borde }"
              style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid; border-radius: 10px;"
            >
              <span :style="{ background: c.color }" style="flex-shrink: 0; width: 8px; height: 8px; border-radius: 9999px;" />
              <span :style="{ color: c.texto }" style="flex: 1; min-width: 0; font-size: 12px; font-weight: 700; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ c.etiqueta }}</span>
              <span :style="{ color: c.texto }" style="flex-shrink: 0; font-size: 13px; font-weight: 800;">${{ formatMoney(c.valor) }}</span>
            </div>
          </div>
        </div>

        <!-- Sección 3: abonos de la cuota, si pagó en varias veces -->
        <div v-if="abonos.length > 1" style="margin-top: 10px; background: #ffffff; border-radius: 16px; overflow: hidden;">
          <div style="padding: 10px 14px; background: #e8f3ea;">
            <p style="margin: 0; font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #1B5E37;">Abonos de esta cuota</p>
            <p style="margin: 2px 0 0; font-size: 11px; color: #3f6b50;">{{ abonos.length }} pagos registrados</p>
          </div>
          <div style="padding: 2px 14px 10px;">
            <div
              v-for="(a, i) in abonos"
              :key="i"
              :style="i > 0 ? 'border-top: 1px dashed #d1d5db;' : ''"
              style="display: flex; align-items: center; gap: 10px; padding: 8px 0;"
            >
              <span
                :style="a.actual ? 'background: #1B5E37; color: #ffffff;' : 'background: #e8f3ea; color: #1B5E37;'"
                style="flex-shrink: 0; width: 22px; height: 22px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;"
              >{{ i + 1 }}</span>
              <span style="flex: 1; font-size: 12px; font-weight: 600; color: #334155;">{{ a.fecha }}<span v-if="a.actual" style="color: #1B5E37; font-weight: 800;"> · este</span></span>
              <span style="font-size: 12.5px; font-weight: 800; color: #0f172a;">${{ formatMoney(a.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Sección 4: lo que falta de la cuota, si el abono no la completó -->
        <div
          v-if="pago.esParcial && num(pago.pendienteCuota) > 0"
          style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 16px; background: #fff7ed; border: 1px solid #fed7aa;"
        >
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #9a3412; line-height: 1.3;">Falta por<br>pagar de la cuota</span>
          <span style="font-size: 20px; font-weight: 800; color: #c2410c; white-space: nowrap;">${{ formatMoney(pago.pendienteCuota) }}</span>
        </div>

        <p
          v-if="pago.codigo"
          style="margin: 12px 0 0; text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #64748b; font-family: 'Courier New', monospace;"
        >{{ pago.codigo }}</p>
      </div>
    </div>

    <p style="margin: 10px 0 0; text-align: center; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #1B5E37;">Natillerapp</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../utils/formatMoney'

const props = defineProps({
  /**
   * socioNombre, natilleraNombre, fecha, periodo, formaPago, codigo, total, esParcial,
   * pendienteCuota, abonos [{ fecha, total, actual }], y los conceptos: cuota, sancion,
   * actividades (+ detalleActividades [{ nombre, valor }]), prestamo (+ detalleCuotasPrestamo
   * [{ nombre, valor }]) e impuesto4x1000.
   */
  pago: { type: Object, required: true },
  fluido: { type: Boolean, default: false }
})

const num = v => Number(v) || 0

// Paleta por concepto: tonos suaves que conviven con el verde de marca.
const COLORES = {
  cuota: { fondo: '#f0f7f2', borde: '#cfe3d5', color: '#1B5E37', texto: '#14492b' },
  sancion: { fondo: '#fef2f2', borde: '#fecaca', color: '#dc2626', texto: '#991b1b' },
  actividad: { fondo: '#faf5ff', borde: '#e9d5ff', color: '#9333ea', texto: '#6b21a8' },
  prestamo: { fondo: '#eff6ff', borde: '#bfdbfe', color: '#2563eb', texto: '#1e40af' },
  impuesto: { fondo: '#f8fafc', borde: '#e2e8f0', color: '#64748b', texto: '#334155' }
}

const datosPago = computed(() => [
  { etiqueta: 'Socio', valor: props.pago.socioNombre || 'Socio' },
  { etiqueta: 'Periodo', valor: props.pago.periodo || '—' },
  { etiqueta: 'Fecha', valor: props.pago.fecha || '—' },
  { etiqueta: 'Forma de pago', valor: props.pago.formaPago || '—' }
])

// Con detalle, una fila por actividad o cuota de préstamo; sin él, una fila con el total.
function filasDetalle(clave, etiqueta, total, detalle) {
  const lista = (Array.isArray(detalle) ? detalle : []).filter(d => num(d?.valor) > 0)
  if (lista.length === 0) return num(total) > 0 ? [{ clave, etiqueta, valor: num(total) }] : []
  return lista.map((d, i) => ({ clave: `${clave}-${i}`, etiqueta: d.nombre || etiqueta, valor: num(d.valor) }))
}

const conceptos = computed(() => {
  const p = props.pago
  const filas = []
  if (num(p.cuota) > 0) filas.push({ clave: 'cuota', etiqueta: 'Cuota', valor: num(p.cuota), ...COLORES.cuota })
  if (num(p.sancion) > 0) filas.push({ clave: 'sancion', etiqueta: 'Sanción', valor: num(p.sancion), ...COLORES.sancion })
  filasDetalle('actividad', 'Actividades', p.actividades, p.detalleActividades).forEach(f => filas.push({ ...f, ...COLORES.actividad }))
  filasDetalle('prestamo', 'Cuotas de préstamo', p.prestamo, p.detalleCuotasPrestamo).forEach(f => filas.push({ ...f, ...COLORES.prestamo }))
  if (num(p.impuesto4x1000) > 0) filas.push({ clave: '4x1000', etiqueta: '4×1000 (transferencia)', valor: num(p.impuesto4x1000), ...COLORES.impuesto })
  return filas
})

const abonos = computed(() => Array.isArray(props.pago.abonos) ? props.pago.abonos : [])
</script>

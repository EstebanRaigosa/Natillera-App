<template>
  <!--
    Sello del tipo de comprobante: icono propio en círculo blanco + nombre en grande. Va en la
    cabecera verde de cada ticket (la misma para todos): el nombre y el icono son los que dicen
    de un vistazo qué es. Antes solo un rótulo de 10 px los distinguía.
    Estilos en línea: el ticket se convierte en imagen con html-to-image.
  -->
  <div style="display: flex; align-items: center; gap: 10px;">
    <span
      style="flex-shrink: 0; width: 42px; height: 42px; border-radius: 9999px; background: #ffffff; color: #1B5E37; display: flex; align-items: center; justify-content: center;"
    >
      <component :is="tipo.icono" style="width: 24px; height: 24px;" aria-hidden="true" />
    </span>
    <div style="min-width: 0;">
      <!-- En minúsculas, como frase: en mayúsculas sostenidas se leía pesado. La jerarquía la dan
           el tamaño y el peso, con «Comprobante» chico encima para que el tipo sea lo que manda. -->
      <p style="margin: 0; font-size: 11px; font-weight: 600; line-height: 1.2; color: rgba(255,255,255,0.75);">Comprobante</p>
      <p style="margin: 1px 0 0; font-size: 20px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.15; color: #ffffff;">{{ titulo || tipo.titulo }}</p>
      <p v-if="detalle || tipo.detalle" style="margin: 3px 0 0; font-size: 12px; font-weight: 600; line-height: 1.3; color: rgba(255,255,255,0.82);">{{ detalle || tipo.detalle }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TIPOS_COMPROBANTE } from './tiposComprobante'

const props = defineProps({
  /** Clave de TIPOS_COMPROBANTE: cuota, abonoPrestamo, prestamoPagado, prestamoNuevo, prestamoEstado, actividad, cierre, estado, retiro */
  clave: { type: String, required: true },
  /** Sustituye el título del tipo (p. ej. «Pago de 3 cuotas») */
  titulo: { type: String, default: '' },
  /** Sustituye la línea pequeña bajo el título */
  detalle: { type: String, default: '' }
})

const tipo = computed(() => TIPOS_COMPROBANTE[props.clave] || TIPOS_COMPROBANTE.cuota)
</script>

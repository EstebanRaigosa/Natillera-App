<template>
  <!--
    La figura de carga (alcancía dentro del anillo que gira) en tamaño de botón, para
    cualquier botón que espera una operación: es el estándar, en lugar de giros sueltos.
    El anillo usa `currentColor`: toma el color del texto del botón, así sirve sobre
    fondo verde, rojo o claro.

    · Con `texto`, la figura va acompañada («Iniciando sesión»).
    · Sin `texto`, es solo la figura: para botones que ya cambian su propio texto
      («Guardando…») o botones de solo icono.
    · `pequena` para botones de modal o compactos; sin ella, para los grandes de entrada.
  -->
  <span class="carga-boton" role="status" :aria-label="texto || 'Cargando'">
    <span :class="['carga-boton__figura', { 'carga-boton__figura--pequena': pequena }]" aria-hidden="true">
      <svg class="carga-boton__anillo" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="8" />
        <circle
          cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"
          pathLength="100" stroke-dasharray="28 72"
        />
      </svg>
      <EscenaAlcancia compacta class="carga-boton__alcancia" />
    </span>
    <span v-if="texto">{{ texto }}</span>
  </span>
</template>

<script setup>
import EscenaAlcancia from '../publico/EscenaAlcancia.vue'

defineProps({
  /** Qué está pasando, corto: «Iniciando sesión». */
  texto: { type: String, default: '' },
  /** Tamaño para botones de modal o compactos (1.5rem en vez de 2.125rem). */
  pequena: { type: Boolean, default: false }
})
</script>

<style scoped>
.carga-boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-weight: 700;
}

.carga-boton__figura {
  position: relative;
  width: 2.125rem;
  height: 2.125rem;
  flex-shrink: 0;
}

.carga-boton__figura--pequena {
  width: 1.5rem;
  height: 1.5rem;
}

.carga-boton__anillo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-animation: carga-boton-girar 1.2s linear infinite;
  animation: carga-boton-girar 1.2s linear infinite;
}

.carga-boton__alcancia {
  position: absolute;
  inset: 14%;
  width: 72%;
}

@-webkit-keyframes carga-boton-girar { from { -webkit-transform: translate3d(0, 0, 0) rotate(0deg); } to { -webkit-transform: translate3d(0, 0, 0) rotate(360deg); } }
@keyframes carga-boton-girar { from { transform: translate3d(0, 0, 0) rotate(0deg); } to { transform: translate3d(0, 0, 0) rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .carga-boton__anillo { -webkit-animation-duration: 3s; animation-duration: 3s; }
}
</style>

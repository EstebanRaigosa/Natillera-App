<template>
  <!--
    La figura de carga de la app: la alcancía dentro de un anillo que gira. Una sola, para
    que todas las esperas se vean igual (CargaCaja, el progreso al crear un socio…).
    El tamaño lo pone quien la usa (clases h-* w-*).
  -->
  <div class="figura-alcancia" aria-hidden="true">
    <svg class="figura-alcancia__anillo" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#1B5E37" stroke-opacity="0.12" stroke-width="5" />
      <circle
        cx="50" cy="50" r="46" fill="none" stroke="#1B5E37" stroke-width="5" stroke-linecap="round"
        pathLength="100" stroke-dasharray="26 74"
      />
    </svg>
    <EscenaAlcancia compacta class="figura-alcancia__alcancia" />
  </div>
</template>

<script setup>
import EscenaAlcancia from '../publico/EscenaAlcancia.vue'
</script>

<style scoped>
.figura-alcancia {
  position: relative;
  flex-shrink: 0;
}

.figura-alcancia__anillo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-animation: figura-alcancia-girar 1.2s linear infinite;
  animation: figura-alcancia-girar 1.2s linear infinite;
}

.figura-alcancia__alcancia {
  position: absolute;
  inset: 12%;
  width: 76%;
}

@-webkit-keyframes figura-alcancia-girar { to { -webkit-transform: translate3d(0, 0, 0) rotate(360deg); } }
@keyframes figura-alcancia-girar { from { transform: translate3d(0, 0, 0) rotate(0deg); } to { transform: translate3d(0, 0, 0) rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .figura-alcancia__anillo { -webkit-animation-duration: 3s; animation-duration: 3s; }
}
</style>

<template>
  <!--
    Pantalla de carga con la estética de la portada y el login: fondo verde noche con
    destellos y, al centro, la alcancía recibiendo una moneda dentro de un anillo que gira
    (el anillo es el indicador de progreso).

    Teleport a body: algunas vistas la montan dentro de contenedores con `transform`, que en
    iOS rompen `position: fixed`.
  -->
  <Teleport to="body">
    <Transition name="carga-fundido">
      <div
        v-if="visible"
        class="carga"
        role="status"
        aria-live="polite"
        :aria-label="texto"
        @touchmove.prevent
      >
        <DestellosFondo />

        <div class="carga__contenido">
          <div class="carga__figura" aria-hidden="true">
            <!-- Anillo que gira: pista tenue y un arco brillante -->
            <svg class="carga__anillo" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#9fd9b1" stroke-opacity="0.15" stroke-width="2" />
              <circle
                cx="50" cy="50" r="46" fill="none" stroke="#b9f0cc" stroke-width="3" stroke-linecap="round"
                pathLength="100" stroke-dasharray="26 74"
              />
            </svg>
            <EscenaAlcancia compacta class="carga__alcancia" />
          </div>

          <p class="carga__marca font-display">Natillerapp</p>
          <p class="carga__texto">{{ texto }}<span class="carga__puntos" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import DestellosFondo from '../publico/DestellosFondo.vue'
import EscenaAlcancia from '../publico/EscenaAlcancia.vue'

const props = defineProps({
  visible: { type: Boolean, default: true },
  text: { type: String, default: '' }
})

const texto = computed(() => props.text || 'Cargando')
</script>

<style scoped>
.carga {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  height: -webkit-fill-available;
  height: 100dvh;
  padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
  overflow: hidden;
  color: #fff;
  /* Mismo degradado del hero de la portada */
  background: linear-gradient(to bottom, #04110a 0%, #0b2a1a 55%, #1b5e37 100%);
  touch-action: none;
  overscroll-behavior: contain;
}

.carga__contenido {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
}

.carga__figura {
  position: relative;
  width: 11rem;
  height: 11rem;
}

/* Halo suave detrás, sin filter: blur (caro en Safari) */
.carga__figura::before {
  content: '';
  position: absolute;
  inset: -2.5rem;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(111, 207, 151, 0.28) 0%, rgba(111, 207, 151, 0) 65%);
}

.carga__anillo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-animation: carga-girar 1.4s linear infinite;
  animation: carga-girar 1.4s linear infinite;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.carga__alcancia {
  position: absolute;
  inset: 0.85rem;
  width: calc(100% - 1.7rem);
}

.carga__marca {
  margin: 1.75rem 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.carga__texto {
  margin: 0.35rem 0 0;
  max-width: 18rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.72);
}

.carga__puntos span {
  -webkit-animation: carga-punto 1.2s ease-in-out infinite;
  animation: carga-punto 1.2s ease-in-out infinite;
}
.carga__puntos span:nth-child(2) { -webkit-animation-delay: 0.2s; animation-delay: 0.2s; }
.carga__puntos span:nth-child(3) { -webkit-animation-delay: 0.4s; animation-delay: 0.4s; }

@-webkit-keyframes carga-girar { to { -webkit-transform: translate3d(0, 0, 0) rotate(360deg); } }
@keyframes carga-girar { to { transform: translate3d(0, 0, 0) rotate(360deg); } }
@-webkit-keyframes carga-punto { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
@keyframes carga-punto { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }

/* Al irse no captura toques mientras baja la opacidad (evita «clics muertos»). */
.carga-fundido-enter-active { transition: opacity 0.2s ease-out; }
.carga-fundido-leave-active { transition: opacity 0.4s ease-out; pointer-events: none; }
.carga-fundido-enter-from,
.carga-fundido-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .carga__anillo { -webkit-animation-duration: 3s; animation-duration: 3s; }
  .carga__puntos span { -webkit-animation: none; animation: none; opacity: 1; }
}
</style>

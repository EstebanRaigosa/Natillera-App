<template>
  <!--
    Caja de carga flotante (ver carga/CargaCaja.vue) con una figura propia para la rifa:
    los 100 números encendiéndose en cascada mientras se reparten al azar.
  -->
  <CargaCaja :visible="show" flotante :texto="titulo" :detalle="descripcion">
    <template #figura>
      <div class="gen-grilla mx-auto" aria-hidden="true">
        <span v-for="n in 100" :key="n" class="gen-celda" :style="{ '--i': n - 1 }"></span>
      </div>
    </template>
  </CargaCaja>
</template>

<script setup>
import CargaCaja from './carga/CargaCaja.vue'

defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: 'Un momento' },
  descripcion: { type: String, default: '' },
})
</script>

<style scoped>
.gen-grilla {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 3px;
  width: 100%;
  max-width: 15rem;
}

.gen-celda {
  aspect-ratio: 1 / 1;
  border-radius: 3px;
  background: #e2e8f0;
  /* La cascada recorre la cuadrícula y vuelve a empezar: la espera no tiene duración fija */
  -webkit-animation: gen-encender 1.8s ease-in-out infinite both;
  animation: gen-encender 1.8s ease-in-out infinite both;
  -webkit-animation-delay: calc(var(--i) * 14ms);
  animation-delay: calc(var(--i) * 14ms);
}

@-webkit-keyframes gen-encender {
  0%, 100% { background: #e2e8f0; -webkit-transform: scale(1); transform: scale(1); }
  35% { background: #1b5e37; -webkit-transform: scale(1.18); transform: scale(1.18); }
  70% { background: #86efac; -webkit-transform: scale(1); transform: scale(1); }
}
@keyframes gen-encender {
  0%, 100% { background: #e2e8f0; transform: scale(1); }
  35% { background: #1b5e37; transform: scale(1.18); }
  70% { background: #86efac; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .gen-celda {
    animation: none;
    background: #86efac;
  }
}
</style>

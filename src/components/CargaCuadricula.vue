<template>
  <!--
    Pantalla de espera con la cuadrícula animada. La usan el reparto de números de una rifa
    automática y el registro de un pago: operaciones cortas que tocan varias tablas y en las
    que dejar el formulario quieto parece que se colgó.
    Va en Teleport a body: dentro de la modal, un ancestro con transform rompería el fixed
    (manual iOS §6). No usa ModalWrapper porque no es un diálogo: no se cierra ni se toca,
    solo acompaña a una operación que ya está en marcha.
  -->
  <Teleport to="body">
    <Transition name="gen-fundido">
      <div
        v-if="show"
        class="gen-capa fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="status"
        aria-live="polite"
      >
        <div class="absolute inset-0 bg-[#C8D9C8]/80 backdrop-blur-[2px]"></div>
        <div class="relative w-full max-w-[19rem] rounded-2xl border border-gray-200/60 bg-white p-5 text-center shadow-2xl">
          <!-- El «cuadradillo»: los 100 números de la rifa encendiéndose en cascada -->
          <div class="gen-grilla mx-auto" aria-hidden="true">
            <span v-for="n in 100" :key="n" class="gen-celda" :style="{ '--i': n - 1 }"></span>
          </div>
          <p class="mt-4 font-display text-base font-bold text-gray-800">{{ titulo }}</p>
          <p v-if="descripcion" class="mt-1 text-xs text-gray-500">{{ descripcion }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: 'Un momento' },
  descripcion: { type: String, default: '' },
})
</script>

<style scoped>
.gen-capa {
  /* Nada que tocar mientras se reparte; además corta el pinch-zoom en iOS */
  touch-action: none;
}

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

.gen-fundido-enter-active,
.gen-fundido-leave-active {
  transition: opacity 0.2s ease;
}
.gen-fundido-enter-from,
.gen-fundido-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gen-celda {
    animation: none;
    background: #86efac;
  }
  .gen-fundido-enter-active,
  .gen-fundido-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>

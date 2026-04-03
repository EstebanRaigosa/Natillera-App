<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="loading-screen" role="status" aria-live="polite" aria-label="Cargando">
      <!-- Background -->
      <div class="loading-screen__bg" aria-hidden="true" />

      <!-- Content -->
      <div class="loading-screen__content">
        <!-- Mismo isotipo que en login (assets/logo_icon.png), un poco más grande aquí -->
        <div class="loading-screen__logo-wrap">
          <img
            :src="logoIconSrc"
            alt=""
            class="loading-screen__logo"
            width="168"
            height="168"
            decoding="async"
            draggable="false"
          />
        </div>

        <!-- Brand -->
        <div class="loading-screen__brand">
          <h1 class="loading-screen__title">
            <AppBrand class="text-white" />
          </h1>
          <p class="loading-screen__subtitle">Ahorro Comunitario</p>
        </div>

        <!-- Progress bar -->
        <div class="loading-screen__progress">
          <div class="loading-screen__progress-track">
            <div class="loading-screen__progress-bar" />
          </div>
        </div>

        <!-- Loading text -->
        <p class="loading-screen__text">
          {{ loadingText }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AppBrand from './AppBrand.vue'
import logoIconSrc from '../../assets/logo_icon.png'

const props = defineProps({
  visible: { type: Boolean, default: true },
  text: { type: String, default: '' }
})

const dotCount = ref(0)
let dotInterval = null

const loadingText = computed(() => {
  if (props.text) return props.text
  const dots = '.'.repeat(dotCount.value)
  return `Cargando${dots}`
})

onMounted(() => {
  dotInterval = setInterval(() => {
    dotCount.value = (dotCount.value + 1) % 4
  }, 500)
})

onUnmounted(() => {
  if (dotInterval) clearInterval(dotInterval)
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Safari/iOS: use dvh for real viewport height */
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  -webkit-overflow-scrolling: touch;
}

.loading-screen__bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    165deg,
    hsl(152 42% 10%) 0%,
    hsl(152 38% 16%) 40%,
    hsl(152 42% 12%) 70%,
    hsl(152 45% 9%) 100%
  );
}

.loading-screen__content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
  max-width: 320px;
  width: 100%;
  /* Safari flex centering fix */
  margin: 0 auto;
}

/* Isotipo girando rápido mientras carga (linear = constante) */
.loading-screen__logo-wrap {
  position: relative;
  width: min(44vw, 10.5rem);
  height: min(44vw, 10.5rem);
  min-width: 7.5rem;
  min-height: 7.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: loading-spin-fast 1.1s linear infinite;
  will-change: transform;
}

.loading-screen__logo {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 168px;
  max-height: 168px;
  margin: 0 auto;
  object-fit: contain;
  object-position: center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  pointer-events: none;
}

@keyframes loading-spin-fast {
  from {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  to {
    transform: translate3d(0, 0, 0) rotate(360deg);
  }
}

/* Brand text */
.loading-screen__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.loading-screen__title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.loading-screen__subtitle {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: hsla(152, 60%, 70%, 0.7);
}

/* Progress bar */
.loading-screen__progress {
  width: 100%;
  max-width: 200px;
}

.loading-screen__progress-track {
  width: 100%;
  height: 3px;
  border-radius: 9999px;
  background: hsla(152, 40%, 30%, 0.3);
  overflow: hidden;
}

.loading-screen__progress-bar {
  width: 40%;
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, hsl(152, 69%, 45%), hsl(152, 69%, 55%));
  animation: loading-progress 1.8s ease-in-out infinite;
}

/* Loading text */
.loading-screen__text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsla(152, 40%, 80%, 0.6);
  letter-spacing: 0.02em;
  min-width: 100px;
  font-family: var(--font-sans, system-ui, sans-serif);
}

/* Animations */
@keyframes loading-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(150%); }
  100% { transform: translateX(150%); }
}

/* Fade out transition */
.loading-fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.loading-fade-leave-to {
  opacity: 0;
}

/* iOS Safari: cubrir viewport real incluyendo safe areas (notch / home indicator) */
@supports (-webkit-touch-callout: none) {
  .loading-screen {
    min-height: 100vh;
    min-height: 100dvh;
    height: 100vh;
    height: 100dvh;
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

/* Reduce animations for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .loading-screen__logo-wrap {
    animation: none;
    will-change: auto;
  }

  .loading-screen__progress-bar {
    animation: none;
    width: 60%;
  }
}
</style>
